#!/usr/bin/env python3
"""Loopback-only ASE/MACE relaxation service for Crystal Lab.

It intentionally has no filesystem, shell, model-path, or network API.  Model
weights are managed by MACE in the user's external cache and imported data is
kept in a temporary file only long enough for ASE to parse it.
"""

from __future__ import annotations

import argparse
import hashlib
import importlib.metadata
import json
import math
import re
import tempfile
import threading
import time
import uuid
from copy import deepcopy
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Callable

import numpy as np
from ase import Atoms
from ase.data import chemical_symbols
from ase.geometry import find_mic
from ase.io import read as ase_read
from ase.optimize import BFGS


MAX_ATOMS = 512
MAX_JSON_BYTES = 2 * 1024 * 1024
MAX_COMPLETED_JOBS = 8
OVERLAP_DISTANCE = 0.50
EV_PER_ANGSTROM3_TO_GPA = 160.21766208
VALID_ELEMENTS = frozenset(chemical_symbols[1:])
ALLOWED_ORIGINS = frozenset({"http://127.0.0.1:8080", "http://localhost:8080"})
ID_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.:-]{0,99}$")


class ValidationError(ValueError):
    """A safe client-facing input error."""


class CancelledRelaxation(Exception):
    """Internal optimizer interruption; never leaked as a traceback."""


def _require_object(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ValidationError(f"{label} must be an object")
    return value


def _finite_vector(value: Any, label: str) -> list[float]:
    if not isinstance(value, list) or len(value) != 3:
        raise ValidationError(f"{label} must contain three numbers")
    if any(isinstance(item, bool) or not isinstance(item, (int, float)) or not math.isfinite(item) for item in value):
        raise ValidationError(f"{label} must contain finite numbers")
    return [float(item) for item in value]


def _minimum_distance(positions: np.ndarray, cell: np.ndarray, pbc: np.ndarray) -> float:
    indices = np.triu_indices(len(positions), k=1)
    displacements = positions[indices[1]] - positions[indices[0]]
    # ASE applies a reduced-cell MIC, so arbitrary whole-cell translations
    # and skewed cells cannot evade the overlap guard. Batched pairs keep the
    # 512-atom validation path responsive.
    _, distances = find_mic(displacements, cell=cell, pbc=pbc)
    return float(np.min(distances))


def validate_structure(value: Any, supported_elements: frozenset[str] = VALID_ELEMENTS) -> dict[str, Any]:
    """Validate and normalize the public row-vector Å structure schema."""
    structure = _require_object(value, "structure")
    if set(structure) != {"cell", "pbc", "atoms"}:
        raise ValidationError("structure must contain only cell, pbc, and atoms")
    cell_data = structure["cell"]
    if not isinstance(cell_data, list) or len(cell_data) != 3:
        raise ValidationError("cell must contain three row vectors")
    cell = np.array([_finite_vector(row, "cell row") for row in cell_data], dtype=float)
    row_lengths = np.linalg.norm(cell, axis=1)
    determinant = float(np.linalg.det(cell))
    if not math.isfinite(determinant) or abs(determinant) < 1e-10:
        raise ValidationError("cell must be nondegenerate")
    if determinant < 0:
        raise ValidationError("cell must be right-handed")
    reciprocal_lengths = np.linalg.norm(np.linalg.inv(cell), axis=0)
    if np.any(row_lengths < 1) or np.any(row_lengths > 200) or np.any(reciprocal_lengths > 2) or np.any(row_lengths * reciprocal_lengths > 10):
        raise ValidationError("cell must be nondegenerate and within editor bounds")
    pbc = structure["pbc"]
    if not isinstance(pbc, list) or len(pbc) != 3 or any(type(item) is not bool for item in pbc):
        raise ValidationError("pbc must contain three booleans")
    atoms_data = structure["atoms"]
    if not isinstance(atoms_data, list) or not 1 <= len(atoms_data) <= MAX_ATOMS:
        raise ValidationError(f"atoms must contain 1 to {MAX_ATOMS} entries")
    normalized_atoms: list[dict[str, Any]] = []
    ids: set[str] = set()
    for index, atom_value in enumerate(atoms_data):
        atom = _require_object(atom_value, f"atom {index}")
        if set(atom) != {"id", "element", "position", "site"}:
            raise ValidationError(f"atom {index} must contain only id, element, position, and site")
        atom_id = atom["id"]
        if not isinstance(atom_id, str) or not ID_PATTERN.fullmatch(atom_id) or atom_id in ids:
            raise ValidationError("atom ids must be unique safe strings")
        ids.add(atom_id)
        element = atom["element"]
        if not isinstance(element, str) or element not in supported_elements:
            raise ValidationError(f"unsupported element: {element}")
        site = atom["site"]
        if not isinstance(site, str) or len(site) > 100:
            raise ValidationError("atom site must be a string up to 100 characters")
        position = _finite_vector(atom["position"], f"atom {index} position")
        if any(abs(component) > 10000 for component in position):
            raise ValidationError("atom positions are outside permitted bounds")
        normalized_atoms.append({"id": atom_id, "element": element, "position": position, "site": site})
    positions = np.array([atom["position"] for atom in normalized_atoms], dtype=float)
    if len(positions) > 1 and _minimum_distance(positions, cell, np.array(pbc, dtype=bool)) < OVERLAP_DISTANCE:
        raise ValidationError("atoms overlap within 0.50 angstrom")
    return {"cell": cell.tolist(), "pbc": list(pbc), "atoms": normalized_atoms}


def validate_settings(value: Any) -> dict[str, Any]:
    settings = _require_object(value, "settings")
    required = {"fmax", "maxSteps", "relaxCell", "pressureGPa"}
    if set(settings) != required:
        raise ValidationError("settings must contain fmax, maxSteps, relaxCell, and pressureGPa")
    fmax = settings["fmax"]
    max_steps = settings["maxSteps"]
    pressure = settings["pressureGPa"]
    if isinstance(fmax, bool) or not isinstance(fmax, (int, float)) or not math.isfinite(fmax) or not 0.001 <= fmax <= 0.5:
        raise ValidationError("fmax must be between 0.001 and 0.5 eV/angstrom")
    if isinstance(max_steps, bool) or not isinstance(max_steps, int) or not 1 <= max_steps <= 500:
        raise ValidationError("maxSteps must be an integer from 1 to 500")
    if type(settings["relaxCell"]) is not bool:
        raise ValidationError("relaxCell must be boolean")
    if isinstance(pressure, bool) or not isinstance(pressure, (int, float)) or not math.isfinite(pressure) or not -100 <= pressure <= 100:
        raise ValidationError("pressureGPa must be finite and between -100 and 100")
    return {"fmax": float(fmax), "maxSteps": max_steps, "relaxCell": settings["relaxCell"], "pressureGPa": float(pressure)}


def validate_relax_request(value: Any, supported_elements: frozenset[str] = VALID_ELEMENTS) -> tuple[dict[str, Any], dict[str, Any]]:
    request = _require_object(value, "request")
    if set(request) != {"structure", "settings"}:
        raise ValidationError("request must contain only structure and settings")
    structure = validate_structure(request["structure"], supported_elements)
    settings = validate_settings(request["settings"])
    if settings["relaxCell"] and not all(structure["pbc"]):
        raise ValidationError("relaxCell requires periodic boundary conditions in all three directions")
    return structure, settings


def make_structure(atoms: Atoms, ids: list[str] | None = None, sites: list[str] | None = None, supported_elements: frozenset[str] = VALID_ELEMENTS) -> dict[str, Any]:
    symbols = atoms.get_chemical_symbols()
    ids = ids or [f"{symbol}-{index + 1}" for index, symbol in enumerate(symbols)]
    sites = sites or ["imported"] * len(symbols)
    structure = {
        "cell": atoms.cell.array.astype(float).tolist(),
        "pbc": [bool(item) for item in atoms.pbc],
        "atoms": [
            {"id": atom_id, "element": symbol, "position": [float(component) for component in position], "site": site}
            for atom_id, symbol, position, site in zip(ids, symbols, atoms.get_positions(), sites, strict=True)
        ],
    }
    return validate_structure(structure, supported_elements)


def to_ase(structure: dict[str, Any]) -> Atoms:
    return Atoms(
        symbols=[atom["element"] for atom in structure["atoms"]],
        positions=[atom["position"] for atom in structure["atoms"]],
        cell=structure["cell"],
        pbc=structure["pbc"],
    )


def parse_import(format_name: Any, text: Any) -> dict[str, Any]:
    formats = {"cif": "cif", "vasp": "vasp", "extxyz": "extxyz"}
    if format_name not in formats:
        raise ValidationError("format must be cif, vasp, or extxyz")
    if not isinstance(text, str) or not text.strip():
        raise ValidationError("text must be a nonempty string")
    if len(text.encode("utf-8")) > MAX_JSON_BYTES:
        raise ValidationError("import text exceeds 2 MiB limit")
    suffix = {"cif": ".cif", "vasp": ".vasp", "extxyz": ".extxyz"}[format_name]
    try:
        with tempfile.NamedTemporaryFile(mode="w", suffix=suffix, encoding="utf-8", delete=False) as temporary:
            temporary.write(text)
            path = Path(temporary.name)
        try:
            atoms = ase_read(path, format=formats[format_name])
        finally:
            path.unlink(missing_ok=True)
        if format_name == "cif":
            occupancy = atoms.info.get("occupancy")
            if occupancy and (
                not isinstance(occupancy, dict)
                or any(
                    not isinstance(site, dict)
                    or len(site) != 1
                    or any(not isinstance(value, (int, float)) or abs(float(value) - 1.0) > 1e-8 for value in site.values())
                    for site in occupancy.values()
                )
            ):
                raise ValidationError("disordered or partial-occupancy CIF is unsupported; import an explicit ordered supercell")
        return make_structure(atoms)
    except ValidationError:
        raise
    except Exception as error:
        raise ValidationError(f"ASE could not parse {format_name} data") from error


def _force_magnitude(atoms: Atoms) -> float:
    forces = atoms.get_forces()
    if not np.all(np.isfinite(forces)):
        raise RuntimeError("calculator returned non-finite forces")
    return float(np.max(np.linalg.norm(forces, axis=1))) if len(forces) else 0.0


class MaceMPAFactory:
    """Lazily load the real MACE-MPA-0 model without a toy fallback."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._calculator: Any | None = None
        self._error: str | None = None
        self._ready = False
        self._supported_elements: frozenset[str] | None = None
        self._model = {"name": "MACE-MPA-0", "version": "loading", "device": "cpu", "dtype": "float64", "sha256": "loading"}

    def preload(self) -> None:
        thread = threading.Thread(target=self._load, name="mace-model-loader", daemon=True)
        thread.start()

    def _load(self) -> None:
        with self._lock:
            if self._calculator is not None or self._error is not None:
                return
            try:
                import torch
                from mace.calculators import mace_mp

                # CPU float64 is the reliable MACE path on Apple Silicon for this preview.
                torch.set_num_threads(4)
                self._model["version"] = importlib.metadata.version("mace-torch")
                self._calculator = mace_mp(model="medium-mpa-0", device="cpu", default_dtype="float64")
                atomic_numbers = [int(number) for number in self._calculator.z_table.zs]
                self._supported_elements = frozenset(chemical_symbols[number] for number in atomic_numbers if number in range(1, len(chemical_symbols)))
                if not self._supported_elements:
                    raise RuntimeError("loaded MACE calculator has no supported elements")
                self._model["sha256"] = self._loaded_weights_hash()
                self._ready = True
            except Exception as error:
                self._error = f"MACE-MPA-0 failed to load: {type(error).__name__}"

    def _loaded_weights_hash(self) -> str:
        """Hash actual loaded parameters deterministically, never a cache-file guess."""

        models = getattr(self._calculator, "models", ())
        if not models:
            raise RuntimeError("loaded MACE calculator has no model weights")
        digest = hashlib.sha256()
        for name, tensor in sorted(models[0].state_dict().items()):
            contiguous = tensor.detach().cpu().contiguous()
            digest.update(name.encode("utf-8"))
            digest.update(str(contiguous.dtype).encode("ascii"))
            digest.update(json.dumps(list(contiguous.shape), separators=(",", ":")).encode("ascii"))
            digest.update(contiguous.numpy().tobytes())
        return digest.hexdigest()

    def __call__(self) -> Any:
        self._load()
        if self._error:
            raise RuntimeError(self._error)
        if self._calculator is None:
            raise RuntimeError("MACE-MPA-0 is still loading")
        return self._calculator

    def health(self) -> tuple[str, dict[str, str], str | None]:
        if self._error:
            return "error", dict(self._model), self._error
        if not self._ready:
            return "loading", dict(self._model), None
        return "ready", dict(self._model), None

    def supported_elements(self) -> frozenset[str]:
        return self._supported_elements if self._ready and self._supported_elements else frozenset()


class JobManager:
    def __init__(self, calculator_factory: Callable[[], Any] | None = None) -> None:
        self.calculator_factory: Callable[[], Any] = calculator_factory or MaceMPAFactory()
        self._jobs: dict[str, dict[str, Any]] = {}
        self._lock = threading.Lock()
        self._active_job: str | None = None

    def health(self) -> tuple[str, dict[str, str], str | None]:
        if hasattr(self.calculator_factory, "health"):
            return self.calculator_factory.health()  # type: ignore[no-any-return]
        return "ready", {"name": "test-calculator", "version": "test", "device": "cpu", "dtype": "float64", "sha256": "test"}, None

    def supported_elements(self) -> frozenset[str]:
        if hasattr(self.calculator_factory, "supported_elements"):
            return self.calculator_factory.supported_elements()  # type: ignore[no-any-return]
        return VALID_ELEMENTS

    def preload(self) -> None:
        if hasattr(self.calculator_factory, "preload"):
            self.calculator_factory.preload()

    def submit(self, structure: Any, settings: Any) -> str:
        allowed_elements = self.supported_elements()
        if not allowed_elements:
            status, _, message = self.health()
            if status == "error":
                raise RuntimeError(message or "MACE-MPA-0 is unavailable")
            raise RuntimeError("MACE-MPA-0 is still loading")
        structure, settings = validate_relax_request({"structure": structure, "settings": settings}, allowed_elements)
        with self._lock:
            if self._active_job is not None:
                raise RuntimeError("another relaxation job is already running")
            job_id = uuid.uuid4().hex
            self._jobs[job_id] = {
                "id": job_id, "status": "queued", "step": 0, "maxForce": None, "energy": None,
                "elapsedSeconds": 0.0, "message": None, "result": None, "cancel": False,
                "structure": structure, "settings": settings, "started": None,
            }
            self._active_job = job_id
        threading.Thread(target=self._run, args=(job_id,), name=f"crystal-relax-{job_id[:8]}", daemon=True).start()
        return job_id

    def get(self, job_id: str) -> dict[str, Any] | None:
        with self._lock:
            job = self._jobs.get(job_id)
            if job is None:
                return None
            return {key: deepcopy(value) for key, value in job.items() if key not in {"cancel", "structure", "settings", "started"}}

    def cancel(self, job_id: str) -> bool:
        with self._lock:
            job = self._jobs.get(job_id)
            if job is None or job["status"] in {"completed", "cancelled", "error"}:
                return False
            job["cancel"] = True
            return True

    def _cancelled(self, job_id: str) -> bool:
        with self._lock:
            return bool(self._jobs[job_id]["cancel"])

    def _update(self, job_id: str, **values: Any) -> None:
        with self._lock:
            self._jobs[job_id].update(values)

    def _run(self, job_id: str) -> None:
        started = time.monotonic()
        try:
            with self._lock:
                job = self._jobs[job_id]
                job["status"] = "running"
                job["started"] = started
                structure = deepcopy(job["structure"])
                settings = deepcopy(job["settings"])
            if self._cancelled(job_id):
                raise CancelledRelaxation()
            atoms = to_ase(structure)
            atoms.calc = self.calculator_factory()
            ids = [atom["id"] for atom in structure["atoms"]]
            sites = [atom["site"] for atom in structure["atoms"]]
            initial_energy = float(atoms.get_potential_energy())
            initial_force = _force_magnitude(atoms)
            frames: list[dict[str, Any]] = []
            sample_interval = max(1, math.ceil(settings["maxSteps"] / 499))
            optimizer: Any | None = None

            def record_frame(force: bool = False) -> None:
                if self._cancelled(job_id):
                    raise CancelledRelaxation()
                step = optimizer.nsteps if optimizer is not None else 0
                if not force and step % sample_interval:
                    return
                if frames and frames[-1]["step"] == step:
                    return
                energy = float(atoms.get_potential_energy())
                force = _force_magnitude(atoms)
                if not math.isfinite(energy):
                    raise RuntimeError("calculator returned non-finite energy")
                frame = {
                    "step": step, "positions": atoms.get_positions().astype(float).tolist(),
                    "cell": atoms.cell.array.astype(float).tolist(), "energy": energy, "maxForce": force,
                }
                frames.append(frame)
                self._update(job_id, step=frame["step"], energy=energy, maxForce=force, elapsedSeconds=time.monotonic() - started)

            record_frame()
            optimizer_target: Any = atoms
            if settings["relaxCell"]:
                from ase.filters import FrechetCellFilter

                optimizer_target = FrechetCellFilter(atoms, scalar_pressure=settings["pressureGPa"] / EV_PER_ANGSTROM3_TO_GPA)
            optimizer = BFGS(optimizer_target, logfile=None)
            optimizer.attach(record_frame, interval=1)
            converged = bool(optimizer.run(fmax=settings["fmax"], steps=settings["maxSteps"]))
            if not frames or frames[-1]["positions"] != atoms.get_positions().astype(float).tolist():
                record_frame(force=True)
            final = make_structure(atoms, ids, sites)
            final_energy = float(atoms.get_potential_energy())
            final_force = _force_magnitude(atoms)
            stress = (atoms.get_stress(voigt=True) * EV_PER_ANGSTROM3_TO_GPA).astype(float).tolist()
            if not np.all(np.isfinite(stress)):
                raise RuntimeError("calculator returned non-finite stress")
            _, model, _ = self.health()
            result = {
                "initial": structure, "final": final, "frames": frames, "converged": converged,
                "steps": optimizer.nsteps, "maxForce": final_force,
                "energyInitial": initial_energy, "energyFinal": final_energy, "stressGPa": stress,
                "elapsedSeconds": time.monotonic() - started, "model": model, "settings": settings,
                "units": {"length": "angstrom", "energy": "eV", "force": "eV/angstrom", "stress": "GPa"},
            }
            self._update(job_id, status="completed", result=result, step=result["steps"], energy=final_energy, maxForce=final_force, elapsedSeconds=result["elapsedSeconds"])
        except CancelledRelaxation:
            self._update(job_id, status="cancelled", message="Relaxation cancelled", elapsedSeconds=time.monotonic() - started)
        except Exception as error:
            self._update(job_id, status="error", message=f"Relaxation failed: {type(error).__name__}", elapsedSeconds=time.monotonic() - started)
        finally:
            with self._lock:
                self._active_job = None
                completed = [job for job in self._jobs.values() if job["status"] in {"completed", "cancelled", "error"}]
                completed.sort(key=lambda item: item["started"] or 0, reverse=True)
                for job in completed[MAX_COMPLETED_JOBS:]:
                    self._jobs.pop(job["id"], None)


class EngineServer(ThreadingHTTPServer):
    allow_reuse_address = True

    def __init__(self, server_address: tuple[str, int], calculator_factory: Callable[[], Any] | None = None, origins: set[str] | None = None):
        host, _ = server_address
        if host != "127.0.0.1":
            raise ValueError("Crystal engine may bind only to loopback")
        self.jobs = JobManager(calculator_factory)
        self.origins = set(ALLOWED_ORIGINS) | set(origins or ())
        super().__init__(server_address, EngineRequestHandler)
        self.jobs.preload()


class EngineRequestHandler(BaseHTTPRequestHandler):
    server: EngineServer
    protocol_version = "HTTP/1.1"

    def log_message(self, format: str, *args: Any) -> None:
        return

    def _host_allowed(self) -> bool:
        host = self.headers.get("Host", "").split(":", 1)[0].lower()
        return host in {"127.0.0.1", "localhost", "[::1]"}

    def _origin_allowed(self) -> bool:
        origin = self.headers.get("Origin")
        return origin is None or origin in self.server.origins

    def _respond(self, status: int, value: dict[str, Any]) -> None:
        body = json.dumps(value, allow_nan=False, separators=(",", ":")).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self._cors_headers()
        self.end_headers()
        self.wfile.write(body)

    def _cors_headers(self) -> None:
        origin = self.headers.get("Origin")
        if origin in self.server.origins:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")

    def _guard(self, mutation: bool = False) -> bool:
        if not self._host_allowed():
            self.close_connection = True
            self._respond(HTTPStatus.FORBIDDEN, {"error": "Host is not permitted"})
            return False
        if not self._origin_allowed():
            self.close_connection = True
            self._respond(HTTPStatus.FORBIDDEN, {"error": "Origin is not permitted"})
            return False
        if mutation and self.headers.get("Content-Type", "").split(";", 1)[0].lower() != "application/json":
            self.close_connection = True
            self._respond(HTTPStatus.UNSUPPORTED_MEDIA_TYPE, {"error": "Content-Type must be application/json"})
            return False
        return True

    def _read_json(self) -> Any:
        raw_length = self.headers.get("Content-Length")
        if raw_length is None:
            raise ValidationError("Content-Length is required")
        try:
            length = int(raw_length)
        except ValueError as error:
            raise ValidationError("invalid Content-Length") from error
        if length < 0 or length > MAX_JSON_BYTES:
            self.close_connection = True
            raise ValidationError("JSON body exceeds 2 MiB limit")
        try:
            return json.loads(self.rfile.read(length))
        except (UnicodeDecodeError, json.JSONDecodeError) as error:
            raise ValidationError("body must be valid JSON") from error

    def do_GET(self) -> None:
        if not self._guard():
            return
        if self.path == "/v1/health":
            status, model, message = self.server.jobs.health()
            payload: dict[str, Any] = {"status": status, "model": model, "supportedElements": sorted(self.server.jobs.supported_elements())}
            if message:
                payload["message"] = message
            self._respond(HTTPStatus.OK, payload)
            return
        match = re.fullmatch(r"/v1/jobs/([a-f0-9]{32})", self.path)
        if match:
            job = self.server.jobs.get(match.group(1))
            if job is None:
                self._respond(HTTPStatus.NOT_FOUND, {"error": "job not found"})
            else:
                self._respond(HTTPStatus.OK, job)
            return
        self._respond(HTTPStatus.NOT_FOUND, {"error": "route not found"})

    def do_POST(self) -> None:
        if not self._guard(mutation=True):
            return
        try:
            body = self._read_json()
            if self.path == "/v1/relax":
                structure, settings = validate_relax_request(body)
                job_id = self.server.jobs.submit(structure, settings)
                self._respond(HTTPStatus.ACCEPTED, {"id": job_id})
                return
            if self.path == "/v1/import":
                request = _require_object(body, "request")
                if set(request) != {"format", "text"}:
                    raise ValidationError("request must contain only format and text")
                self._respond(HTTPStatus.OK, {"structure": parse_import(request["format"], request["text"])})
                return
            self._respond(HTTPStatus.NOT_FOUND, {"error": "route not found"})
        except ValidationError as error:
            self._respond(HTTPStatus.BAD_REQUEST, {"error": str(error)})
        except RuntimeError as error:
            self._respond(HTTPStatus.CONFLICT, {"error": str(error)})
        except Exception:
            self._respond(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": "internal server error"})

    def do_DELETE(self) -> None:
        if not self._guard(mutation=True):
            return
        try:
            if self._read_json() != {}:
                raise ValidationError("DELETE body must be an empty JSON object")
            match = re.fullmatch(r"/v1/jobs/([a-f0-9]{32})", self.path)
            if not match:
                self._respond(HTTPStatus.NOT_FOUND, {"error": "route not found"})
                return
            if not self.server.jobs.cancel(match.group(1)):
                self._respond(HTTPStatus.NOT_FOUND, {"error": "active job not found"})
                return
            self._respond(HTTPStatus.OK, {"id": match.group(1), "status": "cancelling"})
        except ValidationError as error:
            self._respond(HTTPStatus.BAD_REQUEST, {"error": str(error)})

    def do_OPTIONS(self) -> None:
        if not self._guard():
            return
        requested_method = self.headers.get("Access-Control-Request-Method", "")
        if requested_method not in {"POST", "DELETE"}:
            self._respond(HTTPStatus.METHOD_NOT_ALLOWED, {"error": "method is not permitted"})
            return
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_header("Content-Length", "0")
        self.send_header("Cache-Control", "no-store")
        self._cors_headers()
        self.send_header("Access-Control-Allow-Methods", "POST, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Max-Age", "600")
        self.end_headers()


def main() -> None:
    parser = argparse.ArgumentParser(description="Crystal Lab loopback ASE/MACE engine")
    parser.add_argument("--host", default="127.0.0.1", choices=("127.0.0.1",))
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--allow-origin", action="append", default=[], help="Additional exact Origin allowed for a local preview")
    arguments = parser.parse_args()
    if not 1 <= arguments.port <= 65535:
        parser.error("--port must be 1..65535")
    server = EngineServer((arguments.host, arguments.port), origins=set(arguments.allow_origin))
    print(f"Crystal engine listening on http://{arguments.host}:{arguments.port}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

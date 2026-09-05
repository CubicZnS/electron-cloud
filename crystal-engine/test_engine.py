import http.client
import json
import math
import os
import threading
import time
import unittest

import numpy as np
from ase.calculators.calculator import Calculator, all_changes

from server import (
    EngineServer,
    JobManager,
    ValidationError,
    make_structure,
    parse_import,
    validate_relax_request,
    validate_structure,
)


class HarmonicCalculator(Calculator):
    """Fast deterministic calculator used only to exercise the ASE job path."""

    implemented_properties = ["energy", "forces", "stress"]

    def calculate(self, atoms=None, properties=None, system_changes=all_changes):
        super().calculate(atoms, properties, system_changes)
        positions = atoms.get_positions()
        if not hasattr(self, "centers"):
            self.centers = positions - 0.2
        displacement = positions - self.centers
        self.results["energy"] = float((displacement * displacement).sum())
        self.results["forces"] = -2.0 * displacement
        self.results["stress"] = np.zeros(6)


def sample_structure():
    return {
        "cell": [[3.0, 0.0, 0.0], [0.0, 3.0, 0.0], [0.0, 0.0, 3.0]],
        "pbc": [True, True, True],
        "atoms": [
            {"id": "A-0", "element": "Ni", "position": [0.5, 0.5, 0.5], "site": "A"},
            {"id": "B-0", "element": "Co", "position": [1.5, 1.5, 1.5], "site": "B"},
        ],
    }


def doped_b2_3x3x3():
    a = 2.88
    atoms = []
    for i in range(3):
        for j in range(3):
            for k in range(3):
                index = i * 9 + j * 3 + k
                element = "Co" if index == 0 else "Ni"
                position = [i * a, j * a, k * a]
                if index == 0:
                    position[0] += 0.08
                atoms.extend([
                    {"id": f"A-{index}", "element": element, "position": position, "site": "A"},
                    {"id": f"B-{index}", "element": "Al", "position": [(i + 0.5) * a, (j + 0.5) * a, (k + 0.5) * a], "site": "B"},
                ])
    return {"cell": [[3 * a, 0, 0], [0, 3 * a, 0], [0, 0, 3 * a]], "pbc": [True, True, True], "atoms": atoms}


class StructureValidationTests(unittest.TestCase):
    def test_accepts_valid_structure_and_preserves_atom_metadata(self):
        structure = validate_structure(sample_structure())
        self.assertEqual(structure["atoms"][1]["id"], "B-0")

    def test_rejects_degenerate_cell(self):
        structure = sample_structure()
        structure["cell"][2] = [0.0, 0.0, 0.0]
        with self.assertRaisesRegex(ValidationError, "nondegenerate"):
            validate_structure(structure)

    def test_rejects_duplicate_ids_nonfinite_positions_overlaps_and_unknown_symbols(self):
        cases = []
        duplicate = sample_structure()
        duplicate["atoms"][1]["id"] = "A-0"
        cases.append((duplicate, "unique"))
        nonfinite = sample_structure()
        nonfinite["atoms"][1]["position"][0] = math.nan
        cases.append((nonfinite, "finite"))
        overlap = sample_structure()
        overlap["atoms"][1]["position"] = [0.5, 0.5, 0.5]
        cases.append((overlap, "overlap"))
        unknown = sample_structure()
        unknown["atoms"][1]["element"] = "Xx"
        cases.append((unknown, "unsupported"))
        for structure, message in cases:
            with self.subTest(message=message):
                with self.assertRaisesRegex(ValidationError, message):
                    validate_structure(structure)

    def test_rejects_periodic_overlap_separated_by_multiple_cell_vectors(self):
        structure = sample_structure()
        structure["cell"] = [[10.0, 0.0, 0.0], [3.0, 9.0, 0.0], [1.0, 2.0, 8.0]]
        structure["atoms"][0]["position"] = [0.0, 0.0, 0.0]
        structure["atoms"][1]["position"] = [30.0, 0.0, 0.0]
        with self.assertRaisesRegex(ValidationError, "overlap"):
            validate_structure(structure)

    def test_rejects_more_than_512_atoms_and_invalid_settings(self):
        structure = sample_structure()
        structure["atoms"] = [
            {"id": str(index), "element": "H", "position": [index % 8 * 0.3, (index // 8) % 8 * 0.3, index // 64 * 0.3], "site": ""}
            for index in range(513)
        ]
        with self.assertRaisesRegex(ValidationError, "512"):
            validate_structure(structure)
        with self.assertRaisesRegex(ValidationError, "fmax"):
            validate_relax_request({"structure": sample_structure(), "settings": {"fmax": 0}})

    def test_matches_editor_bounds_for_cell_handedness_ids_sites_and_overlap(self):
        left_handed = sample_structure()
        left_handed["cell"][2] = [0.0, 0.0, -3.0]
        with self.assertRaisesRegex(ValidationError, "right-handed"):
            validate_structure(left_handed)
        long_id = sample_structure()
        long_id["atoms"][0]["id"] = "A" * 101
        with self.assertRaisesRegex(ValidationError, "unique safe"):
            validate_structure(long_id)
        long_site = sample_structure()
        long_site["atoms"][0]["site"] = "A" * 101
        with self.assertRaisesRegex(ValidationError, "100"):
            validate_structure(long_site)
        near = sample_structure()
        near["atoms"][1]["position"] = [0.9, 0.5, 0.5]
        with self.assertRaisesRegex(ValidationError, "0.50"):
            validate_structure(near)
        with self.assertRaisesRegex(ValidationError, "maxSteps"):
            validate_relax_request({"structure": sample_structure(), "settings": {"fmax": 0.03, "maxSteps": 501, "relaxCell": False, "pressureGPa": 0}})
        partial = sample_structure()
        partial["pbc"] = [True, True, False]
        with self.assertRaisesRegex(ValidationError, "all three directions"):
            validate_relax_request({"structure": partial, "settings": {"fmax": 0.03, "maxSteps": 100, "relaxCell": True, "pressureGPa": 0}})

    def test_accepts_editor_permitted_anisotropic_cell_and_validates_512_atoms_promptly(self):
        anisotropic = sample_structure()
        anisotropic["cell"] = [[8.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 8.0]]
        anisotropic["atoms"][1]["position"] = [1.5, 0.5, 1.5]
        validate_structure(anisotropic)
        atoms = [
            {"id": f"H-{index}", "element": "H", "position": [index % 8 + 0.25, (index // 8) % 8 + 0.25, index // 64 + 0.25], "site": "imported"}
            for index in range(512)
        ]
        started = time.monotonic()
        validate_structure({"cell": [[8.0, 0, 0], [0, 8.0, 0], [0, 0, 8.0]], "pbc": [True, True, True], "atoms": atoms})
        self.assertLess(time.monotonic() - started, 15)


class ImportTests(unittest.TestCase):
    def test_imports_extxyz_through_ase_with_stable_generated_ids(self):
        structure = parse_import("extxyz", "2\nLattice=\"3 0 0 0 3 0 0 0 3\" Properties=species:S:1:pos:R:3 pbc=\"T T T\"\nNi 0 0 0\nAl 1.5 1.5 1.5\n")
        self.assertEqual([atom["element"] for atom in structure["atoms"]], ["Ni", "Al"])
        self.assertEqual(structure["pbc"], [True, True, True])
        self.assertEqual(len({atom["id"] for atom in structure["atoms"]}), 2)

    def test_import_keeps_a_valid_element_editable_before_model_support_is_known(self):
        structure = parse_import("extxyz", "1\nLattice=\"3 0 0 0 3 0 0 0 3\" Properties=species:S:1:pos:R:3 pbc=\"T T T\"\nXe 0 0 0\n")
        self.assertEqual(structure["atoms"][0]["element"], "Xe")

    def test_rejects_unsupported_import_format(self):
        with self.assertRaisesRegex(ValidationError, "format"):
            parse_import("xyz", "1\n\nH 0 0 0\n")

    def test_rejects_disordered_cif_instead_of_silently_selecting_one_species(self):
        cif = """data_disordered
_cell_length_a 3
_cell_length_b 3
_cell_length_c 3
_cell_angle_alpha 90
_cell_angle_beta 90
_cell_angle_gamma 90
loop_
_atom_site_label
_atom_site_type_symbol
_atom_site_fract_x
_atom_site_fract_y
_atom_site_fract_z
_atom_site_occupancy
Fe1 Fe 0 0 0 0.5
Mn1 Mn 0 0 0 0.5
"""
        with self.assertRaisesRegex(ValidationError, "ordered supercell"):
            parse_import("cif", cif)


class JobTests(unittest.TestCase):
    def test_real_ase_optimization_returns_finite_result_and_preserves_ids(self):
        manager = JobManager(calculator_factory=lambda: HarmonicCalculator())
        structure = sample_structure()
        structure["atoms"][0]["position"] = [0.2, 0.2, 0.2]
        job_id = manager.submit(structure, {"fmax": 0.03, "maxSteps": 30, "relaxCell": False, "pressureGPa": 0})
        result = wait_for_completion(manager, job_id)
        self.assertEqual(result["status"], "completed")
        payload = result["result"]
        self.assertTrue(math.isfinite(payload["energyFinal"]))
        self.assertLessEqual(payload["energyFinal"], payload["energyInitial"])
        self.assertEqual([atom["id"] for atom in payload["final"]["atoms"]], ["A-0", "B-0"])
        self.assertEqual(payload["units"]["force"], "eV/angstrom")

    def test_rejects_second_running_job_and_cancels_first(self):
        manager = JobManager(calculator_factory=lambda: SlowCalculator())
        job_id = manager.submit(sample_structure(), {"fmax": 0.03, "maxSteps": 100, "relaxCell": False, "pressureGPa": 0})
        with self.assertRaisesRegex(RuntimeError, "running"):
            manager.submit(sample_structure(), {"fmax": 0.03, "maxSteps": 2, "relaxCell": False, "pressureGPa": 0})
        self.assertTrue(manager.cancel(job_id))
        result = wait_for_completion(manager, job_id)
        self.assertEqual(result["status"], "cancelled")


@unittest.skipUnless(os.environ.get("RUN_REAL_MACE") == "1", "set RUN_REAL_MACE=1 to run the downloaded MACE-MPA-0 validation")
class RealMaceTests(unittest.TestCase):
    def test_relaxes_distorted_co_doped_b2_with_real_mace_mpa_0(self):
        manager = JobManager()
        manager.preload()
        wait_for_mace(manager)
        job_id = manager.submit(doped_b2_3x3x3(), {"fmax": 0.08, "maxSteps": 10, "relaxCell": False, "pressureGPa": 0})
        result = wait_for_completion(manager, job_id, timeout=600)
        self.assertEqual(result["status"], "completed", result.get("message"))
        payload = result["result"]
        self.assertEqual(payload["model"]["name"], "MACE-MPA-0")
        self.assertTrue(math.isfinite(payload["energyFinal"]))
        self.assertLessEqual(payload["energyFinal"], payload["energyInitial"] + 1e-8)
        self.assertGreater(
            max(abs(after - before) for initial, final in zip(payload["initial"]["atoms"], payload["final"]["atoms"], strict=True) for before, after in zip(initial["position"], final["position"], strict=True)),
            1e-5,
        )


class SlowCalculator(HarmonicCalculator):
    def calculate(self, *args, **kwargs):
        time.sleep(0.04)
        return super().calculate(*args, **kwargs)


def wait_for_completion(manager, job_id, timeout=8):
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        job = manager.get(job_id)
        if job["status"] in {"completed", "cancelled", "error"}:
            return job
        time.sleep(0.02)
    raise AssertionError("job did not finish")


def wait_for_mace(manager):
    deadline = time.monotonic() + 600
    while time.monotonic() < deadline:
        status, _, message = manager.health()
        if status == "ready":
            return
        if status == "error":
            raise AssertionError(message)
        time.sleep(0.2)
    raise AssertionError("MACE model did not load")


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.engine = EngineServer(("127.0.0.1", 0), calculator_factory=lambda: SlowCalculator())
        self.thread = threading.Thread(target=self.engine.serve_forever, daemon=True)
        self.thread.start()
        self.port = self.engine.server_address[1]

    def tearDown(self):
        self.engine.shutdown()
        self.engine.server_close()
        self.thread.join(timeout=2)

    def request(self, method, path, body=None, headers=None):
        connection = http.client.HTTPConnection("127.0.0.1", self.port, timeout=5)
        headers = headers or {}
        connection.request(method, path, body=body, headers=headers)
        response = connection.getresponse()
        raw = response.read()
        payload = json.loads(raw) if raw else {}
        connection.close()
        return response.status, payload, dict(response.getheaders())

    def test_health_and_json_mutation_guard(self):
        status, health, _ = self.request("GET", "/v1/health")
        self.assertEqual(status, 200)
        self.assertIn(health["status"], {"ready", "loading"})
        status, payload, _ = self.request("POST", "/v1/relax", "{}")
        self.assertEqual(status, 415)
        self.assertIn("application/json", payload["error"])

    def test_origin_guard_and_relax_contract(self):
        body = json.dumps({"structure": sample_structure(), "settings": {"fmax": 0.03, "maxSteps": 3, "relaxCell": False, "pressureGPa": 0}})
        forbidden, _, _ = self.request("POST", "/v1/relax", body, {"Content-Type": "application/json", "Origin": "https://example.test"})
        self.assertEqual(forbidden, 403)
        status, payload, headers = self.request("POST", "/v1/relax", body, {"Content-Type": "application/json", "Origin": "http://127.0.0.1:8080"})
        self.assertEqual(status, 202)
        self.assertTrue(payload["id"])
        self.assertEqual(headers["Access-Control-Allow-Origin"], "http://127.0.0.1:8080")

    def test_options_returns_a_narrow_cors_preflight_response(self):
        status, payload, headers = self.request("OPTIONS", "/v1/relax", headers={"Origin": "http://127.0.0.1:8080", "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type"})
        self.assertEqual(status, 204)
        self.assertEqual(payload, {})
        self.assertEqual(headers["Access-Control-Allow-Origin"], "http://127.0.0.1:8080")
        self.assertIn("POST", headers["Access-Control-Allow-Methods"])

    def test_delete_consumes_its_json_body_before_the_next_keepalive_request(self):
        connection = http.client.HTTPConnection("127.0.0.1", self.port, timeout=5)
        relax_body = json.dumps({"structure": sample_structure(), "settings": {"fmax": 0.03, "maxSteps": 3, "relaxCell": False, "pressureGPa": 0}})
        connection.request("POST", "/v1/relax", body=relax_body, headers={"Content-Type": "application/json"})
        job_id = json.loads(connection.getresponse().read())["id"]
        connection.request("DELETE", f"/v1/jobs/{job_id}", body="{}", headers={"Content-Type": "application/json"})
        deleted = connection.getresponse()
        self.assertEqual(deleted.status, 200)
        deleted.read()
        connection.request("GET", "/v1/health")
        health = connection.getresponse()
        self.assertEqual(health.status, 200)
        json.loads(health.read())
        connection.close()


if __name__ == "__main__":
    unittest.main(verbosity=2)

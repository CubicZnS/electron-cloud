# Crystal Lab local engine

This is a loopback-only local service for the Crystal Lab fullscreen workspace. It reads
structures from JSON text, uses ASE with the real MACE-MPA-0 model, and never
uploads a structure or accepts filesystem/model paths through its API.

## Install outside the served project

Use Python 3.12 and keep both packages and model cache out of this repository:

```bash
RUNTIME_DIR="$HOME/.cache/electron-cloud-crystal"
python3.12 -m venv "$RUNTIME_DIR"
"$RUNTIME_DIR/bin/python" -m pip install -r crystal-engine/requirements.txt
```

MACE downloads its public model weights into its user cache on first use. The
model can take a short time to report `ready`; `GET /v1/health` reports
`loading` or a safe load error while that happens.

## Run

Start the static preview on port 8080, then in a separate terminal run:

```bash
$HOME/.cache/electron-cloud-crystal/bin/python crystal-engine/server.py
```

The engine binds only to `127.0.0.1:8765`. It accepts browser origins
`http://127.0.0.1:8080` and `http://localhost:8080`; use `--allow-origin` for
an explicit additional local preview origin. Requests with another `Host` or
`Origin`, mutations without `application/json`, and JSON bodies over 2 MiB are
rejected.

## API

- `GET /v1/health` returns model identity/status and supported elements.
- `POST /v1/relax` accepts `{structure,settings}` and returns `202 {id}`.
- `GET /v1/jobs/:id` returns job progress and the completed result.
- `DELETE /v1/jobs/:id` requests cancellation.
- `POST /v1/import` accepts `{format:'cif'|'vasp'|'extxyz',text}` and returns
  ASE-parsed structure JSON.

Coordinates and cell row vectors are Å; energy is eV; force is eV/Å; stress is
GPa. At most one real relaxation runs at a time; only eight terminal jobs are
retained. Cell relaxation uses ASE's `FrechetCellFilter` and converts the
requested GPa scalar pressure to ASE units.

`model.sha256` is a deterministic SHA-256 of the parameters and buffers on the
loaded calculator. It identifies the weights actually used; it is not a hash of
an arbitrary cache filename.

## Tests

```bash
$HOME/.cache/electron-cloud-crystal/bin/python -m unittest discover -s crystal-engine -p 'test_engine.py' -v
```

The test calculator is used only in the unit suite to exercise ASE's optimizer
and cancellation path. It is never reachable through the service CLI; normal
service execution fails explicitly if MACE cannot load.

Include the real cached model in the release check:

```bash
RUN_REAL_MACE=1 $HOME/.cache/electron-cloud-crystal/bin/python -m unittest discover -s crystal-engine -p 'test_engine.py' -v
```

The 18-test suite includes the opt-in real-model test; without this flag one
test is skipped. Initial package/model downloads need network access and may
take several minutes. Normal inference runs locally once the model is cached.

## Scientific scope and reproducibility

The service explicitly selects `medium-mpa-0` (MACE-MPA-0), CPU, float64 and
four PyTorch threads. Direct dependencies are pinned in `requirements.txt`;
transitive dependencies are not locked. The supported element list comes from
the loaded calculator and does not imply validated accuracy for every alloy.
Validate research results for the specific composition and phase against
appropriate DFT or experimental references.

The API structure is `{cell, pbc, atoms}` with row-vector cell coordinates;
each atom has `{id, element, position, site}`. Boundary images in the viewer
are display-only and never sent as extra atoms. Completed results contain
`initial`, `final`, `frames`, energies, forces, stress, convergence, settings,
units and model provenance. Frames are optimizer iterations, not a physical
trajectory. The frontend removes homogeneous cell deformation and a common
translation when reporting internal displacements.

Use the frontend's project JSON to retain the entire result. Extended XYZ
contains the current independent atom positions and lattice, without the full
optimization history. Closing/reloading the page does not provide automatic
project persistence; cancelling the native save panel does not save a file.

## Dependencies and citations

- MACE code and MACE-MPA-0 weights: MIT; [model source and citation](https://github.com/ACEsuit/mace-foundations).
- ASE 3.29.0: LGPL-2.1-or-later; [ASE source](https://gitlab.com/ase/ase).
- PyTorch: BSD-3-Clause; [license](https://github.com/pytorch/pytorch/blob/main/LICENSE).

These dependencies and model weights are installed separately and are not
vendored in this repository. See [all references](../docs/REFERENCES.md).

# Project memory

## Architecture and release baseline

- Electron Cloud assembles `parts/` into a standalone `index.html`. The
  existing organic model remains semiquantitative; Quantum Data consumes
  externally calculated scalar Cube fields.
- v2.6.0 adds Crystal Lab as a parallel fullscreen workspace. User explicitly
  rejected a floating modal: retain full-screen presentation and exit/restore.
- Use existing three.js and element colors; avoid new frontend dependencies
  or unrelated changes to molecular, creator and Cube rendering.
- Release convention: version-prefixed commit on `main`, lightweight version
  tag, README/CHANGELOG updates. Remote: `ZimoZhang1216/electron-cloud`.

## Crystal Lab decisions

- Periodic structures use row-vector cells and Cartesian Å coordinates, with
  stable IDs for independent atoms. B2 separates A and B sublattices. HCP uses
  a two-atom primitive parallelepiped; FCC uses the four-atom conventional cell.
- Boundary mirrors are presentation copies: FCC 1x1x1 has 14 displayed spheres,
  weighted as 8 corners/8 + 6 faces/2 = 4 independent atoms. Edges count 1/4;
  nonperiodic axes are not shared. Clicking/replacing any mirror changes its
  single source site. Calculation, composition and export never count copies.
- The “生成” button beside lattice parameters rebuilds using current settings,
  removing doping/vacancies/results. It does not estimate an equilibrium
  lattice constant. The default 2.88 Å is a starting guess, not a universal value.
- Explicit model: MACE-MPA-0 (`medium-mpa-0`), CPU float64. Supported elements
  come from the loaded model; coverage does not guarantee system accuracy.
- Local ASE service defaults to 127.0.0.1:8765, preview to 127.0.0.1:8080.
  Runtime convention: `$HOME/.cache/electron-cloud-crystal`; weights stay in
  MACE's external cache. No Python environment or model is bundled in Git.
- Internal displacement comparison maps initial fractional coordinates into
  the final cell and removes common translation. Display copies stay paired
  to the initial structure through interpolation/amplification. These are
  comparison views, not physical trajectories.
- Same-composition energy differences are relaxation energies; no electronic
  density, defect formation energy or site preference is inferred from them.
- Full JSON projects retain structures, result, settings, history, frames and
  loaded parameter SHA-256. XYZ retains independent positions/lattice only.

## Validation and pitfalls

- Release checks: sigma 15, Cube 73, crystal 17; engine 18 including opt-in
  real-model inference. Focused browser checks cover FCC mirror selection,
  composition, reset, full-screen switching and narrow layouts.
- Real B2 NiAl/Co fixed- and variable-cell runs converged; these are integration
  checks, not material-specific accuracy benchmarks.
- Reject partial-occupancy CIF rather than silently choosing a species.
- Retain DELETE body consumption so persistent HTTP connections parse the
  next request correctly. Keep explicit disconnected/lost-job handling.
- macOS native Save As repeatedly disabled Save during initial validation.
  Download initiation and full real-result JSON import passed; browser export
  to disk remains unverified. Do not claim “saved” merely after link activation.
- Before v2.6.0, `sample-cubes/` was unrelated untracked local data. Preserve it
  without adding the large dataset to the release.

## Sources

- Models: https://github.com/ACEsuit/mace-foundations
- ASE: https://gitlab.com/ase/ase
- Detailed attribution and licenses: `docs/REFERENCES.md`, resources 42–44.

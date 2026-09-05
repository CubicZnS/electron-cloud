# Electron Cloud project instructions

## Architecture

- Edit source fragments in `parts/`; run `node tools/build.mjs` to regenerate
  `index.html`. The HTML is a distributable artifact, not a separate source.
- Keep the existing molecular/creator/Cube flows isolated from Crystal Lab.
  Crystal Lab owns its DOM, state, renderer and local API requests. The molecular
  render loop only checks `CrystalLab.isOpen()` to pause while the lab is open.
- Crystal structures use Cartesian angstrom positions, three row-vector cell
  vectors, explicit periodic axes and stable independent atom IDs. Display
  mirrors must never enter calculation or export atom lists.
- Preserve the full-screen Crystal Lab entry beside the two existing bottom
  entries. Match existing Chinese UI, dark colors and three.js assets.
- Prototype geometry (1–3 element roles: A, A/B, A/B/C) belongs in
  CrystalCore; named parameter seeds belong in `parts/03d_crystal_templates.js`,
  assembled immediately after the core. Keep their starting-guess status and
  geometry references explicit; verify site ratios and periodic coordination
  when adding a prototype.

## Commands

```bash
python3 -m http.server 8080 --bind 127.0.0.1
node tools/build.mjs
node tools/validate-sigma.mjs
node tools/validate-cube.mjs
node tools/validate-crystal.mjs
```

The build performs a JavaScript syntax check. There is no separate lint or
TypeScript pipeline: the frontend uses plain JavaScript without npm dependencies.
Run focused browser checks for rendered changes. Local engine setup and tests
are documented in `crystal-engine/README.md`; release checks should include
the real-model opt-in test when its runtime/cache is available.

## Scientific and security rules

- Distinguish the organic semiquantitative model, imported quantum fields and
  learned-potential structural relaxation in both docs and UI.
- Do not manufacture electron density from a mechanical potential, infer
  validated alloy accuracy from element coverage, or label relaxation energy
  as defect formation energy. Visual interpolation is not molecular dynamics.
- Validate user files and HTTP inputs. Keep the engine loopback-only; never
  add arbitrary filesystem paths, model downloads or shell execution to its API.
- Python environments, model weights, test exports and credentials stay outside
  the served project and Git. Never read or record secret values.
- Preserve unrelated `sample-cubes/` data; do not stage it with blanket Git adds.

## Documentation and releases

- Maintain README, CHANGELOG, research/reference docs and MEMORY for relevant
  changes. Explain additional runtime requirements and known verification gaps.
- Follow documented SemVer: compatible features increase the minor version;
  fixes increase the patch version. Existing releases use version-prefixed
  commits on `main` and lightweight `vX.Y.Z` tags.
- Commit/push only when the user explicitly authorizes them. Preview approval
  can be followed by the authorized release without another confirmation.
- Keep changes scoped; do not switch branches, rewrite history or overwrite
  unrelated work. Run `git diff --check` and inspect the exact staged files.

# Crystal templates (elemental / binary / ternary)

Crystal Lab includes 232 named starting structures across 23 prototype families:
pure elemental (FCC/BCC/HCP, diamond A4, graphite A9), binary AB/AB₂/A₂B, and
ternary ABC₃/AB₂C₄ types. This is a structure builder, not an experimental
structure database or a new potential model.

## User flow and scope

Select a compound in the grouped template menu, then press the load button.
Loading replaces the working structure and results with a 1 × 1 × 1 cell.
Element assignments, lattice constant, c/a and internal coordinates are filled
in together. All remain editable; expand the cell before introducing a dilute
substitution or vacancy. Generation uses the current controls. Template selection
alone does not change the working structure, and loading is locked during a job
or import.

The catalog identifies a particular phase, rather than inferring a phase from
the formula. ZnS has separate zincblende (B3) and wurtzite (B4) entries; BN has
separate cubic and layered entries; SiC is explicitly 3C; corundum-type entries
are the α phase and rutile entries are the rutile phase of each dioxide; the
dichalcogenides are bulk 2H, with three periodic axes (not isolated monolayers).

## Coverage and geometry references

Each prototype has an A (first) role; binary entries add B; ternary entries add
C. "Independent atoms per cell" is listed as A + B (+ C) counts. All coordinates
were verified against the linked conventional-cell records (AFLOW prototype
pages, or COD CIFs where noted) and their periodic coordination is asserted in
the validator.

| Family | Named entries | A + B (+ C) sites | Geometry reference |
|---|---|---|---|
| FCC (metals) | Cu, Ag, Au, Al, Ni, Pt, Pd, Pb, Rh, Ir | 4 | [AFLOW A1](https://aflow.org/p/A1/) |
| BCC (metals) | Fe, Cr, W, Mo, V, Nb, Ta, Li, Na, K | 2 | [AFLOW A2](https://aflow.org/p/A2/) |
| HCP (metals) | Mg, Zn, Ti, Zr, Co, Cd, Be, Ru, Os | 2 | [AFLOW A3](https://aflow.org/p/A3/) |
| Diamond A4 | C, Si, Ge, Sn | 8 | [AFLOW A4](https://aflow.org/p/A_cF8_227_a-001/) |
| Graphite A9 | C | 4 | [AFLOW A9](https://aflow.org/p/A_hP4_194_bc-001/) |
| Rocksalt B1 | NaCl, KCl, KBr, KI, LiF, LiCl, NaF, NaBr, NaI, RbCl, RbBr, RbI, CsF, MgO, CaO, SrO, BaO, NiO, CoO, MnO, FeO, CdO, AgCl, AgBr, TiN, TiC, ZrN, HfN, ScN, CrN, PbS, PbSe, PbTe, SnTe, BaS | 4 + 4 | [AFLOW B1](https://aflow.org/p/AB_cF8_225_a_b-001/) |
| CsCl B2 | CsCl, CsBr, CsI, TlCl, TlBr, TlI, NiAl, FeAl, CoAl, CuZn, CuBe, AgMg, AuZn | 1 + 1 | [AFLOW B2](https://aflow.org/p/AB_cP2_221_a_b-002/) |
| Zincblende B3 | ZnS, ZnSe, ZnTe, CdTe, HgS, HgSe, HgTe, GaAs, GaP, GaSb, InP, InAs, InSb, AlAs, AlP, AlSb, BP, BAs, 3C-SiC, c-BN, CuCl, CuBr, CuI | 4 + 4 | [AFLOW B3](https://aflow.org/p/AB_cF8_216_a_c-001/) |
| Wurtzite B4 | ZnO, ZnS, ZnSe, CdS, CdSe, GaN, AlN, InN, BeO, MgTe | 2 + 2 | [AFLOW B4](https://aflow.org/p/AB_hP4_186_b_b-001/) |
| Fluorite C1 | CaF2, SrF2, BaF2, PbF2, CdF2, CeO2, UO2, ThO2, ZrO2, HfO2, PuO2 | 4 + 8 | [AFLOW C1](https://aflow.org/p/AB2_cF12_225_a_c-001/) |
| Antifluorite | Li2O, Na2O, K2O, Rb2O, Mg2Si, Mg2Ge, Mg2Sn, Li2S, Na2S | 8 + 4 | C1 geometry, roles reversed |
| Rutile C4 | TiO2, SnO2, GeO2, PbO2, RuO2, IrO2, MnO2, VO2, MgF2, MnF2, NiF2, ZnF2 | 2 + 4 | [AFLOW C4](https://aflow.org/p/A2B_tP6_136_f_a-001/) |
| NiAs B8₁ | NiAs, NiS, MnTe, CrS, FeS, CoS, PtSn | 2 + 2 | [AFLOW B8₁](https://aflow.org/p/AB_hP4_194_c_a-001/) |
| Layered h-BN | h-BN | 2 + 2 | [AFLOW Bk](https://aflow.org/p/AB_hP4_194_c_d-001/) |
| Layered 2H-MoS2 | MoS2, WS2, MoSe2, WSe2, MoTe2, WTe2, NbS2, TaS2 | 2 + 4 | [AFLOW C7](https://aflow.org/p/AB2_hP6_194_c_f-001/) |
| Pyrite C2 | FeS2, CoS2, NiS2, MnS2, RuS2, OsS2, PtP2, AuSb2 | 4 + 8 | [AFLOW C2](https://aflow.org/p/AB2_cP12_205_a_c-001/) |
| Cuprite C3 | Cu2O, Ag2O | 4 + 2 | [AFLOW C3](https://aflow.org/p/A2B_cP6_224_b_a-001/) |
| CdI₂ 2H (C6) | CdI2, PbI2, MgI2, CoI2, FeI2, NiI2, TiS2, ZrS2, SnS2, HfS2 | 1 + 2 | [AFLOW C6](https://aflow.org/p/AB2_hP3_164_a_d-001/) |
| Corundum D5₁ | Al2O3, Fe2O3, Cr2O3, V2O3, Ti2O3, Ga2O3 | 12 + 18 | [AFLOW D5₁](https://aflow.org/p/A2B3_hR10_167_c_e-001/) |
| Perovskite E2₁ | SrTiO3, BaTiO3, CaTiO3, PbTiO3, KNbO3, NaNbO3, LaAlO3, KTaO3, BaZrO3, SrZrO3, CaZrO3, PbZrO3, CsPbBr3, CsPbCl3, CsPbI3, LaGaO3, YAlO3, SrSnO3 | 1 + 1 + 3 | [AFLOW E2₁](https://aflow.org/p/AB3C_cP5_221_a_c_b-001/) |
| Spinel H1₁ | MgAl2O4, ZnAl2O4, FeAl2O4, CoAl2O4, MnAl2O4, NiAl2O4, MgCr2O4, ZnCr2O4, CoCr2O4, MgFe2O4, ZnFe2O4, NiFe2O4, MnFe2O4 | 8 + 16 + 32 | [AFLOW H1₁](https://aflow.org/p/A2BC4_cF56_227_c_b_e-001/) |
| Calcite | CaCO3, MgCO3, FeCO3, MnCO3, ZnCO3, CoCO3, NiCO3, CdCO3 | 6 + 6 + 18 | [COD 1547347](https://www.crystallography.net/cod/1547347.html) |
| Zircon | ZrSiO4, HfSiO4, ThSiO4, USiO4 | 4 + 4 + 16 | [AFLOW S1₁](https://aflow.org/p/A4BC_tI24_141_h_a_b-001/) |

The role letters are chemical-order labels: A = first element in the entry
(e.g. Ti in TiO₂, Mg in MgAl₂O₄, Sr in SrTiO₃). AFLOW records often name sites
alphabetically; the mapping here is explicit and asserted by the validator.

These links support the prototype geometry. They are **not citations for every
numeric lattice seed in the catalog**. No AFLOW software, images or CIF files
are bundled; basis coordinates are implemented locally (fractional tables taken
from the conventional-cell records and expanded with pymatgen where the cell is
large). Consult the linked records for underlying diffraction papers.

## Parameter status and conventions

`parts/03d_crystal_templates.js` is the single source for the complete numeric
catalog: each row contains name, one to three element symbols (roles follow the
kind), a in Å, optional c in Å and optional fractional internal parameter. The
values are deliberately rounded engineering starting guesses, chosen near
familiar dimensions of these phases; they have not been individually matched to
a temperature, pressure, composition or experimental uncertainty. They are not
fitted empirical potentials, measured reference values or guaranteed equilibrium
structures. Replace them with a traceable CIF or experiment/DFT parameters for a
particular research system.

- Cubic cells are conventional cells; tetragonal rutile/zircon use c = a × (c/a).
- Hexagonal cells have gamma = 120°, row vectors (a,0,0), (-a/2,sqrt(3)a/2,0),
  (0,0,c). They are parallelepipeds, not hexagonal prisms. Layered and R-3c
  (corundum/calcite) entries are expressed in their hexagonal conventional cell.
- Wurtzite places A at (1/3,2/3,0),(2/3,1/3,1/2); B is shifted by u along c.
  Ideal tetrahedral geometry has c/a = sqrt(8/3), u = 3/8.
- Rutile uses B on the 4f positions generated from (u,u,0). 2H-MoS₂ uses B on
  4f positions generated from (1/3,2/3,z), z ≈ 0.62 in this origin convention;
  the UI labels this parameter z explicitly.
- Large-cell prototypes (corundum 30 atoms, spinel 56 atoms, calcite 30 atoms,
  zircon 24 atoms in their conventional cell) are intentionally loaded as 1×1×1;
  a repeat expansion is capped by the 512 independent-atom limit.
- Ternary entries expose a third element (C 位); substitution/doping can target
  A/B/C or all sites.
- Free element substitution preserves the chosen geometry, without asserting that
  the resulting composition stabilizes that phase. Magnetic order, charge states,
  disorder and temperature are not specified by these templates.

The existing MACE-MPA-0 engine and its limits still apply. Element coverage does
not validate a phase, energy ordering, ionic interactions or layer binding.
Local relaxation of an exactly symmetric small cell can remain at a stationary
point; convergence alone does not establish dynamic or thermodynamic stability.

## Data integrity and verification

The builder supplies only independent atoms to the existing renderer, editor,
engine and exports. Closed-cell NaCl has 27 display spheres but 8 independent
atoms: Na contributes 8 corners and 6 faces; Cl contributes 12 edges and 1 center.
The geometry validator preserves periodic distances and the 512-atom bound.

Build history records the complete generation controls, template ID when still
applicable, and starting-guess status in the existing project JSON schema. Manual
edits to chemistry or lattice parameters remove the named-compound attribution
on the next generation; supercell changes retain it. No engine API changes.

`node tools/validate-crystal.mjs` covers all 232 presets for site ratios, atom
identity, serialization and boundary weights, coordination fixtures per family
(e.g. diamond 4, graphite in-plane 3, pyrite Fe 6, cuprite Cu 2, CdI₂ Cd 6,
corundum Al 6, perovskite Ti 6/Sr 12, spinel Mg 4/Al 6, calcite Ca 6 and C–O 3,
zircon Zr 8/Si 4), internal-coordinate edits, supercells and existing geometric
regressions.

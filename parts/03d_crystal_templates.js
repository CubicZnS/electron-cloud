/* Rounded starting guesses, not an experimental lattice-constant database.
 * Prototype geometry sources and parameter conventions: docs/CRYSTAL_TEMPLATES.md.
 * Row: name, 1–3 element symbols (roles follow the kind: 1 pure, 2 A/B, 3 A/B/C),
 * a (Å), optional c (Å), optional fractional internal parameter. */
const CrystalTemplates=[
 {
  "id": "FCC-Cu",
  "name": "Cu",
  "kind": "FCC",
  "elements": [
   "Cu"
  ],
  "elementA": "Cu",
  "a": 3.615
 },
 {
  "id": "FCC-Ag",
  "name": "Ag",
  "kind": "FCC",
  "elements": [
   "Ag"
  ],
  "elementA": "Ag",
  "a": 4.085
 },
 {
  "id": "FCC-Au",
  "name": "Au",
  "kind": "FCC",
  "elements": [
   "Au"
  ],
  "elementA": "Au",
  "a": 4.078
 },
 {
  "id": "FCC-Al",
  "name": "Al",
  "kind": "FCC",
  "elements": [
   "Al"
  ],
  "elementA": "Al",
  "a": 4.05
 },
 {
  "id": "FCC-Ni",
  "name": "Ni",
  "kind": "FCC",
  "elements": [
   "Ni"
  ],
  "elementA": "Ni",
  "a": 3.524
 },
 {
  "id": "FCC-Pt",
  "name": "Pt",
  "kind": "FCC",
  "elements": [
   "Pt"
  ],
  "elementA": "Pt",
  "a": 3.924
 },
 {
  "id": "FCC-Pd",
  "name": "Pd",
  "kind": "FCC",
  "elements": [
   "Pd"
  ],
  "elementA": "Pd",
  "a": 3.89
 },
 {
  "id": "FCC-Pb",
  "name": "Pb",
  "kind": "FCC",
  "elements": [
   "Pb"
  ],
  "elementA": "Pb",
  "a": 4.95
 },
 {
  "id": "FCC-Rh",
  "name": "Rh",
  "kind": "FCC",
  "elements": [
   "Rh"
  ],
  "elementA": "Rh",
  "a": 3.8
 },
 {
  "id": "FCC-Ir",
  "name": "Ir",
  "kind": "FCC",
  "elements": [
   "Ir"
  ],
  "elementA": "Ir",
  "a": 3.84
 },
 {
  "id": "BCC-Fe",
  "name": "Fe",
  "kind": "BCC",
  "elements": [
   "Fe"
  ],
  "elementA": "Fe",
  "a": 2.8665
 },
 {
  "id": "BCC-Cr",
  "name": "Cr",
  "kind": "BCC",
  "elements": [
   "Cr"
  ],
  "elementA": "Cr",
  "a": 2.884
 },
 {
  "id": "BCC-W",
  "name": "W",
  "kind": "BCC",
  "elements": [
   "W"
  ],
  "elementA": "W",
  "a": 3.165
 },
 {
  "id": "BCC-Mo",
  "name": "Mo",
  "kind": "BCC",
  "elements": [
   "Mo"
  ],
  "elementA": "Mo",
  "a": 3.147
 },
 {
  "id": "BCC-V",
  "name": "V",
  "kind": "BCC",
  "elements": [
   "V"
  ],
  "elementA": "V",
  "a": 3.024
 },
 {
  "id": "BCC-Nb",
  "name": "Nb",
  "kind": "BCC",
  "elements": [
   "Nb"
  ],
  "elementA": "Nb",
  "a": 3.3
 },
 {
  "id": "BCC-Ta",
  "name": "Ta",
  "kind": "BCC",
  "elements": [
   "Ta"
  ],
  "elementA": "Ta",
  "a": 3.306
 },
 {
  "id": "BCC-Li",
  "name": "Li",
  "kind": "BCC",
  "elements": [
   "Li"
  ],
  "elementA": "Li",
  "a": 3.51
 },
 {
  "id": "BCC-Na",
  "name": "Na",
  "kind": "BCC",
  "elements": [
   "Na"
  ],
  "elementA": "Na",
  "a": 4.29
 },
 {
  "id": "BCC-K",
  "name": "K",
  "kind": "BCC",
  "elements": [
   "K"
  ],
  "elementA": "K",
  "a": 5.33
 },
 {
  "id": "HCP-Mg",
  "name": "Mg",
  "kind": "HCP",
  "elements": [
   "Mg"
  ],
  "elementA": "Mg",
  "a": 3.209,
  "cOverA": 1.6238703645995638
 },
 {
  "id": "HCP-Zn",
  "name": "Zn",
  "kind": "HCP",
  "elements": [
   "Zn"
  ],
  "elementA": "Zn",
  "a": 2.665,
  "cOverA": 1.8562851782363978
 },
 {
  "id": "HCP-Ti",
  "name": "Ti",
  "kind": "HCP",
  "elements": [
   "Ti"
  ],
  "elementA": "Ti",
  "a": 2.951,
  "cOverA": 1.5875974246018296
 },
 {
  "id": "HCP-Zr",
  "name": "Zr",
  "kind": "HCP",
  "elements": [
   "Zr"
  ],
  "elementA": "Zr",
  "a": 3.232,
  "cOverA": 1.5925123762376237
 },
 {
  "id": "HCP-Co",
  "name": "Co",
  "kind": "HCP",
  "elements": [
   "Co"
  ],
  "elementA": "Co",
  "a": 2.507,
  "cOverA": 1.6234543278819307
 },
 {
  "id": "HCP-Cd",
  "name": "Cd",
  "kind": "HCP",
  "elements": [
   "Cd"
  ],
  "elementA": "Cd",
  "a": 2.979,
  "cOverA": 1.8858677408526352
 },
 {
  "id": "HCP-Be",
  "name": "Be",
  "kind": "HCP",
  "elements": [
   "Be"
  ],
  "elementA": "Be",
  "a": 2.286,
  "cOverA": 1.5678040244969378
 },
 {
  "id": "HCP-Ru",
  "name": "Ru",
  "kind": "HCP",
  "elements": [
   "Ru"
  ],
  "elementA": "Ru",
  "a": 2.706,
  "cOverA": 1.582409460458241
 },
 {
  "id": "HCP-Os",
  "name": "Os",
  "kind": "HCP",
  "elements": [
   "Os"
  ],
  "elementA": "Os",
  "a": 2.734,
  "cOverA": 1.580102414045355
 },
 {
  "id": "diamond-C(金刚石)",
  "name": "C(金刚石)",
  "kind": "diamond",
  "elements": [
   "C"
  ],
  "elementA": "C",
  "a": 3.567
 },
 {
  "id": "diamond-Si",
  "name": "Si",
  "kind": "diamond",
  "elements": [
   "Si"
  ],
  "elementA": "Si",
  "a": 5.431
 },
 {
  "id": "diamond-Ge",
  "name": "Ge",
  "kind": "diamond",
  "elements": [
   "Ge"
  ],
  "elementA": "Ge",
  "a": 5.658
 },
 {
  "id": "diamond-Sn(灰锡)",
  "name": "Sn(灰锡)",
  "kind": "diamond",
  "elements": [
   "Sn"
  ],
  "elementA": "Sn",
  "a": 6.489
 },
 {
  "id": "graphite-C(石墨)",
  "name": "C(石墨)",
  "kind": "graphite",
  "elements": [
   "C"
  ],
  "elementA": "C",
  "a": 2.464,
  "cOverA": 2.72362012987013
 },
 {
  "id": "B1-NaCl",
  "name": "NaCl",
  "kind": "B1",
  "elements": [
   "Na",
   "Cl"
  ],
  "elementA": "Na",
  "elementB": "Cl",
  "a": 5.64
 },
 {
  "id": "B1-KCl",
  "name": "KCl",
  "kind": "B1",
  "elements": [
   "K",
   "Cl"
  ],
  "elementA": "K",
  "elementB": "Cl",
  "a": 6.29
 },
 {
  "id": "B1-KBr",
  "name": "KBr",
  "kind": "B1",
  "elements": [
   "K",
   "Br"
  ],
  "elementA": "K",
  "elementB": "Br",
  "a": 6.6
 },
 {
  "id": "B1-KI",
  "name": "KI",
  "kind": "B1",
  "elements": [
   "K",
   "I"
  ],
  "elementA": "K",
  "elementB": "I",
  "a": 7.07
 },
 {
  "id": "B1-LiF",
  "name": "LiF",
  "kind": "B1",
  "elements": [
   "Li",
   "F"
  ],
  "elementA": "Li",
  "elementB": "F",
  "a": 4.03
 },
 {
  "id": "B1-LiCl",
  "name": "LiCl",
  "kind": "B1",
  "elements": [
   "Li",
   "Cl"
  ],
  "elementA": "Li",
  "elementB": "Cl",
  "a": 5.14
 },
 {
  "id": "B1-NaF",
  "name": "NaF",
  "kind": "B1",
  "elements": [
   "Na",
   "F"
  ],
  "elementA": "Na",
  "elementB": "F",
  "a": 4.63
 },
 {
  "id": "B1-NaBr",
  "name": "NaBr",
  "kind": "B1",
  "elements": [
   "Na",
   "Br"
  ],
  "elementA": "Na",
  "elementB": "Br",
  "a": 5.97
 },
 {
  "id": "B1-NaI",
  "name": "NaI",
  "kind": "B1",
  "elements": [
   "Na",
   "I"
  ],
  "elementA": "Na",
  "elementB": "I",
  "a": 6.47
 },
 {
  "id": "B1-RbCl",
  "name": "RbCl",
  "kind": "B1",
  "elements": [
   "Rb",
   "Cl"
  ],
  "elementA": "Rb",
  "elementB": "Cl",
  "a": 6.59
 },
 {
  "id": "B1-RbBr",
  "name": "RbBr",
  "kind": "B1",
  "elements": [
   "Rb",
   "Br"
  ],
  "elementA": "Rb",
  "elementB": "Br",
  "a": 6.89
 },
 {
  "id": "B1-RbI",
  "name": "RbI",
  "kind": "B1",
  "elements": [
   "Rb",
   "I"
  ],
  "elementA": "Rb",
  "elementB": "I",
  "a": 7.34
 },
 {
  "id": "B1-CsF",
  "name": "CsF",
  "kind": "B1",
  "elements": [
   "Cs",
   "F"
  ],
  "elementA": "Cs",
  "elementB": "F",
  "a": 6.01
 },
 {
  "id": "B1-MgO",
  "name": "MgO",
  "kind": "B1",
  "elements": [
   "Mg",
   "O"
  ],
  "elementA": "Mg",
  "elementB": "O",
  "a": 4.21
 },
 {
  "id": "B1-CaO",
  "name": "CaO",
  "kind": "B1",
  "elements": [
   "Ca",
   "O"
  ],
  "elementA": "Ca",
  "elementB": "O",
  "a": 4.81
 },
 {
  "id": "B1-SrO",
  "name": "SrO",
  "kind": "B1",
  "elements": [
   "Sr",
   "O"
  ],
  "elementA": "Sr",
  "elementB": "O",
  "a": 5.16
 },
 {
  "id": "B1-BaO",
  "name": "BaO",
  "kind": "B1",
  "elements": [
   "Ba",
   "O"
  ],
  "elementA": "Ba",
  "elementB": "O",
  "a": 5.52
 },
 {
  "id": "B1-NiO",
  "name": "NiO",
  "kind": "B1",
  "elements": [
   "Ni",
   "O"
  ],
  "elementA": "Ni",
  "elementB": "O",
  "a": 4.18
 },
 {
  "id": "B1-CoO",
  "name": "CoO",
  "kind": "B1",
  "elements": [
   "Co",
   "O"
  ],
  "elementA": "Co",
  "elementB": "O",
  "a": 4.27
 },
 {
  "id": "B1-MnO",
  "name": "MnO",
  "kind": "B1",
  "elements": [
   "Mn",
   "O"
  ],
  "elementA": "Mn",
  "elementB": "O",
  "a": 4.44
 },
 {
  "id": "B1-FeO",
  "name": "FeO",
  "kind": "B1",
  "elements": [
   "Fe",
   "O"
  ],
  "elementA": "Fe",
  "elementB": "O",
  "a": 4.33
 },
 {
  "id": "B1-CdO",
  "name": "CdO",
  "kind": "B1",
  "elements": [
   "Cd",
   "O"
  ],
  "elementA": "Cd",
  "elementB": "O",
  "a": 4.7
 },
 {
  "id": "B1-AgCl",
  "name": "AgCl",
  "kind": "B1",
  "elements": [
   "Ag",
   "Cl"
  ],
  "elementA": "Ag",
  "elementB": "Cl",
  "a": 5.55
 },
 {
  "id": "B1-AgBr",
  "name": "AgBr",
  "kind": "B1",
  "elements": [
   "Ag",
   "Br"
  ],
  "elementA": "Ag",
  "elementB": "Br",
  "a": 5.77
 },
 {
  "id": "B1-TiN",
  "name": "TiN",
  "kind": "B1",
  "elements": [
   "Ti",
   "N"
  ],
  "elementA": "Ti",
  "elementB": "N",
  "a": 4.24
 },
 {
  "id": "B1-TiC",
  "name": "TiC",
  "kind": "B1",
  "elements": [
   "Ti",
   "C"
  ],
  "elementA": "Ti",
  "elementB": "C",
  "a": 4.33
 },
 {
  "id": "B1-ZrN",
  "name": "ZrN",
  "kind": "B1",
  "elements": [
   "Zr",
   "N"
  ],
  "elementA": "Zr",
  "elementB": "N",
  "a": 4.58
 },
 {
  "id": "B1-HfN",
  "name": "HfN",
  "kind": "B1",
  "elements": [
   "Hf",
   "N"
  ],
  "elementA": "Hf",
  "elementB": "N",
  "a": 4.52
 },
 {
  "id": "B1-ScN",
  "name": "ScN",
  "kind": "B1",
  "elements": [
   "Sc",
   "N"
  ],
  "elementA": "Sc",
  "elementB": "N",
  "a": 4.5
 },
 {
  "id": "B1-CrN",
  "name": "CrN",
  "kind": "B1",
  "elements": [
   "Cr",
   "N"
  ],
  "elementA": "Cr",
  "elementB": "N",
  "a": 4.14
 },
 {
  "id": "B1-PbS",
  "name": "PbS",
  "kind": "B1",
  "elements": [
   "Pb",
   "S"
  ],
  "elementA": "Pb",
  "elementB": "S",
  "a": 5.94
 },
 {
  "id": "B1-PbSe",
  "name": "PbSe",
  "kind": "B1",
  "elements": [
   "Pb",
   "Se"
  ],
  "elementA": "Pb",
  "elementB": "Se",
  "a": 6.12
 },
 {
  "id": "B1-PbTe",
  "name": "PbTe",
  "kind": "B1",
  "elements": [
   "Pb",
   "Te"
  ],
  "elementA": "Pb",
  "elementB": "Te",
  "a": 6.46
 },
 {
  "id": "B1-SnTe",
  "name": "SnTe",
  "kind": "B1",
  "elements": [
   "Sn",
   "Te"
  ],
  "elementA": "Sn",
  "elementB": "Te",
  "a": 6.33
 },
 {
  "id": "B1-BaS",
  "name": "BaS",
  "kind": "B1",
  "elements": [
   "Ba",
   "S"
  ],
  "elementA": "Ba",
  "elementB": "S",
  "a": 6.39
 },
 {
  "id": "B2-CsCl",
  "name": "CsCl",
  "kind": "B2",
  "elements": [
   "Cs",
   "Cl"
  ],
  "elementA": "Cs",
  "elementB": "Cl",
  "a": 4.12
 },
 {
  "id": "B2-CsBr",
  "name": "CsBr",
  "kind": "B2",
  "elements": [
   "Cs",
   "Br"
  ],
  "elementA": "Cs",
  "elementB": "Br",
  "a": 4.29
 },
 {
  "id": "B2-CsI",
  "name": "CsI",
  "kind": "B2",
  "elements": [
   "Cs",
   "I"
  ],
  "elementA": "Cs",
  "elementB": "I",
  "a": 4.57
 },
 {
  "id": "B2-TlCl",
  "name": "TlCl",
  "kind": "B2",
  "elements": [
   "Tl",
   "Cl"
  ],
  "elementA": "Tl",
  "elementB": "Cl",
  "a": 3.84
 },
 {
  "id": "B2-TlBr",
  "name": "TlBr",
  "kind": "B2",
  "elements": [
   "Tl",
   "Br"
  ],
  "elementA": "Tl",
  "elementB": "Br",
  "a": 3.97
 },
 {
  "id": "B2-TlI",
  "name": "TlI",
  "kind": "B2",
  "elements": [
   "Tl",
   "I"
  ],
  "elementA": "Tl",
  "elementB": "I",
  "a": 4.2
 },
 {
  "id": "B2-NiAl",
  "name": "NiAl",
  "kind": "B2",
  "elements": [
   "Ni",
   "Al"
  ],
  "elementA": "Ni",
  "elementB": "Al",
  "a": 2.88
 },
 {
  "id": "B2-FeAl",
  "name": "FeAl",
  "kind": "B2",
  "elements": [
   "Fe",
   "Al"
  ],
  "elementA": "Fe",
  "elementB": "Al",
  "a": 2.9
 },
 {
  "id": "B2-CoAl",
  "name": "CoAl",
  "kind": "B2",
  "elements": [
   "Co",
   "Al"
  ],
  "elementA": "Co",
  "elementB": "Al",
  "a": 2.86
 },
 {
  "id": "B2-CuZn",
  "name": "CuZn",
  "kind": "B2",
  "elements": [
   "Cu",
   "Zn"
  ],
  "elementA": "Cu",
  "elementB": "Zn",
  "a": 2.96
 },
 {
  "id": "B2-CuBe",
  "name": "CuBe",
  "kind": "B2",
  "elements": [
   "Cu",
   "Be"
  ],
  "elementA": "Cu",
  "elementB": "Be",
  "a": 2.7
 },
 {
  "id": "B2-AgMg",
  "name": "AgMg",
  "kind": "B2",
  "elements": [
   "Ag",
   "Mg"
  ],
  "elementA": "Ag",
  "elementB": "Mg",
  "a": 3.33
 },
 {
  "id": "B2-AuZn",
  "name": "AuZn",
  "kind": "B2",
  "elements": [
   "Au",
   "Zn"
  ],
  "elementA": "Au",
  "elementB": "Zn",
  "a": 3.19
 },
 {
  "id": "B3-ZnS",
  "name": "ZnS",
  "kind": "B3",
  "elements": [
   "Zn",
   "S"
  ],
  "elementA": "Zn",
  "elementB": "S",
  "a": 5.41
 },
 {
  "id": "B3-ZnSe",
  "name": "ZnSe",
  "kind": "B3",
  "elements": [
   "Zn",
   "Se"
  ],
  "elementA": "Zn",
  "elementB": "Se",
  "a": 5.67
 },
 {
  "id": "B3-ZnTe",
  "name": "ZnTe",
  "kind": "B3",
  "elements": [
   "Zn",
   "Te"
  ],
  "elementA": "Zn",
  "elementB": "Te",
  "a": 6.1
 },
 {
  "id": "B3-CdTe",
  "name": "CdTe",
  "kind": "B3",
  "elements": [
   "Cd",
   "Te"
  ],
  "elementA": "Cd",
  "elementB": "Te",
  "a": 6.48
 },
 {
  "id": "B3-HgS",
  "name": "HgS",
  "kind": "B3",
  "elements": [
   "Hg",
   "S"
  ],
  "elementA": "Hg",
  "elementB": "S",
  "a": 5.85
 },
 {
  "id": "B3-HgSe",
  "name": "HgSe",
  "kind": "B3",
  "elements": [
   "Hg",
   "Se"
  ],
  "elementA": "Hg",
  "elementB": "Se",
  "a": 6.08
 },
 {
  "id": "B3-HgTe",
  "name": "HgTe",
  "kind": "B3",
  "elements": [
   "Hg",
   "Te"
  ],
  "elementA": "Hg",
  "elementB": "Te",
  "a": 6.46
 },
 {
  "id": "B3-GaAs",
  "name": "GaAs",
  "kind": "B3",
  "elements": [
   "Ga",
   "As"
  ],
  "elementA": "Ga",
  "elementB": "As",
  "a": 5.65
 },
 {
  "id": "B3-GaP",
  "name": "GaP",
  "kind": "B3",
  "elements": [
   "Ga",
   "P"
  ],
  "elementA": "Ga",
  "elementB": "P",
  "a": 5.45
 },
 {
  "id": "B3-GaSb",
  "name": "GaSb",
  "kind": "B3",
  "elements": [
   "Ga",
   "Sb"
  ],
  "elementA": "Ga",
  "elementB": "Sb",
  "a": 6.1
 },
 {
  "id": "B3-InP",
  "name": "InP",
  "kind": "B3",
  "elements": [
   "In",
   "P"
  ],
  "elementA": "In",
  "elementB": "P",
  "a": 5.87
 },
 {
  "id": "B3-InAs",
  "name": "InAs",
  "kind": "B3",
  "elements": [
   "In",
   "As"
  ],
  "elementA": "In",
  "elementB": "As",
  "a": 6.06
 },
 {
  "id": "B3-InSb",
  "name": "InSb",
  "kind": "B3",
  "elements": [
   "In",
   "Sb"
  ],
  "elementA": "In",
  "elementB": "Sb",
  "a": 6.48
 },
 {
  "id": "B3-AlAs",
  "name": "AlAs",
  "kind": "B3",
  "elements": [
   "Al",
   "As"
  ],
  "elementA": "Al",
  "elementB": "As",
  "a": 5.66
 },
 {
  "id": "B3-AlP",
  "name": "AlP",
  "kind": "B3",
  "elements": [
   "Al",
   "P"
  ],
  "elementA": "Al",
  "elementB": "P",
  "a": 5.46
 },
 {
  "id": "B3-AlSb",
  "name": "AlSb",
  "kind": "B3",
  "elements": [
   "Al",
   "Sb"
  ],
  "elementA": "Al",
  "elementB": "Sb",
  "a": 6.14
 },
 {
  "id": "B3-BP",
  "name": "BP",
  "kind": "B3",
  "elements": [
   "B",
   "P"
  ],
  "elementA": "B",
  "elementB": "P",
  "a": 4.54
 },
 {
  "id": "B3-BAs",
  "name": "BAs",
  "kind": "B3",
  "elements": [
   "B",
   "As"
  ],
  "elementA": "B",
  "elementB": "As",
  "a": 4.78
 },
 {
  "id": "B3-3C-SiC",
  "name": "3C-SiC",
  "kind": "B3",
  "elements": [
   "Si",
   "C"
  ],
  "elementA": "Si",
  "elementB": "C",
  "a": 4.36
 },
 {
  "id": "B3-c-BN",
  "name": "c-BN",
  "kind": "B3",
  "elements": [
   "B",
   "N"
  ],
  "elementA": "B",
  "elementB": "N",
  "a": 3.62
 },
 {
  "id": "B3-CuCl",
  "name": "CuCl",
  "kind": "B3",
  "elements": [
   "Cu",
   "Cl"
  ],
  "elementA": "Cu",
  "elementB": "Cl",
  "a": 5.42
 },
 {
  "id": "B3-CuBr",
  "name": "CuBr",
  "kind": "B3",
  "elements": [
   "Cu",
   "Br"
  ],
  "elementA": "Cu",
  "elementB": "Br",
  "a": 5.69
 },
 {
  "id": "B3-CuI",
  "name": "CuI",
  "kind": "B3",
  "elements": [
   "Cu",
   "I"
  ],
  "elementA": "Cu",
  "elementB": "I",
  "a": 6.05
 },
 {
  "id": "B4-ZnO",
  "name": "ZnO",
  "kind": "B4",
  "elements": [
   "Zn",
   "O"
  ],
  "elementA": "Zn",
  "elementB": "O",
  "a": 3.25,
  "cOverA": 1.603076923076923,
  "u": 0.382
 },
 {
  "id": "B4-ZnS",
  "name": "ZnS",
  "kind": "B4",
  "elements": [
   "Zn",
   "S"
  ],
  "elementA": "Zn",
  "elementB": "S",
  "a": 3.82,
  "cOverA": 1.6387434554973823,
  "u": 0.375
 },
 {
  "id": "B4-ZnSe",
  "name": "ZnSe",
  "kind": "B4",
  "elements": [
   "Zn",
   "Se"
  ],
  "elementA": "Zn",
  "elementB": "Se",
  "a": 4,
  "cOverA": 1.635,
  "u": 0.375
 },
 {
  "id": "B4-CdS",
  "name": "CdS",
  "kind": "B4",
  "elements": [
   "Cd",
   "S"
  ],
  "elementA": "Cd",
  "elementB": "S",
  "a": 4.14,
  "cOverA": 1.6231884057971016,
  "u": 0.377
 },
 {
  "id": "B4-CdSe",
  "name": "CdSe",
  "kind": "B4",
  "elements": [
   "Cd",
   "Se"
  ],
  "elementA": "Cd",
  "elementB": "Se",
  "a": 4.3,
  "cOverA": 1.630232558139535,
  "u": 0.376
 },
 {
  "id": "B4-GaN",
  "name": "GaN",
  "kind": "B4",
  "elements": [
   "Ga",
   "N"
  ],
  "elementA": "Ga",
  "elementB": "N",
  "a": 3.19,
  "cOverA": 1.626959247648903,
  "u": 0.377
 },
 {
  "id": "B4-AlN",
  "name": "AlN",
  "kind": "B4",
  "elements": [
   "Al",
   "N"
  ],
  "elementA": "Al",
  "elementB": "N",
  "a": 3.11,
  "cOverA": 1.6012861736334407,
  "u": 0.382
 },
 {
  "id": "B4-InN",
  "name": "InN",
  "kind": "B4",
  "elements": [
   "In",
   "N"
  ],
  "elementA": "In",
  "elementB": "N",
  "a": 3.54,
  "cOverA": 1.6101694915254237,
  "u": 0.379
 },
 {
  "id": "B4-BeO",
  "name": "BeO",
  "kind": "B4",
  "elements": [
   "Be",
   "O"
  ],
  "elementA": "Be",
  "elementB": "O",
  "a": 2.7,
  "cOverA": 1.622222222222222,
  "u": 0.378
 },
 {
  "id": "B4-MgTe",
  "name": "MgTe",
  "kind": "B4",
  "elements": [
   "Mg",
   "Te"
  ],
  "elementA": "Mg",
  "elementB": "Te",
  "a": 4.55,
  "cOverA": 1.6285714285714286,
  "u": 0.375
 },
 {
  "id": "fluorite-CaF2",
  "name": "CaF2",
  "kind": "fluorite",
  "elements": [
   "Ca",
   "F"
  ],
  "elementA": "Ca",
  "elementB": "F",
  "a": 5.46
 },
 {
  "id": "fluorite-SrF2",
  "name": "SrF2",
  "kind": "fluorite",
  "elements": [
   "Sr",
   "F"
  ],
  "elementA": "Sr",
  "elementB": "F",
  "a": 5.8
 },
 {
  "id": "fluorite-BaF2",
  "name": "BaF2",
  "kind": "fluorite",
  "elements": [
   "Ba",
   "F"
  ],
  "elementA": "Ba",
  "elementB": "F",
  "a": 6.2
 },
 {
  "id": "fluorite-PbF2",
  "name": "PbF2",
  "kind": "fluorite",
  "elements": [
   "Pb",
   "F"
  ],
  "elementA": "Pb",
  "elementB": "F",
  "a": 5.94
 },
 {
  "id": "fluorite-CdF2",
  "name": "CdF2",
  "kind": "fluorite",
  "elements": [
   "Cd",
   "F"
  ],
  "elementA": "Cd",
  "elementB": "F",
  "a": 5.39
 },
 {
  "id": "fluorite-CeO2",
  "name": "CeO2",
  "kind": "fluorite",
  "elements": [
   "Ce",
   "O"
  ],
  "elementA": "Ce",
  "elementB": "O",
  "a": 5.41
 },
 {
  "id": "fluorite-UO2",
  "name": "UO2",
  "kind": "fluorite",
  "elements": [
   "U",
   "O"
  ],
  "elementA": "U",
  "elementB": "O",
  "a": 5.47
 },
 {
  "id": "fluorite-ThO2",
  "name": "ThO2",
  "kind": "fluorite",
  "elements": [
   "Th",
   "O"
  ],
  "elementA": "Th",
  "elementB": "O",
  "a": 5.6
 },
 {
  "id": "fluorite-ZrO2",
  "name": "ZrO2",
  "kind": "fluorite",
  "elements": [
   "Zr",
   "O"
  ],
  "elementA": "Zr",
  "elementB": "O",
  "a": 5.09
 },
 {
  "id": "fluorite-HfO2",
  "name": "HfO2",
  "kind": "fluorite",
  "elements": [
   "Hf",
   "O"
  ],
  "elementA": "Hf",
  "elementB": "O",
  "a": 5.08
 },
 {
  "id": "fluorite-PuO2",
  "name": "PuO2",
  "kind": "fluorite",
  "elements": [
   "Pu",
   "O"
  ],
  "elementA": "Pu",
  "elementB": "O",
  "a": 5.4
 },
 {
  "id": "antifluorite-Li2O",
  "name": "Li2O",
  "kind": "antifluorite",
  "elements": [
   "Li",
   "O"
  ],
  "elementA": "Li",
  "elementB": "O",
  "a": 4.62
 },
 {
  "id": "antifluorite-Na2O",
  "name": "Na2O",
  "kind": "antifluorite",
  "elements": [
   "Na",
   "O"
  ],
  "elementA": "Na",
  "elementB": "O",
  "a": 5.55
 },
 {
  "id": "antifluorite-K2O",
  "name": "K2O",
  "kind": "antifluorite",
  "elements": [
   "K",
   "O"
  ],
  "elementA": "K",
  "elementB": "O",
  "a": 6.44
 },
 {
  "id": "antifluorite-Rb2O",
  "name": "Rb2O",
  "kind": "antifluorite",
  "elements": [
   "Rb",
   "O"
  ],
  "elementA": "Rb",
  "elementB": "O",
  "a": 6.74
 },
 {
  "id": "antifluorite-Mg2Si",
  "name": "Mg2Si",
  "kind": "antifluorite",
  "elements": [
   "Mg",
   "Si"
  ],
  "elementA": "Mg",
  "elementB": "Si",
  "a": 6.35
 },
 {
  "id": "antifluorite-Mg2Ge",
  "name": "Mg2Ge",
  "kind": "antifluorite",
  "elements": [
   "Mg",
   "Ge"
  ],
  "elementA": "Mg",
  "elementB": "Ge",
  "a": 6.39
 },
 {
  "id": "antifluorite-Mg2Sn",
  "name": "Mg2Sn",
  "kind": "antifluorite",
  "elements": [
   "Mg",
   "Sn"
  ],
  "elementA": "Mg",
  "elementB": "Sn",
  "a": 6.76
 },
 {
  "id": "antifluorite-Li2S",
  "name": "Li2S",
  "kind": "antifluorite",
  "elements": [
   "Li",
   "S"
  ],
  "elementA": "Li",
  "elementB": "S",
  "a": 5.72
 },
 {
  "id": "antifluorite-Na2S",
  "name": "Na2S",
  "kind": "antifluorite",
  "elements": [
   "Na",
   "S"
  ],
  "elementA": "Na",
  "elementB": "S",
  "a": 6.53
 },
 {
  "id": "rutile-TiO2",
  "name": "TiO2",
  "kind": "rutile",
  "elements": [
   "Ti",
   "O"
  ],
  "elementA": "Ti",
  "elementB": "O",
  "a": 4.59,
  "cOverA": 0.644880174291939,
  "u": 0.305
 },
 {
  "id": "rutile-SnO2",
  "name": "SnO2",
  "kind": "rutile",
  "elements": [
   "Sn",
   "O"
  ],
  "elementA": "Sn",
  "elementB": "O",
  "a": 4.74,
  "cOverA": 0.6729957805907173,
  "u": 0.306
 },
 {
  "id": "rutile-GeO2",
  "name": "GeO2",
  "kind": "rutile",
  "elements": [
   "Ge",
   "O"
  ],
  "elementA": "Ge",
  "elementB": "O",
  "a": 4.4,
  "cOverA": 0.6499999999999999,
  "u": 0.307
 },
 {
  "id": "rutile-PbO2",
  "name": "PbO2",
  "kind": "rutile",
  "elements": [
   "Pb",
   "O"
  ],
  "elementA": "Pb",
  "elementB": "O",
  "a": 4.96,
  "cOverA": 0.6834677419354839,
  "u": 0.306
 },
 {
  "id": "rutile-RuO2",
  "name": "RuO2",
  "kind": "rutile",
  "elements": [
   "Ru",
   "O"
  ],
  "elementA": "Ru",
  "elementB": "O",
  "a": 4.49,
  "cOverA": 0.6926503340757237,
  "u": 0.305
 },
 {
  "id": "rutile-IrO2",
  "name": "IrO2",
  "kind": "rutile",
  "elements": [
   "Ir",
   "O"
  ],
  "elementA": "Ir",
  "elementB": "O",
  "a": 4.51,
  "cOverA": 0.6984478935698448,
  "u": 0.306
 },
 {
  "id": "rutile-MnO2",
  "name": "MnO2",
  "kind": "rutile",
  "elements": [
   "Mn",
   "O"
  ],
  "elementA": "Mn",
  "elementB": "O",
  "a": 4.4,
  "cOverA": 0.6522727272727272,
  "u": 0.305
 },
 {
  "id": "rutile-VO2",
  "name": "VO2",
  "kind": "rutile",
  "elements": [
   "V",
   "O"
  ],
  "elementA": "V",
  "elementB": "O",
  "a": 4.55,
  "cOverA": 0.6285714285714286,
  "u": 0.307
 },
 {
  "id": "rutile-MgF2",
  "name": "MgF2",
  "kind": "rutile",
  "elements": [
   "Mg",
   "F"
  ],
  "elementA": "Mg",
  "elementB": "F",
  "a": 4.62,
  "cOverA": 0.6601731601731601,
  "u": 0.303
 },
 {
  "id": "rutile-MnF2",
  "name": "MnF2",
  "kind": "rutile",
  "elements": [
   "Mn",
   "F"
  ],
  "elementA": "Mn",
  "elementB": "F",
  "a": 4.87,
  "cOverA": 0.6796714579055442,
  "u": 0.305
 },
 {
  "id": "rutile-NiF2",
  "name": "NiF2",
  "kind": "rutile",
  "elements": [
   "Ni",
   "F"
  ],
  "elementA": "Ni",
  "elementB": "F",
  "a": 4.65,
  "cOverA": 0.6623655913978495,
  "u": 0.305
 },
 {
  "id": "rutile-ZnF2",
  "name": "ZnF2",
  "kind": "rutile",
  "elements": [
   "Zn",
   "F"
  ],
  "elementA": "Zn",
  "elementB": "F",
  "a": 4.7,
  "cOverA": 0.6659574468085105,
  "u": 0.305
 },
 {
  "id": "NiAs-NiAs",
  "name": "NiAs",
  "kind": "NiAs",
  "elements": [
   "Ni",
   "As"
  ],
  "elementA": "Ni",
  "elementB": "As",
  "a": 3.62,
  "cOverA": 1.3895027624309393
 },
 {
  "id": "NiAs-NiS",
  "name": "NiS",
  "kind": "NiAs",
  "elements": [
   "Ni",
   "S"
  ],
  "elementA": "Ni",
  "elementB": "S",
  "a": 3.44,
  "cOverA": 1.5552325581395348
 },
 {
  "id": "NiAs-MnTe",
  "name": "MnTe",
  "kind": "NiAs",
  "elements": [
   "Mn",
   "Te"
  ],
  "elementA": "Mn",
  "elementB": "Te",
  "a": 4.16,
  "cOverA": 1.6129807692307692
 },
 {
  "id": "NiAs-CrS",
  "name": "CrS",
  "kind": "NiAs",
  "elements": [
   "Cr",
   "S"
  ],
  "elementA": "Cr",
  "elementB": "S",
  "a": 3.48,
  "cOverA": 1.6091954022988504
 },
 {
  "id": "NiAs-FeS",
  "name": "FeS",
  "kind": "NiAs",
  "elements": [
   "Fe",
   "S"
  ],
  "elementA": "Fe",
  "elementB": "S",
  "a": 3.45,
  "cOverA": 1.6231884057971013
 },
 {
  "id": "NiAs-CoS",
  "name": "CoS",
  "kind": "NiAs",
  "elements": [
   "Co",
   "S"
  ],
  "elementA": "Co",
  "elementB": "S",
  "a": 3.37,
  "cOverA": 1.5311572700296736
 },
 {
  "id": "NiAs-PtSn",
  "name": "PtSn",
  "kind": "NiAs",
  "elements": [
   "Pt",
   "Sn"
  ],
  "elementA": "Pt",
  "elementB": "Sn",
  "a": 4.1,
  "cOverA": 1.324390243902439
 },
 {
  "id": "hBN-h-BN",
  "name": "h-BN",
  "kind": "hBN",
  "elements": [
   "B",
   "N"
  ],
  "elementA": "B",
  "elementB": "N",
  "a": 2.5,
  "cOverA": 2.664
 },
 {
  "id": "MoS2-MoS2",
  "name": "MoS2",
  "kind": "MoS2",
  "elements": [
   "Mo",
   "S"
  ],
  "elementA": "Mo",
  "elementB": "S",
  "a": 3.16,
  "cOverA": 3.892405063291139,
  "u": 0.621
 },
 {
  "id": "MoS2-WS2",
  "name": "WS2",
  "kind": "MoS2",
  "elements": [
   "W",
   "S"
  ],
  "elementA": "W",
  "elementB": "S",
  "a": 3.15,
  "cOverA": 3.9111111111111114,
  "u": 0.622
 },
 {
  "id": "MoS2-MoSe2",
  "name": "MoSe2",
  "kind": "MoS2",
  "elements": [
   "Mo",
   "Se"
  ],
  "elementA": "Mo",
  "elementB": "Se",
  "a": 3.29,
  "cOverA": 3.933130699088146,
  "u": 0.621
 },
 {
  "id": "MoS2-WSe2",
  "name": "WSe2",
  "kind": "MoS2",
  "elements": [
   "W",
   "Se"
  ],
  "elementA": "W",
  "elementB": "Se",
  "a": 3.28,
  "cOverA": 3.9512195121951224,
  "u": 0.621
 },
 {
  "id": "MoS2-MoTe2",
  "name": "MoTe2",
  "kind": "MoS2",
  "elements": [
   "Mo",
   "Te"
  ],
  "elementA": "Mo",
  "elementB": "Te",
  "a": 3.52,
  "cOverA": 3.96875,
  "u": 0.621
 },
 {
  "id": "MoS2-WTe2",
  "name": "WTe2",
  "kind": "MoS2",
  "elements": [
   "W",
   "Te"
  ],
  "elementA": "W",
  "elementB": "Te",
  "a": 3.48,
  "cOverA": 4.031609195402298,
  "u": 0.621
 },
 {
  "id": "MoS2-NbS2",
  "name": "NbS2",
  "kind": "MoS2",
  "elements": [
   "Nb",
   "S"
  ],
  "elementA": "Nb",
  "elementB": "S",
  "a": 3.31,
  "cOverA": 3.59214501510574,
  "u": 0.621
 },
 {
  "id": "MoS2-TaS2",
  "name": "TaS2",
  "kind": "MoS2",
  "elements": [
   "Ta",
   "S"
  ],
  "elementA": "Ta",
  "elementB": "S",
  "a": 3.31,
  "cOverA": 3.6555891238670695,
  "u": 0.621
 },
 {
  "id": "pyrite-FeS2",
  "name": "FeS2",
  "kind": "pyrite",
  "elements": [
   "Fe",
   "S"
  ],
  "elementA": "Fe",
  "elementB": "S",
  "a": 5.418
 },
 {
  "id": "pyrite-CoS2",
  "name": "CoS2",
  "kind": "pyrite",
  "elements": [
   "Co",
   "S"
  ],
  "elementA": "Co",
  "elementB": "S",
  "a": 5.54
 },
 {
  "id": "pyrite-NiS2",
  "name": "NiS2",
  "kind": "pyrite",
  "elements": [
   "Ni",
   "S"
  ],
  "elementA": "Ni",
  "elementB": "S",
  "a": 5.68
 },
 {
  "id": "pyrite-MnS2",
  "name": "MnS2",
  "kind": "pyrite",
  "elements": [
   "Mn",
   "S"
  ],
  "elementA": "Mn",
  "elementB": "S",
  "a": 6.1
 },
 {
  "id": "pyrite-RuS2",
  "name": "RuS2",
  "kind": "pyrite",
  "elements": [
   "Ru",
   "S"
  ],
  "elementA": "Ru",
  "elementB": "S",
  "a": 5.61
 },
 {
  "id": "pyrite-OsS2",
  "name": "OsS2",
  "kind": "pyrite",
  "elements": [
   "Os",
   "S"
  ],
  "elementA": "Os",
  "elementB": "S",
  "a": 5.62
 },
 {
  "id": "pyrite-PtP2",
  "name": "PtP2",
  "kind": "pyrite",
  "elements": [
   "Pt",
   "P"
  ],
  "elementA": "Pt",
  "elementB": "P",
  "a": 5.7
 },
 {
  "id": "pyrite-AuSb2",
  "name": "AuSb2",
  "kind": "pyrite",
  "elements": [
   "Au",
   "Sb"
  ],
  "elementA": "Au",
  "elementB": "Sb",
  "a": 6.66
 },
 {
  "id": "cuprite-Cu2O",
  "name": "Cu2O",
  "kind": "cuprite",
  "elements": [
   "Cu",
   "O"
  ],
  "elementA": "Cu",
  "elementB": "O",
  "a": 4.267
 },
 {
  "id": "cuprite-Ag2O",
  "name": "Ag2O",
  "kind": "cuprite",
  "elements": [
   "Ag",
   "O"
  ],
  "elementA": "Ag",
  "elementB": "O",
  "a": 4.72
 },
 {
  "id": "cdi2-CdI2",
  "name": "CdI2",
  "kind": "cdi2",
  "elements": [
   "Cd",
   "I"
  ],
  "elementA": "Cd",
  "elementB": "I",
  "a": 4.24,
  "cOverA": 1.6132075471698113
 },
 {
  "id": "cdi2-PbI2",
  "name": "PbI2",
  "kind": "cdi2",
  "elements": [
   "Pb",
   "I"
  ],
  "elementA": "Pb",
  "elementB": "I",
  "a": 4.56,
  "cOverA": 1.5328947368421055
 },
 {
  "id": "cdi2-MgI2",
  "name": "MgI2",
  "kind": "cdi2",
  "elements": [
   "Mg",
   "I"
  ],
  "elementA": "Mg",
  "elementB": "I",
  "a": 4.14,
  "cOverA": 1.6618357487922706
 },
 {
  "id": "cdi2-CoI2",
  "name": "CoI2",
  "kind": "cdi2",
  "elements": [
   "Co",
   "I"
  ],
  "elementA": "Co",
  "elementB": "I",
  "a": 3.96,
  "cOverA": 1.6818181818181819
 },
 {
  "id": "cdi2-FeI2",
  "name": "FeI2",
  "kind": "cdi2",
  "elements": [
   "Fe",
   "I"
  ],
  "elementA": "Fe",
  "elementB": "I",
  "a": 4.04,
  "cOverA": 1.6707920792079207
 },
 {
  "id": "cdi2-NiI2",
  "name": "NiI2",
  "kind": "cdi2",
  "elements": [
   "Ni",
   "I"
  ],
  "elementA": "Ni",
  "elementB": "I",
  "a": 3.89,
  "cOverA": 1.6915167095115682
 },
 {
  "id": "cdi2-TiS2",
  "name": "TiS2",
  "kind": "cdi2",
  "elements": [
   "Ti",
   "S"
  ],
  "elementA": "Ti",
  "elementB": "S",
  "a": 3.41,
  "cOverA": 1.6715542521994136
 },
 {
  "id": "cdi2-ZrS2",
  "name": "ZrS2",
  "kind": "cdi2",
  "elements": [
   "Zr",
   "S"
  ],
  "elementA": "Zr",
  "elementB": "S",
  "a": 3.66,
  "cOverA": 1.5901639344262295
 },
 {
  "id": "cdi2-SnS2",
  "name": "SnS2",
  "kind": "cdi2",
  "elements": [
   "Sn",
   "S"
  ],
  "elementA": "Sn",
  "elementB": "S",
  "a": 3.65,
  "cOverA": 1.6164383561643838
 },
 {
  "id": "cdi2-HfS2",
  "name": "HfS2",
  "kind": "cdi2",
  "elements": [
   "Hf",
   "S"
  ],
  "elementA": "Hf",
  "elementB": "S",
  "a": 3.64,
  "cOverA": 1.607142857142857
 },
 {
  "id": "corundum-Al2O3",
  "name": "Al2O3",
  "kind": "corundum",
  "elements": [
   "Al",
   "O"
  ],
  "elementA": "Al",
  "elementB": "O",
  "a": 4.76,
  "cOverA": 2.7289915966386555
 },
 {
  "id": "corundum-Fe2O3",
  "name": "Fe2O3",
  "kind": "corundum",
  "elements": [
   "Fe",
   "O"
  ],
  "elementA": "Fe",
  "elementB": "O",
  "a": 5.03,
  "cOverA": 2.7335984095427435
 },
 {
  "id": "corundum-Cr2O3",
  "name": "Cr2O3",
  "kind": "corundum",
  "elements": [
   "Cr",
   "O"
  ],
  "elementA": "Cr",
  "elementB": "O",
  "a": 4.95,
  "cOverA": 2.7434343434343433
 },
 {
  "id": "corundum-V2O3",
  "name": "V2O3",
  "kind": "corundum",
  "elements": [
   "V",
   "O"
  ],
  "elementA": "V",
  "elementB": "O",
  "a": 4.95,
  "cOverA": 2.8282828282828283
 },
 {
  "id": "corundum-Ti2O3",
  "name": "Ti2O3",
  "kind": "corundum",
  "elements": [
   "Ti",
   "O"
  ],
  "elementA": "Ti",
  "elementB": "O",
  "a": 5.15,
  "cOverA": 2.6485436893203884
 },
 {
  "id": "corundum-Ga2O3",
  "name": "Ga2O3",
  "kind": "corundum",
  "elements": [
   "Ga",
   "O"
  ],
  "elementA": "Ga",
  "elementB": "O",
  "a": 4.98,
  "cOverA": 2.6967871485943773
 },
 {
  "id": "perovskite-SrTiO3",
  "name": "SrTiO3",
  "kind": "perovskite",
  "elements": [
   "Sr",
   "Ti",
   "O"
  ],
  "elementA": "Sr",
  "elementB": "Ti",
  "elementC": "O",
  "a": 3.905
 },
 {
  "id": "perovskite-BaTiO3",
  "name": "BaTiO3",
  "kind": "perovskite",
  "elements": [
   "Ba",
   "Ti",
   "O"
  ],
  "elementA": "Ba",
  "elementB": "Ti",
  "elementC": "O",
  "a": 4.01
 },
 {
  "id": "perovskite-CaTiO3",
  "name": "CaTiO3",
  "kind": "perovskite",
  "elements": [
   "Ca",
   "Ti",
   "O"
  ],
  "elementA": "Ca",
  "elementB": "Ti",
  "elementC": "O",
  "a": 3.8
 },
 {
  "id": "perovskite-PbTiO3",
  "name": "PbTiO3",
  "kind": "perovskite",
  "elements": [
   "Pb",
   "Ti",
   "O"
  ],
  "elementA": "Pb",
  "elementB": "Ti",
  "elementC": "O",
  "a": 3.96
 },
 {
  "id": "perovskite-KNbO3",
  "name": "KNbO3",
  "kind": "perovskite",
  "elements": [
   "K",
   "Nb",
   "O"
  ],
  "elementA": "K",
  "elementB": "Nb",
  "elementC": "O",
  "a": 4.01
 },
 {
  "id": "perovskite-NaNbO3",
  "name": "NaNbO3",
  "kind": "perovskite",
  "elements": [
   "Na",
   "Nb",
   "O"
  ],
  "elementA": "Na",
  "elementB": "Nb",
  "elementC": "O",
  "a": 3.91
 },
 {
  "id": "perovskite-LaAlO3",
  "name": "LaAlO3",
  "kind": "perovskite",
  "elements": [
   "La",
   "Al",
   "O"
  ],
  "elementA": "La",
  "elementB": "Al",
  "elementC": "O",
  "a": 3.79
 },
 {
  "id": "perovskite-KTaO3",
  "name": "KTaO3",
  "kind": "perovskite",
  "elements": [
   "K",
   "Ta",
   "O"
  ],
  "elementA": "K",
  "elementB": "Ta",
  "elementC": "O",
  "a": 3.99
 },
 {
  "id": "perovskite-BaZrO3",
  "name": "BaZrO3",
  "kind": "perovskite",
  "elements": [
   "Ba",
   "Zr",
   "O"
  ],
  "elementA": "Ba",
  "elementB": "Zr",
  "elementC": "O",
  "a": 4.19
 },
 {
  "id": "perovskite-SrZrO3",
  "name": "SrZrO3",
  "kind": "perovskite",
  "elements": [
   "Sr",
   "Zr",
   "O"
  ],
  "elementA": "Sr",
  "elementB": "Zr",
  "elementC": "O",
  "a": 4.1
 },
 {
  "id": "perovskite-CaZrO3",
  "name": "CaZrO3",
  "kind": "perovskite",
  "elements": [
   "Ca",
   "Zr",
   "O"
  ],
  "elementA": "Ca",
  "elementB": "Zr",
  "elementC": "O",
  "a": 4.01
 },
 {
  "id": "perovskite-PbZrO3",
  "name": "PbZrO3",
  "kind": "perovskite",
  "elements": [
   "Pb",
   "Zr",
   "O"
  ],
  "elementA": "Pb",
  "elementB": "Zr",
  "elementC": "O",
  "a": 4.16
 },
 {
  "id": "perovskite-CsPbBr3",
  "name": "CsPbBr3",
  "kind": "perovskite",
  "elements": [
   "Cs",
   "Pb",
   "Br"
  ],
  "elementA": "Cs",
  "elementB": "Pb",
  "elementC": "Br",
  "a": 5.87
 },
 {
  "id": "perovskite-CsPbCl3",
  "name": "CsPbCl3",
  "kind": "perovskite",
  "elements": [
   "Cs",
   "Pb",
   "Cl"
  ],
  "elementA": "Cs",
  "elementB": "Pb",
  "elementC": "Cl",
  "a": 5.61
 },
 {
  "id": "perovskite-CsPbI3",
  "name": "CsPbI3",
  "kind": "perovskite",
  "elements": [
   "Cs",
   "Pb",
   "I"
  ],
  "elementA": "Cs",
  "elementB": "Pb",
  "elementC": "I",
  "a": 6.3
 },
 {
  "id": "perovskite-LaGaO3",
  "name": "LaGaO3",
  "kind": "perovskite",
  "elements": [
   "La",
   "Ga",
   "O"
  ],
  "elementA": "La",
  "elementB": "Ga",
  "elementC": "O",
  "a": 3.88
 },
 {
  "id": "perovskite-YAlO3",
  "name": "YAlO3",
  "kind": "perovskite",
  "elements": [
   "Y",
   "Al",
   "O"
  ],
  "elementA": "Y",
  "elementB": "Al",
  "elementC": "O",
  "a": 3.69
 },
 {
  "id": "perovskite-SrSnO3",
  "name": "SrSnO3",
  "kind": "perovskite",
  "elements": [
   "Sr",
   "Sn",
   "O"
  ],
  "elementA": "Sr",
  "elementB": "Sn",
  "elementC": "O",
  "a": 4.03
 },
 {
  "id": "spinel-MgAl2O4",
  "name": "MgAl2O4",
  "kind": "spinel",
  "elements": [
   "Mg",
   "Al",
   "O"
  ],
  "elementA": "Mg",
  "elementB": "Al",
  "elementC": "O",
  "a": 8.083
 },
 {
  "id": "spinel-ZnAl2O4",
  "name": "ZnAl2O4",
  "kind": "spinel",
  "elements": [
   "Zn",
   "Al",
   "O"
  ],
  "elementA": "Zn",
  "elementB": "Al",
  "elementC": "O",
  "a": 8.09
 },
 {
  "id": "spinel-FeAl2O4",
  "name": "FeAl2O4",
  "kind": "spinel",
  "elements": [
   "Fe",
   "Al",
   "O"
  ],
  "elementA": "Fe",
  "elementB": "Al",
  "elementC": "O",
  "a": 8.15
 },
 {
  "id": "spinel-CoAl2O4",
  "name": "CoAl2O4",
  "kind": "spinel",
  "elements": [
   "Co",
   "Al",
   "O"
  ],
  "elementA": "Co",
  "elementB": "Al",
  "elementC": "O",
  "a": 8.1
 },
 {
  "id": "spinel-MnAl2O4",
  "name": "MnAl2O4",
  "kind": "spinel",
  "elements": [
   "Mn",
   "Al",
   "O"
  ],
  "elementA": "Mn",
  "elementB": "Al",
  "elementC": "O",
  "a": 8.26
 },
 {
  "id": "spinel-NiAl2O4",
  "name": "NiAl2O4",
  "kind": "spinel",
  "elements": [
   "Ni",
   "Al",
   "O"
  ],
  "elementA": "Ni",
  "elementB": "Al",
  "elementC": "O",
  "a": 8.05
 },
 {
  "id": "spinel-MgCr2O4",
  "name": "MgCr2O4",
  "kind": "spinel",
  "elements": [
   "Mg",
   "Cr",
   "O"
  ],
  "elementA": "Mg",
  "elementB": "Cr",
  "elementC": "O",
  "a": 8.33
 },
 {
  "id": "spinel-ZnCr2O4",
  "name": "ZnCr2O4",
  "kind": "spinel",
  "elements": [
   "Zn",
   "Cr",
   "O"
  ],
  "elementA": "Zn",
  "elementB": "Cr",
  "elementC": "O",
  "a": 8.33
 },
 {
  "id": "spinel-CoCr2O4",
  "name": "CoCr2O4",
  "kind": "spinel",
  "elements": [
   "Co",
   "Cr",
   "O"
  ],
  "elementA": "Co",
  "elementB": "Cr",
  "elementC": "O",
  "a": 8.33
 },
 {
  "id": "spinel-MgFe2O4",
  "name": "MgFe2O4",
  "kind": "spinel",
  "elements": [
   "Mg",
   "Fe",
   "O"
  ],
  "elementA": "Mg",
  "elementB": "Fe",
  "elementC": "O",
  "a": 8.39
 },
 {
  "id": "spinel-ZnFe2O4",
  "name": "ZnFe2O4",
  "kind": "spinel",
  "elements": [
   "Zn",
   "Fe",
   "O"
  ],
  "elementA": "Zn",
  "elementB": "Fe",
  "elementC": "O",
  "a": 8.44
 },
 {
  "id": "spinel-NiFe2O4",
  "name": "NiFe2O4",
  "kind": "spinel",
  "elements": [
   "Ni",
   "Fe",
   "O"
  ],
  "elementA": "Ni",
  "elementB": "Fe",
  "elementC": "O",
  "a": 8.34
 },
 {
  "id": "spinel-MnFe2O4",
  "name": "MnFe2O4",
  "kind": "spinel",
  "elements": [
   "Mn",
   "Fe",
   "O"
  ],
  "elementA": "Mn",
  "elementB": "Fe",
  "elementC": "O",
  "a": 8.51
 },
 {
  "id": "calcite-CaCO3",
  "name": "CaCO3",
  "kind": "calcite",
  "elements": [
   "Ca",
   "C",
   "O"
  ],
  "elementA": "Ca",
  "elementB": "C",
  "elementC": "O",
  "a": 4.99,
  "cOverA": 3.418837675350701
 },
 {
  "id": "calcite-MgCO3",
  "name": "MgCO3",
  "kind": "calcite",
  "elements": [
   "Mg",
   "C",
   "O"
  ],
  "elementA": "Mg",
  "elementB": "C",
  "elementC": "O",
  "a": 4.66,
  "cOverA": 3.221030042918455
 },
 {
  "id": "calcite-FeCO3",
  "name": "FeCO3",
  "kind": "calcite",
  "elements": [
   "Fe",
   "C",
   "O"
  ],
  "elementA": "Fe",
  "elementB": "C",
  "elementC": "O",
  "a": 4.69,
  "cOverA": 3.2771855010660977
 },
 {
  "id": "calcite-MnCO3",
  "name": "MnCO3",
  "kind": "calcite",
  "elements": [
   "Mn",
   "C",
   "O"
  ],
  "elementA": "Mn",
  "elementB": "C",
  "elementC": "O",
  "a": 4.78,
  "cOverA": 3.2761506276150625
 },
 {
  "id": "calcite-ZnCO3",
  "name": "ZnCO3",
  "kind": "calcite",
  "elements": [
   "Zn",
   "C",
   "O"
  ],
  "elementA": "Zn",
  "elementB": "C",
  "elementC": "O",
  "a": 4.65,
  "cOverA": 3.2322580645161287
 },
 {
  "id": "calcite-CoCO3",
  "name": "CoCO3",
  "kind": "calcite",
  "elements": [
   "Co",
   "C",
   "O"
  ],
  "elementA": "Co",
  "elementB": "C",
  "elementC": "O",
  "a": 4.66,
  "cOverA": 3.2103004291845494
 },
 {
  "id": "calcite-NiCO3",
  "name": "NiCO3",
  "kind": "calcite",
  "elements": [
   "Ni",
   "C",
   "O"
  ],
  "elementA": "Ni",
  "elementB": "C",
  "elementC": "O",
  "a": 4.6,
  "cOverA": 3.2
 },
 {
  "id": "calcite-CdCO3",
  "name": "CdCO3",
  "kind": "calcite",
  "elements": [
   "Cd",
   "C",
   "O"
  ],
  "elementA": "Cd",
  "elementB": "C",
  "elementC": "O",
  "a": 4.92,
  "cOverA": 3.313008130081301
 },
 {
  "id": "zircon-ZrSiO4",
  "name": "ZrSiO4",
  "kind": "zircon",
  "elements": [
   "Zr",
   "Si",
   "O"
  ],
  "elementA": "Zr",
  "elementB": "Si",
  "elementC": "O",
  "a": 6.6,
  "cOverA": 0.9060606060606061
 },
 {
  "id": "zircon-HfSiO4",
  "name": "HfSiO4",
  "kind": "zircon",
  "elements": [
   "Hf",
   "Si",
   "O"
  ],
  "elementA": "Hf",
  "elementB": "Si",
  "elementC": "O",
  "a": 6.56,
  "cOverA": 0.9054878048780489
 },
 {
  "id": "zircon-ThSiO4",
  "name": "ThSiO4",
  "kind": "zircon",
  "elements": [
   "Th",
   "Si",
   "O"
  ],
  "elementA": "Th",
  "elementB": "Si",
  "elementC": "O",
  "a": 7.13,
  "cOverA": 0.8863955119214587
 },
 {
  "id": "zircon-USiO4",
  "name": "USiO4",
  "kind": "zircon",
  "elements": [
   "U",
   "Si",
   "O"
  ],
  "elementA": "U",
  "elementB": "Si",
  "elementC": "O",
  "a": 6.99,
  "cOverA": 0.8955650929899857
 }
];
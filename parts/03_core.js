/* ================= 常量与数据 ================= */
const RING_R = MOLECULE_DATA.ringR;
const ELEMENTS = {
  H:  { color:0xdfe6ee, ball:0.26, sigma:0.60, base:0.80, emissive:0.04 },
  C:  { color:0x9aa5b1, ball:0.38, sigma:0.80, base:1.55, emissive:0.07 },
  N:  { color:0x4d7cff, ball:0.36, sigma:0.78, base:2.10, emissive:0.30 },
  O:  { color:0xff5a52, ball:0.34, sigma:0.76, base:2.30, emissive:0.28 },
  F:  { color:0x8fe388, ball:0.32, sigma:0.72, base:2.50, emissive:0.18 },
  Cl: { color:0x63d69a, ball:0.44, sigma:0.92, base:2.40, emissive:0.16 },
};
/* 元素表未覆盖的原子（导入 Cube 可能含 S/P/Br/I/金属等）：安全的中性回退显示，绝不因单个未知元素崩溃 */
const UNKNOWN_ELEMENT = { color:0x9aa5b1, ball:0.38, sigma:0.80, base:1.55, emissive:0.07 };
function elementInfo(el){ return ELEMENTS[el] || UNKNOWN_ELEMENT; }
const GROUPS = {
  CH3:  { name:"Methyl",            zh:"甲基",     sigmaM:-0.07, sigmaP:-0.17, sigmaPlus:-0.31, sigmaMinus:-0.17, sigmaI:-0.01, desc:"弱 +I（σI≈0）+ 超共轭 +M（σR≈-0.14）：向邻/对位弱给电子。" },
  OH:   { name:"Hydroxyl",          zh:"羟基",     sigmaM:+0.12, sigmaP:-0.37, sigmaPlus:-0.92, sigmaMinus:-0.37, sigmaI:+0.25, desc:"−I（σI=+0.25）+ 强 +M（σR≈-0.43）：氧孤对电子经 π 共轭向邻/对位强给电子。" },
  OMe:  { name:"Methoxy",           zh:"甲氧基",   sigmaM:+0.12, sigmaP:-0.27, sigmaPlus:-0.78, sigmaMinus:-0.27, sigmaI:+0.30, desc:"−I（σI=+0.30）+ 强 +M（σR≈-0.33）。" },
  NH2:  { name:"Amino",             zh:"氨基",     sigmaM:-0.16, sigmaP:-0.66, sigmaPlus:-1.30, sigmaMinus:-0.66, sigmaI:+0.12, desc:"−I（σI=+0.12）+ 最强 +M（σR≈-0.58，推-拉时增强至 -1.2）。" },
  F:    { name:"Fluoro",            zh:"氟",       sigmaM:+0.34, sigmaP:+0.06, sigmaPlus:-0.07, sigmaMinus:+0.06, sigmaI:+0.54, desc:"强 −I（σI=+0.54）主导；π 给电子被掩盖（σp≈0，对位近中性），总效应吸电子。" },
  Cl:   { name:"Chloro",            zh:"氯",       sigmaM:+0.37, sigmaP:+0.23, sigmaPlus:+0.11, sigmaMinus:+0.23, sigmaI:+0.47, desc:"−I（σI=+0.47）主导；弱 +M。总效应吸电子。" },
  CF3:  { name:"Trifluoromethyl",   zh:"三氟甲基", sigmaM:+0.43, sigmaP:+0.54, sigmaPlus:+0.61, sigmaMinus:+0.54, sigmaI:+0.42, desc:"强 −I（σI=+0.42），无有效 π 共轭（σp>σm 源于偶极/场效应）。" },
  CN:   { name:"Cyano",             zh:"氰基",     sigmaM:+0.56, sigmaP:+0.66, sigmaPlus:+0.66, sigmaMinus:+1.00, sigmaI:+0.57, desc:"−I（σI=+0.57）+ −M（σR 常态 +0.38，推-拉时增强至 +0.72）。" },
  NO2:  { name:"Nitro",             zh:"硝基",     sigmaM:+0.71, sigmaP:+0.78, sigmaPlus:+0.79, sigmaMinus:+1.27, sigmaI:+0.67, desc:"强 −I（σI=+0.67）+ 强 −M（σR 常态 +0.42，推-拉时增强至 +0.92）。" },
  CHO:  { name:"Formyl",            zh:"醛基",     sigmaM:+0.35, sigmaP:+0.42, sigmaPlus:+0.73, sigmaMinus:+1.03, sigmaI:+0.30, desc:"−I（σI=+0.30）+ −M（σR 常态 +0.24，推-拉时增强至 +0.85）。" },
  COOH: { name:"Carboxyl",          zh:"羧基",     sigmaM:+0.37, sigmaP:+0.45, sigmaPlus:+0.45, sigmaMinus:+0.75, sigmaI:+0.30, desc:"−I（σI=+0.30）+ −M（σR 常态 +0.27，推-拉时增强至 +0.57）。" },
};
const GROUP_KEYS = ["CH3","OH","OMe","NH2","F","Cl","CF3","CN","NO2","CHO","COOH"];
const MODE_COLORS = {
  total:     { a:[0.49,0.76,1.00], b:[0.82,0.92,1.00] },
  inductive: { a:[1.00,0.70,0.36], b:[1.00,0.86,0.64] },
  resonance: { a:[0.72,0.58,1.00], b:[0.90,0.83,1.00] },
};
const MODE_LABEL = { total:"Total", inductive:"Inductive", resonance:"Resonance" };
const FX_MODE = { total:{i:1,r:1}, inductive:{i:1,r:0}, resonance:{i:0,r:1} };
const QUALITY = {
  LITE:   { count: 12000,  bloom: 0.00, radius: 0.50, threshold: 0.60, psize: 0.050 },
  LOW:    { count: 40000,  bloom: 0.35, radius: 0.50, threshold: 0.50, psize: 0.042 },
  MEDIUM: { count: 80000,  bloom: 0.42, radius: 0.55, threshold: 0.47, psize: 0.038 },
  HIGH:   { count: 160000, bloom: 0.50, radius: 0.55, threshold: 0.45, psize: 0.034 },
  ULTRA:  { count: 300000, bloom: 0.60, radius: 0.62, threshold: 0.42, psize: 0.031 },
};
const QUALITY_ORDER = ["LOW","MEDIUM","HIGH","ULTRA"];
const MOLECULE_LIST = Object.keys(MOLECULE_DATA.molecules).map(function (k) {
  const m = MOLECULE_DATA.molecules[k];
  return { key:k, name:m.name, zh:m.zh, formula:m.formula, fragments:m.fragments };
});
const SETTINGS = {
  mode:"total", quality:"HIGH",
  transDur:2.6, noiseAmp:0.16, breathAmp:0.055, flowAmp:0.9, cloudAlpha:0.6,
  indScale:1.0, resScale:1.0,
  colormap:"plasma", densGamma:1.0,
  sigmaK:1.4,
};
let seededRand = mulberry32(20260828);

function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
function mulberry32(seed){
  let a = seed >>> 0;
  return function(){
    a += 0x6D2B79F5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(rand){ const u = Math.max(rand(), 1e-9); const v = rand(); return Math.sqrt(-2*Math.log(u)) * Math.cos(2*Math.PI*v); }
function randUnit(rand){
  let x = gauss(rand), y = gauss(rand), z = gauss(rand);
  const l = Math.hypot(x,y,z) + 1e-9;
  return [x/l, y/l, z/l];
}
function v3sub(a,b){ return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
function v3len(a){ return Math.hypot(a[0],a[1],a[2]); }
function ringSteps(a,b){ const d = Math.abs(a-b) % 6; return Math.min(d, 6-d); }
function rotZ2(p, th){ const c = Math.cos(th), s = Math.sin(th); return [p[0]*c - p[1]*s, p[0]*s + p[1]*c, p[2]]; }
function ringPos(k){ const a = Math.PI/180 * (30 + 60*k); return [RING_R*Math.cos(a), RING_R*Math.sin(a), 0]; }
function easeOutCubic(t){ return 1 - Math.pow(1-t, 3); }
function easeInCubic(t){ return t*t*t; }
function easeInOutCubic(t){ return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }
function easeOutBack(t){
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3*Math.pow(t-1, 3) + c1*Math.pow(t-1, 2);
}
function overallVerdict(g){
  const net = g.sigmaP;
  if (net < -0.1) return "净给电子（electron-donating）";
  if (net > 0.1) return "净吸电子（electron-withdrawing）";
  return "混合 / 弱效应（mixed）";
}
function signLabel(v){ return v > 0 ? "+" : v < 0 ? "−" : ""; }

/* ================= 分子构建 ================= */
function buildMolecule(fragList){
  const frags = (fragList || []).slice().sort(function (a,b){ return a.pos - b.pos; });
  const atoms = [], bonds = [];
  const used = new Set(frags.map(function (f){ return f.pos; }));
  for (let k=0;k<6;k++){
    const p = ringPos(k);
    atoms.push({ el:"C", pos:[p[0],p[1],p[2]], key:"R"+k+"C", ringPos:k, fragId:-1, localIdx:-1 });
    bonds.push({ i:k, j:(k+1)%6, order:1.5 });
  }
  for (let k=0;k<6;k++){
    if (used.has(k)) continue;
    const p = ringPos(k);
    const r = (RING_R + 1.086) / RING_R;
    atoms.push({ el:"H", pos:[p[0]*r, p[1]*r, 0], key:"R"+k+"H", ringPos:k, fragId:-1, localIdx:-1 });
    bonds.push({ i:k, j:atoms.length-1, order:1 });
  }
  for (let fi=0; fi<frags.length; fi++){
    const f = frags[fi];
    const gd = MOLECULE_DATA.fragments[f.group];
    const th = Math.PI/180 * (30 + 60*f.pos);
    const rp = ringPos(f.pos);
    const base = atoms.length;
    for (let li=0; li<gd.atoms.length; li++){
      const a = gd.atoms[li];
      const q = rotZ2(a.p, th);
      atoms.push({ el:a.el, pos:[q[0]+rp[0], q[1]+rp[1], q[2]], key:f.group+"@"+f.pos+"#"+li, ringPos:f.pos, fragId:fi, localIdx:li, fragGroup:f.group });
    }
    for (const b of gd.bonds) bonds.push({ i:base+b[0], j:base+b[1], order:b[2] });
    bonds.push({ i:f.pos, j:base, order:1 });
  }
  for (const f of frags) f.atomIdx = f.pos;
  return { atoms:atoms, bonds:bonds, fragments:frags };
}
function bondKey(aKey, bKey, order){
  return (aKey < bKey ? aKey + "|" + bKey : bKey + "|" + aKey) + "#" + order;
}

/* ================= 碳架本征电子密度基线（创造模式） ================= */
/* 半定量依据（文献数据，非编造）：
   · 杂化因子 R —— 轨道电负性随 s 成分增大（Bent's rule；sp>sp²>sp³）：
     Hinze & Jaffé (1962) 轨道电负性（Mulliken, eV）：C(sp3)=7.98, C(sp2)=8.79, C(sp)=10.39
     → 相对值 1.000 : 1.101 : 1.302（高电负性碳吸附更多 σ 电子密度）
   · C–H 极化 —— Pauling 电负性 C(2.55) > H(2.20)：每个 C–H 键把电子密度向碳偏移，
     故 CH3 富 > CH2 > CH > C（季碳最贫）；幅度 CH_POLAR 为校准常数（每键 +7%），
     量级锚定文献典型烷烃碳部分电荷差异（ESP/Mulliken：propane CH3 明显负于 CH2，约几 %）
   · 芳香/烯 sp² 碳由 R 因子统一抬升；苯环六位相等（初始态均匀，符合化学事实） */
const SKELETON_BASIS = { SP3: 1.000, SP2: 1.101, SP: 1.302, CH_POLAR: 0.07 };
function skeletonBaseline(mol){
  const n = mol.atoms.length;
  const base = new Float64Array(n);
  for (let i = 0; i < n; i++){
    base[i] = 1;
    if (mol.atoms[i].el !== "C") continue;
    let maxO = 0, nH = 0;
    for (const b of mol.bonds){
      let o = -1;
      if (b.i === i) o = b.j; else if (b.j === i) o = b.i;
      if (o >= 0){
        if (b.order > maxO) maxO = b.order;
        if (mol.atoms[o].el === "H") nH++;
      }
    }
    // 杂化电负性按真实 π 键判定（sp³/sp²/sp；四根单键 = sp³）
    const R = maxO >= 3 ? SKELETON_BASIS.SP : maxO >= 1.5 ? SKELETON_BASIS.SP2 : SKELETON_BASIS.SP3;
    base[i] = R * (1 + SKELETON_BASIS.CH_POLAR * nH);
  }
  return base;
}

/* ================= 化学引擎（半定量虚拟电子势场） ================= */
function computeField(mol, mode){
  const atoms = mol.atoms, bonds = mol.bonds, frags = mol.fragments;
  const n = atoms.length;
  // σ 数据驱动（LFER 理论）：Taft/Hammett 常数 + 位置加和 + 推-拉增强
  //   · 间位 = σ_m（实测，近似纯诱导）
  //   · 邻/对位 = 诱导(σ_m 位置衰减) + 共振(σR_model，由 σ_p 校准)
  //   · 因子 = exp(-K·Σσ)：σ 为 log 尺度 → 密度乘性、天然饱和、不会为负
  const ind = new Float64Array(n), res = new Float64Array(n);
  let hasDonor = false, hasAcceptor = false;
  for (const f of frags){
    const g = GROUPS[f.group];
    if (g.sigmaPlus < g.sigmaP) hasDonor = true;   // 有 σ⁺ 增强能力 → 共振供体
    if (g.sigmaMinus > g.sigmaP) hasAcceptor = true; // 有 σ⁻ 增强能力 → 共振受体
  }
  const IND_D = [3.0, 1.8, 1.0, 0.5, 0.25, 0.125]; // σ_m 的位置衰减（d=0..5，链上继续衰减）
  // 碳-碳邻接：诱导沿全部 C–C 键传播（距离衰减）
  const ccAdj = new Array(n).fill(null).map(function(){ return []; });
  for (const b of bonds){
    if (atoms[b.i].el === "C" && atoms[b.j].el === "C"){
      ccAdj[b.i].push(b.j);
      ccAdj[b.j].push(b.i);
    }
  }
  // 共轭网络（π）：共振只沿 π 体系传播——含 π 键的碳（sp²/sp）及连接两个 π 碳的单键；
  // 饱和 sp³ 碳不在共轭网络内（取代基在烷烃上无共振，只有诱导，符合化学事实）
  const hasPi = new Array(n).fill(false);
  for (let i = 0; i < n; i++){
    if (atoms[i].el !== "C") continue;
    let mo = 0;
    for (const b of bonds){
      if ((b.i === i || b.j === i) && b.order > mo) mo = b.order;
    }
    if (mo >= 1.5) hasPi[i] = true; // 双键/三键/芳香键
  }
  const piAdj = new Array(n).fill(null).map(function(){ return []; });
  for (const b of bonds){
    if (atoms[b.i].el === "C" && atoms[b.j].el === "C" && hasPi[b.i] && hasPi[b.j]){
      piAdj[b.i].push(b.j);
      piAdj[b.j].push(b.i);
    }
  }
  function bfsOn(adj, src){
    const dist = new Int32Array(n);
    dist.fill(-1);
    const queue = [src];
    dist[src] = 0;
    for (let qi = 0; qi < queue.length; qi++){
      const cur = queue[qi];
      for (const nb of adj[cur]){
        if (dist[nb] === -1){ dist[nb] = dist[cur] + 1; queue.push(nb); }
      }
    }
    return dist;
  }
  frags.forEach(function (f, fi){
    const g = GROUPS[f.group];
    const src = f.atomIdx;
    if (src === undefined) return;
    // 推-拉增强（Yukawa–Tsuno）：受体在供体存在时用 σ⁻，供体在受体存在时用 σ⁺
    let sigmaP = g.sigmaP;
    if (g.sigmaMinus > g.sigmaP && hasDonor) sigmaP = g.sigmaMinus;
    else if (g.sigmaPlus < g.sigmaP && hasAcceptor) sigmaP = g.sigmaPlus;
    const sigmaR = sigmaP - 0.5 * g.sigmaM; // 校准共振常数（para 精确复现 σ_p）
    // 诱导：沿全部 C–C 键的距离衰减（σ_m）
    const dInd = bfsOn(ccAdj, src);
    for (let i = 0; i < n; i++){
      if (atoms[i].el === "C" && dInd[i] >= 0){
        ind[i] += g.sigmaM * IND_D[Math.min(dInd[i], 5)];
      }
    }
    // 共振：仅沿共轭网络传播；ipso 碳无 π（sp³）→ 该取代基无共振项
    if (hasPi[src]){
      const dRes = bfsOn(piAdj, src);
      for (let i = 0; i < n; i++){
        if (atoms[i].el === "C" && dRes[i] >= 0){
          if (dRes[i] === 0) res[i] += sigmaR * 0.7;        // ipso
          else if (dRes[i] % 2 === 1) res[i] += sigmaR;     // 奇距离 = 邻/对式共振活化位
        }
      }
    }
    for (let i = 0; i < n; i++){
      const a = atoms[i];
      if (a.fragId === fi){
        ind[i] += -g.sigmaI * 0.6;
        res[i] += -sigmaR * 0.5;
      }
    }
  });
  const fm = FX_MODE[mode];
  const fI = fm.i * SETTINGS.indScale, fR = fm.r * SETTINGS.resScale;
  const K = SETTINGS.sigmaK;
  const factor = new Float64Array(n);
  const w = new Float64Array(n);
  for (let i = 0; i < n; i++){
    const s = fI * ind[i] + fR * res[i];
    factor[i] = clamp(Math.exp(-K * s), 0.05, 4.0);
    w[i] = clamp(elementInfo(atoms[i].el).base * factor[i], 0.05, 4.0);
  }
  // 创造模式：乘入碳架本征基线（杂化 + C–H 极化）——初始碳架密度即不均匀，
  // 取代基 σ 效应在基线上叠加；预置分子保持「苯环=1.00」规范不变
  if (mol.isCustom){
    const base = skeletonBaseline(mol);
    for (let i = 0; i < n; i++){
      factor[i] = clamp(factor[i] * base[i], 0.05, 4.0);
      w[i] = clamp(elementInfo(atoms[i].el).base * factor[i], 0.05, 4.0);
    }
  }
  const src = [];
  let maxW = 1e-6;
  for (let i=0;i<n;i++){
    const a = atoms[i];
    src.push({ kind:0, p:a.pos, s:ELEMENTS[a.el].sigma, w:w[i] });
    if (w[i] > maxW) maxW = w[i];
  }
  for (const b of bonds){
    const isPi = b.order >= 1.5;
    let mf;
    if (mode === "inductive") mf = isPi ? 0.18 : 1.35;
    else if (mode === "resonance") mf = isPi ? 1.60 : 0.40;
    else mf = isPi ? 1.15 : 0.85;
    const bw = b.order * mf;
    src.push({ kind:1, a:atoms[b.i].pos, b:atoms[b.j].pos, s:0.30, w:bw });
    if (bw > maxW) maxW = bw;
  }
  return { src:src, maxW:maxW, w:w, factor:factor };
}

/* ================= 电子密度着色（科学色图） ================= */
/* 色图规范：matplotlib 感知均匀色图（plasma/inferno/viridis，BSD License）
   + ChimeraX/PyMOL 风格静电势蓝↔红（coolwarm）+ 自研深蓝→青→白（ice） */
const COLORMAPS = {
  plasma:   { name:"Plasma (matplotlib)", stops:[[0.0,[13,8,135]],[0.16,[70,3,159]],[0.32,[110,0,168]],[0.46,[156,21,152]],[0.6,[192,45,118]],[0.74,[220,88,87]],[0.88,[240,155,62]],[1.0,[249,251,26]]] },
  inferno:  { name:"Inferno (matplotlib)", stops:[[0.0,[0,0,4]],[0.2,[66,10,104]],[0.4,[147,38,103]],[0.6,[221,81,58]],[0.8,[252,165,10]],[1.0,[252,255,164]]] },
  viridis:  { name:"Viridis (matplotlib)", stops:[[0.0,[68,1,84]],[0.2,[65,68,135]],[0.4,[42,120,142]],[0.6,[34,168,132]],[0.8,[122,209,81]],[1.0,[253,231,37]]] },
  coolwarm: { name:"Cool-Warm (静电势规范)", stops:[[0.0,[59,76,192]],[0.5,[230,232,238]],[1.0,[180,4,38]]] },
  ice:      { name:"Cyan Glow (深蓝→青→白)", stops:[[0.0,[6,26,66]],[0.35,[16,92,168]],[0.62,[50,155,214]],[0.82,[140,225,255]],[1.0,[255,255,255]]] },
};
function sampleStops(stops, t){
  if (t <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++){
    if (t <= stops[i][0]){
      const s0 = stops[i-1], s1 = stops[i];
      const f = (t - s0[0]) / (s1[0] - s0[0]);
      return [s0[1][0] + (s1[1][0]-s0[1][0])*f, s0[1][1] + (s1[1][1]-s0[1][1])*f, s0[1][2] + (s1[1][2]-s0[1][2])*f];
    }
  }
  return stops[stops.length-1][1];
}
function colormapCSS(stops){
  const parts = [];
  for (let i = 0; i <= 12; i++){
    const c = sampleStops(stops, i / 12);
    parts.push("rgb(" + Math.round(c[0]) + "," + Math.round(c[1]) + "," + Math.round(c[2]) + ")");
  }
  return "linear-gradient(90deg, " + parts.join(", ") + ")";
}
/* 体素密度场：把半定量电子势场采样到网格；粒子取对数归一化密度（体渲染常用对数压缩） */
function buildDensityGrid(field){
  // 固定对数标度（体渲染惯例）：以苯环核心≈1 为基准，保证不同分子/取代状态间颜色可比
  const N = 36, half = 4.8;
  const cell = (2 * half) / (N - 1);
  const vMax = Math.log1p(1.6);
  const data = new Float32Array(N * N * N);
  let idx = 0;
  for (let iz = 0; iz < N; iz++){
    const z = -half + iz * cell;
    for (let iy = 0; iy < N; iy++){
      const y = -half + iy * cell;
      for (let ix = 0; ix < N; ix++){
        data[idx++] = clamp(Math.log1p(fieldValue(field, -half + ix * cell, y, z)) / vMax, 0, 1);
      }
    }
  }
  return { data: data, N: N, cell: cell, half: half };
}
function fieldValue(field, x, y, z){
  let v = 0;
  for (let si = 0; si < field.src.length; si++){
    const s = field.src[si];
    if (s.kind === 0){
      const dx = x - s.p[0], dy = y - s.p[1], dz = z - s.p[2];
      v += s.w * Math.exp(-(dx*dx + dy*dy + dz*dz) / (s.s * s.s));
    } else {
      const ax = s.a[0], ay = s.a[1], az = s.a[2];
      const bx = s.b[0], by = s.b[1], bz = s.b[2];
      const dxx = bx - ax, dyy = by - ay, dzz = bz - az;
      const len2 = dxx*dxx + dyy*dyy + dzz*dzz + 1e-9;
      let t = ((x-ax)*dxx + (y-ay)*dyy + (z-az)*dzz) / len2;
      t = clamp(t, 0, 1);
      const px = ax + dxx*t, py = ay + dyy*t, pz = az + dzz*t;
      const dx = x - px, dy = y - py, dz = z - pz;
      v += s.w * Math.exp(-(dx*dx + dy*dy + dz*dz) / (s.s * s.s));
    }
  }
  return v;
}
function gridDensity(grid, x, y, z){
  const N = grid.N, cell = grid.cell, half = grid.half;
  const fx = clamp((x + half) / cell, 0, N - 1.0001);
  const fy = clamp((y + half) / cell, 0, N - 1.0001);
  const fz = clamp((z + half) / cell, 0, N - 1.0001);
  const ix = Math.floor(fx), iy = Math.floor(fy), iz = Math.floor(fz);
  const tx = fx - ix, ty = fy - iy, tz = fz - iz;
  const s2 = N * N;
  const i000 = (iz * N + iy) * N + ix;
  const d = grid.data;
  const c000 = d[i000], c100 = d[i000+1], c010 = d[i000+N], c110 = d[i000+N+1];
  const c001 = d[i000+s2], c101 = d[i000+s2+1], c011 = d[i000+s2+N], c111 = d[i000+s2+N+1];
  const c00 = c000*(1-tx) + c100*tx;
  const c10 = c010*(1-tx) + c110*tx;
  const c01 = c001*(1-tx) + c101*tx;
  const c11 = c011*(1-tx) + c111*tx;
  const c0 = c00*(1-ty) + c10*ty;
  const c1 = c01*(1-ty) + c11*ty;
  return clamp(c0*(1-tz) + c1*tz, 0, 1);
}
/* ================= 粒子目标分布采样 ================= */
function sampleCloud(field, count, oldPos, grid){
  const src = field.src, maxW = field.maxW;
  const cdf = new Float64Array(src.length);
  let total = 0;
  for (let si=0; si<src.length; si++){
    const s = src[si];
    let wv;
    if (s.kind === 0) wv = s.w * s.s * s.s * s.s;
    else { const L = v3len(v3sub(s.b, s.a)); wv = s.w * L * s.s * s.s; }
    total += wv;
    cdf[si] = total;
  }
  const pos = new Float32Array(count*3);
  const size = new Float32Array(count);
  const bright = new Float32Array(count);
  const density = new Float32Array(count);
  const seed = new Float32Array(count*3);
  const delay = new Float32Array(count);
  for (let i=0;i<count;i++){
    let r = seededRand() * total;
    let lo = 0, hi = src.length - 1;
    while (lo < hi){ const mid = (lo + hi) >> 1; if (cdf[mid] < r) lo = mid + 1; else hi = mid; }
    const s = src[lo];
    let px, py, pz;
    if (s.kind === 0){
      px = s.p[0] + gauss(seededRand)*s.s;
      py = s.p[1] + gauss(seededRand)*s.s;
      pz = s.p[2] + gauss(seededRand)*s.s;
    } else {
      const tt = seededRand();
      const d = v3sub(s.b, s.a);
      const u = randUnit(seededRand);
      const rad = gauss(seededRand) * s.s;
      px = s.a[0] + d[0]*tt + u[0]*rad;
      py = s.a[1] + d[1]*tt + u[1]*rad;
      pz = s.a[2] + d[2]*tt + u[2]*rad;
    }
    const kf = oldPos ? 0.18 + 0.30*seededRand() : 0;
    if (kf > 0 && oldPos){
      const oi = i*3;
      px = px*(1-kf) + oldPos[oi]*kf;
      py = py*(1-kf) + oldPos[oi+1]*kf;
      pz = pz*(1-kf) + oldPos[oi+2]*kf;
    }
    const rel = clamp(s.w / maxW, 0.05, 1.6);
    pos[i*3] = px; pos[i*3+1] = py; pos[i*3+2] = pz;
    size[i] = 0.55 + seededRand()*0.75 + 0.35*Math.min(rel, 1.0);
    bright[i] = clamp(0.08 + 0.24*rel + seededRand()*0.18, 0.05, 0.5);
    density[i] = grid ? gridDensity(grid, px, py, pz) : clamp(s.w / maxW, 0, 1);
    seed[i*3] = seededRand(); seed[i*3+1] = seededRand(); seed[i*3+2] = seededRand();
    delay[i] = 0;
  }
  return { pos:pos, size:size, bright:bright, density:density, seed:seed, delay:delay };
}


/* ================= 创造模式：自由碳架 → 分子对象 ================= */
/* graph: { pts:[[x,y],...]（3D 坐标，z=0，六方格距=1.4Å）, bonds:[[i,j],...], groups:[{i,group}] } */
/* 芳香环检测（Hückel 4n+2）：枚举简单环，环长 6/10/14…（4n+2）且键序沿环严格
   交替 1,2,1,2…（Kekulé 画法）→ 整环键升为芳香 1.5。环烷（全单键）保持 sp³，
   4n 反芳香环（如环丁二烯）保持 Kekulé 不转化。 */
function findAromaticBonds(bonds, n){
  const adj = new Array(n).fill(null).map(function(){ return []; });
  for (let bi = 0; bi < bonds.length; bi++){
    adj[bonds[bi][0]].push({ nb: bonds[bi][1], bi: bi });
    adj[bonds[bi][1]].push({ nb: bonds[bi][0], bi: bi });
  }
  const aro = new Set();
  const seen = new Set();
  const onBond = new Uint8Array(bonds.length);
  const onNode = new Uint8Array(n);
  const path = [];
  function dfs(s, v, parentBi){
    for (const e of adj[v]){
      if (e.bi === parentBi) continue;
      if (e.nb === s && path.length >= 3){
        const cyc = path.slice().concat(e.bi);
        const key = cyc.slice().sort(function (a, b){ return a - b; }).join(",");
        if (!seen.has(key)){
          seen.add(key);
          const orders = cyc.map(function (bi2){ return bonds[bi2][2] || 1; });
          const alt = orders.every(function (o){ return o === 1 || o === 2; })
            && orders.every(function (o, k){ return o !== orders[(k + 1) % orders.length]; });
          if (alt && (cyc.length - 2) % 4 === 0) cyc.forEach(function (bi2){ aro.add(bi2); });
        }
      } else if (e.nb > s && !onBond[e.bi] && !onNode[e.nb]){
        onBond[e.bi] = 1; onNode[e.nb] = 1; path.push(e.bi);
        dfs(s, e.nb, e.bi);
        path.pop(); onNode[e.nb] = 0; onBond[e.bi] = 0;
      }
    }
  }
  for (let s = 0; s < n; s++) dfs(s, s, -1);
  return aro;
}
function buildCustomMolecule(graph){
  const nC = graph.pts.length;
  if (!nC) return { atoms:[], bonds:[], fragments:[], isCustom:true };
  // 键级来自绘制（单 1 / 双 2 / 三 3，模板芳香 1.5）；环不再默认芳香（修复环烷全变 sp² 的 bug）
  const order = graph.bonds.map(function (b){ return b[2] || 1; });
  for (const bi of findAromaticBonds(graph.bonds, nC)) order[bi] = 1.5;
  // 1) 正确分子构型：力松弛嵌入（键长/键角/杂化）
  const posC = embedSkeleton(graph.pts, graph.bonds, order);
  // 2) 质心居中（重心在屏幕中心）
  let cx = 0, cy = 0, cz = 0;
  for (let i = 0; i < nC; i++){ cx += posC[i][0]; cy += posC[i][1]; cz += posC[i][2]; }
  cx /= nC; cy /= nC; cz /= nC;
  for (let i = 0; i < nC; i++){ posC[i][0] -= cx; posC[i][1] -= cy; posC[i][2] -= cz; }
  // 3) 碳原子/碳键
  const atoms = [], bonds = [];
  for (let i = 0; i < nC; i++){
    atoms.push({ el:"C", pos:[posC[i][0], posC[i][1], posC[i][2]], key:"c" + i, atomIdx: i, fragId: -1, localIdx: -1 });
  }
  for (let bi = 0; bi < graph.bonds.length; bi++){
    bonds.push({ i: graph.bonds[bi][0], j: graph.bonds[bi][1], order: order[bi] });
  }
  const groups = graph.groups || [];
  const fragments = [];
  // 每个碳上的官能团列表（保持添加顺序；一个碳可挂多个，受剩余价键限制）
  const groupsAt = new Array(nC).fill(null).map(function (){ return []; });
  for (let gi = 0; gi < groups.length; gi++){
    const g = groups[gi];
    if (g.i >= 0 && g.i < nC) groupsAt[g.i].push({ gi: gi, group: g.group, dir: g.dir });
  }
  // 4) 杂化 + 理想方向：H / 官能团按正确 3D 几何放置
  const hyb = skeletonHybridization(graph.bonds, order, nC);
  for (let i = 0; i < nC; i++){
    const nbrDirs = [];
    for (const b of graph.bonds){
      let o = -1;
      if (b[0] === i) o = b[1];
      else if (b[1] === i) o = b[0];
      if (o >= 0) nbrDirs.push(v3norm([posC[o][0]-posC[i][0], posC[o][1]-posC[i][1], posC[o][2]-posC[i][2]]));
    }
    const ideal = idealBondDirs(nbrDirs, hyb[i]);
    const used = new Array(ideal.length).fill(false);
    for (let k = 0; k < nbrDirs.length; k++){
      let best = -1, bestA = 1e9;
      for (let s = 0; s < ideal.length; s++){
        if (used[s]) continue;
        const a = Math.acos(Math.max(-1, Math.min(1, v3dot(nbrDirs[k], ideal[s]))));
        if (a < bestA){ bestA = a; best = s; }
      }
      if (best >= 0) used[best] = true;
    }
    const freeSlots = [];
    for (let s = 0; s < ideal.length; s++) if (!used[s]) freeSlots.push(s);
    const myGroups = groupsAt[i];
    // 官能团默认占「朝外」空位（远离分子质心）；若指定了 dir（点击了某个 H），
    // 则取代该 H——占用与该方向夹角最小的空位（即被点击 H 的位置）
    const outward = v3len(posC[i]) > 1e-9 ? v3norm(posC[i]) : null;
    const freeIdx = freeSlots.slice().sort(function (a, b){
      if (outward){
        const da = v3dot(ideal[a], outward), db = v3dot(ideal[b], outward);
        if (da !== db) return db - da;
      }
      return a - b;
    });
    const taken = new Set();
    let f = 0;
    for (const ge of myGroups){
      let slot = -1;
      if (ge.dir){
        let best = -1, bestA = 1e9;
        for (const s of freeSlots){
          if (taken.has(s)) continue;
          const a = Math.acos(Math.max(-1, Math.min(1, v3dot(ideal[s], ge.dir))));
          if (a < bestA){ bestA = a; best = s; }
        }
        slot = best;
      } else {
        while (f < freeIdx.length && taken.has(freeIdx[f])) f++;
        if (f < freeIdx.length) slot = freeIdx[f++];
      }
      if (slot < 0) break; // 价键已满（UI 已拦截，防御性跳过）
      taken.add(slot);
      addGroupAt(atoms, bonds, fragments, i, ideal[slot], ge.group, ge.gi);
    }
    const nH = Math.max(0, Math.min(Math.round(4 - ccOrderSum(order, graph.bonds, i) - myGroups.length), freeSlots.length - myGroups.length));
    for (let h = 0; h < nH; h++){
      while (f < freeIdx.length && taken.has(freeIdx[f])) f++;
      if (f >= freeIdx.length) break;
      const dir = ideal[freeIdx[f]];
      f++;
      const idx = atoms.length;
      atoms.push({ el:"H", pos:[posC[i][0]+dir[0]*1.09, posC[i][1]+dir[1]*1.09, posC[i][2]+dir[2]*1.09], key:"h" + i + "_" + h, atomIdx: idx, fragId: -1, localIdx: -1 });
      bonds.push({ i: i, j: idx, order: 1 });
    }
  }
  return { atoms: atoms, bonds: bonds, fragments: fragments, isCustom: true };
}
function ccOrderSum(order, bonds, i){
  let s = 0;
  for (let bi = 0; bi < bonds.length; bi++){
    if (bonds[bi][0] === i) s += order[bi];
    else if (bonds[bi][1] === i) s += order[bi];
  }
  return s;
}
function skeletonHybridization(bonds, order, n){
  const hyb = new Array(n).fill("sp3");
  for (let i = 0; i < n; i++){
    let hasTriple = false, hasDouble = false, hasAro = false;
    for (let bi = 0; bi < bonds.length; bi++){
      let o = -1;
      if (bonds[bi][0] === i) o = bonds[bi][1];
      else if (bonds[bi][1] === i) o = bonds[bi][0];
      if (o >= 0){
        if (order[bi] >= 3) hasTriple = true;
        else if (order[bi] >= 2) hasDouble = true;
        else if (order[bi] >= 1.5) hasAro = true;
      }
    }
    // sp² 仅当存在 π 键（双键或芳香键）；四根单键（季碳）为 sp³（原 bsum≥2.5 误判已修）
    if (hasTriple) hyb[i] = "sp";
    else if (hasDouble || hasAro) hyb[i] = "sp2";
  }
  return hyb;
}
/* 理想成键方向（sp3 四面体 / sp2 平面 120° / sp 直线），对齐邻居 */
function idealBondDirs(nbrDirs, hyb){
  if (hyb === "sp"){
    const d = nbrDirs.length ? v3norm(nbrDirs[0]) : [1, 0, 0];
    return [d, [-d[0], -d[1], -d[2]]];
  }
  if (hyb === "sp3"){
    const t = [[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]];
    const base = t.map(function (v){ return v3norm(v); });
    if (nbrDirs.length >= 2){
      // 显式构造正四面体：d0 沿第一个邻居 u，d1 落在 (u, 第二个邻居) 平面内、与 u 成 109.47°。
      // 避免“最小旋转任意扭转”导致 C 邻居不落在四面体方向上（旧实现使环烷的
      // C–C–H / H–C–H 角畸变，实测最差 H–C–H 塌缩到 63°）
      const u = v3norm(nbrDirs[0]);
      const vp = v3sub(nbrDirs[1], v3scale(u, v3dot(nbrDirs[1], u)));
      if (v3len(vp) > 1e-6){
        const e1 = v3norm(vp);
        const e2 = v3cross(u, e1);
        const ca = Math.cos(1.9106), sa = Math.sin(1.9106); // 109.47°
        const out = [u];
        for (let k = 0; k < 3; k++){
          const th = k * 2.0944; // 120° 方位
          const d = v3add(v3add(v3scale(u, ca), v3scale(e1, sa * Math.cos(th))), v3scale(e2, sa * Math.sin(th)));
          out.push(v3norm(d));
        }
        return out;
      }
    }
    if (nbrDirs.length){
      const q = v3quatFromTo(base[0], v3norm(nbrDirs[0]));
      return base.map(function (v){ return v3rotQuat(q, v); });
    }
    return base;
  }
  const u = nbrDirs.length ? v3norm(nbrDirs[0]) : [1, 0, 0];
  let n = nbrDirs.length > 1 ? v3norm(v3cross(u, nbrDirs[1])) : [0, 0, 1];
  if (v3len(n) < 1e-6) n = [0, 0, 1];
  let by = v3norm(v3cross(n, u));
  if (v3len(by) < 1e-6) by = v3len(v3cross(u, [1, 0, 0])) > 1e-6 ? v3norm(v3cross(u, [1, 0, 0])) : v3norm(v3cross(u, [0, 1, 0]));
  const out = [];
  for (let k = 0; k < 3; k++){
    const a = k * 2.0944;
    out.push([u[0]*Math.cos(a)+by[0]*Math.sin(a), u[1]*Math.cos(a)+by[1]*Math.sin(a), u[2]*Math.cos(a)+by[2]*Math.sin(a)]);
  }
  return out;
}
/* 官能团沿给定方向附着（碎片第一原子对齐方向，保留扭转） */
function addGroupAt(atoms, bonds, fragments, cIdx, dir, gname, gi){
  const frag = MOLECULE_DATA.fragments[gname];
  const base = atoms.length;
  const q = v3quatFromTo([1, 0, 0], dir);
  for (let li = 0; li < frag.atoms.length; li++){
    const p = frag.atoms[li].p;
    const r = v3rotQuat(q, p);
    atoms.push({ el: frag.atoms[li].el, pos:[atoms[cIdx].pos[0]+r[0], atoms[cIdx].pos[1]+r[1], atoms[cIdx].pos[2]+r[2]], key: gname+"@"+cIdx+"#"+li, atomIdx: atoms.length, fragId: gi, localIdx: li, fragGroup: gname });
  }
  for (const b of frag.bonds) bonds.push({ i: base + b[0], j: base + b[1], order: b[2] });
  bonds.push({ i: cIdx, j: base, order: 1 });
  fragments.push({ atomIdx: cIdx, group: gname });
}
/* 力松弛嵌入：键长弹簧 + 键角弹簧（键角目标按杂化） */
function embedSkeleton(pts, bonds, order){
  const n = pts.length;
  const pos = pts.map(function (p){ return [p[0], p[1], 0]; });
  // 微小 z 扰动打破平面对称：否则环烷卡在平面 120° 局部极小（各顶点力平衡），
  // 无法折叠成 sp³ 109.5° 的非平面/椅式构型；sp² 碳（双键/芳香）不加扰动，保持平面。
  // 扰动为**确定性哈希**（不消耗全局随机流）：同一骨架每次重建几何完全一致，
  // 避免挂/换官能团时整分子重新嵌入产生随机跳动（视觉上像视角被改变、卡顿）
  const hyb0 = skeletonHybridization(bonds, order, n);
  for (let i = 0; i < n; i++){
    if (hyb0[i] !== "sp2"){
      const ph = Math.abs(Math.sin(i * 127.1 + pos[i][0] * 3.7 + pos[i][1] * 5.1) * 43758.5453);
      pos[i][2] += (ph - Math.floor(ph) - 0.5) * 0.05;
    }
  }
  const bondLen = function (o){ return o >= 3 ? 1.20 : o >= 2 ? 1.34 : o >= 1.5 ? 1.39 : 1.54; };
  const hyb = skeletonHybridization(bonds, order, n);
  const th0 = new Array(n).fill(1.9106);
  for (let i = 0; i < n; i++){
    th0[i] = hyb[i] === "sp" ? 3.1416 : hyb[i] === "sp2" ? 2.0944 : 1.9106;
  }
  const K_B = 40, K_A = 10, step = 0.015, maxDisp = 0.08; // step 0.015：避免环闭合落入交替键长局域极小
  for (let iter = 0; iter < 3000; iter++){
    const F = pos.map(function(){ return [0, 0, 0]; });
    for (let bi = 0; bi < bonds.length; bi++){
      const a = bonds[bi][0], b = bonds[bi][1];
      const L = bondLen(order[bi]);
      const dx = pos[b][0]-pos[a][0], dy = pos[b][1]-pos[a][1], dz = pos[b][2]-pos[a][2];
      const d = Math.max(Math.hypot(dx, dy, dz), 0.2) + 1e-6;
      const f = K_B * (d - L) / d;
      F[a][0] += f*dx; F[a][1] += f*dy; F[a][2] += f*dz;
      F[b][0] -= f*dx; F[b][1] -= f*dy; F[b][2] -= f*dz;
    }
    for (let i = 0; i < n; i++){
      const nb = [];
      for (let bi = 0; bi < bonds.length; bi++){
        if (bonds[bi][0] === i) nb.push(bonds[bi][1]);
        else if (bonds[bi][1] === i) nb.push(bonds[bi][0]);
      }
      for (let p = 0; p < nb.length; p++){
        for (let q = p + 1; q < nb.length; q++){
          const a = nb[p], b = nb[q];
          const va = v3sub(pos[a], pos[i]), vb = v3sub(pos[b], pos[i]);
          const la = v3len(va) + 1e-6, lb = v3len(vb) + 1e-6;
          const th = Math.acos(Math.max(-1, Math.min(1, v3dot(va, vb) / (la * lb))));
          const dth = th - th0[i];
          const ia = v3scale(va, 1/la), ib = v3scale(vb, 1/lb);
          const bis = v3norm(v3add(ia, ib));
          const da = v3sub(bis, v3scale(ia, v3dot(bis, ia)));
          const db = v3sub(bis, v3scale(ib, v3dot(bis, ib)));
          const la2 = v3len(da), lb2 = v3len(db);
          if (la2 > 1e-6){
            const fa = K_A * dth / Math.max(la2, 0.5); // 力上限，防 θ→180° 爆炸
            F[a][0] += fa*da[0]; F[a][1] += fa*da[1]; F[a][2] += fa*da[2];
          }
          if (lb2 > 1e-6){
            const fb = K_A * dth / Math.max(lb2, 0.5);
            F[b][0] += fb*db[0]; F[b][1] += fb*db[1]; F[b][2] += fb*db[2];
          }
        }
      }
    }
    let fx = 0, fy = 0, fz = 0;
    for (let i = 0; i < n; i++){ fx += F[i][0]; fy += F[i][1]; fz += F[i][2]; }
    fx /= n; fy /= n; fz /= n;
    for (let i = 0; i < n; i++){
      // 每步位移钳制（防欧拉积分振荡/发散）
      let dx = (F[i][0] - fx) * step;
      let dy = (F[i][1] - fy) * step;
      let dz = (F[i][2] - fz) * step;
      const dl = Math.hypot(dx, dy, dz);
      if (dl > maxDisp){ const s = maxDisp / dl; dx *= s; dy *= s; dz *= s; }
      pos[i][0] += dx; pos[i][1] += dy; pos[i][2] += dz;
    }
  }
  return pos;
}
function isConnectedWithout(bonds, a, b, skip, n){
  const adj = new Array(n).fill(null).map(function(){ return []; });
  for (let bi = 0; bi < bonds.length; bi++){
    if (bi === skip) continue;
    adj[bonds[bi][0]].push(bonds[bi][1]);
    adj[bonds[bi][1]].push(bonds[bi][0]);
  }
  const seen = new Uint8Array(n);
  const q = [a];
  seen[a] = 1;
  for (let qi = 0; qi < q.length; qi++){
    const cur = q[qi];
    for (const nb of adj[cur]){
      if (!seen[nb]){ seen[nb] = 1; q.push(nb); }
    }
  }
  return !!seen[b];
}
/* ---------- 3D 向量工具 ---------- */
function v3norm(a){ const l = v3len(a); return l < 1e-9 ? [0, 0, 0] : [a[0]/l, a[1]/l, a[2]/l]; }
function v3cross(a, b){ return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
function v3dot(a, b){ return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
function v3add(a, b){ return [a[0]+b[0], a[1]+b[1], a[2]+b[2]]; }
function v3scale(a, s){ return [a[0]*s, a[1]*s, a[2]*s]; }
function v3quatFromTo(vFrom, vTo){
  const a = v3norm(vFrom), b = v3norm(vTo);
  const d = v3dot(a, b);
  if (d > 0.99999) return [1, 0, 0, 0];
  if (d < -0.99999){
    let axis = v3norm(v3cross(a, [0, 0, 1]));
    if (v3len(axis) < 1e-6) axis = v3norm(v3cross(a, [0, 1, 0]));
    return [0, axis[0], axis[1], axis[2]];
  }
  const q = [1 + d, a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const l = Math.hypot(q[0], q[1], q[2], q[3]);
  return [q[0]/l, q[1]/l, q[2]/l, q[3]/l];
}
function v3rotQuat(q, v){
  const w = q[0], x = q[1], y = q[2], z = q[3];
  const t = [y*v[2]-z*v[1], z*v[0]-x*v[2], x*v[1]-y*v[0]];
  const u = [2*(w*t[0] + y*t[2]-z*t[1]), 2*(w*t[1] + z*t[0]-x*t[2]), 2*(w*t[2] + x*t[1]-y*t[0])];
  return [v[0]+u[0], v[1]+u[1], v[2]+u[2]];
}

/* ================= 唯一拓扑识别：规范化 SMILES（芳香形式） ================= */
function molFormula(mol){
  const cnt = {};
  for (const a of mol.atoms) cnt[a.el] = (cnt[a.el] || 0) + 1;
  let s = "";
  for (const el of ["C","H","N","O","F","Cl","Br","I","S"]){
    if (cnt[el]) s += el + (cnt[el] > 1 ? cnt[el] : "");
  }
  return s;
}
function isAromaticAtom(mol, i){
  let aro = 0;
  for (const b of mol.bonds){
    let o = -1;
    if (b.i === i) o = b.j;
    else if (b.j === i) o = b.i;
    if (o >= 0 && b.order >= 1.5) aro++;
  }
  return aro >= 2;
}
function canonicalSmiles(mol){
  // 过滤 H（SMILES 中隐式）；重映射非 H 原子
  const keep = [];
  const remap = [];
  for (let i = 0; i < mol.atoms.length; i++){
    if (mol.atoms[i].el !== "H"){ remap.push(keep.length); keep.push(i); }
    else remap.push(-1);
  }
  const n = keep.length;
  if (!n) return "";
  const fBonds = [];
  for (const b of mol.bonds){
    const a = remap[b.i], c = remap[b.j];
    if (a >= 0 && c >= 0) fBonds.push({ i: a, j: c, order: b.order });
  }
  const el = keep.map(function (i){ return mol.atoms[i].el; });
  mol = { atoms: keep.map(function (i){ return mol.atoms[i]; }), bonds: fBonds };
  const aro = el.map(function (_, i){ return isAromaticAtom(mol, i); });
  const deg = new Array(n).fill(0);
  for (const b of fBonds){ deg[b.i]++; deg[b.j]++; }
  // Morgan 不变量
  let inv = el.map(function (e, i){
    let bs = 0;
    for (const b of mol.bonds) if (b.i === i || b.j === i) bs += b.order;
    return e + "|" + bs + "|" + deg[i];
  });
  for (let it = 0; it <= n + 1; it++){
    const next = inv.map(function (v, i){
      const parts = [v];
      const nb = [];
      for (const b of mol.bonds){
        let o = -1;
        if (b.i === i) o = b.j;
        else if (b.j === i) o = b.i;
        if (o >= 0) nb.push(inv[o] + (b.order >= 3 ? "#" : b.order >= 2 ? "=" : b.order >= 1.5 ? "~" : ""));
      }
      nb.sort();
      parts.push(nb.join(","));
      return parts.join(">");
    });
    inv = next;
  }
  const starts = Array.from({ length: n }, function (_, i){ return i; });
  let best = null;
  for (const s of starts){
    const smi = smilesFromStart(mol, s, inv, aro, el);
    if (smi && (!best || smi < best)) best = smi;
  }
  return best || "";
}
function smilesFromStart(mol, start, inv, aro, el){
  const n = mol.atoms.length;
  const adj = new Array(n).fill(null).map(function(){ return []; });
  for (const b of mol.bonds){
    adj[b.i].push({ j: b.j, order: b.order });
    adj[b.j].push({ j: b.i, order: b.order });
  }
  // BFS 生成树 + 环闭合边
  const parent = new Int32Array(n).fill(-2);
  const ringBonds = [];
  const q = [start];
  parent[start] = -1;
  for (let qi = 0; qi < q.length; qi++){
    const cur = q[qi];
    for (const nb of adj[cur]){
      if (parent[nb.j] === -2){ parent[nb.j] = cur; q.push(nb.j); }
      else if (nb.j !== parent[cur]){
        const dup = ringBonds.some(function (rb){ return (rb[0]===cur&&rb[1]===nb.j)||(rb[0]===nb.j&&rb[1]===cur); });
        if (!dup) ringBonds.push([cur, nb.j, nb.order]);
      }
    }
  }
  // 环闭合边 → 编号（每个端点写同号）
  const ringDigits = new Array(n).fill(null).map(function(){ return []; });
  let digit = 1;
  for (const rb of ringBonds){
    const d = digit++;
    ringDigits[rb[0]].push(d);
    ringDigits[rb[1]].push(d);
  }
  let out = "";
  const visited = new Uint8Array(n);
  function atomSym(i){
    const e = el[i];
    if (aro[i]){
      if (e === "C") return "c";
      if (e === "N") return "n";
      if (e === "O") return "o";
      if (e === "S") return "s";
    }
    return e;
  }
  function bondSym(a, b, o){
    if (o >= 3) return "#";
    if (o >= 2) return "=";
    if (aro[a] && aro[b]) return o >= 1.5 ? "" : "-";
    return "";
  }
  function dfs(i, parentIdx){
    visited[i] = 1;
    out += atomSym(i);
    const digs = ringDigits[i].slice().sort(function (a, b){ return a - b; });
    for (const d of digs) out += String(d);
    // 只沿 BFS 生成树边遍历：环闭合边由两端编号闭合，避免伪二元环（如 ccc1c1）
    const nbrs = [];
    for (const nb of adj[i]) if (parent[nb.j] === i) nbrs.push(nb);
    nbrs.sort(function (a, b){
      if (inv[a.j] !== inv[b.j]) return inv[a.j] < inv[b.j] ? 1 : -1;
      if (a.order !== b.order) return a.order < b.order ? 1 : -1;
      return el[a.j] < el[b.j] ? 1 : -1;
    });
    let first = true;
    for (const nb of nbrs){
      if (visited[nb.j]) continue;
      if (!first) out += "(";
      out += bondSym(i, nb.j, nb.order);
      dfs(nb.j, i);
      if (!first) out += ")";
      first = false;
    }
  }
  dfs(start, -1);
  return out;
}
/* 化合物名称字典：预置分子与常见烃类全部用同一 canonicalSmiles 算法运行时注册，
   保证「绘制 → 识别」与字典条目一一对应 */
const MOLECULE_NAMES = {};
function regMol(mol, name, zh, formula){
  const smi = canonicalSmiles(mol);
  MOLECULE_NAMES[smi] = [name, zh, formula];
  return smi;
}
function chainMol(n){
  const atoms = [], bonds = [];
  for (let i = 0; i < n; i++) atoms.push({ el: "C", pos: [i * 1.5, 0, 0] });
  for (let i = 0; i < n - 1; i++) bonds.push({ i: i, j: i + 1, order: 1 });
  return { atoms: atoms, bonds: bonds, fragments: [] };
}
function ringMol(n){
  const atoms = [], bonds = [];
  for (let i = 0; i < n; i++) atoms.push({ el: "C", pos: [Math.cos(i * 2 * Math.PI / n), Math.sin(i * 2 * Math.PI / n), 0] });
  for (let i = 0; i < n; i++) bonds.push({ i: i, j: (i + 1) % n, order: 1 });
  return { atoms: atoms, bonds: bonds, fragments: [] };
}
/* 烯（piOrder=2）/ 炔（piOrder=3）：piAt 处为重键 */
function unsatMol(n, piAt, piOrder){
  const atoms = [], bonds = [];
  for (let i = 0; i < n; i++) atoms.push({ el: "C", pos: [i * 1.5, 0, 0] });
  for (let i = 0; i < n - 1; i++) bonds.push({ i: i, j: i + 1, order: i === piAt ? (piOrder || 2) : 1 });
  return { atoms: atoms, bonds: bonds, fragments: [] };
}
(function (){
  for (const m of MOLECULE_LIST) regMol(buildMolecule(m.fragments), m.name, m.zh, m.formula);
  // 烷烃 / 环烷
  regMol(chainMol(2), "Ethane", "乙烷", "C2H6");
  regMol(chainMol(3), "Propane", "丙烷", "C3H8");
  regMol(chainMol(4), "Butane", "丁烷", "C4H10");
  regMol(chainMol(5), "Pentane", "戊烷", "C5H12");
  regMol(chainMol(6), "Hexane", "己烷", "C6H14");
  regMol(chainMol(7), "Heptane", "庚烷", "C7H16");
  regMol(ringMol(5), "Cyclopentane", "环戊烷", "C5H10");
  regMol(ringMol(6), "Cyclohexane", "环己烷", "C6H12");
  // 烯 / 炔
  regMol(unsatMol(2, 0, 2), "Ethene", "乙烯", "C2H4");
  regMol(unsatMol(2, 0, 3), "Ethyne", "乙炔", "C2H2");
  regMol(unsatMol(3, 0, 2), "Propene", "丙烯", "C3H6");
  regMol(unsatMol(4, 0, 2), "1-Butene", "1-丁烯", "C4H8");
  regMol(unsatMol(4, 1, 2), "2-Butene", "2-丁烯", "C4H8");
  regMol(unsatMol(4, 0, 3), "1-Butyne", "1-丁炔", "C4H6");
  regMol(unsatMol(4, 1, 3), "2-Butyne", "2-丁炔", "C4H6");
  // 萘（双环芳烃）
  {
    const nap = { atoms: [], bonds: [], fragments: [] };
    for (let i = 0; i < 10; i++) nap.atoms.push({ el: "C", pos: [0, 0, 0] });
    const nb = [[0,1],[1,2],[2,3],[3,4],[4,9],[5,6],[6,7],[7,8],[8,9],[9,0],[4,5]];
    for (const e of nb) nap.bonds.push({ i: e[0], j: e[1], order: 1.5 });
    regMol(nap, "Naphthalene", "萘", "C10H8");
  }
  // 联苯 / 乙苯 / 二甲苯（以苯为核）
  function phenylX(fragAtoms, fragBonds, extraFormula){
    const core = buildMolecule([{ pos: 0, group: "CH3" }]); // 苯环模板
    const atoms = core.atoms.map(function (a){ return { el: a.el, pos: a.pos }; });
    const bonds = core.bonds.map(function (b){ return { i: b.i, j: b.j, order: b.order }; });
    // 把 CH3 的 C 换成 X 的原子
    const cIdx = 6; // 甲基碳位置
    const base = atoms.length;
    for (let li = 0; li < fragAtoms.length; li++){
      atoms.push({ el: fragAtoms[li], pos: [core.atoms[cIdx].pos[0] + li, core.atoms[cIdx].pos[1], 0] });
      bonds.push({ i: cIdx, j: base + li, order: 1 });
    }
    for (const b of fragBonds) bonds.push({ i: base + b[0], j: base + b[1], order: 1 });
    return { atoms: atoms, bonds: bonds, fragments: [] };
  }
  regMol(phenylX(["C"], [], "extra"), "Ethylbenzene", "乙苯", "C8H10");
  // 邻二甲苯
  regMol(buildMolecule([{ pos: 0, group: "CH3" }, { pos: 1, group: "CH3" }]), "o-Xylene", "邻二甲苯", "C8H10");
  // 联苯
  {
    const bp = { atoms: [], bonds: [], fragments: [] };
    for (let i = 0; i < 12; i++) bp.atoms.push({ el: "C", pos: [0, 0, 0] });
    const edges = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[6,7],[7,8],[8,9],[9,10],[10,11],[11,6],[0,6]];
    for (let i = 0; i < edges.length; i++) bp.bonds.push({ i: edges[i][0], j: edges[i][1], order: i === 12 ? 1 : 1.5 });
    regMol(bp, "Biphenyl", "联苯", "C12H10");
  }
})();
function identifyMolecule(mol){
  const smi = canonicalSmiles(mol);
  const hit = MOLECULE_NAMES[smi];
  return { smiles: smi, formula: molFormula(mol), name: hit ? hit[0] : null, zh: hit ? hit[1] : null };
}

/* 粒子对应匹配（按格批量 + Morton 兜底）：
   Phase 1 —— 同格贪心配对（0.6Å 格），再对未配对粒子查 27 邻域格：绝大多数粒子
   只在邻近处流动，位移极小（电子云局部迁移）；
   Phase 2 —— 剩余粒子 ↔ 剩余目标用 3D Morton 序按秩匹配：仅在原区域消失时发生
   远距离迁移（电子离开该区域，物理上正确）。
   保证一一对应（双射），O(N·k)。参考：three.js 论坛
   "Morphing between geometries of Points system on GPU"
   https://discourse.threejs.org/t/morphing-between-geometries-of-points-system-on-gpu/37688 */
/* 分帧调度：work(t0) 返回 true 表示完成；每片让出主线程（stepMs 毫秒预算） */
const _rafSched = typeof requestAnimationFrame === "function" ? requestAnimationFrame : function (f){ f(); };
function _yieldChunks(stepMs, work, done){
  // work(t0)：返回 undefined 表示继续分帧；返回任意值视为完成，原样透传给 done
  const step = function (){
    const t0 = performance.now();
    let r;
    do { r = work(t0); } while (r === undefined && performance.now() - t0 < stepMs);
    if (r !== undefined) done(r);
    else _rafSched(step);
  };
  _rafSched(step);
}
function matchSameCellBatchC(oldPos, targets, count, cell, shift, claimed, map, stepMs, onDone){
  const LO = -5.5 + shift, HI = 5.5 + shift;
  const CN = Math.ceil((HI - LO) / cell) + 1;
  const cellOf = function (v){
    let c = Math.floor((v - LO) / cell);
    return c < 0 ? 0 : c > CN - 1 ? CN - 1 : c;
  };
  const cellIdx = function (cx, cy, cz){ return (cz * CN + cy) * CN + cx; };
  const tCells = new Map();
  const oCells = new Map();
  const leftovers = [];
  // 3D 交织键（近似 Morton）：格内按此排序后按秩配对，保证邻近粒子配对不交叉
  const m1 = function (v){
    let x = Math.round((v + 5.5) * 12);
    if (x < 0) x = 0; else if (x > 255) x = 255;
    x = (x | (x << 4)) & 0x0F0F0F0F;
    x = (x | (x << 2)) & 0x33333333;
    x = (x | (x << 1)) & 0x55555555;
    return x >>> 0;
  };
  const key3 = function (arr, i){
    return (m1(arr[i * 3]) | (m1(arr[i * 3 + 1]) << 1) | (m1(arr[i * 3 + 2]) << 2)) >>> 0;
  };
  let i = 0;         // 构建游标
  let ci = 0;        // 格处理游标
  let cellList = null;
  _yieldChunks(stepMs, function (t0){
    while (true){
      if (cellList === null){
        if (i < count){
          const end = Math.min(i + 6000, count);
          for (; i < end; i++){
            if (!claimed[i]){
              const c = cellIdx(cellOf(targets[i * 3]), cellOf(targets[i * 3 + 1]), cellOf(targets[i * 3 + 2]));
              let arr = tCells.get(c);
              if (!arr){ arr = []; tCells.set(c, arr); }
              arr.push(i);
            }
            if (map[i] < 0){
              const c = cellIdx(cellOf(oldPos[i * 3]), cellOf(oldPos[i * 3 + 1]), cellOf(oldPos[i * 3 + 2]));
              let arr = oCells.get(c);
              if (!arr){ arr = []; oCells.set(c, arr); }
              arr.push(i);
            }
          }
          return undefined;
        }
        cellList = [];
        for (const e of oCells) cellList.push(e);
      } else if (ci < cellList.length){
        const end = Math.min(ci + 120, cellList.length);
        for (; ci < end; ci++){
          const entry = cellList[ci];
          const c = entry[0], olds = entry[1];
          const ts = tCells.get(c);
          if (!ts){ for (const o of olds) leftovers.push(o); continue; }
          if (olds.length * ts.length > 4096){
            // 大格：排序按秩配对 O(n log n)，替代 O(n²) 全扫描（同格内位移 < 1.3Å，秩配对等价）
            const os = olds.slice().sort(function (a, b){ return key3(oldPos, a) - key3(oldPos, b); });
            const tt = ts.slice().sort(function (a, b){ return key3(targets, a) - key3(targets, b); });
            const mm = Math.min(os.length, tt.length);
            for (let k = 0; k < mm; k++){
              const o = os[k], ti = tt[k];
              if (!claimed[ti]){ claimed[ti] = 1; map[o] = ti; }
              else leftovers.push(o);
            }
            for (let k = mm; k < os.length; k++) leftovers.push(os[k]);
            continue;
          }
          for (let k = olds.length - 1; k > 0; k--){
            const j = (seededRand() * (k + 1)) | 0;
            const t = olds[k]; olds[k] = olds[j]; olds[j] = t;
          }
          for (const o of olds){
            const ox = oldPos[o * 3], oy = oldPos[o * 3 + 1], oz = oldPos[o * 3 + 2];
            let best = -1, bestD2 = Infinity;
            for (const ti of ts){
              if (!claimed[ti]){
                const dxx = targets[ti * 3] - ox, dyy = targets[ti * 3 + 1] - oy, dzz = targets[ti * 3 + 2] - oz;
                const d2 = dxx * dxx + dyy * dyy + dzz * dzz;
                if (d2 < bestD2){ bestD2 = d2; best = ti; }
              }
            }
            if (best >= 0){ claimed[best] = 1; map[o] = best; }
            else leftovers.push(o);
          }
        }
        return undefined;
      } else {
        return leftovers;
      }
    }
  }, onDone);
}
function matchCloudTargetsAsync(oldPos, targets, count, onDone){
  const claimed = new Uint8Array(count);
  const map = new Int32Array(count);
  map.fill(-1);
  const STEP = 15;
  const runMorton = function (leftovers){
    // Phase 2：Morton 序秩匹配剩余（未配对粒子对应「区域真正变化处」的迁移）
    const QUANT = 256, SCALE = QUANT / 11.0;
    const q = function (v){
      let c = Math.round((v + 5.5) * SCALE);
      return c < 0 ? 0 : c > 255 ? 255 : c;
    };
    const spread8 = function (v){
      let x = v & 0xFF;
      x = (x | (x << 4)) & 0x0F0F0F0F;
      x = (x | (x << 2)) & 0x33333333;
      x = (x | (x << 1)) & 0x55555555;
      return x >>> 0;
    };
    const keyOf = function (arr, i){
      const sx = spread8(q(arr[i * 3]));
      const sy = spread8(q(arr[i * 3 + 1]));
      const sz = spread8(q(arr[i * 3 + 2]));
      return (sx | (sy << 1) | (sz << 2)) >>> 0;
    };
    const unclaimed = [];
    for (let i = 0; i < count; i++) if (!claimed[i]) unclaimed.push(i);
    if (leftovers.length){
      const nf = leftovers.length;
      const nk = new Uint32Array(nf);
      const uk = new Uint32Array(nf);
      const ni = new Array(nf);
      const ui = new Array(nf);
      for (let k = 0; k < nf; k++){
        nk[k] = keyOf(oldPos, leftovers[k]);
        uk[k] = keyOf(targets, unclaimed[k]);
        ni[k] = k;
        ui[k] = k;
      }
      ni.sort(function (a, b){ return nk[a] - nk[b]; });
      ui.sort(function (a, b){ return uk[a] - uk[b]; });
      for (let k = 0; k < nf; k++){
        map[leftovers[ni[k]]] = unclaimed[ui[k]];
      }
    }
    onDone({ map: map });
  };
  // Phase 1：0.75Å 格与其偏移半格的同格配对（两遍大幅减少远飞粒子）
  matchSameCellBatchC(oldPos, targets, count, 0.75, 0, claimed, map, STEP, function (left){
    if (left.length > count * 0.02){
      matchSameCellBatchC(oldPos, targets, count, 0.75, 0.375, claimed, map, STEP, function (left2){
        runMorton(left2);
      });
    } else {
      runMorton(left);
    }
  });
}

// gen-molecules.mjs — 从 PubChem 3D conformer 生成分子数据（失败回退到标准键长/键角几何）
// 输出: parts/02_data.js  (const MOLECULE_DATA = {...})
import fs from "node:fs";
import path from "node:path";

const NAMES = ["benzene","toluene","anisole","phenol","aniline","fluorobenzene","chlorobenzene","benzonitrile","nitrobenzene","benzaldehyde"];
const ZH = { benzene:["苯","C6H6"], toluene:["甲苯","C7H8"], anisole:["苯甲醚","C7H8O"], phenol:["苯酚","C6H6O"], aniline:["苯胺","C6H7N"], fluorobenzene:["氟苯","C6H5F"], chlorobenzene:["氯苯","C6H5Cl"], benzonitrile:["苯甲腈","C7H5N"], nitrobenzene:["硝基苯","C6H5NO2"], benzaldehyde:["苯甲醛","C7H6O"] };
const GROUP_OF = { toluene:"CH3", anisole:"OMe", phenol:"OH", aniline:"NH2", fluorobenzene:"F", chlorobenzene:"Cl", benzonitrile:"CN", nitrobenzene:"NO2", benzaldehyde:"CHO" };
const EN = { benzene:"Benzene", toluene:"Toluene", anisole:"Anisole", phenol:"Phenol", aniline:"Aniline", fluorobenzene:"Fluorobenzene", chlorobenzene:"Chlorobenzene", benzonitrile:"Benzonitrile", nitrobenzene:"Nitrobenzene", benzaldehyde:"Benzaldehyde" };

// ---------- SDF ----------
async function fetchSDF(name) {
  const url = "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/" + encodeURIComponent(name) + "/SDF?record_type=3d";
  const ctl = AbortSignal.timeout(25000);
  const r = await fetch(url, { signal: ctl });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return await r.text();
}
function parseSDF(sdf) {
  const lines = sdf.split(/\r?\n/);
  const counts = lines[3];
  const natoms = parseInt(counts.slice(0, 3), 10);
  const nbonds = parseInt(counts.slice(3, 6), 10);
  const atoms = [];
  for (let i = 0; i < natoms; i++) {
    const l = lines[4 + i];
    atoms.push({ x: parseFloat(l.slice(0, 10)), y: parseFloat(l.slice(10, 20)), z: parseFloat(l.slice(20, 30)), el: l.slice(31, 34).trim() });
  }
  const bonds = [];
  for (let i = 0; i < nbonds; i++) {
    const l = lines[4 + natoms + i];
    const a = parseInt(l.slice(0, 3), 10) - 1, b = parseInt(l.slice(3, 6), 10) - 1, t = parseInt(l.slice(6, 9), 10);
    if (a >= 0 && b >= 0) bonds.push({ a, b, t: t >= 1 && t <= 4 ? t : 1 });
  }
  return { atoms, bonds };
}
// 找 6 元碳环（苯环）：DFS 找长度为 6 的碳环
function findRing(atoms, bonds) {
  const n = atoms.length;
  const adj = Array.from({ length: n }, () => []);
  for (const b of bonds) { adj[b.a].push(b.b); adj[b.b].push(b.a); }
  const isC = (i) => atoms[i].el === "C";
  for (let start = 0; start < n; start++) {
    if (!isC(start)) continue;
    const path = [start];
    const seen = new Set([start]);
    const dfs = (cur) => {
      if (path.length === 6) {
        if (adj[cur].includes(start)) return true;
        return false;
      }
      for (const nb of adj[cur]) {
        if (nb === start && path.length < 5) continue;
        if (seen.has(nb)) continue;
        if (!isC(nb)) continue;
        seen.add(nb); path.push(nb);
        if (dfs(nb)) return true;
        path.pop(); seen.delete(nb);
      }
      return false;
    };
    if (dfs(start)) return path.slice();
  }
  return null;
}
function vecSub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function vecAdd(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
function vecScale(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
function vecLen(a) { return Math.hypot(a[0], a[1], a[2]); }
function vecNorm(a) { const l = vecLen(a); return l < 1e-9 ? [0, 0, 0] : vecScale(a, 1 / l); }
function vecCross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function vecDot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
// 最小旋转：将 vFrom 映射到 vTo
function rotFromTo(vFrom, vTo) {
  const a = vecNorm(vFrom), b = vecNorm(vTo);
  const d = vecDot(a, b);
  if (d > 0.99999) return [1, 0, 0, 0];
  if (d < -0.99999) {
    const axis = vecNorm(vecCross(a, [0, 0, 1]));
    const ax = vecLen(axis) < 1e-6 ? vecNorm(vecCross(a, [0, 1, 0])) : axis;
    return [Math.cos(Math.PI / 2), ax[0] * Math.sin(Math.PI / 2), ax[1] * Math.sin(Math.PI / 2), ax[2] * Math.sin(Math.PI / 2)];
  }
  const q = [1 + d, a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const l = Math.hypot(q[0], q[1], q[2], q[3]);
  return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
}
function rotApply(q, v) {
  const [w, x, y, z] = q;
  const t = vecCross([x, y, z], v);
  const u = vecAdd(vecScale(t, 2 * w), vecScale(vecCross([x, y, z], t), 2));
  return vecAdd(v, u);
}
function rotZ(v, ang) {
  const c = Math.cos(ang), s = Math.sin(ang);
  return [v[0] * c - v[1] * s, v[0] * s + v[1] * c, v[2]];
}

// ---------- 从分子提取碎片 ----------
function extractFragments(mol) {
  const { atoms, bonds } = mol;
  const ring = findRing(atoms, bonds);
  if (!ring) throw new Error("no 6-ring found");
  const ringSet = new Set(ring);
  let cx = 0, cy = 0, cz = 0;
  for (const i of ring) { cx += atoms[i].x; cy += atoms[i].y; cz += atoms[i].z; }
  cx /= 6; cy /= 6; cz /= 6;
  const v1 = vecSub([atoms[ring[1]].x, atoms[ring[1]].y, atoms[ring[1]].z], [atoms[ring[0]].x, atoms[ring[0]].y, atoms[ring[0]].z]);
  const v2 = vecSub([atoms[ring[2]].x, atoms[ring[2]].y, atoms[ring[2]].z], [atoms[ring[0]].x, atoms[ring[0]].y, atoms[ring[0]].z]);
  let normal = vecNorm(vecCross(v1, v2));
  if (normal[2] < 0) normal = vecScale(normal, -1);
  const qToZ = rotFromTo(normal, [0, 0, 1]);
  const P = atoms.map((a) => {
    const p = vecSub([a.x, a.y, a.z], [cx, cy, cz]);
    return rotApply(qToZ, p);
  });
  const ringC = ring.map((idx) => ({ idx, phi: Math.atan2(P[idx][1], P[idx][0]) }));
  ringC.sort((a, b) => a.phi - b.phi);
  const phi0 = ringC[0].phi;
  const rotate = -phi0 + (Math.PI / 180) * 30;
  const P2 = P.map((p) => rotZ(p, rotate));
  const ringOrder = ringC.map((r) => r.idx);
  let R = 0;
  for (const i of ringOrder) R += Math.hypot(P2[i][0], P2[i][1]);
  R /= 6;
  let ipsoIdx = -1, fragAtomIdxs = [];
  for (const i of ringOrder) {
    for (const b of bonds) {
      const other = b.a === i ? b.b : b.b === i ? b.a : -1;
      if (other >= 0 && !ringSet.has(other) && atoms[other].el !== "H") { ipsoIdx = i; fragAtomIdxs = [other]; break; }
    }
    if (ipsoIdx >= 0) break;
  }
  if (ipsoIdx >= 0) {
    const queue = [fragAtomIdxs[0]];
    const seen = new Set(fragAtomIdxs);
    while (queue.length) {
      const cur = queue.shift();
      for (const b of bonds) {
        const nb = b.a === cur ? b.b : b.b === cur ? b.a : -1;
        if (nb >= 0 && !ringSet.has(nb) && !seen.has(nb)) { seen.add(nb); queue.push(nb); fragAtomIdxs.push(nb); }
      }
    }
  }
  let frag = null;
  if (ipsoIdx >= 0) {
    const ipsoPos = P2[ipsoIdx];
    const firstIdx = fragAtomIdxs[0];
    const dir = vecNorm(vecSub(P2[firstIdx], ipsoPos));
    const q = rotFromTo(dir, [1, 0, 0]);
    const local = fragAtomIdxs.map((i) => rotApply(q, vecSub(P2[i], ipsoPos)));
    const idxMap = new Map(fragAtomIdxs.map((i, k) => [i, k]));
    const fragBonds = [];
    for (const b of bonds) {
      if (idxMap.has(b.a) && idxMap.has(b.b)) fragBonds.push([idxMap.get(b.a), idxMap.get(b.b), b.t]);
    }
    const pos = ringOrder.indexOf(ipsoIdx);
    frag = { pos, atoms: fragAtomIdxs.map((i, k) => ({ el: atoms[i].el, p: local[k].map((v) => +v.toFixed(4)) })), bonds: fragBonds, attachOrder: 1 };
  }
  return { R, fragments: frag ? [frag] : [] };
}

// ---------- 理想化回退几何 ----------
function idealFragments() {
  const tetra = [[0.3333, 0.9428, 0], [0.3333, -0.4714, 0.8165], [0.3333, -0.4714, -0.8165]];
  const mk = (arr) => arr.map((p) => ({ p: p.map((v) => +v.toFixed(4)) }));
  return {
    CH3:  { atoms: mk([[1.51, 0, 0], [1.51 + 1.09 * 0.3333, 1.09 * 0.9428, 0], [1.51 + 1.09 * 0.3333, -1.09 * 0.4714, 1.09 * 0.8165], [1.51 + 1.09 * 0.3333, -1.09 * 0.4714, -1.09 * 0.8165]]), bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] },
    OH:   { atoms: mk([[1.36, 0, 0], [1.0554, 0.9104, 0]]), bonds: [[0, 1, 1]] },
    OMe:  { atoms: mk([[1.36, 0, 0], [2.79, 0, 0], [2.79 + 0.629, 0.629, 0.629], [2.79 + 0.629, -0.629, -0.629], [2.79 + 0.629, 0.629, -0.629]]), bonds: [[0, 1, 1], [1, 2, 1], [1, 3, 1], [1, 4, 1]] },
    NH2:  { atoms: mk([[1.40, 0, 0], [0.973, 0.915, 0], [0.973, -0.915, 0]]), bonds: [[0, 1, 1], [0, 2, 1]] },
    F:    { atoms: mk([[1.35, 0, 0]]), bonds: [] },
    Cl:   { atoms: mk([[1.73, 0, 0]]), bonds: [] },
    CF3:  { atoms: mk([[1.50, 0, 0], [1.50 + 0.443, 1.254, 0], [1.50 + 0.443, -0.627, 1.086], [1.50 + 0.443, -0.627, -1.086]]), bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] },
    CN:   { atoms: mk([[1.43, 0, 0], [2.58, 0, 0]]), bonds: [[0, 1, 3]] },
    NO2:  { atoms: mk([[1.47, 0, 0], [0.897, 1.077, 0], [0.897, -1.077, 0]]), bonds: [[0, 1, 2], [0, 2, 2]] },
    CHO:  { atoms: mk([[1.47, 0, 0], [2.68, 0, 0], [0.915, 0.961, 0]]), bonds: [[0, 1, 2], [0, 2, 1]] },
    COOH: { atoms: mk([[1.48, 0, 0], [2.69, 0, 0], [0.825, 1.134, 0], [1.153, 2.036, 0]]), bonds: [[0, 1, 2], [0, 2, 1], [2, 3, 1]] },
  };
}

// ---------- 主流程 ----------
const out = { ringR: 1.395, source: "pubchem", fetchedAt: new Date().toISOString(), molecules: {}, fragments: null };
const frags = {};
const RING_R = [];
let anyFallback = false;
for (const name of NAMES) {
  try {
    const sdf = await fetchSDF(name);
    const mol = parseSDF(sdf);
    const ex = extractFragments(mol);
    RING_R.push(ex.R);
    out.molecules[name] = { name: EN[name], zh: ZH[name][0], formula: ZH[name][1], fragments: ex.fragments.map((f) => ({ pos: f.pos, group: GROUP_OF[name] })) };
    if (ex.fragments.length) {
      const g = GROUP_OF[name];
      if (!frags[g]) frags[g] = { atoms: ex.fragments[0].atoms, bonds: ex.fragments[0].bonds, attachOrder: ex.fragments[0].attachOrder };
    }
    console.log("OK  " + name + "  R=" + ex.R.toFixed(3) + "  frag=" + (ex.fragments[0] ? ex.fragments[0].atoms.length : 0) + " atoms");
  } catch (e) {
    anyFallback = true;
    console.log("FALLBACK " + name + " : " + e.message);
  }
}
if (RING_R.length) out.ringR = +(RING_R.reduce((a, b) => a + b, 0) / RING_R.length).toFixed(4);
const missing = [...new Set(Object.values(GROUP_OF))].filter((g) => !frags[g]);
if (missing.length || Object.keys(frags).length === 0) {
  const ideal = idealFragments();
  for (const g of Object.values(GROUP_OF)) if (!frags[g]) frags[g] = ideal[g];
}
out.source = anyFallback ? "mixed(pubchem+idealized)" : "pubchem";
out.fragments = frags;
out.fragSource = missing.length ? "idealized(fallback)" : "pubchem";
for (const g of Object.keys(frags)) {
  const d = Math.hypot(frags[g].atoms[0].p[0], frags[g].atoms[0].p[1], frags[g].atoms[0].p[2]);
  console.log("frag " + g + " attach dist=" + d.toFixed(3) + " atoms=" + frags[g].atoms.length);
}
const js = "const MOLECULE_DATA = " + JSON.stringify(out) + ";";
const target = path.join(import.meta.dirname, "..", "parts", "02_data.js");
fs.writeFileSync(target, js, "utf8");
console.log("written: " + target + " (" + js.length + " bytes)");
console.log("source=" + out.source + " fragSource=" + out.fragSource + " ringR=" + out.ringR);

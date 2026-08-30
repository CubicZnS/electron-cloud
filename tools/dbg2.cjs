
const fs = require("fs");
let s = fs.readFileSync("tools/gen-molecules.mjs", "utf8");
const i = s.indexOf("async function fetchSDF");
const j = s.indexOf("// ---------- 主流程");
const code = s.slice(i, j);
const m = {};
new Function("module", "exports", "require", code + "\nmodule.exports={fetchSDF,parseSDF,findRing,vecSub,vecNorm,vecCross,vecLen,rotApply,rotFromTo,rotZ,vecDot};")(m, m.exports, require);
const { fetchSDF, parseSDF, findRing, vecSub, vecNorm, vecCross, vecLen, rotApply, rotFromTo, rotZ, vecDot } = m.exports;
(async () => {
  const sdf = await fetchSDF("anisole");
  const mol = parseSDF(sdf);
  const { atoms, bonds } = mol;
  const ring = findRing(atoms, bonds);
  console.log("ring:", ring);
  const ringSet = new Set(ring);
  let cx = 0, cy = 0, cz = 0;
  for (const r of ring) { cx += atoms[r].x; cy += atoms[r].y; cz += atoms[r].z; }
  cx /= 6; cy /= 6; cz /= 6;
  const v1 = vecSub([atoms[ring[1]].x, atoms[ring[1]].y, atoms[ring[1]].z], [atoms[ring[0]].x, atoms[ring[0]].y, atoms[ring[0]].z]);
  const v2 = vecSub([atoms[ring[2]].x, atoms[ring[2]].y, atoms[ring[2]].z], [atoms[ring[0]].x, atoms[ring[0]].y, atoms[ring[0]].z]);
  let normal = vecNorm(vecCross(v1, v2));
  console.log("normal:", normal);
  if (normal[2] < 0) normal = vecScale(normal, -1);
  const qToZ = rotFromTo(normal, [0, 0, 1]);
  console.log("qToZ:", qToZ);
  const P = atoms.map((a) => rotApply(qToZ, vecSub([a.x, a.y, a.z], [cx, cy, cz])));
  const ringC = ring.map((idx) => ({ idx, phi: Math.atan2(P[idx][1], P[idx][0]) }));
  ringC.sort((a, b) => a.phi - b.phi);
  const phi0 = ringC[0].phi;
  const rotate = -phi0 + (Math.PI / 180) * 30;
  console.log("phi0:", phi0.toFixed(3), "rotate:", rotate.toFixed(3));
  const P2 = P.map((p) => rotZ(p, rotate));
  const ringOrder = ringC.map((r) => r.idx);
  console.log("ringOrder:", ringOrder);
  let ipsoIdx = -1, fragAtomIdxs = [];
  for (const r of ringOrder) {
    for (const b of bonds) {
      const other = b.a === r ? b.b : b.b === r ? b.a : -1;
      if (other >= 0 && !ringSet.has(other) && atoms[other].el !== "H") { ipsoIdx = r; fragAtomIdxs = [other]; break; }
    }
    if (ipsoIdx >= 0) break;
  }
  console.log("ipsoIdx:", ipsoIdx, "fragAtomIdxs:", fragAtomIdxs);
  const ipsoPos = P2[ipsoIdx];
  const firstIdx = fragAtomIdxs[0];
  console.log("ipsoPos:", ipsoPos, "firstPos:", P2[firstIdx]);
  const dir = vecNorm(vecSub(P2[firstIdx], ipsoPos));
  console.log("dir:", dir, "len:", vecLen(vecSub(P2[firstIdx], ipsoPos)));
  const q = rotFromTo(dir, [1, 0, 0]);
  console.log("q:", q);
  const local = fragAtomIdxs.map((i) => rotApply(q, vecSub(P2[i], ipsoPos)));
  console.log("local O:", local[0]);
})();

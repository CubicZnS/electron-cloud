/* ================= three.js 场景 ================= */
const DEBUG = new URLSearchParams(location.search).has("debug");
// 崩溃自愈检测：上次加载异常终止（无 beforeunload）→ 判定崩溃 → 进入极简档
try {
  if (sessionStorage.getItem("ec_crash") === "1") window.__CRASHED = true;
  sessionStorage.setItem("ec_crash", "1");
  window.addEventListener("beforeunload", function (){ try { sessionStorage.removeItem("ec_crash"); } catch (e){} });
} catch (e){}
const IS_TOUCH = ("ontouchstart" in window) || (navigator.maxTouchPoints || 0) > 0;
const IS_MOBILE = IS_TOUCH || window.innerWidth < 768;
const _qLite = new URLSearchParams(location.search).has("lite");
const IS_LITE = !!window.__CRASHED || _qLite; // 崩溃自愈或 ?lite=1 → 极简档
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x04060a);
const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.6, 10.5);
let renderer = null;
function showFatal(msg){
  const el = document.getElementById("errOverlay");
  if (el){ document.getElementById("errMsg").textContent = msg; el.classList.add("show"); }
}
(function (){
  try {
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl2") || probe.getContext("webgl"))){
      showFatal("当前浏览器不支持 WebGL，无法渲染电子云。请升级浏览器或更换设备后重试。");
    }
  } catch (e){ showFatal("WebGL 初始化失败：" + e.message); }
  renderer = new THREE.WebGLRenderer({ antialias: true });
})();
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, IS_LITE || IS_MOBILE ? 1 : 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
document.getElementById("scene").appendChild(renderer.domElement);
renderer.domElement.addEventListener("webglcontextlost", function (ev){
  ev.preventDefault();
  window.__WEBGL_DEAD = true;
  showFatal("WebGL 上下文已丢失（可能因设备内存/GPU 压力）。请刷新页面重试，或降低画质档位。");
});
renderer.domElement.addEventListener("webglcontextrestored", function (){
  window.__WEBGL_DEAD = false;
  const el = document.getElementById("errOverlay");
  if (el) el.classList.remove("show");
});
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 3.2;
controls.maxDistance = 18;
controls.rotateSpeed = 0.7;
controls.enabled = false;

scene.add(new THREE.AmbientLight(0x8fa3c4, 0.75));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.7);
keyLight.position.set(4, 6, 7);
scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0x7ea6ff, 1.0);
rimLight.position.set(-5, -2, 3);
scene.add(rimLight);
const fillLight = new THREE.PointLight(0xbfd8ff, 0.25, 30);
fillLight.position.set(0, 0, 3);
scene.add(fillLight);

let composer = null;
let bloomPass = null;
function buildComposer(){
  const rt = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, { type: THREE.HalfFloatType });
  composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  if (!IS_LITE){
    bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.55, 0.45);
    composer.addPass(bloomPass);
  }
  composer.addPass(new OutputPass());
}
// 移动端/极简：绕过整个后期合成（UnrealBloomPass/半浮点渲染目标是最常见的移动 GPU 崩溃源）
if (!IS_MOBILE && !IS_LITE) buildComposer();

/* ================= 分子网格 ================= */
const moleculeGroup = new THREE.Group();
scene.add(moleculeGroup);
let atomMeshes = {};
let atomRecords = [];
let bondMeshes = {};
let bondRecords = [];
let dyingList = [];
let pickMeshes = [];

const _m4 = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _v3 = new THREE.Vector3();
const _s3 = new THREE.Vector3();
const _upY = new THREE.Vector3(0, 1, 0);

function disposeAtomMesh(el){
  const m = atomMeshes[el];
  if (m){ moleculeGroup.remove(m); m.geometry.dispose(); m.material.dispose(); delete atomMeshes[el]; }
}
function disposeBondMesh(cls){
  const m = bondMeshes[cls];
  if (m){ moleculeGroup.remove(m); m.geometry.dispose(); m.material.dispose(); delete bondMeshes[cls]; }
}
function ensureAtomMesh(el, count){
  let m = atomMeshes[el];
  if (m) return m;
  const e = ELEMENTS[el];
  const geo = new THREE.SphereGeometry(e.ball, 26, 18);
  const mat = new THREE.MeshStandardMaterial({ color: e.color, roughness: 0.36, metalness: 0.16, emissive: e.color, emissiveIntensity: e.emissive });
  m = new THREE.InstancedMesh(geo, mat, Math.max(count, 1));
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.frustumCulled = false;
  m.renderOrder = 1;
  moleculeGroup.add(m);
  atomMeshes[el] = m;
  return m;
}
const BOND_CFG = {
  single:   { r: 0.088, n: 1 },
  aromatic: { r: 0.102, n: 1 },
  double:   { r: 0.052, n: 2 },
  triple:   { r: 0.042, n: 3 },
};
function ensureBondMesh(cls, count){
  let m = bondMeshes[cls];
  if (m) return m;
  const cfg = BOND_CFG[cls];
  const geo = new THREE.CylinderGeometry(cfg.r, cfg.r, 1, 16);
  const mat = new THREE.MeshStandardMaterial({ color: cls === "aromatic" ? 0x9fb8d6 : 0xbfc9d6, roughness: 0.42, metalness: 0.22, emissive: 0x223344, emissiveIntensity: 0.4 });
  m = new THREE.InstancedMesh(geo, mat, Math.max(count * cfg.n, 1));
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.frustumCulled = false;
  m.renderOrder = 1;
  moleculeGroup.add(m);
  bondMeshes[cls] = m;
  return m;
}
function bondOffsets(cls, dir){
  const u = new THREE.Vector3().crossVectors(dir, _upY);
  if (u.lengthSq() < 1e-6) u.set(1, 0, 0);
  u.normalize();
  const v = new THREE.Vector3().crossVectors(dir, u).normalize();
  if (cls === "double"){
    return [ u.clone().multiplyScalar(0.085), u.clone().multiplyScalar(-0.085) ];
  }
  if (cls === "triple"){
    const out = [];
    for (let k = 0; k < 3; k++){
      const th = k * 2.094395;
      out.push(new THREE.Vector3().addScaledVector(u, Math.cos(th) * 0.085).addScaledVector(v, Math.sin(th) * 0.085));
    }
    return out;
  }
  return [ new THREE.Vector3() ];
}
function composeAtom(mesh, rec, scale){
  const s = scale * (1 + 0.22 * (rec.hoverScale || 0));
  _v3.set(rec.pos[0], rec.pos[1], rec.pos[2]);
  _s3.set(s, s, s);
  _q.identity();
  _m4.compose(_v3, _q, _s3);
  mesh.setMatrixAt(rec.instanceIdx, _m4);
}
function composeBond(mesh, rec, f){
  const len = rec.len;
  const half = len * f * 0.5;
  _s3.set(1, Math.max(len * f, 1e-4), 1);
  for (let k = 0; k < rec.offsets.length; k++){
    _v3.copy(rec.a).add(rec.offsets[k]).addScaledVector(rec.dir, half);
    _m4.compose(_v3, rec.q, _s3);
    mesh.setMatrixAt(rec.instanceIdx * rec.offsets.length + k, _m4);
  }
}

let currentMol = null;
let currentField = null;

function buildMoleculeMeshes(mol){
  for (const el in atomMeshes) disposeAtomMesh(el);
  for (const cls in bondMeshes) disposeBondMesh(cls);
  atomRecords = [];
  bondRecords = [];
  pickMeshes = [];
  const byEl = {};
  for (let i = 0; i < mol.atoms.length; i++){
    const a = mol.atoms[i];
    (byEl[a.el] = byEl[a.el] || []).push(i);
  }
  for (const el in byEl){
    const list = byEl[el];
    const mesh = ensureAtomMesh(el, list.length);
    for (let idx = 0; idx < list.length; idx++){
      const a = mol.atoms[list[idx]];
      const rec = { pos: a.pos, key: a.key, el: a.el, ringPos: a.ringPos, fragGroup: a.fragGroup, localIdx: a.localIdx, state: "steady", t0: 0, hover: 0, hoverScale: 0, hoverBase: 0, hoverT: -99, instanceIdx: idx, mesh: mesh, atomIdx: list[idx] };
      atomRecords.push(rec);
      composeAtom(mesh, rec, 1);
    }
    mesh.instanceMatrix.needsUpdate = true;
    pickMeshes.push(mesh);
  }
  const byCls = {};
  for (let i = 0; i < mol.bonds.length; i++){
    const b = mol.bonds[i];
    const cls = b.order >= 3 ? "triple" : b.order >= 2 ? "double" : b.order >= 1.5 ? "aromatic" : "single";
    (byCls[cls] = byCls[cls] || []).push(i);
  }
  for (const cls in byCls){
    const list = byCls[cls];
    const mesh = ensureBondMesh(cls, list.length);
    for (let idx = 0; idx < list.length; idx++){
      const b = mol.bonds[list[idx]];
      const a = mol.atoms[b.i].pos, bb = mol.atoms[b.j].pos;
      const rec = {
        a: new THREE.Vector3(a[0], a[1], a[2]),
        b: new THREE.Vector3(bb[0], bb[1], bb[2]),
        cls: cls, state: "steady", t0: 0, instanceIdx: idx, mesh: mesh, bondIdx: list[idx],
      };
      rec.dir = new THREE.Vector3().subVectors(rec.b, rec.a);
      rec.len = rec.dir.length();
      rec.dir.normalize();
      rec.q = new THREE.Quaternion().setFromUnitVectors(_upY, rec.dir);
      rec.offsets = bondOffsets(cls, rec.dir);
      bondRecords.push(rec);
      composeBond(mesh, rec, 1);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }
}

function spawnDying(atoms, molA, bonds, t){
  if (!atoms.length && !bonds.length) return;
  const byEl = {};
  atoms.forEach(function (a){ (byEl[a.el] = byEl[a.el] || []).push(a); });
  for (const el in byEl){
    const list = byEl[el];
    const e = ELEMENTS[el];
    const geo = new THREE.SphereGeometry(e.ball, 20, 14);
    const mat = new THREE.MeshStandardMaterial({ color: e.color, roughness: 0.36, metalness: 0.16, emissive: e.color, emissiveIntensity: e.emissive });
    const mesh = new THREE.InstancedMesh(geo, mat, list.length);
    mesh.frustumCulled = false;
    mesh.renderOrder = 1;
    moleculeGroup.add(mesh);
    const recs = list.map(function (a, idx){ return { pos: a.pos, idx: idx, mesh: mesh }; });
    recs.forEach(function (r){
      _v3.set(r.pos[0], r.pos[1], r.pos[2]);
      _s3.set(1, 1, 1);
      _q.identity();
      _m4.compose(_v3, _q, _s3);
      mesh.setMatrixAt(r.idx, _m4);
    });
    mesh.instanceMatrix.needsUpdate = true;
    dyingList.push({ mesh: mesh, kind: "atom", recs: recs, t0: t, dur: 0.42 });
  }
  const byCls = {};
  bonds.forEach(function (b){
    const cls = b.order >= 3 ? "triple" : b.order >= 2 ? "double" : b.order >= 1.5 ? "aromatic" : "single";
    (byCls[cls] = byCls[cls] || []).push(b);
  });
  for (const cls in byCls){
    const list = byCls[cls];
    const cfg = BOND_CFG[cls];
    const geo = new THREE.CylinderGeometry(cfg.r, cfg.r, 1, 16);
    const mat = new THREE.MeshStandardMaterial({ color: cls === "aromatic" ? 0x9fb8d6 : 0xbfc9d6, roughness: 0.42, metalness: 0.22, emissive: 0x223344, emissiveIntensity: 0.4 });
    const mesh = new THREE.InstancedMesh(geo, mat, list.length * cfg.n);
    mesh.frustumCulled = false;
    mesh.renderOrder = 1;
    moleculeGroup.add(mesh);
    const recs = list.map(function (b){
      const a = molA.atoms[b.i].pos, bb = molA.atoms[b.j].pos;
      const va = new THREE.Vector3(a[0], a[1], a[2]);
      const vb = new THREE.Vector3(bb[0], bb[1], bb[2]);
      const dir = new THREE.Vector3().subVectors(vb, va);
      const len = dir.length();
      dir.normalize();
      const qq = new THREE.Quaternion().setFromUnitVectors(_upY, dir);
      return { va: va, dir: dir, len: len, offs: bondOffsets(cls, dir), qq: qq, idx: 0, mesh: mesh };
    });
    recs.forEach(function (r, idx){
      r.idx = idx;
      _s3.set(1, Math.max(r.len, 1e-4), 1);
      for (let k = 0; k < r.offs.length; k++){
        _v3.copy(r.va).add(r.offs[k]).addScaledVector(r.dir, r.len * 0.5);
        _m4.compose(_v3, r.qq, _s3);
        mesh.setMatrixAt(idx * r.offs.length + k, _m4);
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
    dyingList.push({ mesh: mesh, kind: "bond", recs: recs, t0: t, dur: 0.42 });
  }
}

function updateDying(t){
  for (let d = dyingList.length - 1; d >= 0; d--){
    const D = dyingList[d];
    const k = (t - D.t0) / D.dur;
    if (k >= 1){
      moleculeGroup.remove(D.mesh);
      D.mesh.geometry.dispose();
      D.mesh.material.dispose();
      dyingList.splice(d, 1);
      continue;
    }
    const f = 1 - easeInCubic(clamp(k, 0, 1));
    if (D.kind === "atom"){
      D.recs.forEach(function (r){
        _v3.set(r.pos[0], r.pos[1], r.pos[2]);
        _s3.set(f, f, f);
        _q.identity();
        _m4.compose(_v3, _q, _s3);
        r.mesh.setMatrixAt(r.idx, _m4);
      });
    } else {
      D.recs.forEach(function (r){
        const len = Math.max(r.len * f, 1e-4);
        _s3.set(1, len, 1);
        for (let kk = 0; kk < r.offs.length; kk++){
          _v3.copy(r.va).add(r.offs[kk]).addScaledVector(r.dir, len * 0.5);
          _m4.compose(_v3, r.qq, _s3);
          r.mesh.setMatrixAt(r.idx * r.offs.length + kk, _m4);
        }
      });
    }
    D.mesh.instanceMatrix.needsUpdate = true;
  }
}

const hoverAnims = [];
function setHover(rec, on){
  if (!rec) return;
  rec.hover = on ? 1 : 0;
  rec.hoverBase = rec.hoverScale || 0;
  rec.hoverT = performance.now() / 1000;
  if (hoverAnims.indexOf(rec) < 0) hoverAnims.push(rec);
}
function updateMoleculeAnims(t){
  // 悬停缩放动画：渐渐变大 / 渐渐恢复
  for (let hi = hoverAnims.length - 1; hi >= 0; hi--){
    const rec = hoverAnims[hi];
    const target = rec.hover ? 1 : 0;
    const k = clamp((performance.now() / 1000 - rec.hoverT) / 0.22, 0, 1);
    const e = easeInOutCubic(k);
    rec.hoverScale = target ? rec.hoverBase + (1 - rec.hoverBase) * e : rec.hoverBase * (1 - e);
    composeAtom(rec.mesh, rec, 1);
    rec.mesh.instanceMatrix.needsUpdate = true;
    if (k >= 1){
      if (!target) rec.hoverScale = 0;
      hoverAnims.splice(hi, 1);
    }
  }
  let atomNeeds = {};
  for (const r of atomRecords){
    if (r.state === "in"){
      const k = clamp((t - r.t0) / 0.5, 0, 1);
      composeAtom(r.mesh, r, easeOutBack(k));
      atomNeeds[r.mesh.uuid] = r.mesh;
      if (k >= 1) r.state = "steady";
    }
  }
  let bondNeeds = {};
  for (const r of bondRecords){
    if (r.state === "in"){
      const k = clamp((t - r.t0) / 0.5, 0, 1);
      composeBond(r.mesh, r, easeOutBack(k));
      bondNeeds[r.mesh.uuid] = r.mesh;
      if (k >= 1) r.state = "steady";
    }
  }
  for (const k in atomNeeds) atomNeeds[k].instanceMatrix.needsUpdate = true;
  for (const k in bondNeeds) bondNeeds[k].instanceMatrix.needsUpdate = true;
}

/* ================= 粒子系统 ================= */
let cloud = null;
function createCloud(n){
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  geo.setAttribute("aOldPos", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  geo.setAttribute("aOldProps", new THREE.BufferAttribute(new Float32Array(n * 4), 4));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(new Float32Array(n * 4), 4)); // xyz 噪声种子, w=延迟
  geo.setAttribute("aProps", new THREE.BufferAttribute(new Float32Array(n * 4), 4));
  geo.setAttribute("aPath0", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  geo.setAttribute("aPath1", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  geo.setAttribute("aPath2", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  geo.setAttribute("aPath3", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  geo.setAttribute("aPath4", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  geo.setAttribute("aPath5", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  geo.setAttribute("aPath6", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  geo.setAttribute("aPath7", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  geo.setAttribute("aPath8", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  geo.setAttribute("aPathCount", new THREE.BufferAttribute(new Float32Array(n), 1));
  const uniforms = {
    uTime: { value: 0 },
    uTransStart: { value: -999 },
    uTransDur: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
    uScale: { value: 1300 },
    uParticleSize: { value: QUALITY[SETTINGS.quality].psize },
    uNoiseAmp: { value: SETTINGS.noiseAmp },
    uSimple: { value: IS_MOBILE || IS_LITE ? 1 : 0 }, // 移动/极简：单噪声着色器
    uBreathAmp: { value: SETTINGS.breathAmp },
    uFlowAmp: { value: SETTINGS.flowAmp },
    uCloudAlpha: { value: SETTINGS.cloudAlpha },
    uCenter: { value: new THREE.Vector3(0, 0, 0) },
    uAnchor: { value: new THREE.Vector3(0, 0, 0) },
    uDensityTex: { value: buildLUTTexture(COLORMAPS[SETTINGS.colormap].stops) },
    uDensGamma: { value: SETTINGS.densGamma },
  };
  const mat = new THREE.ShaderMaterial({
    vertexShader: CLOUD_VERTEX,
    fragmentShader: CLOUD_FRAGMENT,
    uniforms: uniforms,
    defines: ((IS_MOBILE || IS_LITE) ? { SIMPLE: 1 } : {}), // 移动/极简：#ifdef SIMPLE 编译期移除噪声函数（Safari 驱动崩溃防护；桌面保留完整噪声）
    transparent: true,
    depthWrite: false,
    depthTest: true,
    blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  pts.renderOrder = 3;
  scene.add(pts);
  return { geo: geo, mat: mat, pts: pts, count: n, uniforms: uniforms };
}

function buildLUTTexture(stops){
  const SIZE = 256;
  const data = new Uint8Array(SIZE * 4);
  for (let i = 0; i < SIZE; i++){
    const c = sampleStops(stops, i / (SIZE - 1));
    data[i*4] = c[0]; data[i*4+1] = c[1]; data[i*4+2] = c[2]; data[i*4+3] = 255;
  }
  const tex = new THREE.DataTexture(data, SIZE, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}
let densityLUT = null;
function setColormap(name){
  if (!COLORMAPS[name]) return;
  SETTINGS.colormap = name;
  const tex = buildLUTTexture(COLORMAPS[name].stops);
  if (cloud){
    if (densityLUT) densityLUT.dispose();
    densityLUT = tex;
    cloud.uniforms.uDensityTex.value = tex;
  }
  const sel = document.getElementById("cmapSel");
  if (sel) sel.value = name;
  const bar = document.getElementById("cmapBar");
  if (bar) bar.style.background = colormapCSS(COLORMAPS[name].stops);
}

function nearestAtomIdx(mol, x, y, z){
  let best = 0, bestD2 = Infinity;
  for (let i = 0; i < mol.atoms.length; i++){
    const p = mol.atoms[i].pos;
    const d2 = (p[0]-x)*(p[0]-x) + (p[1]-y)*(p[1]-y) + (p[2]-z)*(p[2]-z);
    if (d2 < bestD2){ bestD2 = d2; best = i; }
  }
  return best;
}
function bfsPath(adj, a, b){
  if (a === b) return [a];
  const prev = new Int32Array(adj.length);
  prev.fill(-1);
  const queue = [a];
  prev[a] = a;
  let found = false;
  while (queue.length && !found){
    const cur = queue.shift();
    for (const nb of adj[cur]){
      if (prev[nb] === -1){
        prev[nb] = cur;
        if (nb === b){ found = true; break; }
        queue.push(nb);
      }
    }
  }
  if (!found) return [a, b];
  const path = [b];
  let cur = b;
  while (cur !== a){ cur = prev[cur]; path.push(cur); }
  return path.reverse();
}
/* 沿 σ 骨架折线路径：远距离粒子途经键中点流动，而非直线飞越 */
function buildFlowPaths(mol, fromArr, toArr, count, onDone){
  const nAt = mol.atoms.length;
  const adj = [];
  for (let i = 0; i < nAt; i++) adj.push([]);
  for (const b of mol.bonds){ adj[b.i].push(b.j); adj[b.j].push(b.i); }
  // 原子对最短路径缓存（图很小，n² 次 BFS 开销可忽略；省去逐粒子 BFS）
  const pathCache = new Map();
  for (let a = 0; a < nAt; a++){
    for (let b = 0; b < nAt; b++){
      if (a !== b) pathCache.set(a * nAt + b, bfsPath(adj, a, b));
    }
  }
  // 空间哈希（1.4Å 格，固定 10³ 整数索引网格）最近原子查询：纯整数算术，O(1) 而非 O(原子数)
  const AC = 1.4, GS = 10, GO = 5;
  const atomCells = new Array(GS * GS * GS);
  const cellI = function (x, y, z){
    const ix = Math.floor(x / AC) + GO, iy = Math.floor(y / AC) + GO, iz = Math.floor(z / AC) + GO;
    const cx = ix < 0 ? 0 : ix > GS - 1 ? GS - 1 : ix;
    const cy = iy < 0 ? 0 : iy > GS - 1 ? GS - 1 : iy;
    const cz = iz < 0 ? 0 : iz > GS - 1 ? GS - 1 : iz;
    return (cz * GS + cy) * GS + cx;
  };
  for (let i = 0; i < nAt; i++){
    const p = mol.atoms[i].pos;
    const k = cellI(p[0], p[1], p[2]);
    if (!atomCells[k]) atomCells[k] = [];
    atomCells[k].push(i);
  }
  const nearest = function (x, y, z){
    let best = 0, bestD2 = Infinity;
    const cx = Math.floor(x / AC) + GO, cy = Math.floor(y / AC) + GO, cz = Math.floor(z / AC) + GO;
    const x0 = cx - 1 < 0 ? 0 : cx - 1, x1 = cx + 1 > GS - 1 ? GS - 1 : cx + 1;
    const y0 = cy - 1 < 0 ? 0 : cy - 1, y1 = cy + 1 > GS - 1 ? GS - 1 : cy + 1;
    const z0 = cz - 1 < 0 ? 0 : cz - 1, z1 = cz + 1 > GS - 1 ? GS - 1 : cz + 1;
    for (let iz = z0; iz <= z1; iz++){
      for (let iy = y0; iy <= y1; iy++){
        for (let ix = x0; ix <= x1; ix++){
          const arr = atomCells[(iz * GS + iy) * GS + ix];
          if (!arr) continue;
          for (const i of arr){
            const p = mol.atoms[i].pos;
            const d2 = (p[0]-x)*(p[0]-x) + (p[1]-y)*(p[1]-y) + (p[2]-z)*(p[2]-z);
            if (d2 < bestD2){ bestD2 = d2; best = i; }
          }
        }
      }
    }
    return best;
  };
  const NW = 9; // 路点数（8 段）——骨架折线：折点恰在原子处，弯折严格贴 σ 骨架
  const pathArr = [];
  for (let k = 0; k < NW; k++) pathArr.push(new Float32Array(count * 3));
  const pc = new Float32Array(count);
  let pi = 0;
  _yieldChunks(13, function (t0){
    const end = Math.min(pi + 24000, count);
    for (; pi < end; pi++){
      const oi = pi * 3;
      const ox = fromArr[oi], oy = fromArr[oi + 1], oz = fromArr[oi + 2];
      const nx = toArr[oi], ny = toArr[oi + 1], nz = toArr[oi + 2];
      pathArr[0][oi] = ox; pathArr[0][oi + 1] = oy; pathArr[0][oi + 2] = oz;
      let nW = 1;
      const ai = nearest(ox, oy, oz);
      const bi = nearest(nx, ny, nz);
      if (ai !== bi && ai >= 0 && bi >= 0){
        // 跨原子迁移：一律沿 σ 骨架（BFS 键路径，途经原子）流动，无直飞捷径
        const along = pathCache.get(ai * nAt + bi);
        if (along){
          for (let k = 0; k < along.length && nW < NW - 1; k++){
            const p = mol.atoms[along[k]].pos;
            pathArr[nW][oi] = p[0]; pathArr[nW][oi + 1] = p[1]; pathArr[nW][oi + 2] = p[2];
            nW++;
          }
        }
      }
      pathArr[nW][oi] = nx; pathArr[nW][oi + 1] = ny; pathArr[nW][oi + 2] = nz;
      nW++;
      for (let k = 0; k < NW; k++){
        const idx = Math.min(k, nW - 1);
        pathArr[k][oi] = pathArr[idx][oi];
        pathArr[k][oi + 1] = pathArr[idx][oi + 1];
        pathArr[k][oi + 2] = pathArr[idx][oi + 2];
      }
      pc[pi] = Math.max(nW - 1, 1);
    }
    return pi >= count ? { p0: pathArr[0], p1: pathArr[1], p2: pathArr[2], p3: pathArr[3], p4: pathArr[4], p5: pathArr[5], p6: pathArr[6], p7: pathArr[7], p8: pathArr[8], pc: pc } : undefined;
  }, onDone);
}
function walkPathJS(paths, pc, i, e){
  const segs = pc[i];
  const pp = e * segs;
  const oi = i * 3;
  const s = Math.min(Math.floor(pp), 7);
  const f = pp - s;
  const a = paths[s], b = paths[Math.min(s + 1, 8)];
  return [a[oi] + (b[oi] - a[oi]) * f, a[oi + 1] + (b[oi + 1] - a[oi + 1]) * f, a[oi + 2] + (b[oi + 2] - a[oi + 2]) * f];
}
function padCloudPaths(posArr, geo){
  for (let k = 0; k < 9; k++){
    geo.attributes["aPath" + k].array.set(posArr);
    geo.attributes["aPath" + k].needsUpdate = true;
  }
  geo.attributes.aPathCount.array.fill(1);
  geo.attributes.aPathCount.needsUpdate = true;
}
let transitionGen = 0;
function transitionCloud(field, anchorPos){
  if (!cloud) return;
  const geo = cloud.geo;
  const oldArr = geo.attributes.position.array;
  const oldSnapshot = new Float32Array(oldArr); // 快照：后续 position 会被覆盖
  const prevStart = cloud.uniforms.uTransStart.value;
  const prevDur = cloud.uniforms.uTransDur.value;
  let fromArr = oldSnapshot;
  if (prevDur > 0.001 && simTime - prevStart < prevDur && cloud.count){
    // 过渡进行中被再次触发：沿旧路径取「当前显示位置」续接，避免跳变
    const darr = geo.attributes.aSeed.array;
    const paths = [];
    for (let k = 0; k < 9; k++) paths.push(geo.attributes["aPath" + k].array);
    const ppc = geo.attributes.aPathCount.array;
    const tmp = new Float32Array(cloud.count * 3);
    for (let i = 0; i < cloud.count; i++){
      const tt = clamp((simTime - prevStart - darr[i * 4 + 3] * 0.6 * prevDur) / prevDur, 0, 1);
      const e = tt * tt * (3 - 2 * tt);
      const w = walkPathJS(paths, ppc, i, e);
      const oi = i * 3;
      tmp[oi] = w[0]; tmp[oi + 1] = w[1]; tmp[oi + 2] = w[2];
    }
    geo.attributes.aOldPos.array.set(tmp);
    fromArr = tmp;
  } else {
    geo.attributes.aOldPos.array.set(oldSnapshot);
  }
  geo.attributes.aOldPos.needsUpdate = true;
  const grid = buildDensityGrid(field);
  const data = sampleCloud(field, cloud.count, null, grid);
  // 保存旧属性供过渡插值（位置/尺寸/亮度/密度同步丝滑过渡）
  geo.attributes.aOldProps.array.set(geo.attributes.aProps.array);
  geo.attributes.aOldProps.needsUpdate = true;
  const gen = ++transitionGen;
  // 分帧匹配（不再冻结主线程）；完成后立即写入目标并分帧算骨架路径，就绪后启动过渡
  matchCloudTargetsAsync(oldSnapshot, data.pos, cloud.count, function (m){
    if (gen !== transitionGen) return; // 已被更新的过渡取代
    const pos = new Float32Array(cloud.count * 3);
    const size = new Float32Array(cloud.count);
    const bright = new Float32Array(cloud.count);
    const density = new Float32Array(cloud.count);
    for (let i = 0; i < cloud.count; i++){
      const ti = m.map[i];
      const oi = i * 3, tj = ti * 3;
      pos[oi] = data.pos[tj];
      pos[oi + 1] = data.pos[tj + 1];
      pos[oi + 2] = data.pos[tj + 2];
      size[i] = data.size[ti];
      bright[i] = data.bright[ti];
      density[i] = data.density[ti];
    }
    geo.attributes.position.array.set(pos);
    geo.attributes.position.needsUpdate = true;
    // 沿 σ 骨架路径流动（分帧）
    buildFlowPaths(currentMol, fromArr, pos, cloud.count, function (paths){
      if (gen !== transitionGen) return;
      geo.attributes.aPath0.array.set(paths.p0);
      geo.attributes.aPath0.needsUpdate = true;
      geo.attributes.aPath1.array.set(paths.p1);
      geo.attributes.aPath1.needsUpdate = true;
      geo.attributes.aPath2.array.set(paths.p2);
      geo.attributes.aPath2.needsUpdate = true;
      geo.attributes.aPath3.array.set(paths.p3);
      geo.attributes.aPath3.needsUpdate = true;
      geo.attributes.aPath4.array.set(paths.p4);
      geo.attributes.aPath4.needsUpdate = true;
      geo.attributes.aPath5.array.set(paths.p5);
      geo.attributes.aPath5.needsUpdate = true;
      geo.attributes.aPath6.array.set(paths.p6);
      geo.attributes.aPath6.needsUpdate = true;
      geo.attributes.aPath7.array.set(paths.p7);
      geo.attributes.aPath7.needsUpdate = true;
      geo.attributes.aPath8.array.set(paths.p8);
      geo.attributes.aPath8.needsUpdate = true;
      geo.attributes.aPathCount.array.set(paths.pc);
      geo.attributes.aPathCount.needsUpdate = true;
      const props = new Float32Array(cloud.count * 4);
      for (let i = 0; i < cloud.count; i++){
        props[i * 4] = size[i];
        props[i * 4 + 1] = bright[i];
        props[i * 4 + 2] = density[i];
      }
      geo.attributes.aProps.array.set(props);
      geo.attributes.aProps.needsUpdate = true;
      geo.attributes.aSeed.array.set(data.seed);
      const sd = geo.attributes.aSeed.array;
      const maxD = 3.6;
      for (let i = 0; i < cloud.count; i++){
        const oi = i * 3;
        // 锚点距离：替换点附近的粒子先动，形成向外的流动波
        const dd = Math.hypot(pos[oi] - anchorPos[0], pos[oi + 1] - anchorPos[1], pos[oi + 2] - anchorPos[2]);
        // 位移大小：远距离粒子稍后出发，先局部形变、后整体迁移，读起来是有序流动
        const dis = Math.hypot(pos[oi] - fromArr[oi], pos[oi + 1] - fromArr[oi + 1], pos[oi + 2] - fromArr[oi + 2]);
        sd[i * 4 + 3] = clamp(0.36 * Math.pow(clamp(dd / maxD, 0, 1), 1.6) + 0.46 * clamp(dis / 3.0, 0, 1) + 0.14 * seededRand(), 0, 0.95);
      }
      geo.attributes.aSeed.needsUpdate = true;
      cloud.uniforms.uTransStart.value = simTime;
      cloud.uniforms.uTransDur.value = SETTINGS.transDur;
      cloud.uniforms.uAnchor.value.set(anchorPos[0], anchorPos[1], anchorPos[2]);
    });
  });
}
function setParticleCount(n){
  if (cloud){
    scene.remove(cloud.pts);
    cloud.geo.dispose();
    cloud.mat.dispose();
    cloud = null;
  }
  cloud = createCloud(n);
  if (currentField){
    const grid = buildDensityGrid(currentField);
    const data = sampleCloud(currentField, n, null, grid);
    cloud.geo.attributes.position.array.set(data.pos);
    cloud.geo.attributes.position.needsUpdate = true;
    padCloudPaths(data.pos, cloud.geo);
    {
      const props = new Float32Array(n * 4);
      for (let i = 0; i < n; i++){ props[i * 4] = data.size[i]; props[i * 4 + 1] = data.bright[i]; props[i * 4 + 2] = data.density[i]; }
      cloud.geo.attributes.aProps.array.set(props);
      cloud.geo.attributes.aProps.needsUpdate = true;
    }
    cloud.geo.attributes.aSeed.array.set(data.seed);
    cloud.geo.attributes.aSeed.needsUpdate = true;
    cloud.uniforms.uTransStart.value = -999;
    cloud.uniforms.uTransDur.value = 0;
  }
  updateParticleUI();
}

/* 悬停显示：把场模型的相对因子挂到碳记录上。
   预置分子：苯环碳=1.00（原规范）；创造模式：所有碳平均=1.00（含碳架本征基线） */
function updateRelDensities(){
  if (!currentField || !currentField.factor || !atomRecords.length) return;
  const isCustom = currentMol && currentMol.isCustom;
  let mean = 1;
  if (isCustom){
    let s = 0, c = 0;
    for (const rec of atomRecords){
      if (rec.el === "C" && rec.atomIdx >= 0 && rec.atomIdx < creatorState.pts.length){
        s += currentField.factor[rec.atomIdx]; c++;
      }
    }
    if (c) mean = s / c;
  }
  for (const rec of atomRecords){
    if (rec.el === "C") rec.rel = currentField.factor[rec.atomIdx] / mean;
  }
}

/* ================= 分子变更与过渡 ================= */
function changeMolecule(frags, anchorHint){
  applyMol(buildMolecule(frags), anchorHint);
}
/* 应用任意分子对象（预设/创造模式共用管线：diff → 网格 → 场 → 云过渡） */
function applyMol(next, anchorHint){
  const t = simTime;
  const prev = currentMol;
  const prevKeys = new Set(prev.atoms.map(function (a){ return a.key; }));
  const nextKeys = new Set(next.atoms.map(function (a){ return a.key; }));
  const prevBonds = prev.bonds.map(function (b){ return bondKey(prev.atoms[b.i].key, prev.atoms[b.j].key, b.order); });
  const nextBonds = next.bonds.map(function (b){ return bondKey(next.atoms[b.i].key, next.atoms[b.j].key, b.order); });
  const prevBSet = new Set(prevBonds);
  const nextBSet = new Set(nextBonds);
  const removedAtoms = prev.atoms.filter(function (a){ return !nextKeys.has(a.key); });
  const removedBonds = [];
  prev.bonds.forEach(function (b, i){ if (!nextBSet.has(prevBonds[i])) removedBonds.push(b); });
  spawnDying(removedAtoms, prev, removedBonds, t);
  const addedKeys = new Set();
  next.atoms.forEach(function (a){ if (!prevKeys.has(a.key)) addedKeys.add(a.key); });
  currentMol = next;
  buildMoleculeMeshes(next);
  atomRecords.forEach(function (rec){
    if (addedKeys.has(rec.key)){
      rec.state = "in";
      rec.t0 = t + 0.04 + Math.random() * 0.1;
      composeAtom(rec.mesh, rec, 0.001);
    }
  });
  bondRecords.forEach(function (rec){
    const b = next.bonds[rec.bondIdx];
    const bk = bondKey(next.atoms[b.i].key, next.atoms[b.j].key, b.order);
    if (!prevBSet.has(bk)){
      rec.state = "in";
      rec.t0 = t + 0.05 + Math.random() * 0.1;
      composeBond(rec.mesh, rec, 0.001);
    }
  });
  atomRecords.forEach(function (rec){ if (rec.state === "in") rec.mesh.instanceMatrix.needsUpdate = true; });
  bondRecords.forEach(function (rec){ if (rec.state === "in") rec.mesh.instanceMatrix.needsUpdate = true; });
  currentField = computeField(next, SETTINGS.mode);
  updateRelDensities();
  let anchor = anchorHint || [0, 0, 0];
  if (next.fragments && next.fragments.length){
    const f0 = next.fragments[0];
    if (f0.atomIdx !== undefined && next.atoms[f0.atomIdx]){
      const ap = next.atoms[f0.atomIdx].pos;
      anchor = [ap[0], ap[1], ap[2]];
    }
  }
  transitionCloud(currentField, anchor);
  rebuildLegend();
  rebuildExplain();
}

/* ================= Explain 教学箭头 ================= */
const explainGroup = new THREE.Group();
explainGroup.visible = false;
scene.add(explainGroup);
function v3toTHREE(v){ return new THREE.Vector3(v[0], v[1], v[2]); }
function makeLabelSprite(text, colorStr){
  const c = document.createElement("canvas");
  c.width = 160; c.height = 80;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, 160, 80);
  ctx.font = "700 44px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,0.85)";
  ctx.shadowBlur = 10;
  ctx.fillStyle = colorStr;
  ctx.fillText(text, 80, 42);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const spr = new THREE.Sprite(mat);
  spr.scale.set(0.9, 0.45, 1);
  return spr;
}
function makeArrow(from, to, color, label){
  const g = new THREE.Group();
  const d = new THREE.Vector3().subVectors(to, from);
  const len = d.length();
  if (len < 0.01) return g;
  d.normalize();
  const shaftLen = len * 0.7;
  const q = new THREE.Quaternion().setFromUnitVectors(_upY, d);
  const geo = new THREE.CylinderGeometry(0.016, 0.016, 1, 10);
  const mat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.9 });
  const shaft = new THREE.Mesh(geo, mat);
  shaft.matrixAutoUpdate = false;
  _v3.copy(from).addScaledVector(d, shaftLen * 0.5);
  _s3.set(1, shaftLen, 1);
  _m4.compose(_v3, q, _s3);
  shaft.matrix.copy(_m4);
  g.add(shaft);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.14, 10), mat);
  cone.matrixAutoUpdate = false;
  _v3.copy(from).addScaledVector(d, shaftLen + 0.07);
  _s3.set(1, 1, 1);
  _m4.compose(_v3, q, _s3);
  cone.matrix.copy(_m4);
  g.add(cone);
  if (label){
    const spr = makeLabelSprite(label, "#" + color.toString(16).padStart(6, "0"));
    _v3.copy(from).addScaledVector(d, len * 0.5);
    spr.position.copy(_v3);
    spr.position.y += 0.42;
    g.add(spr);
  }
  return g;
}
function clearGroup(g){
  while (g.children.length){
    const c = g.children[0];
    g.remove(c);
    if (c.geometry) c.geometry.dispose();
    if (c.material){
      if (c.material.map) c.material.map.dispose();
      c.material.dispose();
    }
  }
}
function rebuildExplain(){
  clearGroup(explainGroup);
  if (!currentMol) return;
  currentMol.fragments.forEach(function (f, fi){
    const g = GROUPS[f.group];
    let ipso, first;
    if (currentMol.isCustom){
      // 创造模式：官能团原子位置来自已构建的分子
      const ga = currentMol.atoms.find(function (a){ return a.fragId === fi && a.localIdx === 0; });
      ipso = currentMol.atoms[f.atomIdx].pos;
      first = ga ? ga.pos : [ipso[0], ipso[1] + 1.5, ipso[2]];
    } else {
      const th = Math.PI / 180 * (30 + 60 * f.pos);
      const gd = MOLECULE_DATA.fragments[f.group];
      const q0 = rotZ2(gd.atoms[0].p, th);
      ipso = ringPos(f.pos);
      first = [q0[0] + ipso[0], q0[1] + ipso[1], q0[2]];
    }
    const ringC = [0, 0, 0];
    if (g.sigmaM !== 0){
      const from = g.sigmaM < 0 ? first : ipso;
      const to = g.sigmaM < 0 ? ipso : first;
      explainGroup.add(makeArrow(v3toTHREE(from), v3toTHREE(to), 0xffb35c, signLabel(g.sigmaM) + "I"));
    }
    if (g.sigmaP - g.sigmaM !== 0){
      const from = g.sigmaP - g.sigmaM < 0 ? first : ringC;
      const to = g.sigmaP - g.sigmaM < 0 ? ringC : first;
      explainGroup.add(makeArrow(v3toTHREE(from), v3toTHREE(to), 0xb893ff, signLabel(g.sigmaP - g.sigmaM) + "M"));
    }
  });
}

/* ================= 拾取 ================= */
/* 屏幕投影拾取：原子投影到屏幕做 2D 圆判定，取最近者。
   不依赖网格实例/动画缩放——「生长中」的小球、SwiftShader 慢速 rAF 下依然稳定可点。 */
const _pv = new THREE.Vector3();
function pickAtom(event){
  const rect = renderer.domElement.getBoundingClientRect();
  const mx = event.clientX - rect.left, my = event.clientY - rect.top;
  const camPos = camera.position;
  const fovHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  let best = null, bestD = Infinity;
  for (const rec of atomRecords){
    const px = rec.pos[0], py = rec.pos[1], pz = rec.pos[2];
    _pv.set(px, py, pz).project(camera);
    if (_pv.z > 1) continue; // 相机后方
    const dist = Math.hypot(px - camPos.x, py - camPos.y, pz - camPos.z);
    if (dist < 0.1) continue;
    const ballR = ELEMENTS[rec.el] ? ELEMENTS[rec.el].ball : 0.34;
    let rPx = (ballR * rect.height) / (2 * fovHalf * dist);
    if (rPx < 8) rPx = 8; // 最小可点半径
    const sx = (_pv.x * 0.5 + 0.5) * rect.width;
    const sy = (-_pv.y * 0.5 + 0.5) * rect.height;
    const ddx = mx - sx, ddy = my - sy;
    const d2 = ddx * ddx + ddy * ddy;
    if (d2 < rPx * rPx && d2 < bestD){ bestD = d2; best = rec; }
  }
  return best;
}

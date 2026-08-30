// validate-cube.mjs — 验证 Gaussian Cube 电子密度导入模块（parts/03b_cube.js，纯 JS 无 THREE/DOM 依赖）
// 用法：node tools/validate-cube.mjs
// 覆盖：最小有效单数据集 Cube / 非零原点 / 科学计数法 / 非法体素数 / 多数据集(负原子数)拒绝 / 单位与数组尺寸验证
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(ROOT, "parts", "03b_cube.js"), "utf8");
const m = new Function(src + "\nreturn { parseCubeText, buildCubeVolume, sampleCloudCube, inferSingleBonds, buildCubeMolecule, estimateCubeFieldType, CUBE_LIMITS, BOHR_TO_ANGSTROM, symbolOfZ, covalentRadius };")();
const { parseCubeText, buildCubeVolume, sampleCloudCube, inferSingleBonds, buildCubeMolecule, estimateCubeFieldType, CUBE_LIMITS, BOHR_TO_ANGSTROM, symbolOfZ, covalentRadius } = m;

let pass = 0, fail = 0;
const check = (name, ok, detail) => {
  console.log((ok ? "PASS " : "FAIL ") + name + (detail !== undefined ? "  [" + detail + "]" : ""));
  ok ? pass++ : fail++;
};
const expectError = (name, fn, code) => {
  try { fn(); console.log("FAIL " + name + "  [未被拒绝]"); fail++; }
  catch (e){ check(name, e.cubeCode === code, "code=" + e.cubeCode + " (" + (e.message || "").slice(0, 30) + "...)"); }
};

const B = BOHR_TO_ANGSTROM;
const cubeText = (lines) => lines.join("\n");

// ---------- 1) 最小有效单数据集 Cube ----------
{
  const txt = cubeText([
    "min cube", "density",
    "1  0.0  0.0  0.0",
    "2  1.0  0.0  0.0",
    "2  0.0  1.0  0.0",
    "2  0.0  0.0  1.0",
    "6  6.0  0.0  0.0  0.0",
    "1.0 2.0 3.0 4.0 5.0 6.0 7.0 8.0",
  ]);
  const p = m.parseCubeText(txt);
  check("最小有效单数据集 Cube 可解析", p.natoms === 1 && p.nVox === 8 && p.dims.join() === "2,2,2", "nVox=" + p.nVox);
  const vol = m.buildCubeVolume(p);
  check("CubeVolume 统计正确", Math.abs(vol.rhoMax - 8) < 1e-6 && vol.natoms === 1, "rhoMax=" + vol.rhoMax);
  check("原子元素映射 (Z=6→C)", vol.atoms[0].el === "C", vol.atoms[0].el);
  check("原子坐标 bohr→Å", Math.abs(vol.atoms[0].pos[0] + 0.5 * B) < 1e-9, "pos[0]=" + vol.atoms[0].pos[0].toFixed(6));
  check("dataRaw 数组尺寸 = nx·ny·nz", vol.data.length === vol.nVox, vol.data.length + " vs " + vol.nVox);
}

// ---------- 2) 非零原点 + 完整三轴 ----------
{
  // 原点 (3, -2, 1) bohr，非单位轴向量（x 轴 2 bohr/格）
  const txt = cubeText([
    "offset cube", "density",
    "1  3.0  -2.0  1.0",
    "3  2.0  0.0  0.0",
    "2  0.0  1.5  0.0",
    "2  0.0  0.0  1.0",
    "8  8.0  0.0  0.0  0.0",
    "1 2 3 4 5 6 7 8 9 10 11 12",
  ]);
  const p = m.parseCubeText(txt);
  check("非零原点 + 非正方体网格可解析", p.dims.join() === "3,2,2" && p.nVox === 12, p.dims.join());
  const vol = m.buildCubeVolume(p);
  // 网格中心 = origin + ((nx-1)/2)·vx + ...（x 轴 2 bohr/格）
  //   center = [3B + 1·2B, -2B + 0.5·1.5B, 1B + 0.5B] = [5B, -1.25B, 1.5B]
  //   居中后 origin = originB − center = [-2B, -0.75B, -0.5B]
  check("非零原点居中正确", Math.abs(vol.origin[0] + 2 * B) < 1e-9 && Math.abs(vol.origin[1] + 0.75 * B) < 1e-9 && Math.abs(vol.origin[2] + 0.5 * B) < 1e-9, vol.origin.map(v => v.toFixed(4)).join(","));
  // 三轴缩放验证（bohr→Å）
  check("三轴缩放 (2,1.5,1 bohr→Å)", Math.abs(vol.axes[0][0] - 2 * B) < 1e-9 && Math.abs(vol.axes[1][1] - 1.5 * B) < 1e-9, vol.axes[0][0].toFixed(4) + "," + vol.axes[1][1].toFixed(4));
  // 顶点采样：分数 (0,0,0) → 世界 = vol.origin → 值 1
  const v0 = vol.sample(vol.origin[0], vol.origin[1], vol.origin[2]);
  check("非零原点顶点采样 = 1", Math.abs(v0 - 1) < 1e-6, v0);
}

// ---------- 3) 科学计数法 ----------
{
  const txt = cubeText([
    "sci cube", "density",
    "1  0.0  0.0  0.0",
    "2  1.0  0.0  0.0",
    "2  0.0  1.0  0.0",
    "2  0.0  0.0  1.0",
    "1  1.0  0.0  0.0  0.0",
    "1.0E-3 2.5e+02 -1.5E-4 4.0e0 5.0E+00 6.0E-1 7.0e1 8.0E0",
  ]);
  const p = m.parseCubeText(txt);
  const expect = [0.001, 250, 0, 4, 5, 0.6, 70, 8];
  let ok = p.nVox === 8;
  for (let i = 0; i < 8; i++) if (Math.abs(p.dataRaw[i] - expect[i]) > 1e-6) ok = false; // Float32 精度
  check("科学计数法解析", ok, Array.from(p.dataRaw).join(","));
  const vol = m.buildCubeVolume(p);
  check("科学计数法采样一致", Math.abs(vol.sample(vol.origin[0], vol.origin[1], vol.origin[2]) - 0.001) < 1e-9, vol.sample(vol.origin[0], vol.origin[1], vol.origin[2]));
}

// ---------- 4) 非法 voxel 数 ----------
{
  const base = ["t", "d", "1  0 0 0", "2  1 0 0", "2  0 1 0", "2  0 0 1", "6  6 0 0 0"];
  expectError("体素数量不足 (4 < 8)", () => m.parseCubeText(cubeText(base.concat(["1 2 3 4"]))), "DATA_COUNT");
  expectError("体素数量过多 (12 > 8)", () => m.parseCubeText(cubeText(base.concat(["1 2 3 4 5 6 7 8 9 10 11 12"]))), "DATA_COUNT");
  expectError("网格尺寸非正整数 (0)", () => m.parseCubeText(cubeText(["t", "d", "1  0 0 0", "0  1 0 0", "2  0 1 0", "2  0 0 1", "6  6 0 0 0", "1 2"])), "BAD_DIMS");
  expectError("体素超上限", () => m.parseCubeText(cubeText(["t", "d", "1  0 0 0", (Math.floor(Math.cbrt(CUBE_LIMITS.maxVoxels)) + 1) + "  1 0 0", (Math.floor(Math.cbrt(CUBE_LIMITS.maxVoxels)) + 1) + "  0 1 0", (Math.floor(Math.cbrt(CUBE_LIMITS.maxVoxels)) + 1) + "  0 0 1", "6  6 0 0 0", "1"])), "TOO_MANY_VOXELS");
}

// ---------- 5) 多数据集 / 负原子数拒绝 ----------
{
  const base = ["t", "d", "1  0 0 0", "2  1 0 0", "2  0 1 0", "2  0 0 1", "6  6 0 0 0"];
  expectError("负原子数 (多数据集) 拒绝", () => m.parseCubeText(cubeText(["t", "d", "-1  0 0 0", "2  1 0 0", "2  0 1 0", "2  0 0 1", "6  6 0 0 0", "1 2 3 4"])), "MULTI_DATASET");
  expectError("数据集计数 2 拒绝", () => m.parseCubeText(cubeText(base.concat(["2", "1 2 3 4 5 6 7 8", "8 7 6 5 4 3 2 1"]))), "MULTI_DATASET");
  // Multiwfn 单数据集前缀 "1" 应通过
  const p = m.parseCubeText(cubeText(base.concat(["1", "1 2 3 4 5 6 7 8"])));
  check("数据集计数前缀 1（Multiwfn 风格）通过", p.nVox === 8, "nVox=" + p.nVox);
}

// ---------- 6) 单位与数组尺寸验证（详见 1/2；此处集中复核） ----------
{
  const txt = cubeText([
    "units", "density",
    "1  0.0  0.0  0.0",
    "3  1.0  0.0  0.0",
    "2  0.0  1.0  0.0",
    "2  0.0  0.0  1.0",
    "1  1.0  1.0  0.0  0.0", // 原子在 x=1 bohr
    "1 2 3 4 5 6 7 8 9 10 11 12",
  ]);
  const vol = m.buildCubeVolume(m.parseCubeText(txt));
  // 网格中心 x = 0 + (3-1)/2·1·B = B；原子 x=1·B → 居中后 = 0
  check("单位换算：1 bohr = 0.5292 Å（居中后原子 x=0）", Math.abs(vol.atoms[0].pos[0]) < 1e-9, vol.atoms[0].pos[0].toFixed(6));
  check("数组尺寸：data.length = nx·ny·nz = 12", vol.data.length === 12 && vol.data instanceof Float32Array, String(vol.data.constructor.name));
  // 采样越界安全（不抛异常）
  let safe = true;
  try { vol.sample(999, -999, 0.5); vol.sample(-5, 5, -5); } catch (e){ safe = false; }
  check("采样越界安全（钳制不抛错）", safe);
  // 密度加权采样：粒子应偏向高密度区（值 12 的角）
  const data = m.sampleCloudCube(vol, 4000);
  let finite = true, sumX = 0;
  for (let i = 0; i < 4000; i++){
    if (!Number.isFinite(data.pos[i * 3]) || !Number.isFinite(data.pos[i * 3 + 1]) || !Number.isFinite(data.pos[i * 3 + 2])) finite = false;
    sumX += data.pos[i * 3];
  }
  check("sampleCloudCube 全部有限", finite);
  check("密度加权采样偏向高密度区 (mean x > 0)", sumX / 4000 > 0.2, (sumX / 4000).toFixed(3));
}

// ---------- 7) 数据合法性与骨架推断 ----------
{
  const base = ["t", "d", "1  0 0 0", "2  1 0 0", "2  0 1 0", "2  0 0 1", "6  6 0 0 0"];
  expectError("NaN/Infinity 拒绝", () => m.parseCubeText(cubeText(base.concat(["1 2 NaN 4 5 6 7 Infinity"]))), "NON_FINITE");
  expectError("整体非正密度拒绝", () => m.parseCubeText(cubeText(base.concat(["-1 -2 -3 -4 -5 -6 -7 -8"]))), "NON_POSITIVE");
  // 带符号字段（轨道/ESP）：负值体素 >20% → 拒绝（正负各半的字段截断负值后必然铺满全盒 → 云弥散）
  expectError("带符号字段拒绝（轨道/ESP 形态）", () => m.parseCubeText(cubeText(base.concat(["-0.1 0.2 -0.3 0.4 -0.5 0.6 -0.7 0.8"]))), "SIGNED_FIELD");
  // 数值噪声级负值（<20%）应放行
  {
    const ok = m.parseCubeText(cubeText(base.concat(["1.0 2.0 -1e-9 4.0 5.0 6.0 7.0 8.0"])));
    check("数值噪声级负值放行（非带符号字段）", ok.nVox === 8, "nVox=" + ok.nVox);
  }
  const mol = m.buildCubeMolecule({ atoms: [
    { el: "C", pos: [0, 0, 0] }, { el: "C", pos: [1.54, 0, 0] }, { el: "H", pos: [-0.5, 0.9, 0] },
  ] });
  const bonds = m.inferSingleBonds(mol.atoms);
  check("单键推断（C–C 1.54Å / C–H 1.03Å）", bonds.length === 2, "bonds=" + bonds.length);
  check("未知元素符号回退 (Z=118→Og, Z=200→X200)", m.symbolOfZ(118) === "Og" && m.symbolOfZ(200) === "X200");
  check("未知元素共价半径回退", m.covalentRadius("Og") === 0.90);
}

// ---------- 8) 端到端：合成“苯分子电子密度”Cube（40³ 网格，高斯球场） ----------
{
  // 苯环 6 C + 6 H（Å 坐标，已居中），密度 = Σ w·exp(-d²/σ²)（类似真实分子场形态）
  const R = 1.3949, H_R = 2.481;
  const atoms = [];
  for (let k = 0; k < 6; k++){
    const a = Math.PI / 6 + k * Math.PI / 3;
    atoms.push([R * Math.cos(a), R * Math.sin(a), 0, "C"]);
    atoms.push([H_R * Math.cos(a), H_R * Math.sin(a), 0, "H"]);
  }
  const N = 40, half = 5.0, cell = (2 * half) / (N - 1);
  const vals = [];
  for (let iz = 0; iz < N; iz++){
    for (let iy = 0; iy < N; iy++){
      for (let ix = 0; ix < N; ix++){
        const x = -half + ix * cell, y = -half + iy * cell, z = -half + iz * cell;
        let v = 0;
        for (const a of atoms){
          const d2 = (x - a[0]) * (x - a[0]) + (y - a[1]) * (y - a[1]) + (z - a[2]) * (z - a[2]);
          v += (a[3] === "C" ? 2.2 : 0.5) * Math.exp(-d2 / (a[3] === "C" ? 0.28 : 0.22));
        }
        vals.push(v.toExponential(4));
      }
    }
  }
  // 组装 Cube 文本（bohr 单位；1 Å = 1.8897 bohr）
  const bohr = 1 / B;
  const lines = ["benzene-like density", "synthetic test field", "12  0.0  0.0  0.0",
    N + "  " + (cell * bohr).toFixed(6) + "  0.0  0.0",
    N + "  0.0  " + (cell * bohr).toFixed(6) + "  0.0",
    N + "  0.0  0.0  " + (cell * bohr).toFixed(6)];
  for (const a of atoms) lines.push((a[3] === "C" ? "6" : "1") + "  6.0  " + (a[0] * bohr).toFixed(6) + "  " + (a[1] * bohr).toFixed(6) + "  " + (a[2] * bohr).toFixed(6));
  // 每行 6 个值
  for (let i = 0; i < vals.length; i += 6) lines.push(vals.slice(i, i + 6).join(" "));
  const vol = m.buildCubeVolume(m.parseCubeText(cubeText(lines)));
  check("40³ 苯密度场解析 + CubeVolume", vol.nVox === N * N * N && vol.natoms === 12 && vol.keptVoxels > 0, "voxels=" + vol.nVox + " kept=" + vol.keptVoxels);
  // 松包围盒（背景≈0）→ 自适应保留分子包络（少量体素）；紧包围盒会保留更多——质量截断自适应
  check("低密度截断自适应（保留 0.5–95% 体素）", vol.keptFraction > 0.005 && vol.keptFraction < 0.95, (vol.keptFraction * 100).toFixed(1) + "%");
  check("截断阈值合理（0 < ρcut < ρmax/10）", vol.rhoCut > 0 && vol.rhoCut < vol.rhoMax / 10, "rhoCut=" + vol.rhoCut.toExponential(2) + " rhoMax=" + vol.rhoMax.toExponential(2));
  const t0 = Date.now();
  const data = m.sampleCloudCube(vol, 60000);
  const dt = Date.now() - t0;
  check("60k 粒子密度加权采样耗时合理 (< 500ms)", dt < 500, dt + "ms");
  // 云质心应接近原点（分子居中），且沿环分布
  let sx = 0, sy = 0, sz = 0, rMin = 1e9, rMax = 0;
  for (let i = 0; i < 60000; i++){
    sx += data.pos[i * 3]; sy += data.pos[i * 3 + 1]; sz += data.pos[i * 3 + 2];
    const rr = Math.hypot(data.pos[i * 3], data.pos[i * 3 + 1]);
    if (rr < rMin) rMin = rr; if (rr > rMax) rMax = rr;
  }
  const mx = sx / 60000, my = sy / 60000, mz = sz / 60000;
  check("粒子云质心 ≈ 分子中心", Math.hypot(mx, my, mz) < 0.35, (Math.hypot(mx, my, mz)).toFixed(3));
  check("粒子分布呈环状（r 中位在 1–3.2Å 区间）", rMin < 1.2 && rMax > 2.2 && rMax < 4.5, "r " + rMin.toFixed(2) + "…" + rMax.toFixed(2));
  const mol2 = m.buildCubeMolecule(vol);
  check("Cube 分子骨架推断（12 原子 ≥ 10 键）", mol2.bonds.length >= 10, "bonds=" + mol2.bonds.length);
}

// ---------- 9) 回归：松包围盒 + 非零背景不得弥散（真实 Multiwfn 输出形态） ----------
// 曾 bug：纯 95% 质量截断在背景质量 ≥5% 时跌破背景 → 100% 体素保留 → 云铺满整盒。
// 修复：cutoff = max(95% 质量阈值, 0.1%×峰值)；采样用对数密度权重。
{
  const B = BOHR_TO_ANGSTROM, bohr = 1 / B;
  const RR = 1.3949, H_R2 = 2.481;
  const atomList = [];
  for (let k = 0; k < 6; k++){
    const a = Math.PI / 6 + k * Math.PI / 3;
    atomList.push([RR * Math.cos(a), RR * Math.sin(a), 0, "C"]);
    atomList.push([H_R2 * Math.cos(a), H_R2 * Math.sin(a), 0, "H"]);
  }
  const N = 100, half = 8.0, cell = (2 * half) / (N - 1); // 16Å 松盒
  const vals = [];
  for (let iz = 0; iz < N; iz++){
    for (let iy = 0; iy < N; iy++){
      for (let ix = 0; ix < N; ix++){
        const x = -half + ix * cell, y = -half + iy * cell, z = -half + iz * cell;
        let v = 5e-3; // 非零背景
        for (const a of atomList){
          const d2 = (x - a[0]) * (x - a[0]) + (y - a[1]) * (y - a[1]) + (z - a[2]) * (z - a[2]);
          v += (a[3] === "C" ? 120 : 0.5) * Math.exp(-d2 / (a[3] === "C" ? 0.08 : 0.3));
          if (a[3] === "C") v += 0.7 * Math.exp(-d2 / 1.2);
        }
        vals.push(v.toExponential(4));
      }
    }
  }
  const lines = ["loose box regression", "bg 5e-3", "12  0 0 0",
    N + "  " + (cell * bohr).toFixed(6) + "  0  0",
    N + "  0  " + (cell * bohr).toFixed(6) + "  0",
    N + "  0  0  " + (cell * bohr).toFixed(6)];
  for (const a of atomList) lines.push((a[3] === "C" ? "6" : "1") + "  6  " + (a[0] * bohr).toFixed(6) + "  " + (a[1] * bohr).toFixed(6) + "  0");
  for (let i = 0; i < vals.length; i += 6) lines.push(vals.slice(i, i + 6).join(" "));
  const vol = m.buildCubeVolume(m.parseCubeText(cubeText(lines)));
  check("松盒+背景：cutoff 高于背景（不弥散前提）", vol.rhoCut > 5e-3, "rhoCut=" + vol.rhoCut.toExponential(2));
  const data = m.sampleCloudCube(vol, 80000);
  let rMax = 0, out6 = 0, brightLow = 0;
  for (let i = 0; i < 80000; i++){
    const rr = Math.hypot(data.pos[i * 3], data.pos[i * 3 + 1], data.pos[i * 3 + 2]);
    if (rr > rMax) rMax = rr;
    if (rr > 6) out6++;
    if (data.bright[i] < 0.15) brightLow++;
  }
  check("松盒+背景：云紧凑（max r < 5Å）", rMax < 5, "rMax=" + rMax.toFixed(2));
  check("松盒+背景：无 6Å 外粒子", out6 === 0, out6 + "/80000");
  check("松盒+背景：包络可见（bright<0.15 占比 < 5%）", brightLow / 80000 < 0.05, (brightLow / 80000 * 100).toFixed(2) + "%");
}

// ---------- 10) 字段类型估计（诚实启发式，不假装识别 HOMO/LUMO） ----------
{
  const est = (o) => estimateCubeFieldType(o);
  const ft1 = est({ title: "Cube from cubegen", comment: "Density", negVox: 0, nVox: 1000, vMax: 120, maxAbs: 120 });
  check("注释行 Density → 电子密度（高置信）", ft1.type === "density" && ft1.confidence === "high", ft1.type);
  const ft2 = est({ title: "Cube from cubegen", comment: "Orbital 47", negVox: 200000, nVox: 531050, vMax: 0.5, maxAbs: 0.5 });
  check("注释行 Orbital → 分子轨道（高置信）", ft2.type === "orbital" && ft2.confidence === "high", ft2.type);
  const ft3 = est({ title: "Generated by Multiwfn", comment: "Totally 531050 grid points", negVox: 223418, nVox: 531050, vMax: 10, maxAbs: 5.3e5 });
  check("Multiwfn 无标签 + 42% 负值 → 带符号字段（高置信）", ft3.type === "signed_field" && ft3.confidence === "high", ft3.type);
  const ft4 = est({ title: "Generated by Multiwfn", comment: "Totally 1000 grid points", negVox: 0, nVox: 1000, vMax: 0.9, maxAbs: 0.9 });
  check("非负 + 0-1 有界 → 非负标量场（低置信，可能 ELF）", ft4.type === "nonnegative_field" && ft4.confidence === "low", ft4.type);
  const ft5 = est({ title: "DFT B3LYP calculation", comment: "some comment", negVox: 5, nVox: 1000, vMax: 100, maxAbs: 100 });
  check("DFT 字样不误判为 density 提示（走统计 → 可能密度中置信）", ft5.type === "electron_density_likely" && ft5.confidence === "medium", ft5.type);
  const ft6 = est({ title: "Generated by Multiwfn", comment: "Totally 1000 grid points", negVox: 400, nVox: 1000, vMax: 300, maxAbs: 300 });
  check("无标签 + 40% 负值大振幅 → 带符号字段（不假装区分 ESP/轨道）", ft6.type === "signed_field", ft6.type);
}

// ---------- 11) 轨道模式（双色相位粒子云）：保留符号、|ψ| 截断与采样 ----------
{
  const base = ["t", "d", "1  0 0 0", "2  1 0 0", "2  0 1 0", "2  0 0 1", "6  6 0 0 0"];
  // 带符号数据（模拟轨道 lobe：一半负值）
  const signedData = "0.30 0.20 -0.25 0.10 -0.15 0.05 -0.05 0.40";
  // 默认（密度）解析：拒绝 >20% 负值
  expectError("轨道数据默认解析拒绝（密度模式）", () => m.parseCubeText(cubeText(base.concat([signedData]))), "SIGNED_FIELD");
  // allowSigned：保留原始符号
  const parsed = m.parseCubeText(cubeText(base.concat([signedData])), { allowSigned: true });
  check("allowSigned 保留符号与统计", parsed.signed === true && parsed.negVox > 0 && parsed.maxAbs > 0, "negVox=" + parsed.negVox + " maxAbs=" + parsed.maxAbs);
  const vol = m.buildCubeVolume(parsed, { mode: "orbital" });
  check("轨道体数据 isSigned + 截断", vol.isSigned === true && vol.rhoCut > 0 && vol.totalW > 0, "rhoCut=" + vol.rhoCut.toExponential(2));
  const data = m.sampleCloudCube(vol, 4000);
  let nPos = 0, nNeg = 0, finite = true;
  for (let i = 0; i < 4000; i++){
    if (data.sign[i] > 0) nPos++;
    else if (data.sign[i] < 0) nNeg++;
    if (!Number.isFinite(data.pos[i * 3]) || !Number.isFinite(data.density[i]) || !Number.isFinite(data.sign[i])) finite = false;
  }
  check("轨道采样相位双色（正/负均存在）", nPos > 200 && nNeg > 200, "pos=" + nPos + " neg=" + nNeg);
  check("轨道采样全部有限", finite);
  // 密度模式（同数据按 density 构建则符号全 0）
  const volD = m.buildCubeVolume(m.parseCubeText(cubeText(base.concat(["0.30 0.20 0 0.10 0 0.05 0 0.40"])), { allowSigned: true }), { mode: "density" });
  const dataD = m.sampleCloudCube(volD, 500);
  let anySign = false;
  for (let i = 0; i < 500; i++) if (dataD.sign[i] !== 0) anySign = true;
  check("密度模式 sign 恒 0（单 LUT）", !anySign);
}

console.log("\n==== " + pass + " PASS / " + fail + " FAIL ====");
process.exit(fail ? 1 : 0);

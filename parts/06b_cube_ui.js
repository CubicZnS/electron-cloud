/* ================= 量子数据：电子密度 Cube 导入面板与状态机 =================
   状态：idle → reading → validating → ready →（Apply）→ applying → applied
   任何一步失败 → error（保留当前场景与当前电子云，不做任何场景变更）
   数据源：Gaussian cubegen / Multiwfn 导出的单标量场电子密度 Cube（.cube/.cub）
   Cube 不携带可靠的“属性标签”，入口文案明确为 electron-density，不假装识别 HOMO/LUMO/ESP */
const cubeUI = {
  state: "idle",
  open: false,
  file: null,
  parsed: null,
  volume: null,
  mode: "density", // "density" | "orbital"
  label: "HOMO",   // 轨道标注（仅图例文字；HOMO/LUMO/其他）
  prev: null, // 退出导入时恢复的半定量状态 { custom, frags, mode }
};
const _qdEl = function (id){ return document.getElementById(id); };
function fmtBytes(n){
  if (n >= 1024 * 1024) return (n / (1024 * 1024)).toFixed(1) + " MB";
  if (n >= 1024) return (n / 1024).toFixed(1) + " KB";
  return n + " B";
}
function cubeUI_setState(state, label){
  cubeUI.state = state;
  const st = _qdEl("qdStatus");
  if (st){
    st.className = "qd-status" + (state === "ready" || state === "applied" ? " " + state : state === "error" ? " error" : (state === "reading" || state === "validating" || state === "applying") ? " " + state : "");
    const t = _qdEl("qdStatusText");
    if (t) t.textContent = label || state;
  }
  const err = _qdEl("qdErr");
  if (err){
    err.classList.toggle("show", state === "error");
    if (state === "error") err.textContent = label || "发生错误";
  }
  const meta = _qdEl("qdMeta");
  if (meta) meta.style.display = (state === "ready" || state === "applied") ? "" : "none";
  const btn = _qdEl("qdApply");
  if (btn){
    if (state === "ready"){
      btn.textContent = cubeUI.mode === "orbital" ? "Apply orbital（双色相位）" : "Apply electron density";
      btn.style.display = "";
      btn.disabled = false;
    } else if (state === "applied"){
      btn.textContent = "Exit import（返回半定量模式）";
      btn.style.display = "";
      btn.disabled = false;
    } else {
      btn.style.display = "none";
    }
  }
}
/* ---------- 文件选择 / 拖放 ---------- */
async function handleCubeFile(file){
  if (!file) return;
  const name = file.name || "";
  const lower = name.toLowerCase();
  if (!lower.endsWith(".cube") && !lower.endsWith(".cub")){
    cubeUI_setState("error", "仅支持 .cube / .cub 文件（当前：" + (name || "未命名") + "）。请选择 Gaussian cubegen / Multiwfn 导出的 Cube 文件。");
    return;
  }
  if (file.size > CUBE_LIMITS.maxFileBytes){
    cubeUI_setState("error", "文件超过 " + fmtBytes(CUBE_LIMITS.maxFileBytes) + " 上限（当前 " + fmtBytes(file.size) + "）。请在 Multiwfn 中调大 Grid spacing 或裁剪区域后重试。");
    return;
  }
  cubeUI.file = file;
  cubeUI_setState("reading", "reading — 读取文件 " + name);
  let text;
  try {
    text = await file.text();
  } catch (e){
    cubeUI_setState("error", "读取文件失败：" + (e && e.message ? e.message : e));
    return;
  }
  cubeUI_setState("validating", "validating — 解析 Cube 头部与体素（" + name + "）");
  await new Promise(function (r){ setTimeout(r, 40); }); // 让“validating”状态先绘制
  let parsed = null, volume = null;
  try {
    // allowSigned：保留原始带符号值，供轨道模式使用（密度/轨道由统计特征路由）
    parsed = parseCubeText(text, { allowSigned: true });
    parsed.fileName = name;
    // 路由：负值体素 >20%（带符号字段）或注释行标注轨道 → 轨道模式（|ψ| 采样 + 相位）；
    // 否则 → 电子密度模式（负值截断 + 单色 LUT）
    const isOrbital = parsed.negVox / parsed.nVox > 0.20 || parsed.fieldType.type === "orbital";
    cubeUI.mode = isOrbital ? "orbital" : "density";
    volume = buildCubeVolume(parsed, { mode: cubeUI.mode });
  } catch (e){
    cubeUI_setState("error", (e && e.message ? e.message : "解析失败：" + e));
    return;
  } finally {
    text = null; // 释放大字符串（文件内容仅前端内存处理，不落盘不上传）
  }
  cubeUI.parsed = parsed;
  cubeUI.volume = volume;
  renderCubeMeta(volume, name);
  if (cubeUI.mode === "orbital"){
    cubeUI_setState("ready", "ready — 检测为带符号字段（可能为分子轨道），将按轨道模式显示相位（正/负双色）");
    // 轨道标注选择器（仅图例文字，不假装自动推断 HOMO/LUMO）
    const row = _qdEl("qdOrbitalRow");
    if (row) row.style.display = "";
    const sel = _qdEl("qdOrbitalLabel");
    if (sel) sel.value = cubeUI.label === "未标注" ? "other" : cubeUI.label;
  } else {
    const row = _qdEl("qdOrbitalRow");
    if (row) row.style.display = "none";
    cubeUI_setState("ready", "ready — 校验通过（非负标量场，按电子密度模式），可应用");
  }
}
function renderCubeMeta(vol, name){
  const el = _qdEl("qdMeta");
  if (!el) return;
  const cnt = {};
  vol.atoms.forEach(function (a){ cnt[a.el] = (cnt[a.el] || 0) + 1; });
  const elStr = Object.keys(cnt).sort().map(function (e){ return e + "×" + cnt[e]; }).join(" · ");
  const rng = function (a, b){ return a.toFixed(2) + " … " + b.toFixed(2); };
  // 字段类型估计（诚实标注置信度；Cube 无标准标签，注释行缺失时只能启发式）
  const ft = vol.fieldType;
  let ftText = "未知";
  if (ft){
    const conf = ft.confidence === "high" ? "置信：高" : ft.confidence === "medium" ? "置信：中" : "置信：低";
    const zh = {
      density: "电子密度",
      orbital: "分子轨道（非电子密度）",
      esp: "静电势 ESP（非电子密度）",
      elf: "ELF（非电子密度）",
      laplacian: "Laplacian（非电子密度）",
      signed_field: "带符号标量场（分子轨道或 ESP，非电子密度）",
      electron_density_likely: "可能为电子密度",
      nonnegative_field: "非负标量场（可能为 ELF 等，未必是密度）",
      mixed_small_negative: "含少量负值（可能为密度差或数值噪声）",
    }[ft.type] || "未知";
    ftText = zh + "（" + conf + "）";
  }
  el.innerHTML =
    "<div class='row'><span class='k'>文件</span><span class='v ellip' title='" + name + "'>" + name + "</span></div>"
    + "<div class='row'><span class='k'>字段类型</span><span class='v' class='src'>" + ftText + "</span></div>"
    + "<div class='row'><span class='k'>原子数</span><span class='v'>" + vol.natoms + "（" + elStr + "）</span></div>"
    + "<div class='row'><span class='k'>网格</span><span class='v'>" + vol.dims[0] + " × " + vol.dims[1] + " × " + vol.dims[2] + "</span></div>"
    + "<div class='row'><span class='k'>Voxel 数</span><span class='v'>" + vol.nVox.toLocaleString() + "</span></div>"
    + "<div class='row'><span class='k'>空间范围 (Å)</span><span class='v'>x " + rng(vol.bounds.min[0], vol.bounds.max[0]) + "<br/>y " + rng(vol.bounds.min[1], vol.bounds.max[1]) + "<br/>z " + rng(vol.bounds.min[2], vol.bounds.max[2]) + "</span></div>"
    + "<div class='row'><span class='k'>" + (cubeUI.mode === "orbital" ? "|ψ| 幅值" : "密度") + "</span><span class='v'>平均 " + vol.rhoMean.toExponential(2) + " · 峰 " + vol.rhoMax.toExponential(2) + " a.u. · 截断 ≥ " + vol.rhoCut.toExponential(2) + "（保留 " + (vol.keptFraction * 100).toFixed(1) + "% 体素）</span></div>"
    + "<div class='row'><span class='k'>单位/居中</span><span class='v' class='src'>bohr → Å（×0.5292）· 已按网格中心居中</span></div>";
}
/* ---------- 面板开关（与创造模式互斥） ---------- */
function toggleQuantumPanel(show){
  const open = show !== undefined ? show : !cubeUI.open;
  cubeUI.open = open;
  _qdEl("quantumPanel").classList.toggle("show", open);
  _qdEl("quantumBtn").classList.toggle("active", open);
  if (open){ toggleCreator(false); syncParticleSlider(); } // 两个左侧面板互斥；打开时同步粒子滑块
}
/* ---------- 应用：切换到真实密度数据源（现有粒子过渡与 shader 全部复用） ---------- */
function applyCubeVolume(vol){
  closePopover();
  if (!cubeMode){
    // 仅记录一次“进入导入前的半定量状态”，供退出时恢复
    cubeUI.prev = {
      custom: !!(currentMol && currentMol.isCustom),
      frags: currentMol ? currentMol.fragments.slice() : [],
      mode: SETTINGS.mode,
    };
  }
  const mol = buildCubeMolecule(vol);
  currentMol = mol;                       // 骨架：Cube 原子 + 推断单键（仅供视觉路径）
  buildMoleculeMeshes(mol);
  currentField = null;
  currentVolume = vol;
  cubeMode = true;
  setOrbitalRender(cubeUI.mode === "orbital"); // 轨道模式：固定正/负相位双 LUT
  const data = sampleCloudCube(vol, cloud.count); // 真实密度/|ψ| 权重采样，而非 computeField
  applyCubeSampleDirect(data); // 同步直接写入 + 线性过渡（不依赖异步分帧匹配，避免导入后云停在旧状态）
  // 相机自动取景：按采样云的实测范围拉远相机（导入结构常大于半定量世界默认视野 ±4Å）
  let maxR = 0;
  for (let i = 0; i < cloud.count; i++){
    const rr = Math.hypot(data.pos[i * 3], data.pos[i * 3 + 1], data.pos[i * 3 + 2]);
    if (rr > maxR) maxR = rr;
  }
  fitCameraToExtent(maxR + 0.8);
  setCubeModeUI(true);
  rebuildCubeLegend();
  updateParticleUI();
  syncParticleSlider();
}
/* ---------- 退出导入：恢复半定量模式（明确的状态变化） ---------- */
function exitCubeMode(){
  if (!cubeMode) return;
  const prev = cubeUI.prev || { custom: false, frags: [], mode: "total" };
  cubeMode = false;
  currentVolume = null;
  setOrbitalRender(false); // 恢复用户所选色图并关闭轨道分支
  resetCamera(); // 退出导入：恢复半定量世界默认取景
  if (prev.custom && creatorState && creatorState.pts && creatorState.pts.length){
    crApply(); // 重建创造模式分子（内部 applyMol → computeField → 过渡 → 图例）
  } else {
    SETTINGS.mode = prev.mode || "total";
    changeMolecule(prev.frags || [], [0, 0, 0]);
  }
  document.querySelectorAll("#modeSeg .seg-btn").forEach(function (b){ b.classList.toggle("active", b.dataset.mode === SETTINGS.mode); });
  setCubeModeUI(false);
  const key = chipKeyForFrags(prev.frags || []);
  setActiveMoleculeChip(key || (prev.frags && prev.frags.length ? "" : "benzene"));
  cubeUI_setState("idle", "idle — 等待文件");
  toast("已退出导入模式，回到半定量 σ 模型");
}
function chipKeyForFrags(frags){
  for (const m of MOLECULE_LIST){
    if (m.fragments.length === frags.length && m.fragments.every(function (f){
      return frags.some(function (x){ return x.pos === f.pos && x.group === f.group; });
    })) return m.key;
  }
  return null;
}
/* ---------- 导入模式的 UI 锁定：Total/Inductive/Resonance 与 Explain 是半定量功能 ---------- */
function setCubeModeUI(on){
  document.querySelectorAll("#modeSeg .seg-btn").forEach(function (b){
    b.classList.toggle("disabled", on);
    b.title = on ? "导入模式是独立数据源：Total/Inductive/Resonance 仅适用于半定量 σ 模型，已禁用" : "";
  });
  const ex = _qdEl("explainBtn");
  if (ex){
    ex.classList.toggle("disabled", on);
    if (on){ explainGroup.visible = false; ex.classList.remove("on"); }
  }
  // 轨道模式：色图选择器停用（相位配色固定为正暖/负冷双 LUT）
  const cmap = _qdEl("cmapSel");
  if (cmap){
    const orb = on && cubeUI.mode === "orbital";
    cmap.disabled = orb;
    cmap.title = orb ? "轨道模式使用固定相位配色（正=暖色，负=冷色）" : "";
    cmap.style.opacity = orb ? "0.4" : "";
  }
}
/* ---------- 图例：Imported electron density / orbital 专用（与半定量模式明确区分） ---------- */
function rebuildCubeLegend(){
  const el = _qdEl("legend");
  if (!el || !currentVolume) return;
  const vol = currentVolume;
  const cnt = {};
  vol.atoms.forEach(function (a){ cnt[a.el] = (cnt[a.el] || 0) + 1; });
  const elStr = Object.keys(cnt).sort().map(function (e){ return e + cnt[e]; }).join(" ");
  const isOrb = cubeUI.mode === "orbital";
  const title = isOrb ? "Imported orbital（" + (cubeUI.label || "未标注") + "）" : "Imported electron density";
  let html = "<div class='mol' style='color:#c9b8ff'>" + title + " <span class='formula' title='" + (vol.fileName || "Cube") + "'>" + (vol.fileName || "Cube") + "</span></div>";
  html += "<div class='fxrow'><span class='fx-badge' style='border-color:rgba(184,147,255,0.5);color:#c9b8ff'>" + elStr + " · " + vol.nVox.toLocaleString() + " voxels</span></div>";
  if (isOrb){
    html += "<div class='cmaprow'><span class='cmaplabel' style='color:#7cc7ff'>负相位 ψ<0</span>"
      + "<div class='cmapbar' id='cmapBarNeg' style='background:" + colormapCSS(ORBITAL_LUTS.neg.stops) + "'></div>"
      + "<div class='cmapbar' id='cmapBarPos' style='background:" + colormapCSS(ORBITAL_LUTS.pos.stops) + "'></div>"
      + "<span class='cmaplabel' style='color:#ff9a6b'>正相位 ψ>0</span></div>";
    html += "<div class='densityhint'>数据源：Gaussian / Multiwfn Cube · 轨道波函数 ψ（粒子按 |ψ| 分布、颜色按 |ψ| 分位 + 相位双色）· 节点面 ψ=0 处呈空隙 · 标注由用户指定（不自动推断 HOMO/LUMO）· <span id='exitCubeLink' style='color:#b893ff;cursor:pointer;text-decoration:underline;text-underline-offset:2px'>退出导入模式</span></div>";
  } else {
    html += "<div class='densityhint'>数据源：Gaussian / Multiwfn Cube · 真实电子密度（非 σ 半定量）· 颜色按密度分位展开（低密度冷/暗 · 高密度暖/亮）· Total / Inductive / Resonance 已禁用 · <span id='exitCubeLink' style='color:#b893ff;cursor:pointer;text-decoration:underline;text-underline-offset:2px'>退出导入模式</span></div>";
    html += "<div class='cmaprow'><span class='cmaplabel'>低密度</span><div class='cmapbar' id='cmapBar'></div><span class='cmaplabel'>高密度</span></div>";
  }
  el.innerHTML = html;
  const bar = _qdEl("cmapBar");
  if (bar) bar.style.background = colormapCSS(COLORMAPS[SETTINGS.colormap].stops);
  const link = _qdEl("exitCubeLink");
  if (link) link.addEventListener("click", function (){ exitCubeMode(); });
}
/* ---------- 粒子总数滑块 ---------- */
/* 控制当前电子云的总粒子数（覆盖画质档位预设，可超出 ULTRA 上限）。
   大分子（环糊精等）粒子不足时可拖动调高；拖动即用 setParticleCount 重采样，即时生效。 */
const pSlider = _qdEl("qdParticles");
const pValEl = _qdEl("qdParticlesVal");
function syncParticleSlider(){
  if (!cloud) return;
  if (pSlider) pSlider.value = String(Math.min(Math.max(cloud.count, 10000), 600000));
  if (pValEl) pValEl.textContent = fmtCount(cloud.count);
  // 与某画质预设一致则高亮对应按钮，否则清除（自定义数量）
  const preset = QUALITY_ORDER.find(function (q){ return QUALITY[q].count === cloud.count; });
  document.querySelectorAll("#qualitySeg .seg-btn").forEach(function (b){
    b.classList.toggle("active", preset ? b.dataset.q === preset : false);
  });
}
if (pSlider){
  pSlider.addEventListener("input", function (){
    const v = parseInt(pSlider.value, 10);
    if (v !== cloud.count) setParticleCount(v);
    if (pValEl) pValEl.textContent = fmtCount(v);
  });
}

/* ---------- 事件绑定 ---------- */
(function (){
  const drop = _qdEl("qdDrop");
  const fileIn = _qdEl("qdFile");
  if (!drop || !fileIn) return;
  ["dragenter", "dragover"].forEach(function (ev){
    drop.addEventListener(ev, function (e){ e.preventDefault(); e.stopPropagation(); drop.classList.add("over"); });
  });
  ["dragleave", "drop"].forEach(function (ev){
    drop.addEventListener(ev, function (e){ e.preventDefault(); e.stopPropagation(); drop.classList.remove("over"); });
  });
  drop.addEventListener("drop", function (e){
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) handleCubeFile(f);
  });
  drop.addEventListener("click", function (){ fileIn.click(); });
  fileIn.addEventListener("change", function (){
    if (this.files && this.files[0]) handleCubeFile(this.files[0]);
    this.value = "";
  });
  _qdEl("quantumBtn").addEventListener("click", function (){ toggleQuantumPanel(); });
  _qdEl("qdClose").addEventListener("click", function (){ toggleQuantumPanel(false); });
  const orbSel = _qdEl("qdOrbitalLabel");
  if (orbSel) orbSel.addEventListener("change", function (){
    cubeUI.label = orbSel.value === "other" ? "未标注" : orbSel.value;
    if (cubeMode && cubeUI.mode === "orbital") rebuildCubeLegend();
  });
  _qdEl("qdApply").addEventListener("click", function (){
    if (!cubeUI.volume) return;
    if (cubeUI.state === "applied"){
      exitCubeMode();
      toggleQuantumPanel(false);
      return;
    }
    cubeUI_setState("applying", "applying — 按真实密度权重重采样粒子云…");
    try {
      applyCubeVolume(cubeUI.volume);
    } catch (e){
      cubeUI_setState("error", "应用失败：" + (e && e.message ? e.message : e) + "（当前场景未被改动）");
      return;
    }
    cubeUI_setState("applied", "applied — Imported electron density 已应用（图例可退出导入模式）");
  });
})();

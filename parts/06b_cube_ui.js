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
      btn.textContent = "Apply electron density";
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
    parsed = parseCubeText(text);
    parsed.fileName = name;
    volume = buildCubeVolume(parsed);
  } catch (e){
    cubeUI_setState("error", (e && e.message ? e.message : "解析失败：" + e));
    return;
  } finally {
    text = null; // 释放大字符串（文件内容仅前端内存处理，不落盘不上传）
  }
  cubeUI.parsed = parsed;
  cubeUI.volume = volume;
  renderCubeMeta(volume, name);
  cubeUI_setState("ready", "ready — 校验通过（单数据集电子密度 Cube），可应用");
}
function renderCubeMeta(vol, name){
  const el = _qdEl("qdMeta");
  if (!el) return;
  const cnt = {};
  vol.atoms.forEach(function (a){ cnt[a.el] = (cnt[a.el] || 0) + 1; });
  const elStr = Object.keys(cnt).sort().map(function (e){ return e + "×" + cnt[e]; }).join(" · ");
  const rng = function (a, b){ return a.toFixed(2) + " … " + b.toFixed(2); };
  el.innerHTML =
    "<div class='row'><span class='k'>文件</span><span class='v'>" + name + "</span></div>"
    + "<div class='row'><span class='k'>原子数</span><span class='v'>" + vol.natoms + "（" + elStr + "）</span></div>"
    + "<div class='row'><span class='k'>网格</span><span class='v'>" + vol.dims[0] + " × " + vol.dims[1] + " × " + vol.dims[2] + "</span></div>"
    + "<div class='row'><span class='k'>Voxel 数</span><span class='v'>" + vol.nVox.toLocaleString() + "</span></div>"
    + "<div class='row'><span class='k'>空间范围 (Å)</span><span class='v'>x " + rng(vol.bounds.min[0], vol.bounds.max[0]) + "<br/>y " + rng(vol.bounds.min[1], vol.bounds.max[1]) + "<br/>z " + rng(vol.bounds.min[2], vol.bounds.max[2]) + "</span></div>"
    + "<div class='row'><span class='k'>密度</span><span class='v'>0 … " + vol.rhoMax.toExponential(2) + " a.u. · 截断 ρ ≥ " + vol.rhoCut.toExponential(2) + "（保留 " + (vol.keptFraction * 100).toFixed(1) + "% 体素）</span></div>"
    + "<div class='row'><span class='k'>单位/居中</span><span class='v' class='src'>bohr → Å（×0.5292）· 已按网格中心居中</span></div>";
}
/* ---------- 面板开关（与创造模式互斥） ---------- */
function toggleQuantumPanel(show){
  const open = show !== undefined ? show : !cubeUI.open;
  cubeUI.open = open;
  _qdEl("quantumPanel").classList.toggle("show", open);
  _qdEl("quantumBtn").classList.toggle("active", open);
  if (open) toggleCreator(false); // 两个左侧面板互斥，避免互相遮挡
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
  const data = sampleCloudCube(vol, cloud.count); // 真实密度权重采样，而非 computeField
  transitionCloudFromData(data, [0, 0, 0]);
  setCubeModeUI(true);
  rebuildCubeLegend();
  updateParticleUI();
}
/* ---------- 退出导入：恢复半定量模式（明确的状态变化） ---------- */
function exitCubeMode(){
  if (!cubeMode) return;
  const prev = cubeUI.prev || { custom: false, frags: [], mode: "total" };
  cubeMode = false;
  currentVolume = null;
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
    b.title = on ? "导入模式（Imported electron density）是独立数据源：Total/Inductive/Resonance 仅适用于半定量 σ 模型，已禁用" : "";
  });
  const ex = _qdEl("explainBtn");
  if (ex){
    ex.classList.toggle("disabled", on);
    if (on){ explainGroup.visible = false; ex.classList.remove("on"); }
  }
}
/* ---------- 图例：Imported electron density 专用（与半定量模式明确区分） ---------- */
function rebuildCubeLegend(){
  const el = _qdEl("legend");
  if (!el || !currentVolume) return;
  const vol = currentVolume;
  const cnt = {};
  vol.atoms.forEach(function (a){ cnt[a.el] = (cnt[a.el] || 0) + 1; });
  const elStr = Object.keys(cnt).sort().map(function (e){ return e + cnt[e]; }).join(" ");
  let html = "<div class='mol' style='color:#c9b8ff'>Imported electron density <span class='formula'>" + (vol.fileName || "Cube") + "</span></div>";
  html += "<div class='fxrow'><span class='fx-badge' style='border-color:rgba(184,147,255,0.5);color:#c9b8ff'>" + elStr + " · " + vol.nVox.toLocaleString() + " voxels</span></div>";
  html += "<div class='densityhint'>数据源：Gaussian / Multiwfn Cube · 真实电子密度（非 σ 半定量）· Total / Inductive / Resonance 已禁用 · <span id='exitCubeLink' style='color:#b893ff;cursor:pointer;text-decoration:underline;text-underline-offset:2px'>退出导入模式</span></div>";
  html += "<div class='cmaprow'><span class='cmaplabel'>低密度</span><div class='cmapbar' id='cmapBar'></div><span class='cmaplabel'>高密度</span></div>";
  el.innerHTML = html;
  const bar = _qdEl("cmapBar");
  if (bar) bar.style.background = colormapCSS(COLORMAPS[SETTINGS.colormap].stops);
  const link = _qdEl("exitCubeLink");
  if (link) link.addEventListener("click", function (){ exitCubeMode(); });
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

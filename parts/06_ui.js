/* ================= UI 交互 ================= */
const popoverEl = document.getElementById("popover");
const popoverState = { open: false, pos: [0, 0, 0], ringPos: -1, customAtom: -1, customDir: null };

function fmtCount(n){ return n >= 1000 ? Math.round(n / 1000) + "k" : String(n); }
function updateParticleUI(){
  const el = document.getElementById("particleCount");
  if (el) el.textContent = fmtCount(cloud ? cloud.count : 0);
}

/* 分子选择栏 */
function buildMoleculeBar(){
  const el = document.getElementById("moleculeBar");
  let html = "";
  for (const m of MOLECULE_LIST){
    html += "<button class='mol-chip' data-k='" + m.key + "'><span>" + m.name + "</span><span class='zh'>" + m.zh + "</span></button>";
  }
  el.innerHTML = html;
  el.querySelectorAll(".mol-chip").forEach(function (b){
    b.addEventListener("click", function (){ selectMolecule(b.dataset.k); });
  });
  setActiveMoleculeChip("benzene");
}
function setActiveMoleculeChip(key){
  document.querySelectorAll(".mol-chip").forEach(function (b){ b.classList.toggle("active", b.dataset.k === key); });
}

/* 模式与画质 */
function wireSegments(){
  document.querySelectorAll("#modeSeg .seg-btn").forEach(function (b){
    b.addEventListener("click", function (){ setMode(b.dataset.mode); });
  });
  document.querySelectorAll("#qualitySeg .seg-btn").forEach(function (b){
    b.addEventListener("click", function (){ setQuality(b.dataset.q, false); });
  });
}
function setMode(m){
  SETTINGS.mode = m;
  document.querySelectorAll("#modeSeg .seg-btn").forEach(function (b){ b.classList.toggle("active", b.dataset.mode === m); });
  if (currentMol){
    currentField = computeField(currentMol, m);
    updateRelDensities();
    transitionCloud(currentField, [0, 0, 0]);
  }
}
function setQuality(q, auto){
  SETTINGS.quality = q;
  if (!auto) manualQualityAt = simTime;
  const Q = QUALITY[q];
  bloomPass.strength = Q.bloom;
  bloomPass.radius = Q.radius;
  bloomPass.threshold = Q.threshold;
  if (cloud) cloud.uniforms.uParticleSize.value = Q.psize;
  if (cloud && cloud.count !== Q.count) setParticleCount(Q.count);
  document.querySelectorAll("#qualitySeg .seg-btn").forEach(function (b){ b.classList.toggle("active", b.dataset.q === q); });
  updateParticleUI();
}

/* 分子切换与官能团取代 */
function selectMolecule(key){
  const m = MOLECULE_LIST.find(function (x){ return x.key === key; });
  if (!m) return;
  setActiveMoleculeChip(key);
  changeMolecule(m.fragments, ringPos(m.fragments.length ? m.fragments[0].pos : 0));
}
function substitute(pos, group){
  closePopover();
  if (!currentMol) return;
  const frags = currentMol.fragments.slice();
  const idx = frags.findIndex(function (f){ return f.pos === pos; });
  if (group === null){
    if (idx >= 0) frags.splice(idx, 1);
  } else {
    if (idx >= 0) frags[idx] = { pos: pos, group: group };
    else frags.push({ pos: pos, group: group });
  }
  changeMolecule(frags, ringPos(pos));
}

/* 点击原子 → 官能团选择弹层 */
function openPopover(rec){
  popoverState.open = true;
  popoverState.pos = rec.pos;
  if (currentMol && currentMol.isCustom){
    // 创造模式：点碳/H/基团原子 → 弹层增删官能团（取代 H，规格同苯）
    let cIdx = -1;
    let hDir = null; // 点击 H 时：碳→H 的单位方向（挂载时取代该 H，而非碳上其他 H）
    if (rec.el === "C" && rec.atomIdx < creatorState.pts.length) cIdx = rec.atomIdx;
    else if (rec.fragId >= 0 && currentMol.fragments[rec.fragId]) cIdx = currentMol.fragments[rec.fragId].atomIdx;
    else {
      for (const b of currentMol.bonds){
        let o = -1;
        if (b.i === rec.atomIdx) o = b.j; else if (b.j === rec.atomIdx) o = b.i;
        if (o >= 0 && currentMol.atoms[o].el === "C" && currentMol.atoms[o].atomIdx < creatorState.pts.length){
          cIdx = currentMol.atoms[o].atomIdx;
          if (rec.el === "H"){
            const cp = currentMol.atoms[o].pos, hp = rec.pos;
            const dx = hp[0]-cp[0], dy = hp[1]-cp[1], dz = hp[2]-cp[2];
            const l = Math.hypot(dx, dy, dz);
            if (l > 1e-6) hDir = [dx/l, dy/l, dz/l];
          }
          break;
        }
      }
    }
    if (cIdx >= 0){
      popoverState.customAtom = cIdx;
      popoverState.customDir = hDir;
      popoverState.ringPos = -1;
      const existing = crGroupsAt(creatorState, cIdx);
      // 规格同苯：取代 H → 挂官能团；已有基团 → 替换/移除
      const rho = rec.rel !== undefined ? " · ρ " + rec.rel.toFixed(2) : "";
      const title = "C" + (cIdx + 1) + rho + (existing.length ? " · " + existing.map(function (x){ return GROUP_LABEL[x.group]; }).join("+") + " — 替换基团" : "–H · 替换 H");
      let html = "<div class='pv-title'><b>" + title + "</b><span class='pv-close' id='pvClose'>✕</span></div><div class='pv-grid'>" + crChipsHTML(cIdx) + "</div>";
      popoverEl.innerHTML = html;
      popoverEl.classList.add("show");
      document.getElementById("pvClose").addEventListener("click", closePopover);
      popoverEl.querySelectorAll(".cr-gp").forEach(function (btn){
        btn.addEventListener("click", function (){
          substituteCustom(popoverState.customAtom, btn.dataset.g === "" ? null : btn.dataset.g);
        });
      });
      updatePopoverPos();
      return;
    }
  }
  popoverState.customAtom = -1;
  popoverState.ringPos = rec.ringPos;
  const frag = currentMol.fragments.find(function (f){ return f.pos === rec.ringPos; });
  const rho2 = rec.rel !== undefined ? " · ρ " + rec.rel.toFixed(2) : "";
  const title = frag ? "C" + (rec.ringPos + 1) + " · " + GROUPS[frag.group].zh + " — 替换基团" : "C" + (rec.ringPos + 1) + "–H · 替换 H" + rho2;
  let html = "<div class='pv-title'><b>" + title + "</b><span class='pv-close' id='pvClose'>✕</span></div><div class='pv-grid'>";
  for (const k of GROUP_KEYS){
    html += "<button class='pv-chip' data-g='" + k + "'>" + k + "</button>";
  }
  if (frag) html += "<button class='pv-chip remove' data-g=''>移除 (H)</button>";
  html += "</div>";
  popoverEl.innerHTML = html;
  popoverEl.classList.add("show");
  document.getElementById("pvClose").addEventListener("click", closePopover);
  popoverEl.querySelectorAll(".pv-chip").forEach(function (btn){
    btn.addEventListener("click", function (){
      const g = btn.dataset.g;
      substitute(popoverState.ringPos, g === "" ? null : g);
    });
  });
  updatePopoverPos();
}
function updatePopoverPos(){
  const v = new THREE.Vector3(popoverState.pos[0], popoverState.pos[1], popoverState.pos[2]);
  v.project(camera);
  const x = (v.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-v.y * 0.5 + 0.5) * window.innerHeight;
  const w = popoverEl.offsetWidth || 190;
  const h = popoverEl.offsetHeight || 130;
  popoverEl.style.left = clamp(x - w / 2, 8, window.innerWidth - w - 8) + "px";
  popoverEl.style.top = clamp(y - h - 14, 8, window.innerHeight - h - 8) + "px";
}
function closePopover(){
  popoverState.open = false;
  popoverEl.classList.remove("show");
}

/* 图例与信息卡 */
function findMoleculeName(){
  if (currentMol && currentMol.isCustom){
    const nC = currentMol.atoms.filter(function (a){ return a.el === "C"; }).length;
    const id = creatorState.lastIdent;
    if (id && id.name) return { name: id.name + "（" + id.zh + "）", formula: id.formula };
    return { name: "自定义碳架", formula: "C" + nC + " · " + (id ? id.formula : "自由绘制") };
  }
  const frags = currentMol ? currentMol.fragments : [];
  for (const m of MOLECULE_LIST){
    if (m.fragments.length === frags.length && m.fragments.every(function (f){
      return frags.some(function (x){ return x.pos === f.pos && x.group === f.group; });
    })){
      return m;
    }
  }
  return { name: "Benzene 衍生物", formula: "C6H5X" };
}
function rebuildLegend(){
  const el = document.getElementById("legend");
  if (!currentMol) return;
  const frags = currentMol.fragments;
  const name = findMoleculeName();
  let html = "<div class='mol'>" + name.name + " <span class='formula'>" + name.formula + "</span></div>";
  if (frags.length){
    html += "<div class='fxrow'>";
    for (const f of frags){
      const g = GROUPS[f.group];
      html += "<span class='fx-badge' data-g='" + f.group + "'>" + f.group + " <span class='i'>" + signLabel(g.sigmaM) + "I</span> <span class='m'>" + signLabel(g.sigmaP - g.sigmaM) + "M</span></span>";
    }
    html += "</div>";
  }
  html += "<div class='cmaprow'><span class='cmaplabel'>低密度</span><div class='cmapbar' id='cmapBar'></div><span class='cmaplabel'>高密度</span></div>";
  html += "<div class='densityhint'>悬停碳原子显示 ρ（" + (currentMol && currentMol.isCustom ? "碳均=1.00" : "苯环=1.00") + "）· 随模式变化</div>";
  el.innerHTML = html;
  const bar = document.getElementById("cmapBar");
  if (bar) bar.style.background = colormapCSS(COLORMAPS[SETTINGS.colormap].stops);
  el.querySelectorAll(".fx-badge").forEach(function (b){
    b.addEventListener("click", function (){ showInfoCard(b.dataset.g); });
  });
}
function showInfoCard(gk){
  const g = GROUPS[gk];
  const el = document.getElementById("infoCard");
  el.innerHTML = "<h3>" + g.name + " <span class='zh'>" + g.zh + "</span> <span class='close' id='icClose'>✕</span></h3>"
    + "<div class='kv'>"
    + "<div class='kv-row'><span>Inductive · σ<sub>m</sub></span><span class='val i'>" + signLabel(g.sigmaM) + "I · " + Math.abs(g.sigmaM).toFixed(2) + "</span></div>"
    + "<div class='kv-row'><span>Resonance · σ<sub>p</sub>−σ<sub>m</sub></span><span class='val m'>" + signLabel(g.sigmaP - g.sigmaM) + "M · " + Math.abs(g.sigmaP - g.sigmaM).toFixed(2) + "</span></div>"
    + "<div class='kv-row'><span>Overall</span><span class='val'>" + overallVerdict(g) + "</span></div>"
    + "</div><div class='desc'>" + g.desc + "</div>";
  el.classList.add("show");
  document.getElementById("icClose").addEventListener("click", function (){ el.classList.remove("show"); });
}

/* 提示 */
let toastTimer = null;
function toast(msg){
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function (){ el.classList.remove("show"); }, 2400);
}

/* 悬停碳原子 → 相对电子密度标签（苯环=1.00，随模式实时变化） */
let densityTarget = null;
function updateDensityHover(){
  const tag = document.getElementById("densityTag");
  const isSkeletonC = hoverRec && hoverRec.el === "C" && hoverRec.rel !== undefined && (hoverRec.ringPos !== undefined || (currentMol && currentMol.isCustom && hoverRec.atomIdx < creatorState.pts.length));
  if (isSkeletonC){
    densityTarget = { pos: hoverRec.pos, rel: hoverRec.rel, ringPos: hoverRec.ringPos };
    const custom = currentMol && currentMol.isCustom;
    const cNo = custom ? hoverRec.atomIdx + 1 : hoverRec.ringPos + 1;
    tag.innerHTML = "<span class='dt-val'>" + hoverRec.rel.toFixed(2) + "</span><span class='dt-cap'>C" + cNo + " · ρ · " + (custom ? "碳均=1.00" : "苯环=1.00") + "</span>";
    // 颜色取自当前电子云色图 LUT（该密度对应的云色），发光文字与云色调一致
    const t = clamp((hoverRec.rel - 0.2) / 1.8, 0, 1);
    const c = sampleStops(COLORMAPS[SETTINGS.colormap].stops, t);
    const cr = Math.round(c[0]), cg = Math.round(c[1]), cb = Math.round(c[2]);
    tag.style.borderColor = "rgb(" + cr + "," + cg + "," + cb + ")";
    tag.style.boxShadow = "0 0 22px rgba(" + cr + "," + cg + "," + cb + ",0.35), 0 8px 28px rgba(0,0,0,0.45)";
    const val = tag.querySelector(".dt-val");
    if (val) val.style.textShadow = "0 0 6px rgb(" + cr + "," + cg + "," + cb + "), 0 0 16px rgb(" + cr + "," + cg + "," + cb + ")";
    tag.classList.add("show");
    updateDensityTag();
  } else {
    densityTarget = null;
    if (tag) tag.classList.remove("show");
  }
}
function updateDensityTag(){
  if (!densityTarget) return;
  const tag = document.getElementById("densityTag");
  const v = new THREE.Vector3(densityTarget.pos[0], densityTarget.pos[1], densityTarget.pos[2]);
  v.project(camera);
  if (v.z > 1){ tag.classList.remove("show"); return; }
  const x = (v.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-v.y * 0.5 + 0.5) * window.innerHeight;
  const w = tag.offsetWidth || 60;
  const h = tag.offsetHeight || 34;
  tag.style.left = clamp(x - w / 2, 8, window.innerWidth - w - 8) + "px";
  tag.style.top = clamp(y - h - 14, 8, window.innerHeight - h - 8) + "px";
}

/* 指针交互（悬停高亮 + 点击选择） */
let hoverRec = null;
renderer.domElement.addEventListener("pointermove", function (e){
  const rec = pickAtom(e);
  if (rec !== hoverRec){
    if (hoverRec) setHover(hoverRec, false);
    hoverRec = rec;
    if (hoverRec) setHover(hoverRec, true);
    renderer.domElement.style.cursor = rec ? "pointer" : "";
  }
  updateDensityHover();
});
renderer.domElement.addEventListener("click", function (e){
  const rec = pickAtom(e);
  if (rec) openPopover(rec);
  else closePopover();
});
document.getElementById("explainBtn").addEventListener("click", function (){
  const on = !explainGroup.visible;
  explainGroup.visible = on;
  this.classList.toggle("on", on);
});

/* 调试面板（?debug=1） */
function recomputeAfterFx(){
  if (currentMol){
    currentField = computeField(currentMol, SETTINGS.mode);
    updateRelDensities();
    transitionCloud(currentField, [0, 0, 0]);
  }
}
function setupColormapUI(){
  const sel = document.getElementById("cmapSel");
  if (!sel) return;
  sel.value = SETTINGS.colormap;
  sel.addEventListener("change", function (){ setColormap(sel.value); });
  const bar = document.getElementById("cmapBar");
  if (bar) bar.style.background = colormapCSS(COLORMAPS[SETTINGS.colormap].stops);
}
function buildDebug(){
  if (!DEBUG) return;
  const el = document.getElementById("debugPanel");
  el.classList.add("show");
  const rows = [
    { key: "count", label: "Particles", min: 10000, max: 300000, step: 10000, get: function (){ return cloud ? cloud.count : 0; }, set: function (v){ setParticleCount(v); } },
    { key: "psize", label: "Particle size", min: 0.02, max: 0.09, step: 0.002, get: function (){ return cloud.uniforms.uParticleSize.value; }, set: function (v){ cloud.uniforms.uParticleSize.value = v; } },
    { key: "noise", label: "Noise amp", min: 0, max: 0.3, step: 0.005, get: function (){ return SETTINGS.noiseAmp; }, set: function (v){ SETTINGS.noiseAmp = v; } },
    { key: "breath", label: "Breath amp", min: 0, max: 0.15, step: 0.005, get: function (){ return SETTINGS.breathAmp; }, set: function (v){ SETTINGS.breathAmp = v; } },
    { key: "flow", label: "Flow amp", min: 0, max: 2, step: 0.05, get: function (){ return SETTINGS.flowAmp; }, set: function (v){ SETTINGS.flowAmp = v; } },
    { key: "alpha", label: "Cloud alpha", min: 0.1, max: 1.4, step: 0.05, get: function (){ return SETTINGS.cloudAlpha; }, set: function (v){ SETTINGS.cloudAlpha = v; } },
    { key: "bloomS", label: "Bloom strength", min: 0, max: 1.5, step: 0.05, get: function (){ return bloomPass.strength; }, set: function (v){ bloomPass.strength = v; } },
    { key: "bloomR", label: "Bloom radius", min: 0.1, max: 1.2, step: 0.05, get: function (){ return bloomPass.radius; }, set: function (v){ bloomPass.radius = v; } },
    { key: "bloomT", label: "Bloom threshold", min: 0.1, max: 0.9, step: 0.02, get: function (){ return bloomPass.threshold; }, set: function (v){ bloomPass.threshold = v; } },
    { key: "trans", label: "Transition s", min: 0.6, max: 4.5, step: 0.1, get: function (){ return SETTINGS.transDur; }, set: function (v){ SETTINGS.transDur = v; } },
    { key: "dgamma", label: "Density gamma", min: 0.3, max: 3, step: 0.05, get: function (){ return SETTINGS.densGamma; }, set: function (v){ SETTINGS.densGamma = v; if (cloud) cloud.uniforms.uDensGamma.value = v; } },
    { key: "ind", label: "Inductive x", min: 0, max: 2, step: 0.05, get: function (){ return SETTINGS.indScale; }, set: function (v){ SETTINGS.indScale = v; recomputeAfterFx(); } },
    { key: "res", label: "Resonance x", min: 0, max: 2, step: 0.05, get: function (){ return SETTINGS.resScale; }, set: function (v){ SETTINGS.resScale = v; recomputeAfterFx(); } },
  ];
  let html = "<h4>DEBUG · <span id='dbgFps'>--</span></h4>";
  for (const r of rows){
    html += "<div class='dbg-row'><span>" + r.label + "</span><input type='range' min='" + r.min + "' max='" + r.max + "' step='" + r.step + "' data-k='" + r.key + "'><span class='dbg-val' id='dbgv_" + r.key + "'></span></div>";
  }
  el.innerHTML = html;
  el.querySelectorAll("input[type=range]").forEach(function (inp){
    const r = rows.find(function (x){ return x.key === inp.dataset.k; });
    inp.value = r.get();
    document.getElementById("dbgv_" + r.key).textContent = (+inp.value).toFixed(3);
    inp.addEventListener("input", function (){
      const v = parseFloat(inp.value);
      r.set(v);
      document.getElementById("dbgv_" + r.key).textContent = (+v).toFixed(3);
    });
  });
}

/* ================= 创造模式：自由绘制碳架 ================= */
const creatorState = { open:false, pts:[], bonds:[], groups:[], tool:"atom", bondOrder:1, sel:-1, customAtom:-1 };
const GROUP_LABEL = { CH3:"CH₃", OH:"OH", OMe:"OCH₃", NH2:"NH₂", F:"F", Cl:"Cl", CF3:"CF₃", CN:"CN", NO2:"NO₂", CHO:"CHO", COOH:"COOH" };
/* 创造模式价键工具：剩余价键 = 4 − Σ(键级) − 已挂基团数（键级：单 1 / 芳香 1.5 / 双 2 / 三 3） */
function crBondOrderSum(graph, i){
  let s = 0;
  for (const b of graph.bonds) if (b[0] === i || b[1] === i) s += (b[2] || 1);
  return s;
}
function crGroupsAt(graph, i){ return graph.groups.filter(function (g){ return g.i === i; }); }
function crFreeValence(graph, i){
  return Math.max(0, Math.round(4 - crBondOrderSum(graph, i)) - crGroupsAt(graph, i).length);
}
const crCanvas = document.getElementById("crCanvas");
const crCtx = crCanvas ? crCanvas.getContext("2d") : null;
const HEX = 1.4;
const CR_SCALE = 24;
const CR_CX = 172, CR_CY = 150;

function crHexCenter(row, col){
  return [ (col + (row % 2 ? 0.5 : 0)) * HEX, row * 0.866 * HEX ];
}
function crSnap(px, py){
  const x = (px - CR_CX) / CR_SCALE, y = (py - CR_CY) / CR_SCALE;
  const r = Math.round(y / (0.866 * HEX));
  const c = Math.round((x - (r % 2 ? 0.5 : 0) * HEX) / HEX);
  let best = null, bestD = Infinity;
  for (let dr = -1; dr <= 1; dr++){
    for (let dc = -1; dc <= 1; dc++){
      const p = crHexCenter(r + dr, c + dc);
      const d2 = (p[0]-x)*(p[0]-x) + (p[1]-y)*(p[1]-y);
      if (d2 < bestD){ bestD = d2; best = p; }
    }
  }
  return best;
}
function crNearest(x3, y3, maxD){
  let best = -1, bestD = maxD * maxD;
  for (let i = 0; i < creatorState.pts.length; i++){
    const d2 = (creatorState.pts[i][0]-x3)*(creatorState.pts[i][0]-x3) + (creatorState.pts[i][1]-y3)*(creatorState.pts[i][1]-y3);
    if (d2 < bestD){ bestD = d2; best = i; }
  }
  return best;
}
function crHasBond(a, b){
  return creatorState.bonds.some(function (bb){ return (bb[0]===a && bb[1]===b) || (bb[0]===b && bb[1]===a); });
}
function crRemoveAtom(i){
  creatorState.pts.splice(i, 1);
  creatorState.bonds = creatorState.bonds.filter(function (bb){ return bb[0] !== i && bb[1] !== i; });
  creatorState.groups = creatorState.groups.filter(function (g){ return g.i !== i; });
  creatorState.bonds.forEach(function (bb){ if (bb[0] > i) bb[0]--; if (bb[1] > i) bb[1]--; });
  creatorState.groups.forEach(function (g){ if (g.i > i) g.i--; });
  creatorState.sel = -1;
}
/* 官能团选择器（3D 弹层，取代 H，规格同苯）：符号 + 中文名 + ±I/±M，标记已挂，无可取代 H 时禁用 */
function crChipsHTML(atomIdx){
  const existing = crGroupsAt(creatorState, atomIdx);
  const freeLeft = Math.max(0, crFreeValence(creatorState, atomIdx));
  let html = "<div class='cr-gp-info'>碳 " + (atomIdx + 1) + " · 可取代 H：" + freeLeft + (existing.length ? " · 已挂 " + existing.map(function (x){ return GROUP_LABEL[x.group]; }).join("+") : "") + "</div>";
  for (const k of GROUP_KEYS){
    const g = GROUPS[k];
    const on = existing.some(function (x){ return x.group === k; });
    html += "<button class='cr-gp" + (on ? " on" : "") + (freeLeft <= 0 ? " full" : "") + "' data-g='" + k + "' title='" + g.desc + "'>"
      + "<span class='sym'>" + GROUP_LABEL[k] + "</span><span class='zh'>" + g.zh + "</span>"
      + "<span class='fx'>" + signLabel(g.sigmaM) + "I " + signLabel(g.sigmaP - g.sigmaM) + "M</span></button>";
  }
  if (existing.length) html += "<button class='cr-gp remove' data-g='' title='移除该碳最后添加的基团'>移除" + (existing.length > 1 ? "（" + GROUP_LABEL[existing[existing.length - 1].group] + "）" : "") + "</button>";
  return html;
}
/* 增/删官能团（价键校验；g==="" 移除该碳最后挂的基团） */
function crSetGroupAt(atomIdx, g, dir){
  const existing = crGroupsAt(creatorState, atomIdx);
  if (g === ""){
    const last = existing[existing.length - 1];
    if (last){
      creatorState.groups.splice(creatorState.groups.lastIndexOf(last), 1);
      toast("已移除 " + GROUP_LABEL[last.group] + "（" + GROUPS[last.group].zh + "）");
    }
    return;
  }
  if (crFreeValence(creatorState, atomIdx) <= 0){
    toast("该碳剩余价键为 0，无法再挂官能团");
    return;
  }
  // dir：取代指定 H（点击的那个 H 的方向）；无 dir 时按「朝外」放置
  creatorState.groups.push({ i: atomIdx, group: g, dir: dir || undefined });
  toast("已添加 " + GROUP_LABEL[g] + "（" + GROUPS[g].zh + "）");
}
function crRedraw(){
  if (!crCtx) return;
  const ctx = crCtx;
  ctx.clearRect(0, 0, crCanvas.width, crCanvas.height);
  ctx.strokeStyle = "rgba(120,150,190,0.10)";
  ctx.lineWidth = 1;
  for (let r = -6; r <= 6; r++){
    for (let c = -8; c <= 8; c++){
      const p = crHexCenter(r, c);
      ctx.beginPath();
      ctx.arc(CR_CX + p[0]*CR_SCALE, CR_CY + p[1]*CR_SCALE, 2.2, 0, Math.PI*2);
      ctx.stroke();
    }
  }
  ctx.strokeStyle = "rgba(190,205,225,0.75)";
  ctx.lineWidth = 2.5;
  for (const b of creatorState.bonds){
    const a = creatorState.pts[b[0]], c = creatorState.pts[b[1]];
    const ax = CR_CX + a[0]*CR_SCALE, ay = CR_CY + a[1]*CR_SCALE;
    const cx = CR_CX + c[0]*CR_SCALE, cy = CR_CY + c[1]*CR_SCALE;
    const dx = cx - ax, dy = cy - ay, len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const o = b[2] || 1;
    const line = function (off){
      ctx.beginPath();
      ctx.moveTo(ax + nx*off, ay + ny*off);
      ctx.lineTo(cx + nx*off, cy + ny*off);
      ctx.stroke();
    };
    if (o >= 3){ line(-2.6); line(0); line(2.6); }
    else if (o === 2){ line(-1.9); line(1.9); }
    else if (o === 1.5){
      line(0);
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(ax + nx*3.5, ay + ny*3.5); ctx.lineTo(cx + nx*3.5, cy + ny*3.5); ctx.stroke();
      ctx.setLineDash([]);
    }
    else line(0);
  }
  for (let i = 0; i < creatorState.pts.length; i++){
    const p = creatorState.pts[i];
    const x = CR_CX + p[0]*CR_SCALE, y = CR_CY + p[1]*CR_SCALE;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI*2);
    ctx.fillStyle = i === creatorState.sel ? "rgba(124,199,255,0.55)" : "rgba(190,205,225,0.85)";
    ctx.fill();
  }
}
function crApply(){
  if (!creatorState.pts.length) return;
  const mol = buildCustomMolecule(creatorState);
  applyMol(mol, [0, 0, 0]);
  setActiveMoleculeChip("");
  creatorState.lastIdent = identifyMolecule(mol);
  const el = document.getElementById("crIdentify");
  if (el){
    const id = creatorState.lastIdent;
    el.textContent = id.name ? ("已识别：" + id.zh + " " + id.name + " · " + id.formula) : ("未命名碳架 · " + id.formula + " · SMILES: " + id.smiles);
  }
  rebuildLegend();
}
function substituteCustom(atomIdx, group){
  const dir = popoverState.customDir || null;
  closePopover();
  crSetGroupAt(atomIdx, group === null ? "" : group, dir);
  crRedraw();
  crApply();
}
function toggleCreator(show){
  creatorState.open = show !== undefined ? show : !creatorState.open;
  document.getElementById("creator").classList.toggle("show", creatorState.open);
  document.getElementById("creatorBtn").classList.toggle("active", creatorState.open);
  if (creatorState.open) crRedraw();
}
if (crCanvas){
  crCanvas.addEventListener("click", function (e){
    const rect = crCanvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (crCanvas.width / rect.width);
    const py = (e.clientY - rect.top) * (crCanvas.height / rect.height);
    const p = crSnap(px, py);
    if (!p) return;
    const tool = creatorState.tool;
    if (tool === "atom"){
      if (crNearest(p[0], p[1], 0.5) < 0) creatorState.pts.push(p);
      creatorState.sel = -1;
    } else if (tool === "bond"){
      const i = crNearest(p[0], p[1], 0.9);
      if (i < 0) creatorState.sel = -1;
      else if (creatorState.sel < 0) creatorState.sel = i;
      else {
        if (creatorState.sel !== i){
          const o = creatorState.bondOrder || 1;
          const ex = creatorState.bonds.findIndex(function (bb){ return (bb[0]===creatorState.sel&&bb[1]===i)||(bb[0]===i&&bb[1]===creatorState.sel); });
          if (ex >= 0) creatorState.bonds[ex][2] = o; // 已有键 → 升级键级
          else creatorState.bonds.push([creatorState.sel, i, o]);
          const bad = [creatorState.sel, i].some(function (k){ return crBondOrderSum(creatorState, k) > 4; });
          if (bad){
            if (ex >= 0) creatorState.bonds[ex][2] = 1;
            else creatorState.bonds.pop();
            toast("价键超过 4，已回退（碳最多 4 键）");
          }
        }
        creatorState.sel = -1;
      }
    } else if (tool === "erase"){
      const i = crNearest(p[0], p[1], 0.9);
      if (i >= 0) crRemoveAtom(i);
    }
    crRedraw();
  });
  document.querySelectorAll(".cr-tool").forEach(function (b){
    b.addEventListener("click", function (){
      creatorState.tool = b.dataset.tool;
      creatorState.sel = -1;
      document.querySelectorAll(".cr-tool").forEach(function (x){ x.classList.toggle("active", x === b); });
    });
  });
  document.querySelectorAll(".cr-bord").forEach(function (b){
    b.addEventListener("click", function (){
      creatorState.bondOrder = parseFloat(b.dataset.order);
      document.querySelectorAll(".cr-bord").forEach(function (x){ x.classList.toggle("active", x === b); });
    });
  });
  document.getElementById("creatorBtn").addEventListener("click", function (){ toggleCreator(); });
  document.getElementById("crClose").addEventListener("click", function (){ toggleCreator(false); });
  document.getElementById("crApply").addEventListener("click", crApply);
  document.getElementById("crClear").addEventListener("click", function (){
    creatorState.pts = [];
    creatorState.bonds = [];
    creatorState.groups = [];
    creatorState.sel = -1;
    crRedraw();
  });
  document.getElementById("crLoadBz").addEventListener("click", function (){
    const pts = [];
    for (let k = 0; k < 6; k++){
      const a = Math.PI / 6 + k * Math.PI / 3;
      pts.push([1.4 * Math.cos(a), 1.4 * Math.sin(a)]);
    }
    creatorState.pts = pts;
    creatorState.bonds = [[0,1,1.5],[1,2,1.5],[2,3,1.5],[3,4,1.5],[4,5,1.5],[5,0,1.5]];
    creatorState.groups = [];
    creatorState.sel = -1;
    crRedraw();
  });
}

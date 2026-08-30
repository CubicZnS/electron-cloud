/* ================= 主循环 ================= */
const clock = new THREE.Clock();
let simTime = 0;
let introT = 0;
let introDone = false;
const INTRO_DUR = 2.0;
const camFrom = new THREE.Vector3(0, 5.4, 21.0);
const camTo = new THREE.Vector3(0, 0.6, 11.0);
let fpsEma = 60;
let lowFpsTime = 0;
let manualQualityAt = -99;

function onResize(){
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  composer.setSize(w, h);
  if (cloud){
    cloud.uniforms.uScale.value = (h * renderer.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    cloud.uniforms.uPixelRatio.value = renderer.getPixelRatio();
  }
}
window.addEventListener("resize", onResize);

function tick(){
  if (window.__WEBGL_DEAD) return; // 上下文丢失：停止渲染循环（恢复事件会重启）
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.05);
  simTime += dt;
  if (introT < INTRO_DUR){
    introT += dt;
    const k = easeInOutCubic(clamp(introT / INTRO_DUR, 0, 1));
    camera.position.lerpVectors(camFrom, camTo, k);
  }
  if (introT >= INTRO_DUR && !introDone){
    introDone = true;
    controls.enabled = true;
    document.getElementById("intro").classList.add("out");
  }
  controls.update();
  updateDying(simTime);
  updateMoleculeAnims(simTime);
  cloud.uniforms.uTime.value = simTime;
  cloud.uniforms.uCloudAlpha.value = SETTINGS.cloudAlpha;
  cloud.uniforms.uNoiseAmp.value = SETTINGS.noiseAmp;
  cloud.uniforms.uBreathAmp.value = SETTINGS.breathAmp;
  cloud.uniforms.uFlowAmp.value = SETTINGS.flowAmp;
  if (dt > 0) fpsEma = fpsEma * 0.95 + (1 / dt) * 0.05;
  if (simTime > 8 && simTime - manualQualityAt > 20){
    if (fpsEma < 29){
      lowFpsTime += dt;
      if (lowFpsTime > 2.2){
        const qi = QUALITY_ORDER.indexOf(SETTINGS.quality);
        if (qi > 0){
          setQuality(QUALITY_ORDER[qi - 1], true);
          toast("性能自适应：已切换到 " + QUALITY_ORDER[qi - 1]);
        }
        lowFpsTime = 0;
      }
    } else {
      lowFpsTime = Math.max(0, lowFpsTime - dt);
    }
  }
  if (popoverState.open) updatePopoverPos();
  if (densityTarget) updateDensityTag();
  composer.render();
}

/* ================= 初始化 ================= */
// 移动端/触摸设备默认低档粒子（40k），避免手机 GPU/内存压力导致页面被系统杀进程重载；
// 用户手动选择过画质则记住（localStorage）
(function (){
  try {
    const saved = localStorage.getItem("ec_quality");
    if (saved && QUALITY[saved]){ SETTINGS.quality = saved; return; }
  } catch (e){}
  const small = window.innerWidth < 768;
  const touch = ("ontouchstart" in window) || (navigator.maxTouchPoints || 0) > 0;
  if (small || touch) SETTINGS.quality = "LOW";
})();
currentMol = buildMolecule([]);
currentField = computeField(currentMol, SETTINGS.mode);
setQuality(SETTINGS.quality, false); // 应用档位（bloom/粒子数/UI 高亮）
cloud = createCloud(QUALITY[SETTINGS.quality].count);
(function initCloud(){
  const grid = buildDensityGrid(currentField);
  const data = sampleCloud(currentField, cloud.count, null, grid);
  const g = cloud.geo.attributes;
  g.position.array.set(data.pos);
  g.position.needsUpdate = true;
  {
    const props = new Float32Array(cloud.count * 4);
    for (let i = 0; i < cloud.count; i++){ props[i * 4] = data.size[i]; props[i * 4 + 1] = data.bright[i]; props[i * 4 + 2] = data.density[i]; }
    g.aProps.array.set(props);
    g.aProps.needsUpdate = true;
  }
  g.aSeed.array.set(data.seed);
  g.aSeed.needsUpdate = true;
  padCloudPaths(data.pos, cloud.geo);
})();
buildMoleculeMeshes(currentMol);
updateRelDensities();
rebuildLegend();
rebuildExplain();
buildMoleculeBar();
wireSegments();
buildDebug();
setupColormapUI();
document.getElementById("intro").addEventListener("click", function (){ introT = INTRO_DUR; camera.position.copy(camTo); });
{
  const brand = document.getElementById("brand");
  const span = document.createElement("span");
  span.className = "sub";
  span.id = "particleCount";
  brand.appendChild(span);
  updateParticleUI();
}
onResize();
requestAnimationFrame(tick);

window.THREE = THREE;
window.camera = camera;
window.__APP = {
  get cloud(){ return cloud; },
  renderer: renderer,
  camera: camera,
  setMode: setMode,
  setQuality: setQuality,
  selectMolecule: selectMolecule,
  substitute: substitute,
  changeMolecule: changeMolecule,
  setParticleCount: setParticleCount,
  setColormap: setColormap,
  getMol: function (){ return currentMol; },
  crApply: crApply,
  toggleCreator: toggleCreator,
  crState: function (){ return { pts: creatorState.pts.length, bonds: creatorState.bonds.length, groups: creatorState.groups.slice(), tool: creatorState.tool }; },
  getHover: function (){
    const r = hoverAnims.length ? hoverAnims[hoverAnims.length - 1] : hoverRec;
    return r ? { scale: +(r.hoverScale || 0).toFixed(3), on: r.hover } : null;
  },
  getState: function (){
    return {
      mode: SETTINGS.mode,
      quality: SETTINGS.quality,
      particles: cloud ? cloud.count : 0,
      fragments: currentMol ? currentMol.fragments.slice() : [],
      fps: Math.round(fpsEma),
      transActive: cloud ? (simTime - cloud.uniforms.uTransStart.value) < cloud.uniforms.uTransDur.value : false,
      simTime: +simTime.toFixed(2),
    };
  },
};

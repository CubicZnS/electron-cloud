/* Crystal Lab owns its DOM, scientific state, requests and renderer. */
const CrystalLab = (() => {
  const style=document.createElement('style');
  style.textContent=`
/* Crystal Lab — unified with Electron Cloud design language (tokens from :root) */
#crystalBtn{width:40px;height:40px;flex:0 0 40px;border-radius:50%;padding:0;display:grid;place-items:center;color:#9ddccf;cursor:pointer;transition:all .18s}
#crystalBtn:hover{border-color:#9ddccf;box-shadow:0 0 18px #9ddccf22}
#crystalLab{box-sizing:border-box;position:fixed;inset:0;z-index:70;display:none;padding:0;border:0;border-radius:0;background:#04060a;color:var(--ink);font:12px/1.6 "SF Pro Display","SF Pro Text",-apple-system,"PingFang SC","Segoe UI",system-ui,sans-serif;overflow:hidden;color-scheme:dark;user-select:none;-webkit-font-smoothing:antialiased}
#crystalLab.open{display:block}
#crystalLab *{box-sizing:border-box}
#crystalLab button,#crystalLab input,#crystalLab select{font:inherit;color:inherit}
#crystalLab :focus-visible{outline:2px solid var(--accent);outline-offset:2px}
/* ---------- top bar ---------- */
#crystalLab .cl-top{display:flex;align-items:center;gap:14px;padding:10px 16px;border-bottom:1px solid var(--stroke);background:linear-gradient(180deg,rgba(18,28,44,.92),rgba(9,13,21,.85));backdrop-filter:blur(14px) saturate(1.2);-webkit-backdrop-filter:blur(14px) saturate(1.2)}
#crystalLab .cl-mark{width:34px;height:34px;flex:none;display:grid;place-items:center;color:#9ddccf;border:1px solid #9ddccf55;border-radius:10px;background:rgba(157,220,207,.08)}
#crystalLab .cl-mark svg{width:20px;height:20px}
#crystalLab .cl-titlewrap{min-width:0}
#crystalLab h2{font-size:15px;font-weight:600;letter-spacing:.1em;color:#eaf6ff;margin:0;line-height:1.2}
#crystalLab .cl-eyebrow{font-size:10px;letter-spacing:.18em;color:var(--dim);margin-top:2px}
#crystalLab .cl-top-right{margin-left:auto;display:flex;align-items:center;gap:12px}
#crystalLab .cl-engine{display:inline-flex;align-items:center;gap:7px;font-size:10px;letter-spacing:1px;color:var(--dim)}
#crystalLab .cl-engine i{width:7px;height:7px;border-radius:50%;background:var(--faint);transition:background .3s,box-shadow .3s}
#crystalLab .cl-engine[data-ready=yes] i{background:#9fe0b0;box-shadow:0 0 8px rgba(159,224,176,.7)}
#crystalLab .cl-engine[data-ready=load] i{background:var(--accent);animation:clPulse 1s infinite}
#crystalLab .cl-engine[data-ready=no] i{background:#5b6678}
@keyframes clPulse{50%{opacity:.3}}
#crystalLab .cl-close{width:30px;height:30px;padding:0;display:grid;place-items:center;border-radius:8px;border:1px solid var(--stroke);background:transparent;color:var(--dim);cursor:pointer;font-size:13px;line-height:1}
#crystalLab .cl-close:hover{color:#eaf6ff;border-color:rgba(124,199,255,.45)}
/* ---------- layout ---------- */
#crystalLab .cl-layout{display:grid;grid-template-columns:300px minmax(0,1fr);height:calc(100% - 56px)}
#crystalLab .cl-side{overflow:auto;scrollbar-width:thin;scrollbar-color:#2c3d57 transparent;padding:6px 0 16px;border-right:1px solid var(--stroke);background:linear-gradient(180deg,rgba(10,15,24,.7),rgba(7,10,16,.55))}
#crystalLab section.cl-pane{padding:15px 16px;border-bottom:1px solid var(--stroke)}
#crystalLab .cl-pane h3{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:600;letter-spacing:.16em;color:#cfe0f5;margin:0 0 12px}
#crystalLab .cl-pane h3 .cl-idx{font:10px ui-monospace,SFMono-Regular,monospace;color:var(--faint);letter-spacing:0}
#crystalLab .cl-pane h3 .cl-state{margin-left:auto;font:10px ui-monospace,monospace;color:var(--dim);letter-spacing:.05em}
#crystalLab label.cl-field{display:flex;flex-direction:column;gap:4px;color:var(--dim);font-size:10px;letter-spacing:.5px;margin:0 0 9px}
#crystalLab label.cl-field em{font-style:normal;color:var(--faint);font-weight:400}
#crystalLab .cl-row{display:flex;gap:8px;align-items:flex-end}
#crystalLab .cl-row>*{flex:1;min-width:0}
#crystalLab .cl-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
#crystalLab .cl-actions>button{flex:1;white-space:nowrap}
#crystalLab select,#crystalLab input:not([type=checkbox]):not([type=range]){width:100%;min-width:0;background:#0b1320;border:1px solid var(--stroke);border-radius:8px;padding:7px 8px;color:#d9e6f7;font-size:12px;outline:none;transition:border-color .15s,background .15s;height:32px}
#crystalLab select:focus,#crystalLab input:not([type=checkbox]):not([type=range]):focus{border-color:rgba(124,199,255,.55);background:#0e1726}
#crystalLab select option{background:#0d1622;color:#d9e6f7}
#crystalLab input[type=range]{accent-color:var(--accent);width:100%;height:3px;margin:5px 0}
#crystalLab input[type=checkbox]{accent-color:var(--accent);vertical-align:-2px;margin-right:6px}
#crystalLab input[type=number]{font-variant-numeric:tabular-nums}
#crystalLab .dshell-btn,#crystalLab .dshell-btnGhost{border-radius:8px;padding:7px 12px;font-size:11px;letter-spacing:1px;font-family:inherit;cursor:pointer;transition:all .15s;white-space:nowrap}
#crystalLab .dshell-btnGhost{border:1px solid rgba(163,182,214,.22);background:transparent;color:var(--dim)}
#crystalLab .dshell-btnGhost:hover{color:#eaf6ff;border-color:rgba(124,199,255,.45)}
#crystalLab .cl-wide{width:100%}
#crystalLab .cl-btnrow{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}
#crystalLab .cl-muted{font-size:9px;color:var(--faint);letter-spacing:.5px;line-height:1.7;margin:7px 0 0;overflow-wrap:anywhere}
#crystalLab .cl-muted a{color:#7fb8e8;text-decoration:none}
#crystalLab .cl-muted a:hover{text-decoration:underline}
#crystalLab .cl-warn{font-size:10px;color:var(--amber);line-height:1.6;margin:7px 0 0}
#crystalLab details{margin-top:10px;font-size:10px;color:var(--dim);line-height:1.7}
#crystalLab summary{cursor:pointer;color:#b9cfe6;letter-spacing:.5px}
#crystalLab details p{margin:6px 0;overflow-wrap:anywhere}
/* ---------- stage ---------- */
#crystalLab .cl-stagewrap{display:flex;flex-direction:column;min-height:0;padding:12px 14px 14px;gap:10px}
#crystalLab .cl-viewportwrap{position:relative;flex:1;min-height:240px;border-radius:14px;overflow:hidden;border:1px solid var(--stroke);background:radial-gradient(120% 90% at 50% 20%,#13233b 0%,#080d16 70%);box-shadow:inset 0 0 60px rgba(0,0,0,.4)}
#crystalLab .cl-viewport{position:absolute;inset:0;overflow:hidden}
#crystalLab .cl-viewport canvas{display:block;width:100%;height:100%;touch-action:none;outline:none}
#crystalLab .cl-headline{position:absolute;top:12px;left:14px;right:14px;display:flex;justify-content:space-between;align-items:flex-start;gap:10px;pointer-events:none}
#crystalLab .cl-headline .cl-left{min-width:0}
#crystalLab .cl-formula{font-size:20px;font-weight:650;letter-spacing:.02em;color:#eef6ff;text-shadow:0 1px 12px rgba(0,0,0,.55);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#crystalLab .cl-meta{font-size:10px;color:#aebdd1;letter-spacing:.4px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#crystalLab .cl-hint{text-align:right;font-size:10px;color:#8fa2bb;line-height:1.8;letter-spacing:.4px}
#crystalLab .cl-hint span{display:block;font-size:9px;color:#5f7189}
#crystalLab .cl-tools{position:absolute;left:14px;right:14px;bottom:12px;display:flex;justify-content:space-between;align-items:flex-end;gap:10px;pointer-events:none}
#crystalLab .cl-legendbox{display:flex;flex-direction:column;gap:4px;min-width:0;max-width:62%}
#crystalLab .cl-legend{display:flex;flex-wrap:wrap;gap:6px 12px;font-size:11px;color:#c8d9ec;background:rgba(7,11,18,.62);border:1px solid var(--stroke);border-radius:10px;padding:6px 10px;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
#crystalLab .cl-legend i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px;vertical-align:-1px}
#crystalLab .cl-caption{font-size:9px;color:var(--faint);letter-spacing:.5px;line-height:1.7}
#crystalLab .cl-fit{pointer-events:auto}
/* ---------- results bench ---------- */
#crystalLab .cl-bench{background:rgba(9,13,21,.78);border:1px solid var(--stroke);border-radius:14px;overflow:hidden;backdrop-filter:blur(12px) saturate(1.1);-webkit-backdrop-filter:blur(12px) saturate(1.1)}
#crystalLab .cl-inspect{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:9px 14px;border-bottom:1px solid var(--stroke)}
#crystalLab .cl-inspect label{font-size:10px;color:var(--dim);letter-spacing:.5px}
#crystalLab .cl-inspect select{width:auto;min-width:180px;height:28px;padding:3px 8px;font-size:11px}
#crystalLab .cl-mono{font:11px/1.6 ui-monospace,SFMono-Regular,monospace;font-variant-numeric:tabular-nums;color:#bcd6f2;letter-spacing:.3px}
#crystalLab .cl-neighbor{color:var(--dim);font-size:10px;letter-spacing:.3px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-left:auto}
#crystalLab .cl-results{padding:12px 14px 10px}
#crystalLab .cl-results h4{font-size:11px;font-weight:600;letter-spacing:.16em;color:#cfe0f5;margin:0 0 10px;display:flex;align-items:center;gap:10px}
#crystalLab .cl-results h4 span{font-size:10px;color:var(--faint);letter-spacing:.3px;font-weight:400}
#crystalLab .cl-empty{font-size:10px;color:var(--dim);line-height:1.8;letter-spacing:.3px}
#crystalLab .cl-empty .cl-quick{margin-top:10px}
#crystalLab .cl-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:4px 0 12px}
#crystalLab .cl-metric{border:1px solid var(--stroke);border-radius:10px;padding:8px 10px;background:rgba(255,255,255,.02)}
#crystalLab .cl-metric small{display:block;font-size:9px;color:var(--faint);letter-spacing:.5px;margin-bottom:4px}
#crystalLab .cl-metric b{display:block;font:600 17px/1.4 ui-monospace,SFMono-Regular,monospace;color:#e8f3ff;font-variant-numeric:tabular-nums}
#crystalLab .cl-ctl{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin:6px 0 2px}
#crystalLab .cl-ctl label{font-size:10px;color:var(--dim);letter-spacing:.5px}
#crystalLab .cl-ctl .cl-field{flex:1;min-width:150px;margin:0}
#crystalLab .cl-check{display:inline-flex;align-items:center;font-size:10px;color:var(--dim);letter-spacing:.4px;margin-right:14px;cursor:pointer}
#crystalLab .cl-note{font-size:9px;color:var(--faint);letter-spacing:.4px;line-height:1.7;margin:8px 0 0}
#crystalLab .cl-status{margin-top:6px;border-top:1px solid var(--stroke);padding:8px 14px 6px;font-size:10px;letter-spacing:.4px;color:var(--dim);min-height:22px;display:flex;align-items:center;gap:8px}
#crystalLab .cl-status .dot{width:6px;height:6px;border-radius:50%;flex:none;background:var(--faint)}
#crystalLab .cl-status[data-tone=success]{color:#b8e6c4}
#crystalLab .cl-status[data-tone=success] .dot{background:#9fe0b0}
#crystalLab .cl-status[data-tone=error]{color:#ffc1b8}
#crystalLab .cl-status[data-tone=error] .dot{background:#ff9a8f}
#crystalLab .cl-counting{font-size:9px;color:var(--faint);letter-spacing:.4px;line-height:1.7;margin-top:3px}
/* ---------- responsive ---------- */
@media(max-width:900px){
  #crystalLab .cl-layout{grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr);height:calc(100% - 56px);overflow:auto}
  #crystalLab .cl-side{border-right:0;border-bottom:1px solid var(--stroke)}
  #crystalLab .cl-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-width:560px){
  #crystalBtn{width:36px;height:36px;flex-basis:36px}
  #crystalLab .cl-top{flex-wrap:wrap;padding:8px 10px}
  #crystalLab .cl-hint{display:none}
}

`;
  document.head.appendChild(style);
  const icon='<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10"/><path d="m7.5 4.5 9 5v10M7.5 19.5v-10l9-5" opacity=".5"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/></svg>';
  const entry=document.createElement('button');entry.id='crystalBtn';entry.className='panel';entry.title='Crystal Lab · 晶体实验室';entry.setAttribute('aria-label','晶体实验室');entry.innerHTML=icon;
  document.getElementById('quantumBtn').after(entry);
  const lab=document.createElement('section');lab.id='crystalLab';lab.setAttribute('aria-labelledby','cl-title');lab.setAttribute('aria-hidden','true');
  lab.innerHTML=`
  <header class="cl-top">
    <div class="cl-mark">${icon}</div>
    <div class="cl-titlewrap"><h2 id="cl-title">晶体实验室</h2><div class="cl-eyebrow">周期结构 · 局部弛豫</div></div>
    <div class="cl-top-right">
      <span class="cl-engine"><i></i><span id="cl-engine-dot">离线</span></span>
      <button class="cl-close" id="cl-close" aria-label="退出晶体实验室">✕</button>
    </div>
  </header>
  <div class="cl-layout">
    <aside class="cl-side">
      <section class="cl-pane">
        <h3><span class="cl-idx">01</span> 结构参数</h3>
        <label class="cl-field">晶体模板<select id="cl-template"><option value="">选择常见化合物…</option></select></label>
        <button id="cl-load-template" class="dshell-btnGhost cl-wide" disabled>载入模板 · 1 × 1 × 1</button>
        <p id="cl-template-note" class="cl-muted"></p>
        <label class="cl-field">晶体结构<select id="cl-kind"></select></label>
        <div class="cl-row">
          <label class="cl-field">A 位 / 主体元素<select id="cl-el-a"></select></label>
          <label class="cl-field" id="cl-b-field">B 位元素<select id="cl-el-b"></select></label>
          <label class="cl-field" id="cl-c-field" hidden>C 位元素<select id="cl-el-c"></select></label>
        </div>
        <div class="cl-row">
          <label class="cl-field">晶格常数 a · Å<input id="cl-a" type="number" min="1" max="20" step=".01" value="2.88"></label>
          <label class="cl-field" id="cl-ratio-field" hidden>c / a<input id="cl-ratio" type="number" step=".001" value="1.632993"></label>
          <button id="cl-regenerate" class="dshell-btnGhost cl-auto" title="按当前参数重新生成初始猜测结构，清除掺杂、空位和弛豫结果">生成</button>
        </div>
        <label class="cl-field" id="cl-u-field" hidden><span id="cl-u-label">内部坐标 u</span><input id="cl-u" type="number" min=".001" max=".999" step=".001" value=".375"></label>
        <p id="cl-prototype-note" class="cl-muted"></p>
        <div class="cl-row">
          <label class="cl-field">超胞 x<input id="cl-nx" type="number" value="3" min="1" max="8"></label>
          <label class="cl-field">y<input id="cl-ny" type="number" value="3" min="1" max="8"></label>
          <label class="cl-field">z<input id="cl-nz" type="number" value="3" min="1" max="8"></label>
        </div>
        <div class="cl-actions"><button id="cl-build" class="dshell-btn cl-wide">生成晶体</button></div>
        <div class="cl-btnrow">
          <button id="cl-import" class="dshell-btnGhost">导入结构</button>
          <button id="cl-json" class="dshell-btnGhost">导出项目</button>
          <button id="cl-xyz" class="dshell-btnGhost cl-wide">XYZ</button>
        </div>
        <input id="cl-file" type="file" accept=".json,.cif,.vasp,.poscar,.xyz,.extxyz" hidden>
        <p class="cl-muted">晶格常数为初始猜测，可调整 · 上限 512 原子</p>
      </section>
      <section class="cl-pane">
        <h3><span class="cl-idx">02</span> 位点与掺杂</h3>
        <div class="cl-row">
          <label class="cl-field">替换元素<select id="cl-dopant"></select></label>
          <label class="cl-field">子晶格<select id="cl-site"><option value="A">A 位</option><option value="B">B 位</option><option value="all">全部位点</option></select></label>
        </div>
        <div class="cl-actions">
          <button id="cl-substitute" class="dshell-btnGhost">替换选中原子</button>
          <button id="cl-vacancy" class="dshell-btnGhost">移除选中原子</button>
        </div>
        <div class="cl-row" style="margin-top:4px">
          <label class="cl-field">随机数量<input id="cl-count" type="number" min="1" max="512" value="1"></label>
          <label class="cl-field">随机种子<input id="cl-seed" type="number" step="1" value="42"></label>
        </div>
        <div class="cl-actions"><button id="cl-random" class="dshell-btnGhost cl-wide">按位点随机替换</button></div>
        <p id="cl-composition" class="cl-muted"></p>
      </section>
      <section class="cl-pane">
        <h3><span class="cl-idx">03</span> 结构弛豫</h3>
        <label class="cl-field">优化范围<select id="cl-relax-cell"><option value="fixed">原子位置 · 固定晶胞</option><option value="cell">原子位置 + 晶胞 · 零外压</option></select></label>
        <div class="cl-row">
          <label class="cl-field">力阈值 · eV/Å<input id="cl-fmax" type="number" min=".001" max=".5" step=".01" value=".03"></label>
          <label class="cl-field">最多步数<input id="cl-steps" type="number" min="1" max="500" value="100"></label>
        </div>
        <div class="cl-actions">
          <button id="cl-run" class="dshell-btn cl-wide" disabled>开始弛豫</button>
          <button id="cl-cancel" class="dshell-btnGhost" hidden>停止</button>
        </div>
        <button id="cl-detach" class="dshell-btnGhost cl-wide" style="margin-top:6px" hidden>放弃本地任务跟踪</button>
        <progress id="cl-progress" max="100" value="0" hidden></progress>
        <p id="cl-engine-label" class="cl-muted">正在连接本地计算引擎…</p>
        <p id="cl-compatibility" class="cl-warn" hidden></p>
        <details><summary>计算引擎与适用范围</summary>
          <p>MACE-MPA-0 通用机器学习原子势 · 0 K 局部能量最小化。模型覆盖元素 ≠ 已验证任意合金；科研结论需针对体系验证。</p>
          <label class="cl-field">本地引擎地址<input id="cl-endpoint" value="http://127.0.0.1:8765" spellcheck="false"></label>
          <button id="cl-connect" class="dshell-btnGhost">重新连接</button>
          <p><a href="crystal-engine/README.md" target="_blank" rel="noopener">本地引擎安装说明</a> · <a href="https://github.com/ACEsuit/mace-foundations" target="_blank" rel="noopener">模型来源与许可证</a></p>
          <p>本引擎计算能量、力、应力与结构，不生成电子密度；真实电子场可经 Quantum Data 入口导入。</p>
        </details>
      </section>
    </aside>
    <main class="cl-stagewrap">
      <div class="cl-viewportwrap">
        <div id="cl-viewport" class="cl-viewport"></div>
        <div class="cl-headline">
          <div class="cl-left"><div id="cl-formula" class="cl-formula"></div><div id="cl-structure-label" class="cl-meta"></div></div>
          <div class="cl-hint">拖动旋转 · 点击选原子<span id="cl-boundary">周期边界 · 坐标单位 Å</span></div>
        </div>
        <div class="cl-tools">
          <div class="cl-legendbox"><div id="cl-legend" class="cl-legend"></div><div class="cl-caption">连线为几何近邻，不代表键级</div></div>
          <button id="cl-fit" class="dshell-btnGhost cl-fit">居中</button>
        </div>
      </div>
      <div class="cl-bench">
        <div class="cl-inspect">
          <label for="cl-atom">选中原子</label>
          <select id="cl-atom"></select>
          <span id="cl-atom-label" class="cl-mono"></span>
          <span id="cl-neighbor" class="cl-neighbor"></span>
        </div>
        <div class="cl-results">
          <h4>结构比较<span id="cl-result-label">等待计算</span></h4>
          <div id="cl-empty" class="cl-empty">运行弛豫后比较位移与近邻间距；参照为同成分未弛豫结构。
            <div class="cl-actions cl-quick"><button id="cl-quick-run" class="dshell-btn" disabled>计算当前结构</button></div>
          </div>
          <div id="cl-result" hidden>
            <div class="cl-metrics">
              <div class="cl-metric"><small>弛豫能量变化 · eV/atom</small><b id="cl-energy">—</b></div>
              <div class="cl-metric"><small>内部位移 RMS · Å</small><b id="cl-rms">—</b></div>
              <div class="cl-metric"><small>最大原子力 · eV/Å</small><b id="cl-force">—</b></div>
              <div class="cl-metric"><small>晶胞体积变化 · %</small><b id="cl-volume">—</b></div>
            </div>
            <div class="cl-ctl">
              <label class="cl-field">初始 → 弛豫后 <span id="cl-t-label">100%</span><input id="cl-t" type="range" min="0" max="1" step=".01" value="1"></label>
              <label class="cl-field">位移显示倍率<select id="cl-amp"><option value="1">1× · 真实比例</option><option value="5">5×</option><option value="10">10×</option><option value="25">25×</option></select></label>
              <label class="cl-field">着色<select id="cl-color"><option value="element">元素</option><option value="displacement">内部位移</option></select></label>
            </div>
            <div class="cl-ctl">
              <label class="cl-check"><input id="cl-ghosts" type="checkbox" checked>初始轮廓</label>
              <label class="cl-check"><input id="cl-arrows" type="checkbox" checked>位移箭头</label>
              <button id="cl-adopt" class="dshell-btnGhost">将结果作为新起点</button>
            </div>
            <p class="cl-note">插值仅供结构比较，不代表动力学；倍率只影响显示，数值为真实尺度；能量差为弛豫能，非缺陷形成能。</p>
            <details><summary>模型、应力与可复现记录</summary><p id="cl-provenance" class="cl-mono"></p></details>
          </div>
        </div>
        <div id="cl-status" class="cl-status" role="status" aria-live="polite"><span class="dot"></span><span>准备搭建晶体</span></div>
      </div>
    </main>
  </div>`;
;
  document.body.appendChild(lab);
  const $=id=>lab.querySelector(`#cl-${id}`), val=id=>$(id).value, num=id=>Number(val(id));
  const counting=document.createElement('div');counting.id='cl-counting';counting.className='cl-caption';$('legend').after(counting);
  const state={structure:null,source:'B2 · 3 × 3 × 3',selected:null,result:null,job:null,health:null,endpoint:'http://127.0.0.1:8765',history:[],engineBusy:false};
  let visual=null, healthTimer=null, pollTimer=null, importBusy=false;
  const status=(message,tone='')=>{$('status').textContent=message;$('status').dataset.tone=tone;};
  const safely=fn=>async()=>{try{await fn();}catch(e){status(e.message||'操作失败','error');}};
  for(const id of ['el-a','el-b','el-c','dopant']) for(const symbol of CrystalCore.symbols){const o=document.createElement('option');o.value=symbol;o.textContent=symbol;$(id).appendChild(o);}
  $('el-a').value='Ni';$('el-b').value='Al';$('el-c').value='O';$('dopant').value='Co';
  for(const [kind,p] of Object.entries(CrystalCore.prototypes)){
    const option=document.createElement('option');option.value=kind;option.textContent=p.label;$('kind').append(option);
    const presets=CrystalTemplates.filter(t=>t.kind===kind);if(!presets.length)continue;
    const group=document.createElement('optgroup');group.label=p.label;
    for(const t of presets){const o=document.createElement('option');o.value=t.id;o.textContent=t.name;group.append(o);}$('template').append(group);
  }
  let loadedTemplate=null;
  function templateNote(){
    const t=CrystalTemplates.find(t=>t.id===val('template'));
    $('template-note').textContent=t?`${t.name} · ${CrystalCore.prototypes[t.kind].label}：载入重建 1×1×1 单晶胞，清除当前编辑；参数为近似起始值。`:`${CrystalTemplates.length} 个模板 · ${new Set(CrystalTemplates.map(x=>x.kind)).size} 类晶型`;
    $('load-template').disabled=!!state.job||importBusy||!t;
  }
  function kindFields(){
    const p=CrystalCore.prototypes[val('kind')];
    const roles=p.ratio?p.ratio.length:1;
    $('b-field').hidden=roles<2;$('c-field').hidden=roles<3;
    $('ratio-field').hidden=p.system==='cubic';$('u-field').hidden=p.u===undefined;
    $('u-label').textContent=val('kind')==='MoS2'?'B 位分数坐标 z（4f）':val('kind')==='rutile'?'B 位内部坐标 u（4f）':'B 位相对高度 u';
    const note=$('prototype-note');note.replaceChildren();
    if(p.reference){if(p.ratio)note.append(`${p.ratio.join(' : ')} 位点配比 · `);const a=document.createElement('a');a.href=`https://aflow.org/p/${p.reference}/`;a.target='_blank';a.rel='noopener';a.textContent='晶型来源';note.append(a);}
  }
  templateNote();kindFields();
  const fmt=(x,n=4)=>Number.isFinite(x)?x.toFixed(n):'—';
  function busyControls(){
    const locked=!!state.job||importBusy;
    for(const id of ['build','regenerate','substitute','vacancy','random','import','adopt','endpoint','file'])$(id).disabled=locked;
    $('load-template').disabled=locked||!val('template');
    const unsupportedElements=state.health?.status==='ready'?[...new Set(state.structure?.atoms.filter(a=>!state.health.supportedElements.includes(a.element)).map(a=>a.element)||[])]:[];
    const unsupported=unsupportedElements.length>0;
    $('run').disabled=locked||state.health?.status!=='ready'||unsupported;
    $('quick-run').disabled=$('run').disabled;
    $('run').title=unsupported?'模型不支持当前结构中的部分元素':'';
    $('compatibility').hidden=!unsupported;$('compatibility').textContent=unsupported?`当前模型不支持 ${unsupportedElements.join('、')}。结构仍可编辑和导出。`:'';
    $('cancel').hidden=!state.job;$('progress').hidden=!state.job;
    if(!state.job)$('detach').hidden=true;
    $('engine-dot').textContent=state.health?.status==='ready'?'已连接':state.health?.status==='loading'?'加载中':'离线';
    const chip=lab.querySelector('.cl-engine');if(chip)chip.setAttribute('data-ready',state.health?.status==='ready'?'yes':state.health?.status==='loading'?'load':'no');
  }
  function legend(){
    const box=$('legend');box.replaceChildren();
    if(state.result&&val('color')==='displacement'){
      box.textContent=`内部位移：0 Å（蓝） → ${fmt(CrystalCore.compare(state.result.initial,state.result.final).max)} Å（橙）`;return;
    }
    const counts=new Map();state.structure.atoms.forEach(a=>counts.set(a.element,(counts.get(a.element)||0)+1));
    for(const [symbol,count] of counts){const s=document.createElement('span'), dot=document.createElement('i');dot.style.background=`#${elementInfo(symbol).color.toString(16).padStart(6,'0')}`;s.append(dot,`${symbol} · ${count}`);box.append(s);}
  }
  function inspect(){
    const s=state.structure;if(!s)return;
    const index=s.atoms.findIndex(a=>a.id===state.selected);
    if(index<0){$('atom').value='';$('atom-label').textContent='';$('neighbor').textContent='';visual?.select(null);return;}
    const a=s.atoms[index];
    $('atom').value=a.id;
    $('atom-label').textContent=`${state.result?'弛豫后 · ':''}${a.site==='all'?'位点':a.site+' 位'} · (${a.position.map(x=>fmt(x,3)).join(', ')}) Å`;
    const ns=CrystalCore.neighbors(s,index,Math.min(10,Math.max(...s.cell.map(v=>Math.hypot(...v)))));
    const closest=ns[0];
    let message=closest?`最近邻 ${closest.element} · ${fmt(closest.distance)} Å · 周期镜像已计入`:'10 Å 范围内未找到近邻';
    if(state.result){
      const c=CrystalCore.compare(state.result.initial,state.result.final);
      if(closest){
        const b=state.result.initial,other=b.atoms[closest.index];
        const delta=other.position.map((x,j)=>x-b.atoms[index].position[j]);
        const before=Math.hypot(...(closest.index===index?CrystalCore.cartesian(closest.image,b.cell):CrystalCore.minimumImage(delta,b.cell,b.pbc)));
        message=`同一近邻 ${closest.element}：${fmt(before)} → ${fmt(closest.distance)} Å · Δ ${fmt(closest.distance-before)} Å`;
      }
      message+=` · 内部位移 ${fmt(c.magnitudes[index])} Å`;
    }
    $('neighbor').textContent=message;visual?.select(a.id);
  }
  function refresh(){
    const s=state.structure;if(!s)return;
    if(state.selected!==null&&!s.atoms.some(a=>a.id===state.selected))state.selected=s.atoms[0].id;
    const counts=new Map();s.atoms.forEach(a=>counts.set(a.element,(counts.get(a.element)||0)+1));
    $('formula').textContent=[...counts].map(([el,n])=>`${el}${String(n).replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[Number(d)])}`).join(' ');
    $('structure-label').textContent=`来源：${state.source} · ${s.atoms.length} 原子 · ${fmt(CrystalCore.volume(s.cell),2)} Å³`;
    $('structure-label').title=$('structure-label').textContent;
    const copies=CrystalCore.boundaryImages(state.result?.initial||s,0.25); // display slop: relaxed atoms near a face still get closed-cell mirrors
    const terms=[.125,.25,.5,1].map(weight=>{
      const count=copies.filter(copy=>copy.weight===weight).length;
      return count?`${count} × ${weight===1?'1':`1/${1/weight}`}`:null;
    }).filter(Boolean);
    counting.textContent=`${state.result?'初始晶胞镜像':'晶胞显示'} ${copies.length} 个球 · 折算 ${terms.join(' + ')} = ${s.atoms.length} 原子`;
    counting.title='周期边界补全仅用于显示：角/棱/面/内部按 1/8、1/4、1/2、1 折算；计算与导出只用独立原子。';
    const axes=['a','b','c'].filter((_,i)=>s.pbc[i]);$('boundary').textContent=`${axes.length?`${axes.join('/')} 周期`:'非周期结构'} · 坐标单位 Å`;
    $('relax-cell').querySelector('option[value="cell"]').disabled=axes.length!==3;
    if(axes.length!==3)$('relax-cell').value='fixed';
    $('atom').replaceChildren(...[['', '未选中原子'], ...s.atoms.map((a,i)=>[a.id, `${i+1} · ${a.element} · ${a.site}`])].map(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;return o;}));$('atom').value=state.selected||'';
    const sites=[...new Set(s.atoms.map(a=>a.site))].filter(x=>x!=='all'); const previous=val('site');
    $('site').replaceChildren(...[...sites,'all'].map(x=>{const o=document.createElement('option');o.value=x;o.textContent=x==='all'?'全部位点':`${x} 位`;return o;}));
    $('site').value=previous==='all'||sites.includes(previous)?previous:(sites[0]||'all');
    const dopant=val('dopant'),total=s.atoms.filter(a=>a.element===dopant).length;
    const eligible=s.atoms.filter(a=>val('site')==='all'||a.site===val('site'));
    const onSite=eligible.filter(a=>a.element===dopant).length;
    $('composition').textContent=`${dopant} 总原子分数 ${fmt(total/s.atoms.length*100,2)}%（${total}/${s.atoms.length}）；当前位点 ${fmt(eligible.length?onSite/eligible.length*100:0,2)}%（${onSite}/${eligible.length}）。`;
    $('empty').hidden=!!state.result;$('result').hidden=!state.result;
    $('result-label').textContent=state.result?(state.result.converged?'已收敛 · 0 K':'未收敛 · 可继续优化'):'等待计算';
    if(state.result)visual?.showComparison(state.result.initial,state.result.final);else visual?.setStructure(s);
    legend();inspect();busyControls();
  }
  function edited(s,action){
    CrystalCore.validate(s);state.structure=s;state.result=null;state.history.push({action,at:new Date().toISOString()});
    $('t').value='1';$('amp').value='1';$('color').value='element';visual?.setOptions({t:1,amplification:1,color:'element'});refresh();
  }
  function build(){
    if(state.job||importBusy)throw Error('请等待当前任务结束后再生成结构');
    const repeats=['nx','ny','nz'].map(num);
    const roles=CrystalCore.prototypes[val('kind')].ratio?CrystalCore.prototypes[val('kind')].ratio.length:1;
    const settings={kind:val('kind'),a:num('a'),cOverA:num('ratio'),u:num('u'),repeats,elementA:val('el-a'),elementB:val('el-b'),elementC:roles>=3?val('el-c'):undefined};
    const s=CrystalCore.build(settings);
    state.source=`${loadedTemplate?loadedTemplate.name+' · ':''}${val('kind')} · ${repeats.join(' × ')}`;state.history=[];
    state.selected=s.atoms[0].id;edited(s,`build ${JSON.stringify(settings)}; template=${loadedTemplate?.id||'custom'}; parameters=starting guess`);
    visual?.fit();status('晶体已生成：点击原子选位点，或按位点随机替换。','success');
  }
  function endpoint(){const u=new URL(val('endpoint'));if(u.protocol!=='http:'||!['localhost','127.0.0.1','[::1]'].includes(u.hostname)||u.username||u.password||u.pathname!=='/'||u.search||u.hash)throw Error('引擎地址必须是本机 HTTP 地址，例如 http://127.0.0.1:8765');return u.origin;}
  async function api(path,options={},base=state.endpoint){
    let response;try{response=await fetch(base+path,{...options,headers:options.body?{'Content-Type':'application/json'}:undefined,signal:AbortSignal.timeout(15000)});}catch{throw Error('无法连接本地计算引擎；请检查引擎是否启动及地址是否正确。');}
    let data;try{data=await response.json();}catch{throw Error('引擎返回了无法识别的数据');}
    if(!response.ok){const error=Error(data.error||`计算引擎错误 (${response.status})`);error.httpStatus=response.status;throw error;}return data;
  }
  async function connect(){
    if(state.engineBusy)return;state.engineBusy=true;
    try{
      if(!state.job)state.endpoint=endpoint();
      const health=await api('/v1/health');state.health=health;
      $('engine-label').textContent=health.status==='ready'?`${health.model.name} · ${health.model.device} · ${health.supportedElements.length} 种元素`:health.message||'正在加载模型…';
    }catch(e){state.health=null;$('engine-label').textContent=e.message;}finally{state.engineBusy=false;busyControls();}
  }
  function showResult(r){
    CrystalCore.validateResult(r);
    const c=CrystalCore.compare(r.initial,r.final);state.result=r;state.structure=CrystalCore.clone(r.final);
    $('energy').textContent=fmt((r.energyFinal-r.energyInitial)/r.final.atoms.length,5);$('rms').textContent=fmt(c.rms);$('force').textContent=fmt(r.maxForce);$('volume').textContent=fmt(c.volumeChange,3);
    $('provenance').textContent=`${r.model.name} · ${r.model.version} · ${r.model.device} · ${r.model.dtype} | 参数 SHA256 ${r.model.sha256}\n${r.steps} 步 · ${fmt(r.elapsedSeconds,1)} s | 应力 (xx yy zz yz xz xy) GPa: ${r.stressGPa.map(x=>fmt(x,3)).join(' ')} | E初=${fmt(r.energyInitial,6)} eV，E终=${fmt(r.energyFinal,6)} eV。完整设置、模型标识和计算帧保存在导出项目中。`;
    $('t').value='1';$('t-label').textContent='100%';$('amp').value='1';visual?.setOptions({t:1,amplification:1});refresh();visual?.fit();
  }
  async function poll(){
    if(!state.job)return;const id=state.job;let deliveringResult=false;
    try{
      const j=await api(`/v1/jobs/${encodeURIComponent(id)}`);if(state.job!==id)return;
      $('detach').hidden=true;
      $('progress').value=j.step||0;
      if(j.status==='completed'){
        deliveringResult=true;state.job=null;showResult(j.result);status(j.result.converged?`弛豫完成，${j.result.steps} 步达到收敛标准。`:'已达到步数上限，尚未收敛；请勿将其作为收敛结果。',j.result.converged?'success':'');
      }else if(j.status==='cancelled'||j.status==='error'){
        state.job=null;status(j.message||(j.status==='cancelled'?'计算已停止；保留运行前的结构。':'计算失败'),'error');
      }else status(`计算中 · 第 ${j.step||0} 步 · 最大原子力 ${fmt(j.maxForce)} eV/Å · ${fmt(j.elapsedSeconds,0)} s`);
    }catch(e){
      if(state.job!==id&&!deliveringResult)return;
      if(e.httpStatus===404){state.job=null;status('任务已不存在（引擎可能重启）；原结构已保留。','error');}
      else{if(state.job)$('detach').hidden=false;status(`${e.message}${state.job?' 正在恢复连接；可停止跟踪以恢复编辑。':''}`,'error');}
    }
    busyControls();if(state.job)pollTimer=setTimeout(poll,1500);
  }
  async function run(){
    if(state.job)return;CrystalCore.validate(state.structure);
    const settings={fmax:num('fmax'),maxSteps:num('steps'),relaxCell:val('relax-cell')==='cell',pressureGPa:0};
    if(!Number.isFinite(settings.fmax)||settings.fmax<.001||settings.fmax>.5||!Number.isInteger(settings.maxSteps)||settings.maxSteps<1||settings.maxSteps>500)throw Error('力阈值范围为 0.001–0.5 eV/Å，最多步数为 1–500');
    state.job='submitting';busyControls();status('正在提交结构…');
    try{const j=await api('/v1/relax',{method:'POST',body:JSON.stringify({structure:state.structure,settings})});if(typeof j.id!=='string')throw Error('任务编号无效');state.job=j.id;$('progress').max=settings.maxSteps;$('progress').value=0;poll();}
    catch(e){state.job=null;busyControls();throw e;}
  }
  function download(name,text,type){
    const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.hidden=true;
    // Keep the link in the active workspace so the browser can save from this view.
    lab.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);status(`已请求保存 ${name}`,'success');
  }
  async function importFile(){
    const file=$('file').files[0];$('file').value='';if(!file)return;
    const ext=file.name.split('.').pop().toLowerCase(),limit=ext==='json'?64:2;
    if(file.size>limit*1024*1024)throw Error(`此文件须小于 ${limit} MiB`);
    importBusy=true;busyControls();status('正在解析结构…');
    try{
      const text=await file.text();let s,project=null;
      if(ext==='json'){
        project=JSON.parse(text);if(project.schemaVersion!==1)throw Error('不支持此项目版本；需要 Crystal Lab schemaVersion 1');s=project.structure;
        if(project.result){
          CrystalCore.validateResult(project.result);
          CrystalCore.validate(s);
          const shape=v=>[v.cell,v.pbc,v.atoms.map(a=>[a.id,a.element,a.site,a.position])];
          if(JSON.stringify(shape(s))!==JSON.stringify(shape(project.result.final)))throw Error('项目当前结构与计算结果不一致');
        }
        if(project.history&&(!Array.isArray(project.history)||project.history.length>10000||project.history.some(h=>typeof h.action!=='string'||h.action.length>4000||typeof h.at!=='string')))throw Error('项目历史记录无效');
      }
      else{const format=ext==='cif'?'cif':['vasp','poscar'].includes(ext)||file.name.toUpperCase()==='POSCAR'?'vasp':'extxyz';s=(await api('/v1/import',{method:'POST',body:JSON.stringify({format,text})})).structure;}
      CrystalCore.validate(s);state.source=typeof project?.source==='string'?project.source.slice(0,200):`导入 · ${file.name}`;
      state.history=project?.history||[];state.selected=s.atoms[0].id;edited(s,`import ${file.name}`);
      if(project?.result)showResult(project.result);
      visual?.fit();status(project?.result?'项目已恢复（结构/结果/模型记录）。':'结构已导入：保留晶胞与周期边界，可继续编辑。','success');
    }finally{importBusy=false;busyControls();}
  }
  $('template').addEventListener('change',templateNote);
  $('load-template').addEventListener('click',safely(()=>{
    if(state.job||importBusy)throw Error('请等待当前任务结束后再载入模板');
    const t=CrystalTemplates.find(t=>t.id===val('template'));if(!t)return;
    $('kind').value=t.kind;kindFields();$('el-a').value=t.elementA;if(t.elementB)$('el-b').value=t.elementB;if(t.elementC)$('el-c').value=t.elementC;$('a').value=t.a;$('ratio').value=t.cOverA??Math.sqrt(8/3);$('u').value=t.u??.375;
    for(const id of ['nx','ny','nz'])$(id).value='1';loadedTemplate=t;kindFields();build();
    status(`${t.name} 已载入：近似起始值，可扩胞/掺杂/弛豫。`,'success');
  }));
  $('kind').addEventListener('change',()=>{loadedTemplate=null;$('u').value=CrystalCore.prototypes[val('kind')].u??.375;kindFields();});
  for(const id of ['el-a','el-b','el-c','a','ratio','u'])$(id).addEventListener('input',()=>{loadedTemplate=null;});
  $('build').addEventListener('click',safely(build));
  $('regenerate').addEventListener('click',safely(()=>{build();status('已恢复初始猜测结构；掺杂/空位/弛豫结果已清除。','success');}));
  $('substitute').addEventListener('click',safely(()=>{if(!state.selected)throw Error('请先点击选中一个原子');edited(CrystalCore.substitute(state.structure,[state.selected],val('dopant')),`replace ${state.selected} with ${val('dopant')}`);status('已替换选中原子；重新弛豫查看结构响应。','success');}));
  $('vacancy').addEventListener('click',safely(()=>{if(!state.selected)throw Error('请先点击选中一个原子');edited(CrystalCore.remove(state.structure,state.selected),`vacancy ${state.selected}`);status('已创建空位。','success');}));
  $('random').addEventListener('click',safely(()=>{const ids=CrystalCore.randomIds(state.structure,val('site'),num('count'),num('seed'),val('dopant'));edited(CrystalCore.substitute(state.structure,ids,val('dopant')),`replace ${ids.join(',')} with ${val('dopant')}; seed=${num('seed')}`);state.selected=ids[0];inspect();status(`已替换 ${ids.length} 个位点，随机种子 ${num('seed')}。`,'success');}));
  for(const id of ['dopant','site'])$(id).addEventListener('change',refresh);
  $('atom').addEventListener('change',()=>{state.selected=val('atom')||null;inspect();});
  $('run').addEventListener('click',safely(run));
  $('quick-run').addEventListener('click',safely(run));
  $('cancel').addEventListener('click',safely(async()=>{if(!state.job||state.job==='submitting')return;await api(`/v1/jobs/${encodeURIComponent(state.job)}`,{method:'DELETE',body:'{}'});status('已请求停止，等待当前计算步结束…');}));
  $('detach').addEventListener('click',()=>{state.job=null;clearTimeout(pollTimer);busyControls();status('已恢复本地编辑（远端任务未取消）。');});
  $('connect').addEventListener('click',safely(connect));
  $('import').addEventListener('click',()=>$('file').click());$('file').addEventListener('change',safely(importFile));
  $('json').addEventListener('click',safely(()=>download('crystal-lab.json',JSON.stringify({schemaVersion:1,exportedAt:new Date().toISOString(),source:state.source,structure:state.structure,history:state.history,result:state.result},null,2),'application/json')));
  $('xyz').addEventListener('click',safely(()=>download('crystal.extxyz',CrystalCore.toXYZ(state.structure),'chemical/x-xyz')));
  $('fit').addEventListener('click',()=>visual?.fit());
  function display(){visual?.setOptions({t:num('t'),amplification:num('amp'),color:val('color'),ghosts:$('ghosts').checked,arrows:$('arrows').checked});$('t-label').textContent=`${Math.round(num('t')*100)}%`;legend();}
  for(const id of ['t','amp','color','ghosts','arrows'])$(id).addEventListener('input',display);
  $('adopt').addEventListener('click',safely(()=>{edited(CrystalCore.clone(state.structure),'adopt relaxed structure');status('已将弛豫结果设为新起点（后续比较以此为准）。','success');}));
  function open(){
    lab.classList.add('open');lab.setAttribute('aria-hidden','false');
    if(!visual){visual=createCrystalRenderer($('viewport'),id=>{state.selected=state.selected===id?null:id;inspect();});if(!state.structure)build();else refresh();visual.fit();}
    visual.setOptions({active:true});visual.resize();connect();clearInterval(healthTimer);healthTimer=setInterval(()=>{if(lab.classList.contains('open'))connect();},12000);
  }
  function close(){
    lab.classList.remove('open');lab.setAttribute('aria-hidden','true');visual?.setOptions({active:false});clearInterval(healthTimer);entry.focus();
  }
  entry.addEventListener('click',safely(open));
  $('close').addEventListener('click',close);
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&lab.classList.contains('open')){event.preventDefault();close();}});
  return {isOpen:()=>lab.classList.contains('open')};
})();

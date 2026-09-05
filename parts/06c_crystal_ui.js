/* Crystal Lab owns its DOM, scientific state, requests and renderer. */
const CrystalLab = (() => {
  const style=document.createElement('style');
  style.textContent=`
  #crystalBtn{width:40px;height:40px;flex:0 0 40px;border-radius:50%;padding:0;display:grid;place-items:center;color:#9ddccf;cursor:pointer}
  #crystalBtn:hover{border-color:#9ddccf;box-shadow:0 0 18px #9ddccf22}
  #crystalLab{box-sizing:border-box;position:fixed;inset:0;z-index:70;display:none;padding:0;border:0;border-radius:0;background:#0b101a;color:#dce5f2;font:12px/1.55 -apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif;overflow:hidden;color-scheme:dark;user-select:text}
  #crystalLab.open{display:block}
  #crystalLab *{box-sizing:border-box}
  #crystalLab button,#crystalLab input,#crystalLab select{font:inherit;color:inherit}
  #crystalLab button{border:1px solid #a3b6d629;border-radius:7px;background:#182233;padding:7px 10px;cursor:pointer;line-height:1.4;letter-spacing:0}
  #crystalLab button:hover:not(:disabled){background:#26364b;border-color:#7cc7ff88}
  #crystalLab :focus-visible{outline:2px solid #7cc7ff;outline-offset:3px}
  #crystalLab button:disabled{opacity:.38;cursor:not-allowed}
  #crystalLab input:not([type=checkbox]):not([type=range]),#crystalLab select{width:100%;min-width:0;background:#080d16;border:1px solid #a3b6d633;border-radius:6px;padding:7px 8px;height:33px}
  #crystalLab input[type=checkbox]{accent-color:#7cc7ff;vertical-align:middle;margin:0 5px 0 0}
  #crystalLab input[type=range]{accent-color:#7cc7ff;width:100%;margin:6px 0}
  #crystalLab .cl-header{height:68px;padding:14px 22px;border-bottom:1px solid #a3b6d622;display:flex;align-items:center;gap:12px;background:linear-gradient(105deg,#14223077,transparent)}
  #crystalLab .cl-mark{width:34px;height:34px;display:grid;place-items:center;color:#9ddccf;border:1px solid #9ddccf44;border-radius:9px}
  #crystalLab h2{font-size:16px;font-weight:550;letter-spacing:.04em;margin:0}
  #crystalLab .cl-eyebrow{color:#8b96a8;font-size:10px;letter-spacing:.14em}
  #crystalLab .cl-header-right{margin-left:auto;display:flex;align-items:center;gap:12px}
  #crystalLab .cl-badge{color:#9ddccf;font-size:11px;border:1px solid #9ddccf33;border-radius:20px;padding:3px 9px;white-space:nowrap}
  #crystalLab .cl-layout{display:grid;grid-template-columns:284px minmax(0,1fr);height:calc(100% - 68px)}
  #crystalLab .cl-sidebar{overflow:auto;padding:0 18px 20px;border-right:1px solid #a3b6d622;scrollbar-width:thin;scrollbar-color:#4a627f #0b101a}
  #crystalLab section.cl-section{padding:18px 0;border-bottom:1px solid #a3b6d622}
  #crystalLab h3{font-size:12px;font-weight:550;letter-spacing:.035em;margin:0 0 12px;display:flex;align-items:center;gap:8px}
  #crystalLab h3 span{color:#667b98;font:10px ui-monospace,monospace}
  #crystalLab label.cl-field{display:flex;flex-direction:column;gap:4px;color:#8b96a8;font-size:11px;margin-bottom:9px}
  #crystalLab .cl-row{display:flex;gap:8px;align-items:end}
  #crystalLab .cl-row>*{flex:1;min-width:0}
  #crystalLab #cl-regenerate{flex:0 0 auto;height:33px;margin-bottom:9px;white-space:nowrap}
  #crystalLab .cl-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}
  #crystalLab .cl-actions>button{flex:1;white-space:nowrap}
  #crystalLab .cl-primary{background:#7cc7ff20;border-color:#7cc7ff66;color:#bce3ff}
  #crystalLab .cl-wide{width:100%}
  #crystalLab .cl-muted{color:#8b96a8;font-size:11px;margin:8px 0 0}
  #crystalLab .cl-content{display:flex;flex-direction:column;min-height:0;overflow:auto}
  #crystalLab .cl-view-wrap{position:relative;flex:1;min-height:250px;background:radial-gradient(ellipse at 50% 50%,#122038,#060a11)}
  #crystalLab .cl-viewport{position:absolute;inset:0;overflow:hidden}
  #crystalLab .cl-viewport canvas{display:block;width:100%;height:100%;touch-action:none;outline:none}
  #crystalLab .cl-view-head{position:absolute;top:17px;left:20px;right:20px;pointer-events:none;display:flex;justify-content:space-between;gap:12px}
  #crystalLab .cl-view-head>div:first-child{min-width:0;flex:1}
  #crystalLab .cl-formula{font-size:17px;letter-spacing:.03em;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #crystalLab #cl-structure-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  #crystalLab .cl-caption{color:#8b96a8;font-size:11px}
  #crystalLab .cl-view-tools{position:absolute;bottom:13px;left:18px;right:18px;display:flex;justify-content:space-between;align-items:end;gap:10px;pointer-events:none}
  #crystalLab .cl-view-tools button{pointer-events:auto;background:#111c2ad9}
  #crystalLab .cl-view-tools>div{min-width:0}
  #crystalLab #cl-counting{margin-top:5px;overflow-wrap:anywhere}
  #crystalLab .cl-legend{display:flex;flex-wrap:wrap;gap:10px;color:#a9b8ce;font-size:11px}
  #crystalLab .cl-legend i{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:5px}
  #crystalLab .cl-inspect{padding:12px 20px;border-top:1px solid #a3b6d622;background:#0e1520;min-height:71px}
  #crystalLab .cl-inspect-top{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
  #crystalLab #cl-atom{max-width:190px;height:29px;padding:3px 7px}
  #crystalLab .cl-mono{font:11px/1.7 ui-monospace,SFMono-Regular,monospace;font-variant-numeric:tabular-nums;color:#a9bdd9}
  #crystalLab .cl-results{padding:15px 20px;background:linear-gradient(120deg,#14223666,#0b101a);border-top:1px solid #a3b6d622}
  #crystalLab .cl-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:10px 0}
  #crystalLab .cl-metric b{display:block;font:18px/1.6 ui-monospace,monospace;font-variant-numeric:tabular-nums;color:#d7edff}
  #crystalLab .cl-metric small{font-size:10px;color:#8b96a8}
  #crystalLab .cl-status{padding:9px 12px;border-top:1px solid #a3b6d622;font-size:11px;color:#aec4dd;min-height:36px;overflow-wrap:anywhere;background:#080d15}
  #crystalLab .cl-status[data-tone=error]{color:#ffb5a9}
  #crystalLab .cl-status[data-tone=success]{color:#9ddccf}
  #crystalLab details{margin-top:10px;color:#8b96a8;font-size:11px}
  #crystalLab summary{cursor:pointer;color:#afc4dc}
  #crystalLab details p{margin:8px 0;overflow-wrap:anywhere}
  #crystalLab a{color:#8ccfff}
  #crystalLab progress{width:100%;height:3px;accent-color:#7cc7ff;display:block;margin-top:10px}
  #crystalLab [hidden]{display:none!important}
  @media(max-width:700px){
    #crystalBtn{width:36px;height:36px;flex-basis:36px}
    #crystalLab .cl-header{padding:11px 14px;height:62px}
    #crystalLab .cl-header-right .cl-badge{display:none}
    #crystalLab .cl-layout{display:flex;flex-direction:column;height:calc(100% - 62px);overflow:auto}
    #crystalLab .cl-content{order:0;flex:none;overflow:visible}
    #crystalLab .cl-view-wrap{height:360px;flex:none;min-height:0}
    #crystalLab .cl-sidebar{order:1;overflow:visible;border-right:0;padding:0 18px 24px}
    #crystalLab .cl-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}
    #crystalLab .cl-view-head{left:14px;right:14px}
    #crystalLab .cl-view-head .cl-caption:last-child{max-width:100px;text-align:right}
    #crystalLab .cl-inspect,#crystalLab .cl-results{padding:12px 14px}
  }`;
  document.head.appendChild(style);
  const icon='<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10"/><path d="m7.5 4.5 9 5v10M7.5 19.5v-10l9-5" opacity=".5"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/></svg>';
  const entry=document.createElement('button');entry.id='crystalBtn';entry.className='panel';entry.title='Crystal Lab · 晶体实验室';entry.setAttribute('aria-label','晶体实验室');entry.innerHTML=icon;
  document.getElementById('quantumBtn').after(entry);
  const lab=document.createElement('section');lab.id='crystalLab';lab.setAttribute('aria-labelledby','cl-title');lab.setAttribute('aria-hidden','true');
  lab.innerHTML=`
  <header class="cl-header"><div class="cl-mark">${icon}</div><div><h2 id="cl-title">晶体实验室</h2><div class="cl-eyebrow">周期结构 · 局部弛豫</div></div><div class="cl-header-right"><span class="cl-badge">全屏工作区</span><button id="cl-close" aria-label="退出晶体实验室">✕</button></div></header>
  <div class="cl-layout">
    <aside class="cl-sidebar">
      <section class="cl-section"><h3><span>01</span> 搭建晶格</h3>
        <label class="cl-field">晶体结构<select id="cl-kind"><option value="B2">B2 · 有序双子晶格</option><option value="BCC">BCC · 体心立方</option><option value="FCC">FCC · 面心立方</option><option value="HCP">HCP · 六方密排</option></select></label>
        <div class="cl-row"><label class="cl-field">A 位 / 主体元素<select id="cl-el-a" aria-label="A位主体元素"></select></label><label class="cl-field" id="cl-b-field">B 位元素<select id="cl-el-b" aria-label="B位元素"></select></label></div>
        <div class="cl-row"><label class="cl-field">晶格常数 a · Å<input id="cl-a" type="number" min="1" max="20" step=".01" value="2.88"></label><label class="cl-field" id="cl-ratio-field" hidden>c / a<input id="cl-ratio" type="number" step=".001" value="1.632993"></label><button id="cl-regenerate" title="按当前参数重新生成初始猜测结构，清除掺杂、空位和弛豫结果">生成</button></div>
        <div class="cl-row"><label class="cl-field">超胞 x<input id="cl-nx" type="number" value="3" min="1" max="8"></label><label class="cl-field">y<input id="cl-ny" type="number" value="3" min="1" max="8"></label><label class="cl-field">z<input id="cl-nz" type="number" value="3" min="1" max="8"></label></div>
        <button id="cl-build" class="cl-wide">生成晶体</button>
        <div class="cl-actions"><button id="cl-import">导入结构</button><button id="cl-json">导出项目</button><button id="cl-xyz">XYZ</button></div>
        <input id="cl-file" type="file" accept=".json,.cif,.vasp,.poscar,.xyz,.extxyz" hidden>
        <p class="cl-muted">晶格常数是初始猜测，可自由调整。支持最多 512 个原子。</p>
      </section>
      <section class="cl-section"><h3><span>02</span> 位点与掺杂</h3>
        <div class="cl-row"><label class="cl-field">替换元素<select id="cl-dopant" aria-label="掺杂元素"></select></label><label class="cl-field">子晶格<select id="cl-site"><option value="A">A 位</option><option value="B">B 位</option><option value="all">全部位点</option></select></label></div>
        <div class="cl-actions"><button id="cl-substitute">替换选中原子</button><button id="cl-vacancy">移除选中原子</button></div>
        <div class="cl-row" style="margin-top:10px"><label class="cl-field">随机替换数量<input id="cl-count" type="number" min="1" max="512" value="1"></label><label class="cl-field">随机种子<input id="cl-seed" type="number" step="1" value="42"></label></div>
        <button id="cl-random" class="cl-wide">按位点随机替换</button><p id="cl-composition" class="cl-muted"></p>
      </section>
      <section class="cl-section"><h3><span>03</span> 结构弛豫 <span id="cl-engine-dot">离线</span></h3>
        <label class="cl-field">优化范围<select id="cl-relax-cell"><option value="fixed">原子位置 · 固定晶胞</option><option value="cell">原子位置 + 晶胞 · 零外压</option></select></label>
        <div class="cl-row"><label class="cl-field">力阈值 · eV/Å<input id="cl-fmax" type="number" min=".001" max=".5" step=".01" value=".03"></label><label class="cl-field">最多步数<input id="cl-steps" type="number" min="1" max="500" value="100"></label></div>
        <div class="cl-actions"><button id="cl-run" class="cl-primary" disabled>开始弛豫</button><button id="cl-cancel" hidden>停止</button></div>
        <button id="cl-detach" class="cl-wide" style="margin-top:8px" hidden>放弃本地任务跟踪</button>
        <progress id="cl-progress" max="100" value="0" hidden></progress>
        <p id="cl-engine-label" class="cl-muted">正在连接本地计算引擎…</p>
        <p id="cl-compatibility" class="cl-muted" hidden></p>
        <details><summary>计算引擎与适用范围</summary><p>MACE-MPA-0 通用机器学习原子势，进行 0 K 局部能量最小化。模型覆盖元素不等于已验证任意合金；科研结论需针对体系验证。</p><label class="cl-field">本地引擎地址<input id="cl-endpoint" value="http://127.0.0.1:8765" spellcheck="false"></label><button id="cl-connect">重新连接</button><p><a href="crystal-engine/README.md" target="_blank" rel="noopener">本地引擎安装说明</a> · <a href="https://github.com/ACEsuit/mace-foundations" target="_blank" rel="noopener">模型来源与许可证</a></p><p>这里计算能量、力、应力和结构，不生成电子密度。真实电子场可由量子化学计算导出，再从原有 Quantum Data 入口导入。</p></details>
      </section>
    </aside>
    <main class="cl-content">
      <div class="cl-view-wrap"><div id="cl-viewport" class="cl-viewport"></div><div class="cl-view-head"><div><div id="cl-formula" class="cl-formula"></div><div id="cl-structure-label" class="cl-caption"></div></div><div class="cl-caption">拖动旋转 · 点击选原子<br><span id="cl-boundary">周期边界 · 坐标单位 Å</span></div></div><div class="cl-view-tools"><div><div id="cl-legend" class="cl-legend"></div><div class="cl-caption" style="margin-top:5px">连线表示几何近邻，不表示键级</div></div><button id="cl-fit" aria-label="晶体视图居中">居中</button></div></div>
      <div class="cl-inspect"><div class="cl-inspect-top"><label for="cl-atom">选中原子</label><select id="cl-atom"></select><span id="cl-atom-label" class="cl-mono"></span></div><div id="cl-neighbor" class="cl-caption" style="margin-top:6px"></div></div>
      <div class="cl-results"><h3 style="margin-bottom:6px">结构比较 <span id="cl-result-label">等待计算</span></h3>
        <div id="cl-empty" class="cl-muted">编辑结构后开始弛豫，查看掺杂周围的位移与近邻间距变化。结果以相同成分的未弛豫结构为参照。<div class="cl-actions"><button id="cl-quick-run" class="cl-primary" disabled>计算当前结构</button><span style="align-self:center">可在参数面板调整计算设置</span></div></div>
        <div id="cl-result" hidden><div class="cl-metrics"><div class="cl-metric"><small>弛豫能量变化 · eV/atom</small><b id="cl-energy">—</b></div><div class="cl-metric"><small>内部位移 RMS · Å</small><b id="cl-rms">—</b></div><div class="cl-metric"><small>最大原子力 · eV/Å</small><b id="cl-force">—</b></div><div class="cl-metric"><small>晶胞体积变化 · %</small><b id="cl-volume">—</b></div></div>
        <div class="cl-row"><label class="cl-field" style="flex:2">初始 → 弛豫后 <span id="cl-t-label">100%</span><input id="cl-t" type="range" min="0" max="1" step=".01" value="1"></label><label class="cl-field">位移显示倍率<select id="cl-amp"><option value="1">1× · 真实比例</option><option value="5">5×</option><option value="10">10×</option><option value="25">25×</option></select></label><label class="cl-field">着色<select id="cl-color"><option value="element">元素</option><option value="displacement">内部位移</option></select></label></div>
        <div class="cl-actions" style="align-items:center;gap:16px"><label><input id="cl-ghosts" type="checkbox" checked>初始轮廓</label><label><input id="cl-arrows" type="checkbox" checked>位移箭头</label><button id="cl-adopt">将结果作为新起点</button></div>
        <p class="cl-muted">插值仅用于结构比较，不代表动力学时间。倍率只影响画面；所有数值均为真实尺度。能量差是弛豫能，不是缺陷形成能。</p>
        <details><summary>模型、应力与可复现记录</summary><p id="cl-provenance" class="cl-mono"></p></details></div>
      </div><div id="cl-status" class="cl-status" role="status" aria-live="polite">准备搭建晶体</div>
    </main>
  </div>`;
  document.body.appendChild(lab);
  const $=id=>lab.querySelector(`#cl-${id}`), val=id=>$(id).value, num=id=>Number(val(id));
  const counting=document.createElement('div');counting.id='cl-counting';counting.className='cl-caption';$('legend').after(counting);
  const state={structure:null,source:'B2 · 3 × 3 × 3',selected:null,result:null,job:null,health:null,endpoint:'http://127.0.0.1:8765',history:[],engineBusy:false};
  let visual=null, healthTimer=null, pollTimer=null, importBusy=false;
  const status=(message,tone='')=>{$('status').textContent=message;$('status').dataset.tone=tone;};
  const safely=fn=>async()=>{try{await fn();}catch(e){status(e.message||'操作失败','error');}};
  for(const id of ['el-a','el-b','dopant']) for(const symbol of CrystalCore.symbols){const o=document.createElement('option');o.value=symbol;o.textContent=symbol;$(id).appendChild(o);}
  $('el-a').value='Ni';$('el-b').value='Al';$('dopant').value='Co';
  const fmt=(x,n=4)=>Number.isFinite(x)?x.toFixed(n):'—';
  function busyControls(){
    const locked=!!state.job||importBusy;
    for(const id of ['build','regenerate','substitute','vacancy','random','import','adopt','endpoint','file'])$(id).disabled=locked;
    const unsupportedElements=state.health?.status==='ready'?[...new Set(state.structure?.atoms.filter(a=>!state.health.supportedElements.includes(a.element)).map(a=>a.element)||[])]:[];
    const unsupported=unsupportedElements.length>0;
    $('run').disabled=locked||state.health?.status!=='ready'||unsupported;
    $('quick-run').disabled=$('run').disabled;
    $('run').title=unsupported?'模型不支持当前结构中的部分元素':'';
    $('compatibility').hidden=!unsupported;$('compatibility').textContent=unsupported?`当前模型不支持 ${unsupportedElements.join('、')}。结构仍可编辑和导出。`:'';
    $('cancel').hidden=!state.job;$('progress').hidden=!state.job;
    if(!state.job)$('detach').hidden=true;
    $('engine-dot').textContent=state.health?.status==='ready'?'已连接':state.health?.status==='loading'?'加载中':'离线';
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
    const s=state.structure,index=s.atoms.findIndex(a=>a.id===state.selected),a=s.atoms[index];if(!a)return;
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
    if(!s.atoms.some(a=>a.id===state.selected))state.selected=s.atoms[0].id;
    const counts=new Map();s.atoms.forEach(a=>counts.set(a.element,(counts.get(a.element)||0)+1));
    $('formula').textContent=[...counts].map(([el,n])=>`${el}${String(n).replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[Number(d)])}`).join(' ');
    $('structure-label').textContent=`来源：${state.source} · ${s.atoms.length} 原子 · ${fmt(CrystalCore.volume(s.cell),2)} Å³`;
    $('structure-label').title=$('structure-label').textContent;
    const copies=CrystalCore.boundaryImages(state.result?.initial||s);
    const terms=[.125,.25,.5,1].map(weight=>{
      const count=copies.filter(copy=>copy.weight===weight).length;
      return count?`${count} × ${weight===1?'1':`1/${1/weight}`}`:null;
    }).filter(Boolean);
    counting.textContent=`${state.result?'初始晶胞镜像':'晶胞显示'} ${copies.length} 个球 · 折算 ${terms.join(' + ')} = ${s.atoms.length} 原子`;
    counting.title='仅周期边界补全镜像：角上 1/8、棱上 1/4、面上 1/2、内部 1。非周期方向不分摊；比较时保持初始镜像配对，计算和导出只使用独立原子。';
    const axes=['a','b','c'].filter((_,i)=>s.pbc[i]);$('boundary').textContent=`${axes.length?`${axes.join('/')} 周期`:'非周期结构'} · 坐标单位 Å`;
    $('relax-cell').querySelector('option[value="cell"]').disabled=axes.length!==3;
    if(axes.length!==3)$('relax-cell').value='fixed';
    $('atom').replaceChildren(...s.atoms.map((a,i)=>{const o=document.createElement('option');o.value=a.id;o.textContent=`${i+1} · ${a.element} · ${a.site}`;return o;}));
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
    const repeats=['nx','ny','nz'].map(num);
    const s=CrystalCore.build({kind:val('kind'),a:num('a'),cOverA:num('ratio'),repeats,elementA:val('el-a'),elementB:val('el-b')});
    state.source=`${val('kind')} · ${repeats.join(' × ')}`;state.history=[];edited(s,`build ${state.source}, a=${num('a')} Å`);visual?.fit();status('晶体已生成。点击原子选择位点，或按子晶格随机替换。','success');
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
      if(e.httpStatus===404){state.job=null;status('计算任务已不存在（引擎可能已重启）。原结构已保留，可以重新计算。','error');}
      else{if(state.job)$('detach').hidden=false;status(`${e.message}${state.job?' 正在尝试恢复任务连接；可放弃本地跟踪以恢复编辑。':''}`,'error');}
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
      state.history=project?.history||[];edited(s,`import ${file.name}`);
      if(project?.result)showResult(project.result);
      visual?.fit();status(project?.result?'项目已恢复，包含结构、计算结果和模型记录。':'结构已导入；保留晶胞与周期边界，可继续编辑和弛豫。','success');
    }finally{importBusy=false;busyControls();}
  }
  $('kind').addEventListener('change',()=>{$('b-field').hidden=val('kind')!=='B2';$('ratio-field').hidden=val('kind')!=='HCP';});
  $('build').addEventListener('click',safely(build));
  $('regenerate').addEventListener('click',safely(()=>{build();status('已按当前参数恢复初始猜测结构，掺杂、空位和弛豫结果已清除。','success');}));
  $('substitute').addEventListener('click',safely(()=>{edited(CrystalCore.substitute(state.structure,[state.selected],val('dopant')),`replace ${state.selected} with ${val('dopant')}`);status('已替换选中原子。请重新弛豫以计算结构响应。','success');}));
  $('vacancy').addEventListener('click',safely(()=>{edited(CrystalCore.remove(state.structure,state.selected),`vacancy ${state.selected}`);status('已创建空位。','success');}));
  $('random').addEventListener('click',safely(()=>{const ids=CrystalCore.randomIds(state.structure,val('site'),num('count'),num('seed'),val('dopant'));edited(CrystalCore.substitute(state.structure,ids,val('dopant')),`replace ${ids.join(',')} with ${val('dopant')}; seed=${num('seed')}`);state.selected=ids[0];inspect();status(`已替换 ${ids.length} 个位点，随机种子 ${num('seed')}。`,'success');}));
  for(const id of ['dopant','site'])$(id).addEventListener('change',refresh);
  $('atom').addEventListener('change',()=>{state.selected=val('atom');inspect();});
  $('run').addEventListener('click',safely(run));
  $('quick-run').addEventListener('click',safely(run));
  $('cancel').addEventListener('click',safely(async()=>{if(!state.job||state.job==='submitting')return;await api(`/v1/jobs/${encodeURIComponent(state.job)}`,{method:'DELETE',body:'{}'});status('已请求停止，等待当前计算步结束…');}));
  $('detach').addEventListener('click',()=>{state.job=null;clearTimeout(pollTimer);busyControls();status('已恢复本地编辑。引擎上的计算可能仍在运行；这一步没有取消远端任务。');});
  $('connect').addEventListener('click',safely(connect));
  $('import').addEventListener('click',()=>$('file').click());$('file').addEventListener('change',safely(importFile));
  $('json').addEventListener('click',safely(()=>download('crystal-lab.json',JSON.stringify({schemaVersion:1,exportedAt:new Date().toISOString(),source:state.source,structure:state.structure,history:state.history,result:state.result},null,2),'application/json')));
  $('xyz').addEventListener('click',safely(()=>download('crystal.extxyz',CrystalCore.toXYZ(state.structure),'chemical/x-xyz')));
  $('fit').addEventListener('click',()=>visual?.fit());
  function display(){visual?.setOptions({t:num('t'),amplification:num('amp'),color:val('color'),ghosts:$('ghosts').checked,arrows:$('arrows').checked});$('t-label').textContent=`${Math.round(num('t')*100)}%`;legend();}
  for(const id of ['t','amp','color','ghosts','arrows'])$(id).addEventListener('input',display);
  $('adopt').addEventListener('click',safely(()=>{edited(CrystalCore.clone(state.structure),'adopt relaxed structure');status('已将弛豫后的结构设为新起点。下一次比较将以此结构为参照。','success');}));
  function open(){
    lab.classList.add('open');lab.setAttribute('aria-hidden','false');
    if(!visual){visual=createCrystalRenderer($('viewport'),id=>{state.selected=id;inspect();});if(!state.structure)build();else refresh();visual.fit();}
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

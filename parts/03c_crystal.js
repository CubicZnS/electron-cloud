/* Crystal Lab geometry. Row-vector cells; angstrom coordinates throughout. */
const CrystalCore = (() => {
  const symbols = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ');
  const sub=(a,b)=>a.map((x,i)=>x-b[i]), dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const norm=a=>Math.hypot(...a), clone=s=>JSON.parse(JSON.stringify(s));
  const volume=cell=>dot(cell[0],cross(cell[1],cell[2]));
  function reciprocal(cell){ const d=volume(cell); if(!Number.isFinite(d)||Math.abs(d)<1e-8) throw Error('晶胞矩阵退化'); return [cross(cell[1],cell[2]),cross(cell[2],cell[0]),cross(cell[0],cell[1])].map(v=>v.map(x=>x/d)); }
  const fractional=(p,cell)=>reciprocal(cell).map(v=>dot(p,v));
  const cartesian=(f,cell)=>[0,1,2].map(i=>f.reduce((s,x,j)=>s+x*cell[j][i],0));
  /** Exact bounded closest-image enumeration using reciprocal-vector bounds. */
  function minimumImage(delta,cell,pbc=[true,true,true]){
    const rec=reciprocal(cell), f=rec.map(v=>dot(delta,v));
    let best=cartesian(f.map((x,i)=>x-(pbc[i]?Math.round(x):0)),cell), best2=dot(best,best);
    const bounds=f.map((x,i)=>pbc[i]?[Math.ceil(x-Math.sqrt(best2)*norm(rec[i])-1e-9),Math.floor(x+Math.sqrt(best2)*norm(rec[i])+1e-9)]:[0,0]);
    for(let i=bounds[0][0];i<=bounds[0][1];i++) for(let j=bounds[1][0];j<=bounds[1][1];j++) for(let k=bounds[2][0];k<=bounds[2][1];k++){
      const v=cartesian([f[0]-i,f[1]-j,f[2]-k],cell), d=dot(v,v); if(d<best2){best=v;best2=d;}
    }
    return best;
  }
  function validate(s){
    const vec=v=>Array.isArray(v)&&v.length===3&&v.every(x=>typeof x==='number'&&Number.isFinite(x)&&Math.abs(x)<=10000);
    if(!s||!Array.isArray(s.cell)||s.cell.length!==3||!s.cell.every(vec)) throw Error('需要三个有限的晶胞矢量（Å）');
    if(volume(s.cell)<=.01||s.cell.some(v=>norm(v)<1||norm(v)>200)) throw Error('晶胞须右手定向，边长范围 1–200 Å');
    const rec=reciprocal(s.cell); if(rec.some(v=>norm(v)>2)||s.cell.some((v,i)=>norm(v)*norm(rec[i])>10)) throw Error('晶胞过度倾斜或周期层间距过小');
    if(!Array.isArray(s.pbc)||s.pbc.length!==3||s.pbc.some(v=>typeof v!=='boolean')) throw Error('周期边界必须为三个布尔值');
    if(!Array.isArray(s.atoms)||s.atoms.length<1||s.atoms.length>512) throw Error('支持 1–512 个原子');
    const ids=new Set();
    for(const a of s.atoms){
      if(!a||typeof a.id!=='string'||!a.id.length||a.id.length>100||ids.has(a.id)) throw Error('原子 ID 必须唯一');
      ids.add(a.id); if(!symbols.includes(a.element)||!vec(a.position)||typeof a.site!=='string'||a.site.length>100) throw Error('无效的元素、坐标或位点');
    }
    for(let i=0;i<s.atoms.length;i++) for(let j=0;j<i;j++) if(norm(minimumImage(sub(s.atoms[i].position,s.atoms[j].position),s.cell,s.pbc))<.5) throw Error('原子间距小于 0.5 Å；请检查结构和单位');
    return s;
  }
  function build({kind,a,cOverA=Math.sqrt(8/3),repeats,elementA,elementB}){
    if(!['B2','BCC','FCC','HCP'].includes(kind)||!Number.isFinite(a)||a<1||a>20||!Array.isArray(repeats)||repeats.length!==3||repeats.some(n=>!Number.isInteger(n)||n<1||n>8)) throw Error('请检查晶格、晶格常数和超胞尺寸');
    if(kind==='HCP'&&(!Number.isFinite(cOverA)||cOverA<.8||cOverA>3)) throw Error('c/a 范围为 0.8–3');
    const primitive=kind==='HCP'?[[a,0,0],[-a/2,a*Math.sqrt(3)/2,0],[0,0,a*cOverA]]:[[a,0,0],[0,a,0],[0,0,a]];
    const basis=kind==='FCC'?[[0,0,0],[0,.5,.5],[.5,0,.5],[.5,.5,0]]:kind==='HCP'?[[0,0,0],[2/3,1/3,.5]]:[[0,0,0],[.5,.5,.5]];
    if(repeats.reduce((s,n)=>s*n,basis.length)>512) throw Error('超胞最多 512 个原子');
    const s={cell:primitive.map((v,i)=>v.map(x=>x*repeats[i])),pbc:[true,true,true],atoms:[]};
    for(let i=0;i<repeats[0];i++) for(let j=0;j<repeats[1];j++) for(let k=0;k<repeats[2];k++) basis.forEach((f,b)=>s.atoms.push({id:`${i}-${j}-${k}-${b}`,element:kind==='B2'&&b===1?elementB:elementA,position:cartesian(f.map((x,d)=>x+[i,j,k][d]),primitive),site:kind==='B2'?(b===0?'A':'B'):'all'}));
    return validate(s);
  }
  /** Display-only periodic copies on the closed cell; each source retains total weight one. */
  function boundaryImages(s){
    const images=[], tolerance=1e-7;
    s.atoms.forEach((a,index)=>{
      const f=fractional(a.position,s.cell);
      const shifts=f.map((x,axis)=>{
        if(!s.pbc[axis])return [0];
        const integer=Math.round(x);
        return Math.abs(x-integer)<=tolerance?[-integer,1-integer]:[-Math.floor(x)];
      });
      const weight=1/shifts.reduce((n,values)=>n*values.length,1);
      for(const x of shifts[0])for(const y of shifts[1])for(const z of shifts[2])images.push({index,image:[x,y,z],weight});
    });
    return images;
  }
  function neighbors(s,index,cutoff){
    if(!s.atoms[index]||!Number.isFinite(cutoff)||cutoff<=0||cutoff>20) throw Error('无效的邻居查询');
    const rec=reciprocal(s.cell), out=[];
    s.atoms.forEach((a,j)=>{
      const f=rec.map(v=>dot(sub(a.position,s.atoms[index].position),v));
      const bounds=f.map((x,i)=>s.pbc[i]?[Math.ceil(-x-cutoff*norm(rec[i])),Math.floor(-x+cutoff*norm(rec[i]))]:[0,0]);
      for(let x=bounds[0][0];x<=bounds[0][1];x++) for(let y=bounds[1][0];y<=bounds[1][1];y++) for(let z=bounds[2][0];z<=bounds[2][1];z++){
        if(index===j&&x===0&&y===0&&z===0) continue;
        const delta=cartesian([f[0]+x,f[1]+y,f[2]+z],s.cell), distance=norm(delta);
        if(distance<=cutoff+1e-8) out.push({index:j,id:a.id,element:a.element,distance,delta,image:[x,y,z]});
      }
    });
    return out.sort((a,b)=>a.distance-b.distance);
  }
  function substitute(s,ids,element){
    if(!symbols.includes(element)) throw Error('请选择有效元素');
    const wanted=new Set(ids); if([...wanted].some(id=>!s.atoms.some(a=>a.id===id))) throw Error('选中的原子已不存在');
    const out=clone(s); out.atoms.forEach(a=>{if(wanted.has(a.id)) a.element=element;}); return out;
  }
  function remove(s,id){ if(s.atoms.length<=1) throw Error('至少保留一个原子'); const out=clone(s); out.atoms=out.atoms.filter(a=>a.id!==id); if(out.atoms.length===s.atoms.length) throw Error('原子不存在');return out; }
  function randomIds(s,site,count,seed,element){
    const choices=s.atoms.filter(a=>(site==='all'||a.site===site)&&a.element!==element).map(a=>a.id);
    if(!Number.isInteger(count)||count<1||count>choices.length||!Number.isInteger(seed)) throw Error(`可替换的位点仅有 ${choices.length} 个；数量和随机种子须为整数`);
    let state=seed>>>0; const rnd=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
    for(let i=choices.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}return choices.slice(0,count);
  }
  function compare(initial,final){
    if(initial.pbc.some((v,i)=>v!==final.pbc[i])||initial.atoms.length!==final.atoms.length||initial.atoms.some((a,i)=>a.id!==final.atoms[i].id||a.element!==final.atoms[i].element)) throw Error('比较要求相同成分、周期边界、原子顺序和 ID');
    const mapped=initial.atoms.map(a=>cartesian(fractional(a.position,initial.cell),final.cell));
    const raw=final.atoms.map((a,i)=>minimumImage(sub(a.position,mapped[i]),final.cell,final.pbc));
    const anchored=raw.map(d=>minimumImage(sub(d,raw[0]),final.cell,final.pbc));
    const mean=[0,1,2].map(i=>anchored.reduce((s,v)=>s+v[i],0)/raw.length);
    const translation=raw[0].map((x,i)=>x+mean[i]);
    const vectors=raw.map(d=>minimumImage(sub(d,translation),final.cell,final.pbc)), magnitudes=vectors.map(norm);
    return {vectors,magnitudes,translation,mapped,rms:Math.sqrt(magnitudes.reduce((s,x)=>s+x*x,0)/raw.length),max:Math.max(...magnitudes),volumeInitial:volume(initial.cell),volumeFinal:volume(final.cell),volumeChange:100*(volume(final.cell)/volume(initial.cell)-1)};
  }
  function toXYZ(s){ validate(s); const n=x=>Number(x.toPrecision(12)).toString();return `${s.atoms.length}\nLattice="${s.cell.flat().map(n).join(' ')}" Properties=species:S:1:pos:R:3 pbc="${s.pbc.map(x=>x?'T':'F').join(' ')}"\n${s.atoms.map(a=>`${a.element} ${a.position.map(n).join(' ')}`).join('\n')}\n`; }
  function validateResult(r){
    if(!r||typeof r!=='object')throw Error('无效的计算结果');
    validate(r.initial);validate(r.final);compare(r.initial,r.final);
    const finite=x=>typeof x==='number'&&Number.isFinite(x),vec=v=>Array.isArray(v)&&v.length===3&&v.every(finite);
    if(![r.energyInitial,r.energyFinal,r.maxForce,r.elapsedSeconds].every(finite)||r.maxForce<0||r.elapsedSeconds<0||!Number.isInteger(r.steps)||r.steps<0||r.steps>500||typeof r.converged!=='boolean'||!Array.isArray(r.stressGPa)||r.stressGPa.length!==6||!r.stressGPa.every(finite))throw Error('结果缺少有效的能量、力、应力或收敛记录');
    if(!r.model||['name','version','device','dtype','sha256'].some(k=>typeof r.model[k]!=='string'||!r.model[k].length||r.model[k].length>200))throw Error('结果缺少模型标识');
    if(!r.settings||!finite(r.settings.fmax)||!Number.isInteger(r.settings.maxSteps)||typeof r.settings.relaxCell!=='boolean'||!finite(r.settings.pressureGPa))throw Error('结果缺少计算设置');
    if(r.units?.length!=='angstrom'||r.units?.energy!=='eV'||r.units?.force!=='eV/angstrom'||r.units?.stress!=='GPa')throw Error('不支持此计算结果的单位');
    if(!Array.isArray(r.frames)||r.frames.length>501||r.frames.some(f=>!f||!Number.isInteger(f.step)||!finite(f.energy)||!finite(f.maxForce)||!Array.isArray(f.positions)||f.positions.length!==r.initial.atoms.length||!f.positions.every(vec)||!Array.isArray(f.cell)||f.cell.length!==3||!f.cell.every(vec)))throw Error('无效的计算帧');
    return r;
  }
  return {symbols,clone,validate,validateResult,build,fractional,cartesian,minimumImage,boundaryImages,neighbors,substitute,remove,randomIds,compare,toXYZ,volume};
})();

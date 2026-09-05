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
  const prototypes={
    B2:{label:'CsCl / B2 · AB',ratio:[1,1],system:'cubic',reference:'AB_cP2_221_a_b-002'},
    BCC:{label:'BCC · 体心立方',system:'cubic'},
    FCC:{label:'FCC · 面心立方',system:'cubic'},
    HCP:{label:'HCP · 六方密排',system:'hexagonal'},
    B1:{label:'岩盐 / B1 · AB',ratio:[1,1],system:'cubic',reference:'AB_cF8_225_a_b-001'},
    B3:{label:'闪锌矿 / B3 · AB',ratio:[1,1],system:'cubic',reference:'AB_cF8_216_a_c-001'},
    B4:{label:'纤锌矿 / B4 · AB',ratio:[1,1],system:'hexagonal',u:.375,reference:'AB_hP4_186_b_b-001'},
    fluorite:{label:'萤石 / C1 · AB₂',ratio:[1,2],system:'cubic',reference:'AB2_cF12_225_a_c-001'},
    antifluorite:{label:'反萤石 · A₂B',ratio:[2,1],system:'cubic',reference:'AB2_cF12_225_a_c-001'},
    rutile:{label:'金红石 / C4 · AB₂',ratio:[1,2],system:'tetragonal',u:.305,reference:'A2B_tP6_136_f_a-001'},
    NiAs:{label:'NiAs / B8₁ · AB',ratio:[1,1],system:'hexagonal',reference:'AB_hP4_194_c_a-001'},
    hBN:{label:'层状 h-BN · AB',ratio:[1,1],system:'hexagonal',reference:'AB_hP4_194_c_d-001'},
    MoS2:{label:'层状 2H-MoS₂ · AB₂',ratio:[1,2],system:'hexagonal',u:.621,reference:'AB2_hP6_194_c_f-001'},
    diamond:{label:'金刚石 / A4 · 单质',system:'cubic',reference:'A_cF8_227_a-001'},
    graphite:{label:'石墨 / A9 · 单质',system:'hexagonal',reference:'A_hP4_194_bc-001'},
    pyrite:{label:'黄铁矿 / C2 · AB₂',ratio:[1,2],system:'cubic',reference:'AB2_cP12_205_a_c-001'},
    cuprite:{label:'赤铜矿 / C3 · A₂B',ratio:[2,1],system:'cubic',reference:'A2B_cP6_224_b_a-001'},
    cdi2:{label:'CdI₂ 2H / C6 · AB₂',ratio:[1,2],system:'hexagonal',reference:'AB2_hP3_164_a_d-001'},
    corundum:{label:'刚玉 / D5₁ · A₂B₃',ratio:[2,3],system:'hexagonal',reference:'A2B3_hR10_167_c_e-001'},
    perovskite:{label:'钙钛矿 / E2₁ · ABC₃',ratio:[1,1,3],system:'cubic',reference:'ABC3_cP5_221_a_b_c-001'},
    spinel:{label:'尖晶石 / H1₁ · AB₂C₄',ratio:[1,2,4],system:'cubic',reference:'A2BC4_cF56_227_c_b_e-001'},
    calcite:{label:'方解石 / G₂ · ABC₃',ratio:[1,1,3],system:'hexagonal',reference:'AB3C_hR30_167_a_b_e-001'},
    zircon:{label:'锆石 / S1₁ · ABC₄',ratio:[1,1,4],system:'tetragonal',reference:'A4BC_tI24_141_h_a_b-001'}
  };
  /** Fixed fractional role tables for newer prototypes (rows from AFLOW CIF, pymatgen-expanded).
   * A/B(/C) are chemical roles, not AFLOW alphabetical labels. */
  const CELLS={
  diamond:{A:[[0.125,0.125,0.125],[0.125,0.625,0.625],[0.375,0.375,0.875],[0.375,0.875,0.375],[0.625,0.125,0.625],[0.625,0.625,0.125],[0.875,0.375,0.375],[0.875,0.875,0.875]]},
  graphite:{A:[[0,0,0.25],[0,0,0.75],[0.333333,0.666667,0.25],[0.666667,0.333333,0.75]]},
  pyrite:{A:[[0,0,0],[0,0.5,0.5],[0.5,0,0.5],[0.5,0.5,0]],B:[[0.116,0.616,0.884],[0.116,0.884,0.384],[0.384,0.116,0.884],[0.384,0.384,0.384],[0.616,0.616,0.616],[0.616,0.884,0.116],[0.884,0.116,0.616],[0.884,0.384,0.116]]},
  cuprite:{A:[[0,0,0],[0,0.5,0.5],[0.5,0,0.5],[0.5,0.5,0]],B:[[0.25,0.25,0.25],[0.75,0.75,0.75]]},
  cdi2:{A:[[0,0,0]],B:[[0.333333,0.666667,0.748],[0.666667,0.333333,0.252]]},
  corundum:{A:[[0,0,0.14784],[0,0,0.35216],[0,0,0.64784],[0,0,0.85216],[0.333333,0.666667,0.018827],[0.333333,0.666667,0.314507],[0.333333,0.666667,0.518827],[0.333333,0.666667,0.814507],[0.666667,0.333333,0.185493],[0.666667,0.333333,0.481173],[0.666667,0.333333,0.685493],[0.666667,0.333333,0.981173]],B:[[0,0.3061,0.75],[0,0.6939,0.25],[0.027233,0.360567,0.416667],[0.027233,0.666667,0.916667],[0.3061,0,0.75],[0.3061,0.3061,0.25],[0.333333,0.360567,0.916667],[0.333333,0.972767,0.416667],[0.360567,0.027233,0.083333],[0.360567,0.333333,0.583333],[0.639433,0.666667,0.416667],[0.639433,0.972767,0.916667],[0.666667,0.027233,0.583333],[0.666667,0.639433,0.083333],[0.6939,0,0.25],[0.6939,0.6939,0.75],[0.972767,0.333333,0.083333],[0.972767,0.639433,0.583333]]},
  perovskite:{A:[[0,0,0]],B:[[0.5,0.5,0.5]],C:[[0,0.5,0.5],[0.5,0,0.5],[0.5,0.5,0]]},
  spinel:{A:[[0.125,0.125,0.625],[0.125,0.625,0.125],[0.375,0.375,0.375],[0.375,0.875,0.875],[0.625,0.125,0.125],[0.625,0.625,0.625],[0.875,0.375,0.875],[0.875,0.875,0.375]],B:[[0,0,0],[0,0.25,0.25],[0,0.5,0.5],[0,0.75,0.75],[0.25,0,0.25],[0.25,0.25,0],[0.25,0.5,0.75],[0.25,0.75,0.5],[0.5,0,0.5],[0.5,0.25,0.75],[0.5,0.5,0],[0.5,0.75,0.25],[0.75,0,0.75],[0.75,0.25,0.5],[0.75,0.5,0.25],[0.75,0.75,0]],C:[[0.0124,0.0124,0.2376],[0.0124,0.2376,0.0124],[0.0124,0.5124,0.7376],[0.0124,0.7376,0.5124],[0.2376,0.0124,0.0124],[0.2376,0.2376,0.2376],[0.2376,0.5124,0.5124],[0.2376,0.7376,0.7376],[0.2624,0.2624,0.7624],[0.2624,0.4876,0.9876],[0.2624,0.7624,0.2624],[0.2624,0.9876,0.4876],[0.4876,0.2624,0.9876],[0.4876,0.4876,0.7624],[0.4876,0.7624,0.4876],[0.4876,0.9876,0.2624],[0.5124,0.0124,0.7376],[0.5124,0.2376,0.5124],[0.5124,0.5124,0.2376],[0.5124,0.7376,0.0124],[0.7376,0.0124,0.5124],[0.7376,0.2376,0.7376],[0.7376,0.5124,0.0124],[0.7376,0.7376,0.2376],[0.7624,0.2624,0.2624],[0.7624,0.4876,0.4876],[0.7624,0.7624,0.7624],[0.7624,0.9876,0.9876],[0.9876,0.2624,0.4876],[0.9876,0.4876,0.2624],[0.9876,0.7624,0.9876],[0.9876,0.9876,0.7624]]},
  calcite:{A:[[0,0,0],[0,0,0.5],[0.333333,0.666667,0.166667],[0.333333,0.666667,0.666667],[0.666667,0.333333,0.333333],[0.666667,0.333333,0.833333]],B:[[0,0,0.25],[0,0,0.75],[0.333333,0.666667,0.416667],[0.333333,0.666667,0.916667],[0.666667,0.333333,0.083333],[0.666667,0.333333,0.583333]],C:[[0,0.2553,0.25],[0,0.7447,0.75],[0.078033,0.411367,0.916667],[0.078033,0.666667,0.416667],[0.2553,0,0.25],[0.2553,0.2553,0.75],[0.333333,0.411367,0.416667],[0.333333,0.921967,0.916667],[0.411367,0.078033,0.583333],[0.411367,0.333333,0.083333],[0.588633,0.666667,0.916667],[0.588633,0.921967,0.416667],[0.666667,0.078033,0.083333],[0.666667,0.588633,0.583333],[0.7447,0,0.75],[0.7447,0.7447,0.25],[0.921967,0.333333,0.583333],[0.921967,0.588633,0.083333]]},
  zircon:{A:[[0,0.25,0.375],[0,0.75,0.625],[0.5,0.25,0.125],[0.5,0.75,0.875]],B:[[0,0.25,0.875],[0,0.75,0.125],[0.5,0.25,0.625],[0.5,0.75,0.375]],C:[[0,0.066,0.6951],[0,0.434,0.6951],[0,0.566,0.3049],[0,0.934,0.3049],[0.184,0.25,0.0549],[0.184,0.75,0.9451],[0.316,0.25,0.4451],[0.316,0.75,0.5549],[0.5,0.066,0.8049],[0.5,0.434,0.8049],[0.5,0.566,0.1951],[0.5,0.934,0.1951],[0.684,0.25,0.4451],[0.684,0.75,0.5549],[0.816,0.25,0.0549],[0.816,0.75,0.9451]]}
  };
  /** Conventional cubic cells and hexagonal/tetragonal cells; A/B(/C) are chemical roles. */
  function build({kind,a,cOverA=Math.sqrt(8/3),u,repeats,elementA,elementB,elementC}){
    const p=Object.hasOwn(prototypes,kind)?prototypes[kind]:null;
    if(!p||!Number.isFinite(a)||a<1||a>20||!Array.isArray(repeats)||repeats.length!==3||repeats.some(n=>!Number.isInteger(n)||n<1||n>8)) throw Error('请检查晶格、晶格常数和超胞尺寸');
    if(p.system!=='cubic'&&(!Number.isFinite(cOverA)||cOverA<.2||cOverA>8)) throw Error('c/a 范围为 0.2–8');
    u=u??p.u;
    if(p.u!==undefined&&(!Number.isFinite(u)||u<=0||u>=1))throw Error('内部坐标 u 必须在 0 与 1 之间');
    const primitive=p.system==='hexagonal'?[[a,0,0],[-a/2,a*Math.sqrt(3)/2,0],[0,0,a*cOverA]]:[[a,0,0],[0,a,0],[0,0,p.system==='tetragonal'?a*cOverA:a]];
    const fcc=[[0,0,0],[0,.5,.5],[.5,0,.5],[.5,.5,0]], body=[[0,0,0],[.5,.5,.5]];
    const tetra=[];for(const x of [.25,.75])for(const y of [.25,.75])for(const z of [.25,.75])tetra.push([x,y,z]);
    const roles=p.ratio?p.ratio.length:1; // 1 = pure element (site all)
    let groups=[];
    if(CELLS[kind]){
      const C=CELLS[kind];
      groups=[C.A||[],C.B||[],C.C||[]].filter(g=>g.length);
    } else {
      let aa,bb=[];
      switch(kind){
        case 'FCC':aa=fcc;break;
        case 'BCC':aa=body;break;
        case 'HCP':aa=[[0,0,0],[2/3,1/3,.5]];break;
        case 'B2':aa=[body[0]];bb=[body[1]];break;
        case 'B1':aa=fcc;bb=fcc.map(f=>[f[0]+.5,f[1],f[2]]);break;
        case 'B3':aa=fcc;bb=fcc.map(f=>f.map(x=>x+.25));break;
        case 'B4':aa=[[1/3,2/3,0],[2/3,1/3,.5]];bb=aa.map(f=>[f[0],f[1],f[2]+u]);break;
        case 'fluorite':aa=fcc;bb=tetra;break;
        case 'antifluorite':aa=tetra;bb=fcc;break;
        case 'rutile':aa=body;bb=[[u,u,0],[-u,-u,0],[.5-u,.5+u,.5],[.5+u,.5-u,.5]];break;
        case 'NiAs':aa=[[0,0,0],[0,0,.5]];bb=[[1/3,2/3,.25],[2/3,1/3,.75]];break;
        case 'hBN':aa=[[1/3,2/3,.25],[2/3,1/3,.75]];bb=[[2/3,1/3,.25],[1/3,2/3,.75]];break;
        case 'MoS2':aa=[[1/3,2/3,.25],[2/3,1/3,.75]];bb=[[1/3,2/3,u],[2/3,1/3,u+.5],[2/3,1/3,-u],[1/3,2/3,.5-u]];break;
      }
      groups=[aa,...(bb.length?[bb]:[])];
    }
    const basis=[],siteOf=[],roleEl=[];
    const els=[elementA,elementB,elementC];
    groups.forEach((g,r)=>{
      const site=roles>1?String.fromCharCode(65+r):'all';
      g.forEach(f=>{basis.push(f);siteOf.push(site);roleEl.push(els[r]??elementA);});
    });
    const folded=basis.map(f=>f.map(x=>((x%1)+1)%1));
    if(repeats.reduce((s,n)=>s*n,folded.length)>512) throw Error('超胞最多 512 个原子');
    const s={cell:primitive.map((v,i)=>v.map(x=>x*repeats[i])),pbc:[true,true,true],atoms:[]};
    for(let i=0;i<repeats[0];i++) for(let j=0;j<repeats[1];j++) for(let k=0;k<repeats[2];k++) folded.forEach((f,b)=>s.atoms.push({id:`${i}-${j}-${k}-${b}`,element:roleEl[b],position:cartesian(f.map((x,d)=>x+[i,j,k][d]),primitive),site:siteOf[b]}));
    return validate(s);
  }
  /** Display-only periodic copies on the closed cell; each source retains total weight one.
   * boundarySlopA (Å) widens boundary membership for atoms that relaxed slightly off the
   * ideal face planes (kept well below the smallest displayed sphere radius ~0.32 Å so
   * genuinely interior atoms are never mirrored). Default 0 = strict ideal-boundary test. */
  function boundaryImages(s,boundarySlopA=0){
    const images=[], rec=boundarySlopA>0?reciprocal(s.cell):null;
    s.atoms.forEach((a,index)=>{
      const f=fractional(a.position,s.cell);
      const shifts=f.map((x,axis)=>{
        if(!s.pbc[axis])return [0];
        const integer=Math.round(x);
        const tolerance=boundarySlopA>0?boundarySlopA*Math.hypot(...rec[axis]):1e-7;
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
  return {symbols,prototypes,clone,validate,validateResult,build,fractional,cartesian,minimumImage,boundaryImages,neighbors,substitute,remove,randomIds,compare,toXYZ,volume};
})();

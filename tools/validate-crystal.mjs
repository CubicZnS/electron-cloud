import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../parts/03c_crystal.js', import.meta.url), 'utf8');
const C = vm.runInNewContext(`${source}\nCrystalCore;`);
const templatesSource=readFileSync(new URL('../parts/03d_crystal_templates.js',import.meta.url),'utf8');
const templates=vm.runInNewContext(`${source}\n${templatesSource}\nCrystalTemplates;`);
let passed = 0;
function test(name, fn) { fn(); console.log(`✓ ${name}`); passed++; }
const build = (extra = {}) => C.build({ kind: 'B2', a: 2.88, cOverA: Math.sqrt(8/3), repeats: [3,3,3], elementA: 'Ni', elementB: 'Al', ...extra });
const near = (a,b,t=1e-8) => assert.ok(Math.abs(a-b)<t, `${a} != ${b}`);
test('B2 stoichiometry, stable sites and nonmutating substitution', () => {
  const s = build(); assert.equal(s.atoms.length,54); assert.equal(s.atoms.filter(a=>a.site==='A').length,27);
  const d = C.substitute(s,[s.atoms[0].id],'Co'); assert.equal(s.atoms[0].element,'Ni'); assert.equal(d.atoms[0].element,'Co'); assert.equal(d.atoms[0].id,s.atoms[0].id);
});
test('FCC and BCC conventional cells', () => { assert.equal(build({kind:'FCC',repeats:[1,1,1]}).atoms.length,4); assert.equal(build({kind:'BCC',repeats:[1,1,1]}).atoms.length,2); });
test('closed FCC cell has eight corners and six face centers, total weight four',()=>{
  const s=build({kind:'FCC',repeats:[1,1,1]}), before=JSON.stringify(s), copies=C.boundaryImages(s);
  assert.equal(copies.length,14);assert.equal(copies.filter(c=>c.weight===1/8).length,8);assert.equal(copies.filter(c=>c.weight===1/2).length,6);
  near(copies.reduce((n,c)=>n+c.weight,0),4);assert.equal(JSON.stringify(s),before);
  for(let i=0;i<4;i++)near(copies.filter(c=>c.index===i).reduce((n,c)=>n+c.weight,0),1);
  assert.match(C.toXYZ(s),/^4\n/);
  const doped=C.substitute(s,[s.atoms[0].id],'Co');assert.equal(copies.filter(c=>doped.atoms[c.index].element==='Co').length,8);assert.equal(doped.atoms.filter(a=>a.element==='Co').length,1);
});
test('supercell boundary weights include edges and preserve independent atom count',()=>{
  const s=build({kind:'FCC',repeats:[2,2,2]}), copies=C.boundaryImages(s);
  assert.equal(copies.length,63);assert.equal(copies.filter(c=>c.weight===1/4).length,12);near(copies.reduce((n,c)=>n+c.weight,0),32);
  const bcc=C.boundaryImages(build({kind:'BCC',repeats:[1,1,1]}));assert.equal(bcc.length,9);near(bcc.reduce((n,c)=>n+c.weight,0),2);
});
test('boundary images respect partial periodicity and translated skew-cell coordinates',()=>{
  const s=build({kind:'FCC',repeats:[1,1,1]});s.pbc=[true,false,false];
  const copies=C.boundaryImages(s);assert.equal(copies.length,6);near(copies.reduce((n,c)=>n+c.weight,0),4);copies.forEach(c=>assert.ok(c.image[1]===0&&c.image[2]===0));
  s.pbc=[false,false,false];assert.equal(C.boundaryImages(s).length,4);
  const h=build({kind:'HCP',repeats:[1,1,1]});h.atoms.forEach(a=>a.position=a.position.map((x,i)=>x+C.cartesian([2,-1,3],h.cell)[i]));
  const hc=C.boundaryImages(h);assert.equal(hc.length,9);near(hc.reduce((n,c)=>n+c.weight,0),2);
  hc.forEach(c=>{const p=h.atoms[c.index].position.map((x,i)=>x+C.cartesian(c.image,h.cell)[i]);C.fractional(p,h.cell).forEach(x=>assert.ok(x>=-1e-7&&x<=1+1e-7));});
});
test('HCP primitive cell and all twelve periodic neighbors', () => {
  const s=build({kind:'HCP',a:3,repeats:[1,1,1]}); assert.equal(s.atoms.length,2);
  const ns=C.neighbors(s,0,3.01); assert.equal(ns.length,12); ns.forEach(n=>near(n.distance,3));
});
test('row-vector triclinic transform round trip', () => {
  const cell=[[4,0,0],[1,3,0],[.5,.4,2]], f=[.24,.87,-.2];
  C.fractional(C.cartesian(f,cell),cell).forEach((v,i)=>near(v,f[i]));
});
test('minimum image crosses a periodic boundary', () => { near(Math.hypot(...C.minimumImage([9.8,0,0],[[10,0,0],[0,10,0],[0,0,10]],[true,true,true])),.2); });
test('skew cell shortest image differs from naive fractional rounding', () => {
  const cell=[[3,0,0],[2.5,1,0],[0,0,5]], d=C.cartesian([.49,.49,0],cell);
  const out=C.minimumImage(d,cell,[true,true,true]); near(Math.hypot(...out),Math.hypot(.195,-.51));
});
test('comparison ignores rigid translation and affine cell change', () => {
  const s=build(), f=C.clone(s); f.cell=f.cell.map(v=>v.map(x=>x*1.1));
  f.atoms.forEach(a=>a.position=a.position.map((x,i)=>x*1.1+[1,2,3][i]));
  const r=C.compare(s,f); near(r.rms,0); near(r.volumeChange,33.1,1e-6);
});
test('local displacement measured without changing scientific coordinates', () => {
  const s=build(), f=C.clone(s); f.atoms[0].position[0]+=.2; const before=JSON.stringify(f);
  const r=C.compare(s,f); assert.ok(r.max>.19 && r.max<.2); assert.equal(JSON.stringify(f),before);
});
test('seeded sublattice substitution respects eligible count', () => {
  const s=build(), ids=C.randomIds(s,'B',3,42,'Co'); assert.equal(ids.join(),C.randomIds(s,'B',3,42,'Co').join());
  ids.forEach(id=>assert.equal(s.atoms.find(a=>a.id===id).site,'B')); assert.throws(()=>C.randomIds(s,'A',28,1,'Co'));
});
test('vacancy preserves identities and rejects final atom deletion', () => {
  const s=build(); const d=C.remove(s,s.atoms[2].id); assert.equal(d.atoms.length,53); assert.equal(d.atoms[2].id,s.atoms[3].id);
  assert.throws(()=>C.remove({...s,atoms:[s.atoms[0]]},s.atoms[0].id));
});
test('invalid geometry, elements, atom ids and build bounds rejected', () => {
  for(const mutate of [s=>s.cell[2]=[0,0,0],s=>s.atoms[0].position[0]=NaN,s=>s.atoms[0].element='Qq',s=>s.atoms[0].id=s.atoms[1].id,s=>s.atoms[0].position=[...s.atoms[1].position]]){const s=build();mutate(s);assert.throws(()=>C.validate(s));}
  assert.throws(()=>build({repeats:[8,8,8]})); assert.throws(()=>build({a:-1}));
});
test('comparison rejects atom correspondence mismatch', () => {const s=build(),f=C.clone(s);f.atoms[0].element='Co';assert.throws(()=>C.compare(s,f));});
test('extended XYZ has explicit lattice and units-compatible positions', () => {const x=C.toXYZ(build());assert.match(x,/^54\nLattice="8.64 0 0 0 8.64 0 0 0 8.64"/);assert.match(x,/Properties=species:S:1:pos:R:3/);assert.match(x,/pbc="T T T"/);});
test('result round trip preserves provenance and rejects corrupted fields',()=>{
  const s=build(),r={initial:s,final:C.clone(s),energyInitial:-100,energyFinal:-101,maxForce:.01,elapsedSeconds:1,steps:4,converged:true,stressGPa:[0,0,0,0,0,0],model:{name:'fixture',version:'1',device:'cpu',dtype:'float64',sha256:'a'.repeat(64)},settings:{fmax:.03,maxSteps:100,relaxCell:false,pressureGPa:0},units:{length:'angstrom',energy:'eV',force:'eV/angstrom',stress:'GPa'},frames:[{step:0,positions:s.atoms.map(a=>a.position),cell:s.cell,energy:-100,maxForce:.1}]};
  assert.equal(C.validateResult(JSON.parse(JSON.stringify(r))).model.sha256,r.model.sha256);
  for(const mutate of [d=>d.units.length='bohr',d=>d.maxForce=NaN,d=>d.model.version=null,d=>d.frames[0].positions.pop(),d=>d.final.pbc[0]=false]){const d=C.clone(r);mutate(d);assert.throws(()=>C.validateResult(d));}
});
test('all named templates preserve site ratios, periodic weights and export counts',()=>{
  assert.equal(templates.length,232);assert.equal(new Set(templates.map(t=>t.id)).size,232);
  for(const t of templates){
    const s=C.build({...t,repeats:[1,1,1]}),p=C.prototypes[t.kind];
    const counts={'A':s.atoms.filter(x=>x.site==='A').length,'B':s.atoms.filter(x=>x.site==='B').length,'C':s.atoms.filter(x=>x.site==='C').length,'all':s.atoms.filter(x=>x.site==='all').length};
    if(p.ratio){ // multi-role: counts must be proportional to the ratio
      const roles=p.ratio.length===3?['A','B','C']:['A','B'];
      const first=roles.map(r=>counts[r]/p.ratio[roles.indexOf(r)]);
      roles.forEach((r,i)=>near(counts[r]/p.ratio[i],first[0],1e-9),t.id);
    }
    assert.ok(s.atoms.every(x=>x.site==='all'?x.element===t.elementA:(x.site==='A'?x.element===t.elementA:x.site==='B'?x.element===t.elementB:x.element===t.elementC)),t.id);
    near(C.boundaryImages(s).reduce((n,x)=>n+x.weight,0),s.atoms.length);
    assert.equal(Number(C.toXYZ(s).split('\n')[0]),s.atoms.length);
    assert.equal(C.validate(JSON.parse(JSON.stringify(s))).atoms.length,s.atoms.length);
  }
});
test('nearest-neighbor coordination matches crystallographic prototypes',()=>{
  const fixtures=[['B1-NaCl',2.83,6],['B2-CsCl',3.58,8],['B3-ZnS',2.35,4],['B4-ZnO',2.01,4],['fluorite-CaF2',2.38,8],['antifluorite-Li2O',2.01,4],['rutile-TiO2',2.05,6],['NiAs-NiAs',2.6,6],['hBN-h-BN',1.46,3],['MoS2-MoS2',2.5,6]];
  for(const [id,cutoff,count] of fixtures){const t=templates.find(t=>t.id===id),s=C.build({...t,repeats:[1,1,1]});assert.equal(C.neighbors(s,0,cutoff).filter(n=>n.element===t.elementB).length,count,id);}
  // new families (A/B(/C) neighbor counts at realistic bond cutoffs)
  const tern=[['perovskite-SrTiO3',2.0,'Ti','O',6],['spinel-MgAl2O4',2.1,'Mg','O',4],['spinel-MgAl2O4',2.1,'Al','O',6],['calcite-CaCO3',1.4,'C','O',3],['calcite-CaCO3',2.6,'Ca','O',6],['zircon-ZrSiO4',1.8,'Si','O',4],['zircon-ZrSiO4',2.4,'Zr','O',8]];
  for(const [id,cutoff,elA,elB,count] of tern){const t=templates.find(x=>x.id===id),s=C.build({...t,repeats:[1,1,1]}),i=s.atoms.findIndex(a=>a.element===elA);assert.equal(C.neighbors(s,i,cutoff).filter(n=>n.element===elB).length,count,id);}
  for(const [id,cutoff,count] of [['diamond-Si',2.6,4],['pyrite-FeS2',2.4,6],['cuprite-Cu2O',2.0,2],['cdi2-CdI2',3.2,6],['corundum-Al2O3',2.1,6],['graphite-C(石墨)',1.6,3]]){const t=templates.find(x=>x.id===id),s=C.build({...t,repeats:[1,1,1]});assert.equal(C.neighbors(s,0,cutoff).length,count,id);}
});
test('NaCl closed cell has 27 spheres representing four formula units',()=>{
  const s=C.build({...templates.find(t=>t.id==='B1-NaCl'),repeats:[1,1,1]}),images=C.boundaryImages(s);
  assert.equal(s.atoms.length,8);assert.equal(images.length,27);
  assert.equal(images.filter(i=>s.atoms[i.index].element==='Na').length,14);
  assert.equal(images.filter(i=>i.weight===.25).length,12);
});
test('noncubic internal parameters, hexagonal angle and binary supercells',()=>{
  for(const kind of ['B4','rutile','MoS2']){
    const t=templates.find(t=>t.kind===kind),s=C.build({...t,repeats:[1,1,1]}),changed=C.build({...t,u:t.u+.005,repeats:[1,1,1]});
    assert.notEqual(JSON.stringify(s.atoms),JSON.stringify(changed.atoms));
    near(s.cell[2][2],t.a*t.cOverA);
    assert.throws(()=>C.build({...t,u:NaN,repeats:[1,1,1]}));
  }
  const t=templates.find(t=>t.kind==='B4'),s=C.build({...t,repeats:[2,3,2]});
  assert.equal(s.atoms.length,48);near(s.cell[1][0]/Math.hypot(...s.cell[1]),-.5);
  assert.throws(()=>C.build({...t,repeats:[8,8,8]}));
  assert.throws(()=>build({kind:'toString'}));
});
test('toPOSCAR/formula exports cover species, counts and no wrapped duplicates',()=>{
  for(const t of templates){
    const s=C.build({...t,repeats:[1,1,1]});
    const pos=C.toPOSCAR(s);
    const lines=pos.trim().split('\n');
    const species=lines[5].trim().split(/\s+/),counts=lines[6].trim().split(/\s+/).map(Number);
    const fracLines=lines.slice(8);
    assert.equal(fracLines.length,s.atoms.length,t.id);
    assert.equal(species.length,counts.length,t.id);
    assert.equal(counts.reduce((a,b)=>a+b,0),s.atoms.length,t.id);
    const seen=new Set();
    for(const fl of fracLines){
      const parts=fl.trim().split(/\s+/).map(Number);
      assert.equal(parts.length,3,t.id);
      parts.forEach(x=>assert.ok(x>=-1e-9&&x<1,t.id+' frac '+x));
      const key=parts.map(x=>x.toFixed(6)).join(',');
      assert.ok(!seen.has(key),t.id+' duplicate wrapped frac');seen.add(key);
    }
    const byEl=new Map();s.atoms.forEach(a=>byEl.set(a.element,(byEl.get(a.element)||0)+1));
    [...byEl.keys()].sort().forEach((el,i)=>assert.equal(species[i],el,t.id));
  }
  const big=C.build({kind:'B2',a:2.88,repeats:[3,3,3],elementA:'Ni',elementB:'Al'});
  assert.equal(C.toPOSCAR(big).trim().split('\n').length-8,54);
  assert.equal(C.formulaPlain(big),'Al27Ni27');
  assert.ok(C.formulaSub(big).includes('₂₇'));
  const before=JSON.stringify(big);C.toPOSCAR(big);assert.equal(JSON.stringify(big),before);
});
console.log(`${passed}/${passed} crystal checks passed`);

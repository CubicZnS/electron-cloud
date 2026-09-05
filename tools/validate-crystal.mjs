import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../parts/03c_crystal.js', import.meta.url), 'utf8');
const C = vm.runInNewContext(`${source}\nCrystalCore;`);
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
console.log(`${passed}/${passed} crystal checks passed`);

/* Independent scene: no writes to the molecular or Cube render state. */
function createCrystalRenderer(host, onSelect){
  const world=new THREE.Scene(); world.background=new THREE.Color(0x060a11);
  const view=new THREE.PerspectiveCamera(38,1,.05,2000);
  const gpu=new THREE.WebGLRenderer({antialias:true,alpha:false});
  gpu.setPixelRatio(Math.min(devicePixelRatio||1,2)); gpu.outputColorSpace=THREE.SRGBColorSpace;
  gpu.toneMapping=THREE.ACESFilmicToneMapping; gpu.toneMappingExposure=1.2;
  gpu.domElement.setAttribute('aria-label','晶体三维视图，可拖动旋转、滚轮缩放、点击选择原子');
  host.appendChild(gpu.domElement);
  const orbit=new OrbitControls(view,gpu.domElement); orbit.enableDamping=false;
  world.add(new THREE.AmbientLight(0xb7c9e7,1.6));
  const key=new THREE.DirectionalLight(0xffffff,2.8);key.position.set(3,6,5);world.add(key);
  const rim=new THREE.DirectionalLight(0x84bbff,2);rim.position.set(-4,1,-3);world.add(rim);
  const group=new THREE.Group();world.add(group);
  const sphere=new THREE.SphereGeometry(1,24,16), material=new THREE.MeshStandardMaterial({roughness:.3,metalness:.2});
  const ray=new THREE.Raycaster(), pointer=new THREE.Vector2(), matrix=new THREE.Matrix4();
  let structure=null, reference=null, comparison=null, atoms=null, selected=null, positions=[], images=[], cell=[], center=[0,0,0];
  let options={neighbors:true,ghosts:true,arrows:true,color:'element',amplification:1,t:1,active:true}, disposed=false;
  function draw(){if(!disposed&&options.active&&host.clientWidth&&host.clientHeight)gpu.render(world,view);}
  function clear(){
    while(group.children.length){const child=group.children[0];group.remove(child);child.traverse(o=>{if(o.isInstancedMesh)o.dispose();if(o.geometry&&o.geometry!==sphere)o.geometry.dispose();if(o.material&&o.material!==material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose());}});}
  }
  function line(vertices,color,opacity=1){
    const geo=new THREE.BufferGeometry().setAttribute('position',new THREE.Float32BufferAttribute(vertices.flat(),3));
    const mesh=new THREE.LineSegments(geo,new THREE.LineBasicMaterial({color,transparent:opacity<1,opacity}));group.add(mesh);return mesh;
  }
  const local=p=>new THREE.Vector3(...p.map((x,i)=>x-center[i]));
  const localArray=p=>p.map((x,i)=>x-center[i]);
  function rebuild(){
    if(!structure)return;clear();
    cell=structure.cell.map((v,i)=>v.map((x,j)=>reference?reference.cell[i][j]+(x-reference.cell[i][j])*options.t:x));
    center=CrystalCore.cartesian([.5,.5,.5],cell);
    const sourcePositions=structure.atoms.map((a,i)=>{
      if(!reference)return a.position;
      const base=CrystalCore.cartesian(CrystalCore.fractional(reference.atoms[i].position,reference.cell),cell);
      return base.map((x,j)=>x+comparison.vectors[i][j]*options.t*options.amplification);
    });
    // Keep reference copies paired during interpolation, including boundary crossings.
    // 0.25 Å slop: relaxed structures (after adopt or as a later baseline) keep closed-cell mirrors
    // for atoms within a sphere radius of a face; interior atoms are never mirrored.
    images=CrystalCore.boundaryImages(reference||structure,0.25);
    const shifted=(p,image)=>p.map((x,j)=>x+CrystalCore.cartesian(image,cell)[j]);
    const referencePosition=copy=>shifted(CrystalCore.cartesian(CrystalCore.fractional(reference.atoms[copy.index].position,reference.cell),cell),copy.image);
    positions=images.map(copy=>shifted(sourcePositions[copy.index],copy.image));
    atoms=new THREE.InstancedMesh(sphere,material,positions.length);atoms.name='atoms';
    positions.forEach((p,i)=>{
      const sourceIndex=images[i].index;
      const info=elementInfo(structure.atoms[sourceIndex].element), radius=Math.max(.32,Math.min(.65,info.ball*1.05));
      matrix.compose(local(p),new THREE.Quaternion(),new THREE.Vector3(radius,radius,radius));atoms.setMatrixAt(i,matrix);
      const color=options.color==='displacement'&&comparison?new THREE.Color(0x69c9ff).lerp(new THREE.Color(0xffae6c),comparison.max?comparison.magnitudes[sourceIndex]/comparison.max:0):new THREE.Color(info.color);
      atoms.setColorAt(i,color);
    });atoms.instanceMatrix.needsUpdate=true;atoms.instanceColor.needsUpdate=true;group.add(atoms);
    const corners=Array.from({length:8},(_,i)=>CrystalCore.cartesian([i&1,(i>>1)&1,(i>>2)&1],cell)), edges=[];
    for(let i=0;i<8;i++)for(const bit of [1,2,4])if(!(i&bit))edges.push(localArray(corners[i]),localArray(corners[i|bit]));
    line(edges,0x7290b4,.65);
    [[0x79ceff,cell[0]],[0xb8a2ff,cell[1]],[0xffb975,cell[2]]].forEach(([color,v])=>line([localArray([0,0,0]),localArray(v.map(x=>x*.24))],color));
    if(options.neighbors&&positions.length>1){
      // Guides join visible nearest neighbors; they are geometric distances, not bond orders.
      let nearest=Infinity;
      for(let i=1;i<positions.length;i++){
        const distance=Math.hypot(...positions[i].map((x,j)=>x-positions[0][j]));
        if(distance>.1)nearest=Math.min(nearest,distance);
      }
      const lines=[];
      for(let i=0;i<positions.length;i++)for(let j=0;j<i;j++){
        const d=Math.hypot(...positions[i].map((x,k)=>x-positions[j][k]));if(d>0.1&&d<nearest*1.2)lines.push(localArray(positions[i]),localArray(positions[j]));
      }
      line(lines,0x7992b2,.22);
    }
    if(reference&&options.ghosts){
      const ghosts=new THREE.InstancedMesh(sphere,new THREE.MeshBasicMaterial({color:0xb9cbe4,wireframe:true,transparent:true,opacity:.10,depthWrite:false}),positions.length);
      images.forEach((copy,i)=>{matrix.compose(local(referencePosition(copy)),new THREE.Quaternion(),new THREE.Vector3(.42,.42,.42));ghosts.setMatrixAt(i,matrix);});group.add(ghosts);
    }
    if(reference&&options.arrows){
      images.forEach(copy=>{
        const v=comparison.vectors[copy.index];
        const length=Math.hypot(...v)*options.amplification*options.t;if(length<.008)return;
        const start=referencePosition(copy);
        group.add(new THREE.ArrowHelper(new THREE.Vector3(...v).normalize(),local(start),length,0xffb777,Math.min(.20,length*.3),Math.min(.1,length*.18)));
      });
    }
    const index=structure.atoms.findIndex(a=>a.id===selected);
    if(index>=0){
      images.forEach((copy,i)=>{
        if(copy.index!==index)return;
        const marker=new THREE.Mesh(sphere,new THREE.MeshBasicMaterial({color:0xe4f4ff,wireframe:true,transparent:true,opacity:.5}));
        marker.position.copy(local(positions[i]));marker.scale.setScalar(Math.max(.32,Math.min(.65,elementInfo(structure.atoms[index].element).ball*1.05))+.12);group.add(marker);
      });
    }
    draw();
  }
  function fit(){
    if(!structure)return;resize();
    const corners=Array.from({length:8},(_,i)=>CrystalCore.cartesian([i&1,(i>>1)&1,(i>>2)&1],cell));
    const radius=Math.max(...corners.concat(positions).map(p=>local(p).length()))+.7;
    const vertical=THREE.MathUtils.degToRad(view.fov/2), halfAngle=Math.min(vertical,Math.atan(Math.tan(vertical)*view.aspect));
    const distance=radius/Math.sin(halfAngle)*1.12;
    view.position.copy(new THREE.Vector3(1.3,.9,1.6).normalize().multiplyScalar(distance));orbit.target.set(0,0,0);view.near=Math.max(.01,radius/1000);view.far=distance*30;view.updateProjectionMatrix();orbit.update();draw();
  }
  function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;gpu.setSize(w,h);view.aspect=w/h;view.updateProjectionMatrix();draw();}
  let down=null;
  gpu.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});
  gpu.domElement.addEventListener('pointerup',e=>{
    if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5||!atoms)return;down=null;
    const box=gpu.domElement.getBoundingClientRect();pointer.set((e.clientX-box.left)/box.width*2-1,-(e.clientY-box.top)/box.height*2+1);
    ray.setFromCamera(pointer,view);const hit=ray.intersectObject(atoms)[0];if(hit&&hit.instanceId!==undefined)onSelect(structure.atoms[images[hit.instanceId].index].id);
  });
  orbit.addEventListener('change',draw);
  const observer=new ResizeObserver(resize);observer.observe(host);
  return {
    setStructure(s){structure=s;reference=null;comparison=null;options.t=1;rebuild();},
    showComparison(initial,final){reference=initial;structure=final;comparison=CrystalCore.compare(initial,final);rebuild();},
    select(id){selected=id;rebuild();},fit,resize,
    setOptions(next){options={...options,...next};if(Object.keys(next).every(k=>k==='active'))draw();else rebuild();},
    dispose(){disposed=true;observer.disconnect();orbit.dispose();clear();sphere.dispose();material.dispose();gpu.dispose();gpu.domElement.remove();}
  };
}

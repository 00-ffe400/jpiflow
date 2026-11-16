import * as THREE from '../vendor/three.module.js';

function roundedBox(width,height,depth,radius) {
  const r = Math.min(radius,Math.min(width,height,depth)/2-.001);
  const geometry = new THREE.BoxGeometry(width,height,depth,8,8,8);
  const p = geometry.attributes.position;
  const inner = new THREE.Vector3(width/2-r,height/2-r,depth/2-r);
  const v = new THREE.Vector3(), q = new THREE.Vector3();
  for (let i=0;i<p.count;i++) {
    v.fromBufferAttribute(p,i);
    q.set(Math.max(-inner.x,Math.min(inner.x,v.x)),Math.max(-inner.y,Math.min(inner.y,v.y)),Math.max(-inner.z,Math.min(inner.z,v.z)));
    v.sub(q).normalize().multiplyScalar(r).add(q);
    p.setXYZ(i,v.x,v.y,v.z);
  }
  geometry.computeVertexNormals(); return geometry;
}
export function createScene(container, initial) {
  let config={...initial},phase=0,last=0,paused=false,inView=true,frame=0,destroyed=false;
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  renderer.setClearColor('#212121');
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.1;
  container.appendChild(renderer.domElement);
  const scene=new THREE.Scene(); scene.fog=new THREE.FogExp2('#212121',.048);
  const camera=new THREE.PerspectiveCamera(36,1,.1,80);
  camera.position.set(8.5,8.7,10.5); camera.lookAt(0,.6,0);
  const world=new THREE.Group(); scene.add(world);
  const ambient=new THREE.HemisphereLight('#b8d8ff','#080f21',2); scene.add(ambient);
  const key=new THREE.DirectionalLight('#d2edff',5); key.position.set(-3,8,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-8;key.shadow.camera.right=8;key.shadow.camera.top=8;key.shadow.camera.bottom=-8;key.shadow.normalBias=.025;scene.add(key);
  const rim=new THREE.PointLight('#0084ff',35,16,2);rim.position.set(-2,2.6,-2);scene.add(rim);
  const glow=new THREE.PointLight('#40c6ff',25,8,2);glow.position.set(0,.55,0);scene.add(glow);
  // A local studio environment gives glass real reflections without external HDR files.
  const envScene=new THREE.Scene();envScene.background=new THREE.Color('#192a40');
  const room=new THREE.Mesh(new THREE.BoxGeometry(16,12,16),new THREE.MeshBasicMaterial({color:'#34516d',side:THREE.BackSide}));envScene.add(room);
  for(const [x,y,z,sx,sy,intensity] of [[-4,3,0,3,7,9],[4,4,2,2,6,6],[0,5,-3,6,2,4]]){
    const panel=new THREE.Mesh(new THREE.PlaneGeometry(sx,sy),new THREE.MeshBasicMaterial({color:new THREE.Color('#c6e9ff').multiplyScalar(intensity),side:THREE.DoubleSide}));panel.position.set(x,y,z);panel.lookAt(0,0,0);envScene.add(panel);
  }
  const pmrem=new THREE.PMREMGenerator(renderer);const environment=pmrem.fromScene(envScene,.04);scene.environment=environment.texture;pmrem.dispose();
  envScene.traverse(item=>{item.geometry?.dispose();if(item.material)item.material.dispose();});
  const tileGeometry=roundedBox(1.03,.25,1.03,.045);
  const tileMaterial=new THREE.MeshStandardMaterial({color:'#142e50',metalness:.65,roughness:.3});
  const tiles=[];
  for(let x=-5;x<=5;x++) for(let z=-5;z<=5;z++){
    if(Math.abs(x)<=1&&Math.abs(z)<=1)continue;
    const tile=new THREE.Mesh(tileGeometry,tileMaterial);tile.position.set(x*1.13,-.14,z*1.13);tile.receiveShadow=true;tile.castShadow=true;world.add(tile);tiles.push(tile);
  }
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:'#212121',roughness:.6,metalness:.15}));ground.rotation.x=-Math.PI/2;ground.position.y=-.42;ground.receiveShadow=true;world.add(ground);
  const pedestal=new THREE.Mesh(roundedBox(2.95,.23,2.95,.08),new THREE.MeshStandardMaterial({color:'#13375a',metalness:.7,roughness:.25}));pedestal.position.y=-.05;pedestal.receiveShadow=true;world.add(pedestal);
  const lightBase=new THREE.Mesh(roundedBox(2.6,.035,2.6,.06),new THREE.MeshStandardMaterial({color:'#14afff',emissive:'#0baaff',emissiveIntensity:2.4,roughness:.1}));lightBase.position.y=.08;world.add(lightBase);
  const top=new THREE.Mesh(roundedBox(2.48,.08,2.48,.04),tileMaterial);top.position.y=.14;top.receiveShadow=true;world.add(top);
  const object=new THREE.Group();object.position.y=1.8;world.add(object);
  const material=new THREE.MeshPhysicalMaterial({color:config.color,metalness:0,roughness:.08,transmission:.86,thickness:1.3,ior:1.46,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:1.8,side:THREE.FrontSide});
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(),material);mesh.castShadow=true;object.add(mesh);
  const core=new THREE.Mesh(new THREE.OctahedronGeometry(.43),new THREE.MeshPhysicalMaterial({color:'#64d9ff',metalness:.2,roughness:.13,emissive:'#087bff',emissiveIntensity:.6,clearcoat:1}));object.add(core);
  let geometrySignature='';
  function rebuild(){
    const signature=[config.shape,config.thickness,config.curvature,config.twist].join('|');if(signature===geometrySignature)return;geometrySignature=signature;
    let geometry;
    if(config.shape==='sphere'){geometry=new THREE.SphereGeometry(1.05,48,32);geometry.scale(1,1,config.thickness);}
    else if(config.shape==='ring'){geometry=new THREE.TorusGeometry(.86,.12+config.curvature*.7,20,96);geometry.scale(1,1,config.thickness);}
    else geometry=roundedBox(1.65,1.65,1.65*config.thickness,config.curvature);
    const p=geometry.attributes.position,angle=config.twist*Math.PI/180;
    for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=y/1.65*angle;p.setXYZ(i,x*Math.cos(a)-z*Math.sin(a),y,x*Math.sin(a)+z*Math.cos(a));}
    geometry.computeVertexNormals();mesh.geometry.dispose();mesh.geometry=geometry;
    core.visible=config.shape!=='ring';
  }
  function update(next){
    config={...next};rebuild();material.color.set(config.color);material.thickness=config.thickness*1.3;
    material.metalness=config.material==='metal'?.94:config.material==='ceramic'?.08:0;
    material.roughness=config.material==='frosted'?.32:config.material==='ceramic'?.26:config.material==='metal'?.18:.065;
    const glass=['glass','frosted'].includes(config.material);
    material.transmission=glass?config.transparency:0;
    material.transparent=!glass&&config.transparency>.01;
    material.opacity=glass?1:1-config.transparency*.8;
    material.needsUpdate=true;
    key.intensity=4*config.light;ambient.intensity=1.3*config.light;rim.intensity=32*config.light;glow.intensity=22*config.light;lightBase.material.emissiveIntensity=1.8*config.light;
    renderer.render(scene,camera);schedule();
  }
  const pointer=new THREE.Vector2(),smooth=new THREE.Vector2();
  function move(event){if(paused)return;const r=container.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width-.5,(event.clientY-r.top)/r.height-.5);schedule();}
  function leave(){pointer.set(0,0);schedule();}
  container.addEventListener('pointermove',move);container.addEventListener('pointerleave',leave);
  function resize(){const r=container.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;
    const distance=camera.aspect>1.6?12.5:camera.aspect<.8?18.8:16.2;camera.position.set(8.5,8.7,10.5).normalize().multiplyScalar(distance);camera.lookAt(0,.6,0);camera.updateProjectionMatrix();renderer.render(scene,camera);}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(container);
  function tick(now){frame=0;if(destroyed)return;const dt=Math.min((now-last)/1000||0,.05);last=now;
    if(!paused){phase+=dt*config.speed;smooth.lerp(pointer,.035);object.rotation.y=.22+Math.sin(phase*.52)*.35+smooth.x*.3;object.rotation.z=Math.sin(phase*.37)*.055;object.position.y=1.85+Math.sin(phase*1.1)*.13;core.rotation.y=phase*.25;core.rotation.z=.15;world.rotation.y=smooth.x*.06;
      for(const tile of tiles){const d=Math.hypot(tile.position.x,tile.position.z);tile.position.y=-.14+Math.sin(phase*1.4-d*.7)*.025;}
    }
    renderer.render(scene,camera);if(!paused&&inView&&!document.hidden&&config.speed>0)schedule();
  }
  function schedule(){if(!frame&&!destroyed&&inView&&!document.hidden)frame=requestAnimationFrame(tick);}
  const intersection=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView){last=performance.now();schedule();}else{cancelAnimationFrame(frame);frame=0;}});intersection.observe(container);
  function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;}else{last=performance.now();schedule();}}
  document.addEventListener('visibilitychange',visibility);
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);frame=0;document.querySelector('#scene-fallback').classList.remove('ready');});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{document.querySelector('#scene-fallback').classList.add('ready');resize();schedule();});
  function destroy(){destroyed=true;cancelAnimationFrame(frame);resizeObserver.disconnect();intersection.disconnect();document.removeEventListener('visibilitychange',visibility);container.removeEventListener('pointermove',move);container.removeEventListener('pointerleave',leave);scene.traverse(item=>{item.geometry?.dispose();if(item.material)item.material.dispose();});environment.dispose();renderer.dispose();}
  addEventListener('pagehide',event=>{if(!event.persisted)destroy();});
  update(config);resize();
  return {update,setPaused(value){paused=value;if(value){pointer.set(0,0);smooth.set(0,0);world.rotation.y=0;}last=performance.now();schedule();}};
}

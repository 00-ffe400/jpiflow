import * as THREE from '../vendor/three.module.js';
import {createGlassLoops} from './glass-loops.js';
import {createGlassStack,createDepthLens} from './glass-stack.js';
import {loadBlenderSource,createBlenderModels} from './blender-model.js';
import {dipProgress,applyAnimatedTranslation} from './scene-motion.js';
import {createGlassComposite} from './glass-composite.js';
import {createPinOrbits} from './pin-orbits.js';
const rad=THREE.MathUtils.degToRad,clamp=THREE.MathUtils.clamp;

// Analytic normals join the six rounded box faces without visible seams.
function box(w,h,d,r,segments=8,chamfer=false,crown=0){
  r=Math.min(r,Math.min(w,h,d)*.48);
  const g=new THREE.BoxGeometry(w,h,d,segments,segments,segments),p=g.attributes.position,n=g.attributes.normal;
  const inner=new THREE.Vector3(w/2-r,h/2-r,d/2-r),v=new THREE.Vector3(),q=new THREE.Vector3(),normal=new THREE.Vector3();
  for(let i=0;i<p.count;i++){
    v.fromBufferAttribute(p,i);q.set(clamp(v.x,-inner.x,inner.x),clamp(v.y,-inner.y,inner.y),clamp(v.z,-inner.z,inner.z));normal.copy(v).sub(q);
    const divisor=chamfer?Math.abs(normal.x)+Math.abs(normal.y)+Math.abs(normal.z):normal.length();v.copy(q).addScaledVector(normal,r/Math.max(divisor,.00001));normal.normalize();
    if(crown&&v.y>0){const xn=v.x/(w/2),zn=v.z/(d/2),weight=clamp(v.y/(h/2),0,1);v.y+=crown*(1-xn*xn)*(1-zn*zn)*weight;normal.x+=crown*2*xn/(w/2)*(1-zn*zn)*weight;normal.z+=crown*2*zn/(d/2)*(1-xn*xn)*weight;normal.normalize();}
    p.setXYZ(i,v.x,v.y,v.z);n.setXYZ(i,normal.x,normal.y,normal.z);
  }return g;
}
function disposeGroup(group){
  const gs=new Set(),ms=new Set();group.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>ms.add(m));});
  for(const g of gs)g.dispose();for(const m of ms)if(!m.userData.shared){for(const texture of [m.map,m.alphaMap])if(texture?.userData.sceneOwned)texture.dispose();m.dispose();}group.clear();
}
function random(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

export async function createScene(container,initial,{onCamera=()=>{},onSelection=()=>{},onStats=()=>{}}={}){
  const blenderSource=await loadBlenderSource();
  let state=structuredClone(initial),raf=0,last=0,disposed=false,inView=true,externalPause=false,contextLost=false,settleUntil=0;
  const usesBlender=()=>state.model==='glassStack'&&state.geometry.source==='blend261101';
  const isDip=id=>id==='sphere'&&usesBlender()&&state.sphere.motion.type==='dip';
  const dipAxis=new THREE.Vector3(),slabRotation=new THREE.Euler();
  const clayPreview=()=>state.model==='loops'&&state.loops.preview==='clay';
  const pinIds=['pinCore','pinRings'];
  const stackIds=['sphere','slabs','rings'];
  const keys={},clocks={tiles:0,pedestal:0,crystal:0,loops:0,sphere:0,slabs:0,rings:0},phases={tiles:0,pedestal:0,crystal:0,loops:0,pulse:0,sphere:0,slabs:0,rings:0},spins={pedestal:0,x:0,y:0,z:0,core:0,loopX:0,loopY:0,loopZ:0};
  const pinSpin=Object.fromEntries(pinIds.map(id=>[id,{x:0,y:0,z:0}]));
  for(const id of pinIds){clocks[id]=0;phases[id]=0;}
  let environmentTimer,environmentTarget,cameraProfile='auto',interaction='camera',selection=new Set(),hoverId=null;
  const pointer=new THREE.Vector2(),parallax=new THREE.Vector2(),dummy=new THREE.Object3D(),tempColor=new THREE.Color(),highlight=new THREE.Color('#7be6ff');
  const motionQuery=matchMedia('(prefers-reduced-motion: reduce)'),targetRotation=new THREE.Quaternion(),targetEuler=new THREE.Euler(),lookPosition=new THREE.Vector3();let cameraInitialized=false;
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFShadowMap;container.appendChild(renderer.domElement);
  const scene=new THREE.Scene(),world=new THREE.Group();scene.add(world);
  const tileRoot=new THREE.Group(),pedRoot=new THREE.Group(),crystalRoot=new THREE.Group(),coreRoot=new THREE.Group(),loopRoot=new THREE.Group();world.add(tileRoot,pedRoot,crystalRoot,coreRoot,loopRoot);
  const stackRoots={sphere:new THREE.Group(),slabs:new THREE.Group(),rings:new THREE.Group()};world.add(...Object.values(stackRoots));
  const pinRoots=Object.fromEntries(pinIds.map(id=>[id,new THREE.Group()]));world.add(...Object.values(pinRoots));
  const glassComposite=createGlassComposite(renderer),lens=createDepthLens(renderer),focusPoint=new THREE.Vector3();
  const perspective=new THREE.PerspectiveCamera(36,1,.1,200),orthographic=new THREE.OrthographicCamera(-10,10,10,-10,.1,200);let camera=perspective;
  const mats={};for(const id of ['tiles','pedestal','crystal','loops',...stackIds,...pinIds]){mats[id]=new THREE.MeshPhysicalMaterial();mats[id].userData.shared=true;}
  mats.slabEdge=new THREE.MeshPhysicalMaterial();mats.slabEdge.userData.shared=true;
  mats.slabSide=new THREE.MeshPhysicalMaterial();mats.slabSide.userData.shared=true;
  const coreMat=new THREE.MeshPhysicalMaterial({roughness:.12,metalness:.08,clearcoat:1}),edgeMat=new THREE.MeshStandardMaterial({roughness:.18});coreMat.userData.shared=edgeMat.userData.shared=true;
  const groundMat=new THREE.MeshStandardMaterial({metalness:.25}),ground=new THREE.Mesh(new THREE.PlaneGeometry(180,180),groundMat);ground.rotation.x=-Math.PI/2;ground.position.y=-.4;ground.receiveShadow=true;world.add(ground);
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;
  const ctx=shadowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,4,64,64,64);gradient.addColorStop(0,'rgba(0,0,0,.8)');gradient.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  const shadowTexture=new THREE.CanvasTexture(shadowCanvas),contactMat=new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false});
  const contact=new THREE.Mesh(new THREE.PlaneGeometry(6,6),contactMat);contact.rotation.x=-Math.PI/2;contact.position.y=-.385;world.add(contact);
  const lights={};
  function syncLights(){for(const [id,cfg]of Object.entries(state.lights)){
    const old=lights[id];if(old&&(cfg.type==='point'?old.isPointLight:cfg.type==='directional'?old.isDirectionalLight:old.isAmbientLight))continue;
    if(old){scene.remove(old);if(old.target)scene.remove(old.target);old.shadow?.map?.dispose();old.dispose?.();}
    const l=cfg.type==='directional'?new THREE.DirectionalLight():cfg.type==='point'?new THREE.PointLight(undefined,1,30,2):new THREE.AmbientLight();lights[id]=l;scene.add(l);if(l.target)scene.add(l.target);
    if(l.shadow){l.shadow.mapSize.set(1024,1024);l.shadow.normalBias=.035;l.shadow.bias=-.00015;if(l.isDirectionalLight)Object.assign(l.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:.1,far:70});}
  }
  }
  syncLights();
  let tilesMesh,tileData=[],crystalMesh,loopFitRadius=5;
  function environment(){
    const pin=state.model==='pinOrbit',stack=state.model==='glassStack',glass=state.model==='loops',clay=clayPreview();const e=new THREE.Scene();let softMap;e.background=new THREE.Color(pin?'#bccbdb':stack?'#6f7078':clay?'#777777':glass?'#0b2941':'#20344b');
    if(usesBlender()){
      e.background=null;e.add(new THREE.Mesh(new THREE.SphereGeometry(12,48,32),new THREE.MeshBasicMaterial({map:blenderSource.hdr,side:THREE.BackSide,toneMapped:false})));
    }else{
    e.add(new THREE.Mesh(new THREE.BoxGeometry(20,16,20),new THREE.MeshBasicMaterial({color:pin?'#bfcddd':stack?'#9a98a2':clay?'#777777':glass?'#092237':'#263a52',side:THREE.BackSide})));
    for(const [x,y,z,w,h,power]of [[-5,4,0,2,7,3.5],[4,4,3,1.4,5,2],[0,7,-4,5,2,2.6],[0,1,-6,4,2,1.4],[0,-4,0,4,2,.7]]){
      const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(clay||stack||pin?'#ffffff':'#b9e4ff').multiplyScalar(power),side:THREE.DoubleSide}));p.position.set(x,y,z);p.lookAt(0,0,0);e.add(p);
    }
    const softCanvas=document.createElement('canvas');softCanvas.width=softCanvas.height=128;const softCtx=softCanvas.getContext('2d'),softGradient=softCtx.createRadialGradient(64,64,5,64,64,68);softGradient.addColorStop(0,clay||stack||pin?'#ffffff':'#d8efff');softGradient.addColorStop(.35,clay||stack||pin?'#999999':'#659acb');softGradient.addColorStop(1,clay||stack||pin?'#111111':'#06182c');softCtx.fillStyle=softGradient;softCtx.fillRect(0,0,128,128);
    softMap=new THREE.CanvasTexture(softCanvas);softMap.colorSpace=THREE.SRGBColorSpace;const softPanel=new THREE.Mesh(new THREE.PlaneGeometry(9,8),new THREE.MeshBasicMaterial({map:softMap,color:new THREE.Color().setScalar(2.3),side:THREE.DoubleSide}));softPanel.position.set(-5,7,-6);softPanel.lookAt(0,0,0);e.add(softPanel);
    if(stack){
      for(const [x,y,z,w,h,color]of [[-7,1,0,3,12,'#18222d'],[0,1,8,12,2,'#222a36'],[8,2,-3,3,12,'#343c49'],[0,-7,0,16,16,'#7b7b85']]){
        const panel=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide}));panel.position.set(x,y,z);panel.lookAt(0,0,0);e.add(panel);
      }
    }
    }
    const pmrem=new THREE.PMREMGenerator(renderer),next=pmrem.fromScene(e,(clay?.12:state.environment.blur)*.06);pmrem.dispose();disposeGroup(e);softMap?.dispose();
    const previous=environmentTarget;environmentTarget=next;scene.environment=next.texture;
    for(const m of [...Object.values(mats),coreMat]){m.envMap=next.texture;m.needsUpdate=true;}previous?.dispose();schedule();
  }
  function buildTiles(){
    const t=state.tiles,key=JSON.stringify([t.rows,t.columns,t.width,t.depth,t.thickness,t.crown,t.gapX,t.gapZ,t.roundness,t.segments,t.stagger,t.holeX,t.holeZ,t.seed]);if(key===keys.tiles)return;keys.tiles=key;
    if(tilesMesh){tileRoot.remove(tilesMesh);tilesMesh.geometry.dispose();tilesMesh.dispose();}
    const rand=random(t.seed);tileData=[];
    for(let row=0;row<t.rows;row++)for(let column=0;column<t.columns;column++){
      const ix=column-(t.columns-1)/2,iz=row-(t.rows-1)/2;if(Math.abs(ix)<t.holeX/2&&Math.abs(iz)<t.holeZ/2)continue;
      tileData.push({id:`${row}:${column}`,row,column,x:ix*(t.width+t.gapX)+(t.stagger&&row%2?(t.width+t.gapX)/2:0),z:iz*(t.depth+t.gapZ),height:rand()*2-1,rotation:rand()*2-1,scale:rand()*2-1,phase:rand()*Math.PI*2});
    }
    tilesMesh=new THREE.InstancedMesh(box(t.width,t.thickness,t.depth,t.roundness,t.segments,false,t.crown),mats.tiles,tileData.length);tilesMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);tilesMesh.frustumCulled=false;tilesMesh.castShadow=tilesMesh.receiveShadow=true;tileRoot.add(tilesMesh);
    selection=new Set([...selection].filter(id=>tileData.some(t=>t.id===id)));onSelection([...selection]);onStats({tiles:tileData.length,instanced:true});
  }
  function buildLoops(){
    const c=state.loops,key=JSON.stringify([c.count,c.radiusX,c.radiusY,c.width,c.depth,c.bend,c.twist,c.spacing,c.segments,c.radialSegments,c.silhouette,c.fullness,c.taper]);if(key!==keys.loops){keys.loops=key;disposeGroup(loopRoot);loopRoot.add(...createGlassLoops(c,mats.loops));loopFitRadius=Math.max(...loopRoot.children.map(mesh=>mesh.geometry.boundingSphere.center.length()+mesh.geometry.boundingSphere.radius+mesh.position.length()));}
  }
  function buildStack(){
    const key=JSON.stringify([state.geometry.source,state.sphere.radius,state.sphere.smooth,state.sphere.segments,...['width','depth','thickness','bevel','count','spacing','offsetX','offsetZ','fan'].map(k=>state.slabs[k]),state.slabs.smoothCuts,...['radius','tube','count','spacing','offsetX','offsetZ','tiltX','tiltZ'].map(k=>state.rings[k])]);
    if(keys.stack===key)return;keys.stack=key;
    for(const root of Object.values(stackRoots))disposeGroup(root);
    const fresh=usesBlender()?createBlenderModels(state,mats,blenderSource):createGlassStack(state,mats,box);for(const id of stackIds){const children=fresh[id].children.slice();if(children.length)stackRoots[id].add(...children);}
  }
  function buildPin(){
    const c=state.pinCore,r=state.pinRings;
    const key=JSON.stringify([c.shape,c.width,c.height,c.depth,c.roundness,c.rimRoundness,r.count,r.radiusX,r.radiusY,r.width,r.depth,r.twist,r.fan,r.segments]);
    if(keys.pin===key)return;keys.pin=key;for(const root of Object.values(pinRoots))disposeGroup(root);
    const fresh=createPinOrbits(state,mats,box);for(const id of pinIds){const children=fresh[id].children.slice();if(children.length)pinRoots[id].add(...children);}
  }
  function pedestalSize(){const p=state.pedestal,t=state.tiles,c=state.crystal;return {width:p.autoFit?Math.max(.4,t.holeX*(t.width+t.gapX)-t.gapX):p.linkCrystal?c.width+.9:p.width,depth:p.autoFit?Math.max(.4,t.holeZ*(t.depth+t.gapZ)-t.gapZ):p.linkCrystal?c.depth+.9:p.depth};}
  function buildPedestal(){
    const p=state.pedestal,size=pedestalSize(),key=JSON.stringify([size,p.height,p.layers,p.shrink,p.gap,p.roundness,p.segments,p.edgeWidth]);if(key===keys.pedestal)return;keys.pedestal=key;disposeGroup(pedRoot);
    for(let i=0;i<p.layers;i++){
      const factor=Math.max(.3,1-i*p.shrink),height=p.height/p.layers,w=size.width*factor,d=size.depth*factor;
      const slab=new THREE.Mesh(box(w,height,d,p.roundness,p.segments),mats.pedestal);slab.position.y=i*(height+p.gap);slab.castShadow=slab.receiveShadow=true;pedRoot.add(slab);
      const shape=new THREE.Shape(),r=Math.min(p.roundness,w/8,d/8),x=w/2,z=d/2;
      shape.moveTo(-x+r,-z);shape.lineTo(x-r,-z);shape.quadraticCurveTo(x,-z,x,-z+r);shape.lineTo(x,z-r);shape.quadraticCurveTo(x,z,x-r,z);shape.lineTo(-x+r,z);shape.quadraticCurveTo(-x,z,-x,z-r);shape.lineTo(-x,-z+r);shape.quadraticCurveTo(-x,-z,-x+r,-z);
      const points=shape.getPoints(64).map(v=>new THREE.Vector3(v.x,0,v.y));points.push(points[0].clone());const curve=new THREE.CatmullRomCurve3(points,false,'centripetal');
      const edge=new THREE.Mesh(new THREE.TubeGeometry(curve,96,p.edgeWidth,6,false),edgeMat);edge.position.y=slab.position.y+height/2+.004;edge.userData.edge=true;pedRoot.add(edge);
    }
  }
  function buildCrystal(){
    const c=state.crystal,key=JSON.stringify([c.shape,c.width,c.height,c.depth,c.roundness,c.bevel,c.segments,c.twist]);
    if(key!==keys.crystal){
      keys.crystal=key;disposeGroup(crystalRoot);const g=box(c.width,c.height,c.depth,c.shape==='chamfer'?c.bevel:c.roundness,c.segments,c.shape==='chamfer');
      if(c.twist){const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=y/c.height*rad(c.twist);p.setXYZ(i,x*Math.cos(a)-z*Math.sin(a),y,x*Math.sin(a)+z*Math.cos(a));}g.computeVertexNormals();}
      crystalMesh=new THREE.Mesh(g,mats.crystal);crystalMesh.castShadow=false;crystalRoot.add(crystalMesh);
    }
    const q=c.core,coreKey=JSON.stringify([q.shape,q.count,q.size,q.spacing]);if(coreKey!==keys.core){
      keys.core=coreKey;disposeGroup(coreRoot);for(let i=0;i<q.count;i++){
        const g=q.shape==='cube'?box(q.size*1.4,q.size*1.4,q.size*1.4,.015,3):new THREE.OctahedronGeometry(q.size,0);if(q.shape==='diamond')g.scale(.85,1.5,.85);
        const m=new THREE.Mesh(g,coreMat);m.position.x=(i-(q.count-1)/2)*q.spacing;m.castShadow=true;coreRoot.add(m);
      }
    }
  }
  function updateMaterials(){
    for(const [id,m]of Object.entries(mats).filter(([id])=>!['slabEdge','slabSide'].includes(id))){
      const stored=state[id].material,v=id==='loops'&&clayPreview()?{...stored,color:'#9ca3ab',roughness:.57,metalness:0,transmission:0,opacity:1,reflection:.3,coat:0,emissive:'#000000',emission:0}:stored;m.color.set(id==='tiles'?'#ffffff':v.color);m.roughness=v.roughness;m.metalness=v.metalness;m.transmission=v.transmission;m.opacity=v.opacity;m.transparent=v.opacity<1;m.depthWrite=v.opacity>=1;
      m.specularIntensity=id==='loops'&&!clayPreview()?1.7:1;m.ior=v.ior;m.thickness=v.opticalThickness;m.attenuationColor.set(v.attenuationColor);m.attenuationDistance=v.attenuationDistance;m.clearcoat=v.coat;m.clearcoatRoughness=v.coatRoughness;m.emissive.set(v.emissive);m.emissiveIntensity=v.emission;
      m.envMapIntensity=v.reflection*(clayPreview()?1:state.environment.intensity);m.envMapRotation.set(0,rad(clayPreview()?0:state.environment.rotation),0);m.flatShading=id==='crystal'&&state.crystal.flat;m.side=usesBlender()&&id==='slabs'?THREE.DoubleSide:THREE.FrontSide;
      m.normalMap=id==='slabs'&&usesBlender()?blenderSource.normal:null;m.normalScale.setScalar(id==='slabs'?state.slabs.normalStrength:1);
      const shaderKey=JSON.stringify([Boolean(m.normalMap),m.transmission>0,m.transparent,m.flatShading,m.clearcoat>0,m.side]);if(m.userData.shaderKey!==shaderKey){m.userData.shaderKey=shaderKey;m.needsUpdate=true;}
    }
    const edge=mats.slabEdge,v=state.slabs.material;edge.copy(mats.slabs);edge.userData.shared=true;edge.color.set(state.slabs.edgeColor);edge.transmission=state.slabs.edgeTransmission;if(usesBlender()){edge.opacity=state.slabs.edgeOpacity;edge.transparent=edge.opacity<1;edge.depthWrite=false;}edge.roughness=Math.max(.06,v.roughness);edge.clearcoat=0;edge.envMapIntensity=v.reflection*(usesBlender()&&state.slabs.optics==='layered'?1:.45)*state.environment.intensity;
    const side=mats.slabSide;side.copy(edge);side.userData.shared=true;side.color.set(state.slabs.sideColor);side.transmission=state.slabs.sideTransmission;if(usesBlender()){side.opacity=state.slabs.sideOpacity;side.transparent=side.opacity<1;side.depthWrite=false;}
    if(usesBlender()&&state.slabs.optics==='layered'){edge.thickness=state.slabs.edgeOpticalThickness;edge.attenuationColor.set(state.slabs.edgeAbsorptionColor);edge.attenuationDistance=state.slabs.edgeAbsorptionDistance;side.thickness=state.slabs.edgeOpticalThickness*.3;side.attenuationColor.set(state.slabs.edgeAbsorptionColor);side.attenuationDistance=state.slabs.edgeAbsorptionDistance*2;}
    for(const id of ['slabEdge','slabSide']){const m=mats[id],signature=JSON.stringify([Boolean(m.normalMap),m.transmission>0,m.transparent,m.clearcoat>0,m.side]);if(keys[id+'Shader']!==signature){keys[id+'Shader']=signature;m.needsUpdate=true;}}
    const q=state.crystal.core;coreMat.color.set(q.color);coreMat.emissive.set(q.color);coreMat.opacity=q.opacity;coreMat.transparent=q.opacity<1;coreMat.emissiveIntensity=q.emission;coreMat.envMapIntensity=state.environment.intensity;
    edgeMat.color.set(state.pedestal.edgeColor);edgeMat.emissive.set(state.pedestal.edgeColor);edgeMat.emissiveIntensity=state.pedestal.edgeEmission;
  }
  let dimensions={width:1,height:1},cameraDirty=true,backgroundTexture,backgroundKey='';
  const mobileView=()=>(innerWidth<=1023&&!document.body.classList.contains('scene-only'))||document.body.classList.contains('studio-mobile-preview');
  function activeCameraKey(){return cameraProfile==='auto'?(mobileView()&&state.mobile.enabled?'mobileCamera':'camera'):cameraProfile;}
  function cameraUpdate(dt=.016){
    const cfg=state[activeCameraKey()],aspect=dimensions.width/dimensions.height;
    const nextCamera=cfg.type==='orthographic'?orthographic:perspective;if(nextCamera!==camera){nextCamera.position.copy(camera.position);nextCamera.quaternion.copy(camera.quaternion);}camera=nextCamera;
    const extent=Math.max(state.tiles.columns*(state.tiles.width+state.tiles.gapX),state.tiles.rows*(state.tiles.depth+state.tiles.gapZ))/2*state.tiles.scale+Math.max(Math.abs(state.tiles.x),Math.abs(state.tiles.z));
    let radius=(state.model==='pinOrbit'?3.1:state.model==='glassStack'?8:state.model==='loops'?(cfg.fit==='fit'?loopFitRadius:Math.hypot(state.loops.radiusX,state.loops.radiusY))*state.loops.scale:cfg.fit==='fit'?Math.hypot(extent,extent):Math.max(state.crystal.height+state.crystal.floatGap,2.5))*state.scene.scale;
    if(state.model==='glassStack'&&cfg.fit==='fit'){world.updateMatrixWorld(true);const bounds=new THREE.Box3();for(const root of Object.values(stackRoots))if(root.visible)bounds.union(new THREE.Box3().setFromObject(root));if(!bounds.isEmpty()){const sphere=bounds.getBoundingSphere(new THREE.Sphere());radius=sphere.radius+sphere.center.distanceTo(new THREE.Vector3(cfg.targetX,cfg.targetY,cfg.targetZ));}}
    const half=rad(cfg.fov/2),minFov=Math.atan(Math.tan(half)*Math.min(1,aspect)),safe=radius/Math.sin(minFov)*(1+cfg.padding);
    const distance=cfg.fit==='fit'?Math.max(cfg.distance,safe):cfg.distance*(1+cfg.padding)*(state.model==='glassStack'?1:Math.max(1,.85/aspect));
    const goal=new THREE.Vector3(Math.sin(rad(cfg.azimuth))*Math.cos(rad(cfg.elevation)),Math.sin(rad(cfg.elevation)),Math.cos(rad(cfg.azimuth))*Math.cos(rad(cfg.elevation))).multiplyScalar(distance).add(new THREE.Vector3(cfg.targetX,cfg.targetY,cfg.targetZ));
    const a=!cameraInitialized||reduced()||performance.now()>=settleUntil?1:1-Math.exp(-dt/Math.max(.03,state.motion.smoothness));camera.position.lerp(goal,a);lookPosition.lerp(new THREE.Vector3(cfg.targetX,cfg.targetY,cfg.targetZ),a);camera.lookAt(lookPosition);cameraInitialized=true;
    if(camera===perspective){camera.aspect=aspect;camera.fov=cfg.fov;}else{const h=cfg.fit==='fit'?radius*2*(1+cfg.padding)/Math.min(1,aspect):distance*.5;Object.assign(camera,{left:-h*aspect/2,right:h*aspect/2,top:h/2,bottom:-h/2,zoom:cfg.zoom});}
    camera.far=Math.max(200,distance+radius*5);camera.updateProjectionMatrix();cameraDirty=false;
  }
  function quality(){
    const q=state.render.quality==='auto'?(mobileView()?'low':'medium'):state.render.quality;renderer.setPixelRatio(Math.min(devicePixelRatio,{low:1,medium:1.5,high:2}[q]));renderer.transmissionResolutionScale={low:.5,medium:.75,high:1}[q];
    lens.setSamples(q==='low'?0:4);glassComposite.setSamples(q==='low'?0:q==='high'?4:2);
    const size=q==='high'?2048:q==='low'?512:1024;for(const l of Object.values(lights))if(l.shadow&&l.shadow.mapSize.x!==size){l.shadow.mapSize.set(size,size);l.shadow.map?.dispose();l.shadow.map=null;}renderer.setSize(dimensions.width,dimensions.height,false);
  }
  function update(next){
    const previous=state;state=structuredClone(next);buildTiles();buildPedestal();buildCrystal();if(state.model==='loops')buildLoops();if(state.model==='glassStack')buildStack();if(state.model==='pinOrbit')buildPin();updateMaterials();syncLights();onStats(state.model==='pinOrbit'?{model:'pinOrbit',rings:state.pinRings.count}:state.model==='glassStack'?{model:'glassStack',source:state.geometry.source,slabs:state.slabs.count,rings:state.rings.count}:state.model==='loops'?{model:'loops',count:state.loops.count,preview:state.loops.preview}:{model:'tiles',tiles:tileData.length,instanced:true});
    for(const [id,l]of Object.entries(lights)){
      const stored=state.lights[id],cfg=clayPreview()?{...stored,enabled:id!=='base',color:'#ffffff',intensity:({key:3.3,fill:1,rim:6,ambient:.55,base:0})[id],x:({key:-3,fill:5,rim:-2,ambient:0,base:0})[id],y:({key:8,fill:4,rim:3,ambient:0,base:.5})[id],z:({key:4,fill:2,rim:-3,ambient:0,base:0})[id],targetX:0,targetY:0,targetZ:0,shadow:id==='key'}:stored;l.visible=cfg.enabled;l.color.set(cfg.color);l.intensity=cfg.intensity;l.position.set(cfg.x,cfg.y,cfg.z);if(l.target)l.target.position.set(cfg.targetX,cfg.targetY,cfg.targetZ);
      if(l.shadow){l.castShadow=cfg.shadow;l.shadow.radius=state.background.shadowSoftness;
        if(l.isDirectionalLight){const e=(Math.max(state.tiles.rows*(state.tiles.depth+state.tiles.gapZ),state.tiles.columns*(state.tiles.width+state.tiles.gapX))*state.tiles.scale/2+Math.abs(state.tiles.x)+Math.abs(state.tiles.z)+4)*state.scene.scale+Math.abs(state.scene.x)+Math.abs(state.scene.z);Object.assign(l.shadow.camera,{left:-e,right:e,top:e,bottom:-e,far:Math.max(70,e*4)});l.shadow.camera.updateProjectionMatrix();}
      }
    }
    renderer.toneMappingExposure=clayPreview()?1:state.environment.exposure;
    const bg=clayPreview()?{...state.background,mode:'gradient',color:'#d3d9df',color2:'#f4f5f6',angle:140,ground:false,fog:false}:state.background;renderer.setClearColor(bg.color,bg.mode==='transparent'?0:1);container.style.background='transparent';
    const bgKey=JSON.stringify([bg.mode,bg.color,bg.color2,bg.angle]);
    if(bgKey!==backgroundKey){
      backgroundKey=bgKey;scene.background=null;backgroundTexture?.dispose();backgroundTexture=null;
      if(bg.mode==='gradient'){
        const canvas=document.createElement('canvas');canvas.width=canvas.height=512;const ctx=canvas.getContext('2d'),a=rad(bg.angle),dx=Math.sin(a)*362,dy=-Math.cos(a)*362;
        const gradient=ctx.createLinearGradient(256-dx,256-dy,256+dx,256+dy);gradient.addColorStop(0,bg.color);gradient.addColorStop(1,bg.color2);ctx.fillStyle=gradient;ctx.fillRect(0,0,512,512);backgroundTexture=new THREE.CanvasTexture(canvas);backgroundTexture.colorSpace=THREE.SRGBColorSpace;scene.background=backgroundTexture;
      }
    }
    scene.fog=bg.fog?new THREE.Fog(bg.fogColor,bg.fogNear,Math.max(bg.fogNear+.1,bg.fogFar)):null;ground.visible=bg.ground;groundMat.color.set(bg.groundColor);groundMat.roughness=bg.groundRoughness;contact.visible=bg.ground;contactMat.opacity=bg.shadowOpacity;
    if(!environmentTarget)environment();else if(state.environment.blur!==previous.environment.blur||state.model!==previous.model||state.geometry.source!==previous.geometry.source||state.loops.preview!==previous.loops.preview){clearTimeout(environmentTimer);environmentTimer=setTimeout(environment,180);}
    if(state.render.quality!==previous.render.quality)quality();cameraDirty=true;schedule();
  }
  const motionOffsets=new WeakMap();let liveDipDepth=state.sphere.motion.depth;
  function pose(root,cfg,dt,offset=null){const a=externalPause||!cameraInitialized||performance.now()>=settleUntil?1:1-Math.exp(-dt/Math.max(.03,state.motion.smoothness));const base=new THREE.Vector3(cfg.x,cfg.y,cfg.z);if(offset){let previous=motionOffsets.get(root);if(!previous){previous=new THREE.Vector3();motionOffsets.set(root,previous);}applyAnimatedTranslation(root.position,previous,base,offset,a);}else root.position.lerp(base,a);root.scale.lerp(new THREE.Vector3(cfg.scale,cfg.scale,cfg.scale),a);root.visible=cfg.visible;return a;}
  function rotate(root,x,y,z,dt){targetEuler.set(rad(x),rad(y),rad(z));targetRotation.setFromEuler(targetEuler);root.quaternion.slerp(targetRotation,reduced()||!cameraInitialized||performance.now()>=settleUntil?1:1-Math.exp(-dt/Math.max(.03,state.motion.smoothness)));}
  function animateTiles(time,dt){
    const t=state.tiles,m=t.motion,angle=rad(m.direction);rotate(tileRoot,t.rx,t.ry,t.rz,dt);
    for(let i=0;i<tileData.length;i++){
      const tile=tileData[i],o=t.overrides[tile.id]||{},distance=Math.hypot(tile.x,tile.z),phase=phases.tiles*2*Math.PI+rad(m.phase),travel=tile.x*Math.cos(angle)+tile.z*Math.sin(angle);
      const wave=m.type==='wave'?Math.sin(phase-travel/m.wavelength*2*Math.PI):m.type==='ripple'?Math.sin(phase-distance/m.wavelength*2*Math.PI):m.type==='rise'?Math.sin(phase-(tile.row*t.columns+tile.column)*m.delay):Math.sin(phase+tile.phase);
      const motion=reduced()?0:wave*m.height,hover=tile.id===hoverId&&!reduced();tile.smoothMotion=THREE.MathUtils.lerp(tile.smoothMotion||0,motion,.14);dummy.position.set(tile.x+(o.x||0),-.14+distance*t.slope+tile.height*t.jitterHeight+(o.y||0)+tile.smoothMotion+(hover?state.motion.hoverLift:0),tile.z+(o.z||0));
      dummy.rotation.set(rad(o.rx||0),rad(tile.rotation*t.jitterRotation),rad(o.rz||0));dummy.scale.setScalar((o.scale??1)*(1+tile.scale*t.jitterScale)*(hover?state.motion.hoverScale:1));dummy.updateMatrix();tilesMesh.setMatrixAt(i,dummy.matrix);
      tempColor.set(o.color||t.material.color);if(selection.has(tile.id))tempColor.lerp(highlight,.55);else if(hover)tempColor.lerp(highlight,.2);tilesMesh.setColorAt(i,tempColor);
    }tilesMesh.instanceMatrix.needsUpdate=true;if(tilesMesh.instanceColor)tilesMesh.instanceColor.needsUpdate=true;
  }
  function reduced(){return externalPause||state.motion.reduced||motionQuery.matches;}
  function tick(now){
    raf=0;if(disposed||contextLost)return;const elapsed=Math.min((now-last)/1000||.016,.25),dt=Math.min(elapsed,.05);last=now;const stop=reduced()||state.motion.paused;
    for(const id of Object.keys(clocks)){
      if(state.motion.mode==='auto'){if(!stop&&!state[id].motion.paused){clocks[id]+=dt;phases[id]+=(isDip(id)?elapsed/state.sphere.motion.duration:dt)*state[id].motion.speed;}}
      else if(!reduced()&&!state[id].motion.paused){const progress=state.motion.mode==='scroll'?clamp((scrollY-state.motion.scrollStart)/Math.max(1,state.motion.scrollEnd-state.motion.scrollStart),0,1):state.motion.progress;clocks[id]=progress*20;phases[id]=isDip(id)?progress:clocks[id]*state[id].motion.speed;}
    }
    const depthBlend=reduced()?1:1-Math.exp(-elapsed/Math.max(.03,state.motion.smoothness));liveDipDepth=THREE.MathUtils.lerp(liveDipDepth,state.sphere.motion.depth,depthBlend);
    const mobile=mobileView()&&state.mobile.enabled;
    const a=pose(world,{...state.scene,x:state.scene.x+(mobile?state.mobile.x:0),y:state.scene.y+(mobile?state.mobile.y:0),z:state.scene.z+(mobile?state.mobile.z:0),scale:state.scene.scale*(mobile?state.mobile.scale:1)},dt);
    parallax.lerp(reduced()?new THREE.Vector2():pointer,a);world.rotation.set(rad(state.scene.rx)+parallax.y*state.motion.parallax*.12,rad(state.scene.ry)+parallax.x*state.motion.parallax*.18,rad(state.scene.rz));
    pose(tileRoot,state.tiles,dt);if(state.model==='tiles')animateTiles(clocks.tiles,dt);
    const p=state.pedestal,pm=p.motion,c=state.crystal,cm=c.motion,q=c.core;
    if(!stop&&!pm.paused&&state.motion.mode==='auto')spins.pedestal+=dt*pm.spin;
    if(!stop&&!cm.paused&&state.motion.mode==='auto'){spins.x+=dt*cm.spinX;spins.y+=dt*cm.spinY;spins.z+=dt*cm.spinZ;spins.core+=dt*cm.coreSpin;phases.pulse+=dt*cm.pulseSpeed;}
    if(state.motion.mode!=='auto'&&!reduced()){spins.pedestal=clocks.pedestal*pm.spin;spins.x=clocks.crystal*cm.spinX;spins.y=clocks.crystal*cm.spinY;spins.z=clocks.crystal*cm.spinZ;spins.core=clocks.crystal*cm.coreSpin;phases.pulse=clocks.crystal*cm.pulseSpeed;}
    const pFloat=reduced()?0:Math.sin(phases.pedestal*2)*pm.height,cFloat=reduced()?0:Math.sin(phases.crystal*2)*cm.height;
    pose(pedRoot,{...p,y:p.y+(pm.linkCrystal?cFloat:pFloat)},dt);rotate(pedRoot,p.rx,p.ry+spins.pedestal,p.rz,dt);for(const child of pedRoot.children)if(child.userData.edge)child.visible=p.edgeVisible;
    edgeMat.emissiveIntensity=p.edgeEmission*(1+(reduced()?0:Math.sin(phases.pedestal*2)*pm.pulse));
    const top=p.y+p.height-p.height/p.layers/2+(p.layers-1)*p.gap,centerY=top+c.height/2+c.floatGap+c.y;
    pose(crystalRoot,{...c,y:centerY+cFloat},dt);rotate(crystalRoot,c.rx+spins.x,c.ry+spins.y,c.rz+spins.z+(reduced()?0:Math.sin(phases.crystal)*cm.tilt),dt);crystalMesh.visible=c.outer;
    pose(coreRoot,{...c,x:c.x+q.x,y:centerY+q.y+(q.linked?cFloat:0)+(reduced()?0:Math.sin(phases.crystal*2+rad(cm.phase))*cm.coreFloat),z:c.z+q.z,visible:c.visible&&q.visible},dt);
    coreRoot.rotation.copy(q.linked?crystalRoot.rotation:new THREE.Euler(rad(c.rx),rad(c.ry),rad(c.rz)));coreRoot.rotateX(rad(q.rx));coreRoot.rotateY(rad(q.ry+spins.core));coreRoot.rotateZ(rad(q.rz));
    coreMat.emissiveIntensity=q.emission*(1+(reduced()?0:Math.sin(phases.pulse*2)*cm.pulseStrength));
    const l=state.loops,lm=l.motion;
    if(!stop&&!lm.paused&&state.motion.mode==='auto'){spins.loopX+=dt*lm.spinX;spins.loopY+=dt*lm.spinY;spins.loopZ+=dt*lm.spinZ;}
    if(state.motion.mode!=='auto'&&!reduced()){spins.loopX=clocks.loops*lm.spinX;spins.loopY=clocks.loops*lm.spinY;spins.loopZ=clocks.loops*lm.spinZ;}
    pose(loopRoot,{...l,y:l.y+(reduced()?0:Math.sin(phases.loops*2)*lm.height)},dt);rotate(loopRoot,l.rx+spins.loopX,l.ry+spins.loopY,l.rz+spins.loopZ+(reduced()?0:Math.sin(phases.loops)*lm.tilt),dt);
    loopRoot.visible=state.model==='loops'&&l.visible;if(state.model!=='tiles')tileRoot.visible=pedRoot.visible=crystalRoot.visible=coreRoot.visible=false;
    for(const id of stackIds){
      const cfg=state[id],m=cfg.motion,phase=phases[id]*Math.PI*2,root=stackRoots[id];
      const origin=usesBlender()?(id==='sphere'?blenderSource.spherePosition:id==='slabs'?blenderSource.platePosition:new THREE.Vector3()):new THREE.Vector3();
      dipAxis.set(0,0,0);
      if(isDip(id)&&!reduced()){slabRotation.set(rad(state.slabs.rx),rad(state.slabs.ry),rad(state.slabs.rz));dipAxis.fromArray(blenderSource.meta.plate.normal).normalize().applyEuler(slabRotation).multiplyScalar(dipProgress(phases[id])*liveDipDepth);}
      const floatY=isDip(id)||reduced()?0:Math.sin(phase)*m.height;
      dipAxis.y+=floatY;
      pose(root,{...cfg,x:cfg.x+origin.x,z:cfg.z+origin.z,y:cfg.y+origin.y},dt,dipAxis);
      rotate(root,cfg.rx+clocks[id]*m.spinX,cfg.ry+clocks[id]*m.spinY,cfg.rz+clocks[id]*m.spinZ,dt);
      root.visible=state.model==='glassStack'&&cfg.visible&&(!usesBlender()||id!=='rings');
    }
    for(const id of pinIds){
      const cfg=state[id],m=cfg.motion,root=pinRoots[id],spin=pinSpin[id];
      // Integrate angular velocity so editing a speed never jumps the pose.
      for(const axis of ['x','y','z']){
        if(state.motion.mode==='auto'){if(!stop&&!m.paused)spin[axis]+=dt*m['spin'+axis.toUpperCase()];}
        else if(!reduced()&&!m.paused)spin[axis]=clocks[id]*m['spin'+axis.toUpperCase()];
      }
      dipAxis.set(0,reduced()?0:Math.sin(phases[id]*Math.PI*2)*m.height,0);pose(root,cfg,dt,dipAxis);
      rotate(root,cfg.rx+spin.x,cfg.ry+spin.y,cfg.rz+spin.z,dt);root.visible=state.model==='pinOrbit'&&cfg.visible;
    }
    const autoActive=state.model==='pinOrbit'?pinIds.some(id=>{const m=state[id].motion;return !m.paused&&(m.height*m.speed!==0||m.spinX!==0||m.spinY!==0||m.spinZ!==0);}):state.model==='glassStack'?stackIds.some(id=>{const m=state[id].motion;return !m.paused&&((isDip(id)?m.depth:m.height)*m.speed!==0||m.spinX!==0||m.spinY!==0||m.spinZ!==0);}):state.model==='loops'?!lm.paused&&(lm.height*lm.speed!==0||lm.spinX!==0||lm.spinY!==0||lm.spinZ!==0||lm.tilt*lm.speed!==0):(!state.tiles.motion.paused&&state.tiles.motion.speed>0&&state.tiles.motion.height>0)||(!pm.paused&&(pm.height*pm.speed!==0||pm.spin!==0||pm.pulse*pm.speed!==0))||(!cm.paused&&(cm.height*cm.speed!==0||cm.spinX!==0||cm.spinY!==0||cm.spinZ!==0||cm.tilt*cm.speed!==0||cm.coreSpin!==0||cm.coreFloat*cm.speed!==0||cm.pulseSpeed*cm.pulseStrength!==0));
    cameraUpdate(dt);renderFrame();if((!stop&&state.motion.mode==='auto'&&autoActive)||now<settleUntil)schedule();
  }
  function renderFrame(){
    if(state.model==='pinOrbit'){world.updateMatrixWorld(true);camera.updateMatrixWorld(true);pinRoots.pinCore.getWorldPosition(focusPoint);lens.render(scene,camera,state.lens,focusPoint);}
    else if(state.model==='glassStack'){
      world.updateMatrixWorld(true);camera.updateMatrixWorld(true);stackRoots.sphere.getWorldPosition(focusPoint);
      lens.render(scene,camera,state.lens,focusPoint,usesBlender()&&state.slabs.optics==='layered'?destination=>glassComposite.render(scene,camera,stackRoots.slabs,destination):undefined);
    }else renderer.render(scene,camera);
  }
  function schedule(){if(!raf&&!disposed&&!contextLost&&inView&&!document.hidden)raf=requestAnimationFrame(tick);}
  function resize(){const r=container.getBoundingClientRect();if(!r.width||!r.height)return;dimensions={width:r.width,height:r.height};quality();cameraDirty=true;settleUntil=performance.now()+500;schedule();}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(container);
  const visibilityObserver=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView){last=performance.now();schedule();}else{cancelAnimationFrame(raf);raf=0;}});visibilityObserver.observe(container);
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{last=performance.now();schedule();}};document.addEventListener('visibilitychange',visibility);
  const scroll=()=>{if(state.motion.mode==='scroll'){settleUntil=performance.now()+250;schedule();}};addEventListener('scroll',scroll,{passive:true});
  const raycaster=new THREE.Raycaster();
  function hit(e){if(state.model!=='tiles')return;const r=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1),camera);world.updateMatrixWorld(true);return raycaster.intersectObject(tilesMesh,false)[0]?.instanceId;}
  let drag=null,pinch=null;const touches=new Map();
  function cameraChanged(){cameraDirty=true;onCamera(activeCameraKey(),structuredClone(state[activeCameraKey()]));settleUntil=performance.now()+200;schedule();}
  function down(e){if(e.target!==renderer.domElement)return;renderer.domElement.setPointerCapture(e.pointerId);touches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(touches.size===2){const[a,b]=[...touches.values()];pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),x:(a.x+b.x)/2,y:(a.y+b.y)/2};}drag={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,pan:e.button===2||e.shiftKey};}
  function move(e){
    const r=container.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width-.5,(e.clientY-r.top)/r.height-.5);if(touches.has(e.pointerId))touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(interaction==='camera'&&drag){const cfg=state[activeCameraKey()];
      if(touches.size===2&&pinch){const[a,b]=[...touches.values()],distance=Math.hypot(a.x-b.x,a.y-b.y),x=(a.x+b.x)/2,y=(a.y+b.y)/2;cfg.distance=clamp(cfg.distance*pinch.distance/Math.max(1,distance),.8,45);cfg.targetX=clamp(cfg.targetX-(x-pinch.x)*.015,-8,8);cfg.targetY=clamp(cfg.targetY+(y-pinch.y)*.015,-3,8);pinch={distance,x,y};}
      else if(drag.pan){cfg.targetX=clamp(cfg.targetX-(e.clientX-drag.x)*.015,-8,8);cfg.targetY=clamp(cfg.targetY+(e.clientY-drag.y)*.015,-3,8);}
      else{cfg.azimuth=((cfg.azimuth-(e.clientX-drag.x)*.35+180)%360+360)%360-180;cfg.elevation=clamp(cfg.elevation+(e.clientY-drag.y)*.25,-80,85);}
      drag.x=e.clientX;drag.y=e.clientY;cameraChanged();
    }else{const id=hit(e);hoverId=id===undefined?null:tileData[id]?.id;settleUntil=performance.now()+300;schedule();}
  }
  function up(e){if(e.type==='pointerup'&&drag&&interaction==='select'&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<8){const index=hit(e);if(index!==undefined){const id=tileData[index].id;if(selection.has(id))selection.delete(id);else selection.add(id);onSelection([...selection]);settleUntil=performance.now()+200;schedule();}}touches.delete(e.pointerId);if(touches.size<2)pinch=null;drag=null;}
  function leave(){if(!drag){pointer.set(0,0);hoverId=null;settleUntil=performance.now()+300;schedule();}}
  function wheel(e){if(interaction!=='camera')return;e.preventDefault();const cfg=state[activeCameraKey()];if(cfg.type==='orthographic')cfg.zoom=clamp(cfg.zoom*Math.exp(-e.deltaY*.001),.2,3);else cfg.distance=clamp(cfg.distance*Math.exp(e.deltaY*.001),.8,45);cameraChanged();}
  const events={pointerdown:down,pointermove:move,pointerup:up,pointercancel:up,pointerleave:leave,contextmenu:e=>e.preventDefault()};for(const[name,fn]of Object.entries(events))renderer.domElement.addEventListener(name,fn);renderer.domElement.addEventListener('wheel',wheel,{passive:false});renderer.domElement.style.touchAction='none';renderer.domElement.style.cursor='grab';
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;cancelAnimationFrame(raf);raf=0;document.querySelector('#scene-fallback').classList.remove('ready');});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{contextLost=false;document.querySelector('#scene-fallback').classList.add('ready');resize();schedule();});
  function capture(transparent=false){
    const old=new THREE.Color();renderer.getClearColor(old);const alpha=renderer.getClearAlpha(),fog=scene.fog,g=ground.visible,c=contact.visible;
    const background=scene.background;
    try{if(transparent){renderer.setClearColor('#000000',0);scene.background=null;scene.fog=null;ground.visible=contact.visible=false;}renderFrame();return renderer.domElement.toDataURL('image/png');}
    finally{renderer.setClearColor(old,alpha);scene.background=background;scene.fog=fog;ground.visible=g;contact.visible=c;renderFrame();}
  }
  function selectPattern(pattern){selection.clear();for(const t of tileData)if(pattern==='all'||pattern==='border'&&(t.row===0||t.column===0||t.row===state.tiles.rows-1||t.column===state.tiles.columns-1)||pattern==='center'&&Math.hypot(t.x,t.z)<3)selection.add(t.id);onSelection([...selection]);settleUntil=performance.now()+200;schedule();}
  function destroy(){disposed=true;cancelAnimationFrame(raf);clearTimeout(environmentTimer);resizeObserver.disconnect();visibilityObserver.disconnect();document.removeEventListener('visibilitychange',visibility);removeEventListener('scroll',scroll);for(const[name,fn]of Object.entries(events))renderer.domElement.removeEventListener(name,fn);renderer.domElement.removeEventListener('wheel',wheel);tilesMesh?.dispose();disposeGroup(scene);for(const m of [...Object.values(mats),coreMat,edgeMat])m.dispose();environmentTarget?.dispose();shadowTexture.dispose();backgroundTexture?.dispose();lens.dispose();glassComposite.dispose();blenderSource.dispose();renderer.dispose();renderer.domElement.remove();}
  addEventListener('pagehide',e=>{if(!e.persisted)destroy();},{once:true});update(state);resize();
  return {
    update(next){settleUntil=performance.now()+1200;update(next);},setPaused(value){externalPause=value;last=performance.now();settleUntil=performance.now()+50;schedule();},
    setProfile(value){cameraProfile=value;cameraDirty=true;schedule();},setInteraction(mode){interaction=mode;renderer.domElement.style.touchAction=mode==='camera'?'none':'pan-y';renderer.domElement.style.cursor=mode==='camera'?'grab':'crosshair';},
    getCamera:()=>({profile:activeCameraKey(),value:structuredClone(state[activeCameraKey()])}),selectPattern,getSelection:()=>[...selection],capture,
    restart(){for(const spin of Object.values(pinSpin))spin.x=spin.y=spin.z=0;for(const k of Object.keys(clocks))clocks[k]=0;for(const k of Object.keys(phases))phases[k]=0;for(const k of Object.keys(spins))spins[k]=0;settleUntil=performance.now()+200;schedule();},destroy,
  };
}

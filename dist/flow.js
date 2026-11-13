import * as THREE from './vendor/three.module.js';
import {loadSettings,createStudio} from './controls.js?v=preset-4';
import {LIGHT_SOURCES,lightingNeedsEnvironment} from './lighting-controls.js?v=preset-4';
import {getRibbonSpan} from './ribbon-layout.js';
const settings=loadSettings(),host=document.querySelector('#scene'),hero=document.querySelector('.hero');
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let paused=reducedMotion.matches,sceneIndex=0,sceneBlend=0,time=0,thinTime=0,lastFrame=0,dirty=true,inView=true;
let thinRibbon,thinMaterial;
let renderer,scene,camera,ribbon,shell,coreMaterial,shellMaterial,environment;
let pointerX=0,pointerY=0,smoothX=0,smoothY=0,scrollAmount=0,smoothScroll=0,ribbonSpan=25;
const longSegments=innerWidth<700?176:272,crossSegments=20,MAX_LINES=28;
const lines=[];
const directLights=new Map();
const group=new THREE.Group();
const sceneBackground=()=>document.documentElement.dataset.theme==='dark'?'#101c2c':'#cdd7dd';
document.addEventListener('flow-theme-change',()=>{if(!renderer||!scene)return;const background=sceneBackground();scene.background.set(background);renderer.setClearColor(background,1);dirty=true});
function makeGeometry(){const geometry=new THREE.BufferGeometry();const count=(longSegments+1)*(crossSegments+1);geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(count*3),3));const index=[];for(let u=0;u<longSegments;u++)for(let v=0;v<crossSegments;v++){const a=u*(crossSegments+1)+v,b=a+crossSegments+1;index.push(a,a+1,b,b,a+1,b+1)}geometry.setIndex(index);return geometry}
const surfacePoint=new THREE.Vector3();
const gradientStart=new THREE.Color(),gradientMiddle=new THREE.Color(),gradientEnd=new THREE.Color(),gradientSample=new THREE.Color();
function updateRibbonColors(mesh=ribbon,profile=settings){
 if(!mesh)return;
 const attribute=mesh.geometry.attributes.color;
 gradientStart.set(profile.color);gradientMiddle.set(profile.colorMiddle);gradientEnd.set(profile.colorEnd);
 const visibleWidth=2*Math.tan(camera.fov*Math.PI/360)*camera.position.z*camera.aspect;
 const coverage=Math.max(.001,Math.min(1,visibleWidth/ribbonSpan));
 let index=0;
 for(let u=0;u<=longSegments;u++){
  const lengthPosition=THREE.MathUtils.clamp((u/longSegments-.5)/coverage+.5,0,1);
  for(let v=0;v<=crossSegments;v++){
   const widthPosition=(Math.cos(v/crossSegments*Math.PI*2)+1)*.5;
   const position=profile.gradientDirection==='width'?widthPosition:profile.gradientDirection==='diagonal'?lengthPosition*.65+widthPosition*.35:lengthPosition;
   if(profile.colorMode==='solid')gradientSample.copy(gradientStart);
   else if(profile.colorMode==='gradient2')gradientSample.copy(gradientStart).lerp(gradientEnd,position);
   else if(position<.5)gradientSample.copy(gradientStart).lerp(gradientMiddle,position*2);
   else gradientSample.copy(gradientMiddle).lerp(gradientEnd,(position-.5)*2);
   attribute.setXYZ(index++,gradientSample.r,gradientSample.g,gradientSample.b);
  }
 }
 attribute.needsUpdate=true;dirty=true;
}
function updateThinColors(){updateRibbonColors(thinRibbon,{color:settings.thinColor,colorMiddle:settings.thinColorMiddle,colorEnd:settings.thinColorEnd,colorMode:settings.thinColorMode,gradientDirection:settings.thinGradientDirection})}
function point(u,across,depth,t,thin=false){
 const x=(u-.5)*ribbonSpan;
 const phase=.17*Math.sin(t*.23)+(thin?THREE.MathUtils.degToRad(settings.thinPhase):0);
 const wave=Math.sin(u*Math.PI*2+.35+phase)*(thin?settings.thinAmplitude:settings.amplitude) + Math.sin(u*Math.PI*4-t*.28)*(thin?.042:.12);
 const y=wave*(thin?settings.thinCurvature:settings.curvature)+(thin?.5775:1.65)-u*(thin?1.1725:3.35)+Math.sin(u*Math.PI*1.3+t*.16)*sceneBlend*(thin?.21:.6)+(thin?settings.thinOffsetY:0);
 const bend=(thin?settings.thinTwist:settings.twist)*(Math.sin(u*Math.PI*2-.5+t*.18)*.85 + Math.cos(u*Math.PI*3+t*.13)*.2)+sceneBlend*.28;
 const breathing=1+.035*Math.sin(u*5+t*.35);
 surfacePoint.set(x,y+across*Math.cos(bend)*breathing-depth*Math.sin(bend),across*Math.sin(bend)*breathing+depth*Math.cos(bend)+Math.cos(u*7+t*.17)*.18+(thin?settings.thinOffsetZ:0));
 return surfacePoint;
}
function updateSurface(mesh,widthScale,thicknessScale,t,zOffset=0,thin=false){const attr=mesh.geometry.attributes.position;let index=0;for(let u=0;u<=longSegments;u++){const f=u/longSegments;for(let v=0;v<=crossSegments;v++){const angle=v/crossSegments*Math.PI*2;const p=point(f,Math.cos(angle)*(thin?settings.thinWidth:settings.width)*.5*widthScale,Math.sin(angle)*(thin?settings.thinThickness:settings.thickness)*.5*thicknessScale,t,thin);attr.setXYZ(index++,p.x,p.y,p.z+zOffset)}}attr.needsUpdate=true;mesh.geometry.computeVertexNormals();const normals=mesh.geometry.attributes.normal;for(let u=0;u<=longSegments;u++){const a=u*(crossSegments+1),b=a+crossSegments;surfacePoint.set(normals.getX(a)+normals.getX(b),normals.getY(a)+normals.getY(b),normals.getZ(a)+normals.getZ(b)).normalize();normals.setXYZ(a,surfacePoint.x,surfacePoint.y,surfacePoint.z);normals.setXYZ(b,surfacePoint.x,surfacePoint.y,surfacePoint.z)}normals.needsUpdate=true;mesh.geometry.computeBoundingSphere()}
function updateLines(t){
 const coating=settings.glassEnabled?settings.glassThickness:0;
 const halfWidth=settings.width*.5+coating,halfDepth=settings.thickness*.5+coating;
 for(let n=0;n<MAX_LINES;n++){
  const line=lines[n];line.visible=n<settings.strands&&settings.lineOpacity>0;if(!line.visible)continue;
  const f=n/(Math.max(2,settings.strands)-1),acrossFraction=f*2-1;
  const across=acrossFraction*halfWidth;
  const depth=halfDepth*Math.sqrt(Math.max(0,1-acrossFraction*acrossFraction))+.002;
  const attr=line.geometry.attributes.position;
  for(let u=0;u<=longSegments;u++){const p=point(u/longSegments,across,depth,t);attr.setXYZ(u,p.x,p.y,p.z)}
  attr.needsUpdate=true;line.geometry.computeBoundingSphere();line.material.opacity=settings.lineOpacity*(Math.abs(f-.5)>.33?1:.3);
 }
}
function applyMaterial(){
 if(!coreMaterial)return;
 if(thinMaterial){thinRibbon.visible=settings.thinEnabled&&settings.thinTransparency<1;const transparent=settings.thinTransparency>0;if(thinMaterial.transparent!==transparent){thinMaterial.transparent=transparent;thinMaterial.needsUpdate=true}thinMaterial.opacity=1-settings.thinTransparency;thinMaterial.depthWrite=!transparent;thinMaterial.color.set('#ffffff');thinMaterial.envMapIntensity=settings.lightPower;thinMaterial.roughness=settings.thinRoughness;thinMaterial.transmission=settings.thinTransmission;thinMaterial.thickness=settings.thinThickness*2;thinMaterial.metalness=settings.thinFinish==='satin'?.12:.035;updateThinColors()}
 coreMaterial.color.set('#ffffff');coreMaterial.transmission=settings.transmission;coreMaterial.roughness=settings.roughness;coreMaterial.metalness=settings.finish==='satin'?.12:.035;coreMaterial.thickness=settings.thickness*2;coreMaterial.envMapIntensity=settings.lightPower;
 shell.visible=settings.glassEnabled&&settings.glassTransparency<1;
 shellMaterial.color.set(settings.glassColor);shellMaterial.attenuationColor.set(settings.glassColor);shellMaterial.thickness=settings.glassThickness*2;shellMaterial.opacity=1-settings.glassTransparency;shellMaterial.roughness=settings.glassRoughness;shellMaterial.clearcoatRoughness=settings.glassRoughness;const nextClearcoat=Math.min(1,settings.glassReflection);if((shellMaterial.clearcoat>0)!==(nextClearcoat>0))shellMaterial.needsUpdate=true;shellMaterial.clearcoat=nextClearcoat;shellMaterial.specularIntensity=settings.glassReflection;shellMaterial.envMapIntensity=settings.lightPower*settings.glassReflection;
 for(const line of lines)line.material.color.set(settings.lineColor);
 scene.environmentRotation.y=THREE.MathUtils.degToRad(settings.lightAngle);renderer.toneMappingExposure=settings.exposure;updateRibbonColors();dirty=true;
}
function setupDirectLights(){
 for(const source of LIGHT_SOURCES){if(!['directional','ambient'].includes(source.type))continue;const data=settings.lighting[source.id];const light=source.type==='ambient'?new THREE.AmbientLight(data.color,data.power):new THREE.DirectionalLight(data.color,data.power);scene.add(light);directLights.set(source.id,light)}
 applyLighting();
}
function applyLighting(){for(const [id,light] of directLights){const data=settings.lighting[id];light.visible=data.enabled;light.color.set(data.color);light.intensity=data.enabled?data.power:0;if(light.isDirectionalLight)light.position.set(data.x,data.y,data.z)}dirty=true}
function setupEnvironment(){
 const env=new THREE.Scene(),background=settings.lighting.environment;
 env.background=new THREE.Color(background.color).multiplyScalar(background.enabled?background.power:0);
 for(const source of LIGHT_SOURCES){if(source.type!=='panel')continue;const data=settings.lighting[source.id];if(!data.enabled||data.power<=0)continue;
  const material=new THREE.MeshBasicMaterial({color:data.color,side:THREE.DoubleSide});material.color.multiplyScalar(data.power);
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(data.width,data.height),material);mesh.position.set(data.x,data.y,data.z);mesh.rotation.set(THREE.MathUtils.degToRad(data.rotationX),THREE.MathUtils.degToRad(data.rotationY),THREE.MathUtils.degToRad(data.rotationZ));env.add(mesh);
 }
 const pmrem=new THREE.PMREMGenerator(renderer),next=pmrem.fromScene(env,settings.reflectionBlur);scene.environment=next.texture;environment?.dispose();environment=next;env.traverse(o=>{o.geometry?.dispose();o.material?.dispose()});pmrem.dispose();dirty=true;
}
function resize(){if(!renderer)return;const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;const mobile=width<700;camera.position.set(mobile?1:0,0,mobile?30.5:14.5);camera.fov=mobile?45:44;camera.updateProjectionMatrix();ribbonSpan=getRibbonSpan(camera.aspect,camera.fov,camera.position.z);updateRibbonColors();updateThinColors();dirty=true}
try{
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1.5:1.75));renderer.setClearColor(sceneBackground(),1);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.outputColorSpace=THREE.SRGBColorSpace;host.append(renderer.domElement);scene=new THREE.Scene();scene.background=new THREE.Color(sceneBackground());camera=new THREE.PerspectiveCamera(44,1,.1,100);scene.add(group);setupEnvironment();
 coreMaterial=new THREE.MeshPhysicalMaterial({color:'#ffffff',vertexColors:true,metalness:.035,roughness:settings.roughness,transmission:settings.transmission,thickness:settings.thickness*2,ior:1.46,clearcoat:.7,clearcoatRoughness:.08,side:THREE.FrontSide,attenuationColor:'#59dbf4',attenuationDistance:2.8,envMapIntensity:settings.lightPower});
 shellMaterial=new THREE.MeshPhysicalMaterial({color:settings.glassColor,metalness:0,roughness:settings.glassRoughness,transmission:0,thickness:settings.glassThickness*2,ior:1.46,clearcoat:1,clearcoatRoughness:settings.glassRoughness,attenuationColor:settings.glassColor,attenuationDistance:4,transparent:true,opacity:1-settings.glassTransparency,depthWrite:false,side:THREE.FrontSide,envMapIntensity:settings.lightPower});
 // A thin Fresnel coating blends real specular highlights over the existing
 // transmissive ribbon, without a second transmission pass replacing its color.
 shellMaterial.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace(
  'vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;',
  'vec3 outgoingLight = totalSpecular * diffuseColor.rgb; diffuseColor.a *= 0.08 + 0.92 * pow(1.0 - saturate(dot(normal, geometryViewDir)), 3.0);'
 )};
 shellMaterial.customProgramCacheKey=()=> 'flow-thin-coating-v1';
 ribbon=new THREE.Mesh(makeGeometry(),coreMaterial);ribbon.geometry.setAttribute('color',new THREE.BufferAttribute(new Float32Array((longSegments+1)*(crossSegments+1)*3),3));shell=new THREE.Mesh(makeGeometry(),shellMaterial);shell.renderOrder=1;group.add(ribbon,shell);
 for(let i=0;i<MAX_LINES;i++){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array((longSegments+1)*3),3));const line=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:settings.lineColor,transparent:true,opacity:settings.lineOpacity,depthWrite:false}));line.renderOrder=2;group.add(line);lines.push(line)}
 thinMaterial=new THREE.MeshPhysicalMaterial({color:'#ffffff',vertexColors:true,metalness:.035,roughness:settings.thinRoughness,transmission:settings.thinTransmission,thickness:settings.thinThickness*2,ior:1.46,clearcoat:1,side:THREE.DoubleSide});thinRibbon=new THREE.Mesh(makeGeometry(),thinMaterial);thinRibbon.geometry.setAttribute('color',new THREE.BufferAttribute(new Float32Array((longSegments+1)*(crossSegments+1)*3),3));group.add(thinRibbon);
 setupDirectLights();
 applyMaterial();resize();
 let colorTimer;
 createStudio(settings,key=>{
  if(key.startsWith('lighting:')){applyLighting();if(lightingNeedsEnvironment(key)){clearTimeout(colorTimer);colorTimer=setTimeout(setupEnvironment,160)}}
  else {applyMaterial();if(key==='reset'){applyLighting()}if(['lightColor','reflectionBlur','reset'].includes(key)){clearTimeout(colorTimer);colorTimer=setTimeout(setupEnvironment,160)}}
 });
}catch(error){console.error('The 3D scene could not start.',error);renderer?.domElement.remove();renderer?.dispose();renderer=undefined;host.classList.remove('loaded');document.body.classList.add('webgl-unavailable');document.querySelector('#scene-status-text').textContent='FLOW / STATIC VIEW'}
const pauseButton=document.querySelector('#motion-toggle');
function syncPause(){pauseButton.setAttribute('aria-pressed',String(paused));pauseButton.setAttribute('aria-label',paused?'3D 모션 재생':'3D 모션 일시정지');pauseButton.textContent=paused?'▷':'Ⅱ';document.querySelector('.hero').classList.toggle('motion-paused',paused)}
pauseButton.addEventListener('click',()=>{paused=!paused;syncPause();dirty=true});reducedMotion.addEventListener('change',e=>{paused=e.matches;syncPause();dirty=true});syncPause();
document.querySelectorAll('[data-scene]').forEach(button=>button.addEventListener('click',()=>{sceneIndex=Number(button.dataset.scene);document.querySelectorAll('[data-scene]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));if(reducedMotion.matches)sceneBlend=sceneIndex;dirty=true}));
hero.addEventListener('pointermove',e=>{if(paused||reducedMotion.matches)return;const r=hero.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width-.5;pointerY=(e.clientY-r.top)/r.height-.5;dirty=true});hero.addEventListener('pointerleave',()=>{if(paused)return;pointerX=pointerY=0;dirty=true});
new ResizeObserver(resize).observe(host);window.addEventListener('resize',resize);window.addEventListener('scroll',()=>{scrollAmount=Math.min(scrollY/hero.offsetHeight,1);dirty=true},{passive:true});
new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView)dirty=true},{rootMargin:'100px'}).observe(hero);
const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revealObserver.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('.about-grid,.section-heading,.project-card,.journey-grid').forEach(e=>{e.classList.add('reveal');revealObserver.observe(e)});
function animate(now){requestAnimationFrame(animate);if(!renderer||!inView||document.hidden){lastFrame=now;return}if(now-lastFrame<(innerWidth<700?1000/30:1000/50))return;const dt=Math.min((now-(lastFrame||now))/1000,.05);lastFrame=now;const canMove=!paused&&!reducedMotion.matches;const moving=canMove&&(settings.motionSpeed>0||(settings.thinEnabled&&settings.thinMotionSpeed>0));if(canMove){time+=dt*settings.motionSpeed*1.45;thinTime+=dt*settings.thinMotionSpeed*1.45}const lerp=1-Math.exp(-dt*5);smoothX+=(pointerX-smoothX)*lerp;smoothY+=(pointerY-smoothY)*lerp;smoothScroll+=(scrollAmount-smoothScroll)*lerp;sceneBlend+=(sceneIndex-sceneBlend)*lerp;if(!moving&&!dirty&&Math.abs(sceneIndex-sceneBlend)<.001)return;updateSurface(ribbon,1,1,time);if(thinRibbon.visible)updateSurface(thinRibbon,1,1,thinTime,0,true);if(shell.visible)updateSurface(shell,1+settings.glassThickness*2/settings.width,1+settings.glassThickness*2/settings.thickness,time,0);updateLines(time);group.rotation.x=smoothY*.1;group.rotation.y=smoothX*.1;group.rotation.z=-.04+smoothX*.025+smoothScroll*.08;group.position.y=innerWidth<700?2-smoothScroll*.3:.65-smoothScroll*.5;renderer.render(scene,camera);if(!host.classList.contains('loaded'))requestAnimationFrame(()=>host.classList.add('loaded'));dirty=false}
requestAnimationFrame(animate);

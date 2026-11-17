import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../dist/vendor/three.module.js';
import {GLTFLoader} from '../dist/vendor/addons/loaders/GLTFLoader.js';
import {defaults,validate,builtInPresets,applySphereDip,applySphereDetail,applyGlassOptics} from '../dist/login/studio-state.js';

import {createBlenderModels} from '../dist/login/blender-model.js';
import {dipProgress,applyAnimatedTranslation} from '../dist/login/scene-motion.js';

const asset=new URL('../dist/login/assets/blender-261101/',import.meta.url);
const meta=JSON.parse(await readFile(new URL('source.json',asset),'utf8'));
const bytes=await readFile(new URL('261101.glb',asset));
const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
const plate=gltf.scene.getObjectByName('Cube'),ball=gltf.scene.getObjectByName('Sphere');
assert(plate?.isMesh&&ball?.isMesh,'Both original meshes must be exported');
gltf.scene.updateMatrixWorld(true);

// The central ellipse must be an actual opening, rather than an overlaid torus.
const ray=new THREE.Raycaster();
function plateHit(x,y){
  ray.set(new THREE.Vector3(x,y,4).applyMatrix4(plate.matrixWorld),new THREE.Vector3(0,0,-1).transformDirection(plate.matrixWorld));
  return ray.intersectObject(plate).length;
}
assert.equal(plateHit(0,0),0,'Source center is an open hole');
assert(plateHit(.85,.85)>0,'Solid glass remains around the opening');
for(const object of [plate,ball]){
  assert(object.geometry.attributes.normal&&object.geometry.attributes.uv,'Original normals and UVs must survive');
  for(const value of object.geometry.attributes.position.array)assert(Number.isFinite(value));
}

const state=validate(builtInPresets().blender.settings),cfg=state.camera;
const d=THREE.MathUtils.degToRad;
const position=new THREE.Vector3(Math.sin(d(cfg.azimuth))*Math.cos(d(cfg.elevation)),Math.sin(d(cfg.elevation)),Math.cos(d(cfg.azimuth))*Math.cos(d(cfg.elevation))).multiplyScalar(cfg.distance).add(new THREE.Vector3(cfg.targetX,cfg.targetY,cfg.targetZ));
assert(position.distanceTo(new THREE.Vector3(...meta.camera.position))<.00001,'Web camera must match Blender camera');
const exportedCamera=gltf.cameras[0];
assert(Math.abs(cfg.fov-exportedCamera.fov)<.00001,'Original vertical field of view must survive');
assert.equal(state.slabs.count,meta.plate.count);
assert.equal(state.slabs.spacing,meta.plate.spacing);
assert.equal(state.sphere.radius,meta.sphere.radius);
assert.equal(state.geometry.source,'blend261101');
assert.deepEqual(validate(JSON.parse(JSON.stringify(state))),state,'JSON roundtrip must preserve source camera precision');
for(const preset of Object.values(builtInPresets()))validate(preset.settings);
const oversized=structuredClone(state);oversized.slabs.count=999;oversized.slabs.width=-20;
assert.equal(validate(oversized).slabs.count,12);assert.equal(validate(oversized).slabs.width,.3);
const invalid=structuredClone(state);invalid.sphere.radius=NaN;assert.throws(()=>validate(invalid));
invalid.sphere.radius=.35;invalid.sphere.material.color='bad';assert.throws(()=>validate(invalid));
const png=await readFile(new URL('plate-normal.png',asset));
assert.equal(png.readUInt32BE(16),1024);assert.equal(png.readUInt32BE(20),1024);
const hdr=await readFile(new URL('environment.hdr',asset));assert(hdr.subarray(0,300).toString().includes('-Y 512 +X 1024'));
for(const [phase,expected]of [[0,0],[.25,.5],[.5,1],[.75,.5],[1,0]])assert(Math.abs(dipProgress(phase)-expected)<1e-12);
for(let i=0;i<=100;i++){const t=i/100;assert(Math.abs(dipProgress(t)-dipProgress(1-t))<1e-12);assert(dipProgress(t)>=0&&dipProgress(t)<=1);}
assert(Math.abs(dipProgress(-.5)-dipProgress(.5))<1e-12);
for(const t of [0,.5,1])assert(Math.abs(dipProgress(t+.00001)-dipProgress(t-.00001))<1e-8,'Turnarounds must have zero endpoint velocity');
const axis=new THREE.Vector3(...meta.plate.normal).normalize();
const sphereOffset=new THREE.Vector3(...meta.sphere.position).sub(new THREE.Vector3(...meta.plate.position));
const signed=sphereOffset.dot(axis),tangent=sphereOffset.clone().addScaledVector(axis,-signed);
assert(tangent.length()<.00001,'Sphere must move along the center of the source opening');
const inside=signed+state.sphere.motion.depth;
assert(inside>0&&inside<meta.plate.spacing,'Sphere must dip between the first two sheets');
assert(inside+meta.sphere.radius<meta.plate.spacing-meta.plate.dimensions[1]/2,'Dip must not reach the second sheet');
assert.equal(plateHit(.36,0),0);assert.equal(plateHit(0,.36),0);
const customized=structuredClone(state);customized.camera.azimuth=32;customized.sphere.material.color='#123456';customized.scene.x=2;
const before={camera:structuredClone(customized.camera),material:structuredClone(customized.sphere.material),scene:structuredClone(customized.scene)};
applySphereDip(customized);assert.deepEqual(customized.camera,before.camera);assert.deepEqual(customized.sphere.material,before.material);assert.deepEqual(customized.scene,before.scene);
assert.equal(customized.motion.paused,false);assert.equal(customized.sphere.motion.duration,6);
const sourceModel={meta,plateGeometry:plate.geometry.clone().scale(...plate.scale.toArray()),sphereGeometry:ball.geometry.clone().scale(...ball.scale.toArray()),plateQuaternion:plate.quaternion,sphereQuaternion:ball.quaternion};
const dense=createBlenderModels(state,{sphere:new THREE.MeshBasicMaterial(),slabs:new THREE.MeshBasicMaterial(),slabEdge:new THREE.MeshBasicMaterial(),slabSide:new THREE.MeshBasicMaterial()},sourceModel).sphere.children[0].geometry;
assert(dense.attributes.position.count>ball.geometry.attributes.position.count*6,'Sphere must have a substantially denser mesh');
dense.computeBoundingSphere();assert(Math.abs(dense.boundingSphere.radius-meta.sphere.radius)<.00001,'Dense sphere must retain the original radius');
assert(state.lens.sharpRange>state.sphere.radius,'Whole sphere must stay within the sharp focus band');
const preservedMotion=structuredClone(customized.sphere.motion);applySphereDetail(customized);assert.deepEqual(customized.sphere.motion,preservedMotion);assert.deepEqual(customized.camera,before.camera);assert.deepEqual(customized.sphere.material,before.material);
const beforeGlass={camera:structuredClone(customized.camera),sphere:structuredClone(customized.sphere),lens:structuredClone(customized.lens),motion:structuredClone(customized.motion)};applyGlassOptics(customized);for(const key of Object.keys(beforeGlass))assert.deepEqual(customized[key],beforeGlass[key]);assert.equal(customized.slabs.optics,'layered');assert.equal(customized.slabs.material.opacity,1);assert.equal(customized.slabs.material.transmission,1);
assert(dipProgress(.01)>0&&dipProgress(.49)<1&&dipProgress(.51)<1&&dipProgress(.99)>0,'No frozen sections at the glass boundary');
const basePosition=new THREE.Vector3(...meta.sphere.position),animated=basePosition.clone(),priorOffset=new THREE.Vector3();
for(let i=0;i<500;i++){
  const offset=axis.clone().multiplyScalar(dipProgress(i/499)*state.sphere.motion.depth);
  // Reproduce repeated pointer settling/expiry while the sphere is moving.
  applyAnimatedTranslation(animated,priorOffset,basePosition,offset,i%7===0?1:.06);
  assert(animated.distanceTo(basePosition.clone().add(offset))<1e-10,'Pointer settling must never lag or snap the animated path');
}
console.log('PASS: uninterrupted animation through repeated pointer/settle transitions.');
console.log('PASS: glass-only migration preserves camera, sphere, focus and animation.');
console.log('PASS: dense smooth sphere, original size, sharp focus band, preserved motion and camera.');
console.log('PASS: dip timing, centered path through opening, clearance to next sheet, motion-only migration.');
console.log('PASS: original opening, normals/UVs, camera/FOV, array spacing, JSON/presets, range/type checks, normal map and HDR.');


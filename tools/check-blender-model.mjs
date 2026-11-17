import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../dist/vendor/three.module.js';
import {GLTFLoader} from '../dist/vendor/addons/loaders/GLTFLoader.js';
import {defaults,validate,builtInPresets} from '../dist/login/studio-state.js';

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

const state=validate(defaults()),cfg=state.camera;
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
console.log('PASS: original opening, normals/UVs, camera/FOV, array spacing, JSON/presets, range/type checks, normal map and HDR.');


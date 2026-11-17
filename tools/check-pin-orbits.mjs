import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {orbitalBand,createPinOrbits} from '../dist/login/pin-orbits.js';
import {defaults,validate,builtInPresets} from '../dist/login/studio-state.js';

const state=validate(defaults());
assert.equal(state.model,'pinOrbit');
assert.equal(state.background.ground,false,'No physical display stand or floor in this composition');
assert(!('pinScreen' in state)&&!('pinStand' in state));
for(const settings of [state.pinRings,{...state.pinRings,radiusX:1,radiusY:3,width:.4,depth:.025,twist:90,segments:96}]){
  const geometry=orbitalBand(settings,1),p=geometry.attributes.position,n=geometry.attributes.normal;
  for(const v of [...p.array,...n.array])assert(Number.isFinite(v));
  const vec=new THREE.Vector3(),other=new THREE.Vector3();
  for(let i=0;i<n.count;i++)assert(Math.abs(vec.fromBufferAttribute(n,i).length()-1)<1e-5,'All normals are unit length');
  for(let j=0;j<=20;j++){
    assert(vec.fromBufferAttribute(p,j).distanceTo(other.fromBufferAttribute(p,settings.segments*21+j))<1e-5,'Closed path seam');
    assert(vec.fromBufferAttribute(n,j).distanceTo(other.fromBufferAttribute(n,settings.segments*21+j))<1e-5,'No lighting seam');
  }
  for(let i=0;i<=settings.segments;i++)assert(vec.fromBufferAttribute(p,i*21).distanceTo(other.fromBufferAttribute(p,i*21+20))<1e-5,'Closed cross section');
  geometry.dispose();
}
state.pinCore.shape='sphere';
const material=new THREE.MeshPhysicalMaterial(),groups=createPinOrbits(state,{pinCore:material,pinRings:material});
assert.deepEqual(Object.keys(groups),['pinCore','pinRings'],'Only the central objects are modeled');
assert.equal(groups.pinRings.children.length,state.pinRings.count);
assert(groups.pinCore.children[0].geometry.attributes.position.count>6000,'Dense smooth center mesh');
for(const group of Object.values(groups))group.traverse(o=>o.geometry?.dispose());material.dispose();
const baseline=validate(builtInPresets().baseline.settings);
assert.equal(baseline.geometry.source,'blend261101');
assert.equal(baseline.sphere.motion.depth,1.2);
assert.equal(baseline.sphere.motion.duration,4.4);
for(const preset of Object.values(builtInPresets()))validate(preset.settings);
console.log('PASS: closed smooth glass bands, finite geometry, content-only scene, dense center mesh, saved baseline and all presets.');

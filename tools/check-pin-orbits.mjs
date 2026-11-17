import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {orbitalBand,createPinOrbits,cappedHemisphere} from '../dist/login/pin-orbits.js';
import {defaults,validate,builtInPresets,applyPinHemisphere} from '../dist/login/studio-state.js';

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
assert.equal(state.pinCore.shape,'hemisphere');
const half=cappedHemisphere(),pos=half.attributes.position,norm=half.attributes.normal;
const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),cross=new THREE.Vector3();
let volume=0,flatTriangles=0;const edgeUses=new Map();
const key=i=>[pos.getX(i),pos.getY(i),pos.getZ(i)].map(v=>Math.round(v*1e6)).join(',');
for(let i=0;i<half.index.count;i+=3){
  const ids=[half.index.getX(i),half.index.getX(i+1),half.index.getX(i+2)];
  a.fromBufferAttribute(pos,ids[0]);b.fromBufferAttribute(pos,ids[1]);c.fromBufferAttribute(pos,ids[2]);
  volume+=a.dot(cross.crossVectors(b,c))/6;
  if(ids.every(v=>Math.abs(pos.getY(v)-.5)<1e-6)){
    flatTriangles++;assert(ids.every(v=>norm.getY(v)>.999),'The cut face has flat outward normals');
  }
  for(let j=0;j<3;j++){const e=[key(ids[j]),key(ids[(j+1)%3])].sort().join('|');edgeUses.set(e,(edgeUses.get(e)||0)+1);}
}
assert(flatTriangles>=128,'A real circular cap closes the hemisphere');
assert(Math.abs(volume-Math.PI/6)<.005,'Solid half-ellipsoid volume with outward winding');
assert([...edgeUses.values()].every(n=>n===2),'Watertight dome, fillet and cap');
assert(Math.abs(half.boundingBox.min.y+.5)<1e-6&&Math.abs(half.boundingBox.max.y-.5)<1e-6);
half.dispose();
const legacy=structuredClone(state);delete legacy.pinCore.shapeRevision;
legacy.pinCore.shape='roundedCube';legacy.pinCore.height=2.55;
const corrected=validate(legacy),untouched=structuredClone(corrected);
applyPinHemisphere(corrected);assert.equal(corrected.pinCore.shape,'hemisphere');
assert.equal(corrected.pinCore.height,1.275);
assert.deepEqual(corrected.pinCore.material,untouched.pinCore.material);
assert.deepEqual(corrected.pinCore.motion,untouched.pinCore.motion);
const expectedCore=structuredClone(corrected.pinCore);corrected.pinCore=untouched.pinCore;
assert.deepEqual(corrected,untouched,'Shape correction preserves every other group, camera and material');
corrected.pinCore=expectedCore;const once=structuredClone(corrected);applyPinHemisphere(corrected);assert.deepEqual(corrected,once,'Migration applies once');
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
console.log('PASS: watertight capped hemisphere, outward volume/normals, shape-only migration, smooth bands and preserved presets.');

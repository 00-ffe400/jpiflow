import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {hollowHemisphere,createPinOrbits,cappedHemisphere} from '../dist/login/pin-orbits.js';
import {defaults,validate,builtInPresets,applyPinHemisphere,applyHollowGlass} from '../dist/login/studio-state.js';

const state=validate(defaults());
assert.equal(state.model,'pinOrbit');
assert.equal(state.background.ground,false,'No physical display stand or floor in this composition');
assert(!('pinScreen' in state)&&!('pinStand' in state));
for(const [radius,thickness,roundness] of [[1.45,.04,1],[.8,.15,.1],[2.5,.01,1]]){
  const geometry=hollowHemisphere(radius,thickness,roundness,160,64),p=geometry.attributes.position,n=geometry.attributes.normal;
  for(const v of [...p.array,...n.array])assert(Number.isFinite(v));
  const vec=new THREE.Vector3(),other=new THREE.Vector3(),third=new THREE.Vector3(),cross=new THREE.Vector3();
  for(let i=0;i<n.count;i++)assert(Math.abs(vec.fromBufferAttribute(n,i).length()-1)<1e-5,'All normals are unit length');
  const key=i=>[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e6)).join(',');
  const edges=new Map();let volume=0;
  for(let i=0;i<geometry.index.count;i+=3){
    const ids=[0,1,2].map(k=>geometry.index.getX(i+k));
    vec.fromBufferAttribute(p,ids[0]);other.fromBufferAttribute(p,ids[1]);third.fromBufferAttribute(p,ids[2]);volume+=vec.dot(cross.crossVectors(other,third))/6;
    for(let k=0;k<3;k++){const e=[key(ids[k]),key(ids[(k+1)%3])].sort().join('|');edges.set(e,(edges.get(e)||0)+1);}
  }
  assert([...edges.values()].every(v=>v===2),'Only the glass wall is a watertight solid');
  const expected=2/3*Math.PI*(radius**3-(radius-thickness)**3)+Math.PI**2*(radius-thickness/2)*(thickness/2)**2*roundness;
  assert(Math.abs(volume/expected-1)<.012,'Thin wall volume, not a filled half sphere');
  const material=new THREE.MeshBasicMaterial(),mesh=new THREE.Mesh(geometry,material);mesh.updateMatrixWorld();
  const ray=new THREE.Raycaster(new THREE.Vector3(.1*radius,1,0),new THREE.Vector3(0,-1,0)),hits=ray.intersectObject(mesh);
  assert(hits.length&&Math.abs(hits[0].point.y+Math.sqrt((radius-thickness)**2-(.1*radius)**2))<.002,'A ray through the mouth reaches the inner concave floor, not a disk');
  const open=new THREE.Raycaster(new THREE.Vector3(0,.01,0),new THREE.Vector3(0,1,0));assert.equal(open.intersectObject(mesh).length,0,'The mouth is open');
  geometry.dispose();material.dispose();
}
const oldGlass=structuredClone(state);delete oldGlass.pinRings.shapeRevision;oldGlass.pinRings.count=2;
const glassCorrection=validate(oldGlass),glassBefore=structuredClone(glassCorrection);applyHollowGlass(glassCorrection);
assert.equal(glassCorrection.pinRings.shapeRevision,1);assert.equal(glassCorrection.pinRings.count,2);
assert.deepEqual(glassCorrection.pinRings.material,glassBefore.pinRings.material);assert.deepEqual(glassCorrection.pinRings.motion,glassBefore.pinRings.motion);
const glassOnce=structuredClone(glassCorrection);applyHollowGlass(glassCorrection);assert.deepEqual(glassCorrection,glassOnce,'Hollow glass migration is idempotent');
glassCorrection.pinRings=glassBefore.pinRings;assert.deepEqual(glassCorrection,glassBefore,'All other groups and framing survive the glass replacement');
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
console.log('PASS: open-mouth hollow glass hemispheres, inner/outer walls, correct wall volume, smooth normals, selective migrations and preserved presets.');

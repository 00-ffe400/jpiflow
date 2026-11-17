import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../dist/vendor/three.module.js';
import {selectedSettings,validate,applyHollowCore,applyCoreSphere} from '../dist/login/studio-state.js';
import {createPinOrbits} from '../dist/login/pin-orbits.js';

const raw=JSON.parse(await readFile(new URL('../dist/login/presets/selected-20261117.json',import.meta.url),'utf8'));
const expected=validate(raw),selected=selectedSettings();Object.assign(expected.pinCore,{shape:'sphere',shapeRevision:3,height:raw.pinCore.width,depth:raw.pinCore.width});
assert.deepEqual(selected,expected,'The pasted settings change only the central sphere shape and circular proportions');
for(const key of ['scene','camera','mobileCamera','motion','environment','background','lights','pinRings'])assert.deepEqual(selected[key],raw[key],`Preserve the exact selected ${key}`);
assert.deepEqual(selected.pinCore.material,raw.pinCore.material);
assert.deepEqual(selected.pinCore.motion,raw.pinCore.motion);
const snapshot=structuredClone(selected);applyHollowCore(selected);applyCoreSphere(selected);assert.deepEqual(selected,snapshot,'Shape migration runs once');

const material=new THREE.MeshPhysicalMaterial(),groups=createPinOrbits(selected,{pinCore:material,pinRings:material});
groups.pinCore.updateMatrixWorld(true);
assert.equal(selected.pinCore.shape,'sphere');
assert.equal(selected.pinCore.width,selected.pinCore.height);assert.equal(selected.pinCore.width,selected.pinCore.depth);
const outside=new THREE.Raycaster(new THREE.Vector3(0,2,0),new THREE.Vector3(0,-1,0));
const outerHit=outside.intersectObject(groups.pinCore,true)[0];
assert(outerHit&&Math.abs(outerHit.point.y-selected.pinCore.width/2)<.001,'The upper hemisphere is present');
const inside=new THREE.Raycaster(new THREE.Vector3(0,0,0),new THREE.Vector3(0,1,0));
const innerHit=inside.intersectObject(groups.pinCore,true)[0];
assert(innerHit&&Math.abs(innerHit.distance-(selected.pinCore.width/2-selected.pinCore.wallThickness))<.001,'The closed sphere retains its hollow interior and real wall thickness');
for(const root of Object.values(groups))root.traverse(o=>o.geometry?.dispose());material.dispose();
console.log('PASS: full round central sphere, hollow wall, exact preserved framing/material/motion and idempotent migration.');

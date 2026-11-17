import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../dist/vendor/three.module.js';
import {selectedSettings,validate,applyHollowCore} from '../dist/login/studio-state.js';
import {createPinOrbits} from '../dist/login/pin-orbits.js';

const raw=JSON.parse(await readFile(new URL('../dist/login/presets/selected-20261117.json',import.meta.url),'utf8'));
const expected=validate(raw),selected=selectedSettings();expected.pinCore.shapeRevision=2;
assert.deepEqual(selected,expected,'The pasted settings change only the core shape revision');
for(const key of ['scene','camera','mobileCamera','motion','environment','background','lights','pinRings'])assert.deepEqual(selected[key],raw[key],`Preserve the exact selected ${key}`);
assert.deepEqual(selected.pinCore.material,raw.pinCore.material);
assert.deepEqual(selected.pinCore.motion,raw.pinCore.motion);
const snapshot=structuredClone(selected);applyHollowCore(selected);assert.deepEqual(selected,snapshot,'Shape migration runs once');

const material=new THREE.MeshPhysicalMaterial(),groups=createPinOrbits(selected,{pinCore:material,pinRings:material});
groups.pinCore.updateMatrixWorld(true);
const open=new THREE.Raycaster(new THREE.Vector3(0,.1,0),new THREE.Vector3(0,1,0));
assert.equal(open.intersectObject(groups.pinCore,true).length,0,'The central opening is not capped');
const inside=new THREE.Raycaster(new THREE.Vector3(.1,1,0),new THREE.Vector3(0,-1,0));
const hit=inside.intersectObject(groups.pinCore,true)[0];
assert(hit&&hit.point.y<-.9,'The view through the center opening reaches a concave inner wall, not a flat disk');
for(const root of Object.values(groups))root.traverse(o=>o.geometry?.dispose());material.dispose();
console.log('PASS: exact pasted framing/material/motion settings, open hollow center and idempotent migration.');

import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {defaults,validate,changeMaterial,copyMaterial,materialTargets,fieldsFor} from '../dist/login/studio-state.js';
import {createPinOrbits} from '../dist/login/pin-orbits.js';

const state=defaults(),before=structuredClone(state);
assert.deepEqual(materialTargets(state),['pinCore','pinShell1','pinShell2','pinShell3']);
changeMaterial(state,'pinShell1','color','#ff3300');
changeMaterial(state,'pinShell2','color','#00dd88');
changeMaterial(state,'pinShell3','roughness',.52);
assert.equal(state.pinRings.layers.one.material.color,'#ff3300');
assert.equal(state.pinRings.layers.two.material.color,'#00dd88');
assert.equal(state.pinRings.layers.three.material.roughness,.52);
assert.equal(state.pinRings.layers.three.material.color,before.pinRings.material.color);
assert.deepEqual(state.pinCore,before.pinCore,'Individual glass edits preserve the blue core');
assert.deepEqual(state.camera,before.camera);assert.deepEqual(state.pinRings.motion,before.pinRings.motion);
assert.equal(state.pinRings.layers.two.material.roughness,before.pinRings.material.roughness);
assert.deepEqual(validate(JSON.parse(JSON.stringify(state))),state,'Independent values survive JSON round trip');

const core=structuredClone(state.pinCore);assert.equal(copyMaterial(state,'pinShell1','glass'),3);
assert.deepEqual(state.pinCore,core,'Copy to glass excludes the blue core');
state.pinRings.layers.two.material.roughness=.71;
assert.notEqual(state.pinRings.layers.one.material.roughness,.71,'Copied settings are independent objects');
changeMaterial(state,'pinRings','transmission',.6);
for(const key of ['one','two','three'])assert.equal(state.pinRings.layers[key].material.transmission,.6);
assert.deepEqual(state.pinCore,core,'Glass group edits exclude the blue core');
state.links.material=true;changeMaterial(state,'pinShell2','preset','silver');
for(const key of ['one','two','three'])assert.equal(state.pinRings.layers[key].material.metalness,1);
assert.equal(state.pinCore.material.metalness,1,'Explicit linking includes the blue core');
state.links.material=false;changeMaterial(state,'pinShell1','opacity',.45);
assert.equal(state.pinRings.layers.two.material.opacity,1,'Disabling link restores independent editing');

const legacy=defaults();legacy.pinRings.material.color='#abcdef';
for(const layer of Object.values(legacy.pinRings.layers))delete layer.material;
const migrated=validate(legacy);
for(const layer of Object.values(migrated.pinRings.layers))assert.equal(layer.material.color,'#abcdef','Old shared material is preserved per shell');
migrated.pinRings.layers.one.material.color='#1100ff';assert.equal(migrated.pinRings.layers.two.material.color,'#abcdef');
const field=fieldsFor('pinShell2','색상·재질').find(f=>f.key==='material.color');
assert.equal(field.path,'pinRings.layers.two.material.color');

const materials=Object.fromEntries(['pinCore','pinShell1','pinShell2','pinShell3','pinShell4'].map(id=>[id,new THREE.MeshPhysicalMaterial()]));
const groups=createPinOrbits(defaults(),materials);
assert.equal(new Set(groups.pinRings.children.map(mesh=>mesh.material)).size,3,'Rendered shells do not share a material instance');
for(let i=0;i<3;i++)assert.equal(groups.pinRings.children[i].material,materials[`pinShell${i+1}`]);
for(const root of Object.values(groups))root.traverse(o=>o.geometry?.dispose());
for(const material of Object.values(materials))material.dispose();
console.log('PASS: independent per-shell edits/render materials, scoped copy, explicit linking, JSON persistence and legacy migration.');

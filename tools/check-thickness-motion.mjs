import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {selectedSettings,validate,changeWallThickness} from '../dist/login/studio-state.js';
import {createPinOrbits} from '../dist/login/pin-orbits.js';
import {createGradientRotation,applyGradientMotion} from '../dist/login/gradient-motion.js';

const state=selectedSettings(),before=structuredClone(state);
changeWallThickness(state,'pinShell1',.12);
assert.equal(state.pinRings.layers.one.wallThickness,.12);
assert.equal(state.pinRings.layers.two.wallThickness,before.pinRings.layers.two.wallThickness);
assert.deepEqual(state.pinCore,before.pinCore);
assert.deepEqual(state.pinRings.layers.one.material,before.pinRings.layers.one.material,'Physical thickness does not overwrite optical thickness or color');
const materials=Object.fromEntries(['pinCore','pinRings','pinShell1','pinShell2','pinShell3','pinShell4'].map(id=>[id,new THREE.MeshPhysicalMaterial()]));
const meshes=createPinOrbits(state,materials);
function minimumRadius(geometry){
  const p=geometry.attributes.position;let minimum=Infinity;
  for(let i=0;i<p.count;i++)minimum=Math.min(minimum,Math.hypot(p.getX(i),p.getY(i),p.getZ(i)));
  return minimum;
}
assert.ok(Math.abs(minimumRadius(meshes.pinRings.children[0].geometry)-(state.pinRings.radius-.12))<1e-6,'Selected shell has the requested real inner surface');
assert.ok(Math.abs(minimumRadius(meshes.pinRings.children[1].geometry)-(state.pinRings.radius+state.pinRings.spacing-before.pinRings.layers.two.wallThickness))<1e-6,'Neighbor retains its wall');
for(const root of Object.values(meshes))root.traverse(mesh=>mesh.geometry?.dispose());
for(const m of Object.values(materials))m.dispose();
changeWallThickness(state,'pinRings',.085);
assert.ok(Object.values(state.pinRings.layers).every(layer=>layer.wallThickness===.085),'Whole-glass edit explicitly applies to every shell');
state.links.material=true;changeWallThickness(state,'pinShell2',.07);
assert.equal(state.pinRings.layers.one.wallThickness,.085,'Material linking does not link geometry');
assert.equal(changeWallThickness(state,'pinShell1',NaN),false);
changeWallThickness(state,'pinShell1',100);assert.equal(state.pinRings.layers.one.wallThickness,.15);
assert.deepEqual(validate(JSON.parse(JSON.stringify(state))),state,'Independent thickness and gradient motion survive JSON');
const legacy=structuredClone(before);legacy.pinRings.wallThickness=.09;
for(const layer of Object.values(legacy.pinRings.layers))delete layer.wallThickness;
assert.ok(Object.values(validate(legacy).pinRings.layers).every(layer=>layer.wallThickness===.09),'Older saved shared thickness survives migration');

const gradient={...before.pinCore.gradient,mode:'two',rotate:true,rotationAxis:'z',rotationSpeed:90,rotationPhase:0};
const motion=createGradientRotation(),identity=motion.update(gradient).clone();
const quarter=motion.update(gradient,{dt:1}).clone();
assert.ok(new THREE.Vector3(1,0,0).applyMatrix3(quarter).distanceTo(new THREE.Vector3(0,-1,0))<1e-9);
assert.deepEqual(motion.update({...gradient,rotationSpeed:0},{dt:10}).elements,quarter.elements,'Zero speed freezes the current color orientation');
assert.deepEqual(motion.update(gradient,{dt:10,paused:true}).elements,quarter.elements,'Pause/reduced-motion cannot advance gradient');
motion.update({...gradient,rotationSpeed:-90},{dt:1});
assert.ok(motion.update(gradient).elements.every((n,i)=>Math.abs(n-identity.elements[i])<1e-9),'Reversing speed preserves phase');
const a=createGradientRotation().update(gradient,{mode:'manual',progress:.15}).clone();
const b=createGradientRotation().update(gradient,{mode:'scroll',progress:.15}).clone();assert.deepEqual(a.elements,b.elements,'Scroll and manual progress are deterministic');
motion.reset();assert.deepEqual(motion.update(gradient).elements,identity.elements,'Restart resets color motion');
const migrating=structuredClone(before);migrating.pinCore.gradient.motionRevision=0;migrating.pinCore.gradient.mode='solid';
applyGradientMotion(migrating);const migrated=structuredClone(migrating);applyGradientMotion(migrating);assert.deepEqual(migrating,migrated);
assert.deepEqual(migrating.camera,before.camera);assert.deepEqual(migrating.pinCore.motion,before.pinCore.motion);assert.deepEqual(migrating.pinRings,before.pinRings);
console.log('PASS: real per-shell geometry thickness, scoped edits, legacy JSON, independent gradient phase, pause, zero speed, reverse and restart.');

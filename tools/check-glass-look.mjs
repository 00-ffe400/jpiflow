import assert from 'node:assert/strict';
import {applyClearGlass} from '../dist/login/glass-look.js';
import {validate,selectedSettings,builtInPresets} from '../dist/login/studio-state.js';
import previous from '../dist/login/presets/site-before-clear-glass.js';

const state=validate(previous),before=structuredClone(state);
applyClearGlass(state);
// Exclude just the intended optical edits to detect accidental pose/motion changes.
function nonOptical(s){
  const copy=structuredClone(s);
  delete copy.pinCore.material;delete copy.pinRings.material;
  delete copy.pinRings.preview;delete copy.pinRings.optics;
  for(const layer of Object.values(copy.pinRings.layers))delete layer.material;
  delete copy.environment.intensity;delete copy.environment.blur;
  for(const id of ['key','fill','rim','ambient'])delete copy.lights[id].intensity;
  delete copy.lights.base.enabled;delete copy.render.glassLookRevision;
  return copy;
}
assert.deepEqual(nonOptical(state),nonOptical(before),'Camera, geometry, text, gradients and animation stay unchanged');
assert.equal(state.pinRings.preview,'glass');
assert.equal(state.pinCore.material.opacity,1,'Transmission keeps reflective surfaces intact');
assert.equal(state.pinCore.material.transmission,1);
assert.equal(state.pinRings.material.opticalThickness,state.pinRings.wallThickness);
const once=structuredClone(state);applyClearGlass(state);
assert.deepEqual(state,once,'Reload never progressively washes out the selected color');
assert.deepEqual(validate(state),state,'Optical revision survives validation and persistence');
state.pinRings.layers.one.material.color='#ff3344';
assert.notEqual(state.pinRings.layers.two.material.color,'#ff3344','Materials remain independent after migration');
assert.equal(selectedSettings().render.glassLookRevision,1,'Fresh visitors receive the new look');
assert.deepEqual(builtInPresets().beforeClearGlass.settings,validate(previous),'Original look remains available for comparison');
console.log('PASS: glass migration preserves composition/motion, is idempotent, persists and retains the comparison preset.');

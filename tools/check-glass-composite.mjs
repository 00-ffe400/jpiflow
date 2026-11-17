import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.js';
import {createGlassComposite} from '../dist/login/glass-composite.js';

const scene=new THREE.Scene(),root=new THREE.Group(),camera=new THREE.PerspectiveCamera();
const background=new THREE.Color('#b0a9bd');scene.background=background;scene.add(root);
const plates=[-4,-12,-8].map(z=>{const o=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshPhysicalMaterial());o.position.z=z;root.add(o);return o;});
const sphere=new THREE.Mesh(new THREE.SphereGeometry(),new THREE.MeshBasicMaterial());scene.add(sphere);
scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
const destination=new THREE.WebGLRenderTarget(2,2),calls=[];let target;
const renderer={
  getDrawingBufferSize(v){return v.set(640,480);},
  setRenderTarget(v){target=v;},
  render(s){
    assert(!s.background?.isTexture||s.background!==target?.texture,'Never sample the active output attachment');
    calls.push({visible:plates.filter(o=>o.visible).map(o=>o.position.z),write:sphere.material.colorWrite,target});
  },
};
const composite=createGlassComposite(renderer);composite.render(scene,camera,root,destination);
assert.deepEqual(calls.map(c=>c.visible),[[],[-12],[-8],[-4]],'Opaque base, then far-to-near glass');
assert.equal(calls[0].write,true);assert(calls.slice(1).every(c=>c.write===false),'Keep opaque depth without repainting its color');
assert.equal(calls.at(-1).target,destination);assert.equal(scene.background,background);assert.equal(sphere.material.colorWrite,true);assert(plates.every(o=>o.visible));
let count=0;renderer.render=()=>{if(++count===2)throw Error('render interrupted');};
assert.throws(()=>composite.render(scene,camera,root,destination));
assert.equal(scene.background,background);assert.equal(sphere.material.colorWrite,true);assert(plates.every(o=>o.visible),'Restore visibility after an interrupted render');
composite.dispose();destination.dispose();
console.log('PASS: layer ordering, no attachment feedback, opaque depth preservation, output target and state restoration.');

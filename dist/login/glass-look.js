// Optical/material-only revision. Poses, geometry, gradient stops, animation,
// camera and text remain the user's existing values.
export function applyClearGlass(state){
  if(state.model!=='pinOrbit'||state.render.glassLookRevision>=1)return state;
  state.pinRings.preview='glass';state.pinRings.optics='layered';
  const clear={preset:'glass',color:'#eaf7ff',opacity:1,transmission:1,roughness:.025,metalness:0,reflection:1.05,ior:1.5,
    opticalThickness:state.pinRings.wallThickness,attenuationColor:'#b9def2',attenuationDistance:3.5,coat:.12,coatRoughness:.035,emissive:'#000000',emission:0};
  Object.assign(state.pinRings.material,clear);
  for(const layer of Object.values(state.pinRings.layers))Object.assign(layer.material,clear);
  const original=state.pinCore.material.color;
  const softened='#'+[1,3,5].map(i=>Math.round(parseInt(original.slice(i,i+2),16)*.35+255*.65).toString(16).padStart(2,'0')).join('');
  Object.assign(state.pinCore.material,{preset:'glass',color:softened,opacity:1,transmission:1,roughness:.025,metalness:0,reflection:1.05,ior:1.5,
    opticalThickness:state.pinCore.wallThickness*1.35,attenuationColor:original,attenuationDistance:.65,coat:.12,coatRoughness:.035,emissive:'#000000',emission:0});
  state.environment.intensity=.95;state.environment.blur=.1;
  state.lights.key.intensity=1.25;state.lights.fill.intensity=.55;state.lights.rim.intensity=8;state.lights.ambient.intensity=.55;state.lights.base.enabled=false;
  state.render.glassLookRevision=1;return state;
}

import * as THREE from '../vendor/three.module.js';

// Integrate angular velocity, so edits to speed/direction do not reset the pose.
export function createGradientRotation(){
  const rotation=new THREE.Quaternion(),step=new THREE.Quaternion(),combined=new THREE.Quaternion();
  const axis=new THREE.Vector3(),matrix4=new THREE.Matrix4(),matrix=new THREE.Matrix3();
  return {
    update(settings,{dt=0,mode='auto',progress=0,paused=false}={}){
      axis.set(settings.rotationAxis==='x'?1:0,settings.rotationAxis==='y'?1:0,settings.rotationAxis==='z'?1:0);
      const active=settings.rotate&&settings.mode!=='solid'&&settings.rotationSpeed!==0;
      if(active&&!paused){
        if(mode==='auto')rotation.multiply(step.setFromAxisAngle(axis,THREE.MathUtils.degToRad(settings.rotationSpeed*dt))).normalize();
        else rotation.setFromAxisAngle(axis,THREE.MathUtils.degToRad(settings.rotationSpeed*progress*20));
      }
      combined.copy(rotation).multiply(step.setFromAxisAngle(axis,THREE.MathUtils.degToRad(settings.rotationPhase))).invert();
      return matrix.setFromMatrix4(matrix4.makeRotationFromQuaternion(combined));
    },
    reset(){rotation.identity();},
  };
}

export function applyGradientMotion(state){
  if(state.model!=='pinOrbit'||state.pinCore.gradient.motionRevision>=1)return state;
  const gradient=state.pinCore.gradient;
  if(gradient.mode==='solid')gradient.mode='two';
  Object.assign(gradient,{rotate:true,rotationAxis:'z',rotationSpeed:18,rotationPhase:0,motionRevision:1});
  return state;
}

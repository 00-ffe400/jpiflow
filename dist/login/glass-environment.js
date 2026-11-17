import * as THREE from '../vendor/three.module.js';

// Soft studio boxes and dark flags provide real reflection contrast in PMREM.
// These are reflection-only surfaces; the page background stays unchanged.
export function createGlassEnvironment(){
  const room=new THREE.Group();
  room.add(new THREE.Mesh(new THREE.BoxGeometry(20,16,20),new THREE.MeshBasicMaterial({color:'#788897',side:THREE.BackSide})));
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const ctx=canvas.getContext('2d');ctx.filter='blur(10px)';ctx.fillStyle='#ffffff';ctx.beginPath();ctx.roundRect(25,20,206,216,26);ctx.fill();
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.userData.sceneOwned=true;
  for(const [x,y,z,w,h,power]of [[-5,3,4,5,8,2.6],[4,1,-4,.8,7,3],[0,7,-2,8,4,2.2],[2,2,-7,5,6,1.2],[-2,-5,2,7,3,.55]]){
    const panel=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map,color:new THREE.Color().setScalar(power),transparent:true,depthWrite:false,side:THREE.DoubleSide}));
    panel.position.set(x,y,z);panel.lookAt(0,0,0);room.add(panel);
  }
  for(const [x,y,z,w,h]of [[-7,0,-1,3,10],[6,2,1,2,9],[0,-3,7,9,1.5]]){
    const flag=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:'#080f1c',side:THREE.DoubleSide}));
    flag.position.set(x,y,z);flag.lookAt(0,0,0);room.add(flag);
  }
  return room;
}

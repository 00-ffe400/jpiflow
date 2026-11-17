import * as THREE from '../vendor/three.module.js';

const rad=THREE.MathUtils.degToRad;

export function orbitalBand(config,index){
  const segments=config.segments,radial=20,positions=[],uv=[],indices=[];
  for(let i=0;i<=segments;i++){
    const t=i/segments,a=t*Math.PI*2,x=config.radiusX*Math.cos(a),y=config.radiusY*Math.sin(a);
    const normal=new THREE.Vector3(Math.cos(a)/config.radiusX,Math.sin(a)/config.radiusY,0).normalize();
    const twist=rad(config.twist)*Math.sin(a+index);
    for(let j=0;j<=radial;j++){
      const b=j/radial*Math.PI*2,n=Math.cos(b)*config.width/2,z=Math.sin(b)*config.depth/2;
      const across=n*Math.cos(twist)-z*Math.sin(twist),forward=n*Math.sin(twist)+z*Math.cos(twist);
      positions.push(x+normal.x*across,y+normal.y*across,forward);uv.push(t,j/radial);
    }
  }
  for(let i=0;i<segments;i++)for(let j=0;j<radial;j++){const a=i*(radial+1)+j,b=a+radial+1;indices.push(a,b,a+1,b,b+1,a+1);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
  const normals=g.attributes.normal,n=new THREE.Vector3(),m=new THREE.Vector3();
  for(let j=0;j<=radial;j++){const a=j,b=segments*(radial+1)+j;n.fromBufferAttribute(normals,a).add(m.fromBufferAttribute(normals,b)).normalize();normals.setXYZ(a,n.x,n.y,n.z);normals.setXYZ(b,n.x,n.y,n.z);}
  for(let i=0;i<=segments;i++){const a=i*(radial+1),b=a+radial;n.fromBufferAttribute(normals,a).add(m.fromBufferAttribute(normals,b)).normalize();normals.setXYZ(a,n.x,n.y,n.z);normals.setXYZ(b,n.x,n.y,n.z);}
  g.computeBoundingSphere();return g;
}

export function createPinOrbits(state,materials,roundedBox){
  const pinCore=new THREE.Group(),pinRings=new THREE.Group();
  const core=state.pinCore,rings=state.pinRings;
  const geometry=core.shape==='sphere'?new THREE.SphereGeometry(1,96,64):roundedBox(1,1,1,core.roundness,18);
  const center=new THREE.Mesh(geometry,materials.pinCore);
  center.scale.set(core.width,core.height,core.depth);
  if(core.shape==='sphere')center.scale.multiplyScalar(.5);
  pinCore.add(center);
  const angles=[[65,10,-24],[12,-58,35],[-41,29,67],[78,-35,13]];
  for(let i=0;i<rings.count;i++){
    const band=new THREE.Mesh(orbitalBand(rings,i),materials.pinRings),a=angles[i%angles.length];
    band.rotation.set(rad(a[0]),rad(a[1]+rings.fan*i),rad(a[2]));pinRings.add(band);
  }
  return {pinCore,pinRings};
}

import * as THREE from '../vendor/three.module.js';

const rad=THREE.MathUtils.degToRad;

// Closed lower hemisphere, including a planar circular cut face and a small
// tangent fillet. Unit bounds are 1 × 1 × 1; height scales independently.
export function cappedHemisphere(rim=.012,segments=128,latitudes=64){
  const radius=.5,f=Math.max(.001,Math.min(.08,rim));
  const centerR=Math.sqrt((radius-f)**2-f*f),end=Math.acos(f/(radius-f));
  const profile=[];
  for(let i=0;i<=latitudes;i++){
    const theta=end*i/latitudes;
    profile.push({r:radius*Math.sin(theta),y:-radius*Math.cos(theta),nr:Math.sin(theta),ny:-Math.cos(theta)});
  }
  const start=-Math.asin(f/(radius-f));
  for(let i=1;i<=16;i++){
    const angle=start+(Math.PI/2-start)*i/16;
    profile.push({r:centerR+f*Math.cos(angle),y:-f+f*Math.sin(angle),nr:Math.cos(angle),ny:Math.sin(angle)});
  }
  profile.push({r:0,y:0,nr:0,ny:1});
  const positions=[],normals=[],uv=[],indices=[];
  for(let row=0;row<profile.length;row++){
    const p=profile[row],normal=new THREE.Vector2(p.nr,p.ny/2).normalize();
    for(let j=0;j<=segments;j++){
      const angle=j/segments*Math.PI*2,c=Math.cos(angle),s=Math.sin(angle);
      positions.push(p.r*c,p.y*2+.5,p.r*s);
      normals.push(normal.x*c,normal.y,normal.x*s);uv.push(j/segments,row/(profile.length-1));
    }
  }
  for(let row=0;row<profile.length-1;row++)for(let j=0;j<segments;j++){
    const a=row*(segments+1)+j,b=a+segments+1;
    if(row>0)indices.push(a,b,a+1);
    if(row<profile.length-2)indices.push(b,b+1,a+1);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);
  g.computeBoundingBox();g.computeBoundingSphere();return g;
}

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
  const geometry=core.shape==='hemisphere'?cappedHemisphere(core.rimRoundness):core.shape==='sphere'?new THREE.SphereGeometry(1,96,64):roundedBox(1,1,1,core.roundness,18);
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

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

// A hollow glass bowl: outer hemisphere, rounded lip, and inward-facing
// inner hemisphere. The opening has NO disk across it. Only the glass wall
// is a closed solid, so its real thickness remains visible at the mouth.
export function hollowHemisphere(radius=1.45,thickness=.04,rimRoundness=1,segments=160,latitudes=64){
  const t=Math.min(radius*.2,Math.max(.005,thickness)),inner=radius-t,profile=[];
  for(let i=0;i<=latitudes;i++){
    const a=i/latitudes*Math.PI/2;
    profile.push({r:radius*Math.sin(a),y:-radius*Math.cos(a),nr:Math.sin(a),ny:-Math.cos(a)});
  }
  const lipR=t/2,lipH=lipR*Math.max(.1,rimRoundness);
  for(let i=1;i<=16;i++){
    const a=i/16*Math.PI,n=new THREE.Vector2(Math.cos(a)/lipR,Math.sin(a)/lipH).normalize();
    profile.push({r:radius-lipR+lipR*Math.cos(a),y:lipH*Math.sin(a),nr:n.x,ny:n.y});
  }
  for(let i=1;i<=latitudes;i++){
    const a=(1-i/latitudes)*Math.PI/2;
    profile.push({r:inner*Math.sin(a),y:-inner*Math.cos(a),nr:-Math.sin(a),ny:Math.cos(a)});
  }
  const positions=[],normals=[],uv=[],indices=[];
  for(let row=0;row<profile.length;row++)for(let j=0;j<=segments;j++){
    const p=profile[row],a=j/segments*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
    positions.push(p.r*c,p.y,p.r*s);normals.push(p.nr*c,p.ny,p.nr*s);uv.push(j/segments,row/(profile.length-1));
  }
  for(let row=0;row<profile.length-1;row++)for(let j=0;j<segments;j++){
    const a=row*(segments+1)+j,b=a+segments+1;
    if(row>0)indices.push(a,b,a+1);
    if(row<profile.length-2)indices.push(b,b+1,a+1);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);
  g.computeBoundingBox();g.computeBoundingSphere();return g;
}

// Closed spherical wall, retaining the empty interior of the former bowl.
export function hollowSphere(thickness=.018){
  const outer=new THREE.SphereGeometry(.5,128,96),inner=new THREE.SphereGeometry(.5-Math.min(.49,Math.max(.001,thickness)),128,96);
  const normals=inner.attributes.normal;
  for(let i=0;i<normals.count;i++)normals.setXYZ(i,-normals.getX(i),-normals.getY(i),-normals.getZ(i));
  const inside=inner.index.array;
  for(let i=0;i<inside.length;i+=3){const temp=inside[i+1];inside[i+1]=inside[i+2];inside[i+2]=temp;}
  const geometry=new THREE.BufferGeometry();
  for(const key of ['position','normal','uv']){
    const a=outer.attributes[key],b=inner.attributes[key],array=new Float32Array(a.array.length+b.array.length);
    array.set(a.array);array.set(b.array,a.array.length);geometry.setAttribute(key,new THREE.BufferAttribute(array,a.itemSize));
  }
  geometry.setIndex([...outer.index.array,...inner.index.array].map((v,i)=>i<outer.index.count?v:v+outer.attributes.position.count));
  outer.dispose();inner.dispose();geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
}

export const SHELL_KEYS=['one','two','three','four'];

export function createPinOrbits(state,materials,roundedBox){
  const pinCore=new THREE.Group(),pinRings=new THREE.Group();
  const core=state.pinCore,rings=state.pinRings;
  const geometry=core.shape==='hemisphere'?hollowHemisphere(.5,core.wallThickness/core.width,core.lipRoundness):core.shape==='solidHemisphere'?cappedHemisphere(core.rimRoundness):core.shape==='sphere'?hollowSphere(core.wallThickness/core.width):roundedBox(1,1,1,core.roundness,18);
  const center=new THREE.Mesh(geometry,materials.pinCore);
  center.scale.set(core.width,core.height,core.depth);
  // All hemispheres share their sphere center and equatorial opening plane.
  if(core.shape==='solidHemisphere')center.position.y=-core.height/2;
  if(core.shape==='hemisphere')center.scale.y*=2;
  pinCore.add(center);
  for(let i=0;i<rings.count;i++){
    const cfg=rings.layers[SHELL_KEYS[i]];
    const shell=new THREE.Mesh(hollowHemisphere(rings.radius+i*rings.spacing,rings.wallThickness,rings.rimRoundness,rings.segments),materials[`pinShell${i+1}`]||materials.pinRings);
    shell.rotation.set(rad(cfg.rx),rad(cfg.ry),rad(cfg.rz));shell.userData.shellIndex=i;
    pinRings.add(shell);
  }
  return {pinCore,pinRings};
}

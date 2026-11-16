import * as THREE from '../vendor/three.module.js';

// Elliptical glass cross sections, transported along real spatial spline paths.
// Position and normal share the same moving frame, including the section twist.
function sweptGlass(curve,config,closed){
  const length=config.segments,sides=config.radialSegments,frames=curve.computeFrenetFrames(length,closed);
  const vertices=[],normals=[],uvs=[],indices=[];
  const center=new THREE.Vector3(),offset=new THREE.Vector3(),normal=new THREE.Vector3();
  for(let i=0;i<=length;i++){
    const t=i/length;curve.getPointAt(t,center);
    const twist=THREE.MathUtils.degToRad(config.twist)*Math.sin(t*Math.PI*2);
    const width=config.width/2*(1+.12*Math.sin(t*Math.PI*2)),depth=config.depth/2;
    for(let j=0;j<=sides;j++){
      const a=j/sides*Math.PI*2+twist,cos=Math.cos(a),sin=Math.sin(a);
      offset.copy(frames.normals[i]).multiplyScalar(cos*width).addScaledVector(frames.binormals[i],sin*depth);
      vertices.push(center.x+offset.x,center.y+offset.y,center.z+offset.z);
      normal.copy(frames.normals[i]).multiplyScalar(cos/width).addScaledVector(frames.binormals[i],sin/depth).normalize();normals.push(normal.x,normal.y,normal.z);uvs.push(t,j/sides);
      if(i<length&&j<sides){const a=i*(sides+1)+j,b=a+sides+1;indices.push(a,a+1,b,b,a+1,b+1);}
    }
  }
  // The open sweeping strand tapers at its ends outside the main composition.
  if(!closed){for(const ring of [0,length]){const point=curve.getPointAt(ring/length);for(let j=0;j<=sides;j++){const index=(ring*(sides+1)+j)*3;vertices[index]=point.x;vertices[index+1]=point.y;vertices[index+2]=point.z;}}}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeBoundingSphere();return geometry;
}

export function createGlassLoops(config,material){
  const meshes=[];
  for(let index=0;index<config.count;index++){
    let curve,closed=true;
    if(index<2){
      const points=[];for(let i=0;i<96;i++){
        const t=i/96*Math.PI*2,rx=config.radiusX*(index===1?1.6:1),ry=config.radiusY*(index===1?.7:1);
        points.push(new THREE.Vector3(Math.cos(t)*rx,Math.sin(t)*ry,Math.sin(t*2+index)*config.bend));
      }curve=new THREE.CatmullRomCurve3(points,true,'centripetal');
    }else{
      const x=config.radiusX/2.35,y=config.radiusY/2.5;
      curve=new THREE.CatmullRomCurve3([
        new THREE.Vector3(1.3*x,5*y,-.55),new THREE.Vector3(.15*x,3.1*y,.15),new THREE.Vector3(-1.1*x,1.25*y,.7),new THREE.Vector3(-1.35*x,-.6*y,.65),new THREE.Vector3(-.65*x,-3.3*y,-.5),
      ],false,'centripetal');closed=false;
    }
    const mesh=new THREE.Mesh(sweptGlass(curve,config,closed),material);mesh.castShadow=false;mesh.receiveShadow=false;
    if(index===0){mesh.position.set(.25,-.2,config.spacing);mesh.rotation.set(.22,.6,-.36);}
    if(index===1){mesh.position.set(-.35,-.9,-config.spacing);mesh.rotation.set(.82,-.18,.33);}
    if(index===2)mesh.position.z=config.spacing*.25;
    meshes.push(mesh);
  }
  return meshes;
}

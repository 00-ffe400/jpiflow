import * as THREE from '../vendor/three.module.js';

// Elliptical glass cross sections, transported along real spatial spline paths.
// Position and normal share the same moving frame, including the section twist.
function sweptGlass(curve,config,closed,sculpture=false,support=false){
  const length=config.segments,sides=config.radialSegments,frames=curve.computeFrenetFrames(length,closed);
  const vertices=[],normals=[],uvs=[],indices=[];
  const center=new THREE.Vector3(),offset=new THREE.Vector3(),normal=new THREE.Vector3();
  for(let i=0;i<=length;i++){
    const t=i/length;curve.getPointAt(t,center);
    const twist=THREE.MathUtils.degToRad(config.twist)*Math.sin(t*Math.PI*2);
    const ease=x=>x*x*(3-2*x);
    const end=closed?1:ease(Math.min(1,t/.09))*ease(Math.min(1,(1-t)/.09));
    const taper=sculpture?THREE.MathUtils.lerp(1,Math.max(.015,end),config.taper??.9):1;
    const belly=sculpture?.7+(config.fullness??1)*Math.exp(-Math.pow((t-(support?.62:.49))/.21,2))+.12*Math.sin(t*Math.PI):1+.12*Math.sin(t*Math.PI*2);
    const width=config.width/2*belly*taper*(support?.56:1),depth=config.depth/2*Math.pow(belly,.65)*taper*(support?.64:1);
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
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);
  if(sculpture){
    // Recompute the surface normal after width/taper deformation, then weld the UV seam.
    geometry.computeVertexNormals();const n=geometry.attributes.normal,a=new THREE.Vector3(),b=new THREE.Vector3();
    for(let i=0;i<=length;i++){const first=i*(sides+1),last=first+sides;a.fromBufferAttribute(n,first);b.fromBufferAttribute(n,last);a.add(b).normalize();n.setXYZ(first,a.x,a.y,a.z);n.setXYZ(last,a.x,a.y,a.z);}
  }
  geometry.computeBoundingSphere();return geometry;
}

function createLegacyLoops(config,material){
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

// Deliberately drawn open gestures: an off-centre fold and a lighter counter-stroke.
// Coordinates are editable art direction, not repetitions of a parametric ellipse.
export const SCULPTURES = {
  fold: {
    main:[[-5.6,-2.9,.05],[-3.1,-2.35,.2],[-1.15,-1.5,.65],[.6,-.55,1.0],[2.12,.75,.65],[2.32,2.0,-.05],[1.1,2.8,-.7],[-.45,2.13,-.95],[-1.02,.72,-.65],[-.55,-.45,-.05],[.93,-1.23,.3],[2.85,-2.05,-.05],[6.2,-2.65,-.6]],
    support:[[-3.4,4.8,-.8],[-3.1,3.0,-.55],[-2.25,1.5,.25],[-.9,.68,1.15],[.9,.35,1.5],[2.75,-.15,.9],[4.8,-.8,.0]],
  },
  sweep: {
    main:[[-3.4,5,-.5],[-2.8,3.35,.05],[-1.7,2.3,.85],[.25,2.05,1.25],[2.0,1.03,.6],[2.43,-.47,-.55],[1.1,-1.77,-1.0],[-.8,-2.08,-.3],[-2.2,-3.45,.65],[-2.35,-5.0,.75]],
    support:[[-4.7,-1.9,-.7],[-2.75,-.5,-.8],[-.6,.02,-.45],[1.55,-.2,.5],[3.3,.5,.75],[4.8,2.2,.2]],
  },
  knot: {
    main:[[-4.8,-1.65,-.6],[-2.8,-2.1,-.45],[-.55,-1.5,.55],[1.22,.04,1.15],[2.0,1.72,.6],[.6,2.85,-.2],[-1.55,1.95,-.8],[-1.85,.18,-.6],[-.45,-.78,-.05],[1.6,-1.62,.6],[3.2,-1.12,.25],[4.7,.7,-.65]],
    support:[[-1.3,4.7,1.0],[-.25,2.8,.8],[1.15,1.55,-.55],[2.75,.3,-.9],[3.05,-1.65,-.25],[2.0,-4.3,.85]],
  },
};

export function createGlassLoops(config,material){
  if(config.silhouette==='legacy')return createLegacyLoops(config,material);
  const design=SCULPTURES[config.silhouette]||SCULPTURES.fold;
  const paths=[design.main,design.support,design.support.map(([x,y,z])=>[-x*.85,y*.9-1,-z-.8])];
  return paths.slice(0,config.count).map((path,index)=>{
    const support=index>0,points=path.map(([x,y,z],i)=>new THREE.Vector3(
      x*config.radiusX/2.35,y*config.radiusY/2.5,
      z+(support?config.spacing-.75+Math.sin(i/(path.length-1)*Math.PI)*.8:0)+Math.sin(i/(path.length-1)*Math.PI*2)*config.bend*.3,
    ));
    const curve=new THREE.CatmullRomCurve3(points,false,'centripetal');
    const mesh=new THREE.Mesh(sweptGlass(curve,config,false,true,support),material);
    mesh.castShadow=mesh.receiveShadow=true;mesh.userData.role=support?'counter-stroke':'primary-fold';return mesh;
  });
}

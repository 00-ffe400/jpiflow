import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/addons/loaders/GLTFLoader.js';
import {HDRLoader} from '../vendor/addons/loaders/HDRLoader.js';

const ROOT=new URL('./assets/blender-261101/',import.meta.url);
export async function loadBlenderSource(){
  const [gltf,meta,normal,hdr]=await Promise.all([
    new GLTFLoader().loadAsync(new URL('261101.glb',ROOT).href),
    fetch(new URL('source.json',ROOT)).then(r=>{if(!r.ok)throw Error('원본 모델 정보를 읽지 못했습니다.');return r.json();}),
    new THREE.TextureLoader().loadAsync(new URL('plate-normal.png',ROOT).href),
    new HDRLoader().loadAsync(new URL('environment.hdr',ROOT).href),
  ]);
  normal.flipY=false;normal.colorSpace=THREE.NoColorSpace;
  const plate=gltf.scene.getObjectByName('Cube'),sphere=gltf.scene.getObjectByName('Sphere');
  if(!plate?.isMesh||!sphere?.isMesh)throw Error('Blender 원본 메시를 찾지 못했습니다.');
  // Keep the source vertex positions, smooth normals, UVs, quaternion and origin.
  const plateGeometry=plate.geometry.clone().scale(...plate.scale.toArray());
  // Separate broad surfaces from the original cut walls without changing vertices.
  // This exposes their optical properties independently in the studio.
  const indexed=plateGeometry.index;
  const p=plateGeometry.attributes.position,a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();
  const surfaces=[],walls=[],softWalls=[];plateGeometry.clearGroups();
  for(let start=0;start<(indexed?.count||p.count);start+=3){
    const ids=[0,1,2].map(i=>indexed?indexed.getX(start+i):start+i);
    a.fromBufferAttribute(p,ids[0]);b.fromBufferAttribute(p,ids[1]);c.fromBufferAttribute(p,ids[2]);
    const normal=b.sub(a).cross(c.sub(a)).normalize();
    const materialIndex=Math.abs(normal.z)>.9?0:normal.y<-.2?1:2;
    (materialIndex===0?surfaces:materialIndex===1?walls:softWalls).push(...ids);
  }
  plateGeometry.setIndex([...surfaces,...walls,...softWalls]);plateGeometry.addGroup(0,surfaces.length,0);plateGeometry.addGroup(surfaces.length,walls.length,1);plateGeometry.addGroup(surfaces.length+walls.length,softWalls.length,2);
  const sphereGeometry=sphere.geometry.clone().scale(...sphere.scale.toArray());
  const source={meta,normal,hdr,plateGeometry,sphereGeometry,
    platePosition:plate.position.clone(),plateQuaternion:plate.quaternion.clone(),
    spherePosition:sphere.position.clone(),sphereQuaternion:sphere.quaternion.clone(),
    dispose(){plateGeometry.dispose();sphereGeometry.dispose();normal.dispose();hdr.dispose();},
  };
  const geometries=new Set(),materials=new Set();
  gltf.scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));});
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());
  return source;
}

export function createBlenderModels(state,materials,source){
  const sphere=new THREE.Group(),slabs=new THREE.Group(),rings=new THREE.Group();
  const p=state.slabs,s=state.sphere;
  const plateGeometry=source.plateGeometry.clone();
  if(p.smoothCuts){
    const positions=plateGeometry.attributes.position,normals=plateGeometry.attributes.normal;
    for(let i=0;i<positions.count;i++){
      const x=positions.getX(i),y=positions.getY(i),radius=Math.hypot(x,y);
      if(Math.abs(normals.getZ(i))<.5&&radius<.9&&radius>.01)normals.setXYZ(i,-x/radius,-y/radius,0);
    }
  }
  const sphereGeometry=s.smooth?new THREE.SphereGeometry(source.meta.sphere.radius,s.segments,Math.max(16,Math.round(s.segments*.75))):source.sphereGeometry.clone();
  const ball=new THREE.Mesh(sphereGeometry,materials.sphere);
  ball.quaternion.copy(source.sphereQuaternion);
  ball.scale.setScalar(s.radius/source.meta.sphere.radius);sphere.add(ball);
  const normal=new THREE.Vector3(...source.meta.plate.normal);
  for(let i=0;i<p.count;i++){
    const plate=new THREE.Mesh(plateGeometry,[materials.slabs,materials.slabEdge,materials.slabSide]);
    plate.position.copy(normal).multiplyScalar(i*p.spacing);
    plate.position.x+=i*p.offsetX;plate.position.z+=i*p.offsetZ;
    plate.quaternion.copy(source.plateQuaternion);plate.rotateZ(THREE.MathUtils.degToRad(i*p.fan));
    plate.scale.set(p.width/source.meta.plate.dimensions[0],p.depth/source.meta.plate.dimensions[2],p.thickness/source.meta.plate.dimensions[1]);
    slabs.add(plate);
  }
  return {sphere,slabs,rings};
}

import * as THREE from '../vendor/three.module.js';

// Resolve glass sheets from far to near. Each sheet refracts the completed
// image behind it, including the other glass, instead of replacing it with
// the opaque-only transmission buffer used by a single scene pass.
export function createGlassComposite(renderer){
  const targets=[0,1].map(()=>new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,depthBuffer:true,colorSpace:THREE.LinearSRGBColorSpace}));
  const size=new THREE.Vector2(),center=new THREE.Vector3();
  return {
    setSamples(samples){for(const target of targets)if(target.samples!==samples){target.samples=samples;target.dispose();}},
    render(scene,camera,root,destination=null){
      const plates=root.visible?root.children.filter(o=>o.visible):[];
      if(!plates.length){renderer.setRenderTarget(destination);renderer.render(scene,camera);return;}
      renderer.getDrawingBufferSize(size);
      for(const target of targets)if(target.width!==size.x||target.height!==size.y)target.setSize(size.x,size.y);
      const background=scene.background,visibility=plates.map(o=>o.visible),writes=new Map();
      const plateSet=new Set(plates);
      scene.traverseVisible(o=>{if(o.isMesh&&!plateSet.has(o))for(const m of Array.isArray(o.material)?o.material:[o.material])if(!writes.has(m))writes.set(m,m.colorWrite);});
      const ordered=plates.map(plate=>({plate,z:plate.getWorldPosition(center).applyMatrix4(camera.matrixWorldInverse).z})).sort((a,b)=>a.z-b.z);
      try{
        plates.forEach(o=>o.visible=false);
        renderer.setRenderTarget(targets[0]);renderer.render(scene,camera);
        // Keep opaque depth for correct sphere occlusion; preserve its color
        // already present in the previous image rather than painting over glass.
        for(const m of writes.keys())m.colorWrite=false;
        let previous=targets[0];
        for(let i=0;i<ordered.length;i++){
          const plate=ordered[i].plate;plate.visible=true;scene.background=previous.texture;
          const output=i===ordered.length-1?destination:targets[previous===targets[0]?1:0];
          renderer.setRenderTarget(output);renderer.render(scene,camera);
          plate.visible=false;previous=output;
        }
      }finally{
        plates.forEach((o,i)=>o.visible=visibility[i]);scene.background=background;
        for(const [m,colorWrite]of writes)m.colorWrite=colorWrite;
        renderer.setRenderTarget(destination);
      }
    },
    dispose(){targets.forEach(target=>target.dispose());}
  };
}

import * as THREE from '../vendor/three.module.js';
import {FXAAShader} from '../vendor/addons/shaders/FXAAShader.js';

// Object-center sorting cannot order nested bowls. Peel actual visible surface
// depths first (independent of opacity), then shade those layers back to front.
// Every PBR layer refracts the already completed image behind that surface.
export function createHemisphereComposite(renderer){
  const depths=[],colors=[0,1].map(()=>new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,depthBuffer:true,colorSpace:THREE.LinearSRGBColorSpace}));
  const size=new THREE.Vector2(),installed=new Map();
  const screen=new THREE.Scene(),screenCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  const resolveMaterial=new THREE.ShaderMaterial({...FXAAShader,uniforms:THREE.UniformsUtils.clone(FXAAShader.uniforms),depthTest:false,depthWrite:false,
    fragmentShader:FXAAShader.fragmentShader.replace('gl_FragColor = ApplyFXAA( tDiffuse, resolution.xy, vUv );','gl_FragColor = ApplyFXAA( tDiffuse, resolution.xy, vUv );\n#include <tonemapping_fragment>\n#include <colorspace_fragment>')});
  const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),resolveMaterial);screen.add(quad);
  const depthUniforms={uPeelPrior:{value:null},uPeelSize:{value:size},uPeelHasPrior:{value:false}};
  const colorUniforms={uPeelSurface:{value:null},uPeelSize:{value:size},uPeelEnabled:{value:false}};
  const depthMaterial=new THREE.MeshDepthMaterial({depthTest:true,depthWrite:true,colorWrite:false,side:THREE.FrontSide});
  depthMaterial.onBeforeCompile=shader=>{
    Object.assign(shader.uniforms,depthUniforms);
    shader.fragmentShader=`uniform sampler2D uPeelPrior;uniform vec2 uPeelSize;uniform bool uPeelHasPrior;\n${shader.fragmentShader}`.replace('void main() {',`void main() {
      if(uPeelHasPrior && gl_FragCoord.z<=texture2D(uPeelPrior,gl_FragCoord.xy/uPeelSize).r+0.0000003)discard;`);
  };
  function install(material){
    if(installed.has(material))return;
    const compile=material.onBeforeCompile,key=material.customProgramCacheKey;
    installed.set(material,{compile,key});
    material.onBeforeCompile=function(shader,renderer){
      compile.call(this,shader,renderer);Object.assign(shader.uniforms,colorUniforms);
      shader.fragmentShader=`uniform sampler2D uPeelSurface;uniform vec2 uPeelSize;uniform bool uPeelEnabled;\n${shader.fragmentShader}`.replace('void main() {',`void main() {
        if(uPeelEnabled){float surface=texture2D(uPeelSurface,gl_FragCoord.xy/uPeelSize).r;
          if(surface>=1.0||abs(gl_FragCoord.z-surface)>0.0000003)discard;}`);
    };
    material.customProgramCacheKey=function(){return key.call(this)+'|hemisphere-depth-peel-v1';};
    material.needsUpdate=true;
  }
  function shown(mesh){for(let node=mesh;node;node=node.parent)if(!node.visible)return false;return true;}
  return {
    render(scene,camera,objects,destination=null){
      const bodies=objects.filter(shown);
      if(!bodies.length){renderer.setRenderTarget(destination);renderer.render(scene,camera);return;}
      renderer.getDrawingBufferSize(size);
      const layers=bodies.length*2;
      while(depths.length<layers){
        const target=new THREE.WebGLRenderTarget(1,1,{depthBuffer:true,minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter});
        target.depthTexture=new THREE.DepthTexture(1,1,THREE.UnsignedIntType);depths.push(target);
      }
      for(const target of [...depths,...colors])if(target.width!==size.x||target.height!==size.y)target.setSize(size.x,size.y);
      const background=scene.background,override=scene.overrideMaterial,bodySet=new Set(bodies),visibility=new Map(),writes=new Map();
      scene.traverse(o=>{if(o.isMesh){visibility.set(o,o.visible);if(!bodySet.has(o))for(const material of Array.isArray(o.material)?o.material:[o.material])if(!writes.has(material))writes.set(material,material.colorWrite);}});
      for(const mesh of bodies)install(mesh.material);
      try{
        // Depth peeling sees the model surfaces only. A depth-only override
        // prevents alpha/transmission changes from affecting layer membership.
        for(const mesh of visibility.keys())if(!bodySet.has(mesh))mesh.visible=false;
        scene.background=null;scene.overrideMaterial=depthMaterial;
        for(let i=0;i<layers;i++){
          depthUniforms.uPeelHasPrior.value=i>0;depthUniforms.uPeelPrior.value=i?depths[i-1].depthTexture:null;
          renderer.setRenderTarget(depths[i]);renderer.render(scene,camera);
        }
        scene.overrideMaterial=override;scene.background=background;
        for(const [mesh,visible]of visibility)mesh.visible=bodySet.has(mesh)?false:visible;
        colorUniforms.uPeelEnabled.value=false;
        renderer.setRenderTarget(colors[0]);renderer.render(scene,camera);
        // Preserve non-model depth, without painting it over completed colors.
        for(const material of writes.keys())material.colorWrite=false;
        for(const mesh of bodies)mesh.visible=true;
        colorUniforms.uPeelEnabled.value=true;
        let previous=colors[0];
        for(let i=layers-1;i>=0;i--){
          colorUniforms.uPeelSurface.value=depths[i].depthTexture;scene.background=previous.texture;
          const output=colors[previous===colors[0]?1:0];
          renderer.setRenderTarget(output);renderer.render(scene,camera);previous=output;
        }
        // A depth texture contains one depth per pixel. Using MSAA on masked
        // surface passes would punch sample-dependent holes near silhouettes.
        // Resolve antialiasing only after the complete color image is assembled.
        resolveMaterial.uniforms.tDiffuse.value=previous.texture;
        resolveMaterial.uniforms.resolution.value.set(1/size.x,1/size.y);
        renderer.setRenderTarget(destination);renderer.render(screen,screenCamera);
      }finally{
        colorUniforms.uPeelEnabled.value=false;scene.background=background;scene.overrideMaterial=override;
        for(const [mesh,visible]of visibility)mesh.visible=visible;
        for(const [material,write]of writes)material.colorWrite=write;
        renderer.setRenderTarget(destination);
      }
    },
    dispose(){
      for(const target of [...depths,...colors]){target.depthTexture?.dispose();target.dispose();}
      depthMaterial.dispose();quad.geometry.dispose();resolveMaterial.dispose();
      for(const [material,{compile,key}]of installed){material.onBeforeCompile=compile;material.customProgramCacheKey=key;material.needsUpdate=true;}
      installed.clear();
    },
  };
}

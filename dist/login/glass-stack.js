import * as THREE from '../vendor/three.module.js';

// Every visible part is closed geometry. Optical thickness belongs to the material,
// while slab thickness and torus cross-section belong to these meshes.
export function createGlassStack(state,materials,roundedBox){
  const sphere=new THREE.Group(),slabs=new THREE.Group(),rings=new THREE.Group();
  const s=state.sphere,p=state.slabs,r=state.rings;
  const ball=new THREE.Mesh(new THREE.SphereGeometry(s.radius,96,64),materials.sphere);
  ball.castShadow=false;sphere.add(ball);
  const slabGeometry=roundedBox(p.width,p.thickness,p.depth,p.bevel,12);
  for(let i=0;i<p.count;i++){
    const plate=new THREE.Mesh(slabGeometry,[materials.slabSide,materials.slabSide,materials.slabs,materials.slabs,materials.slabEdge,materials.slabSide]);
    plate.position.set(i*p.offsetX,-i*p.spacing,i*p.offsetZ);
    plate.rotation.y=THREE.MathUtils.degToRad(i*p.fan);
    slabs.add(plate);
  }
  const ringGeometry=new THREE.TorusGeometry(r.radius,r.tube,24,160);
  for(let i=0;i<r.count;i++){
    const ring=new THREE.Mesh(ringGeometry,materials.rings);
    ring.rotation.x=-Math.PI/2;
    ring.rotateOnWorldAxis(new THREE.Vector3(1,0,0),THREE.MathUtils.degToRad(r.tiltX));
    ring.rotateOnWorldAxis(new THREE.Vector3(0,0,1),THREE.MathUtils.degToRad(r.tiltZ));
    ring.position.set(i*r.offsetX,-i*r.spacing,i*r.offsetZ);
    rings.add(ring);
  }
  return {sphere,slabs,rings};
}

// A real depth buffer drives the lens blur, rather than blurring a still image.
// Small Poisson taps retain the crisp cobalt sphere and soften distant glass edges.
export function createDepthLens(renderer){
  const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,depthBuffer:true});
  target.samples=4;
  target.depthTexture=new THREE.DepthTexture(1,1,THREE.UnsignedIntType);
  const depthTarget=new THREE.WebGLRenderTarget(1,1,{depthBuffer:true});depthTarget.depthTexture=new THREE.DepthTexture(1,1,THREE.UnsignedIntType);
  const depthMaterial=new THREE.MeshDepthMaterial({side:THREE.DoubleSide});depthMaterial.colorWrite=false;
  const uniforms={image:{value:target.texture},depth:{value:depthTarget.depthTexture},resolution:{value:new THREE.Vector2(1,1)},near:{value:.1},far:{value:200},ortho:{value:false},focus:{value:12},range:{value:4},strength:{value:3}};
  const material=new THREE.ShaderMaterial({uniforms,depthTest:false,depthWrite:false,transparent:false,
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader:`
      varying vec2 vUv;
      uniform sampler2D image;uniform sampler2D depth;uniform vec2 resolution;
      uniform float near;uniform float far;uniform bool ortho;
      uniform float focus;uniform float range;uniform float strength;
      float distanceAt(vec2 uv){float d=texture2D(depth,uv).x;return ortho?mix(near,far,d):near*far/(far-d*(far-near));}
      void main(){
        float z=distanceAt(vUv);
        float coc=clamp(abs(z-focus)/max(range,.1),0.,1.)*strength;
        if(z>far*.99)coc=0.;
        vec4 sum=texture2D(image,vUv);float weight=1.;
        for(int i=0;i<16;i++){
          float angle=float(i)*2.39996323;
          vec2 delta=vec2(cos(angle),sin(angle))*sqrt((float(i)+.5)/16.)*coc/resolution;
          vec2 uv=clamp(vUv+delta,vec2(0.),vec2(1.));
          float sampleZ=distanceAt(uv);
          // Avoid smearing a focused object across background and near edges.
          float w=sampleZ<z-.4&&abs(sampleZ-focus)<.3?.08:1.;
          sum+=texture2D(image,uv)*w;weight+=w;
        }
        gl_FragColor=sum/weight;
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`});
  const screen=new THREE.Scene(),camera=new THREE.Camera(),geometry=new THREE.PlaneGeometry(2,2);
  screen.add(new THREE.Mesh(geometry,material));const size=new THREE.Vector2();
  return {
    setSamples(count){if(target.samples!==count){target.samples=count;target.dispose();}},
    render(scene,view,config,focusPoint){
      if(!config.enabled||config.strength===0){renderer.render(scene,view);return;}
      renderer.getDrawingBufferSize(size);
      if(target.width!==size.x||target.height!==size.y){target.setSize(size.x,size.y);depthTarget.setSize(size.x,size.y);uniforms.resolution.value.copy(size);}
      uniforms.near.value=view.near;uniforms.far.value=view.far;uniforms.ortho.value=view.isOrthographicCamera===true;
      uniforms.focus.value=-focusPoint.clone().applyMatrix4(view.matrixWorldInverse).z+config.offset;
      uniforms.range.value=config.range;uniforms.strength.value=config.strength*renderer.getPixelRatio();
      const oldOverride=scene.overrideMaterial,oldBackground=scene.background;
      try{scene.overrideMaterial=depthMaterial;scene.background=null;renderer.setRenderTarget(depthTarget);renderer.render(scene,view);}
      finally{scene.overrideMaterial=oldOverride;scene.background=oldBackground;}
      renderer.setRenderTarget(target);renderer.render(scene,view);
      renderer.setRenderTarget(null);renderer.render(screen,camera);
    },
    dispose(){target.dispose();target.depthTexture.dispose();depthTarget.dispose();depthTarget.depthTexture.dispose();depthMaterial.dispose();geometry.dispose();material.dispose();}
  };
}

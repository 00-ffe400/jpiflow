import * as THREE from '../vendor/three.module.js';
import {createGradientRotation} from './gradient-motion.js';

// Object-space PBR color: no texture seams, no extra mesh, and compatible with
// the subsequent depth-peeling shader hook used for transparent hemispheres.
export function installCoreGradient(material){
  const rotation=createGradientRotation();
  const uniforms={
    uCoreGradientMode:{value:0},uCoreGradientDirection:{value:0},
    uCoreGradientA:{value:new THREE.Color()},uCoreGradientB:{value:new THREE.Color()},uCoreGradientC:{value:new THREE.Color()},
    uCoreGradientMin:{value:new THREE.Vector3(-.5,-.5,-.5)},uCoreGradientSize:{value:new THREE.Vector3(1,1,1)},
    uCoreGradientAngle:{value:Math.PI/4},uCoreGradientWidth:{value:1},uCoreGradientOffset:{value:0},
    uCoreGradientMid:{value:.5},uCoreGradientTintEmission:{value:1},uCoreGradientEmission:{value:0},
    uCoreGradientRotation:{value:new THREE.Matrix3()},
  };
  const compile=material.onBeforeCompile,key=material.customProgramCacheKey;
  material.onBeforeCompile=function(shader,renderer){
    compile.call(this,shader,renderer);Object.assign(shader.uniforms,uniforms);
    shader.vertexShader='varying vec3 vCoreGradientPosition;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvCoreGradientPosition=position;');
    shader.fragmentShader=`
      varying vec3 vCoreGradientPosition;
      uniform float uCoreGradientMode,uCoreGradientDirection,uCoreGradientAngle,uCoreGradientWidth,uCoreGradientOffset,uCoreGradientMid,uCoreGradientTintEmission,uCoreGradientEmission;
      uniform vec3 uCoreGradientA,uCoreGradientB,uCoreGradientC,uCoreGradientMin,uCoreGradientSize;
      uniform mat3 uCoreGradientRotation;
      vec3 coreGradientColor(){
        vec3 p=uCoreGradientRotation*((vCoreGradientPosition-uCoreGradientMin)/uCoreGradientSize-0.5)+0.5;
        float t=p.y;
        if(uCoreGradientDirection>0.5&&uCoreGradientDirection<1.5)t=p.x;
        else if(uCoreGradientDirection>1.5&&uCoreGradientDirection<2.5)t=p.z;
        else if(uCoreGradientDirection>2.5&&uCoreGradientDirection<3.5)t=0.5+dot(p.xy-0.5,vec2(cos(uCoreGradientAngle),sin(uCoreGradientAngle)));
        else if(uCoreGradientDirection>3.5)t=length((p.xy-0.5)*2.0);
        t=clamp((t-0.5)/uCoreGradientWidth+0.5+uCoreGradientOffset,0.0,1.0);
        if(uCoreGradientMode<1.5)return mix(uCoreGradientA,uCoreGradientB,t);
        return t<uCoreGradientMid?mix(uCoreGradientA,uCoreGradientB,t/uCoreGradientMid):mix(uCoreGradientB,uCoreGradientC,(t-uCoreGradientMid)/(1.0-uCoreGradientMid));
      }
      ${shader.fragmentShader}`;
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nif(uCoreGradientMode>0.5)diffuseColor.rgb=coreGradientColor();');
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nif(uCoreGradientMode>0.5&&uCoreGradientTintEmission>0.5)totalEmissiveRadiance=coreGradientColor()*uCoreGradientEmission;');
  };
  material.customProgramCacheKey=function(){return key.call(this)+'|core-gradient-v2';};material.needsUpdate=true;
  return {
    animate(settings,frame){uniforms.uCoreGradientRotation.value.copy(rotation.update(settings,frame));},
    restart(){rotation.reset();},
    update(settings,emission){
      uniforms.uCoreGradientMode.value={solid:0,two:1,three:2}[settings.mode];
      uniforms.uCoreGradientDirection.value={vertical:0,horizontal:1,depth:2,angle:3,radial:4}[settings.direction];
      uniforms.uCoreGradientA.value.set(settings.color1);uniforms.uCoreGradientB.value.set(settings.color2);uniforms.uCoreGradientC.value.set(settings.color3);
      uniforms.uCoreGradientAngle.value=THREE.MathUtils.degToRad(settings.angle);uniforms.uCoreGradientWidth.value=settings.width;
      uniforms.uCoreGradientOffset.value=settings.offset;uniforms.uCoreGradientMid.value=settings.midpoint;
      uniforms.uCoreGradientTintEmission.value=Number(settings.tintEmission);uniforms.uCoreGradientEmission.value=emission;
    },
    setGeometry(geometry){
      if(!geometry.boundingBox)geometry.computeBoundingBox();
      uniforms.uCoreGradientMin.value.copy(geometry.boundingBox.min);
      geometry.boundingBox.getSize(uniforms.uCoreGradientSize.value).max(new THREE.Vector3(.0001,.0001,.0001));
    },
  };
}

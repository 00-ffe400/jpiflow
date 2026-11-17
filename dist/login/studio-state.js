export const GROUPS = {all:'전체',sphere:'코발트 구',slabs:'유리판',rings:'유리 링',loops:'유리 곡선',tiles:'바닥 타일',pedestal:'중앙 받침대',crystal:'중앙 크리스탈'};
export const TABS = ['구도','형태·배열','색상·재질','조명·반사','그림자·배경','모션','저장'];
export const clone = value => structuredClone(value);
const transform = () => ({visible:true,x:0,y:0,z:0,rx:0,ry:0,rz:0,scale:1});
const material = (color,roughness,metalness,transmission=0) => ({preset:transmission?'glass':'satin',color,opacity:1,roughness,metalness,transmission,reflection:1.2,ior:1.46,opticalThickness:1.2,attenuationColor:'#6ac8ff',attenuationDistance:6,coat:1,coatRoughness:.12,emissive:'#003977',emission:0});
const camera = () => ({type:'perspective',distance:17,azimuth:39,elevation:39,targetX:0,targetY:.6,targetZ:0,fov:36,zoom:1,fit:'fill',padding:.12});
const light = (type,color,intensity,x,y,z,shadow=false) => ({type,enabled:true,color,intensity,x,y,z,targetX:0,targetY:0,targetZ:0,shadow});
function proceduralDefaults(){return {
  version:2,model:'glassStack',modelRevision:3,look:'002-glass-stack',
  geometry:{source:'procedural002',revision:1},
  scene:{...transform(),scale:1},
  sphere:{...transform(),x:-.95,y:1.14,z:-.7,radius:1.08,smooth:false,segments:128,surfaceRevision:0,material:{...material('#2e2fae',.055,0),reflection:.012,coat:.08,coatRoughness:.09,attenuationColor:'#ffffff',emissive:'#202ca6',emission:.35},motion:{paused:false,type:'float',dipRevision:0,depth:.62,duration:6,height:.045,speed:.22,spinX:0,spinY:0,spinZ:0}},
  slabs:{...transform(),x:-.8,width:8.9,depth:5.7,thickness:.16,bevel:.008,count:4,spacing:2.15,offsetX:1.4,offsetZ:.4,fan:0,edgeColor:'#303b49',edgeTransmission:.2,sideColor:'#a6a7b3',sideTransmission:.88,optics:'standard',glassRevision:0,smoothCuts:false,edgeOpticalThickness:2,edgeAbsorptionColor:'#96a6b8',edgeAbsorptionDistance:1,normalStrength:1,edgeOpacity:1,sideOpacity:1,material:{...material('#f1f2f5',.025,0,1),reflection:.25,ior:1.5,opticalThickness:.16,attenuationColor:'#c4cbd3',attenuationDistance:8,coat:0,coatRoughness:.04,emissive:'#000000'},motion:{paused:false,height:0,speed:0,spinX:0,spinY:0,spinZ:0}},
  rings:{...transform(),x:-1.15,y:.95,z:1.2,radius:1.12,tube:.065,tiltX:-23,tiltZ:28,count:3,spacing:2.15,offsetX:1.4,offsetZ:.4,material:{...material('#b9c4d0',.035,0,.96),reflection:1.2,ior:1.5,opticalThickness:.14,attenuationColor:'#b9c4d0',attenuationDistance:1.5,coat:.35,emissive:'#000000'},motion:{paused:false,height:0,speed:0,spinX:0,spinY:0,spinZ:0}},
  lens:{enabled:true,strength:5.5,range:2.6,sharpRange:0,detailRevision:0,offset:0},
  loops:{...transform(),rz:-8,shapeRevision:2,silhouette:'sweep',preview:'clay',count:2,radiusX:2.35,radiusY:2.5,width:.48,depth:.38,bend:.55,twist:48,spacing:.75,fullness:.9,taper:.9,segments:240,radialSegments:24,material:{...material('#9bdaf6',.035,0,.92),reflection:2.3,ior:1.75,opticalThickness:.65,attenuationColor:'#69c5ed',attenuationDistance:1.8,coatRoughness:.055},motion:{paused:false,height:.06,speed:.15,spinX:0,spinY:1.2,spinZ:.25,tilt:1.5}},
  camera:{...camera(),type:'orthographic',distance:23.5,azimuth:-36,elevation:40,targetX:-.8,targetY:-1.15,targetZ:-.3,fov:38,padding:0},mobileCamera:{...camera(),type:'orthographic',distance:15,azimuth:-36,elevation:40,targetX:-.8,targetY:-.5,targetZ:-.3,fov:38,padding:0},
  mobile:{enabled:true,scale:1,x:0,y:0,z:0},
  tiles:{...transform(),rows:11,columns:11,width:1.03,depth:1.03,thickness:.25,crown:.03,gapX:.1,gapZ:.1,roundness:.055,segments:6,stagger:false,holeX:3,holeZ:3,slope:0,jitterHeight:0,jitterRotation:0,jitterScale:0,seed:365,overrides:{},material:{...material('#0c2b58',.32,.35),preset:'blueSoft',coat:.16,coatRoughness:.42,reflection:1.05},motion:{paused:false,type:'ripple',height:.025,speed:.7,wavelength:3,direction:0,delay:.08,phase:0}},
  pedestal:{...transform(),width:2.95,depth:2.95,height:.38,layers:3,shrink:.09,gap:.055,roundness:.06,segments:6,autoFit:false,linkCrystal:false,edgeVisible:true,edgeWidth:.018,edgeColor:'#299bdd',edgeEmission:.22,material:{...material('#16417a',.34,.25),preset:'blueSoft',coat:.18,coatRoughness:.4,reflection:1},motion:{paused:false,height:0,speed:.4,spin:0,pulse:.15,linkCrystal:false}},
  crystal:{...transform(),shape:'chamfer',width:1.65,height:1.65,depth:1.65,lockRatio:false,roundness:.065,bevel:.08,segments:10,flat:false,twist:0,floatGap:.55,outer:true,material:material('#168dff',.065,0,.91),core:{visible:true,shape:'octahedron',count:1,size:.43,spacing:.45,x:0,y:0,z:0,rx:0,ry:20,rz:15,color:'#5bddff',opacity:1,emission:.35,linked:true},motion:{paused:false,height:.12,speed:.55,spinX:0,spinY:4,spinZ:0,tilt:3,coreSpin:10,coreFloat:.04,phase:0,pulseSpeed:.5,pulseStrength:.1}},
  environment:{intensity:1,rotation:0,blur:.12,exposure:.85},
  lights:{key:light('directional','#ffffff',2.3,1,7,5),fill:light('directional','#d5d5e8',.35,-5,3,2),rim:{...light('point','#ffffff',5,-4,1,5),enabled:false},ambient:light('ambient','#e3dfea',1.8,0,0,0),base:{...light('point','#ffffff',0,0,.5,0),enabled:false}},
  background:{mode:'gradient',color:'#b4acbe',color2:'#aaa3b5',angle:155,ground:false,groundColor:'#061124',groundRoughness:.6,shadowOpacity:.28,shadowSoftness:3,fog:false,fogColor:'#02060c',fogNear:17,fogFar:44},
  motion:{paused:true,reduced:false,mode:'auto',progress:0,scrollStart:0,scrollEnd:1500,smoothness:.14,parallax:0,hoverLift:.06,hoverScale:1.025},
  render:{quality:'auto'},links:{material:false},
};}

export function defaults(){
  const state=proceduralDefaults();state.geometry.source='blend261101';state.modelRevision=4;state.look='blender-261101';
  Object.assign(state.sphere,{x:0,y:0,z:0,radius:.3548051416873932,smooth:false});
  Object.assign(state.sphere.material,{color:'#4942bd',emissive:'#323cab',emission:.6});
  Object.assign(state.slabs,{x:0,y:0,z:0,width:2,depth:2,thickness:.09629608348561192,count:6,spacing:.6740725843992834,offsetX:0,offsetZ:0,fan:0,normalStrength:.35,edgeColor:'#697785',edgeTransmission:.8,edgeOpacity:.94,sideColor:'#c6c9d2',sideTransmission:1,sideOpacity:.35});
  Object.assign(state.slabs.material,{color:'#ffffff',opacity:.18,roughness:.1,transmission:1,reflection:.85,ior:1.5,opticalThickness:.0963,attenuationColor:'#d5d9e2',attenuationDistance:5,coat:0});
  state.camera={...camera(),type:'perspective',distance:5.33903848262266,azimuth:-7.0400043108084,elevation:-6.08001167639109,targetX:-1.28761343660492,targetY:3.048034113083332,targetZ:.213114785468566,fov:39.5977553357713,padding:0};
  state.mobileCamera={...state.camera,fov:32};state.mobile.scale=1;
  state.lens={enabled:true,strength:6,range:.65,offset:0};
  state.lights={key:light('point','#ffffff',159,4.0762453,9.4124508,.8374953),fill:light('point','#ffffff',1.2,.1257412,-.481882,1.2957581),rim:{...state.lights.rim,enabled:false},ambient:light('ambient','#ffffff',1.4,0,0,0),base:{...state.lights.base,enabled:false}};
  state.background.color='#b0a9bd';
  state.sphere.motion.height=.02;applySphereDip(state);applySphereDetail(state);applyGlassOptics(state);state.environment.intensity=.85;
  return state;
}

const n=(key,label,min,max,step=.01,unit='',hint='')=>({key,label,type:'number',min,max,step,unit,hint});
const b=(key,label,hint='')=>({key,label,type:'boolean',hint});
const c=(key,label,hint='')=>({key,label,type:'color',hint});
const s=(key,label,options,hint='')=>({key,label,type:'select',options,hint});
const pose=[n('x','좌우 위치',-15,15,.01,'u'),n('y','높이',-5,12,.01,'u'),n('z','앞뒤 위치',-15,15,.01,'u'),n('rx','X 회전',-180,180,1,'°'),n('ry','Y 회전',-180,180,1,'°'),n('rz','Z 회전',-180,180,1,'°'),n('scale','크기 배율',.1,3,.01,'×')];
const matFields=[s('material.preset','재질 프리셋',{glass:'투명 유리',frosted:'불투명 유리',satin:'새틴',silver:'실버',matte:'무광',blueSoft:'코발트 · 소프트 새틴'}),c('material.color','기본 색상'),n('material.opacity','불투명도',.05,1,.01,'','형상의 불투명도. 유리 투과율과 별개입니다.'),n('material.transmission','유리 투과율',0,1,.01,'','금속성이 높으면 유리 투과가 약해집니다.'),n('material.roughness','표면 거칠기',.02,1,.005),n('material.metalness','금속성',0,1),n('material.reflection','반사 강도',0,3),n('material.ior','굴절률',1,2.3,.01,'IOR'),n('material.opticalThickness','굴절 계산용 두께',.01,6,.01,'u','실제 지오메트리 두께를 변경하지 않습니다.'),c('material.attenuationColor','내부 흡수 색상'),n('material.attenuationDistance','색 흡수 거리',.1,20,.1,'u'),n('material.coat','코팅 강도',0,1),n('material.coatRoughness','코팅 거칠기',.02,1),c('material.emissive','자체 발광 색상'),n('material.emission','자체 발광 강도',0,3)];
const cameraFields=[s('type','카메라',{perspective:'원근',orthographic:'직교'}),n('distance','카메라 거리',.8,45,.1,'u'),n('azimuth','좌우 방향',-180,180,.1,'°'),n('elevation','내려다보는 각도',-80,85,.1,'°'),n('targetX','바라보는 지점 X',-8,8,.05,'u'),n('targetY','바라보는 지점 Y',-3,8,.05,'u'),n('targetZ','바라보는 지점 Z',-8,8,.05,'u'),n('fov','원근 시야각',15,80,.1,'°'),n('zoom','직교 확대율',.2,3,.01,'×'),s('fit','프레이밍',{fit:'전체 보기',fill:'화면 채우기'},'전체 보기는 장면 경계에 맞춰 카메라를 자동으로 확보합니다.'),n('padding','보기 여백',0,.6,.01,'비율')];
export function fieldsFor(target,tab,profile='camera',lightId='key',geometrySource='blend261101'){
  let prefix=target==='all'?'scene':target;
  const wrap=(fields,p=prefix)=>fields.map(f=>({...f,path:`${p}.${f.key}`}));
  if(tab==='구도'){
    if(target!=='all')return wrap([b('visible','그룹 표시'),...pose]);
    return [...wrap(pose),...wrap(cameraFields,profile),...wrap([b('enabled','피사계 심도 사용','구를 초점으로 삼고 앞뒤 유리판을 흐리게 만듭니다.'),n('strength','렌즈 흐림 강도',0,10,.1,'px'),n('sharpRange','구 주변 선명 범위',0,2,.05,'u','구 앞뒤의 이 깊이 범위는 흐리지 않습니다. 구와 가까운 구멍 테두리를 함께 선명하게 유지합니다.'),n('range','흐림 전환 거리',.5,12,.05,'u','선명한 영역 밖에서 서서히 흐려지는 거리입니다.'),n('offset','초점 앞뒤 이동',-8,8,.05,'u')],'lens'),...wrap([b('enabled','모바일 전용 설정'),n('scale','모바일 크기',.2,2,.01,'×'),n('x','모바일 X',-5,5,.05,'u'),n('y','모바일 Y',-5,5,.05,'u'),n('z','모바일 Z',-5,5,.05,'u')],'mobile')];
  }
  if(tab==='색상·재질')return target==='all'?[]:wrap([...matFields,...(target==='slabs'&&geometrySource==='blend261101'?[n('edgeOpticalThickness','단면 굴절 경로 길이',.1,4,.01,'u','얇은 윗면과 달리 절단면에서는 판 안쪽을 가로질러 빛이 이동합니다.'),c('edgeAbsorptionColor','단면 내부 흡수 색상'),n('edgeAbsorptionDistance','단면 색 흡수 거리',.2,6,.05,'u')]:[])]);
  if(tab==='형태·배열'){
    if(target==='sphere')return wrap([b('visible','구 표시'),n('radius','구 반지름',.1,2.5,.001,'u'),...(geometrySource==='blend261101'?[b('smooth','고밀도 구 메시','켜면 구를 촘촘하게 재생성합니다. 끄면 Blender 원본 메시를 사용합니다.'),n('segments','구 가로 분할 수',32,192,1,'분할','세로 분할은 가로의 75%입니다. 기본 128 × 96 분할로 윤곽과 반사를 매끈하게 만듭니다.')]:[])]);
    if(target==='slabs'&&geometrySource==='blend261101')return wrap([b('visible','유리판 표시'),s('optics','겹친 유리 표현',{layered:'겹침 굴절 · 원본 재질 방향',standard:'기본 렌더 · 가벼운 처리'},'겹침 굴절은 뒤쪽 유리까지 투과해 보이도록 순서대로 렌더합니다.'),b('smoothCuts','구멍 단면을 매끈하게','형상은 그대로 두고 원형 구멍의 반사 노멀을 매끈하게 연결합니다.'),n('width','원본 판 가로',.3,10,.01,'u','원형 구멍을 포함한 원본 메시를 가로로 조절합니다.'),n('depth','원본 판 세로',.3,10,.01,'u'),n('thickness','실제 판 두께',.02,1,.001,'u'),n('count','원본 배열 개수',1,12,1,'장'),n('spacing','배열 사이 거리',.1,3,.001,'u','Blender 원본 배열 방향을 유지합니다. 기본 상대 오프셋은 두께의 7배입니다.'),n('offsetX','층마다 추가 좌우 이동',-2,2,.01,'u'),n('offsetZ','층마다 추가 앞뒤 이동',-2,2,.01,'u'),n('fan','층마다 추가 회전',-20,20,.1,'°'),n('normalStrength','원본 미세 질감 강도',0,1.5,.01,'×','원본 절차적 긁힘·라인을 베이크한 노멀맵입니다.'),c('edgeColor','절단면·구멍 안쪽 색상'),n('edgeTransmission','절단면·구멍 투과율',0,1,.01),n('edgeOpacity','절단면·구멍 불투명도',.05,1,.01),c('sideColor','옆·뒤 단면 색상'),n('sideTransmission','옆·뒤 단면 투과율',0,1,.01),n('sideOpacity','옆·뒤 단면 불투명도',.05,1,.01)]);
    if(target==='slabs')return wrap([b('visible','유리판 표시'),n('width','판 가로',2,12,.01,'u'),n('depth','판 세로',2,12,.01,'u'),n('thickness','실제 판 두께',.03,.6,.005,'u'),n('bevel','모서리 라운드',.002,.1,.001,'u'),n('count','판 개수',1,6,1,'장'),n('spacing','층 사이 높이',.3,3,.01,'u'),n('offsetX','층마다 좌우 이동',-2,2,.01,'u'),n('offsetZ','층마다 앞뒤 이동',-2,2,.01,'u'),n('fan','층마다 회전',-20,20,.1,'°'),c('sideColor','옆·뒤 단면 색상'),n('sideTransmission','옆·뒤 단면 투과율',0,1,.01),c('edgeColor','앞 단면 색상'),n('edgeTransmission','앞 단면 투과율',0,1,.01,'','카메라 쪽 앞 단면에 적용됩니다. 윗면과 옆·뒤 단면은 독립적으로 조절합니다.')]);
    if(target==='rings')return wrap([b('visible','링 표시'),n('radius','링 반지름',.2,2.5,.01,'u'),n('tube','링 실제 두께',.015,.2,.005,'u'),n('tiltX','각 링 X 기울기',-80,80,1,'°'),n('tiltZ','각 링 Z 기울기',-80,80,1,'°'),n('count','링 개수',1,6,1,'개'),n('spacing','링 사이 높이',.3,3,.01,'u'),n('offsetX','링마다 좌우 이동',-2,2,.01,'u'),n('offsetZ','링마다 앞뒤 이동',-2,2,.01,'u')]);
    if(target==='loops')return wrap([s('silhouette','조형 시안',{fold:'01 · 접힌 흐름',sweep:'02 · 긴 S',knot:'03 · 느슨한 꼬임',legacy:'이전 · 원형 루프'}),s('preview','보기 방식',{clay:'회색 형태 보기',glass:'유리 재질 보기'}),n('fullness','중간 굵기 변화',0,1.5,.01),n('taper','끝으로 가늘어지는 정도',0,1,.01),b('visible','조형 표시'),n('count','곡선 개수',1,3,1,'개'),n('radiusX','가로 펼침',.8,4,.01,'u'),n('radiusY','세로 펼침',.8,4,.01,'u'),n('width','곡선 폭',.08,.9,.01,'u'),n('depth','실제 곡선 두께',.04,.5,.005,'u'),n('bend','입체 굽힘',0,1,.01),n('twist','단면 비틀기',-180,180,1,'°'),n('spacing','곡선 사이 간격',.1,1.8,.01,'u'),n('segments','경로 부드러움',80,400,1,'분할'),n('radialSegments','단면 부드러움',8,40,1,'분할')]);
    if(target==='tiles')return wrap([b('visible','타일 표시'),n('columns','가로 타일 수',3,25,1,'개'),n('rows','세로 타일 수',3,25,1,'개'),n('width','타일 가로',.2,2,.01,'u'),n('depth','타일 세로',.2,2,.01,'u'),n('thickness','실제 타일 두께',.05,.8,.01,'u'),n('crown','윗면의 완만한 곡률',0,.18,.005,'u','실제 윗면을 볼록하게 만들어 넓은 반사광이 부드럽게 흐릅니다.'),n('gapX','가로 간격',.02,.8,.01,'u'),n('gapZ','세로 간격',.02,.8,.01,'u'),n('roundness','모서리 라운드',.005,.25,.005,'u'),n('segments','모서리 분할',2,16,1,'단계'),b('stagger','엇갈림 배열'),n('holeX','중앙 비움 가로',0,9,1,'타일'),n('holeZ','중앙 비움 세로',0,9,1,'타일'),n('slope','거리별 높이 변화',-.15,.15,.005,'u/u'),n('jitterHeight','높이 편차',0,.5,.01,'u'),n('jitterRotation','회전 편차',0,25,1,'°'),n('jitterScale','크기 편차',0,.3,.01,'비율'),n('seed','랜덤 시드',1,99999,1)]);
    if(target==='pedestal')return wrap([b('visible','받침대 표시'),n('width','가로 크기',1,7,.01,'u'),n('depth','세로 크기',1,7,.01,'u'),n('height','전체 실제 두께',.1,2,.01,'u'),n('layers','겹 개수',1,7,1,'겹'),n('shrink','겹 크기 감소율',0,.2,.01,'비율'),n('gap','겹 사이 간격',0,.3,.005,'u'),n('roundness','라운드·경사 폭',.005,.25,.005,'u'),n('segments','경사 부드러움',2,16,1),b('autoFit','중앙 비움에 자동 맞춤'),b('linkCrystal','크리스탈 크기에 연결'),b('edgeVisible','발광 테두리 표시'),n('edgeWidth','테두리 두께',.005,.15,.005,'u'),c('edgeColor','테두리 색상'),n('edgeEmission','테두리 발광',0,5,.05)]);
    if(target==='crystal')return wrap([b('visible','크리스탈 그룹 표시'),b('outer','외부 크리스탈 표시','외부 반사와 실제 내부 코어를 각각 켜고 비교할 수 있습니다.'),s('shape','기본 형태',{cube:'큐브',box:'직육면체',chamfer:'모서리 깎인 크리스탈'}),b('lockRatio','비율 고정'),n('width','가로',.4,4,.01,'u'),n('height','높이',.4,4,.01,'u'),n('depth','세로',.4,4,.01,'u'),n('roundness','모서리 라운드',.005,.3,.005,'u'),n('bevel','모서리 깎는 폭',.01,.35,.005,'u'),n('segments','면 분할 수',2,20,1),b('flat','평평한 면 표현'),n('twist','비틀기',-90,90,1,'°'),n('floatGap','받침대 위 부양 거리',.05,3,.01,'u'),b('core.visible','내부 코어 표시'),s('core.shape','코어 형태',{diamond:'다이아몬드',octahedron:'팔면체',cube:'작은 큐브'}),n('core.count','코어 개수',1,7,1,'개'),n('core.size','코어 크기',.05,.7,.01,'u'),n('core.spacing','코어 간격',.05,1,.01,'u'),n('core.x','코어 X',-1,1,.01,'u'),n('core.y','코어 Y',-1,1,.01,'u'),n('core.z','코어 Z',-1,1,.01,'u'),n('core.rx','코어 X 회전',-180,180,1,'°'),n('core.ry','코어 Y 회전',-180,180,1,'°'),n('core.rz','코어 Z 회전',-180,180,1,'°'),c('core.color','코어 색상'),n('core.opacity','코어 불투명도',.05,1),n('core.emission','코어 발광 강도',0,3),b('core.linked','외부와 코어 모션 연결')]);
    return [];
  }
  if(tab==='조명·반사')return [...wrap([b('enabled','선택 조명 켜기'),c('color','조명 색상'),n('intensity','밝기',0,geometrySource==='blend261101'&&lightId==='key'?500:lightId==='base'||lightId==='rim'?60:30,.05),...['x','y','z'].map(a=>n(a,`조명 ${a.toUpperCase()}`,-15,15,.1,'u')),...['X','Y','Z'].map(a=>n(`target${a}`,`바라보는 지점 ${a}`,-8,8,.1,'u')),b('shadow','그림자 생성')],`lights.${lightId}`),...wrap([n('intensity','주변 반사 강도',0,3),n('rotation','반사 환경 회전',-180,180,1,'°'),n('blur','반사 환경 흐림',0,.5,.01,'','PMREM 환경맵을 갱신하므로 입력을 마친 뒤 반영됩니다.'),n('exposure','전체 노출',.2,2,.01,'EV')],'environment')];
  if(tab==='그림자·배경')return wrap([s('mode','배경',{solid:'단색',gradient:'그라데이션',transparent:'투명'}),c('color','배경 색상'),c('color2','그라데이션 두 번째 색'),n('angle','그라데이션 방향',0,360,1,'°'),b('ground','바닥 평면 표시'),c('groundColor','바닥 색상'),n('groundRoughness','바닥 반사 흐림',.05,1),n('shadowOpacity','접촉 그림자 진하기',0,.65),n('shadowSoftness','그림자 부드러움',1,6,.1),b('fog','안개 사용'),c('fogColor','안개 색상'),n('fogNear','안개 시작 거리',5,60,.5,'u'),n('fogFar','안개 종료 거리',10,90,.5,'u')],'background');
  if(tab==='모션'){
    if(target==='sphere'&&geometrySource==='blend261101')return wrap([b('motion.paused','그룹 일시정지'),s('motion.type','구 움직임',{dip:'유리 사이로 들어갔다 나오기',float:'기존 수직 부유'}),n('motion.depth','들어가는 깊이',0,1.2,.01,'u','유리판에 수직인 방향으로 이동합니다. 기본 0.62u는 첫 판의 구멍 안으로 살짝 들어가는 깊이입니다.'),n('motion.duration','왕복 주기',2,15,.1,'s','속도 1× 기준 한 번 들어갔다 나오는 시간. 끝에서 부드럽게 감속한 뒤 끊김 없이 돌아옵니다.'),n('motion.speed','모션 속도',0,2,.01,'×','0이면 현재 진행 위치에서 멈춥니다.'),n('motion.height','수직 부유 높이',0,.5,.01,'u'),...['X','Y','Z'].map(a=>n(`motion.spin${a}`,`${a} 회전 속도`,-30,30,.1,'°/s'))]);
    if(['sphere','slabs','rings'].includes(target))return wrap([b('motion.paused','그룹 일시정지'),n('motion.height','부유 높이',0,.5,.01,'u'),n('motion.speed','부유 속도',0,2,.01,'×'),...['X','Y','Z'].map(a=>n(`motion.spin${a}`,`${a} 회전 속도`,-30,30,.1,'°/s'))]);
    if(target==='loops')return wrap([b('motion.paused','유리 곡선 일시정지'),n('motion.height','부유 높이',0,.5,.01,'u'),n('motion.speed','부유 속도',0,2,.01,'×'),...['X','Y','Z'].map(a=>n(`motion.spin${a}`,`${a} 회전 속도`,-30,30,.1,'°/s')),n('motion.tilt','기울기 범위',0,10,.1,'°')]);
    if(target==='tiles')return wrap([b('motion.paused','타일 일시정지'),s('motion.type','타일 움직임',{rise:'순차 상승',wave:'파도',ripple:'중앙 파동',float:'은은한 부유'}),n('motion.height','이동 높이',0,.8,.01,'u'),n('motion.speed','파동 속도',0,3,.01,'×'),n('motion.wavelength','파장',.5,12,.1,'u'),n('motion.direction','진행 방향',-180,180,1,'°'),n('motion.delay','타일별 지연',0,.5,.01,'s'),n('motion.phase','모션 위상',0,360,1,'°')]);
    if(target==='pedestal')return wrap([b('motion.paused','받침대 일시정지'),n('motion.height','부유 높이',0,.5,.01,'u'),n('motion.speed','부유 속도',0,2,.01,'×'),n('motion.spin','Y 회전 속도',-30,30,.1,'°/s'),n('motion.pulse','테두리 빛 변화',0,1),b('motion.linkCrystal','크리스탈 부유와 연결')]);
    if(target==='crystal')return wrap([b('motion.paused','크리스탈 일시정지'),n('motion.height','부유 높이',0,.6,.01,'u'),n('motion.speed','부유 속도',0,2,.01,'×'),...['X','Y','Z'].map(a=>n(`motion.spin${a}`,`${a} 회전 속도`,-60,60,.1,'°/s')),n('motion.tilt','기울기 범위',0,15,.1,'°'),n('motion.coreSpin','코어 회전 속도',-60,60,.1,'°/s'),n('motion.coreFloat','코어 부유 높이',0,.3,.01,'u'),n('motion.phase','내부·외부 위상 차이',0,360,1,'°'),n('motion.pulseSpeed','발광 변화 속도',0,3,.01,'×'),n('motion.pulseStrength','발광 변화 강도',0,1)]);
    return wrap([b('paused','전체 일시정지'),b('reduced','움직임 줄이기'),s('mode','진행 방식',{auto:'자동 재생',scroll:'스크롤 진행',manual:'특정 진행률에서 정지'}),n('progress','정지 진행률',0,1,.001,'비율'),n('scrollStart','스크롤 시작',0,6000,10,'px'),n('scrollEnd','스크롤 종료',100,8000,10,'px'),n('smoothness','변경 보간 시간',.03,1,.01,'s'),n('parallax','마우스 시차 강도',0,.5,.01),n('hoverLift','호버 상승',0,.4,.01,'u'),n('hoverScale','호버 확대',1,1.2,.005,'×')],'motion');
  }
  return [];
}
export const get=(obj,path)=>path.split('.').reduce((o,k)=>o?.[k],obj);
export function set(obj,path,value){const keys=path.split('.'),last=keys.pop();keys.reduce((o,k)=>o[k],obj)[last]=value;}
// Import only known schema fields. Reject wrong types; clamp finite numbers.
export function validate(input){
  if(!input||typeof input!=='object'||Array.isArray(input))throw Error('설정 JSON 객체가 필요합니다.');
  if(input.version!==2)throw Error('스튜디오 v2 설정 파일을 사용해 주세요.');
  const result=defaults();if(!Object.hasOwn(input,'model'))result.model='tiles';if(input.model==='loops'&&!input.loops?.shapeRevision){result.loops.silhouette='legacy';result.loops.preview='glass';}
  function walk(base,value,path=''){
    for(const key of Object.keys(base)){
      if(key==='overrides')continue;
      if(!Object.hasOwn(value||{},key))continue;
      const p=path?`${path}.${key}`:key,v=value[key];
      if(base[key]&&typeof base[key]==='object'){if(!v||typeof v!=='object'||Array.isArray(v))throw Error(`${p}: 객체가 필요합니다.`);walk(base[key],v,p);}
      else if(typeof base[key]==='number'){if(typeof v!=='number'||!Number.isFinite(v))throw Error(`${p}: 유한한 숫자가 필요합니다.`);base[key]=v;}
      else if(typeof v!==typeof base[key])throw Error(`${p}: 값의 형식을 확인하세요.`);
      else {if(key.toLowerCase().includes('color')||key==='emissive'){if(!/^#[0-9a-f]{6}$/i.test(v))throw Error(`${p}: HEX 색상을 확인하세요.`);}base[key]=v;}
    }
  }
  walk(result,input);
  if(input.model==='glassStack'&&!input.geometry)result.geometry.source='procedural002';
  const descriptors=[];
  for(const target of Object.keys(GROUPS))for(const tab of TABS)for(const profile of ['camera','mobileCamera'])for(const lightId of Object.keys(result.lights))descriptors.push(...fieldsFor(target,tab,profile,lightId,result.geometry.source));
  for(const d of descriptors){const value=get(result,d.path);if(d.type==='number'){let v=Math.max(d.min,Math.min(d.max,value));if(d.step===1)v=Math.round(v);set(result,d.path,v);}if(d.type==='select'&&!Object.hasOwn(d.options,value))throw Error(`${d.label}: 지원하지 않는 값입니다.`);}
  if(!['blend261101','procedural002'].includes(result.geometry.source))throw Error('지원하지 않는 원본 형상입니다.');
  if(!['glassStack','loops','tiles'].includes(result.model))throw Error('지원하지 않는 장면 모델입니다.');
  for(const value of Object.values(result.lights))if(!['point','directional','ambient'].includes(value.type))throw Error('지원하지 않는 조명 유형입니다.');
  if(!['auto','low','medium','high'].includes(result.render.quality))throw Error('렌더링 품질 값이 올바르지 않습니다.');
  if(result.background.fogFar<=result.background.fogNear)result.background.fogFar=result.background.fogNear+1;
  if(result.motion.scrollEnd<=result.motion.scrollStart)result.motion.scrollEnd=result.motion.scrollStart+100;
  const overrideInput=input.tiles?.overrides||{};
  if(typeof overrideInput!=='object'||Array.isArray(overrideInput))throw Error('선택 타일 설정이 올바르지 않습니다.');
  for(const [key,v]of Object.entries(overrideInput).slice(0,625)){
    if(!/^\d+:\d+$/.test(key)||!v||typeof v!=='object')continue;
    const item={};for(const property of ['x','y','z','rx','rz','scale'])if(typeof v[property]==='number'&&Number.isFinite(v[property]))item[property]=Math.max(property==='scale'?.1:-5,Math.min(property==='scale'?3:5,v[property]));
    if(/^#[0-9a-f]{6}$/i.test(v.color||''))item.color=v.color;
    result.tiles.overrides[key]=item;
  }
  return result;
}
export const MATERIAL_PRESETS={blueSoft:{color:'#0c2b58',roughness:.32,metalness:.35,transmission:0,coat:.16,coatRoughness:.42,reflection:1.05},glass:{roughness:.065,metalness:0,transmission:.92,coat:1},frosted:{roughness:.35,metalness:0,transmission:.7,coat:.3},satin:{roughness:.32,metalness:.35,transmission:0,coat:.5},silver:{roughness:.18,metalness:1,transmission:0,coat:.6},matte:{roughness:.85,metalness:0,transmission:0,coat:0}};

// Built-in comparison looks never overwrite user-created named presets.
export function builtInPresets(){
  const blender=defaults(),glassStack=proceduralDefaults(),glassLoops=proceduralDefaults(),legacyGlass=proceduralDefaults(),reference=proceduralDefaults(),original=proceduralDefaults();for(const p of [glassLoops,legacyGlass]){p.model='loops';p.camera={...camera(),distance:11.5,azimuth:-12,elevation:18,targetY:.25,fov:38,padding:0};p.mobileCamera={...p.camera,distance:12,fov:40};p.background={...p.background,color:'#0064a1',color2:'#9de9ef',angle:120};p.environment={intensity:1.25,rotation:-15,blur:.08,exposure:1};}Object.assign(legacyGlass.loops,{silhouette:'legacy',preview:'glass',count:3,width:.34,depth:.3,rz:-12});legacyGlass.motion.paused=false;for(const preset of [reference,original]){preset.model='tiles';preset.camera=camera();preset.mobileCamera={...camera(),distance:16,elevation:42,fov:38};preset.environment={intensity:1,rotation:0,blur:.28,exposure:.86};Object.assign(preset.background,{mode:'solid',color:'#02060c',color2:'#13223a',ground:true,fog:true});}original.look='original';
  original.tiles.crown=0;original.tiles.material=material('#123764',.28,.42);
  original.pedestal.material=material('#13365c',.22,.48);
  Object.assign(original.pedestal,{edgeWidth:.035,edgeColor:'#4cc9ff',edgeEmission:1.5});
  original.environment={intensity:1,rotation:0,blur:.08,exposure:.9};
  original.lights={key:light('directional','#d5edff',3.8,-3,8,4,true),fill:light('directional','#78acff',1.3,5,4,2),rim:light('point','#0084ff',24,-2,3,-3),ambient:light('ambient','#b4d4ff',1.1,0,0,0),base:light('point','#2bbaff',18,0,.5,0)};
  Object.assign(original.background,{color:'#171e29',color2:'#324452',groundColor:'#132035',groundRoughness:.45,fogColor:'#171e29',fogNear:15,fogFar:40});
  for(const preset of [glassLoops,legacyGlass,reference,original])preset.lights={key:light('directional','#e1f8ff',2.8,-3,8,4,true),fill:light('directional','#a9f2ff',1.1,5,4,2),rim:light('point','#1685e4',14,-2,3,-3),ambient:light('ambient','#d4f2ff',.65,0,0,0),base:light('point','#279ae5',10,0,.5,0)};
  return {blender:{name:'261101.blend · 원본 메시와 카메라',settings:blender},glassStack:{name:'002 · 코발트 구와 투명 유리판',settings:glassStack},glassLoops:{name:'새 조형 · 회색 형태 검토',settings:glassLoops},legacyGlass:{name:'이전 모델 · 원형 유리 루프',settings:legacyGlass},reference:{name:'이전 모델 · 코발트 타일',settings:reference},original:{name:'이전 모델 · 선명한 유리 반사',settings:original}};
}
export function applyReferenceLook(state){
  const ref=defaults();state.look=ref.look;state.tiles.material=ref.tiles.material;state.tiles.crown=ref.tiles.crown;state.pedestal.material=ref.pedestal.material;
  for(const key of ['edgeWidth','edgeColor','edgeEmission'])state.pedestal[key]=ref.pedestal[key];
  state.environment=ref.environment;for(const id of Object.keys(ref.lights))Object.assign(state.lights[id],{color:ref.lights[id].color,intensity:ref.lights[id].intensity});
  for(const key of ['color','color2','groundColor','groundRoughness','fogColor'])state.background[key]=ref.background[key];
  return state;
}

export function applyLoopModel(state){
  const fresh=defaults();state.model='loops';state.modelRevision=1;state.look='clear-glass-loops';state.loops=fresh.loops;
  state.camera=fresh.camera;state.mobileCamera=fresh.mobileCamera;state.environment=fresh.environment;state.background=fresh.background;state.lights=fresh.lights;
  return state;
}

export function applyShapeReview(state){
  const fresh=defaults();
  for(const key of ['shapeRevision','silhouette','preview','count','radiusX','radiusY','width','depth','bend','twist','spacing','fullness','taper','rz'])state.loops[key]=fresh.loops[key];
  state.look=fresh.look;state.camera=fresh.camera;state.mobileCamera=fresh.mobileCamera;state.motion.paused=true;state.motion.parallax=0;
  return state;
}

// A new reference replaces the active model once; the previous scene is backed up
// by the controller before this migration. Named presets and imported old JSON remain usable.
export function applyGlassStack(state){
  const fresh=defaults();
  for(const key of ['model','modelRevision','look','geometry','sphere','slabs','rings','lens','camera','mobileCamera','mobile','environment','lights','background','scene','motion'])state[key]=clone(fresh[key]);
  return state;
}

// Apply only the requested motion; keep the user's model, camera and materials.
export function applySphereDip(state){
  Object.assign(state.sphere.motion,{type:'dip',dipRevision:1,depth:.62,duration:6,speed:1,paused:false});
  state.motion.paused=false;state.motion.mode='auto';
  return state;
}

export function applySphereDetail(state){
  Object.assign(state.sphere,{smooth:true,segments:128,surfaceRevision:1});
  Object.assign(state.lens,{enabled:true,strength:3,sharpRange:.7,range:1.25,offset:0,detailRevision:1});
  return state;
}

export function applyGlassOptics(state){
  Object.assign(state.slabs,{optics:'layered',glassRevision:1,smoothCuts:true,normalStrength:.25,edgeOpticalThickness:2,edgeAbsorptionColor:'#96a6b8',edgeAbsorptionDistance:1,edgeColor:'#ffffff',edgeTransmission:1,edgeOpacity:1,sideColor:'#ffffff',sideTransmission:1,sideOpacity:1});
  Object.assign(state.slabs.material,{color:'#ffffff',opacity:1,transmission:1,roughness:.085,metalness:0,ior:1.5,opticalThickness:state.slabs.thickness,attenuationColor:'#eff2f8',attenuationDistance:12,reflection:1,coat:0});
  return state;
}

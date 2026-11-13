import DEFAULT_PRESET from './default-preset.js?v=4';
const positionFields=[['x','좌우 위치',-12,12,.1],['y','높이',-12,12,.1],['z','앞뒤 위치',-12,12,.1]];
const panelFields=[['width','가로 크기',.25,24,.05],['height','세로 크기',.25,24,.05],['rotationX','상하 기울기',-180,180,.1],['rotationY','좌우 기울기',-180,180,.1],['rotationZ','회전',-180,180,.1]];
export const LIGHT_SOURCES=[
 {id:'key',label:'주광',type:'directional',defaults:{enabled:true,color:'#f2fbff',power:2.1,x:-2,y:5,z:6}},
 {id:'fill',label:'보조광',type:'directional',defaults:{enabled:true,color:'#dcf7fe',power:1.2,x:4,y:-2,z:5}},
 {id:'rim',label:'테두리광',type:'directional',defaults:{enabled:true,color:'#ffffff',power:6,x:-.1,y:-2.4,z:-6}},
 {id:'ambient',label:'주변광',type:'ambient',defaults:{enabled:true,color:'#e5f6ff',power:.7}},
 {id:'reflectionMain',label:'주 반사 패널',type:'panel',defaults:{enabled:true,color:'#9aa7da',power:2.5,width:12,height:4,x:-2,y:5,z:6,rotationX:11.5,rotationY:5.7,rotationZ:0}},
 {id:'reflectionStrip',label:'하이라이트 패널',type:'panel',defaults:{enabled:true,color:'#ffffff',power:3,width:15,height:1.2,x:0,y:2,z:5,rotationX:0,rotationY:0,rotationZ:0}},
 {id:'reflectionSide',label:'측면 반사 패널',type:'panel',defaults:{enabled:true,color:'#c0f5ff',power:2.6,width:3,height:8,x:-6,y:2,z:1,rotationX:0,rotationY:40.1,rotationZ:0}},
 {id:'reflectionBack',label:'후면 반사 패널',type:'panel',defaults:{enabled:true,color:'#345b78',power:.6,width:12,height:8,x:2,y:-3,z:-4,rotationX:0,rotationY:0,rotationZ:0}},
 {id:'reflectionBottom',label:'하단 반사 패널',type:'panel',defaults:{enabled:true,color:'#ffffff',power:1.5,width:16,height:2,x:0,y:-5,z:3,rotationX:68.8,rotationY:0,rotationZ:0}},
 {id:'environment',label:'주변 반사색',type:'environment',defaults:{enabled:true,color:'#6b899e',power:1}}
];
for(const source of LIGHT_SOURCES)source.defaults=structuredClone(DEFAULT_PRESET.lighting[source.id]);
export function getLightFields(source){return [['power','밝기',0,6,.05],...(['directional','panel'].includes(source.type)?positionFields:[]),...(source.type==='panel'?panelFields:[])]}
export function createLightingDefaults(primaryColor=DEFAULT_PRESET.lightColor){
 const result=Object.fromEntries(LIGHT_SOURCES.map(source=>[source.id,{...source.defaults}]));
 if(/^#[0-9a-f]{6}$/i.test(primaryColor))result.reflectionMain.color=primaryColor.toLowerCase();
 return result;
}
export function sanitizeLighting(saved,primaryColor){
 const result=createLightingDefaults(primaryColor);
 if(!saved||typeof saved!=='object')return result;
 for(const source of LIGHT_SOURCES){const data=saved[source.id];if(!data||typeof data!=='object')continue;
  if(typeof data.enabled==='boolean')result[source.id].enabled=data.enabled;
  if(typeof data.color==='string'&&/^#[0-9a-f]{6}$/i.test(data.color))result[source.id].color=data.color.toLowerCase();
  for(const [key,,min,max] of getLightFields(source))if(typeof data[key]==='number'&&Number.isFinite(data[key]))result[source.id][key]=Math.max(min,Math.min(max,data[key]));
 }
 return result;
}
export function lightingNeedsEnvironment(key){const id=key.split(':')[1];return id==='all'||id==='reset'||LIGHT_SOURCES.some(source=>source.id===id&&['panel','environment'].includes(source.type))}
export function createLightingControls(container,settings,onChange,save){
 const root=document.createElement('div');root.className='lighting-editor';
 root.innerHTML='<div class="lighting-selector"><label for="flow-lightSource">조명 선택</label><select id="flow-lightSource" aria-label="조명 선택"></select></div><div class="light-source-views"></div><div class="lighting-actions"><button data-light-action="selected">선택 초기화</button><button data-light-action="off">모두 끄기</button><button data-light-action="reset">전체 초기화</button></div>';
 container.append(root);const selector=root.querySelector('select'),views=root.querySelector('.light-source-views'),syncViews=[];
 function changed(id,key){if(id==='reflectionMain'&&key==='color')settings.lightColor=settings.lighting.reflectionMain.color;save();onChange(`lighting:${id}:${key}`)}
 for(const source of LIGHT_SOURCES){
  const option=document.createElement('option');option.value=source.id;option.textContent=source.label;selector.append(option);
  const view=document.createElement('section');view.className='light-source-view';view.dataset.source=source.id;view.setAttribute('aria-label',source.label);view.hidden=source.id!=='key';
  const heading=document.createElement('div');heading.className='surface-heading';heading.innerHTML=`<h3>${source.label}</h3><button class="light-enable glass-enable" role="switch" aria-label="${source.label} 사용" data-property="enabled">켜짐</button>`;view.append(heading);const toggle=heading.querySelector('button');
  toggle.addEventListener('click',()=>{settings.lighting[source.id].enabled=!settings.lighting[source.id].enabled;sync();changed(source.id,'enabled')});
  const colorRow=document.createElement('div');colorRow.className='color-row';colorRow.innerHTML=`<label for="light-${source.id}-color">색상</label><div><input type="color" id="light-${source.id}-color" data-property="color" aria-label="${source.label} 색상"><input type="text" aria-label="${source.label} 색상 코드" maxlength="7" spellcheck="false" autocomplete="off"></div>`;view.append(colorRow);
  const [picker,hex]=colorRow.querySelectorAll('input');
  function changeColor(value){if(!/^#[0-9a-f]{6}$/i.test(value))return;settings.lighting[source.id].color=value.toLowerCase();picker.value=hex.value=settings.lighting[source.id].color;changed(source.id,'color')}
  picker.addEventListener('input',()=>changeColor(picker.value));hex.addEventListener('input',()=>changeColor(hex.value));hex.addEventListener('blur',()=>hex.value=settings.lighting[source.id].color);
  const rows=[];
  for(const [key,label,min,max,step] of getLightFields(source)){
   const row=document.createElement('div');row.className='control-row';const id=`light-${source.id}-${key}`;
   const format=value=>key.startsWith('rotation')?value.toFixed(1)+'°':key==='power'?value.toFixed(2)+'×':value.toFixed(2);
   row.innerHTML=`<div class="control-label"><label for="${id}">${label}</label><output for="${id}"></output></div><input id="${id}" data-property="${key}" type="range" aria-label="${source.label} ${label}" min="${min}" max="${max}" step="${step}"><div class="control-limits"><span>${format(min)}</span><span>${format(max)}</span></div>`;
   const input=row.querySelector('input'),output=row.querySelector('output');
   function update(){const value=settings.lighting[source.id][key];input.value=String(value);input.style.setProperty('--progress',`${(value-min)/(max-min)*100}%`);input.setAttribute('aria-valuetext',format(value));output.value=format(value)}
   input.addEventListener('input',()=>{settings.lighting[source.id][key]=Number(input.value);update();changed(source.id,key)});rows.push(update);view.append(row);
  }
  const hint=document.createElement('p');hint.className='lighting-hint';hint.textContent=source.type==='directional'?'위치를 바꾸면 리본 중심으로 빛이 들어오는 방향이 바뀝니다.':source.type==='panel'?'유리 표면에 비치는 조명입니다. 크기와 기울기로 하이라이트 모양을 바꿔보세요.':source.type==='ambient'?'방향 없이 리본 전체에 더해지는 기본 밝기입니다.':'반사 패널 뒤의 전체 반사색입니다. 끄면 패널 이외의 반사광이 사라집니다.';view.append(hint);
  syncViews.push(()=>{const data=settings.lighting[source.id];toggle.setAttribute('aria-checked',String(data.enabled));toggle.textContent=data.enabled?'켜짐':'꺼짐';picker.value=hex.value=data.color;rows.forEach(update=>update());view.dataset.enabled=String(data.enabled);view.querySelectorAll('input').forEach(input=>input.disabled=!data.enabled)});views.append(view);
 }
 selector.addEventListener('change',()=>root.querySelectorAll('.light-source-view').forEach(view=>view.hidden=view.dataset.source!==selector.value));
 root.querySelector('[data-light-action="selected"]').addEventListener('click',()=>{const source=LIGHT_SOURCES.find(s=>s.id===selector.value);settings.lighting[source.id]={...source.defaults};if(source.id==='reflectionMain')settings.lightColor=settings.lighting.reflectionMain.color;sync();save();onChange(`lighting:${source.id}:reset`)});
 root.querySelector('[data-light-action="off"]').addEventListener('click',()=>{Object.values(settings.lighting).forEach(light=>light.enabled=false);sync();save();onChange('lighting:all:enabled')});
 root.querySelector('[data-light-action="reset"]').addEventListener('click',()=>{settings.lighting=createLightingDefaults();settings.lightColor=settings.lighting.reflectionMain.color;sync();save();onChange('lighting:reset:all')});
 function sync(){syncViews.forEach(update=>update())}sync();return {sync};
}

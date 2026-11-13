import DEFAULT_PRESET from './default-preset.js?v=4';
import {createLightingDefaults,sanitizeLighting,createLightingControls} from './lighting-controls.js?v=preset-4';
export const DEFAULTS=structuredClone(DEFAULT_PRESET);
const KEY='areum-flow-studio-v4';
const fields=[
 {key:'curvature',group:'shape',label:'곡선 굽힘',min:1,max:1.4,step:.01,format:v=>v.toFixed(2)+'×'},
 {key:'thinCurvature',group:'thin',label:'얇은 리본 곡선 굽힘',min:1,max:1.4,step:.01,format:v=>v.toFixed(2)+'×'},
 {key:'width',group:'shape',label:'리본 폭',min:1.2,max:4.4,step:.1,format:v=>v.toFixed(1)},
 {key:'thinWidth',group:'thin',label:'얇은 리본 폭',min:.04,max:1.2,step:.01,format:v=>v.toFixed(2)},
 {key:'thinThickness',group:'thin',label:'얇은 리본 두께',min:.005,max:.15,step:.005,format:v=>v.toFixed(3)},
 {key:'thinAmplitude',group:'thin',label:'얇은 리본 흐름 높이',min:0,max:3,step:.05,format:v=>v.toFixed(2)},
 {key:'thinTwist',group:'thin',label:'얇은 리본 비틀림',min:0,max:3,step:.05,format:v=>v.toFixed(2)},
 {key:'thinMotionSpeed',group:'thin',label:'얇은 리본 모션 속도',min:0,max:1.8,step:.05,format:v=>v.toFixed(2)+'×'},
 {key:'thinPhase',group:'thin',label:'얇은 리본 흐름 위상',min:0,max:360,step:1,format:v=>Math.round(v)+'°'},
 {key:'thinOffsetY',group:'thin',label:'얇은 리본 높이 위치',min:-4,max:4,step:.05,format:v=>v.toFixed(2)},
 {key:'thinOffsetZ',group:'thin',label:'얇은 리본 앞뒤 위치',min:-3,max:3,step:.05,format:v=>v.toFixed(2)},
 {key:'thinTransparency',group:'thin',label:'얇은 리본 투명도',min:0,max:1,step:.01,format:v=>Math.round(v*100)+'%'},
 {key:'thinTransmission',group:'thin',label:'얇은 리본 유리 투과율',min:0,max:1,step:.01,format:v=>Math.round(v*100)+'%'},
 {key:'thinRoughness',group:'thin',label:'얇은 리본 표면 거칠기',min:0,max:.6,step:.01,format:v=>Math.round(v*100)+'%'},
 {key:'thickness',group:'shape',label:'두께',min:.03,max:.3,step:.01,format:v=>v.toFixed(2)},
 {key:'amplitude',group:'shape',label:'흐름의 높이',min:.2,max:2.5,step:.05,format:v=>v.toFixed(2)},
 {key:'twist',group:'shape',label:'비틀림',min:0,max:2,step:.05,format:v=>v.toFixed(2)},
 {key:'strands',group:'shape',label:'가장자리 선',min:4,max:28,step:2,format:v=>v+'개'},
 {key:'transmission',group:'material',label:'유리 투과율',min:0,max:1,step:.01,format:v=>Math.round(v*100)+'%'},
 {key:'roughness',group:'material',label:'표면 거칠기',min:0,max:.6,step:.01,format:v=>Math.round(v*100)+'%'},
 {key:'glassThickness',group:'surface',label:'코팅 두께',min:.005,max:.12,step:.005,format:v=>v.toFixed(3)},
 {key:'glassTransparency',group:'surface',label:'코팅 투명도',min:0,max:1,step:.01,format:v=>Math.round(v*100)+'%'},
 {key:'glassRoughness',group:'surface',label:'코팅 거칠기',min:0,max:.5,step:.005,format:v=>Number((v*100).toFixed(1))+'%'},
 {key:'glassReflection',group:'surface',label:'코팅 반사 강도',min:0,max:2,step:.05,format:v=>v.toFixed(2)+'×'},
 {key:'lineOpacity',group:'surface',label:'라인 불투명도',min:0,max:1,step:.01,format:v=>Math.round(v*100)+'%'},
 {key:'lightPower',group:'light',label:'전체 반사 세기',min:0,max:3,step:.05,format:v=>v.toFixed(2)+'×'},
 {key:'lightAngle',group:'light',label:'전체 반사 방향',min:0,max:360,step:1,format:v=>Math.round(v)+'°'},
 {key:'exposure',group:'light',label:'전체 노출',min:.25,max:2.5,step:.01,format:v=>v.toFixed(2)+'×'},
 {key:'reflectionBlur',group:'light',label:'반사 부드러움',min:0,max:.04,step:.001,format:v=>Math.round(v/.04*100)+'%'},
 {key:'motionSpeed',group:'light',label:'모션 속도',min:0,max:1.8,step:.05,format:v=>v.toFixed(2)+'×'}
];
export function loadSettings(){
 const settings=structuredClone(DEFAULTS);
 try{
  const url=new URL(location.href),incoming=url.searchParams.get('scene');
  const saved=JSON.parse(incoming||localStorage.getItem(KEY)||'null');
  if(saved&&typeof saved==='object'){
   for(const f of fields){if(typeof saved[f.key]==='number'&&Number.isFinite(saved[f.key]))settings[f.key]=Math.max(f.min,Math.min(f.max,saved[f.key]))}
   for(const key of ['color','colorMiddle','colorEnd','lightColor','glassColor','lineColor','thinColor','thinColorMiddle','thinColorEnd'])if(/^#[0-9a-f]{6}$/i.test(saved[key]||''))settings[key]=saved[key];
   if(['solid','gradient2','gradient3'].includes(saved.colorMode))settings.colorMode=saved.colorMode;
   if(['length','width','diagonal'].includes(saved.gradientDirection))settings.gradientDirection=saved.gradientDirection;
   if(['solid','gradient2','gradient3'].includes(saved.thinColorMode))settings.thinColorMode=saved.thinColorMode;
   if(['length','width','diagonal'].includes(saved.thinGradientDirection))settings.thinGradientDirection=saved.thinGradientDirection;
   if(['glass','satin'].includes(saved.thinFinish))settings.thinFinish=saved.thinFinish;
   if(typeof saved.thinEnabled==='boolean')settings.thinEnabled=saved.thinEnabled;
   if(typeof saved.glassEnabled==='boolean')settings.glassEnabled=saved.glassEnabled;
   if(['glass','satin'].includes(saved.finish))settings.finish=saved.finish;
   settings.lighting=sanitizeLighting(saved.lighting,settings.lightColor);settings.lightColor=settings.lighting.reflectionMain.color;
   if(incoming){localStorage.setItem(KEY,JSON.stringify(settings));url.searchParams.delete('scene');history.replaceState(null,'',url.pathname+url.search+url.hash)}
  }
 }catch{}
 return settings;
}
export function createStudio(settings,onChange){
 const root=document.createElement('aside');root.className='flow-studio';
 root.innerHTML=`<button class="studio-launch" aria-expanded="false" aria-controls="flow-studio-panel"><span aria-hidden="true">≋</span> 3D 스튜디오</button><section class="studio-panel" id="flow-studio-panel" aria-label="3D 리본 조절" hidden><header class="studio-header"><div><small>SHAPE YOUR FLOW</small><h2>3D 스튜디오</h2></div><button class="studio-close" aria-label="3D 설정 닫기">×</button></header><div class="studio-tabs" role="tablist" aria-label="3D 설정 종류"><button role="tab" id="flow-tab-shape" data-group="shape" aria-selected="true" aria-controls="flow-group-shape">형태</button><button role="tab" id="flow-tab-thin" data-group="thin" aria-selected="false" aria-controls="flow-group-thin" tabindex="-1">얇은 리본</button><button role="tab" id="flow-tab-material" data-group="material" aria-selected="false" aria-controls="flow-group-material" tabindex="-1">재질</button><button role="tab" id="flow-tab-surface" data-group="surface" aria-selected="false" aria-controls="flow-group-surface" tabindex="-1">글래스</button><button role="tab" id="flow-tab-light" data-group="light" aria-selected="false" aria-controls="flow-group-light" tabindex="-1">빛 / 모션</button></div><div class="studio-groups"></div><div class="studio-actions"><button class="reset-settings">기본값으로</button><button class="copy-settings">설정 복사 ⧉</button></div><p class="studio-status" aria-live="polite">이 버전의 설정만 브라우저에 저장됩니다.</p></section>`;
 document.body.append(root);const panel=root.querySelector('.studio-panel'),launch=root.querySelector('.studio-launch'),status=root.querySelector('.studio-status');const inputs=new Map(),outputs=new Map(),colorInputs=new Map(),colorRows=new Map();let gradientPreview,directionControl,directionRow,glassSwitch,lightingControls,thinPreview,thinDirection,thinSwitch;
 const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(settings));status.textContent='이 버전의 설정만 브라우저에 저장됩니다.'}catch{status.textContent='현재 화면에 적용되었습니다.'}};
 function colorControl(group,key,label){const row=document.createElement('div');row.className='color-row';row.innerHTML=`<label for="flow-${key}">${label}</label><div><input id="flow-${key}" type="color" aria-label="${label}"><input type="text" aria-label="${label} 코드" maxlength="7" spellcheck="false" autocomplete="off"></div>`;const [picker,text]=row.querySelectorAll('input');colorInputs.set(key,[picker,text]);colorRows.set(key,row);function change(value){if(!/^#[0-9a-f]{6}$/i.test(value))return;settings[key]=value.toLowerCase();picker.value=text.value=settings[key];syncGradient();syncThin();save();onChange(key)}picker.addEventListener('input',()=>change(picker.value));text.addEventListener('input',()=>change(text.value));text.addEventListener('blur',()=>text.value=settings[key]);group.append(row)}
 for(const group of ['shape','thin','material','surface','light']){const section=document.createElement('div');section.className='control-group';section.id=`flow-group-${group}`;section.setAttribute('role','tabpanel');section.setAttribute('aria-labelledby',`flow-tab-${group}`);section.hidden=group!=='shape';
  if(group==='material'){
   const modes=document.createElement('div');modes.className='color-modes';modes.setAttribute('role','group');modes.setAttribute('aria-label','리본 색상 구성');modes.innerHTML='<button data-color-mode="solid">단색</button><button data-color-mode="gradient2">2색</button><button data-color-mode="gradient3">3색</button>';modes.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{settings.colorMode=b.dataset.colorMode;syncGradient();save();onChange('colorMode')}));section.append(modes);
   gradientPreview=document.createElement('div');gradientPreview.className='gradient-preview';gradientPreview.setAttribute('role','img');gradientPreview.setAttribute('aria-label','현재 리본 색상 미리보기');section.append(gradientPreview);
   colorControl(section,'color','시작 색상');colorControl(section,'colorMiddle','중간 색상');colorControl(section,'colorEnd','끝 색상');
   directionRow=document.createElement('div');directionRow.className='gradient-direction';directionRow.innerHTML='<label for="flow-gradientDirection">그라데이션 방향</label><select id="flow-gradientDirection"><option value="length">리본 길이를 따라</option><option value="width">리본 폭을 따라</option><option value="diagonal">대각선으로</option></select>';directionControl=directionRow.querySelector('select');directionControl.addEventListener('change',()=>{settings.gradientDirection=directionControl.value;syncGradient();save();onChange('gradientDirection')});section.append(directionRow);
   const finish=document.createElement('div');finish.className='finish-buttons';finish.innerHTML='<button data-finish="glass">Clear glass</button><button data-finish="satin">Soft satin</button>';finish.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{settings.finish=b.dataset.finish;settings.roughness=b.dataset.finish==='satin'?.32:DEFAULTS.roughness;settings.transmission=b.dataset.finish==='satin'?.48:DEFAULTS.transmission;sync();onChange('finish')}));section.append(finish)
  }
  if(group==='surface'){const heading=document.createElement('div');heading.className='surface-heading';heading.innerHTML='<h3>얇은 글래스 코팅</h3><button class="glass-enable" role="switch" aria-label="글래스 코팅" aria-checked="true">켜짐</button>';section.append(heading);glassSwitch=heading.querySelector('button');glassSwitch.addEventListener('click',()=>{settings.glassEnabled=!settings.glassEnabled;syncSurface();save();onChange('glassEnabled')});colorControl(section,'glassColor','글래스 색상');colorRows.get('glassColor').classList.add('glass-option')}
  if(group==='thin'){
   const heading=document.createElement('div');heading.className='surface-heading';heading.innerHTML='<h3>독립 보조 리본</h3><button class="glass-enable" role="switch" aria-label="얇은 리본 표시">켜짐</button>';section.append(heading);thinSwitch=heading.querySelector('button');thinSwitch.addEventListener('click',()=>{settings.thinEnabled=!settings.thinEnabled;syncThin();save();onChange('thinEnabled')});
   for(const [name,label] of [['shape','형태 / 움직임'],['color','색상 / 그라데이션'],['material','재질']]){const details=document.createElement('details');details.className='thin-section lighting-global';details.dataset.thinSection=name;details.open=name==='shape';details.innerHTML=`<summary>${label}<span aria-hidden="true">+</span></summary><div></div>`;section.append(details)}
   const colorHost=section.querySelector('[data-thin-section=color]>div'),modes=document.createElement('div');modes.className='color-modes';modes.innerHTML='<button data-thin-mode="solid">단색</button><button data-thin-mode="gradient2">2색</button><button data-thin-mode="gradient3">3색</button>';modes.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{settings.thinColorMode=b.dataset.thinMode;syncThin();save();onChange('thinColorMode')}));colorHost.append(modes);thinPreview=document.createElement('div');thinPreview.className='gradient-preview';colorHost.append(thinPreview);
   colorControl(colorHost,'thinColor','얇은 리본 시작 색상');colorControl(colorHost,'thinColorMiddle','얇은 리본 중간 색상');colorControl(colorHost,'thinColorEnd','얇은 리본 끝 색상');const direction=document.createElement('div');direction.className='gradient-direction';direction.innerHTML='<label for="flow-thinGradientDirection">그라데이션 방향</label><select id="flow-thinGradientDirection" aria-label="얇은 리본 그라데이션 방향"><option value="length">리본 길이를 따라</option><option value="width">리본 폭을 따라</option><option value="diagonal">대각선으로</option></select>';colorHost.append(direction);thinDirection=direction.querySelector('select');thinDirection.addEventListener('change',()=>{settings.thinGradientDirection=thinDirection.value;syncThin();save();onChange('thinGradientDirection')});
   const finishes=document.createElement('div');finishes.className='finish-buttons';finishes.innerHTML='<button data-thin-finish="glass">Clear glass</button><button data-thin-finish="satin">Soft satin</button>';finishes.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{settings.thinFinish=b.dataset.thinFinish;settings.thinRoughness=settings.thinFinish==='satin'?.32:.12;settings.thinTransmission=.5;sync();onChange('thinFinish')}));section.querySelector('[data-thin-section=material]>div').append(finishes);
  }
  let fieldHost=section;if(group==='light'){lightingControls=createLightingControls(section,settings,onChange,save);const global=document.createElement('details');global.className='lighting-global';global.innerHTML='<summary>전체 반사 / 모션 <span aria-hidden="true">+</span></summary><div></div>';section.append(global);fieldHost=global.querySelector('div')}
  for(const f of fields.filter(f=>f.group===group)){if(f.key==='lineOpacity'){const title=document.createElement('h3');title.className='surface-line-title';title.textContent='리본 라인';section.append(title);colorControl(section,'lineColor','라인 색상')}const row=document.createElement('div');row.className='control-row';if(f.key.startsWith('glass'))row.classList.add('glass-option');row.innerHTML=`<div class="control-label"><label for="flow-${f.key}">${f.label}</label><output for="flow-${f.key}"></output></div><input type="range" id="flow-${f.key}" min="${f.min}" max="${f.max}" step="${f.step}"><div class="control-limits"><span>${f.format(f.min)}</span><span>${f.format(f.max)}</span></div>`;const input=row.querySelector('input');inputs.set(f.key,input);outputs.set(f.key,row.querySelector('output'));input.addEventListener('input',()=>{settings[f.key]=Number(input.value);update(f);save();onChange(f.key)});(group==='thin'?section.querySelector('[data-thin-section='+(['thinTransparency','thinTransmission','thinRoughness'].includes(f.key)?'material':'shape')+']>div'):fieldHost).append(row)}root.querySelector('.studio-groups').append(section);
 }
 function update(f){const input=inputs.get(f.key);input.value=String(settings[f.key]);input.style.setProperty('--progress',`${(settings[f.key]-f.min)/(f.max-f.min)*100}%`);input.setAttribute('aria-valuetext',f.format(settings[f.key]));outputs.get(f.key).value=f.format(settings[f.key])}
 function syncGradient(){
  root.querySelectorAll('[data-color-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.colorMode===settings.colorMode)));
  colorRows.get('colorMiddle').hidden=settings.colorMode!=='gradient3';colorRows.get('colorEnd').hidden=settings.colorMode==='solid';directionRow.hidden=settings.colorMode==='solid';directionControl.value=settings.gradientDirection;
  const stops=settings.colorMode==='solid'?[settings.color,settings.color]:settings.colorMode==='gradient2'?[settings.color,settings.colorEnd]:[settings.color,settings.colorMiddle,settings.colorEnd];
  gradientPreview.style.background=`linear-gradient(${settings.gradientDirection==='width'?'0deg':settings.gradientDirection==='diagonal'?'135deg':'90deg'},${stops.join(',')})`;
 }
 function syncThin(){if(!thinSwitch)return;thinSwitch.setAttribute('aria-checked',String(settings.thinEnabled));thinSwitch.textContent=settings.thinEnabled?'켜짐':'꺼짐';root.querySelectorAll('[data-thin-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.thinMode===settings.thinColorMode)));root.querySelectorAll('[data-thin-finish]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.thinFinish===settings.thinFinish)));colorRows.get('thinColorMiddle').hidden=settings.thinColorMode!=='gradient3';colorRows.get('thinColorEnd').hidden=settings.thinColorMode==='solid';thinDirection.parentElement.hidden=settings.thinColorMode==='solid';thinDirection.value=settings.thinGradientDirection;const colors=settings.thinColorMode==='solid'?[settings.thinColor,settings.thinColor]:settings.thinColorMode==='gradient2'?[settings.thinColor,settings.thinColorEnd]:[settings.thinColor,settings.thinColorMiddle,settings.thinColorEnd];thinPreview.style.background=`linear-gradient(90deg,${colors.join(',')})`}
 function syncSurface(){root.dataset.glassEnabled=String(settings.glassEnabled);glassSwitch.setAttribute('aria-checked',String(settings.glassEnabled));glassSwitch.textContent=settings.glassEnabled?'켜짐':'꺼짐';for(const key of ['glassThickness','glassTransparency','glassRoughness','glassReflection'])inputs.get(key).disabled=!settings.glassEnabled;for(const input of colorInputs.get('glassColor'))input.disabled=!settings.glassEnabled}
 function sync(){fields.forEach(update);colorInputs.forEach(([picker,text],key)=>{picker.value=text.value=settings[key]});root.querySelectorAll('[data-finish]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.finish===settings.finish)));syncGradient();syncThin();syncSurface();lightingControls.sync();save()}
 function close(){panel.hidden=true;launch.setAttribute('aria-expanded','false');launch.focus()}
 launch.addEventListener('click',()=>{panel.hidden=!panel.hidden;launch.setAttribute('aria-expanded',String(!panel.hidden))});root.querySelector('.studio-close').addEventListener('click',close);root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.stopPropagation();close()}});
 const tabs=[...root.querySelectorAll('[role=tab]')];function tabSelect(tab){tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;root.querySelector('#flow-group-'+t.dataset.group).hidden=!active})}tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>tabSelect(tab));tab.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabSelect(tabs[next]);tabs[next].focus()})});
 root.querySelector('.reset-settings').addEventListener('click',()=>{Object.assign(settings,structuredClone(DEFAULTS));sync();onChange('reset');status.textContent='기본 리본 설정으로 되돌렸습니다.'});root.querySelector('.copy-settings').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(JSON.stringify(settings,null,2));status.textContent='현재 3D 설정을 복사했습니다.'}catch{status.textContent='복사할 수 없습니다. 설정은 브라우저에 저장됩니다.'}});sync();return root;
}

import {GROUPS,TABS,clone,defaults,fieldsFor,get,set,validate,builtInPresets,applyGlassStack,applySphereDip,applySphereDetail,applyGlassOptics,applyPinHemisphere,applyHollowGlass,PIN_SHELL_TARGETS,targetPath,materialTargets,changeMaterial,copyMaterial} from './studio-state.js';

const $=s=>document.querySelector(s),KEY='examvue.studio.v2',PRESETS='examvue.studio.presets.v2';
const safe={read(key){try{return JSON.parse(localStorage.getItem(key));}catch{return null;}},write(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{}}};

export function initStudio(){
  let state;try{
    const saved=safe.read(KEY);state=saved?validate(saved):defaults();
    if(!safe.read(KEY+'.blend261101')){
      if(saved)safe.write(KEY+'.beforeBlend261101',saved);
      applyGlassStack(state);safe.write(KEY+'.blend261101',true);safe.write(KEY,state);
    }
    if(saved?.model==='glassStack'&&saved.geometry?.source==='blend261101'){
      if(!saved.sphere?.motion?.dipRevision)applySphereDip(state);
      if(!saved.sphere?.surfaceRevision||!saved.lens?.detailRevision)applySphereDetail(state);
      if(!saved.slabs?.glassRevision){safe.write(KEY+'.beforeGlassOptics',saved);applyGlassOptics(state);}
      safe.write(KEY,state);
    }
    if(!safe.read(KEY+'.pin633881716349791611')){if(saved)safe.write(KEY+'.beforePinOrbit',saved);state=defaults();safe.write(KEY,state);safe.write(KEY+'.pin633881716349791611',true);}
    if(state.model==='pinOrbit'&&state.modelRevision<6){safe.write(KEY+'.beforeContentOnly',state);state=defaults();safe.write(KEY,state);}
    if(state.model==='pinOrbit'&&!state.pinCore.shapeRevision){safe.write(KEY+'.beforeHemisphere',state);applyPinHemisphere(state);safe.write(KEY,state);}
    if(state.model==='pinOrbit'&&!state.pinRings.shapeRevision){safe.write(KEY+'.beforeHollowGlass',saved||state);applyHollowGlass(state);safe.write(KEY,state);}
  }catch{state=defaults();}
  let scene,target=['glassStack','pinOrbit'].includes(state.model)?'all':state.model==='loops'?'loops':'crystal',tab=['glassStack','pinOrbit'].includes(state.model)?'구도':'형태·배열',profile='camera',lightId='key',selected=[],selectedPreset='builtin:pinOrbit',saveTimer;
  const isSource=()=>state.model==='glassStack'&&state.geometry.source==='blend261101';
  const groupIds=()=>state.model==='pinOrbit'?['pinCore','pinRings',...Object.keys(PIN_SHELL_TARGETS).slice(0,state.pinRings.count)]:state.model==='glassStack'?(isSource()?['sphere','slabs']:['sphere','slabs','rings']):state.model==='loops'?['loops']:['tiles','pedestal','crystal'];
  const modelDefaults=()=>state.model==='pinOrbit'?defaults():state.model==='tiles'?builtInPresets().reference.settings:state.model==='loops'?builtInPresets().glassLoops.settings:isSource()?builtInPresets().blender.settings:builtInPresets().glassStack.settings;
  if(new URLSearchParams(location.search).get('view')==='scene')document.body.classList.add('scene-only');
  const osMotion=matchMedia('(prefers-reduced-motion: reduce)');
  const heroCopy=document.createElement('div');heroCopy.className='pin-copy';heroCopy.hidden=true;
  heroCopy.innerHTML=`<span class="pin-brand">◉ CoreSentinel</span><div class="pin-headline"><p class="pin-eyebrow">Your Peace of Mind, Redefined</p><h2>Smarter Security<br>Starts Here</h2><p class="pin-subtitle">Secure the Sphere. Protect What Matters</p></div><div class="pin-aside"><strong>AI-Driven</strong><p>Global protection.</p><span>Personalized security for you.</span></div><div class="pin-stats"><p><strong>112+</strong><span>Countries<br>Protected</span></p><p><strong>55K+</strong><span>Clients<br>Worldwide</span></p></div>`;
  $('.visual-panel').append(heroCopy);
  const panel=$('#studio');
  panel.innerHTML=`
    <div class="studio-top"><div><span class="eyebrow">REALTIME SCENE · 01</span><h2>3D 스튜디오</h2></div><button type="button" class="icon-button" id="studio-close" aria-label="3D 설정 닫기">×</button></div>
    <div class="studio-target"><label for="studio-target">조절 대상</label><select id="studio-target" aria-describedby="studio-scope">${Object.entries(GROUPS).map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></div><p id="studio-scope" class="studio-scope" hidden>이 탭은 전체 장면에 공통으로 적용됩니다.</p>
    <div class="studio-mode" aria-label="장면 조작 모드"><button type="button" id="camera-mode" aria-pressed="true">카메라 조작</button><button type="button" id="tile-mode" aria-pressed="false">타일 선택</button><button type="button" id="move-models" aria-controls="studio-content">전체 모델 이동</button></div>
    <div class="studio-tabs" role="tablist" aria-label="3D 설정 탭">${TABS.map((name,i)=>`<button type="button" role="tab" id="tab-${i}" aria-controls="studio-content" data-tab="${name}">${name}</button>`).join('')}</div>
    <div id="studio-content" class="studio-content" role="tabpanel" tabindex="0"></div>
    <div class="studio-bottom"><p id="studio-status" role="status">설정은 자동 저장됩니다.</p><div><button type="button" id="group-reset">선택 그룹 초기화</button><button type="button" id="hide-controls">패널 숨기기</button></div><span id="studio-stats">실시간 3D · 초기화 중</span></div>`;
  $('#studio-target').value=target;
  const launcher=document.createElement('button');launcher.type='button';launcher.id='studio-launcher';launcher.className='studio-launcher';launcher.textContent='3D 설정';launcher.setAttribute('aria-controls','studio');document.body.appendChild(launcher);
  // Move the panel out of the visual's stacking context; it now lives on the right.
  document.body.appendChild(panel);
  function status(message){$('#studio-status').textContent=message;}
  function persist(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>safe.write(KEY,state),180);}
  addEventListener('pagehide',()=>{clearTimeout(saveTimer);safe.write(KEY,state);});
  function motionSync(){const reduced=osMotion.matches||state.motion.reduced;document.documentElement.dataset.reducedMotion=String(reduced);$('#motion-toggle').textContent=reduced?'움직임 줄이기 적용 중':state.motion.paused?'모션 재생':'모션 일시정지';$('#motion-toggle').setAttribute('aria-pressed',String(reduced||state.motion.paused));$('#motion-toggle').disabled=reduced;scene?.setPaused(reduced);}
  function update(message){scene?.update(state);motionSync();persist();if(message)status(message);syncInputs();disableFields();}
  function open(value){panel.hidden=!value;$('#studio-toggle').setAttribute('aria-expanded',String(value));launcher.hidden=value;document.body.classList.toggle('studio-open',value);}
  $('#studio-toggle').addEventListener('click',()=>open(panel.hidden));launcher.addEventListener('click',()=>open(true));$('#studio-close').addEventListener('click',()=>{open(false);launcher.focus();});$('#hide-controls').addEventListener('click',()=>{open(false);launcher.focus();});
  $('#motion-toggle').addEventListener('click',()=>{state.motion.paused=!state.motion.paused;update();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){open(false);launcher.focus();}if(e.shiftKey&&e.code==='KeyD'&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))open(panel.hidden);});
  osMotion.addEventListener('change',()=>{motionSync();syncInputs();});
  $('#studio-target').addEventListener('change',e=>{target=e.target.value;render();});
  $('.studio-tabs').addEventListener('click',e=>{const button=e.target.closest('[data-tab]');if(button){tab=button.dataset.tab;render();}});
  $('.studio-tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const current=TABS.indexOf(tab);tab=TABS[e.key==='Home'?0:e.key==='End'?TABS.length-1:(current+(e.key==='ArrowRight'?1:-1)+TABS.length)%TABS.length];render();document.querySelector(`[data-tab="${tab}"]`).focus();});
  function mode(value){scene?.setInteraction(value);$('#camera-mode').setAttribute('aria-pressed',String(value==='camera'));$('#tile-mode').setAttribute('aria-pressed',String(value==='select'));if(value==='select'){target='tiles';tab='형태·배열';$('#studio-target').value=target;render();status('클릭·탭으로 타일을 추가 선택하거나 해제합니다.');}else status('드래그 회전 · 휠 확대 · Shift/우클릭 드래그 이동 · 두 손가락 확대/이동');}
  $('#move-models').addEventListener('click',()=>{target='all';tab='구도';$('#studio-target').value=target;render();status('현재 모델 전체를 이동합니다. 카메라 위치는 유지됩니다.');});
  $('#camera-mode').addEventListener('click',()=>mode('camera'));$('#tile-mode').addEventListener('click',()=>mode('select'));
  $('#group-reset').addEventListener('click',()=>{const base=modelDefaults();if(target==='all')state=base;else if(PIN_SHELL_TARGETS[target]&&tab==='색상·재질')set(state,`${targetPath(target)}.material`,clone(get(base,`${targetPath(target)}.material`)));else set(state,targetPath(target),clone(get(base,targetPath(target))));selected=[];scene?.selectPattern('none');update(`${GROUPS[target]} 설정을 초기화했습니다.`);render();});
  function descriptorHTML(f){
    const value=get(state,f.path),id=`setting-${f.path.replaceAll('.','-')}`,hint=`${id}-hint`,common=`data-path="${f.path}" aria-describedby="${hint}"`;
    const label=`<label for="${id}">${f.label}</label>`;
    let input;
    if(f.type==='number')input=`<div class="numeric-control"><input id="${id}" ${common} type="range" min="${f.min}" max="${f.max}" step="${f.step}" value="${value}" aria-label="${f.label} 슬라이더"><div class="number-wrap"><input ${common} type="number" min="${f.min}" max="${f.max}" step="${f.step}" value="${value}" aria-label="${f.label} 직접 입력"><span>${f.unit||''}</span></div></div>`;
    if(f.type==='color')input=`<div class="color-control"><input id="${id}" ${common} type="color" value="${value}" aria-label="${f.label} 컬러 피커"><input ${common} type="text" value="${value}" pattern="#[0-9A-Fa-f]{6}" maxlength="7" aria-label="${f.label} HEX"></div>`;
    if(f.type==='boolean')input=`<input id="${id}" ${common} type="checkbox" ${value?'checked':''}>`;
    if(f.type==='select')input=`<select id="${id}" ${common}>${Object.entries(f.options).map(([v,l])=>`<option value="${v}" ${v===value?'selected':''}>${l}</option>`).join('')}</select>`;
    return `<div class="control-row ${f.type==='boolean'?'boolean-row':''}" data-row="${f.path}">${label}${input}<p class="control-hint" id="${hint}">${f.hint||''}</p></div>`;
  }
  function actionsHTML(){
    if(state.model==='pinOrbit'&&tab==='형태·배열'&&target!=='all')return '<p class="studio-help">새 레퍼런스 시안입니다. 파란 반구와 속이 빈 유리 반구를 독립적으로 조절합니다. 문구는 선명한 웹 텍스트입니다. 이전 기준값은 저장 탭의 기억한 현재 설정으로 복원할 수 있습니다.</p>';
    if(isSource()&&tab==='형태·배열'&&target==='sphere')return '<p class="studio-help">구의 원본 크기·위치를 유지하면서 메시를 더 촘촘하게 만들었습니다. 고밀도를 끄면 Blender 원본 메시와 비교할 수 있습니다.</p>';
    if(isSource()&&tab==='형태·배열'&&target!=='all')return '<p class="studio-help">261101.blend의 실제 메시·노멀·구멍을 사용합니다. 원형 고리로 보이는 부분은 판에 뚫린 구멍의 절단면입니다. 6개 배열과 원본 카메라를 기본값으로 제공합니다.</p>';
    if(state.model==='glassStack'&&tab==='형태·배열'&&target!=='all')return '<p class="studio-help">002.png 기준으로 다시 만든 실제 3D입니다. 구·판·링을 각각 편집할 수 있습니다. 전체 이동과 카메라는 구도 탭에서 조절하세요.</p>';
    if(state.model==='pinOrbit'&&tab==='색상·재질'&&target!=='all')return `<div class="scope-note">${target==='pinRings'?'유리 반구 전체 적용':'선택한 반구에만 적용'}<strong>${GROUPS[target]} · 실시간</strong></div>${state.pinRings.preview==='clay'&&target!=='pinCore'?'<p class="studio-help">불투명 형태 확인 모드입니다. 실제 재질 보기로 전환하세요.</p><button class="full-button" data-action="glass-preview">유리 재질 보기로 전환</button>':''}<details class="material-copy-controls"><summary>재질 복사 · 연결</summary><label class="material-link"><input id="material-link" type="checkbox" ${state.links.material?'checked':''}> 모든 반구의 이후 재질 변경 연결</label><p class="studio-help">${target==='pinRings'?'표시값은 전체 적용용 기준값입니다. 변경한 속성만 유리 반구 전체에 반영합니다. 개별 값은 번호별로 선택해 확인하세요.':'연결이 꺼져 있으면 다른 반구의 재질은 바뀌지 않습니다.'} 실제 벽 두께와 굴절 계산용 두께는 별개입니다.</p><div class="action-grid"><button data-action="material-glass">유리 반구들에 현재 재질 복사</button><button data-action="material-all">파란 반구까지 전체에 복사</button></div></details>`;
    if(state.model==='glassStack'&&tab==='색상·재질'&&target!=='all')return `<div class="scope-note">선택 대상 적용 <strong>${GROUPS[target]} · 실시간</strong></div><label class="material-link"><input id="material-link" type="checkbox" ${state.links.material?'checked':''}> 표시된 그룹의 이후 재질 변경 연결</label><p class="studio-help">형상의 두께와 굴절 계산용 두께는 별개입니다. 원본 재질로 돌아가려면 선택 그룹을 초기화하세요.</p><button class="full-button" data-action="material-all">전체에 현재 재질 적용</button>`;
    if(tab==='형태·배열'&&state.model==='loops'&&target==='loops')return `<div class="shape-review"><h3>기본 조형 검토</h3><p class="studio-help">큰 흐름 하나와 가는 보조 곡선입니다. 회색 정지 모형으로 실루엣부터 비교해 보세요.</p><div class="shape-options">${Object.entries({fold:'01 접힌 흐름',sweep:'02 긴 S',knot:'03 느슨한 꼬임'}).map(([id,label])=>`<button type="button" data-sculpture="${id}" aria-pressed="${state.loops.silhouette===id}">${label}</button>`).join('')}</div><div class="shape-preview-modes"><button type="button" data-preview="clay" aria-pressed="${state.loops.preview==='clay'}">회색 형태 보기</button><button type="button" data-preview="glass" aria-pressed="${state.loops.preview==='glass'}">유리 재질 보기</button></div></div>`;
    if(tab==='색상·재질'&&state.model==='loops')return target==='all'?'<p class="studio-help">유리 곡선을 선택하면 모든 곡선의 재질을 함께 편집할 수 있습니다.</p><button class="full-button" data-target="loops">유리 곡선 재질 편집 →</button>':'<div class="scope-note">선택 대상 적용 <strong>유리 곡선 전체 · 실시간</strong></div><p class="studio-help">실제 단면 두께와 굴절 계산용 두께를 각각 조절할 수 있습니다.</p><div class="shape-preview-modes"><button type="button" data-preview="clay">회색 형태 보기</button><button type="button" data-preview="glass">유리 재질 보기</button></div>';
    if(tab==='구도'&&target==='all')return `<div class="studio-section-head"><label for="camera-profile">편집할 카메라</label><select id="camera-profile"><option value="camera" ${profile==='camera'?'selected':''}>데스크톱</option><option value="mobileCamera" ${profile==='mobileCamera'?'selected':''}>모바일 전용</option></select></div><p class="studio-help">수치는 장면 단위 u입니다. ${isSource()?'Blender 원본 판의 가로는 2u입니다.':'기본 타일 가로가 약 1u입니다.'}</p><div class="action-grid"><button data-action="camera-reset">카메라 초기화</button><button data-action="camera-save">현재 구도 저장</button><button data-action="camera-load">저장 구도 불러오기</button></div>`;
    if(tab==='형태·배열'&&target==='tiles')return `<div class="selection-tools"><div class="selection-heading"><strong>타일 선택</strong><span id="selection-count">${selected.length}개 선택</span></div><div class="pattern-buttons"><button data-pattern="all">전체</button><button data-pattern="border">테두리</button><button data-pattern="center">중앙 주변</button><button data-pattern="none">해제</button></div><p class="studio-help">선택 모드에서 클릭하면 여러 타일을 누적 선택합니다.</p><details><summary>선택 타일 개별 변경</summary><div class="selection-edit">${['x','y','z','rx','rz','scale'].map((k,i)=>`<label>${['좌우','높이','앞뒤','X 기울기','Z 기울기','크기 배율'][i]}<input data-selected="${k}" type="number" value="${k==='scale'?1:0}" step=".05" min="${k==='scale'?.1:-5}" max="${k==='scale'?3:5}"></label>`).join('')}<label>개별 색상<input id="selection-color" type="color" value="#348fee"></label></div><div class="action-grid"><button data-action="selection-apply">선택 타일에 적용</button><button data-action="selection-reset">선택 타일 복원</button></div></details></div><button class="full-button" data-action="reseed">랜덤 시드 다시 생성</button>`;
    if(tab==='형태·배열'&&target==='all')return `<p class="studio-help">편집할 모델을 선택해 형태를 조절하세요.</p><div class="group-shortcuts">${Object.entries(GROUPS).filter(([id])=>groupIds().includes(id)).map(([id,name])=>`<button data-target="${id}">${name} 편집 →</button>`).join('')}</div>`;
    if(tab==='색상·재질')return target==='all'?`<p class="studio-help">재질은 그룹별로 저장합니다. 그룹을 선택하면 해당 그룹에 즉시 반영되고, ‘전체에 현재 재질 적용’을 누르면 표시된 그룹에 복사됩니다.</p><div class="group-shortcuts">${groupIds().map(id=>`<button data-target="${id}">${GROUPS[id]} 재질 →</button>`).join('')}</div>`:`<div class="scope-note">선택 대상 적용 <strong>${GROUPS[target]} · 실시간</strong></div><label class="material-link"><input id="material-link" type="checkbox" ${state.links.material?'checked':''}> 표시된 그룹의 재질 설정 연결</label><p class="studio-help">연결은 이후 변경한 속성만 함께 바꿉니다. 전체 적용은 현재 재질 전체를 한 번 복사합니다.</p><button class="full-button" data-action="material-all">전체에 현재 재질 적용</button>`;
    if(tab==='조명·반사')return `<div class="studio-section-head"><label for="light-select">개별 조명</label><select id="light-select">${Object.entries({key:'주광',fill:'보조광',rim:'테두리광',ambient:'주변광',base:'받침대 아래 포인트'}).map(([id,label])=>`<option value="${id}" ${id===lightId?'selected':''}>${label}</option>`).join('')}</select></div><div class="action-grid three"><button data-action="light-reset">선택 초기화</button><button data-action="lights-reset">전체 초기화</button><button data-action="lights-off">모두 끄기</button></div>`;
    if(tab==='모션'&&target==='all')return `<button class="full-button" data-action="restart">모션 다시 시작</button><p class="studio-help">그룹별 정지는 각 그룹의 모션 탭에서 독립적으로 설정합니다. OS 움직임 줄이기가 우선 적용됩니다.</p>`;
    return '';
  }
  function storageHTML(){return `
    <h3>프리셋</h3><label class="text-label" for="preset-name">프리셋 이름</label><input id="preset-name" class="wide-input" type="text" maxlength="50" placeholder="예: 푸른 크리스탈 · 밝은 조명"><button class="full-button" data-action="preset-save">현재 설정을 프리셋으로 저장</button>
    <label class="text-label" for="preset-list">저장한 프리셋</label><select id="preset-list"></select><div class="action-grid three"><button data-action="preset-load">불러오기</button><button data-action="preset-rename">이름 변경</button><button data-action="preset-delete">삭제</button></div>
    <h3>설정 JSON</h3><div class="action-grid"><button data-action="json-copy">전체 JSON 복사</button><button data-action="json-export">JSON 파일 내보내기</button></div><label class="text-label" for="json-input">설정 붙여넣기</label><textarea id="json-input" rows="5" placeholder="스튜디오 v2 JSON"></textarea><div class="action-grid"><button data-action="json-apply">붙여넣은 JSON 적용</button><button data-action="json-file">JSON 파일 가져오기</button></div><input id="json-file" type="file" accept=".json,application/json" hidden>
    <h3>이미지 · 미리보기</h3><div class="action-grid"><button data-action="png">현재 화면 PNG</button><button data-action="png-transparent">투명 배경 PNG</button><button data-action="mobile-preview">모바일 미리보기</button><button data-action="desktop-preview">원래 화면</button></div><p class="studio-help">PNG는 배경을 포함한 3D 장면을 저장합니다. 투명 PNG는 오브젝트만 저장하며 웹 문구와 컨트롤은 포함하지 않습니다.</p><div id="export-preview" class="export-preview" hidden></div>
    <label class="text-label" for="quality-select">렌더링 품질</label><select id="quality-select">${Object.entries({auto:'자동 · 모바일 절약',low:'낮음',medium:'보통',high:'높음'}).map(([id,label])=>`<option value="${id}" ${state.render.quality===id?'selected':''}>${label}</option>`).join('')}</select><p class="studio-help">품질은 해상도, 유리 투과 버퍼, 그림자 맵 크기를 조절합니다.</p><button class="full-button danger" data-action="all-reset">전체 설정 초기화</button>`;}
  function render(){
    heroCopy.hidden=state.model!=='pinOrbit';
    $('#scene').setAttribute('aria-label',state.model==='pinOrbit'?'평평한 원형 절단면이 있는 파란 반구와 속이 빈 유리 반구':state.model==='glassStack'?(isSource()?'Blender 원본 파란 구와 원형 구멍이 있는 6개 유리판':'코발트색 구와 겹쳐진 투명 유리판, 유리 링'):state.model==='loops'?(state.loops.preview==='clay'?'비대칭 곡선 조형 회색 모형':'비대칭 유리 곡선 조형'):'푸른 유리 크리스탈과 격자 타일');$('.visual-panel').setAttribute('aria-label','실시간 3D 그래픽');
    $('.studio-top .eyebrow').textContent=state.model==='pinOrbit'?'HEMISPHERE · HOLLOW GLASS':isSource()?'BLENDER SOURCE · 261101':state.model==='loops'&&state.loops.preview==='clay'?`FORM STUDY · ${{fold:'01',sweep:'02',knot:'03'}[state.loops.silhouette]||'LEGACY'}`:'REALTIME SCENE';
    const validTargets=['all',...groupIds()];if(!validTargets.includes(target))target=groupIds()[0];const targetSelect=$('#studio-target');targetSelect.replaceChildren(...validTargets.map(id=>new Option(GROUPS[id],id)));targetSelect.value=target;$('#tile-mode').disabled=state.model!=='tiles';$('#tile-mode').title=state.model!=='tiles'?'현재 모델에는 선택할 타일이 없습니다.':'';if(state.model!=='tiles'){scene?.setInteraction('camera');$('#camera-mode').setAttribute('aria-pressed','true');$('#tile-mode').setAttribute('aria-pressed','false');}
    const common=['조명·반사','그림자·배경','저장'].includes(tab);$('#studio-target').disabled=common;$('#studio-scope').hidden=!common;$('#group-reset').disabled=common;$('#group-reset').title=common?'그룹 초기화는 구도·형태·재질·모션 탭에서 사용하세요.':'';
    document.querySelectorAll('[data-tab]').forEach(button=>{const active=button.dataset.tab===tab;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});
    $('#studio-content').setAttribute('aria-labelledby',`tab-${TABS.indexOf(tab)}`);
    const fields=fieldsFor(target,tab,profile,lightId,state.geometry.source).filter(f=>!(['loops.silhouette','loops.preview'].includes(f.path)&&tab==='형태·배열'));
    if(tab==='구도'&&target==='all'){const pose=fields.filter(f=>f.path.startsWith('scene.')),camera=fields.filter(f=>!f.path.startsWith('scene.'));$('#studio-content').innerHTML=`<details class="whole-model-panel" open><summary>전체 모델 이동</summary><p class="studio-help">${state.model==='pinOrbit'?'파란 반구와 속이 빈 유리 반구를 함께':state.model==='glassStack'?(isSource()?'구와 구멍이 있는 유리판을 함께':'구·유리판·링을 함께'):state.model==='loops'?'유리 곡선 전체를':'타일·받침대·크리스탈을 함께'} 이동합니다. 카메라는 유지됩니다.</p><div class="control-list">${pose.map(descriptorHTML).join('')}</div><button class="full-button" data-action="scene-center">위치를 원점으로</button></details>${state.model==='glassStack'?`<a class="reference-preview-link" href="?view=scene" target="_blank" rel="noopener">장면만 크게 보기 ↗</a><p class="studio-help">${isSource()?'261101.blend 원본 기준 · 구멍을 포함한 실제 메시와 원본 카메라입니다.':'002 이미지 기준 · 구·판·링을 조합한 이전 시안입니다.'} 구의 광택, 유리 단면, 층 간격과 초점을 개별 편집할 수 있습니다. ${isSource()?'기본은 구가 첫 유리판 구멍에 들어갔다 나오는 6초 자동 반복입니다.':'기본은 원본 비교를 위한 정지 상태입니다.'}</p>`:''}${actionsHTML()}<div class="control-list">${camera.map(descriptorHTML).join('')}</div>`;}else $('#studio-content').innerHTML=tab==='저장'?storageHTML():`${actionsHTML()}<div class="control-list">${fields.map(descriptorHTML).join('')}</div>`;
    $('#group-reset').textContent=PIN_SHELL_TARGETS[target]&&tab==='색상·재질'?'선택 반구 재질 초기화':'선택 그룹 초기화';
    $('#studio-content').scrollTop=0;if(tab==='저장')renderPresets();disableFields();
  }
  function syncInputs(){for(const input of document.querySelectorAll('[data-path]')){if(input===document.activeElement)continue;const value=get(state,input.dataset.path);if(input.type==='checkbox')input.checked=value;else input.value=value;}}
  function disableFields(){
    for(const row of document.querySelectorAll('[data-row]')){
      const path=row.dataset.row;let reason='';
      if(state.loops.silhouette==='legacy'&&['loops.fullness','loops.taper'].includes(path))reason='이 값은 새 조형 시안 01·02·03에서 사용합니다.';
      if(state.model==='loops'&&state.loops.preview==='clay'&&(path.startsWith('loops.material.')||path.startsWith('lights.')||path.startsWith('environment.')||path.startsWith('background.')))reason='회색 형태 보기는 중립 재질·조명·배경을 사용합니다. 유리 재질 보기로 전환하면 편집할 수 있습니다.';
      if(path.endsWith('.fov')&&get(state,path.split('.')[0]+'.type')==='orthographic')reason='직교 카메라에서는 확대율을 사용합니다.';
      if(path.endsWith('.zoom')&&get(state,path.split('.')[0]+'.type')!=='orthographic')reason='원근 카메라에서는 거리와 시야각을 사용합니다.';
      if(path.startsWith('lights.')){const cfg=state.lights[lightId];if(cfg.type==='ambient'&&!path.endsWith('.intensity')&&!path.endsWith('.enabled')&&!path.endsWith('.color'))reason='주변광은 위치·방향·그림자가 없습니다.';if(cfg.type==='point'&&path.includes('.target'))reason='포인트 조명은 모든 방향으로 빛을 냅니다.';}
      if(path.includes('.material.')&&['ior','opticalThickness','attenuationColor','attenuationDistance'].includes(path.split('.').at(-1))&&get(state,`${targetPath(target)}.material`)?.transmission===0)reason='유리 투과율이 0보다 클 때 사용합니다.';
      if(path==='crystal.bevel'&&state.crystal.shape!=='chamfer')reason='모서리 깎인 크리스탈 형태에서 사용합니다.';
      if(path==='crystal.roundness'&&state.crystal.shape==='chamfer')reason='현재 형태에서는 모서리 깎는 폭을 사용합니다.';
      if(path==='pedestal.motion.height'&&state.pedestal.motion.linkCrystal)reason='크리스탈의 부유 높이에 연결되어 있습니다.';
      if(['pedestal.width','pedestal.depth'].includes(path)&&(state.pedestal.autoFit||state.pedestal.linkCrystal))reason='자동 크기 연결이 켜져 있습니다.';
      if(path.startsWith('background.fog')&&path!=='background.fog'&&!state.background.fog)reason='안개를 켜면 사용할 수 있습니다.';
      if(['background.color2','background.angle'].includes(path)&&state.background.mode!=='gradient')reason='그라데이션 배경에서 사용합니다.';
      if(path.startsWith('lens.')&&path!=='lens.enabled'&&(!['glassStack','pinOrbit'].includes(state.model)||!state.lens.enabled))reason=!['glassStack','pinOrbit'].includes(state.model)?'유리 오브젝트 장면에서 사용하는 렌즈 효과입니다.':'피사계 심도를 켜면 사용할 수 있습니다.';
      if(state.model==='pinOrbit'&&path==='pinCore.roundness'&&state.pinCore.shape!=='roundedCube')reason='둥근 큐브 형태에서 사용하는 설정입니다. 반구는 절단면 테두리 라운드를 조절하세요.';
      if(state.model==='pinOrbit'&&path==='pinCore.rimRoundness'&&state.pinCore.shape!=='hemisphere')reason='반구 형태에서 절단면의 가장자리를 조절합니다.';
      if(path.startsWith('pinRings.layers.')){const key=path.split('.')[2];if(['one','two','three','four'].indexOf(key)>=state.pinRings.count)reason='현재 표시 개수에 포함되지 않은 유리 반구입니다.';}
      if((path.startsWith('pinRings.material.')||path.startsWith('pinRings.layers.')&&path.includes('.material.'))&&state.pinRings.preview==='clay')reason='형태 확인 모드입니다. 유리 재질 보기로 바꾸면 재질을 편집할 수 있습니다.';
      if(path==='pinRings.optics'&&state.pinRings.preview==='clay')reason='불투명 형태 확인 모드에서는 굴절을 사용하지 않습니다.';
      if(isSource()&&path==='sphere.segments'&&!state.sphere.smooth)reason='고밀도 구 메시를 켜면 분할 수를 조절할 수 있습니다.';
      if(isSource()&&path==='sphere.motion.height'&&state.sphere.motion.type==='dip')reason='기존 수직 부유에서 사용합니다. 왕복 모션은 들어가는 깊이를 조절하세요.';
      if(isSource()&&['sphere.motion.depth','sphere.motion.duration'].includes(path)&&state.sphere.motion.type!=='dip')reason='유리 사이로 들어갔다 나오기 모션에서 사용합니다.';
      if(path==='motion.progress'&&state.motion.mode!=='manual')reason='특정 진행률에서 정지 모드에서 사용합니다.';
      if(['motion.scrollStart','motion.scrollEnd'].includes(path)&&state.motion.mode!=='scroll')reason='스크롤 진행 모드에서 사용합니다.';
      const descriptor=fieldsFor(target,tab,profile,lightId,state.geometry.source).find(f=>f.path===path);row.querySelector('.control-hint').textContent=reason||descriptor?.hint||'';row.classList.toggle('is-disabled',Boolean(reason));row.querySelectorAll('input,select').forEach(input=>input.disabled=Boolean(reason));
    }
  }
  $('#studio-content').addEventListener('input',e=>{
    const input=e.target,path=input.dataset.path;if(!path)return;
    const f=fieldsFor(target,tab,profile,lightId,state.geometry.source).find(f=>f.path===path);if(!f)return;
    let value=input.type==='checkbox'?input.checked:f.type==='number'?Number(input.value):input.value;
    if(f.type==='number'){if(input.value===''||!Number.isFinite(value))return;value=Math.max(f.min,Math.min(f.max,value));if(f.step===1)value=Math.round(value);}
    if(f.type==='color'&&!/^#[0-9a-f]{6}$/i.test(value)){input.setCustomValidity('색상을 #RRGGBB 형식으로 입력해 주세요.');status('색상을 #RRGGBB 형식으로 입력해 주세요.');return;}input.setCustomValidity('');
    const old=get(state,path);set(state,path,value);
    if(path==='crystal.shape'&&value==='cube')state.crystal.height=state.crystal.depth=state.crystal.width;
    if(state.crystal.lockRatio&&/^crystal\.(width|height|depth)$/.test(path)){const ratio=value/old;for(const key of ['width','height','depth'])if(path!==`crystal.${key}`)state.crystal[key]=Math.max(.4,Math.min(4,state.crystal[key]*ratio));}
    if(path.includes('.material.'))changeMaterial(state,target,path.split('.').at(-1),value);
    update();
  });
  $('#studio-content').addEventListener('change',async e=>{
    if(e.target.id==='preset-list'){selectedPreset=e.target.value;presetPermissions();}
    if(e.target.id==='camera-profile'){profile=e.target.value;scene?.setProfile(profile);render();}
    if(e.target.id==='light-select'){lightId=e.target.value;render();}
    if(e.target.id==='material-link'){state.links.material=e.target.checked;update('재질 연결 설정을 변경했습니다.');}
    if(e.target.dataset.path==='pinRings.count')render();
    if(e.target.id==='quality-select'){state.render.quality=e.target.value;update();}
    if(e.target.id==='json-file')try{const file=e.target.files[0];if(!file)return;if(file.size>1_000_000)throw Error('JSON 파일은 1MB 이하로 가져와 주세요.');state=validate(JSON.parse(await file.text()));update('JSON 파일을 가져왔습니다.');render();}catch(error){status(error.message);}
    if(e.target.dataset.path&&e.target.type==='number'){e.target.value=get(state,e.target.dataset.path);}
  });
  function download(url,name){const a=document.createElement('a');a.href=url;a.download=name;a.click();}
  function jsonDownload(){const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));download(url,'examvue-scene-v2.json');setTimeout(()=>URL.revokeObjectURL(url),5000);}
  function presets(){const values=safe.read(PRESETS);return Array.isArray(values)?values.filter(p=>p&&typeof p.name==='string'&&p.settings).slice(0,30):[];}
  function renderPresets(){
    const select=$('#preset-list');if(!select)return;select.replaceChildren();
    for(const [id,p]of Object.entries(builtInPresets()))select.add(new Option(p.name,`builtin:${id}`));
    if(safe.read(KEY+'.beforeGlassOptics'))select.add(new Option('유리 질감 변경 전 · 장면 백업','backup:glass'));
    if(safe.read(KEY+'.beforeBlend261101'))select.add(new Option('Blender 교체 전 · 자동 백업','backup:blend'));
    if(safe.read(KEY+'.before002'))select.add(new Option('이전 장면 · 자동 백업','backup:002'));
    presets().forEach((p,i)=>select.add(new Option(p.name,String(i))));
    if([...select.options].some(o=>o.value===selectedPreset))select.value=selectedPreset;else selectedPreset=select.value;
    presetPermissions();
  }
  function presetPermissions(){const builtIn=/^(builtin|backup):/.test($('#preset-list')?.value||'');for(const action of ['preset-rename','preset-delete']){const button=document.querySelector(`[data-action="${action}"]`);if(button){button.disabled=builtIn;button.title=builtIn?'기본 프리셋은 보존합니다. 현재 설정을 새 이름으로 저장한 뒤 편집하세요.':'';}}}
  $('#studio-content').addEventListener('click',async e=>{
    const button=e.target.closest('button');if(!button)return;
    if(button.dataset.target){target=button.dataset.target;$('#studio-target').value=target;render();return;}
    if(button.dataset.pattern){scene?.selectPattern(button.dataset.pattern);return;}
    const action=button.dataset.action;if(button.dataset.sculpture){state.loops.silhouette=button.dataset.sculpture;scene?.restart();update('조형 시안을 변경했습니다.');render();return;}if(button.dataset.preview){state.loops.preview=button.dataset.preview;update('보기 방식을 변경했습니다.');render();return;}if(!action)return;
    try{
      if(action==='glass-preview'){state.pinRings.preview='glass';update('각 반구의 실제 재질을 표시합니다.');render();}
      if(action==='scene-center'){Object.assign(state.scene,{x:0,y:0,z:0});update('전체 모델 위치를 원점으로 되돌렸습니다.');}
      if(action==='camera-reset'){state[profile]=modelDefaults()[profile];scene?.setProfile(profile);update('카메라를 초기화했습니다.');render();}
      if(action==='camera-save'){const view=scene?.getCamera();if(view){state[view.profile]=view.value;safe.write('examvue.studio.savedCamera',view);persist();status('현재 구도를 저장했습니다.');}}
      if(action==='camera-load'){const saved=safe.read('examvue.studio.savedCamera');if(!saved||!['camera','mobileCamera'].includes(saved.profile))throw Error('저장한 구도가 없습니다.');const candidate=clone(state);candidate[saved.profile]=saved.value;state=validate(candidate);profile=saved.profile;scene?.setProfile(profile);update('저장한 구도를 불러왔습니다.');render();}
      if(action==='reseed'){state.tiles.seed=Math.floor(Math.random()*99999)+1;update();}
      if(action==='material-all'||action==='material-glass'){const count=copyMaterial(state,target,action==='material-glass'?'glass':'all');update(`현재 재질을 ${count}개 반구·그룹에 복사했습니다.`);}
      if(action==='selection-apply'){
        if(!selected.length)throw Error('타일을 먼저 선택해 주세요.');const values={};for(const input of document.querySelectorAll('[data-selected]')){const number=Number(input.value);if(!Number.isFinite(number))throw Error('선택 타일의 수치를 확인하세요.');values[input.dataset.selected]=Math.max(Number(input.min),Math.min(Number(input.max),number));}values.color=$('#selection-color').value;for(const id of selected)state.tiles.overrides[id]={...state.tiles.overrides[id],...values};update(`${selected.length}개 타일에 적용했습니다.`);
      }
      if(action==='selection-reset'){for(const id of selected)delete state.tiles.overrides[id];update('선택 타일의 개별 설정을 복원했습니다.');}
      if(action==='light-reset'){state.lights[lightId]=modelDefaults().lights[lightId];update();render();}
      if(action==='lights-reset'){state.lights=modelDefaults().lights;update();render();}
      if(action==='lights-off'){for(const l of Object.values(state.lights))l.enabled=false;update('직접 조명을 껐습니다. 재질의 환경 반사는 유지됩니다.');}
      if(action==='restart'){scene?.restart();status('모션을 처음부터 재생합니다.');}
      if(action==='json-copy'){const json=JSON.stringify(state,null,2);try{await navigator.clipboard.writeText(json);status('전체 JSON을 복사했습니다.');}catch{$('#json-input').value=json;$('#json-input').select();status('선택한 JSON을 Ctrl+C로 복사해 주세요.');}}
      if(action==='json-export')jsonDownload();
      if(action==='json-apply'){state=validate(JSON.parse($('#json-input').value));update('전체 설정을 적용했습니다.');render();}
      if(action==='json-file')$('#json-file').click();
      if(action==='png'||action==='png-transparent'){
        if(!scene)throw Error('3D 장면을 준비 중입니다.');const url=scene.capture(action==='png-transparent'),name=`examvue-${action==='png'?'scene':'transparent'}.png`;
        const preview=$('#export-preview');preview.replaceChildren();const img=document.createElement('img');img.src=url;img.alt='내보내기 PNG 미리보기';const link=document.createElement('a');link.href=url;link.download=name;link.textContent='PNG 파일 저장';preview.append(img,link);preview.hidden=false;
        download(url,name);status('PNG를 생성했습니다. 다운로드가 막히면 아래 PNG 파일 저장 링크를 사용하세요.');
      }
      if(action==='mobile-preview'){document.body.classList.add('studio-mobile-preview');scene?.setProfile('mobileCamera');status('3D 영역을 모바일 폭 390px로 미리 봅니다.');}
      if(action==='desktop-preview'){document.body.classList.remove('studio-mobile-preview');scene?.setProfile('auto');status('반응형 화면으로 돌아왔습니다.');}
      if(action==='all-reset'){state=modelDefaults();scene?.restart();update('전체 설정을 기본 장면으로 초기화했습니다.');render();}
      if(action.startsWith('preset-')){
        const list=presets(),key=$('#preset-list').value,index=Number(key),name=$('#preset-name').value.trim();
        if(key.startsWith('backup:')&&action==='preset-load'){state=validate(safe.read(KEY+(key==='backup:glass'?'.beforeGlassOptics':key==='backup:blend'?'.beforeBlend261101':'.before002')));scene?.restart();update('이전 장면 자동 백업을 불러왔습니다.');render();return;}
        if(key.startsWith('builtin:')&&action==='preset-load'){const preset=builtInPresets()[key.slice(8)];state=validate(preset.settings);scene?.restart();update(`${preset.name} 프리셋을 적용했습니다.`);render();return;}
        if(action==='preset-save'){if(!name)throw Error('프리셋 이름을 입력해 주세요.');list.push({name,settings:clone(state)});if(list.length>30)list.shift();selectedPreset=String(list.length-1);}
        else {if(!list[index])throw Error('저장한 프리셋을 선택해 주세요.');if(action==='preset-load'){state=validate(list[index].settings);update('프리셋을 불러왔습니다.');render();}if(action==='preset-rename'){if(!name)throw Error('새 이름을 위에 입력해 주세요.');list[index].name=name;}if(action==='preset-delete')list.splice(index,1);}
        safe.write(PRESETS,list);renderPresets();if(action!=='preset-load')status('프리셋 목록을 저장했습니다.');
      }
    }catch(error){status(error instanceof SyntaxError?'올바른 JSON을 입력해 주세요.':error.message);}
  });
  render();motionSync();$('#scene-fallback').style.background=state.model==='loops'&&state.loops.preview==='clay'?'linear-gradient(140deg,#d3d9df,#f4f5f6)':state.background.mode==='gradient'?`linear-gradient(${state.background.angle}deg,${state.background.color},${state.background.color2})`:state.background.color;
  const query=new URLSearchParams(location.search);open(query.get('controls')==='1');if(query.get('controls')==='0'){launcher.hidden=true;$('#scene-tools').hidden=true;}
  import('./scene-v2.js').then(async({createScene})=>{
    scene=await createScene($('#scene'),state,{
      onCamera(key,value){state[key]=value;persist();syncInputs();},
      onSelection(ids){selected=ids;const count=$('#selection-count');if(count)count.textContent=`${ids.length}개 선택`;if(ids.length===1){const value=state.tiles.overrides[ids[0]]||{};for(const input of document.querySelectorAll('[data-selected]'))input.value=value[input.dataset.selected]??(input.dataset.selected==='scale'?1:0);if($('#selection-color'))$('#selection-color').value=value.color||state.tiles.material.color;}},
      onStats(stats){if(stats.source==='blend261101')$('#scene').setAttribute('aria-label',`Blender 원본 파란 구와 원형 구멍이 있는 ${stats.slabs}개 유리판`);$('#studio-stats').textContent=stats.model==='pinOrbit'?`실제 3D · 속이 빈 유리 반구 ${stats.rings}개`:stats.model==='glassStack'?stats.source==='blend261101'?`원본 메시 · 구 1 · 구멍 유리판 ${stats.slabs}장`:`구 1 · 유리판 ${stats.slabs} · 링 ${stats.rings} · 실제 3D`:stats.model==='loops'?`${stats.count}개 곡선 · ${stats.preview==='clay'?'회색 조형 검토':'유리 재질 보기'}`:`${stats.tiles}개 타일 · InstancedMesh · 실제 유리 지오메트리`;},
    });scene.update(state);motionSync();$('#scene-fallback').classList.add('ready');
  }).catch(error=>{console.error(error);$('#scene-error').hidden=false;status('3D 초기화에 실패했습니다. 페이지를 새로고침해 주세요.');});
  return {reducedMotion:()=>osMotion.matches||state.motion.reduced};
}

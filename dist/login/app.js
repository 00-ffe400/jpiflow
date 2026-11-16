const $ = (selector) => document.querySelector(selector);
const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch {} },
  remove(key) { try { localStorage.removeItem(key); } catch {} },
};
const defaults = Object.freeze({shape:'cube',material:'glass',color:'#148bff',thickness:1,curvature:.09,twist:0,transparency:.86,light:1.25,speed:.45,reducedMotion:false});
const ranges = {thickness:[.25,1.6],curvature:[.02,.5],twist:[-180,180],transparency:[0,1],light:[.2,3],speed:[0,2]};
function validateSettings(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('설정 객체를 확인해 주세요.');
  const result = {...defaults};
  for (const [key, bounds] of Object.entries(ranges)) {
    if (key in input) {
      if (typeof input[key] !== 'number' || !Number.isFinite(input[key])) throw new Error(`${key} 값은 숫자여야 합니다.`);
      result[key] = Math.max(bounds[0],Math.min(bounds[1],input[key]));
    }
  }
  if ('shape' in input && !['cube','sphere','ring'].includes(input.shape)) throw new Error('지원하지 않는 형태입니다.');
  if ('material' in input && !['glass','frosted','metal','ceramic'].includes(input.material)) throw new Error('지원하지 않는 재질입니다.');
  if ('color' in input && !/^#[0-9a-f]{6}$/i.test(input.color)) throw new Error('색상은 #RRGGBB 형식이어야 합니다.');
  for (const key of ['shape','material','color']) if (key in input) result[key] = input[key];
  if ('reducedMotion' in input && typeof input.reducedMotion !== 'boolean') throw new Error('움직임 설정을 확인해 주세요.');
  result.reducedMotion = input.reducedMotion ?? false;
  return result;
}
let settings;
try { settings = validateSettings(JSON.parse(storage.get('examvue.login.scene') || '{}')); } catch { settings = {...defaults}; }
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
let scene, paused = false;
function reduced() { return motionQuery.matches || settings.reducedMotion; }
function syncMotion() {
  document.documentElement.dataset.reducedMotion = String(reduced());
  $('#motion-toggle').textContent = reduced() ? '움직임 줄이기 적용 중' : paused ? '모션 재생' : '모션 일시정지';
  $('#motion-toggle').setAttribute('aria-pressed', String(paused || reduced()));
  $('#motion-toggle').disabled = reduced();
  scene?.setPaused(paused || reduced());
}
function syncControls() {
  for (const key of Object.keys(defaults)) {
    const input = key === 'reducedMotion' ? $('#reduce-motion') : $(`#${key}`);
    if (input.type === 'checkbox') input.checked = settings[key]; else input.value = settings[key];
    const output = $(`output[for="${key}"]`);
    if (output) output.value = key === 'twist' ? `${settings[key]}°` : key === 'transparency' ? `${Math.round(settings[key]*100)}%` : settings[key].toFixed(2);
  }
  syncMotion();
}
function applySettings() { syncControls(); scene?.update(settings); storage.set('examvue.login.scene',JSON.stringify(settings)); }
syncControls();
for (const key of Object.keys(defaults)) {
  const input = key === 'reducedMotion' ? $('#reduce-motion') : $(`#${key}`);
  input.addEventListener('input', () => {
    settings[key] = input.type === 'checkbox' ? input.checked : input.type === 'range' ? Number(input.value) : input.value;
    applySettings();
  });
}
motionQuery.addEventListener('change',syncMotion);
$('#motion-toggle').addEventListener('click', () => { paused = !paused; syncMotion(); });
function toggleStudio(open) { $('#studio').hidden = !open; $('#studio-toggle').setAttribute('aria-expanded',String(open)); }
$('#studio-toggle').addEventListener('click', () => toggleStudio($('#studio').hidden));
$('#studio-close').addEventListener('click', () => { toggleStudio(false); $('#studio-toggle').focus(); });
$('#hide-controls').addEventListener('click', () => { toggleStudio(false); $('#scene-tools').hidden = true; $('#email').focus(); });
const controlMode = new URLSearchParams(location.search).get('controls');
if (controlMode === '0') $('#scene-tools').hidden = true;
if (controlMode === '1') toggleStudio(true);
document.addEventListener('keydown', event => {
  if (event.shiftKey && event.code === 'KeyD' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
    $('#scene-tools').hidden = !$('#scene-tools').hidden;
    if ($('#scene-tools').hidden) toggleStudio(false);
  }
  if (event.key === 'Escape' && !$('#studio').hidden) { toggleStudio(false); $('#studio-toggle').focus(); }
});
$('#copy-settings').addEventListener('click', async () => {
  const json = JSON.stringify(settings,null,2);
  try { await navigator.clipboard.writeText(json); $('#studio-status').textContent = '설정을 복사했습니다. 다른 컴퓨터에서 가져올 수 있습니다.'; }
  catch { $('#settings-json').value = json; $('#settings-json').closest('details').open = true; $('#settings-json').select(); $('#studio-status').textContent = '선택된 설정을 Ctrl+C로 복사해 주세요.'; }
});
$('#reset-settings').addEventListener('click', () => { settings = {...defaults}; paused = false; applySettings(); $('#studio-status').textContent = '기본 설정으로 되돌렸습니다.'; });
$('#import-settings').addEventListener('click', () => {
  try { settings = validateSettings(JSON.parse($('#settings-json').value)); applySettings(); $('#studio-status').textContent = '설정을 적용했습니다.'; }
  catch (error) { $('#studio-status').textContent = error instanceof SyntaxError ? 'JSON 형식을 확인해 주세요.' : error.message; }
});

// Forms never send or persist passwords. Backend integration is intentionally separate.
const rememberedEmail = storage.get('examvue.login.email');
if (rememberedEmail) $('#email').value = rememberedEmail;
$('#remember').addEventListener('change', event => { if (!event.target.checked) storage.remove('examvue.login.email'); });
$('#password-toggle').addEventListener('click', () => {
  const visible = $('#password').type === 'password';
  $('#password').type = visible ? 'text' : 'password';
  $('#password-toggle').setAttribute('aria-pressed',String(visible));
  $('#password-toggle').setAttribute('aria-label',visible ? '비밀번호 숨기기' : '비밀번호 표시');
});
function errorFor(id, message) {
  const field = $(`#${id}`), error = $(`#${id}-error`);
  field.setAttribute('aria-invalid',String(Boolean(message))); error.hidden = !message; error.textContent = message;
}
for (const id of ['email','password']) $(`#${id}`).addEventListener('input', () => errorFor(id,''));
const dialog = $('#account-dialog');
const dialogData = {
  'find-id': ['아이디 찾기','가입 시 등록한 정보로 아이디를 확인하는 화면입니다.'],
  'reset-password': ['비밀번호 찾기','가입한 이메일로 비밀번호 재설정 링크를 요청하는 화면입니다.'],
  'sign-up': ['회원가입','ExamVue 365 Flow 계정을 만드는 화면입니다.'],
  'login': ['로그인 미리보기','입력 항목을 확인했습니다.'],
};
let returnFocus;
function openDialog(type) {
  returnFocus = document.activeElement;
  $('#dialog-title').textContent = dialogData[type][0];
  $('#dialog-description').textContent = dialogData[type][1];
  $('#dialog-content').textContent = '현재는 인터랙션 확인용 데모입니다. 인증 서버가 연결되어 있지 않아 로그인, 이메일 발송, 계정 생성은 수행하지 않습니다.';
  dialog.showModal();
}
document.querySelectorAll('[data-dialog]').forEach(button => button.addEventListener('click', () => openDialog(button.dataset.dialog)));
document.querySelectorAll('.dialog-close').forEach(button => button.addEventListener('click', () => dialog.close()));
dialog.addEventListener('click', event => { if (event.target === dialog) { const r=dialog.getBoundingClientRect(); if (event.clientX<r.left || event.clientX>r.right || event.clientY<r.top || event.clientY>r.bottom) dialog.close(); } });
dialog.addEventListener('close', () => returnFocus?.focus());
$('#login-form').addEventListener('submit', event => {
  event.preventDefault();
  const email = $('#email').value.trim();
  const emailValid = Boolean(email) && $('#email').validity.valid;
  const passwordValid = Boolean($('#password').value);
  errorFor('email',emailValid ? '' : '올바른 이메일 주소를 입력해 주세요.');
  errorFor('password',passwordValid ? '' : '비밀번호를 입력해 주세요.');
  if (!emailValid || !passwordValid) { $(emailValid ? '#password' : '#email').focus(); return; }
  if ($('#remember').checked) storage.set('examvue.login.email',email); else storage.remove('examvue.login.email');
  openDialog('login');
});

// Future sections opt in by meaningful unit; content is visible if JS or observation fails.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    const bottomReachable = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40;
    if (entry.isIntersecting || bottomReachable) {
      if (!reduced()) entry.target.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:750,easing:'cubic-bezier(.22,1,.36,1)'});
      observer.unobserve(entry.target);
    }
  }), {rootMargin:'0px 0px -25% 0px',threshold:0});
  document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
}
import('./scene.js').then(({createScene}) => {
  scene = createScene($('#scene'),settings);
  syncMotion();
  $('#scene-fallback').classList.add('ready');
}).catch(error => {
  console.warn('3D preview unavailable:',error.message);
  $('#scene-error').hidden = false;
  $('#scene-tools').hidden = true;
});

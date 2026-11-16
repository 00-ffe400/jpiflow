import {initStudio} from './studio.js';
const $ = (selector) => document.querySelector(selector);
const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch {} },
  remove(key) { try { localStorage.removeItem(key); } catch {} },
};
const studio=initStudio();
const reduced=()=>studio.reducedMotion();

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

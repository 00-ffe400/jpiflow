const info={
telemedicine:['Telemedicine service','영상진단 장비부터 전문 원격 판독까지, 동물병원을 위한 원격진료 서비스를 제공합니다.'],
pacs:['Web PACS','별도 설치 없이 웹에서 사용하는 영상 관리 서비스입니다.'],
services:['Total Imaging Solution','ExamVue 365 Flow와 Web PACS를 통해 진단 영상과 판독의 흐름을 연결합니다.'],
pricing:['가격 안내','요금 안내는 추후 제공됩니다.'],
login:['로그인','서비스 접속은 추후 제공됩니다.'],
company:['JPI Healthcare','이미징 솔루션 전문 기업, 제이피아이헬스케어입니다. 문의: 02-2108-2580'],
terms:['Terms of Service','이용약관은 추후 제공됩니다.'],privacy:['Privacy Policy','개인정보 처리방침은 추후 제공됩니다.'],refund:['Refund Policy','환불 정책은 추후 제공됩니다.']};
const dialog=document.querySelector('.service-dialog');let trigger;
document.querySelectorAll('[data-info]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.info==='pricing'&&window.openServicePricing){window.openServicePricing(b);return}if(['telemedicine','services'].includes(b.dataset.info)){if(window.openServiceOverlay){window.openServiceOverlay('telemedicine',b)}else{location.href='telemedicine'}return}if(b.dataset.info==='pacs'&&window.openServiceOverlay){window.openServiceOverlay('pacs',b);return}trigger=b;const [title,copy]=info[b.dataset.info];document.querySelector('#service-dialog-title').textContent=title;document.querySelector('#service-dialog-copy').textContent=copy;dialog.showModal()}));
const close=()=>{dialog.close();trigger?.focus()};
document.querySelector('.service-close').addEventListener('click',close);document.querySelector('.dialog-confirm').addEventListener('click',close);
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}});


(() => {
 const root=document.documentElement;
 let started=false;
 function revealIntro(){
  if(started)return;started=true;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sequence=[
   ...document.querySelectorAll('[data-intro="header"]'),
   ...document.querySelectorAll('[data-intro="tag"]'),
   ...document.querySelectorAll('[data-intro="title"]'),
   ...document.querySelectorAll('[data-intro="copy"]'),
   ...document.querySelectorAll('[data-intro="cta"]'),
   ...document.querySelectorAll('[data-intro="experience"]'),
   ...document.querySelectorAll('[data-intro="card"]')
  ];
  const delays=[0,80,160,260,360,500,620,720,880,1060,1200];
  const animations=sequence.map((element,i)=>element.animate([
   {opacity:0,transform:reduced?'none':'translate3d(-24px,8px,0)'},
   {opacity:1,transform:'translate3d(0,0,0)'}
  ],{duration:reduced?350:1000,delay:reduced?i*35:delays[i],easing:'cubic-bezier(.16,1,.3,1)',fill:'both'}));
  root.classList.remove('intro-pending');
  Promise.allSettled(animations.map(a=>a.finished)).then(()=>animations.forEach(a=>a.cancel()));
 }
 document.addEventListener('examvue-loader-complete',revealIntro,{once:true});
 if(!document.querySelector('.page-loader'))revealIntro();
 // A failed optional loader must never hide the main content.
 setTimeout(()=>{if(!started)revealIntro()},15000);
})();

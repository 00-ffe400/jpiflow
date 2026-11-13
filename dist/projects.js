const projects={
  medical:{
    domain:'MEDICAL SOFTWARE / PRODUCT DESIGN',title:'의료기기 SW & Design System',
    intro:'의료·산업용 소프트웨어와 장비용 터치 인터페이스의 UI·UX를 설계합니다. 기획부터 디자인, 개발 협업까지 제품 디자인 전 과정에 참여하며, 사내 의료 SW의 일관성을 위한 디자인 시스템을 구축·운영하고 있습니다.',
    meta:[['COMPANY','제이피아이 헬스케어'],['PERIOD','2024.03 — 현재'],['ROLE','프로덕트 디자이너 · R&D센터 AI팀 책임연구원']],
    work:['VETBOT AI Software UI·UX 설계','DeteCT·DREDuo 장비용 터치 패널 인터페이스 설계','3D Viewer 인터페이스 설계','사내 의료 SW 통합을 위한 Design System 구축·운영','기획·개발 조직과의 협업 및 UI 구현'],images:[],original:false
  },
  tada:{
    domain:'MOBILITY / MOBILE EXPERIENCE',title:'TADA — Rider App Renewal',
    intro:'라이더 앱 메인 화면의 디자인 리뉴얼을 진행했습니다. 이지식스에서 라이더와 드라이버의 서비스 흐름, 지도 정보, 고객지원 경험을 다루고 디자인 시스템 UI 자산을 구축·관리했습니다.',
    meta:[['COMPANY','이지식스 (easi6)'],['PERIOD','라이더 앱 리뉴얼 · 2023.03 — 2023.10'],['ROLE','UI 디자인 · 사용자 흐름 · Design System']],
    work:['라이더 앱 메인 화면 디자인 리뉴얼','디자인 시스템 UI 자산 추가 및 구축·관리','함께 담당한 영역: Driver My Destination, Map POI, TADA Help Center'],
    images:[['assets/tada-cover.webp','Rider App Renewal 프로젝트 개요'],['assets/tada-screens.webp','메인 화면 리뉴얼 디자인'],['assets/tada-final.webp','최종 모바일 경험']],original:true
  },
  map:{
    domain:'MENTAL HEALTHCARE / REBRANDING',title:'MAP — 내 손안의 심리상담사',
    intro:'국가트라우마센터 마음프로그램 앱의 리브랜딩과 리뉴얼을 진행했습니다. 서비스의 방향을 시각 언어와 화면 구조로 연결하며, 앱 리뉴얼 기획부터 UX 기획과 UI 제작을 담당했습니다.',
    meta:[['PROJECT','국가트라우마센터 마음프로그램'],['PERIOD','2022.01 — 2022.07'],['ROLE','리브랜딩 · 앱 리뉴얼 기획 · UX/UI']],
    work:['마음프로그램 앱 리브랜딩 및 리뉴얼 기획','사용자 흐름과 정보 구조에 기반한 UX 기획','모바일 앱 UI 디자인 및 화면 제작'],
    images:[['assets/map-cover.webp','MAP 리브랜딩과 앱 리뉴얼'],['assets/map-before-after.webp','기존 화면과 리뉴얼 화면 비교'],['assets/map-screens.webp','마음프로그램 앱의 주요 화면']],original:true
  },
  rotem:{
    domain:'IMMERSIVE EXPERIENCE / AR & VR',title:'Hyundai Rotem — AR / VR',
    intro:'현대로템의 VR 홍보·전시 앱과 AR Maintenance 앱의 UX 기획 및 UI 제작을 진행했습니다. 제품을 경험하고 정보를 이해하는 과정을 AR·VR 환경의 인터페이스로 설계했습니다.',
    meta:[['PROJECT','현대로템 AR·VR 콘텐츠'],['PERIOD','2019.08 — 2019.10'],['ROLE','UX 기획 · UI 디자인 · 3D 아이콘 제작']],
    work:['VR 홍보·전시 앱의 UX 기획과 UI 제작','AR Maintenance 앱의 사용자 경험 및 화면 설계','콘텐츠 경험을 위한 3D 아이콘 제작'],
    images:[['assets/hyundai-cover.webp','현대로템 AR·VR 콘텐츠 개요'],['assets/hyundai-ar.webp','AR Maintenance 인터페이스']],original:true
  }
};
const dialog=document.querySelector('#project-dialog');
document.querySelectorAll('[data-project]').forEach(button=>button.addEventListener('click',()=>{
  const project=projects[button.dataset.project];
  document.querySelector('#case-domain').textContent=project.domain;
  document.querySelector('#case-title').textContent=project.title;
  document.querySelector('#case-intro').textContent=project.intro;
  const meta=document.querySelector('#case-meta');meta.replaceChildren();
  project.meta.forEach(([key,value])=>{const group=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=key;dd.textContent=value;group.append(dt,dd);meta.append(group)});
  const work=document.querySelector('#case-work');work.replaceChildren();
  project.work.forEach(text=>{const li=document.createElement('li');li.textContent=text;work.append(li)});
  const gallery=document.querySelector('#case-gallery');gallery.replaceChildren();
  project.images.forEach(([src,caption])=>{const figure=document.createElement('figure'),img=document.createElement('img'),figcaption=document.createElement('figcaption');img.src=src;img.alt=caption;img.width=1400;img.height=788;img.loading='lazy';figcaption.textContent=caption;figure.append(img,figcaption);gallery.append(figure)});
  document.querySelector('#case-original').hidden=!project.original;
  dialog.showModal();dialog.scrollTop=0;document.body.classList.add('dialog-open');
}));
dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>document.body.classList.remove('dialog-open'));
dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()});
document.querySelector('#copy-email').addEventListener('click',async()=>{
  const status=document.querySelector('#copy-status');
  try{await navigator.clipboard.writeText('ffe400@kakao.com');status.textContent='이메일 주소를 복사했습니다.'}
  catch{status.textContent='ffe400@kakao.com 주소를 선택해 복사해주세요.'}
});

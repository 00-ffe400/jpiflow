(() => {
 const overlay=document.querySelector('.page-loader');
 if(!overlay)return;
 const root=document.documentElement;
 const percent=overlay.querySelector('.loader-percent'),fill=overlay.querySelector('.loader-fill');
 const content=[document.querySelector('main'),document.querySelector('.exam-footer')].filter(Boolean);
 const done=new Set();let progress=0,finished=false,visible=false;
 // Fast cached loads and restored pages do not need a loading screen.
 const showTimer=setTimeout(()=>{
  if(finished)return;visible=true;overlay.classList.add('is-active');root.classList.add('is-loading');content.forEach(e=>e.inert=true);
 },180);
 function milestone(name,weight){
  if(finished||done.has(name))return;done.add(name);progress+=weight;
  percent.value=progress+'%';overlay.setAttribute('aria-valuenow',String(progress));fill.style.setProperty('--fill',progress+'%');
  if(progress>=100)finish();
 }
 let observer;
 const fallback=setTimeout(finish,10000);
 async function finish(){
  if(finished)return;finished=true;clearTimeout(showTimer);clearTimeout(fallback);observer?.disconnect();
  root.classList.remove('is-loading');content.forEach(e=>e.inert=false);
  document.dispatchEvent(new Event('examvue-loader-complete'));
  if(visible){
   const fade=overlay.animate([{opacity:1},{opacity:0}],{duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:450,easing:'ease-out',fill:'forwards'});
   await fade.finished.catch(()=>{});
  }
  overlay.remove();
 }
 const logo=new Image();logo.src='assets/examvue-header-logo.svg';
 logo.decode().catch(()=>{}).then(()=>milestone('logo',10));
 (document.fonts?.ready||Promise.resolve()).then(()=>milestone('fonts',20));
 if(document.readyState==='complete')milestone('document',20);
 else window.addEventListener('load',()=>milestone('document',20),{once:true});
 const scene=document.querySelector('#scene');
 function sceneReady(){if(!scene||scene.classList.contains('loaded')||document.body.classList.contains('webgl-unavailable'))milestone('scene',50)}
 observer=new MutationObserver(sceneReady);
 if(scene)observer.observe(scene,{attributes:true,attributeFilter:['class']});
 observer.observe(document.body,{attributes:true,attributeFilter:['class']});sceneReady();
 window.addEventListener('pageshow',e=>{if(e.persisted)finish()});
})();

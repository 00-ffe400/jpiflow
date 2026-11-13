(() => {
 document.body.classList.add('motion-ready');
 const embedded=document.documentElement.classList.contains('service-embedded');
 // Animate content items, never their enclosing sections as a single block.
 document.querySelectorAll('[data-reveal]').forEach(e=>{e.removeAttribute('data-reveal');e.classList.remove('in-view')});
 // Split explicit heading lines while preserving inline emphasis and semantics.
 document.querySelectorAll('main h1,main h2,main h3').forEach(heading=>{
  if(heading.closest('.manifesto')||!heading.querySelector(':scope > br:not(.mobile-break)'))return;
  const nodes=[...heading.childNodes];heading.replaceChildren();
  let line=document.createElement('span');line.className='motion-line';heading.append(line);
  nodes.forEach(node=>{if(node.nodeName==='BR'){heading.append(document.createTextNode(' '));line=document.createElement('span');line.className='motion-line';heading.append(line)}else line.append(node)});
 });
 const selector='.hero-foot>span,.hero-surface .eyebrow,.hero-surface h1,.hero-surface p,.hero-product,.motion-line,.recommend-section>.eyebrow,.recommend-section article,.section-head .eyebrow,.section-head h2,.section-head p,.benefit-card,.device-section>div:first-child>.eyebrow,.device-section h2,.device-section p,.device-collage img,.flow-editorial-top .eyebrow,.flow-editorial-top h2,.flow-editorial-top p,.flow-blue-note,.flow-open-steps article,.bridge-card,.center-head .eyebrow,.center-head h2,.faq-list details,.pr-head .eyebrow,.pr-head>p,.pr-rates,.pr-calc,.pr-guide li,.pricing-head .eyebrow,.pricing-head p,.pricing-note,.price-block-head,.rate-card,.charge-card,.calc-box,.guide-grid article,.pacs-chips,.pacs-callouts li,.pacs-specs,.pacs-diagram,.pacs-tool-card,.pacs-dark-card,.pacs-light-card,.pacs-monitors,.pacs-protocol-table,.pacs-manifesto>.eyebrow,.pacs-side-head .eyebrow,.pacs-manifesto>p,.pacs-ops>.eyebrow,.pacs-ops-title,.pacs-adjust .section-head p,.pacs-protocol-head p,.tele-contact .eyebrow,.tele-contact h2,.tele-contact>a';
 const matched=[...document.querySelectorAll(selector)].filter(e=>!e.closest('.manifesto')&&!(e.matches('h1,h2,h3')&&e.querySelector('.motion-line')));
 const items=matched.filter(e=>!matched.some(o=>o!==e&&o.contains(e)));
 // Reading order = document order inside each section (left column before right, rows top to bottom).
 const groupOf=e=>e.closest('section,header')||document.body;
 const groups=new Map();items.forEach(e=>{const g=groupOf(e);if(!groups.has(g))groups.set(g,[]);groups.get(g).push(e)});
 const order=new Map(items.map((e,i)=>[e,i]));
 function sameRow(a,b){const r=a.getBoundingClientRect(),q=b.getBoundingClientRect();return Math.min(r.bottom,q.bottom)-Math.max(r.top,q.top)>Math.min(r.height,q.height)*.5}
 // Revealing an item also reveals everything before it in its section and its row mates, in order.
 const lastRevealAt=new Map();
 function revealBatch(triggers){
  const batch=new Set();
  triggers.forEach(x=>{const g=groups.get(groupOf(x));let last=g.indexOf(x);g.forEach((e,i)=>{if(i>last&&sameRow(e,x))last=i});g.slice(0,last+1).forEach(e=>{if(!e.classList.contains('in-view'))batch.add(e)})});
  const now=performance.now(),list=[...batch].sort((a,b)=>order.get(a)-order.get(b)),count=new Map();
  list.forEach(e=>{const g=groupOf(e);count.set(g,(count.get(g)||0)+1)});
  // Sequence per section; long batches tighten the step so the whole set lands within about a second.
  list.forEach(e=>{const g=groupOf(e),step=Math.max(50,Math.min(110,900/count.get(g))),at=Math.max(now,(lastRevealAt.get(g)??-1e9)+step);lastRevealAt.set(g,at);e.style.setProperty('--reveal-delay',Math.round(at-now)+'ms');e.classList.add('in-view');observer?.unobserve(e)});
 }
 document.querySelector('#about-service')?.classList.add('scroll-reading');
 items.forEach(e=>e.setAttribute('data-reveal',''));
 // Keep background motion independent of the staggered foreground items.
 const surfaces=[...document.querySelectorAll('main *')].filter(e=>{
  // Cards already reveal as one piece with their background and contents.
  if(e.closest('[data-reveal]')||e.matches('img,svg,svg *,canvas,video,.read-line,.read-line-mask'))return false;
  const style=getComputedStyle(e);
  if(style.backgroundClip==='text'||style.webkitBackgroundClip==='text')return false;
  return style.backgroundImage!=='none'||!['transparent','rgba(0, 0, 0, 0)'].includes(style.backgroundColor);
 });
 surfaces.forEach(e=>{e.style.setProperty('--surface-background',getComputedStyle(e).background);e.classList.add('scroll-surface')});
 let surfaceObserver;
 function observeSurfaces(){
  surfaceObserver?.disconnect();
  surfaceObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(started&&entry.isIntersecting){entry.target.classList.add('surface-visible');surfaceObserver.unobserve(entry.target)}
  }),{threshold:0,rootMargin:`0px 0px -${Math.round(innerHeight*.4)}px 0px`});
  surfaces.forEach(e=>surfaceObserver.observe(e));
 }
 let observer,started=false,revealCycle=0;
 let endFrame=0;
 function revealPageEnd(){
  endFrame=0;if(!started)return;
  const remaining=Math.max(0,document.documentElement.scrollHeight-innerHeight-scrollY);
  // At the end of the document, the last items cannot reach the center line.
  if(remaining>innerHeight*.4)return;
  const boundary=innerHeight-Math.min(innerHeight*.4,remaining);
  const reached=e=>{const r=e.getBoundingClientRect();return r.top<boundary&&r.bottom>0};
  surfaces.filter(e=>!e.classList.contains('surface-visible')&&reached(e)).forEach(e=>{e.classList.add('surface-visible');surfaceObserver?.unobserve(e)});
  revealBatch(items.filter(e=>!e.classList.contains('in-view')&&reached(e)));
 }
 function requestPageEnd(){if(!endFrame)endFrame=requestAnimationFrame(revealPageEnd)}
 addEventListener('scroll',requestPageEnd,{passive:true});
 addEventListener('resize',requestPageEnd,{passive:true});
 function prepare(){
  started=false;revealCycle++;observer?.disconnect();surfaceObserver?.disconnect();
  surfaces.forEach(e=>e.classList.remove('surface-visible'));
  items.forEach(e=>{e.classList.remove('in-view');e.style.removeProperty('--reveal-delay')});lastRevealAt.clear();
  reading?.classList.remove('reading-entered');
  readingIntro.disconnect();
  if(reading)readingIntro.observe(reading.querySelector('h2'));
  scrollTo({top:0,behavior:'instant'});requestReading();
 }
 function start(){
  if(started)return;
  started=true;
  const cycle=revealCycle;
  observeSurfaces();
  requestPageEnd();
  observer?.disconnect();
  observer=new IntersectionObserver(entries=>{
   if(!started||cycle!==revealCycle)return;
   revealBatch(entries.filter(e=>e.isIntersecting&&!e.target.classList.contains('in-view')).map(e=>e.target));
  },{threshold:0,rootMargin:`0px 0px -${Math.round(innerHeight*.4)}px 0px`});
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(started&&cycle===revealCycle)items.forEach(e=>observer.observe(e))}));
 }
 if(embedded){
  window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent)return;if(e.data?.type==='service-overlay-prepare'){prepare();return}if(e.data?.type==='service-overlay-enter'){start();if(Number.isFinite(e.data.scrollTop))requestAnimationFrame(()=>{scrollTo({top:e.data.scrollTop,behavior:'instant'});requestReading()})}});
  parent.postMessage({type:'service-content-ready'},location.origin);
 }else start();
 // Use the iframe's own viewport/scroll so pinning remains inside the overlay.
 const reading=document.querySelector('#about-service'),lines=[...document.querySelectorAll('.read-line')];
 const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
 // Each clipped line enters independently, then retains scroll-linked coloring.
 lines.forEach((line,i)=>{
  const mask=document.createElement('span');mask.className='read-line-mask';
  line.before(mask);mask.append(line);line.style.setProperty('--line-delay',(i%2)*125+'ms');
 });
 const readingIntro=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(entry.isIntersecting){reading.classList.add('reading-entered');readingIntro.disconnect()}
 }),{threshold:0,rootMargin:`0px 0px -${Math.round(innerHeight*.4)}px 0px`});
 if(reading)readingIntro.observe(reading.querySelector('h2'));

 let readingFrame=0;
 const clamp=n=>Math.max(0,Math.min(1,n));
 function updateReading(){
  readingFrame=0;if(!reading)return;
  const rect=reading.getBoundingClientRect(),view=innerHeight;
  const progress=reduceMotion.matches?1:clamp(-rect.top/Math.max(1,rect.height-view));
  const firstOut=clamp((progress-.38)/.16),secondIn=clamp((progress-.52)/.16);
  reading.style.setProperty('--first-opacity',1-firstOut);
  reading.style.setProperty('--first-y',(-26*firstOut)+'px');
  reading.style.setProperty('--second-opacity',secondIn);
  reading.style.setProperty('--second-y',((1-secondIn)*30)+'px');
  lines.forEach((line,i)=>{
   const fill=reduceMotion.matches?1:(i<2?clamp((progress-.025)*7.2-i):clamp((progress-.63)*6.1-(i-2)));
   line.style.setProperty('--read-fill',fill*100+'%');
  });
  reading.style.setProperty('--description-opacity','1');
  reading.style.setProperty('--description-y','0px');

 }
 function requestReading(){if(!readingFrame)readingFrame=requestAnimationFrame(updateReading)}
 addEventListener('scroll',requestReading,{passive:true});
 addEventListener('resize',requestReading,{passive:true});
 reduceMotion.addEventListener('change',requestReading);
 document.fonts?.ready.then(requestReading);
 updateReading();
 const questions=[...document.querySelectorAll('.faq-list details')];
 questions.forEach(item=>item.addEventListener('toggle',()=>{if(item.open)questions.forEach(other=>{if(other!==item)other.open=false})}));
 if(document.documentElement.classList.contains('service-embedded')){
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();parent.postMessage({type:'close-service-overlay'},location.origin)}});
 }
 clearTimeout(window.serviceMotionBootTimer);
 // Commit hidden reveal styles before making the hero paintable.
 requestAnimationFrame(()=>requestAnimationFrame(()=>document.documentElement.classList.remove('service-motion-boot')));
})();

(() => {
 const top=document.querySelector('.back-to-top'); if(!top)return;
 const sync=()=>top.classList.toggle('is-visible',scrollY>500);
 addEventListener('scroll',sync,{passive:true}); sync();
 top.addEventListener('click',e=>{e.preventDefault();scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})});
})();

(() => {
 // Single-pair statements: lines slide in, then fill left to right while the block passes (no pinning).
 const blocks=[...document.querySelectorAll('.fill-reading')]; if(!blocks.length)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const clamp=n=>Math.max(0,Math.min(1,n));
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('reading-entered');io.unobserve(e.target)}}),{threshold:0,rootMargin:'0px 0px -12% 0px'});
 blocks.forEach(b=>io.observe(b));
 let frame=0;
 function update(){frame=0;const vh=innerHeight;blocks.forEach(b=>{const h=b.querySelector('h2');if(!h)return;const top=h.getBoundingClientRect().top;
  const p=reduce.matches?1:clamp((vh*.8-top)/(vh*.42));const ls=[...b.querySelectorAll('.read-line')];
  ls.forEach((l,i)=>{const f=clamp(p*ls.length-i);l.style.setProperty('--read-fill',(f*100).toFixed(1)+'%');l.classList.toggle('is-filled',f>=.995)})})}
 const req=()=>{if(!frame)frame=requestAnimationFrame(update)};
 addEventListener('scroll',req,{passive:true});addEventListener('resize',req,{passive:true});reduce.addEventListener('change',req);update();
})();

(() => {
 // In the service overlay, cross-links switch tabs instead of navigating the iframe.
 if(!document.documentElement.classList.contains('service-embedded'))return;
 document.addEventListener('click',e=>{const a=e.target.closest('[data-service-tab-link]');if(!a)return;e.preventDefault();parent.postMessage({type:'open-service-tab',name:a.dataset.serviceTabLink},location.origin)});
})();

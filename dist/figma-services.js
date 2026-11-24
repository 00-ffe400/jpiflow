(() => {
 const main=document.querySelector('.figma-design');if(!main)return;
 document.documentElement.classList.remove('service-motion-boot');clearTimeout(window.serviceMotionBootTimer);
 const q=(name)=>main.querySelector(`[data-name="${name}"]`);
 // Keep high-detail illustrations proportional; resize the graphic, never stretch its pixels.
 const graphicNodes=main.classList.contains('figma-tele')?['1645:6118','1648:29144']:['1765:29161','1765:29437'];
 const graphics=[];
 for(const id of graphicNodes){
   let el=main.querySelector(`[data-node-id="${id}"]`);if(!el)continue;
   const width=({'1645:6118':1366,'1648:29144':871.897,'1765:29161':1380,'1765:29437':1460})[id];const parent=el.parentElement;
   const wrap=document.createElement('div');wrap.className='fd-graphic-wrap';wrap.style.cssText='width:100%;min-width:0;position:relative;display:flex;justify-content:center;overflow:visible';
   parent.insertBefore(wrap,el);wrap.append(el);el.style.flexShrink='0';
   graphics.push({el,wrap,width});
 }
 function sizeGraphics(){for(const {el,wrap,width} of graphics){const available=wrap.clientWidth;const scale=Math.min(1,available/width);el.style.zoom=scale;el.style.maxWidth='none';el.style.width=width+'px';}}
 const resize=new ResizeObserver(sizeGraphics);graphics.forEach(({wrap})=>resize.observe(wrap));sizeGraphics();
 // Real currency controls, using the same reference conversion as the previous page.
 const pricing=document.querySelector('#pricing');
 if(pricing){
   const amounts=[];
   pricing.querySelectorAll('p,span').forEach(el=>{if(el.children.length)return;const text=el.textContent.trim();const m=text.match(/₩[\d,]+|[\d,]+원/);if(m)amounts.push({el,krw:Number(m[0].replace(/[^\d]/g,'')),won:m[0].endsWith('원'),prefix:text.slice(0,m.index),suffix:text.slice(m.index+m[0].length)});});
   pricing.querySelectorAll('[data-currency]').forEach(button=>button.addEventListener('click',()=>{
      const usd=button.dataset.currency==='USD';pricing.querySelectorAll('[data-currency]').forEach(b=>b.setAttribute('aria-pressed',b===button));
      amounts.forEach(({el,krw,won,prefix,suffix})=>{const amount=usd?'$'+(krw/1400).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}):won?krw.toLocaleString('ko-KR')+'원':'₩'+krw.toLocaleString('ko-KR');el.textContent=prefix+amount+suffix});
   }));
 }
 // Match the Figma layout with whole-card and whole-section entrances on each service visit.
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!reduced){main.querySelectorAll('[data-name^="Benefits / 01 /"]').forEach(card=>{
   const art=card.querySelector('[data-name^="Generated 3D"] img');if(!art)return;
   card.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;art.style.transform=`perspective(700px) rotateX(${-y*8}deg) rotateY(${x*10}deg)`});
   card.addEventListener('pointerleave',()=>{art.style.transform='none'});
 });}
 const reveal=[];
 for(const section of main.children){
   const name=section.dataset.name||'';
   if(name.includes('Benefits')){
     const head=section.querySelector('[data-name="Section heading"]');if(head)reveal.push(head);
     section.querySelectorAll('[data-name^="Benefits / 01 /"]').forEach(el=>reveal.push(el));
   }else if(name.includes('About')||name.includes('Platform overview')){
     const statement=section.querySelector('[data-name="02 / About — Center statement"]')||section;
     statement.querySelectorAll('[data-name="Text"],h2,[data-name="Paragraph"]').forEach(el=>{if(section.classList.contains('fd-story')&&el.matches('h2,[data-name="Paragraph"]'))return;if(el.dataset.name==='Paragraph')el.classList.add('fd-about-copy');reveal.push(el)});
     const architecture=section.querySelector('[data-name="Specs + Architecture"]');if(architecture)reveal.push(architecture);
   }else if(section===main.firstElementChild){
     const surface=section.children[1];if(surface)reveal.push(...[...surface.children].filter(e=>!e.classList.contains('fd-graphic-wrap')));const graphic=section.querySelector('.fd-graphic-wrap');if(graphic)reveal.push(graphic);
   }else reveal.push(section);
 }
 let observer;
 function enter(){
   if(reduced)return;
   observer?.disconnect();main.classList.add('motion-enabled');reveal.forEach(el=>{el.classList.add('fd-reveal');el.classList.remove('is-visible')});
   observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.classList.add('is-visible');observer.unobserve(entry.target)}),{rootMargin:'0px 0px -25% 0px',threshold:0});
   reveal.forEach(el=>observer.observe(el));
   // A page-end safeguard keeps short final sections visible at the scroll limit.
   requestAnimationFrame(()=>reveal.filter(el=>el.getBoundingClientRect().top<innerHeight*.75).forEach((el,i)=>{el.style.setProperty('--reveal-delay',Math.min(i*90,360)+'ms');el.classList.add('is-visible')}));
 }
 addEventListener('scroll',()=>{if(innerHeight+scrollY>=document.documentElement.scrollHeight-12)reveal.forEach(el=>el.classList.add('is-visible'))},{passive:true});
 addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent)return;if(e.data?.type==='service-overlay-enter'){scrollTo(0,Number(e.data.scrollTop)||0);enter()}});
 main.querySelectorAll('[data-service-link]').forEach(a=>a.addEventListener('click',e=>{if(parent!==window&&typeof parent.openServiceOverlay==='function'){e.preventDefault();parent.openServiceOverlay(a.dataset.serviceLink)}}));
 const story=main.querySelector('.fd-story');
 if(story&&!reduced){
   const clamp=n=>Math.max(0,Math.min(1,n));
   const first=story.querySelector('.fd-story-first'),last=story.querySelector('.fd-story-last'),description=story.querySelector('.fd-story-description');
   const firstLines=[...first.querySelectorAll('.fd-story-fill')],lastLines=[...last.querySelectorAll('.fd-story-fill')];
   [...firstLines,...lastLines].forEach(line=>line.style.setProperty('--ink',getComputedStyle(line.parentElement).color));
   let queued=false;
   function readStory(){
     queued=false;const travel=story.offsetHeight-innerHeight,p=clamp(-story.getBoundingClientRect().top/Math.max(1,travel));
     first.style.opacity=1-clamp((p-.36)/.14);first.style.transform=`translateY(${-clamp((p-.36)/.14)*16}px)`;
     last.style.opacity=clamp((p-.44)/.12);last.style.transform=`translateY(${(1-clamp((p-.44)/.12))*16}px)`;
     firstLines.forEach((line,i)=>line.style.setProperty('--fill',clamp((p-(.02+i*.13))/.17)*100+'%'));
     lastLines.forEach((line,i)=>line.style.setProperty('--fill',clamp((p-(.50+i*.16))/.18)*100+'%'));
     description.style.opacity=clamp((p-.88)/.10);description.style.transform=`translateY(${(1-clamp((p-.88)/.10))*12}px)`;
     first.setAttribute('aria-hidden',p>.5?'true':'false');last.setAttribute('aria-hidden',p<.44?'true':'false');
   }
   const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(readStory)}};
   addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);readStory();
 }
 enter();
})();

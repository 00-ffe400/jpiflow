(() => {
 const dialog=document.querySelector('.service-overlay');
 if(!dialog)return;
 const tabs=[...dialog.querySelectorAll('[data-service-tab]')];
 // Each tab owns a panel with a lazily loaded iframe; scroll and reveal state are kept per panel.
 const panels=Object.fromEntries(tabs.map(t=>{const panel=dialog.querySelector('#'+t.getAttribute('aria-controls'));return [t.dataset.serviceTab,{panel,frame:panel?.querySelector('iframe'),scroll:0}]}));
 let current=tabs[0]?.dataset.serviceTab,pendingPricing=false,opener,closing=false,closeTimer,enterTimer,entered=false;
 const active=()=>panels[current];
 function rememberScroll(){const p=active();if(p?.frame?.getAttribute('src')){try{p.scroll=p.frame.contentWindow.scrollY}catch{}}}
 function pricingTop(){try{const w=panels.telemedicine.frame.contentWindow,el=w.document.getElementById('pricing');return el?el.getBoundingClientRect().top+w.scrollY:null}catch{return null}}
 function enterContent(){
  const p=active();if(!p?.frame)return;
  if(pendingPricing&&current==='telemedicine'){const top=pricingTop();if(top!=null){p.scroll=top;pendingPricing=false}}
  if(dialog.open&&entered)p.frame.contentWindow?.postMessage({type:'service-overlay-enter',scrollTop:p.scroll},location.origin);
 }
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 function select(name,focus=false){
  if(name!==current)rememberScroll();
  current=name;
  tabs.forEach(t=>{const selected=t.dataset.serviceTab===name;t.setAttribute('aria-selected',selected);t.tabIndex=selected?0:-1;if(selected&&focus)t.focus()});
  Object.entries(panels).forEach(([k,p])=>{if(p.panel)p.panel.hidden=k!==name});
  const p=active();if(!p?.frame)return;
  p.frame.contentWindow?.postMessage({type:'service-overlay-prepare'},location.origin);
  if(!p.frame.getAttribute('src'))p.frame.src=p.frame.dataset.src;
  else if(dialog.open)enterContent();
 }
 window.openServiceOverlay=(name='telemedicine',trigger)=>{
  clearTimeout(closeTimer);clearTimeout(enterTimer);entered=false;closing=false;Object.values(panels).forEach(p=>p.scroll=0);opener=trigger||document.activeElement;select(name);
  if(!dialog.open)dialog.showModal();
  document.documentElement.classList.add('service-overlay-open');
  requestAnimationFrame(()=>requestAnimationFrame(()=>dialog.classList.add('is-visible')));
  enterTimer=setTimeout(()=>{entered=true;enterContent()},reduced()?0:680);
  dialog.querySelector('.service-overlay-close').focus({preventScroll:true});
 };
 // Pricing lives on the Telemedicine page.
 window.openServicePricing=trigger=>{
  const ready=dialog.open&&entered&&current==='telemedicine'&&pricingTop()!=null;
  if(ready){panels.telemedicine.frame.contentWindow.scrollTo({top:pricingTop(),behavior:reduced()?'auto':'smooth'});return}
  pendingPricing=true;
  if(dialog.open)select('telemedicine');else window.openServiceOverlay('telemedicine',trigger);
 };
 dialog.querySelector('.service-pricing-button')?.addEventListener('click',e=>window.openServicePricing(e.currentTarget));
 function close(){
  if(closing||!dialog.open)return;rememberScroll();clearTimeout(enterTimer);entered=false;closing=true;dialog.classList.remove('is-visible');
  closeTimer=setTimeout(()=>{dialog.close();closing=false;document.documentElement.classList.remove('service-overlay-open');opener?.focus({preventScroll:true})},reduced()?0:430);
 }
 dialog.addEventListener('cancel',e=>{e.preventDefault();close()});
 dialog.querySelector('.service-overlay-close').addEventListener('click',close);
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientY<r.top)close()}});
 tabs.forEach((t,i)=>{t.addEventListener('click',()=>select(t.dataset.serviceTab));t.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;select(tabs[next].dataset.serviceTab,true)}})});
 Object.entries(panels).forEach(([k,p])=>p.frame?.addEventListener('load',()=>{const l=p.panel.querySelector('.service-frame-loading');if(l)l.hidden=true;if(k===current)enterContent()}));
 window.addEventListener('message',e=>{
  if(e.origin!==location.origin)return;
  const entry=Object.entries(panels).find(([,p])=>p.frame&&e.source===p.frame.contentWindow);if(!entry)return;
  if(e.data?.type==='close-service-overlay')close();
  if(e.data?.type==='open-service-tab'&&panels[e.data.name]&&e.data.name!==current){panels[e.data.name].scroll=0;select(e.data.name,true)}
  if(e.data?.type==='service-content-ready'&&entry[0]===current)enterContent();
 });
})();

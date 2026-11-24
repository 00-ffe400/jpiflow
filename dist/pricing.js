(() => {
 const section=document.querySelector('#pricing');
 if(!section)return;
 // USD는 참고용 환산 금액입니다. 환율 또는 USD 요금이 정해지면 이 값을 바꿔 주세요.
 const KRW_PER_USD=1400, RATE=0.025;
 let currency='KRW';
 const fmt=(krw,unit)=>{
  if(currency==='USD'){const v=krw/KRW_PER_USD;return '$'+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}
  return unit==='won'?krw.toLocaleString('ko-KR')+'원':'₩'+krw.toLocaleString('ko-KR');
 };
 const opts=[...section.querySelectorAll('.pr-seg [data-amount]')];
 function render(){
  section.querySelectorAll('[data-krw]').forEach(el=>{el.textContent=fmt(+el.dataset.krw)});
  const sel=opts.find(o=>o.getAttribute('aria-checked')==='true')||opts[0];
  if(sel){const a=+sel.dataset.amount,b=Math.round(a*RATE);
   section.querySelector('.calc-amount').textContent=fmt(a,'won');
   section.querySelector('.calc-bonus').textContent='+ '+fmt(b,'won');
   section.querySelector('.calc-total').textContent=fmt(a+b,'won');
   section.querySelectorAll('.calc-rate').forEach(e=>e.textContent=+(RATE*100).toFixed(2)+'%');
  }

 }
 section.querySelectorAll('[data-currency]').forEach(b=>b.addEventListener('click',()=>{currency=b.dataset.currency;section.querySelectorAll('[data-currency]').forEach(x=>x.setAttribute('aria-pressed',x===b));render()}));
 function choose(o,focus){opts.forEach(x=>{const on=x===o;x.setAttribute('aria-checked',on);x.tabIndex=on?0:-1});if(focus)o.focus();render()}
 opts.forEach((o,i)=>{
  o.addEventListener('click',()=>choose(o));
  o.addEventListener('keydown',e=>{const d={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key];if(d){e.preventDefault();choose(opts[(i+d+opts.length)%opts.length],true)}});
 });
 render();
})();

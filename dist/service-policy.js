(() => {
 const guide=`<div class="flow-policy-heading"><span class="flow-policy-info" aria-hidden="true">i</span><h2 id="flow-pricing-title">가격 계산 방법</h2></div>
 <ol class="flow-pricing-rules"><li>모달리티 요금 × 수량</li><li>상황별 할증 적용 — 응급 판독 ×1.5</li><li>계약 배수 적용 — 기관별로 다르며 금액은 표시하지 않습니다</li><li>통화 최소 단위로 반올림</li></ol>
 <div class="flow-pricing-example"><h3>계산 예시 (CT 1부위, 응급 판독)</h3><div class="flow-example-comparison"><div><span>일반 판독</span><strong>₩150,000</strong></div><span class="flow-example-arrow" aria-hidden="true">→</span><div><span>응급 판독 ×1.5</span><strong>₩225,000</strong></div></div></div>
 <p class="flow-pricing-footnote">* 할증은 판독 신청 시 선택한 조건에 따라 자동으로 적용됩니다.</p>`;
 const refund=`<div class="flow-policy-heading"><h2 id="flow-refund-title">ExamVue 365 Flow 취소 및 환불 규정 안내</h2></div>
 <div class="flow-refund-copy"><p>제이피아이헬스케어㈜(이하 "회사")는 ExamVue 365 Flow 원격 판독 서비스에 대해 다음과 같은 취소 및 환불 규정을 제공합니다. 판독을 신청하기 전 반드시 확인해 주시기 바랍니다.</p>
 <section><h3>제1조 (적용 범위)</h3><p>본 규정은 ExamVue 365 Flow 플랫폼을 통해 이루어진 모든 판독 신청 건별 결제에 적용됩니다. 결제는 판독 신청 시점에 건당 이루어지며, 미리 구매해 두는 선불 상품은 없습니다.</p></section>
 <section><h3>제2조 (자가 취소 가능 기간)</h3><p>판독 담당자가 신청 건을 수락(판독 시작)하기 전까지는 신청자가 직접 취소할 수 있으며, 결제된 금액은 전액 환불됩니다. 판독 담당자가 수락한 이후에는 화면에서 직접 취소할 수 없으며, 취소를 원할 경우 관리자에게 문의해야 합니다.</p></section>
 <section><h3>제3조 (취소 요청 절차)</h3><ol><li>자가 취소 가능 기간 중에는 해당 판독 신청 상세 화면에서 <strong>취소</strong> 버튼을 눌러 즉시 취소하고 환불받을 수 있습니다.</li><li>판독이 시작된 이후에는 관리자에게 문의하여 취소를 요청합니다. 관리자 검토 후 처리 결과를 안내받으실 수 있습니다.</li></ol></section>
 <section><h3>제4조 (환불 처리)</h3><ul><li>자가 취소로 인한 환불은 결제 대행사(Toss)를 통해 승인 취소 처리되며, 결제 수단 및 금융기관에 따라 반영 시점이 달라질 수 있습니다.</li><li>관리자 승인을 거친 취소의 환불 처리 기간과 절차는 자가 취소와 동일합니다.</li></ul></section>
 <section><h3>제5조 (환불 불가 사유)</h3><p>다음의 경우에는 자가 취소 및 즉시 환불이 제공되지 않으며, 관리자 문의를 통해서만 취소를 요청할 수 있습니다:</p><ul><li>판독 담당자가 이미 판독을 시작한 건</li><li>판독 보고서가 이미 작성 완료된 건</li></ul></section>
 <section><h3>제6조 (외부 처리 기관 기준)</h3><p>결제 승인 및 취소 가능 여부는 결제 대행사(Toss Payments)의 처리 결과를 최종 기준으로 합니다. 회사는 관련 법령에 따라 환불 요청에 대한 최종 결정 권한을 보유합니다.</p></section>
 <section><h3>제7조 (문의 안내)</h3><p>취소 및 환불에 대한 문의 사항은 아래 고객센터로 연락 주시기 바랍니다:</p><ul><li><strong>이메일</strong>: <a href="mailto:support@jpi.co.kr">support@jpi.co.kr</a></li><li><strong>전화</strong>: <a href="tel:+82221082580">+82-2-2108-2580</a></li><li><strong>운영 시간</strong>: 월~금, 09:00~18:00 (KST)</li></ul></section>
 <p class="flow-policy-effective">본 규정은 2026년 1월 18일부터 시행되며, 수시로 변경될 수 있습니다. 변경 사항은 ExamVue 365 Flow 웹사이트에 게시됩니다.</p></div>`;
 const dialogs={};let opener;
 function create(name,markup){
   const dialog=document.createElement('dialog');dialog.className='flow-policy-dialog flow-policy-'+name;dialog.setAttribute('aria-labelledby',name==='pricing'?'flow-pricing-title':'flow-refund-title');
   dialog.innerHTML=`<button type="button" class="flow-policy-close" aria-label="닫기">×</button><div class="flow-policy-content">${markup}</div>`;
   document.body.append(dialog);
   const close=()=>dialog.close();dialog.querySelector('.flow-policy-close').addEventListener('click',close);
   dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}});
   dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));return dialog;
 }
 document.addEventListener('click',e=>{
   const target=e.target.closest('[data-info]');if(!target)return;
   const name=target.dataset.info==='refund'?'refund':target.dataset.info==='pricing'&&target.closest('#pricing')?'pricing':null;
   if(!name)return;e.preventDefault();e.stopImmediatePropagation();opener=target;
   const dialog=dialogs[name]||(dialogs[name]=create(name,name==='pricing'?guide:refund));dialog.showModal();dialog.querySelector('.flow-policy-content').scrollTop=0;
 },true);
})();

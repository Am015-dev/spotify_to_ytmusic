// ---- v87c: SMASH!/hit pop-ups never cover the tutorial card (move above it, or below when there is no room)
(()=>{const PAD=8,fit=el=>{try{el.style.removeProperty('top');if(!el.classList.contains('on'))return;const t=document.getElementById('roamTut');if(!t||t.hidden||!t.getClientRects().length)return;
  const T=t.getBoundingClientRect(),h=el.offsetHeight,w=el.offsetWidth,ju=el.id==='juPop',pt=el.offsetParent?el.offsetParent.getBoundingClientRect().top:0,cy=pt+el.offsetTop+(ju?0:h/2),hh=h*.63,hw=w*.63,cx=innerWidth/2;
  const hit=c=>c-hh-30<T.bottom+PAD&&c+hh>T.top-PAD&&cx-hw<T.right+PAD&&cx+hw>T.left-PAD;if(!hit(cy))return;
  let c=T.top-PAD-hh;if(c-hh-30<40)c=T.bottom+PAD+hh+30;el.style.setProperty('top',(c-pt-(ju?0:h/2))+'px','important')}catch(e){}};
 const obs=new MutationObserver(R=>{for(const r of R)if(r.target.id==='hitPop'||r.target.id==='juPop')fit(r.target)}),watch=el=>{if(el&&!el.__nit){el.__nit=1;obs.observe(el,{attributes:true,attributeFilter:['class']})}};
 watch(document.getElementById('hitPop'));new MutationObserver(()=>watch(document.getElementById('juPop'))).observe(document.body,{childList:true});watch(document.getElementById('juPop'))})();

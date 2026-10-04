// ---- BA (Athens + touch play-test fixes). Self-contained: CSS only, injected at load. Prefix BA_.
const BA_CSS=`
@media (orientation:portrait){body.touch[data-thr=pedal] #roamGauge{bottom:calc(52px + clamp(50px,16vh,66px) + 2*clamp(48px,15vh,62px) + env(safe-area-inset-bottom,0px))}
 #athDP{display:grid!important;grid-template-columns:1fr 1fr;left:8px!important;right:64px;transform:none!important;bottom:10px!important;gap:5px!important}
 #athDP button{font-size:11px!important;line-height:1.15;padding:5px 6px!important;white-space:normal;text-align:center}}
@media (orientation:portrait){body #roamPark{top:calc(238px + env(safe-area-inset-top,0px));max-width:calc(100vw - 130px);white-space:normal;text-align:center;line-height:1.25}}
@media (max-height:500px){body #roamPark{top:calc(110px + env(safe-area-inset-top,0px))}}
html body.touch #roamPlate{padding-left:34px}
#roamMap .mh{right:64px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:rgba(5,11,24,.82);color:#d8ecf6;padding:3px 8px;border-radius:6px;z-index:2;pointer-events:none}`;
(()=>{const st=document.createElement('style');st.id='baCss';st.textContent=BA_CSS;document.head.appendChild(st)})();
// ITEM button (#tW) is placed above the right-hand button cluster; in landscape that spot is under the AUTO/vehicle button (#roamVeh).
// After M1_tw places it, nudge it down below any top-right HUD button it hits, as long as it stays clear of the touch buttons.
M1_tw=(f=>function(){f();const w=$('#tW');if(!w||w.style.display==='none')return;const vis=e=>e&&e.offsetParent!==null&&!e.hidden&&e.getBoundingClientRect().width>4;
  const hit=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2;
  const tops=['#roamVeh','#roamHorn','#roamExit','#roamMapBtn'].map(s=>$(s)).filter(vis),btns=['#tB','#tD','#tN','#tF','#tG'].map(s=>$(s)).filter(vis).map(e=>e.getBoundingClientRect());
  for(let k=0;k<4;k++){const r=w.getBoundingClientRect(),o=tops.map(e=>e.getBoundingClientRect()).find(q=>hit(q,r));if(!o)return;const t=Math.round(o.bottom+8);
    const nr={left:r.left,right:r.right,top:t,bottom:t+r.height};if(btns.some(q=>hit(q,nr))||nr.bottom>innerHeight)return;w.style.top=t+'px'}})(M1_tw);

// ui-1: HUD governor (≤ 2 objective widgets, none tap-to-close while moving)
{const ORD=['m1Next','roamArrow','npcSay','roamPop','roamPlate','crSmHint'];
 const st=document.createElement('style');st.textContent='.ui1X{display:none!important}body.ui1Mv #rotateHint{display:none!important}';document.head.appendChild(st);
 const vis=e=>{if(!e)return false;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0&&!(e.getAnimations&&e.getAnimations().length))return false;const r=e.getBoundingClientRect();return r.width>=2&&r.height>=2&&r.right>0&&r.left<innerWidth&&r.bottom>0&&r.top<innerHeight};
 let mo=null,els=null;
 const gov=()=>{try{if(typeof state==='undefined'||state!=='roam'||typeof RO==='undefined'){document.body.classList.remove('ui1Mv');return}
  if(!els){els=ORD.map(i=>document.getElementById(i)).filter(Boolean);if(!els.length){els=null;return}mo=new MutationObserver(gov);for(const e of els)mo.observe(e,{attributes:true,attributeFilter:['hidden','style','class']})}
  document.body.classList.toggle('ui1Mv',Math.abs(RO.v)>3);
  for(const e of els)e.classList.remove('ui1X');
  let n=0;for(const e of els)if(vis(e)&&++n>2)e.classList.add('ui1X');
  mo.takeRecords()}catch(e){}};
 setInterval(gov,150);
}
// ui-1: taps since page load (rv2k/onboard)
window.__taps=0;addEventListener('pointerdown',()=>{window.__taps++},true);
// phone-1: phone HUD (12 px text, popups top-right under ⚙, pill inside screen, result panel after the car stops, BOOST by GAS)
{const st=document.createElement('style');st.textContent=`html body.touch :is(#tB,#tN,#tD,#tF,#tG){font-size:15px!important}
html body :is(#feed,#hitPop,#roamCombo,#juPop){position:fixed;left:auto!important;right:calc(8px + env(safe-area-inset-right,0px))!important;transform:none!important;text-align:right;pointer-events:none;z-index:6;max-width:min(230px,56vw);white-space:normal!important}
html body :is(#hitPop,#juPop){top:calc(100px + env(safe-area-inset-top,0px))!important;font-size:18px!important}
html body #hitPop.on{animation:none!important}html body #juPop{top:calc(124px + env(safe-area-inset-top,0px))!important}
html body :is(#roamCombo,#feed){top:calc(152px + env(safe-area-inset-top,0px))!important}
html body :is(.touch,.v85) #roamArrow{max-width:calc(100vw - 150px)!important;white-space:normal!important;overflow:visible!important;text-align:center}
@media (orientation:portrait){html body :is(.touch,.v85) #roamArrow{left:112px!important;right:56px!important;transform:none!important;max-width:none!important;justify-content:center}
}
body.phHold #spRes{visibility:hidden;pointer-events:none}`;document.head.appendChild(st);
 let t0=0;setInterval(()=>{try{const r=document.getElementById('spRes');if(!r||r.hidden){t0=0;document.body.classList.remove('phHold');return}
  if(!t0)t0=performance.now();document.body.classList.toggle('phHold',typeof RO!=='undefined'&&Math.abs(RO.v||0)>1.5&&performance.now()-t0<4000)}catch(e){}},100)}

// ui-1: HUD governor. At most 2 objective/hint widgets at once; no tap-to-close popups while the car is moving.
// Runs from a MutationObserver (microtask: after the game changed a widget, before the frame is painted) + a 150 ms backstop.
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
{const st=document.createElement('style');st.textContent=`
html body.touch #tB,html body.touch #tN,html body.touch #tD,html body.touch #tF,html body.touch #tG{font-size:15px!important;letter-spacing:0}
html body.touch #roamCombo small{font-size:12px}
html body #feed,html body #hitPop,html body #roamCombo{position:fixed;left:auto!important;right:calc(8px + env(safe-area-inset-right,0px))!important;transform:none!important;text-align:right;pointer-events:none;z-index:6;max-width:min(230px,56vw)}
html body #hitPop{top:calc(100px + env(safe-area-inset-top,0px))!important;font-size:18px!important;white-space:normal}
html body #hitPop.on{animation:phIn .25s ease-out forwards!important}
html body #roamCombo{top:calc(150px + env(safe-area-inset-top,0px))!important;grid-template-columns:auto auto;justify-content:end}
html body #roamCombo em{font-size:24px!important}html body #roamCombo b{font-size:18px!important}html body #roamCombo div{width:90px}
html body #feed{top:calc(190px + env(safe-area-inset-top,0px))!important;gap:2px}
html body #feed div{font-size:15px!important;text-shadow:0 1px 3px #000,0 0 8px currentColor}html body #feed div small{font-size:12px!important}
@keyframes phIn{from{opacity:0;translate:0 -6px}to{opacity:1;translate:0 0}}
html body #juPop{left:auto!important;right:calc(8px + env(safe-area-inset-right,0px));top:calc(100px + env(safe-area-inset-top,0px))!important;transform:none!important;font-size:20px!important;text-align:right;max-width:min(230px,56vw);white-space:normal!important;text-shadow:0 1px 3px #000,0 0 8px rgba(0,0,0,.6)!important}html body #juPop small{font-size:12px!important;letter-spacing:.06em}
html body.touch #roamArrow,html body.v85 #roamArrow{max-width:calc(100vw - 150px)!important;white-space:normal!important;overflow:visible!important;line-height:1.15;text-align:center}
@media (orientation:portrait){html body.touch #roamArrow,html body.v85 #roamArrow{left:112px!important;right:56px!important;transform:none!important;max-width:none!important;justify-content:center;width:auto}
 html body.touch[data-thr=pedal] #tN{width:clamp(56px,18vw,70px);height:clamp(56px,18vw,70px)}}
body.phHold #spRes{visibility:hidden;pointer-events:none}
`;document.head.appendChild(st);
 let t0=0;setInterval(()=>{try{const r=document.getElementById('spRes');if(!r||r.hidden){t0=0;document.body.classList.remove('phHold');return}
  if(!t0)t0=performance.now();const mv=typeof RO!=='undefined'&&Math.abs(RO.v||0)>1.5&&performance.now()-t0<4000;document.body.classList.toggle('phHold',mv)}catch(e){}},100);}

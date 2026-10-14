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

// ui-1: HUD governor (≤ 2 objective widgets, none tap-to-close while moving)
{const ORD=['m1Next','roamArrow','npcSay','roamPop','roamPlate','crSmHint'];
 const st=document.createElement('style');st.textContent='.ui1X{display:none!important}body.ui1Mv #rotateHint{display:none!important}';document.head.appendChild(st);
 const vis=e=>{if(!e)return false;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0&&!(e.getAnimations&&e.getAnimations().length))return false;const r=e.getBoundingClientRect();return r.width>=2&&r.height>=2&&r.right>0&&r.left<innerWidth&&r.bottom>0&&r.top<innerHeight};
 let mo=null,els=null;
 const gov=()=>{try{if(typeof state==='undefined'||state!=='roam'||typeof RO==='undefined'){document.body.classList.remove('ui1Mv');return}
  if(!els){els=ORD.map(i=>document.getElementById(i)).filter(Boolean);if(!els.length){els=null;return}mo=new MutationObserver(gov);for(const e of els)mo.observe(e,{attributes:true,attributeFilter:['hidden','style','class']})}
  document.body.classList.toggle('ui1Mv',Math.abs(RO.v)>3);
  for(const e of els)e.classList.remove('ui1X');
  HUDSTACK_layout();
  let n=0;for(const e of els)if(vis(e)&&++n>2)e.classList.add('ui1X');
  mo.takeRecords()}catch(e){}};
 setInterval(gov,150);
}
// hudstack-1: ONE left-side HUD stack for the activity prompt (roamPrompt), the objective card (roamPop) and the TAP TAP hint (crSmHint).
// Priority prompt > objective > hint, at most 2 shown, the hint hides while a prompt shows, stacked with a gap in the column right of the minimap.
function HUDSTACK_layout(){const G=id=>document.getElementById(id),S=['roamPrompt','roamPop','crSmHint'].map(G).filter(Boolean);
 for(const e of S)e.classList.remove('ui1X');
 const on=e=>!e.hidden&&(e.id!=='crSmHint'||e.classList.contains('on'))&&getComputedStyle(e).display!=='none',L=S.filter(on);
 const pr=L.some(e=>e.id==='roamPrompt'),sh=[];for(const e of L){if(e.id==='crSmHint'&&pr)e.classList.add('ui1X');else if(sh.length<2)sh.push(e);else e.classList.add('ui1X')}
 if(!sh.length)return sh;
 const R=id=>{const e=G(id);if(!e||e.hidden||getComputedStyle(e).display==='none')return null;const r=e.getBoundingClientRect();return r.width>2&&r.height>2&&r.bottom>0&&r.top<innerHeight?r:null};
 const mm=R('roamMini')||R('map');
 let x=Math.max(14,mm?Math.ceil(mm.right)+8:0),y=60;for(const id of ['m1Next','roamArrow'])y=Math.max(y,Math.ceil((R(id)||{bottom:0}).bottom)+6);
 const w=Math.min(240,Math.max(120,innerWidth-x-72));
 for(const e of sh){const q=(k,v)=>e.style.setProperty(k,v,'important');q('position','fixed');q('left',x+'px');q('top',y+'px');q('right','auto');q('bottom','auto');q('transform','none');q('margin','0');q('width','auto');q('min-width','0');q('max-width',w+'px');y+=Math.ceil(e.getBoundingClientRect().height)+6}
 return sh}
const HUDSTACK_css=document.createElement('style');HUDSTACK_css.textContent='html body #roamPop,html body #roamPop *{font-size:12px!important;line-height:1.25!important}html body #roamPop h5{display:inline;margin:0 6px 0 0}';document.head.appendChild(HUDSTACK_css);
function HUDSTACK_go(say,P,ok){const m=RO.marks.find(q=>q.kind==='quest'||q.kind==='collect')||RO.marks[0];if(m)RV14_near(m,10);CRSM.hn=0;const tick=()=>{RO.pop={k:'smash',name:'SMASH 20',goal:20,lim:25,v:0,t:0,txt(){return '0/20'}};if(m)RO.pmNew=m;RO.pmT=2.5};tick();const iv=setInterval(tick,100);
  setTimeout(()=>{clearInterval(iv);tick();setTimeout(()=>{const sh=HUDSTACK_layout(),R=sh.map(e=>e.getBoundingClientRect()),sm=[...document.querySelectorAll('#roamMini,#map')].map(RV14_vis).filter(Boolean);let ov=0;for(let i=0;i<R.length;i++){for(let j=i+1;j<R.length;j++)ov+=RV14_ovl(R[i],R[j]);for(const c of sm)ov+=RV14_ovl(R[i],c);for(const id of ['tL','tR','tG','tB'])ov+=RV14_ovl(R[i],RV14_vis(document.getElementById(id)))}
   const small=sh.some(e=>[...e.querySelectorAll('*'),e].some(x=>x.childNodes[0]&&x.childNodes[0].nodeType===3&&parseFloat(getComputedStyle(x).fontSize)<12)),ids=sh.map(e=>e.id).join('+');RO.pop=null;RO.pm=null;
   say('📍 LEFT HUD STACK ('+P+') · cards shown: '+ids+' (≤ 2, prompt has priority, no hint beside the prompt) · overlap with each other, minimap or controls '+ov+' px² (0) · text under 12 px: '+(small?'yes':'no')+ok(sh.length>=1&&sh.length<=2&&!ov&&!small&&!(ids.includes('roamPrompt')&&ids.includes('crSmHint'))))},300)},1000);return'📍 LEFT HUD STACK · setting up prompt + SMASH objective…'}
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
body.phHold #spRes{visibility:hidden;pointer-events:none}
#roam.racing #roamPlate{display:none!important}
@media (orientation:portrait){html body.spOn #raceW .cp{display:none!important}}   /* rv3C: portrait is 393 px wide: place + time + gap fit, the checkpoint count is in the arrow pill */
body.v85.spOn[data-mode=roam]:not(.v85b) #raceW:not([hidden]){display:flex!important}   /* rv3C: v85 hides #raceW after its 5 s brief; in a race the place/gap/checkpoint/time pills stay up */
body.spShow :is(#m1Next,#roamArrow,#roamPlate,#roamPop,#roamPrompt,#crSmHint){visibility:hidden!important}`;document.head.appendChild(st);
 let t0=0;setInterval(()=>{try{const r=document.getElementById('spRes');document.body.classList.toggle('spShow',!!r&&!r.hidden);if(!r||r.hidden){t0=0;document.body.classList.remove('phHold');return}
  if(!t0)t0=performance.now();document.body.classList.toggle('phHold',typeof RO!=='undefined'&&Math.abs(RO.v||0)>1.5&&performance.now()-t0<4000)}catch(e){}},100)}

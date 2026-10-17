// ===== rv2k3 (review 2K-3, 2026-10-17, lane D): dev-UI yield + smash-debris GO helpers. Kept out of 99c_checklist.js (200 KB module cap).
// devui2: the 🐞 button and the ✔ chip are dev UI: they hide (not move) whenever they would sit on a button or panel, and for the whole race, result and garage.
// 🐞 stays reachable from the pause menu (its 🐞 BUG button opens the same report sheet, assets/qa/code.js addBtn).
{const YS='#npcSay,#roamPause,#pause,#results,#settings,#chRes,#spRes,#roamPop,#journal,#roamMap,#story,#roamCard,#cmap,#slots,#profile,#gbx,#odChk,#credBox,[role=dialog],.modal,#roamTut,#home .hbar h2,[role=listbox],[role=menu],.r2Pop,.r2Menu,.r2List,.gbDrop',yVis=e=>{if(e.hidden||e.closest('[hidden]'))return null;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<.05)return null;const r=e.getBoundingClientRect();return r.width>4&&r.height>4?r:null};
 const DEVS='button,[role=button],[role=tab],.tbtn,.tab,input,select,textarea,#roamMini,#roamGauge,#hPos,#hTime,#raceW,#tP,#spd,'+YS;
 const devOver=el=>{const r=el.getBoundingClientRect();if(r.width<4)return 0;let px=0;for(const e of document.querySelectorAll(DEVS)){if(e===el||el.contains(e)||e.contains(el)||e.closest('#odPin,#qaBugTop,#qaSheet'))continue;const q=yVis(e);if(!q)continue;const w=Math.min(r.right,q.right)-Math.max(r.left,q.left),h=Math.min(r.bottom,q.bottom)-Math.max(r.top,q.top);if(w>1&&h>1)px+=w*h}return px};
 window.DEV_yield=()=>{try{const els=['qaBugTop','odPin'].map(id=>document.getElementById(id));if(window.__noDevYield){els.forEach(el=>el&&el.classList.remove('odDevHide'));return}const busy=!!document.querySelector('#gbx:not([hidden]),#spRes:not([hidden]),#results:not([hidden])')||state!=='roam'||!!RO.sp;for(const el of els)if(el)el.classList.toggle('odDevHide',busy||devOver(el)>0)}catch(e){}};
 const st=document.createElement('style');st.textContent='#qaBugTop.odDevHide,#odPin.odDevHide{visibility:hidden!important;pointer-events:none!important}';document.head.appendChild(st);setInterval(window.DEV_yield,150)}
// rv2k3/debris-por: share of the screen (40 x 40 grid cells touched by a projected box) covered by smash debris + the tumbling wreck
function RV3_cover(){const N=40,g=new Uint8Array(N*N),W=innerWidth,H=innerHeight,tf=Math.tan(camera.fov*Math.PI/360),v=new THREE.Vector3(),cv=new THREE.Vector3();camera.updateMatrixWorld();
 const add=(p,r)=>{cv.copy(p).applyMatrix4(camera.matrixWorldInverse);if(cv.z>-.3)return;const d=-cv.z,px=r*(H/2)/(tf*d);v.copy(p).project(camera);const x=(v.x+1)/2*W,y=(1-v.y)/2*H;for(let i=Math.max(0,Math.floor((x-px)/W*N));i<=Math.min(N-1,Math.floor((x+px)/W*N));i++)for(let j=Math.max(0,Math.floor((y-px)/H*N));j<=Math.min(N-1,Math.floor((y+px)/H*N));j++)g[j*N+i]=1};
 if(DEB)for(const d of DEB.list)add(d.p,.5*Math.hypot(1.6*d.s.x,d.s.y,1.6*d.s.z)*(d.life<.5?d.life/.5:1));
 for(const c of HUB.cars||[])if(c.crW)add(v3tmp.set(c.crW.x,c.crW.y+.8,c.crW.z),2.4*CR_tk(c.crW.t));
 let n=0;for(const q of g)n+=q;return n/(N*N)}
const v3tmp=new THREE.Vector3();
function RV3_go(kind,say){const ok=b=>b?' ✅':' ❌',P=innerHeight>innerWidth?'portrait':'landscape';
 if(kind==='devui'){const D=()=>['qaBugTop','odPin'].map(RV14_vis).filter(Boolean),SEL='button,[role=button],[role=tab],.tbtn,.tab,#roamMini,#roamGauge,#hPos,#hTime,#raceW,#tP,#spd,#spRes,#results,#roamPause,#gbx .gbTabs,#gbx .gbPane,#gbx table,#spRes table,#results table';
  const over=()=>{let px=0;const who=[];for(const d of D())for(const e of document.querySelectorAll(SEL)){if(e.closest('#odPin,#qaBugTop,#qaSheet'))continue;const q=RV14_vis(e);const o=RV14_ovl(d,q);if(o){px+=o;who.push((e.id||e.className||e.tagName)+'')}}return[px,who]};
  const out=[];let tot=0;const note=(n,r)=>{tot+=r[0];out.push(n+' '+r[0]+' px²'+(r[1].length?' ('+r[1].slice(0,2).join(',')+')':''))};
  DEV_yield();note('roam',over());
  try{if(RO.sp)sprintEnd()}catch(e){}
  const o=window.__rv3.race(.15,300,true);DEV_yield();note('result'+(RV14_vis('spRes')?'':' (NO panel)'),over());try{$('#spRes').hidden=true}catch(e){}try{if(RO.sp)sprintEnd()}catch(e){}K.ArrowUp=K.KeyW=K.ArrowLeft=K.ArrowRight=K.ArrowDown=false;
  let gar='no garage';try{gbOpen();const t=[...document.querySelectorAll('#gbx .gbTabs button')].find(b=>/paint/i.test(b.textContent));if(t)t.click();DEV_yield();note('garage PAINT',over());gar=''}catch(e){out.push('garage ERR '+e)}finally{try{gbClose(false)}catch(e){}}
  DEV_yield();const bugBtn=!!document.getElementById('qaBugBtn')||!!document.getElementById('qaBugTop');
  return'📍 DEV UI vs PANELS ('+P+') · 🐞 + ✔ chip over any button/panel: '+out.join(' · ')+' · total '+tot+' px² (0) · 🐞 reachable (roam button + pause-menu BUG button): '+bugBtn+ok(!tot&&bugBtn&&!gar)}
 if(kind==='debris'){const q=rfSnap(-375,475,120);roamWarp(q?q[0]:-375,q?q[1]:475,q&&q[2]!=null?q[2]:0,true);RO.v=0;camSnap=true;for(let i=0;i<60;i++)roamStep(1/30);
  const c=(HUB.cars||[]).find(c=>!(c.dead>0)&&c.j!=null&&!c.crW);if(!c)return'📍 SMASH DEBRIS · no traffic car ❌';
  RO.v=70/3.6;K.KeyW=K.ArrowUp=true;const fx=Math.sin(RO.vh),fz=Math.cos(RO.vh);c.x=RO.x+fx*7;c.z=RO.z+fz*7;c.y=RO.y;const f=TR_smashFx(c,c.x,c.z,fx,fz);RO.v=70/3.6;let at5=0,mx=0,big=0;
  for(let i=1;i<=(window.__rv3stop||24);i++){roamStep(1/30);RO.v=70/3.6;camera.updateMatrixWorld();const a=RV3_cover();if(i===15)at5=a;if(i>=9&&i<=21)mx=Math.max(mx,a)}
  K.KeyW=K.ArrowUp=false;
  return'📍 SMASH DEBRIS ('+P+' '+innerWidth+'×'+innerHeight+') · 70 km/h smash of a traffic car · screen covered by debris + wreck 0.5 s later: '+Math.round(at5*100)+' % (≤ 10 %) · worst 0.3-0.7 s: '+Math.round(mx*100)+' % · wreck scale at 0.5 s '+CR_tk(.5).toFixed(2)+ok(at5<=.1&&mx<=.12)}
 return'📍 unknown RV3 kind'}

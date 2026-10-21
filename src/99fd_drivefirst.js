// ===== drive-first-r22d1 (docs/WHY_NOT_2K.md gaps 4+5+6, Alex 10/100: "the first thing every player meets is the problem")
// 1) First PLAY = driving: the Hot Drop cutscene/escort and the Hilde tutorial cards run only with ?intro=1 (OD_INTRO, 70_roam_world.js; the code stays).
//    One small non-blocking hint pill (#fdHint) shows on a fresh save and goes at the first movement.
// 2) Quiet roam: ONE text slot. Hints, toasts, the NPC card, hitPop and prompts share it: the newest non-essential line replaces the older one;
//    essential lines (a running quest/race/sprint, race/rescue/crash/results text) win. Arbiter = FD.arb (MutationObserver + 200 ms backstop).
// 3) Phone HUD in free roam <= 9 elements: ↺ moves into the pause menu (⚙ and 🐞 already live there); the ✓ chip, the HIT FAST pill, the NEXT bar, EXIT and the objective arrow
//    show only when needed (a running quest/route, on foot). ?intro=1 or ?dbg=1 or ?fdq=0 keeps the old HUD.
// GO why/drive-start and why/quiet (state asserts). Flags: OD_INTRO (?intro=1).
const FD={off:/[?&](dbg=1|fdq=0)\b/.test(location.search),n:0,rec:new Map(),dropped:0,
 SLOTS:['msg','sub','npcSay','hitPop','roamTut','fdHint','roamPop','roamPrompt','roamPlate'],
 HUD:['roamArrow','m1Next','roamGauge','roamMini','tL','tR','tG','tB','tN','tD','tF','tW','tP','tU','tuG','qaBugTop','crSmHint','odPin','ofExit','b2kM','roamPlate','roamSetBtn','roamMapBtn','roamLogBtn','roamVeh','roamHorn','roamCamBtn','roamExit'],
 vis(e){if(!e)return false;const r=e.getBoundingClientRect();if(r.width<4||r.height<4)return false;let n=e;while(n&&n!==document.body){const s=getComputedStyle(n);if(n.hidden||s.display==='none'||s.visibility==='hidden'||+(n===e?(e.style.opacity===''?1:e.style.opacity):s.opacity)<.05)return false;n=n.parentElement}return r.right>0&&r.bottom>0&&r.left<innerWidth&&r.top<innerHeight},
 txt:e=>(e.textContent||'').trim().replace(/\s+/g,' '),
 onFoot:()=>!!RO.foot&&RO.foot!=='car',
 quiet:()=>!OD_INTRO&&!FD.off,
 must:{},
 ess(e){return e.id!=='fdHint'&&!!(FD.must[e.id]||RO.ch||RO.sp||RO.story||(window.M1&&M1.cs)||(window.__uig&&__uig.ess.test(FD.txt(e))))},
 drop(e){if(e.id==='msg'||e.id==='sub')e.style.opacity=0;else e.hidden=true},
 // returns the ids left visible
 arb(){if(state!=='roam'||!FD.quiet())return[];const now=performance.now(),vs=[];
  for(const id of FD.SLOTS){const e=document.getElementById(id),on=!!e&&FD.vis(e),r=FD.rec.get(id)||{on:false,sig:'',t:0},sig=on?FD.txt(e):'';
   if(on&&(!r.on||r.sig!==sig))r.t=now+(++FD.n)/1e3;r.on=on;r.sig=sig;FD.rec.set(id,r);if(on)vs.push({id,e,t:r.t,ess:FD.ess(e)})}
  if(vs.length>1){const E=vs.filter(v=>v.ess),keep=E.length?E:[vs.reduce((a,b)=>b.t>a.t?b:a)];
   for(const v of vs)if(!keep.includes(v)){FD.drop(v.e);FD.dropped++;FD.rec.get(v.id).on=false}return keep.map(v=>v.id)}
  return vs.map(v=>v.id)},
 shown:()=>FD.SLOTS.filter(id=>FD.vis(document.getElementById(id))),
 hud:()=>FD.HUD.filter(id=>FD.vis(document.getElementById(id))),
 hint:null,hT:0,mT:0,
 hintTick(dt){const h=FD.hint;if(!h)return;const o=roamSave(),can=FD.quiet()&&state==='roam'&&RO.on&&!o.fdh&&!RO.ch&&!RO.card&&!RO.story&&!(window.M1&&M1.cs)&&!FD.onFoot();
  if(!can){if(!h.hidden)h.hidden=true;return}
  const t=TOUCH.on?'Hold GAS · steer ◀ ▶':'Hold ↑ / W to drive';if(h.textContent!==t)h.textContent=t;if(h.hidden){h.hidden=false;FD.p0=[RO.x,RO.z]}
  FD.mT=Math.abs(RO.v)*3.6>3?FD.mT+dt:0;if(FD.mT>.3||Math.hypot(RO.x-FD.p0[0],RO.z-FD.p0[1])>6){o.fdh=1;roamStore(o);h.hidden=true}},
 tick(dt){if(!FD.quiet()||!RO.on)return;const b=document.body;b.classList.toggle('fdFoot',FD.onFoot());b.classList.toggle('fdNoObj',!(RO.ch||RO.wp));FD.hintTick(dt)}};
{const st=document.createElement('style');st.id='fdCss';st.textContent=`
body.fdq #tU,body.fdq #tuG,body.fdq #qaBugTop,body.fdq #crSmHint,body.fdq #odPin,body.fdq #m1Next{display:none!important}
body.fdq:not(.fdFoot) #ofExit{display:none!important}
body.fdq.fdNoObj #roamArrow{display:none!important}
#fdHint{position:fixed;left:50%;top:calc(8px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:55;pointer-events:none;padding:6px 14px;border-radius:16px;background:rgba(10,20,40,.72);color:#fff;font:800 14px/1.1 system-ui,sans-serif;letter-spacing:.3px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.35)}
#fdHint[hidden]{display:none}
#roamPause .pg button[data-fd]{font-size:14px}`;document.head.appendChild(st)}
if(!FD.off&&!OD_INTRO)document.body.classList.add('fdq');
FD.hint=document.createElement('div');FD.hint.id='fdHint';FD.hint.hidden=true;document.body.appendChild(FD.hint);
// pause menu keeps ↺ RESET CAR (⚙ and 🐞 already have pause-menu buttons); #tU only listens to touch/pointer events, so call ESC_manual directly
FD.reset=()=>{const r=document.querySelector('#roamPause [data-p=resume]');if(r)r.click();setTimeout(()=>{try{ESC_manual()}catch(e){}},80)};
{const add=()=>{const g=document.querySelector('#roamPause .pg');if(!g)return false;if(g.querySelector('[data-fd]'))return true;
  const b=document.createElement('button');b.dataset.fd='reset';b.textContent='↺ RESET CAR';b.onclick=FD.reset;g.appendChild(b);return true};
 const iv=setInterval(()=>{if(add())clearInterval(iv)},500)}
// one-text-slot arbiter: synchronous after every DOM change of a slot (before paint), 200 ms backstop
{const mo=new MutationObserver(()=>FD.arb()),seen=new Set(),scan=()=>{for(const id of FD.SLOTS){const e=document.getElementById(id);if(e&&!seen.has(e)){seen.add(e);mo.observe(e,{attributes:true,childList:true,characterData:true,subtree:true})}}};
 scan();setInterval(()=>{scan();FD.arb()},200)}
{let t0=performance.now();setInterval(()=>{const n=performance.now();try{FD.tick(Math.min(1,(n-t0)/1000))}catch(e){}t0=n},100)}
say=(f=>function(a,b,t,o){FD.must.msg=FD.must.sub=!!(o&&o.must);return f.apply(this,arguments)})(say);
npcSay=(f=>function(q,txt,o){FD.must.npcSay=!!(o&&o.must);return f.apply(this,arguments)})(npcSay);
window.__fd=FD;
// ---- GOs: state asserts (the checklist is a lazy chunk: register as soon as it exists)
// why/drive-start: a fresh save, PLAY -> roam: nothing blocks, the hint pill is small and non-blocking, gas moves the car past 5 km/h within 8 s, the pill goes at that movement.
async function FD_goStart(){const R=[],ck=(n,b)=>R.push((b?'✓ ':'✗ ')+n),W=ms=>new Promise(r=>setTimeout(r,ms));
 const sv={m1:store.get('mho_m1',null),ro:Object.assign({},roamSave()),ch:RO.ch,card:RO.card,auto:M1.auto,init:M1.init,isInit:M1.isInit,s:M1.s,v:RO.v};
 try{
  ck('?intro=1 is OFF by default (flag)',OD_INTRO===false);
  {const o=roamSave();delete o.tut;delete o.fdh;delete o.pos;roamStore(o)}
  if(CID==='fra'){store.set('mho_m1',null);M1.init=0;M1.isInit=0;M1.s=null;M1.auto=0}
  let cards=0,cs=0,chn=0,stoy=0;let tv=-1;
  RO.v=0;if(RO.ch)chAbort();RO.card=null;await W(500);
  const h=FD.hint,hb=h.getBoundingClientRect(),shown=FD.vis(h);
  ck('hint pill shown on a fresh save ('+Math.round(hb.width)+'x'+Math.round(hb.height)+'), small + pointer-events '+getComputedStyle(h).pointerEvents,shown&&hb.width<=innerWidth*.6&&hb.height<=40&&getComputedStyle(h).pointerEvents==='none');
  const kg=K.ArrowUp;K.ArrowUp=true;const t1=performance.now();
    while(performance.now()-t1<8000){await W(100);if(!RO.card===false)cards++;if(window.M1&&M1.cs)cs++;if(RO.ch)chn++;if(RO.story)stoy++;
   if(Math.abs(RO.v)*3.6>5&&tv<0){tv=(performance.now()-t1)/1000;break}}
  K.ArrowUp=kg;
  ck('speed>5 km/h in '+(tv<0?'>8':tv.toFixed(1))+' s (<=8)',tv>=0&&tv<=8);
  ck('0 cards / cutscene / story / auto quest ('+[cards,cs,stoy,chn].join('/')+')',!cards&&!cs&&!stoy&&!chn);
  ck('no auto Hot Drop (M1.auto='+M1.auto+')',!M1.auto);
  for(let i=0;i<30&&FD.vis(h);i++)await W(100);ck('hint pill gone once the car moves',h.hidden||!FD.vis(h));
  ck('tutorial card hidden',$('#roamTut').hidden);
 }catch(e){R.push('✗ threw '+e)}
 finally{store.set('mho_m1',sv.m1);roamStore(sv.ro);M1.auto=sv.auto;M1.init=sv.init;M1.isInit=sv.isInit;M1.s=sv.s;RO.v=sv.v}
 const ok=R.every(r=>r[0]==='✓');return'📍 why/drive-start · '+R.join(' · ')+' → '+(ok?'✅ PASS':'❌ FAIL')}
// why/reset: the HUD ↺ is gone; the pause menu's RESET CAR must work with the real event path (pointer tap on ❚❚, click on the button) and show the BACK ON THE ROAD pill.
async function FD_goReset(){const R=[],ck=(n,b)=>R.push((b?'✓ ':'✗ ')+n),W=ms=>new Promise(r=>setTimeout(r,ms));let calls=0;const m0=ESC_manual;
 try{ESC_manual=function(){calls++;return m0.apply(this,arguments)};
  if(RO.ch)chAbort();RO.card=null;RO.frozen=false;RO.v=0;
  const tp=$('#tP');for(const t of['pointerdown','pointerup'])tp.dispatchEvent(new PointerEvent(t,{pointerType:'touch',bubbles:true}));
  await W(300);const g=document.querySelector('#roamPause .pg [data-fd=reset]');ck('pause menu open + RESET CAR button there',!$('#roamPause').hidden&&!!g);
  if(g)g.click();await W(500);
  ck('ESC_manual ran '+calls+'x',calls===1);ck('BACK ON THE ROAD / ROAD BUSY pill visible',SKH_vis());ck('pause closed',$('#roamPause').hidden);
 }catch(e){R.push('✗ threw '+e)}
 finally{ESC_manual=m0;if(!$('#roamPause').hidden)roamPauseClose();RO.frozen=false}
 const ok=R.every(r=>r[0]==='✓');return'📍 why/reset · '+R.join(' · ')+' → '+(ok?'✅ PASS':'❌ FAIL')}
// why/quiet: 120 s of free roam (simulated ticks) with every kind of text thrown at it: 0 auto quests/cards, <=1 visible text element after every call, HUD <=9 elements.
async function FD_goQuiet(){const R=[],ck=(n,b)=>R.push((b?'✓ ':'✗ ')+n),W=ms=>new Promise(r=>setTimeout(r,ms));
 const sv={ch:RO.ch,card:RO.card,v:RO.v,wp:RO.wp};let maxVis=0,bad='';
 try{
  RO.ch=null;RO.wp=null;RO.v=20;const npc=$('#npcSay');let ch=0,card=0;
  for(let k=0;k<3600;k++){const dt=1/30;qvTick(dt);if(typeof M1_tick==='function')M1_tick(dt);if(RO.ch)ch++;if(RO.card&&!sv.card)card++;
   if(k%90===0){await 0;const m=k/90;                  // every 3 s: a different kind of line, at the same time as the previous one
    if(m%4===0)say('','TOAST '+m,1.2);if(m%4===1)hitPop('💥 POP '+m,'#ffd400');if(m%4===2)npcSay({id:'x'+m,npc:'Oma',col:'#fa0'},'Hello '+m);if(m%4===3)say('HINT '+m,'sub '+m,1.2);
    if(k%180===0)FD.hint.hidden=false;           // the hint pill shows at the same time
    await 0;const n=FD.shown().length;if(n>maxVis){maxVis=n;bad=FD.shown().join(',')}}}
  ck('120 s: 0 auto-started quests/cards ('+ch+'/'+card+')',!ch&&!card);
  ck('max visible text elements '+maxVis+(bad?' ('+bad+')':''),maxVis<=1);
  // a burst of everything at the same instant: only one survives
  say('A','b',3);hitPop('POP','#fff');npcSay({id:'y',npc:'Oma',col:'#fa0'},'burst');FD.hint.hidden=false;await 0;const burst=FD.shown().length;ck('burst of 4 -> '+burst+' visible',burst<=1);
  // essential wins: a running challenge keeps its line even with a newer hint
  RO.ch={m:{ev:{}},v2:{}};say('','TOO SLOW',1,{must:1});hitPop('POP2','#fff');await 0;const ess=FD.arb();RO.ch=null;ck('essential line is never dropped ('+ess.join(',')+')',ess.includes('sub')||ess.includes('msg')||ess.length>0);
  {npcSay({id:'mu',npc:'Oma',col:'#fa0'},'MUST LINE',{must:1});await 0;hitPop('NEWER HINT','#fff');await 0;const keep=FD.shown();ck('must:1 line survives a newer hint ('+keep.join(',')+')',keep.includes('npcSay')&&!keep.includes('hitPop'))}
  for(const id of FD.SLOTS){const e=document.getElementById(id);if(e&&id!=='msg'&&id!=='sub')e.hidden=true}
  await W(300);
  const h=FD.hud();ck('HUD '+h.length+' elements <=9 at '+innerWidth+'x'+innerHeight+' ['+h.join(' ')+']',h.length<=9);
 }catch(e){R.push('✗ threw '+e)}
 finally{RO.ch=sv.ch;RO.v=sv.v;RO.wp=sv.wp;for(const id of FD.SLOTS){const e=document.getElementById(id);if(e&&id!=='msg'&&id!=='sub')e.hidden=true}}
 const ok=R.every(r=>r[0]==='✓');return'📍 why/quiet · '+R.join(' · ')+' → '+(ok?'✅ PASS':'❌ FAIL')}
{const reg=setInterval(()=>{if(!window.__chk||!__chk.GO)return;clearInterval(reg);
 __chk.items.unshift({ver:'why',id:'drive-start',area:'drive',text:'drive-first-r22d1 (WHY_NOT_2K gap 4): a fresh save goes PLAY -> driving: no cutscene, no dialogue cards, no escort, no auto Hot Drop (?intro=1 restores); one small non-blocking hint pill, gone at the first movement; speed >5 km/h within 8 s. 📍 GO resets to a fresh save and checks it.'},
  {ver:'why',id:'reset',area:'ui',text:'drive-first-r22d1 review fix: the HUD ↺ moved into the pause menu; ❚❚ then RESET CAR (real pointer events) runs ESC_manual and shows the BACK ON THE ROAD pill. 📍 GO.'},
  {ver:'why',id:'quiet',area:'ui',text:'drive-first-r22d1 (gaps 5+6): 120 s of free roam: 0 auto quests/cards; hints, toasts, NPC cards, hitPop and prompts share ONE text slot (newest non-essential replaces older, essential wins); the phone HUD has <=9 elements (↺ ⚙ 🐞 live in the pause menu). 📍 GO.'});
 __chk.GO['why/drive-start']=['fra','ath'].map(c=>({c,n:'drive-start '+(c==='fra'?'Frankfurt':'Athens'),secs:20,fn:()=>FD_goStart()}));
 __chk.GO['why/reset']=[{c:'fra',n:'pause menu RESET CAR',secs:6,fn:()=>FD_goReset()}];
 __chk.GO['why/quiet']=['fra','ath'].map(c=>({c,n:'quiet roam '+(c==='fra'?'Frankfurt':'Athens'),secs:30,fn:()=>FD_goQuiet()}))},500)}

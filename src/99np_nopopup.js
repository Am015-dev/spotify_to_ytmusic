// ===== no-card-without-tap-r22e20 (Alex: popups, annoying quests). While driving, LEVEL UP and event results are small fading toasts,
// events only start after a tap on the TAP TO START chip, the full level-up card waits in the pause menu (PROFILE) or shows when stopped/in a menu.
// GO why/no-popup: 60 s of stepped driving with a level-up forced mid-drive, an event result while moving and while stopped, the event chip; state asserts only.
async function NP_go(){const R=[],ck=(m,b)=>R.push((b?'✓ ':'✗ ')+m),vis=e=>!!e&&!e.hidden&&e.getClientRects().length>0&&getComputedStyle(e).display!=='none';
 if(state!=='roam'||!RO.on||!pl)return'📍 Start free roam first';
 const p0=prof(),xp0=p0.xp,sv={x:RO.x,z:RO.z,h:RO.h,v:RO.v,ch:RO.ch,card:RO.card,sp:RO.sp},W=innerWidth,H=innerHeight,C={l:W*.25,r:W*.75,t:H*.25,b:H*.75};
 const ovl=r=>Math.max(0,Math.min(r.right,C.r)-Math.max(r.left,C.l))*Math.max(0,Math.min(r.bottom,C.b)-Math.max(r.top,C.t));
 let block=0,moving=0,toast=0,big=0,cen=0,tsz=0,lvlAt=-1;const U=$('#r3Up');
 try{
  R3U.q.length=0;R3U.later=null;U.hidden=true;RO.ch=null;RO.card=null;RO.sp=null;RO.v=8;K.ArrowUp=K.KeyW=true;
  for(let i=0;i<1800;i++){
   if(Math.abs(RO.v)<2.5)RO.v=8;
   if(i===600){addXP(6000,'no-popup test');lvlAt=i}
   roamStep(1/30);if(i%18===0)try{R3_upPump()}catch(e){}
   const kmh=Math.abs(RO.v)*3.6;if(kmh<=5)continue;moving++;
   if(vis(U)&&!U.classList.contains('mini'))block++;
   const og=document.getElementById('ogRes');if(vis(og)&&!og.classList.contains('tst'))block++;
   if(vis(U)&&U.classList.contains('mini')){toast++;const t=U.firstElementChild.getBoundingClientRect();tsz=Math.max(tsz,t.width*t.height);cen+=ovl(t);if(parseFloat(getComputedStyle(U.querySelector('small')||U).fontSize)<12)big++}}
  ck('driving 60 s, '+moving+' of 1800 steps above 5 km/h (≥ 1200)',moving>=1200);
  ck('level-up forced at step '+lvlAt+': blocking cards while moving '+block+' (0)',lvlAt===600&&block===0);
  ck('toast samples '+toast+' (≥ 1), size '+Math.round(tsz)+' px² (< 6 % of the screen), over the centre 50 %: '+Math.round(cen)+' px² (0), font < 12 px: '+big+' (0)',toast>=1&&tsz>0&&tsz<.06*W*H&&cen===0&&big===0);
  ck('the card is kept for the pause menu (R3U.later = '+JSON.stringify(R3U.later)+')',!!R3U.later);
  {const pb=$('#pfBody');let btn=null;if(typeof profileOpen==='function'){try{profileOpen();btn=document.querySelector('.r3LvB')}catch(e){}}
   if(btn){btn.click();ck('pause menu → PROFILE → "LEVEL UP! TAP TO VIEW" opens the full card (CONTINUE button '+vis(U.querySelector('[data-r3u=ok]'))+')',vis(U)&&!U.classList.contains('mini')&&!!U.querySelector('[data-r3u=ok]'))}
   else ck('pause menu has the LEVEL UP button (pfBody '+!!pb+')',false)}
  U.hidden=true;R3U.q.length=0;R3U.later=null;try{const pr=$('#profile');if(pr)pr.hidden=true}catch(e){}
  // event result: a toast while moving, the card when stopped
  const og=OG_el('ogRes'),fake={kind:'gate',u:' s',sp:{id:'np'}};RO.v=10;OG_res(fake,3,12.3,500,true);const m1=vis(og)&&og.classList.contains('tst'),r1=og.getBoundingClientRect();
  ck('event result at 36 km/h = toast ('+m1+', '+Math.round(r1.width*r1.height)+' px² < 6 %, over the centre '+Math.round(ovl(r1))+' px² (0))',m1&&r1.width*r1.height<.06*W*H&&ovl(r1)===0);
  og.hidden=true;RO.v=0;OG_res(fake,3,12.3,500,true);const m2=vis(og)&&!og.classList.contains('tst');ck('event result when stopped = card ('+m2+')',m2);og.hidden=true;clearTimeout(OG_res.t);
  // events start only after a tap
  const sp=OG.S.find(q=>q.k==='ev'&&!OG_blocked(q));
  if(!sp)ck('an event start spot exists near the road',false);
  else{OG.cool=0;OG.ev&&OG_end(null,1);OG.ask=null;OG.noAsk={};OG_el('ogAsk').hidden=true;RO.x=sp.x;RO.z=sp.z;RO.y=sp.y;RO.v=8;
   for(let i=0;i<30;i++){RO.x=sp.x;RO.z=sp.z;RO.v=8;try{OG_pickVis()}catch(e){}roamStep(1/30);if(OG.ask||OG.ev)break}
   const a0=!!OG.ask,e0=!!OG.ev,chip=vis(OG_el('ogAsk')),cr=OG_el('ogAsk').getBoundingClientRect();
   ck('driving over an event start: no auto-start (event '+e0+'), chip "TAP TO START" shown ('+chip+', '+Math.round(cr.height)+' px high ≥ 44, over the centre '+Math.round(ovl(cr))+' px² (0))',!e0&&a0&&chip&&cr.height>=44&&ovl(cr)===0);
   const go=OG_askGo();ck('tap on the chip starts the event ('+go+', event '+!!OG.ev+')',go&&!!OG.ev);if(OG.ev)OG_end(null,1);OG_el('ogRes').hidden=true;OG_el('ogHud').hidden=true}
 }catch(e){R.push('✗ threw '+e)}
 finally{K.ArrowUp=K.KeyW=false;RO.x=sv.x;RO.z=sv.z;RO.h=RO.vh=sv.h;RO.v=0;RO.ch=sv.ch;RO.card=sv.card;RO.y=groundAt(RO.x,RO.z,99);camSnap=true;U.hidden=true;R3U.q.length=0;R3U.later=null;OG_askHide();OG_el('ogAsk').hidden=true;const p=prof();p.xp=xp0;store.set('mho_prof',p)}
 const ok=R.every(r=>r[0]==='✓');return'📍 why/no-popup ('+(H>W?'portrait':'landscape')+') · '+R.join(' · ')+' → '+(ok?'✅ PASS':'❌ FAIL')}
{const reg=setInterval(()=>{if(!window.__chk||!__chk.GO)return;clearInterval(reg);
 __chk.items.unshift({ver:'why',id:'no-popup',area:'drive',text:'no-card-without-tap-r22e20: while driving (> 5 km/h) LEVEL UP and event results are small fading toasts (no card, nothing over the centre 50 % or the controls, text ≥ 12 px); events start only after a tap on the TAP TO START chip; the level-up card opens from the pause menu PROFILE or when stopped. 📍 GO.'});
 __chk.GO['why/no-popup']=['fra','ath'].map(c=>({c,n:'no popup while driving '+(c==='fra'?'Frankfurt':'Athens'),secs:90,fn:()=>NP_go()}))},500)}

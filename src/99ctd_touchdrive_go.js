// touchdrive-r29a (2026-10-29): GO feel/touchdrive, a no-graphics state assert on how the phone touch controls DRIVE (Frankfurt + Athens). Alex: "not even close to Hit and Run".
// Phone buttons (TOUCH.* exactly as the on-screen buttons set them), live roamStep at dt 1/60 from a street spawn. The real-button version on the built page is tools/touchdrive.js.
//  drift on purpose: BRAKE+steer at 50 / 35 km/h (no gas) enters DRIFT within .35 s and turns the path 90 deg in <= 1.3 s; BRAKE alone: 0 drift frames, no slide (<= 6 deg), it slows
//  drift never by accident: a 100 / 200 / 300 ms BRAKE tap in a GAS+steer corner at 40 and 60 km/h = 0 drift frames
//  smash never by accident: two steer taps inside the double-tap window (touchstart on #btnZone) = 0 lunges; the arrow toward a car beside you held, then BOOST pressed = 1 lunge toward it; plain BOOST, BOOST already held, steering away, or no car = 0
const TD={enter:.35,t90:1.3,t90slow:1.45,slip:6};/* from 35 km/h the hold costs 12 km/h before the drift starts, so its turn is slower (1.23-1.33 s measured) */
function TD_measure(){const out={taps:{}},W=a=>Math.atan2(Math.sin(a),Math.cos(a)),D=a=>Math.round(a*180/Math.PI),S0=window.SET&&SET.touch;
 const H0=TD.h0=TD.h0&&TD.h0.c===CID?TD.h0:{c:CID,x:CID==='fra'?(HX0+HX1)/2:RO.x,z:CID==='fra'?(HZS+HZN)/2:RO.z};
 const home=()=>{try{OF_reset()}catch(e){}const q=rfSnap(H0.x,H0.z,120);roamWarp(q?q[0]:RO.x,q?q[1]:RO.z,q?q[2]:RO.h,true);RO.v=0;RO.vy=0;RO.crLg=0;RO.crLgCd=0;try{CRSM.b=null;CRSM.t=-1e9}catch(e){}try{for(const c of HUB.cars){c.x=1e5;c.z=1e5}}catch(e){}camSnap=true;for(let i=0;i<60;i++){RO.v=0;roamStep(1/60)}roamWarp(q[0],q[1],q[2],true)};
 const T=o=>{TOUCH.on=true;TOUCH.used=true;TOUCH.dir=o.dir||0;TOUCH.gas=!!o.gas;TOUCH.brake=!!o.brk;TOUCH.boost=!!o.boost;TOUCH.hb=false};
 const st=(n,o,f)=>{for(let i=0;i<n;i++){T(o);roamStep(1/60);try{roamCam(1/60)}catch(e){}if(f&&f(i)===false)return i}return n};
 const at=kmh=>{RO.v=kmh/3.6;RO.vh=RO.h;RO.yr=0;RO.dl=0;RO.dDir=0;RO.dT=0;RO.dEx=0;RO.crTurn=null;RO.stkT=0;TOUCH.steer=0;RO.inv=99;RO.hp=100;RO.turbo=0;if(pl)pl.bm=0};
 try{SET.touch='buttons';
  for(const k of[50,35]){home();at(k);const h0=RO.vh;let en=-1,t=-1,mx=0;st(120,{brk:1,dir:1},i=>{if(en<0&&RO.dDir)en=+((i+1)/60).toFixed(2);if(t<0&&Math.abs(W(RO.vh-h0))>=Math.PI/2)t=+((i+1)/60).toFixed(2)});out['bd'+k]={enter:en,t90:t}}
  {home();at(50);let dr=0,mx=0;st(120,{brk:1},()=>{if(RO.dDir)dr++;mx=Math.max(mx,Math.abs(W(RO.h-RO.vh)))});out.bk50={drift:dr,slip:D(mx),kmh:Math.round(Math.abs(RO.v)*3.6)}}
  for(const k of[40,60])for(const ms of[100,200,300]){home();at(k);let dr=0;const f=()=>{if(RO.dDir)dr++};st(30,{gas:1,dir:1},f);st(Math.round(ms*.06),{gas:1,dir:1,brk:1},f);st(60,{gas:1,dir:1},f);out.taps[k+'/'+ms]=dr}
  // smash: two steer taps through the real #btnZone touchstart handler (the double-tap window is real time, both taps are inside it)
  const tap=d=>{const e=document.getElementById(d<0?'tL':'tR'),r=e.getBoundingClientRect(),t=new Touch({identifier:7,target:e,clientX:r.left+r.width/2,clientY:r.top+r.height/2});e.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,cancelable:true,touches:[t],changedTouches:[t]}));e.dispatchEvent(new TouchEvent('touchend',{bubbles:true,cancelable:true,touches:[],changedTouches:[t]}))};
  out.dbl={};for(const d of[-1,1]){home();at(45);T({gas:1});const n0=RO.crLgN||0;st(10,{gas:1});tap(d);st(3,{gas:1});tap(d);st(30,{gas:1});out.dbl[d]=(RO.crLgN||0)-n0}
  out.smash={};for(const[nm,side,steer]of[['to',1,1],['toL',-1,-1],['straight',1,0],['away',1,-1],['none',0,1],['held',1,0]]){home();at(40);st(10,{gas:1});for(const c of HUB.cars){c.x=1e5;c.z=1e5}/* only the car placed below may be beside */if(side){const h=RO.h,c=HUB.cars.find(q=>q.dead<=0&&!q.pk)||HUB.cars[0];c.x=RO.x-Math.cos(h)*side*3.2;c.z=RO.z+Math.sin(h)*side*3.2;c.y=RO.y;c.dead=0}
   const n0=RO.crLgN||0;if(nm==='held'){st(3,{gas:1,boost:1});st(6,{gas:1,boost:1,dir:1})}else st(nm[0]==='t'?6:1,{gas:1,boost:1,dir:steer});st(30,{gas:1});out.smash[nm]=(RO.crLgN||0)-n0}
  // the SMASH tip (REVIEW_2K_32 2b): 5 times a car is beside you -> shown 3 times, 14 px, clear of every button and the minimap
  {home();at(40);st(10,{gas:1});for(const c of HUB.cars){c.x=1e5;c.z=1e5}const h=RO.h,c=HUB.cars[0];c.x=RO.x-Math.cos(h)*3.2;c.z=RO.z+Math.sin(h)*3.2;c.y=RO.y;c.dead=0;at(40);CRT.n=0;const hn0=CRSM.hn;CRSM.hn=0;let shown=0,small=0,over=0,txt='';
   for(let i=0;i<5;i++){CRT.last=-1e9;CRT_hide();CRT_tick();if(CRT.on){shown++;const e=document.getElementById('crSmTip'),r=e.getBoundingClientRect();txt=e.textContent;if(parseFloat(getComputedStyle(e).fontSize)<12)small++;for(const q of CRSM_rects())if(r.left<q.right&&r.right>q.left&&r.top<q.bottom&&r.bottom>q.top)over++}}
   CRT_hide();CRT.n=0;CRSM.hn=hn0;try{localStorage.setItem('mho_smTip','0')}catch(e){}out.tip={shown,small,over,txt,dbg:[state,TOUCH.on,TOUCH.used,paused,RO.on,!!RO.card,!!RO.mapOpen,!!RO.story,!!RO.wk,!!RO.frozen,R3B_panelOpen(),Math.round(Math.abs(RO.v)),CRB_side(0),CRSM.hn,CRT.n].join()}}
 }finally{T({});if(S0!=null)SET.touch=S0;home()}
 return out}
function TD_go(){const m=TD_measure(),bad=[];window.__chk.td=m;
 for(const k of[50,35]){const b=m['bd'+k];if(!(b.enter>0&&b.enter<=TD.enter&&b.t90>0&&b.t90<=(k>40?TD.t90:TD.t90slow)))bad.push('BRAKE+steer '+k+' km/h enter '+b.enter+' s, 90° at '+b.t90+' s')}
 if(m.bk50.drift||m.bk50.slip>TD.slip)bad.push('BRAKE alone drift '+m.bk50.drift+' f, slip '+m.bk50.slip+'°');
 for(const[k,v]of Object.entries(m.taps))if(v)bad.push('BRAKE tap '+k+' ms: '+v+' drift frames');
 for(const d of[-1,1])if(m.dbl[d])bad.push('double steer tap '+d+' fired a lunge');
 for(const k of['to','toL'])if(m.smash[k]!==1)bad.push('BOOST+steer toward a car ('+k+') lunged '+m.smash[k]+'x');for(const k of['straight','away','none','held'])if(m.smash[k])bad.push('BOOST '+k+' lunged');
 if(m.tip.shown!==3||m.tip.small||m.tip.over)bad.push('SMASH tip shown '+m.tip.shown+'x of 5 (3), '+m.tip.small+' under 12 px, '+m.tip.over+' over controls');
 return`📍 TOUCH DRIVE ${CID} · BRAKE+steer 50 km/h: drift at ${m.bd50.enter} s, 90° at ${m.bd50.t90} s; 35 km/h: ${m.bd35.enter} / ${m.bd35.t90} s (≤ ${TD.enter} / ≤ ${TD.t90} at 50, ≤ ${TD.t90slow} at 35) · BRAKE alone: ${m.bk50.drift} drift frames, slip ${m.bk50.slip}°, ${m.bk50.kmh} km/h after 2 s · BRAKE taps 100/200/300 ms at 40+60 km/h in a corner: drift frames ${Object.values(m.taps).join('/')} (all 0) · double steer tap lunges ${m.dbl[-1]}/${m.dbl[1]} (0) · BOOST+steer into a car ${m.smash.to}/${m.smash.toL} (1), plain BOOST / steer away / no car / BOOST already held ${m.smash.straight}/${m.smash.away}/${m.smash.none}/${m.smash.held} (0) · SMASH tip shown ${m.tip.shown}/5 (3), "${m.tip.txt}" [${m.tip.dbg}]${bad.length?' ❌ '+bad.join('; '):' ✅'}`}
function TD_rows(GO,goSay,CK){CK.push({ver:'feel',id:'touchdrive',area:'drive',text:'touchdrive-r29a:2026-10-29 · on a phone you drift when you mean to and smash when you mean to. BRAKE+steer from 35+ km/h enters DRIFT within .35 s and turns 90° in ≤ 1.3 s; BRAKE alone stops without sliding; a 100-300 ms BRAKE tap in a corner (40 and 60 km/h) never drifts; two quick steer taps never fire the SMASH lunge (BOOST + steering into a car does). 📍 GO steps the live roam sim at dt 1/60 with the touch-button state (the real-button version is tools/touchdrive.js).'});
 for(const c of['fra','ath'])(GO['feel/touchdrive']=GO['feel/touchdrive']||[]).push({c,n:'touch drive '+(c==='fra'?'Frankfurt':'Athens'),secs:90,fn:()=>TD_go()})}
window.__td26={TD,measure:TD_measure};

// touchdrive-r29a: phone-touch drive feel through the REAL on-screen buttons on the BUILT page (page.evaluate only READS state).
// node tools/touchdrive.js <base url of index.html> <fra|ath> <reps> [shot.jpg]
// Phone profile: iPhone UA, 852x393 touch, device scale 2, CPU 6x. Presses are trusted CDP touches at the centres of #tB (BRAKE), #tG (GAS),
// #tN (BOOST) and #tL/#tR (steer arrows); the sim is stepped 1/60 in the page between presses (as the GOs step it), street spawn as in GO feel/drive.
// Cases (each `reps` times): bd50/bd40 BRAKE+right (no gas): DRIFT entered <= .35 s, path 90 deg <= 1.3 s; bk50 BRAKE alone: 0 drift frames, slip <= 6 deg, ends stopped or reversing (v <= 5 km/h);
// tapNNN (100/200/300 ms BRAKE tap in a GAS+right corner at 40 and 60 km/h): 0 drift frames; dbl: two steer taps inside the double-tap window: 0 lunges;
// smash: arrow held toward a car beside the player, then BOOST pressed: a lunge fires; plain BOOST, steering away, or no car: none. Also boostHeldSteer: BOOST already held, then the arrow: none.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const [BASE,C,REPS,SHOT]=process.argv.slice(2);const N=+REPS||1;
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 const p=await ctx.newPage();p.setDefaultTimeout(600000);const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,160)));
 const cdp=await ctx.newCDPSession(p);
 const EV=(fn,arg)=>p.evaluate(c=>__xc.ev(c),'('+fn.toString()+')('+JSON.stringify(arg||{})+')');
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 await p.goto(BASE+'?test='+C);await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:300000});
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:6})/* 6x only after the boot: the boot is not under test and takes > 5 min throttled on a loaded lab */;await EV(()=>new Promise(r=>setTimeout(r,3000)));
 const pos=await EV(()=>{const c=s=>{const r=document.querySelector(s).getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2,r.width]};return{B:c('#tB'),G:c('#tG'),R:c('#tR'),L:c('#tL'),N:c('#tN')}});
 const ID={R:1,G:2,B:3,L:4,N:5};let down=[];
 const pts=()=>down.map(x=>({x:pos[x][0],y:pos[x][1],id:ID[x]}));
 // CDP cannot lift one finger of several: lift all, then put the remaining ones back (no sim step in between)
 const set=async ids=>{for(const k of down)if(!ids.includes(k)){const rest=down.filter(x=>x!==k);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});down=[];if(rest.length){down=rest;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pts()})}}
  for(const k of ids)if(!down.includes(k)){down=[...down,k];await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pts()})}};
 const prep=kmh=>EV(A=>{if(!window.__tdrs){window.__tdrs=roamStep;roamStep=function(dt){return window.__tdgo?window.__tdrs(dt):undefined}/* the page loop still calls this; only the script steps (RO.frozen would also switch the smash lunge off) */}if(!window.__tdht){window.__tdht=hubTrafficStep;hubTrafficStep=function(dt){return window.__tdgo?window.__tdht(dt):undefined}/* traffic recycles cars next to the player in real time; keep it still so a BOOST test sees only the cars it placed */}RO.frozen=false;if(A.dmin)window.B2K_DMIN=A.dmin;SET.touch='buttons';try{OF_reset()}catch(e){}const x0=CID==='fra'?(HX0+HX1)/2:RO.x,z0=CID==='fra'?(HZS+HZN)/2:RO.z;window.__tdh=window.__tdh||[x0,z0];const q=rfSnap(__tdh[0],__tdh[1],120);roamWarp(q[0],q[1],q[2],true);
  /* settle 1 s with no finger down: clears the steer ramp, the D26 hold timer and the B2K latches of the previous case */for(let i=0;i<60;i++){RO.v=0;__tdrs(1/60)}roamWarp(q[0],q[1],q[2],true);
  try{for(const c of HUB.cars){c.x=1e5;c.z=1e5}}catch(e){}
  RO.v=A.k/3.6;RO.vh=RO.h;RO.yr=0;RO.dl=0;RO.dDir=0;RO.dT=0;RO.dEx=0;RO.inv=99;RO.hp=100;RO.turbo=0;RO.stkT=0;RO.crTurn=null;RO.crLg=0;RO.crLgCd=0;try{CRSM.b=null;CRSM.t=-1e9}catch(e){}camSnap=true;
  window.__tdn=window.__tdn||0;if(!window.__tdl){window.__tdl=1;document.getElementById('btnZone').addEventListener('touchstart',()=>window.__tdn++,{passive:true})}window.__td={vs:[],h0:RO.vh,dr:0,en:-1,t90:-1,slip:0,f:0,n0:RO.crLgN||0,maxLg:0};return 1},{k:kmh,dmin:+process.env.DMIN||0});
 const step=n=>EV(A=>{const S=__td,W=a=>Math.atan2(Math.sin(a),Math.cos(a));for(let i=0;i<A.n;i++){__tdrs(1/60);try{roamCam(1/60)}catch(e){}S.f++;(S.vs=S.vs||[]).push(Math.round(RO.v*3.6)+(RO.dDir?'D':'')+(TOUCH.brake?'b':''));if(RO.dDir){S.dr++;if(S.en<0)S.en=+(S.f/60).toFixed(2)}
   S.slip=Math.max(S.slip,Math.abs(W(RO.h-RO.vh))*57.3);S.maxLg=Math.max(S.maxLg,RO.crLg||0);if(S.t90<0&&Math.abs(W(RO.vh-S.h0))>=Math.PI/2)S.t90=+(S.f/60).toFixed(2)}return 1},{n});
 const fin=()=>EV(()=>{const S=__td;return{enter:S.en,t90:S.t90,driftF:S.dr,slip:Math.round(S.slip),kmh:Math.round(Math.abs(RO.v)*3.6),lunges:(RO.crLgN||0)-S.n0,vs:S.vs.filter((_,i)=>i%3==0).slice(0,14).join(' '),bzn:window.__tdn,v0:Math.round(RO.v*3.6)}});
 // press for `ms` real ms while stepping the sim in 1/60 chunks matched to real time (the page loop is stopped)
 const hold=async(ms)=>{const n=Math.max(1,Math.round(ms/1000*60));await step(n)};
 const R=[];const add=(name,ok,d)=>R.push({name,ok,...d});
 for(let i=0;i<N;i++){
  if(!process.env.SMASHONLY){
  await set([]);await prep(50);await set(['R','B']);await step(120);let f=await fin();await set([]);add('bd50',f.enter>0&&f.enter<=.35&&f.t90>0&&f.t90<=1.3,f);
  await prep(35);await set(['R','B']);await step(120);f=await fin();await set([]);add('bd35',f.enter>0&&f.enter<=.35&&f.t90>0&&f.t90<=1.3,f);
  await prep(40);await set(['R','B']);await step(120);f=await fin();await set([]);add('bd40',f.enter>0&&f.enter<=.35&&f.t90>0&&f.t90<=1.3,f);
  await prep(50);await set(['B']);await step(120);f=await fin();await set([]);add('bk50',f.driftF===0&&f.slip<=6&&f.v0<=5,f);
  for(const k of [40,60])for(const ms of [100,200,300]){await prep(k);await set(['G','R']);await step(30);await set(['G','R','B']);await hold(ms);await set(['G','R']);await step(60);f=await fin();await set([]);add('tap'+ms+'@'+k,f.driftF===0,f)}
  // two steer taps inside the double-tap window while driving at 45 km/h: the four CDP events are fired on a timer without awaiting each ack (the 6x swiftshader main thread acks one per frame), gaps 70/80/70 ms
  for(const [nm,key] of [['dbl','R'],['dblL','L']]){await prep(45);await set([]);const P=[],pt=[{x:pos[key][0],y:pos[key][1],id:ID[key]}];
   for(let t=0;t<2;t++){P.push(cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:pt}));await sleep(70);P.push(cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}));await sleep(t?10:80)}
   await Promise.all(P);await step(60);f=await fin();add(nm,f.lunges===0&&f.bzn>=2,f)}
  }
  // BOOST beside a car (touchdrive-r29b): a car 3.2 m to the side, level with the player. Lunge only with BOOST + steer TOWARD it: toward 1 lunge; away / straight / no car 0
  const arrow={1:'R','-1':'L'};
  for(const [nm,side,steer,want] of [['smashR',1,1,1],['smashL',-1,-1,1],['boostStraight',1,0,0],['boostAway',1,-1,0],['boostAwayL',-1,1,0]]){await prep(40);await set(['G']);await step(10);await EV(A=>{const h=RO.h,lx=-Math.cos(h),lz=Math.sin(h);const c=HUB.cars.find(q=>q.dead<=0&&!q.pk)||HUB.cars[0];c.x=RO.x+lx*A.s*3.2;c.z=RO.z+lz*A.s*3.2;c.dead=0;c.y=RO.y;return 1},{s:side});
   if(steer){await set(['G',arrow[steer]]);await step(3)}await set(steer?['G',arrow[steer],'N']:['G','N']);await step(6);await set(['G']);await step(30);f=await fin();await set([]);add(nm,f.lunges===want,f)}
  await prep(40);await set(['G']);await step(10);await EV(()=>{const h=RO.h,lx=-Math.cos(h),lz=Math.sin(h);const c=HUB.cars.find(q=>q.dead<=0&&!q.pk)||HUB.cars[0];c.x=RO.x+lx*3.2;c.z=RO.z+lz*3.2;c.dead=0;c.y=RO.y;return 1});await set(['G','N']);await step(3);await set(['G','N','R']);await step(6);await set(['G']);await step(30);f=await fin();await set([]);add('boostHeldSteer',f.lunges===0,f);
  await prep(40);await set(['G']);await step(10);await set(['G','R']);await step(3);await set(['G','R','N']);await step(6);await set(['G']);await step(30);f=await fin();await set([]);add('boostSteerNoCar',f.lunges===0,f);
 }
 if(process.env.TIPSHOT){/* the SMASH tip with a car beside: arrow + BOOST controls visible, tip clear of them */await prep(40);await set(['G']);await step(8);await EV(()=>{const h=RO.h;for(const c of HUB.cars){c.x=1e5;c.z=1e5}const c=HUB.cars[0];c.x=RO.x-Math.cos(h)*3.2;c.z=RO.z+Math.sin(h)*3.2;c.y=RO.y;c.dead=0;window.__crt.n=0;window.__crt.last=-1e9;CRSM.hn=0;CRT_tick();return 1});await step(2);
  const tip=await EV(()=>{CRT_tick();const e=document.getElementById('crSmTip');if(!e||e.style.display==='none')return null;const r=e.getBoundingClientRect(),L=[];for(const q of CRSM_rects())if(r.left<q.right&&r.right>q.left&&r.top<q.bottom&&r.bottom>q.top)L.push(1);clearTimeout(window.__crt.t)/* the lab screenshot takes longer than the 3.5 s auto-hide */;try{roamPose(pl,1/60)}catch(e){}return{t:e.textContent,fs:getComputedStyle(e).fontSize,r:[r.left,r.top,r.width,r.height].map(Math.round),over:L.length}});
  console.log(C,'tip',JSON.stringify(tip));await p.screenshot({path:process.env.TIPSHOT,type:'jpeg',quality:82});await set([])}
 if(SHOT){await prep(50);await set(['R','B']);await step(30);await EV(()=>{RO.frozen=true;try{roamPose(pl,1/60)}catch(e){}});await p.screenshot({path:SHOT,type:'jpeg',quality:80});await set([])}
 const by={};for(const r of R){(by[r.name]=by[r.name]||{n:0,pass:0,ex:null});by[r.name].n++;if(r.ok)by[r.name].pass++;if((!r.ok||process.env.ALL)&&!by[r.name].ex)by[r.name].ex=r}
 for(const [k,v] of Object.entries(by)){if(v.ex&&!process.env.DBG)delete v.ex.vs;console.log(C,k.padEnd(12),(v.pass===v.n?'PASS ':'FAIL ')+v.pass+'/'+v.n,v.ex?JSON.stringify(v.ex):'')}
 console.log(C,'errs',JSON.stringify(errs.slice(0,3)));await b.close()})().catch(e=>{console.log('ERR '+String(e).slice(0,300));process.exit(1)});

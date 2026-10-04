// tOB: owner-bug checks. 1) 3-min open-road drives (Frankfurt + Athens A/B) log every burst with its cause: 0 without a real-hit cause.
// 2) € sculpture bbox ≈14 m + screenshot. 3) road audit per city/district. (tHop.js + smoke.js run separately.)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const F=require('./fast.js');const fs=require('fs');
const U='http://127.0.0.1:8766/'+(process.env.PAGE||'local_dbg.html');const ONLY=(process.env.ONLY||'burst,euro,roads').split(',');
let fails=0;const ok=(c,m,i)=>{console.log((c?'PASS ':'FAIL ')+m+(i!==undefined?' · '+JSON.stringify(i):''));if(!c)fails++};
// causes that are real hits / pickups / real vehicle switches (function that fired the burst)
const REAL=new Set(['roamWreck','smashCheck','M1_hitGoon','M1_takedown','hubTrafficStep','trafficHit','OB_switchBurst','FL_burst','roamStep','chStep','qvStep','M2_step','M1_step','spHit','vehMode','hitShip','studGain','OG_pick','OG_boom']);
const seed=(p,c,d)=>p.evaluate(([c,d,OFF])=>{localStorage.clear();if(OFF)localStorage.setItem('ob_off','1');localStorage.setItem('mho_slot','1');localStorage.setItem('mho_city@1',c);if(d)localStorage.setItem('mho_athd@1',d);const k=c==='ath'?'.ath':'';localStorage.setItem('mho_roam'+k+'@1','{"tut":1,"otg":{}}');if(c==='ath')localStorage.setItem('mho_story.ath@1','{"seen":1}')},[c,d,!!process.env.OB_OFF]).then(()=>p.reload()).then(()=>p.waitForFunction(()=>window.__mho&&__mho.state==='menu'));
async function open(b,c,d,vp){const p=await (await b.newContext({viewport:vp||{width:960,height:540}})).newPage();p.setDefaultTimeout(900000);p.errs=[];p.on('pageerror',e=>p.errs.push(e.message.slice(0,160)));
 await p.goto(U);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');await seed(p,c,d);await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam',null,{polling:500});await F.on(p);
 await p.evaluate(()=>{try{__mho.storyClose()}catch(e){}try{window.__m1&&__m1.skip&&__m1.skip()}catch(e){}});await p.evaluate(()=>__mho.roamSim(30));return p}
// open-road GPS bot: chains random long routes for `sec` seconds of sim time at ~50 km/h; logs bursts + their causes
const drive3=(p,sec,seed0)=>p.evaluate(([sec,seed0])=>{const M=__mho,R=M.RO,K=M.K;let s=seed0;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;__ob.logOn();const T=sec*60;let t=0,dist=0,routes=0,px=R.x,pz=R.z,cars=0;
 while(t<T){const q0=M.rsnap(R.x,R.z,400);const a=rnd()*6.28,q1=M.rsnap(q0[0]+Math.sin(a)*900,q0[1]+Math.cos(a)*900,400);const P=M.qv.path(q0[0],q0[1],q1[0],q1[1]).P;if(!P||P.length<5){M.warp(q1[0],q1[1],a);M.roamSim(3);t+=3;continue}
  if(Math.hypot(P[0][0]-R.x,P[0][1]-R.z)>15){M.warp(P[0][0],P[0][1],Math.atan2(P[2][0]-P[0][0],P[2][1]-P[0][1]));M.roamSim(3);t+=3}routes++;const cum=[0];for(let k=1;k<P.length;k++)cum.push(cum[k-1]+Math.hypot(P[k][0]-P[k-1][0],P[k][1]-P[k-1][1]));let i=0,st=0;
  for(;t<T;t++){let bj=i,bd=1e9;for(let k=i;k<Math.min(P.length,i+60);k++){const d=Math.hypot(P[k][0]-R.x,P[k][1]-R.z);if(d<bd){bd=d;bj=k}}i=bj;let k=i;while(k<P.length-1&&cum[k]-cum[i]<9+Math.abs(R.v)*.35)k++;
   let an=Math.atan2(P[k][0]-R.x,P[k][1]-R.z)-R.h;an=Math.atan2(Math.sin(an),Math.cos(an));const vt=14*Math.max(.45,1-Math.abs(an)*.9);K.ArrowLeft=an>.035;K.ArrowRight=an<-.035;K.ArrowUp=R.v<vt;K.ArrowDown=R.v>vt+5;M.roamSim(1);
   dist+=Math.hypot(R.x-px,R.z-pz);px=R.x;pz=R.z;if(Math.abs(R.v)<1.5)st++;else st=0;if(i>=P.length-3||st>240||bd>40)break}}
 K.ArrowLeft=K.ArrowRight=K.ArrowUp=K.ArrowDown=false;const B=__ob.B;const nr=__ob.near();return{sec,miss:nr.cars,pmiss:nr.props,dist:Math.round(dist),routes,n:B.log.length,log:B.log.slice(),sw:B.sw.slice()}},[sec,seed0]);
// kerb weave: drive 25 s along a street while weaving between the lane, the kerb, the pavement and the verge (road edge −1 m … +7 m):
// the auto vehicle switch must not fire (pavement and verges are not off-road)
const weave=p=>p.evaluate(()=>{const M=__mho,R=M.RO,res=[];const ox=R.x,oz=R.z;
 for(let tr=0;tr<8&&res.length<3;tr++){const a=tr*2.3,q0=M.rsnap(ox+Math.sin(a)*250*tr,oz+Math.cos(a)*250*tr,600),q1=M.rsnap(q0[0]+Math.sin(a+1)*600,q0[1]+Math.cos(a+1)*600,600);const P=M.qv.path(q0[0],q0[1],q1[0],q1[1]).P;if(!P||P.length<4)continue;
  const cum=[0];for(let k=1;k<P.length;k++)cum.push(cum[k-1]+Math.hypot(P[k][0]-P[k-1][0],P[k][1]-P[k-1][1]));const Ltot=cum[cum.length-1];if(Ltot<250)continue;
  const at=d=>{let k=0;while(k<P.length-2&&cum[k+1]<d)k++;const L=cum[k+1]-cum[k]||1,f=(d-cum[k])/L,ux=(P[k+1][0]-P[k][0])/L,uz=(P[k+1][1]-P[k][1])/L;return[P[k][0]+ux*(d-cum[k]),P[k][1]+uz*(d-cum[k]),ux,uz]};
  const s0=at(10);M.warp(s0[0],s0[1],Math.atan2(s0[2],s0[3]));M.roamSim(40);const FL=__ob.FL;let flips=0,pv=FL.v,first=null,minHw=99,maxHw=0;
  for(let f=0;f<25*60;f++){const d=10+f/60*14;if(d>Ltot-20)break;const[cx,cz,ux,uz]=at(d);const hw=__ob.halfW(cx,cz);minHw=Math.min(minHw,hw);maxHw=Math.max(maxHw,hw);const lat=hw+3-4*Math.cos(f/60*2.2);
   R.x=cx-uz*lat;R.z=cz+ux*lat;R.h=R.vh=Math.atan2(ux,uz);R.v=14;M.roamSim(1);if(FL.v!==pv){flips++;pv=FL.v;if(!first)first={f,x:Math.round(R.x),z:Math.round(R.z),hw,lat:+lat.toFixed(1),s:FL.s,raw:FL.lastSurf}}}
  res.push({len:Math.round(Ltot),hw:[minHw,maxHw],flips,first})}return res});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 if(ONLY.includes('burst'))for(const[c,d]of(process.env.CITIES||'fra,ath:A,ath:B').split(',').map(x=>x.split(':'))){const p=await open(b,c,d);const r=await drive3(p,+(process.env.SEC||180),7);const tag=c+(d?' '+d:'');
  const by={};for(const e of r.log){const k=e.k+':'+e.w;by[k]=(by[k]||0)+1}const unc=r.log.filter(e=>!REAL.has(e.w)||((e.w==='smashCheck'||e.w==='hubTrafficStep')&&!e.hit));
  console.log('INFO',tag,`drove ${r.dist} m on ${r.routes} routes in ${r.sec} s; bursts ${r.n}`,JSON.stringify(by),'switches',r.sw.length,'near-passes that no longer count as hits: cars',r.miss,'props',r.pmiss,JSON.stringify(r.sw.slice(0,8)));
  if(unc.length)console.log('INFO uncaused',JSON.stringify(unc.slice(0,12)));if(process.env.DETAIL)console.log('DETAIL',JSON.stringify(r.log.filter(e=>e.k==='debris'||e.w!=='smashCheck').slice(0,60)));
  ok(r.dist>1000,`${tag}: 3-min open-road drive covers ground`,r.dist);ok(unc.length===0,`${tag}: 0 bursts without a real-hit cause`,unc.length);
  ok(r.sw.length<=6,`${tag}: vehicle transform bursts only on real switches (≤6 in 3 min)`,r.sw.length);
  const wv=await weave(p);console.log('INFO weave',tag,JSON.stringify(wv));ok(wv.length>0&&wv.every(q=>q.flips===0),`${tag}: weaving lane ↔ kerb ↔ pavement ↔ verge never switches the vehicle`,wv.map(q=>q.flips));
  ok(!p.errs.length,`${tag}: no page errors`,p.errs.slice(0,2));await p.context().close()}

 if(ONLY.includes('euro')){const p=await open(b,'fra');const e=await p.evaluate(()=>window.__ob&&__ob.euro&&__ob.euro());console.log('INFO euro',JSON.stringify(e));
  ok(!!e,'€ sculpture exists (Willy-Brandt-Platz)');if(e){const h=e.size[1];ok(h>13&&h<15,`€ sculpture is about 14 m tall`,e.size);ok((e.extraDrawCalls??e.drawCalls)<=1,'€ sculpture is merged geometry',e)}
  if(!process.env.NOSHOT)console.log('INFO € screenshot: node tOB_euro.js → shots/ob_euro_after.jpg');await p.context().close()}
 if(ONLY.includes('roads')){const r=require('child_process').spawnSync('node',['tOB_roads.js'],{stdio:'inherit',env:{...process.env,NOSHOT:process.env.NOSHOT||'1'}});ok(r.status===0,'road audit (tOB_roads.js): all cities/districts meet the targets')}
 console.log(fails?`FAILED ${fails}`:'ALL PASS');await b.close();process.exit(fails?1:0)})();

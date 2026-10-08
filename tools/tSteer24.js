// tSteer24.js: steering stability through real junction turns and bends (drive24). A human-like driver (0.15 s perception lag,
// pure-pursuit look-ahead, digital ◀/▶ with hysteresis like a thumb or a key, slows for corners like a person) drives fixed street
// routes (qa24/steer_routes_<city>.json, made once, the same for every build) at a target cruise speed, with real touch (touch events on #tL/#tR/
// #tG/#tB) or real keys. After every route turn ≥ 30° it measures: heading-error sign flips beyond ±3° in the 3 s after the exit (oscillation),
// counter-yaw overshoot in the first 1.5 s (deg/s), time to settle (|heading error to the road| < 4° held 0.5 s), plus wall hits/min and lane
// departures (car centre off the paved road). Also an open-loop pulse test on a straight (steer 0.35 s, release): yaw-rate sign flips + settle.
// usage: node tools/tSteer24.js <url> <out.json>   env CITY=fra|ath INPUT=key|touch FPS=60|30 SPEEDS=60,80,100,110 TUNE='{"TUNE.x":1}' MAKE=1 (write routes)
const fs=require('fs');const path=require('path');const{chromium,boot,turns,resample}=require('./d24lib');
const URL=process.argv[2],OUT=process.argv[3]||'qa24/steer.json',CITY=process.env.CITY||'fra',INPUT=process.env.INPUT||'key',FPS=+(process.env.FPS||60);
const SPEEDS=(process.env.SPEEDS||'60,80,100,110').split(',').map(Number),RF=`qa24/steer_routes_${CITY}.json`;
const ad=a=>Math.atan2(Math.sin(a),Math.cos(a));
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const tv=Object.assign({'TUNE.traf':.1},process.env.TUNE?JSON.parse(process.env.TUNE):{});
 const ctxHook=async ctx=>{await ctx.route('**/tune.json',r=>r.fulfill({contentType:'application/json',body:JSON.stringify({v:99,note:'tSteer24',values:tv})}))};
 const B0=b.newContext.bind(b);b.newContext=async o=>{const c=await B0(o);await ctxHook(c);return c};
 const{p,errs,shot}=await boot(b,{city:CITY,fps:FPS,url:URL,phone:INPUT==='touch'});
 await p.evaluate(()=>__g9ev(`try{if(RO.ch)chAbort()}catch(e){}try{M1.auto=0}catch(e){}`));await p.evaluate(()=>__tick(30));
 // ---- routes: made once (MAKE=1 or missing file): 12 street routes 500-900 m with ≥ 2 turns, from a seeded set of start nodes
 let routes;if(!process.env.MAKE&&fs.existsSync(RF))routes=JSON.parse(fs.readFileSync(RF,'utf8'));else{
  routes=await p.evaluate(()=>__g9ev(`(()=>{const G=qvGraph(),rng=mul(777),out=[];const pick=()=>{for(;;){const i=G.list[Math.floor(rng()*G.list.length)];if(G.K&&G.K[i]!==1&&rng()<.8)continue;const x=G.X[i],z=G.Z[i];if(!inRiver(x,z,-3)&&!roamHit(x,z,4))return{x,z}}};
   for(let t=0;t<400&&out.length<12;t++){const a=pick(),c=pick(),d=Math.hypot(c.x-a.x,c.z-a.z);if(d<450||d>800)continue;const P=qvPath(a.x,a.z,c.x,c.z);const L=qvCum(P).slice(-1)[0];if(L<500||L>1100||P.length<3)continue;out.push(P.map(q=>[+q[0].toFixed(1),+q[1].toFixed(1)]))}return out})()`));
  routes=routes.filter(P=>turns(P).turns.filter(t=>Math.abs(t.ang)>=30).length>=2).slice(0,8);fs.mkdirSync('qa24',{recursive:true});fs.writeFileSync(RF,JSON.stringify(routes))}
 // ---- the driver runs in the page between frames (one evaluate per route): real DOM key events (keydown/keyup on window, e.code) or
 // real touch events on the on-screen buttons (#tL/#tR via #btnZone, #tG, #tB), dispatched exactly where a finger lands
 await p.evaluate(([touch,FPS])=>{window.__S=[];const M=__mho;
  window.__mon=()=>{const R=M.RO;if(M.state!=='roam')return;let off=0;try{off=M.cid()==='ath'?((M.athRoad(R.x,R.z,48)||{e:9}).e>0?1:0):(M.roadD(R.x,R.z)>0?1:0)}catch(e){}__S.push([R.x,R.z,R.h,R.v,R.yr||0,off,M.K.ArrowDown||(M.touch&&M.touch.brake)?1:0,R.vh??R.h,R.d24s||0,R.dl||0,R.camH??R.h,R.camL??R.h,(window.__dbg&&__dbg.camera?(f=>Math.atan2(f.x,f.z))(new __dbg.THREE.Vector3(0,0,-1).applyQuaternion(__dbg.camera.quaternion)):0)])};
  const kd=(c,on)=>dispatchEvent(new KeyboardEvent(on?'keydown':'keyup',{code:c,key:c,bubbles:true}));const F={};let tid=1;
  const tEl=s=>document.querySelector(s),tc=s=>{const r=tEl(s).getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]};
  const tch=(name,sel,on)=>{if(on){const[x,y]=tc(sel),t0=document.elementFromPoint(x,y)||tEl(sel);const T=new Touch({identifier:tid++,target:t0,clientX:x,clientY:y,radiusX:6,radiusY:6,force:1});F[name]=T;
     t0.dispatchEvent(new TouchEvent('touchstart',{changedTouches:[T],touches:Object.values(F),targetTouches:[T],bubbles:true,cancelable:true}))}
   else{const T=F[name];if(!T)return;delete F[name];T.target.dispatchEvent(new TouchEvent('touchend',{changedTouches:[T],touches:Object.values(F),targetTouches:[],bubbles:true,cancelable:true}))}};
  const cur={steer:0,gas:false,brake:false};
  window.__d24apply=c=>{if(touch){if(c.gas!==cur.gas)tch('gas','#tG',c.gas);if(c.brake!==cur.brake)tch('brk','#tB',c.brake);if(c.steer!==cur.steer){if(cur.steer)tch('st',cur.steer<0?'#tL':'#tR',false);if(c.steer)tch('st',c.steer<0?'#tL':'#tR',true)}}
   else{if(c.gas!==cur.gas)kd('ArrowUp',c.gas);if(c.brake!==cur.brake)kd('ArrowDown',c.brake);if(c.steer!==cur.steer){if(cur.steer)kd(cur.steer<0?'ArrowLeft':'ArrowRight',false);if(c.steer)kd(c.steer<0?'ArrowLeft':'ArrowRight',true)}}Object.assign(cur,c)};
  const ad=a=>Math.atan2(Math.sin(a),Math.cos(a)),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  // human driver on route P (2 m resampled) with turns T: 0.15 s perception lag, look-ahead 10 + 0.7 v m, steers by rotation rate (see below),
  // slows to 50 / 65 / 80 km/h for turns ≥ 80° / 50° / 30° seen 25 + 1.2 v m ahead
  window.__d24drive=(P,T,V,maxF)=>{const DT=1/FPS,step=Math.max(1,Math.round(.05/DT)),lag=Math.max(1,Math.round(.15/(DT*step)));const R=M.RO,hist=[];let st=0,bi=0,brkT=0,f=0;
   while(f<maxF){hist.push([R.x,R.z,R.h,R.v,R.yr||0]);const o=hist[Math.max(0,hist.length-1-lag)];let bd=1e9;for(let k=Math.max(0,bi-10);k<Math.min(P.length,bi+60);k++){const d=Math.hypot(P[k][0]-o[0],P[k][1]-o[1]);if(d<bd){bd=d;bi=k}}if(bi>=P.length-4)break;
    const v=Math.max(0,o[3]),Ld=10+.7*v,ka=Math.min(P.length-1,bi+Math.round(Ld/2));const e=ad(Math.atan2(P[ka][0]-o[0],P[ka][1]-o[1])-o[2]);
    // a person steers by how fast the view turns: wanted rotation = 1.8 × aim error (rad/s, ≤ 1.2); press while turning too slowly that
    // way, let go when it turns fast enough (a 4° dead zone straight ahead)
    const want=Math.abs(e)<.07&&Math.abs(o[4])<.1?0:clamp(1.8*e,-1.2,1.2),need=want-o[4];st=need>.08?-1:need<-.08?1:0;
    let vd=V/3.6;const sNow=bi*2;for(const t of T){const dd=t.s-sNow;if(dd>-10&&dd<25+1.2*v){const a=Math.abs(t.ang);vd=Math.min(vd,a>=80?50/3.6:a>=50?65/3.6:a>=30?80/3.6:vd)}}
    let gas=v<vd-.5,brake=false;if(v>vd+2.5||brkT>0){brake=v>vd+.5;gas=false;brkT=brake?Math.max(brkT,6):brkT-1}
    __d24apply({steer:st,gas,brake});__tick(step);f+=step}__d24apply({steer:0,gas:false,brake:false});return f}},[INPUT==="touch",FPS]);
 const touch=INPUT==="touch";const DT=1/FPS;const res={city:CITY,input:INPUT,fps:FPS,runs:[],pulse:[]};
 const W=async n=>p.evaluate(n=>__tick(n),n);const rel=()=>p.evaluate(()=>__d24apply({steer:0,gas:false,brake:false}));const apply=c=>p.evaluate(c=>__d24apply(c),c);
 for(const V of SPEEDS){for(let ri=0;ri<routes.length;ri++){const P=resample(routes[ri],2),T=turns(routes[ri]).turns.filter(t=>Math.abs(t.ang)>=30);
   const h0=Math.atan2(P[3][0]-P[0][0],P[3][1]-P[0][1]);await rel();await p.evaluate(([x,z,h])=>{__mho.warp(x,z,h,true);const R=__mho.RO;R.v=0;R.yr=0;R.vh=h;R.h=h},[P[0][0],P[0][1],h0]);await W(20);
   await p.evaluate(()=>{__S.length=0});const maxF=Math.round((P.length*2/(V/3.6)*2.2+20)*FPS);await p.evaluate(([P,T,V,m])=>__d24drive(P,T,V,m),[P,T,V,maxF]);await W(5);const S=await p.evaluate(()=>__S.slice());if(process.env.DUMP&&ri===+process.env.DUMP)fs.writeFileSync(OUT.replace('.json','_dump.json'),JSON.stringify({P,T,S}));
   // ---- metrics on the log
   const head=k=>{const a=P[Math.max(0,k-1)],c=P[Math.min(P.length-1,k+1)];return Math.atan2(c[0]-a[0],c[1]-a[1])};let j=0;const pr=S.map(q=>{let bd=1e9;for(let k=Math.max(0,j-10);k<Math.min(P.length,j+40);k++){const d=Math.hypot(P[k][0]-q[0],P[k][1]-q[1]);if(d<bd){bd=d;j=k}}return{k:j,e:ad(q[2]-head(j)),d:bd}});
   const turnsM=[];for(const t of T){const kx=Math.round((t.s+15)/2);const i0=pr.findIndex(q=>q.k>=kx);if(i0<0)continue;const n3=Math.min(S.length,i0+3*FPS);let flips=0,sg=0,over=0;const dir=Math.sign(t.ang);
     for(let i=i0;i<n3;i++){const e=pr[i].e;if(Math.abs(e)>.052){const g=Math.sign(e);if(sg&&g!==sg)flips++;sg=g}const yr=S[i][4];if(i<i0+1.5*FPS&&Math.sign(yr)===-dir)over=Math.max(over,Math.abs(yr))}
     let set=4;for(let i=i0;i<Math.min(S.length,i0+4*FPS);i++){let ok=true;for(let k=i;k<Math.min(S.length,i+Math.round(.5*FPS));k++)if(Math.abs(pr[k].e)>.07){ok=false;break}if(ok){set=(i-i0)*DT;break}}
     turnsM.push({ang:t.ang,v:+(Math.abs(S[i0][3])*3.6).toFixed(0),flips,over:+(over*57.3).toFixed(1),settle:+set.toFixed(2)})}
   // hits (speed drop > 25 % in 6 frames from > 6 m/s, not braking, near a collider) and lane departures (entries off the road)
   let hits=0,lh=-99,dep=0,offF=0;for(let i=6;i<S.length;i++){const v=Math.abs(S[i][3]),vm=Math.max(...S.slice(i-6,i).map(q=>Math.abs(q[3])));if(!S[i][6]&&vm>6&&v<vm*.75&&i-lh>36){lh=i;hits++}if(S[i][5]&&!S[i-1][5])dep++;offF+=S[i][5]}
   // yaw-rate sign flips per km on straight bits (no route turn within 40 m)
   let yf=0,ysg=0,km=0;for(let i=1;i<S.length;i++){const s2=pr[i].k*2;if(T.some(t=>Math.abs(t.s-s2)<40))continue;km+=Math.hypot(S[i][0]-S[i-1][0],S[i][1]-S[i-1][1])/1000;const y=S[i][4];if(Math.abs(y)>.05){const g=Math.sign(y);if(ysg&&g!==ysg)yf++;ysg=g}}
   const min=S.length*DT/60;res.runs.push({V,route:ri,sec:+(S.length*DT).toFixed(1),done:pr.length?pr[pr.length-1].k>=P.length-6:false,turns:turnsM,hits,hitsPerMin:+(hits/min).toFixed(2),dep,offPct:+(100*offF/Math.max(1,S.length)).toFixed(1),yawFlipsPerKmStraight:+(yf/Math.max(.05,km)).toFixed(1)});
   console.log(V,ri,JSON.stringify(res.runs[res.runs.length-1]).slice(0,400))}
  // ---- open-loop pulse on the longest straight of route 0: reach V, steer 0.35 s, release, log 2.5 s
  {const P=resample(routes[0],2);const h0=Math.atan2(P[3][0]-P[0][0],P[3][1]-P[0][1]);await rel();await p.evaluate(([x,z,h,v])=>{__mho.warp(x,z,h,true);const R=__mho.RO;R.v=v;R.vh=h;R.yr=0;__S.length=0},[P[0][0],P[0][1],h0,V/3.6]);
   for(let i=0;i<Math.round(.5*FPS);i++){await apply({steer:0,gas:true,brake:false});await W(1)}await p.evaluate(()=>{__S.length=0});await apply({steer:1,gas:true,brake:false});await W(Math.round(.35*FPS));await apply({steer:0,gas:true,brake:false});
   const i0=await p.evaluate(()=>__S.length);await W(Math.round(2.5*FPS));await rel();const S=await p.evaluate(()=>__S.slice());let fl=0,sg=0,pk=0,ov=0;for(let i=0;i<S.length;i++){const y=S[i][4];if(i<i0)pk=Math.max(pk,Math.abs(y));else{if(Math.abs(y)>.03){const g=Math.sign(y);if(sg&&g!==sg)fl++;sg=g}if(Math.sign(y)!==Math.sign(S[i0-1][4]))ov=Math.max(ov,Math.abs(y))}}
   let set=2.5;for(let i=i0;i<S.length;i++){if(S.slice(i).every(q=>Math.abs(q[4])<.03)){set=(i-i0)*DT;break}}res.pulse.push({V,vAt:+(Math.abs(S[i0][3])*3.6).toFixed(0),peakYaw:+(pk*57.3).toFixed(1),flips:fl,overshoot:+(ov*57.3).toFixed(1),settle:+set.toFixed(2)});console.log('pulse',JSON.stringify(res.pulse[res.pulse.length-1]))}}
 // ---- time to a 90° turn at 50 km/h (drive24b): cruise at 50 km/h on route 0's start, then hold ◀ (or ▶) with gas held to keep ~50, until the
 // heading has changed 90°; both sides, the mean is reported (must not get slower than live)
 res.t90=[];for(const sd of[-1,1]){const P=resample(routes[0],2);const h0=Math.atan2(P[3][0]-P[0][0],P[3][1]-P[0][1]);await rel();await p.evaluate(([x,z,h])=>{__mho.warp(x,z,h,true);const R=__mho.RO;R.v=50/3.6;R.vh=h;R.yr=0},[P[0][0],P[0][1],h0]);
  for(let i=0;i<Math.round(.3*FPS);i++){await apply({steer:0,gas:true,brake:false});await W(1)}
  const r=await p.evaluate(([sd,FPS])=>{const R=__mho.RO,h0=R.h;let n=0;const ad=a=>Math.atan2(Math.sin(a),Math.cos(a));while(n<5*FPS&&Math.abs(ad(R.h-h0))<Math.PI/2){__d24apply({steer:sd,gas:R.v<50/3.6,brake:false});__tick(1);n++}const v=R.v*3.6;__d24apply({steer:0,gas:false,brake:false});return{t:n/FPS,v}},[sd,FPS]);res.t90.push(r)}
 console.log('t90',JSON.stringify(res.t90));
 // ---- summary
 const all=res.runs.flatMap(r=>r.turns),mins=res.runs.reduce((a,r)=>a+r.sec,0)/60;const avg=a=>a.length?+(a.reduce((x,y)=>x+y,0)/a.length).toFixed(2):null;const pct=(a,q)=>{a=a.slice().sort((x,y)=>x-y);return a.length?a[Math.floor((a.length-1)*q)]:null};
 res.sum={turns:all.length,flipsAvg:avg(all.map(t=>t.flips)),flipsP90:pct(all.map(t=>t.flips),.9),turnsWith2plusFlips:all.filter(t=>t.flips>=2).length,overAvgDeg:avg(all.map(t=>t.over)),settleAvg:avg(all.map(t=>t.settle)),settleP90:pct(all.map(t=>t.settle),.9),
  hitsPerMin:+(res.runs.reduce((a,r)=>a+r.hits,0)/mins).toFixed(2),depPerMin:+(res.runs.reduce((a,r)=>a+r.dep,0)/mins).toFixed(2),offPct:avg(res.runs.map(r=>r.offPct)),yawFlipsPerKmStraight:avg(res.runs.map(r=>r.yawFlipsPerKmStraight)),done:res.runs.filter(r=>r.done).length+'/'+res.runs.length,
  pulseFlips:avg(res.pulse.map(q=>q.flips)),pulseSettle:avg(res.pulse.map(q=>q.settle)),pulseOver:avg(res.pulse.map(q=>q.overshoot)),t90:avg(res.t90.map(q=>q.t)),errors:errs.length};
 fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,JSON.stringify(res,null,1));console.log('SUM',JSON.stringify(res.sum));if(errs.length)console.log('errors',errs.slice(0,4));await b.close()})();

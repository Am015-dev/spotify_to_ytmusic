// tJU: moment-to-moment feel metrics in free roam (Frankfurt + Athens A), before (JU off) vs after (JU on), same build.
// Real controls through the key map (__mho.K: arrows, Shift = boost, X = drift) and Space via the keyboard; deterministic 1/60 s frames
// (__ju.step = roamStep + roamCam, the frame loop is held so wall-clock frames don't add sim time). Fast mode: nothing drawn except screenshots.
// usage: node tJU.js            → both cities, off+on, metrics table + pass/fail vs targets (docs/juice_research.md)
//        CITY=fra MODE=on node tJU.js · SHOTS=1 adds before/after screenshots + the 10-frame takedown strip · PERF=1 adds heap/draw-call checks
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const F=require('./fast.js');
const U='http://127.0.0.1:8766/local_dbg.html',OUT='shots_ju';fs.mkdirSync(OUT,{recursive:true});
const CITIES=(process.env.CITY||'fra,ath').split(','),MODES=(process.env.MODE||'off,on').split(','),ROUTE_S=+(process.env.ROUTE_S||180),CALM_S=+(process.env.CALM_S||90);
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
async function open(b,city){const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();p.setDefaultTimeout(900000);p.errs=[];
 p.on('pageerror',e=>p.errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')p.errs.push('console: '+m.text().slice(0,200))});
 await p.goto(U);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');
 await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_city@1',c);if(c==='ath')localStorage.setItem('mho_athd@1','A');const k=c==='ath'?'.ath':'';localStorage.setItem('mho_roam'+k+'@1','{"tut":1,"otg":{}}');if(c==='ath')localStorage.setItem('mho_story.ath@1','{"seen":1}')},city);
 await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam',null,{polling:500});
 await F.on(p);await p.evaluate(()=>{try{__mho.storyClose()}catch(e){}try{window.__m1&&__m1.skip&&__m1.skip()}catch(e){}});await p.evaluate(()=>{__ju.hold(true);__ju.autoClose(true);__ju.step(30)});return p}
// in-page helpers: GPS paths and a keyboard bot that drives like a player (full throttle, brakes for corners, drifts the sharp ones, boosts on straights)
const LIB=`window.__jl={
 path(len,k){const M=__mho,R=M.RO;for(let t=0;t<12;t++){const a=(k+t)*2.399;const q0=M.rsnap(R.x,R.z,300),q1=M.rsnap(R.x+Math.sin(a)*len,R.z+Math.cos(a)*len,400);const P=M.qv.path(q0[0],q0[1],q1[0],q1[1]).P;if(P&&P.length>8){const c=[0];for(let i=1;i<P.length;i++)c.push(c[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));if(c[c.length-1]>len*.5)return{P,c}}}return null},
 keys(o){const K=__mho.K;K.ArrowUp=!!o.up;K.ArrowDown=!!o.dn;K.ArrowLeft=!!o.l;K.ArrowRight=!!o.r;K.ShiftLeft=!!o.b;K.KeyX=!!o.d},
 // angle from the car to the path point dist m ahead of path index i
 ang(Q,i,dist){const R=__mho.RO,{P,c}=Q;let k=i;while(k<P.length-1&&c[k]-c[i]<dist)k++;let a=Math.atan2(P[k][0]-R.x,P[k][1]-R.z)-R.h;return Math.atan2(Math.sin(a),Math.cos(a))},
 near(Q,i){const R=__mho.RO,P=Q.P;let bj=i,bd=1e9;for(let k=i;k<Math.min(P.length,i+60);k++){const d=Math.hypot(P[k][0]-R.x,P[k][1]-R.z);if(d<bd){bd=d;bj=k}}return bj},
 warpTo(Q){const M=__mho,P=Q.P;M.warp(P[0][0],P[0][1],Math.atan2(P[2][0]-P[0][0],P[2][1]-P[0][1]));__ju.step(3)},
 route(T,smp,calm){const R=__mho.RO,out=[],J=__ju;let Q=null,i=0,n=0,dist=0,px=R.x,pz=R.z,dr=0,drT=0,st=0,rev=0,k=0,boostF=0,driftN=0,frames=0;const hist=[];
  while(frames<T*60){if(!Q||i>=Q.P.length-4){Q=this.path(900,k++);i=0;if(!Q){this.keys({});J.step(1);frames++;continue}}
   i=this.near(Q,i);const v=Math.abs(R.v),a=this.ang(Q,i,9+v*.35),ca=Math.max(Math.abs(this.ang(Q,i,28)),Math.abs(this.ang(Q,i,45)));const car=J.car();
   const o={up:true};if(rev>0){rev-=1/60;o.up=false;o.dn=true;o.l=a<0;o.r=a>0}else{
    const vt=Math.max(16,(calm?30:90)*Math.max(.35,1-Math.abs(a)*1.1));if(v>vt+6&&!dr){o.up=false;o.dn=true}
    if(!calm&&!dr&&ca>.55&&v>24&&Math.abs(a)>.2){dr=Math.sign(a);drT=0;driftN++}
    if(dr){drT+=1/60;o.d=true;o.l=dr>0;o.r=dr<0;if((drT>.7&&Math.abs(a)<.15)||drT>3||v<20)dr=0}else{o.l=a>.035;o.r=a<-.035}
    o.b=!calm&&!dr&&car.bm>30&&Math.abs(a)<.12&&ca<.3}
   if(car.boosting)boostF++;this.keys(o);J.step(1);frames++;dist+=Math.min(5,Math.hypot(R.x-px,R.z-pz));px=R.x;pz=R.z;
   if(v<2&&!rev){st+=1/60;if(st>1.5){rev=.9;st=0}}else st=Math.max(0,st-1/60);if(rev<=0&&st===0&&frames%600===0&&hist.length&&Math.hypot(R.x-hist[0][0],R.z-hist[0][1])<15){Q=null}
   if(frames%60===0){hist.unshift([R.x,R.z]);hist.length=Math.min(hist.length,10)}
   if(smp&&frames%15===0)out.push({t:+(frames/60).toFixed(2),v:+v.toFixed(1),...J.cam(),la:+(J.JU.la*57.3).toFixed(1),b:car.boosting?1:0,d:car.dDir?1:0,top:car.top})}
  this.keys({});return{samples:out,boostUp:boostF/frames,drifts:driftN,dist:Math.round(dist)}},
 // straight-ish path, standstill → full throttle (steer only): time to 95 % of the plateau; then, fresh on the same path, a full boost bar from the plateau
 straight(skip=0){const L=[];for(let k=0;k<10;k++){const Q=this.path(800,40+k*3);if(!Q)continue;let tc=0;for(let i=2;i<Q.P.length-2;i++){if(Q.c[i]>500)break;const a1=Math.atan2(Q.P[i][0]-Q.P[i-1][0],Q.P[i][1]-Q.P[i-1][1]),a2=Math.atan2(Q.P[i+1][0]-Q.P[i][0],Q.P[i+1][1]-Q.P[i][1]);tc+=Math.abs(Math.atan2(Math.sin(a2-a1),Math.cos(a2-a1)))}L.push({Q,tc})}L.sort((a,b)=>a.tc-b.tc);return L[Math.min(skip,L.length-1)]||null},
 drive(Q,o,n,cb){const R=__mho.RO;let i=0,f=0;for(;f<n;f++){i=this.near(Q,i);const a=this.ang(Q,i,9+Math.abs(R.v)*.35);this.keys({...o,l:a>.035,r:a<-.035});__ju.step(1);if(cb)cb(f);if(i>=Q.P.length-4)break}this.keys({});return f},
 // standstill → full throttle (steer only) on the straightest paths: a run counts only if speed never drops > 12 % before the plateau (no crash); then a full boost bar
 accel(){const R=__mho.RO,J=__ju;let best=null;for(let s=0;s<5;s++){const B=this.straight(s);if(!B)break;const Q=B.Q;this.warpTo(Q);R.v=0;J.step(20);const vs=[];this.drive(Q,{up:1},12*60,()=>vs.push(R.v));
   let mx=0,drop=false,pl=0;for(const v of vs){if(v<mx*.88&&mx>15){drop=true;break}mx=Math.max(mx,v)}pl=mx;const t95=vs.findIndex(v=>v>=.95*pl)/60;const run={Q,B,pl,t95,clean:!drop,len:vs.length};if(!best||(run.clean&&!best.clean)||(run.clean===best.clean&&run.pl>best.pl))best=run;if(run.clean&&run.len>=11*60)break}
  const {Q,B,pl,t95}=best;this.warpTo(Q);R.v=pl*.97;J.setBm(100);J.step(1);const fov0=J.cam().fov;let fovB=fov0;const bv=[];this.drive(Q,{up:1,b:1},5*60,()=>{if(J.car().paused)return;bv.push(Math.abs(R.v));fovB=Math.max(fovB,J.cam().fov)});
  const bp=Math.max(...bv),tb=bv.findIndex(v=>v>=pl+.95*(bp-pl))/60,t25=bv.findIndex(v=>v>=pl*1.25)/60;return{plateau:+pl.toFixed(1),kmh:Math.round(pl*3.6),t95:+t95.toFixed(2),clean:best.clean,boostPeak:+bp.toFixed(1),boostMul:+(bp/pl).toFixed(2),tBoost95:+tb.toFixed(2),tBoost25:+t25.toFixed(2),fovCruise:fov0,fovBoost:+fovB.toFixed(1),straightness:+B.tc.toFixed(2)}},
 // drift held hard left at 30 m/s: time of each tier; then per tier, release just after it (retry on the next path if a wall cut the drift short)
 drift(){const R=__mho.RO,J=__ju;
  const run=(Q,hold)=>{this.warpTo(Q);R.v=30;J.setBm(0);J.step(2);let tiers=[null,null,null],turbo=0,end=0,bmPre=0,bmJump=0,relT=0;
   for(let f=0;f<(hold+1.2)*60;f++){const holding=f<hold*60;this.keys({up:1,d:holding,l:holding});if(holding)R.v=Math.max(R.v,26);if(!holding&&!end){bmPre=J.car().bm;relT=J.tier()}J.step(1);if(!holding&&!end)bmJump=J.car().bm-bmPre;const tr=J.tier();for(let q=0;q<3;q++)if(tr>q&&tiers[q]==null)tiers[q]=+(f/60).toFixed(2);if(!holding&&!end){end=1;turbo=J.car().turbo}}
   this.keys({});return{tiers,relT,bmGain:+bmJump.toFixed(1),turbo:+turbo.toFixed(2)}};
  let full=null,FQ=null;for(let s=0;s<5&&!full;s++){const B=this.straight(s);if(!B)break;const r=run(B.Q,3.4);if(r.tiers[2]!=null){full=r;FQ=B.Q}}if(!full)return{t:[null,null,null],pay:[null,null,null]};
  const pay=[];for(let q=0;q<3;q++){let got=null;for(let s=0;s<5&&!got;s++){const B=s?this.straight(s):{Q:FQ};if(!B)break;const r=run(B.Q,full.tiers[q]+.05);if(r.relT===q+1)got={bm:r.bmGain,turbo:r.turbo}}pay.push(got)}return{t:full.tiers,pay}},
 // takedown: line up behind a traffic car at 38 m/s and ram it; frame log for hit-stop, camera kick and shake
 takedown(log){const J=__ju;const at=J.aimTraffic(38);if(!at)return null;J.step(1);const fr=[];const s0=J.stats().k.chain||0;let hit=-1;
  for(let f=0;f<150;f++){this.keys({up:1});J.step(1);const c=J.car(),m=J.cam(),x=J.fx();fr.push({f,paused:c.paused?1:0,kick:+(J.JU.kick*5).toFixed(2),v:+c.v.toFixed(1),fov:m.fov,back:m.back,h:m.h,shake:+c.shake.toFixed(3),ca:+x.uCA.toFixed(4)});if(hit<0&&(J.stats().k.chain||0)>s0)hit=f;if(hit>=0&&f>hit+60)break}
  this.keys({});if(hit<0)return{hit:false};const W=fr.slice(hit,hit+40),hsF=(()=>{let n=0,i=W.findIndex(q=>q.paused);if(i<0)return 0;while(i<W.length&&W[i].paused){n++;i++}return n})(),fovMax=Math.max(...W.map(q=>q.fov)),fov0=fr[Math.max(0,hit-1)].fov;
  return{hit:true,hitFrame:hit,hitstopMs:Math.round(hsF/60*1000),fovKick:+Math.max(fovMax-fov0,...W.map(q=>q.kick)).toFixed(1),shakeMax:Math.max(...W.map(q=>q.shake)),caMax:Math.max(...W.map(q=>q.ca)),frames:log?fr.slice(Math.max(0,hit-2),hit+12):undefined}}
};`;
async function measure(p,mode,city){await p.evaluate(LIB);await p.evaluate(m=>__ju.on(m==='on'),mode);
 const acc=await p.evaluate(()=>__jl.accel());
 const dr=await p.evaluate(()=>__jl.drift());
 const td=await p.evaluate(()=>__jl.takedown(false));
 // air: Space hop on the route start, log air time and landing squash
 const air=await (async()=>{await p.evaluate(()=>{const Q=__jl.path(500,90);if(Q)__jl.warpTo(Q);__mho.RO.v=32;__ju.reset()});await p.keyboard.down('Space');await p.evaluate(()=>__ju.step(2));await p.keyboard.up('Space');
  return p.evaluate(()=>{const J=__ju;let air=0,sq=1,landF=-1,f=0;for(;f<150;f++){__jl.keys({up:1});J.step(1);const c=J.car();if(c.air)air++;else if(air&&landF<0)landF=f;sq=Math.min(sq,c.sq);if(landF>=0&&f>landF+40)break}return{airS:+(air/60).toFixed(2),squash:+(1-sq).toFixed(3),ev:J.stats().k}})})();
 const big=await p.evaluate(()=>{const J=__ju,R=__mho.RO;const Q=__jl.path(500,95);if(Q)__jl.warpTo(Q);R.v=30;J.step(5);J.reset();R.vy=17;R.y+=.2;let air=0,sq=1;for(let f=0;f<200;f++){__jl.keys({up:1});J.step(1);const c=J.car();if(c.air)air++;sq=Math.min(sq,c.sq)}__jl.keys({});const s=J.stats();return{airS:+(air/60).toFixed(2),squash:+(1-sq).toFixed(3),air:s.k.air||0,k:s.k}});
 // near miss: pass a traffic car at city speed 3.6 m to its side
 const nm=await p.evaluate(()=>{const J=__ju,R=__mho.RO,M=__mho;const cars=J.cars();for(const c of cars){for(const sd of[1,-1]){const fx=Math.sin(c.h),fz=Math.cos(c.h),ox=Math.cos(c.h)*6*sd,oz=-Math.sin(c.h)*6*sd;let clear=true;for(let d=-34;d<=30;d+=2){const x=c.x+fx*d+ox,z=c.z+fz*d+oz;if(M.roamHitAt(x,z,2.6,c.y)){clear=false;break}}if(!clear)continue;
   J.freezeCar(c.i);R.x=c.x-fx*30+ox;R.z=c.z-fz*30+oz;R.y=c.y;R.vy=0;R.h=R.vh=c.h;R.yr=0;R.v=30;J.step(1);J.reset();const hp0=J.car().hp;for(let f=0;f<130;f++){__jl.keys({up:1});R.h=R.vh=c.h;R.v=30;J.step(1)}__jl.keys({});J.freezeCar(-1);const s=J.stats();return{near:s.k.near||0,k:s.k,dmg:+(hp0-J.car().hp).toFixed(1),side:sd}}}return{near:0,k:{},dmg:0,none:1}});
 // 3-minute route
 await p.evaluate(()=>{const Q=__jl.path(900,1);if(Q)__jl.warpTo(Q);__ju.reset()});
 const rt=await p.evaluate(T=>{const r=__jl.route(T,true);return{...r,stats:__ju.stats()}},ROUTE_S);
 await p.evaluate(()=>{const Q=__jl.path(900,7);if(Q)__jl.warpTo(Q);__ju.reset()});
 const calm=await p.evaluate(T=>{const r=__jl.route(T,false,true);const s=__ju.stats();return{km:+(r.dist/1000).toFixed(2),secs:s.t,events:s.ev,moments:s.moments,perMin:+(s.moments/(s.t/60)).toFixed(1),deadMax:s.gap,kinds:s.k,smash:s.smash}},CALM_S);
 const S=rt.samples,sp=S.map(s=>s.v),vmax=Math.max(...sp),by=f=>S.filter(f),avg=a=>a.length?+(a.reduce((x,y)=>x+y,0)/a.length).toFixed(2):null;
 const cruise=by(s=>!s.b&&s.v>8&&s.v<vmax*.5),fast=by(s=>!s.b&&s.v>=vmax*.75),boosting=by(s=>s.b),turn=by(s=>s.d||Math.abs(s.yaw)>4);
 const cam={fovCruise:avg(cruise.map(s=>s.fov)),fovFast:avg(fast.map(s=>s.fov)),fovBoost:avg(boosting.map(s=>s.fov)),hCruise:avg(cruise.map(s=>s.h)),hFast:avg(fast.map(s=>s.h)),backCruise:avg(cruise.map(s=>s.back)),backFast:avg(fast.map(s=>s.back)),yawTurn:avg(turn.map(s=>Math.abs(s.yaw))),laTurn:avg(turn.map(s=>Math.abs(s.la))),fx:await p.evaluate(()=>__ju.fx())};
 const st=rt.stats,min=st.t/60;
 return{city,mode,accel:acc,drift:dr,takedown:td,air,bigAir:big,near:nm,route:{secs:st.t,events:st.ev,moments:st.moments,perMin:+(st.moments/min).toFixed(1),kinds:st.k,deadMax:st.gap,smash:st.smash,smashPerMin:+(st.smash/min).toFixed(1),studs:st.studs,boostUptime:+(rt.boostUp*100).toFixed(1),drifts:rt.drifts,km:+(rt.dist/1000).toFixed(2),vmax:+vmax.toFixed(1)},cam,calm,errs:p.errs.slice(0,4)}}
// before/after screenshots at speed + a 10-frame strip of a takedown with hit-stop (Frankfurt)
async function shots(b){const p=await open(b,'fra');await p.evaluate(LIB);
 const pose=async(mode,name)=>{await p.evaluate(m=>{__ju.on(m==='on');const B=__jl.straight();__jl.warpTo(B.Q);__mho.RO.v=48;__ju.setBm(100);__jl.drive(B.Q,{up:1},90);__jl.drive(B.Q,{up:1,b:1},70)},mode);await F.shot(p,`${OUT}/${name}.jpg`,{type:'jpeg',quality:75})};
 await pose('off','before_boost');await pose('on','after_boost');
 await p.evaluate(()=>{__ju.on(true);const B=__jl.straight();__jl.warpTo(B.Q);__mho.RO.v=30;__jl.drive(B.Q,{up:1,d:1,l:1},95)});await F.shot(p,`${OUT}/after_drift_tier2.jpg`,{type:'jpeg',quality:75});
 // takedown strip: run up to one frame before contact, then shoot 10 consecutive 1/60 s frames
 const pre=await p.evaluate(()=>{const J=__ju;J.on(true);let tries=0;while(tries++<6){const at=J.aimTraffic(38);if(!at)return null;J.step(1);const s0=J.stats().k.chain||0;for(let f=0;f<120;f++){const snap=J.car();__jl.keys({up:1});J.step(1);if((J.stats().k.chain||0)>s0)return{f,tries}}}return null});
 const strip=[];if(pre){for(let i=0;i<10;i++){const fn=`${OUT}/td_${i}.jpg`;await F.shot(p,fn,{type:'jpeg',quality:70});const c=await p.evaluate(()=>{const c=__ju.car(),m=__ju.cam();__ju.step(1);return{paused:c.paused,fov:m.fov,v:+c.v.toFixed(1)}});strip.push({fn,...c})}}
 const q=await (await b.newContext({viewport:{width:1700,height:420}})).newPage();
 await q.setContent(`<style>body{margin:0;background:#111;color:#fff;font:13px system-ui;display:flex;flex-wrap:wrap;gap:4px;padding:4px}figure{margin:0;width:336px}img{width:336px}figcaption{text-align:center}</style>`+strip.map((s,i)=>`<figure><img src="data:image/jpeg;base64,${fs.readFileSync(s.fn).toString('base64')}"><figcaption>frame ${i} · ${s.paused?'HIT-STOP':'run'} · fov ${s.fov.toFixed(1)}</figcaption></figure>`).join(''));
 await q.screenshot({path:`${OUT}/takedown_strip.jpg`,type:'jpeg',quality:80,fullPage:true});for(const s of strip)fs.unlinkSync(s.fn);
 ok(strip.length===10&&strip.some(s=>s.paused),`takedown strip: 10 frames, hit-stop frames ${strip.filter(s=>s.paused).length}`);ok(!p.errs.length,'shots: no page errors '+JSON.stringify(p.errs.slice(0,2)));await p.context().close()}
// perf: heap after GC every 20 s over 2 min of route driving (on vs off), draw calls at 6 poses (on vs off)
async function perf(b){const res={};for(const mode of ['off','on']){const p=await open(b,'fra');await p.evaluate(LIB);const cdp=await p.context().newCDPSession(p);await p.evaluate(m=>__ju.on(m==='on'),mode);
  await p.evaluate(()=>{const Q=__jl.path(900,1);if(Q)__jl.warpTo(Q);__jl.route(20,false)});const H=[];
  for(let i=0;i<7;i++){await cdp.send('HeapProfiler.collectGarbage');const u=await cdp.send('Runtime.getHeapUsage');H.push(+(u.usedSize/1048576).toFixed(2));if(i<6)await p.evaluate(()=>__jl.route(20,false))}
  const dc=[];for(let i=0;i<6;i++){await p.evaluate(()=>__jl.route(4,false));await F.off(p);const n=await p.evaluate(()=>{const R=__dbg.renderer;R.info.autoReset=false;const m=__ju.JU.on;const cnt=()=>{R.info.reset();__dbg.composer.render();return R.info.render.calls};__ju.on(true);__ju.step(1);const a=cnt();__ju.on(false);__ju.step(1);const o=cnt();__ju.on(m);R.info.autoReset=true;return{on:a,off:o}});await F.on(p);dc.push(n)}
  res[mode]={heap:H,growth:+(H[H.length-1]-H[1]).toFixed(2),dc};console.log('INFO perf',mode,JSON.stringify(res[mode]));await p.context().close()}
 const sum=(a,k)=>a.reduce((x,y)=>x+y[k],0),dOn=sum(res.on.dc,'on'),dOff=sum(res.on.dc,'off');
 ok(res.on.growth<=Math.max(1.5,res.off.growth+1),`heap after GC over 2 min: on +${res.on.growth} MB vs off +${res.off.growth} MB (${res.on.heap.join(' → ')})`);
 ok(dOn<=dOff*1.03,`draw calls at 6 poses: on ${dOn} vs off ${dOff} (${((dOn/dOff-1)*100).toFixed(1)} %)`);fs.writeFileSync(`${OUT}/perf.json`,JSON.stringify(res,null,1))}
// missions: an M1 story mission with JU on: boost at speed + traffic smash; the mission FX caps hold and hit-stop still lands
async function mission(b){const p=await open(b,'fra');await p.evaluate(LIB);
 const r=await p.evaluate(()=>{const J=__ju;J.on(true);const M1=__m1;const okS=M1.start('heist');for(let i=0;i<40&&M1.cs();i++){M1.skip();J.step(2)}J.step(30);const inM=!!__mho.qv.ch();let mx={uBoost:0,uSpeed:0,speedFx:0,hitFx:0,uCA:0},hs=0,hit=0;
  const B=__jl.straight();if(B){__jl.warpTo(B.Q);__mho.RO.v=55;J.setBm(100);__jl.drive(B.Q,{up:1,b:1},150,()=>{const x=J.fx();for(const k in mx)mx[k]=Math.max(mx[k],x[k])})}
  for(let t=0;t<4&&!hit;t++){const at=J.aimTraffic(38);if(!at)break;const s0=J.stats().k.chain||0;for(let f=0;f<120;f++){__jl.keys({up:1,b:1});J.step(1);const x=J.fx();for(const k in mx)mx[k]=Math.max(mx[k],x[k]);if(J.car().paused)hs++;if((J.stats().k.chain||0)>s0&&!hit)hit=1}}
  __jl.keys({});return{started:okS,inMission:inM&&!!__mho.qv.ch(),mx,hitstopMs:Math.round(hs/60*1000),hit}});
 console.log('INFO mission',JSON.stringify(r));ok(r.inMission,'mission: M1 heist running with JU on');ok(r.mx.uBoost<=.1501&&r.mx.uSpeed<=.2501&&r.mx.speedFx<=.3001&&r.mx.hitFx<=.3001,`mission: FX caps hold (uBoost ${r.mx.uBoost.toFixed(3)} ≤ .15, uSpeed ${r.mx.uSpeed.toFixed(3)} ≤ .25, speed lines ${r.mx.speedFx} ≤ .3, hitFx ${r.mx.hitFx.toFixed(2)} ≤ .3)`);
 ok(!r.hit||(r.hitstopMs>=60&&r.hitstopMs<=180),`mission: traffic smash hit-stop ${r.hitstopMs} ms (one or two hits)`);ok(!p.errs.length,'mission: no page errors '+JSON.stringify(p.errs.slice(0,2)));await p.context().close()}
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const all=[];
 for(const city of CITIES)for(const mode of MODES){const p=await open(b,city);const r=await measure(p,mode,city);all.push(r);console.log('INFO',JSON.stringify(r));fs.writeFileSync(`${OUT}/metrics_${city}_${mode}.json`,JSON.stringify(r,null,1));await p.context().close()}
 if(process.env.MIS!=='0'&&MODES.includes('on'))await mission(b);
 if(process.env.SHOTS){await shots(b)}
 if(process.env.PERF){await perf(b)}
 const g=(r,path)=>path.split('.').reduce((o,k)=>o==null?o:o[k],r);
 const ROWS=[['time to top speed (s)','accel.t95','4–6 (crash-free run; n/a if none)',(v,r)=>!r.accel.clean||(v>=4&&v<=6)],['top speed (km/h)','accel.kmh','—',null],['boost speed ×','accel.boostMul','≥ 1.3',v=>v>=1.3],['boost surge: time to +25 % (s)','accel.tBoost25','≤ 1.0',v=>v>=0&&v<=1],['time to boost peak (s)','accel.tBoost95','— (1.75× takes ~3 s)',null],
  ['drift tier 1 / 2 / 3 at (s)','drift.t','0.5 / 1.1 / 2.0 ±0.15',v=>v&&v.every((x,i)=>x!=null&&Math.abs(x-[.5,1.1,2][i])<=.15)],['drift payout: turbo s / bar per tier','drift.pay','0.8 / 1.6 / 2.6 s · +8 / 18 / 32 %',v=>v&&v.every((x,i)=>x&&Math.abs(x.turbo-[.8,1.6,2.6][i])<.15&&Math.abs(x.bm-[8,18,32][i])<=2.5)],
  ['takedown hit-stop (ms)','takedown.hitstopMs','60–90',v=>v>=60&&v<=90],['takedown camera FOV kick (°)','takedown.fovKick','≥ 3',v=>v>=3],['takedown shake (cap 1.0)','takedown.shakeMax','≤ 1',v=>v<=1],['takedown colour fringe uCA','takedown.caMax','≤ 0.035',v=>v<=.035],
  ['near miss at 30 m/s, 6 m beside','near.near','≥ 1 event',v=>v>=1],['hop landing squash','air.squash','0.15–0.25',v=>v>=.15&&v<=.25],['big air (1 s+): air bonus (base) / squash','bigAir.air','1 bonus, no duplicate',v=>v===1],['big air landing squash','bigAir.squash','0.15–0.25',v=>v>=.15&&v<=.25],
  ['FOV cruise → fast (°)','cam.fovCruise','',null],['FOV fast','cam.fovFast','cruise + 8–11',(v,r)=>v-r.cam.fovCruise>=7.5&&v-r.cam.fovCruise<=11.5],['FOV boosting (route)','cam.fovBoost','—',null],['FOV cruise → full boost (accel run, °)','accel.fovBoost','cruise + ≥ 8',(v,r)=>v-r.accel.fovCruise>=8],
  ['camera height cruise (m)','cam.hCruise','',null],['camera height fast (m)','cam.hFast','cruise − ≥ 0.6',(v,r)=>r.cam.hCruise-v>=.6],['camera back cruise (m)','cam.backCruise','',null],['camera back fast (m)','cam.backFast','≤ 26',v=>v<=26],
  ['look-ahead in turns (°)','cam.laTurn','≥ 3 (≈ 2–5 m at 20 m)',v=>v>=3],
  ['route: feedback moments / min','route.perMin','≥ 12',v=>v>=12],['route: longest dead time (s)','route.deadMax','≤ 8',v=>v<=8],['route: distance (km)','route.km','—',null],['route: smashes / min','route.smashPerMin','—',null],['route: studs earned','route.studs','—',null],['route: boost uptime %','route.boostUptime','15–35 (bot boosts greedily)',null],
  ['calm 30 m/s: distance (km)','calm.km','—',null],['calm 30 m/s: moments / min','calm.perMin','≥ 12',v=>v>=12],['calm 30 m/s: longest dead time (s)','calm.deadMax','≤ 8',v=>v<=8]];
 const fmt0=v=>v==null?'—':Array.isArray(v)?v.map(x=>x&&typeof x==='object'?`${x.turbo}s/+${x.bm}%`:x).join(' / '):typeof v==='object'?JSON.stringify(v):v;
 const fmt=(v,path,r)=>path==='accel.t95'&&r&&r.accel&&!r.accel.clean?fmt0(v)+' (n/a: no crash-free straight)':fmt0(v);
 const md=['| metric | target | '+all.map(r=>`${r.city} ${r.mode==='on'?'after':'before'}`).join(' | ')+' |','|---|---|'+all.map(()=>'---|').join('')];
 for(const[n,path,tg,chk]of ROWS){md.push(`| ${n} | ${tg} | `+all.map(r=>{const v=g(r,path);const pass=chk&&r.mode==='on'?(chk(v,r)?' ✅':' ❌'):'';return fmt(v,path,r)+pass}).join(' | ')+' |');for(const r of all)if(chk&&r.mode==='on')ok(chk(g(r,path),r),`${r.city}: ${n} = ${fmt(g(r,path),path,r)} (target ${tg})`)}
 for(const r of all)ok(!r.errs.length,`${r.city} ${r.mode}: no page errors ${JSON.stringify(r.errs)}`);
 fs.writeFileSync(`${OUT}/table.md`,md.join('\n')+'\n');console.log(md.join('\n'));
 await b.close();console.log(fails?`FAILED ${fails}`:'DONE');process.exit(fails?1:0)})();

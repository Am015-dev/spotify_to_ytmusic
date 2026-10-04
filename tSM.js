// tSM: seamless Athens. Bot drive A→B→C→D→A on the street graph (keyboard bot, CPU throttled 4x), counting loading screens,
// page reloads and the worst frame; heap, draw calls, boot time; plus campaign gate hand-over, map warp, Frankfurt drive.
// usage: node tSM.js [split] [legs=ABCDA] [fra]   (env PORT, PAGE; "split" = old behaviour via localStorage mho_sm=0)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const PORT=process.env.PORT||8766,U=`http://127.0.0.1:${PORT}/${process.env.PAGE||'local_dbg.html'}`;
const A=process.argv.slice(2),SPLIT=A.includes('split'),ROUTE=(A.find(a=>/^[ABCD]{2,}$/.test(a))||'ABCDA').split(''),THR=+(process.env.THR||4);
const ONLY=A.find(a=>a.startsWith('only='));const want=k=>!ONLY||ONLY.slice(5).split(',').includes(k);
let fails=0,pass=0;const ok=(c,m,i)=>{c?pass++:fails++;console.log((c?'PASS ':'FAIL ')+m+(i!==undefined?' · '+JSON.stringify(i):''))};
const R={mode:SPLIT?'split':'seamless',route:ROUTE.join('→')};
const seed=(p,c,d,o)=>p.evaluate(([c,d,o])=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_city@1',c);if(d)localStorage.setItem('mho_athd@1',d);
 localStorage.setItem('mho_roam'+(c==='ath'?'.ath':'')+'@1','{"tut":1,"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}');if(o)localStorage.setItem('mho_sm','0')},[c,d,o]);
// in-page instrumentation: loading screen shows (#ld2 visible) and frame timing
const INSTR=()=>{window.__smT={ld:0,ldOn:false};const go=()=>new MutationObserver(()=>{const e=document.querySelector('#ld2');const on=!!e&&!e.hidden&&!e.classList.contains('out');if(on&&!__smT.ldOn)__smT.ld++;__smT.ldOn=on}).observe(document.documentElement,{subtree:true,attributes:true,attributeFilter:['hidden','class']});if(document.documentElement)go();else document.addEventListener('DOMContentLoaded',go)};
async function boot(b,c,d){const ctx=await b.newContext({viewport:{width:640,height:360}});const p=await ctx.newPage();p.setDefaultTimeout(1800000);p.errs=[];
 p.on('pageerror',e=>p.errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')p.errs.push('console: '+m.text().slice(0,200))});
 p.loads=0;p.on('load',()=>p.loads++);await p.addInitScript(INSTR);
 await p.goto(U);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');await seed(p,c,d,SPLIT);await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');
 const t0=Date.now();await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam'&&__mho.RO.on,null,{polling:200});const bootMs=Date.now()-t0;
 await p.evaluate(()=>{window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{};try{__mho.storyClose()}catch(e){}try{__m1.skip()}catch(e){}__mho.roamSim(10);__smT.ld0=__smT.ld});
 p.cdp=await ctx.newCDPSession(p);p.loads0=p.loads;return{p,bootMs}}
const throttle=(p,r)=>p.cdp.send('Emulation.setCPUThrottlingRate',{rate:r});
// drive along a GPS path for up to `secs` sim seconds or until the page reloads (split) / the target district is reached.
// every step: roamSim(1) timed; every 10th step one real render into a small canvas (geometry uploads happen there)
const leg=(p,to,secs)=>p.evaluate(([to,secs,RENDER_EVERY])=>new Promise(res=>{const M=__mho,RO=M.RO,K=M.K,D=M.athDist()[to],sm=window.__sm;
 const W=(e,n)=>{const ox=1850,oy=1750;return[-(e-ox),n-oy]};let tgt=W(D.st[0],D.st[1]);
 // split build: the target district is not loaded, drive to the DRIVE TO gate that leads towards it
 const gates=M.athGates();if(!(sm&&sm.on)&&M.athd()!==to){const nb={A:'B',B:to==='A'?'A':'C',C:to==='D'?'D':'B',D:'C'}[M.athd()];let g=null,bd=1e9;for(const q of gates)if(q.to===nb){const d=Math.hypot(q.x-RO.x,q.z-RO.z);if(d<bd){bd=d;g=q}}if(g)tgt=[g.x,g.z,1,nb]}
 const q0=M.rsnap(RO.x,RO.z,300),q1=M.rsnap(tgt[0],tgt[1],400);const P=M.qv.path(q0[0],q0[1],q1[0],q1[1]).P;if(!P||P.length<3)return res({err:'nopath',to,from:M.athd()});
 if(tgt[2])P.push([tgt[0]+(tgt[0]-P[P.length-2][0])*4,tgt[1]+(tgt[1]-P[P.length-2][1])*4]);
 M.warp(P[0][0],P[0][1],Math.atan2(P[2][0]-P[0][0],P[2][1]-P[0][1]));M.roamSim(2);const cum=[0];for(let k=1;k<P.length;k++)cum.push(cum[k-1]+Math.hypot(P[k][0]-P[k-1][0],P[k][1]-P[k-1][1]));
 const FT=[],REN=[],dl=[],ring=[],cross=[];let cw=0,cm=0,warpMax=0,over50=0,i=0,t=0,stuck=0,mst=0,air=0,lastD=M.athd(),rescue=0,maxSt=0,maxAt=null,maxR=0,lastX=RO.x,lastZ=RO.z;const R0=window.__fastR,dbg=__dbg;
 const step=()=>{for(let n=0;n<30;n++){if(!RO.on){FT.sort((a,b)=>a-b);return res({reload:1,t:+(t/60).toFixed(1),steps:FT.length,p50:FT.length?+FT[FT.length>>1].toFixed(2):null,p99:FT.length?+FT[Math.floor(FT.length*.99)].toFixed(2):null,max:+maxSt.toFixed(1),over50,from:M.athd()})}
   let bj=i,bd=1e9;for(let k=i;k<Math.min(P.length,i+60);k++){const d=Math.hypot(P[k][0]-RO.x,P[k][1]-RO.z);if(d<bd){bd=d;bj=k}}i=bj;
   let k=i;while(k<P.length-1&&cum[k]-cum[i]<9+Math.abs(RO.v)*.35)k++;let a=Math.atan2(P[k][0]-RO.x,P[k][1]-RO.z)-RO.h;a=Math.atan2(Math.sin(a),Math.cos(a));const vt=34*Math.max(.35,1-Math.abs(a)*.9);
   K.ArrowLeft=a>.035;K.ArrowRight=a<-.035;K.ArrowUp=RO.v<vt;K.ArrowDown=RO.v>vt+6;
   const t0=performance.now();M.roamSim(1);const dt=performance.now()-t0;if(t<180){if(dt>warpMax)warpMax=dt}else{FT.push(dt);if(dt>maxSt){maxSt=dt;maxAt={t:+(t/60).toFixed(1),d:M.athd()}}if(dt>50)over50++}
   if(RENDER_EVERY&&t%RENDER_EVERY===0&&R0){const t1=performance.now();R0.call(dbg.composer);const dr=performance.now()-t1;REN.push(dr);if(dr>maxR)maxR=dr}
   ring.push(dt);if(ring.length>180)ring.shift();if(cw>0){cm=Math.max(cm,dt);if(--cw===0){cross.push(+cm.toFixed(1))}}
   if(M.athd()!==lastD){dl.push([lastD,M.athd(),+(t/60).toFixed(1),Math.round(RO.v)]);lastD=M.athd();cw=180;cm=Math.max(...ring)}
   if(Math.abs(RO.v)<2)stuck++;else stuck=0;mst=Math.max(mst,stuck);if(stuck>240){stuck=0;rescue++;const q=M.rsnap(P[Math.min(P.length-1,i+3)][0],P[Math.min(P.length-1,i+3)][1],100);M.warp(q[0],q[1],RO.h);M.roamSim(2)}
   t++;if(tgt[2]&&(i>=P.length-3||t>60*60)&&!window.__smGo){window.__smGo=1;M.athGo(tgt[3],tgt[0],tgt[1],RO.h);continue}
   const done=tgt[2]?false:(i>=P.length-3||(M.athd()===to&&Math.hypot(RO.x-tgt[0],RO.z-tgt[1])<250));if(done||t>secs*60){K.ArrowLeft=K.ArrowRight=K.ArrowUp=K.ArrowDown=false;
    if(!FT.length)FT.push(0);FT.sort((a,b)=>a-b);return res({done,to,at:M.athd(),t:+(t/60).toFixed(1),len:Math.round(cum[cum.length-1]),steps:FT.length,p50:+FT[FT.length>>1].toFixed(2),p99:+FT[Math.floor(FT.length*.99)].toFixed(2),max:+maxSt.toFixed(1),maxAt,over50,crossMax:cross,warpMax:+warpMax.toFixed(1),renMax:+maxR.toFixed(1),lz:window.__sm?__sm.lz().filter(l=>l.done).length:null,spikes:window.__dbgT?__dbgT.log.splice(0).sort((a,b)=>b[0]-a[0]).slice(0,6):undefined,dl,rescue,stuckMax:+(mst/60).toFixed(1)})}}
  setTimeout(step,0)};step()}),[to,secs,+(process.env.REN||0)]);
const mem=p=>p.evaluate(()=>{try{gc()}catch(e){}const i=__dbg.renderer.info;return{heapMB:Math.round(performance.memory.usedJSHeapSize/1e6),geos:i.memory.geometries,tex:i.memory.textures}});
const calls=p=>p.evaluate(()=>{const D=__dbg,r=D.renderer;r.info.autoReset=false;r.info.reset();(window.__fastR||D.composer.render).call(D.composer);const o={calls:r.info.render.calls,tris:r.info.render.triangles};r.info.autoReset=true;return o});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info','--js-flags=--expose-gc']});
 if(want('drive')){const{p,bootMs}=await boot(b,'ath',ROUTE[0]);R.bootMs=bootMs;R.mem0=await mem(p);R.calls0=await calls(p);console.log('boot',ROUTE[0],bootMs,'ms',JSON.stringify(R.mem0),JSON.stringify(R.calls0));
  await throttle(p,THR);R.legs=[];let reloads=0,ldBoot=[];
  for(let k=1;k<ROUTE.length;k++){const to=ROUTE[k];for(let tries=0;tries<8;tries++){let r;try{r=await leg(p,to,300)}catch(e){if(!/destroyed|navigation/i.test(e.message))throw e;r={reload:1,nav:1}}console.log('leg →'+to,JSON.stringify(r));R.legs.push(r);
    if(r.reload){reloads++;const t0=Date.now();await throttle(p,1);await p.waitForFunction(()=>window.__mho&&__mho.state==='roam'&&__mho.RO.on,null,{polling:250,timeout:1800000});ldBoot.push(Date.now()-t0);
      p.cdp=await p.context().newCDPSession(p);await p.evaluate(()=>{window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{};__mho.roamSim(5)});await throttle(p,THR);continue}
    if(r.err||r.done&&r.at===to)break}
   const at=await p.evaluate(()=>__mho.athd());ok(at===to,`drive: reached district ${to}`,{at})}
  await throttle(p,1);const T=await p.evaluate(()=>({ld:__smT.ld-(__smT.ld0||0),boot1:__smT.ld0,sm:window.__sm&&{cross:__sm.st.cross,log:__sm.st.log}}));
  R.loadingScreens=T.ld;R.reloads=reloads;R.reloadMs=ldBoot;R.cross=T.sm&&T.sm.cross;R.worstFrame=Math.max(...R.legs.filter(l=>l.max).map(l=>l.max));R.crossWorst=Math.max(0,...R.legs.flatMap(l=>l.crossMax||[]));R.over50=R.legs.reduce((a,l)=>a+(l.over50||0),0);R.steps=R.legs.reduce((a,l)=>a+(l.steps||0),0);R.worstRender=Math.max(...R.legs.filter(l=>l.renMax).map(l=>l.renMax));
  R.mem1=await mem(p);R.calls1=await calls(p);
  // draw calls at every district start
  R.callsAt={};for(const d of'ABCD'){const c=await p.evaluate(d=>{const M=__mho,D=M.athDist()[d];if(!window.__sm||!__sm.on)return null;const q=M.rsnap(-(D.st[0]-1850),D.st[1]-1750,300);M.warp(q[0],q[1],0);M.roamSim(30);return 1},d);if(c)R.callsAt[d]=await calls(p)}
  if(!SPLIT){ok(R.loadingScreens===0&&reloads===0,'drive: no loading screen and no page reload on the whole route',{ld:R.loadingScreens,reloads});
   ok(R.cross>=ROUTE.length-1,'drive: every border crossing was seamless (district changes counted)',{cross:R.cross});
   ok(R.crossWorst<50,`drive: worst frame within ±3 s of every border crossing (CPU x${THR}) under 50 ms`,{crossWorst:R.crossWorst,worstAnywhere:R.worstFrame,over50:R.over50,steps:R.steps});
   ok(R.legs.every(l=>!l.rescue),'drive: bot never stuck (no rescue warps)',R.legs.map(l=>l.rescue))}
  else console.log('SPLIT loading screens',R.loadingScreens,'reloads',reloads,'reload ms',ldBoot);
  console.log('mem after',JSON.stringify(R.mem1),'calls',JSON.stringify(R.calls1),'callsAt',JSON.stringify(R.callsAt));
  ok(!p.errs.length,'drive: no page / console errors',p.errs.slice(0,4));await p.context().close()}
 if(!SPLIT&&want('func')){const{p}=await boot(b,'ath','A');
  const m=await p.evaluate(()=>{const M=__mho,RO=M.RO,ld=__smT.ld;const a=__sm.atcAt('atc_amphora',1);for(let i=0;i<40;i++){try{__m1.skip()}catch(e){}M.roamSim(5)}const g=__sm.atcSt();if(!g||g.t!=='atcGate'||g.x==null)return{a,g};
   for(let i=0;i<200&&__sm.atcSt()&&__sm.atcSt().t==='atcGate';i++){RO.x=g.x;RO.z=g.z;RO.v=0;try{__m1.skip()}catch(e){}M.roamSim(1)}M.roamSim(30);return{a,gate:{to:g.to,x:Math.round(g.x),z:Math.round(g.z)},after:__sm.atcSt(),d:M.athd(),xfer:__sm.st.xfer||0,on:RO.on,ld:__smT.ld-ld}});
  ok(m.after&&m.after.mid==='atc_amphora'&&m.after.si>=2&&m.after.t!=='atcGate'&&m.on&&m.ld===0&&m.d==='B'&&m.xfer===1,'campaign: "The Stolen Amphora" crosses A→B at its gate and continues in place (no reload)',m);

  // map district button: warps inside the one map (no reload, no loading screen)
  const w=await p.evaluate(()=>{const M=__mho,ld=__smT.ld;try{M.qv.abandon()}catch(e){}M.roamSim(30);M.toggleMap(true);M.athPick('C');M.roamSim(40);return{d:M.athd(),on:M.RO.on,map:M.RO.mapOpen,ld:__smT.ld-ld}});
  ok(w.d==='C'&&w.on&&!w.map&&w.ld===0,'map: picking district C warps there without a loading screen',w);
  // gates are invisible waypoints: no DRIVE TO gate meshes, the map shows no gate dots
  const g=await p.evaluate(()=>({gates:__mho.HUB.gates.length,wp:__sm.gates().length,pin:__sm.on}));ok(g.gates===0&&g.wp>=6,'no DRIVE TO gates (border crossings kept as mission waypoints)',g);
  ok(!p.errs.length,'func: no page / console errors',p.errs.slice(0,4));await p.context().close()}
 if(want('fra')&&A.includes('fra')){const{p,bootMs}=await boot(b,'fra');R.fra={bootMs,mem0:await mem(p)};await throttle(p,THR);
  const r=await p.evaluate(()=>new Promise(res=>{const M=__mho,RO=M.RO,K=M.K;const pts=[[0,0],[1500,-1200],[-1800,1500],[1500,1800],[0,0]];const FT=[];let k=0;
   const go=()=>{if(k>=pts.length-1){FT.sort((a,b)=>a-b);return res({steps:FT.length,max:+FT[FT.length-1].toFixed(1),p99:+FT[Math.floor(FT.length*.99)].toFixed(2),ld:__smT.ld-(__smT.ld0||0),cid:M.cid()})}
    const a=M.rsnap(pts[k][0],pts[k][1],400),b=M.rsnap(pts[k+1][0],pts[k+1][1],600),P=M.qv.path(a[0],a[1],b[0],b[1]).P;k++;if(!P||P.length<3)return go();
    M.warp(P[0][0],P[0][1],Math.atan2(P[2][0]-P[0][0],P[2][1]-P[0][1]));M.roamSim(2);let i=0,t=0;
    const st=()=>{for(let n=0;n<30;n++){let bj=i,bd=1e9;for(let j=i;j<Math.min(P.length,i+60);j++){const d=Math.hypot(P[j][0]-RO.x,P[j][1]-RO.z);if(d<bd){bd=d;bj=j}}i=bj;let j=i;while(j<P.length-1&&Math.hypot(P[j][0]-RO.x,P[j][1]-RO.z)<9+RO.v*.35)j++;
      let a=Math.atan2(P[j][0]-RO.x,P[j][1]-RO.z)-RO.h;a=Math.atan2(Math.sin(a),Math.cos(a));K.ArrowLeft=a>.035;K.ArrowRight=a<-.035;K.ArrowUp=RO.v<34;const t0=performance.now();M.roamSim(1);FT.push(performance.now()-t0);t++;
      if(i>=P.length-3||t>240*60){K.ArrowLeft=K.ArrowRight=K.ArrowUp=false;return go()}}setTimeout(st,0)};st()};go()}));
  await throttle(p,1);R.fra.drive=r;R.fra.mem1=await mem(p);console.log('fra',JSON.stringify(R.fra));ok(r.ld===0&&p.loads===p.loads0&&r.cid==='fra','fra: driving across Frankfurt shows no loading screen and no reload',{ld:r.ld,reloads:p.loads-p.loads0});
  ok(r.max<50,`fra: worst frame (CPU x${THR}) under 50 ms`,r);ok(!p.errs.length,'fra: no page / console errors',p.errs.slice(0,4));await p.context().close()}
 fs.mkdirSync('smoke',{recursive:true});fs.writeFileSync(`smoke/tSM_${R.mode}.json`,JSON.stringify(R,null,1));
 console.log(`${fails?'FAILED '+fails:'ALL PASS'} · ${pass} passed`);await b.close();process.exit(fails?1:0)})();

// rv8 probe (review #8): node tools/rv8/probe.js <url> <fra|ath> <wander|road> <secs> [seed] [WxH]
// Fixed-step free roam on the BUILT page from the city spawn (no warp), gas held. Logs one JSON line:
// stuck episodes (gas held, < 2 m/s for >= 1 s), teleports (> 6 m in one 1/30 s step: nudge hop, wreck rebuild, other),
// modes: wander | road | ram (gas, no steering) | sweep (warp to a random drivable street every 8 s and scan 350 m for solid street points).
// wrecks, say() banners, hard stops (> 50 % speed drop in < 0.3 s from > 8 m/s), smashes, min HP, JS errors,
// a road-blockage scan (drivable street centre points within 350 m that roamHit reports as solid) at start and end.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const [U,C,MODE,SECS,SEED,VP]=process.argv.slice(2);const [VW,VH]=(VP||'852x393').split('x').map(Number);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await(await b.newContext({viewport:{width:VW,height:VH},isMobile:VW<1000,hasTouch:VW<1000})).newPage();p.setDefaultTimeout(900000);
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 const T0=Date.now();await p.goto(U+'?test='+C+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__qa,null,{polling:250,timeout:900000});const bootS=(Date.now()-T0)/1000;
 const out=await p.evaluate(async a=>window.__qa.ev('('+String(function(a){
  let seed=a.seed|0||12345;const rnd=()=>(seed=(seed*1664525+1013904223)>>>0)/4294967296;const W=x=>Math.atan2(Math.sin(x),Math.cos(x));
  const says=[];const _say=say;say=function(a1,b1){try{if(b1)says.push({t:+t.toFixed(1),m:String(b1).slice(0,40)})}catch(e){}return _say.apply(this,arguments)};
  const scan=()=>{const bl=[];let n=0;for(const S of CITY_S){if(typeof OB_DRV==='function'&&!OB_DRV(S))continue;for(let i=0;i<S.pts.length;i+=2){const q=S.pts[i];if(Math.hypot(q.x-RO.x,q.z-RO.z)>350)continue;n++;let y=0;try{y=groundY(q.x,q.z)}catch(e){}if(roamHit(q.x,q.z,1.2,y))bl.push([Math.round(q.x),Math.round(q.z),S.name||S.n||'']) }}
   const cl=[];for(const q of bl)if(!cl.some(c=>Math.hypot(c[0]-q[0],c[1]-q[1])<25))cl.push(q);return{pts:n,blocked:bl.length,clusters:cl.slice(0,12)}};
  const sw={pts:0,blocked:0,cl:[]};let t=0;const dt=1/30,sx=RO.x,sz=RO.z;const scan0=scan();
  let tgt=RO.h,tchg=0,px=RO.x,pz=RO.z,dist=0,km=0,stuckT=0,stuck=[],tele=[],wrecks=0,wasWk=false,hp=100,hist=[],stops=[],cool=0,errN=0,err1='';const sm0=HUB.smashed||0;
  for(let i=0,N=a.secs*30;i<N;i++){t+=dt;
   if(a.mode==='road'){const la=12+RO.v*.9,q=rfSnap(RO.x+Math.sin(RO.h)*la,RO.z+Math.cos(RO.h)*la,60),e=q?W(Math.atan2(q[0]-RO.x,q[1]-RO.z)-RO.h):0;K.KeyW=K.ArrowUp=true;K.ArrowLeft=e>.06;K.ArrowRight=e<-.06}
   else if(a.mode==='ram'){K.KeyW=K.ArrowUp=true;K.ArrowLeft=K.ArrowRight=false}
   else if(a.mode==='sweep'){if(i%240===0){const L=CITY_S.filter(S=>(typeof OB_DRV!=='function'||OB_DRV(S))&&S.pts.length>4);const S=L[Math.floor(rnd()*L.length)],q=S.pts[Math.floor(rnd()*S.pts.length)];roamWarp(q.x,q.z,rnd()*6.283,true);px=RO.x;pz=RO.z}if(i%240===200){const r=scan();sw.pts+=r.pts;sw.blocked+=r.blocked;for(const c of r.clusters)if(sw.cl.length<20)sw.cl.push(c)}K.KeyW=K.ArrowUp=false}
   else{if(t>=tchg){tgt=rnd()*6.283;tchg=t+2+rnd()*3}const e=W(tgt-RO.h);K.KeyW=K.ArrowUp=true;K.ArrowLeft=e>.08;K.ArrowRight=e<-.08}
   const nT=RO.nudgeT||0;try{roamStep(dt)}catch(e){errN++;if(!err1)err1=String(e&&e.stack||e).slice(0,240)}
   const d=Math.hypot(RO.x-px,RO.z-pz);if(d>6)tele.push({t:+t.toFixed(1),from:[Math.round(px),Math.round(pz)],to:[Math.round(RO.x),Math.round(RO.z)],d:Math.round(d),why:RO.nudgeT>nT?'nudge-hop':RO.wk==null&&wasWk?'rebuild':'other'});else dist+=d;px=RO.x;pz=RO.z;km+=Math.abs(RO.v)*3.6*dt;
   if(RO.wk&&!wasWk)wrecks++;wasWk=!!RO.wk;hp=Math.min(hp,RO.hp??100);
   if(Math.abs(RO.v)<2&&!RO.wk){stuckT+=dt}else{if(stuckT>=1)stuck.push({t:+(t-stuckT).toFixed(1),s:+stuckT.toFixed(1),x:Math.round(RO.x),z:Math.round(RO.z)});stuckT=0}
   hist.push(Math.abs(RO.v));if(hist.length>10)hist.shift();cool-=dt;if(cool<=0){const mx=Math.max(...hist),v1=hist[hist.length-1];if(mx>8&&v1<mx*.5){stops.push([+t.toFixed(1),Math.round(mx*3.6),Math.round(v1*3.6),Math.round(RO.x),Math.round(RO.z)]);cool=.6;hist.length=0}}}
  if(stuckT>=1)stuck.push({t:+(t-stuckT).toFixed(1),s:+stuckT.toFixed(1),x:Math.round(RO.x),z:Math.round(RO.z),open:1});
  K.KeyW=K.ArrowUp=K.ArrowLeft=K.ArrowRight=false;say=_say;
  return{city:CID,mode:a.mode,secs:a.secs,spawn:[Math.round(sx),Math.round(sz)],end:[Math.round(RO.x),Math.round(RO.z)],distM:Math.round(dist),avgKmh:Math.round(km/a.secs),
   stuckS:+stuck.reduce((s,q)=>s+q.s,0).toFixed(1),stuck:stuck.slice(0,10),tele,wrecks,minHp:Math.round(hp),hardStops:stops.length,stops:stops.slice(0,12),smashed:(HUB.smashed||0)-sm0,
   says:says.slice(0,25),dest:typeof DEST!=='undefined'?{on:DEST.on,shortcuts:DEST.sc?DEST.sc.length:null,n:DEST.n}:null,scan0,scan1:scan(),sweep:sw,stepErr:errN,err1};
 })+')('+JSON.stringify(a)+')'),{secs:+SECS,mode:MODE,seed:+SEED||0});
 out.bootS=bootS;out.vp=VW+'x'+VH;out.pageErr=errs.slice(0,8);console.log(JSON.stringify(out));await b.close()})().catch(e=>{console.log('ERR '+e.message);process.exit(1)});

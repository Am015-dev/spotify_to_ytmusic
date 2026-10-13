// tPerfCmp: frame time at 3 fixed views per city (spawn point, headings 0/120/240°, no driving), boot time, optional CPU profile top functions.
//   node tools/tPerfCmp.js <url …/index.html> [cities fra,ath] [PROF=1]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const U=process.argv[2],C=(process.argv[3]||'fra,ath').split(','),out=[];const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const c of C){const ctx=await b.newContext({viewport:{width:852,height:393}});await ctx.addInitScript(()=>{window.__dbg=1});const p=await ctx.newPage();p.setDefaultTimeout(180000);const t0=Date.now();
  await p.goto(U+(U.includes('?')?'&':'?')+'test='+c+(process.env.DRAW==='1'?'':'&draw=0'));await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:180000});const boot=(Date.now()-t0)/1000;
  const pos=await p.evaluate(()=>__oc.ev('[RO.x,RO.z]'));const F=[];let prof=null;const cdp=process.env.PROF==='1'?await ctx.newCDPSession(p):null;
  if(cdp){await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:500});await cdp.send('Profiler.start')}
  for(const h of[0,2.094,4.189]){await p.evaluate(([x,z,h])=>__mho.warp(x,z,h,true),[pos[0],pos[1],h]);await p.waitForTimeout(1500);
   F.push(await p.evaluate(()=>new Promise(r=>{const T=[];let l=performance.now();const f=t=>{T.push(t-l);l=t;if(T.length<40)requestAnimationFrame(f);else{T.sort((a,b)=>a-b);r(+(T.reduce((a,b)=>a+b,0)/T.length).toFixed(1))}};requestAnimationFrame(f)})))}
  if(cdp){const {profile}=await cdp.send('Profiler.stop');const self=new Map(),dt=profile.timeDeltas,N=new Map(profile.nodes.map(n=>[n.id,n]));const cnt=new Map();profile.samples.forEach((id,i)=>cnt.set(id,(cnt.get(id)||0)+(dt[i]||0)));
   for(const [id,t] of cnt){const n=N.get(id),k=n.callFrame.functionName||'(anon)';if(/^\((idle|program|garbage collector)\)$/.test(k)&&k!=='(garbage collector)')continue;self.set(k,(self.get(k)||0)+t)}
   let idle=0,all=0;for(const [id,t] of cnt){all+=t;if(N.get(id).callFrame.functionName==='(idle)')idle+=t}const busy=(100*(1-idle/all)).toFixed(1);const tot=[...self.values()].reduce((a,b)=>a+b,0);prof='busy CPU '+busy+'% · '+[...self].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([k,t])=>k+' '+(100*t/tot).toFixed(1)+'%').join(', ')}
  out.push(`${c}: boot ${boot.toFixed(1)} s · frame ms ${F.join(' / ')} (mean ${(F.reduce((a,b)=>a+b,0)/F.length).toFixed(1)})`+(prof?' · top: '+prof:''));await ctx.close()}
 console.log(U.replace(/.*\/out\//,'')+' · '+out.join(' · '));await b.close()})();

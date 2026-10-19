// ios-r17a: live (retained) JS heap by allocating function at ready, touch profile. node tools/perf1/tLiveHeap.js <url incl. ?test=fra|ath&draw=0> [topN]
// V8 sampling heap profiler keeps only objects still alive, so after a forced GC the profile is the retained heap by allocation site.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const U=process.argv[2],N=+(process.argv[3]||25);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-precise-memory-info']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();const c=await ctx.newCDPSession(p);
 await c.send('HeapProfiler.enable');await c.send('HeapProfiler.startSampling',{samplingInterval:65536});
 await p.goto(U);await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:500,timeout:150000});await p.waitForTimeout(3000);
 await c.send('HeapProfiler.collectGarbage');const used=await p.evaluate(()=>Math.round(performance.memory.usedJSHeapSize/1048576));
 const {profile}=await c.send('HeapProfiler.getSamplingProfile');const self={},stk={};let tot=0;
 const walk=(n,st)=>{const k=(n.callFrame.functionName||'(anon)')+':'+(n.callFrame.lineNumber+1)+(n.callFrame.url.match(/[^/]*$/)||[''])[0].slice(0,12);const s2=st.concat(k);
  if(n.selfSize){self[k]=(self[k]||0)+n.selfSize;tot+=n.selfSize;const key=s2.slice(-5).join('<');stk[key]=(stk[key]||0)+n.selfSize}for(const ch of n.children)walk(ch,s2)};walk(profile.head,[]);
 console.log('USED '+used+' MB, sampled live '+(tot/1048576).toFixed(0)+' MB');
 Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,N).forEach(([k,v])=>console.log((v/1048576).toFixed(1).padStart(7)+' '+k));
 console.log('--- stacks');Object.entries(stk).sort((a,b)=>b[1]-a[1]).slice(0,N).forEach(([k,v])=>console.log((v/1048576).toFixed(1).padStart(7)+' '+k.split('<').reverse().join(' < ').slice(0,260)));
 await b.close()})();

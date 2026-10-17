// crash-3: which code allocated the memory still live after boot (V8 sampling heap profiler from the first script). node tools/crash3/tAlloc.js <page url> <fra|ath>
// Prints the top allocation sites (function @ module:line) by live bytes, iPhone emulation.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,C0]=process.argv.slice(2);const C=C0||'ath';
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
(async()=>{const b=await chromium.launch({args:['--js-flags=--expose-gc','--enable-precise-memory-info','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:3,isMobile:true,hasTouch:true,userAgent:UA});const p=await ctx.newPage();p.setDefaultTimeout(600000);
 const cdp=await ctx.newCDPSession(p);await cdp.send('HeapProfiler.enable');await cdp.send('HeapProfiler.startSampling',{samplingInterval:65536});
 await p.goto(BASE+(BASE.includes('?')?'&':'?')+'test='+C+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:400000});
 const ev=s=>p.evaluate(s=>__xc.ev(s),s);for(let i=0;i<+(process.env.SET||8);i++){await ev(`{K.ArrowUp=true;for(let k=0;k<30;k++)roamStep(1/30);K.ArrowUp=false;__tq.draw()}`);await p.waitForTimeout(800)}
 await cdp.send('HeapProfiler.collectGarbage');const {profile}=await cdp.send('HeapProfiler.getSamplingProfile');
 const F=new Map,S=new Map;const walk=(n,stack)=>{const cf=n.callFrame,k=(cf.functionName||'(anon)')+' @'+(cf.url||'').split('/').pop().slice(0,30)+':'+cf.lineNumber;const st=stack.concat(k);
  if(n.selfSize){F.set(k,(F.get(k)||0)+n.selfSize);const top=st.filter(x=>!/^\(anon\) @:|^\(root\)/.test(x)).slice(1,5).join(' < ');}
  for(const c of n.children)walk(c,st)};walk(profile.head,[]);
 // inclusive per function (each function counted once per path)
 const I=new Map;const walk2=(n,on)=>{const cf=n.callFrame,k=(cf.functionName||'(anon)')+' :'+cf.lineNumber;const add=!on.has(k);const on2=add?new Set(on).add(k):on;let s=n.selfSize;for(const c of n.children)s+=walk2(c,on2);if(add)I.set(k,(I.get(k)||0)+s);return s};const tot=walk2(profile.head,new Set);
 const mb=x=>Math.round(x/1048576);console.log('ALLOC',C,'total',mb(tot),'MB');console.log('SELF',JSON.stringify([...F].sort((a,b)=>b[1]-a[1]).slice(0,25).map(([k,v])=>[k,mb(v)])));
 console.log('INCL',JSON.stringify([...I].sort((a,b)=>b[1]-a[1]).filter(([k,v])=>v<tot*.95).slice(0,40).map(([k,v])=>[k,mb(v)])));await b.close()})();

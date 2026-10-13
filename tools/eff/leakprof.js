// PERF-2 leak finder: enter roam (CITY), drive WARM s, then CDP sampling heap profiler over DRIVE s of driving; after GC the samples that remain
// are objects allocated during the drive and still alive → top allocation sites (function@line, self MB), plus heap before/after.
// usage: CITY=ath WARM=10 DRIVE=40 node tools/eff/leakprof.js <url local_dbg.html>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const URL=process.argv[2],CITY=process.env.CITY||'ath',DRIVE=+(process.env.DRIVE||40),WARM=+(process.env.WARM||10);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--js-flags=--expose-gc']});
const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(1800000);
await p.addInitScript("Object.defineProperty(window,'devicePixelRatio',{get:()=>0.35,configurable:true})");
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,160)));
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});
await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));if(c==='ath'){localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')}},CITY);
await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});
const cdp0=await ctx.newCDPSession(p);if(process.env.FROM==='enter'){await cdp0.send('HeapProfiler.enable');await cdp0.send('HeapProfiler.startSampling',{samplingInterval:32768})}
await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{polling:200});
const cdp=await ctx.newCDPSession(p);await cdp.send('Performance.enable');await cdp.send('HeapProfiler.enable');
const heap=async()=>{await p.evaluate(()=>gc());const m=await cdp.send('Performance.getMetrics');return +(m.metrics.find(x=>x.name==='JSHeapUsedSize').value/1048576).toFixed(1)};
const drive=async s=>{await p.keyboard.down('ArrowUp');for(let i=0;i<s;i++){await p.waitForTimeout(1000);if(i%6===3){await p.keyboard.down(i%12===3?'ArrowLeft':'ArrowRight');await p.waitForTimeout(400);await p.keyboard.up('ArrowLeft');await p.keyboard.up('ArrowRight')}}await p.keyboard.up('ArrowUp')};
await drive(WARM);const h0=await heap();
if(process.env.FROM!=='enter')await cdp.send('HeapProfiler.startSampling',{samplingInterval:16384});await drive(DRIVE);await p.evaluate(()=>gc());await p.evaluate(()=>gc());
const {profile}=await (process.env.FROM==='enter'?cdp0:cdp).send('HeapProfiler.stopSampling');const h1=await heap();
const self={},stack={};const incl={};const walk=(n,path)=>{const f=n.callFrame,k=(f.functionName||'(anon)')+'@'+(f.lineNumber+1);const P=path.concat(k);if(n.selfSize){for(const q of new Set(P))incl[q]=(incl[q]||0)+n.selfSize;self[k]=(self[k]||0)+n.selfSize;const s=P.slice(-(+(process.env.DEPTH||4))).join(' < ');stack[s]=(stack[s]||0)+n.selfSize}for(const c of n.children)walk(c,P)};walk(profile.head,[]);
const tot=Object.values(self).reduce((a,b)=>a+b,0);console.log(JSON.stringify({city:CITY,heapBefore:h0,heapAfter:h1,liveSampledMB:+(tot/1048576).toFixed(1),errs}));
console.log('--self');Object.entries(self).sort((a,b)=>b[1]-a[1]).slice(0,+(process.env.TOP||25)).forEach(([k,v])=>console.log((v/1048576).toFixed(2).padStart(7),k));
console.log('--stacks');Object.entries(stack).sort((a,b)=>b[1]-a[1]).slice(0,+(process.env.TOP||20)).forEach(([k,v])=>console.log((v/1048576).toFixed(2).padStart(7),k));
console.log('--inclusive');Object.entries(incl).sort((a,b)=>b[1]-a[1]).slice(0,+(process.env.TOP||20)*2).forEach(([k,v])=>console.log((v/1048576).toFixed(2).padStart(7),k));
await b.close()})().catch(e=>{console.error(e);process.exit(1)});

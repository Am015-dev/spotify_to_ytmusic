// PERF-3: V8 heap (after GC) at the menu and right after roam entry, for several page URLs in turn. usage: CITY=ath node tools/eff/menuheap.js <url>...
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const CITY=process.env.CITY||'ath',ENTER=process.env.ENTER!=='0';
(async()=>{for(const URL of process.argv.slice(2)){const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--js-flags=--expose-gc']});
const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(1800000);
await p.addInitScript("Object.defineProperty(window,'devicePixelRatio',{get:()=>0.35,configurable:true})");const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,160)));
const cdp=await ctx.newCDPSession(p);await cdp.send('Performance.enable');const heap=async()=>{await p.evaluate(()=>{gc();gc()});const m=await cdp.send('Performance.getMetrics');return +(m.metrics.find(x=>x.name==='JSHeapUsedSize').value/1048576).toFixed(1)};
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});
await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));if(c==='ath'){localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')}},CITY);
await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});await p.waitForTimeout(4000);const h0=await heap();let h1=null,t=null;
if(ENTER){t=Date.now();await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{polling:200});t=(Date.now()-t)/1000;h1=await heap()}
console.log(JSON.stringify({url:URL.split('/').pop(),city:CITY,menuMB:h0,roamMB:h1,enter_s:t,errs:errs.slice(0,2)}));await b.close()}})().catch(e=>{console.error(e);process.exit(1)});

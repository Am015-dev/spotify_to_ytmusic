// PERF-2: enter roam (CITY=fra|ath), then window.__bk.check(): baked vs original road/terrain queries must match exactly. Prints roam-entry time.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const URL=process.argv[2],CITY=process.env.CITY||'fra';
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(1800000);
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,160)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,160))});
await p.addInitScript("Object.defineProperty(window,'devicePixelRatio',{get:()=>0.35,configurable:true})");
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});
await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));if(c==='ath'){localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{}}');localStorage.setItem('mho_story.ath@1','{"seen":1}')}},CITY);
await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:200});
const t=Date.now();await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{polling:100});const enter=(Date.now()-t)/1000;
const st=await p.evaluate(()=>window.__bk?{...__bk.BK.st,cells:__bk.cells()}:null);
const chk=await p.evaluate(()=>window.__bk?__bk.check(+(window.__N||4000)):null);
console.log(JSON.stringify({city:CITY,enter_s:enter,st,chk,errs:errs.slice(0,5)}));
const bad=chk?Object.values(chk).filter(v=>v&&v.bad).length:-1;console.log(bad===0?'BK_CHECK PASS':'BK_CHECK FAIL '+bad);await b.close()})().catch(e=>{console.error(e);process.exit(1)});

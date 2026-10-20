// assets-r21p debug: run bot/nav#1 (Athens) once with ?assets2=1 and print the A2 hit counters. node tools/a2/nav_dbg.js <base url>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await(await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true})).newPage();
 await p.goto(process.argv[2]+'?assets2=1&test=ath&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:120000});
 const seq=(process.env.SEQ||'').split(',').filter(Boolean);
 for(const id of seq){const[i,j]=id.split('#');await p.evaluate(([i,j])=>{try{__tq.reset&&__tq.reset()}catch(e){}return window.__chk.go(i,+j||0)||''},[i,j]);await p.waitForFunction(()=>!/…$/.test(window.__chk.said()||''),null,{timeout:120000,polling:500}).catch(()=>{});console.log('  ran',id,(await p.evaluate(()=>window.__chk.said()||'')).slice(0,80))}
 await p.evaluate(()=>{try{__tq.reset&&__tq.reset()}catch(e){}window.__a2.state.n.hit=0});
 await p.evaluate(()=>window.__chk.go('bot/nav',1)||'');await p.waitForFunction(()=>!/…$/.test(window.__chk.said()||''),null,{timeout:240000,polling:500}).catch(()=>{});
 console.log((await p.evaluate(()=>window.__chk.said()||'')).slice(0,260));
 console.log(JSON.stringify(await p.evaluate(()=>window.__a2.state.n)));await b.close()})()

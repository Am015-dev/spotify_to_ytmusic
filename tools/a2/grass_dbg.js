// assets-r21p debug: run xf1/grass once with ?assets2=1 and print the A2 hit counter + props near the car. node tools/a2/grass_dbg.js <base url>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true}),p=await ctx.newPage();
 await p.goto(process.argv[2]+'?assets2=1&test=fra&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:120000});
 await p.evaluate(()=>{window.__a2.state.n.hit=0});
 const said=await p.evaluate(()=>window.__chk.go('xf1/grass',0)||'');await p.waitForFunction(()=>!/…$/.test(window.__chk.said()||''),null,{timeout:30000,polling:250}).catch(()=>{});
 console.log((await p.evaluate(()=>window.__chk.said()||'')).slice(0,220));
 console.log(JSON.stringify(await p.evaluate(()=>{const A=__a2.state;return{n:A.n,drawn:(A.drawn||[]).length,hit:A.n.hit||0,last:A.n.last}})));await b.close()})()

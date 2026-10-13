const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();
 await p.goto(process.argv[2]+'?test=fra&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{timeout:240000,polling:1000});
 const m=await p.evaluate(()=>__chk.go('v90k/park-sit'));await p.waitForTimeout(2500);const f=await p.evaluate(()=>__oc.ev('RO.foot'));console.log(f&&f!=='car'?'PASS':'FAIL','park-sit foot=',f,m);await b.close()})();

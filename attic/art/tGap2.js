// art/tGap2.js <index url> [rs]: int-3's path: ?test=fra[&rs=0], wait ready, tap GO art1/road-gap, read __chk.roadgap after 5 s (and after 15 s)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [U,rs]=process.argv.slice(2);const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await (await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true})).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto(U+'?test=fra&draw=0'+(rs?'&rs='+rs:''));await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{timeout:600000});
 const said=await p.evaluate(()=>__chk.go('art1/road-gap'));await p.waitForTimeout(5000);const a=await p.evaluate(()=>JSON.stringify(__chk.roadgap||null));
 await p.waitForTimeout(10000);const c=await p.evaluate(()=>JSON.stringify(__chk.roadgap||null)+' off='+(typeof sessionStorage!=='undefined'&&sessionStorage.getItem('rs0'))+' href '+location.search);
 console.log('said',said,'| 5s',a,'| 15s',c,'| errors',errs.length);await b.close()})();

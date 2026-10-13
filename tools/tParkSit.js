// GO v90k/park-sit: ?test=fra&car=<id>, GO (sloped main road, stopped), REAL F key to exit, then __chk.parkSit = OF_parkChk().
// node tools/tParkSit.js <url .../local_dbg.html> <car ids...>   prints one PASS/FAIL line per car (default = no car param)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [,,url,...cars]=process.argv;const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});let bad=0;
 for(const car of cars){const p=await (await b.newContext({viewport:{width:852,height:393}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,120)));
  await p.goto(url+'?test=fra'+(car==='default'?'':'&car='+car));for(let i=0;i<400;i++){if(await p.evaluate(()=>!!(window.__tq&&__tq.ready&&window.__chk)))break;await p.waitForTimeout(300)}
  await p.waitForTimeout(1500);const said=await p.evaluate(()=>__chk.go('v90k/park-sit'));
  let ok=false;for(let i=0;i<80;i++){await p.waitForTimeout(500);if(ok=await p.evaluate(()=>__oc.ev('OF_canExit()')))break}
  await p.keyboard.down('KeyF');await p.waitForTimeout(150);await p.keyboard.up('KeyF');let r=null;
  for(let i=0;i<60;i++){await p.waitForTimeout(500);r=await p.evaluate(()=>__chk.parkSit);if(r)break}
  if(!r||!r.ok)bad++;console.log((r&&r.ok?'PASS':'FAIL'),'park-sit',car,'| canExit',ok,'| tyre',r&&r.tyre.join(','),'body',r&&r.body,'pitch',r&&r.pitch,'roll',r&&r.roll,'| go:',String(said).slice(0,40),'| errs',errs.length);
  await p.screenshot({path:`qa_dev5/park_${car}.png`});await p.close()}
 await b.close();console.log(bad?'PARKSIT_FAIL '+bad:'PARKSIT_PASS')})();

// dev3: rv:2026-10-13 ride scale, automated check. node qa_dev3/tRvScale.js <url local_dbg.html>  -> PASS/FAIL line + list of rides out of class (ids only)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
 await p.goto(process.argv[2]+'?test=fra&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{timeout:240000,polling:1000});
 const r=await p.evaluate(async()=>{const a=await __oc.ev('RSZ.audit(false)');return a.map(x=>({id:x.id,L:x.L,s:x.stick,c:x.cls,ok:x.ok}))});
 const bad=r.filter(x=>!x.ok);console.log(bad.length?'FAIL':'PASS','rv-scale',r.length,'rides,',bad.length,'out of class',bad.slice(0,12).map(x=>`${x.id}:${x.L}m/${x.c}`).join(' '),'errs',errs.length);await b.close()})();

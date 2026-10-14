// tXf: run the xform-1 checklist GOs (xf1/*) in one ?test=fra page; prints one PASS/FAIL line per GO + console errors.
//   node tools/tXf.js <base url> [ids comma, default grass,kerb]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:852,height:393}});
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 const T=Date.now();await p.goto(process.argv[2]+'?test=fra&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:120000});console.log('BOOT',((Date.now()-T)/1000).toFixed(1),'s');
 for(const id of(process.argv[3]||'grass,kerb').split(',')){let s=await p.evaluate(id=>__chk.go('xf1/'+id)||'',id);
  if(/…$/.test(s)){await p.waitForFunction(()=>!/…$/.test(__chk.said()||''),null,{timeout:30000,polling:250}).catch(()=>{});s=await p.evaluate(()=>__chk.said())}
  console.log((/✅/.test(s)?'PASS':'FAIL'),id,s);console.log('  res',JSON.stringify(await p.evaluate(id=>__xf.res[id],id)))}
 console.log('ERRORS',errs.length,errs.slice(0,3).join(' | '));await b.close()})();

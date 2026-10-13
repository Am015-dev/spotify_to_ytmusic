// bxT track checks: 📍 GO per track (same spawn as the checklist), touch GAS 3 s (real input), then the page's data + input check. FAIL lines only.
// node tools/bx/tData.js [ids...]   (~45 s for all 3)
const L=require('./lib.js');
(async()=>{const ids=process.argv.slice(2).length?process.argv.slice(2):['bx-t-cliff','bx-t-city','bx-t-canyon'];const {b,p,E}=await L.launch();
 for(const id of ids){await p.evaluate(i=>__chk.go('bxT/'+i),id);await L.sleep(200);await p.waitForFunction(()=>__bx.BX.m&&__bx.BX.m.t>3.3,null,{timeout:60000});
  const r=await p.evaluate(i=>__bx.check(i),id);console.log(id,r.ok?'PASS':'FAIL',r.ok?'':r.msg.split(/, | \| /).filter(x=>x.startsWith('✘')).join(', '),process.env.V?r.msg:'')}
 console.log('errors',E.length?E.slice(0,3).join(' / '):'none');await b.close()})();

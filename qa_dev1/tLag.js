// dev1 item 1: v90k/lag GO check in Frankfurt and Athens (+ 20 s of real GAS each), one shot per city. node qa_dev1/tLag.js <url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const {boot}=require('../tools/d24lib.js');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const o=process.argv[3],R={};
 for(const c of(process.argv[4]||'fra,ath').split(',')){const t0=Date.now();const {p,errs,shot}=await boot(b,{city:c,url:process.argv[2]});
  const m=await p.evaluate(()=>__chk.go('v90k/lag'));const lag=await p.evaluate(()=>__chk.lag);
  await p.keyboard.down('ArrowUp');for(let i=0;i<20;i++)await p.evaluate(()=>__tick(60));await p.keyboard.up('ArrowUp');
  const m2=await p.evaluate(()=>__chk.go('v90k/lag'));const lag2=await p.evaluate(()=>__chk.lag);
  await shot(`${o}/lag_${c}.jpg`);R[c]={m,lag,m2,lag2,errs:errs.slice(0,3),s:(Date.now()-t0)/1000};console.log(c,JSON.stringify(R[c]));await p.context().close()}
 await b.close()})();

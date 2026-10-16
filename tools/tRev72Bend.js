// tRev72Bend (rev-72): Athens bend x -610, z 36, 4 headings 25 m before it. node tools/tRev72Bend.js <url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:852,height:393}});
 p.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,160)));
 await p.goto(BASE+'?test=ath');await p.waitForFunction(()=>window.__chk&&window.__l3&&window.__tq&&__tq.ready,null,{timeout:300000});await p.waitForTimeout(4000);
 for(const [i,h] of [0,Math.PI/2,Math.PI,-Math.PI/2].entries()){await p.evaluate(([h])=>{const dx=Math.sin(h),dz=Math.cos(h);__l3.park(-610-dx*25,36-dz*25,h)},[h]);await p.waitForTimeout(3500);await p.screenshot({path:`${OUT}/b_ath_bend_h${i}.png`})}
 await b.close()})();

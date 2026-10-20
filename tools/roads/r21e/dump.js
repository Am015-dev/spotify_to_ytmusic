const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await (await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true})).newPage();
await p.goto('http://localhost:8813/index.html?test='+process.argv[2]+'&draw=0');
await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__chk&&window.__bot,null,{polling:250,timeout:120000});
const r=await p.evaluate(()=>{const N=__cvNodes();return{ng:N.ng,n:N.map(n=>[Math.round(n.x*10)/10,Math.round(n.z*10)/10,n.nb,n.w,n.tr?1:0])}});
fs.writeFileSync(process.argv[3],JSON.stringify(r));console.log(r.ng,r.n.length);await b.close()})();

// tCity3Probe (city-3): dump prop types + building record shapes. node tools/tCity3Probe.js <url> <city>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const [BASE,C]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:852,height:393}});
 p.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,200)));
 await p.goto(BASE+'?test='+C);await p.waitForFunction(()=>window.__chk&&window.__bv,null,{timeout:240000});await p.waitForTimeout(3000);
 const r=await p.evaluate(()=>({c3:__c3.stat(),bs:__c3.bs()}));
 console.log(JSON.stringify(r));await b.close()})();

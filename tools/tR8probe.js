// tR8probe (r8c): boot a city on the built page and print the JSON of one eval. node tools/tR8probe.js <base url> <ath|fra> '<js expr>'
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,city,JS]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.setDefaultTimeout(900000);
 await p.goto(BASE+'?test='+city);await p.waitForFunction(()=>window.__tk&&window.__tq&&__tq.ready,null,{timeout:600000});await p.waitForTimeout(3000);
 console.log(JSON.stringify(await p.evaluate(s=>__tk.q(s),JS)));await b.close()})();

const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const [U,C,J]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await b.newContext({viewport:{width:852,height:393}})).newPage();p.setDefaultTimeout(300000);
await p.goto(U+'?test='+C+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__qa,null,{polling:250,timeout:300000});
console.log(await p.evaluate(async s=>{try{return JSON.stringify(await window.__qa.ev(s))}catch(e){return'ERR '+e}},fs.readFileSync(J,'utf8')));await b.close()})();

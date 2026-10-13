// tools/ct/ev.js <url> <js expr> : load the page to the menu and print JSON of an expression (city-1 quick checks)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [URL,EX]=process.argv.slice(2);const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await (await b.newContext({viewport:{width:852,height:393}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000});
 console.log(JSON.stringify(await p.evaluate(EX)));console.log('ERR',JSON.stringify(errs.slice(0,4)));await b.close()})();

const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__gp&&window.__mho,null,{timeout:180000});console.log(JSON.stringify(await p.evaluate(process.argv[3]),null,1));console.log('ERR',errs);await b.close()})();

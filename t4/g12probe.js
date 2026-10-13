// t4/g12probe.js: open the builder, enter the canvas, run an expression from argv[3] (JS, returns JSON), shot to argv[4]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error'||/PA|warn/.test(m.text()))errs.push(m.type()+':'+m.text())});
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
 await p.click('#gbMenuBtn');await p.waitForTimeout(1500);await p.click('#r2R [data-r2m="build"]');await p.waitForTimeout(2000);
 console.log(JSON.stringify(await p.evaluate(s=>eval(s),process.argv[3])));await p.waitForTimeout(+(process.env.W||0));if(process.env.E2)console.log(JSON.stringify(await p.evaluate(s=>eval(s),process.env.E2)));if(process.argv[4])await p.screenshot({path:process.argv[4]});console.log('ERR',JSON.stringify(errs.slice(0,8)));await b.close()})();

const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
await p.tap('#gbMenuBtn');await p.waitForTimeout(4000);await p.screenshot({path:'wb/rev/07_garage.png'});console.log('ERR',JSON.stringify(errs));await b.close()})();

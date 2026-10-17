// tRv3Dev (rv2k3/devui2): node tools/tRv3Dev.js <base url> <outdir> [portrait|land] [off]  runs the devui2 GO (off = with the yield disabled = old behaviour) and saves roam / result / garage shots
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT,M,OFF]=process.argv.slice(2);const por=M!=='land';require('fs').mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:por?{width:393,height:852}:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.on('response',r=>{if(r.status()>=400)console.log('HTTP',r.status(),r.url().slice(-80))});p.setDefaultTimeout(600000);
 await p.goto(BASE+'?test=fra');await p.waitForFunction(()=>window.__chk&&window.__tq&&__tq.ready,null,{timeout:400000});await p.waitForTimeout(3000);
 await p.evaluate(o=>{if(o)window.__noDevYield=1},OFF);
 const r=await p.evaluate(()=>{window.__shotHook=1;return __chk.GO['rv2k3/devui2'][0].fn()});console.log(r.slice(0,420));
 const sh=async n=>{await p.evaluate(()=>__tq.draw()).catch(()=>{});await p.waitForTimeout(400);await p.screenshot({path:OUT+'/'+n+(por?'_por':'_land')+'.jpg',type:'jpeg',quality:75})};
 await p.evaluate(()=>__tk.q("(()=>{gbOpen();[...document.querySelectorAll('#gbx .gbTabs button')].find(b=>/paint/i.test(b.textContent)).click();DEV_yield();return 1})()"));await sh('garage');await p.evaluate(()=>__tk.q('gbClose(false)'));
 await p.evaluate(()=>__tk.q('(()=>{__rv3.race(.15,300,true);DEV_yield();return 1})()'));await sh('result');
 await b.close()})();

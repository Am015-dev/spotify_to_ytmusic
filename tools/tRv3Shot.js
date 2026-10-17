// tRv3Shot (rv2k3): node tools/tRv3Shot.js <base url> <out png> [portrait|land]  smash GO stopped at 0.5 s, then one screenshot (K stays released)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT,M]=process.argv.slice(2);const por=M!=='land';
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:por?{width:393,height:852}:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.setDefaultTimeout(600000);
 await p.goto(BASE+'?test=fra');await p.waitForFunction(()=>window.__chk&&window.__tq&&__tq.ready,null,{timeout:400000});await p.waitForTimeout(3000);
 const r=await p.evaluate(()=>{window.__rv3stop=15;const T=__chk.GO['rv2k3/debris-por'][0];const o=T.fn();window.__rv3stop=0;return o});console.log(r.slice(0,300));
 await p.evaluate(()=>__tq.draw()).catch(()=>{});await p.screenshot({path:OUT});await b.close()})();

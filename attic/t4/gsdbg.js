// t4/gsdbg.js: open the garage (RIDES) at 852x393 and report the studio state + one shot. usage: node t4/gsdbg.js <url> <out.png> [js-to-eval-before-shot]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});await p.click('#gbMenuBtn');await p.waitForTimeout(3000);
 if(process.argv[4])console.log('eval',await p.evaluate(process.argv[4]));await p.waitForTimeout(3000);
 console.log(await p.evaluate(()=>{const S=__gs.S,GB=__gs.GB(),R=[];GB.sc.traverse(o=>{if(o.isLight)R.push(o.type+':'+o.intensity.toFixed(2)+(o.castShadow?'*':''))});let cs=0;GB.mesh.traverse(o=>{if(o.castShadow)cs++});return JSON.stringify({on:S.on,gy:S.gy,lights:R,cast:cs,sm:GB.r.shadowMap.enabled,exp:GB.r.toneMappingExposure})}));
 await p.screenshot({path:process.argv[3]});console.log('ERR',errs.slice(0,5));await b.close()})();

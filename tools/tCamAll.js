// tCamAll: cam: assert on EVERY ride, state only (no driving, no rendering): __cam.audit() builds each ride off-screen, solves its chase camera for
// 852×393 and 393×852, raycasts to the road 10 m past the nose and reads the ride's share of the screen height. Prints FAIL lines + "GO n/m".
//   node tools/tCamAll.js <url …/index.html> [ids comma-separated]   env ALL=1 prints every ride, STOCK=1 = the old stock camera (proves the assert can fail)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await b.newContext({viewport:{width:852,height:393}})).newPage();p.setDefaultTimeout(180000);
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));const t0=Date.now();
 await p.goto(process.argv[2]+(process.argv[2].includes('?')?'&':'?')+'test=fra&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready&&window.__cam,null,{polling:250,timeout:180000});
 const ids=process.argv[3]?process.argv[3].split(','):null;const r=await p.evaluate(async([ids,stk])=>{const r=await __cam.audit(ids,stk);return r},[ids,process.env.STOCK==='1']);
 const f=o=>o.err?o.err:['land','port'].map(k=>{const v=o[k];return k+(v.ok?' ok':' FAIL')+' fill '+v.fill+' bot '+v.bot+' road '+v.rx+','+v.ry+(v.hit?' HIDDEN':'')+' cam '+v.b+'/'+v.h+(v.keep?' stock':'')+(v.fail?' NOFIT':'')}).join(' · ');
 for(const o of(process.env.ALL==='1'?r.all:r.bad))console.log((o.ok?'PASS ':'FAIL ')+o.id+' ('+o.n+') L '+o.L+' H '+o.H+' · '+f(o));
 if(errs.length)console.log('FAIL page errors '+JSON.stringify(errs.slice(0,3)));console.log(`GO ${r.ok}/${r.n} · audit ${(r.ms/1000).toFixed(1)} s · total ${((Date.now()-t0)/1000).toFixed(0)} s`);await b.close()})();

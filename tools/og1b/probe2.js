// og1b probe runner on the BUILT page (U=url, default out/og1b), phone profile (iPhone UA, 852x393 touch, THROTTLE=n optional):
// waits for the lazy GO chunk (window.__og.ev), runs a page script (PG, default probe2.page.js) in the game scope, prints one PROBE line
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 const p=await c.newPage();const E=[];p.on('pageerror',e=>E.push(String(e).slice(0,200)));
 if(process.env.THROTTLE){const d=await c.newCDPSession(p);await d.send('Emulation.setCPUThrottlingRate',{rate:+process.env.THROTTLE})}
 await p.goto((process.env.U||'http://127.0.0.1:8766/out/og1b/index.html?xcall=1')+(process.env.Q||''),{timeout:300000});
 await p.waitForFunction(()=>window.__xc&&window.__xc.XC.done,null,{timeout:400000,polling:1000});
 const SRC=require('fs').readFileSync(__dirname+'/'+(process.env.PG||'probe2.page.js'),'utf8');
 await p.evaluate(S=>{window.__p2=null;const pr=window.__xc.ev('('+S.trim()+')');Promise.resolve(pr).then(r=>window.__p2={r},e=>window.__p2={e:String(e&&e.stack||e)})},SRC);
 await p.waitForFunction(()=>window.__p2,null,{timeout:900000,polling:1000});const r=await p.evaluate(()=>window.__p2);
 console.log('PROBE',JSON.stringify(r));
 if(process.env.SHOT)await p.screenshot({path:process.env.SHOT});
 console.log('ERR',E.length,E.slice(0,3).join(' | '));await b.close()})().catch(e=>{console.log('PROBE_FAIL',String(e).slice(0,300));process.exit(1)});

// rev47: is the og3 HUD kit there at reveal? Polls every 30 ms from page start; logs the first frame the loader is gone and the state is drivable.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [URL_,TAG,CPU]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const c=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 const p=await c.newPage();p.setDefaultTimeout(900000);
 await c.addInitScript(()=>{const t0=performance.now();const iv=setInterval(()=>{try{if(state==='loading'||LD.on||LD.busy)return;const hk=document.getElementById('hk');window.__rv={ms:Math.round(performance.now()-t0),state,hk:!!hk,hkHidden:hk?hk.hidden:null,hkMode:typeof HK_mode==='function'?HK_mode():null,spd:hk?hk.querySelector('#hkSpdN').textContent:null,oldGauge:!!document.getElementById('roamGauge'),og3:document.body.classList.contains('og3')};clearInterval(iv)}catch(e){}},30)});
 if(+CPU>1){const cdp=await c.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:+CPU})}
 await p.goto(URL_);await p.waitForFunction(()=>window.__rv,null,{timeout:900000});const r1=await p.evaluate(()=>window.__rv);
 await p.waitForTimeout(1500);const r2=await p.evaluate(()=>{const hk=document.getElementById('hk');return{hk:!!hk,hkHidden:hk?hk.hidden:null,mode:typeof HK_mode==='function'?HK_mode():null}});
 console.log('REVEAL',TAG,'cpu',CPU,JSON.stringify(r1),'+1.5s',JSON.stringify(r2));await b.close()})().catch(e=>{console.log('SCRIPT_ERR',String(e).slice(0,300));process.exit(1)});

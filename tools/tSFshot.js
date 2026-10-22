// tSFshot (speed-boost-feel-r22e4): node tools/tSFshot.js <base url> <out dir> [city]  852x393 roam shots: cruise 50 km/h, 130 km/h, boosting (speed held each frame, real loop)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT,CITY]=process.argv.slice(2);const fs=require('fs');fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await c.newPage();p.setDefaultTimeout(400000);
 await p.goto(BASE+'?test='+(CITY||'fra'));await p.waitForFunction(()=>window.__chk&&window.__tq&&__tq.ready,null,{timeout:400000});await p.waitForTimeout(3000);
 for(const [n,kmh,bo] of [['cruise50',50,0],['fast130',130,0],['boost',130,1]]){
  await p.evaluate(([kmh,bo])=>__tk.q(`(()=>{window.__sfT=${kmh}/3.6;window.__sfB=${bo};if(!window.__sfL){window.__sfL=1;const f=()=>{try{if(window.__sfT!=null){RO.v=window.__sfT;if(window.__sfB)RO.turbo=1}}catch(e){}requestAnimationFrame(f)};f()}})()`),[kmh,bo]);
  await p.waitForTimeout(bo?1500:kmh>100?4000:2500);await p.screenshot({path:OUT+'/'+n+'.png'});console.log(n,JSON.stringify(await p.evaluate(()=>window.__sf.st())))}
 await b.close()})();

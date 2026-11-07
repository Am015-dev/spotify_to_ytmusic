/* Screenshots of the first minute: title, first turn, rival turn, result (phone and pc). Usage: PW=../node_modules/playwright node shoot.js <outdir-prefix> */
const path=require('path'),{chromium}=require(process.env.PW||'playwright'),gx=require('../scripts/gx-serve.js');
const pre=process.argv[2]||'shots/a';
(async()=>{const url=await gx.url('redline-rally',{file:path.join(__dirname,'redline-rally.html')});const b=await chromium.launch({args:['--no-sandbox']});
for(const [n,vp,t] of [['phone',{width:390,height:763},true],['pc',{width:1440,height:860},false]]){
 const c=await b.newContext({viewport:vp,hasTouch:t,isMobile:t,deviceScaleFactor:1}),p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.addInitScript(()=>{localStorage.setItem('gxt-redline-rally',JSON.stringify({done:1}));localStorage.setItem('rr_seen','1')});
 await p.goto(url+(url.includes('?')?'&':'?')+'seed=7',{waitUntil:'load'});await p.waitForTimeout(500);await p.screenshot({path:`${pre}-${n}-1title.png`});
 await p.click('#playB');await p.waitForSelector('#goB');await p.waitForTimeout(2600);await p.screenshot({path:`${pre}-${n}-2turn.png`});
 await p.click('#sugB');await p.waitForTimeout(300);await p.screenshot({path:`${pre}-${n}-3picked.png`});
 await p.click('#goB');await p.waitForTimeout(1800);await p.screenshot({path:`${pre}-${n}-4play.png`});
 await p.waitForTimeout(5200);await p.screenshot({path:`${pre}-${n}-5rival.png`});
 await p.evaluate(()=>{window.AIDELAY=.05});
 for(let i=0;i<700;i++){const r=await p.evaluate(()=>!!document.querySelector('#modal .podium'));if(r)break;
  const ok=await p.evaluate(()=>{const g=document.querySelector('#goB');return g&&!g.disabled&&g.offsetParent});
  const vis=await p.evaluate(()=>{const g=document.querySelector('#goB');return g&&g.offsetParent&&!UI.busy});if(vis){await p.click('#sugB').catch(()=>{});await p.waitForTimeout(80);await p.click('#goB').catch(()=>{})}
  const sl=await p.$('#slipN');if(sl)await sl.click().catch(()=>{});
  await p.waitForTimeout(150)}
 await p.waitForTimeout(600);await p.screenshot({path:`${pre}-${n}-6result.png`});
 console.log(n,'errs',errs.join('|'));await c.close()}
await b.close();process.exit(0)})();

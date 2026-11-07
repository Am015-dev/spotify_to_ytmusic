/* Real shots for review: title, upgrade cards, board mid-race, result; phone 390x763 and pc 1440x860. Usage: PW=../node_modules/playwright node free-art/tools/review-shots.js <outdir> */
const path=require('path'),{chromium}=require(process.env.PW||'playwright'),gx=require('../../../scripts/gx-serve.js');
const out=process.argv[2]||'free-art/review/raw';require('fs').mkdirSync(out,{recursive:true});
(async()=>{const url=await gx.url('redline-rally',{file:path.join(__dirname,'..','..','redline-rally.html')});const b=await chromium.launch({args:['--no-sandbox']});
for(const [n,vp,t] of [['phone',{width:390,height:763},true],['pc',{width:1440,height:860},false]]){
 const c=await b.newContext({viewport:vp,hasTouch:t,isMobile:t,deviceScaleFactor:2}),p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.addInitScript(()=>{localStorage.setItem('gxt-redline-rally',JSON.stringify({done:1}));localStorage.setItem('rr_seen','1')});
 await p.goto(url+(url.includes('?')?'&':'?')+'seed=7',{waitUntil:'load'});await p.waitForTimeout(600);await p.screenshot({path:`${out}/${n}-1title.png`});
 await p.click('#playB');await p.waitForTimeout(1200);
 if(await p.$('.upgrid')){await p.screenshot({path:`${out}/${n}-3upgrade.png`});await p.click('.upc:not([disabled])');await p.waitForTimeout(500)}
 for(let i=0;i<4;i++){if(await p.$('.upgrid')){await p.click('.upc:not([disabled])').catch(()=>{});await p.waitForTimeout(400)}}
 await p.waitForSelector('#goB',{timeout:20000});await p.waitForTimeout(2200);await p.click('#sugB').catch(()=>{});await p.click('#goB').catch(()=>{});await p.waitForTimeout(2500);
 for(let k=0;k<3;k++){await p.evaluate(()=>{window.AIDELAY=.05});await p.click('#sugB').catch(()=>{});await p.waitForTimeout(100);await p.click('#goB').catch(()=>{});await p.waitForTimeout(2200)}
 await p.screenshot({path:`${out}/${n}-2board.png`});
 for(let i=0;i<900;i++){if(await p.evaluate(()=>!!document.querySelector('#modal .podium')))break;
  const vis=await p.evaluate(()=>{const g=document.querySelector('#goB');return g&&g.offsetParent&&!UI.busy});if(vis){await p.click('#sugB').catch(()=>{});await p.waitForTimeout(60);await p.click('#goB').catch(()=>{})}
  const sl=await p.$('#slipN');if(sl)await sl.click().catch(()=>{});await p.waitForTimeout(120)}
 await p.waitForTimeout(700);await p.screenshot({path:`${out}/${n}-4result.png`});
 console.log(n,'errs',errs.join('|')||'none');await c.close()}
await b.close();process.exit(0)})();

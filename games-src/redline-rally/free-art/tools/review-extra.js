/* Upgrade draft cards + Story map shots. Usage: PW=<abs playwright> node free-art/tools/review-extra.js <outdir> */
const path=require('path'),{chromium}=require(process.env.PW||'playwright'),gx=require('../../../scripts/gx-serve.js');
const out=process.argv[2]||'free-art/review/raw';require('fs').mkdirSync(out,{recursive:true});
(async()=>{const url=await gx.url('redline-rally',{file:path.join(__dirname,'..','..','redline-rally.html')});const b=await chromium.launch({args:['--no-sandbox']});
for(const [n,vp,t] of [['phone',{width:390,height:763},true],['pc',{width:1440,height:860},false]]){
 const c=await b.newContext({viewport:vp,hasTouch:t,isMobile:t,deviceScaleFactor:2}),p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.addInitScript(()=>{localStorage.setItem('gxt-redline-rally',JSON.stringify({done:1}));localStorage.setItem('rr_seen','1')});
 await p.goto(url+(url.includes('?')?'&':'?')+'seed=7',{waitUntil:'load'});await p.waitForTimeout(500);
 await p.click('#storyB');await p.waitForTimeout(1200);await p.screenshot({path:`${out}/${n}-5story.png`});
 await p.goto(url+(url.includes('?')?'&':'?')+'seed=7',{waitUntil:'load'});await p.waitForTimeout(500);
 if(!(await p.isVisible('#quickBody')))await p.click('#quickT');await p.waitForTimeout(200);
 await p.evaluate(()=>{const e=document.querySelector('#s-upg');const bs=e?e.querySelectorAll('button'):[];if(bs[1])bs[1].click()});await p.waitForTimeout(200);
 await p.click('#playB');await p.waitForTimeout(1200);await p.screenshot({path:`${out}/${n}-3upgrade.png`});
 console.log(n,'upgrid',!!(await p.$('.upgrid')),'errs',errs.join('|')||'none');await c.close()}
await b.close();process.exit(0)})();

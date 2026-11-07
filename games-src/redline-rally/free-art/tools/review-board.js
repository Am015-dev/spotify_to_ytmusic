/* Board at three sizes. Usage: PW=<abs playwright> node free-art/tools/review-board.js <outdir> */
const path=require('path'),{chromium}=require(process.env.PW||'playwright'),gx=require('../../../scripts/gx-serve.js');
const out=process.argv[2];require('fs').mkdirSync(out,{recursive:true});
(async()=>{const url=await gx.url('redline-rally',{file:path.join(__dirname,'..','..','redline-rally.html')});const b=await chromium.launch({args:['--no-sandbox']});
for(const [n,vp,t] of [['390x763',{width:390,height:763},true],['844x390',{width:844,height:390},true],['1440x860',{width:1440,height:860},false]]){
 const c=await b.newContext({viewport:vp,hasTouch:t,isMobile:t,deviceScaleFactor:1}),p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.addInitScript(()=>{localStorage.setItem('gxt-redline-rally',JSON.stringify({done:1}));localStorage.setItem('rr_seen','1')});
 await p.goto(url+(url.includes('?')?'&':'?')+'seed=7',{waitUntil:'load'});await p.waitForTimeout(400);
 await p.click('#playB');await p.waitForSelector('#goB',{timeout:20000});await p.waitForTimeout(2200);
 await p.click('#sugB').catch(()=>{});await p.click('#goB').catch(()=>{});await p.waitForTimeout(3500);
 const m=await p.evaluate(()=>{const w=document.querySelector('#cvw').getBoundingClientRect(),c=document.querySelector('#cv');return {cvw:[w.width|0,w.height|0],cv:[c.width,c.height],css:[c.clientWidth,c.clientHeight],UI:[UI.W|0,UI.H|0]}});
 console.log(n,JSON.stringify(m),'errs',errs.join('|')||'none');
 await p.screenshot({path:`${out}/board-${n}.png`});await c.close()}
await b.close();process.exit(0)})();

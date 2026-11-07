const path=require('path'),{chromium}=require(process.env.PW||'playwright'),gx=require('../scripts/gx-serve.js');
(async()=>{const url=await gx.url('redline-rally',{file:path.join(__dirname,'redline-rally.html')});const b=await chromium.launch({args:['--no-sandbox']});
for(const [n,vp,t] of [['phone',{width:390,height:763},true],['pc',{width:1440,height:860},false]]){
 const c=await b.newContext({viewport:vp,hasTouch:t,isMobile:t}),p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(url,{waitUntil:'load'});await p.waitForTimeout(400);await p.screenshot({path:`shots/l-${n}-1title.png`});
 await p.evaluate(()=>{localStorage.setItem('gxt-redline-rally',JSON.stringify({done:1}))});
 await p.click('#storyB');await p.waitForTimeout(600);await p.screenshot({path:`shots/l-${n}-2map.png`});await p.evaluate(()=>{GXC.close&&GXC.close()});await p.waitForTimeout(300);await p.screenshot({path:`shots/l-${n}-1b.png`});await p.click('#playB');await p.waitForSelector('#goB');await p.waitForTimeout(500);await p.screenshot({path:`shots/l-${n}-3board.png`});await p.click('[data-gx=rulesd]');await p.waitForTimeout(500);await p.screenshot({path:`shots/l-${n}-4rules.png`});
 console.log(n,'errs',errs.join('|'));await c.close()}
await b.close();process.exit(0)})();

const path=require('path'),{chromium}=require(process.env.PW||'playwright'),gx=require('../scripts/gx-serve.js');const pre=process.argv[2]||'shots/t';
(async()=>{const url=await gx.url('redline-rally',{file:path.join(__dirname,'redline-rally.html')});const b=await chromium.launch({args:['--no-sandbox']});
for(const [n,vp,t] of [['phone',{width:390,height:763},true],['pc',{width:1440,height:860},false]]){const c=await b.newContext({viewport:vp,hasTouch:t,isMobile:t}),p=await c.newPage();
 await p.goto(url,{waitUntil:'load'});await p.waitForTimeout(400);await p.screenshot({path:`${pre}-${n}-0title-first.png`});await p.click('#tutSlot button');
 for(let s=1;s<=3;s++){await p.waitForFunction(()=>GXT.state().shown,null,{timeout:8000});await p.waitForTimeout(500);await p.screenshot({path:`${pre}-${n}-${s}step.png`});
  const nb=await p.$('.gxt-next');if(nb)await nb.click();else{const sel=await p.evaluate(()=>GXT.state().id);const map={gear:'.gb[data-g="2"]'};if(sel==='gear')await p.click(map.gear)}
  await p.waitForTimeout(400)}
 await c.close()}await b.close();process.exit(0)})();

// t4/g8desk.js: desktop 1280x720 builder (existing car) + held part with the STEP buttons → shot. usage: node t4/g8desk.js <url> <out.png>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
 await p.evaluate(()=>document.querySelector('#gbMenuBtn').click());await p.waitForTimeout(1500);await p.evaluate(()=>__gb.enter());await p.waitForTimeout(4000);await p.screenshot({path:process.argv[3]});
 console.log('redo btn',await p.$eval('#gbBkT [data-a="redo"]',e=>e.getBoundingClientRect().x|0),'view',await p.evaluate(()=>{const v=__gs.GB().cam.view;return v&&v.enabled?v.offsetY:null}),'ERR',errs.slice(0,5));await b.close()})();

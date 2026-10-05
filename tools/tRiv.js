// tParts.js — render every builder part on one sheet + the palette tabs. node tools/tParts.js <outdir>  (needs http.server 8766 and local.html)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const OUT=process.argv[2];fs.mkdirSync(OUT,{recursive:true});
(async()=>{const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await br.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(600000);
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));
await p.goto('http://127.0.0.1:8766/local.html');await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_athpre','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));localStorage.setItem('mho_story@1',JSON.stringify({ath:1}))});
await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{try{__m1&&__m1.skip&&__m1.skip()}catch(e){}__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam');await p.evaluate(()=>__mho.storyClose&&__mho.storyClose());await p.waitForTimeout(1500);
await p.evaluate(()=>document.querySelector('#roamPause [data-p="garage"]')?.click()||__mho.pause?.());await p.waitForTimeout(500);
await p.waitForFunction(()=>!document.querySelector('#gbx').hidden,null,{timeout:8000}).catch(async()=>{await p.keyboard.press('Escape');await p.waitForTimeout(500);await p.evaluate(()=>document.querySelector('#roamPause [data-p="garage"]').click());await p.waitForFunction(()=>!document.querySelector('#gbx').hidden)});
await p.evaluate(()=>document.querySelector('#gbx .gbTabs [data-t="bricks"]').click());await p.waitForTimeout(1200);await p.evaluate(()=>__gb.preset(0));await p.waitForTimeout(500);
await p.evaluate(()=>{for(const s of['#gbBkP','#gbBkT','#gbBkS','#crSt','#gbBkN'])document.querySelectorAll(s).forEach(e=>e.style.display='none')});
const ids=await p.evaluate(()=>Object.keys(__cr.RIVS).filter(k=>k!=='shadow'));
for(const id of ids){await p.evaluate(id=>{__gb.d().bricks=__cr.rivB({id}).map(b=>({...b}));__gb.d().bp=1;__gb.refresh()},id);await p.waitForTimeout(800);await p.screenshot({path:`${OUT}/r_${id}.png`})}
console.log('errs',errs);await br.close()})();

// t4/g10ld.js: menu → STORY with a real tap; log state/loading each 5 s + console errors. usage: node t4/g10ld.js <url>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push('PE '+String(e)));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.text().slice(0,200))});
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
 await p.tap('#hcStory');for(let i=0;i<60;i++){await p.waitForTimeout(5000);const s=await p.evaluate(()=>__mho.state+'|'+!!(__mho.LD&&__mho.LD.on)+'|'+(document.querySelector('#slotList .go')?'slot':''));console.log(i*5,s,JSON.stringify(errs.splice(0)));
  const e=await p.$('#slotList .go');if(e&&await e.isVisible())await e.tap();if(s.startsWith('roam|false'))break}
 await p.screenshot({path:'t4/g9/ld.png'});await b.close()})();

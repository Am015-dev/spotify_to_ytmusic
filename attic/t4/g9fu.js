// t4/g9fu.js: coordinator follow-ups at 852x393 with real taps. (1) RIDES → BUILD YOUR OWN: no brick shower over the chassis picker; picking a
// chassis plays it. (2) the "Graphics: …" line is not visible on the menu. usage: node t4/g9fu.js <url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const O=process.argv[3];fs.mkdirSync(O,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
 console.log('gfxNote visible',await p.evaluate(()=>{const e=document.querySelector('#gfxNote');return !!(e&&e.offsetParent)}));await p.screenshot({path:`${O}/menu.png`});
 await p.tap('#gbMenuBtn');await p.waitForTimeout(1500);await p.tap('#gbx .gbTabs [data-t="veh"]');await p.waitForTimeout(1500);const n0=await p.evaluate(()=>__g8.shower());
 await p.tap('.gnbGo');const t=[];for(let i=0;i<6;i++){await p.waitForTimeout(250);t.push(await p.evaluate(()=>[!!document.querySelector('#g8Sh'),!!(document.querySelector('#gnbP')&&document.querySelector('#gnbP').offsetParent)]))}
 console.log('picker open, shower canvas over it per 250 ms:',JSON.stringify(t));await p.screenshot({path:`${O}/picker.png`});
 await p.tap('#gnbP [data-ch="sc8"]');await p.waitForTimeout(300);console.log('after pick: shower',await p.evaluate(()=>!!document.querySelector('#g8Sh')),'showers',n0,'→',await p.evaluate(()=>__g8.shower()));await p.waitForTimeout(2500);await p.screenshot({path:`${O}/after_pick.png`});
 console.log('ERR',errs.slice(0,5));await b.close()})();

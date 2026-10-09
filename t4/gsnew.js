// t4/gsnew.js: garage → BUILD YOUR OWN → chassis, one shot of the bare builder at 852x393 (touch). usage: node t4/gsnew.js <url> <out.png>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
 for(const s of['#gbMenuBtn','#gbx .gbTabs button[data-t="veh"]','.gnbGo','[data-ch="sc8"]']){await p.tap(s);await p.waitForTimeout(1500)}
 await p.waitForTimeout(4000);await p.screenshot({path:process.argv[3]});console.log('thumbs',await p.evaluate(()=>__gs.thumbs()),'ERR',errs.slice(0,5));await b.close()})();

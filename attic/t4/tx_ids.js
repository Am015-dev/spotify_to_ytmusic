// t4/tx_ids.js <url> <png>: phone, garage → BUILD, search "3069" by typing, shot of the tiles with LEGO ids
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});const W=ms=>p.waitForTimeout(ms);
await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
const tap=async s=>{const e=await p.$(s);if(!e)return console.log('NO',s);await e.scrollIntoViewIfNeeded().catch(()=>{});const bb=await e.boundingBox();await p.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2);await W(900)};
await tap('#gbMenuBtn');await W(1500);await tap('#r2R [data-r2m="build"]');await W(2000);await p.screenshot({path:process.argv[3].replace('.png','_all.png')});
await tap('#g13Qi');await p.keyboard.type('3069');await W(800);await p.screenshot({path:process.argv[3]});
console.log('ids',await p.evaluate(()=>[...document.querySelectorAll('#gbBkPc .gbPc')].filter(e=>e.style.display!=='none').slice(0,6).map(e=>e.dataset.p+':'+(e.querySelector('.txId')||{}).textContent).join(' ')));
console.log('ERR',JSON.stringify(errs.slice(0,5)));await b.close()})();

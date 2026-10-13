// t4/paint.js: reproduce "paint does not work" with real taps. usage: node t4/paint.js <url> <outdir> [desk]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const URL=process.argv[2]||'http://127.0.0.1:8766/local_dbg.html',OUT=process.argv[3]||'t4/out',DESK=process.argv[4]==='desk';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext(DESK?{viewport:{width:1280,height:720}}:{viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&document.querySelector('#gbMenuBtn')&&!document.querySelector('#topBtns').hidden,null,{timeout:180000});
 const tap=async s=>{const e=await p.$(s);if(!e){console.log('NO',s);return}const bb=await e.boundingBox();if(!bb){console.log('HIDDEN',s);return}const x=bb.x+bb.width/2,y=bb.y+bb.height/2;if(DESK)await p.mouse.click(x,y);else await p.touchscreen.tap(x,y);await p.waitForTimeout(500)};
 const shot=async n=>{await p.screenshot({path:`${OUT}/${n}.png`});console.log('shot',n)};
 await tap('#gbMenuBtn');await p.waitForTimeout(1500);await shot('01_garage');
 console.log('tabs',await p.$$eval('#gbx .gbTabs button',a=>a.map(x=>x.dataset.t+':'+x.textContent+(x.offsetParent?'':'(hid)'))));
 await tap('#gbx .gbTabs button[data-t="paint"]');await p.waitForTimeout(800);await shot('02_paint');
 const on=()=>p.$$eval('#gbBody .gbSw button.on',a=>a.map(x=>x.dataset.k+'='+x.dataset.v));console.log('before',await on());
 const sws=await p.$$('#gbBody .gbSw button');console.log('swatches',sws.length);
 if(sws.length>3){const bb=await sws[3].boundingBox();console.log('sw bb',JSON.stringify(bb));if(DESK)await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);else await p.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2);await p.waitForTimeout(1000)}
 console.log('after',await on());await p.waitForTimeout(3000);await shot('03_painted');await tap('#gbx .gbTabs button[data-t="parts"]');await p.waitForTimeout(1500);await shot('03b_parts');
 await tap('#gbSave');await p.waitForTimeout(1500);console.log('saved',await p.evaluate(()=>{const k=Object.keys(localStorage).filter(k=>k.includes('mho_build'));return k.map(x=>{const d=JSON.parse(localStorage.getItem(x)||'null')||{};return x+' a='+d.a+' bricks='+(d.bricks||[]).length+' cols='+[...new Set((d.bricks||[]).map(b=>b.c))].join(',')})}));await p.waitForTimeout(4000);await shot('04_after_save');
 console.log('gp',await p.evaluate(()=>JSON.stringify({pa:__gp.pa(),rank:__gp.build()})));
 console.log('ERR',errs.slice(0,5));await b.close()})();

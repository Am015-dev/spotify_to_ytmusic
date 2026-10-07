// t4/paint2.js: real-tap paint test. Garage → PAINT body/accent/trim → RIDES preview 4×4 + boat → SAVE → reload → garage → STORY → world car.
// usage: node t4/paint2.js <url> <outdir> [desk]   (no ?fast=1: the fast mode does not redraw the garage canvas)
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const URL=process.argv[2]||'http://127.0.0.1:8766/local_dbg.html',OUT=process.argv[3]||'t4/o2',DESK=process.argv[4]==='desk';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext(DESK?{viewport:{width:1280,height:720}}:{viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 const ready=()=>p.waitForFunction(()=>window.__mho&&document.querySelector('#gbMenuBtn')&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
 const tapEl=async e=>{const bb=await e.boundingBox();if(!bb)return console.log('HIDDEN');const x=bb.x+bb.width/2,y=bb.y+bb.height/2;if(DESK)await p.mouse.click(x,y);else await p.touchscreen.tap(x,y);await p.waitForTimeout(700)};
 const tap=async s=>{const e=await p.$(s);if(!e)return console.log('NO',s);await tapEl(e)};
 const shot=async n=>{await p.waitForTimeout(1200);await p.screenshot({path:`${OUT}/${n}.png`});console.log('shot',n)};
 const sw=async(k,v)=>{const e=await p.$(`#gbBody .gbSw button[data-k="${k}"][data-v="${v}"]`);await e.scrollIntoViewIfNeeded();await tapEl(e)};
 await p.goto(URL);await ready();const x=await p.$('#updX, #upd .x');
 await tap('#gbMenuBtn');await tap('#gbx .gbTabs button[data-t="paint"]');await shot('01_paint_before');
 await sw('a','#2f7bff');await shot('02_body_blue');await sw('b','#ffd12c');await sw('c','#ffffff');await shot('03_accent_trim');
 await tap('#gbx .gbTabs button[data-t="veh"]');for(const k of['4x4','boat']){await tap(`#gbBody [data-gpv="${k}"]`);await shot('04_pv_'+k)}
 await tap('#gbSave');console.log('pa',await p.evaluate(()=>JSON.stringify(__gp.pa())),'rank',await p.evaluate(()=>JSON.stringify(__gp.build())));
 await p.reload();await ready();await tap('#gbMenuBtn');await tap('#gbx .gbTabs button[data-t="paint"]');await shot('05_after_reload');await tap('#gbSave');
 await tap('#hcStory');
 for(let i=0;i<40;i++){await p.waitForTimeout(3000);const s=await p.evaluate(()=>__mho.state+'|'+!!(__mho.LD&&__mho.LD.on));if(s==='roam|false')break;for(const q of['#slotList .go','#m1Next']){const e=await p.$(q);if(e&&await e.isVisible())await tapEl(e)}if(i%5==0)console.log('wait',s)}
 for(let i=0;i<6;i++){const e=await p.$('#m1Next');if(e&&await e.isVisible())await tapEl(e);await p.waitForTimeout(1500)}await shot('06_world');
 console.log('ERR',errs.slice(0,8));await b.close()})();

// tTBx.js — builder slice gate (track-2): menu entry → builder → EXPORT dialog (COPY) → IMPORT the code → TEST drive, by real taps.
// node tools/tTBx.js <url> <outdir> [phone|desk]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs'),path=require('path');
const URL=process.argv[2],OUT=process.argv[3]||'qa_tbx',MODE=process.argv[4]||'phone';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const phone=MODE==='phone';
 const ctx=await b.newContext(phone?{viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true}:{viewport:{width:1440,height:900}});await ctx.grantPermissions(['clipboard-read','clipboard-write']).catch(()=>{});
 const p=await ctx.newPage();p.setDefaultTimeout(300000);const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,300)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,300))});
 const shot=async n=>{await p.screenshot({path:path.join(OUT,MODE+'_'+n+'.jpg'),type:'jpeg',quality:80});console.log('SHOT',n)};
 const tapEl=async(sel)=>{const e=await p.$(sel);if(!e){console.log('MISSING',sel);return false}await e.scrollIntoViewIfNeeded().catch(()=>{});await p.waitForTimeout(150);const r=await e.boundingBox();if(phone)await p.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);else await p.mouse.click(r.x+r.width/2,r.y+r.height/2);await p.waitForTimeout(400);return true};
 await p.goto(URL);await p.waitForFunction(()=>window.__tb&&document.querySelector('#menu')&&!document.querySelector('#menu').hidden,null,{timeout:240000}).catch(()=>{});await p.waitForTimeout(1500);
 await shot('1_menu');
 const R={};R.menuBtn=await tapEl('#home .hfoot button:has-text("BUILDER")');await shot('2_list');
 R.edit=await tapEl('#tbOv .trk:has-text("Twister GP") button:has-text("EDIT")');await shot('3_builder');
 R.exp=await tapEl('#tbBar button:has-text("EXPORT")');await shot('4_export');
 const code=await p.$eval('#tbExp',e=>e.value).catch(()=>null);R.codeLen=code&&code.length;R.selectable=await p.$eval('#tbExp',e=>getComputedStyle(e).userSelect||getComputedStyle(e).webkitUserSelect).catch(()=>null);
 await tapEl('#tbOv button:has-text("COPY")');await p.waitForTimeout(200);R.toast=await p.$eval('#tbToast',e=>e.hidden?'':e.textContent);R.clip=await p.evaluate(()=>navigator.clipboard.readText().then(t=>t.slice(0,12),()=>'(no read)'));await shot('5_copied');
 // a "sent" code: the same track renamed, imported back through the paste box
 const t2=await p.evaluate(c=>{const t=__tb.decode(c);t.name='Alex Import';t.id='tb_alex_import';return __tb.code(t)},code);
 await tapEl('#tbOv button:has-text("BACK")');await tapEl('#tbBar button[title="My tracks"]');
 const ta=await p.$('#tbOv textarea[placeholder^="ODT1"]');await ta.scrollIntoViewIfNeeded();await ta.fill(t2);await shot('6_paste');
 R.imp=await tapEl('#tbOv button:has-text("IMPORT")');R.name=await p.evaluate(()=>__tb.get()&&__tb.get().name);R.saved=await p.evaluate(()=>__tb.state().list.includes('tb_alex_import'));await shot('7_imported');
 R.test=await tapEl('#tbBar button:has-text("TEST")');R.testState0=await p.evaluate(()=>__mho.state);await p.waitForFunction(()=>__mho&&__mho.state==='race',null,{timeout:120000}).catch(()=>{});await p.waitForTimeout(6000);await shot('8_test_drive');
 R.state=await p.evaluate(()=>__mho.state);R.track=await p.evaluate(()=>document.querySelector('#hTitle span')&&document.querySelector('#hTitle span').textContent);
 console.log('RESULT',JSON.stringify(R));console.log('ERRORS',JSON.stringify(errs));await b.close()})();

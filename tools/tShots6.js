// tShots6: the 6 integrator shots in ONE browser session via ?test= (Frankfurt drive, checklist, map, parked car, builder, Athens drive).
//   node tools/tShots6.js <url>/index.html <outdir>   → <outdir>/s1..s6 *.jpg (852×393) + console errors
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const B=process.argv[2],O=process.argv[3];fs.mkdirSync(O,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await (await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true})).newPage();p.setDefaultTimeout(120000);
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 const open=async c=>{await p.goto(B+'?test='+c+'&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:120000})};
 // draw on for a moment (the builder has its own render loop), then the picture
 const shot=async(f,ms=1500)=>{await p.evaluate(()=>{__tq.o.draw=1});await p.waitForTimeout(ms);await p.screenshot({path:O+'/'+f,type:'jpeg',quality:75});await p.evaluate(()=>{__tq.o.draw=0})};
 const drive=async ms=>{await p.keyboard.down('ArrowUp');await p.waitForTimeout(ms);await p.keyboard.up('ArrowUp')};
 await open('fra');await drive(4000);await shot('s1_fra_drive.jpg');
 await p.evaluate(()=>odChkOpen());await shot('s2_checklist.jpg',600);await p.evaluate(()=>{const o=document.getElementById('odChk');if(o)o.hidden=true;document.body.classList.remove('ckOn')});
 await p.keyboard.press('KeyM');await shot('s3_map.jpg');await p.keyboard.press('KeyM');
 await p.evaluate(()=>__chk.go('v90k/park-sit'));await p.waitForTimeout(2500);await shot('s4_parked.jpg');
 await p.evaluate(()=>__chk.go('bxA/bx-world'));await p.waitForTimeout(3000);await shot('s5_builder.jpg',3000);
 await open('ath');await drive(4000);await shot('s6_ath_drive.jpg');
 console.log(JSON.stringify({errors:errs.length,first:errs.slice(0,3)}));await b.close()})();

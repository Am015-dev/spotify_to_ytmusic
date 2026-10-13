// t4/toast.js: the "New in vX" bubble shows on the title screen and NOT on CHOOSE TRACK (852x393, fresh storage). usage: node t4/toast.js <url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const O=process.argv[3];fs.mkdirSync(O,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});await p.waitForTimeout(2500);
 const vis=()=>p.evaluate(()=>{const t=document.getElementById('odNew');return !!t&&!t.hidden&&getComputedStyle(t).display!=='none'});
 console.log('title',await vis());await p.screenshot({path:O+'/toast_title.png'});
 await p.tap('#menu .hc[data-a="quick"]');await p.waitForTimeout(2500);console.log('track',await vis());await p.screenshot({path:O+'/toast_track.png'});
 console.log('ERR',errs.slice(0,5));await b.close()})();

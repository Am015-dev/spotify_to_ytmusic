// t4/prof.js: title menu → PROFILE by real taps. usage: node t4/prof.js <url> <outdir> [desk]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const URL=process.argv[2],OUT=process.argv[3]||'t4/pf',DESK=process.argv[4]==='desk';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext(DESK?{viewport:{width:1280,height:720}}:{viewport:{width:852,height:393},isMobile:true,hasTouch:true});
 await ctx.addInitScript(()=>{if(!localStorage.getItem('mho_prof@1')){localStorage.setItem('mho_prof@1',JSON.stringify({xp:12150}));localStorage.setItem('mho_perks@1','["tank"]')}});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});await p.screenshot({path:OUT+'/00_menu.png'});
 const e=await p.$('#gpfBtn'),bb=await e.boundingBox();if(DESK)await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);else await p.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2);
 await p.waitForTimeout(1200);await p.screenshot({path:OUT+'/01_profile.png'});await p.$eval('#profile .pf',x=>x.scrollTop=x.scrollHeight);await p.waitForTimeout(500);await p.screenshot({path:OUT+'/02_profile_end.png'});
 const small=await p.$$eval('#profile *',a=>a.filter(e=>e.offsetParent&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).map(e=>[parseFloat(getComputedStyle(e).fontSize),e.textContent.trim().slice(0,24)]).filter(x=>x[0]<12));
 console.log('under12px',JSON.stringify(small.slice(0,10)));console.log('ERR',errs);await b.close()})();

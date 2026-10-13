// t4/perks.js: RIDES tab groups + PERKS slots by real taps. usage: node t4/perks.js <url> <outdir> [desk]  env XP=12150 seeds driver level 10
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const URL=process.argv[2],OUT=process.argv[3]||'t4/pk',DESK=process.argv[4]==='desk';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext(DESK?{viewport:{width:1280,height:720}}:{viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const XP=+(process.env.XP||12150);await ctx.addInitScript(xp=>{if(!localStorage.getItem('mho_prof@1'))localStorage.setItem('mho_prof@1',JSON.stringify({xp}))},XP);
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&document.querySelector('#gbMenuBtn')&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
 const tapEl=async e=>{await e.scrollIntoViewIfNeeded();const bb=await e.boundingBox();if(!bb)return console.log('HIDDEN');const x=bb.x+bb.width/2,y=bb.y+bb.height/2;if(DESK)await p.mouse.click(x,y);else await p.touchscreen.tap(x,y);await p.waitForTimeout(700)};
 const tap=async s=>{const e=await p.$(s);if(!e)return console.log('NO',s);await tapEl(e)};
 const shot=async n=>{await p.waitForTimeout(1000);await p.screenshot({path:`${OUT}/${n}.png`});console.log('shot',n)};
 await tap('#gbMenuBtn');await tap('#gbx .gbTabs button[data-t="veh"]');await shot('01_rides');
 await tap('[data-gslot="0"]');await shot('02_perk_list');
 console.log('perks',await p.$$eval('[data-gpk]',a=>a.map(x=>x.dataset.gpk+(x.disabled?'(lock)':''))));
 await tap('[data-gpk="tank"]');await shot('03_equipped');
 console.log('eq',await p.evaluate(()=>localStorage.getItem('mho_perks@1')));
 const small=await p.$$eval('#gbx *',a=>a.filter(e=>e.offsetParent&&e.childNodes.length&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).map(e=>[parseFloat(getComputedStyle(e).fontSize),e.textContent.trim().slice(0,30)]).filter(x=>x[0]<12));
 console.log('under12px',JSON.stringify(small.slice(0,12)));console.log('ERR',errs.slice(0,8));await b.close()})();

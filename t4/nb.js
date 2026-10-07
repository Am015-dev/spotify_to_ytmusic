// t4/nb.js: RIDES → BUILD YOUR OWN → chassis → place parts by taps → DONE → SAVE & DRIVE → story drive shot. usage: node t4/nb.js <url> <out> [desk]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const URL=process.argv[2],OUT=process.argv[3]||'t4/nb',DESK=process.argv[4]==='desk',CH=process.env.CH||'sc8';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext(DESK?{viewport:{width:1280,height:720}}:{viewport:{width:852,height:393},isMobile:true,hasTouch:true});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
 const tapXY=async(x,y)=>{if(DESK)await p.mouse.click(x,y);else await p.touchscreen.tap(x,y);await p.waitForTimeout(700)};
 const tapEl=async e=>{await e.scrollIntoViewIfNeeded();const bb=await e.boundingBox();if(!bb)return console.log('HIDDEN');await tapXY(bb.x+bb.width/2,bb.y+bb.height/2)};
 const tap=async s=>{const e=await p.$(s);if(!e)return console.log('NO',s);await tapEl(e)};
 const shot=async n=>{await p.waitForTimeout(1200);await p.screenshot({path:`${OUT}/${n}.png`});console.log('shot',n)};
 await tap('#gbMenuBtn');await tap('#gbx .gbTabs button[data-t="veh"]');await shot('01_rides');await tap('.gnbGo');await shot('02_picker');
 await tap(`[data-ch="${CH}"]`);await shot('03_chassis');console.log('n',await p.$eval('#gbBkN',e=>e.textContent));
 // place parts: pick a few part buttons in the drawer and tap on the car body
 const V=await (await p.$('#gbC')).boundingBox(),cx=V.x+V.width/2,cy=V.y+V.height*0.5;
 for(const [pc,dx,dy] of[['b24',0,0],['b24',0,-20],['slope',0,30],['spoiler',0,-45]]){const e=await p.$(`#gbBkPc [data-p="${pc}"]`);if(e){await p.$eval(`#gbBkPc [data-p="${pc}"]`,x=>{const c=x.dataset.ct;const t=document.querySelector(`#gbBkCt [data-ct="${c}"]`);t&&t.click()});await tapEl(e);await tapXY(cx+dx,cy+dy)}else console.log('nopc',pc)}
 await shot('04_built');console.log('n',await p.$eval('#gbBkN',e=>e.textContent));
 await tap('#gbBkT [data-a="done"]');await shot('05_done');await tap('#gbx .gbTabs button[data-t="veh"]');await shot('06_rides_mine');await tap('#gbSave');
 console.log('sel',await p.evaluate(()=>JSON.parse(localStorage.getItem('mho_gar@1')||'{}').sel),'bricks',await p.evaluate(()=>(JSON.parse(localStorage.getItem('mho_build@1')||'{}').bricks||[]).length));
 if(process.env.DRIVE){await tap('#hcStory');for(let i=0;i<60;i++){await p.waitForTimeout(3000);const s=await p.evaluate(()=>__mho.state+'|'+!!(__mho.LD&&__mho.LD.on));if(s==='roam|false')break;for(const q of['#slotList .go','#m1Next']){const e=await p.$(q);if(e&&await e.isVisible())await tapEl(e)}}
  for(let i=0;i<14;i++){let hit=0;for(const l of[p.getByText('SKIP',{exact:false}),p.getByText('TAP TO CONTINUE'),p.locator('#m1Next')]){const e=l.first();if(await e.count()&&await e.isVisible()){await tapEl(await e.elementHandle());hit=1;break}}if(!hit&&i>3)break;await p.waitForTimeout(1500)}
  await p.waitForTimeout(3000);await shot('07_drive');console.log('tyre',await p.evaluate(()=>{try{const R=__mho.RO;return (R.y-__mho.gnd(R.x,R.z,R.y+.3)).toFixed(3)}catch(e){return String(e)}}))}
 console.log('ERR',errs.slice(0,8));await b.close()})();

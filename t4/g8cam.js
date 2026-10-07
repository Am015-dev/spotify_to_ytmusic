// t4/g8cam.js: NEW BUILD at 852x393, then camera variants [[pit,k,dist],...] via __g8.T → shots. usage: node t4/g8cam.js <url> <outdir> '<json>'
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const O=process.argv[3];fs.mkdirSync(O,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
 for(const s of['#gbMenuBtn','#gbx .gbTabs button[data-t="veh"]','.gnbGo','[data-ch="sc8"]']){await p.tap(s);await p.waitForTimeout(1500)}await p.waitForTimeout(3000);
 console.log('init',await p.evaluate(()=>JSON.stringify({pit:__gb.GB_.pit,dist:__gb.GB_.dist,band:__g8.band(),sh:__g8.shower()})));
 let k=0;for(const[pit,kk,dist]of JSON.parse(process.argv[4])){await p.evaluate(([pit,kk,dist])=>{__gb.GB_.pit=pit;__g8.T.k=kk;if(dist)__gb.GB_.dist=dist},[pit,kk,dist]);
  await p.waitForTimeout(2500);await p.screenshot({path:`${O}/cam${k++}_${pit}_${kk}_${dist||0}.png`})}
 console.log('ERR',errs.slice(0,5));await b.close()})();

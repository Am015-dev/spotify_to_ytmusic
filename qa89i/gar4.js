const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const URL=process.argv[2],OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});await p.waitForTimeout(2500);
await p.click('#gbMenuBtn');await p.waitForTimeout(2000);await p.getByText('BUILD',{exact:true}).first().click();
for(const t of [2000,6000,10000]){await p.waitForTimeout(t);await p.screenshot({path:OUT+`/tiles_${t}.png`})}
const pk=await p.evaluate(()=>document.querySelector('#odPin')&&document.querySelector('#odPin p')&&document.querySelector('#odPin p').textContent);console.log(pk);console.log(errs);await b.close()})()

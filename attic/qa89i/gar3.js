const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const URL=process.argv[2],OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});await p.waitForTimeout(2500);
const R=()=>p.evaluate(()=>({pin:(()=>{const e=document.querySelector('#odPin');return e&&!e.hidden&&getComputedStyle(e).display!=='none'})(),y:document.body.classList.contains('odYield')}));
await p.click('#gbMenuBtn');await p.waitForTimeout(2000);await p.getByText('BUILD',{exact:true}).first().click();await p.waitForTimeout(1200);
await p.mouse.click(320,230);await p.waitForTimeout(1500);console.log('dropdown open',JSON.stringify(await R()));await p.screenshot({path:OUT+'/drop.png'});console.log(errs);await b.close()})()

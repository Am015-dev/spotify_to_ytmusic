const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const URL=process.argv[2],OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
await p.goto(URL,{timeout:120000});await p.waitForSelector('#gbMenuBtn',{state:'visible',timeout:240000});await p.waitForTimeout(3000);
await p.click('#gbMenuBtn');await p.waitForTimeout(2000);await p.getByText('BUILD',{exact:true}).first().click();await p.waitForTimeout(3000);await p.screenshot({path:OUT+'/build.png'});console.log(errs.slice(0,3));await b.close()})()

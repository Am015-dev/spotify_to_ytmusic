// t4/g8cam2.js: garage → BUILD (existing car) at 852x393; shots at several yaws. usage: node t4/g8cam2.js <url> <outdir> [preset index]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const O=process.argv[3];fs.mkdirSync(O,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
 await p.tap('#gbMenuBtn');await p.waitForTimeout(1500);await p.evaluate(()=>__gb.enter());await p.waitForTimeout(1500);
 if(process.argv[4])await p.tap(`#gbBkS [data-a="pre${process.argv[4]}"]`);await p.waitForTimeout(2500);
 let k=0;for(const y of[0,0.5,1.4,2.4]){await p.evaluate(y=>{__gb.GB_.yaw=Math.PI*.78+y},y);await p.waitForTimeout(2200);await p.screenshot({path:`${O}/yaw${k++}.png`})}
 console.log('n',await p.evaluate(()=>__gb.list().length),'ERR',errs.slice(0,5));await b.close()})();

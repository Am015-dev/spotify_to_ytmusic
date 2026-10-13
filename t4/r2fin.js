// t4/r2fin.js: close-up of each paint finish in the garage (PAINT mode). usage: node t4/r2fin.js <url> <outpng>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const pg=await (await b.newContext({viewport:{width:852,height:393}})).newPage();
 await pg.goto(process.argv[2]);await pg.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
 await pg.evaluate(()=>document.querySelector('#gbMenuBtn').click());await pg.waitForTimeout(3000);await pg.evaluate(()=>__r2.go('paint'));await pg.waitForTimeout(2000);const shots=[];
 for(const f of['gloss','matte','metal','chrome','pearl']){await pg.evaluate(f=>document.querySelector(`#r2C [data-r2fn="${f}"]`).click(),f);await pg.waitForTimeout(30000);shots.push(await pg.screenshot({clip:{x:150,y:60,width:380,height:250},timeout:180000}))}
 const fs=require('fs');shots.forEach((s,i)=>fs.writeFileSync(process.argv[3]+i+'.png',s));await b.close()})();

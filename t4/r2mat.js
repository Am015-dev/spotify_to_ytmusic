// t4/r2mat.js: which garage meshes carry the paint finish. usage: node t4/r2mat.js <url> <png>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const pg=await (await b.newContext({viewport:{width:852,height:393}})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(String(e)));pg.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push(m.text().slice(0,200))});
 await pg.goto(process.argv[2]);await pg.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
 await pg.evaluate(()=>document.querySelector('#gbMenuBtn').click());await pg.waitForTimeout(3000);await pg.evaluate(()=>__r2.go('paint'));await pg.waitForTimeout(2000);
 await pg.evaluate(()=>document.querySelector('#r2C [data-r2fn="chrome"]').click());await pg.waitForTimeout(2000);
 console.log(JSON.stringify(await pg.evaluate(()=>__r2.mats())),await pg.evaluate(()=>{const m=__r2.finMat('chrome');return JSON.stringify({met:m.metalness,r:m.roughness,env:m.envMap?1:0,vc:m.vertexColors})}));
 console.log('errs',JSON.stringify(errs.filter(e=>!/GPU stall/.test(e)).slice(0,8)));await pg.screenshot({path:process.argv[3]||'/tmp/mat.png'});await b.close()})();

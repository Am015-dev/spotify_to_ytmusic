// t4/r2kit2.js: dump kit thumbnails to disk. usage: node t4/r2kit2.js <url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const O=process.argv[3];const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const pg=await (await b.newContext({viewport:{width:852,height:393}})).newPage();const errs=[];pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});pg.on('pageerror',e=>errs.push(String(e)));
 await pg.goto(process.argv[2]);await pg.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
 await pg.evaluate(()=>document.querySelector('#gbMenuBtn').click());await pg.waitForTimeout(3000);await pg.evaluate(()=>__r2.go('build','kits'));await pg.waitForTimeout(3000);
 const ids=await pg.evaluate(()=>[...document.querySelectorAll('#gbBody .gbP[data-cat][data-id]')].map(b=>b.dataset.id));console.log('ids',ids.join(','));
 for(const k of ids){const u=await pg.evaluate(k=>{const u=__r2.kitTh(k);return u},k);if(u&&u.startsWith('data:image/png'))fs.writeFileSync(`${O}/${k}.png`,Buffer.from(u.split(',')[1],'base64'));console.log(k,u?u.length:u)}
 console.log('ERR',errs.slice(0,5));await b.close()})();

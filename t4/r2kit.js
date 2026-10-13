// t4/r2kit.js: debug the kit thumbnails. usage: node t4/r2kit.js <url>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const pg=await (await b.newContext({viewport:{width:852,height:393}})).newPage();const errs=[];pg.on('console',m=>errs.push(m.type()+': '+m.text()));
 await pg.goto(process.argv[2]);await pg.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
 await pg.evaluate(()=>document.querySelector('#gbMenuBtn').click());await pg.waitForTimeout(3000);
 console.log(await pg.evaluate(()=>{const r={};for(const k of['shark','plough','delta','spoiler'])try{const u=__r2.kitTh(k);r[k]=u?u.length:u}catch(e){r[k]='ERR '+e.message}return r}));
 console.log('timer',await pg.evaluate(()=>new Promise(r=>{setTimeout(()=>r('fired'),50);setTimeout(()=>r('late'),5000)})),'busy0',await pg.evaluate(()=>__r2.busy()));await pg.evaluate(()=>__r2.go('build','kits'));await pg.waitForTimeout(6000);console.log(await pg.evaluate(()=>{const a=[...document.querySelectorAll('#gbBody img[data-r2kit]')];return a.length+' src:'+a.filter(i=>i.getAttribute('src')).length+' busy:'+__r2.busy()}));console.log(errs.filter(e=>/R2|rror|warn/i.test(e)).slice(0,5));await b.close()})();

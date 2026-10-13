// t4/r2live.js: is the garage canvas redrawing? two shots 20 s apart + chrome swap. usage: node t4/r2live.js <url> <prefix> [r2]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const pg=await (await b.newContext({viewport:{width:852,height:393}})).newPage();const errs=[];pg.on('pageerror',e=>errs.push(String(e).slice(0,300)));
 await pg.goto(process.argv[2]);await pg.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
 await pg.evaluate(()=>document.querySelector('#gbMenuBtn').click());await pg.waitForTimeout(5000);
 const px=()=>pg.evaluate(()=>__r2.fr());const px0=()=>pg.evaluate(()=>{const c=document.querySelector('#gbC');const t=document.createElement('canvas');t.width=c.width;t.height=c.height;const g=t.getContext('2d');g.drawImage(c,0,0);const d=g.getImageData(0,0,t.width,t.height).data;let s=0;for(let i=0;i<d.length;i+=97)s=(s*31+d[i])%1e9;return s});
 const a=await px();await pg.waitForTimeout(20000);const b2=await px();console.log('frames',a,b2,a===b2?'FROZEN':'moving',errs.slice(0,3));await b.close()})();

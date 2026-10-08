// t4/r2fps.js: garage fps (open, rides, builder). usage: node t4/r2fps.js <url>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});const pg=await ctx.newPage();
 await pg.goto(process.argv[2]);await pg.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});const ev=f=>pg.evaluate(f);
 const fps=()=>ev(()=>new Promise(r=>{let n=0;const t0=performance.now();const f=()=>{n++;if(performance.now()-t0<3000)requestAnimationFrame(f);else r(n/3)};requestAnimationFrame(f)}));
 console.log('menu',await fps());await ev(()=>document.querySelector('#gbMenuBtn').click());await pg.waitForTimeout(3000);console.log('garage',await fps());
 await ev(()=>__gb.enter());await pg.waitForTimeout(3000);console.log('builder',await fps(),'dpr',await ev(()=>devicePixelRatio),'cv',await ev(()=>document.querySelector('#gbC').width+'x'+document.querySelector('#gbC').height));await b.close()})();

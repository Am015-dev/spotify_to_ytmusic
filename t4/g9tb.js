// t4/g9tb.js: 852x393 builder toolbar: every #gbBkT button on one row? prints rows (top y) and the right edge. usage: node t4/g9tb.js <url> <shot>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});const p=await ctx.newPage();
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
 await p.tap('#gbMenuBtn');await p.waitForTimeout(1500);await p.evaluate(()=>__gb.enter());await p.waitForTimeout(3000);
 const r=await p.evaluate(()=>[...document.querySelectorAll('#gbBkT>button,#gbBkT>#gbBkN')].filter(e=>e.offsetParent).map(e=>{const q=e.getBoundingClientRect();return[(e.dataset.a||e.id),Math.round(q.left),Math.round(q.top),Math.round(q.width)]}));
 console.log(JSON.stringify(r));console.log('ROWS',new Set(r.map(x=>x[2])).size);if(process.argv[3])await p.screenshot({path:process.argv[3]});await b.close()})();

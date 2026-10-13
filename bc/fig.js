const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage();
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__ld&&window.__ld.need,null,{timeout:240000});
 console.log(await p.evaluate(()=>{const T=__ld.THREE,g=__ld.fig(),B=new T.Box3().setFromObject(g);return JSON.stringify({fig:B.getSize(new T.Vector3()).toArray(),U:__ld.U,PH:__ld.PH,SW:__ld.SW})}));await b.close()})();

const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});const p=await ctx.newPage();
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});
 for(const s of['#gbMenuBtn','#gbx .gbTabs button[data-t="veh"]','.gnbGo','[data-ch="sc8"]']){await p.tap(s);await p.waitForTimeout(1500)}await p.waitForTimeout(3000);
 const st=()=>p.evaluate(()=>{const C=__gs.GB().cam;return JSON.stringify({pos:C.position.toArray().map(v=>+v.toFixed(2)),pit:__gb.GB_.pit,dist:__gb.GB_.dist,bk:__gb.GB_.bk,view:C.view&&C.view.offsetY,raf:__gs.GB().raf})});
 console.log(await st());await p.evaluate(()=>{__gb.GB_.pit=.2;__gb.GB_.dist=20});await p.waitForTimeout(3000);console.log(await st());await b.close()})();

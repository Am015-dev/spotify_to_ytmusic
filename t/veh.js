// VEHICLES tab by real taps on a 852x393 phone: buy/select sets, buy upgrades, preview forms, drive. node t/veh.js <prefix> [page]
const {chromium,devices}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const pre=process.argv[2]||'shots/VE',page=process.argv[3]||'dev/local_dbg.html';const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({...devices['iPhone 13'],viewport:{width:852,height:393},deviceScaleFactor:1});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
 await p.goto('http://127.0.0.1:8766/'+page);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000});
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_athpre','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});
 await p.reload({timeout:600000});await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000});
 await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam',null,{timeout:300000});await p.evaluate(()=>{__mho.storyClose&&__mho.storyClose();window.__m1&&__m1.skip&&__m1.skip();__mho.roamSim(20);__gar.cheat(20000,16)});
 const tap=async sel=>{const c=await p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}},sel);if(!c)throw new Error('no '+sel);await p.touchscreen.tap(c.x,c.y);await p.waitForTimeout(500)};
 const shot=async n=>{await p.waitForTimeout(1200);await p.screenshot({path:`${pre}_${n}.png`})};const r={};
 await p.evaluate(()=>document.querySelector('#roamPause [data-p="garage"]').click());await p.waitForFunction(()=>!document.querySelector('#gbx').hidden);await p.waitForTimeout(800);
 await tap('#gbx .gbTabs [data-t="veh"]');await p.evaluate(()=>document.querySelector('#gbBody').scrollTop=0);await shot('tab');
 r.cards=await p.evaluate(()=>[...document.querySelectorAll('[data-gset]')].map(b=>b.dataset.gset+(b.disabled?':locked':'')));
 await tap('[data-gset="ebbel"]');r.afterBuy=await p.evaluate(()=>({cr:__gar.get(),}));await tap('[data-gset="posei"]');r.sel=await p.evaluate(()=>__gar.get().sel);
 for(const k of['sp','sp','ex','ex','wh','bo','bo'])await tap(`[data-gup="${k}"]`);r.ups=await p.evaluate(()=>__gar.ups());
 await p.evaluate(()=>document.querySelector('#gbBody').scrollTop=0);await shot('car');
 await tap('[data-gpv="4x4"]');await shot('off');await tap('[data-gpv="boat"]');await shot('boat');await tap('[data-gpv="car"]');
 await p.evaluate(()=>{const e=[...document.querySelectorAll('#gbx button')].find(b=>/SAVE/.test(b.textContent));e.click()});await p.waitForTimeout(2500);
 r.state=await p.evaluate(()=>({st:__mho.state,gb:!document.querySelector('#gbx').hidden,build:(JSON.parse(localStorage.getItem('mho_build@1')||'{}').bricks||[]).length}));
 await p.evaluate(()=>{window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{};__mho.roamSim(5);window.requestAnimationFrame=()=>0});await p.waitForTimeout(500);
 for(const [k,v,t,fov] of [['w34',[4.5,2.6,-4.0],[0,1.0,0],40],['wside',[0.3,1.3,-6.5],[0,1.0,0],40],['wrear',[-6,2.5,1.5],[0,1.2,0],40]]){await p.evaluate(([v,t,fov])=>{const m=__mho.pl.mesh;m.updateMatrixWorld(true);const c=__dbg.camera,T=new __dbg.THREE.Vector3(...t),P=new __dbg.THREE.Vector3(...v);m.localToWorld(P);m.localToWorld(T);c.position.copy(P);c.lookAt(T);c.fov=fov;c.updateProjectionMatrix();window.__fastR.call(__dbg.composer)},[v,t,fov]);await p.screenshot({path:`${pre}_${k}.png`})}
 console.log(JSON.stringify(r),'errs',JSON.stringify(errs));await b.close()})();

// garage DRIVER tab: presets by real taps on a 852x393 phone, saved, shown in the car after closing. node t/gar.js <prefix>
const {chromium,devices}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const pre=process.argv[2]||'shots/GA';const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({...devices['iPhone 13'],viewport:{width:852,height:393},deviceScaleFactor:1});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
 await p.goto('http://127.0.0.1:8766/local_dbg.html');await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000});
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_athpre','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});
 await p.reload({timeout:600000});await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000});
 await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam',null,{timeout:300000});await p.evaluate(()=>{__mho.storyClose&&__mho.storyClose();window.__m1&&__m1.skip&&__m1.skip();__mho.roamSim(20)});
 const tap=async sel=>{const c=await p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}},sel);if(!c)throw new Error('no '+sel);await p.touchscreen.tap(c.x,c.y);await p.waitForTimeout(400)};
 await p.evaluate(()=>document.querySelector('#roamPause [data-p="garage"]').click());await p.waitForFunction(()=>!document.querySelector('#gbx').hidden);await p.waitForTimeout(800);
 await tap('#gbx .gbTabs [data-t="driver"]');await p.waitForTimeout(1500);await p.evaluate(()=>document.querySelector('#gbBody').scrollTop=0);await p.screenshot({path:pre+'_driver.png'});
 const r={};r.presets=await p.evaluate(()=>document.querySelectorAll('#gbBody [data-gpre]').length);
 for(const i of [1,5]){await tap(`#gbBody [data-gpre="${i}"]`);await p.waitForTimeout(1200);await p.evaluate(()=>document.querySelector('#gbBody').scrollTop=0);await p.screenshot({path:`${pre}_pre${i}.png`})}
 r.saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('mho_gbfig@1')||'null'));
 // close the garage and look at the car
 r.close=await p.evaluate(()=>{const e=[...document.querySelectorAll('#gbx button')].find(b=>/close|done|back|✕|×/i.test(b.textContent+b.id+(b.dataset.a||'')));return e?(e.id||e.textContent.trim()):null});
 await p.evaluate(()=>{try{gbClose?gbClose(true):0}catch(e){}});await p.evaluate(()=>{const e=[...document.querySelectorAll('#gbx button')].find(b=>/SAVE/.test(b.textContent));e&&e.click()});
 await p.waitForTimeout(1500);r.state=await p.evaluate(()=>({st:__mho.state,gb:!document.querySelector('#gbx').hidden}));
 await p.evaluate(()=>{window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{};__mho.roamSim(5);window.requestAnimationFrame=()=>0});await p.waitForTimeout(500);
 for(const [k,v,t,fov] of [['car',[2.2,1.8,-.5],[.2,1.62,0],22],['car34',[2.6,2.4,-2.2],[.1,1.4,0],38]]){await p.evaluate(([v,t,fov])=>{const m=__mho.pl.mesh;m.updateMatrixWorld(true);const c=__dbg.camera,T=new __dbg.THREE.Vector3(...t),P=new __dbg.THREE.Vector3(...v);m.localToWorld(P);m.localToWorld(T);c.position.copy(P);c.lookAt(T);c.fov=fov;c.updateProjectionMatrix();window.__fastR.call(__dbg.composer)},[v,t,fov]);await p.screenshot({path:`${pre}_${k}.png`})}
 console.log(JSON.stringify(r),'errs',JSON.stringify(errs));await b.close()})();

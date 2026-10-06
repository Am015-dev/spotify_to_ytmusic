// pGAR2 gate shots at 852x393 by real taps: per set, garage (stock + max upgrades, 3 forms) and in-world (street, 4x4, boat; stock + max).
// node t/gate.js <prefix> '<spots json {"boat":[x,z],"offroad":[x,z]}>' [sets]
const {chromium,devices}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const pre=process.argv[2]||'shots/G',SP=JSON.parse(process.argv[3]||'{}'),SETS=(process.argv[4]||'rod,ebbel,posei,gold').split(',');
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({...devices['iPhone 13'],viewport:{width:852,height:393},deviceScaleFactor:1});const p=await ctx.newPage();p.setDefaultTimeout(600000);const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text().slice(0,200))});
 await p.goto('http://127.0.0.1:8766/'+(process.env.PG||'local_dbg.html'));await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000});
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_athpre','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});
 await p.reload({timeout:600000});await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000});
 await p.evaluate(()=>{try{__m1.skip()}catch(e){}__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam',null,{timeout:300000});
 await p.evaluate(()=>{__mho.storyClose&&__mho.storyClose();__mho.roamSim(20);__gar.cheat(99999,40);window.__home={x:__dbg.RO.x,z:__dbg.RO.z};window.__homeH=__dbg.RO.h;__ju.autoClose(true)});
 const tap=async sel=>{const c=await p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}},sel);if(!c)throw new Error('no '+sel);await p.touchscreen.tap(c.x,c.y);await p.waitForTimeout(400)};
 const R={};
 const garOpen=async()=>{await p.evaluate(()=>{window.requestAnimationFrame=window.__raf||window.requestAnimationFrame;if(window.__fastR)__dbg.composer.render=window.__fastR});await p.evaluate(()=>document.querySelector('#roamPause [data-p="garage"]').click());await p.waitForFunction(()=>!document.querySelector('#gbx').hidden);await p.waitForTimeout(800);await tap('#gbx .gbTabs [data-t="veh"]')};
 const gshot=async n=>{await p.evaluate(()=>document.querySelector('#gbBody').scrollTop=0);await p.waitForTimeout(1500);await p.screenshot({path:`${pre}_${n}.png`})};
 const forms=async tag=>{for(const [k,n] of [['car','car'],['4x4','off'],['boat','boat']]){await tap(`[data-gpv="${k}"]`);await gshot(`gar_${tag}_${n}`)}await tap('[data-gpv="car"]')};
 const drive=async()=>{await p.evaluate(()=>{const e=[...document.querySelectorAll('#gbx button')].find(b=>/SAVE/.test(b.textContent));e.click()});await p.waitForTimeout(2500);
  await p.evaluate(()=>{window.__raf=window.__raf||window.requestAnimationFrame;window.__fastR=window.__fastR||__dbg.composer.render;__dbg.composer.render=()=>{};window.requestAnimationFrame=()=>0})};
 const cam=async(n,v,t)=>{await p.evaluate(([v,t])=>{const m=__dbg.PL.mesh;m.updateMatrixWorld(true);const c=__dbg.camera,T=new __dbg.THREE.Vector3(...t),P=new __dbg.THREE.Vector3(...v);m.localToWorld(P);m.localToWorld(T);c.position.copy(P);c.lookAt(T);c.fov=40;c.updateProjectionMatrix();window.__fastR.call(__dbg.composer)},[v,t]);await p.screenshot({path:`${pre}_${n}.png`})};
 const world=async tag=>{const out={};for(const [f,spot] of [['car',null],['4x4',SP.offroad],['boat',SP.boat]]){
   if(f!=='car'&&!spot){out[f]='nospot';continue}
   out[f]=await p.evaluate(([f,spot])=>{const R=__dbg.RO;if(spot)__mho.warp(spot[0],spot[1],0,true);else __mho.warp(__home.x,__home.z,__homeH,true);R.vsel={car:'ship','4x4':'offroad',boat:'boat'}[f];R.v=0;for(let i=0;i<12;i++){R.v=0;__ju.step(10)}R.vsel='auto';return (__dbg.PL.vmode||'car')+'/'+R.terr},[f,spot]);
   await cam(`w_${tag}_${f==='4x4'?'off':f}`,[4.8,2.4,-4.4],[0,.9,0]);if(f==='car')await cam(`w_${tag}_side`,[.3,1.0,-6.8],[0,.8,0])}
  await p.evaluate(()=>{const R=__dbg.RO;__mho.warp(__home.x,__home.z,__homeH,true);R.vsel='ship';for(let i=0;i<6;i++){R.v=0;__ju.step(10)}R.vsel='auto'});return out};
 for(const id of SETS){R[id]={};await garOpen();await tap(`[data-gset="${id}"]`);R[id].sel=await p.evaluate(()=>__gar.get().sel);R[id].tab=await p.evaluate(()=>document.querySelector('[data-gset].on')?.dataset.gset);
  await forms(`${id}_stock`);await drive();R[id].wStock=await world(`${id}_stock`);
  await garOpen();for(const k of['sp','ex','wh','bo'])for(let i=0;i<3;i++)await tap(`[data-gup="${k}"]`);R[id].ups=await p.evaluate(()=>__gar.ups());
  await forms(`${id}_max`);await drive();R[id].wMax=await world(`${id}_max`);
  R[id].wheels=await p.evaluate(()=>{const o=[];__dbg.PL.mesh.traverse(w=>{if(w.isMesh&&w.userData.r&&!w.userData.a8s)o.push(w.userData.r.toFixed(3))});return o.length})}
 console.log(JSON.stringify(R),'errs',JSON.stringify(errs));await b.close()})();

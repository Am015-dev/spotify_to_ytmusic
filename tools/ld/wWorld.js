// tools/ld/wWorld.js <url> <outdir> <city fra|ath> [model ids,...] : build-5 world props in roam at 852×393: prints every placed LDW prop
// (spot, tris near/far, collider) and shoots the listed ones (front 3/4 view). Shots only, roam entered directly (not a gate test).
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const [URL,OUT,CITY,IDS]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await (await b.newContext({viewport:{width:1280,height:720}})/* 852×393 loads stall under swiftshader (land-1): resized before the shots */).newPage();p.setDefaultTimeout(600000);const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error'||/LDW/.test(m.text()))errs.push(m.text().slice(0,200))});
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000});
 await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));if(c==='ath')localStorage.setItem('mho_city@1','ath')},CITY);
 await p.reload({timeout:600000});await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000});
 await p.evaluate(()=>{try{__m1.skip()}catch(e){}__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam'&&!(__mho.LD&&__mho.LD.on),null,{timeout:300000});
 await p.evaluate(()=>{__mho.storyClose&&__mho.storyClose();__mho.roamSim(20);try{__ju.autoClose(true)}catch(e){}});
 const L=await p.evaluate(()=>__ld.w.on.map(E=>({id:E.id,at:E.at,tris:E.tris,ftris:E.ftris,col:E.col&&{hw:+E.col.hw.toFixed(1),hd:+E.col.hd.toFixed(1)},water:E.water||0})));
 console.log('LDW',CITY,JSON.stringify(L));await p.setViewportSize({width:852,height:393});await p.waitForTimeout(2000);
 for(const id of (IDS||'').split(',').filter(Boolean)){const E=L.find(q=>q.id===id);if(!E){console.log('MISSING',id);continue}const {x,z,y}=E.at,a=E.water?E.at.yaw:E.at.yaw*Math.PI/2,fx=-Math.sin(a),fz=-Math.cos(a),R=Math.max(E.col.hw,E.col.hd)+4;
  await p.evaluate(c=>__gnb.cam(c),[x+fx*R*(+process.env.WD||2.2)+fz*R*.8,y+R*(+process.env.WH||.9),z+fz*R*(+process.env.WD||2.2)-fx*R*.8,x,y+1,z]);await p.waitForTimeout(2500);await p.screenshot({path:`${OUT}/${id}_${CITY}.png`});console.log('shot',`${OUT}/${id}_${CITY}.png`)}
 console.log('ERR',JSON.stringify(errs.slice(0,6)));await b.close()})();

const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await br.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true})).newPage();p.setDefaultTimeout(600000);
await p.goto('http://127.0.0.1:8766/dev/local_dbg.html');await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_athpre','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{try{__m1.skip()}catch(e){}__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam');await p.evaluate(()=>__mho.storyClose&&__mho.storyClose());await p.waitForTimeout(2500);
await p.evaluate(()=>{window.requestAnimationFrame=()=>0;__ju.autoClose(true);__dbg.composer.render=()=>{};const R=__dbg.RO;window.__h=[R.x,R.z,R.h]});
const st=lab=>p.evaluate(l=>{const R=__dbg.RO;return l+' '+JSON.stringify({x:R.x|0,z:R.z|0,terr:R.terr,veh:R.veh,vm:__dbg.PL.vmode,ch:!!R.ch,sp:!!R.sp,wk:!!R.wk,on:R.on,vsel:R.vsel})},lab);
console.log(await st('home'));
for(const [n,x,z] of [['off',-389.5,481.4],['boat',-417.9,-226.9],['home',null,null]]){console.log(await p.evaluate(([x,z])=>{const R=__dbg.RO;if(x==null){x=__h[0];z=__h[1]}return String(__mho.warp(x,z,0,true))},[x,z]));for(let k=0;k<4;k++){await p.evaluate(()=>{__dbg.RO.v=0;__ju.step(30)});console.log(await st(n+k))}}
await br.close()})();

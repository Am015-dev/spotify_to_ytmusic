// find roam spots where the player becomes boat / offroad: node t/scan.js
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await (await br.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true})).newPage();p.setDefaultTimeout(600000);
await p.goto('http://127.0.0.1:8766/local_dbg.html');await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_athpre','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{try{__m1.skip()}catch(e){}__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam');await p.evaluate(()=>__mho.storyClose&&__mho.storyClose());await p.waitForTimeout(2500);
await p.evaluate(()=>{window.requestAnimationFrame=()=>0;__ju.autoClose(true);__dbg.composer.render=()=>{}});
const r=await p.evaluate(()=>{const P=__dbg.PL.mesh.position,x0=P.x,z0=P.z,F={};for(let d=40;d<=1600&&Object.keys(F).length<2;d+=40)for(let a=0;a<16;a++){const x=x0+Math.cos(a/16*6.283)*d,z=z0+Math.sin(a/16*6.283)*d;__m1.warp(x,z,0,true);__dbg.RO.v=0;__ju.step(4);const v={water:'boat',dirt:'offroad'}[__dbg.RO.terr];if(v&&!F[v])F[v]=[+x.toFixed(1),+z.toFixed(1)]}return{start:[x0,z0],F}});
console.log(JSON.stringify(r));await br.close()})();

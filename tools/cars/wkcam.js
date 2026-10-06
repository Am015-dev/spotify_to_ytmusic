// wkcam.js <base url dir> <outdir>: roam wreck -> rebuild, per-frame: is the player car on screen (NDC), camera distance, mesh visible
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
const [BASE,OUT]=process.argv.slice(2);fs.mkdirSync(OUT,{recursive:true});
(async()=>{const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await br.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true});const p=await ctx.newPage();p.setDefaultTimeout(900000);
 p.on('pageerror',e=>console.log('ERR',e.message));
 const T0=Date.now(),lg=m=>console.log(((Date.now()-T0)/1000).toFixed(0)+'s',m);await p.goto(BASE+'/local_dbg.html');lg('goto');await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_athpre','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});await p.reload();
 await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
 lg('menu');await p.evaluate(()=>{__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam');await p.evaluate(()=>__mho.storyClose&&__mho.storyClose());await p.waitForTimeout(2500);
 await p.evaluate(()=>{for(const id of['m1Next','m1Skip']){const b=document.getElementById(id);if(b&&b.getClientRects().length)b.click()}});await p.waitForTimeout(1500);
 await p.evaluate(()=>{window.requestAnimationFrame=()=>0;__ju.autoClose(true)});lg('roam ready');
 const probe=n=>p.evaluate(n=>{__ju.step(n);const D=__dbg,R=D.RO,c=D.camera,m=D.PL.mesh;const v=new D.THREE.Vector3(R.x,R.y+1.2,R.z).project(c);
  return{wk:!!R.wk,t:R.wk?+R.wk.t.toFixed(2):null,inv:+(R.inv||0).toFixed(2),vis:m.visible,ndc:[+v.x.toFixed(2),+v.y.toFixed(2),+v.z.toFixed(3)],cd:+Math.hypot(c.position.x-R.x,c.position.z-R.z).toFixed(1),cy:+(c.position.y-R.y).toFixed(1),y:+R.y.toFixed(1),mpos:[+(m.position.x-R.x).toFixed(1),+(m.position.y-R.y).toFixed(1),+(m.position.z-R.z).toFixed(1)]}},n);
 let si=0;const shot=async tag=>{await p.evaluate(()=>{__dbg.SS&&__dbg.SS();try{__dbg.composer.render()}catch(e){}});await p.screenshot({path:`${OUT}/${String(si++).padStart(2,'0')}_${tag}.png`})};
 await p.evaluate(()=>{const R=__dbg.RO;R.v=20});for(let i=0;i<5;i++)lg(JSON.stringify(await probe(10)));
 await p.evaluate(()=>{const R=__dbg.RO;Object.assign(R,{hp:1,inv:0,y:R.y+45,vy:0,v:0})});
 let w;for(let i=0;i<80;i++){w=await probe(3);if(w.wk)break}console.log('wreck',JSON.stringify(w));
 for(let i=0;i<200;i++){w=await probe(2);const on=w.vis&&Math.abs(w.ndc[0])<1&&Math.abs(w.ndc[1])<1&&w.ndc[2]<1;if(!w.wk||i%10==0)console.log(on?'ON ':'OFF',JSON.stringify(w));if(!w.wk&&(i%6==0))await shot('f'+i);if(!w.wk&&w.inv<=0.6)break}
 await br.close()})();

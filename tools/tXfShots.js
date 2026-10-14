// tXfShots: the xform-1 shot set in ONE browser session (852×393): road (street car), mid-transform pop, off-road on grass, boat in the river, back on land.
//   node tools/tXfShots.js <base url> <outdir>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const p=await b.newPage({viewport:{width:852,height:393}});const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,160)));
 await p.goto(process.argv[2]+'?test=fra&draw=0');await p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:120000});await p.evaluate(()=>__tq.draw());
 const shot=async(f,pre)=>{await p.evaluate(pre||'0');await p.evaluate(()=>__tq.draw());await p.screenshot({path:OUT+'/'+f});console.log('SHOT',f,JSON.stringify(await p.evaluate(()=>__xf.surf())))};
 const until=async(fn,ms=20000)=>p.waitForFunction(fn,null,{polling:50,timeout:ms}).catch(()=>console.log('timeout',String(fn)));
 await p.evaluate(()=>__chk.go('xf1/grass'));await until(()=>__fl.surf().veh==='ship'&&Math.abs(__xf.XF.t)>=0);await p.waitForTimeout(1200);await shot('x1_road_car.jpg');
 await until(()=>__xf.surf().veh==='offroad');await shot('x2_transform.jpg','__xf.XF.t=.1');await until(()=>/✅|❌/.test(__chk.said()||''));await shot('x3_offroad_grass.jpg');
 await p.evaluate(()=>__chk.go('xf1/water'));await until(()=>/✅|❌/.test(__chk.said()||''),30000);await shot('x4_boat_river.jpg');
 await p.evaluate(()=>__chk.go('xf1/land'));await until(()=>/✅|❌/.test(__chk.said()||''),30000);await shot('x5_land.jpg');
 console.log('ERRORS',errs.length,errs.slice(0,2).join(' | '));await b.close()})();

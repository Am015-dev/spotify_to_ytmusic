const {chromium}=require('/opt/node22/lib/node_modules/playwright');const [BASE,OUT]=process.argv.slice(2);
(async()=>{for(const c of ['fra','ath']){const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:852,height:393}});
p.on('pageerror',e=>console.log('ERR',e.message.slice(0,120)));
await p.goto(BASE+'?test='+c+'&q=high');await p.waitForFunction(()=>window.__chk&&window.__bv,null,{timeout:300000});await p.waitForTimeout(4000);await p.evaluate(()=>{window.__dbg=true});
const spots=c==='fra'?[['fra_berg',-255,-1695,0],['fra_field',-1600,-2300,0]]:[['ath_park',null,null,0]];
for(const [n,x,z,h] of spots){
 const r=await p.evaluate(a=>__oc.ev('(function(){let x='+a[1]+',z='+a[2]+',h='+a[3]+';if(x===null){const k=__cvf.park();x=RO.x;z=RO.z;h=RO.h||0}else{roamWarp(x,z,h)}RO.v=5;camSnap=true;return [RO.x,RO.z,h]})()'),[n,x,z,h]);
 console.log(n,JSON.stringify(r));await p.waitForTimeout(3500);
 const d=await p.evaluate(()=>__oc.ev('JSON.stringify({car:RO.y,ground:groundAt(RO.x,RO.z,RO.y),cam:camera.position.y,camG:groundAt(camera.position.x,camera.position.z,99)})'));console.log(n,d);
 await p.screenshot({path:`${OUT}/${n}.png`});}
await b.close()}})();

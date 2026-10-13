// tMixShot.js (v88z): 852×393 shot of a city's traffic mix: the player is parked 22 m behind the traffic car with the most other cars within
// 60 m (in the city, not on the Autobahn), facing along it; 3 s of traffic then a shot. usage: node tools/tMixShot.js <url> fra|ath <out.jpg>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const {boot}=require('./d24lib.js');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const {p,shot}=await boot(b,{city:process.argv[3],url:process.argv[2],phone:true});
 for(let k=0;k<2;k++){const o=await p.evaluate(()=>{const M=__mho,R=M.RO,C=M.HUB.cars.filter(c=>!(c.dead>0)&&!c.qsAb&&!c.pk);let best=null,bn=-1;
   for(const c of C){const n=C.filter(q=>Math.hypot(q.x-c.x,q.z-c.z)<60).length;if(n>bn){bn=n;best=c}}
   const N=M.HUB.nodes,A=N&&N[best.a],B=N&&N[best.b];const h=A&&B?Math.atan2(B.x-A.x,B.z-A.z):(best.hh??0);R.ch=null;R.sp=null;M.warp(best.x-Math.sin(h)*22,best.z-Math.cos(h)*22,h);R.v=0;return{n:bn,x:Math.round(best.x),z:Math.round(best.z)}});
  await p.evaluate(()=>{for(let i=0;i<180;i++){__mho.RO.v=0;__tick(1)}});console.log(JSON.stringify(o))}
 await shot(process.argv[4]);await b.close()})();

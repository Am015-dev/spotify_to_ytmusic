'use strict';
// races-8: tkRock (rocking detector, sim time). A car oscillating in place must trip it within 6 s of SIM time at any dt; a car making progress must not.
const L=require('./lib.js');
module.exports=async T=>{
 T.group('rock');
 const S=L.sandbox(['fn:tkRock'],{});
 const run=(dt,sf,secs)=>{const W={};let t=0,hit=null;for(let i=0;i*dt<secs;i++){t=i*dt;if(S.tkRock(W,t,sf(t))&&hit==null){hit=t;break}}return hit};
 for(const dt of [1/60,1/30,.1,.25,.5]){
  const h=run(dt,t=>4*Math.sin(t*5),20);
  T.ok(h!=null&&h<=6+dt+1e-9,'rocks-dt'+dt.toFixed(3),'fired at '+h);
 }
 T.ok(run(1/30,t=>t*8,30)==null,'moving-quiet','a car at 8 m/s must not trip');
 T.ok(run(1/30,t=>t*2.6,30)==null,'slow-progress-quiet','2.6 m/s = 15.6 m per 6 s must not trip');
 T.ok(run(1/30,t=>t*2.0,30)!=null,'crawl-fires','2 m/s = 12 m per 6 s trips');
};

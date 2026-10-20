'use strict';
// LOGIC unit tests: roam handling (yaw rate at speed, drift snap). Runs the REAL D24_shape / CR_yaw / C26_yawCap / C26_vhStep from src/ in a vm and replays the
// steering + velocity-heading lines of roamDrive (src/71_roam_drive.js) with a fixed dt. Bands come from docs/REVIEW_2K_21.md items 4 and 5.
const L=require('./lib.js');
module.exports=async T=>{
 const THREE=await L.THREE();T.group('handling');
 const clamp=(v,a,b)=>v<a?a:v>b?b:v,angDiff=(a,b)=>{let d=a-b;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d};
 const RO={v:0,h:0,vh:0,yr:0,dl:0,dDir:0};
 const G={clamp,angDiff,RO,TUNE:L.ev(L.constSrc('TUNE'),{Math}),SET:{touch:'keys',steer:'mid'},TOUCH:{},K:{},carStat:()=>({han:1}),C26:null,CR_WB:2.7};
 const S=L.sandbox(['C26','fn:C26_F','fn:C26_yawCap','fn:C26_vhStep','fn:CR_yaw','fn:D24_shape'],G);const {C26,CR_yaw,C26_yawCap,C26_vhStep,D24_shape}=S;
 const TU=G.TUNE;
 // one frame of the steering section (rest of roamDrive omitted: no air, no busy, no assist, road, no hop)
 const step=(c0,dt,top)=>{const c=Object.assign({},c0);step.c=c;const sp=Math.abs(RO.v),vr=clamp(sp/Math.max(30,top),0,1),maxR=(TU.stMax-TU.stSpd*vr)*Math.max(.6,clamp(sp/9,0,1));
  D24_shape(c,dt);let ytg=-c.steer*maxR*Math.sign(RO.v||1);
  if(RO.dDir){const into=clamp(c.steer*RO.dDir,-1,1);ytg=-RO.dDir*maxR*(TU.drSlip+.6*into)}
  const y0=RO.yr||0;RO.yr=CR_yaw(c,dt,ytg,maxR,false);
  if(!RO.dDir&&sp>3){const t=C26_yawCap(RO,RO.yr,sp,C26.muCity.road);RO.yr=y0+(t-y0)*Math.min(1,dt*(Math.abs(t)<Math.abs(y0)?TU.yrOut:TU.yrIn))}
  RO.h+=RO.yr*dt;
  RO.dEx=Math.max(0,(RO.dEx||0)-dt);const dEx=RO.dEx>0&&!RO.dDir,grip=TU.gripRoad*(RO.dDir?TU.drGrip:dEx?TU.drExitG/TU.gripRoad:1);RO.vh+=C26_vhStep(RO,angDiff(RO.h,RO.vh),grip,dt,sp,C26.muCity.road,!!RO.dDir||dEx);
  if(RO.dDir&&TU.drMax>0){const b=angDiff(RO.h,RO.vh);if(Math.abs(b)>TU.drMax)RO.vh=RO.h-Math.sign(b)*TU.drMax}
  if(!RO.dDir){const b=angDiff(RO.h,RO.vh),sm=TU.slipMax??.6;if(Math.abs(b)>sm)RO.vh=RO.h-Math.sign(b)*sm}};
 const reset=v=>{Object.assign(RO,{v,h:0,vh:0,yr:0,dl:0,dDir:0,d24s:0,d24t:0,d24r:0})};
 // steady yaw rate at full lock held 2 s; returns mean of the last 0.5 s
 const yawAt=kmh=>{reset(kmh/3.6);const c={steer:1,thr:1},dt=1/60;let s=0,n=0;for(let i=0;i<120;i++){step(c,dt,147/3.6);if(i>=90){s+=Math.abs(RO.yr);n++}}return s/n};
 const y50=yawAt(50),y100=yawAt(100),y150=yawAt(150);
 if(process.env.HANDLING_DUMP)console.log('yaw50/100/150',y50.toFixed(3),y100.toFixed(3),y150.toFixed(3));
 T.ok(y50>=.9&&y50<=1.2,'yaw-50kmh','yaw '+y50.toFixed(3)+' want .9-1.2');
 T.ok(y100>=.45,'yaw-100kmh','yaw '+y100.toFixed(3)+' want >=.45');
 T.ok(y150>=.25,'yaw-150kmh','yaw '+y150.toFixed(3)+' want >=.25');
 // steer reaches 90% of its target in <= 0.20 s at 18 km/h
 {reset(18/3.6);const c={steer:1,thr:1};let t90=-1;for(let i=0;i<120;i++){step(c,1/60,147/3.6);if(t90<0&&Math.abs(RO.d24s)>=.9){t90=(i+1)/60}}T.ok(t90>=0&&t90<=.2+1e-9,'steer-ramp-18kmh','t90 '+t90+' want <=.2')}
 // drift: start at 70 km/h, handbrake + left; slip at +0.4 s and +1.5 s, then release
 {reset(70/3.6);const c={steer:-1,thr:1,hb:1},dt=1/60;RO.dDir=-1;let a04=0,a15=0;for(let i=1;i<=90;i++){RO.v=70/3.6;step(c,dt,147/3.6);const a=Math.abs(angDiff(RO.h,RO.vh));if(i===24)a04=a;if(i===90)a15=a}
  if(process.env.HANDLING_DUMP)console.log('drift slip .4s/1.5s',a04.toFixed(3),a15.toFixed(3));
  T.ok(a04>=.44,'drift-slip-0.4s','slip '+a04.toFixed(3)+' want >=.44');T.ok(a15>=.52&&a15<=.79,'drift-slip-1.5s','slip '+a15.toFixed(3)+' want .52-.79');
  RO.dDir=0;RO.dEx=TU.drExitT;c.hb=0;c.steer=0;let rel=0;for(let i=1;i<=21;i++){RO.v=70/3.6;step(c,dt,147/3.6);if(i===21)rel=Math.abs(angDiff(RO.h,RO.vh))}T.ok(rel<.09,'drift-exit-0.35s','slip '+rel.toFixed(3)+' want <.09')}
};

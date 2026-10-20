// handling-r21d: GO feel/handling. Replays the steering + drift-slip lines of roamDrive with the LIVE functions and TUNE on a copy of RO (no frames, no graphics). Same bands as tools/unit/logic_handling.js (docs/REVIEW_2K_21.md items 4, 5).
(function HR21D_reg(){const C=window.__chk;if(!(C&&C.GO&&C.items))return;if(!C.items.some(q=>q.ver==='feel'&&q.id==='handling'))C.items.push({ver:'feel',id:'handling',area:'feel',text:'handling-r21d · feel/handling: full-lock yaw >= .45 rad/s at 100 km/h and >= .25 at 150, steer 90% in <= .2 s at 18 km/h, drift slip >= 25 deg at .4 s and 30-45 deg at 1.5 s, exit < 5 deg in .35 s'});
 C.GO['feel/handling']=[{c:'fra',n:'yaw rate at speed + drift snap',secs:2,fn:async()=>{const save=Object.assign({},RO),sc={},R=[];
  const reset=v=>{for(const k of['v','h','vh','yr','dl','dDir','d24s','d24t','d24r','dEx'])sc[k]=RO[k];Object.assign(RO,{v,h:0,vh:0,yr:0,dl:0,dDir:0,d24s:0,d24t:0,d24r:0,dEx:0})};
  const step=(c0,dt)=>{const c=Object.assign({},c0),sp=Math.abs(RO.v),maxR=(TUNE.stMax-TUNE.stSpd*clamp(sp/Math.max(30,RO.top||40),0,1))*Math.max(.6,clamp(sp/9,0,1));D24_shape(c,dt);let ytg=-c.steer*maxR*Math.sign(RO.v||1);
   if(RO.dDir)ytg=-RO.dDir*maxR*(TUNE.drSlip+.6*clamp(c.steer*RO.dDir,-1,1));const y0=RO.yr||0;RO.yr=CR_yaw(c,dt,ytg,maxR,false);
   if(!RO.dDir&&sp>3){const t=C26_yawCap(RO,RO.yr,sp,C26.muCity.road);RO.yr=y0+(t-y0)*Math.min(1,dt*(Math.abs(t)<Math.abs(y0)?TUNE.yrOut:TUNE.yrIn))}RO.h+=RO.yr*dt;
   RO.dEx=Math.max(0,(RO.dEx||0)-dt);const dEx=RO.dEx>0&&!RO.dDir;RO.vh+=C26_vhStep(RO,angDiff(RO.h,RO.vh),TUNE.gripRoad*(RO.dDir?TUNE.drGrip:dEx?TUNE.drExitG/TUNE.gripRoad:1),dt,sp,C26.muCity.road,!!RO.dDir||dEx);
   if(RO.dDir&&TUNE.drMax>0){const b=angDiff(RO.h,RO.vh);if(Math.abs(b)>TUNE.drMax)RO.vh=RO.h-Math.sign(b)*TUNE.drMax}return c};
  const yawAt=kmh=>{reset(kmh/3.6);let s=0;for(let i=0;i<120;i++){step({steer:1,thr:1},1/60);if(i>=90)s+=Math.abs(RO.yr)}return s/30};
  try{const y100=yawAt(100),y150=yawAt(150);if(!(y100>=.45))R.push('yaw100 '+y100.toFixed(2));if(!(y150>=.25))R.push('yaw150 '+y150.toFixed(2));
   reset(70/3.6);RO.dDir=-1;let a04=0,a15=0;for(let i=1;i<=90;i++){RO.v=70/3.6;step({steer:-1,thr:1,hb:1},1/60);const a=Math.abs(angDiff(RO.h,RO.vh));if(i===24)a04=a;if(i===90)a15=a}
   RO.dDir=0;RO.dEx=TUNE.drExitT;for(let i=0;i<21;i++){RO.v=70/3.6;step({steer:0,thr:1},1/60)}const ex=Math.abs(angDiff(RO.h,RO.vh));
   if(!(a04>=.44))R.push('slip.4s '+a04.toFixed(2));if(!(a15>=.52&&a15<=.79))R.push('slip1.5s '+a15.toFixed(2));if(!(ex<.09))R.push('exit '+ex.toFixed(2));
   return'📍 HANDLING · yaw100 '+y100.toFixed(2)+' yaw150 '+y150.toFixed(2)+' slip@.4s '+a04.toFixed(2)+' slip@1.5s '+a15.toFixed(2)+' exit '+ex.toFixed(2)+(R.length?' ❌ FAIL '+R.join(', '):' ✅ PASS')}finally{Object.assign(RO,save)}}}]})();

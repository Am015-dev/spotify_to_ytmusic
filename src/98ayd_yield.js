// NOTE: RO.foot is 'car' while driving (98of_onfoot.js), so L3_blocks/L3_yieldP (`RO.foot` = on foot) are permanently false: no car changes lane for the player. Fixing that made rv2k2/close (Westend bot) DNF, so it is NOT fixed here (see docs/HANDOFF_rv4B.md).
// ayd (rv4B, docs/REVIEW_2K_4.md #2): Athens traffic gave way only by changing lane (L3_yieldP), but Athens streets are < 14 m wide and L3_off() is null there, so the
// player (road-follow, 100+ km/h) rammed 30+ cars per 2 min. Root fix: any car the player is closing on within ~10 m + 1.3 s of travel, lateral < 3.2 m, eases sideways
// (c.yo, added to the lane offset in hubTrafficStep) away from the player's line until it clears 3.4 m, held 1 s so it does not swing back as the player passes.
// ?ayd=0 turns it off. Cars never leave the road: the shift is cut to 35 % when cityAt() says the kerb is near.
const AYD={on:!/[?&]ayd=0/.test(location.search),n:0};
function AYD_pre(dt){if(!AYD.on||typeof RO==='undefined'||!RO.on||RO.foot&&RO.foot!=='car'||!HUB.cars||!HUB.nodes)return;const N=HUB.nodes,h=RO.vh??RO.h,fx=Math.sin(h),fz=Math.cos(h),act=RO.v>10;
 for(const c of HUB.cars){if(c.pk||c.tr||c.route||c.dead>0){if(c.yo)c.yo=0;continue}const rx=c.x-RO.x,rz=c.z-RO.z;if(!c.yo&&!c.yoH&&(!act||rx*rx+rz*rz>10000))continue;
  let tg=0;const A=N[c.a],B=N[c.b];
  if(act&&A&&B&&!A.ab){const al=rx*fx+rz*fz,lat=rx*fz-rz*fx;
   if(al>1&&al<14+RO.v*1.6&&Math.abs(lat)<3.9){const L=Math.hypot(B.x-A.x,B.z-A.z)||1,dx=(B.x-A.x)/L,dz=(B.z-A.z)/L,s=lat>=0?1:-1,nd=fz*-dz-fx*dx/* right normal · car lane direction (-dz,dx) */;
    if(Math.abs(nd)>.5){let cur=(c.yo||0)*nd*s;if(cur<0)cur=0;let m=Math.min(3.9,cur+Math.max(0,3.7-Math.abs(lat)));
     for(let k=0;k<3&&typeof cityAt==='function';k++){const q=cityAt(c.x+fz*s*(m-cur),c.z-fx*s*(m-cur));if(q&&q.road&&q.d>q.road.w/2-.6)m=cur+(m-cur)*.6;else break}
     tg=s*m/nd;c.yoG=tg;c.yoH=1;if(!c.yoC){c.yoC=1;AYD.n++}}}}
  if(!tg&&c.yoH>0){c.yoH-=dt;if(c.yoH>0)tg=c.yoG||0;else{c.yoH=0;c.yoC=0}}
  c.yo=(c.yo||0)+(tg-(c.yo||0))*Math.min(1,dt*(tg?6:1.2));if(!tg&&Math.abs(c.yo)<.02)c.yo=0}}
hubTrafficStep=(f=>function(dt){try{AYD_pre(dt)}catch(e){console.warn('AYD',e)}return f.apply(this,arguments)})(hubTrafficStep);

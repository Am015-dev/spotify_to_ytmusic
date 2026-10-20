// NOTE: RO.foot is 'car' while driving (98of_onfoot.js), so L3_blocks/L3_yieldP (`RO.foot` = on foot) are permanently false: no car changes lane for the player. Fixing that made rv2k2/close (Westend bot) DNF, so it is NOT fixed here (see docs/HANDOFF_rv4B.md).
// ayd (rv4B, docs/REVIEW_2K_4.md #2): Athens traffic gave way only by changing lane (L3_yieldP), but Athens streets are < 14 m wide and L3_off() is null there, so the
// player (road-follow, 100+ km/h) rammed 30+ cars per 2 min. Root fix: any car the player is closing on within ~10 m + 1.3 s of travel, lateral < 3.2 m, eases sideways
// (c.yo, added to the lane offset in hubTrafficStep) away from the player's line until it clears 3.4 m, held 1 s so it does not swing back as the player passes.
// ?ayd=0 turns it off. Cars never leave the road: the shift is cut to 35 % when cityAt() says the kerb is near.
const AYD={on:!/[?&]ayd=0/.test(location.search),lane:HT_lawQ('lane'),n:0};
function AYD_pre(dt){if(!AYD.on||typeof RO==='undefined'||!RO.on||RO.foot&&RO.foot!=='car'||!HUB.cars||!HUB.nodes)return;const N=HUB.nodes,h=RO.vh??RO.h,fx=Math.sin(h),fz=Math.cos(h),act=RO.v>3;
 for(const c of HUB.cars){if(c.pk||c.tr||c.route&&!c.CVr||c.dead>0){if(c.yo)c.yo=0;continue}const rx=c.x-RO.x,rz=c.z-RO.z;if(!c.yo&&!c.yoH&&(!act||rx*rx+rz*rz>10000))continue;
  let tg=0;const A=N[c.a],B=N[c.b];
  if(act&&A&&B&&!A.ab){const al=rx*fx+rz*fz,lat=rx*fz-rz*fx;
   if(al>1&&al<14+RO.v*1.6&&Math.abs(lat)<3.9){const L=Math.hypot(B.x-A.x,B.z-A.z)||1,dx=(B.x-A.x)/L,dz=(B.z-A.z)/L,s=lat>=0?1:-1,nd=fz*-dz-fx*dx/* right normal · car lane direction (-dz,dx) */;
    if(Math.abs(nd)>.5){let cur=(c.yo||0)*nd*s;if(cur<0)cur=0;let m=Math.min(3.9,cur+Math.max(0,3.7-Math.abs(lat)));
     tg=s*m/nd;
     /* traffic-law-r21m: the dodge stays INSIDE the car's own lane (body 0.15 m inside the kerb, never over the centre line of a two-way street): it was up to 3.9 m and
        pulled cars onto the kerb "like a magnet". An oncoming car that still cannot clear the player brakes instead. */
     if(AYD.lane){const gA=A.g||B.g,W=A.ab||gA?0:Math.min(A.w||20,B.w||20),nom=HT_laneOff(c,A,B,gA,W),hw=Math.min(A.w||0,B.w||A.w||0)/2,hi=Math.max(0,hw-1.1),lo=nom>.5&&B.nb.includes(c.a)?Math.min(.95,nom):-hi,t0=tg;
      tg=Math.max(lo-nom,Math.min(hi-nom,tg));if(Math.abs(t0-tg)>.3){AYD.cut=(AYD.cut||0)+1;if(dx*fx+dz*fz<-.5&&Math.abs(lat)+Math.abs(tg)*Math.abs(nd)<2.6)c.aydB=1}}c.yoG=tg;c.yoH=1;if(!c.yoC){c.yoC=1;AYD.n++}}}}
  /* rv4D: a car crossing the player's line (slow or queued at a junction) drives on to clear it, 2 s ahead (braking it instead left stopped cars on both sides of a narrow street and wedged the player) */
  if(act&&A&&B&&!A.ab){const al=rx*fx+rz*fz,la=Math.abs(rx*fz-rz*fx);if(al>2&&al<8+RO.v*2.2&&la<=3.6&&(c.cv??9)<8&&!c.hitT){const L=Math.hypot(B.x-A.x,B.z-A.z)||1;if(Math.abs(fx*(B.x-A.x)/L+fz*(B.z-A.z)/L)<=.5)c.cv=Math.max(c.cv||0,8)}}
  if(!tg&&c.yoH>0){c.yoH-=dt;if(c.yoH>0)tg=c.yoG||0;else{c.yoH=0;c.yoC=0}}
  c.yo=(c.yo||0)+(tg-(c.yo||0))*Math.min(1,dt*(tg?6:1.2));if(!tg&&Math.abs(c.yo)<.02)c.yo=0;if(c.aydB){c.aydB=0;c.cv=Math.max(0,(c.cv||0)-9*dt)}}}
// rv4C: a dead/despawned car leaves every collision structure (OB grid, spatial grids, caches that copy c.x/c.z) the moment it dies: its position is parked 10 000 km away until it respawns
// (pin.js: a smashed car, dead=24.98, still pinned the player at 50-85 km/h). Tumble debris uses c.crW, not c.x/z, so the visuals are unchanged.
/* rv4E (behind window.OD_AYDCLR, default OFF: it widened the fra race gap, rv2k2/close 74 m > 60 m): at 80+ km/h a car inside the player's corridor (4 m behind to 12 m + 1 s ahead, 5.6 m either side) is taken off the road (silently, respawns later): in a 10 m Athens street the yield cannot clear it in time (pace#1 counted 2-3 rams per 60 s). Free-roam density elsewhere is unchanged; ?ayd=0 off. */
function AYD_clear(){if(!window.OD_AYDCLR||!AYD.on||typeof RO==='undefined'||!RO.on||RO.foot&&RO.foot!=='car'||!HUB.cars||RO.v<22)return;const h=RO.vh??RO.h,fx=Math.sin(h),fz=Math.cos(h),L=12+RO.v;for(const c of HUB.cars){if(c.dead>0||c.pk||c.tr)continue;const rx=c.x-RO.x,rz=c.z-RO.z;if(rx*rx+rz*rz>L*L+100)continue;const al=rx*fx+rz*fz,lat=rx*fz-rz*fx;if(al>-4&&al<L&&Math.abs(lat)<5.6){c.dead=6;AYD.cl=(AYD.cl||0)+1}}}
function AYD_park(){for(const c of HUB.cars){if(c.dead>0){if(!c.dz){c.dz=1;c.x=c.z=-1e7;AYD.parked=(AYD.parked||0)+1}}else if(c.dz)c.dz=0}}
hubTrafficStep=(f=>function(dt){try{AYD_pre(dt);AYD_clear();AYD_park()}catch(e){console.warn('AYD',e)}const r=f.apply(this,arguments);try{AYD_park()}catch(e){console.warn('AYD',e)}return r})(hubTrafficStep);

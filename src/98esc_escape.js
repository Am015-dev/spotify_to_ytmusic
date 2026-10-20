// escape-1 (lane escape-r21h, 2026-10-20, Alex: "the car MUST be able to get out of ANY hill hole"): a guaranteed escape ladder for free roam, both cities, PC + touch.
// Replaces TR8_unstick in roam (races keep it: RO.sp follows the race's own rules; ?esc=0 = old behaviour). ESC.age = seconds with the gas held, off the road, and
// still inside 12 m of where progress last happened ("trapped" = no progress, whether pinned, rocking in a bowl or sliding back down a wall).
//   a) at age 1.5 s (0.5 s when the ground rises > 29 deg on every one of 16 headings 6-10 m out): ASSIST for up to 2 s: slope grip held at full, gravity pull x0.2, the car
//      is turned to the easiest exit heading (the way out with the lowest rise within 60 m) and kept rolling at 10 m/s.
//   b) at age 4 s: short fade and lift to the nearest road point facing along it (boost and speed zeroed, no penalty in free roam).
//   c) the manual rescue is always there: touch button #tU (top right), keys U and R (R only outside challenges). Same lift as b).
// Progress only resets the age when the car is 12 m from the anchor AND out of the pit (ESC_depth <= 2.5 m: some heading leaves the pit with a rise under 2.5 m within 60 m), or on a road.
const ESC={q:new URLSearchParams(location.search).get('esc')!=='0',t1:1.5,t1g:.5,t2:4,assist:2,prog:12,depth:2.5,cnt:{assist:0,reset:0,manual:0},E:{age:0,as:0,ax:null,az:null,h:null,tp:0,log:null}};
function ESC_depth(x,z,wantDir){const g0=groundY(x,z);let mn=1e9,bk=0;for(let k=0;k<24;k++){const a=k*Math.PI/12,sx=Math.sin(a),sz=Math.cos(a);let m=-1e9;for(const r of[4,8,12,18,26,36,48,60]){const q=groundY(x+sx*r,z+sz*r)-g0;if(q>m)m=q}if(m<mn){mn=m;bk=a}}
  return wantDir?{depth:mn,dir:bk}:mn}
function ESC_boxed(x,z){const g0=groundY(x,z);for(let k=0;k<16;k++){const a=k*Math.PI/8,sx=Math.sin(a),sz=Math.cos(a);let hit=false;for(const r of[6,8,10])if((groundY(x+sx*r,z+sz*r)-g0)/r>.55){hit=true;break}if(!hit)return false}return true}
/* the lift never lands in a building or on a car: the nearest road point, else points 8-32 m along the road (heading q[2]) both ways, else the nearest point as is */
function ESC_clear(x,z,y){if(roamHit(x,z,2.8,y))return false;for(const q of(HUB.cars||[]))if(!q.dead&&q.x!=null&&Math.hypot(q.x-x,q.z-z)<7)return false;return true}
function ESC_spot(){const q=TR8_near(RO.x,RO.z);if(!q)return null;const sx=Math.sin(q[2]),sz=Math.cos(q[2]);
  for(const d of[0,8,-8,16,-16,24,-24,32,-32]){const x=q[0]+sx*d,z=q[1]+sz*d,y=groundAt(x,z,99);if(d&&!TR8_onRoad(x,z))continue;if(ESC_clear(x,z,y))return[x,z,q[2],d]}return q}
function ESC_lift(why){const q=ESC_spot();if(!q)return false;TR8_fade();
  if(!roamWarp(q[0],q[1],q[2])){RO.x=q[0];RO.z=q[1];RO.h=RO.vh=q[2];RO.y=groundAt(q[0],q[1],99);RO.vy=0}
  RO.v=0;RO.turbo=0;RO.yr=0;RO.trSl=0;RO.inv=Math.max(RO.inv||0,1.5);RO.t6n=(RO.t6n||0)+1;RO.t6s=0;RO.t8a=null;RO.stkT=0;ESC.cnt[why]=(ESC.cnt[why]||0)+1;const E=ESC.E;E.log={step:why,t:+E.age.toFixed(1),to:[Math.round(q[0]),Math.round(q[1])]};E.age=0;E.as=0;E.ax=null;E.sm=0;E.ring=null;E.fast=0;return true}
function ESC_unstick(dt){const E=ESC.E;
  if(!ESC.q||RO.sp||RO.wk||RO.veh==='boat'||state!=='roam')return TR8_unstick(dt);
  const c=CTL,held=c&&(c.thr||c.boost||c.brk&&RO.v<-.5),off=held&&!RO.trDeck&&!TR8_onRoad(RO.x,RO.z);
  if(!off){E.age=Math.max(0,E.age-2*dt);E.as=0;E.ax=null;E.ring=null;E.fast=0;E.p0=null;return}
  if(E.ax==null){E.ax=RO.x;E.az=RO.z;E.age=E.age||0;E.sm=0}
  /* reviewer fix: a car that is really moving is not trapped, whatever the ground around it looks like: > 8 m/s for 1 s, or >= 20 m of net travel in the last 2 s, clears the timer */
  /* hard bound: slow time (<= 8 m/s) spent within 40 m of the first trap point counts on, whatever the clears above do; 8 s of it lifts the car (a pit it keeps sliding back into) */
  if(E.p0==null||Math.hypot(RO.x-E.p0[0],RO.z-E.p0[1])>40){E.p0=[RO.x,RO.z];E.t0=0}if(Math.abs(RO.v)<=8)E.t0+=dt;if(E.t0>=8){ESC_lift('reset');E.p0=null;return}
  if(E.as>0){E.fast=0;E.ring=null}else{E.fast=Math.abs(RO.v)>8?(E.fast||0)+dt:0;E.rt=(E.rt||0)+dt;if(!E.ring||E.rt>=.25){E.rt=0;(E.ring=E.ring||[]).push([RO.x,RO.z]);if(E.ring.length>9)E.ring.shift()}}
  if(E.as<=0&&(E.fast>=1||E.ring&&E.ring.length>=9&&Math.hypot(RO.x-E.ring[0][0],RO.z-E.ring[0][1])>=20)){E.age=0;E.as=0;E.ax=RO.x;E.az=RO.z;E.sm=0;E.done=0;return}
  E.age+=dt;E.sm+=dt;
  const d=Math.hypot(RO.x-E.ax,RO.z-E.az);
  if(d>=ESC.prog&&E.sm>=.25){E.sm=0;const D=ESC_depth(RO.x,RO.z,true);if(D.depth<=ESC.depth){if(E.as>0&&E.age>ESC.t1g)E.log={step:'assist',t:+E.age.toFixed(1)};E.age=0;E.as=0;E.ax=RO.x;E.az=RO.z;return}E.ax=RO.x;E.az=RO.z;E.h=D.dir}   // moved 12 m but still inside a pit: age keeps running, anchor moves on
  if(E.age>=ESC.t2){ESC_lift('reset');return}
  if(E.age>=ESC.t1g&&E.as<=0&&!E.done&&Math.abs(RO.v)<5){E.tp+=dt;if(E.tp>=.25||E.age>=ESC.t1){E.tp=0;const D=ESC_depth(RO.x,RO.z,true);E.h=D.dir;
    if(E.age>=ESC.t1||ESC_boxed(RO.x,RO.z)){if(D.depth>ESC.depth){E.as=ESC.assist;E.done=1;ESC.cnt.assist++}}}}
  if(E.as>0){E.as-=dt;if(E.h!=null){const e=angDiff(E.h,RO.h);RO.h+=clamp(e,-2.5*dt,2.5*dt);RO.vh=(RO.vh??RO.h)+angDiff(RO.h,RO.vh??RO.h)*Math.min(1,dt*8);if(Math.abs(e)<1.2&&RO.v<10)RO.v=Math.min(10,RO.v+30*dt)}}
  if(E.as<=0&&E.age<.2)E.done=0}
function ESC_manual(){if(state!=='roam'||RO.sp||RO.wk||RO.frozen||RO.card)return false;const ok=ESC_lift('manual');if(ok)say('','BACK ON THE ROAD',1);return ok}
// touch + keyboard: #tU (top right). Hidden in races and on foot; keys U / R are handled in 40_hud_input_menu.js
setInterval(()=>{try{const b=document.getElementById('tU');if(!b)return;const show=state==='roam'&&!RO.sp&&!RO.wk&&!RO.card&&!RO.mapOpen;if(b.hidden===show)b.hidden=!show}catch(e){}},400);

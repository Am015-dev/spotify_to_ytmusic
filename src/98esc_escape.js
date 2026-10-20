// escape-1 (lane escape-r21h, 2026-10-20, Alex: "the car MUST be able to get out of ANY hill hole"): a guaranteed escape ladder for free roam, both cities, PC + touch.
// Replaces TR8_unstick in roam (races keep it: RO.sp follows the race's own rules; ?esc=0 = old behaviour).
// escape-r21h2 (review fix, stateless): no timers, no anchors. Every frame the car's raw samples [t,x,z,v,heading,+1 gas / -1 reversing] of this episode (gas held, off the road) go into E.H (last 6 s),
// and every decision is recomputed from E.H on that very frame:
//   GATE (a lift is impossible otherwise): |v| <= 8 m/s now AND >= 2 s of samples AND no sample of the last 2 s is 20 m or more from where the car is now.
//   TRAPPED = one of
//     pinned: the last 3 s made < 4 m of forward progress at a mean ground speed < 3 m/s (path / time: the wheel speed spins against walls), in a hole (ESC_hole: the 16-heading ring 6-10 m out rises beyond 29 deg everywhere, or every one of
//             24 headings rises > 2.5 m within 60 m); anywhere off the road when the same holds over the last 5 s (stuck on a lip, a shallow cup or a wall),
//     rocking: the last 5 s never left a 6 m radius of their centroid and the car reversed at least twice (small pockets the hole probe reads as shallow).
//   a) ASSIST (gas held, |v| < 5, < 8 m from every sample of the last 1.5 s, in a hole; 0.5 s when boxed by steep walls), once per episode, for up to 2 s: slope grip held,
//      gravity pull x0.2, the car turned to the easiest exit heading and kept rolling at 10 m/s.
//   b) LIFT when GATE and TRAPPED hold on the same frame: short fade, lift to the nearest clear road point facing along it (speed and boost zeroed, no penalty in free roam).
//   c) the manual rescue is always there: touch button #tU (top right), keys U and R (R only outside challenges). Same lift as b).
// The episode (E.H) is cleared when the gas is released, on a road, on any warp (roamWarp, a lift, or a jump > 8 m between frames) and outside free roam.
const ESC={q:new URLSearchParams(location.search).get('esc')!=='0',t1:1.5,t1g:.5,assist:2,depth:2.5,keep:6,vMax:8,net2:20,pin:{t:3,t2:5,net:4,v:3},rock:{t:5,r:6,rev:2},
  cnt:{assist:0,reset:0,manual:0},E:{H:[],T:0,as:0,h:null,tp:0,done:0,log:null}};
function ESC_depth(x,z,wantDir){const g0=groundY(x,z);let mn=1e9,bk=0;for(let k=0;k<24;k++){const a=k*Math.PI/12,sx=Math.sin(a),sz=Math.cos(a);let m=-1e9;for(const r of[4,8,12,18,26,36,48,60]){const q=groundY(x+sx*r,z+sz*r)-g0;if(q>m)m=q}if(m<mn){mn=m;bk=a}}
  return wantDir?{depth:mn,dir:bk}:mn}
function ESC_boxed(x,z){const g0=groundY(x,z);for(let k=0;k<16;k++){const a=k*Math.PI/8,sx=Math.sin(a),sz=Math.cos(a);let hit=false;for(const r of[6,8,10])if((groundY(x+sx*r,z+sz*r)-g0)/r>.55){hit=true;break}if(!hit)return false}return true}
function ESC_hole(x,z){return ESC_boxed(x,z)||ESC_depth(x,z)>ESC.depth}
/* E.H helpers: index of the newest sample at least w seconds old (-1 = the episode is younger than w); farthest distance of samples i.. from (x,z) */
function ESC_at(H,w){const T=H[H.length-1][0]-w+1e-6;for(let i=H.length-1;i>=0;i--)if(H[i][0]<=T)return i;return -1}
function ESC_far(H,i,x,z){let m=0;for(let k=i;k<H.length;k++){const d=Math.hypot(H[k][1]-x,H[k][2]-z);if(d>m)m=d}return m}
function ESC_gate(H){if(!H.length)return false;const c=H[H.length-1];if(!(Math.abs(c[3])<=ESC.vMax))return false;const i=ESC_at(H,2);return i>=0&&ESC_far(H,i,c[1],c[2])<ESC.net2}
/* pinned over w s: progress (displacement along the car's heading now, backwards when reversing: sliding back down a wall is no progress) < 4 m and a mean GROUND speed
   (path length / time, not the wheel speed RO.v, which spins against a wall) under 3 m/s */
function ESC_pin(H,w){const n=H.length,c=H[n-1],i=ESC_at(H,w);if(i<0)return false;let s=0;for(let k=i+1;k<n;k++)s+=Math.hypot(H[k][1]-H[k-1][1],H[k][2]-H[k-1][2]);
  return c[5]*((c[1]-H[i][1])*Math.sin(c[4])+(c[2]-H[i][2])*Math.cos(c[4]))<ESC.pin.net&&s/(c[0]-H[i][0])<ESC.pin.v}
function ESC_trapped(H){const n=H.length;if(!n)return'';const c=H[n-1];
  if(ESC_pin(H,ESC.pin.t)){if(ESC_hole(c[1],c[2]))return'pinned';if(ESC_pin(H,ESC.pin.t2))return'stuck'}
  let i=ESC_at(H,ESC.rock.t);if(i<0)return'';let cx=0,cz=0;for(let k=i;k<n;k++){cx+=H[k][1];cz+=H[k][2]}cx/=n-i;cz/=n-i;if(ESC_far(H,i,cx,cz)>=ESC.rock.r)return'';
  let rev=0,sg=0;for(let k=i;k<n;k++){const v=H[k][3];if(v>.5){if(sg<0)rev++;sg=1}else if(v<-.5){if(sg>0)rev++;sg=-1}}
  return rev>=ESC.rock.rev?'rocking':''}
function ESC_end(){const E=ESC.E;E.H.length=0;E.as=0;E.done=0;E.tp=0}
/* the lift never lands in a building or on a car: the nearest road point, else points 8-32 m along the road (heading q[2]) both ways, else the nearest point as is */
function ESC_clear(x,z,y){if(roamHit(x,z,2.8,y))return false;for(const q of(HUB.cars||[]))if(!q.dead&&q.x!=null&&Math.hypot(q.x-x,q.z-z)<7)return false;return true}
function ESC_spot(){const q=TR8_near(RO.x,RO.z);if(!q)return null;const sx=Math.sin(q[2]),sz=Math.cos(q[2]);
  for(const d of[0,8,-8,16,-16,24,-24,32,-32]){const x=q[0]+sx*d,z=q[1]+sz*d,y=groundAt(x,z,99);if(d&&!TR8_onRoad(x,z))continue;if(ESC_clear(x,z,y))return[x,z,q[2],d]}return q}
function ESC_lift(why,how){const q=ESC_spot();if(!q)return false;const H=ESC.E.H,c=H[H.length-1],i=H.length?ESC_at(H,2):-1;
  const log={step:why,how:how||'',t:H.length?+(c[0]-H[0][0]).toFixed(1):0,v:c?+Math.abs(c[3]).toFixed(1):0,far2:i>=0?+ESC_far(H,i,c[1],c[2]).toFixed(1):null,to:[Math.round(q[0]),Math.round(q[1])],at:q[3]==null?'near':q[3]};TR8_fade();
  if(!roamWarp(q[0],q[1],q[2])){RO.x=q[0];RO.z=q[1];RO.h=RO.vh=q[2];RO.y=groundAt(q[0],q[1],99);RO.vy=0}
  RO.v=0;RO.turbo=0;RO.yr=0;RO.trSl=0;RO.inv=Math.max(RO.inv||0,1.5);RO.t6n=(RO.t6n||0)+1;RO.t6s=0;RO.t8a=null;RO.stkT=0;ESC.cnt[why]=(ESC.cnt[why]||0)+1;ESC_end();ESC.E.log=log;return true}
function ESC_unstick(dt){const E=ESC.E;
  if(!ESC.q||RO.sp||RO.wk||RO.veh==='boat'||state!=='roam'){ESC_end();return TR8_unstick(dt)}
  const c=CTL,held=c&&(c.thr||c.boost||c.brk&&RO.v<-.5),off=held&&!RO.trDeck&&!TR8_onRoad(RO.x,RO.z);
  if(!off){ESC_end();return}
  const H=E.H,l=H[H.length-1];if(l&&Math.hypot(RO.x-l[1],RO.z-l[2])>8)ESC_end();   // a warp from anywhere: a new episode
  E.T+=dt;H.push([E.T,RO.x,RO.z,RO.v,RO.h,c.thr||c.boost?1:-1]);while(H[0][0]<E.T-ESC.keep)H.shift();
  if(ESC_gate(H)){const why=ESC_trapped(H);if(why){ESC_lift('reset',why);return}}
  /* assist: recomputed from E.H each frame too; the probe (192 groundY) is throttled to 4 Hz, except the 1.5 s rung */
  const span=H[H.length-1][0]-H[0][0];
  if(span>=ESC.t1g&&E.as<=0&&!E.done&&Math.abs(RO.v)<5){const i=ESC_at(H,Math.min(span,ESC.t1));E.tp+=dt;
    if(i>=0&&ESC_far(H,i,RO.x,RO.z)<8&&(E.tp>=.25||span>=ESC.t1&&span-dt<ESC.t1)){E.tp=0;const D=ESC_depth(RO.x,RO.z,true);E.h=D.dir;
      if(D.depth>ESC.depth&&(span>=ESC.t1||ESC_boxed(RO.x,RO.z))){E.as=ESC.assist;E.done=1;ESC.cnt.assist++}}}
  if(E.as>0){E.as-=dt;if(E.h!=null){const e=angDiff(E.h,RO.h);RO.h+=clamp(e,-2.5*dt,2.5*dt);RO.vh=(RO.vh??RO.h)+angDiff(RO.h,RO.vh??RO.h)*Math.min(1,dt*8);if(Math.abs(e)<1.2&&RO.v<10)RO.v=Math.min(10,RO.v+30*dt)}}}
function ESC_manual(){if(state!=='roam'||RO.sp||RO.wk||RO.frozen||RO.card)return false;const ok=ESC_lift('manual');if(ok)say('','BACK ON THE ROAD',1);return ok}
// any warp starts a new episode (no history carried across a teleport)
if(typeof roamWarp==='function')roamWarp=(f=>function(){ESC_end();return f.apply(this,arguments)})(roamWarp);
// touch + keyboard: #tU (top right). Hidden in races and on foot; keys U / R are handled in 40_hud_input_menu.js
setInterval(()=>{try{const b=document.getElementById('tU');if(!b)return;const show=state==='roam'&&!RO.sp&&!RO.wk&&!RO.card&&!RO.mapOpen;if(b.hidden===show)b.hidden=!show}catch(e){}},400);

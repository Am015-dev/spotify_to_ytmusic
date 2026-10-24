// PURPOSE: Street circle: foes without an attack slot strafe in depth around Kai instead of queueing in front of him, and take turns closing in
// FLAG: circle (?circle=0 = foes walk straight at Kai as before)
// TEST: qa/streetsim.js (W196 gates: waiting foes keep moving, depth spread)
/* ---------- STREETCIRCLE. Owner, 24 Oct 2026: "on foot is boring, foes just slide straight at Kai, the game is not strategic". Benchmark E2/N1.
   At most SLOTS foes attack or close in at once (attackers count first). Every other rusher / heavy (and a gunner that has no cover left) is a WAITER: it
   keeps 140-220 px from Kai on its own side, faces him, and every 1-2 s picks a new depth lane and distance to walk to at walk speed (no new art: the run strip
   plays slower). When a slot frees (an attacker dies or goes back to waiting, RESTT after its last attack) the waiter that waited longest closes in: whom to
   break first from a ring that is closing. This part only sets WHERE a waiter stands; the attacks themselves are the old ai (street2 / streethard). ---------- */
if(RET.circle===undefined)RET.circle=!/[?&]circle=0/.test(location.search);
(function(){
if(!RET.circle||!window.FOOT||!FOOT.S3||!FOOT._in||!FOOT.env)return;
const F=FOOT,S3=F.S3,ST=F.STAGES.zeil,abs=Math.abs,sgn=v=>v<0?-1:1,clamp=(v,a,b)=>v<a?a:v>b?b:v;
const C=F.CIRC={SLOTS:2,RMIN:140,RMAX:220,LEG0:1,LEG1:2,VX:110,VZ:.42,SLOW:.5,RESTT:3,NEAR:105,log:null};
const ATK={rusher:['crouch','lunge'],heavy:['wind','charge'],bigheavy:['wind','charge'],gunner:['pop','charge']},atk=q=>(q.tele||0)>0||(ATK[q.id]||[]).includes(q.state);
const on=()=>RET.circle&&F.S&&F.S.st===ST&&F.S.s3;
const rnd=(a,b)=>a+Math.random()*(b-a);
const free=e=>e.id!=='gunner'||(!(e.cov&&e.cov.hp>0&&!e.cov.gone)&&e.state!=='charge');   // a gunner behind cover keeps its cover game
/* who closes in: SLOTS minus the foes already attacking, longest-waiting first (never one that attacked less than RESTT ago) */
function turn(S,P){if(S._cirT===S.time)return S._cirS;S._cirT=S.time;
  const live=S.E.filter(q=>!q.dead&&!q.boss&&q.seen),busy=live.filter(atk);
  for(const q of live){if(atk(q))q._cirAt=S.time;}
  const el=live.filter(q=>!atk(q)&&free(q)&&(q.id==='rusher'||q.id==='heavy'||q.id==='gunner')).sort((a,b)=>((a._cirAt||-9)+C.RESTT>S.time)-((b._cirAt||-9)+C.RESTT>S.time)||(a._cirW||0)-(b._cirW||0)||abs(a.x-P.x)-abs(b.x-P.x));
  const s=new Set();let n=Math.max(0,C.SLOTS-busy.length);for(const q of el){if(n<=0)break;if((q._cirAt||-9)+C.RESTT>S.time&&el.some(o=>(o._cirAt||-9)+C.RESTT<=S.time&&!s.has(o)))continue;s.add(q);n--;}
  for(const q of el)if(!s.has(q)&&q._cirW==null)q._cirW=S.time;
  for(const q of s)q._cirW=null;
  return S._cirS=s;}
function wait(e,dt,env,S,P,mode){
  const lo=env.G.camX+e.w/2,hi=env.G.camX+env.G.viewW-e.w/2;
  if(e._cirSide==null){e._cirSide=sgn(e.x-P.x);e._cirLeg=0;e._cirZ=e.z==null?.5:e.z;}
  e._cirLeg-=dt;
  if(e._cirLeg<=0){e._cirLeg=rnd(C.LEG0,C.LEG1);e._cirR=rnd(C.RMIN,C.RMAX);let z=mode?clamp(P.z+rnd(-.15,.15),.05,.95):rnd(.05,.95);if(!mode&&abs(z-e._cirZ)<.25)z=clamp(e._cirZ+(z<e._cirZ?-1:1)*.3,.05,.95);e._cirTz=z;e._cirV=Math.min(C.VZ,abs(z-e._cirZ)/e._cirLeg);}
  const dx=P.x-e.x;e.facing=sgn(dx);
  const tx=clamp(P.x+e._cirSide*e._cirR,lo,hi),vx=mode==='z'?0:mode==='back'?-e.facing*C.VX*.6:clamp((tx-e.x)/Math.max(.2,e._cirLeg),-C.VX,C.VX);
  e.x=clamp(e.x+vx*dt,lo,hi);e.vx=vx;
  if(e.z!=null){e.z=e._cirZ;e.z+=clamp(e._cirTz-e.z,-e._cirV*dt,e._cirV*dt);e._cirZ=e.z;if(abs(vx)<=5&&abs(e._cirTz-e.z)>.005)e.vx=-e.facing*22;}   // a pure depth step still plays the run strip
  e.t-=dt*C.SLOW;   // walk speed: the run strip plays at half pace
  e._cirMv=1;}
const FE=window.FOOT_ENEMIES||{};
for(const id of ['rusher','gunner','heavy']){const d=FE[id];if(!d||d._cir)continue;d._cir=1;
  const a0=d.ai;d.ai=function(e,dt,env){
    const S=F.S,P=env.P;
    if(!on()||e.dead||e.state==='dead'||!e.seen||e.grace>0||!free(e)){e._cirMv=0;return a0.apply(this,arguments);}
    const run=s=>s==='in'||s==='run'||s==='walk'||s==='open'||s==='';
    const rest=e.id==='rusher'&&e.state==='rest',close=turn(S,P).has(e);
    if(atk(e)||!(run(e.state)||rest)||(!rest&&abs(P.x-e.x)<C.NEAR)||close&&!(e.id==='heavy')){if(e._cirMv){e._cirMv=0;e._cirSide=null;}return a0.apply(this,arguments);}
    if(close||rest){const x1=e.x,s1=e.state;a0.apply(this,arguments);if(atk(e)||e.state==='dead'||e.state!==s1||abs(e.x-x1)>.01)return;wait(e,dt,env,S,P,rest?'back':'z');return;}   // a closer that is already in place, or a rusher recovering from a lunge, keeps moving
    const x0=e.x,s0=e.state,t0=e.sT,c0=e.cd,y0=e.vx;
    a0.apply(this,arguments);
    if(atk(e)||e.state==='charge'||e.state==='dead'){return;}   // it was hit into a stun or got an attack of its own: the old ai wins
    if(e.state!==s0&&!run(e.state)){e.state=s0;e.sT=t0;e.tele=0;e.tw=0;e.hid=false;if(c0!=null)e.cd=Math.max(.3,c0);}   // wanted to wind up while it has no slot: it waits
    e.x=x0;e.vx=y0;
    wait(e,dt,env,S,P);};}
})();

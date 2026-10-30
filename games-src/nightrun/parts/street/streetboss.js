// PURPOSE: Street boss phases: the big heavy fights in 3 named phases with 4 attacks, each with its own telegraph and its own answer, and an opening after every attack
// FLAG: sboss (ON by default; ?sboss=0 turns it off)
// TEST: qa/streetsim.js with Q='&sboss=1' DBG=qa/bossprobe.js (boss gate lines)
/* ---------- STREETBOSS (W167, design: benchmark/STREET-BAR-SCORE-2026-10-23.md task 1; rows B1-B3 of benchmark/STREET-BAR.md).
   Was: one attack (wind-up -> charge) and no phases; the fight ended after 2 charges. Now (wraps FOOT_BOSS.bigheavy from street2.js heavyDef):
   PHASE 1 THE CHARGE (100-66% hp): charge (red crouch 0.8 s; JUMP it or DASH through) and, when Kai keeps his distance, a barrel throw (wind-up 0.8 s; STEP BACK or stand behind cover); W279: closer than 200 px it backs off first, so it charges a still or cornered Kai too.
   PHASE 2 GROUND POUND (66-33%): + pound: two shock waves roll along the road both ways (wind-up 0.8 s; JUMP the wave).
   PHASE 3 LEAP (33-0%): + leaping slam on the spot Kai stood on when it crouched (wind-up 0.8 s, red marks on the road; DASH or run out of them).
   Each phase starts with a 1.2 s roar (no damage, its name over the boss and on the bar) and then the phase's new attack, so every fight that reaches 33% sees all of them.
   The player decision: read which attack is coming and pick its answer (jump / step back / dash), then punish the 1 s opening (OPEN, full damage) after every attack.
   Damage cannot skip a phase: hp stops at the phase line until the roar is over (an opening in progress is finished first). ---------- */
if(RET.sboss===undefined)RET.sboss=!/[?&]sboss=0/.test(location.search);
if(RET.pound2===undefined)RET.pound2=!/[?&]pound2=0/.test(location.search);   // W186 (?pound2=1 = on; OFF until its gates pass): the pound's wave and the leap's landing keep ONE depth line, drawn in red during the 0.8 s wind-up
(function(){
const F=window.FOOT,FBS=window.FOOT_BOSS||{},d=FBS.bigheavy;
if(!RET.sboss||!F||!F._in||!d||!d.ai||d._sb)return;d._sb=1;
const IN=F._in,FL=470,abs=Math.abs,sgn=v=>v<0?-1:1,clamp=(v,a,b)=>v<a?a:v>b?b:v;
const PH=[null,{n:'THE CHARGE',at:['charge','throw']},{n:'GROUND POUND',at:['pound']},{n:'LEAP',at:['leap']}],LINE=[0,1,.66,.33];
const CAP={charge:'CHARGE · JUMP OR DASH',throw:'BARREL · STEP BACK',pound:RET.pound2?'POUND · LEAVE THE RED LINE OR JUMP':'GROUND POUND · JUMP THE WAVE',leap:RET.pound2?'LEAP · LEAVE THE RED RING':'LEAP · DASH OUT'};
// Tuning block (BALANCE-W279.md, BALANCE-W280.md): these are the shipped defaults, no flags. Telegraphs: every wind-up >= 0.8 s, the phone reaction window W277 measured.
const WIND={throw:.8,pound:.8,leap:.8},   // wind-up per attack in s (the charge's 0.8 s lives in street2.js heavyDef); W279: throw .7 -> .8, leap .6 -> .8
  OPEN=1.0,ROAR=1.2,LEAPT=.7,             // opening after an attack, phase roar, leap flight (s)
  HPK=8,                                  // boss hp = 36 x HPK = 288 (W279 sweep, no adds: 180 and 234 are cleared by the state-aware bot with equal reaction on both devices; 288 = top of the allowed range)
  CHDMG=2,                                // hearts a charge takes (W279 sweep: 1 let the phone bot clear 8/8 and an idle phone Kai outlast the boss)
  GAP=150,                                // run-up in px before a CHARGE (W280: charge only, 200 -> 150; W279 backed off 200 px before every attack): closer than this it backs off first, so the charge has its 0.12 s launch even vs a still Kai
  BACKV=110,                              // its back-off speed (px/s; it walks in at 70)
  PINX=28,PINDMG=2;                       // W280: a charge that reaches the screen edge with Kai pinned there lands from PINX px (shoulder tip on his body edge) for PINDMG hearts (PC idle Kai was never hit: 45-51 px short every charge)
const SB=F.SB={log:[]};   // per fight: {ph:[[phase,t]], at:[[attack,t]]} for the probe
const name=e=>'BIG HEAVY · PHASE '+e.ph+': '+PH[e.ph].n;
function go(e,s){e.state=s;e.sT=0;}
function open(e){go(e,'stun');e.stun=OPEN;e.cd=1.3;e.tele=0;e.atk='';}   // heavyDef's stun: OPEN, full damage, then it walks again
function pick(e,P){const at=[].concat(...PH.slice(1,e.ph+1).map(p=>p.at)),far=abs(P.x-e.x)>260;
  let w=at.map(a=>a===e.last?.25:a==='throw'?(far?2:.3):a==='leap'?(far?1.6:1):1),s=w.reduce((a,b)=>a+b,0),r=Math.random()*s;
  for(let i=0;i<at.length;i++){r-=w[i];if(r<=0)return at[i];}return at[0];}
function begin(e,a,S,env){e.atk=a;e.last=a;e.L.at.push([a,+S.time.toFixed(2)]);if(!e.capd[a]){e.capd[a]=1;IN.pop(cx(e,env),e.y-e.h-30,CAP[a],'#ffb020');}
  if(a==='charge'){go(e,'wind');return;}go(e,'sb_'+a+'W');e.tele=WIND[a];if(a==='leap'){e.tx=clamp(S.P.x,env.G.camX+(e.fw||e.w/2),env.G.camX+env.G.viewW-(e.fw||e.w/2));e.x0=e.x;}if(RET.pound2&&e.z!=null)e.zl=e.z;}
const a0=d.ai,p0=d.pose,h0=d.onHit;
d.onHit=function(e,dm){h0.apply(this,arguments);if(e._sb)e.hp=Math.max(e.hp,e.state==='sb_roar'?e.hpLock:e.ph<3?e.max*LINE[e.ph+1]:-1e9);};   // no skipping a phase, even with a bomb or a barrel
d.pose=e=>/^sb_.*W$/.test(e.state)?'crouch':e.state==='sb_roar'?'hit':/^sb_/.test(e.state)?'melee':p0(e);
d.ai=function(e,dt,env){const S=F.S,P=env.P;
  if(!e._sb){e._sb=1;e.ph=1;e.hp=e.max=e.maxHp=e.mhp=e.max*HPK;e.capd={};e.L={ph:[[1,+S.time.toFixed(2)]],at:[]};SB.log.push(e.L);e.bname=name(e);}
  if(e.state==='dead'||!e._i)return a0.apply(this,arguments);
  // phase line: hp stops there until the roar is done
  const want=e.hp<=e.max*LINE[3]?3:e.hp<=e.max*LINE[2]?2:1;
  if(want>e.ph&&!/^sb_/.test(e.state)&&e.state!=='charge'&&e.state!=='stun'){e.ph++;e.hpLock=e.max*LINE[e.ph];e.hp=Math.max(e.hp,e.hpLock);e.bname=name(e);e.next=PH[e.ph].at[0];e.L.ph.push([e.ph,+S.time.toFixed(2)]);
    go(e,'sb_roar');e.vx=0;e.tele=0;IN.pop(cx(e,env),e.y-e.h-30,'PHASE '+e.ph+': '+PH[e.ph].n,'#ff4a6a',1);shake(S,6);}
  if(/^sb_/.test(e.state)){e.sT+=dt;e.y=FL;e.heavy=1;e.label='';const st=e.state;
    if(st==='sb_roar'){e.vx=0;if(e.sT>=ROAR){go(e,'walk');e.cd=0;}return;}
    if(st==='sb_throwW'||st==='sb_poundW'||st==='sb_leapW'){e.vx=0;e.facing=sgn(P.x-e.x);e.tele=Math.max(0,WIND[e.atk]-e.sT);
      if(RET.pound2)hold(e,env);
      if(st==='sb_leapW')mark(S,e.tx,e);
      if(e.sT>=WIND[e.atk]){e.tele=0;
        if(e.atk==='throw'){const dx=P.x-e.x,T=.85,vx=dx/T,vy=-(855*T)/2+(FL-30-(e.y-e.h*.8))/T;const n0=S.eb.length,q0=(S.xq||[]).length;env.shoot(e,0,300,1,{vx,grav:1,oy:e.y-e.h*.8,w:22,h:22});const b=S.eb.length>n0?S.eb[n0]:(S.xq||[]).length>q0?S.xq[q0]:null;if(b){b.vy=vy;b.sb=1;}go(e,'sb_throw');}
        else if(e.atk==='pound'){if(RET.pound2)hold(e,env);for(const s of [-1,1])env.shoot(e,0,300,1,{ground:1,vx:s*300,ox:e.x+s*e.w/2,life:3});shake(S,8);go(e,'sb_pound');}
        else go(e,'sb_leap');}
      return;}
    if(st==='sb_throw'||st==='sb_pound'){e.vx=0;if(e.sT>=.3){clr(e);open(e);}return;}
    if(RET.pound2&&st==='sb_leap')hold(e,env);
    if(st==='sb_leap'){const u=Math.min(1,e.sT/LEAPT);e.x=e.x0+(e.tx-e.x0)*u;e.y=FL-Math.sin(Math.PI*u)*200;e.vx=(e.tx-e.x0)/LEAPT;mark(S,e.tx,e);
      if(u>=1){e.y=FL;e.vx=0;env.melee(e,{x:e.tx-70,y:FL-e.h,w:140,h:e.h},2);shake(S,9);clr(e);open(e);}return;}}
  if(e.state==='walk'&&back(e,P,dt,env))return;
  e._pin=e.state==='charge'&&e.sT>=.12&&pin(e,P,env.G);
  const s0=e.state,x0=e.x;a0.call(this,e,dt,e.state==='charge'?low(env):env);
  if(e.state==='charge'&&e.sT>.05&&e.x===x0){open(e);return;}   // stuck a few px short of the screen edge (walk() refuses the step, the wall test never fires): that is the wall
  if(e.state==='wind'&&s0!=='wind'){const a=e.next||pick(e,P);e.next=null;begin(e,a,S,env);}   // heavyDef chose to attack: this phase picks which
  else if(s0==='charge'&&e.state==='walk')open(e);};   // an opening after every charge, not only after a wall hit
function low(env){const o=Object.create(env);o.melee=(e,r)=>{if(e.sT<.12)return false;return env.melee(e,{x:r.x,y:r.y+r.h*.35,w:r.w,h:r.h*.65},e._pin?PINDMG:CHDMG);};return o;}   // charges head down (a jump clears it: streetreach.js keeps this y band) and launches 0.12 s before it can hit (a jump at point blank works); its x reach is the shoulder tip (streetreach.js), W280: W279's fw widening here never applied and is gone, the screen-edge case is pin()
function pin(e,P,G){const h=e.fw||e.w/2,f=e.facing>0?1:-1,edge=f>0?G.camX+G.viewW:G.camX;   // W280: Kai pinned in the strip between the drawn figure and the screen edge (the fw clamp keeps its centre h px off the edge,
  if(f*(edge-e.x)-h>=12||f*(P.x-e.x)<=0||f*(edge-P.x)>=h)return false;e.x=P.x-f*PINX;return true;}   // streetreach.js lands a hit only from the shoulder tip, ~18 px past the centre): it steps into the strip for the slam (the engine clamp puts it back next frame)
function back(e,P,dt,env){const dx=P.x-e.x;if(abs(dx)>=GAP||(e.cd||0)>dt||e.grace>0||!e.seen)return false;   // only when its attack is due: it walks in as before, backs off, then winds up
  if(!e.next)e.next=pick(e,P);if(e.next!=='charge')return false;   // W280: only a charge needs the run-up; barrel, pound and leap come from where it stands (W279 backed off for all four: the pound's wave then met a jumping Kai as he landed)
  const G=env.G,h=e.fw||e.w/2,nx=clamp(e.x-sgn(dx)*BACKV*dt,G.camX+h,G.camX+G.viewW-h);
  if(abs(nx-e.x)<BACKV*dt*.5)return false;e.x=nx;e.vx=-sgn(dx)*BACKV;e.facing=sgn(dx);return true;}   // W279: no room behind it = it attacks from where it stands
function cx(e,env){const G=env.G,m=Math.min(170,G.viewW/2);return Math.max(G.camX+m,Math.min(G.camX+G.viewW-m,e.x));}   // captions stay on screen on a phone
function shake(S,v){S.shake=Math.max(S.shake||0,v);}
function mark(S,x,e){if(!RET.pound2||e.zl==null){for(let i=-2;i<=2;i++)S.fx.push({x:x+i*30,y:FL-4,l:.04,c:'#ff2d3a',r:12});return;}
  if(!e.mk){e.mk=[{ring:1,x,y:FL-4,r:78,m:1e3,c:'#ff2d3a',z:e.zl},{ring:1,x,y:FL-4,r:40,m:1e3,c:'#ff2d3a',z:e.zl}];for(const f of e.mk)S.fx.push(f);}
  for(const f of e.mk)f.l=.4;}   // W186: one ring pair (a shadow) on the landing spot at the boss's depth, kept alive each step
function hold(e,env){e.z=e.zl;if(e.atk!=='pound')return;if(e.mk){for(const f of e.mk)f.l=.4;return;}const G=env.G,S=F.S;e.mk=[];for(let x=G.camX+10;x<G.camX+G.viewW;x+=36)e.mk.push({x,y:FL-4,l:.4,c:'#ff2d3a',r:14,z:e.zl});for(const f of e.mk)S.fx.push(f);}
function clr(e){if(e.mk)for(const f of e.mk)f.l=0;e.mk=null;e.zl=null;}
})();

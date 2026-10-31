// PURPOSE: Street boss duel: the big heavy cycles 3 attacks (SWING, CHARGE, POUND), each with its own telegraph and ONE right answer (GUARD, DASH, JUMP); the right answer opens a punish window, a wrong or late one costs hearts
// FLAG: sboss (ON by default; ?sboss=0 turns it off)
// TEST: qa/gauntlet-foot.js STRATS=duelist,late,dodger JUMP=152 (boss only) and from the title; design and numbers: BALANCE-W290.md
/* ---------- STREETBOSS (W290 duel, replaces the W167 three-phase fight; wraps FOOT_BOSS.bigheavy from street2.js heavyDef).
   One decision per attack. Every attack has a telegraph of TEL s (pose + sound + the answer word over the boss); the answer must be given in the
   READ part of it (all but the last CUT s, when the boss commits and flashes). The first answer key pressed (guard / dash / jump) is the decision:
   right = no damage and the boss is OPEN for PUN s (heavyDef's stun: x2 damage, no armour); wrong or none = the attack lands (SWING 1, CHARGE 2, POUND 1 heart).
   Order: SWING (walks in, raised fist: GUARD), CHARGE (crouches low: DASH through), POUND (rises up: JUMP), repeated so the player learns it.
   Camping: CAMP s without an attack (Kai keeps away or stands still) = a CHARGE straight away, out of order (the gap-closer). ---------- */
if(RET.sboss===undefined)RET.sboss=!/[?&]sboss=0/.test(location.search);
if(RET.pound2===undefined)RET.pound2=!/[?&]pound2=0/.test(location.search);   // W186: HUD layout of the boss bar (streetlook.js, streetfeel.js); the boss itself no longer reads it
(function(){
const F=window.FOOT,FBS=window.FOOT_BOSS||{},d=FBS.bigheavy;
if(!RET.sboss||!F||!F._in||!d||!d.ai||d._sb)return;d._sb=1;
const IN=F._in,I=IN.I,FL=470,abs=Math.abs,sgn=v=>v<0?-1:1,clamp=(v,a,b)=>v<a?a:v>b?b:v;
const CYCLE=['swing','charge','pound'];
const ANS={swing:'guard',charge:'dash',pound:'jump'},WORD={swing:'GUARD!',charge:'DASH!',pound:'JUMP!'},COL={swing:'#ffd23a',charge:'#ff3a4a',pound:'#4ad8ff'};
const SND={swing:'warn',charge:'dash',pound:'up'},POSE={swing:'melee',charge:'crouch',pound:'idle'},GOOD={swing:'PARRY!',charge:'DODGED!',pound:'CLEARED!'};
const DMG={swing:1,charge:2,pound:1};
// Tuning block (BALANCE-W290.md): shipped defaults, no flags.
const TEL={swing:.85,charge:.95,pound:1.0},  // telegraph start -> hit (s)
  CUT={swing:.25,charge:.2,pound:.15},    // the last CUT s of a telegraph: the boss commits, an answer there is too late (READ ends at .60 / .75 / .85 s)
  PUN=1.6,                                // punish window after a right answer (s; stun = x2 damage)
  REC=.9,                                 // after a missed / wrong attack: it shakes it off, no punish (s)
  GAPT=.9,                                // between attacks: it walks (s)
  CAMP=4,                                 // s without an attack -> a CHARGE (gap-closer)
  REACH=120,POUNDR=560,CHV=600,CHT=.6,    // swing reach, pound reach (px), charge speed (px/s) and time (s)
  GAP=150,BACKV=110,WALKV=110,            // run-up before a charge (px), its back-off and walk speeds (px/s)
  HPK=6;                                  // boss hp = 36 x HPK
const NL={beam:1};   // not a limb: the charge's body and the pound's ground band skip streetreach.js's fist-tip test (its own bypass flag)
const SB=F.SB={log:[]};   // per fight: {at:[[attack,t,result]]} for the probes
const p0=d.pose,a0=d.ai;
function go(e,s){e.state=s;e.sT=0;}
function keys(){return {guard:!!(I.guard||I.guardP),dash:!!(I.dash||I.dashP),jump:!!(I.jump||I.jumpP)};}
function edge(e){const k=keys(),o=e.k0||{};e.k0=k;for(const a of ['guard','dash','jump'])if(k[a]&&!o[a])return a;return null;}
function scr(e,env,x){const G=env.G,h=e.fw||e.w/2;return clamp(x,G.camX+h,G.camX+G.viewW-h);}
function cx(e,env){const G=env.G,m=Math.min(170,G.viewW/2);return Math.max(G.camX+m,Math.min(G.camX+G.viewW-m,e.x));}   // captions stay on screen on a phone
function shake(S,v){S.shake=Math.max(S.shake||0,v);}
function tel(e,a,S,env){e.atk=a;e.ans=null;e.tid=(e.tid|0)+1;go(e,'sb_tel');e.tele=TEL[a];e.facing=sgn(S.P.x-e.x);
  e.L.at.push([a,+S.time.toFixed(2),'']);IN.sfx(SND[a]);IN.pop(cx(e,env),e.y-e.h-34,WORD[a],COL[a],1);}
function done(e,S,res){const r=e.L.at[e.L.at.length-1];if(r)r[2]=res;e.last=S.time;e.tele=0;e.label='';}
function punish(e,S,env){done(e,S,'right');IN.hitstop(70);IN.sfx('big');IN.pop(cx(e,env),e.y-e.h-34,GOOD[e.atk]+' OPEN','#7dff8a',1);go(e,'stun');e.stun=PUN;e.vx=0;}
function miss(e,S,res){done(e,S,res);e.hitd=0;go(e,'sb_rec');e.vx=0;}
d.pose=e=>e.state==='sb_tel'?(e.sT>=TEL[e.atk]-CUT[e.atk]?(e.atk==='charge'?'melee':POSE[e.atk]):POSE[e.atk]):e.state==='sb_go'?(e.atk==='pound'?'crouch':'melee'):e.state==='sb_rec'?'idle':p0(e);
d.ai=function(e,dt,env){const S=F.S,P=env.P;
  if(e.state==='dead'||!e._i)return a0.apply(this,arguments);
  if(!e._sb){e._sb=1;e.hp=e.max=e.maxHp=e.mhp=e.max*HPK;e.i=0;e.last=S.time;e.L={at:[]};SB.log.push(e.L);e.bname='BIG HEAVY';go(e,'sb_walk');}
  e.sT+=dt;e.y=FL;e.heavy=1;const dx=P.x-e.x,st=e.state;
  if(st==='stun'){e.vx=0;e.label='OPEN';if(e.sT>=e.stun){e.label='';go(e,'sb_walk');e.last=S.time;}return;}
  if(st==='sb_rec'){e.vx=0;if(e.sT>=REC){go(e,'sb_walk');e.last=S.time;}return;}
  if(st==='sb_walk'||st==='in'||st==='walk'){e.label='';e.tele=0;if(st!=='sb_walk')go(e,'sb_walk');e.k0=keys();
    if(e.grace>0||!e.seen){e.vx=0;e.facing=sgn(dx);return;}
    const camp=S.time-e.last>=CAMP,nxt=camp?'charge':CYCLE[e.i%CYCLE.length];e.facing=sgn(dx);
    if(e.sT<GAPT&&!camp){walkTo(e,env,dx,dt,nxt);return;}
    if(nxt==='swing'&&abs(dx)>80){walkTo(e,env,dx,dt,nxt);return;}
    if(nxt==='charge'&&abs(dx)<GAP&&e.sT<GAPT+.8){const nx=scr(e,env,e.x-sgn(dx)*BACKV*dt);if(abs(nx-e.x)>BACKV*dt*.5){e.x=nx;e.vx=-sgn(dx)*BACKV;return;}}   // run-up: backs off first (no room behind it: charges from where it stands)
    if(nxt==='pound'&&abs(dx)>POUNDR-80){walkTo(e,env,dx,dt,nxt);return;}
    if(!camp)e.i++;e.vx=0;tel(e,nxt,S,env);return;}
  if(st==='sb_tel'){e.vx=0;const T=TEL[e.atk],k=edge(e);e.tele=Math.max(0,T-e.sT);
    if(e.sT<T-CUT[e.atk]){e.facing=sgn(dx);if(k&&!e.ans)e.ans=k;}   // the read part: the first answer key is the decision
    else{e.label=WORD[e.atk];if(k&&!e.ans)e.ans='late';}
    if(e.atk==='pound')e.y=FL-Math.min(1,e.sT/T)*26;   // it rises up on its toes
    if(e.sT>=T){const ok=e.ans===ANS[e.atk];e.y=FL;
      if(!ok&&e.ans&&e.ans!=='late')IN.pop(P.x,P.y-110,'WRONG · '+WORD[e.atk],'#ff8a8a');else if(!ok)IN.pop(P.x,P.y-110,'TOO LATE','#ff8a8a');
      e.ok=ok;go(e,'sb_go');if(e.atk==='pound'){shake(S,9);for(const s of [-1,1])for(let i=1;i<=6;i++)S.fx.push({x:e.x+s*i*POUNDR/6,y:FL-4,l:.25+i*.04,c:COL.pound,r:16});}}
    return;}
  if(st==='sb_go'){const a=e.atk;
    if(a==='swing'){if(!e.ok&&!e.hitd)e.hitd=env.melee(e,{x:e.facing>0?e.x:e.x-REACH,y:e.y-e.h,w:REACH,h:e.h},DMG.swing);if(e.sT>=.35){e.ok?punish(e,S,env):miss(e,S,(e.ans?'wrong-'+e.ans:'none')+(e.hitd?'+hit':''));}return;}
    if(a==='pound'){if(!e.ok&&e.sT<dt*1.5)e.hitd=env.melee(e,{x:e.x-POUNDR,y:FL-46,w:POUNDR*2,h:46},DMG.pound,NL);if(e.sT>=.25){e.ok?punish(e,S,env):miss(e,S,(e.ans?'wrong-'+e.ans:'none')+(e.hitd?'+hit':''));}return;}
    // charge: straight at where Kai stood at the commit; a right answer = it runs through him and stumbles (punish), else it can hit for 2
    const nx=scr(e,env,e.x+e.facing*CHV*dt),wall=abs(nx-e.x)<CHV*dt*.5;e.x=nx;e.vx=e.facing*CHV;
    if(!e.ok&&!e.hitd)e.hitd=env.melee(e,{x:e.x-(e.fw||e.w/2),y:e.y-e.h,w:2*(e.fw||e.w/2),h:e.h},DMG.charge,NL);
    for(const p of S.pr)if(p.hp>0&&!p.gone&&abs(p.x-e.x)<p.w/2+e.w/2)IN.hitProp(p,p.k==='barrel'?5:99);
    if(e.sT>=CHT||wall){if(wall)shake(S,7);e.ok?punish(e,S,env):miss(e,S,(e.ans?'wrong-'+e.ans:'none')+(e.hitd?'+hit':''));}
    return;}
  go(e,'sb_walk');};
function walkTo(e,env,dx,dt,nxt){const want=nxt==='swing'?60:200;if(abs(dx)<=want){e.vx=0;return;}const nx=scr(e,env,e.x+sgn(dx)*WALKV*dt);e.vx=(nx-e.x)/dt;e.x=nx;}
})();

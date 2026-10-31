// PURPOSE: Street boss duel: the big heavy cycles 3 attacks (SWING, CHARGE, POUND), each with its own telegraph and ONE right answer (GUARD, DASH, JUMP); the right answer opens a punish window, a wrong or late one costs hearts
// FLAG: sboss (ON by default; ?sboss=0 turns it off)
// TEST: qa/gauntlet-foot.js STRATS=duelist,late,dodger JUMP=152 (boss only) and from the title; qa/bossduel-shots.js; design and numbers: BALANCE-W300.md
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
const KEY={guard:'I',dash:'SHIFT',jump:'K'},BTN={guard:'GUARD',dash:'DASH',jump:'JUMP'};   // the answer's control: PC key (streetguard.js / foot.js KM) or the phone button's own label
// W300 poses (owner's frames only, 17h): [x scale, y scale, lean] drawn about the feet by purefoot.js; SWING looms (melee frame, 1.1x), CHARGE coils low and long (crouch, squashed), POUND stands tall (idle, stretched, rising)
const DSC={swing:[1.1,1.1],charge:[1.16,.84],pound:[.94,1.16]};
const DMG={swing:1,charge:2,pound:1};
// Tuning block (BALANCE-W290.md): shipped defaults, no flags.
const TEL={swing:1.0,charge:1.05,pound:1.1},  // telegraph start -> hit (s)
  CUT={swing:.44,charge:.39,pound:.28},   // the last CUT s of a telegraph: the boss commits (READ ends at .56 / .66 / .82 s)
  GRACE=.18,                              // an answer up to GRACE s after the READ end still counts (accepted until .69 / .79 / .95 s); later = TOO LATE (W300 PC late reader: .75/.85 4/4, .70/.82 3/4, .70/.80 4/4, .68/.78 1/4)
  TGRACE=.02,                             // + on a touch screen (tap latency; phone late reader: +0 at .70/.82 0/4, +0 at .75/.85 3/4, +.08 at .70/.80 4/4)
  PUN=1.6,                                // punish window after a right answer (s; stun = x2 damage)
  REC=.9,                                 // after a missed / wrong attack: it shakes it off, no punish (s)
  GAPT=.9,                                // between attacks: it walks (s)
  CAMP=4,                                 // s without an attack -> a CHARGE (gap-closer)
  REACH=120,POUNDR=560,CHV=600,CHT=.6,    // swing reach, pound reach (px), charge speed (px/s) and time (s)
  GAP=150,BACKV=110,WALKV=110,            // run-up before a charge (px), its back-off and walk speeds (px/s)
  HPK=6;                                  // boss hp = 36 x HPK
const NL={beam:1};   // not a limb: the charge's body and the pound's ground band skip streetreach.js's fist-tip test (its own bypass flag)
const SB=F.SB={log:[],fx:[],flash:0};   // per fight: {at:[[attack,t,result]]} for the probes; fx / flash: the duel's own drawn words (purefoot.js calls SB.draw)
const acc=a=>{const L=IN.L();return TEL[a]-CUT[a]+GRACE+(L&&L.touch?TGRACE:0);};   // last moment an answer counts
const p0=d.pose,a0=d.ai;
function go(e,s){e.state=s;e.sT=0;}
function keys(){return {guard:!!(I.guard||I.guardP),dash:!!(I.dash||I.dashP),jump:!!(I.jump||I.jumpP)};}
function edge(e){const k=keys(),o=e.k0||{};e.k0=k;for(const a of ['guard','dash','jump'])if(k[a]&&!o[a])return a;return null;}
function scr(e,env,x){const G=env.G,h=e.fw||e.w/2;return clamp(x,G.camX+h,G.camX+G.viewW-h);}
function cx(e,env){const G=env.G,m=Math.min(170,G.viewW/2);return Math.max(G.camX+m,Math.min(G.camX+G.viewW-m,e.x));}   // captions stay on screen on a phone
function shake(S,v){S.shake=Math.max(S.shake||0,v);}
function say(t,c,l,big){SB.fx.push({t,c,l,m:l,big});if(SB.fx.length>4)SB.fx.shift();}
function tel(e,a,S,env){e.atk=a;e.ans=null;e.tid=(e.tid|0)+1;go(e,'sb_tel');e.tele=0;e.sbT=TEL[a];e.facing=sgn(S.P.x-e.x);
  e.L.at.push([a,+S.time.toFixed(2),'']);IN.sfx(SND[a]);}
function done(e,S,res){const r=e.L.at[e.L.at.length-1];if(r)r[2]=res;e.last=S.time;e.tele=0;e.sbT=0;e.label='';}
function punish(e,S,env){done(e,S,'right');IN.hitstop(70);IN.sfx('big');say(GOOD[e.atk],'#7dff8a',.9,1);go(e,'stun');e.stun=PUN;e.vx=0;}
function miss(e,S,res){done(e,S,res);e.hitd=0;go(e,'sb_rec');e.vx=0;}
d.pose=e=>e.state==='sb_tel'?POSE[e.atk]:e.state==='sb_go'?(e.atk==='pound'?'crouch':e.atk==='charge'?'run-a':'melee'):e.state==='stun'?'hit':e.state==='sb_rec'?'idle':p0(e);
// drawn scale per state (purefoot.js reads e.dsc): the telegraph pose grows into its shape over the READ part and holds it in the commit
function dsc(e){if(e.state!=='sb_tel'&&!(e.state==='sb_go'&&e.atk==='charge')){e.dsc=e.state==='stun'?[1,.94]:null;return;}const q=DSC[e.atk],k=e.state==='sb_go'?1:Math.min(1,e.sT/(TEL[e.atk]-CUT[e.atk]));e.dsc=[1+(q[0]-1)*k,1+(q[1]-1)*k];}
d.ai=function(e,dt,env){const S=F.S,P=env.P;
  if(e.state==='dead'||!e._i)return a0.apply(this,arguments);
  if(!e._sb){e._sb=1;e.hp=e.max=e.maxHp=e.mhp=e.max*HPK;e.i=0;e.last=S.time;e.L={at:[]};SB.log.push(e.L);S.sbL=e.L;e.bname='BIG HEAVY';go(e,'sb_walk');}
  e.sT+=dt;e.y=FL;e.heavy=1;const dx=P.x-e.x,st=e.state;SB.on=e;try{return ai1(e,dt,env,S,P,dx,st);}finally{dsc(e);}};
function ai1(e,dt,env,S,P,dx,st){
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
  if(st==='sb_tel'){e.vx=0;const T=TEL[e.atk],k=edge(e);e.tele=0;e.sbT=Math.max(0,T-e.sT);
    if(e.sT<T-CUT[e.atk])e.facing=sgn(dx);   // it tracks Kai in the read part, then commits to that side
    if(k&&!e.ans){e.ans=e.sT<=acc(e.atk)?k:'late';const r=e.L.at[e.L.at.length-1];if(r){r[3]=+e.sT.toFixed(3);r[4]=k;}}   // W304: the log keeps when (s after the telegraph started) and which key the first answer came   // the first answer key is the decision (read part + GRACE)
    if(e.atk==='pound')e.y=FL-Math.min(1,e.sT/T)*40;   // it rises up on its toes
    if(e.sT>=T){const ok=e.ans===ANS[e.atk];e.y=FL;
      if(!ok){say(e.ans&&e.ans!=='late'?'WRONG: '+BTN[ANS[e.atk]]:'TOO LATE: '+BTN[ANS[e.atk]],'#ff5a6a',.9,1);SB.flash=.22;}
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
  go(e,'sb_walk');}
function walkTo(e,env,dx,dt,nxt){const want=nxt==='swing'?60:200;if(abs(dx)<=want){e.vx=0;return;}const nx=scr(e,env,e.x+sgn(dx)*WALKV*dt);e.vx=(nx-e.x)/dt;e.x=nx;}
// ---- W300: the duel's words, drawn by purefoot.js inside the street's world transform (camX applied); my / band / K from streetlook.js
// During a telegraph: the answer (PC key / phone button label) big over the boss in the attack's colour, a bar under it that empties at the last moment the answer counts;
// right answer: PARRY! / DODGED! / CLEARED! then OPEN x2 over the boss with a bar for the 1.6 s; wrong / late: a red flash over the street and the right answer in red.
const fsz=(u,n)=>Math.max(14,n)*u;
function txt(c,t,x,y,col,px,u){c.font='900 '+px+'px monospace';c.lineJoin='round';c.lineWidth=Math.max(3,px*.16);c.strokeStyle='rgba(5,3,12,.9)';c.strokeText(t,x,y);c.fillStyle=col;c.fillText(t,x,y);}
SB.draw=function(c,o){const S=F.S,e=SB.on,u=o.u,vw=o.vw,L=IN.L();if(!S)return;const dt=Math.max(0,Math.min(.1,S.time-(SB.t0==null?S.time:SB.t0)));SB.t0=S.time;
  for(const f of SB.fx)f.l-=dt;SB.fx=SB.fx.filter(f=>f.l>0);SB.flash=Math.max(0,SB.flash-dt);
  if(SB.flash>0){c.save();c.globalAlpha=SB.flash/.22*.28;c.fillStyle='#ff1030';c.fillRect(S.camX-40,o.t0-40,vw+80,2000);c.restore();}
  if(!e||e.dead||S.boss!==e){SB.fx.length=0;return;}
  const z=e.z==null?1:e.z,k=o.K*(RET.footmove?.85+.15*z:.9+.1*z),sy=(e.dsc?e.dsc[1]:1),head=o.my(e.y)-(1-z)*o.band-e.h*k*sy*1.02,top=o.t0+(o.hudB||0)+6*u;
  const big=fsz(u,L&&L.touch?30:34),mid=fsz(u,22),touch=!!(L&&L.touch);c.save();c.textAlign='center';c.textBaseline='alphabetic';
  const place=(t,px,y)=>{c.font='900 '+px+'px monospace';const w=c.measureText(t).width;return [Math.max(S.camX+w/2+8*u,Math.min(S.camX+vw-w/2-8*u,e.x)),Math.max(top+px,y),w];};
  let y0=head-8*u;
  if(e.state==='sb_tel'){const a=e.atk,an=ANS[a],t=touch?BTN[an]+'!':BTN[an]+' ['+KEY[an]+']',A=acc(a),left=Math.max(0,A-e.sT),gone=left<=0,col=gone?'#ffffff':COL[a];
    const [x,y,w]=place(t,big,y0-14*u);const pul=gone?1:1+.06*Math.sin(S.time*22);c.save();c.translate(x,y);c.scale(pul,pul);txt(c,t,0,0,col,big,u);c.restore();
    const bw=Math.max(w,120*u),bh=10*u,by=y+8*u;c.fillStyle='rgba(5,3,12,.8)';c.fillRect(x-bw/2-2*u,by-2*u,bw+4*u,bh+4*u);c.fillStyle=col;c.fillRect(x-bw/2,by,bw*left/A,bh);
    if(e.ans&&e.ans!=='late')txt(c,e.ans===an?'✓':'✗',x+w/2+18*u,y,e.ans===an?'#7dff8a':'#ff5a6a',mid,u);y0=y-big-6*u;}
  else if(e.state==='stun'){const left=Math.max(0,e.stun-e.sT),t='OPEN ×2';const [x,y,w]=place(t,big,y0-14*u),bl=.75+.25*Math.sin(S.time*14);
    c.globalAlpha=bl;txt(c,t,x,y,'#7dff8a',big,u);c.globalAlpha=1;const bw=Math.max(w,120*u),bh=10*u,by=y+8*u;c.fillStyle='rgba(5,3,12,.8)';c.fillRect(x-bw/2-2*u,by-2*u,bw+4*u,bh+4*u);c.fillStyle='#7dff8a';c.fillRect(x-bw/2,by,bw*left/PUN,bh);
    const g=SB.fx.length&&SB.fx[SB.fx.length-1].c==='#7dff8a'&&e.sT<.7?SB.fx[SB.fx.length-1].t+' ':'';   // the right answer's word sits on the line under OPEN (above it, it hid OPEN on a short screen)
    txt(c,g+'HIT IT NOW',x,by+bh+fsz(u,18)+4*u,'#e8ffe8',fsz(u,18),u);c.restore();return;}
  for(let i=SB.fx.length-1;i>=0;i--){const f=SB.fx[i],px=f.big?mid:fsz(u,16),[x,y]=place(f.t,px,y0-(1-f.l/f.m)*14*u);c.globalAlpha=Math.min(1,f.l/f.m*3);txt(c,f.t,x,y,f.c,px,u);c.globalAlpha=1;y0=y-px-4*u;}
  c.restore();};
// W300: the old street tips (dodge by stepping, run right, the guard tip) and the touch ghost hand tell other answers: muted while the duel is on
const hO=IN.hintOn,gO=IN.ghost,duel=()=>{const S=F.S;return !!(S&&S.boss&&S.boss._sb&&!S.boss.dead);};
IN.hintOn=function(){return !duel()&&hO.apply(this,arguments);};
IN.ghost=function(){if(duel()){const L=IN.L();if(L&&L.ghost)L.ghost.hidden=true;const S=F.S;if(S.note&&S.note.teach)S.note.t=0;return;}return gO.apply(this,arguments);};
})();

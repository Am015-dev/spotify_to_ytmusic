// PURPOSE: Street fourth foe: the shield guard, a foe whose answer no other street foe asks for (get behind it)
// FLAG: shieldfoe (?shieldfoe=1; off by default)
// TEST: qa/streetsim.js with SHIELDFOE=1 (guard time to kill: a bot that gets behind it vs one that shoots its front)
/* ---------- W171 FOURTH FOE (street bar row E4: >= 4 foe types, each readable by silhouette and asking for its own answer).
   The guard (shield sheet: the only street foe carrying a riot shield) walks slowly at Kai behind a shield that stops EVERY shot and blow from the front
   (white sparks). Its back is bare. It turns slowly (TURN s), so the answer is to step or jump past it and shoot its back while it turns; its shield bash
   (CROUCH telegraph, then a short shove, 1 heart) punishes standing in front of it. After TIRED s on screen it lowers the shield (SHIELD DOWN), so a player
   who never gets behind it still finishes it, only much later.
   Player decision: walk past the guard (into the gunner's line and the rushers) to hit its back now, or keep shooting the others and let it come.
   Measured by streetsim (SHIELDFOE=1): guard time to kill for the bots that get behind it (gfirst, dodge) vs the one that does not (nearest).
   Placement: replaces two rushers in waves 5 and 9 of the street3/streethard plan (same threat weight, 2). ---------- */
if(RET.shieldfoe===undefined)RET.shieldfoe=/[?&]shieldfoe=1/.test(location.search);
(function(){
if(!window.FOOT||!FOOT._in||!FOOT.STAGES||!FOOT.STAGES.zeil||!FOOT.STAGES.zeil.s2)return;
const F=FOOT,IN=F._in,ST=F.STAGES.zeil,FL=470,abs=Math.abs,sgn=v=>v<0?-1:1;
const FE=window.FOOT_ENEMIES=window.FOOT_ENEMIES||{};
const G=F.GD={TURN:1,TIRED:4,SPD:60,REACH:100,CROUCH:.8,BASH:.25,REST:.8,CD:8,WAVES:[4,8],log:null};
const age=(e,env)=>e.seenAt2==null?0:env.G.time-e.seenAt2;
function go(e,s){e.state=s;e.sT=0;}
function walk(e,env,v,dt){const g=env.G,lo=g.camX+e.w/2,hi=g.camX+g.viewW-e.w/2,nx=e.x+v*dt;if(!e.seen||(nx>=lo&&nx<=hi))e.x=nx;e.vx=v;}
F.drawX=F.drawX||{};F.drawX.guard=(c,pose,x,y,h,flip,t,col)=>{IN.drawWho(c,'shield',pose,x,y,h,flip,t,col);};
FE.guard={hp:5,w:34,h:66,score:300,c:'#8aa0c0',touch:0,drops:['heal','w_shot'],dropP:.3,
  pose:e=>e.state==='dead'?'die':e.flash>0&&e.open?'hit':e.state==='wind'?'crouch':e.state==='bash'?'melee':abs(e.vx)>5?(Math.floor(e.t*5)%2?'run-a':'run-b'):'idle',
  onHit(e,d,env,hit){if(e.state==='dead'||e.open)return;const front=!hit||hit.x==null||sgn(hit.x-e.x)===e.facing;if(!front)return;
    e.hp+=d;e.flash=0;IN.ftBurst&&IN.ftBurst(e.x+e.facing*e.w*.5,e.y-e.h*.55,'#ffffff',4,200);if(G.log)G.log.blocked++;   // the shield stops it: white sparks, no damage
    if(G.log&&!G.log.toldB){G.log.toldB=1;IN.pop(e.x,e.y-e.h-26,'BLOCKED: GET BEHIND IT','#ffffff');}},
  ai(e,dt,env){const P=env.P,dx=P.x-e.x;
    if(!e._i){e._i=1;e.sT=0;e.state='walk';e.y=FL;e.facing=sgn(dx);e.cd=1.2;}
    e.sT+=dt;e.y=FL;if(e.state==='dead'){e.vx=0;e.tele=0;if(e.sT>.5)e.remove=true;return;}
    if(!e.open&&e.seen&&age(e,env)>G.TIRED){e.open=1;IN.pop(e.x,e.y-e.h-26,'SHIELD DOWN','#ffd23a');}   // a player who never gets behind it still finishes it
    e.cd-=dt;
    if(e.state==='wind'){e.vx=0;e.tele=G.CROUCH-e.sT;if(e.sT>=G.CROUCH){e.tele=0;go(e,'bash');}return;}
    if(e.state==='bash'){walk(e,env,e.facing*300,dt);const r={x:e.x+(e.facing>0?0:-50),y:e.y-e.h,w:50,h:e.h};env.melee(e,r,1);if(e.sT>=G.BASH){go(e,'rest');e.cd=G.CD;}return;}
    if(e.state==='rest'){e.vx=0;if(e.sT>=G.REST)go(e,'walk');return;}
    if(sgn(dx)!==e.facing&&abs(dx)>8){e.vx=0;e.tn=(e.tn||0)+dt;if(e.tn>=G.TURN){e.facing=sgn(dx);e.tn=0;}return;}   // a slow turn: the window to hit its back
    e.tn=0;
    if(abs(dx)<G.REACH&&abs(P.y-e.y)<120&&e.cd<=0&&e.grace<=0&&e.seen){go(e,'wind');return;}
    walk(e,env,abs(dx)>G.REACH*.8?e.facing*G.SPD:0,dt);},
  onDeath(e){e.state='dead';e.sT=0;e.tele=0;if(G.log&&e.seenAt2!=null)G.log.ttk.push(+(F.S.time-e.seenAt2).toFixed(2));
    const L=this.drops||[];e.dropList=L.length&&Math.random()<(this.dropP||0)?[L[Math.floor(Math.random()*L.length)]]:[];}};
if(F.S3&&F.S3.TH)F.S3.TH.guard=2;
/* placement: two rushers of waves 5 and 9 become one guard (flag on only) */
const st0=ST.hook.step;
ST.hook.step=function(S,dt,env){const r=st0.apply(this,arguments);
  if(RET.shieldfoe&&S.s3&&!S.gd){S.gd=G.log={ttk:[],blocked:0,placed:0};
    for(const i of G.WAVES){const w=S.s3.waves[i];if(!w||w.spawned)continue;let n=0;const keep=[];for(const u of w.left){if(u==='rusher'&&n<2){n++;continue;}keep.push(u);}
      if(n){keep.unshift('guard');w.left=keep;w.units=keep.slice();G.log.placed++;}}}
  return r;};
})();
/* ---------- W185 THREE MORE FOES (flag morefoes, ?morefoes=1; off by default). Sheets already in the game: ninja (block/dash/slash/die), hound (run/pounce/bite/die),
   flamer (walk/spray/hit/die). One rule for all three, a new tell and a new answer each: MAKE IT MISS, THEN HIT IT. A foe whose attack misses is OPEN for a moment
   (yellow "OPEN"); one whose attack lands recovers at once.
   - ninja: blocks every frontal shot (the knife goes through). Winds up 0.5 s, then dashes through Kai in his depth line. Answer: step out of the line (bait the dash)
     or knife it. A missed dash leaves it OPEN 1.5 s.
   - hound: runs fast along the back of the band (nothing hits it), crouches 0.6 s, pounces at Kai's depth. Answer: jump. A missed pounce sprawls it OPEN 2.2 s.
   - flamer: armoured (80% of every hit stopped until it tires), walks slowly, winds up 0.6 s, sprays fire along its line for 1.5 s (the area stays burning). Answer: change depth.
     A spray that burns nobody leaves it venting, OPEN 2 s, taking triple damage.
   After TIRED s on screen (ninja 7 s, hound 6 s) each one drops its trick, so a player who never answers still finishes it, only later.
   Player decision: hold your ground and shoot, or answer the tell (step / jump / knife) and punish the open window.
   Measured by streetsim (Q=&morefoes=1): time to kill per new foe for the dodge bot (answers tells) vs gfirst (does not). ---------- */
if(RET.morefoes===undefined)RET.morefoes=/[?&]morefoes=1/.test(location.search);
(function(){
if(!window.FOOT||!FOOT._in||!FOOT.STAGES||!FOOT.STAGES.zeil||!FOOT.STAGES.zeil.s2)return;
const F=FOOT,IN=F._in,ST=F.STAGES.zeil,FL=470,abs=Math.abs,sgn=v=>v<0?-1:1,clamp=(v,a,b)=>v<a?a:v>b?b:v;
const FE=window.FOOT_ENEMIES=window.FOOT_ENEMIES||{};
const M=F.MF={TIRED:10,
  NJ:{SPD:80,KEEP:170,CLOSE:110,WIND:.5,DASH:.4,DV:720,OPEN:1.5,REC:.45,CD:2.2,CDHIT:4,TIRED:7},
  HD:{SPD:300,BACK:.05,NEAR:210,CROUCH:.6,POUNCE:.55,OVER:130,OPEN:2.2,BITE:.3,CD:1.6,CDHIT:4,TIRED:6},
  FM:{SPD:60,KEEP:150,WIND:.6,SPRAY:1.5,LEN:230,OPEN:2,CD:2.4,CDHIT:4},
  WAVES:{3:['shound'],5:['sninja'],6:['sflamer'],7:['shound'],9:['sninja'],10:['sflamer'],11:['shound']},log:null};
const age=(e,env)=>e.seenAt2==null?0:env.G.time-e.seenAt2,tired=(e,env,T)=>e.seen&&age(e,env)>(T||M.TIRED);
function go(e,s){e.state=s;e.sT=0;}
function walk(e,env,v,dt){const g=env.G,lo=g.camX+e.w/2,hi=g.camX+g.viewW-e.w/2,nx=e.x+v*dt;if(!e.seen||(nx>=lo&&nx<=hi))e.x=nx;e.vx=v;}
const touch=(e,r,P)=>{const h=P.crouch?40:P.h;return r.x<P.x+14&&r.x+r.w>P.x-14&&r.y<P.y&&r.y+r.h>P.y-h&&(P.z==null||e.z==null||abs(e.z-P.z)<=.15);};   // the attack reached Kai (even through his blink after a hit): no OPEN window
const strike=(e,env,r)=>{const hit=env.melee(e,r,1);return hit||touch(e,r,env.P);};
let told=0;
function open(e,s,t){go(e,s);e.openT=t;if(M.log)M.log.open[e.id]=(M.log.open[e.id]||0)+1;
  IN.pop(e.x,e.y-e.h-26,told?'OPEN':'MISSED: HIT IT NOW','#ffd23a');told=1;}
function blocked(e,why){e.flash=0;IN.ftBurst&&IN.ftBurst(e.x+e.facing*e.w*.5,e.y-e.h*.55,'#ffffff',4,200);if(M.log)M.log.blocked++;
  if(!e.def._told){e.def._told=1;IN.pop(e.x,e.y-e.h-26,why,'#ffffff');}}
function base(e,env,dt,st0){if(!e._i){e._i=1;e.sT=0;e.state=st0;e.y=FL;e.facing=sgn(env.P.x-e.x);e.cd=1.2;}
  e.sT+=dt;if(e.state==='dead'){e.vx=0;e.tele=0;e.y=FL;if(e.sT>.5)e.remove=true;return false;}e.cd-=dt;return true;}
function death(e){e.state='dead';e.sT=0;e.tele=0;e.y=FL;if(M.log&&e.seenAt2!=null)(M.log.ttk[e.id]=M.log.ttk[e.id]||[]).push(+(F.S.time-e.seenAt2).toFixed(2));
  const L=this.drops||[];e.dropList=L.length&&Math.random()<(this.dropP||0)?[L[Math.floor(Math.random()*L.length)]]:[];}
F.drawX=F.drawX||{};
F.drawX.sninja=(c,pose,x,y,h,flip,t,col)=>{IN.drawWho(c,'ninja',pose,x,y,h,flip,t,col);};
F.drawX.shound=(c,pose,x,y,h,flip,t,col)=>{IN.drawWho(c,'hound',pose,x,y,h,flip,t,col);};
F.drawX.sflamer=(c,pose,x,y,h,flip,t,col)=>{const e=typeof ART!=='undefined'&&ART.fE;
  if(e&&e.state==='spray'){const d=flip?-1:1,L=M.FM.LEN*Math.min(1,e.sT/.15),y0=y-h*.55,g=c.createLinearGradient(x,y0,x+d*L,y0);   // the fire along its line: a tongue from the nozzle to the end of the burning area
    g.addColorStop(0,'rgba(255,240,160,.95)');g.addColorStop(.4,'rgba(255,140,30,.85)');g.addColorStop(1,'rgba(255,40,0,0)');c.save();c.fillStyle=g;c.beginPath();
    const fl=4*Math.sin(t*40);c.moveTo(x+d*h*.2,y0-6);c.quadraticCurveTo(x+d*L*.6,y0-h*.32+fl,x+d*L,y0-h*.1);c.lineTo(x+d*L,y+2);c.quadraticCurveTo(x+d*L*.5,y0+h*.3-fl,x+d*h*.2,y0+6);c.closePath();c.fill();c.restore();}
  IN.drawWho(c,'flamer',pose,x,y,h,flip,t,col);};
/* ninja */
FE.sninja={hp:4,w:34,h:76,score:320,c:'#7a5ad0',touch:0,drops:['heal','bomb'],dropP:.3,
  pose:e=>e.state==='dead'?'die':e.state==='dash'||e.state==='wind'?'dash':e.state==='open'||e.state==='rec'?'slash':'block',
  onHit(e,d,env,hit){if(e.state==='dead'||e.state==='open'||e.tired)return;if(e.state==='dash'){e.hp+=d;e.flash=0;return;}   // a blur mid-dash: nothing lands
    if(hit&&hit.melee)return;const front=!hit||hit.x==null||sgn(hit.x-e.x)===e.facing;if(!front)return;
    e.hp+=d;blocked(e,'BLOCKED: KNIFE IT OR DODGE ITS DASH');},
  ai(e,dt,env){if(!base(e,env,dt,'walk'))return;const P=env.P,dx=P.x-e.x,N=M.NJ;e.y=FL;e.tired=tired(e,env,N.TIRED);
    if(e.state==='wind'){e.vx=0;e.tele=N.WIND-e.sT;e.z+=clamp(e.dz-e.z,-2.5*dt,2.5*dt);if(e.sT>=N.WIND){e.tele=0;e.z=e.dz;e.hitK=0;go(e,'dash');}return;}   // the depth dash: it steps into the line Kai stood in when it crouched
    if(e.state==='dash'){e.z=e.dz;walk(e,env,e.facing*N.DV,dt);if(strike(e,env,{x:e.x-e.w/2,y:e.y-e.h,w:e.w,h:e.h}))e.hitK=1;
      if(e.sT>=N.DASH){if(e.hitK){go(e,'rec');e.facing=sgn(P.x-e.x);}else open(e,'open',N.OPEN);e.cd=e.hitK?N.CDHIT:N.CD;}return;}   // a dash that lands turns straight back to Kai, guard up
    if(e.state==='open'){e.vx=0;if(e.sT>=e.openT){go(e,'walk');e.facing=sgn(dx);}return;}
    if(e.state==='rec'){e.vx=0;if(e.sT>=N.REC){go(e,'walk');e.facing=sgn(dx);}return;}
    e.facing=sgn(dx);
    if(abs(dx)<N.KEEP+90&&(e.cd<=0||abs(dx)<N.CLOSE)&&e.grace<=0&&e.seen&&!e.tired){go(e,'wind');e.dz=P.z==null?e.z:P.z;return;}
    walk(e,env,abs(dx)>N.KEEP?e.facing*N.SPD:abs(dx)<N.KEEP-60?-e.facing*N.SPD*1.4:0,dt);},
  onDeath:death};
/* hound */
FE.shound={hp:2,w:52,h:38,score:180,c:'#c08040',touch:0,drops:['heal'],dropP:.15,
  pose:e=>e.state==='dead'?'die':e.state==='pounce'?'pounce':e.state==='set'||e.state==='bite'?'bite':e.state==='open'?'pounce':'run',
  canHit:e=>e.state==='open'||e.tired,   // only a sprawled hound can be hit (or one tired out); shots fly past it to the foes behind
  ai(e,dt,env){if(!base(e,env,dt,'run'))return;const P=env.P,dx=P.x-e.x,H=M.HD;e.tired=tired(e,env,H.TIRED);
    if(e.state==='set'){e.vx=0;e.y=FL;e.z=H.BACK;e.tele=H.CROUCH-e.sT;if(!e.def._told){e.def._told=1;IN.pop(e.x,e.y-e.h-26,'TOO FAST TO HIT: JUMP ITS POUNCE','#ffffff');}if(e.sT>=H.CROUCH){e.tele=0;e.hitK=0;e.px=e.x;e.tx=P.x;e.pz=P.z==null?.5:P.z;go(e,'pounce');}return;}
    if(e.state==='pounce'){const u=Math.min(1,e.sT/H.POUNCE);e.x=e.px+(e.tx+e.facing*H.OVER-e.px)*u;e.z=H.BACK+(e.pz-H.BACK)*u;e.y=FL-Math.sin(u*Math.PI)*12;e.vx=e.facing*400;   // a low lunge skimming the road across the band and past Kai: it bites at the ankles, so any jump clears it
      if(u>.15&&u<.9&&strike(e,env,{x:e.x-e.w/2,y:FL-30,w:e.w,h:30}))e.hitK=1;
      if(u>=1){e.y=FL;if(e.hitK)go(e,'bite');else open(e,'open',H.OPEN);e.cd=e.hitK?H.CDHIT:H.CD;}return;}
    e.y=FL;
    if(e.state==='open'||e.state==='bite'){e.vx=0;if(e.sT>=(e.state==='open'?e.openT:H.BITE))go(e,'run');return;}
    e.facing=sgn(dx);e.z+=clamp(H.BACK-e.z,-1.5*dt,1.5*dt);
    if(abs(dx)<H.NEAR&&abs(dx)>H.NEAR-90&&e.cd<=0&&e.grace<=0&&e.seen&&!e.tired&&abs(e.z-H.BACK)<.05){go(e,'set');return;}
    const want=abs(dx)>H.NEAR?e.facing:abs(dx)<H.NEAR-90?-e.facing:0;walk(e,env,want*H.SPD*(e.tired?.6:1),dt);},
  onDeath:death};
/* flamer */
FE.sflamer={hp:5,w:44,h:80,score:280,c:'#e05020',touch:0,drops:['heal','w_shot'],dropP:.3,
  pose:e=>e.state==='dead'?'die':e.state==='spray'||e.state==='wind'?'spray':e.state==='open'||e.flash>0?'hit':'walk',
  onHit(e,d){if(e.state==='dead')return;if(e.state==='open'){e.hp-=2*d;return;}if(e.tired)return;e.hp+=d*.8;blocked(e,'ARMOURED: DODGE ITS FIRE, THEN HIT IT');},   // venting: triple damage; otherwise the armour takes 80%
  ai(e,dt,env){if(!base(e,env,dt,'walk'))return;const P=env.P,dx=P.x-e.x,R=M.FM;e.y=FL;e.tired=tired(e,env);
    if(e.state==='wind'){e.vx=0;e.tele=R.WIND-e.sT;e.z=e.fz;if(e.sT>=R.WIND){e.tele=0;e.hitK=0;go(e,'spray');}return;}
    if(e.state==='spray'){e.vx=0;e.z=e.fz;const L=R.LEN*Math.min(1,e.sT/.15),r={x:e.facing>0?e.x:e.x-L,y:FL-70,w:L,h:70};if(strike(e,env,r))e.hitK=1;
      if(e.sT>=R.SPRAY){if(e.hitK||e.tired)go(e,'walk');else open(e,'open',R.OPEN);e.cd=e.hitK?R.CDHIT:R.CD;}return;}
    if(e.state==='open'){e.vx=0;if(e.sT>=e.openT)go(e,'walk');return;}
    e.facing=sgn(dx);
    const pz=P.z==null?e.z:P.z;if(abs(dx)<R.KEEP+110)e.z+=clamp(pz-e.z,-.6*dt,.6*dt);   // close in, it steps into Kai's line
    if(abs(dx)<R.LEN-40&&abs(pz-e.z)<.08&&e.cd<=0&&e.grace<=0&&e.seen&&!e.tired){go(e,'wind');e.fz=e.z;return;}
    walk(e,env,abs(dx)>R.KEEP?e.facing*R.SPD:abs(dx)<R.KEEP-50?-e.facing*R.SPD:0,dt);},
  onDeath:death};
if(F.S3&&F.S3.TH)Object.assign(F.S3.TH,{sninja:4,shound:3,sflamer:4});
/* placement: in the street3 waves (flag on only) each new foe takes the place of rushers of the same threat weight (they live longer and stall a careless player: hound 3, ninja 4, flamer 4; a wave short of rushers gives what it has); at most 2 new types a wave */
const W={sninja:4,shound:3,sflamer:4},st0=ST.hook.step;
ST.hook.step=function(S,dt,env){const r=st0.apply(this,arguments);
  if(RET.morefoes&&S.s3&&!S.mf){S.mf=M.log={ttk:{},open:{},blocked:0,placed:[]};
    for(const k in M.WAVES){const w=S.s3.waves[+k];if(!w||w.spawned)continue;const add=[];let need=0;for(const id of M.WAVES[k]){need+=W[id];add.push(id);}
      const keep=[];for(const u of w.left){if(u==='rusher'&&need>0){need--;continue;}keep.push(u);}
      keep.splice(1,0,...add);w.left=keep;w.units=keep.slice();M.log.placed.push(+k);}}
  return r;};
})();

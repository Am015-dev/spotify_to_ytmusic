/* ---------- FOOTSTAGE: the finished on-foot stage (flag RET.footstage, default ON; ?footstage=0 = the street1 mock exactly: nothing here runs). Test: nightrun/footstage-test.js.
   Owner, 21 Oct 2026: "include ... on-foot enemies for on-foot stages (same as the fly stages difficulty will increase gradually); one on foot stage for start, there is already a mock."
   Stage 'zeil' (FOOT.main, the MENU button opens it): 7 sections + the boss arena, a checkpoint at the start of every section, a progress bar on the road strip.
   Roster in order: grunt, gunman | shield, knife, drone | sniper, turret, bruiser | mech | JETPACK, HOUND | FLAMER, NINJA | MEDIC | WARDEN (with a relay gate).
   Ramp (mirrors the fly-stage knobs): count (enemies per section 10 -> 26), aggression (enemy clock x1.00 -> x1.12, AGG), mix (distinct kinds per lock 2 -> 8).
   New enemies (ext defs on window.FOOT_ENEMIES, contract FOOT-ENEMIES.md; they move themselves, no contact damage, never attack before they are on screen):
     jetpack  aerial strafer: hovers, 0.7 s lane telegraph (dashed line), strafes the lane dropping shots. Aim up; step out of the lane or dash under it.
     hound    fast charger: 0.6 s crouch (red box), pounces at you. Jump or dash through it; a miss leaves it OPEN (x1.6) for 1.3 s.
     flamer   area denial: 0.6 s pilot light, sprays 180 px in front, leaves a burning floor patch. Shoot it from range; its back tank takes x2.
     ninja    blink-dash: marks a spot behind you (0.55 s), blinks there, 0.4 s windup, slash. KNIFE in the windup = PARRY (stun, x2). Its guard deflects front bullets.
     medic    heals the most hurt foe in reach (1 s green beam, +40%); damage cancels the heal. Kill it first.
     relay    the Warden's gate pylons: while any relay stands the Warden takes nothing (GATE); both down = WARDEN OPEN 5 s (x1.5, no rate cap). Again at each phase.
   Fairness: fixed heart before every lock and ammo after every checkpoint, last-heart mercy (one heart drops once per section, Easy/Normal), hit mercy (a hit clears enemy
   bullets within 170 px), Assist slows the enemy clock x0.9. Nothing here touches armour.js, hard.js or the fly stages.
   Art: shape placeholders (F.drawX); when parts/art.js has ART.anim / ART.drawAnim and RET.sprites is on, the sheets anim/<who>/<act> are drawn instead (SPR map below). ---------- */
if(RET.footstage===undefined)RET.footstage=!/[?&]footstage=0/.test(location.search);
(function(){
if(!RET.foot||!RET.footstage||!window.FOOT)return;
const F=window.FOOT,VH=540,FL=VH-70,GRAV=1900,abs=Math.abs,sgn=v=>v<0?-1:1,clamp=(v,a,b)=>v<a?a:v>b?b:v;
const FE=window.FOOT_ENEMIES=window.FOOT_ENEMIES||{},FBS=window.FOOT_BOSS=window.FOOT_BOSS||{};
F.PICKUPS.ammo={n:'AMMO',c:'#ffe08a',ic:'▮'};
const fr=env=>(env.D&&env.D.fr)||1;
const onScr=(e,env)=>e.seen&&e.grace<=0;
const fsPop=(env,x,y,t,c)=>{try{F.S.pop.push({x,y,t,c:c||'#fff',l:1,m:1,big:false});}catch(x_){}};
/* small state machine wrapper: e.sT = time in state; dead = fall, fade 0.5 s, then remove */
function fsWrap(def,fn){def.touch=0;
  def.ai=function(e,dt,env){if(!e._i){e._i=1;e.sT=0;e.state=def.start||'walk';e.cd=.8;e.facing=sgn(env.P.x-e.x);if(!def.flyer&&!def.fixed)e.y=FL;}
    e.sT+=dt;if(e.cd>0)e.cd-=dt;
    if(e.state==='dead'){e.vx=0;e.wind=0;if(def.flyer){e.vy=(e.vy||0)+GRAV*.5*dt;e.y=Math.min(FL-e.h/2,e.y+e.vy*dt);}if(e.sT>=.5)e.remove=true;return;}
    fn(e,dt,env);};
  def.onDeath=function(e,env){e.state='dead';e.sT=0;e.dead=true;e.tele=0;e.wind=0;e.beam=null;e.lane=null;e.mark=null;e.patch=null;
    const L=(def.drops||[]).filter(k=>F.PICKUPS[k]);e.dropList=L.length&&Math.random()<(def.dropP||0)?[L[Math.floor(Math.random()*L.length)]]:[];};
  return def;}
function go(e,s){e.state=s;e.sT=0;}
function stepX(e,env,dx,dt){const G=env.G,lo=G.camX+e.w/2,hi=G.camX+G.viewW-e.w/2,nx=e.x+dx*dt;if((nx>=lo&&nx<=hi)||abs(nx-(lo+hi)/2)<abs(e.x-(lo+hi)/2))e.x=nx;e.vx=dx;}   // never walks off screen (or further off it)
function frontBack(e,hit,env){const hx=hit&&hit.x!=null?hit.x:env.P.x;return (hx-e.x)*e.facing>=0?'front':'back';}

/* ---------- JETPACK ---------- */
FE.jetpack=fsWrap({w:44,h:58,hp:4,score:260,flyer:true,start:'in',drops:['ammo','heal','w_rocket'],dropP:.35},function(e,dt,env){
  const P=env.P,G=env.G,dx=P.x-e.x;if(e.jy==null){e.jy=FL-250+env.rnd(-20,20);e.side=Math.random()<.5?-1:1;}
  const tx=clamp(P.x+e.side*230,G.camX+50,G.camX+G.viewW-50);
  if(e.state==='in'||e.state==='hover'){e.facing=sgn(dx);stepX(e,env,clamp((tx-e.x)*2,-170,170),dt);e.y+=((e.jy+Math.sin(e.sT*2.4)*14)-e.y)*Math.min(1,dt*3);
    if(e.state==='in'){if(e.seen&&e.sT>.6)go(e,'hover');return;}
    if(onScr(e,env)&&e.sT>2.2/fr(env)&&abs(dx)<G.viewW*.8){const d=sgn(dx);e.lane={y:FL-150,x0:e.x,dir:d,x1:clamp(P.x+d*260,G.camX+30,G.camX+G.viewW-30)};e.tele=.7;go(e,'tele');}}
  else if(e.state==='tele'){e.vx=0;e.y+=(e.lane.y-e.y)*Math.min(1,dt*5);if(e.sT>=.7){go(e,'strafe');e.sh=0;}}
  else if(e.state==='strafe'){const L=e.lane;e.facing=L.dir;stepX(e,env,L.dir*430,dt);e.y=L.y;
    if(e.sT-e.sh*.2>=.2){e.sh++;env.shoot(e,L.dir>0?Math.PI*.62:Math.PI*.38,300,1,{ox:e.x,oy:e.y+e.h*.3});}
    if((e.x-L.x1)*L.dir>=0||e.sT>1.6){e.lane=null;e.side=-e.side;go(e,'climb');}}
  else if(e.state==='climb'){e.vx=0;e.y+=(e.jy-e.y)*Math.min(1,dt*3);if(e.sT>=.8)go(e,'hover');}});
FE.jetpack.pose=e=>e.state==='dead'?'die':e.state==='strafe'?'fly':e.state==='tele'?'shoot':'hover';

/* ---------- HOUND ---------- */
FE.hound=fsWrap({w:58,h:40,hp:3,score:180,start:'run',drops:['heal','ammo','speed'],dropP:.25},function(e,dt,env){
  const P=env.P,dx=P.x-e.x,ad=abs(dx);
  if(e.state==='run'){e.facing=sgn(dx);const want=270;if(ad>want+30)stepX(e,env,e.facing*260,dt);else if(ad<want-90)stepX(e,env,-e.facing*150,dt);else e.vx=0;
    if(onScr(e,env)&&e.cd<=0&&ad<360&&P.y>FL-140){e.wind=.6;e.vx=0;go(e,'crouch');}}
  else if(e.state==='crouch'){e.vx=0;e.wind=Math.max(0,.6-e.sT);e.facing=sgn(dx);if(e.sT>=.6){e.wind=0;e.pvx=e.facing*clamp(ad/.55,300,700);e.pvy=-520;e.hitP=false;go(e,'pounce');}}
  else if(e.state==='pounce'){e.pvy+=GRAV*dt;stepX(e,env,e.pvx,dt);e.y+=e.pvy*dt;
    if(!e.hitP&&env.melee(e,{x:e.x-e.w/2,y:e.y-e.h,w:e.w,h:e.h},1))e.hitP=true;
    if(e.y>=FL&&e.pvy>0){e.y=FL;e.vx=0;go(e,e.hitP?'back':'open');if(!e.hitP)fsPop(env,e.x,e.y-e.h-12,'OPEN','#7dff8a');}}
  else if(e.state==='open'){e.vx=0;if(e.sT>=1.3){e.cd=1.2/fr(env);go(e,'run');}}
  else if(e.state==='back'){stepX(e,env,-e.facing*220,dt);if(e.sT>=.6){e.cd=1.4/fr(env);go(e,'run');}}});
FE.hound.onHit=(e,d)=>{if(e.state==='open')e.hp-=d*.6;};
FE.hound.pose=e=>e.state==='dead'?'die':e.state==='pounce'?'pounce':e.state==='crouch'?'bite':e.state==='open'?'hit':'run';

/* ---------- FLAMER ---------- */
FE.flamer=fsWrap({w:48,h:86,hp:5,score:280,start:'walk',drops:['heal','w_flame','ammo'],dropP:.4},function(e,dt,env){
  const P=env.P,dx=P.x-e.x,ad=abs(dx);
  if(e.patch){e.patch.t-=dt;if(e.patch.t<=0)e.patch=null;else{const p=e.patch;env.melee(e,{x:p.x0,y:FL-14,w:p.x1-p.x0,h:14},1);}}
  if(e.state==='walk'){e.facing=sgn(dx);if(ad>170)stepX(e,env,e.facing*60,dt);else e.vx=0;
    if(onScr(e,env)&&e.cd<=0&&ad<195){e.tele=.6;go(e,'ignite');}}
  else if(e.state==='ignite'){e.vx=0;if(e.sT>=.6)go(e,'spray');}
  else if(e.state==='spray'){e.vx=0;const x0=e.facing>0?e.x+10:e.x-200;e.fl={x:x0,w:190};env.melee(e,{x:x0,y:FL-80,w:190,h:72},1);
    if(e.sT>=1.3){e.fl=null;e.patch={x0,x1:x0+190,t:2};e.cd=2.4/fr(env);go(e,'walk');}}});
FE.flamer.onHit=(e,d,env,hit)=>{if(frontBack(e,hit,env)==='back'){e.hp-=d;if(!e._tk||env.G.time-e._tk>.6){e._tk=env.G.time;fsPop(env,e.x,e.y-e.h-10,'TANK x2','#ffb020');}}};
FE.flamer.pose=e=>e.state==='dead'?'die':e.state==='spray'?'spray':e.flash>0?'hit':'walk';

/* ---------- NINJA ---------- */
FE.ninja=fsWrap({w:34,h:76,hp:4,score:320,start:'guard',drops:['heal','dbl','ammo'],dropP:.35},function(e,dt,env){
  const P=env.P,G=env.G,dx=P.x-e.x,ad=abs(dx);
  if(e.state==='guard'){e.facing=sgn(dx);if(ad<230)stepX(e,env,-e.facing*140,dt);else if(ad>380)stepX(e,env,e.facing*140,dt);else e.vx=0;
    if(onScr(e,env)&&e.sT>(e.gT||(e.gT=1.4+Math.random()*.8))/fr(env)){const bx=clamp(P.x-P.facing*72,G.camX+30,G.camX+G.viewW-30);e.mark={x:bx==P.x?P.x+72:bx};go(e,'mark');}}
  else if(e.state==='mark'){e.vx=0;if(e.sT>=.55){e.x=e.mark.x;e.mark=null;e.facing=sgn(P.x-e.x);e.wind=.4;go(e,'wind');}}
  else if(e.state==='wind'){e.vx=0;e.wind=Math.max(0,.4-e.sT);if(e.sT>=.4){e.wind=0;const r={x:e.facing>0?e.x:e.x-84,y:e.y-e.h,w:84,h:e.h};env.melee(e,r,1);go(e,'recover');}}
  else if(e.state==='recover'){e.vx=0;if(e.sT>=.8){go(e,'retreat');}}
  else if(e.state==='retreat'){e.facing=sgn(dx);stepX(e,env,-e.facing*480,dt);if(ad>300||e.sT>.6){e.gT=0;go(e,'guard');}}
  else if(e.state==='stun'){e.vx=0;e.wind=0;if(e.sT>=1.6){e.gT=0;go(e,'retreat');}}});
FE.ninja.onHit=(e,d,env,hit)=>{const melee=!!(hit&&hit.melee);
  if(e.state==='wind'&&melee){go(e,'stun');e.wind=0;fsPop(env,e.x,e.y-e.h-12,'PARRY','#7df9ff');try{NR.emit('footParry',{});}catch(x){}return;}
  if(e.state==='stun'){e.hp-=d;return;}
  if((e.state==='guard'||e.state==='mark')&&!melee&&frontBack(e,hit,env)==='front'){e.hp+=d*.8;if(!e._df||env.G.time-e._df>.5){e._df=env.G.time;fsPop(env,e.x,e.y-e.h-10,'DEFLECT','#c9c3e6');}}};
FE.ninja.pose=e=>e.state==='dead'?'die':e.state==='wind'||e.state==='recover'?'slash':e.state==='retreat'||e.state==='mark'?'dash':e.state==='stun'?'hit':'block';

/* ---------- MEDIC ---------- */
FE.medic=fsWrap({w:40,h:80,hp:3,score:300,start:'walk',drops:['heal','heal','ammo','shield'],dropP:.6},function(e,dt,env){
  const P=env.P,dx=P.x-e.x,ad=abs(dx),S=F.S;
  if(e.state==='walk'){e.facing=sgn(dx);if(ad<240)stepX(e,env,-e.facing*110,dt);else if(ad>470)stepX(e,env,e.facing*80,dt);else e.vx=0;
    if(onScr(e,env)&&e.cd<=0){let best=null,bf=.95;for(const o of S.E){if(o===e||o.dead||o.boss||o.id==='medic'||o.id==='relay'||abs(o.x-e.x)>420)continue;const f=o.hp/(o.max||o.hp);if(f<bf){bf=f;best=o;}}
      if(best){e.beam=best;e.hp0=e.hp;go(e,'heal');}else e.cd=.5;}}
  else if(e.state==='heal'){e.vx=0;const t=e.beam;if(!t||t.dead||e.hp<e.hp0-.001){e.beam=null;e.cd=1.2;go(e,'walk');return;}
    if(e.sT>=1){t.hp=Math.min(t.max||t.hp,t.hp+(t.max||t.hp)*.4);fsPop(env,t.x,t.y-(t.h||60)-14,'+HEAL','#7dff8a');e.beam=null;e.cd=2.6/fr(env);go(e,'walk');}}});
FE.medic.pose=e=>e.state==='dead'?'die':e.state==='heal'?'heal':'walk';

/* ---------- RELAY (the Warden's gate) ---------- */
FE.relay=fsWrap({w:34,h:110,hp:4,score:150,fixed:true,start:'idle',drops:['heal','ammo'],dropP:.5},function(e,dt,env){
  e.vx=0;e.facing=sgn(env.P.x-e.x);if(onScr(e,env)&&e.cd<=0&&!e.tele){e.tele=.6;e.cd=2.8/fr(env);e.fire=.6;}
  if(e.fire>0){e.fire-=dt;if(e.fire<=0){const a=Math.atan2(env.P.y-40-(e.y-e.h+14),env.P.x-e.x);env.shoot(e,a,220,1,{ox:e.x,oy:e.y-e.h+14,w:14});}}});
FE.relay.pose=e=>e.state==='dead'?'die':'idle';

/* ---------- WARDEN with a relay gate (wraps footen.js's Warden; FOOT_BOSS.warden itself is untouched) ---------- */
const WA=FBS.warden;
if(WA){FBS.warden2=Object.assign({},WA,{touch:0,
  ai(e,dt,env){const S=F.S;if(e.state!=='dead'&&e.phase&&e.gPh!==e.phase&&!e.pend){e.gPh=e.phase;const G=env.G;e.relays=[];
      for(const x of [G.camX+44,G.camX+G.viewW-44]){const r=env.spawn('relay',x,FL);if(r){r.y=FL;r.seen=1;e.relays.push(r);}}
      if(e.relays.length){e.gate=true;if(S)S.note={t:2.4,txt:'GATE UP · shoot both relays'};}}
    if(e.gate&&e.relays.every(r=>r.dead||r.remove)){e.gate=false;e.openT=5;if(S)S.note={t:2.2,txt:'GATE DOWN · WARDEN OPEN'};try{NR.emit('footGate',{phase:e.phase});}catch(x){}}
    if(e.openT>0)e.openT-=dt;
    WA.ai(e,dt,env);if(e.openT>0&&!e.label)e.label='OPEN';},
  onHit(e,d,env,hit){if(e.dead||e.state==='dead')return;
    if(e.gate){e.hp+=d;if(!e._gc||env.G.time-e._gc>.4){e._gc=env.G.time;fsPop(env,e.x,e.y-e.h-10,'GATE','#7df9ff');}return;}
    if(e.openT>0&&!(e.wall&&e.wall.up)){e.hp-=d*.5;return;}
    WA.onHit(e,d,env,hit);},
  onDeath(e,env){for(const r of e.relays||[])if(!r.dead){r.hp=0;r.dead=true;r.remove=true;}WA.onDeath(e,env);}});}

/* ---------- the stage ---------- */
const SEC=[{n:'STREET LEVEL',x:0},{n:'RIOT LINE',x:2000},{n:'ROOFTOP WATCH',x:4000},{n:'HEAVY METAL',x:6000},{n:'SKY AND TEETH',x:7800},{n:'HEAT AND BLADES',x:9800},{n:'FIELD HOSPITAL',x:11800},{n:'THE WARDEN',x:13600}];
const AGG=[1,1,1.04,1.07,1.1,1.13,1.16,1];
const INTRO={jetpack:'JETPACK · aim up, leave the lane',hound:'HOUND · jump the pounce, then punish',flamer:'FLAMER · keep range, hit the tank',
  ninja:'NINJA · KNIFE in its windup = PARRY',medic:'MEDIC · it heals the gang: kill it first',mech:'MECH · bomb it, keep moving',bruiser:'BRUISER · jump the charge',sniper:'SNIPER · move when the laser locks'};
const w=(x,enemy,count,gap,o)=>Object.assign({x,enemy,count,gap},o||{}),k=(lock,enemy,count,gap,delay,o)=>Object.assign({lock,enemy,count,gap,delay},o||{});
const ST={n:'ZEIL UNDERPASS',len:14600,song:'stage2',cp:2000,cps:SEC.slice(1).map(s=>s.x),fs:1,
  plats:[[1250,380,170],[3200,360,210],[4700,372,180],[5300,330,150],[6900,380,200],[8500,370,190],[10300,378,180],[11000,340,160],[12500,372,210]],
  props:[[600,'crate'],[1450,'sign'],[2600,'crate'],[3400,'vend'],[4500,'sign'],[5200,'crate'],[6400,'door'],[7200,'sign'],[8300,'crate'],[9100,'vend'],[10500,'door'],[11200,'sign'],[12300,'crate'],[12900,'vend']],
  pk:[[1450,'heal'],[2350,'ammo'],[3450,'heal'],[4350,'ammo'],[5450,'heal'],[6350,'ammo'],[7250,'heal'],[8150,'ammo'],[9250,'heal'],[10150,'ammo'],[11250,'heal'],[12150,'ammo'],[13050,'heal'],[13700,'ammo'],[13780,'heal']],
  waves:[
    // 1 STREET LEVEL: grunt, gunman
    w(700,'grunt',2,1),w(1050,'grunt',2,1.1),w(1300,'gunman',1,1),
    k('A','grunt',3,1.2,0),k('A','gunman',2,1.6,2),
    // 2 RIOT LINE: + shield, knife, drone
    w(2600,'shield',1,1),w(2700,'knife',2,1.2,{side:'l'}),w(3000,'drone',2,1.4,{side:'top'}),w(3300,'grunt',2,1),w(3350,'gunman',1,1),
    k('B','shield',1,1,0),k('B','knife',2,1.3,2,{side:'l'}),k('B','drone',2,1.5,4,{side:'top'}),k('B','gunman',2,1.6,6),
    // 3 ROOFTOP WATCH: + sniper, turret, bruiser
    w(4600,'sniper',1,1),w(4700,'turret',1,1,{side:'at',at:5000}),w(5000,'bruiser',1,1),w(5300,'gunman',2,1.2),w(5350,'knife',2,1.2,{side:'l'}),w(5500,'grunt',2,1,{side:'l'}),
    k('C','bruiser',1,1,0),k('C','sniper',1,1,2),k('C','grunt',3,1.1,3),k('C','drone',2,1.5,6,{side:'top'}),
    // 4 HEAVY METAL: + mech
    w(6600,'grunt',3,1),w(6700,'mech',1,1),w(7100,'gunman',2,1.3),w(7150,'knife',2,1.1,{side:'l'}),w(6900,'drone',2,1.3,{side:'top'}),
    k('D','mech',1,1,0),k('D','shield',2,2,2),k('D','gunman',2,1.5,4),k('D','knife',2,1.2,7,{side:'l'}),k('D','grunt',3,1,9),
    // 5 SKY AND TEETH: + jetpack, hound
    w(8400,'jetpack',1,1,{side:'top'}),w(8600,'hound',2,1.4),w(9000,'jetpack',1,1,{side:'top'}),w(9050,'gunman',2,1.4),w(9200,'grunt',2,1,{side:'l'}),w(8800,'knife',2,1,{side:'l'}),
    k('E','hound',3,1.4,0),k('E','jetpack',2,2,2,{side:'top'}),k('E','shield',1,1,4),k('E','grunt',2,1,6,{side:'l'}),k('E','gunman',2,1.4,8),k('E','hound',1,1,10,{side:'l'}),
    // 6 HEAT AND BLADES: + flamer, ninja
    w(10400,'flamer',1,1),w(10600,'ninja',1,1),w(11000,'flamer',1,1),w(11050,'drone',2,1.4,{side:'top'}),w(11100,'hound',1,1,{side:'l'}),w(10800,'gunman',2,1.3),
    k('F','ninja',2,2.4,0),k('F','flamer',2,2,1),k('F','gunman',2,1.4,4),k('F','jetpack',1,1,6,{side:'top'}),k('F','knife',2,1,8,{side:'l'}),k('F','hound',2,1.4,10),k('F','shield',1,1,11),
    // 7 FIELD HOSPITAL: + medic, everything mixed
    w(12400,'medic',1,1),w(12450,'bruiser',1,1),w(12600,'grunt',3,1),w(12650,'medic',1,1),w(12900,'hound',2,1.2,{side:'l'}),w(12950,'sniper',1,1),w(13100,'jetpack',1,1,{side:'top'}),
    k('G','medic',2,3,0),k('G','mech',1,1,1),k('G','ninja',1,1,3),k('G','hound',2,1.4,4,{side:'l'}),k('G','jetpack',2,2,6,{side:'top'}),k('G','flamer',1,1,8),k('G','gunman',2,1.4,10),k('G','grunt',3,1,12,{side:'l'}),k('G','medic',1,1,13)],
  locks:[{id:'A',x:1700},{id:'B',x:3700},{id:'C',x:5700},{id:'D',x:7500},{id:'E',x:9500},{id:'F',x:11500},{id:'G',x:13300}],
  boss:{x:14100,id:'warden2'},
  tale:F.STAGES.street1&&F.STAGES.street1.tale};
const secOf=S=>Math.min(SEC.length-1,S.cpN|0);
ST.hook={
  agg(S){return AGG[secOf(S)]*(S.assist?.9:1);},
  step(S,dt,env){const P=S.P,sec=secOf(S);if(!S.fs){S.fs={seen:{},life:[],left:0,mercy:{},hurts:S.hurts,sec:-1,order:[],secT:[]};}const f=S.fs;
    if(f.sec!==sec){f.sec=sec;f.secT.push(Math.round(S.time));S.note={t:2.2,txt:(sec+1)+'/'+SEC.length+' '+SEC[sec].n};try{NR.emit('footSection',{n:sec+1,name:SEC[sec].n});}catch(x){}}
    for(const e of S.E){if(!e._fs){e._fs=1;if(!f.seen[e.id]){f.seen[e.id]={sec,x:Math.round(e.x),t:+S.time.toFixed(1)};f.order.push(e.id);if(INTRO[e.id]&&!S.cpUsed)S.note={t:2.6,txt:INTRO[e.id]};}}
      if(e.seen&&e.seenAt==null)e.seenAt=S.time;
      if(e.gone&&!e._fd){e._fd=1;if(e.seenAt!=null)f.left++;}
      if(e.dead&&!e._fd){e._fd=1;if(e.seenAt!=null&&!e.boss)f.life.push(S.time-e.seenAt);}}
    // hit mercy: a hit clears the enemy bullets near you
    if(S.hurts>f.hurts){f.hurts=S.hurts;S.eb=S.eb.filter(b=>Math.hypot(b.x-P.x,b.y-(P.y-40))>170);}
    // last-heart mercy (Easy / Normal): one heart falls in front of you, once per section
    const dk=(window.SET&&SET.diff)||'normal';if(P.hp===1&&P.max>1&&!f.mercy[sec]&&(dk==='easy'||dk==='normal')){f.mercy[sec]=1;S.pk.push({k:'heal',x:clamp(P.x+P.facing*110,S.camX+40,S.camX+(F.hudInfo()?F.hudInfo().vw:760)-40),y:120,vy:0,t:0,on:false,fix:1});S.note={t:1.6,txt:'MERCY · a heart'};}},
  draw(c,S){
    for(const x of ST.cps)if(x>(S.cp?S.cp.x:-1)){c.fillStyle='#19e3ff55';c.fillRect(x-2,FL-120,4,120);c.fillStyle='#19e3ff';c.fillRect(x-2,FL-120,22,12);}
    for(const e of S.E){if(e.dead)continue;
      if(e.lane){c.strokeStyle='#ff304a';c.lineWidth=3;c.setLineDash([12,10]);c.globalAlpha=.5+.4*Math.sin(S.time*24);c.beginPath();c.moveTo(e.lane.x0,e.lane.y+30);c.lineTo(e.lane.x1,e.lane.y+30);c.stroke();c.setLineDash([]);c.globalAlpha=1;}
      if(e.mark){c.strokeStyle='#ff304a';c.lineWidth=3;c.globalAlpha=.55+.4*Math.sin(S.time*26);c.beginPath();c.ellipse(e.mark.x,FL-4,30,8,0,0,6.283);c.stroke();c.globalAlpha=1;}
      if(e.fl){c.globalAlpha=.75;const g=c.createLinearGradient(e.fl.x,0,e.fl.x+e.fl.w,0);g.addColorStop(e.facing>0?0:1,'#fff2a0');g.addColorStop(e.facing>0?1:0,'#ff3a1a00');c.fillStyle=g;c.fillRect(e.fl.x,FL-80,e.fl.w,72);c.globalAlpha=1;}
      if(e.patch){c.fillStyle='#ff6a1a';c.globalAlpha=.4+.3*Math.sin(S.time*18);c.fillRect(e.patch.x0,FL-14,e.patch.x1-e.patch.x0,14);c.globalAlpha=1;}
      if(e.beam&&!e.beam.dead){c.strokeStyle='#7dff8a';c.lineWidth=4;c.globalAlpha=.6+.3*Math.sin(S.time*30);c.beginPath();c.moveTo(e.x,e.y-e.h*.6);c.lineTo(e.beam.x,e.beam.y-(e.beam.h||60)*.6);c.stroke();c.globalAlpha=1;}
      if(e.id==='hound'&&e.state==='open'||e.id==='ninja'&&e.state==='stun'){c.fillStyle='#7dff8a';c.font='bold 16px monospace';c.textAlign='center';c.fillText('OPEN',e.x,e.y-e.h-8);}
      if(e.boss&&e.gate)for(const r of e.relays||[])if(!r.dead){c.strokeStyle='#7df9ff';c.lineWidth=3;c.globalAlpha=.5+.4*Math.sin(S.time*20);c.beginPath();c.moveTo(r.x,r.y-r.h+10);c.lineTo(e.x,e.y-e.h*.6);c.stroke();c.globalAlpha=1;}}},
  hud(c,vw,u,box,fs,S){const x0=vw*.18,bw=vw*.64,y=VH-14*u,h=6*u,pr=clamp(S.P.maxX/ST.boss.x,0,1);
    c.fillStyle='#ffffff22';c.fillRect(x0,y,bw,h);c.fillStyle='#19e3ff';c.fillRect(x0,y,bw*pr,h);
    for(const s of SEC.slice(1)){const sx=x0+bw*s.x/ST.boss.x;c.fillStyle=S.cp&&S.cp.x>=s.x?'#ffd23a':'#ffffff88';c.fillRect(sx-1.5*u,y-3*u,3*u,h+6*u);}
    c.font='bold '+fs(14)+'px monospace';c.textBaseline='middle';c.textAlign='right';c.fillStyle='#fff';const t=(secOf(S)+1)+'/'+SEC.length;c.fillText(t,x0-6*u,y+h/2);
    const tw=c.measureText(t).width;box(x0-6*u-tw,y-8*u,bw+6*u+tw,h+16*u);c.textBaseline='top';},
  rows(S,rows){rows.splice(3,0,['SECTION',(S.end&&S.end.cleared?SEC.length:secOf(S)+1)+'/'+SEC.length]);}};
F.STAGES.zeil=ST;F.main='zeil';F.SEC=SEC;F.AGG=AGG;

/* ---------- placeholder art (shapes) + the sprite-sheet hook ---------- */
const SPR={jetpack:{hover:'hover',fly:'fly',shoot:'shoot',die:'die'},hound:{run:'run',pounce:'pounce',bite:'bite',hit:'run',die:'die'},flamer:{walk:'walk',spray:'spray',hit:'hit',die:'die'},
  ninja:{block:'block',dash:'dash',slash:'slash',hit:'block',die:'die'},medic:{walk:'walk',heal:'heal',die:'die'}};
function sheet(c,who,pose,x,y,h,flip,t){const A=window.ART;if(!RET.sprites||!A||typeof A.drawAnim!=='function'||typeof A.anim!=='function')return false;const act=SPR[who]&&SPR[who][pose];if(!act)return false;
  const key=who+'/'+act,a=A.anim(key);if(!a||!a.h)return false;A.drawAnim(c,key,t,x,y,h/a.h,flip);return true;}
const dead=(c,pose,t)=>{if(pose==='die')c.globalAlpha*=Math.max(.1,1-t*1.6);};
const D={
  jetpack(c,pose,x,y,h,flip,t,col){c.save();dead(c,pose,t);c.translate(x,y);c.scale(flip?-1:1,1);const s=h/58;c.scale(s,s);
    c.fillStyle='#ffb020';c.globalAlpha*=.6+.4*Math.sin(t*40);c.beginPath();c.moveTo(-16,-6);c.lineTo(-10,14+Math.sin(t*50)*4);c.lineTo(-4,-6);c.fill();c.globalAlpha=1;dead(c,pose,t);
    c.fillStyle='#556';c.fillRect(-20,-40,12,32);c.fillStyle=col==='#ffffff'?col:'#4ad0a0';c.fillRect(-8,-50,18,36);c.fillRect(-5,-58,12,10);c.fillStyle='#fff';c.fillRect(2,-56,6,3);
    c.fillStyle='#ccd';c.fillRect(6,pose==='shoot'||pose==='fly'?-24:-36,18,5);c.restore();},
  hound(c,pose,x,y,h,flip,t,col){c.save();dead(c,pose,t);c.translate(x,y);c.scale(flip?-1:1,1);const s=h/40;c.scale(s,s);const r=pose==='run'?Math.sin(t*22)*6:0,cr=pose==='bite'?6:0;
    c.fillStyle=col==='#ffffff'?col:'#b04030';c.fillRect(-26,-30+cr,40,16);c.fillRect(12,-36+cr,16,14);c.fillStyle='#ffd23a';c.fillRect(22,-33+cr,3,3);
    c.fillStyle='#702818';c.fillRect(-24+r,-16,6,16);c.fillRect(-12-r,-16,6,16);c.fillRect(2+r,-16,6,16);c.fillRect(10-r,-16,6,16);c.fillRect(-32,-30+cr,8,4);c.restore();},
  flamer(c,pose,x,y,h,flip,t,col){c.save();dead(c,pose,t);c.translate(x,y);c.scale(flip?-1:1,1);const s=h/86;c.scale(s,s);
    c.fillStyle='#ff8a1a';c.fillRect(-26,-70,14,40);c.fillStyle='#ffd23a';c.fillRect(-24,-66,10,6);
    c.fillStyle=col==='#ffffff'?col:'#7a4a2a';c.fillRect(-12,-62,26,34);c.fillRect(-9,-84,18,20);c.fillStyle='#ffb020';c.fillRect(-2,-80,10,6);
    c.fillStyle='#5a3a20';c.fillRect(-10,-28,9,28);c.fillRect(3,-28,9,28);c.fillStyle='#999';c.fillRect(10,-50,26,6);
    if(pose==='spray'||t%1<.5){c.fillStyle='#ffd23a';c.beginPath();c.arc(37,-47,pose==='spray'?5:2.5,0,6.283);c.fill();}c.restore();},
  ninja(c,pose,x,y,h,flip,t,col){c.save();dead(c,pose,t);c.translate(x,y);c.scale(flip?-1:1,1);const s=h/76;c.scale(s,s);if(pose==='dash')c.globalAlpha*=.55;
    c.fillStyle=col==='#ffffff'?col:'#1a1a2a';c.fillRect(-7,-76,14,13);c.fillRect(-9,-62,18,30);c.fillRect(-8,-32,7,32);c.fillRect(1,-32,7,32);
    c.fillStyle='#ff2050';c.fillRect(-7,-70,14,3);c.fillRect(-16,-69+Math.sin(t*12)*2,10,3);c.fillStyle='#dde';
    if(pose==='slash')c.fillRect(6,-58,36,3);else if(pose==='block'){c.fillRect(8,-74,3,34);}else c.fillRect(-14,-60,3,30);c.restore();},
  medic(c,pose,x,y,h,flip,t,col){c.save();dead(c,pose,t);c.translate(x,y);c.scale(flip?-1:1,1);const s=h/80;c.scale(s,s);const r=pose==='walk'?Math.sin(t*12)*4:0;
    c.fillStyle=col==='#ffffff'?'#ffd':'#e8eef4';c.fillRect(-8,-80,16,14);c.fillRect(-11,-64,22,30);c.fillRect(-9+r,-34,8,34);c.fillRect(1-r,-34,8,34);
    c.fillStyle='#2ad060';c.fillRect(-3,-58,6,18);c.fillRect(-9,-52,18,6);if(pose==='heal'){c.fillStyle='#7dff8a';c.beginPath();c.arc(16,-50,6+Math.sin(t*20)*2,0,6.283);c.fill();}c.restore();},
  relay(c,pose,x,y,h,flip,t,col){c.save();dead(c,pose,t);c.fillStyle=col==='#ffffff'?col:'#3a4a6a';c.fillRect(x-12,y-h+20,24,h-20);c.fillStyle='#7df9ff';c.fillRect(x-17,y-8,34,8);
    c.globalAlpha*=.6+.4*Math.sin(t*8);c.beginPath();c.arc(x,y-h+12,12,0,6.283);c.fill();c.restore();},
  warden2(c,pose,x,y,h,flip,t,col){const fa=window.FA;if(fa&&typeof fa.draw==='function'){fa.draw(c,'warden',pose,x,y,h,flip,t);return;}c.fillStyle=col;c.fillRect(x-h*.35,y-h,h*.7,h);}};
F.drawX=F.drawX||{};for(const who in D)F.drawX[who]=(c,pose,x,y,h,flip,t,col)=>{if(who!=='warden2'&&sheet(c,who,pose,x,y,h,flip,t))return;D[who](c,pose,x,y,h,flip,t,col);};
})();

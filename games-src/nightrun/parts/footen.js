/* footen.js: on-foot street stage enemies + boss library (W3). Pure data + behaviour, inert until the on-foot engine (foot.js) calls it.
   Defines window.FOOT_ENEMIES {grunt,gunman,shield,bruiser,knife,sniper,drone,turret,mech} and window.FOOT_BOSS {warden}; helpers in window.FOOT_EN_UTIL.
   Contract with the engine (see games-src/nightrun/FOOT-ENEMIES.md):
   - e.x = centre x, e.y = FEET y (ground enemies stand on env.G.floorY, or env.G.groundAt(x) if given); env.P uses the same convention.
   - engine per frame: def.ai(e,dt,env) until e.remove. On a hit: e.hp -= dmg; def.onHit(e,dmg,env,hit) (hit = {x:attackerX, melee:bool}, optional; it may
     give hp back for blocked/capped damage); if e.hp<=0: def.onDeath(e,env) once, then keep calling ai until e.remove (0.5 s death pose), spawn e.dropList.
   - def.canHit(e) false = bullets pass through (turret hidden). e.dead = true once killed (no contact damage, no more hits).
   - ai moves e and may call env.shoot(e,ang,speed,dmg,opts), env.melee(e,rect{x,y,w,h top-left},dmg,opts) (returns true if it hit the hero; it may be called every
     frame while a hazard is active, the hero's invulnerability de-duplicates), optional env.fx(name,x,y,opts), env.spawn(type,x,y,opts).
   - shared state in env.G: ftok (ranged-fire tokens, max 2), beat (number, beat counter or fractional) + optional beatLen/bpm, obs [{x,w,h}] low obstacles. */
(function(){
'use strict';
var PI=Math.PI, GRAV=1700;
var sgn=function(v){return v<0?-1:1}, clamp=function(v,a,b){return v<a?a:v>b?b:v}, abs=Math.abs;

/* ---------- shared helpers ---------- */
function beatLen(env){var G=env.G||{};return G.beatLen||(G.bpm?60/G.bpm:0.5)}               // seconds per beat (default 120 bpm)
function beatNow(env){var G=env.G||{};return typeof G.beat==='number'?G.beat:(G.time||0)/beatLen(env)}
function fx(env,name,x,y,o){if(env&&typeof env.fx==='function')env.fx(name,x,y,o)}
function gy(env,x){var G=env.G;return G.groundAt?G.groundAt(x):G.floorY}
function ph(env){return env.P.h||84}
function aimAt(e,env){var P=env.P;return Math.atan2((P.y-ph(env)*0.5)-(e.y-e.h*0.62),P.x-e.x)}
function muzzle(e){return {ox:e.x+e.facing*e.w*0.45,oy:e.y-e.h*0.62}}
function shoot(e,env,ang,spd,dmg,o){o=o||{};var m=muzzle(e);if(o.ox==null)o.ox=m.ox;if(o.oy==null)o.oy=m.oy;env.shoot(e,ang,spd,dmg,o)}
function frontRect(e,reach,topOff,hh){return {x:e.facing>0?e.x+e.w*0.2:e.x-e.w*0.2-reach,y:e.y-topOff,w:reach,h:hh}}
function setState(e,s,tele){e.state=s;e.sT=0;e.teleD=tele||0;e.teleP=0;e.telegraph=!!tele}
function walk(e,dt,dir,spd){e.x+=dir*spd*dt;e.vx=dir*spd}
function physics(e,env,dt){var g=gy(env,e.x);if(e.y<g-0.5||e.vy<0){e.vy+=GRAV*dt;e.y+=e.vy*dt;if(e.y>=g){e.y=g;e.vy=0}}else{e.y=g;e.vy=0}e.air=e.y<g-1}
function canMoveTo(env,x,cur){var G=env.G;if(G.viewW==null||G.camX==null)return true;var lo=G.camX+30,hi=G.camX+G.viewW-30,mid=(lo+hi)/2;return (x>=lo&&x<=hi)||abs(x-mid)<abs(cur-mid)}
function runPose(e){return ((e.t*8)|0)%2?'run-b':'run-a'}
function airPose(e){return e.air?(e.vy<0?'jump':'fall'):null}

/* ranged-fire tokens: at most 2 enemies are aiming/firing at the same moment */
function tokClean(G){var a=G.ftok||(G.ftok=[]);for(var i=a.length-1;i>=0;i--){var h=a[i];if(h.e.remove||h.e.dead||h.until<G.time)a.splice(i,1)}return a}
function tokGet(env,e,dur){var G=env.G,a=tokClean(G);for(var i=0;i<a.length;i++)if(a[i].e===e){a[i].until=G.time+dur;return true}if(a.length>=2)return false;a.push({e:e,until:G.time+dur});return true}
function tokFree(env,e){var a=env.G.ftok;if(!a)return;for(var i=a.length-1;i>=0;i--)if(a[i].e===e)a.splice(i,1)}

/* the hero is never overlapped or hit by a new enemy: push it out to the side, and give 0.6 s of grace */
function safeSpawn(e,env,def){var P=env.P,need=(P.w+def.w)/2+120;if(abs(e.x-P.x)<need){var side=e.x>=P.x?1:-1;e.x=P.x+side*Math.max(need,(env.G.viewW||800)*0.6)}}
function init(e,env,def){
  e._i=1;e.t=e.t||0;e.age=e.age||0;e.sT=0;e.cd=e.cd||0;e.flash=e.flash||0;e.vx=e.vx||0;e.vy=e.vy||0;e.dead=false;e.w=e.w||def.w;e.h=e.h||def.h;
  e.mhp=e.maxHp||e.hpMax||e.hp||def.hp;if(e.hp==null)e.hp=e.mhp;
  if(!(e.y>0)||(!def.fixed&&!def.flyer&&e.y>gy(env,e.x)))e.y=def.flyer||def.fixed?(e.y||gy(env,e.x)):gy(env,e.x);
  e.facing=sgn(env.P.x-e.x);
  if(!def.fixed)safeSpawn(e,env,def);
  if(!e.state||e.state==='idle')setState(e,def.start||'walk',0);
}
function tickBeat(e,env){var b=Math.floor(beatNow(env));if(e._lb===undefined){e._lb=b;return false}var t=b>e._lb;e._lb=b;return t}
function rollDrops(def,env){var out=[],pool=(def.drops||[]).slice(),n=def.dropN||1,p=def.dropP==null?1:def.dropP;
  for(var i=0;i<n&&pool.length;i++){if(env.rnd(0,1)<=p){var k=clamp(Math.floor(env.rnd(0,pool.length)),0,pool.length-1);out.push(pool.splice(k,1)[0])}}return out}
function feDie(e,env,def){if(e.state==='dead')return;setState(e,'dead',0);e.dead=true;e.vx=0;e.dropList=rollDrops(def,env);e.score=def.score;tokFree(env,e);e.aim=null;e.laser=null;fx(env,'die',e.x,e.y-e.h*0.5,{big:def.h>110})}
function wrap(def,fn){
  def.ai=function(e,dt,env){
    if(!e._i)init(e,env,def);
    e.t+=dt;e.age+=dt;e.sT+=dt;if(e.cd>0)e.cd=Math.max(0,e.cd-dt);if(e.flash>0)e.flash=Math.max(0,e.flash-dt);
    e.teleP=e.teleD>0?Math.min(1,e.sT/e.teleD):0;e.tk=tickBeat(e,env);
    if(e.state==='dead'){e.dead=true;e.vx*=0.9;if(!def.fixed&&!def.flyer)physics(e,env,dt);else if(def.flyer){e.vy+=GRAV*0.5*dt;e.y=Math.min(e.y+e.vy*dt,gy(env,e.x))}
      if(e.sT>=0.5)e.remove=true;return}
    fn(e,dt,env);
  };
  def.onDeath=function(e,env){feDie(e,env,def)};
  return def;
}
function blockFx(e,env,name){if(!e.fxT||e.fxT<=env.G.time){e.fxT=env.G.time+0.25;fx(env,name||'clang',e.x,e.y-e.h,{text:'CLANG'})}}
/* attacker on the facing side of e = front hit; behind = back hit */
function isBack(e,env,hit){var fx_=hit&&hit.x!=null?hit.x:env.P.x;return (fx_-e.x)*e.facing<0}
function feHurt(e,dmg){e.flash=0.12;e.hitT=0.12}
function turn(e,dt,want,delay){if(want!==e.facing){e.turnT=(e.turnT||0)+dt;if(e.turnT>=delay){e.facing=want;e.turnT=0}}else e.turnT=0}

var FE={};

/* ---------- GRUNT: walks at you, 0.5 s swing telegraph ---------- */
var GR=wrap({w:44,h:84,hp:3,score:100,speed:70,drops:['heal','speed','damage'],dropP:0.2,dropN:1,start:'walk'},function(e,dt,env){
  var P=env.P,dx=P.x-e.x,ad=abs(dx);physics(e,env,dt);
  switch(e.state){
  case 'windup':e.vx=0;if(e.sT>=0.5){setState(e,'swing',0);e.swung=false}break;
  case 'swing':if(!e.swung){e.swung=true;env.melee(e,frontRect(e,62,e.h*0.95,e.h*0.9),1)}if(e.sT>=0.2){setState(e,'recover',0);e.cd=0.8}break;
  case 'recover':e.vx=0;if(e.sT>=0.45)setState(e,'walk',0);break;
  default:
    e.facing=sgn(dx);if(ad>54)walk(e,dt,e.facing,GR.speed);else e.vx=0;
    if(ad<=68&&e.cd<=0&&e.age>0.6&&abs(P.y-e.y)<50)setState(e,'windup',0.5);
  }
});
GR.pose=function(e){if(e.state==='dead')return 'die';var a=airPose(e);if(a)return a;
  if(e.state==='windup'||e.state==='swing')return 'melee';if(e.flash>0)return 'hit';return e.state==='recover'?'idle':(abs(e.vx)>1?runPose(e):'idle')};
GR.onHit=function(e){feHurt(e)};
FE.grunt=GR;

/* ---------- GUNMAN: holds 280-420 px, 0.6 s aim cue, 3-round burst on the beat, backs off when you are close ---------- */
var GM=wrap({w:44,h:84,hp:4,score:150,speed:80,drops:['weapon-hmg','heal','magnet'],dropP:0.3,dropN:1,start:'walk',rangeMin:280,rangeMax:420,bulletSpeed:320},function(e,dt,env){
  var P=env.P,dx=P.x-e.x,ad=abs(dx),s=e.state;physics(e,env,dt);
  if(s==='aim'){
    e.facing=sgn(dx);e.vx=0;e.aimCue=true;if(e.sT<0.6)e.aimAng=aimAt(e,env);
    if(ad<170){tokFree(env,e);e.aimCue=false;setState(e,'retreat',0);e.cd=1.2;return}      // you rushed him: abort, back off
    tokGet(env,e,4);if(e.sT>=0.6){e.shots=0;e.lastShot=0;setState(e,'burst',0)}
  }else if(s==='burst'){
    e.vx=0;e.aimCue=true;tokGet(env,e,4);
    if(e.tk||e.sT-e.lastShot>=beatLen(env)+0.12){e.lastShot=e.sT;e.shots++;shoot(e,env,e.aimAng,GM.bulletSpeed,1,{kind:'bullet'});
      if(e.shots>=3){tokFree(env,e);e.aimCue=false;setState(e,'recover',0);e.cd=1.8+env.rnd(0,0.8)}}
    else if(e.sT>5){tokFree(env,e);e.aimCue=false;setState(e,'walk',0)}
  }else if(s==='recover'){e.vx=0;if(e.sT>=0.5)setState(e,'walk',0)}
  else{ // walk / retreat: keep the 280-420 band
    e.facing=sgn(dx);e.aimCue=false;
    if(ad<GM.rangeMin){var nx=e.x-e.facing*GM.speed*1.15*dt;if(canMoveTo(env,nx,e.x)){e.x=nx;e.vx=-e.facing*GM.speed*1.15}else e.vx=0;e.state='retreat'}
    else if(ad>GM.rangeMax){walk(e,dt,e.facing,GM.speed);e.state='walk'}
    else{e.vx=0;e.state='walk';
      if(e.cd<=0&&e.age>0.6&&tokGet(env,e,4)){setState(e,'aim',0.6);e.aimAng=aimAt(e,env)}}
  }
});
GM.pose=function(e){if(e.state==='dead')return 'die';var a=airPose(e);if(a)return a;
  if(e.state==='aim'||e.state==='burst')return 'shoot';if(e.flash>0)return 'hit';return abs(e.vx)>1?runPose(e):'idle'};
GM.onHit=function(e){feHurt(e)};
FE.gunman=GM;

/* ---------- SHIELD cop: front shield blocks bullets (breaks after 8 blocked hits); melee, back hits and jump-overs get through ---------- */
var SH=wrap({w:54,h:88,hp:8,score:250,speed:38,drops:['shield','damage','weapon-shotgun'],dropP:0.5,dropN:1,start:'walk',shieldHits:8,turnDelay:0.7},function(e,dt,env){
  var P=env.P,dx=P.x-e.x,ad=abs(dx),s=e.state;physics(e,env,dt);
  if(e.shield==null){e.shield=true;e.sh=SH.shieldHits}
  if(e.blockT>0)e.blockT=Math.max(0,e.blockT-dt);
  if(s==='windup'){e.vx=0;if(e.sT>=0.5){setState(e,'bash',0);e.swung=false}}
  else if(s==='bash'){if(!e.swung){e.swung=true;env.melee(e,frontRect(e,70,e.h*0.95,e.h*0.9),1,{knock:260})}if(e.sT>=0.25){setState(e,'recover',0);e.cd=1.3}}
  else if(s==='stun'){e.vx=0;if(e.sT>=0.6)setState(e,'walk',0)}
  else if(s==='recover'){e.vx=0;if(e.sT>=0.5)setState(e,'walk',0)}
  else{
    var want=sgn(dx);turn(e,dt,want,SH.turnDelay);                                  // slow to turn: jump over him and he shows you his back
    var spd=SH.speed*(e.shield?1:1.7);
    if(want===e.facing){if(ad>66)walk(e,dt,e.facing,spd);else e.vx=0}else e.vx=0;
    if(want===e.facing&&ad<=78&&e.cd<=0&&e.age>0.6&&abs(P.y-e.y)<50)setState(e,'windup',0.5);
  }
});
SH.pose=function(e){if(e.state==='dead')return 'die';var a=airPose(e);if(a)return a;
  if(e.state==='windup'||e.state==='bash')return 'melee';if(e.blockT>0)return 'crouch';if(e.flash>0)return 'hit';return abs(e.vx)>1?runPose(e):'idle'};
SH.onHit=function(e,dmg,env,hit){
  if(e.shield==null){e.shield=true;e.sh=SH.shieldHits}
  if(e.shield&&!(hit&&hit.melee)&&!isBack(e,env,hit)){            // front bullet: blocked, hp handed back, shield takes the hit
    e.hp+=dmg;e.sh--;e.blockT=0.15;blockFx(e,env);
    if(e.sh<=0){e.shield=false;setState(e,'stun',0);fx(env,'break',e.x+e.facing*e.w*0.5,e.y-e.h*0.5,{text:'SHIELD DOWN'})}
    return}
  feHurt(e);
};
FE.shield=SH;

/* ---------- BRUISER: slow, 0.8 s charge telegraph, ground-slam shock ring, 18 hp, drops a weapon ---------- */
var BR=wrap({w:84,h:120,hp:18,score:600,speed:45,drops:['weapon-shotgun','weapon-hmg','weapon-flame'],dropP:1,dropN:1,start:'walk',chargeSpeed:360},function(e,dt,env){
  var P=env.P,dx=P.x-e.x,ad=abs(dx),s=e.state;physics(e,env,dt);
  if(s==='charge-t'){e.vx=0;if(e.sT>=0.8){setState(e,'charge',0);e.hitDone=false}}
  else if(s==='charge'){
    walk(e,dt,e.cdir,BR.chargeSpeed);
    if(!e.hitDone&&env.melee(e,{x:e.x-e.w*0.5-10,y:e.y-e.h,w:e.w+20,h:e.h},2,{knock:340}))e.hitDone=true;
    var G=env.G,wall=G.camX!=null&&(e.x<G.camX-60||e.x>G.camX+G.viewW+60);
    if(e.sT>=0.9||(e.x-P.x)*e.cdir>170||wall){setState(e,'stun',0);e.cd=2}
  }
  else if(s==='stun'){e.vx=0;if(e.sT>=0.8)setState(e,'walk',0)}                      // winded after the charge: free hits
  else if(s==='slam-t'){e.vx=0;if(e.sT>=0.8){setState(e,'slam',0);
      shoot(e,env,0,230,1,{kind:'shock',ground:true,w:46,h:28,life:1.6,oy:e.y-14,ox:e.x+e.w*0.5});shoot(e,env,PI,230,1,{kind:'shock',ground:true,w:46,h:28,life:1.6,oy:e.y-14,ox:e.x-e.w*0.5});
      env.melee(e,{x:e.x-e.w*0.5-40,y:e.y-50,w:e.w+80,h:50},2,{knock:300});fx(env,'shockring',e.x,e.y,{r:140})}}
  else if(s==='slam'){e.vx=0;if(e.sT>=0.7){setState(e,'walk',0);e.cd=2.2}}
  else{
    e.facing=sgn(dx);if(ad>90)walk(e,dt,e.facing,BR.speed);else e.vx=0;
    if(e.cd<=0&&e.age>0.8){
      if(ad<=130)setState(e,'slam-t',0.8);
      else if(ad>=200&&ad<=560){e.cdir=e.facing;setState(e,'charge-t',0.8)}}
  }
});
BR.pose=function(e){if(e.state==='dead')return 'die';var a=airPose(e);if(a)return a;
  switch(e.state){case 'charge-t':return 'crouch';case 'charge':return runPose(e);case 'slam-t':return 'jump';case 'slam':return 'melee';case 'stun':return 'hit'}
  if(e.flash>0)return 'hit';return abs(e.vx)>1?runPose(e):'idle'};
BR.onHit=function(e){feHurt(e)};
FE.bruiser=BR;

/* ---------- KNIFE runner: fast, 0.4 s crouch, two-slash dash combo, vaults low obstacles ---------- */
var KN=wrap({w:36,h:78,hp:2,score:120,speed:230,drops:['speed','heal','bomb'],dropP:0.25,dropN:1,start:'walk',dashSpeed:440},function(e,dt,env){
  var P=env.P,dx=P.x-e.x,ad=abs(dx),s=e.state;physics(e,env,dt);
  function slash(){if(!e.hitDone&&env.melee(e,{x:e.x-e.w*0.5-14,y:e.y-e.h*0.95,w:e.w+28,h:e.h*0.9},1,{knock:200}))e.hitDone=true}
  if(s==='tele'){e.vx=0;if(e.sT>=0.4){e.cdir=sgn(dx);e.facing=e.cdir;setState(e,'dash1',0);e.hitDone=false}}
  else if(s==='dash1'||s==='dash2'){walk(e,dt,e.cdir,KN.dashSpeed);slash();
    if(e.sT>=0.22){if(s==='dash1'){setState(e,'gap',0)}else{setState(e,'recover',0);e.cd=1.4}}}
  else if(s==='gap'){e.vx=0;e.facing=sgn(dx);if(e.sT>=0.22){e.cdir=sgn(dx);setState(e,'dash2',0);e.hitDone=false}}
  else if(s==='recover'){e.vx=0;if(e.sT>=0.7)setState(e,'walk',0)}
  else{
    e.facing=sgn(dx);if(ad>40||e.air)walk(e,dt,e.facing,KN.speed);
    var obs=env.G.obs;                                                            // vault low obstacles ahead
    if(obs&&!e.air)for(var i=0;i<obs.length;i++){var o=obs[i],edge=e.facing>0?o.x-(e.x+e.w*0.5):(e.x-e.w*0.5)-(o.x+o.w);
      if(edge>-4&&edge<44&&o.h<=70&&sgn(o.x+o.w/2-e.x)===e.facing){e.vy=-640;break}}
    if(ad<=150&&e.cd<=0&&e.age>0.6&&!e.air&&abs(P.y-e.y)<50){e.vx=0;setState(e,'tele',0.4)}
  }
});
KN.pose=function(e){if(e.state==='dead')return 'die';var a=airPose(e);if(a)return a;
  switch(e.state){case 'tele':return 'crouch';case 'dash1':case 'dash2':return 'melee';case 'gap':return 'crouch';case 'recover':return 'idle'}
  if(e.flash>0)return 'hit';return abs(e.vx)>1?runPose(e):'idle'};
KN.onHit=function(e){feHurt(e)};
FE.knife=KN;

/* ---------- SNIPER: stays on its ledge; red aim line for 1 beat (min 0.5 s), locks 0.28 s before the one fast shot ---------- */
var SN=wrap({w:40,h:84,hp:3,score:200,speed:0,drops:['weapon-arc','damage','slow'],dropP:0.4,dropN:1,start:'idle',fixed:true,shotSpeed:700,lockTime:0.28},function(e,dt,env){
  var P=env.P,G=env.G,dx=P.x-e.x,s=e.state;
  if(e.ledgeY==null)e.ledgeY=e.y;e.y=e.ledgeY;e.vx=e.vy=0;e.air=false;
  if(s==='aim'){
    var T=Math.max(0.5,beatLen(env));e.facing=sgn(dx);e.aimCue=true;tokGet(env,e,T+2);
    var m=muzzle(e);if(e.sT<T-SN.lockTime){e.aimAng=Math.atan2((P.y-ph(env)*0.5)-m.oy,P.x-m.ox)}
    var L=900;e.aim={x0:m.ox,y0:m.oy,x1:m.ox+Math.cos(e.aimAng)*L,y1:m.oy+Math.sin(e.aimAng)*L,locked:e.sT>=T-SN.lockTime,t:e.sT/T};
    if(e.sT>=T){shoot(e,env,e.aimAng,SN.shotSpeed,2,{kind:'sniper',ox:m.ox,oy:m.oy});tokFree(env,e);e.aim=null;e.aimCue=false;setState(e,'recover',0);e.cd=3+env.rnd(0,1.5)}
  }else if(s==='recover'){if(e.sT>=0.5)setState(e,'idle',0)}
  else{
    e.facing=sgn(dx);e.aimCue=false;e.aim=null;var near=abs(dx)<=760&&(G.camX==null||(e.x>G.camX-20&&e.x<G.camX+G.viewW+20));
    if(near&&e.cd<=0&&e.age>0.8&&tokGet(env,e,2.5)){e.aimAng=aimAt(e,env);setState(e,'aim',Math.max(0.5,beatLen(env)))}
  }
});
SN.pose=function(e){if(e.state==='dead')return 'die';if(e.state==='aim')return 'crouch-shoot';if(e.flash>0)return 'hit';return e.state==='recover'?'shoot':'crouch'};
SN.onHit=function(e){feHurt(e)};
FE.sniper=SN;

/* ---------- DRONE: the only flyer. Sine path inside the air band, hovers over you, 0.4 s blink then drops a small bomb ---------- */
function band(env){var G=env.G;return {lo:G.airTop!=null?G.airTop:G.floorY-320,hi:G.airBottom!=null?G.airBottom:G.floorY-130}}
var DR=wrap({w:52,h:34,hp:2,score:120,speed:140,drops:['bomb','magnet','heal'],dropP:0.25,dropN:1,start:'fly',flyer:true},function(e,dt,env){
  var P=env.P,G=env.G,b=band(env),dx=P.x-e.x;
  if(e.baseY==null){e.baseY=clamp(e.y,b.lo+30,b.hi-30);e.ph=env.rnd(0,6.28)}
  // never inside the hero: lift to the top of the band if it would overlap the hero's box
  e.facing=sgn(dx);
  var goal=P.x+Math.sin(e.t*0.9+e.ph)*230,vx=clamp((goal-e.x)*1.4,-DR.speed,DR.speed);
  if(e.state==='prime')vx*=0.4;
  e.x+=vx*dt;e.vx=vx;
  e.baseY=clamp(e.baseY+Math.sin(e.t*0.37+e.ph)*8*dt,b.lo+30,b.hi-30);
  e.y=clamp(e.baseY+Math.sin(e.t*2.2+e.ph)*26,b.lo,b.hi);e.vy=0;e.air=true;
  if(e.state==='prime'){
    tokGet(env,e,2);if(e.sT>=0.4){shoot(e,env,PI/2,150,1,{kind:'bomb',grav:900,blast:50,vx:e.vx,ox:e.x,oy:e.y});tokFree(env,e);e.cd=2.4+env.rnd(0,0.8);setState(e,'fly',0)}
  }else if(abs(dx)<70&&e.cd<=0&&e.age>0.8&&tokGet(env,e,2))setState(e,'prime',0.4);
});
DR.pose=function(e){if(e.state==='dead')return 'die';if(e.state==='prime')return 'shoot';if(e.flash>0)return 'hit';return ((e.t*10)|0)%2?'run-b':'run-a'};
DR.onHit=function(e){feHurt(e)};
FE.drone=DR;

/* ---------- TURRET: fixed, pops up (0.4 s rise + 0.4 s aim), 3 shots, retracts; only hittable when up ---------- */
var TU=wrap({w:50,h:56,hp:6,score:180,speed:0,drops:['damage','heal','slow'],dropP:0.35,dropN:1,start:'hidden',fixed:true,bulletSpeed:300},function(e,dt,env){
  var P=env.P,dx=P.x-e.x,s=e.state;e.vx=e.vy=0;e.air=false;
  e.facing=sgn(dx);e.up=(s==='aim'||s==='fire'||(s==='rise'&&e.sT>=0.4)||s==='up');
  e.upAmt=s==='rise'?Math.min(1,e.sT/0.4):s==='retract'?1-Math.min(1,e.sT/0.35):(s==='hidden'?0:1);
  if(s==='rise'){if(e.sT>=0.4)setState(e,'aim',0.4)}
  else if(s==='aim'){e.aimCue=true;tokGet(env,e,4);if(e.sT>=0.4){e.shots=0;e.lastShot=-1;setState(e,'fire',0)}}
  else if(s==='fire'){tokGet(env,e,4);
    if(e.sT-e.lastShot>=0.32){e.lastShot=e.sT;e.shots++;shoot(e,env,aimAt(e,env),TU.bulletSpeed,1,{kind:'bullet'})}
    if(e.shots>=3&&e.sT>=e.lastShot+0.25){tokFree(env,e);e.aimCue=false;setState(e,'retract',0)}}
  else if(s==='retract'){if(e.sT>=0.35){setState(e,'hidden',0);e.cd=1.8+env.rnd(0,1)}}
  else{e.aimCue=false;if(e.cd<=0&&e.age>0.8&&abs(dx)<=560&&tokGet(env,e,4))setState(e,'rise',0.4)}
});
TU.canHit=function(e){return !!e.up};
TU.pose=function(e){if(e.state==='dead')return 'die';if(e.state==='aim'||e.state==='fire')return e.flash>0?'hit':'shoot';return e.flash>0&&e.up?'hit':'crouch'};
TU.onHit=function(e,dmg,env){if(!e.up){e.hp+=dmg;blockFx(e,env);return}feHurt(e)};         // armoured plate while retracted
FE.turret=TU;

/* ---------- MECH walker: 30 hp, arcing rocket (0.7 s telegraph) and stomp (0.6 s), weak spot on the back = double damage ---------- */
var ME=wrap({w:110,h:150,hp:30,score:1200,speed:36,drops:['weapon-rocket','weapon-arc','heal','shield','bomb'],dropP:1,dropN:2,start:'walk',turnDelay:1.0,rocketG:700},function(e,dt,env){
  var P=env.P,dx=P.x-e.x,ad=abs(dx),s=e.state;physics(e,env,dt);
  if(s==='rocket-t'){e.vx=0;e.aimCue=true;tokGet(env,e,3);if(e.sT>=0.7){
      var th=50*PI/180,f=e.facing,dist=clamp(ad,230,380),v=clamp(Math.sqrt(ME.rocketG*dist/Math.sin(2*th)),240,520);
      shoot(e,env,f>0?-th:PI+th,v,2,{kind:'rocket',grav:ME.rocketG,blast:70,ox:e.x+f*e.w*0.4,oy:e.y-e.h*0.85});tokFree(env,e);e.aimCue=false;setState(e,'recover',0);e.cd=2.2}}
  else if(s==='stomp-t'){e.vx=0;if(e.sT>=0.6){setState(e,'stomp',0);
      shoot(e,env,0,250,2,{kind:'shock',ground:true,w:50,h:28,life:1.8,oy:e.y-14,ox:e.x+e.w*0.5});shoot(e,env,PI,250,2,{kind:'shock',ground:true,w:50,h:28,life:1.8,oy:e.y-14,ox:e.x-e.w*0.5});
      env.melee(e,{x:e.x-e.w*0.5-50,y:e.y-50,w:e.w+100,h:50},2,{knock:320});fx(env,'shockring',e.x,e.y,{r:150})}}
  else if(s==='stomp'){e.vx=0;if(e.sT>=0.3)setState(e,'recover',0)}
  else if(s==='recover'){e.vx=0;if(e.sT>=0.8){setState(e,'walk',0);e.cd=Math.max(e.cd,1.2)}}
  else{
    var want=sgn(dx);turn(e,dt,want,ME.turnDelay);                                  // slow turn: circle behind it
    if(want===e.facing){if(ad>150)walk(e,dt,e.facing,ME.speed);else e.vx=0}else e.vx=0;
    if(want===e.facing&&e.cd<=0&&e.age>0.8){
      if(ad<=170)setState(e,'stomp-t',0.6);
      else if(ad>=230&&ad<=380&&tokGet(env,e,3))setState(e,'rocket-t',0.7)}
  }
});
ME.pose=function(e){if(e.state==='dead')return 'die';
  switch(e.state){case 'rocket-t':return 'shoot';case 'stomp-t':return 'jump';case 'stomp':return 'melee';case 'recover':return 'idle'}
  if(e.flash>0)return 'hit';return abs(e.vx)>1?runPose(e):'idle'};
ME.onHit=function(e,dmg,env,hit){
  if(isBack(e,env,hit)){e.hp-=dmg;fx(env,'weak',e.x,e.y-e.h*0.8,{text:'WEAK POINT'})}   // double damage from behind
  feHurt(e);
};
FE.mech=ME;

window.FOOT_ENEMIES=FE;

/* =====================================================================================================================
   BOSS: THE WARDEN. 400 hp (Normal; the engine scales e.hp / e.maxHp), three phases at 66% / 33%.
   Every phase change waits for a bar line (4 beats) and is followed by one calm bar with no attacks.
   Hard damage-rate cap: at most hp/100 damage in any 1.0 s (absorbed damage shows CLANG) => the fight lasts >= 100 s.
   ===================================================================================================================== */
var WA_CYC={1:['bursts','charge','bursts','charge'],2:['shock','bursts','charge','shock','bursts'],3:['laser','charge','bursts','laser','shock']};
function bm(e,mode,tele){setState(e,mode,tele);e.mode=mode}
function spd3(e){return e.phase>=3?1.3:1}
var WA=wrap({w:96,h:150,hp:400,score:5000,speed:70,drops:['heal','shield','weapon-rocket','weapon-arc'],dropP:1,dropN:2,start:'idle',capDiv:100,
  phases:[{hp:0.66,name:'barrier',verbs:['drones','wall','shockwave']},{hp:0.33,name:'enrage',verbs:['laser','exposed','charge']}]},function(e,dt,env){
  var P=env.P,G=env.G,dx=P.x-e.x,ad=abs(dx),L=beatLen(env),m=e.mode||'idle',sp=spd3(e),barTk=e.tk&&Math.floor(beatNow(env))%4===0;
  physics(e,env,dt);
  if(!e.phase){e.phase=1;e.mode='idle';e.bucket=[];e.minions=[];e.cyc=0;m='idle';e.exposed=false}
  // phase gate: hp crossing the threshold only queues the change; it happens on the next bar line from idle
  if(!e.pend&&e.phase<3&&e.hp<=WA.phases[e.phase-1].hp*e.mhp)e.pend=e.phase+1;
  var G_t=G.time;
  // turning: with the wall up the Warden is slow to turn, so a jump-over shows you its back
  var locked=(m==='charge'||m==='charge-t'||m==='laser'||m==='burst'||m==='shock'||m==='calm'||m==='exposed'||m==='stun');
  if(!locked){if(e.wall&&e.wall.up)turn(e,dt,sgn(dx),0.8);else{e.facing=sgn(dx);e.turnT=0}}
  e.exposed=(m==='exposed'||m==='stun');
  e.label=e.exposed?'EXPOSED':null;e.laser=m==='laser'?e.laser:null;
  switch(m){
  case 'idle':
    e.aimCue=false;
    if(ad>190&&e.facing===sgn(dx))walk(e,dt,e.facing,(e.wall&&e.wall.up?45:WA.speed)*sp);else e.vx=0;
    if(barTk&&e.age>1){
      if(e.pend){                                                                    // phase change on the bar line, then one calm bar
        e.phase=e.pend;e.pend=0;bm(e,'calm',0);e.calmFrom=beatNow(env);e.cyc=0;
        if(e.phase===3){if(e.wall)e.wall.up=false;for(var i=0;i<e.minions.length;i++)if(e.minions[i])e.minions[i].remove=true;e.minions=[]}
        fx(env,'phase',e.x,e.y-e.h,{text:'PHASE '+e.phase,phase:e.phase});
      }else if(e.phase===2&&(!e.wall||(!e.wall.up&&G_t>=(e.wallAt||0)))){bm(e,'deploy-wall',1.0)}
      else if(e.phase===2&&aliveMinions(e)<2&&G_t>=(e.droneAt||0)){bm(e,'deploy-drones',1.0)}
      else{var seq=WA_CYC[e.phase],a=seq[e.cyc++%seq.length];
        if(a==='charge'){e.cdir=sgn(dx);bm(e,'charge-t',Math.max(0.65,0.8/sp))}
        else if(a==='bursts'){bm(e,'burst-aim',0.6)}
        else if(a==='shock'){bm(e,'shock-t',0.7)}
        else if(a==='laser'){bm(e,'laser',0);e.survived=true;e.laserHit=false}}
    }
    break;
  case 'calm':e.vx=0;e.aimCue=false;if(barTk&&beatNow(env)-e.calmFrom>=3.5)bm(e,'idle',0);break;     // one whole calm bar
  case 'deploy-wall':e.vx=0;if(e.sT>=1.0){e.wall={hp:8,max:8,up:true};fx(env,'wall',e.x+e.facing*60,e.y-e.h*0.5,{text:'SHIELD WALL'});bm(e,'idle',0)}break;
  case 'deploy-drones':e.vx=0;if(e.sT>=1.0){spawnDrones(e,env);e.droneAt=G_t+8;bm(e,'idle',0)}break;
  case 'charge-t':e.vx=0;if(e.sT>=Math.max(0.65,0.8/sp)){bm(e,'charge',0);e.hitDone=false}break;
  case 'charge':
    walk(e,dt,e.cdir,390*sp);e.facing=e.cdir;
    if(!e.hitDone&&env.melee(e,{x:e.x-e.w*0.5-10,y:e.y-e.h,w:e.w+20,h:e.h},2,{knock:360}))e.hitDone=true;
    if(e.sT>=1.0||(e.x-P.x)*e.cdir>180||(G.camX!=null&&(e.x<G.camX+10||e.x>G.camX+G.viewW-10))){bm(e,'charge-r',0)}
    break;
  case 'charge-r':e.vx=0;e.exposed=false;if(e.sT>=0.9/sp)bm(e,'idle',0);break;
  case 'burst-aim':e.vx=0;e.aimCue=true;if(e.sT<0.6)e.aimAng=aimAt(e,env);if(e.sT>=0.6){e.shots=0;e.lastShot=0;bm(e,'burst',0)}break;
  case 'burst':e.vx=0;
    if(e.tk||e.sT-e.lastShot>=L+0.12){e.lastShot=e.sT;e.shots++;shoot(e,env,e.aimAng,330,1,{kind:'bullet'});if(e.shots>=3){e.aimCue=false;bm(e,'burst-r',0)}}
    break;
  case 'burst-r':e.vx=0;if(e.sT>=0.5)bm(e,'idle',0);break;
  case 'shock-t':e.vx=0;if(e.sT>=0.7){bm(e,'shock',0);
      shoot(e,env,e.facing>0?0:PI,250,2,{kind:'shockline',ground:true,w:60,h:26,life:3,oy:e.y-13,ox:e.x+e.facing*e.w*0.5});fx(env,'shockring',e.x,e.y,{r:160})}break;
  case 'shock':e.vx=0;if(e.sT>=0.3)bm(e,'shock-r',0);break;
  case 'shock-r':e.vx=0;if(e.sT>=0.6)bm(e,'idle',0);break;
  case 'laser':{                                                                  // beat-locked, one beat per step: tele low, low beam, tele high, high beam
    e.vx=0;var T=Math.max(L,0.5),k=Math.floor(e.sT/T),inb=e.sT-k*T,hs=P.hStand||(P.crouch?(P.h||50)/0.5:(P.h||84)),beam=null;
    var low={y:G.floorY-26,h:26},high={y:G.floorY-hs*0.95,h:hs*0.35},x0=G.camX!=null?G.camX:e.x-600,w=G.viewW||1200;
    if(k===0)e.laser={kind:'low',on:false,tele:true,y:low.y,h:low.h,x:x0,w:w};
    else if(k===1){var on=inb<0.3;e.laser={kind:'low',on:on,tele:false,y:low.y,h:low.h,x:x0,w:w};if(on)beam=low}
    else if(k===2)e.laser={kind:'high',on:false,tele:true,y:high.y,h:high.h,x:x0,w:w};
    else if(k===3){var on2=inb<0.3;e.laser={kind:'high',on:on2,tele:false,y:high.y,h:high.h,x:x0,w:w};if(on2)beam=high}
    else e.laser=null;
    if(beam&&env.melee(e,{x:x0,y:beam.y,w:w,h:beam.h},2,{beam:true}))e.laserHit=true;
    if(k>=4){e.laser=null;if(!e.laserHit)bm(e,'exposed',0);else bm(e,'idle',0);if(!e.laserHit)fx(env,'exposed',e.x,e.y-e.h,{text:'EXPOSED'})}
    break}
  case 'exposed':e.vx=0;e.exposed=true;e.label='EXPOSED';if(e.sT>=2*Math.max(L,0.5)){e.exposed=false;bm(e,'idle',0)}break;
  case 'stun':e.vx=0;e.exposed=true;e.label='EXPOSED';if(e.sT>=2*Math.max(L,0.5)){e.exposed=false;bm(e,'idle',0)}break;      // wall broken
  default:bm(e,'idle',0);
  }
});
function aliveMinions(e){var n=0;for(var i=0;i<e.minions.length;i++){var m=e.minions[i];if(m&&!m.remove&&!m.dead&&(m.hp==null||m.hp>0))n++}return n}
function spawnDrones(e,env){var b=band(env),made=0;
  for(var i=0;i<2;i++){var side=i?1:-1,x=e.x+side*180,y=b.lo+60+i*50,r=env.spawn&&env.spawn('drone',x,y,{from:'warden',hurt:true});
    if(r){e.minions.push(r);made++}else{(e.spawnQ||(e.spawnQ=[])).push({type:'drone',x:x,y:y})}}
  if(!made)e.droneAt=1e9}                                                           // engine without env.spawn drains e.spawnQ; no auto respawn
WA.pose=function(e){var m=e.mode;if(e.state==='dead')return 'die';
  switch(m){case 'charge-t':return 'crouch';case 'charge':return runPose(e);case 'charge-r':return 'hit';case 'burst-aim':case 'burst':return 'shoot';
    case 'shock-t':case 'deploy-wall':case 'deploy-drones':return 'attack2';case 'shock':return 'melee';case 'laser':return 'attack2';
    case 'exposed':case 'stun':return 'hit';case 'calm':return 'enrage';case 'burst-r':case 'shock-r':return 'idle'}
  if(e.flash>0&&!e.exposed)return 'hit';if(e.phase>=3)return abs(e.vx)>1?runPose(e):'enrage';return abs(e.vx)>1?runPose(e):'idle'};
/* hits: wall blocks the front (CLANG), the back hits the wall until it breaks; phase 3 armour halves damage except while EXPOSED; the cap is hp/100 per 1.0 s */
WA.onHit=function(e,dmg,env,hit){
  var G=env.G,cap=(e.mhp||e.maxHp||e.hpMax||WA.hp)/WA.capDiv,back=isBack(e,env,hit);
  if(e.dead||e.state==='dead')return;
  if(!e.bucket)e.bucket=[];
  if(e.wall&&e.wall.up){
    e.hp+=dmg;
    if(!back){blockFx(e,env);return}
    e.wall.hp-=dmg;fx(env,'spark',e.x,e.y-e.h*0.6);
    if(e.wall.hp<=0){e.wall.up=false;e.wallAt=G.time+12;bm(e,'stun',0);fx(env,'wallbreak',e.x,e.y-e.h*0.5,{text:'WALL DOWN'})}
    return}
  var eff=dmg;if(e.phase>=3&&!e.exposed)eff=dmg*0.5;
  var t=G.time,used=0,b=e.bucket;while(b.length&&b[0].t<=t-1)b.shift();for(var i=0;i<b.length;i++)used+=b[i].d;
  var take=Math.max(0,Math.min(eff,cap-used));if(take>0)b.push({t:t,d:take});
  var refund=dmg-take;if(refund>0.0001){e.hp+=refund;if(refund>dmg*0.3||take===0)blockFx(e,env)}
  feHurt(e);
};
WA.canHit=function(e){return e.state!=='dead'};
var _wd=WA.onDeath;
WA.onDeath=function(e,env){for(var i=0;i<(e.minions||[]).length;i++)if(e.minions[i])e.minions[i].remove=true;e.minions=[];e.wall=null;e.mode='dead';_wd(e,env)};
window.FOOT_BOSS={warden:WA};
window.FOOT_EN_UTIL={beatLen:beatLen,beatNow:beatNow,tokClean:tokClean,rollDrops:rollDrops,safeSpawn:safeSpawn};
})();

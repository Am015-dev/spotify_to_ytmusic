// PURPOSE: on-foot street stage engine
// FLAG: foot (?foot=0)
// TEST: foot-test.js
/* ---------- FOOT: the on-foot street stage (run-and-gun), BRIEF-FOOT.md W1. Flag RET.foot (?foot=0 = off: no button, no layer, FOOT.start does nothing).
   Own full-screen layer #footL (canvas + touch pad + pause/results) with its own loop; it opens only from the MENU while the shooter is idle (!running).
   Coordinates: world px, y down. Every body (player, enemy, prop) has x = CENTRE, y = FEET (bottom), w, h. Floor y = FOOT_FLOOR (view 540 tall, -70 = the ground bosses' road line).
   Uses window.FA (W2 art: draw/bg), window.FOOT_ENEMIES / FOOT_BOSS (W3), all optional: tiny built-in fallbacks keep the stage running.
   Enemies: the engine adds gravity (unless def.fly / e.fly), then x += vx*dt, y += vy*dt and lands them on the floor; ai(e,dt,env) sets e.vx/e.vy (or moves e itself and leaves vx 0).
   env.shoot() always telegraphs >= 0.4 s (the enemy glows) and releases on the next half beat of the song; enemy bullets are capped; new enemies hold fire for an entry grace.
   Events (NR.emit): footStart {stage}, footKill {id,boss,x,y}, footPick {id,lv}, footLevel {w,lv,up}, footCp {stage}, footPhase {id,phase}, footEnd {stage,cleared,score,neon,time,rank,quit}.
   Save: localStorage mnr_foot = {best:{<stage>:{score,rank,time}},clr:{<stage>:n},seen:{b:1,a:1},hint:1}; it is in the save export list. ---------- */
if(RET.foot===undefined)RET.foot=!/[?&]foot=0/.test(location.search);
const FOOT=window.FOOT=(()=>{
const VH=540,FL=VH-70,GRAV=1900,SKEY='mnr_foot',EBMAX=40,TELE=.4,GRACE=.9,QMAX=5;   // QMAX: at most this many enemy shots wind up at once (x fr)
const FDIFF={easy:{hp:.75,fr:.7,bs:.85,dmg:1,hearts:6},normal:{hp:1,fr:1,bs:1,dmg:1,hearts:5},hard:{hp:1.3,fr:1.25,bs:1.1,dmg:1,hearts:4},
  vhard:{hp:1.6,fr:1.4,bs:1.2,dmg:1,hearts:3},legend:{hp:2,fr:1.6,bs:1.3,dmg:2,hearts:4}};   // Legend hits for 2 hearts but you get 4 (2 hits from the boss)
/* ===== WEAPONS: LV1-5. Each level: +22% damage, +12% rate. t3 / t5 = the trait that LV3 / LV5 adds. Picking the same weapon again = +1 LV (and ammo); taking a hit = -1 LV (LV0 = back to the pistol). ===== */
const WEAPONS={
  pistol:{n:'PISTOL',c:'#e8f6ff',rate:4.4,dmg:1,spd:950,ammo:Infinity,kind:'bul'},
  hmg:{n:'HEAVY MG',c:'#ffd23a',rate:11,dmg:.8,spd:1050,ammo:150,kind:'bul',spr:.07,t3:'PIERCE',t5:'TWIN STREAM'},
  shot:{n:'SHOTGUN',c:'#ff8a3a',rate:1.7,dmg:1.2,spd:820,ammo:28,kind:'pel',pel:5,spr:.3,life:.34,t3:'+2 PELLETS',t5:'PIERCE + KNOCKBACK'},
  flame:{n:'FLAMER',c:'#ff6a1a',rate:22,dmg:.3,spd:430,ammo:260,kind:'fire',life:.36,t3:'LONG REACH',t5:'BURN'},
  rocket:{n:'ROCKETS',c:'#ff4060',rate:1.5,dmg:5,spd:580,ammo:14,kind:'rkt',rad:70,t3:'BIG BLAST',t5:'HOMING'},
  arc:{n:'ARC LASER',c:'#7df9ff',rate:5.5,dmg:1.5,ammo:80,kind:'arc',range:430,t3:'CHAINS x2',t5:'CHAINS x4'}};
const WMAX=5;
/* ===== PICKUPS (placeholder icons). max = top level; a second pick of a power-up raises its level and refills its time. ===== */
const PICKUPS={
  w_hmg:{n:'HEAVY MG',c:'#ffd23a',w:'hmg',ic:'H'},w_shot:{n:'SHOTGUN',c:'#ff8a3a',w:'shot',ic:'S'},w_flame:{n:'FLAMER',c:'#ff6a1a',w:'flame',ic:'F'},
  w_rocket:{n:'ROCKETS',c:'#ff4060',w:'rocket',ic:'R'},w_arc:{n:'ARC LASER',c:'#7df9ff',w:'arc',ic:'A'},
  shield:{n:'SHIELD',c:'#5ad1ff',max:3,t:22,ic:'◯'},     // blocks LV hits
  speed:{n:'SPEED',c:'#7dff8a',max:3,t:12,ic:'»'},       // +15% run per LV, faster dash recharge
  dbl:{n:'DOUBLE DMG',c:'#ff2d95',max:3,t:12,ic:'×2'},   // x2, x2.4, x2.8
  magnet:{n:'MAGNET',c:'#b58cff',max:3,t:25,ic:'U'},     // pulls pickups from 140/220/320 px
  heal:{n:'HEAL',c:'#ff6070',ic:'+'},bomb:{n:'BOMB',c:'#ffb020',ic:'●'},
  slow:{n:'TIME SLOW',c:'#9bb8ff',max:3,t:4,ic:'◷'}};     // enemies at 45% for 4 / 5.5 / 7 s
const PW_KEYS=['shield','speed','dbl','magnet','slow'];
/* ===== STAGES as data. waves: {x (camera right edge), enemy, count, gap s, side r|l|top|at, at (world x for side 'at'), lock (only spawns while that arena lock holds), delay s}.
   locks: the camera stops centred on x until every enemy of that lock is dead. cp: mid checkpoint x. boss: final arena. props: [x, kind] (crate, sign, vend, door) that drop pickups. ===== */
const STAGES={street1:{n:'ZEIL UNDERPASS',len:11100,song:'stage2',cp:4700,
  plats:[[1450,380,170],[3250,360,210],[5550,390,150],[5780,318,150],[7550,372,230]],
  props:[[650,'crate'],[1100,'sign'],[1850,'vend'],[2250,'crate'],[3050,'door'],[3550,'crate'],[4050,'sign'],[4500,'vend'],[5150,'crate'],[6050,'door'],[6400,'sign'],[6700,'vend'],[7050,'crate'],[7350,'vend'],[8050,'crate'],[8450,'sign'],[9000,'crate'],[9700,'vend'],[9950,'door']],
  pk:[[6330,'heal'],[8950,'heal']],   // fixed pickups: a heart before arena lock B and another before lock C
  waves:[{x:620,enemy:'grunt',count:3,gap:.8},{x:1000,enemy:'knife',count:2,gap:1.2},{x:1350,enemy:'gunman',count:2,gap:1},{x:1700,enemy:'drone',count:2,gap:1.4,side:'top'},
    {x:2150,enemy:'grunt',count:2,gap:.9,side:'l'},{x:2150,enemy:'grunt',count:2,gap:.9},
    {lock:'A',enemy:'grunt',count:4,gap:1},{lock:'A',enemy:'gunman',count:2,gap:2,delay:2},{lock:'A',enemy:'knife',count:2,gap:1.5,side:'l',delay:4},{lock:'A',enemy:'shield',count:1,delay:6},
    {x:3300,enemy:'turret',count:1,side:'at',at:3700},{x:3600,enemy:'gunman',count:3,gap:1.1},{x:4000,enemy:'sniper',count:1},{x:4150,enemy:'grunt',count:3,gap:1.1,side:'l'},{x:4300,enemy:'drone',count:3,gap:1,side:'top'},
    {x:5000,enemy:'shield',count:2,gap:2},{x:5400,enemy:'bruiser',count:1},{x:5650,enemy:'gunman',count:2,gap:1.4},{x:5900,enemy:'knife',count:3,gap:1,side:'l'},{x:6200,enemy:'gunman',count:2,gap:1.2},{x:6250,enemy:'drone',count:2,gap:1.5,side:'top'},
    {lock:'B',enemy:'grunt',count:3,gap:1.2},{lock:'B',enemy:'mech',count:1,delay:3},{lock:'B',enemy:'knife',count:2,gap:1,side:'l',delay:7},
    {x:7400,enemy:'bruiser',count:1},{x:7400,enemy:'grunt',count:3,gap:1},{x:7900,enemy:'turret',count:1,side:'at',at:8250},{x:8300,enemy:'shield',count:2,gap:1.5},{x:8300,enemy:'gunman',count:2,gap:1.5,delay:1},
    {x:8750,enemy:'grunt',count:3,gap:1.2,side:'l'},{x:9000,enemy:'knife',count:2,gap:1.3},
    {lock:'C',enemy:'gunman',count:3,gap:1.6},{lock:'C',enemy:'shield',count:2,gap:3,delay:5},{lock:'C',enemy:'drone',count:3,gap:1.6,side:'top',delay:9},{lock:'C',enemy:'bruiser',count:1,delay:14},{lock:'C',enemy:'knife',count:3,gap:1.6,side:'l',delay:19},{lock:'C',enemy:'grunt',count:3,gap:1.5,delay:24}],
  locks:[{id:'A',x:2750},{id:'B',x:6850},{id:'C',x:9450}],
  boss:{x:10500,id:'warden'},
  tale:{before:[['dispatch','The drop is inside the Zeil underpass. No ship fits down there.'],['courier','Then I walk. Keep the beat in my ear.']],
    after:[['mechanic','You came back on your own legs. Lumen will remember that face.'],['dispatch','Ship is warm, Courier. Back to the sky.']]}}};
/* built-in fallback enemies (used for any id FOOT_ENEMIES does not have yet): a walking box that shoots */
const FB={grunt:{hp:3,w:30,h:62,sp:95,fire:3.2,c:'#d0485a',score:100,want:230},gunman:{hp:4,w:30,h:64,sp:70,fire:2.4,c:'#e07a2a',score:150,want:300},
  shield:{hp:7,w:36,h:66,sp:50,fire:2.8,c:'#7a8aa0',score:250,want:160,front:1},bruiser:{hp:16,w:46,h:80,sp:80,fire:9,c:'#a03050',score:400,melee:1},
  knife:{hp:2,w:26,h:58,sp:190,fire:1.2,c:'#ff4a9a',score:120,melee:1},sniper:{hp:3,w:28,h:64,sp:0,fire:3.6,c:'#c0d040',score:250,want:420,still:1,bs:520},
  drone:{hp:2,w:34,h:22,sp:110,fire:4.5,c:'#40c0ff',score:120,fly:1},turret:{hp:8,w:40,h:40,sp:0,fire:1.6,c:'#909090',score:200,still:1},
  mech:{hp:26,w:70,h:100,sp:45,fire:2.3,c:'#8050c0',score:800,want:260,fan:3},
  warden:{hp:110,w:90,h:130,sp:70,fire:1.6,c:'#ff2050',score:5000,want:240,fan:3,phases:[{hp:.66},{hp:.33}]}};
const DROPS=['w_hmg','w_shot','w_flame','w_rocket','w_arc','heal','bomb','shield','speed','dbl','magnet','slow'];
const PROPD={crate:{hp:3,w:44,h:40,c:'#7a5a30',dr:['w_hmg','w_shot','w_rocket','w_flame','w_arc','w_hmg']},sign:{hp:2,w:70,h:34,y:150,c:'#ff2d95',dr:['dbl','magnet','shield','slow','speed']},
  vend:{hp:5,w:44,h:84,c:'#2a8ad0',dr:['heal','bomb','speed','heal']},door:{hp:6,w:52,h:96,c:'#405060',dr:['w_rocket','w_arc','w_shot','shield']}};
let SV=(()=>{try{const o=JSON.parse(localStorage.getItem(SKEY)||'{}');return o&&typeof o==='object'&&!Array.isArray(o)?o:{};}catch(e){return{};}})();
SV.best=SV.best&&typeof SV.best==='object'?SV.best:{};SV.clr=SV.clr&&typeof SV.clr==='object'?SV.clr:{};SV.seen=SV.seen&&typeof SV.seen==='object'?SV.seen:{};
const svSave=()=>{try{localStorage.setItem(SKEY,JSON.stringify(SV));}catch(e){}};
if(RET.sioKeys&&RET.sioKeys.indexOf(SKEY)<0)RET.sioKeys.push(SKEY);
const ftRnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>v<a?a:v>b?b:v;
const diffK=()=>FDIFF[(window.SET&&SET.diff)]||FDIFF.normal;
const reduce=()=>!!(window.SET&&(SET.reduce||SET.rm));
const ftUnlocked=()=>{try{return (sSave.stars[3]|0)>=1||!!sSave.all;}catch(e){return false;}};
const F={on:false,STAGES,WEAPONS,PICKUPS,FDIFF,FB,unlocked:ftUnlocked,save:()=>SV,ctl:null,S:null,start,stop,sim,step:null,layout:null};
let S=null,L=null,raf=0,lastT=0;
const I={x:0,y:0,l:0,r:0,u:0,d:0,fire:0,jump:0,melee:0,dash:0,bomb:0,jumpP:0,meleeP:0,dashP:0,bombP:0,stick:0};

/* ===== run state ===== */
function newRun(id,fromCp){const st=STAGES[id],D=diffK(),old=S;
  const hearts=D.hearts+(RET.asHullN?Math.min(2,RET.asHullN()|0):0);
  S={id,st,D,time:0,score:0,kills:0,hurts:0,camX:0,lock:null,lockDone:{},bossOn:false,boss:null,win:0,dead:0,end:null,paused:false,
    P:{x:120,y:FL,w:28,h:64,vx:0,vy:0,onGround:true,facing:1,crouch:false,hp:hearts,max:hearts,inv:1.2,dash:0,dashCd:0,dashIF:0,mel:0,melCd:0,cd:0,
      w:'pistol',lv:1,ammo:Infinity,bombs:2,pw:{},aim:0,jh:0,maxX:120,idle:0,anim:0,shotT:0,hurtT:0},
    E:[],pb:[],eb:[],q:[],pk:[],pr:[],fx:[],pop:[],bombsL:[],waves:st.waves.map((w,i)=>Object.assign({i,done:false,left:w.count,next:0,started:false},w)),
    fever:0,feverT:0,hs:0,shake:0,lhb:null,note:{t:0,txt:''},cp:null,cpUsed:!!fromCp,assist:!!(RET.assistActive&&RET.assistActive()),lockedIds:{},idleSpawn:0,hintT:0,moved:0,shots:0};
  S.pk=(st.pk||[]).map(([x,k])=>({k,x,y:FL-16,vy:0,t:0,on:true,fix:1}));
  S.pr=st.props.map(([x,k],i)=>{const d=PROPD[k];return{x,y:d.y||FL,k,hp:d.hp,w:d.w,h:d.h,c:d.c,i,fl:0};});
  if(fromCp&&old&&old.cp){const c=old.cp,cpx=c.x!=null?c.x:st.cp;S.cpN=c.n|0;S.P.x=cpx+40;S.P.maxX=S.P.x;S.camX=Math.max(0,cpx-120);S.score=c.score;S.time=c.time;S.kills=c.kills;S.hurts=c.hurts;S.cp=c;
    for(const w of S.waves)if(w.lock?(st.locks.find(l=>l.id===w.lock)||{x:0}).x<cpx:w.x<cpx+200)w.done=true;
    for(const l of st.locks)if(l.x<cpx)S.lockDone[l.id]=1;S.pr=S.pr.filter(p=>p.x>cpx);S.pk=S.pk.filter(p=>p.x>cpx);S.P.w=c.w;S.P.lv=c.lv;S.P.ammo=c.ammo;S.P.bombs=Math.max(2,c.bombs);}
  F.S=S;return S;}
const viewW=()=>L?L.vw:960;
function note(t,s){S.note={t:s||2.2,txt:t};}
function pop(x,y,t,c,big){S.pop.push({x,y,t,c:c||'#fff',l:big?1.4:.9,m:big?1.4:.9,big:!!big});if(S.pop.length>40)S.pop.shift();}
function ftBurst(x,y,c,n,sp){if(S.fx.length>260)return;for(let i=0;i<n;i++){const a=ftRnd(0,6.283),v=ftRnd(.3,1)*(sp||260);S.fx.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-80,l:ftRnd(.25,.6),c,r:ftRnd(2,4)});}}
function hitstop(ms){if(!RET.juice||reduce())return;S.hs=Math.max(S.hs,ms/1000);}
function ftShake(v){if(reduce())return;S.shake=Math.max(S.shake,window.COM?COM.sk(v):v);}
const SFXID={shot:'f_shot',hit:'f_hit',pick:'f_pick',big:'f_big',hurt:'f_hurt',dash:'f_dash',graze:'f_graze',warn:'f_warn',up:'f_up',tier:'f_fever'};   // LAB (ON FOOT group of the SOUND page): each on-foot sound has its own switch
// 22 Oct: 'window.AU' is undefined (AU is a script-level const), so these three calls never ran: no on-foot sound, no stage song. They use AU directly now, each behind its ON FOOT switch.
const sndF=id=>!window.sndOn||sndOn(id);
function sfx(n){try{if(!sndF(SFXID[n]||'f_'+n))return;if(typeof AU!=='undefined'&&AU.sfx)AU.sfx(n);}catch(e){}}
/* the song's beat: bpos() from a.js when the beat clock runs, else our own 120 bpm clock */
function beatPos(){try{if(typeof bpos==='function'&&typeof BT!=='undefined'&&BT.mode!=='none'){const p=bpos(performance.now());if(isFinite(p))return p;}}catch(e){}return S?S.time*2:0;}
function ftOnBeat(){const p=beatPos(),f=Math.abs(p-Math.round(p)),spb=(typeof BT!=='undefined'&&BT.spb)||.5,win=.11+((RET.asWinMs&&RET.asWinMs())||0)/1000;return f*spb<win;}

/* ===== enemies ===== */
function edef(id,boss){const R=boss?window.FOOT_BOSS:window.FOOT_ENEMIES;const d=R&&R[id];if(d&&typeof d.ai==='function')return d;return fbDef(id);}
const fbCache={};
function fbDef(id){if(fbCache[id])return fbCache[id];const b=FB[id]||FB.grunt;
  const d=Object.assign({},b,{fb:1,drops:DROPS,pose:e=>e.dead?'die':e.flash>0?'hit':e.wind>0?'melee':Math.abs(e.vx)>5?(BK(e.t,6)?'run-a':'run-b'):e.tele>0?'shoot':'idle',
    ai(e,dt,env){const P=env.P,dx=P.x-e.x,ad=Math.abs(dx);e.facing=dx<0?-1:1;const D=env.D;
      if(b.fly){if(e.ph==null)e.ph=ftRnd(0,6.28);const G=env.G,tx=clamp(P.x+Math.sin(e.t*.9+e.ph)*230,G.camX+50,G.camX+G.viewW-50)-e.x;e.facing=dx<0?-1:1;e.vx=Math.sign(tx)*Math.min(b.sp,Math.abs(tx)*1.5);e.vy=((e.hy||140)+Math.sin(e.t*2.2)*28-e.y)*2.2;}
      else if(!b.still){if(e.wj==null)e.wj=ftRnd(-70,70);const want=b.melee?0:(b.want||220)+e.wj;e.vx=ad>want+30?Math.sign(dx)*b.sp:(!b.melee&&ad<want-80?-Math.sign(dx)*b.sp*.5:0);
        if(e.wind>0)e.vx=0;}
      e.cd=(e.cd==null?ftRnd(.6,1.4):e.cd)-dt;
      if(e.wind>0){e.wind-=dt;if(e.wind<=0){const r={x:e.x+e.facing*(e.w/2),y:e.y-e.h,w:b.w>40?70:46,h:e.h};if(e.facing<0)r.x-=r.w;env.melee(e,r,1);e.cd=b.fire/D.fr;}return;}
      if(e.cd>0)return;e.cd=b.fire/D.fr*ftRnd(.85,1.2);
      if(b.melee){if(ad<(b.w>40?95:70)&&Math.abs(P.y-e.y)<60){e.wind=TELE+.05;}else if(b.w>40){env.shoot(e,Math.atan2(-.35,Math.sign(dx)),330,1,{grav:1});}return;}
      if(b.fly){if(ad<90)env.shoot(e,Math.PI/2,160,1,{grav:0,c:'#ffb020',r:7});else e.cd=.3;return;}   // drones drop slow bombs straight down when over you
      const sy=e.y-e.h*.62,a=Math.atan2(P.y-P.h*.55-sy,dx),n=(b.fan||1)+(e.phase||0);
      for(let i=0;i<n;i++)env.shoot(e,a+(i-(n-1)/2)*.2,b.bs||240,1);
      if(id==='warden'&&e.phase>=1&&Math.random()<.4){env.shoot(e,-Math.PI/2+e.facing*.6,420,1,{grav:1});}}});
  return fbCache[id]=d;}
function spawn(id,x,y,o){const boss=!!(o&&o.boss),d=o&&o.fb?fbDef(id):edef(id,boss),D=S.D;
  const ext=!d.fb,e={id,def:d,ext,x,y:y==null?FL:y,vx:0,vy:0,w:d.w||30,h:d.h||60,hp:(d.hp||3)*D.hp*(ext&&boss?.3:1),t:0,state:'in',facing:x>S.P.x?-1:1,flash:0,tele:0,grace:GRACE,boss,phase:0,lock:o&&o.lock,fly:!!d.fly};
  e.max=e.maxHp=e.mhp=e.hp;if(ext&&(d.flyer||d.fly))e.fly=true;if(ext&&e.fly&&y==null)e.y=FL-200;if(e.fly)e.hy=ftRnd(110,190);S.E.push(e);if(boss)S.boss=e;return e;}
function envG(){const G=S.G||(S.G={ftok:[],airTop:80,airBottom:FL-150,obs:[]});const bp=beatPos(),spb=(typeof BT!=='undefined'&&BT.spb)||.5;
  Object.assign(G,{time:S.time,floorY:FL,camX:S.camX,viewW:viewW(),eb:S.eb,beat:bp,beatLen:spb,bpm:60/spb});G.obs=S.pr.filter(p=>p.hp>0&&p.k==='crate').map(p=>({x:p.x-p.w/2,w:p.w,h:p.h}));return G;}
const env={get P(){return S.P;},get G(){return S.G||envG();},get D(){return S.D;},rnd:ftRnd,
  fx(n,x,y){if(S&&/clang|shield|block/.test(n))AH.ftPush(S.fx,'fx-ft-shield-hit',x,y,60,.25);if(S)ftBurst(x,y,/break|wall/.test(n)?'#ccc':/phase|exposed/.test(n)?'#ffd23a':'#ff4a6a',/die|break|wallbreak|shockring/.test(n)?10:4,200);},
  spawn(t,x,y,o){if(!S||S.E.filter(e=>!e.dead).length>=16)return null;const e=spawn(t,x,y);e.lock=S.lock&&S.lock.id;return e;},
  shoot(e,a,spd,dmg,o){if(!S||S.dead)return;if(e.x<S.camX-10||e.x>S.camX+viewW()+10)return;   // never from off-screen
    if(e.ext){if(S.eb.length>=EBMAX||e.grace>0)return;o=o||{};const sp=(spd||300)*S.D.bs*((RET.asB&&RET.asB())||1),r=o.w||o.h?Math.max(4,Math.min(16,Math.max(o.w||0,o.h||0)/2)):6;
      const mz=F.emz&&!o.ground&&F.emz(e,a),sx=mz?mz[0]:o.ox!=null?o.ox:e.x+e.facing*e.w*.45,sy=o.ground?FL-8:mz?mz[1]:(o.oy!=null?o.oy:e.y-e.h*.62);
      const xb={x:sx,y:sy,vx:o.vx!=null?o.vx:Math.cos(a)*sp,vy:o.ground?0:Math.sin(a)*sp,r,dmg:dmg||1,life:o.life||4,grav:!!o.grav,src:e.id,c:o.kind==='sniper'?'#e8ff40':o.kind==='shock'||o.kind==='shockline'?'#7df9ff':'#ff4a6a',ground:!!o.ground,qt:S.time};if(RET.beatshots&&S.st&&S.st.s3)(S.xq||(S.xq=[])).push(xb);else S.eb.push(xb);return;}   // streetsong: the bullet leaves on the next half beat of the song (like the queued shots below)
    if(S.q.length>=Math.round(QMAX*S.D.fr)&&!(o&&o.must))return;
    const t=Math.max(TELE,(o&&o.tele)||0)+Math.max(0,e.grace||0);e.tele=Math.max(e.tele,t);
    S.q.push({e,a,spd:(spd||340)*S.D.bs*((RET.asB&&RET.asB())||1),dmg:dmg||1,o:o||{},at:S.time+t});},
  melee(e,r,dmg,o){if(e.grace>0||e.dead)return false;const P=S.P,b=pbox(P);let hit=false;if(r.x<b.x+b.w&&r.x+r.w>b.x&&r.y<b.y+b.h&&r.y+r.h>b.y)hit=ftHurt(dmg||1,e.x,'mel:'+e.id);
    if(!e._mfx||S.time-e._mfx>.12){e._mfx=S.time;S.fx.push({slash:1,x:r.x+r.w/2,y:r.y+r.h/2,w:Math.min(r.w,200),l:.15,c:o&&o.beam?'#ff2050':'#ff4a6a'});}return hit;}};
F.env=env;
function pbox(P){const h=P.crouch?40:P.h,bw=S.st.fs?28:P.w;return{x:P.x-bw/2,y:P.y-h,w:bw,h};}   // P.w is the weapon id (the street1 mock keeps its NaN box; footstage stages use the 28 px body)
function ebox(e){return e.ext&&e.fly?{x:e.x-e.w/2,y:e.y-e.h/2,w:e.w,h:e.h}:{x:e.x-e.w/2,y:e.y-e.h,w:e.w,h:e.h};}   // W3 flyers: y = centre
const hittable=e=>!e.dead&&!(e.def.canHit&&e.def.canHit(e)===false);
function circHit(x,y,r,b){const cx=clamp(x,b.x,b.x+b.w),cy=clamp(y,b.y,b.y+b.h);return (x-cx)*(x-cx)+(y-cy)*(y-cy)<=r*r;}
function dmgE(e,d,src){if(!hittable(e))return;const k=(S.P.pw.dbl?[1,2,2.4,2.8][S.P.pw.dbl.lv]:1)*(S.feverT>0?1.25:1);d*=k;
  if(e.def.front&&src&&Math.sign(src.vx||0)===-e.facing&&!src.pierce&&e.def.fb){d*=.4;}   // fallback shield: front blocks most
  e.hp-=d;e.flash=.08;try{e.def.onHit&&e.def.onHit(e,d,env,{x:src&&src.x!=null?src.x-(src.vx||0)*.01:S.P.x,melee:!!(src&&src.melee)});}catch(x){}
  if(e.ext&&e.boss&&e.phase!==e._lp){if(e._lp!=null){hitstop(60);ftShake(10);note('PHASE '+e.phase,1.4);NR.emit('footPhase',{id:e.id,phase:e.phase});}e._lp=e.phase;}
  if(!e.ext&&e.boss&&e.def.phases){const fr=e.hp/e.max;while(e.phase<e.def.phases.length&&fr<=e.def.phases[e.phase].hp){e.phase++;hitstop(60);ftShake(10);note('PHASE '+(e.phase+1),1.4);NR.emit('footPhase',{id:e.id,phase:e.phase});}}
  if(e.hp<=0)ftKill(e);}
function ftKill(e){e.dead=true;const d=e.def,beat=ftOnBeat(),fv=S.feverT>0;let sc=Math.round((d.score||100)*(fv?2:1)*(beat?1.5:1));S.score+=sc;S.kills++;
  pop(e.x,e.y-e.h-8,'+'+sc+(beat?' BEAT':''),beat?'#ffd23a':'#fff');ftBurst(e.x,e.y-e.h/2,d.c||'#f46',e.boss?40:12,e.boss?420:260);if(e.boss)AH.ftPush(S.fx,'fx-boom-ground-dust',e.x,e.y-20,200,.6);else AH.ftPush(S.fx,'fx-ft-blood-spark',e.x,e.y-e.h/2,70,.3);
  if(!fv)S.fever=Math.min(100,S.fever+(beat?14:6));if(S.fever>=100&&S.feverT<=0){S.feverT=8;S.fever=0;note('FEVER!',1.6);sfx('tier');}
  if(e.boss||e.w>60){hitstop(e.boss?60:30);ftShake(e.boss?14:6);}sfx(e.boss?'big':'hit');
  try{d.onDeath&&d.onDeath(e,env);}catch(x){}
  if(e.ext&&Array.isArray(e.dropList)){for(const k of e.dropList)if(PICKUPS[k])drop(k,e.x,e.y-e.h/2);}
  else{const ch=e.boss?1:(e.w>40?.6:.16);if(Math.random()<ch){const L=(d.drops&&d.drops.length?d.drops:DROPS).filter(k=>PICKUPS[k]);if(L.length)drop(L[Math.floor(Math.random()*L.length)],e.x,e.y-e.h/2);}}
  NR.emit('footKill',{id:e.id,boss:!!e.boss,x:e.x,y:e.y});
  if(e.boss){S.win=1.8;S.eb.length=0;S.q.length=0;note('WARDEN DOWN',2);for(const o of S.E)if(!o.dead&&o!==e){o.dead=true;ftBurst(o.x,o.y-o.h/2,'#fff',8);}}}
function drop(k,x,y){S.pk.push({k,x,y,vy:-260,t:0,on:false});}

/* ===== player ===== */
function wstat(id,lv){const w=WEAPONS[id],m=1+.22*(lv-1);return{dmg:w.dmg*m,rate:w.rate*(1+.12*(lv-1))*(S.feverT>0?1.4:1),w};}
function aimAngle(P){const up=I.u||I.y<-.5,dn=I.d||I.y>.5,mx=I.r?1:I.l?-1:(Math.abs(I.x)>.35?Math.sign(I.x):0);
  if(up)return mx?(mx>0?-Math.PI/4:-Math.PI*3/4):-Math.PI/2;
  if(dn&&!P.onGround)return mx?(mx>0?Math.PI/4:Math.PI*3/4):Math.PI/2;
  return P.facing>0?0:Math.PI;}
function aimAssist(P,a,ox,oy){let best=a,bd=S.st.aimCone||.3;for(const e of S.E){if(e.dead||!e.seen)continue;const dx=e.x-ox,dy=e.y-e.h/2-oy;if(dx*dx+dy*dy>640*640)continue;let d=Math.atan2(dy,dx)-a;while(d>Math.PI)d-=6.283;while(d<-Math.PI)d+=6.283;if(Math.abs(d)<bd){bd=Math.abs(d);best=a+d;}}return best;}   // 8-way aim + a small cone (0.3 rad) toward the closest enemy in it
/* auto-fire (touch default): shoot while an enemy (or a floor prop) is on screen on the side you face, or above you when the stick aims up */
function autoTarget(P){const up=I.u||I.y<-.5,vw=viewW(),fc=P.facing;
  for(const e of S.E){if(e.dead||!e.seen||!hittable(e))continue;const dx=(e.x-P.x)*fc;if(Math.abs(e.x-P.x)>vw)continue;if(dx>-20||(up&&Math.abs(e.x-P.x)<260&&e.y-e.h/2<P.y-70))return true;}
  for(const p of S.pr){if(p.hp<=0)continue;const dx=(p.x-P.x)*fc;if(dx>10&&dx<300&&p.x>S.camX&&p.x<S.camX+vw&&(p.y>=FL-1||up))return true;}
  return false;}
function fire(P){const s=wstat(P.w,P.lv),w=s.w,lv=P.lv,a0=aimAngle(P),a1=aimAssist(P,a0,P.x,P.y-(P.crouch?26:44)),a=P.aim=F.aimX?F.aimX(P,a1,a0):a1,ox0=P.x+Math.cos(a)*18,oy0=P.y-(P.crouch?26:44)+Math.sin(a)*14,mz=F.mz&&F.mz(P,a),ox=mz?mz[0]:ox0,oy=mz?mz[1]:oy0;   // streetfeel.js: from the drawn gun's muzzle
  S.shots++;P.shotT=.12;const pr=(t)=>({x:ox,y:oy,wid:P.w,dmg:s.dmg,kind:w.kind,life:w.life||1.2,c:w.c,r:4,pierce:0,hit:[],t:0,...t});
  if(w.kind==='bul'){const sp=(w.spr||0)*(1-.12*(lv-1)),n=(P.w==='hmg'&&lv>=5)?2:(P.w==='pistol'&&lv>=3?2:1);
    for(let i=0;i<n;i++){const aa=a+ftRnd(-sp,sp)+(n>1?(i-.5)*.08:0);S.pb.push(pr({vx:Math.cos(aa)*w.spd,vy:Math.sin(aa)*w.spd,pierce:(P.w==='hmg'&&lv>=3)?1:0}));}}
  else if(w.kind==='pel'){const n=w.pel+(lv>=3?2:0);for(let i=0;i<n;i++){const aa=a+(i-(n-1)/2)*(w.spr/n)*2+ftRnd(-.03,.03),v=w.spd*ftRnd(.85,1.1);S.pb.push(pr({vx:Math.cos(aa)*v,vy:Math.sin(aa)*v,r:4,pierce:lv>=5?1:0,kb:lv>=5?220:60}));}ftShake(2);}
  else if(w.kind==='fire'){const v=w.spd*(lv>=3?1.4:1)*ftRnd(.9,1.1),aa=a+ftRnd(-.12,.12);S.pb.push(pr({vx:Math.cos(aa)*v,vy:Math.sin(aa)*v,r:7,pierce:9,life:w.life*(lv>=3?1.3:1),burn:lv>=5}));}
  else if(w.kind==='rkt'){S.pb.push(pr({vx:Math.cos(a)*w.spd,vy:Math.sin(a)*w.spd,r:6,rad:w.rad*(lv>=3?1.45:1),hom:lv>=5,life:2}));sfx('shot');}
  else if(w.kind==='arc'){arcShot(P,ox,oy,a,s.dmg,lv);}
  if(P.ammo!==Infinity){P.ammo--;if(P.ammo<=0){note(w.n+' EMPTY',1.2);setW(P,'pistol',1,Infinity,false);}}}
function arcShot(P,ox,oy,a,dmg,lv){const R=WEAPONS.arc.range,dx=Math.cos(a),dy=Math.sin(a);let best=null,bt=R;
  for(const e of S.E){if(e.dead)continue;const b=ebox(e),cx=e.x-ox,cy=e.y-e.h/2-oy,t=cx*dx+cy*dy;if(t<0||t>bt)continue;const px=ox+dx*t,py=oy+dy*t;if(circHit(px,py,18,b)){best=e;bt=t;}}
  const pts=[[ox,oy]];if(!best){pts.push([ox+dx*R,oy+dy*R]);}else{let cur=best,n=lv>=5?4:lv>=3?2:0;const seen=[cur];pts.push([cur.x,cur.y-cur.h/2]);dmgE(cur,dmg,{});
    while(n-->0){let nx=null,nd=180;for(const e of S.E){if(e.dead||seen.indexOf(e)>=0)continue;const d=Math.hypot(e.x-cur.x,e.y-cur.y);if(d<nd){nd=d;nx=e;}}if(!nx)break;seen.push(nx);pts.push([nx.x,nx.y-nx.h/2]);dmgE(nx,dmg*.7,{});cur=nx;}}
  S.fx.push({arc:pts,l:.09,c:'#7df9ff'});}
function setW(P,id,lv,ammo,up){const old=P.w,ol=P.lv;P.w=id;P.lv=lv;P.ammo=ammo;if(old!==id||ol!==lv)NR.emit('footLevel',{w:id,lv,up:up!==undefined?up:(lv>ol||old!==id)});}
function pickW(P,id){const w=WEAPONS[id];if(P.w===id){const nl=Math.min(WMAX,P.lv+1);const up=nl>P.lv;P.lv=nl;P.ammo+=w.ammo;
    pop(P.x,P.y-90,w.n+' LV'+nl+(nl===3?' '+w.t3:nl===5?' '+w.t5:''),w.c,true);if(up)NR.emit('footLevel',{w:id,lv:nl,up:true});}
  else{setW(P,id,1,w.ammo);pop(P.x,P.y-90,w.n,w.c,true);}}
function collect(p){const P=S.P,d=PICKUPS[p.k];sfx('pick');let lv=1;
  if(d.w)pickW(P,d.w);
  else if(p.k==='heal'){if(P.hp<P.max){P.hp++;pop(P.x,P.y-90,'+1 HEART','#ff6070',true);}else{S.score+=300;pop(P.x,P.y-90,'+300','#ff6070',true);}}
  else if(p.k==='ammo'){const w=WEAPONS[P.w];if(P.ammo!==Infinity){P.ammo+=Math.ceil(w.ammo*.6);pop(P.x,P.y-90,w.n+' AMMO','#ffe08a',true);}else{P.bombs=Math.min(9,P.bombs+1);pop(P.x,P.y-90,'+1 BOMB','#ffb020',true);}}
  else if(p.k==='bomb'){P.bombs=Math.min(9,P.bombs+1);pop(P.x,P.y-90,'+1 BOMB','#ffb020',true);}
  else{const c=P.pw[p.k];lv=c?Math.min(d.max,c.lv+1):1;P.pw[p.k]={lv,t:d.t+(p.k==='slow'?1.5*(lv-1):0)};pop(P.x,P.y-90,d.n+(d.max>1?' LV'+lv:''),d.c,true);}
  NR.emit('footPick',{id:p.k,lv});}
function ftHurt(n,fromX,src){const P=S.P;if(P.inv>0||P.dashIF>0||S.win||P.hp<=0)return false;
  if(P.pw.shield&&P.pw.shield.lv>0){P.pw.shield.lv--;if(!P.pw.shield.lv)delete P.pw.shield;P.inv=.6;pop(P.x,P.y-80,'BLOCK','#5ad1ff');sfx('graze');return false;}
  P.hp-=n*S.D.dmg;S.hurts++;(S.hlog=S.hlog||[]).push(src||'?');P.inv=1.3;P.hurtT=.35;P.vx=0;P.vy=-280;P.onGround=false;P.kx=(P.x<(fromX==null?P.x+1:fromX)?-1:1)*240;
  sfx('hurt');ftShake(8);hitstop(40);ftBurst(P.x,P.y-40,'#ff4060',10);
  if(P.w!=='pistol'){const nl=P.lv-1;if(nl<1){pop(P.x,P.y-96,WEAPONS[P.w].n+' LOST','#ff4060');setW(P,'pistol',1,Infinity,false);}else{setW(P,P.w,nl,P.ammo,false);pop(P.x,P.y-96,WEAPONS[P.w].n+' LV'+nl,'#ff4060');}}
  if(P.hp<=0){P.hp=0;S.dead=1.4;note('DOWN',2);NR.emit('footDown',{stage:S.id});}
  return true;}
function bomb(P){if(P.bombs<=0)return;P.bombs--;S.bombsL.push({x:P.x+P.facing*10,y:P.y-50,vx:P.facing*380+P.vx*.4,vy:-420,t:0});}
function boom(x,y,rad,dmg){AH.ftPush(S.fx,'fx-ft-rocket-hit',x,y,rad*2.4,.35);if(y>=FL-30)AH.ftPush(S.fx,'fx-boom-ground-dust',x,y-10,rad*2,.5);ftBurst(x,y,'#ffb020',24,380);ftBurst(x,y,'#fff',8,200);ftShake(9);sfx('boom');S.fx.push({ring:1,x,y,r:rad,l:.3,m:.3,c:'#ffb020'});
  for(const e of S.E)if(!e.dead&&circHit(x,y,rad,ebox(e)))dmgE(e,dmg,{pierce:1});
  for(const p of S.pr)if(p.hp>0&&circHit(x,y,rad,{x:p.x-p.w/2,y:p.y-p.h,w:p.w,h:p.h}))hitProp(p,dmg);
  for(let i=S.eb.length-1;i>=0;i--){const b=S.eb[i];if(Math.hypot(b.x-x,b.y-y)<rad)S.eb.splice(i,1);}}
function hitProp(p,d){p.hp-=d;p.fl=.08;if(p.hp<=0&&!p.gone){p.gone=1;ftBurst(p.x,p.y-p.h/2,p.c,14);S.score+=50;pop(p.x,p.y-p.h,'+50','#ccc');const D=p.dr||PROPD[p.k].dr;if(D.length)drop(D[p.i%D.length],p.x,p.y-p.h/2);if(p.onBreak)p.onBreak(p);sfx('hit');}}   // street2: p.dr = own rewards ([] = none), p.onBreak = debris / blast

function stepPlayer(dt){const P=S.P;if(P.hp<=0){P.vx*=.9;P.vy+=GRAV*dt;P.y=Math.min(FL,P.y+P.vy*dt);return;}
  const mx=I.r?1:I.l?-1:(Math.abs(I.x)>.25?clamp(I.x*1.4,-1,1):0),spdLv=P.pw.speed?P.pw.speed.lv:0,spd=230*(1+.15*spdLv);
  P.crouch=P.onGround&&(I.d||I.y>.6)&&P.dash<=0;
  if(mx)P.facing=mx>0?1:-1;else if(F.look&&F.look.face&&autoOn())F.look.face(P,hittable);   // streetlook: auto-fire turns to a target behind
  for(const k of ['inv','dashCd','dashIF','melCd','cd','shotT','hurtT'])if(P[k]>0)P[k]-=dt;
  if(I.dashP&&P.dashCd<=0){const beat=ftOnBeat();AH.ftPush(S.fx,'fx-ft-dust',P.x,P.y-6,64,.35);P.dash=.24;P.dashCd=.75/(1+.25*spdLv);P.dashIF=beat?.45:.26;P.vy=Math.min(P.vy,0);
    if(beat){pop(P.x,P.y-80,'ON BEAT','#ffd23a');S.fever=Math.min(100,S.fever+12);NR.emit('footBeat',{kind:'dash'});}sfx('dash');}
  if(P.dash>0){P.dash-=dt;P.vx=P.facing*600;}
  else if(P.hurtT>0){P.vx=P.kx||0;}
  else P.vx=P.crouch?0:mx*spd;
  if(I.jumpP&&P.onGround){P.vy=-740;P.onGround=false;P.jh=1;sfx('dash');}
  if(!I.jump&&P.vy<-260&&P.jh){P.vy=-260;P.jh=0;}   // variable height: let go early = short hop
  P.vy+=GRAV*dt;const oy=P.y;P.x+=P.vx*dt;P.y+=P.vy*dt;P.onGround=false;
  if(P.y>=FL){P.y=FL;P.vy=0;P.onGround=true;}
  else if(P.vy>=0&&!(I.d&&I.jumpP))for(const [px,py,pw] of S.st.plats)if(P.x>px-6&&P.x<px+pw+6&&oy<=py+1&&P.y>=py){P.y=py;P.vy=0;P.onGround=true;break;}
  const lo=S.camX+16,hi=S.camX+viewW()-16;P.x=clamp(P.x,lo,hi);
  if(P.x>P.maxX+2){S.moved+=P.x-P.maxX;P.maxX=P.x;P.idle=0;}else P.idle+=dt;
  if((I.fire||(autoOn()&&autoTarget(P)))&&P.cd<=0&&!S.win){fire(P);P.cd=1/wstat(P.w,P.lv).rate;}
  if(I.meleeP&&P.melCd<=0){P.mel=.2;P.melCd=.35;const r={x:P.facing>0?P.x:P.x-62,y:P.y-(P.crouch?44:64),w:62,h:P.crouch?44:64};let hit=0;
    for(const e of S.E)if(hittable(e)){const b=ebox(e);if(r.x<b.x+b.w&&r.x+r.w>b.x&&r.y<b.y+b.h&&r.y+r.h>b.y){dmgE(e,3,{pierce:1,melee:true,x:P.x});hit++;}}
    for(const p of S.pr)if(p.hp>0&&r.x<p.x+p.w/2&&r.x+r.w>p.x-p.w/2&&r.y<p.y&&r.y+r.h>p.y-p.h)hitProp(p,2);
    for(let i=S.eb.length-1;i>=0;i--){const b=S.eb[i];if(b.x>r.x&&b.x<r.x+r.w&&b.y>r.y&&b.y<r.y+r.h){S.eb.splice(i,1);hit++;}}   // the knife cuts bullets
    S.fx.push({slash:1,x:r.x+r.w/2,y:r.y+r.h/2,w:r.w,l:.15,c:'#e8f6ff'});if(hit)hitstop(25);sfx('graze');}
  if(P.mel>0)P.mel-=dt;
  if(I.bombP)bomb(P);
  for(const k of PW_KEYS){const c=P.pw[k];if(c){c.t-=dt;if(c.t<=0)delete P.pw[k];}}
  P.anim+=dt*(Math.abs(P.vx)>5?1:0);}

/* ===== the stage: camera, locks, waves, idle pressure, boss ===== */
function stepStage(dt){const st=S.st,P=S.P,vw=viewW();
  let want=Math.max(S.camX,P.x-vw*(F.camK||.38));if(F.look&&F.look.back)want=F.look.back(S,P,vw,want);   // streetlook: walk back up to 35% of the viewwant=Math.min(want,st.len-vw);
  if(!S.lock)for(const l of st.locks)if(!S.lockDone[l.id]&&want>=l.x-vw/2){S.lock={id:l.id,cam:l.x-vw/2};note('ARENA LOCK',1.6);sfx('warn');for(const w of S.waves)if(w.lock===l.id)w.started=true,w.next=S.time+(w.delay||0);break;}
  const bc=Math.min(st.boss.x-vw/2,st.len-vw);if(!S.lock&&!S.bossOn&&want>=bc-1){S.bossOn=true;S.lock={id:'boss',cam:bc};S.bossAt=S.time+1.6;note('WARNING: WARDEN',1.8);sfx('warn');S.eb.length=0;}
  if(S.lock)want=Math.min(want,S.lock.cam);
  S.camX+=(want-S.camX)*Math.min(1,dt*8);if(Math.abs(want-S.camX)<.5)S.camX=want;
  if(S.lock&&S.lock.id!=='boss'){const left=S.E.some(e=>!e.dead&&e.lock===S.lock.id)||S.waves.some(w=>w.lock===S.lock.id&&!w.done);
    if(!left){S.lockDone[S.lock.id]=1;S.lock=null;note('GO  ▶',1.5);sfx('up');}}
  if(S.bossOn&&!S.boss&&S.time>=S.bossAt){const b=spawn(st.boss.id,S.camX+vw-70,FL,{boss:true});b.grace=1.2;}
  if(st.cps){const k=S.cpN|0;if(k<st.cps.length&&P.x>=st.cps[k]&&!S.lock){S.cpN=k+1;S.cp={x:st.cps[k],n:k+1,score:S.score,time:S.time,kills:S.kills,hurts:S.hurts,w:P.w,lv:P.lv,ammo:P.ammo,bombs:P.bombs};note('CHECKPOINT',1.6);sfx('up');NR.emit('footCp',{stage:S.id,n:k+1});if(P.hp<P.max)P.hp++;}}
  else if(!S.cp&&P.x>=st.cp){S.cp={score:S.score,time:S.time,kills:S.kills,hurts:S.hurts,w:P.w,lv:P.lv,ammo:P.ammo,bombs:P.bombs};note('CHECKPOINT',1.6);sfx('up');NR.emit('footCp',{stage:S.id});
    if(P.hp<P.max)P.hp++;}
  const edge=S.camX+vw;
  for(const w of S.waves){if(w.done)continue;
    if(!w.started){if(w.lock||edge<w.x)continue;w.started=true;w.next=S.time+(w.delay||0);}
    if(S.time<w.next)continue;
    if(S.E.filter(e=>!e.dead).length>=14){w.next=S.time+.5;continue;}
    const side=w.side||'r';let x,y=null;
    if(side==='l')x=S.camX-40;else if(side==='at')x=w.at+(w.count-w.left)*90;else if(side==='top'){x=S.camX+ftRnd(.35,.95)*vw;y=-30;}else x=edge+40;
    const e=spawn(w.enemy,x,y,{lock:w.lock});if(side==='top'){e.fly=true;e.y=-30;}
    w.left--;w.next=S.time+(w.gap||1);if(w.left<=0)w.done=true;}
  // idle pressure: standing still never wins. After 7 s without progress, gangs walk in from both sides and keep coming faster.
  if(!S.lock&&!S.bossOn&&P.idle>7&&S.time>=S.idleSpawn&&S.E.filter(e=>!e.dead).length<(P.idle>20?10:3)){S.idleSpawn=S.time+Math.max(1.4,4-P.idle*.06);
    spawn('grunt',Math.random()<.5?S.camX-40:edge+40,null,{fb:1});if(P.idle>16)spawn('gunman',edge+40,null,{fb:1});}}   // built-in walkers: they always come to you
function stepEnemies(dt){const P=S.P,slow=P.pw.slow?.45:1,edt=dt*slow*((RET.asW&&RET.asW())||1)*(S.st.hook&&S.st.hook.agg?S.st.hook.agg(S):1);
  envG();
  for(const e of S.E){if(e.dead){if(e.ext&&!e.remove){e.dt_=(e.dt_||0)+edt;try{e.def.ai(e,edt,env);}catch(x){e.remove=true;}if(e.dt_>1.2)e.remove=true;}continue;}e.t+=edt;if(e.flash>0)e.flash-=dt;if(e.grace>0)e.grace-=edt;if(e.tele>0)e.tele-=edt;
    try{e.def.ai(e,edt,env);}catch(x){if(!e._err){e._err=1;console.warn('foot ai',e.id,x);}e.def=fbDef(e.id);}
    if(!e.ext){if(!e.fly)e.vy+=GRAV*edt;e.x+=e.vx*edt;e.y+=e.vy*edt;}   // W3's ai moves its enemies itself
    if(!e.fly&&e.y>=FL){e.y=FL;e.vy=0;e.onGround=true;}
    const vw=viewW();if(!e.seen&&e.x>S.camX+e.w/2&&e.x<S.camX+vw-e.w/2)e.seen=1;   // once on screen, an enemy stays on screen (no shooting from the dark)
    if(e.seen||e.boss)e.x=clamp(e.x,S.camX+e.w/2,S.camX+vw-e.w/2);
    else if(e.t>.3){const lo=S.camX+e.w/2,hi=S.camX+vw-e.w/2;if(e.x>hi)e.x-=90*edt;else if(e.x<lo)e.x+=90*edt;}   // walk in even if the ai wants to stand back
    if(e.fly&&!e.ext&&e.y>FL-20){e.y=FL-20;}
    if(e.burn>0){e.burn-=dt;e.bt=(e.bt||0)-dt;if(e.bt<=0){e.bt=.25;dmgE(e,.4,{pierce:1});}}
    if(!e.boss&&(e.x<S.camX-400||e.x>S.camX+viewW()+600))e.dead=true,e.gone=1;
    if(!e.dead){const b=ebox(e),pb_=pbox(P);if(e.def.touch!==0&&!e.fly&&b.x<pb_.x+pb_.w&&b.x+b.w>pb_.x&&b.y<pb_.y+pb_.h&&b.y+b.h>pb_.y&&e.grace<=0&&e.w>40)ftHurt(1,e.x,'touch:'+e.id);}}
  S.E=S.E.filter(e=>!e.dead||e===S.boss||(e.ext&&!e.remove&&!e.gone));
  // queued enemy shots: released on the next half beat once their telegraph is over
  const hb=Math.floor(beatPos()*2);if(S.lhb===null)S.lhb=hb;
  if(S.xq&&S.xq.length&&(hb!==S.lhb||S.time-S.xq[0].qt>.45)){   // .45 s: never later than a half beat at 66 bpm (stepped tests run the game faster than the song clock)
  for(const b of S.xq)if(S.eb.length<EBMAX)S.eb.push(b);S.xq=[];}
  if(hb!==S.lhb||S.q.some(s=>S.time-s.at>.6)){S.lhb=hb;const keep=[];
    for(const s of S.q){if(s.e.dead){continue;}if(S.time<s.at&&!(S.time-s.at>.6)){keep.push(s);continue;}
      if(S.eb.length>=EBMAX)continue;const e=s.e,sy=s.o.y!=null?s.o.y:e.y-e.h*.62,sx=e.x+e.facing*e.w*.4;
      S.eb.push({x:sx,y:sy,vx:Math.cos(s.a)*s.spd,vy:Math.sin(s.a)*s.spd,r:s.o.r||6,dmg:s.dmg,life:4,grav:!!s.o.grav,src:e.id,c:s.o.c||'#ff4a6a'});}
    S.q=keep;}}
function stepShots(dt){const P=S.P,slow=P.pw.slow?.45:1;
  for(const b of S.pb){b.t+=dt;b.life-=dt;
    if(b.hom){let t=null,td=420;for(const e of S.E){if(e.dead)continue;const d=Math.hypot(e.x-b.x,e.y-e.h/2-b.y);if(d<td){td=d;t=e;}}
      if(t){const a=Math.atan2(t.y-t.h/2-b.y,t.x-b.x),sp=Math.hypot(b.vx,b.vy),ca=Math.atan2(b.vy,b.vx);let da=a-ca;while(da>Math.PI)da-=6.283;while(da<-Math.PI)da+=6.283;const na=ca+clamp(da,-5*dt,5*dt);b.vx=Math.cos(na)*sp;b.vy=Math.sin(na)*sp;}}
    if(b.kind==='fire'){b.r+=dt*40;b.vx*=1-dt*1.6;b.vy*=1-dt*1.6;}
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    if(b.y>FL&&b.kind==='rkt'){boom(b.x,FL,b.rad,b.dmg);b.life=0;}
    if(b.life<=0&&b.kind==='rkt'&&!b.bo){b.bo=1;boom(b.x,b.y,b.rad,b.dmg);}
    if(b.life<=0)continue;
    for(const e of S.E){if(!hittable(e)||b.hit.indexOf(e)>=0)continue;if(!circHit(b.x,b.y,b.r,ebox(e)))continue;
      if(b.kind==='rkt'){boom(b.x,b.y,b.rad,b.dmg);b.life=0;b.bo=1;break;}
      b.hit.push(e);const dd=b.kind==='fire'?b.dmg:b.dmg;dmgE(e,dd,b);if(b.burn)e.burn=2;if(b.kb&&!e.boss)e.vx+=Math.sign(b.vx)*b.kb;
      AH.ftHit(S.fx,b.wid,b.x,b.y);ftBurst(b.x,b.y,b.c,2,140);if(b.pierce>0){b.pierce--;}else{b.life=0;break;}}
    if(b.life>0)for(const p of S.pr){if(p.hp<=0||p.pass)continue;if(circHit(b.x,b.y,b.r,{x:p.x-p.w/2,y:p.y-p.h,w:p.w,h:p.h})){if(b.kind==='rkt'){boom(b.x,b.y,b.rad,b.dmg);b.bo=1;}else hitProp(p,b.kind==='fire'?b.dmg*.5:1);b.life=0;break;}}
    if(b.x<S.camX-60||b.x>S.camX+viewW()+60||b.y<-80)b.life=0;}
  S.pb=S.pb.filter(b=>b.life>0);if(S.pb.length>160)S.pb.splice(0,S.pb.length-160);
  const pb_=pbox(P);
  for(const b of S.eb){const k=dt*slow;if(b.grav)b.vy+=GRAV*.45*k;b.x+=b.vx*k;b.y+=b.vy*k;b.life-=k;
    if(b.y>FL+4||b.x<S.camX-80||b.x>S.camX+viewW()+80||b.y<-200)b.life=0;
    if(b.life>0&&circHit(b.x,b.y,b.r*.75,pb_)){if(ftHurt(b.dmg,b.x-b.vx,'bul:'+(b.src||''))||P.inv>0||P.dashIF>0){if(P.dashIF>0&&!b.gz){b.gz=1;continue;}b.life=0;}}}
  S.eb=S.eb.filter(b=>b.life>0);
  for(const g of S.bombsL){g.t+=dt;g.vy+=GRAV*dt;g.x+=g.vx*dt;g.y+=g.vy*dt;let hit=g.y>=FL||g.t>2;
    for(const e of S.E)if(!e.dead&&circHit(g.x,g.y,8,ebox(e)))hit=true;if(hit){boom(g.x,Math.min(g.y,FL),95,8);g.done=1;}}
  S.bombsL=S.bombsL.filter(g=>!g.done);}
function stepPickups(dt){const P=S.P,mg=P.pw.magnet?[0,140,220,320][P.pw.magnet.lv]:0;
  for(const p of S.pk){p.t+=dt;if(!p.on){p.vy+=GRAV*.6*dt;p.y+=p.vy*dt;if(p.y>=FL-16){p.y=FL-16;p.on=true;}}
    const dx=P.x-p.x,dy=P.y-36-p.y,d=Math.hypot(dx,dy);
    if(mg&&d<mg&&d>1){p.x+=dx/d*420*dt;p.y+=dy/d*420*dt;}
    if(d<40&&P.hp>0){collect(p);p.got=1;}
    if(p.x<S.camX-20)p.got=1;   // anything left of the screen edge is out of reach (the hero stops 16 px inside it)
    if(p.t>16&&!mg&&!p.fix)p.got=1;}
  S.pk=S.pk.filter(p=>!p.got);
  for(const f of S.fx){f.l-=dt;if(f.vx!=null){f.vy+=600*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;}}
  S.fx=S.fx.filter(f=>f.l>0);for(const p of S.pop){p.l-=dt;p.y-=40*dt;}S.pop=S.pop.filter(p=>p.l>0);
  for(const p of S.pr)if(p.fl>0)p.fl-=dt;S.pr=S.pr.filter(p=>!p.gone||p.fl>0);}
function ftUpdate(rdt){if(!S||S.paused||S.end)return;
  let dt=Math.min(rdt,.05);if(S.hs>0){S.hs-=rdt;dt*=.05;}
  if(F.ctl)try{F.ctl(S,I);}catch(e){}
  S.time+=dt;if(S.note.t>0)S.note.t-=rdt;if(S.shake>0)S.shake=Math.max(0,S.shake-rdt*30);if(S.feverT>0)S.feverT-=dt;S.hintT+=rdt;
  stepPlayer(dt);stepStage(dt);if(S.st.hook&&S.st.hook.step)S.st.hook.step(S,dt,env);stepEnemies(dt);stepShots(dt);stepPickups(dt);if(F.post)F.post(S,dt);   // tidy.js: arena player cap + flyers kept under the HUD
  I.jumpP=I.meleeP=I.dashP=I.bombP=0;
  if(S.dead){S.dead-=rdt;if(S.dead<=0)finish(false);}
  else if(S.win){S.win-=rdt;if(S.win<=0)finish(true);}}
F.step=ftUpdate;

/* ===== results ===== */
function rankOf(){const pts=S.score+Math.max(0,240-S.time)*25+S.P.hp*800-S.hurts*250;return pts>=16000?'S':pts>=11000?'A':pts>=7000?'B':'C';}
function finish(cleared,quit){if(S.end)return;if(F.lab){S.end={cleared,quit:!!quit,neon:0,rank:'-',first:false,rec:false,time:S.time,score:S.score};NR.emit('footEnd',{stage:S.id,cleared,score:S.score,neon:0,time:Math.round(S.time),rank:'-',quit:!!quit,kills:S.kills,hurts:S.hurts,lab:true});return;}   // LAB: no Neon, best score, clear count or save write
  const id=S.id,first=cleared&&!(SV.clr[id]>0),rank=cleared?(S.cpUsed&&rankOf()==='S'?'A':rankOf()):'-';
  let neon=0;if(!quit){neon=cleared?(first?150:15+({S:30,A:20,B:10,C:5}[rank]||0)):Math.min(25,Math.floor(S.score/400));}
  try{if(neon&&typeof GA!=='undefined'){GA.bank+=neon;gsave();}}catch(e){}
  let rec=false;if(cleared){SV.clr[id]=(SV.clr[id]|0)+1;const b=SV.best[id];if(!S.assist&&(!b||S.score>b.score)){SV.best[id]={score:S.score,rank,time:Math.round(S.time)};rec=true;}svSave();}
  S.end={cleared,quit:!!quit,neon,rank,first,rec,time:S.time,score:S.score};
  NR.emit('footEnd',{stage:id,cleared,score:S.score,neon,time:Math.round(S.time),rank,quit:!!quit,kills:S.kills,hurts:S.hurts,assist:S.assist});
  if(!quit)showRes();}
function fmtT(t){t=Math.max(0,Math.round(t));return Math.floor(t/60)+':'+String(t%60).padStart(2,'0');}

/* ===== DOM layer ===== */
const CSS=`
#footL{position:fixed;inset:0;z-index:55;background:#05030c;touch-action:none;user-select:none;-webkit-user-select:none;overflow:hidden}
#footL[hidden]{display:none}
#footC{position:absolute;left:0;top:0;display:block}
#footL .fpad{position:absolute;touch-action:none}
#fStick{border-radius:50%;background:#ffffff12;border:2px solid #ffffff40}
#fStick i{position:absolute;left:50%;top:50%;width:44%;height:44%;margin:-22% 0 0 -22%;border-radius:50%;background:#19e3ff55;border:2px solid #19e3ff}
#footL .fb{position:absolute;min-width:56px;min-height:56px;border-radius:50%;border:2px solid #ffffff66;background:#ffffff14;color:#fff;font:700 14px/1 var(--mono,monospace);display:flex;align-items:center;justify-content:center;padding:0;touch-action:none}
#footL .fb.on{background:#19e3ff44;border-color:#19e3ff}
#fFire{border-color:#ff2d95!important;background:#ff2d9530!important}
#fPause{position:absolute;width:44px;height:44px;border-radius:10px;border:2px solid #ffffff55;background:#05030c99;color:#fff;font:700 16px/1 var(--mono,monospace);padding:0}
#fGhost{position:absolute;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:#ffffffaa;box-shadow:0 0 18px #fff;pointer-events:none;opacity:.9;transition:left .5s,top .5s}
#fGhost[hidden]{display:none}
#fMenu{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#05030ccc;padding:16px;box-sizing:border-box}
#fMenu[hidden]{display:none}
#fMenu .in{width:100%;max-width:420px;text-align:center;color:#fff;font-family:var(--mono,monospace);font-size:16px;display:flex;flex-direction:column;gap:10px}
#fMenu h2{margin:0 0 4px;font-size:clamp(24px,7vw,34px);letter-spacing:.06em}
#fMenu .fr{display:flex;justify-content:space-between;font-size:16px;border-bottom:1px solid #ffffff22;padding:6px 2px}
#fMenu .fr b{color:#ffd23a}
#fMenu .rk{font-size:56px;font-weight:800;color:#ffd23a;line-height:1}
#fMenu .go{min-height:48px;width:100%;font-size:17px}
#fMenu .sm{font-size:14px;color:#c9c3e6}
#footBtn small{display:block;font-size:14px;font-weight:600}
`;
function build(){if(L)return L;const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  const root=document.createElement('div');root.id='footL';root.hidden=true;
  root.innerHTML='<canvas id="footC"></canvas><div class="fpad" id="fStick"><i></i></div>'+
    '<button type="button" class="fb" id="fFire">FIRE</button><button type="button" class="fb" id="fJump">JUMP</button><button type="button" class="fb" id="fMelee">KNIFE</button><button type="button" class="fb" id="fDash">DASH</button><button type="button" class="fb" id="fBomb">BOMB</button>'+
    '<button type="button" id="fPause" aria-label="Pause">II</button><div id="fGhost" hidden></div><div id="fMenu" hidden><div class="in"></div></div>';
  document.body.appendChild(root);
  const cv=root.querySelector('#footC');L={root,cv,ctx:cv.getContext('2d'),vw:960,sc:1,touch:false,menu:root.querySelector('#fMenu'),ghost:root.querySelector('#fGhost'),stick:root.querySelector('#fStick'),btn:{}};
  const bmap={fFire:'fire',fJump:'jump',fMelee:'melee',fDash:'dash',fBomb:'bomb'};
  for(const id in bmap){const b=root.querySelector('#'+id),k=bmap[id];L.btn[k]=b;
    const dn=e=>{e.preventDefault();if(!I[k]){I[k+'P']=1;}I[k]=1;b.classList.add('on');try{b.setPointerCapture(e.pointerId);}catch(x){}};
    const up=e=>{I[k]=0;b.classList.remove('on');};
    b.addEventListener('pointerdown',dn);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('lostpointercapture',up);}
  let sid=null;const sk=L.stick,knob=sk.querySelector('i');
  const smove=e=>{const r=sk.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,R=r.width/2;let dx=(e.clientX-cx)/R,dy=(e.clientY-cy)/R;const m=Math.hypot(dx,dy);if(m>1){dx/=m;dy/=m;}
    I.x=dx;I.y=dy;I.stick=1;knob.style.transform='translate('+(dx*R*.6)+'px,'+(dy*R*.6)+'px)';};
  sk.addEventListener('pointerdown',e=>{e.preventDefault();sid=e.pointerId;try{sk.setPointerCapture(sid);}catch(x){}smove(e);});
  sk.addEventListener('pointermove',e=>{if(e.pointerId===sid)smove(e);});
  const send=e=>{if(e.pointerId!==sid)return;sid=null;I.x=0;I.y=0;I.stick=0;knob.style.transform='';};
  sk.addEventListener('pointerup',send);sk.addEventListener('pointercancel',send);
  root.querySelector('#fPause').addEventListener('click',()=>pause(true));
  const KM={ArrowLeft:'l',KeyA:'l',ArrowRight:'r',KeyD:'r',ArrowUp:'u',KeyW:'u',ArrowDown:'d',KeyS:'d',KeyJ:'fire',KeyK:'jump',Space:'jump',KeyL:'melee',ShiftLeft:'dash',ShiftRight:'dash',KeyG:'bomb'};
  const kd=e=>{if(!F.on)return;const k=KM[e.code];
    if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();e.stopImmediatePropagation();if(S&&!S.end)pause(!S.paused);return;}
    if(!k){if(L.menu.hidden){e.stopImmediatePropagation();}return;}
    if(!L.menu.hidden&&(e.code==='Space'))return;   // Space presses a focused menu button
    e.preventDefault();e.stopImmediatePropagation();if(!e.repeat&&!I[k]&&['jump','melee','dash','bomb'].indexOf(k)>=0)I[k+'P']=1;I[k]=1;};
  const ku=e=>{if(!F.on)return;const k=KM[e.code];if(!k)return;e.stopImmediatePropagation();I[k]=0;};
  addEventListener('keydown',kd,true);addEventListener('keyup',ku,true);
  addEventListener('blur',()=>{for(const k of ['l','r','u','d','fire','jump','melee','dash','bomb'])I[k]=0;});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&F.on&&S&&!S.end)pause(true);});
  // one debounced relayout fed by every size signal; iOS reports the old size right after rotating, so measure again after 400 ms
  let lt=0;const rl=()=>{clearTimeout(lt);lt=setTimeout(()=>{layout();setTimeout(layout,400);},60);};
  addEventListener('resize',rl);addEventListener('orientationchange',rl);if(window.visualViewport)visualViewport.addEventListener('resize',rl);
  try{new ResizeObserver(rl).observe(document.documentElement);}catch(e){}
  return L;}
function isTouch(){return ('ontouchstart' in window)||navigator.maxTouchPoints>0||(window.matchMedia&&matchMedia('(pointer:coarse)').matches);}
const autoOn=()=>!!(L&&L.touch&&(SV.auto===undefined||SV.auto));   // touch: auto-fire is on unless the player turned it off in the pause menu
function layout(){if(!L)return;const vv=window.visualViewport,W=Math.round(vv?vv.width:innerWidth),H=Math.round(vv?vv.height:innerHeight),dpr=Math.min(F.dprMax||2,window.devicePixelRatio||1);
  const T=L.touch=isTouch()||F.forceTouch;if(F.look&&F.look.layout&&F.look.layout(L,W,H,dpr,T))return;let cx=0,cy=0,cw=W,ch=H,mode='full',minVw=480,sw=0;
  if(T&&H>W*1.05){mode='port';minVw=420;ch=H-clamp(Math.round(H*.37),190,290);}   // portrait: the field takes about 63% of the height, the pad lives below it
  else if(T){mode='land';minVw=420;sw=clamp(Math.round(W*.22),160,220);cx=sw;cw=W-2*sw;}   // landscape: the field is the whole screen, the pad sits over the side bands
  let sc=ch/VH;if(cw/sc<minVw)sc=cw/minVw;
  const vw=Math.min(760,cw/sc),hpx=Math.round(VH*sc);cx+=Math.round((cw-vw*sc)/2);
  cy=mode==='port'?Math.max(0,Math.round((ch-hpx)*.5)):Math.round((H-hpx)/2);
  L.sc=sc;L.vw=vw;L.mode=mode;L.box={x:cx,y:cy,w:Math.round(vw*sc),h:hpx};
  const full=mode==='land',ox=full?0:cx,oy=full?0:cy,ow=full?W:L.box.w,oh=full?H:hpx;   // landscape: the canvas is the whole screen, the backdrop runs under the pad
  L.ox=ox;L.oy=oy;L.exl=(cx-ox)/sc;L.exr=(ow-(cx-ox)-L.box.w)/sc;
  const cv=L.cv;cv.style.left=ox+'px';cv.style.top=oy+'px';cv.style.width=ow+'px';cv.style.height=oh+'px';cv.width=Math.round(ow*dpr);cv.height=Math.round(oh*dpr);L.dpr=dpr;
  const show=T,auto=autoOn(),set=(el,x,y,s)=>{el.hidden=!show;el.style.display=show?'':'none';el.style.left=Math.round(x)+'px';el.style.top=Math.round(y)+'px';if(s){el.style.width=el.style.height=Math.round(s)+'px';}};
  if(mode==='full'){for(const el of [L.stick,...Object.values(L.btn)]){el.hidden=true;el.style.display='none';}}
  else{
    // right cluster: rows from the bottom up, right-aligned, 8 px gaps. FIRE (JUMP when auto-fire hides FIRE) is the big one. Left: the stick, nothing else.
    const zone=mode==='port'?{x:0,y:cy+hpx,w:W,h:H-(cy+hpx)}:{x:W-sw,y:0,w:sw,h:H},big=auto?'jump':'fire';
    const s=mode==='port'?clamp(Math.round(zone.h*.22),56,64):56,f=mode==='port'?clamp(Math.round(zone.h*.38),80,100):clamp(Math.round(zone.w*.5),76,84);
    const rows=auto?[['dash','jump'],['bomb','melee']]:mode==='port'?[['dash','fire'],['bomb','melee','jump']]:[['dash','fire'],['melee','jump'],['bomb']];
    const sz=k=>k===big?f:s,rh=rows.map(r=>Math.max(...r.map(sz))),stack=rh.reduce((a,b)=>a+b,0)+8*(rows.length-1),bot=mode==='port'?Math.max(10,(zone.h-stack)/2):14;
    let y=zone.y+zone.h-bot;rows.forEach((r,i)=>{y-=rh[i];let x=zone.x+zone.w-(mode==='port'?14:8);for(let j=r.length-1;j>=0;j--){const z=sz(r[j]);x-=z;set(L.btn[r[j]],x,y+(rh[i]-z)/2,z);x-=8;}y-=8;});
    const fb=L.btn.fire;if(auto){fb.hidden=true;fb.style.display='none';}
    const sk=mode==='port'?clamp(Math.min(zone.h*.62,W*.34),116,150):clamp(Math.min(sw-24,H*.42),110,150);
    if(mode==='port')set(L.stick,16,zone.y+(zone.h-sk)/2,sk);else set(L.stick,(sw-sk)/2,H-sk-16,sk);}
  const pb=L.root.querySelector('#fPause');pb.style.left=(cx+L.box.w-52)+'px';pb.style.top=(cy+8)+'px';}
F.layout=layout;

/* ===== drawing (placeholders; FA draws the real art when W2's part is in) ===== */
function hsh(i){let x=Math.sin(i*127.1)*43758.5;return x-Math.floor(x);}
function drawBg(c,vw0,exl,exr){const vw=vw0+exl+exr;c.save();c.translate(-exl,0);const g=c.createLinearGradient(0,0,0,VH);g.addColorStop(0,'#0a0420');g.addColorStop(.6,'#2a0b3a');g.addColorStop(1,'#140818');c.fillStyle=g;c.fillRect(0,0,vw,VH);
  const fa=window.FA;let done=false;if(fa&&typeof fa.bg==='function'){try{for(const l of ['sky','far','mid','near'])fa.bg(c,l,S.camX,vw,VH);done=true;}catch(e){done=false;}}
  if(!done)for(const [k,col,hmin,hmax,wd,y0] of [[.15,'#1a0f33',140,300,90,FL-40],[.4,'#24123d',90,230,70,FL-10],[.75,'#2c1644',60,150,120,FL]]){
    const off=S.camX*k,i0=Math.floor(off/wd)-1;for(let i=i0;i<i0+vw/wd+3;i++){const h=hmin+hsh(i+k*99)*(hmax-hmin),x=i*wd-off;c.fillStyle=col;c.fillRect(x,y0-h,wd-6,h);
      if(k>.3){c.fillStyle=hsh(i*3.1)>.5?'#ff2d9555':'#19e3ff44';for(let wy=y0-h+12;wy<y0-14;wy+=22)c.fillRect(x+8+hsh(i+wy)*(wd-30),wy,10,6);}}}
  c.fillStyle='#1c1426';c.fillRect(0,FL,vw,VH-FL);c.fillStyle='#ff2d95';c.fillRect(0,FL,vw,2);
  c.fillStyle='#ffffff14';const so=S.camX%80;for(let x=-so;x<vw;x+=80)c.fillRect(x,FL+30,40,4);if(typeof ART!=='undefined'&&ART.footProps)ART.footProps(c,S.camX,vw,FL,S.time);c.restore();}
function human(c,x,y,h,col,pose,flip,t,crouch){   // fallback humanoid: head, body, legs, gun arm
  const s=h/64;c.save();c.translate(x,y);c.scale(flip?-s:s,s);const run=/run/.test(pose),ph=Math.sin(t*14);
  if(crouch||/crouch/.test(pose)){c.translate(0,0);c.scale(1,.66);}
  c.fillStyle=col;c.fillRect(-7,-64,14,13);c.fillRect(-10,-50,20,24);
  c.fillRect(-9+(run?ph*5:0),-27,7,27);c.fillRect(2-(run?ph*5:0),-27,7,27);
  c.fillStyle='#ffffffaa';if(/shoot/.test(pose))c.fillRect(6,-46,22,5);else if(pose==='melee'){c.fillRect(6,-44,26,3);}else c.fillRect(4,-44,12,5);
  c.fillStyle='#000a';c.fillRect(1,-61,6,4);c.restore();}
function drawWho(c,who,pose,x,y,h,flip,t,col,crouch){const fa=window.FA;
  if(F.drawX&&F.drawX[who]){try{F.drawX[who](c,pose,x,y,h,flip,t,col);return;}catch(e){}}
  if(fa&&typeof fa.draw==='function'){try{fa.draw(c,who,pose,x,y,h,flip,t);return;}catch(e){}}
  if(who==='drone'||who==='turret'){c.fillStyle=col;c.fillRect(x-h*.8,y-h,h*1.6,h);c.fillStyle='#ffffffaa';c.fillRect(x+(flip?-h:h*.4),y-h*.6,h*.6,4);return;}
  if(who==='mech'||who==='warden'){c.fillStyle=col;c.fillRect(x-h*.35,y-h,h*.7,h*.75);c.fillRect(x-h*.3,y-h*.25,h*.2,h*.25);c.fillRect(x+h*.1,y-h*.25,h*.2,h*.25);c.fillStyle='#ffd23a';c.fillRect(x+(flip?-h*.3:h*.1),y-h*.9,h*.2,h*.1);return;}
  human(c,x,y,h,col,pose,flip,t,crouch);}
function ppose(P){if(P.hp<=0)return'die';if(P.hurtT>0)return'hit';if(P.mel>0)return'melee';if(P.crouch)return P.shotT>0?'crouch-shoot':'crouch';
  if(!P.onGround)return P.vy<0?'jump':'fall';if(P.shotT>0)return'shoot';if(Math.abs(P.vx)>5)return BK(P.anim,7)?'run-a':'run-b';return'idle';}
/* Kai's extra acts for the strip sheets (art only): the pose name still drives the shapes and stills; '' = let the pose pick the act */
function kaiX(P){const t=S.time,dt=Math.min(.1,Math.max(0,t-(P._xt==null?t:P._xt)));P._xt=t;if(P.hp<=0)return'die';if(S.end&&S.end.cleared)return'victory';
  const mel=P.mel>0;if(mel&&!P._pm){P._cb=t-(P._me||-9)<.7?(P._cb%3)+1:1;P._mk=.34;}if(P._pm&&!mel)P._me=t;P._pm=mel;if(P._mk>0)P._mk-=dt;
  if(P._gb!=null&&P.bombs<P._gb)P._gt=.4;P._gb=P.bombs;if(P._gt>0)P._gt-=dt;if(P._sk>0)P._sk-=dt;if(P.shotT>0)P._sk=.18;
  if(!P.onGround)P._air=(P._air||0)+dt;else{if(P._air>.25){P._ln=.2;AH.ftPush(S.fx,'fx-ft-dust',P.x,P.y-6,64,.35);}P._air=0;}if(P._ln>0)P._ln-=dt;
  if(P.hurtT>0)return'hurt';if(P.dash>0)return'dash';if(P._gt>0)return'grenade';if(P._mk>0)return P._cb===3?'combo3':P._cb===2?'combo2':'melee';
  if(P._ln>0&&P.onGround)return'land';if(P.crouch)return P._sk>0?'crouchshoot':'';if(!P.onGround||P._sk<=0)return'';
  const el=Math.abs(Math.sin(P.aim||0));return el>.8?'aimup':el>.3?'aimdiag':Math.abs(P.vx)>5?'runshoot':'';}
function draw(){if(!L||!S)return;if(F.look&&F.look.draw&&F.look.draw(L.ctx))return;const c=L.ctx,sc=L.sc*L.dpr,vw=L.vw,P=S.P;
  c.setTransform(1,0,0,1,0,0);c.fillStyle='#05030c';c.fillRect(0,0,L.cv.width,L.cv.height);c.setTransform(sc,0,0,sc,(L.box.x-L.ox)*L.dpr,(L.box.y-L.oy)*L.dpr);const sh=S.shake?ftRnd(-S.shake,S.shake)*.5:0;
  drawBg(c,vw,L.exl||0,L.exr||0);c.save();c.translate(-S.camX+sh,sh*.5);
  for(const [px,py,pw] of S.st.plats){c.fillStyle='#3a2a52';c.fillRect(px,py,pw,12);c.fillStyle='#19e3ff';c.fillRect(px,py,pw,2);}
  if(S.cp==null){c.fillStyle='#19e3ff55';c.fillRect(S.st.cp-2,FL-120,4,120);c.fillStyle='#19e3ff';c.fillRect(S.st.cp-2,FL-120,22,12);}
  for(const p of S.pr){if(p.hp<=0&&!p.fl)continue;c.fillStyle=p.fl>0?'#fff':p.c;c.fillRect(p.x-p.w/2,p.y-p.h,p.w,p.h);c.strokeStyle='#ffffff55';c.lineWidth=2;c.strokeRect(p.x-p.w/2+2,p.y-p.h+2,p.w-4,p.h-4);}
  for(const p of S.pk){const d=PICKUPS[p.k],bob=Math.sin(p.t*5)*3;if(p.k==='ammo'&&RET.sprites&&ART.ANIM.c['pk-ammo/spin']&&ART.anim('pk-ammo/spin')){c.globalAlpha=p.t>13?.5+.5*Math.sin(p.t*20):1;ART.drawAnim(c,'pk-ammo/spin',p.t,p.x,p.y+bob,32/ART.ANIM.c['pk-ammo/spin'].bw,false);c.globalAlpha=1;continue;}c.fillStyle=d.c;c.globalAlpha=p.t>13?.5+.5*Math.sin(p.t*20):1;c.beginPath();c.arc(p.x,p.y+bob,15,0,6.283);c.fill();c.globalAlpha=1;
    c.fillStyle='#05030c';c.font='bold 15px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText(d.ic,p.x,p.y+bob+1);}
  for(const e of S.E){if(e.dead&&!(e.ext&&!e.remove))continue;const pose=e.dead?'die':(()=>{try{return e.def.pose?e.def.pose(e):'idle';}catch(x){return'idle';}})();
    if(e.tele>0){c.fillStyle='#ff304a';c.globalAlpha=.35+.35*Math.sin(S.time*30);c.beginPath();c.arc(e.x+e.facing*e.w*.4,e.y-e.h*.62,10+e.w*.1,0,6.283);c.fill();c.globalAlpha=1;}
    if(e.wind>0){c.strokeStyle='#ff304a';c.lineWidth=3;c.strokeRect(e.x-e.w/2-4,e.y-e.h-4,e.w+8,e.h+8);}
    c.globalAlpha=1;   /* owner 23 Oct 2026 "all enemies are transparent": foes died inside their 0.9 s grace and were only ever drawn at .65; always solid now */
    ART.fE=e;drawWho(c,e.id,pose,e.x,e.ext&&e.fly?e.y+e.h/2:e.y,e.h,e.facing<0,e.dead?e.dt_||0:e.t,e.flash>0?'#ffffff':(e.def.c||'#d04'));ART.fE=null;c.globalAlpha=1;
    if(e.def.front&&e.def.fb){c.fillStyle='#a0c0ff';c.fillRect(e.x+e.facing*e.w*.5-3,e.y-e.h*.9,6,e.h*.8);}}
  if(S.st.hook&&S.st.hook.draw)try{S.st.hook.draw(c,S);}catch(x){}
  const blink=P.inv>0&&BK(S.time,16);if(!blink||P.hp<=0){
    if(P.pw.shield){c.strokeStyle='#5ad1ff';c.lineWidth=2+P.pw.shield.lv;c.beginPath();c.arc(P.x,P.y-34,44,0,6.283);c.stroke();}
    if(P.dashIF>0){c.fillStyle='#19e3ff33';c.fillRect(P.x-24-P.facing*20,P.y-60,48,58);}
    P._xa=kaiX(P);ART.fE=P;drawWho(c,'kai',ppose(P),P.x,P.y,P.crouch?44:P.h,P.facing<0,S.time,S.feverT>0?'#ffd23a':'#19e3ff',P.crouch);ART.fE=null;
    if(P.shotT>0){const a=P.aim,mx=P.x+Math.cos(a)*28,my=P.y-(P.crouch?26:44)+Math.sin(a)*20;if(!AH.ftMuz(c,P.w,mx,my,a)&&WEAPONS[P.w].kind!=='arc'){c.fillStyle='#fff';c.beginPath();c.arc(mx,my,5,0,6.283);c.fill();}}}
  for(const b of S.pb){if(AH.ftBul(c,b))continue;c.fillStyle=b.c;if(b.kind==='fire'){c.globalAlpha=Math.max(0,b.life*2);c.beginPath();c.arc(b.x,b.y,b.r,0,6.283);c.fill();c.globalAlpha=1;}else if(b.kind==='rkt'){c.fillRect(b.x-8,b.y-3,16,6);}else{c.fillRect(b.x-6,b.y-2,12,4);}}
  for(const g of S.bombsL){if(AH.ftDraw(c,'fx-ft-grenade',g.x,g.y,22,S.time*7))continue;c.fillStyle='#ffb020';c.beginPath();c.arc(g.x,g.y,7,0,6.283);c.fill();}
  for(const b of S.eb){if(RET.read&&window.READ){READ.footEb(c,b);continue;}c.fillStyle=b.c;c.beginPath();c.arc(b.x,b.y,b.r,0,6.283);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(b.x,b.y,b.r*.45,0,6.283);c.fill();}
  for(const f of S.fx){c.globalAlpha=Math.min(1,f.l*3);if(f.pic){AH.ftFx(c,f);continue;}if(f.arc&&AH.ftArc(c,f)){}else if(f.arc){c.strokeStyle=f.c;c.lineWidth=3;c.beginPath();f.arc.forEach(([x,y],i)=>{const j=i?ftRnd(-6,6):0;i?c.lineTo(x+j,y+j):c.moveTo(x,y);});c.stroke();}
    else if(f.slash){c.strokeStyle=f.c;c.lineWidth=4;c.beginPath();c.arc(f.x,f.y,f.w*.5,-1.2,1.2);c.stroke();}
    else if(f.ring){c.strokeStyle=f.c;c.lineWidth=4;c.beginPath();c.arc(f.x,f.y,f.r*(1-f.l/f.m*.6),0,6.283);c.stroke();}
    else{c.fillStyle=f.c;c.fillRect(f.x-f.r/2,f.y-f.r/2,f.r,f.r);}}c.globalAlpha=1;
  const fs=n=>Math.max(14,n)/L.sc;c.textAlign='center';c.textBaseline='alphabetic';
  for(const p of S.pop){c.globalAlpha=Math.min(1,p.l/p.m*2.5);c.fillStyle=p.c;c.font='bold '+fs(p.big?17:15)+'px monospace';c.fillText(p.t,p.x,p.y);}c.globalAlpha=1;
  c.restore();drawHud(c,vw,fs);}
function drawHud(c,vw,fs){const P=S.P,u=1/L.sc,m=10*u,hb=[],box=(x,y,w,h)=>hb.push({x,y,w,h});c.textBaseline='top';c.textAlign='left';
  for(let i=0;i<P.max;i++){c.fillStyle=i<P.hp?'#ff4060':'#ffffff22';c.beginPath();c.arc(m+10*u+i*24*u,m+10*u,9*u,0,6.283);c.fill();}
  box(m,m,P.max*24*u+2*u,20*u);
  let y=m+26*u;const w=WEAPONS[P.w];c.font='bold '+fs(15)+'px monospace';c.fillStyle=w.c;
  const wt=w.n+(P.w==='pistol'?'':' LV'+P.lv+' · '+P.ammo);c.fillText(wt,m,y);box(m,y,c.measureText(wt).width,16*u);y+=20*u;
  c.fillStyle='#ffb020';c.fillText('●×'+P.bombs,m,y);let x=m+60*u;
  for(const k of PW_KEYS){const p=P.pw[k];if(!p)continue;const d=PICKUPS[k];c.fillStyle=d.c;c.fillText(d.ic+(d.max>1?p.lv:''),x,y);x+=40*u;}
  box(m,y,x-m,16*u);
  c.textAlign='right';c.fillStyle='#fff';const st=String(S.score),tt=fmtT(S.time);c.fillText(st,vw-62*u,m+4*u);c.fillStyle='#c9c3e6';c.fillText(tt,vw-62*u,m+24*u);
  const sw=Math.max(c.measureText(st).width,c.measureText(tt).width);box(vw-62*u-sw,m+4*u,sw,36*u);
  const lo=m+(P.max*24+22)*u,hi=vw-62*u-sw-10*u,fw=Math.min(220*u,hi-lo);   // the fever bar sits between the hearts and the score
  if(fw>40*u){const fx=clamp(vw/2-fw/2,lo,hi-fw);c.fillStyle='#ffffff18';c.fillRect(fx,m,fw,8*u);c.fillStyle=S.feverT>0?'#ffd23a':'#ff2d95';c.fillRect(fx,m,fw*(S.feverT>0?S.feverT/8:S.fever/100),8*u);box(fx,m,fw,8*u);}
  if(S.boss&&!S.boss.dead){const bw=vw*.7,bx=vw*.15,by=VH-30*u;c.fillStyle='#ffffff22';c.fillRect(bx,by,bw,10*u);c.fillStyle='#ff2050';c.fillRect(bx,by,bw*Math.max(0,S.boss.hp/S.boss.max),10*u);
    c.textAlign='center';c.fillStyle='#fff';c.textBaseline='bottom';c.fillText('WARDEN',vw/2,by-2*u);}
  c.textAlign='center';c.textBaseline='top';
  // hints and notes get their own strip under the HUD (hearts, weapon, bombs end at about 62 px), never on the timer
  let line='',hint=null;if(S.note.t>0)line=S.note.txt;else if(hintOn())line=hintText();
  if(line){c.font='bold '+fs(16)+'px monospace';const tw=Math.min(c.measureText(line).width,vw-24*u),hy=m+66*u;c.fillStyle='#000b';c.fillRect(vw/2-tw/2-8*u,hy,tw+16*u,26*u);c.fillStyle='#fff';c.fillText(line,vw/2,hy+4*u,vw-24*u);hint={x:vw/2-tw/2-8*u,y:hy,w:tw+16*u,h:26*u};}
  if(S.st.hook&&S.st.hook.hud)try{S.st.hook.hud(c,vw,u,box,fs,S);}catch(x){}
  L.hud={hud:hb,hint,vw};
  ghost();}
function hintOn(){return S&&!SV.hint&&S.hintT<20&&(S.moved<250||S.shots<1);}
function hintText(){if(S.moved<250)return L&&L.touch?'Push the stick right':'D or → to run';return L&&L.touch?(autoOn()?'Face an enemy: you shoot':(RET.bossfix!==false?'Tap or hold FIRE to shoot':'Hold FIRE to shoot')):'Hold J to shoot';}
function ghost(){const g=L.ghost;if(!L.touch||!hintOn()||S.note.t>0||(L.menu&&!L.menu.hidden)||(autoOn()&&S.moved>=250)){g.hidden=true;return;}g.hidden=false;
  const tgt=S.moved<250?L.stick:L.btn.fire,r=tgt.getBoundingClientRect(),ph=(S.time%1.2)/1.2;
  g.style.left=(r.left+r.width/2+(S.moved<250?r.width*.3*ph:0))+'px';g.style.top=(r.top+r.height/2)+'px';}

/* ===== menus ===== */
function menu(html,btns){const m=L.menu,inn=m.querySelector('.in');inn.innerHTML=html;for(const [t,fn,id] of btns){const b=document.createElement('button');b.type='button';b.className='go';b.textContent=t;if(id)b.id=id;b.addEventListener('click',fn);inn.appendChild(b);}
  m.hidden=false;L.ghost.hidden=true;const f=inn.querySelector('button');if(f&&!L.touch)try{f.focus();}catch(e){}}
function hideMenu(){L.menu.hidden=true;}
const autoTxt=()=>'AUTO-FIRE: '+(autoOn()?'ON':'OFF');
function setAuto(v){SV.auto=v?1:0;svSave();layout();const b=document.getElementById('fAuto');if(b)b.textContent=autoTxt();}
F.setAuto=setAuto;F.autoOn=autoOn;F.hudInfo=()=>L&&{hud:L.hud,box:L.box,mode:L.mode,vw:L.vw,sc:L.sc,ox:L.ox,oy:L.oy};
function pause(on){if(!S||S.end)return;S.paused=on;for(const k in I)I[k]=0;if(on){const bt=[['RESUME',()=>pause(false),'fResume']];if(L.touch)bt.push([autoTxt(),()=>setAuto(!autoOn()),'fAuto']);bt.push(['RETRY',()=>{hideMenu();begin(S.id);},'fRetry'],['QUIT',()=>{finish(false,true);stop();},'fQuit']);
    menu('<h2>PAUSED</h2><div class="sm">'+STAGES[S.id].n+' · '+fmtT(S.time)+'</div>',bt);}
  else{hideMenu();lastT=performance.now();}}
function showRes(){const E=S.end,id=S.id,b=SV.best[id];
  const rows=[['SCORE',E.score],['TIME',fmtT(E.time)],['KILLS',S.kills],['NEON','+'+E.neon+(E.first?' · first clear':'')]];
  if(b)rows.push(['BEST',b.score+' · '+b.rank]);if(S.st.hook&&S.st.hook.rows)S.st.hook.rows(S,rows);
  const html='<h2>'+(E.cleared?'STREET CLEAR':'YOU WENT DOWN')+'</h2>'+(E.cleared?'<div class="rk" id="fRank">'+E.rank+'</div>':'')+rows.map(r=>'<div class="fr"><span>'+r[0]+'</span><b>'+r[1]+'</b></div>').join('')+(S.assist?'<div class="sm">ⓐ Assist run · no records</div>':'');
  const bt=[];if(!E.cleared&&S.cp)bt.push(['FROM CHECKPOINT',()=>{hideMenu();begin(id,true);},'fCp']);
  bt.push([E.cleared?'RUN AGAIN':'RETRY',()=>{hideMenu();begin(id);},'fAgain']);
  bt.push(['FLY ON',()=>{leave(()=>{try{const sb=$('storyBtn');if(sb)sb.click();}catch(e){}});},'fFly']);
  bt.push(['BACK TO CITY',()=>leave(),'fCity']);menu(html,bt);}
function leave(then){const id=S&&S.id,cl=S&&S.end&&S.end.cleared;stop();
  const st=STAGES[id];if(cl&&RET.tale&&window.TALE&&st&&st.tale&&!SV.seen.a){SV.seen.a=1;svSave();const ok=TALE.show(st.tale.after.map(l=>({who:l[0],text:l[1]})),0,()=>{if(then)then();});if(ok!==false)return;}
  if(then)then();}

/* ===== start / stop ===== */
function loop(t){if(!F.on){raf=0;return;}const dt=Math.min(.05,(t-lastT)/1000||0);lastT=t;ftUpdate(F.ts?dt*F.ts:dt);if(F.pre)F.pre(L.ctx);draw();raf=requestAnimationFrame(loop);}
function begin(id,fromCp){if(F.ui){F.ui=0;if(F.hold&&F.hold(()=>begin(id,fromCp)))return;}build();newRun(id,fromCp);for(const k in I)I[k]=0;L.root.hidden=false;F.on=true;layout();hideMenu();
  try{if(typeof AU!=='undefined'&&AU.startStage&&sndF(fromCp?'f_mcp':'f_mstart'))AU.startStage(STAGES[id].song);}catch(e){}
  NR.emit('footStart',{stage:id,cp:!!fromCp,t0:S.time});lastT=performance.now();if(!raf)raf=requestAnimationFrame(loop);}
function start(id){id=id||'street1';if(!RET.foot||!STAGES[id])return false;if(typeof running!=='undefined'&&running)return false;
  const st=STAGES[id];if(!F.lab&&RET.tale&&window.TALE&&st.tale&&!SV.seen.b){SV.seen.b=1;svSave();const ok=TALE.show(st.tale.before.map(l=>({who:l[0],text:l[1]})),0,()=>begin(id));if(ok!==false)return true;}
  begin(id);return true;}
function stop(){if(S&&!S.end)finish(false,true);if(!F.lab&&S&&S.hintT>8&&S.moved>250&&S.shots>0&&!SV.hint){SV.hint=1;svSave();}F.on=false;if(raf)cancelAnimationFrame(raf);raf=0;if(L){L.root.hidden=true;hideMenu();}
  for(const k in I)I[k]=0;try{if(typeof AU!=='undefined'&&AU.menuMusic&&sndF('f_mmenu')&&!(typeof running!=='undefined'&&running))AU.menuMusic();}catch(e){}}
function sim(sec,dt){dt=dt||1/60;let n=Math.round(sec/dt);while(n-->0&&S&&!S.end)ftUpdate(dt);return S;}   // headless fast-forward for tests

/* ===== MENU button: STREET RUN (unlocked after story stage 3) ===== */
if(RET.foot){const add=()=>{const g=document.querySelector('#mnMore .mg');if(!g)return false;if(document.getElementById('footBtn'))return true;
    const b=document.createElement('button');b.type='button';b.className='go wide';b.id='footBtn';g.appendChild(b);
    const paint=()=>{const u=ftUnlocked();b.disabled=!u;b.innerHTML=u?'STREET RUN<small style="font-size:14px;display:block">on foot · '+(SV.best[F.main||'street1']?'best '+SV.best[F.main||'street1'].score:'new')+'</small>':'STREET RUN<small style="font-size:14px;display:block">clear stage 3 to unlock</small>';};
    paint();b.addEventListener('click',()=>{if(!ftUnlocked())return;const mn=$('mnMore');F.ui=1;start(F.main||'street1');});
    NR.on('runEnd',()=>setTimeout(paint,50));NR.on('footEnd',()=>setTimeout(paint,50));F.paint=paint;return true;};
  let n=0;const t=setInterval(()=>{if(add()||++n>80)clearInterval(t);},60);}
F._in={boom,hitProp,ftHurt,ftBurst,dmgE,pop,sfx,PROPD,L:()=>L,drawWho,ppose,kaiX,ghost,hintOn,hintText,fmtT,PW_KEYS,ftRnd};   // for streetlook.js (draws the street on its own when RET.streetlook is on)
return F;})();


/* ---------- input ---------- */
const K={};let pressed={};
let touch=null,touchFire=false;
const stampOf=e=>(e&&e.timeStamp>0?e.timeStamp:performance.now());
const QD={L:1,M:1.5,H:2};
const PXB={L:.93e6,M:2.1e6,H:3.7e6};                   // backing-store budget in pixels (1280x720 / 1920x1080 / 2560x1440): a 4K or DPR-2 screen is not drawn at its full size, the browser scales the canvas up                              // quality setting -> highest pixel ratio
function fit(){
  const st=stage.getBoundingClientRect();if(st.width<2||st.height<2)return;
  const was=rotMode;rotMode=touchUI&&st.height>st.width*1.05;   // portrait: a vertical play area, ship at the bottom
  document.documentElement.classList.toggle('touch',touchUI);
  const aw=st.width,ah=st.height;let w,h,strip=0,side=0;
  if(rotMode){const sA=Math.min(aw/H,(ah-84)/W),sB=Math.min((aw-80)/H,ah/W);   // buttons in a strip below, or in a column beside the play area, whichever leaves the bigger screen
    if(sB>sA*1.04){side=80;w=H*sB;h=W*sB;}else{strip=84;w=H*sA;h=W*sA;}}
  else{w=aw;h=w*9/16;if(h>ah){h=ah;w=h*16/9;}}
  const left=SET.layout==='left';
  stage.classList.toggle('p',rotMode);stage.classList.toggle('sd',side>0);stage.classList.toggle('tl',left);
  stage.style.setProperty('--strip',strip+'px');stage.style.setProperty('--shift',side?(left?40:-40)+'px':'0px');
  frame.style.width=w+'px';frame.style.height=h+'px';
  const dpr=Math.max(.5,Math.min(QD[SET.q]||1.5,window.devicePixelRatio||1,Math.sqrt((PXB[SET.q]||PXB.M)/(w*h)))),cw=Math.round(w*dpr),ch=Math.round(h*dpr);
  if(cv.width!==cw||cv.height!==ch){cv.width=cw;cv.height=ch;}
  if(rotMode){                                           // the world keeps its landscape coordinates on its own canvas; render() turns it upright
    if(wcv===cv){wcv=document.createElement('canvas');wctx=wcv.getContext('2d');}
    const ww=ch,wh=cw;if(wcv.width!==ww||wcv.height!==wh){wcv.width=ww;wcv.height=wh;}
    S=wcv.width/W;VS=cv.width/H;}
  else{wcv=cv;wctx=vctx;S=cv.width/W;VS=S;}
  if(was!==rotMode){touch=null;touchFire=false;}
}
// iOS reports the old size right after a rotation: one debounced relayout, fed by every signal, measured again after ~400 ms
let fitT=0;function relayout(){fit();clearTimeout(fitT);fitT=setTimeout(()=>{fit();fitT=setTimeout(fit,300);},120);}
addEventListener('resize',relayout);addEventListener('orientationchange',relayout);
if(window.visualViewport)visualViewport.addEventListener('resize',relayout);
if(window.ResizeObserver)new ResizeObserver(()=>fit()).observe(stage);

function toGame(t){const r=frame.getBoundingClientRect();                  // portrait: the screen's up is the world's right
  return rotMode?[(r.bottom-t.clientY)/r.height*W,(t.clientX-r.left)/r.width*H]:[(t.clientX-r.left)/r.width*W,(t.clientY-r.top)/r.height*H];}
addEventListener('keydown',e=>{const k=e.code;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(k)&&!(e.target&&e.target.tagName==='INPUT'))e.preventDefault();
  if(!K[k]){pressed[k]=stampOf(e);if(k==='Space'||k==='KeyJ')pressed.Fire=pressed[k];}
  K[k]=true;AU.unlock();
  if(k==='KeyM'&&!(e.target&&e.target.tagName==='INPUT'))toggleMute();
  if(k==='KeyP'||k==='Escape'){if(!$('setm').hidden)closeSettings();else if(running)setPause(!paused);}
  if((k==='Enter'||k==='Space')&&!running&&overlayReady&&$('setm').hidden){const ae=document.activeElement;
    if(!ae||ae===document.body||ae.id==='startBtn'||ae.id==='againBtn'){if(!$('over').hidden)start(lastDaily);else if(!$('title').hidden)start(false);}}});
addEventListener('keyup',e=>{K[e.code]=false;});
addEventListener('blur',()=>{for(const k in K)K[k]=false;touch=null;touchFire=false;if(running&&!paused)setPause(true);});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(running&&!paused)setPause(true);}else if(!paused)AU.resume();});
addEventListener('pageshow',()=>{if(!paused&&!document.hidden)AU.resume();});
for(const ev of['pointerdown','touchstart','touchend','mouseup','click'])addEventListener(ev,()=>AU.unlock(),true);
addEventListener('touchstart',()=>{if(!touchUI){touchUI=true;relayout();syncUI();}},{capture:true,passive:true});
stage.addEventListener('touchstart',e=>{if(e.target.closest('button,.ov,input,label,#touch'))return;e.preventDefault();
  if(!running||paused||touch)return;const t=e.changedTouches[0],[x,y]=toGame(t);
  touch={id:t.identifier,sx:x,sy:y,px:P.x,py:P.y,x,y};touchFire=true;pressed.Fire=stampOf(e);},{passive:false});
stage.addEventListener('touchmove',e=>{if(!touch)return;e.preventDefault();for(const t of e.changedTouches)if(t.identifier===touch.id){const[x,y]=toGame(t);touch.x=x;touch.y=y;}},{passive:false});
const tEnd=e=>{for(const t of e.changedTouches)if(touch&&t.identifier===touch.id){touch=null;touchFire=false;}};
stage.addEventListener('touchend',tEnd);stage.addEventListener('touchcancel',tEnd);
const btn=(id,fn)=>$(id).addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();AU.unlock();fn(e);});
btn('bDash',e=>{if(running&&!paused)pressed.Dash=stampOf(e);});
btn('bEmp',e=>{if(running&&!paused)pressed.Emp=stampOf(e);});
btn('bPause',()=>{if(running)setPause(true);});

/* ---------- game state ---------- */
let running=false,paused=false,overlayReady=true,godMode=false;
let P,G,C;
const J={n:0,ok:0,last:null};
const MSGS=[];
const TIP={done:!!load('mnr_tipdone',false)};
const FPS={n:0,t:0,worst:0,slow:0};
const SENS=[1,1.25,1.5,1.9,2.4];                        // touch sensitivity 1..5: ship travel per finger travel
const say=s=>{s=String(s);if(MSGS.length<500)MSGS.push(s);return s;};
function banner(a,b,warn,t){t=t||3.2;G.banner={t,m:t,a:say(a),b:say(b),warn:!!warn};}
function newGame(daily){
  GR=daily?mul(todayN()):Math.random;GX=daily?mul(todayN()+7919):Math.random;
  P={x:140,y:H/2,hp:5,max:5,inv:2,dashT:0,dashCd:0,dx:1,dy:0,heat:0,over:false,wl:1,emp:2,fg:-1e9,dq:null,tilt:0,dashPf:false};
  C={n:0,best:0,last:-999,lb:0};
  G={spawnB:[],t:0,scroll:0,di:0,loop:0,dt:0,waveT:3.5,waveWait:false,en:[],eb:[],pb:[],pk:[],pt:[],fl:[],rings:[],delayed:[],score:0,mult:1,kills:0,boss:null,bossDone:false,
     banner:{t:0,m:3.2,a:'',b:'',warn:false},shake:0,glitch:0,flash:0,slow:1,dead:false,deadT:0,transT:-1,empT:0,
     daily:!!daily,live:false,spawns:[],perf:0,bc:0,lq:0,rev:-1,bp:0,note:{t:0,txt:''},hint:{t:0,txt:''},hint2:false,preload:false,over:false};
  SH.reset();AU.tier=1;enterDistrict(0);}
// Easy / Normal / Hard (settings > Gameplay), tuned with d-sim.js. Endless: d = enemy pace and fire rate, bs = bullet speed, fr = fire rate, xw = extra waves joining each wave once the run is warm.
// Story has its own ramp (ST.*, see story.js): sd, sbs, sfr scale it. fan = bullets added to every fan and ring, heal = hull drops, el = elite share.
const DIFFS={easy:{d:.85,bs:.9,fr:.85,xw:0,sd:.85,sbs:.92,sfr:.9,fan:-1,heal:1.5,el:0},
  normal:{d:1.75,bs:1.12,fr:1,xw:3.6,sd:1,sbs:1,sfr:1,fan:0,heal:1,el:0},
  hard:{d:2.6,bs:1.35,fr:1.7,xw:5.5,sd:1.3,sbs:1.15,sfr:1.25,fan:2,heal:.5,el:1}};
let DF=DIFFS.normal;
const frK=()=>ST.on?DF.sfr:DF.fr;
function diff(){if(ST.on)return ST.d*DF.sd;const ease=G.loop?1:clamp(.74+.26*G.t/150,.74,1);return(1+.16*G.di+.5*G.loop)*ease*DF.d;}   // endless: gentle first two and a half minutes
const bossX=()=>rotMode?690:790;                          // where a boss stops: portrait keeps it clear of the HUD at the top
const bossStage=k=>k===3?'boss2':'boss';   // final boss gets its own song
// Mini-bosses and the first boss (SEK-ADLER) keep the stage song and get a drum layer; the district bosses switch to the boss song, the final boss to boss2.
const bossSong=(k,mini)=>mini||k===0?null:bossStage(k);
const songFor=(i,loop)=>loop?['endless','endless2'][i%2]:['stage1','stage2','stage3'][i%3];
const stageFor=(i,boss)=>ST.on?ST.def.song:boss?bossStage(DISTRICTS[i%DISTRICTS.length].boss):songFor(i,G.loop);
function enterDistrict(i){G.di=i;G.dt=0;G.boss=null;G.bossDone=false;G.waveT=3.2;G.waveWait=false;G.preload=false;const D=DISTRICTS[i];bgFor(i);
  banner(D.name,D.sub+(G.loop?`  ·  SCHICHT ${G.loop+1}`:''),false,3.2);AU.root=D.root;AU.boss=false;
  if(G.live)AU.switchTo(stageFor(i,false));}

/* ---------- spawning ---------- */
function en(type,o){const d=diff();const base={drone:{r:14,hp:2,score:100},turret:{r:20,hp:8,score:300},charger:{r:13,hp:2,score:150},
  gunship:{r:36,hp:34,score:1200},gate:{r:12,hp:16,score:600}}[type];
  const e=Object.assign({type,t:0,flash:0,bf:fireIn(gx(.6,1.6)),bn:0,x:W+40,y:H/2},base,o);e.hp=Math.round(e.hp*(1+.35*(d-1))*(ST.on?ST.eh:1));
  if(!o.mini&&(type==='drone'||type==='charger'||type==='turret')&&GX()<eliteP()){e.el=1;e.hp=Math.round(e.hp*2);e.r=Math.round(e.r*1.25);e.score*=2;}   // elites: tougher, gold ring, shoot more
  e.max=e.hp;e.by=e.y;G.en.push(e);if(G.spawnB.length<80)G.spawnB.push(bpos());if(G.spawns.length<60)G.spawns.push([type,Math.round(e.by),Math.round(e.stop||e.gy||0)]);NR.emit('spawn',e);return e;}
const WAVES={
  droneLine(){const y=gr(80,H-150);for(let i=0;i<5;i++)en('drone',{x:W+30+i*55,y,amp:0});return 2.6;},
  droneSine(){const y=gr(130,H-170);for(let i=0;i<6;i++)en('drone',{x:W+30+i*46,y,amp:70,ph:i*.6});return 3;},
  droneV(){const y=gr(150,H-190);for(let i=-2;i<=2;i++)en('drone',{x:W+30+Math.abs(i)*50,y:y+i*46,amp:0});return 3;},
  turret(){en('turret',{y:gr(90,H-160),stop:gr(690,820)});if(G.di>1)en('turret',{y:gr(90,H-160),stop:gr(690,820),x:W+120});return 3.8;},
  chargers(){for(let i=0;i<3;i++)en('charger',{x:W+30+i*110,y:gr(60,H-110)});return 2.6;},
  gunship(){en('gunship',{x:W+90,y:gr(160,H-220)});return 5.5;},
  gate(){en('gate',{x:W+30,gy:gr(150,H-200),gap:130});return 3.8;}
};
const eliteP=()=>ST.on?ST.el:DF.el?.2+.1*G.di:0;
const bsM=()=>ST.on?ST.bs*DF.sbs:DF.bs;                    // bullet speed: rises stage by stage in Story; Easy -12%, Hard +20%
function eb(x,y,a,s,c,r=5){const k=PW.bs*bsM();G.eb.push({x,y,vx:Math.cos(a)*s*k,vy:Math.sin(a)*s*k,r,c:BULLET,g:false,sl:PW.bs!==1});}
const aim=e=>Math.atan2(P.y-e.y,P.x-e.x);
function fan(e,n,sp,s,c){n=Math.max(2,n+(ST.on?2*Math.floor(ST.lvl/4):0)+DF.fan);const a=aim(e);for(let i=0;i<n;i++)eb(e.x-20,e.y,a-sp/2+sp*i/(n-1),s,c);}
function ring(e,n,s,off,c){n=Math.max(6,n+(ST.on?Math.floor(ST.lvl/2):0)+DF.fan);for(let i=0;i<n;i++)eb(e.x,e.y,off+i*Math.PI*2/n,s,c,6);}
function spawnBoss(o){o=o||{};const D=DISTRICTS[G.di],k=o.k!=null?o.k:D.boss,mini=!!o.mini;
  const tab=[['fan5','summon','fan7','ring'],['spiral','ring','fan5','spiral','summon'],['laser','ring','laser','fan7','spiral'],['spiral','laser','ring','fan9','summon','laser','fan7']];
  const pats=o.pats||tab[k]||ATAB[k];
  const hp=o.hp||Math.round((340+110*Math.min(k,4))*(1+.35*G.loop)*(G.loop||G.t>180?1:.85)*(DF.el?1.25:1));
  const nm=o.nm||D.bossName;
  G.boss={type:'boss',k,mini,nm,lbl:o.lbl,x:W+120,y:H/2,r:o.r||(k===3?54:46),hp,max:hp,t:0,flash:0,lists:[pats.slice(0,Math.max(2,Math.ceil(pats.length/2))),pats,pats],ph:1,pi:0,pc:-2,bt:0,cnt:0,sa:0,lasers:[],score:o.score||5000*(k+1),
    col:o.col||[D.a,D.b,D.a,D.a][k]||D.a,p2:mini?8:16,p3:mini?16:32};
  G.en.push(G.boss);banner('WARNUNG',nm+' · '+(o.sub||D.bossSub),true,3);AU.boss=true;AU.sfx('warn');
  if(G.live){const sg=bossSong(k,mini);if(sg){AU.switchTo(sg);AU.intense(false);}else AU.intense(true);}
  return G.boss;}

/* ---------- effects + scoring ---------- */
function burst(x,y,col,n=18,sp=260,life=.6){if(!SET.part)return;if(SET.calm){if(FXV.near(x,y))return;n=Math.ceil(n*.25);life*=.45;}for(let i=0;i<n;i++){const a=rnd(0,7),s=rnd(40,sp);G.pt.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:rnd(life*.5,life),m:life,c:col,sz:rnd(1.5,3.5)});}}
function floater(x,y,txt,c='#ffffff'){G.fl.push({x,y,txt:say(txt),c,l:1});}
const shake=v=>{G.shake=Math.max(G.shake,v*[0,.45,1][SET.shake]*(SET.rm?.3:1));};
const TS=6,TIERS=4;                                      // power points per tier, number of tiers
const tierOf=n=>Math.min(TIERS,1+Math.floor(n/TS));
const comboK=()=>tierOf(C.n);                            // score multiplier = tier (x1..x4)
const TIERC=['#8c86b8','#19e3ff','#ffe14d','#ff2d95'];  // meter colour per tier
function tierSet(n,why,x,y){const t0=tierOf(C.n);C.n=clamp(n,0,TIERS*TS-1);const t1=tierOf(C.n);AU.tier=t1;
  if(t1!==t0){G.tpop=.7;G.tdir=t1>t0?1:-1;
    if(t1>t0){floater(x==null?P.x:x,(y==null?P.y:y)-52,'TIER ×'+t1,TIERC[t1-1]);AU.sfx('tier');G.rings.push({x:P.x,y:P.y,l:.6,m:.6,c:TIERC[t1-1]});G.flash=Math.max(G.flash,.1*FX());
      NR.emit('tier',{tier:t1,why});try{if(navigator.vibrate)navigator.vibrate(20);}catch(e){}}
    else{floater(P.x,P.y-40,'TIER ×'+t1,'#ff6a7a');NR.emit('tier',{tier:t1,why});}}}
function tierGain(pts,beat,kind,x,y){if(C.last===beat&&kind!=='dash')return false;C.last=beat;G.perf++;C.lb=G.bc;C.best=Math.max(C.best,C.n+pts);tierSet(C.n+pts,kind,x,y);return true;}
function tierDrop(why){if(C.n<=0)return;tierSet(C.n-TS,why);C.lb=G.bc;}
function onPerfect(kind,j,x,y){J.ok++;G.rings.push({x,y,l:.5,m:.5,c:kind==='dash'?'#19e3ff':'#ffe14d'});
  floater(x,y-30,kind==='dash'?'ON BEAT':'PERFECT','#ffe14d');AU.sfx('perfect');
  tierGain(kind==='dash'?3:1,j.beat,kind,x,y);NR.emit('perfect',{kind,x,y,combo:C.n});
  try{if(navigator.vibrate)navigator.vibrate(12);}catch(e){}}
// a graze is judged against the beat grid; the dash is judged and snapped in update()
function tryPerfect(kind,ts,x,y){const j=judge(ts);J.n++;J.last={kind,ok:j.ok,dt:Math.round(j.dt),beat:j.beat,at:performance.now()};
  if(j.ok&&(kind!=='graze'||C.last!==j.beat))onPerfect(kind,j,x,y);return j.ok;}
const healK=()=>(ST.on?ST.heal:1)*DF.heal;
function kill(e){const D=DISTRICTS[G.di];G.kills++;NR.emit('kill',{e,boss:false});const m=e.pf?2:1,pts=Math.round(e.score*G.mult*comboK()*m);G.score+=pts;floater(e.x,e.y-10,'+'+pts,m>1?'#ffe14d':D.b);if(e.pf)tierGain(1,Math.round(bpos()),'kill',e.x,e.y);
  burst(e.x,e.y,D.a,e.type==='gunship'?50:22,e.type==='gunship'?380:260);burst(e.x,e.y,'#ffffff',8,160,.3);if(SET.calm)G.rings.push({x:e.x,y:e.y,l:.35,m:.35,c:D.a});AU.sfx('boom');
  const drop=(t,dx=0,dy=0)=>G.pk.push({t,x:e.x+dx,y:e.y+dy,vx:rnd(-40,20),vy:rnd(-60,60),bob:rnd(0,7)});
  if(e.type==='drone'||e.type==='charger'){if(GX()<.6||e.el)drop('shard');}
  else if(e.type==='turret'){drop('shard',-8);drop('shard',8);if(GX()<.15)drop(P.wl<3?'up':'emp');}
  else if(e.type==='gunship'){drop(P.wl<3&&GX()<.6?'up':'emp');for(let i=0;i<4;i++)drop('shard',rnd(-20,20),rnd(-20,20));}
  else if(e.type==='gate'){for(let i=0;i<3;i++)drop('shard',0,rnd(-30,30));}
  if(GX()<.035*healK()&&P.hp<P.max)drop('hp');}
// a dash waiting for its beat already protects the ship (P.dq)
function hurt(){if(P.inv>0||P.dashT>0||P.dq||G.dead||godMode||ST.over)return;if(SH.absorb())return;P.hp--;ST.hits++;P.inv=1.5;G.mult=Math.max(1,Math.floor(G.mult*5)/10);tierDrop('hit');G.glitch=.45*FX();G.flash=.25*FX();AU.sfx('hurt');
  burst(P.x,P.y,'#ff3050',24,300);if(P.hp<=0)die();}
function die(){G.dead=true;G.deadT=0;G.slow=.3;shake(16);burst(P.x,P.y,'#ffffff',40,420,1);burst(P.x,P.y,DISTRICTS[G.di].a,60,500,1.2);AU.sfx('big');}

/* ---------- beat events: waves, enemy fire, boss phases ---------- */
function beatPump(){const p=bpos(),q=Math.floor(p*4);G.bp=p;
  if(G.rev!==BT.rev){G.rev=BT.rev;G.lq=q-1;}
  if(q-G.lq>8)G.lq=q-1;                                  // after a stall, skip instead of firing a burst
  for(let i=G.lq+1;i<=q;i++){onTick(i);if(((i%4)+4)%4===0)onBeat(Math.floor(i/4));}
  G.lq=q;}
function onTick(i){const e=G.boss;if(e&&e.x<=bossX()&&e.pc>=0&&e.lists[e.ph-1][e.pi%e.lists[e.ph-1].length]==='spiral'&&!G.dead){
  const sp=e.ph===3?1.1:1;e.sa+=.36;const arms=3+(ST.on?(ST.lvl>=6)+(ST.lvl>=10):0)+(DF.el?1:0);for(let j=0;j<arms;j++)eb(e.x,e.y,e.sa+j*6.2832/arms,(150+10*diff())*sp,'#ff3dbb',5);}}
function onBeat(i){G.bc++;const d=diff();NR.emit('beat',{i});if(i%4===0)NR.emit('bar',{i,bar:i/4});
  if(C.n>0&&G.bc-C.lb>8+SH.ck)tierDrop('idle');                    // the tier slips one step after 8 beats without a gain
  if(G.waveWait&&i%4===0&&!G.dead&&!G.boss&&!G.bossDone&&!ST.over){const D=DISTRICTS[G.di],wl=ST.on?ST.def.waves:D.waves;G.waveWait=false;
    const ease=ST.on?ST.dens:G.loop?1:clamp(1.15-.15*G.t/150,1,1.15);
    G.waveT=barQ(WAVES[gpick(wl)]()/(0.8+0.2*d)*ease);
    if(ST.on){for(let k=ST.x;k>0;k--)if(k>=1||GR()<k)WAVES[gpick(wl)]();}
    else{const xt=DF.xw*clamp((G.t-12)/90,0,1)+.1*G.di+.5*G.loop;for(let k=xt;k>0;k--)if(k>=1||GR()<k)WAVES[gpick(wl)]();}}
  if(G.dead)return;
  for(const e of G.en){
    if(e.type==='boss'){bossBeat(e,d);continue;}
    if(e.type==='drone'){if(--e.bf<=0){if(e.x<W-30&&e.x>P.x+60){if(e.el)fan(e,3,.42,150+22*d,'#ffd23d');else eb(e.x,e.y,aim(e),150+22*d);}e.bf=fireIn(gx(1.8,3)/d/frK()/(e.el?1.3:1));}}
    else if(e.type==='turret'){if(e.t<6.5&&e.x<=e.stop&&--e.bf<=0){fan(e,3+(d>1.4||e.el?2:0),.5,170+15*d,e.el?'#ffd23d':'#ffa02d');e.bf=fireIn(1.5/d/frK());}}
    else if(e.type==='gunship'){if(e.x<W-100&&--e.bf<=0){e.bn++;if(e.bn%2)ring(e,12+2*G.di,120+12*d,e.t,'#ff3dbb');else fan(e,3,.3,210,'#ffa02d');e.bf=fireIn(1.4/d);}}
  }}
function bossBeat(e,d){e.bt++;const bar=Math.floor(e.bt/4),ph=bar>=e.p3?3:bar>=e.p2?2:1;     // phases change on bar 16 and bar 32 (mini-bosses: 8 and 16)
  if(ph!==e.ph){e.ph=ph;e.pi=0;e.pc=-2;e.cnt=0;G.eb=[];e.lasers=[];banner(ph===2?'PHASE 2':'FINAL PHASE',e.nm,true,2.2);G.flash=Math.max(G.flash,.25*FX());shake(10);AU.sfx('phase');return;}
  if(e.x>bossX()||G.dead)return;
  const list=e.lists[e.ph-1];e.pc++;if(e.pc<0)return;if(e.pc>=8){e.pc=0;e.pi=(e.pi+1)%list.length;e.cnt=0;}
  const c=e.pc,cad=e.ph===3?1:2,sp=e.ph===3?1.1:1,c2='#ffa02d';
  switch(list[e.pi%list.length]){
    case'fan5':if(c%cad===0)fan(e,5,.9,(190+15*d)*sp,c2);break;
    case'fan7':if(c%cad===0)fan(e,7,1.2,(180+15*d)*sp,c2);break;
    case'fan9':if(c%cad===0)fan(e,9,1.5,(190+15*d)*sp,c2);break;
    case'ring':if(c%cad===0){ring(e,14+2*Math.min(e.k,3),(140+10*d)*sp,e.cnt*.21,'#ff3dbb');e.cnt++;}break;
    case'summon':if(c===0||c===4||(e.ph===3&&(c===2||c===6))){en('drone',{x:W+20,y:gx(60,H-100),amp:40,ph:gx(0,6)});en('charger',{x:W+60,y:gx(60,H-100)});}break;
    case'laser':if(c%(ST.on&&ST.lvl>=8||DF.el?2:3)===0)e.lasers.push({x:e.x-30,y:e.y,a:aim(e),t:0});break;}}

/* ---------- update ---------- */
function update(dt){
  if(SH.active){SH.tick(dt);return;}                      // pit stop: the world waits
  G.t+=dt;const D=DISTRICTS[G.di],d=diff();
  const sdt=dt*G.slow;const spT=(G.boss?.63:1)*52*BT.bpm/60;if(!G.spd)G.spd=spT;G.spd+=(spT-G.spd)*Math.min(1,dt*3/(4*BT.spb));G.scroll+=G.spd*sdt;   // scroll = 52 px per beat, glides over a bar when the song changes
  
  if(G.banner.t>0)G.banner.t-=dt;if(G.note.t>0)G.note.t-=dt;if(G.hint.t>0)G.hint.t-=dt;
  G.shake=Math.max(0,G.shake-40*dt);G.glitch=Math.max(0,G.glitch-dt);G.flash=Math.max(0,G.flash-dt);G.empT=Math.max(0,G.empT-dt);
  for(const x of G.delayed){x.t-=dt;if(x.t<=0){x.dead=1;x.f();}}G.delayed=G.delayed.filter(x=>!x.dead);
  if(G.dead){G.deadT+=dt;if(G.deadT>2.2)gameOver();}
  if(!G.dead){beatPump();
    if(G.t>1.5&&!G.hint.txt&&!TIP.done){G.hint={t:6,txt:say('Dash on the pulse to power up')};}}   // the one hint, until the first on-beat dash
  else G.bp=bpos();

  /* player */
  if(!G.dead){
    let mx=(K.ArrowRight||K.KeyD?1:0)-(K.ArrowLeft||K.KeyA?1:0),my=(K.ArrowDown||K.KeyS?1:0)-(K.ArrowUp||K.KeyW?1:0);
    if(mx||my){const l=Math.hypot(mx,my);P.dx=mx/l;P.dy=my/l;}
    const dashTs=pressed.ShiftLeft||pressed.ShiftRight||pressed.KeyK||pressed.Dash;
    const canDash=()=>P.dashCd<=0||SH.spare>0;
    // DASH is snapped to the beat: a press inside the window waits for the beat (at most the window), then counts as on-beat. Outside the window it dashes at once, off-beat, and the tier drops.
    const goDash=(on,j)=>{if(P.dashCd>0)SH.spare--;P.dashT=.2;P.dashCd=1;if(!(mx||my)&&!touch){P.dx=1;P.dy=0;}AU.sfx('dash');
      P.dashPf=on;
      if(on){P.dashCd=.5;G.score+=Math.round(200*G.mult*comboK());J.n++;J.last={kind:'dash',ok:true,dt:Math.round(j.dt),beat:j.beat,at:performance.now()};onPerfect('dash',j,P.x,P.y);
        if(!TIP.done){TIP.done=true;save('mnr_tipdone',true);}}
      else{J.n++;J.last={kind:'dash',ok:false,dt:Math.round(j.dt),beat:j.beat,at:performance.now()};tierDrop('late');floater(P.x,P.y-30,'OFF BEAT','#ff6a7a');}};
    if(dashTs&&!P.dq&&canDash()){const j=judge(dashTs);
      if(!j.ok)goDash(false,j);
      else{const rem=(j.beat-bpos())*BT.spb;if(rem>.006&&!SET.all)P.dq={beat:j.beat,j,t:.3};else goDash(true,j);}}
    else if(P.dq){P.dq.t-=dt;if(bpos()>=P.dq.beat-.002||P.dq.t<=0){const q=P.dq;P.dq=null;if(canDash())goDash(true,q.j);}}
    P.dashT=Math.max(0,P.dashT-sdt);P.dashCd=Math.max(0,P.dashCd-sdt);P.inv=Math.max(0,P.inv-sdt);if(P.dashT<=0)P.dashPf=false;
    const py0=P.y;
    if(P.dashT>0){P.x+=P.dx*1050*sdt;P.y+=P.dy*1050*sdt;if(!SET.calm&&Math.random()<.9)G.pt.push({x:P.x,y:P.y,vx:0,vy:0,l:.25,m:.25,c:D.b,sz:10,ghost:1});}
    else if(touch){const sk=SENS[SET.sens-1]||1.5,tx=touch.px+(touch.x-touch.sx)*sk,ty=touch.py+(touch.y-touch.sy)*sk;const ddx=tx-P.x,ddy=ty-P.y,l=Math.hypot(ddx,ddy);
      if(l>1){P.dx=ddx/l;P.dy=ddy/l;}const s=Math.min(l,520*sdt);if(l>0){P.x+=ddx/l*s;P.y+=ddy/l*s;}}
    else{const l=Math.hypot(mx,my)||1;P.x+=mx/l*300*sdt;P.y+=my/l*300*sdt;}
    const cx=clamp(P.x,rotMode?64:24,W-60),cy=clamp(P.y,36,H-54);   // portrait keeps the ship above the tier meter
    if(touch){if(cx!==P.x||P.dashT>0){touch.sx=touch.x;touch.px=cx;}if(cy!==P.y||P.dashT>0){touch.sy=touch.y;touch.py=cy;}}   // finger past the edge: re-anchor, no dead zone
    P.x=cx;P.y=cy;
    P.tilt+=(clamp((P.y-py0)/(sdt*300||1),-1,1)*.25-P.tilt)*Math.min(1,dt*10);
    if(pressed.KeyX||pressed.KeyL||pressed.Emp){if(P.emp>0){P.emp--;G.empT=.6;G.flash=Math.max(G.flash,.3*FX());shake(9);AU.sfx('emp');
      for(const b of G.eb){burst(b.x,b.y,D.b,2,80,.4);G.score+=5;}G.eb=[];G.en.forEach(e=>{if(e.type!=='boss')e.hp-=10;else e.hp-=25;e.flash=.2;});if(G.boss)G.boss.lasers=[];}}
    // the ship shoots itself on a grid of the beat (a 16th note for the Courier): one shot per grid cell, shots on the beat itself are gold pulse shots
    const firing=SET.auto||K.Space||K.KeyJ||touchFire;
    const gs=SH.gridStep(),cell=Math.floor(G.bp/gs+1e-6),fresh=cell>P.fg;P.fg=cell;
    if(P.over){P.heat-=48*sdt;if(P.heat<=25)P.over=false;}
    else if(firing&&fresh){const fr=SH.shot(),x=P.x+22,y=P.y+2,pf=Math.abs(cell*gs-Math.round(cell*gs))<.01?1:0;P.heat+=fr.heat;
      SH.volley(x,y,pf);NR.emit('fire',{x,y,pf});SH.extra(cell,gs);
      AU.sfx('shot');if(P.heat>=100){P.heat=100;P.over=true;AU.sfx('heat');floater(P.x,P.y-24,'OVERHEAT','#ff5050');}}
    if(firing&&!P.over)P.heat=Math.max(0,P.heat-4*sdt);else if(!firing)P.heat=Math.max(0,P.heat-34*sdt);
    if(!SET.calm&&Math.random()<.7)G.pt.push({x:P.x-18,y:P.y+rnd(-2,2)+2,vx:rnd(-220,-120),vy:rnd(-15,15),l:.3,m:.3,c:D.a,sz:rnd(2,4)});
  }
  pressed={};

  /* waves & boss trigger */
  if(ST.on){ST.tick(dt);}
  else if(!G.dead&&!G.boss&&!G.bossDone){G.dt+=dt;G.waveT-=dt;
    if(G.dt>=distLen()){if(G.en.length===0||G.dt>distLen()+6)spawnBoss();}
    else if(G.waveT<=0)G.waveWait=true;                   // the wave itself enters on the next bar
    if(!G.preload&&G.dt>10){G.preload=true;const n=(G.di+1)%DISTRICTS.length;loadTrack(stageFor(G.di,true));loadTrack(stageFor(n,false));}}
  if(G.transT>=0&&!ST.on){G.transT-=dt;if(G.transT<0){NR.emit('districtEnd',{di:G.di});let n=G.di+1;if(n>=DISTRICTS.length){n=0;G.loop++;}SH.pit(()=>enterDistrict(n));}}

  /* enemies */
  for(const e of G.en){e.t+=sdt;e.flash=Math.max(0,e.flash-dt);
    switch(e.type){
      case'drone':e.x-=(120+15*d)*sdt;e.y=e.by+Math.sin(G.bp*Math.PI/2+(e.ph||0))*(e.amp||0);break;
      case'turret':if(e.t<6.5){if(e.x>e.stop)e.x-=150*sdt;}else{e.x-=180*sdt;e.y-=40*sdt;}break;
      case'charger':if(e.t<.7)e.x-=130*sdt;else if(e.t<1.3){e.y+=(P.y-e.y)*Math.min(1,sdt*5);e.aimL=1;}else{e.aimL=0;e.x-=(600+60*d)*sdt*(e.el?1.2:1);}break;
      case'gunship':if(e.x>W-170)e.x-=60*sdt;else e.y=e.by+Math.sin(e.t*.8)*60;
        if(e.t>13)e.x-=90*sdt;break;
      case'gate':e.x-=95*sdt;if(G.di>=3||G.loop)e.gy+=Math.sin(e.t*1.4)*40*sdt;{const cyc=e.t%2.8;e.on=cyc>1.1;e.tele=cyc>.7&&cyc<=1.1;}
        if(e.on&&!G.dead&&Math.abs(P.x-e.x)<9&&(P.y<e.gy-e.gap/2+4||P.y>e.gy+e.gap/2-4))hurt();break;
      case'boss':bossUpdate(e,sdt,d);break;}
    if(e.type!=='gate'&&e.type!=='boss'&&!G.dead&&Math.hypot(P.x-e.x,P.y-e.y)<e.r+8){hurt();if(e.type!=='gunship')e.hp=0;}
    if(e.type==='boss'&&!G.dead&&Math.hypot(P.x-e.x,P.y-e.y)<e.r+6)hurt();
  }
  /* player bullets */
  for(const b of G.pb){const hk=SH.hm||(SET.aim?.6:0);if(hk)SH.steer(b,sdt,hk);b.x+=b.vx*sdt;b.y+=b.vy*sdt;
    for(const e of G.en){if(e.hp<=0||e.dying)continue;let hit=false;
      if(e.type==='gate'){hit=Math.abs(b.x-e.x)<14&&(Math.abs(b.y-(e.gy-e.gap/2))<16||Math.abs(b.y-(e.gy+e.gap/2))<16);}
      else hit=(b.x-e.x)**2+(b.y-e.y)**2<(e.r+4+(b.rad||0))**2;
      if(hit&&b.px&&b.px.has(e))continue;
      if(hit&&(e.type!=='boss'||e.x<W-20)){e.hp-=b.dm*(b.pf?SH.sharp:1);e.flash=.06;e.pf=b.pf;if(b.px)b.px.add(e);else b.dead=1;G.score+=2;if(Math.random()<.3)burst(b.x,b.y,'#ffffff',3,120,.2);AU.sfx('hit');break;}}
    if(b.x>W+30||b.y<-20||b.y>H+20)b.dead=1;}
  G.pb=G.pb.filter(b=>!b.dead);
  for(const e of G.en){if(e.hp<=0&&!e.dead){e.dead=1;if(e.type==='boss')bossDown(e);else kill(e);}
    if(e.x<-120||e.y<-120)e.dead=1;}
  G.en=G.en.filter(e=>!e.dead);

  /* enemy bullets */
  for(const b of G.eb){b.x+=b.vx*sdt;b.y+=b.vy*sdt;if(b.x<-30||b.x>W+30||b.y<-30||b.y>H+30){b.dead=1;continue;}
    if(G.dead)continue;const dd=Math.hypot(b.x-P.x,b.y-P.y);
    if(P.dashT>0&&dd<26){b.dead=1;G.score+=Math.round(25*G.mult*(P.dashPf?2:1));P.heat=Math.max(0,P.heat-6);burst(b.x,b.y,D.b,4,120,.3);continue;}
    if(dd<b.r+3){b.dead=1;hurt();continue;}
    if(!b.g&&dd<24){b.g=1;const pf=tryPerfect('graze',null,P.x,P.y);G.score+=Math.round(10*G.mult*(pf?2:1));P.heat=Math.max(0,P.heat-4);G.mult=Math.min(9.9,G.mult+.02);
      if(!SET.calm)G.pt.push({x:(b.x+P.x)/2,y:(b.y+P.y)/2,vx:0,vy:-30,l:.3,m:.3,c:'#ffffff',sz:2});AU.sfx('graze');}}
  G.eb=G.eb.filter(b=>!b.dead);

  /* pickups */
  for(const p of G.pk){p.bob+=dt*4;const dx=P.x-p.x,dy=P.y-p.y,l=Math.hypot(dx,dy);
    if(l<NR.mod.mag&&!G.dead){p.vx+=dx/l*1400*sdt;p.vy+=dy/l*1400*sdt;}else{p.vx+=(-70-p.vx)*sdt*2;p.vy*=1-sdt*2;}
    p.x+=p.vx*sdt;p.y+=p.vy*sdt;
    if(l<22&&!G.dead){p.dead=1;AU.sfx('pick');
      if(p.t==='shard'){G.mult=Math.min(9.9,+(G.mult+.1).toFixed(1));G.score+=Math.round(50*G.mult);}
      if(p.t==='hp'){P.hp=Math.min(P.max,P.hp+1);floater(P.x,P.y-24,'HULL +1','#3dffb0');}
      if(p.t==='up'){P.wl=Math.min(3,P.wl+1);floater(P.x,P.y-24,'WEAPON LV'+P.wl,'#ff2d95');AU.sfx('up');}
      if(p.t==='emp'){P.emp=Math.min(3,P.emp+1);floater(P.x,P.y-24,'EMP +1','#ffb020');}
      if(p.t==='pw')NR.emit('pickup',p);}
    if(p.x<-30)p.dead=1;}
  G.pk=G.pk.filter(p=>!p.dead);
  for(const p of G.pt){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.96;p.vy*=.96;p.l-=dt;}G.pt=G.pt.filter(p=>p.l>0);
  const ptCap=[0,60,300][SET.part];if(G.pt.length>ptCap)G.pt.splice(0,G.pt.length-ptCap);
  for(const f of G.fl){f.y-=30*dt;f.l-=dt;}G.fl=G.fl.filter(f=>f.l>0);
  for(const r of G.rings)r.l-=dt;G.rings=G.rings.filter(r=>r.l>0);
  if(!G.dead&&G.slow<1)G.slow=Math.min(1,G.slow+dt);
  NR.emit('tick',dt);
  SH.upd(sdt);
}

function bossUpdate(e,dt,d){
  if(e.x>bossX()){e.x-=110*dt;e.y=H/2-20;return;}
  e.y=H/2-20+Math.sin(e.t*.7)*150;
  for(const l of e.lasers){l.t+=dt;if(l.t>2*BT.spb&&l.t<3.1*BT.spb&&!G.dead){const vx=Math.cos(l.a),vy=Math.sin(l.a),px=P.x-l.x,py=P.y-l.y,pr=px*vx+py*vy;
      if(pr>0&&Math.abs(px*vy-py*vx)<9)hurt();}}
  e.lasers=e.lasers.filter(l=>l.t<3.1*BT.spb);}
function bossDown(e){const D=DISTRICTS[G.di];G.kills++;NR.emit('kill',{e,boss:true});const m=e.pf?2:1,pts=Math.round(e.score*G.mult*comboK()*m);G.score+=pts;floater(e.x,e.y-40,'+'+pts,D.b);
  for(let i=0;i<5;i++){const bx=e.x,by=e.y;G.delayed.push({t:i*.16,f:()=>{burst(bx+rnd(-40,40),by+rnd(-40,40),i%2?D.a:'#ffffff',40,420,1);AU.sfx('boom');}});}
  AU.sfx('big');shake(22);G.flash=Math.max(G.flash,.4*FX());G.eb=[];G.boss=null;G.bossDone=true;AU.boss=false;AU.intense(false);
  if(!ST.on){const n=G.di+1,L=n>=DISTRICTS.length?G.loop+1:G.loop;if(G.live)AU.switchTo(songFor(n%DISTRICTS.length,L));}   // back to a stage song on the next bar line
  if(!ST.on||GX()<ST.heal)G.pk.push({t:'hp',x:e.x,y:e.y,vx:-80,vy:-40,bob:0});
  G.pk.push({t:P.wl<3?'up':'emp',x:e.x,y:e.y,vx:-80,vy:40,bob:0});
  for(let i=0;i<8;i++)G.pk.push({t:'shard',x:e.x+rnd(-30,30),y:e.y+rnd(-30,30),vx:rnd(-160,-40),vy:rnd(-90,90),bob:0});
  if(ST.on){ST.bossDown(e,pts);return;}
  banner('SEKTOR FREI',D.name+' cleared · +'+pts,false,3);G.transT=4.5;}

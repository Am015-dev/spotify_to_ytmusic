// PURPOSE: Street 3: the Zeil street as ONE 2.5-3 min stage on ONE song, threat rising gradually to a late peak, sheets loaded before play, steady frame rates, street lighting
// FLAG: street3 (?street3=0 = the street2 stage exactly)
// TEST: qa/street3-test.js
/* ---------- STREET3. Owner, 22 Oct 2026 (tested on foot): "stop making more stages, focus on one stage. The old assets load before the new ones; the assets are blurring;
   the sprites are moving fast and abnormally, idle looks not smooth; enemy sprites also move fast and look abnormal; better lighting and shadows; one stage, one song,
   max 3 minutes; the difficulty should increase gradually". Builds on street2.js (same props, foes and climax), changes:
   1. TIME: the camera may not run ahead of a gate that moves with the stage clock (SL.back), so the run lasts about the same for everyone: 8 beats of calm, then 12 waves whose
      threat score (rusher 1, gunner 2, heavy 4) grows linearly from 2 to 8 to the peak at ~81-85% of the run, a breather, the big heavy once the street is clear. No locks, no checkpoint, no captions,
      no music cues: one song (street1, 192 s) from start to end (musicpack's lock/boss/clear switches are blocked for this stage). S3.log.waves = the threat curve.
   2. LOADING: the STREET RUN hold (footq.js) also waits for the painted street (foot/bg-*) and prop pictures, so the first frame is the full-size art (no swap).
   3. ANIMATION: no cross-fade on foot sheets (it doubled the outline = blur), idle ping-pong at 7 fps, shots/melee 12 fps one-shots, a walk/idle change waits for the
      next 1/12 s frame boundary, foes walk and approach at 70% of the street2 speed (lunges and charges as before).
   4. LIGHT: lamp pools that light whoever passes, neon spill, a wet-road reflection, contact shadows under props, one colour grade (under the HUD).
   5. A RUN TWICE AS LONG: one heart more, a heal drops beside Kai when he is two hearts down, gunners reload 1.4x slower, at most 5 foes at once. ---------- */
if(RET.street3===undefined)RET.street3=!/[?&]street3=0/.test(location.search);
(function(){
if(!RET.street3||!RET.street2||!window.FOOT||!FOOT.STAGES||!FOOT.STAGES.zeil||!FOOT.STAGES.zeil.s2||!FOOT._in)return;
const F=FOOT,IN=F._in,ST=F.STAGES.zeil,FL=470,abs=Math.abs,clamp=(v,a,b)=>v<a?a:v>b?b:v;
const S3=F.S3={GCD:1.4,ART:typeof ART!=='undefined'?ART:null,log:null,up:0,upKey:'',phDraw:0,full:0,SPD:.7,
  T:{beats:8,boss:150,waves:12,peakT:140,t0:2,thr0:2,thrPeak:8,cap:5},
  TH:{rusher:1,gunner:2,heavy:4,bigheavy:8}};
const on=()=>RET.street3&&F.S&&F.S.st===ST;
/* ----- the stage: street2's rooms stretched over a longer road (the gate decides the pace, not the length) ----- */
const SX=7300/6200;ST.len=8200;ST.boss={x:7700,id:'bigheavy'};ST.cp=0;ST.cps=[];ST.locks=[];ST.waves=[];ST.s3=1;ST.song='stage2';
ST.props=ST.props.map(p=>[Math.round(p[0]*SX),p[1],p[2]]);ST.plats=ST.plats.map(p=>[Math.round(p[0]*SX),p[1],p[2]]);
if(F.SEC)for(const r of F.SEC)r.x=Math.round(r.x*SX);
const xAt=t=>Math.round(7220*t/150+520);ST.pk=[[xAt(38),'ammo'],[xAt(92),'ammo'],[xAt(141),'ammo']];   // ammo where the clock puts Kai; heals drop next to Kai (below)
/* the wave plan: 12 waves, threat 2 -> 8 in equal steps (monotonic), a heavy in every third wave from threat 7 up, one gunner a wave, two from wave 7 */
function plan(intro){const T=S3.T,N=T.waves,out=[];for(let i=0;i<N;i++){const t=intro+i*(T.peakT-intro)/(N-1),thr=Math.round(T.thr0+(T.thrPeak-T.thr0)*i/(N-1));
    let b=thr;const u=[];if(b>=7&&(N-1-i)%3===0){u.push('heavy');b-=4;}let g=Math.min(i<6?1:2,Math.floor(b*.3/2));if(i>=1&&g<1&&b>=3)g=1;for(let j=0;j<g;j++){u.push('gunner');b-=2;}while(b>0){u.push('rusher');b--;}
    out.push({i,t:+t.toFixed(1),thr,units:u,left:u.slice(),next:t,spawned:0});}return out;}
S3.plan=plan;
const gate=(S,vw)=>{const bc=Math.min(ST.boss.x-vw/2,ST.len-vw);return clamp(bc*S.time/S3.T.boss,0,bc);};
/* the camera never runs ahead of the clock */
if(F.look&&F.look.back){const b0=F.look.back;F.look.back=function(S,P,vw,want){const w=b0.apply(this,arguments);return S.s3&&S.st===ST?Math.min(w,Math.max(S.s3.gate,S.camX)):w;};}   // holds the camera, never pulls it back
const s2step=ST.hook.step;
ST.hook.step=function(S,dt,env){s2step.call(this,S,dt,env);if(!RET.street3)return;const vw=env.G.viewW||960,P=S.P;
  if(!S.s3){const bpm=(typeof BT!=='undefined'&&BT.bpm>40?BT.bpm:120),intro=+(S3.T.beats*60/bpm).toFixed(2);
    S.P.max++;S.P.hp++;   // a run twice as long as street2's: one heart more
    S.s3={intro,bpm,gate:0,waves:plan(intro),spawnLog:[],live:[],held:0,boss:0};S3.log=S.s3;
    for(const p of S.pr)if(p.draw&&!p._d3){const d0=p.draw;p._d3=1;p.draw=(c,K,at)=>{propShadow(c,p);return snap(c,()=>d0(c,K,at));};}}
  const f=S.s3;f.gate=gate(S,vw);S.idleSpawn=S.time+60;   // the clock sets the pace: standing at the gate is not camping (no idle spawns of other foes)
  const bc=Math.min(ST.boss.x-vw/2,ST.len-vw);
  const alive0=S.E.some(e=>!e.dead&&!e.boss);
  if(!S.bossOn&&f.gate>=bc-40&&(!alive0||S.time>S3.T.boss+12)){S.bossOn=true;S.lock={id:'boss',cam:bc};S.bossAt=S.time+1.2;f.boss=+S.time.toFixed(1);}   // the boss comes in quietly (no warning sting), once the street is clear (12 s at most)
  const alive=S.E.filter(e=>!e.dead).length;
  if(!f.bh&&S.time>=S3.T.peakT+6&&P.hp>0&&P.hp<P.max){f.bh=1;f.healN=(f.healN|0)+1;S.pk.push({k:'heal',x:clamp(P.x+P.facing*60,S.camX+40,S.camX+vw-40),y:FL-16,vy:0,t:0,on:true,fix:1});}   // the breather: one heal before the big heavy
  if(S.time>20&&S.time-(f.lastHeal||0)>12&&P.hp>0&&P.hp<=P.max-2&&!S.pk.some(q=>q.k==='heal')){f.lastHeal=S.time;f.healN=(f.healN|0)+1;S.pk.push({k:'heal',x:clamp(P.x+P.facing*60,S.camX+40,S.camX+vw-40),y:FL-16,vy:0,t:0,on:true,fix:1});}   // two hearts down: a heal drops beside Kai (at most one every 12 s)
  for(const w of f.waves){if(S.time<w.next||!w.left.length)continue;if(alive>=S3.T.cap){w.next=S.time+.4;f.held++;continue;}   // never more than 5 on the street: the next one waits
    const id=w.left.shift(),fromL=id==='rusher'&&w.i>=3&&(w.spawned%3===2),x=fromL?S.camX-40:S.camX+vw+40;
    const e=F.env.spawn(id,x,null);if(e){w.spawned++;f.spawnLog.push([+S.time.toFixed(1),id,w.i]);}w.next=S.time+(id==='heavy'?1.6:.9);break;}
  if(f.hp0!==P.hp){(f.hpLog||(f.hpLog=[])).push(Math.round(S.time)+':'+P.hp);f.hp0=P.hp;}
  f.live.push(alive);if(f.live.length>600)f.live.shift();};
/* contact shadow under a prop, on the road */
function propShadow(c,p){if(p.hp<=0)return;const w=p.w*.62;c.save();c.globalAlpha=.42;const g=c.createRadialGradient(p.x,FL,0,p.x,FL,w);g.addColorStop(0,'rgba(0,0,0,.9)');g.addColorStop(1,'rgba(0,0,0,0)');
  c.fillStyle=g;c.translate(p.x,FL);c.scale(1,.16);c.translate(-p.x,-FL);c.beginPath();c.arc(p.x,FL,w,0,6.283);c.fill();c.restore();}
/* static props: picture corners on whole device pixels (no shimmer / half-pixel blur while the camera is still) */
function snap(c,fn){const di=c.drawImage;c.drawImage=function(im){if(arguments.length===5||arguments.length===9){const a=[...arguments],o=a.length===5?1:5,m=c.getTransform();
    if(!m.b&&!m.c&&m.a&&m.d){const X=a[o]*m.a+m.e,Y=a[o+1]*m.d+m.f,X2=Math.round((a[o]+a[o+2])*m.a+m.e),Y2=Math.round((a[o+1]+a[o+3])*m.d+m.f),rx=Math.round(X),ry=Math.round(Y);
      a[o]=(rx-m.e)/m.a;a[o+1]=(ry-m.f)/m.d;a[o+2]=(X2-rx)/m.a;a[o+3]=(Y2-ry)/m.d;}return di.apply(c,a);}return di.apply(c,arguments);};
  try{return fn();}finally{delete c.drawImage;}}
/* ----- one song: musicpack's lock / boss / clear switches stay off on this stage; the run plays street1 (192 s, steady) from the first beat ----- */
const MP=RET.MP;
if(MP&&MP.has){const h0=MP.has;MP.has=function(k){if(on()&&/^street1-/.test(k))return false;return h0.apply(this,arguments);};}
if(window.NR&&NR.on)NR.on('footStart',d=>{if(!on()||!MP||!MP.on||!MP.on()||!MP.has('street1'))return;S3.song='street1';if(MP.fbase!=='street1'){MP.fbase='street1';MP.fk='street1';try{AU.startStage('street1');}catch(e){}}});
/* ----- loading: the hold also waits for the painted street and the prop pictures (no placeholder backdrop, then a swap) ----- */
const FQ=F.q;
const pics=()=>{const fa=window.FA;if(!fa||!fa._rd)return [];return [...fa._rd].filter(f=>/^foot\/(bg-|sc-)/.test(f));};
const picOk=f=>{const r=window.FA&&FA._im[f];return !!(r&&(r.ok||r.bad));};
if(FQ&&FQ.ready){const r0=FQ.ready,p0=FQ.pct;
  FQ.ready=()=>{if(!RET.street3)return r0();window.FA&&FA.init&&FA.init();const ps=pics();if(!r0())return false;if(!window.FA||!FA._rd.size)return false;return ps.every(picOk);};
  FQ.pct=()=>{const a=p0(),ps=pics();return ps.length?Math.round((a+100*ps.filter(picOk).length/ps.length)/2):a;};}
/* ----- animation timing ----- */
const WHO=new Set(['kai','knife','gunman','bruiser','grunt','shield','sniper','warden']);
const RATE={shoot:12,crouchshoot:12,aimup:12,aimdiag:12,melee:12,combo2:12,combo3:12,hurt:12,land:12,grenade:12,die:8,victory:7};
S3.IDLE=7;S3.RATE=RATE;
const isFoot=k=>WHO.has(k.slice(0,k.indexOf('/')).replace(/^kai-.*/,'kai'));
const tuned={};
function tune(k){if(tuned[k]||!RET.street3)return;const o=ART.aS(k);if(!o)return;tuned[k]=1;o.xf=false;const r=RATE[o.act];
  if(r){const n=o.m[0],cum=new Float32Array(n);for(let i=0;i<n;i++)cum[i]=(i+1)/r;o.cum=cum;o.tot=n/r;}}
const af0=ART.aframe;
ART.aframe=function(key,t){if(RET.street3&&isFoot(key)){tune(key);const o=ART.aS(key);
    if(o&&o.act==='idle'&&o.m[0]>2){const n=o.m[0],L=2*n-2,u=Math.max(0,t)*S3.IDLE,k=Math.floor(u)%L;ART.aDone=false;ART.aP=u%1;ART.aT=ART.aP/S3.IDLE;return k<n?k:L-k;}}   // ping-pong 0 1 2 3 2 1
  return af0.apply(this,arguments);};
const URG=/hit|hurt|die|shoot|melee|jump|fall|crouch|dash|land|grenade|combo|aim|victory/;
const fd1=ART.footDraw;
ART.footDraw=function(c,who,pose,x,y,h,flip,t){const e=ART.fE,S=F.S;if(!RET.street3||!e||!S||S.st!==ST)return fd1.apply(this,arguments);
  const now=S.time,xa=e._xa||'',k1=pose+'|'+xa;
  if(e._p3==null||e._p3===k1||URG.test(k1)){e._p3=k1;e._p3b=null;}
  else{if(e._p3b==null)e._p3b=(Math.floor(now*12)+1)/12;if(now>=e._p3b-1e-6){e._p3=k1;e._p3b=null;}}   // idle <-> walk waits for the next frame boundary
  const [pp,px]=e._p3.split('|');const sx=e._xa;e._xa=px;
  let r;try{r=fd1.call(this,c,who,pp,x,y,h,flip,t);}finally{e._xa=sx;}
  if(r)S3.full++;
  if(r&&S.s3){const L=lightAt(e.x);if(L>.04){const ga=c.globalAlpha,go=c.globalCompositeOperation;c.globalCompositeOperation='lighter';c.globalAlpha=ga*L;   // lit as he walks under a lamp
      fd1.call(this,c,who,pp,x,y,h,flip,t);c.globalAlpha=ga;c.globalCompositeOperation=go;}}
  return r;};
/* foes walk at 70%: every foe's step is scaled after its own AI ran */
const FE=window.FOOT_ENEMIES||{};
for(const id of ['rusher','gunner','heavy','bigheavy']){const d=FE[id];if(!d||!d.ai||d._s3)continue;d._s3=1;const a0=d.ai;
  d.ai=function(e,dt,env){const x0=e.x,c0=e.cd;a0.apply(this,arguments);if(!on())return;
    if(id==='gunner'&&c0!=null&&e.cd>c0+.1)e.cd=c0+(e.cd-c0)*S3.GCD;   // a gunner reloads 1.4x slower on this long stage (its bullets were 2/3 of the hurts)
if(e.state==='charge'&&e.heavy||e.state==='lunge')return;const dx=e.x-x0;if(abs(dx)<80){e.x=x0+dx*S3.SPD;}e.vx*=S3.SPD;};}   // walks and approaches only: a lunge or a charge keeps the speed its telegraph promised
/* ----- blur check: the scale every on-foot sheet is drawn at (device px per sheet px); the gate is <= 1.1 ----- */
const da0=ART.drawAnim;
ART.drawAnim=function(c,key,t,x,y,sc){if(RET.street3&&c&&c.canvas&&c.canvas.id==='footC'&&isFoot(key)){const m=c.getTransform(),ts=sc*Math.hypot(m.a,m.b);if(ts>S3.up){S3.up=ts;S3.upKey=key;}}return da0.apply(this,arguments);};
/* ----- lighting ----- */
const LAMP=520,NEON=[[ '#ff2d95',.7],['#19e3ff',.55],['#b04bff',.6]];
function lightAt(x){const d=((x-LAMP/2)%LAMP+LAMP)%LAMP-LAMP/2;return .22*Math.max(0,1-abs(d)/95);}
S3.lightAt=lightAt;
function lights(c,S,L){const look=F.look,K=look?look.k:1,t0=look?look.t0:0,vw=L.vw,cam=S.camX,lo=cam-(L.exl||0),hi=cam+vw+(L.exr||0),my=y=>FL-(FL-y)*K;
  c.save();c.globalCompositeOperation='lighter';
  for(let n=Math.floor(lo/LAMP)-1;n<=Math.ceil(hi/LAMP)+1;n++){const x=n*LAMP+LAMP/2;if(x<lo-200||x>hi+200)continue;
    const p=c.createRadialGradient(x,FL,0,x,FL,120);p.addColorStop(0,'rgba(255,205,140,.30)');p.addColorStop(1,'rgba(255,205,140,0)');c.fillStyle=p;c.save();c.translate(x,FL);c.scale(1,.22);c.translate(-x,-FL);c.beginPath();c.arc(x,FL,120,0,6.283);c.fill();c.restore();
    }   // pools only: a cone would not line up with the lamp posts painted in the parallax layers
  for(let n=Math.floor(lo/900)-1;n<=Math.ceil(hi/900)+1;n++){const q=NEON[((n%3)+3)%3],x=n*900+330+120*Math.sin(n*1.7),y=my(FL-120);if(x<lo-260||x>hi+260)continue;   // neon spill: coloured rim on whoever stands near a sign
    const g=c.createRadialGradient(x,y,0,x,y,210);g.addColorStop(0,q[0]+'40');g.addColorStop(1,q[0]+'00');c.fillStyle=g;c.globalAlpha=q[1]*(.85+.15*Math.sin(S.time*3+n));c.fillRect(x-210,y-210,420,420);c.globalAlpha=1;}
  c.restore();}
function grade(c,S,L){const dpr=L.dpr||1,W=c.canvas.width,H=c.canvas.height;c.save();c.setTransform(1,0,0,1,0,0);
  const look=F.look,road=look&&look.road?Math.round(look.road*dpr):0;
  if(road>0&&road<H){const hb=Math.min(H-road,road);c.globalAlpha=.16;c.translate(0,road*2);c.scale(1,-1);c.drawImage(c.canvas,0,road-hb,W,hb,0,road-hb,W,hb);c.setTransform(1,0,0,1,0,0);   // wet road: the street mirrored under the road line
    const g=c.createLinearGradient(0,road,0,road+hb);g.addColorStop(0,'rgba(5,3,12,0)');g.addColorStop(1,'rgba(5,3,12,.55)');c.globalAlpha=1;c.fillStyle=g;c.fillRect(0,road,W,hb);}
  c.globalCompositeOperation='multiply';c.globalAlpha=.22;c.fillStyle='#d9c6ff';c.fillRect(0,0,W,H);   // one grade: cool violet night
  c.globalCompositeOperation='screen';c.globalAlpha=.05;c.fillStyle='#ff5aa8';c.fillRect(0,0,W,H);
  c.restore();}
S3.lit=0;
if(F.look&&F.look.draw){const d0=F.look.draw;
  F.look.draw=function(c){if(!on())return d0.apply(this,arguments);const L=IN.L(),S=F.S;let depth=0;const sv=c.save,rs=c.restore;
    c.save=function(){depth++;return sv.call(c);};
    c.restore=function(){if(depth===1&&L&&S){try{lights(c,S,L);grade(c,S,L);S3.lit++;}catch(x){}}depth--;return rs.call(c);};   // after the street and its actors, before the HUD
    try{return d0.apply(this,arguments);}finally{delete c.save;delete c.restore;}};}
})();

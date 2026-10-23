// PURPOSE: Street hard: the one street stage becomes a fight to think about: foes live long enough to act, every attack readable, two named decisions (kill order, cover vs push), Kai can lose
// FLAG: streethard (?streethard=0 = street3 exactly)
// TEST: qa/streethard-test.js (+ qa/street3-test.js)
/* ---------- STREETHARD. Owner, 23 Oct 2026: "game is very easy and not strategic". Every foe died ~0.85 s after it appeared (inside its spawn grace), so nothing ever acted.
   1. TOUGHER: foe hp x HPK (pistol 4.4 shots/s: rusher ~2 s, gunner ~4-5 s because it is only hittable while it pops up, heavy 4-8 s from behind / when stunned).
   2. READABLE: the rusher's crouch before its lunge lasts 0.6 s (was 0.4; red flash + CROUCH pose), gunner pop 0.5 s, heavy wind-up 0.8 s. All dodgeable: jump the lunge, duck or
      hide from the shots, jump or dash through the charge.
   3. DECISION 1, KILL ORDER: a gunner left alive WHISTLES CALL0 s after it is seen and every CALL s after ("CALLING HELP" over its head + a ring): one more rusher joins.
      During the 1 s whistle it stands up in the open (hittable). Rushers hurt you now, the gunner costs you later. S.sh.called = rushers it called in.
   2b. A gunner's shot at Kai on the road flies level at chest height (CHEST px up), so ducking under it works like jumping it (it used to aim at the crouch line).
   4. DECISION 2, COVER OR PUSH: gunner bullets stop on any crate, car or kiosk (at least 56 px of cover) and chip it (CHIP hp a hit), also the cover Kai stands at (street2 lets his own shots fly over it), so hiding works, but the cover wears out and the gunner never
      dies while you hide. S.sh.blocked / S.sh.coverBroke.
   4b. At most GMAX gunners on the street at once (tougher gunners would pile up).
   5. KAI CAN LOSE: with foes that live and act, an idle Kai dies in ~20 s and a careless one before the big heavy (heals as street3).
   6. Fewer, tougher foes: threat 1 -> 7 (was 2 -> 8), at most 4 at once; threat peak at 136 s: 82-89% of a 153-165 s clear: 80-90% of the run (street3-test (b)). ---------- */
if(RET.streethard===undefined)RET.streethard=!/[?&]streethard=0/.test(location.search);
(function(){
if(!RET.streethard||!window.FOOT||!FOOT.S3||!FOOT._in||!FOOT.env)return;
const F=FOOT,IN=F._in,S3=F.S3,ST=F.STAGES.zeil,abs=Math.abs;
const SH=F.SH={HPK:{rusher:1.7,gunner:2.2,heavy:.6},FRONT:.25,CHEST:81,HUG:90,BURST:2,COVERGAP:250,SLUGR:26,CROUCH:.6,CALL:5,CALL0:2,CALLT:65,CALLEND:135,KEEP:0,CAPX:0,GMAX:1,HEART:0,CHIP:1.5,COVER:{scrate:1,car:1,kiosk:1},log:null};
const on=()=>RET.streethard&&F.S&&F.S.st===ST&&F.S.s3;
S3.T.peakT=130;S3.T.cap=4;S3.T.thr0=1;S3.T.thrPeak=7.4;   // fewer, tougher foes: threat 1 -> 7 (was 2 -> 8), at most 4 on the street at once (was 5); the peak (7) is the last wave only
/* 4c: more cover to choose from (the street had one cover prop per ~750 px: a gunner shot almost never met one): a covered crate every COVERGAP px, clear of the props already there */
if(SH.COVERGAP){const xs=ST.props.map(p=>p[0]);for(let x=700;x<ST.boss.x-900;x+=SH.COVERGAP)if(!xs.some(q=>abs(q-x)<130)){ST.props.push([x,'scrate',{cover:1,dr:[]}]);xs.push(x);}}
/* 1: tougher foes, and the time-to-kill log (seen -> dead, game seconds) */
const sp0=F.env.spawn;
F.env.spawn=function(id,x,y,o){const e=sp0.apply(this,arguments);if(e&&on()&&SH.HPK[id]&&!e.boss){e.hp*=SH.HPK[id];e.max=e.maxHp=e.mhp=e.hp;}return e;};
const FE=window.FOOT_ENEMIES||{};
for(const id of ['rusher','gunner','heavy']){const d=FE[id];if(!d||d._sh)continue;d._sh=1;
  if(id==='heavy'&&d.onHit&&!d._sh2){d._sh2=1;const oh=d.onHit;d.onHit=function(e,dd,env,hit){const front=hit&&!hit.melee&&hit.x!=null&&Math.sign(hit.x-e.x)===e.facing&&e.state!=='stun'&&e.state!=='dead';
      const r=oh.apply(this,arguments);if(on()&&front)e.hp-=dd*SH.FRONT;return r;};}   // its front plate takes 55% (was 30%): shooting it head-on is slow, not hopeless
  const od=d.onDeath;d.onDeath=function(e){if(on()&&!e._ttk){e._ttk=1;const S=F.S,t0=e.seenAt2!=null?e.seenAt2:e.born;(SH.log.ttk[id]||(SH.log.ttk[id]=[])).push(+(S.time-t0).toFixed(2));
      if(id==='gunner')SH.log.gunDead.push(+S.time.toFixed(1));if(id==='rusher')SH.log.rushDead.push(+S.time.toFixed(1));}return od?od.apply(this,arguments):undefined;};
  const a0=d.ai;d.ai=function(e,dt,env){
    if(on()&&id==='rusher'&&e.state==='crouch')e.sT-=dt*(1-.4/SH.CROUCH);   // 2: a longer, readable crouch before the lunge
    a0.apply(this,arguments);
    if(on()&&id==='gunner'&&e.state!=='dead'&&e.seen){call(e,env);
      if(e.state!=='pop')e._th=0;else if(SH.BURST>2&&!e._th&&e.sT>=.9){e._th=1;const sy=e.y-44;env.shoot(e,Math.atan2(env.P.y-40-sy,env.P.x-e.x),360,1,{oy:sy});}}};}   // 3rd slug of a pop, a ducker holds the crouch
/* 3: the gunner calls help */
function call(e,env){const S=F.S;if(e.callT==null)e.callT=S.time+SH.CALL0;
  if(e.callT-S.time<1){if(!e.callW){e.callW=1;IN.pop(e.x,e.y-e.h-26,'CALLING HELP','#ffb020');}e.hid=false;e.vx=0;e.tele=Math.max(e.tele||0,.05);}   // 1 s whistle: caption, red flash, stands up in the open (a window to shoot it)
  if(S.time<e.callT||S.time<SH.CALLT||S.time>SH.CALLEND)return;e.callT=S.time+SH.CALL;e.callW=0;
  if(S.E.filter(q=>!q.dead).length>=S3.T.cap+SH.CAPX)return;
  const vw=env.G.viewW||960,fromL=Math.random()<.5,n=F.env.spawn('rusher',fromL?S.camX-40:S.camX+vw+40,null);   // one more rusher, on top of the plan
  if(n){SH.log.called++;S.fx.push({ring:1,x:e.x,y:e.y-e.h*.6,r:60,l:.5,m:.5,c:'#ffb020'});IN.sfx&&IN.sfx('warn');}}
/* 2b: level shots; 4: foe bullets stop on cover props and chip them */
const st0=ST.hook.step;
ST.hook.step=function(S,dt,env){
  if(RET.streethard&&S.s3&&!S.sh){S.sh=SH.log={ttk:{},called:0,blocked:0,coverBroke:0,gunDead:[],rushDead:[]};S.P.max+=SH.HEART;S.P.hp+=SH.HEART;}
  if(on()){
    if(S.E.filter(e=>!e.dead&&e.id==='gunner').length>=SH.GMAX)for(const w of S.s3.waves)if(w.left[0]==='gunner'&&w.next<S.time+.4)w.next=S.time+.4;   // at most GMAX gunners at once: the next waits
    for(const b of S.eb){if(b.life<=0||b.src!=='gunner')continue;if(b._x0==null){b._x0=b.x;if(abs(S.P.y-470)<10&&b.y>400&&b.y<440){b.y=470-SH.CHEST;b.r=SH.SLUGR;b.slug=1;b.vx=Math.sign(b.vx)*Math.hypot(b.vx,b.vy);b.vy=0;}}   // a level shot at chest height: ducking (or a jump) dodges it
      for(const p of S.pr){if(p.hp<=0||p.gone||!(p.cover||SH.COVER[p.k])||abs(p.x-b._x0)<p.w/2+40&&abs(S.P.x-p.x)>p.w/2+SH.HUG)continue;   // the gunner's own cover blocks only when Kai hugs the other side of it   // never the gunner's own cover
        if(b.x>p.x-p.w/2&&b.x<p.x+p.w/2&&b.y+(b.slug?b.r:0)>p.y-Math.max(p.h,56)&&b.y<p.y+4){b.life=0;SH.log.blocked++;const h0=p.hp;IN.hitProp(p,SH.CHIP);if(h0>0&&p.hp<=0)SH.log.coverBroke++;break;}}}}
  const r=st0.apply(this,arguments);
  if(on()&&SH.KEEP)for(const p of S.pr)if(p.hp>0&&(SH.KEEP>1?p.cover:SH.COVER[p.k])&&!(p.dr&&p.dr.length))p.pass=true;   // Kai's shots fly over crates, the car and kiosks with nothing inside (only gunner fire wears them down)
  return r;};
})();

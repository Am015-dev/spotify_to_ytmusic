// PURPOSE: Legend plays differently, not just faster
// FLAG: legend (?legend=0)
// TEST: legend-test.js
/* ---------- LEGEND: its own rules, not a bigger multiplier (flag RET.legend, default ON since W107 21 Oct (legend-test passes): ?legend=0 = the old Legend exactly). Test: nightrun/legend-test.js.
   Owner, 21 Oct 2026: "Game is again very easy even on Legend." The bots died on the old Legend (stage 10/20: every bot 0-13%) from raw speed: bullets too fast and too many to read,
   while a player with meta progress (hull plating, mercy, assists, free repairs) sailed through. So Legend trades raw speed for rules a player has to play:
   1. TIMING  the beat window is LEG.WIN of its normal width and the assist window is gone; the PERFECT (parry) share of it shrinks to LEG.PK.
   2. NO GIFTS  no hull drops (kill drops, armour plates, boss loot), no boss hit mercy, other pickups (powers, EMP, weapon ups) kept at LEG.PKK; meta hull bonus capped at +LEG.HULL, no revive, shield regen at half speed.
   3. PRESSURE  a telegraphed threat (laser wall = dash check, drifting GAP wall in the curtain slot, seeker, ward) every LEG.EV bars (was 4); see 3. below (W130).
   4. BRAINS  a ship that stays within LEG.CR px for LEG.CT s is read: the nearest gunner marks it (LEG.TELL s ring) and fires a LEG.FAN-shot fan at where it sits.
   5. BOSSES  every phase gets the first verb of the next phase on top (phase 3 the signature verb); the soft cap opens full damage after LEG.PT s of a phase; OVERLOAD flickers LEG.FBW s.
   6. METERS  EMP fills at LEG.FILL of Normal (was .35); flyers hover LEG.HOV beats up top (was 3); the remix pool takes formations LEG.POOL stages early.
   7. PACE  bullets slower and fewer than the old Legend (DIFFS.legend <- LEG.DF) so every threat stays readable: telegraphs >= .5 s, pattern count per second up.
   Bots (legend-test.js, mid build, st 10/20 pooled, n=16, W107 21 Oct): old Legend human 0 / oracle 0-6%; this layer (Hard-level tables + the rules above, hull <= Normal, bullets slower so ~16 on screen vs Normal 10): human 13-19%, oracle 19-25%, no-oracle 13%, beat 94%, no-dash / camper / random 0%.
   Final gate RUNS=12 (n=24): human 8%, oracle 29% (target 35-65, inside the noise band), no-oracle 8%, beat 100%, no-dash 29%, camper / random 0%, endless median wave 4. The bots carry no meta progress, the owner does: hull plating (+5), revives, shield regen.
   W130 (22 Oct): walls that need the right answer + CROSSFIRE + wall hit 2 hull + leaks 1 hull per LEG.LK (see 3. and 4b.). legend-test RUNS=8 x3: human 19/19/0, oracle 25/38/31, beat 94-100, camp 0, random 0 (was 13-19).
   Not touched: armour.js hull / caps, hard.js DPS ceiling, stage length (pacing), boss length cap (bossfit). ---------- */
if(RET.legend===undefined)RET.legend=!/[?&]legend=0/.test(location.search);
const LEG=window.LEG={WIN:.85,PK:.5,PKK:.55,HULL:0,EV:6,GAP:110,GOFF:120,WV:260,GV:45,CD2:.9,CR:46,CT:2.2,LK:3,WD:2,LX:130,LT:2,LCD:2,LSP:300,TELL:.6,FAN:3,CD:2.2,PT:50,FBW:6,FILL:.5,HOV:5,POOL:8,RGN:.5,
  DF:{d:3.6,fr:5.6,bs:1.7,dn:1.45,sd:1.15,sbs:.85,sfr:.85,fan:3,el:1.1,aq:3,heal:.35},HPK:1,DM:{lv:.3,hp:1.1},SC:{lv:.5,hp:1.2},HK:9,WK:1.3,DK:1.15,RK:1.15,FS:2,
  stat:{lane:0,pun:0,pk:0,hp:0,verb:0,gap:0,rev:0},cz:null,
  act(){return!!RET.legend&&typeof SET==='object'&&SET.diff==='legend'&&!(typeof G==='object'&&G&&(G.lab||G.tut));}};
if(RET.legend){
  Object.assign(DIFFS.legend,LEG.DF);TUNE.dm.legend=LEG.DM;if(window.SC&&SC.hard)SC.hard.legend=LEG.SC;if(window.CTR){CTR.HK.legend=LEG.HK;CTR.WK.legend=LEG.WK;}if(window.ZOO)ZOO.cap.legend=ZOO.cap.hard;if(window.BMV)BMV.DK.legend=LEG.DK;
  if(window.SC&&SC.firstShot){const f0=SC.firstShot;SC.firstShot=()=>LEG.act()?LEG.FS:f0();}
  if(window.ABIL){ABIL.FILL.legend=LEG.FILL;ABIL.RK.legend=LEG.RK;}
  if(window.CTR)CTR.EV.legend=LEG.EV;if(window.LEAK)LEAK.grp.legend=LEG.LK;
  if(window.ZOO)ZOO.hov.legend=LEG.HOV;
  if(window.BPL){BPL.AM=BPL.AM||{};BPL.AM.legend=0;BPL.PT.legend=LEG.PT;BPL.FIT.PT.legend=LEG.PT;BPL.FIT.FBWD.legend=LEG.FBW;}
  /* 1. timing: a narrower window, no assist; a narrower PERFECT share */
  {const aw=RET.asWinMs;RET.asWinMs=function(){const v=aw.call(this);return LEG.act()?-Math.round((WINS[SET.win]||110)*(1-LEG.WIN)):v;};}
  if(window.TIM){const pk=TIM.PK;Object.defineProperty(TIM,'PK',{get(){return LEG.act()?LEG.PK:pk;},set(){},configurable:true});}
  /* 3. walls that need the right answer (W130). Old Legend gave every wall a gap and kept the Hard curtain (second layer .45 s behind): reading did not pay
     (bots st10/20: the oracle was hit by 57% of the gap walls and 93% of the curtain layers, the random-button bot by about the same), so they were dice rolls.
     a. LASER WALL = a DASH check: no gap while you hold a dash charge (Hard's rule; with no charge it opens a LEG.GAP px gap LEG.GOFF px away from the ship, so there is always an answer).
        Mashing DASH does not pass it: an off-beat press with no bullet near empties the charges (timing.js PANIC), so the wall finds you empty.
     b. the curtain slot sends a GAP WALL instead: the gap is chosen when the warning starts, LEG.GOFF px away from the ship (standing still or wandering
        is a hit), drawn on the warning line (white bracket + GAP), and drifts LEG.GV px/s while the wall sweeps at LEG.WV px/s: follow it, or dash it. */
  if(window.CTR){const t0=CTR.tick;CTR.tick=function(dt){if(LEG.act()&&this.walls)for(const w of this.walls){
      if(w.mv&&!w.lg){w.lg=1;w.v=LEG.WV;const s=P.y>H/2?-1:1;w.gap={y:clamp(P.y+s*LEG.GOFF*(1+.5*GR()),70,H-70),h:LEG.GAP};w.gv=(GR()<.5?-1:1)*LEG.GV;w.lgap=w.gap;LEG.stat.gap++;}
      if(w.mv&&w.gap&&w.warn<=0&&!w.hit){w.gap.y+=w.gv*dt;if(w.gap.y<70||w.gap.y>H-70){w.gv=-w.gv;w.gap.y=clamp(w.gap.y,70,H-70);}}}
    LEG.wt=LEG.act();try{t0.apply(this,arguments);}finally{LEG.wt=0;}if(LEG.act())for(const w of this.walls){if(w.lgap&&w.gap!==w.lgap)w.gap=w.lgap;
      if(!w.cur&&w.gap&&!w.lgap){const s=P.y>H/2?-1:1;w.gap.y=clamp(P.y+s*LEG.GOFF*(1+.5*GR()),70,H-70);w.lgap=w.gap;}   /* the no-charge gap opens away from the ship too: an empty dash means read and move */if(w.gap&&!w.cur)w.gap.h=Math.min(w.gap.h,LEG.GAP);}};   // counter.js re-rolls a gap at the warning's end
    {const h0=hurt;hurt=function(n){return h0.call(this,LEG.wt?Math.max(n||1,LEG.WD):n);};}   // c. a laser wall hit costs LEG.WD hull on Legend (2: the shell's heavy hit)
    const s0=CTR.start;CTR.start=function(k){if(LEG.act()&&k==='curt'){this.wall();const w=this.walls[this.walls.length-1];if(w)w.mv=1;return;}return s0.apply(this,arguments);};}
  /* 5. bosses: one more verb per phase */
  if(window.BMV){const i0=BMV.init;BMV.init=function(e){i0.apply(this,arguments);if(!LEG.act()||!e.bm||!e.lists)return;const T=e.bm.T;
    e.lists.forEach((l,i)=>{const nx=i<2?T.ph[i+1].map(BMV.norm).map(o=>o.v).find(v=>!l.includes(v)&&v!==T.ctr):T.sig;if(nx&&!l.includes(nx)){l.push(nx);if(!e.bm.P[nx])e.bm.P[nx]={};LEG.stat.verb++;}});};}
  /* column strike (fair.js MM): Hard's window, telegraph (.8 s) and damage; the Legend-only values (2.8 s / .7 s / 3 hull) were the oracle's main wall (W107: oracle 19% -> 44%) */
  const hd=(o,k)=>{const f=o[k];o[k]=function(){if(!LEG.act())return f.apply(this,arguments);const d=SET.diff;SET.diff='hard';try{return f.apply(this,arguments);}finally{SET.diff=d;}};};
  if(window.MM)['win','tel','dmg'].forEach(k=>hd(MM,k));if(window.S2)hd(S2,'ak');if(window.AC)hd(AC,'per');   // + locked-shot damage and the anticamp period at Hard's
  /* 6. remix: rarer formations from stage 1 */
  if(window.RMX){const p0=RMX.pool;RMX.pool=function(id,n){return p0.call(this,id,LEG.act()?n+LEG.POOL:n);};}
  /* 2 + 4: pickups and the camper read, every frame */
  NR.on('tick',dt=>{if(!LEG.act()||!G||!G.live||G.dead)return;
    const h0=(ST.on&&ST.hp0?Math.max(5,ST.hp0):5)+LEG.HULL;if(P.max>h0){P.max=h0;P.hp=Math.min(P.hp,P.max);}   // 2. meta hull plating / class hull: at most +LEG.HULL
    if(window.TP){if(TP.revLeft>0){TP.revLeft=0;LEG.stat.rev++;}if(TP.rgnT>0)TP.rgnT=Math.max(0,TP.rgnT-dt*LEG.RGN);}             // no revive, shield regen at 1-LEG.RGN speed
    for(const q of G.pk){if(q.lg)continue;q.lg=1;if(q.t==='shard')continue;if(q.t==='hp'){if(GR()>LEG.HPK){q.x=-999;q.dead=1;LEG.stat.hp++;}continue;}if(GR()>LEG.PKK){q.x=-999;q.dead=1;LEG.stat.pk++;}}
    /* 4b. CROSSFIRE (W130): a ship parked at the back edge (x < LEG.LX) for LEG.LT s gets its column marked (LEG.TELL s dashed line + CROSSFIRE), then a shot from the
       top and one from the bottom edge fly along that column at it: moving up and down inside the column does not help, moving forward does. Never with a boss out. */
    const L=LEG.ln||(LEG.ln={t:0,cd:0,m:null});L.cd-=dt;L.t=P.x<LEG.LX?L.t+dt:0;
    if(L.m){L.m.t-=dt;if(L.m.t<=0){const x=L.m.x;L.m=null;for(const y0 of[8,H-8])eb(x,y0,Math.atan2(P.y-y0,P.x-x),LEG.LSP,'#ff2d95',6);LEG.stat.lane++;}}
    else if(L.t>LEG.LT&&L.cd<=0&&!G.boss){L.m={x:Math.max(20,P.x),t:LEG.TELL};L.cd=LEG.LCD;floater(Math.max(P.x+60,170),P.y-34,say('CROSSFIRE: MOVE FORWARD'),'#ff2d95');}
    const c=LEG.cz||(LEG.cz={x:P.x,y:P.y,t:G.t,cd:0,m:null});c.cd-=dt;
    if(Math.hypot(P.x-c.x,P.y-c.y)>LEG.CR){c.x=P.x;c.y=P.y;c.t=G.t;}
    if(c.m){c.m.t-=dt;if(c.m.t<=0){const e=c.m.e,x=c.m.x,y=c.m.y;c.m=null;if(e&&!e.dead&&e.hp>0&&G.en.includes(e)){const a=Math.atan2(y-e.y,x-e.x);for(let k=0;k<LEG.FAN;k++)eb(e.x,e.y,a+(k-(LEG.FAN-1)/2)*.16,260,'#ff2d95',6);LEG.stat.pun++;}}}
    else if(c.cd<=0&&G.t-c.t>LEG.CT&&!G.boss){let b=null,bd=1e9;for(const e of G.en){if(e.type==='boss'||e.hp<=0||e.x>W-40||e.x<P.x+120)continue;const d=Math.hypot(e.x-P.x,e.y-P.y);if(d<bd){bd=d;b=e;}}
      if(b){c.m={e:b,x:P.x,y:P.y,t:LEG.TELL};c.cd=LEG.CD;floater(P.x,P.y-34,'READ','#ff2d95');}}});
  {const d0=ABIL.draw;ABIL.draw=function(t){d0.call(this,t);if(LEG.act()&&window.CTR&&CTR.walls){ctx.save();for(const w of CTR.walls){if(w.cur||!w.gap||w.warn<=0)continue;const g=w.gap,x=w.x;
    ctx.globalAlpha=.95;ctx.strokeStyle='#ffffff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+14,g.y-g.h/2);ctx.lineTo(x,g.y-g.h/2);ctx.lineTo(x,g.y+g.h/2);ctx.lineTo(x+14,g.y+g.h/2);ctx.stroke();
    ctx.fillStyle='#ffffff';ctx.font='bold 14px sans-serif';ctx.textAlign='right';wtxt(say('GAP'),x-8,g.y+5);}ctx.restore();}
  const L=LEG.ln;if(L&&L.m&&LEG.act()&&G){ctx.save();ctx.globalAlpha=.5+.4*(SET.reduce?1:Math.abs(Math.sin(t*10)));ctx.strokeStyle='#ff2d95';ctx.lineWidth=3;ctx.setLineDash([8,8]);ctx.beginPath();ctx.moveTo(L.m.x,0);ctx.lineTo(L.m.x,H);ctx.stroke();ctx.restore();}
  const c=LEG.cz;if(!c||!c.m||!LEG.act()||!G)return;const r=18+30*c.m.t/LEG.TELL;ctx.save();ctx.globalAlpha=.85;ctx.strokeStyle='#ff2d95';ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.arc(c.m.x,c.m.y,r,0,7);ctx.stroke();
    ctx.beginPath();ctx.moveTo(c.m.e.x,c.m.e.y);ctx.lineTo(c.m.x,c.m.y);ctx.globalAlpha=.35;ctx.stroke();ctx.restore();};}
  NR.on('runStart',()=>{LEG.cz=null;LEG.ln=null;for(const k in LEG.stat)LEG.stat[k]=0;});
}
/* EASY BITE (W107, flag RET.easy2, default ON: ?easy2=0 = the old Easy): Easy cleared 100% with 0-2 hits (strict review 8). Target human-model 85-95% with real hits:
   story level offset EZ.LV (was -.8), a pressure window every EZ.EV bars (was 10) with EZ.HK shots (W107: humanbot Easy st 10/20 ~90%, hits 2-5). Normal / hard tiers untouched. */
if(RET.easy2===undefined)RET.easy2=!/[?&]easy2=0/.test(location.search);
const EZ=window.EZ={LV:-.2,HP:1,EV:4,HK:6,WK:1};
if(RET.easy2){TUNE.dm.easy={lv:EZ.LV,hp:EZ.HP};if(window.CTR){CTR.EV.easy=EZ.EV;CTR.HK.easy=EZ.HK;CTR.WK.easy=EZ.WK;}}

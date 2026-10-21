/* ---------- BITE: Normal bites again on top of the short stages (flag RET.bite, default ON; ?bite=0 = the game as it was). Test: humanbot / anticamp-test / timing-test.
   Strict review 7: since pacing.js (stages ~90 s) the human-model bot clears Normal 97% and a bot that never presses DASH or EMP clears as often as the beat bot.
   Normal story stages only (not Easy, not the hard tiers, not the Lab or the tutorial); stage length, armour.js and hard.js are not touched. Denser threats per second, not longer stages:
   1. PRESSURE WINDOWS (counter.js threats): one every BITE.ev bars instead of 9 (BITE.evMid on stages BITE.full-BITE.midTo: from 16 the base pressure already climbs); the laser wall (a lane strike: only a dash crosses it, a dead-on-beat dash is
      shielded for .2 s, an off-beat hop only .04 s) unlocks on stage 3 instead of 5. From stage BITE.full a wall keeps its gap only when no dash charge is held
      (as on Hard); before that the gap is BITE.gapH px. A bullet curtain's second layer follows .45 s after the first while DASH or EMP is ready (EMP clears both).
   2. MERCY: grit.js absorbs at most BITE.mc() hull hits a run from stage 3 (was 3): 1 on stages 3-5 (hull 7 there), 2 from stage BITE.full (hull 5-6).
   3. FREE HEALTH: hull drops (ST.heal) x BITE.heal from stage BITE.full. ---------- */
if(RET.bite===undefined)RET.bite=!/[?&]bite=0/.test(location.search);
const BITE=window.BITE={ev:5,evMid:4,midTo:15,wallAt:3,full:6,gapH:84,mcEarly:1,mcLate:2,heal:.7,
  stat:{walls:0,shut:0,curt:0},
  act(){return!!RET.bite&&typeof SET==='object'&&SET.diff==='normal'&&!!ST.on&&!(typeof G==='object'&&G&&(G.lab||G.tut));},
  stg(){return ST.on?ST.n:1;},
  late(){return this.act()&&this.stg()>=this.full;},
    mc(){return this.stg()>=this.full?this.mcLate:this.mcEarly;}};
if(window.CTR){
  const ev=CTR.EV.normal,wa=CTR.UN.wall;
  Object.defineProperty(CTR.EV,'normal',{get(){return BITE.act()?(BITE.late()&&BITE.stg()<=BITE.midTo?BITE.evMid:BITE.ev):ev;},set(){},configurable:true,enumerable:true});
  Object.defineProperty(CTR.UN,'wall',{get(){return BITE.act()?BITE.wallAt:wa;},set(){},configurable:true,enumerable:true});
  const c0=CTR.curt;CTR.curt=function(){const n=this.walls.length;c0.apply(this,arguments);
    if(!BITE.act()||!BITE.late()||!(this.charges()>=1||P.emp>=1))return;const w=this.walls.slice(n);BITE.stat.curt++;
    if(w.length===2){w[1].warn=w[0].warn+.45;const c=this.curts[this.curts.length-1];if(c)c.t=c.T0+.45;}};
  const t0=CTR.tick;CTR.tick=function(dt){const pend=this.walls?this.walls.filter(w=>!w.cur&&w.warn>0):[];t0.apply(this,arguments);
    if(!BITE.act())return;for(const w of pend){if(w.warn>0||!w.gap||w.bt)continue;w.bt=1;BITE.stat.walls++;
      if(BITE.late()&&this.charges()>=1){w.gap=null;BITE.stat.shut++;}else w.gap.h=Math.min(w.gap.h,BITE.gapH);}};
}
if(window.GRIT){const m=GRIT.mcMax;Object.defineProperty(GRIT,'mcMax',{get(){return BITE.act()&&BITE.stg()>=BITE.wallAt?Math.min(m,BITE.mc()):m;},set(){},configurable:true});}
{const sl=ST.setLevel;ST.setLevel=function(n){const r=sl.apply(this,arguments);if(RET.bite&&SET.diff==='normal'&&n>=BITE.full)this.heal*=BITE.heal;return r;};}
NR.on('runStart',()=>{for(const k in BITE.stat)BITE.stat[k]=0;});

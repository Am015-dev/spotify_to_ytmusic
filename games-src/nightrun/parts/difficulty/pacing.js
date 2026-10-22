// PURPOSE: shorter stages, fewer enemies, enemies that stay
// FLAG: pacing (?pacing=0)
// TEST: pacing-test.js
/* ---------- pacing.js: shorter stages, fewer enemies at once, enemies that stay and fight (owner, 21 Oct 2026, stage 11 Normal:
   "very long as a stage, enemies are way too many, I cannot kill them all because they fly very fast away, and they should not need an extreme number of shots").
   Flag RET.pacing, default ON; ?pacing=0 = the game as it was. Easy / Normal only for 3-5 (Hard and above keep their own pressure); 1-2 apply to every difficulty.
   1. LENGTH + GOALS: an arcade kill / survive / score stage lasts about PAC.secs (95 s; was the whole 150 s song). The kill goal is PAC.kr kills per second of stage
      (reachable by the human-model bot), a score goal is PAC.scK of what it was. Boss and mini-boss stages keep their length.
   2. CROWD: DIR.spawnOne waits (up to 4 x 2 beats, then the wave is dropped) while the screen holds PAC.cap() foe-weights (swarm .34, mine .5); the density factor ST.dk is x PAC.dk.
   3. STAY AND FIGHT (via LEAK.es, the speed factor of one foe): a flyer that has come in creeps (PAC.holdF) for PAC.hold seconds with its line pulled into the upper two thirds,
      then shows a retreat ring for PAC.tele s, then moves on. A flyer about to leave the screen alive loops back once (re-enters on the right, new height, ring on the edge).
   4. SHOTS TO KILL: a foe's hull is capped at spawn to N hits of what the ship does per hit (running average): 3 normal, 8 elite, 10 big (stages 1-15; one more normal hit later).
      Only ever lowers a hull; armour.js, hard.js and the damage chain are not touched. Test: nightrun/pacing-test.js. ---------- */
if(RET.pacing===undefined)RET.pacing=!/[?&]pacing=0/.test(location.search);
const PAC=window.PAC={
  secs:95,kr:.65,scK:.7,dk:.85,hold:4.2,holdF:.3,strafe:140,tele:.6,zone:W-110,dph:1,hits:3,hitsEl:8,hitsBig:9,
  stat:{deferred:0,dropped:0,loops:0,trims:0,tele:0},
  LOOPS:['drone','flank','charger','swarm','zdrn','shielder','bomber','splitter'],BIG:['gunship','gwalker','carrier','turret','gturret','gtank'],
  on(){return!!RET.pacing&&!G.lab&&!G.tut;},
  soft(){return SET.diff==='easy'||SET.diff==='normal';},
  eligible(e){return e.type!=='boss'&&e.type!=='gate'&&e.type!=='mine'&&!e.gnd&&!e.mini&&!e.zs&&(!e.zt||e.type==='zdrn');},   // zoo.js already hovers its flyers in slots (e.zs) and scripts its kinds (dive, shield): only the rest, and the small chasers, join in
  cap(){return ST.on&&ST.n<=2?5:7;},
  alive(){let n=0;for(const e of G.en){if(e.type==='boss'||e.hp<=0||e.dead)continue;n+=e.type==='swarm'?.34:e.type==='mine'?.5:1;}return n;},
  kv(s){const t=TR.by[s.song],m=SONGM[s.song],bpm=(t&&t.bpm)||(m&&m.bpm)||120;return Math.max(20,Math.round(this.kr*stLen(s)*(240/bpm)/10)*10);},
  st(e){return e.pc||(e.pc={T:0,L:0,tl:0,told:0,lt:G.t});},
  f(e){   // speed factor of one foe this frame
    if(!this.on()||!this.soft()||!this.eligible(e))return 1;
    const s=this.st(e),dt=Math.max(0,Math.min(.1,G.t-s.lt));s.lt=G.t;
    if(!(e.x<=this.zone)||e.x<30&&s.T>=this.hold)return 1;
    if(s.T<this.hold){s.T+=dt;return this.holdF;}
    if(!s.told){s.told=1;s.tl=this.tele;e.flash=Math.max(e.flash,.2);G.rings.push({x:e.x,y:e.y,l:.5,m:.5,c:'#ffb02d'});this.stat.tele++;}
    if(s.tl>0){s.tl-=dt;return this.holdF;}
    return 1;},
  tick(dt){
    if(!this.on()||!this.soft())return;
    for(const e of G.en){
      if(!this.eligible(e)||e.hp<=0||e.dead)continue;const s=this.st(e);
      if(!s.tr){s.tr=1;if(e.hp===e.max)this.trim(e);}   // once more on the first frame: variants and zoo set hulls after the spawn event
      if(s.T>0&&s.T<this.hold&&e.x<this.zone&&!e.zt){   // hovering: strafe up and down on a line in the upper two thirds
        const vy=this.strafe*Math.cos(s.T*2+(e.ph||0)*2+e.r);if(e.by!=null)e.by=clamp(e.by+vy*dt,70,H*.6);e.y=clamp(e.y+vy*dt,50,H*.64);}
      if(e.x<12&&s.L<1&&this.LOOPS.includes(e.type)&&!G.dead&&!ST.over){   // would leave alive: one more pass
        s.L=1;s.told=0;s.tl=0;s.T=0;e.x=W+30;e.by=gr(80,H*.6);e.y=e.by;if(e.type==='charger')e.t=.35;this.stat.loops++;
        G.rings.push({x:W-14,y:e.y,l:.5,m:.5,c:'#ff3d6a'});}}},
  trim(e){
    if(!this.on()||!this.soft()||e.type==='boss'||e.mini||e.type==='swarm'||e.type==='gate')return;
    const n=ST.on?ST.n:20,big=this.BIG.includes(e.type),k=big?this.hitsBig:e.el?this.hitsEl:this.hits+(n>15?1:0),cap=Math.max(1,Math.ceil(k*this.dph*UPS.hp));   // power-aware like the hulls it trims
    if(e.hp>cap){e.hp=cap;e.max=cap;this.stat.trims++;}}};
HOOK['DMG.hit'](h0=>function(d,b,e){const v=h0.apply(this,arguments);if(e&&b&&v>0&&e.type!=='boss'&&!(G.empT>0)){e.phc=(e.phc||0)+1;PAC.dph+=(v-PAC.dph)*.02;}return v;});   // e.phc: hits a foe has taken (read by the tests); PAC.dph: what one hit of the ship takes off (running average, before the on-screen floor)
if(RET.pacing){
  { const ab=ARC.bars;ARC.bars=function(s,full){const b=ab.call(this,s,full);
      if(!RET.pacing||s.ch||!this.active()||s.goal.k==='boss'||s.goal.k==='mini')return b;
      const t=TR.by[s.song],m=SONGM[s.song],bpm=(t&&t.bpm)||(m&&m.bpm)||120;return Math.max(24,Math.min(b,Math.floor(PAC.secs/(240/bpm))));}; }
  { const wk=RET.wallKill;RET.wallKill=new Proxy(wk,{get(t,k){   // a kill goal is kills per second of the (shortened) stage
      if(RET.pacing&&typeof k==='string'&&/^\d+$/.test(k)){const s=STAGES[+k-1];if(s&&!s.ch&&s.goal.k==='kill'&&ARC.active()){const base=s.goal.v*stK(s);if(base>0)return PAC.kv(s)/base;}}
      return t[k];}}); }
  for(const s of STAGES)if(!s.ch&&s.goal.k==='score')s.goal.v=Math.round(s.goal.v*PAC.scK/500)*500;
  { const sl=ST.setLevel;ST.setLevel=function(n){const r=sl.apply(this,arguments);if(RET.pacing)this.dk*=PAC.dk;return r;}; }
  HOOK['DIR.spawnOne'](so=>function(fill,k){
      if(PAC.on()&&PAC.soft()&&!G.boss&&!ST.over&&PAC.alive()>=PAC.cap()&&!(window.ZOO&&ZOO.count()>=ZOO.CAP())){   // a screen that zoo.js already calls busy is zoo.js's to defer
        if((k|0)>=4){PAC.stat.dropped++;return;}PAC.stat.deferred++;DIR.later(2,()=>{if(!G.dead&&!ST.over)DIR.spawnOne(fill,(k|0)+1);});return;}
      return so.call(this,fill);});
  { const es=LEAK.es;LEAK.es=function(e){const v=es.call(this,e);return v*PAC.f(e);}; }
  NR.on('tick',dt=>PAC.tick(dt));
  NR.on('spawn',e=>PAC.trim(e));
}

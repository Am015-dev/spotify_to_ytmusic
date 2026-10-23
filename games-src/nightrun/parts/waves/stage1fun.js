// PURPOSE: story stage 1 stops being boring: foes act at once, a rising script to a peak at ~85% of the waves, two decisions (bounty chase, EMP now or later), then a mini-boss
// FLAG: stage1fun (?stage1fun=0 = the S1 slice script, 36 bars, no boss)
// TEST: qa/simhunt.js (STAGES=1-1 SEEDS=50 ENDLESS=0; URLX=&stage1fun=0 for the old stage)
/* ---------- stage1fun.js (W160, 23 Oct 2026; owner: "focus on one stage ... all game is very boring", "the enemies are sleeping", "the test bot clears stages 1-3 at 100%").
   Rides on slice.js (who enters when) and alive.js (how foes move and shoot). This layer only, on Normal story stage 1:
   - GOAL: the stage becomes waves then a mini-boss (goal 'mini', boss at bar LEAD = ~120 s, fight ~30 s): about 2.5 min in all;
   - SCRIPT: a new bar script, a charger in the very first group, varied shapes (V, wall, pincer, column, cross-fire), a breather at bars 15-16 and 30,
     the cap of live foes and the bullet speed rise by bar (CAPS/BKS), so the pressure climbs to the PEAK (bars 37-45) and then the boss;
   - DECISION 1 (bar 18) BOUNTY: the gold courier sits in the top corner between two shooters for 6 s: fly into the fans for +1000 and a repair, or stay safe;
   - DECISION 2 (bar 31) SWARM: announced: three shooters at once; the ship starts with one EMP charge: burn it on the swarm or keep it for the peak;
   - HULL: the stage starts with HULL points (was 7: the test bot ended at 7 of 7).
   Stats for simhunt: S1F.log {dec, emp:[bar of each EMP], peak}. ---------- */
if(RET.stage1fun===undefined)RET.stage1fun=!/[?&]stage1fun=0/.test(location.search);
const S1F=window.S1F={
  LEAD:47,HULL:4,BHP:110,TMIN:22,MINBAR:8,
  CAPS:[[0,4],[7,5],[17,6],[24,6],[31,7],[37,8]],BKS:[[0,1.1],[21,1.16],[37,1.32]],FNS:[[0,0],[37,1]],CDS:[[0,.4],[13,.36],[21,.32],[31,.28],[37,.19]],CHS:[[0,1],[21,2],[37,3]],
  MINI:{k:5,nm:'TRESOR-WART',r:38,pats:['fan5','ring','fan5'],lbl:'T'},
  T:{g:[[1,[['P',.6,.5],['P',.64,.36],['P',.64,.64],['C',.72,.2]]],                                   // V + a charger from the first beat
       [3,[['P',.62,.2],['P',.62,.4],['P',.62,.6],['P',.62,.8]]],                                     // wall
       [5,[['C',.72,.25],['C',.72,.75],['P',.6,.5]]],                                                 // pincer
       [7,[['S',.74,.5],['P',.6,.25],['P',.6,.75]]],                                                  // the first shooter
       [9,[['P',.58,.15],['P',.6,.32],['P',.62,.5],['P',.6,.68],['P',.58,.85]]],                      // column sweep
       [11,[['S',.76,.25],['C',.7,.7],['P',.6,.45]]],
       [13,[['T',.76,.5],['P',.62,.3]]],                                                              // first tank
       [17,[['P',.62,.4],['P',.62,.6]]],
       [18,[['S',.72,.5],['B',.86,.13,'t'],['S',.74,.84]],{dec:'bounty',ann:['BOUNTY','a gold courier in the corner, two guns cover it: worth the risk?']}],
       [21,[['C',.72,.25],['C',.74,.5],['C',.72,.75],['P',.6,.35],['P',.6,.65]]],                     // charge wave
       [24,[['S',.76,.3],['S',.76,.7],['P',.6,.2],['P',.62,.5],['P',.6,.8]]],                         // cross-fire
       [27,[['T',.76,.4],['C',.72,.8],['P',.6,.2],['P',.6,.6]]],
       [31,[['S',.76,.2],['S',.78,.5],['S',.76,.8],['P',.6,.35],['P',.6,.65]],{dec:'emp',ann:['SWARM','three guns at once: an EMP wipes every bullet. Now, or keep it?']}],
       [34,[['P',.58,.2],['P',.62,.35],['P',.66,.5],['P',.62,.65],['P',.58,.8]]],
       [37,[['T',.76,.3],['S',.76,.75],['C',.7,.5],['P',.6,.2],['P',.6,.6]],{dec:'peak',ann:['FINAL PUSH','everything they have left']}],
       [39,[['P',.58,.15],['P',.6,.32],['P',.62,.5],['P',.6,.68],['P',.58,.85]]],
       [40,[['S',.76,.25],['S',.76,.75],['C',.7,.4],['C',.7,.6],['P',.6,.5]]],
       [42,[['C',.72,.2],['C',.72,.8],['P',.6,.4],['P',.6,.6]]],
       [43,[['T',.76,.6],['S',.76,.2],['C',.7,.8],['P',.6,.35],['P',.6,.5]]]]},
  old:null,log:{emp:[],gz:0},
  want(n){return!!RET.stage1fun&&n===1&&SET.diff==='normal'&&!STAGES[0].ch&&!!window.SL&&!!RET.slice;},
  on(){return ST.on&&this.want(ST.n);},
  at(tab,b){let v=tab[0][1];for(const r of tab)if(b>=r[0])v=r[1];return v;},
  bar(){return Math.floor(G.dbar||0);},
  apply(){const b=this.bar();SL.CAP=this.at(this.CAPS,b);SL.BK[1]=this.at(this.BKS,b);SL.FN[1]=this.at(this.FNS,b);
    if(window.AL){AL.CD[1]=this.at(this.CDS,b);AL.ch1=this.at(this.CHS,b);}},
  restore(){if(!this.old)return;SL.T[1]=this.old.T;SL.CAP=this.old.CAP;SL.BK[1]=this.old.BK;SL.FN[1]=this.old.FN;if(window.AL){AL.CD[1]=this.old.CD;AL.ch1=0;}}};
{
  S1F.old={T:SL.T[1],CAP:SL.CAP,BK:SL.BK[1],FN:SL.FN[1],CD:window.AL?AL.CD[1]:.6};
  /* the goal: waves, then the mini-boss at bar LEAD (a new def object: STAGES[0] itself stays as it was) */
  { const sl=ST.setLevel;ST.setLevel=function(n){const r=sl.apply(this,arguments);
      if(S1F.want(n)){this.def=Object.assign({},STAGES[0],{goal:{k:'mini'},mini:S1F.MINI});this.len=stLen(this.def);this.lead=S1F.LEAD;this.len=Math.max(this.len,this.lead+MINI_BARS);this.hp0=S1F.HULL;}
      return r;}; }
  /* the first boss is a plain, readable fight: its own fan + ring patterns, no borrowed verbs, arena rules or zone strikes (those hit from places the ship cannot read yet) */
  if(window.BMV){const io=BMV.idOf;BMV.idOf=function(e){if(e&&e.mini&&S1F.on())return null;return io.apply(this,arguments);};}
  if(typeof B2!=='undefined'){const tm=B2.tmin;B2.tmin=function(e){return e&&e.mini&&S1F.on()?S1F.TMIN:tm.apply(this,arguments);};}   // the DPS ceilings (fair.js 30 s, armour.js 50 s for a mini) would stretch a first boss to ~55 s
  if(window.B2X){const tf=B2X.tf;B2X.tf=function(e){return e&&e.mini&&S1F.on()?S1F.TMIN:tf.apply(this,arguments);};}
  { const sb=spawnBoss;spawnBoss=function(o){const b=sb.apply(this,arguments);if(b&&b.mini&&S1F.on()&&b.minBar)b.minBar=S1F.MINBAR;return b;}; }   // b.js holds a mini-boss at an HP floor for 14 bars (~37 s at 92 BPM)
  { const bh=ST.bossHp;ST.bossHp=function(){const v=bh.apply(this,arguments);return S1F.on()?S1F.BHP:v;}; }
  { const b=SL.beat;SL.beat=function(i){if(S1F.on())i=Math.max(0,(G.bc|0)-1);return b.call(this,i);}; }   // the script runs on the stage's own beat count (G.bc, like the boss bar): the song's beat index can fall behind it and stall the script for 30 s
  NR.on('runStart',()=>{if(S1F.on()){SL.T[1]=S1F.T;S1F.apply();P.emp=Math.max(P.emp|0,1);}else S1F.restore();S1F.log={emp:[],gz:0};S1F.e0=P.emp|0;});
  NR.on('graze',()=>{if(S1F.on())S1F.log.gz++;});
  NR.on('tick',()=>{if(!S1F.on())return;S1F.apply();const e=P.emp|0;if(e<S1F.e0)S1F.log.emp.push(+G.dbar.toFixed(1));S1F.e0=e;});
}
/* ---------- W175 RISK MEDALS (23 Oct 2026; flag s1risk, OFF by default: ?s1risk=1 turns it on). Player decision: "fly into the fire for the medal or stay safe",
   and "EMP on the swarm or keep it for the final push". Stage 1 only (S1F.on):
   - a medal picked up within HOT s of the kill that dropped it pays x3 (2 extra shares, shown as "FIRE MEDAL x3"); later it pays x1 as before;
   - the EMP meter and EMP pickups do not refill: the one charge of the stage is all there is. ---------- */
{
  if(RET.s1risk===undefined)RET.s1risk=/[?&]s1risk=1/.test(location.search);
  const R=window.S1R={HOT:1.5,seen:new Map(),hint:0,left:1,last:1,on(){return!!RET.s1risk&&S1F.on();}};
  if(window.ABIL){const g=ABIL.gain;ABIL.gain=function(){if(R.on())return;return g.apply(this,arguments);};}
  NR.on('runStart',()=>{R.seen.clear();R.hint=0;R.left=Math.max(P.emp|0,1);R.last=R.left;});
  NR.on('tick',()=>{if(!R.on())return;
    if(P.emp<R.last)R.left=Math.max(0,R.left-(R.last-P.emp));   // a charge was spent: it is gone for the stage
    if(P.emp>R.left)P.emp=R.left;R.last=S1F.e0=P.emp;
    for(const p of G.pk)if(p.t==='shard'&&!R.seen.has(p))R.seen.set(p,G.t);
    for(const[p,t0]of R.seen){if(G.pk.includes(p))continue;R.seen.delete(p);
      if(!p.dead||p.x<-30||G.dead)continue;   // it left the screen (p.x<-30) instead of being picked up
      if(G.t-t0<=R.HOT){G.score+=2*Math.round(50*G.mult*(SH.smk||1));floater(P.x,P.y-24,'FIRE MEDAL x3','#ffd24a');}}
    if(!R.hint&&R.seen.size){R.hint=1;hintShow('Medals picked up right after a kill pay triple',4);}});
}

// PURPOSE: power-aware enemy scale, round 1
// FLAG: scale (?scale=0)
// TEST: scale-test.js
/* ---------- power-aware scale (flag RET.scale; ?scale=0 = the old numbers exactly). BALANCE.md "Power scale". ----------
   The player's power score counts what the Garage sells that upsCalc (dir.js) did not: permanent weapon levels, the fusion, plus shop and garage perks (UPS.u).
   Enemy hull points grow with the power ABOVE what the stage expects, up to a ceiling; a weapon level adds less damage per shot than it used to (LV10 = 1.8x LV1, not 2.5x+). Bosses are not scaled (their armour sets the fight). */
if(RET.scale===undefined)RET.scale=!/[?&]scale=0/.test(location.search);   // power-aware scale: enemy hull follows the player's power, weapon level growth is diminishing
const SC=window.SC={get on(){return!!RET.scale;},k:.6,ref:4,lvTop:.8,
  e0:.25,e1:.055,
  wu(){let u=0;try{for(const id of WP.eqIds())u+=.1*(WP.lvOf(id)-1);if(WP.fu())u+=.3;}catch(e){}return u;},
  power(){return(UPS.u||0)+this.wu();},
  exp(){const n=ST.on?Math.min(40,ST.n):Math.min(40,6*(G.pos+5*G.loop)+2);return this.e0+this.e1*n;},
  over(){return Math.max(0,this.power()-this.exp());},
  f(){return this.on?1-Math.exp(-this.over()/this.ref):0;},   // 0 at the expected power, .6 for a mid garage, .9 for a maxed one
  hpK(){return 1+this.k*this.f();},
  proj:['pulse','laser','swarm','disc','frost','wave','shell','drone'],      // the weapons whose shots go through WP.shots (g.js): their damage per shot follows lvW; blades, arc, mines, rail, flame, wells, storms and the beat cannon keep their old growth
  scaled(id){return this.on&&this.proj.includes(id);},
  lvW(L){return 1+(this.on?this.lvTop:1.5)*(L-1)/9;},                  // the number the Garage card shows: x power of a weapon level
  wk(id){if(!this.scaled(id))return 1;const L=WP.lvOf(id);return this.lvW(L)/(1+1.5*(L-1)/9);}};   // damage per shot of weapon id: its new curve over the old one
window.__scale={SC,en:(t,o)=>en(t,o||{}),spawnBoss:o=>spawnBoss(o),UPS,upsCalc};

/* hardest tiers (story): a higher stage level and tougher hulls than the old table, no mercy, the first shot of an enemy one beat sooner (SC.firstShot).
   Normal and Easy keep their numbers; the DMG caps, the on-screen floor, ebCap and BCAP are untouched. */
SC.hard={hard:{lv:.5,hp:1.2},vhard:{lv:.9,hp:1.3},legend:{lv:1.2,hp:1.45}};
SC.firstShot=()=>SC.on&&HARDS.includes(SET.diff)&&SET.diff!=='hard'?1:2;
if(RET.scale){Object.assign(TUNE.dm,SC.hard);
  const mh=RET.mercyHull,ml=RET.mercyLvl;RET.mercyHull=n=>HARDS.includes(SET.diff)&&SET.diff!=='hard'?0:mh.call(RET,n);RET.mercyLvl=n=>HARDS.includes(SET.diff)&&SET.diff!=='hard'?0:ml.call(RET,n);}

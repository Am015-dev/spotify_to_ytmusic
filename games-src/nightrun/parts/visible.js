/* ---------- VISIBLE: enemies live on screen long enough to be seen, read and fought (flag RET.vis, default ON; ?vis=0 = the old rules). Test: nightrun/visible-test.js. BALANCE.md "Visible".
   1. on-screen floor per kind (DMG.minLife asks VIS.ml): a foe cannot lose its hull faster than this, whatever hits it (spread, chain, arc, homing, blades),
      so a maxed area weapon caps out at hull/second per target instead of deleting the screen. The old floor shrank to .65x on late stages; this one does not.
   2. abilities skip the floor: EMP (G.empT) and rams already did; a DASH hit, a beat-parried shot, a COMBO blast or an EMP warden strip (e.dk) now do too, for .25 s: DASH/EMP/timing are the way through a tough wave.
   3. homing (SH.steer) never locks on a foe outside the playfield (x > W-30) and flies straight for its first VIS.lock s, so a missile cannot pick a target before you can see it.
   4. no damage outside the playfield: the DMG entry grace (x > W-40) also covers a foe that has left the screen (VIS.ok), so nothing dies unseen.
   5. Normal from stage 10 has a hull of 5 (was 6) (VIS.hullD in story.js). Entry keeps the edge telegraph ring. Bosses keep armour.js. */
if(RET.vis===undefined)RET.vis=!/[?&]vis=0/.test(location.search);
const VIS=window.VIS={get on(){return!!RET.vis&&!(typeof G==='object'&&G&&G.tut);},   // the tutorial keeps its own pacing
  edge:W-30,lock:.18,dk:.25,hk:.8,   // hk: Hard+ late stages still shorten the floor (dense waves), never below .8

  ml:{drone:1.6,charger:2.1,flank:2.1,gunship:5.2,gate:3.1,turret:3.1,gtank:3.1,gturret:3.1,gwalker:2.6,swarm:1.05,mine:1.05},zoo:2.1,el:4,elC:2.1,
  ok(e){return e.type==='boss'||!(e.x>this.edge||e.x<-20||e.y<-10||e.y>H+10);},   // only a foe clearly outside counts (a position not yet set does not)
  // Normal from stage 10: hull at most 5 (was 6 to stage 26; the stage-8 boss stays on 7): a hit costs more, so DASH timing, EMP and reading the wave matter (mercy still adds +1)
  hull:5,hullD(n){return this.on&&SET.diff==='normal'&&n>=10?Math.min(0,this.hull-TUNE.hull[n-1]):0;},
  life(e){if(G.t-(e.dk==null?-9:e.dk)<this.dk||(e.ctw&&!e.wsh))return 0;   // an EMP-stripped warden has no floor: its shield was its protection
    const b=this.ml[e.type]!=null?this.ml[e.type]:e.zt?Math.max(this.zoo,DMG.ml[e.type]||0):(DMG.ml[e.type]||0);
    return(e.el?(e.type==='charger'?Math.max(this.elC,b):Math.max(this.el,b)):b)*(SET.diff==='easy'?DMG.easyK:HARDS.includes(SET.diff)?Math.max(this.hk,DMG.lm()):1);}};

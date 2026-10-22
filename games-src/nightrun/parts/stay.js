// PURPOSE: stages 7-20 and endless: enemies enter, settle and stay until killed or their pattern ends; at most 8 on screen; a breather between groups
// FLAG: stay (?stay=0)
// TEST: stay-test.js
/* ---------- stay.js (owner, 22 Oct 2026: "most enemies just fly and do not die, they fly fast and I have no time to eliminate them; the game is more gambling than strategy").
   Flag RET.stay, default ON; ?stay=0 = the game as it was. Easy / Normal only (as pacing.js), story stages 7-20 and endless (stages 1-6 are the named waves, waves.js).
   1. ENTRY SPEED: a formation unit never flies faster than the base path speed (STAY.tkMax), so it crosses the screen in >= 6 s and is on screen >= 4 s before it can leave.
   2. HOLD: in endless pacing.js holds nothing (ENDR zeroes PAC.hold); there a flyer that has come in creeps for STAY.hold s like the story flyers, then moves on.
   3. SECOND PASS: a formation unit that is about to leave alive flies its pattern once more from the right edge (pacing.js only did this for units that move themselves).
   4. AT MOST STAY.cap (8) FOES ON SCREEN: a formation unit waits off screen (at the start of its path) until a place is free; it never waits longer than STAY.wait s.
   5. BREATHER: the director sends the next group only when the screen holds <= STAY.calm foes or STAY.breath s have passed since the last group (and, whatever the time, only while fewer than cap-3 foes are alive; up to 4 two-beat waits, then it comes).
   6. A normal foe takes one more hit than pacing.js allows (5, later 6): long enough to be a target. Test: nightrun/stay-test.js. ---------- */
if(RET.stay===undefined)RET.stay=!/[?&]stay=0/.test(location.search);
const STAY=window.STAY={cap:8,tkMax:1,hold:4.2,holdF:.3,tele:.6,wait:6,breath:7,calm:3,more:2,n:0,ft:-1,last:-99,
  stat:{gated:0,loops:0,deferred:0,passed:0,held:0},
  on(){return!!RET.stay&&!!RET.pacing&&window.PAC&&PAC.on()&&PAC.soft()&&(ST.on?ST.n>=7&&!(ST.def&&ST.def.ch):!!(window.ENDR&&ENDR.on()));},
  counted(e){return e.type!=='boss'&&!e.mini&&e.type!=='mine'&&e.type!=='gate'&&e.hp>0&&!e.dead&&e.x<W-6&&e.x>-10&&e.y>-10&&e.y<H+10;},
  count(){if(this.ft!==G.t){this.ft=G.t;let n=0;for(const e of G.en)if(this.counted(e))n++;this.n=n;}return this.n;},
  alive(){let n=0;for(const e of G.en)if(e.type!=='boss'&&!e.mini&&e.type!=='mine'&&e.type!=='gate'&&e.hp>0&&!e.dead)n++;return n;},
  f(e){   // a foe that is not on a formation path: waits off screen for a free place; endless only: pacing.js holds nothing there (PAC.hold is 0)
    if(!this.on()||e.fp||e.gnd||e.type==='boss'||e.type==='gate'||e.type==='mine'||e.mini)return 1;
    const s=e.stq||(e.stq={T:0,tl:0,told:0,lt:G.t,w:0}),dt=Math.max(0,Math.min(.1,G.t-s.lt));s.lt=G.t;
    if(e.x>W-6&&!G.boss&&this.count()>=this.cap&&s.w<this.wait){s.w+=dt;if(!s.g){s.g=1;this.stat.gated++;}return 0;}
    if(ST.on||PAC.hold>0||G.boss||!PAC.eligible(e))return 1;
    if(!(e.x<=PAC.zone)||e.x<30&&s.T>=this.hold)return 1;
    if(s.T<this.hold){s.T+=dt;if(s.T-dt<=0)this.stat.held++;return this.holdF;}
    if(!s.told){s.told=1;s.tl=this.tele;e.flash=Math.max(e.flash,.2);G.rings.push({x:e.x,y:e.y,l:.5,m:.5,c:'#ffb02d'});}
    if(s.tl>0){s.tl-=dt;return this.holdF;}
    return 1;}};
if(RET.stay&&window.FM&&window.PAC){
  { const mv=FM.mv;FM.mv=function(e,dt,d){
      if(e.fp&&STAY.on()&&e.x>W-6){   // not on screen yet: wait for a free place
        if(STAY.count()>=STAY.cap){e.stqw=(e.stqw||0)+dt;if(e.stqw<STAY.wait){if(!e.stqg){e.stqg=1;STAY.stat.gated++;}e.vx=0;return true;}}
      }
      const out=e.x>W-6,r=mv.call(this,e,dt,d);
      if(out&&e.x<=W-6&&e.fp&&STAY.on())STAY.n++;   // it came in this frame: the place is taken
      return r;}; }
  NR.on('fmUnit',o=>{const e=o&&o.e;if(e&&e.fp&&STAY.on()&&e.tk>STAY.tkMax)e.tk=STAY.tkMax;});
  { const es=LEAK.es;LEAK.es=function(e){const v=es.call(this,e);return v*STAY.f(e);}; }
  { const tr=PAC.trim;PAC.trim=function(e){if(!STAY.on())return tr.apply(this,arguments);const h=this.hits;this.hits=h+STAY.more;try{return tr.apply(this,arguments);}finally{this.hits=h;}}; }
  { const so=DIR.spawnOne;DIR.spawnOne=function(fill,k){
      if(STAY.on()&&!G.boss&&!ST.over&&!G.dead){
        const calm=STAY.count()<=STAY.calm,open=G.t-STAY.last>=STAY.breath;
        if((!calm&&!open||STAY.alive()>=STAY.cap-3)&&(k|0)<4){STAY.stat.deferred++;DIR.later(2,()=>{if(!G.dead&&!ST.over)DIR.spawnOne(fill,(k|0)+1);});return;}
        STAY.last=G.t;STAY.stat.passed++;}
      return so.call(this,fill,k);}; }
  NR.on('tick',dt=>{
    if(!STAY.on()||G.dead||ST.over)return;
    for(const e of G.en){
      if(!e.fp||e.stql||e.hp<=0||e.dead||e.x>=12||e.pt<=0||e.type==='boss'||e.mini)continue;   // would leave alive: the pattern once more from the right edge
      e.stql=1;e.pt=-.2;e.stqg=0;e.stqw=0;if(e.pc){e.pc.T=0;e.pc.told=0;e.pc.tl=0;}if(e.stq){e.stq.T=0;e.stq.told=0;e.stq.tl=0;}
      STAY.stat.loops++;G.rings.push({x:W-14,y:clamp(e.y,50,H-50),l:.5,m:.5,c:'#ff3d6a'});}});
  NR.on('runStart',()=>{STAY.last=-99;STAY.ft=-1;});
}

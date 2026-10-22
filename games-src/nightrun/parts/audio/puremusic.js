// PURPOSE: the song plays clean, nothing filters, ducks, cuts or covers it; only a few quiet game sounds are left
// FLAG: pure (?pure=0 = the old mix)
// TEST: qa/puremusic-test.js
/* ---------- PURE: owner, 22 Oct 2026: "keep the music not distorted by any power up, no perfect sound effects or anything that makes the game experience bad".
   The song goes straight from its volume to the master (no combo low-pass, no duck, no Drop cut, no SLOW low-pass, no pause-screen filter).
   Game sounds: only 'hurt' (you were hit), 'pick' (you took something) and 'boom' (an enemy died) are left, quieter; every other effect, every
   music sting and every power-up sound is silent. Menu sounds (outside a run) stay. ---------- */
if(RET.pure===undefined)RET.pure=!/[?&]pure=0/.test(location.search);
const PURE=window.PURE={KEEP:{hurt:1,pick:1,boom:1},GAIN:.22,blocked:0,played:0,
  wire(){const a=AU.a;if(!a||this.done||!AU.musv||!AU.m)return;this.done=1;
    try{AU.musv.disconnect();}catch(e){}AU.musv.connect(AU.m);                 // song: volume -> master, nothing in between
    this.ok=a.createGain();this.ok.gain.value=this.GAIN;this.ok.connect(AU.sfxv);   // the few sounds that stay
    try{AU.fx.gain.value=0;}catch(e){}}};                                    // power-up and effect sounds wired straight to AU.fx: silent
if(RET.pure){
  {const i0=AU.init;AU.init=function(){const r=i0.apply(this,arguments);PURE.wire();return r;};}
  AU.duckMusic=function(){};AU.slowColour=function(){};
  {const s0=AU.sfx;AU.sfx=function(n){PURE.wire();
    if(running&&!PURE.KEEP[n]){PURE.blocked++;return;}
    const F0=this.fx;if(PURE.ok)this.fx=PURE.ok;PURE.played++;try{return s0.apply(this,arguments);}finally{this.fx=F0;}};}
  {const g0=AU.sting;AU.sting=function(){if(running){PURE.blocked++;return false;}return g0.apply(this,arguments);};}}

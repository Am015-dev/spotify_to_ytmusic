/* ---------- retention features: one flag each in RET (false = the game plays exactly as before) ---------- */
const RET=window.RET=window.RET||{};
if(RET.arcade===undefined)RET.arcade=true;
/* ARCADE cut (RET.arcade): a main stage is cut to about 160 s of song (never more than 80 bars, boss still in the last 32 bars).
   The cut is a whole number of bars. The player picks ARCADE or CLASSIC on the stage plate; the choice is saved. */
const ARC={secs:160,maxBars:80,on:load('mnr_arc',1)!==0,
  set(v){this.on=!!v;save('mnr_arc',v?1:0);},
  active(){return !!RET.arcade&&this.on;},
  bars(s,full){if(s.ch||!this.active())return full;const t=TR.by[s.song],m=SONGM[s.song],bpm=(t&&t.bpm)||(m&&m.bpm)||120;
    return Math.max(Math.min(full,BOSS_BARS+24),Math.min(full,this.maxBars,Math.floor(this.secs/(240/bpm))));},
  label(){return this.active()?'ARCADE · ~3 MIN':'CLASSIC · FULL SONG';}};
window.ARC=ARC;

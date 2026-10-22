// PURPOSE: the song changes only when the district changes, and keeps playing (no restart) between stages and through the menus
// FLAG: steady (?steady=0 = a new song every stage, menu song between stages)
// TEST: qa/loadgate.js (no page errors); fingerprint-test (sim: no audio)
/* ---------- STEADY: owner, 22 Oct 2026: "the song changes too often between stages".
   Before: each story stage had its own song (stage1/stage2/stage3 in turn, a shuffled pool from stage 5), the menu between two stages switched to the
   menu song, and starting a stage restarted its song from the top. Now:
   1. every stage of a district plays that district's song (the song of the district's first story stage), boss fights keep their boss song;
   2. a stage that wants the song already playing keeps it running (no restart, the beat clock just continues);
   3. after a run, the menus keep the stage song instead of switching to the menu song (the title on first load still plays the menu song). ---------- */
if(RET.steady===undefined)RET.steady=!/[?&]steady=0/.test(location.search);
if(RET.steady){
  {const per={},used=new Set(),POOL=['stage1','stage3','endless','stage2','endless2'];for(const d of STAGES){if(d.ch)continue;   // each district its own song (no two districts share one)
    if(per[d.di]===undefined){let s=d.song;if(used.has(s))s=POOL.find(x=>!used.has(x))||s;per[d.di]=s;used.add(s);}d.song=per[d.di];}}
  {const s0=AU.startStage;AU.startStage=function(stage,at){const c=this.cur;
    if(stage!=='menu'&&c&&c.stage===stage&&BT.stage===stage&&BT.mode==='file'){this.want=null;this.wantT=0;return;}   // same song: keep it running
    return s0.apply(this,arguments);};}
  {const m0=AU.menuMusic;AU.menuMusic=function(){if(BT.stage&&BT.stage!=='menu'&&this.cur)return;return m0.apply(this,arguments);};}}

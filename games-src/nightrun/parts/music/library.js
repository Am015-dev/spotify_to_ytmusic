// PURPOSE: the owner's whole music library is used: one song per story stage, one per boss, endless rotation, nothing but songs between songs
// FLAG: library (?library=0 = the older song picks and jingles)
// TEST: qa/library-test.js
/* ---------- LIBRARY (owner, 6 Nov 2026: "the music variety I gave you is not used, I listen annoying jingles in between"). The map is in MUSIC-MAP.md.
   1. Flight: story stages 1-32 walk FLIGHT (11 songs, so any 10 stages in a row are 10 different songs, none twice in a row); Athens stages (33-40) walk ATH.
   2. Bosses: DP.boss(k) is one fixed song per boss; the last boss changes song on each phase (BOSS6). Endless laps 2+ rotate ENDLESS.
   3. No jingles: every sting is refused, and warn / perfect (and, outside a run, up / tier / phase) never sound. The boss-in sting is 2.6 s long, over the 1.5 s limit, so it is out too.
   4. Result screens keep the song playing, 6 dB lower; the title plays the menu song only after the player has left the result screen.
   The song change itself is the engine's own bar-line cross-fade (AU.xfade, one bar). ---------- */
if(RET.library===undefined)RET.library=!/[?&]library=0/.test(location.search);
const LIB=window.LIB={FLIGHT:['stage1','d1a','d2a','stage2','d1b','d2b','d3a','stage3','d3b','d4a','d4b'],ATH:['athina','athA','athina2','athB'],
  BOSS:{0:'boss-d1',1:'boss-d2',2:'boss-d3',3:'boss-d4',6:'boss2'},BOSS6:['boss2','boss3','boss'],ENDLESS:['endless','endless2','endless3'],
  NOSFX:['warn','perfect'],MENUSFX:['up','tier','phase','big'],low:false,leave:0,log:[],refused:[]};
LIB.on=()=>RET.library;
LIB.st=()=>({run:running,res:!resEl.hidden,over:!overEl.hidden,title:!titleEl.hidden,foot:!!(window.FOOT&&FOOT.on)});   // test hook
LIB.has=k=>!!(TR.by&&TR.by[k]);
LIB.pick=(pool,i)=>{const a=pool.filter(LIB.has);return a.length?a[i%a.length]:null;};
if(RET.library){
  /* flight: the song of story stage n (challenge stages keep their own, they are tuned to it) */
  {let key=-1,seq=[];const build=()=>{seq=[];let f=0,a=0;for(const s of STAGES){if(s.ch)continue;seq[s.n]=s.di===4?LIB.pick(LIB.ATH,a++):LIB.pick(LIB.FLIGHT,f++);}key=TR.list.length;};
   for(const s of STAGES){if(s.ch)continue;const old=s.song;
     Object.defineProperty(s,'song',{configurable:true,enumerable:true,get(){if(key!==TR.list.length)build();return seq[this.n]||old;},set(v){Object.defineProperty(this,'song',{value:v,writable:true,configurable:true,enumerable:true});}});}}
  /* bosses and endless laps: the dpool selectors give the fixed picks */
  {const b0=DP.boss;DP.boss=function(k){const s=LIB.BOSS[k];return s&&LIB.has(s)?s:b0.apply(this,arguments);};
   const e0=DP.endless;DP.endless=function(di,loop){if(loop>=1){const p=posOf(di),s=LIB.pick(LIB.ENDLESS,p+loop*2);if(s)return s;}return e0.apply(this,arguments);};}
  /* the last boss changes song with each phase (the other bosses use their own a / b takes, musicpack.js) */
  NR.on('bossPhase',()=>{if(!running)return;const cur=((AU.want||(BT.pend&&BT.pend.v.stage)||BT.stage)||'').replace('~b',''),i=LIB.BOSS6.indexOf(cur);if(i<0)return;
    const nx=LIB.pick(LIB.BOSS6,i+1);if(nx&&nx!==cur){LIB.log.push('phase '+cur+'>'+nx);AU.switchTo(nx);}});
  /* no jingles */
  {const s0=AU.sting;AU.sting=function(n){LIB.refused.push('sting:'+n);return false;};void s0;}
  {const x0=AU.sfx;AU.sfx=function(n){if(LIB.NOSFX.includes(n)||(!running&&LIB.MENUSFX.includes(n))){LIB.refused.push('sfx:'+n);return;}return x0.apply(this,arguments);};}
  /* result screens: the stage song goes on, 6 dB lower; the menu song only on the title, after the result screen was left */
  LIB.setLow=on=>{LIB.low=on;const a=AU.a;if(!a||!AU.musv)return;try{AU.musv.gain.setTargetAtTime(SET.music*(on?.501:1),a.currentTime,.35);}catch(e){}};
  {const v0=AU.vol;AU.vol=function(){const r=v0.apply(this,arguments);if(LIB.low)LIB.setLow(true);return r;};}
  const foot=()=>!!(window.FOOT&&FOOT.on);
  NR.on('runStart',()=>{LIB.leave=0;});NR.on('footStart',()=>{LIB.leave=0;});
  NR.on('runEnd',d=>{if(d&&d.quit)LIB.leave=LIB.leave||performance.now();});
  setInterval(()=>{if(!AU.a)return;const now=performance.now();
    const res=(!overEl.hidden||!resEl.hidden)&&!running||(foot()&&FOOT.S&&!!FOOT.S.end);
    if(res!==LIB.low)LIB.setLow(res);
    if(res&&!LIB.leave)LIB.leave=now;
    if(!res&&!running&&!foot()&&!titleEl.hidden&&LIB.leave&&now-LIB.leave>900&&BT.stage!=='menu'){LIB.leave=0;LIB.log.push('menu after '+BT.stage);AU.startStage('menu');}},200);
}

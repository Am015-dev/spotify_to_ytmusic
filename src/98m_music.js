// ===== MUS (fix21): streamed music tracks (Alex's Suno files) + AUDIO knobs. Tracks live next to index.html in music/<name>.mp3
// (tools/build.sh copies src/assets/music/ to out/<ver>/music/). Only names in MUS_FILES are ever requested, so a mode without a file
// (water, win) never makes a 404: it keeps the old synth music. Two <audio preload="none"> slots, routed through the game's AudioContext
// (AU.m = master: the menu SOUND ON/OFF button mutes music too; GainNode volume also works on iOS, where audio.volume is fixed at 1).
// Crossfade on mode change, loop, resume where a track left off. Nothing plays before the first tap (iOS autoplay rules).
// Knobs (TUNE drawer AUDIO tab): TUNE.musOn, musVol, sfxVol, duckOn, duckAmt. New track from Alex = add the file to src/assets/music/ + its name here.
const MUS_FILES=['menu','garage','city_fra','city_ath','race'];
const MUS_MAP={menu:'menu',garage:'garage',fra:'city_fra',ath:'city_ath',race:'race',race_final:'race',water:'water',win:'win'};
const MUS={slots:[],cur:null,want:null,mode:'',unlocked:false,pos:{},dead:{},duck:1,bDuckT:0,log:[],t0:performance.now(),synth:null};
function MUS_mode(){try{const g=document.getElementById('gbx');if(g&&!g.hidden)return'garage';
  if(state==='menu'||state==='loading')return'menu';if(state==='results')return'win';
  if(state==='race'||state==='countdown'||state==='finished')return pl&&(pl.boatK||0)>.5?'water':(typeof RC!=='undefined'&&RC&&RC.final?'race_final':'race');
  if(state==='roam')return pl&&(pl.boatK||0)>.5?'water':(CID==='ath'?'ath':'fra')}catch(e){}return MUS.mode||'menu'}
function MUS_track(mode){const t=MUS_MAP[mode];return t&&MUS_FILES.includes(t)&&!MUS.dead[t]?t:null}
// R3: slots are plain <audio> elements from page load (no AudioContext needed yet); the GainNode route is wired on the first gesture (MUS_wire).
// Slot 0 PREFETCHES menu.mp3 at load (preload=auto: the browser buffers the first seconds), so the first tap can start it at once.
// Other tracks load lazily (src + preload=auto only when a mode needs them).
function MUS_slot(pre){const el=new Audio();el.preload=pre||'none';el.loop=true;el.crossOrigin='anonymous';el.setAttribute('playsinline','');
  const s={el,g:null,name:null};
  el.addEventListener('loadedmetadata',()=>{if(s.seek!=null){try{el.currentTime=s.seek}catch(e){}s.seek=null}});
  el.addEventListener('playing',()=>{if(s.name&&MUS.tPlay==null){MUS.tPlay=performance.now();MUS.log.push({t:MUS_now(),playing:s.name,afterTapMs:MUS.tTap!=null?Math.round(MUS.tPlay-MUS.tTap):null})}});
  el.addEventListener('error',()=>{if(s.name){MUS.dead[s.name]=1;MUS.log.push({t:MUS_now(),err:s.name});s.name=null;if(MUS.cur===s)MUS.cur=null}});return s}
function MUS_wire(){const a=AU.a;if(!a)return;for(const s of MUS.slots)if(!s.g){s.g=a.createGain();s.g.gain.value=0;try{a.createMediaElementSource(s.el).connect(s.g)}catch(e){}s.g.connect(AU.m)}}
const MUS_SIL='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
const MUS_now=()=>+((performance.now()-MUS.t0)/1000).toFixed(1);
function MUS_level(){return(TUNE.musOn>0?1:0)*clamp(TUNE.musVol,0,1)*(SET.mus??1)*MUS.duck}
// synth music bus (AU.mus): silent while a track plays; otherwise follows the music knobs (0.5 = the old level)
function MUS_synth(){if(!AU.a)return;const v=MUS.cur?0:.26*(SET.mus??1)*(TUNE.musOn>0?1:0)*clamp(TUNE.musVol,0,1)/.5;if(MUS.synth!==v){MUS.synth=v;AU.mus.gain.setTargetAtTime(v,AU.a.currentTime,.4)}}
function MUS_sfx(){if(AU.a)AU.fx.gain.setTargetAtTime(.55*(SET.sfx??1)*Math.max(0,TUNE.sfxVol),AU.a.currentTime,.05)}
function MUS_play(name){const a=AU.a,t=a.currentTime;MUS_wire();
  const old=MUS.cur;if(old&&old.name===name)return;
  if(old){MUS.pos[old.name]=old.el.currentTime||0;old.g.gain.cancelScheduledValues(t);old.g.gain.setTargetAtTime(0,t,.45);const o=old,n0=o.name;setTimeout(()=>{if(MUS.cur!==o&&o.name===n0)try{o.el.pause()}catch(e){}},2600)}
  if(!name){MUS.cur=null;return}
  const s=MUS.slots.find(q=>q!==old)||MUS.slots[0];s.name=name;const src='music/'+name+'.mp3';if(!s.el.src.endsWith(src)){s.el.preload='auto';s.el.src=src}
  const sk=MUS.pos[name]||0;if(s.el.readyState>=1){try{s.el.currentTime=sk}catch(e){}s.seek=null}else s.seek=sk; // resume where the track left off (seek after metadata when it is not loaded yet)
  s.g.gain.cancelScheduledValues(t);s.g.gain.setValueAtTime(0,t);s.g.gain.setTargetAtTime(MUS_level(),t+.02,old?.5:.12); // first start fades in fast
  s.el.muted=false;const p=s.el.play();if(p&&p.catch)p.catch(e=>{s.fail=String(e&&e.name||e)});MUS.cur=s}
// g = called inside a user gesture: play() must run NOW, even while the AudioContext is still resuming
function MUS_tick(g){if(!AU.a||!MUS.unlocked||(!g&&AU.a.state!=='running'))return;const mode=MUS_mode(),tr=TUNE.musOn>0?MUS_track(mode):null;
  if(mode!==MUS.mode||tr!==(MUS.cur&&MUS.cur.name)){if(mode!==MUS.mode||tr!==MUS.want)MUS.log.push({t:MUS_now(),mode,track:tr||'(synth)'});if(MUS.log.length>80)MUS.log.shift();MUS.mode=mode;MUS.want=tr;MUS_play(tr)}
  // duck: dialogue / cutscenes (TUNE.duckOn, duckAmt) and the boost whoosh (half the amount, 0.8 s)
  const bst=!!(pl&&pl.nitro)||!!(typeof RO!=='undefined'&&RO&&RO.boosting);if(bst&&!MUS.bWas)MUS.bDuckT=.8;MUS.bWas=bst;MUS.bDuckT=Math.max(0,MUS.bDuckT-.1);
  let dk=1;if(TUNE.duckOn>0){const dl=(typeof AU_isDlg==='function'&&AU_isDlg())||(typeof M1!=='undefined'&&M1.cs);if(dl)dk=1-clamp(TUNE.duckAmt,0,1);else if(MUS.bDuckT>0)dk=1-clamp(TUNE.duckAmt,0,1)*.5}MUS.duck=dk;
  const t=AU.a.currentTime;if(MUS.cur){const L=MUS_level();if(Math.abs((MUS.cur.lv??-1)-L)>.002){MUS.cur.lv=L;MUS.cur.g.gain.setTargetAtTime(L,t,.15)}}MUS_synth();MUS_sfx()}
setInterval(()=>{try{MUS_tick()}catch(e){MUS.err=String(e)}},100);
// first tap / key (R3): browsers allow sound only from a user gesture, and iOS counts only touchend/click/keydown (not a touch pointerdown).
// Every gesture event: AU.init (+ resume); the first one starts the mode's track INSIDE the handler (MUS_tick(true) → el.play()), and any later
// gesture retries a track that is still paused (a play() refused on pointerdown is retried on the touchend of the same tap: no extra tap).
// The idle slot is blessed for later crossfades by a muted play() of a tiny silent wav (no second mp3 download).
{const un=e=>{if(MUS.tTap==null)MUS.tTap=performance.now();try{AU.init()}catch(_){}if(!AU.a)return;
   if(!MUS.unlocked){MUS.unlocked=true;MUS_wire()}
   try{MUS_tick(true)}catch(_){}
   const c=MUS.cur;if(c&&c.el.paused&&c.name){const p=c.el.play();if(p&&p.catch)p.catch(()=>{})}
   for(const s of MUS.slots)if(s!==MUS.cur&&!s.name&&!s.bl&&(!s.el.src||s.el.src===MUS_SIL)){s.bl=1;try{if(!s.el.src)s.el.src=MUS_SIL;s.el.muted=true;const p=s.el.play();if(p&&p.then)p.then(()=>{if(!s.name)s.el.pause()},()=>{s.bl=0})}catch(_){s.bl=0}}};
 for(const ev of['pointerdown','pointerup','touchend','click','keydown'])addEventListener(ev,un,{capture:true,passive:true})}
// prefetch menu.mp3 now (unless music is off): streaming playback can start on the first tap without a full fetch + decode
MUS.slots.push(MUS_slot(TUNE.musOn>0&&(SET.mus??1)>0?'auto':'none'),MUS_slot());if(MUS.slots[0].el.preload==='auto'){MUS.slots[0].el.src='music/menu.mp3';try{MUS.slots[0].el.load()}catch(e){}}
// SET sliders / SOUND button keep working: AU.setVol re-applies the music + sfx knobs on top
{const f0=AU.setVol;AU.setVol=function(){const r=f0.apply(this,arguments);MUS.synth=null;if(MUS.cur)MUS.cur.lv=-1;try{MUS_synth();MUS_sfx()}catch(e){}return r}}
window.__mus={st:()=>({mode:MUS.mode,track:MUS.cur&&MUS.cur.name,unlocked:MUS.unlocked,ctx:AU.a&&AU.a.state,muted:!!AU.muted,level:+MUS_level().toFixed(3),duck:MUS.duck,synth:MUS.synth,
  tTap:MUS.tTap,tPlay:MUS.tPlay,playing:MUS.slots.map(s=>({name:s.name,paused:s.el.paused,t:+(s.el.currentTime||0).toFixed(1),g:s.g?+s.g.gain.value.toFixed(3):0,rs:s.el.readyState,fail:s.fail||null})),dead:Object.keys(MUS.dead),err:MUS.err||null}),log:MUS.log,files:MUS_FILES};

// PURPOSE: the song plays clean, nothing filters, ducks, cuts or covers it; only a few quiet game sounds are left
// FLAG: pure (?pure=0 = the old mix)
// TEST: qa/soundlab-test.js
/* ---------- PURE: owner, 22 Oct 2026: "keep the music not distorted by any power up, no perfect sound effects or anything that makes the game experience bad".
   The song goes straight from its volume to the master (no combo low-pass, no duck, no Drop cut, no SLOW low-pass, no pause-screen filter).
   Game sounds: only 'hurt' (you were hit), 'pick' (you took something) and 'boom' (an enemy died) are left, quieter; every other effect, every
   music sting and every power-up sound is silent. Menu sounds (outside a run) stay. ---------- */
if(RET.pure===undefined)RET.pure=!/[?&]pure=0/.test(location.search);
/* ---------- SND: owner, 22 Oct 2026: "the effects are distorting the music, I need to spot which ones; include them in the Lab so I can select".
   One row per sound / music effect: [id, group, plain name, default on]. Group fx = AU.sfx sounds, st = jingles on the beat (AU.sting), mu = music effects,
   pw = sounds a power-up / wave makes by itself (they never went through AU.sfx). The choice is saved in localStorage 'nr_snd' and read here, by the Lab SOUND page (soundlab.js).
   Default = the clean mix: only hurt, pick, boom on; every jingle, music effect and power-up sound off. ---------- */
const SNDT=[
  ['hurt','fx','You are hit (crunch)',1],['pick','fx','Pick-up chime',1],['boom','fx','Enemy explodes (boom)',1],
  ['shot','fx','Your gun tick',0],['hit','fx','Your shot hits an enemy (tick)',0],['graze','fx','Near-miss tick',0],['dash','fx','Dash whoosh',0],['emp','fx','EMP blast',0],
  ['big','fx','Big explosion (boss, reward)',0],['warn','fx','Danger warning beeps',0],['heat','fx','Overheat buzz',0],['up','fx','Power-up collected (4 notes)',0],
  ['tier','fx','Combo tier-up (5 notes)',0],['perfect','fx','PERFECT chime',0],['phase','fx','Boss phase change',0],
  ['s_perfect','st','PERFECT jingle on the beat',0],['s_tierup','st','Combo tier-up jingle',0],['s_fever','st','FEVER jingle',0],['s_phase','st','Boss phase jingle',0],
  ['s_boss-in','st','Boss arrives jingle',0],['s_clear','st','Stage clear jingle',0],['s_fail','st','Game over jingle',0],['s_unlock','st','Unlock jingle',0],['s_newbest','st','New best jingle',0],
  ['m_duck','mu','Music dips under explosions and hits',0],['m_duckst','mu','Music dips under big jingles',0],['m_dull','mu','Music dull until the combo builds (low-pass)',0],
  ['m_hit','mu','Music muffled for a beat when you are hit',0],['m_slow','mu','SLOW power-up muffles the song',0],['m_drop','mu','DROP power-up cuts the music for a bar',0],
  ['m_pause','mu','Music muffled on pause and menu screens',0],['m_drum','mu','Combo drum layer added to the song',0],['m_tier','mu','Combo hats, kick and bass added to the song',0],
  ['m_echo','mu','Echo on the synth soundtrack',0],
  ['heart','pw','Heartbeat when you have 1 hull left',0],['hat','pw','TEMPO power-up hi-hat',0],['drums','pw','DRUM power-up drum kit',0],['pwnote','pw','Power-up notes (echo, nova, magnet, chord, level chime)',0],
  ['pwthump','pw','Power-up thump (nova, magnet)',0],['riser','pw','DROP power-up riser',0],['dropboom','pw','DROP power-up blast',0],['reward','pw','Reward shower boom',0]];
const SNDGRP={fx:'GAME SOUNDS',st:'JINGLES ON THE BEAT',mu:'MUSIC EFFECTS',pw:'POWER-UP AND WAVE SOUNDS'};
const SNDLS={get:Storage.prototype.getItem,set:Storage.prototype.setItem};   // the Lab keeps game saves in a shadow copy while it runs: the sound choice is written to the real storage
const SND=window.SND={T:SNDT,G:SNDGRP,cfg:{on:{},vol:1,off:false},pv:{},force:null,
  load(){try{const j=JSON.parse(SNDLS.get.call(localStorage,'nr_snd')||'null');if(j&&typeof j==='object'){this.cfg.on=j.on&&typeof j.on==='object'?j.on:{};this.cfg.vol=typeof j.vol==='number'?Math.max(0,Math.min(2,j.vol)):1;this.cfg.off=!!j.off;}}catch(e){}},
  save(){try{SNDLS.set.call(localStorage,'nr_snd',JSON.stringify(this.cfg));}catch(e){}},
  def(id){const r=SNDT.find(x=>x[0]===id);return r?!!r[3]:false;},
  on(id){if(!RET.pure)return true;if(this.force===id)return true;const t=performance.now();if(this.pv[id]&&this.pv[id]>t)return true;
    if(this.cfg.off)return false;const v=this.cfg.on[id];return v===undefined?this.def(id):!!v;},
  set(id,v){this.cfg.on[id]=!!v;this.save();this.apply();},
  setOff(v){this.cfg.off=!!v;this.save();this.apply();},
  setVol(v){this.cfg.vol=Math.max(0,Math.min(2,+v||0));this.save();this.apply();},
  musicFx(){return SNDT.some(r=>r[1]==='mu'&&this.on(r[0]));},
  apply(){PURE.route();if(PURE.ok)try{PURE.ok.gain.value=PURE.GAIN*this.cfg.vol;AU.fx.gain.value=PURE.ok.gain.value;}catch(e){}}};
window.sndOn=id=>!window.SND||SND.on(id);                        // call sites outside the audio parts: if(sndOn('heart'))AU.osc(...)
SND.load();
const PURE=window.PURE={GAIN:.22,blocked:0,played:0,
  get KEEP(){const o={};for(const r of SNDT)if(r[1]==='fx'&&SND.on(r[0]))o[r[0]]=1;return o;},
  wire(){const a=AU.a;if(!a||this.done||!AU.musv||!AU.m)return;this.done=1;
    this.ok=a.createGain();this.ok.gain.value=this.GAIN*SND.cfg.vol;this.ok.connect(AU.sfxv);try{AU.fx.gain.value=this.ok.gain.value;}catch(e){}   // the game sounds that stay; AU.fx (power-up and wave sounds, now gated one by one) sits at the same level
    const cg=AU.cutg&&AU.cutg.gain;if(cg){const o=cg.setTargetAtTime.bind(cg);cg.setTargetAtTime=(v,t,k)=>o(SND.on('m_drop')?v:1,t,k);}   // the DROP cut only reaches the song when its switch is on
    this.route();},
  route(){if(!this.done||!AU.musv||!AU.m)return;const full=SND.musicFx();if(this.full===full)return;this.full=full;
    try{AU.musv.disconnect();}catch(e){}AU.musv.connect(full?(AU.lp||AU.duck):AU.m);}};   // all music effects off: song volume -> master, nothing in between (the clean mix)
if(RET.pure){
  {const i0=AU.init;AU.init=function(){const r=i0.apply(this,arguments);PURE.wire();return r;};}
  {const d0=AU.duckMusic;AU.duckMusic=function(at){return SND.on(at===undefined?'m_duck':'m_duckst')?d0.apply(this,arguments):undefined;};}
  {const s0=AU.slowColour;AU.slowColour=function(on){return s0.call(this,SND.on('m_slow')?on:false);};}
  {const OPEN=[20000,20000,20000,20000],OLD=[2500,6000,20000,20000];
   Object.defineProperty(AU,'lpHz',{get(){return SND.on('m_dull')?OLD:OPEN;},set(v){},configurable:true});}
  {const h0=AU.lyHit;AU.lyHit=function(){const r=h0.apply(this,arguments);const a=this.a;                                   // the old "a hit muffles the song for a beat"
    if(a&&this.lp&&running&&!paused&&SND.on('m_hit')){const L=this.lp.frequency,now=a.currentTime,spb=BT.spb||.5;L.cancelScheduledValues(now);L.setTargetAtTime(900,now,.01);L.setTargetAtTime(this.lpHz[this.lyStep()],now+spb,spb/4);}
    return r;};}
  {const y0=AU.lyDrum;AU.lyDrum=function(){return SND.on('m_drum')?y0.apply(this,arguments):0;};}
  {const t0=AU.tlsched;AU.tlsched=function(){return SND.on('m_tier')?t0.apply(this,arguments):undefined;};}
  {const g0=AU.sting;AU.sting=function(n){const id='s_'+(/^tierup/.test(n)?'tierup':n);if(!SND.on(id)){PURE.blocked++;return false;}return g0.apply(this,arguments);};}   // owner 22 Oct: jingles distort the music: off everywhere (menus and result screens too) unless switched on in the Lab
  {const s0=AU.sfx;AU.sfx=function(n){PURE.wire();
    if(running&&!SND.on(n)){PURE.blocked++;return;}
    const F0=this.fx;if(PURE.ok)this.fx=PURE.ok;PURE.played++;try{return s0.apply(this,arguments);}finally{this.fx=F0;}};}
  {const a0=window.NRF&&NRF.apply;if(a0)NRF.apply=function(duck,at){const w=duck;a0.call(this,duck&&SND.on('m_pause'),at);this.ducked=w;};}}

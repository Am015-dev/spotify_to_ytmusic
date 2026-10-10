// ===================== Short Fuse: sound =====================
// Recorded CC0 samples through GA (gameaudio.js + audio-data.js), with every effect also synthesized live as the fallback.
// ONE table for every event: s = sample name in GA_DATA (null = always use the synth), vol = gain for that sample, duck = dip the music.
const SND_MAP={
  click:{s:'click',vol:.45},        // UI click: kept quiet
  open:{s:'open',vol:.45},
  close:{s:'close',vol:.45},
  turn:{s:'turn',vol:.8,jitter:0},  // "your turn" chime
  select:{s:'select',vol:.7},       // a wire picked
  cut:{s:'cut',vol:1.1},
  double_cut:{s:'double_cut',vol:1},
  solo_cut:{s:'solo_cut',vol:1},
  reveal:{s:'reveal',vol:.85},
  flip:{s:'flip',vol:1.2},
  info:{s:'info',vol:1.3},          // short tap: +2 dB
  validate:{s:'validate',vol:.85},
  buzzer:{s:'buzzer',vol:.8},
  fizz:{s:'fizz',vol:.8},
  wrong:{s:'wrong',vol:1},          // buzzer + fuse fizz in one
  tick:{s:'tick',vol:.8},
  tick_last:{s:'tick_last',vol:1},
  dial:{s:'dial',vol:.9},
  boom:{s:'boom',vol:1,duck:true,jitter:0},
  phew:{s:'phew',vol:.9,duck:true},
  win:{s:'win',vol:1,duck:true,jitter:0},
  lose:{s:'lose',vol:1,duck:true,jitter:0},
  gadget:{s:'gadget',vol:.8},
  scanner:{s:'scanner',vol:.75},
  radar:{s:'radar',vol:.7},
  alarm:{s:'alarm',vol:.8,duck:true},
  sting_win:{s:'sting_win',vol:1,duck:true,jitter:0},
  sting_lose:{s:'sting_lose',vol:1,duck:true,jitter:0}
};
const SND_LOOP={clock_loop:{s:'clock_loop',vol:.5},hum:{s:'hum',vol:.35}};
const SND={ctx:null,on:true,music:true,vol:.7,last:{},nb:null,fired:{},mood:'main',loops:{},mTimer:null,beat:0};
try{SND.on=localStorage.getItem('sf_snd')!=='0';SND.music=localStorage.getItem('sf_mus')!=='0'}catch(e){}
function audioInit(){if(SND.ctx)return true;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  try{const c=SND.ctx=new AC();const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(c.destination);
    SND.master=c.createGain();SND.master.gain.value=SND.on?SND.vol:0;SND.master.connect(comp);
    SND.fxBus=c.createGain();SND.fxBus.connect(SND.master);SND.musBus=c.createGain();SND.musBus.gain.value=.22;SND.musBus.connect(SND.master);
    const len=c.sampleRate*1.5,b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;SND.nb=b;return true}catch(e){SND.ctx=null;return false}}
document.addEventListener('pointerdown',()=>{if(audioInit()&&SND.ctx.state==='suspended')SND.ctx.resume();SND.gesture=1;if(SND.music&&SND.wantMusic)musicStart()},{capture:true});
document.addEventListener('keydown',()=>{if(audioInit()&&SND.ctx.state==='suspended')SND.ctx.resume();SND.gesture=1},{capture:true});
function env(g,t,a,peak,dur){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+dur)}
function tone(f,dur,o){o=o||{};const c=SND.ctx,t=c.currentTime+(o.at||0);const osc=c.createOscillator(),g=c.createGain();osc.type=o.type||'sine';
  osc.frequency.setValueAtTime(f,t);if(o.to)osc.frequency.exponentialRampToValueAtTime(o.to,t+dur);
  let last=osc;if(o.lp){const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=o.lp;last.connect(fl);last=fl}
  last.connect(g);g.connect(o.bus||SND.fxBus);env(g,t,o.a||.008,o.v||.3,dur);osc.start(t);osc.stop(t+dur+.05)}
function noise(dur,o){o=o||{};const c=SND.ctx,t=c.currentTime+(o.at||0);const s=c.createBufferSource();s.buffer=SND.nb;s.playbackRate.value=o.rate||1;
  const fl=c.createBiquadFilter();fl.type=o.ft||'bandpass';fl.frequency.setValueAtTime(o.f||2000,t);if(o.fto)fl.frequency.exponentialRampToValueAtTime(o.fto,t+dur);fl.Q.value=o.q||1;
  const g=c.createGain();s.connect(fl);fl.connect(g);g.connect(o.bus||SND.fxBus);env(g,t,o.a||.004,o.v||.3,dur);s.start(t,Math.random());s.stop(t+dur+.05)}
// sfx(name, {at}) : the sample if GA has it decoded, else the synth
function sfx(name,o){o=o||{};if(!SND.on)return;const m=SND_MAP[name];const now=performance.now();if(now-(SND.last[name]||0)<(name==='click'?30:70))return;SND.last[name]=now;
  if(m&&m.s&&window.GA&&GA.has(m.s)){SND.fired[name]='sample';GA.play(m.s,{vol:m.vol,duck:m.duck,jitter:m.jitter,at:o.at});return}
  if(!SND.ctx||SND.ctx.state!=='running'){SND.fired[name]=SND.fired[name]||'silent';return}SND.fired[name]='synth';
  const at=o.at||0;
  try{switch(name){
  case 'click':tone(1200,.03,{type:'triangle',v:.05,at});break;
  case 'open':tone(520,.12,{type:'triangle',to:880,v:.08,at});break;
  case 'close':tone(880,.12,{type:'triangle',to:440,v:.07,at});break;
  case 'turn':[784,1175].forEach((f,k)=>tone(f,.18,{type:'triangle',v:.12,at:at+k*.09}));break;
  case 'select':noise(.04,{f:3000,q:4,v:.18,at});tone(660,.05,{type:'square',v:.05,lp:2000,at});break;
  case 'cut':noise(.07,{f:5200,q:3,v:.35,at});tone(1400,.05,{type:'triangle',to:700,v:.12,at:at+.04});break;
  case 'double_cut':for(let k=0;k<2;k++)noise(.07,{f:5200,q:3,v:.33,at:at+k*.16});[880,1320].forEach((f,k)=>tone(f,.16,{type:'triangle',v:.11,at:at+.32+k*.08}));break;
  case 'solo_cut':noise(.08,{f:5200,q:3,v:.35,at});[523,659,784,1047].forEach((f,k)=>tone(f,.12,{type:'triangle',v:.1,at:at+.1+k*.07}));break;
  case 'reveal':noise(.2,{f:1500,fto:3500,q:.8,v:.15,at});tone(990,.12,{type:'sine',v:.1,at:at+.15});break;
  case 'flip':noise(.12,{f:900,q:1,v:.25,at});break;
  case 'info':tone(1800,.04,{type:'triangle',v:.12,at});noise(.05,{f:2500,q:6,v:.2,at});break;
  case 'validate':[1047,1319,1568].forEach((f,k)=>tone(f,.2,{type:'triangle',v:.1,at:at+k*.06}));break;
  case 'buzzer':tone(110,.4,{type:'sawtooth',v:.2,lp:900,at});tone(116,.4,{type:'square',v:.08,lp:700,at});break;
  case 'fizz':noise(.5,{ft:'highpass',f:4000,v:.18,a:.02,at});break;
  case 'wrong':tone(110,.42,{type:'sawtooth',v:.2,lp:900,at});tone(117,.42,{type:'square',v:.08,lp:700,at});noise(.5,{ft:'highpass',f:4000,v:.15,a:.05,at:at+.2});break;
  case 'tick':noise(.03,{f:3500,q:8,v:.3,at});break;
  case 'tick_last':noise(.03,{f:3500,q:8,v:.3,at});tone(60,.25,{to:40,v:.5,at:at+.15});break;
  case 'dial':noise(.08,{f:600,q:2,v:.35,at});tone(180,.12,{type:'square',v:.08,lp:600,at:at+.03});break;
  case 'boom':noise(2.4,{ft:'lowpass',f:1600,fto:60,v:.9,a:.01,at});tone(90,1.4,{to:28,v:.7,at});break;
  case 'phew':noise(.9,{f:800,fto:300,q:.6,v:.18,a:.1,at});[659,523].forEach((f,k)=>tone(f,.3,{type:'triangle',v:.1,at:at+.5+k*.15}));break;
  case 'win':[392,523,659,784,659,1047].forEach((f,k)=>{tone(f,k===5?1:.22,{type:'triangle',v:.14,at:at+k*.15});tone(f/2,k===5?1:.22,{type:'sine',v:.1,at:at+k*.15})});break;
  case 'lose':[392,370,349,330].forEach((f,k)=>tone(f,k===3?1.2:.4,{type:'sawtooth',v:.1,lp:1200,at:at+k*.4}));break;
  case 'gadget':tone(300,.4,{type:'square',to:900,v:.06,lp:1800,at});tone(1500,.08,{type:'sine',v:.1,at:at+.42});break;
  case 'scanner':tone(600,1,{type:'sine',to:1500,v:.07,at});break;
  case 'radar':tone(1250,.8,{type:'sine',v:.12,a:.005,at});break;
  case 'alarm':for(let k=0;k<4;k++)tone(k%2?660:880,.24,{type:'square',v:.08,lp:2400,at:at+k*.25});break;
  case 'sting_win':[784,988,1175,1568].forEach((f,k)=>tone(f,.18,{type:'triangle',v:.12,at:at+k*.08}));break;
  case 'sting_lose':[392,370,349].forEach((f,k)=>tone(f,.35,{type:'sawtooth',v:.1,lp:1000,at:at+k*.3}));break;
  }}catch(e){}}
// loops (timer clock, lobby hum): never stack copies
function sndLoop(name,on){const L=SND_LOOP[name];if(!L)return;if(on===!!SND.loops[name])return;SND.loops[name]=on?1:0;
  if(!window.GA)return;if(on&&SND.on){if(GA.has(L.s))GA.loop(L.s,{vol:L.vol,fade:.6});else SND.loops[name]=0}else GA.stopLoop(L.s,{fade:.8})}
// music: five slots (tavern = menu, main = game, fight = last seconds / boss, victory, defeat), two songs each (a / b),
// the player's pick (a, b, shuffle, off) is saved. GA cross-fades between them; if the files fail, a quiet synth bass plays in game.
const MSLOTS=[['tavern','Menu'],['main','Game'],['fight','Last seconds'],['victory','Win'],['defeat','Lose']];
const MTITLE={'tavern-a':'Menu loop A','tavern-b':'Menu loop B','main-a':'Ninety Beats to Focus','main-b':'Clockwork Study','fight-a':'Final Wires','fight-b':'Brass on the Clock','victory-a':'Brass and Bells','victory-b':'Victory Fanfare','defeat-a':'Six Second Deflate','defeat-b':'Sad Tuba Plop'};
const MUS={pick:{tavern:'all',main:'all',fight:'all',victory:'a',defeat:'a'},res:{},sh:{},cur:null,prev:null,prevT:0,last:null,since:0};
// 'all' = shuffle through every looping song (menu, game and last-seconds tracks), a new one every ~2.5 min
const MLOOPS=['tavern','main','fight'],MALL=Object.keys(MTITLE).filter(k=>MLOOPS.includes(k.split('-')[0])),MALL_MS=150000;
try{Object.assign(MUS.pick,JSON.parse(localStorage.getItem('sf_mpick')||'{}'))}catch(e){}
SND.slot='tavern';
function musName(slot){const c=MUS.pick[slot]||'a';if(c==='off')return '-';
  if(c==='all'){if(!MUS.res[slot]){const pool=MALL.filter(k=>k!==MUS.last);MUS.res[slot]=pool[Math.floor(Math.random()*pool.length)]}return MUS.res[slot]}
  if(c==='shuffle'){if(!MUS.res[slot]){MUS.sh[slot]=MUS.sh[slot]===undefined?(Math.random()<.5?0:1):1-MUS.sh[slot];MUS.res[slot]=slot+'-'+'ab'[MUS.sh[slot]]}return MUS.res[slot]}
  return slot+'-'+(c==='b'?'b':'a')}
function musSync(){if(!window.GA||!SND.music||MUS.prev)return;
  if(MUS.pick[SND.slot]==='all'&&MUS.since&&Date.now()-MUS.since>MALL_MS&&SND.slot!=='victory'&&SND.slot!=='defeat')MUS.res[SND.slot]=null;
  const n=musName(SND.slot);if(MUS.cur===n)return;MUS.cur=n;MUS.since=Date.now();if(n!=='-')MUS.last=n;
  if(n==='-'){GA.music(null,{fade:1});return}
  const once=SND.slot==='victory'||SND.slot==='defeat';GA.music(n,{fade:once?.5:1.2,once});
  if(SND.slot==='tavern'||SND.slot==='main')setTimeout(()=>{try{const nx=SND.slot==='tavern'?'main':'fight';if(MUS.pick[nx]!=='off'&&MUS.pick[nx]!=='shuffle'&&MUS.pick[nx]!=='all')GA.preload(musName(nx))}catch(e){}},4000)}
function musicSlot(slot){if(SND.slot!==slot){SND.slot=slot;MUS.res[slot]=null;MUS.cur=null}SND.wantMusic=1;musSync()}
function musicStart(){SND.wantMusic=1;musicSlot(SND.mood==='tension'||(typeof UI!=='undefined'&&UI.camp&&UI.camp.boss)?'fight':'main');if(!SND.music||!SND.ctx||SND.mTimer)return;SND.nextT=SND.ctx.currentTime+.1;SND.mTimer=setInterval(musicTick,250)}
function musicStop(f){SND.wantMusic=0;MUS.cur=null;if(window.GA)GA.music(null,{fade:f!=null?f:1});clearInterval(SND.mTimer);SND.mTimer=null}
function musicMood(m){if(m===SND.mood)return;SND.mood=m;if(SND.slot==='main'||SND.slot==='fight')musicSlot(m==='tension'||(typeof UI!=='undefined'&&UI.camp&&UI.camp.boss)?'fight':'main')}
function musicPick(slot,c){MUS.pick[slot]=c;MUS.res[slot]=null;try{localStorage.setItem('sf_mpick',JSON.stringify(MUS.pick))}catch(e){}
  if(window.GA&&c!=='off'&&c!=='shuffle'&&c!=='all')try{GA.preload(musName(slot))}catch(e){}if(SND.slot===slot&&!MUS.prev){MUS.cur=null;musSync()}}
function musicPreview(slot){if(!window.GA||!SND.music||SND.slot===slot)return;const n=musName(slot);if(n==='-')return;
  clearTimeout(MUS.prevT);MUS.prev=slot;MUS.cur=null;GA.music(n,{fade:.5,once:true});MUS.prevT=setTimeout(()=>{MUS.prev=null;MUS.cur=null;musSync();if(typeof renderMusic==='function')renderMusic()},8000)}
function musicPreviewStop(){if(!MUS.prev)return;clearTimeout(MUS.prevT);MUS.prev=null;MUS.cur=null;musSync()}
const BASS=[55,55,65.4,55,73.4,65.4,55,49];
function gaMusicOk(){if(!window.GA)return false;const s=GA.state();return !!(s&&s.audio&&s.failed.indexOf(MUS.cur)<0)}
function musicTick(){const c=SND.ctx;if(!c||c.state!=='running'||!SND.music)return;if(SND.slot!=='main'&&SND.slot!=='fight'||MUS.cur==='-'||gaMusicOk()){SND.nextT=c.currentTime+.1;return}
  const step=SND.mood==='tension'?.165:.2;while(SND.nextT<c.currentTime+.6){const at=SND.nextT-c.currentTime,k=SND.beat;
    if(k%2===0)tone(BASS[(k>>1)%8],step*1.6,{type:'triangle',v:.12,lp:500,at,bus:SND.musBus});
    if(k%4===2)noise(.04,{f:6000,q:2,v:.05,at,bus:SND.musBus});
    if(k%16===12)tone(BASS[(k>>4)%8]*8,.25,{type:'square',v:.025,lp:1800,at,bus:SND.musBus});
    SND.nextT+=step;SND.beat++}}
function toggleSound(){SND.on=!SND.on;try{localStorage.setItem('sf_snd',SND.on?'1':'0')}catch(e){}audioInit();if(window.GA)GA.setSfx(SND.on);if(SND.master)SND.master.gain.value=SND.on?SND.vol:0;
  if(!SND.on)for(const k in SND.loops)if(SND.loops[k]){SND.loops[k]=0;if(window.GA)GA.stopLoop(SND_LOOP[k].s,{fade:.2})}if(SND.on)sfx('click')}
function toggleMusic(){SND.music=!SND.music;try{localStorage.setItem('sf_mus',SND.music?'1':'0')}catch(e){}if(window.GA)GA.setMusic(SND.music);if(SND.music){audioInit();MUS.cur=null;if(SND.wantMusic!==0)musSync()}else{const w=SND.wantMusic;musicStop(.6);SND.wantMusic=w}}
// GA shares the synth's AudioContext (created on the first gesture only), so nothing plays before the player touches the page.
if(window.GA&&typeof GA_DATA!=='undefined'){GA.init({sfx:GA_DATA.sfx,music:GA_DATA.music,key:'sf',sfxVol:.8,musVol:.45,duck:['boom','phew','win','lose','alarm','sting_win','sting_lose'],ctx:()=>{audioInit();return SND.ctx}});GA.setSfx(SND.on);GA.setMusic(SND.music)}

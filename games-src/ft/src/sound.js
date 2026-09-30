// ---------- sound: recorded samples (audio/gameaudio.js + audio-data.js) with the synthesized sounds below as the fallback ----------
// One line per event: s = sample name in GA_DATA (null = use the synth), vol = gain (1 = as normalised), duck = dip the music under it.
// Swapping or muting a sound later is a one-line change here.
const SND_MAP={
  // levels measured on the decoded samples (loudest 100 ms): events land near -16 dB, UI clicks near -33 dB
  click:{s:'click',vol:.5},       // UI button: kept quiet
  pick:{s:'pick',vol:.9},
  drop:{s:'drop',vol:.9},         // plays on every pawn dropped, so not boosted
  take:{s:'take',vol:.6},
  camel:{s:'camel',vol:.8},
  coins:{s:'coins',vol:1.2},      // soft coin rattle, +1.6 dB
  kill:{s:'kill',vol:.8},
  djinn:{s:'djinn',vol:.8,duck:true},
  build:{s:'build',vol:.8},
  bid:{s:'bid',vol:1.4},          // short chip click, +2.9 dB
  round:{s:'round',vol:.6,duck:true},
  win:{s:'win',vol:.85},          // ducks the music by itself (GA default list)
  bad:{s:'bad',vol:.55}
};
const SND={ctx:null,on:true,music:true,pitch:1,vol:.7,last:{},nb:null,beat:0,mTimer:null};
try{SND.on=localStorage.getItem('soq_snd')!=='0';SND.music=localStorage.getItem('soq_mus')!=='0'}catch(e){}
function audioInit(){if(SND.ctx)return true;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  try{const c=SND.ctx=new AC();const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(c.destination);
    SND.master=c.createGain();SND.master.gain.value=SND.on?SND.vol:0;SND.master.connect(comp);
    SND.fxBus=c.createGain();SND.fxBus.connect(SND.master);SND.musBus=c.createGain();SND.musBus.gain.value=.3;SND.musBus.connect(SND.master);
    const len=c.sampleRate*1.5,b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;SND.nb=b;
    if(SND.music)musicStart();return true}catch(e){SND.ctx=null;return false}}
document.addEventListener('pointerdown',()=>{if(audioInit()&&SND.ctx.state==='suspended')SND.ctx.resume()},{capture:true});
document.addEventListener('keydown',()=>{if(audioInit()&&SND.ctx.state==='suspended')SND.ctx.resume()},{capture:true});
// samples share the synth's AudioContext (created on the first gesture); GA stays silent without Web Audio (jsdom) and never throws
const HAS_GA=typeof GA!=='undefined'&&typeof GA_DATA!=='undefined';
if(HAS_GA){GA.init({sfx:GA_DATA.sfx,music:GA_DATA.music,key:'soq',ctx:()=>{audioInit();return SND.ctx}});GA.setSfx(SND.on);GA.setMusic(SND.music)}
// the recorded music takes over unless Web Audio is missing or its track failed to decode
function gaMusicOk(){if(!HAS_GA)return false;const st=GA.state();return !!GA.playing()||(st.audio&&(st.failed||[]).indexOf('main')<0)}
function env(g,t,a,peak,dur){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+dur)}
function tone(f,dur,o){o=o||{};const c=SND.ctx,t=c.currentTime+(o.at||0);const osc=c.createOscillator(),g=c.createGain();osc.type=o.type||'sine';
  osc.frequency.setValueAtTime(f,t);if(o.to)osc.frequency.exponentialRampToValueAtTime(o.to,t+dur);if(o.det)osc.detune.value=o.det;
  let last=osc;if(o.lp){const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=o.lp;last.connect(fl);last=fl}
  if(o.vib){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=o.vib;lg.gain.value=o.vibAmt||f*.06;l.connect(lg);lg.connect(osc.frequency);l.start(t);l.stop(t+dur+.05)}
  last.connect(g);g.connect(o.bus||SND.fxBus);env(g,t,o.a||.008,o.v||.3,dur);osc.start(t);osc.stop(t+dur+.05)}
function noise(dur,o){o=o||{};const c=SND.ctx,t=c.currentTime+(o.at||0);const s=c.createBufferSource();s.buffer=SND.nb;s.playbackRate.value=o.rate||1;
  const fl=c.createBiquadFilter();fl.type=o.ft||'bandpass';fl.frequency.setValueAtTime(o.f||2000,t);if(o.fto)fl.frequency.exponentialRampToValueAtTime(o.fto,t+dur);fl.Q.value=o.q||1;
  const g=c.createGain();s.connect(fl);fl.connect(g);g.connect(o.bus||SND.fxBus);env(g,t,o.a||.004,o.v||.3,dur);s.start(t,Math.random());s.stop(t+dur+.05)}
const thump=(at,v)=>{tone(120,.35,{to:38,v:v||.7,at});noise(.18,{ft:'lowpass',f:500,v:(v||.7)*.5,at})};
function sfx(name){if(!SND.on)return;const m=SND_MAP[name];
  if(HAS_GA&&m&&m.s&&GA.has(m.s)){if(typeof window!=='undefined'&&window.__sfxLog)window.__sfxLog.push(name+':sample');GA.play(m.s,{vol:m.vol,duck:m.duck,cooldown:name==='drop'?40:80});return}
  if(!SND.ctx||SND.ctx.state!=='running')return;if(typeof window!=='undefined'&&window.__sfxLog)window.__sfxLog.push(name+':synth');const now=performance.now();if(now-(SND.last[name]||0)<(name==='drop'?40:80))return;SND.last[name]=now;
  try{switch(name){
  case 'click':tone(1100,.03,{type:'triangle',v:.05});break;
  case 'pick':noise(.08,{f:1800,q:3,v:.18});tone(420,.08,{type:'triangle',v:.1,to:620});break;
  case 'drop':tone(660+Math.random()*120,.07,{type:'triangle',v:.12});noise(.03,{f:3000,q:4,v:.1});break;
  case 'take':[523,659,784].forEach((f,k)=>tone(f,.18,{type:'triangle',v:.1,at:k*.06}));break;
  case 'camel':tone(180,.25,{type:'sawtooth',to:120,v:.12,lp:900});thump(.05,.4);break;
  case 'coins':for(let k=0;k<6;k++)tone(1800+Math.random()*900,.06,{type:'square',v:.04,lp:5000,at:k*.05});break;
  case 'kill':noise(.25,{f:4000,fto:800,q:2,v:.25});tone(200,.2,{type:'sawtooth',to:90,v:.12,lp:800});break;
  case 'djinn':tone(440,1.1,{type:'sine',v:.12,vib:6,vibAmt:30});tone(660,1.1,{type:'sine',v:.08,at:.1,vib:5,vibAmt:25});noise(.9,{f:6000,fto:2000,q:1,v:.06,a:.3});break;
  case 'build':thump(0,.5);noise(.05,{f:2600,q:6,v:.2,at:.1});break;
  case 'bid':tone(880,.1,{type:'triangle',v:.1});tone(1320,.14,{type:'triangle',v:.08,at:.08});break;
  case 'round':[392,523,659].forEach((f,k)=>tone(f,.4,{type:'sine',v:.1,at:k*.12}));break;
  case 'win':[523,659,784,1047,784,1047].forEach((f,k)=>tone(f,k===5?.9:.2,{type:'triangle',v:.13,at:k*.15}));break;
  case 'bad':tone(330,.25,{type:'sawtooth',to:220,v:.14,lp:1400});break;
  }}catch(e){}}
// ambience: an oud-like drone and soft hand-drum pattern
const OUD=[146.8,164.8,174.6,196,220,233.1,261.6];
function musicStart(){if(HAS_GA)GA.music('main',{fade:2});if(!SND.ctx||SND.mTimer)return;SND.nextT=SND.ctx.currentTime+.1;SND.mTimer=setInterval(musicTick,200)}
function musicStop(){if(HAS_GA)GA.music(null);clearInterval(SND.mTimer);SND.mTimer=null}
function musicTick(){const c=SND.ctx;if(!c||c.state!=='running')return;if(gaMusicOk()){SND.nextT=c.currentTime+.1;return}const st=.36;
  while(SND.nextT<c.currentTime+.5){const at=SND.nextT-c.currentTime,k=SND.beat%16;
    if(k===0)tone(73.4,st*15,{type:'sine',v:.08,a:.5,at,bus:SND.musBus});
    if([0,3,6,10,12].includes(k))tone(110,.12,{to:70,v:.3,at,bus:SND.musBus});if([8,14].includes(k))noise(.08,{f:900,q:1,v:.18,at,bus:SND.musBus});
    if(k%4===2&&Math.random()<.7){const f=OUD[Math.floor(Math.random()*OUD.length)];tone(f*2,.5,{type:'triangle',v:.05,at,bus:SND.musBus,a:.01})}
    SND.nextT+=st;SND.beat++}}
function toggleSound(){SND.on=!SND.on;try{localStorage.setItem('soq_snd',SND.on?'1':'0')}catch(e){}audioInit();if(HAS_GA)GA.setSfx(SND.on);if(SND.master)SND.master.gain.value=SND.on?SND.vol:0;if(SND.on)sfx('click');soundBtns()}
function toggleMusic(){SND.music=!SND.music;try{localStorage.setItem('soq_mus',SND.music?'1':'0')}catch(e){}if(HAS_GA)GA.setMusic(SND.music);if(SND.music){audioInit();musicStart()}else musicStop();soundBtns()}
function soundBtns(){const a=document.getElementById('sndbtn'),b=document.getElementById('musbtn');if(a)a.textContent=SND.on?'🔊':'🔇';if(b)b.textContent=SND.music?'🎶':'🎶̸'}

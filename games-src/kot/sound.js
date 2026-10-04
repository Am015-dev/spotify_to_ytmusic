// ---------- sound: recorded CC0 samples (gameaudio.js + audio-data.js), with every synthesized sound kept as the fallback ----------
// SND_MAP: one row per game event. s = sample name in GA_DATA (null = use the synth below), vol = gain (1 = as mastered),
// p = follow the monster's pitch (SND.pitch; 1 = fully, .5 = half), duck = lower the music under it (the big hits duck by default),
// then = a second event 250 ms later. Sound is local to each player's page: nothing about audio is ever sent over the network.
// To swap or mute one sound, change its row: {s:null} brings back the synth, {s:'x',vol:0} silences it.
const SND_MAP={
  dice:{s:'dice',vol:1.4},        // dice roll on the tray (short tap, +3 dB)
  clack:{s:'clack',vol:1.3},      // one die lands (short tap, +2 dB; fires once per die, 90 ms apart at most)
  smash:{s:'smash',vol:1},
  hurt:{s:'hurt',vol:.9,p:.5},
  roar:{s:'roar',vol:.85,p:1},
  heal:{s:'heal',vol:.7},
  star:{s:'star',vol:.65},
  energy:{s:'energy',vol:.5},
  whoosh:{s:'whoosh',vol:.8},
  stomp:{s:'stomp',vol:1,then:'roar'},  // entering the city: impact, then the monster's roar (as the synth did)
  ko:{s:'ko',vol:.85},
  brainjack:{s:'mindbug',vol:.7,duck:true},
  evolve:{s:'evolve',vol:.7,duck:true},
  buy:{s:'buy',vol:.85},
  turn:{s:'turn',vol:.5},         // every turn: kept soft so it does not nag
  win:{s:'win',vol:.8},
  click:{s:'click',vol:.45}       // UI clicks stay quiet
};
const SND_LOG=[];                 // last events and how they played ('sample' or 'synth'), for tests
const SND={ctx:null,on:true,music:true,pitch:1,vol:.7,last:{},nb:null,beat:0,mTimer:null};
try{SND.on=localStorage.getItem('ccs_snd')!=='0';SND.music=localStorage.getItem('ccs_mus')!=='0'}catch(e){}
function audioInit(){if(SND.ctx)return true;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  try{const c=SND.ctx=new AC();const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(c.destination);
    SND.master=c.createGain();SND.master.gain.value=SND.on?SND.vol:0;SND.master.connect(comp);
    SND.fxBus=c.createGain();SND.fxBus.connect(SND.master);SND.musBus=c.createGain();SND.musBus.gain.value=.3;SND.musBus.connect(SND.master);
    const len=c.sampleRate*1.5,b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;SND.nb=b;
    if(SND.music)musicStart();return true}catch(e){SND.ctx=null;return false}}
// GA shares this page's AudioContext and decodes the samples on the first user gesture; until then GA.has() is false and the synth plays
const GAOK=typeof GA!=='undefined'&&typeof GA_DATA!=='undefined';
if(GAOK){GA.init({sfx:GA_DATA.sfx,music:GA_DATA.music,key:'ccs',ctx:()=>audioInit()?SND.ctx:null});gaSync()}
function gaSync(){if(!GAOK)return;GA.setSfx(SND.on);GA.setMusic(SND.on&&SND.music)}
document.addEventListener('pointerdown',()=>{if(audioInit()&&SND.ctx.state==='suspended')SND.ctx.resume()},{capture:true});
document.addEventListener('keydown',()=>{if(audioInit()&&SND.ctx.state==='suspended')SND.ctx.resume()},{capture:true});
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
function sfx(name){if(!SND.on||!SND.ctx||SND.ctx.state!=='running')return;const now=performance.now();if(now-(SND.last[name]||0)<(name==='click'?30:90))return;SND.last[name]=now;
  const m=SND_MAP[name];
  if(GAOK&&m&&m.s&&GA.has(m.s)){const k=m.p?1+((SND.pitch||1)-1)*m.p:1;GA.play(m.s,{vol:m.vol==null?1:m.vol,rate:k,duck:m.duck,cooldown:name==='click'?25:60});sndLog(name,'sample');
    if(m.then){const n=m.then;setTimeout(()=>{SND.last[n]=0;sfx(n)},m.thenAt||250)}return}
  sndLog(name,'synth');
  try{switch(name){
  case 'dice':for(let k=0;k<9;k++){const at=k*.045+Math.random()*.03;noise(.04,{f:2500+Math.random()*2500,q:6,v:.22,at});tone(500+Math.random()*400,.03,{type:'triangle',v:.08,at})}
    for(let k=0;k<5;k++)noise(.05,{f:1800+Math.random()*1200,q:4,v:.16,at:.45+k*.07+Math.random()*.03});break;
  case 'clack':noise(.05,{f:2200,q:5,v:.2});tone(700,.04,{type:'triangle',v:.1});break;
  case 'smash':thump(0,.9);noise(.45,{ft:'lowpass',f:1400,fto:200,v:.45});tone(90,.5,{type:'sawtooth',to:45,v:.18,lp:600});break;
  case 'hurt':tone(260,.32,{type:'sawtooth',to:110,v:.22,lp:1200,vib:30,vibAmt:25});noise(.15,{f:900,q:1.5,v:.18});break;
  case 'roar':{const k=SND.pitch||1;tone(170*k,.9,{type:'sawtooth',to:70*k,v:.65,lp:1100,vib:24,vibAmt:22*k,a:.03});tone(172*k,.9,{type:'square',to:68*k,v:.22,lp:800,a:.03});tone(85*k,.9,{type:'sawtooth',to:40*k,v:.45,lp:400,a:.04});noise(.8,{f:700*k,fto:250,q:.7,v:.45,a:.03});break}
  case 'heal':[523,659,784,1047].forEach((f,k)=>tone(f,.28,{type:'sine',v:.16,at:k*.07}));break;
  case 'star':tone(988,.09,{type:'square',v:.1,lp:4000});tone(1319,.3,{type:'square',v:.1,lp:4000,at:.08});break;
  case 'energy':tone(220,.18,{type:'sawtooth',to:1600,v:.12,lp:3000});tone(880,.12,{type:'sine',to:1760,v:.1,at:.08});break;
  case 'whoosh':noise(.5,{f:3000,fto:250,q:1.2,v:.3,a:.08});break;
  case 'stomp':thump(0,.9);thump(.22,.7);SND.last.roar=0;setTimeout(()=>sfx('roar'),250);[392,523,659].forEach((f,k)=>tone(f,.35,{type:'sawtooth',v:.1,lp:1800,at:.3+k*.09}));break;
  case 'ko':tone(420,1.1,{type:'sawtooth',to:55,v:.25,lp:1400,vib:7,vibAmt:30});thump(.9,.9);noise(.7,{ft:'lowpass',f:900,fto:150,v:.35,at:.85});break;
  case 'brainjack':tone(600,.9,{type:'sine',v:.18,vib:9,vibAmt:120});tone(905,.9,{type:'triangle',v:.08,vib:6,vibAmt:90,det:12});tone(300,.9,{type:'sine',to:200,v:.1});break;
  case 'evolve':tone(300,.6,{type:'triangle',to:1500,v:.14});[1319,1568,1976,2637].forEach((f,k)=>tone(f,.18,{type:'sine',v:.08,at:.35+k*.06}));break;
  case 'buy':noise(.03,{f:5000,q:3,v:.15});tone(1568,.12,{type:'triangle',v:.14,at:.03});tone(2093,.35,{type:'triangle',v:.14,at:.12});break;
  case 'turn':tone(784,.5,{type:'sine',v:.16});tone(1175,.7,{type:'sine',v:.12,at:.12});break;
  case 'win':[523,659,784,1047,784,1047].forEach((f,k)=>{tone(f,k===5?.9:.2,{type:'square',v:.1,lp:3000,at:k*.15});tone(f/2,k===5?.9:.2,{type:'triangle',v:.12,at:k*.15})});thump(0,.8);thump(.6,.8);break;
  case 'click':tone(1200,.03,{type:'triangle',v:.05});break;
  }}catch(e){}}
function sndLog(n,how){SND_LOG.push(n+':'+how);if(SND_LOG.length>80)SND_LOG.shift()}
// background music: "Funked Up" by Joth (GA_DATA.music.main); the synthesized groove below plays only until it is decoded, or if it fails
function musicStart(){if(GAOK&&SND.on)GA.music('main',{vol:.6});if(!SND.ctx||SND.mTimer)return;SND.nextT=SND.ctx.currentTime+.1;SND.mTimer=setInterval(musicTick,120)}
function musicStop(){if(GAOK)GA.music(null);clearInterval(SND.mTimer);SND.mTimer=null}
const BASS=[55,55,65.4,55,73.4,73.4,65.4,49,55,55,65.4,55,82.4,73.4,65.4,61.7];
function musicTick(){const c=SND.ctx;if(!c||c.state!=='running')return;if(GAOK&&GA.playing()){SND.nextT=c.currentTime+.1;return}const step=60/112/2;
  while(SND.nextT<c.currentTime+.3){const k=SND.beat%16,at=SND.nextT-c.currentTime;
    tone(BASS[k],step*.9,{type:'sawtooth',v:.35,lp:420,at,bus:SND.musBus});
    if(k%4===0){tone(110,.2,{to:40,v:.6,at,bus:SND.musBus})}
    if(k%4===2)noise(.12,{f:1800,q:.8,v:.25,at,bus:SND.musBus});
    noise(.03,{f:8000,q:1,v:k%2?.08:.14,at,bus:SND.musBus});
    if(k===0&&SND.beat%64===0)[220,261.6,329.6].forEach(f=>tone(f,step*14,{type:'triangle',v:.05,at,bus:SND.musBus,a:.4}));
    SND.nextT+=step;SND.beat++}}
function toggleSound(){SND.on=!SND.on;try{localStorage.setItem('ccs_snd',SND.on?'1':'0')}catch(e){}audioInit();if(SND.master)SND.master.gain.value=SND.on?SND.vol:0;gaSync();if(SND.on&&SND.music)musicStart();if(SND.on)sfx('click');soundBtns()}
function toggleMusic(){SND.music=!SND.music;try{localStorage.setItem('ccs_mus',SND.music?'1':'0')}catch(e){}gaSync();if(SND.music){audioInit();musicStart()}else musicStop();soundBtns()}
function soundBtns(){const a=document.getElementById('sndbtn'),b=document.getElementById('musbtn');if(a)a.textContent=SND.on?'🔊':'🔇';if(b)b.textContent=SND.music?'🎵 On':'🎵 Off'}

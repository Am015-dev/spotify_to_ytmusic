// ---------- sound: recorded samples (audio/gameaudio.js + audio-data.js) with the synthesized sounds below as the fallback ----------
// One line per event: s = sample name in GA_DATA (null = use the synth), vol = gain (1 = as normalised), duck = dip the music under it.
// Swapping or muting a sound later is a one-line change here.
const SND_MAP={
  // levels measured on the decoded samples (loudest 100 ms): events land near -16 dB, UI clicks near -33 dB
  click:{s:'click',vol:.5},       // UI button: kept quiet
  select:{s:'select',vol:.9},     // pick a glaze
  take:{s:'take',vol:1},
  place:{s:'place',vol:1},
  wall:{s:'wall',vol:.75},        // pitch rises with the points scored (rate 1 + 0.06 per point, up to 8)
  floor:{s:'floor',vol:.75},
  sun:{s:'sun',vol:.6},
  round:{s:'round',vol:.6,duck:true},
  refill:{s:'refill',vol:.65},
  win:{s:'win',vol:.85},          // ducks the music by itself (GA default list)
  bad:{s:'bad',vol:.55}
};
const SND={ctx:null,on:true,music:true,pitch:1,vol:.7,last:{},nb:null,beat:0,mTimer:null};
try{SND.on=localStorage.getItem('sgz_snd')!=='0';SND.music=localStorage.getItem('sgz_mus')!=='0'}catch(e){}
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
if(HAS_GA){GA.init({sfx:GA_DATA.sfx,music:GA_DATA.music,key:'sgz',ctx:()=>{audioInit();return SND.ctx}});GA.setSfx(SND.on);GA.setMusic(SND.music)}
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
const clink=(f,at,v)=>{tone(f,.12,{type:'sine',v:v||.12,at});tone(f*2.76,.08,{type:'sine',v:(v||.12)*.5,at});noise(.03,{f:5000,q:5,v:.06,at})};
function sfx(name,arg){if(!SND.on)return;const m=SND_MAP[name];
  if(HAS_GA&&m&&m.s&&GA.has(m.s)){if(typeof window!=='undefined'&&window.__sfxLog)window.__sfxLog.push(name+':sample');
    GA.play(m.s,{vol:m.vol,duck:m.duck,cooldown:60,rate:name==='wall'?1+.06*(Math.min(8,arg||1)-1):1});return}
  if(!SND.ctx||SND.ctx.state!=='running')return;if(typeof window!=='undefined'&&window.__sfxLog)window.__sfxLog.push(name+':synth');const now=performance.now();if(now-(SND.last[name]||0)<60)return;SND.last[name]=now;
  try{switch(name){
  case 'click':tone(1200,.03,{type:'triangle',v:.05});break;
  case 'select':clink(1760,0,.09);clink(2217,.05,.07);break;
  case 'take':for(let k=0;k<3;k++)clink(1400+Math.random()*600,k*.05,.1);break;
  case 'place':tone(300,.08,{type:'triangle',v:.12,to:180});noise(.05,{f:2400,q:3,v:.12});break;
  case 'wall':{const n=Math.min(8,arg||1);[523,587,659,784,880,988,1047,1175].slice(0,n).forEach((f,k)=>clink(f,k*.06,.09));break}
  case 'floor':noise(.22,{f:3200,fto:900,q:1.5,v:.22});tone(180,.18,{type:'sawtooth',to:90,v:.07,lp:900});break;
  case 'sun':[659,880,1319].forEach((f,k)=>tone(f,.35,{type:'sine',v:.08,at:k*.07}));break;
  case 'round':[392,494,587,784].forEach((f,k)=>tone(f,.5,{type:'triangle',v:.08,at:k*.11}));break;
  case 'refill':noise(.5,{f:900,fto:300,q:.8,v:.12});break;
  case 'win':[523,659,784,1047,784,1047].forEach((f,k)=>tone(f,k===5?.9:.2,{type:'triangle',v:.13,at:k*.15}));break;
  case 'bad':tone(330,.25,{type:'sawtooth',to:220,v:.12,lp:1400});break;
  }}catch(e){}}
// music: a slow plucked courtyard guitar in a Phrygian mode over a soft drone, with a light frame drum
const GUIT=[220,233.1,277.2,293.7,329.6,349.2,392,440];
function musicStart(){if(HAS_GA)GA.music('main',{fade:2});if(!SND.ctx||SND.mTimer)return;SND.nextT=SND.ctx.currentTime+.1;SND.mTimer=setInterval(musicTick,200)}
function musicStop(){if(HAS_GA)GA.music(null);clearInterval(SND.mTimer);SND.mTimer=null}
function musicTick(){const c=SND.ctx;if(!c||c.state!=='running')return;if(gaMusicOk()){SND.nextT=c.currentTime+.1;return}const st=.3;
  while(SND.nextT<c.currentTime+.5){const at=SND.nextT-c.currentTime,k=SND.beat%24;
    if(k===0)tone(110,st*23,{type:'sine',v:.07,a:.6,at,bus:SND.musBus});if(k===12)tone(116.5,st*11,{type:'sine',v:.05,a:.6,at,bus:SND.musBus});
    if([0,6,9,12,18].includes(k))tone(90,.14,{to:60,v:.18,at,bus:SND.musBus});
    if(k%3===1||Math.random()<.2){const f=GUIT[Math.floor(Math.random()*GUIT.length)];tone(f*(Math.random()<.3?2:1),.9,{type:'triangle',v:.045,at,bus:SND.musBus,a:.004,lp:2400})}
    SND.nextT+=st;SND.beat++}}
function toggleSound(){SND.on=!SND.on;try{localStorage.setItem('sgz_snd',SND.on?'1':'0')}catch(e){}audioInit();if(HAS_GA)GA.setSfx(SND.on);if(SND.master)SND.master.gain.value=SND.on?SND.vol:0;if(SND.on)sfx('click');soundBtns()}
function toggleMusic(){SND.music=!SND.music;try{localStorage.setItem('sgz_mus',SND.music?'1':'0')}catch(e){}if(HAS_GA)GA.setMusic(SND.music);if(SND.music){audioInit();musicStart()}else musicStop();soundBtns()}
function soundBtns(){const a=document.getElementById('sndbtn'),b=document.getElementById('musbtn');if(a)a.innerHTML=IC(SND.on?'snd':'mute');if(b){b.innerHTML=IC(SND.music?'music':'nomusic')}}

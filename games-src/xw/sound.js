// ---------- sound: recorded samples (gameaudio.js + audio-data.js, see ASSETS.md) with the synthesized Web Audio sounds below as the fallback ----------
// One line per event: s = sample name in GA_DATA (null = use the synth), vol = sample gain (1 = as normalised; 1.4 is about +3 dB).
// To swap or mute one sound later, change only its line here.
const SND_MAP={
  laser:{s:'laser',vol:.7},   ion:{s:'ion',vol:.75},     torp:{s:'torp',vol:.85},
  engine:{s:'engine',vol:.7}, roll:{s:'roll',vol:.75},   shield:{s:'shield',vol:.7},
  hull:{s:'hull',vol:.85},    crit:{s:'crit',vol:.9},    boom:{s:'boom',vol:1},
  miss:{s:'miss',vol:.8},     dice:{s:'dice',vol:1.5},   token:{s:'token',vol:1.4},
  lock:{s:'lock',vol:.6},     stress:{s:'stress',vol:.6},rock:{s:'rock',vol:.85},
  turn:{s:'turn',vol:.6},     win:{s:'win',vol:.9},      click:{s:'click',vol:.5},
  engine_loop:{s:'engine_loop',vol:.3}   // quiet hum while ships fly a maneuver (no synth version)
};
const MUSIC_MAP={main:'main'};           // null = the synthesized groove
const SND={ctx:null,on:true,music:true,vol:.7,last:{},nb:null,beat:0,mTimer:null};
try{SND.on=localStorage.getItem('na_snd')!=='0';SND.music=localStorage.getItem('na_mus')!=='0'}catch(e){}
// GA decodes the samples on the first user gesture; until then (or with no Web Audio, as in jsdom) GA.has() is false and the synth plays
const GAOK=typeof GA!=='undefined'&&typeof GA_DATA!=='undefined';
if(GAOK){GA.init({sfx:GA_DATA.sfx,music:GA_DATA.music,key:'na',musVol:.45});GA.setSfx(SND.on);GA.setMusic(SND.music)}
function gaMusic(){return GAOK&&MUSIC_MAP.main&&GA.names().indexOf(MUSIC_MAP.main)>=0&&(GA.state().failed||[]).indexOf(MUSIC_MAP.main)<0}
function sndEngine(on){if(!GAOK)return;const m=SND_MAP.engine_loop;if(on&&SND.on&&m&&m.s&&GA.has(m.s))GA.loop(m.s,{vol:m.vol,fade:.35});else GA.stopLoop((m&&m.s)||'engine_loop',{fade:.7})}
function audioInit(){if(SND.ctx)return true;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  try{const c=SND.ctx=new AC();const comp=c.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=4;comp.connect(c.destination);
    SND.master=c.createGain();SND.master.gain.value=SND.on?SND.vol:0;SND.master.connect(comp);
    SND.fxBus=c.createGain();SND.fxBus.connect(SND.master);SND.musBus=c.createGain();SND.musBus.gain.value=.22;SND.musBus.connect(SND.master);
    const len=c.sampleRate*1.5,b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;SND.nb=b;
    // a long synthetic reverb for the music bed
    const ir=c.createBuffer(2,c.sampleRate*2.5,c.sampleRate);for(let ch=0;ch<2;ch++){const x=ir.getChannelData(ch);for(let i=0;i<x.length;i++)x[i]=(Math.random()*2-1)*Math.pow(1-i/x.length,3)}
    SND.rev=c.createConvolver();SND.rev.buffer=ir;SND.rev.connect(SND.musBus);
    if(SND.music)musicStart();return true}catch(e){SND.ctx=null;return false}}
for(const ev of ['pointerdown','keydown'])document.addEventListener(ev,()=>{if(audioInit()&&SND.ctx.state==='suspended')SND.ctx.resume()},{capture:true});
function env(g,t,a,peak,dur){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+dur)}
function tone(f,dur,o){o=o||{};const c=SND.ctx,t=c.currentTime+(o.at||0);const osc=c.createOscillator(),g=c.createGain();osc.type=o.type||'sine';
  osc.frequency.setValueAtTime(f,t);if(o.to)osc.frequency.exponentialRampToValueAtTime(o.to,t+dur);if(o.det)osc.detune.value=o.det;
  let last=osc;if(o.lp){const fl=c.createBiquadFilter();fl.type='lowpass';fl.frequency.value=o.lp;last.connect(fl);last=fl}
  last.connect(g);g.connect(o.bus||SND.fxBus);env(g,t,o.a||.008,o.v||.3,dur);osc.start(t);osc.stop(t+dur+.05)}
function noise(dur,o){o=o||{};const c=SND.ctx,t=c.currentTime+(o.at||0);const s=c.createBufferSource();s.buffer=SND.nb;s.playbackRate.value=o.rate||1;
  const fl=c.createBiquadFilter();fl.type=o.ft||'bandpass';fl.frequency.setValueAtTime(o.f||2000,t);if(o.fto)fl.frequency.exponentialRampToValueAtTime(o.fto,t+dur);fl.Q.value=o.q||1;
  const g=c.createGain();s.connect(fl);fl.connect(g);g.connect(o.bus||SND.fxBus);env(g,t,o.a||.004,o.v||.3,dur);s.start(t,Math.random());s.stop(t+dur+.05)}
function sfx(name,k){if(!SND.on)return;
  const m=SND_MAP[name];if(GAOK&&m&&m.s&&GA.has(m.s)){GA.play(m.s,{vol:m.vol,rate:k&&k!==1?k:1,cooldown:name==='click'?30:70,duck:m.duck});return}
  if(!SND.ctx||SND.ctx.state!=='running')return;const now=performance.now();if(now-(SND.last[name]||0)<(name==='click'?30:70))return;SND.last[name]=now;k=k||1;
  try{switch(name){
  case 'laser':for(let i=0;i<2;i++)tone(1400*k,.16,{type:'sawtooth',to:180*k,v:.22,lp:5000,at:i*.09});break;
  case 'ion':tone(300,.5,{type:'square',to:900,v:.14,lp:2500});noise(.4,{f:3000,q:4,v:.12});break;
  case 'torp':tone(120,.9,{type:'sawtooth',to:60,v:.2,lp:700});noise(.9,{f:800,fto:3000,q:1,v:.2,a:.1});break;
  case 'engine':noise(.7,{ft:'lowpass',f:400,fto:1400,v:.28,a:.12});tone(70,.7,{type:'sawtooth',to:110,v:.12,lp:300,a:.1});break;
  case 'roll':noise(.35,{f:2500,fto:500,q:1.4,v:.25,a:.05});break;
  case 'shield':tone(900,.35,{type:'sine',to:500,v:.16});tone(1350,.3,{type:'triangle',to:700,v:.08});break;
  case 'hull':noise(.25,{ft:'lowpass',f:1200,v:.5});tone(90,.3,{to:45,v:.5});break;
  case 'crit':noise(.5,{ft:'lowpass',f:2200,fto:300,v:.5});tone(220,.4,{type:'square',to:70,v:.15,lp:1200});break;
  case 'boom':noise(1.4,{ft:'lowpass',f:1800,fto:90,v:.8});tone(60,1.2,{to:28,v:.7});noise(.4,{f:5000,q:1,v:.25,at:.05});break;
  case 'miss':noise(.18,{f:6000,q:2,v:.12});break;
  case 'dice':for(let j=0;j<7;j++){const at=j*.05+Math.random()*.03;noise(.04,{f:2500+Math.random()*2500,q:6,v:.2,at});tone(500+Math.random()*400,.03,{type:'triangle',v:.07,at})}break;
  case 'token':tone(880,.1,{type:'triangle',v:.12});tone(1320,.18,{type:'triangle',v:.1,at:.07});break;
  case 'lock':for(let i=0;i<3;i++)tone(1600,.05,{type:'square',v:.06,lp:4000,at:i*.08});tone(2200,.2,{type:'sine',v:.1,at:.26});break;
  case 'stress':tone(420,.18,{type:'square',v:.1,lp:1500});tone(330,.25,{type:'square',v:.1,lp:1500,at:.14});break;
  case 'rock':noise(.35,{ft:'lowpass',f:700,v:.5});break;
  case 'turn':tone(660,.4,{type:'sine',v:.14});tone(990,.6,{type:'sine',v:.1,at:.12});break;
  case 'win':[392,523,659,784,659,784,1047].forEach((f,i)=>{tone(f,i===6?1.2:.22,{type:'sawtooth',v:.09,lp:2800,at:i*.16});tone(f/2,i===6?1.2:.22,{type:'triangle',v:.1,at:i*.16})});break;
  case 'click':tone(1200,.03,{type:'triangle',v:.05});break;
  }}catch(e){}}
// music: the recorded track via GA; if it fails to decode, the synth groove below plays instead (slow minor pads over a pulsing bass, through reverb)
function musicStart(){if(gaMusic()){GA.music(MUSIC_MAP.main,{fade:2});clearTimeout(SND.gaChk);SND.gaChk=setTimeout(()=>{if(SND.music&&!gaMusic())musicStart()},5000);return}if(!SND.ctx||SND.mTimer)return;SND.nextT=SND.ctx.currentTime+.1;SND.mTimer=setInterval(musicTick,150)}
function musicStop(){clearInterval(SND.mTimer);SND.mTimer=null;if(GAOK)GA.music(null)}
const CHORDS=[[110,164.8,220,261.6],[98,146.8,196,246.9],[87.3,130.8,174.6,220],[98,146.8,196,233.1]];
function musicTick(){const c=SND.ctx;if(!c||c.state!=='running')return;if(gaMusic()){clearInterval(SND.mTimer);SND.mTimer=null;GA.music(MUSIC_MAP.main);return}const step=60/84/2;
  while(SND.nextT<c.currentTime+.4){const k=SND.beat%32,at=SND.nextT-c.currentTime,ch=CHORDS[Math.floor(SND.beat/32)%4];
    if(k===0)ch.forEach((f,i)=>tone(f*2,step*31,{type:'sawtooth',v:.035,lp:900,a:1.2,at,bus:SND.rev,det:i*4}));
    if(k%4===0)tone(ch[0]/2,step*1.8,{type:'triangle',v:.28,at,bus:SND.musBus,lp:400});
    if(k%8===6)noise(.08,{f:9000,q:1,v:.05,at,bus:SND.musBus});
    if(k%16===10)tone(ch[3]*2,step*3,{type:'sine',v:.05,at,bus:SND.rev});
    SND.nextT+=step;SND.beat++}}
function toggleSound(){SND.on=!SND.on;try{localStorage.setItem('na_snd',SND.on?'1':'0')}catch(e){}if(GAOK){GA.setSfx(SND.on);if(SND.on&&typeof V3!=='undefined'&&V3.engOn)sndEngine(true)}audioInit();if(SND.master)SND.master.gain.value=SND.on?SND.vol:0;if(SND.on)sfx('click');soundBtns()}
function toggleMusic(){SND.music=!SND.music;try{localStorage.setItem('na_mus',SND.music?'1':'0')}catch(e){}if(GAOK)GA.setMusic(SND.music);if(SND.music){audioInit();musicStart()}else musicStop();soundBtns()}
function soundBtns(){const a=document.getElementById('sndbtn'),b=document.getElementById('musbtn');if(a)a.textContent=SND.on?'🔊':'🔇';if(b)b.textContent=SND.music?'🎵 On':'🎵 Off'}

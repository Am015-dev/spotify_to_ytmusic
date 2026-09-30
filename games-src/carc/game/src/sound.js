// ---------- sound: every effect is synthesized live with Web Audio (no files) ----------
const SND={ctx:null,on:true,music:true,pitch:1,vol:.7,last:{},nb:null,beat:0,mTimer:null};
try{SND.on=localStorage.getItem('rv_snd')!=='0';SND.music=localStorage.getItem('rv_mus')!=='0'}catch(e){}
function audioInit(){if(SND.ctx)return true;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  try{const c=SND.ctx=new AC();const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(c.destination);
    SND.master=c.createGain();SND.master.gain.value=SND.on?SND.vol:0;SND.master.connect(comp);
    SND.fxBus=c.createGain();SND.fxBus.connect(SND.master);SND.musBus=c.createGain();SND.musBus.gain.value=.3;SND.musBus.connect(SND.master);
    const len=c.sampleRate*1.5,b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;SND.nb=b;
    if(SND.music)musicStart();return true}catch(e){SND.ctx=null;return false}}
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
function sfx(name){if(!name||!SND.on||!SND.ctx||SND.ctx.state!=='running')return;const now=performance.now();if(now-(SND.last[name]||0)<80)return;SND.last[name]=now;
  try{switch(name){
  case 'click':tone(1100,.03,{type:'triangle',v:.05});break;
  case 'place':thump(0,.45);noise(.06,{f:1400,q:2,v:.12,at:.02});break;
  case 'fig':tone(520,.09,{type:'triangle',v:.12});tone(780,.12,{type:'triangle',v:.09,at:.06});break;
  case 'score':[523,659,784].forEach((f,k)=>tone(f,.22,{type:'triangle',v:.11,at:k*.07}));break;
  case 'home':tone(660,.12,{type:'sine',v:.07,to:990});break;
  case 'goods':for(let k=0;k<4;k++)tone(1500+Math.random()*700,.06,{type:'square',v:.035,lp:4000,at:k*.05});break;
  case 'turn':tone(392,.1,{type:'sine',v:.05});break;
  case 'story':tone(293.7,1.2,{type:'sine',v:.1,a:.2});tone(440,1.2,{type:'sine',v:.07,a:.3,at:.15});tone(587.3,1.3,{type:'triangle',v:.05,a:.3,at:.3});break;
  case 'win':[523,659,784,1047,784,1047].forEach((f,k)=>tone(f,k===5?.9:.2,{type:'triangle',v:.13,at:k*.15}));break;
  case 'bad':tone(330,.25,{type:'sawtooth',to:220,v:.12,lp:1400});break;
  }}catch(e){}}
// ambience: a drone on D and A, a plucked lute line in D dorian, a soft frame drum
const LUTE=[293.7,329.6,349.2,392,440,493.9,523.3,587.3];
function musicStart(){if(!SND.ctx||SND.mTimer)return;SND.nextT=SND.ctx.currentTime+.1;SND.mTimer=setInterval(musicTick,200)}
function musicStop(){clearInterval(SND.mTimer);SND.mTimer=null}
function musicTick(){const c=SND.ctx;if(!c||c.state!=='running')return;const st=.42;
  while(SND.nextT<c.currentTime+.5){const at=SND.nextT-c.currentTime,k=SND.beat%16;
    if(k===0){tone(73.4,st*15,{type:'sine',v:.07,a:.6,at,bus:SND.musBus});tone(110,st*15,{type:'sine',v:.04,a:.8,at,bus:SND.musBus})}
    if([0,6,8,14].includes(k))tone(90,.14,{to:60,v:.22,at,bus:SND.musBus});if([4,12].includes(k))noise(.07,{f:2400,q:1.5,v:.07,at,bus:SND.musBus});
    if(k%2===0&&Math.random()<.62){const f=LUTE[Math.floor(Math.random()*LUTE.length)];tone(f,.55,{type:'triangle',v:.05,at,bus:SND.musBus,a:.005,lp:2200})}
    SND.nextT+=st;SND.beat++}}
function toggleSound(){SND.on=!SND.on;try{localStorage.setItem('rv_snd',SND.on?'1':'0')}catch(e){}audioInit();if(SND.master)SND.master.gain.value=SND.on?SND.vol:0;if(SND.on)sfx('click');soundBtns()}
function toggleMusic(){SND.music=!SND.music;try{localStorage.setItem('rv_mus',SND.music?'1':'0')}catch(e){}if(SND.music){audioInit();musicStart()}else musicStop();soundBtns()}
function soundBtns(){const a=document.getElementById('sndbtn'),b=document.getElementById('musbtn');const I=typeof ico==='function'?ico:null;if(a){if(I)a.innerHTML=I(SND.on?'snd':'sndoff');else a.textContent=SND.on?'🔊':'🔇';a.setAttribute('aria-pressed',SND.on?'true':'false')}if(b){if(I)b.innerHTML=I(SND.music?'mus':'musoff');else b.textContent=SND.music?'🎶':'🎶̸';b.setAttribute('aria-pressed',SND.music?'true':'false')}}

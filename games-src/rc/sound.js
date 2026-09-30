// ---------- sound: every effect is synthesized live with Web Audio (no files) ----------
const SND={ctx:null,on:true,music:true,pitch:1,vol:.7,last:{},nb:null,beat:0,mTimer:null};
try{SND.on=localStorage.getItem('swi_snd')!=='0';SND.music=localStorage.getItem('swi_mus')!=='0'}catch(e){}
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
function sfx(name){if(!SND.on||!SND.ctx||SND.ctx.state!=='running')return;const now=performance.now();if(now-(SND.last[name]||0)<(name==='click'?30:90))return;SND.last[name]=now;
  try{switch(name){
  case 'dice':for(let k=0;k<9;k++){const at=k*.045+Math.random()*.03;noise(.04,{f:1500+Math.random()*1500,q:5,v:.24,at});tone(300+Math.random()*300,.03,{type:'triangle',v:.08,at})}
    for(let k=0;k<4;k++)noise(.06,{f:1100+Math.random()*900,q:4,v:.18,at:.45+k*.08});break;
  case 'wound':tone(240,.3,{type:'sawtooth',to:110,v:.22,lp:1100,vib:28,vibAmt:20});noise(.14,{f:800,q:1.4,v:.18});break;
  case 'heal':[523,659,784].forEach((f,k)=>tone(f,.35,{type:'sine',v:.12,at:k*.07}));break;
  case 'build':for(let k=0;k<3;k++){thump(k*.16,.5);noise(.05,{f:2600,q:6,v:.25,at:k*.16})}break;
  case 'explore':noise(.6,{f:900,fto:2400,q:.8,v:.2,a:.1});[392,494,587,784].forEach((f,k)=>tone(f,.4,{type:'triangle',v:.1,at:.1+k*.09}));break;
  case 'fight':thump(0,.9);noise(.3,{ft:'lowpass',f:1600,fto:300,v:.4});tone(150,.6,{type:'sawtooth',to:60,v:.3,lp:700,vib:20,vibAmt:18});break;
  case 'event':tone(196,.9,{type:'triangle',v:.16});tone(233,.9,{type:'triangle',v:.1,at:.05});noise(.8,{f:500,fto:200,q:1,v:.12,a:.2});break;
  case 'thunder':noise(2.2,{ft:'lowpass',f:900,fto:80,v:.7,a:.02});thump(0,1);thump(.25,.6);break;
  case 'night':[392,330,262].forEach((f,k)=>tone(f,.9,{type:'sine',v:.08,at:k*.3,a:.2}));break;
  case 'round':tone(659,.5,{type:'sine',v:.12});tone(988,.8,{type:'sine',v:.08,at:.15});noise(.6,{f:600,q:.6,v:.08,a:.2});break;
  case 'good':tone(784,.2,{type:'triangle',v:.12});tone(1047,.35,{type:'triangle',v:.1,at:.1});break;
  case 'bad':tone(330,.25,{type:'sawtooth',to:220,v:.16,lp:1400});tone(247,.5,{type:'sawtooth',to:150,v:.16,lp:1100,at:.22});break;
  case 'mystery':tone(880,1,{type:'sine',v:.1,vib:6,vibAmt:40});tone(440,1,{type:'triangle',v:.06,at:.1});break;
  case 'win':[392,523,659,784,659,1047].forEach((f,k)=>{tone(f,k===5?1:.25,{type:'triangle',v:.14,at:k*.16});tone(f/2,k===5?1:.25,{type:'sine',v:.12,at:k*.16})});break;
  case 'lose':[392,370,349,330].forEach((f,k)=>tone(f,k===3?1.2:.4,{type:'triangle',v:.18,at:k*.4}));break;
  case 'click':tone(1100,.03,{type:'triangle',v:.05});break;
  case 'place':noise(.05,{f:1400,q:3,v:.2});tone(520,.06,{type:'triangle',v:.1});break;
  }}catch(e){}}
// ambience: surf that swells with the weather, a slow modal pad, rain hiss when it rains
const PAD=[[146.8,220,293.7],[130.8,196,261.6],[116.5,174.6,233.1],[130.8,196,261.6]];
function musicStart(){if(!SND.ctx||SND.mTimer)return;SND.nextT=SND.ctx.currentTime+.1;SND.mTimer=setInterval(musicTick,250)}
function musicStop(){clearInterval(SND.mTimer);SND.mTimer=null}
function musicTick(){const c=SND.ctx;if(!c||c.state!=='running')return;const bar=4.8;
  while(SND.nextT<c.currentTime+.6){const at=SND.nextT-c.currentTime,k=SND.beat;const storm=(typeof V3!=='undefined'&&V3.weather)?V3.weather.storm:0;const rain=(typeof V3!=='undefined'&&V3.weather)?V3.weather.rain:0;
    noise(bar*.9,{ft:'lowpass',f:500+storm*600,fto:180,v:.18+storm*.2,a:bar*.4,at,bus:SND.musBus});
    if(k%2===0)PAD[(k/2)%4].forEach((f,i)=>tone(f,bar*1.9,{type:'sine',v:.05,a:1.2,at:at+i*.05,bus:SND.musBus}));
    if(k%4===1)tone(PAD[(k>>1)%4][2]*2,.9,{type:'triangle',v:.035,a:.05,at:at+1.2,bus:SND.musBus});
    if(rain>.1)noise(bar,{ft:'highpass',f:3500,v:.06*rain,a:.5,at,bus:SND.musBus});
    SND.nextT+=bar;SND.beat++}}
function toggleSound(){SND.on=!SND.on;try{localStorage.setItem('swi_snd',SND.on?'1':'0')}catch(e){}audioInit();if(SND.master)SND.master.gain.value=SND.on?SND.vol:0;if(SND.on)sfx('click');soundBtns()}
function toggleMusic(){SND.music=!SND.music;try{localStorage.setItem('swi_mus',SND.music?'1':'0')}catch(e){}if(SND.music){audioInit();musicStart()}else musicStop();soundBtns()}
function soundBtns(){const a=document.getElementById('sndbtn'),b=document.getElementById('musbtn');if(typeof setBtn==='function'){setBtn(a,SND.on?'snd':'mute','');setBtn(b,'wave',SND.music?'On':'Off');return}if(a)a.textContent=SND.on?'🔊':'🔇';if(b)b.textContent=SND.music?'🌊 On':'🌊 Off'}

// ---------- sound: every effect is synthesized live with Web Audio (no files) ----------
const SND={ctx:null,on:true,music:true,pitch:1,vol:.7,last:{},nb:null,beat:0,mTimer:null};
try{SND.on=localStorage.getItem('ccs_snd')!=='0';SND.music=localStorage.getItem('ccs_mus')!=='0'}catch(e){}
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
  case 'mindbug':tone(600,.9,{type:'sine',v:.18,vib:9,vibAmt:120});tone(905,.9,{type:'triangle',v:.08,vib:6,vibAmt:90,det:12});tone(300,.9,{type:'sine',to:200,v:.1});break;
  case 'evolve':tone(300,.6,{type:'triangle',to:1500,v:.14});[1319,1568,1976,2637].forEach((f,k)=>tone(f,.18,{type:'sine',v:.08,at:.35+k*.06}));break;
  case 'buy':noise(.03,{f:5000,q:3,v:.15});tone(1568,.12,{type:'triangle',v:.14,at:.03});tone(2093,.35,{type:'triangle',v:.14,at:.12});break;
  case 'turn':tone(784,.5,{type:'sine',v:.16});tone(1175,.7,{type:'sine',v:.12,at:.12});break;
  case 'win':[523,659,784,1047,784,1047].forEach((f,k)=>{tone(f,k===5?.9:.2,{type:'square',v:.1,lp:3000,at:k*.15});tone(f/2,k===5?.9:.2,{type:'triangle',v:.12,at:k*.15})});thump(0,.8);thump(.6,.8);break;
  case 'click':tone(1200,.03,{type:'triangle',v:.05});break;
  }}catch(e){}}
// light background groove (optional)
function musicStart(){if(!SND.ctx||SND.mTimer)return;SND.nextT=SND.ctx.currentTime+.1;SND.mTimer=setInterval(musicTick,120)}
function musicStop(){clearInterval(SND.mTimer);SND.mTimer=null}
const BASS=[55,55,65.4,55,73.4,73.4,65.4,49,55,55,65.4,55,82.4,73.4,65.4,61.7];
function musicTick(){const c=SND.ctx;if(!c||c.state!=='running')return;const step=60/112/2;
  while(SND.nextT<c.currentTime+.3){const k=SND.beat%16,at=SND.nextT-c.currentTime;
    tone(BASS[k],step*.9,{type:'sawtooth',v:.35,lp:420,at,bus:SND.musBus});
    if(k%4===0){tone(110,.2,{to:40,v:.6,at,bus:SND.musBus})}
    if(k%4===2)noise(.12,{f:1800,q:.8,v:.25,at,bus:SND.musBus});
    noise(.03,{f:8000,q:1,v:k%2?.08:.14,at,bus:SND.musBus});
    if(k===0&&SND.beat%64===0)[220,261.6,329.6].forEach(f=>tone(f,step*14,{type:'triangle',v:.05,at,bus:SND.musBus,a:.4}));
    SND.nextT+=step;SND.beat++}}
function toggleSound(){SND.on=!SND.on;try{localStorage.setItem('ccs_snd',SND.on?'1':'0')}catch(e){}audioInit();if(SND.master)SND.master.gain.value=SND.on?SND.vol:0;if(SND.on)sfx('click');soundBtns()}
function toggleMusic(){SND.music=!SND.music;try{localStorage.setItem('ccs_mus',SND.music?'1':'0')}catch(e){}if(SND.music){audioInit();musicStart()}else musicStop();soundBtns()}
function soundBtns(){const a=document.getElementById('sndbtn'),b=document.getElementById('musbtn');if(a)a.textContent=SND.on?'🔊':'🔇';if(b)b.textContent=SND.music?'🎵 On':'🎵 Off'}

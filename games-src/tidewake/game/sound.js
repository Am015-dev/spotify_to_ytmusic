// ===================== Tidewake: sound =====================
// CC0 samples through GA (gameaudio.js + audio-data.js) per audio/tidewake/MAP.md; every event also has a small live synth as the fallback.
// ONE table: s = sample name (null = always synth), vol = gain. Swap or mute one sound by editing its line.
const SND_MAP={
  tile_place:{s:'tile_place',vol:1.1},tile_rotate:{s:'tile_rotate',vol:1},ship_glide:{s:'ship_glide',vol:.8},ship_creak:{s:'ship_creak',vol:.8},wake_swish:{s:'wake_swish',vol:.7},
  crash:{s:'crash',vol:1},splash:{s:'splash',vol:.9},ship_sink:{s:'ship_sink',vol:1},leviathan_spawn:{s:'leviathan_spawn',vol:1},leviathan_roar:{s:'leviathan_roar',vol:1},
  tile_destroyed:{s:'tile_destroyed',vol:1},cannon:{s:'cannon',vol:1},dice_roll:{s:'dice_roll',vol:1.2},rift_gate:{s:'rift_gate',vol:.9},rogue_wave:{s:'rogue_wave',vol:1},maelstrom:{s:'maelstrom',vol:.9},
  win:{s:'win',vol:1,jitter:0},lose:{s:'lose',vol:1,jitter:0},click:{s:'click',vol:.6},hover:{s:'hover',vol:.3,cooldown:80},open:{s:'open',vol:.6},close:{s:'close',vol:.6},
  confirm:{s:'confirm',vol:.7},error:{s:'error',vol:.7},turn:{s:'turn',vol:.8,jitter:0}};
const SND_LOOP={sea_loop:{s:'sea_loop',vol:.5}};
const SND_MUS={calm:'calm',tension:'tension'};
const SND={ctx:null,on:true,music:true,vol:.7,last:{},nb:null,fired:{},mood:'calm',loops:{},wantMusic:0,gesture:0};
try{SND.on=localStorage.getItem('tw_snd')!=='0';SND.music=localStorage.getItem('tw_mus')!=='0'}catch(e){}
function audioInit(){if(SND.ctx)return true;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  try{const c=SND.ctx=new AC();const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(c.destination);
    SND.master=c.createGain();SND.master.gain.value=SND.on?SND.vol:0;SND.master.connect(comp);SND.fxBus=c.createGain();SND.fxBus.connect(SND.master);
    const len=c.sampleRate*1.5,b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;SND.nb=b;return true}catch(e){SND.ctx=null;return false}}
function onGesture(){if(audioInit()&&SND.ctx.state==='suspended')SND.ctx.resume();SND.gesture=1;if(SND.music&&SND.wantMusic)musicStart();if(SND.wantLoop)sndLoop('sea_loop',true)}
document.addEventListener('pointerdown',onGesture,{capture:true});document.addEventListener('keydown',onGesture,{capture:true});
function env(g,t,a,peak,dur){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+dur)}
function tone(f,dur,o){o=o||{};const c=SND.ctx,t=c.currentTime+(o.at||0);const osc=c.createOscillator(),g=c.createGain();osc.type=o.type||'sine';osc.frequency.setValueAtTime(f,t);if(o.to)osc.frequency.exponentialRampToValueAtTime(o.to,t+dur);
  osc.connect(g);g.connect(SND.fxBus);env(g,t,o.a||.008,o.v||.25,dur);osc.start(t);osc.stop(t+dur+.05)}
function noise(dur,o){o=o||{};const c=SND.ctx,t=c.currentTime+(o.at||0);const s=c.createBufferSource();s.buffer=SND.nb;const fl=c.createBiquadFilter();fl.type=o.ft||'bandpass';fl.frequency.setValueAtTime(o.f||1500,t);if(o.fto)fl.frequency.exponentialRampToValueAtTime(o.fto,t+dur);fl.Q.value=o.q||1;
  const g=c.createGain();s.connect(fl);fl.connect(g);g.connect(SND.fxBus);env(g,t,o.a||.004,o.v||.25,dur);s.start(t,Math.random());s.stop(t+dur+.05)}
function sfx(name,o){o=o||{};if(!SND.on)return;const m=SND_MAP[name];if(!m)return;const now=performance.now();if(now-(SND.last[name]||0)<(m.cooldown||(name==='click'?30:60)))return;SND.last[name]=now;
  if(m.s&&window.GA&&GA.has(m.s)){SND.fired[name]='sample';GA.play(m.s,{vol:m.vol,jitter:m.jitter,at:o.at});return}
  if(!SND.ctx||SND.ctx.state!=='running'){SND.fired[name]=SND.fired[name]||'silent';return}SND.fired[name]='synth';const at=o.at||0;
  try{switch(name){
   case 'click':case 'hover':tone(1100,.03,{type:'triangle',v:.05,at});break;case 'open':tone(520,.12,{type:'triangle',to:880,v:.08,at});break;case 'close':tone(880,.1,{type:'triangle',to:520,v:.08,at});break;
   case 'confirm':tone(660,.08,{v:.1,at});tone(990,.12,{v:.1,at:at+.07});break;case 'error':tone(180,.18,{type:'sawtooth',v:.1,at});break;case 'turn':tone(784,.1,{type:'triangle',v:.1,at});tone(1175,.16,{type:'triangle',v:.1,at:at+.1});break;
   case 'tile_place':noise(.12,{f:600,v:.3,at});tone(140,.12,{type:'triangle',to:70,v:.3,at});break;case 'tile_rotate':tone(900,.04,{type:'square',v:.05,at});break;
   case 'ship_glide':noise(.5,{f:700,fto:1400,v:.1,at});break;case 'ship_creak':tone(220,.4,{type:'sawtooth',to:160,v:.05,at});break;case 'wake_swish':noise(.6,{f:1000,fto:3000,v:.1,at});break;
   case 'crash':noise(.4,{f:500,v:.4,at});tone(90,.3,{type:'triangle',to:50,v:.35,at});break;case 'splash':noise(.35,{f:1800,fto:600,v:.2,at});break;
   case 'ship_sink':noise(1.2,{f:900,fto:200,v:.18,at});tone(120,1.2,{type:'triangle',to:40,v:.15,at});break;case 'leviathan_spawn':noise(.4,{f:500,v:.3,at});tone(70,.6,{type:'sawtooth',to:45,v:.25,at});break;
   case 'leviathan_roar':tone(95,.9,{type:'sawtooth',to:55,v:.3,at});noise(.8,{f:300,v:.15,at});break;case 'tile_destroyed':noise(.6,{f:400,v:.4,at});tone(80,.5,{type:'triangle',to:40,v:.3,at});break;
   case 'cannon':noise(.3,{f:220,v:.5,at});tone(60,.4,{type:'triangle',to:30,v:.4,at});break;case 'dice_roll':for(let i=0;i<6;i++)noise(.03,{f:2400,v:.12,at:at+i*.07});break;
   case 'rift_gate':tone(500,.8,{to:1500,v:.12,at});break;case 'rogue_wave':noise(1.6,{f:300,fto:1600,v:.25,at});break;case 'maelstrom':noise(1.8,{f:600,fto:300,v:.2,at});break;
   case 'win':[523,659,784,1047].forEach((f,i)=>tone(f,.3,{v:.15,at:at+i*.12}));break;case 'lose':[392,330,262,196].forEach((f,i)=>tone(f,.4,{type:'triangle',v:.15,at:at+i*.18}));break}}catch(e){}}
function sndLoop(name,on){const L=SND_LOOP[name];if(!L)return;if(on)SND.wantLoop=1;else SND.wantLoop=0;if(on===!!SND.loops[name])return;if(!window.GA)return;
  if(on&&SND.on&&SND.gesture){SND.loops[name]=1;if(GA.has(L.s))GA.loop(L.s,{vol:L.vol,fade:.8});else SND.loops[name]=0}else if(!on){SND.loops[name]=0;GA.stopLoop(L.s,{fade:1})}}
function musicStart(){SND.wantMusic=1;if(!SND.music||!window.GA)return;GA.music(SND_MUS[SND.mood]||'calm',{fade:1.5})}
function musicStop(f){SND.wantMusic=0;if(window.GA)GA.music(null,{fade:f!=null?f:1})}
function musicMood(m){if(m===SND.mood)return;SND.mood=m;if(SND.music&&SND.wantMusic&&window.GA)GA.music(SND_MUS[m],{fade:m==='tension'?1.5:2})}
function toggleSound(){SND.on=!SND.on;try{localStorage.setItem('tw_snd',SND.on?'1':'0')}catch(e){}audioInit();if(window.GA)GA.setSfx(SND.on);if(SND.master)SND.master.gain.value=SND.on?SND.vol:0;
  if(!SND.on){for(const k in SND.loops)if(SND.loops[k]){SND.loops[k]=0;if(window.GA)GA.stopLoop(SND_LOOP[k].s,{fade:.2})}}else{if(SND.wantLoop)sndLoop('sea_loop',true);sfx('click')}}
function toggleMusic(){SND.music=!SND.music;try{localStorage.setItem('tw_mus',SND.music?'1':'0')}catch(e){}if(window.GA)GA.setMusic(SND.music);if(SND.music){audioInit();if(SND.wantMusic)musicStart()}else{const w=SND.wantMusic;musicStop(.6);SND.wantMusic=w}}
if(window.GA&&typeof GA_DATA!=='undefined'){GA.init({sfx:GA_DATA.sfx,music:GA_DATA.music,key:'tw',sfxVol:.8,musVol:.45,duck:['crash','ship_sink','leviathan_spawn','leviathan_roar','tile_destroyed','cannon','rogue_wave','win','lose'],ctx:()=>{audioInit();return SND.ctx}});GA.setSfx(SND.on);GA.setMusic(SND.music)}

setInterval(()=>{try{if(SND.wantLoop&&SND.on&&SND.gesture&&!SND.loops.sea_loop&&window.GA&&GA.has('sea_loop'))sndLoop('sea_loop',true)}catch(e){}},1000);

// ---------- sound: recorded samples (GA, gameaudio.js) with every effect also synthesized live as the fallback ----------
// One table for every event: s = sample name in GA_DATA (null = use the synth), vol = gain for that sample,
// pitch = follow SND.pitch (the roar of bigger monsters), duck = dip the music (roar, door, level, death, win, smash duck by default).
const SND_MAP={
  dice:{s:'dice',vol:1.4},       // short tap: +3 dB
  clack:{s:'clack',vol:1.5},     // short tap: +3.5 dB
  smash:{s:'smash',vol:.9},
  hurt:{s:'hurt',vol:.8},
  roar:{s:'roar',vol:.9,pitch:true},
  door:{s:'door',vol:.85},
  level:{s:'level',vol:.7},
  bad:{s:'bad',vol:.6},
  death:{s:'death',vol:.8},
  curse:{s:'curse',vol:.7,duck:true},
  whoosh:{s:'whoosh',vol:.6},
  turn:{s:'turn',vol:.45},       // plays every turn: kept low
  win:{s:'win',vol:.85},
  click:{s:'click',vol:.35},     // UI click: kept quiet
};
const SND={ctx:null,on:true,music:true,pitch:1,vol:.7,last:{},nb:null,beat:0,mTimer:null,fired:{}};
try{SND.on=localStorage.getItem('dkd_snd')!=='0';SND.music=localStorage.getItem('dkd_mus')!=='0'}catch(e){}
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
function sfx(name){if(!SND.on)return;const m=SND_MAP[name];
  if(m&&m.s&&window.GA&&GA.has(m.s)){const now=performance.now();if(now-(SND.last[name]||0)<(name==='click'?30:90))return;SND.last[name]=now;
    SND.fired[name]='sample';GA.play(m.s,{vol:m.vol,rate:m.pitch?(SND.pitch||1):1,duck:m.duck});return}
  if(!SND.ctx||SND.ctx.state!=='running')return;SND.fired[name]='synth';const now=performance.now();if(now-(SND.last[name]||0)<(name==='click'?30:90))return;SND.last[name]=now;
  try{switch(name){
  case 'dice':for(let k=0;k<9;k++){const at=k*.045+Math.random()*.03;noise(.04,{f:2500+Math.random()*2500,q:6,v:.22,at});tone(500+Math.random()*400,.03,{type:'triangle',v:.08,at})}
    for(let k=0;k<5;k++)noise(.05,{f:1800+Math.random()*1200,q:4,v:.16,at:.45+k*.07+Math.random()*.03});break;
  case 'clack':noise(.05,{f:2200,q:5,v:.2});tone(700,.04,{type:'triangle',v:.1});break;
  case 'smash':thump(0,.9);noise(.45,{ft:'lowpass',f:1400,fto:200,v:.45});tone(90,.5,{type:'sawtooth',to:45,v:.18,lp:600});break;
  case 'hurt':tone(260,.32,{type:'sawtooth',to:110,v:.22,lp:1200,vib:30,vibAmt:25});noise(.15,{f:900,q:1.5,v:.18});break;
  case 'roar':{const k=SND.pitch||1;tone(170*k,.9,{type:'sawtooth',to:70*k,v:.65,lp:1100,vib:24,vibAmt:22*k,a:.03});tone(172*k,.9,{type:'square',to:68*k,v:.22,lp:800,a:.03});tone(85*k,.9,{type:'sawtooth',to:40*k,v:.45,lp:400,a:.04});noise(.8,{f:700*k,fto:250,q:.7,v:.45,a:.03});break}
  case 'door':thump(0,.8);noise(.35,{ft:'lowpass',f:700,fto:200,v:.4});tone(90,.25,{type:'square',to:60,v:.15,lp:500,at:.05});noise(.5,{f:1200,fto:400,q:3,v:.12,at:.15});break;
  case 'level':[523,659,784,1047].forEach((f,k)=>tone(f,.22,{type:'square',v:.1,lp:3500,at:k*.08}));break;
  case 'bad':tone(330,.25,{type:'sawtooth',to:220,v:.18,lp:1500});tone(247,.5,{type:'sawtooth',to:150,v:.18,lp:1200,at:.22});break;
  case 'death':tone(392,.4,{type:'triangle',v:.2});tone(370,.4,{type:'triangle',v:.2,at:.4});tone(349,.4,{type:'triangle',v:.2,at:.8});tone(330,1.2,{type:'triangle',v:.2,at:1.2,vib:5,vibAmt:10});break;
  case 'curse':tone(600,.9,{type:'sine',v:.16,vib:8,vibAmt:140});tone(300,.9,{type:'sawtooth',to:120,v:.08,lp:900});noise(.6,{f:500,q:2,v:.15});break;
  case 'whoosh':noise(.4,{f:3000,fto:300,q:1.2,v:.28,a:.06});break;
  case 'turn':tone(784,.4,{type:'sine',v:.14});tone(1175,.6,{type:'sine',v:.1,at:.12});break;
  case 'win':[523,659,784,1047,784,1047].forEach((f,k)=>{tone(f,k===5?.9:.2,{type:'square',v:.1,lp:3000,at:k*.15});tone(f/2,k===5?.9:.2,{type:'triangle',v:.12,at:k*.15})});thump(0,.8);break;
  case 'click':tone(1200,.03,{type:'triangle',v:.05});break;
  }}catch(e){}}
// light background groove (optional)
// which recorded track fits the screen: title -> tavern, game -> main, fight with a level 12+ monster or a boss -> fight, end screens -> victory/defeat
function musicWant(){if(typeof G==='undefined'||!G)return ['tavern',0];
  if(G.winner){const me=typeof viewSeat==='function'?viewSeat():-1;const won=me>=0&&G.winner==='P'+(me+1)&&P(me).human&&G.mode!=='ai';return [won?'victory':'defeat',1]}
  const cb=G.cb;if(cb&&cb.mons&&cb.mons.some(m=>{try{const d=mdef(m);return (d.lvl||0)>=12||(typeof BOSS_CLIPS!=='undefined'&&BOSS_CLIPS[d.k])}catch(e){return false}}))return ['fight',0];
  return ['main',0]}
// ---- music picker: each slot (tavern=Menu, main=Dungeon, fight, victory, defeat) has a saved choice: a, b, shuffle, off or classic
const MSLOTS=[['tavern','Menu'],['main','Dungeon'],['fight','Fight'],['victory','Victory'],['defeat','Defeat']];
const MTITLE={'tavern-a':'Menu loop A','tavern-b':'Menu loop B','main-a':'Tiptoe Through the Trapdoor','main-b':'The Curious Little Dungeon','fight-a':'Taiko and Tumble','fight-b':'Fiddle Fists and Bassoon Blows','victory-a':'Tavern of the Golden Stag','victory-b':'Fanfare for the Merry Company','defeat-a':"O Woe, My Broken Lute",'defeat-b':'Two Notes and a Shrug',classic:'Classic'};
const MDEF={tavern:'all',main:'all',fight:'all',victory:'b',defeat:'a'};
SND.pick=Object.assign({},MDEF);try{Object.assign(SND.pick,JSON.parse(localStorage.getItem('dkd_mpick')||'{}'))}catch(e){}
SND.res={};SND.wslot=null;SND.prev=null;SND.last=null;SND.since=0;
// 'all' = shuffle through every looping song (menu, dungeon and fight tracks), a new one every ~2.5 min
const MLOOPS=['tavern','main','fight'],MALL=Object.keys(MTITLE).filter(k=>MLOOPS.includes(k.split('-')[0])),MALL_MS=150000;
function musicName(slot){let c=SND.pick[slot]||MDEF[slot];if(c==='off')return '-';if(c==='classic'&&slot!=='victory'&&slot!=='defeat')return 'classic';
  if(c==='all'){if(!SND.res[slot]){const pool=MALL.filter(k=>k!==SND.last);SND.res[slot]=pool[Math.floor(Math.random()*pool.length)]}return SND.res[slot]}
  if(c==='shuffle'){if(!SND.res[slot]){SND.sh=SND.sh||{};SND.sh[slot]=SND.sh[slot]===undefined?(Math.random()<.5?0:1):1-SND.sh[slot];SND.res[slot]=slot+'-'+'ab'[SND.sh[slot]]}return SND.res[slot]}
  return slot+'-'+(c==='b'?'b':'a')}
function musicPick(slot,c){SND.pick[slot]=c;SND.res[slot]=null;try{localStorage.setItem('dkd_mpick',JSON.stringify(SND.pick))}catch(e){}
  if(window.GA&&c!=='off'&&c!=='shuffle'&&c!=='all')try{GA.preload(musicName(slot))}catch(e){}
  if(SND.wslot===slot&&!SND.prev){SND.want=null;musicSync()}}
function musicSync(){if(!window.GA||!SND.music||SND.prev)return;const w=musicWant();if(SND.wslot!==w[0]){SND.wslot=w[0];SND.res[w[0]]=null}
  else if(SND.pick[w[0]]==='all'&&!w[1]&&SND.since&&Date.now()-SND.since>MALL_MS)SND.res[w[0]]=null;
  const n=musicName(w[0]);if(SND.want===n)return;SND.want=n;SND.since=Date.now();if(n!=='-')SND.last=n;
  if(n==='-'){GA.music(null,{fade:1});return}
  GA.music(n,{fade:w[1]?.6:1,once:!!w[1]});
  if(w[0]==='tavern'||w[0]==='main'){setTimeout(()=>{try{const nx=w[0]==='tavern'?'main':'fight',c=SND.pick[nx];if(c!=='off'&&c!=='shuffle'&&c!=='all')GA.preload(musicName(nx))}catch(e){}},4000)}}
function musicPreview(slot){if(!window.GA||!SND.music||!SND.ctx||SND.wslot===slot)return;const n=musicName(slot);if(n==='-')return;
  clearTimeout(SND.prevT);SND.prev=slot;SND.want=null;GA.music(n,{fade:.5,once:true});
  SND.prevT=setTimeout(()=>{SND.prev=null;SND.want=null;musicSync();if(typeof renderMusic==='function')renderMusic()},8000)}
function musicPreviewStop(){if(!SND.prev)return;clearTimeout(SND.prevT);SND.prev=null;SND.want=null;musicSync()}
function musicStart(){SND.want=null;if(window.GA)musicSync();if(!SND.ctx||SND.mTimer)return;SND.nextT=SND.ctx.currentTime+.1;SND.mTimer=setInterval(musicTick,120)}
function musicStop(){SND.want=null;if(window.GA)GA.music(null);clearInterval(SND.mTimer);SND.mTimer=null}
// the recorded track owns the music unless it failed to decode: then the synth groove below plays instead
function gaMusicOk(){if(!window.GA)return false;const s=GA.state();return !!(s&&s.audio&&(SND.want==='-'||s.failed.indexOf(SND.want||'main')<0))}
const BASS=[73.4,0,110,0,98,0,87.3,82.4,73.4,0,110,0,130.8,123.5,110,98];
function musicTick(){const c=SND.ctx;if(!c||c.state!=='running')return;const step=60/124/2;if(gaMusicOk()){SND.nextT=c.currentTime+.1;return}
  while(SND.nextT<c.currentTime+.3){const k=SND.beat%16,at=SND.nextT-c.currentTime;
    if(BASS[k])tone(BASS[k],step*.8,{type:'triangle',v:.4,at,bus:SND.musBus});if(k%8===4)tone(BASS[k]*4||440,step*.5,{type:'square',v:.05,lp:2000,at,bus:SND.musBus});
    if(k%4===0){tone(110,.2,{to:40,v:.6,at,bus:SND.musBus})}
    if(k%4===2)noise(.12,{f:1800,q:.8,v:.25,at,bus:SND.musBus});
    noise(.03,{f:8000,q:1,v:k%2?.08:.14,at,bus:SND.musBus});
    if(k===0&&SND.beat%64===0)[220,261.6,329.6].forEach(f=>tone(f,step*14,{type:'triangle',v:.05,at,bus:SND.musBus,a:.4}));
    SND.nextT+=step;SND.beat++}}
function toggleSound(){SND.on=!SND.on;try{localStorage.setItem('dkd_snd',SND.on?'1':'0')}catch(e){}audioInit();if(window.GA)GA.setSfx(SND.on);if(SND.master)SND.master.gain.value=SND.on?SND.vol:0;if(SND.on)sfx('click');soundBtns()}
function toggleMusic(){SND.music=!SND.music;try{localStorage.setItem('dkd_mus',SND.music?'1':'0')}catch(e){}if(window.GA)GA.setMusic(SND.music);if(SND.music){audioInit();musicStart()}else musicStop();soundBtns()}
function soundBtns(){const a=document.getElementById('sndbtn'),b=document.getElementById('musbtn');const I=typeof ic==='function'?ic:(n=>'');if(a)a.innerHTML=I(SND.on?'sound':'mute');if(b)b.innerHTML=I('music')+(SND.music?' On':' Off')}
// recorded audio: shares the synth's AudioContext, which is only created on the first gesture, so nothing plays before a click
if(window.GA&&typeof GA_DATA!=='undefined'){GA.init({sfx:GA_DATA.sfx,music:GA_DATA.music,key:'dkd',ctx:()=>{audioInit();return SND.ctx}});GA.setSfx(SND.on);GA.setMusic(SND.music)}

<script>
(()=>{
"use strict";
const W=960,H=540,PR=1.5;
const $=id=>document.getElementById(id);
const cv=$('game'),ctx=cv.getContext('2d'),frame=$('frame'),stage=$('stage');
let S=1,rotMode=false,touchUI=false;
try{touchUI=matchMedia('(pointer:coarse)').matches;}catch(e){}

const rnd=(a,b)=>a+Math.random()*(b-a);                 // looks only (particles, rain)
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function mul(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let GR=Math.random,GX=Math.random;                      // gameplay dice, seeded for the daily run: GR picks waves (same every time), GX drops and refires
const gr=(a,b)=>a+GR()*(b-a),gx=(a,b)=>a+GX()*(b-a);
const gpick=a=>a[Math.floor(GR()*a.length)];
function mk(w,h){const c=document.createElement('canvas');c.width=Math.ceil(w*PR);c.height=Math.ceil(h*PR);const g=c.getContext('2d');g.scale(PR,PR);return[c,g];}
function blit(c,x,y){ctx.drawImage(c,x,y,c.width/PR,c.height/PR);}

/* ---------- glow sprites ---------- */
const gc={};
function glow(col){if(gc[col])return gc[col];const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
  const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,col+'ff');r.addColorStop(.18,col+'bb');r.addColorStop(.5,col+'30');r.addColorStop(1,col+'00');
  g.fillStyle=r;g.fillRect(0,0,64,64);return gc[col]=c;}
function G_(x,y,r,col,a=1){ctx.globalAlpha=a;ctx.drawImage(glow(col),x-r,y-r,r*2,r*2);ctx.globalAlpha=1;}

/* ---------- storage + settings ---------- */
function load(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v);}catch(e){return d;}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
let best=load('mnr_best',{score:0,dist:''});
const todayN=()=>{const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();};
let dailyBest=load('mnr_daily',{n:0,score:0});if(dailyBest.n!==todayN())dailyBest={n:todayN(),score:0};
let RM=false;try{RM=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
const SET=Object.assign({music:.8,sfx:.8,reduce:RM,guide:true,sync:0,mute:load('mnr_mute',false)},load('mnr_set',{}));
const saveSet=()=>{save('mnr_set',SET);save('mnr_mute',SET.mute);};
if(!SET.mv2){SET.music=.45;SET.mv2=1;saveSet();}      // music sits well under the effects by default (older saved settings were louder)
const NOMUSIC=/[?&]nomusic=1/.test(location.search);   // test switch: no song files, synth only
try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(e){}   // iOS: Web Audio ignores the silent switch only in the 'playback' session
const FX=()=>SET.reduce?.25:1;                          // strength of flashes and shake

/* ---------- beat clock ---------- */
// Everything rhythmic reads this one clock. Beat 0 sits at BT.t0+BT.off on the music clock. The clock is the AudioContext's
// currentTime when audio runs, and a plain game-time counter (fbT) when it does not, so the game also works silent.
const DEF_BPM={menu:100,stage1:120,stage2:128,stage3:128,boss:140,endless:132};
const distLen=()=>24*4*BT.spb;                            // a district is 24 bars of the current song
const barQ=s=>Math.max(1,Math.round(s/(4*BT.spb)))*4*BT.spb*.97;   // seconds -> whole bars
const BT={bpm:100,spb:.6,t0:0,off:0,stage:'',mode:'none',rev:0,src:0,lastRaw:0,pend:null,title:''};
let fbT=0;
const CK={h:[],d:0,at:0,has:0};                          // clock smoothing: currentTime only moves in hardware-buffer steps and never runs ahead,
function ckReset(){CK.h.length=0;CK.d=0;CK.at=0;CK.has=0;}  // so the largest (currentTime - wall clock) seen over 1.5 s is the exact mapping.
// The mapping may only rise by 1% of elapsed time: after a resume the context first renders a burst ahead of the speakers (up to ~170 ms), which must not shift the grid.
function ckPush(a){const p=performance.now();if(p-CK.at<4&&CK.h.length)return;const dw=p-CK.at;CK.at=p;CK.h.push([p,a.currentTime*1000-p]);
  while(CK.h.length&&CK.h[0][0]<p-1500)CK.h.shift();let m=-1e12;for(const e of CK.h)if(e[1]>m)m=e[1];
  CK.d=CK.has?Math.min(m,CK.d+dw*.01):m;CK.has=1;}
let ckRun=0;
// Clock domains: 1 = the AudioContext clock (running, or frozen while paused / just resumed after it ran), 0 = the game-time counter fbT (silent / not yet unlocked).
// A frozen context keeps its currentTime and its sources keep their position, so pause/resume never shifts the grid.
function mnow(){const a=AU.a,run=a&&a.state==='running'?1:0;if(run)AU.ran=true;
  const dom=run||(a&&AU.ran&&(AU.hold||performance.now()<AU.rUntil))?1:0,raw=dom?a.currentTime:fbT;
  if(dom!==BT.src){const d=raw-BT.lastRaw;BT.t0+=d;if(BT.pend){BT.pend.at+=d;BT.pend.v.t0+=d;}BT.src=dom;}
  if(run!==ckRun){ckRun=run;ckReset();}
  if(run)ckPush(a);
  BT.lastRaw=raw;if(BT.pend&&raw>=BT.pend.at){Object.assign(BT,BT.pend.v);BT.rev++;BT.pend=null;AU.step=0;if(BT.mode==='file'&&BT.title&&G&&G.live)G.note={t:4,txt:'\u266a '+BT.title};}
  return raw;}
function audible(ts){                                    // music-clock seconds that the player hears at wall time ts (default: now)
  const a=AU.a;mnow();const p=ts>0?ts:performance.now();
  if(BT.src&&a){if(a.state!=='running')return a.currentTime-(a.outputLatency||0)+SET.sync/1000;return(p+CK.d)/1000-(a.outputLatency||0)+SET.sync/1000;}
  return fbT-(performance.now()-p)/1000+SET.sync/1000;}
const bpos=ts=>(audible(ts)-BT.t0-BT.off)/BT.spb;       // beats since beat 0
function judge(ts){const p=bpos(ts),n=Math.round(p),dt=(p-n)*BT.spb*1000;return{ok:Math.abs(dt)<=80&&p>-.3,dt,beat:n};}
const fireIn=s=>Math.max(1,Math.round(s*BT.bpm/60));    // seconds -> whole beats at the current tempo

/* ---------- tracks (lazy) ---------- */
const TR={by:{},bufs:{},busy:{},bad:{},list:[]};
function normTrack(t){if(!t||typeof t.file!=='string'||!DEF_BPM[t.stage])return null;const bpm=+t.bpm;return{file:t.file,bpm:bpm>=40&&bpm<=300?bpm:DEF_BPM[t.stage],offsetMs:+t.offsetMs||0,title:String(t.title||'').slice(0,40),stage:t.stage};}
try{if(location.protocol!=='file:'&&!NOMUSIC)fetch('music/tracks.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(j=>{if(!j)return;const arr=Array.isArray(j)?j:Array.isArray(j.tracks)?j.tracks:[];
  for(const t of arr){const n=normTrack(t);if(n&&!TR.by[n.stage]){TR.by[n.stage]=n;TR.list.push(n);}}
  if(AU.a&&!running)AU.menuMusic();}).catch(()=>{});}catch(e){}
async function loadTrack(stage){const info=TR.by[stage];if(!info||TR.bufs[info.file]||TR.busy[info.file]||TR.bad[info.file]||!AU.a)return;
  TR.busy[info.file]=1;
  try{const r=await fetch(new URL('music/'+info.file,location.href),{cache:'force-cache'});if(!r.ok)throw 0;const ab=await r.arrayBuffer();
    const buf=await new Promise((ok,no)=>{const p=AU.a.decodeAudioData(ab,ok,no);if(p&&p.catch)p.catch(no);});
    for(const k in TR.bufs){const keep=k===info.file||(AU.cur&&TR.by[AU.cur.stage]&&TR.by[AU.cur.stage].file===k);if(!keep)delete TR.bufs[k];}   // decoded songs are big: keep the playing one and the new one only (iOS memory)
    TR.bufs[info.file]=buf;AU.trackReady(stage);}
  catch(e){TR.bad[info.file]=1;}
  TR.busy[info.file]=0;}

/* ---------- audio ---------- */
const AU={a:null,m:null,mus:null,fb:null,musv:null,sfxv:null,fx:null,step:0,root:45,boss:false,cur:null,hold:false,rUntil:0,
  init(){if(this.a)return;try{const a=this.a=new (window.AudioContext||window.webkitAudioContext)();
    this.m=a.createGain();this.m.connect(a.destination);
    this.duck=a.createGain();this.duck.connect(this.m);                                     // music dips briefly under big effects
    this.musv=a.createGain();this.musv.connect(this.duck);
    this.mus=a.createGain();this.mus.gain.value=.34;this.mus.connect(this.musv);          // synth soundtrack
    this.fb=a.createGain();this.fb.gain.value=.9;this.fb.connect(this.musv);               // music files
    this.sfxv=a.createGain();this.sfxv.connect(this.m);
    this.fx=a.createGain();this.fx.gain.value=.5;this.fx.connect(this.sfxv);
    const d=a.createDelay();d.delayTime.value=.38;const fb=a.createGain();fb.gain.value=.33;const lp=a.createBiquadFilter();lp.frequency.value=2200;
    d.connect(lp);lp.connect(fb);fb.connect(d);lp.connect(this.mus);this.dly=d;
    const len=Math.floor(a.sampleRate*.5),b=a.createBuffer(1,len,a.sampleRate),dd=b.getChannelData(0);for(let i=0;i<len;i++)dd[i]=Math.random()*2-1;this.nb=b;
    this.vol(true);setInterval(()=>this.sched(),25);
    a.addEventListener&&a.addEventListener('statechange',()=>{if(a.state==='suspended'&&!this.hold&&!document.hidden)a.resume().catch(()=>{});});}catch(e){this.a=null;}},
  // iOS: must run inside touchend/click/keydown. Resume synchronously, start a silent buffer in the same gesture, and (without audioSession) play a silent <audio> so the ring switch does not mute us.
  unlock(){if(!this.a)this.init();const a=this.a;if(!a)return;
    if(a.state!=='running'&&!this.hold){try{const p=a.resume();if(p&&p.catch)p.catch(()=>{});}catch(e){}}
    if(a.state!=='running'){try{const b=a.createBuffer(1,1,22050),s=a.createBufferSource();s.buffer=b;s.connect(a.destination);s.start(0);}catch(e){}}   // silent unlock sound inside the gesture
    if(!navigator.audioSession&&!this.sil){try{const h=new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YQAAAAA=');h.loop=true;h.volume=.01;h.setAttribute('playsinline','');this.sil=h;const q=h.play();if(q&&q.catch)q.catch(()=>{this.sil=null;});}catch(e){}}
    if(!running&&!BT.stage)this.menuMusic();},
  duckMusic(){const a=this.a;if(!a||!this.duck)return;const t=a.currentTime,g=this.duck.gain;g.cancelScheduledValues(t);g.setTargetAtTime(.7,t,.012);g.setTargetAtTime(1,t+.3,.15);},
  vol(now){if(!this.a)return;const t=this.a.currentTime,k=now?0:.02;
    this.m.gain.setTargetAtTime(SET.mute?0:.55,t,k||.001);this.musv.gain.setTargetAtTime(SET.music,t,k||.001);this.sfxv.gain.setTargetAtTime(SET.sfx,t,k||.001);},
  suspend(){this.hold=true;const a=this.a;if(a&&a.state==='running')a.suspend().catch(()=>{});},
  resume(){this.hold=false;this.rUntil=performance.now()+700;const a=this.a;if(a&&a.state!=='running')a.resume().catch(()=>{});},
  f(n){return 440*Math.pow(2,(n-69)/12);},
  menuMusic(){if(TR.by.menu){if(BT.stage!=='menu')this.startStage('menu');loadTrack('menu');}else if(BT.stage!==''&&BT.stage!=='menu')this.startStage('menu');},
  trackReady(stage){const info=TR.by[stage];if(!info||!this.a)return;
    if(BT.stage===stage&&BT.mode!=='file'){const spb4=BT.spb*4,now=mnow();let at=now+.1;
      if(BT.mode==='synth')at=BT.t0+Math.ceil((now+.15-BT.t0)/spb4)*spb4;this.startStage(stage,at);}},
  // switch to the music of a stage: the track file if it is loaded, otherwise the built-in synth at that stage's tempo
  startStage(stage,at){const a=this.a,info=TR.by[stage],buf=a&&info&&TR.bufs[info.file];
    if(!a){const bpm=info?info.bpm:DEF_BPM[stage];Object.assign(BT,{stage,mode:stage==='menu'?'none':'synth',bpm,spb:60/bpm,off:0,t0:fbT+.08,title:'',pend:null});BT.rev++;return;}   // no audio at all: the beat still runs, silently
    if(info)loadTrack(stage);
    const now=mnow(),t=at||now+.08,ctxT=a.currentTime+(t-now);
    if(this.cur&&this.cur.src){const c=this.cur;try{c.g.gain.setTargetAtTime(0,Math.max(a.currentTime,ctxT-.05),.12);c.src.stop(ctxT+1);}catch(e){}}
    this.cur=null;
    const v={stage};
    if(buf){const src=a.createBufferSource();src.buffer=buf;src.loop=true;const g=a.createGain();g.gain.setValueAtTime(0,ctxT);g.gain.linearRampToValueAtTime(1,ctxT+.25);
      src.connect(g);g.connect(this.fb);src.start(ctxT);this.cur={src,g,stage};
      Object.assign(v,{mode:'file',bpm:info.bpm,spb:60/info.bpm,off:info.offsetMs/1000,t0:t,title:info.title});}
    else if(stage==='menu'){Object.assign(v,{mode:'none',bpm:100,spb:.6,off:0,t0:t,title:''});}
    else{const bpm=info?info.bpm:DEF_BPM[stage];Object.assign(v,{mode:'synth',bpm,spb:60/bpm,off:0,t0:t,title:''});}
    if(at){BT.pend={at:t,v};}
    else{Object.assign(BT,v);BT.rev++;BT.pend=null;this.step=0;if(v.mode==='file'&&v.title&&G&&G.live)G.note={t:4,txt:'♪ '+v.title};}},
  osc(t,type,freq,dur,vol,dest,slide,cut){const a=this.a,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),t+dur);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    let n=o;if(cut){const f=a.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(cut,t);f.frequency.exponentialRampToValueAtTime(Math.max(80,cut/6),t+dur);o.connect(f);n=f;}
    n.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+.02);return g;},
  noise(t,dur,vol,freq,dest,type='highpass'){const a=this.a,s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=this.nb;
    f.type=type;f.frequency.value=freq;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(dest);s.start(t);s.stop(t+dur+.02);},
  // the synth soundtrack: one 16th-note step is scheduled on the beat grid BT.t0 + n*spb/4
  sched(){const a=this.a;if(!a||a.state!=='running'||!running||paused||BT.mode!=='synth')return;
    const s16=BT.spb/4,now=a.currentTime;if(BT.t0+this.step*s16<now-.02)this.step=Math.ceil((now-BT.t0)/s16);
    while(BT.t0+this.step*s16<now+.12){this.play(this.step,BT.t0+this.step*s16,s16);this.step++;}},
  play(n,t,spb){const s=n%16,bar=Math.floor(n/16)%4,r=this.root+[0,0,-2,-4][bar];
    if(s%4===0)this.osc(t,'sine',150,.28,.9,this.mus,38);
    if(s===4||s===12){if(this.boss)this.noise(t,.16,.5,1200,this.mus,'bandpass');else if(BT.stage!=='stage1')this.noise(t,.1,.22,2500,this.mus,'bandpass');}
    if(s%2===1)this.noise(t,.04,.18,7000,this.mus);
    const bl=[0,0,12,0,0,12,0,7,0,0,12,0,10,0,7,12][s];this.osc(t,'sawtooth',this.f(r+bl),spb*.9,.22,this.mus,0,this.boss?1800:900);
    if(s%2===0){const ar=[0,3,7,10,12,10,7,3][(s/2)%8];const g=this.osc(t,'square',this.f(r+24+ar),spb*1.6,.05,this.mus,0,3000);g.connect(this.dly);}},
  sfx(n){const a=this.a;if(!a||a.state!=='running')return;const t=a.currentTime,F=this.fx;if(n==='boom'||n==='big'||n==='phase'||n==='emp'||n==='hurt')this.duckMusic();
    switch(n){
      case'shot':this.osc(t,'square',1400,.05,.05,F,700);break;
      case'hit':this.osc(t,'square',300,.05,.06,F,150);break;
      case'boom':this.noise(t,.45,.7,400,F,'lowpass');this.osc(t,'sine',120,.4,.6,F,30);break;
      case'big':this.noise(t,1.2,.9,300,F,'lowpass');this.osc(t,'sawtooth',90,1.1,.5,F,25,800);break;
      case'pick':this.osc(t,'triangle',this.f(88),.12,.18,F);this.osc(t+.06,'triangle',this.f(95),.16,.16,F);break;
      case'graze':this.osc(t,'sine',2600,.04,.05,F,3200);break;
      case'dash':this.noise(t,.2,.35,2500,F,'bandpass');this.osc(t,'sine',300,.2,.2,F,1200);break;
      case'hurt':this.noise(t,.35,.8,900,F,'bandpass');this.osc(t,'sawtooth',220,.35,.35,F,60);break;
      case'emp':this.osc(t,'sine',60,1,.9,F,1800);this.noise(t,.9,.6,3000,F);break;
      case'warn':for(let i=0;i<3;i++){this.osc(t+i*.5,'square',this.f(81),.22,.12,F);this.osc(t+i*.5+.22,'square',this.f(76),.22,.12,F);}break;
      case'heat':this.osc(t,'sawtooth',180,.3,.2,F,90);break;
      case'up':[0,4,7,12].forEach((k,i)=>this.osc(t+i*.06,'square',this.f(72+k),.12,.08,F));break;
      case'perfect':this.osc(t,'triangle',this.f(100),.16,.2,F);this.osc(t+.05,'triangle',this.f(107),.24,.16,F);this.osc(t,'sine',this.f(112),.3,.06,F);break;
      case'phase':this.noise(t,.6,.5,500,F,'lowpass');this.osc(t,'sawtooth',this.f(52),.7,.35,F,this.f(40),900);[0,3,7].forEach((k,i)=>this.osc(t+.1+i*.1,'square',this.f(76+k),.2,.08,F));break;
    }}
};
function toggleMute(){SET.mute=!SET.mute;saveSet();AU.vol();syncSet();}

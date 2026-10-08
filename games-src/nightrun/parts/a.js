<script>
(()=>{
"use strict";
const W=960,H=540,PR=1.5;
const $=id=>document.getElementById(id);
const cv=$('game'),frame=$('frame'),stage=$('stage');
let ctx=cv.getContext('2d',{alpha:false});                              // the context everything draws on right now
const vctx=ctx;                                         // the visible canvas
let wctx=ctx,wcv=cv,VS=1;                               // world layer: portrait draws the world on its own canvas, then turns it upright; VS = visible px per HUD unit
let S=1,rotMode=false,touchUI=false;
try{touchUI=matchMedia('(pointer:coarse)').matches;}catch(e){}

const BULLET='#c6ff00';                                 // every enemy bullet: one high-contrast colour no background uses
const rnd=(a,b)=>a+Math.random()*(b-a);                 // looks only (particles, rain)
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
function mul(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let GR=Math.random,GX=Math.random;                      // gameplay dice, seeded for the daily run: GR picks waves (same every time), GX drops and refires
const gr=(a,b)=>a+GR()*(b-a),gx=(a,b)=>a+GX()*(b-a);
const gpick=a=>a[Math.floor(GR()*a.length)];
function mk(w,h){const c=document.createElement('canvas');c.width=Math.ceil(w*PR);c.height=Math.ceil(h*PR);const g=c.getContext('2d');g.scale(PR,PR);return[c,g];}
function blit(c,x,y){ctx.drawImage(c,x,y,c.width/PR,c.height/PR);}
function wtxt(s,x,y){if(wcv===cv){ctx.fillText(s,x,y);return;}ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/2);ctx.fillText(s,0,0);ctx.restore();}   // text inside the world: turned back upright in portrait

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
// every setting, its default and (in c.js) its row in the settings panel. Saved under mnr_set, applied live by applySet().
const DEFS={music:.45,sfx:.8,master:1,duck:true,mute:false,diff:'normal',auto:true,aim:false,layout:'right',sens:3,dsize:'M',win:'normal',all:false,sync:0,cue:'M',
  part:1,shake:2,flash:RM?1:2,rm:RM,hc:false,pal:'neon',q:'M',fps:60,fpsc:false};
const SET=Object.assign({},DEFS,load('mnr_set',{}));
if(!SET.v3){SET.v3=1;if(SET.guide===false)SET.cue='off';if(SET.reduce){SET.rm=true;SET.flash=1;}SET.part=1;SET.music=Math.min(SET.music,.45);   // older saves: calm visuals everywhere, music under the effects
  if(load('mnr_hard',false))SET.diff='hard';delete SET.guide;delete SET.calm;delete SET.reduce;delete SET.mv2;}
SET.mute=load('mnr_mute',false);
function deriveSet(){SET.calm=SET.part<2;SET.reduce=!!SET.rm||SET.flash<2;}deriveSet();   // calm = fewer sparks; reduce = no strobing blinks
const saveSet=()=>{deriveSet();save('mnr_set',SET);save('mnr_mute',SET.mute);};
const SIM=/[?&]sim=1/.test(location.search);            // test switch: no audio context at all, the page is stepped by hand (__mnr.step)
const NOMUSIC=SIM||/[?&]nomusic=1/.test(location.search);   // test switch: no song files, synth only
try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(e){}   // iOS: Web Audio ignores the silent switch only in the 'playback' session
const FX=()=>[0,.25,1][SET.flash];                      // strength of screen flashes (settings: Flashing off / reduced / full)

/* ---------- beat clock ---------- */
// Everything rhythmic reads this one clock. Beat 0 sits at BT.t0+BT.off on the music clock. The clock is the AudioContext's
// currentTime when audio runs, and a plain game-time counter (fbT) when it does not, so the game also works silent.
const DEF_BPM={menu:100,stage1:120,stage2:128,stage3:128,boss:140,boss2:140,endless:132,endless2:132};
const barQ=s=>Math.max(1,Math.round(s/(4*BT.spb)))*4*BT.spb*.97;   // seconds -> whole bars
/* A district lasts as long as its song: SONGM (parts/songs.js, made by analysis/song-energy.py) has every song's length in bars and its loudness per bar.
   A song that was decoded in this page wins over the table (same bpm and offset), so a replaced mp3 still sets the length. The boss comes in the last 32 bars. */
const MINSHOT=190;                                          // an enemy never fires at a ship closer than this, or closer than its bullet travels in .85 s (about a second to react)
const BOSS_BARS=32,MINI_BARS=14,BOSS_MIN_BAR=32;
function songBars(stage){const m=SONGM[stage],t=TR.by[stage];
  if(t){const b=TR.bufs[t.file];if(b&&b.duration>5)return Math.max(16,Math.floor((b.duration-t.offsetMs/1000)/(240/t.bpm)));
    if(m&&m.bpm===t.bpm&&m.off===t.offsetMs)return m.bars;if(m)return Math.max(16,Math.floor((m.dur-t.offsetMs/1000)/(240/t.bpm)));}
  return m?m.bars:72;}
function songEnergy(stage,bar){const m=SONGM[stage];if(!m)return .6+.3*Math.sin(bar*.8);const n=m.e.length,i=Math.max(0,Math.floor(bar))%n;return(+m.e[i])/9;}
const BT={bpm:100,spb:.6,t0:0,off:0,stage:'',mode:'none',rev:0,src:0,lastRaw:0,pend:null,title:''};
let fbT=0;
/* ---------- hooks for add-on parts: NR.on(evt,fn) / NR.emit(evt,data); events: beat, bar, perfect, kill, districtEnd, runEnd, runStart ---------- */
const NR=window.NR={_h:{},sw:[],on(e,f){(this._h[e]=this._h[e]||[]).push(f);},emit(e,d){const l=this._h[e];if(l)for(const f of l){try{f(d);}catch(x){}}},
  music:{rate:1,   // tempo change: song playbackRate and the beat length scale together, the beat position stays continuous
    setRate(x){x=Math.max(.5,Math.min(2,+x||1));const old=this.rate;if(x===old)return;mnow();if(BT.pend&&BT.pend.sw)AU.cancelSwitch();   // a tempo change moves the bar lines: drop the scheduled song change, it is planned again
    const p=bpos();this.rate=x;
      BT.spb=BT.spb*old/x;BT.t0=audible()-BT.off-p*BT.spb;if(BT.pend)BT.pend.v.spb*=old/x;
      AU.setRate(x);},
    pos(){const c=AU.cur;return c&&c.playing?c.el.currentTime:0;},dur(){const c=AU.cur;return c?c.D:0;}}};   // pos / dur: where the playing song is and how long it is (seconds)
NR.audioMem=()=>({streams:AU.slots?AU.slots.filter(s=>s.file).length:0,decodedMB:0});
NR.mod=Object.assign({win:0,mag:140,pw:1},NR.mod||{});   // tuning numbers add-ons may change (wider PERFECT window in ms, pickup pull radius, power-up duration factor)
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
  BT.lastRaw=raw;if(BT.pend&&raw>=BT.pend.at){const pv=BT.pend,ob={stage:BT.stage,t0:BT.t0,off:BT.off,spb:BT.spb};Object.assign(BT,pv.v);BT.rev++;BT.pend=null;AU.step=0;
    if(pv.sw){NR.sw.push({from:ob.stage,to:BT.stage,at:pv.at,lag:raw-pv.at,oldBeat:(pv.at-ob.t0-ob.off)/ob.spb,newBeat:(pv.at-BT.t0-BT.off)/BT.spb,spbOld:ob.spb,spbNew:BT.spb,dbg:pv.dbg,ob});NR.emit('songSwitch',NR.sw[NR.sw.length-1]);}if(BT.mode==='file'&&BT.title&&G&&G.live)G.note={t:4,txt:'\u266a '+BT.title};}
  return raw;}
function audible(ts){                                    // music-clock seconds that the player hears at wall time ts (default: now)
  if(SIM){mnow();return fbT+SET.sync/1000;}
  const a=AU.a;mnow();const p=ts>0?ts:performance.now();
  if(BT.src&&a){if(a.state!=='running')return a.currentTime-(a.outputLatency||0)+SET.sync/1000;return(p+CK.d)/1000-(a.outputLatency||0)+SET.sync/1000;}
  return fbT-(performance.now()-p)/1000+SET.sync/1000;}
const bpos=ts=>(audible(ts)-BT.t0-BT.off)/BT.spb;       // beats since beat 0
const WINS={tight:70,normal:110,loose:160};
const winMs=()=>(WINS[SET.win]||110)+NR.mod.win;         // half-width of the on-beat window in ms
function judge(ts){const p=bpos(ts),n=Math.round(p),dt=(p-n)*BT.spb*1000;return{ok:(SET.all||Math.abs(dt)<=winMs())&&p>-.3,dt,beat:n};}
const fireIn=s=>Math.max(1,Math.round(s*BT.bpm/60));    // seconds -> whole beats at the current tempo

/* ---------- tracks: streamed, never decoded ----------
   The mp3 file is downloaded once into a blob (3-5 MB, compressed) and given to the element, so seeking and looping never wait for the network and servers without Range support work.
   A song is an <audio> element (one of 5 pooled slots, see AU.slotFor) played through a MediaElementAudioSourceNode, so the browser streams and decodes it a little at a time
   (a 3 MB mp3 in memory instead of 60-100 MB of PCM, and no 100-300 ms main-thread stall when a song ends). TR.bufs[file] is the slot once the file is fully buffered. */
const TR={by:{},bufs:{},busy:{},bad:{},list:[]};
function normTrack(t){if(!t||typeof t.file!=='string'||!DEF_BPM[t.stage])return null;const bpm=+t.bpm;return{file:t.file,bpm:bpm>=40&&bpm<=300?bpm:DEF_BPM[t.stage],offsetMs:+t.offsetMs||0,gapMs:t.gapMs>=0&&t.gapMs<200?+t.gapMs:24,title:String(t.title||'').slice(0,40),stage:t.stage};}
try{if(location.protocol!=='file:'&&(!NOMUSIC||SIM))fetch('music/tracks.json',{cache:'no-cache'}).then(r=>r.ok?r.json():null).then(j=>{if(!j)return;const arr=Array.isArray(j)?j:Array.isArray(j.tracks)?j.tracks:[];
  for(const t of arr){const n=normTrack(t);if(n&&!TR.by[n.stage]){TR.by[n.stage]=n;TR.list.push(n);}}
  if(AU.a&&!running)AU.menuMusic();}).catch(()=>{});}catch(e){}
const slotReady=s=>{const e=s.el;if(!s.blob||!e||e.readyState<4||!(e.duration>0)||!isFinite(e.duration))return false;s.D=e.duration;
  s.full=true;s.seek=e.seekable.length>0&&e.seekable.end(e.seekable.length-1)>=s.D-1;return true;};      // the file is in memory (a 3-5 MB blob) and the element can play it through
async function loadTrack(stage){const info=TR.by[stage];if(!info||TR.bufs[info.file]||TR.busy[info.file]||TR.bad[info.file]||!AU.a)return;
  const s=AU.slotFor(info);if(!s)return;                          // every slot is playing or wanted: the pump asks again
  TR.busy[info.file]=1;
  try{await new Promise((ok,no)=>{const t0=performance.now(),el=s.el,iv=setInterval(()=>{if(s.file!==info.file){clearInterval(iv);no('evicted');}else if(s.err||el.error){clearInterval(iv);no('error');}
      else if(slotReady(s)){clearInterval(iv);ok();}else if(performance.now()-t0>60000){clearInterval(iv);no('timeout');}},80);});
    TR.bufs[info.file]=s;AU.trackReady(stage);}
  catch(e){if(e!=='evicted'){TR.bad[info.file]=1;AU.freeSlot(s);}}
  TR.busy[info.file]=0;}

/* ---------- latency test (settings): clicks on the audio clock, the player taps, the median lateness becomes the Audio sync ---------- */
const CAL={on:false,dom:0,t0:0,per:.5,next:0,taps:[],need:8,done:null,last:null};
const calNow=()=>audible()-SET.sync/1000;                // the clock the clicks are on, as heard (without the correction we are measuring)
function calStart(){mnow();CAL.dom=BT.src?1:0;CAL.t0=calNow()+.9;CAL.next=0;CAL.taps=[];CAL.done=null;CAL.last=null;CAL.on=true;}
function calStop(){CAL.on=false;}
function calTap(ts){if(!CAL.on)return null;const h=audible(ts>0?ts:undefined)-SET.sync/1000,i=Math.round((h-CAL.t0)/CAL.per);if(i<0)return null;
  const d=(h-(CAL.t0+i*CAL.per))*1000;if(Math.abs(d)>180){CAL.last='off';return d;}                    // way off: not a tap at the click
  CAL.taps.push(d);CAL.last=d;
  if(CAL.taps.length>=CAL.need){const a=CAL.taps.slice().sort((x,y)=>x-y),med=(a[3]+a[4])/2;SET.sync=clamp(Math.round(-med/5)*5,-150,150);saveSet();CAL.done=SET.sync;CAL.on=false;}
  return d;}

/* ---------- audio ---------- */
const silentWav=(()=>{let u=null;return()=>{if(u)return u;try{const n=1600,b=new Uint8Array(44+n),dv=new DataView(b.buffer),w=(o,t)=>{for(let i=0;i<t.length;i++)b[o+i]=t.charCodeAt(i);};w(0,'RIFF');dv.setUint32(4,36+n,true);w(8,'WAVEfmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,1,true);dv.setUint32(24,8000,true);dv.setUint32(28,8000,true);dv.setUint16(32,1,true);dv.setUint16(34,8,true);w(36,'data');dv.setUint32(40,n,true);b.fill(128,44);
  u=URL.createObjectURL(new Blob([b],{type:'audio/wav'}));}catch(e){u='data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YQAAAAA=';}return u;};})();   // 0.2 s of silence: unlocks an <audio> slot inside a tap
const AU={lat:.03,a:null,m:null,mus:null,fb:null,musv:null,sfxv:null,fx:null,step:0,root:45,boss:false,cur:null,hold:false,rUntil:0,
  init(){if(this.a||SIM)return;try{const a=this.a=new (window.AudioContext||window.webkitAudioContext)();
    this.m=a.createGain();this.m.connect(a.destination);
    this.cutg=a.createGain();this.cutg.connect(this.m);                                     // the Drop power-up cuts the music here
    this.duck=a.createGain();this.duck.connect(this.cutg);                                     // music dips briefly under big effects
    this.musv=a.createGain();this.musv.connect(this.duck);
    this.mus=a.createGain();this.mus.gain.value=.34;this.mus.connect(this.musv);          // synth soundtrack
    this.fb=a.createGain();this.fb.gain.value=.9;this.fb.connect(this.musv);               // music files
    this.sfxv=a.createGain();this.sfxv.connect(this.m);
    this.fx=a.createGain();this.fx.gain.value=.5;this.fx.connect(this.sfxv);
    const d=a.createDelay();d.delayTime.value=.38;const fb=a.createGain();fb.gain.value=.33;const lp=a.createBiquadFilter();lp.frequency.value=2200;
    d.connect(lp);lp.connect(fb);fb.connect(d);lp.connect(this.mus);this.dly=d;
    const len=Math.floor(a.sampleRate*.5),b=a.createBuffer(1,len,a.sampleRate),dd=b.getChannelData(0);for(let i=0;i<len;i++)dd[i]=Math.random()*2-1;this.nb=b;
    this.slots=[];try{for(let i=0;i<5;i++)this.slots.push(this.mkSlot());}catch(e){this.slots=[];}
    this.vol(true);setInterval(()=>this.sched(),25);
    a.addEventListener&&a.addEventListener('statechange',()=>{if(a.state==='suspended'&&!this.hold&&!document.hidden)a.resume().catch(()=>{});else if(a.state==='running'&&!this.hold)this.kickAll();});}catch(e){this.a=null;}},
  // iOS: must run inside touchend/click/keydown. Resume synchronously, start a silent buffer in the same gesture, and (without audioSession) play a silent <audio> so the ring switch does not mute us.
  unlock(){if(!this.a)this.init();const a=this.a;if(!a)return;
    if(a.state!=='running'&&!this.hold){try{const p=a.resume();if(p&&p.catch)p.catch(()=>{});}catch(e){}}
    if(a.state!=='running'){try{const b=a.createBuffer(1,1,22050),s=a.createBufferSource();s.buffer=b;s.connect(a.destination);s.start(0);}catch(e){}}   // silent unlock sound inside the gesture
    if(!navigator.audioSession&&!this.sil){try{const h=new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAABErAAABAAgAZGF0YQAAAAA=');h.loop=true;h.volume=.01;h.setAttribute('playsinline','');this.sil=h;const q=h.play();if(q&&q.catch)q.catch(()=>{this.sil=null;});}catch(e){}}
    this.unlockSlots();
    if(!running&&!BT.stage)this.menuMusic();},
  duckMusic(){const a=this.a;if(!a||!this.duck||!SET.duck)return;const t=a.currentTime,g=this.duck.gain;g.cancelScheduledValues(t);g.setTargetAtTime(.7,t,.012);g.setTargetAtTime(1,t+.3,.15);},
  vol(now){if(!this.a)return;const t=this.a.currentTime,k=now?0:.02;
    this.m.gain.setTargetAtTime(SET.mute?0:.55*SET.master,t,k||.001);this.musv.gain.setTargetAtTime(SET.music,t,k||.001);this.sfxv.gain.setTargetAtTime(SET.sfx,t,k||.001);},
  suspend(){this.hold=true;const a=this.a;for(const s of this.slots||[])if(s.playing&&!s.el.paused){s.heldPlay=true;try{s.el.pause();}catch(e){}}   // the songs keep their place
    if(a&&a.state==='running')a.suspend().catch(()=>{});},
  resume(){this.hold=false;this.rUntil=performance.now()+700;const a=this.a;if(a&&a.state!=='running')a.resume().catch(()=>{});this.kickAll();},
  f(n){return 440*Math.pow(2,(n-69)/12);},
  menuMusic(){if(TR.by.menu){if(BT.stage!=='menu')this.startStage('menu');loadTrack('menu');}else if(BT.stage!==''&&BT.stage!=='menu')this.startStage('menu');},
  trackReady(stage){const info=TR.by[stage];if(!info||!this.a)return;
    if(BT.stage===stage&&BT.mode!=='file'&&!BT.pend&&!this.want){const spb4=BT.spb*4,now=mnow(),fo=info.offsetMs/1000;let at=now+.1+fo;   // the file starts fo early so its first beat lands on the bar line
      if(BT.mode==='synth')at=BT.t0+Math.ceil((now+.15+fo-BT.t0)/spb4)*spb4;this.startStage(stage,at);}},
  // switch to the music of a stage: the streamed song if it is ready, otherwise the built-in synth grid at that stage's tempo
  startStage(stage,at){const a=this.a,info=TR.by[stage],S=a&&info&&TR.bufs[info.file];if(!at){this.want=null;this.wantT=0;this.intense(false);}
    if(!a){const bpm=info?info.bpm:DEF_BPM[stage];Object.assign(BT,{stage,mode:stage==='menu'?'none':'synth',bpm,spb:60/bpm,off:0,t0:fbT+.08,title:'',pend:null});BT.rev++;return;}   // no audio at all: the beat still runs, silently
    if(info)loadTrack(stage);
    const now=mnow(),t=at||now+.12,ctxT=a.currentTime+(t-now);
    const c=this.cur;if(c&&c!==S){c.stopAt=Math.max(a.currentTime,ctxT)+1;try{c.g.gain.setTargetAtTime(0,Math.max(a.currentTime,ctxT-.05),.12);}catch(e){}}
    this.cur=null;
    const v={stage};
    if(S){const off=info.offsetMs/1000,rate=NR.music.rate,g=S.g.gain;g.cancelScheduledValues(0);g.setValueAtTime(0,a.currentTime);S.stage=stage;
      if(at){g.setValueAtTime(0,Math.max(a.currentTime,ctxT-.25));g.linearRampToValueAtTime(1,ctxT);}else{g.setValueAtTime(0,ctxT);g.linearRampToValueAtTime(1,ctxT+.25);}
      this.strGo(S,ctxT,at?off:0,!at);this.cur=S;   // with a start time the song's first beat lands on that bar line (it is started early, silent, at the matching place in the file)
      Object.assign(v,{mode:'file',bpm:info.bpm,spb:60/info.bpm/rate,off,t0:t-off-((at?off:0)-off)/rate,title:info.title});}
    else if(stage==='menu'){Object.assign(v,{mode:'none',bpm:100,spb:.6,off:0,t0:t,title:''});}
    else{const bpm=info?info.bpm:DEF_BPM[stage];Object.assign(v,{mode:'synth',bpm,spb:60/bpm/NR.music.rate,off:0,t0:t,title:''});}
    if(at){BT.pend={at:t,v};}
    else{Object.assign(BT,v);BT.rev++;BT.pend=null;this.step=0;if(v.mode==='file'&&v.title&&G&&G.live)G.note={t:4,txt:'♪ '+v.title};}},
  // Song change inside a run: wait for a bar line of the current song, then crossfade over one bar. The new song starts so that its first beat
  // lands exactly on that bar line, so the beat grid never jumps. NR.sw logs every change (old/new beat position at the switch; both must be whole bars).
  switchTo(stage){const a=this.a;this.want=stage;
    if(!a||!running||BT.mode==='none'||BT.src!==1||a.state!=='running'){this.want=null;if(BT.stage!==stage)this.startStage(stage);return;}
    if(BT.pend)return;                                    // sched() asks again once the pending change has landed
    if(BT.stage===stage){this.want=null;return;}
    const info=TR.by[stage];
    if(info&&!TR.bufs[info.file]&&!TR.bad[info.file]){loadTrack(stage,1);if(!this.wantT)this.wantT=performance.now()+4000;if(performance.now()<this.wantT)return;}   // still loading: keep the current song
    this.wantT=0;this.want=null;this.xfade(stage);},
  xfade(stage){const a=this.a,info=TR.by[stage],S=info&&TR.bufs[info.file],now=mnow(),rate=NR.music.rate,bar=4*BT.spb,ctxOf=t=>a.currentTime+(t-now);
    const tb=BT.t0+BT.off+Math.ceil((now+bar+.08-BT.t0-BT.off)/bar)*bar;   // first bar line at least one bar + 80 ms away
    const v={stage},CIN=new Float32Array(32),COUT=new Float32Array(32);for(let i=0;i<32;i++){CIN[i]=Math.sin(i/31*Math.PI/2);COUT[i]=Math.cos(i/31*Math.PI/2);}
    let xf=bar;
    if(S){const off=info.offsetMs/1000,g=S.g.gain;S.stage=stage;g.cancelScheduledValues(0);g.setValueAtTime(0,a.currentTime);
      // the new song is started now, silent, at the place in its file that reaches the first beat exactly on the bar line; it fades in over the bar before it
      this.strGo(S,ctxOf(tb),off,false);
      const w=ctxOf(tb-bar),fs=S.seek?Math.max(w,a.currentTime+.01):ctxOf(tb)-off/rate-.2,fd=ctxOf(tb)-(S.seek?0:off/rate)-fs;
      if(fd>.05)g.setValueCurveAtTime(CIN,fs,fd);else g.setValueAtTime(1,fs);
      Object.assign(v,{mode:'file',bpm:info.bpm,spb:60/info.bpm/rate,off,t0:tb-off,title:info.title});this.nxt=S;}
    else{const bpm=info?info.bpm:DEF_BPM[stage];Object.assign(v,{mode:'synth',bpm,spb:60/bpm/rate,off:0,t0:tb,title:''});xf=BT.spb;this.nxt=null;}
    const c=this.cur;this.prev=c;
    if(c&&c.playing){try{const g=c.g.gain,t1=ctxOf(tb-xf);g.cancelScheduledValues(t1);g.setValueAtTime(1,t1);g.setValueCurveAtTime(COUT,t1,xf);c.stopAt=ctxOf(tb)+.1;}catch(e){}}
    this.cur=this.nxt;BT.pend={at:tb,v,sw:1,dbg:{t0:BT.t0,off:BT.off,spb:BT.spb,now,mode:BT.mode,stage:BT.stage}};},
  cancelSwitch(){const a=this.a,p=BT.pend;if(!p||!p.sw)return;this.want=p.v.stage;
    try{const t=a.currentTime;if(this.nxt){this.nxt.g.gain.cancelScheduledValues(0);this.nxt.g.gain.setValueAtTime(0,t);this.nxt.stopAt=t;this.nxt.startFn=null;}
      const c=this.prev;if(c){c.g.gain.cancelScheduledValues(0);c.g.gain.setValueAtTime(1,t);c.stopAt=0;this.cur=c;}}catch(e){}
    BT.pend=null;},
  /* ---- stream slots: 5 pooled <audio> elements, each wired to the music bus once. Pooled because iOS lets an element play from code only after it was
     started inside a tap once; unlockSlots() does that for all of them in the first tap, and later a slot just gets another src. ---- */
  mkSlot(){const a=this.a,el=new Audio();el.preload='auto';el.loop=true;el.setAttribute('playsinline','');el.setAttribute('webkit-playsinline','');
    for(const k of['preservesPitch','webkitPreservesPitch','mozPreservesPitch'])try{if(k in el)el[k]=false;}catch(e){}   // tempo changes bend the pitch, as they did with a buffer source
    const node=a.createMediaElementSource(el),g=a.createGain();g.gain.value=0;node.connect(g);g.connect(this.fb);
    const s={el,src:el,node,g,file:null,stage:'',info:null,blob:null,D:0,full:false,seek:false,err:0,tLoad:0,unlocked:false,playing:false,get duration(){return this.D;}};
    el.addEventListener('error',()=>{s.err=1;});this.slotReset(s);return s;},
  slotReset(s){Object.assign(s,{m0:undefined,steer:0,loops:0,last:0,phase:'',hist:[],applied:0,ctx0:0,pos0:0,uPlay:0,stopAt:0,kickT:0,heldPlay:false,startFn:null,startAt:0});},
  slotFor(info){let s=this.slots.find(x=>x.file===info.file);if(s)return s;
    const used=x=>x===this.cur||x===this.nxt||x===this.prev||x.playing||x.heldPlay||(BT.pend&&BT.pend.v.stage===x.stage);
    s=this.slots.find(x=>!x.file)||this.slots.find(x=>!used(x)&&!(TR.keepFn&&TR.keepFn(x.file)));
    if(!s)return null;
    this.freeSlot(s);s.file=info.file;s.stage=info.stage;s.info=info;s.tLoad=performance.now();s.err=0;
    fetch(new URL('music/'+info.file,location.href),{cache:'force-cache'}).then(r=>r.ok?r.blob():Promise.reject(0)).then(b=>{if(s.file!==info.file)return;s.blob=URL.createObjectURL(b);s.el.src=s.blob;try{s.el.load();}catch(e){}}).catch(()=>{if(s.file===info.file)s.err=1;});
    return s;},
  freeSlot(s){if(s.file)delete TR.bufs[s.file];try{s.el.pause();}catch(e){}try{s.g.gain.cancelScheduledValues(0);s.g.gain.value=0;}catch(e){}
    this.slotReset(s);s.playing=false;if(s.file){s.el.removeAttribute('src');try{s.el.load();}catch(e){}}if(s.blob){try{URL.revokeObjectURL(s.blob);}catch(e){}s.blob=null;}s.file=null;s.stage='';s.info=null;s.D=0;s.full=false;},
  unlockSlots(){for(const s of this.slots||[]){if(s.playing&&s.el.paused&&!this.hold){this.kick(s);continue;}
      if(s.unlocked||s.playing)continue;s.unlocked=true;const el=s.el;
      try{if(!s.file)el.src=silentWav();const q=el.play(),done=()=>{if(!s.playing){try{el.pause();}catch(e){}if(!s.file)el.removeAttribute('src');}};if(q&&q.then)q.then(done,done);}catch(e){}}},
  kick(s){s.kickT=performance.now();try{const q=s.el.play();if(q&&q.catch)q.catch(()=>{s.kickT=0;});}catch(e){}s.phase='wait';s.uPlay=s.el.currentTime;s.hist.length=0;},
  kickAll(){for(const s of this.slots||[])if(s.playing&&s.el.paused&&!s.startFn){s.heldPlay=false;this.kick(s);}},
  // start the song in slot s so that file position pAtB (seconds) is heard at AudioContext time tB. imm: start at pAtB itself right now (a fresh start).
  // Otherwise it is started now, silent, early enough: at pAtB - (tB - now) * rate, wrapping round the end of the file (the pre-roll is the file's tail).
  // The element cannot be scheduled sample-exactly, so (ctx0, pos0) is the plan and strSync() measures how far the real playback is from it.
  strGo(s,tB,pAtB,imm){const a=this.a,el=s.el,rate=NR.music.rate,D=s.D||el.duration||1;let ctx0,p,gp=0;
    if(imm||!s.seek){ctx0=tB-pAtB/rate;p=0;if(imm){ctx0=tB;p=pAtB;}}
    else{ctx0=a.currentTime+this.lat;p=pAtB-(tB-ctx0)*rate;if(p<0){gp=(s.info?s.info.gapMs:24)/1000;p+=gp*rate;}p=((p%D)+D)%D;}   // a pre-roll that wraps round the end of the file loses gapMs when the element loops (mp3 padding): start that much later in the file.  lat: how long an element takes from play() to its first sound here (learned, see strSync)
    this.slotReset(s);Object.assign(s,{ctx0,pos0:p,phase:'wait',playing:true,uPlay:p,last:p,gapPlan:gp});
    const go=()=>{s.kickT=performance.now();s.tCall=a.currentTime;try{if(Math.abs(el.currentTime-p)>.02)el.currentTime=p;}catch(e){}el.playbackRate=rate;s.last=p;s.uPlay=p;
      try{const q=el.play();if(q&&q.catch)q.catch(()=>{s.kickT=0;});}catch(e){}};
    if(!s.seek&&!imm){s.startAt=ctx0-.04;s.startFn=go;}else go();},
  setRate(x){const a=this.a;for(const s of this.slots||[])if(s.playing){s.el.playbackRate=x;if(!s.startFn&&!s.el.paused&&s.phase!=='wait'){s.ctx0=a.currentTime;s.pos0=s.el.currentTime+s.loops*s.D;s.applied=0;s.hist.length=0;}}},
  // every 25 ms: start delayed songs, stop faded ones, keep the playing ones playing, and pull the beat grid onto what the element really plays
  strTick(a){const pn=performance.now(),ct=a.currentTime,run=a.state==='running'&&!this.hold;
    for(const s of this.slots){
      if(s.startFn&&run&&ct>=s.startAt){const f=s.startFn;s.startFn=null;f();}
      if(s.stopAt&&ct>=s.stopAt){s.stopAt=0;s.playing=false;s.phase='';try{s.el.pause();s.g.gain.cancelScheduledValues(0);s.g.gain.value=0;}catch(e){}continue;}
      if(!s.playing||!run||s.startFn)continue;
      if(s.el.paused){if(pn-s.kickT>600)this.kick(s);continue;}
      this.strSync(s,a,pn);}},
  strSync(s,a,pn){const el=s.el;if(el.seeking||el.readyState<2)return;
    const e=el.currentTime,D=s.D||el.duration;if(e<s.last-D*.5){s.loops++;const pl=s.gapPlan||0,ge=(s.info?s.info.gapMs:24)/1000;s.gapAt={pre:s.hist.length>=6?s.hist.slice(-8):null,post:[],pl};s.hist.length=0;
      if(pl){s.ctx0+=pl;s.gapPlan=0;}                                   // a planned pre-roll wrap: the gap was expected, the grid does not move
      else{const tg=BT.pend&&s===this.cur?BT.pend.v:BT.stage===s.stage?BT:null;if(tg){tg.t0+=ge;s.applied+=ge;}}}   // a loop of the playing song: the music restarts one gap later, and so does the grid
    s.last=e;
    const u=e+s.loops*D,rate=NR.music.rate,pend=BT.pend&&s===this.cur;
    if(s.phase==='wait'){if(u-s.uPlay>.03){s.phase='acq';s.acqT=pn+700;s.hist.length=0;}else return;}   // not playing yet
    const dd=(a.currentTime-s.ctx0)-(u-s.pos0)/rate;s.hist.push(dd);if(s.hist.length>40)s.hist.shift();
    const ga=s.gapAt;if(ga){ga.post.push(dd);if(ga.post.length>=10){s.gapAt=null;const md=x=>x.slice().sort((p,q)=>p-q)[x.length>>1];   // how long did the loop really pause? learn it for the next fade-in from the tail
      if(ga.pre&&s.info){const g=md(ga.post.slice(2))-md(ga.pre)+ga.pl;if(g>=0&&g<.2)s.info.gapMs=Math.round(s.info.gapMs*.4+g*1000*.6);}}}
    if(s.hist.length<(pend?6:3))return;
    const m=s.hist.slice().sort((x,y)=>x-y)[s.hist.length>>1];
    if(pend){                                                          // the incoming song, started early and silent: the grid keeps the plan (its first beat on the bar line),
      const tl=BT.pend.at-a.currentTime;                                // the song is steered onto the plan by playing a hair faster (the pitch moves a little while it is still quiet)
      if(s.m0===undefined){s.m0=m;if(s.tCall)this.lat=Math.max(0,Math.min(.3,this.lat*.6+.4*(s.ctx0+m-s.tCall)));s.tCall=0;}   // how late did it really start? remembered for the next start
      let r=rate;if(tl>.3&&Math.abs(m)>.003){r=rate+m*rate/tl;r=Math.max(rate*.88,Math.min(rate*1.12,r));s.steer=1;}
      if(Math.abs(el.playbackRate-r)>1e-4)el.playbackRate=r;s.drift=m;return;}
    if(s.steer){s.steer=0;el.playbackRate=rate;}
    let ap;if(s.phase==='acq'){ap=m;if(pn>s.acqT){s.phase='track';if(s.tCall)this.lat=Math.max(0,Math.min(.3,this.lat*.6+.4*(s.ctx0+m-s.tCall)));s.tCall=0;}}                                  // first 700 ms of playing (and after a resume): take the measured start at once
    else{const er=m-s.applied,lim=Math.abs(er)>.03?.004:.001,st=er*.12;ap=s.applied+(st<-lim?-lim:st>lim?lim:st);}   // later: follow it smoothly (at most 1 ms a tick = 4% speed, 4 ms when far off)
    const dl=ap-s.applied;if(!dl)return;s.applied=ap;s.drift=m;
    const tg=BT.pend&&s===this.cur?BT.pend.v:BT.stage===s.stage?BT:null;if(tg)tg.t0+=dl;},   // the incoming song moves the grid that is waiting for it, the playing one moves the live grid
  intense(on){on=!!on;if(this.int===on)return;this.int=on;const a=this.a;if(!a||!this.fb)return;const t=a.currentTime;
    this.fb.gain.cancelScheduledValues(t);this.fb.gain.setTargetAtTime(on?1.15:.9,t,.5);this.mus.gain.setTargetAtTime(on?.42:.34,t,.5);},
  // extra drum layer under a stage song while a mini-boss is up (kick on every beat, hats, snare accents), on the same grid
  isched(a){const s16=BT.spb/4,t0=BT.t0+BT.off,now=a.currentTime;
    if(this.irev!==BT.rev||this.istep===undefined){this.irev=BT.rev;this.istep=Math.ceil((now-t0)/s16);}
    if(t0+this.istep*s16<now-.02)this.istep=Math.ceil((now-t0)/s16);
    while(t0+this.istep*s16<now+.12){const n=this.istep,t=t0+n*s16,s=((n%16)+16)%16;
      if(s%4===0)this.osc(t,'sine',150,.22,.5,this.mus,40);
      if(s%4===2)this.noise(t,.035,.15,8000,this.mus);
      if(s===4||s===12)this.noise(t,.11,.28,1600,this.mus,'bandpass');
      this.istep++;}},
  // power layers: every tier of the meter adds a part on the same grid (2: hats, 3: kick + clap, 4: pulsing bass line)
  tier:1,
  tlsched(a){const s16=BT.spb/4,t0=BT.t0+BT.off,now=a.currentTime,T=this.tier;
    if(this.trev!==BT.rev||this.tstep===undefined){this.trev=BT.rev;this.tstep=Math.ceil((now-t0)/s16);}
    if(t0+this.tstep*s16<now-.02)this.tstep=Math.ceil((now-t0)/s16);
    while(t0+this.tstep*s16<now+.12){const n=this.tstep,t=t0+n*s16,s=((n%16)+16)%16;
      if(s%2===0)this.noise(t,.03,.08+.02*T,9000,this.mus);
      if(T>=3){if(s%4===0&&!this.int)this.osc(t,'sine',150,.2,.4,this.mus,40);if(s===4||s===12)this.noise(t,.09,.2,1800,this.mus,'bandpass');}
      if(T>=4&&s%2===0)this.osc(t,'square',this.f(this.root+12+[0,7,12,7][(s/2)%4]),.11,.05,this.mus,0,2400);
      this.tstep++;}},
  calsched(a){if(!CAL.on||CAL.dom!==1)return;const now=a.currentTime;                                  // latency test: a click every half second on the audio clock
    while(CAL.t0+CAL.next*CAL.per<now+.12){const t=CAL.t0+CAL.next*CAL.per;if(t>=now-.02)this.osc(t,'square',1500,.05,.18,this.fx,900);CAL.next++;}},
  osc(t,type,freq,dur,vol,dest,slide,cut){const a=this.a,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);
    if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),t+dur);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.005);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    let n=o;if(cut){const f=a.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(cut,t);f.frequency.exponentialRampToValueAtTime(Math.max(80,cut/6),t+dur);o.connect(f);n=f;}
    n.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+.02);return g;},
  noise(t,dur,vol,freq,dest,type='highpass'){const a=this.a,s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=this.nb;
    f.type=type;f.frequency.value=freq;g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(dest);s.start(t);s.stop(t+dur+.02);},
  // the synth soundtrack: one 16th-note step is scheduled on the beat grid BT.t0 + n*spb/4
  sched(){const a=this.a;if(a&&this.slots)this.strTick(a);if(a&&CAL.on&&a.state==='running')this.calsched(a);if(a&&this.want&&running&&!paused)this.switchTo(this.want);
    if(!a||a.state!=='running'||!running||paused)return;
    if(BT.mode==='synth'&&!BT.pend&&!this.want&&TR.by[BT.stage]&&TR.bufs[TR.by[BT.stage].file])this.trackReady(BT.stage);   // the song file arrived while a switch was pending: swap it in on the next bar
    if(this.int&&BT.mode==='file')this.isched(a);
    if(this.tier>1&&BT.mode!=='none')this.tlsched(a);
    if(BT.mode!=='synth')return;
    const s16=BT.spb/4,now=a.currentTime;if(BT.t0+this.step*s16<now-.02)this.step=Math.ceil((now-BT.t0)/s16);
    const quiet=TR.list.length>0&&!/[?&]synth=1/.test(location.search);   // owner: never the old synth tune when real songs exist; the beat grid keeps running silently until the song is in
    while(BT.t0+this.step*s16<now+.12){if(!quiet)this.play(this.step,BT.t0+this.step*s16,s16);this.step++;}},
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
      case'tier':[0,4,7,12,16].forEach((k,i)=>this.osc(t+i*.045,'triangle',this.f(84+k),.14,.12,F));break;
      case'perfect':this.osc(t,'triangle',this.f(100),.16,.2,F);this.osc(t+.05,'triangle',this.f(107),.24,.16,F);this.osc(t,'sine',this.f(112),.3,.06,F);break;
      case'phase':this.noise(t,.6,.5,500,F,'lowpass');this.osc(t,'sawtooth',this.f(52),.7,.35,F,this.f(40),900);[0,3,7].forEach((k,i)=>this.osc(t+.1+i*.1,'square',this.f(76+k),.2,.08,F));break;
    }}
};
function toggleMute(){SET.mute=!SET.mute;saveSet();AU.vol();syncSet();}

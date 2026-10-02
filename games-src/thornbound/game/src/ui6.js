// ===================== part 6: sound, phone layout, boot, test hooks =====================
const SFXMAP={tap:'click',place:'place',flip:'flip',clash:'clash',win:'win',tie:'clash',inf:'influence',herald:'herald',bid:'bid',bell:'bell',fanfare:'fanfare',lose:'lose',err:'error'};
let _ac=null;
function synth(name){try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;_ac=_ac||new AC();const c=_ac,o=c.createOscillator(),g=c.createGain();const f={tap:520,place:180,flip:400,clash:120,win:660,tie:300,inf:880,herald:260,bid:440,bell:330,fanfare:550,lose:150,err:100}[name]||400;
  o.frequency.value=f;o.type=name==='clash'?'sawtooth':'triangle';g.gain.setValueAtTime(.05,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.18);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.2)}catch(e){}}
function sfx(name){if(!UI.sound)return;const n=SFXMAP[name]||name;try{if(window.GA&&GA.has(n)){GA.play(n,{duck:['win','fanfare','clash','bell'].includes(n)});return}}catch(e){}synth(name)}
let _lastInf=null;
function snd(mv,res){if(!mv)return;const t=mv.t,k=G&&G.q?G.q.kind:'';
  if(t==='bid')sfx('bid');else if(t==='place')sfx('place');else if(t==='pick'&&mv.loc!=null&&k==='herald')sfx('herald');else if(t==='take'||t==='steal')sfx('bid');else sfx('tap');
  try{const inf=G.pl.reduce((a,p)=>a+p.inf,0);if(_lastInf!=null&&inf>_lastInf)setTimeout(()=>sfx('inf'),200);_lastInf=inf;if(G.over)setTimeout(()=>sfx(G.pl[G.over.winner].ai?'lose':'fanfare'),300)}catch(e){}}
function musicFor(){try{if(!window.GA||!UI.music)return;GA.music(G&&G.round>=G.rounds?'tense':'main',{fade:1.5})}catch(e){}}
// ---------------------------------------------------------------- phone mode
function phDetect(){try{const P=new URLSearchParams(location.search);if(P.has('phone'))return P.get('phone')!=='0'}catch(e){}
  const s=Math.min(innerWidth,innerHeight);if(s<=500)return true;let c=false;try{c=matchMedia('(pointer:coarse)').matches}catch(e){}return c&&s<=600}
function phApply(){const was=UI.phone;const on=phDetect();const root=document.documentElement;
  UI.phone=on;UI.land=innerWidth>innerHeight;root.classList.toggle('ph',on);root.classList.toggle('ph-p',on&&!UI.land);root.classList.toggle('ph-l',on&&UI.land);
  if(on){const W=innerWidth,H=innerHeight,bar=44;const bs=UI.land?H:Math.min(W,H-bar-150);root.style.setProperty('--bs',bs+'px');root.style.setProperty('--bar','44px')}
  else root.style.removeProperty('--bs');
  if(was!==on&&G){UI.mapReset=true;renderAll()}}
function phoneRefresh(){}
let _rz=0;addEventListener('resize',()=>{clearTimeout(_rz);_rz=setTimeout(()=>{const l=UI.land,p=UI.phone;phApply();if(G&&UI.started)renderAll()},120)});
addEventListener('orientationchange',()=>setTimeout(()=>{phApply();if(G)renderAll()},200));
// ---------------------------------------------------------------- boot
function boot(){
  try{UI.sound=localStorage.getItem('tb_snd')!=='0';UI.music=localStorage.getItem('tb_mus')==='1';UI.lowGfx=localStorage.getItem('tb_gfx')==='low'}catch(e){}
  try{if(window.GA&&typeof GA_DATA!=='undefined'){GA.init({sfx:GA_DATA.sfx,music:GA_DATA.music,key:'tbt'});GA.setSfx(UI.sound);GA.setMusic(UI.music)}}catch(e){}
  try{if(window.PerfHUD)PerfHUD.register({game:'Thornbound Throne',levels:['high','low'],names:{high:'High',low:'Low'},getLevel:()=>UI.lowGfx?'low':'high',isAuto:()=>false,setLevel:(l,why)=>{if(why==='apply'){UI.lowGfx=l==='low';UI.mapReset=true;G&&renderAll()}},isAnimating:()=>UI.busy,anchor:'.gx-board',corner:'tl'})}catch(e){}
  GX.init({key:'tb'});setupDrawers();phApply();
  TBKit.ready.then(()=>{document.documentElement.classList.add('tb-ready');if(!UI.started)showStart()});
  document.addEventListener('pointerdown',()=>{try{if(window.GA)GA.unlock();if(UI.music)musicFor()}catch(e){}},{once:true})}
function startUiReady(){return TBKit.ready}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();

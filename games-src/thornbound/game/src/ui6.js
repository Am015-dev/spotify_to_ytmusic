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
function musicFor(){musicSync()}
// ---------------------------------------------------------------- phone mode + board-first layout
function phDetect(){try{const P=new URLSearchParams(location.search);if(P.has('phone'))return P.get('phone')!=='0'}catch(e){}
  const s=Math.min(innerWidth,innerHeight);if(s<=500)return true;let c=false;try{c=matchMedia('(pointer:coarse)').matches}catch(e){}return c&&s<=600}
// Layout (CSS grid in head.html): portrait = seats strip, the map (fills what is left), the tray (action row + hand fan);
// wide = the map square on the left, seats + tray on the right. The map is always the biggest thing on the screen.
function phApply(){const was=UI.phone,wasLand=UI.land;const on=phDetect();const root=document.documentElement;
  const W=innerWidth,H=innerHeight;UI.phone=on;UI.land=W>=H*1.15;UI.short=on?(UI.land?H<370:H<600):H<560;
  root.classList.toggle('ph',on);root.classList.toggle('ph-p',on&&!UI.land);root.classList.toggle('ph-l',on&&UI.land);root.classList.toggle('short',!!UI.short);
  root.classList.toggle('bf-w',UI.land);root.classList.toggle('bf-p',!UI.land);
  const barH=on?44:48;
  let cw=UI.land?Math.max(44,Math.min(66,Math.floor((H-barH-52-46-24-16)/1.4308))):(H<600?44:H<820?50:H<1000?56:66);
  if(!UI.land){ // portrait: the map is as wide as the screen; whatever height is left over goes to a bigger hand
    const mn=$('.gx-main'),rv=$('#rivals');const Hm=(mn&&mn.clientHeight)||(H-barH),rh=(rv&&rv.offsetHeight)||52;
    const hh=Hm-rh-46-W-10;cw=Math.max(cw,Math.min(on?64:76,Math.floor((hh-24)/1.4308)))}
  root.style.setProperty('--cw',cw+'px');root.style.setProperty('--ch',Math.round(cw*1.4308)+'px');root.style.setProperty('--barh',barH+'px');
  if(UI.land)root.style.setProperty('--bs',Math.max(150,Math.min(H-barH,Math.round(W*.62)))+'px');
  sizeMap();
  if((was!==on||wasLand!==UI.land)&&G){UI.mapReset=true;renderAll()}}
// the map square: as big as the board area allows (portrait: the width; wide: the left column)
function sizeMap(){const bd=$('#board');if(!bd)return;const W=bd.clientWidth,H=bd.clientHeight;if(!W||!H)return;const S=Math.max(120,Math.floor(Math.min(W,H)));
  document.documentElement.style.setProperty('--ms',S+'px');UI.bs=S}
function phoneRefresh(){}
function toggleZoom(){}
function wantSmall(){return false}
// One relayout path for resize, orientationchange, visualViewport and the board's ResizeObserver (iOS reports the old size right after rotating, so it re-measures at ~400 ms).
let _rz=0,_rz2=0,_rzSig='';
function relayout(force){const bd=$('#board'),sig=innerWidth+'x'+innerHeight+'|'+(bd?bd.clientWidth+'x'+bd.clientHeight:'');if(!force&&sig===_rzSig)return;_rzSig=sig;
  phApply();if(G&&UI.started)renderAll();else if(typeof renderStart==='function'){const st=$('#start');if(st&&!st.hidden)renderStart()}}
function onResize(){clearTimeout(_rz);clearTimeout(_rz2);_rz=setTimeout(()=>relayout(),80);_rz2=setTimeout(()=>relayout(),420)}
addEventListener('resize',onResize);addEventListener('orientationchange',onResize);
try{if(window.visualViewport)visualViewport.addEventListener('resize',onResize)}catch(e){}
try{if(window.ResizeObserver){const bd=document.getElementById('board');if(bd)new ResizeObserver(onResize).observe(bd)}}catch(e){}
// ---------------------------------------------------------------- boot
function boot(){
  try{UI.sound=localStorage.getItem('tb_snd')!=='0';UI.music=localStorage.getItem('tb_mus')!=='0';UI.lowGfx=localStorage.getItem('tb_gfx')==='low'}catch(e){}
  try{if(window.GA&&typeof GA_DATA!=='undefined'){GA.init({sfx:GA_DATA.sfx,music:GA_DATA.music,key:'tbt'});GA.setSfx(UI.sound);GA.setMusic(UI.music)}}catch(e){}
  try{if(window.PerfHUD)PerfHUD.register({game:'Thornbound Throne',levels:['high','low'],names:{high:'High',low:'Low'},getLevel:()=>UI.lowGfx?'low':'high',isAuto:()=>false,setLevel:(l,why)=>{if(why==='apply'){UI.lowGfx=l==='low';UI.mapReset=true;G&&renderAll()}},isAnimating:()=>UI.busy,anchor:'.gx-board',corner:'tl'})}catch(e){}
  GX.init({key:'tb'});setupDrawers();phApply();netInit();
  TBKit.ready.then(()=>{document.documentElement.classList.add('tb-ready');if(!UI.started)showStart()});
  document.addEventListener('pointerdown',()=>{try{if(window.GA)GA.unlock();musicSync()}catch(e){}},{once:true});setInterval(()=>{try{musicSync()}catch(e){}},700)}
function startUiReady(){return TBKit.ready}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();

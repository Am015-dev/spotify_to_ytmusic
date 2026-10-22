/* ---------- lag fix, part 2: songs are streamed (see parts/a.js "tracks"), nothing is decoded any more, so there is no stall to hide.
   What is left of the old pump: keep the songs a district will need (its own, its boss's, the next one) buffered in their audio slots, ahead of time and one after
   the other. A song that is needed before it is buffered is still asked for at once (urgent), and that is counted in NR.lag.urgent. ---------- */
const _loadTrack0=loadTrack;
const _loadTrack=async stage=>{const h=TRQ.hist;h.push(stage+' start '+(performance.now()|0)+(typeof SH!=='undefined'&&SH.active?' pit':''));await _loadTrack0(stage);h.push(stage+' end '+(performance.now()|0)+(typeof SH!=='undefined'&&SH.active?' pit':''));if(h.length>60)h.splice(0,h.length-60);};
const TRQ=NR.lag={mid:0,urgent:0,loads:0,log:[],hist:[]};
const calmNow=()=>!running||paused||(typeof SH!=='undefined'&&SH.active)||!G||G.dead||G.over||G.dt<3.5;   // (kept for the tests: counts a late load as "during play")
function wantSongs(){
  if(!running||!G)return['menu','stage1','stage2'];
  if(ST.on){const o=[ST.def.song];if(ST.def.goal.k==='boss'){const sg=bossSong(DISTRICTS[ST.def.di].boss,false);if(sg)o.push(sg);}return o;}
  let di=G.di,L=G.loop,done=G.bossDone;
  if(SH.active){const nx=nextDi(di);di=nx.di;if(nx.wrap)L++;done=false;}                       // pit stop: get ready for the district that comes next
  const o=[songFor(di,L)],sg=bossSong(DISTRICTS[di].boss,false);if(sg&&!done)o.push(sg);
  const nx2=nextDi(di);o.push(songFor(nx2.di,nx2.wrap?L+1:L));return o;}
TR.keepFn=file=>(TRQ.hold&&TRQ.hold.has(file))||wantSongs().some(s=>TR.by[s]&&TR.by[s].file===file);   // TRQ.hold: test hook that keeps extra songs buffered
function pumpTracks(){if(!AU.a)return;
  for(const s of wantSongs()){const info=TR.by[s];if(!info||TR.bufs[info.file]||TR.busy[info.file]||TR.bad[info.file])continue;TRQ.loads++;_loadTrack(s);}}
setInterval(pumpTracks,300);
loadTrack=function(stage,urgent){const info=TR.by[stage];if(!info||TR.bufs[info.file]||TR.busy[info.file]||TR.bad[info.file]||!AU.a)return;
  if(urgent){TRQ.urgent++;if(!calmNow())TRQ.mid++;TRQ.log.push(stage+'@'+(G?G.t|0:0));if(TRQ.log.length>20)TRQ.log.shift();}
  TRQ.loads++;return _loadTrack(stage);};
/* Skylines (landscape and portrait) of every district are built one at a time in calm moments (title, pit stop, pause, banner), never in the middle of a fight:
   building one is 20-80 ms of canvas work, which showed as a hitch at the first visit of a district. */
setInterval(()=>{const n=DISTRICTS.length;if(document.hidden)return;
  for(let k=0;k<2*n;k++){const i=k%n,port=k>=n;if(port?BGPC[i]:BGC[i])continue;if(running&&!calmNow())return;(port?bgpFor:bgFor)(i);return;}},350);

/* ---------- lag fix, part 3: do not draw what nobody can see, and let a machine that is fill-rate bound draw fewer pixels ----------
   1. Covered: while an opaque full-screen page (pause, settings, garage, pit stop, story map, results, chest, weapons) is up, the canvas behind it is drawn at about 8 a second instead of 60
      (the page is 90% opaque, so the world is still faintly alive). The old LAB was such a page: the whole game kept rendering at full cost under it.
   2. Render scale (RSC, used by fit() in b.js): when the average frame of a live run stays above 22 ms for ~3 s, the canvas backing store is made 25% smaller in each direction (browser scales it up),
      down to 55% (under a third of the pixels). Each step is judged: if the frames did not get at least 7% faster the screen is not fill-bound (throttled at 30 Hz, slow CPU), the step is undone and the scaler stops.
      Never active in an automated browser (navigator.webdriver) unless the URL has ?scale=1, so the tests see a fixed canvas. */
const COVERS=()=>[pauseEl,setEl,garageEl,shopEl,selEl,resEl,chestEl,typeof wpEl!=='undefined'?wpEl:null];
let covT=0;
function lagCovered(now){let on=false;for(const e of COVERS())if(e&&!e.hidden){on=true;break;}
  if(!on)return false;if(now-covT<120)return true;covT=now;return false;}
RSC.on=()=>!RSC.off&&SET.fps!==30&&!(navigator.webdriver&&!/[?&]scale=1/.test(location.search));
RSC.feed=function(raw){if(!RSC.on()||SH.active||G.dead||raw>250||document.hidden)return;
  if(RSC.cool>0){RSC.cool--;return;}
  RSC.buf.push(raw);if(RSC.buf.length<75)return;
  const s=RSC.buf.slice().sort((a,b)=>a-b),n=Math.floor(s.length*.9),m=s.slice(0,n).reduce((a,b)=>a+b,0)/n;RSC.buf=[];RSC.log.push(Math.round(m*10)/10);if(RSC.log.length>12)RSC.log.shift();
  if(RSC.hist){const was=RSC.hist;RSC.hist=0;if(m>was*.93){RSC.k=RSC.prev;RSC.off=true;fit();return;}}   // not faster: it was never the pixels
  const nk=Math.max(RSC.min,+(RSC.k*.75).toFixed(3));
  if(m>22&&RSC.k-nk>.05&&performance.now()-RSC.t0>4000){RSC.prev=RSC.k;RSC.hist=m;RSC.k=nk;RSC.steps++;RSC.cool=45;fit();}};
NR.on('runStart',()=>{RSC.t0=performance.now();RSC.buf=[];RSC.cool=60;});

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

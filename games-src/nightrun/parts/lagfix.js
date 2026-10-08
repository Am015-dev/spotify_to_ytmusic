/* ---------- lag fix: decoding a song (60-100 MB of PCM) blocks the main thread for 100-300 ms when it ends, and that froze the ship.
   Songs are now decoded ONE at a time and only while nothing needs steering: title, pause, pit stop, game over, and the first seconds of a district
   (banner time). The songs a district will need (its own, its boss's, the next one) are queued from there; the pump keeps all of them in memory.
   A song that is needed before it is ready still loads at once (urgent), and that is counted in NR.lag.urgent. ---------- */
const _loadTrack0=loadTrack;
const _loadTrack=async stage=>{const h=TRQ.hist;h.push(stage+' start '+(performance.now()|0)+(typeof SH!=='undefined'&&SH.active?' pit':''));await _loadTrack0(stage);h.push(stage+' end '+(performance.now()|0)+(typeof SH!=='undefined'&&SH.active?' pit':''));if(h.length>60)h.splice(0,h.length-60);};
const TRQ=NR.lag={mid:0,urgent:0,loads:0,log:[],hist:[]};
const calmNow=()=>!running||paused||(typeof SH!=='undefined'&&SH.active)||!G||G.dead||G.over||G.dt<3.5;
function wantSongs(){
  if(!running||!G)return['menu','stage1','stage2'];
  if(ST.on){const o=[ST.def.song];if(ST.def.goal.k==='boss'){const sg=bossSong(DISTRICTS[ST.def.di].boss,false);if(sg)o.push(sg);}return o;}
  let di=G.di,L=G.loop,done=G.bossDone;
  if(SH.active){di++;if(di>=DISTRICTS.length){di=0;L++;}done=false;}                       // pit stop: get ready for the district that comes next
  const o=[songFor(di,L)],sg=bossSong(DISTRICTS[di].boss,false);if(sg&&!done)o.push(sg);
  const n=di+1,Ln=n>=DISTRICTS.length?L+1:L;o.push(songFor(n%DISTRICTS.length,Ln));return o;}
TR.keepFn=file=>(TRQ.hold&&TRQ.hold.has(file))||wantSongs().some(s=>TR.by[s]&&TR.by[s].file===file);   // TRQ.hold: test hook that keeps extra songs decoded
const trBusy=()=>{for(const k in TR.busy)if(TR.busy[k])return true;return false;};
function pumpTracks(){if(!AU.a||trBusy())return;
  for(const s of wantSongs()){const info=TR.by[s];if(!info||TR.bufs[info.file]||TR.bad[info.file])continue;
    if(!calmNow())return;TRQ.loads++;_loadTrack(s);return;}}
setInterval(pumpTracks,300);
loadTrack=function(stage,urgent){const info=TR.by[stage];if(!info||TR.bufs[info.file]||TR.busy[info.file]||TR.bad[info.file]||!AU.a)return;
  if(urgent){TRQ.urgent++;if(!calmNow())TRQ.mid++;TRQ.log.push(stage+'@'+(G?G.t|0:0));if(TRQ.log.length>20)TRQ.log.shift();return _loadTrack(stage);}
  if(calmNow()&&!trBusy()){TRQ.loads++;return _loadTrack(stage);}};      // otherwise the pump takes it when it is calm

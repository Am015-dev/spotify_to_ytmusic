// ---------- online play: what one seat may be told (a WHITELIST) ----------
// netStrip(G, seat) builds a NEW object. Nothing is copied by default: every field that leaves the host's page is listed below, so a field the engine
// adds later is simply absent until somebody lists it. The engine's own TB.stripView does the hiding of other seats' hand / deck / face-down cards /
// unrevealed bid / Kingdom Deck order / question options (hidden-test.js proves it with a poison test); this file is the second wall: it drops
// rng, seed, the agenda, the stats counters and anything unlisted, and keeps only the last 150 log lines.
// seat = -1 is a spectator (everything hidden). Pure function of (G, seat), no globals except TB.
const NET_TOP=['v','np','len','rounds','round','phase','step','order','reg','council','cmk','lost','burned','kburn','limbo','klimbo','road','kdisc','fav','cmod','rm','used','cord','loc','bq','taken','bidRev','bfirst','curReg'];
const NET_PL=['seat','name','ai','fac','inf','lore','hs','hand','deck','disc','site','hq','ks','sup','tac','herald','supp','mk','bid','gate'];
const NET_Q=['kind','title','seats','simul','t','h','o','ctx','items','chosen','budget','min','max','pl','st'];
const NET_CL=['r','parts','first','cards','added','used','bonus','n','skip','winner','tot','tied','tp'];
const NET_REG=['up','down','took','kc','done','n'];
function netPlain(x){ // deep copy of plain JSON data only (no functions, no prototypes)
  if(x===null||typeof x==='number'||typeof x==='boolean'||typeof x==='string')return x;
  if(Array.isArray(x))return x.map(netPlain);
  if(typeof x==='object'){const o={};for(const k of Object.keys(x)){if(k==='__proto__')continue;const v=x[k];if(typeof v==='function'||v===undefined)continue;o[k]=netPlain(v)}return o}
  return null}
function netPick(src,keys){const o={};if(!src)return o;for(const k of keys)if(Object.prototype.hasOwnProperty.call(src,k)&&src[k]!==undefined)o[k]=netPlain(src[k]);return o}
function netStrip(G,seat){
  const V=TB.stripView(G,seat);               // a clone: hidden cards are already -(owner+1), deck order and rng gone
  const o=netPick(V,NET_TOP);
  o.seed=0;o.me=seat;o.ag=[];o.agI=0;
  o.pl=V.pl.map(p=>{const q=netPick(p,NET_PL);if(p.seat===seat&&Array.isArray(p.peek))q.peek=p.peek.slice();return q});
  o.reg=V.reg.map(R=>netPick(R,NET_REG));
  o.kdeck=V.kdeck.map(()=>0);                 // only how many Kingdom cards are left
  o.peek={};if(seat>=0)o.peek[seat]=(V.peek&&V.peek[seat]||[]).slice();
  o.clash=V.clash?netPick(V.clash,NET_CL):null;
  o.over=V.over?netPick(V.over,['winner','ranking','scores','bonus','tieBreak']):null;
  o.q=V.q?netPick(V.q,NET_Q):null;
  if(o.q){o.q.got={};if(!o.q.seats.includes(seat)){o.q.o={};o.q.ctx={};if(o.q.items)o.q.items=[];if(o.q.chosen)o.q.chosen=[]}}
  o.bstr=V.bidRev?V.bstr.slice():[];
  o.logN=V.logN;o.log=V.log.slice(-150).map(e=>({i:e.i,r:e.r,t:String(e.t).slice(0,300),s:e.s,c:e.c||''}));
  return o}

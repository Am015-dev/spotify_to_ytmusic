// ---------- online play: what a remote seat may see ----------
// netStrip(G, seat) builds a NEW state object for ONE seat from a WHITELIST of fields that are public (or that this seat owns). Nothing is
// copied by default: a field the engine gains later is absent from the copy until it is listed here, so it cannot leak by accident.
// Hidden and therefore not copied or blanked: the other captains' hand tiles (same length, every tile -1), the draw pile order (-1 per tile),
// the leviathan deck ORDER (only the sorted contents, which is public: every leviathan not on the board), the elimination-bonus pool and the
// drawn-cannon card (only for their owner), the other seats' question options and context, the engine agenda, the RNG state and the seed.
// sideToAct(), validMoves(seat), legal() and knowledge(seat) give the SAME answer on the copy as on the real state (tools/net-strip-test.js).
// seat -1 = a watcher (every hand hidden). Pure function: no DOM, no globals.
function netStrip(G0,seat){
  const cp=o=>o==null?o:JSON.parse(JSON.stringify(o));const n=G0.np;const mine=Number.isInteger(seat)&&seat>=0&&seat<n;const me=mine?seat:-1;
  const hide=a=>(a||[]).map(()=>-1);const srt=a=>(a||[]).slice().sort((x,y)=>x-y);
  const q=G0.q;const qMine=!!q&&q.who===me;
  const P={v:G0.v,np:n,variant:G0.variant,exp:cp(G0.exp),opts:cp(G0.opts),phase:G0.phase,step:G0.step,turn:G0.turn,cur:G0.cur,first:G0.first,order:cp(G0.order),sp:G0.sp,
    team:cp(G0.team),ships:cp(G0.ships),seats:G0.seats.map(s=>({i:s.i,nm:s.nm,human:!!s.human,lv:s.lv,away:!!s.away})),
    hands:G0.hands.map((h,i)=>i===me?h.slice():hide(h)),deck:hide(G0.deck),gone:srt(G0.gone),
    limbo:G0.limbo==null?null:(qMine?G0.limbo:-1),mdeck:srt(G0.mdeck),mons:cp(G0.mons),mgone:srt(G0.mgone),wave:cp(G0.wave),gates:cp(G0.gates),bd:cp(G0.bd),
    dice:cp(G0.dice),refill:G0.refill,arr:G0.arr?{id:G0.arr.id,k:G0.arr.k,x:G0.arr.x,y:G0.arr.y,r:G0.arr.r,dead:cp(G0.arr.dead),spawn:G0.arr.spawn,move:G0.arr.move}:null,
    mq:cp(G0.mq),placeElim:cp(G0.placeElim),batch:cp(G0.batch),pool:G0.cur===me?G0.pool.slice():hide(G0.pool),bq:G0.bq?{mine:G0.cur===me?G0.bq.mine.slice():[]}:null,
    over:cp(G0.over),q:q?{who:q.who,kind:q.kind,title:qMine||q.kind==='doom'?q.title:'',opts:qMine?cp(q.opts):[],ctx:qMine?cp(q.ctx):{}}:null,
    log:cp(G0.log.slice(0,60)),logN:G0.logN,stats:cp(G0.stats),gid:G0.gid,ag:[],agI:0};
  return P}

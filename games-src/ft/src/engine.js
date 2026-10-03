// ---------- Sands of Qamar engine: G is plain JSON; every change goes through validMoves/performMove; questions pause on G.q ----------
// player colours avoid every tribe colour (yellow, white, green, blue, red, purple)
const PNAMES=['Onyx','Teal','Rose','Cedar','Slate'];
var ANIM=1,AIDELAY=450,DEFSEED=null;const SAVE='soq_save1';
let G=null;const UI={pause:false,speed:1,sel:null,pick:[],fx:[]};
function rnd(n){let t=(G.rng+=0x6D2B79F5);t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return Math.floor(((t^t>>>14)>>>0)/4294967296*n)}
function setSeed(s){DEFSEED=s>>>0;if(G)G.rng=s>>>0}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function lg(t,c){G.logN=(G.logN||0)+1;G.log.unshift({t,r:G.round,c:c||'',i:G.logN});if(G.log.length>500)G.log.length=500}
function fx(t,x){if(UI.sim)return;UI.fxN=(UI.fxN||0)+1;UI.fx.push({t,x,n:UI.fxN});if(UI.fx.length>40)UI.fx.shift()}
const P=i=>G.pl[i];
// ---------- geometry (W×H grid, impassable tiles, mountains between tiles) ----------
const wkey=(a,b)=>a<b?a+'_'+b:b+'_'+a;
function nbr(i){const W=G.W,c=i%W,r=Math.floor(i/W),o=[];if(r>0)o.push(i-W);if(r<G.H-1)o.push(i+W);if(c>0)o.push(i-1);if(c<W-1)o.push(i+1);return o}
function ADJ(i){return nbr(i).filter(j=>!G.board[j].block&&!G.walls[wkey(i,j)])}
function AROUND(i){const W=G.W,c=i%W,r=Math.floor(i/W),o=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const rr=r+dr,cc=c+dc;if(rr>=0&&rr<G.H&&cc>=0&&cc<W)o.push(rr*W+cc)}return o}
const MDIST=(a,b)=>Math.abs(a%G.W-b%G.W)+Math.abs(Math.floor(a/G.W)-Math.floor(b/G.W));
// every tile has a unique grid name (rows A.., columns 1..6) so plans, advice and the log can be followed
function tileCoord(i){return 'ABCDEFG'[Math.floor(i/G.W)]+(i%G.W+1)}
function tileName(t){return `${TILEDEF[t.k].n} ${tileCoord(t.i)}`}
// ---------- setup ----------
function newGame(o){o=o||{};const seed=DEFSEED!=null?DEFSEED:Math.floor(Math.random()*2**31);const np=o.np||(o.seats?o.seats.length:2);
  const ex=Object.assign({artisans:false,sultan:false,thieves:false,promos:false},o.ex||{});if(np===5)ex.sultan=true;
  G={v:1,rng:seed,seed,np,ex,round:1,phase:'bid',log:[],logN:0,q:null,over:null,winner:null,winText:'',turn:0,W:6,H:5,walls:{},
    pl:[],board:[],market:[],rdeck:[],rdisc:[],djRow:[],djDeck:[],djDisc:[],bag:[],items:[],itemDisc:[],thRow:[],thDeck:[],
    bids:[],bidQueue:[],order:[],nextBid:[],turnIdx:0,cur:null,step:null,move:null,act:null,turnFx:{},endTrig:false,stats:{kills:0,djinns:0,moves:0}};
  const names=o.names||PNAMES;
  for(let i=0;i<np;i++)G.pl.push({i,nm:names[i],human:o.seats?o.seats[i]==='human':(o.mode==='hot'||(o.mode!=='ai'&&i===0)),lv:(o.lv&&o.lv[i])||'normal',
    coins:50,camels:CAMELS[np],tent:ex.artisans?1:0,vz:0,el:0,art:0,dj:[],res:[],fk:0,items:[],thieves:[],used:{},markers:np===2?2:1});
  buildBoard();
  const colours=Object.keys(MEEPLE_COUNT);const bag=[];for(const c of colours)for(let k=0;k<MEEPLE_COUNT[c];k++)bag.push(c);
  if(ex.artisans)for(let k=0;k<15;k++)bag.push('artisan');if(ex.sultan)for(const c of colours)for(let k=0;k<3;k++)bag.push(c);
  G.meepleTotal=bag.length;G.bag=shuffle(bag);for(const t of G.board)if(!t.block)for(let k=0;k<3;k++)t.m.push(G.bag.pop());
  const rd=[];for(const r in RESOURCE_COUNT)for(let k=0;k<RESOURCE_COUNT[r];k++)rd.push(r);G.rdeck=shuffle(rd);refillMarket();
  G.djDeck=shuffle(DJINNS_FOR(ex).map(d=>d.k));refillDjinns();
  if(ex.artisans){const it=[];for(const k in ITEMS)for(let n=0;n<ITEMS[k].cp;n++)it.push(k);G.items=shuffle(it)}
  if(ex.thieves){G.thDeck=shuffle(Object.keys(THIEVES).filter(k=>k!=='artisan'||ex.artisans));G.thRow=[G.thDeck.shift()]}
  G.track=(np===5?BIDTRACK_5:BIDTRACK_STD).map(c=>({cost:c}));
  const mk=[];for(const p of G.pl)for(let k=0;k<p.markers;k++)mk.push({p:p.i,k});G.bidQueue=shuffle(mk);G.bids=[];G.phase='bid';
  lg(`A new sultanate opens for ${np} players${(()=>{const l=Object.keys(ex).filter(k=>ex[k]).map(k=>({artisans:'the Crafters',sultan:'the Wonder Cities',thieves:'the Cutpurses',promos:'the promo djinns'})[k]).filter(Boolean);return l.length?' with '+l.join(', '):''})()}.`,'big');
  if(typeof refresh==='function')refresh()}
function buildBoard(){const ex=G.ex;const base=shuffle(mkTiles(TILESET,'base'));const art=ex.artisans?shuffle(mkTiles(TILESET_ART,'artisans')):[];const wh=ex.sultan?shuffle(mkTiles(TILESET_WHIM,'sultan')):[];
  let W=6,H=5;if(ex.artisans&&ex.sultan){W=6;H=7}else if(ex.artisans||ex.sultan){W=6;H=6}G.W=W;G.H=H;const N=W*H;const cells=new Array(N).fill(null);
  if(ex.artisans){// the 6 Crafter tiles sit in the inner area with random others; the rest form the border
    const inner=[];for(let r=1;r<H-1;r++)for(let c=1;c<W-1;c++)inner.push(r*W+c);const pool=shuffle(base.concat(wh));const innerTiles=shuffle(art.concat(pool.splice(0,inner.length-art.length)));
    inner.forEach((i,j)=>cells[i]=innerTiles[j]);let k=0;for(let i=0;i<N;i++)if(!cells[i])cells[i]=pool[k++]}
  else{const all=shuffle(base.concat(wh));for(let i=0;i<N;i++)cells[i]=all[i]}
  G.board=cells.map((t,i)=>Object.assign({},t,{i,m:[],camel:null,tent:null,palm:0,pal:0,block:TILEDEF[t.k].block?1:0}));G.walls={};
  // mountains: 2 on each Workshop, on two of its sides, keeping every tile reachable
  if(ex.artisans)for(const t of G.board)if(t.k==='workshop'){let tries=0;let placed=0;while(placed<2&&tries++<40){const ns=nbr(t.i).filter(j=>!G.board[j].block&&!G.walls[wkey(t.i,j)]);if(!ns.length)break;const j=ns[rnd(ns.length)];G.walls[wkey(t.i,j)]=1;if(connected())placed++;else delete G.walls[wkey(t.i,j)]}}}
function connected(){const open=G.board.filter(t=>!t.block).map(t=>t.i);const seen=new Set([open[0]]);const q=[open[0]];while(q.length){const a=q.shift();for(const b of ADJ(a))if(!seen.has(b)){seen.add(b);q.push(b)}}return seen.size===open.length}
function refillMarket(){while(G.market.length<9){if(!G.rdeck.length){if(!G.rdisc.length)break;G.rdeck=shuffle(G.rdisc);G.rdisc=[]}G.market.push(G.rdeck.shift())}}
function refillDjinns(){while(G.djRow.length<3){if(!G.djDeck.length){if(!G.djDisc.length)break;G.djDeck=shuffle(G.djDisc);G.djDisc=[]}G.djRow.push(G.djDeck.shift())}}
// ---------- questions (JSON-safe: a handler key plus data) ----------
const QH={};
function ask(who,title,opts,extra){if(!opts.length)return;G.q=Object.assign({who,title,opts},extra||{});const p=P(who);if(!p.human||UI.sim){const i=aiAnswer(G.q);answerQ(i)}}
function answerQ(i){const q=G.q;G.q=null;const o=q.opts[i];QH[o.h](o.d||{},q);afterQ()}
function afterQ(){if(G.q)return;if(G.pendingEnd){G.pendingEnd=0;endTurn()}}
// ---------- turn order auction ----------
function spotTaken(s){return G.bids.some(b=>b.spot===s)}
function bidPrice(p,spot,fk){const costs=G.track.map(t=>t.cost);const cheaper=[...new Set(costs)].sort((a,b)=>b-a);const i=cheaper.indexOf(costs[spot]);return cheaper[Math.min(cheaper.length-1,i+(fk||0))]}
function bidMoves(p){const o=[];const free=[];const seen=new Set();G.track.forEach((t,s)=>{if(spotTaken(s))return;const key=t.cost;if(seen.has(key))return;seen.add(key);free.push(s)});
  for(const s of free){const maxF=hasDj(p,'dalil')?p.fk:0;for(let f=0;f<=maxF;f++){const pr=bidPrice(p,s,f);if(f&&pr===bidPrice(p,s,f-1))break;if(p.coins>=pr)o.push(f?{act:'bid',spot:s,fk:f}:{act:'bid',spot:s})}}
  // assumption: a player who cannot afford any free spot takes the cheapest one and pays what they have
  if(!o.length&&free.length){const s=free.reduce((a,b)=>G.track[b].cost<G.track[a].cost?b:a);o.push({act:'bid',spot:s})}return o}
function doBid(m){const mk=G.bidQueue.shift();const p=P(mk.p);const pr=Math.min(p.coins,bidPrice(p,m.spot,m.fk));p.coins-=pr;if(m.fk){p.fk-=m.fk;G.rdisc.push(...Array(m.fk).fill('fakir'))}
  G.bids.push({mk,spot:m.spot,n:G.bids.length});lg(`${p.nm} bids ${pr?pr+' coin'+(pr>1?'s':''):'nothing'} for turn order${m.fk?' (Dalil: '+m.fk+' Mystic'+(m.fk>1?'s':'')+')':''}.`);fx('bid',p.i);
  if(!G.bidQueue.length){// play order: dearest spot first; among equal-cost spots the later bidder plays first
    G.order=G.bids.slice().sort((a,b)=>G.track[b.spot].cost-G.track[a.spot].cost||b.n-a.n).map(b=>b.mk);G.phase='turn';G.turnIdx=0;G.nextBid=[];startTurn()}}
// ---------- turns ----------
function startTurn(){const mk=G.order[G.turnIdx];G.cur=mk.p;G.nextBid.push(mk);G.turn++;const p=P(mk.p);p.used={};p.itemUsed=0;G.turnFx={};G.move=null;G.act=null;G.step='move';
  lg(`— ${p.nm}'s turn —`,'turn');fx('turn',p.i);if(!legalStarts().length){lg(`${p.nm} has no legal move and passes.`);G.step='sell'}}
function endTurn(){if(G.q){G.pendingEnd=1;return}G.turnIdx++;G.move=null;G.act=null;G.step=null;if(G.turnIdx>=G.order.length)return endRound();startTurn()}
function endRound(){refillMarket();refillDjinns();if(G.ex.thieves&&!G.thRow.length&&G.thDeck.length)G.thRow.push(G.thDeck.shift());
  if(G.endTrig){lg('The last camel has been placed: the game ends.','big');return finish()}
  if(!legalStarts().length){lg('No legal move remains anywhere on the board.','big');return finish()}
  G.round++;G.bidQueue=G.nextBid.slice();G.bids=[];G.phase='bid';lg(`— Round ${G.round}: bid for turn order —`,'round');fx('round')}
// ---------- movement ----------
function handCounts(h){const o={};for(const c of h)o[c]=(o[c]||0)+1;return o}
// can a hand dropped from `at` (not stepping back to prev) end legally? uses the live board (earlier drops included)
function canFinish(at,prev,hand){if(!hand.length)return true;for(const nx of ADJ(at)){if(nx===prev)continue;if(hand.length===1){if(G.board[nx].m.includes(hand[0]))return true;continue}
  for(const c of new Set(hand)){const h=hand.slice();h.splice(h.indexOf(c),1);const s=G.board[nx].m;G.board[nx].m=s.concat([c]);const ok=canFinish(nx,at,h);G.board[nx].m=s;if(ok)return true}}return false}
// quicker legality for a start tile: order-free check (colours dropped earlier on the final tile count)
function startLegal(s){const t=G.board[s];if(t.block||!t.m.length)return false;const hand=t.m.slice();const saved=t.m;t.m=[];let ok=false;
  const hc=handCounts(hand);const rec=(at,prev,left,visits)=>{for(const nx of ADJ(at)){if(nx===prev)continue;
      if(left===1){const had=G.board[nx].m;for(const c in hc)if(had.includes(c)||(visits[nx]&&hc[c]>=2)){ok=true;return}continue}
      visits[nx]=(visits[nx]||0)+1;rec(nx,at,left-1,visits);visits[nx]--;if(ok)return}};
  rec(s,-1,hand.length,{});t.m=saved;return ok||(G.turnFx.carpet&&hand.length===1&&G.board.some(x=>x.i!==s&&x.m.includes(hand[0])))}
function legalStarts(){const o=[];for(const t of G.board)if(t.m.length&&startLegal(t.i))o.push(t.i);return o}
function pickUp(s){const t=G.board[s];G.move={start:s,at:s,prev:-1,hand:t.m.slice(),path:[s],drops:[]};t.m=[];lg(`${P(G.cur).nm} lifts ${G.move.hand.length} ${G.move.hand.length>1?'people':'person'}${''&&G.move.hand.length>1?'s':''} off ${tileName(t)}.`);fx('pick',s)}
function stepTargets(){const mv=G.move;if(!mv)return[];const o=new Set();for(const nx of ADJ(mv.at)){if(nx===mv.prev)continue;if(dropColors(nx).length)o.add(nx)}
  if(G.turnFx.carpet&&mv.hand.length===1)for(const t of G.board)if(t.i!==mv.at&&t.m.includes(mv.hand[0]))o.add(t.i);return [...o]}
function dropColors(nx){const mv=G.move;const o=[];const carpet=G.turnFx.carpet&&mv.hand.length===1&&!ADJ(mv.at).includes(nx);
  for(const c of new Set(mv.hand)){if(mv.hand.length===1){if(G.board[nx].m.includes(c)&&(carpet||ADJ(mv.at).includes(nx)))o.push(c);continue}
    if(!ADJ(mv.at).includes(nx)||nx===mv.prev)continue;const h=mv.hand.slice();h.splice(h.indexOf(c),1);const s=G.board[nx].m;G.board[nx].m=s.concat([c]);const ok=canFinish(nx,mv.at,h);G.board[nx].m=s;if(ok)o.push(c)}return o}
function dropAt(nx,c){const mv=G.move;mv.hand.splice(mv.hand.indexOf(c),1);G.board[nx].m.push(c);mv.prev=mv.at;mv.at=nx;mv.path.push(nx);mv.drops.push({i:nx,c});fx('drop',nx);trig('drop',G.cur,{i:nx});
  if(!mv.hand.length)finishMove(nx,c)}
function finishMove(e,c){const t=G.board[e];const p=P(G.cur);const n=t.m.filter(x=>x===c).length;t.m=t.m.filter(x=>x!==c);
  G.act={tile:e,color:c,n,tribeDone:false,tileDone:false};G.move=null;lg(`${p.nm} ends on ${tileName(t)} and takes ${n} ${n>1?MPLUR[c]:MNAME[c]}.`,'big');fx('take',e);
  if(!t.m.length&&t.camel==null&&t.tent==null)claimTile(p,e,'auto');G.step='tribe';
  if(['small','large','exchange'].includes(t.k))trig('market',p.i)}
// taking control: a camel (or, with Crafters, the tent)
function claimTile(p,e,how){const t=G.board[e];if(t.camel!=null||t.tent!=null)return;
  if(how==='auto'&&p.tent&&p.human&&!UI.sim){ask(p.i,`Claim ${tileName(t)} with a camel or your tent?`,[{l:'🐪 A camel',h:'claim',d:{p:p.i,e,how:'camel'}},{l:'⛺ The tent (scores its tile and each red tile around it)',h:'claim',d:{p:p.i,e,how:'tent'}}],{kind:'claim'});return}
  if(how==='auto'&&p.tent&&(!p.human||UI.sim)&&aiWantsTent(p,e))how='tent';
  if(how==='tent'&&p.tent){p.tent=0;t.tent=p.i;lg(`⛺ ${p.nm} pitches the tent on ${tileName(t)}.`,'good');fx('camel',e);return}
  if(p.camels<=0){lg(`${p.nm} has no camels left to claim ${tileName(t)}.`);return}t.camel=p.i;p.camels--;lg(`🐪 ${p.nm} claims ${tileName(t)}.`,'good');fx('camel',e);
  if(p.camels===0&&!G.endTrig){G.endTrig=true;lg(`${p.nm} has placed the last camel: the game ends after this round.`,'big')}}
QH.claim=d=>claimTile(P(d.p),d.e,d.how);
function owner(t){return t.camel!=null?t.camel:t.tent!=null?t.tent:null}
// ---------- tribe actions ----------
function killTargets(p,n,fkMax){const a=G.act;const o=[];const two=G.turnFx.ghulam;
  for(const t of G.board){if(t.block||!t.m.length)continue;const d=MDIST(a.tile,t.i);const f=Math.max(0,d-n);if(f>fkMax)continue;const cols=[...new Set(t.m)];
    for(const c of cols)o.push({tile:t.i,c,fk:f});if(two&&t.m.length>=2){for(let x=0;x<cols.length;x++)for(let y=x;y<cols.length;y++){if(x===y&&t.m.filter(q=>q===cols[x]).length<2)continue;o.push({tile:t.i,c:cols[x],c2:cols[y],fk:f})}}}
  for(const q of G.pl){if(q.i===p.i||hasDj(q,'sadim'))continue;for(const c of ['vizier','elder','artisan']){const have=c==='vizier'?q.vz:c==='elder'?q.el:q.art;if(have)o.push({pl:q.i,c,fk:0})}
    if(two){const kinds=[['vizier',q.vz],['elder',q.el],['artisan',q.art]].filter(x=>x[1]);for(let x=0;x<kinds.length;x++)for(let y=x;y<kinds.length;y++){if(x===y&&kinds[x][1]<2)continue;o.push({pl:q.i,c:kinds[x][0],c2:kinds[y][0],fk:0})}}}
  return o}
function tribeMoves(p){const a=G.act;const c=a.color;const o=[];
  if(c==='builder'){for(let f=0;f<=p.fk;f++)o.push(f?{act:'tribe',fk:f}:{act:'tribe'});return o}
  if(c==='assassin'){const ts=killTargets(p,a.n,p.fk);if(!ts.length)return [{act:'tribe',none:1}];for(const k of ts)o.push({act:'tribe',kill:k});return o}
  return [{act:'tribe'}]}
function doTribe(m){const a=G.act;const p=P(G.cur);const c=a.color;a.tribeDone=true;G.step='tile';
  if(c==='vizier'){p.vz+=a.n;lg(`${p.nm} keeps ${a.n} ${a.n>1?'Advisors':'Advisor'}.`,'good');trig('vizier',p.i)}
  else if(c==='elder'){p.el+=a.n;lg(`${p.nm} keeps ${a.n} ${a.n>1?'Sages':'Sage'}.`,'good')}
  else if(c==='artisan'){p.art+=a.n;const k=Math.min(a.n,G.items.length);if(k){const drawn=G.items.splice(0,k);if(drawn.length===1){p.items.push(drawn[0]);lg(`${p.nm} keeps ${a.n} Crafter${a.n>1?'s':''} and takes an item.`,'good')}else ask(p.i,'Your Crafters show you items: keep one',drawn.map((x,j)=>({l:`${ITEMS[x].n}: ${ITEMS[x].x}`,h:'keepItem',d:{p:p.i,keep:j,drawn}})),{kind:'item'})}else lg(`${p.nm} keeps ${a.n} Crafter${a.n>1?'s':''}; the item pile is empty.`,'good')}
  else if(c==='merchant'){const k=Math.min(a.n,G.market.length);const got=G.market.splice(0,k);for(const r of got)gainCard(p,r,1);G.bag.push(...Array(a.n).fill('merchant'));lg(`${p.nm}'s Traders bring ${k} card${k===1?'':'s'}: ${got.map(r=>RNAME[r]).join(', ')}.`,'good');fx('res')}
  else if(c==='builder'){const blues=AROUND(a.tile).filter(i=>G.board[i].blue&&!G.board[i].block).length;const f=m.fk||0;p.fk-=f;G.rdisc.push(...Array(f).fill('fakir'));let gain=(a.n+f)*blues;if(G.turnFx.qirsh)gain*=2;p.coins+=gain;G.bag.push(...Array(a.n).fill('builder'));lg(`${p.nm}'s ${a.n} Mason${a.n>1?'s':''}${f?' and '+f+' Mystic'+(f>1?'s':''):''} earn ${gain} coins (${blues} blue tile${blues===1?'':'s'} around${G.turnFx.qirsh?', doubled':''}).`,'good');fx('coins')}
  else if(c==='assassin'){G.bag.push(...Array(a.n).fill('assassin'));if(m.none){lg(`${p.nm}'s Shadows find no target.`)}else{const k=m.kill;if(k.fk){p.fk-=k.fk;G.rdisc.push(...Array(k.fk).fill('fakir'))}killOne(p,k,k.c);if(k.c2)killOne(p,k,k.c2)}}}
QH.keepItem=d=>{const p=P(d.p);p.items.push(d.drawn[d.keep]);G.itemDisc.push(...d.drawn.filter((x,j)=>j!==d.keep));lg(`${p.nm} keeps an item.`,'good')};
function gainCard(p,r,quiet){if(r==null)return;if(r==='fakir')p.fk++;else p.res.push(r);if(!quiet)lg(`${p.nm} takes ${RNAME[r]}.`,'good')}
function killOne(p,k,c){G.stats.kills++;const sirra=hasDj(p,'sirra');
  if(k.pl!=null){const q=P(k.pl);if(c==='vizier')q.vz--;else if(c==='elder')q.el--;else q.art--;lg(`🗡 ${p.nm}'s Shadow takes one of ${q.nm}'s ${MPLUR[c]}.`,'bad');fx('kill');}
  else{const t=G.board[k.tile];t.m.splice(t.m.indexOf(c),1);lg(`🗡 ${p.nm}'s Shadow takes a ${MNAME[c]} from ${tileName(t)}.`,'bad');fx('kill',k.tile);if(!t.m.length&&t.camel==null&&t.tent==null)claimTile(p,k.tile,'camel')}
  if(sirra){if(c==='merchant'&&G.rdeck.length){gainCard(p,G.rdeck.shift());G.bag.push(c)}else if(c==='builder'&&k.tile!=null){const blues=AROUND(k.tile).filter(i=>G.board[i].blue&&!G.board[i].block).length;p.coins+=blues;lg(`${p.nm} pockets ${blues} coins from the fallen Mason (Sirra).`,'good');G.bag.push(c)}
    else if(c==='vizier'){p.vz++;lg(`${p.nm} keeps the Advisor (Sirra).`,'good')}else if(c==='elder'){p.el++;lg(`${p.nm} keeps the Sage (Sirra).`,'good')}else if(c==='artisan'){p.art++;if(G.items.length)p.items.push(G.items.shift());lg(`${p.nm} keeps the Crafter and draws an item (Sirra).`,'good')}else G.bag.push(c)}
  else G.bag.push(c);trig('kill',p.i)}
// ---------- tile actions ----------
function tileMoves(p){const a=G.act;const t=G.board[a.tile];const o=[];
  switch(t.k){
  case 'village':return placeMoves(p,t,'pal');case 'oasis':return placeMoves(p,t,'palm');
  case 'sacred':{for(const k of G.djRow)for(const pay of summonPays(p))o.push({act:'tile',dj:k,pay});if(G.ex.thieves)for(const k of G.thRow)for(const pay of summonPays(p))o.push({act:'tile',thief:k,pay});break}
  case 'small':if(p.coins>=3)for(let j=0;j<Math.min(3,G.market.length);j++)o.push({act:'tile',take:[j]});break;
  case 'large':if(p.coins>=6){const n=Math.min(6,G.market.length);for(let x=0;x<n;x++)for(let y=x+1;y<n;y++)o.push({act:'tile',take:[x,y]})}break;
  case 'workshop':if(G.items.length){if(p.art>=1)o.push({act:'tile',work:'art'});if(p.fk>=2)o.push({act:'tile',work:'fk'})}break;
  case 'exchange':if(p.coins>=4)for(let j=0;j<G.market.length;j++)o.push({act:'tile',take:[j],ex:1});break}
  o.push({act:'tile',skip:1});return o}
function placeMoves(p,t,what){const flag=what==='pal'?'burhan':'rawda';const o=[{act:'tile',place:t.i}];if(G.turnFx[flag])for(const j of nbr(t.i))if(!G.board[j].block)o.push({act:'tile',place:j});return o}
function summonPays(p){const o=[];if(p.el>=2)o.push({el:2,fk:0});if(p.el>=1&&p.fk>=1)o.push({el:1,fk:1});return o}
function doTile(m){const a=G.act;const p=P(G.cur);const t=G.board[a.tile];a.tileDone=true;G.step='sell';if(m.skip)return;
  if(m.place!=null){if(t.k==='village')placePalace(p,m.place);else placePalm(p,m.place);return}
  if(m.dj){payCost(p,m.pay);G.djRow.splice(G.djRow.indexOf(m.dj),1);gainDjinn(p,m.dj);return}
  if(m.thief){payCost(p,m.pay);G.thRow.splice(G.thRow.indexOf(m.thief),1);p.thieves.push({k:m.thief,turn:G.turn});lg(`🦹 ${p.nm} hires the ${THIEVES[m.thief].n}.`,'big');return}
  if(m.take){const cost=t.k==='small'?3:t.k==='large'?6:4;p.coins-=cost;const got=m.take.slice().sort((x,y)=>y-x).map(j=>G.market.splice(j,1)[0]);for(const r of got)gainCard(p,r,1);lg(`${p.nm} buys ${got.map(r=>RNAME[r]).join(' and ')} for ${cost} coins.`,'good');fx('res');return}
  if(m.work){if(m.work==='art'){p.art--;G.bag.push('artisan')}else{p.fk-=2;G.rdisc.push('fakir','fakir')}p.items.push(G.items.shift());lg(`${p.nm} commissions an item at the Workshop.`,'good');return}}
function placePalace(p,i,viaDj){const t=G.board[i];t.pal++;lg(`🏰 ${p.nm} raises a palace on ${tileName(t)}.`,'good');fx('build',i);trig('palace',p.i)}
function placePalm(p,i){const t=G.board[i];t.palm++;lg(`🌴 ${p.nm} plants a palm on ${tileName(t)}.`,'good');fx('build',i)}
function gainDjinn(p,k){p.dj.push(k);G.stats.djinns++;lg(`✨ ${p.nm} summons ${DJ[k].n}.`,'big');fx('djinn',k);trig('djinn',p.i,{k})}
// ---------- goods sale (end of turn, optional) ----------
function sellValue(n){return SETVP[Math.min(n,9)]}
function sellMoves(p){const kinds=[...new Set(p.res)];const o=[];// offer selling the n kinds you hold most copies of (the dock also lets you choose kinds)
  const byCopies=kinds.sort((a,b)=>p.res.filter(x=>x===b).length-p.res.filter(x=>x===a).length||a.localeCompare(b));for(let n=1;n<=byCopies.length;n++)o.push({act:'sell',kinds:byCopies.slice(0,n).sort()});return o}
function doSell(m){const p=P(G.cur);for(const k of m.kinds)p.res.splice(p.res.indexOf(k),1);G.rdisc.push(...m.kinds);const v=sellValue(m.kinds.length);p.coins+=v;lg(`${p.nm} sells ${m.kinds.length} different goods for ${v} coins.`,'good');fx('coins')}
// ---------- items (Crafters) and cutpurses ----------
function itemMoves(p){const o=[];if(p.itemUsed||!p.items.length)return o;const kinds=new Set(p.items);
  for(const k of kinds){switch(k){
    case 'carpet':if(G.step==='move'&&!G.turnFx.carpet)o.push({act:'item',k});break;
    case 'lamp':if(G.djRow.length)for(const d of G.djRow)o.push({act:'item',k,dj:d});break;
    case 'flute':if(G.step==='move'&&!G.move)for(const t of G.board)if(!t.block&&nbr(t.i).some(j=>G.board[j].m.length))o.push({act:'item',k,t:t.i});break;
    case 'scimitar':if(G.board.some(t=>t.m.length))o.push({act:'item',k});break;
    case 'talisman':{const mine=G.board.filter(t=>t.camel===p.i);const em=G.board.filter(emptyTile);if(mine.length&&em.length)for(const a of mine)for(const b of em)o.push({act:'item',k,from:a.i,to:b.i});break}
    case 'horn':o.push({act:'item',k});break}}return o}
function useItem(p,m){p.items.splice(p.items.indexOf(m.k),1);G.itemDisc.push(m.k);p.itemUsed=1;const I=ITEMS[m.k];lg(`🪄 ${p.nm} uses the ${I.n}.`,'step');fx('item',m.k);
  switch(m.k){
  case 'carpet':G.turnFx.carpet=1;break;
  case 'lamp':G.djRow.splice(G.djRow.indexOf(m.dj),1);gainDjinn(p,m.dj);break;
  case 'flute':fluteStep(p,m.t,5);break;
  case 'scimitar':scimStep(p,2);break;
  case 'talisman':{const a=G.board[m.from],b=G.board[m.to];a.camel=null;b.camel=p.i;lg(`${p.nm}'s camel wanders to ${tileName(b)}.`);break}
  case 'horn':G.rdisc.push(...G.market);G.market=[];refillMarket();lg('A fresh market row is laid out.');break}}
function fluteStep(p,t,left){const opts=[];for(const j of nbr(t))for(const c of new Set(G.board[j].m))opts.push({l:`${MNAME[c]} from ${tileName(G.board[j])}`,h:'flute',d:{p:p.i,t,j,c,left}});if(!opts.length||!left)return;opts.unshift({l:'Done',h:'noop'});ask(p.i,`Reed Pipe: bring a meeple onto ${tileName(G.board[t])} (${left} left)`,opts,{kind:'flute'})}
QH.flute=d=>{const s=G.board[d.j];s.m.splice(s.m.indexOf(d.c),1);G.board[d.t].m.push(d.c);if(!s.m.length&&s.camel==null&&s.tent==null){}fluteStep(P(d.p),d.t,d.left-1)};QH.noop=()=>{};
function scimStep(p,left){if(!left)return;const opts=[];for(const t of G.board)for(const c of new Set(t.m))opts.push({l:`${MNAME[c]} on ${tileName(t)}`,h:'scim',d:{p:p.i,tile:t.i,c,left}});if(!opts.length)return;ask(p.i,`Ember Blade: remove a meeple (${left} left)`,opts,{kind:'kill'})}
QH.scim=d=>{const p=P(d.p);killOne(p,{tile:d.tile},d.c);scimStep(p,d.left-1)};
function thiefMoves(p){if(!G.act||G.act.tribeDone)return[];return p.thieves.filter(t=>t.k===G.act.color&&t.turn!==G.turn&&!G.turnFx.thief).map(t=>({act:'thief',k:t.k}))}
function useThief(p,m){p.thieves.splice(p.thieves.findIndex(t=>t.k===m.k),1);G.turnFx.thief=1;lg(`🦹 ${p.nm} sends the ${THIEVES[m.k].n} out!`,'big');fx('thief');const pool=[];
  for(const q of G.pl){if(q.i===p.i||hasDj(q,'hafiz'))continue;const give=thiefGive(q,m.k);if(give.length)pool.push(...give)}
  if(!pool.length){lg('Nobody has anything to give up.');return}
  const take=m.k==='merchant'?2:1;thiefClaim(p,m.k,pool,take)}
// each rival gives up the least valuable thing of that kind (a real rival would choose; the computer chooses for them)
function thiefGive(q,k){const o=[];switch(k){
  case 'assassin':{const ts=G.board.filter(t=>t.camel===q.i).sort((a,b)=>tileWorth(a)-tileWorth(b));if(ts[0]){ts[0].camel=null;q.camels++;o.push({kind:'tile',i:ts[0].i});lg(`${q.nm} lifts a camel off ${tileName(ts[0])}.`,'bad')}break}
  case 'builder':{const ts=G.board.filter(t=>owner(t)===q.i&&(t.palm||t.pal)).sort((a,b)=>(a.palm?3:5)-(b.palm?3:5));if(ts[0]){const t=ts[0];if(t.palm){t.palm--;o.push({kind:'palm'})}else{t.pal--;o.push({kind:'pal'})}lg(`${q.nm} loses a ${o[0].kind==='palm'?'palm tree':'palace'} from ${tileName(t)}.`,'bad')}break}
  case 'merchant':{for(let n=0;n<2&&q.res.length+q.fk;n++){if(q.fk){q.fk--;o.push({kind:'card',r:'fakir'})}else{const r=q.res.splice(0,1)[0];o.push({kind:'card',r})}}if(o.length)lg(`${q.nm} gives up ${o.length} card${o.length>1?'s':''}.`,'bad');break}
  case 'vizier':if(q.vz){q.vz--;o.push({kind:'vizier'});lg(`${q.nm} gives up an Advisor.`,'bad')}break;
  case 'elder':if(q.dj.length){const k2=q.dj.slice().sort((a,b)=>DJ[a].vp-DJ[b].vp)[0];q.dj.splice(q.dj.indexOf(k2),1);o.push({kind:'dj',k:k2});lg(`${q.nm} gives up ${DJ[k2].n}.`,'bad')}break;
  case 'artisan':if(q.items.length){const it=q.items.shift();o.push({kind:'item',k:it});lg(`${q.nm} gives up an item.`,'bad')}break}return o}
function thiefClaim(p,k,pool,take){if(!take||!pool.length)return;const opts=pool.map((g,j)=>({l:giveLabel(g),h:'thiefTake',d:{p:p.i,k,pool,j,take}}));ask(p.i,`Cutpurse haul: take ${take>1?take+' things':'one'}`,opts,{kind:'thief'})}
QH.thiefTake=d=>{const p=P(d.p);const g=d.pool[d.j];const rest=d.pool.filter((x,j)=>j!==d.j);
  if(g.kind==='tile'){if(p.camels>0){G.board[g.i].camel=p.i;p.camels--;lg(`🐪 ${p.nm} claims ${tileName(G.board[g.i])}.`,'good')}}
  else if(g.kind==='palm'||g.kind==='pal'){const best=G.board.filter(t=>owner(t)===p.i).sort((a,b)=>b.v-a.v)[0]||G.board.find(t=>!t.block);if(g.kind==='palm')best.palm++;else best.pal++;lg(`${p.nm} places it on ${tileName(best)}.`,'good')}
  else if(g.kind==='card')gainCard(p,g.r);else if(g.kind==='vizier'){p.vz++;lg(`${p.nm} gains an Advisor.`,'good')}else if(g.kind==='dj'){p.dj.push(g.k);lg(`${p.nm} gains ${DJ[g.k].n}.`,'good')}else if(g.kind==='item')p.items.push(g.k);
  // the rest goes to the discards
  if(d.take>1)thiefClaim(p,d.k,rest,d.take-1);else for(const x of rest){if(x.kind==='card')G.rdisc.push(x.r);if(x.kind==='dj')G.djDisc.push(x.k);if(x.kind==='item')G.itemDisc.push(x.k);if(x.kind==='vizier')G.bag.push('vizier')}};
function giveLabel(g){return g.kind==='tile'?`the tile ${tileName(G.board[g.i])}`:g.kind==='palm'?'a palm tree':g.kind==='pal'?'a palace':g.kind==='card'?RNAME[g.r]:g.kind==='vizier'?'an Advisor':g.kind==='dj'?DJ[g.k].n:ITEMS[g.k].n}
function tileWorth(t){return t.v+t.palm*3+t.pal*5}
// ---------- the move list ----------
function sideToAct(){if(!G||G.over)return -1;if(G.q)return G.q.who;if(G.phase==='bid')return G.bidQueue[0]?G.bidQueue[0].p:-1;if(G.phase==='turn')return G.cur;return -1}
function validMoves(s){if(!G||G.over)return[];if(s===undefined)s=sideToAct();if(s!==sideToAct()||s<0)return[];const p=P(s);const o=[];
  if(G.q)return G.q.opts.map((x,i)=>({act:'q',i}));
  if(G.phase==='bid')return bidMoves(p);
  const extras=()=>{o.push(...djinnMoves(p),...itemMoves(p))};
  switch(G.step){
  case 'move':if(!G.move){for(const i of legalStarts())o.push({act:'start',tile:i})}else{for(const nx of stepTargets())for(const c of dropColors(nx))o.push({act:'step',tile:nx,c});if(!G.move.drops.length)o.push({act:'undo'})}extras();break;
  case 'tribe':o.push(...tribeMoves(p),...thiefMoves(p));extras();break;
  case 'tile':o.push(...tileMoves(p));extras();break;
  case 'sell':o.push({act:'end'},...sellMoves(p));extras();break}
  return o}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b)}
function performMove(m,s){if(s===undefined)s=sideToAct();let ok=validMoves(s).some(x=>same(x,m));
  if(!ok&&m.act==='sell'&&G.step==='sell'&&s===G.cur){const p=P(s);const k=m.kinds||[];ok=k.length>0&&new Set(k).size===k.length&&k.every(x=>p.res.includes(x))}
  if(!ok)return {success:false,error:'illegal move '+JSON.stringify(m)};const p=P(s);
  switch(m.act){
  case 'q':answerQ(m.i);break;
  case 'bid':doBid(m);break;
  case 'start':pickUp(m.tile);break;
  case 'undo':{const mv=G.move;G.board[mv.start].m=mv.hand.slice();G.move=null;lg(`${p.nm} sets them back down.`);break}
  case 'step':dropAt(m.tile,m.c);break;
  case 'tribe':doTribe(m);break;
  case 'thief':useThief(p,m);break;
  case 'tile':doTile(m);break;
  case 'djinn':p.used[m.k]=1;runDjinn(p,m);break;
  case 'item':useItem(p,m);break;
  case 'sell':doSell(m);break;
  case 'end':endTurn();break}
  G.stats.moves++;if(typeof refresh==='function'&&!UI.sim)refresh();return {success:true}}
// ---------- scoring ----------
function lakeNear(i){return AROUND(i).some(j=>G.board[j].k==='lake')}
function scoreOf(p){const s={coins:p.coins,advisors:0,sages:0,crafters:0,djinns:0,tiles:0,palms:0,palaces:0,goods:0,items:0,cities:0};
  s.advisors=p.vz*(hasDj(p,'wazira')?3:1);for(const q of G.pl)if(q.i!==p.i&&q.vz<p.vz)s.advisors+=10;
  s.sages=p.el*(hasDj(p,'hikma')?4:2);
  if(G.ex.artisans){const most=G.pl.every(q=>q.art<=p.art);s.crafters=p.art*(most?3:2)+(hasDj(p,'sana')?2*p.art:0);
    for(const k of p.items)if(ITEMS[k].kind==='precious')s.items+=ITEMS[k].vp+(hasDj(p,'jawhar')?3:0)}
  for(const k of p.dj)s.djinns+=DJ[k].vp;if(hasDj(p,'majlis'))s.djinns+=5*p.dj.length;
  let cities=0;for(const t of G.board){const own=owner(t);if(own!==p.i)continue;s.tiles+=t.v;const dbl=G.ex.sultan&&lakeNear(t.i)?2:1;s.palms+=t.palm*(hasDj(p,'nakhla')?5:3)*dbl;s.palaces+=t.pal*5*dbl;
    if(t.tent===p.i)s.tiles+=AROUND(t.i).filter(j=>!G.board[j].blue&&!G.board[j].block).length;if(t.k==='city')cities++}
  if(cities)s.cities=5*cities*cities;
  s.goods=goodsBest(p);s.total=Object.values(s).reduce((a,b)=>a+b,0);return s}
function goodsScore(res){const c={};for(const r of res)c[r]=(c[r]||0)+1;let tot=0;while(true){const kinds=Object.keys(c).filter(k=>c[k]>0);if(!kinds.length)break;tot+=SETVP[Math.min(kinds.length,9)];for(const k of kinds)c[k]--}return tot}
// Zarifa: every 2 Mystics = 1 wild goods card; pick the kinds that score best
function goodsBest(p){const w=hasDj(p,'zarifa')?Math.floor(p.fk/2):0;if(!w)return goodsScore(p.res);const kinds=Object.keys(RNAME).filter(k=>k!=='fakir');let best=0;
  const rec=(res,left)=>{if(!left){best=Math.max(best,goodsScore(res));return}for(const k of kinds)rec(res.concat([k]),left-1)};if(w<=3)rec(p.res,w);else{let r=p.res.slice();for(let i=0;i<w;i++){let bk=kinds[0],bv=-1;for(const k of kinds){const v=goodsScore(r.concat([k]));if(v>bv){bv=v;bk=k}}r.push(bk)}best=goodsScore(r)}return best}
function finish(){if(G.over)return;const sc=G.pl.map(p=>({p,s:scoreOf(p)}));sc.sort((a,b)=>b.s.total-a.s.total);const top=sc[0].s.total;const winners=sc.filter(x=>x.s.total===top).map(x=>x.p);
  G.over={scores:sc.map(x=>({p:x.p.i,s:x.s})),win:winners.map(w=>w.i)};G.winner=winners.map(w=>w.nm).join(' & ');G.winText=`${G.winner} ${winners.length>1?'share the win':'wins'} with ${top} points.`;G.phase='over';lg('🏆 '+G.winText,'big');fx('win')}
// ---------- invariants and test hooks ----------
function checkInvariants(){const v=[];if(!G)return v;let n=G.bag.length;for(const t of G.board){n+=t.m.length;if(t.block&&t.m.length)v.push('meeple on a blocked tile')}if(G.move)n+=G.move.hand.length;if(G.act&&!G.act.tribeDone)n+=G.act.n;
  for(const p of G.pl){n+=p.vz+p.el+p.art;if(p.coins<0)v.push(p.nm+' coins negative');if(p.fk<0)v.push(p.nm+' mystics negative');if(p.camels<0)v.push('camels negative');if(p.el<0||p.vz<0||p.art<0)v.push('kept meeples negative')}
  if(n!==G.meepleTotal)v.push(`meeples ${n} != ${G.meepleTotal}`);
  const cards=G.market.length+G.rdeck.length+G.rdisc.length+G.pl.reduce((a,p)=>a+p.res.length+p.fk,0);if(cards!==54)v.push('goods cards '+cards);
  if(!G.over&&sideToAct()<0)v.push('stuck in '+G.phase+'/'+G.step);if(!G.over&&!G.q&&!validMoves().length)v.push('no legal move in '+G.phase+'/'+G.step);return v}
function render_game_to_text(){if(!G)return '{}';return JSON.stringify({round:G.round,phase:G.phase,step:G.step,cur:G.cur,q:G.q&&G.q.title,move:G.move&&{at:G.move.at,hand:G.move.hand},act:G.act,pl:G.pl.map(p=>({nm:p.nm,coins:p.coins,camels:p.camels,vz:p.vz,el:p.el,dj:p.dj,res:p.res.length,fk:p.fk})),log:G.log.slice(0,5).map(l=>l.t)})}
QH.ruya=d=>{gainDjinn(P(d.p),d.k);G.djDisc.push(...d.top.filter(x=>x!==d.k))};

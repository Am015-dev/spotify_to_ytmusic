// ===================== Tidewake engine =====================
// G is plain JSON. Every change goes through performMove(). Engine steps waiting to run sit on the agenda G.ag as {h,d}
// (handler key + data, never closures); a pending question (a choice, an interrupt, a bonus swap) is G.q={who,kind,title,opts:[{l,h,d}]}
// and is answered with the move {a:'q',i}. Cards are ints: 0-55 currents, 56 Rift Gate, 57-61 Deck Cannons. Leviathan ids: 0-9, 10 Rogue Wave, 11 Maelstrom.
var ANIM=1,AIDELAY=500,DEFSEED=null,TUT=null;   // TUT: the staged tutorial's dice script (kind,arg)=>value|null; null = real diceconst SAVE='tidewake_save1';
let G=null;const UI={sim:0};
function rnd(n){let t=(G.rng=(G.rng+0x6D2B79F5)|0);t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return Math.floor(((t^t>>>14)>>>0)/4294967296*n)}
function setSeed(s){DEFSEED=s>>>0;if(G)G.rng=s>>>0}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
const d6=()=>1+rnd(6);
const clone=o=>JSON.parse(JSON.stringify(o));
function lg(t,c){G.logN++;G.log.unshift({t,c:c||'',i:G.logN,turn:G.turn});if(G.log.length>300)G.log.length=300}
function stat(k){G.stats[k]=(G.stats[k]||0)+1}
const DIR=[[0,-1],[1,0],[0,1],[-1,0]],MATE=[5,4,7,6,1,0,3,2],DNAME=['north','east','south','west'];
const isCannon=c=>c>=57,isGate=c=>c===56,isCur=c=>c<56;
const inB=(x,y)=>x>=0&&y>=0&&x<BW&&y<BW;
const SN=i=>SHIP_NAMES[i];
const levName=id=>id<10?LEV[id].nm:id===WAVE_ID?WAVE_NAME:MAEL_NAME;
// ---------- board helpers (take the state B: G itself or a knowledge view; never touch G.rng) ----------
const cellAt=(B,x,y)=>B.bd[y*BW+x];
function monAt(B,x,y){for(const m of B.mons)if(m.x===x&&m.y===y)return m;return null}
function gateAt(B,x,y){for(const g of B.gates)if(g.x===x&&g.y===y)return g;return null}
function levCount(B){let n=0;for(const m of B.mons)if(m.k==='L')n++;return n}
const teamOf=(B,i)=>B.team?B.team[i]:i;
const sameTeam=(B,a,b)=>B.variant==='teams'?B.team[a]===B.team[b]:a===b;
function exitPort(cell,e){return ROTP[CUR_TYPE[cell[0]]][cell[1]][e]}
// follow a ship that enters square (x,y) at port e through the chained tiles until the open end
function follow(B,x,y,e){const path=[];let cx=x,cy=y,ce=e,last=null,n=0;
  for(;;){const cell=cellAt(B,cx,cy);if(!cell)return {st:'ok',x:cx,y:cy,e:ce,on:last,path};
    const q=exitPort(cell,ce);path.push([cx,cy]);last=[cx,cy];const dd=DIR[q>>1],nx=cx+dd[0],ny=cy+dd[1];
    if(!inB(nx,ny))return {st:'edge',last,path};
    const m=monAt(B,nx,ny);if(m)return {st:'mon',id:m.id,x:nx,y:ny,last,path};
    if(gateAt(B,nx,ny))return {st:'gate',x:nx,y:ny,last,path};
    const c2=cellAt(B,nx,ny);if(!c2)return {st:'ok',x:nx,y:ny,e:MATE[q],on:last,path};
    cx=nx;cy=ny;ce=MATE[q];if(++n>90)return {st:'edge',last,path,loop:1}}}
const posSq=s=>s.on||(s.x!=null?[s.x,s.y]:null);
function freeSq(B,x,y){return inB(x,y)&&!cellAt(B,x,y)&&!monAt(B,x,y)&&!gateAt(B,x,y)}
// every start mark: (front square, port on that square at the board edge)
function startMarks(B,seat){const o=[];for(let y=0;y<BW;y++)for(let x=0;x<BW;x++){if(!freeSq(B,x,y))continue;
  const es=[];if(y===0)es.push(0,1);if(x===BW-1)es.push(2,3);if(y===BW-1)es.push(4,5);if(x===0)es.push(6,7);
  for(const e of es){if(B.ships.some(s=>s.i!==seat&&s.alive&&s.x===x&&s.y===y&&s.e===e&&!s.on))continue;o.push({x,y,e})}}return o}
// what happens if tile `tile` turned `rot` is placed on (fx,fy): every ship waiting there moves; collisions; pure
function simPlace(B,fx,fy,tile,rot){const old=B.bd[fy*BW+fx];B.bd[fy*BW+fx]=[tile,rot];const res={};
  const movers=B.ships.filter(s=>s.alive&&s.x===fx&&s.y===fy);for(const s of movers)res[s.i]=follow(B,fx,fy,s.e);
  B.bd[fy*BW+fx]=old;const keys={};
  for(const i in res){const r=res[i];if(r.st==='ok')(keys[r.x+','+r.y+','+r.e]=keys[r.x+','+r.y+','+r.e]||[]).push(+i)}
  for(const s of B.ships){if(!s.alive||s.x==null||res[s.i])continue;const k=s.x+','+s.y+','+s.e;if(keys[k])keys[k].push(s.i)}
  const coll=[];for(const k in keys)if(keys[k].length>1)coll.push(...keys[k]);
  return {res,coll,movers:movers.map(s=>s.i)}}
function shipsPlayable(B,seat){const o=[];for(const s of B.ships){if(!s.alive||s.x==null)continue;if(s.i!==seat&&!(B.variant==='teams'&&sameTeam(B,s.i,seat)))continue;if(!freeSq(B,s.x,s.y))continue;o.push(s.i)}return o}
function adjMons(B,s){const o=[];const sq=[[s.x,s.y]];if(s.on)sq.push(s.on);for(const m of B.mons){if(m.k!=='L')continue;for(const [a,b] of sq)if(Math.abs(m.x-a)+Math.abs(m.y-b)===1){o.push(m.id);break}}return o}
// legal moves from any state view B (G or knowledge)
function genMoves(B,seat){
  if(B.phase==='over')return [];
  if(B.q){if(B.q.who!==seat)return [];return B.q.opts.map((o,i)=>({a:'q',i,l:o.l}))}
  if(B.phase==='setup'){if(B.order[B.sp]!==seat)return [];return startMarks(B,seat).map(k=>({a:'start',x:k.x,y:k.y,e:k.e}))}
  if(B.step!=='act'||B.cur!==seat)return [];
  const hand=B.hands[seat],out=[],bad=[];const ps=shipsPlayable(B,seat);
  for(const sh of ps){const S=B.ships[sh];
    hand.forEach((c,t)=>{if(isCur(c)){for(let r=0;r<4;r++){const sim=simPlace(B,S.x,S.y,c,r);
        let pr=sim.coll.length>0;for(const i in sim.res){const st=sim.res[i].st;if((st==='edge'||st==='mon')&&sameTeam(B,+i,seat))pr=true}
        (pr?bad:out).push({a:'place',t,r,s:sh})}}
      else if(isGate(c))out.push({a:'gate',t,s:sh});
      else if(isCannon(c))for(const id of adjMons(B,S))out.push({a:'cannon',t,m:id,s:sh})})}
  // prohibited placements (own wake to the edge or a leviathan, two ships on one wake in one direction) only when nothing else is legal
  const fine=out.some(m=>m.a==='place');const all=fine||out.length?out.concat(fine?[]:bad):bad;
  return all.length?all:[{a:'pass'}]}
function describeMove(m){if(!m)return '';switch(m.a){case 'start':return `start at column ${m.x+1}, row ${m.y+1}, port ${m.e}`;
  case 'place':return `place tile #${m.t+1} turned ${m.r*90} degrees`+(m.s!=null&&G&&m.s!==G.cur?` for ${SN(m.s)}`:'');case 'gate':return 'play the Rift Gate';
  case 'cannon':return `fire a Deck Cannon at ${levName(m.m)}`;case 'pass':return 'pass (no tile to play)';
  case 'q':return m.l||(G&&G.q&&G.q.opts[m.i]?G.q.opts[m.i].l:'answer '+m.i);default:return m.a}}
// ---------- agenda ----------
function now(h,d){G.ag.splice(G.agI++,0,{h,d:d||{}})}
function later(h,d){G.ag.push({h,d:d||{}})}
const AG={},QH={};
function ask(who,kind,title,opts,ctx){if(!opts.length)return false;G.q={who,kind,title,opts,ctx:ctx||{}};return true}
function flow(){let g=0;while(G&&G.phase!=='over'&&!G.q&&G.ag.length&&g++<4000){const x=G.ag.shift();G.agI=0;AG[x.h](x.d)}G.agI=0;
  if(g>=4000)throw new Error('agenda runaway')}
// ---------- setup ----------
function newGame(o){o=o||{};const seed=o.seed!=null?o.seed>>>0:DEFSEED!=null?DEFSEED:Math.floor(Math.random()*2**31);
  const variant=o.variant||null;const solo=variant==='solo'||variant==='easysolo';
  let np=solo?1:Math.max(2,Math.min(8,o.players||o.np||2));if(variant==='teams'){if(np<4)np=4;else if(np%2)np--}  // teams: 4, 6 or 8 players only (two equal teams)
  const ex=Object.assign({rift:0,wave:0,maelstrom:0,cannon:0},o.exp||{});
  G={v:1,seed,rng:seed,np,variant,exp:ex,opts:{noMon:!!o.noMon,goal:o.goalTurns||24},phase:'setup',step:null,turn:0,cur:-1,first:0,order:[],sp:0,
    ships:[],hands:[],team:null,seats:[],deck:[],gone:[],limbo:null,mdeck:[],mons:[],mgone:[],wave:null,gates:[],bd:new Array(BW*BW).fill(null),
    dice:[0,0],refill:false,arr:null,mq:[],placeElim:[],pool:[],bq:null,batch:[],over:null,ag:[],agI:0,q:null,log:[],logN:0,stats:{}};
  G.first=o.first!=null?o.first%np:rnd(np);
  for(let i=0;i<np;i++){const sd=o.seats?o.seats[i]:o.mode==='hot'?'human':(o.mode==='solo'&&i===0)?'human':'ai';
    const hum=sd==='human'||(sd&&sd.human);G.seats.push({i,nm:(o.names&&o.names[i])||SN(i),human:!!hum,lv:(o.lv&&o.lv[i])||(sd&&sd.lv)||o.level||'normal'});
    G.ships.push({i,x:null,y:null,e:null,on:null,alive:true,moved:false,tp:null,out:''});G.hands.push([]);G.order.push((G.first+i)%np)}
  if(variant==='teams'){G.team=[];for(let i=0;i<np;i++)G.team.push(i%2)}
  const ids=[];for(let i=0;i<NCUR;i++)ids.push(i);if(ex.rift)ids.push(GATE_ID);if(ex.cannon)for(const c of CANNON_IDS)ids.push(c);G.deck=shuffle(ids);
  const mids=[];for(let i=0;i<10;i++)mids.push(i);if(ex.wave)mids.push(WAVE_ID);if(ex.maelstrom)mids.push(MAEL_ID);
  if(G.opts.noMon){G.mgone=mids}else G.mdeck=shuffle(mids);
  lg(`Tidewake: ${np} captain${np>1?'s':''}${variant?' ('+variant+')':''}. ${SN(G.order[0])} sails first.`,'big');
  for(let i=0;i<np;i++)later('draw',{seat:G.order[i]});
  if(o.bossCannon)later('bossCannon',{seat:o.bossSeat||1,n:o.bossCannon});
  if(!G.opts.noMon)later('setupMon',{n:(solo?(o.soloLev||(variant==='easysolo'?4:6)):LEV_AT_START[np]),placed:0});
  flow();return G}
AG.bossCannon=d=>{const h=G.hands[d.seat];if(!h)return;for(let k=0;k<d.n;k++){if(h.filter(isCannon).length>=2)break;const di=G.deck.findIndex(isCannon);if(di<0)break;const hi=h.map((c,i)=>isCannon(c)?-1:i).filter(i=>i>=0).pop();if(hi==null)break;const cn=G.deck.splice(di,1)[0],old=h[hi];h[hi]=cn;G.deck.push(old);stat('bossCannon')}};  // campaign twist: the boss starts with a Deck Cannon
AG.setupMon=d=>{if(d.placed>=d.n||!G.mdeck.length){now('fill',{});return}  // min-3 rule applies from the start (specials drawn at set-up may leave fewer than 3 leviathans)
  now('spawn',{});now('setupMon',{n:d.n,placed:d.placed+1})}  // literal rule: every tile drawn at set-up (incl. Rogue Wave / Maelstrom) counts toward 6/5/4;
// ---------- draw ----------
AG.draw=d=>{if(!G.ships[d.seat].alive)return;const h=G.hands[d.seat];while(h.length<3&&G.deck.length){const c=G.deck.shift();
  if(isCannon(c)){if(h.filter(isCannon).length>=2){G.gone.push(c);lg(`${G.seats[d.seat].nm} already holds two Deck Cannons and discards a third.`);stat('cannonDiscard');continue}
    G.limbo=c;ask(d.seat,'cannonDraw','You drew a Deck Cannon. Keep it, or show it and discard it for a replacement?',[{l:'Keep the Deck Cannon',h:'cKeep',d:{seat:d.seat}},{l:'Show it and discard it',h:'cDiscard',d:{seat:d.seat}}],{});return}
  h.push(c)}};
QH.cKeep=d=>{G.hands[d.seat].push(G.limbo);G.limbo=null;stat('cannonKeep');now('draw',{seat:d.seat})};
QH.cDiscard=d=>{G.gone.push(G.limbo);G.limbo=null;lg(`${G.seats[d.seat].nm} shows a Deck Cannon and discards it.`);stat('cannonDiscard');now('draw',{seat:d.seat})};
// ---------- monsters ----------
const monById=id=>G.mons.find(m=>m.id===id)||null;
const monExists=id=>!!monById(id)||(G.arr&&G.arr.id===id);
function tileToDeck(c){if(G.variant==='easysolo')G.gone.push(c);else G.deck.push(c)}
function destroyTile(x,y,gone){const c=cellAt(G,x,y);if(!c)return;G.bd[y*BW+x]=null;if(gone)G.gone.push(c[0]);else tileToDeck(c[0]);stat('tileDestroyed');lg(`A current at column ${x+1}, row ${y+1} is torn from the sea.`)}
function rollSq(avoidMon){let x,y,k=0;do{x=d6()-1;y=d6()-1;k++}while(k<200&&(monAt(G,x,y)&&avoidMon||gateAt(G,x,y)));return [x,y]}
AG.spawn=d=>{if(!G.mdeck.length){lg('The deep stirs, but no leviathan is left to rise.');return}
  const id=G.mdeck.shift();
  if(id===WAVE_ID){const [x,y]=rollSq(false);const own=G.cur>=0?G.cur:(G.first+G.np-1)%G.np;G.wave={x,y,r:rnd(4),n:0,owner:own,pt:G.turn};stat('waveSpawn');lg(`A Rogue Wave rises at column ${x+1}, row ${y+1}, heading ${DNAME[G.wave.r]}.`,'big');return}
  const [x,y]=rollSq(true);G.arr={id,k:id===MAEL_ID?'M':'L',x,y,r:rnd(4),dead:[],spawn:1};stat(id===MAEL_ID?'maelSpawn':'levSpawn');
  lg(`${levName(id)} rises at column ${x+1}, row ${y+1}.`,'big');now('arrive',{})};
AG.arrive=d=>{const a=G.arr;if(!a)return;
  const sh=G.ships.filter(s=>s.alive&&s.on&&s.on[0]===a.x&&s.on[1]===a.y);
  for(const s of sh)now('doom',{seat:s.i,cause:{k:'mon',id:a.id,arr:1},near:[a.x,a.y]});now('arrFinal',{})};
AG.arrFinal=d=>{const a=G.arr;if(!a)return;G.arr=null;
  const old=monById(a.id);const other=monAt(G,a.x,a.y);
  if(a.k==='L'&&other&&other.k==='M'){if(old)G.mons.splice(G.mons.indexOf(old),1);G.mgone.push(a.id);stat('levSwallowed');lg(`${levName(a.id)} is swallowed by the Maelstrom.`);return}
  if(other&&other!==old){G.mons.splice(G.mons.indexOf(other),1);G.mgone.push(other.id);stat(a.k==='L'?'levCrush':'maelEatLev');lg(`${levName(a.id)} destroys ${levName(other.id)}.`)}
  if(cellAt(G,a.x,a.y)){destroyTile(a.x,a.y,a.k==='M');} // the whirlpool removes the tile from the game (leviathans recycle it)
  for(const sh of G.ships)if(sh.alive&&sh.on&&sh.on[0]===a.x&&sh.on[1]===a.y&&!a.dead.includes(sh.i))a.dead.push(sh.i); // e.g. a ship that rode a rift wake onto the doomed square meanwhile
  for(const i of a.dead)if(G.ships[i].alive){eliminate(i,'was crushed by '+levName(a.id),false);stat(a.k==='L'?'levKillShip':'maelKillShip')}
  if(old){old.x=a.x;old.y=a.y;old.r=a.r}else G.mons.push({id:a.id,k:a.k,x:a.x,y:a.y,r:a.r})};
function removeMon(id,why){const m=monById(id);if(m)G.mons.splice(G.mons.indexOf(m),1);if(G.arr&&G.arr.id===id)G.arr=null;if(why==='cannon')G.mdeck.push(id);else G.mgone.push(id)}
AG.roll=d=>{if(G.opts.noMon)return;
  if(G.refill){G.refill=false;stat('refill');lg('The sea restores its leviathans; no monster roll this turn.');now('fill',{});now('check',{clear:1});return}
  const tv=TUT&&TUT('roll');const a=tv?tv[0]:d6(),b=tv?tv[1]:d6();G.dice=[a,b];const t=a+b;lg(`${G.seats[G.cur].nm} rolls ${a}+${b}=${t}.`);
  if(t>=6&&t<=8){stat('monRoll');now('monList',{})}else{stat('calmRoll');if(G.mons.some(m=>m.k==='M'))now('mael',{})}};
AG.monList=d=>{G.mq=G.mons.filter(m=>m.k==='L').map(m=>m.id).sort((a,b)=>LEV[a].order-LEV[b].order||LEV[b].gold-LEV[a].gold||a-b);now('monStep',{});now('afterMon',{})};
AG.monStep=d=>{while(G.mq.length&&!monById(G.mq[0]))G.mq.shift();if(!G.mq.length)return;const id=G.mq.shift();now('monAct',{id,die:(TUT&&TUT('mon',id))||d6()});now('monStep',{})};
AG.monAct=d=>{const m=monById(d.id);if(!m)return;
  if(d.die===6){stat('spawn6');lg(`${levName(m.id)} stays put: a new leviathan rises instead.`);now('spawn',{});return}
  const a=LEV[m.id].arr[d.die-1];
  if(a==='R'){m.r=(m.r+LEV[m.id].rd+4)%4;stat('levTurn');lg(`${levName(m.id)} turns ${LEV[m.id].rd>0?'clockwise':'anticlockwise'}.`);return}
  moveTo(m,(DIRN[a]+m.r)%4)};
function moveTo(m,dir){let tx=m.x+DIR[dir][0],ty=m.y+DIR[dir][1];
  if(!inB(tx,ty)){removeMon(m.id,'off');stat('monOff');lg(`${levName(m.id)} swims off the chart.`);return}
  if(gateAt(G,tx,ty)){[tx,ty]=rollSq(true);stat('gateMon');lg(`${levName(m.id)} is flung through a Rift Gate.`)}
  stat('levMove');lg(`${levName(m.id)} moves ${DNAME[dir]}.`);
  G.arr={id:m.id,k:m.k,x:tx,y:ty,r:m.r,dead:[],move:1};now('arrive',{})}
AG.mael=d=>{const m=G.mons.find(x=>x.k==='M');if(!m)return;const die=d6(),a=MAEL_ARR[die-1];
  if(!a){lg('The Maelstrom churns in place.');return}
  const dir=DIRN[a];let tx=m.x+DIR[dir][0],ty=m.y+DIR[dir][1];
  if(inB(tx,ty)&&gateAt(G,tx,ty)){[tx,ty]=rollSq(true);stat('gateMon')}
  if(!inB(tx,ty)){removeMon(m.id,'off');stat('maelOff');lg('The Maelstrom drains off the chart.');return}
  stat('maelMove');lg(`The Maelstrom moves ${DNAME[dir]}.`);G.arr={id:m.id,k:'M',x:tx,y:ty,r:0,dead:[],move:1};now('arrive',{});now('refillCheck',{})};
AG.refillCheck=d=>{if(!G.opts.noMon&&levCount(G)<3&&G.mdeck.some(x=>x<10))G.refill=true;now('check',{clear:1})};
AG.afterMon=d=>{if(!G.opts.noMon&&levCount(G)<3&&G.mdeck.some(x=>x<10))G.refill=true;now('check',{clear:1})};
AG.fill=d=>{if(levCount(G)<3&&G.mdeck.length){now('spawn',{});now('fill',{})}};
// ---------- wave ----------
const waveStr=()=>G.wave?(G.wave.n===0?2:G.wave.n<3?3:4):0;
function inRow(sq){const w=G.wave;if(!w||!sq)return false;return (w.r&1)?sq[0]===w.x:sq[1]===w.y}
function waveSlot(s){const w=G.wave;if(!w||w.owner!==s||G.turn+1<=w.pt)return false;
  w.x+=DIR[w.r][0];w.y+=DIR[w.r][1];w.n++;stat('waveMove');
  if(!inB(w.x,w.y)){G.wave=null;G.mgone.push(WAVE_ID);stat('waveOff');lg('The Rogue Wave breaks on the far shore and is gone.');return true}
  lg(`The Rogue Wave rolls ${DNAME[w.r]} (strength ${waveStr()}).`);return true}
AG.waveRoll=d=>{const s=G.ships[d.seat];if(!s.alive||!G.wave)return;const sq=posSq(s);if(!inRow(sq))return;const r=(TUT&&TUT('wave',d.seat))||d6(),need=waveStr();stat('waveCheck');
  if(r>=need){lg(`${G.seats[d.seat].nm} rides the Rogue Wave (rolled ${r}, needed ${need}).`);return}
  stat('waveCapsize');lg(`${G.seats[d.seat].nm} rolls ${r} against the Rogue Wave (needs ${need}) and capsizes!`,'bad');now('doom',{seat:d.seat,cause:{k:'wave'},near:sq})};
// ---------- turns ----------
AG.turnStart=d=>{if(G.phase!=='play')return;let s=G.cur,k=0,waved=false;
  for(;k<G.np*2;k++){s=(s+1)%G.np;if(waveSlot(s)&&G.ships[s].alive)waved=true;if(G.ships[s].alive)break;waved=false}
  if(!G.ships[s].alive)return;
  for(const sh of G.ships)sh.gc=0;G.cur=s;G.turn++;G.placeElim=[];G.batch=[];G.pool=[];G.step=null;lg(`Turn ${G.turn}: ${G.seats[s].nm}.`,'turn');
  if(waved){now('waveRoll',{seat:s});now('check',{clear:1})}now('roll',{});now('blockCheck',{});now('openAct',{})};
AG.blockCheck=d=>{const s=G.ships[G.cur];if(!s.alive||s.x==null)return;const m=monAt(G,s.x,s.y);
  if(m){stat('blocked');lg(`${levName(m.id)} sits in front of ${G.seats[G.cur].nm}'s junk.`);now('doom',{seat:G.cur,cause:{k:'mon',id:m.id,blk:1},near:[s.x,s.y]})}
  now('check',{clear:1})};
AG.openAct=d=>{if(G.phase!=='play')return;if(!G.ships[G.cur].alive){now('turnStart',{});return}G.step='act'};
AG.endTurn=d=>{G.step=null;now('turnStart',{})};
// ---------- elimination ----------
function eliminate(seat,why,bonus){const s=G.ships[seat];if(!s.alive)return;s.alive=false;s.out=why;s.x=s.y=s.e=null;s.on=null;s.tp=null;stat('elim');
  G.batch.push(seat);lg(`${G.seats[seat].nm}'s junk ${why}.`,'bad');
  const h=G.hands[seat];G.hands[seat]=[];
  if(bonus&&G.variant!=='teams'||bonus&&G.team[seat]!==G.team[G.cur]){G.pool.push(...h);G.placeElim.push(seat)}else for(const c of h)G.deck.push(c)}
AG.check=d=>{const batch=G.batch;if(d.clear)G.batch=[];checkEnd(batch)};
function checkEnd(batch){if(G.phase!=='play')return;const A=G.ships.filter(s=>s.alive).map(s=>s.i);let win=null,why='';
  if(G.variant==='solo'){if(!A.length){finish([],'The last junk went down.');return}
    if(!G.mdeck.some(x=>x<10)&&levCount(G)===0&&!G.arr&&!G.opts.noMon){finish([0],'You outlasted every leviathan!');return}return}
  if(G.variant==='easysolo'){if(!A.length){finish([],'The last junk went down.');return}
    if(!G.deck.length&&!G.hands[0].length&&!G.limbo){finish([0],'You sailed through every current!');return}
    if(G.turn>=G.opts.goal){finish([0],`You kept afloat for ${G.turn} turns!`);return}return}
  if(G.variant==='teams'){const T=new Set(A.map(i=>G.team[i]));
    if(T.size===1){const t=[...T][0];finish(G.ships.filter((s,i)=>G.team[i]===t).map(s=>s.i),`Team ${t+1} is the last afloat.`)}
    else if(!T.size){const t=new Set(batch.map(i=>G.team[i]));finish(G.ships.filter((s,i)=>t.has(G.team[i])).map(s=>s.i),'Every team went down together.')}return}
  if(A.length===1)finish([A[0]],`${SN(A[0])} is the last junk afloat.`);
  else if(!A.length)finish(batch.length?batch.slice():[G.cur],'The last junks sank together: they share the win.')}
function finish(win,why){G.over={win,why};G.phase='over';G.step=null;G.q=null;G.ag=[];lg(why,'big');stat('over')}
// ---------- dooms and interrupts ----------
function gateCands(seat,near){const out=[];const n=near||posSq(G.ships[seat]);if(!n)return out;
  for(const dd of DIR){const x=n[0]+dd[0],y=n[1]+dd[1];if(freeSq(G,x,y)&&!G.ships.some(s=>s.alive&&s.x===x&&s.y===y&&s.i!==seat&&false))out.push([x,y])}return out}
AG.doom=d=>{const s=G.ships[d.seat];if(!s.alive)return;const c=d.cause;
  if(c.k==='mon'&&!monExists(c.id))return;
  if(c.arr&&!G.arr)return;
  const hand=G.hands[d.seat],opts=[];
  if(c.k==='mon'&&c.id<10&&hand.some(isCannon))opts.push({l:`Fire a Deck Cannon at ${levName(c.id)}`,h:'dCannon',d:{seat:d.seat,cause:c,near:d.near}});
  if(hand.includes(GATE_ID)&&gateCands(d.seat,d.near).length)opts.push({l:'Play the Rift Gate to escape',h:'dGate',d:{seat:d.seat,cause:c,near:d.near}});
  if(c.blk&&!s.on&&!s.moved){for(const k of startMarks(G,d.seat)){if((k.e>>1)===(s.e>>1)&&!(k.x===s.x&&k.y===s.y))opts.push({l:`Relocate to column ${k.x+1}, row ${k.y+1}`,h:'dReloc',d:{seat:d.seat,x:k.x,y:k.y,e:k.e}})}}
  if(!opts.length){doomEnd(d.seat,c);return}
  opts.push({l:'Accept your fate',h:'dAccept',d:{seat:d.seat,cause:c}});
  ask(d.seat,'doom',`${G.seats[d.seat].nm}'s junk is about to be lost (${doomWhy(c)}).`,opts,{cause:c})};
function doomWhy(c){return c.k==='edge'?'sailing off the board':c.k==='wave'?'capsized by the Rogue Wave':c.blk?`blocked by ${levName(c.id)}`:`${levName(c.id)}`}
function doomEnd(seat,c){if(c.arr&&G.arr){G.arr.dead.push(seat);return}
  const why=c.k==='edge'?'sailed off the edge of the chart':c.k==='wave'?'capsized in the Rogue Wave':c.blk?'was blocked in by '+levName(c.id):'ran into '+levName(c.id);
  if(c.k==='edge')stat('edgeKill');else if(c.k==='mon'&&c.path)stat('pathMonKill');
  eliminate(seat,why,!!c.bonus)}
QH.dAccept=d=>doomEnd(d.seat,d.cause);
QH.dCannon=d=>{const h=G.hands[d.seat];const i=h.findIndex(isCannon);G.gone.push(h.splice(i,1)[0]);const id=d.cause.id;
  lg(`${G.seats[d.seat].nm} fires a Deck Cannon and destroys ${levName(id)}!`,'big');stat('cannonSave');removeMon(id,'cannon');
  if(!G.opts.noMon&&levCount(G)<3&&G.mdeck.some(x=>x<10))G.refill=true;
  if(d.cause.path)now('moveShip',{seat:d.seat,bonus:d.cause.bonus})};
QH.dReloc=d=>{const s=G.ships[d.seat];s.x=d.x;s.y=d.y;s.e=d.e;stat('relocate');lg(`${G.seats[d.seat].nm} relocates the start.`)};
QH.dGate=d=>{const opts=gateCands(d.seat,d.near).map(([x,y])=>({l:`Place the Rift Gate at column ${x+1}, row ${y+1}`,h:'dGateAt',d:{seat:d.seat,x,y,cause:d.cause}}));
  ask(d.seat,'gateSq','Where does the Rift Gate go?',opts,{})};
QH.dGateAt=d=>{const h=G.hands[d.seat];h.splice(h.indexOf(GATE_ID),1);stat('gateRescue');putGate(d.x,d.y);
  const s=G.ships[d.seat];s.on=[d.x,d.y];s.x=s.y=s.e=null;lg(`${G.seats[d.seat].nm} escapes through a Rift Gate.`,'big');now('gateShip',{seat:d.seat});
  const ord=turnOrderFrom(((G.cur<0?0:G.cur)+1)%G.np);for(const i of ord){const o=G.ships[i];if(i!==d.seat&&o.alive&&o.x===d.x&&o.y===d.y){o.on=[d.x,d.y];o.x=o.y=o.e=null;o.moved=true;now('gateShip',{seat:i})}}};
function putGate(x,y){G.gates.push({x,y});stat('gatePlay')}
// ---------- Rift Gate transport ----------
AG.gateShip=d=>{const s=G.ships[d.seat];if(!s.alive)return;const hasTile=G.hands[d.seat].some(isCur);let tx,ty,k=0;
  for(;k<50;k++){const a=d6(),b=d6();tx=a-1;ty=b-1;if(monAt(G,tx,ty)||gateAt(G,tx,ty))continue;if(!cellAt(G,tx,ty)&&!hasTile)continue;break}
  if(k>=50){eliminate(d.seat,'was lost in the rift',false);return}
  s.tp={x:tx,y:ty};stat('gateTeleport');lg(`${G.seats[d.seat].nm} is carried to column ${tx+1}, row ${ty+1}.`);
  if(cellAt(G,tx,ty))gateWake(d.seat,tx,ty);
  else{const opts=[];G.hands[d.seat].forEach((c,i)=>{if(isCur(c))for(let r=0;r<4;r++)opts.push({l:`Place tile #${i+1} turned ${r*90} degrees`,h:'gPlace',d:{seat:d.seat,i,r,tx,ty}})});
    ask(d.seat,'gatePlace','Place a current where the rift lands you.',opts,{tx,ty})}};
QH.gPlace=d=>{const h=G.hands[d.seat];const c=h.splice(d.i,1)[0];G.bd[d.ty*BW+d.tx]=[c,d.r];lg(`${G.seats[d.seat].nm} lays a current at column ${d.tx+1}, row ${d.ty+1}.`);
  for(const s of G.ships)if(s.alive&&s.i!==d.seat&&s.x===d.tx&&s.y===d.ty)now('moveShip',{seat:s.i});now('gateWakeAsk',{seat:d.seat,tx:d.tx,ty:d.ty})};
AG.gateWakeAsk=d=>{if(G.ships[d.seat].alive)gateWake(d.seat,d.tx,d.ty)};
function gateWake(seat,tx,ty){const taken=new Set(G.ships.filter(s=>s.alive&&s.i!==seat&&s.x!=null).map(s=>s.x+','+s.y+','+s.e));
  const all=[],good=[];for(let p=0;p<8;p++){const r=follow(G,tx,ty,p);const o={l:`Ride the wake from port ${p} (${r.st==='ok'?'to the open end':r.st==='gate'?'into a Rift Gate':r.st==='edge'?'off the board':'into a leviathan'})`,h:'gWake',d:{seat,tx,ty,p}};
    all.push(o);if(r.st==='gate'&&(G.ships[seat].gc||0)>=2)continue;if(!(r.st==='ok'&&taken.has(r.x+','+r.y+','+r.e)))good.push(o)}
  const fin=good.length?good:all.filter(o=>follow(G,tx,ty,o.d.p).st!=='gate'||(G.ships[seat].gc||0)<2);
  ask(seat,'gateWake','Choose which wake to follow, and in which direction.',fin.length?fin:all,{tx,ty})}
QH.gWake=d=>{const r=follow(G,d.tx,d.ty,d.p);G.ships[d.seat].tp=null;applyRes(d.seat,r,{});now('collide',{})};
function applyRes(seat,r,o){const s=G.ships[seat];s.moved=true;
  if(r.st==='ok'){s.x=r.x;s.y=r.y;s.e=r.e;s.on=r.on;s.tp=null;if(r.path.length>=2)stat('chain')}
  else if(r.st==='gate'){s.gc=(s.gc||0)+1;s.on=[r.x,r.y];s.x=s.y=s.e=null;stat('gateEnter');now('gateShip',{seat})}
  else{const cause=r.st==='edge'?{k:'edge'}:{k:'mon',id:r.id,path:1};cause.bonus=!!(o&&o.bonus)&&!sameTeam(G,seat,G.cur);now('doom',{seat,cause,near:r.last});return}
  if(G.wave&&r.path.some(q=>inRow(q)))now('waveRoll',{seat})}
AG.moveShip=d=>{const s=G.ships[d.seat];if(!s.alive||s.x==null||!cellAt(G,s.x,s.y))return;applyRes(d.seat,follow(G,s.x,s.y,s.e),{bonus:d.bonus})};
// ---------- the placement step ----------
function turnOrderFrom(f){const o=[];for(let k=0;k<G.np;k++)o.push((f+k)%G.np);return o}
AG.place=d=>{const c=G.hands[G.cur].splice(d.t,1)[0];const S=G.ships[d.s];const fx=S.x,fy=S.y;G.bd[fy*BW+fx]=[c,d.r];G.batch=[];stat('place');
  lg(`${G.seats[G.cur].nm} lays a current at column ${fx+1}, row ${fy+1}.`);
  for(const i of turnOrderFrom(G.cur))if(G.ships[i].alive&&G.ships[i].x===fx&&G.ships[i].y===fy)now('moveShip',{seat:i,bonus:1});now('afterPlace',{})};
AG.gatePlay=d=>{const S=G.ships[d.s];const fx=S.x,fy=S.y;const h=G.hands[G.cur];h.splice(d.t,1);G.batch=[];putGate(fx,fy);lg(`${G.seats[G.cur].nm} opens a Rift Gate at column ${fx+1}, row ${fy+1}.`,'big');
  const who=G.ships.filter(s=>s.alive&&s.x===fx&&s.y===fy).map(s=>s.i);const ord=turnOrderFrom((G.cur+1)%G.np);
  const seq=ord.filter(i=>who.includes(i));for(const i of seq){const s=G.ships[i];s.on=[fx,fy];s.x=s.y=s.e=null;s.moved=true;now('gateShip',{seat:i})}now('afterPlace',{})};
AG.cannonPlay=d=>{const h=G.hands[G.cur];G.gone.push(h.splice(d.t,1)[0]);G.batch=[];lg(`${G.seats[G.cur].nm} fires a Deck Cannon at ${levName(d.m)}!`,'big');stat('cannonShoot');removeMon(d.m,'cannon');
  if(!G.opts.noMon&&levCount(G)<3&&G.mdeck.some(x=>x<10))G.refill=true;now('afterPlace',{})};
function collideSweep(){const keys={};for(const s of G.ships)if(s.alive&&s.x!=null)(keys[s.x+','+s.y+','+s.e]=keys[s.x+','+s.y+','+s.e]||[]).push(s.i);
  for(const k in keys)if(keys[k].length>1){stat('collision');lg('Two junks meet on one wake and both go down!','bad');for(const i of keys[k])eliminate(i,'collided on the wake',i!==G.cur)}}
AG.collide=d=>collideSweep();
AG.afterPlace=d=>{collideSweep();
  now('check',{clear:1});now('bonus',{});now('draw',{seat:G.cur});now('endTurn',{})};
AG.bonus=d=>{const me=G.ships[G.cur];
  if(G.phase!=='play')return;
  if(!G.pool.length)return;
  if(!(G.placeElim.length&&me.alive)){for(const c of G.pool)G.deck.push(c);G.pool=[];return}
  stat('bonusOffer');G.bq={mine:[]};bonusAsk()};
function bonusAsk(){const hand=G.hands[G.cur],opts=[];
  hand.forEach((c,i)=>{if(G.bq.mine.includes(c))return;G.pool.forEach((p,j)=>{const nc=hand.filter(isCannon).length-(isCannon(c)?1:0)+(isCannon(p)?1:0);if(nc>2)return;
    opts.push({l:`Swap your tile #${i+1} for pool tile #${j+1}`,h:'bSwap',d:{i,j}})})});
  if(!opts.length){bonusEnd();return}
  opts.push({l:'Keep your hand',h:'bDone',d:{}});ask(G.cur,'bonus','Elimination bonus: swap your tiles for those of the sunken crews.',opts,{})}
QH.bSwap=d=>{const hand=G.hands[G.cur];const old=hand[d.i];hand[d.i]=G.pool[d.j];G.bq.mine.push(G.pool[d.j]);G.pool[d.j]=old;stat('bonusSwap');lg(`${G.seats[G.cur].nm} swaps a tile with the sunken crews.`);bonusAsk()};
QH.bDone=d=>bonusEnd();
function bonusEnd(){for(const c of G.pool)G.deck.push(c);G.pool=[];G.bq=null}
// ---------- moves ----------
function sideToAct(){if(!G||G.phase==='over')return -1;if(G.q)return G.q.who;if(G.phase==='setup')return G.order[G.sp];return G.step==='act'?G.cur:-1}
const mkey=m=>!m?'':m.a==='q'?'q'+m.i:m.a==='start'?`s${m.x},${m.y},${m.e}`:m.a==='place'?`p${m.t},${m.r},${m.s}`:m.a==='gate'?`g${m.t},${m.s}`:m.a==='cannon'?`c${m.t},${m.m},${m.s}`:m.a;
function legal(m,seat){if(!G)return 'no game';if(G.phase==='over')return 'The game is over.';if(seat!==sideToAct())return 'It is not your turn.';
  const k=mkey(m);for(const x of genMoves(G,seat))if(mkey(x)===k)return '';return 'That move is not allowed.'}
function performMove(m,seat){if(seat==null)seat=sideToAct();const err=legal(m,seat);if(err)return {success:false,error:err};
  G.agI=0;
  switch(m.a){
    case 'start':{const s=G.ships[seat];s.x=m.x;s.y=m.y;s.e=m.e;lg(`${G.seats[seat].nm} sets out from column ${m.x+1}, row ${m.y+1}.`);G.sp++;
      if(G.sp>=G.np){G.phase='play';G.cur=(G.first+G.np-1)%G.np;later('turnStart',{})}break}
    case 'q':{const o=G.q.opts[m.i];G.q=null;QH[o.h](o.d);break}
    case 'place':G.step=null;AG.place(m);break;
    case 'gate':G.step=null;AG.gatePlay(m);break;
    case 'cannon':G.step=null;AG.cannonPlay(m);break;
    case 'pass':G.step=null;lg(`${G.seats[seat].nm} has nothing to play.`);now('afterPlace',{});break}
  flow();if(typeof refresh==='function'&&!UI.sim)refresh();return {success:true}}
function validMoves(seat){return G?genMoves(G,seat):[]}
// ---------- knowledge: the view a seat is allowed to see ----------
function knowledge(seat){const K={seat,np:G.np,variant:G.variant,exp:G.exp,opts:G.opts,phase:G.phase,step:G.step,turn:G.turn,cur:G.cur,first:G.first,order:G.order.slice(),sp:G.sp,team:G.team?G.team.slice():null,
  ships:clone(G.ships),mons:clone(G.mons),mgone:G.mgone.slice().sort((a,b)=>a-b),mdeck:G.mdeck.slice().sort((a,b)=>a-b),wave:clone(G.wave),gates:clone(G.gates),bd:clone(G.bd),dice:G.dice.slice(),refill:G.refill,
  hands:G.hands.map((h,i)=>i===seat?h.slice():h.map(()=>-1)),deck:G.deck.map(()=>-1),gone:G.gone.slice().sort((a,b)=>a-b),pool:G.cur===seat?G.pool.slice():G.pool.map(()=>-1),
  arr:G.arr&&{id:G.arr.id,k:G.arr.k,x:G.arr.x,y:G.arr.y,r:G.arr.r},
  q:G.q&&{who:G.q.who,kind:G.q.kind,title:G.q.title,opts:G.q.who===seat?clone(G.q.opts):[],n:G.q.opts.length,ctx:G.q.who===seat?clone(G.q.ctx):{}},
  over:clone(G.over),seats:G.seats.map(s=>({i:s.i,nm:s.nm,human:s.human,lv:s.lv})),stats:{}};return K}
// ---------- invariants ----------
function checkInvariants(){const v=[];if(!G)return ['no game'];
  const need=NCUR+(G.exp.rift?1:0)+(G.exp.cannon?5:0);const cnt={};const add=c=>{cnt[c]=(cnt[c]||0)+1};
  for(const c of G.deck)add(c);for(const h of G.hands)for(const c of h)add(c);for(const c of G.gone)add(c);for(const c of G.pool)add(c);
  if(G.limbo!=null)add(G.limbo);for(const c of G.bd)if(c)add(c[0]);
  for(let i=0;i<G.gates.length;i++)if(G.gates.length&&G.exp.rift===0)v.push('gate without expansion');
  if(G.gates.length>1)v.push('more than one Rift Gate');const gp=G.gates.length;
  let total=Object.values(cnt).reduce((a,b)=>a+b,0)+gp;if(total!==need)v.push(`tile total ${total} != ${need}`);
  for(const c in cnt)if(cnt[c]!==1)v.push(`card ${c} appears ${cnt[c]} times`);
  if(G.exp.rift){const inG=cnt[GATE_ID]||0;if(inG+gp!==1)v.push('Rift Gate count '+(inG+gp))}
  // leviathans
  const mset={};const madd=id=>mset[id]=(mset[id]||0)+1;for(const m of G.mons)madd(m.id);for(const id of G.mdeck)madd(id);for(const id of G.mgone)madd(id);if(G.arr&&!G.mons.some(m=>m.id===G.arr.id))madd(G.arr.id);if(G.wave)madd(WAVE_ID);
  const wantM=10+(G.exp.wave?1:0)+(G.exp.maelstrom?1:0);let mt=0;for(const id in mset){mt+=mset[id];if(mset[id]!==1)v.push(`monster ${id} appears ${mset[id]} times`)}
  if(mt!==wantM)v.push(`monster total ${mt} != ${wantM}`);
  const occ={};for(const m of G.mons){const k=m.x+','+m.y;if(occ[k])v.push('two monsters on '+k);occ[k]=1;if(!inB(m.x,m.y))v.push('monster off board');if(cellAt(G,m.x,m.y)&&!G.arr)v.push('monster on a current at '+k);if(gateAt(G,m.x,m.y))v.push('monster on a gate')}
  for(const g of G.gates)if(cellAt(G,g.x,g.y))v.push('gate on a current');
  // hands
  G.hands.forEach((h,i)=>{if(h.length>3)v.push(`hand ${i} has ${h.length}`);if(h.filter(isCannon).length>2)v.push(`hand ${i} holds three cannons`);if(!G.ships[i].alive&&h.length)v.push(`dead seat ${i} holds tiles`)});
  // ships
  const pos={};const busy=!!G.q||G.ag.length>0;for(const s of G.ships){if(!s.alive){if(s.x!=null)v.push('dead ship has a position');continue}
    if(s.x==null){if(G.phase==='setup'||s.on||s.tp)continue;v.push('ship '+s.i+' has no position');continue}
    if(busy)continue;const k=s.x+','+s.y+','+s.e;if(pos[k])v.push('two ships on one port '+k);pos[k]=1;
    if(cellAt(G,s.x,s.y))v.push('ship '+s.i+' waits in front of an occupied square');
    if(s.on&&!cellAt(G,s.on[0],s.on[1]))v.push('ship '+s.i+' sits on a missing tile')}
  if(!G.opts.noMon&&G.phase==='play'&&G.step==='act'&&!G.q&&levCount(G)<3&&!G.refill&&G.mdeck.some(x=>x<10))v.push('fewer than 3 leviathans and no refill pending');
  if(G.q&&(!G.q.opts.length||!G.seats[G.q.who]))v.push('bad question');
  if(JSON.stringify(G,(k,x)=>typeof x==='function'?'FN':x).includes('"FN"'))v.push('function in G');
  if(G.phase==='play'&&!G.q&&!G.ag.length&&G.step!=='act'&&!G.over)v.push('stalled between steps');
  return v}
// ---------- text view, save ----------
function render_game_to_text(seat){if(!G)return '{}';const sp=seat==null?-1:seat;
  return JSON.stringify({turn:G.turn,cur:G.cur,phase:G.phase,step:G.step,dice:G.dice,ships:G.ships.map(s=>s.alive?`${SN(s.i)}@${s.x==null?'-':(s.x+1)+','+(s.y+1)+'p'+s.e}`:SN(s.i)+' out'),
    mons:G.mons.map(m=>`${levName(m.id)}@${m.x+1},${m.y+1}`),wave:G.wave,gates:G.gates,deck:G.deck.length,hand:sp>=0?G.hands[sp]:undefined,q:G.q&&{who:G.q.who,kind:G.q.kind,n:G.q.opts.length},over:G.over})}
function saveGame(){try{localStorage.setItem(SAVE,JSON.stringify(G))}catch(e){}}
function loadGame(){try{const s=localStorage.getItem(SAVE);if(s){G=JSON.parse(s);return true}}catch(e){}return false}

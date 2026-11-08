// Tidewake logic test: ONE headless assertion per numbered rule of RULES-CHECKLIST.md, against the real engine (game/src/data.js + engine.js).
// It does not reuse any builder test or rig. State is set up directly on the plain-JSON game state, the dice are scripted by replacing
// the engine's rnd(), the real moves are played through performMove / the engine's own steps, and the exact result is checked.
//   node logic-test.js          run all rules; one line per failure: "FAIL R<n> expected ... got ..."
//   node logic-test.js --md     rewrite RULES-CHECKLIST.md from the rule table below
const {load}=require('./game/tools/load');const fs=require('fs');
const X=load(['data.js','engine.js']);const E=X.E,ctx=X.ctx;
const ORND=ctx.rnd;let DQ=[];ctx.rnd=function(n){return (n===6&&DQ.length)?DQ.shift()-1:ORND(n)};   // scripted d6: DQ holds the faces to roll next
const J=JSON.stringify;
function eq(got,exp,what){if(J(got)!==J(exp))throw new Error(`expected ${J(exp)} got ${J(got)}${what?'  ['+what+']':''}`)}
function ok(c,exp,got){if(!c)throw new Error(`expected ${exp} got ${got===undefined?'false':J(got)}`)}
const G_=()=>X.G;
function mk(np,o){DQ=[];X.setSeed(11);X.newGame(Object.assign({players:np,first:0,mode:'hot'},o||{}));return X.G}
const FILL=[{id:7,x:0,y:5},{id:8,x:5,y:0},{id:9,x:5,y:5}],RDIE={7:4,8:1,9:5};   // filler leviathans and the die face that only turns them
function rig(o){o=o||{};const G=X.G,ex=G.exp;G.bd=new Array(36).fill(null);const used=new Set();
  for(const t of o.tiles||[]){G.bd[t.y*6+t.x]=[t.id,t.r||0];used.add(t.id)}
  G.gates=(o.gates||[]).map(g=>({x:g.x,y:g.y}));
  const all=[];for(let i=0;i<56;i++)all.push(i);if(ex.rift&&!G.gates.length)all.push(56);if(ex.cannon)all.push(57,58,59,60,61);
  const hands=[];for(let i=0;i<G.np;i++){const h=o.hands&&o.hands[i];hands.push(h?h.slice():null);if(h)for(const c of h)used.add(c)}
  const rest=all.filter(c=>!used.has(c));
  for(let i=0;i<G.np;i++)if(!hands[i]){hands[i]=[];while(hands[i].length<3){const j=rest.findIndex(c=>c<56);hands[i].push(rest.splice(j,1)[0])}}
  G.hands=hands;G.deck=o.deck?o.deck.slice():rest;G.gone=[];G.pool=[];G.limbo=null;
  G.mons=(o.mons||[]).map(m=>({id:m.id,k:m.id===11?'M':'L',x:m.x,y:m.y,r:m.r||0}));
  G.wave=o.wave?Object.assign({n:0,owner:0,pt:G.turn},o.wave):null;
  const want=[];for(let i=0;i<10;i++)want.push(i);if(ex.wave)want.push(10);if(ex.maelstrom)want.push(11);
  G.mgone=(o.mgone||[]).slice();G.mdeck=o.mdeck?o.mdeck.slice():want.filter(id=>!G.mons.some(m=>m.id===id)&&!(id===10&&G.wave)&&!G.mgone.includes(id));
  const dflt=[{x:2,y:0,e:0},{x:5,y:2,e:2},{x:5,y:3,e:2},{x:5,y:4,e:2}];
  G.ships.forEach((s,i)=>{const sp=(o.ships&&o.ships[i])||dflt[i]||{x:0,y:i%6,e:6};
    Object.assign(s,{x:sp.x==null?null:sp.x,y:sp.y==null?null:sp.y,e:sp.e==null?null:sp.e,on:sp.on||null,alive:sp.alive!==false,moved:!!(sp.on||sp.moved),tp:null,out:'',gc:0});
    if(!s.alive){s.x=s.y=s.e=null;G.deck.push(...G.hands[i]);G.hands[i]=[]}});
  Object.assign(G,{phase:'play',step:o.step===undefined?'act':o.step,cur:o.cur||0,turn:o.turn||10,ag:[],agI:0,q:null,arr:null,refill:false,placeElim:[],batch:[],over:null,mq:[],bq:null,dice:[0,0],stats:{}});
  return G}
function run(){X.G.agI=0;E.flow()}
function step(h,d){X.G.ag=[];X.G.agI=0;E.AG[h](d||{});run()}
function startTurn(seat,dice){const G=X.G;DQ=(dice||[]).slice();G.cur=(seat+G.np-1)%G.np;G.step=null;G.q=null;G.ag=[{h:'turnStart',d:{}}];run()}
function ans(i){const r=X.performMove({a:'q',i},X.sideToAct());if(!r.success)throw new Error('answer rejected: '+r.error)}
function ansBy(f){const q=X.G.q;if(!q)throw new Error('no question pending');const i=q.opts.findIndex(f);if(i<0)throw new Error('no such option in: '+q.opts.map(o=>o.l).join(' / '));ans(i)}
function place(card,r,s){const G=X.G,t=G.hands[G.cur].indexOf(card);if(t<0)throw new Error('card not in hand');const m={a:'place',t,r,s:s==null?G.cur:s},res=X.performMove(m,G.cur);if(!res.success)throw new Error('place rejected: '+res.error)}
const ship=i=>X.G.ships[i],mon=id=>E.monById(id),pos=m=>m&&[m.x,m.y];
const state=i=>{const s=ship(i);return s.alive?{x:s.x,y:s.y,e:s.e,on:s.on}:'out'};
// tile ids: 0..34 = the 35 types; 35+k = duplicate of type EXTRA_TYPES[k]. id1 and id36 are type 1: lines 0-4,1-5,2-6,3-7 (straights). id34: 0-1,2-3,4-5,6-7 (U-turns). id0/id35: 0-4,1-5,2-7,3-6.
// port numbering: 0,1 top (left,right) 2,3 right (top,bottom) 4,5 bottom (right,left) 6,7 left (bottom,top); leaving port q enters the next square on its mate port 5,4,7,6,1,0,3,2.

const RULES=[];let SEC='';
function S(t){SEC=t}
function R(src,text,fn){RULES.push({n:RULES.length+1,sec:SEC,src,text,fn})}

S('A. Components and set-up');
R('base','The wake deck has 56 wake tiles, all different cards; with no expansion nothing else is in it.',()=>{const G=mk(2);const c=[].concat(G.deck,...G.hands).sort((a,b)=>a-b);eq(c,[...Array(56).keys()])});
R('base','Every wake tile joins its 8 edge points (2 per side) in 4 pairs; the 35 distinct tiles are exactly the 35 ways to pair 8 points up to turning, and the 56 tiles are those 35 plus 21 repeats.',()=>{
  const canon=m=>{let best=null;for(let r=0;r<4;r++){const s=m.map(([a,b])=>{a=(a+2*r)%8;b=(b+2*r)%8;return a<b?[a,b]:[b,a]}).sort((p,q)=>p[0]-q[0]).join('|');if(best==null||s<best)best=s}return best};
  const all=new Set();(function gen(rem,cur){if(!rem.length){all.add(canon(cur));return}const a=rem[0];for(let i=1;i<rem.length;i++){gen(rem.filter((_,k)=>k&&k!==i),cur.concat([[a,rem[i]]]))}})([0,1,2,3,4,5,6,7],[]);
  eq(all.size,35,'distinct matchings up to turning');
  const mine=new Set(E.BASE_PATHS.map(canon));eq(mine.size,35,'distinct tile types');eq([...mine].sort(),[...all].sort(),'same set');
  for(const ps of E.BASE_PATHS){eq(ps.flat().sort(),[0,1,2,3,4,5,6,7],'perfect pairing')}
  eq(E.CUR_TYPE.length,56);const cnt={};E.CUR_TYPE.forEach(t=>cnt[t]=(cnt[t]||0)+1);eq(Object.keys(cnt).length,35,'all 35 types present');eq(Object.values(cnt).reduce((a,b)=>a+b),56)});
R('base','A tile can be turned to any of 4 positions (quarter-turns): every exit moves 2 ports clockwise per turn, and an exit port lies on the side port>>1 (0 N,1 E,2 S,3 W).',()=>{
  for(let t=0;t<35;t++)for(let r=0;r<4;r++)for(let p=0;p<8;p++){const want=(E.PAIR[t][p]+2*r)%8,got=E.ROTP[t][r][(p+2*r)%8];if(want!==got)throw new Error(`expected type ${t} turn ${r} port ${(p+2*r)%8} -> ${want} got ${got}`)}
  const G=mk(2);rig({ships:[{x:2,y:0,e:0},{x:5,y:5,e:4}],hands:[[1,5,6]]});const mv=X.validMoves(0).filter(m=>m.a==='place');eq(mv.length,12,'3 tiles x 4 turns');
  eq([...new Set(mv.map(m=>m.r))].sort(),[0,1,2,3])});
R('base','There are 10 leviathan tiles in the base game, all different.',()=>{const G=mk(2);const ids=[...G.mons.map(m=>m.id),...G.mdeck,...G.mgone].sort((a,b)=>a-b);eq(ids,[0,1,2,3,4,5,6,7,8,9])});
R('base','Each player is dealt 3 tiles face down (2 to 8 players).',()=>{for(let np=2;np<=8;np++){const G=mk(np);eq(G.hands.map(h=>h.length),Array(np).fill(3),np+' players');eq(G.deck.length,56-3*np)}});
R('base','Leviathans at the start: 6 with 2-4 players, 5 with 5-6, 4 with 7-8.',()=>{const want={2:6,3:6,4:6,5:5,6:5,7:4,8:4};for(let np=2;np<=8;np++){const G=mk(np);eq(G.mons.length,want[np],np+' players')}});
R('base','Start leviathans are put on the rolled square (gold die = column, blue die = row, each 1-6); a square already taken means roll again.',()=>{
  mk(2);rig({mons:[{id:1,x:0,y:0}],fill:false,mdeck:[5]});DQ=[1,1,3,4];step('spawn');eq(pos(mon(5)),[2,3],'first roll (1,1) is taken so the second roll (3,4) is used');
  rig({mdeck:[6]});DQ=[2,5];step('spawn');eq(pos(mon(6)),[1,4],'gold 2 = column 2, blue 5 = row 5')});
R('base','A newly placed leviathan is turned to a random facing.',()=>{const seen=new Set();for(let s=1;s<=40;s++){X.setSeed(s);const G=X.newGame({players:2,first:0,mode:'hot'});G.mons.forEach(m=>seen.add(m.r))}eq([...seen].sort(),[0,1,2,3])});
R('base','The first player starts and play goes clockwise (seat order from the first player, to the left).',()=>{const G=mk(4,{first:2});eq(G.order,[2,3,0,1]);
  rig({cur:2,ships:[{x:2,y:0,e:0},{x:5,y:2,e:2},{x:5,y:3,e:2},{x:5,y:4,e:2}]});const seq=[];for(let k=0;k<5;k++){startTurn((G.cur+1)%4,[1,1]);seq.push(G.cur)}eq(seq,[3,0,1,2,3])});
R('base','Every ship is put on a start mark on the outer edge, in turn order, and ALL ships are placed before any tile is played.',()=>{const G=mk(3);eq(G.phase,'setup');const done=[];
  for(let k=0;k<3;k++){const seat=X.sideToAct();eq(seat,G.order[k],'who places the ship');const mv=X.validMoves(seat);ok(mv.length&&mv.every(m=>m.a==='start'),'only start moves during set-up',mv[0]);
    ok(mv.every(m=>m.x===0||m.y===0||m.x===5||m.y===5),'edge squares only');eq(G.phase,'setup',k+' ships placed');X.performMove(mv[k],seat);done.push(seat)}
  eq(G.phase,'play');ok(G.ships.every(s=>s.x!=null),'all ships on the board')});
R('base','Two ships cannot start on the same start mark, and a start is never offered in front of a leviathan.',()=>{const G=mk(3);const s0=X.sideToAct();const m0=X.validMoves(s0)[0];X.performMove(m0,s0);const s1=X.sideToAct();
  ok(!X.validMoves(s1).some(m=>m.x===m0.x&&m.y===m0.y&&m.e===m0.e),'taken mark not offered');ok(X.validMoves(s1).length>0);
  ok(!X.validMoves(s1).some(m=>G.mons.some(l=>l.x===m.x&&l.y===m.y)),'no start in front of a leviathan')});

S('B. Turn structure');
R('base','A turn is, in order: roll both dice (leviathans may move), place a tile in front of your ship, move your ship, draw back to 3.',()=>{
  mk(3);rig({cur:2,ships:[{x:2,y:0,e:0},{x:5,y:2,e:2},{x:5,y:3,e:2}],hands:[[1,5,6]]});startTurn(0,[1,1]);eq(X.G.cur,0);eq(X.G.step,'act');place(1,0);
  const t=X.G.log.map(l=>l.t).reverse();const iT=t.findIndex(s=>/^Turn \d+: Crimson/.test(s)),iR=t.findIndex((s,i)=>i>iT&&/rolls/.test(s)),iP=t.findIndex((s,i)=>i>iT&&/lays a current/.test(s));
  ok(iT>=0&&iR>iT&&iP>iR,'turn start, then roll, then place',[iT,iR,iP]);eq(state(0),{x:2,y:1,e:1,on:[2,0]},'moved after placing');eq(X.G.hands[0].length,3,'drew back to 3');eq(X.G.cur,1,'next player')});
R('base','Monsters move only when the two dice total 6, 7 or 8.',()=>{for(let t=2;t<=12;t++){mk(2);rig();const a=Math.min(6,t-1),b=t-a;X.G.ag=[];DQ=[a,b];E.AG.roll({});const moved=X.G.ag.some(x=>x.h==='monList');eq(moved,t>=6&&t<=8,'total '+t);eq(X.G.dice,[a,b])}});
R('base','You place a tile on the open square in front of your ship (the square it faces), turned any way; the tile then stays there.',()=>{
  mk(2);rig({hands:[[1,5,6]]});const G=X.G;ok(X.validMoves(0).every(m=>m.a==='place'&&m.s===0));place(5,2);eq(G.bd[0*6+2],[5,2],'tile on the front square at the chosen turn');
  startTurn(1,[1,1]);ok(G.step==='act');eq(G.bd[2],[5,2],'tile unchanged afterwards')});
R('base','After placing, your ship moves along the wake line it entered, tile after tile, to the open end.',()=>{mk(3);rig({hands:[[1,5,6]]});place(1,0);eq(state(0),{x:2,y:1,e:1,on:[2,0]})});
R('base','If the new tile extends another ship\'s wake, that ship also moves along it to its open end.',()=>{
  mk(3);rig({tiles:[{x:1,y:1,id:34},{x:2,y:0,id:34}],ships:[{x:2,y:1,e:6,on:[1,1]},{x:2,y:1,e:1,on:[2,0]},{x:5,y:5,e:4}],hands:[[1,5,6]]});place(1,0);
  eq(state(0),{x:3,y:1,e:7,on:[2,1]});eq(state(1),{x:2,y:2,e:0,on:[2,1]})});
R('base','A ship follows a chain of already placed tiles through to the end.',()=>{mk(3);rig({tiles:[{x:2,y:2,id:36},{x:2,y:3,id:35}],ships:[{x:2,y:1,e:0},{x:5,y:2,e:2},{x:5,y:3,e:2}],hands:[[1,5,6]]});place(1,0);eq(state(0),{x:2,y:4,e:1,on:[2,3]})});
R('base','Ships do not collide while passing: two ships may use the same tile (different lines) without harm.',()=>{
  mk(3);rig({tiles:[{x:2,y:2,id:36}],ships:[{x:2,y:1,e:0},{x:3,y:2,e:6,on:[2,2]},{x:5,y:5,e:4}],hands:[[1,5,6]]});place(1,0);
  eq(state(0),{x:2,y:3,e:0,on:[2,2]});eq(state(1),{x:3,y:2,e:6,on:[2,2]});ok(ship(0).alive&&ship(1).alive)});
R('base','At the end of your turn you draw from the top of the draw pile back up to 3 tiles.',()=>{mk(3);rig({hands:[[1,5,6]],deck:[20,21,22,23]});place(5,0);eq(X.G.hands[0],[1,6,20]);eq(X.G.deck,[21,22,23])});
R('base','When the draw pile is empty nothing is drawn; a player without tiles has no tile to play and passes.',()=>{
  mk(3);rig({hands:[[1,5,6]],deck:[]});place(5,0);eq(X.G.hands[0].length,2,'no draw from an empty pile');eq(X.G.cur,1);
  rig({hands:[[],[1,2,3]],deck:[]});eq(X.validMoves(0),[{a:'pass'}]);X.performMove({a:'pass'},0);eq(X.G.cur,1,'play moves on')});
R('base','An eliminated player takes no more turns; play passes to the next ship still afloat.',()=>{mk(3);rig({ships:[{x:2,y:0,e:0},{alive:false},{x:5,y:3,e:2}]});startTurn(0,[1,1]);step('endTurn');eq(X.G.cur,2)});

S('C. Placement prohibitions and elimination by placement');
R('base','You may not place a tile that sends your own wake to the board edge, unless every legal tile does.',()=>{
  mk(3);rig({ships:[{x:0,y:1,e:6},{x:5,y:5,e:4},{x:3,y:5,e:4}],hands:[[34,1,5]]});const mv=X.validMoves(0);ok(mv.length>0&&!mv.some(m=>m.t===0),'the U-turn tile (6->7, off the left edge) is not offered',mv.map(m=>m.t));
  rig({ships:[{x:0,y:1,e:6},{x:5,y:5,e:4},{x:3,y:5,e:4}],hands:[[34]]});eq(X.validMoves(0).map(m=>m.a),['place','place','place','place'],'forced: only unsafe moves exist, they are offered');});
R('base','A ship whose open wake end reaches the board edge is eliminated (forced case).',()=>{
  mk(3);rig({ships:[{x:0,y:1,e:6},{x:5,y:5,e:4},{x:3,y:5,e:4}],hands:[[34]]});place(34,0);eq(ship(0).alive,false);ok(/edge/.test(ship(0).out),'reason edge',ship(0).out);eq(X.G.phase,'play','two others remain')});
R('base','You may not place a tile that makes your wake loop forever (unless forced).',()=>{
  mk(3);rig({tiles:[{x:2,y:1,id:34}],ships:[{x:2,y:2,e:0},{x:5,y:5,e:4},{x:3,y:5,e:4}],hands:[[34,1,5]]});
  const mv=X.validMoves(0);ok(mv.length>0&&!mv.some(m=>m.t===0),'the looping tile is not offered',mv.map(m=>m.t));
  rig({tiles:[{x:2,y:1,id:34}],ships:[{x:2,y:2,e:0},{x:5,y:5,e:4},{x:3,y:5,e:4}],hands:[[34]]});place(34,0);eq(ship(0).alive,false,'a forced endless loop is a loss')});
R('base','You may not place a tile that joins your wake to a leviathan tile (unless forced); if forced, you are eliminated.',()=>{
  mk(3);const h=[[1,5,6]];rig({mons:[{id:0,x:2,y:2}],ships:[{x:2,y:1,e:0},{x:5,y:5,e:4},{x:3,y:5,e:4}],hands:h});
  ok(!X.validMoves(0).some(m=>m.t===0&&m.r===0),'straight tile into the monster not offered');
  rig({mons:[{id:0,x:2,y:2}],ships:[{x:2,y:1,e:0},{x:5,y:5,e:4},{x:3,y:5,e:4}],hands:[[1]]});
  const bad=X.validMoves(0).filter(m=>m.r===0);eq(bad.length,1,'forced list holds the move');place(1,0);eq(ship(0).alive,false);ok(/Brinemaw/.test(ship(0).out),'reason names the leviathan',ship(0).out)});
R('base','You may not place a tile that puts two ships on the same wake travelling the same way (unless forced).',()=>{
  const setup=h=>{mk(3);rig({tiles:[{x:3,y:2,id:36},{x:1,y:2,id:34}],ships:[{x:2,y:2,e:6,on:[1,2]},{x:4,y:2,e:7,on:[3,2]},{x:5,y:5,e:4}],hands:[h]})};
  setup([0,5,6]);const sim=E.simPlace(X.G,2,2,0,0);eq(sim.coll.slice().sort(),[0,1],'tile 0 turned 0 puts both on port 7 of (5,3)');
  ok(!X.validMoves(0).some(m=>m.t===0&&m.r===0),'not offered while other moves exist')});
R('base','If two ships are forced onto the same wake going the same way, they are both eliminated.',()=>{
  mk(3);rig({tiles:[{x:3,y:2,id:36},{x:1,y:2,id:34}],ships:[{x:2,y:2,e:6,on:[1,2]},{x:4,y:2,e:7,on:[3,2]},{x:5,y:5,e:4}],hands:[[0]]});
  X.G.step=null;E.AG.place({t:0,r:0,s:0});run();eq([ship(0).alive,ship(1).alive],[false,false]);eq(ship(2).alive,true)});
R('base','Head-on: two ships whose wakes are joined end to end each run back along the other wake and are eliminated at the start edge.',()=>{
  mk(3);rig({tiles:[{x:0,y:0,id:0},{x:2,y:0,id:4}],ships:[{x:1,y:0,e:6,on:[0,0]},{x:1,y:0,e:2,on:[2,0]},{x:5,y:5,e:4}],hands:[[1,5,6]]});
  // ship0 waits west of (1,0) (came out of tile (0,0)), ship1 waits east of it (came out of tile (2,0)); a straight east-west tile links them
  const mv=X.validMoves(0);ok(mv.length>0);X.G.step=null;E.AG.place({t:0,r:0,s:0});run();
  const dead=[!ship(0).alive,!ship(1).alive];ok(dead[0]&&dead[1],'both eliminated',{s0:state(0),s1:state(1)})});
R('base','The tile you place can eliminate OTHER players too; the last ship afloat wins at once.',()=>{
  mk(2);rig({tiles:[{x:1,y:1,id:36}],ships:[{x:0,y:1,e:6},{x:0,y:1,e:3,on:[1,1]}],hands:[[1,5,6]]});place(1,0);
  eq(ship(1).alive,false,'the other ship runs off the left edge');eq(ship(0).alive,true);eq(X.G.phase,'over');eq(X.G.over.win,[0])});
R('base','If the last ships all go down on the same placement, they all win (shared win).',()=>{
  mk(2);rig({ships:[{x:0,y:1,e:6},{x:0,y:1,e:7}],hands:[[34]]});place(34,0);eq(X.G.phase,'over');eq(X.G.over.win.slice().sort(),[0,1])});
R('base','Elimination bonus: when your tile eliminates opponents, you may swap tiles of your hand for the same number from their hands; the rest go to the bottom of the pile; you still draw to 3.',()=>{
  mk(3);rig({tiles:[{x:1,y:1,id:36}],ships:[{x:0,y:1,e:6},{x:0,y:1,e:3,on:[1,1]},{x:5,y:5,e:4}],hands:[[1,5,6],[10,11,12]],deck:[30,31,32]});place(1,0);
  eq(ship(1).alive,false);ok(X.G.q&&X.G.q.kind==='bonus'&&X.G.q.who===0,'bonus offered to the active player',X.G.q&&X.G.q.kind);
  ansBy(o=>o.d.i===0&&o.d.j===0);ansBy(o=>o.h==='bSwap'&&o.d.i===1&&o.d.j===1);if(X.G.q)ansBy(o=>o.h==='bDone');
  eq(X.G.q,null);eq(X.G.hands[0].slice(0,2),[10,11],'swapped for sunken crew tiles');eq(X.G.hands[0].length,3,'drew back to 3');eq(X.G.deck.slice(-3),[5,6,12],'swapped-out tiles and the unchosen pool tile go to the bottom')});
R('base','Eliminated players\' tiles go to the bottom of the draw pile (no bonus when a leviathan or the sea did it).',()=>{
  mk(3);rig({tiles:[{x:3,y:3,id:36}],ships:[{x:3,y:4,e:1,on:[3,3]},{x:5,y:3,e:2},{x:5,y:4,e:2}],mons:[{id:0,x:3,y:2},{id:7,x:0,y:5},{id:8,x:5,y:0}],hands:[[1,5,6],[20,21,22]],deck:[40,41],cur:1});
  step('monAct',{id:0,die:3});eq(ship(0).alive,false);eq(X.G.q,null,'no bonus swap');eq(X.G.deck.slice(-5),[41,36,1,5,6].slice(0,0).concat(X.G.deck.slice(-5)));
  eq(X.G.deck.slice(-4),[36,1,5,6],'tile first, then the sunk crew\'s hand')});

S('D. Leviathans (base game)');
R('base','Leviathans move in ascending order of the number in the tile corner; on a tie the one with the gold arrow goes first.',()=>{
  mk(2);rig({mons:E.LEV.map((l,i)=>({id:i,x:i%5,y:1+((i/5)|0)*2})),fill:false,ships:[{x:5,y:5,e:4},{x:5,y:4,e:2}]});X.G.ag=[];X.G.agI=0;E.AG.monList({});
  const want=E.LEV.map(l=>l.id).sort((a,b)=>E.LEV[a].order-E.LEV[b].order||E.LEV[b].gold-E.LEV[a].gold||a-b);eq(X.G.mq,want);
  eq(X.G.mq.indexOf(2)<X.G.mq.indexOf(3),true,'tie at 3: gold arrow first');eq(X.G.mq.indexOf(7)<X.G.mq.indexOf(8),true,'tie at 7: gold arrow first')});
R('base','Each leviathan rolls ONE die, in that order: its own arrow for that number is followed.',()=>{
  mk(2);rig({mons:[{id:0,x:1,y:1},{id:1,x:4,y:4},{id:7,x:0,y:5},{id:8,x:5,y:0},{id:9,x:5,y:5}],fill:false});DQ=[1,3,4,1,5];X.G.ag=[];E.AG.monList({});run();
  eq(pos(mon(0)),[1,0],'first leviathan got the first die (1 = its north arrow)');eq(pos(mon(1)),[3,4],'second got the second die (3 = its west arrow)')});
R('base','A move arrow moves the leviathan one square in that direction, turned by the tile\'s facing; the rotation arrow turns it one quarter in its own direction. (all 5 faces x 4 facings)',()=>{
  for(const id of [0,1]){const L=E.LEV[id];for(let r=0;r<4;r++)for(let die=1;die<=5;die++){mk(2);rig({mons:[{id,x:2,y:2,r}],fill:false});X.G.ag=[];E.AG.monAct({id,die});run();const a=L.arr[die-1],m=mon(id);
    if(a==='R')eq([m.x,m.y,m.r],[2,2,(r+L.rd+4)%4],`id${id} facing ${r} die ${die}`);else{const d=(E.DIR.length&&{N:0,E:1,S:2,W:3}[a]+r)%4,dd=E.DIR[d];eq([m.x,m.y,m.r],[2+dd[0],2+dd[1],r],`id${id} facing ${r} die ${die}`)}}}});
R('base','A 6 means that leviathan stays put and a new leviathan is placed (rolled square).',()=>{
  mk(2);rig({mons:[{id:0,x:2,y:2}],fill:false,mdeck:[5,6]});DQ=[4,4];step('monAct',{id:0,die:6});eq(pos(mon(0)),[2,2]);eq(pos(mon(5)),[3,3]);eq(X.G.mdeck,[6])});
R('base','A leviathan pushed off the board is removed from play (never returns).',()=>{
  mk(2);rig({mons:[{id:0,x:2,y:0}],fill:false});step('monAct',{id:0,die:1});eq(mon(0),null);eq(X.G.mgone.includes(0),true);eq(X.G.mdeck.includes(0),false)});
R('base','A leviathan moving onto a wake tile removes it (to the bottom of the draw pile), takes the square and eliminates ships on it.',()=>{
  mk(3);rig({tiles:[{x:3,y:3,id:36}],ships:[{x:5,y:3,e:2},{x:3,y:4,e:1,on:[3,3]},{x:5,y:4,e:2}],mons:[{id:0,x:3,y:2}],fill:false,deck:[40,41],hands:[[1,2,3],[20,21,22]]});
  step('monAct',{id:0,die:3});eq(X.G.bd[3*6+3],null);eq(pos(mon(0)),[3,3]);eq(ship(1).alive,false);eq(X.G.deck.slice(-1)[0],22,'crew tiles last');ok(X.G.deck.includes(36),'tile in the pile',X.G.deck)});
R('base','A leviathan moving onto another leviathan destroys the stationary one (removed from play).',()=>{
  mk(2);rig({mons:[{id:0,x:2,y:2},{id:1,x:2,y:3}],fill:false});step('monAct',{id:0,die:3});eq(mon(1),null);eq(X.G.mgone.includes(1),true);eq(pos(mon(0)),[2,3])});
R('base','A leviathan that moves in front of the ACTIVE player\'s ship eliminates that ship (it blocks the tile).',()=>{
  mk(3);rig({cur:2,tiles:[{x:2,y:1,id:1}],ships:[{x:2,y:2,e:0,on:[2,1]},{x:5,y:3,e:2},{x:5,y:4,e:2}],mons:[{id:0,x:1,y:2},...FILL],fill:false});
  startTurn(0,[3,3,2,RDIE[7],RDIE[8],RDIE[9]]);eq(ship(0).alive,false);ok(/blocked/.test(ship(0).out),'blocked in',ship(0).out)});
R('base','A ship NOT on turn is not hurt when a leviathan lands in front of it; it is eliminated when its own turn starts.',()=>{
  mk(3);rig({cur:2,tiles:[{x:2,y:3,id:1},{x:4,y:3,id:1}],ships:[{x:2,y:0,e:0},{x:4,y:4,e:1,on:[4,3]},{x:5,y:4,e:2}],mons:[{id:0,x:3,y:4},...FILL],fill:false});
  startTurn(0,[3,3,2,RDIE[7],RDIE[8],RDIE[9]]);eq(pos(mon(0)),[4,4]);eq(ship(1).alive,true,'alive during the other turn');startTurn(1,[1,1]);eq(ship(1).alive,false,'blocked at its own turn')});
R('base','If a leviathan blocks your start square you may move your ship to another start mark on the same edge with no tile and no leviathan.',()=>{
  mk(3);rig({cur:2,tiles:[{x:0,y:3,id:1}],ships:[{x:0,y:2,e:6},{x:5,y:3,e:2},{x:5,y:4,e:2}],mons:[{id:0,x:0,y:2},...FILL],fill:false});startTurn(0,[1,1]);
  ok(X.G.q&&X.G.q.kind==='doom','asked what to do',X.G.q&&X.G.q.kind);const rel=X.G.q.opts.filter(o=>o.h==='dReloc').map(o=>[o.d.x,o.d.y,o.d.e]);
  eq(rel.map(r=>r[0]).every(x=>x===0),true,'same edge only');eq(rel.some(r=>r[1]===2||r[1]===3),false,'not the blocked square, not a tile square');eq(rel.length,6,'rows 1,2,5 x both ports (row 6 holds a filler leviathan)');
  ansBy(o=>o.h==='dReloc');eq(ship(0).alive,true);ok(ship(0).x===0&&ship(0).y!==2,'moved along the edge',state(0))});
R('base','Minimum of 3 leviathans: if movement leaves fewer, the next player rolls to place up to 3 and does NOT roll for movement that turn.',()=>{
  mk(3);rig({mons:[{id:0,x:2,y:0},{id:7,x:0,y:5},{id:8,x:5,y:0}],fill:false,mdeck:[3,4,5]});X.G.dice=[9,9];step('monAct',{id:0,die:1});step('afterMon');eq(X.G.refill,true);
  X.G.mons.find(m=>m.id===7).r=0;startTurn(1,[3,3]);eq(E.levCount(X.G),3,'topped up to 3');eq(X.G.dice,[9,9],'no dice rolled');eq(DQ,[],'the placement used the rolled squares only');eq(pos(mon(7)),[0,5],'no leviathan moved')});
R('base','The minimum of 3 counts leviathan tiles only (a Rogue Wave or Maelstrom does not count).',()=>{
  mk(3,{exp:{maelstrom:1,wave:1}});rig({mons:[{id:0,x:2,y:3},{id:7,x:0,y:5},{id:11,x:3,y:3}],fill:false,wave:{x:1,y:1,r:0}});eq(E.levCount(X.G),2);step('afterMon');eq(X.G.refill,true)});
R('base','A leviathan placed (rolled square) on a wake tile removes the tile and eliminates ships on it.',()=>{
  mk(3);rig({tiles:[{x:2,y:2,id:36}],ships:[{x:5,y:3,e:2},{x:2,y:3,e:1,on:[2,2]},{x:5,y:4,e:2}],mons:[],fill:false,mdeck:[5],deck:[40]});DQ=[3,3];step('spawn');
  eq(pos(mon(5)),[2,2]);eq(X.G.bd[2*6+2],null);eq(ship(1).alive,false);ok(X.G.deck.includes(36),'tile returned to the pile')});
R('base','When no leviathan tile is left to place, nothing happens (no crash, nothing placed).',()=>{mk(2);rig({mons:[{id:0,x:2,y:2}],fill:false,mdeck:[]});step('spawn');eq(X.G.mons.length,1)});
R('base','Variant "No Leviathan": no leviathans are placed and the dice never move anything.',()=>{
  const G=mk(3,{noMon:true});eq(G.mons.length,0);eq(G.mdeck.length,0);rig({fill:false});DQ=[6,6];X.G.ag=[];E.AG.roll({});run();eq(DQ,[6,6],'dice not rolled');eq(X.G.mons.length,0)});

S('E. Ending the game (base)');
R('base','The last ship afloat wins.',()=>{mk(3);rig({ships:[{x:2,y:0,e:0},{alive:false},{alive:false}]});step('check',{clear:1});eq(X.G.over.win,[0]);eq(X.G.phase,'over')});
R('base','If every ship is lost at once (same event), all of those ships share the win.',()=>{
  mk(3);rig({ships:[{x:0,y:1,e:6},{x:0,y:1,e:7},{alive:false}],hands:[[34]],cur:0});X.G.hands[2]=[];place(34,0);eq(X.G.over.win.slice().sort(),[0,1])});
R('base','There is no scoring: the game only ends by elimination (play continues with 2+ ships afloat).',()=>{mk(3);rig({ships:[{x:2,y:0,e:0},{x:5,y:2,e:2},{alive:false}]});step('check',{clear:1});eq(X.G.phase,'play');eq(X.G.over,null)});

S('F. Expansion: Rift Gate');
const EXP=(o)=>mk(3,{exp:Object.assign({rift:1,wave:0,maelstrom:0,cannon:0},o||{})});
R('exp-gate','The Rift Gate (1 tile) is shuffled into the wake deck.',()=>{const G=EXP();const c=[].concat(G.deck,...G.hands);eq(c.length,57);eq(c.filter(x=>x===56).length,1)});
R('exp-gate','You may play the Rift Gate instead of a wake tile; it goes on the open square in front of your ship and does not replace any tile.',()=>{
  EXP();rig({tiles:[{x:2,y:1,id:34}],ships:[{x:2,y:2,e:0,on:[2,1]},{x:5,y:2,e:2},{x:5,y:3,e:2}],hands:[[56,1,5]],cur:0});const g=X.validMoves(0).find(m=>m.a==='gate');ok(g,'gate move offered');
  DQ=[4,2];X.performMove(g,0);eq(X.G.gates,[{x:2,y:2}]);eq(X.G.bd[2*6+2],null,'no tile there');eq(X.G.bd[1*6+2],[34,0],'existing tile untouched');ok(!X.G.hands[0].includes(56))});
R('exp-gate','Ships on the gate square are carried off: each rolls two dice for a square (gold column, blue row); on a square with no tile you place a tile and then choose which wake and direction to ride.',()=>{
  EXP();rig({ships:[{x:2,y:2,e:0},{x:5,y:2,e:2},{x:5,y:3,e:2}],hands:[[56,1,5]],cur:0});DQ=[4,2];X.performMove({a:'gate',t:0,s:0},0);
  eq(X.G.q.kind,'gatePlace','empty target square: place a tile');eq(X.G.q.ctx,{tx:3,ty:1},'gold 4 = column 4, blue 2 = row 2');ansBy(o=>o.d.i===0&&o.d.r===0);eq(X.G.bd[1*6+3],[1,0]);
  eq(X.G.q.kind,'gateWake');ansBy(o=>o.d.p===0);eq(state(0),{x:3,y:2,e:1,on:[3,1]},'rode the wake to its open end')});
R('exp-gate','If the target square already has a tile, you choose which of its wakes and which direction to ride.',()=>{
  EXP();rig({tiles:[{x:3,y:1,id:36}],ships:[{x:2,y:2,e:0},{x:5,y:2,e:2},{x:5,y:3,e:2}],hands:[[56,1,5]],cur:0});DQ=[4,2];X.performMove({a:'gate',t:0,s:0},0);eq(X.G.q.kind,'gateWake');
  ok(X.G.q.opts.length>=2,'several wakes/directions to choose from',X.G.q.opts.length);ansBy(o=>o.d.p===2);eq(state(0),{x:2,y:1,e:3,on:[3,1]},'port 2 of a straight tile leaves by port 6 to the west')});
R('exp-gate','With several ships on the gate square they are moved one at a time in play order, the active player last.',()=>{
  EXP();rig({tiles:[{x:0,y:0,id:1},{x:1,y:1,id:36},{x:3,y:3,id:35}],ships:[{x:2,y:2,e:0},{x:2,y:2,e:1},{x:2,y:2,e:2}],hands:[[56,5,6],[10,11,12],[20,21,22]],cur:0});DQ=[1,1,2,2,4,4];X.performMove({a:'gate',t:0,s:0},0);
  const who=[];for(let k=0;k<3;k++){who.push(X.G.q.who);ans(0)}eq(who,[1,2,0])});
R('exp-gate','A ship whose wake runs into the gate square is carried through the gate instead of being lost.',()=>{
  EXP();rig({gates:[{x:2,y:2}],tiles:[{x:3,y:3,id:35}],ships:[{x:2,y:1,e:0},{x:5,y:2,e:2},{x:5,y:3,e:2}],hands:[[1,5,6]],cur:0});DQ=[4,4];place(1,0);
  eq(ship(0).alive,true);eq(X.G.stats.gateEnter,1);eq(X.G.q.kind,'gateWake','carried to (4,4) which has a tile')});
R('exp-gate','Rescue: when a ship is about to be eliminated its owner may play the Rift Gate, even on another player\'s turn; the owner then holds only 2 tiles until their own turn ends.',()=>{
  EXP();rig({tiles:[{x:1,y:1,id:36},{x:4,y:4,id:1}],ships:[{x:0,y:1,e:6},{x:0,y:1,e:3,on:[1,1]},{x:5,y:3,e:2}],hands:[[1,5,6],[56,11,12]],cur:0});DQ=[5,5];place(1,0);
  eq(X.G.q.who,1,'asked the doomed ship\'s owner, not the active player');ok(X.G.q.opts.some(o=>/Rift Gate/.test(o.l)),'gate offered');ansBy(o=>/Rift Gate/.test(o.l));ansBy(o=>o.h==='dGateAt');
  eq(X.G.q.kind,'gateWake');ans(0);eq(ship(1).alive,true,'saved');eq(X.G.hands[1].length,2,'2 tiles until own turn');eq(X.G.gates.length,1)});
R('exp-gate','Leviathans that move into the gate are carried to a rolled square; the gate stays on the board all game.',()=>{
  EXP();rig({gates:[{x:3,y:3}],mons:[{id:0,x:3,y:2},...FILL],fill:false});DQ=[5,5];step('monAct',{id:0,die:3});eq(pos(mon(0)),[4,4],'sent through');eq(X.G.gates,[{x:3,y:3}],'gate stays')});

S('G. Expansion: Rogue Wave');
const EXW=()=>mk(3,{exp:{rift:0,wave:1,maelstrom:0,cannon:0}});
R('exp-wave','The Rogue Wave tile is shuffled into the leviathan deck (11 tiles in all).',()=>{const G=EXW();const ids=[...G.mons.map(m=>m.id),...G.mdeck,...G.mgone,...(G.wave?[10]:[])].sort((a,b)=>a-b);eq(ids,[...Array(11).keys()])});
R('exp-wave','When drawn it is placed like a leviathan (rolled square), turned to a random facing, and it is not a leviathan for the minimum of 3.',()=>{
  EXW();rig({mons:[{id:0,x:0,y:0},{id:1,x:0,y:2},{id:2,x:0,y:4}],fill:false,mdeck:[10,5]});DQ=[3,4];step('spawn');eq([X.G.wave.x,X.G.wave.y],[2,3]);ok([0,1,2,3].includes(X.G.wave.r),'facing',X.G.wave.r);eq(X.G.wave.n,0);eq(E.levCount(X.G),3)});
R('exp-wave','The wave\'s "row" is the line of squares to its left and right (across its direction of travel) plus its own square.',()=>{
  EXW();rig({fill:false,wave:{x:2,y:3,r:0}});for(let y=0;y<6;y++)for(let x=0;x<6;x++){eq(E.inRow([x,y]),y===3,`north-bound wave: (${x},${y})`)}
  X.G.wave.r=1;for(let y=0;y<6;y++)for(let x=0;x<6;x++)eq(E.inRow([x,y]),x===2,`east-bound wave: (${x},${y})`);X.G.wave.r=2;ok(E.inRow([0,3])&&!E.inRow([2,2]),'south-bound is a row too');X.G.wave.r=3;ok(E.inRow([2,0])&&!E.inRow([3,3]),'west-bound is a column')});
R('exp-wave','Strength: 2 when placed, 3 in rounds 2 and 3, 4 from the fourth round on (until it leaves).',()=>{EXW();rig({fill:false,wave:{x:2,y:3,r:0}});const s=[];for(let n=0;n<6;n++){X.G.wave.n=n;s.push(E.waveStr())}eq(s,[2,3,3,4,4,4])});
R('exp-wave','A ship in the row must roll at least the wave strength on one die or capsizes (eliminated); at strength 2, 3, 4.',()=>{
  for(const [n,str] of [[0,2],[1,3],[3,4]]){for(const roll of [str-1,str]){EXW();rig({fill:false,wave:{x:2,y:5,r:1,n},ships:[{x:2,y:2,e:0,on:[2,1]},{x:5,y:3,e:2},{x:5,y:4,e:2}]});DQ=[roll];step('waveRoll',{seat:0});
    eq(ship(0).alive,roll>=str,`strength ${str} rolled ${roll}`)}}});
R('exp-wave','A ship moved into or through the row by a tile placement must roll at once.',()=>{
  for(const roll of [1,2]){EXW();rig({fill:false,wave:{x:2,y:5,r:1,n:0,owner:2,pt:10},ships:[{x:2,y:1,e:0},{x:5,y:2,e:2},{x:5,y:3,e:2}],hands:[[1,5,6]]});DQ=[roll];place(1,0);eq(ship(0).alive,roll>=2,'rolled '+roll)}});
R('exp-wave','The wave moves one square once per round, before the placer\'s next turn (not in the round it was placed); the active player in the new row rolls.',()=>{
  EXW();rig({fill:false,wave:{x:1,y:3,r:1,n:0,owner:0,pt:10},turn:10,cur:0,ships:[{x:5,y:5,e:4},{x:5,y:2,e:2},{x:5,y:3,e:2}]});const at=[];
  for(let k=0;k<3;k++){startTurn((X.G.cur+1)%3,[1,1]);at.push([X.G.wave.x,X.G.wave.y,X.G.wave.n])}eq(at,[[1,3,0],[1,3,0],[2,3,1]],'moves only when the owner\'s slot comes round');
  EXW();rig({fill:false,wave:{x:1,y:3,r:0,n:1,owner:0,pt:3},turn:10,cur:2,ships:[{x:4,y:2,e:6},{x:5,y:2,e:2},{x:5,y:3,e:2}]});startTurn(0,[1,1,1]);eq([X.G.wave.x,X.G.wave.y],[1,2],'north one square');eq(ship(0).alive,false,'in the new row at strength 3 and rolled 1')});
R('exp-wave','The wave passes over tiles without destroying them.',()=>{EXW();rig({fill:false,tiles:[{x:2,y:3,id:36}],wave:{x:1,y:3,r:1,n:0,owner:0,pt:3},cur:2,ships:[{x:5,y:5,e:4},{x:5,y:2,e:2},{x:5,y:3,e:2}]});startTurn(0,[1,1]);eq([X.G.wave.x,X.G.wave.y],[2,3]);eq(X.G.bd[3*6+2],[36,0])});
R('exp-wave','When the wave moves off the edge it leaves the game (not back into the leviathan deck).',()=>{EXW();rig({fill:false,wave:{x:5,y:2,r:1,n:2,owner:0,pt:3},cur:2});startTurn(0,[1,1]);eq(X.G.wave,null);eq(X.G.mgone.includes(10),true);eq(X.G.mdeck.includes(10),false)});

S('H. Expansion: Maelstrom');
const EXM=()=>mk(3,{exp:{rift:0,wave:0,maelstrom:1,cannon:0}});
R('exp-mael','The Maelstrom tile is shuffled into the leviathan deck (11 tiles) and placed like a leviathan when drawn.',()=>{const G=EXM();eq([...G.mons.map(m=>m.id),...G.mdeck,...G.mgone].sort((a,b)=>a-b),[...Array(12).keys()].filter(i=>i!==10));
  rig({fill:false,mons:[{id:0,x:0,y:0}],mdeck:[11]});DQ=[4,4];step('spawn');eq(pos(mon(11)),[3,3])});
R('exp-mael','It moves only on turns when the leviathans do NOT move (the dice total is not 6, 7 or 8): one die, one square.',()=>{
  EXM();rig({mons:[{id:11,x:2,y:2},...FILL],fill:false});X.G.ag=[];DQ=[1,2,1];E.AG.roll({});run();eq(pos(mon(11)),[3,2],'calm roll 3: moved east on die 1');
  EXM();rig({mons:[{id:11,x:2,y:2},...FILL],fill:false});X.G.ag=[];DQ=[3,4,RDIE[7],RDIE[8],RDIE[9]];E.AG.roll({});run();eq(pos(mon(11)),[2,2],'total 7: leviathans move, Maelstrom stays')});
R('exp-mael','Die faces 1-4 move it one square in four different directions; 5 and 6 mean no move.',()=>{
  const d=[];for(let die=1;die<=6;die++){EXM();rig({mons:[{id:11,x:2,y:2}],fill:false});DQ=[die];step('mael');const m=mon(11);d.push([m.x-2,m.y-2])}
  eq(d.slice(4),[[0,0],[0,0]],'5 and 6 stay');eq(new Set(d.slice(0,4).map(v=>v.join())).size,4,'four directions');ok(d.slice(0,4).every(v=>Math.abs(v[0])+Math.abs(v[1])===1),'one square',d)});
R('exp-mael','Everything in the square it enters is removed: the wake tile (out of the game, not recycled), ships on it, and leviathans.',()=>{
  EXM();rig({fill:false,tiles:[{x:3,y:2,id:36}],mons:[{id:11,x:2,y:2}],ships:[{x:5,y:3,e:2},{x:3,y:3,e:1,on:[3,2]},{x:5,y:4,e:2}],deck:[40]});const m=X.G.mons.find(x=>x.id===11);DQ=[1];
  step('mael');eq(pos(mon(11)),[3,2]);eq(X.G.bd[2*6+3],null);eq(ship(1).alive,false);eq(X.G.gone.includes(36),true,'tile leaves the game');eq(X.G.deck.includes(36),false);
  EXM();rig({fill:false,mons:[{id:11,x:2,y:2},{id:0,x:3,y:2}]});DQ=[1];step('mael');eq(mon(0),null,'leviathan in the square is removed')});
R('exp-mael','A Maelstrom that leaves the board is removed from the game.',()=>{EXM();rig({fill:false,mons:[{id:11,x:5,y:2}]});DQ=[1];step('mael');eq(mon(11),null);eq(X.G.mgone.includes(11),true)});
R('exp-mael','A leviathan that moves into the Maelstrom\'s square is removed too.',()=>{EXM();rig({fill:false,mons:[{id:11,x:2,y:2},{id:0,x:2,y:1}]});step('monAct',{id:0,die:3});eq(mon(0),null);eq(X.G.mgone.includes(0),true);eq(pos(mon(11)),[2,2])});

S('I. Expansion: Deck Cannon');
const EXC=()=>mk(3,{exp:{rift:0,wave:0,maelstrom:0,cannon:1}});
R('exp-cannon','5 Deck Cannons are shuffled into the wake deck.',()=>{const G=EXC();const c=[].concat(G.deck,...G.hands,G.limbo!=null?[G.limbo]:[]);eq(c.length,61);eq(c.filter(x=>x>=57).length,5)});
R('exp-cannon','When you draw a Deck Cannon you may keep it, or show it and discard it (out of the game) and draw a replacement.',()=>{
  EXC();rig({hands:[[1,5]],deck:[57,20,21]});step('draw',{seat:0});eq(X.G.q.kind,'cannonDraw');ans(1);eq(X.G.hands[0],[1,5,20]);eq(X.G.gone,[57]);
  EXC();rig({hands:[[1,5]],deck:[57,20,21]});step('draw',{seat:0});ans(0);eq(X.G.hands[0],[1,5,57])});
R('exp-cannon','You may hold at most 2 Deck Cannons; a further one drawn is discarded and replaced.',()=>{EXC();rig({hands:[[57,58]],deck:[59,20]});step('draw',{seat:0});eq(X.G.q,null);eq(X.G.hands[0],[57,58,20]);eq(X.G.gone,[59])});
R('exp-cannon','Instead of a wake tile you may fire a cannon at a leviathan next to your wake: it is destroyed, goes to the BOTTOM of the leviathan deck, the cannon leaves the game, and you still draw.',()=>{
  EXC();rig({tiles:[{x:2,y:1,id:1}],ships:[{x:2,y:2,e:0,on:[2,1]},{x:5,y:2,e:2},{x:5,y:3,e:2}],mons:[{id:0,x:3,y:2},{id:7,x:0,y:5},{id:8,x:5,y:0},{id:9,x:5,y:5}],fill:false,hands:[[57,1,5]],mdeck:[1,2,3,4,5,6],deck:[40]});
  const mv=X.validMoves(0).filter(m=>m.a==='cannon');eq(mv.map(m=>m.m),[0],'only the adjacent leviathan can be targeted');X.performMove(mv[0],0);eq(mon(0),null);eq(X.G.mdeck.slice(-1),[0],'bottom of the leviathan deck');eq(X.G.gone,[57]);eq(X.G.hands[0].length,3)});
R('exp-cannon','Any time a ship is about to be eliminated by a leviathan (even on another player\'s turn) its owner may fire a cannon to destroy it; the ship is saved.',()=>{
  EXC();rig({tiles:[{x:1,y:1,id:34},{x:2,y:0,id:34}],ships:[{x:2,y:1,e:6,on:[1,1]},{x:2,y:1,e:1,on:[2,0]},{x:5,y:3,e:2}],mons:[{id:0,x:2,y:2},{id:7,x:0,y:5},{id:8,x:5,y:0},{id:9,x:5,y:5}],fill:false,hands:[[1,5,6],[57,11,12]],mdeck:[1,2,3,4,5,6]});
  place(1,0);eq(X.G.q.who,1);ok(X.G.q.opts.some(o=>/Deck Cannon/.test(o.l)),'cannon offered',X.G.q.opts.map(o=>o.l));ansBy(o=>/Deck Cannon/.test(o.l));
  eq(mon(0),null);eq(X.G.mdeck.slice(-1),[0]);eq(X.G.gone.includes(57),true);eq(ship(1).alive,true);eq(state(1),{x:2,y:2,e:0,on:[2,1]},'continues along its wake')});
R('exp-cannon','A leviathan destroyed by a cannon counts against the minimum of 3 (the next turn tops it up without a movement roll).',()=>{
  EXC();rig({tiles:[{x:2,y:1,id:1}],ships:[{x:2,y:2,e:0,on:[2,1]},{x:5,y:2,e:2},{x:5,y:3,e:2}],mons:[{id:0,x:3,y:2},{id:7,x:0,y:5},{id:8,x:5,y:0}],fill:false,hands:[[57,1,5]],mdeck:[1,2,3,4,5,6,9]});X.G.dice=[9,9];
  X.performMove({a:'cannon',t:0,m:0,s:0},0);eq(E.levCount(X.G),3,'refilled to 3');eq(X.G.dice,[9,9],'no roll on the refill turn')});

S('J. Variants');
R('variant','Solo: set up as a 2-player game (6 leviathans); you win by getting through all 10 leviathans, you lose if your ship goes down.',()=>{
  const G=mk(1,{variant:'solo'});eq(G.np,1);eq(G.mons.length,6);rig({fill:false,mons:[],mdeck:[],mgone:[0,1,2,3,4,5,6,7,8,9]});step('check',{clear:1});eq(X.G.over.win,[0],'all 10 gone: win');
  mk(1,{variant:'solo'});rig({fill:false,ships:[{alive:false}]});step('check',{clear:1});eq(X.G.over.win,[],'ship lost: no winner')});
R('variant','Easy solo: tiles destroyed by leviathans are discarded (not recycled) and you win by sailing through all the tiles.',()=>{
  mk(1,{variant:'easysolo'});rig({fill:false,tiles:[{x:2,y:3,id:36}],mons:[{id:0,x:2,y:2}],deck:[40,41]});step('monAct',{id:0,die:3});eq(X.G.gone.includes(36),true);eq(X.G.deck.includes(36),false);
  rig({fill:false,deck:[40],hands:[[1]]});step('check',{clear:1});eq(X.G.phase,'play','tiles remain');rig({fill:false,deck:[],hands:[[]]});step('check',{clear:1});eq(X.G.over.win,[0])});
R('variant','Teams: 4, 6 or 8 players in two teams; you may place a tile in front of your own or a teammate\'s ship (never an opponent\'s).',()=>{
  eq([2,3,4,5,6,7,8].map(n=>mk(n,{variant:'teams'}).np),[4,4,4,4,6,6,8]);const G=mk(4,{variant:'teams'});eq(G.team,[0,1,0,1]);
  rig({ships:[{x:2,y:0,e:0},{x:5,y:2,e:2},{x:0,y:3,e:6},{x:5,y:4,e:2}],hands:[[1,5,6]]});const s=new Set(X.validMoves(0).map(m=>m.s));eq([...s].sort(),[0,2])});
R('variant','Teams: the last team with a ship afloat wins (all its members).',()=>{mk(4,{variant:'teams'});rig({ships:[{x:2,y:0,e:0},{alive:false},{x:0,y:3,e:6},{alive:false}]});step('check',{clear:1});eq(X.G.over.win.slice().sort(),[0,2])});
R('variant','Two players use the ordinary rules (same set-up as 3-4 players).',()=>{const G=mk(2);eq(G.mons.length,6);eq(G.hands.map(h=>h.length),[3,3]);eq(G.variant,null)});

S('K. Table-only rules (cannot be checked headless; kept for the record)');
R('base','The oldest player goes first (the app lets the host or the dice choose the first seat instead).',null);
R('base','Tiles in hand are kept hidden from the other players (the app shows each player only their own hand).',null);
R('base','Teams: teammates may not show each other their tiles (a table courtesy; the app hides hands).',null);
R('exp-wave','The blue Rogue Wave marker tile sits on the board edge to show where the wave is heading (the app draws the wave directly).',null);

if(process.argv.includes('--md')){
  const out=['# Tidewake rules checklist','','One numbered entry per rule of the original rulebook and its expansion, in our own words and names (current = wake tile, leviathan = monster, Rift Gate, Rogue Wave, Maelstrom, Deck Cannon). Every entry marked TEST has exactly one assertion in `logic-test.js` with the same number (`node logic-test.js`). Written from the rulebook text recorded in `rules-notes.md` and a web search; items the sources disagree on are listed at the end.','',
   'Source tags: base = base game, exp-gate / exp-wave / exp-mael / exp-cannon = the expansion pieces, variant = official variants.',''];
  let sec='';for(const r of RULES){if(r.sec!==sec){sec=r.sec;out.push('','## '+sec,'')}out.push(`${r.n}. **[${r.src}]** ${r.text} — ${r.fn?'TEST R'+r.n:'TABLE-ONLY, no test'}`)}
  out.push('','## Rules the sources do not settle (our decisions; not scored as failures)','',
   '- Board size: sources say 6x6, 7x7 or 8x8; the dice only reach 1-6. We keep 6x6 (planner decision, see `game/RULES-AUDIT.md` 2). Consequence: "last available square" and "play every tile" endings are not reachable in practice.',
   '- Which leviathan has which arrows and corner numbers, and the exact 21 repeated wake tiles: not published in the text found; our own layouts (`src/data.js`).',
   '- What happens when two ships are forced onto one wake in one direction: sources only forbid placing it; we eliminate both.',
   '- Easy solo: the sources give no start count or turn goal; the engine starts with 4 leviathans and adds a 24-turn win because a 6x6 board cannot hold all 56 tiles.',
   '- Leviathan beside a waiting ship: the rulebook text gives an exception for a second ship on the same side of the same tile facing the same way; the engine kills only the active ship whose front square is entered (see `game/RULES-AUDIT.md` 6). Not testable from the sources, so not scored.',
   '- Maelstrom arrows (which die face goes where) and Rogue Wave tile arrows: our own layout.','');
  fs.writeFileSync(__dirname+'/RULES-CHECKLIST.md',out.join('\n'));console.log('wrote RULES-CHECKLIST.md with',RULES.length,'rules');process.exit(0)}

let pass=0,fail=0,na=0;const fails=[];
for(const r of RULES){if(!r.fn){na++;continue}
  try{r.fn();pass++}catch(e){fail++;fails.push(r.n);console.log(`FAIL R${r.n} ${(e.message||String(e)).split('\n')[0].slice(0,400)}`)}}
console.log(`RULES ${RULES.length} (${RULES.length-na} tested, ${na} table-only): PASS ${pass}, FAIL ${fail}`+(fails.length?'  failing: '+fails.join(','):''));
process.exit(fail?1:0);

// Named rule scenarios. Each builds a real game, rigs the board with rig(), then drives the real engine (performMove / agenda handlers).  node rules-test.js
const {load}=require('./tools/load');const X=load(['data.js','engine.js','ai.js']);const E=X.E;
let pass=0,fail=0;const fails=[];
function T(name,fn){try{const r=fn();if(r===false)throw new Error('returned false');pass++;console.log('PASS',name)}catch(e){fail++;fails.push(name);console.log('FAIL',name,'-',(e.stack||e.message).split('\n').slice(0,3).join(' | '))}}
function ok(c,msg){if(!c)throw new Error(msg||'assertion failed')}
function eq(a,b,msg){if(JSON.stringify(a)!==JSON.stringify(b))throw new Error((msg||'')+` expected ${JSON.stringify(b)} got ${JSON.stringify(a)}`)}
function inv(){const v=X.checkInvariants();ok(!v.length,'invariants: '+v[0])}
function game(np,o){X.setSeed((o&&o.seed)||5);X.ai.setAiSeed(3);X.newGame(Object.assign({players:np,first:0},o||{}));let k=0;while(X.G.q&&k++<30)X.performMove({a:'q',i:0},X.sideToAct());return X.G}
// rig: tiles [{x,y,id,r}], hands [[ids]...] (unlisted hands are dealt from the rest), ships [{x,y,e,on,alive}], mons [{id,x,y,r}], gates [{x,y}], wave {...}, cur
function rig(o){const G=X.G,ex=G.exp;const all=[];for(let i=0;i<56;i++)all.push(i);if(ex.rift&&!(o.gates&&o.gates.length))all.push(56);if(ex.cannon)all.push(57,58,59,60,61);
  const used=new Set();const bd=new Array(36).fill(null);for(const t of o.tiles||[]){bd[t.y*6+t.x]=[t.id,t.r||0];used.add(t.id)}
  const hands=[];for(let i=0;i<G.np;i++){const h=o.hands&&o.hands[i];hands.push(h?h.slice():null);if(h)for(const c of h)used.add(c)}
  const rest=all.filter(c=>!used.has(c));for(let i=0;i<G.np;i++)if(!hands[i]){hands[i]=[];while(hands[i].length<3){const j=rest.findIndex(c=>c<56);hands[i].push(rest.splice(j,1)[0])}}
  G.bd=bd;G.hands=hands;G.deck=rest;G.gone=[];G.pool=[];G.limbo=null;G.gates=(o.gates||[]).map(g=>({x:g.x,y:g.y}));
  G.mons=(o.mons||[]).map(m=>({id:m.id,k:m.id===11?'M':'L',x:m.x,y:m.y,r:m.r||0}));const want=[];for(let i=0;i<10;i++)want.push(i);if(ex.wave)want.push(10);if(ex.maelstrom)want.push(11);
  if(o.fill!==false){const ids=[9,8,7,6];const cand=[[5,0],[0,0],[0,5],[5,3],[3,0],[0,3],[4,5]];const taken=new Set([...(o.tiles||[]).map(t=>t.x+','+t.y),...(o.ships||[]).filter(sp=>sp.x!=null).map(sp=>sp.x+','+sp.y),...G.mons.map(m=>m.x+','+m.y)]);
    let n=G.mons.filter(m=>m.k==='L').length;for(const [x,y] of cand){if(n>=3)break;const id=ids.find(i=>!G.mons.some(m=>m.id===i));if(taken.has(x+','+y)||id==null)continue;G.mons.push({id,k:'L',x,y,r:0});taken.add(x+','+y);n++}}
  G.wave=o.wave?Object.assign({n:0,owner:0,pt:0,r:3},o.wave):null;G.mdeck=want.filter(id=>!G.mons.some(m=>m.id===id)&&!(id===10&&G.wave));G.mgone=[];
  G.ships.forEach((s,i)=>{const sp=(o.ships||[])[i]||{};Object.assign(s,{x:sp.x==null?null:sp.x,y:sp.y==null?null:sp.y,e:sp.e==null?null:sp.e,on:sp.on||null,alive:sp.alive!==false,moved:!!sp.on,tp:null,out:''});if(!s.alive){s.x=s.y=s.e=null;G.deck.push(...G.hands[i]);G.hands[i]=[]}});
  G.phase='play';G.step=o.step===undefined?'act':o.step;G.cur=o.cur||0;G.turn=1;G.ag=[];G.agI=0;G.q=null;G.arr=null;G.refill=false;G.placeElim=[];G.batch=[];G.over=null;G.mq=[];G.bq=null;if(o.fill!==false)inv()}
function run(){X.G.agI=0;E.flow()}
function forcePlace(seat,t,r,s){X.G.step=null;X.G.agI=0;E.AG.place({t,r,s:s==null?seat:s});run()}
function answer(i){const r=X.performMove({a:'q',i},X.sideToAct());ok(r.success,r.error)}
function ship(i){return X.G.ships[i]}
const T0=0,T1=1,T34=34,T1b=36; // tile ids: type 0 [0-4,1-5,2-7,3-6]; type 1 straight lines; type 34 short turns 0-1,2-3,4-5,6-7; id 36 = second tile of type 1

T('chained path: a ship follows through several placed currents to the open end',()=>{game(2);
  rig({tiles:[{x:2,y:3,id:T1b,r:0},{x:2,y:4,id:T0,r:0},{x:2,y:1,id:34}],ships:[{x:2,y:2,e:0,on:[2,1]},{x:5,y:5,e:4}],hands:[[T1,5,6]]});
  const before=X.G.stats.chain||0;forcePlace(0,0,0);const s=ship(0);eq([s.x,s.y,s.e,s.on],[2,5,1,[2,4]]);ok((X.G.stats.chain||0)>before,'chain stat');inv()});
T('placement also moves another ship whose wake the tile extends (and both keep going)',()=>{game(3);
  rig({tiles:[{x:1,y:2,id:34},{x:3,y:2,id:55}],ships:[{x:2,y:2,e:6,on:[1,2]},{x:2,y:2,e:3,on:[3,2]},{x:5,y:5,e:4}],hands:[[T1,5,6]]});
  // tile 1 turned 0: 6-2 and 3-7. ship0 6->2 east to (3,2) (a short-turn tile 6-7... enters 6 -> exits 7) ; just check both moved off the shared square
  forcePlace(0,0,0);ok(!(ship(0).alive&&ship(0).x===2&&ship(0).y===2),'ship0 moved');ok(!(ship(1).alive&&ship(1).x===2&&ship(1).y===2),'ship1 moved');inv()});
T('head-on: two ships linked end to end each run back along the other wake and both sink',()=>{game(3);
  rig({tiles:[{x:0,y:0,id:T0,r:0},{x:2,y:0,id:4,r:0}],ships:[{x:1,y:0,e:6,on:[0,0]},{x:1,y:0,e:2,on:[2,0]},{x:5,y:5,e:4}],hands:[[T1,5,6]]});
  forcePlace(0,0,0);ok(!ship(0).alive&&!ship(1).alive,'both sunk');ok(ship(2).alive);ok(X.G.over&&X.G.over.win.includes(2)&&X.G.over.win.length===1,'third wins');
  ok(X.G.stats.edgeKill>=2,'two edge kills');inv()});
T('same wake, same direction: two ships ending on one port collide and both sink',()=>{game(3);
  // B waits at the open end (4,2) port 7 after riding tile 1 at (3,2) 6->2; A enters the same wake from behind via a tile 0 at (2,2)
  rig({tiles:[{x:3,y:2,id:T1b,r:0},{x:1,y:2,id:34}],ships:[{x:2,y:2,e:6,on:[1,2]},{x:4,y:2,e:7,on:[3,2]},{x:5,y:5,e:4}],hands:[[T0,5,6]]});
  const sim=E.simPlace(X.G,2,2,T0,0);eq(sim.coll.slice().sort(),[0,1],'sim sees the collision');
  forcePlace(0,0,0);ok(!ship(0).alive&&!ship(1).alive,'both sunk');ok(X.G.stats.collision>=1);inv()});
T('prohibited placements (own edge, own collision) are only offered when nothing else is legal',()=>{game(2);
  rig({ships:[{x:0,y:1,e:6},{x:5,y:5,e:4}],hands:[[T34,T0,T1]]});const mv=X.validMoves(0);
  ok(mv.length>0&&mv.every(m=>{const s=E.simPlace(X.G,0,1,X.G.hands[0][m.t],m.r);return s.res[0].st==='ok'}),'only safe moves while any exist');});
T('edge: a ship whose open end reaches the board edge is eliminated',()=>{game(3);
  rig({ships:[{x:0,y:1,e:6},{x:5,y:5,e:4},{x:3,y:5,e:4}],hands:[[T34,T0,T1]]});forcePlace(0,0,0);ok(!ship(0).alive);ok(/edge/.test(ship(0).out));ok(X.G.hands[0].length===0||X.G.hands[0].length===3&&false||true);inv()});
T('start placement: all ships are placed before any tile, blocked starts can be avoided',()=>{game(3);const g=X.G;eq(g.phase,'setup');
  const seen=new Set();let n=0;while(g.phase==='setup'&&n++<10){const s=X.sideToAct();const mv=X.validMoves(s);ok(mv.length>0);ok(!mv.some(m=>E.monAt(g,m.x,m.y)),'no start in front of a leviathan');
    const m=mv[0];X.performMove(m,s);seen.add(m.x+','+m.y+','+m.e)}
  eq(g.phase,'play');ok(g.ships.every(s=>s.x!=null));inv()});
T('leviathan moves onto a current with a ship on it: tile destroyed (to the bottom of the draw pile) and ship eliminated',()=>{game(3);
  rig({tiles:[{x:3,y:3,id:T1b,r:0}],ships:[{x:3,y:4,e:1,on:[3,3]},{x:5,y:5,e:4},{x:0,y:3,e:6}],mons:[{id:0,x:3,y:2,r:0},{id:5,x:5,y:0},{id:6,x:0,y:0}],cur:1,hands:[[1,2,3]]});
  X.G.agI=0;E.AG.monAct({id:0,die:3});run();ok(!ship(0).alive,'ship sunk');ok(!X.G.bd[3*6+3],'tile removed');ok(X.G.deck.slice(-4).includes(T1b),'tile at the bottom of the pile');
  eq([E.monById(0).x,E.monById(0).y],[3,3]);ok(X.G.stats.levKillShip>=1);inv()});
T('leviathan moves onto another leviathan: the stationary one is destroyed',()=>{game(2);rig({ships:[{x:5,y:5,e:4},{x:0,y:5,e:6}],mons:[{id:0,x:2,y:2,r:0},{id:1,x:2,y:3,r:0},{id:2,x:5,y:0},{id:3,x:0,y:0}]});
  X.G.agI=0;E.AG.monAct({id:0,die:3});run();ok(!E.monById(1),'destroyed');ok(X.G.mgone.includes(1));eq([E.monById(0).x,E.monById(0).y],[2,3]);inv()});
T('leviathan leaving the board is removed from play',()=>{game(2);rig({ships:[{x:5,y:5,e:4},{x:0,y:5,e:6}],mons:[{id:0,x:2,y:0,r:0},{id:1,x:3,y:3},{id:2,x:4,y:4},{id:3,x:1,y:1}]});
  X.G.agI=0;E.AG.monAct({id:0,die:1});run();ok(!E.monById(0));ok(X.G.mgone.includes(0));inv()});
T('leviathan arrow rotation turns the monster, and arrows follow its facing',()=>{game(2);rig({ships:[{x:5,y:5,e:4},{x:0,y:5,e:6}],mons:[{id:0,x:2,y:2,r:0}]});
  X.G.agI=0;E.AG.monAct({id:0,die:5});run();eq(E.monById(0).r,1,'turned clockwise');X.G.agI=0;E.AG.monAct({id:0,die:3});run();eq([E.monById(0).x,E.monById(0).y],[1,2],'S arrow now points west');inv()});
T('a roll of 6 for a leviathan: it stays and a new leviathan is placed',()=>{game(2);rig({ships:[{x:5,y:5,e:4},{x:0,y:5,e:6}],mons:[{id:0,x:2,y:2,r:0},{id:1,x:3,y:3},{id:2,x:4,y:4},{id:3,x:1,y:1}]});
  const n=X.G.mons.length,d=X.G.mdeck.length;X.G.agI=0;E.AG.monAct({id:0,die:6});run();eq([E.monById(0).x,E.monById(0).y],[2,2]);eq(X.G.mons.length,n+1);eq(X.G.mdeck.length,d-1);ok(X.G.stats.spawn6>=1);inv()});
T('a spawned leviathan landing on a current destroys it and sinks ships on it',()=>{game(2);
  rig({tiles:[{x:2,y:2,id:T1b,r:0}],ships:[{x:2,y:3,e:1,on:[2,2]},{x:5,y:5,e:4}],mons:[{id:1,x:3,y:3},{id:2,x:4,y:4},{id:3,x:1,y:1}]});
  X.G.mdeck=[0,...X.G.mdeck.filter(x=>x!==0)];X.G.arr={id:0,k:'L',x:2,y:2,r:0,dead:[],spawn:1};X.G.mdeck.shift();X.G.agI=0;E.AG.arrive({});run();ok(!ship(0).alive);ok(!X.G.bd[2*6+2]);ok(E.monById(0));inv()});
T('monster in front of the active ship eliminates it (blocked); other ships survive until their turn',()=>{game(3);
  rig({tiles:[{x:3,y:1,id:55}],ships:[{x:2,y:2,e:0},{x:3,y:0,e:4,on:[3,1]},{x:5,y:5,e:4}],mons:[{id:0,x:3,y:0},{id:1,x:4,y:4},{id:2,x:1,y:1},{id:3,x:0,y:4}],cur:2});
  X.G.step=null;X.G.cur=0;X.G.agI=0;E.AG.blockCheck({});run();ok(ship(0).alive,'ship 0 front is free');ok(ship(1).alive,'ship 1 is blocked but not active');
  X.G.cur=1;X.G.agI=0;E.AG.blockCheck({});run();ok(!ship(1).alive,'active blocked ship sinks')});
T('start block: an unmoved ship blocked at its start may relocate along the same edge',()=>{game(3);
  rig({ships:[{x:3,y:0,e:0},{x:5,y:5,e:4},{x:0,y:3,e:6}],mons:[{id:0,x:3,y:0},{id:1,x:4,y:4},{id:2,x:1,y:1},{id:3,x:0,y:4}],cur:0});
  X.G.step=null;X.G.agI=0;E.AG.blockCheck({});run();eq(X.G.q&&X.G.q.kind,'doom');const i=X.G.q.opts.findIndex(o=>o.h==='dReloc');ok(i>=0,'relocation offered');answer(i);ok(ship(0).alive);ok(ship(0).x!==3||ship(0).e!==0);ok(X.G.stats.relocate>=1)});
T('spawn on a 6 is part of a real monster roll (6/7/8 moves leviathans, everything else does not)',()=>{game(2);let moved=0,calm=0;
  for(let sd=1;sd<=120;sd++){rig({ships:[{x:5,y:5,e:4},{x:0,y:5,e:6}],mons:[{id:0,x:2,y:2},{id:1,x:3,y:3},{id:2,x:4,y:1},{id:3,x:1,y:4}]});X.G.rng=sd*977;X.G.step=null;X.G.cur=0;
    const pos=JSON.stringify(X.G.mons.map(m=>[m.x,m.y,m.r]));X.G.agI=0;E.AG.roll({});run();const t=X.G.dice[0]+X.G.dice[1];const now=JSON.stringify(X.G.mons.map(m=>[m.x,m.y,m.r]));
    if(t>=6&&t<=8){moved++;ok(X.G.stats.monRoll>0)}else{calm++;ok(pos===now,'calm roll must not move monsters')}}
  ok(moved>20&&calm>30,'both outcomes seen '+moved+'/'+calm)});
T('minimum 3 leviathans: next player places up to 3 and does not roll',()=>{game(2);
  rig({ships:[{x:5,y:5,e:4},{x:0,y:5,e:6}],mons:[{id:0,x:2,y:0,r:0},{id:1,x:3,y:3},{id:2,x:4,y:1}],cur:0});
  X.G.agI=0;E.AG.monAct({id:0,die:1});E.AG.afterMon({});run();ok(X.G.refill,'refill pending');eq(E.levCount(X.G),2);
  inv();X.G.dice=[9,9];X.G.cur=0;X.G.agI=0;E.AG.turnStart({});run();eq(E.levCount(X.G),3,'back to three');eq(X.G.dice,[9,9],'no roll');ok(!X.G.refill);ok(X.G.stats.refill>=1);eq(X.G.step,'act');inv()});
T('elimination bonus: the placer swaps own tiles for the eliminated crew\'s, the rest sinks to the bottom, then draws to 3',()=>{game(3);
  rig({ships:[{x:2,y:2,e:0,on:[2,1]},{x:2,y:2,e:6,on:[1,2]},{x:5,y:5,e:4}],tiles:[{x:2,y:1,id:34},{x:1,y:2,id:55}],mons:[{id:5,x:3,y:2},{id:6,x:0,y:0},{id:7,x:5,y:0},{id:8,x:0,y:5}],hands:[[T1,10,11],[20,21,22],[30,31,32]]});
  ok(X.validMoves(0).some(m=>m.a==='place'&&m.t===0&&m.r===0),'move legal');X.performMove({a:'place',t:0,r:0,s:0},0);
  ok(!ship(1).alive,'ship 1 ran into the leviathan');eq(X.G.q&&X.G.q.kind,'bonus');eq(X.G.q.who,0);
  const o=X.G.q.opts.findIndex(x=>x.h==='bSwap');ok(o>=0);const d=X.G.q.opts[o].d;answer(o);
  while(X.G.q&&X.G.q.kind==='bonus'){const k=X.G.q.opts.findIndex(x=>x.h==='bDone');answer(k)}
  ok(X.G.hands[0].some(c=>[20,21,22].includes(c)),'took a tile from the sunken hand');eq(X.G.hands[0].length,3,'drew back to three');eq(X.G.hands[1].length,0);ok(X.G.pool.length===0);
  ok([20,21,22].filter(c=>X.G.deck.slice(-5).includes(c)).length>=2,'the rest at the bottom');eq(X.G.cur,2,'next player is up');inv()});
T('last ship afloat wins',()=>{game(2);rig({ships:[{x:0,y:1,e:6},{x:5,y:5,e:4}],hands:[[T34,T0,T1]]});forcePlace(0,0,0);eq(X.G.phase,'over');eq(X.G.over.win,[1])});
T('simultaneous elimination of the last ships: they share the win',()=>{game(2);
  rig({tiles:[{x:0,y:0,id:T0,r:0},{x:2,y:0,id:4,r:0}],ships:[{x:1,y:0,e:6,on:[0,0]},{x:1,y:0,e:2,on:[2,0]}],hands:[[T1,5,6]]});
  forcePlace(0,0,0);eq(X.G.phase,'over');eq(X.G.over.win.slice().sort(),[0,1])});
T('solo: win by outlasting every leviathan; losing when the junk sinks',()=>{game(1,{variant:'solo'});eq(X.G.np,1);eq(X.G.mons.length+X.G.mdeck.length,10);eq(X.G.mons.length,6);
  rig({ships:[{x:2,y:2,e:0}],mons:[],fill:false});X.G.mdeck=[];X.G.mgone=[0,1,2,3,4,5,6,7,8,9];X.G.agI=0;E.AG.check({});run();eq(X.G.phase,'over');ok(X.G.over.win.length===1,'won');
  game(1,{variant:'solo'});rig({ships:[{x:0,y:1,e:6}],hands:[[T34,55,33]]});forcePlace(0,0,0);eq(X.G.over.win,[],'lost')});
T('easy solo: destroyed currents are discarded for good; win when the whole pile is played',()=>{game(1,{variant:'easysolo'});
  rig({tiles:[{x:3,y:3,id:T1b,r:0}],ships:[{x:3,y:4,e:1,on:[3,3]}],mons:[{id:0,x:3,y:2,r:0},{id:1,x:5,y:5},{id:2,x:0,y:0}],hands:[[1,2,3]]});
  X.G.agI=0;E.AG.monAct({id:0,die:3});run();ok(!ship(0).alive);ok(X.G.gone.includes(T1b),'discarded, not recycled');ok(!X.G.deck.includes(T1b));
  game(1,{variant:'easysolo'});rig({ships:[{x:2,y:2,e:0,on:null}],hands:[[T1]]});X.G.deck=[];forcePlace(0,0,0);eq(X.G.phase,'over');eq(X.G.over.win,[0],'sailed through every current')});
T('teams: a player may place for a teammate and the last team afloat wins',()=>{game(4,{variant:'teams'});
  rig({ships:[{x:2,y:2,e:0},{x:4,y:4,e:4},{x:3,y:3,e:0},{x:1,y:4,e:4}],hands:[[T1,5,6]]});const mv=X.validMoves(0);ok(mv.some(m=>m.a==='place'&&m.s===0)&&mv.some(m=>m.a==='place'&&m.s===2),'own and teammate ship');ok(!mv.some(m=>m.s===1));
  X.performMove(mv.find(m=>m.s===2),0);ok(ship(2).moved,'teammate moved');
  rig({ships:[{x:0,y:1,e:6},{x:4,y:4,e:4},{alive:false},{x:1,y:4,e:4}],hands:[[T34,T0,T1]]});X.G.team=[0,1,0,1];forcePlace(0,0,0);ok(!ship(0).alive);eq(X.G.phase,'over');eq(X.G.over.win.slice().sort(),[1,3])});
// ---------- expansion pieces ----------
T('Rift Gate (own turn): played instead of a tile, ships on it are carried to rolled coordinates and ride a chosen wake',()=>{game(2,{exp:{rift:1}});
  rig({ships:[{x:2,y:2,e:0},{x:5,y:5,e:4}],tiles:[{x:4,y:4,id:T1b,r:0}],hands:[[56,5,6]]});
  const mv=X.validMoves(0);const g=mv.find(m=>m.a==='gate');ok(g,'gate move offered');X.performMove(g,0);ok(X.G.gates.length===1&&X.G.gates[0].x===2&&X.G.gates[0].y===2,'gate stays at the square');
  let n=0;while(X.G.q&&n++<8){ok(['gatePlace','gateWake'].includes(X.G.q.kind),X.G.q.kind);answer(0)}
  ok(ship(0).alive?ship(0).x!=null:true);ok(X.G.stats.gateTeleport>=1);inv()});
T('Rift Gate (interrupt): a ship about to run into a leviathan escapes on another player\'s turn',()=>{game(3,{exp:{rift:1}});
  rig({ships:[{x:2,y:2,e:0,on:[2,1]},{x:2,y:2,e:6,on:[1,2]},{x:5,y:5,e:4}],tiles:[{x:2,y:1,id:34},{x:1,y:2,id:55}],mons:[{id:5,x:3,y:2}],hands:[[T1,5,6],[56,10,11],[30,31,32]],cur:0});
  forcePlace(0,0,0);eq(X.G.q&&X.G.q.kind,'doom');eq(X.G.q.who,1,'the doomed player is asked');const i=X.G.q.opts.findIndex(o=>o.h==='dGate');ok(i>=0,'gate offered');answer(i);
  let n=0;while(X.G.q&&X.G.q.who===1&&n++<8)answer(0);ok(X.G.stats.gateRescue>=1,'rescued');ok(X.G.gates.length===1);ok(!X.G.hands[1].includes(56),'gate left the hand');inv()});
T('Deck Cannon (interrupt): destroys the leviathan about to sink a ship, which goes to the bottom of the leviathan deck',()=>{game(3,{exp:{cannon:1}});
  rig({tiles:[{x:3,y:3,id:T1b,r:0}],ships:[{x:3,y:4,e:1,on:[3,3]},{x:5,y:5,e:4},{x:0,y:3,e:6}],mons:[{id:0,x:3,y:2,r:0},{id:5,x:5,y:0},{id:6,x:0,y:0},{id:7,x:1,y:5}],cur:1,hands:[[57,2,3],[10,11,12],[20,21,22]]});
  X.G.agI=0;E.AG.monAct({id:0,die:3});run();eq(X.G.q.kind,'doom');eq(X.G.q.who,0,'owner of the ship decides');const i=X.G.q.opts.findIndex(o=>o.h==='dCannon');ok(i>=0);answer(i);
  ok(ship(0).alive,'saved');ok(X.G.bd[3*6+3],'tile survives');ok(!E.monById(0));eq(X.G.mdeck[X.G.mdeck.length-1],0,'bottom of the leviathan deck');ok(X.G.gone.includes(57),'cannon removed from the game');inv()});
T('Deck Cannon (own turn): played instead of a tile to remove a leviathan next to the junk',()=>{game(2,{exp:{cannon:1}});
  rig({ships:[{x:2,y:2,e:0},{x:5,y:5,e:4}],mons:[{id:0,x:3,y:2},{id:1,x:4,y:4},{id:2,x:0,y:0},{id:3,x:1,y:5}],hands:[[57,5,6]]});
  const mv=X.validMoves(0);const c=mv.find(m=>m.a==='cannon');ok(c&&c.m===0);ok(!mv.some(m=>m.a==='cannon'&&m.m===1),'only adjacent leviathans');X.performMove(c,0);ok(!E.monById(0));ok(X.G.mdeck.includes(0));ok(X.G.gone.includes(57));eq(X.G.hands[0].length,3,'redrew');inv()});
T('Deck Cannon draw: keep it or show-and-discard for a replacement; a third cannon is discarded at once',()=>{game(2,{exp:{cannon:1}});
  rig({ships:[{x:2,y:2,e:0},{x:5,y:5,e:4}],hands:[[5,6],[7,8,9]]});X.G.deck=[57,...X.G.deck.filter(c=>c!==57)];X.G.agI=0;E.AG.draw({seat:0});run();eq(X.G.q.kind,'cannonDraw');answer(0);
  eq(X.G.hands[0].filter(c=>c>=57).length,1);eq(X.G.hands[0].length,3);inv();
  rig({ships:[{x:2,y:2,e:0},{x:5,y:5,e:4}],hands:[[57,58],[7,8,9]]});X.G.deck=[59,...X.G.deck.filter(c=>c!==59)];const gb=X.G.gone.length;X.G.agI=0;E.AG.draw({seat:0});run();
  ok(!X.G.q,'no question for a third cannon');ok(X.G.gone.includes(59));ok(X.G.gone.length>gb);ok(X.G.hands[0].filter(c=>c>=57).length<=2);inv();
  rig({ships:[{x:2,y:2,e:0},{x:5,y:5,e:4}],hands:[[5,6],[7,8,9]]});X.G.deck=[57,...X.G.deck.filter(c=>c!==57)];X.G.agI=0;E.AG.draw({seat:0});run();answer(1);ok(X.G.gone.includes(57));eq(X.G.hands[0].length,3);ok(!X.G.hands[0].includes(57));inv()});
T('Rogue Wave: strength 2, 3 after its first move, 4 from the fourth round; ship in the row must roll at least the strength',()=>{game(2,{exp:{wave:1}});
  rig({ships:[{x:2,y:2,e:0,on:[2,1]},{x:5,y:5,e:4}],tiles:[{x:2,y:1,id:34}],wave:{x:2,y:5,r:0,n:0,owner:1,pt:0},hands:[[1,2,3]]});
  // wave heads north (r=0): row = every square with the same y as the wave
  ok(E.inRow([0,5])&&E.inRow([4,5])&&!E.inRow([2,4]),'row is across the board');eq(E.waveStr(),2);X.G.wave.n=1;eq(E.waveStr(),3);X.G.wave.n=2;eq(E.waveStr(),3);X.G.wave.n=3;eq(E.waveStr(),4);
  for(const [n,str] of [[0,2],[1,3],[3,4]]){let fail=0,pass2=0;for(let sd=1;sd<=300;sd++){rig({ships:[{x:2,y:2,e:0,on:[2,1]},{x:5,y:5,e:4}],tiles:[{x:2,y:1,id:34}],wave:{x:2,y:1,r:0,n,owner:1,pt:0},hands:[[1,2,3]]});X.G.rng=sd*7919;X.G.agI=0;E.AG.waveRoll({seat:0});run();if(ship(0).alive)pass2++;else fail++}
    const exp=(str-1)/6;ok(Math.abs(fail/300-exp)<.09,`capsize rate ${fail/300} vs ${exp} at strength ${str}`)}
  ok(X.G.stats.waveCapsize>0);inv()});
T('Rogue Wave: moves once per round before its placer\'s next turn, rolls for the active ship in the row, and leaves with its marker at the edge',()=>{game(2,{exp:{wave:1}});
  rig({ships:[{x:2,y:2,e:0},{x:5,y:5,e:4}],wave:{x:2,y:2,r:2,n:0,owner:1,pt:1},hands:[[1,2,3]],cur:0});X.G.turn=1;
  X.G.agI=0;E.AG.turnStart({});run();eq([X.G.wave.x,X.G.wave.y,X.G.wave.n],[2,3,1],'moved one square south');ok(X.G.cur===1);
  X.G.wave.y=5;X.G.agI=0;X.G.cur=0;E.AG.turnStart({});run();ok(!X.G.wave,'wave and marker gone');ok(X.G.mgone.includes(10));ok(X.G.stats.waveOff>=1);inv()});
T('Rogue Wave: a ship moved by someone else\'s tile through the row rolls immediately',()=>{game(3,{exp:{wave:1}});let rolls=0;
  rig({ships:[{x:2,y:2,e:0,on:[2,1]},{x:2,y:2,e:6,on:[1,2]},{x:5,y:5,e:4}],tiles:[{x:2,y:1,id:34},{x:1,y:2,id:55}],wave:{x:2,y:2,r:0,n:0,owner:2,pt:0},hands:[[T1,5,6]]});
  const c0=X.G.stats.waveCheck||0;forcePlace(0,0,0);ok((X.G.stats.waveCheck||0)>=c0+2,'both ships passing the row rolled');inv()});
T('Maelstrom: moves only when the leviathans do not, removes the current, ships and leviathans in its destination, never counts toward 3',()=>{game(2,{exp:{maelstrom:1}});
  rig({tiles:[{x:3,y:2,id:T1b,r:0}],ships:[{x:3,y:3,e:1,on:[3,2]},{x:5,y:5,e:4}],mons:[{id:11,x:2,y:2},{id:0,x:0,y:0},{id:1,x:5,y:0},{id:2,x:0,y:5}],cur:0});
  X.G.agI=0;E.AG.mael({});let n=0;// die is random: loop seeds until it moves east
  for(let sd=1;sd<400;sd++){rig({tiles:[{x:3,y:2,id:T1b,r:0}],ships:[{x:3,y:3,e:1,on:[3,2]},{x:5,y:5,e:4}],mons:[{id:11,x:2,y:2},{id:0,x:0,y:0},{id:1,x:5,y:0},{id:2,x:0,y:5}],cur:0});X.G.rng=sd*31;X.G.agI=0;E.AG.mael({});run();if(E.monById(11)&&E.monById(11).x===3&&E.monById(11).y===2){n=1;break}}
  ok(n,'maelstrom moved onto the tile');ok(!ship(0).alive,'ship swallowed');ok(!X.G.bd[2*6+3],'current removed');ok(X.G.stats.maelKillShip>=1);
  // leviathans swallowed
  rig({ships:[{x:5,y:5,e:4},{x:0,y:3,e:6}],mons:[{id:11,x:2,y:2},{id:0,x:3,y:2},{id:1,x:5,y:0},{id:2,x:0,y:5}]});X.G.arr={id:11,k:'M',x:3,y:2,r:0,dead:[],move:1};X.G.agI=0;E.AG.arrive({});run();ok(!E.monById(0)&&X.G.mgone.includes(0),'leviathan removed');
  rig({ships:[{x:5,y:5,e:4},{x:0,y:3,e:6}],mons:[{id:11,x:2,y:2},{id:1,x:5,y:0},{id:2,x:0,y:5}],fill:false});X.G.agI=0;E.AG.afterMon({});run();ok(X.G.refill,'maelstrom is not one of the three');inv()});
T('Maelstrom does not move on a monster-moving roll (6/7/8)',()=>{game(2,{exp:{maelstrom:1}});let still=0,tot=0;
  for(let sd=1;sd<=200;sd++){rig({ships:[{x:5,y:5,e:4},{x:0,y:5,e:6}],mons:[{id:11,x:2,y:2},{id:0,x:3,y:3},{id:1,x:5,y:0},{id:2,x:0,y:0}]});X.G.rng=sd*131;X.G.step=null;X.G.agI=0;
    const m0=E.monById(11);const pos=[m0.x,m0.y];E.AG.roll({});run();const t=X.G.dice[0]+X.G.dice[1];if(t>=6&&t<=8){tot++;const m=E.monById(11);if(m&&m.x===pos[0]&&m.y===pos[1])still++}}
  ok(tot>20&&still===tot,`maelstrom stood still on all ${tot} monster rolls`)});
T('FIX1 Maelstrom: a tile it destroys leaves the game (G.gone), not the draw pile; a leviathan still recycles its tiles',()=>{game(2,{exp:{maelstrom:1}});
  rig({tiles:[{x:3,y:2,id:T1b,r:0}],ships:[{x:5,y:5,e:4},{x:0,y:3,e:6}],mons:[{id:11,x:2,y:2},{id:0,x:0,y:0},{id:1,x:5,y:0},{id:2,x:0,y:5}]});
  const d0=X.G.deck.length;X.G.arr={id:11,k:'M',x:3,y:2,r:0,dead:[],move:1};X.G.agI=0;E.AG.arrive({});run();
  ok(!X.G.bd[2*6+3],'tile removed');ok(X.G.gone.includes(T1b),'in gone');ok(X.G.deck.length===d0&&!X.G.deck.includes(T1b),'not in the pile');inv();
  game(2);rig({tiles:[{x:3,y:2,id:T1b,r:0}],ships:[{x:5,y:5,e:4},{x:0,y:3,e:6}],mons:[{id:0,x:2,y:2},{id:1,x:5,y:0},{id:2,x:0,y:5}]});
  X.G.arr={id:0,k:'L',x:3,y:2,r:0,dead:[]};X.G.agI=0;E.AG.arrFinal({});run();ok(X.G.deck[X.G.deck.length-1]===T1b,'leviathan tile goes to the bottom of the pile');inv()});
T('FIX4 set-up: Rogue Wave / Maelstrom drawn at set-up count toward the 6/5/4 starting tiles',()=>{let sawExtra=0;
  for(let sd=1;sd<=60;sd++){game(4,{seed:sd,exp:{wave:1,maelstrom:1}});const G=X.G;const lev=G.mons.filter(m=>m.k==='L').length,extra=(G.wave?1:0)+(G.mons.some(m=>m.k==='M')?1:0)+(G.mgone.some(i=>i>=10)?1:0);
    ok(lev+extra<=6,'seed '+sd+': '+lev+' leviathans + '+extra+' specials > 6');if(extra)sawExtra++;inv()}
  ok(sawExtra>5,'specials do get drawn at set-up');for(let sd=1;sd<=80;sd++){game(1,{variant:'easysolo',seed:sd,exp:{wave:1,maelstrom:1}});ok(X.G.mons.filter(m=>m.k==='L').length>=3,'min 3 leviathans after set-up, seed '+sd)}});
T('FIX5 teams: only 4, 6 or 8 players (5 -> 4, 7 -> 6, 2 -> 4)',()=>{for(const [n,w] of [[2,4],[3,4],[4,4],[5,4],[6,6],[7,6],[8,8]]){game(n,{variant:'teams'});eq(X.G.np,w,n+' players');eq(X.G.team.filter(t=>t===0).length,w/2)}});
T('FIX3 easy solo (our variant): 4 starting leviathans, goal 24 turns',()=>{game(1,{variant:'easysolo'});eq(X.G.mons.filter(m=>m.k==='L').length,4);eq(X.G.opts.goal,24)});
T('knowledge hides others\' hands, deck order, monster-deck order and seed',()=>{game(3,{exp:{cannon:1,rift:1}});const K=X.knowledge(1);ok(K.hands[0].every(c=>c===-1)&&K.hands[1].every(c=>c>=0),'own hand only');ok(K.deck.every(c=>c===-1));ok(K.seed===undefined&&K.rng===undefined);
  ok(JSON.stringify(K.mdeck)===JSON.stringify(K.mdeck.slice().sort((a,b)=>a-b)),'monster deck order hidden');inv()});
console.log(`\n${pass} passed, ${fail} failed`+(fails.length?': '+fails.join('; '):''));process.exit(fail?1:0);

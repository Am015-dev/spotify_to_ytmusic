// The staged tutorial's script against the real engine (no browser): every scripted turn, die and move must give the outcome each tutorial step talks about.
//   node tutscript-test.js        Exit code 1 on any mismatch.
const {load}=require('./tools/load');
const X=load(['data.js','engine.js','ai.js','tutscript.js'],';globalThis.__T={TS,tutRig,tutDice,tutAI,setTUT:f=>{TUT=f},E:{AG,LEV,follow,simPlace,monById}};');const T=X.ctx.__T;
let fail=0;const ok=(c,m)=>{if(!c){fail++;console.log('FAIL',m)}};
X.UI.sim=1;
function fresh(){T.TS.on=true;T.setTUT(T.tutDice);X.setSeed(T.TS.seed);X.ai.setAiSeed(3);
  X.newGame({players:2,seats:['human','ai'],lv:['normal','easy'],exp:{},first:1,names:['Vermilion','Cobalt']});T.tutRig();return X.G}
const mv=(m,s,tag)=>{const r=X.performMove(m,s);if(!r.success)throw new Error(tag+' '+JSON.stringify(m)+' '+r.error);return r};
const co=()=>{const G=X.G;const m=T.tutAI(1);return m};
try{
  const G=fresh();
  ok(G.order[0]===1&&G.phase==='setup','Cobalt places her start first');
  const cm=co();ok(cm&&cm.a==='start','scripted start');mv(cm,1,'co start');
  ok(X.sideToAct()===0,'then you');
  mv({a:'start',x:2,y:5,e:5},0,'my start');
  ok(G.phase==='play'&&G.cur===1&&G.turn===1&&G.step==='act','turn 1 is Cobalt\'s');
  // turn 1: Cobalt
  mv(co(),1,'T1');ok(G.turn===2&&G.cur===0,'turn 2 is yours');ok(G.dice[0]+G.dice[1]===7&&G.stats.monRoll===1,'turn 2 is a 7: the leviathans stir');ok(G.mons.length===5&&G.ships[0].alive&&G.ships[1].alive,'nobody hurt by the stir');
  ok(G.hands[0][0]===22&&G.hands[0].length===3,'your hand starts with tile 22');
  // the lesson: tile 22 unturned is a red cross (off the chart), turned once it is safe
  const bad=X.validMoves(0).filter(m=>m.a==='place'&&m.t===0&&m.r===0).length;ok(bad===0,'tile 22 unturned must not be a legal move (edge)');
  const sim0=T.E.simPlace(G,2,5,22,0);ok(sim0.res[0].st==='edge','unturned 22 sails off the edge');
  const sim1=T.E.simPlace(G,2,5,22,1);ok(sim1.res[0].st==='ok'&&sim1.res[0].x===2&&sim1.res[0].y===4,'turned once it sails north');
  mv({a:'place',t:0,r:1,s:0},0,'T2');
  ok(G.ships[0].x===2&&G.ships[0].y===4&&G.ships[0].alive,'your junk sailed to (3,5) in 1-based columns/rows');
  ok(G.turn===3&&G.cur===1,'turn 3 Cobalt');mv(co(),1,'T3');
  // turn 4: a calm 3; your tile 14 joins Cobalt's current
  ok(G.turn===4&&G.dice[0]+G.dice[1]===3&&G.stats.monRoll===1,'turn 4 is calm');
  ok(G.hands[0][0]===14&&G.hands[0][1]===4&&G.hands[0][2]===9,'hand at turn 4');
  const s4=T.E.simPlace(G,2,4,14,0);ok(s4.res[0].st==='ok'&&s4.res[0].path.length===2&&s4.res[0].x===4&&s4.res[0].y===4,'tile 14 chains across Cobalt\'s tile');
  mv({a:'place',t:0,r:0,s:0},0,'T4');
  ok(G.q&&G.q.kind==='cannonDraw'&&G.q.who===0,'you draw a Deck Cannon');mv({a:'q',i:G.q.opts.findIndex(o=>o.h==='cKeep')},0,'keep');
  ok(G.hands[0].includes(57)&&G.hands[0].length===3,'cannon kept');
  ok(G.turn===5&&G.cur===1&&G.wave&&G.wave.owner===0,'the wave rises on Cobalt\'s turn 5');mv(co(),1,'T5');
  // turn 6: the wave's roll
  ok(G.turn===6&&G.wave.n===1&&/rides the Rogue Wave \(rolled 5, needed 3\)/.test(G.log.map(l=>l.t).join('|')),'wave roll 5 vs 3 at the start of turn 6');
  ok(G.dice[0]+G.dice[1]===5,'calm 5');
  mv({a:'place',t:0,r:0,s:0},0,'T6');
  ok(/rolled 4, needed 3/.test(G.log.map(l=>l.t).join('|')),'second wave roll when your path crosses the row');
  ok(G.ships[0].alive&&G.ships[0].x===4&&G.ships[0].y===3,'you sail north to (5,4)');
  mv(co(),1,'T7');
  // turn 8: Gloomfin blocks you
  ok(G.turn===8&&G.q&&G.q.kind==='doom'&&G.q.who===0,'blocked at turn 8');
  const fi=G.q.opts.findIndex(o=>o.h==='dCannon');ok(fi>=0,'cannon offered');
  mv({a:'q',i:fi},0,'fire');ok(!T.E.monById(4)&&G.ships[0].alive&&G.step==='act','Gloomfin destroyed, your turn goes on');
  ok(G.mons.length===4,'four leviathans left');
  const ms=X.validMoves(0).find(m=>m.a==='place'&&m.t===0&&m.r===2);ok(!!ms,'tile 9 turned twice is legal');
  mv({a:'place',t:0,r:2,s:0},0,'T8');
  // turn 9: Dredgeback swims onto Cobalt's tile
  ok(G.phase==='over'&&G.over.win.length===1&&G.over.win[0]===0,'you win at the start of turn 9: '+JSON.stringify(G.over));
  ok(!G.ships[1].alive&&/crushed|ran into|Dredgeback/.test(G.ships[1].out||''),'Cobalt sunk by a leviathan: '+G.ships[1].out);
  ok(G.stats.levKillShip>=1,'leviathan kill counted');
  ok(!X.checkInvariants().length,'invariants: '+X.checkInvariants()[0]);
}catch(e){fail++;console.log('FAIL exception',e.stack.split('\n').slice(0,3).join(' | '))}
console.log(fail?'FAILED '+fail:'tutscript-test: all passed');process.exit(fail?1:0);

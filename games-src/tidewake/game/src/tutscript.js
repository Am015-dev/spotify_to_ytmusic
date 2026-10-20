// ===================== the staged tutorial's script (engine layer: no DOM; the page part is ui10.js) =====================
// A short fixed game for the "learn by doing" tutorial: you (seat 0, Vermilion) against Cobalt (seat 1, the computer), who sails first.
// Fixed seed, fixed leviathans, fixed hands and draw pile, fixed dice (TUT in engine.js), and Cobalt plays a written script.
// The same cards, dice and moves every time, so each rule appears on cue. Turn numbers are G.turn (Cobalt 1, you 2, Cobalt 3, you 4 ...).
//
// RULES CHECKLIST (every rule the tutorial shows, and the step that shows it; ui10.js holds the steps):
//   goal: last junk afloat wins ............................ goal, win
//   choose a start mark, all junks placed before any tile ...... mark, mark2 (Cobalt's mark is placed first)
//   the roll: 6, 7 or 8 wakes every leviathan; others calm ..... stir (turn 2, a 7: every leviathan moves or turns; the other rolls are calm)
//   lay a tile: pick it, turn it, place it on the square in front of the junk ... pick, turn, place
//   the red cross: sailing off the edge of the chart sinks you; Place is greyed ... turn (the tile is a red cross until it is turned)
//   the junk sails along the new line ......................... sail
//   ... and on through tiles other captains laid ................ chain (your tile joins Cobalt's current)
//   two junks ending on one wake both sink; placements that sink you are not allowed ... rivals (Next step on Cobalt's junk)
//   draw back up to three tiles; a Deck Cannon may be kept or discarded ... sail (text), keep
//   leviathans move: one die each, an arrow of its tile, or a turn .. stir (turn 2), cannon (turn 8)
//   a Rogue Wave sweeps a row; roll its strength or capsize ....... wave (turn 6; the wave's own roll, then your path crosses it again)
//   a leviathan in front of your junk sinks it unless a Deck Cannon destroys it ... cannon (turn 8)
//   a leviathan landing on a tile destroys it and sinks the junk on it ... sunk (turn 9, Cobalt)
// Not taught (the lightbulb and the Rules drawer cover them): Rift Gate, Maelstrom, elimination bonus, blocked-start relocation, teams and solo.
const TS={on:false,seed:11,me:0,co:1,
  start:{x:3,y:5,e:5},myStart:{x:2,y:5,e:5},
  // five leviathans (ids index their arrows in data.js): 4 will block you at turn 8, 7 will sink Cobalt at turn 9, the others just roam
  mons:[{id:0,x:0,y:0,r:0},{id:2,x:5,y:0,r:0},{id:5,x:0,y:4,r:0},{id:4,x:5,y:3,r:0},{id:7,x:2,y:2,r:0}],
  hands:[[22,14,4],[1,36,0]],
  deck:[35,9,10,57,11,12,13,15,16,17,18,19,20,21,23,24,25,26,27,28,29,30],
  // dice per turn (a 6, 7 or 8 wakes the leviathans); anything not listed is a calm 1+2
  dice:{1:[1,2],2:[3,4],3:[1,3],4:[1,2],5:[1,2],6:[2,3],7:[1,2],8:[3,4],9:[3,4]},
  // what each leviathan does when the leviathans wake: a compass direction (the die that makes it go that way is looked up), or 'rot' = turns on the spot
  mon:{2:{0:'E',2:'S',5:'N'},8:{4:'W'},9:{7:'E'}},
  wave:{x:1,y:5,r:0,at:5,die:{6:[5,4]}},            // the Rogue Wave rises at the start of turn 5, heading north; you roll 5 (needs 3), then 4 when your path crosses its row
  coMove:{a:'place',t:0,r:0,s:1}                     // Cobalt's tile every time: the first tile in her hand, unturned
};
const TUT_DIRN={N:0,E:1,S:2,W:3};
function tutDie(id,want){const m=monById(id);const arr=LEV[id].arr,rot=arr.indexOf('R')+1;if(!m||!want||want==='rot')return rot;
  for(let d=0;d<5;d++){const a=arr[d];if(a==='R')continue;if(((TUT_DIRN[a]+m.r)%4)===TUT_DIRN[want])return d+1}return rot}
const _tutWq={};
function tutDice(kind,arg){if(!TS.on||!G)return null;
  if(kind==='roll')return TS.dice[G.turn]||[1,2];
  if(kind==='mon')return tutDie(arg,(TS.mon[G.turn]||{})[arg]);
  if(kind==='wave'){const q=_tutWq[G.turn]||(_tutWq[G.turn]=((TS.wave.die||{})[G.turn]||[5]).slice());return q.shift()||5}
  return null}
// call right after newGame (a fresh game of 2 captains, human seat 0, computer seat 1, first:1, no expansions): fix the sea, the hands and the pile
function tutRig(){const g=G;g.q=null;g.ag=[];g.wave=null;g.arr=null;
  g.exp.wave=1;g.exp.cannon=1;
  g.mons=TS.mons.map(m=>({id:m.id,k:'L',x:m.x,y:m.y,r:m.r}));
  g.mdeck=[];for(let i=0;i<10;i++)if(!g.mons.some(m=>m.id===i))g.mdeck.push(i);g.mdeck.push(WAVE_ID);g.mgone=[];
  g.hands=TS.hands.map(h=>h.slice());g.deck=TS.deck.slice();
  const used=new Set([].concat(...g.hands,g.deck));for(let i=0;i<NCUR;i++)if(!used.has(i))g.deck.push(i);   // the rest of the currents follow
  for(const c of CANNON_IDS)if(!used.has(c))g.deck.push(c);   // and the other four Deck Cannons, far down the pile
  g.stats={};g.log=[];g.logN=0;lg('Tutorial: you against Cobalt.','big');
  for(const k in _tutWq)delete _tutWq[k]}
// the Rogue Wave appears at the start of turn 5 (Cobalt's turn), owned by you, so it first moves (and rolls) at the start of turn 6
{const _ts=AG.turnStart;AG.turnStart=function(d){_ts(d);const w=TS.wave;if(TS.on&&G&&G.turn===w.at&&!G.wave&&G.mdeck.includes(WAVE_ID)){
  G.mdeck=G.mdeck.filter(x=>x!==WAVE_ID);G.wave={x:w.x,y:w.y,r:w.r,n:0,owner:TS.me,pt:G.turn};lg(`A Rogue Wave rises at column ${w.x+1}, row ${w.y+1}, heading ${DNAME[w.r]}.`,'big')}}}
// Cobalt's moves: the start mark, then the same unturned tile every turn. Everything else (a question) is left to the normal computer.
function tutAI(seat){if(!TS.on||!G||seat!==TS.co)return null;
  if(G.q)return null;
  if(G.phase==='setup')return {a:'start',x:TS.start.x,y:TS.start.y,e:TS.start.e};
  if(G.phase==='play'&&G.step==='act'&&G.cur===seat){const m=TS.coMove;return {a:m.a,t:m.t,r:m.r,s:m.s}}
  return null}
{const _am=aiMove;aiMove=function(seat,lv){const m=tutAI(seat);return m||_am.apply(this,arguments)}}

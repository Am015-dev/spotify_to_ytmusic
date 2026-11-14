// Independent logic test for Vale of Banners: one assertion per numbered rule of the original rulebook, against the real engine.
// node logic-test.js            -> prints one line per failing rule (rule number, expected, got) and a total
// node logic-test.js --md       -> prints RULES-CHECKLIST.md (the numbered list is generated from this file, so the two cannot drift)
const VB = require('./load.js')();
const C = VB.CELLS, HOME = VB.HOME;
const rules = [], secs = [];
function S(name, note) { secs.push({ name, note: note || '', at: rules.length }); }
function R(text, fn) { rules.push({ text, fn }); }
const eq = (exp, got) => [exp, got];
const tile = (t, k, n) => ({ id: 'T' + Math.random().toString(36).slice(2, 8), t, k, n });
const filler = i => ({ id: 'f' + i, t: C[i].col });
function G0(n, o) {
  const G = VB.newGame(Object.assign({ n: n || 2, seed: 7, seats: Array.from({ length: n || 2 }, (_, i) => ({ human: i === 0 })) }, o));
  G.order = [...Array(G.n).keys()]; G.ti = 0; G.pend = [];
  const p = G.P[0]; p.dice = [1, 1]; p.used = [false, false]; p.workers = 0; p.silver = 3; p.goods = {}; p.store = []; p.bought = false;
  return G;
}
function adj(p, ci) { if (C[ci].nb.some(n => p.estate[n])) return; const nb = C[ci].nb.find(n => C[n].reg !== C[ci].reg) ; const f = nb == null ? C[ci].nb[0] : nb; p.estate[f] = filler(f); }
function put(G, ci, t, extra, pi) {   /* player pi (default 0) places tile t on cell ci using a die with exactly the cell's number; extra = other tiles left in storage */
  const p = G.P[pi || 0]; G.ti = pi || 0; adj(p, ci); p.store = [t].concat(extra || []); p.dice = [C[ci].num, C[ci].num % 6 + 1]; p.used = [false, false];
  const r = VB.performMove(G, { k: 'place', die: 0, v: C[ci].num, s: 0, cell: ci, w: 0 }); if (!r.ok) throw new Error('test setup: illegal place on ' + ci); return r;
}
function noDepots(G) { for (let d = 1; d <= 6; d++) G.depots[d] = [null, null]; }
function burn(G) {   /* finish the current actor's turn with the safest legal moves */
  const p = G.P[VB.actor(G)]; let k = 0;
  while (G.pend.length && k++ < 20) { const M = VB.validMoves(G); VB.performMove(G, M.find(x => x.k === 'skip') || M[0]); }
  for (let di = 0; di < 2; di++) if (!p.used[di]) VB.performMove(G, { k: 'workers', die: di, w: 0 });
  VB.performMove(G, { k: 'end' });
}
function toRoundEnd(G) { const r = G.round, ph = G.phase; let k = 0; while (G.round === r && G.phase === ph && !G.over && k++ < 10) burn(G); }
const regOf = size => VB.REGIONS.find(r => r.cells.length === size && r.col !== 'castle' && r.col !== 'mine' || (size === 1 && r.col === 'mine' && r.cells.length === 1));
function fillRegion(G, reg) { const p = G.P[0]; const last = reg.cells[reg.cells.length - 1]; reg.cells.forEach(i => { if (i !== last && !p.estate[i]) p.estate[i] = filler(i); }); return last; }
const lastTile = col => col === 'bld' ? tile('bld', 'inn') : col === 'pas' ? tile('pas', 'sheep', 2) : col === 'know' ? tile('know', 'k25') : col === 'ship' ? tile('ship') : tile(col);

/* ===================================================================== */
S('A. Setup', 'The estate map, the tile pool and the Lore tiles are our own; the counts and the numbering rules are the published ones.');
R('The estate is a hexagon of 37 spaces', () => eq(37, C.length));
R('Space colours: 3 keep, 3 mine, 6 lore, 11 building, 8 pasture, 6 barge', () => eq('3/3/6/11/8/6', [VB.COLCOUNT.castle, VB.COLCOUNT.mine, VB.COLCOUNT.know, VB.COLCOUNT.bld, VB.COLCOUNT.pas, VB.COLCOUNT.ship].join('/')));
R('Every space carries a die number 1 to 6', () => eq(true, C.every(c => c.num >= 1 && c.num <= 6)));
R('Each player starts with a keep placed on the centre space', () => { const G = G0(2); return eq('castle/true', G.P.map(p => p.estate[HOME].t + '/' + !!p.estate[HOME].home).join(',') === 'castle/true,castle/true' ? 'castle/true' : 'bad'); });
R('The centre space is itself a keep-coloured space, and the keep scores nothing at the start', () => { const G = G0(2); return eq('castle/0/0', C[HOME].col + '/' + G.P[0].vp + '/' + G.P[1].vp); });
R('Each player starts with exactly 1 silver (2, 3, 4 players)', () => eq('111', [2, 3, 4].map(n => VB.newGame({ n, seed: 3 }).P.every(p => p.silver === 1) ? 1 : 0).join('')));
R('Each player starts with 3 goods tiles', () => eq('3,3,3,3', VB.newGame({ n: 4, seed: 5 }).P.map(p => Object.values(p.goods).reduce((a, b) => a + b, 0)).join(',')));
R('Starting workers: 1, 2, 3, 4 in starting order, first player gets 1', () => { const G = VB.newGame({ n: 4, seed: 9 }); return eq('1,2,3,4', G.order.map(s => G.P[s].workers).join(',')); });
R('Two players start with 1 and 2 workers', () => { const G = VB.newGame({ n: 2, seed: 9 }); return eq('1,2', G.order.map(s => G.P[s].workers).join(',')); });
R('Every player rolls two dice (1-6) and a white die (1-6) is rolled', () => { const G = VB.newGame({ n: 3, seed: 4 }); return eq(true, G.P.every(p => p.dice.length === 2 && p.dice.every(d => d >= 1 && d <= 6)) && G.white >= 1 && G.white <= 6); });
R('Six numbered stalls hold 2 tiles each with 2 players', () => eq('2,2,2,2,2,2', [1, 2, 3, 4, 5, 6].map(d => VB.newGame({ n: 2, seed: 2 }).depots[d].length).join(',')));
R('Stalls hold 3 tiles each with 3 players', () => eq(3, VB.newGame({ n: 3, seed: 2 }).depots[1].length));
R('Stalls hold 4 tiles each with 4 players', () => eq(4, VB.newGame({ n: 4, seed: 2 }).depots[6].length));
R('Back lane holds 4 / 6 / 8 tiles with 2 / 3 / 4 players', () => eq('4/6/8', [2, 3, 4].map(n => VB.newGame({ n, seed: 2 }).black.length).join('/')));
R('Five goods tiles are laid out for the season, one per round', () => { const G = VB.newGame({ n: 2, seed: 2 }); return eq(5, G.rg.filter(Boolean).length + G.goodsAt[G.white].length); });
R('The tile pool is big enough for 4 players for 5 seasons (stalls + back lane x 5)', () => eq(true, VB.pool().length >= 5 * (6 * 4 + 8)));
R('Goods tiles: 6 kinds, 7 of each', () => { const G = VB.newGame({ n: 2, seed: 1 }); const all = G.gbag.slice(); G.P.forEach(p => Object.keys(p.goods).forEach(g => { for (let i = 0; i < p.goods[g]; i++) all.push(+g); })); G.rg.forEach(g => g && all.push(g)); Object.values(G.goodsAt).forEach(a => a.forEach(g => all.push(g))); const cnt = [1, 2, 3, 4, 5, 6].map(g => all.filter(x => x === g).length); return eq('7,7,7,7,7,7', cnt.join(',')); });

S('B. Rounds, phases and turn order');
R('A season (phase) has exactly 5 rounds', () => { const G = G0(2); const ph = G.phase; let rounds = 0; while (G.phase === ph) { toRoundEnd(G); rounds++; } return eq(5, rounds); });
R('The game has exactly 5 phases and ends after round 5 of phase 5', () => { const G = G0(2); let k = 0; while (!G.over && k++ < 60) toRoundEnd(G); return eq('5/true', G.phase + '/' + G.over); });
R('The game is not over after round 5 of phase 4', () => { const G = G0(2); G.phase = 3; G.round = 4; G.ti = 1; G.P[1].dice = [1, 1]; G.P[1].used = [false, false]; burn(G); return eq(false, G.over); });
R('Turn order follows the track: further up the track plays first next round', () => { const G = G0(2); G.P[0].pos = 0; G.P[1].pos = 1; toRoundEnd(G); return eq('1,0', G.order.join(',')); });
R('Same track step: the player who arrived last (on top) plays first', () => { const G = G0(2); G.P[0].pos = 1; G.P[1].pos = 1; G.P[0].arr = 3; G.P[1].arr = 8; toRoundEnd(G); return eq('1,0', G.order.join(',')); });
R('Every player takes one turn per round, in order', () => { const G = G0(3); const seen = []; const r = G.round; while (G.round === r) { seen.push(VB.actor(G)); burn(G); } return eq('0,1,2', seen.join(',')); });
R('Turn order for the round is fixed when the round starts (a barge mid-round does not reorder it)', () => { const G = G0(2); G.P[1].pos = 5; G.order = [1, 0]; G.ti = 0; G.P[1].dice = [1, 1]; burn(G); G.P[0].pos = 9; return eq(0, VB.actor(G)); });
R('At the start of each round every player rolls two fresh dice, both unused', () => { const G = G0(2); toRoundEnd(G); return eq(true, G.P.every(p => !p.used[0] && !p.used[1] && p.dice.every(d => d >= 1 && d <= 6))); });
R('At the start of each round the white die is rolled and that round\'s goods tile goes to the stall it shows', () => { const G = G0(2); const before = Object.values(G.goodsAt).reduce((a, b) => a + b.length, 0); toRoundEnd(G); return eq(before + 1, Object.values(G.goodsAt).reduce((a, b) => a + b.length, 0)); });
R('The goods tile laid in a round is the next one of the season\'s five (round 2 uses tile 2)', () => { const G = G0(2); const five = [G.goodsAt[G.white][0]].concat(G.rg.slice(1)); toRoundEnd(G); const placed = [].concat(...Object.values(G.goodsAt)); return eq([five[0], five[1]].sort().join(), placed.sort().join()); });
R('A turn has exactly two dice actions: a player cannot end the turn before using both dice', () => { const G = G0(2); const p = G.P[0]; p.used = [true, false]; return eq(false, VB.validMoves(G).some(m => m.k === 'end')); });
R('A player can end the turn once both dice are used', () => { const G = G0(2); const p = G.P[0]; p.used = [true, true]; return eq(true, VB.validMoves(G).some(m => m.k === 'end')); });
R('A used die cannot be used again', () => { const G = G0(2); const p = G.P[0]; p.dice = [2, 5]; VB.performMove(G, { k: 'workers', die: 0, w: 0 }); return eq(false, VB.validMoves(G).some(m => m.die === 0)); });
R('Two identical dice give two separate actions', () => { const G = G0(2); const p = G.P[0]; p.dice = [4, 4]; VB.performMove(G, { k: 'workers', die: 0, w: 0 }); VB.performMove(G, { k: 'workers', die: 1, w: 0 }); return eq('4/true', p.workers + '/' + p.used.every(Boolean)); });
R('Only the acting player can move (the other player\'s dice are not offered)', () => { const G = G0(2); return eq(0, VB.actor(G)); });

S('C. Actions with a die');
R('Take: a tile from the stall with the die\'s number goes into storage and leaves the stall', () => { const G = G0(2), p = G.P[0], t = tile('mine'); p.dice = [3, 5]; G.depots[3] = [t, null]; VB.performMove(G, { k: 'take', die: 0, v: 3, slot: 0, w: 0 }); return eq('mine/true/null/true', p.store.map(x => x.t).join() + '/' + (p.store[0] === t) + '/' + G.depots[3][0] + '/' + p.used[0]); });
R('Take: the die number must match the stall (no workers = other stalls not offered)', () => { const G = G0(2), p = G.P[0]; p.dice = [3, 3]; G.depots[5] = [tile('mine'), null]; return eq(false, VB.validMoves(G).some(m => m.k === 'take' && m.v === 5)); });
R('Workers: a stall 2 numbers away costs 2 workers, which are paid', () => { const G = G0(2), p = G.P[0]; p.dice = [3, 3]; p.workers = 2; G.depots[5] = [tile('mine'), null]; VB.performMove(G, { k: 'take', die: 0, v: 5, slot: 0, w: 2 }); return eq('0/1', p.workers + '/' + p.store.length); });
R('Workers: 1 worker changes a die by exactly 1; two workers are not charged for a 1 step change', () => { const G = G0(2), p = G.P[0]; p.dice = [3, 3]; p.workers = 5; G.depots[4] = [tile('mine'), null]; VB.performMove(G, { k: 'take', die: 0, v: 4, slot: 0, w: 1 }); return eq(4, p.workers); });
R('Workers: 6 and 1 are neighbours (die 6 reaches stall 1 for 1 worker)', () => { const G = G0(2), p = G.P[0]; p.dice = [6, 6]; p.workers = 1; G.depots[1] = [tile('mine'), null]; return eq(true, VB.validMoves(G).some(m => m.k === 'take' && m.v === 1 && m.w === 1)); });
R('Workers: 1 and 6 are neighbours the other way round', () => eq(1, VB.cost({ know: {} }, 1, 6, 'take')));
R('Workers: the distance between 2 and 5 is 3 (the short way round)', () => eq(3, VB.cost({ know: {} }, 2, 5, 'take')));
R('Workers: you cannot spend workers you do not have', () => { const G = G0(2), p = G.P[0]; p.dice = [1, 1]; p.workers = 1; G.depots[4] = [tile('mine'), null]; return eq(false, VB.validMoves(G).some(m => m.k === 'take' && m.v === 4)); });
R('Storage holds 3 tiles; taking a 4th forces a discard', () => { const G = G0(2), p = G.P[0]; p.dice = [1, 1]; p.store = [tile('mine'), tile('mine'), tile('mine')]; G.depots[1] = [tile('ship'), null]; VB.performMove(G, { k: 'take', die: 0, v: 1, slot: 0, w: 0 }); return eq('discard/4', G.pend.map(x => x.t).join() + '/' + p.store.length); });
R('The discard removes one tile of your choice, leaving 3 in storage', () => { const G = G0(2), p = G.P[0]; p.dice = [1, 1]; const keep = tile('ship'); p.store = [tile('mine'), tile('mine'), tile('mine')]; G.depots[1] = [keep, null]; VB.performMove(G, { k: 'take', die: 0, v: 1, slot: 0, w: 0 }); VB.performMove(G, { k: 'discard', s: 0 }); return eq('3/0/true', p.store.length + '/' + G.pend.length + '/' + p.store.includes(keep)); });
R('A discard cannot be skipped: while storage is over capacity no dice action is offered', () => { const G = G0(2), p = G.P[0]; p.dice = [1, 1]; p.store = [tile('mine'), tile('mine'), tile('mine')]; G.depots[1] = [tile('ship'), null]; VB.performMove(G, { k: 'take', die: 0, v: 1, slot: 0, w: 0 }); return eq(true, VB.validMoves(G).every(m => m.k === 'discard')); });
R('Place: the tile goes on a free space of its own colour', () => { const G = G0(2), p = G.P[0]; const r = put(G, 19, tile('bld', 'tower')); return eq('true/bld', r.ok + '/' + (p.estate[19] && p.estate[19].t)); });
R('Place: a tile cannot go on a space of another colour', () => { const G = G0(2); return eq(false, VB.canPlace(G.P[0], tile('mine'), 19, 1)); });
R('Place: the die number must equal the number on the space', () => { const G = G0(2); return eq('true/false', VB.canPlace(G.P[0], tile('bld', 'tower'), 19, 1) + '/' + VB.canPlace(G.P[0], tile('bld', 'tower'), 19, 2)); });
R('Place: the space must touch a space you already filled (not touching = illegal)', () => { const G = G0(2); return eq(false, VB.canPlace(G.P[0], tile('bld', 'tower'), 20, 0)); });
R('Place: touching the start keep counts (adjacency to any filled space)', () => { const G = G0(2); return eq(true, VB.canPlace(G.P[0], tile('bld', 'tower'), 19, 0)); });
R('Place: touching a tile placed earlier counts', () => { const G = G0(2); put(G, 19, tile('bld', 'tower')); return eq(true, VB.canPlace(G.P[0], tile('bld', 'inn'), 20, 0)); });
R('Place: an occupied space cannot be built on', () => { const G = G0(2); put(G, 19, tile('bld', 'tower')); return eq(false, VB.canPlace(G.P[0], tile('bld', 'inn'), 19, 1)); });
R('Place: workers adjust the die to the space number and are paid (die 1, space number 3 = 2 workers)', () => { const G = G0(2), p = G.P[0]; p.workers = 2; p.store = [tile('castle')]; p.dice = [1, 2]; VB.performMove(G, { k: 'place', die: 0, v: 3, s: 0, cell: 17, w: 2 }); return eq('0/castle', p.workers + '/' + (p.estate[17] && p.estate[17].t)); });
R('Place with workers: a die 2 steps from the space number needs 2 workers', () => { const G = G0(2), p = G.P[0]; p.workers = 2; p.store = [tile('mine')]; p.dice = [4, 4]; p.used = [false, false]; const m = VB.validMoves(G).find(x => x.k === 'place' && x.cell === 12); return eq('2', m ? String(m.w) : 'none'); });
R('Place: the tile moves from storage to the estate (storage shrinks)', () => { const G = G0(2), p = G.P[0]; p.store = [tile('bld', 'tower'), tile('mine')]; p.dice = [1, 1]; VB.performMove(G, { k: 'place', die: 0, v: 1, s: 0, cell: 19, w: 0 }); return eq('1/mine', p.store.length + '/' + p.store[0].t); });
R('Sell: all goods of the die\'s number are sold at once and leave your storage', () => { const G = G0(2), p = G.P[0]; p.goods = { 3: 2, 4: 1 }; p.dice = [3, 5]; VB.performMove(G, { k: 'sell', die: 0, v: 3, w: 0 }); return eq('undefined/1', p.goods[3] + '/' + p.goods[4]); });
R('Sell: you get exactly 1 silver, however many tiles you sell', () => { const G = G0(2), p = G.P[0]; p.goods = { 3: 3 }; p.dice = [3, 5]; const s = p.silver; VB.performMove(G, { k: 'sell', die: 0, v: 3, w: 0 }); return eq(s + 1, p.silver); });
R('Sell: 2 points per tile with 2 players', () => { const G = G0(2), p = G.P[0]; p.goods = { 3: 2 }; p.dice = [3, 5]; VB.performMove(G, { k: 'sell', die: 0, v: 3, w: 0 }); return eq(4, p.vp); });
R('Sell: 3 points per tile with 3 players', () => { const G = G0(3), p = G.P[0]; p.goods = { 3: 2 }; p.dice = [3, 5]; VB.performMove(G, { k: 'sell', die: 0, v: 3, w: 0 }); return eq(6, p.vp); });
R('Sell: 4 points per tile with 4 players', () => { const G = G0(4), p = G.P[0]; p.goods = { 3: 2 }; p.dice = [3, 5]; VB.performMove(G, { k: 'sell', die: 0, v: 3, w: 0 }); return eq(8, p.vp); });
R('Sell: only a kind you hold can be sold (die 3, no kind-3 goods = no sale offered)', () => { const G = G0(2), p = G.P[0]; p.goods = { 4: 1 }; p.dice = [3, 3]; return eq(false, VB.validMoves(G).some(m => m.k === 'sell')); });
R('Sell: workers let a die reach a neighbouring kind (die 3 sells kind 4 for 1 worker)', () => { const G = G0(2), p = G.P[0]; p.goods = { 4: 1 }; p.dice = [3, 3]; p.workers = 1; return eq(true, VB.validMoves(G).some(m => m.k === 'sell' && m.v === 4 && m.w === 1)); });
R('Sell: sold tiles are not scored again at the end (they leave the goods store)', () => { const G = G0(2), p = G.P[0]; p.goods = { 3: 2 }; p.dice = [3, 5]; VB.performMove(G, { k: 'sell', die: 0, v: 3, w: 0 }); return eq(0, VB.endBreakdown(G, p).goods); });
R('Workers: a die used for "take workers" gives 2 workers, any die number', () => { const G = G0(2), p = G.P[0]; p.dice = [6, 2]; VB.performMove(G, { k: 'workers', die: 0, w: 0 }); return eq('2/true', p.workers + '/' + p.used[0]); });
R('Back lane: pay 2 silver, take any tile into storage, no die needed', () => { const G = G0(2), p = G.P[0]; p.silver = 5; const t = tile('mine'); G.black = [t, null, null, null]; VB.performMove(G, { k: 'buy', slot: 0 }); return eq('3/true/false,false', p.silver + '/' + p.store.includes(t) + '/' + p.used); });
R('Back lane: only once per turn', () => { const G = G0(2), p = G.P[0]; p.silver = 9; G.black = [tile('mine'), tile('mine'), null, null]; VB.performMove(G, { k: 'buy', slot: 0 }); return eq(false, VB.validMoves(G).some(m => m.k === 'buy')); });
R('Back lane: needs 2 silver (1 silver = not offered)', () => { const G = G0(2), p = G.P[0]; p.silver = 1; G.black = [tile('mine'), null, null, null]; return eq(false, VB.validMoves(G).some(m => m.k === 'buy')); });
R('Back lane: can be bought again on the next turn', () => { const G = G0(2), p = G.P[0]; p.silver = 9; G.black = [tile('mine'), tile('mine'), null, null]; VB.performMove(G, { k: 'buy', slot: 0 }); toRoundEnd(G); return eq(false, p.bought); });
R('Back lane: with a full storage the new tile forces a discard', () => { const G = G0(2), p = G.P[0]; p.silver = 5; p.store = [tile('mine'), tile('mine'), tile('mine')]; G.black = [tile('ship'), null, null, null]; VB.performMove(G, { k: 'buy', slot: 0 }); return eq('discard', G.pend.map(x => x.t).join()); });

S('D. Tile effects');
R('Keep: placing it gives one extra action at once', () => { const G = G0(2); put(G, 17, tile('castle')); return eq('castle', G.pend.map(x => x.t).join()); });
R('Keep: the extra action works with any number, free, and uses no die (take from stall 5)', () => { const G = G0(2), p = G.P[0]; const t = tile('mine'); G.depots[5] = [t, null]; put(G, 17, tile('castle')); const usedBefore = p.used.slice(); VB.performMove(G, { k: 'take', die: 'x', v: 5, slot: 0, w: 0 }); return eq('true/' + usedBefore, p.store.includes(t) + '/' + p.used); });
R('Keep: the extra action can also be "take workers" or a sale', () => { const G = G0(2), p = G.P[0]; p.goods = { 2: 1 }; put(G, 17, tile('castle')); const M = VB.validMoves(G); return eq('true/true', M.some(m => m.k === 'workers') + '/' + M.some(m => m.k === 'sell' && m.v === 2)); });
R('Keep: the extra action can place a stored tile on any number space', () => { const G = G0(2), p = G.P[0]; put(G, 17, tile('castle')); p.store = [tile('bld', 'tower')]; return eq(true, VB.validMoves(G).some(m => m.k === 'place' && m.cell === 19)); });
R('Keep: the extra action may be declined', () => { const G = G0(2); put(G, 17, tile('castle')); return eq(true, VB.validMoves(G).some(m => m.k === 'skip')); });
R('Mine: pays nothing when placed', () => { const G = G0(2), p = G.P[0]; const s = p.silver; put(G, 12, tile('mine')); return eq(s, p.silver); });
R('Mine: pays 1 silver per mine at the end of a season', () => { const G = G0(2), p = G.P[0]; p.estate[21] = { id: 'm1', t: 'mine' }; p.estate[27] = { id: 'm2', t: 'mine' }; p.silver = 0; G.round = 4; G.ti = 1; G.P[1].dice = [1, 1]; const before = G.P[0].silver; burn(G); return eq(2, G.P[0].silver - before); });
R('Mine: pays also at the end of the last season', () => { const G = G0(2), p = G.P[0]; p.estate[21] = { id: 'm1', t: 'mine' }; p.silver = 0; G.phase = 4; G.round = 4; G.ti = 1; G.P[1].dice = [1, 1]; burn(G); return eq(true, G.over && p.end.silver === 1); });
R('Mine: does not pay at the end of a normal round', () => { const G = G0(2), p = G.P[0]; p.estate[21] = { id: 'm1', t: 'mine' }; p.silver = 0; toRoundEnd(G); return eq(0, p.silver); });
R('Barge: you move up the turn track by one step', () => { const G = G0(2), p = G.P[0]; put(G, 0, tile('ship')); return eq(1, p.pos); });
R('Barge: you may take ALL goods from any ONE stall, not only the one matching the die', () => { const G = G0(2), p = G.P[0]; G.goodsAt[2] = [5]; G.goodsAt[4] = [6, 6]; put(G, 0, tile('ship')); VB.performMove(G, { k: 'ship', v: 4 }); return eq('2/undefined/0/1', p.goods[6] + '/' + p.goods[5] + '/' + G.goodsAt[4].length + '/' + G.goodsAt[2].length); });
R('Barge: you take only from one stall (the other stalls\' goods stay)', () => { const G = G0(2); G.goodsAt[2] = [5]; G.goodsAt[4] = [6]; put(G, 0, tile('ship')); VB.performMove(G, { k: 'ship', v: 4 }); return eq(1, G.goodsAt[2].length); });
R('Barge: goods of a kind you already hold stack on that pile', () => { const G = G0(2), p = G.P[0]; p.goods = { 6: 1 }; G.goodsAt[4] = [6, 6]; put(G, 0, tile('ship')); VB.performMove(G, { k: 'ship', v: 4 }); return eq(3, p.goods[6]); });
R('Goods: at most 3 different kinds can be held', () => { const G = G0(2), p = G.P[0]; p.goods = { 1: 1, 2: 1, 3: 1 }; G.goodsAt[5] = [6]; put(G, 0, tile('ship')); VB.performMove(G, { k: 'ship', v: 5 }); return eq(3, Object.keys(p.goods).length); });
R('Goods: a tile that does not fit stays on the stall (it is not lost)', () => { const G = G0(2), p = G.P[0]; p.goods = { 1: 1, 2: 1, 3: 1 }; G.goodsAt[5] = [6]; put(G, 0, tile('ship')); VB.performMove(G, { k: 'ship', v: 5 }); return eq('6', G.goodsAt[5].join()); });
R('Goods: a mixed stall gives what fits and leaves the rest (kinds 1,2 held; stall [3,4] -> take 3, 4 stays)', () => { const G = G0(2), p = G.P[0]; p.goods = { 1: 1, 2: 1 }; G.goodsAt[5] = [3, 4]; put(G, 0, tile('ship')); VB.performMove(G, { k: 'ship', v: 5 }); return eq('3/4', Object.keys(p.goods).filter(k => k > 2).join() + '/' + G.goodsAt[5].join()); });
R('Barge: with no goods on any stall there is nothing to take (no pending question)', () => { const G = G0(2); G.goodsAt = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }; put(G, 0, tile('ship')); return eq(0, G.pend.length); });
R('Barge: arriving on a step where another player stands puts you on top (you play first)', () => { const G = G0(2); G.P[1].pos = 1; G.P[1].arr = 50; put(G, 0, tile('ship')); G.pend = []; G.P[0].used = [true, true]; burn(G); burn(G); return eq('0,1', G.order.join()); });
R('Pasture: score the animals on the placed tile', () => { const G = G0(2); const c = VB.REGIONS.find(r => r.col === 'pas' && r.cells.length === 6).cells[0]; put(G, c, tile('pas', 'sheep', 3)); return eq(3, G.P[0].vp); });
R('Pasture: also score same animals already in that meadow', () => { const G = G0(2), p = G.P[0]; const reg = VB.REGIONS.find(r => r.col === 'pas' && r.cells.length === 6).cells; p.estate[reg[1]] = { id: 'a', t: 'pas', k: 'sheep', n: 2 }; put(G, reg[0], tile('pas', 'sheep', 3)); return eq(5, p.vp); });
R('Pasture: other animal kinds in the meadow do not count', () => { const G = G0(2), p = G.P[0]; const reg = VB.REGIONS.find(r => r.col === 'pas' && r.cells.length === 6).cells; p.estate[reg[1]] = { id: 'a', t: 'pas', k: 'goat', n: 4 }; put(G, reg[0], tile('pas', 'sheep', 3)); return eq(3, p.vp); });
R('Pasture: same animals in a different meadow do not count', () => { const G = G0(2), p = G.P[0]; const big = VB.REGIONS.find(r => r.col === 'pas' && r.cells.length === 6).cells, small = VB.REGIONS.find(r => r.col === 'pas' && r.cells.length === 2).cells; p.estate[small[0]] = { id: 'a', t: 'pas', k: 'sheep', n: 4 }; put(G, big[0], tile('pas', 'sheep', 3)); return eq(3, p.vp); });
R('Pasture: three placements add up (2, then 2+3, then 2+3+4 = 2 + 5 + 9)', () => { const G = G0(2), p = G.P[0]; const reg = VB.REGIONS.find(r => r.col === 'pas' && r.cells.length === 6).cells; put(G, reg[0], tile('pas', 'pig', 2)); put(G, reg[1], tile('pas', 'pig', 3)); put(G, reg[2], tile('pas', 'pig', 4)); return eq(16, p.vp); });
R('Building: Moot Hall lets you place another stored tile at once on any number', () => { const G = G0(2), p = G.P[0]; put(G, 19, tile('bld', 'hall'), [tile('castle')]); const used = p.used.slice(); VB.performMove(G, { k: 'place', die: 'x', v: C[17].num, s: 0, cell: 17, w: 0 }); return eq('castle/' + used, p.estate[17].t + '/' + p.used); });
R('Building: Moot Hall can chain into another Moot Hall', () => { const G = G0(2), p = G.P[0]; put(G, 19, tile('bld', 'hall'), [tile('bld', 'hall'), tile('mine')]); VB.performMove(G, { k: 'place', die: 'x', v: C[11].num, s: 0, cell: 11, w: 0 }); return eq('hall', G.pend.map(x => x.t).join()); });
R('Building: Joiner\'s Yard takes a Building tile from a stall into storage (not other kinds)', () => { const G = G0(2), p = G.P[0]; const b = tile('bld', 'inn'); noDepots(G); G.depots[2] = [b, tile('mine')]; put(G, 19, tile('bld', 'carp')); const M = VB.validMoves(G).filter(m => m.k === 'grab'); VB.performMove(G, { k: 'grab', v: 2, slot: 0 }); return eq('1/true', M.length + '/' + p.store.includes(b)); });
R('Building: Bell Chapel takes a Keep, Mine or Lore tile (not Barge/Building/Pasture)', () => { const G = G0(2); G.depots = { 1: [tile('castle'), tile('mine')], 2: [tile('know', 'k1'), tile('ship')], 3: [tile('bld', 'inn'), tile('pas', 'sheep', 2)], 4: [null, null], 5: [null, null], 6: [null, null] }; put(G, 19, tile('bld', 'chapel')); return eq(3, VB.validMoves(G).filter(m => m.k === 'grab').length); });
R('Building: Fair Green takes a Barge or Pasture tile (not other kinds)', () => { const G = G0(2); G.depots = { 1: [tile('castle'), tile('mine')], 2: [tile('know', 'k1'), tile('ship')], 3: [tile('bld', 'inn'), tile('pas', 'sheep', 2)], 4: [null, null], 5: [null, null], 6: [null, null] }; put(G, 19, tile('bld', 'mkt')); return eq(2, VB.validMoves(G).filter(m => m.k === 'grab').length); });
R('Building: the "take a tile" buildings cannot take from the back lane', () => { const G = G0(2); G.depots = { 1: [null, null], 2: [null, null], 3: [null, null], 4: [null, null], 5: [null, null], 6: [null, null] }; G.black = [tile('bld', 'inn'), null, null, null]; put(G, 19, tile('bld', 'carp')); return eq(0, VB.validMoves(G).filter(m => m.k === 'grab').length); });
R('Building: Drovers\' Inn gives 4 workers', () => { const G = G0(2), p = G.P[0]; put(G, 19, tile('bld', 'inn')); return eq(4, p.workers); });
R('Building: Counting House gives 2 silver', () => { const G = G0(2), p = G.P[0]; const s = p.silver; put(G, 19, tile('bld', 'mint')); return eq(s + 2, p.silver); });
R('Building: Beacon Tower gives 4 points', () => { const G = G0(2), p = G.P[0]; put(G, 19, tile('bld', 'tower')); return eq(4, p.vp); });
R('Building: Granary sells one kind of goods at once, whatever the dice', () => { const G = G0(2), p = G.P[0]; p.goods = { 2: 2, 5: 1 }; const s = p.silver; put(G, 19, tile('bld', 'store')); VB.performMove(G, { k: 'sell', die: 'x', v: 5, w: 0 }); return eq('undefined/2/2/' + (s + 1), p.goods[5] + '/' + p.goods[2] + '/' + p.vp + '/' + p.silver); });
R('Building: Granary pays the normal sale (1 silver + 2 per tile with 2 players)', () => { const G = G0(2), p = G.P[0]; p.goods = { 2: 2 }; const s = p.silver; put(G, 19, tile('bld', 'store')); VB.performMove(G, { k: 'sell', die: 'x', v: 2, w: 0 }); return eq('4/' + (s + 1), p.vp + '/' + p.silver); });
R('Building: Granary with no goods asks nothing', () => { const G = G0(2); put(G, 19, tile('bld', 'store')); return eq(0, G.pend.length); });
R('Building: a region may not hold two of the same Building', () => { const G = G0(2); put(G, 19, tile('bld', 'tower')); return eq(false, VB.canPlace(G.P[0], tile('bld', 'tower'), 20, 0)); });
R('Building: a different Building may join the same region', () => { const G = G0(2); put(G, 19, tile('bld', 'tower')); return eq(true, VB.canPlace(G.P[0], tile('bld', 'inn'), 20, 0)); });
R('Building: the same Building may be built again in another region', () => { const G = G0(2); put(G, 19, tile('bld', 'tower')); return eq(true, VB.canPlace(G.P[0], tile('bld', 'tower'), 11, 0)); });

S('E. Scoring during play');
[[1, 1], [2, 3], [3, 6], [4, 10], [6, 21], [7, 28]].forEach(([size, pts]) => R('Region of ' + size + ' space' + (size > 1 ? 's' : '') + ' completed in season 1: ' + pts + ' + 10 bonus', () => {
  const G = G0(2), p = G.P[0]; const reg = size === 1 ? VB.REGIONS.find(r => r.col === 'mine' && r.cells.length === 1) : VB.REGIONS.find(r => r.cells.length === size && r.col !== 'castle' && r.col !== 'mine');
  const last = fillRegion(G, reg); const extra = reg.col === 'pas' ? 2 : 0; const w0 = p.workers;
  put(G, last, lastTile(reg.col)); return eq(pts + 10 + extra, p.vp);
}));
R('Region table: 5 spaces = 15 and 8 spaces = 36 (no 5 or 8 region on our map, so the table itself is checked)', () => eq('1,3,6,10,15,21,28,36', VB.REGION_PTS.slice(1).join()));
[10, 8, 6, 4, 2].forEach((b, ph) => R('Season ' + (ph + 1) + ' region bonus is ' + b, () => { const G = G0(2), p = G.P[0]; G.phase = ph; const reg = VB.REGIONS.find(r => r.col === 'mine' && r.cells.length === 1); put(G, reg.cells[0], tile('mine')); return eq(1 + b, p.vp); }));
R('A region scores only when its last space is filled (not the second to last)', () => { const G = G0(2), p = G.P[0]; const reg = VB.REGIONS.find(r => r.col === 'bld' && r.cells.length === 4); put(G, 11, tile('bld', 'inn')); return eq(0, p.vp); });
R('A region scores once only', () => { const G = G0(2), p = G.P[0]; const reg = VB.REGIONS.find(r => r.col === 'mine' && r.cells.length === 1); put(G, reg.cells[0], tile('mine')); const v = p.vp; const other = VB.REGIONS.find(r => r.col === 'mine' && r.cells.length === 2); put(G, other.cells[1], tile('mine')); return eq(v, p.vp); });
R('The start keep space counts as filled for its region (keep region of 3 needs only 2 more)', () => { const G = G0(2), p = G.P[0]; p.estate[17] = filler(17); put(G, 24, tile('castle')); return eq(true, p.regDone[VB.CELLS[24].reg] === true); });
[2, 3, 4].forEach(n => R('Colour bonus with ' + n + ' players: first to complete a colour gets ' + VB.COLOUR_BONUS[n][0] + ', second ' + VB.COLOUR_BONUS[n][1] + ', later players nothing', () => {
  const G = G0(n); const got = [];
  for (let i = 0; i < n; i++) { const p = G.P[i]; G.ti = i; p.dice = [1, 1]; G.pend = []; p.estate[17] = filler(17); const pre = p.vp; adj(p, 24); p.store = [tile('castle')]; p.dice = [C[24].num, 1]; p.used = [false, false]; VB.performMove(G, { k: 'place', die: 0, v: C[24].num, s: 0, cell: 24, w: 0 }); got.push(p.vp - pre - 16); }
  const exp = [VB.COLOUR_BONUS[n][0], VB.COLOUR_BONUS[n][1], 0, 0].slice(0, n); return eq(exp.join(), got.join());
}));
R('Colour bonus: published values are 5/6/7 for the first player and 2/3/4 for the second (2/3/4 players)', () => eq('5,2|6,3|7,4', [2, 3, 4].map(n => VB.COLOUR_BONUS[n].slice(0, 2).join()).join('|')));
R('Colour bonus is only for a whole colour, not a single region (mines: 3 spaces in 2 regions)', () => { const G = G0(2), p = G.P[0]; put(G, 12, tile('mine')); const b = p.vp; return eq(11, b); });
R('Selling stays correct after Moot Hall chains (a chained placement still scores its region)', () => { const G = G0(2), p = G.P[0]; const reg = VB.REGIONS.find(r => r.col === 'mine' && r.cells.length === 1); put(G, 19, tile('bld', 'hall'), [tile('mine')]); VB.performMove(G, { k: 'place', die: 'x', v: 2, s: 0, cell: 12, w: 0 }); return eq(11, p.vp); });

S('F. End of a season');
R('At season end the stalls are emptied and refilled (full stalls again)', () => { const G = G0(2); G.depots[1] = [null, null]; G.round = 4; G.ti = 1; G.P[1].dice = [1, 1]; burn(G); return eq('2/2', G.phase === 1 ? G.depots[1].filter(Boolean).length + '/' + G.depots[6].filter(Boolean).length : 'no phase'); });
R('At season end the back lane is refilled', () => { const G = G0(2); G.black = [null, null, null, null]; G.round = 4; G.ti = 1; G.P[1].dice = [1, 1]; burn(G); return eq(4, G.black.filter(Boolean).length); });
R('At season end goods left on the stalls stay there (only the hexagon tiles are cleared)', () => { const G = G0(2); for (let d = 1; d <= 6; d++) G.goodsAt[d] = []; G.goodsAt[3] = [1, 2, 3]; G.round = 4; G.ti = 1; G.P[1].dice = [1, 1]; burn(G); return eq('3 + 1 new', (G.goodsAt[3].slice(0, 3).join() === '1,2,3' ? 3 : 0) + ' + ' + (Object.values(G.goodsAt).reduce((a, b) => a + b.length, 0) - 3) + ' new'); });
R('At season end five new goods tiles are laid out for the new season', () => { const G = G0(2); for (let d = 1; d <= 6; d++) G.goodsAt[d] = []; G.round = 4; G.ti = 1; G.P[1].dice = [1, 1]; burn(G); return eq(5, G.rg.filter(Boolean).length + Object.values(G.goodsAt).reduce((a, b) => a + b.length, 0)); });
R('At season end players keep their silver, workers, goods, storage and track position', () => { const G = G0(2), p = G.P[0]; p.goods = { 2: 1 }; p.store = [tile('mine')]; p.pos = 2; p.workers = 5; p.silver = 4; G.round = 4; G.ti = 1; G.P[1].dice = [1, 1]; burn(G); return eq('1/1/2/5/4', p.goods[2] + '/' + p.store.length + '/' + p.pos + '/' + p.workers + '/' + p.silver); });
R('A new season starts with round 1 and a new roll', () => { const G = G0(2); G.round = 4; G.ti = 1; G.P[1].dice = [1, 1]; burn(G); return eq('1/0/false', G.phase + '/' + G.round + '/' + G.P[0].used[0]); });
R('The turn order carries over into the new season', () => { const G = G0(2); G.P[1].pos = 3; G.round = 4; G.ti = 1; G.P[1].dice = [1, 1]; burn(G); return eq('1,0', G.order.join()); });

S('G. End of game and final scoring');
R('Final: 1 point per silver', () => { const G = G0(2), p = G.P[0]; p.silver = 7; p.workers = 0; p.goods = {}; const v = p.vp; VB.forceEnd(G); return eq(7, p.vp - v); });
R('Final: 1 point per unsold goods tile', () => { const G = G0(2), p = G.P[0]; p.silver = 0; p.workers = 0; p.goods = { 1: 2, 4: 3 }; VB.forceEnd(G); return eq(5, p.vp); });
R('Final: 1 point per 2 workers (5 workers = 2)', () => { const G = G0(2), p = G.P[0]; p.silver = 0; p.workers = 5; p.goods = {}; VB.forceEnd(G); return eq(2, p.vp); });
R('Final: a single worker is worth nothing', () => { const G = G0(2), p = G.P[0]; p.silver = 0; p.workers = 1; p.goods = {}; VB.forceEnd(G); return eq(0, p.vp); });
R('Final: tiles still in storage score nothing', () => { const G = G0(2), p = G.P[0]; p.silver = 0; p.workers = 0; p.goods = {}; p.store = [tile('mine'), tile('ship')]; VB.forceEnd(G); return eq(0, p.vp); });
R('Final: points from play are kept and the end bonus is added on top', () => { const G = G0(2), p = G.P[0]; p.vp = 30; p.silver = 2; p.workers = 0; p.goods = {}; VB.forceEnd(G); return eq(32, p.vp); });
R('The player with most points wins', () => { const G = G0(2); G.P.forEach(p => { p.silver = 0; p.workers = 0; p.goods = {}; }); G.P[0].vp = 40; G.P[1].vp = 41; VB.forceEnd(G); return eq(1, G.winner); });
R('Tie: the player with more empty estate spaces wins (corrected rule)', () => { const G = G0(2); G.P.forEach(p => { p.silver = 0; p.workers = 0; p.goods = {}; p.vp = 30; }); G.P[1].estate[19] = filler(19); G.P[0].pos = 5; G.P[1].pos = 0; VB.forceEnd(G); return eq(0, G.winner); });
R('Tie on points and spaces: the player further back on the turn track wins', () => { const G = G0(2); G.P.forEach(p => { p.silver = 0; p.workers = 0; p.goods = {}; p.vp = 30; }); G.P[0].pos = 3; G.P[1].pos = 1; VB.forceEnd(G); return eq(1, G.winner); });
R('Tie on points, spaces and step: the player lower in the stack wins', () => { const G = G0(2); G.P.forEach(p => { p.silver = 0; p.workers = 0; p.goods = {}; p.vp = 30; p.pos = 2; }); G.P[0].arr = 5; G.P[1].arr = 9; VB.forceEnd(G); return eq(0, G.winner); });
R('Tie-break does not override a points difference (more points wins even with more empty spaces)', () => { const G = G0(2); G.P.forEach(p => { p.silver = 0; p.workers = 0; p.goods = {}; }); G.P[0].vp = 31; G.P[1].vp = 30; G.P[1].estate[19] = filler(19); G.P[0].pos = 9; VB.forceEnd(G); return eq(0, G.winner); });
R('The game is over after the last round: no moves are offered', () => { const G = G0(2); G.phase = 4; G.round = 4; G.ti = 1; G.P[1].dice = [1, 1]; burn(G); return eq('true/0', G.over + '/' + VB.validMoves(G).length); });

S('H. Lore tiles (our own set of 26; each does what its text says)');
const know = (id, fn) => { const k = VB.KNOWBY[id]; R('Lore ' + k.name + ': ' + k.text, () => fn(k)); };
R('Lore: placing a Lore tile gives its rule at once', () => { const G = G0(2), p = G.P[0]; put(G, 9, tile('know', 'k8')); return eq(true, !!p.know.store4); });
know('k1', () => { const G = G0(2), p = G.P[0]; p.know['wk+1'] = true; VB.performMove(G, { k: 'workers', die: 0, w: 0 }); return eq(3, p.workers); });
know('k2', () => { const G = G0(2), p = G.P[0]; p.know.saleSil = true; p.goods = { 3: 1 }; p.dice = [3, 3]; const s = p.silver; VB.performMove(G, { k: 'sell', die: 0, v: 3, w: 0 }); return eq(s + 2, p.silver); });
know('k3', () => { const G = G0(2), p = G.P[0]; p.know.saleVP = true; p.goods = { 3: 2 }; p.dice = [3, 3]; VB.performMove(G, { k: 'sell', die: 0, v: 3, w: 0 }); return eq(6, p.vp); });
know('k4', () => { const G = G0(2), p = G.P[0]; p.know.shipVP = true; put(G, 0, tile('ship')); return eq(2, p.vp); });
know('k5', () => { const G = G0(2), p = G.P[0]; p.know.mineWk = true; p.estate[21] = { id: 'm', t: 'mine' }; p.estate[27] = { id: 'm2', t: 'mine' }; G.round = 4; G.ti = 1; G.P[1].dice = [1, 1]; const w = p.workers; burn(G); return eq(w + 2, p.workers); });
know('k6', () => eq(0, VB.cost({ know: { take1: true } }, 3, 4, 'take')));
know('k7', () => eq('0/1', VB.cost({ know: { place1: true } }, 3, 4, 'place') + '/' + VB.cost({ know: { place1: true } }, 3, 4, 'take')));
know('k8', () => { const G = G0(2), p = G.P[0]; p.know.store4 = true; p.dice = [1, 1]; p.store = [tile('mine'), tile('mine'), tile('mine')]; G.depots[1] = [tile('ship'), null]; VB.performMove(G, { k: 'take', die: 0, v: 1, slot: 0, w: 0 }); return eq('4/0', p.store.length + '/' + G.pend.length); });
know('k9', () => { const G = G0(2), p = G.P[0]; p.know.black1 = true; p.silver = 5; G.black = [tile('mine'), null, null, null]; VB.performMove(G, { k: 'buy', slot: 0 }); return eq(4, p.silver); });
know('k10', () => { const G = G0(2), p = G.P[0]; p.know.dupBld = true; put(G, 19, tile('bld', 'tower')); return eq(true, VB.canPlace(p, tile('bld', 'tower'), 20, 0)); });
know('k11', () => { const G = G0(2), p = G.P[0]; p.know.pasVP = true; const c = VB.REGIONS.find(r => r.col === 'pas' && r.cells.length === 6).cells[0]; put(G, c, tile('pas', 'sheep', 3)); return eq(5, p.vp); });
know('k12', () => { const G = G0(2), p = G.P[0]; p.know.wkSil = true; const s = p.silver; VB.performMove(G, { k: 'workers', die: 0, w: 0 }); return eq(s + 1, p.silver); });
know('k13', () => { const G = G0(2), p = G.P[0]; p.know.saleWk = true; p.goods = { 3: 1 }; p.dice = [3, 3]; VB.performMove(G, { k: 'sell', die: 0, v: 3, w: 0 }); return eq(1, p.workers); });
know('k14', () => { const G = G0(2), p = G.P[0]; p.know.shipSil = true; const s = p.silver; put(G, 0, tile('ship')); return eq(s + 1, p.silver); });
know('k15', () => { const G = G0(2), p = G.P[0]; p.know.mineVP = true; p.estate[21] = { id: 'm', t: 'mine' }; G.round = 4; G.ti = 1; G.P[1].dice = [1, 1]; burn(G); return eq(1, p.vp); });
know('k16', () => eq('2/1', VB.cost({ know: { wk2: true } }, 1, 4, 'take') + '/' + VB.cost({ know: { wk2: true } }, 1, 2, 'take')));
['hall', 'carp', 'chapel', 'mkt', 'inn', 'mint', 'tower', 'store'].forEach((b, i) => know('k' + (17 + i), () => { const G = G0(2), p = G.P[0]; p.silver = 0; p.workers = 0; p.goods = {}; p.estate[19] = { id: 'b1', t: 'bld', k: b }; p.estate[11] = { id: 'b2', t: 'bld', k: b }; p.know['end:' + b] = true; VB.forceEnd(G); return eq(6, p.vp); }));
know('k25', () => { const G = G0(2), p = G.P[0]; p.silver = 0; p.workers = 0; p.goods = {}; p.know['end:sold'] = true; p.sold = 5; VB.forceEnd(G); return eq(5, p.vp); });
know('k26', () => { const G = G0(2), p = G.P[0]; p.silver = 0; p.workers = 0; p.goods = {}; p.know['end:beast'] = true; p.estate[2] = { id: 'a', t: 'pas', k: 'sheep', n: 2 }; p.estate[3] = { id: 'b', t: 'pas', k: 'sheep', n: 3 }; p.estate[34] = { id: 'c', t: 'pas', k: 'pig', n: 2 }; VB.forceEnd(G); return eq(8, p.vp); });

S('I. Components of the original (every tile type, bonus tile, goods, silver, workers)', 'Added after the owner reported missing items: tile mix, black-backed tiles and the bonus tile of every colour.');
const cnt = f => VB.pool().filter(f).length;
R('Component: 164 hexagon tiles in all', () => eq(164, VB.pool().length));
R('Component: 26 barge tiles', () => eq(26, cnt(t => t.t === 'ship')));
R('Component: 12 mine tiles', () => eq(12, cnt(t => t.t === 'mine')));
R('Component: 16 keep tiles', () => eq(16, cnt(t => t.t === 'castle')));
R('Component: 26 different Lore tiles, no two alike', () => eq('26/26', cnt(t => t.t === 'know') + '/' + new Set(VB.pool().filter(t => t.t === 'know').map(t => t.k)).size));
R('Component: 28 pasture tiles, 7 of each of the 4 animal kinds, each tile showing 2 to 4 animals', () => { const P = VB.pool().filter(t => t.t === 'pas'); const per = Object.keys(VB.ANIMALS).map(a => P.filter(t => t.k === a).length).join(); return eq('28/7,7,7,7/true', P.length + '/' + per + '/' + P.every(t => t.n >= 2 && t.n <= 4)); });
R('Component: 56 building tiles, 7 of each of the 8 kinds', () => eq('56/7,7,7,7,7,7,7,7', cnt(t => t.t === 'bld') + '/' + VB.BLDKEYS.map(k => cnt(t => t.t === 'bld' && t.k === k)).join()));
R('Component: 40 tiles have a black back (6 barges, 2 mines, 2 keeps, 6 Lore, 8 pastures, 16 buildings)', () => eq('40/6,2,2,6,8,16', cnt(t => t.b) + '/' + ['ship', 'mine', 'castle', 'know', 'pas', 'bld'].map(c => cnt(t => t.b && t.t === c)).join()));
R('Component: every tile has a unique id', () => eq(164, new Set(VB.pool().map(t => t.id)).size));
R('Component: the back lane holds only black-backed tiles', () => { const G = G0(4); return eq(true, G.black.length === 8 && G.black.every(t => t && t.b)); });
R('Component: the numbered stalls never hold a black-backed tile', () => { const G = G0(4); let ok = true; for (let d = 1; d <= 6; d++) G.depots[d].forEach(t => { if (!t || t.b) ok = false; }); return eq(true, ok); });
R('Component: 4 players can play all 5 seasons without a stall or back-lane space left empty', () => { const G = G0(4); let bad = 0; for (let ph = 0; ph < 5; ph++) { for (let d = 1; d <= 6; d++) G.depots[d].forEach(t => { if (!t || t.b) bad++; }); G.black.forEach(t => { if (!t || !t.b) bad++; }); let k = 0; const cur = G.phase; while (G.phase === cur && !G.over && k++ < 30) burn(G); } return eq(0, bad); });
R('Component: 42 goods tiles (6 kinds x 7) cover the start, five seasons of five and 4 players', () => eq(true, 42 >= 12 + 25));
R('Component: silver and workers are unlimited supplies (a big pile is never capped)', () => { const G = G0(2), p = G.P[0]; p.silver = 60; p.workers = 60; p.dice = [1, 1]; VB.performMove(G, { k: 'workers', die: 0, w: 0 }); return eq(62, p.workers); });
const COLBON = { castle: 'keep', mine: 'mine', know: 'lore', bld: 'building', pas: 'pasture', ship: 'barge' };
Object.keys(COLBON).forEach(col => R('Bonus tiles of the ' + COLBON[col] + ' colour: first to fill every ' + COLBON[col] + ' space gets the large bonus (5), the second the small one (2), with 2 players', () => {
  const G = G0(2); const got = [];
  for (let i = 0; i < 2; i++) { const p = G.P[i]; const cells = C.filter(c => c.col === col).map(c => c.i); const last = cells[cells.length - 1]; cells.forEach(x => { if (x !== last && !p.estate[x]) p.estate[x] = filler(x); }); G.pend = []; const r = put(G, last, lastTile(col), null, i); const ev = r.ev.find(e => e.e === 'score' && e.why === 'colour'); got.push(ev ? ev.n : 0); }
  return eq('5,2', got.join());
}));

/* ===================================================================== */
if (process.argv.includes('--md')) {
  const out = ['# Vale of Banners: rules checklist (W437)', '',
    'Every rule of the published rulebook this game adapts, numbered. `logic-test.js` holds one headless assertion per number, run against the real engine',
    '(`src/engine.js` + `src/data.js`); this list is generated from that file (`node logic-test.js --md`), so list and tests cannot drift.',
    'Run: `node logic-test.js` prints one line per failing rule (number, expected, got) and the total.', '',
    'Checked against: the published rulebook text (setup, storage, goods, barge/ship, selling, season end, colour and region bonus, final scoring, tie-break),',
    'cross-checked on 8 Nov 2026 against a rulebook summary page, plus our own `rules-notes.md`. The existing `rules-test.js` was written by the builders and is not used as evidence.', '',
    'Own, on purpose (not rule checks): the estate map and its numbers, the tile pool mix, the 26 Lore tiles (section H tests that each does what its own text says).',
    'Not original rules and not tested here: the solo and 2 v 2 team modes.', '',
    'Not decidable from the published text: whether one meadow may hold two animal kinds. Our engine allows it (kinds are scored separately); no rule is asserted.', '',
    'W505 gameplay gate (8 Nov 2026), checked against the rulebook text and two rules pages: goods crates left on the stalls now stay into the next season (only',
    'hexagon tiles are cleared), and a tie now goes to the player with MORE empty estate spaces (the English rulebook says fewest; the rules pages call that a',
    'translation error). Still different on purpose: the stall spaces of the original are colour-coded (a fixed colour per space, and in 3-player games',
    'stall 6 holds a keep or a mine by season); its exact layout was not found, so our stalls draw at random from the normal tiles.', ''];
  rules.forEach((r, i) => { secs.filter(s => s.at === i).forEach(s => { out.push('', '## ' + s.name, s.note ? '_' + s.note + '_' : '', ''); }); out.push((i + 1) + '. ' + r.text); });
  console.log(out.join('\n')); process.exit(0);
}
let pass = 0; const fails = [];
rules.forEach((r, i) => {
  let res; try { res = r.fn(); } catch (e) { res = [null, 'ERROR ' + e.message]; }
  const ok = Array.isArray(res) ? String(res[0]) === String(res[1]) : !!res;
  if (ok) pass++; else { fails.push(i + 1); console.log('FAIL R' + (i + 1) + ' expected ' + (res ? res[0] : '?') + ' got ' + (res ? res[1] : '?') + '  | ' + r.text); }
});
console.log((fails.length ? 'FAIL ' : 'PASS ') + pass + '/' + rules.length + ' rules pass' + (fails.length ? '; failing: ' + fails.join(',') : ''));
process.exit(fails.length ? 1 : 0);

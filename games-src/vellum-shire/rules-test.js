// Vellum Shire rules test (node, no browser): component counts, every rule, then computer-vs-computer games with invariants after every move.
// node rules-test.js            full (gauntlet 40 games)     QUICK=1 node rules-test.js   (8 games)
const V = require('./src/data.js'), E = require('./src/engine.js'), A = require('./src/ai.js');
let pass = 0, fail = 0;
function ok(c, name) { if (c) pass++; else { fail++; console.log('FAIL', name); } }
function eq(a, b, name) { ok(JSON.stringify(a) === JSON.stringify(b), name + ' (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')'); }
const cnt = (arr, f) => arr.filter(f).length;
// ---------- components (identical to the original edition)
eq(V.TILES.length, 164, 'hex tiles');
eq([cnt(V.TILES, t => t.col === 'T'), cnt(V.TILES, t => t.col === 'T' && t.ink)], [56, 16], 'town tiles 56 (16 ink)');
eq([cnt(V.TILES, t => t.col === 'F'), cnt(V.TILES, t => t.col === 'F' && t.ink)], [28, 8], 'animal tiles 28 (8 ink)');
eq([cnt(V.TILES, t => t.col === 'L'), cnt(V.TILES, t => t.col === 'L' && t.ink)], [26, 6], 'lore tiles 26 (6 ink)');
eq([cnt(V.TILES, t => t.col === 'K'), cnt(V.TILES, t => t.col === 'K' && t.ink)], [16, 2], 'keeps 16 (2 ink)');
eq([cnt(V.TILES, t => t.col === 'Q'), cnt(V.TILES, t => t.col === 'Q' && t.ink)], [12, 2], 'quarries 12 (2 ink)');
eq([cnt(V.TILES, t => t.col === 'B'), cnt(V.TILES, t => t.col === 'B' && t.ink)], [26, 6], 'barges 26 (6 ink)');
V.BKEYS.forEach(k => eq([cnt(V.TILES, t => t.k === k), cnt(V.TILES, t => t.k === k && t.ink)], [7, 2], 'building ' + k + ' 7 (2 ink)'));
eq(V.BKEYS.length, 8, '8 building kinds');
V.AKEYS.forEach(k => { eq(V.TILES.filter(t => t.k === k && !t.ink).map(t => t.a), [2, 2, 3, 3, 4], k + ' plain animals'); eq(V.TILES.filter(t => t.k === k && t.ink).map(t => t.a), [3, 4], k + ' ink animals'); });
eq(V.TILES.filter(t => t.col === 'L' && t.ink).map(t => t.a), [7, 12, 14, 15, 24, 25], 'ink lore numbers');
eq(V.LORE.filter(Boolean).length, 26, '26 lore powers');
eq(V.GOODS.filter(Boolean).length * V.PARTS.goodsPerKind, 42, '42 goods (6 x 7)');
eq([V.PARTS.silver, V.PARTS.workers, V.PARTS.seals, V.PARTS.dice, V.PARTS.estates], [20, 30, 12, 9, 9], 'silver, workers, seals, dice, estates');
eq(V.HEX.length, 37, 'estate spaces');
const colN = c => cnt(V.HEX, h => h.col === c);
eq(['T', 'F', 'L', 'B', 'K', 'Q'].map(colN), [12, 6, 6, 6, 4, 3], 'estate colours 12/6/6/6/4/3');
eq(V.ROWS.map(r => r.map(x => +x[1])), [[6, 5, 4, 3], [2, 1, 6, 5, 4], [5, 4, 3, 1, 2, 3], [6, 1, 2, 6, 5, 4, 1], [2, 5, 4, 3, 1, 2], [6, 1, 2, 5, 6], [3, 4, 1, 3]], 'estate die numbers');
eq(V.REGIONS.filter(r => r.col === 'T').map(r => r.cells.length).sort(), [1, 3, 3, 5], 'towns 1/3/3/5');
eq(V.REGIONS.filter(r => r.col === 'F').map(r => r.cells.length).sort(), [1, 5], 'pastures 5 and 1');
eq(V.REGIONS.filter(r => r.col === 'Q').map(r => r.cells.length), [3], 'one quarry region of 3');
eq(V.HEX[V.START].col + V.HEX[V.START].d, 'K6', 'start keep on the centre 6');
eq(V.SIZE_PTS.slice(1), [1, 3, 6, 10, 15, 21, 28, 36], 'region size points');
eq(V.PHASE_BONUS, [10, 8, 6, 4, 2], 'chapter bonus');
eq([V.SELL_VP, V.BIG_BONUS, V.SMALL_BONUS, V.BLACK_PER_PHASE], [2, 5, 2, 4], '2-player numbers');
eq(Object.keys(V.BOARDS).length, 9, '9 estate boards');
for (const n in V.BOARDS) { const c = {}; V.BOARDS[n].col.forEach(x => c[x] = (c[x] || 0) + 1); eq(['T', 'F', 'L', 'B', 'K', 'Q'].map(k => c[k]), [12, 6, 6, 6, 4, 3], 'board ' + n + ' colours'); }
{ const g = E.newGame({ seed: 8, boards: 'random' }); ok(g.p[0].board !== g.p[1].board, 'random boards differ'); eq(E.validMoves(g).map(m => m.t), ['start', 'start', 'start', 'start'], 'pick one of 4 keep spaces');
  E.apply(g, E.validMoves(g)[0]); E.apply(g, E.validMoves(g)[1]); ok(!g.pick && E.validMoves(g).some(m => m.t === 'take' || m.t === 'work'), 'then play starts');
  while (!g.over) E.apply(g, A.pick(g, 'easy')); eq(E.checkInvariants(g), [], 'random-board game finishes clean'); }
// ---------- setup
let G = E.newGame({ seed: 5, first: 0 });
eq(G.p.map(p => p.silver), [1, 1], '1 silver each');
eq(G.p.map(p => p.wk), [1, 2], 'workers 1 and 2');
eq(G.p.map(p => p.goods.reduce((a, b) => a + b.n, 0)), [3, 3], '3 goods each');
eq(G.p.map(p => V.TILES[p.est[V.START]].col), ['K', 'K'], 'start keeps');
for (let n = 1; n <= 6; n++) eq(G.st[n].t.map(id => V.TILES[id].col).sort(), V.STALL_COLS[n].slice().sort(), 'stall ' + n + ' colours');
eq(G.blk.length, 4, 'ink stall 4 tiles');
ok(G.blk.every(id => V.TILES[id].ink), 'ink stall tiles have ink backs');
eq(G.st[G.white].g.length, 1, 'white die stall got the round goods');
eq(G.roundGoods.length, 4, '4 goods left for this chapter');
eq(E.checkInvariants(G), [], 'invariants at setup');
// helpers to craft states
function fresh(seed) { const g = E.newGame({ seed: seed || 9, first: 0 }); g.p[0].dice = [1, 1]; g.p[0].used = [0, 0]; return g; }
function give(g, s, col, pred) { const st = g.stack[col]; const i = st.findIndex(id => !pred || pred(V.TILES[id])); const id = st.splice(i, 1)[0]; const k = g.p[s].sto.indexOf(null); g.p[s].sto[k] = id; return id; }
function putEst(g, s, h, col, pred) { const st = g.stack[col]; const i = st.findIndex(id => !pred || pred(V.TILES[id])); const id = st.splice(i, 1)[0]; g.p[s].est[h] = id; return id; }
function hexAt(r, c) { return V.HEX.find(h => h.r === r && h.c === c).i; }
function find(g, f) { return E.validMoves(g).find(f); }
// ---------- take
G = fresh(); G.p[0].dice = [3, 5];
let m = find(G, x => x.t === 'take' && x.st === 3 && x.w === 0);
ok(m && m.die === 0, 'die 3 takes from stall 3');
ok(!find(G, x => x.t === 'take' && x.st === 1 && x.w === 0), 'no free take from stall 1 with 3 and 5');
let id = m.tile; E.apply(G, m); ok(G.p[0].sto.includes(id), 'taken tile goes to storage');
G = fresh(); G.p[0].dice = [6, 6]; G.p[0].wk = 1;
ok(find(G, x => x.t === 'take' && x.st === 1 && x.w === 1), 'a worker turns 6 into 1 (wraps)');
ok(!find(G, x => x.t === 'take' && x.st === 2), 'one worker cannot reach 2 from 6');
G = fresh(); G.p[0].dice = [2, 2]; G.p[0].wk = 0; give(G, 0, 'T'); give(G, 0, 'T'); give(G, 0, 'T');
m = find(G, x => x.t === 'take' && x.st === 2); ok(m && m.disc != null, 'full storage: take needs a tile to drop');
let drop = G.p[0].sto[m.disc]; E.apply(G, m); ok(G.gone.includes(drop), 'dropped tile leaves the game');
// ---------- place
G = fresh(); G.p[0].dice = [2, 4]; let bar = give(G, 0, 'B');
let h32 = hexAt(3, 2), h34 = hexAt(3, 4), h30 = hexAt(3, 0);
ok(find(G, x => x.t === 'place' && x.h === h32 && x.w === 0), 'barge on river 2 next to the keep');
ok(!find(G, x => x.t === 'place' && x.h === h30), 'not on a space that touches nothing');
ok(!find(G, x => x.t === 'place' && x.h === h34 && x.w === 0), 'river 5 needs a 5 (or workers)');
ok(!find(G, x => x.t === 'place' && V.HEX[x.h].col !== 'B'), 'only on spaces of its colour');
// one building of each kind per town
G = fresh(); G.p[0].dice = [3, 3];
let h43 = hexAt(4, 3), h44 = hexAt(4, 4);
putEst(G, 0, h43, 'T', t => t.k === 'hostel'); give(G, 0, 'T', t => t.k === 'hostel'); G.p[0].dice = [1, 1];
ok(!find(G, x => x.t === 'place' && x.h === h44), 'no second Hostel in the same town');
G.p[0].lore.push(1); ok(find(G, x => x.t === 'place' && x.h === h44), 'lore 1 allows the same building twice');
// region completion + chapter bonus
G = fresh(); let h22 = hexAt(2, 2); give(G, 0, 'T', t => t.k === 'belltower'); G.p[0].dice = [3, 3];
m = find(G, x => x.t === 'place' && x.h === h22 && x.w === 0); let vp0 = G.p[0].vp; E.apply(G, m);
eq(G.p[0].vp - vp0, 1 + 10 + 4, 'town of 1 filled in chapter I: 1 + 10, plus bell tower 4');
// colour seal: big then small
G = fresh(); [hexAt(0, 1), hexAt(0, 2)].forEach(h => putEst(G, 0, h, 'K')); give(G, 0, 'K'); G.p[0].dice = [6, 6];
let h12 = hexAt(1, 2); m = find(G, x => x.t === 'place' && x.h === h12 && x.w === 0); vp0 = G.p[0].vp; E.apply(G, m);
eq(G.p[0].vp - vp0, 6 + 10 + 5, 'keeps: region 3 (6) + chapter 10 + big seal 5');
eq(G.seal.K, [0, -1], 'big keep seal to seat 0');
// second player gets the small seal
[hexAt(0, 1), hexAt(0, 2)].forEach(h => putEst(G, 1, h, 'K')); G.p[1].est[h12] = null;
G.pend = []; G.ti = 1; G.order = [0, 1]; G.p[1].used = [0, 0]; G.p[1].dice = [6, 6]; G.p[1].sto = [null, null, null]; give(G, 1, 'K');
m = find(G, x => x.t === 'place' && x.h === h12 && x.w === 0); vp0 = G.p[1].vp; E.apply(G, m);
eq(G.p[1].vp - vp0, 6 + 10 + 2, 'second to fill keeps: small seal 2');
// animals
G = fresh(); let p1 = hexAt(1, 1), p2 = hexAt(1, 0);
putEst(G, 0, hexAt(1, 2), 'K'); putEst(G, 0, p1, 'F', t => t.k === 'cow' && t.a === 3);
give(G, 0, 'F', t => t.k === 'cow' && t.a === 4); G.p[0].dice = [2, 2];
m = find(G, x => x.t === 'place' && x.h === p2 && x.w === 0); vp0 = G.p[0].vp; E.apply(G, m);
eq(G.p[0].vp - vp0, 4 + 3, '4 cows next to 3 cows in the same pasture: 7');
G = fresh(); putEst(G, 0, hexAt(1, 2), 'K'); putEst(G, 0, p1, 'F', t => t.k === 'pig' && t.a === 3);
give(G, 0, 'F', t => t.k === 'cow' && t.a === 4); G.p[0].dice = [2, 2]; G.p[0].lore.push(7);
m = find(G, x => x.t === 'place' && x.h === p2 && x.w === 0); vp0 = G.p[0].vp; E.apply(G, m);
eq(G.p[0].vp - vp0, 4 + 1, 'other animals do not count; lore 7 adds 1 per tile');
// keep: free action with any number
G = fresh(); putEst(G, 0, hexAt(0, 1), 'K'); putEst(G, 0, hexAt(0, 2), 'K'); give(G, 0, 'K'); G.p[0].dice = [6, 1];
m = find(G, x => x.t === 'place' && x.h === hexAt(1, 2) && x.die === 0 && x.w === 0); E.apply(G, m);
eq(G.pend.map(p => p.h), ['free'], 'keep gives a free action');
ok(find(G, x => x.t === 'take' && x.st === 4 && x.die === -1 && x.w === 0) && find(G, x => x.t === 'take' && x.st === 2 && x.die === -1), 'free action uses any number');
m = find(G, x => x.t === 'work' && x.die === -1); E.apply(G, m); eq(G.pend.length, 0, 'free action spent'); eq(G.p[0].used, [1, 0], 'second die still unused');
// barge: goods + turn order
G = fresh(); give(G, 0, 'B'); G.p[0].dice = [2, 2]; G.st[4].g = [3, 3, 5];
m = find(G, x => x.t === 'place' && x.h === h32 && x.w === 0); E.apply(G, m);
eq(G.pend.map(p => p.h), ['ship'], 'barge asks for a stall to load');
let before = G.p[0].goods.reduce((a, b) => a + b.n, 0), kinds = G.p[0].goods.length;
m = find(G, x => x.t === 'ship' && x.st === 4 && !x.st2); E.apply(G, m);
ok(G.p[0].goods.length <= 3, 'at most 3 goods kinds');
ok(G.p[0].goods.reduce((a, b) => a + b.n, 0) > before, 'barge loads goods');
eq(G.p[0].trk, 1, 'barge moves you up the procession');
// barge overflow: more new kinds than free goods spaces -> the player chooses which kinds to keep
G = fresh(); give(G, 0, 'B'); G.p[0].dice = [2, 2]; G.p[0].goods = [{ d: 1, n: 1 }, { d: 2, n: 1 }]; G.st[4].g = [3, 4, 5, 1];
m = find(G, x => x.t === 'place' && x.h === h32 && x.w === 0); E.apply(G, m);
eq(E.validMoves(G).filter(x => x.t === 'ship' && x.st === 4).map(x => x.keep).sort(), ['3', '4', '5'], 'overflow: one choice per kind that fits');
m = find(G, x => x.t === 'ship' && x.st === 4 && x.keep === '4'); E.apply(G, m);
eq([G.p[0].goods.map(x => x.d + 'x' + x.n).join(), G.st[4].g.join()], ['1x2,2x1,4x1', '3,5'], 'overflow: chosen kind + held kind loaded, the rest stays');
ok(/more than once/.test(V.LORE[1].fx), 'lore 1 text: same building more than once (engine allows any number)');
// sell
G = fresh(); G.p[0].goods = [{ d: 4, n: 3 }]; G.p[0].dice = [4, 1]; G.p[0].silver = 0;
m = find(G, x => x.t === 'sell' && x.v === 4 && x.w === 0); vp0 = G.p[0].vp; E.apply(G, m);
eq([G.p[0].vp - vp0, G.p[0].silver, G.p[0].goods.length, G.p[0].sold[4]], [6, 1, 0, 3], 'sell 3 goods: 6 points, 1 silver, kept for lore');
G = fresh(); G.p[0].goods = [{ d: 4, n: 1 }]; G.p[0].dice = [4, 1]; G.p[0].silver = 0; G.p[0].lore.push(3, 4); let w0 = G.p[0].wk;
E.apply(G, find(G, x => x.t === 'sell' && x.v === 4 && x.w === 0)); eq([G.p[0].silver, G.p[0].wk - w0], [2, 1], 'lore 3 and 4: 2 silver and 1 worker');
// workers
G = fresh(); w0 = G.p[0].wk; E.apply(G, find(G, x => x.t === 'work' && x.die === 0)); eq(G.p[0].wk - w0, 2, 'take 2 workers');
G = fresh(); G.p[0].lore.push(14, 13); w0 = G.p[0].wk; let s0 = G.p[0].silver; E.apply(G, find(G, x => x.t === 'work')); eq([G.p[0].wk - w0, G.p[0].silver - s0], [4, 1], 'lore 14 and 13: 4 workers and 1 silver');
G = fresh(); G.p[0].dice = [1, 1]; G.p[0].wk = 1; G.p[0].lore.push(8); ok(find(G, x => x.t === 'take' && x.st === 3 && x.w === 1), 'lore 8: a worker turns a die by 2');
G = fresh(); G.p[0].dice = [1, 1]; G.p[0].wk = 0; G.p[0].lore.push(12); ok(find(G, x => x.t === 'take' && x.st === 2 && x.w === 0), 'lore 12: free +-1 to take');
// buy from the ink stall
G = fresh(); G.p[0].silver = 4; m = find(G, x => x.t === 'buy'); ok(m && m.st === 0, 'buy from the ink stall');
E.apply(G, m); eq(G.p[0].silver, 2, 'costs 2 silver'); ok(!find(G, x => x.t === 'buy'), 'only once a turn');
G = fresh(); G.p[0].silver = 4; G.p[0].lore.push(6); ok(find(G, x => x.t === 'buy' && x.st > 0), 'lore 6: buy from any stall');
G = fresh(); G.p[0].silver = 1; ok(!find(G, x => x.t === 'buy'), 'need 2 silver');
// buildings
function build(k, setup) { const g = fresh(); g.p[0].dice = [3, 3]; if (setup) setup(g); give(g, 0, 'T', t => t.k === k); const mm = find(g, x => x.t === 'place' && x.h === h22 && x.w === 0); g.ev = []; E.apply(g, mm); return g; }
G = build('hostel'); eq(G.p[0].wk, 1 + 4, 'Hostel: +4 workers');
G = build('counting'); eq(G.p[0].silver, 1 + 2, 'Counting House: +2 silver');
G = build('granary', g => { g.p[0].goods = [{ d: 5, n: 2 }]; }); eq(G.pend.map(p => p.h), ['ware'], 'Granary: sell goods now'); vp0 = G.p[0].vp; E.apply(G, find(G, x => x.t === 'sell' && x.v === 5)); eq(G.p[0].vp - vp0, 4, 'Granary sale scores');
G = build('joinery'); eq(G.pend.map(p => p.h), ['grab'], 'Joinery: take a town tile'); ok(E.validMoves(G).filter(x => x.t === 'grab').every(x => V.TILES[x.tile].col === 'T'), 'Joinery: town tiles only');
G = build('chapel'); ok(E.validMoves(G).filter(x => x.t === 'grab').every(x => 'KQL'.includes(V.TILES[x.tile].col)), 'Chapel: keep, quarry or lore');
G = build('fair'); ok(E.validMoves(G).filter(x => x.t === 'grab').every(x => 'BF'.includes(V.TILES[x.tile].col)), 'Fair: barge or animal');
ok(!E.validMoves(G).some(x => x.t === 'grab' && x.st === 0), 'grabs never from the ink stall');
G = build('guildhall', g => { give(g, 0, 'B'); }); eq(G.pend.map(p => p.h), ['hall'], 'Guildhall: place another tile');
ok(find(G, x => x.t === 'place' && x.die === -2 && x.h === h32) && find(G, x => x.t === 'place' && x.die === -2 && x.h === h34), 'Guildhall ignores the die number');
// quarry: silver at chapter end
G = fresh(); putEst(G, 0, hexAt(4, 2), 'Q'); putEst(G, 0, hexAt(5, 1), 'Q'); s0 = G.p[0].silver;
while (G.rd === 0 || G.ph === 0 && G.rd < 5) { if (G.ph > 0) break; E.apply(G, E.validMoves(G).find(x => x.t === 'work') || E.validMoves(G).find(x => x.t === 'end')); }
eq(G.ph, 1, 'next chapter after 5 rounds'); ok(G.p[0].silver - s0 >= 2, 'quarries pay 1 silver each at chapter end');
for (let n = 1; n <= 6; n++) eq(G.st[n].t.length, 2, 'stall ' + n + ' refilled for chapter II');
// final scoring + lore end tiles
G = fresh(); G.p[0].goods = [{ d: 1, n: 2 }]; G.p[0].silver = 3; G.p[0].wk = 5; G.p[0].sold = [0, 1, 0, 4, 0, 0, 2]; G.p[0].lore = [15, 25, 26]; G.p[0].seals = ['KL', 'QS'];
let f = E.final(G, 0); eq([f.goods, f.silver, f.workers, f.lore], [2, 3, 2, 9 + 7 + 4], 'end: goods 1, silver 1, 2 workers 1, lore 15/25/26');
G = fresh(); putEst(G, 0, h22, 'T', t => t.k === 'bank' || t.k === 'counting'); G.p[0].lore = [22, 24]; putEst(G, 0, p1, 'F', t => t.k === 'sheep');
f = E.final(G, 0); eq(f.lore, 4 + 4, 'lore 22 (counting houses) and 24 (animal kinds)');
// whole game length, tie-break
G = E.newGame({ seed: 3 }); let rounds = 0, lastKey = '';
while (!G.over) { const k = G.ph + ':' + G.rd; if (k !== lastKey) { rounds++; lastKey = k; } E.apply(G, A.pick(G, 'simple')); }
eq(rounds, 25, '5 chapters x 5 rounds');
const tieG = E.newGame({ seed: 4 }); tieG.p.forEach(p => { p.vp = 10; p.goods = []; p.silver = 0; p.wk = 0; p.lore = []; });
putEst(tieG, 1, h22, 'T'); E.finish(tieG);
eq([tieG.final[0].total, tieG.final[1].total, tieG.winner], [10, 10, 0], 'tie: more empty spaces wins');
// ---------- gauntlet
const NG = process.env.QUICK ? 8 : 40; let wins = { normalVsEasy: 0, seat0: 0 }, illegal = 0, inv = 0, scores = [];
for (let g = 0; g < NG; g++) {
  const lv = g % 2 ? ['normal', 'easy'] : ['easy', 'normal'];
  const gg = E.newGame({ seed: 1000 + g, first: g % 2 }); let n = 0;
  while (!gg.over && n < 5000) { const mm = A.pick(gg, lv[E.side(gg)]); if (!E.apply(gg, mm).ok) { illegal++; break; } const iv = E.checkInvariants(gg); if (iv.length) { inv++; console.log('inv', iv); break; } n++; }
  ok(gg.over, 'game ' + g + ' finishes');
  if (lv[gg.winner] === 'normal') wins.normalVsEasy++;
  scores.push(gg.final.map(x => x.total));
}
eq([illegal, inv], [0, 0], 'no illegal move, no broken invariant');
ok(wins.normalVsEasy >= NG * 0.5, 'Normal beats Easy at least half the games (' + wins.normalVsEasy + '/' + NG + ')');
const avg = i => Math.round(scores.reduce((a, s) => a + s[i], 0) / scores.length);
console.log('gauntlet', NG, 'games; normal beat easy', wins.normalVsEasy, '; avg scores', avg(0), avg(1));
// seat balance: hard vs hard (no noise, so the same every run)
let s0w = 0; const NB = process.env.QUICK ? 4 : 16;
for (let g = 0; g < NB; g++) { const gg = E.newGame({ seed: 5000 + g, first: 0 }); while (!gg.over) E.apply(gg, A.pick(gg, 'hard')); if (gg.winner === 0) s0w++; }
ok(s0w >= NB * 0.2 && s0w <= NB * 0.8, 'first seat wins ' + s0w + '/' + NB + ' (fair)');
console.log((fail ? 'FAIL ' : 'PASS ') + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);

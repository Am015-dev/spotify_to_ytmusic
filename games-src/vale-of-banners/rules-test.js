// Rules test: one check per tricky rule, then a few hundred AI games with invariants after every move. node rules-test.js  (QUICK=1: 40 games)
const VB = require('./load.js')();
let pass = 0, fail = 0;
function ok(c, name) { if (c) pass++; else { fail++; console.log('FAIL', name); } }
function fresh(o) { const G = VB.newGame(Object.assign({ n: 2, seed: 11, seats: [{ human: true }, { human: false }] }, o)); G.order = [0, 1]; G.ti = 0; G.pend = []; return G; }
const C = VB.CELLS, home = VB.HOME, P0 = G => G.P[0];
const nbOf = (i, col) => C[i].nb.map(n => C[n]).find(c => !col || c.col === col);
// 1 placement: colour, number, adjacency
{ const G = fresh(), p = P0(G), c = nbOf(home); const t = { id: 'a', t: c.col, k: c.col === 'bld' ? 'tower' : c.col === 'pas' ? 'sheep' : undefined, n: 2 };
  ok(VB.canPlace(p, t, c.i, c.num), 'adjacent matching space is legal');
  ok(!VB.canPlace(p, t, c.i, c.num % 6 + 1), 'wrong number is illegal');
  const far = C.find(x => x.col === c.col && !x.nb.includes(home) && x.i !== home); ok(!far || !VB.canPlace(p, t, far.i, far.num), 'not touching land is illegal');
  ok(!VB.canPlace(p, { id: 'b', t: c.col === 'mine' ? 'ship' : 'mine' }, c.i, c.num), 'wrong colour is illegal'); }
// 2 worker cost wraps 6<->1, Steady Hands halves
{ const p = { know: {} }; ok(VB.cost(p, 6, 1, 'take') === 1 && VB.cost(p, 1, 6, 'place') === 1 && VB.cost(p, 2, 5, 'take') === 3, 'worker distance wraps');
  ok(VB.cost({ know: { wk2: true } }, 1, 4, 'take') === 2, 'steady hands'); ok(VB.cost({ know: { take1: true } }, 3, 4, 'take') === 0, "carter's rule free step"); }
// 3 take into storage; full storage forces a discard
{ const G = fresh(), p = P0(G); p.dice = [1, 1]; p.used = [false, false]; G.depots[1] = [{ id: 'q1', t: 'mine' }, { id: 'q2', t: 'ship' }]; p.store = [{ id: 's1', t: 'mine' }, { id: 's2', t: 'mine' }, { id: 's3', t: 'mine' }];
  const r = VB.performMove(G, { k: 'take', die: 0, v: 1, slot: 0, w: 0 }); ok(r.ok && G.pend.length && G.pend[0].t === 'discard', 'full storage -> discard question');
  VB.performMove(G, { k: 'discard', s: 0 }); ok(p.store.length === 3 && !G.pend.length, 'discard resolves'); }
// 4 sell: points (players+1) per tile + 1 silver; die must match
{ const G = fresh(), p = P0(G); p.goods = { 3: 2 }; p.dice = [3, 5]; p.used = [false, false]; const vp = p.vp, sil = p.silver; p.workers = 0;
  ok(!VB.validMoves(G).some(m => m.k === 'sell' && m.die === 1), 'sell needs a matching die');
  VB.performMove(G, { k: 'sell', die: 0, v: 3, w: 0 }); ok(p.vp === vp + 6 && p.silver === sil + 1 && !p.goods[3], 'sale pays 3 per tile in 2p + 1 silver'); }
// 5 region complete scores size + season bonus; colour bonus
{ const G = fresh(), p = P0(G); const reg = VB.REGIONS.find(r => r.col === 'castle'); reg.cells.forEach(i => { if (i !== home) p.estate[i] = undefined; });
  const others = reg.cells.filter(i => i !== home); others.slice(0, -1).forEach(i => { p.estate[i] = { id: 'c' + i, t: 'castle' }; }); Object.keys(p.estate).forEach(k => { if (!p.estate[k]) delete p.estate[k]; });
  const last = others[others.length - 1]; p.store = [{ id: 'cl', t: 'castle' }]; p.dice = [C[last].num, 1]; p.used = [false, false];
  const vp = p.vp, r = VB.performMove(G, { k: 'place', die: 0, v: C[last].num, s: 0, cell: last, w: 0 });
  const pts = VB.REGION_PTS[reg.cells.length] + 10 + (VB.COLCOUNT.castle === reg.cells.length ? VB.COLOUR_BONUS[2][0] : 0);
  ok(r.ok && p.vp === vp + pts, 'castle region: size + season 1 bonus + colour bonus (' + (p.vp - vp) + ' vs ' + pts + ')');
  ok(G.pend.length && G.pend[G.pend.length - 1].t === 'castle', 'keep gives a free action'); }
// 6 Moot Hall chain: place again with any number
{ const G = fresh(), p = P0(G); const bc = C.find(c => c.col === 'bld' && c.nb.includes(home)) || C.find(c => c.col === 'bld');
  if (!bc.nb.includes(home)) p.estate[bc.nb[0]] = { id: 'x0', t: C[bc.nb[0]].col };
  const oc = C.find(c => !p.estate[c.i] && c.i !== bc.i && c.col !== 'bld' && c.col !== 'castle' && c.nb.some(n => p.estate[n] || n === bc.i));
  p.store = [{ id: 'h', t: 'bld', k: 'hall' }, { id: 'sh', t: oc.col, k: oc.col === 'pas' ? 'sheep' : oc.col === 'know' ? 'k25' : undefined, n: 3 }]; p.dice = [bc.num, bc.num]; p.used = [false, false];
  VB.performMove(G, { k: 'place', die: 0, v: bc.num, s: 0, cell: bc.i, w: 0 });
  ok(G.pend.length && G.pend[G.pend.length - 1].t === 'hall', 'moot hall asks for another build');
  const mv = VB.validMoves(G).find(m => m.k === 'place' && m.die === 'x'); ok(!!mv, 'chain build listed (any number)');
  if (mv) { VB.performMove(G, mv); ok(p.stat.chain === 1 && p.used[1] === false, 'chain build does not use a die'); } }
// 7 duplicate building kind in one quarter is illegal
{ const G = fresh(), p = P0(G); const reg = VB.REGIONS.filter(r => r.col === 'bld').sort((a, b) => b.cells.length - a.cells.length)[0];
  p.estate[reg.cells[0]] = { id: 'm1', t: 'bld', k: 'mint' }; const nb = reg.cells.find(i => C[i].nb.includes(reg.cells[0]));
  ok(!VB.canPlace(p, { id: 'm2', t: 'bld', k: 'mint' }, nb, 0) && VB.canPlace(p, { id: 'm3', t: 'bld', k: 'inn' }, nb, 0), 'no two of one building in a quarter');
  p.know.dupBld = true; ok(VB.canPlace(p, { id: 'm2', t: 'bld', k: 'mint' }, nb, 0), 'charter of guilds allows a duplicate'); }
// 8 barge: goods from one stall + banner track up
{ const G = fresh(), p = P0(G); const sc = C.find(c => c.col === 'ship' && c.nb.some(n => p.estate[n])) ; if (sc) {
  p.store = [{ id: 'b1', t: 'ship' }]; p.goods = {}; G.goodsAt[4] = [2, 2]; p.dice = [sc.num, 1]; p.used = [false, false]; const pos = p.pos;
  VB.performMove(G, { k: 'place', die: 0, v: sc.num, s: 0, cell: sc.i, w: 0 }); VB.performMove(G, { k: 'ship', v: 4 });
  ok(p.goods[2] === 2 && p.pos === pos + 1 && !G.goodsAt[4].length, 'barge loads goods and moves up the track'); } else ok(true, 'skip'); }
// 9 at most 3 kinds of goods
{ const G = fresh(), p = P0(G); p.goods = { 1: 1, 2: 1, 3: 1 }; G.goodsAt[5] = [6]; G.pend = [{ t: 'ship' }]; VB.performMove(G, { k: 'ship', v: 5 }); ok(!p.goods[6], 'a 4th kind of goods is lost'); }
// 10 workers action, back lane once per turn
{ const G = fresh(), p = P0(G); p.dice = [2, 2]; p.used = [false, false]; const w = p.workers; VB.performMove(G, { k: 'workers', die: 0, w: 0 }); ok(p.workers === w + 2, 'take 2 workers');
  p.silver = 5; G.black = [{ id: 'k', t: 'mine' }, { id: 'k2', t: 'mine' }, null, null]; VB.performMove(G, { k: 'buy', slot: 0 }); ok(p.silver === 3 && !VB.validMoves(G).some(m => m.k === 'buy'), 'back lane: 2 silver, once per turn'); }
// 11 identical dice: the second stays usable after the first
{ const G = fresh(), p = P0(G); p.dice = [4, 4]; p.used = [false, false]; VB.performMove(G, { k: 'workers', die: 0, w: 0 }); ok(VB.validMoves(G).some(m => m.k === 'workers' && m.die === 1), 'second identical die still usable'); }
// 12 season end: mines pay silver; 5 rounds per season; goods go to the white-die stall
{ const G = fresh(), p = P0(G); const mc = C.find(c => c.col === 'mine'); p.estate[mc.i] = { id: 'mm', t: 'mine' }; const sil = p.silver;
  let k = 0; while (G.phase === 0 && k < 999) { const m = VB.validMoves(G); VB.performMove(G, m.find(x => x.k === 'end') || m.find(x => x.k === 'workers') || m.find(x => x.k === 'skip') || m[0]); k++; }
  ok(G.phase === 1 && p.silver >= sil + 1, 'mine pays at season end'); ok(G.goodsAt[G.white].length >= 1, 'round goods placed on the white-die stall'); }
// 13 end scoring: silver, goods, workers/2, lore scrolls
{ const G = fresh(), p = P0(G); p.silver = 3; p.workers = 5; p.goods = { 2: 2 }; p.know['end:sold'] = true; p.sold = 4; const b = VB.endBreakdown(G, p);
  ok(b.silver === 3 && b.workers === 2 && b.goods === 2 && b.lore === 4, 'end breakdown'); }
// 14 tile pool + data counts
ok(VB.KNOW.length === 26 && VB.BLDKEYS.length === 8 && VB.CELLS.length === 37, '26 lore, 8 buildings, 37 spaces');
// 15 AI games: every level, 2-4 players, invariants after every move
const N = process.env.QUICK ? 40 : 300; let stuck = 0, bad = 0, done = 0, lens = [];
for (let g = 0; g < N; g++) {
  const n = 2 + (g % 3), lv = ['easy', 'normal', 'random', 'first'][g % 4], seats = []; for (let i = 0; i < n; i++) seats.push({ human: false, ai: i === 0 && g % 7 === 0 ? 'hard' : lv });
  const G = VB.newGame({ n, seed: 500 + g, seats, phases: g % 5 === 4 ? 2 : 5 }); let k = 0;
  while (!G.over && k < 6000) { const m = VB.aiMove(G); if (!m || !VB.performMove(G, m).ok) { stuck++; break; } const inv = VB.checkInvariants(G); if (inv.length) { bad++; console.log('INV', inv); break; } k++; }
  if (G.over) { done++; lens.push(k); } else if (k >= 6000) stuck++;
}
ok(done === N && !stuck && !bad, `AI games: ${done}/${N} finished, stuck ${stuck}, invariant breaks ${bad}, avg ${Math.round(lens.reduce((a, b) => a + b, 0) / Math.max(1, lens.length))} moves`);
console.log(`AI games: ${done}/${N} finished, stuck ${stuck}, invariant breaks ${bad}`);
console.log(fail ? `FAIL ${fail} of ${pass + fail}` : `PASS ${pass} checks`); process.exit(fail ? 1 : 0);

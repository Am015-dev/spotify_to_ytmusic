// Headless rules test: rule checks + many full AI games (every player count, levels, automa). Prints pass/fail lines only.
//   node rules-test.js [games=240]
const PP = require('./src/engine.js'), AI = require('./src/ai.js');
const N = +process.argv[2] || 240;
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL ' + m); } };
const seats = (n, lvl, auto) => Array.from({ length: n }, (_, i) => ({ name: 'P' + i, kind: auto && i === 1 ? 'automa' : 'ai', lvl }));
function play(G, maxSteps = 4000) {
  let steps = 0;
  while (G.phase !== 'over' && steps++ < maxSteps) {
    const s = PP.sideToAct(G); const m = AI.choose(G, s, G.pl[s].lvl);
    if (!m) return 'no move for seat ' + s + ' q=' + (G.q && G.q.h);
    const legal = PP.validMoves(G, s);
    if (!legal.length) return 'no legal moves q=' + (G.q && G.q.h);
    const r = PP.performMove(G, m, s); if (!r.ok) return 'illegal: ' + r.err + ' ' + JSON.stringify(m) + ' q=' + (G.q && G.q.h);
    const inv = PP.checkInvariants(G); if (inv.length) return 'invariant: ' + inv[0];
  }
  return G.phase === 'over' ? null : 'stuck after ' + steps;
}
// ---- rule checks
(function () {
  const pays = PP.payOptions({ grub: 0, seed: 2, fish: 0, berry: 0, rodent: 0 }, ['fish']);
  ok(pays.length === 1 && pays[0].seed === 2, 'any 2 food pay for 1 (got ' + JSON.stringify(pays) + ')');
  ok(PP.payOptions({ grub: 1, seed: 0, fish: 0, berry: 0, rodent: 0 }, ['fish']).length === 0, 'cannot pay fish with 1 grub');
  ok(PP.payOptions({ grub: 0, seed: 0, fish: 1, berry: 0, rodent: 1 }, ['fish|rodent']).length === 2, 'either-or cost has 2 ways');
  ok(PP.payOptions({ grub: 0, seed: 0, fish: 0, berry: 1, rodent: 0 }, ['*']).length === 1, 'wild takes any food');
  ok(PP.EGGCOST.join() === '0,1,1,2,2', 'egg cost by column 0,1,1,2,2');
  ok(PP.CUBES.join() === '8,7,6,5', 'action cubes 8,7,6,5');
  // a fixed game: brown chain fires right to left
  const G = PP.newGame({ seats: seats(2, 'normal'), seed: 11 });
  while (G.q && G.q.h === 'setup') PP.performMove(G, AI.setup(G, G.q.seat), G.q.seat);
  ok(G.phase === 'play' && G.round === 0 && G.pl[0].cubes === 8, 'round 1 starts with 8 cubes');
  ok(G.pl.every(p => p.hand.length + PP.foodN(p) === 5 && p.bonus.length === 1), 'setup keeps 5 items and 1 bonus card');
  const lay = PP.DATA.birds.filter(b => b.pw === 'laySelf' && b.h.includes('G')).slice(0, 2).map(b => b.id);
  const p = G.pl[G.cur]; p.board[1] = lay.map(id => ({ id, eggs: 0, cache: 0, tuck: 0 }));
  lay.forEach(id => { const k = G.deck.indexOf(id); if (k >= 0) G.deck.splice(k, 1); const t = G.tray.indexOf(id); if (t >= 0) G.tray[t] = null; G.pl.forEach(q => { const h = q.hand.indexOf(id); if (h >= 0) q.hand.splice(h, 1); }); const d = G.disc.indexOf(id); if (d >= 0) G.disc.splice(d, 1); });
  const seat = G.cur, y = PP.rowYield(p, 1);
  ok(y.n === 3 && !y.bonus, 'grassland with 2 birds lays 3 eggs (got ' + y.n + ')');
  PP.performMove(G, { t: 'act', a: 'eggs' }, seat);
  const order = [];
  let guard = 0;
  while (G.cur === seat && G.q && guard++ < 20) { const m = AI.sub(G, seat, 'normal'); PP.performMove(G, m, seat); G.fx.filter(e => e.k === 'pw' && e.seat === seat).forEach(e => order.push(e.c)); }
  ok(order.join() === '1,0', 'brown powers fire right to left (got ' + order.join() + ')');
  ok(G.pl[seat].cubes === 7, 'a turn spends one cube');
  ok(G.tray.every(Boolean), 'tray refilled at end of turn');
  // goal ties: two players tied for first in round 1 share (4+1)/2 = 2
  const H = PP.newGame({ seats: seats(3, 'normal'), seed: 3, goals: ['total', 'total', 'total', 'total'] });
  while (H.q && H.q.h === 'setup') PP.performMove(H, AI.setup(H, H.q.seat), H.q.seat);
  const someG = PP.DATA.birds.filter(b => b.h.includes('F')).map(b => b.id);
  H.pl[0].board[0] = [{ id: someG[0], eggs: 0, cache: 0, tuck: 0 }]; H.pl[1].board[0] = [{ id: someG[1], eggs: 0, cache: 0, tuck: 0 }];
  const res = PP.placeGoal(H, 0);
  ok(res.pts[0] === 2 && res.pts[1] === 2 && res.pts[2] === 0, 'goal tie splits rounded down, nothing for 0 birds (got ' + res.pts + ')');
  // bonus trade on a bonus space: forest with 1 bird offers card -> extra food
  const K = PP.newGame({ seats: seats(2, 'normal'), seed: 5 });
  while (K.q && K.q.h === 'setup') PP.performMove(K, AI.setup(K, K.q.seat), K.q.seat);
  const kp = K.pl[K.cur], fb = PP.DATA.birds.find(b => b.h === 'F' && !b.pw);
  if (fb) { kp.board[0] = [{ id: fb.id, eggs: 0, cache: 0, tuck: 0 }]; [K.deck, K.disc].forEach(a => { const i = a.indexOf(fb.id); if (i >= 0) a.splice(i, 1); }); K.pl.forEach(q => { const i = q.hand.indexOf(fb.id); if (i >= 0) q.hand.splice(i, 1); }); const t = K.tray.indexOf(fb.id); if (t >= 0) K.tray[t] = null; }
  if (!kp.hand.length) kp.hand.push(K.deck.shift());
  const ks = K.cur, before = PP.foodN(kp);
  PP.performMove(K, { t: 'act', a: 'food' }, ks);
  ok(K.q && K.q.h === 'bonus', 'bonus space offers the trade');
  PP.performMove(K, { t: 'bonus', yes: true, i: 0 }, ks);
  ok(K.q && K.q.h === 'die' && K.q.d.n === 2, 'trade gives one more die (n=' + (K.q && K.q.d.n) + ')');
  // playing in column 1 costs an egg
  const P2 = PP.newGame({ seats: seats(2, 'normal'), seed: 9 });
  while (P2.q && P2.q.h === 'setup') PP.performMove(P2, AI.setup(P2, P2.q.seat), P2.q.seat);
  const pp = P2.pl[P2.cur], fid = PP.DATA.birds.filter(b => b.h.includes('F') && b.c.length === 1 && b.c[0] === 'grub');
  ok(fid.length >= 2, 'test birds found');
  if (fid.length >= 2) {
    const all = [P2.deck, P2.disc]; fid.slice(0, 2).forEach(b => { all.forEach(a => { const i = a.indexOf(b.id); if (i >= 0) a.splice(i, 1); }); P2.pl.forEach(q => { const i = q.hand.indexOf(b.id); if (i >= 0) q.hand.splice(i, 1); }); const t = P2.tray.indexOf(b.id); if (t >= 0) P2.tray[t] = null; });
    pp.board[0] = [{ id: fid[0].id, eggs: 0, cache: 0, tuck: 0 }]; pp.hand = [fid[1].id]; pp.food = { grub: 1, seed: 0, fish: 0, berry: 0, rodent: 0 };
    ok(!PP.playInfo(P2, P2.cur, fid[1].id, 0), 'no egg -> cannot play in column 2 of the forest');
    pp.board[0][0].eggs = 1;
    const inf = PP.playInfo(P2, P2.cur, fid[1].id, 0); ok(inf && inf.eggs === 1, 'column 2 costs 1 egg');
    const r = PP.performMove(P2, { t: 'play', i: 0, id: fid[1].id, h: 0, pay: inf.pays[0] }, P2.cur);
    ok(r.ok && pp.board[0][0].eggs === 0 && pp.food.grub === 0, 'playing paid food and egg');
  }
})();
// ---- full games
// ---- rules-check fixes (games-src/rules-check/perch-and-plume.md), one case per MISSING item
const strip = (G, id) => { [G.deck, G.disc].forEach(a => { const k = a.indexOf(id); if (k >= 0) a.splice(k, 1); }); const t = G.tray.indexOf(id); if (t >= 0) G.tray[t] = null; G.pl.forEach(q => { const h = q.hand.indexOf(id); if (h >= 0) q.hand.splice(h, 1); }); };
const fresh = (seed, o) => { const G = PP.newGame(Object.assign({ seats: seats(2, 'normal'), seed }, o || {})); while (G.q && G.q.h === 'setup') PP.performMove(G, AI.setup(G, G.q.seat), G.q.seat); return G; };
const drive = (G, seat, n = 40) => { const fx = []; while (n-- > 0 && PP.sideToAct(G) === seat && G.q) { const m = AI.choose(G, seat, 'normal'); PP.performMove(G, m, seat); fx.push(...G.fx); G.fx = []; } return fx; };
(function missing_feeder_power_rerolls() {
  const gb = PP.DATA.birds.find(b => b.h.includes('F') && PP.power(b.id).k === 'gainF'), want = PP.power(gb.id).x[0];
  const other = PP.FACES.find(f => f !== want && f !== 'gs' && !(f === 'grub' || f === 'seed') === false ? false : f !== want && f !== 'gs');
  const G = fresh(21), s = G.cur, p = G.pl[s]; strip(G, gb.id); p.board[0] = [{ id: gb.id, eggs: 0, cache: 0, tuck: 0 }];
  G.feeder = [other, other, other, other, other, other].slice(0, 5); G.fx = [];
  const before = p.food[want]; PP.performMove(G, { t: 'act', a: 'food' }, s); const fx = G.fx.slice(); G.fx = []; fx.push(...drive(G, s));
  const pw = fx.findIndex(e => e.k === 'pw' && e.id === gb.id), roll = fx.findIndex((e, i) => e.k === 'roll');
  ok(pw >= 0 && roll >= 0 && fx.slice(0, pw + 1).some(e => e.k === 'roll'), 'MISSING feeder: a gainF power rerolls an all-same feeder that lacks its food (fx ' + fx.map(e => e.k).join(',') + ')');
  // empty feeder before a power: thrown back in
  const G2 = fresh(22), s2 = G2.cur, p2 = G2.pl[s2]; strip(G2, gb.id); p2.board[0] = [{ id: gb.id, eggs: 0, cache: 0, tuck: 0 }];
  G2.feeder = [want]; G2.fx = []; PP.performMove(G2, { t: 'act', a: 'food' }, s2); drive(G2, s2);
  ok(G2.feeder.length > 0, 'MISSING feeder: an emptied feeder is rerolled (feeder ' + G2.feeder.join(',') + ')');
})();
(function missing_second_bird_triggers_pink() {
  const wp = PP.DATA.birds.find(b => PP.power(b.id).k === 'wPlay' && b.h.length > 1), hab = 'FGW'.indexOf(PP.power(wp.id).x[0]);
  const pk = PP.DATA.birds.find(b => PP.power(b.id).k === 'pTuck' && 'FGW'.indexOf(PP.power(b.id).x[0]) === hab);
  const two = PP.DATA.birds.find(b => b.h.includes('FGW'[hab]) && b.id !== wp.id && b.id !== (pk && pk.id) && (!b.pw || PP.power(b.id).col === 'brown'));
  if (!pk || !two) { ok(true, 'skip'); return; }
  const G = fresh(23), s = G.cur, o = 1 - s, p = G.pl[s]; [wp.id, pk.id, two.id].forEach(id => strip(G, id));
  const eg = PP.DATA.birds.find(b => b.h.includes('F') && ![wp.id, pk.id, two.id].includes(b.id) && b.e >= 3); strip(G, eg.id);
  p.board = [[{ id: eg.id, eggs: 3, cache: 0, tuck: 0 }], [], []]; p.hand = [wp.id, two.id]; PP.FOODS.forEach(f => p.food[f] = 5);
  const ph = wp.h.includes('FGW'[hab]) ? hab : 'FGW'.indexOf(wp.h[0]);
  G.pl[o].board[0] = []; G.pl[o].board[1] = []; G.pl[o].board[2] = []; G.pl[o].board[PP.HABS ? 'FGW'.indexOf(pk.h[0]) : 0] = [{ id: pk.id, eggs: 0, cache: 0, tuck: 0 }];
  G.pl[o].pink = false;
  const m1 = PP.validMoves(G, s).find(m => m.t === 'play' && m.i === 0 && m.h !== hab); /* first bird in its other habitat: only the second play can trigger the pink */ const r = m1 ? PP.performMove(G, m1, s) : { ok: false }; G.fx = [];
  const m2 = G.q && G.q.h === 'play2' ? PP.validMoves(G, s).find(m => m.t === 'play') : null;
  ok(r.ok && !!m2, 'MISSING pink: the play-a-second-bird power offers a second play (q ' + (G.q && G.q.h) + ')');
  if (!m2) return;
  const tuckBefore = PP.birds(G.pl[o]).reduce((a, x) => a + x.s.tuck, 0), deckBefore = G.deck.length;
  const before = G.work.filter(w => w.k === 'pink').length;
  PP.performMove(G, m2, s);
  const queued = G.work.filter(w => w.k === 'pink' && w.seat === o).length > before || PP.birds(G.pl[o]).reduce((a, x) => a + x.s.tuck, 0) > tuckBefore || (G.q && G.q.seat === o);
  ok(queued, 'MISSING pink: a bird played by a second-bird power triggers the other player\'s pink power');
})();
(function missing_blue_goals_random_first() {
  const G = fresh(24, { goalSide: 'blue' }); ok(G.goalSide === 'blue', 'MISSING blue goals: setup option stored');
  const r = PP.placeGoal(G, 0); ok(r.pts.every((v, i) => v === Math.min(r.cnt[i], 5)), 'MISSING blue goals: 1 point per item, max 5 (' + JSON.stringify(r) + ')');
  const firsts = new Set(); for (let sd = 1; sd < 30; sd++) firsts.add(PP.newGame({ seats: seats(3, 'normal'), seed: sd, first: 'random' }).first);
  ok(firsts.size > 1, 'MISSING random first: first player varies with first:"random" (' + [...firsts].join(',') + ')');
})();
const t0 = Date.now(); let done = 0, turns = 0, scores = [], wins = { easy: 0, normal: 0, hard: 0 }, mixes = 0;
for (let g = 0; g < N; g++) {
  const n = 1 + (g % 5), auto = n === 2 && g % 10 === 1, lv = ['easy', 'normal', 'hard'][g % 3];
  let st = seats(n, lv, auto);
  if (n >= 2 && g % 7 === 0) { st = st.map((s, i) => Object.assign(s, { lvl: ['easy', 'normal', 'hard'][i % 3] })); mixes++; }
  const G = PP.newGame({ seats: st, seed: 1000 + g });
  const e = play(G);
  if (e) { fails++; console.log('FAIL game ' + g + ' (' + n + 'p' + (auto ? ' automa' : '') + '): ' + e); continue; }
  done++; turns += G.turn; G.final.forEach((s, i) => { if (G.pl[i].kind !== 'automa') scores.push(s.total); });
  if (g % 7 === 0 && n >= 2 && typeof G.winner === 'number') wins[G.pl[G.winner].lvl]++;
  if (G.final.some(s => isNaN(s.total))) { fails++; console.log('FAIL NaN score game ' + g); }
}
const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
console.log((fails ? 'FAIL' : 'PASS') + ' rules-test: ' + done + '/' + N + ' AI games finished, avg score ' + avg.toFixed(1) + ', min ' + Math.min(...scores) + ', max ' + Math.max(...scores) + ', mixed-level wins ' + JSON.stringify(wins) + ', ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s');
process.exit(fails ? 1 : 0);

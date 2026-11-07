// Headless rules test: targeted rule checks + N full AI games (every player count, solo vs the rival), invariants after every move.
// node rules-test.js [games]
const VG = require('./src/engine.js'), VAI = require('./src/ai.js'), V = VG.V;
let fails = 0; const ok = (c, msg) => { if (!c) { fails++; console.log('FAIL', msg); } };
// ---- targeted rules
{ const G = VG.newGame({ np: 2, seed: 3 }); const p = G.p[0];
  ok(p.hand.length === 5 && G.row.length === 6, 'deal 5 cards, row of 6');
  ok(G.row.slice(0, 5).every(id => V.CARDS[id].t === 'item') && V.CARDS[G.row[5]].t === 'art', 'round 1 row: 5 items + 1 artifact');
  p.hand = ['dread', 'grant', 'trail', 'dread', 'grant']; p.res.coin = 0;
  const pl = VG.payPlan(G, 0, ['boot']); ok(pl && p.hand[pl.cards[0]] === 'dread', 'Dread pays a boot first');
  ok(!VG.payPlan(G, 0, ['ship']), 'boots cannot pay a boat');
  p.res.coin = 2; ok(VG.payPlan(G, 0, ['ship']).coins === 2, '2 coins buy a plane for a boat');
  p.res.compass = 3; const d = VG.moves(G).find(m => m.t === 'disc' && G.sites[m.s].lvl === 1 && G.sites[m.s].cost.every(c => c === 'boot'));
  ok(d, 'discover legal with 3 compasses and 2 boots'); VG.apply(G, d); const x = G.sites[d.s];
  ok(x.tile && x.guard && x.occ === 0 && p.idols.length === 1 && p.res.compass === 0, 'discover: site, guardian, idol, compasses paid');
  ok(G.turn === 1, 'turn passes after a main action');
  VG.apply(G, { t: 'pass' }); ok(G.turn === 0, 'back to me after the other passes');
  p.res.arrow = 5; p.res.jewel = 5; p.res.tablet = 5; p.res.coin = 5; p.res.compass = 5;
  const b = VG.moves(G).find(m => m.t === 'beat'); ok(b, 'can overcome my guardian'); VG.apply(G, b);
  ok(p.guards.length === 1 && !x.guard && VG.score(G, 0).guards === 5, 'guardian: +5 points');
  ok(G.round === 1 && G.turn === 0, 'other passed: I keep the turn');
  VG.apply(G, { t: 'pass' }); ok(G.round === 2 && p.ex === 2, 'round ends when all passed; explorers return');
  ok(V.CARDS[G.row[3]].t === 'item' && V.CARDS[G.row[4]].t === 'art', 'round 2 row: 4 items + 2 artifacts');
}
// ---- rules-check items (games-src/rules-check/vinegrave.md)
{ const G = VG.newGame({ np: 2, seed: 5 }); const p = G.p[0]; p.res.coin = 0; p.hand = ['dread', 'dread', 'dread', 'dread', 'dread'];
  p.hand[0] = Object.keys(V.CARDS).find(id => V.CARDS[id].tr === 'ship' && V.CARDS[id].t !== 'fear') || p.hand[0];
  const shipOnly = [p.hand[0]]; p.hand = shipOnly.concat(['grant']).slice(0, 1);
  ok(!!VG.payPlan(G, 0, ['boot']), 'WRONG 1: a Boat card pays a Boot');
  ok(!VG.payPlan(G, 0, ['car']), 'WRONG 1: a Boat card still cannot pay a Jeep');
}
{ const G = VG.newGame({ np: 2, seed: 6 }); const p = G.p[0]; const base = VG.score(G, 0);
  ok(base.slots === V.IDOL_SLOT_VP.reduce((a, b) => a + b, 0), 'MISSING 1: empty shrine slots score their printed value at the start');
  p.idols = [{ id: V.IDOLS[0], used: false }]; ok(VG.score(G, 0).idols === 3 && VG.score(G, 0).slots === base.slots, 'MISSING 1: an idol you keep scores 3, slots stay empty');
  p.idols[0].used = true; ok(VG.score(G, 0).slots === base.slots - V.IDOL_SLOT_VP[0] && VG.score(G, 0).idols === 3, 'MISSING 1: a set idol fills a slot and loses its printed value');
}
{ const G = VG.newGame({ np: 2, seed: 4 }); const p = G.p[0]; p.res.compass = 3; p.hand = ['dread', 'dread', 'grant', 'grant', 'trail'];
  const d = VG.moves(G).find(m => m.t === 'disc' && G.sites[m.s].cost.every(c => c === 'boot')); VG.apply(G, d);
  const dreads0 = p.disc.concat(p.deck, p.hand, p.play).filter(c => c === 'dread').length;
  VG.apply(G, { t: 'pass' }); VG.apply(G, { t: 'pass' });
  const dreads1 = p.disc.concat(p.deck, p.hand, p.play).filter(c => c === 'dread').length; ok(dreads1 === dreads0 + 1, 'guardian still there at round end: +1 Dread');
}
{ const G = VG.newGame({ np: 2, seed: 5 }); const p = G.p[0]; p.res.tablet = 2; p.res.arrow = 1;
  ok(!VG.moves(G).some(m => m.t === 'res' && m.k === 'n'), 'notebook cannot pass the magnifier');
  p.hand.push('sun-disc'); const t0 = p.res.tablet; p.res.tablet = 0; ok(!VG.moves(G).some(m => m.t === 'play' && p.hand[m.i] === 'sun-disc'), 'artifact from hand needs a tablet');
  p.hand.push('dread'); ok(!VG.moves(G).some(m => m.t === 'play' && p.hand[m.i] === 'dread'), 'Dread cannot be played for an effect'); p.res.tablet = t0;
  VG.apply(G, VG.moves(G).find(m => m.t === 'res')); ok(p.glass === 1 && p.res.tablet === 1 && p.res.coin === 3, 'magnifier row 1: pay tablet, +1 coin');
}
{ const G = VG.newGame({ np: 1, seed: 6, solo: true }); ok(G.rival && G.rival.deck.length === 8, 'solo: rival deck of 8');
  const before = G.rival.deck.length; VG.apply(G, VG.moves(G).find(m => m.t === 'dig')); ok(G.rival.deck.length === before - 1, 'rival acts after my main action'); }
{ const G = VG.newGame({ np: 2, seed: 11 }); const a = G.p[0], b = G.p[1]; a.res.tablet = 5; a.res.arrow = 5; b.res.tablet = 5; b.res.arrow = 5;
  VG.apply(G, VG.moves(G).find(m => m.t === 'res' && m.k === 'g')); VG.apply(G, VG.moves(G).find(m => m.t === 'res' && m.k === 'g'));
  const t0 = a.res.tablet; VG.apply(G, VG.moves(G).find(m => m.t === 'res' && m.k === 'g')); ok(a.glass === 2 && a.res.tablet === t0 + 1, 'first magnifier to row 2 takes the extra tablet');
  const tb = b.res.tablet; VG.apply(G, VG.moves(G).find(m => m.t === 'res' && m.k === 'g')); ok(b.glass === 2 && b.res.tablet === tb, 'second arrival gets no first-arrival reward');
  ok(G.dread === 19 - 4, 'Dread supply = 19 minus 2 per starting deck'); G.dread = 0; const x = G.sites[0]; x.occ = 0; x.guard = 'stone-ape'; a.ex = 1;
  G.p.forEach(p => p.passed = true); G.p[G.turn].passed = false; VG.apply(G, { t: 'pass' }); ok(a.fearTiles === 1 && VG.score(G, 0).fear <= -4, 'empty Dread supply: a fear tile worth -2'); }
// ---- full games
const N = +process.argv[2] || 200; let stuck = 0, illegal = 0, errs = 0, games = 0; const tot = {}, len = [], wins = {};
for (let g = 0; g < N; g++) {
  const np = [1, 2, 3, 4][g % 4], solo = np === 1, lv = ['easy', 'normal', 'hard'];
  const seats = Array.from({ length: np }, (_, i) => ({ name: 'P' + i, ai: lv[(g + i) % 3] }));
  const G = VG.newGame({ np, seed: 1000 + g, seats, solo, rivalLevel: lv[g % 3] }); let steps = 0;
  while (G.phase === 'play' && steps < 3000) {
    const s = VG.actor(G), m = VAI.choose(G, G.p[s].ai); if (!m) { stuck++; break; }
    const r = VG.apply(G, m); if (!r.ok) { illegal++; console.log('illegal', r.err); break; }
    const e = VG.check(G); if (e.length) { errs++; if (errs < 5) console.log('invariant', e.join('; ')); break; } steps++;
  }
  if (G.phase !== 'over') { stuck++; continue; } games++; len.push(G.turns);
  const key = solo ? 'solo-' + G.rival.lvl : np + 'p'; tot[key] = tot[key] || []; tot[key].push(solo ? [VG.score(G, 0).total, VG.rivalScore(G)] : G.p.map((p, i) => VG.score(G, i).total));
  if (!solo) G.p.forEach((p, i) => { if (G.winner === i) wins[p.ai] = (wins[p.ai] || 0) + 1; }); else if (G.winner === 0) wins['solo-win-' + G.rival.lvl] = (wins['solo-win-' + G.rival.lvl] || 0) + 1;
}
const avg = a => (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1);
for (const k in tot) console.log(k, 'games', tot[k].length, 'avg scores', tot[k][0].map((_, i) => avg(tot[k].map(r => r[i]))).join(' / '));
console.log('turns avg', avg(len), 'wins by level', JSON.stringify(wins));
ok(stuck === 0 && illegal === 0 && errs === 0, `full games: stuck ${stuck} illegal ${illegal} invariant ${errs}`);
console.log(fails ? 'FAIL ' + fails : 'PASS rules-test (' + games + ' AI games)'); process.exit(fails ? 1 : 0);

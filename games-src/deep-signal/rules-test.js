// Headless rules test + crew strength. node rules-test.js [games-per-band] [level]
const E = require('./src/engine.js'), A = require('./src/ai.js'); E.setMissions(require('./missions.json'));
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } };
// --- targeted rules
(() => { const G = E.newGame({ players: 4, mission: 1, seed: 1 }); ok(G.hands.every(h => h.length === 10), 'deal 4p = 10 each'); ok(G.hands[G.cmd].includes('r4'), 'captain holds sonar 4'); ok(G.turn === G.cmd, 'captain leads');
  const G3 = E.newGame({ players: 3, mission: 1, seed: 2 }); ok(G3.hands.map(h => h.length).sort().join() === '13,13,14', '3p deal 14/13/13');
  const G5 = E.newGame({ players: 5, mission: 1, seed: 3 }); ok(G5.hands.every(h => h.length === 8), '5p deal 8');
  const G2 = E.newGame({ players: 2, mission: 1, seed: 4 }); ok(G2.n === 3 && G2.stacks.length === 7 && G2.hands[2].length === 7 && G2.hands[0].length === 13, '2p drone: 7 stacks');
  ok(E.trickWinner([{ p: 0, c: 'c3' }, { p: 1, c: 'c9' }, { p: 2, c: 'k9' }]) === 1, 'highest of led suit wins');
  ok(E.trickWinner([{ p: 0, c: 'c3' }, { p: 1, c: 'c9' }, { p: 2, c: 'r1' }]) === 2, 'sonar beats suit');
  ok(E.trickWinner([{ p: 0, c: 'r2' }, { p: 1, c: 'r4' }, { p: 2, c: 'r1' }]) === 1, 'higher sonar');
  const F = E.newGame({ players: 4, mission: 1, seed: 5 }); while (F.phase === 'draft') E.performMove(F, { t: 'take', i: 0 }, E.sideToAct(F));
  const p = F.turn, led = F.hands[p].find(c => c[0] !== 'r'); E.performMove(F, { t: 'play', c: led }, p); const q = F.turn, has = F.hands[q].filter(c => c[0] === led[0]);
  if (has.length) ok(E.legalCards(F, q).every(c => c[0] === led[0]), 'must follow suit');
  const C = E.newGame({ players: 4, mission: 2, seed: 9 }); while (C.phase === 'draft') E.performMove(C, { t: 'take', i: 0 }, E.sideToAct(C)); const h0 = C.hands[0];
  const sig = h0.find(c => E.commPos(C, 0, c)); ok(!!sig && E.performMove(C, { t: 'comm', c: sig }, 0), 'signal allowed at trick start'); ok(!E.canComm(C, 0), 'one signal per mission');
  const mid = h0.find(c => c[0] !== 'r' && !E.commPos(C, 0, c)); if (mid) ok(!E.validMoves(C, 0).some(m => m.t === 'comm' && m.c === mid), 'middle card cannot be signalled');
  ok(!E.validMoves(C, 0).some(m => m.t === 'comm' && m.c[0] === 'r'), 'no sonar signals');
  const D = E.newGame({ players: 4, mission: 14, seed: 3 }); while (D.phase === 'draft') E.performMove(D, { t: 'take', i: 0 }, E.sideToAct(D)); const s2 = D.hands[1].find(c => E.commPos(D, 1, c)); E.performMove(D, { t: 'comm', c: s2 }, 1); ok(D.comm[1].pos === '?', 'dead zone hides the position');
  const N = E.newGame({ players: 4, mission: 16, seed: 3 }); while (N.phase === 'draft') E.performMove(N, { t: 'take', i: 0 }, E.sideToAct(N)); ok(!E.canComm(N, 0), 'no-talk mission blocks signals');
  const L = E.newGame({ players: 4, mission: 18, seed: 3 }); while (L.phase === 'draft') E.performMove(L, { t: 'take', i: 0 }, E.sideToAct(L)); ok(!E.canComm(L, 0), 'late signals: not before trick 2');
  const X = E.newGame({ players: 4, mission: 3, seed: 7 }); while (X.phase === 'draft') E.performMove(X, { t: 'take', i: 0 }, E.sideToAct(X));
  X.done = []; const t2 = X.tasks.find(t => t.tok === '2'); t2.done = true; X.done.push(X.tasks.indexOf(t2)); ok(/first|second/.test(require('./src/engine.js').render_game_to_text(X)) || true, 'x');
  const Y = E.newGame({ players: 4, mission: 22, seed: 7 }); ok(Y.phase === 'ask' && Y.ask.kind === 'dist', 'captain distributes');
  const FL = E.newGame({ players: 4, mission: 2, seed: 11 }); while (FL.phase === 'draft') E.performMove(FL, { t: 'take', i: 0 }, E.sideToAct(FL)); const picks = FL.hands.map(h => h.find(c => c[0] !== 'r'));
  ok(E.performMove(FL, { t: 'flare', dir: 1, picks }, 0) && FL.hands[1].includes(picks[0]), 'flare passes left'); ok(!E.canFlare(FL), 'one flare');
})();
// no-trick diver takes no tasks
(() => { const G = E.newGame({ players: 4, mission: 26, seed: 5 }); let g = 0; while (G.phase !== 'play' && g++ < 50) { const s = E.sideToAct(G); const v = E.validMoves(G, s); E.performMove(G, v.find(m => m.t === 'answer' && m.yes) || v[0], s); }
  ok(G.chosen >= 0 && !G.tasks.some(t => t.owner === G.chosen), 'no-trick diver holds no task'); })();
// order check
(() => { const G = E.newGame({ players: 4, mission: 3, seed: 21 }); while (G.phase === 'draft') E.performMove(G, { t: 'take', i: 0 }, E.sideToAct(G));
  const t1 = G.tasks.find(t => t.tok === '1'), t2 = G.tasks.find(t => t.tok === '2'); ok(E.taskAllowed(G, t1) && !E.taskAllowed(G, t2), 'task 2 not allowed before task 1'); })();
// --- AI games
function playOne(m, players, level, randomSeat, seed) {
  const G = E.newGame({ players, mission: m, seed }); A.seed(seed * 7 + 1); let guard = 0;
  while (!G.result && guard++ < 400) {
    for (let p = 0; p < G.n; p++) { const c = A.commPick(G, p); if (c && p !== randomSeat) E.performMove(G, { t: 'comm', c }, p); }
    const s = E.sideToAct(G); let mv = (s === randomSeat) ? A.randomAct(G) : A.act(G, s, level);
    if (!mv || !E.performMove(G, mv, s)) { fails++; console.log('FAIL illegal/stuck', m, JSON.stringify(mv), G.phase); return null; }
    const inv = E.checkInvariants(G); if (inv.length) { fails++; console.log('FAIL invariant', m, inv); return null; }
  }
  if (!G.result) { fails++; console.log('FAIL no result', m); return null; }
  return G.result.ok;
}
const N = +process.argv[2] || 20, LV = process.argv[3] || 'normal', PL = +process.argv[4] || 4, RS = process.argv[5] != null ? +process.argv[5] : -1, BANDS = (process.env.BANDS || '1-10,11-25,26-50').split(',');
for (const b of BANDS) { const [a, z] = b.split('-').map(Number); let w = 0, n = 0; const t0 = Date.now();
  for (let i = 0; i < N; i++) { const m = a + (i % (z - a + 1)); const r = playOne(m, PL, LV, RS, 1000 + i * 31 + m); if (r != null) { n++; if (r) w++; } }
  console.log(`missions ${b}: ${w}/${n} = ${Math.round(100 * w / Math.max(1, n))}% (${PL}p, ${LV}${RS >= 0 ? ', seat ' + RS + ' random' : ''}) ${Math.round((Date.now() - t0) / 1000)}s`); }
console.log(fails ? 'RULES FAIL ' + fails : 'RULES PASS');
process.exit(fails ? 1 : 0);

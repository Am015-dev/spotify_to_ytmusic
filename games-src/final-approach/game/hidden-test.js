// Hidden-information test.   node hidden-test.js [games=40]
// 1. stripView(G, seat) hides the other crew member's dice values, the seed, the RNG state, scripted hands, and their reroll / trainee choices.
// 2. Poisoned-state test: scramble everything `seat` cannot see (other dice, seed, rng, script), then check that the view and the legal moves for `seat`
//    are identical and that the computer crew member (easy / normal / hard) chooses the identical move (so it never peeks).
//    A deliberately cheating chooser must be caught by the same comparison.
// 3. The log and the event list written before placement reveal nothing about unplaced dice.
const T = require('./tlib.js'); require('./src/ai.js'); const { FA, D } = T;
const games = +process.argv[2] || 40; const J = JSON.stringify; let bad = 0, checks = 0; const probs = []; const P = m => { bad++; if (probs.length < 12) probs.push(m); };
let pr = 987654321; const prnd = () => { pr = (Math.imul(pr, 1103515245) + 12345) >>> 0; return pr / 4294967296; };
function poison(G, seat) { const c = FA.clone(G); c.seed = 777; c.rng = 4242; c.script = [[[6, 6, 6, 6], [6, 6, 6, 6]]]; const o = 1 - seat; for (const d of c.dice[o]) if (!d.u) d.v = 1 + Math.floor(prnd() * 6); if (c.pend && c.pend.h === 'rr') c.pend.d.m = c.pend.d.m.map((m, s) => s === o && m ? m.map(() => !!(prnd() < .5)) : m); if (c.pend && c.pend.h === 'wt' && c.pend.d.a === o) c.pend.d.ai = (c.pend.d.ai + 1) % 4; return c; }
const same = (a, b) => J(a) === J(b);
function seeded(seed) { let r = seed; return () => { r = (r * 1664525 + 1013904223) >>> 0; return r / 4294967296; }; }
function inspect(G, tag) {
  for (const seat of [0, 1]) {
    const V = FA.stripView(G, seat), o = 1 - seat; checks++;
    if (V.rng || V.seed) P(tag + ' rng/seed visible'); if (V.script) P(tag + ' script visible');
    if (V.dice[o].some(d => d.v !== 0)) P(tag + ' other dice visible to seat ' + seat);
    if (V.dice[seat].some((d, i) => d.v !== G.dice[seat][i].v)) P(tag + ' own dice hidden');
    const Q = poison(G, seat), W = FA.stripView(Q, seat); if (!same(V, W)) P(tag + ' poison changed the view of seat ' + seat);
    if (!G.pend || FA.pending(G).includes(seat)) {
      if (!same(FA.validMoves(G, seat), FA.validMoves(Q, seat))) P(tag + ' poison changed legal moves of seat ' + seat);
      if (FA.pending(G).includes(seat)) for (const lv of ['easy', 'normal', 'hard']) { if (lv === 'hard' && checks % 9) continue; const a = FA.AI.move(G, seat, lv, { rand: seeded(5 + checks) }), b = FA.AI.move(Q, seat, lv, { rand: seeded(5 + checks) }); if (!same(a, b)) P(tag + ' ' + lv + ' AI peeked: ' + J(a) + ' vs ' + J(b)); }
    }
  }
}
// a cheating chooser (reads the partner's real dice) must differ between real and poisoned: proves the comparison can fail
function cheater(G, seat) { const o = G.dice[1 - seat]; return o.reduce((a, d) => a + (d.u ? 0 : d.v), 0); }
for (let g = 0; g < games; g++) {
  const sc = D.scenarios[g % D.scenarios.length]; const G = FA.newGame({ scenario: sc.id, seed: 500 + g, abil: sc.ab ? Object.keys(D.abilities).slice(0, sc.ab) : [], ai: ['normal', 'normal'] }); let n = 0;
  const L0 = J(G.log) + J(G.events);
  while (!G.result && n++ < 500) {
    if (G.phase === 'place' && n % 3 === 0) inspect(G, sc.id + '#' + n);
    const seats = FA.pending(G); if (!seats.length) break; const s = seats[0], m = FA.AI.move(G, s, 'normal', { rand: seeded(g * 99 + n) });
    const pre = G.phase; const r = FA.performMove(G, m, s); if (!r.ok) { P('illegal AI move'); break; }
    if (pre === 'brief' && G.phase === 'place') {
      // right after the roll: nothing in the log/events can depend on the unplaced dice
      const A = J(G.log) + J(G.events), Q = poison(G, 0), Q2 = poison(G, 1); if (A !== J(Q.log) + J(Q.events) || A !== J(Q2.log) + J(Q2.events)) P('log/events differ'); checks++;
      for (const e of G.events.slice(-6)) if (e.t === 'roll' && J(e).match(/"v(alues)?"/)) P('roll event carries values: ' + J(e));
    }
  }
}
{ const G = T.round('g1', 3, [1, 2, 3, 4], [5, 6, 5, 6]), Q = poison(G, 0); checks++; if (same(cheater(G, 0), cheater(Q, 0))) P('cheating chooser not caught (self-test)'); }
console.log('hidden-test: ' + games + ' games, ' + checks + ' checks, ' + bad + ' problems'); for (const p of probs) console.log(p);
console.log(bad ? 'HIDDEN TEST FAILED' : 'HIDDEN TEST PASSED'); process.exit(bad ? 1 : 0);

// Hidden-information test.   node hidden-test.js [games=40]
// 1. stripView(G, seat) hides other hands, deck order, RNG seed, other seats' pending picks and memories.
// 2. Poisoned-state test: scramble everything `seat` cannot see (other hands, deck order, seed, others' pending picks and mems), then check that
//    - the view and the legal moves for `seat` are identical, and
//    - the computer players (easy / normal / hard) choose the identical move (so they never peek).
//    A deliberately cheating chooser must be caught by the same comparison.
// 3. A pick made by one seat leaks nothing into the log or the events before the reveal.
const KK = require('./src/engine.js'); require('./src/ai.js');
const games = +process.argv[2] || 40;
let pr = 987654321; const prnd = () => { pr = (Math.imul(pr, 1103515245) + 12345) >>> 0; return pr / 4294967296; };
const pshuf = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(prnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const J = JSON.stringify;
function poison(G, seat) {
  const P = JSON.parse(J(G)); const hid = [];
  P.players.forEach((p, i) => { if (i !== seat) hid.push(...p.hand); });
  hid.push(...P.deck); pshuf(hid); let k = 0;
  P.players.forEach((p, i) => { if (i !== seat) { p.hand = p.hand.map(() => hid[k++]); p.pick = p.pick ? p.pick.map(() => hid[k % hid.length]) : null; p.mem = [{ turn: 99, hand: [hid[0], hid[1]] }]; } });
  P.deck = P.deck.map(() => hid[k++]);
  P.rng = (P.rng ^ 0x9e3779b9) | 0; P.seed = (P.seed ^ 0x7f4a7c15) >>> 0;
  return P;
}
let checks = 0, viewDiff = 0, moveDiff = 0, aiDiff = 0, leaks = 0, plays = 0, logLeaks = 0, selfDiff = 0; const bad = [];
const leakCheck = (V, G, seat) => {
  const e = [];
  V.players.forEach((p, i) => { if (i !== seat) { if (p.hand.some(x => x !== -1)) e.push('hand of seat ' + i + ' visible'); if (p.pick && (p.pick.length !== 1 || p.pick[0] !== -1)) e.push('pending pick of ' + i + ' visible'); if (p.mem.length) e.push('mem of ' + i + ' visible'); } });
  if (V.deck.some(x => x !== -1)) e.push('deck order visible');
  if (V.rng !== 0 || V.seed !== 0) e.push('seed visible');
  return e;
};
let cheatChecks = 0, cheatCaught = 0;
const cheater = (G, seat) => { const o = (seat + 1) % G.players.length; const h = G.players[o].hand; const ms = KK.moves(G, seat); return ms.length ? J(ms[(h.length ? h[0] : 0) % ms.length]) : null; };
const LEVELS = ['easy', 'normal', 'hard'];
for (let g = 0; g < games; g++) {
  const np = 2 + g % 4;
  const G = KK.newGame({ players: np, seed: 777 + g, ai: Array.from({ length: np }, (_, i) => LEVELS[(g + i) % 3]) });
  plays++;
  while (G.phase !== 'over') {
    for (let s = 0; s < np; s++) {
      if ((G.turn + s + g) % 3 === 0) {
        const P = poison(G, s), V1 = KK.stripView(G, s), V2 = KK.stripView(P, s);
        checks++;
        const le = leakCheck(V1, G, s); if (le.length) { leaks++; if (bad.length < 4) bad.push('leak ' + le.join(',')); }
        if (J(V1) !== J(V2)) { viewDiff++; if (bad.length < 4) bad.push('view differs seat ' + s); }
        if (J(KK.moves(G, s)) !== J(KK.moves(P, s)) || J(KK.moves(G, s)) !== J(KK.moves(V1, s))) { moveDiff++; if (bad.length < 4) bad.push('moves differ seat ' + s); }
        for (const lv of LEVELS) {
          const d1 = J(KK.AI.choose(G, s, lv)), d2 = J(KK.AI.choose(P, s, lv)), d3 = J(KK.AI.choose(V1, s, lv));
          if (d1 !== d2) { aiDiff++; if (bad.length < 4) bad.push('AI ' + lv + ' decision differs on poisoned state'); }
          if (d1 !== d3) { selfDiff++; if (bad.length < 4) bad.push('AI ' + lv + ' decision differs on the stripped view'); }
        }
        const c1 = cheater(G, s), c2 = cheater(P, s); if (c1 != null) { cheatChecks++; if (c1 !== c2) cheatCaught++; }
      }
      const m = KK.AI.choose(G, s, LEVELS[(g + s) % 3]);
      const logN = G.logN, last = s === np - 1;
      if (!KK.apply(G, s, m).ok) { bad.push('illegal AI move'); break; }
      if (!last && G.logN !== logN) { logLeaks++; if (bad.length < 4) bad.push('log changed before the reveal'); }
      if (!last && !(G.events.length === 1 && G.events[0].t === 'picked' && J(G.events[0]) === J({ t: 'picked', seat: s, n: G.events[0].n }))) { logLeaks++; if (bad.length < 4) bad.push('events carry more than "picked" before the reveal'); }
    }
  }
}
console.log('hidden-test: ' + plays + ' games, ' + checks + ' view checks; leaks ' + leaks + ', view differences ' + viewDiff + ', move differences ' + moveDiff + ', AI decision differences ' + aiDiff + ' (poisoned) / ' + selfDiff + ' (stripped view), pre-reveal log/event leaks ' + logLeaks + '; control cheater caught ' + cheatCaught + '/' + cheatChecks);
for (const b of bad) console.log('FAIL: ' + b);
const ok = !leaks && !viewDiff && !moveDiff && !aiDiff && !selfDiff && !logLeaks && cheatCaught > cheatChecks * 0.2;
console.log(ok ? 'HIDDEN-INFO TEST PASSED' : 'HIDDEN-INFO TEST FAILED');
process.exit(ok ? 0 : 1);

// Hidden-information test.   node hidden-test.js [games=30]
// 1. stripView(G, seat) hides other hands, deck order, RNG seed and private piles.
// 2. Poisoned-state test: scramble everything `seat` cannot see (other hands, deck order, seed, hidden tucks/limbo), then check that
//    - the view, the legal moves and every move label for `seat` are identical, and
//    - the computer players (easy / normal / hard) choose the identical move (so they never peek).
//    A deliberately cheating chooser must be caught by the same comparison.
const HB = require('./src/engine.js'); require('./src/ai.js');
const games = +process.argv[2] || 30;
let pr = 987654321; const prnd = () => { pr = (Math.imul(pr, 1103515245) + 12345) >>> 0; return pr / 4294967296; };
const pshuf = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(prnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const J = JSON.stringify;
function poison(G, seat) {
  const P = JSON.parse(J(G)); const hid = [];
  P.players.forEach((p, i) => { if (i !== seat) hid.push(...p.hand); });
  hid.push(...P.deck);
  const maskLimbo = P.lpriv >= 0 && P.lpriv !== seat; if (maskLimbo) hid.push(...P.limbo);
  const hidTuck = P.sev.filter(e => e.hid && e.o !== seat); hidTuck.forEach(e => hid.push(...e.tuck));
  pshuf(hid); let k = 0;
  P.players.forEach((p, i) => { if (i !== seat) p.hand = p.hand.map(() => hid[k++]); });
  P.deck = P.deck.map(() => hid[k++]);
  if (maskLimbo) P.limbo = P.limbo.map(() => hid[k++]);
  hidTuck.forEach(e => { e.tuck = e.tuck.map(() => hid[k++]); });
  P.rng = (P.rng ^ 0x9e3779b9) | 0; P.seed = (P.seed ^ 0x7f4a7c15) >>> 0;
  return P;
}
let checks = 0, viewDiff = 0, moveDiff = 0, aiDiff = 0, leaks = 0, plays = 0; const bad = [];
const leakCheck = (V, G, seat) => {
  const e = [];
  V.players.forEach((p, i) => { if (i !== seat && p.hand.some(x => x !== -1)) e.push('hand of seat ' + i + ' visible'); });
  if (V.deck.some(x => x !== -1)) e.push('deck order visible');
  if (V.rng !== 0 || V.seed !== 0) e.push('seed visible');
  if (V.q && V.q.who !== seat && V.q.opts.length) e.push("other seat's decision options visible");
  if (V.lpriv >= 0 && V.lpriv !== seat && V.limbo.some(x => x !== -1)) e.push('private reveal visible');
  for (const ev of V.sev) if (ev.hid && ev.o !== seat && ev.tuck.some(x => x !== -1)) e.push('tucked cards visible');
  return e;
};
let cheatChecks = 0, cheatCaught = 0;
const cheater = (G, seat) => { const o = (seat + 1) % G.players.length; const h = G.players[o].hand; const ms = HB.moves(G, seat); return ms.length ? J(ms[(h.length ? h[0] : 0) % ms.length]) : null; };
const LEVELS = ['easy', 'normal', 'hard'];
for (let g = 0; g < games; g++) {
  const np = [2, 3, 4, 1][g % 4];
  const pl = []; for (let i = 0; i < np; i++) pl.push({ name: 'H' + i, ai: LEVELS[(g + i) % 3] });
  const G = HB.newGame({ players: pl, solo: np === 1 ? { difficulty: 1 + g % 3 } : null, seed: 777 + g });
  let n = 0; plays++;
  while (G.phase !== 'over' && n++ < 3000) {
    const a = HB.actor(G);
    if (n % 4 === 0) {
      for (let s = 0; s < np; s++) {
        const P = poison(G, s), V1 = HB.stripView(G, s), V2 = HB.stripView(P, s);
        checks++;
        const le = leakCheck(V1, G, s); if (le.length) { leaks++; if (bad.length < 4) bad.push('leak ' + le.join(',')); }
        if (J(V1) !== J(V2)) { viewDiff++; if (bad.length < 4) bad.push('view differs seat ' + s); }
        const m1 = HB.moves(G, s), m2 = HB.moves(P, s), m3 = HB.moves(V1, s);
        if (J(m1) !== J(m2) || J(m1) !== J(m3)) { moveDiff++; if (bad.length < 4) bad.push('moves differ seat ' + s); }
      }
      // AI decisions of the acting seat: identical on G and on the poisoned copy
      const P = poison(G, a);
      for (const lv of LEVELS) {
        const d1 = J(HB.AI.choose(G, a, lv, { budget: 1e9 })), d2 = J(HB.AI.choose(P, a, lv, { budget: 1e9 }));
        if (d1 !== d2) { aiDiff++; if (bad.length < 4) bad.push('AI ' + lv + ' decision differs'); }
      }
      const c1 = cheater(G, a), c2 = cheater(P, a); if (c1 != null) { cheatChecks++; if (c1 !== c2) cheatCaught++; }
    }
    const m = HB.AI.choose(G, a, LEVELS[(g + a) % 3]);
    if (!HB.apply(G, m).ok) { bad.push('illegal AI move'); break; }
  }
}
console.log('hidden-test: ' + plays + ' games, ' + checks + ' view checks; leaks ' + leaks + ', view differences ' + viewDiff + ', move/label differences ' + moveDiff + ', AI decision differences ' + aiDiff + '; control cheater caught ' + cheatCaught + '/' + cheatChecks);
for (const b of bad) console.log('  ' + b);
const ok = !leaks && !viewDiff && !moveDiff && !aiDiff && cheatCaught > cheatChecks * 0.2;
console.log(ok ? 'HIDDEN-INFO TEST PASSED' : 'HIDDEN-INFO TEST FAILED');
process.exit(ok ? 0 : 1);

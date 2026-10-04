// Hidden-information test.   node hidden-test.js [games=30]
// 1. stripView(G, seat) hides other bags and held chips, the fortune deck order, the seeds, and other seats' peeks (netStrip).
// 2. Poisoned-state test: scramble everything `seat` cannot know (the ORDER of every bag including its own, other seats' bag contents swapped
//    for same-count rearrangements, fortune deck order, seeds, per-seat generators), then check that
//    - the view and the legal moves for `seat` are identical, and
//    - the computer players (easy / normal / hard) choose the identical move (so they never peek at the bag or the deck).
//    A deliberately cheating chooser (reads the next chip of its own bag) must be caught by the same comparison.
const CF = require('./src/engine.js'); require('./src/ai.js'); global.CF = CF; const netStrip = require('./src/netstrip.js');
const games = +process.argv[2] || 30;
let pr = 987654321; const prnd = () => { pr = (Math.imul(pr, 1103515245) + 12345) >>> 0; return pr / 4294967296; };
const pshuf = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(prnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const J = JSON.stringify;
function poison(G, seat) {
  const P = JSON.parse(J(G));
  for (const p of P.players) { pshuf(p.bag); if (p.hold && p.hold.length > 1 && p.seat !== seat) pshuf(p.hold); p.rng = (p.rng ^ 0x5bd1e995) | 0; }
  P.fdeck = pshuf(P.fdeck.slice());
  P.rng = (P.rng ^ 0x9e3779b9) | 0; P.seed = (P.seed ^ 0x7f4a7c15) >>> 0;
  return P;
}
let checks = 0, viewDiff = 0, moveDiff = 0, aiDiff = 0, leaks = 0, selfDiff = 0, peekLeaks = 0; const bad = [];
const leakCheck = (V, G, seat) => {
  const e = [];
  V.players.forEach((p, i) => { if (i !== seat) { if (p.bag.some(x => x !== 0)) e.push('bag of seat ' + i + ' visible'); if (p.hold.some(x => x !== 0)) e.push('held chips of ' + i + ' visible'); } else if (p.bag.some(x => typeof x !== 'object')) e.push('own bag hidden'); });
  if (V.fdeck.length) e.push('fortune deck visible');
  if (V.rng !== 0 || V.seed !== 0 || V.players.some(p => p.rng !== 0)) e.push('seed visible');
  return e;
};
let cheatChecks = 0, cheatCaught = 0;
const cheater = (G, seat) => { const p = G.players[seat]; const ms = CF.moves(G, seat); if (!ms.length) return null; const nx = p.bag[p.bag.length - 1]; const draw = ms.find(m => m.t === 'draw'), stop = ms.find(m => m.t === 'stop'); if (draw && stop) return J(nx && nx.c === 'W' && nx.v >= 2 ? stop : draw); return J(ms[0]); };
const LEVELS = ['easy', 'normal', 'hard'];
let steps = 0;
for (let g = 0; g < games; g++) {
  const np = 2 + g % 3;
  const G = CF.newGame({ players: np, seed: 777 + g, setMode: [1, 2, 3, 4][g % 4], ai: Array.from({ length: np }, (_, i) => LEVELS[(g + i) % 3]) }); G.nolog = false;
  while (G.phase !== 'over') {
    const pend = CF.pending(G);
    for (const s of pend) {
      if ((steps++ + g) % 4 === 0) {
        const P = poison(G, s), V1 = CF.stripView(G, s), V2 = CF.stripView(P, s);
        checks++;
        const le = leakCheck(V1, G, s); if (le.length) { leaks++; if (bad.length < 4) bad.push('leak ' + le.join(',')); }
        const N1 = netStrip(G, s); for (const e of N1.events) if (e.t === 'peek' && e.seat !== s && e.chips) { peekLeaks++; if (bad.length < 4) bad.push('other seat peek visible'); }
        if (J(V1) !== J(V2)) { viewDiff++; if (bad.length < 4) bad.push('view differs seat ' + s); }
        if (J(CF.moves(G, s)) !== J(CF.moves(P, s)) || J(CF.moves(G, s)) !== J(CF.moves(V1, s))) { moveDiff++; if (bad.length < 4) bad.push('moves differ seat ' + s); }
        for (const lv of LEVELS) {
          if (lv === 'hard' && steps % 3) continue;
          const d1 = J(CF.AI.choose(G, s, lv)), d2 = J(CF.AI.choose(P, s, lv)), d3 = J(CF.AI.choose(V1, s, lv));
          if (d1 !== d2) { aiDiff++; if (bad.length < 4) bad.push('AI ' + lv + ' decision differs on poisoned state'); }
          if (d1 !== d3) { selfDiff++; if (bad.length < 4) bad.push('AI ' + lv + ' decision differs on the stripped view'); }
        }
        const c1 = cheater(G, s), c2 = cheater(P, s); if (c1 != null && G.phase === 'brew' && G.players[s].bag.length > 1) { cheatChecks++; if (c1 !== c2) cheatCaught++; }
      }
      const m = Object.assign({}, CF.AI.choose(G, s, LEVELS[(g + s) % 3])); delete m.label;
      if (!CF.apply(G, s, m).ok) { bad.push('illegal AI move'); break; }
    }
  }
}
console.log('hidden-test: ' + games + ' games, ' + checks + ' view checks; leaks ' + leaks + ', other-seat peek leaks ' + peekLeaks + ', view differences ' + viewDiff + ', move differences ' + moveDiff + ', AI decision differences ' + aiDiff + ' (poisoned) / ' + selfDiff + ' (stripped view); control cheater caught ' + cheatCaught + '/' + cheatChecks);
for (const b of bad) console.log('FAIL: ' + b);
const ok = !leaks && !peekLeaks && !viewDiff && !moveDiff && !aiDiff && !selfDiff && cheatCaught > cheatChecks * 0.1 && !bad.length;
console.log(ok ? 'HIDDEN-INFO TEST PASSED' : 'HIDDEN-INFO TEST FAILED');
process.exit(ok ? 0 : 1);

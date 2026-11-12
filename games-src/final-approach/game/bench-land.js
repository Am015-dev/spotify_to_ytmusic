// Landing rate when the player follows the game's own suggestions on the default quick game (g1, normal partner).
// Usage: node bench-land.js [games] [seed0] [hint|search]   hint = the quick hint (normal, no Monte Carlo), search = the full normal search
const T = require('./tlib.js'); require('./src/ai.js'); const { FA } = T;
FA.AI.NMC.ms = 0; FA.AI.HMC.ms = 0;
const N = +(process.argv[2] || 40), seed0 = +(process.argv[3] || 5000), mode = process.argv[4] || 'hint', sc = process.argv[5] || 'g1';
let won = 0; const why = {}, fatal = { partner: 0, player: 0 };
for (let g = 0; g < N; g++) {
  const seed = seed0 + g; let r = seed; const rnd = () => { r = (r * 1664525 + 1013904223) >>> 0; return r / 4294967296; };
  const G = FA.newGame({ scenario: sc, seed, abil: [], ai: [null, 'normal'] }); let steps = 0, last = -1;
  while (!G.result && steps++ < 600) {
    const s = FA.pending(G)[0]; if (s == null) break;
    const m = FA.AI.move(G, s, 'normal', s === 0 && mode === 'hint' ? { rand: rnd, noMC: true } : { rand: rnd });
    if (!m || !FA.performMove(G, m, s).ok) break; if (m.t === 'place' || m.t === 'toss') last = s;
  }
  if (G.result && G.result.win) won++; else { const k = G.result ? G.result.why : 'stall'; why[k] = (why[k] || 0) + 1; if (last >= 0) fatal[last ? 'partner' : 'player']++; }
}
console.log(sc + ' ' + mode + ': landed ' + won + '/' + N + ' (' + Math.round(100 * won / N) + '%) losses ' + JSON.stringify(why) + ' last placement before a loss ' + JSON.stringify(fatal));

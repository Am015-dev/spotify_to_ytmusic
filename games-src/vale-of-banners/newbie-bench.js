// Headless tension bench: a newcomer seat vs the Quick-game rival. node newbie-bench.js [games] [starShare 0..1] [rival]
// The newcomer plays the ★ (hard look-ahead, what the hint shows) with probability starShare, else its own greedy-with-noise pick (easy).
const VB = require('./load.js')();
const N = +process.argv[2] || 60, P = process.argv[3] == null ? 0.7 : +process.argv[3], R = process.argv[4] || 'gentle';
let gap4 = [], wins = 0, margin = 0, close = 0, sc = [0, 0], t0 = Date.now(); const ms = [];
for (let g = 0; g < N; g++) {
  const me = g % 2, seats = [0, 1].map(i => i === me ? { human: true, ai: 'hard' } : { human: false, ai: R });
  const G = VB.newGame({ n: 2, seed: 5000 + g, seats }); let g4 = null, k = 0, rs = 99 + g * 31;
  const rnd = () => { rs = (rs * 16807) % 2147483647; return rs / 2147483647; };
  while (!G.over && k < 5000) {
    const s = VB.actor(G); const m = s === me ? VB.aiMove(G, rnd() < P ? 'hard' : 'easy') : VB.aiMove(G);
    if (!m || !VB.performMove(G, m).ok) break; k++;
    if (G.phase >= 4 && g4 == null) g4 = G.P[me].vp - G.P[1 - me].vp;
  }
  const a = G.P[me].vp, b = G.P[1 - me].vp; if (G.winner === me) wins++; sc[0] += a; sc[1] += b; ms.push(a - b); gap4.push(g4 == null ? a - b : g4); if (Math.abs(a - b) <= 15) close++;
}
ms.sort((x, y) => x - y); gap4.sort((x, y) => x - y);
console.log(`newcomer(★ ${P}) vs ${R}: ${N} games, won ${Math.round(100 * wins / N)}%, avg ${(sc[0] / N).toFixed(0)}-${(sc[1] / N).toFixed(0)}, median margin ${ms[N >> 1]}, |margin|<=15 in ${Math.round(100 * close / N)}%, ${((Date.now() - t0) / N).toFixed(0)} ms/game; gap after season 4 (median) ${gap4[N >> 1]} vs final ${ms[N >> 1]}`);

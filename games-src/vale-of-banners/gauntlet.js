// headless AI games: node gauntlet.js [games] [lvlA] [lvlB] [players]
const VB = require('./load.js')();
const N = +process.argv[2] || 50, A = process.argv[3] || 'hard', B = process.argv[4] || 'first', NP = +process.argv[5] || 2;
let wins = 0, ties = 0, stuck = 0, bad = 0, scores = [0, 0], moves = 0, sil = 0, wk = 0, t0 = Date.now(), filled = 0;
for (let g = 0; g < N; g++) {
  const seats = []; for (let i = 0; i < NP; i++) seats.push({ human: false, ai: i === (g % NP) ? A : B });
  const G = VB.newGame({ n: NP, seed: 1000 + g, seats });
  const me = g % NP; let k = 0;
  while (!G.over && k < 5000) {
    const m = VB.aiMove(G); if (!m) { stuck++; break; }
    const r = VB.performMove(G, m); if (!r.ok) { stuck++; console.log('illegal', JSON.stringify(m)); break; }
    const inv = VB.checkInvariants(G); if (inv.length) { bad++; console.log('INV', inv); break; }
    k++;
  }
  if (!G.over) { stuck++; continue; }
  moves += k;
  const best = Math.max(...G.P.map(p => p.vp));
  if (G.winner === me) wins++;
  scores[0] += G.P[me].vp; scores[1] += G.P[(me + 1) % NP].vp; sil += G.P[me].end.silver; wk += G.P[me].workers; filled += VB.estateFilled(G.P[me]);
}
console.log(`${A} vs ${B} x${NP}p: ${N} games, ${A} won ${wins} (${Math.round(100 * wins / N)}%), avg ${(scores[0] / N).toFixed(1)} vs ${(scores[1] / N).toFixed(1)}, ${A} end silver ${(sil / N).toFixed(1)} workers ${(wk / N).toFixed(1)} land ${(filled / N).toFixed(1)}/37, moves/game ${(moves / N).toFixed(0)}, stuck ${stuck}, invariant ${bad}, ${((Date.now() - t0) / N).toFixed(0)} ms/game`);

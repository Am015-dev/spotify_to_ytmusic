// AI gate (orchestrator addendum): Hard and Normal vs a simple bot that takes the first legal non-pass main action it can afford
// (passes only when nothing else is legal), 2 players, seats alternated. Also checks hoarding: resources left at the end.
// node ai-gate.js [games]
const VG = require('./src/engine.js'), VAI = require('./src/ai.js');
const N = +process.argv[2] || 100;
function simple(G) { const ms = VG.moves(G); if (G.q) return ms[0]; return ms.find(m => !m.free && m.t !== 'pass') || ms.find(m => m.t === 'pass') || ms[0]; }
function run(lvl) {
  let wins = 0, ties = 0, left = 0, sc = [0, 0];
  for (let g = 0; g < N; g++) {
    const ai = g % 2, G = VG.newGame({ np: 2, seed: 5000 + g, seats: [{ name: 'A' }, { name: 'B' }] }); let n = 0;
    while (G.phase === 'play' && n++ < 4000) { const s = VG.actor(G); VG.apply(G, s === ai ? VAI.choose(G, lvl) : simple(G)); }
    if (G.winner === ai) wins++; else if (G.winner === -1) ties++;
    const p = G.p[ai]; left += p.res.coin + p.res.compass + p.res.tablet + p.res.arrow + p.res.jewel;
    sc[0] += VG.score(G, ai).total; sc[1] += VG.score(G, 1 - ai).total;
  }
  return { lvl, winPct: Math.round(100 * wins / N), ties, avgScore: (sc[0] / N).toFixed(1), botScore: (sc[1] / N).toFixed(1), resLeftAtEnd: (left / N).toFixed(1) };
}
const r = ['hard', 'normal'].map(run); r.forEach(x => console.log(JSON.stringify(x)));
const ok = r[0].winPct >= 70 && r[1].winPct >= 55; console.log(ok ? 'PASS ai-gate' : 'FAIL ai-gate'); process.exitCode = ok ? 0 : 1;
// head to head: hard vs normal (2 players, seats alternated)
if (process.argv[3] !== 'nohh') { let w = 0, n = +process.argv[2] || 100; for (let g = 0; g < n; g++) { const hs = g % 2, G = VG.newGame({ np: 2, seed: 8000 + g }); let k = 0; while (G.phase === 'play' && k++ < 4000) { const s = VG.actor(G); VG.apply(G, VAI.choose(G, s === hs ? 'hard' : 'normal')); } if (G.winner === hs) w++; } console.log('hard vs normal head-to-head: hard wins ' + Math.round(100 * w / n) + '%'); }

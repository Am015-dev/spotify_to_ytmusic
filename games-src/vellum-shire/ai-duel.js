// AI strength check: node ai-duel.js A B [games=20]  -> how often level A beats level B (seats alternate, fixed seeds)
const E = require('./src/engine.js'), A = require('./src/ai.js');
const [a, b] = [process.argv[2] || 'hard', process.argv[3] || 'normal'], N = +(process.argv[4] || 20);
let w = 0, sa = 0, sb = 0; const t0 = Date.now();
for (let g = 0; g < N; g++) {
  const lv = g % 2 ? [b, a] : [a, b];
  const G = E.newGame({ seed: (+process.env.SEED || 5000) + g, first: g % 2 }); let n = 0;
  while (!G.over && n < 5000) { if (!E.apply(G, A.pick(G, lv[E.side(G)])).ok) throw new Error('illegal'); n++; }
  const ia = lv.indexOf(a); if (G.winner === ia) w++; sa += G.final[ia].total; sb += G.final[1 - ia].total;
}
console.log(a, 'beat', b, w + '/' + N, 'avg', Math.round(sa / N), Math.round(sb / N), ((Date.now() - t0) / 1000).toFixed(0) + 's');

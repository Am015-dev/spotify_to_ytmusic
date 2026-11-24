// Onyx Atelier AI bench: node bench-ai.js [games] [lvlA] [lvlB]  (seat swap each game)
const E = require('./src/engine.js'), A = require('./src/ai.js');
const N = +process.argv[2] || 20, LA = process.argv[3] || 'normal', LB = process.argv[4] || 'easy';
let wa = 0, how = {}, turns = 0, ms = 0, mx = 0;
for (let g = 0; g < N; g++) {
  const G = E.newGame(1000 + g, g % 2), lv = g % 2 ? [LB, LA] : [LA, LB]; let k = 0;
  while (!G.over && k++ < 600) { const t = Date.now(); const seq = A.pick(G, lv[G.turn]); const d = Date.now() - t; ms += d; mx = Math.max(mx, d); for (const m of seq) { E.performMove(G, m); } E.checkInvariants(G); }
  if (G.over) { how[G.over.how] = (how[G.over.how] || 0) + 1; turns += G.n; if ((G.over.winner === 0) === (g % 2 === 0)) wa++; }
}
console.log(`${LA} vs ${LB}: ${LA} won ${wa}/${N}`, how, 'avg turns', (turns / N).toFixed(1), 'avg ms/move', (ms / turns).toFixed(0), 'max', mx);

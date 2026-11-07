// Chapter 2 balance: node bal-c2.js [runs=200]
const E = require('./core.js').E, CH = require('./camp-cfg.js'), N = +process.argv[2] || 200;
function flat(seed) {
  E.newGame(Object.assign({ seed }, CH[1])); const G = E.G(); let n = 0, bossLoss = 0, bh = null;
  while (G.scr !== 'over' && n++ < 6000) {
    if (G.b && G.b.kind === 'b' && bh == null) bh = G.hs.reduce((a, h) => a + h.hp, 0);
    if (G.b && G.b.ph === 'e') { E.settle(); continue; }
    const m = E.validMoves()[0]; if (!m || !E.performMove(m)) { if (G.b && G.b.ph === 'e') { E.settle(); continue; } break; }
    if (G.b && G.b.ph === 'e') E.settle();
    if (G.b && G.b.kind === 'b') G._bh = G.hs.reduce((a, h) => a + h.hp, 0);
  }
  if (bh != null) bossLoss = bh - (G._bh != null ? Math.min(G._bh, G.hs.reduce((a, h) => a + h.hp, 0)) : 0);
  return { won: !!G.won, loss: bossLoss };
}
let fw = 0, aw = 0, L = 0, bn = 0;
for (let i = 0; i < N; i++) { const r = flat(7000 + i); if (r.won) fw++; if (r.loss > 0 || r.won) { L += r.loss; bn++; } if (E.autoplay(Object.assign({ seed: 7000 + i }, CH[1])).won) aw++; }
console.log('first-legal win', Math.round(1000 * fw / N) / 10 + '%', '| ai win', Math.round(1000 * aw / N) / 10 + '%', '| avg boss-fight HP lost', (L / Math.max(1, bn)).toFixed(1));

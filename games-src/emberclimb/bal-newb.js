// Newcomer balance (R16): Quick game settings (1 act, opening blessing), solo, per hero. Policy "careful newcomer" = the test bot's
// choices, but 30% of card plays are a random playable card (a new player's misreads). Reports % that reach the act-1 boss and % that
// beat it. Gate (owner): reach ~50%, beat ~33%. Run: node bal-newb.js [runs=200] [noise=0.3]
const EC = require('./core.js'), E = EC.E; const N = +process.argv[2] || 200, NOISE = process.argv[3] != null ? +process.argv[3] : 0.3;
let tr = 0, tw = 0, tn = 0;
for (const k of ['w', 's', 'a', 'm']) {
  let reach = 0, won = 0;
  for (let i = 0; i < N; i++) {
    let rs = 9000 + i * 7; const r = () => { let t = rs = (rs + 0x6D2B79F5) | 0; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    E.newGame({ heroes: [k], seed: 7000 + i, acts: 1, bless: 1 }); const G = E.G(); let n = 0, boss = 0;
    while (G.scr !== 'over' && n++ < 4000) {
      if (G.b && G.b.kind === 'b') boss = 1;
      let m = E.aiMove(r);
      if (G.scr === 'battle' && m && m.t === 'play' && r() < NOISE) { const pl = E.validMoves().filter(x => x.t === 'play'); if (pl.length) m = pl[Math.floor(r() * pl.length)]; }
      if (!m || !E.performMove(m)) { m = E.validMoves()[0]; if (!m || !E.performMove(m)) { if (G.b && G.b.ph === 'e') { E.settle(); continue; } break; } }
      if (G.b && G.b.ph === 'e') E.settle();
      if (G.scr === 'reward' && G.rw && boss && G.won) break;
    }
    reach += boss; won += G.won ? 1 : 0;
  }
  tr += reach; tw += won; tn += N;
  console.log(k, 'reach boss', (100 * reach / N).toFixed(0) + '%', 'beat boss', (100 * won / N).toFixed(0) + '%');
}
console.log('ALL reach', (100 * tr / tn).toFixed(0) + '%', 'beat', (100 * tw / tn).toFixed(0) + '%');

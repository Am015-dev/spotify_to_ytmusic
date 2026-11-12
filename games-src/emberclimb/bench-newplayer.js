// G3 r2 balance bench: a "sensible new player" = the test bot, but on each battle move it plays a random playable card instead of
// the best one with chance MISS (default 0.3), and never uses potions cleverly. Default Quick game (3 acts, opening gift), Warrior.
// Reports: cleared floors 1-3 (alive on floor 4+), reached the act-1 boss, beat the act-1 boss. Run: node bench-newplayer.js [runs=300] [miss=0.3] [hero=w]
const EC = require('./core.js'), E = EC.E; const N = +process.argv[2] || 300, MISS = process.argv[3] != null ? +process.argv[3] : 0.3, HERO = process.argv[4] || 'w';
let f3 = 0, boss = 0, beat = 0, stuck = 0; const died = {};
for (let i = 0; i < N; i++) {
  E.newGame({ heroes: [HERO], acts: 3, bless: 1, seed: 9000 + i }); const G = E.G(); let rs = 77 + i, n = 0, reachedBoss = false;
  const r = () => { rs = (rs * 1103515245 + 12345) & 0x7fffffff; return rs / 0x7fffffff; };
  while (G.scr !== 'over' && G.act === 1 && n++ < 6000) {
    if (G.b && G.b.kind === 'b') reachedBoss = true;
    let m = E.aiMove(r);
    if (G.scr === 'battle' && m && m.t === 'play' && r() < MISS) { const pl = E.validMoves().filter(v => v.t === 'play' || v.t === 'end'); m = pl[Math.floor(r() * pl.length)]; }
    if (!m || !E.performMove(m)) { m = E.validMoves()[0]; if (!m || !E.performMove(m)) { if (G.b && G.b.ph === 'e') { E.settle(); continue; } stuck++; break; } }
    if (G.b && G.b.ph === 'e') E.settle();
  }
  if (G.scr === 'over' && !G.won && G.act === 1) { const k = (G.b ? G.b.kind : '?') + G.floor; died[k] = (died[k] || 0) + 1; }
  if (G.act > 1 || G.floor >= 4) f3++; if (reachedBoss || G.act > 1) boss++; if (G.act > 1 || (G.scr === 'over' && G.won)) beat++;
}
const pc = x => (100 * x / N).toFixed(0) + '%';
console.log(`new-player bench (${HERO}, miss ${MISS}, ${N} runs): cleared floors 1-3 ${pc(f3)} | reached act-1 boss ${pc(boss)} | beat act-1 boss ${pc(beat)}${stuck ? ' | stuck ' + stuck : ''}`); if (process.env.DIED) console.log('deaths (room kind + floor):', JSON.stringify(died));

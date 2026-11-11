// Self-play data for fitting the AI's feature weights.
//   node train.js <games> <seed0> <out.jsonl> [scenarios] [--eps=0.15] [--level=normal]
// One line per ply: the feature vector of the state after the move (from the mover's side) and the game result.
const fs = require('fs'); const T = require('./tlib.js'); require('./src/ai.js'); const { FA, D } = T;
const a = process.argv.slice(2).filter(x => !x.startsWith('--')), fl = Object.fromEntries(process.argv.slice(2).filter(x => x.startsWith('--')).map(x => x.slice(2).split('=')));
const N = +a[0] || 100, seed0 = +a[1] || 1, out = a[2] || 'train.jsonl', which = a[3] || 'all', eps = +(fl.eps || 0.15), level = fl.level || 'normal';
const scs = D.scenarios.filter(s => which === 'all' || which === s.col || which.split(',').includes(s.id));
const FN = FA.AI.FN; const lines = []; let wins = 0;
for (let i = 0; i < N; i++) {
  const seed = seed0 + i * 104729; let r = seed; const rnd = () => { r = (r * 1664525 + 1013904223) >>> 0; return r / 4294967296; };
  const sc = scs[Math.floor(rnd() * scs.length)], ids = Object.keys(D.abilities), pool = ids.slice(), abil = []; for (let k = 0; k < sc.ab; k++) abil.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  const G = FA.newGame({ scenario: sc.id, seed, abil, ai: [level, level] }); const rec = []; let steps = 0;
  while (!G.result && steps++ < 600) {
    const s = FA.pending(G)[0], m = FA.AI.move(G, s, level, { rand: rnd, eps });
    if (!m) break; const was = G.phase; FA.performMove(G, m, s);
    if (m.t !== 'say' && m.t !== 'ready' && !G.result && G.phase === 'place') { const f = FA.AI.features(G, s); rec.push({ f: FN.map(k => +f[k].toFixed(4)), s, c: sc.col }); }
  }
  if (!G.result) continue; const y = G.result.win ? 1 : 0; wins += y;
  for (const x of rec) lines.push(JSON.stringify({ f: x.f, y, c: x.c, sc: sc.id }));
}
fs.writeFileSync(out, lines.join('\n') + '\n'); console.log('games', N, 'wins', wins, 'samples', lines.length, 'time ok');

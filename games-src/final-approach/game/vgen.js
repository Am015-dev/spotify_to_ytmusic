// Self-play data for the learned value (see vfit.py): one line per ply = raw features of the state after the move (mover's view) + the game result.
//   node vgen.js <games> <seed0> <out.jsonl> [scenarios|all] [--eps=0.2] [--level=normal] [--nmc=1,0]
const fs = require('fs'); const T = require('./tlib.js'); require('./src/ai.js'); const { FA, D } = T;
const a = process.argv.slice(2).filter(x => !x.startsWith('--')), fl = Object.fromEntries(process.argv.slice(2).filter(x => x.startsWith('--')).map(x => x.slice(2).split('=')));
const N = +a[0] || 100, seed0 = +a[1] || 1, out = a[2] || 'v.jsonl', which = a[3] || 'all', eps = +(fl.eps || 0.1), level = fl.level || 'normal';
if (fl.nmc) { const [t, n] = fl.nmc.split(',').map(Number); FA.AI.NMC = { top: t, samples: n }; }
if (fl.nov) FA.AI.useV = false;
const scs = D.scenarios.filter(s => which === 'all' || which === s.col || which.split(',').includes(s.id));
const FN = FA.AI.FN; const fd = fs.openSync(out, 'w'); let wins = 0, samples = 0;
for (let i = 0; i < N; i++) {
  const seed = seed0 + i * 104729; let r = seed; const rnd = () => { r = (r * 1664525 + 1013904223) >>> 0; return r / 4294967296; };
  const sc = scs[i % scs.length], ids = Object.keys(D.abilities), pool = ids.slice(), abil = []; for (let k = 0; k < sc.ab; k++) abil.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  const G = FA.newGame({ scenario: sc.id, seed, abil, ai: [level, level] }); const rec = []; let steps = 0;
  while (!G.result && steps++ < 600) {
    const s = FA.pending(G)[0], m = FA.AI.move(G, s, level, { rand: rnd, eps });
    if (!m) break; FA.performMove(G, m, s);
    if (m.t !== 'say' && m.t !== 'ready' && !G.result && G.phase === 'place') { const f = FA.AI.features(G, s); rec.push(JSON.stringify(FA.AI.raw(G, s).concat(FN.map(k => +f[k].toFixed(3))))); }
  }
  if (!G.result) continue; const R = G.result, ck = Object.values(R.checks || {}), y = R.win ? 1 : +(0.25 * Math.min(1, G.round / 6) + 0.2 * (ck.length ? ck.filter(Boolean).length / ck.length : 0)).toFixed(3); wins += R.win ? 1 : 0;   // loss = partial credit for rounds survived and checks passed (the red / black airports are almost never won)
  fs.writeSync(fd, rec.map(x => '[' + x.slice(1, -1) + ',' + y + ',"' + sc.id + '"]').join('\n') + '\n'); samples += rec.length;
}
fs.closeSync(fd); console.log('games', N, 'wins', wins, 'samples', samples);

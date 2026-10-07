// Chapter win rates for the learning ladder: two computer crews (open dice) over the real engine.
//   node lad-sim.js [games=200] [levels=easy,normal,hard] [chapters=1,2,3,4,5,6]
const T = require('./tlib.js'); require('./src/ai.js'); const { FA, D } = T;
FA.AI.NMC.ms = 0; FA.AI.HMC.ms = 0;
const N = +(process.argv[2] || 200), levels = (process.argv[3] || 'easy,normal,hard').split(','), chs = (process.argv[4] || '1,2,3,4,5,6').split(',').map(Number);
function play(lad, level, seed) {
  let r = seed; const rnd = () => { r = (r * 1664525 + 1013904223) >>> 0; return r / 4294967296; };
  const G = FA.newGame({ lad, seed, ai: [level, level] }); let steps = 0, err = null;
  while (!G.result && steps++ < 600) {
    const seats = FA.pending(G); if (!seats.length) { err = 'no pending seat'; break; }
    const s = seats[0], m = FA.AI.move(G, s, level, { rand: rnd }); if (!m) { err = 'no move seat ' + s + ' ' + G.phase; break; }
    const res = FA.performMove(G, m, s); if (!res.ok) { err = 'refused ' + res.error + ' ' + JSON.stringify(m); break; }
    const e = FA.checkInvariants(G); if (e.length) { err = 'invariant ' + e.join(';'); break; }
  }
  if (!G.result && !err) err = 'stall';
  return { G, err };
}
for (const level of levels) for (const lad of chs) {
  let win = 0, bad = 0, why = {}; const t0 = Date.now();
  for (let i = 0; i < N; i++) { const { G, err } = play(lad, level, 1000 + i * 7919 + lad * 31); if (err) { bad++; if (bad < 3) console.log('ERR', lad, level, err); continue; } if (G.result.win) win++; else { const k = G.result.why === 'checks' ? Object.keys(G.result.checks).filter(x => !G.result.checks[x]).join('+') : G.result.why; why[k] = (why[k] || 0) + 1; } }
  console.log(('lad ' + lad + ' ' + level).padEnd(16), (100 * win / (N - bad)).toFixed(0).padStart(3) + '%', win + '/' + (N - bad), 'err', bad, JSON.stringify(why), ((Date.now() - t0) / N).toFixed(0) + 'ms/game');
}

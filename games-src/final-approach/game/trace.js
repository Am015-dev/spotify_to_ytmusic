const T = require('./tlib.js'); require('./src/ai.js'); const { FA, D } = T;
const sc = process.argv[2] || 'g1', level = process.argv[3] || 'normal', seed = +(process.argv[4] || 1000);
let r = seed; const rnd = () => { r = (r * 1664525 + 1013904223) >>> 0; return r / 4294967296; };
const G = FA.newGame({ scenario: sc, seed, ai: [level, level] });
let steps = 0;
while (!G.result && steps++ < 600) {
  const s = FA.pending(G)[0]; const m = FA.AI.move(G, s, level, { rand: rnd });
  const dv = m.t === 'place' && m.d !== 'p' ? G.dice[s][m.d].v : '';
  if (m.t !== 'say') console.log((s ? 'C' : 'P') + ' R' + (G.round + 1) + ' ' + JSON.stringify(m) + (dv ? ' die=' + dv : '') + '   hands P:' + G.dice[0].map(d => d.u ? '-' : d.v).join('') + ' C:' + G.dice[1].map(d => d.u ? '-' : d.v).join(''));
  FA.performMove(G, m, s);
  if (m.t === 'ready' && G.phase === 'place') console.log(FA.toText(G, 'all'));
}
console.log(FA.toText(G, 'all')); console.log(G.result);

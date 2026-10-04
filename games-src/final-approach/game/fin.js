const T = require('./tlib.js'); require('./src/ai.js'); const { FA, D } = T;
const sc = process.argv[2] || 'g1', level = 'normal'; let shown = 0, tot = 0, ax0 = 0, axNon0 = 0, matchFail = 0;
for (let seed = 1; seed < 80 && shown < 4; seed++) {
  let r = seed; const rnd = () => { r = (r * 1664525 + 1013904223) >>> 0; return r / 4294967296; };
  const G = FA.newGame({ scenario: sc, seed, ai: [level, level] }); const log = []; let axisAtR7 = null, steps = 0;
  while (!G.result && steps++ < 600) { const s = FA.pending(G)[0]; const m = FA.AI.move(G, s, level, { rand: rnd }); if (G.round === 6 && G.phase === 'place' && axisAtR7 === null) axisAtR7 = G.pl.axis; if (G.round === 6 && m.t === 'place') log.push((s ? 'C' : 'P') + ' ' + JSON.stringify(m) + ' die=' + (m.d !== 'p' ? G.dice[s][m.d].v : '') + '  P:' + G.dice[0].map(d => d.u ? '-' : d.v).join('') + ' C:' + G.dice[1].map(d => d.u ? '-' : d.v).join('') + ' coffee ' + G.coffee); FA.performMove(G, m, s); }
  if (axisAtR7 === null) continue; tot++; if (axisAtR7 === 0) ax0++; else axNon0++;
  const ck = G.result.checks; if (ck && ck.axis === false && shown < 4 && G.result.why === 'checks') { shown++; console.log('seed', seed, 'axis at R7 start', axisAtR7); console.log(log.join('\n')); }
}
console.log('reached R7', tot, 'axis0 at start', ax0, 'non0', axNon0);

// dbg.js <scenario> <level> <seed> <round>  : plays with the AI until the given round's placement phase, then prints candidate scores for each decision of that round
const T = require('./tlib.js'); require('./src/ai.js'); const { FA, D } = T;
const sc = process.argv[2] || 'g1', level = process.argv[3] || 'normal', seed = +(process.argv[4] || 1), R = +(process.argv[5] || 7);
let r = seed; const rnd = () => { r = (r * 1664525 + 1013904223) >>> 0; return r / 4294967296; };
const G = FA.newGame({ scenario: sc, seed, ai: [level, level] });
let steps = 0;
while (!G.result && steps++ < 600) {
  const s = FA.pending(G)[0]; const m = FA.AI.move(G, s, level, { rand: rnd });
  if (G.round + 1 >= R && G.phase === 'place' && m.t !== 'say' && m.t !== 'ready') {
    console.log('---- ' + (s ? 'copilot' : 'pilot') + ' R' + (G.round + 1) + ' coffee ' + G.coffee + ' axis ' + G.pl.axis + ' pos ' + G.pl.pos + '  slots ' + Object.keys(G.slots).map(k => k + '=' + G.slots[k].v).join(' '));
    console.log(FA.toText(G, s).split('\n').slice(-3).join('\n'));
    const V = FA.stripView(G, s); const base = FA.AI.cost(V, s, {});
    const mv = FA.validMoves(V, s).filter(x => x.t === 'place').map(x => { const S = FA.cloneLite(V); FA.performMove(S, x, s, true); return { x, c: FA.AI.cost(S, s, {}), v: x.d === 'p' ? 0 : V.dice[s][x.d].v }; }).sort((a, b) => a.c - b.c);
    console.log('base cost', base.toFixed(2), ' top: ' + mv.slice(0, 6).map(o => o.v + '->' + o.x.to + (o.x.c ? '(' + o.x.c + ')' : '') + ' ' + o.c.toFixed(2)).join(' | '));
    console.log('chosen', JSON.stringify(m), 'die', m.d !== 'p' ? V.dice[s][m.d].v : '');
  }
  FA.performMove(G, m, s);
}
console.log(FA.toText(G, 'all')); console.log(G.result.msg);

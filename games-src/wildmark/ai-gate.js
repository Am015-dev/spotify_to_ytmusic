// AI gate (orchestrator addendum): Hard and Normal vs a simple "take the first legal option" bot, 2 players, seats alternate.
// Gate: Hard >= 70%, Normal >= 55% over N games each (ties count as half). Usage: node ai-gate.js [N=100]
global.window = global; require('./src/data.js'); require('./src/engine.js'); require('./src/ai.js');
const W = window.WM, N = +(process.argv[2] || (process.env.QUICK ? 10 : 100));
function first(G) { const m = W.moves(G); return G.stage === 'pick' ? m.find(x => x.t === 'take') : G.stage === 'tok' ? m[0] : m[0]; }
const out = {};
for (const lv of ['hard', 'normal']) {
  let pts = 0, sAI = 0, sB = 0;
  for (let g = 0; g < N; g++) {
    const ai = g % 2 ? [null, lv] : [lv, null], me = g % 2 ? 1 : 0, G = W.newGame({ np: 2, seed: 5000 + g, ai: ai.map(x => x || 'first') });
    while (!G.over) W.apply(G, G.cur === me ? W.AI.choose(G, lv) : first(G));
    pts += G.winner === me ? 1 : G.winner === -2 ? 0.5 : 0; sAI += G.res[me].total; sB += G.res[1 - me].total;
  }
  out[lv] = { win: Math.round(100 * pts / N), ai: (sAI / N).toFixed(1), bot: (sB / N).toFixed(1) };
  console.log(lv, 'vs first-legal bot:', out[lv].win + '% wins, avg', out[lv].ai, 'vs', out[lv].bot, 'over', N, 'games');
}
const pass = out.hard.win >= 70 && out.normal.win >= 55; console.log(pass ? 'PASS ai-gate' : 'FAIL ai-gate'); process.exit(pass ? 0 : 1);

// Tutorial dice check: node tut-sim.js -> plays the coached flight with the computer in both seats (= the coach's advice) and prints the outcome per script.
const FA = require('./src/engine.js'); require('./src/ai.js');
const SCRIPT = JSON.parse(process.argv[2] || 'null');
const ALLOW = [['axis', 'engines', 'conc'], ['axis', 'engines', 'conc', 'radio', 'gear'], ['axis', 'engines', 'conc', 'radio', 'gear', 'flaps', 'brakes'], null];
function advise(G, seat) {
  const al = ALLOW[Math.min(G.round, 3)], V = FA.stripView(G, seat); V.nolog = true; let best = null, bc = 1e9;
  if (G.phase === 'place' && !G.pend) for (const m of FA.validMoves(V, seat)) { if (m.t !== 'place' || m.d === 'p') continue; if (al && !al.includes(FA.SLOT[m.to].grp)) continue;
    const S = FA.cloneLite(V); FA.performMove(S, m, seat, true); const c = FA.AI.cost(S, seat) + Math.abs(m.c || 0) * 0.02; if (c < bc) { bc = c; best = m; } }
  return best || FA.AI.move(G, seat, 'normal', { noMC: true });
}
function play(script, rnd) {
  const G = FA.newGame({ scenario: 'tt', seed: 23, row0: 3, pre: { script } });
  let n = 0; const trail = [];
  while (!G.result && n++ < 400) {
    const pend = FA.pending(G); if (!pend.length) break; const s = pend[0];
    let m = null;
    if (G.phase === 'brief') m = { t: 'ready' };
    else { const vm = FA.validMoves(G, s); m = (rnd && s === 0 && Math.random() < rnd) ? (vm.filter(x => x.t === 'place')[Math.floor(Math.random() * vm.filter(x => x.t === 'place').length)] || vm[0]) : advise(G, s); }
    if (m.t === 'place') trail.push('r' + (G.round + 1) + ' ' + (s ? 'C' : 'P') + ':' + (m.d === 'p' ? 'p' : G.dice[s][m.d].v) + (m.c ? (m.c > 0 ? '+' : '') + m.c : '') + '>' + m.to);
    const r = FA.performMove(G, m, s); if (!r.ok) { trail.push('REFUSED ' + JSON.stringify(m) + r.error); break; }
  }
  return { G, trail };
}
const r = play(SCRIPT);
console.log(r.G.result ? (r.G.result.win ? 'WIN' : 'LOSE ' + JSON.stringify(r.G.result)) : 'NO RESULT'); console.log(r.trail.join('  '));
let w = 0; for (let i = 0; i < 200; i++) if (play(SCRIPT, 0.25).G.result.win) w++; console.log('pilot 25% random moves: win ' + w + '/200');

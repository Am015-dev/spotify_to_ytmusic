// Tutorial plan check: node tut-sim.js -> plays the guided first landing (tut-plan.js) through the engine, prints every move and the result (must be a landing).
const FA = require('./src/engine.js'); const P = require('./tut-plan.js');
const G = FA.newGame(P.setup); const idx = [0, 0]; let rrDone = false; const log = [];
const go = (s, m) => { const r = FA.performMove(G, m, s); if (!r.ok) { console.log('REFUSED', s, JSON.stringify(m), r.error, 'round', G.round); process.exit(1); } };
for (let n = 0; n < 200 && !G.result; n++) {
  if (G.phase === 'brief') { for (const s of [0, 1]) if (!G.ready[s]) go(s, { t: 'ready' }); idx[0] = idx[1] = 0; continue; }
  if (G.pend && G.pend.h === 'rr') { if (!G.pend.d.m[0]) go(0, { t: 'rrpick', m: [0, 1, 2, 3].map(i => i === P.rrDie) }); if (G.pend && !G.pend.d.m[1]) go(1, { t: 'rrpick', m: [false, false, false, false] }); continue; }
  const s = G.turn;
  if (s === 0 && G.round === P.rrAt[0] && idx[0] === P.rrAt[1] && !rrDone) { rrDone = true; go(0, { t: 'rr' }); continue; }
  const q = s ? P.cop[G.round][idx[1]++] : P.pil[G.round][idx[0]++];
  const before = G.pl.pos; go(s, { t: 'place', d: q[0], to: q[1], c: q[2] || 0 });
  log.push('r' + (G.round + 1) + (s ? 'C' : 'P') + ':' + q[1] + ' pos' + before + '>' + G.pl.pos + ' ax' + G.pl.axis + ' cof' + G.coffee);
}
console.log(log.join('\n')); console.log(JSON.stringify(G.result));

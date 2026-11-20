// AI vs AI gauntlet: invariants after every move, win rates per seat and per corporation, game length.
// Usage: node game/gauntlet.js [games=20] [levelA=normal] [levelB=normal]   env OH_DATA_FILE=<data.js> to use another data file
const path = require('path');
if (process.env.OH_DATA_FILE) globalThis.OH_DATA = require(path.resolve(process.env.OH_DATA_FILE));
globalThis.OH_MAP = require('./src/map.js');
const OH = require('./src/engine.js'), AI = require('./src/ai.js');
const N = +process.argv[2] || 20, LV = [process.argv[3] || 'normal', process.argv[4] || 'normal'];
let wins = [0, 0], gens = [], fails = 0, corpW = {}, corpN = {}, margins = [], steps = 0, t0 = Date.now(), stuck = 0, cardsPlayed = new Set();
for (let g = 0; g < N; g++) {
  OH.newGame({ seed: 1000 + g * 7919 });
  if (process.env.OH_FORCE) { OH.G.pl[0].offer.corps = [process.env.OH_FORCE]; OH.G.pl[1].offer.corps = OH.G.pl[1].offer.corps.filter(c => c !== process.env.OH_FORCE).slice(0, 1); }
  let n = 0;
  while (!OH.G.over && n < 6000) {
    const p = OH.sideToAct(); if (p < 0) { stuck++; break; }
    const m = AI.decide(LV[p]);
    if (!m || !OH.performMove(m)) { console.log('ILLEGAL/none', JSON.stringify(m), OH.G.phase, JSON.stringify(OH.G.pending)); fails++; break; }
    if (m.t === 'play') cardsPlayed.add(m.id);
    const e = OH.checkInvariants(); if (e.length) { console.log('INVARIANT', g, e.join('; ')); fails++; break; }
    n++;
  }
  steps += n;
  const G = OH.G;
  if (!G.over) { console.log('game', g, 'did not finish', G.phase, G.gen); fails++; continue; }
  wins[G.winner]++; gens.push(G.gen);
  margins.push(Math.abs(G.final[0].total - G.final[1].total));
  G.pl.forEach((P, i) => { corpN[P.corp] = (corpN[P.corp] || 0) + 1; if (G.winner === i) corpW[P.corp] = (corpW[P.corp] || 0) + 1; });
  if (g < 3) console.log(`game ${g}: gen ${G.gen} score ${G.final[0].total}-${G.final[1].total} (tr ${G.final[0].tr}/${G.final[1].tr}, cards ${G.final[0].cards}/${G.final[1].cards})`);
}
const avg = a => (a.reduce((x, y) => x + y, 0) / Math.max(1, a.length)).toFixed(1);
console.log(`games ${N}  ${LV.join(' vs ')}  wins ${wins.join('-')}  avg gens ${avg(gens)}  avg margin ${avg(margins)}  fails ${fails}  moves ${steps}  distinct cards played ${cardsPlayed.size}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
console.log('corp win%: ' + Object.keys(corpN).sort().map(c => `${c}:${Math.round(100 * (corpW[c] || 0) / corpN[c])}%/${corpN[c]}`).join(' '));
if (fails) process.exit(1);

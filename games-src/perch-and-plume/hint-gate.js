// Hint gate (headless): a player who always follows the Best hint, and a mixed newcomer (Best half the time, else a random
// legal move), each vs the default Easy rival, N games, seats alternated.   node hint-gate.js [N=40]
const PP = require('./src/engine.js'), AI = require('./src/ai.js');
const N = +process.argv[2] || 40;
function rnd(G, s) { const mv = PP.validMoves(G, s).filter(m => m.t !== 'reroll'); if (G.q && G.q.h === 'setup') return AI.setup(G, s); return mv[Math.floor(Math.random() * mv.length)] || PP.validMoves(G, s)[0]; }
function run(name, pol) {
  let w = 0, sa = 0, sb = 0, ms = 0, nd = 0;
  for (let g = 0; g < N; g++) {
    const seats = [{ name: 'Me', kind: 'human' }, { name: 'Fern', kind: 'ai', lvl: 'easy' }]; if (g % 2) seats.reverse();
    const G = PP.newGame({ seats, seed: 5100 + g }); let k = 0;
    while (G.phase !== 'over' && k++ < 4000) { const s = PP.sideToAct(G); let m; if (G.pl[s].name === 'Me') { const t = Date.now(); m = pol(G, s); if (!G.q) { ms += Date.now() - t; nd++; } } else m = AI.choose(G, s, 'easy'); PP.performMove(G, m, s); }
    const a = G.pl.findIndex(p => p.name === 'Me');
    sa += G.final[a].total; sb += G.final[1 - a].total; if (G.final[a].total > G.final[1 - a].total) w++;
  }
  console.log(`${name} vs easy: wins ${w}/${N} = ${Math.round(100 * w / N)}%, avg ${(sa / N).toFixed(1)} vs ${(sb / N).toFixed(1)}, hint ${(ms / Math.max(1, nd)).toFixed(0)} ms/decision`);
  return w / N;
}
// touch-like newcomer: picks one of the 4 actions at random (as tapping a random action tile), then a random option inside it
function rndTouch(G, s) { if (G.q) return rnd(G, s); const mv = PP.validMoves(G, s), ty = ['food', 'eggs', 'cards', 'play'].filter(k => mv.some(m => k === 'play' ? m.t === 'play' : m.t === 'act' && m.a === k)), k = ty[Math.floor(Math.random() * ty.length)], opts = mv.filter(m => k === 'play' ? m.t === 'play' : m.t === 'act' && m.a === k); return opts[Math.floor(Math.random() * opts.length)]; }
const best = run('Best', (G, s) => AI.hint(G, s));
const mix = run('Mixed', (G, s) => Math.random() < .5 ? AI.hint(G, s) : rndTouch(G, s));
// solo (F1, Nov 2026): the same mixed newcomer vs the Easy Rival Flock (original solo rules) should win about half
function solo(name, pol, lvl, n) {
  let w = 0, sa = 0, sb = 0;
  for (let g = 0; g < n; g++) {
    const G = PP.newGame({ seats: [{ name: 'Me', kind: 'human' }, { name: 'Rival Flock', kind: 'automa', lvl }], seed: 6100 + g }); let k = 0;
    while (G.phase !== 'over' && k++ < 5000) { const s = PP.sideToAct(G); PP.performMove(G, s === 0 ? pol(G, 0) : PP.validMoves(G, 1)[0], s); }
    sa += G.final[0].total; sb += G.final[1].total; if (G.final[0].total > G.final[1].total) w++;
  }
  console.log(`${name} vs ${lvl} Rival Flock (solo): wins ${w}/${n} = ${Math.round(100 * w / n)}%, avg ${(sa / n).toFixed(1)} vs ${(sb / n).toFixed(1)}`);
  return w / n;
}
const soloMix = solo('Mixed', (G, s) => Math.random() < .5 ? AI.hint(G, s) : rndTouch(G, s), 'easy', 100);
console.log((best >= .7 && mix >= .4 && mix <= .8 && soloMix >= .3 && soloMix <= .7 ? 'PASS' : 'FAIL') + ` hint-gate: Best ${Math.round(best * 100)}% (need 70), mixed ${Math.round(mix * 100)}% (need 40-80; by touch a mixed newcomer is weaker, see GAMEPLAY-W508.md), solo mixed vs Easy Flock ${Math.round(soloMix * 100)}% (need 30-70)`);
if (process.env.ALL) run('Random', rndTouch);

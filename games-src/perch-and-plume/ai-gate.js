// AI gate (headless): each level vs a simple bot that takes the first affordable option (play the first playable bird, else the
// first legal move), N games each, seats alternated. Also checks the computer spends what it gathers (food and cards left at the end).
//   node ai-gate.js [N=100]
const PP = require('./src/engine.js'), AI = require('./src/ai.js');
const N = +process.argv[2] || 100;
function simple(G, s) { const mv = PP.validMoves(G, s); if (G.q && G.q.h === 'setup') return AI.setup(G, s); return mv.find(m => m.t === 'play') || mv.find(m => m.t !== 'reroll') || mv[0]; }
function run(lvl) {
  let w = 0, sa = 0, sb = 0, leftFood = 0, leftHand = 0;
  for (let g = 0; g < N; g++) {
    const sw = g % 2, seats = [{ name: 'AI', kind: 'ai', lvl }, { name: 'Bot', kind: 'ai', lvl: 'bot' }]; if (sw) seats.reverse();
    const G = PP.newGame({ seats, seed: 7000 + g }); let k = 0;
    while (G.phase !== 'over' && k++ < 4000) { const s = PP.sideToAct(G); const m = G.pl[s].lvl === 'bot' ? simple(G, s) : AI.choose(G, s, lvl); PP.performMove(G, m, s); }
    const a = G.pl.findIndex(p => p.name === 'AI'), b = 1 - a;
    sa += G.final[a].total; sb += G.final[b].total; if (G.final[a].total > G.final[b].total) w++;
    leftFood += PP.foodN(G.pl[a]); leftHand += G.pl[a].hand.length;
  }
  console.log(`${lvl} vs first-option bot: wins ${w}/${N} = ${Math.round(100 * w / N)}%, avg ${(sa / N).toFixed(1)} vs ${(sb / N).toFixed(1)}; left at the end: ${(leftFood / N).toFixed(1)} food, ${(leftHand / N).toFixed(1)} cards`);
  return w / N;
}
const h = run('hard'), n = run('normal');
console.log((h >= .7 && n >= .55 ? 'PASS' : 'FAIL') + ' ai-gate: hard ' + Math.round(h * 100) + '% (need 70), normal ' + Math.round(n * 100) + '% (need 55)');

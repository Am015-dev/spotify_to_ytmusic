// Best-tapper duel (F2, Nov 2026): a newcomer who always taps the Best hint (PPAI.hint for every choice, the suggested starting hand)
// plays a 2-player game against the computer at each level. N seeds, first player alternated.
//   node tests/best-duel.js [N=200] [levels=easy,normal]     prints win rate and the average margin (Best minus computer)
const path = require('path');
const PP = require(path.join(__dirname, '..', 'src', 'engine.js')), AI = require(path.join(__dirname, '..', 'src', 'ai.js'));
const N = +process.argv[2] || 200, LV = (process.argv[3] || 'easy,normal').split(',');
let seed = 1; Math.random = function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };   // repeatable runs
function duel(lvl) {
  let w = 0, t = 0, mar = 0, absm = 0, sa = 0, sb = 0;
  for (let g = 0; g < N; g++) {
    seed = 1000 + g * 7919;
    const st = [{ name: 'Best', kind: 'ai', lvl: 'best' }, { name: 'CPU', kind: 'ai', lvl }]; if (g % 2) st.reverse();
    const G = PP.newGame({ seats: st, seed: 5000 + g }); let k = 0;
    while (G.phase !== 'over' && k++ < 5000) {
      const s = PP.sideToAct(G), me = G.pl[s].name === 'Best';
      const m = me ? (G.q && G.q.h === 'setup' ? AI.setup(G, s) : AI.hint(G, s)) : AI.choose(G, s, lvl);
      const r = PP.performMove(G, m, s); if (!r.ok) throw new Error('illegal ' + JSON.stringify(m) + ' ' + r.err);
    }
    const a = G.pl.findIndex(p => p.name === 'Best'), b = 1 - a, d = G.final[a].total - G.final[b].total;
    sa += G.final[a].total; sb += G.final[b].total; mar += d; absm += Math.abs(d); if (d > 0) w++; else if (d === 0) t++;
  }
  const out = { lvl, win: w / N, tie: t / N, avgBest: sa / N, avgCpu: sb / N, margin: mar / N, absMargin: absm / N };
  console.log(`Best-tapper vs ${lvl}: Best wins ${w}/${N} (${Math.round(100 * w / N)}%), ties ${t}; avg ${out.avgBest.toFixed(1)} vs ${out.avgCpu.toFixed(1)}; margin ${out.margin.toFixed(1)}, avg |margin| ${out.absMargin.toFixed(1)}`);
  return out;
}
const R = LV.map(duel);
if (require.main === module && process.env.GATE) {
  const e = R.find(r => r.lvl === 'easy'), n = R.find(r => r.lvl === 'normal'); let ok = true;
  if (e && !(e.win >= .35 && e.win <= .65 && e.absMargin < 15)) ok = false;
  if (n && !(n.win < .45)) ok = false;
  console.log((ok ? 'PASS' : 'FAIL') + ' best-duel'); process.exitCode = ok ? 0 : 1;
}

// Bench: how often a sensible new player (the normal chef with 25% random slips) wins a 3-diner game vs two chefs of a level.
//   node bench-newplayer.js [games=1500] [level=easy]
const T = require('./tlib'); const KK = T.KK, AI = KK.AI;
const N = +(process.argv[2] || 1500), LV = process.argv[3] || 'easy';
let r = 99; const R = () => (r = (r * 1664525 + 1013904223) >>> 0) / 4294967296;
function run(lv0, lv, slip) {
  let win = 0, tie = 0, tot = 0;
  for (let g = 0; g < N; g++) {
    const G = KK.newGame({ players: 3, seed: 1000 + g, ai: [null, lv, lv] }); G.nolog = true;
    let guard = 0;
    while (G.phase !== 'over' && guard++ < 5000) {
      for (let s = 0; s < 3; s++) { if (G.players[s].picked) continue; const ms = KK.moves(G, s); const m = s === 0 && R() < slip ? ms[Math.floor(R() * ms.length)] : AI.choose(G, s, s === 0 ? lv0 : lv); KK.apply(G, s, m); }
    }
    const f = G.final.totals; tot += f[0]; if (G.winners.includes(0)) { if (G.winners.length > 1) tie++; else win++; }
  }
  return { win: (100 * win / N).toFixed(1) + '%', tie: (100 * tie / N).toFixed(1) + '%', avg: (tot / N).toFixed(1) };
}
for (const [lv0, sl] of [["easy", 0], ["normal", .25], ["normal", .5], ["normal", .65]]) console.log("player=" + lv0 + " slips " + sl + " vs 2x" + LV, JSON.stringify(run(lv0, LV, sl)));

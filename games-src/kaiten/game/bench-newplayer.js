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
// hint-follower (R80): always takes the dish with the biggest green +N (points scored right now), ties at random. Goal: about an equal share
// of 3-diner wins against two Easy chefs (1 in 3), and outscores Odile (seat 1) about half the time.
{ const gain = (G, s, id) => { const tab = G.players.map(p => p.table.map(e => ({ id: e.id, w: e.w }))), tot = t => KK.roundScores({ players: t.map(x => ({ table: x })) })[s].total, b = tot(tab); KK._.place({ table: tab[s] }, id); return tot(tab) - b; };
  let win = 0, beat1 = 0; const w = [0, 0, 0];
  for (let g = 0; g < N; g++) {
    const G = KK.newGame({ players: 3, seed: 5000 + g, ai: [null, LV, LV] }); G.nolog = true; let guard = 0;
    while (G.phase !== 'over' && guard++ < 5000) for (let s = 0; s < 3; s++) { if (G.players[s].picked) continue; let m;
      if (s === 0) { const h = G.players[0].hand; let bi = 0, bv = -1e9; h.forEach((id, i) => { const v = gain(G, 0, id) + R() * 1e-3; if (v > bv) { bv = v; bi = i; } }); m = { pick: [bi] }; } else m = AI.choose(G, s, LV);
      KK.apply(G, s, m); }
    G.winners.forEach(x => w[x] += 1 / G.winners.length); const f = G.final.totals; beat1 += f[0] > f[1] ? 1 : f[0] === f[1] ? .5 : 0;
  }
  console.log('hint-follower vs 2x' + LV + ': wins you/seat1/seat2 ' + w.map(x => (100 * x / N).toFixed(1) + '%').join(' / ') + ', outscores seat 1 in ' + (100 * beat1 / N).toFixed(1) + '%'); }

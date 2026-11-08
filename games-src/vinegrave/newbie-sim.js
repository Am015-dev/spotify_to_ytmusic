// Easy rival vs three new-player models (2 players, you seat 0 as in a real game, 5 rounds). Reports your win rate and average scores per round.
// glow: taps the first glowing thing like touch-test (site, hand card, market card, research), else Pass.
// sensible: plays its cards, digs/explores, beats guardians it woke, buys the best card it can afford, climbs research when it can, uses boons and idols.
// node newbie-sim.js [games]
const VG = require('./src/engine.js'), VAI = require('./src/ai.js'), V = VG.V;
const N = +process.argv[2] || 200;
const pri = { beat: 0, disc: 1, dig: 2, play: 3, buy: 4, res: 5, temple: 5 };
function glow(G) { const ms = VG.moves(G); if (G.q) return ms[0]; for (const t of ['dig', 'disc', 'play', 'buy', 'res', 'temple']) { const m = ms.find(x => x.t === t); if (m) return m; } return ms.find(m => m.t === 'pass'); }
function sensible(G) { const ms = VG.moves(G); if (G.q) return ms[0]; const p = G.p[VG.actor(G)];
  const free = ms.find(m => m.t === 'boon' || m.t === 'idol'); if (free) return free;
  const main = ms.filter(m => !m.free && m.t !== 'pass');
  if (!main.length) return ms.find(m => m.t === 'pass');
  main.sort((a, b) => (pri[a.t] - pri[b.t]) || (a.t === 'buy' ? V.CARDS[G.row[b.r]].cost - V.CARDS[G.row[a.r]].cost : 0));
  return main[0]; }
const pol = { glow, sensible, random: G => { const ms = VG.moves(G); if (G.q) return ms[0]; const mm = ms.filter(m => m.t !== 'pass'); return mm.length && VG.rng(G) < 0.92 ? mm[Math.floor(VG.rng(G) * mm.length)] : ms.find(m => m.t === 'pass') || ms[0]; } };
const lvl = process.env.LVL || 'easy';
for (const name of Object.keys(pol)) {
  let w = 0, me = 0, ai = 0; const rr = [0, 0, 0, 0, 0];
  for (let g = 0; g < N; g++) {
    const G = VG.newGame({ np: 2, seed: 9000 + g, seats: [{ name: 'You' }, { name: 'Tamsin', ai: lvl }] }); let n = 0, rd = 1;
    while (G.phase === 'play' && n++ < 4000) { const s = VG.actor(G); VG.apply(G, s === 1 ? VAI.choose(G, lvl) : pol[name](G)); if (G.round !== rd) { rr[rd - 1] += VG.score(G, 1).total; rd = G.round; } }
    rr[4] += VG.score(G, 1).total;
    if (G.winner === 0) w++; me += VG.score(G, 0).total; ai += VG.score(G, 1).total;
  }
  console.log(`${name}: you win ${Math.round(100 * w / N)}%  you ${(me / N).toFixed(1)}  ${lvl} ${(ai / N).toFixed(1)}  rival by round ${rr.map(x => (x / N).toFixed(0)).join(' > ')}`);
}

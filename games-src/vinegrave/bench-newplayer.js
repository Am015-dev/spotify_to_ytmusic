// Bench (G2 review R6): a sensible new player vs the default first-game rival (easy). 2 players, seats alternated.
// New player plan: play free starting cards, then overcome > research > discover > temple > buy > dig > play a card > pass.
// node bench-newplayer.js [games] [level]   target: new player wins about half
const VG = require('./src/engine.js'), VAI = require('./src/ai.js');
const N = +process.argv[2] || 200, LVL = process.argv[3] || 'easy';
const ORDER = ['beat', 'res', 'disc', 'temple', 'buy', 'dig', 'play'];
function newbie(G) {
  const ms = VG.moves(G); if (G.q) return ms[0];
  const free = ms.find(m => m.t === 'play' && m.free); if (free) return free;
  for (const t of ORDER) { const m = ms.find(x => x.t === t && !x.free); if (m) return m; }
  return ms.find(m => m.t === 'pass') || ms[0];
}
let wins = 0, ties = 0, a = 0, b = 0;
for (let g = 0; g < N; g++) {
  const me = g % 2, G = VG.newGame({ np: 2, seed: 9000 + g, seats: [{ name: 'A' }, { name: 'B' }] }); let n = 0;
  while (G.phase === 'play' && n++ < 4000) { const s = VG.actor(G); VG.apply(G, s === me ? newbie(G) : VAI.choose(G, LVL)); }
  if (G.winner === me) wins++; else if (G.winner === -1) ties++;
  a += VG.score(G, me).total; b += VG.score(G, 1 - me).total;
}
console.log(JSON.stringify({ level: LVL, games: N, newPlayerWinPct: Math.round(100 * wins / N), ties, avgNew: +(a / N).toFixed(1), avgRival: +(b / N).toFixed(1) }));

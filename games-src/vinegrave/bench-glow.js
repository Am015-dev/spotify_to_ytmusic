// Glow follower vs the default Easy rival, headless. The follower plays only the move that glows (the single strongest main move by the computer's own
// value, ui2.js evalMoves) and passes when nothing glows; questions get their first answer. Target: wins about half.
// node bench-glow.js [games=100] ; VG_EASY=p0,p1,cap overrides the rival (see ai.js)
const VG = require('./src/engine.js'), VAI = require('./src/ai.js');
const N = +process.argv[2] || 100;
function glow(G) {   // same rule as ui2.js evalMoves: the strong player's move when it is a main move, else the best single-step main move
  const s = VG.actor(G), ms = VG.moves(G); if (G.q) return ms[0]; let best = null, bv = -1e9;
  ms.forEach(m => { if (m.free || m.t === 'pass' || m.t === 'ans') return; try { const c = VG.clone(G), r = VG.apply(c, m); if (!r || !r.ok) return; const v = VAI.value(c, s, 'hard'); if (v > bv) { bv = v; best = m; } } catch (e) { } });
  const hm = VAI.choose(G, 'hard'); if (hm && ms.some(m => VG.same(m, hm)) && !hm.free && hm.t !== 'pass' && hm.t !== 'ans') best = ms.find(m => VG.same(m, hm));
  return best || ms.find(m => m.t === 'pass') || ms[0];
}
let w = 0, t = 0, a = 0, b = 0;
for (let g = 0; g < N; g++) {
  const me = g % 2, G = VG.newGame({ np: 2, seed: 7000 + g, seats: [{ name: 'A' }, { name: 'B' }] }); let n = 0;
  while (G.phase === 'play' && n++ < 4000) { const s = VG.actor(G); VG.apply(G, s === me ? glow(G) : VAI.choose(G, 'easy')); }
  if (G.winner === me) w++; else if (G.winner === -1) t++; a += VG.score(G, me).total; b += VG.score(G, 1 - me).total;
}
console.log(JSON.stringify({ games: N, followerWinPct: Math.round(100 * w / N), ties: t, avgYou: +(a / N).toFixed(1), avgRival: +(b / N).toFixed(1), easy: VAI.EASY }));

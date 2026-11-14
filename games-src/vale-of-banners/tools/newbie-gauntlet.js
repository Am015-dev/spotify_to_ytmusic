// node tools/newbie-gauntlet.js N level : newcomer policy (seat alternates first/second) vs a computer level
const VB = require('../load.js')(), NB = require('./newbie-policy.js');
const N = +process.argv[2] || 100, L = process.argv[3] || 'easy'; let w = 0, a = 0, b = 0, diffs = [];
for (let g = 0; g < N; g++) {
  const me = process.env.SEAT0 ? 0 : g % 2, seats = [0, 1].map(i => i === me ? { human: true } : { human: false, ai: L });
  const G = VB.newGame({ n: 2, seed: 5000 + g, seats }); let k = 0;
  while (!G.over && k++ < 6000) { const s = VB.actor(G), m = s === me ? NB.pick(VB, G) : VB.aiMove(G, L); if (!m || !VB.performMove(G, m).ok) { console.log('stuck', JSON.stringify(m)); break; } }
  if (G.winner === me) w++; a += G.P[me].vp; b += G.P[1 - me].vp; diffs.push(G.P[me].vp - G.P[1 - me].vp);
}
diffs.sort((x, y) => x - y);
console.log(`newbie vs ${L}: won ${w}/${N} (${Math.round(100 * w / N)}%), avg ${(a / N).toFixed(0)} vs ${(b / N).toFixed(0)}, median margin ${diffs[N >> 1]}`);

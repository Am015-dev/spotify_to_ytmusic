// New-player bench (review G5): a "take the most points now" bot (no planning, no acorns, no sweeps) vs each rival level, 2 players, seats alternate.
// Bots: greedy (best points now, strong), newcomer, casual, random (floor). The default rival should sit between random and casual (~50% for a real first-timer). Usage: node newplayer-bench.js [N=100]
global.window = global; require('./src/data.js'); require('./src/engine.js'); require('./src/ai.js');
const W = window.WM, N = +(process.argv[2] || 100);
function greedyPlan(G) {
  const s = G.seats[G.cur], env = s.env; let best = null;
  const before = {}; W.TER.forEach(t => before[t] = W.corridor(env, t));
  for (let i = 0; i < 4; i++) {
    const tile = G.market.tiles[i], tok = G.market.toks[i]; if (!tile || !tok) continue;
    for (const c of W.spots(env)) for (const r of W.rots(tile)) {
      env[c] = { id: tile.id, t: tile.t, a: tile.a, key: tile.key, rot: r, tok: null };
      let v = 0; tile.t.forEach(t => v += W.corridor(env, t) - before[t]);
      let tb = 0, tc = null; W.tokSpots(env, tok).forEach(x => { const g = W.gainTok(env, x, tok) + (env[x].key ? 1 : 0); if (g > tb) { tb = g; tc = x; } });
      v += tb; delete env[c];
      if (!best || v > best.v) best = { v, i, c, r, tc };
    }
  }
  return best;
}
// casual: same but the tile always goes on a random spot (calibrated to the reviewer's real new-player scores, 44-60)
// newcomer: picks the pair whose animal scores most right now, puts the tile on a random open spot (half the time the best-matching one)
function newcomerPlan(G) {
  const s = G.seats[G.cur], env = s.env, r = () => W.rnd(G); let best = null;
  const before = {}; W.TER.forEach(t => before[t] = W.corridor(env, t));
  for (let i = 0; i < 4; i++) {
    const tile = G.market.tiles[i], tok = G.market.toks[i]; if (!tile || !tok) continue;
    const sp = W.spots(env); let pl = null;
    if (r() < (BOT === 'casual' ? 0 : 0.5)) { for (const c of sp) for (const ro of W.rots(tile)) { env[c] = { id: tile.id, t: tile.t, a: tile.a, key: tile.key, rot: ro, tok: null }; let v = 0; tile.t.forEach(t => v += W.corridor(env, t) - before[t]); delete env[c]; if (!pl || v > pl.v) pl = { v, c, r: ro }; } }
    else pl = { v: 0, c: sp[Math.floor(r() * sp.length)], r: Math.floor(r() * 6) % W.rots(tile).length };
    env[pl.c] = { id: tile.id, t: tile.t, a: tile.a, key: tile.key, rot: pl.r, tok: null };
    let tb = 0, tc = null; W.tokSpots(env, tok).forEach(x => { const g = W.gainTok(env, x, tok) + (env[x].key ? 1 : 0); if (g > tb) { tb = g; tc = x; } });
    if (tc === null) { const ts = W.tokSpots(env, tok); if (ts.length && W.gainTok(env, ts[0], tok) >= 0) tc = ts[0]; }
    delete env[pl.c];
    const v = tb + r() * 0.5; if (!best || v > best.v) best = { v, i, c: pl.c, r: pl.r, tc };
  }
  return best;
}
// random: a first-timer tapping any pair, any spot, the animal on any tile that takes it (the floor; the reviewer's real games scored near it)
function randomPlan(G) {
  const env = G.seats[G.cur].env, r = () => W.rnd(G), ok = [0, 1, 2, 3].filter(i => G.market.tiles[i] && G.market.toks[i]), i = ok[Math.floor(r() * ok.length)];
  const tile = G.market.tiles[i], sp = W.spots(env), c = sp[Math.floor(r() * sp.length)], ro = Math.floor(r() * 6) % W.rots(tile).length;
  env[c] = { id: tile.id, t: tile.t, a: tile.a, key: tile.key, rot: ro, tok: null }; const ts = W.tokSpots(env, G.market.toks[i]); delete env[c];
  return { i, c, r: ro, tc: ts.length ? ts[Math.floor(r() * ts.length)] : null };
}
const BOT = process.env.BOT || 'greedy';
function greedy(G) {
  if (G.stage === 'pick') { G._g = BOT === 'random' ? randomPlan(G) : BOT !== 'greedy' ? newcomerPlan(G) : greedyPlan(G); return { t: 'take', i: G._g.i }; }
  if (G.stage === 'tile') return { t: 'place', c: G._g.c, rot: G._g.r };
  const tc = G._g.tc; return tc && W.tokSpots(G.seats[G.cur].env, G.hold.tok).includes(tc) ? { t: 'tok', c: tc } : { t: 'back' };
}
const levels = (process.argv[3] || 'novice,easy,normal').split(','), out = {};
for (const lv of levels) {
  let pts = 0, sh = 0, sa = 0;
  for (let g = 0; g < N; g++) {
    const me = g % 2, ai = me ? [lv, 'first'] : ['first', lv], G = W.newGame({ np: 2, seed: 9100 + g, ai });
    while (!G.over) W.apply(G, G.cur === me ? greedy(G) : W.AI.choose(G, lv));
    pts += G.winner === me ? 1 : G.winner === -2 ? 0.5 : 0; sh += G.res[me].total; sa += G.res[1 - me].total;
  }
  out[lv] = Math.round(100 * pts / N);
  console.log(lv + ': ' + BOT + ' bot wins ' + out[lv] + '%, avg ' + (sh / N).toFixed(1) + ' vs rival ' + (sa / N).toFixed(1) + ' over ' + N);
}
module.exports = out;

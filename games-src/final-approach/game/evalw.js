// Worker for tune.js: evaluates one parameter vector on a list of (scenario, seed) games; replies with the number of landings.
const T = require('./tlib.js'); require('./src/ai.js'); const { FA, D } = T;
const W0c = Object.assign({}, FA.AI.W);
function playOne(scId, seed, level) {
  let r = seed; const rnd = () => { r = (r * 1664525 + 1013904223) >>> 0; return r / 4294967296; };
  const sc = D.scenarios.find(s => s.id === scId), ids = Object.keys(D.abilities), pool = ids.slice(), abil = []; for (let k = 0; k < sc.ab; k++) abil.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
  const G = FA.newGame({ scenario: scId, seed, abil, ai: [level, level] }); let steps = 0;
  while (!G.result && steps++ < 600) { const s = FA.pending(G)[0]; const m = FA.AI.move(G, s, level, { rand: rnd }); if (!m) break; FA.performMove(G, m, s); }
  return G.result && G.result.win ? 1 : 0;
}
process.on('message', msg => {
  const { id, w, c, games, level } = msg;
  FA.AI.w = Object.assign({}, FA.AI.W0, w || {}); Object.assign(FA.AI.W, W0c, c || {});
  let wins = 0; for (const [sc, seed] of games) wins += playOne(sc, seed, level || 'normal');
  process.send({ id, wins, n: games.length });
});
process.send({ ready: true });

// Twin Thrones headless rules test: node rules-test.js [games=300]. Random + AI games must finish with no illegal state and no stuck game.
var E = require('./src/engine.js'), AI = require('./src/ai.js');
var N = +process.argv[2] || 300, res = {}, moves = 0, bad = 0, ages = {}, spec = 0, t0 = Date.now(), seat = { 0: 0, 1: 0 };
function rngOf(G) { return function () { return E.rnd(G); }; }
var LV = ['easy', 'normal', 'hard'];
for (var s = 1; s <= N; s++) {
  var G = E.newGame({ seed: s * 7 + 1 }), k = 0, rng = rngOf(G);
  var lv = [LV[s % 3], LV[(s >> 1) % 3]]; if (s % 5 === 0) lv = ['easy', 'easy'];
  if (s % 7 === 0) lv = ['normal', 'hard'];
  while (!G.over && k < 500) {
    var p = E.sideToAct(G), M = E.validMoves(G);
    if (!M.length) { console.log('STUCK seed', s, G.phase, G.age, JSON.stringify(G.pend)); bad++; break; }
    var m = AI.pick(G, lv[p], rng);
    if (!m || !M.some(function (x) { return JSON.stringify(x) === JSON.stringify(m); })) { console.log('ILLEGAL pick', s, JSON.stringify(m)); bad++; break; }
    try { E.apply(G, m); } catch (e) { console.log('ERR', s, e.message); bad++; break; }
    var inv = E.checkInvariants(G); if (inv.length) { console.log('INV', s, inv.join()); bad++; break; }
    k++;
  }
  if (!G.over) { console.log('NOT FINISHED', s); bad++; }
  res[G.reason] = (res[G.reason] || 0) + 1; moves += k; if (G.winner >= 0) seat[G.winner]++;
  if (lv[0] !== lv[1] && G.winner >= 0) { var w = lv[G.winner], l = lv[1 - G.winner]; var key = w + '>' + l; ages[key] = (ages[key] || 0) + 1; }
}
console.log('games', N, 'ends', JSON.stringify(res), 'avg moves', (moves / N).toFixed(1), 'wins by seat', JSON.stringify(seat), 'level wins', JSON.stringify(ages), 'secs', ((Date.now() - t0) / 1000).toFixed(1));
console.log(bad ? 'FAIL ' + bad + ' problems' : 'PASS rules-test');
process.exit(bad ? 1 : 0);

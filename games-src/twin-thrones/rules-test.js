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

/* ---- rulebook cases (W391) ---- */
(function () {
  var f = [];
  var q = E.C('a2-customs-quay'); if (!(q.cost.coin === 4 && !q.cost.stone)) f.push('trade-post-card-costs-4-coins');
  [[0, 0, 0], [0, 0, 1], [1, 0, 1]].forEach(function (cs) {
    var G = E.newGame({ seed: 3 }), k = 0; while (G.phase === 'draft' && k++ < 30) E.apply(G, E.validMoves(G)[0]);
    G.pyr.forEach(function (c, i) { if (i !== 14) c.taken = true; }); G.mil = cs[0]; G.turn = cs[2]; G.pend = [];
    var mv = E.validMoves(G).filter(function (m) { return m.t === 'discard'; })[0] || E.validMoves(G)[0];
    E.apply(G, mv); var pe = G.pend.filter(function (x) { return x.type === 'first'; })[0];
    if (!pe) { f.push('no-first-chooser-pend ' + JSON.stringify(cs) + ' phase ' + G.phase); return; }
    if (cs[0] === 0 && pe.pl !== cs[2]) f.push('tie-chooser-is-player-who-took-last-card got ' + pe.pl + ' want ' + cs[2]);
  });
  f.forEach(function (x) { console.log('FAIL case ' + x); }); if (f.length) process.exit(1); else console.log('PASS rulebook cases');
})();
console.log('games', N, 'ends', JSON.stringify(res), 'avg moves', (moves / N).toFixed(1), 'wins by seat', JSON.stringify(seat), 'level wins', JSON.stringify(ages), 'secs', ((Date.now() - t0) / 1000).toFixed(1));
console.log(bad ? 'FAIL ' + bad + ' problems' : 'PASS rules-test');
process.exit(bad ? 1 : 0);

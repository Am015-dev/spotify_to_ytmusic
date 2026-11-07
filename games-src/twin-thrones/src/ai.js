// Twin Thrones computer players: easy = random legal, normal = greedy + denial, hard = shallow search over the pyramid. (FLAG: none)
(function () {
  var E = (typeof require !== 'undefined' && typeof module !== 'undefined') ? require('./engine.js') : TT.E;
  var D = (typeof require !== 'undefined' && typeof module !== 'undefined') ? require('./data.js') : TT;
  function feat(G, p) {
    var s = E.score(G, p).total, P = G.players[p], v = s + 0.2 * P.coins;
    var fp = E.fixedProd(G, p); for (var r in fp) v += (G.age >= 3 ? 0.6 : 1.3) * fp[r];
    v += 1.6 * E.choiceProd(G, p).length;
    var sc = E.sciCounts(G, p), d = Object.keys(sc).length; v += 2.4 * d + (d >= 4 ? 5 * (d - 3) : 0);
    for (var k in sc) if (sc[k] === 1 && k !== 'law') v += 0.7;
    var dm = p === 0 ? G.mil : -G.mil; v += 0.5 * dm + (dm >= 7 ? 6 : 0);
    v += 2.5 * P.tokens.length; v += 0.7 * E.count(G, p, 'yellow');
    return v;
  }
  function ev(G, p) { if (G.over) return G.winner === p ? 999 : G.winner === 1 - p ? -999 : 0; return feat(G, p) - 0.9 * feat(G, 1 - p); }
  function wval(id) { var w = D.BYID[id], n = 0; for (var k in w.cost) n += w.cost[k]; return (w.vp || 0) + 2.2 * (w.again ? 1 : 0) + 1.6 * (w.shields || 0) + (w.coin || 0) / 2 + (w.choice ? 2 : 0) + (w.destroy ? 2 : 0) + (w.steal ? 2 : 0) + (w.library ? 3 : 0) + (w.revive ? 1 : 0) - 0.5 * n; }
  function tryApply(G, m) { var g = E.clone(G); try { E.apply(g, m); } catch (e) { return null; } return g; }
  // resolve the player's own pending questions greedily (inside a simulation)
  function settle(G, p) {
    var guard = 0;
    while (!G.over && G.pend.length && E.sideToAct(G) === p && guard++ < 6) {
      var best = null, bv = -1e9;
      E.validMoves(G).forEach(function (m) { var g = tryApply(G, m); if (g) { var v = ev(g, p); if (v > bv) { bv = v; best = m; } } });
      if (!best) break; E.apply(G, best);
    }
    return G;
  }
  function denial(G, p, cellI) {
    var o = 1 - p, g = E.clone(G); g.pend = []; g.turn = o; var cell = g.pyr[cellI], c = D.BYID[cell.id];
    if (!E.buildInfo(g, o, c).ok) return 0;
    var before = ev(g, o); try { E.apply(g, { t: 'build', i: cellI }); } catch (e) { return 0; }
    return Math.max(0, ev(g, o) - before);
  }
  function pick(G, level, rng) {
    var p = E.sideToAct(G), M = E.validMoves(G);
    if (!M.length) return null; if (M.length === 1) return M[0];
    if (level === 'easy') return M[Math.floor(rng() * M.length)];
    if (G.phase === 'draft' && !G.pend.length) { var b = M[0], bv = -1e9; M.forEach(function (m) { var v = wval(m.w) + rng() * 0.3; if (v > bv) { bv = v; b = m; } }); return b; }
    if (G.pend.length) {
      if (G.pend[0].type === 'first') return M.filter(function (m) { return m.who === p; })[0];
      var best = M[0], bs = -1e9; M.forEach(function (m) { var g = tryApply(G, m); var v = g ? ev(g, p) + rng() * 0.01 : -1e9; if (v > bs) { bs = v; best = m; } }); return best;
    }
    var dn = {}, S = E.mask(G), scored = [];
    M.forEach(function (m) {
      var g = tryApply(S, m); if (!g) return; settle(g, p);
      var v = ev(g, p);
      if (dn[m.i] == null) dn[m.i] = 0.45 * denial(S, p, m.i);
      v += dn[m.i];
      if (level === 'hard' && !g.over && E.sideToAct(g) === 1 - p) {
        var worst = 1e9, R = E.validMoves(g);
        if (!R.length) worst = ev(g, p);
        R.forEach(function (r) { var g2 = tryApply(g, r); if (!g2) return; settle(g2, 1 - p); var u = ev(g2, p); if (u < worst) worst = u; });
        v = 0.35 * v + 0.65 * worst + dn[m.i] * 0.35;
      }
      scored.push([v + rng() * 0.05, m]);
    });
    scored.sort(function (a, b) { return b[0] - a[0]; });
    return scored.length ? scored[0][1] : M[0];
  }
  var API = { pick: pick, ev: ev, wval: wval };
  if (typeof module !== 'undefined') module.exports = API; else TT.AI = API;
})();

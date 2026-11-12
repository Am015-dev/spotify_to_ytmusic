// Twin Thrones computer players: easy = random legal, normal = greedy + denial, hard = shallow search over the pyramid. (FLAG: none)
(function () {
  var E = (typeof require !== 'undefined' && typeof module !== 'undefined') ? require('./engine.js') : TT.E;
  var D = (typeof require !== 'undefined' && typeof module !== 'undefined') ? require('./data.js') : TT;
  var PRM = { cw1: 0.55, cw2: 0.1, cardv: 3.1, wv: 6.1, prod12: 2.05, prod3: 0.6, choice: 2.5, sci: 0.86, sci4: 5, sci1: 0.7, mil: 0.3, mil7: 14, sci5: 40, tok: 1.5, yel: 0.7, sellpen: 1.5, topk: 4, h3: 0.5, opp: 0.54 };
  function feat(G, p) {
    var s = E.score(G, p).total, P = G.players[p], v = s + PRM.cw1 * Math.min(P.coins, 10) + PRM.cw2 * Math.max(0, P.coins - 10);
    v += PRM.cardv * P.cards.length + PRM.wv * E.builtWonders(G, p).length;
    var fp = E.fixedProd(G, p); for (var r in fp) v += (G.age >= 3 ? PRM.prod3 : PRM.prod12) * fp[r];
    v += PRM.choice * E.choiceProd(G, p).length;
    var sc = E.sciCounts(G, p), d = Object.keys(sc).length; v += PRM.sci * d + (d >= 4 ? PRM.sci4 * (d - 3) : 0) + (d >= 5 ? PRM.sci5 : 0);
    for (var k in sc) if (sc[k] === 1 && k !== 'law') v += PRM.sci1;
    var dm = p === 0 ? G.mil : -G.mil; v += PRM.mil * dm + (dm >= 7 ? PRM.mil7 : 0);
    v += PRM.tok * P.tokens.length; v += PRM.yel * E.count(G, p, 'yellow');
    return v;
  }
  function ev(G, p) { if (G.over) return G.winner === p ? 999 : G.winner === 1 - p ? -999 : 0; return feat(G, p) - PRM.opp * feat(G, 1 - p); }
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
  var SLIP = { easy: [0.6, 5], normal: [0.28, 3] };
  function pick(G, level, rng) {
    var p = E.sideToAct(G), M = E.validMoves(G);
    if (!M.length) return null; if (M.length === 1) return M[0];
    if (G.phase === 'draft' && !G.pend.length) { var b = M[0], bv = -1e9; M.forEach(function (m) { var v = wval(m.w) + rng() * 0.3; if (v > bv) { bv = v; b = m; } }); return b; }
    if (G.pend.length) {
      if (G.pend[0].type === 'first') return M.filter(function (m) { return m.who === p; })[0];
      var best = M[0], bs = -1e9; M.forEach(function (m) { var g = tryApply(G, m); var v = g ? ev(g, p) + rng() * 0.01 : -1e9; if (v > bs) { bs = v; best = m; } }); return best;
    }
    var dn = {}, S = E.mask(G), scored = [], hardG = [], hasBuild = {}; M.forEach(function (m) { if (m.t === 'build') hasBuild[m.i] = 1; });
    M.forEach(function (m) {
      var g = tryApply(S, m); if (!g) return; settle(g, p);
      var v = ev(g, p);
      if (dn[m.i] == null) dn[m.i] = 0.45 * denial(S, p, m.i);
      v += dn[m.i];
      if (m.t === 'discard' && hasBuild[m.i]) v -= PRM.sellpen + 0.15 * Math.max(0, G.players[p].coins - 8);   // do not sell what you can build, least of all while rich
      if (level === 'hard' && !g.over && E.sideToAct(g) === 1 - p) {
        var worst = 1e9, R = E.validMoves(g);
        if (!R.length) worst = ev(g, p);
        R.forEach(function (r) { var g2 = tryApply(g, r); if (!g2) return; settle(g2, 1 - p); var u = ev(g2, p); if (u < worst) worst = u; });
        v = 0.35 * v + 0.65 * worst + dn[m.i] * 0.5; hardG[hardG.length] = [m, g];
      }
      scored.push([v + rng() * 0.05, m]);
    });
    scored.sort(function (a, b) { return b[0] - a[0]; });
    if (level === 'hard' && scored.length > 1) {   // 3-ply on the best few: my move, their best reply, my best follow-up (still on the masked copy)
      var top = scored.slice(0, PRM.topk);
      top.forEach(function (sc) {
        var g = null; hardG.forEach(function (h) { if (h[0] === sc[1]) g = h[1]; });
        if (!g || g.over || E.sideToAct(g) !== 1 - p) return;
        var worst = 1e9, R = E.validMoves(g);
        R.forEach(function (r) {
          var g2 = tryApply(g, r); if (!g2) return; settle(g2, 1 - p);
          var u;
          if (g2.over || E.sideToAct(g2) !== p) u = ev(g2, p);
          else { u = -1e9; E.validMoves(g2).forEach(function (s2) { var g3 = tryApply(g2, s2); if (g3) { settle(g3, p); var w = ev(g3, p); if (w > u) u = w; } }); if (u === -1e9) u = ev(g2, p); }
          if (u < worst) worst = u;
        });
        if (worst < 1e9) sc[0] = (1 - PRM.h3) * sc[0] + PRM.h3 * (worst + dn[sc[1].i] * 0.5);
      });
      top.sort(function (a, b) { return b[0] - a[0]; }); return top[0][1];
    }
    if (!scored.length) return M[0];
    // W492: Easy and Normal slip like a human: sometimes they take a lesser move from their top few (Normal ~2 of 3 vs a sensible new player)
    var sl = SLIP[level]; if (sl && scored.length > 1 && rng() < sl[0]) return scored[1 + Math.floor(rng() * Math.min(sl[1], scored.length - 1))][1];
    return scored[0][1];
  }
  var API = { SLIP: SLIP, pick: pick, ev: ev, wval: wval, PRM: PRM };
  if (typeof module !== 'undefined') module.exports = API; else TT.AI = API;
})();

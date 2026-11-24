// Onyx Atelier computer rival: easy = loose greedy with noise, normal = greedy plan + blocks a winning rival, hard = plan + rival's best reply. (FLAG: none)
var OAI = (function () {
  var E = (typeof OE !== 'undefined') ? OE : require('./engine.js');
  var COLS = E.COLS;
  function worth(c) { return c.pts * 1.25 + c.cr * 1.4 + c.n * 1.6 + (c.ab === 'again' ? 2.2 : c.ab ? 1.1 : 0) + (c.b === 'x' ? 0.6 : 0); }
  function side(G, p) {
    var P = G.pl[p], pts = E.points(P), cr = E.crowns(P), bc = E.bestColour(P).v, v = 0;
    if (E.winOf(P)) return 1000;
    v += pts * 2.4 + cr * 1.6 + bc * 1.4 + Math.max(pts / 20, cr / 10, bc / 10) * 18;
    if (cr >= 2 && P.roy.length < 1 && G.royals.length) v += 1.5;
    var b = E.bonuses(P); COLS.forEach(function (c) { v += Math.min(b[c], 4) * 1.5 + Math.max(0, b[c] - 4) * 0.5; });
    v += (P.t.w + P.t.u + P.t.g + P.t.r + P.t.k) * 0.55 + P.t.p * 0.95 + P.t.o * 1.0 + P.fav * 0.9;
    // what I am close to buying
    var opts = [];
    G.pyr.forEach(function (row) { row.forEach(function (id) { if (id !== null) opts.push(id); }); });
    P.res.forEach(function (id) { opts.push(id); opts.push(id); });
    var near = opts.map(function (id) { var pr = E.price(P, id); if (pr.why) return 0; return worth(E.card(id)) / (1 + pr.short * 0.9); }).sort(function (a, c) { return c - a; });
    v += (near[0] || 0) * 0.6 + (near[1] || 0) * 0.3;
    v += P.res.length * 0.3;
    var S = G.sty && G.sty[p];   // story rivals only: a play style as extra weights (quick game has no G.sty)
    if (S) v += (S.tok || 0) * E.tokens(P) + (S.res || 0) * P.res.length + (S.cr || 0) * cr + (S.pts || 0) * pts + (S.fav || 0) * P.fav + (S.roy || 0) * P.roy.length;
    return v;
  }
  function evalFor(G, p) {
    if (G.over) return G.over.winner === p ? 5000 : -5000;
    return side(G, p) - side(G, 1 - p) * 0.92;
  }
  // answer any pending question greedily for player p
  function settle(G, p) {
    var guard = 0;
    while (G.pend && !G.over && G.turn === p && guard++ < 20) {
      var vs = E.validMoves(G), best = null, bv = -1e9;
      vs.forEach(function (m) { var H = E.clone(G); E.performMove(H, m); var x = evalFor(H, p); if (x > bv) { bv = x; best = m; } });
      E.performMove(G, best);
    }
    return G;
  }
  function after(G, seq, p) { var H = E.clone(G); for (var i = 0; i < seq.length; i++) { E.performMove(H, seq[i]); } settle(H, p); return H; }
  // every plan: [optional privilege] [optional refill] + one mandatory action
  function plans(G) {
    var p = G.turn, out = [], vs = E.validMoves(G);
    if (G.pend) return vs.map(function (m) { return [m]; });
    var man = vs.filter(function (m) { return m.t !== 'fav' && m.t !== 'refill'; });
    man.forEach(function (m) { out.push([m]); });
    var favs = vs.filter(function (m) { return m.t === 'fav'; });
    var ref = vs.some(function (m) { return m.t === 'refill'; });
    // a privilege first: only plans that then buy (keeps the search small)
    favs.forEach(function (f) { var H = E.clone(G); E.performMove(H, f); E.validMoves(H).forEach(function (m) { if (m.t === 'buy') out.push([f, m]); }); });
    if (ref || !man.length) { var H = E.clone(G); E.performMove(H, { t: 'refill' }); E.validMoves(H).forEach(function (m) { if (m.t !== 'fav') out.push([{ t: 'refill' }, m]); }); }
    return out;
  }
  function score(G, seq, p, lvl) {
    var H = after(G, seq, p), v = evalFor(H, p);
    if (H.over) return v;
    if (lvl >= 1 && H.turn !== p) {   // does this hand the rival a win?
      var R = H.turn, threat = -1e9, mv = E.mandatory(H), cnt = 0;
      for (var i = 0; i < mv.length; i++) {
        var m = mv[i]; if (lvl === 1 && m.t !== 'buy') continue;
        if (lvl === 2 && m.t === 'take' && m.cells.length < 2 && ++cnt > 8) continue;
        var K = after(H, [m], R); var x = K.over && K.over.winner === R ? 5000 : evalFor(K, R);
        if (x > threat) threat = x;
      }
      if (lvl === 1) { if (threat >= 5000) v -= 3000; }
      else if (threat > -1e9) v = v * 0.15 - threat * 0.85;
    }
    return v;
  }
  function pick(G, level) {
    var p = G.turn, lvl = level === 'easy' ? 0 : level === 'hard' ? 2 : 1, ps = plans(G);
    if (!ps.length) return [];
    var scored = ps.map(function (s) { return { s: s, v: score(G, s, p, lvl === 2 ? 1 : lvl) }; });
    scored.sort(function (a, b) { return b.v - a.v; });
    if (lvl === 2) {   // deeper look at the best few
      var top = scored.slice(0, 10); top.forEach(function (o) { o.v = score(G, o.s, p, 2); }); top.sort(function (a, b) { return b.v - a.v; }); scored = top;
    }
    if (lvl === 0) {   // easy: often settles for a decent but not best plan
      var n = Math.min(scored.length, 8), r = E.rnd(G);
      var k = r < 0.4 ? 0 : Math.floor(E.rnd(G) * n);
      if (scored[0].v >= 4000) k = E.rnd(G) < 0.5 ? 0 : k;
      return scored[k].s;
    }
    return scored[0].s;
  }
  // a hint for the human: the best plan at normal strength
  function hint(G) { return pick(E.clone(G), 'normal'); }
  return { pick: pick, hint: hint, evalFor: evalFor, settle: settle, worth: worth };
})();
if (typeof module !== 'undefined') module.exports = OAI;

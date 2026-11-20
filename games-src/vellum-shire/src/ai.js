// Vellum Shire computer players. Levels: easy, normal, hard. Plans the whole turn (both dice, pending choices) with a small search.
var VSAI = (function () {
  var V = (typeof VS !== 'undefined') ? VS : require('./data.js');
  var E = (typeof VSE !== 'undefined') ? VSE : require('./engine.js');
  function T(id) { return V.TILES[id]; }
  var COLV = { K: 7, B: 5, F: 5, L: 5, T: 5.5, Q: 4.5 };
  function left(G) { return (4 - G.ph) * 5 + (5 - G.rd); } // rounds left incl. this one
  var W0 = { reg: 1, placed: 2.2, sto: 1, silver: 1.3, wk: 0.8, goods: 2.1, q: 1.1, trk: 0.6, fr: 0.25, opp: 0 }, W = W0;
  function value(G, s) {
    var P = G.p[s];
    if (G.over) return G.final[s].total - G.final[1 - s].total * 0.15;
    var L = left(G), late = L <= 2;
    var v = P.vp;
    v += P.silver * (late ? 1 : W.silver) + Math.min(P.wk, 8) * (late ? 0.5 : W.wk) + Math.max(0, P.wk - 8) * 0.3;
    P.goods.forEach(function (x) { v += x.n * (late ? 1.2 : W.goods) + 0.6; });
    // stored tiles: worth something if they can still be placed
    P.sto.forEach(function (id) {
      if (id == null) return;
      var t = T(id), spots = V.HEX.filter(function (h) { return E.canPlaceAt(G, s, id, h.i, true, 0); }).length;
      var anyEmpty = V.HEX.some(function (h) { return E.colAt(P, h.i) === t.col && P.est[h.i] == null; });
      if (!anyEmpty) return;
      v += W.sto * (late ? 0.3 : 0.6) * (COLV[t.col] * (spots ? 1 : 0.55) + (t.col === 'F' ? t.a * 0.6 : 0) + (t.col === 'L' ? loreVal(G, P, t.a) : 0));
    });
    // estate: progress on regions, placed lore and quarries
    E.board(P).regions.forEach(function (r) {
      var f = r.cells.filter(function (c) { return P.est[c] != null; }).length, n = r.cells.length;
      if (f === n || f === 0) return;
      v += (V.SIZE_PTS[n] + V.PHASE_BONUS[G.ph] * 0.7) * Math.pow(f / n, 1.6) * (L > 3 ? 0.55 : 0.3) * W.reg;
    });
    var placed = P.est.filter(function (id) { return id != null; }).length - 1;
    v += placed * (L > 1 ? W.placed : 0.5);
    var q = P.est.filter(function (id) { return id != null && T(id).col === 'Q'; }).length;
    v += q * (4 - G.ph) * W.q;
    v += Math.min(P.trk - G.p[1 - s].trk, 2) * W.trk;
    // open frontier: empty spaces next to my tiles (room to place)
    var fr = 0; V.HEX.forEach(function (h) { if (P.est[h.i] == null && h.nb.some(function (n) { return P.est[n] != null; })) fr++; });
    v += Math.min(fr, 10) * W.fr;
    P.lore.forEach(function (n) { if (V.LORE[n].k.indexOf('end') === 0) v += endLore(G, s, n); });
    return v;
  }
  function startVal(P, h) { var c = {}; V.HEX[h].nb.forEach(function (n) { c[E.colAt(P, n)] = 1; }); return Object.keys(c).length * 2 + V.HEX[h].nb.length - Math.abs(V.HEX[h].r - 3) * 0.5; }
  function loreVal(G, P, n) { var k = V.LORE[n].k; if (k.indexOf('endB:') === 0) return 2; if (k === 'endSold' || k === 'endKinds') return 3; return 2.5; }
  function endLore(G, s, n) { var f = E.final(G, s); var P = G.p[s]; var save = P.lore; P.lore = [n]; var x = E.final(G, s).lore; P.lore = save; return x; }
  function turnOver(G0, G1, s) { return G1.over || E.side(G1) !== s || (G1.p[s].used[0] && G1.p[s].used[1] && !G1.pend.length); }
  function prune(G, ms, wkCap) { return ms.filter(function (m) { return !(m.w > wkCap); }); }
  var budget = 0, NOISE = 0, NN = 4, WH = Object.assign({}, W0, { goods: 1.6, silver: 1.1, reg: 0.8, placed: 2.6 });
  function best(G, s, depth, lvl) {
    var ms = prune(G, E.validMoves(G), lvl === 'hard' ? 3 : 1);
    var bestV = -1e9, bestM = null;
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i];
      if (m.t === 'end' && ms.length > 1 && depth > 0) { /* consider below */ }
      var g = E.clone(G); var r = E.apply(g, m); if (!r.ok) continue; budget--;
      var v;
      if (turnOver(G, g, s) || depth <= 0 || budget <= 0) v = value(g, s);
      else v = best(g, s, depth - 1, lvl).v;
      if (m.w) v -= m.w * 0.15;
      if (NOISE && depth === 2) v += (rnd() - 0.5) * NOISE;
      if (v > bestV) { bestV = v; bestM = m; }
    }
    if (!bestM) return { v: value(G, s), m: ms[0] };
    return { v: bestV, m: bestM };
  }
  // AI noise from its own generator, seeded from the game state: the same game plays the same way (tests repeat)
  var RS = 1; function rnd() { RS = (Math.imul(RS, 1103515245) + 12345) & 0x7fffffff; return RS / 0x7fffffff; }
  function pick(G, lvl) {
    RS = ((G.seed || 1) * 31 + (G.turnNo || 0) * 977 + G.ph * 131 + G.rd * 17 + G.p[0].dice[0] * 7 + G.p[1].dice[1] * 3 + G.p[0].vp + G.p[1].vp * 5) & 0x7fffffff || 1;
    var s = E.side(G); lvl = lvl || 'normal';
    var ms = E.validMoves(G);
    if (ms.length === 1) return ms[0];
    if (ms[0].t === 'start') { var P0 = G.p[s]; return ms.slice().sort(function (a, b) { return startVal(P0, b.h) - startVal(P0, a.h); })[0]; }
    if (lvl === 'simple') return ms[Math.floor(rnd() * ms.length)];
    if (lvl === 'easy') { NOISE = 7; budget = 500; var r = best(G, s, 2, 'easy').m; NOISE = 0; return r; }
    if (lvl === 'oneply') {
      // one step ahead with noise
      var sc = ms.filter(function (m) { return !(m.w > 1); }).map(function (m) { var g = E.clone(G); E.apply(g, m); return { m: m, v: value(g, s) + rnd() * 6 - (m.w || 0) * 0.5 }; });
      sc.sort(function (a, b) { return b.v - a.v; });
      return sc[0].m;
    }
    // Normal: the search with a little judgement noise. Hard: no noise, a bigger search, tuned weights.
    budget = lvl === 'hard' ? 8000 : 1500; NOISE = lvl === 'hard' ? 0 : NN;
    W = lvl === 'hard' ? WH : W0; var res = best(G, s, 2, lvl).m; W = W0; NOISE = 0; return res;
  }
  return { pick: pick, value: value, setHard: function (o) { WH = Object.assign({}, W0, o); }, setNN: function (n) { NN = n; } };
})();
if (typeof module !== 'undefined') module.exports = VSAI;

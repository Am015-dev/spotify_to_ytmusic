/* A newcomer who reads the screen but ignores the star: builds where the previews show points or the most region progress,
   takes tiles that fit a free space next to their land, sells piles of 2+, never plans ahead. Used by newbie-test.js. */
(function (root) {
  function pick(VB, G) {
    var s = VB.actor(G), p = G.P[s], M = VB.validMoves(G); if (!M.length) return null;
    var free = M.filter(function (m) { return !m.w; }); if (!free.length) free = M;
    var top = G.pend && G.pend.length ? G.pend[G.pend.length - 1] : null;
    if (top && top.t === 'discard') return free[0];
    function sim(m) { var c = VB.fclone(G), r = VB.performMove(c, m); return r.ok ? { c: c, ev: r.ev } : null; }
    var best = null, bv = -1;
    free.forEach(function (m) {
      if (m.k !== 'place') return; var r = sim(m); if (!r) return;
      var pts = 0; r.ev.forEach(function (e) { if (e.e === 'score' && e.p === s) pts += e.n; });
      var reg = VB.REGIONS[VB.CELLS[m.cell].reg], f = reg.cells.filter(function (x) { return r.c.P[s].estate[x]; }).length;
      var v = pts * 10 + 5 * f / reg.cells.length; if (v > bv) { bv = v; best = m; }
    });
    if (best) return best;
    var pref = { castle: 5, bld: 5, mine: 4, ship: 3, pas: 3, know: 2 };
    free.forEach(function (m) {
      if (m.k !== 'take' && m.k !== 'grab') return; var t = G.depots[m.v][m.slot]; if (!t) return;
      var fits = 0; for (var i = 0; i < VB.CELLS.length; i++) if (VB.CELLS[i].col === t.t && VB.canPlace(p, t, i, 0)) fits = 1;
      var v = (fits ? 10 : 0) + (pref[t.t] || 1); if (v > bv) { bv = v; best = m; }
    });
    if (best && p.store.length < 3) return best;
    var sell = free.filter(function (m) { return m.k === 'sell' && p.goods[m.v] >= 2; })[0]; if (sell) return sell;
    if (best) return best;
    var other = free.filter(function (m) { return m.k === 'ship' || m.k === 'sell'; })[0]; if (other) return other;
    var wk = free.filter(function (m) { return m.k === 'workers'; })[0]; if (wk) return wk;
    var any = free.filter(function (m) { return m.k !== 'end' && m.k !== 'skip'; })[0];
    return any || free.filter(function (m) { return m.k === 'end' || m.k === 'skip'; })[0] || free[0];
  }
  root.NEWBIE = { pick: pick };
  if (typeof module !== 'undefined') module.exports = root.NEWBIE;
})(typeof window !== 'undefined' ? window : globalThis);

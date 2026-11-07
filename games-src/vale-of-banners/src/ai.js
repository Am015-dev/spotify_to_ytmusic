/* Vale of Banners computer stewards. eval() scores a position for one seat; levels search deeper.
   easy = greedy with noise, normal = greedy one action, hard = looks ahead through the whole turn (both dice + chains).
   Styles (Story bosses): 'keeps' loves castles, 'barges' ships and goods, 'flocks' pastures, 'silver' mines and selling. */
(function (V) {
  function fclone(G) { var l = G.log; G.log = []; var c = JSON.parse(JSON.stringify(G)); G.log = l; return c; }
  V.fclone = fclone;
  function rem(G) { return Math.max(0, 1 - (G.phase * 5 + G.round) / (G.nPhases * 5)); }
  var STYLE = { keeps: { castle: 2.5 }, barges: { ship: 2.5, goods: 0.25 }, flocks: { pas: 2.5 }, silver: { mine: 2.5, silver: 0.3 } };
  function tileVal(G, p, t, r, st) {
    var phasesLeft = G.nPhases - G.phase - 1, b;
    switch (t.t) {
      case 'castle': b = 5; break;
      case 'mine': b = 1.5 + 1.0 * phasesLeft; break;
      case 'know': var e = V.KNOWBY[t.k].e; b = e.indexOf('end:') === 0 ? 3 : 2 + 3 * r; break;
      case 'bld': b = { tower: 4.5, hall: 4.5, mint: 3.5, inn: 3.5, store: 3.5, carp: 3.5, chapel: 3.5, mkt: 3.5 }[t.k]; break;
      case 'pas': b = 1 + t.n * 0.9; break;
      case 'ship': b = 3.5; break;
      default: b = 2;
    }
    return b + ((st && st[t.t]) || 0);
  }
  V.evalSeat = function (G, s) {
    var p = G.P[s], r = rem(G), st = STYLE[G.seats[s].style] || null, v = p.vp;
    if (G.over) { return p.vp * 1 + (G.winner === s ? 5 : 0); }
    v += p.silver * (1 + (st && st.silver || 0)) + Math.min(p.workers, 5) * 0.55 + Math.max(0, p.workers - 5) * 0.12;
    var gsum = 0; V.goodsTypes(p).forEach(function (g) { gsum += p.goods[g]; });
    v += gsum * ((G.n + 1) * (0.55 + (st && st.goods || 0)) + 0.3) * (r > 0.04 ? 1 : 0.4);
    /* stored tiles: worth something only if they can still go somewhere and there is time */
    var tf = Math.min(1, r * 4);
    p.store.forEach(function (t) {
      var spots = 0; for (var i = 0; i < V.CELLS.length; i++) if (V.CELLS[i].col === t.t && !p.estate[i]) spots++;
      if (!spots) return; var adj = V.placeTargets(p, t, 0).length;
      v += tileVal(G, p, t, r, st) * tf * (adj ? 0.45 : 0.25);
    });
    /* estate: region progress (finishing early is worth the season bonus), colour progress */
    V.REGIONS.forEach(function (reg) {
      if (p.regDone[reg.id]) return;
      var f = 0; reg.cells.forEach(function (x) { if (p.estate[x]) f++; });
      if (!f) return; var sz = reg.cells.length;
      v += (0.4 * f / sz + 0.6 * (f / sz) * (f / sz)) * (V.REGION_PTS[Math.min(8, sz)] + V.PHASE_BONUS[Math.min(4, G.phase)]) * 0.55 * Math.min(1, r * 2.5);
    });
    for (var col in V.COLCOUNT) {
      if (p.colDone[col]) continue; var f = 0, n = V.COLCOUNT[col];
      for (var k in p.estate) if (V.CELLS[k].col === col) f++;
      var bonus = (V.COLOUR_BONUS[G.n][G.colTaken[col] || 0] || 0); v += Math.pow(f / n, 3) * bonus * 0.6;
    }
    /* each built tile keeps a little value (frontier to build from) and lore keeps paying */
    var built = V.estateFilled(p); v += built * (1.2 + 2 * r);
    var kn = 0; for (var e in p.know) if (e.indexOf('end:') !== 0) kn++; v += kn * 2.5 * r;
    var b = V.endBreakdown(G, p); v += b.lore * 0.9;
    if (st) { for (var x in p.estate) { var t = p.estate[x]; if (st[t.t]) v += st[t.t] * 0.5; } }
    v += p.pos * 0.4;
    return v;
  };
  function apply(G, m) { var c = fclone(G); V.performMove(c, m); return c; }
  function noise(G) { return V.rnd(G); }
  /* search the rest of my turn: depth plies, beam = moves expanded per ply */
  function search(G, s, depth, beam) {
    if (G.over || V.actor(G) !== s) return V.evalSeat(G, s);
    var M = V.validMoves(G); if (!M.length) return V.evalSeat(G, s);
    if (depth <= 0) return V.evalSeat(G, s);
    var sc = M.map(function (m) { var c = apply(G, m); return { m: m, c: c, v: V.evalSeat(c, s) }; });
    sc.sort(function (a, b) { return b.v - a.v; });
    var best = -1e9;
    for (var i = 0; i < Math.min(beam, sc.length); i++) { var v = search(sc[i].c, s, depth - 1, beam); if (v > best) best = v; }
    return best;
  }
  V.aiMove = function (G, lvl) {
    var s = V.actor(G), M = V.validMoves(G);
    if (!M.length) return null; if (M.length === 1) return M[0];
    lvl = lvl || G.seats[s].ai || 'normal';
    if (lvl === 'first') return M[0];
    if (lvl === 'random') return M[Math.floor(V.rnd(G) * M.length)];
    var sc = M.map(function (m) { var c = apply(G, m); return { m: m, c: c, v: V.evalSeat(c, s) }; });
    if (lvl === 'easy') { sc.forEach(function (x) { x.v += noise(G) * 6; }); }
    sc.sort(function (a, b) { return b.v - a.v; });
    if (lvl === 'hard') {
      var best = sc[0], bv = -1e9;
      for (var i = 0; i < Math.min(6, sc.length); i++) { var v = search(sc[i].c, s, 3, 4); if (v > bv) { bv = v; best = sc[i]; } }
      return best.m;
    }
    return sc[0].m;
  };
  /* a one-line reason for the hint bulb */
  V.why = function (G, m) {
    var p = G.P[V.actor(G)];
    switch (m.k) {
      case 'take': return 'Take ' + V.tileName(G.depots[m.v][m.slot]) + ' for your storage.';
      case 'place': var c = V.CELLS[m.cell]; return 'Build ' + V.tileName(p.store[m.s]) + ' on a ' + c.num + ' space.';
      case 'sell': return 'Sell your ' + V.GOODS[m.v] + ' for points and silver.';
      case 'workers': return 'Take workers to bend later dice.';
      case 'buy': return 'Buy ' + V.tileName(G.black[m.slot]) + ' from the back lane.';
      case 'grab': return 'Grab ' + V.tileName(G.depots[m.v][m.slot]) + '.';
      case 'ship': return 'Load the goods from stall ' + m.v + '.';
      case 'end': return 'Both dice used: end your turn.';
      case 'discard': return 'Storage is full: drop the weakest tile.';
      default: return 'Skip this bonus.';
    }
  };
})(VB);
if (typeof module !== 'undefined') module.exports = VB;

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
    v += p.silver * (1 + (st && st.silver || 0)) + Math.min(p.workers, 4) * (0.5 + 0.15 * r) + Math.max(0, p.workers - 4) * 0.08;
    var gsum = 0; V.goodsTypes(p).forEach(function (g) { gsum += p.goods[g]; });
    v += gsum * (G.n * (0.55 + (st && st.goods || 0)) + 0.3) * (r > 0.04 ? 1 : 0.4);
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
      var bonus = (V.COLOUR_BONUS[Math.max(2, G.n)][G.colTaken[col] || 0] || 0); v += Math.pow(f / n, 3) * bonus * 0.6;
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

  /* ---- Addendum 5: see how you score. Pure functions, no state change. ---- */
  var EFFECT = { castle: 'free action with any number', mine: '+1 silver every season end', know: 'bends a rule for the rest of the game', ship: 'moves you up the turn track, then load goods',
    hall: 'build again at once (any number)', carp: 'take a Building', chapel: 'take a Keep, Mine or Lore', mkt: 'take a Barge or Pasture', inn: '+4 workers', mint: '+2 silver', tower: '+4 points', store: 'sell one kind of goods' };
  V.tileEffect = function (t) { return t.t === 'bld' ? EFFECT[t.k] : t.t === 'pas' ? 'scores ' + t.n + ' per animal of its kind in the meadow' : EFFECT[t.t]; };
  /* what building tile t on cell ci scores for player p, mirrored from place() */
  V.placeGain = function (G, p, t, ci) {
    var c = V.CELLS[ci], reg = V.REGIONS[c.reg], items = [], vp = 0, f = 0;
    reg.cells.forEach(function (x) { if (p.estate[x]) f++; });
    var size = reg.cells.length, left = size - f - 1;
    if (!p.regDone[reg.id] && left === 0) { var n = V.REGION_PTS[Math.min(8, size)] + V.PHASE_BONUS[Math.min(4, G.phase)]; items.push({ n: n, why: 'region', txt: 'Region of ' + size + ' filled' }); vp += n; }
    if (!p.colDone[c.col] && V.CELLS.every(function (x) { return x.col !== c.col || x.i === ci || p.estate[x.i]; })) {
      var tb = V.COLOUR_BONUS[Math.max(2, G.n)], cb = tb[G.colTaken[c.col] || 0] || 0; if (cb) { items.push({ n: cb, why: 'colour', txt: V.COLNAME[c.col] + ' colour complete' }); vp += cb; } }
    if (t.t === 'pas') { var sum = t.n + (p.know['pasVP'] ? 2 : 0); reg.cells.forEach(function (x) { var y = p.estate[x]; if (y && y.t === 'pas' && y.k === t.k) sum += y.n; }); if (sum) { items.push({ n: sum, why: 'animals', txt: 'Animals in this meadow' }); vp += sum; } }
    if (t.t === 'bld' && t.k === 'tower') { items.push({ n: 4, why: 'tower', txt: 'Beacon Tower' }); vp += 4; }
    if (t.t === 'ship' && p.know['shipVP']) { items.push({ n: 2, why: 'lore', txt: 'Lore bonus' }); vp += 2; }
    return { vp: vp, items: items, have: f + 1, size: size, left: left, cells: reg.cells.slice(), reg: reg.id };
  };
  V.bestSpot = function (G, p, t) {   /* best place to build t at all (any die): {ci, g} or null */
    var best = null; V.placeTargets(p, t, 0).forEach(function (ci) { var g = V.placeGain(G, p, t, ci); if (!best || g.vp > best.g.vp || (g.vp === best.g.vp && g.left < best.g.left)) best = { ci: ci, g: g }; }); return best;
  };
  /* preview of a move for the actor: { vp (points now), later (points the tile can score when built), txt (plain line), cells (region to highlight), parts } */
  V.preview = function (G, m) {
    var s = V.actor(G), p = G.P[s], o = { vp: 0, later: 0, parts: [], cells: [], txt: '' }, t, g;
    switch (m.k) {
      case 'place': t = p.store[m.s]; g = V.placeGain(G, p, t, m.cell); o.vp = g.vp; o.cells = g.cells; g.items.forEach(function (i) { o.parts.push('+' + i.n + ' ' + i.txt); });
        if (!g.items.length || g.left > 0) o.parts.push(V.COLNAME[V.CELLS[m.cell].col] + ' region ' + g.have + '/' + g.size + (g.left ? ', ' + g.left + ' to go' : ''));
        var ef = V.tileEffect(t); if (ef && t.t !== 'pas' && !(t.t === 'bld' && t.k === 'tower')) o.parts.push(V.tileName(t) + ': ' + ef); break;
      case 'take': case 'grab': case 'buy': t = m.k === 'buy' ? G.black[m.slot] : G.depots[m.v][m.slot]; var b = V.bestSpot(G, p, t);
        if (b) { o.later = b.g.vp; o.cells = b.g.cells; o.parts.push(b.g.vp ? 'Build it later for +' + b.g.vp + ' (' + (b.g.items[0] ? b.g.items[0].txt : '') + ')' : 'Builds into a ' + V.COLNAME[t.t] + ' region (' + b.g.have + '/' + b.g.size + ')'); }
        else o.parts.push('No ' + V.COLNAME[t.t] + ' space touches your land yet');
        var e2 = V.tileEffect(t); if (e2) o.parts.push(e2); break;
      case 'sell': var n = p.goods[m.v] || 0; o.vp = V.saleVP(G, p, n); o.parts.push('+' + o.vp + ' for ' + n + ' ' + V.GOODS[m.v], '+' + (1 + (p.know['saleSil'] ? 1 : 0)) + ' silver'); break;
      case 'workers': o.parts.push('+' + (2 + (p.know['wk+1'] ? 1 : 0)) + ' workers: bend later dice'); break;
      case 'ship': var gs = G.goodsAt[m.v].length; o.parts.push(gs + ' goods tile' + (gs === 1 ? '' : 's') + ' to your shelf'); break;
      case 'end': o.parts.push('End your turn'); break;
      default: o.parts.push(V.why(G, m));
    }
    o.txt = o.parts.join(' · '); return o;
  };
  /* greedy solver: value of every legal move = change in our evaluation after it (the same measure the computer uses at normal level) */
  V.advise = function (G) {
    var s = V.actor(G), M = V.validMoves(G), base = V.evalSeat(G, s), L = [];
    M.forEach(function (m) { var c = apply(G, m); L.push({ m: m, v: V.evalSeat(c, s) - base, pv: V.preview(G, m) }); });
    var best = null; L.forEach(function (x) { if (x.m.k !== 'end' && (!best || x.v > best.v)) best = x; });
    return { list: L, best: best };
  };
  /* rate the move just chosen: good / okay / poor against the best move, with the reason */
  V.rate = function (G, m) {
    var A = V.advise(G), me = null; A.list.forEach(function (x) { if (V.same(x.m, m)) me = me || x; });
    if (!me || !A.best || m.k === 'end' || A.list.length < 3) return null;
    var gap = A.best.v - me.v, tol = Math.max(1.5, 0.18 * Math.abs(A.best.v));
    var r = (gap <= tol || V.same(A.best.m, m)) ? 'good' : gap <= tol * 3 ? 'okay' : 'poor';
    var bw = V.why(G, A.best.m).replace(/\.$/, ''), bp = A.best.pv.vp ? ' (+' + A.best.pv.vp + ' now)' : A.best.pv.later ? ' (+' + A.best.pv.later + ' when built)' : '';
    var better = r === 'good' ? '' : 'Better: ' + bw.charAt(0).toLowerCase() + bw.slice(1) + bp + '.';
    return { r: r, better: better, gap: gap };
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

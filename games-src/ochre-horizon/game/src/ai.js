// Ochre Horizon computer player: one-ply lookahead on a cloned state with a credit-equivalent valuation.
// Levels: easy (noisy, shortsighted), normal (best one-ply move), hard (normal + reserve and milestone/award awareness).
(function (root) {
  var OH = root.OH || require('./engine.js');
  var PV = { mc: 1, steel: 1.8, ti: 2.6, plant: 1.6, energy: 1.4, heat: 0.8 };
  var RV = { mc: 1, steel: 1.8, ti: 2.8, plant: 1.4, energy: 0.9, heat: 0.75 };
  var FIXGL = 0;
  var CAP = { mc: 30, steel: 10, ti: 8, plant: 9, energy: 6, heat: 9 };
  function gensLeft(G) {
    var left = (OH.TEMP_MAX - G.temp) / 2 + (OH.OXY_MAX - G.oxy) + (OH.OCEAN_MAX - G.oceans);
    return Math.max(0.5, Math.min(14, left / 4.2));
  }
  function value(G, p) {
    var P = G.pl[p], gl = FIXGL || gensLeft(G), v = 0;
    var sc = OH.score(p);
    v += sc.tr * (6 + gl * 0.9);
    v += (sc.total - sc.tr) * 6;
    for (var r in PV) { var cap = CAP[r], st = P[r]; if (r === 'heat' && G.temp >= OH.TEMP_MAX) cap = 0; v += P.prod[r] * PV[r] * Math.max(0, gl - 0.6) + (Math.min(st, cap) + 0.3 * Math.max(0, st - cap)) * RV[r]; }
    v += Math.min(P.hand.length, 12) * 1.6;
    var acts = OH.actionSources(p).length, effs = OH.effects(p).length;
    v += acts * 1.8 * gl + effs * 1.2 * gl;
    for (var id in P.res) { var c = OH.card(id); if (c && c.vp && c.vp.per === 'res') v += 0; }
    return v;
  }
  function evalState(G, p) { return value(G, p) - 0.55 * value(G, 1 - p); }
  function strip(G) { var l = G.log, e = G.ev; G.log = []; G.ev = []; var s = JSON.stringify(G); G.log = l; G.ev = e; return s; }
  // resolve pendings with a cheap greedy policy (used inside lookahead)
  function settle(p, depth) {
    var G = OH.G, guard = 0;
    while (G.pending && guard++ < 12) {
      var mv = OH.validMoves(); if (!mv.length) break;
      var best = mv[0];
      if (G.pending.h === 'place') best = bestPlace(G, G.pending.p, mv);
      else if (mv.length > 1 && depth < 1) best = pickBest(mv, G.pending.p, depth + 1).m;
      OH.performMove(best);
    }
  }
  function placeScore(G, p, t, s) {
    var S = OH.MAP.spaces[s] || OH.MAP.OFFMAP[s] || { bonus: [], adj: [] }, v = 0;
    (S.bonus || []).forEach(function (b) { v += b === 'card' ? 3 : RV[b] || 1; });
    (S.adj || []).forEach(function (a) {
      var T = G.tiles[a];
      if (!T) { if (t === 'city') v += 0.6; return; }
      if (T.t === 'ocean') v += 2;
      if (t === 'greenery' && T.t === 'city') v += T.o === p ? 5 : -4;
      if (t === 'city' && T.t === 'greenery') v += 4;
      if (t === 'ocean' && T.o === 1 - p) v -= 1.5;
    });
    return v;
  }
  function bestPlace(G, p, mv) { var b = mv[0], bs = -1e9; mv.forEach(function (m) { var s = placeScore(G, p, G.pending.d.t, m.s); if (s > bs) { bs = s; b = m; } }); return b; }
  function tryMove(m, p, depth) {
    var G0 = OH.G, snap = strip(G0), log = G0.log, ev = G0.ev;
    var G1 = JSON.parse(snap); G1.log = []; G1.ev = []; OH.G = G1;
    var ok = OH.performMove(m), v = -1e9;
    if (ok) { settle(p, depth || 0); v = evalState(OH.G, p); }
    OH.G = G0; G0.log = log; G0.ev = ev;
    return v;
  }
  function pickBest(moves, p, depth) {
    var best = null, bv = -1e9;
    moves.forEach(function (m) { var v = tryMove(m, p, depth); if (v > bv) { bv = v; best = m; } });
    return { m: best, v: bv };
  }
  // value of owning a card (for buying): play it on a clone with money topped up, ignoring requirements
  function cardWorth(p, id) {
    var G0 = OH.G, c = OH.CARDS[id], snap = strip(G0), log = G0.log, ev = G0.ev;
    var G1 = JSON.parse(snap); G1.log = []; G1.ev = []; OH.G = G1;
    var base = evalState(G1, p);
    var P = G1.pl[p]; P.hand.push(id); P.mc += 80; var keepMc = P.mc;
    G1.phase = 'action'; G1.turn = p; G1.pending = null; G1.q = []; G1.acts = 0; P.passed = false;
    var reqOk = OH.reqOk(p, c.req), w = -99;
    var saveReq = c.req; c.req = null;
    if (OH.playable(p, id) && OH.performMove({ t: 'play', id: id })) { settle(p, 1); OH.G.pl[p].mc = keepMc; w = evalState(OH.G, p) - base - OH.cardCost(p, id) - 1.6; }
    c.req = saveReq;
    OH.G = G0; G0.log = log; G0.ev = ev;
    if (!reqOk) w = w * 0.6 - 2;
    return w;
  }
  function chooseBuys(p, ids, budget, level) {
    var hand = OH.G.pl[p].hand.length;
    var scored = ids.map(function (id) { return { id: id, w: cardWorth(p, id) + (level === 'easy' ? (Math.random() * 6 - 3) : 0) }; }).sort(function (a, b) { return b.w - a.w; });
    var out = [];
    scored.forEach(function (s) { if (s.w > 2 + Math.max(0, hand + out.length - 8) * 2 && (out.length + 1) * 3 <= budget) out.push(s.id); });
    return out;
  }
  function decide(level) {
    var G = OH.G, p = OH.sideToAct(); if (p < 0) return null;
    level = level || 'normal';
    FIXGL = gensLeft(G);
    try { return decide2(G, p, level); } finally { FIXGL = 0; }
  }
  function decide2(G, p, level) {
    var mv = OH.validMoves(); if (!mv.length) return null;
    if (G.pending) {
      if (G.pending.h === 'place') return bestPlace(G, p, mv);
      return pickBest(mv, p, 1).m;
    }
    if (G.phase === 'setup') {
      var P = G.pl[p], best = null, bv = -1e9;
      P.offer.corps.forEach(function (cid) {
        var C = OH.CORPS[cid];
        var buys = chooseBuys(p, P.offer.cards, C.mc - 14, level);
        var v = tryMove({ t: 'setup', corp: cid, buy: buys }, p, 1) + (level === 'easy' ? Math.random() * 10 : 0);
        if (v > bv) { bv = v; best = { t: 'setup', corp: cid, buy: buys }; }
      });
      return best;
    }
    if (G.phase === 'draft') {
      var h = G.draft.hands[p], bw = -1e9, pick = h[0];
      h.forEach(function (id) { var w = cardWorth(p, id); if (w > bw) { bw = w; pick = id; } });
      return { t: 'draft', id: pick };
    }
    if (G.phase === 'research') {
      var P2 = G.pl[p], reserve = level === 'hard' ? 6 : 3;
      return { t: 'buy', ids: chooseBuys(p, P2.research, Math.max(0, P2.mc - reserve), level) };
    }
    if (G.phase === 'final') {
      if (mv.some(function (m) { return m.t === 'green'; })) return { t: 'green' };
      return { t: 'done' };
    }
    // action phase: replace the placeholder sell with the worst card, then one-ply search
    var P3 = G.pl[p];
    mv = mv.filter(function (m) { return m.t !== 'sell'; });
    if (P3.hand.length > 6 || (P3.mc < 4 && P3.hand.length)) {
      var worst = P3.hand.slice().sort(function (a, b) { return OH.CARDS[b].cost - OH.CARDS[a].cost; }).filter(function (id) { return !OH.reqOk(p, OH.CARDS[id].req); });
      if (worst.length) mv.push({ t: 'sell', ids: worst.slice(0, Math.max(1, P3.hand.length - 6)) });
    }
    var scored = mv.map(function (m) { return { m: m, v: tryMove(m, p, 0) }; });
    var passV = evalState(G, p) - 0.5;   // value of doing nothing
    scored.forEach(function (s) { if (s.m.t === 'pass') s.v = passV - 0.01; if (s.m.t === 'end') s.v = passV; });
    if (level === 'easy') scored.forEach(function (s) { s.v += Math.random() * 7; });
    scored.sort(function (a, b) { return b.v - a.v; });
    var top = scored[0].m;
    // awards: fund only when clearly ahead
    if (top.t === 'award') { var A = OH.MAP.AWARDS.filter(function (a) { return a.k === top.k; })[0]; if (OH.awardMetric(p, A.m) <= OH.awardMetric(1 - p, A.m) + 1) { scored.shift(); top = scored[0].m; } }
    return top;
  }
  // how good a move is, in words (for the hint): same evaluation as decide()
  function rank(level) { return decide(level || 'normal'); }
  var AI = root.OHAI = { decide: decide, rank: rank, value: value, gensLeft: gensLeft, cardWorth: cardWorth };
  if (typeof module !== 'undefined') module.exports = AI;
})(typeof window !== 'undefined' ? window : globalThis);

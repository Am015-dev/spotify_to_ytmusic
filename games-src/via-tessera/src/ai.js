// Via Tessera computer players. A turn = one card play plus its choices. Each candidate turn is simulated on a clone and scored
// by a value function (score now + goods, coins, reach and cards in hand). Levels: easy (shallow, noisy), normal, hard (better weights).
(function (root) {
  var VT = root.VT || require('./engine.js'), D = VT.D, GOODS = D.GOODS, PRICE = D.PRICE;
  var VAI = {};
  var W = { easy: { noise: 9, look: 0.6 }, normal: { noise: 1.5, look: 1 }, hard: { noise: 0, look: 1.15 } };

  // value of a position for seat pi: final score + what the position is worth for the rest of the game
  VAI.value = function (G, pi, lvl) {
    var p = G.pl[pi], w = W[lvl] || W.normal, s = VT.score(G, pi).total;
    var phase = Math.min(1, (G.turn / 2) / 24);      // 0 at the start, 1 late
    var future = 0;
    var wealth = p.coins; GOODS.forEach(function (g) { wealth += p.goods[g] * PRICE[g]; });
    future += Math.min(wealth, 40) * 0.22 + Math.max(0, wealth - 40) * 0.06;   // goods and coins trade at par, so value them as one pile
    future += Math.min(p.goods.brick, 3) * 1.4 + Math.min(p.goods.food, 2) * 0.6 + Math.min(p.goods.tool, 2) * 0.4;   // what houses and new colonists need
    future += p.houses.length * 5;
    future += VT.onBoard(p) * 1.5;
    p.houses.forEach(function (cid) { future += PRICE[G.city[cid].g] * 0.3; });
    future += (p.hand.length + p.disc.length - D.START_HAND.length) * (G.deck.length === 0 ? 5 : 3);
    future += VT.nearCities(G, pi).filter(function (cid) { return G.city[cid].h.indexOf(pi) < 0; }).length * 0.5;
    if (VT.room(p) < 2) future -= 1.5;
    var hasTrib = p.hand.some(function (id) { return D.CARDS[id].act === 'trib'; });
    if (!hasTrib) future -= 1.2;
    if (p.hand.length === 0) future -= 6;
    if (G.deck.length === 0) future += needBonus(G, pi);
    return s * (0.6 + 0.4 * phase) + future * (1 - 0.5 * phase) * w.look;
  };

  // all ways to finish the pending action greedily (each sub-choice picks the best next state): returns the final state
  function finish(G, pi, lvl, budget) {
    var guard = 0;
    while (G.phase === 'play' && VT.sideToAct(G) === pi && (G.pend || (G.drop && G.drop.length)) && guard++ < 40) {
      var m = bestStep(G, pi, lvl, budget);
      VT.performMove(G, m);
    }
    return G;
  }
  VAI.finish = finish;
  function bestStep(G, pi, lvl, budget) {
    var ms = VT.validMoves(G), pd = G.pend;
    if (G.drop && G.drop.length) { // drop the cheapest good
      return ms.slice().sort(function (a, b) { return PRICE[a.g] - PRICE[b.g]; })[0];
    }
    if (pd.h === 'merc') return { t: 'trade', ops: VAI.trade(G, pi, lvl) };
    if (pd.h === 'arch-move') return archMove(G, pi, lvl, ms);
    var best = null, bv = -1e9;
    ms.forEach(function (m) {
      var c = VT.clone(G); VT.performMove(c, m);
      if (c.pend && VT.sideToAct(c) === pi && budget > 0) finish(c, pi, lvl, budget - 1);
      var v = VAI.value(c, pi, lvl);
      if (v > bv) { bv = v; best = m; }
    });
    return best;
  }
  // moves: aim colonists at the best city they can build in this turn or next
  function archMove(G, pi, lvl, ms) {
    var moves = ms.filter(function (m) { return m.t === 'mv'; });
    if (!moves.length) return { t: 'mdone' };
    var base = VT.clone(G); base.pend = { h: 'arch-build', card: G.pend.card };
    var bv = buildValue(base, pi, lvl), best = { t: 'mdone' };
    moves.forEach(function (m) {
      var c = VT.clone(G); VT.performMove(c, m); var c2 = VT.clone(c); c2.pend = { h: 'arch-build', card: G.pend.card };
      var v = buildValue(c2, pi, lvl) + 0.05 * c.pend.steps + spotValue(c, pi);
      if (v > bv + 0.01) { bv = v; best = m; }
    });
    return best;
  }
  function buildValue(G, pi, lvl) { finish(G, pi, lvl, 0); return VAI.value(G, pi, lvl); }
  // how promising the cities around my colonists are (unbuilt by me, good value, cheap)
  function spotValue(G, pi) {
    var v = 0; VT.nearCities(G, pi).forEach(function (cid) { var c = G.city[cid]; if (c.h.indexOf(pi) < 0) v += 0.35 + PRICE[c.g] * 0.06 - c.h.length * 0.2; });
    return v;
  }

  // trading: sell what we can't use, buy what the best build or card needs (at most 2 kinds)
  VAI.trade = function (G, pi, lvl) {
    var p = G.pl[pi], best = [], bv = VAI.value(G, pi, lvl);
    var cands = [];
    GOODS.forEach(function (g) { for (var n = 1; n <= 4; n++) { cands.push([g, n]); if (p.goods[g] >= n) cands.push([g, -n]); } });
    var singles = cands.filter(function (o) { return VT.validTrade(G, pi, [o]); });
    function val(ops) { var c = VT.clone(G); ops.forEach(function (o) { c.pl[pi].goods[o[0]] += o[1]; c.pl[pi].coins -= o[1] * PRICE[o[0]]; }); return VAI.value(c, pi, lvl) + needBonus(c, pi); }
    bv += needBonus(G, pi);
    singles.forEach(function (a) { var v = val([a]); if (v > bv) { bv = v; best = [a]; } });
    if (lvl !== 'easy') singles.forEach(function (a) { singles.forEach(function (b) { if (a[0] >= b[0]) return; var ops = [a, b]; if (!VT.validTrade(G, pi, ops)) return; var v = val(ops); if (v > bv) { bv = v; best = ops; } }); });
    return best;
  };
  // goods that unlock a build next to my colonists or a market card are worth more than their price
  function needBonus(G, pi) {
    var p = G.pl[pi], b = 0;
    VT.nearCities(G, pi).forEach(function (cid) { if (G.city[cid].h.indexOf(pi) < 0 && p.houses.length < D.HOUSES) { var cost = VT.buildCost(G, pi, cid); var ok = p.coins >= cost.coins; for (var g in cost.goods) if (p.goods[g] < cost.goods[g]) ok = false; if (ok) b += 1.2; } });
    // late game: the market must empty for the game to end, so the leader wants goods for the last cards
    var lead = VT.score(G, pi).total >= VT.score(G, 1 - pi).total, cardB = G.deck.length === 0 ? (lead || G.turn > 160 ? 4 : 1.5) : 0.5;
    G.disp.forEach(function (id, s) { if (id != null && VT.canBuyCard(G, pi, s, false)) b += cardB; });
    return Math.min(b, G.deck.length === 0 ? 9 : 4);
  }

  // choose the whole next step for the side to act (a 'play' or a sub-choice)
  VAI.choose = function (G, lvl) {
    var pi = VT.sideToAct(G), w = W[lvl] || W.normal;
    if (G.pend || (G.drop && G.drop.length)) return bestStep(G, pi, lvl, lvl === 'easy' ? 0 : 1);
    var ms = VT.validMoves(G), best = null, bv = -1e9, seen = {};
    ms.forEach(function (m) {
      var id = G.pl[pi].hand[m.i]; if (seen[id]) return; seen[id] = 1;
      var c = VT.clone(G); VT.performMove(c, m); finish(c, pi, lvl, lvl === 'easy' ? 0 : 1);
      var v = VAI.value(c, pi, lvl) + (w.noise ? (VT.rnd(c) - 0.5) * w.noise : 0);
      if (v > bv) { bv = v; best = m; }
    });
    return best;
  };
  // the whole plan for a card play (for hints): the moves the computer would make, in order
  VAI.plan = function (G, lvl) {
    var c = VT.clone(G), pi = VT.sideToAct(c), out = [];
    var m = VAI.choose(c, lvl); out.push(m); VT.performMove(c, m);
    var guard = 0;
    while (c.phase === 'play' && VT.sideToAct(c) === pi && (c.pend || (c.drop && c.drop.length)) && guard++ < 40) { m = VAI.choose(c, lvl); out.push(m); VT.performMove(c, m); }
    return out;
  };
  root.VAI = VAI;
  if (typeof module !== 'undefined') module.exports = VAI;
})(typeof window !== 'undefined' ? window : global);

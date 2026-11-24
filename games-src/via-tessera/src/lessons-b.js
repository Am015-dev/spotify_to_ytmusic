// lessons-b.js: two scenario lessons for the scenario tutor (shell/gx-scenario-tutor.js, docs shell/GXST.md).
// Each lesson is a real game on the real board (VTUI.startGame), staged so that ONE move solves it and the tempting wrong move fails.
// Pushed onto window.VTSCN. ES5. Helpers stay inside this IIFE. Nothing is saved while GXST.active().
(function () {
  'use strict';
  window.VTSCN = window.VTSCN || [];

  var counted = 0, turn0 = 0, wired = false;

  // id of the START_HAND card with this action
  function cardId(act) {
    var ids = VT.D.START_HAND;
    for (var i = 0; i < ids.length; i++) if (VT.D.CARDS[ids[i]].act === act) return ids[i];
    return -1;
  }
  function cardName(id) { return id == null ? 'no card' : VT.D.CARDS[id].n; }
  function live() { return !!(window.GXST && GXST.active()); }
  function sig() { return JSON.stringify([G.pl[0], G.pend, G.cur, G.phase, G.turn]); }

  // count the player's own applied moves (taps go through move(), scripted calls through VTUI.move)
  function counting(orig) {
    return function () {
      if (!live()) return orig.apply(this, arguments);
      var b = sig(), r = orig.apply(this, arguments);
      if (sig() !== b) counted++;
      return r;
    };
  }
  function wire() {
    if (wired || typeof VTUI === 'undefined' || typeof window.move !== 'function') return;
    wired = true;
    window.move = counting(window.move);
    VTUI.move = counting(VTUI.move);
  }

  // a fresh real game, the player to act first (same start as scn.js)
  function start(seed) {
    VTUI.UI.fast = true;
    VTUI.startGame('vs', { lvl: 'easy', seed: seed, first: 0 });
    return new Promise(function (r) { setTimeout(r, 400); });
  }
  function settle() { return !VTUI.UI.busy; }
  // the player's turn is over (the rival may already have moved; the judge runs only when settled)
  function turnOver() { return G.turn > turn0; }

  // ------------------------------------------------------------ Builder: build
  // Start: Builder already played, its cart already beside a city, so the only choice left is the build.
  // Tempting wrong: skip the build (done): the turn ends with no new house.
  window.VTSCN.push({
    id: 'build',
    title: 'Builder: build',
    rule: 'Builder moves carts, then builds a house in a city next to a cart. Paying is part of the build.',
    goal: 'Build one house',
    setup: function () {
      wire();
      return start(21).then(function () {
        var p = G.pl[0], D = VT.D, route = null, i;
        for (i = 0; i < D.ROUTES.length && !route; i++) {
          var r = D.ROUTES[i];
          if (r.t === 'land' && (G.city[r.a] || G.city[r.b])) route = r;
        }
        p.hand = [cardId('arch'), cardId('pref'), cardId('merc'), cardId('sen'), cardId('cons'), cardId('colo'), cardId('dipl')];
        p.disc = [];
        p.houses = [];
        p.goods = { brick: 3, food: 3, tool: 2, wine: 2, cloth: 2 };
        p.coins = 20;
        p.cols = [
          { t: 'L', at: { r: route.id } }, { t: 'S', at: { c: D.CAPITAL } },
          { t: 'L', at: null }, { t: 'L', at: null }, { t: 'S', at: null }, { t: 'S', at: null }];
        G.lastPlayed = null;
        VTUI.move({ t: 'play', i: 0 });
        VTUI.move({ t: 'mdone' });
        turn0 = G.turn; counted = 0;
        VTUI.render();
      });
    },
    success: function () { return settle() && G.pl[0].houses.length >= 1; },
    fail: function () {
      if (!counted || !turnOver() || G.pl[0].houses.length >= 1) return false;
      return 'Skipped the build: the turn ended with no new house, so the Builder paid nothing and placed nothing.';
    },
    par: 1,
    moves: function () { return counted; },
    hints: [
      'The cart is already next to a city. A house needs that city and coins plus goods.',
      { say: 'Tap the lit city next to your cart to build there.', target: '.city.glow' }
    ],
    debrief: 'A Builder turn is only worth it if you build: the cart is already in place.'
  });

  // ------------------------------------------------------------ Governor: produce
  // Start: Governor in hand. Two provinces: one with 1 house of yours, one with 3 houses of yours.
  // Each house makes 1 good for its owner, and the Governor adds the province bonus good (1). 3 houses + 1 = 4 goods.
  // Tempting wrong: the 1-house province: 1 + 1 = 2 goods, and the turn ends short of 4.
  window.VTSCN.push({
    id: 'produce',
    title: 'Governor: produce',
    rule: 'Governor rules a province: each house there makes one good for its owner, plus the province bonus good.',
    goal: 'Gain 4 goods in one turn',
    setup: function () {
      wire();
      return start(22).then(function () {
        var p = G.pl[0], D = VT.D, big = null, small = null, i, pv;
        function cities(id) { return D.CITIES.filter(function (c) { return c.p === id && G.city[c.id]; }); }
        for (i = 0; i < D.PROVS.length; i++) {
          pv = D.PROVS[i];
          if (!big && cities(pv.id).length >= 3) big = pv;
        }
        for (i = 0; i < D.PROVS.length; i++) {
          pv = D.PROVS[i];
          if (pv !== big && !small && cities(pv.id).length >= 1) small = pv;
        }
        p.hand = [cardId('pref'), cardId('arch'), cardId('merc'), cardId('sen'), cardId('cons'), cardId('colo'), cardId('dipl')];
        p.disc = [];
        p.goods = { brick: 0, food: 0, tool: 0, wine: 0, cloth: 0 };
        p.coins = 0;
        p.houses = [];
        p.cols = [
          { t: 'L', at: null }, { t: 'L', at: null }, { t: 'L', at: null }, { t: 'S', at: null }, { t: 'S', at: null }, { t: 'S', at: null }];
        // the Grand Governor doubles the bonus; keep it with the rival so the player gets the plain bonus (1)
        G.pm = 1;
        D.PROVS.forEach(function (q) { G.prov[q.id] = { g: 'wine', up: true }; });
        cities(big.id).slice(0, 3).forEach(function (c) { G.city[c.id].h.push(0); p.houses.push(c.id); });
        cities(small.id).slice(0, 1).forEach(function (c) { G.city[c.id].h.push(0); p.houses.push(c.id); });
        G.lastPlayed = null;
        turn0 = G.turn; counted = 0;
        VTUI.render();
      });
    },
    success: function () { return settle() && VT.nGoods(G.pl[0]) >= 4; },
    fail: function () {
      if (!counted || !turnOver() || VT.nGoods(G.pl[0]) >= 4) return false;
      return 'Ruled the one-house province: it gave 1 good plus the bonus, so the turn ended with ' + VT.nGoods(G.pl[0]) + ' goods, not 4.';
    },
    par: 2,
    moves: function () { return counted; },
    hints: [
      'Count the houses in each province. Only the bonus is added once per province.',
      { say: 'Play the Governor, then rule the province with 3 houses.', target: '.prov.glow' }
    ],
    debrief: 'Houses in a ruled province each make a good; the bonus good adds one more.'
  });
})();

// lessons-a.js: two scenario lessons for the scenario tutor (shell/gx-scenario-tutor.js, docs shell/GXST.md).
// Each lesson is a real game on the real board (VTUI.startGame), staged so that ONE move solves it and the tempting wrong move fails.
// Pushed onto window.VTSCN. ES5. Helpers stay inside this IIFE. Nothing is saved here; the tutor guards saves while GXST.active().
(function () {
  'use strict';
  window.VTSCN = window.VTSCN || [];

  var counted = 0, turn0 = 0, coins0 = 0, wired = false;

  // id of the START_HAND card with this action
  function cardId(act) {
    var ids = VT.D.START_HAND;
    for (var i = 0; i < ids.length; i++) if (VT.D.CARDS[ids[i]].act === act) return ids[i];
    return -1;
  }
  function cardName(id) { return id == null ? 'no card' : VT.D.CARDS[id].n; }
  function live() { return !!(window.GXST && GXST.active()); }
  function sig() { return JSON.stringify([G.pl[0], G.pend, G.cur, G.phase, G.turn]); }

  // count the player's own applied moves (taps and scripted calls both pass through VTUI.move)
  function wire() {
    if (wired || typeof VTUI === 'undefined') return;
    wired = true;
    var orig = VTUI.move;
    VTUI.move = function () {
      if (!live()) return orig.apply(this, arguments);
      var b = sig(), r = orig.apply(this, arguments);
      if (sig() !== b) counted++;
      return r;
    };
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

  // ------------------------------------------------------------ Play a card: gain 3 coins this turn
  // Start: hand = Trader, Herald, Governor. Trader gives 3 coins; Herald with an empty pile gives none.
  // Tempting wrong: Herald (nothing to take back) or Governor (goods, no coins): the turn ends with 0 coins gained.
  window.VTSCN.push({
    id: 'play',
    title: 'Play a card',
    rule: 'One card per turn. A played card leaves your hand until a Herald brings it back.',
    goal: 'Gain 3 coins this turn',
    setup: function () {
      wire();
      return start(21).then(function () {
        var p = G.pl[0];
        p.hand = [cardId('trib'), cardId('merc'), cardId('pref')];
        p.disc = [];
        G.lastPlayed = null;
        turn0 = G.turn; counted = 0; coins0 = p.coins;
        VTUI.render();
      });
    },
    success: function () { return settle() && G.pl[0].coins - coins0 >= 3; },
    fail: function () {
      if (!counted || !turnOver() || G.pl[0].coins - coins0 >= 3) return false;
      return 'Played the ' + cardName(G.lastPlayed) + ', not the Trader: no coins came in, so the turn ended with ' + (G.pl[0].coins - coins0) + ' gained.';
    },
    par: 1,
    moves: function () { return counted; },
    hints: [
      'Only one card can be played this turn. Which one pays coins?',
      { say: 'Play the Trader for its coins.', target: '#hand .cd[data-i="1"]' }
    ],
    debrief: 'The Trader pays 3 coins; a played card then waits in your played pile until a Herald returns it.'
  });

  // ------------------------------------------------------------ Builder: move a cart next to a free city
  // Start: one cart on the map, Builder in hand. The Builder steps carts along roads, one step per road.
  // Tempting wrong: Builder then Build (no step taken): the cart stays where it was.
  window.VTSCN.push({
    id: 'move',
    title: 'Builder: move',
    rule: 'Builder steps your carts and ships along roads, then lets you build.',
    goal: 'Put a cart next to a free city',
    setup: function () {
      wire();
      return start(22).then(function () {
        var p = G.pl[0], D = VT.D;
        p.hand = [cardId('arch'), cardId('pref'), cardId('merc')];
        p.disc = [];
        p.cols = [
          { t: 'L', at: { c: D.CAPITAL } }, { t: 'S', at: null }, { t: 'L', at: null },
          { t: 'L', at: null }, { t: 'S', at: null }, { t: 'S', at: null }];
        G.lastPlayed = null;
        turn0 = G.turn; counted = 0;
        VTUI.render();
      });
    },
    success: function () {
      if (!settle()) return false;
      var p = G.pl[0], D = VT.D;
      return p.cols.some(function (c) {
        if (!c.at || c.at.r == null) return false;
        var rt = D.ROUTES.filter(function (r) { return r.id === c.at.r; })[0];
        return !!rt && G.city[rt.a] && !G.city[rt.a].houses && G.city[rt.b] && !G.city[rt.b].houses;
      }) || false;
    },
    fail: function () {
      if (!counted || !turnOver()) return false;
      return 'Built without a Builder step: the cart stayed at Caput, so no city was reached and the turn ended.';
    },
    par: 2,
    moves: function () { return counted; },
    hints: [
      'The Builder moves before it builds. Does your cart have to move first?',
      { say: 'Play the Builder, then step your cart along a road.', target: '#hand .cd[data-i="0"]' }
    ],
    debrief: 'Steps come first: the Builder moves a cart along a road, and only then can you build beside it.'
  });
})();

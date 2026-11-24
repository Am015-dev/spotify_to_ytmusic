// lessons-d.js: two scenario lessons for the scenario tutor (shell/gx-scenario-tutor.js, docs shell/GXST.md).
// Each lesson is a real game on the real board (VTUI.startGame), staged so that ONE move solves it and the tempting wrong move fails.
// Pushed onto window.VTSCN. ES5. Helpers stay inside this IIFE. Saves are guarded by lessons.js while GXST.active().
(function () {
  'use strict';
  window.VTSCN = window.VTSCN || [];

  var counted = 0, turn0 = 0, wired = false;

  // id of the START_HAND card with this action (every starting card has a unique id)
  function cardId(act) {
    var ids = VT.D.START_HAND;
    for (var i = 0; i < ids.length; i++) if (VT.D.CARDS[ids[i]].act === act) return ids[i];
    return -1;
  }
  function cardName(id) { return id == null ? 'no card' : VT.D.CARDS[id].n; }
  function live() { return !!(window.GXST && GXST.active()); }
  function sig() { return JSON.stringify([G.pl[0], G.pend, G.cur, G.phase, G.turn]); }

  // count the player's own applied moves: taps go through move(), scripted calls through VTUI.move; the AI never uses either
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
  function onMap() { return VT.onBoard(G.pl[0]); }
  // the player's turn is over (the rival may already have moved, the judge runs only when settled)
  function turnOver() { return G.turn > turn0; }

  // ------------------------------------------------------------ Settler: 3 carts or ships on the map
  // Start: 2 pieces on the map, 1 spare cart at home, 2 grain and 2 tools. Settler + place the spare cart from Caput = 3.
  // Tempting wrong: Settler for the 5 coins (or no piece): the turn ends with 2 on the map.
  window.VTSCN.push({
    id: 'settle',
    title: 'Settler',
    rule: 'Settler sends a cart or ship for 1 grain + 1 tool each, or takes coins instead of a piece.',
    goal: 'Have 3 carts or ships on the map',
    setup: function () {
      wire();
      return start(11).then(function () {
        var p = G.pl[0], D = VT.D;
        p.hand = [cardId('colo'), cardId('trib'), cardId('arch'), cardId('pref'), cardId('merc'), cardId('dipl'), cardId('sen')];
        p.disc = [];
        p.goods = { brick: 0, food: 2, tool: 2, wine: 0, cloth: 0 };
        p.cols = [
          { t: 'L', at: { c: D.CAPITAL } }, { t: 'S', at: { c: D.CAPITAL } },
          { t: 'L', at: null }, { t: 'L', at: null }, { t: 'S', at: null }, { t: 'S', at: null }];
        G.lastPlayed = null;
        turn0 = G.turn; counted = 0;
        VTUI.render();
      });
    },
    success: function () { return settle() && onMap() >= 3; },
    fail: function () {
      if (!counted || !turnOver() || onMap() >= 3) return false;
      if (G.lastPlayed === cardId('colo')) return 'The Settler sent no piece (coins or nothing): the turn ended with ' + onMap() + ' of 3 on the map.';
      return 'Played the ' + cardName(G.lastPlayed) + ', not the Settler: no piece was sent, so the turn ended with ' + onMap() + ' of 3 on the map.';
    },
    par: 2,
    moves: function () { return counted; },
    hints: [
      'The Settler has two options. Only one of them puts a piece on the map.',
      { say: 'Play the Settler, then send your spare cart from Caput.', target: '#map .city[data-c="caput"]' }
    ],
    debrief: 'Paying 1 grain and 1 tool puts a piece on the map; the 5 coins do not.'
  });

  // ------------------------------------------------------------ Herald: 3 cards in hand again
  // Start: 2 cards in hand, 5 played. Herald takes the whole played pile back: hand = 7.
  // Tempting wrong: Governor (the pile stays out and the hand ends at 1 card).
  window.VTSCN.push({
    id: 'herald',
    title: 'Herald',
    rule: 'Herald takes your whole played pile back into hand, then pays 1 coin per card over 3.',
    goal: 'Have 3 cards in hand again',
    setup: function () {
      wire();
      return start(12).then(function () {
        var p = G.pl[0], D = VT.D;
        p.hand = [cardId('trib'), cardId('pref')];
        p.disc = [cardId('arch'), cardId('dipl'), cardId('sen'), cardId('merc'), cardId('colo')];
        p.cols = [
          { t: 'L', at: { c: D.CAPITAL } }, { t: 'S', at: { c: D.CAPITAL } },
          { t: 'L', at: null }, { t: 'L', at: null }, { t: 'S', at: null }, { t: 'S', at: null }];
        G.lastPlayed = null;
        turn0 = G.turn; counted = 0;
        VTUI.render();
      });
    },
    success: function () { return settle() && G.pl[0].hand.length >= 3; },
    fail: function () {
      if (!counted || !turnOver() || G.pl[0].hand.length >= 3) return false;
      return 'Played the ' + cardName(G.lastPlayed) + ', not the Herald: the pile stays out, and your hand ends at ' + G.pl[0].hand.length + ' cards.';
    },
    par: 1,
    moves: function () { return counted; },
    hints: [
      'Your played pile is not lost. Which card brings it back?',
      { say: 'Play the Herald: it takes all played cards back into hand.', target: '#hand .cd[data-i="0"]' }
    ],
    debrief: 'The Herald returns the whole pile at once; each card over three pays 1 coin.'
  });
})();

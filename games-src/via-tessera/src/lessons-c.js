// lessons-c.js: two scenario lessons for the scenario tutor (shell/gx-scenario-tutor.js, docs shell/GXST.md).
// Each lesson is a real game on the real board (VTUI.startGame), staged so that ONE correct move solves it and the tempting wrong move fails.
// Pushed onto window.VTSCN. ES5. Helpers stay inside this IIFE. Saves are guarded while GXST.active().
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
  // first card with this action in this market deck (deck 1 or 2)
  function marketId(act, deck, extra) {
    var cs = VT.D.CARDS;
    for (var i = 0; i < cs.length; i++) {
      if (cs[i].act === act && cs[i].deck === deck && (!extra || extra(cs[i]))) return cs[i].id;
    }
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
  // the player's turn is over (the rival may already have moved, the judge runs only when settled)
  function turnOver() { return G.turn > turn0; }
  function coinsOf() { return G.pl[0].coins; }

  // ------------------------------------------------------------ Trader: 12 coins by the end of the turn
  // Start: 1 coin, 1 brick, 1 grain, 1 wine. Trader gives 3 coins: 4 coins. Need 12.
  // Tempting wrong: sell brick + grain (3 + 4): 4 + 7 = 11, short. Right: sell wine + brick (6 + 3): 4 + 9 = 13.
  window.VTSCN.push({
    id: 'trade',
    title: 'Trader',
    rule: 'Trader takes 3 coins, then trades up to 2 kinds of goods at printed prices: brick 3, grain 4, tools 5, wine 6, cloth 7.',
    goal: 'Finish with 12 coins or more',
    setup: function () {
      wire();
      return start(13).then(function () {
        var p = G.pl[0];
        p.hand = [cardId('merc'), cardId('sen'), cardId('arch'), cardId('pref'), cardId('trib'), cardId('dipl'), cardId('colo')];
        p.disc = [];
        p.coins = 1;
        p.goods = { brick: 1, food: 1, tool: 0, wine: 1, cloth: 0 };
        G.lastPlayed = null;
        turn0 = G.turn; counted = 0;
        VTUI.render();
      });
    },
    success: function () { return settle() && coinsOf() >= 12; },
    fail: function () {
      if (!counted || !turnOver() || coinsOf() >= 12) return false;
      if (G.lastPlayed !== cardId('merc')) return 'Played the ' + cardName(G.lastPlayed) + ', not the Trader: no goods were sold, so you ended with ' + coinsOf() + ' coins.';
      return 'Sold the cheap kinds (brick and grain): you ended with ' + coinsOf() + ' coins, short of 12. Wine and brick reach 13.';
    },
    par: 2,
    moves: function () { return counted; },
    hints: [
      'Trader pays coins first. Then the sales decide the total.',
      { say: 'Play the Trader, then sell the two kinds that pay the most.', target: '#hand .cd[data-i="0"]' }
    ],
    debrief: 'Selling your two priciest kinds raises the total; the cheap kinds fall short.'
  });

  // ------------------------------------------------------------ Patron: buy the Wing card
  // Market slot 0 is free; slot 1 costs one extra good of your choice. Player holds 1 grain + 1 wine.
  // Wing card (Trader, deck I) costs wine + any 1 good at slot 1 = 2 goods. Settler at slot 0 costs only 1 grain.
  // Tempting wrong: buy the free Settler first: only wine is left and the Wing needs 2 goods.
  window.VTSCN.push({
    id: 'buy',
    title: 'Patron',
    rule: 'Patron buys up to 2 market cards. A card costs its printed goods plus the extra for its slot.',
    goal: 'Buy the Wing card',
    setup: function () {
      wire();
      return start(14).then(function () {
        var p = G.pl[0], D = VT.D;
        p.hand = [cardId('sen'), cardId('merc'), cardId('arch'), cardId('pref'), cardId('trib'), cardId('dipl'), cardId('colo')];
        p.disc = [];
        p.coins = 6;
        p.goods = { brick: 0, food: 1, tool: 0, wine: 1, cloth: 0 };
        var wing = marketId('merc', 1);
        var settler = marketId('colo', 1);
        var tool = marketId('spec', 1, function (c) { return c.spec === 'tool'; });
        var arch2 = marketId('arch', 2);
        var cons2 = marketId('cons', 2);
        G.disp = [settler, wing, arch2, cons2, tool, marketId('arch', 1), marketId('spec', 2, function (c) { return c.spec === 'wine'; })];
        G.lastPlayed = null;
        turn0 = G.turn; counted = 0;
        VTUI.render();
      });
    },
    success: function () {
      var wing = marketId('merc', 1);
      return settle() && G.pl[0].hand.indexOf(wing) >= 0;
    },
    fail: function () {
      if (!counted || !turnOver() || G.pl[0].hand.indexOf(marketId('merc', 1)) >= 0) return false;
      if (G.lastPlayed !== cardId('sen')) return 'Played the ' + cardName(G.lastPlayed) + ', not the Patron: no card was bought.';
      return 'Bought the free Settler first: only wine was left, and the Wing needs 2 goods, so the Wing stayed in the market.';
    },
    par: 2,
    moves: function () { return counted; },
    hints: [
      'Two cards cost little. Only one of them is the Wing.',
      { say: 'Play the Patron, then buy the Wing in the second market slot (the one with an extra good).', target: '#mktb' }
    ],
    debrief: 'Buying the cheap card first leaves too few goods for the Wing: check what is left before you buy.'
  });
})();

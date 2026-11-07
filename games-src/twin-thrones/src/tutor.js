// Twin Thrones first-game guide (shell/gx-tutor.js): a fixed staged game, 8 steps, taught by doing. (FLAG: none)
// Teaches: the pyramid (only glowing cards are free; taking one frees the card above it for the rival), build, sell, a wonder, the conflict pawn.
(function () {
  if (typeof GXT === 'undefined' || !window.TT_UI) return;
  var UI = TT_UI, U = UI.U, E = UI.E, BY = UI.BY, $ = UI.$, GAME = 'twin-thrones';
  var T = { reserved: {}, freed: [], lastAv: [] };
  function av() { return E.available(U.G).filter(function (c) { return !c.taken; }); }
  function cellEl(i) { return $('c' + i); }
  function snapAv() { T.lastAv = av().map(function (c) { return c.i; }); }
  function mine() { return U.tut && !U.busy && E.sideToAct(U.G) === 0 && !U.G.pend.length && U.G.phase === 'play'; }
  function pickCell(pred) { var l = av().filter(pred); return l.length ? l[0] : null; }
  function colorOf(c) { return BY[c.id].col; }
  function setup() {
    UI.newGame('cpu', 5); U.tut = true; U.fingerDone = true;
    if (window.TT_TEST) TT_TEST.toPlay(0);
    var G = U.G; G.players[0].coins = 40; G.players[1].coins = 12;
    var row = av().sort(function (a, b) { return a.x - b.x; });          // the bottom row, left to right
    row[0].id = 'a1-timber-stand'; row[2].id = 'a1-pony-pen';             // a free card to build, and a red card for the pawn
    T.reserved = {}; T.reserved[row[0].i] = 1; T.reserved[row[2].i] = 1; T.first = row[0].i; T.red = row[2].i; T.cover = row[1].i; T.freed = [];
    U.sel = null; UI.render(); snapAv();
  }
  // the computer in the guide: it takes the card the player just freed (to show the tension), otherwise a far card it can sell; never the cards the guide needs
  function aiMove(G) {
    var a = av().filter(function (c) { return !T.reserved[c.i]; });
    var pick = null; T.freed.forEach(function (i) { a.forEach(function (c) { if (c.i === i && !pick) pick = c; }); });
    if (!pick) pick = a.sort(function (x, y) { return y.x - x.x; })[0] || av()[0];
    return { t: 'discard', i: pick.i };
  }
  function freedBy(before) { var now = av().map(function (c) { return c.i; }); return now.filter(function (i) { return before.indexOf(i) < 0; }); }
  function sel(i) { U.sel = i; UI.renderPyr(); UI.dock(); }
  var steps = [
    { id: 'pyramid', title: 'The pyramid', say: 'Only glowing cards are free to take. A card under another one is covered and must wait.', target: function () { return $('pyr'); }, wait: null, ready: mine },
    { id: 'take', title: 'Take a card', say: 'Tap the glowing Timber Stand. It is free.', target: function () { return cellEl(T.first); }, wait: { type: 'tap', match: function (a) { return a.kind === 'card' && a.i === T.first; } }, ready: function () { return mine() && cellEl(T.first); } },
    { id: 'build', title: 'Build it', say: 'Build adds it to your city. It gives you wood forever.', target: function () { return document.querySelector('#zoom [data-a="build"]'); }, wait: { type: 'tap', match: function (a) { return a.kind === 'act' && a.a === 'build'; } }, ready: function () { return mine() && U.sel === T.first && document.querySelector('#zoom [data-a="build"]'); }, onNext: snapAv },
    { id: 'sell', title: 'Sell for coins', say: 'This card holds one above it. Take it and your rival may grab the freed card. Sell it.', target: function () { return document.querySelector('#zoom [data-a="discard"]'); },
      wait: { type: 'tap', match: function (a) { return a.kind === 'act' && a.a === 'discard'; } },
      ready: function () { if (!mine()) return false; if (U.sel !== T.cover) { snapAv(); sel(T.cover); } return !!document.querySelector('#zoom [data-a="discard"]'); } },
    { id: 'tension', title: 'Mind what you free', say: function () { return 'Your rival took the card you freed. Before you take a card, look at what it uncovers.'; }, target: function () { return $('pyr'); }, wait: null, ready: function () { return mine(); } },
    { id: 'army', title: 'Raise an army', say: 'The red Pony Pen has a shield. Build it to push the conflict pawn.', target: function () { return document.querySelector('#zoom [data-a="build"]'); }, wait: { type: 'tap', match: function (a) { return a.kind === 'act' && a.a === 'build'; } }, ready: function () { if (!mine()) return false; if (U.sel !== T.red) sel(T.red); return !!document.querySelector('#zoom [data-a="build"]'); } },
    { id: 'wonder', title: 'Raise a wonder', say: 'This card can also raise a wonder. A wonder is worth points and a big bonus. Tap a wonder.', target: function () { return document.querySelector('#zoom [data-a="wonder"]:not([disabled])'); }, wait: { type: 'tap', match: function (a) { return a.kind === 'act' && a.a === 'wonder'; } },
      ready: function () { if (!mine()) return false; var c = pickCell(function (c) { return !T.reserved[c.i]; }); if (!c) return false; if (U.sel !== c.i) sel(c.i); return !!document.querySelector('#zoom [data-a="wonder"]:not([disabled])'); } }
  ];
  // The pawn step is a pair (tap the card, then Build); the pawn and its 3 / 6 step coin penalties are explained once it has moved.
  steps.splice(6, 0, { id: 'pawn3', title: 'The conflict pawn', say: 'The pawn moved. Reach step 9 and you win at once. Steps 3 and 6 make your rival lose coins.', target: function () { return $('mil'); }, wait: null, ready: function () { return mine() && U.G.mil !== 0; } });
  // remember which cards were freed by each player move, so the computer takes one
  var oldAct = GXT.act;
  function start(o) {
    var before = []; T.then = o && o.then || null;
    GXT.start({ game: GAME, steps: steps, story: false, endTitle: 'You know the duel', endText: 'Take cards, mind what you free, build, sell, raise wonders and push the pawn. Time for a real game.',
      setup: function () { setup(); },
      onDone: function () { U.tut = false; if (T.then) { var f = T.then; T.then = null; f(); } else UI.newGame('cpu'); },
      onExit: function () { U.tut = false; if (T.then) { var f = T.then; T.then = null; f(); } else UI.showStart(); } });
  }
  window.TT_TUTOR = { start: start, aiMove: aiMove, steps: steps };
  // after each of the player's tutorial moves, note which cards just became free
  var prevSel = null;
  document.addEventListener('click', function () { if (!U.tut) return; var before = T.lastAv.slice(); setTimeout(function () { T.freed = freedBy(before); }, 0); }, true);
})();

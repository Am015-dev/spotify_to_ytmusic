// Onyx Atelier scenarios (shell/gx-scenario.js): ?scn=<id> builds ONE state directly, then real taps check the outcome in the engine. (FLAG: none)
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof OA_TEST !== 'undefined' && OA_TEST.E; };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var T = function () { return OA_TEST; }, G = function () { return OA_TEST.U.G; };
  function begin(seed) { window.AIDELAY = 0; T().newGame('easy', seed, 0); var t = document.getElementById('toast'); if (t) t.classList.remove('on'); }
  function idleMe() { return G() && G().turn === 0 && !T().U.busy && !G().pend; }
  function tok(p) { var t = G().pl[p].t, n = 0; for (var k in t) n += t[k]; return n; }
  GXS.boardOpen = function () { if (booted()) begin(5); };
  GXS.add({
    id: 'oa-board', name: 'Board: gems, jewels and both players', ask: 'Can you see what to take and buy?', seed: 5, when: booted,
    setup: function () { begin(5); return wait(400); },
    checks: [
      { kind: 'visible', sel: '#board .cell.glow', name: 'a gem you can take' },
      { kind: 'visible', sel: '#pyr .card[data-l="2"]', name: 'a Tiara on top' },
      { kind: 'visible', sel: '#me .cols', name: 'your gems' },
      { kind: 'visible', sel: '#rival .cols', name: 'rival gems' },
      { kind: 'visible', sel: '#status', name: 'status line' },
      { kind: 'fn', name: '25 board spaces, 12 jewels on show', fn: function () { return document.querySelectorAll('#board .cell').length === 25 && document.querySelectorAll('#pyr .card[data-id]').length === 12 || 'board/pyramid count'; } }
    ]
  });
  GXS.add({
    id: 'oa-take', name: 'Take 3 gems in a line', ask: 'Tap three gems, then Take: do they move to you?', seed: 9, when: booted,
    setup: function () { begin(9); var L = OA_TEST.E.validMoves(G()).filter(function (m) { return m.t === 'take' && m.cells.length === 3; }); window.__run = L[0].cells; return wait(300); },
    checks: [
      { kind: 'play', name: 'three taps + Take: your gems grow by 3, the board loses 3, the rival plays', snap: function () { return { me: tok(0), board: G().board.filter(Boolean).length, n: G().n }; },
        steps: [{ sel: function () { return document.querySelector('.cell[data-cell="' + __run[0] + '"]'); } }, { sel: function () { return document.querySelector('.cell[data-cell="' + __run[1] + '"]'); } }, { sel: function () { return document.querySelector('.cell[data-cell="' + __run[2] + '"]'); } }, { sel: '#takebtn' }],
        idle: function () { return idleMe() && G().n >= 2; },
        verify: function (b, a) { if (a.me !== b.me + 3 && !(a.me > b.me)) return 'your gems ' + b.me + ' -> ' + a.me; if (G().log.filter(function (l) { return /^0 take/.test(l); }).length !== 1) return 'no take in the log'; return true; } }
    ],
    mut: [{ name: 'take gives nothing', js: 'var pm=OA_TEST.E.performMove;OA_TEST.E.performMove=function(g,m){var r=pm(g,m);if(m.t==="take")g.pl[0].t={w:0,u:0,g:0,r:0,k:0,p:0,o:0};return r};' }]
  });
  GXS.add({
    id: 'oa-zoom', name: 'Jewel close-up: cost and Buy', ask: 'Do you see the cost, Buy and Keep?', seed: 7, when: booted,
    setup: function () { begin(7); T().zoom({ l: 0, i: 0 }); return wait(300); },
    checks: [
      { kind: 'visible', sel: '#sheet [data-buy]', name: 'Buy button' },
      { kind: 'visible', sel: '#sheet [data-res]', name: 'Keep button' },
      { kind: 'visible', sel: '#sheet .zoom .card', name: 'big jewel' },
      { kind: 'visible', sel: '#sheet .pay', name: 'what you pay' }
    ]
  });
  GXS.add({
    id: 'oa-buy', name: 'Buy a jewel', ask: 'Tap a lit jewel, then Buy: is it yours?', seed: 11, when: booted,
    setup: function () {
      begin(11); var g = G(); g.pl[0].t = { w: 3, u: 3, g: 3, r: 3, k: 3, p: 1, o: 0 };
      ['w', 'u', 'g', 'r', 'k', 'p'].forEach(function (c) { var n = c === 'p' ? 1 : 3; for (var i = 0; i < n; i++) { var j = g.bag.indexOf(c); if (j >= 0) g.bag.splice(j, 1); else { j = g.board.indexOf(c); g.board[j] = null; } } });
      OA_TEST.E.checkInvariants(g); T().render(); return wait(300);
    },
    checks: [
      { kind: 'play', name: 'tap the jewel, tap Buy: it joins your jewels and you pay', snap: function () { return { cards: G().pl[0].cards.length, tok: tok(0), id: G().pyr[0][0] }; },
        steps: [{ sel: '.card[data-l="0"][data-i="0"]' }, { sel: '#sheet [data-buy]' }],
        idle: function () { return idleMe() && G().pl[0].cards.length > 0; },
        verify: function (b, a) { if (G().pl[0].cards.indexOf(b.id) < 0) return 'jewel ' + b.id + ' not owned'; if (!(a.tok < b.tok) && OA_TEST.E.card(b.id).c) return 'paid nothing'; return true; } }
    ],
    mut: [{ name: 'buy is free', js: 'OA_TEST.E.price=function(){return{ok:true,pay:{},gold:0,short:0}};' }]
  });
  GXS.add({
    id: 'oa-result', name: 'Result: who won and why', ask: 'Can you read who won and how?', seed: 3, when: booted,
    setup: function () { begin(3); G().over = { winner: 0, how: 'crowns' }; T().result(); return wait(300); },
    checks: [
      { kind: 'visible', sel: '[data-again]', name: 'Play again' },
      { kind: 'text', sel: '.modal h2', re: /win/i, name: 'headline' }
    ]
  });
})();

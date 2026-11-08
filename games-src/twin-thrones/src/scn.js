// Twin Thrones scenarios (shell/gx-scenario.js): ?scn=<id> builds ONE state directly. (FLAG: none)
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof TT_TEST !== 'undefined' && TT_TEST.newGame && TT_TEST.E; };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  function begin(seed, steps) { window.AIDELAY = 0; TT_TEST.newGame('cpu', seed); TT_TEST.toPlay(steps || 0); var t = document.getElementById('toast'); if (t) t.style.display = 'none'; }
  GXS.boardOpen = function () { if (booted()) begin(5, 0); };
  GXS.add({
    id: 'tt-board', name: 'Duel: the pyramid', ask: 'Can you see which cards you can take?', seed: 5, when: booted,
    setup: function () { begin(5, 0); return wait(500); },
    checks: [
      { kind: 'visible', sel: '#pyr .card.av', name: 'a takeable card' },
      { kind: 'visible', sel: '#mil', name: 'conflict track' },
      { kind: 'visible', sel: '#s0', name: 'your city' },
      { kind: 'visible', sel: '#instr', name: 'status line' }
    ]
  });
  GXS.add({
    id: 'tt-select', name: 'Card chosen: build or sell', ask: 'Do you see Build, Sell and the cost?', seed: 7, when: booted,
    setup: function () { begin(7, 4); var a = TT_TEST.E.available(TT_TEST.U.G)[0]; TT_TEST.select(a.i); return wait(400); },
    checks: [
      { kind: 'visible', sel: '[data-a="discard"]', name: 'Sell button' },
      { kind: 'visible', sel: '[data-a="build"]', name: 'Build button' },
      { kind: 'visible', sel: '#zoom .zc', name: 'cost line' }
    ]
  });
  GXS.add({
    id: 'tt-result', name: 'Result: how the duel ended', ask: 'Can you read who won and why?', seed: 3, when: booted,
    setup: function () { begin(3, 0); TT_TEST.forceEnd(0); return wait(300); },
    checks: [
      { kind: 'visible', sel: '[data-again]', name: 'Play again' },
      { kind: 'visible', sel: '#res h2', name: 'headline' }
    ]
  });
})();

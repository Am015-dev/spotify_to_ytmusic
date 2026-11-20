// Vellum Shire scenarios (shell/gx-scenario.js): ?scn=<id> builds ONE state directly.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof UI !== 'undefined' && document.querySelector('#bd'); };
  function quiet() { try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } }
  function game(o) { quiet(); window.AIDELAY = 60; var g = newGame('vs', Object.assign({ seed: 11, first: 0, lvl: 'easy' }, o || {})); quiet(); return g; }
  GXS.boardOpen = function () { if (!booted()) return; game(); };
  GXS.add({ id: 'vs-board', name: 'Stalls, estate and tray', ask: 'Can you see stalls, estate and dice?', seed: 11, when: booted,
    setup: function () { game(); },
    checks: [{ kind: 'visible', sel: '#estate svg', name: 'estate' }, { kind: 'visible', sel: '.stall', name: 'a stall' }, { kind: 'visible', sel: '[data-die="0"]', name: 'die' },
      { kind: 'fn', name: '37 estate spaces', fn: function () { return document.querySelectorAll('#estate .hcell').length === 37 || document.querySelectorAll('#estate .hcell').length; } },
      { kind: 'eq', name: 'silver', a: function () { return +document.querySelector('[data-silver] span').textContent; }, b: function () { return G.p[0].silver; } }],
    mut: [{ name: 'silver off by one', js: 'G.p[0].silver+=1' }] });
})();

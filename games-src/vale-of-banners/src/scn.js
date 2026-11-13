// Vale of Banners scenarios (shell/gx-scenario.js): ?scn=<id> builds ONE state directly.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof G !== 'undefined' && typeof startGame === 'function' && typeof UI !== 'undefined'; };
  function begin(o, tab) { UI.fast = true; startGame(Object.assign({ n: 2, ai: 'normal' }, o)); UI.tab = tab || 'estate'; UI.pinTab = UI.tab; render(); }   /* phone portrait: one view at a time; each scenario opens the view it tests */
  GXS.boardOpen = function () { if (!booted()) return; UI.fast = false; startGame({ n: 2, ai: 'normal', seed: 4 }); var gb = document.getElementById('goalB'); if (gb) gb.click(); };   /* the play screen, not the goal card lying over the score bar */
  GXS.add({
    id: 'vb-board', name: 'Turn: take a tile', ask: 'Tap a glowing stall tile, then Take', seed: 5, when: booted,
    setup: function () { begin({ seed: 5 }, 'market'); return new Promise(function (r) { setTimeout(r, 400); }); },
    checks: [
      { kind: 'visible', sel: '#dicerow .die', name: 'a die' },
      { kind: 'eq', name: 'estate built (one tab away on phone)', a: function () { return document.querySelectorAll('#es .cell').length; }, b: function () { return VB.CELLS.length; } },
      { kind: 'visible', sel: '#mk .stall', name: 'market' },
      { kind: 'eq', name: 'silver shown', a: function () { return +document.getElementById('r-silver').textContent.replace(/\D/g, ''); }, b: function () { return G.P[0].silver; } },
      { kind: 'play', name: 'take a tile', snap: function () { return G.P[0].store.length; },
        steps: [{ sel: '#mk .glow' }, { sel: '#tv .acts .btn', after: 200 }], idle: function () { return !UI.busy; },
        verify: function (b, a) { return a === b + 1 || 'storage ' + b + ' -> ' + a; } }
    ]
  });
  GXS.add({
    id: 'vb-chain', name: 'Chain: Moot Hall builds again', ask: 'Build the Moot Hall, then build again', seed: 8, when: booted,
    setup: function () {
      begin({ seed: 8 }); var p = G.P[0], home = VB.CELLS[VB.HOME];
      var bc = VB.CELLS.filter(function (c) { return c.col === 'bld' && c.nb.indexOf(VB.HOME) >= 0; })[0] || VB.CELLS.filter(function (c) { return c.col === 'bld'; })[0];
      if (bc.nb.indexOf(VB.HOME) < 0) p.estate[bc.nb[0]] = { id: 'x0', t: VB.CELLS[bc.nb[0]].col };
      var oc = VB.CELLS.filter(function (c) { return c.col === 'pas' && c.nb.indexOf(VB.HOME) >= 0; })[0] || VB.CELLS.filter(function (c) { return c.col !== 'bld' && c.nb.indexOf(bc.i) >= 0; })[0];
      p.store = [{ id: 'x1', t: 'bld', k: 'hall' }, oc.col === 'pas' ? { id: 'x2', t: 'pas', k: 'sheep', n: 4 } : { id: 'x2', t: oc.col, k: oc.col === 'bld' ? 'tower' : undefined }];
      p.dice = [bc.num, bc.num === 1 ? 2 : 1]; p.used = [false, false]; G.order = [0, 1]; G.ti = 0; UI.sel = 0; render();
      return new Promise(function (r) { setTimeout(r, 300); });
    },
    checks: [
      { kind: 'visible', sel: '#es .glow', name: 'glowing space' },
      { kind: 'play', name: 'hall then chain build', snap: function () { return VB.estateFilled(G.P[0]); },
        steps: [{ sel: '#es .glow' }, { sel: '#st-0', after: 200 }, { sel: '#es .glow', after: 200 }], idle: function () { return !UI.busy; },
        verify: function (b, a) { return a === b + 2 || 'land ' + b + ' -> ' + a; } }
    ]
  });
  GXS.add({
    id: 'vb-result', name: 'Result: scores', ask: 'Can you read the final scores?', seed: 3, when: booted,
    setup: function () { begin({ seed: 3 }); UI.forceEnd(); return new Promise(function (r) { setTimeout(r, 400); }); },
    checks: [{ kind: 'visible', sel: '#again', name: 'Play again' }, { kind: 'visible', sel: '#rs table', name: 'score table' }]
  });
})();

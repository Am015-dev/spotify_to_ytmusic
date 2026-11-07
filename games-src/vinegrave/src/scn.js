// Vinegrave scenarios (shell/gx-scenario.js): ?scn=<id> builds ONE state directly. Registered before the game scripts; setup() runs after boot.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof startGame === 'function' && typeof UI !== 'undefined' && typeof VG !== 'undefined'; };
  var calm = function () { try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } return new Promise(function (r) { setTimeout(r, 500); }); };
  GXS.boardOpen = function () { if (!booted()) return; UI.fast = true; try { GXH.setEnabled(true); } catch (e) { } startGame('vs', { np: 2, lvl: 'normal', seed: 5 }); };
  GXS.add({ id: 'vg-board', name: 'Board: your first turn', ask: 'Can you see the map, market and hand?', seed: 5, when: booted,
    setup: function () { UI.fast = true; startGame('vs', { np: 2, lvl: 'normal', seed: 5 }); return calm(); },
    checks: [{ kind: 'visible', sel: '#map .site', name: 'a dig site' }, { kind: 'fn', name: 'a market card (Market tab on phone)', fn: function () { showTab('row'); render(); var e = document.querySelector('#row .cd'), ok = !!(e && e.getBoundingClientRect().width); showTab('map'); render(); return ok || 'no market card'; } }, { kind: 'visible', sel: '#hand .cd', name: 'a hand card' }, { kind: 'fn', name: 'research track (Research tab on phone)', fn: function () { showTab('track'); render(); var e = document.querySelector('#track'), ok = !!(e && e.getBoundingClientRect().width); showTab('map'); render(); return ok || 'no track'; } },
      { kind: 'fn', name: 'five cards in hand', fn: function () { return G.p[0].hand.length === 5 || 'hand ' + G.p[0].hand.length; } },
      { kind: 'play', name: 'dig at a camp site', snap: function () { return { ex: G.p[0].ex }; }, steps: [{ sel: '.site.l0.glow' }, { sel: '#insp .btn.go' }], idle: function () { return !UI.busy; }, verify: function (b, a) { return G.p[0].ex === b.ex - 1 || G.sites.some(function (x) { return x.occ === 0; }) || 'explorer not sent'; } }] });
  GXS.add({ id: 'vg-guardian', name: 'Discover: a guardian wakes', ask: 'Does the guardian show on the ruin?', seed: 7, when: booted,
    setup: function () { UI.fast = true; startGame('vs', { np: 2, lvl: 'normal', seed: 7 }); var p = G.p[0]; p.res.compass = 6; p.hand = ['dread', 'dread', 'grant', 'trail', 'grant']; render(); return calm(); },
    checks: [{ kind: 'play', name: 'discover a ruin', snap: function () { return { n: G.sites.filter(function (x) { return x.guard; }).length }; }, steps: [{ sel: '.site.l1.hid.glow' }, { sel: '#insp .btn.go' }], idle: function () { return !UI.busy; },
      verify: function (b) { return G.sites.filter(function (x) { return x.guard; }).length === b.n + 1 || 'no guardian'; } }, { kind: 'visible', sel: '.site .gd', name: 'guardian badge' }] });
  GXS.add({ id: 'vg-overcome', name: 'Overcome a guardian', ask: 'Can you beat the guardian for 5 points?', seed: 8, when: booted,
    setup: function () { UI.fast = true; startGame('vs', { np: 2, lvl: 'normal', seed: 8 }); var x = G.sites[5]; x.tile = G.s1.pop(); x.guard = G.guards.pop(); x.occ = 0; G.p[0].ex = 1; G.p[0].res = { coin: 5, compass: 5, tablet: 3, arrow: 3, jewel: 3 }; render(); return calm(); },
    checks: [{ kind: 'play', name: 'overcome', snap: function () { return { g: G.p[0].guards.length }; }, steps: [{ sel: '.site[data-i="5"]' }, { sel: function () { return [].slice.call(document.querySelectorAll('#insp .btn')).filter(function (b) { return /Overcome/.test(b.textContent); })[0]; } }], idle: function () { return !UI.busy; },
      verify: function (b) { return G.p[0].guards.length === b.g + 1 || 'not overcome'; } }] });
  GXS.add({ id: 'vg-market', name: 'Market: buy an item', ask: 'Can you read the prices and buy?', seed: 9, when: booted,
    setup: function () { UI.fast = true; startGame('vs', { np: 2, lvl: 'normal', seed: 9 }); G.p[0].res.coin = 9; showTab('row'); render(); return calm(); },
    checks: [{ kind: 'play', name: 'buy', snap: function () { return { c: G.p[0].res.coin }; }, steps: [{ sel: '#row .cd.glow' }, { sel: '#insp .btn.go' }], idle: function () { return !UI.busy; }, verify: function (b) { return G.p[0].res.coin < b.c || 'coins unchanged'; } }] });
  GXS.add({ id: 'vg-result', name: 'Result: score breakdown', ask: 'Can you read every score row?', seed: 3, when: booted,
    setup: function () { UI.fast = true; startGame('vs', { np: 3, lvl: 'normal', seed: 3 }); var n = 0; while (G.phase === 'play' && n++ < 4000) VG.apply(G, VAI.choose(G, 'easy')); render(); showResult(); return calm(); },
    checks: [{ kind: 'visible', sel: '#rs table', name: 'score table' }, { kind: 'visible', sel: '#rs .tbtn', name: 'Play again' }] });
})();

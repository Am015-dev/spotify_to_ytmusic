// Via Tessera scenarios (shell/gx-scenario.js): ?scn=<id> builds ONE state directly. Registered before the game scripts; setup() runs after boot.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof VTUI !== 'undefined' && typeof VT !== 'undefined' && document.readyState === 'complete'; };
  var go = function (seed) { VTUI.UI.fast = true; VTUI.UI.hints = false; VTUI.startGame('vs', { lvl: 'easy', seed: seed, first: 0 }); return new Promise(function (r) { setTimeout(r, 400); }); };
  var idle = function () { return !VTUI.UI.busy && VT.sideToAct(G) === 0; };
  GXS.add({ id: 'vt-board', name: 'Board: your first turn', ask: 'Can you see map, store and cards?', seed: 3, when: booted,
    setup: function () { return go(3); },
    checks: [{ kind: 'visible', sel: '#map .city[data-c="caput"]', name: 'the capital' }, { kind: 'visible', sel: '#hand .cd', name: 'a hand card' }, { kind: 'visible', sel: '#store .coins', name: 'coins' },
      { kind: 'fn', name: 'seven cards in hand', fn: function () { return G.pl[0].hand.length === 7 || 'hand ' + G.pl[0].hand.length; } },
      { kind: 'play', name: 'play the Builder and move a cart', snap: function () { return { d: G.pl[0].disc.length }; },
        steps: [{ sel: '#hand .cd[data-i="1"]' }, { sel: '#acts .btn' }, { sel: '.colhit.glow' }, { sel: '.slothit.glow' }], idle: function () { return !VTUI.UI.busy; },
        verify: function (b) { return (G.pl[0].disc.length === b.d + 1 && G.pl[0].cols.some(function (c) { return c.at && c.at.r != null; })) || 'no cart moved'; } }],
    mut: [{ name: 'reach empty', js: 'VT.reach = function(){ return {}; }' }] });
  GXS.add({ id: 'vt-zoom', name: 'Zoom: the map zooms in', ask: 'Does + zoom the mosaic map?', seed: 4, when: booted,
    setup: function () { return go(4); },
    checks: [{ kind: 'tap', sel: '#zin', name: 'zoom in', state: function () { return VTUI.UI.view.w; }, expect: function (b, a) { return a < b || 'view did not shrink'; } }],
    mut: [{ name: 'dead zoom', js: 'document.getElementById("zin").replaceWith(document.getElementById("zin").cloneNode(true))' }] });
  GXS.add({ id: 'vt-build', name: 'Build a house', ask: 'Can you build next to your cart?', seed: 5, when: booted,
    setup: function () { return go(5).then(function () { var p = G.pl[0]; p.cols[0].at = { r: VT.D.ROUTES.filter(function (r) { return r.t === 'land' && (r.a === 'alpina' || r.b === 'alpina'); })[0].id }; p.goods.brick = 3; p.goods.food = 3; p.coins = 20; VTUI.move({ t: 'play', i: 1 }); VTUI.move({ t: 'mdone' }); }); },
    checks: [{ kind: 'play', name: 'build', snap: function () { return { h: G.pl[0].houses.length, c: G.pl[0].coins }; }, steps: [{ sel: '.city.glow .hit' }], idle: function () { return !VTUI.UI.busy; },
      verify: function (b) { return (G.pl[0].houses.length === b.h + 1 && G.pl[0].coins < b.c) || 'no house'; } }],
    mut: [{ name: 'free build', js: 'VT.buildCost = function(){ return {coins:0, goods:{}}; }' }] });
  GXS.add({ id: 'vt-govern', name: 'Governor: a region produces', ask: 'Does the region give you goods?', seed: 6, when: booted,
    setup: function () { return go(6).then(function () { VTUI.move({ t: 'play', i: 2 }); }); },
    checks: [{ kind: 'play', name: 'produce', snap: function () { return { n: VT.nGoods(G.pl[0]) }; }, steps: [{ sel: '.prov.glow .hit' }, { sel: '#acts .btn' }], idle: function () { return !VTUI.UI.busy; },
      verify: function (b) { return VT.nGoods(G.pl[0]) > b.n || 'no goods'; } }],
    mut: [{ name: 'no bonus', js: 'G.prov && Object.keys(G.prov).forEach(function(k){ G.prov[k].g = null; })' }] });
  GXS.add({ id: 'vt-market', name: 'Market: buy a card', ask: 'Can you buy a card with goods?', seed: 7, when: booted,
    setup: function () { return go(7).then(function () { var p = G.pl[0]; p.goods = { brick: 2, food: 3, tool: 2, wine: 2, cloth: 1 }; VTUI.move({ t: 'play', i: 6 }); }); },
    checks: [{ kind: 'play', name: 'buy', snap: function () { return { h: G.pl[0].hand.length }; }, steps: [{ sel: '#sheet .mc.can .cd' }], idle: function () { return !VTUI.UI.busy; },
      verify: function (b) { return G.pl[0].hand.length === b.h + 1 || 'no card bought'; } }],
    mut: [{ name: 'cannot buy', js: 'VT.canBuyCard = function(){ return false; }' }] });
  GXS.add({ id: 'vt-result', name: 'Result: score table', ask: 'Can you read every patron row?', seed: 8, when: booted,
    setup: function () { return go(8).then(function () { var n = 0; G.pl[0].ai = 'easy'; while (G.phase === 'play' && n++ < 4000) VT.performMove(G, VAI.choose(G, 'easy')); VTUI.render(); VTUI.showResult(); }); },
    checks: [{ kind: 'visible', sel: '#result .sc-table', name: 'score table' }, { kind: 'visible', sel: '#ragain', name: 'Play again' }] });
})();

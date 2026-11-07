// Stitchwise scenarios (shell/gx-scenario.js): ?scn=<id> builds ONE state directly.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof UI !== 'undefined' && document.querySelector('#bd'); };
  var q = function (s) { var b = document.querySelector(s); return b && !b.disabled && b.getBoundingClientRect().width > 3 ? b : null; };
  function quiet() { try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } }
  function game(o) { quiet(); window.AIDELAY = 60; var g = newGame('vs', Object.assign({ seed: 11, first: 0 }, o || {})); quiet(); return g; }
  GXS.boardOpen = function () { if (!booted()) return; game(); };
  GXS.add({ id: 'sw-board', name: 'Quilt, offers and time track', ask: 'Can you see your quilt and 3 patches?', seed: 11, when: booted,
    setup: function () { game(); },
    checks: [{ kind: 'visible', sel: '#quilt', name: 'quilt' }, { kind: 'visible', sel: '#offers .offer', name: 'a patch offer' }, { kind: 'visible', sel: '#track', name: 'time track' }, { kind: 'visible', sel: '[data-a=adv]', name: 'Advance button' },
      { kind: 'fn', name: 'quilt cells are at least 24 px', fn: function () { var c = document.querySelector('.qc'); var w = c.getBoundingClientRect().width; return w >= 24 || 'cell ' + w; } },
      { kind: 'eq', name: 'buttons', a: function () { return +document.querySelector('.nb[data-seat="0"]').textContent; }, b: function () { return G.btn[0]; } }] });
  GXS.add({ id: 'sw-place', name: 'Pick a patch and sew it on', ask: 'Tap a patch, then Sew it on', seed: 11, when: booted,
    setup: function () { game({ setup: function (g) { g.btn[0] = 30; } }); },
    checks: [{ kind: 'play', name: 'buy a patch', snap: function () { return { b: G.btn[0], n: G.owned[0].length, pos: G.pos[0] }; }, steps: [{ sel: '#offers .offer:not(.no)', until: function () { return UI.sel >= 0; }, max: 3 }, { sel: '[data-a=sew]', ready: function () { return !!q('[data-a=sew]'); } }],
      idle: function () { return !UI.busy && G.owned[0].length === 1; }, verify: function (a, b) { var p = PATCHES[G.owned[0][0]]; return (b.n === 1 && b.pos >= a.pos + p.time - 0 && b.b <= a.b - p.cost + 40) || 'owned ' + b.n + ' pos ' + b.pos; } }],
    mut: [{ name: 'free patches', js: 'swCanBuy=function(){return true}' }] });
  GXS.add({ id: 'sw-advance', name: 'Advance the time token', ask: 'Tap Advance. Do you gain buttons?', seed: 11, when: booted,
    setup: function () { game(); },
    checks: [{ kind: 'play', name: 'advance', snap: function () { return { b: G.btn[0], pos: G.pos[0] }; }, steps: [{ sel: '[data-a=adv]' }], idle: function () { return !UI.busy && G.pos[0] > 0; }, verify: function (a, b) { return (b.b - a.b === b.pos - a.pos && b.pos > a.pos) || 'buttons ' + a.b + '->' + b.b + ' pos ' + b.pos; } }],
    mut: [{ name: 'no pay', js: 'swAdvSteps=function(){return 1}' }] });
  GXS.add({ id: 'sw-income', name: 'Button income moment', ask: 'Pass a button spot. Do coins fly?', seed: 11, when: booted,
    setup: function () { game({ setup: function (g) { g.inc[0] = 3; g.pos = [3, 8]; g.stamp = [5, 6]; g.btn[0] = 4; } }); },
    checks: [{ kind: 'play', name: 'income paid', snap: function () { return { b: G.btn[0] }; }, steps: [{ sel: '[data-a=adv]' }], idle: function () { return !UI.busy && G.pos[0] === 9; }, verify: function (a, b) { return b.b === a.b + 6 + 3 || 'got ' + (b.b - a.b); } }],
    mut: [{ name: 'no income', js: 'swPassInc=function(){return {inc:0,lea:null}}' }] });
  GXS.add({ id: 'sw-leather', name: 'Free leather patch', ask: 'Tap an empty square for the leather patch', seed: 11, when: booted,
    setup: function () { game({ setup: function (g) { g.pos = [18, 22]; g.stamp = [5, 6]; } }); },
    checks: [{ kind: 'play', name: 'adv then place', snap: function () { return { n: G.board[0].filter(function (c) { return c === 100; }).length }; }, steps: [{ sel: '[data-a=adv]' }, { sel: function () { return document.querySelectorAll('#quilt .qc')[40]; }, ready: function () { return !!G.pend && !UI.busy; } }], idle: function () { return !UI.busy && !G.pend && G.leather[0] === 0; }, verify: function (a, b) { return b.n === 1 || 'leather squares ' + b.n; } }] });
  GXS.add({ id: 'sw-zoom', name: 'Patch shown large', ask: 'Tap a patch twice. Can you read it?', seed: 11, when: booted,
    setup: function () { game(); showPatch(swOffer(G)[0]); },
    checks: [{ kind: 'visible', sel: '#bigd.on .big .facts', name: 'big patch facts' }, { kind: 'text', sel: '#bigd.on .big p', re: /squares/i, name: 'full text' }] });
  GXS.add({ id: 'sw-result', name: 'Result screen', ask: 'Does the result add up?', seed: 11, when: booted,
    setup: function () { game(); G.pos = [53, 53]; G.over = true; G.btn = [30, 12]; G.stamp = [10, 11]; UI.mode = 'vs'; showResult(); },
    checks: [{ kind: 'visible', sel: '#rs .win', name: 'winner line' }, { kind: 'visible', sel: '#rs [data-a=again]', name: 'Play again' }] });
  GXS.add({ id: 'sw-torn', name: 'Torn squares twist', ask: 'See 3 torn squares in your quilt?', seed: 11, when: booted,
    setup: function () { game({ setup: function (g) { applyTwist({ id: 'torn-squares', param: 3 }); } }); },
    checks: [{ kind: 'fn', name: '3 torn squares', fn: function () { return document.querySelectorAll('#quilt .qc.torn').length === 3 || 'torn ' + document.querySelectorAll('#quilt .qc.torn').length; } }] });
})();

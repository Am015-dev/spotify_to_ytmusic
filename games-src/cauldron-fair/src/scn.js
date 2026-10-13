// Cauldron Fair scenarios (see shell/gx-scenario.js): ?scn=<id> builds ONE state directly. Registered before the game scripts run; setup() runs after boot.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof render === 'function' && typeof UI !== 'undefined' && typeof act === 'function'; };
  var $ = function (s) { return document.querySelector(s); };
  var idle = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var words = function (t) { return String(t).trim().split(/\s+/).filter(Boolean).length; };
  var inView = function (e) { var r = e.getBoundingClientRect(); return r.left >= -2 && r.right <= innerWidth + 2 && r.top >= -2 && r.bottom <= innerHeight + 2; };
  var skin = { kind: 'fn', name: 'painted skin moves no box', fn: function () { if (typeof GXSK === 'undefined') return true; var a = GXSK.audit(); return !a.moved.length || a.moved.slice(0, 2).join(' | '); } };
  // your points / rubies: the side panel on a wide screen, the top bar on a phone
  function mine(title, i) { var e = $('#me .st[title^=' + title + '] b'); if (e && GXS.vis(e)) return GXS.num('#me .st[title^=' + title + '] b'); var b = document.querySelectorAll('#barstat .bst b')[i]; return b ? +b.textContent : NaN; }
  // a plain three-cook game (you vs two computers), no menus, tips off; the day's fortune card is taken (first option) so the brew controls show
  function table(seed) {
    try { GXH.setEnabled(false); } catch (e) { }
    try { GX.close(); } catch (e) { }
    UI.seed = seed; newGame('vs'); UI.coach.level = 'off'; UI.tip = null;
    try { GXH.setEnabled(false); GXH.hide(); } catch (e) { }
    return GXS.wait(function () { return UI.started && UI.legal && UI.legal[0] && UI.legal[0].length; }, 12000).then(function () { return idle(800); }).then(function () {
      if (G.phase === 'prep') act(UI.legal[0][0], 0);
      return GXS.wait(function () { return G.phase === 'brew' && document.querySelector('#acts .bagb'); }, 12000);
    }).then(function () { return idle(3600); });
  }

  GXS.add({
    id: 'cf-board', name: 'Start of game board', ask: 'Is the board clear and filled?', seed: 5, when: booted,
    setup: function () { return table(5); },
    checks: [
      { kind: 'visible', sel: '#cwrap', name: 'cauldron board' },
      { kind: 'fn', name: 'board fills the screen', fn: function () { var r = $('#board').getBoundingClientRect(), f = r.width * r.height / (innerWidth * innerHeight); return f > .5 || 'board only ' + Math.round(f * 100) + '% of the screen'; } },
      { kind: 'visible', sel: '#acts .bagb', name: 'Draw (the bag)' },
      { kind: 'visible', sel: '#acts .stopb', name: 'Stop button' },
      { kind: 'text', sel: '#acts .bagb', re: /draw/i, name: 'Draw label' },
      { kind: 'text', sel: '#acts .stopb', re: /stop/i, name: 'Stop label' },
      { kind: 'eq', name: 'your points', a: function () { return mine('Victory', 0); }, b: function () { return G.players[0].vp; } },
      { kind: 'eq', name: 'your rubies', a: function () { return mine('Rubies', 1); }, b: function () { return G.players[0].rubies; } },
      { kind: 'eq', name: 'chips in the bag', a: function () { return GXS.num('#acts .bagb .bagn'); }, b: function () { return G.players[0].bag.length; } },
      { kind: 'fn', name: 'no line of text over 8 words on the board', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#board *, #acts *, #others *'), function (e) { if (e.children.length || !GXS.vis(e)) return; var t = (e.textContent || '').trim(); if (words(t) > 8) bad = bad || '"' + t.slice(0, 40) + '" (' + words(t) + ' words)'; }); return !bad || bad; } },
      skin
    ]
  });

  GXS.add({
    id: 'cf-zoom', name: 'Chips, books and cards', ask: 'Is the chip and card list readable?', seed: 5, when: booted,
    setup: function () { return table(5).then(function () { GX.show('refd'); try { renderDrawers(); } catch (e) { } [].forEach.call(document.querySelectorAll('#refd details'), function (d) { d.open = true; }); return idle(700); }); },
    checks: [
      { kind: 'visible', sel: '#refd summary', name: 'first section title' },
      { kind: 'text', sel: '#refd summary', re: /\S/, name: 'section title', minPx: 13 },
      { kind: 'fn', name: 'book cards have a name and text', fn: function () { var c = document.querySelectorAll('#refd .rcard .rt b'); return c.length >= 8 || 'only ' + c.length + ' book names'; } },
      { kind: 'fn', name: 'every shown text >= 12 px', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#refd .gx-drawer-body *'), function (e) { if (e.children.length || !GXS.vis(e) || !(e.textContent || '').trim()) return; var px = parseFloat(getComputedStyle(e).fontSize); if (px < 12 && !bad) bad = '"' + e.textContent.trim().slice(0, 20) + '" ' + px + 'px'; }); return !bad || bad; } },
      { kind: 'fn', name: 'drawer is on screen', fn: function () { return inView($('#refd')) || 'drawer off screen'; } },
      skin,
      { kind: 'tap', sel: '#refd .gx-x', name: 'tap closes the drawer', state: function () { return GX.open === 'refd'; }, expect: function (a, b) { return (a && !b) || 'drawer did not close'; } }
    ]
  });
})();

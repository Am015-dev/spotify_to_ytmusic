// Hollowbough scenarios (see shell/gx-scenario.js): ?scn=<id> builds ONE state directly. Registered before the game scripts run; setup() runs after boot.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof UI !== 'undefined' && typeof render === 'function' && typeof HB !== 'undefined'; };
  var $ = function (s) { return document.querySelector(s); };
  // a two-player game (you vs one computer), no menus, tips off, waiting at YOUR first turn
  function table(seed) {
    try { GXH.setEnabled(false); } catch (e) { }
    try { GX.close(); } catch (e) { }
    UI.seed = seed; UI.opt = { np: 2, level: 'normal', solo: 1 }; newGame('vs'); UI.fingerSeen = true; try { GXH.setEnabled(false); } catch (e) { }
    return GXS.wait(function () { return UI.started && HB.actor(G) === 0 && !UI.animBusy && !UI.cards.length && document.querySelectorAll('#bd .hc').length; }, 15000).then(function () { return new Promise(function (r) { setTimeout(r, 700); }); });
  }
  var inView = function (e) { var r = e.getBoundingClientRect(); return r.left >= -2 && r.right <= innerWidth + 2 && r.top >= -2 && r.bottom <= innerHeight + 2; };
  var words = function (t) { return String(t).trim().split(/\s+/).filter(Boolean).length; };
  var skin = { kind: 'fn', name: 'painted skin moves no box', fn: function () { if (typeof GXSK === 'undefined') return true; var a = GXSK.audit(); return !a.moved.length || a.moved.slice(0, 2).join(' | '); } };
  // make exactly one hand card playable: it goes first in the hand and you hold exactly its cost
  function oneAffordable() {
    var me = G.players[0], pick = null;
    for (var i = 0; i < me.hand.length && !pick; i++) { var id = me.hand[i], c = cdef(id); if (HB.howOptions && true) { } me.res = { twig: 0, resin: 0, pebble: 0, berry: 0 }; for (var k in c.cost) if (k in me.res) me.res[k] = c.cost[k]; UI.mmc = null; if (myMoves().some(function (m) { return m.type === 'play' && m.card === id; })) pick = id; }
    if (pick == null) throw new Error('no playable hand card for this seed');
    me.hand.splice(me.hand.indexOf(pick), 1); me.hand.unshift(pick); UI.mmc = null; UI.hsx = 0; render();
    return pick;
  }

  GXS.add({
    id: 'hb-hand-chips', name: 'Hand chips: readable, tappable', ask: 'Tap the glowing hand chip', seed: 5, when: booted,
    setup: function () { return table(5).then(function () { window.__pick = oneAffordable(); return new Promise(function (r) { setTimeout(r, 600); }); }); },
    checks: [
      { kind: 'visible', sel: '#bd .hc.glow', name: 'playable hand chip' },
      { kind: 'text', sel: '#bd .hc .hcn', re: /\S/, name: 'chip name', minPx: 12 },
      { kind: 'fn', name: 'every hand chip: text >= 12 px, nothing clipped', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#bd .hc'), function (c) { [].forEach.call(c.querySelectorAll('.hcn,.hcr b,.hcp b'), function (e) { var px = parseFloat(getComputedStyle(e).fontSize); if (px < 12) bad = bad || e.textContent + ' ' + px + 'px'; if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'visible') bad = bad || 'clipped ' + e.textContent; }); var r = c.getBoundingClientRect(), t = c.querySelector('.hcx'); if (t && t.getBoundingClientRect().right > r.right + 1) bad = bad || 'text spills out of ' + c.getAttribute('aria-label'); }); return !bad || bad; } },
      { kind: 'fn', name: 'first chip is fully inside the viewport', fn: function () { var e = document.querySelector('#bd .hc'); return inView(e) || 'chip off screen'; } },
      { kind: 'fn', name: 'chip row is not under the buttons', fn: function () { var c = document.querySelector('#bd .hc').getBoundingClientRect(), a = [].filter.call(document.querySelectorAll('#acts button, #acts .btn'), GXS.vis).map(function (b) { return b.getBoundingClientRect(); }); var hit = a.filter(function (b) { return b.top < c.bottom - 2 && b.bottom > c.top + 2 && b.left < c.right && b.right > c.left; }); return !hit.length || 'a button covers the chips'; } },
      { kind: 'tap', sel: '#bd .hc:not(.glow)', name: 'tap an unaffordable chip', state: function () { var m = G.players[0]; return { n: m.hand.length, city: m.city.length, log: G.logN }; }, expect: function (a, b) { return (a.n === b.n && a.city === b.city && a.log === b.log) || 'an unaffordable card changed the game'; } },
      { kind: 'tap', sel: '#bd .hc.glow', name: 'tap the glowing chip', state: function () { var m = G.players[0]; return { n: m.hand.length, city: m.city.length, log: G.logN, sel: !!UI.sel }; }, expect: function (a, b) { return (b.sel || (b.log > a.log && b.n === a.n - 1)) || 'a playable card must be played (or ask how)'; } }
    ]
  });
  var rgb = function (c) { var m = String(c).match(/[\d.]+/g) || [0, 0, 0]; return m.slice(0, 3).map(Number); };
  var lum = function (c) { return .2126 * Math.pow(c[0] / 255, 2.2) + .7152 * Math.pow(c[1] / 255, 2.2) + .0722 * Math.pow(c[2] / 255, 2.2); };
  var contrast = function (a, b) { var x = lum(rgb(a)), y = lum(rgb(b)); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };

  GXS.add({
    id: 'hb-board', name: 'Start of game board', ask: 'Is the board clear and filled?', seed: 7, when: booted,
    setup: function () { return table(7); },
    checks: [
      { kind: 'visible', sel: '#bd', name: 'board' },
      { kind: 'fn', name: 'board fills the screen', fn: function () { var r = document.querySelector('#bd').getBoundingClientRect(), f = r.width * r.height / (innerWidth * innerHeight); return f > .55 || 'board only ' + Math.round(f * 100) + '% of the screen'; } },
      { kind: 'visible', sel: '#bd .hc', name: 'hand' },
      { kind: 'visible', sel: '#acts .btn', name: 'Pass / Prepare buttons' },
      { kind: 'text', sel: '#prompt', re: /\S/, name: 'top line' },
      { kind: 'fn', name: 'top line has contrast >= 3 against the bar', fn: function () { var e = document.querySelector('#prompt'), bar = document.querySelector('.gx-bar'), c = contrast(getComputedStyle(e).color, getComputedStyle(bar).backgroundColor); return c >= 3 || 'contrast ' + c.toFixed(1) + ' (' + getComputedStyle(e).color + ' on ' + getComputedStyle(bar).backgroundColor + ')'; } },
      { kind: 'fn', name: 'no line of text over 8 words on the board', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#bd *, #prompt'), function (e) { if (e.children.length || !GXS.vis(e)) return; var t = (e.textContent || '').trim(); if (words(t) > 8) bad = bad || '"' + t.slice(0, 40) + '" (' + words(t) + ' words)'; }); return !bad || bad; } },
      skin
    ]
  });

  GXS.add({
    id: 'hb-zoom', name: 'Card zoom', ask: 'Is the big card readable?', seed: 8, when: booted,
    setup: function () { return table(8).then(function () { openZoom('card:' + document.querySelector('#bd .hc').dataset.id); return new Promise(function (r) { setTimeout(r, 600); }); }); },
    checks: [
      { kind: 'visible', sel: '#zoom .zbox svg, #zoom .zbox canvas, #zoom .zbox img, #zoom .zbox .card', name: 'zoomed card' },
      { kind: 'text', sel: '#zoom .zinfo b', re: /\S/, name: 'card name', minPx: 14 },
      { kind: 'text', sel: '#zoom .zinfo p', re: /\S/, name: 'card text', minPx: 13 },
      { kind: 'fn', name: 'zoom is on screen', fn: function () { var e = document.querySelector('#zoom .zbox'), r = e.getBoundingClientRect(); return (r.left >= -1 && r.right <= innerWidth + 1 && r.top >= -1 && r.bottom <= innerHeight + 1) || 'zoom box off screen ' + Math.round(r.left) + ',' + Math.round(r.top) + ',' + Math.round(r.right) + ',' + Math.round(r.bottom); } },
      { kind: 'tap', sel: '#zoom .zbox', name: 'tap closes the zoom', state: function () { return !document.getElementById('zoom').hidden; }, expect: function (a, b) { return (a && !b) || 'zoom did not close'; } }
    ]
  });

  GXS.add({
    id: 'hb-handtoggle', name: 'Hide and show the hand', ask: 'Tap the hand toggle. Does the row hide?', seed: 9, sizes: 'phone', when: booted, group: 'Board',
    setup: function () { return table(9); },
    checks: [
      { kind: 'visible', sel: '#bd .hc', name: 'hand row' },
      { kind: 'visible', sel: '#bd .htog', name: 'hand toggle' },
      { kind: 'tap', sel: '#bd .htog', name: 'tap the hand toggle', state: function () { return !!UI.handHide; }, expect: function (a, b) { return a !== b || 'the hand toggle did nothing'; } },
      { kind: 'visible', sel: '#bd .handbar', name: 'show-hand bar' },
      { kind: 'tap', sel: '#bd .handbar', name: 'tap to show the hand', state: function () { return !!UI.handHide; }, expect: function (a, b) { return (a === true && b === false) || 'the hand did not come back'; } }
    ]
  });

  GXS.add({
    id: 'hb-help', name: 'Rules cards', ask: 'Can you read the rules card?', seed: 10, when: booted, group: 'UI',
    setup: function () { return table(10).then(function () { GXH.rules(); return GXS.wait(function () { return $('.gxh-card'); }, 5000); }).then(function () { return new Promise(function (r) { setTimeout(r, 400); }); }); },
    checks: [
      { kind: 'visible', sel: '.gxh-card', name: 'rules card' },
      { kind: 'text', sel: '.gxh-rt', re: /\S/, name: 'card title' },
      { kind: 'text', sel: '.gxh-rx', re: /\S/, name: 'card text' },
      { kind: 'tap', sel: '.gxh-x', name: 'tap Close', state: function () { return !!$('.gxh-card'); }, expect: function (a, b) { return (a === true && b === false) || 'close the card'; } }
    ]
  });

  // painted art wired: every pushed file loads, the resource icons and season wheel on the board are real pictures, not stretched
  var ART = ['icon-berry', 'icon-pebble', 'icon-resin', 'icon-twig', 'ui-season-wheel', 'ui-bubble', 'ui-bubble-tail', 'ui-button-cream', 'ui-button-go', 'ui-button-power', 'ui-drawer-head', 'ui-iconbtn', 'ui-node-boss', 'ui-node-done', 'ui-node-locked', 'ui-node-open', 'ui-panel', 'ui-row', 'ui-topbar'];
  GXS.add({
    id: 'hb-art', name: 'Painted art wired', ask: 'Are the resource icons painted?', seed: 6, when: booted, group: 'UI',
    setup: function () { return table(6).then(function () { return Promise.all(ART.map(function (n) { return new Promise(function (r) { var i = new Image(); i.onload = function () { r(i.naturalWidth > 0 ? '' : n); }; i.onerror = function () { r(n); }; i.src = 'media/' + n + '.webp'; }); })); }).then(function (a) { window.__artBad = a.filter(Boolean); }); },
    checks: [
      { kind: 'fn', name: 'all 19 painted files load', fn: function () { return !window.__artBad.length || 'did not load: ' + window.__artBad.join(', '); } },
      { kind: 'fn', name: 'painted resource icons show on the board', fn: function () { var n = ['berry', 'pebble', 'resin', 'twig'].filter(function (k) { return document.querySelector('img[src*="icon-' + k + '"]'); }); return n.length >= 3 || 'painted icons on the board: ' + n.join(','); } },
      { kind: 'fn', name: 'painted pictures loaded and not stretched', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('img[src*="icon-"], img[src*="ui-season"]'), function (e) { if (!GXS.vis(e)) return; if (!e.naturalWidth) bad = bad || e.src; var r = e.getBoundingClientRect(); if (e.naturalWidth && r.width > 4 && Math.abs(r.width / r.height - e.naturalWidth / e.naturalHeight) > 0.15) bad = bad || 'stretched ' + e.src; }); return !bad || bad; } },
      skin
    ]
  });
})();

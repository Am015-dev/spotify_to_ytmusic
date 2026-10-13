// Sands of Qamar scenarios (see shell/gx-scenario.js): ?scn=<id> builds ONE state directly. Registered before the game scripts run; setup() runs after boot.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof G !== 'undefined' && typeof beginGame === 'function' && typeof render === 'function' && typeof UI !== 'undefined' && typeof shownTotal === 'function' && typeof GX !== 'undefined'; };
  var $ = function (s) { return document.querySelector(s); };
  var idle = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var words = function (t) { return String(t).trim().split(/\s+/).filter(Boolean).length; };
  var inView = function (e) { var r = e.getBoundingClientRect(); return r.left >= -2 && r.right <= innerWidth + 2 && r.top >= -2 && r.bottom <= innerHeight + 2; };
  var skin = { kind: 'fn', name: 'painted skin moves no box', fn: function () { if (typeof GXSK === 'undefined') return true; var a = GXSK.audit(); return !a.moved.length || a.moved.slice(0, 2).join(' | '); } };
  // a plain two-player game (you vs one computer), no menus, tips off, waiting at YOUR first bid
  function table(seed) {
    try { GXH.setEnabled(false); } catch (e) { }
    try { GX.close(); } catch (e) { }
    UI.modal = null; UI.setup.np = 2; UI.setup.seats = ['human', 'ai']; UI.setup.lv = ['normal', 'normal']; AIDELAY = 60;
    beginGame(); try { GXH.setEnabled(false); GXH.hide(); } catch (e) { }
    return GXS.wait(function () { return G && G.phase === 'bid' && $('#acts .sp-b.glow') && !UI.modal; }, 12000).then(function () { return idle(1200); });
  }

  GXS.add({
    id: 'sq-board', name: 'Start of game board', ask: 'Is the bazaar clear and filled?', seed: 5, when: booted,
    setup: function () { return table(5); },
    checks: [
      { kind: 'visible', sel: '#grid', name: 'bazaar grid' },
      { kind: 'fn', name: 'board fills the screen', fn: function () { var r = $('#bd').getBoundingClientRect(), f = r.width * r.height / (innerWidth * innerHeight); return f > .5 || 'board only ' + Math.round(f * 100) + '% of the screen'; } },
      { kind: 'visible', sel: '#acts .sp-b.glow', name: 'first bid spot' },
      { kind: 'text', sel: '#acts .sp-b.glow', re: /\d/, name: 'bid label' },
      { kind: 'text', sel: '#line', re: /\S/, name: 'top line' },
      { kind: 'fn', name: 'every bid spot is on screen', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#acts .sp-b'), function (e) { if (!bad && !inView(e)) bad = 'bid spot ' + (e.getAttribute('aria-label') || '') + ' off screen'; }); return !bad || bad; } },
      { kind: 'eq', name: 'your score', a: function () { return GXS.num('.sch[data-seat="0"] .ss'); }, b: function () { return shownTotal(G.pl[0]); } },
      { kind: 'eq', name: 'rival score', a: function () { return GXS.num('.sch[data-seat="1"] .ss'); }, b: function () { return shownTotal(G.pl[1]); } },
      { kind: 'eq', name: 'your coins', a: function () { return GXS.num('.sch[data-seat="0"] .st:nth-child(1)'); }, b: function () { return G.pl[0].coins; } },
      { kind: 'eq', name: 'your camels', a: function () { return GXS.num('.sch[data-seat="0"] .st:nth-child(2)'); }, b: function () { return G.pl[0].camels; } },
      { kind: 'fn', name: 'no line of text over 8 words on the board', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#table *, #line, #seats *, #acts *'), function (e) { if (e.children.length || !GXS.vis(e)) return; var t = (e.textContent || '').trim(); if (words(t) > 8) bad = bad || '"' + t.slice(0, 40) + '" (' + words(t) + ' words)'; }); return !bad || bad; } },
      skin,
      { kind: 'tap', sel: '#acts .sp-b.glow', name: 'tap a bid spot', state: function () { return JSON.stringify([G.bids.length, G.phase, G.turn, G.bidQueue.length]); }, expect: function (a, b) { return a !== b || 'the bid did nothing'; } }
    ]
  });

  GXS.add({
    id: 'sq-zoom', name: 'Djinn card list', ask: 'Are the djinn cards readable?', seed: 6, when: booted,
    setup: function () { return table(6).then(function () { GX.show('djd'); try { renderDjPop(); } catch (e) { } return idle(900); }); },
    checks: [
      { kind: 'visible', sel: '#djd .card.dj', name: 'a djinn card' },
      { kind: 'text', sel: '#djd .card.dj h4', re: /\S/, name: 'djinn name', minPx: 14 },
      { kind: 'text', sel: '#djd .card.dj p', re: /\S/, name: 'djinn power text', minPx: 13 },
      { kind: 'fn', name: 'every shown text >= 12 px', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#djd .gx-drawer-body *'), function (e) { if (e.children.length || !GXS.vis(e) || !(e.textContent || '').trim()) return; var px = parseFloat(getComputedStyle(e).fontSize); if (px < 12 && !bad) bad = '"' + e.textContent.trim().slice(0, 20) + '" ' + px + 'px'; }); return !bad || bad; } },
      { kind: 'fn', name: 'drawer is on screen', fn: function () { return inView($('#djd')) || 'drawer off screen'; } },
      skin,
      { kind: 'tap', sel: '#djd .gx-x', name: 'tap closes the drawer', state: function () { return GX.open === 'djd'; }, expect: function (a, b) { return (a && !b) || 'drawer did not close'; } }
    ]
  });

  GXS.add({
    id: 'sq-chips', name: 'Bid chips and score chips', ask: 'Are the bid numbers big enough?', seed: 7, when: booted, group: 'Board',
    setup: function () { return table(7); },
    checks: [
      { kind: 'text', sel: '#acts .sp-b.glow', re: /\d/, name: 'bid chip number', minPx: 13 },
      { kind: 'fn', name: 'every bid chip number >= 13 px', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#acts .sp-b'), function (e) { if (bad || !GXS.vis(e)) return; var px = parseFloat(getComputedStyle(e).fontSize); if (px < 13) bad = 'bid chip font ' + px + ' px'; }); return !bad || bad; } },
      { kind: 'visible', sel: '.sch[data-seat="0"] .ss', name: 'your score chip' },
      { kind: 'eq', name: 'your score', a: function () { return GXS.num('.sch[data-seat="0"] .ss'); }, b: function () { return shownTotal(G.pl[0]); } },
      skin
    ]
  });

  GXS.add({
    id: 'sq-help', name: 'Rules cards', ask: 'Can you read the rules card?', seed: 8, when: booted, group: 'UI',
    setup: function () { return table(8).then(function () { GXH.rules(); return GXS.wait(function () { return $('.gxh-card'); }, 5000); }).then(function () { return idle(400); }); },
    checks: [
      { kind: 'visible', sel: '.gxh-card', name: 'rules card' },
      { kind: 'text', sel: '.gxh-rt', re: /\S/, name: 'card title' },
      { kind: 'text', sel: '.gxh-rx', re: /\S/, name: 'card text' },
      { kind: 'tap', sel: '.gxh-x', name: 'tap Close', state: function () { return !!$('.gxh-card'); }, expect: function (a, b) { return (a === true && b === false) || 'close the card'; } }
    ]
  });
  // painted plates/glyphs/badges: every wired file loaded, applied to its element, and not stretched out of shape
  var ART = [ // [selector, pseudo, file, max stretch]
    ['.tile.blue', '::after', 'ui-tile-frame-blue', 0], ['.tile:not(.blue)', '::after', 'ui-tile-frame-red', 0],
    ['.tile .tv', '', 'ui-badge-gold', 1.6], ['.dcard:not(.th) .dv', '', 'ui-badge-cream', 1.6],
    ['.sch .sti', '', 'icon-star', 0], ['.mcard:not(.empty)', '', 'ui-goods-card', 0]
  ];
  var PROBE = [ // transient pieces: built as a probe so their CSS is tested without waiting for the moment
    ['<div class="card dj"><h4>Djinn</h4></div>', '.card.dj h4', '', 'ui-djinn-bar', 0], ['<div id="summon"><b>Name</b></div>', '#summon b', '', 'ui-ribbon', 0],
    ['<div class="stat"><b class="nm">Ann</b></div>', '.stat .nm', '', 'ui-nameplate', 0], ['<div class="gxh-bub gxh-a-bottom"><i class="gxh-arr"></i></div>', '.gxh-arr', '', 'ui-bubble-tail', 0],
    ['<div id="finger"><svg></svg></div>', '#finger', '', 'ui-finger', 0]
  ];
  var GLYPH = ['village', 'sacred', 'oasis', 'small', 'large', 'workshop', 'exchange', 'city', 'lake'];
  function bg(sel, ps) { var e = $(sel); if (!e) return null; var cs = getComputedStyle(e, ps || null); return { e: e, s: cs.backgroundImage + ' ' + cs.borderImageSource + ' ' + cs.getPropertyValue('--gl'), cs: cs }; }
  function loaded(f) { return new Promise(function (r) { var i = new Image(); i.onload = function () { r(i.naturalWidth > 0 && i); }; i.onerror = function () { r(false); }; i.src = 'media/' + f + '.webp'; }); }
  var artOut = null;
  GXS.add({
    id: 'sq-art', name: 'Painted plates and glyphs', ask: 'Are the painted pieces sharp and in place?', seed: 9, when: booted, group: 'Art',
    setup: function () {
      return table(9).then(function () {
        var h = document.createElement('div'); h.id = 'artprobe'; h.style.cssText = 'position:fixed;left:-999px;top:0;width:200px'; h.innerHTML = PROBE.map(function (p) { return p[0]; }).join(''); document.body.appendChild(h);
        var files = ART.map(function (a) { return a[2]; }).concat(PROBE.map(function (p) { return p[3]; }), GLYPH.map(function (k) { return 'glyph-' + k; }), Object.keys(ITEMS).map(function (k) { return 'item-' + k; }), ['ui-trophy']);
        return Promise.all(files.map(loaded)).then(function (r) { artOut = {}; files.forEach(function (f, i) { artOut[f] = r[i]; }); return idle(300); });
      });
    },
    checks: [
      { kind: 'fn', name: 'painted layer is on', fn: function () { return document.documentElement.classList.contains('sk-pl') || 'html.sk-pl missing'; } },
      { kind: 'fn', name: 'every wired file loads (naturalWidth > 0)', fn: function () { var bad = Object.keys(artOut).filter(function (f) { return !artOut[f]; }); return !bad.length || 'not loaded: ' + bad.join(', '); } },
      { kind: 'fn', name: 'plates, badges, frames use their painting', fn: function () {
        var bad = ''; ART.forEach(function (a) { var b = bg(a[0], a[1]); if (!b) { bad = bad || 'no element ' + a[0]; return; } if (b.s.indexOf(a[2] + '.webp') < 0) bad = bad || a[0] + a[1] + ' lacks ' + a[2]; });
        return !bad || bad; } },
      { kind: 'fn', name: 'every tile kind has its glyph medallion', fn: function () {
        var bad = ''; [].forEach.call(document.querySelectorAll('.tile'), function (t) { var k = (t.className.match(/k-(\w+)/) || [])[1]; var s = getComputedStyle(t, '::before').backgroundImage; if (k && GLYPH.indexOf(k) >= 0 && s.indexOf('glyph-' + k + '.webp') < 0) bad = bad || 'tile ' + k + ' has no glyph'; });
        return !bad || bad; } },
      { kind: 'fn', name: 'transient pieces (djinn bar, ribbon, name plate, bubble tail, finger) are painted', fn: function () {
        var bad = ''; PROBE.forEach(function (p) { var b = bg(p[1], p[2]); if (!b || b.s.indexOf(p[3] + '.webp') < 0) bad = bad || p[1] + ' lacks ' + p[3]; }); return !bad || bad; } },
      { kind: 'fn', name: 'item and trophy pictures replace the emoji', fn: function () { return (itemIc('lamp').indexOf('item-lamp.webp') > 0 && pIc('ui-trophy.webp', 'x').indexOf('ui-trophy.webp') > 0) || 'emoji still shown'; } },
      { kind: 'fn', name: 'plates are not stretched out of shape', fn: function () {
        var bad = ''; ART.forEach(function (a) { if (!a[3]) return; var e = $(a[0]); if (!e) return; var r = e.getBoundingClientRect(), i = artOut[a[2]]; if (!i || !r.width || !r.height) return; var q = (r.width / r.height) / (i.naturalWidth / i.naturalHeight); if (q > a[3] || q < 1 / a[3]) bad = bad || a[0] + ' stretched x' + q.toFixed(2); });
        return !bad || bad; } },
      { kind: 'fn', name: 'labels on the art stay readable (>= 11 px)', fn: function () { var bad = ''; ['.sch .sn', '.tile .tn', '.tile .tv', '.dcard b'].forEach(function (s) { var e = $(s); if (e && parseFloat(getComputedStyle(e).fontSize) < 11 && !bad) bad = s + ' ' + getComputedStyle(e).fontSize; }); return !bad || bad; } },
      skin
    ]
  });
})();

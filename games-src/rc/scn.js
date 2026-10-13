// Shipwreck Isle scenarios (see shell/gx-scenario.js): ?scn=<id> builds ONE state directly. Registered before the game scripts run; setup() runs after boot.
(function () {
  if (!window.GXS) return;
  // under the test runner (webdriver) the software 3D renderer would make every page crawl: the game falls back to its flat map (the same board), the dock and buttons are the same
  try { if (navigator.webdriver && GXS.on && !/[?&]gl=1/.test(location.search)) { var gc = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t) { return /webgl/i.test(String(t)) ? null : gc.apply(this, arguments); }; var ce = console.error; console.error = function (m) { if (/WebGLRenderer/.test(String(m))) return; return ce.apply(console, arguments); }; } } catch (e) { }
  var booted = function () { return typeof G !== 'undefined' && typeof beginGame === 'function' && typeof refresh === 'function' && typeof UI !== 'undefined' && typeof PHO !== 'undefined'; };
  var $ = function (s) { return document.querySelector(s); };
  var idle = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var words = function (t) { return String(t).trim().split(/\s+/).filter(Boolean).length; };
  var inView = function (e) { var r = e.getBoundingClientRect(); return r.left >= -2 && r.right <= innerWidth + 2 && r.top >= -2 && r.bottom <= innerHeight + 2; };
  var skin = { kind: 'fn', name: 'painted skin moves no box', fn: function () { if (typeof GXSK === 'undefined') return true; var a = GXSK.audit(); return !a.moved.length || a.moved.slice(0, 2).join(' | '); } };
  // a plain solo game (carpenter, cook and Friday), no menus, no story card, tips off, waiting at day 1 planning
  function table(seed) {
    try { GXH.setEnabled(false); } catch (e) { }
    try { GX.close(); } catch (e) { }
    try { setGfx('low'); } catch (e) { }
    AIDELAY = 60; UI.speed = 1; UI.modal = null; beginGame(); UI.beats.length = 0; UI.shown = -1; refresh();
    try { GXH.setEnabled(false); GXH.hide(); } catch (e) { }
    return GXS.wait(function () { return G && G.phase === 'plan' && (!PHO.on || /^plan/.test(PHO.st || '')) && $('#panel') && !UI.modal; }, 15000).then(function () { return idle(1500); });
  }

  GXS.add({
    id: 'si-board', name: 'Start of game board', ask: 'Is the island clear with glowing places?', seed: 5, when: booted,
    setup: function () { return table(5); },
    checks: [
      { kind: 'visible', sel: '.gx-board', name: 'board' },
      { kind: 'fn', name: 'board fills the screen', fn: function () { var r = $('.gx-board').getBoundingClientRect(), f = r.width * r.height / (innerWidth * innerHeight); return f > .5 || 'board only ' + Math.round(f * 100) + '% of the screen'; } },
      { kind: 'fn', name: 'top line is shown and readable', fn: function () { var e = PHO.on ? $('#phlabel') : $('#dockt'); if (!e || !GXS.vis(e)) return 'top line not visible'; if (!/\S/.test(e.textContent)) return 'blank'; var px = parseFloat(getComputedStyle(e).fontSize); return px >= 12 || 'font ' + px + 'px'; } },
      { kind: 'fn', name: 'phone: food / wood / hearts chip is shown', fn: function () { var c = $('#phchip'); if (!PHO.on) return true; return (c && GXS.vis(c) && inView(c)) || 'no resource chip'; } },
      { kind: 'eq', name: 'day number', a: function () { var c = $('#phchip'); return c && GXS.vis(c) ? GXS.num('#phchip b') : +(/day (\d+)/i.exec($('#dockt').textContent) || [0, NaN])[1]; }, b: function () { return G.round; } },
      { kind: 'eq', name: 'food (phone chip)', a: function () { return PHO.on ? GXS.num('#phchip i:nth-of-type(1)') : G.res.food; }, b: function () { return G.res.food; } },
      { kind: 'eq', name: 'wood (phone chip)', a: function () { return PHO.on ? GXS.num('#phchip i:nth-of-type(2)') : G.res.wood; }, b: function () { return G.res.wood; } },
      { kind: 'fn', name: 'the main green button is on screen and not covered', fn: function () { var b = [].filter.call(document.querySelectorAll('#bf .bf-main .btn.go, .gx-dock .btn.go'), GXS.vis)[0]; if (!b) return 'no green button'; if (!inView(b)) return 'green button off screen'; var r = b.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return (t && (t === b || b.contains(t))) || 'covered by ' + (t && (t.id || t.className)); } },
      { kind: 'fn', name: 'no line of text over 8 words on the board', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#phlabel, #dockt, #phchip, #roadmap *, #dockmsg'), function (e) { if (e.children.length || !GXS.vis(e)) return; var t = (e.textContent || '').trim(); if (words(t) > 8) bad = bad || '"' + t.slice(0, 40) + '" (' + words(t) + ' words)'; }); return !bad || bad; } },
      skin
    ]
  });

  GXS.add({
    id: 'si-zoom', name: 'Card zoom', ask: 'Is the big card readable?', seed: 6, sizes: 'phone', when: booted,
    setup: function () {
      return table(6).then(function () { GX.show('cardsd'); try { renderCards(); } catch (e) { } return idle(500); }).then(function () {
        var c = $('#cardsbody .card'); if (!c) throw new Error('no card in the card list'); c.click(); return idle(600);
      });
    },
    checks: [
      { kind: 'visible', sel: '#pzoom .zc-b', name: 'zoomed card' },
      { kind: 'fn', name: 'the zoomed card has text', fn: function () { return /\S/.test($('#pzoom .zc-b').textContent) || 'blank card'; } },
      { kind: 'fn', name: 'every shown text >= 12 px', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#pzoom .zc-b *'), function (e) { if (e.children.length || !GXS.vis(e) || !(e.textContent || '').trim()) return; var px = parseFloat(getComputedStyle(e).fontSize); if (px < 12 && !bad) bad = '"' + e.textContent.trim().slice(0, 20) + '" ' + px + 'px'; }); return !bad || bad; } },
      { kind: 'fn', name: 'zoom is on screen', fn: function () { return inView($('#pzoom .zc')) || 'zoom off screen'; } },
      skin,
      { kind: 'tap', sel: '#pzoom .zc-x', name: 'tap closes the zoom', state: function () { return !$('#pzoom').hidden; }, expect: function (a, b) { return (a && !b) || 'zoom did not close'; } }
    ]
  });
})();

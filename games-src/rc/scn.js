// Shipwreck Isle scenarios (see shell/gx-scenario.js): ?scn=<id> builds ONE state directly. Registered before the game scripts run; setup() runs after boot.
(function () {
  if (!window.GXS) return;
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
    return GXS.wait(function () { return G && G.phase === 'plan' && /^plan/.test(PHO.st || '') && $('#panel') && !UI.modal; }, 15000).then(function () { return idle(1500); });
  }

  GXS.add({
    id: 'si-board', name: 'Start of game board', ask: 'Is the island clear with glowing places?', seed: 5, when: booted,
    setup: function () { return table(5); },
    checks: [
      { kind: 'visible', sel: '.gx-board', name: 'board' },
      { kind: 'fn', name: 'board fills the screen', fn: function () { var r = $('.gx-board').getBoundingClientRect(), f = r.width * r.height / (innerWidth * innerHeight); return f > .5 || 'board only ' + Math.round(f * 100) + '% of the screen'; } },
      { kind: 'text', sel: '#phlabel', re: /\S/, name: 'top line' },
      { kind: 'visible', sel: '#phchip', name: 'food / wood / hearts chip' },
      { kind: 'eq', name: 'day number', a: function () { return GXS.num('#phchip b'); }, b: function () { return G.round; } },
      { kind: 'eq', name: 'food', a: function () { return GXS.num('#phchip i:nth-of-type(1)'); }, b: function () { return G.res.food; } },
      { kind: 'eq', name: 'wood', a: function () { return GXS.num('#phchip i:nth-of-type(2)'); }, b: function () { return G.res.wood; } },
      { kind: 'fn', name: 'a button to start the day is on screen', fn: function () { var b = [].filter.call(document.querySelectorAll('#panel button, #step button, .gx-dock button'), function (e) { return GXS.vis(e) && /start day/i.test(e.textContent); })[0]; return (b && inView(b)) || 'no Start day button in view'; } },
      { kind: 'fn', name: 'no line of text over 8 words on the board', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#phlabel, #dockt, #phchip, #roadmap *, #dockmsg'), function (e) { if (e.children.length || !GXS.vis(e)) return; var t = (e.textContent || '').trim(); if (words(t) > 8) bad = bad || '"' + t.slice(0, 40) + '" (' + words(t) + ' words)'; }); return !bad || bad; } },
      skin
    ]
  });

  GXS.add({
    id: 'si-zoom', name: 'Card zoom', ask: 'Is the big card readable?', seed: 6, when: booted,
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

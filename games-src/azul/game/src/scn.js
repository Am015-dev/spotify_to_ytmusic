// Sunglaze scenarios (see shell/gx-scenario.js): ?scn=<id> builds ONE state directly. Registered before the game scripts run; setup() runs after boot.
(function () {
  if (!window.GXS) return;
  // under the test runner (webdriver) the software 3D renderer would make every page crawl: the game falls back to its flat board, the dock and board-first layer are the same
  try { if (navigator.webdriver && GXS.on && !/[?&]gl=1/.test(location.search)) { var gc = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t) { return /webgl/i.test(String(t)) ? null : gc.apply(this, arguments); }; var ce = console.error; console.error = function (m) { if (/WebGLRenderer/.test(String(m))) return; return ce.apply(console, arguments); }; } } catch (e) { }
  var booted = function () { return typeof G !== 'undefined' && typeof beginGame === 'function' && typeof refresh === 'function' && typeof UI !== 'undefined' && typeof BF !== 'undefined' && typeof bfDraw === 'function'; };
  var $ = function (s) { return document.querySelector(s); };
  var idle = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var words = function (t) { return String(t).trim().split(/\s+/).filter(Boolean).length; };
  var inView = function (e) { var r = e.getBoundingClientRect(); return r.left >= -2 && r.right <= innerWidth + 2 && r.top >= -2 && r.bottom <= innerHeight + 2; };
  var skin = { kind: 'fn', name: 'painted skin moves no box', fn: function () { if (typeof GXSK === 'undefined') return true; var a = GXSK.audit(); return !a.moved.length || a.moved.slice(0, 2).join(' | '); } };
  // a plain two-player game (you vs one computer), no menus or story card, tips off, waiting at YOUR first grab.
  // Phone: the board-first layer (#bf); wide screen: the 3D table with the side panel (the checks pick the right one).
  var ph = function () { return !!BF.on; };
  var pick = function (a, b) { return ph() ? a : b; };
  function table(seed) {
    try { GXH.setEnabled(false); } catch (e) { }
    try { GX.close(); } catch (e) { }
    UI.modal = null; UI.setup.np = 2; UI.setup.seats = ['human', 'ai']; AIDELAY = 60;
    beginGame(); UI.modal = null; refresh(); try { GXH.setEnabled(false); GXH.hide(); } catch (e) { }
    return GXS.wait(function () { return G && G.phase === 'offer' && G.cur === 0 && (BF.on ? $('.bf-k .bf-t') && !BF.busy : $('#dockbody .pk')); }, 20000).then(function () { return idle(1500); });
  }
  var scoreOf = function (i) { return ph() ? GXS.num('[data-bfsc="' + i + '"]') : +([].slice.call($('#dockbody').textContent.match(/★(\d+)/g) || [])[i] || '').replace(/\D/g, ''); };

  GXS.add({
    id: 'sg-board', name: 'Start of game board', ask: 'Are the workshops and your rack clear?', seed: 5, when: booted,
    setup: function () { return table(5); },
    checks: [
      { kind: 'visible', get sel() { return pick('#bf', '#map2d'); }, name: 'board' },
      { kind: 'fn', name: 'board fills the screen', fn: function () { var r = $(pick('#bf', '#map2d')).getBoundingClientRect(), f = r.width * r.height / (innerWidth * innerHeight); return f > .5 || 'board only ' + Math.round(f * 100) + '% of the screen'; } },
      { kind: 'visible', get sel() { return pick('.bf-k .bf-t', '#dockbody .pk'); }, name: 'a tile to grab' },
      { kind: 'text', get sel() { return pick('.bf-say', '#dockt'); }, re: /\S/, name: 'top line' },
      { kind: 'visible', get sel() { return pick('.bf-me .bf-rack', '#dockbody'); }, name: 'your rack / the pick list' },
      { kind: 'fn', name: 'every workshop and your whole rack are on screen', fn: function () { if (!ph()) return true; var bad = ''; [].forEach.call(document.querySelectorAll('.bf-k, .bf-me'), function (e) { if (!bad && !inView(e)) bad = (e.className || 'item') + ' off screen'; }); return !bad || bad; } },
      { kind: 'eq', name: 'your score', a: function () { return scoreOf(0); }, b: function () { return G.pl[0].score; } },
      { kind: 'eq', name: 'rival score', a: function () { return scoreOf(1); }, b: function () { return G.pl[1].score; } },
      { kind: 'eq', name: 'tiles in the first workshop', a: function () { return ph() ? document.querySelectorAll('.bf-k[data-bfsrc="0"] .bf-t').length : [].filter.call(document.querySelectorAll('#dockbody .pk'), function (e) { return JSON.parse(e.dataset.pick).src === 0; }).reduce(function (n, e) { return n + +/\d+/.exec(e.getAttribute('aria-label'))[0]; }, 0); }, b: function () { return G.fac[0].length; } },
      { kind: 'fn', name: 'no line of text over 8 words on the board', fn: function () { if (!ph()) return true; var bad = ''; [].forEach.call(document.querySelectorAll('#bf *'), function (e) { if (e.children.length || !GXS.vis(e)) return; var t = (e.textContent || '').trim(); if (words(t) > 8) bad = bad || '"' + t.slice(0, 40) + '" (' + words(t) + ' words)'; }); return !bad || bad; } },
      skin,
      { kind: 'tap', get sel() { return pick('.bf-k[data-bfsrc="0"] .bf-t', '#dockbody .pk'); }, name: 'tap a tile', state: function () { return JSON.stringify([G.logN, G.cur, UI.sel]); }, expect: function (a, b) { return a !== b || 'the tile tap did nothing'; } }
    ]
  });

  GXS.add({
    id: 'sg-zoom', name: 'Board / tile list zoom', ask: 'Is the rival board readable?', seed: 6, when: booted,
    setup: function () { return table(6).then(function () { if (ph()) { BF.peek = 1; bfDraw(); } else GX.show('refd'); return idle(900); }); },
    checks: [
      { kind: 'visible', get sel() { return pick('.bf-peek', '#refd .gx-drawer-body'); }, name: 'zoomed board / list' },
      { kind: 'fn', name: 'rival name is readable (>= 14 px)', fn: function () { var e = $(pick('.bf-peek .bf-ph b', '#refd h2')); if (!e) return 'no title'; var px = parseFloat(getComputedStyle(e).fontSize); return (/\S/.test(e.textContent) && px >= 14) || 'font ' + px + 'px'; } },
      { kind: 'eq', name: 'rival score on the card', a: function () { return ph() ? GXS.num('.bf-peek .bf-ph span') : G.pl[1].score; }, b: function () { return G.pl[1].score; } },
      { kind: 'fn', name: 'every shown text >= 12 px', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll(pick('.bf-peek *', '#refd .gx-drawer-body *')), function (e) { if (e.children.length || !GXS.vis(e) || !(e.textContent || '').trim()) return; var px = parseFloat(getComputedStyle(e).fontSize); if (px < 12 && !bad) bad = '"' + e.textContent.trim().slice(0, 20) + '" ' + px + 'px'; }); return !bad || bad; } },
      { kind: 'fn', name: 'zoom is on screen', fn: function () { return inView($(pick('.bf-peek', '#refd'))) || 'zoom off screen'; } },
      skin,
      { kind: 'tap', get sel() { return pick('.bf-peek [data-bf=close]', '#refd .gx-x'); }, name: 'tap closes the zoom', state: function () { return ph() ? BF.peek : GX.open; }, expect: function (a, b) { return (a != null && b == null) || 'zoom did not close'; } }
    ]
  });

  GXS.add({
    id: 'sg-help', name: 'Help: how this works', ask: 'Can you read the help cards?', seed: 7, when: booted, group: 'UI',
    setup: function () { return table(7).then(function () { GXH.rules(null); return GXS.wait(function () { return document.querySelector('.gxh-rules .gxh-card'); }, 5000); }).then(function () { return idle(400); }); },
    checks: [
      { kind: 'visible', sel: '.gxh-rules .gxh-card', name: 'help card' },
      { kind: 'text', sel: '.gxh-rules .gxh-rt', re: /\S/, name: 'card title' },
      { kind: 'text', sel: '.gxh-rules .gxh-rx', re: /\S/, name: 'card text' },
      { kind: 'visible', sel: '.gxh-rules .gxh-x', name: 'Close button' },
      { kind: 'tap', sel: '.gxh-rules .gxh-x', name: 'tap Close', state: function () { return !!document.querySelector('.gxh-rules'); }, expect: function (a, b) { return (a && !b) || 'help did not close'; } }
    ]
  });

  GXS.add({
    id: 'sg-buttons', name: 'Painted buttons keep their labels', ask: 'Are the buttons readable?', seed: 8, when: booted, group: 'Board',
    setup: function () { return table(8); },
    checks: [
      { kind: 'fn', name: 'every visible button label >= 12 px', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('button'), function (b) { if (bad || !GXS.vis(b) || !(b.textContent || '').trim()) return; var px = parseFloat(getComputedStyle(b).fontSize); if (px < 12) bad = '"' + b.textContent.trim().slice(0, 20) + '" ' + px + 'px'; }); return !bad || bad; } },
      skin
    ]
  });

})();

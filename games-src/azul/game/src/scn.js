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
  // the shared menu test's "board" surface (shell/gx-scenario.js): the play screen right after a game starts, tutorial tips on
  GXS.boardOpen = function () { if (!booted()) return; try { GXH.setEnabled(true); } catch (e) { } try { GX.close(); } catch (e) { } UI.modal = null; UI.setup.np = 2; UI.setup.seats = ['human', 'ai']; AIDELAY = 60; beginGame(); UI.modal = null; refresh(); try { GXH.setEnabled(true); } catch (e) { } return GXS.wait(function () { return G && G.phase === 'offer' && G.cur === 0 && (BF.on ? $('.bf-k .bf-t') && !BF.busy : $('#dockbody .pk')); }, 20000).then(function () { return idle(800); }); };
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

  // painted art wired: each plate is painted on the element, its skin switch is on, the element visible
  function art(name, sel, file, pseudo, cls) { return { kind: 'fn', name: name, fn: function () { var e = document.querySelector(sel); if (!e) return 'missing ' + sel; var r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return 'not visible'; var c = getComputedStyle(e, pseudo || null); if ((c.backgroundImage + ' ' + c.borderImageSource).indexOf(file) < 0) return file + ' not painted'; if (cls && GXSK.classes().indexOf(cls) < 0) return cls + ' not loaded'; return true; } }; }
  GXS.add({
    id: 'sg-art', name: 'Painted art: rack trays, tail, rows', ask: 'Do the racks look like wooden trays?', seed: 5, sizes: 'phone', when: booted,
    setup: function () {
      return table(5).then(function () {
        var b = document.createElement('div'); b.className = 'gxh-bub on gxh-a-bottom'; b.id = 'arttail'; b.style.cssText = 'left:16px;top:70px';
        b.innerHTML = '<i class="gxh-arr"></i><div class="gxh-tx">Tap a colour</div>'; document.body.appendChild(b);
        var d = document.createElement('section'); d.className = 'gx-drawer'; d.id = 'artdrawer'; d.style.cssText = 'position:fixed;left:-300px;top:0;width:280px;visibility:hidden';
        d.innerHTML = '<div class="gx-row"><div class="gx-row-l">Sound</div><div class="gx-row-k"><button>On</button></div></div>'; document.body.appendChild(d);
        return idle(500);
      });
    },
    checks: [
      art('rack tray painted', '.bf-me .bf-rack:not(:has(>.bf-c.no))', 'ui-rack-frame-c', '::before', 'sk-rackf'),
      art('bubble tail painted', '#arttail .gxh-arr', 'ui-bubble-tail', null, 'sk-tail'),
      { kind: 'text', sel: '#arttail .gxh-tx', re: /colour/i, name: 'bubble text readable' },
      { kind: 'fn', name: 'settings row strip painted', fn: function () { var c = getComputedStyle(document.querySelector('#artdrawer .gx-row'), '::before'); return (c.borderImageSource.indexOf('ui-row-c') >= 0 && GXSK.classes().indexOf('sk-row') >= 0) || 'ui-row-c not painted'; } }
    ]
  });

  // UI-BAR rules 4-8 that the shared menu test cannot see (14 Oct 2026)
  var vis = function (e) { if (e.closest && e.closest('details:not([open])') && !e.matches('summary')) return false; var r = e.getBoundingClientRect(), c = getComputedStyle(e); return r.width > 0 && r.height > 0 && c.visibility !== 'hidden' && c.display !== 'none'; };
  var minFont = function (root, lim) { var bad = ''; [].forEach.call(document.querySelectorAll(root + ' *'), function (e) { if (bad || e.children.length || !vis(e) || !/\S/.test(e.textContent)) return; var f = parseFloat(getComputedStyle(e).fontSize); if (f < lim - .01) bad = (e.className || e.tagName) + ' ' + f + 'px'; }); return bad || true; };
  var lim = function () { return innerWidth >= 1024 ? 16 : 13; };
  GXS.add({
    id: 'ui-bar', name: 'UI bar: top bar, dock, images', ask: 'Few buttons, one line, readable text?', seed: 5, when: booted,
    setup: function () { return table(5).then(function () { return idle(300); }); },
    checks: [
      { kind: 'fn', name: 'rule 4: top bar has at most 5 buttons', fn: function () { var n = [].filter.call(document.querySelectorAll('.gx-bar button'), vis).length; return n <= 5 || n + ' buttons'; } },
      { kind: 'fn', name: 'rule 5: one instruction line of 8 words or fewer', fn: function () { if (ph()) return true; var t = (document.getElementById('dockt') || {}).textContent || ''; return words(t) <= 8 || 'dock line has ' + words(t) + ' words'; } },
      { kind: 'fn', name: 'rule 1: dock text at least 13/16 px', fn: function () { return ph() ? true : minFont('.gx-dock', lim()); } },
      { kind: 'fn', name: 'rule 6: dock has no empty parchment', fn: function () { if (ph()) return true; var d = $('.gx-dock'), b = $('#dockbody'); return d.scrollHeight - d.clientHeight <= 2 || 'dock overflows'; } },
      { kind: 'fn', name: 'rule 8: images keep their natural aspect', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('img'), function (m) { if (bad || !vis(m) || !m.naturalWidth) return; var a = m.naturalWidth / m.naturalHeight, b = m.clientWidth / m.clientHeight, cs = getComputedStyle(m).objectFit; if (cs === 'fill' && Math.abs(a / b - 1) > .04) bad = (m.src || '').slice(-30); }); return bad || true; } }
    ]
  });
  GXS.add({
    id: 'ui-start', name: 'UI bar: start screen', ask: 'One big Begin button, simple options?', seed: 5, when: booted,
    setup: function () { try { GX.close(); } catch (e) { } UI.modal = 'start'; render(); return idle(600); },
    checks: [
      { kind: 'fn', name: 'rule 7: exactly one primary button', fn: function () { var n = [].filter.call(document.querySelectorAll('#modal .bigb'), vis).length; return n === 1 || n + ' primary buttons'; } },
      { kind: 'fn', name: 'rule 7: no character roster', fn: function () { return ![].some.call(document.querySelectorAll('#modal .seat'), vis) || 'roster visible'; } },
      { kind: 'fn', name: 'rule 1: start text at least 13/16 px', fn: function () { return minFont('#modal', lim()); } },
      { kind: 'fn', name: 'rule 7: start fits without scrolling', fn: function () { var m = $('#modal .mbox'); return m.scrollHeight - m.clientHeight <= 2 || 'start card scrolls'; } }
    ]
  });
})();

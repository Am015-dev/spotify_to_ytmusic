// Kaiten Kitchen scenarios (see shell/gx-scenario.js): ?scn=<id> builds ONE state directly. Registered before the game scripts run; setup() runs after boot.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof render === 'function' && typeof UI !== 'undefined' && typeof KK !== 'undefined' && typeof peekShow === 'function'; };
  var $ = function (s) { return document.querySelector(s); };
  var idle = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var words = function (t) { return String(t).trim().split(/\s+/).filter(Boolean).length; };
  var inView = function (e) { var r = e.getBoundingClientRect(); return r.left >= -2 && r.right <= innerWidth + 2 && r.top >= -2 && r.bottom <= innerHeight + 2; };
  var skin = { kind: 'fn', name: 'painted skin moves no box', fn: function () { if (typeof GXSK === 'undefined') return true; var a = GXSK.audit(); return !a.moved.length || a.moved.slice(0, 2).join(' | '); } };
  // a plain three-chef game (you vs two computers), no menus, tips off, waiting at YOUR first pick
  function table(seed) {
    try { GXH.setEnabled(false); } catch (e) { }
    try { GX.close(); } catch (e) { }
    UI.seed = seed; newGame('vs'); UI.coach.level = 'off'; UI.coach.userOff = true;
    try { GXH.setEnabled(false); GXH.hide(); } catch (e) { }
    render();
    return GXS.wait(function () { return UI.started && G.phase === 'pick' && document.querySelectorAll('#belt .hc[data-id]').length >= 5 && !UI.busy; }, 12000).then(function () { return idle(1500); });
  }

  // the shared menu test's "board" surface (shell/gx-scenario.js): the play screen right after a game starts, tutorial tips on
  GXS.boardOpen = function () {
    if (!booted()) return;
    try { GX.close(); } catch (e) { }
    UI.seed = 51; newGame('guided'); render();
    return GXS.wait(function () { return UI.started && document.querySelectorAll('#belt .hc[data-id]').length >= 5; }, 12000).then(function () { return idle(800); });
  };

  GXS.add({
    id: 'kk-board', name: 'Start of game board', ask: 'Are the belt and dishes clear?', seed: 5, when: booted,
    setup: function () { return table(5); },
    checks: [
      { kind: 'visible', sel: '#board', name: 'board' },
      { kind: 'fn', name: 'board fills the screen', fn: function () { var r = $('#board').getBoundingClientRect(), f = r.width * r.height / (innerWidth * innerHeight); return f > .5 || 'board only ' + Math.round(f * 100) + '% of the screen'; } },
      { kind: 'visible', sel: '#belt .hc[data-id]', name: 'first dish' },
      { kind: 'fn', name: 'top line has text, >= 12 px', fn: function () { var e = document.querySelector('#prompt'); if (!e || !/\S/.test(e.textContent)) return 'no top line'; var px = parseFloat(getComputedStyle(e).fontSize); return px >= 12 || 'font ' + px; } },
      { kind: 'fn', name: 'every dish is on screen and tappable', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#belt .hc[data-id]'), function (e) { if (bad) return; var r = e.getBoundingClientRect(), t = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(1, r.left + r.width / 2)), Math.min(innerHeight - 1, Math.max(1, r.top + r.height / 2))); if (!inView(e)) bad = 'dish ' + e.dataset.id + ' off screen'; else if (t && t !== e && !e.contains(t)) bad = 'dish ' + e.dataset.id + ' covered by ' + (t.id || t.className); }); return !bad || bad; } },
      { kind: 'eq', name: 'round number', a: function () { return +/Round (\d+)/.exec($('#barstat').textContent)[1]; }, b: function () { return G.round; } },
      { kind: 'eq', name: 'turn number', a: function () { return +/Turn (\d+)/.exec($('#barstat').textContent)[1]; }, b: function () { return G.turn; } },
      { kind: 'eq', name: 'dishes in your hand', a: function () { return document.querySelectorAll('#belt .hc[data-id]').length; }, b: function () { return G.players[0].hand.length; } },
      { kind: 'fn', name: 'no line of text over 8 words on the board', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#board *, #prompt'), function (e) { if (e.children.length || !GXS.vis(e)) return; var t = (e.textContent || '').trim(); if (words(t) > 8) bad = bad || '"' + t.slice(0, 40) + '" (' + words(t) + ' words)'; }); return !bad || bad; } },
      skin
    ]
  });

  GXS.add({
    id: 'kk-zoom', name: 'Hold a dish to read it', ask: 'Hold a dish: can you read it?', seed: 6, when: booted,
    setup: function () { return table(6).then(function () { peekShow($('#belt .hc[data-id]')); return idle(500); }); },
    checks: [
      { kind: 'visible', sel: '#peek', name: 'dish note' },
      { kind: 'text', sel: '#peek b', re: /\S/, name: 'dish name', minPx: 14 },
      { kind: 'text', sel: '#peek span', re: /\S/, name: 'dish rule line', minPx: 12 },
      { kind: 'fn', name: 'note is on screen', fn: function () { return inView($('#peek')) || 'note off screen'; } },
      { kind: 'fn', name: 'note is short (8 words or fewer per line)', fn: function () { var s = $('#peek span').textContent; return words(s) <= 8 || words(s) + ' words: ' + s; } },
      skin,
      { kind: 'fn', name: 'note closes', fn: function () { peekHide(); var p = $('#peek'); return !p || p.hidden || 'note still shown after peekHide'; } },
      { kind: 'hold', sel: '#belt .hc[data-id]', ms: 800, name: 'press and hold a dish', state: function () { var p = $('#peek'); return !!(p && !p.hidden); }, expect: function (a, b) { if (!matchMedia('(pointer:coarse)').matches) return true;   /* a mouse has no hold: the dish is clicked to grab it */ return (!a && b) || 'holding a dish did not show its note'; } },
      { kind: 'fn', name: 'note goes away on release', fn: function () { var p = $('#peek'); return !p || p.hidden || 'note stuck after release'; } }
    ]
  });

  GXS.add({
    id: 'kk-help', name: 'Rules cards', ask: 'Can you read the rules card?', seed: 10, when: booted, group: 'UI',
    setup: function () { return table(10).then(function () { GXH.rules(); return GXS.wait(function () { return document.querySelector('.gxh-card'); }, 5000); }).then(function () { return new Promise(function (r) { setTimeout(r, 400); }); }); },
    checks: [
      { kind: 'visible', sel: '.gxh-card', name: 'rules card' },
      { kind: 'text', sel: '.gxh-rt', re: /\S/, name: 'card title' },
      { kind: 'text', sel: '.gxh-rx', re: /\S/, name: 'card text' },
      { kind: 'tap', sel: '.gxh-x', name: 'tap Close', state: function () { return !!document.querySelector('.gxh-card'); }, expect: function (a, b) { return (a === true && b === false) || 'close the card'; } }
    ]
  });
  /* UI-BAR rules 4-8 as DOM checks: top-bar buttons, panel text size and fit, dock fit, start screen, art aspect */
  var vis = function (e) { var r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  var minFont = function (root, minPx) { var bad = ''; [].forEach.call(root.querySelectorAll('*'), function (e) { if (bad || !vis(e)) return; if (e instanceof SVGElement) return; var own = [].some.call(e.childNodes, function (n) { return n.nodeType === 3 && /\S/.test(n.nodeValue); }); if (own && parseFloat(getComputedStyle(e).fontSize) < minPx) bad = (e.className || e.tagName) + ' ' + getComputedStyle(e).fontSize + ' "' + e.textContent.trim().slice(0, 20) + '"'; }); return bad ? 'text under ' + minPx + 'px: ' + bad : true; };
  var need = function () { return innerWidth >= 1024 ? 16 : 13; };
  var panelCheck = function (id) { return { kind: 'fn', name: 'panel ' + id + ': text size, fits content, inset', fn: function () { GX.show(id); var d = document.getElementById(id), b = d.querySelector('.gx-drawer-body'); if (!d || !b) return 'no panel'; var m = minFont(d, need()); if (m !== true) return m; var kids = [].filter.call(b.children, vis), used = kids.length ? Math.max.apply(null, kids.map(function (k) { return k.getBoundingClientRect().bottom; })) - b.getBoundingClientRect().top : 0, empty = b.clientHeight - used; if (empty > Math.max(120, b.clientHeight * .5)) return 'empty space ' + Math.round(empty) + 'px of ' + b.clientHeight; var dr = d.getBoundingClientRect(); for (var i = 0; i < kids.length; i++) { var r = kids[i].getBoundingClientRect(); if (r.left - dr.left < 16 || dr.right - r.right < 16) return 'flush to panel edge: ' + (kids[i].className || kids[i].tagName); } return true; } }; };
  GXS.add({
    id: 'kk-uibar', name: 'UI bar: top bar, panels, dock, art', ask: 'Are the bar, panels and dock clean?', seed: 33, when: booted, group: 'UI',
    setup: function () { return table(33); },
    checks: [
      { kind: 'fn', name: 'rule 4: top bar has at most 5 buttons', fn: function () { var n = [].filter.call(document.querySelectorAll('.gx-bar button'), vis).length; return n <= 5 || n + ' buttons in the top bar'; } },
      { kind: 'fn', name: 'rule 4: title not overlapped', fn: function () { var t = $('.gx-bar h1'), a = t.getBoundingClientRect(), bad = ''; [].forEach.call(document.querySelectorAll('.gx-bar > *'), function (e) { if (e === t || !vis(e)) return; var r = e.getBoundingClientRect(); if (r.left < a.right - 1 && r.right > a.left + 1 && r.top < a.bottom && r.bottom > a.top) bad = e.id || e.className; }); return bad ? 'overlaps title: ' + bad : true; } },
      { kind: 'fn', name: 'rule 5: one instruction line, 8 words or fewer', fn: function () { var p = $('#prompt'); if (!p) return true; var t = p.textContent.trim(); return words(t) <= 8 || 'prompt has ' + words(t) + ' words'; } },
      panelCheck('logd'), panelCheck('rivald'), panelCheck('rulesd'), panelCheck('setd'),
      { kind: 'fn', name: 'rule 6: dock text size and no tall empty box', fn: function () { try { GX.close(); } catch (e) { } var d = $('.gx-dock'); if (!d || !vis(d)) return true; var m = minFont(d, need()); if (m !== true) return m; var b = d.querySelector('.gx-dock-body'); if (!b) return true; var kids = [].filter.call(b.children, vis), used = kids.length ? Math.max.apply(null, kids.map(function (k) { return k.getBoundingClientRect().bottom; })) - b.getBoundingClientRect().top : 0; return b.clientHeight - used < Math.max(160, b.clientHeight * .6) || 'dock empty space ' + Math.round(b.clientHeight - used) + 'px'; } },
      { kind: 'fn', name: 'rule 8: images at natural aspect', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('img'), function (i) { if (bad || !vis(i) || !i.naturalWidth) return; var r = i.getBoundingClientRect(), cs = getComputedStyle(i); if (cs.objectFit !== 'fill' && cs.objectFit !== '') return; var k = (r.width / r.height) / (i.naturalWidth / i.naturalHeight); if (k < .93 || k > 1.07) bad = (i.className || i.src.split('/').pop()) + ' stretched x' + k.toFixed(2); }); return bad || true; } }
    ]
  });
  GXS.add({
    id: 'kk-uibar-start', name: 'UI bar: start screen', ask: 'Is the start screen clean?', seed: 34, when: booted, group: 'UI',
    setup: function () { try { GX.close(); } catch (e) { } UI.started = false; UI.sv = 'title'; try { render(); } catch (e) { } return idle(600); },
    checks: [
      { kind: 'fn', name: 'rule 7: ONE primary button', fn: function () { var n = [].filter.call(document.querySelectorAll('#start .tbtn.go'), vis).length; return n === 1 || n + ' primary buttons on the start screen'; } },
      { kind: 'fn', name: 'rule 7: start screen text size', fn: function () { return minFont($('#start'), need()); } },
      { kind: 'fn', name: 'rule 7: no character roster', fn: function () { return document.querySelectorAll('#start .roster, #start .cav, #start .chip').length === 0 || 'roster on start screen'; } },
      { kind: 'fn', name: 'rule 7: at most 4 start buttons', fn: function () { var n = [].filter.call(document.querySelectorAll('#start button'), vis).length; return n <= 4 || n + ' buttons on the start screen'; } }
    ]
  });
  /* painted art wiring (ui-row-c, ui-bubble-tail): the files load and are used where they belong */
  var artLoad = {};
  GXS.add({
    id: 'kk-art', name: 'Painted art: menu row and speech tail', ask: 'Do the menu row and tip tail look painted?', seed: 21, when: booted, group: 'UI',
    setup: function () {
      return table(21).then(function () {
        ['ui-row-c', 'ui-bubble-tail'].forEach(function (n) { var i = new Image(); i.onload = function () { artLoad[n] = i.naturalWidth > 0 ? 'ok' : 'empty'; }; i.onerror = function () { artLoad[n] = 'failed'; }; i.src = 'media/' + n + '.webp'; });
        GX.show('setd');
        var row = $('#setd .btn.gxt-menu'); if (row) row.scrollIntoView({ block: 'center' });
        var b = document.createElement('div'); b.id = 'art-bub'; b.className = 'gxh-bub on gxh-a-bottom'; b.style.cssText = 'left:40px;top:70px';
        b.innerHTML = '<i class="gxh-arr"></i><div class="gxh-tx">Tap a glowing card</div>'; document.body.appendChild(b);
        return new Promise(function (r) { setTimeout(r, 700); });
      });
    },
    checks: [
      { kind: 'fn', name: 'every wired file loads (naturalWidth > 0)', fn: function () { var bad = ['ui-row-c', 'ui-bubble-tail'].filter(function (n) { return artLoad[n] !== 'ok'; }); return !bad.length || bad[0] + ' ' + artLoad[bad[0]]; } },
      { kind: 'text', sel: '#setd .btn.gxt-menu', re: /\S/, name: 'row label readable' },
      { kind: 'fn', name: 'Tutorial row uses the painted strip, not stretched', fn: function () { var e = $('#setd .btn.gxt-menu'); if (!e) return 'no row'; var r = e.getBoundingClientRect(); return (/ui-row-c/.test(getComputedStyle(e).borderImageSource) && r.height >= 40 && r.height <= 110) || 'row not painted: ' + getComputedStyle(e).borderImageSource + ' h' + r.height; } },
      { kind: 'fn', name: 'painted tail on the coach bubble', fn: function () { var a = document.querySelector('#art-bub .gxh-arr'); if (!a) return 'no arrow'; var cs = getComputedStyle(a); return (/ui-bubble-tail/.test(cs.backgroundImage) && a.offsetWidth >= 16 && a.offsetHeight >= 11) || 'tail missing: ' + cs.backgroundImage + ' ' + a.offsetWidth + 'x' + a.offsetHeight; } },
    ]
  });

})();

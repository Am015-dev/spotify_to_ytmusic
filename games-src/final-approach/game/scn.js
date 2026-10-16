// Final Approach scenarios (see shell/gx-scenario.js): ?scn=<id> builds ONE state directly. Registered before the game scripts run; setup() runs after boot.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof render === 'function' && typeof UI !== 'undefined' && typeof FA !== 'undefined'; };
  var $ = function (s) { return document.querySelector(s); };
  var idle = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var words = function (t) { return String(t).trim().split(/\s+/).filter(Boolean).length; };
  var inView = function (e) { var r = e.getBoundingClientRect(); return r.left >= -2 && r.right <= innerWidth + 2 && r.top >= -2 && r.bottom <= innerHeight + 2; };
  var skin = { kind: 'fn', name: 'painted skin moves no box', fn: function () { if (typeof GXSK === 'undefined') return true; var a = GXSK.audit(); return !a.moved.length || a.moved.slice(0, 2).join(' | '); } };
  // a plain two-seat flight against the computer crew, no menus, no story card, tips off, waiting at YOUR roll
  function table(seed) {
    try { GXH.setEnabled(false); } catch (e) { }
    try { GX.close(); } catch (e) { }
    UI.prefs.story = false; UI.seed = seed; newGame('vs', { scenario: 'g1', role: 0, level: 'normal', tipsOff: true });
    try { GXH.setEnabled(false); GXH.hide(); } catch (e) { }
    return GXS.wait(function () { return UI.started && G.phase === 'brief' && $('#acts [data-a=ready]'); }, 12000).then(function () { return idle(900); });
  }

  GXS.add({
    id: 'fa-board', name: 'Start of game board', ask: 'Is the cockpit clear and filled?', seed: 5, when: booted,
    setup: function () { return table(5); },
    checks: [
      { kind: 'visible', sel: '#board', name: 'board' },
      { kind: 'fn', name: 'board fills the screen', fn: function () { var r = $('#board').getBoundingClientRect(), f = r.width * r.height / (innerWidth * innerHeight); return f > .5 || 'board only ' + Math.round(f * 100) + '% of the screen'; } },
      { kind: 'visible', sel: '#acts [data-a=ready]', name: 'Roll button' },
      { kind: 'text', sel: '#acts [data-a=ready]', re: /roll/i, name: 'Roll label' },
      { kind: 'visible', sel: '#goal .gstrip', name: 'landing checklist strip' },
      { kind: 'eq', name: 'round number', a: function () { return +/Round (\d+)/.exec($('#barstat').textContent)[1]; }, b: function () { return G.round + 1; } },
      { kind: 'eq', name: 'spaces to the airport', a: function () { return GXS.num('#goal .ck[data-k=air] .nn'); }, b: function () { var e = $('#goal .ck[data-k=air]'); return +/\((\d+) spaces/.exec(e.getAttribute('aria-label'))[1]; } },
      { kind: 'fn', name: 'no line of text over 8 words on the board', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#board *, #acts *, #prompt, #pz *'), function (e) { if (e.children.length || !GXS.vis(e)) return; var t = (e.textContent || '').trim(); if (words(t) > 8) bad = bad || '"' + t.slice(0, 40) + '" (' + words(t) + ' words)'; }); return !bad || bad; } },
      skin
    ]
  });

  GXS.add({
    id: 'fa-zoom', name: 'Flight briefing sheet', ask: 'Is the briefing sheet readable?', seed: 6, when: booted,
    setup: function () { return table(6).then(function () { GX.show('crewd'); try { renderDrawers(); } catch (e) { } return idle(800); }); },
    checks: [
      { kind: 'visible', sel: '#crewd .gx-drawer-body', name: 'briefing sheet body' },
      { kind: 'text', sel: '#crewd .gx-drawer-head h2', re: /briefing/i, name: 'sheet title', minPx: 14 },
      { kind: 'fn', name: 'the title is not covered by the painted sheet', fn: function () { var h = $('#crewd .gx-drawer-head h2'), r = h.getBoundingClientRect(), t = document.elementFromPoint(r.left + 4, r.top + r.height / 2); return (t && (t === h || h.contains(t) || t.closest('.gx-drawer-head'))) || 'title is covered by ' + (t && (t.id || t.className)); } },
      { kind: 'fn', name: 'every shown text >= 12 px', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#crewd .gx-drawer-body *'), function (e) { if (e.children.length || !GXS.vis(e) || !(e.textContent || '').trim()) return; var px = parseFloat(getComputedStyle(e).fontSize); if (px < 12 && !bad) bad = '"' + e.textContent.trim().slice(0, 20) + '" ' + px + 'px'; }); return !bad || bad; } },
      { kind: 'fn', name: 'sheet is on screen', fn: function () { return inView($('#crewd')) || 'sheet off screen'; } },
      skin,
      { kind: 'tap', sel: '#crewd .gx-x', name: 'tap closes the sheet', state: function () { return GX.open === 'crewd'; }, expect: function (a, b) { return (a && !b) || 'sheet did not close'; } }
    ]
  });

  GXS.add({
    id: 'fa-help', name: 'Help: how this works', ask: 'Can you read the help cards?', seed: 7, when: booted, group: 'UI',
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
    id: 'fa-buttons', name: 'Painted buttons keep their labels', ask: 'Are the buttons readable?', seed: 8, when: booted, group: 'Board',
    setup: function () { return table(8); },
    checks: [
      { kind: 'fn', name: 'every visible button label >= 12 px', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('button'), function (b) { if (bad || !GXS.vis(b) || !(b.textContent || '').trim()) return; var px = parseFloat(getComputedStyle(b).fontSize); if (px < 12) bad = '"' + b.textContent.trim().slice(0, 20) + '" ' + px + 'px'; }); return !bad || bad; } },
      skin
    ]
  });

  /* painted art wiring (ui-row-c, ui-bubble-tail): the files load and are used where they belong */
  var artLoad = {};
  GXS.add({
    id: 'fa-art', name: 'Painted art: menu row and speech tail', ask: 'Do the menu row and tip tail look painted?', seed: 21, when: booted, group: 'UI',
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


  /* UI-BAR 1,4-8 as DOM checks (the menu test cannot see them) */
  var minFs = function () { return innerWidth >= 1024 ? 16 : 13; };
  var smallText = function (root) { var bad = ''; [].forEach.call(document.querySelectorAll(root + ' *'), function (e) { if (bad || !GXS.vis(e)) return; if (![].some.call(e.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); })) return; var px = parseFloat(getComputedStyle(e).fontSize); if (px < minFs() - .05) bad = (e.textContent || '').trim().slice(0, 20) + ' ' + px + 'px <' + (e.className || e.tagName) + '>'; }); return !bad || 'text under ' + minFs() + 'px: ' + bad; };
  var fits = function (sel) { var e = $(sel); if (!e || !GXS.vis(e)) return 'not shown'; var r = e.getBoundingClientRect(), body = e.querySelector('.gx-drawer-body, .gx-dock-body') || e, used = body.scrollHeight, empty = body.clientHeight - used; return empty <= Math.max(160, r.height * .35) || 'empty space ' + Math.round(empty) + 'px under the content'; };
  GXS.add({
    id: 'fa-title', name: 'Start screen: one Play, one Quick game row', ask: 'Is the start screen clean?', seed: 31, when: booted, group: 'UI',
    setup: function () { try { GXH.setEnabled(false); GX.close(); } catch (e) { } UI.sv = 'title'; renderStart(); return idle(700); },
    checks: [
      { kind: 'fn', name: 'exactly one big primary button', fn: function () { var n = document.querySelectorAll('#start .tbtn').length; return n === 1 || n + ' big buttons'; } },
      { kind: 'fn', name: 'one Quick game row of equal buttons', fn: function () { var q = document.querySelectorAll('#start .qrow .qseg'); if (q.length < 2) return 'no Quick game row'; var h0 = q[0].getBoundingClientRect().height; return [].every.call(q, function (b) { return Math.abs(b.getBoundingClientRect().height - h0) < 2; }) || 'segments differ in height'; } },
      { kind: 'fn', name: 'no roster or step list on the start screen', fn: function () { return !document.querySelector('#start .rolegrid, #start .rcardx, #start ol, #start li') || 'roster or list found'; } },
      { kind: 'fn', name: 'How to play lives in the top bar only', fn: function () { return (!document.querySelector('#start .tlink') && !!document.querySelector('.gx-bar [data-gx=rulesd]')) || 'extra How to play link'; } },
      { kind: 'fn', name: 'start text >= 13 px phone / 16 px wide', fn: function () { return smallText('#start'); } },
      { kind: 'fn', name: 'title not under the top bar', fn: function () { var l = $('#start .logo'), b = $('.gx-bar'); return !l || !b || l.getBoundingClientRect().top >= b.getBoundingClientRect().bottom - 1 || 'title overlaps the bar'; } }
    ]
  });

  GXS.add({
    id: 'fa-ui', name: 'Top bar, dock, log and briefing', ask: 'Are the panels short and readable?', seed: 32, when: booted, group: 'UI',
    setup: function () { return table(32); },
    checks: [
      { kind: 'fn', name: 'top bar has at most 5 buttons', fn: function () { var n = [].filter.call(document.querySelectorAll('.gx-bar button'), GXS.vis).length; return n <= 5 || n + ' buttons in the top bar'; } },
      { kind: 'fn', name: 'top bar text >= 13 px phone / 16 px wide', fn: function () { return smallText('.gx-bar'); } },
      { kind: 'fn', name: 'at most one instruction line on the board', fn: function () { var n = [].filter.call(document.querySelectorAll('#prompt, #barprompt'), function (e) { return GXS.vis(e) && e.textContent.trim(); }); var t = n.map(function (e) { return e.textContent.trim(); }); var uniq = t.filter(function (x, i) { return t.indexOf(x) === i; }); return uniq.length <= 1 || 'two different instruction lines: ' + uniq.join(' / '); } },
      { kind: 'fn', name: 'dock text >= 13 px phone / 16 px wide', fn: function () { return smallText('#dock'); } },
      { kind: 'fn', name: 'dock has no tall empty space', fn: function () { var d = $('#dock'); if (!d || !GXS.vis(d)) return true; var b = $('#dockbody'), kids = [].filter.call(b.children, GXS.vis), last = kids.length ? kids[kids.length - 1].getBoundingClientRect().bottom : b.getBoundingClientRect().top, empty = d.getBoundingClientRect().bottom - last - ($('#acts') ? $('#acts').getBoundingClientRect().height : 0); return empty < Math.max(200, innerHeight * .3) || 'dock has ' + Math.round(empty) + 'px empty'; } },
      { kind: 'fn', name: 'images keep their natural aspect', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('img'), function (i) { if (bad || !GXS.vis(i) || !i.naturalWidth) return; var r = i.getBoundingClientRect(), cs = getComputedStyle(i); if (/cover|contain/.test(cs.objectFit)) return; if (Math.abs(r.width / r.height - i.naturalWidth / i.naturalHeight) > .08 * (i.naturalWidth / i.naturalHeight)) bad = (i.getAttribute('src') || '').slice(-30); }); return !bad || 'stretched image ' + bad; } },
      skin
    ]
  });
  GXS.add({
    id: 'fa-log', name: 'Log panel', ask: 'Is the log short and readable?', seed: 33, when: booted, group: 'UI',
    setup: function () { return table(33).then(function () { GX.show('logd'); try { renderDrawers(); } catch (e) { } return idle(700); }); },
    checks: [
      { kind: 'fn', name: 'log text >= 13 px phone / 16 px wide', fn: function () { return smallText('#logd'); } },
      { kind: 'fn', name: 'log panel fits its content', fn: function () { return fits('#logd'); } },
      { kind: 'fn', name: 'log panel on screen', fn: function () { return inView($('#logd')) || 'off screen'; } }
    ]
  });
  GXS.add({
    id: 'fa-brief', name: 'Briefing panel', ask: 'Is the briefing short and readable?', seed: 34, when: booted, group: 'UI',
    setup: function () { return table(34).then(function () { GX.show('crewd'); try { renderDrawers(); } catch (e) { } return idle(700); }); },
    checks: [
      { kind: 'fn', name: 'briefing text >= 13 px phone / 16 px wide', fn: function () { return smallText('#crewd'); } },
      { kind: 'fn', name: 'briefing panel fits its content', fn: function () { return fits('#crewd'); } }
    ]
  });

})();

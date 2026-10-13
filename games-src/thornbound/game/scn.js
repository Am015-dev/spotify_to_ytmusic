// Thornbound scenarios (see shell/gx-scenario.js): ?scn=<id> builds ONE state directly. Registered before the game scripts run; setup() runs after boot.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof UI !== 'undefined' && typeof renderAll === 'function' && typeof GXT !== 'undefined'; };
  var $ = function (s) { return document.querySelector(s); };
  // a 3-player game (you vs 2 computer houses), no menus, tips off, waiting at YOUR first decision
  function table(seed) {
    try { GXH.setEnabled(false); } catch (e) { }
    try { GX.close(); } catch (e) { }
    GXS.seed(seed); newGame('me', { np: 3, seed: seed, length: 'short', levels: ['normal', 'normal', 'easy'] }); UI.guide = 'off'; UI.speed = 8; try { GXH.setEnabled(false); } catch (e) { }
    return GXS.wait(function () { return UI.started && !UI.card && !UI.busy && G && G.q && whoActs().hum.length && document.querySelectorAll('#handw .hc').length; }, 15000).then(function () { return new Promise(function (r) { setTimeout(r, 700); }); });
  }
  var inView = function (e) { var r = e.getBoundingClientRect(); return r.left >= -2 && r.right <= innerWidth + 2 && r.top >= -2 && r.bottom <= innerHeight + 2; };
  var words = function (t) { return String(t).trim().split(/\s+/).filter(Boolean).length; };
  var ext = function (sel) { var l = 1e9, r = -1e9; [].forEach.call(document.querySelectorAll(sel), function (e) { var b = e.getBoundingClientRect(); if (b.width) { l = Math.min(l, b.left); r = Math.max(r, b.right); } }); return [l, r]; };
  var leafFonts = function (root) { var out = []; [].forEach.call(document.querySelectorAll(root + ' *'), function (e) { if (e.children.length || !(e.textContent || '').trim() || !GXS.vis(e)) return; out.push({ px: parseFloat(getComputedStyle(e).fontSize), t: e.textContent.trim().slice(0, 18) }); }); return out; };
  var skin = { kind: 'fn', name: 'painted skin moves no box', fn: function () { if (typeof GXSK === 'undefined') return true; var a = GXSK.audit(); return !a.moved.length || a.moved.slice(0, 2).join(' | '); } };

  GXS.add({
    id: 'tb-pc-hand', name: 'PC: hand and Great Road', ask: 'Do hand and road fill the panel?', sizes: 'pc', seed: 5, when: booted,
    setup: function () { return table(5); },
    checks: [
      { kind: 'visible', sel: '#handw .hc', name: 'a hand card' },
      { kind: 'visible', sel: '#road .kcb', name: 'a Great Road card' },
      { kind: 'fn', name: 'hand + road span >= 80% of the panel, no empty right side', fn: function () { var d = document.querySelector('.gx-dock').getBoundingClientRect(), h = ext('#handw .hc'), k = ext('#road .kcb'), l = Math.min(h[0], k[0]), r = Math.max(h[1], k[1]), f = (r - l) / d.width; if (f < .8) return 'span only ' + Math.round(f * 100) + '% of the panel'; if (d.right - r > d.width * .1) return 'empty right side: ' + Math.round(d.right - r) + ' px'; if (l - d.left > d.width * .1) return 'empty left side: ' + Math.round(l - d.left) + ' px'; return true; } },
      { kind: 'fn', name: 'hand spans >= 80% of the panel', fn: function () { var d = document.querySelector('.gx-dock').getBoundingClientRect(), h = ext('#handw .hc'); return (h[1] - h[0]) / d.width >= .8 || 'hand is ' + Math.round((h[1] - h[0]) / d.width * 100) + '% of the panel'; } },
      { kind: 'fn', name: 'hand + road span >= 40% of the screen width', fn: function () { var h = ext('#handw .hc'), k = ext('#road .kcb'); return (Math.max(h[1], k[1]) - Math.min(h[0], k[0])) / innerWidth >= .4 || 'narrow'; } },
      { kind: 'fn', name: 'all card text >= 13 px', fn: function () { var bad = leafFonts('#handw').concat(leafFonts('#road')).filter(function (x) { return x.px < 13; }); return !bad.length || bad.length + ' texts under 13px, e.g. ' + bad[0].t + ' ' + bad[0].px + 'px'; } },
      { kind: 'fn', name: 'nothing clipped or off screen', fn: function () { var bad = [].filter.call(document.querySelectorAll('#handw .hc, #road .kcb'), function (e) { return !inView(e); }); if (bad.length) return bad.length + ' cards partly off screen'; var cl = [].filter.call(document.querySelectorAll('#road .kn'), function (e) { return e.scrollWidth > e.clientWidth + 2; }); return !cl.length || 'card name clipped: ' + cl[0].textContent; } },
      { kind: 'tap', sel: '#handw .hc', name: 'tap a hand card', state: function () { return UI.hand; }, expect: function (a, b) { return a !== b || 'the card was not picked'; } }
    ]
  });

  GXS.add({
    id: 'tb-story-start', name: 'Story after Skip tutorial', ask: 'Skip tutorial: is the chapter map next?', seed: 6, when: function () { return booted() && typeof storyOpen === 'function' && typeof GXC !== 'undefined' && !!window.CAMPAIGN; },
    setup: function () {
      try { GXH.setEnabled(false); } catch (e) { }
      showStart(); storyOpen();   // what the Story button does: first time, the tutorial comes first
      return GXS.wait(function () { return GXT.active() && document.querySelector('[data-gxt-skip]'); }, 10000).then(function () { return new Promise(function (r) { setTimeout(r, 500); }); });
    },
    checks: [
      { kind: 'fn', name: 'the tutorial opened first (not seen yet)', fn: function () { return GXT.active() || 'no tutorial'; } },
      { kind: 'text', sel: '[data-gxt-skip]', re: /skip tutorial/i, name: 'Skip tutorial label' },
      { kind: 'tap', sel: '[data-gxt-skip]', name: 'tap Skip tutorial', state: function () { return { tut: GXT.active(), map: !!document.querySelector('.gxc-map-on .gxc-map'), start: !document.getElementById('start').hidden && !document.querySelector('.gxc-map-on') }; },
        expect: function (a, b) { return (!b.tut && b.map) || (b.tut ? 'tutorial still running' : b.start ? 'went back to the title screen, not the chapter map' : 'blank: no chapter map'); } },
      { kind: 'visible', sel: '.gxc-map-on .gxc-map', name: 'chapter map' },
      { kind: 'fn', name: 'map has chapter 1 to play, and no tutorial strip is left', fn: function () { var n = document.querySelectorAll('.gxc-map-on button, .gxc-map-on [data-ch]').length; return (n >= 2 && !document.querySelector('.gxt-top')) || (n < 2 ? 'chapter map is empty' : 'tutorial strip left over'); } },
      { kind: 'fn', name: 'Story does not force the tutorial again', fn: function () { return GXT.isDone('thornbound') || GXT.isDone(TUT_GAME) || 'tutorial not counted as seen'; } }
    ]
  });

  GXS.add({
    id: 'tb-board', name: 'Start of game board', ask: 'Is the board clear and filled?', seed: 7, when: booted,
    setup: function () { return table(7); },
    checks: [
      { kind: 'visible', sel: '#board', name: 'board' },
      { kind: 'fn', name: 'board fills its half or the screen', fn: function () { var r = document.querySelector('#board').getBoundingClientRect(), f = r.width * r.height / (innerWidth * innerHeight); return f > (innerWidth < 600 ? .3 : .3) || 'board only ' + Math.round(f * 100) + '% of the screen'; } },
      { kind: 'visible', sel: '#handw .hc', name: 'hand' },
      { kind: 'visible', sel: '#rivals', name: 'rivals bar' },
      { kind: 'fn', name: 'no line of text over 8 words in the play area', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#main *, #now, #act, #barstat'), function (e) { if (e.children.length || !GXS.vis(e)) return; var t = (e.textContent || '').trim(); if (words(t) > 8) bad = bad || '"' + t.slice(0, 40) + '" (' + words(t) + ' words)'; }); return !bad || bad; } },
      skin
    ]
  });

  GXS.add({
    id: 'tb-zoom', name: 'Card zoom', ask: 'Is the big card readable?', seed: 8, when: booted,
    setup: function () { return table(8).then(function () { var id = +document.querySelector('#handw .hc').dataset.id; openPop('card', { id: id, read: 1 }); return new Promise(function (r) { setTimeout(r, 500); }); }); },
    checks: [
      { kind: 'visible', sel: '#ppop .pp-card', name: 'zoomed card' },
      { kind: 'fn', name: 'zoom text is readable (>= 13 px)', fn: function () { var bad = leafFonts('#ppop .pp-info').filter(function (x) { return x.px < 13; }); return (leafFonts('#ppop .pp-info').length > 0 && !bad.length) || (bad.length ? 'text ' + bad[0].px + 'px: ' + bad[0].t : 'no explanation text'); } },
      { kind: 'fn', name: 'zoom is on screen and not clipped', fn: function () { var e = document.querySelector('#ppop .pp-card'); return inView(e) || 'card off screen'; } },
      { kind: 'visible', sel: '#ppop .pp-x', name: 'close button' },
      { kind: 'tap', sel: '#ppop .pp-x', name: 'tap close', state: function () { return !!UI.pop; }, expect: function (a, b) { return (a && !b) || 'zoom did not close'; } }
    ]
  });

  GXS.add({
    id: 'tb-help', name: 'Help: how this works', ask: 'Can you read the help cards?', seed: 9, when: booted, group: 'UI',
    setup: function () { return table(9).then(function () { GXH.rules(null); return GXS.wait(function () { return $('.gxh-rules .gxh-card'); }, 5000); }).then(function () { return new Promise(function (r) { setTimeout(r, 400); }); }); },
    checks: [
      { kind: 'visible', sel: '.gxh-rules .gxh-card', name: 'help card' },
      { kind: 'text', sel: '.gxh-rules .gxh-rt', re: /\S/, name: 'card title' },
      { kind: 'text', sel: '.gxh-rules .gxh-rx', re: /\S/, name: 'card text' },
      { kind: 'visible', sel: '.gxh-rules .gxh-x', name: 'Close button' },
      { kind: 'tap', sel: '.gxh-rules .gxh-x', name: 'tap Close', state: function () { return !!$('.gxh-rules'); }, expect: function (a, b) { return (a && !b) || 'help did not close'; } }
    ]
  });

  GXS.add({
    id: 'tb-rivals', name: 'Rival strip with faction emblems', ask: 'Are the rival chips readable?', seed: 10, when: booted, group: 'Board',
    setup: function () { return table(10); },
    checks: [
      { kind: 'visible', sel: '#rivals', name: 'rivals bar' },
      { kind: 'fn', name: 'rival texts >= 12 px', fn: function () { var bad = leafFonts('#rivals').filter(function (x) { return x.px < 12; }); return !bad.length || 'text ' + bad[0].px + 'px: ' + bad[0].t; } },
      { kind: 'fn', name: 'rivals bar is on screen', fn: function () { return inView($('#rivals')) || 'rivals bar off screen'; } },
      skin
    ]
  });

  GXS.add({
    id: 'tb-buttons', name: 'Painted buttons keep their labels', ask: 'Are the action buttons readable?', seed: 11, when: booted, group: 'Board',
    setup: function () { return table(11); },
    checks: [
      { kind: 'fn', name: 'every visible button label >= 12 px', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('button'), function (b) { if (bad || !GXS.vis(b) || !(b.textContent || '').trim()) return; var px = parseFloat(getComputedStyle(b).fontSize); if (px < 12) bad = '"' + b.textContent.trim().slice(0, 20) + '" ' + px + 'px'; }); return !bad || bad; } },
      skin
    ]
  });

  /* painted art wiring (ui-row-c, ui-bubble-tail, ui-sheet-c): the files load and are used where they belong */
  var artLoad = {};
  GXS.add({
    id: 'tb-art', name: 'Painted art: menu row and speech tail', ask: 'Do the menu row and tip tail look painted?', seed: 21, when: booted, group: 'UI',
    setup: function () {
      return table(21).then(function () {
        ['ui-row-c', 'ui-bubble-tail', 'ui-sheet-c'].forEach(function (n) { var i = new Image(); i.onload = function () { artLoad[n] = i.naturalWidth > 0 ? 'ok' : 'empty'; }; i.onerror = function () { artLoad[n] = 'failed'; }; i.src = 'media/' + n + '.webp'; });
        GX.show('setd');
        var row = $('#setd .btn.gxt-menu'); if (row) row.scrollIntoView({ block: 'center' });
        var b = document.createElement('div'); b.id = 'art-bub'; b.className = 'gxh-bub on gxh-a-bottom'; b.style.cssText = 'left:40px;top:70px';
        b.innerHTML = '<i class="gxh-arr"></i><div class="gxh-tx">Tap a glowing card</div>'; document.body.appendChild(b);
      var pp = document.getElementById('ppop'); if (pp) { pp.hidden = false; pp.innerHTML = '<h5>Details</h5><p class="small">Painted vellum sheet</p>'; }
        return new Promise(function (r) { setTimeout(r, 700); });
      });
    },
    checks: [
      { kind: 'fn', name: 'every wired file loads (naturalWidth > 0)', fn: function () { var bad = ['ui-row-c', 'ui-bubble-tail', 'ui-sheet-c'].filter(function (n) { return artLoad[n] !== 'ok'; }); return !bad.length || bad[0] + ' ' + artLoad[bad[0]]; } },
      { kind: 'text', sel: '#setd .btn.gxt-menu', re: /\S/, name: 'row label readable' },
      { kind: 'fn', name: 'Tutorial row uses the painted strip, not stretched', fn: function () { var e = $('#setd .btn.gxt-menu'); if (!e) return 'no row'; var r = e.getBoundingClientRect(); return (/ui-row-c/.test(getComputedStyle(e).borderImageSource) && r.height >= 40 && r.height <= 110) || 'row not painted: ' + getComputedStyle(e).borderImageSource + ' h' + r.height; } },
      { kind: 'fn', name: 'speech badge on the coach bubble', fn: function () { var b = document.getElementById('art-bub'); var bg = b ? getComputedStyle(b, '::before').backgroundImage : ''; var w = b ? parseFloat(getComputedStyle(b, '::before').width) : 0; return (/ui-bubble-tail/.test(bg) && w >= 16) || 'badge missing: ' + bg + ' ' + w; } },
      { kind: 'fn', name: 'detail sheet is the painted vellum', fn: function () { var e = document.getElementById('ppop'), bg = e ? getComputedStyle(e).backgroundImage : ''; return (!e.hidden && /ui-sheet-c/.test(bg)) || 'sheet missing: ' + bg; } },
    ]
  });

})();

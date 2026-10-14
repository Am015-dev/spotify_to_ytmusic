// Short Fuse scenarios (see shell/gx-scenario.js): ?scn=<id> builds ONE state directly. Registered before the game scripts run; setup() runs after boot.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof G !== 'undefined' && typeof startJob === 'function' && typeof UI !== 'undefined' && typeof DEFNAMES !== 'undefined'; };
  var $ = function (s) { return document.querySelector(s); };
  var idle = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var words = function (t) { return String(t).trim().split(/\s+/).filter(Boolean).length; };
  var inView = function (e) { var r = e.getBoundingClientRect(); return r.left >= -2 && r.right <= innerWidth + 2 && r.top >= -2 && r.bottom <= innerHeight + 2; };
  var skin = { kind: 'fn', name: 'painted skin moves no box', fn: function () { if (typeof GXSK === 'undefined') return true; var a = GXSK.audit(); return !a.moved.length || a.moved.slice(0, 2).join(' | '); } };
  // Boot Camp I with three crew (you and two computers), no menus, tips off; the job card is dismissed with its Go button
  function table(seed) {
    try { GXH.setEnabled(false); } catch (e) { }
    try { GX.close(); } catch (e) { }
    startJob({ job: 1, np: 3, seats: ['human', 'ai', 'ai'], lv: 'normal', names: DEFNAMES.slice(), chars: [], captain: 0, seed: seed });
    try { GXH.setEnabled(false); GXH.hide(); } catch (e) { }
    return GXS.wait(function () { return G && $('#over, .brief, [data-a=go]') !== undefined && UI.started; }, 10000).then(function () { return idle(1200); }).then(function () {
      var go = [].filter.call(document.querySelectorAll('button'), function (b) { return /^go$/i.test(b.textContent.trim()) && GXS.vis(b); })[0]; if (go) go.click();
      return GXS.wait(function () { return !UI.brief && $('#mine .tile.glow'); }, 10000);
    }).then(function () { try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } return idle(1500); });
  }
  // the shared menu test's "board" surface (shell/gx-scenario.js): the play screen right after a game starts, tutorial tips on
  GXS.boardOpen = function () { if (!booted()) return; return table(51).then(function () { try { GXH.setEnabled(true); } catch (e) { } try { render(); } catch (e) { } return idle(600); }); };
  var cuts = function () { return G.st.reduce(function (a, s) { return a + s.w.filter(function (x) { return x.cut; }).length; }, 0); };
  var total = function () { return G.st.reduce(function (a, s) { return a + s.w.length; }, 0); };

  GXS.add({
    id: 'sf-board', name: 'Start of game board', ask: 'Are the wires and fuse clear?', seed: 11, when: booted,
    setup: function () { return table(11); },
    checks: [
      { kind: 'visible', sel: '#felt', name: 'table' },
      { kind: 'fn', name: 'board fills the screen', fn: function () { var r = $('#felt').getBoundingClientRect(), f = r.width * r.height / (innerWidth * innerHeight); return f > .5 || 'board only ' + Math.round(f * 100) + '% of the screen'; } },
      { kind: 'visible', sel: '#mine .tile.glow', name: 'your glowing wire' },
      { kind: 'text', sel: '#say', re: /\S/, name: 'top line' },
      { kind: 'visible', sel: '#fuse', name: 'fuse' },
      { kind: 'eq', name: 'fuse steps left', a: function () { return +$('#fuse .fz').dataset.left; }, b: function () { return G.dial; } },
      { kind: 'eq', name: 'wires cut', a: function () { return GXS.num('#cutc .cc b'); }, b: function () { return cuts(); } },
      { kind: 'eq', name: 'wires in the job', a: function () { return +/\/(\d+)/.exec($('#cutc .cc').textContent)[1]; }, b: function () { return total(); } },
      { kind: 'fn', name: 'every wire of yours is on screen', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#mine .tile'), function (e) { if (!bad && !inView(e)) bad = 'wire off screen'; }); return !bad || bad; } },
      { kind: 'fn', name: 'no line of text over 8 words on the board', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#felt *, #say, #strip *'), function (e) { if (e.children.length || !GXS.vis(e)) return; var t = (e.textContent || '').trim(); if (words(t) > 8) bad = bad || '"' + t.slice(0, 40) + '" (' + words(t) + ' words)'; }); return !bad || bad; } },
      skin,
      { kind: 'tap', sel: '#mine .tile.glow', name: 'tap a glowing wire', state: function () { return JSON.stringify([G.phase, G.step, G.logN, UI.sel]); }, expect: function (a, b) { return a !== b || 'the wire tap did nothing'; } }
    ]
  });

  GXS.add({
    id: 'sf-zoom', name: 'Job card', ask: 'Is the job card readable?', seed: 12, when: booted,
    setup: function () { return table(12).then(function () { GX.show('missiond'); try { renderMission(); } catch (e) { } return idle(800); }); },
    checks: [
      { kind: 'visible', sel: '#missionbody .mcard', name: 'job card' },
      { kind: 'text', sel: '#missionbody .mh h3', re: /\S/, name: 'job name', minPx: 14 },
      { kind: 'text', sel: '#missionbody .mb p', re: /\S/, name: 'job text', minPx: 13 },
      { kind: 'fn', name: 'every shown text >= 12 px', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#missiond .gx-drawer-body *'), function (e) { if (e.children.length || !GXS.vis(e) || !(e.textContent || '').trim()) return; var px = parseFloat(getComputedStyle(e).fontSize); if (px < 12 && !bad) bad = '"' + e.textContent.trim().slice(0, 20) + '" ' + px + 'px'; }); return !bad || bad; } },
      { kind: 'fn', name: 'drawer is on screen', fn: function () { return inView($('#missiond')) || 'drawer off screen'; } },
      skin,
      { kind: 'tap', sel: '#missiond .gx-x', name: 'tap closes the card', state: function () { return GX.open === 'missiond'; }, expect: function (a, b) { return (a && !b) || 'card did not close'; } }
    ]
  });

  GXS.add({
    id: 'sf-help', name: 'Help: how this works', ask: 'Can you read the help cards?', seed: 13, when: booted, group: 'UI',
    setup: function () { return table(13).then(function () { GXH.rules(null); return GXS.wait(function () { return document.querySelector('.gxh-rules .gxh-card'); }, 5000); }).then(function () { return idle(400); }); },
    checks: [
      { kind: 'visible', sel: '.gxh-rules .gxh-card', name: 'help card' },
      { kind: 'text', sel: '.gxh-rules .gxh-rt', re: /\S/, name: 'card title' },
      { kind: 'text', sel: '.gxh-rules .gxh-rx', re: /\S/, name: 'card text' },
      { kind: 'visible', sel: '.gxh-rules .gxh-x', name: 'Close button' },
      { kind: 'tap', sel: '.gxh-rules .gxh-x', name: 'tap Close', state: function () { return !!document.querySelector('.gxh-rules'); }, expect: function (a, b) { return (a && !b) || 'help did not close'; } }
    ]
  });

  GXS.add({
    id: 'sf-buttons', name: 'Painted buttons keep their labels', ask: 'Are the buttons readable?', seed: 14, when: booted, group: 'Board',
    setup: function () { return table(14); },
    checks: [
      { kind: 'fn', name: 'every visible button label >= 12 px', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('button'), function (b) { if (bad || !GXS.vis(b) || !(b.textContent || '').trim()) return; var px = parseFloat(getComputedStyle(b).fontSize); if (px < 12) bad = '"' + b.textContent.trim().slice(0, 20) + '" ' + px + 'px'; }); return !bad || bad; } },
      skin
    ]
  });

  /* painted art wiring (ui-row-c, ui-bubble-tail): the files load and are used where they belong */
  var artLoad = {};
  GXS.add({
    id: 'sf-art', name: 'Painted art: menu row and speech tail', ask: 'Do the menu row and tip tail look painted?', seed: 21, when: booted, group: 'UI',
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

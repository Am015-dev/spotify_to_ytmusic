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

  // the shared menu test's "board" surface (shell/gx-scenario.js): the play screen right after a game starts, tutorial tips on
  GXS.boardOpen = function () { if (!booted()) return; try { GX.close(); } catch (e) { } try { setGfx('low'); } catch (e) { } AIDELAY = 60; UI.speed = 1; UI.modal = null; beginGame(); try { GXH.setEnabled(true); } catch (e) { } refresh(); return GXS.wait(function () { return G && G.phase === 'plan' && $('#panel') && !UI.modal; }, 15000).then(function () { return idle(800); }); };

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

  // painted camp icons (shelter, roof, palisade, weapon) and the 3D models (campfire, raft, third palm)
  GXS.add({
    id: 'si-art', name: 'Camp icons and 3D campfire, raft, palm', ask: 'Do camp icons and models look painted?', seed: 7, sizes: 'all', when: booted,
    setup: function () {
      window.__swi = [];
      var loads = ['shelter', 'roof', 'palisade', 'weapon'].map(function (n) { return new Promise(function (r) { var i = new Image(); i.onload = function () { window.__swi.push([n, i.naturalWidth > 0]); r(); }; i.onerror = function () { window.__swi.push([n, false]); r(); }; i.src = 'media/icon-res-' + n + '.webp'; }); });
      var mfiles = ['sw-fire', 'sw-raft', 'sw-palm-b'].reduce(function (a, n) { return a.concat([n + '.glb', n + '-lite.glb']); }, []);
      window.__swm = [];
      mfiles.forEach(function (f) { loads.push(fetch('models/' + f).then(function (r) { return r.arrayBuffer().then(function (b) { window.__swm.push([f, r.ok && b.byteLength > 20000]); }); }).catch(function () { window.__swm.push([f, false]); })); });
      return Promise.all(loads).then(function () { return table(7); }).then(function () {
        G.camp.shelter = true; G.camp.roof = 2; G.camp.pal = 2; G.weapon = 2; G.inv.built.raft = true;
        refresh();
        return GXS.wait(function () { return !V3.r || (V3.glbOK && V3.camp && V3.camp.userData.raft.children.length > 0 && V3.camp.userData.fmo); }, 20000).catch(function () { }).then(function () { return idle(1200); });
      });
    },
    checks: [
      { kind: 'fn', name: 'the 4 camp icons load', fn: function () { var b = (window.__swi || []).filter(function (x) { return !x[1]; }); return ((window.__swi || []).length === 4 && !b.length) || 'not loaded: ' + (b.map(function (x) { return x[0]; }).join(',') || 'none tried'); } },
      { kind: 'fn', name: 'camp counters wear the painted icons (16px or bigger)', fn: function () { var t = document.createElement('div'); t.className = 'trk'; t.innerHTML = ['shelter', 'roof', 'palisade', 'weapon'].map(function (k) { return '<span class="hk">' + RX(k) + '<b>1</b></span>'; }).join(''); document.body.appendChild(t); var bad = []; ['shelter', 'roof', 'palisade', 'weapon'].forEach(function (k) { var cs = getComputedStyle(t.querySelector('.rx[data-r=' + k + ']')); if (!new RegExp('icon-res-' + k + '\\.webp').test(cs.backgroundImage)) bad.push(k + ' bg ' + cs.backgroundImage.slice(0, 30)); else if (parseFloat(cs.width) < 16) bad.push(k + ' ' + cs.width); }); t.remove(); return !bad.length || bad.join('; '); } },
      { kind: 'fn', name: 'camp counter numbers stay readable', fn: function () { var e = document.querySelector('.trk .hk b'); if (!e || !GXS.vis(e)) return true; return parseFloat(getComputedStyle(e).fontSize) >= 12 || 'counter font ' + getComputedStyle(e).fontSize; } },
      { kind: 'fn', name: 'fire, raft and palm models download (full + phone/Low)', fn: function () { var b = (window.__swm || []).filter(function (x) { return !x[1]; }); return ((window.__swm || []).length === 6 && !b.length) || 'bad model files: ' + b.map(function (x) { return x[0]; }).join(','); } },
      { kind: 'fn', name: '3D (where WebGL runs): campfire and raft are in the camp', fn: function () { if (!V3.r) return true; var u = V3.camp && V3.camp.userData; return (u && V3.glbOK && V3.glbR.fire && V3.glbR.raft && V3.glbR.palmB && u.fmo && u.raft.children.length === 1 && !u.base.visible) || 'models missing: ok=' + V3.glbOK + ' fire=' + !!(u && u.fmo) + ' raft=' + (u && u.raft.children.length); } },
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

  /* Help: the board scenario's table, then the rules cards (GXH.rules) */
  GXS.add({
    id: 'si-help', name: 'Help: rules cards', ask: 'Can you read the help cards?', seed: 41, group: 'UI',
    when: function () { return typeof GXH !== 'undefined' && GXS.defs.some(function (x) { return x.id === 'si-board' && (!x.when || x.when()); }); },
    setup: function () { var b = GXS.defs.filter(function (x) { return x.id === 'si-board'; })[0]; return Promise.resolve(b.setup()).then(function () { GXH.rules(null); return GXS.wait(function () { return document.querySelector('.gxh-rules .gxh-card'); }, 5000); }).then(function () { return new Promise(function (r) { setTimeout(r, 400); }); }); },
    checks: [
      { kind: 'visible', sel: '.gxh-rules .gxh-card', name: 'help card' },
      { kind: 'text', sel: '.gxh-rules .gxh-rt', re: /\S/, name: 'card title' },
      { kind: 'text', sel: '.gxh-rules .gxh-rx', re: /\S/, name: 'card text' },
      { kind: 'visible', sel: '.gxh-rules .gxh-x', name: 'Close button' },
      { kind: 'tap', sel: '.gxh-rules .gxh-x', name: 'tap Close', state: function () { return !!document.querySelector('.gxh-rules'); }, expect: function (a, b) { return (a && !b) || 'help did not close'; } }
    ]
  });
})();

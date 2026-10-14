// Cauldron Fair scenarios (see shell/gx-scenario.js): ?scn=<id> builds ONE state directly. Registered before the game scripts run; setup() runs after boot.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof schedule === 'function' && typeof UI !== 'undefined'; };
  var q = function (s) { var b = document.querySelector(s); return b && !b.disabled && (b.offsetParent || getComputedStyle(b).position === 'fixed') && b.getBoundingClientRect().width > 3 ? b : null; };
  // the shared menu test's "board" surface (shell/gx-scenario.js): the play screen right after a game starts, tutorial tips on
  GXS.boardOpen = function () { if (!booted()) return; window.AIDELAY = 400; try { GXH.setEnabled(true); } catch (e) { } newGame('vs', {}); var n = 0, iv = setInterval(function () { prepFix(); if (q('.bagb:not(.off)') || ++n > 40) clearInterval(iv); }, 250); };
  // a plain 3-player game against the computer, coach off, then tap through (draw / stop / continue) until the market of day 2 opens
  function toMarket() {
    try { GXH.setEnabled(false); } catch (e) { }
    window.AIDELAY = 40; UI.pullMs = 0; newGame('vs', {});
    return GXS.wait(function () {
      prepFix(); var b = q('[data-a=rscont]') || q('.stopb:not(.off)') || q('.bagb:not(.off)') || q('[data-a=mv]');
      if (b && !document.querySelector('.stalls')) b.click();
      return document.querySelector('.stalls');
    }, 60000).then(function () { return quiet(); });
  }
  // a fortune card on day 1 can ask for a choice before the brew: take the suggested one
  function prepFix() { var o = document.querySelector('.gxh-ok'); if (o) o.click(); if (G && G.phase === 'prep') { var b = q('.sug[data-a=mv]') || q('[data-a=mv]'); if (b) b.click(); } }
  // no coach bubble over the scene
  function quiet() { try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } return new Promise(function (r) { setTimeout(r, 700); }); }
  GXS.add({
    id: 'cf-board', name: 'Cauldron: draw or stop', ask: 'Can you see Draw and Stop?', seed: 5, when: booted,
    setup: function () {
      try { GXH.setEnabled(false); } catch (e) { }
      window.AIDELAY = 120; newGame('vs', {});
      var t0 = 0;
      return GXS.wait(function () { prepFix(); var s = q('.stopb:not(.off)'); if (s) return s; var b = q('.bagb:not(.off)'); if (b && Date.now() - t0 > 2500 && !BF.pulling) { t0 = Date.now(); b.click(); } return null; }, 40000).then(function () { return quiet(); });
    },
    checks: [
      { kind: 'visible', sel: '.bagb', name: 'Draw button' },
      { kind: 'visible', sel: '.stopb', name: 'Stop button' },
      { kind: 'visible', sel: '#acts .meter', name: 'white-chip meter' },
      { kind: 'fn', name: 'buttons are at least 44 px tall', fn: function () { var h = Math.min(document.querySelector('.bagb').getBoundingClientRect().height, document.querySelector('.stopb').getBoundingClientRect().height); return h >= 44 || 'height ' + Math.round(h); } }
    ]
  });
  GXS.add({
    id: 'cf-zoom', name: 'Market: stalls and prices', ask: 'Can you read every stall price?', seed: 5, when: booted,
    setup: toMarket,
    checks: [
      { kind: 'visible', sel: '.awn', name: 'awning with the coin purse' },
      { kind: 'visible', sel: '.stalls .stall', name: 'stall board' },
      { kind: 'fn', name: 'every shown price is >= 12 px', fn: function () { var bad = [].slice.call(document.querySelectorAll('.stall .tok .pc')).filter(function (e) { return parseFloat(getComputedStyle(e).fontSize) < 12; }); return bad.length === 0 || bad.length + ' prices under 12 px'; } },
      { kind: 'fn', name: 'a stall chip is tappable (>= 44 px high)', fn: function () { var t = document.querySelector('.stall .tok:not([disabled])'); if (!t) return 'no buyable chip'; var r = t.getBoundingClientRect(); return (r.width >= 32 && r.height >= 44) || Math.round(r.width) + 'x' + Math.round(r.height); } }
    ]
  });
  GXS.add({
    id: 'cf-draw', name: 'Cauldron: pull a chip', ask: 'Tap Draw. Does a chip tumble out?', seed: 5, when: booted, group: 'Board',
    setup: function () {
      try { GXH.setEnabled(false); } catch (e) { }
      window.AIDELAY = 120; newGame('vs', {});
      return GXS.wait(function () { prepFix(); return q('.bagb:not(.off)'); }, 25000).then(function () { return quiet(); });
    },
    checks: [
      { kind: 'visible', sel: '.bagb', name: 'Draw bag' },
      { kind: 'tap', sel: '.bagb', name: 'tap Draw', state: function () { return G.players[focusSeat()].pot.length + (BF.pulling ? 100 : 0); }, expect: function (a, b) { return b !== a || 'the bag did not start the pull (' + a + ' -> ' + b + ')'; } }
    ]
  });
  GXS.add({
    id: 'cf-help', name: 'Cauldron: rules cards', ask: 'Can you read the rules card?', seed: 5, when: booted, group: 'UI',
    setup: function () {
      try { GXH.setEnabled(false); } catch (e) { }
      window.AIDELAY = 120; newGame('vs', {});
      return GXS.wait(function () { prepFix(); return q('.bagb:not(.off)'); }, 25000).then(function () { GXH.rules(); return GXS.wait(function () { return document.querySelector('.gxh-card'); }, 5000); }).then(function () { return new Promise(function (r) { setTimeout(r, 400); }); });
    },
    checks: [
      { kind: 'visible', sel: '.gxh-card', name: 'rules card' },
      { kind: 'text', sel: '.gxh-rt', re: /\S/, name: 'card title' },
      { kind: 'text', sel: '.gxh-rx', re: /\S/, name: 'card text' },
      { kind: 'tap', sel: '.gxh-x', name: 'tap Close', state: function () { return !!document.querySelector('.gxh-card'); }, expect: function (a, b) { return (a === true && b === false) || 'close the card'; } }
    ]
  });
  // painted art wired: each plate is painted on the element, its image loaded (the skin switch is on), the element visible
  function art(name, sel, file, pseudo, cls) { return { kind: 'fn', name: name, fn: function () { var e = document.querySelector(sel); if (!e) return 'missing ' + sel; var r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return 'not visible'; var c = getComputedStyle(e, pseudo || null); if ((c.backgroundImage + ' ' + c.borderImageSource).indexOf(file) < 0) return file + ' not painted'; if (cls && GXSK.classes().indexOf(cls) < 0) return cls + ' not loaded'; return true; } }; }
  GXS.add({
    id: 'cf-art', name: 'Painted art: bag, chip track, tail, rows', ask: 'Do the bag, chip track and rows look painted?', seed: 5, when: booted,
    setup: function () {
      try { GXH.setEnabled(false); } catch (e) { }
      window.AIDELAY = 120; newGame('vs', {});
      return GXS.wait(function () { prepFix(); return q('.bagb:not(.off)') || q('.stopb:not(.off)'); }, 40000).then(function () {
        quiet(); var b = document.createElement('div'); b.className = 'gxh-bub on gxh-a-bottom'; b.id = 'arttail'; b.style.cssText = 'left:16px;top:70px';
        b.innerHTML = '<i class="gxh-arr"></i><div class="gxh-tx">Tap the bag</div>'; document.body.appendChild(b); var m = document.createElement('div'); m.className = 'meter lo'; m.id = 'artmeter'; m.style.cssText = 'position:fixed;left:8px;top:120px;width:240px;z-index:99'; m.innerHTML = '<span class="mcells"><i class="on"></i><i class="on"></i><i></i><i></i><i></i><i></i><i></i><b class="mboom"></b></span>'; document.body.appendChild(m); return new Promise(function (r) { setTimeout(r, 400); });
      });
    },
    checks: [
      art('Draw dish painted', '.bagwrap', 'btn-draw-c', null, 'sk-draw'),
      art('chip track painted', '#artmeter .mcells', 'ui-chipbar', null, 'sk-chipbar'),
      art('bubble tail painted', '#arttail .gxh-arr', 'ui-bubble-tail', null, 'sk-tail'),
      { kind: 'text', sel: '#arttail .gxh-tx', re: /bag/i, name: 'bubble text readable' },
      { kind: 'fn', name: 'settings row painted', fn: function () { GX.show('setd'); var e = document.querySelector('#setbody .mrow'); if (!e) return 'no row'; var r = e.getBoundingClientRect(), c = getComputedStyle(e, '::before'); var ok = r.width > 4 && c.borderImageSource.indexOf('ui-row-c') >= 0 && GXSK.classes().indexOf('sk-row') >= 0; try { GX.close(); } catch (x) { } return ok || 'ui-row-c not painted'; } }
    ]
  });

  // UI-BAR rules the shared menu test cannot see (4 top bar, 1 text size, 6 panels fit, 8 image aspect), checked on the play screen and each drawer
  function minFont(root) {
    var need = innerWidth >= 1024 ? 16 : 13, bad = [], w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (var n; (n = w.nextNode());) {
      if (!/\S/.test(n.nodeValue)) continue; var e = n.parentElement; if (!e || e.closest('#gxscn-tag') || e.closest('script,style,svg,canvas')) continue;
      var r = e.getBoundingClientRect(), cs = getComputedStyle(e); if (r.width < 2 || r.height < 2 || cs.visibility === 'hidden' || cs.display === 'none') continue;
      var fs = parseFloat(cs.fontSize); if (fs < need - .01) bad.push(Math.round(fs * 10) / 10 + 'px ' + e.tagName.toLowerCase() + (e.className && e.className.baseVal === undefined ? '.' + String(e.className).split(' ')[0] : '') + ' "' + n.nodeValue.trim().slice(0, 18) + '"');
    }
    return bad;
  }
  function uiBad(list) { return list.length ? 'N=' + list.length + ' ' + list.slice(0, 6).join(' | ') : true; }
  GXS.add({
    id: 'cf-ui', name: 'UI bar: top bar, text sizes, panels, image shapes', ask: 'Is every panel readable and not stretched?', seed: 5, when: booted, group: 'UI',
    setup: function () {
      try { GXH.setEnabled(false); } catch (e) { }
      window.AIDELAY = 120; newGame('vs', {});
      return GXS.wait(function () { prepFix(); return q('.bagb:not(.off)') || q('.stopb:not(.off)'); }, 40000).then(function () { return quiet(); });
    },
    checks: [
      { kind: 'fn', name: 'top bar has at most 5 buttons', fn: function () { var n = [].filter.call(document.querySelectorAll('.gx-bar button'), function (b) { return b.getBoundingClientRect().width > 2 && getComputedStyle(b).display !== 'none'; }); return n.length <= 5 || n.length + ' buttons: ' + n.map(function (b) { return b.id || b.getAttribute('data-a') || b.textContent.trim().slice(0, 8); }).join(','); } },
      { kind: 'fn', name: 'board text >= 13 px phone / 16 px wide', fn: function () { return uiBad(minFont(document.body)); } },
      { kind: 'fn', name: 'images keep their natural shape', fn: function () { var bad = []; [].forEach.call(document.querySelectorAll('img'), function (i) { var r = i.getBoundingClientRect(), cs = getComputedStyle(i); if (r.width < 24 || !i.naturalWidth || cs.objectFit === 'contain' || cs.objectFit === 'cover') return; var a = (r.width / r.height) / (i.naturalWidth / i.naturalHeight); if (a < .92 || a > 1.08) bad.push((i.className || i.id || i.src.split('/').pop()) + ' x' + a.toFixed(2)); }); return uiBad(bad); } },
      { kind: 'fn', name: 'log panel: text size, fits its content', fn: function () { GX.show('logd'); var d = document.querySelector('#logbody'); var bad = minFont(d.closest('.gx-drawer,.drawer,[role=dialog]') || d); var p = d.closest('.gx-drawer,.drawer,[role=dialog]') || d; var pr = p.getBoundingClientRect(); if (pr.height > 200 && d.scrollHeight < pr.height * .35 && pr.height > innerHeight * .5) bad.push('panel ' + Math.round(pr.height) + 'px for ' + d.scrollHeight + 'px of content'); try { GX.close(); } catch (e) { } return uiBad(bad); } },
      { kind: 'fn', name: 'rules + settings panels: text size', fn: function () { var bad = []; ['rulesd', 'setd'].forEach(function (id) { try { GX.show(id); } catch (e) { return; } var el = document.getElementById(id) || document.querySelector('.gx-drawer.on,.drawer.on'); if (el) minFont(el).forEach(function (m) { bad.push(id + ' ' + m); }); try { GX.close(); } catch (e) { } }); return uiBad(bad); } }
    ]
  });

  GXS.add({
    id: 'cf-start', name: 'UI bar 7: start screen', ask: 'One big Play button, small options below?', seed: 5, when: booted, group: 'UI',
    setup: function () { try { GXH.setEnabled(false); } catch (e) { } try { GX.close(); } catch (e) { } UI.sv = 'title'; renderStart(); return new Promise(function (r) { setTimeout(r, 600); }); },
    checks: [
      { kind: 'fn', name: 'exactly one big primary button', fn: function () { var n = document.querySelectorAll('#start .tbtn'); return n.length === 2 - (firstTime() ? 0 : 1) || n.length + ' big buttons'; } },
      { kind: 'fn', name: 'Continue only when a save exists', fn: function () { var c = !!document.querySelector('#start [data-a=loadsave]'); return c === !!hasSave() || 'Continue ' + c + ' but save ' + hasSave(); } },
      { kind: 'fn', name: 'no character roster on the start screen', fn: function () { return !document.querySelector('#start .dcard,#start #roster') || 'roster shown'; } },
      { kind: 'fn', name: 'start buttons at least 44 px tall', fn: function () { var bad = []; [].forEach.call(document.querySelectorAll('#start button'), function (b) { if (b.getBoundingClientRect().height < 44) bad.push(b.textContent.slice(0, 12)); }); return uiBad(bad); } },
      { kind: 'fn', name: 'start text >= 13 px phone / 16 px wide', fn: function () { return uiBad(minFont(document.getElementById('start'))); } }
    ]
  });
})();

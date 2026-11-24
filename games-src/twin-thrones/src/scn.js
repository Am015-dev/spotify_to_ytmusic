// Twin Thrones scenarios (shell/gx-scenario.js): ?scn=<id> builds ONE state directly. (FLAG: none)
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof TT_TEST !== 'undefined' && TT_TEST.newGame && TT_TEST.E; };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  function begin(seed, steps) { window.AIDELAY = 0; TT_TEST.newGame('cpu', seed); TT_TEST.toPlay(steps || 0); var t = document.getElementById('toast'); if (t) t.style.display = 'none'; }
  GXS.boardOpen = function () { if (booted()) begin(5, 0); };
  GXS.add({
    id: 'tt-board', name: 'Duel: the pyramid', ask: 'Can you see which cards you can take?', seed: 5, when: booted,
    setup: function () { begin(5, 0); return wait(500); },
    checks: [
      { kind: 'visible', sel: '#pyr .card.av', name: 'a takeable card' },
      { kind: 'visible', sel: '#mil', name: 'conflict track' },
      { kind: 'visible', sel: '#s0', name: 'your city' },
      { kind: 'visible', sel: '#instr', name: 'status line' }
    ]
  });
  GXS.add({
    id: 'tt-select', name: 'Card chosen: build or sell', ask: 'Do you see Build, Sell and the cost?', seed: 7, when: booted,
    setup: function () { begin(7, 4); var a = TT_TEST.E.available(TT_TEST.U.G)[0]; TT_TEST.select(a.i); return wait(400); },
    checks: [
      { kind: 'visible', sel: '[data-a="discard"]', name: 'Sell button' },
      { kind: 'visible', sel: '[data-a="build"]', name: 'Build button' },
      { kind: 'visible', sel: '#zoom .zcard .pay', name: 'cost chip' }
    ]
  });
  // W771 HUD diet: at most 8 always-visible HUD items (board = pyramid + war track not counted), no page scroll, text >= 12px phone / 16px pc
  var HUD = ['header.gx-bar button', 'header.gx-bar .ttchip', '.gxst-q:not(header *)', '#instr', '#trk', '#s1', '#s0', '#tokrow', '#bank', '#dock', '.gx-reopen', '#hintbtn:not(#instr #hintbtn)'];
  function shown(e) { var r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && s.visibility !== 'hidden' && s.display !== 'none' && !e.closest('[hidden]'); }
  GXS.add({
    id: 'tt-hud', name: 'Play screen: only the essentials', ask: 'Is the screen calm: board, your city, scores, one line?', seed: 5, when: booted,
    setup: function () { begin(5, 0); return wait(500); },
    checks: [
      { kind: 'fn', name: 'at most 8 HUD items', fn: function () { var n = [], k = 0; HUD.forEach(function (s) { var c = [].filter.call(document.querySelectorAll(s), shown).length; if (c) { k += c; n.push(s + 'x' + c); } }); return k <= 8 || k + ' items: ' + n.join(' '); } },
      { kind: 'fn', name: 'no page scroll', fn: function () { var d = document.documentElement, b = document.body; return (d.scrollHeight <= innerHeight + 1 && b.scrollHeight <= innerHeight + 1 && d.scrollWidth <= innerWidth + 1) || 'scroll ' + d.scrollHeight + '/' + innerHeight; } },
      { kind: 'fn', name: 'text size', fn: function () { var min = innerWidth < 600 ? 12 : 16, bad = []; [].forEach.call(document.querySelectorAll('.gx-app *'), function (e) { if (!shown(e) || ![].some.call(e.childNodes, function (n) { return n.nodeType === 3 && n.textContent.trim(); })) return; var f = parseFloat(getComputedStyle(e).fontSize); if (f < min) bad.push((e.id || String(e.className).slice(0, 16) || e.tagName) + ':' + f); }); return !bad.length || bad.length + ' small: ' + bad.slice(0, 6).join(' '); } },
      { kind: 'visible', sel: '#pyr .card.av', name: 'a takeable card' }
    ]
  });
  GXS.add({
    id: 'tt-result', name: 'Result: how the duel ended', ask: 'Can you read who won and why?', seed: 3, when: booted,
    setup: function () { begin(3, 0); TT_TEST.forceEnd(0); return wait(300); },
    checks: [
      { kind: 'visible', sel: '[data-again]', name: 'Play again' },
      { kind: 'visible', sel: '#res h2', name: 'headline' }
    ]
  });
})();

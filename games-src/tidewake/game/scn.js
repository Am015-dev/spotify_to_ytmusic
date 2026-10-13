// Tidewake scenarios (see shell/gx-scenario.js): ?scn=<id> builds ONE state directly. Registered before the game scripts run; setup() runs after boot.
(function () {
  if (!window.GXS) return;
  // under the test runner (webdriver) the software 3D renderer would make every page crawl: the game draws its flat 2D chart (same board, same buttons)
  try { if (navigator.webdriver && GXS.on && !/[?&](gl=1|2d)/.test(location.search)) history.replaceState(null, '', location.pathname + location.search + '&2d'); } catch (e) { }
  var booted = function () { return typeof G !== 'undefined' && typeof startGame === 'function' && typeof render === 'function' && typeof UI !== 'undefined' && typeof PH !== 'undefined' && typeof startInfo === 'function'; };
  var $ = function (s) { return document.querySelector(s); };
  var idle = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var words = function (t) { return String(t).trim().split(/\s+/).filter(Boolean).length; };
  var inView = function (e) { var r = e.getBoundingClientRect(); return r.left >= -2 && r.right <= innerWidth + 2 && r.top >= -2 && r.bottom <= innerHeight + 2; };
  var skin = { kind: 'fn', name: 'painted skin moves no box', fn: function () { if (typeof GXSK === 'undefined') return true; var a = GXSK.audit(); return !a.moved.length || a.moved.slice(0, 2).join(' | '); } };
  var ph = function () { return !!PH.on; };
  var pick = function (a, b) { return ph() ? a : b; };
  // a plain two-captain game (you vs one computer), no menus, tips off; your start mark is taken (middle of the options), waiting at YOUR first move
  function table(seed) {
    try { GXH.setEnabled(false); } catch (e) { }
    try { GX.close(); } catch (e) { }
    var s = defaultSetup(); s.mode = 'me'; s.np = 2; s.variant = null; s.noMon = false; s.exp = { rift: 0, wave: 0, maelstrom: 0, cannon: 0 };
    s.seats.forEach(function (x, i) { x.h = i === 0; x.lv = 'normal'; });
    AIDELAY = 60; startGame(JSON.parse(JSON.stringify(s))); try { GXH.setEnabled(false); GXH.hide(); } catch (e) { }
    return GXS.wait(function () { return G && G.phase === 'setup' && !UI.busy && sideToAct() === 0; }, 15000).then(function () { return idle(600); }).then(function () {
      var si = startInfo(0); act(si[Math.floor(si.length / 2)].m, 0);
      return GXS.wait(function () { return G.phase === 'play' && G.step === 'act' && !UI.busy && sideToAct() === 0 && $('button[data-a=card]'); }, 25000);
    }).then(function () { try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } if (UI.mph) { PH.mphHide = UI.mph; try { phAfter(); } catch (e) { } } return idle(1500); });
  }

  GXS.add({
    id: 'tw-board', name: 'Start of game board', ask: 'Is the sea chart clear with your tiles?', seed: 5, when: booted,
    setup: function () { return table(5); },
    checks: [
      { kind: 'visible', sel: '#board', name: 'board' },
      { kind: 'fn', name: 'board fills the screen', fn: function () { var r = $('#board').getBoundingClientRect(), f = r.width * r.height / (innerWidth * innerHeight); return f > .38 || 'board only ' + Math.round(f * 100) + '% of the screen'; } },
      { kind: 'visible', get sel() { return pick('.ps-tiles .pt', 'button[data-a=card]'); }, name: 'your tile' },
      { kind: 'visible', get sel() { return pick('.ps-main [data-a=place]', 'button[data-a=place]'); }, name: 'Place button' },
      { kind: 'text', get sel() { return pick('.ps-main [data-a=place]', 'button[data-a=place]'); }, re: /place/i, name: 'Place label' },
      { kind: 'fn', name: 'Place and Turn buttons are on screen and not covered', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('.ps-main button, button[data-a=place]'), function (b) { if (bad || !GXS.vis(b)) return; var r = b.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (!inView(b)) bad = b.textContent.trim() + ' off screen'; else if (t && t !== b && !b.contains(t)) bad = b.textContent.trim() + ' covered by ' + (t.id || t.className); }); return !bad || bad; } },
      { kind: 'fn', name: 'the tile row is fully on screen', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll(pick('.ps-tiles .pt', 'button[data-a=card]')), function (e) { if (!bad && GXS.vis(e) && !inView(e)) bad = 'tile off screen'; }); return !bad || bad; } },
      { kind: 'eq', name: 'turn number', a: function () { var e = $('.chip .c2 b') || $('#barstat .lg b'); return +/\d+/.exec(e.textContent)[0]; }, b: function () { return G.turn; } },
      { kind: 'eq', name: 'tiles left in the pile', a: function () { var e = $('.chip .c2 small'); return e ? +/(\d+) tiles/.exec(e.textContent)[1] : GXS.num('#barstat .lg[title^=Current] b'); }, b: function () { return G.deck.length; } },
      { kind: 'fn', name: 'no line of text over 8 words on the board', fn: function () { if (!ph()) return true; var bad = ''; [].forEach.call(document.querySelectorAll('#ps *, #ps-msg, #pc *, #res *, #main *'), function (e) { if (e.children.length || !GXS.vis(e)) return; var t = (e.textContent || '').trim(); if (words(t) > 8) bad = bad || '"' + t.slice(0, 40) + '" (' + words(t) + ' words)'; }); return !bad || bad; } },
      skin,
      { kind: 'tap', get sel() { return pick('.ps-main [data-a=place]', 'button[data-a=place]'); }, name: 'tap Place', state: function () { return JSON.stringify([G.logN, G.turn, G.step]); }, expect: function (a, b) { return a !== b || 'Place did nothing'; } }
    ]
  });

  GXS.add({
    id: 'tw-zoom', name: 'Piece detail: your junk', ask: 'Is the ship card readable?', seed: 6, when: booted,
    setup: function () { return table(6).then(function () { if (ph()) phOpen('info', { k: 'ship', i: 0 }); else GX.show('piecesd'); return idle(800); }); },
    checks: [
      { kind: 'visible', get sel() { return pick('#ppop .ph-head', '#piecesd .gx-drawer-body'); }, name: 'detail card' },
      { kind: 'fn', name: 'title is readable (>= 14 px)', fn: function () { var e = $(pick('#ppop .ph-head b', '#piecesd h2')); if (!e) return 'no title'; var px = parseFloat(getComputedStyle(e).fontSize); return (/\S/.test(e.textContent) && px >= 14) || 'font ' + px + 'px'; } },
      { kind: 'fn', name: 'every shown text >= 12 px', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll(pick('#ppop *', '#piecesd .gx-drawer-body *')), function (e) { if (e.children.length || !GXS.vis(e) || !(e.textContent || '').trim()) return; var px = parseFloat(getComputedStyle(e).fontSize); if (px < 12 && !bad) bad = '"' + e.textContent.trim().slice(0, 20) + '" ' + px + 'px'; }); return !bad || bad; } },
      { kind: 'fn', name: 'detail card is on screen', fn: function () { return inView($(pick('#ppop', '#piecesd'))) || 'card off screen'; } },
      skin,
      { kind: 'tap', get sel() { return pick('#ppop .ph-x', '#piecesd .gx-x'); }, name: 'tap closes the card', state: function () { return ph() ? PH.pop : GX.open; }, expect: function (a, b) { return (a && !b) || 'card did not close'; } }
    ]
  });

  GXS.add({
    id: 'tw-help', name: 'Help: how this works', ask: 'Can you read the help cards?', seed: 7, when: booted, group: 'UI',
    setup: function () { return table(7).then(function () { GXH.rules(null); return GXS.wait(function () { return $('.gxh-rules .gxh-card'); }, 5000); }).then(function () { return idle(400); }); },
    checks: [
      { kind: 'visible', sel: '.gxh-rules .gxh-card', name: 'help card' },
      { kind: 'text', sel: '.gxh-rules .gxh-rt', re: /\S/, name: 'card title' },
      { kind: 'text', sel: '.gxh-rules .gxh-rx', re: /\S/, name: 'card text' },
      { kind: 'visible', sel: '.gxh-rules .gxh-x', name: 'Close button' },
      { kind: 'tap', sel: '.gxh-rules .gxh-x', name: 'tap Close', state: function () { return !!$('.gxh-rules'); }, expect: function (a, b) { return (a && !b) || 'help did not close'; } }
    ]
  });

  GXS.add({
    id: 'tw-buttons', name: 'Brass buttons keep their labels', ask: 'Are Place and Help buttons readable?', seed: 8, when: booted, group: 'Board',
    setup: function () { return table(8); },
    checks: [
      { kind: 'text', get sel() { return pick('.ps-main [data-a=place]', 'button[data-a=place]'); }, re: /place/i, name: 'Place label' },
      { kind: 'visible', sel: '#bulbbtn', name: 'Help bulb' },
      { kind: 'fn', name: 'every visible button label >= 12 px', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('button'), function (b) { if (bad || !GXS.vis(b) || !(b.textContent || '').trim()) return; var px = parseFloat(getComputedStyle(b).fontSize); if (px < 12) bad = '"' + b.textContent.trim().slice(0, 20) + '" ' + px + 'px'; }); return !bad || bad; } },
      skin
    ]
  });
})();

// Sands of Qamar scenarios (see shell/gx-scenario.js): ?scn=<id> builds ONE state directly. Registered before the game scripts run; setup() runs after boot.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof G !== 'undefined' && typeof beginGame === 'function' && typeof render === 'function' && typeof UI !== 'undefined' && typeof shownTotal === 'function' && typeof GX !== 'undefined'; };
  var $ = function (s) { return document.querySelector(s); };
  var idle = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var words = function (t) { return String(t).trim().split(/\s+/).filter(Boolean).length; };
  var inView = function (e) { var r = e.getBoundingClientRect(); return r.left >= -2 && r.right <= innerWidth + 2 && r.top >= -2 && r.bottom <= innerHeight + 2; };
  var skin = { kind: 'fn', name: 'painted skin moves no box', fn: function () { if (typeof GXSK === 'undefined') return true; var a = GXSK.audit(); return !a.moved.length || a.moved.slice(0, 2).join(' | '); } };
  // a plain two-player game (you vs one computer), no menus, tips off, waiting at YOUR first bid
  function table(seed) {
    try { GXH.setEnabled(false); } catch (e) { }
    try { GX.close(); } catch (e) { }
    UI.modal = null; UI.setup.np = 2; UI.setup.seats = ['human', 'ai']; UI.setup.lv = ['normal', 'normal']; AIDELAY = 60;
    beginGame(); try { GXH.setEnabled(false); GXH.hide(); } catch (e) { }
    return GXS.wait(function () { return G && G.phase === 'bid' && $('#acts .sp-b.glow') && !UI.modal; }, 12000).then(function () { return idle(1200); });
  }

  GXS.add({
    id: 'sq-board', name: 'Start of game board', ask: 'Is the bazaar clear and filled?', seed: 5, when: booted,
    setup: function () { return table(5); },
    checks: [
      { kind: 'visible', sel: '#grid', name: 'bazaar grid' },
      { kind: 'fn', name: 'board fills the screen', fn: function () { var r = $('#bd').getBoundingClientRect(), f = r.width * r.height / (innerWidth * innerHeight); return f > .5 || 'board only ' + Math.round(f * 100) + '% of the screen'; } },
      { kind: 'visible', sel: '#acts .sp-b.glow', name: 'first bid spot' },
      { kind: 'text', sel: '#acts .sp-b.glow', re: /\d/, name: 'bid label' },
      { kind: 'text', sel: '#line', re: /\S/, name: 'top line' },
      { kind: 'fn', name: 'every bid spot is on screen', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#acts .sp-b'), function (e) { if (!bad && !inView(e)) bad = 'bid spot ' + (e.getAttribute('aria-label') || '') + ' off screen'; }); return !bad || bad; } },
      { kind: 'eq', name: 'your score', a: function () { return GXS.num('.sch[data-seat="0"] .ss'); }, b: function () { return shownTotal(G.pl[0]); } },
      { kind: 'eq', name: 'rival score', a: function () { return GXS.num('.sch[data-seat="1"] .ss'); }, b: function () { return shownTotal(G.pl[1]); } },
      { kind: 'eq', name: 'your coins', a: function () { return GXS.num('.sch[data-seat="0"] .st:nth-child(1)'); }, b: function () { return G.pl[0].coins; } },
      { kind: 'eq', name: 'your camels', a: function () { return GXS.num('.sch[data-seat="0"] .st:nth-child(2)'); }, b: function () { return G.pl[0].camels; } },
      { kind: 'fn', name: 'no line of text over 8 words on the board', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#table *, #line, #seats *, #acts *'), function (e) { if (e.children.length || !GXS.vis(e)) return; var t = (e.textContent || '').trim(); if (words(t) > 8) bad = bad || '"' + t.slice(0, 40) + '" (' + words(t) + ' words)'; }); return !bad || bad; } },
      skin,
      { kind: 'tap', sel: '#acts .sp-b.glow', name: 'tap a bid spot', state: function () { return JSON.stringify([G.bids.length, G.phase, G.turn, G.bidQueue.length]); }, expect: function (a, b) { return a !== b || 'the bid did nothing'; } }
    ]
  });

  GXS.add({
    id: 'sq-zoom', name: 'Djinn card list', ask: 'Are the djinn cards readable?', seed: 6, when: booted,
    setup: function () { return table(6).then(function () { GX.show('djd'); try { renderDjPop(); } catch (e) { } return idle(900); }); },
    checks: [
      { kind: 'visible', sel: '#djd .card.dj', name: 'a djinn card' },
      { kind: 'text', sel: '#djd .card.dj h4', re: /\S/, name: 'djinn name', minPx: 14 },
      { kind: 'text', sel: '#djd .card.dj p', re: /\S/, name: 'djinn power text', minPx: 13 },
      { kind: 'fn', name: 'every shown text >= 12 px', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#djd .gx-drawer-body *'), function (e) { if (e.children.length || !GXS.vis(e) || !(e.textContent || '').trim()) return; var px = parseFloat(getComputedStyle(e).fontSize); if (px < 12 && !bad) bad = '"' + e.textContent.trim().slice(0, 20) + '" ' + px + 'px'; }); return !bad || bad; } },
      { kind: 'fn', name: 'drawer is on screen', fn: function () { return inView($('#djd')) || 'drawer off screen'; } },
      skin,
      { kind: 'tap', sel: '#djd .gx-x', name: 'tap closes the drawer', state: function () { return GX.open === 'djd'; }, expect: function (a, b) { return (a && !b) || 'drawer did not close'; } }
    ]
  });

  GXS.add({
    id: 'sq-chips', name: 'Bid chips and score chips', ask: 'Are the bid numbers big enough?', seed: 7, when: booted, group: 'Board',
    setup: function () { return table(7); },
    checks: [
      { kind: 'text', sel: '#acts .sp-b.glow', re: /\d/, name: 'bid chip number', minPx: 13 },
      { kind: 'fn', name: 'every bid chip number >= 13 px', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#acts .sp-b'), function (e) { if (bad || !GXS.vis(e)) return; var px = parseFloat(getComputedStyle(e).fontSize); if (px < 13) bad = 'bid chip font ' + px + ' px'; }); return !bad || bad; } },
      { kind: 'visible', sel: '.sch[data-seat="0"] .ss', name: 'your score chip' },
      { kind: 'eq', name: 'your score', a: function () { return GXS.num('.sch[data-seat="0"] .ss'); }, b: function () { return shownTotal(G.pl[0]); } },
      skin
    ]
  });

  GXS.add({
    id: 'sq-help', name: 'Rules cards', ask: 'Can you read the rules card?', seed: 8, when: booted, group: 'UI',
    setup: function () { return table(8).then(function () { GXH.rules(); return GXS.wait(function () { return $('.gxh-card'); }, 5000); }).then(function () { return idle(400); }); },
    checks: [
      { kind: 'visible', sel: '.gxh-card', name: 'rules card' },
      { kind: 'text', sel: '.gxh-rt', re: /\S/, name: 'card title' },
      { kind: 'text', sel: '.gxh-rx', re: /\S/, name: 'card text' },
      { kind: 'tap', sel: '.gxh-x', name: 'tap Close', state: function () { return !!$('.gxh-card'); }, expect: function (a, b) { return (a === true && b === false) || 'close the card'; } }
    ]
  });
})();

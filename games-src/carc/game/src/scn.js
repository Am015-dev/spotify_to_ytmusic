// Rampart & Vine scenarios (see shell/gx-scenario.js): ?scn=<id> builds ONE state directly. Registered before the game scripts run; setup() runs after boot.
(function () {
  if (!window.GXS) return;
  GXS.labPos = "r";   // the LAB button sits top-right here: the player name is top-left
  var booted = function () { return typeof G !== 'undefined' && typeof beginGame === 'function' && typeof render === 'function' && typeof UI !== 'undefined' && typeof onGlow === 'function'; };
  var $ = function (s) { return document.querySelector(s); };
  var idle = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var words = function (t) { return String(t).trim().split(/\s+/).filter(Boolean).length; };
  var inView = function (e) { var r = e.getBoundingClientRect(); return r.left >= -2 && r.right <= innerWidth + 2 && r.top >= -2 && r.bottom <= innerHeight + 2; };
  var skin = { kind: 'fn', name: 'painted skin moves no box', fn: function () { if (typeof GXSK === 'undefined') return true; var a = GXSK.audit(); return !a.moved.length || a.moved.slice(0, 2).join(' | '); } };
  // a plain two-player game (you vs one computer), no menus, tips off, waiting at YOUR first tile
  function table(seed) {
    try { GXH.setEnabled(false); } catch (e) { }
    var m = $('#modal'); if (m) m.innerHTML = '';
    AIDELAY = 60; beginGame({ np: 2, seats: ['human', 'ai'], lv: ['normal', 'normal'], ex: {}, seed: seed });
    try { GXH.setEnabled(false); GXH.hide(); } catch (e) { }
    return GXS.wait(function () { return G && G.step === 'place' && myTurn('place') && document.querySelectorAll('#world .glow').length && !UI.tw; }, 12000).then(function () { return idle(1000); });
  }

  GXS.add({
    id: 'rv-board', name: 'Start of game board', ask: 'Is the table clear with glowing spots?', seed: 7, when: booted,
    setup: function () { return table(7); },
    checks: [
      { kind: 'visible', sel: '#board', name: 'board' },
      { kind: 'fn', name: 'board fills the screen', fn: function () { var r = $('#board').getBoundingClientRect(), f = r.width * r.height / (innerWidth * innerHeight); return f > .55 || 'board only ' + Math.round(f * 100) + '% of the screen'; } },
      { kind: 'visible', sel: '#htile', name: 'your tile (tap to turn)' },
      { kind: 'text', sel: '#status', re: /place/i, name: 'top line' },
      { kind: 'text', sel: '#seats .nm', re: /\S/, name: 'player name' },
      { kind: 'fn', name: 'a glowing spot is on screen', fn: function () { var g = [].filter.call(document.querySelectorAll('#world .glow'), function (e) { return GXS.vis(e) && inView(e); }); return g.length > 0 || 'no glowing spot visible'; } },
      { kind: 'eq', name: 'your score', a: function () { return GXS.num('#seats .seat[data-i="0"] b'); }, b: function () { return G.pl[0].score; } },
      { kind: 'eq', name: 'rival score', a: function () { return GXS.num('#seats .seat[data-i="1"] b'); }, b: function () { return G.pl[1].score; } },
      { kind: 'eq', name: 'your followers left', a: function () { return GXS.num('#seats .seat[data-i="0"] .fl'); }, b: function () { return G.pl[0].sup.f; } },
      { kind: 'eq', name: 'tiles left', a: function () { return GXS.num('#left b'); }, b: function () { return G.stack.length; } },
      { kind: 'fn', name: 'no line of text over 8 words on the board', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#board *, #status, #seats *, #hand *'), function (e) { if (e.children.length || !GXS.vis(e)) return; var t = (e.textContent || '').trim(); if (words(t) > 8) bad = bad || '"' + t.slice(0, 40) + '" (' + words(t) + ' words)'; }); return !bad || bad; } },
      skin,
      { kind: 'tap', sel: '#htile', name: 'tap turns the tile', state: function () { return UI.rot; }, expect: function (a, b) { return a !== b || 'the tile did not turn'; } }
    ]
  });

  GXS.add({
    id: 'rv-zoom', name: 'Tile zoom: place a follower', ask: 'Is the zoomed tile and its spots clear?', seed: 8, when: booted,
    setup: function () {
      return table(8).then(function () {
        var g = UI.legal.filter(function (x) { return x.r === UI.rot; })[0] || UI.legal[0]; UI.rot = g.r; onGlow(g.x, g.y);
        return GXS.wait(function () { return G.step === 'fig' && myTurn('fig') && document.querySelector('#ov .fglow') && !UI.tw; }, 12000);
      }).then(function () { return idle(900); });
    },
    checks: [
      { kind: 'visible', sel: '#ov .fglow', name: 'follower spot' },
      { kind: 'fn', name: 'the new tile is zoomed (>= 140 px wide) and on screen', fn: function () { var t = $('#world .tl.last') || $('#world .tl:last-child'); if (!t) return 'no tile'; var r = t.getBoundingClientRect(); return (r.width >= 140 && r.left >= -2 && r.right <= innerWidth + 2) || 'tile ' + Math.round(r.width) + 'px wide, ' + Math.round(r.left) + '..' + Math.round(r.right); } },
      { kind: 'fn', name: 'every follower spot is >= 28 px and on screen', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#ov .fglow'), function (e) { var r = e.getBoundingClientRect(); if (!bad && (r.width < 28 || r.height < 28)) bad = 'spot ' + Math.round(r.width) + 'x' + Math.round(r.height); else if (!bad && !inView(e)) bad = 'spot off screen'; }); return !bad || bad; } },
      { kind: 'text', sel: '#status', re: /follower/i, name: 'top line', minPx: 12 },
      { kind: 'text', sel: '#hand button', re: /skip/i, name: 'Skip button' },
      skin,
      { kind: 'tap', sel: '#hand button', name: 'tap Skip ends the zoom step', state: function () { return G.step + ':' + G.turn; }, expect: function (a, b) { return a !== b || 'Skip did nothing'; } }
    ]
  });

  GXS.add({
    id: 'rv-help', name: 'Help: how this works', ask: 'Can you read the help cards?', seed: 9, when: booted, group: 'UI',
    setup: function () { return table(9).then(function () { GXH.rules(null); return GXS.wait(function () { return document.querySelector('.gxh-rules .gxh-card'); }, 5000); }).then(function () { return idle(400); }); },
    checks: [
      { kind: 'visible', sel: '.gxh-rules .gxh-card', name: 'help card' },
      { kind: 'text', sel: '.gxh-rules .gxh-rt', re: /\S/, name: 'card title' },
      { kind: 'text', sel: '.gxh-rules .gxh-rx', re: /\S/, name: 'card text' },
      { kind: 'visible', sel: '.gxh-rules .gxh-x', name: 'Close button' },
      { kind: 'tap', sel: '.gxh-rules .gxh-x', name: 'tap Close', state: function () { return !!document.querySelector('.gxh-rules'); }, expect: function (a, b) { return (a && !b) || 'help did not close'; } }
    ]
  });

  GXS.add({
    id: 'rv-buttons', name: 'Painted buttons keep their labels', ask: 'Are the buttons readable?', seed: 10, when: booted, group: 'Board',
    setup: function () { return table(10); },
    checks: [
      { kind: 'fn', name: 'every visible button label >= 12 px', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('button'), function (b) { if (bad || !GXS.vis(b) || !(b.textContent || '').trim()) return; var px = parseFloat(getComputedStyle(b).fontSize); if (px < 12) bad = '"' + b.textContent.trim().slice(0, 20) + '" ' + px + 'px'; }); return !bad || bad; } },
      skin
    ]
  });


  // painted art wired: every piece colour + the row and bubble-tail plates load; followers show in their seat colour, not stretched
  var ART = ['piece-meeple', 'piece-champ', 'piece-mason', 'piece-hog'].reduce(function (a, n) { return a.concat(['red', 'blue', 'yellow', 'green'].map(function (c) { return n + '-' + c; })); }, ['ui-row', 'ui-bubble-tail']);
  GXS.add({
    id: 'rv-art', name: 'Painted pieces, rows and bubble tail', ask: 'Are the pieces painted and coloured?', seed: 11, when: booted, group: 'UI',
    setup: function () { return table(11).then(function () { var d = document.createElement('div'); d.id = 'rvprobe'; d.style.cssText = 'position:fixed;left:-300px;top:0'; d.innerHTML = '<div class="gxh-bub gxh-a-bottom"><i class="gxh-arr"></i></div><div class="menu"><button>x</button></div>'; document.body.appendChild(d); return Promise.all(ART.map(function (n) { return new Promise(function (r) { var i = new Image(); i.onload = function () { r(i.naturalWidth > 0 ? '' : n); }; i.onerror = function () { r(n); }; i.src = 'media/' + n + '.webp'; }); })); }).then(function (a) { window.__artBad = a.filter(Boolean); }); },
    checks: [
      { kind: 'fn', name: 'all 18 painted files load', fn: function () { return !window.__artBad.length || 'did not load: ' + window.__artBad.join(', '); } },
      { kind: 'fn', name: 'menu rows are painted', fn: function () { return /ui-row/.test(getComputedStyle(document.querySelector('#rvprobe .menu button')).backgroundImage) || 'menu row not painted'; } },
      { kind: 'fn', name: 'coach bubble tail is painted', fn: function () { return /ui-bubble-tail/.test(getComputedStyle(document.querySelector('#rvprobe .gxh-arr')).backgroundImage) || 'tail not painted'; } },
      { kind: 'fn', name: 'painted followers loaded, not stretched', fn: function () { var bad = '', n = 0; [].forEach.call(document.querySelectorAll('img[src*="piece-"]'), function (e) { if (!GXS.vis(e)) return; n++; if (!e.naturalWidth) bad = bad || e.src; var r = e.getBoundingClientRect(); if (e.naturalWidth && r.width > 4 && getComputedStyle(e).objectFit === 'fill' && Math.abs(r.width / r.height - e.naturalWidth / e.naturalHeight) > 0.2) bad = bad || 'stretched ' + e.src; }); return (!bad && n > 0) || bad || 'no painted follower on the board'; } },
      skin
    ]
  });

})();

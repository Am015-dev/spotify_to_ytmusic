// Lantern Dive scenarios (see shell/gx-scenario.js): ?scn=<id> builds ONE state directly. Registered before the game scripts run; setup() runs after boot.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof render === 'function' && typeof UI !== 'undefined' && typeof LD !== 'undefined' && typeof openJob === 'function'; };
  var $ = function (s) { return document.querySelector(s); };
  var idle = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var words = function (t) { return String(t).trim().split(/\s+/).filter(Boolean).length; };
  var inView = function (e) { var r = e.getBoundingClientRect(); return r.left >= -2 && r.right <= innerWidth + 2 && r.top >= -2 && r.bottom <= innerHeight + 2; };
  var skin = { kind: 'fn', name: 'painted skin moves no box', fn: function () { if (typeof GXSK === 'undefined') return true; var a = GXSK.audit(); return !a.moved.length || a.moved.slice(0, 2).join(' | '); } };
  // a plain four-diver game (you vs three computers), no menus, tips off, waiting at YOUR job pick
  function table(seed) {
    try { GXH.setEnabled(false); } catch (e) { }
    try { GX.close(); } catch (e) { }
    UI.seed = seed; newGame('vs'); try { UI.coach.level = 'off'; } catch (e) { }
    try { GXH.setEnabled(false); GXH.hide(); } catch (e) { }
    render();
    return GXS.wait(function () { return UI.started && G.phase === 'assign' && $('#pool .jcard') && $('#hand .card, #hand > *') && !UI.busy && !UI.cards.length; }, 12000).then(function () { return idle(1200); });
  }

  GXS.add({
    id: 'ld-board', name: 'Start of game board', ask: 'Are the jobs and your hand clear?', seed: 5, when: booted,
    setup: function () { return table(5); },
    checks: [
      { kind: 'visible', sel: '#board', name: 'board' },
      { kind: 'fn', name: 'board fills the screen', fn: function () { var r = $('#board').getBoundingClientRect(), f = r.width * r.height / (innerWidth * innerHeight); return f > .5 || 'board only ' + Math.round(f * 100) + '% of the screen'; } },
      { kind: 'visible', sel: '#pool .jcard.glow', name: 'job to take' },
      { kind: 'visible', sel: '#acts button', name: 'Pass button' },
      { kind: 'text', sel: '#pool .jcard b', re: /\S/, name: 'job name' },
      { kind: 'fn', name: 'top line has text, >= 12 px', fn: function () { var e = document.querySelector('#prompt'); if (!e || !/\S/.test(e.textContent)) return 'no top line'; var px = parseFloat(getComputedStyle(e).fontSize); return px >= 12 || 'font ' + px; } },
      { kind: 'fn', name: 'your whole hand is on screen', fn: function () { var h = [].slice.call(document.querySelectorAll('#hand > *')).filter(GXS.vis); if (h.length !== G.players[0].hand.length) return h.length + ' cards shown, engine has ' + G.players[0].hand.length; for (var i = 0; i < h.length; i++) if (!inView(h[i])) return 'card ' + i + ' off screen'; return true; } },
      { kind: 'eq', name: 'cards left, first rival', a: function () { return GXS.num('#opp .seat[data-seat="1"] .bdg.n b'); }, b: function () { return G.players[1].hand.length; } },
      { kind: 'eq', name: 'your tricks won', a: function () { return GXS.num('#mine .bdg.t b'); }, b: function () { return tricksWon()[0]; } },
      { kind: 'fn', name: 'no line of text over 8 words on the board', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#board *, #prompt'), function (e) { if (e.children.length || !GXS.vis(e)) return; var t = (e.textContent || '').trim(); if (words(t) > 8) bad = bad || '"' + t.slice(0, 40) + '" (' + words(t) + ' words)'; }); return !bad || bad; } },
      skin
    ]
  });

  GXS.add({
    id: 'ld-zoom', name: 'Job card zoom', ask: 'Is the big job card readable?', seed: 6, when: booted,
    setup: function () { return table(6).then(function () { openJob(0); clearTimeout(UI.popT); return idle(600); }); },
    checks: [
      { kind: 'visible', sel: '#ppop .ph-t b', name: 'job card title' },
      { kind: 'text', sel: '#ppop .ph-t b', re: /\S/, name: 'job title', minPx: 14 },
      { kind: 'text', sel: '#ppop .ph-body p', re: /\S/, name: 'job text', minPx: 13 },
      { kind: 'fn', name: 'every shown text >= 12 px', fn: function () { var bad = ''; [].forEach.call(document.querySelectorAll('#ppop *'), function (e) { if (e.children.length || !GXS.vis(e) || !(e.textContent || '').trim()) return; var px = parseFloat(getComputedStyle(e).fontSize); if (px < 12 && !bad) bad = '"' + e.textContent.trim().slice(0, 20) + '" ' + px + 'px'; }); return !bad || bad; } },
      { kind: 'fn', name: 'card is on screen', fn: function () { return inView($('#ppop')) || 'card off screen'; } },
      skin,
      { kind: 'tap', sel: '#ppop [data-a=popx]', name: 'tap closes the card', state: function () { return !$('#ppop').hidden; }, expect: function (a, b) { return (a && !b) || 'card did not close'; } }
    ]
  });

  GXS.add({
    id: 'ld-help', name: 'Rules cards', ask: 'Can you read the rules card?', seed: 10, when: booted, group: 'UI',
    setup: function () { return table(10).then(function () { GXH.rules(); return GXS.wait(function () { return document.querySelector('.gxh-card'); }, 5000); }).then(function () { return new Promise(function (r) { setTimeout(r, 400); }); }); },
    checks: [
      { kind: 'visible', sel: '.gxh-card', name: 'rules card' },
      { kind: 'text', sel: '.gxh-rt', re: /\S/, name: 'card title' },
      { kind: 'text', sel: '.gxh-rx', re: /\S/, name: 'card text' },
      { kind: 'tap', sel: '.gxh-x', name: 'tap Close', state: function () { return !!document.querySelector('.gxh-card'); }, expect: function (a, b) { return (a === true && b === false) || 'close the card'; } }
    ]
  });
  // painted art: card frames, tick/cross, seat plates and the portrait Descent table
  GXS.add({
    id: 'ld-art', name: 'Painted cards, seats, tick and cross', ask: 'Do cards and seats look painted?', seed: 5, when: booted,
    setup: function () {
      window.__ldf = [];
      var loads = ['coral', 'tide', 'kelp', 'sunstar', 'lantern'].map(function (n) { return new Promise(function (r) { var i = new Image(); i.onload = function () { window.__ldf.push([n, i.naturalWidth > 0]); r(); }; i.onerror = function () { window.__ldf.push([n, false]); r(); }; i.src = 'media/card-face-' + n + '.webp'; }); });
      return Promise.all(loads).then(function () { return table(5); }).then(function () {
        try { GXC.unlocked = function () { return [{ type: 'table', id: 'tunnel-glow' }]; }; tableApply(); } catch (e) { }
        return GXS.wait(function () { return /tunnel-glow/.test(getComputedStyle(document.documentElement).getPropertyValue('--tableimg')) && document.documentElement.classList.contains('sk-seat'); }, 8000);
      }).then(function () { return idle(1200); });
    },
    checks: [
      { kind: 'fn', name: 'all 5 card frames load', fn: function () { var b = (window.__ldf || []).filter(function (x) { return !x[1]; }).map(function (x) { return x[0]; }); return ((window.__ldf || []).length === 5 && !b.length) || 'not loaded: ' + (b.join(',') || 'none tried'); } },
      { kind: 'fn', name: 'table cards use the painted frames', fn: function () { if (!PX || !PX.on) return true; var m = [0, 1, 2, 3, 4].filter(function (s) { return !PX.img['face' + s]; }); return !m.length || 'suits without frame: ' + m.join(','); } },
      { kind: 'fn', name: 'tick and cross are painted and clipped to a disc', fn: function () { var t = KIT.stateMark(1, 100), c = KIT.stateMark(-1, 100); return (/icon-tick\.webp/.test(t) && /icon-cross\.webp/.test(c) && /clip-path/.test(t + c)) || 'marks not painted: ' + KIT.stateMark(1, 100).slice(0, 40); } },
      { kind: 'fn', name: 'seat names sit on the brass plate and stay readable', fn: function () { var e = document.querySelector('.seat:not(.drone) .top .nm'); if (!e) return 'no seat name'; var cs = getComputedStyle(e), c = cs.color.match(/\d+/g).map(Number); return (/ui-seat\.webp/.test(cs.backgroundImage) && (c[0] + c[1] + c[2]) / 3 < 110 && parseFloat(cs.fontSize) >= 11) || 'plate ' + cs.backgroundImage.slice(0, 30) + ' ink ' + cs.color + ' ' + cs.fontSize; } },
      { kind: 'fn', name: 'Descent table matches the screen shape', fn: function () { var v = getComputedStyle(document.documentElement).getPropertyValue('--tableimg'), want = innerWidth < 700 && innerHeight > innerWidth ? 'tunnel-glow-phone' : 'tunnel-glow.webp'; return v.indexOf(want) >= 0 || 'table image is ' + v.slice(-40) + ', wanted ' + want; } },
      skin
    ]
  });

})();

// Ochre Horizon scenarios (see shell/gx-scenario.js): ?scn=<id> builds ONE state directly. Registered before the game scripts.
(function () {
  if (!window.GXS) return;
  function booted() { return window.UI && UI.ready && window.OH && window.OHAI; }
  // a game started and played by the computer (both seats) until it is the human's action turn
  function table(seed, gens) {
    UI.AIDELAY = 30; UI.level = 'normal';
    OH.newGame({ seed: seed, beginner: true });
    var guard = 0;
    while (guard++ < 4000) {
      var G = OH.G, p = OH.sideToAct();
      if (G.phase === 'action' && p === 0 && !G.pending && G.gen >= (gens || 1)) break;
      var m = OHAI.decide('normal'); if (!m) break; OH.performMove(m);
    }
    UI.evSeen = OH.G.ev.length; UI.logSeen = OH.G.log.length;
    document.getElementById('start').style.display = 'none';
    fitView(); render();
    return new Promise(function (r) { setTimeout(r, 400); });
  }
  function giveCard(pred) {
    var G = OH.G, P = G.pl[0];
    var id = OH_DATA.cards.filter(function (c) { return pred(c) && P.hand.indexOf(c.id) < 0; })[0].id;
    // move the card from wherever it is into the hand (keeps the 208-card count)
    [G.deck, G.discard, G.pl[1].hand].forEach(function (a) { var i = a.indexOf(id); if (i >= 0) a.splice(i, 1); });
    if (P.played.indexOf(id) >= 0 || G.pl[1].played.indexOf(id) >= 0) return null;
    P.hand.unshift(id); P.mc = Math.max(P.mc, 40);
    return id;
  }
  function words(t) { return (t.trim().match(/\S+/g) || []).length; }
  GXS.add({
    id: 'oh-board', name: 'Board: start of a round', ask: 'Is the planet clear and big?', seed: 3, when: booted,
    setup: function () { return table(3); },
    checks: [
      { kind: 'visible', sel: '#board', name: 'board' },
      { kind: 'fn', name: 'board fills most of the screen', fn: function () { var r = document.getElementById('bw').getBoundingClientRect(); var f = r.width * r.height / (innerWidth * innerHeight); return f > .4 || 'board only ' + Math.round(f * 100) + '%'; } },
      { kind: 'fn', name: '61 map spaces drawn', fn: function () { var n = document.querySelectorAll('#hexes .hex').length; return n >= 61 || n + ' spaces'; } },
      { kind: 'eq', name: 'your points', a: function () { return +document.getElementById('trYou').textContent; }, b: function () { return OH.score(0).total; } },
      { kind: 'eq', name: 'rival points', a: function () { return +document.getElementById('trRiv').textContent; }, b: function () { return OH.score(1).total; } },
      { kind: 'eq', name: 'your credits', a: function () { return +document.querySelector('#res [data-engine="mc"]').textContent; }, b: function () { return OH.G.pl[0].mc; } },
      { kind: 'text', sel: '#hintt', re: /\S/, name: 'hint line' },
      { kind: 'fn', name: 'hint line 8 words or fewer', fn: function () { var n = words(document.getElementById('hintt').textContent); return n <= 8 || n + ' words'; } },
      { kind: 'visible', sel: '#bCards', name: 'Cards button' },
      { kind: 'visible', sel: '#bPass', name: 'Pass button' }
    ]
  });
  GXS.add({
    id: 'oh-zoom', name: 'Zoom the map', ask: 'Pinch or tap + to zoom in', seed: 4, when: booted,
    setup: function () { return table(4); },
    checks: [
      { kind: 'tap', sel: '#zin', name: 'zoom in', state: function () { return UI.view.s; }, expect: function (a, b) { return b > a || 'scale ' + a + ' -> ' + b; } },
      { kind: 'tap', sel: '#zfit', name: 'fit', state: function () { return UI.view.s; }, expect: function (a, b) { return b === 1 || 'scale ' + b; } }
    ]
  });
  GXS.add({
    id: 'oh-cards', name: 'Play a card from the hand', ask: 'Open Cards and play one', seed: 5, when: booted,
    setup: function () { return table(5).then(function () { window.__pick = giveCard(function (c) { return c.type === 'auto' && !c.req && c.play.length === 1 && c.play[0].op === 'prod' && c.play[0].n > 0; }); render(); }); },
    checks: [
      { kind: 'play', name: 'play the card', snap: function () { return { hand: OH.G.pl[0].hand.length, played: OH.G.pl[0].played.length }; },
        steps: [{ sel: '#bCards' }, { sel: function () { return document.querySelector('#shB [data-card="' + window.__pick + '"]'); }, after: 300 }, { sel: '#mPlay', after: 300 }],
        idle: function () { return !document.getElementById('modal').classList.contains('on'); },
        verify: function (a, b) { return b.played === a.played + 1 || 'played ' + a.played + ' -> ' + b.played; } }
    ]
  });
  GXS.add({
    id: 'oh-place', name: 'Place a greenery tile', ask: 'Tap a glowing space twice', seed: 6, when: booted,
    setup: function () { return table(6).then(function () { OH.G.pl[0].plant = 9; render(); }); },
    checks: [
      { kind: 'play', name: 'plant greenery from the plants chip', snap: function () { return { g: OH.greeneries(0), oxy: OH.G.oxy }; },
        steps: [{ sel: '#res [data-r="plant"]' }, { sel: '.hex.tgt', after: 400 }, { sel: '#confirmb', after: 300 }],
        idle: function () { return !OH.G.pending; },
        verify: function (a, b) { return b.g === a.g + 1 || 'greeneries ' + a.g + ' -> ' + b.g; } }
    ]
  });
  GXS.add({
    id: 'oh-projects', name: 'Standard projects drawer', ask: 'Open Projects; is each cost clear?', seed: 7, when: booted,
    setup: function () { return table(7).then(function () { OH.G.pl[0].mc = 30; render(); openSheet('proj', 'std'); }); },
    checks: [
      { kind: 'visible', sel: '#shB [data-std="asteroid"]', name: 'Comet strike button' },
      { kind: 'tap', sel: '#shB [data-std="asteroid"]', name: 'raise temperature', state: function () { return OH.G.temp; }, expect: function (a, b) { return b === a + 2 || 'temp ' + a + ' -> ' + b; } }
    ]
  });
  GXS.add({
    id: 'oh-research', name: 'New round: buy cards', ask: 'Pick cards and buy', seed: 8, when: booted,
    setup: function () {
      UI.AIDELAY = 30; OH.newGame({ seed: 8, beginner: true });
      var g = 0; while (g++ < 4000 && !(OH.G.phase === 'research' && OH.sideToAct() === 0)) { OH.performMove(OHAI.decide('normal')); }
      UI.evSeen = OH.G.ev.length; UI.logSeen = OH.G.log.length; document.getElementById('start').style.display = 'none'; fitView(); render(); pump();
      return new Promise(function (r) { setTimeout(r, 400); });
    },
    checks: [
      { kind: 'visible', sel: '#mBuy', name: 'Buy button' },
      { kind: 'tap', sel: '#mBuy', name: 'buy', state: function () { return OH.G.pl[0].bought; }, expect: function (a, b) { return b === true || 'not bought'; } }
    ]
  });
})();

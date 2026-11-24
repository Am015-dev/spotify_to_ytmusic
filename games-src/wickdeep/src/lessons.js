// Wickdeep scenario lessons on the shared gx-scenario-tutor (shell/GXST.md, orch/TUTORIAL-SPEC.md).
// Each lesson stacks a small real position on the game's own engine, gives ONE goal, and judges the real state.
// ES5 only. Lessons 4-7 are added in a later step (see the marker in the array).
(function () {
  if (!window.GXST) return;
  var calm = function () { return new Promise(function (r) { setTimeout(r, 500); }); };
  var until = function (f, ms) {
    var t0 = Date.now();
    return new Promise(function (r) {
      (function w() {
        var ok = false;
        try { ok = f(); } catch (e) { }
        if (ok || Date.now() - t0 > ms) r(ok); else setTimeout(w, 50);
      })();
    });
  };
  var why = function (msg) { return msg; };

  // ---- helpers ----
  function hero() { return G.figs.filter(function (f) { return f.kind === 'hero'; })[0]; }
  function mon(id) { return WD.fig(G, id); }
  function alive(id) { var m = mon(id); return !!(m && m.hp > 0); }
  function turnOver() { return G.phase === 'select' && G.round > 1; }
  // the hero has played the first half of its turn and now holds the second: the attack was made
  function actedOnce() { var h = hero(); return !!(G.act && G.act.id === h.id && G.act.used && G.act.used.length >= 1 && G.ask && G.ask.h === 'second' && (!G.act.q || G.act.i >= G.act.q.length)); }
  function cardInit(c) { return D.CARD[c].i; }

  // hexes reachable from `from` over floor, by distance (BFS, at most 8 steps)
  function dists(from) {
    var d = {}, q = [from], i, k;
    d[from] = 0;
    for (i = 0; i < q.length; i++) {
      k = q[i];
      if (d[k] >= 8) continue;
      WD.nb(k).forEach(function (n) {
        if (!(n in d) && G.hex[n] && G.hex[n].t === 'f') { d[n] = d[k] + 1; q.push(n); }
      });
    }
    return d;
  }
  // a free floor hex as close as possible to `n` steps from `from`
  function hexAt(from, n, ok) {
    var d = dists(from), best = null, bestGap = 99;
    Object.keys(d).forEach(function (k) {
      if (d[k] === 0 || WD.figAt(G, k) || (ok && !ok(k))) return;
      var gap = Math.abs(d[k] - n);
      if (gap < bestGap) { best = k; bestGap = gap; }
    });
    return best;
  }

  // Facts the lessons read back after stack(): door hex, next room beyond it, coin hex.
  var ctx = {};
  // Stack the position: a fresh one-warden game, then the hand, monsters and modifier deck set by hand.
  // sp = { hand: [card ids], hp: hero hp or null, mons: [{ id, type, idx, hp, dist, shield, elite }],
  //        doorAt: n (hero n steps from a door, same room), coin: n (coin n steps from hero), realDeck: keep modifier deck }
  function stack(sp) {
    UI.fast = true; UI.sel = {}; UI.pick = null; UI.det = null;
    localStorage.removeItem('wickdeep-game-v1');
    if (!window.__wdlSaveWrapped) {
      window.__wdlSaveWrapped = true;
      var realSave = save;
      save = function () { if (GXST.active()) return; return realSave.apply(this, arguments); };
    }
    CAMP = WDC.newCamp(['warden'], 0);
    UI.tut = false;
    WDUI.startScenario(1, { seed: 7, party: [{ cls: 'warden', lvl: 1 }], tut: false });
    UI.tut = true;

    var h = hero();
    h.hand = sp.hand.slice();
    h.disc = [];
    if (sp.hp) h.hp = sp.hp;
    if (!sp.realDeck) {
      h.amd.draw = [];
      for (var i = 0; i < 20; i++) h.amd.draw.push({ v: 0 });
      h.amd.disc = [];
    }

    // place the hero in its start room, then reveal that room (placed monsters are dropped)
    var room0 = G.hex[h.pos].room;
    var inRoom = function (k) { return G.hex[k] && G.hex[k].room === room0; };
    ctx.door = ctx.next = ctx.coin = null;
    if (sp.doorAt) {
      ctx.door = Object.keys(G.hex).filter(function (k) {
        return G.hex[k].t === 'door' && WD.nb(k).some(inRoom);
      })[0];
      ctx.next = WD.nb(ctx.door).filter(function (n) { return G.hex[n] && !inRoom(n); }).map(function (n) { return G.hex[n].room; })[0];
      h.pos = hexAt(ctx.door, sp.doorAt, inRoom) || h.pos;
    }
    var room = G.hex[h.pos].room;
    if (!G.rev[room] && typeof E !== 'undefined' && E.reveal) E.reveal(G, room);
    G.rev[room] = true;
    G.place = [];
    G.figs = G.figs.filter(function (f) { return f.kind !== 'mon' && f.kind !== 'boss'; });

    if (sp.coin) {
      ctx.coin = hexAt(h.pos, sp.coin, inRoom);
      if (ctx.coin) G.hex[ctx.coin].coin = 1;
    }

    var seen = {};
    (sp.mons || []).forEach(function (m) {
      var pos = m.dist === 1 ? WD.nb(h.pos).filter(function (k) { return G.hex[k] && G.hex[k].t === 'f' && !WD.figAt(G, k); })[0] : hexAt(h.pos, m.dist);
      var fig = { id: m.id, kind: 'mon', team: 'm', type: m.type, elite: !!m.elite, pos: pos, hp: m.hp, max: m.hp, cond: {}, rnd: {}, num: 1 };
      if (m.shield) fig.shield = m.shield;
      G.figs.push(fig);
      if (!seen[m.type]) { seen[m.type] = true; G.md[m.type] = { fam: D.MON[m.type].deck, draw: [], disc: [], cur: null, resh: false }; }
      G.md[m.type].draw.push(m.idx);
    });
    WDUI.refresh();
    return calm();
  }

  var lessons = [
    {
      id: 'pick', title: 'Pick two cards',
      rule: 'You act at the lower of your two card initiatives. Lowest first: a monster acts when its card comes up in that order.',
      goal: 'Act before the rat this round.',
      setup: function () {
        return stack({ hand: ['ww06', 'ww02', 'ww08', 'ww10'], mons: [{ id: 'mx', type: 'rat', idx: 3, hp: 3, dist: 3 }] });
      },
      success: function () {
        return G.phase === 'turns' && G.order.length > 0 && G.order[0].id === hero().id;
      },
      fail: function () {
        if (G.phase !== 'turns' || !G.order.length || !G.order[0].mt) return false;
        var h = hero(), low = Math.min(cardInit(h.sel[0]), cardInit(h.sel[1]));
        return why('Your lowest card initiative is ' + low + ' and the rat\'s card is 29, so the rat acts first.');
      },
      par: 1,
      hints: [
        'Initiative is shown on each card. The lower number acts first.',
        { say: 'Pick two cards with low initiative, then tap Ready.', target: '#tray .cd' }
      ],
      debrief: 'You act at your lower card initiative. Pick low cards to get in before the rat.'
    },
    {
      id: 'halves', title: 'Top and bottom',
      rule: 'Each card has a top and a bottom half. You play one half of each card, so you can use the top of one card and the bottom of the other.',
      goal: 'Defeat the rat this turn.',
      setup: function () {
        return stack({ hand: ['ww01', 'ww04', 'ww03', 'ww05'], mons: [{ id: 'mx', type: 'rat', idx: 7, hp: 3, dist: 4 }] });
      },
      success: function () { return !alive('mx'); },
      fail: function () {
        if (!turnOver() || !alive('mx')) return false;
        return why('Your turn ended with the rat alive: use Move 4 from the bottom of Lantern Swing, then Attack 3 from the top of Tallow Bash.');
      },
      par: 1,
      hints: [
        'Each card has two halves. Play the bottom half of one card and the top half of the other.',
        { say: 'Play the bottom half of Lantern Swing to move, then the top half of Tallow Bash to attack.', target: '#tray .half.can' }
      ],
      debrief: 'Two halves of two cards gave you a move and an attack in one turn.'
    },
    {
      id: 'shield', title: 'Shield',
      rule: 'A shield soaks that much damage from every hit before the monster loses hit points.',
      goal: 'Defeat the crab this turn.',
      setup: function () {
        return stack({ hand: ['ww01', 'ww09', 'ww06', 'ww03'], mons: [{ id: 'cr', type: 'crab', idx: 2, hp: 2, dist: 1 }] });
      },
      success: function () { return !alive('cr'); },
      fail: function () {
        if (!(turnOver() || actedOnce()) || !alive('cr')) return false;
        return why('The crab\'s shield soaked 2 of the damage: Attack 4 kills it, but Attack 3 leaves it at 1 hp.');
      },
      par: 1,
      hints: [
        'Look at the shield number on the crab. It is taken off each hit first.',
        { say: 'Play Brazier Rush for its Attack 4.', target: '#tray .cd' }
      ],
      debrief: 'A shield of 2 means a 4 attack deals only 2 damage, and a 3 attack deals 1.'
    },
    {
      id: 'retal', title: 'Hits back',
      rule: 'Some monsters retaliate: when you hit them in melee, they strike back. A ranged attack gets no retaliation.',
      goal: 'Hurt the ghoul and stay alive.',
      setup: function () {
        return stack({ hp: 1, hand: ['ww07', 'ww01', 'ww04', 'ww03'], mons: [{ id: 'gh', type: 'ghoul', idx: 0, hp: 4, dist: 2 }] });
      },
      success: function () {
        var g = mon('gh');
        return (turnOver() || actedOnce()) && !!g && g.hp < 4 && hero().hp > 0;
      },
      fail: function () {
        if (hero().hp <= 0) return why('The ghoul\'s retaliate 1 killed you at 1 hp: a melee hit draws it back, so use Hot Wax Hurl at range 3.');
        if (!turnOver() || !alive('gh')) return false;
        return why('Your turn ended without hurting the ghoul: Hot Wax Hurl hits it from range 3 without retaliation.');
      },
      par: 1,
      hints: [
        'A ranged attack from range does not draw retaliation.',
        { say: 'Play Hot Wax Hurl: it has range 3.', target: '#tray .cd' }
      ],
      debrief: 'Retaliate hits back on melee attacks only. Ranged attacks stay safe.'
    },
    {
      id: 'door', title: 'Open the door',
      rule: 'Doors stay shut until a hero moves into them. Moving through a door reveals the room beyond.',
      goal: 'Open the door and see the next room.',
      setup: function () {
        return stack({ hand: ['ww04', 'ww03', 'ww05', 'ww06'], doorAt: 4 });
      },
      success: function () { return !!ctx.next && !!G.rev[ctx.next]; },
      fail: function () {
        if (!turnOver() || (ctx.next && G.rev[ctx.next])) return false;
        return why('Your turn ended with the door still shut: Move 4 from the bottom of Lantern Swing walks you into it.');
      },
      par: 1,
      hints: [
        'The door is 4 hexes from you. Look for a move that reaches it.',
        { say: 'Play the bottom half of Lantern Swing to move 4.', target: '#tray .half.can' }
      ],
      debrief: 'Stepping into a door opens it and reveals the room beyond.'
    },
    {
      id: 'coin', title: 'Coins',
      rule: 'Coins lie on the floor. You pick one up by ending your turn on its hex.',
      goal: 'End your turn on the coin.',
      setup: function () {
        return stack({ hand: ['ww01', 'ww03', 'ww05', 'ww06'], coin: 3 });
      },
      success: function () { return hero().coins > 0 || (!!ctx.coin && hero().pos === ctx.coin && (turnOver() || actedOnce())); },
      fail: function () {
        if (!turnOver() || hero().coins > 0) return false;
        return why('Your turn ended off the coin, so no coin was picked up: Move 3 from the bottom of Tallow Bash lands you on it.');
      },
      par: 1,
      hints: [
        'The coin is 3 hexes away. Finish your move on it.',
        { say: 'Play the bottom half of Tallow Bash to move 3.', target: '#tray .half.can' }
      ],
      debrief: 'Coins are picked up when your turn ends on their hex.'
    },
    {
      id: 'finish', title: 'Win the fight',
      rule: 'A fight is won when every monster is defeated. Plan your cards so you can reach and defeat each one.',
      goal: 'Defeat both rats.',
      setup: function () {
        return stack({ realDeck: true, hand: ['ww01', 'ww02', 'ww03', 'ww04', 'ww05', 'ww06'], mons: [
          { id: 'r1', type: 'rat', idx: 3, hp: 2, dist: 2 },
          { id: 'r2', type: 'rat', idx: 7, hp: 2, dist: 3 }
        ] });
      },
      success: function () { return !!G.done && !!G.done.won; },
      fail: function () {
        if (hero().hp <= 0) return why('You were knocked out before both rats fell, so the fight is lost: keep your hit points above zero.');
        if (G.done && !G.done.won) return why('The fight ended with a rat alive, so it is lost: attack the nearer rat first.');
        return false;
      },
      par: 2,
      hints: [
        'Both rats have 2 hit points. Any attack that reaches them will do.',
        { say: 'Pick cards that reach both rats this round.', target: '#tray .cd' }
      ],
      debrief: 'Defeat every monster to win. Clear the nearer one first, then the other.'
    }
  ];

  // Open the lessons from the title menu, and never show the old dock lesson panel.
  startTutorial = function () { GXST.start(0); };
  nextLesson = function () { return null; };
  window.addEventListener('gxst', function (e) {
    if (e && e.detail && e.detail.type === 'close') UI.tut = false;
    // the last lesson flows straight into a real game
    if (e && e.detail && e.detail.type === 'win' && e.detail.id === 'finish') setTimeout(function () {
      var ft = document.querySelector('.gxst-card .gxst-ft'); if (!ft || document.getElementById('wdl-real')) return;
      var b = document.createElement('button'); b.type = 'button'; b.id = 'wdl-real'; b.className = 'gxst-btn pri'; b.textContent = 'Play a real game';
      b.addEventListener('click', function () { GXST.close(); UI.tut = false; UI.fast = false; G = null; quickPlay(); });
      ft.innerHTML = ''; ft.appendChild(b);
    }, 0);
  });

  GXST.init({
    game: 'wickdeep',
    scenarios: lessons,
    settled: function () { return !UI.busy && (!G.ask || G.ask.h !== 'anim'); },
    keepClear: ['.gx-bar', '#tray', '#promptrow', '#hot > *', '#zoombox', '#order'],
    qParent: document.querySelector('.gx-bar header') || document.querySelector('.gx-bar')
  });
  window.WDL = { lessons: lessons, ctx: ctx };

  // ?lesson=<id> starts that lesson once the game has booted
  var m = /[?&]lesson=([^&#]+)/.exec(window.location.search);
  if (m) {
    var want = decodeURIComponent(m[1]);
    until(function () { return typeof WDUI !== 'undefined' && typeof WD !== 'undefined' && typeof UI !== 'undefined'; }, 15000)
      .then(function (ok) { if (ok) GXST.start(want); });
  }
})();

// Emberclimb shell wiring: help kit rules cards (the old rules overlay text), the Menu (gx-kit settings), drawers. Same pattern as the other shelf games.
(function () {
  var D = EC.D, E = EC.E;
  function g() { return E.G(); }
  // ---- rules cards (shared help kit): the old "How to climb" text, split into short cards; phase = where the player is
  var IC = { climb: '\u26F0', turn: '\u2694', intent: '\uD83D\uDC41', status: '\u2620', reward: '\uD83C\uDCCF', rest: '\uD83D\uDD25', duo: '\uD83D\uDC65', map: '\uD83D\uDDFA', boss: '\uD83D\uDC51', shop: '\uD83D\uDED2', event: '\u2753' };
  function svg(k) { return function () { return '<svg viewBox="0 0 100 60" width="100%" height="100%" aria-hidden="true"><text x="50" y="46" font-size="44" text-anchor="middle">' + IC[k] + '</text></svg>'; }; }
  var R = [
    { title: 'The climb', text: 'Walk up the map room by room. Glowing rooms are your next step. Beat the boss at the top to win.', pic: svg('climb') },
    { title: 'Your turn', text: 'You draw 5 cards and have 3 energy each turn. Tap a card once to lift it, again to play it. Pick a target if asked.', pic: svg('turn') },
    { title: 'Read the intent', text: 'Enemies show what they will do next. Block cancels attacks. Out of energy? End your turn.', pic: svg('intent') },
    { title: 'Status effects', text: 'Vulnerable: takes 50% more. Weak: deals 25% less. Poison: lose HP each turn. Dice cards roll a d6: 1-2 low, 3-4 middle, 5-6 high.', pic: svg('status') },
    { title: 'After a fight', text: 'Pick 1 of 3 new cards, or skip to keep your deck lean.', pic: svg('reward') },
    { title: 'Rest and shop', text: 'Campfires heal or upgrade a card. Shops sell cards, relics and potions for gold.', pic: svg('rest') },
    { title: 'Two heroes', text: 'Two heroes share the map and take turns. Pass the screen.', pic: svg('duo') },
    { phase: 'map', title: 'Pick a room', text: 'Glowing rooms are your next step. Fights give cards, campfires heal, shops sell, ? rooms are events.', pic: svg('map') },
    { phase: 'map', title: 'The boss', text: 'The crown room at the top is the boss. Beat it to win the climb.', pic: svg('boss') },
    { phase: 'battle', title: 'Play cards', text: 'Tap a card once to lift it, again to play it. Pick a target if asked. You have 3 energy a turn.', pic: svg('turn') },
    { phase: 'battle', title: 'Intent and block', text: 'The icon over an enemy is its next move. Block cancels attacks this turn.', pic: svg('intent') },
    { phase: 'battle', title: 'Status effects', text: 'Vulnerable takes 50% more. Weak deals 25% less. Poison costs HP every turn.', pic: svg('status') },
    { phase: 'reward', title: 'Pick a card', text: 'Add one of three cards to your deck, or skip to keep it lean. A sharper deck climbs higher.', pic: svg('reward') },
    { phase: 'rest', title: 'Campfire', text: 'Heal some HP, or smith to upgrade one card. Pick one.', pic: svg('rest') },
    { phase: 'shop', title: 'Shop', text: 'Tap an item to see it, then Buy. Cards, relics and potions cost gold.', pic: svg('shop') },
    { phase: 'event', title: 'Event', text: 'A choice with a price or a prize. Read each option, then pick one.', pic: svg('event') }
  ];
  function phase() { var gg = g(); if (!gg || (window.UI && UI.mode === 'title')) return null; return gg.scr === 'over' ? null : gg.scr; }
  UI.phase = phase;
  function boot() {
    GX.init({ key: 'ec' });
    UI.rulesOpen = function () { try { GX.close(); } catch (e) { } GXH.rules(phase()); };
    document.getElementById('rulesB').addEventListener('click', UI.rulesOpen);
    GXH.init({ game: 'emberclimb', defaultOn: false, steps: {}, rules: R });
    GXH.bulb({ el: '#bulbbtn', rulesFor: phase, suggest: function () { return null; } });
    GX.onResize(function () { try { UI.fit && UI.fit(); } catch (e) { } });
    UI.kitMenu();
  }
  // ---- Menu: gx-kit settings (Rules, Tutorial, Restart, Sound, Music, Title + the shared sections)
  UI.kitMenu = function () {
    var btn = function (label, fn, id) { var b = document.createElement('button'); b.type = 'button'; b.className = 'gx-sb'; b.textContent = label; if (id) b.id = id; b.addEventListener('click', fn); return b; };
    GX.settings({
      id: 'setd', title: 'Menu',
      game: function (S) {
        var gg = g(), inRun = !!gg && UI.mode !== 'title';
        var row = [];
        if (inRun && gg.scr !== 'over') {
          row.push(btn('Relics (' + gg.relics.length + ')', function () { GX.close(); UI.ov = 'relics'; UI.render(); }, 'm-relics'));
          row.push(btn('Deck (' + gg.hs.reduce(function (a, x) { return a + x.deck.length; }, 0) + ')', function () { GX.close(); UI.ov = 'deck'; UI.render(); }, 'm-deck'));
        }
        if (row.length) S.appendChild(GX.row('This run', row));
        var r2 = [];
        if (inRun) {
          r2.push(btn('Restart', function () { GX.close(); if (UI.camp && UI.camp.setup) { var d = UI.camp; UI.camp = null; UI.fin = 0; UI.campStart(d); } else { UI.restart(); } }, 'm-restart'));
          r2.push(btn(UI.camp ? 'Leave chapter' : 'Leave run', function () { GX.close(); UI.ov = null; UI.leave(); }, 'm-leave'));
        }
        r2.push(btn('Title screen', function () { GX.close(); UI.ov = null; if (UI.camp) { UI.campExit(); } else { UI.mode = 'title'; UI.sub = ''; UI.render(); } }, 'm-title'));
        S.appendChild(GX.row('Leave', r2));
      },
      sound: function (S) {
        S.appendChild(GX.row('Sound', GX.onoff(SND.on, function (v) { if (v !== SND.on) SND.toggle(); if (window.GXMUS) GXMUS.sync(); })));
        S.appendChild(GX.row('Music', btn('Pick the songs…', function () { if (window.GXMUS) GXMUS.open(); }, 'm-music')));
      },
      help: function (S) {
        var row = [btn('How to play', function () { GX.close(); GXH.rules(phase()); }, 'm-rules')];
        S.appendChild(GX.row('Read', row));
        var gt = null; try { var w = document.createElement('div'); w.innerHTML = GXT.menuHTML({ game: 'emberclimb', first: false, cls: 'gx-sb', launch: function () { GX.close(); UI.ov = null; UI.tutStart(); } }); gt = w.firstChild; } catch (e) { }
        if (gt) { var sp = gt.querySelector('span'); if (sp) sp.remove(); S.appendChild(GX.row('Tutorial', gt)); }
        try { S.appendChild(GXH.settingsRow({ rowClass: 'gx-row', btnClass: 'gx-sb' })); } catch (e) { }
      },
      about: { name: 'Emberclimb', version: '1.0', text: 'An original card-climbing roguelike. Names, text and art are our own.' }
    });
  };
  boot();
})();

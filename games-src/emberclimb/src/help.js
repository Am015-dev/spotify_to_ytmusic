// Emberclimb shell wiring: help kit rules cards (the old rules overlay text), the Menu (gx-kit settings), drawers. Same pattern as the other shelf games.
(function () {
  var D = EC.D, E = EC.E;
  function g() { return E.G(); }
  // ---- rules cards (shared help kit): the old "How to climb" text, split into short cards; phase = where the player is
  var IC = { climb: '\u26F0', turn: '\u2694', intent: '\uD83D\uDC41', status: '\u2620', reward: '\uD83C\uDCCF', rest: '\uD83D\uDD25', duo: '\uD83D\uDC65', map: '\uD83D\uDDFA', boss: '\uD83D\uDC51', shop: '\uD83D\uDED2', event: '\u2753' };
  function svg(k) { return function () { return '<svg viewBox="0 0 100 60" width="100%" height="100%" aria-hidden="true"><text x="50" y="46" font-size="44" text-anchor="middle">' + IC[k] + '</text></svg>'; }; }
  var TURN = { title: 'How a turn works', text: '1. Above the enemy: what it does next.\n2. Tap a glowing card, then tap again to play.\n3. Cards cost energy (gold coin): 3 a turn.\n4. Tap End turn: the enemy acts step by step.\n5. Enemy at 0 HP: you win and pick a card.', pic: svg('turn') };
  var R = [
    TURN, Object.assign({}, TURN, { phase: ['map', 'battle', 'reward', 'rest', 'shop', 'event', 'over'] }),
    { title: 'The climb', text: 'Walk up the map room by room. Glowing rooms are your next step. Beat the boss at the top to win.', pic: svg('climb') },
    { title: 'Your turn', text: 'You draw 5 cards and have 3 energy each turn. Tap a card once to lift it, again to play it. Pick a target if asked.', pic: svg('turn') },
    { title: 'Read the intent', text: 'Enemies show what they will do next. Block cancels attacks. Out of energy? End your turn.', pic: svg('intent') },
    { title: 'Status effects', text: 'Vulnerable (max 3): takes double damage from the next attack. Weak (max 3): each of its hits deals 1 less damage. One is used up per attack; Weak against Vulnerable cancels both. Poison: 1 HP per token at end of turn, stays. Dice: 1-2 low, 3-4 middle, 5-6 high.', pic: svg('status') },
    { title: 'After a fight', text: 'Pick 1 of 3 new cards, or skip to keep your deck lean.', pic: svg('reward') },
    { title: 'Rest and shop', text: 'Campfires heal or upgrade a card. Shops sell cards, relics and potions for gold.', pic: svg('rest') },
    { title: 'Two heroes', text: 'Two heroes share the map and take turns. Pass the screen.', pic: svg('duo') },
    { phase: 'map', title: 'Pick a room', text: 'Glowing rooms are your next step. Fights give cards, campfires heal, shops sell, ? rooms are events.', pic: svg('map') },
    { phase: 'map', title: 'The boss', text: 'The crown room at the top is the boss. Beat it to win the climb.', pic: svg('boss') },
    { phase: 'battle', title: 'Play cards', text: 'Tap a card once to lift it, again to play it. Pick a target if asked. You have 3 energy a turn.', pic: svg('turn') },
    { phase: 'battle', title: 'Intent and block', text: 'The icon over an enemy is its next move. Block cancels attacks this turn.', pic: svg('intent') },
    { phase: 'battle', title: 'Status effects', text: 'Vulnerable: takes double damage. Weak: each hit deals 1 less. One used per attack. Poison: 1 HP per token each turn, it stays.', pic: svg('status') },
    { phase: 'reward', title: 'Pick a card', text: 'Add one of three cards to your deck, or skip to keep it lean. A sharper deck climbs higher.', pic: svg('reward') },
    { phase: 'rest', title: 'Campfire', text: 'Heal some HP, or smith to upgrade one card. Pick one.', pic: svg('rest') },
    { phase: 'shop', title: 'Shop', text: 'Tap an item to see it, then Buy. Cards, relics and potions cost gold.', pic: svg('shop') },
    { phase: 'event', title: 'Event', text: 'A choice with a price or a prize. Read each option, then pick one.', pic: svg('event') },
    { title: 'Tabletop or Gentle', text: 'Two difficulties on the setup screen.\nTabletop (rulebook) is the default. It uses the rulebook numbers. It is hard.\nGentle is an easier mode made for this screen. It is NOT the rulebook.\nGentle: 5 times your HP, start with 3 Healing Draughts, Rest heals 8 (not 3).\nFoes are exactly the same on both.', pic: svg('climb') },
    { title: 'How close to the tabletop', text: 'Numbers are the tabletop numbers (a Strike deals 1, a hero has about 10 HP).\nAct 1 foes use their printed tabletop cards. Act 2, Act 3 and final foes are our own.\nNames, card text and art are our own.\nPick 1 act, 3 acts, or 3 acts and the final boss.\nEvery card has its own upgrade.\nThe map is generated, not a printed board. Some cards and events roll a die.\nPotions drop by chance after fights. You hold 3 per hero; some relics add a slot.\n1 or 2 heroes, not 4.', pic: svg('climb') }
  ];
  function phase() { var gg = g(); if (!gg || (window.UI && UI.mode === 'title')) return null; return gg.scr === 'over' ? null : gg.scr; }
  UI.phase = phase;

  // F1: Hint bulb = one real move: the bot's best play, explained in a short line (rules sheet only when there is nothing to suggest)
  function suggest() {
    var E = EC.E, D = EC.D, G = E.G(); if (!G || !window.UI || UI.mode !== 'game' || UI.busy) return null;
    var q = function (s) { return document.querySelector(s); };
    if (G.scr === 'battle' && G.b && G.b.ph === 'p' && !G.b.scry) {
      var hi = G.b.cur, h = G.hs[hi], inc = 0;
      G.b.en.forEach(function (e, i) { if (!e.dead && e.intent && e.intent.atk && (e.intent.all || e.intent.tg === hi)) { try { inc += E.previewHit(i, hi) * (e.intent.hits || 1); } catch (x) { } } });
      var need = Math.max(0, inc - h.blk), best = null;
      try { best = E.aiMove(function () { return 0.99; }); } catch (x) { best = null; }
      if (need > 0) {   // a hit is coming: point at the biggest playable Block card
        var bi = -1, bb = 0; h.hand.forEach(function (c, i) { var ef = E.eff(c); if (!E.canPlay(h, c) || (ef.cost !== 'X' && E.cost(h, c) > h.en)) return; var b = 0; ef.ops.forEach(function (o) { if (o[0] === 'blk') b += o[1]; }); if (b > bb) { bb = b; bi = i; } });
        if (bi >= 0 && (!best || best.t !== 'play' || need >= h.hp * 0.3 || need > 1)) { var bc = q('.hand .card[data-c="' + bi + '"]'); if (bc) return { target: bc, why: need + ' damage is coming. Block with ' + E.eff(h.hand[bi]).name + '.' }; }
      }
      if (best && best.t === 'play') {
        var c = h.hand[best.c], ef = E.eff(c), el = q('.hand .card[data-c="' + best.c + '"]'); if (!el) return null;
        var foe = best.e != null ? G.b.en[best.e] : null, fn = foe ? D.ENEMIES[foe.id].name : '', k = ef.ops.map(function (o) { return o[0]; });
        var dmg = 0; ef.ops.forEach(function (o) { if (o[0] === 'dmg' || o[0] === 'all') dmg += o[1]; if (o[0] === 'hit') dmg += o[1] * o[2]; });
        var why = k.indexOf('vuln') >= 0 ? 'Play ' + ef.name + ' first: Vulnerable doubles the next hit.'
          : foe && dmg >= foe.hp + foe.blk ? 'Play ' + ef.name + ' on ' + fn + ': it finishes it.'
          : (k.indexOf('str') >= 0 || k.indexOf('power') >= 0) ? 'Play ' + ef.name + ' early: it pays off every turn.'
          : k.indexOf('weak') >= 0 || k.indexOf('weakAll') >= 0 ? 'Play ' + ef.name + ': Weak foes hit for less.'
          : k.indexOf('poison') >= 0 || k.indexOf('poisonAll') >= 0 ? 'Play ' + ef.name + ': Poison hurts every turn.'
          : need > 0 && k.indexOf('blk') >= 0 ? 'Play ' + ef.name + ': Block the ' + need + ' coming.'
          : dmg ? 'Play ' + ef.name + (fn ? ' on ' + fn : '') + ' for ' + dmg + ' damage.' : 'Play ' + ef.name + ' now.';
        return { target: el, why: why };
      }
      var eb = q('#end'); if (eb) return { target: eb, why: need > 0 ? 'Nothing more helps now. End your turn.' : 'Out of good plays. End your turn.' };
      return null;
    }
    if (G.scr === 'map') {
      var lowhp = G.hs.some(function (x) { return x.hp < x.mhp * 0.5; }), nodes = [].slice.call(document.querySelectorAll('#map .node.glow')); if (!nodes.length) return null;
      var pref = lowhp ? ['r', 's', 'v', 'm', 't', 'e'] : ['m', 'v', 't', 'e', 's', 'r'], pick = null;
      pref.some(function (t) { pick = nodes.filter(function (n) { return n.classList.contains('t-' + t); })[0]; return !!pick; }); pick = pick || nodes[0];
      var say = { r: 'Low on HP: a campfire heals you.', m: 'A fight: win a new card.', e: 'An elite: hard, but a relic waits.', s: 'A shop: spend your gold.', v: 'An event: a choice with a prize.', t: 'Treasure: a free relic.' };
      var t0 = (pick.className.match(/t-(\w)/) || [])[1]; return { target: pick, why: lowhp && t0 !== 'r' ? 'Low on HP: play it safe here.' : (say[t0] || 'Go here next.') };
    }
    if (G.scr === 'reward') { var pc = q('.picks .card'); if (pc) return { target: pc, why: 'Take a card that fits your deck, or skip.' }; }
    return null;
  }
  function boot() {
    GX.init({ key: 'ec' });
    UI.rulesOpen = function () { try { GX.close(); } catch (e) { } GXH.rules(phase()); };
    document.getElementById('rulesB').addEventListener('click', UI.rulesOpen);
    GXH.init({ game: 'emberclimb', defaultOn: false, steps: {}, rules: R });
    GXH.bulb({ el: '#bulbbtn', rulesFor: phase, suggest: suggest, finger: false });   // F1: a real move, not the rules sheet
    GX.onResize(function () { try { UI.fit && UI.fit(); } catch (e) { } });
    UI.kitMenu();
  }
  // ---- Menu: gx-kit settings (Rules, Tutorial, Restart, Sound, Music, Title + the shared sections)
  UI.kitMenu = function () {
    var cbtn = function (label, fn, id) { var b = btn(label, function () { if (b.getAttribute('data-sure')) { fn(); return; } b.setAttribute('data-sure', '1'); b.textContent = 'Sure? Tap again'; setTimeout(function () { try { b.removeAttribute('data-sure'); b.textContent = label; } catch (e) { } }, 4000); }, id); return b; };
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
          r2.push(cbtn('Restart', function () { GX.close(); if (UI.camp && UI.camp.setup) { var d = UI.camp; UI.camp = null; UI.fin = 0; UI.campStart(d); } else { UI.restart(); } }, 'm-restart'));
          r2.push(cbtn(UI.camp ? 'Leave chapter' : 'Leave run', function () { GX.close(); UI.ov = null; UI.leave(); }, 'm-leave'));
        }
        if (UI.mode !== 'title') r2.push((inRun && gg.scr !== 'over' ? cbtn : btn)('Title screen', function () { GX.close(); UI.ov = null; if (UI.camp) { UI.campExit(); } else { UI.mode = 'title'; UI.sub = ''; UI.render(); } }, 'm-title'));
        if (r2.length) S.appendChild(GX.row('Leave', r2));
      },
      sound: function (S) {
        S.appendChild(GX.row('Sound', GX.onoff(SND.on, function (v) { if (v !== SND.on) SND.toggle(); if (window.GXMUS) GXMUS.sync(); })));
        S.appendChild(GX.row('Music', btn('Pick the songs…', function () { if (window.GXMUS) GXMUS.open(); }, 'm-music')));
      },
      help: function (S) {
        var row = [btn('How to play', function () { GX.close(); GXH.rules(phase()); }, 'm-rules')];
        S.appendChild(GX.row('Read', row));
        var gt = null; try { var w = document.createElement('div'); w.innerHTML = GXT.menuHTML({ game: 'emberclimb', first: false, cls: 'gx-sb', launch: function () { GX.close(); UI.ov = null; setTimeout(function () { UI.tutStart(); }, 350); } }); gt = w.firstChild; } catch (e) { }
        if (gt) { var sp = gt.querySelector('span'); if (sp) sp.remove(); S.appendChild(GX.row('Tutorial', gt)); }
        try { S.appendChild(GXH.settingsRow({ rowClass: 'gx-row', btnClass: 'gx-sb' })); } catch (e) { }
      },
      about: { name: 'Emberclimb', version: '1.0', text: 'An original card-climbing roguelike. Names and text are our own. Temporary pictures use glyphs from game-icons.net (artists Lorc, Delapouite, Carl Olsen, Sbed, Lucas, Caro Asercion and others), CC BY 3.0, creativecommons.org/licenses/by/3.0, until the finished art arrives.' }
    });
  };
  boot();
})();

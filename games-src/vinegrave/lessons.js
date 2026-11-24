// Vinegrave: scenario lessons on the shared engine (shell/gx-scenario-tutor.js, docs shell/GXST.md).
// Each lesson stacks a real 2-seat table (the real engine VG), scripts the rival (he always passes), and judges the real state.
// RULE -> LESSON:
//   play a card, it does its effect; one main action a turn ............................................. L1 play (Play a card)
//   each camp has its own reward (tablet, compass, ...); a card you pay with leaves your hand ........ L2 dig (Dig a camp)
//   each travel icon is paid by one card; Boat cards pay Boat or Boot ................................ L3 travel (Pay the travel)
//   two coins buy a Plane, and a Plane pays any travel icon .......................................... L4 plane (Buy a Plane)
(function () {
  if (!window.GXST) return;
  var $ = function (s) { return document.querySelector(s); };
  var L = { on: false, n: 0, bought: null, passed: false, c0: 0 };   // n = my own main actions in this lesson (for par)
  var me = function () { return G.p[0]; };
  var site = function (id) { return G.sites.filter(function (s) { return s.id === id; })[0]; };
  var siteEl = function (id) { var i = G.sites.indexOf(site(id)); return document.querySelectorAll('.site')[i] || null; };
  var ready = function () { return typeof G !== 'undefined' && typeof startGame === 'function' && typeof VG !== 'undefined' && typeof VAI !== 'undefined' && typeof render === 'function'; };
  var settled = function () { return !!G && !UI.busy && ((G.phase === 'play' && VG.actor(G) === 0) || G.phase === 'over'); };
  var handEl = function () { return $('#hand .cd.glow') || $('#hand .cd'); };

  // start a lesson table: seat 0 is me, seat 1 the scripted rival; fix(G) rewrites my hand, res, row and sites
  function stack(sp) {
    try { GX.close(); } catch (e) { }
    try { GXH.setEnabled(false); GXH.hide(); } catch (e) { }
    L.on = true; L.n = 0; L.bought = null; L.passed = false; L.c0 = 0;
    UI.fast = true;
    startGame('vs', { np: 2, lvl: 'easy', seed: sp.seed || 5 });
    if (sp.fix) sp.fix(G);
    render();
    return new Promise(function (r) { setTimeout(r, 400); });
  }

  var ok1 = function () { return me().res.compass >= 1 + L.c0; };
  var ok2 = function () { return me().res.tablet >= 1; };
  var ok3 = function () { var w = site('c-wreck'), c = site('c-cove'); return (!!w && w.occ === 0) || (!!c && c.occ === 0); };
  var ok4 = function () { var w = site('c-wreck'); return !!w && w.occ === 0; };

  var lessons = [
    { id: 'play', title: 'Play a card', par: 1, moves: function () { return L.n; },
      rule: 'A played card does its effect. You get one main action a turn.',
      goal: 'Gain a compass this turn.',
      setup: function () { return stack({ fix: function (g) { L.c0 = g.p[0].res.compass; g.p[0].hand = ['dread', 'dread', 'grant', 'trail', 'trail']; } }); },
      success: ok1,
      fail: function () {
        if (ok1()) return false;
        if (L.passed) return 'Passing ends your round with nothing gained.';
        if (L.n >= 1) return 'That did not give a compass. Trail Notes give a compass, Patron Letters a coin.';
        return false;
      },
      hints: ['Which card says compass?', { say: 'Tap Trail Notes, then Play.', target: handEl }],
      debrief: 'A played card does its effect. You get one main action a turn.' },

    { id: 'dig', title: 'Dig a camp', par: 1, moves: function () { return L.n; },
      rule: 'Each camp has its own reward. A card you pay with leaves your hand.',
      goal: 'Dig where a tablet is waiting.',
      setup: function () { return stack({ fix: function (g) { g.p[0].hand = ['dread', 'grant', 'trail', 'dread', 'trail']; } }); },
      success: ok2,
      fail: function () {
        if (ok2()) return false;
        if (L.n >= 1) return 'That camp gave other goods, not a tablet. Each camp has its own reward.';
        return false;
      },
      hints: ['Read each camp. Which one pays a tablet?', { say: 'Tap Lookout Cliff, then Dig.', target: function () { return siteEl('c-cliff'); } }],
      debrief: 'Camp rewards differ. A card you pay with leaves your hand.' },

    { id: 'travel', title: 'Pay the travel', par: 1, moves: function () { return L.n; },
      rule: 'Each travel icon is paid by one card. Boat cards pay Boat or Boot.',
      goal: 'Dig at a camp that needs a Boat.',
      setup: function () { return stack({ fix: function (g) { g.p[0].hand = ['lamp', 'dread', 'dread', 'grant', 'trail']; } }); },
      success: ok3,
      fail: function () {
        if (ok3()) return false;
        if (L.n >= 1) return 'You dug a Boot camp. The goal was a Boat camp, which needs a Boat card.';
        return false;
      },
      hints: ['Which camps sit across water? Look for the ship icon.', { say: 'Dig the Old Wreck.', target: function () { return siteEl('c-wreck'); } }],
      debrief: 'Each travel icon is paid by one card. Boat cards pay Boat or Boot.' },

    { id: 'plane', title: 'Buy a Plane', par: 1, moves: function () { return L.n; },
      rule: 'Two coins buy a Plane. A Plane pays any travel icon.',
      goal: 'Dig the Old Wreck. You hold no Boat card.',
      setup: function () { return stack({ fix: function (g) { g.p[0].hand = ['dread', 'dread', 'trail', 'grant', 'trail']; g.p[0].res.coin = 2; } }); },
      success: ok4,
      fail: function () {
        if (ok4()) return false;
        if (L.n >= 1) return 'You did not reach the Old Wreck. Two coins buy a Plane, and a Plane pays any icon.';
        return false;
      },
      hints: ['You hold two coins. What can they buy?', { say: 'Buy a Plane, then dig the Old Wreck.', target: function () { return siteEl('c-wreck'); } }],
      debrief: '2 coins = a Plane. A Plane pays any travel icon.' },

    { id: 'discover', title: 'Find a ruin', par: 1, moves: function () { return L.n; },
      rule: 'Three compasses open a hidden ruin. Each ruin gives an idol.',
      goal: 'Discover a hidden ruin and take its idol.',
      setup: function () { return stack({ fix: function (g) { g.p[0].hand = ['dread', 'dread', 'grant', 'trail', 'trail']; g.p[0].res.compass = 3; } }); },
      success: function () { return me().idols.length >= 1; },
      fail: function () {
        if (me().idols.length >= 1) return false;
        if (L.n >= 1) return 'You dug a camp instead. A hidden ruin needs 3 compasses and gives an idol.';
        return false;
      },
      hints: ['Which hidden site is level one? Three compasses open it.', { say: 'Discover the hidden ruin.', target: function () { var s = G.sites.filter(function (x) { return x.lvl === 1 && !x.tile; })[0]; return s ? document.querySelectorAll('.site')[G.sites.indexOf(s)] : null; } }],
      debrief: 'Three compasses open a ruin: an idol (3 points) and loot. A guardian wakes there.' },

    { id: 'overcome', title: 'Beat a guardian', par: 1, moves: function () { return L.n; },
      rule: 'A guardian guards a ruin. Pay its cost to overcome it for points and a boon.',
      goal: 'Overcome the guardian on your ruin.',
      setup: function () { return stack({ fix: function (g) {
        var x = g.sites[5]; x.tile = g.s1.pop(); x.guard = g.guards.pop(); x.occ = 0;
        g.p[0].ex = 1; g.p[0].res = { coin: 5, compass: 5, tablet: 3, arrow: 3, jewel: 3 };
        g.p[0].hand = ['dread', 'dread', 'grant', 'trail', 'trail'];
      } }); },
      success: function () { return me().guards.length >= 1; },
      fail: function () {
        if (me().guards.length >= 1) return false;
        if (L.n >= 1) return 'You left the guardian. Unbeaten, it sends a Dread card home with you at round end.';
        return false;
      },
      hints: ['Its cost is on the ruin card. Can you pay it?', { say: 'Tap the guarded site, then overcome it.', target: function () { return document.querySelector('.site[data-i="5"]'); } }],
      debrief: 'Pay its cost: 5 points and a boon to use later. Leave it and Dread follows you home.' },

    { id: 'market', title: 'Buy a card', par: 1, moves: function () { return L.n; },
      rule: 'Items cost coins. Each card shows its points, so check before you buy.',
      goal: 'Buy the card worth 2 points.',
      setup: function () { return stack({ fix: function (g) {
        g.p[0].res.coin = 3;
        g.row[0] = 'ledger'; g.row[1] = 'journal'; g.row[2] = 'pickaxe'; g.row[3] = 'sextant'; g.row[4] = 'canteen';
        g.p[0].hand = ['dread', 'dread', 'grant', 'trail', 'trail'];
      } }); },
      success: function () { return L.bought === 'journal'; },
      fail: function () {
        if (L.bought === 'journal') return false;
        if (L.bought && L.bought !== 'journal') return 'That card is worth less. Check the points on each card.';
        return false;
      },
      hints: ['Which card in the market is worth two points?', { say: 'Buy the Journal.', target: function () { return document.querySelectorAll('#row .cd')[1] || null; } }],
      debrief: 'Items cost coins and go to the bottom of your deck. Some are worth end points.' },

    { id: 'research', title: 'Climb the track', par: 1, moves: function () { return L.n; },
      rule: 'The research track pays rewards at each row. The magnifier row pays the most.',
      goal: 'Gain 2 compasses from the research track.',
      setup: function () { return stack({ fix: function (g) {
        g.p[0].glass = 1; g.p[0].note = 0;
        g.p[0].res = { coin: 0, compass: 0, tablet: 1, arrow: 1, jewel: 0 };
        g.p[0].hand = ['dread', 'dread', 'grant', 'trail', 'trail'];
      } }); },
      success: function () { return me().glass === 2; },
      fail: function () {
        if (me().glass === 2) return false;
        if (L.n >= 1) return 'The notebook row pays a coin. The magnifier row 2 pays two compasses.';
        return false;
      },
      hints: ['Which track row pays compasses?', { say: 'Advance on the research track.', target: function () { return document.querySelector('#track'); } }],
      debrief: 'The magnifier leads. The notebook follows but never passes it. Each row pays a bonus.' }
  ];

  var go = function () {
    if (!ready()) { setTimeout(go, 200); return; }
    // the rival is scripted in a lesson: he always passes at once
    var oc = VAI.choose;
    VAI.choose = function (Gx, level) {
      if (L.on && GXST.active()) {
        var p = VG.moves(Gx).filter(function (m) { return m.t === 'pass'; })[0];
        if (p) return p;
      }
      return oc.apply(this, arguments);
    };
    // lessons never overwrite the saved game, and show no goal popup
    var osv = save; save = function () { if (!GXST.active()) return osv.apply(this, arguments); };
    var osg = showGoal; showGoal = function () { if (GXST.active()) return; return osg.apply(this, arguments); };
    // count my own main actions (free moves and answers do not count)
    var od = doMove; doMove = function (m) {
      if (L.on && VG.actor(G) === 0 && !m.free && m.t !== 'ans') {
        L.n++;
        if (m.t === 'buy') L.bought = G.row[m.r];
        if (m.t === 'pass') L.passed = true;
      }
      return od.apply(this, arguments);
    };
    var slot = document.createElement('div'); slot.id = 'gxst-slot'; slot.hidden = true; document.body.appendChild(slot);
    window.addEventListener('gxst', function (e) {
      if (e.detail.type === 'close' || e.detail.type === 'picker') L.on = false;
      else if (e.detail.type === 'start' || e.detail.type === 'retry') L.on = true;
    });
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-lessons-open]');
      if (b) { try { GX.close(); } catch (x) { } GXST.picker(); }
    });
    var KEEP = { play: [], dig: ['#map .site.l0'], travel: ['#map .site.l0'], plane: ['#map .site.l0'], discover: ['#map .site.l1'], overcome: ['#map .site.l1'], market: ['#row'], research: ['#track'] };
    var KC = ['.gx-bar', '#dock'];   // live list: the card keeps off the dock and only the board area the current lesson uses
    var setKC = function () { var id = (GXST.state() || {}).id, k = ['.gx-bar', '#dock'].concat(KEEP[id] || []); KC.length = 0; k.forEach(function (x) { KC.push(x); }); };
    window.addEventListener('gxst', function (e) { if (e.detail.type === 'start' || e.detail.type === 'retry') setKC(); });
    GXST.init({
      game: 'vinegrave', scenarios: lessons, qParent: '.gx-bar',
      keepClear: KC,
      phoneSlot: { after: '.gx-bar', before: '#dock', avoid: ['#dock', '#row', '#map'] },
      settled: settled
    });
    window.VGLessons = { open: function () { GXST.picker(); } };
    var q = /[?&]lesson=([^&]+)/.exec(location.search);
    if (q) GXST.start(decodeURIComponent(q[1]));
  };
  setTimeout(go, 300);
})();

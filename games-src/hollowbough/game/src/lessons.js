
// ===================== Hollowbough scenario lessons (GXST, shell/gx-scenario-tutor.js, docs shell/GXST.md) =====================
// They REPLACE the old dimming guided first game: tutStart (title card, Menu, Rules, first-time offer) now opens the lesson picker.
// Each lesson stacks a tiny real two-seat table (your goods, a few cards, Bramble's workers) with ONE goal; you play real moves on the real
// board and learn the rule from the consequence. Test: node hollowbough/game/lessons-test.js (phone + desktop, machine speed).
//
// RULE -> LESSON
//   one worker = one whole turn; a place pays what its text says; exclusive place ..... twig
//   shared place takes a second worker; a rival's exclusive place is locked ........... shared
//   forest places pay more than basic ones ............................................ forest
//   places that also draw cards ....................................................... draw
//   point tokens (Gossip Glade) ....................................................... points
//   playing a card from your hand costs goods and is a whole turn ..................... build
//   the meadow: buy a critter ......................................................... meadow
//   out of workers: Prepare brings the next season (Spring) ........................... prepare
// NOT taught here (gaps): events, Haven, Journey, Inn and destinations, Summer meadow draw, Autumn pass, special events, scoring breakdown, tie-break.
(function () {
  if (typeof GXST === 'undefined') return;
  var $ = function (s) { return document.querySelector(s); };
  var L = { opp: [], hand0: 0 };
  var me = function () { return G.players[0]; };
  var rv = function () { return G.players[1]; };
  var key = function (id) { return HB.cardKey(id); };
  var inCity = function (k) { return me().city.some(function (e) { return key(e.id) === k; }); };
  var placed = function () { return me().dep.length; };
  var rvName = function () { return G.players[1].name; };
  var ready = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof UI !== 'undefined' && typeof render === 'function' && typeof HB !== 'undefined' && typeof tutTake === 'function'; };
  var until = function (f, ms) { var t0 = Date.now(); return new Promise(function (r) { (function w() { var ok = false; try { ok = f(); } catch (e) { } if (ok || Date.now() - t0 > ms) r(ok); else setTimeout(w, 60); })(); }); };
  var tg = function (t) { return '[data-t="' + t + '"]'; };
  var handEl = function (k) { return function () { var id = me().hand.find(function (i) { return key(i) === k; }); return id == null ? null : $(tg('p:hand:' + id)); }; };
  var meadEl = function (k) { return function () { var id = G.meadow.find(function (i) { return i >= 0 && key(i) === k; }); return id == null ? null : $(tg('p:meadow:' + id)); }; };
  var BASIC = { berry: 0, dewberry: 1, amber: 2, pebble: 3, twig: 4, gossip: 5, resin: 6, kindling: 7 };

  // a two-seat deal from named cards; every card id stays used exactly once (taken from wherever it was)
  function stack(sp) {
    try { GX.close(); } catch (e) { } try { GXH.setEnabled(false); GXH.hide(); } catch (e) { }
    try { localStorage.setItem('hb_hints', '0'); } catch (e) { }
    UI.noGoal = true; UI.seed = 5; UI.opt = { np: 2, level: 'normal', solo: 1 }; newGame('vs'); UI.fingerSeen = true; UI.coach = { level: 'off', seen: {} }; UI.coachOn = false;
    clearTimeout(UI.tm); clearTimeout(UI.tr);
    var g = G, p = g.players[0], r = g.players[1], used = [], i;
    while (p.hand.length) g.discard.push(p.hand.pop());
    (sp.hand || []).forEach(function (k) { var id = tutTake(g, k, used); p.hand.push(id); used.push(id); });
    while (p.hand.length < 3) { var f = tutTake(g, ['master_lathwright', 'stonecrown_keep', 'flintpit'][p.hand.length % 3], used); p.hand.push(f); used.push(f); }   // a spare card nobody can afford
    p.res = { twig: 0, resin: 0, pebble: 0, berry: 0 }; for (var k in (sp.res || {})) p.res[k] = sp.res[k];
    r.res = { twig: 0, resin: 0, pebble: 0, berry: 0 };
    p.dep = []; r.dep = []; p.workers = sp.w || 2; r.workers = sp.rw || 2; p.season = 0; r.season = 0; p.pts = 0; r.pts = 0;
    (sp.rdep || []).forEach(function (n) { r.dep.push({ k: 'basic', i: BASIC[n] }); });
    if (sp.forest) g.forest = sp.forest;
    if (sp.meadow) { var t = tutTake(g, sp.meadow, used); var old = g.meadow[2]; if (old >= 0) g.discard.push(old); g.meadow[2] = t; }
    g.cur = 0; g.first = 0; g.q = null; g.nolog = true; g.tale = false;
    L.opp = sp.opp || ['pebble', 'resin']; L.hand0 = p.hand.length;
    UI.mmc = null; UI.hsx = 0; render(); schedule();
    return until(function () { return UI.started && HB.actor(G) === 0 && !UI.animBusy && !UI.cards.length && document.querySelectorAll('#bd .hc').length; }, 8000)
      .then(function () { return new Promise(function (res) { setTimeout(res, 500); }); });
  }
  var lessons = [
    { id: 'twig', title: 'Place a worker', rule: 'A turn is one action. Placing a worker takes what the place says. An exclusive place holds one worker.', par: 1,
      goal: 'Take 3 twigs with one worker.',
      setup: function () { return stack({}); },
      success: function () { return me().res.twig >= 3; },
      fail: function () { return placed() && me().res.twig < 3 ? 'That place pays less. Twig Heap pays 3 twigs.' : false; },
      hints: ['Read what each place pays. One of them pays 3 twigs.', { say: 'Place a worker on Twig Heap.', target: tg('w:basic:' + BASIC.twig) }],
      debrief: 'One worker, one turn, 3 twigs.' },
    { id: 'shared', title: 'Shared places', rule: 'A shared place takes more than one worker. Other places hold only one.', par: 1,
      goal: function () { return rvName() + ' holds the Pebble Bank and the Berry Patch. Take a berry.'; },
      setup: function () { return stack({ rdep: ['pebble', 'berry'], rw: 2 }); },
      success: function () { return me().res.berry >= 1; },
      fail: function () { return placed() && me().res.berry < 1 ? 'No berry there. Only the Berry Patch is shared: you may join ' + rvName() + ' on it.' : false; },
      hints: ['The Pebble Bank is locked. Which place says Shared?', { say: 'Join the Berry Patch. It is shared.', target: tg('w:basic:' + BASIC.berry) }],
      debrief: 'Shared places take a second worker. Locked places stay locked.' },
    { id: 'forest', title: 'Forest places', rule: 'Forest places pay more than the basic places. They sit in the forest strip.', par: 1,
      goal: 'Take 3 berries with one worker.',
      setup: function () { return stack({ forest: [6, 1, 5] }); },
      success: function () { return me().res.berry >= 3; },
      fail: function () { return placed() && me().res.berry < 3 ? 'Too few. Bumper Bramble in the forest pays 3 berries.' : false; },
      hints: ['A basic berry place pays only 1. Look in the forest.', { say: 'Place a worker on Bumper Bramble.', target: tg('w:forest:0') }],
      debrief: 'Forest places pay more: 3 berries from one worker.' },
    { id: 'draw', title: 'Draw cards', rule: 'Some places also draw cards. Your hand holds up to 8.', par: 1,
      goal: 'Take a berry AND draw a card with one worker.',
      setup: function () { return stack({}); },
      success: function () { return me().res.berry >= 1 && me().hand.length > L.hand0; },
      fail: function () { return placed() && !(me().res.berry >= 1 && me().hand.length > L.hand0) ? (me().res.berry >= 1 ? 'A berry, but no card. Dewberry Nook gives both.' : 'Not that one. Dewberry Nook gives a berry and a card.') : false; },
      hints: ['Some places say "draw 1 card" in their text.', { say: 'Place a worker on Dewberry Nook.', target: tg('w:basic:' + BASIC.dewberry) }],
      debrief: 'A berry and a new card, from one worker.' },
    { id: 'points', title: 'Point tokens', rule: 'Points win the game. Gossip Glade gives a point token and 2 cards.', par: 1,
      goal: 'Score your first point token.',
      setup: function () { return stack({}); },
      success: function () { return me().pts >= 1; },
      fail: function () { return placed() && me().pts < 1 ? 'That place gives goods, not points. Gossip Glade gives a point token.' : false; },
      hints: ['Which place text says "point token"?', { say: 'Place a worker on Gossip Glade.', target: tg('w:basic:' + BASIC.gossip) }],
      debrief: 'A point token on your score, plus 2 cards.' },
    { id: 'build', title: 'Build a card', rule: 'Playing a card from your hand costs goods and is a whole turn. It goes in your city.', par: 1,
      goal: 'Play the Bramble Allotment from your hand. You hold its cost.',
      setup: function () { return stack({ hand: ['bramble_allotment'], res: { twig: 2, resin: 1 } }); },
      success: function () { return inCity('bramble_allotment'); },
      fail: function () { return placed() && !inCity('bramble_allotment') ? 'A worker is a whole turn. To build, tap the card in your hand.' : false; },
      hints: ['Cards cost goods. You hold 2 twigs and 1 resin.', { say: 'Tap the Bramble Allotment in your hand.', target: handEl('bramble_allotment') }],
      debrief: 'Cost paid, card in your city: it will make berries.' },
    { id: 'meadow', title: 'The meadow', rule: 'The meadow holds 8 cards anyone may buy. A critter costs goods like any card.', par: 1,
      goal: 'Buy the Reedpunt Toad from the meadow with your 2 berries.',
      setup: function () { return stack({ meadow: 'reedpunt_toad', res: { berry: 2 } }); },
      success: function () { return inCity('reedpunt_toad'); },
      fail: function () { return placed() && !inCity('reedpunt_toad') ? 'A worker is a whole turn. To buy, tap the Reedpunt Toad in the meadow.' : false; },
      hints: ['The meadow is the row of cards by the board.', { say: 'Tap the Reedpunt Toad in the meadow.', target: meadEl('reedpunt_toad') }],
      debrief: 'Bought from the meadow: a new critter in your city.' },
    { id: 'prepare', title: 'Prepare for Spring', rule: 'With no workers left you Prepare: workers come home, you gain a worker, and the next season starts.', par: 2,
      goal: 'Take 3 twigs, then Prepare for Spring.',
      setup: function () { return stack({ w: 1, rw: 1, opp: ['pebble'] }); },
      success: function () { return me().season >= 1 && me().res.twig >= 3; },
      fail: function () { return placed() && me().res.twig < 3 ? 'That place pays less. Twig Heap pays 3 twigs.' : false; },
      hints: ['Your one worker goes first. After it, nothing is left to place.', { say: 'Twig Heap first, then the Prepare button.', target: function () { return $(tg('prep')) || $(tg('w:basic:' + BASIC.twig)); } }],
      debrief: 'Spring: workers back, one more worker, and you keep your goods.' }
  ];
  lessons.forEach(function (s) { s.moves = function () { return placed() + me().city.length + me().season; }; });

  var go = function () {
    if (!ready() || typeof GXST.init !== 'function') { setTimeout(go, 200); return; }
    // Bramble plays the lesson's script: her listed places, then Prepare or whatever is legal; lesson games are never saved or scored
    var oc = HB.AI.choose; HB.AI.choose = function (g, seat) {
      if (GXST.active() && g === G && seat === 1) {
        var mv = HB.moves(g, 1), pick = null;
        if (g.q) { var st = mv.find(function (m) { return m.type === 'choose' && /^Stop/.test(m.label || ''); }); return st || mv[0]; }
        for (var i = 0; i < L.opp.length && !pick; i++) pick = mv.find(function (m) { return m.type === 'worker' && m.k === 'basic' && m.i === BASIC[L.opp[i]]; });
        pick = pick || mv.find(function (m) { return m.type === 'worker' && m.k === 'basic'; }) || mv.find(function (m) { return m.type === 'prepare'; }) || mv.find(function (m) { return m.type === 'pass'; }) || mv[0];
        if (pick) return pick;
      }
      return oc.apply(this, arguments);
    };
    var os = save; save = function () { if (!GXST.active()) return os.apply(this, arguments); };
    // title card, Menu, Rules and the first-time offer all open the same lesson picker (no floating tour any more)
    tutStart = function () { try { GX.close(); } catch (e) { } closePop(); GXST.picker(); };
    tutOffer = function () { return false; };
    tutDone = function () { try { var b = JSON.parse(localStorage.getItem('gxst-hollowbough') || '{}').best || {}; return Object.keys(b).length >= lessons.length; } catch (e) { return false; } };
    GXST.init({ game: 'hollowbough', scenarios: lessons, storageKey: 'gxst-hollowbough', keepClear: ['#bd .tile', '#bd .strip.hand', '#bd .strip.city', '#acts'],
      settled: function () { return !!G && !UI.animBusy && !UI.cards.length && !G.q && HB.actor(G) === 0 && !UI.sel; } });
    var rq = /[?&]lessons=1/.test(location.search); if (rq) GXST.picker();
  };
  setTimeout(go, 300);
})();

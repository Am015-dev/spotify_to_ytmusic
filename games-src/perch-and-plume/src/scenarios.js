// Perch & Plume: scenario lessons on the shared engine (shell/gx-scenario-tutor.js, docs shell/GXST.md, spec orch/TUTORIAL-SPEC.md).
// Seven tiny real positions, one rule each: the player makes a real choice, the consequence shows, a wrong move fails with a reason.
// They replace the floating-lesson window (lessons.js keeps only the "?" screen map). Link to one lesson: ?lesson=<id>.
// RULES TAUGHT -> id: play a bird + food cost (play), forest = food (food), grassland = eggs + nest limits (eggs), wetland = cards (cards),
// egg cost by space (eggcost), brown powers fire with their row (brown), round goal (goal).
(function () {
  if (!window.GXST) return;
  var ready = function () { return typeof G !== 'undefined' && typeof startGame === 'function' && typeof PP !== 'undefined' && typeof PPAI !== 'undefined' && typeof UI !== 'undefined' && typeof render === 'function'; };
  var L = { cubes: 0 };
  var me = function () { return G.pl[0]; }, rival = function () { return G.pl[1]; };
  var nBirds = function (p) { return p.board[0].length + p.board[1].length + p.board[2].length; };
  var used = function () { return L.cubes - me().cubes; };   // actions spent so far
  var idle = function () { return G && !G.q && G.phase !== 'over'; };
  var until = function (f, ms) { var t0 = Date.now(); return new Promise(function (r) { (function w() { var ok = false; try { ok = f(); } catch (e) { } if (ok || Date.now() - t0 > ms) r(ok); else setTimeout(w, 60); })(); }); };
  var plainCol = function (id) { var c = PP.power(id).col; return !c || c === 'brown'; };   // no white (play-time) power: nothing fires when it lands
  var bd = function (fn) { return PP.DATA.birds.filter(function (b) { return plainCol(b.id) && fn(b); }); };
  var only = function (h, c, extra) { return function (b) { return b.h === h && b.c.length === 1 && b.c[0] === c && (!extra || extra(b)); }; };
  // a 2-seat game from named birds; every card id still exists once (taken from the deck, tray and hands), so the engine's invariants hold
  function stack(sp) {
    try { GX.close(); } catch (e) { } try { GXH.setEnabled(false); GXH.hide(); } catch (e) { }
    ['title', 'setup', 'result', 'pass'].forEach(function (id) { var e = $('#' + id); if (e) e.hidden = true; });
    var ids = {};
    startGame({ seats: [{ name: 'You', kind: 'human', face: 'you' }, { name: 'Fern', kind: 'ai', lvl: 'easy', face: 'pip' }], mode: 'vs', seed: sp.seed || 7, rounds: 4, cubes: [8], goals: sp.goals, first: 0,
      prep: function (Gx) {
        PP.performMove(Gx, PPAI.setup(Gx, 0), 0); PP.performMove(Gx, PPAI.setup(Gx, 1), 1);
        var take = function (id) { [Gx.deck, Gx.disc].forEach(function (a) { var k = a.indexOf(id); if (k >= 0) a.splice(k, 1); }); var t = Gx.tray.indexOf(id); if (t >= 0) Gx.tray[t] = null; Gx.pl.forEach(function (p) { var k = p.hand.indexOf(id); if (k >= 0) p.hand.splice(k, 1); for (var h = 0; h < 3; h++) p.board[h] = p.board[h].filter(function (s) { return s.id !== id; }); }); return id; };
        var P = Gx.pl[0], Q = Gx.pl[1];
        Gx.pl.forEach(function (p) { p.hand.slice().forEach(function (id) { Gx.deck.push(id); }); p.hand = []; p.board = [[], [], []]; p.food = { grub: 0, seed: 0, fish: 0, berry: 0, rodent: 0 }; });
        var slot = function (id, eggs) { return { id: take(id), eggs: eggs || 0, cache: 0, tuck: 0 }; };
        (sp.board || []).forEach(function (r, h) { P.board[h] = r.map(function (x) { return slot(x[0], x[1]); }); });
        (sp.rboard || []).forEach(function (r, h) { Q.board[h] = r.map(function (x) { return slot(x[0], x[1]); }); });
        P.hand = (sp.hand || []).map(take); for (var f in (sp.food || {})) P.food[f] = sp.food[f];
        Q.hand = []; Q.food = { grub: 1, seed: 1, fish: 1, berry: 1, rodent: 1 };
        if (sp.tray) { Gx.tray = sp.tray.map(function (id) { return id ? take(id) : null; }); Gx.tray.forEach(function (id, i) { if (!id) Gx.tray[i] = Gx.deck.shift(); }); }
        if (sp.deckTop) sp.deckTop.slice().reverse().forEach(function (id) { Gx.deck.unshift(take(id)); });
        Gx.feeder = (sp.feeder || ['seed', 'fish', 'berry', 'grub', 'rodent']).slice();
        P.cubes = sp.cubes; Q.cubes = 6; L.cubes = sp.cubes;
        Gx.cur = 0; Gx.first = 0; Gx.fx = []; Gx.tut = true;
      } });
    try { UI.coach && (UI.coach.level = 'off'); } catch (e) { }
    return until(function () { return G && !UI.busy && PP.sideToAct(G) === 0 && document.querySelector('#acts .a4'); }, 8000).then(function () { return new Promise(function (r) { setTimeout(r, 500); }); });
  }
  var hid = function (id) { return function () { var e = document.querySelector('#hand .bc[data-id="' + id + '"]') || $$('#hand .bc').filter(function (x) { return x.textContent; })[0]; return e; }; };
  var ract = function (h) { return function () { return document.querySelector('.ract[data-h="' + h + '"]'); }; };
  var B = {};   // birds chosen once, by rule, so ids stay stable per page
  var pickOnce = function (k, fn) { if (!B[k]) { var a = bd(fn); B[k] = a.length ? a[0].id : null; } return B[k]; };
  function lessons() {
    var seedF = pickOnce('seedF', only('F', 'seed')), fishW = pickOnce('fishW', only('W', 'fish')), fishW2 = pickOnce('fishW2', function (b) { return b.h === 'W' && b.c.length === 1 && b.c[0] === 'fish' && b.id !== B.fishW; });
    var seedG = pickOnce('seedG', function (b) { return b.h === 'G' && b.c.length === 1 && b.c[0] === 'seed'; });
    var seedG2 = pickOnce('seedG2', function (b) { return b.h === 'G' && b.c.length === 1 && b.c[0] === 'seed' && b.id !== B.seedG; });
    var bowlF = pickOnce('bowlF', function (b) { return b.h === 'F' && b.e >= 3 && b.c.length === 1 && b.id !== B.seedF; });
    var seedF2 = pickOnce('seedF2', function (b) { return b.h === 'F' && b.c.length === 1 && b.id !== B.seedF && b.id !== B.bowlF; });   // any single-cost forest bird: only one plain seed bird exists in the forest
    var seedG3 = pickOnce('seedG3', function (b) { return b.h === 'G' && b.c.length === 1 && b.id !== B.seedG && b.id !== B.seedG2; });
    var gSmall = pickOnce('gSmall', function (b) { return b.h === 'G' && b.e === 1; }) || seedG2, gBig = pickOnce('gBig', function (b) { return b.h === 'G' && b.e >= 4 && b.id !== B.gSmall; });
    var costly = PP.DATA.birds.filter(function (b) { return plainCol(b.id) && b.h === 'W' && b.c.length >= 2 && b.c.indexOf('seed') < 0; }).slice(0, 3).map(function (b) { return b.id; });
    var cacheF = bd(function (b) { return b.h === 'F' && b.pw === 'cacheS'; }).slice(0, 2).map(function (b) { return b.id; });
    var cost = function (id) { return PP.DATA.birds.find(function (b) { return b.id === id; }).c[0]; };
    var fd = function () { var f = {}; [].slice.call(arguments).forEach(function (id) { f[cost(id)] = 2; }); return f; };   // food that pays for the named birds
    return [
      { id: 'play', title: 'Play a bird', rule: 'Birds join your board only with Play a bird, and you pay the food on the card.', par: 1,
        goal: 'Get a bird onto your board.',
        setup: function () { return stack({ hand: [fishW, seedF], food: { seed: 1 }, cubes: 4 }); },
        success: function () { return nBirds(me()) >= 1; },
        fail: function () { return idle() && used() >= 1 && nBirds(me()) === 0 ? 'That used a row, not a bird. You hold one seed: Play a bird, pick the bird that costs seed.' : false; },
        hints: ['You hold one seed. Which bird costs seed?', { say: 'Tap Play a bird, then the seed bird, then its space.', target: function () { return document.querySelector('#acts .a4[data-k="play"]'); } }],
        debrief: 'Food paid, bird on the board. Every later rule builds on this.' },
      { id: 'food', title: 'Forest: food', rule: 'The forest row gains food from the birdfeeder: take the food your birds cost.', par: 1,
        goal: 'Gain the food your bird costs.',
        setup: function () { return stack({ hand: [fishW], cubes: 4 }); },
        success: function () { return me().food.fish >= 1; },
        fail: function () { return idle() && used() >= 1 && me().food.fish < 1 ? 'No fish. Food comes from the forest row, and the bird in your hand costs a fish.' : false; },
        hints: ['Read the cost on your bird. Which row gives food?', { say: 'Use the forest row, then take the fish die.', target: ract(0) }],
        debrief: 'Forest row, fish die: now you can pay for the bird.' },
      { id: 'eggs', title: 'Grassland: eggs', rule: 'The grassland row lays eggs. Each bird holds only so many (its nest limit).', par: 1,
        goal: 'Put 3 eggs on your birds.',
        setup: function () { return stack({ board: [[], [[gSmall], [gBig]], []], cubes: 4 }); },
        success: function () { return PP.eggsOn(me()) >= 3; },
        fail: function () { return idle() && used() >= 1 && PP.eggsOn(me()) < 3 ? (PP.eggsOn(me()) === 0 ? 'No eggs. Only the grassland row lays eggs.' : 'Not 3 eggs. One bird holds a single egg; put the others on the bird with room.') : false; },
        hints: ['Which row lays eggs? Look at the habitat names.', { say: 'Use the grassland row, then tap birds with room.', target: ract(1) }],
        debrief: 'Three eggs: 1 point each, and they pay for later birds.' },
      { id: 'cards', title: 'Wetland: cards', rule: 'The wetland row draws bird cards, from the tray or the deck.', par: 1,
        goal: 'Draw a bird you can play with your seed.',
        setup: function () { return stack({ food: { seed: 1 }, tray: [costly[0], seedF, costly[1]], deckTop: [costly[2]], cubes: 4 }); },
        success: function () { return PP.playable(G, 0).length > 0; },
        fail: function () { return idle() && used() >= 1 && !PP.playable(G, 0).length ? 'You hold one seed and that bird costs more. Draw the one that costs seed.' : false; },
        hints: ['You hold one seed. Which tray bird costs seed?', { say: 'Use the wetland row, then take the seed bird from the tray.', target: ract(2) }],
        debrief: 'Wetland row, the bird you can pay for: ready to play next turn.' },
      { id: 'eggcost', title: 'Egg cost', rule: 'The second space in a row costs 1 egg: lay an egg first, then play.', par: 2,
        goal: 'Play the bird from your hand into the forest.',
        setup: function () { return stack({ board: [[[bowlF]], [], []], hand: [seedF2], food: fd(seedF2), cubes: 3 }); },
        success: function () { return me().board[0].length >= 2; },
        fail: function () { return idle() && used() >= 2 && me().board[0].length < 2 ? 'Out of tries: the second space costs 1 egg and you had none. Lay an egg first.' : false; },
        hints: ['The tag above the free space shows its cost. What do you need first?', { say: 'Use the grassland row to lay an egg, then Play a bird.', target: ract(1) }],
        debrief: 'Egg first, bird second: the 2nd space costs 1 egg.' },
      { id: 'brown', title: 'Brown powers', rule: 'Using a row fires every brown power in it, right to left.', par: 1,
        goal: 'Store 2 food on your birds with one action.',
        setup: function () { return stack({ board: [[[cacheF[0]], [cacheF[1]]], [], []], cubes: 4 }); },
        success: function () { return PP.birds(me()).reduce(function (a, x) { return a + x.s.cache; }, 0) >= 2; },
        fail: function () { return idle() && used() >= 1 && PP.birds(me()).reduce(function (a, x) { return a + x.s.cache; }, 0) < 2 ? 'Nothing stored. Brown powers fire only when you use the row they sit in: the forest.' : false; },
        hints: ['Your birds sit in one habitat. Use that row.', { say: 'Use the forest row: each bird stores food as it fires.', target: ract(0) }],
        debrief: 'One action, two powers: that is your engine.' },
      { id: 'goal', title: 'Round goal', rule: 'Each round has a goal: most of the named thing scores. Play toward it.', par: 1,
        goal: 'Take the lead on the round goal.',
        setup: function () { return stack({ goals: ['birds-G', 'birds-F', 'birds-W', 'eggs-G'], board: [[], [[seedG, 1]], []], rboard: [[], [[seedG2]], []], hand: [seedF2, seedG3], food: fd(seedF2, seedG3), cubes: 4 }); },
        success: function () { return me().board[1].length > rival().board[1].length; },
        fail: function () { return idle() && used() >= 1 && me().board[1].length <= rival().board[1].length ? 'Level, not ahead. The goal counts grassland birds; that bird went to the forest.' : false; },
        hints: ['Read the round goal. Where do you both stand?', { say: 'Play a bird that lives in the grassland.', target: function () { return document.querySelector('#acts .a4[data-k="play"]'); } }],
        debrief: 'One more grassland bird than Fern: you lead the goal.' }
    ];
  }
  var go = function () {
    if (!ready()) { setTimeout(go, 200); return; }
    // Fern plays a quiet script (draws cards) so your board and the feeder stay as the lesson set them; lesson games are never saved
    var oc = PPAI.choose; PPAI.choose = function (Gm, seat, lvl) { if (GXST.active() && Gm === G && seat === 1 && !Gm.q) return { t: 'act', a: 'cards' }; return oc.apply(this, arguments); };
    var os = save; save = function () { if (!GXST.active()) return os.apply(this, arguments); };
    var ls = lessons();
    window.PPSCN = { ids: ls.map(function (s) { return s.id; }) };
    GXST.init({ game: 'perch-and-plume', scenarios: ls, phoneSlot: { after: '.gx-bar', before: '#feeder', avoid: ['#feeder', '#tray', '#hand', '#acts', '.ract'] }, keepClear: ['#acts', '#hand', '#feeder', '#tray', '.row', '.ract', '#trk'], settled: function () { return !!G && !UI.busy && (G.phase === 'over' || PP.sideToAct(G) === 0); } });
    // on a phone the card would sit over the birdfeeder: fold it to its one-line chip after each start (tap the chip for Hint / Restart)
    addEventListener('gxst', function (e) { if (e.detail && (e.detail.type === 'start' || e.detail.type === 'retry') && innerWidth < 600) setTimeout(function () { var b = document.querySelector('.gxst-card [aria-label*="inimi"],.gxst-card .gxst-min'); if (b) b.click(); }, 60); });
    var m = /[?&]lesson=([\w-]+)/.exec(location.search);
    if (m) until(function () { return !$('#title').hidden; }, 4000).then(function () { setTimeout(function () { GXST.start(m[1]); }, 100); });
  };
  window.ppScenarioStart = function () { if (!window.GXST || !GXST.picker) return false; GXST.picker(); return true; };
  var boot = function () { if (!ready()) { setTimeout(boot, 200); return; } go(); }; boot();
})();

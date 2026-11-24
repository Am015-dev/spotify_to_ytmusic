// Vale of Banners scenario lessons (GXST, shell/gx-scenario-tutor.js, docs shell/GXST.md, spec orch/TUTORIAL-SPEC.md). They REPLACE the old dimming
// walkthrough: UI.tutStart now opens the lesson picker. Each lesson stacks a tiny real table (your dice, storage, goods, a few stall tiles, a few
// built spaces) with ONE goal; you play real moves on the real board and learn the rule from the consequence.
// Test: node vale-of-banners/tools/lessons-test.js (402x874 and 1366x768).
//
// RULE -> LESSON (every rule a first season needs):
//   a die takes from the stall with its number; storage; tiles come one at a time ................ take
//   a tile goes on a space of its colour, touching your land, with the die's number ............... build
//   a full region scores (bigger regions more, earlier seasons more); a Mine, Barge, Keep space ..... region
//   Pasture: animals of one kind in one meadow add up; kinds are scored apart ...................... pasture
//   goods sell by number, all of one kind together, 2 points each (players) + silver ................ sell
//   workers bend a die by 1 (6 wraps to 1); 2 workers for a die; die plays cost workers ............. bend
//   back lane: costs silver, needs no die, once a turn ............................................ lane
//   Moot Hall: a free second build at any number; Buildings do their job when built .............. hall
//   Barge: loads all goods of one stall, moves you up the banner track (turn order) ............... barge
//   a short season: 5 rounds' worth of turns, rival, mines pay, final points, winner ............. game
// NOT taught here (gaps, listed in the report): Keep free action, Lore tiles, colour-complete bonus, storage overflow (discard),
// season end mine income beyond what the short game shows, tie-break, white die crate drop, 3-4 player and team games.
(function () {
  if (!window.GXST) return;
  var $ = function (s) { return document.querySelector(s); };
  var L = { n: 0, on: false, uid: 0, base: 0 };
  var ready = function () { return typeof G !== 'undefined' && typeof startGame === 'function' && typeof UI !== 'undefined' && typeof render === 'function' && typeof VB !== 'undefined'; };
  var me = function () { return G.P[0]; };
  var isTower = function (t) { return t && t.t === 'bld' && t.k === 'tower'; };
  var has = function (f) { return me().store.some(f); };
  var spent = function () { return me().used[0] && me().used[1]; };
  var filled = function () { return VB.estateFilled(me()); };
  var rival = function () { return G.seats[1].name; };
  // named tiles
  var TL = { tower: { t: 'bld', k: 'tower' }, hall: { t: 'bld', k: 'hall' }, inn: { t: 'bld', k: 'inn' }, mint: { t: 'bld', k: 'mint' }, mine: { t: 'mine' }, ship: { t: 'ship' }, keep: { t: 'castle' },
    sheep2: { t: 'pas', k: 'sheep', n: 2 }, sheep3: { t: 'pas', k: 'sheep', n: 3 }, goat3: { t: 'pas', k: 'goat', n: 3 } };
  var tile = function (n) { var x = JSON.parse(JSON.stringify(TL[n])); x.id = 'ls' + (++L.uid); return x; };
  var tab = function (id) { return function () { var e = $('#tab-' + id); return e && e.offsetParent ? e : null; }; };
  // build the real game, then overwrite the table: dice, workers, silver, goods, stalls ({d: [tile, tile]}), back lane, built spaces, storage
  function stage(sp) {
    try { GX.close(); } catch (e) { } try { GXC.close(); } catch (e) { } try { GXH.setEnabled(false); GXH.hide(); } catch (e) { }
    UI.cq = []; UI.cBusy = false; UI.seen = {}; UI.hintsOn = false; try { hintSync(); } catch (e) { }   /* the lightbulb on the lesson card is the only help */
    startGame({ n: 2, seed: sp.seed || 5, ai: 'easy', mode: 'lesson', phases: sp.phases, rounds: sp.rounds, noBlack: sp.free ? false : !sp.lane, names: { 1: (window.VSTORY && VSTORY.rival && VSTORY.rival.name) || 'Tobin' } });
    $('#start').hidden = true; $('#tv').hidden = true; $('#rs').hidden = true;
    if (sp.free) { L.n = 0; L.on = true; L.base = 0; return; }
    var p = me(); G.order = [0, 1]; G.ti = 0; p.arr = 2; G.P[1].arr = 1;
    p.dice = sp.dice.slice(); p.used = [false, false]; p.workers = sp.workers || 0; p.silver = sp.silver == null ? 1 : sp.silver; p.vp = 0; p.bought = false;
    p.goods = {}; Object.keys(sp.goods || {}).forEach(function (g) { p.goods[g] = sp.goods[g]; });
    p.store = (sp.store || []).map(tile);
    Object.keys(sp.estate || {}).forEach(function (c) { p.estate[c] = tile(sp.estate[c]); });
    for (var d = 1; d <= 6; d++) { G.depots[d] = []; for (var k = 0; k < VB.depotSize(G); k++) G.depots[d].push(sp.stalls && sp.stalls[d] && sp.stalls[d][k] ? tile(sp.stalls[d][k]) : null); G.goodsAt[d] = (sp.crates && sp.crates[d] || []).slice(); }
    G.black = G.black.map(function () { return null; }); (sp.lane || []).forEach(function (n, k) { G.black[k] = tile(n); });
    G.rg = [0, 0, 0, 0, 0]; G.pend = [];
    G.P[1].dice = [1, 1]; G.P[1].used = [false, false];
    UI.bump = {}; UI.sel = null; UI.die = null; UI.chain = 0; UI.tab = sp.tab || 'estate'; UI.pinTab = UI.tab;
    L.n = 0; L.on = true; L.base = filled();
    render();
  }
  var stallTile = function (d, k) { return function () { return $('#mt-' + d + '-' + (k || 0)); }; };
  var lessons = [
    { id: 'take', title: 'Take a tile', rule: 'A die takes a tile from the market stall with the same number. The tile goes into your storage.', par: 1,
      goal: 'Put the Beacon Tower in your storage.',
      setup: function () { stage({ tab: 'market', dice: [4, 2], stalls: { 4: ['tower'], 2: ['ship'] } }); },
      success: function () { return has(isTower); },
      fail: function () { if (has(isTower)) return false; if (me().store.length) return 'You took the Barge. A die takes only from the stall with its own number: the Tower is on stall 4.'; return spent() ? 'Both dice are spent and the Tower is still on the stall. Match a die to the stall number.' : false; },
      hints: ['Which stall holds the Tower? Which of your dice has that number?', { say: 'Tap the Tower on stall 4, then take it with your 4.', target: stallTile(4) }],
      debrief: 'Your 4 took from stall 4: the die number picks the stall.' },
    { id: 'build', title: 'Build on your land', rule: 'Build a stored tile on a space of its colour that touches your land and shows the die number.', par: 2,
      goal: 'Build the Beacon Tower on your land.',
      setup: function () { stage({ tab: 'estate', dice: [4, 5], store: ['tower'] }); },
      success: function () { return filled() > L.base; },
      fail: function () { return filled() <= L.base && spent() ? 'Both dice are spent. A Building goes on a Building space next to your land whose number matches the die: only the 4 fits.' : false; },
      hints: ['Which Building space next to your Keep shows a number you have?', { say: 'Tap the Tower in storage, then the glowing space numbered 4.', target: function () { return UI.sel == null ? $('#st-0') : $('#ec-11'); } }],
      debrief: 'Colour, touching, number: the Tower fits space 4 beside your Keep.' },
    { id: 'region', title: 'Fill a region', rule: 'A region scores the moment every space of it is built. Big regions and early seasons pay more.', par: 1,
      goal: 'Score 10 points with one build.',
      setup: function () { stage({ tab: 'estate', dice: [2, 4], store: ['mine', 'tower'] }); },
      success: function () { return me().vp >= 10; },
      fail: function () { var v = me().vp; return v > 0 && v < 10 ? 'That scored only ' + v + '. A region pays when every space of it is full: the Mine space stands alone, so one Mine fills it.' : (spent() ? 'Both dice are spent with no region filled. The lone Mine space is a whole region.' : false); },
      hints: ['One space on your land is a region all by itself. Which colour?', { say: 'Build the Mine on the single grey Mine space, number 2.', target: function () { return UI.sel == null ? $('#st-0') : $('#ec-12'); } }],
      debrief: 'A region of one is full at once: 1 + 10 season bonus.' },
    { id: 'pasture', title: 'Pasture animals', rule: 'Animals of one kind in one meadow add up when you place them. Other kinds score apart.', par: 1,
      goal: 'Score 5 points from animals.',
      setup: function () { stage({ tab: 'estate', dice: [1, 6], store: ['goat3', 'sheep3'], estate: { 12: 'mine', 13: 'sheep2' } }); },
      success: function () { return me().vp >= 5; },
      fail: function () { var v = me().vp; return v > 0 && v < 5 ? 'That scored ' + v + '. Goats score apart from Sheep: only Sheep beside your 2 Sheep add to 5.' : (spent() ? 'Both dice are spent. Place the 3 Sheep beside your 2 Sheep in the meadow.' : false); },
      hints: ['You already own 2 Sheep in the meadow. Which new tile joins them?', { say: 'Place the 3 Sheep next to your Sheep: 3 + 2 = 5.', target: function () { return UI.sel == null ? $('#st-1') : $('#ec-7'); } }],
      debrief: 'Sheep joined Sheep: 3 + 2 = 5 points. The Goats would have scored 3.' },
    { id: 'sell', title: 'Sell goods', rule: 'A die sells every goods tile of its number at once: 2 points each, plus 1 silver.', par: 1,
      goal: 'Earn 4 points by selling goods.',
      setup: function () { stage({ tab: 'estate', dice: [3, 1], goods: { 3: 2, 1: 1 } }); },
      success: function () { return me().vp >= 4; },
      fail: function () { var v = me().vp; return v > 0 && v < 4 ? 'You sold one tile for ' + v + '. Every tile of a kind sells together, 2 points each: the two Honey tiles pay 4.' : false; },
      hints: ['Count the tiles in each pile. Which pile pays more?', { say: 'Tap your 2 Honey, then sell with the 3.', target: function () { return $('#gd-3'); } }],
      debrief: 'Two Honey tiles, 2 points each: 4 points and 1 silver.' },
    { id: 'bend', title: 'Bend a die', rule: 'A worker moves a die up or down by 1, and 6 wraps round to 1. You can also swap a die for 2 workers.', par: 1,
      goal: 'Take the Barge from stall 1.',
      setup: function () { stage({ tab: 'market', dice: [6, 3], workers: 1, stalls: { 1: ['ship'], 3: ['mine'] } }); },
      success: function () { return has(function (t) { return t.t === 'ship'; }); },
      fail: function () { if (has(function (t) { return t.t === 'ship'; })) return false; if (me().store.length) return 'You took the Mine: the 3 fits stall 3 exactly, but the goal was the Barge on stall 1. A worker bends a die by 1 and 6 wraps to 1.'; return spent() ? 'Both dice are spent. Your 6 is one step from stall 1, so one worker bends it.' : false; },
      hints: ['No die shows 1. How far is your 6 from stall 1 going round?', { say: 'Tap the Barge on stall 1 and take it with the 6 and 1 worker.', target: stallTile(1) }],
      debrief: 'The 6 wraps to 1: one worker bent it, so no die was wasted.' },
    { id: 'lane', title: 'Back lane', rule: 'The back lane sells one tile a turn for silver. It needs no die.', par: 1,
      goal: 'Buy the Moot Hall without using a die.',
      setup: function () { stage({ tab: 'market', dice: [2, 5], silver: 2, lane: ['hall'] }); },
      success: function () { return has(function (t) { return t.k === 'hall'; }) && !me().used[0] && !me().used[1]; },
      fail: function () { return (me().used[0] || me().used[1]) && !has(function (t) { return t.k === 'hall'; }) ? 'You spent a die. The back lane costs 2 silver and needs no die, so both dice stay free.' : false; },
      hints: ['The long stall at the end sells tiles. What does it cost?', { say: 'Tap the Moot Hall in the back lane, then Buy for 2 silver.', target: function () { return $('#bl-0'); } }],
      debrief: 'Silver bought it, and both dice stay free for building.' },
    { id: 'hall', title: 'Moot Hall chain', rule: 'The Moot Hall lets you build one more stored tile at once, on any number. Buildings act when built.', par: 2,
      goal: 'Build two tiles with one die.',
      setup: function () { stage({ tab: 'estate', dice: [4, 5], store: ['hall', 'mine'] }); },
      success: function () { return filled() >= L.base + 2 && !(me().used[0] && me().used[1]); },
      fail: function () { return spent() && filled() < L.base + 2 ? 'Both dice are spent with one build. Build the Hall on its 4, then its bonus build ignores the number.' : false; },
      hints: ['Which tile gives a free extra build? Build it first.', { say: 'Build the Hall on space 4, then place the Mine with the free build.', target: function () { return UI.sel == null ? $('#st-0') : $('#ec-11'); } }],
      debrief: 'One die, two builds: the Hall chained the Mine for free.' },
    { id: 'barge', title: 'Barge and goods', rule: 'A Barge loads every goods tile from one stall and moves you up the banner track, so you play earlier.', par: 3,
      goal: 'Load the Linen crates from stall 3.',
      setup: function () { stage({ tab: 'estate', dice: [6, 2], store: ['ship'], estate: { 11: 'inn', 10: 'mint' }, crates: { 3: [5, 5], 5: [2] } }); },
      success: function () { return (me().goods[5] || 0) >= 2; },
      fail: function () { return spent() && !me().goods[5] ? 'Both dice are spent. A Barge sits on a Barge space touching your land, numbered like the die, then loads one stall.' : false; },
      hints: ['Which Barge space touches your buildings, and which die matches it?', { say: 'Build the Barge on the 6, then tap the crates on stall 3.', target: function () { return UI.sel == null ? $('#st-0') : $('#ec-4'); } }],
      debrief: 'The Barge loaded 2 Linen and moved you up the track.' },
    { id: 'game', title: 'A short season', rule: 'Take, build, sell and ship for points. Mines pay silver at season end. Spare silver and workers count at the end.', par: 0,
      goal: 'Play one short season and finish with 13 points.',
      setup: function () { stage({ free: 1, seed: 5, phases: 1, rounds: 3 }); },
      success: function () { return G.over && G.P[0].vp >= 13; },
      fail: function () { return G.over && G.P[0].vp < 13 ? 'You finished on ' + G.P[0].vp + '. Full regions score at once and sold goods add up: fill small regions first and try again.' : false; },
      hints: ['Fill small regions first: they score the moment they are full.', { say: 'Tap a glowing tile, or switch on Hints in the top bar for a starred best move.', target: function () { return $('#hintT'); } }],
      debrief: 'Regions and sales made the points: season done.' }
  ];
  var go = function () {
    if (!ready() || typeof GXST.init !== 'function') { setTimeout(go, 200); return; }
    // lesson games are never saved over the player's real game, and show no result screen
    var os = save; save = function () { if (!GXST.active()) return os.apply(this, arguments); };
    var osr = showResult; showResult = function () { if (!GXST.active()) return osr.apply(this, arguments); };
    var op = promptText; promptText = function () { var t = op.apply(this, arguments); if (!L.on || !GXST.active() || G.over || pend() || (me().used[0] && me().used[1])) return t; return 'Your move. Reach the goal on the lesson card.'; };   /* the dock line never gives the answer away */
    var od = doMove; doMove = function (m) { try { if (L.on && GXST.active() && G && isHuman(VB.actor(G)) && m && m.k !== 'end') L.n++; } catch (e) { } return od.apply(this, arguments); };
    lessons.forEach(function (s) { s.moves = function () { return L.n; }; });
    GXST.init({ game: 'vale-of-banners', scenarios: lessons, keepClear: ['.gx-bar', '#opp', '#tabs', '#mk', '#es', '#dicerow', '#store', '#goods', '#acts'].concat(innerWidth < 600 ? ['#dock'] : []), settled: function () { return !!G && !UI.busy; }, qParent: '.gx-bar', phoneSlot: { after: '#tabs', before: '#dock', avoid: ['#tabs', '#opp', '#mk > *', '[id^="ec-"]'] } });
    /* phone portrait: the dock and the estate fill the screen, so a lesson starts as the one-line goal chip (tap it for Hint and Restart) */
    addEventListener('gxst', function (e) { var t = e.detail && e.detail.type; if ((t === 'start' || t === 'retry') && innerWidth <= 600 && innerHeight > innerWidth) setTimeout(function () { var b = $('.gxst-card .gxst-ib[aria-label="Minimise"]'); if (b && GXST.state().phase === 'play') b.click(); }, 0); });
    window.VBLESSONS = { open: function () { try { GX.close(); } catch (e) { } try { GXC.close(); } catch (e) { } $('#start').hidden = true; GXST.picker(); } };
    if (/[?&]lessons=1/.test(location.search)) GXST.picker();
    var lq = /[?&]lesson=(\w+)/.exec(location.search); if (lq) { try { $('#start').hidden = true; } catch (e) { } GXST.start(lq[1]); }   // ?lesson=<id> opens that lesson directly (contact sheets, owner links)
  };
  setTimeout(go, 300);
})();

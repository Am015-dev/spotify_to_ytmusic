// Rampart & Vine: scenario tutorials on the shared engine (shell/gx-scenario-tutor.js, docs shell/GXST.md, spec orch/TUTORIAL-SPEC.md).
// Each lesson builds a small real position (pre-placed tiles and followers), gives the player one tile, one goal, and judges the real game.
// The old forced-tap tutorial (tutor.js) is retired: tutStart() now opens this picker. Nothing here is ever saved over a real game.
// Rules and the lesson that teaches each (the rest of the rules sit in the Help cards, see hlp.js HLP_RULES):
//   match edges, turn the tile ........ fit        one follower per turn, claim before you finish ... claim
//   finished town 2 a tile, banner +2 .. town       priory 9 when eight tiles ring it ................ priory
//   most followers take all ............ crowd      farmer: 3 per finished town, stays to the end .... farmer
//   unfinished features 1 a tile at end  open       a whole short game ............................... game
//   one owner per feature (crowd: the rival's follower blocks a claim), finished road 1 a tile (fit)
//   NOT yet a lesson: River, Taverns, Merchants (expansions, off in a normal game), the set-aside tile.
(function () {
  var tid = function (n) { for (var i = 0; i < TT.length; i++) if (TT[i].id === n) return i; throw new Error('no tile ' + n); };
  var seg = function (t, ty, n) { var c = 0; for (var i = 0; i < TSEG[t].length; i++) if (TSEG[t][i].ty === ty) { if (c === n) return i; c++; } return -1; };
  var T = { start: 'BA_RCr_start', J: 'BA_RRR', line: 'BA_RFr', bend: 'BA_Rr', edge: 'BA_C', bridge: 'BA_CFcp', pri: 'BA_L', corner: 'BA_Cc_1', wall: 'BA_Ccc', cr: 'BA_CRr', bridge2: 'BA_CFc_1', lane: 'BA_LR' };
  // ---- the positions. pre: [tile, x, y, rot] laid before the player's turn; figs: [seat, 'f', x, y, 'R'|'C'|'F'|'M', nth segment of that kind on the tile]
  //      hand: tiles the stack deals in order (the player's first); score: [you, rival]; opp: scripted rival turns [{x,y,r,fig:null|{ty,w|h}}]
  //      sol: the scripted solution (tests, hints): the tile spot and the follower (a {ty,w} / {ty,h} spot on the new tile, or 'skip')
  var SPECS = {
    fit: { pre: [[T.J, -1, 0, 0]], figs: [[0, 'f', 0, 0, 'R', 0]], hand: [T.J], sol: { x: 1, y: 0, r: 0, fig: 'skip' } },
    claim: { pre: [[T.line, 1, 0, 0], [T.J, 2, 0, 0]], figs: [], hand: [T.J], sol: { x: -1, y: 0, r: 0, fig: { ty: 'R', w: 1 } } },
    town: { pre: [[T.bridge, 0, -1, 1]], figs: [[0, 'f', 0, 0, 'C', 0]], hand: [T.edge], sol: { x: 0, y: -2, r: 2, fig: 'skip' } },
    priory: { pre: [['BA_RRR', -1, 0, 0], ['BA_RRR', 1, 0, 1], [T.pri, 0, 1, 0], ['BA_CRr', -1, 1, 2], ['BA_RFr', 1, 1, 3], ['BA_CRr', -1, 2, 0], ['BA_RFr', 0, 2, 2]], figs: [[0, 'f', 0, 1, 'M', 0]], hand: [T.bend], sol: { x: 1, y: 2, r: 1, fig: 'skip' } },
    crowd: { pre: [[T.bridge2, 0, -1, 1], [T.bridge2, 0, -2, 1]], figs: [[0, 'f', 0, 0, 'C', 0], [1, 'f', 0, -1, 'C', 0], [0, 'f', 0, -2, 'C', 0]], hand: [T.edge], sol: { x: 0, y: -3, r: 2, fig: 'skip' } },
    farmer: { last: 1, pre: [[T.edge, 0, -1, 2]], figs: [], hand: [T.line], sol: { x: 1, y: -1, r: 1, fig: { ty: 'F', h: 6 } }, bad: { x: 1, y: -1, r: 1, fig: { ty: 'F', h: 2 } } },
    open: { pre: [[T.bridge, 0, -1, 1]], figs: [[0, 'f', 0, 0, 'C', 0]], hand: [T.corner], last: 1, score: [0, 3], sol: { x: 0, y: -2, r: 2, fig: 'skip' } },
    game: { last: 1, pre: [], figs: [], hand: ['BA_Rr', 'BA_C', 'BA_RFr', 'BA_CRr', 'BA_Cc_1', 'BA_RFr', 'BA_C', 'BA_Rr', 'BA_RrC', 'BA_CRr', 'BA_C'], sol: null }
  };
  // ---- build: turn the freshly started game into the position (the engine's own place/figs, so every invariant still holds)
  function build(sp, ids) {
    G.stack.unshift(G.cur.t); G.turn = 0; G.log = []; G.logN = 0; G.cur = { p: G.np - 1 }; G.step = null;
    (sp.pre || []).forEach(function (a) { var t = tid(a[0]); if (!canPlace(t, a[3], a[1], a[2])) throw new Error('pre tile does not fit ' + a); place(t, a[3], a[1], a[2]); });
    for (var r in G.fd) { var F = G.fd[r]; if ((F.ty === 'C' || F.ty === 'R') && !F.oe.length) F.done = 1; }
    (sp.figs || []).forEach(function (a) { var Tl = G.tiles[key(a[2], a[3])], l = seg(Tl.t, a[4], a[5]); G.figs.push({ p: a[0], k: a[1], s: Tl.s0 + l }); G.pl[a[0]].sup[a[1]]--; });
    if (sp.score) sp.score.forEach(function (v, i) { G.pl[i].score = v; G.pl[i].sc.road = v; });
    if (!sp.last) for (var i = 0; i < 4; i++) G.stack.push(tid(T.bend));   // the valley goes on after your turn
    G.halfway = true; G.total = G.stack.length + G.order.length; nextPlayer(true); G.log = []; G.logN = 0;
  }
  var tiles = function (a) { return a.map(tid); };
  // the player's follower spot on the tile just placed: {ty,w} (a side of a road/town) or {ty,h} (a half-edge of a field), 'M' priory
  function figL(f) {
    var Tl = G.tiles[G.cur.k], i, s;
    for (i = 0; i < TSEG[Tl.t].length; i++) { s = TSEG[Tl.t][i]; if (s.ty !== f.ty) continue;
      if (f.ty === 'M') return i;
      if (f.ty === 'F') { if (s.h.some(function (h) { return (h + 2 * Tl.r) % 8 === f.h; })) return i; }
      else if (segWorld(Tl.t, Tl.r, i).indexOf(f.w) >= 0) return i; }
    return -1;
  }

  // ---------------------------------------------------------------- the lessons
  var $q = function (q) { return document.querySelector(q); };
  var me = function () { return G.pl[0]; }, rival = function () { return G.pl[1]; };
  var done1 = function () { return !!G && (G.over || G.turn >= 2); };   // your first turn is over
  var ready = function () { return typeof G !== 'undefined' && typeof beginGame === 'function' && typeof UI !== 'undefined' && typeof render === 'function' && typeof myTurn === 'function' && typeof onGlow === 'function'; };
  var until = function (f, ms) { var t0 = Date.now(); return new Promise(function (r) { (function w() { var ok = false; try { ok = f(); } catch (e) { } if (ok || Date.now() - t0 > ms) r(ok); else setTimeout(w, 60); })(); }); };
  var wasScored = function (ty) { for (var k in G.stats.scored) if (k.indexOf(ty) === 0) return true; return false; };
  // hint target: the tile to turn, the square, then the follower spot or Skip
  function spot(s) {
    return function () {
      if (!G || !G.cur) return null;
      if (G.step === 'fig') { if (s.fig === 'skip') return $q('#hskip'); var l = figL(s.fig), b = null; (UI.figs || []).forEach(function (e) { if (e._m.l === l && e._m.k === 'f') b = e; }); return b || $q('#hskip'); }
      if (UI.rot !== s.r) return $q('#htile');
      return $q('#world .glow[data-x="' + s.x + '"][data-y="' + s.y + '"]');
    };
  }
  function stage(id) {
    var sp = SPECS[id];
    try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } try { GXC.close(); } catch (e) { }
    var m = $q('#modal'); if (m) m.innerHTML = ''; try { closeMenu(); } catch (e) { }
    UI.camp = null; UI.coach = null; UI.tut = false; AIDELAY = window.__rvlFast ? 60 : 320; 
    beginGame({ np: 2, seats: ['human', 'ai'], lv: ['normal', 'easy'], ex: {}, seed: 7, stack: tiles(sp.hand), lesson: true });
    var g = $q('#goal'); if (g) g.remove();
    if (UI.aiT) clearTimeout(UI.aiT); UI.aiT = 0;
    build(sp); G.pl[1].nm = (typeof STORY !== 'undefined' && STORY.rival && STORY.rival.name) || G.pl[1].nm;
    resetUI(); UI.humanTurns = 0; refresh(); refit(false);
    return until(function () { return myTurn('place') && document.querySelectorAll('#world .glow').length && !UI.tw; }, 12000).then(function () { return new Promise(function (r) { setTimeout(r, 700); }); });
  }
  var S = SPECS;
  var lessons = [
    { id: 'fit', title: 'Close a road', rule: 'A road scores 1 point per tile once both ends are closed. Turn your tile to make it fit.',
      goal: 'Finish the road. Your follower is on it.',
      setup: function () { return stage('fit'); },
      success: function () { return done1() && me().score >= 3; },
      fail: function () { return done1() ? 'The road is still open. A road scores only when both ends are closed.' : false; },
      hints: ['Tap your tile to turn it. Which square closes the road?', { say: 'Close the open end here.', target: spot(S.fit.sol) }],
      debrief: 'Three tiles, three points. Your follower walks home.' },
    { id: 'claim', title: 'Claim first', rule: 'Only a follower on a road scores it. Claim as you close it, before the points are counted.',
      goal: 'Finish the road and score it. Nobody holds it yet.',
      setup: function () { return stage('claim'); },
      success: function () { return done1() && me().score >= 4; },
      fail: function () { return !done1() ? false : wasScored('road') ? 'You closed the road with no follower on it, so nobody scored.' : 'The road is still open. Close it, then claim it.'; },
      hints: ['Close the road, then look for a circle on your new tile.', { say: 'Close it here, then tap the road circle.', target: spot(S.claim.sol) }],
      debrief: 'Claimed as it closed: 4 tiles, 4 points. The follower comes home.' },
    { id: 'town', title: 'Banner town', rule: 'A finished town scores 2 per tile. Each banner adds 2 more.',
      goal: 'Close the town to score 8 points.',
      setup: function () { return stage('town'); },
      success: function () { return done1() && me().score >= 8; },
      fail: function () { return done1() ? 'The town is still open. It scores only when its last gap is closed.' : false; },
      hints: ['The town opens to the north. Turn your tile to cap it.', { say: 'Cap the town here.', target: spot(S.town.sol) }],
      debrief: 'Three tiles and one banner: 2 x 4 = 8.' },
    { id: 'priory', title: 'Priory ring', rule: 'A priory scores 9 once eight tiles surround it.',
      goal: 'Complete the ring round your priory.',
      setup: function () { return stage('priory'); },
      success: function () { return done1() && me().score >= 9; },
      fail: function () { return done1() ? 'A gap is left round the priory. It scores 9 only when all eight sides are filled.' : false; },
      hints: ['Count the tiles round the priory. Which side is empty?', { say: 'Fill the last gap here.', target: spot(S.priory.sol) }],
      debrief: 'Eight neighbours: 9 points, and the follower comes home.' },
    { id: 'crowd', title: 'Most followers', rule: 'The player with most followers in a town or road scores all of it. A tie scores for both.',
      goal: 'Close the town. Your two followers outnumber the rival.',
      setup: function () { return stage('crowd'); },
      success: function () { return done1() && me().score >= 8 && rival().score === 0; },
      fail: function () { return done1() ? 'The town is still open, so nobody scored yet.' : false; },
      hints: ['One end of the town is still open. Cap it.', { say: 'Cap the town here.', target: spot(S.crowd.sol) }],
      debrief: 'Two followers beat one: you scored all 8, the rival nothing.' },
    { id: 'farmer', title: 'Farmer', rule: 'A farmer stays until the end and scores 3 for each finished town beside his field.',
      goal: 'Place a farmer who scores 3 when the game ends.',
      setup: function () { return stage('farmer'); },
      success: function () { return !!G.over && me().end.field >= 3; },
      fail: function () { return G.over ? 'That farmer touches no finished town, so he scored nothing.' : false; },
      hints: ['The finished town is up north. Which field touches it?', { say: 'Lay it here, then tap the field next to the town.', target: spot(S.farmer.sol) }],
      debrief: 'One finished town beside the field: 3 points for the farmer.' },
    { id: 'open', title: 'Last tile', rule: 'At the end, unfinished roads and towns score 1 per tile. Banners count 1.',
      goal: 'Last tile: you trail 0 to 3. Finish ahead.',
      setup: function () { return stage('open'); },
      success: function () { return !!G.over && me().score > rival().score; },
      fail: function () { return G.over ? 'Not enough. Unfinished towns score 1 per tile, so make yours longer.' : false; },
      hints: ['Your open town scores 1 per tile. Make it longer.', { say: 'Extend your town here.', target: spot(S.open.sol) }],
      debrief: 'Four open tiles (with the banner) score 4 and beat 3.' },
    { id: 'game', title: 'A short game', rule: 'Lay tiles, claim roads and towns, close them for points. Most points wins.',
      goal: 'Win a short game: ten tiles, one rival.',
      setup: function () { return stage('game'); },
      success: function () { return !!G.over && me().score > rival().score; },
      fail: function () { return G.over ? 'The rival scored more. Put followers on what you close.' : false; },
      hints: ['Claim a road or town, then close it before the rival does.', { say: 'Tap the lightbulb in the menu for a suggested move.', target: '#htile' }],
      debrief: 'Claim, close, score. That is the whole game.' }
  ];
  // ---------------------------------------------------------------- wiring
  var booted = false, capT = 0;
  function boot() {
    if (booted) return window.__RVL; booted = true;
    GXST.init({ game: 'rampart-and-vine', scenarios: lessons, keepClear: ['#hand', '#seats', '#top', '#status'],
      settled: function () {
        if (!UI.cap) capT = 0; else if (!capT) capT = Date.now();
        return !!G && !UI.aiFly && !UI.tw && (!UI.cap || Date.now() - capT > 2200) && (!!G.over || myTurn() || done1());   // the score caption shows for 2 s, then the card judges
      } });   // judged when the score caption is gone, not after the rival's reply
    return window.__RVL;
  }
  window.__RVL = { SPECS: SPECS, build: build, tiles: tiles, figL: figL, tid: tid, lessons: lessons,
    open: function () { var go = function () { if (!ready()) { setTimeout(go, 200); return; } boot(); GXST.picker(); }; go(); } };
  // boot at load so the Lessons button is always there (and ?lessons=1 opens the picker, via GXST.init)
  (function early() { if (!ready() || !window.GXST) { setTimeout(early, 300); return; } boot(); })();
})();

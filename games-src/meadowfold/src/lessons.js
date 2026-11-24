// Meadowfold lessons: six short scenario games on the shared engine (shell/gx-scenario-tutor.js, docs shell/GXST.md).
// Each lesson stacks a tiny real position on the real engine (engine.js, ui.js), gives ONE goal, and judges the real state.
// Rule -> lesson:
//   take a whole pocket, place all three ... pocket
//   grey stacks up to 3 ..................... stack
//   trunks first, then leaves (tree) ........ tree
//   5 per field group of 2 or more .......... fields
//   side A river: longest water line ........ river
//   home ready: card, then its hex .......... animal
// Open with ?lesson=<id> to start one lesson directly.
(function () {
  if (!window.GXST) return;
  var L = { on: 0, n: 0 };   // n = my moves in this lesson (counted only while GXST.active())
  var ready = function () { return typeof G !== 'undefined' && typeof E === 'object' && typeof UI !== 'undefined' && typeof newGame === 'function' && typeof render === 'function' && typeof save === 'function' && typeof MF !== 'undefined'; };
  var s0 = function () { return G.seats[0]; };
  var cnt = function (board, col) { var n = 0; Object.keys(board).forEach(function (k) { board[k].forEach(function (c) { if (c === col) n++; }); }); return n; };
  var maxRun = function (board, col) { var best = 0; Object.keys(board).forEach(function (k) { var st = board[k], n = 0; st.forEach(function (c) { if (c === col) n++; }); if (n > best) best = n; }); return best; };
  var did = function () { return L.n > 0; };
  // ---- the position: a fresh 2-player game (fixed seed), then the pieces placed by hand; tokens and cards stay conserved
  function stack(sp) {
    UI.mode = 'quick';
    newGame({ np: 2, humans: 1, ai: 'easy', side: 'A', spirits: false, seed: 11, seats: [{ name: 'You', ai: null }, { name: 'Rival', ai: 'easy' }] });
    var g = G, i, k, id, board = {}, pk = sp.pockets || [], used = {};
    L.on = 1; L.n = 0;
    Object.keys(sp.board || {}).forEach(function (key) { board[key] = sp.board[key].slice(); });
    g.seats[0].board = board;
    g.seats[0].cubes = {}; g.seats[0].done = []; g.seats[0].turns = 0;
    g.seats[0].cards = (sp.cards || []).map(function (cid) { return { id: cid, left: E.card(cid).pts.length }; });
    g.seats[1].board = {}; g.seats[1].cubes = {}; g.seats[1].cards = []; g.seats[1].done = [];
    for (i = 0; i < g.central.length; i++) g.central[i] = pk[i] ? pk[i].slice() : [];
    g.turn = { took: sp.took == null ? -1 : sp.took, hand: (sp.hand || []).slice(), tookCard: false, swapped: false, placed: [] };
    if (sp.row) g.row = sp.row.slice();
    g.seats[0].cards.forEach(function (c) { used[c.id] = 1; });
    g.row.forEach(function (c) { used[c] = 1; });
    g.deck = [];
    for (id = 1; id <= 32; id++) if (!used[id]) g.deck.push(id);
    // pouch = every token minus the ones on boards, in pockets and in hand
    g.bag = Object.assign({}, MF.BAG);
    var place = function (t) { if (g.bag[t] > 0) g.bag[t]--; };
    g.seats.forEach(function (s) { Object.keys(s.board).forEach(function (kk) { s.board[kk].forEach(place); }); });
    g.central.forEach(function (p) { p.forEach(place); });
    g.turn.hand.forEach(place);
    g.box = 0; g.cur = 0; g.over = false; g.result = null; g.last = false; g.log = [];
    render();
    return new Promise(function (res) { setTimeout(res, 300); });
  }
  // ---- lessons: success judges the real state; fail names the consequence
  var lessons = [
    { id: 'pocket', title: 'Take a pocket', rule: 'Take one pocket, a whole pocket of 3 tokens, then place all three.', par: 5,
      goal: 'Place three grey tokens in one turn.',
      setup: function () { return stack({ pockets: [['water', 'field', 'build'], ['mount', 'mount', 'mount'], ['trunk', 'leaf', 'water']] }); },
      success: function () { return G && cnt(s0().board, 'mount') >= 3 && G.turn.hand.length === 0; },
      fail: function () { return G && G.turn.took >= 0 && G.turn.took !== 1 ? 'That pocket has no three greys; a pocket is taken whole.' : false; },
      hints: ['Look for the pocket with three grey tokens.', { say: 'Take the middle pocket: three greys. Then place all three.', target: '.pocket[data-pocket="1"]' }],
      debrief: 'You took a whole pocket and placed all three greys.' },
    { id: 'stack', title: 'Stack greys', rule: 'Grey stacks up to 3 on grey.', par: 4,
      goal: 'Build one peak three high.',
      setup: function () { return stack({ took: 0, hand: ['mount', 'mount', 'mount'] }); },
      success: function () { return G && maxRun(s0().board, 'mount') >= 3; },
      fail: function () { return G && G.turn.hand.length === 0 && maxRun(s0().board, 'mount') < 3 ? 'Grey stacks up to 3 on one hex; you spread them out.' : false; },
      hints: ['Grey goes on grey. Keep placing on the same hex.', { say: 'Stack all three greys on one hex.', target: '#map .hx.glow' }],
      debrief: 'Three greys on one hex make a peak of 3.' },
    { id: 'tree', title: 'Grow a tree', rule: 'Leaves go on 0-2 trunks; a tree of height 2 scores 3.', par: 4,
      goal: 'Grow a tree worth 3 points.',
      setup: function () { return stack({ took: 0, hand: ['trunk', 'trunk', 'leaf'] }); },
      success: function () { return G && E.score(s0()).trees >= 3 && G.turn.hand.length === 0; },
      fail: function () { return G && G.turn.hand.length === 0 && E.score(s0()).trees < 3 ? 'A leaf on bare ground is only a 1 point sapling: trunk first, then leaf.' : false; },
      hints: ['A leaf needs trunks underneath it. Plant a trunk first.', { say: 'Trunk, then the leaf on top: a tree of height 2 scores 3.', target: '#map .hx.glow' }],
      debrief: 'Trunk first, then a leaf on it: the tree scores.' },
    { id: 'fields', title: 'Fields', rule: '5 per group of 2 or more fields.', par: 4,
      goal: 'Score 5 points from fields.',
      setup: function () { return stack({ took: 0, hand: ['field', 'field', 'mount'] }); },
      success: function () { return G && E.score(s0()).fields >= 5 && G.turn.hand.length === 0; },
      fail: function () { return G && G.turn.hand.length === 0 && E.score(s0()).fields === 0 ? 'Fields score only when 2 or more touch.' : false; },
      hints: ['Two fields must touch to score.', { say: 'Put both fields on neighbouring hexes, then the grey.', target: '#map .hx.glow' }],
      debrief: 'Two touching fields are a group: 5 points.' },
    { id: 'river', title: 'River', rule: 'Side A scores the longest river path: 2, 5, 8, 11, 15.', par: 4,
      goal: 'Score 8 points with one river.',
      setup: function () { return stack({ board: { '2,2': ['water'] }, took: 0, hand: ['water', 'water', 'water'] }); },
      success: function () { return G && E.score(s0()).water >= 8 && G.turn.hand.length === 0; },
      fail: function () { return G && G.turn.hand.length === 0 && E.score(s0()).water < 8 ? 'Only the longest connected river scores: keep your water in one line.' : false; },
      hints: ['Water runs in one connected line.', { say: 'Lay each water next to the last, in one line from the drop.', target: '#map .hx.glow' }],
      debrief: 'A line of four water hexes makes a river of 8.' },
    { id: 'animal', title: 'Settle an animal', rule: 'When a card says Home ready, tap it and then the glowing hex; the animal moves in and scores.', par: 3,
      goal: 'Take a card that fits, then settle its animal.',
      setup: function () { return stack({ board: { '2,2': ['leaf'], '1,1': ['water'] }, took: 0, hand: [], cards: [], row: [5, 1, 3, 10, 12] }); },
      success: function () { return G && E.score(s0()).animals >= 2; },
      fail: function () { return G && s0().turns >= 1 ? 'The turn ended with no animal home: take a card whose habitat you built, then tap Home ready and the hex.' : false; },
      hints: ['Take a card whose habitat you have already built.', { say: 'Take that card, then tap Home ready and the glowing hex.', target: '#strip .acard.playable' }],
      debrief: 'The animal moved in and scored.' }
  ];
  lessons.forEach(function (s) { s.moves = function () { return L.n; }; });
  // ---- hooks while a lesson runs: count my moves, keep the real save untouched
  function hook() {
    var oa = E.apply;
    E.apply = function (m) { var mine = G && G.cur === 0; var ok = oa.apply(this, arguments); if (ok && mine && GXST.active()) L.n++; return ok; };
    var os = save;
    save = function () { if (GXST.active()) return; return os.apply(this, arguments); };
    window.MFL = { L: L, stack: stack, lessons: lessons };
  }
  var go = function () {
    if (!ready()) { setTimeout(go, 200); return; }
    hook();
    GXST.init({ game: 'meadowfold', scenarios: lessons, keepClear: ['#central', '#map', '#endB', '#strip', '#dockbody'], settled: function () { return typeof G !== 'undefined' && G && !UI.busy && G.cur === 0 && !G.over; } });
    var q = /[?&]lesson=([^&#]*)/.exec(location.search);
    if (q) {
      var st = document.getElementById('start'); if (st) st.hidden = true;
      GXST.start(decodeURIComponent(q[1]));
    }
  };
  setTimeout(go, 300);
})();

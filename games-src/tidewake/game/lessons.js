// Tidewake lessons: ten short scenario games on the shared engine (shell/gx-scenario-tutor.js, docs shell/GXST.md).
// Each lesson stacks a tiny real position (the game's own engine, the real board), gives ONE goal, scripts the rival and the dice, judges the real state.
// RULE -> LESSON TABLE (rules drawer texts.js RULES_HTML; engine.js):
//   goal: last junk afloat wins ........ push, game          | start marks, every junk starts before any tile ... mark
//   lay a tile: pick, turn, place ...... lay                 | the red cross: off the edge is not allowed ....... lay
//   sail on through other tiles ........ chain               | a tile at a junk's line end moves that junk too .. push
//   leviathans wake on 6, 7 or 8 ....... wake                | a leviathan at your bow, or on your tile, sinks you ... wake
//   Deck Cannon ........................ cannon              | Rift Gate escape ...................................... gate
//   Rogue Wave: roll its strength ...... wave                | a short real game ................................... game
//   NOT a lesson yet (rules drawer only): the 6 that raises a new leviathan, the minimum of three, a leviathan swimming off the chart,
//   the elimination-bonus swap, Maelstrom, teams, solo.
(function () {
  if (!window.GXST) return;
  var L = { on: 0, n: 0, roll: null, mon: {}, wdie: 5, co: null, startN: 0 };   // n = my moves in this lesson
  var COB = 1;
  var ready = function () { return typeof G !== 'undefined' && typeof startGame === 'function' && typeof render === 'function' && typeof UI !== 'undefined' && typeof PH !== 'undefined' && typeof defaultSetup === 'function' && typeof tutDie === 'function'; };
  var until = function (f, ms) { var t0 = Date.now(); return new Promise(function (r) { (function w() { var ok = false; try { ok = f(); } catch (e) { } if (ok || Date.now() - t0 > ms) r(ok); else setTimeout(w, 50); })(); }); };
  var me = function () { return G.ships[0]; }, rv = function () { return G.ships[COB]; };
  var dist = function (a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); };
  var did = function () { return L.n > 0; };
  // ---- the position: a fresh 2-captain game (fixed seed), then every piece placed by hand; every card id is still used exactly once
  function build(sp) {
    var g = G, np = g.np, i;
    g.q = null; g.ag = []; g.agI = 0; g.wave = null; g.arr = null; g.gates = []; g.bd = new Array(BW * BW).fill(null); g.limbo = null; g.pool = []; g.batch = []; g.placeElim = [];
    g.gone = []; g.refill = false; g.over = null; g.mq = []; g.bq = null; g.stats = {}; g.log = []; g.logN = 0; g.mgone = [];
    g.ships.forEach(function (s, k) { var d = (sp.ships || [])[k] || {}; s.alive = d.alive !== false; s.x = d.x == null ? null : d.x; s.y = d.y == null ? null : d.y; s.e = d.e == null ? null : d.e; s.on = d.on || null; s.moved = !!d.on; s.tp = null; s.out = ''; s.gc = 0; });
    (sp.bd || []).forEach(function (t) { g.bd[t[1] * BW + t[0]] = [t[2], t[3] || 0]; });
    g.mons = (sp.mons || []).map(function (m) { return { id: m.id, k: 'L', x: m.x, y: m.y, r: m.r || 0 }; });
    g.mdeck = []; for (i = 0; i < 10; i++) if (!g.mons.some(function (m) { return m.id === i; })) g.mdeck.push(i);
    if (g.exp.wave) { if (sp.wave) g.wave = { x: sp.wave.x, y: sp.wave.y, r: sp.wave.r, n: sp.wave.n || 0, owner: sp.wave.owner, pt: sp.wave.pt || 0 }; else g.mdeck.push(WAVE_ID); }
    g.hands = [0, 1, 2, 3, 4, 5, 6, 7].slice(0, np).map(function (k) { return ((sp.hands || [])[k] || []).slice(); });
    var used = {}; g.hands.forEach(function (h) { h.forEach(function (c) { used[c] = 1; }); }); g.bd.forEach(function (c) { if (c) used[c[0]] = 1; });
    var ids = []; for (i = 0; i < NCUR; i++) ids.push(i); if (g.exp.rift) ids.push(GATE_ID); if (g.exp.cannon) CANNON_IDS.forEach(function (c) { ids.push(c); });
    g.deck = ids.filter(function (c) { return !used[c]; });
    g.dice = sp.dice || [1, 2]; g.turn = sp.turn || 1;
    if (sp.setup) { g.phase = 'setup'; g.sp = sp.sp; g.cur = -1; g.step = null; }
    else { g.phase = 'play'; g.sp = np; g.cur = 0; g.step = 'act'; if (sp.bow) { g.cur = COB; g.step = null; g.ag = [{ h: 'turnStart', d: {} }]; } }
  }
  function stack(sp) {
    try { GX.close(); } catch (e) { } try { GXH.setEnabled(false); GXH.hide(); } catch (e) { }
    var s = defaultSetup(); s.mode = 'me'; s.np = 2; s.variant = null; s.noMon = false; s.exp = Object.assign({ rift: 0, wave: 0, maelstrom: 0, cannon: 0 }, sp.exp || {});
    s.seats[0] = { h: true, lv: 'normal', col: 0 }; s.seats[1] = { h: false, lv: 'easy', col: 3 };
    L.on = 1; L.n = 0; L.roll = sp.roll || null; L.mon = sp.mon || {}; L.wdie = sp.wdie || 5; L.co = sp.co || null; L.startN = 0;
    startGame(JSON.parse(JSON.stringify(s)), { first: sp.first == null ? 0 : sp.first, seed: 7, names: ['Vermilion', 'Cobalt'] });
    build(sp); UI.guide = 'off'; UI.sel = null; UI.busy = false; UI.sunk = []; UI.mph = null; PH.mphHide = null; UI.overSeen = 0; UI.dice = null; UI.res = null; UI.tut = 0;
    try { kitReset(); kitSync(); } catch (e) { }
    if (sp.bow) flow();
    render(); schedule();
    return until(function () { return !UI.busy && !G.ag.length && (sideToAct() === 0 || G.over); }, 12000).then(function () { return new Promise(function (r) { setTimeout(r, 900); }); });
  }
  // ---- each lesson's wrong answer says why, in the engine's own words
  var why = function () { var o = me().out || '', c = G.ships[COB].out || ''; if (!me().alive) return o; return c; };
  var lost = function (msg) { return function () { return !me().alive && did() ? msg : false; }; };
  var T = function (i) { return tvis('[data-a=card][data-t="' + i + '"],[data-ph=pcard][data-t="' + i + '"]'); };
  var lessons = [
    { id: 'mark', title: 'Set out', rule: 'Every junk picks a gold start mark on the edge before any tile is laid. Leviathans roam the chart, so start away from them.', par: 1,
      goal: 'Start at a mark at least 3 squares from every leviathan.',
      setup: function () { return stack({ setup: 1, first: 1, sp: 1, ships: [{}, { x: 5, y: 6, e: 5 }], mons: [{ id: 0, x: 1, y: 4 }, { id: 3, x: 5, y: 2 }, { id: 6, x: 3, y: 3 }], hands: [[4, 7, 5], [8, 9, 10]] }); },
      success: function () { var m = me(); return did() && m.alive && m.x != null && G.mons.every(function (l) { return dist(m, l) >= 3; }); },
      fail: function () { var m = me(); if (!did() || m.x == null) return false; if (!m.alive) return 'Your junk was lost. ' + why(); var l = G.mons.filter(function (v) { return dist(m, v) < 3; })[0]; return l ? 'A leviathan is only ' + dist(m, l) + ' squares from your start. When they wake it can reach your bow.' : false; },
      hints: ['Leviathans are the dark monsters on the chart. Look for a mark far from all three.', { say: 'The bottom middle is far from every leviathan.', target: function () { return tcell(3, 6); } }],
      debrief: 'Far from the leviathans, you have room to sail.' },
    { id: 'lay', title: 'Lay a current', rule: 'Pick a current tile, turn it, then Place it on the square in front of your junk. Your junk sails along its line.', par: 1,
      goal: 'Sail your junk one square north.',
      setup: function () { return stack({ ships: [{ x: 3, y: 6, e: 5 }, { x: 6, y: 0, e: 1 }], mons: [{ id: 1, x: 0, y: 2 }, { id: 5, x: 6, y: 3 }, { id: 8, x: 1, y: 4 }], hands: [[4, 7, 5], [8, 9, 10]] }); },
      success: function () { return did() && me().alive && me().x === 3 && me().y === 5; },
      fail: function () { return did() && me().alive && !(me().x === 3 && me().y === 5) ? 'Your junk sailed sideways. A tile only sends you where its line points: turn it first.' : lost('Your junk sailed off the chart.')(); },
      hints: ['One of your tiles can point north once you turn it.', { say: 'Take the third tile, turn it once, then Place.', target: function () { return T(2); } }],
      debrief: 'Pick, turn, place: the junk follows the line to its end.' },
    { id: 'chain', title: 'Chain the wake', rule: 'Your junk keeps sailing along every tile already laid, until it reaches an open end.', par: 1,
      goal: 'Sail three squares in one turn.',
      setup: function () { return stack({ ships: [{ x: 3, y: 6, e: 5 }, { x: 6, y: 0, e: 1 }], bd: [[3, 5, 0, 0], [3, 4, 2, 0]], mons: [{ id: 1, x: 0, y: 2 }, { id: 5, x: 6, y: 3 }, { id: 8, x: 1, y: 5 }], hands: [[4, 7, 5], [9, 10, 11]] }); },
      success: function () { return did() && me().alive && me().y <= 3 && me().x === 3; },
      fail: function () { return did() && me().alive && !(me().y <= 3 && me().x === 3) ? 'Your tile led away from the tiles already laid, so you stopped after one square.' : lost('Your junk was lost.')(); },
      hints: ['Two tiles already lie to the north. Aim your tile at them.', { say: 'Turn the third tile until its line points north, then Place.', target: function () { return T(2); } }],
      debrief: 'Three squares in one turn: tiles chain.' },
    { id: 'push', title: 'Shared square', rule: 'Every junk waiting on the square gets carried by your tile, not only yours. Last junk afloat wins.', par: 1,
      goal: 'Carry Cobalt into the leviathan and win.',
      setup: function () { return stack({ ships: [{ x: 3, y: 5, e: 5 }, { x: 3, y: 5, e: 4 }], mons: [{ id: 2, x: 4, y: 5 }, { id: 4, x: 0, y: 1 }, { id: 7, x: 6, y: 1 }], hands: [[0, 3, 5], [8, 9, 10]] }); },
      success: function () { return !!G.over && G.over.win.indexOf(0) >= 0; },
      fail: function () { return did() && !G.over ? 'Cobalt sailed on safely with you. Send his side of the tile toward the leviathan.' : (G.over && G.over.win.indexOf(0) < 0 ? 'Your junk was lost.' : false); },
      hints: ['The leviathan is east of the square. Cobalt follows his own line.', { say: 'Turn a tile until Cobalt\'s line heads east, then Place.', target: function () { return T(0); } }],
      debrief: 'Cobalt sailed into the leviathan. You are the last junk afloat.' },
    { id: 'wake', title: 'Leviathans wake', rule: 'A roll of 6, 7 or 8 wakes the leviathans: each moves one square or turns. One that reaches your bow square sinks you.', par: 1,
      goal: 'End your turn out of reach of both leviathans.',
      setup: function () { return stack({ ships: [{ x: 3, y: 4, e: 5, on: [3, 5] }, { x: 6, y: 0, e: 1 }], bd: [[3, 5, 35, 0]], mons: [{ id: 0, x: 3, y: 2 }, { id: 3, x: 5, y: 4 }, { id: 6, x: 0, y: 0 }], hands: [[4, 0, 3], [8, 9, 10]], roll: function (t) { return t === 2 ? [3, 4] : [1, 2]; }, mon: { 0: 'S', 3: 'W' } }); },
      success: function () { return did() && me().alive && G.turn >= 3; },
      fail: function () { return did() && !me().alive ? 'Cobalt rolled 7: the leviathans woke. One swam into your bow square and sank you.' : false; },
      hints: ['Cobalt will roll next. A leviathan beside your bow square can step into it.', { say: 'Sail west: no leviathan is next to that square.', target: function () { return T(0); } }],
      debrief: 'Stay two squares from every leviathan: they wake on 6, 7 or 8.' },
    { id: 'cannon', title: 'Deck Cannon', rule: 'A leviathan on your bow sinks you, unless you fire a Deck Cannon: it destroys that leviathan.', par: 1,
      goal: 'A leviathan blocks your bow. Survive.',
      setup: function () { return stack({ exp: { cannon: 1 }, bow: 1, ships: [{ x: 3, y: 4, e: 5, on: [3, 5] }, { x: 6, y: 0, e: 1 }], bd: [[3, 5, 0, 0]], mons: [{ id: 0, x: 3, y: 4 }, { id: 3, x: 5, y: 1 }, { id: 6, x: 0, y: 0 }, { id: 7, x: 6, y: 5 }], hands: [[57, 4, 3], [8, 9, 10]] }); },
      success: function () { return did() && me().alive && !G.mons.some(function (l) { return l.x === me().x && l.y === me().y; }); },
      fail: function () { return did() && !me().alive ? 'You accepted your fate. A Deck Cannon destroys the leviathan that sinks you.' : false; },
      hints: ['You hold a Deck Cannon. A question asks what to do.', { say: 'Choose to fire the Deck Cannon.', target: function () { return tqbtn('dCannon'); } }],
      debrief: 'The cannon destroyed the leviathan. Keep one for emergencies.' },
    { id: 'gate', title: 'Rift Gate', rule: 'A Rift Gate saves a junk that is about to be lost: it is thrown to a random square and rides a wake from there.', par: 3,
      goal: 'A leviathan blocks your bow. Escape through the Rift Gate.',
      setup: function () { return stack({ exp: { rift: 1 }, bow: 1, ships: [{ x: 3, y: 4, e: 5, on: [3, 5] }, { x: 6, y: 0, e: 1 }], bd: [[3, 5, 0, 0]], mons: [{ id: 0, x: 3, y: 4 }, { id: 3, x: 5, y: 1 }, { id: 6, x: 0, y: 0 }, { id: 7, x: 6, y: 5 }], hands: [[56, 4, 3], [8, 9, 10]] }); },
      success: function () { return did() && me().alive && G.gates.length > 0 && !G.q; },
      fail: function () { return did() && !me().alive ? 'Your junk was lost. The Rift Gate could have thrown it clear.' : false; },
      hints: ['You hold a Rift Gate. A question asks what to do.', { say: 'Choose to play the Rift Gate.', target: function () { return tqbtn('dGate'); } }],
      debrief: 'The gate threw you clear of the leviathan.' },
    { id: 'wave', title: 'Rogue Wave', rule: 'A Rogue Wave sweeps one row. A junk that sails through its row must roll the wave\'s strength or capsize.', par: 1,
      goal: 'Finish your turn without crossing the wave\'s row.',
      setup: function () { return stack({ exp: { wave: 1 }, ships: [{ x: 3, y: 6, e: 5 }, { x: 6, y: 0, e: 1 }], bd: [[3, 5, 35, 0], [3, 4, 36, 0]], wave: { x: 0, y: 4, r: 0, owner: COB, pt: 5 }, wdie: 1, mons: [{ id: 1, x: 0, y: 1 }, { id: 5, x: 6, y: 3 }, { id: 8, x: 1, y: 2 }], hands: [[0, 5, 4], [9, 10, 11]] }); },
      success: function () { return did() && me().alive; },
      fail: function () { return did() && !me().alive ? 'You crossed the wave\'s row and rolled a 1. It needs 2: your junk capsized.' : false; },
      hints: ['The wave sweeps the whole row of its marker. Your first tile heads that way.', { say: 'Turn a tile so you sail sideways, along the bottom row.', target: function () { return T(1); } }],
      debrief: 'Crossing the wave\'s row costs a roll. Staying out of it is free.' },
    { id: 'game', title: 'Short game', rule: 'Last junk afloat wins. Use everything you learned.', par: 99,
      goal: 'Win a short game against Cobalt.',
      setup: function () { return stack({ first: 1, ships: [{ x: 1, y: 6, e: 5 }, { x: 5, y: 0, e: 1 }], mons: [{ id: 0, x: 2, y: 2 }, { id: 4, x: 4, y: 4 }, { id: 8, x: 5, y: 2 }, { id: 9, x: 0, y: 3 }], hands: [[1, 4, 8], [2, 3, 9]], turn: 1 }); },
      success: function () { return !!G.over && G.over.win.indexOf(0) >= 0; },
      fail: function () { return G.over && G.over.win.indexOf(0) < 0 ? 'Cobalt is the last junk afloat. ' + why() : false; },
      hints: ['Keep your junk away from the leviathans and the edge.', 'Use your tiles to push Cobalt toward the edge or a leviathan.'],
      debrief: 'Last junk afloat: you won the lantern.' }
  ];
  lessons.forEach(function (s) { s.moves = function () { return L.n; }; });
  // ---- hooks while a lesson runs: scripted dice, scripted rival, nothing saved over the player's real game
  function hook() {
    var oT = TUT; TUT = function (kind, arg) {
      if (L.on && GXST.active()) {
        if (kind === 'roll') { var r = L.roll ? L.roll(G.turn) : [1, 2]; return r; }
        if (kind === 'mon') return tutDie(arg, L.mon[arg] || 'rot');
        if (kind === 'wave') return L.wdie;
      }
      return oT ? oT.apply(this, arguments) : null;
    };
    var oa = aiMove; aiMove = function (seat, lv) {
      if (L.on && GXST.active() && seat === COB && !G.q && G.phase === 'play' && G.step === 'act' && G.cur === COB) {
        var mv = L.co ? L.co() : null; if (mv) return mv;
        var all = genMoves(G, COB).filter(function (m) { return m.a === 'place'; }); if (all.length) return all[0];
      }
      return oa.apply(this, arguments);
    };
    var oc = act; act = function (m, seat) { var ok = oc.apply(this, arguments); if (ok && seat === 0 && GXST.active()) L.n++; return ok; };
    var os = saveAll; saveAll = function () { if (!GXST.active()) return os.apply(this, arguments); };
    window.TWL = { L: L, build: build, stack: stack };
  }
  var go = function () {
    if (!ready()) { setTimeout(go, 200); return; }
    hook();
    GXST.init({ game: 'tidewake', scenarios: lessons, keepClear: ['#board'], settled: function () { return !!G && UI.started && !UI.busy && !G.ag.length && (G.over || sideToAct() === 0); } });
  };
  setTimeout(go, 300);
})();

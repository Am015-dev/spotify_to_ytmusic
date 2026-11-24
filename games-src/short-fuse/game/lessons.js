// Short Fuse: scenario lessons on the shared engine (shell/gx-scenario-tutor.js, docs shell/GXST.md, spec orch/TUTORIAL-SPEC.md).
// Each lesson stacks a tiny 3-crew bomb (you = seat 0), ONE goal on the floating card, real moves on the real table, win/fail with a reason.
// Opened by the Tutorial button (tutStart). The old staged tutorial (tutor.js, dims the board) is retired.
// Rule -> lesson: goal/turns = game; tokens + sorted racks = order; dual cut = dual; miss + fuse = miss; solo cut + check mark = solo;
//   gear unlock + use = gear; personal tool = probe; yellow = yellow; never point at red = red; own reds reveal = reveal.
(function () {
  if (!window.GXST) return;
  var $ = function (s) { return document.querySelector(s); };
  var L = { ln: -1, t: 0, mine: false };
  var ready = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof UI !== 'undefined' && typeof refresh === 'function' && typeof MISSIONS !== 'undefined' && typeof tutRebuild === 'function'; };
  var cutOf = function (v) { return typeof cutCount === 'function' ? cutCount(v) : 0; };
  var myMoves = function () { return G ? G.hist.filter(function (h) { return h.seat === 0 && h.kind !== 'none' && h.kind !== 'skip'; }).length : 0; };
  var missed = function () { return G && G.stats.miss > 0; };
  var boom = function () { return G && G.over && !G.over.win; };
  // a wire from a short name: '5' blue 5, '5t' with its token shown, '5x' already cut, 'y1' yellow 1.1, 'r2' red 2.5
  function parse(str, used) {
    var m = /^(\d+|[yr]\d+)(t?)(x?)$/.exec(str), k = m[1], o = { tok: !!m[2], cut: !!m[3] };
    if (k[0] === 'y') { o.id = 59 + (+k.slice(1)) - 1; o.v = 'Y'; } else if (k[0] === 'r') { o.id = 48 + (+k.slice(1)) - 1; o.v = 'R'; }
    else { var v = +k, j = used[v] || 0; used[v] = j + 1; o.id = (v - 1) * 4 + j; o.v = v; }
    return o;
  }
  function mission() {
    if (!MISSIONS[68]) { MISSIONS[68] = Object.assign({}, MISSIONS[1], { n: 68, nm: 'Practice bomb', text: 'A tiny practice bomb: three crew, a few wires.', pl: [3], blue: 3, red: null, yel: null, eq: { n: 0 }, rules: [], info: 'std', tok: 'num', audio: false, timer: null }); BRIEFS[68] = 'A tiny practice bomb.'; L.mine = true; }
    return MISSIONS[68];
  }
  // build one position: sp = {me:[..], s1:[..], s2:[..], dial, eq, real}
  function stack(sp) {
    try { GX.close(); } catch (e) { } try { hideStart(); } catch (e) { } try { GXH.setEnabled(false); GXH.hide(); } catch (e) { }
    var M = mission();
    UI.tut = false; UI.coach = null; kitReset(); clearTimeout(UI.aiT); UI.aiT = null; UI.rt = false; UI.started = false; UI.sel = null; UI.prev = null; UI.holder = -1; UI.offSeat = null; UI.campDone = 0; UI.campShown = 0; UI.wwk = null; UI.pause = false; UI.camp = null; UI.brief = null; UI.aiNotBefore = 0; UI.lastPrompt = null; UI.ghost = { info: 0, turn: 0 };
    UI.started = true;
    newGame({ np: 3, mission: 68, seats: ['human', 'ai', 'ai'], level: 'easy', names: DEFNAMES.slice(0, 3), realtime: false, captain: 0, seed: 7 });
    var used = {}, tot = { Y: 0 }, red = [], yel = [];
    var stands = [sp.me, sp.s1 || [], sp.s2 || []].map(function (a, i) {
      var ws = a.map(function (s) { return parse(s, used); });
      ws.forEach(function (o) { if (o.v === 'Y') { tot.Y++; yel.push(((o.id - 59) + 1) + .1); } else if (o.v === 'R') red.push(((o.id - 48) + 1) + .5); else tot[o.v] = (tot[o.v] || 0) + 1; });
      ws.sort(function (a, b) { return sv(a.id) - sv(b.id) || a.id - b.id; });
      return { i: i, pos: i, w: ws.map(function (o) { var s = newSlot(o.id); if (o.cut) s.cut = 1; if (o.tok && !o.cut) s.tok.push(o.v === 'Y' ? { t: 'y', v: 'Y' } : { t: 'n', v: o.v }); return s; }), side: [] };
    });
    G.q = null; G.ag = []; G.agI = 0; G.log = []; G.logN = 0; G.captain = 0; G.pos = [0, 1, 2]; G.phase = 'setup'; G.step = null; G.turn = 0; G.round = 0; G.hist = []; G.ann = []; G.marks = []; G.valid = []; G.fin = {}; G.over = null; G.winText = ''; G.tfx = {};
    G.st = stands; G.tot = tot; G.tokSup = clone(INFO_TOKENS); G.gone = []; G.box = []; G.aside = []; G.pile = [];
    G.markers = { red: red, redQ: 0, redN: red.length, yel: yel, yelQ: 0, yelN: yel.length };
    G.eq = (sp.eq || []).map(function (id) { return { id: id, st: 'locked', down: 0, cover: null, perm: 0 }; }); G.eqPool = []; G.eqDeck = []; G.eqOut = [];
    G.dial = sp.dial || 3; G.stats = { dual: 0, dualOk: 0, solo: 0, miss: 0, eqUse: 0, turns: 0 }; G.idle = 0;
    if (!sp.real) Object.defineProperty(G, 'idle', { get: function () { return 0; }, set: function () { } });   // a passing practice crew is not a stuck crew
    ['ch_captain', 'ch_base1', 'ch_base2'].forEach(function (c, i) { G.seats[i].ch = c; G.seats[i].chUsed = 0; });
    lg('Practice bomb: you, Teal and Plum. You are the foreman.', 'big');
    L.real = !!sp.real;
    if (sp.real) infoSetup(MISSIONS[68]);
    later('beginPlay'); flow(); UI.holder = 0; UI.prev = snap(); refresh();
    return new Promise(function (r) { var t0 = Date.now(); (function w() { var ok = false; try { ok = sp.real ? (G.q && G.q.who === 0) : (decider() === 0 && G.step === 'act' && UI.V && UI.V.legal); } catch (e) { } if (ok || Date.now() - t0 > 8000) setTimeout(r, 500); else setTimeout(w, 80); })(); });
  }
  // the first uncut wire of stand si worth v (a crew wire to point at)
  var tile = function (si, v) { return function () { if (!G) return null; var sl = G.st[si].w.find(function (x) { return !x.cut && cv(x.id) === v; }); var e = sl && tileEl(sl.u); return e && e.getBoundingClientRect().width ? e : null; }; };
  var my = function (v) { return function () { if (!G) return null; var sl = G.st[0].w.find(function (x) { return !x.cut && cv(x.id) === v; }); var e = sl && tileEl(sl.u); return e && e.getBoundingClientRect().width ? e : null; }; };
  // multi-step: ring the wire to point at first, then the number to name (UI.sel holds the pointed wire); a rack tool is chosen first
  var probeT = function () { var q = UI.sel; if (!q || !q.tool) return $('#tb .chip'); var n = q.tg ? q.tg.length : 0; return n === 0 ? tile(1, 4)() : n === 1 ? tile(1, 9)() : my(4)(); };
  var two = function (tf, v) { return function () { var m = my(v)(); return UI.sel && UI.sel.mode === 'dual' && UI.sel.tg && UI.sel.tg.length && m ? m : tf(); }; };
  var afterCut = function (v, f, then) { return function () { var e = then(); return cutOf(v) >= 2 && e ? e : f(); }; };
  // the tempting wrong guess: one message for any miss
  var missMsg = function (why) { return function () { return missed() ? why : (boom() ? 'BOOM. ' + (G.over.why || 'The fuse ran out.') : false); }; };

  var lessons = [
    { id: 'dual', title: 'Dual cut', rule: 'Point at a crewmate wire, name a number you hold. If it matches, both wires are cut.', par: 1,
      goal: 'Cut a pair of 5s.',
      setup: function () { return stack({ me: ['5', '9', '12'], s1: ['5t', '7', '11'], s2: ['7t', '11t'] }); },
      success: function () { return cutOf(5) >= 2; },
      fail: missMsg('That wire was not a 5: the fuse burns a step. A token shows a wire\'s true number.'),
      hints: ['One crew wire carries a token. What does it say?', { say: 'Point at the wire with the 5 token, then tap your 5.', target: two(tile(1, 5), 5) }],
      debrief: 'Token said 5, you hold a 5: both cut.' },
    { id: 'order', title: 'Read the rack', rule: 'Each rack runs low to high, left to right. A wire left of a 3 is never a 9.', par: 1,
      goal: 'Cut a pair of 1s with the leftmost wire.',
      setup: function () { return stack({ me: ['1', '9', '12'], s1: ['1', '3t', '10'], s2: ['7', '11t'] }); },
      success: function () { return cutOf(1) >= 2; },
      fail: missMsg('Racks run low to high: the wire left of the 3 is the small one, so the 1.'),
      hints: ['Look at the 3 token. Which side holds the smaller numbers?', { say: 'The leftmost wire is the 1. Point at it and tap your 1.', target: two(tile(1, 1), 1) }],
      debrief: 'Left of a 3 means small: it had to be the 1.' },
    { id: 'miss', title: 'A miss burns fuse', rule: 'A wrong guess burns one fuse step and the wire gets a token with its true number. No steps left: boom.', par: 2,
      goal: 'Cut a pair of 8s. The fuse can take one miss.',
      setup: function () { return stack({ me: ['6', '8', '12'], s1: ['2t', '8', '12t'], s2: ['3t', '10t'], dial: 2 }); },
      success: function () { return cutOf(8) >= 2; },
      fail: function () { return boom() ? 'The fuse was spent: a second miss is boom. Use the token a miss leaves.' : false; },
      hints: ['If you miss once, the wire shows you its number.', { say: 'Say 8 on the middle wire. If it was not 8, the token tells you.', target: two(tile(1, 8), 8) }],
      debrief: 'A miss costs a step, but the token turns it into a sure cut.' },
    { id: 'solo', title: 'Solo cut', rule: 'Hold every wire left of a number (all four, or the last two) and cut them alone. It cannot miss.', par: 1,
      goal: 'Cut all four 7s without burning the fuse.',
      setup: function () { return stack({ me: ['3', '7', '7', '7', '7', '12'], s1: ['3t', '10'], s2: ['10t', '12t'] }); },
      success: function () { return cutOf(7) >= 4 && !missed(); },
      fail: missMsg('A guess can miss. You hold all four 7s, so tap a 7 and cut them alone.'),
      hints: ['How many 7s exist? How many do you hold?', { say: 'You hold all four 7s: tap one.', target: my(7) }],
      debrief: 'All four 7s were yours, so a solo cut was free. A check mark went up.' },
    { id: 'gear', title: 'Gear card', rule: 'Gear unlocks once two wires of its number are cut. Then use it once, any time.', par: 2,
      goal: 'Turn the fuse back to 3 steps.',
      setup: function () { return stack({ me: ['6', '9', '12'], s1: ['6t', '7', '11'], s2: ['7t', '11t'], eq: ['eq6'], dial: 2 }); },
      success: function () { return G.dial >= 3; },
      fail: missMsg('That wire was not a 6. Two cut 6s are what unlock the Rewind card.'),
      hints: ['The Rewind card is locked. Its number is on it.', { say: 'Cut the pair of 6s, then tap Rewind.', target: afterCut(6, two(tile(1, 6), 6), function () { return $('#tb .eqk'); }) }],
      debrief: 'Two 6s cut unlocked Rewind: one step back.' },
    { id: 'probe', title: 'Twin Probe', rule: 'Once per job, test two wires at once: it hits if either matches. Great when one miss would end the job.', par: 1,
      goal: 'Cut a pair of 4s. One miss ends the job.',
      setup: function () { return stack({ me: ['4', '9', '12'], s1: ['4', '9', '12t'], s2: ['7t', '11t'], dial: 1 }); },
      success: function () { return cutOf(4) >= 2; },
      fail: missMsg('One miss was the end of the fuse. The Twin Probe tests two wires at once.'),
      hints: ['You have a personal tool. Look for it by your stand.', { say: 'Tap the Twin Probe, tap both blank wires, then your 4.', target: probeT }],
      debrief: 'Two wires, one test: either could be the 4.' },
    { id: 'yellow', title: 'Yellow wires', rule: 'Yellow matches only yellow. Name yellow by tapping your yellow wire.', par: 1,
      goal: 'Cut the pair of yellow wires.',
      setup: function () { return stack({ me: ['y1', '5', '8'], s1: ['y2t', '5t', '11'], s2: ['7t', '11t'] }); },
      success: function () { return G.st.reduce(function (a, s) { return a + s.w.filter(function (x) { return x.cut && cv(x.id) === 'Y'; }).length; }, 0) >= 2; },
      fail: missMsg('Yellow only matches yellow. Tap your yellow wire to name it.'),
      hints: ['Which crew wire has the yellow token?', { say: 'Point at the yellow-token wire, then tap your yellow.', target: two(tile(1, 'Y'), 'Y') }],
      debrief: 'Yellow met yellow: a pair.' },
    { id: 'red', title: 'Never point at red', rule: 'Red wires are never named. Pointing at one blows the bomb.', par: 1,
      goal: 'Cut a pair of 4s. A red wire is in play on their rack.',
      setup: function () { return stack({ me: ['4', '9'], s1: ['r2', '4t', '12'], s2: ['7t', '11t'] }); },
      success: function () { return cutOf(4) >= 2; },
      fail: function () { return boom() ? 'You pointed at a red wire: boom. The red marker said one was in play.' : (missed() ? 'That was not a 4. Only the token is certain.' : false); },
      hints: ['The board shows a red wire in play. Which wire is not certain?', { say: 'Skip the blank wire. Use the 4 token.', target: two(tile(1, 4), 4) }],
      debrief: 'Only tokened wires were safe: the blank one was red.' },
    { id: 'reveal', title: 'Last red reveals', rule: 'If your last wires are all red, they reveal themselves at your turn.', par: 2,
      goal: 'Defuse the bomb. Cut your last blue wire.',
      setup: function () { return stack({ me: ['5', 'r2'], s1: ['5t'], s2: [] }); },
      success: function () { return G.over && G.over.win; },
      fail: function () { return missed() ? 'That was not a 5. Cut the token wire, then your red reveals itself.' : (boom() ? 'BOOM. ' + (G.over.why || '') : false); },
      hints: ['After your blue wire is gone, what is left in your hand?', { say: 'Cut the 5 pair. Your red reveals next turn.', target: two(tile(1, 5), 5) }],
      debrief: 'Only reds left: they revealed themselves and the bomb is defused.' },
    { id: 'game', title: 'A short job', rule: 'Everything together: show a wire, take turns, cut all wires before the fuse runs out.', par: 99,
      goal: 'Defuse the whole bomb with your crew.',
      setup: function () { return stack({ real: true, me: ['y1', '2', '2', '3', 'r2', '3'], s1: ['1', '1', '2', '3'], s2: ['1', '1', 'y2', '2', '3'], dial: 3 }); },
      success: function () { return G.over && G.over.win; },
      fail: function () { return boom() ? 'BOOM. ' + (G.over.why || 'The fuse ran out.') : false; },
      hints: ['Tokens are clues for everyone. Read them first.', { say: 'Point where a token matches a number you hold.', target: '#crew' }],
      debrief: 'Defused together: tokens, turns and a safe fuse.' }
  ];
  lessons.forEach(function (s) { if (!s.moves) s.moves = myMoves; });
  window.SF_LESSONS = lessons;

  // leaving the practice bomb: nothing of it is saved, and the board goes quiet
  function leave() {
    if (!G || !UI.started || !L.on) return;
    L.on = 0; UI.started = false; clearTimeout(UI.aiT); UI.aiT = null; UI.sel = null; UI.V = null;
    if (L.mine) { delete MISSIONS[68]; delete BRIEFS[68]; L.mine = false; }
    G = null; try { GXH.hide(); } catch (e) { }
    ['over', 'cover'].forEach(function (id) { var e = document.getElementById(id); if (e) { e.hidden = true; e._s = ''; } });
    ['crew', 'mine', 'gear', 'tray', 'fuse', 'track', 'cutc', 'clk'].forEach(function (id) { var e = document.getElementById(id); if (e) { e._s = null; e.innerHTML = ''; } });
    try { showStart(); } catch (e) { }
  }
  window.lessonsOpen = function () { if (!ready()) return; L.on = 1; GXST.picker(); };
  var go = function () {
    if (!ready() || typeof aiStep !== 'function') { setTimeout(go, 200); return; }
    // the practice crew waits for you (no misses, no cuts on your wires); the last lesson uses the real crew
    var oas = aiStep; aiStep = function () {
      if (L.on && !L.real && window.GXST && GXST.active() && G && !G.over && !G.q && G.step === 'act' && G.actor > 0) { skipTurn('waits for you', 0); flow(); refresh(); return null; }
      return oas.apply(this, arguments);
    };
    // lesson games are never saved over the player's real game
    var sn = saveNow; saveNow = function () { if (!(window.GXST && GXST.active() && L.on)) return sn.apply(this, arguments); };
    var settle = function () { if (!G) return false; if (G.logN !== L.ln) { L.ln = G.logN; L.t = Date.now(); } return Date.now() - L.t > 900 && !UI.aiT && (G.over || decider() === 0 || (G.q && G.q.who === 0)); };
    window.addEventListener('gxst', function (e) { var t = e.detail && e.detail.type; if (t === 'start' || t === 'retry') L.on = 1; if (t === 'close' && L.on) leave(); });
    GXST.init({ game: 'short-fuse', scenarios: lessons, keepClear: ['.gx-bar', '#strip', '#say', '#tb .eqk', '#tb .tile', '#tb .plate', '#tray'], settled: settle });
  };
  setTimeout(go, 300);
})();

// Lantern Dive: scenario lessons on the shared engine (shell/gx-scenario-tutor.js, docs shell/GXST.md). Replaces the old dimming guided dive.
// Each lesson stacks a real 3-diver deal (engine `stack`), fast-forwards to the moment that matters, scripts the crew's cards and judges
// the real table. Rule -> lesson: lead+highest wins = lead; follow the colour = follow; out of colour, other colours never win = void;
// Lantern trumps, highest Lantern = trump; never forced to win, one broken job loses = duck; Captain picks first, jobs = jobs;
// one signal (highest / lowest / only) = ping; distress flare = flare; win together, job tick, Captain leads = dive.
(function () {
  if (!window.GXST) return;
  var $ = function (s) { return document.querySelector(s); };
  var L = { scr: {}, take: {}, viol: null, ping: false };
  var LET = { C: 0, T: 1, K: 2, S: 3, L: 4 };
  var cid = function (t) { return D.card(LET[t[0]], +t.slice(1)); };
  var ids = function (a) { return (a || []).map(cid); };
  var until = function (f, ms) { var t0 = Date.now(); return new Promise(function (r) { (function w() { var ok = false; try { ok = f(); } catch (e) { } if (ok || Date.now() - t0 > ms) r(ok); else setTimeout(w, 60); })(); }); };
  var ready = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof UI !== 'undefined' && typeof render === 'function' && typeof LD !== 'undefined' && typeof D !== 'undefined'; };
  var nm = function (s) { return G.players[s].name; };
  var cn = function (c) { return cname(c); };
  var settled = function () { return !!G && !UI.busy && !UI.cards.length && !UI.fz; };
  var hand = function (t) { return function () { return $('#hand .hc[data-id="' + cid(t) + '"]'); }; };
  var firstOf = function (i) { return G.tricks[i]; };
  var played = function (tr, s) { for (var i = 0; i < tr.plays.length; i++) if (tr.plays[i].s === s) return tr.plays[i].c; return -1; };
  var myPlays = function () { var n = 0; G.tricks.forEach(function (t) { if (played(t, 0) >= 0) n++; }); if (G.trick && G.trick.n >= G.tricks.length && played(G.trick, 0) >= 0) n++; return n; };
  var winCard = function (tr) { return played(tr, tr.w); };
  // the real deal from named cards. sp: {me,a,b: ['K9',...]} (a = seat 1, b = seat 2); the other cards are dealt by rule: high cards (7+) go to the
  // crew, low ones to everyone, never into a colour a seat must be void in (sp.void {seat:'KC'}). Seat sizes 13 / 13 / 14.
  function deal(sp) {
    var hs = [ids(sp.me), ids(sp.a), ids(sp.b)], size = [13, 13, 14], used = {}, v = sp.void || {}, rest = [], k, c;
    hs.forEach(function (h) { h.forEach(function (x) { if (used[x]) throw new Error('lesson card twice ' + x); used[x] = 1; }); });
    for (c = 39; c >= 0; c--) if (!used[c]) rest.push(c);
    var hi = sp.hi || [1, 2], rot = 0;
    var ok = function (x, q) { return String(v[q] || '').indexOf(sOf(x)) < 0; }, nOk = function (x) { return [0, 1, 2].filter(function (q) { return ok(x, q); }).length; };
    rest.sort(function (x, y) { return (nOk(x) - nOk(y)) || (c2v(y) - c2v(x)) || (x - y); });
    rest.forEach(function (x) {
      var order = c2v(x) >= 7 && x < 36 ? hi : [0, 1, 2], got = false;
      for (var j = 0; j < order.length && !got; j++) { var s = order[(j + rot) % order.length]; if (hs[s].length < size[s] && ok(x, s)) { hs[s].push(x); got = true; rot++; } }
      for (var s2 = 0; s2 < 3 && !got; s2++) if (hs[s2].length < size[s2] && ok(x, s2)) { hs[s2].push(x); got = true; }
      if (!got) throw new Error('no seat can take card ' + x);
    });
    return hs;
  }
  var SL = ['C', 'T', 'K', 'S', 'L'];
  var sOf = function (x) { return SL[x < 36 ? (x / 9) | 0 : 4]; };
  var c2v = function (x) { return x < 36 ? x % 9 + 1 : x - 35; };
  // build the table and fast-forward the engine to sp.upto ('assign' | 'distress' | 'play')
  function stack(sp) {
    try { GX.close(); } catch (e) { } try { GXH.setEnabled(false); GXH.hide(); } catch (e) { }
    L.scr = {}; L.take = sp.aiTake || {}; L.viol = null; L.ping = !!sp.ping;
    var hands = sp.hands || deal(sp);
    UI.seed = 7; newGame('vs', { np: 3, noGoal: 1, kind: 'log', mission: 1, stack: { tasks: sp.jobs.slice(), hands: hands, nopass: !!sp.nopass } });
    try { UI.coach.level = 'off'; UI.coach.userOff = true; } catch (e) { }
    UI.preReady = true; UI.enter = '';
    var upto = sp.upto || 'play', guard = 0;
    while (upto !== 'assign' && G.phase === 'assign' && guard++ < 12) {
      var s = G.as.actor, mv = LD.moves(G, s), want = (sp.take || {})[s] || [], pick = null;
      mv.forEach(function (m) { if (!pick && m.t === 'take' && want.indexOf(m.i) >= 0) pick = m; });
      if (!pick) pick = mv.filter(function (m) { return m.t === 'pass'; })[0] || mv.filter(function (m) { return m.t === 'done'; })[0] || mv.filter(function (m) { return m.t === 'take'; })[0];
      if (!pick || !LD.apply(G, s, pick).ok) break;
    }
    if (upto === 'play' && G.phase === 'distress') LD.apply(G, G.cap, { t: 'dist', on: false });
    G.events = []; UI.evN = G.evN;
    var want2 = upto === 'assign' ? 'assign' : upto === 'distress' ? 'distress' : 'play';
    L.scr = {}; var sc = sp.script || {}; Object.keys(sc).forEach(function (k) { L.scr[k] = ids(sc[k]); });
    render(); schedule();
    return until(function () { return G.phase === want2 && settled() && $('#hand .hc'); }, 9000).then(function () { return until(function () { return settled() && (G.phase !== 'play' || G.trick.turn === 0 || UI.preReady); }, 9000); }).then(function () { return new Promise(function (r) { setTimeout(r, 400); }); });
  }
  var lessons = [
    { id: 'lead', title: 'Lead a trick', par: 1,
      rule: 'The leader plays any card. The highest card of the colour led wins the trick.',
      goal: 'You lead. Win the first trick.',
      setup: function () { return stack({ jobs: [78], take: { 0: [0] }, me: ['L4', 'K9', 'K1', 'C2', 'T3', 'S4'], a: ['K5', 'C7', 'T8'], b: ['K6', 'C8', 'S9'] }); },
      success: function () { var t = firstOf(0); return !!t && t.w === 0; },
      fail: function () { var t = firstOf(0); if (!t || t.w === 0) return false; return 'Your ' + cn(played(t, 0)) + ' lost to ' + nm(t.w) + "'s " + cn(winCard(t)) + '. The highest card of the colour led wins.'; },
      hints: ['Which of your cards cannot be beaten in its colour?', { say: 'Lead the Kelp 9: nobody can top it.', target: hand('K9') }],
      debrief: 'Highest of the colour led wins: the Kelp 9.' },
    { id: 'follow', title: 'Follow the colour', par: 1,
      rule: 'You must follow the colour led if you can. Only a card of that colour can win.',
      goal: function () { return nm(1) + ' led Coral. Win the trick.'; },
      setup: function () { return stack({ jobs: [78, 75], take: { 1: [1], 0: [0] }, me: ['C9', 'C3', 'K9', 'T9', 'S9'], a: ['L4', 'C5'], b: ['C7'], void: { 0: '' }, script: { 1: ['C5'], 2: ['C7'] } }); },
      success: function () { var t = firstOf(0); return !!t && t.w === 0; },
      fail: function () { var t = firstOf(0); if (L.viol && !t) return 'You hold Coral, so you must follow Coral. Other colours cannot be played.'; if (!t || t.w === 0) return false; return 'Your ' + cn(played(t, 0)) + ' was lower than ' + nm(t.w) + "'s " + cn(winCard(t)) + '. Highest of the colour led wins.'; },
      hints: ['Only your Coral cards are playable. Which wins?', { say: 'Play the Coral 9: it beats the Coral 7.', target: hand('C9') }],
      debrief: 'Follow the colour; the highest of it wins.' },
    { id: 'void', title: 'Out of colour', par: 1,
      rule: 'No card of the colour led? Play anything. A different colour never wins the trick.',
      goal: 'Win no Sunstar cards. Play a card, any card.',
      setup: function () { return stack({ jobs: [62, 75], take: { 1: [1], 0: [0] }, me: ['L1', 'K9', 'T9', 'C9', 'K2'], a: ['L4', 'S5'], b: ['S9'], void: { 0: 'S' }, script: { 1: ['S5'], 2: ['S9'] } }); },
      success: function () { var t = firstOf(0); return !!t && t.w !== 0; },
      fail: function () { var t = firstOf(0); if (!t || t.w !== 0) return false; return 'A Lantern beats every colour. You won the Sunstar cards, and your job says win none.'; },
      hints: ['You hold no Sunstar. Which card would still win the trick?', { say: 'Keep the Lantern. Play any colour.', target: hand('K9') }],
      debrief: 'A colour that was not led never wins.' },
    { id: 'trump', title: 'Lantern power', par: 1,
      rule: 'A Lantern beats every colour. The highest Lantern wins.',
      goal: function () { return 'Win ' + nm(1) + "'s Kelp 9 with a Lantern."; },
      setup: function () { return stack({ jobs: [58, 75], take: { 1: [1], 0: [0] }, me: ['L1', 'L3', 'C9', 'T9', 'S9'], a: ['L4', 'K9', 'K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8'], b: ['L2'], void: { 0: 'K', 2: 'K' }, script: { 1: ['K9'], 2: ['L2'] } }); },
      success: function () { var t = firstOf(0); return !!t && t.w === 0 && played(t, 0) >= 36; },
      fail: function () { var t = firstOf(0); if (!t || t.w === 0) return false; var m = played(t, 0); return m >= 36 ? nm(t.w) + "'s " + cn(winCard(t)) + ' is higher. The highest Lantern wins.' : 'Colours cannot beat a Lantern. ' + nm(t.w) + "'s " + cn(winCard(t)) + ' won.'; },
      hints: ['Sumi played a Lantern. Which of yours is higher?', { say: 'Play the Lantern 3: it beats the Lantern 2.', target: hand('L3') }],
      debrief: 'Lantern 3 beats Lantern 2, and every colour.' },
    { id: 'duck', title: 'Let them win', par: 1,
      rule: 'You are never forced to win. One broken job loses the dive for everyone.',
      goal: function () { return nm(1) + ' must win the first trick. You lead: let ' + nm(1) + ' win.'; },
      setup: function () { return stack({ jobs: [78, 75], take: { 1: [0], 0: [1] }, me: ['L4', 'K9', 'K3', 'C2', 'T3', 'S4'], a: ['K8', 'C7', 'T8', 'S8'], b: ['K1', 'C1', 'T1', 'S1'], hi: [1] }); },
      success: function () { var t = firstOf(0); return !!t && t.w === 1; },
      fail: function () { var t = firstOf(0); if (!t || t.w === 1) return false; return t.w === 0 ? 'You won the trick, but ' + nm(1) + "'s job was to win it. One broken job loses the dive." : nm(t.w) + ' won it, not ' + nm(1) + '. ' + nm(1) + ' needs this trick.'; },
      hints: ['Which of your cards can your crew beat?', { say: 'Lead the Kelp 3: the Kelp 8 beats it.', target: hand('K3') }],
      debrief: 'Never forced to win: a low lead handed the trick over.' },
    { id: 'jobs', title: 'Take a job',
      rule: 'The Captain (who holds Lantern 4) picks a job first, then clockwise. Pick what your hand can do.',
      goal: 'You are Captain. Take the job your hand can finish.',
      setup: function () { return stack({ upto: 'assign', jobs: [53, 56], aiTake: { 1: [1] }, me: ['L4', 'L3', 'C9', 'K9', 'T9'], a: ['L2', 'S9'], b: ['L1'] }); },
      success: function () { return G.tasks.some(function (t) { return t.owner === 0 && t.id === 53; }); },
      fail: function () { return G.tasks.some(function (t) { return t.owner === 0 && t.id !== 53; }) ? 'You hold Lanterns 3 and 4, so Win no Lanterns is hard. Win the Lantern 3 is easy.' : false; },
      hints: ['Which job matches the Lanterns in your hand?', { say: 'Take Win the Lantern 3: you hold it.', target: function () { var a = document.querySelectorAll('#pool .jcard'); for (var i = 0; i < a.length; i++) if (G.tasks[+a[i].getAttribute('data-i')].id === 53) return a[i]; return null; } }],
      debrief: 'You hold Lanterns 3 and 4: that job is nearly done.' },
    { id: 'ping', title: 'Signal a card',
      rule: 'Once per dive, show one colour card: your highest, lowest or only one of its colour. Between tricks only.',
      goal: function () { return 'Tell ' + nm(1) + ' where the Coral 3 is.'; },
      setup: function () { return stack({ ping: 1, jobs: [15], take: { 1: [0] }, me: ['C3', 'K2', 'K7', 'T4', 'T8', 'S2', 'L4'], a: ['C9', 'K9'], b: ['C8', 'T9'], void: { 0: 'C' } });  },
      success: function () { return G.pings.some(function (p) { return p.seat === 0 && p.c === cid('C3'); }); },
      fail: function () { var p = G.pings.filter(function (x) { return x.seat === 0; })[0]; return p && p.c !== cid('C3') ? 'That is not the card ' + nm(1) + ' needs. Show the Coral 3, your only Coral.' : false; },
      hints: ['Tap Signal, then pick the card that helps your crewmate.', { say: 'Show the Coral 3: it is your only Coral.', target: hand('C3') }],
      debrief: 'Coral 3 shown as your only Coral: the crew knows.' },
    { id: 'flare', title: 'Distress flare',
      rule: 'Light the flare before the dive: every diver passes one colour card left or right. It costs an extra attempt.',
      goal: function () { return 'Pass ' + nm(1) + ' the Coral 3 they need.'; },
      setup: function () { return stack({ upto: 'distress', jobs: [15], take: { 1: [0] }, me: ['C3', 'C4', 'K2', 'K7', 'T4', 'T8', 'S2', 'L4'], a: ['C9', 'K9'], b: ['C8', 'T9'] }); },
      success: function () { return G.distress && G.phase !== 'pass' && G.phase !== 'distress' && G.players[1].hand.indexOf(cid('C3')) >= 0; },
      fail: function () { if (G.phase === 'pass' || G.phase === 'distress') return false; if (!G.distress) return 'Without the flare nobody passes a card, so ' + nm(1) + ' never gets the Coral 3.'; return G.players[1].hand.indexOf(cid('C3')) < 0 ? nm(1) + ' did not receive the Coral 3. Pass it to the left.' : false; },
      hints: ['Light the flare, pass left, then pick the card.', { say: 'Pass left, then tap the Coral 3.', target: function () { return $('#acts [data-a="dist"][data-on="true"]') || hand('C3')(); } }],
      debrief: 'The flare moved the Coral 3 to your crewmate.' },
    { id: 'dive', title: 'A short dive', rule: 'Win together: finish every job. A done job gets a tick, and the dive ends the moment all are done.',
      goal: function () { return 'Finish both jobs. ' + nm(1) + ' needs trick 1.'; },
      setup: function () { var st = tutorialStack(); return stack({ jobs: st.tasks, hands: st.hands, take: { 0: [0], 1: [1] }, script: { 1: ['K7', 'L2'], 2: ['K2', 'L1'] } }); },
      success: function () { return G.phase === 'over' && !!G.result && !!G.result.ok; },
      fail: function () { return G.phase === 'over' && G.result && !G.result.ok ? 'A job broke: ' + String(G.result.why || 'one diver missed a job').replace(/\.+$/, '') + '. Every job must be done together.' : false; },
      hints: ['Your job is the Lantern 3. Whose trick is first?', { say: 'Lead the Kelp 3 so your crewmate wins, then play the Lantern 3.', target: hand('K3') }],
      debrief: 'Both jobs done: you win as a crew.' }
  ];
  var go = function () {
    if (!ready() || !LD.AI) { setTimeout(go, 200); return; }
    // the crew plays the lesson's script; lesson games are never saved over the player's real game and show no result screen
    var os = LD.AI.step;
    LD.AI.step = function (Gm) {
      if (GXST.active() && Gm === G && G.phase !== 'over') {
        var s = LD.pending(G)[0], q = L.scr[s];
        if (s !== undefined && G.phase === 'play' && q && q.length) { var c = q[0]; if (LD.playable(G, s).indexOf(c) >= 0) { q.shift(); return LD.apply(G, s, { t: 'play', c: c }).ok; } }
        if (s !== undefined && G.phase === 'assign') { var tk = LD.moves(G, s), w = L.take[s] || [], m = null; tk.forEach(function (x) { if (!m && x.t === 'take' && w.indexOf(x.i) >= 0) m = x; }); if (!m) m = tk.filter(function (x) { return x.t === 'pass'; })[0] || tk[0]; if (m) return LD.apply(G, s, m).ok; }
      }
      return os.apply(this, arguments);
    };
    var op = LD.AI.pingChoice; LD.AI.pingChoice = function () { if (GXST.active() && !L.ping) return null; return op.apply(this, arguments); };
    var oa = autosave; autosave = function () { if (!GXST.active()) return oa.apply(this, arguments); };
    var osr = showResult; showResult = function () { if (!GXST.active()) return osr.apply(this, arguments); };
    var ot = toast; toast = function (t, f) { if (GXST.active() && /^Follow /.test(String(t))) L.viol = t; return ot.apply(this, arguments); };
    lessons.forEach(function (s) { s.moves = myPlays; });
    GXST.init({ game: 'lantern-dive', scenarios: lessons, keepClear: ['#hand', '#pool', '#acts', '#opp .seat'], settled: settled });
    document.addEventListener('click', function (e) { var b = e.target && e.target.closest && e.target.closest('[data-lessons-open]'); if (!b) return; e.preventDefault(); e.stopPropagation(); GXST.picker(); }, true);
    if (/[?&]lessons=1/.test(location.search)) GXST.picker();
  };
  setTimeout(go, 300);
})();

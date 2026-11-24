// Kaiten Kitchen: scenario lessons on the shared engine (shell/gx-scenario-tutor.js, docs shell/GXST.md). Off by default: ?lessons=1.
// Each lesson stacks a tiny 2-diner deal (3 dishes each, one round), scripts the rival's picks, and judges the real table.
(function () {
  if (!/[?&]lessons=1/.test(location.search) || !window.GXST) return;
  var L = { pre: [] };   // ids preset on the tables by the current lesson (not the player's picks)
  var K = function (id) { return KK.cardKey(id); };
  var mine = function () { return G.players[0].table.filter(function (e) { return L.pre.indexOf(e.id) < 0; }); };
  var count = function (seat, k) { return G.players[seat].table.filter(function (e) { return K(e.id) === k; }).length; };
  var icons = function (seat) { return G.players[seat].table.reduce(function (n, e) { return n + ({ roll1: 1, roll2: 2, roll3: 3 }[K(e.id)] || 0); }, 0); };
  var bo = function () { return G.players[1].name; };
  var picks = function () { return G.turn - 1 + (G.phase !== 'pick' ? 1 : 0); };
  // the first dish the player took is not the one the lesson asks for -> that lesson's message
  var firstWrong = function (want, msg) { return function () { var m = mine(); return m.some(function (e) { return want.indexOf(K(e.id)) < 0; }) ? msg : false; }; };
  var dish = function (k) { return function () { var a = document.querySelectorAll('#belt .hc[data-id]'); for (var i = 0; i < a.length; i++) if (K(+a[i].getAttribute('data-id')) === k) return a[i]; return null; }; };
  var until = function (f, ms) { var t0 = Date.now(); return new Promise(function (r) { (function w() { var ok = false; try { ok = f(); } catch (e) { } if (ok || Date.now() - t0 > ms) r(ok); else setTimeout(w, 60); })(); }); };
  var ready = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof UI !== 'undefined' && typeof render === 'function' && typeof KK !== 'undefined' && KK.AI; };
  // a 2-diner deal from named dishes; every card id is still used exactly once (the rest stay in the deck)
  function stack(sp) {
    try { GX.close(); } catch (e) { } try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } try { goalCard.seen = 1; } catch (e) { }
    UI.seed = 7; newGame('vs', { np: 2 }); UI.coach.level = 'off'; UI.coach.userOff = true;
    var used = {}, take = function (k) { for (var i = 0; i < KK.NCARDS; i++) if (!used[i] && K(i) === k) { used[i] = 1; return i; } };
    var me = sp.me.map(take), op = sp.opp.map(take), mt = (sp.myT || []).map(take), ot = (sp.oppT || []).map(take), rest = [];
    for (var i = 0; i < KK.NCARDS; i++) if (!used[i]) rest.push(i);
    G.deck = rest; G.discard = []; G.hand = me.length; G.len = 1; G.round = 1; G.turn = 1; G.phase = 'pick'; G.events = []; G.log = []; G.logN = 0;
    [[me, mt], [op, ot]].forEach(function (x, s) { var p = G.players[s]; p.hand = x[0]; p.table = x[1].map(function (id) { return { id: id, w: -1 }; }); p.pud = []; p.pick = null; p.picked = false; p.mem = [{ turn: 1, hand: p.hand.slice().sort(function (a, b) { return a - b; }) }]; });
    L.pre = mt.concat(ot); L.opp = sp.oppPrefers || [];
    render(); schedule();
    return until(function () { return document.querySelectorAll('#belt .hc[data-id]').length === me.length && !UI.busy; }, 8000).then(function () { return new Promise(function (r) { setTimeout(r, 1200); }); });
  }
  var lessons = [
    { id: 'take', title: 'Take a dish', rule: 'Each turn you take one dish from the hand in front of you. Nigiri score their number.', par: 1,
      goal: 'Take the dish worth the most points.',
      setup: function () { return stack({ me: ['squid', 'egg', 'roll1'], opp: ['salmon', 'tempura', 'dumpling'], oppPrefers: ['tempura'] }); },
      success: function () { return count(0, 'squid') > 0; },
      fail: firstWrong(['squid'], 'That dish is worth less. Moon Nigiri scores 3, Sun Nigiri only 1.'),
      hints: ['Hold a dish to read its points.', { say: 'Moon Nigiri: 3 points.', target: dish('squid') }],
      debrief: 'Moon Nigiri: 3 points on your tray.' },
    { id: 'prawns', title: 'Prawns pair up', rule: 'Two Crispy Prawns score 5. A lone one scores nothing.', par: 1,
      goal: 'You have one Crispy Prawn. Make it score.',
      setup: function () { return stack({ myT: ['tempura'], me: ['tempura', 'salmon', 'egg'], opp: ['dumpling', 'roll2', 'salmon'], oppPrefers: ['roll2'] }); },
      success: function () { return count(0, 'tempura') >= 2; },
      fail: firstWrong(['tempura'], 'A lone Crispy Prawn scores nothing. The pair would score 5.'),
      hints: ['Prawns only score in pairs.', { say: 'Take the second Crispy Prawn.', target: dish('tempura') }],
      debrief: 'A pair of prawns: 5 points.' },
    { id: 'paste', title: 'Fire Paste', rule: 'Fire Paste triples the next nigiri you take. Take the paste first.', par: 2,
      goal: 'Score 9 points with one Moon Nigiri.',
      setup: function () { return stack({ me: ['wasabi', 'egg', 'roll2'], opp: ['squid', 'tempura', 'dumpling'], oppPrefers: ['tempura', 'roll2'] }); },
      success: function () { return G.players[0].table.some(function (e) { return K(e.id) === 'squid' && e.w >= 0; }); },
      fail: function () {
        var m = mine(); if (!m.length) return false;
        if (K(m[0].id) !== 'wasabi') return 'Fire Paste must be on your tray BEFORE the nigiri. A plain Moon Nigiri is only 3.';
        return m.length > 1 && K(m[1].id) !== 'squid' ? 'The paste tripled a smaller dish. On a Moon Nigiri it makes 9.' : false;
      },
      hints: ['No Moon Nigiri in your hand yet. What would make it worth more?', { say: 'Take Fire Paste now; the Moon Nigiri comes round next turn.', target: dish('wasabi') }],
      debrief: 'Paste first, nigiri after: 3 x 3 = 9.' },
    { id: 'buns', title: 'Stack buns', rule: 'Steam Buns grow: 1, 3, 6, 10, then 15 points for five or more.', par: 2,
      goal: 'Stack four Steam Buns for 10 points.',
      setup: function () { return stack({ myT: ['dumpling', 'dumpling'], me: ['dumpling', 'salmon', 'egg'], opp: ['dumpling', 'roll1', 'tempura'], oppPrefers: ['roll1', 'tempura'] }); },
      success: function () { return count(0, 'dumpling') >= 4; },
      fail: firstWrong(['dumpling'], 'Buns only pay off in a stack: 3 buns 6, 4 buns 10. You stopped short.'),
      hints: ['Your hand has one bun now; another comes round next turn.', { say: 'Take the Steam Bun.', target: dish('dumpling') }],
      debrief: 'Four buns: 10 points. Every extra bun is worth more than the last.' },
    { id: 'deny', title: 'Hands pass on', rule: 'Three Fish Slices score 10. Your hand passes to the next diner, so what you leave, they can take.', par: 1,
      goal: function () { return bo() + ' has two Fish Slices. Stop ' + bo() + ' making three.'; },
      setup: function () { return stack({ oppT: ['sashimi', 'sashimi'], me: ['sashimi', 'egg', 'salmon'], opp: ['roll1', 'egg', 'tempura'], oppPrefers: ['sashimi', 'roll1'] }); },
      success: function () { return count(0, 'sashimi') > 0; },
      fail: function () { return count(1, 'sashimi') >= 3 ? 'You passed the Fish Slice on and ' + bo() + ' took it: three slices, 10 points for ' + bo() + '.' : false; },
      hints: ['After this turn, your hand goes to the next diner.', { say: 'Take the Fish Slice so your rival never sees it.', target: dish('sashimi') }],
      debrief: 'Blocked. Sometimes the best dish is the one your rival needs.' },
    { id: 'rolls', title: 'Most rolls', rule: 'Count roll icons at the end of the round: most scores 6, second most 3.', par: 1,
      goal: function () { return bo() + ' has 2 roll icons. End the round with more.'; },
      setup: function () { return stack({ oppT: ['roll2'], me: ['roll3', 'salmon', 'tempura'], opp: ['egg', 'dumpling', 'salmon'], oppPrefers: ['roll3', 'egg'] }); },
      success: function () { return icons(0) > icons(1); },
      fail: function () { return icons(1) >= 5 ? bo() + ' took the 3-roll: most icons, 6 points for ' + bo() + '.' : false; },
      hints: ['Look at the little roll icons on each Seaweed Roll.', { say: 'The 3-icon roll beats 2.', target: dish('roll3') }],
      debrief: '3 icons beat 2: most rolls, 6 points.' },
    { id: 'sticks', title: 'Twin Sticks', rule: 'Twin Sticks on your tray let you take two dishes in one turn; the sticks go back into the hand.', par: 1,
      goal: 'Take BOTH Crispy Prawns this turn.',
      setup: function () { return stack({ myT: ['chop'], me: ['tempura', 'tempura', 'egg'], opp: ['salmon', 'dumpling', 'roll1'], oppPrefers: ['salmon'] }); },
      success: function () { return count(0, 'tempura') >= 2; },
      fail: function () { return picks() >= 1 && count(0, 'tempura') < 2 ? 'One dish only. Tap your Twin Sticks first, then tap two dishes.' : false; },
      hints: ['Your Twin Sticks are on your tray. Tap them.', { say: 'Tap the sticks, then both prawns.', target: '#tbl .seat.me .grp.usable' }],
      debrief: 'Two dishes, one turn: the prawn pair scores 5.' }
  ];
  lessons.forEach(function (s) { s.moves = picks; });
  var go = function () {
    if (!ready()) { setTimeout(go, 200); return; }
    // the rival plays the lesson's script; lesson games are never saved over the player's real game
    var oc = KK.AI.choose; KK.AI.choose = function (Gm, seat) {
      if (GXST.active() && Gm === G && seat === 1) { var mv = KK.moves(Gm, 1).filter(function (m) { return m.pick.length === 1; }), pref = L.opp || [];
        for (var i = 0; i < pref.length; i++) for (var j = 0; j < mv.length; j++) if (K(mv[j].ids[0]) === pref[i]) return mv[j];
        if (mv.length) return mv[0]; }
      return oc.apply(this, arguments);
    };
    var os = autoSave; autoSave = function () { if (!GXST.active()) return os.apply(this, arguments); };
    GXST.init({ game: 'kaiten', scenarios: lessons, keepClear: ['#tbl .seat', '#belt'], settled: function () { return !UI.busy && !UI.cards.length && !UI.fz && !UI.rq.length; } }).picker();
  };
  setTimeout(go, 300);
})();

// Final Approach: scenario lessons on the shared engine (shell/gx-scenario-tutor.js, docs shell/GXST.md).
// Spec: games-src/final-approach/LESSONS-SPEC.md. Pattern: games-src/cauldron-fair/lessons.js.
// The player is the Pilot (seat 0). The co-pilot (seat 1) is scripted through FA.AI.move.
(function () {
  if (!window.GXST) return;
  var $ = function (s) { return document.querySelector(s); };
  var L = { on: false, n: 0, script: [] };   // n = the player's own placements (for par); script = co-pilot moves
  var DD = function () { return (typeof D !== 'undefined' && D) || FA.D; };
  var until = function (f, ms) {
    var t0 = Date.now();
    return new Promise(function (r) {
      (function w() {
        var ok = false;
        try { ok = f(); } catch (e) { }
        if (ok || Date.now() - t0 > ms) r(ok); else setTimeout(w, 60);
      })();
    });
  };
  var settled = function () {
    return typeof UI !== 'undefined' && typeof PX !== 'undefined' &&
      !UI.busy && PX.tw.length === 0 && PX.parts.length === 0 && !PX.endA;
  };
  var die = function (seat, i) { return function () { return $('#pz .die[data-s="' + seat + '"][data-d="' + i + '"]'); }; };
  var generic = function () { return G.result && !G.result.win ? G.result.msg : false; };
  var sumDice = function (a) { var s = 0; a.forEach(function (v) { s += v; }); return s; };
  var freeVals = function () { return G.dice[0].filter(function (d) { return !d.u; }).map(function (d) { return d.v; }); };
  var openIdx = function (arr) { var o = []; arr.forEach(function (v, i) { if (!v) o.push(i); }); return o; };

  // Set up a lesson on a plain 2-seat flight. sp fields are all optional:
  // pos, planes [4], axis, coffee, rr, sw {lg,fl,br}, final, dice [[p0..p3],[c0..c3]], cop [[dieIndex, slotKey], ...], seed
  function stack(sp) {
    try { GX.close(); } catch (e) { }
    try { GXH.setEnabled(false); GXH.hide(); } catch (e) { }
    try { closeRS(true); } catch (e) { }
    L.on = true; L.n = 0; L.script = sp.cop || [];
    UI.seed = sp.seed || 7;
    newGame('vs', { scenario: 'tt', role: 0, level: 'normal', tipsOff: true });
    UI.coach.level = 'off';
    try { closeRS(true); } catch (e) { }   // newGame opens the flight story card on a wide screen; it would sit over the lesson
    if (sp.pos != null) G.pl.pos = sp.pos;
    if (sp.planes) G.planes = sp.planes.slice();
    if (sp.axis != null) G.pl.axis = sp.axis;
    if (sp.coffee != null) G.coffee = sp.coffee;
    if (sp.rr != null) G.rrHand = sp.rr;
    if (sp.sw) {
      G.pl.sw = sp.sw;
      G.pl.aeroB = 4 + sumDice(sp.sw.lg);
      G.pl.aeroO = 8 + sumDice(sp.sw.fl);
    }
    if (sp.final) G.round = DD().rounds - 1 - G.row0;
    render();
    // generous limits: they end the moment the phase arrives, and under a sped-up clock (tests) 8 s of game time passed before the roll,
    // so the scripted dice were set and then overwritten by the real roll
    return until(function () { return G.phase === 'brief' || G.phase === 'place'; }, 60000).then(function () {
      if (G.phase === 'brief') commit(0, { t: 'ready' });
      return until(function () { return G.phase === 'place'; }, 60000);
    }).then(function () {
      if (sp.dice) sp.dice.forEach(function (row, s) {
        row.forEach(function (v, i) { var d = G.dice[s][i]; d.v = v; d.u = false; });
      });
      G.turn = 0; G.first = 0; G.events = []; UI.evN = G.evN;
      // the real roll's fly-in tween may still run; a value change would replace it and leave the die invisible above the board,
      // so drop the tray dice sprites and let render() place them fresh at their tray spots
      try { if (typeof PX !== 'undefined' && PX.objs) [...PX.objs.keys()].filter(function (k) { return /^die:/.test(k); }).forEach(function (k) { pxKill(k, PX.objs.get(k)); }); } catch (e) { }
      render();
      return new Promise(function (r) { setTimeout(r, 400); });
    });
  }

  var lessons = [
    { id: 'axis', title: 'Level flight', par: 1, moves: function () { return L.n; },
      rule: 'The axis tilts by the difference of the two axis dice. Three tilts is a spin.',
      goal: 'Put the plane in level flight.',
      setup: function () { return stack({ dice: [[4, 3, 6, 1], [4, 2, 5, 3]], cop: [[0, 'ax1']] }); },
      success: function () { return !!(G.slots.ax0 && G.slots.ax1 && G.pl.axis === 0); },
      fail: function () {
        if (G.slots.ax0 && G.slots.ax1 && G.pl.axis !== 0) return 'The axis dice differ by ' + Math.abs(G.pl.axis) + ': the plane tilts ' + Math.abs(G.pl.axis) + '. Equal dice keep it level.';
        return generic();
      },
      hints: ['How far apart are the two axis dice?', { say: 'Put the 4 on the first axis slot.', target: die(0, 0) }],
      debrief: 'Same number on both axis dice: no tilt.' },

    { id: 'speed', title: 'Engine speed', par: 1, moves: function () { return L.n; },
      rule: 'Speed is the sum of both engine dice. Up to 4 stays, 5 to 8 moves 1 space, 9 or more moves 2.',
      goal: 'Move the plane exactly 1 space.',
      setup: function () { return stack({ pos: 1, dice: [[2, 5, 1, 6], [4, 3, 2, 6]], cop: [[0, 'en1']] }); },
      success: function () { return !!(G.slots.en0 && G.slots.en1 && G.pl.pos === 2); },
      fail: function () {
        if (G.slots.en0 && G.slots.en1 && G.pl.pos !== 2) return 'Speed set: the plane moved ' + (G.pl.pos - 1) + ' spaces.';
        return generic();
      },
      hints: ['Add both engine dice. 5 to 8 moves one space.', { say: 'Put the 2 on the first engine slot.', target: die(0, 0) }],
      debrief: 'A sum of 5 to 8 moves the plane one space.' },

    { id: 'radio', title: 'Clear the way', par: 2, moves: function () { return L.n; },
      rule: 'A radio die of 1 clears a plane on your own space. Clear it before you move away or you collide.',
      goal: 'Fly to space 2 without a collision.',
      setup: function () { return stack({ pos: 1, planes: [1, 0, 0, 0], dice: [[1, 4, 6, 3], [4, 3, 2, 6]], cop: [[0, 'en1']] }); },
      success: function () { return !!(G.pl.pos >= 2 && !G.result); },
      fail: generic,
      hints: ['A plane sits on your space. Which die can clear it?', { say: 'Put the 1 on the first radio slot.', target: die(0, 0) }],
      debrief: 'Clear the plane first, then move. Moving away first causes a collision.' },

    { id: 'gear', title: 'Landing gear', par: 2, moves: function () { return L.n; },
      rule: 'Each gear space takes a pair of values (1-2, 3-4, 5-6). A green gear raises the blue speed marker.',
      goal: 'Turn the last two gear lights green.',
      // the third gear is already down: 4 dice minus the mandatory axis and engine dice leave 2 free placements
      setup: function () { return stack({ sw: { lg: [0, 0, 1], fl: [0, 0, 0, 0], br: [0, 0, 0] }, dice: [[5, 2, 4, 6], [3, 3, 3, 3]], cop: [[0, 'co0']] }); },
      success: function () { return G.pl.sw.lg.every(function (v) { return !!v; }); },
      fail: function () {
        var open = openIdx(G.pl.sw.lg);
        if (!open.length) return generic();
        var vals = freeVals();
        var fits = open.some(function (ix) {
          var pair = DD().gear[ix] || [];
          return vals.some(function (v) { return pair.indexOf(v) >= 0; });
        });
        return fits ? generic() : 'No die left fits the open gear. Match each die to its pair.';
      },
      hints: ['Each gear space shows two numbers. Match a die to each.', { say: 'Put the 2 on the first gear space.', target: die(0, 1) }],
      debrief: 'Each gear space takes one die from its pair. Green gear raises the speed marker.' },

    { id: 'brakes', title: 'Brakes in order', par: 2, moves: function () { return L.n; },
      rule: 'The brakes take exactly 2, then 4, then 6, in that order.',
      goal: 'Set the brakes to 4.',
      setup: function () { return stack({ dice: [[4, 2, 6, 3], [3, 3, 3, 3]], cop: [[0, 'co0']] }); },
      success: function () { return !!(G.pl.sw.br[0] && G.pl.sw.br[1]); },
      fail: function () {
        var br = G.pl.sw.br, vals = freeVals();
        var no2 = !br[0] && vals.indexOf(2) < 0;
        var no4 = !br[1] && vals.indexOf(4) < 0;
        return (no2 || no4) ? 'The 2 or the 4 is gone. The brakes need a 2 first, then a 4.' : generic();
      },
      hints: ['The 4 will not fit yet. Which die opens the brakes?', { say: 'Put the 2 on the first brake space.', target: die(0, 1) }],
      debrief: 'Brakes go 2, then 4, then 6. Skipping a step leaves the brakes open.' },

    { id: 'coffee', title: 'Fix a die with coffee', par: 3, moves: function () { return L.n; },
      rule: 'A die on a Concentration space earns a coffee. Spend it to change a die by 1.',
      goal: 'Set the first brake with coffee.',
      setup: function () { return stack({ coffee: 0, dice: [[1, 6, 5, 3], [3, 3, 3, 3]], cop: [[0, 'ax1']] }); },
      success: function () { return !!G.pl.sw.br[0]; },
      fail: function () {
        if (G.pl.sw.br[0]) return generic();
        var freeC = ['co0', 'co1', 'co2'].some(function (k) { return !G.slots[k]; });
        var unused = G.dice[0].filter(function (d) { return !d.u; });
        var maxC = G.coffee + (freeC && unused.length >= 2 ? 1 : 0);
        var possible = unused.some(function (d) { return Math.abs(d.v - 2) <= maxC; });
        return possible ? generic() : 'No coffee left to turn a die into a 2. Earn coffee on a Concentration space first.';
      },
      hints: ['No die is a 2. How do you change one?', { say: 'Put the 6 on a Concentration space.', target: die(0, 1) }],
      debrief: 'Coffee changes a die by 1. Earn it on a Concentration space, then spend it.' },

    { id: 'touchdown', title: 'Touchdown', par: 4, moves: function () { return L.n; },
      rule: 'Landing needs gear, flaps, a level axis, a clear strip, and speed no higher than the brakes.',
      goal: 'Land the plane.',
      setup: function () {
        return stack({ final: true, pos: 4, planes: [0, 0, 0, 0], axis: 0,
          sw: { lg: [1, 1, 1], fl: [1, 1, 1, 1], br: [1, 1, 0] },
          dice: [[3, 2, 6, 5], [3, 2, 3, 3]], cop: [[0, 'ax1'], [1, 'en1'], [2, 'co0'], [3, 'co2']] });   // co-pilot: 3 levels the axis, 2 + 2 = speed 4 = brakes
      },
      success: function () { return !!(G.result && G.result.win); },
      fail: generic,
      hints: ['Match the axis dice. Keep speed at or under the brakes. The plane lands once every die is placed.', { say: 'Put the 3 on the first axis slot.', target: die(0, 0) }],
      debrief: 'Gear, flaps, level axis, clear strip and safe speed: the plane lands.' }
  ];

  // Co-pilot script: the scripted move for the next unused co-pilot die, otherwise the normal AI.
  function wrapAI() {
    var oa = FA.AI.move;
    FA.AI.move = function (Gx, seat) {
      if (L.on && GXST.active() && Gx === G && seat === 1) {
        if (Gx.phase === 'brief') return Gx.ready[1] ? null : { t: 'ready' };
        if (Gx.phase === 'place' && !Gx.pend && Gx.turn === 1) {
          var used = Gx.dice[1].filter(function (d) { return d.u; }).length;
          var e = L.script[used];
          if (e && !Gx.dice[1][e[0]].u && !Gx.slots[e[1]]) return { t: 'place', d: e[0], to: e[1], c: 0 };
        }
      }
      return oa.apply(this, arguments);
    };
  }

  var go = function () {
    if (typeof G === 'undefined' || typeof newGame !== 'function' || typeof FA === 'undefined' ||
        typeof commit !== 'function' || typeof render !== 'function' || typeof UI === 'undefined') {
      setTimeout(go, 200); return;
    }
    wrapAI();
    // count the player's own placements for par
    window.FALessonHook = function (seat, m) { if (L.on && seat === 0 && m && m.t === 'place') L.n++; };
    var slot = document.createElement('div'); slot.id = 'gxst-slot'; slot.hidden = true; document.body.appendChild(slot);
    window.addEventListener('gxst', function (e) {
      if (e.detail.type === 'close' || e.detail.type === 'picker') L.on = false;
      else if (e.detail.type === 'start' || e.detail.type === 'retry') L.on = true;
    });
    // phone: the card lives in the strip between the dice trays and the action bar, so it never covers a die or a slot
    var phoneSlot = function () {
      var top = 0, acts = $('#acts'), ar = acts && acts.getBoundingClientRect(), t = document.querySelectorAll('#pz .tray');
      for (var i = 0; i < t.length; i++) { var r = t[i].getBoundingClientRect(); if (r.height > 4 && r.bottom > top) top = r.bottom; }
      if (!top || !ar || ar.height < 4) return null;
      return { left: 4, top: Math.round(top + 4), width: innerWidth - 8, height: Math.round(ar.top - top - 8) };
    };
    GXST.init({ game: 'final-approach', scenarios: lessons, qParent: '#gxst-slot', keepClear: ['#pz', '#acts'], settled: settled, phoneSlot: phoneSlot });
    window.FALessons = { open: function () { GXST.picker(); } };
    var m = /[?&]lesson=([^&#]+)/.exec(location.search);
    if (m) GXST.start(decodeURIComponent(m[1]));
    else if (/[?&]lessons=1/.test(location.search)) GXST.picker();
  };
  setTimeout(go, 300);
})();

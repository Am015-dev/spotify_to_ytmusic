// Nebula Aces: scenario lessons on the shared engine (shell/gx-scenario-tutor.js, docs shell/GXST.md, spec orch/TUTORIAL-SPEC.md).
// Seven short flights, one rule each. Every lesson builds a real two-ship position with the game's own engine, scripts the rival's
// dial and the dice (while a lesson runs), and judges the real state after the shooting. The old staged duel (tutor.js) stays in the file
// but is no longer offered: every entry point (title, menu, story) opens the lesson picker.
// RULE -> LESSON:
//   plan a dial, ships fly their maneuver, only targets inside the firing arc can be shot ..................... aim
//   range 1 gives the attacker an extra die, range 3 gives the defender one ................................... range
//   Focus action: spend the token to turn focus results into hits ............................................ focus
//   Evade action: the token adds one evade result while defending ............................................. evade
//   red maneuvers give stress; only green clears it; a stressed ship cannot take an action ................... stress
//   Target lock action: reroll up to two attack dice ......................................................... lock
//   the edge of the mat: a ship that leaves it is lost ....................................................... edge
// Not taught here (rules cards and the bulb cover them): barrel roll, boost, bumping, asteroids, upgrades, initiative ties, damage cards.
(function () {
  if (!window.GXST || typeof G === 'undefined' || typeof newGame !== 'function') return;
  var L = { on: false, n: 0, shots: [], a0: [], d0: [], a1: ['blank'], d1: [], foe: null, force: null };
  window.NBL = L;   // read by lessons-test.js
  var $ = function (s) { return document.querySelector(s); };
  var me = function () { return ship('s1'); }, foe = function () { return ship('s2'); };
  var harm = function (s) { return s ? s.shMax - s.sh + s.dmg.length + (s.alive ? 0 : s.hull) : 0; };
  var over = function () { return !!G && (G.round >= 2 || !!G.winner); };
  var mix = function (s, m) { return dialOf(s).findIndex(function (x) { return x.s === m.s && x.t === m.t && (m.d == null || x.d === m.d); }); };
  var live = function () { return L.on && window.GXST && GXST.active(); };
  var mine = function () { return L.shots.filter(function (x) { return x.side === 0; }); };
  var theirs = function () { return L.shots.filter(function (x) { return x.side === 1; }); };

  // ---- scripted dice, rival dial and rival actions, only while a lesson runs
  { var o = rollN; rollN = function (faces, n) {
      if (live() && G && G.atk && (faces === ATK_FACES || faces === DEF_FACES)) {
        var atk = faces === ATK_FACES, side = ship(atk ? G.atk.a : G.atk.d).side, q = (L[(atk ? 'a' : 'd') + side] || []).slice(0, n);
        while (q.length < n) q.push('blank');
        return q;
      }
      return o.apply(this, arguments); }; }
  { var o2 = rnd; rnd = function (n) { if (live() && L.force && L.force.length && n === 8) return L.force.shift(); return o2.apply(this, arguments); }; }
  { var o3 = applyAtkMod; applyAtkMod = function (k, sel) { if (live() && k === 'tl' && sel && sel.length && L.relock) L.force = L.relock.slice(0, sel.length); return o3.apply(this, arguments); }; }
  { var o4 = aiPlan; aiPlan = function (k) {
      if (!(live() && k === 1 && L.foe)) return o4.apply(this, arguments);
      for (var s of alive().filter(function (x) { return x.side === 1; })) { var i = mix(s, L.foe); if (i >= 0) s.dial = i; else return o4.apply(this, arguments); } }; }
  { var o5 = aiAction; aiAction = function (s) { if (live() && s.side === 1) return ['skip']; return o5.apply(this, arguments); }; }
  // the rival always takes a shot it can take (the evade lesson needs the shot to happen even against an evading ship)
  { var o9 = aiTarget; aiTarget = function (s) { var r = o9.apply(this, arguments); if (live() && s.side === 1 && r[0] === 'skip') { var w = weaponsFor(s)[0]; if (w && w.targets.length) return [w.k, w.targets[0].id]; } return r; }; }
  { var o6 = save; save = function () { if (live() || L.on) return; return o6.apply(this, arguments); }; }
  { var o7 = afterAttackDone; afterAttackDone = function (s) { if (L.on && G && G.atk) L.shots.push({ side: s.side, rg: G.atk.rg, dice: G.atk.dice.slice() }); return o7.apply(this, arguments); }; }
  { var o8 = performMove; performMove = function (mv, side) {
      var r = o8.apply(this, arguments);
      if (r && r.success && L.on && mv && (side == null || side === 0) && (mv.act === 'dial' || (mv.act === 'action' && mv.a !== 'skip') || (mv.act === 'fire' && mv.w !== 'skip'))) L.n++;
      return r; }; }

  // ---- build a two-ship position. sp: me, foe (pilot ids), mp {x,y,h}, fp {x,y,h}, foeMove {s,t}, a0/d0/a1/d1 dice faces, stress
  function stage(sp) {
    try { var sk = $('[data-gxt-skip]'); if (sk) sk.click(); } catch (e) { }
    try { GX.close(); } catch (e) { } try { toggleMenu(false); } catch (e) { } try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } try { GXC.close(); } catch (e) { }
    window.TUTPH = true; try { PHN.apply(); } catch (e) { } try { boot3D(); } catch (e) { }
    if (typeof NET !== 'undefined' && NET.on) netLeave(true);
    Object.assign(UI, { mode: 'solo', camp: null, info: false, stats: false, rules: false, build: null, draft: {}, pass: null, sel: null, sugCache: null, autoSetup: false, advOpen: false, hints: false, hold: null, holdK: [], paused: false, sumSeen: 0 });
    L.on = true; L.n = 0; L.shots = []; L.force = null; L.relock = sp.relock || null;
    L.a0 = sp.a0 || []; L.d0 = sp.d0 || []; L.a1 = sp.a1 || ['blank']; L.d1 = sp.d1 || []; L.foe = sp.foeMove || { s: 2, t: 'S' };
    newGame({ fac: [0, 1], players: [{ human: true }, { human: false, lvl: 'easy' }], squads: [[{ p: sp.me || 'kael', u: [] }], [{ p: sp.foe || 'slate', u: [] }]], ex: { noRocks: true }, seed: sp.seed || 20261124 });
    while (G.phase === 'ask' && G.q && G.q.key === 'deploy' && G.round === 0) { var q = G.q; resolveAsk(q.opts[Math.floor(q.opts.length / 2)].k); if (G.q && G.q.kid === q.kid) break; }
    Object.assign(me(), sp.mp); Object.assign(foe(), sp.fp); me().stress = sp.stress || 0;
    resetGuide(); flowReset(); try { BF.seenBrief = G.seed; PHN.briefSeen = G.seed; BF.key = ''; BF.fkey = ''; BF.sel = null; BF.sub = null; BF.hideBan(); } catch (e) { }
    UI.wonSnd = G.seed; camView('tilt'); render();
    return new Promise(function (res) { var t = 0, iv = setInterval(function () { if ((G.phase === 'plan' && !UI.info) || ++t > 100) { clearInterval(iv); setTimeout(res, 300); } }, 100); });
  }
  var ME = { x: 457, y: 150, h: Math.PI / 2 }, FOE = { x: 457, y: 520, h: -Math.PI / 2 };   // the rival flies a straight 2 toward you and ends at y 400
  // the maneuver wheel: the item for a maneuver while the dial is open, else the ship ring (tap it to open the dial)
  var man = function (sp, t, d) { return function () {
    try { var ix = mix(me(), { s: sp, t: t, d: d }), k = BF.dlist.findIndex(function (o) { return o.i === ix; }), e = k >= 0 && $('#bfdial:not([hidden]) .ditem[data-k="' + k + '"]'); if (e) return e; } catch (x) { }
    return $('.bfring.need') || $('[data-bf=dlock]'); }; };
  var act = function (a) { return function () { return $('.bfact[data-bfa="' + a + '"]') || $('.bfring.need') || $('[data-bf=dlock]') || $('[data-bf=fly]'); }; };
  var ring = function () { return $('.bfring.need') || $('.qc.me'); };
  var noShot = 'Your guns fire forward only, and the Slate ended outside that arc. Straight moves keep it ahead.';

  var lessons = [
    { id: 'aim', title: 'Aim', rule: 'You can only shoot what is inside your forward arc. Straight moves keep a target ahead; turns swing the nose away.', par: 2,
      goal: 'Hit the Slate this round.',
      setup: function () { return stage({ mp: ME, fp: FOE, a0: ['hit', 'blank', 'blank', 'blank'], d0: [], d1: [] }); },
      success: function () { return harm(foe()) > 0; },
      fail: function () { return over() ? (mine().length ? 'The shot missed. Try again.' : noShot) : false; },
      hints: ['Where will the Slate be, and which of your moves keeps it in front?', { say: 'Fly straight: the Slate stays in your arc.', target: man(1, 'S') }],
      debrief: 'Straight keeps it ahead. A bank or turn points your guns elsewhere.' },
    { id: 'range', title: 'Range', rule: 'Range 1 gives the attacker an extra die. Range 3 gives the defender one. Get close.', par: 2,
      goal: 'Destroy the Slate this round.',
      setup: function () { return stage({ mp: ME, fp: { x: 457, y: 600, h: -Math.PI / 2 }, a0: ['hit', 'hit', 'hit', 'hit', 'hit'], d1: ['evade', 'blank', 'blank', 'blank'] }); },
      success: function () { return !foe().alive; },
      fail: function () { if (!over()) return false; var s = mine()[0]; return s ? 'At range ' + s.rg + ' it survived. Only range 1 adds an attack die: fly the long straight.' : noShot; },
      hints: ['Count the range bands. Which straight ends closest to it?', { say: 'The longest straight ends at range 1: four attack dice.', target: man(4, 'S') }],
      debrief: 'Range 1 means four attack dice against its three: enough to kill it.' },
    { id: 'focus', title: 'Focus', rule: 'Take the Focus action, then spend the token while attacking: every focus result becomes a hit.', par: 3,
      goal: 'Deal 2 damage to the Slate.',
      setup: function () { return stage({ mp: ME, fp: FOE, a0: ['focus', 'focus', 'blank', 'blank'], d0: [] }); },
      success: function () { return harm(foe()) >= 2; },
      fail: function () { if (!over()) return false; return mine().length ? 'Focus results are blanks until you spend a focus token. Take the Focus action, then spend it.' : noShot; },
      hints: ['Your dice show focus faces. What turns them into hits?', { say: 'Take Focus after you move, then spend it on the dice.', target: act('F') }],
      debrief: 'Focus action first, token spent second: two focus faces became two hits.' },
    { id: 'evade', title: 'Evade', rule: 'The Evade action gives one evade result when you defend, before any dice are rolled.', par: 2, me: 'knife',
      goal: 'Take no damage this round.',
      setup: function () { return stage({ me: 'knife', mp: { x: 457, y: 500, h: Math.PI / 2 }, fp: { x: 457, y: 300, h: Math.PI / 2 }, a1: ['hit', 'blank', 'blank'], d0: [] }); },
      success: function () { return theirs().length > 0 && harm(me()) === 0 && me().alive; },
      fail: function () { if (!me().alive) return 'Your ship left the mat and is lost.'; if (!over()) return false; return theirs().length ? 'The hit landed: you rolled no evade results. Take the Evade action first, then spend the token.' : 'The Slate never got a shot, so nothing was tested. Stay in front of it.'; },
      hints: ['The Slate is behind you and will fire. What can you add to your defence?', { say: 'Take Evade after you move, then spend the token.', target: act('E') }],
      debrief: 'One evade token cancelled its only hit.' },
    { id: 'stress', title: 'Stress', rule: 'Red maneuvers add stress. Only a green maneuver clears it, and a stressed ship cannot take an action.', par: 3, stress: 1,
      goal: 'Clear your stress and deal 2 damage.',
      setup: function () { return stage({ mp: ME, fp: FOE, stress: 1, a0: ['focus', 'focus', 'blank', 'blank'], d0: [] }); },
      success: function () { return me().stress === 0 && harm(foe()) >= 2; },
      fail: function () { if (!over()) return false; if (me().stress > 0) return 'Still stressed: a white maneuver keeps it, and a stressed ship cannot take Focus. Fly a green one.'; return mine().length ? 'You cleared the stress but never spent a focus token on the shot.' : noShot; },
      hints: ['You start with a stress token. Which maneuvers are green?', { say: 'Green straight 2 clears stress; then Focus and fire.', target: man(2, 'S') }],
      debrief: 'Green cleared the stress, so the Focus action was allowed again.' },
    { id: 'lock', title: 'Target lock', rule: 'Target lock lets you reroll up to two attack dice. Use it when the roll misses and Focus cannot help.', par: 3, relock: [0, 0],
      goal: 'Deal 2 damage to the Slate.',
      setup: function () { return stage({ mp: ME, fp: FOE, a0: ['blank', 'blank', 'blank', 'blank'], d0: [], relock: [0, 0] }); },
      success: function () { return harm(foe()) >= 2; },
      fail: function () { if (!over()) return false; return mine().length ? 'Your dice were all blanks and Focus cannot fix blanks. Take Target lock, then reroll the dice.' : noShot; },
      hints: ['Every attack die is a blank. Which action lets you roll again?', { say: 'Take Target lock, then reroll two dice.', target: act('TL') }],
      debrief: 'Focus changes focus faces only. A lock gets you a second roll.' },
    { id: 'edge', title: 'Mat edge', rule: 'A ship that leaves the mat is destroyed. Check where a maneuver ends before you lock it in.', par: 1,
      goal: 'End the round with your ship on the mat.',
      setup: function () { return stage({ mp: { x: 457, y: 700, h: Math.PI / 2 }, fp: { x: 140, y: 150, h: -Math.PI / 2 }, foeMove: { s: 2, t: 'S' } }); },
      success: function () { return me().alive && over(); },
      fail: function () { return !me().alive ? 'Your ship left the mat and is gone. The planner marks moves that end off the mat.' : false; },
      hints: ['You are close to the top edge. How far does each straight go?', { say: 'A short straight keeps you on the mat.', target: man(1, 'S') }],
      debrief: 'A short move stayed inside. Always look at the end of the arrow.' }
  ];
  lessons.forEach(function (s) { s.moves = function () { return L.n; }; });

  var go = function () {
    if (!(typeof UI !== 'undefined' && typeof GX !== 'undefined' && window.GXH && typeof render === 'function')) { setTimeout(go, 200); return; }
    GXST.init({ game: 'nebula-aces', scenarios: lessons, keepClear: ['.bfring', '#bfdial', '#bfbtns', '#bfdice', '.bfm', '.bfact', '.bftgt', '#bftop', '.bfdial'],
      settled: function () { return !!G && G.phase !== 'setup' && !UI.busy; } });
    window.addEventListener('gxst', function (ev) {
      var t = ev.detail && ev.detail.type;
      if (t === 'close' && L.on) { L.on = false; window.TUTPH = false; try { PHN.apply(); } catch (e) { } try { UI.info = true; render(); } catch (e) { } }
    });
    if (/[?&]lessons=1/.test(location.search)) GXST.picker();
    var one = /[?&]lesson=([a-z]+)/.exec(location.search); if (one) GXST.start(one[1]);   // ?lesson=<id> opens one lesson (contact sheets)
  };
  setTimeout(go, 300);
})();

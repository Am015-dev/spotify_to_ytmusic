// Shipwreck Isle: scenario lessons on the shared engine (shell/gx-scenario-tutor.js, docs shell/GXST.md). Replaces the dimming / coached tutorial.
// Each lesson stacks a tiny REAL island (one castaway, two pawns, a few tiles) and judges the real game after the day has played out.
(function () {
  'use strict';
  if (!window.GXST) return;
  var $ = function (s) { return document.querySelector(s); };
  // counted in polls, not in clock time: the test harness runs the clock 100x faster, and a clock-based timeout would give up before the page had drawn
  var until = function (f, ms) { var n = Math.ceil(ms / 5); return new Promise(function (r) { (function w() { var ok = false; try { ok = f(); } catch (e) { } if (ok || n-- <= 0) r(ok); else setTimeout(w, 5); })(); }); };
  var ready = function () { return typeof G !== 'undefined' && typeof beginGame === 'function' && typeof UI !== 'undefined' && typeof PHO !== 'undefined' && typeof DICE !== 'undefined'; };
  var L = { dice0: null, keep: null, r0: 1, w0: 0 };
  var glow = function (t) { return function () { return $('#bfglow>[data-t="' + t + '"]'); }; };
  var me = function () { return G.chars[0]; };
  var dayDone = function () { return !!G && (G.round > L.r0 || !!G.over); };
  var wounds = function () { return G.stats.wounds - L.w0; };
  function stack(sp) {
    try { GX.close(); } catch (e) { } try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } try { closeMenu(); } catch (e) { } try { PHO.closePop(true); } catch (e) { }
    if (!L.dice0) { L.dice0 = {}; for (var k in DICE) L.dice0[k] = DICE[k].slice(); }
    for (var k2 in L.dice0) DICE[k2] = L.dice0[k2].slice();
    var dd = sp.dice || {}; for (var k3 in dd) DICE[k3] = [dd[k3], dd[k3], dd[k3], dd[k3], dd[k3], dd[k3]];
    AIDELAY = 60; UI.speed = 1; UI.auto = true; UI.modal = null; UI.pause = false;
    Object.assign(UI.setup, { scen: 'marooned', chars: sp.chars || ['cook'], ai: {}, friday: !!sp.friday, dog: false, items: 0, diff: 'easy' });
    var keepSeed = DEFSEED; DEFSEED = sp.seed || 7;
    try { beginGame(); } finally { DEFSEED = keepSeed; }
    G.tut = 1; G.learn = 1; G.ev.threat = sp.threat || [null, null]; G.wxT = {}; G.wx = { rain: sp.rain || 0, snow: 0, storm: 0, animals: 0 };
    if (sp.res) Object.assign(G.res, sp.res);
    var t = sp.tiles || {};
    Object.keys(t).forEach(function (p) { G.map[p].tile = t[p]; var i = G.tileDeck.indexOf(t[p]); if (i >= 0) G.tileDeck.splice(i, 1); });
    if (sp.shelter) G.camp.shelter = true;
    if (sp.roof) G.camp.roof = sp.roof;
    if (sp.weapon != null) G.weapon = sp.weapon;
    if (sp.hunt) G.hunt = sp.hunt.slice();
    if (sp.det != null) me().det = sp.det;
    if (sp.pile) G.sc.pile = sp.pile;
    L.r0 = G.round; L.w0 = G.stats.wounds;
    UI.beats.length = 0; UI.shown = -1; refresh();
    return until(function () { return G.phase === 'plan' && /^plan/.test(PHO.st || '') && !UI.modal && $('#bf [data-pawn]'); }, 12000).then(function () { return new Promise(function (r) { setTimeout(r, 900); }); });
  }
  var hand = function (id) { return function () { return $('#bf [data-pawn="' + id + '"]'); }; };
  var camp = function () { return $('#bfglow>[data-t="' + (G ? G.camp.pos : 7) + '"]'); };
  var logHas = function (re) { return (G.log || []).some(function (x) { return re.test(typeof x === 'string' ? x : (x && x.t) || ''); }); };
  var gdone = function () { return dayDone() && !G.over; };
  var T = { a: 2, b: 6, c: 11 };   // places next to the camp (the camp is place 8 = index 7)
  var lessons = [
    { id: 'jobs', title: 'Jobs and food', par: 1,
      rule: 'Each pawn does one job; what it gathers arrives when the day is done. At night each castaway eats 1 food, or takes 2 wounds.',
      goal: 'Your goal: nobody goes hungry tonight.',
      setup: function () { return stack({ res: { food: 0, wood: 3 }, tiles: { 6: 4 }, shelter: true }); },
      success: function () { return gdone() && wounds() === 0; },
      fail: function () { if (!gdone()) return false; return 'The camp had no food at night, so the Cook took ' + wounds() + ' wounds. Fish is food, wood is not.'; },
      hints: ['Food must be in camp by night. Which job brings food?', { say: 'Both pawns to the hills, then Fish.', target: glow(T.b) }],
      debrief: 'Fish gathered in the day is eaten that night.' },
    { id: 'sure', title: 'Dice or sure', par: 1,
      rule: 'One pawn alone rolls dice and can be hurt. A second pawn on the same job makes it sure.',
      goal: 'Your goal: explore new land with nobody hurt.',
      setup: function () { return stack({ res: { food: 4, wood: 3 }, shelter: true, dice: { 'explore-wound': 'wound' } }); },
      success: function () { return gdone() && G.map[T.a].tile != null && wounds() === 0; },
      fail: function () { if (!gdone()) return false; return 'The Cook rolled alone and was hurt. Put a second pawn on the same job: no dice.'; },
      hints: ['The dice hurt a lone pawn. How do you avoid rolling?', { say: 'Send both pawns to explore the same place.', target: glow(T.a) }],
      debrief: 'Two pawns on one job: no dice, no wounds.' },
    { id: 'shelter', title: 'Shelter', par: 1,
      rule: 'A castaway without a shelter takes a wound every night. A shelter costs 2 wood.',
      goal: 'Your goal: sleep tonight without a wound.',
      setup: function () { return stack({ res: { food: 4, wood: 3 } }); },
      success: function () { return gdone() && G.camp.shelter && wounds() === 0; },
      fail: function () { if (!gdone()) return false; return 'Night fell with no shelter, and the Cook took a wound.'; },
      hints: ['Where do you sleep? The camp can build something.', { say: 'Pawn, then the camp, then Shelter. Both pawns, so it is sure.', target: camp }],
      debrief: 'The shelter ends the night wound for good.' },
    { id: 'roof', title: 'Roof', par: 1,
      rule: 'Each rain cloud above the roof spoils 1 food and 1 wood. A roof stops one cloud.',
      goal: 'Your goal: let the rain spoil nothing.',
      setup: function () { return stack({ res: { food: 3, wood: 4 }, shelter: true, rain: 1 }); },
      success: function () { return gdone() && G.camp.roof >= 1 && !logHas(/past the roof/); },
      fail: function () { if (!gdone()) return false; return 'A cloud got past the roof: 1 food and 1 wood were ruined.'; },
      hints: ['Rain is coming. What does the camp need above it?', { say: 'Pawn, then the camp, then Roof. Both pawns.', target: camp }],
      debrief: 'One roof level stops one cloud: nothing spoiled.' },
    { id: 'hunt', title: 'Hunt', par: 1,
      rule: 'A hunt takes 2 pawns. Your weapon must reach the beast strength, or it hurts you.',
      goal: 'Your goal: hunt a beast and eat tonight.',
      setup: function () { return stack({ res: { food: 0, wood: 2 }, shelter: true, weapon: 1, hunt: ['birds', 'fox'] }); },
      success: function () { return gdone() && G.stats.fights > 0 && wounds() === 0; },
      fail: function () { if (!gdone()) return false; return G.stats.fights ? 'The beast was too strong and the Cook was hurt.' : 'Nobody hunted, so nobody ate: ' + wounds() + ' hunger wounds.'; },
      hints: ['Meat is food. Where is the hunt?', { say: 'Pawn, then the camp, then Hunt. Both pawns.', target: camp }],
      debrief: 'Weapon 1 beats the birds (strength 1): 2 food for the night.' },
    { id: 'signal', title: 'Signal pile', par: 1,
      rule: 'You win by stacking wood on the signal pile until a ship comes. One stage a day.',
      goal: 'Your goal: put wood on the signal pile.',
      setup: function () { return stack({ res: { food: 4, wood: 4 }, shelter: true }); },
      success: function () { return gdone() && G.sc.pile >= 1; },
      fail: function () { if (!gdone()) return false; return 'The pile stayed empty. No ship will see a camp with no signal.'; },
      hints: ['The ship needs a signal. Where does wood go?', { say: 'Pawn, then the camp, then Add wood to the signal pile.', target: camp }],
      debrief: 'Every day add a stage. 15 wood and a fire bring the ship.' },
    { id: 'skill', title: 'Determination', par: 1,
      rule: 'Determination pays for skills. The Cook spends 3 for Pebble Broth: 1 free food.',
      goal: 'Your goal: feed the Cook with a skill.',
      setup: function () { return stack({ res: { food: 0, wood: 3 }, shelter: true, det: 3 }); },
      success: function () { return gdone() && wounds() === 0; },
      fail: function () { if (!gdone()) return false; return 'The Cook went hungry with 3 determination unspent.'; },
      hints: ['Your determination can buy food. Where are skills?', { say: 'Open Camp, then tap Pebble Broth.', target: function () { return $('[data-gx="campd"]'); } }],
      debrief: 'Skills turn determination into help, once a day.' },
    { id: 'game', title: 'Short game', par: 2,
      rule: 'Plan, play out the day, eat at night. Repeat.',
      goal: 'Your goal: survive two days in a real game.',
      setup: function () { return stack({ res: { food: 3, wood: 3 }, chars: ['carpenter', 'cook'], friday: true }); },
      success: function () { return !!G && !G.over && G.round >= 3 && G.chars.every(function (c) { return !c.dead; }); },
      fail: function () { return G && G.over ? 'The camp fell on day ' + G.round + '. Eat every night and keep a shelter.' : false; },
      hints: ['Give every pawn a job. The wand suggests a plan.', { say: 'Tap the wand for a plan, then Start day.', target: function () { return $('#bf [data-a="suggest"]'); } }],
      debrief: 'A real game is this loop, 12 days long.' }
  ];
  lessons.forEach(function (l) { l.moves = function () { return 1; }; });
  // ONE highlighted target per lesson, always on while the player plays (the show-me hint's target); the last lesson's win card offers the real game
  var curL = function () { try { var st = GXST.state(); return st && st.open && lessons[st.i] ? { s: lessons[st.i], st: st } : null; } catch (e) { return null; } };
  // phone: the card has ONE fixed slot, over the turn banner just under the island (the goal card says the same thing), so it never jumps and never covers a tile
  var phoneSlot = function () {
    var R = document.documentElement, on = innerWidth < 600 && !!document.querySelector('.gxst-card') && GXST.state().phase !== 'picker';
    R.classList.toggle('lsn-ph', on); if (!on) return;
    var pv = document.querySelector('#phview'), r = pv && pv.getBoundingClientRect();
    var top = r && r.height ? Math.round(r.top) - 26 : Math.round(innerHeight * 0.62);
    var pp = document.querySelector('#ppop'), pr = pp && !pp.hidden ? pp.getBoundingClientRect() : null, card = document.querySelector('.gxst-card');
    if (pr && pr.height > 20 && card && pr.top < top + card.offsetHeight) { var rs = document.querySelector('#bfres'), rr = rs && rs.getBoundingClientRect(); top = rr ? Math.round(rr.bottom + 4) : 60; }   // a job pop-up is open: the card waits at the top, off the pop-up
    if (R.style.getPropertyValue('--lsn-top') !== top + 'px') R.style.setProperty('--lsn-top', top + 'px');
  };
  var markTick = function () {
    try { phoneSlot(); } catch (e) { }
    var c = curL(), want = null;
    if (c && c.st.phase === 'play' && c.st.live) { var h = c.s.hints[1]; try { want = h && h.target ? h.target() : null; } catch (e) { want = null; } }
    var old = document.querySelectorAll('.lsn-mark'); for (var i = 0; i < old.length; i++) if (old[i] !== want) old[i].classList.remove('lsn-mark');
    if (want && !want.classList.contains('lsn-mark')) want.classList.add('lsn-mark');
    if (c && c.st.phase === 'win' && c.st.i === lessons.length - 1) {
      var ft = document.querySelector('.gxst-ft');
      if (ft && !ft.querySelector('.lsn-real')) { var b = document.createElement('button'); b.className = 'gxst-btn lsn-real'; b.type = 'button'; b.textContent = 'Keep playing this game'; b.addEventListener('click', keepPlaying); ft.insertBefore(b, ft.firstChild); }
    }
  };
  // the short game becomes the player's real game: lesson helpers off, their own settings back, the coach and saves back on
  var keepPlaying = function () {
    if (!G) return; G.tut = 0; G.learn = 0;
    if (L.keep) { try { Object.assign(UI.setup, JSON.parse(L.keep.setup)); UI.auto = L.keep.auto; AIDELAY = L.keep.aid; } catch (e) { } }
    if (L.dice0) for (var k in L.dice0) DICE[k] = L.dice0[k].slice();
    try { GXST.close(); } catch (e) { } try { GXH.setEnabled(true); } catch (e) { }
    try { localStorage.setItem('swi_real1', '1'); } catch (e) { }
    try { refresh(); } catch (e) { }
  };
  var leave = function () {
    if (L.keep) { try { Object.assign(UI.setup, JSON.parse(L.keep.setup)); UI.auto = L.keep.auto; AIDELAY = L.keep.aid; } catch (e) { } }
    if (L.dice0) for (var k in L.dice0) DICE[k] = L.dice0[k].slice();
    try { clearTimeout(BF.autoT); BF.autoT = null; BF.cardClear(); } catch (e) { } try { PHO.closePop(true); } catch (e) { }
    G = null; UI.beats.length = 0; UI.shown = -1; UI.sel = null; UI.tileSel = null; try { V3.layout = null; } catch (e) { }
    try { render(); } catch (e) { } try { openStart(); } catch (e) { }
  };
  window.lessonsOpen = function () {
    if (L.keep == null) L.keep = { setup: JSON.stringify(UI.setup), auto: UI.auto, aid: AIDELAY };
    try { GX.close(); } catch (e) { } try { closeMenu(); } catch (e) { }
    UI.modal = null; var m = $('#modal'); if (m) { m.hidden = true; m.innerHTML = ''; m.dataset.h = ''; }
    GXST.picker();
  };
  var go = function () {
    if (!ready() || typeof openStart !== 'function') { setTimeout(go, 200); return; }
    addEventListener('gxst', function (e) { if (e.detail && e.detail.type === 'close' && G && G.tut) leave(); });
    GXST.init({ game: 'shipwreck-isle', scenarios: lessons, keepClear: ['.gx-bar', '#bfres', '#phlabel', '#bfglow>*', '#bf .pawnrow', '#bf .bf-main', '#ppop'], settled: function () { return !!G && (G.over || (G.round > L.r0 && !UI.modal && !G.q && (UI.shown >= UI.beats.length - 1 || /^plan/.test(PHO.st || '')))) } });
  };
  setTimeout(go, 300); setInterval(markTick, 100); addEventListener('gxst', function () { setTimeout(markTick, 0); });
  window.GXLSN = { stack: stack, lessons: lessons, L: L, wounds: wounds, dayDone: dayDone, glow: glow };
})();

// Gloamwar scenario lessons (GXST, shell/gx-scenario-tutor.js, docs shell/GXST.md). They REPLACE the old floating checklist: Help > Lessons and
// "Learn to play" open the lesson picker. Each lesson stages a tiny real position (a few dice, the rival has none) with ONE goal; the player
// makes real moves on the real board and learns the rule from the consequence. Test: node gloamwar/tools/lessons-test.js (402x874 and 1366x768).
//
// RULE -> LESSON
//   the hooded Character die walks the Company one step; each step may wake the hunt .......... walk
//   a revealed Company must hide before it can walk again ...................................... hide
//   a Muster die steps one nation toward war; only nations at war fight ........................ war
//   an Army die moves up to two armies one region; armies can stand together .................. march
//   an Army die attacks next door: dice hit on 5 or 6, a battle ends the fight ................. fight
//   a Muster die raises troops in a town of a nation at war; an elite takes two hits ............ muster
//   an Event die draws a card (hand limit 6) ..................................................... draw
// NOT taught here (gaps): hunt tiles and taint damage, sieges, leaders and re-rolls, Gloam side dice, Will of the Dawn, minions, the Ashen Road, event card play, victory points.
(function () {
  if (!window.GXST) return;
  var $ = function (s) { return document.querySelector(s); };
  var L = { n: 0, base: 0, on: false };
  var ready = function () { return typeof G !== 'undefined' && typeof startGame === 'function' && typeof UI !== 'undefined' && typeof render === 'function' && typeof MV !== 'undefined' && typeof newGame === 'function'; };
  var usedN = function () { return G.used.D.filter(Boolean).length; };
  var elites = function (rid) { var a = G.A[rid], t = 0; if (a) for (var n in a) t += a[n][1]; return t; };
  var tokOf = function (rid, side) { return function () { return document.getElementById('tok-' + rid + '-' + side) || $('[data-tap="s:' + rid + '"]'); }; };
  var dieOf = function (f) { return function () { return $('#mydice .die.can[data-f="' + f + '"]') || $('#mydice .die[data-f="' + f + '"]'); }; };
  var actBtn = function (k) { return function () { return $('#acts .act[data-key="' + k + '"]'); }; };
  // build the real game, then overwrite the table: Dawn dice (the Gloam has none, so the rival never acts), nations, armies, Company, hand
  function stage(sp) {
    try { GX.close(); } catch (e) { } try { GXH.setEnabled(false); GXH.hide(); } catch (e) { } try { if (window.TUT) TUT.stop(); } catch (e) { }
    UI.fast = false; AIDELAY = 20; window.ANIM = false;
    startGame({ side: 'D', level: 'easy', seed: sp.seed || 11, mode: 'lesson', noGoal: true }); clearTimeout(UI.timer);
    L.on = true; L.n = 0;
    G.phase = 'act'; G.act = 'D'; G.pend = null; G.dice = { D: sp.dice.slice(), G: [] }; G.used = { D: sp.dice.map(function () { return false; }), G: [] }; G.hb = { g: sp.hunt || 0, d: 0 };
    G.hand.D = (sp.hand || []).slice(); G.hand.G = [];
    G.F.hid = sp.hid !== false; G.F.tried = false; G.F.moved = 0; G.F.declared = true;
    Object.keys(sp.pol || {}).forEach(function (k) { G.pol[k].s = sp.pol[k][0]; G.pol[k].a = sp.pol[k][1]; });
    Object.keys(sp.A || {}).forEach(function (r) { if (sp.A[r]) G.A[r] = sp.A[r]; else delete G.A[r]; });
    if (sp.focus) { try { MV.focus(sp.focus, MV.k0, false); } catch (e) { } }
    UI.hold = false; UI.die = null; UI.src = null; UI.sub = null; UI.asFace = null;
    render(); L.base = sp.base ? sp.base() : 0;
  }
  var lessons = [
    { id: 'walk', title: 'Walk the Company', rule: 'The hooded Character die walks the Company one step toward the Kiln. A step can wake the Hunt.', par: 1,
      goal: 'Move the Company one step.',
      setup: function () { stage({ dice: ['C', 'X', 'E'], focus: 'lanternvale' }); },
      success: function () { return G.F.tried; },
      fail: function () { return usedN() > 0 && !G.F.tried ? 'That die cannot walk the Company. Only the hooded Character die does.' : false; },
      hints: ['Which of your three dice shows a hooded figure?', { say: 'Tap the hooded die, then Move Company.', target: function () { return UI.die == null ? dieOf('C')() : actBtn('cmove')(); } }],
      debrief: 'One Character die, one step. The Company has now moved, so it is easier to find.' },
    { id: 'hide', title: 'Hide the Company', rule: 'A revealed Company cannot walk until it hides again. Hiding also costs a Character die.', par: 1,
      goal: 'Hide the Company again.',
      setup: function () { stage({ dice: ['C', 'M', 'E'], hid: false, focus: 'lanternvale' }); },
      success: function () { return G.F.hid; },
      fail: function () { return usedN() > 0 && !G.F.hid ? 'That die cannot hide the Company. Use the hooded Character die.' : false; },
      hints: ['The lantern disc is red: the Company is seen. Which die hides it?', { say: 'Tap the hooded die, then Hide Company.', target: function () { return UI.die == null ? dieOf('C')() : actBtn('chide')(); } }],
      debrief: 'Hidden again: next turn it can walk.' },
    { id: 'war', title: 'Wake a nation', rule: 'A Muster die steps one nation closer to war. Only nations at war can fight or muster troops.', par: 1,
      goal: 'Bring Aurelmont to war.',
      setup: function () { stage({ dice: ['M', 'C', 'E'], pol: { au: [1, true], gr: [3, true], df: [3, false] }, focus: 'citadel' }); },
      success: function () { return G.pol.au.s === 0; },
      fail: function () { return usedN() > 0 && G.pol.au.s > 0 ? 'That was the wrong nation. Aurelmont is one step from war: stir it.' : false; },
      hints: ['The nations tab shows how far each nation is from war. Which one is one step away?', { say: 'Tap the scroll die, Stir a nation, then Aurelmont.', target: function () { return UI.die == null ? dieOf('M')() : UI.sub === 'dip' ? actBtn('dip-au')() : actBtn('dip')(); } }],
      debrief: 'Aurelmont is at war: its armies can fight and its towns muster.' },
    { id: 'march', title: 'March an army', rule: 'An Army die moves up to two armies one region each. Tap an army, then a glowing region next to it.', par: 1,
      goal: 'Move the Aurelmont army from the Citadel to the Crossing.',
      setup: function () { stage({ dice: ['X', 'C', 'E'], pol: { au: [0, true] }, A: { citadel: { au: [3, 1, 1] }, crossing: null }, focus: 'citadel' }); },
      success: function () { return !!G.A.crossing && units(G.A.crossing) >= 4; },
      fail: function () { return usedN() > 0 && !(G.A.crossing && units(G.A.crossing) >= 4) && (!G.pend || G.pend.h !== 'amove') ? 'The army did not reach the Crossing. Tap the army, then the glowing Crossing next to it.' : false; },
      hints: ['Which die moves armies? The helmet die does.', { say: 'Tap the helmet die, Move armies, the army, then the Crossing.', target: function () { return UI.die == null ? dieOf('X')() : !G.pend ? actBtn('amove')() : UI.src ? $('[data-tap="s:crossing"]') : tokOf('citadel', 'D')(); } }],
      debrief: 'The whole army stepped to the Crossing: one die, one region.' },
    { id: 'fight', title: 'Attack next door', rule: 'An Army die attacks an enemy army in the next region. Each troop rolls a die: 5 or 6 hits.', par: 1,
      goal: 'Defeat the lone Gloam army next to Ferrystone.',
      setup: function () { stage({ dice: ['X', 'C', 'E'], pol: { hl: [0, true] }, A: { ferrystone: { hl: [4, 1, 0] }, ottercrag: { pt: [1, 0, 0] } }, focus: 'ferrystone' }); },
      success: function () { return !G.pend && !armyAt(G, 'ottercrag', 'G') && G.stats.battles > 0; },
      fail: function () { return usedN() > 0 && !G.pend && G.stats.battles === 0 ? 'No fight happened. Use the helmet die to Attack, then tap the red army.' : (G.stats.battles > 0 && !G.pend && armyAt(G, 'ottercrag', 'G') ? 'The enemy held. Gather more troops before you strike.' : false); },
      hints: ['Which die fights? The helmet die does, and so does crossed swords.', { say: 'Tap the helmet die, Attack, the red army, then fight on.', target: function () { return G.pend && G.pend.h === 'battle' ? $('#battle .btn.pri') || $('#battle .btn') : G.pend ? tokOf('ottercrag', 'G')() : UI.die == null ? dieOf('X')() : actBtn('attack')(); } }],
      debrief: 'Five troops against one: the dice decide, and numbers win.' },
    { id: 'muster', title: 'Raise an elite', rule: 'A Muster die raises troops in a town of a nation at war. An Elite takes two hits.', par: 1,
      goal: 'Muster an Elite at the Citadel.',
      setup: function () { stage({ dice: ['M', 'C', 'E'], pol: { au: [0, true] }, focus: 'citadel', base: function () { return elites('citadel'); } }); },
      success: function () { return elites('citadel') > L.base; },
      fail: function () { var g = G.pend && G.pend.h === 'recruit' ? G.pend.d.got : null; if (g && g.length && g[0].k !== 'e') return 'A Regular takes only one hit. An Elite takes two: pick Elite.'; return usedN() > 0 && !G.pend && elites('citadel') <= L.base ? 'No Elite was raised. Muster, tap the glowing Citadel, then pick Elite.' : false; },
      hints: ['Which die raises troops, and where?', { say: 'Tap the scroll die, Muster, the Citadel, then Elite.', target: function () { return UI.die == null ? dieOf('M')() : !G.pend ? actBtn('recruit')() : UI.src ? actBtn('rec-e')() : $('[data-tap="s:citadel"]'); } }],
      debrief: 'An Elite stands at the Citadel and takes two hits.' },
    { id: 'draw', title: 'Draw a card', rule: 'The raven Event die draws a card. You may hold six.', par: 1,
      goal: 'Draw one card.',
      setup: function () { stage({ dice: ['E', 'C', 'M'], hand: [], focus: 'lanternvale', base: function () { return G.hand.D.length; } }); },
      success: function () { return G.hand.D.length > L.base; },
      fail: function () { return usedN() > 0 && G.hand.D.length <= L.base && !G.pend ? 'That die drew nothing. The raven Event die draws a card.' : false; },
      hints: ['Which die has a raven?', { say: 'Tap the raven die, Draw a card, then pick a deck.', target: function () { return UI.die == null ? dieOf('E')() : UI.sub === 'draw' ? actBtn('draw-DC')() : actBtn('draw')(); } }],
      debrief: 'A card in hand: play it later with an Event die.' }
  ];
  var go = function () {
    if (!ready() || typeof GXST.init !== 'function') { setTimeout(go, 200); return; }
    // lesson games never overwrite the player's saved game and show no result screen
    if (typeof save === 'function') { var os = save; save = function () { if (!GXST.active()) return os.apply(this, arguments); }; }
    var osr = showResult; showResult = function () { if (!GXST.active()) return osr.apply(this, arguments); };
    var oa = apply; apply = function (m, byAI) { try { if (L.on && GXST.active() && !byAI && m && m.t === 'die') L.n++; } catch (e) { } return oa.apply(this, arguments); };
    lessons.forEach(function (s) { s.moves = function () { return L.n; }; });
    var phone = innerWidth < 600;
    GXST.init({ game: 'gloamwar', scenarios: lessons, keepClear: ['#hudL', '#msg', '#phase', '#side', '#dock', '#mydice', '#acts'], settled: function () { return !!G && !UI.hold && !G.win && sideToAct(G) === 'D'; },
      qParent: '#hudL', phoneSlot: { before: '#dock', after: '#phase' } });
    window.GWLESSONS = { open: function () { try { TUT.stop(); } catch (e) { } $('#title').classList.remove('on'); document.body.classList.remove('scr-on'); GXST.picker(); } };
    // every old entry point opens the lesson picker
    TUT.lessons = function () { window.GWLESSONS.open(); }; startTutorial = function () { window.GWLESSONS.open(); };
    /* phone portrait: the map and dock fill the screen, so a lesson starts as the one-line goal chip (tap it for Hint and Restart) */
    addEventListener('gxst', function (e) { var t = e.detail && e.detail.type; if ((t === 'start' || t === 'retry') && innerWidth <= 600 && innerHeight > innerWidth) setTimeout(function () { var b = $('.gxst-card .gxst-ib[aria-label="Minimise"]'); if (b && GXST.state().phase === 'play') b.click(); }, 0); });
    var lq = /[?&]lesson=(\w+)/.exec(location.search); if (lq) { try { $('#title').classList.remove('on'); document.body.classList.remove('scr-on'); } catch (e) { } GXST.start(lq[1]); }
    else if (/[?&]lessons=1/.test(location.search)) window.GWLESSONS.open();
  };
  setTimeout(go, 300);
})();

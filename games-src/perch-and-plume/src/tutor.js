// ===================== part 5: the tutorial (shell/gx-tutor.js): a staged first year that teaches every action once =====================
// Fixed seed, fixed hand, two brown birds already in your forest so the first forest action shows the centrepiece: the row's powers fire
// bird by bird, right to left. Pip (the computer) is scripted to draw cards so the feeder and your rows stay as the steps expect. Never saved.
// RULES TAUGHT -> steps: goal (goal), the three rows (rows), forest food + feeder (forest, die), brown chain right to left (chain),
// playing a bird: food + egg cost by column (select, slot, pay), grassland eggs + nest limits (eggs, egg), wetland cards + tray (draw, tray), round goals (goals).
var TUT = { on: false };
function tutOn() { return typeof GXT !== 'undefined' && GXT.active() && UI.mode === 'tutorial'; }
function tutAct(x) { if (!tutOn()) return true; return GXT.act(x); }
function tutAIMove(s) {
  if (UI.mode !== 'tutorial' || s !== 1 || G.q) return null;
  return { t: 'act', a: 'cards' };
}
function tutPick() {
  var bs = PP.DATA.birds, used = {};
  var f = function (fn) { var b = bs.find(function (x) { return !used[x.id] && fn(x); }); if (b) used[b.id] = 1; return b && b.id; };
  var T = {
    f1: f(function (b) { return b.h.indexOf('F') >= 0 && b.pw === 'cacheS'; }),
    f2: f(function (b) { return b.h.indexOf('F') >= 0 && b.pw === 'draw1'; }),
    g1: f(function (b) { return b.h.indexOf('G') >= 0 && b.pw === 'laySelf' && b.e >= 3; }),
    play: f(function (b) { return b.h.indexOf('G') >= 0 && b.c.length === 1 && b.c[0] === 'seed' && (!b.pw || PP.power(b.id).col === 'brown') && b.e >= 2; }),
    h2: f(function (b) { return b.h === 'W' && b.c.length >= 2 && b.c.indexOf('fish') >= 0; }),
    h3: f(function (b) { return b.h.indexOf('F') >= 0 && b.c.length >= 2 && b.c.indexOf('rodent') >= 0; }),
    w1: f(function (b) { return b.pw && PP.power(b.id).col === 'white' && PP.power(b.id).k === 'wFood' && b.c.length === 1; }),
    pk: f(function (b) { return b.pw && PP.power(b.id).k === 'pEgg'; })
  };
  return T;
}
function tutPrep(Gx) {
  var T = TUT.ids, me = Gx.pl[0];
  // seat 0 keeps the 3 fixed birds + seed + berry; Pip keeps the computer's pick
  PP.performMove(Gx, { t: 'keep', birds: [0, 1, 2], food: ['seed', 'berry'], bonus: 0 }, 0);
  PP.performMove(Gx, PPAI.setup(Gx, 1), 1);
  [T.f1, T.f2, T.g1, T.pk].filter(Boolean).forEach(function (id) {
    [Gx.deck, Gx.disc].forEach(function (a) { var k = a.indexOf(id); if (k >= 0) a.splice(k, 1); });
    var t = Gx.tray.indexOf(id); if (t >= 0) Gx.tray[t] = Gx.deck.shift();
    Gx.pl.forEach(function (p) { var k = p.hand.indexOf(id); if (k >= 0) p.hand.splice(k, 1); });
  });
  me.board[0] = [{ id: T.f1, eggs: 0, cache: 0, tuck: 0 }, { id: T.f2, eggs: 0, cache: 0, tuck: 0 }];
  me.board[1] = [{ id: T.g1, eggs: 1, cache: 0, tuck: 0 }];
  if (T.pk) Gx.pl[1].board['FGW'.indexOf(PP.DATA.birds.find(function (b) { return b.id === T.pk; }).h[0])].push({ id: T.pk, eggs: 0, cache: 0, tuck: 0 });
  Gx.feeder = ['seed', 'fish', 'berry', 'grub', 'rodent'];
  Gx.fx = [];
}
var tq = function (sel) { return function () { var e = document.querySelector(sel); return e && e.getBoundingClientRect().width ? e : null; }; };
var tmine = function () { return G && myTurn() && !UI.busy; };
function tutSteps() {
  var T = TUT.ids;
  var handOf = function (id) { return function () { var i = G.pl[0].hand.indexOf(id); return i >= 0 ? document.querySelector('#hand .bc[data-i="' + i + '"]') : null; }; };
  // One real, short game (1 round of 8 actions vs Pip) in 5 chapters. Action steps advance only when the exact spotlit element is
  // tapped; "see" steps (Next) explain a rule the board is showing right then. Coverage list: TUTORIAL-COVERAGE.md (ids = step ids).
  var pt = function (t) { return function () { return tmine() && t(); }; };
  return [
    { id: 'forest', title: 'Ottilie \u00b7 Dawn in the Larchwood', say: 'Dawn, and your notebook is empty. Each turn you do ONE thing. Start by gathering food: the green Forest button.', target: tq('.ract[data-h="0"]'), wait: { type: 'tap', match: function (a) { return a.what === 'ract' && a.h === 0; } }, ready: tmine },
    { id: 'die', title: 'Aunt Ottilie', say: 'Pick 2 food from the feeder (each die is one food). Then watch your forest birds use their powers, right to left.', target: tq('.die.glow'), wait: { type: 'tap', match: function (a) { return a.what === 'die'; }, times: 2 }, ready: function () { return tmine() && G.q && G.q.h === 'die'; } }
  ];
}
function tutStart() {   // the coached first game: 2 guided taps for the very first action, then free play; Ottilie explains each rule when it first matters (coach.js)
  if (typeof GXT === 'undefined') { showConfig(); return; }
  TUT.ids = tutPick();
  ['title', 'setup', 'result', 'pass'].forEach(function (id) { $('#' + id).hidden = true; });
  try { if (window.GXC) GXC.close(); } catch (e) { }
  try { GX.close(); } catch (e) { }
  var T = TUT.ids;
  GXT.start({ game: 'perch-and-plume', story: true,
    setup: function () { startGame({ seats: [{ name: 'You', kind: 'human', face: 'you' }, { name: 'Pip', kind: 'ai', lvl: 'easy', face: 'pip' }], mode: 'tutorial', tutorial: true, seed: 42, rounds: 2, cubes: [8, 7],
      hands: { 0: [T.play, T.h2, T.h3, T.w1, null].filter(Boolean) }, first: 0, goals: ['birds-G', 'eggs-F'], prep: tutPrep }); },
    steps: tutSteps(),
    endTitle: STORY.tutEnd.title, endText: STORY.tutEnd.text, endButtons: [{ id: 'play', label: 'Play on' }, { id: 'story', label: 'Skip to the story' }],
    onDone: function (r) { try { localStorage.setItem('pp-played', '1'); } catch (e) { } if (r && r.choice === 'story') { stopTimers(); openStory(); return; }
      UI.mode = 'tutfree'; UI.turnKey = null; coachReset(); ['welcome', 'food', 'feeder', 'chain'].forEach(function (k) { COACH.done[k] = 1; }); render(); pump(); },
    onExit: function () { stopTimers(); showTitle(); } });
}

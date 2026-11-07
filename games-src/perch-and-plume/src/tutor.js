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
    h3: f(function (b) { return b.h.indexOf('F') >= 0 && b.c.length >= 2 && b.c.indexOf('rodent') >= 0; })
  };
  return T;
}
function tutPrep(Gx) {
  var T = TUT.ids, me = Gx.pl[0];
  // seat 0 keeps the 3 fixed birds + seed + berry; Pip keeps the computer's pick
  PP.performMove(Gx, { t: 'keep', birds: [0, 1, 2], food: ['seed', 'berry'], bonus: 0 }, 0);
  PP.performMove(Gx, PPAI.setup(Gx, 1), 1);
  [T.f1, T.f2, T.g1].forEach(function (id) {
    [Gx.deck, Gx.disc].forEach(function (a) { var k = a.indexOf(id); if (k >= 0) a.splice(k, 1); });
    var t = Gx.tray.indexOf(id); if (t >= 0) Gx.tray[t] = Gx.deck.shift();
    Gx.pl.forEach(function (p) { var k = p.hand.indexOf(id); if (k >= 0) p.hand.splice(k, 1); });
  });
  me.board[0] = [{ id: T.f1, eggs: 0, cache: 0, tuck: 0 }, { id: T.f2, eggs: 0, cache: 0, tuck: 0 }];
  me.board[1] = [{ id: T.g1, eggs: 1, cache: 0, tuck: 0 }];
  Gx.feeder = ['seed', 'fish', 'berry', 'grub', 'rodent'];
  Gx.fx = [];
}
var tq = function (sel) { return function () { var e = document.querySelector(sel); return e && e.getBoundingClientRect().width ? e : null; }; };
var tmine = function () { return G && myTurn() && !UI.busy; };
function tutSteps() {
  var T = TUT.ids;
  var handOf = function (id) { return function () { var i = G.pl[0].hand.indexOf(id); return i >= 0 ? document.querySelector('#hand .bc[data-i="' + i + '"]') : null; }; };
  // 7 steps, each one real tap on the exact spotlit element; the step only advances when that tap is done
  return [
    { id: 'forest', title: 'Gain food', say: 'On your turn you do ONE thing. Tap the green Forest button to gain food.', target: tq('.ract[data-h="0"]'), wait: { type: 'tap', match: function (a) { return a.what === 'ract' && a.h === 0; } }, ready: tmine },
    { id: 'die', title: 'Take food', say: 'Tap a glowing food die. Your 2 forest birds let you take 2.', target: tq('.die.glow'), wait: { type: 'tap', match: function (a) { return a.what === 'die'; }, times: 2 }, ready: function () { return tmine() && G.q && G.q.h === 'die'; } },
    { id: 'select', title: 'Play a bird', say: 'Next turn: play a bird. Tap the glowing bird in your hand.', target: handOf(T.play), wait: { type: 'tap', match: function (a) { return a.what === 'hand' && a.id === T.play; } }, ready: function () { return tmine() && !G.q && G.pl[0].hand.indexOf(T.play) >= 0; } },
    { id: 'slot', title: 'Where it lives', say: 'Tap the glowing space in the yellow Grassland row.', target: tq('.row[data-h="1"] .slot.next'), wait: { type: 'tap', match: function (a) { return a.what === 'slot' && a.h === 1; } } },
    { id: 'pay', title: 'Pay for it', say: 'Tap Play to pay its food and 1 egg. Its points are now yours.', target: tq('#acts [data-a="playgo"]'), wait: { type: 'tap', match: function (a) { return a.what === 'playgo'; } } },
    { id: 'eggs', title: 'Lay eggs', say: 'Tap the yellow Grassland button to lay eggs. Every egg is 1 point.', target: tq('.ract[data-h="1"]'), wait: { type: 'tap', match: function (a) { return a.what === 'ract' && a.h === 1; } }, ready: function () { return tmine() && !G.q; } },
    { id: 'egg', title: 'Place eggs', say: 'Tap a glowing bird to put an egg on it.', target: tq('.bc[data-a="bird"].glow'), wait: { type: 'tap', match: function (a) { return a.what === 'bird' && a.t === 'egg'; }, times: 3 }, ready: function () { return tmine() && G.q && G.q.h === 'egg'; } }
  ];
}
function tutStart() {
  if (typeof GXT === 'undefined') { showConfig(); return; }
  TUT.ids = tutPick();
  ['title', 'setup', 'result', 'pass'].forEach(function (id) { $('#' + id).hidden = true; });
  try { if (window.GXC) GXC.close(); } catch (e) { }
  try { GX.close(); } catch (e) { }
  GXT.start({ game: 'perch-and-plume', story: true,
    setup: function () { var T = TUT.ids; startGame({ seats: [{ name: 'You', kind: 'human', face: 'you' }, { name: 'Pip', kind: 'ai', lvl: 'easy', face: 'pip' }], mode: 'tutorial', tutorial: true, seed: 42, rounds: 1, cubes: [8], hands: { 0: [T.play, T.h2, T.h3, null, null].filter(Boolean) }, first: 0, goals: ['birds-G'], prep: tutPrep }); },
    steps: tutSteps(),
    endTitle: 'You know how a turn works', endText: 'Each turn: play a bird, or tap a row for food, eggs or cards. The blue Wetland row draws new birds. 4 rounds, most points wins.',
    onDone: function (r) { try { localStorage.setItem('pp-played', '1'); } catch (e) { } stopTimers(); if (r && r.choice === 'story') openStory(); else quickStart(); },
    onExit: function () { stopTimers(); showTitle(); } });
}

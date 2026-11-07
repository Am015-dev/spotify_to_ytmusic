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
  return [
    { id: 'goal', title: 'A year of birds', say: 'Welcome, naturalist! Fill your three habitats with birds. The most points wins.', target: tq('#mat'), wait: null, ready: tmine },
    { id: 'rows', title: 'Three habitats', say: 'Each row is an action: the forest gains food, the grassland lays eggs, the wetland draws cards.', target: tq('.ract[data-h="1"]'), wait: null },
    { id: 'forest', title: 'Gain food', say: 'Tap your forest to gain food.', target: tq('.ract[data-h="0"]'), wait: { type: 'tap', match: function (a) { return a.what === 'ract' && a.h === 0; } }, ready: tmine },
    { id: 'die', title: 'The birdfeeder', say: 'Take a die from the feeder. Two birds in the forest give 2 food.', target: tq('#feeder'), wait: { type: 'tap', match: function (a) { return a.what === 'die'; }, times: 2 }, ready: function () { return tmine() && G.q && G.q.h === 'die'; } },
    { id: 'chain', title: 'The chain', say: 'Watch: your forest birds fired one by one, right to left. That chain is your engine!', target: tq('.row[data-h="0"]'), wait: null, ready: tmine },
    { id: 'select', title: 'Play a bird', say: 'Tap the glowing bird in your hand.', target: handOf(T.play), wait: { type: 'tap', match: function (a) { return a.what === 'hand' && a.id === T.play; } }, ready: function () { return tmine() && !G.q && G.pl[0].hand.indexOf(T.play) >= 0; } },
    { id: 'slot', title: 'Where it lives', say: 'Tap the glowing grassland space. Spaces to the right cost eggs.', target: tq('.row[data-h="1"] .slot.next'), wait: { type: 'tap', match: function (a) { return a.what === 'slot' && a.h === 1; } } },
    { id: 'pay', title: 'Pay for it', say: 'Pay its food and 1 egg, then it joins your grassland.', target: tq('#acts [data-a="playgo"]'), wait: { type: 'tap', match: function (a) { return a.what === 'playgo'; } } },
    { id: 'eggs', title: 'Lay eggs', say: 'Now tap your grassland to lay eggs. Two birds there give 3 eggs.', target: tq('.ract[data-h="1"]'), wait: { type: 'tap', match: function (a) { return a.what === 'ract' && a.h === 1; } }, ready: function () { return tmine() && !G.q; } },
    { id: 'egg', title: 'Nests', say: 'Tap glowing birds to lay eggs. Each bird holds only as many as its nest.', target: tq('#mat'), wait: { type: 'tap', match: function (a) { return a.what === 'bird' && a.t === 'egg'; }, times: 3 }, ready: function () { return tmine() && G.q && G.q.h === 'egg'; } },
    { id: 'draw', title: 'Draw birds', say: 'Tap your wetland to draw a new bird.', target: tq('.ract[data-h="2"]'), wait: { type: 'tap', match: function (a) { return a.what === 'ract' && a.h === 2; } }, ready: function () { return tmine() && !G.q; } },
    { id: 'tray', title: 'The tray', say: 'Take a face-up bird from the tray.', target: tq('#tray'), wait: { type: 'tap', match: function (a) { return a.what === 'tray'; } }, ready: function () { return tmine() && G.q && G.q.h === 'draw'; } },
    { id: 'goals', title: 'Round goals', say: 'Each round ends with a goal. Rounds give 8, 7, 6, then 5 actions.', target: tq('#goalsbtn'), wait: null, ready: tmine }
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
    endTitle: 'You know the basics', endText: 'Play birds, grow your rows and chain their powers. Four rounds, most points wins.',
    onDone: function (r) { try { localStorage.setItem('pp-played', '1'); } catch (e) { } stopTimers(); if (r && r.choice === 'story') openStory(); else showConfig(); },
    onExit: function () { stopTimers(); showTitle(); } });
}

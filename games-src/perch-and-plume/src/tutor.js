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
  // One real, short game (1 round of 8 actions vs Pip) in 5 chapters. Action steps advance only when the exact spotlit element is
  // tapped; "see" steps (Next) explain a rule the board is showing right then. Coverage list: TUTORIAL-COVERAGE.md (ids = step ids).
  var pt = function (t) { return function () { return tmine() && t(); }; };
  return [
    { id: 'setup', title: '1 First turn \u00b7 Your start', say: 'Every year starts with 5 things to keep (birds and food) and 1 secret bonus card. We picked them for you: your birds are below.', target: tq('#hand'), wait: null, ready: tmine },
    { id: 'forest', title: '1 First turn \u00b7 Gain food', say: 'On your turn you do ONE thing. Tap the green Forest button to gain food.', target: tq('.ract[data-h="0"]'), wait: { type: 'tap', match: function (a) { return a.what === 'ract' && a.h === 0; } }, ready: tmine },
    { id: 'die', title: '1 First turn \u00b7 The feeder', say: 'Tap a glowing food die. Your 2 forest birds let you take 2. An empty feeder is rolled again.', target: tq('.die.glow'), wait: { type: 'tap', match: function (a) { return a.what === 'die'; }, times: 2 }, ready: function () { return tmine() && G.q && G.q.h === 'die'; } },
    { id: 'chain', title: '1 First turn \u00b7 Bird powers', say: 'After a row action, each bird in that row uses its brown power, right to left. That is your engine.', target: tq('.row[data-h="0"]'), wait: null, ready: function () { return tmine() && !G.q; } },
    { id: 'select', title: '2 Play a bird \u00b7 Pick it', say: 'Playing a bird is the other kind of turn. Tap the glowing bird in your hand.', target: handOf(T.play), wait: { type: 'tap', match: function (a) { return a.what === 'hand' && a.id === T.play; } }, ready: function () { return tmine() && !G.q && G.pl[0].hand.indexOf(T.play) >= 0; } },
    { id: 'slot', title: '2 Play a bird \u00b7 Where', say: 'A bird goes in the leftmost free space of a row it lives in. Tap the glowing grassland space.', target: tq('.row[data-h="1"] .slot.next'), wait: { type: 'tap', match: function (a) { return a.what === 'slot' && a.h === 1; } } },
    { id: 'pay', title: '2 Play a bird \u00b7 Pay', say: 'Pay the food on the card (any 2 food can stand in for 1) plus the egg cost of the space. Tap Play.', target: tq('#acts [data-a="playgo"]'), wait: { type: 'tap', match: function (a) { return a.what === 'playgo'; } } },
    { id: 'eggs', title: '3 Eggs \u00b7 Lay eggs', say: 'More birds in a row = a bigger action. Tap the yellow Grassland button to lay eggs.', target: tq('.ract[data-h="1"]'), wait: { type: 'tap', match: function (a) { return a.what === 'ract' && a.h === 1; } }, ready: function () { return tmine() && !G.q; } },
    { id: 'egg', title: '3 Eggs \u00b7 Nests', say: 'Tap a glowing bird to put an egg on it. A bird holds only as many eggs as its nest. Each egg is 1 point.', target: tq('.bc[data-a="bird"].glow'), wait: { type: 'tap', match: function (a) { return a.what === 'bird' && a.t === 'egg'; }, times: 3 }, ready: function () { return tmine() && G.q && G.q.h === 'egg'; } },
    { id: 'draw', title: '4 Cards \u00b7 Draw birds', say: 'Tap the blue Wetland button to draw new birds.', target: tq('.ract[data-h="2"]'), wait: { type: 'tap', match: function (a) { return a.what === 'ract' && a.h === 2; } }, ready: function () { return tmine() && !G.q; } },
    { id: 'tray', title: '4 Cards \u00b7 Tray or deck', say: 'Take a face-up bird from the tray (or a surprise from the deck). The tray refills after your turn.', target: tq('.bc[data-a="tray"].glow'), wait: { type: 'tap', match: function (a) { return a.what === 'tray' || a.what === 'deck'; } }, ready: function () { return tmine() && G.q && G.q.h === 'draw'; } },
    { id: 'goals', title: '5 Scoring \u00b7 Round goal', say: 'When a round ends, its goal is scored: most items wins the most points. This one is shown here.', target: tq('#goalsbtn'), wait: null, ready: tmine },
    { id: 'score', title: '5 Scoring \u00b7 The end', say: 'The year ends after the last round. You score birds + eggs + goals + bonus card + cached food + tucked cards. A tie goes to the most food left.', target: tq('#foodrow'), wait: null, ready: tmine },
    { id: 'finish', title: '5 Scoring \u00b7 Finish the year', say: 'Your last actions are yours to choose. Pip now plays for real. Play to the end and see the final score.', target: tq('#mat'), wait: null, ready: tmine }
  ].map(function (st) {   // the prologue's words live in story.js (STORY.tut); the step keeps its target and wait
    var t = STORY.tut[st.id] || {}, ch = 0;
    if (t.say) st.say = t.say;
    st.title = t.ch ? 'Ottilie \u00b7 ' + t.ch.replace(/^Prologue (\d) \u00b7 /, '$1 ') : 'Aunt Ottilie';
    if (t.react) st.onDone = function () { storySay('ottilie', t.react); };
    return st;
  });
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
    endTitle: STORY.tutEnd.title, endText: STORY.tutEnd.text, endButtons: [{ id: 'finish', label: 'Finish this game' }, { id: 'story', label: 'Skip to the story' }],
    onDone: function (r) { try { localStorage.setItem('pp-played', '1'); } catch (e) { } if (r && r.choice === 'story') { stopTimers(); openStory(); return; } UI.mode = 'tutfree'; UI.turnKey = null; render(); pump(); },
    onExit: function () { stopTimers(); showTitle(); } });
}

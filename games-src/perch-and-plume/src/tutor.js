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
function tutStart() {   // the coached first game: 1 round of 4 turns vs Pip, every choice free; Ottilie teaches one action per turn (coach.js)
  TUT.ids = tutPick();
  ['title', 'setup', 'result', 'pass'].forEach(function (id) { $('#' + id).hidden = true; });
  try { if (window.GXC) GXC.close(); } catch (e) { }
  try { GX.close(); } catch (e) { }
  try { if (typeof GXT !== 'undefined' && GXT.active && GXT.active()) GXT.stop && GXT.stop(); } catch (e) { }
  var T = TUT.ids; RATE.last = null; RATE.k = null;
  startGame({ seats: [{ name: 'You', kind: 'human', face: 'you' }, { name: 'Pip', kind: 'ai', lvl: 'easy', face: 'pip' }], mode: 'tutfree', tutorial: true, seed: 42, rounds: 1, cubes: [4],
    hands: { 0: [T.play, T.h2, T.h3, T.w1, null].filter(Boolean) }, first: 0, goals: ['birds-G'], prep: tutPrep });
  try { localStorage.setItem('pp-played', '1'); } catch (e) { }
  try { if (typeof GXT !== 'undefined' && GXT.markDone) GXT.markDone('perch-and-plume'); } catch (e) { }
  coachReset(); render();
}

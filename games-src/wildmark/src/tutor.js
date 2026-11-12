/* Wildmark tutorial = a GUIDED FIRST GAME (W507 brief): every core rule in order, one sentence of at most 12 words and ONE highlighted
   tap per step, in a real 7-turn game against Bram. The market is stacked each turn so every rule comes up; only the highlighted tap works.
   Then the result screen walks through the score, and its main button starts a real 20-turn game.
   Steps: TUT_STEPS below (rule ids in COACH_RULES). Proof: tutorial-end.js (walks it by touch, checks every rule step appears). */
var TUT_GAME = 'wildmark', TUT_SEED = 11, TUT_TURNS = 7;
window.GXCOACH = { running: false, explained: [], done: false };   // read by the QA bot's coached mode
var COACH_RULES = ['goal', 'pick', 'place', 'settle', 'keystone', 'rival', 'bear', 'rotate', 'habitat', 'sweep3', 'elk', 'acornSpend', 'salmon', 'wipe4', 'hawk', 'acornReplace', 'fox', 'majority', 'return', 'end20', 'acornsEnd', 'tiebreak'];
// one step = { r: rule id taught (first step of a rule), say: <=12 words, hl: what glows, ok: allowed action, done: finished?, go: on enter }
// hl kinds: 'next' (the bubble's Next button), 'col:i' (market tile i), 'tok:i' (market animal i), 'spot' (chosen map spot), 'cell' (tile just placed), '#id'
function tutSteps() {
  return [
    // turn 1: pick a pair, place, settle on a keystone, acorn, the rival's turn
    { r: 'goal', say: 'Beat Bram: score more points in your valley than he does.', hl: 'next' },
    { r: 'pick', say: 'Each turn take a tile and the animal below it.', hl: 'col:0', ok: 'take:0', done: function () { return G.stage === 'tile'; } },
    { r: 'place', say: 'Your tile must touch your valley. Tap the glowing spot.', hl: 'spot', pick: 'best', ok: 'spot', done: function () { return !!UI.ghost; } },
    { say: 'Tap Place to put the tile down.', hl: '#okB', ok: 'ok', done: function () { return G.stage === 'tok'; } },
    { r: 'settle', say: 'Animals live only on tiles that show them. Tap your bear tile.', hl: 'cell', ok: 'tok', done: turnDone },
    { r: 'keystone', say: 'Gold keystone tile: an animal on it earns you an acorn.', hl: 'next' },
    { r: 'rival', say: 'Now Bram plays: he takes, places and settles like you.', hl: 'next' },
    { wait: 1 },
    // turn 2: bears in pairs, turning a split tile, habitats
    { r: 'bear', say: 'Bears score in pairs of two. Take the second bear.', hl: 'col:1', ok: 'take:1', done: function () { return G.stage === 'tile'; } },
    { say: 'Tap the spot beside your first bear.', hl: 'spot', pick: 'nearBear', ok: 'spot', done: function () { return !!UI.ghost; } },
    { r: 'rotate', say: 'Two-land tiles turn. Tap Turn so forest meets forest.', hl: '#rotB', ok: 'rot', go: rotPrep, done: function () { return UI.ghost && UI.ghost.rot === UI.tut.best; } },
    { say: 'Good fit. Tap Place.', hl: '#okB', ok: 'ok', done: function () { return G.stage === 'tok'; } },
    { say: 'Put the bear next to your first bear: a pair!', hl: 'cell', ok: 'tok', done: turnDone },
    { r: 'habitat', say: 'Touching same land joins up: 1 point per joined tile.', hl: 'next' },
    { wait: 1 },
    // turn 3: three alike, elk lines
    { r: 'sweep3', say: 'Three alike? Once per turn you may sweep them, free.', hl: '#w3B', ok: 'w3', done: function () { return !!G.used3; }, after: fixSweep },
    { r: 'elk', say: 'Elk score in straight lines. Take the elk.', hl: 'col:3', ok: 'take:3', done: function () { return G.stage === 'tile'; } },
    { say: 'Tap the glowing spot.', hl: 'spot', pick: 'best', ok: 'spot', done: function () { return !!UI.ghost; } },
    { say: 'Tap Place.', hl: '#okB', ok: 'ok', done: function () { return G.stage === 'tok'; } },
    { say: 'Settle the elk on its new tile.', hl: 'cell', ok: 'tok', done: turnDone },
    { wait: 1 },
    // turn 4: spend an acorn (free pick; replace is the other power), salmon runs
    { r: 'acornSpend', say: 'You have an acorn. Tap Use acorn.', hl: '#acornB', ok: 'acorn', done: function () { return !!UI.acornMenu; } },
    { say: 'Free pick takes any tile and any animal. Tap it.', hl: '#freeB', ok: 'freeB', done: function () { return !!UI.free; } },
    { r: 'salmon', say: 'Salmon score in runs. Tap the river tile.', hl: 'col:0', ok: 'freet:0', done: function () { return UI.free && UI.free.ti === 0 || G.stage === 'tile'; } },
    { say: 'Now tap the salmon from another column.', hl: 'tok:2', ok: 'freek:2', done: function () { return G.stage === 'tile'; } },
    { say: 'Tap the spot next to your river.', hl: 'spot', pick: 'nearRiver', ok: 'spot', done: function () { return !!UI.ghost; } },
    { say: 'Tap Place.', hl: '#okB', ok: 'ok', done: function () { return G.stage === 'tok'; } },
    { say: 'Settle the salmon: another keystone, another acorn.', hl: 'cell', ok: 'tok', done: turnDone },
    { wait: 1 },
    // turn 5: four alike wipe themselves, lone hawks
    { r: 'wipe4', say: 'Four alike! The market swaps them by itself.', hl: 'next', after: fixWipe4 },
    { r: 'hawk', say: 'Hawks score alone, touching no other hawk. Take the hawk.', hl: 'col:2', ok: 'take:2', done: function () { return G.stage === 'tile'; } },
    { say: 'Tap the spot away from other hawks.', hl: 'spot', pick: 'noHawk', ok: 'spot', done: function () { return !!UI.ghost; } },
    { say: 'Tap Place.', hl: '#okB', ok: 'ok', done: function () { return G.stage === 'tok'; } },
    { say: 'Settle the hawk.', hl: 'cell', ok: 'tok', done: turnDone },
    { wait: 1 },
    // turn 6: fox neighbours
    { say: 'Acorns can also swap market animals. Tap Use acorn.', hl: '#acornB', ok: 'acorn', done: function () { return !!UI.acornMenu; } },
    { r: 'acornReplace', say: 'Tap Replace animals.', hl: '#wipeB', ok: 'wipeB', done: function () { return !!UI.wipe; } },
    { say: 'Tap the salmon you do not need.', hl: 'tok:3', ok: 'wsel:3', done: function () { return !!UI.wipe && UI.wipe.indexOf(3) >= 0; } },
    { say: 'Tap Replace: a new animal comes from the bag.', hl: '#wokB', ok: 'wok', done: function () { return !UI.wipe; }, after: fixReplace },
    { r: 'fox', say: 'A fox scores 1 per different animal beside it.', hl: 'col:1', ok: 'take:1', done: function () { return G.stage === 'tile'; } },
    { say: 'Tap the spot with the most animals around it.', hl: 'spot', pick: 'nearTok', ok: 'spot', done: function () { return !!UI.ghost; } },
    { say: 'Tap Place.', hl: '#okB', ok: 'ok', done: function () { return G.stage === 'tok'; } },
    { say: 'Settle the fox among its neighbours.', hl: 'cell', ok: 'tok', done: turnDone },
    { wait: 1 },
    // turn 7: majority bonus, returning an animal, the end of a real game
    { r: 'majority', say: 'Biggest land of a kind beats Bram: plus 2 points.', hl: 'next' },
    { say: 'Last turn. Take this pair.', hl: 'col:0', ok: 'take:0', done: function () { return G.stage === 'tile'; } },
    { say: 'Tap the glowing spot.', hl: 'spot', pick: 'best', ok: 'spot', done: function () { return !!UI.ghost; } },
    { say: 'Tap Place.', hl: '#okB', ok: 'ok', done: function () { return G.stage === 'tok'; } },
    { r: 'return', say: 'No good spot? Return the animal to the bag.', hl: '#backB', ok: 'back', done: turnDone },
    { r: 'end20', say: 'Real games last 20 turns each, then everything scores.', hl: 'next' },
    { r: 'acornsEnd', say: 'Every acorn you still hold is worth 1 point.', hl: 'next' },
    { r: 'tiebreak', say: 'Tied on points? More acorns wins.', hl: 'next' },
    { wait: 2 }
  ];
}
function turnDone() { return G.stage === 'pick' && G.seats[0].done > UI.tut.t0 || G.over; }
function tutOn() { return UI.mode === 'coach' && !!UI.tut && !!G; }
function tutCur() { return tutOn() ? UI.tut.steps[UI.tut.i] : null; }
// the gate: only the highlighted tap works while the guided game runs
function tutAct(x) {
  var s = tutCur(); if (!s) return true; if (!s.ok) { tutNudge(); return false; }
  var p = s.ok.split(':'), w = x.what;
  var ok = w === p[0] && (p[1] == null || +p[1] === x.i) && (w !== 'spot' || x.c === UI.tut.spot) && (w !== 'tok' || x.c === UI.tut.spot);
  if (!ok) tutNudge(); return ok;
}
function tutNudge() { var e = $('.tuthl'); if (e) { e.classList.remove('nudge'); void e.getBoundingClientRect(); e.classList.add('nudge'); } }
function coachOn() { return tutOn(); }
function coachLine(id) { var c = window.CAMPAIGN && CAMPAIGN.prologue && CAMPAIGN.prologue.coach; return c && c[id] || ''; }
function coachHide() { var b = $('#coachb'); if (b) b.hidden = true; $$('.tuthl').forEach(function (e) { e.classList.remove('tuthl'); }); }
// spot pickers: the tutorial chooses one legal spot that shows the rule well
function nbCount(env, c, f) { return WM.nb(c).filter(function (n) { return env[n] && f(env[n]); }).length; }
function matchEdges(env, c, tile) {
  var best = 0; WM.rots(tile).forEach(function (r) { var v = 0, cell = { t: tile.t, rot: r }; WM.nb(c).forEach(function (n, d) { if (env[n] && WM.edgeT(env[n], (d + 3) % 6) === WM.edgeT(cell, d)) v++; }); if (v > best) best = v; });
  return best;
}
function tutPickSpot(kind) {
  var env = G.seats[0].env, tile = G.hold.tile, sp = WM.spots(env).sort(), bestC = null, bv = -1;
  sp.forEach(function (c) {
    var v = matchEdges(env, c, tile);
    if (kind === 'nearBear') v += 10 * nbCount(env, c, function (x) { return x.tok === 'bear'; });
    if (kind === 'nearRiver') v += 10 * nbCount(env, c, function (x) { return x.t.indexOf('river') >= 0; });
    if (kind === 'noHawk') v -= 20 * nbCount(env, c, function (x) { return x.tok === 'hawk'; });
    if (kind === 'nearTok') { var k = {}; WM.nb(c).forEach(function (n) { if (env[n] && env[n].tok) k[env[n].tok] = 1; }); v += 10 * Object.keys(k).length; }
    if (v > bv) { bv = v; bestC = c; }
  });
  return bestC;
}
function rotPrep() { var c = UI.ghost.c; UI.tut.best = bestRot(c); UI.ghost.rot = (UI.tut.best + 5) % 6; }
// stacked market for each of the player's turns (keeps the bag consistent: an animal put out comes from the bag, the old one goes back)
function tTok(a, slot) { var old = G.market.toks[slot]; if (old) G.bag[old]++; G.bag[a]--; G.market.toks[slot] = a; }
function tTile(t, slot) { G.market.tiles[slot] = Object.assign({ id: 900 + slot + G.seats[0].done * 4 }, t); }
function tutFix() {
  if (!tutOn() || G.over || G.stage !== 'pick' || G.cur !== 0) return;
  var n = G.seats[0].done, T = UI.tut.fixed; if (T['t' + n]) return; T['t' + n] = 1;
  if (n === 0) { tTile({ t: ['forest'], a: ['bear'], key: true }, 0); ['bear', 'elk', 'hawk', 'salmon'].forEach(tTok); }
  if (n === 1) { tTile({ t: ['forest', 'meadow'], a: ['bear', 'fox'], key: false }, 1); ['fox', 'bear', 'hawk', 'salmon'].forEach(tTok); }
  if (n === 2) { tTile({ t: ['meadow', 'peak'], a: ['elk', 'hawk'], key: false }, 3); ['hawk', 'hawk', 'hawk', 'elk'].forEach(tTok); }
  if (n === 3) { tTile({ t: ['river'], a: ['salmon'], key: true }, 0); ['hawk', 'fox', 'salmon', 'elk'].forEach(tTok); }
  if (n === 4) { tTile({ t: ['peak'], a: ['hawk'], key: true }, 2); ['hawk', 'hawk', 'hawk', 'hawk'].forEach(tTok); }
  if (n === 5) { tTile({ t: ['meadow', 'forest'], a: ['fox', 'elk'], key: false }, 1); ['elk', 'fox', 'bear', 'salmon'].forEach(tTok); }
  if (n === 6) { tTile({ t: ['marsh', 'river'], a: ['fox', 'salmon'], key: false }, 0); ['bear', 'hawk', 'elk', 'fox'].forEach(tTok); }
  G.used3 = false; render();
}
function fixSweep() { ['fox', 'salmon', 'bear'].forEach(function (a, i) { tTok(a, i); }); }   // the three swept animals come back as a fixed set
function fixReplace() { tTok('hawk', 3); }   // the replaced salmon comes back as a fixed animal, so the tutorial stays the same every time
function fixWipe4() { ['elk', 'fox', 'hawk', 'bear'].forEach(tTok); G.wiped4 = (G.wiped4 || 0) + 1; G.log.push('Four Hawk tokens: the market is wiped.'); }
// the step machine: runs after every render (ui.js render -> coachCheck)
function coachCheck() {
  if (!tutOn() || UI.tut.busy) return; var T = UI.tut;
  for (var guard = 0; guard < 6; guard++) {
    var s = T.steps[T.i]; if (!s) break;
    if (!T.entered) {
      if (s.wait) { if (s.wait === 2 ? !G.over : !(myTurn() && G.stage === 'pick' && G.seats[0].done > T.t0)) { coachHide(); return; } T.i++; continue; }
      if (s.hl === 'spot' && G.stage === 'tile') { T.spot = tutPickSpot(s.pick); fitView(); }
      if (s.hl === 'cell') T.spot = T.spot || (G.last && G.last.tile);
      if (s.go) s.go();
      if (s.ok === 'take:0' || s.ok === 'take:1' || s.ok === 'take:2' || s.ok === 'take:3' || s.ok === 'acorn') T.t0 = G.seats[0].done;
      T.entered = true; if (s.r) { T.seen[s.r] = 1; } T.shown.push(s.r || s.say);
      if (s.go) { T.busy = true; setTimeout(function () { T.busy = false; render(); }, 0); return; }
    }
    if (s.done && s.done()) { if (s.after) s.after(); T.i++; T.entered = false; if (s.hl !== 'spot' && s.hl !== '#rotB' && s.hl !== '#okB') T.spot = s.hl === 'cell' ? null : T.spot; if (s.after) { T.busy = true; setTimeout(function () { T.busy = false; render(); }, 0); return; } continue; }
    break;
  }
  tutDraw();
  window.GXCOACH.explained = Object.keys(T.seen); window.WM_COACH = { explained: Object.keys(T.seen), shown: T.shown.slice(), later: [], step: T.i, steps: T.steps.length };
}
function tutDraw() {
  var T = UI.tut, s = T.steps[T.i]; $$('.tuthl').forEach(function (e) { e.classList.remove('tuthl'); });
  if (!s || s.wait) { coachHide(); return; }
  var b = $('#coachb'); if (!b) { b = document.createElement('div'); b.id = 'coachb'; b.setAttribute('role', 'status'); b.setAttribute('aria-live', 'polite'); $('#board').appendChild(b); }
  var key = T.i + (s.hl === 'next' ? 'n' : '');
  if (b.dataset.k !== key) { b.innerHTML = '<i class="cface" aria-hidden="true"></i><p><b>Rowan</b> ' + esc(s.say) + '</p>' + (s.hl === 'next' ? '<button type="button" class="ab pri" id="tutNext">Next</button>' : ''); b.dataset.k = key; }
  b.dataset.rule = s.r || ''; b.hidden = false;
  var el = null, h = s.hl;
  if (h === 'next') el = $('#tutNext');
  else if (h.indexOf('col:') === 0) el = $('#mk .mt[data-i="' + h.slice(4) + '"]');
  else if (h.indexOf('tok:') === 0) el = $('#mk .mk[data-i="' + h.slice(4) + '"]');
  else if (h === 'spot') el = UI.ghost ? null : $('#map .spot[data-c="' + T.spot + '"]');
  else if (h === 'cell') el = $('#map .hx[data-c="' + T.spot + '"]');
  else el = $(h);
  if (el) el.classList.add('tuthl');
}
document.addEventListener('click', function (e) {
  var t = e.target.closest && e.target.closest('#tutNext, #coachStory'); if (!t) return;
  if (t.id === 'tutNext') { var T = UI.tut, s = tutCur(); if (!s || s.hl !== 'next') return; if (s.after) s.after(); T.i++; T.entered = false; sfx('tap'); render(); return; }
  $('#rs').hidden = true; showTitle(); GXC.play(CAMPAIGN.chapters[0].id);
});
// final scoring walk-through with the player's real numbers (every rule was taught during the game, so no "later" list)
function coachFinalHTML() {
  if (UI.mode !== 'coach' || !G || !G.over || !UI.tut) return '';
  var r = G.res[0], b = G.res[1], tb = 0, hb = 0; WM.TER.forEach(function (t) { hb += r.hab[t]; tb += r.bonus[t] || 0; });
  window.WM_COACH = { explained: Object.keys(UI.tut.seen), shown: UI.tut.shown.slice(), later: [], step: UI.tut.i, steps: UI.tut.steps.length };
  window.GXCOACH = { running: false, explained: Object.keys(UI.tut.seen), later: [], done: true };
  var h = '<div class="cfinal"><p class="ch"><i class="cface" aria-hidden="true"></i><b>Rowan</b> Here is how your score adds up.</p><ol>';
  h += '<li>Animals: <b>' + r.aniT + '</b></li>';
  h += '<li>Biggest land of each kind: <b>' + hb + '</b>, bonus <b>' + tb + '</b></li>';
  h += '<li>Acorns kept: <b>' + r.acorns + '</b></li>';
  h += '<li>Total <b>' + r.total + '</b>, ' + esc(G.seats[1].name) + ' <b>' + b.total + '</b></li></ol>';
  return h + '</div>';
}
function coachEnd() {   // after the result is drawn: the tutorial counts as done, and the main button starts a real 20-turn game
  if (UI.mode !== 'coach') return; try { GXT.markDone(TUT_GAME); } catch (e) { } coachHide(); UI.tut = null;
  var pro = UI.coachPrologue; UI.mode = 'quick'; UI.cfg = { np: 2, humans: 1, ai: 'normal', turns: 20 };
  var a = $('#againB'); if (a) a.textContent = 'Play a real game';
  if (pro && window.GXC && CAMPAIGN.chapters[0]) { var t = $('#titleB'); if (t) { t.textContent = 'Start the story'; t.id = 'coachStory'; } }
}
function storyOpen() { if (!window.GXC) return; $('#start').hidden = true; GXC.open(); }   // the title steps aside so its buttons never sit under the map
function tutLeave() { UI.mode = 'quick'; UI.tutor = false; UI.tut = null; coachHide(); }
function tutStart(o) {
  try { GX.close(); } catch (e) { } if (window.GXC && GXC.close) try { GXC.close(); } catch (e) { }
  try { if (window.GXT && GXT.running()) GXT.stop(); } catch (e) { }
  UI.coachPrologue = !!(o && o.prologue); UI.prefs.played = 1; savePrefs();
  UI.tut = { steps: tutSteps(), i: 0, entered: false, seen: {}, shown: [], fixed: {}, t0: 0, spot: null, best: 0, busy: false };
  window.GXCOACH = { running: true, explained: [], done: false };
  UI.mode = 'coach'; newGame({ np: 2, humans: 1, ai: 'novice', seed: TUT_SEED, turns: TUT_TURNS, names: [null, 'Bram'] }); UI.mode = 'coach';
  tutFix(); render();
}

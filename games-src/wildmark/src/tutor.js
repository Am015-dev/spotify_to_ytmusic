/* Wildmark tutorial = a GUIDED FIRST GAME (W650): it opens with a labelled map of the real screen, then every rule in play order (one
   sentence + why) in a real 7-turn game against Bram. The market is stacked each turn so every rule comes up. Owner rules: the lesson sits in a
   FLOATING window (drag, minimise, close; ? reopens), nothing is dimmed or blocked, a gentle ring pulses on the suggested tap, every tap works;
   a lesson completes when done or on Next; a checklist shows progress.
   Then the result screen walks through the score, and its main button starts a real 20-turn game.
   Steps: TUT_STEPS below (rule ids in COACH_RULES). Proof: tutorial-end.js (walks it by touch, checks every rule step appears). */
var TUT_GAME = 'wildmark', TUT_SEED = 11, TUT_TURNS = 7;
window.GXCOACH = { running: false, explained: [], done: false };   // read by the QA bot's coached mode
var COACH_RULES = ['goal', 'pick', 'place', 'settle', 'keystone', 'rival', 'bear', 'rotate', 'habitat', 'sweep3', 'elk', 'acornSpend', 'salmon', 'wipe4', 'hawk', 'acornReplace', 'fox', 'majority', 'end20', 'acornsEnd', 'tiebreak', 'return'];
// one step = { r: rule id taught (first step of a rule), say: <=12 words, hl: what glows, ok: allowed action, done: finished?, go: on enter }
// hl kinds: 'next' (the bubble's Next button), 'col:i' (market tile i), 'tok:i' (market animal i), 'spot' (chosen map spot), 'cell' (tile just placed), '#id'
function tutSteps() {
  return [
    // turn 1: pick a pair, place, settle on a keystone, acorn, the rival's turn
    { r: 'map', say: 'This is your screen. Tap a label to see what it does.', hl: 'map', go: function () { hudMap(true); }, done: function () { return !hudMap.on; } },
    { r: 'goal', say: 'Beat Bram: score more points in your valley than he does.', hl: 'next' },
    { r: 'pick', say: 'Each turn take a tile and the animal below it.', hl: 'col:0', ok: 'take:0', done: function () { return G.stage === 'tile'; } },
    { r: 'place', say: 'Your tile must touch your valley. Tap the glowing spot.', hl: 'spot', pick: 'best', ok: 'spot', done: function () { return !!UI.ghost; } },
    { r: 'settle', say: 'Bears live on tiles that show them. Tap your new ringed tile.', hl: 'cell', ok: 'tok', done: turnDone },
    { r: 'keystone', say: 'Gold keystone tile: an animal on it earns you an acorn.', hl: 'next' },
    { r: 'rival', say: 'Now Bram plays: he takes, places and settles like you.', hl: 'next' },
    { wait: 1 },
    // turn 2: bears in pairs, turning a split tile, habitats
    { r: 'bear', say: 'Bears score in pairs of two. Take the second bear.', hl: 'col:1', ok: 'take:1', done: function () { return G.stage === 'tile'; } },
    { say: 'Tap the spot beside your first bear.', hl: 'spot', pick: 'nearBear', ok: 'spot', done: function () { return !!UI.ghost; } },
    { r: 'rotate', say: 'Two-land tiles turn. Tap Turn so forest meets forest.', hl: '#rotB', ok: 'rot', go: rotPrep, done: function () { return UI.ghost && UI.ghost.rot === UI.tut.best; } },
    { say: 'Good fit. Tap the tile: it goes down, the bear moves in.', hl: 'cell', ok: 'tok', done: turnDone },
    { r: 'habitat', say: 'Same land joins up: your largest group scores 1 per tile.', hl: 'next' },
    { wait: 1 },
    // turn 3: three alike, elk lines
    { r: 'sweep3', say: 'Three alike? Once per turn you may sweep them, free.', hl: '#w3B', ok: 'w3', done: function () { return !!G.used3; }, after: fixSweep },
    { r: 'elk', say: 'Elk score in straight lines. Take the elk.', hl: 'col:3', ok: 'take:3', done: function () { return G.stage === 'tile'; } },
    { say: 'Tap the glowing spot.', hl: 'spot', pick: 'best', ok: 'spot', done: function () { return !!UI.ghost; } },
    { say: 'Tap the ringed tile: tile down, elk in. One tap.', hl: 'cell', ok: 'tok', done: turnDone },
    { wait: 1 },
    // turn 4: spend an acorn on a free pick, salmon runs (turn 6 uses the other power, Replace animals)
    { r: 'acornSpend', say: 'You have an acorn. Tap the Acorn button.', hl: '#acornB', ok: 'acorn', done: function () { return !!UI.acornMenu; } },
    { say: 'Free pick takes any tile and any animal. Tap it.', hl: '#freeB', ok: 'freeB', done: function () { return !!UI.free; } },
    { r: 'salmon', say: 'Salmon score in runs. Tap the river tile.', hl: 'col:0', ok: 'freet:0', done: function () { return UI.free && UI.free.ti === 0 || G.stage === 'tile'; } },
    { say: 'Now tap the salmon from another column.', hl: 'tok:2', ok: 'freek:2', done: function () { return G.stage === 'tile'; } },
    { say: 'Tap the spot next to your river.', hl: 'spot', pick: 'nearRiver', ok: 'spot', done: function () { return !!UI.ghost; } },
    { say: 'Tap the ringed river tile: another keystone, another acorn.', hl: 'cell', ok: 'tok', done: turnDone },
    { wait: 1 },
    // turn 5: four alike wipe themselves, lone hawks
    { r: 'wipe4', say: 'Four alike! The market swaps them by itself.', hl: 'next', after: fixWipe4 },
    { r: 'hawk', say: 'Hawks score alone, touching no other hawk. Take the hawk.', hl: 'col:2', ok: 'take:2', done: function () { return G.stage === 'tile'; } },
    { say: 'Tap the spot away from other hawks.', hl: 'spot', pick: 'noHawk', ok: 'spot', done: function () { return !!UI.ghost; } },
    { say: 'Tap the ringed tile to settle the hawk.', hl: 'cell', ok: 'tok', done: turnDone },
    { wait: 1 },
    // turn 6: fox neighbours
    { say: 'Acorns can also swap market animals. Tap the Acorn button.', hl: '#acornB', ok: 'acorn', done: function () { return !!UI.acornMenu; } },
    { r: 'acornReplace', say: 'Tap Replace animals.', hl: '#wipeB', ok: 'wipeB', done: function () { return !!UI.wipe; } },
    { say: 'Tap the salmon you do not need.', hl: 'tok:3', ok: 'wsel:3', done: function () { return !!UI.wipe && UI.wipe.indexOf(3) >= 0; } },
    { say: 'Tap Replace: a new animal comes from the bag.', hl: '#wokB', ok: 'wok', done: function () { return !UI.wipe; }, after: fixReplace },
    { r: 'fox', say: 'A fox scores 1 per different animal beside it.', hl: 'col:1', ok: 'take:1', done: function () { return G.stage === 'tile'; } },
    { say: 'Tap the spot with the most animals around it.', hl: 'spot', pick: 'nearTok', ok: 'spot', done: function () { return !!UI.ghost; } },
    { say: 'Tap the ringed tile: the fox moves in among neighbours.', hl: 'cell', ok: 'tok', done: turnDone },
    { wait: 1 },
    // turn 7: majority bonus, returning an animal, the end of a real game
    { r: 'majority', say: 'Biggest land of a kind: plus 2. Tied with Bram: 1 each.', hl: 'next' },
    { say: 'With 3-4 players: biggest plus 3, second plus 1, ties earn less.', hl: 'next' },
    { r: 'end20', say: 'Real games last 20 turns each, then everything scores.', hl: 'next' },
    { r: 'acornsEnd', say: 'Every acorn you still hold is worth 1 point.', hl: 'next' },
    { r: 'tiebreak', say: 'Tied on points? More acorns wins.', hl: 'next' },
    { say: 'Last turn. Take this pair.', hl: 'col:0', ok: 'take:0', done: function () { return G.stage === 'tile'; } },
    { say: 'Tap the glowing spot.', hl: 'spot', pick: 'best', ok: 'spot', done: function () { return !!UI.ghost; } },
    { say: 'Keeping the animal is optional. Tap Place tile instead.', hl: '#okB', ok: 'ok', done: function () { return G.stage === 'tok'; } },
    { r: 'return', say: 'No good spot? Tap Skip animal: it goes back to the bag.', hl: '#backB', ok: 'back', done: turnDone },
    { wait: 2 }
  ];
}
function turnDone() { return G.stage === 'pick' && G.seats[0].done > UI.tut.t0 || G.over; }
function tutOn() { return UI.mode === 'coach' && !!UI.tut && !!G; }
function tutCur() { return tutOn() ? UI.tut.steps[UI.tut.i] : null; }
// W650: no gate. Every tap works; the lesson just suggests one (owner rule: never make one thing the only tappable one)
function tutAct() { return true; }
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
// one lesson per rule, in play order: a short title for the checklist and the "why" under the sentence
var LESSON = {
  map: ['Your screen', 'Knowing where things are makes every turn quicker.'],
  goal: ['The goal', 'Every rule below is a way to earn points.'],
  pick: ['Take a pair', 'You choose from 4 pairs, so look for the one that fits.'],
  place: ['Place the tile', 'Your valley grows one tile per turn, always joined.'],
  settle: ['Settle the animal', 'Animals only score once they live in your valley.'],
  keystone: ['Keystones', 'Acorns buy extra choice later, or 1 point each at the end.'],
  rival: ["Bram's turn", 'You take turns; his picks change what you can take.'],
  bear: ['Bears: pairs', 'A pair scores, but a third bear beside them breaks it.'],
  rotate: ['Turn a tile', 'Matching land edges join habitats, which score.'],
  habitat: ['Habitats', 'Big joined lands are a steady source of points.'],
  sweep3: ['Sweep three', 'Clears animals you do not want, for free.'],
  elk: ['Elk: lines', 'Longer straight lines are worth far more.'],
  acornSpend: ['Acorn: free pick', 'Breaks a pair apart, so you get exactly what you need.'],
  salmon: ['Salmon: runs', 'A long run scores a lot; a salmon with 3 salmon beside it breaks it.'],
  wipe4: ['Four alike', 'Keeps the market from offering only one animal.'],
  hawk: ['Hawks: alone', 'Each hawk scores only if no hawk touches it.'],
  acornReplace: ['Acorn: replace', 'Swap animals you do not want for new ones.'],
  fox: ['Fox: neighbours', 'Put foxes where many kinds of animal meet.'],
  majority: ['Biggest land bonus', 'Beating Bram on a land kind is worth extra.'],
  end20: ['Game end', 'You get 20 turns, so plan your patterns early.'],
  acornsEnd: ['Acorns score', 'A spare acorn is never wasted.'],
  tiebreak: ['Tie-break', 'Acorns decide a tie, so they matter twice.'],
  return: ['Skip the animal', 'Taking a tile for its land is fine; a wrong animal can hurt.']
};
function tutLessons() { var T = UI.tut, out = [], cur = null; for (var i = 0; i < T.steps.length; i++) { var r = T.steps[i].r; if (r && LESSON[r]) out.push({ r: r, i: i }); } for (i = 0; i < out.length; i++) if (out[i].i <= T.i) cur = out[i].r; return { list: out, cur: cur }; }
function tutWin() {
  var b = $('#coachb'); if (b) return b;
  b = document.createElement('div'); b.id = 'coachb'; b.className = 'tutwin'; b.setAttribute('role', 'dialog'); b.setAttribute('aria-label', 'Lesson');
  b.innerHTML = '<div class="twh"><span class="twt"></span><button type="button" class="twb" id="tutMin" aria-label="Minimise lesson">&#8211;</button><button type="button" class="twb" id="tutX" aria-label="Close lesson">&times;</button></div><div class="twbody"><div class="twmsg" role="status" aria-live="polite"></div><div class="twrow"><button type="button" class="ab" id="tutList" aria-expanded="false">Lessons</button><button type="button" class="ab pri" id="tutNext">Next</button></div><ol class="twlist" hidden></ol></div>';
  $('#board').appendChild(b); tutDrag(b); return b;
}
function tutDrag(b) {   // drag the window by its title bar (pointer events: mouse, touch and pen)
  var h = b.querySelector('.twh'), st = null;
  h.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; var r = b.getBoundingClientRect(), br = $('#board').getBoundingClientRect(); st = { x: e.clientX, y: e.clientY, l: r.left - br.left, t: r.top - br.top, br: br, w: r.width, h: r.height }; try { h.setPointerCapture(e.pointerId); } catch (x) { } e.preventDefault(); });
  h.addEventListener('pointermove', function (e) { if (!st) return; var l = Math.max(0, Math.min(st.br.width - st.w, st.l + e.clientX - st.x)), t = Math.max(0, Math.min(st.br.height - 50, st.t + e.clientY - st.y)); UI.tutPos = { l: l, t: t }; b.style.left = l + 'px'; b.style.top = t + 'px'; b.style.right = 'auto'; });
  h.addEventListener('pointerup', function () { st = null; }); h.addEventListener('pointercancel', function () { st = null; });
}
function tutPlace(b) {   // default spot: top of the free board area (under the score chips); a dragged window keeps its place
  if (UI.tutPos) { b.style.left = UI.tutPos.l + 'px'; b.style.top = UI.tutPos.t + 'px'; b.style.right = 'auto'; return; }
  var br = $('#board').getBoundingClientRect(), t = 6; ['#cards', '#seats', '#terr', '#acorn'].forEach(function (q) { var r = hudVis($(q)); if (r && r.top < br.top + br.height * 0.45) t = Math.max(t, r.bottom - br.top + 4); });
  b.style.top = Math.round(t) + 'px'; b.style.left = ''; b.style.right = '';
}
function tutDraw() {
  var T = UI.tut, s = T.steps[T.i]; $$('.tuthl').forEach(function (e) { e.classList.remove('tuthl'); });
  if (!s || s.wait || T.closed || hudMap.on) { var w = $('#coachb'); if (w) w.hidden = true; return; }
  var b = tutWin(), L = tutLessons(), k = LESSON[L.cur] || ['', ''];
  b.classList.toggle('min', !!T.min); b.querySelector('#tutMin').setAttribute('aria-label', T.min ? 'Open lesson' : 'Minimise lesson'); b.querySelector('#tutMin').innerHTML = T.min ? '&#9634;' : '&#8211;';
  var key = T.i + ':' + L.cur;
  if (b.dataset.k !== key) {
    var n = 0; L.list.forEach(function (x, j) { if (x.r === L.cur) n = j + 1; });
    b.querySelector('.twt').textContent = 'Lesson ' + n + '/' + L.list.length + ': ' + k[0];
    b.querySelector('.twmsg').innerHTML = '<i class="cface" aria-hidden="true"></i><p>' + esc(s.say) + '<span class="why">Why: ' + esc(k[1]) + '</span></p>';
    b.querySelector('.twlist').innerHTML = L.list.map(function (x) { var done = x.i < T.i && x.r !== L.cur; return '<li class="' + (done ? 'done' : x.r === L.cur ? 'cur' : '') + '"><span aria-hidden="true">' + (done ? '&#10003;' : x.r === L.cur ? '&#9656;' : '&#9675;') + '</span> ' + esc(LESSON[x.r][0]) + '</li>'; }).join('');
    b.dataset.k = key;
  }
  b.dataset.rule = s.r || L.cur || ''; var was = b.hidden || b.dataset.min !== String(!!T.min); b.hidden = false; b.dataset.min = String(!!T.min); tutPlace(b); if (was && !UI.tutPos) { b.dataset.k = ''; fitView(true, true); return; }   // the valley refits around the window when it appears or changes size
  var el = null, h = s.hl;
  if (h === 'next') el = null;
  else if (h.indexOf('col:') === 0) el = $('#mk .mt[data-i="' + h.slice(4) + '"]');
  else if (h.indexOf('tok:') === 0) el = $('#mk .mk[data-i="' + h.slice(4) + '"]');
  else if (h === 'spot') el = UI.ghost ? null : $('#map .spot[data-c="' + T.spot + '"]');
  else if (h === 'cell') el = UI.ghost ? $('#map .ghost') : G.stage === 'tok' ? $('#map .hx.tgt[data-c="' + T.spot + '"]') || $('#map .hx.tgt') : null;   // wherever the player put the tile
  else if (h.charAt(0) === '#') el = $(h);
  if (el) el.classList.add('tuthl');
}
function tutAdvance() { var T = UI.tut, s = tutCur(); if (!s) return; if (s.after) s.after(); if (s.r === 'map' || hudMap.on) hudMap(false); T.i++; T.entered = false; sfx('tap'); render(); }
// ---------------------------------------------------------------- the screen map: real HUD, labelled callouts with leader lines (also from the ? button)
var HUD = [
  ['#barstat', 'Turn', 'Which turn it is: a game has 20.'],
  ['#bulbbtn', 'Tip', 'Shows the best move right now.'],
  ['#hintsB', 'Hints', 'Point previews on spots and pairs, on or off.'],
  ['[data-gx="scored"]', 'Scores', 'Every score source, you against your rivals.'],
  ['[data-gx="rulesd"]', 'Rules', 'All rules and the five animal cards.'],
  ['[data-gx="setd"]', 'Menu', 'Restart, sound, tutorial, title screen.'],
  ['#tutQ', 'Screen map', 'Opens this map and your lessons again.'],
  ['#cards', 'Animal points', 'Your points per animal; tap one for its card.'],
  ['#seats', 'Players', 'Everyone\'s total score.'],
  ['#terr', 'Biggest lands', 'Your largest joined land of each kind vs rivals.'],
  ['#vp', 'Your valley', 'Your tiles. Drag to move, pinch to zoom.'],
  ['#zoom', 'Zoom', 'Zoom out, fit the whole valley, zoom in.'],
  ['#line', 'What to do', 'The one thing to do now, step by step.'],
  ['#mk', 'Market', 'Four pairs: a tile with the animal under it.'],
  ['#acts', 'Acorns', 'Spend acorns, sweep three, or ask for help.']
];
function hudVis(e) { if (!e) return null; var r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return null; var cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return null; if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return null; return r; }
function hudMap(on) {
  var old = $('#hudmap'); if (old) old.remove(); hudMap.on = !!on; if (!on) { if (G) render(); return; }
  var cw0 = $('#coachb'); if (cw0) cw0.hidden = true;   // the lesson window steps aside while the map is open
  var bd = $('#board').getBoundingClientRect(), sr = safeRect(), R = { l: bd.left + sr.l, t: bd.top + sr.t, r: bd.left + sr.r, b: bd.top + sr.b };
  var o = document.createElement('div'); o.id = 'hudmap'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-label', 'Screen map');
  var tut = tutOn(), html = '<svg class="hmlines" aria-hidden="true"></svg><div class="hmhead" style="left:' + R.l + 'px;top:' + R.t + 'px;width:' + (R.r - R.l) + 'px"><b>Screen map</b><span class="hmsay">Tap a label to see what it does.</span>' + (tut ? '<button type="button" class="ab pri" id="hmNext">Next</button>' : '') + '<button type="button" class="twb" id="hmX" aria-label="Close screen map">&times;</button></div>';
  o.innerHTML = html; document.body.appendChild(o);
  var head = o.querySelector('.hmhead'), top0 = head.getBoundingClientRect().bottom + 6, say = o.querySelector('.hmsay');
  var items = HUD.map(function (h) { var e = $(h[0]); if (h[0] === '#vp') e = $('#map #vp'); var r = hudVis(e); return r ? { q: h[0], n: h[1], t: h[2], r: r, cx: (r.left + r.right) / 2, cy: (r.top + r.bottom) / 2 } : null; }).filter(Boolean);
  var H = 44, GAP = 4, W = R.r - R.l, ncol = W < 520 ? 3 : 4, cw = (W - (ncol - 1) * 6) / ncol, rows = Math.max(1, Math.floor((R.b - top0 + GAP) / (H + GAP)));
  var cols = []; for (var i = 0; i < ncol; i++) cols.push([]);
  items.sort(function (a, b) { return a.cy - b.cy; }).forEach(function (it) {   // nearest column by x that still has room
    var pref = Math.max(0, Math.min(ncol - 1, Math.floor((it.cx - R.l) / (W / ncol)))), order = [pref]; for (var d = 1; d < ncol; d++) { if (pref - d >= 0) order.push(pref - d); if (pref + d < ncol) order.push(pref + d); }
    for (var j = 0; j < order.length; j++) if (cols[order[j]].length < rows) { cols[order[j]].push(it); return; }
  });
  var lines = '', labels = '';
  cols.forEach(function (col, ci) { col.sort(function (a, b) { return a.cy - b.cy; }); var x = R.l + ci * (cw + 6);
    col.forEach(function (it, ri) { var y = top0 + ri * (H + GAP); it.box = { l: x, t: y, w: cw, h: H };
      var lx = x + cw / 2, ly = y + H / 2, tx = Math.max(it.r.left + 4, Math.min(it.r.right - 4, lx)), ty = Math.max(it.r.top + 4, Math.min(it.r.bottom - 4, ly));
      var sx = it.cy < ly ? ly - H / 2 : ly + H / 2; if (it.r.top < ly && it.r.bottom > ly) sx = ly;
      lines += '<line x1="' + lx.toFixed(1) + '" y1="' + sx.toFixed(1) + '" x2="' + tx.toFixed(1) + '" y2="' + ty.toFixed(1) + '"/><circle cx="' + tx.toFixed(1) + '" cy="' + ty.toFixed(1) + '" r="4"/>';
      labels += '<button type="button" class="hmlab" data-q="' + esc(it.q) + '" data-t="' + esc(it.t) + '" style="left:' + x.toFixed(1) + 'px;top:' + y.toFixed(1) + 'px;width:' + cw.toFixed(1) + 'px">' + esc(it.n) + '</button>';
    });
  });
  o.querySelector('.hmlines').innerHTML = lines; o.insertAdjacentHTML('beforeend', labels);
  window.WM_HUDMAP = { n: o.querySelectorAll('.hmlab').length, want: items.length };
}
document.addEventListener('click', function (e) {
  var t = e.target.closest && e.target.closest('.hmlab, #hmX, #hmNext, #tutQ, #tutMin, #tutX, #tutList'); if (!t) return;
  if (t.classList.contains('hmlab')) {   // the label's control pulses and its one line shows under the map title
    $$('.hmglow').forEach(function (x) { x.classList.remove('hmglow'); }); var q = t.dataset.q === '#vp' ? $('#map #vp') : $(t.dataset.q); if (q) q.classList.add('hmglow');
    $('#hudmap .hmsay').textContent = t.textContent + ': ' + t.dataset.t;
    $$('#hudmap .hmlab').forEach(function (x) { x.classList.toggle('on', x === t); }); sfx('tap'); return;
  }
  if (t.id === 'hmX' || t.id === 'hmNext') { $$('.hmglow').forEach(function (x) { x.classList.remove('hmglow'); }); hudMap(false); return; }
  if (t.id === 'tutQ') { if (UI.tut) { UI.tut.closed = false; UI.tut.min = false; } hudMap(!hudMap.on); return; }
  var T = UI.tut; if (!T) return;
  if (t.id === 'tutMin') { T.min = !T.min; render(); return; }
  if (t.id === 'tutX') { T.closed = true; render(); fitView(true, true); toast('Lesson closed. Tap ? to open it again.'); return; }
  if (t.id === 'tutList') { var l = $('#coachb .twlist'), on = l.hidden; l.hidden = !on; t.setAttribute('aria-expanded', on ? 'true' : 'false'); return; }
});
document.addEventListener('click', function (e) {
  var t = e.target.closest && e.target.closest('#tutNext, #coachStory'); if (!t) return;
  if (t.id === 'tutNext') { tutAdvance(); return; }   // every lesson can be finished with Next
  $('#rs').hidden = true; showTitle(); GXC.play(CAMPAIGN.chapters[0].id);
});
// final scoring walk-through with the player's real numbers (every rule was taught during the game, so no "later" list)
function coachFinalHTML() {
  if (UI.mode !== 'coach' || !G || !G.over || !UI.tut) return '';
  var r = G.res[0], b = G.res[1], tb = 0, hb = 0; WM.TER.forEach(function (t) { hb += r.hab[t]; tb += r.bonus[t] || 0; });
  window.WM_COACH = { explained: Object.keys(UI.tut.seen), shown: UI.tut.shown.slice(), later: [], step: UI.tut.i, steps: UI.tut.steps.length };
  window.GXCOACH = { running: false, explained: Object.keys(UI.tut.seen), later: [], done: true };
  var h = '<div class="cfinal"><p class="ch"><i class="cface" aria-hidden="true"></i><span><b>Rowan</b> Here is how your score adds up.</span></p><ol>';
  h += '<li>Animals: <b>' + r.aniT + '</b></li>';
  h += '<li>Biggest land of each kind: <b>' + hb + '</b>, bonus <b>' + tb + '</b></li>';
  h += '<li>Acorns kept: <b>' + r.acorns + '</b></li>';
  h += '<li>Total <b>' + r.total + '</b>, ' + esc(G.seats[1].name) + ' <b>' + b.total + '</b></li></ol>';
  return h + '</div>';
}
function coachEnd() {   // after the result is drawn: the tutorial counts as done, and the main button starts a real 20-turn game
  if (UI.mode !== 'coach') return; try { GXT.markDone(TUT_GAME); } catch (e) { } coachHide(); UI.tut = null;
  var pro = UI.coachPrologue; UI.mode = 'quick'; UI.cfg = { np: 2, humans: 1, ai: 'gentle', turns: 20 };
  var a = $('#againB'); if (a) a.textContent = 'Start a practice game';
  if (pro && window.GXC && CAMPAIGN.chapters[0]) { var t = $('#titleB'); if (t) { t.textContent = 'Start the story'; t.id = 'coachStory'; } }
}
function storyOpen() { if (!window.GXC) return; $('#start').hidden = true; GXC.open(); }   // the title steps aside so its buttons never sit under the map
function tutLeave() { UI.mode = 'quick'; UI.tutor = false; UI.tut = null; coachHide(); }
function tutStart(o) {
  try { GX.close(); } catch (e) { } if (window.GXC && GXC.close) try { GXC.close(); } catch (e) { }
  try { if (window.GXT && GXT.running()) GXT.stop(); } catch (e) { }
  UI.coachPrologue = !!(o && o.prologue); UI.prefs.played = 1; savePrefs();
  UI.tut = { steps: tutSteps(), i: 0, entered: false, seen: {}, shown: [], fixed: {}, t0: 0, spot: null, best: 0, busy: false, min: false, closed: false }; UI.tutPos = null;
  window.GXCOACH = { running: true, explained: [], done: false };
  UI.mode = 'coach'; newGame({ np: 2, humans: 1, ai: 'novice', seed: TUT_SEED, turns: TUT_TURNS, names: [null, 'Bram'] }); UI.mode = 'coach'; G.tutRival = true;
  tutFix(); render();
}

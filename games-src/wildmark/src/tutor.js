/* Wildmark tutorial: a FLOATING lesson window over a real game against Bram (owner rules, 24 Nov).
   Never dims, never blocks a tap, never makes the suggestion the only tappable thing: a soft pulse ring marks it.
   Starts with a labelled map of the real screen (reopen with ?). Lessons cover every rule in play order, one sentence + why;
   each ends when the player does it or taps Next. Then the same game goes on as a practice game. Gate: tut-v3.js. */
var TUT_GAME = 'wildmark', TUT_SEED = 11;
window.GXCOACH = { running: false, explained: [], done: false };   // read by the QA bot's coached mode
// say = one sentence; why = the reason; done = finished by play (else Next); sug = where the pulse ring goes
var TUT_STEPS = [
  { id: 'goal', title: 'The goal', say: 'Build a valley that scores more points than Bram after 20 turns each.', why: 'Points come from animals, joined land and acorns.', sug: '#barstat' },
  { id: 'pick', title: 'Take a pair', say: 'Tap a market column to take its tile and the animal under it.', why: 'Every turn starts with one tile + one animal; the column refills after.', done: function (T) { return G.stage !== 'pick' || G.seats[0].done > T.t0; }, sug: '#mk .mt' },
  { id: 'rotate', title: 'Turn a tile', say: 'Tap a glowing spot; Turn then spins a two-land tile to any side.', why: 'Matching edges join land into bigger groups.', done: function (T) { return T.did.rot || G.stage === 'tok' || G.seats[0].done > T.t0; }, sug: function () { return UI.ghost ? '#rotB' : '#map .spot'; } },
  { id: 'place', title: 'Place the tile', say: 'Tap a glowing spot touching your valley, then Place.', why: 'Tiles must touch your valley and can never move later.', done: function (T) { return G.stage === 'tok' || G.seats[0].done > T.t0; }, sug: function () { return UI.ghost ? '#okB' : '#map .spot'; } },
  { id: 'settle', title: 'Settle the animal', say: 'Tap a ringed tile showing that animal, or Skip it back to the bag.', why: 'One animal per tile, only where its picture is, and it never moves.', done: function (T) { return G.seats[0].done > T.t0; }, sug: function () { return G.stage === 'tok' ? '#map .tgt' : '#map .spot'; } },
  { id: 'keystone', title: 'Keystones', say: 'An animal on a gold-rimmed one-land keystone earns an acorn.', why: 'Acorns buy flexible picks and are worth 1 point each at the end.', sug: '#acorn' },
  { id: 'rival', title: 'Bram plays', say: 'Bram now takes, places and settles the same way.', why: 'Turns alternate until everyone has played 20.', done: function (T) { return G.seats[1].done > T.r0 || (T.t0 > 0 && G.seats[1].done >= T.t0); }, sug: '#rivp' },
  { id: 'sweep', title: 'Too many alike', say: 'Four alike in the market swap themselves; three alike you may sweep once per turn.', why: 'It keeps the market varied, free of charge.', done: function (T) { return T.did.w3; }, sug: '#w3B' },
  { id: 'acorn', title: 'Spend an acorn', say: 'Acorn: take any tile with any animal, or swap any market animals.', why: 'Spend as many as you like before you take a pair.', done: function (T) { return T.did.acorn; }, sug: '#acornB' },
  { id: 'habitat', title: 'Joined land', say: 'Each land scores 1 point per tile in its biggest joined group.', why: 'Tiles join only where their touching edges are the same land.', sug: '#terr' },
  { id: 'majority', title: 'Biggest land bonus', say: 'Biggest group of a land: +2, tie +1 each (3-4 players: +3 first, +1 second).', why: 'Solo: +2 for every land group of 7 or more.', sug: '#terr' },
  { id: 'bear', title: 'Bears', say: 'Bears score in groups of exactly two; more pairs score more.', why: 'Three bears together score nothing, so keep pairs apart.', sug: '#cards' },
  { id: 'elk', title: 'Elk', say: 'Elk score in straight lines; longer lines score more.', why: 'Each elk counts in one line only.', sug: '#cards' },
  { id: 'salmon', title: 'Salmon', say: 'Salmon score in runs where each touches at most two salmon.', why: 'A salmon with three salmon neighbours breaks the run.', sug: '#cards' },
  { id: 'hawk', title: 'Hawks', say: 'Hawks score only when no other hawk touches them.', why: 'More lone hawks score more, so spread them out.', sug: '#cards' },
  { id: 'fox', title: 'Foxes', say: 'A fox scores 1 for each different animal kind beside it.', why: 'Put foxes where many kinds meet.', sug: '#cards' },
  { id: 'end', title: 'End of the game', say: 'After 20 turns each everything scores; acorns left are 1 point each.', why: 'Tied on points? More acorns wins.', sug: '[data-gx="scored"]' },
  { id: 'practice', title: 'Practice game', say: '', why: 'Finish this game. The line on the board always says what to do now.', practice: true }
];
// ---- HUD map: [selector, label, one sentence] ----
var TUT_MAP = [
  ['#barstat', 'Turn', 'Your turn number out of 20.'],
  ['#tutQ', 'Help ?', 'Reopens this map and the lessons.'],
  ['#bulbbtn', 'Tip', 'Shows a good move for right now.'],
  ['#hintsB', 'Hints', 'Turns point previews on the board on or off.'],
  ['[data-gx="scored"]', 'Scores', 'Full score table for every player.'],
  ['[data-gx="rulesd"]', 'Rules', 'All the rules, any time.'],
  ['[data-gx="setd"]', 'Menu', 'New game, sound, restart.'],
  ['#cards', 'Animals', 'Each animal and its points so far; tap one for its scoring rule.'],
  ['#acorn', 'Acorns', 'Your acorns: spend them for a free pick or a market swap.'],
  ['#terr', 'Biggest land', 'Your biggest joined group of each land and Bram’s.'],
  ['#rivp', 'Bram', 'Bram’s valley and what happened so far.'],
  ['#map', 'Your valley', 'Your tiles; glowing spots are where a tile can go.'],
  ['#line', 'What to do', 'Says exactly what to do now.'],
  ['#zoom', 'Zoom', 'Zoom out, fit the valley, zoom in.'],
  ['#mk', 'Market', 'Four tile + animal pairs; tap a column to take one.'],
  ['#acts', 'Actions', 'Acorn, sweep and Help me buttons.']
];
function tq(s) { return s ? document.querySelector(s) : null; }
function tVis(e) { if (!e) return null; var r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth && getComputedStyle(e).visibility !== 'hidden' ? r : null; }
function tHit(a, b, m) { m = m || 0; return a.left < b.right + m && a.right + m > b.left && a.top < b.bottom + m && a.bottom + m > b.top; }
function tutOn() { return UI.mode === 'coach' && !!UI.tut && !!G; }
function tutCur() { var T = UI.tut; return T && T.steps ? TUT_STEPS[T.i] : null; }
function coachOn() { return tutOn(); }
function coachLine(id) { var c = window.CAMPAIGN && CAMPAIGN.prologue && CAMPAIGN.prologue.coach; return c && c[id] || ''; }
function coachHide() { var w = tq('#twin'), m = tq('#tmap'); if (w) w.remove(); if (m) m.remove(); $$('.tsug').forEach(function (e) { e.classList.remove('tsug'); }); }
// every tap works: the tutorial only listens, so it can tick lessons done
function tutAct(x) { var T = UI.tut; if (T && T.did) { if (x.what === 'rot') T.did.rot = 1; if (x.what === 'w3') T.did.w3 = 1; if (x.what === 'acorn' || x.what === 'freeB' || x.what === 'wipeB') T.did.acorn = 1; } return true; }
function tutQBtn() {
  if (tq('#tutQ')) return; var bar = tq('.gx-bar'), h = tq('#bulbbtn'); if (!bar) return;
  var b = document.createElement('button'); b.type = 'button'; b.id = 'tutQ'; b.className = 'gx-ibtn'; b.setAttribute('aria-label', 'Help: screen map'); b.textContent = '?';
  if (h) bar.insertBefore(b, h); else bar.appendChild(b);
  b.onclick = function () {
    if (!G || G.over) { tutStart(); return; }
    if (!UI.tut || !UI.tut.steps) UI.tut = tutNew(true);
    UI.tut.min = false; tutMapOpen();
  };
}
function tutNew(free) { return { steps: TUT_STEPS, i: free ? TUT_STEPS.length - 1 : 0, done: {}, did: {}, map: true, min: false, pos: null, info: null, free: !!free, t0: 0, r0: 0, spot: null, fixed: {}, shown: [], seen: {} }; }
function tutMapOpen() { var T = UI.tut; if (!T) return; T.map = true; T.info = null; tutQBtn(); tutMapDraw(); tutWin(); }
function tutMapClose() { var T = UI.tut; if (!T) return; T.map = false; T.info = null; var m = tq('#tmap'); if (m) m.remove(); if (T.free) { tutEnd(); return; } tutEnter(); tutWin(); }
function tutMapDraw() {
  var old = tq('#tmap'); if (old) old.remove(); var T = UI.tut; if (!T || !T.map || tq('.gx-drawer[open]')) return;
  var W = innerWidth, H = innerHeight, o = document.createElement('div'); o.id = 'tmap'; document.body.appendChild(o);
  var svg = '<svg class="tml" width="' + W + '" height="' + H + '">', placed = [], tg = [];
  TUT_MAP.forEach(function (m) { var r = tVis(tq(m[0])); if (r) tg.push({ m: m, r: r }); });
  tg.forEach(function (t) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'tlab'; b.textContent = t.m[1]; b.dataset.k = t.m[0]; o.appendChild(b);
    var bw = b.offsetWidth, bh = b.offsetHeight, r = t.r, cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2, best = null;
    var big = r.width > W * .45 || r.height > H * .35;
    var pts = big ? [[cx - bw / 2, cy - bh / 2], [cx - bw / 2, r.top + 8], [r.left + 8, cy - bh / 2], [cx - bw / 2, r.bottom - bh - 8]] : [];
    for (var d = 6; d <= 200; d += 12) pts.push([cx - bw / 2, r.bottom + d], [cx - bw / 2, r.top - d - bh], [r.left - d - bw, cy - bh / 2], [r.right + d, cy - bh / 2], [r.left - d - bw, r.bottom + d], [r.right + d, r.bottom + d], [r.left - bw, r.top - d - bh], [r.right, r.top - d - bh], [r.left, r.bottom + d], [r.right - bw, r.bottom + d]);
    pts.forEach(function (p, i) {
      var x = Math.max(4, Math.min(W - bw - 4, p[0])), y = Math.max(4, Math.min(H - bh - 4, p[1])), box = { left: x, top: y, right: x + bw, bottom: y + bh }, sc = i * .01;
      placed.forEach(function (q) { if (tHit(box, q, 4)) sc += 1000; });
      tg.forEach(function (q) { if (q !== t && q.r.width < W * .45 && q.r.height < H * .35 && tHit(box, q.r)) sc += 50; });
      if (!big && tHit(box, r)) sc += 30;
      if (!best || sc < best.sc) best = { x: x, y: y, sc: sc, box: box };
    });
    placed.push(best.box); b.style.left = best.x + 'px'; b.style.top = best.y + 'px';
    var lx = best.x + bw / 2, ly = best.y + bh / 2, ex = Math.max(r.left + 4, Math.min(r.right - 4, lx)), ey = Math.max(r.top + 4, Math.min(r.bottom - 4, ly));
    if (big) { ex = lx; ey = ly + bh; }
    svg += '<line x1="' + lx + '" y1="' + ly + '" x2="' + ex + '" y2="' + ey + '"/><circle cx="' + ex + '" cy="' + ey + '" r="4"/>';
    b.onclick = function (ev) { ev.stopPropagation(); UI.tut.info = t.m; $$('#tmap .tlab').forEach(function (x) { x.classList.toggle('on', x === b); }); tutWin(); };
  });
  o.insertAdjacentHTML('afterbegin', svg + '</svg>');
}
window.tutMapBoxes = function () { return $$('#tmap .tlab').map(function (b) { var r = b.getBoundingClientRect(); return { k: b.dataset.k, l: r.left, t: r.top, r: r.right, b: r.bottom }; }); };
// ---- the floating window ----
function tutWin() {
  var w = tq('#twin'), T = UI.tut; if (!T || !T.steps) { if (w) w.remove(); return; }
  if (!w) { w = document.createElement('div'); w.id = 'twin'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-label', 'Lesson'); document.body.appendChild(w); tutDrag(w); }
  var st = tutCur(), h, X = '<button type="button" class="twb" id="twMin" aria-label="Minimise">&#8211;</button><button type="button" class="twb" id="twX" aria-label="Close">&times;</button>';
  if (T.min) w.className = 'min', w.innerHTML = '<button type="button" class="tchip" id="twMax">' + (T.map ? 'Screen map' : 'Lesson ' + (T.i + 1) + ': ' + esc(st.title)) + '</button>';
  else if (T.map) {
    w.className = '';
    h = '<div class="twh"><b>Your screen</b><span class="sp"></span>' + X + '</div>';
    h += '<p class="tws">' + (T.info ? '<b>' + esc(T.info[1]) + ':</b> ' + esc(T.info[2]) : 'Tap any label to learn what it does. Everything still works while this is open.') + '</p>';
    w.innerHTML = h + '<div class="twf"><span class="sp"></span><button type="button" class="ab pri" id="twGo">' + (T.free ? 'Close map' : 'Start lessons') + '</button></div>';
  } else {
    w.className = '';
    h = '<div class="twh"><b>' + (T.i + 1) + '/' + TUT_STEPS.length + ' ' + esc(st.title) + '</b><span class="sp"></span>' + X + '</div>';
    h += '<p class="tws" id="twSay">' + esc(st.practice ? todo() : st.say) + '</p><p class="twy">Why: ' + esc(st.why) + '</p>';
    h += '<ol class="twc" aria-label="Lessons">' + TUT_STEPS.map(function (x, i) { return '<li class="' + (T.done[x.id] ? 'ok' : '') + (i === T.i ? ' cur' : '') + '" title="' + esc(x.title) + '">' + esc(x.title) + '</li>'; }).join('') + '</ol>';
    w.innerHTML = h + '<div class="twf">' + (T.i ? '<button type="button" class="ab" id="twBack">Back</button>' : '') + '<span class="sp"></span>' + (st.practice ? '' : '<button type="button" class="ab pri" id="twNext">Next</button>') + '</div>';
  }
  T.drawn = T.i + (T.map ? 'm' : '') + (T.min ? 'n' : '');
  var on = function (id, f) { var e = tq('#' + id); if (e) e.onclick = function (ev) { ev.stopPropagation(); f(); }; };
  on('twMax', function () { T.min = T.autoMin = false; tutWin(); });
  on('twMin', function () { T.min = true; tutWin(); });
  on('twX', function () { if (T.map && !T.free) { tutMapClose(); return; } tutEnd(); });
  on('twGo', tutMapClose);
  on('twNext', function () { tutDone(); });
  on('twBack', function () { T.i = Math.max(0, T.i - 1); tutEnter(); tutWin(); });
  tutPlace(w); tutRing();
}
function todo() {   // plain "what to do now" for the practice game
  if (!G || G.over) return 'Game over: see the results.';
  if (!myTurn()) return 'Bram is playing. Watch his valley.';
  if (G.stage === 'pick') return 'Take a pair from the market' + (G.seats[0].acorns ? ' (or spend an acorn first).' : '.');
  if (G.stage === 'tile') return UI.ghost ? 'Turn the tile if you like, then Place, or tap a ringed tile.' : 'Tap a glowing spot for the tile.';
  return 'Tap a ringed tile for the animal, or Skip it.';
}
function tutPlace(w) {   // keep clear of what the lesson points at, unless the player dragged it
  var W = innerWidth, H = innerHeight, bw = w.offsetWidth, bh = w.offsetHeight, T = UI.tut;
  if (T.pos) { w.style.left = Math.max(0, Math.min(W - bw, T.pos[0])) + 'px'; w.style.top = Math.max(0, Math.min(H - bh, T.pos[1])) + 'px'; return; }
  var avoid = [];
  if (T.map) { $$('#tmap .tlab').forEach(function (b) { avoid.push([b.getBoundingClientRect(), 200]); }); }
  else { var r = tVis(tq('.tsug')); if (r && r.width < W * .6) avoid.push([r, 400]); }
  [['#mk', 150], ['#acts', 150], ['#line', 120], ['.gx-bar', 300], ['#cards', 60], ['#map .spot', 80], ['#map .tgt', 80], ['#okB', 200], ['#rotB', 200], ['#backB', 200]].forEach(function (a) { $$(a[0]).forEach(function (e) { var q = tVis(e); if (q) avoid.push([q, a[1]]); }); });
  var spots = [[(W - bw) / 2, H * .3], [8, 64], [W - bw - 8, 64], [8, (H - bh) / 2], [W - bw - 8, (H - bh) / 2], [(W - bw) / 2, 64], [(W - bw) / 2, (H - bh) / 2], [8, H - bh - 8], [W - bw - 8, H - bh - 8], [(W - bw) / 2, H - bh - 8]], best = null;
  for (var y = 60; y < H - bh; y += 40) spots.push([8, y], [W - bw - 8, y]);
  spots.forEach(function (p, i) {
    var box = { left: p[0], top: p[1], right: p[0] + bw, bottom: p[1] + bh }, sc = i * .05;
    avoid.forEach(function (a) { if (tHit(box, a[0])) { var ix = Math.min(box.right, a[0].right) - Math.max(box.left, a[0].left), iy = Math.min(box.bottom, a[0].bottom) - Math.max(box.top, a[0].top); sc += a[1] + ix * iy / 400; } });
    if (!best || sc < best.sc) best = { p: p, sc: sc };
  });
  w.style.left = Math.max(0, best.p[0]) + 'px'; w.style.top = Math.max(0, Math.min(H - bh, best.p[1])) + 'px';
  var panel = tq('.gx-drawer[open]');   // a drawer is open: fold to a chip so the window never covers it; unfold when it closes
  if (panel && !T.min) { T.min = T.autoMin = true; tutWin(); } else if (!panel && T.autoMin) { T.min = T.autoMin = false; tutWin(); }
}
function tutDrag(w) {
  var d = null;
  w.addEventListener('pointerdown', function (e) { if (!e.target.closest('.twh') || e.target.closest('button')) return; var r = w.getBoundingClientRect(); d = [e.clientX - r.left, e.clientY - r.top]; try { w.setPointerCapture(e.pointerId); } catch (x) { } });
  w.addEventListener('pointermove', function (e) { if (!d || !UI.tut) return; UI.tut.pos = [e.clientX - d[0], e.clientY - d[1]]; tutPlace(w); });
  w.addEventListener('pointerup', function () { d = null; });
}
function tutRing() {   // a soft pulse ring on the suggestion; never the only tappable thing
  $$('.tsug').forEach(function (e) { e.classList.remove('tsug'); });
  var T = UI.tut, st = tutCur(); if (!T || T.map || T.min || !st || !st.sug || st.practice || !G || G.over) return;
  var sel = typeof st.sug === 'function' ? st.sug() : st.sug, w = tq('#twin'), wr = w && w.getBoundingClientRect();
  var list = $$(sel).filter(function (x) { var r = tVis(x); return r && !(wr && tHit(r, wr)); }), e = list[0] || tq(sel);
  if (e) e.classList.add('tsug');
}
function tutEnter() { var T = UI.tut; if (!T || !G) return; T.t0 = G.seats[0].done; T.r0 = G.seats[1] ? G.seats[1].done : 0; T.did = {}; var st = tutCur(); if (st) { T.seen[st.id] = 1; T.shown.push(st.id); } }
function tutDone() {
  var T = UI.tut, st = tutCur(); if (!st) return; T.done[st.id] = 1;
  if (T.i < TUT_STEPS.length - 1) T.i++;
  tutEnter(); tutWin();
  var nx = tutCur(); if (nx && nx.done && nx.done(T)) setTimeout(function () { if (G && UI.tut && UI.tut.steps) render(); }, 0);   // already done (e.g. Bram played): tick it
  window.GXCOACH.explained = Object.keys(T.done);
}
function tutEnd() { coachHide(); var T = UI.tut; if (T && T.free) UI.tut = null; else if (T) { T.steps = null; } }
// ---- hooks called by ui.js render ----
function coachCheck() {
  tutQBtn(); var T = UI.tut; if (!T || !T.steps || !G) return;
  if (UI.mode !== 'coach' && !T.free) { tutEnd(); return; }
  var st = tutCur();
  if (!T.map && st && st.done && st.done(T)) { tutDone(); return; }
  if (T.drawn !== T.i + (T.map ? 'm' : '') + (T.min ? 'n' : '') || !tq('#twin')) tutWin();
  else { var say = tq('#twSay'); if (say && st && st.practice) say.textContent = todo(); }
  if (T.map) tutMapDraw();
  setTimeout(function () { var w = tq('#twin'); if (w && UI.tut && UI.tut.steps) { tutPlace(w); tutRing(); } }, 0);
  window.WM_COACH = { explained: Object.keys(T.done), shown: T.shown.slice(), later: [], step: T.i, steps: TUT_STEPS.length };
}
function tutDraw() { if (UI.tut && UI.tut.steps) tutRing(); }   // map-only redraws keep the ring
window.tutState = function () { var T = UI.tut; return T && T.steps ? { i: T.i, id: tutCur().id, map: T.map, min: T.min, done: Object.keys(T.done) } : null; };
window.addEventListener('resize', function () { var T = UI.tut; if (T && T.steps) { if (T.map) tutMapDraw(); tutWin(); } });
document.addEventListener('click', function () { [0, 300].forEach(function (t) { setTimeout(function () { var w = tq('#twin'), T = UI.tut; if (w && T && T.steps) { if (T.map) tutMapDraw(); tutPlace(w); tutRing(); } }, t); }); });
setTimeout(tutQBtn, 0);
// stacked market for the player's first turns so keystones, a pair of bears and three alike come up (bag counts stay exact)
function tTok(a, slot) { var old = G.market.toks[slot]; if (old) G.bag[old]++; G.bag[a]--; G.market.toks[slot] = a; }
function tTile(t, slot) { G.market.tiles[slot] = Object.assign({ id: 900 + slot + G.seats[0].done * 4 }, t); }
function tutFix() {
  if (!tutOn() || G.over || G.stage !== 'pick' || G.cur !== 0) return;
  var n = G.seats[0].done, F = UI.tut.fixed; if (!F || F['t' + n]) return; F['t' + n] = 1;
  if (n === 0) { tTile({ t: ['forest'], a: ['bear'], key: true }, 0); ['bear', 'elk', 'hawk', 'salmon'].forEach(tTok); }
  if (n === 1) { tTile({ t: ['forest', 'meadow'], a: ['bear', 'fox'], key: false }, 1); ['fox', 'bear', 'hawk', 'salmon'].forEach(tTok); }
  if (n === 2) { tTile({ t: ['meadow', 'peak'], a: ['elk', 'hawk'], key: false }, 3); ['hawk', 'hawk', 'hawk', 'elk'].forEach(tTok); }
  if (n === 3) { tTile({ t: ['river'], a: ['salmon'], key: true }, 0); ['hawk', 'fox', 'salmon', 'elk'].forEach(tTok); }
  G.used3 = false; render();
}
// final scoring walk-through with the player's real numbers
function coachFinalHTML() {
  if (UI.mode !== 'coach' || !G || !G.over || !UI.tut) return '';
  var r = G.res[0], b = G.res[1], tb = 0, hb = 0; WM.TER.forEach(function (t) { hb += r.hab[t]; tb += r.bonus[t] || 0; });
  window.GXCOACH = { running: false, explained: Object.keys(UI.tut.done || {}), later: [], done: true };
  var h = '<div class="cfinal"><p class="ch"><span><b>Rowan</b> Here is how your score adds up.</span></p><ol>';
  h += '<li>Animals: <b>' + r.aniT + '</b></li>';
  h += '<li>Biggest land of each kind: <b>' + hb + '</b>, bonus <b>' + tb + '</b></li>';
  h += '<li>Acorns kept: <b>' + r.acorns + '</b></li>';
  h += '<li>Total <b>' + r.total + '</b>, ' + esc(G.seats[1].name) + ' <b>' + b.total + '</b></li></ol>';
  return h + '</div>';
}
function coachEnd() {   // after the result is drawn: the tutorial counts as done, and the main button starts a real game
  if (UI.mode !== 'coach') return; try { GXT.markDone(TUT_GAME); } catch (e) { } coachHide(); UI.tut = null;
  var pro = UI.coachPrologue; UI.mode = 'quick'; UI.cfg = { np: 2, humans: 1, ai: 'gentle', turns: 20 };
  var a = $('#againB'); if (a) a.textContent = 'Play a real game';
  if (pro && window.GXC && CAMPAIGN.chapters[0]) { var t = $('#titleB'); if (t) { t.textContent = 'Start the story'; t.id = 'coachStory'; } }
}
document.addEventListener('click', function (e) {
  var t = e.target.closest && e.target.closest('#coachStory'); if (!t) return;
  $('#rs').hidden = true; showTitle(); GXC.play(CAMPAIGN.chapters[0].id);
});
function storyOpen() { if (!window.GXC) return; $('#start').hidden = true; GXC.open(); }   // the title steps aside so its buttons never sit under the map
function tutLeave() { UI.mode = 'quick'; UI.tutor = false; UI.tut = null; coachHide(); }
function tutStart(o) {
  try { GX.close(); } catch (e) { } if (window.GXC && GXC.close) try { GXC.close(); } catch (e) { }
  try { if (window.GXT && GXT.running()) GXT.stop(); } catch (e) { }
  UI.coachPrologue = !!(o && o.prologue); UI.prefs.played = 1; savePrefs();
  coachHide(); UI.tut = tutNew(false);
  window.GXCOACH = { running: true, explained: [], done: false };
  UI.mode = 'coach'; newGame({ np: 2, humans: 1, ai: 'novice', seed: TUT_SEED, turns: 20, names: [null, 'Bram'] }); UI.mode = 'coach'; G.tutRival = true;
  tutFix(); tutEnter(); render(); tutMapOpen();
}

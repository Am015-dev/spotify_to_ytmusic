// Meadowfold tutorial: a floating lesson window over a real game vs an Easy rival.
// Owner rules: never dim, never block taps, never make the suggested thing the only tappable one; a soft pulse ring marks the suggestion.
// Starts with a labelled map of the screen (reopen with ?). Lessons follow the order of play; each ends when done or on Next.
var TUT = null;
function tutStart() {
  UI.mode = 'tut';
  newGame({ np: 2, humans: 1, ai: 'easy', side: 'A', spirits: false, seed: 11, seats: [{ name: 'You', ai: null }, { name: 'Rival', ai: 'easy' }] });
  // scripted first pocket and the duck card on show (counts stay exact: swapped with the pouch / pile)
  function give(i, cols) { G.central[i].forEach(function (c) { G.bag[c]++; }); G.central[i] = cols.map(function (c) { G.bag[c]--; return c; }); }
  give(0, ['leaf', 'water', 'mount']); give(1, ['mount', 'mount', 'trunk']);
  var di = G.row.indexOf(5); if (di < 0) { var dk = G.deck.indexOf(5); G.deck[dk] = G.row[0]; G.row[0] = 5; } else if (di) { G.row[di] = G.row[0]; G.row[0] = 5; }
  TUT = { i: 0, done: {}, map: true, min: false, pos: null, info: null };
  render(); tutMapOpen();
}
// say = one short sentence; why = the reason; on = move that completes it; sug = selector of the suggestion ring
var TUT_STEPS = [
  { id: 'pick', title: 'Take a pocket', say: 'Tap any pocket in the tray to take its 3 tokens.', why: 'Every turn starts this way; the pocket refills afterwards.', on: 'take', sug: '.pocket.glow' },
  { id: 'place', title: 'Place all 3 tokens', say: 'Tap a token in your hand, then a glowing hex. Place all three.', why: 'You must place every token you took, in any order.', on: 'place3', sug: '#map .hx.glow' },
  { id: 'stack', title: 'Stacking', say: 'Grey stacks up to 3. Leaves go on 0-2 trunks. Red goes on one grey, trunk or red. Blue and yellow stay flat.', why: 'Taller trees and peaks score more; flat tiles shape rivers and fields.', sug: '#map' },
  { id: 'card', title: 'Take an animal card', say: 'Open Animals and take one card (once per turn, at most 4 unfinished).', why: 'Cards are your animals; each shows the habitat it wants.', on: 'card', sug: '#railRow' },
  { id: 'cube', title: 'Settle an animal', say: 'When a card says Home ready, tap it in My cards, then the glowing hex.', why: 'Its habitat matches (any rotation): the animal moves onto its home hex.', on: 'cube', sug: '#railMine' },
  { id: 'animal', title: 'How an animal scores', say: 'Each settled animal uncovers a number; the card scores the highest one showing.', why: 'Settle the same card again for a bigger number. One animal per hex; nothing stacks on it.', sug: '#railMine' },
  { id: 'end', title: 'End your turn', say: 'Tap End turn when your hand is empty.', why: 'The pocket refills, the animal row refills to 5 and the rival plays.', on: 'end', sug: '#endB' },
  { id: 'land', title: 'Landscape points', say: 'Trees 1/3/7, peaks 1/3/7 if touching a peak, 5 per field group of 2+, 5 per building with 3 colours around.', why: 'Every hex can earn points, so plan shapes, not single tiles.', sug: '#railScore' },
  { id: 'water', title: 'River (side A) or islands (side B)', say: 'Side A: the longest river path scores 2, 5, 8, 11, 15, then +4 per hex. Side B: 5 per island.', why: 'Water links your valley; see Scoring for the full table.', sug: '#railScore' },
  { id: 'spirit', title: 'Spirits (variant)', say: 'With spirits on, keep 1 of 2 on turn one; settle it for its bonus.', why: 'A spirit is a big end-game goal; its cube is not an animal cube.', sug: '#railMine' },
  { id: 'over', title: 'End of game', say: 'When the pouch runs dry or a player has 2 or fewer empty hexes, the round finishes.', why: 'Everyone gets equal turns. Most points wins; a tie goes to most animals on the board.', sug: '#barstat' },
  { id: 'practice', title: 'Practice game', say: '', why: 'Finish this game. The line below always says what to do now.', practice: true, sug: null }
];
// ---- HUD map: every element with a label, a leader line and a one-sentence explanation ----
var TUT_MAP = [
  ['#barstat', 'Players', 'Your score and the rival’s; tap a strip to see that valley.'],
  ['#hintB', 'Hint', 'Suggests a good move for this moment.'],
  ['[data-gx="rulesd"]', 'Rules', 'The full rules, any time.'],
  ['[data-gx="setd"]', 'Menu', 'New game, sound, restart.'],
  ['#tutQ', 'Help ?', 'Reopens this map and the lesson window.'],
  ['#railRow', 'Animals', 'The 5 animal cards you can take this turn.'],
  ['#railMine', 'My cards', 'Your cards: which homes are ready and what they score.'],
  ['#railScore', 'Scoring', 'How every landscape and animal scores, with your points.'],
  ['#railTot', 'Totals', 'Full score table for every player.'],
  ['#map', 'Your valley', 'Place tokens on the hexes; glowing hexes are legal.'],
  ['#central', 'Tray', 'Pockets of 3 tokens; after taking one, your hand and End turn.']
];
function tq(s) { return s ? document.querySelector(s) : null; }
function tVis(e) { if (!e) return null; var r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && getComputedStyle(e).visibility !== 'hidden' ? r : null; }
function tHit(a, b, m) { m = m || 0; return a.left < b.right + m && a.right + m > b.left && a.top < b.bottom + m && a.bottom + m > b.top; }
function tutQBtn() {
  if (tq('#tutQ')) return; var b = document.createElement('button'); b.type = 'button'; b.id = 'tutQ'; b.className = 'gx-ibtn'; b.setAttribute('aria-label', 'Help: screen map'); b.textContent = '?';
  var bar = tq('.gx-bar'), h = tq('#hintB'); if (bar && h) bar.insertBefore(b, h); else document.body.appendChild(b);
  b.onclick = function () { if (!TUT) { TUT = { i: TUT_STEPS.length - 1, done: {}, map: true, min: false, pos: null, info: null, free: true }; } TUT.min = false; tutMapOpen(); };
}
function tutMapOpen() { if (!TUT) return; TUT.map = true; TUT.info = null; tutQBtn(); tutMapDraw(); tutWin(); }
function tutMapClose() { if (!TUT) return; TUT.map = false; TUT.info = null; var m = tq('#tmap'); if (m) m.remove(); if (TUT.free) { tutEnd(); return; } tutWin(); render(); }
function tutMapDraw() {
  var old = tq('#tmap'); if (old) old.remove(); if (!TUT || !TUT.map || UI.pp) return;   // labels step aside while a panel is open
  var W = innerWidth, H = innerHeight, o = document.createElement('div'); o.id = 'tmap'; document.body.appendChild(o);
  var svg = '<svg class="tml" width="' + W + '" height="' + H + '">', placed = [], tg = [];
  TUT_MAP.forEach(function (m) { var r = tVis(tq(m[0])); if (r) tg.push({ m: m, r: r }); });
  tg.forEach(function (t) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'tlab'; b.textContent = t.m[1]; b.dataset.k = t.m[0]; o.appendChild(b);
    var bw = b.offsetWidth, bh = b.offsetHeight, r = t.r, cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2, best = null;
    var big = r.width > W * .45 || r.height > H * .35;
    var pts = big ? [[cx - bw / 2, r.bottom - bh - 8], [cx - bw / 2, cy - bh / 2], [cx - bw / 2, r.top + 8], [r.left + 8, cy - bh / 2]] : [];   // big targets: label at their bottom edge, leaving the middle free for the lesson window
    for (var d = 10; d <= 150; d += 14) pts.push([cx - bw / 2, r.bottom + d], [cx - bw / 2, r.top - d - bh], [r.left - d - bw, cy - bh / 2], [r.right + d, cy - bh / 2], [r.left - d - bw, r.bottom + d], [r.right + d, r.bottom + d], [r.left - bw, r.top - d - bh], [r.right, r.top - d - bh]);
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
    b.onclick = function (ev) { ev.stopPropagation(); TUT.info = t.m; $$('#tmap .tlab').forEach(function (x) { x.classList.toggle('on', x === b); }); tutWin(); };
  });
  o.insertAdjacentHTML('afterbegin', svg + '</svg>');
}
window.tutMapBoxes = function () { return $$('#tmap .tlab').map(function (b) { var r = b.getBoundingClientRect(); return { k: b.dataset.k, l: r.left, t: r.top, r: r.right, b: r.bottom }; }); };
// ---- the floating window ----
function tutCur() { return TUT && TUT_STEPS[TUT.i]; }
function todo() {   // plain "what to do now" for the practice game
  if (!G || G.over) return 'Game over: see the results.';
  if (G.cur !== firstHuman() || UI.busy) return 'The rival is playing. Watch its valley change.';
  var T = G.turn, s = E.seat();
  if (T.took < 0) return 'Take a pocket from the tray.';
  if (T.hand.length) return 'Place your ' + T.hand.length + ' token' + (T.hand.length > 1 ? 's' : '') + ': tap one, then a glowing hex.';
  if (E.moves().some(function (m) { return m.t === 'cube'; })) return 'An animal can move in: open My cards and tap the card that says Home ready.';
  if (!T.tookCard && E.active(s) < 4 && G.row.length) return 'Optional: take an animal card from Animals. Then tap End turn.';
  return 'Tap End turn.';
}
function tutWin() {
  var w = tq('#twin'); if (!TUT) { if (w) w.remove(); return; }
  if (!w) { w = document.createElement('div'); w.id = 'twin'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-label', 'Lesson'); document.body.appendChild(w); tutDrag(w); }
  var st = tutCur(), h;
  if (TUT.min) {
    w.className = 'min'; w.innerHTML = '<button type="button" class="tchip" id="twMax">' + (TUT.map ? 'Screen map' : 'Lesson ' + (TUT.i + 1) + ': ' + esc(st.title)) + '</button>';
  } else if (TUT.map) {
    w.className = '';
    h = '<div class="twh"><b>Your screen</b><span class="sp"></span><button type="button" class="twb" id="twMin" aria-label="Minimise">&#8211;</button><button type="button" class="twb" id="twX" aria-label="Close">&times;</button></div>';
    h += '<p class="tws">' + (TUT.info ? '<b>' + esc(TUT.info[1]) + ':</b> ' + esc(TUT.info[2]) : 'Tap any label to learn what it does. Everything still works while this is open.') + '</p>';
    h += '<div class="twf"><span class="sp"></span><button type="button" class="btn primary" id="twGo">' + (TUT.free ? 'Close map' : 'Start lessons') + '</button></div>';
    w.innerHTML = h;
  } else {
    w.className = '';
    var say = st.practice ? todo() : st.say;
    h = '<div class="twh"><b>' + (TUT.i + 1) + '/' + TUT_STEPS.length + ' ' + esc(st.title) + '</b><span class="sp"></span><button type="button" class="twb" id="twMin" aria-label="Minimise">&#8211;</button><button type="button" class="twb" id="twX" aria-label="Close">&times;</button></div>';
    h += '<p class="tws" id="twSay">' + esc(say) + '</p><p class="twy">Why: ' + esc(st.why) + '</p>';
    h += '<ol class="twc">' + TUT_STEPS.map(function (x, i) { return '<li class="' + (TUT.done[x.id] ? 'ok' : '') + (i === TUT.i ? ' cur' : '') + '">' + esc(x.title) + '</li>'; }).join('') + '</ol>';
    h += '<div class="twf">' + (TUT.i ? '<button type="button" class="btn ghostb" id="twBack">Back</button>' : '') + '<span class="sp"></span>' + (st.practice ? '' : '<button type="button" class="btn primary" id="twNext">Next</button>') + '</div>';
    w.innerHTML = h;
  }
  var on = function (id, f) { var e = tq('#' + id); if (e) e.onclick = function (ev) { ev.stopPropagation(); f(); }; };
  on('twMax', function () { TUT.min = TUT.autoMin = false; tutWin(); });
  on('twMin', function () { TUT.min = true; tutWin(); });
  on('twX', function () { if (TUT.map && !TUT.free) { tutMapClose(); return; } tutEnd(); });
  on('twGo', function () { tutMapClose(); });
  on('twNext', function () { tutDone(true); });
  on('twBack', function () { TUT.i = Math.max(0, TUT.i - 1); tutWin(); render(); });
  tutPlace(w); tutRing();
}
function tutPlace(w) {   // keep clear of what the lesson explains (and of the map labels), unless the player dragged it
  var W = innerWidth, H = innerHeight, bw = w.offsetWidth, bh = w.offsetHeight;
  if (TUT.pos) { w.style.left = Math.max(0, Math.min(W - bw, TUT.pos[0])) + 'px'; w.style.top = Math.max(0, Math.min(H - bh, TUT.pos[1])) + 'px'; return; }
  var st = tutCur(), avoid = [];
  if (TUT.map) { if (TUT.info) { var ri = tVis(tq(TUT.info[0])); if (ri) avoid.push([ri, 40]); } $$('#tmap .tlab').forEach(function (b) { avoid.push([b.getBoundingClientRect(), 200]); }); var rc = tVis(tq('#central')); if (rc) avoid.push([rc, 200]); }
  else if (st && st.sug) { var e = tq('.tsug') || tq(st.sug), r = tVis(e); if (r && r.width < innerWidth * .6) avoid.push([r, 400]); ['.pocket.glow', '#endB', '#tray', '#central'].forEach(function (s) { var r2 = tVis(tq(s)); if (r2) avoid.push([r2, 200]); }); }
  [['#dock.on', 300], ['#scorep.on', 300], ['.gx-drawer[open]', 300], ['#rail', 40], ['#topbar', 40], ['#map', 2]].forEach(function (a) { var r3 = tVis(tq(a[0])); if (r3) avoid.push([r3, a[1]]); });
  var spots = [[8, H - bh - 8], [W - bw - 8, H - bh - 8], [8, 64], [W - bw - 8, 64], [(W - bw) / 2, H - bh - 8], [(W - bw) / 2, 64], [8, (H - bh) / 2], [W - bw - 8, (H - bh) / 2], [(W - bw) / 2, (H - bh) / 2], [(W - bw) / 2, H * .3]], best = null;
  spots.forEach(function (p, i) {
    var box = { left: p[0], top: p[1], right: p[0] + bw, bottom: p[1] + bh }, sc = i * .1;
    avoid.forEach(function (a) { if (tHit(box, a[0])) { var ix = Math.min(box.right, a[0].right) - Math.max(box.left, a[0].left), iy = Math.min(box.bottom, a[0].bottom) - Math.max(box.top, a[0].top); sc += a[1] + ix * iy / 400; } });
    if (!best || sc < best.sc) best = { p: p, sc: sc };
  });
  w.style.left = Math.max(0, best.p[0]) + 'px'; w.style.top = Math.max(0, best.p[1]) + 'px';
  // a panel fills the screen: fold to a chip so the window never covers it; unfold when it closes
  var panel = tq('#dock.on, #scorep.on');
  if (panel && best.sc >= 300 && !TUT.min) { TUT.min = TUT.autoMin = true; tutWin(); }
  else if (!panel && TUT.autoMin) { TUT.min = TUT.autoMin = false; tutWin(); }
}
function tutDrag(w) {
  var d = null;
  w.addEventListener('pointerdown', function (e) { if (!e.target.closest('.twh') || e.target.closest('button')) return; var r = w.getBoundingClientRect(); d = [e.clientX - r.left, e.clientY - r.top]; try { w.setPointerCapture(e.pointerId); } catch (x) { } });
  w.addEventListener('pointermove', function (e) { if (!d) return; TUT.pos = [e.clientX - d[0], e.clientY - d[1]]; tutPlace(w); });
  w.addEventListener('pointerup', function () { d = null; });
}
function tutRing() {   // a soft pulse ring on the suggestion; never the only tappable thing
  $$('.tsug').forEach(function (e) { e.classList.remove('tsug'); });
  var st = tutCur(); if (!TUT || TUT.map || !st || !st.sug || st.practice || !G || G.cur !== 0 || UI.busy) return;
  var sel = st.sug;
  if (st.id === 'card' && UI.pp === 'dock' && UI.tab === 'row') sel = '.acard.playable';
  if (st.id === 'cube') sel = UI.sel && UI.sel.kind === 'card' ? '#map .hx.glow' : UI.pp === 'dock' && UI.tab === 'mine' ? '.acard.ready' : '#railMine';
  if (st.id === 'place' && !(UI.sel && UI.sel.kind === 'tok')) sel = '.htok';
  var e = tq(sel), w = tq('#twin');
  if (sel === '#map .hx.glow' && w) {   // suggest a glowing hex the window does not cover
    var wr = w.getBoundingClientRect(); e = Array.prototype.slice.call(document.querySelectorAll(sel)).filter(function (x) { return !tHit(x.getBoundingClientRect(), wr); })[0] || e;
  }
  if (e) e.classList.add('tsug');
}
function tutDone(next) {
  var st = tutCur(); if (!st) return; TUT.done[st.id] = 1;
  if (TUT.i < TUT_STEPS.length - 1) TUT.i++;
  TUT.pos = TUT.pos; tutWin(); if (next) render();
}
function tutEnd() { $$('.tsug').forEach(function (e) { e.classList.remove('tsug'); }); var w = tq('#twin'), m = tq('#tmap'); if (w) w.remove(); if (m) m.remove(); TUT = null; if (G) render(); }
// ---- hooks called by ui.js ----
window.tutAllow = function () { return true; };   // every legal tap works during the tutorial
window.tutAfter = function (m) {
  var st = tutCur(); if (!st || UI.mode !== 'tut' || st.practice) return;
  var hit = st.on === m.t || (st.on === 'place3' && m.t === 'place' && !G.turn.hand.length);
  if (!hit) { var k = TUT_STEPS.findIndex(function (x, i) { return i > TUT.i && (x.on === m.t || (x.on === 'place3' && m.t === 'place' && !G.turn.hand.length)); }); if (k < 0) return; }
  if (hit) tutDone(false);
};
window.tutRender = function () {
  if (!TUT) return; tutQBtn();
  if (UI.mode !== 'tut' && !TUT.free) { tutEnd(); return; }
  if (TUT.map) tutMapDraw();
  var say = tq('#twSay'), st = tutCur();
  if (say && st && st.practice) say.textContent = todo(); else if (!tq('#twin')) tutWin();
  setTimeout(function () { var w = tq('#twin'); if (w && TUT) tutPlace(w); }, 0); tutRing();
};
window.tutState = function () { return TUT ? { i: TUT.i, id: tutCur().id, map: TUT.map, min: TUT.min, done: Object.keys(TUT.done) } : null; };
window.addEventListener('resize', function () { if (TUT) { if (TUT.map) tutMapDraw(); tutWin(); } });
setTimeout(tutQBtn, 0);
// panels open without a full render: re-place the window after every tap (and after the slide-in)
document.addEventListener('click', function () { [0, 300].forEach(function (t) { setTimeout(function () { var w = tq('#twin'); if (w && TUT) { if (TUT.map && TUT.lastPP !== UI.pp) { TUT.lastPP = UI.pp; tutMapDraw(); } tutPlace(w); tutRing(); } }, t); }); });

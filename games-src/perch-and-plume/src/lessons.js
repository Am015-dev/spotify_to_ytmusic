// ===================== floating lessons (W649): the tutorial as a draggable, minimisable, closable window over a LIVE game =====================
// Owner rules: never dim, never block taps, never make one thing the only tappable one. A gentle ring marks where a lesson points.
// Starts with a labelled map of the real screen (callouts + leader lines, tap a label for one sentence; reopen any time with "?").
// Lessons follow play order, one sentence + why each; a lesson is done when you do it or press Next. Then a short practice round.
var LSN = { on: false, i: 0, done: {}, acted: {}, map: false, min: false, info: '', iv: 0, practice: false };
window.PPLESSON = { get active() { return LSN.on; }, get i() { return LSN.i; }, get n() { return LESSONS.length; }, get done() { return Object.keys(LSN.done); }, get id() { var l = LESSONS[LSN.i]; return l && l.id; } };
function lvis(e) { if (!e || !e.isConnected) return false; for (var x = e; x; x = x.parentElement) { if (x.hidden || getComputedStyle(x).display === 'none') return false; } var r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
function lq(sel) { return $$(sel).filter(lvis)[0] || null; }
// the screen map: what each part of the real screen is (one sentence each)
var HUD = [
  ['#mapbtn', 'Map (?)', 'Opens this map again whenever you forget what something is.'],
  ['#bulbbtn', 'Hints', 'Turns on a hint that shows the move the computer would make, and why.'],
  ['#goalsbtn', 'Goals', 'The four round goals, everyone’s count, and your secret bonus card.'],
  ['[data-gx="logd"]', 'Log', 'Everything that happened, turn by turn.'],
  ['#rulesbtn', 'Rules', 'All the rules on one page.'],
  ['#menubtn', 'Menu', 'Restart, sound, all cards and the tutorial.'],
  ['#opps', 'Scores', 'Everyone’s points right now; tap a rival to see their birds.'],
  ['#feeder', 'Birdfeeder', 'Five food dice: the forest action takes food from here.'],
  ['#tray', 'Bird tray', 'Three face-up birds the wetland action can draw.'],
  ['#deckb', 'Deck', 'Hidden birds: the wetland action can draw from here too.'],
  ['.row[data-h="0"]', 'Forest', 'Your forest birds; using this row gains food.'],
  ['.row[data-h="1"]', 'Grassland', 'Your grassland birds; using this row lays eggs.'],
  ['.row[data-h="2"]', 'Wetland', 'Your wetland birds; using this row draws bird cards.'],
  ['.ract[data-h="0"]', 'Row action', 'Tap a row’s start to use it; the number grows as the row fills.'],
  ['.slot.next', 'Next space', 'Where your next bird in that row goes; the top tag is its egg cost.'],
  ['#trk', 'Round & actions', 'Which round it is, how many actions you have left, and the round goal.'],
  ['#foodrow', 'Your food', 'Food tokens you have to pay for birds.'],
  ['#acts', 'Actions', 'Your four choices each turn: play a bird, or use one of the three rows.'],
  ['#hand', 'Your hand', 'Bird cards you can play; tap one to see it large.']
];
// lessons in play order: t = target to ring, act = done when this happens (else done on Next)
var LESSONS = [
  { id: 'map', h: 'The screen', s: 'This map names every part of the screen; tap any label to hear what it does.', w: 'Knowing where things are makes every later rule easy to follow.', t: null },
  { id: 'goal', h: 'How to win', s: 'Build a flock of birds over 4 rounds; the most points wins.', w: 'Every rule below is a way to earn points.', t: '#opps' },
  { id: 'rounds', h: 'Rounds and actions', s: 'You get 8 actions in round 1, then 7, 6 and 5.', w: 'Fewer actions later means early birds that help you are worth a lot.', t: '#trk' },
  { id: 'turn', h: 'One action a turn', s: 'Each turn take exactly one action: play a bird, or use one habitat row.', w: 'Playing birds makes your rows stronger; rows give you what birds cost.', t: '#acts' },
  { id: 'play', h: 'Play a bird', act: 'play', s: 'Tap Play a bird, pick a bird, then a glowing space in a habitat it lives in, and pay its food.', w: 'Birds are points, and they power up the row they sit in.', t: '.a4[data-k="play"]' },
  { id: 'costs', h: 'Reading a cost', s: 'Food icons with "/" mean either one, "+" means all of them, the rainbow means any food; any 2 food can pay for 1.', w: 'You rarely have the exact food, so trading 2 for 1 keeps you moving.', t: '#hand' },
  { id: 'eggcost', h: 'Egg cost', s: 'Birds go in the leftmost empty space; spaces cost 0, 1, 1, 2, 2 eggs from left to right.', w: 'The first bird in a row is free; later ones need eggs you laid earlier.', t: '.slot.next' },
  { id: 'white', h: 'White power', s: 'A white power happens once, right when you play that bird.', w: 'It is a one-time boost, so play it when it helps most.', t: null },
  { id: 'food', h: 'Forest: gain food', act: 'food', s: 'Tap the forest row’s start, then take food dice from the birdfeeder one at a time.', w: 'Food is what birds cost, and the more forest birds you have, the more you take.', t: '.ract[data-h="0"]' },
  { id: 'feeder', h: 'The birdfeeder', s: 'An empty feeder is rerolled; if every die shows one face you may reroll; the grub/seed die is either.', w: 'So the feeder never gets stuck on food nobody wants.', t: '#feeder' },
  { id: 'brown', h: 'Brown powers', s: 'After you use a row, every brown power in it fires, from the rightmost bird to the left.', w: 'This is your engine: each bird you add makes that row do more every time.', t: '.row[data-h="0"]' },
  { id: 'eggs', h: 'Grassland: lay eggs', act: 'eggs', s: 'Tap the grassland row’s start, then tap birds to lay eggs, up to each bird’s nest limit.', w: 'Each egg is 1 point and pays the egg cost of birds further right.', t: '.ract[data-h="1"]' },
  { id: 'trade', h: 'Row trades', s: 'Spaces marked ⇄ offer one optional trade: a card for +1 food, a food for +1 egg, an egg for +1 card.', w: 'It turns what you have spare into what you need.', t: '.row[data-h="1"] .slot .yl i' },
  { id: 'cards', h: 'Wetland: draw birds', act: 'cards', s: 'Tap the wetland row’s start, then take birds from the tray or the deck.', w: 'More birds in hand means more choice when you play.', t: '.ract[data-h="2"]' },
  { id: 'tray', h: 'The tray', s: 'The tray refills at the end of each turn and is replaced at the end of each round.', w: 'A bird you want may not wait for you.', t: '#tray' },
  { id: 'pink', h: 'Pink powers', s: 'A pink power fires on someone else’s turn when they do what it names, once between your turns.', w: 'It earns you something even when it is not your turn.', t: '#opps' },
  { id: 'store', h: 'Stored food and tucked cards', s: 'Some powers store food on a bird or tuck a card under it; each is 1 point at the end.', w: 'Small gains every turn add up to many points.', t: '.row[data-h="0"]' },
  { id: 'roundend', h: 'End of a round', s: 'When everyone’s actions are used, the round goal is scored, the tray is cleared and the next player starts.', w: 'Watch the goal before the round ends, not after.', t: '#trk' },
  { id: 'goals', h: 'Round goals', s: 'Leaders on the round goal score 4/1/0 in round 1 up to 7/4/3 in round 4; ties share, zero items scores nothing.', w: 'Goals are worth more each round, so plan for the late ones.', t: '#goalsbtn' },
  { id: 'bonus', h: 'Secret bonus card', s: 'Your bonus card scores at the end for birds that match it; gold-edged birds count.', w: 'Picking birds that fit it is free extra points.', t: '#foodrow .bon' },
  { id: 'final', h: 'Final score', s: 'Score = bird points + bonus + round goals + 1 per egg, stored food and tucked card; a tie goes to most food left.', w: 'Now you know every way to score.', t: null },
  { id: 'practice', h: 'Practice round', s: 'Play one short round on your own against Pip; the Hints bulb shows a good move if you get stuck.', w: 'Trying it once is the fastest way to remember it.', t: null }
];
function lessonsStart() {
  LSN.on = true; LSN.i = 0; LSN.done = {}; LSN.acted = {}; LSN.min = false; LSN.info = ''; LSN.practice = false;
  lessonWin(); LSN.map = true; lessonShow(); lessonMap(true); clearInterval(LSN.iv); LSN.iv = setInterval(lessonTick, 250);
}
function lessonFx(e, mine) {
  if (!LSN.on || !mine) return;
  if (e.k === 'play') LSN.acted.play = 1;
  if (e.k === 'action') LSN.acted[['food', 'eggs', 'cards'][e.h]] = 1;
}
function lessonWin() {
  var w = $('#lsn');
  if (!w) {
    w = document.createElement('div'); w.id = 'lsn'; w.className = 'lsn'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-label', 'Lessons'); w.setAttribute('data-help', 'lesson');
    w.innerHTML = '<div class="lsn-h" data-drag><span class="lsn-n"></span><button type="button" class="lsn-b" data-l="list" aria-label="Checklist">&#9776;</button><button type="button" class="lsn-b" data-l="min" aria-label="Minimise">&#8211;</button><button type="button" class="lsn-b" data-l="x" aria-label="Close lessons">&#10005;</button></div>' +
      '<div class="lsn-body"><b class="lsn-t"></b><p class="lsn-s"></p><p class="lsn-w"></p><p class="lsn-i" hidden></p><ol class="lsn-list" hidden></ol>' +
      '<div class="lsn-f"><button type="button" class="btn lsn-b" data-l="back">Back</button><button type="button" class="btn primary lsn-b" data-l="next">Next</button></div></div>';
    document.body.appendChild(w);
    w.addEventListener('click', function (e) {
      var b = e.target.closest('[data-l]'); if (!b) return; var k = b.dataset.l;
      if (k === 'x') lessonClose();
      else if (k === 'min') { LSN.min = !LSN.min; lessonShow(); }
      else if (k === 'list') { var l = $('.lsn-list', w); l.hidden = !l.hidden; }
      else if (k === 'back') lessonGo(LSN.i - 1);
      else if (k === 'next') lessonNext();
      else if (k === 'go') lessonGo(+b.dataset.i);
      else if (k === 'prac') lessonPractice();
    });
    lessonDrag(w);
  }
  w.hidden = false; return w;
}
function lessonDrag(w) {   // drag by the header bar; always kept inside the screen
  var h = $('.lsn-h', w), sx = 0, sy = 0, ox = 0, oy = 0, on = false;
  h.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; on = true; var r = w.getBoundingClientRect(); sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top; try { h.setPointerCapture(e.pointerId); } catch (x) { } });
  h.addEventListener('pointermove', function (e) { if (!on) return; lessonPlace(w, ox + e.clientX - sx, oy + e.clientY - sy); w.dataset.moved = '1'; });
  h.addEventListener('pointerup', function () { on = false; });
}
function lessonPlace(w, x, y) { var r = w.getBoundingClientRect(); x = Math.max(4, Math.min(innerWidth - r.width - 4, x)); y = Math.max(4, Math.min(innerHeight - r.height - 4, y)); w.style.left = x + 'px'; w.style.top = y + 'px'; w.style.bottom = 'auto'; }
function lessonNext() {
  var l = LESSONS[LSN.i]; if (l) LSN.done[l.id] = LSN.done[l.id] || 'next';
  if (l && l.id === 'map') lessonMap(false);
  lessonGo(LSN.i + 1);
}
function lessonGo(i) { LSN.i = Math.max(0, Math.min(LESSONS.length - 1, i)); LSN.info = ''; var l = LESSONS[LSN.i]; if (l.id === 'map') lessonMap(true); else lessonMap(false); delete LSN.ringed; lessonShow(); }
function lessonClose() { var w = $('#lsn'); if (w) w.hidden = true; lessonMap(false); lessonRing(null); }
function lessonShow() {
  var w = lessonWin(), l = LESSONS[LSN.i] || LESSONS[0];
  w.classList.toggle('min', LSN.min);
  $('.lsn-n', w).textContent = LSN.map && !LSN.on ? 'Screen map' : (LSN.practice ? 'Practice round' : 'Lesson ' + (LSN.i + 1) + ' of ' + LESSONS.length) + (LSN.min ? ': ' + l.h : '');
  $('.lsn-t', w).textContent = LSN.map && !LSN.on ? 'What is on the screen' : l.h;
  $('.lsn-s', w).textContent = LSN.map && !LSN.on ? 'Tap any label to hear what it does.' : l.s;
  $('.lsn-w', w).innerHTML = LSN.map && !LSN.on ? '' : '<i>Why:</i> ' + esc(l.w);
  var inf = $('.lsn-i', w); inf.hidden = !LSN.info; inf.textContent = LSN.info;
  var nx = $('.lsn-f .primary', w), bk = $('[data-l="back"]', w);
  bk.hidden = !LSN.on || LSN.i === 0 || LSN.practice; nx.hidden = LSN.practice;
  if (!LSN.on) { nx.hidden = false; nx.textContent = 'Close map'; nx.dataset.l = 'x'; } else { nx.dataset.l = l.id === 'practice' ? 'prac' : 'next'; nx.textContent = l.id === 'practice' ? 'Start practice round' : 'Next'; }
  $('.lsn-list', w).innerHTML = LESSONS.map(function (x, k) { return '<li><button type="button" class="lsn-li' + (k === LSN.i ? ' cur' : '') + '" data-l="go" data-i="' + k + '">' + (LSN.done[x.id] ? '&#10003; ' : '') + esc(x.h) + '</button></li>'; }).join('');
  $('[data-l="list"]', w).hidden = !LSN.on;
  if (!w.dataset.moved) lessonDock(w);
  var m = $('#hudmap'); if (LSN.map && m && !m.hidden) { m.dataset.sig = ''; lessonMapLayout(); }
}
// default spot: phone = above the panel, PC = over the board's bottom-left; it moves out of the way of the lesson's target
function lessonDock(w) {
  var pc = innerWidth >= 1000, l = LESSONS[LSN.i], t = l && l.t && lq(l.t);
  w.style.width = Math.min(pc ? 380 : innerWidth - 16, 380) + 'px';
  var r = w.getBoundingClientRect(), top = pc ? innerHeight - r.height - 12 : 60;
  if (LSN.map) top = innerHeight - r.height - 8;
  else if (t) { var tr = t.getBoundingClientRect(); if (tr.bottom > top && tr.top < top + r.height) top = tr.top > r.height + 64 ? 60 : innerHeight - r.height - 8; if (pc && tr.left > 400) top = innerHeight - r.height - 12; }
  w.style.left = (pc ? 12 : 8) + 'px'; w.style.top = Math.max(56, top) + 'px'; w.style.bottom = 'auto';
}
function lessonTick() {
  if (!LSN.on) { lessonRing(null); return; }
  var l = LESSONS[LSN.i]; if (!l) return;
  if (l.act && LSN.acted[l.act] && !(G && G.q && PP.sideToAct(G) === UI.view && UI.view === 0)) { LSN.done[l.id] = 'did'; LSN.i++; LSN.info = ''; lessonShow(); return; }
  var t = l.t && lq(l.t); lessonRing(LSN.min ? null : t);
  if (t && LSN.ringed !== l.id) { LSN.ringed = l.id; try { if (t.closest('#dockbody')) t.scrollIntoView({ block: 'nearest' }); } catch (e) { } if (!$('#lsn').dataset.moved) lessonDock($('#lsn')); }
  if (LSN.map) lessonMapLayout();
}
function lessonRing(t) {   // a gentle pulsing ring around the target; it never takes taps
  var r = $('#lsnring');
  if (!t) { if (r) r.hidden = true; return; }
  if (!r) { r = document.createElement('div'); r.id = 'lsnring'; r.className = 'lsnring'; r.setAttribute('aria-hidden', 'true'); document.body.appendChild(r); }
  var b = t.getBoundingClientRect(); r.hidden = false;
  r.style.left = (b.left - 4) + 'px'; r.style.top = (b.top - 4) + 'px'; r.style.width = (b.width + 8) + 'px'; r.style.height = (b.height + 8) + 'px';
}
// ---------- the screen map: labels in two side columns, sorted by height and pushed apart so none overlap; a leader line to each part
function lessonMap(on) {
  LSN.map = on; var m = $('#hudmap');
  if (!on) { if (m) m.hidden = true; return; }
  if (!m) {
    m = document.createElement('div'); m.id = 'hudmap'; m.className = 'hudmap'; m.setAttribute('data-help', 'map');
    m.innerHTML = '<svg class="hm-svg" aria-hidden="true"></svg><div class="hm-labs"></div>'; document.body.appendChild(m);
    m.addEventListener('click', function (e) { var b = e.target.closest('.hm-l'); if (!b) return; LSN.info = b.dataset.say; $$('.hm-l', m).forEach(function (x) { x.classList.toggle('on', x === b); }); lessonShow(); });
  }
  m.hidden = false; m.dataset.sig = ''; lessonMapLayout();
}
function lessonMapLayout() {
  var m = $('#hudmap'); if (!m || m.hidden) return;
  var W = innerWidth, H = innerHeight, pc = W >= 1000, lw = pc ? 150 : 112, lh = pc ? 32 : 28, gap = 4;
  var items = HUD.map(function (x) { var e = lq(x[0]); if (!e) return null; var r = e.getBoundingClientRect(); return { sel: x[0], name: x[1], say: x[2], ax: Math.max(r.left + 6, Math.min(r.right - 6, r.left + r.width / 2)), ay: r.top + r.height / 2, r: r }; }).filter(Boolean);
  var sig = W + 'x' + H + items.map(function (i) { return Math.round(i.ax) + ',' + Math.round(i.ay); }).join(';'); if (m.dataset.sig === sig) return; m.dataset.sig = sig;
  var bar = document.querySelector('.gx-bar'), top = (bar ? bar.getBoundingClientRect().bottom : 0) + 6, w = $('#lsn'), bot = H - 6;
  if (w && !w.hidden) { var wr = w.getBoundingClientRect(); if (wr.top > H / 2) bot = wr.top - 6; }
  items.sort(function (a, b) { return a.ay - b.ay; });
  var cols = { L: [], R: [] };
  items.forEach(function (i) { var f = i.ax / W; cols[f < 0.4 ? 'L' : f > 0.6 ? 'R' : (cols.L.length <= cols.R.length ? 'L' : 'R')].push(i); });
  ['L', 'R'].forEach(function (s) {   // balance: a column that cannot fit gives its middle items to the other side
    var o = s === 'L' ? 'R' : 'L', cap = Math.floor((bot - top) / (lh + gap));
    while (cols[s].length > cap && cols[o].length < cap) { var mv = cols[s].sort(function (a, b) { return Math.abs(a.ax - W / 2) - Math.abs(b.ax - W / 2); }).shift(); cols[o].push(mv); }
  });
  var svg = '', labs = '';
  ['L', 'R'].forEach(function (s) {
    var c = cols[s].sort(function (a, b) { return a.ay - b.ay; }), y = top;
    c.forEach(function (i) { i.y = Math.max(y, Math.min(bot - lh, i.ay - lh / 2)); y = i.y + lh + gap; });
    for (var k = c.length - 1, lim = bot; k >= 0; k--) { c[k].y = Math.min(c[k].y, lim - lh); lim = c[k].y - gap; }   // push back up from the bottom
    c.forEach(function (i) {
      var x = s === 'L' ? 6 : W - 6 - lw, lx = s === 'L' ? x + lw : x, ly = i.y + lh / 2;
      svg += '<line x1="' + lx + '" y1="' + ly + '" x2="' + i.ax + '" y2="' + i.ay + '"/><circle cx="' + i.ax + '" cy="' + i.ay + '" r="4"/>';
      labs += '<button type="button" class="hm-l" data-sel="' + esc(i.sel) + '" data-say="' + esc(i.say) + '" style="left:' + x + 'px;top:' + i.y + 'px;width:' + lw + 'px;height:' + lh + 'px">' + esc(i.name) + '</button>';
    });
  });
  $('.hm-svg', m).innerHTML = svg; $('.hm-labs', m).innerHTML = labs;
}
// the "?" button: the map any time (in or out of the lessons)
document.addEventListener('click', function (e) {
  if (!e.target.closest || !e.target.closest('#mapbtn')) return;
  if (LSN.map && $('#hudmap') && !$('#hudmap').hidden) { lessonMap(false); if (!LSN.on) lessonClose(); else lessonShow(); return; }
  lessonWin(); lessonMap(true); LSN.info = ''; lessonShow(); lessonMapLayout();
});
addEventListener('resize', function () { if (LSN.map) { var m = $('#hudmap'); if (m) m.dataset.sig = ''; lessonMapLayout(); } var w = $('#lsn'); if (w && !w.hidden && !w.dataset.moved) lessonDock(w); });
function lessonPractice() {   // a short round on your own: 1 round of 6 actions vs Pip; no lessons on screen, the "?" map still works
  LSN.done.practice = 'did'; LSN.practice = true; LSN.on = false; lessonMap(false); lessonRing(null);
  var w = $('#lsn'); if (w) w.hidden = true;
  ['title', 'setup', 'result', 'pass'].forEach(function (id) { $('#' + id).hidden = true; });
  startGame({ seats: [{ name: 'You', kind: 'human', face: 'you' }, { name: 'Pip', kind: 'ai', lvl: 'easy', face: 'pip' }], mode: 'vs', seed: (Date.now() % 9973) + 1, rounds: 1, cubes: [6], first: 0,
    prep: function (Gx) { PP.performMove(Gx, PPAI.setup(Gx, 0), 0); PP.performMove(Gx, PPAI.setup(Gx, 1), 1); Gx.cur = 0; Gx.first = 0; Gx.fx = []; } });
  try { toast('Practice round: 6 actions. Tap "?" any time for the screen map.', 3200, 1); } catch (e) { }
  render();
}

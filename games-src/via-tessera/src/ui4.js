
// ---------- floating tutorial (Learn to play) ----------
// Owner rules: a floating window (drag, minimise to a chip, close); never dims, never blocks taps, never makes one thing the only
// tappable one; a gentle pulse ring marks the suggestion; a lesson ends when it is done or on Next; the checklist ticks off.
// Lesson 1 is a labelled map of the real screen (callouts with leader lines, tap one for a sentence). The ? button reopens it.
var TUT = { on: false, i: 0, done: {}, min: false, pos: null, open: false, note: null, t: 0 };
var LESSONS = [
  { id: 'hud', t: 'Your table', s: 'This is the whole game screen; tap any label to hear what it does.', why: 'Knowing where things are makes every turn quick.' },
  { id: 'goal', t: 'The goal', s: 'Most points at the end wins, and points come from the patron on every card you own.', why: 'Each card you buy adds to one patron score.', tg: '#plb', ev: 'points' },
  { id: 'turn', t: 'Your turn', s: 'Pick one card from your hand, then tap the big check to play it.', why: 'Played cards stay out until a Herald brings them back.', tg: '#hand', ev: 'play' },
  { id: 'arch', t: 'Builder: move', s: 'The Builder gives one step per cart and ship on the map; carts use roads, ships use sea lanes.', why: 'Only one piece may stop on a line, but you may pass others.', card: 'arch', ev: 'play:arch' },
  { id: 'build', t: 'Builder: build', s: 'Then build in cities next to your pieces for 1 brick, 1 of the city’s good and coins.', why: 'Coins rise with every house already there; a brick city costs 1 grain.', tg: '#map .city.glow, #map .col', ev: 'build' },
  { id: 'store', t: 'Storehouse', s: 'Your 12 spaces hold goods and the carts and ships still waiting.', why: 'When it is full, extra goods stay in the bank.', tg: '#store' },
  { id: 'pref', t: 'Governor: produce', s: 'Pick a region showing its good: every house there makes 1, and you take its bonus good.', why: 'Rival houses there produce too, so pick regions where you have more.', card: 'pref', ev: 'prov' },
  { id: 'tax', t: 'Governor: taxes', s: 'Or collect the coins on every flipped marker and flip them all back.', why: 'Taxes grow while regions wait.', card: 'pref', ev: 'pcoins' },
  { id: 'gg', t: 'Grand Governor', s: 'Its holder gets 2 bonus goods when making a region produce, then passes it on.', why: 'It starts with the second player and also wins ties.', tg: '#race' },
  { id: 'merc', t: 'Trader', s: 'Take 3 coins (5 on bought Traders), then buy or sell up to 2 kinds of goods.', why: 'Prices: brick 3, grain 4, tools 5, wine 6, cloth 7.', card: 'merc', ev: 'trade' },
  { id: 'sen', t: 'Patron', s: 'Buy up to 2 market cards for their printed goods plus the slot’s extra.', why: 'Far slots cost more; bought cards go to your hand.', card: 'sen', tg: '#mktb', ev: 'buy' },
  { id: 'cons', t: 'Censor', s: 'This market card buys 1 card for its printed goods only.', why: 'It skips the costly slot extras.', tg: '#mktb' },
  { id: 'colo', t: 'Settler', s: 'Pay 1 grain and 1 tool per new cart or ship in Caput or your cities, or take 5 coins plus 1 per piece on the map.', why: 'More pieces mean more Builder steps.', card: 'colo', ev: 'colo' },
  { id: 'dipl', t: 'Envoy', s: 'Do the action of the card on top of the rival’s played pile.', why: 'You cannot copy an Envoy or an empty pile.', card: 'dipl', ev: 'copy' },
  { id: 'trib', t: 'Herald', s: 'Take all played cards back, get 1 coin per card over 3, then you may buy a cart or ship.', why: 'Play it once your best cards are used.', card: 'trib', ev: 'play:trib' },
  { id: 'spec', t: 'Makers', s: 'Potter, Reaper, Tinker, Presser and Dyer make 1 good in each of your cities of that good.', why: 'Only you produce, and each Maker scores for the Owl.', tg: '#mktb' },
  { id: 'hearth', t: 'Hearth', s: 'Each Hearth card scores 1 point per 10 of your coins plus goods at their price.', why: 'Rich players love it.', tg: '#plb' },
  { id: 'eagle', t: 'Eagle', s: 'Each Eagle card scores 1 point per house outside brick cities.', why: 'Builders love it.', tg: '#plb' },
  { id: 'sickle', t: 'Sickle', s: 'Each Sickle card scores 1 point per region where you have a house.', why: 'Spread out to grow it.', tg: '#plb' },
  { id: 'wing', t: 'Wing', s: 'Each Wing card scores 2 points per kind of good your houses make.', why: 'Five kinds can give 10 per card.', tg: '#plb' },
  { id: 'shield', t: 'Shield', s: 'Each Shield card scores 2 points per cart and ship on the map.', why: 'Settlers grow it.', tg: '#plb' },
  { id: 'owl', t: 'Owl', s: 'Each Maker scores per house in its cities: brick, grain and tools 3, wine 4, cloth 5.', why: 'Pair a Maker with many houses of its good.', tg: '#plb' },
  { id: 'end', t: 'The end', s: 'Buying the last market card or building your 15th house takes the Laurel (7 points); the rival gets one last turn.', why: 'Watch the number on the market button.', tg: '#mktb' },
  { id: 'practice', t: 'Practice game', s: 'Finish this game against the easy rival.', why: 'You have seen every rule now.', ev: 'gameover' }];
var HUDLAB = [
  ['#race .strip:first-child', 'Rival', 'The rival’s score, houses, carts, ships and coins; tap it for more.'],
  ['#race .strip:last-child', 'You', 'Your score, houses, carts, ships and coins; tap it for more.'],
  ['#mktb', 'Market', 'Cards for sale; the number is how many are left before the end.'],
  ['#plb', 'Points', 'Live patron points for both players.'],
  ['#helpb', 'Help', 'Reopens this lesson window and this labelled map.'],
  ['#menub', 'Menu', 'Sound, hints, all rules, every card and a new game.'],
  ['.zoom', 'Zoom', 'Zoom the map; you can also pinch and drag it.'],
  ['#prompt', 'Prompt', 'Says what to do next.'],
  ['#map .city[data-c="caput"] .disc', 'Caput', 'The capital: carts and ships start here, and nobody builds here.'],
  ['city', 'City', 'The badge shows the good it makes; the two slots above show who built there.'],
  ['prov', 'Region marker', 'Shows the region’s bonus good, or coins once it has produced.'],
  ['land', 'Road', 'Brown dashes: carts move along roads.'],
  ['sea', 'Sea lane', 'White dots: ships sail along sea lanes.'],
  ['col', 'Your pieces', 'Carts and ships stop on lines between cities.'],
  ['#hand', 'Hand', 'Your cards: tap one, then play it.'],
  ['#acts', 'Confirm', 'The big check button confirms; the arrow undoes.'],
  ['#store', 'Storehouse', '12 spaces for goods and waiting pieces; coins on the right.']];

function tutEl() {
  var w = $('#tut');
  if (!w) {
    w = document.createElement('section'); w.id = 'tut'; w.className = 'tut'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-label', 'Lessons'); document.body.appendChild(w);
    var c = document.createElement('button'); c.id = 'tutchip'; c.type = 'button'; c.className = 'tutchip'; c.hidden = true; document.body.appendChild(c);
    c.onclick = function () { TUT.min = false; tutDraw(); };
    var r = document.createElement('div'); r.id = 'tutring'; r.setAttribute('aria-hidden', 'true'); document.body.appendChild(r);
    var cl = document.createElement('div'); cl.id = 'tutmap'; document.body.appendChild(cl);
    wireDrag(w);
  }
  return w;
}
function wireDrag(w) {
  var d = null;
  w.addEventListener('pointerdown', function (e) {
    if (!e.target.closest('.tut-h') || e.target.closest('button')) return;
    var r = w.getBoundingClientRect(); d = { id: e.pointerId, dx: e.clientX - r.left, dy: e.clientY - r.top }; try { w.setPointerCapture(e.pointerId); } catch (x) {}
  });
  w.addEventListener('pointermove', function (e) {
    if (!d || e.pointerId !== d.id) return;
    var x = Math.max(0, Math.min(innerWidth - w.offsetWidth, e.clientX - d.dx)), y = Math.max(0, Math.min(innerHeight - w.offsetHeight, e.clientY - d.dy));
    TUT.pos = { x: x, y: y }; w.style.left = x + 'px'; w.style.top = y + 'px';
  });
  var up = function () { d = null; }; w.addEventListener('pointerup', up); w.addEventListener('pointercancel', up);
}
function curLesson() { return LESSONS[TUT.i]; }
function nextUndone(from) { for (var k = from; k < LESSONS.length; k++) if (!TUT.done[LESSONS[k].id]) return k; return Math.min(from, LESSONS.length - 1); }
function tutOpen(i) { TUT.on = true; TUT.min = false; TUT.note = null; TUT.i = i == null ? nextUndone(0) : i; TUT.pos = null; tutDraw(); }
function tutClose() { TUT.on = false; tutDraw(); }
function tutNext() { var L0 = curLesson(); TUT.done[L0.id] = 1; TUT.note = null; TUT.pos = null; TUT.i = nextUndone(Math.min(LESSONS.length - 1, TUT.i + 1)); tutDraw(); }
function tutBack() { TUT.note = null; TUT.pos = null; TUT.i = Math.max(0, TUT.i - 1); tutDraw(); }
function tutEvent(e) {
  if (!TUT.on && !TUT.started) return;
  var hit = false;
  LESSONS.forEach(function (L0) { if (L0.ev && (L0.ev === e || (L0.ev === 'play' && e.indexOf('play') === 0)) && !TUT.done[L0.id]) { TUT.done[L0.id] = 1; hit = true; } });
  if (hit && TUT.done[curLesson().id]) { TUT.note = null; TUT.pos = null; TUT.i = nextUndone(TUT.i); }
  if (hit) tutDraw();
}
function tutDraw() {
  var w = tutEl(), chip = $('#tutchip'), ring = $('#tutring'), map = $('#tutmap');
  var show = TUT.on && G && $('#start').hidden;
  w.hidden = !show || TUT.min; chip.hidden = !show || !TUT.min; if (!show) { ring.style.display = 'none'; map.innerHTML = ''; return; }
  var L0 = curLesson(), nd = LESSONS.filter(function (x) { return TUT.done[x.id]; }).length;
  chip.innerHTML = '<span class="tn">' + (TUT.i + 1) + '/' + LESSONS.length + '</span> ' + esc(L0.t);
  chip.setAttribute('aria-label', 'Open lesson ' + (TUT.i + 1) + ': ' + L0.t);
  if (!TUT.min) {
    var list = LESSONS.map(function (x, k) { return '<li><button type="button" data-tl="' + k + '" class="' + (TUT.done[x.id] ? 'ok' : '') + (k === TUT.i ? ' cur' : '') + '">' + (TUT.done[x.id] ? '✓ ' : '') + esc(x.t) + '</button></li>'; }).join('');
    w.innerHTML = '<div class="tut-h"><span class="grip" aria-hidden="true">⠿</span><b>Lesson ' + (TUT.i + 1) + ' of ' + LESSONS.length + '</b>' +
      '<button type="button" class="tb" id="tutmin" aria-label="Minimise lessons">–</button><button type="button" class="tb" id="tutx" aria-label="Close lessons">✕</button></div>' +
      '<div class="tut-b"><h3>' + esc(L0.t) + '</h3><p class="s" id="tuts">' + esc(TUT.note ? TUT.note : L0.s) + '</p>' + (TUT.note ? '' : '<p class="why"><b>Why:</b> ' + esc(L0.why) + '</p>') + '</div>' +
      '<div class="tut-f"><button type="button" class="btn alt" id="tutback"' + (TUT.i ? '' : ' disabled') + '>Back</button>' +
      '<button type="button" class="btn alt" id="tutlist" aria-expanded="' + !!TUT.open + '">' + nd + '/' + LESSONS.length + ' ✓</button>' +
      '<button type="button" class="btn" id="tutnext">' + (TUT.i === LESSONS.length - 1 ? 'Done' : 'Next') + '</button></div>' +
      (TUT.open ? '<ol class="tut-l">' + list + '</ol>' : '');
    $('#tutmin').onclick = function () { TUT.min = true; tutDraw(); };
    $('#tutx').onclick = tutClose; $('#tutnext').onclick = tutNext; $('#tutback').onclick = tutBack;
    $('#tutlist').onclick = function () { TUT.open = !TUT.open; tutDraw(); };
    w.querySelectorAll('[data-tl]').forEach(function (b) { b.onclick = function () { TUT.i = +b.getAttribute('data-tl'); TUT.note = null; TUT.pos = null; tutDraw(); }; });
  }
  tutPlace(true);
}
// the lesson's own target: a hand card of the lesson's kind, else its selector
function tutTarget(L0) {
  if (L0.card && G) { var p = G.pl[0], k = p.hand.map(function (id) { return D.CARDS[id].act; }).indexOf(L0.card); var c = k >= 0 && document.querySelector('#hand .cd[data-i="' + k + '"]'); if (c) return c; }
  if (!L0.tg) return null;
  var els = document.querySelectorAll(L0.tg); for (var j = 0; j < els.length; j++) { var r = els[j].getBoundingClientRect(); if (r.width && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth) return els[j]; }
  return null;
}
function vis(r) { return r && r.width > 2 && r.height > 2 && r.right > 4 && r.left < innerWidth - 4 && r.bottom > 4 && r.top < innerHeight - 4; }
function clip(r) { return { left: Math.max(0, r.left), top: Math.max(0, r.top), right: Math.min(innerWidth, r.right), bottom: Math.min(innerHeight, r.bottom) }; }
function hudRects() { return ['#race', '.hud-r', '.zoom', '.ptop #prompt', '#hand', '#store', '#acts', '#undob'].map(function (s) { var e = $(s); return e && clip(e.getBoundingClientRect()); }).filter(function (r) { return r && r.right - r.left > 2 && r.bottom - r.top > 2; }); }
// place the window where it covers nothing it explains (and as little of the game as possible), unless the player dragged it
function placeWin(avoid) {
  var w = $('#tut'); if (w.hidden) return null;
  var ww = w.offsetWidth, wh = w.offsetHeight, vw = innerWidth, vh = innerHeight;
  if (TUT.pos) { var pr = { left: TUT.pos.x, top: TUT.pos.y, right: TUT.pos.x + ww, bottom: TUT.pos.y + wh }; if (!avoid.some(function (a) { return ovl(pr, a) > 0; })) { w.style.left = TUT.pos.x + 'px'; w.style.top = TUT.pos.y + 'px'; return pr; } }
  var hud = hudRects(), best = null, ys = [], xs = [8, (vw - ww) / 2, vw - ww - 8];
  for (var y = 60; y + wh < vh - 8; y += 24) ys.push(y);
  xs.forEach(function (x) { ys.forEach(function (y) {
    var r = { left: x, top: y, right: x + ww, bottom: y + wh }, pen = 0;
    avoid.forEach(function (a) { pen += ovl(r, a) * 50; }); hud.forEach(function (a) { pen += ovl(r, a) * 3; });
    pen += Math.abs(y - vh * 0.42) * 2;
    if (!best || pen < best.pen) best = { pen: pen, r: r };
  }); });
  if (!best) best = { r: { left: 8, top: 60, right: 8 + ww, bottom: 60 + wh } };
  w.style.left = best.r.left + 'px'; w.style.top = best.r.top + 'px'; return best.r;
}
// pick one on-screen map element of a kind that sits in the open map, away from the window and the HUD
function mapPick(kind, block) {
  var sel = { city: '#map .city:not([data-c="caput"]) .disc', prov: '#map .prov .mk', land: '#map .rt.land', sea: '#map .rt.sea', col: '#map .col' }[kind];
  var els = document.querySelectorAll(sel), best = null, cx = innerWidth / 2, cy = innerHeight * 0.45;
  for (var j = 0; j < els.length; j++) {
    var r = els[j].getBoundingClientRect(); if (!vis(r)) continue;
    if (kind === 'land' || kind === 'sea') { var L2 = els[j].getTotalLength(), pt = els[j].getPointAtLength(L2 / 2), sv = $('#map').getScreenCTM(); if (!sv) continue; var q = new DOMPoint(pt.x, pt.y).matrixTransform(sv); r = { left: q.x - 4, right: q.x + 4, top: q.y - 4, bottom: q.y + 4, width: 8, height: 8 }; if (!vis(r)) continue; }
    var rr = clip(r); if (block.some(function (b) { return ovl(rr, b) > 0; })) continue;
    var d = Math.hypot((rr.left + rr.right) / 2 - cx, (rr.top + rr.bottom) / 2 - cy);
    if (!best || d < best.d) best = { d: d, r: rr };
  }
  return best && best.r;
}
// the labelled map: greedy, non-overlapping callouts with leader lines
function drawCallouts(winR) {
  var map = $('#tutmap'), vw = innerWidth, vh = innerHeight, hud = hudRects(), items = [];
  var block = hud.concat(winR ? [winR] : []);
  HUDLAB.forEach(function (h) {
    var r = null;
    if (h[0].charAt(0) === '#' || h[0].charAt(0) === '.') { var e = document.querySelector(h[0]); if (e) { var b = e.getBoundingClientRect(); if (vis(b)) r = clip(b); } if (r && winR && ovl(r, winR) > (r.right - r.left) * (r.bottom - r.top) * 0.5) r = null; }
    else r = mapPick(h[0], h[0] === 'col' ? block : block.concat(items.map(function (x) { return x.r; })));
    if (r) items.push({ h: h, r: r });
  });
  var placed = [], obst = items.map(function (x) { return x.r; }).concat(winR ? [winR] : []);
  map.innerHTML = '';
  var ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg'); svg.setAttribute('class', 'tutlines'); svg.setAttribute('width', vw); svg.setAttribute('height', vh); map.appendChild(svg);
  items.forEach(function (it, n) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'callout'; b.textContent = it.h[1]; b.setAttribute('data-co', n); map.appendChild(b);
    var bw = b.offsetWidth, bh = b.offsetHeight, ax = (it.r.left + it.r.right) / 2, ay = (it.r.top + it.r.bottom) / 2, best = null;
    [0, 18, 36, 60, 90, 130, 180, 240].forEach(function (dist) {
      for (var a = 0; a < 16; a++) {
        var ang = a * Math.PI / 8, rx = (it.r.right - it.r.left) / 2 + bw / 2 + 6 + dist, ry = (it.r.bottom - it.r.top) / 2 + bh / 2 + 6 + dist;
        var cx = ax + Math.cos(ang) * rx, cy = ay + Math.sin(ang) * ry, r = { left: cx - bw / 2, top: cy - bh / 2, right: cx + bw / 2, bottom: cy + bh / 2 };
        if (r.left < 4 || r.top < 4 || r.right > vw - 4 || r.bottom > vh - 4) continue;
        if (placed.some(function (q) { return ovl(r, { left: q.left - 3, top: q.top - 3, right: q.right + 3, bottom: q.bottom + 3 }) > 0; })) continue;
        if (winR && ovl(r, winR) > 0) continue;
        var pen = dist * 3; obst.forEach(function (o) { pen += ovl(r, o) * 4; });
        if (!best || pen < best.pen) best = { pen: pen, r: r };
      }
      return best;
    });
    if (!best) { b.remove(); return; }
    placed.push(best.r); b.style.left = best.r.left + 'px'; b.style.top = best.r.top + 'px';
    var lx = Math.max(best.r.left, Math.min(best.r.right, ax)), ly = Math.max(best.r.top, Math.min(best.r.bottom, ay));
    var tx = Math.max(it.r.left, Math.min(it.r.right, lx)), ty = Math.max(it.r.top, Math.min(it.r.bottom, ly));
    if (Math.hypot(tx - lx, ty - ly) > 3) { var ln = document.createElementNS(ns, 'path'); ln.setAttribute('d', 'M' + lx + ' ' + ly + 'L' + tx + ' ' + ty); svg.appendChild(ln); var dt = document.createElementNS(ns, 'circle'); dt.setAttribute('cx', tx); dt.setAttribute('cy', ty); dt.setAttribute('r', 3.5); svg.appendChild(dt); }
    b.onclick = function () { TUT.note = it.h[1] + ': ' + it.h[2]; tutDraw(); };
  });
}
var tutKey = '';
function tutPlace(force) {
  if (!TUT.on || !G) return;
  var L0 = curLesson(), ring = $('#tutring'), map = $('#tutmap'), t = tutTarget(L0), tr = t && t.getBoundingClientRect();
  var key = [TUT.i, TUT.min, TUT.open, innerWidth, innerHeight, UI.view && UI.view.x.toFixed(0), UI.view && UI.view.y.toFixed(0), UI.view && UI.view.w.toFixed(0), !$('#sheet').hidden, tr && [tr.left, tr.top, tr.width].map(Math.round).join(','), G.pl[0].hand.length, UI.sel].join('|');
  if (!force && key === tutKey) return; tutKey = key;
  var avoid = vis(tr) ? [clip(tr)] : [], sh = $('#sheet'); if (sh && !sh.hidden) avoid.push(clip(sh.getBoundingClientRect()));   // never sit on an open sheet
  var winR = placeWin(avoid);
  if (vis(tr)) { var pad = 6; ring.style.display = 'block'; ring.style.left = (tr.left - pad) + 'px'; ring.style.top = (tr.top - pad) + 'px'; ring.style.width = (tr.width + pad * 2) + 'px'; ring.style.height = (tr.height + pad * 2) + 'px'; }
  else ring.style.display = 'none';
  if (L0.id === 'hud' && !TUT.min) drawCallouts(winR); else map.innerHTML = '';
}
(function tick() { if (TUT.on) tutPlace(false); setTimeout(tick, 200); })();
window.addEventListener('resize', function () { setTimeout(function () { tutPlace(true); }, 160); });

// hooks into the game (wrapped, so the core files stay as they are)
var _tutMove = move;
move = function (m) {
  var pi = G ? VT.sideToAct(G) : -1, card = m && m.t === 'play' && G && G.pl[pi] ? D.CARDS[G.pl[pi].hand[m.i]] : null;
  var r = _tutMove.apply(this, arguments);
  if (pi === 0 && UI.mode === 'vs' && m) {
    if (card) { tutEvent('play'); tutEvent('play:' + card.act); }
    var ev = { build: 'build', prov: 'prov', pcoins: 'pcoins', trade: 'trade', buy: 'buy', place: 'colo', ccoins: 'colo', copy: 'copy' }[m.t];
    if (ev) tutEvent(ev);
  }
  return r;
};
var _tutStart = startGame;
startGame = function (mode, o) {
  TUT.on = !!(o && o.learn);   // set first, so the old one-line tips stay quiet in a Learn game
  var r = _tutStart.apply(this, arguments);
  TUT.done = {}; TUT.started = !!(o && o.learn);
  if (o && o.learn) tutOpen(0); else tutClose();
  return r;
};
var _tutScore = showScoreNow; showScoreNow = function () { var r = _tutScore.apply(this, arguments); tutEvent('points'); return r; };
var _tutResult = showResult; showResult = function () { var r = _tutResult.apply(this, arguments); tutEvent('gameover'); tutDraw(); return r; };
var _tutTitle = showTitle; showTitle = function () { var r = _tutTitle.apply(this, arguments); tutDraw(); return r; };
var _tutTip = tip; tip = function () { if (TUT.on) return; return _tutTip.apply(this, arguments); };   // the window replaces the old one-line tips
var _tutRender = render; render = function () { var r = _tutRender.apply(this, arguments); if (TUT.on) setTimeout(function () { tutPlace(false); }, 0); return r; };
window.addEventListener('load', function () { var hb = $('#helpb'); if (hb) { hb.setAttribute('aria-label', 'Help: lessons and the labelled screen'); hb.onclick = function () { if (G) tutOpen(0); else showRules(); }; } });
VTUI.startGame = startGame; VTUI.move = move; VTUI.render = render; VTUI.TUT = TUT; VTUI.LESSONS = LESSONS; VTUI.tutNext = tutNext; VTUI.tutOpen = tutOpen;

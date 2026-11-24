// ===== part 9: Learn to play = Interface tour (labelled HUD map) + floating lessons on a real game; feel (floats, dings, fanfares) =====
// Owner rules (24 Nov): the tutorial is a small FLOATING window (drag, minimise to a chip, close). It never dims the screen and never
// blocks a tap: the player can tap anything at any time. A pulse ring marks the suggested target; a step ticks when it is done OR on Next.
var TW = { on: false, mode: '', min: false, cur: 0, done: {}, tapped: {}, base: null, pos: null, info: '', seen: {} };
// ---------- the HUD map: every element, one plain sentence each ----------
var HUD = [
  ['bmenu', 'Menu', 'Menu: new game, rules, all cards, sound, this guide. Close it with the X.'],
  ['blog', 'Log', 'Log: every move so far, yours and the rival’s. Close it with the X.'],
  ['tMile', 'Milestones', 'Milestones: reach a goal, pay 8 credits, get 5 points. Only 3 can be claimed per game.'],
  ['bProj', 'Projects', 'Standard projects: always available. Pay credits to raise a gauge or put a tile on the map.'],
  ['tAward', 'Awards', 'Awards: fund one for 8, 14, then 20 credits; whoever leads it at the end gets 5 points.'],
  ['sriv', 'Rival', 'The rival: its name, rating (big number) and points. Tap it to see its cards and resources.'],
  ['syou', 'You', 'You: your rating is the big number. Rating counts as points AND pays you credits every round.'],
  ['actL', 'Action 1 of 2', 'Each turn you take 1 or 2 actions. This shows which one you are on.'],
  ['bPass', 'Pass / Done', 'After 1 action it says Done: end your turn. Pass: you are out until the next round.'],
  ['gen', 'Generation', 'Generation = the round number. Every round ends with income for both players.'],
  ['gTemp', 'Temperature', 'Temperature: raise it to 8°C. Every step you raise gives you +1 rating. Tap the gauges to zoom them.'],
  ['gTempDot', 'Bonus dots', 'Bonus dots: the player who lands a gauge on a dot gets a bonus (heat production, a free ocean, a free step).'],
  ['gOxy', 'Oxygen', 'Oxygen: raise it to 14%. Greenery tiles raise it; each step is +1 rating.'],
  ['gOcean', 'Oceans', 'Oceans: place all 9. Each ocean is +1 rating and pays 2 credits to tiles next to it.'],
  ['zoom', 'Zoom + − fit', 'Zoom: + and − zoom the map, the square button fits it back. Pinch works too.'],
  ['board', 'Map', 'The map: drag to pan. Tap a hex to see its bonus. Glowing hexes are where your tile may go.'],
  ['corpB', 'Your company', 'Your company: its start money and special power. Tap it to read it.'],
  ['res', 'Resources', 'Six resources. Big number = stock you have now. Small +N = production you get every round. Tap plants or heat to use them.'],
  ['bCards', 'Hand', 'Your hand: the number is how many cards you hold. Tap to open it, tap a card to read it and play it.'],
  ['cPlayed', 'Played', 'Cards played: tap to see every card you have played.'],
  ['cTags', 'Tags', 'Tags: the symbols on your played cards. Some cards and awards count them.'],
  ['cVP', 'VP', 'VP: your points right now (rating + tiles + cards + milestones + awards).'],
  ['bAct', 'Actions', 'Actions: blue cards with an action you can use once per round, free. The number says how many are ready.'],
  ['cEff', 'Effects', 'Effects: lasting powers from your cards (discounts, bonuses). Tap to list them.'],
  ['hintbtn', 'Hint bulb', 'The bulb suggests a good move with a reason. Use it any time on your turn.'],
  ['bHelp', '? Guide', 'The ? button reopens this tour and the lessons whenever you want.']
];
function hudEl(id) {
  if (id === 'board') return $('board');
  if (id === 'gTempDot') return $('gTemp');
  return $(id);
}
function hudAnchor(id, r) {   // where the leader line ends
  if (id === 'gTempDot') return [r.right - 6, r.top + r.height * 0.42];
  if (id === 'board') { var b = $('bw').getBoundingClientRect(); return [b.left + b.width * 0.5, b.top + b.height * 0.55]; }
  return [r.left + r.width / 2, r.top + r.height / 2];
}
function rectHit(a, b, pad) { pad = pad || 0; return a.l < b.r + pad && a.r > b.l - pad && a.t < b.b + pad && a.b > b.t - pad; }
// greedy label layout: nearest free spot to the element, never on another label, inside the screen; prefer not to cover any HUD element
function hudLayout() {
  var W = innerWidth, H = innerHeight, small = W < 700, items = [], placed = [], tgts = [];
  HUD.forEach(function (h) { var e = hudEl(h[0]); if (!e) return; var r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return; items.push({ h: h, r: r, a: hudAnchor(h[0], r) }); if (h[0] !== 'board' && h[0] !== 'gTempDot') tgts.push({ l: r.left, r: r.right, t: r.top, b: r.bottom }); });
  var tw = $('tw'); if (tw.classList.contains('on')) { var q = tw.getBoundingClientRect(); placed.push({ l: q.left, r: q.right, t: q.top, b: q.bottom }); }
  var probe = document.createElement('button'); probe.className = 'hgl'; probe.style.visibility = 'hidden'; $('hg').appendChild(probe);
  items.forEach(function (it) {
    probe.textContent = it.h[1]; var w = probe.offsetWidth, h = probe.offsetHeight, best = null, bd = 1e9, bestSoft = null, bds = 1e9;
    var cx = it.a[0], cy = it.a[1];
    for (var dy = -H; dy <= H; dy += 14) for (var dx = -W; dx <= W; dx += 14) {
      var l = cx + dx - w / 2, t = cy + dy - h / 2;
      if (l < 4 || t < 4 || l + w > W - 4 || t + h > H - 4) continue;
      var R = { l: l, r: l + w, t: t, b: t + h }, d = dx * dx + dy * dy * 1.3;
      if (d >= bds && d >= bd) continue;
      if (placed.some(function (p) { return rectHit(R, p, 3); })) continue;
      if (d < bds) { bds = d; bestSoft = R; }
      if (d < bd && !tgts.some(function (g) { return rectHit(R, g, 1); })) { bd = d; best = R; }
    }
    var R = best && bd < bds * 6 + 9000 ? best : bestSoft; if (!R) return;
    placed.push(R); it.box = R;
  });
  probe.remove();
  return items.filter(function (it) { return it.box; });
}
function hudShow() {
  var hg = $('hg'); hg.innerHTML = ''; hg.classList.add('on'); document.body.classList.add('hgon');
  var items = hudLayout(), W = innerWidth, H = innerHeight;
  var svg = '<svg class="hgs" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">';
  items.forEach(function (it) {
    var b = it.box, x = Math.max(b.l, Math.min(b.r, it.a[0])), y = Math.max(b.t, Math.min(b.b, it.a[1]));
    svg += '<line x1="' + x.toFixed(1) + '" y1="' + y.toFixed(1) + '" x2="' + it.a[0].toFixed(1) + '" y2="' + it.a[1].toFixed(1) + '"/><circle cx="' + it.a[0].toFixed(1) + '" cy="' + it.a[1].toFixed(1) + '" r="3.5"/>';
  });
  hg.insertAdjacentHTML('beforeend', svg + '</svg>');
  items.forEach(function (it) {
    var bt = document.createElement('button'); bt.className = 'hgl' + (TW.seen[it.h[0]] ? ' seen' : ''); bt.textContent = it.h[1]; bt.setAttribute('data-hud', it.h[0]);
    bt.style.left = it.box.l + 'px'; bt.style.top = it.box.t + 'px';
    bt.addEventListener('click', function (ev) { ev.stopPropagation(); TW.seen[it.h[0]] = 1; bt.classList.add('seen'); TW.info = it.h[0]; twRender(); twRingAt(hudEl(it.h[0])); sfx('tick'); });
    hg.appendChild(bt);
  });
}
function hudHide() { $('hg').classList.remove('on'); $('hg').innerHTML = ''; document.body.classList.remove('hgon'); }
// ---------- lessons: suggestions on the real board, any order ----------
function myTiles() { var n = 0; for (var s in G.tiles) if (G.tiles[s] && G.tiles[s].p === 0) n++; return n; }
function rivMoves() { return G.log.filter(function (l) { return l.p === 1; }).length; }
var LESSONS = [
  { k: 'goal', t: 'Goal: raise temperature, oxygen and oceans (the gauges). Your score = rating + points. The rival wants the same.', w: 'Why: every step you raise is +1 rating for you, and rating is both points and income.', tgt: function () { return $('glob'); }, tap: 'glob' },
  { k: 'stock', t: 'Look at your resources: the big number is your stock, the small +N is production.', w: 'Why: production pays you every round, so a little production early adds up.', tgt: function () { return $('res'); }, tap: 'res' },
  { k: 'inspect', t: 'Open your hand and tap a card. Cost is top left, tags top right, a requirement under the name, the effect below.', w: 'Why: a card can be played only if you can pay it and meet its requirement.', tgt: function () { return $('modal').classList.contains('on') ? null : $('sheet').classList.contains('on') && UI.sheet === 'cards' ? document.querySelector('#shB [data-card]') : $('bCards'); }, done: function () { return !!$('mPlay'); } },
  { k: 'play', t: 'Play a card you can afford, then watch your production numbers change.', w: 'Why: production cards pay back every round for the rest of the game.', tgt: function () { return $('mPlay') && !$('mPlay').disabled ? $('mPlay') : $('sheet').classList.contains('on') ? document.querySelector('#shB [data-card]') : $('bCards'); }, done: function () { return G.pl[0].played.length > TW.base.played; } },
  { k: 'std', t: 'Open Projects and buy a standard project. A tile one asks you to tap a glowing hex, then Place here.', w: 'Why: tiles score points and the icons on the hex pay you a bonus.', tgt: function () { return G.pending && G.pending.h === 'place' ? ($('confirm').offsetParent && UI.sel ? $('confirmb') : document.querySelector('#hexes .hex.tgt')) : $('sheet').classList.contains('on') && UI.sheet === 'proj' ? document.querySelector('#shB [data-std]:not([disabled])') : $('bProj'); }, done: function () { return myTiles() > TW.base.tiles || TW.base.std; } },
  { k: 'pass', t: 'You get 1 or 2 actions per turn. Then tap Done (after 1 action) or Pass (out for this round).', w: 'Why: the rival then moves; passing early saves credits but gives up the round.', tgt: function () { return $('bPass'); }, done: function () { return TW.base.ended; } },
  { k: 'rival', t: 'The rival’s turn: its tile flashes on the map and a line says what it did. Nothing to tap.', w: 'Why: watch what it races for: the same gauges, milestones and awards.', tgt: function () { return $('sriv'); }, done: function () { return rivMoves() > TW.base.riv; } },
  { k: 'income', t: 'When both players pass, the round ends: credits = credit production + rating; other resources grow by production.', w: 'Why: energy turns into heat, so production you build now pays every round.', tgt: function () { return $('res'); }, done: function () { return G.gen > TW.base.gen; } },
  { k: 'goals', t: 'Open Milestones or Awards. Milestone: 8 credits = 5 points. Award: fund it, lead it at the end, get 5.', w: 'Why: only 3 of each exist, and the rival can grab them first.', tgt: function () { return $('tMile'); }, done: function () { return UI.sheet === 'proj' && (UI.tab === 'mile' || UI.tab === 'award'); } },
  { k: 'end', t: 'The game ends after the round where all three gauges are full. Most points wins.', w: 'Why: points = rating + greenery + cities + cards + milestones + awards; plan for all of them.', tgt: function () { return $('cVP'); }, tap: 'cVP' }
];
function lessonDone(L) {   // once done, stays done (latched)
  if (TW.done[L.k]) return true;
  var d = L.done ? (function () { try { return !!L.done(); } catch (e) { return false; } })() : !!TW.tapped[L.tap];
  if (d) TW.done[L.k] = 1; return d;
}
var twDoMove0 = doMove;
doMove = function (m) { var r = twDoMove0(m); if (r && TW.base && m) { if (m.t === 'std') TW.base.std = true; if (m.t === 'end' || m.t === 'pass') TW.base.ended = true; } return r; };
// ---------- start / stop ----------
function learnStart() {   // Learn to play: a real easy game, beginner company, then the tour, then lessons
  try { startGame({ level: 'easy', seed: 20261124 }); } catch (e) { }
  if (G && G.phase === 'setup' && OH.sideToAct() === 0) {
    var off = G.pl[0].offer.corps, c = off.filter(function (x) { return OH.CORPS && OH.CORPS[x] && OH.CORPS[x].beginner; })[0] || off[0];
    UI.setup = null; closeModal(); doMove({ t: 'setup', corp: c, buy: [] });
  }
  TW.done = {}; TW.tapped = {}; TW.cur = 0; TW.info = ''; TW.base = null;
  twOpen('tour');
}
function twOpen(mode) { TW.y = null; TW.x = null; TW.on = true; TW.mode = mode; TW.min = false; TW.info = ''; TW.dragged = false; hudHide(); if (mode === 'lessons' && !TW.base) twBase(); twRender(); if (mode === 'tour') { hudShow(); twRender(); } }
function twBase() { TW.base = { played: G.pl[0].played.length, tiles: myTiles(), riv: rivMoves(), gen: G.gen, std: false, ended: false }; }
function twClose() { TW.on = false; hudHide(); $('tw').classList.remove('on'); $('twChip').classList.remove('on'); $('twRing').classList.remove('on'); }
function twMin(m) { TW.min = m; twRender(); }
// ---------- the floating window ----------
function twRender() {
  var w = $('tw'); if (!TW.on) return twClose();
  $('twChip').classList.toggle('on', TW.min); w.classList.toggle('on', !TW.min); w.classList.toggle('tour', TW.mode === 'tour');
  if (TW.min) { $('twRing').classList.remove('on'); return; }
  var h = '<div class="twh" id="twH"><b>' + (TW.mode === 'tour' ? 'Interface tour' : 'Lessons') + '</b><span class="twg">drag</span><button id="twMin" aria-label="Minimise guide">–</button><button id="twX" aria-label="Close guide">×</button></div><div class="twb">';
  if (TW.mode === 'tour') {
    var hit = HUD.filter(function (x) { return x[0] === TW.info; })[0], n = Object.keys(TW.seen).length;
    h += hit ? '<p class="twt"><b>' + esc(hit[1]) + '.</b> ' + esc(hit[2].replace(/^[^:]*: /, '')) + '</p>' : '<p class="twt">This is the real screen. Tap any label to learn what it does. You can tap the game too.</p>';
    h += '<p class="tww">Seen ' + n + ' of ' + HUD.length + '. Panels open with a tap and close with their X or Close.</p>';
    h += '<div class="twn"><button class="btn alt" id="twHide">' + ($('hg').classList.contains('on') ? 'Hide labels' : 'Show labels') + '</button><button class="btn" id="twNext">Lessons ›</button></div>';
  } else if (TW.mode === 'lessons') {
    var all = LESSONS.every(lessonDone), L = LESSONS[TW.cur];
    if (all) h += '<p class="twt"><b>You know the game.</b> Keep playing this one, or try a practice puzzle.</p><div class="twn"><button class="btn alt" id="twPuz">Practice puzzles</button><button class="btn" id="twEnd">Keep playing</button></div>';
    else h += '<p class="twt">' + esc(L.t) + '</p><p class="tww">' + esc(L.w) + '</p><div class="twn"><button class="btn alt" id="twTour">Tour</button><button class="btn" id="twNext">Next ›</button></div>';
    h += '<ol class="twl">' + LESSONS.map(function (x, i) { return '<li class="' + (lessonDone(x) ? 'ok' : '') + (i === TW.cur && !all ? ' cur' : '') + '"><button data-twl="' + i + '">' + esc(x.k === 'goal' ? 'Goal' : x.k === 'stock' ? 'Stock vs production' : x.k === 'inspect' ? 'Read a card' : x.k === 'play' ? 'Play a card' : x.k === 'std' ? 'Project + tile' : x.k === 'pass' ? 'Done / Pass' : x.k === 'rival' ? 'Rival’s turn' : x.k === 'income' ? 'Income' : x.k === 'goals' ? 'Milestones, awards' : 'Game end') + '</button></li>'; }).join('') + '</ol>';
  }
  w.innerHTML = h + '</div>';
  var on = function (id, f) { var e = $(id); if (e) e.addEventListener('click', function (ev) { ev.stopPropagation(); f(); }); };
  on('twX', twClose); on('twMin', function () { twMin(true); });
  on('twHide', function () { if ($('hg').classList.contains('on')) hudHide(); else hudShow(); twRender(); });
  on('twNext', function () { if (TW.mode === 'tour') { twOpen('lessons'); return; } TW.done[LESSONS[TW.cur].k] = 1; twAdvance(); });
  on('twTour', function () { twOpen('tour'); });
  on('twPuz', function () { twClose(); chStart(0); });
  on('twEnd', twClose);
  w.querySelectorAll('[data-twl]').forEach(function (b) { b.addEventListener('click', function (ev) { ev.stopPropagation(); TW.cur = +b.getAttribute('data-twl'); twRender(); }); });
  twDrag(); twPlace(); twTick();
}
function twAdvance() { var i, n = LESSONS.length; for (i = 1; i <= n; i++) { var j = (TW.cur + i) % n; if (!lessonDone(LESSONS[j])) { TW.cur = j; break; } } twRender(); }
function twDrag() {
  var hd = $('twH'), w = $('tw'); if (!hd) return;
  hd.onpointerdown = function (e) {
    if (e.target.closest('button')) return;
    var r = w.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top; try { hd.setPointerCapture(e.pointerId); } catch (x) { }
    hd.onpointermove = function (m) { TW.pos = [Math.max(0, Math.min(innerWidth - r.width, m.clientX - ox)), Math.max(0, Math.min(innerHeight - 40, m.clientY - oy))]; TW.dragged = true; twPlace(); };
    hd.onpointerup = hd.onpointercancel = function () { hd.onpointermove = null; };
  };
}
// default spot: over the map, top or bottom half, whichever does not cover the suggested target (unless the player dragged it)
function twPlace() {
  var w = $('tw'); if (!w.classList.contains('on')) return;
  var W = innerWidth, H = innerHeight, bw = $('bw').getBoundingClientRect(), small = W < 700;
  var ww = small ? Math.min(360, Math.max(280, bw.width - 12)) : 360, x = small ? Math.max(6, Math.round(bw.left + 6)) : Math.round(bw.left + (bw.width - ww) / 2);
  w.style.width = ww + 'px';
  if (TW.pos && TW.dragged) { w.style.left = TW.pos[0] + 'px'; w.style.top = TW.pos[1] + 'px'; return; }
  w.style.left = x + 'px';
  if (TW.mode === 'tour') { w.style.top = (small ? Math.max(60, Math.round(H * 0.34)) : Math.round(bw.top + bw.height * 0.3)) + 'px'; return; }
  var wh = w.offsetHeight, tg = twTarget(), av = [], box = function (e, k) { if (!e || !e.getBoundingClientRect) return; var r = e.getBoundingClientRect(); if (r.width > 1 && r.height > 1) av.push({ l: r.left - 6, r: r.right + 6, t: r.top - 6, b: r.bottom + 6, k: k }); };
  box(tg, 100);
  if ($('modal').classList.contains('on')) { $('mb').querySelectorAll('button').forEach(function (e) { box(e, e.classList.contains('btn') || /^m[A-Z]/.test(e.id) ? 40 : 3); }); box($('mb'), 1); }
  if ($('sheet').classList.contains('on')) box($('shX'), 20);
  if ($('confirm').offsetParent) box($('confirmb'), 20);
  if ($('gsum').classList.contains('on')) box($('gsum'), 5);
  var xs = small ? [x] : [x, Math.round(bw.left + 6), Math.round(bw.right - ww - 6)], cx = TW.x != null && xs.indexOf(TW.x) >= 0 ? TW.x : x;
  var cost = function (y, x) { var c = 0; av.forEach(function (q) { var ox = Math.min(x + ww, q.r) - Math.max(x, q.l), oy = Math.min(y + wh, q.b) - Math.max(y, q.t); if (ox > 0 && oy > 0) c += q.k * (q.k > 1 ? 1000 : ox * oy / 1000); }); return c; };
  var pref = small ? Math.max(bw.top + 170, 60) : bw.top + 110, cur = TW.y != null ? TW.y : pref, best = cur, bx = cx, bc = cost(cur, cx);
  if (bc > 0) xs.forEach(function (xx) { for (var y = 8; y <= H - wh - 8; y += 8) { var c = cost(y, xx); if (c < bc || (c === bc && Math.abs(y - pref) < Math.abs(best - pref))) { bc = c; best = y; bx = xx; } } });
  TW.y = Math.max(8, Math.min(H - wh - 8, best)); TW.x = bx; w.style.left = bx + 'px'; w.style.top = TW.y + 'px';
}
function twTarget() {
  if (!TW.on || TW.min) return null;
  if (TW.mode === 'tour') return TW.info ? hudEl(TW.info) : null;
  if (LESSONS.every(lessonDone)) return null;
  try { return LESSONS[TW.cur].tgt(); } catch (e) { return null; }
}
function twRingAt(el) {
  var rg = $('twRing'); if (!el || !el.getBoundingClientRect) { rg.classList.remove('on'); return; }
  var r = el.getBoundingClientRect(); if (r.width < 2 || r.bottom < 0 || r.top > innerHeight) { rg.classList.remove('on'); return; }
  rg.style.left = (r.left - 5) + 'px'; rg.style.top = (r.top - 5) + 'px'; rg.style.width = (r.width + 10) + 'px'; rg.style.height = (r.height + 10) + 'px'; rg.classList.add('on');
}
function twTick() {
  if (!TW.on) return;
  $('hg').classList.toggle('pause', $('sheet').classList.contains('on') || $('modal').classList.contains('on'));   // labels describe the main screen: step aside while a panel is open
  if (TW.mode === 'lessons' && G) {
    if (!TW.base) twBase();
    var was = $('tw').querySelectorAll('.twl li.ok').length, now = LESSONS.filter(lessonDone).length;
    if (now !== was && !TW.min) { if (lessonDone(LESSONS[TW.cur])) { sfx('ding'); twAdvance(); return; } twRender(); return; }
  }
  twRingAt(twTarget()); twPlace();
}
// never blocks: a capture listener only RECORDS which suggested thing was tapped; the tap itself goes through untouched
document.addEventListener('pointerdown', function (e) {
  if (!TW.on || !e.target.closest) return;
  ['glob', 'res', 'cVP'].forEach(function (id) { var el = $(id); if (el && el.contains(e.target)) TW.tapped[id] = 1; });
}, true);
setInterval(function () { try { twTick(); } catch (e) { } }, 250);
try { var twMO = new MutationObserver(function () { try { if (TW.on) { twRingAt(twTarget()); twPlace(); } } catch (e) { } }); twMO.observe($('modal'), { attributes: true, attributeFilter: ['class'], childList: true, subtree: true }); twMO.observe($('sheet'), { attributes: true, attributeFilter: ['class'] }); } catch (e) { }
window.addEventListener('resize', function () { if (TW.on && $('hg').classList.contains('on')) hudShow(); });
// ---------- feel: resource floats, bonus dings, rival highlight, round summary, fanfares, faster rival ----------
UI.AIDELAY = Q.get('fast') ? 60 : 420;
var FEEL = { snap: null };
function feelSnap() { var P = G.pl[0], o = {}; OH.RES.forEach(function (r) { o[r] = P[r]; o['p' + r] = P.prod[r]; }); o.gen = G.gen; return o; }
function feelDiff() {
  if (!G || G.phase === 'setup') { FEEL.snap = G ? feelSnap() : null; return; }
  var s = feelSnap(), o = FEEL.snap; FEEL.snap = s; if (!o || UI.charter) return;
  OH.RES.forEach(function (r, i) {
    var c = document.querySelector('#res .rc[data-r="' + r + '"]'); if (!c) return; var b = c.getBoundingClientRect();
    var d = s[r] - o[r], dp = s['p' + r] - o['p' + r];
    if (d) setTimeout(function () { floatAt(b.left + b.width / 2, b.top - 6, (d > 0 ? '+' : '') + d, d > 0 ? null : '#ff8a7a'); }, i * 60);
    if (dp) setTimeout(function () { floatAt(b.left + b.width / 2, b.top - 30, (dp > 0 ? '+' : '') + dp + ' prod', dp > 0 ? '#9be7c4' : '#ff8a7a'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }, 200 + i * 60);
  });
}
var feelRender0 = render;
render = function () { feelRender0(); try { feelDiff(); } catch (e) { } };
var feelSfx0 = sfx;
sfx = function (k) {
  if (!UI.sound || (k !== 'ding' && k !== 'fan')) return feelSfx0(k);
  try {
    if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
    var notes = k === 'ding' ? [988, 1319] : [523, 659, 784, 1047];
    notes.forEach(function (f, i) { var t = AC.currentTime + i * 0.09, o = AC.createOscillator(), g = AC.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(0.16, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + 0.37); });
  } catch (e) { }
};
function feelBanner(html, cls) {
  var d = document.createElement('div'); d.className = 'fbn ' + (cls || ''); d.innerHTML = html; document.body.appendChild(d);
  setTimeout(function () { d.remove(); }, 2200);
}
function genSummary(o) {   // closable, never blocks, hides itself
  var P = G.pl[0], el = $('gsum');
  var parts = OH.RES.map(function (r) { var d = P[r] - o[r]; return d ? '<span><b>' + (d > 0 ? '+' : '') + d + '</b> ' + A.RES[r].name + '</span>' : ''; }).join('');
  el.innerHTML = '<button id="gsX" aria-label="Close summary">×</button><b>Round ' + (G.gen - 1) + ' income</b><div>' + (parts || 'Nothing this time.') + '</div><small>Credits = credit production ' + P.prod.mc + ' + rating ' + P.tr + '</small>';
  el.classList.add('on'); clearTimeout(FEEL.gsT); FEEL.gsT = setTimeout(function () { el.classList.remove('on'); }, 6000);
  $('gsX').onclick = function () { el.classList.remove('on'); };
}
var feelPlay0 = playEvents;
playEvents = function () {
  if (!G) return 0;
  var seen = UI.evSeen, evs = G.ev, pre = FEEL.snap, t0 = null, x0 = null;
  for (var i = seen; i < evs.length; i++) { var e = evs[i];
    if (e.k === 'temp' && (e.v === -24 || e.v === -20 || e.v === 0)) t0 = 'gTemp';
    if (e.k === 'oxy' && e.v === 8) t0 = 'gOxy';
    if (e.k === 'production') x0 = 1;
    if ((e.k === 'mile' || e.k === 'award') && !UI.charter) (function (e) { var nm = e.k === 'mile' ? M.MILESTONES.filter(function (q) { return q.k === e.m; })[0] : M.AWARDS.filter(function (q) { return q.k === e.a; })[0];
      setTimeout(function () { sfx('fan'); vib(30); feelBanner('<b>' + (e.p === 0 ? 'You' : 'Rival') + (e.k === 'mile' ? ' claimed ' : ' funded ') + esc(nm ? nm.name : '') + '</b>' + (e.k === 'mile' ? '+5 points' : '5 points to the leader at the end'), e.p === 0 ? 'me' : 'riv'); }, 120); })(e);
    if (e.k === 'tile' && e.p === 1) (function (s) { setTimeout(function () { var g = document.querySelector('.hex[data-s="' + s + '"]'); if (g) { g.classList.add('rvmv'); setTimeout(function () { g.classList.remove('rvmv'); }, 1800); } }, 60); })(e.s);
  }
  var d = feelPlay0();
  if (t0) setTimeout(function () { var g = $(t0); g.classList.remove('bonus'); void g.offsetWidth; g.classList.add('bonus'); sfx('ding'); feelBanner('<b>Bonus step!</b>' + (t0 === 'gTemp' ? 'Landing on a white dot pays extra' : 'Oxygen 8%: a free temperature step'), 'bon'); }, 300);
  if (x0 && pre && !UI.charter && G.phase !== 'final') genSummary(pre);
  return d;
};
// dismissable "what to do now" line: tap it to hide it until your next turn
$('hint').addEventListener('click', function () { UI.hintOff = G ? G.gen + ':' + G.turn + ':' + G.acts : 1; $('hint').style.display = 'none'; });
var feelHint0 = setHint;
setHint = function (t) { feelHint0(t); if (UI.hintOff && G && UI.hintOff === G.gen + ':' + G.turn + ':' + G.acts && !(UI.tryTxt && Date.now() < UI.tryUntil)) $('hint').style.display = 'none'; else UI.hintOff = null; };
// ---------- wiring: ? button, the window shell, menu ----------
(function () {
  var w = document.createElement('div'); w.id = 'tw'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-label', 'Guide'); document.body.appendChild(w);
  var c = document.createElement('button'); c.id = 'twChip'; c.textContent = 'Guide'; c.setAttribute('aria-label', 'Open the guide'); c.addEventListener('click', function () { twMin(false); }); document.body.appendChild(c);
  var rg = document.createElement('div'); rg.id = 'twRing'; document.body.appendChild(rg);
  var hg = document.createElement('div'); hg.id = 'hg'; document.body.appendChild(hg);
  var gs = document.createElement('div'); gs.id = 'gsum'; gs.setAttribute('role', 'status'); document.body.appendChild(gs);
  var hb = document.createElement('button'); hb.id = 'bHelp'; hb.textContent = '?'; hb.setAttribute('aria-label', 'Interface tour and lessons'); $('bw').appendChild(hb);
  hb.addEventListener('click', function () { if (TW.on && TW.mode === 'tour' && !TW.min) { twClose(); return; } if (!G || G.phase === 'setup') { learnStart(); return; } twOpen('tour'); });
})();

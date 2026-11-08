// ===================== turnui.js: what to do now + how you score (phone first) =====================
// Turn tracker (round x of y, action tokens, why the round ends), the 4 big action buttons with what you'd get right now,
// one short plain power sentence per bird, value previews + "Best" badges, the score breakdown (you vs rival, leader marked)
// and a one-line good / okay / poor rating after each of your turns. Values come from ONE estimate (actVal) so badges,
// previews and ratings always agree.
var FOODW = { seed: 'seed', fish: 'fish', berry: 'berry', grub: 'grub', rodent: 'rodent', any: 'any food' };
var NESTW = { cup: 'cup', bowl: 'bowl', cavity: 'hole', ground: 'ground', platform: 'platform', star: 'any', wild: 'any' };
// the power as one short sentence: "When played: draw 1 card."
function shortPower(id) {
  var pw = PP.power(id), k = pw.k, x = pw.x || [];
  if (!k) return { col: 'none', when: '', txt: 'No power. Just points.' };
  var f = FOODW[x[0]] || x[0], hab = function (c) { return PP.HABS['FGW'.indexOf(c)] || 'row'; };
  var T = {
    gainF: 'take 1 ' + f + ' from the feeder.', gainS: 'gain 1 ' + f + '.', cacheS: 'store 1 ' + f + ' here (1 point).',
    cacheF: 'store 1 ' + f + ' from the feeder here (1 point).', tuckDraw: 'tuck a card here, then draw 1.', tuckEgg: 'tuck a card here, then lay 1 egg.',
    tuckFood: 'tuck a card here, then gain 1 ' + f + '.', flock: 'tuck the top deck card here (1 point).', laySelf: 'lay 1 egg on this bird.',
    layNest: 'lay 1 egg on each ' + (NESTW[x[0]] || x[0]) + '-nest bird.', draw1: 'draw 1 card.', hunt: 'maybe tuck the top deck card (1 point).',
    huntDie: 'roll for ' + f + ', maybe store 1 here.', allFood: 'everyone gains 1 ' + f + '.', allDraw: 'everyone draws 1 card.', trade: 'pay 1 egg to draw 2 cards.',
    wDraw: 'draw ' + x[0] + ' card' + (x[0] > 1 ? 's' : '') + '.', wFood: 'gain ' + x[1] + ' ' + (FOODW[x[0]] || x[0]) + '.', wLaySelf: 'lay ' + x[0] + ' eggs here.',
    wLayNest: 'lay 1 egg on each ' + (NESTW[x[0]] || x[0]) + '-nest bird.', wBonus: 'pick 1 of 2 bonus cards.', wFeeder: 'take every ' + f + ' in the feeder.',
    wPlay: 'play another bird in your ' + hab(x[0]) + '.', pEgg: 'when a rival lays eggs, lay 1 here.', pFood: 'when a rival gains food, gain 1 ' + f + '.',
    pTuck: 'when a rival plays in their ' + hab(x[0]) + ', tuck 1 card here.'
  };
  var when = pw.col === 'white' ? 'When played' : pw.col === 'pink' ? "On a rival's turn" : 'When its row is used';
  return { col: pw.col, when: when, txt: T[k] || pw.txt };
}
var HABW = { F: 'Forest', G: 'Meadow', W: 'Wetland' };
// ---------------- the value estimate (points now, plus a little for what an action sets up)
function eggRoom(p) { return PP.birds(p).reduce(function (a, x) { return a + Math.max(0, x.b.e - x.s.eggs); }, 0); }
function bestPlay(G, s) {
  var p = G.pl[s], best = null;
  PP.playable(G, s).forEach(function (x) { var v = B[p.hand[x.i]].p - ((x.inf && x.inf.eggs) || 0); if (!best || v > best.v) best = { i: x.i, v: v, id: p.hand[x.i], pts: B[p.hand[x.i]].p }; });
  return best;
}
function actInfo(G, s) {
  var p = G.pl[s], out = {};
  var yf = PP.rowYield(p, 0), ye = PP.rowYield(p, 1), yd = PP.rowYield(p, 2);
  var room = eggRoom(p), lay = Math.min(ye.n, room), bp = bestPlay(G, s), nPl = PP.playable(G, s).reduce(function (a, x) { a[x.i] = 1; return a; }, {}); nPl = Object.keys(nPl).length;
  var stuck = p.hand.length - nPl;   // birds you hold but cannot afford yet
  out.food = { h: 0, ok: true, v: Math.min(yf.n, 3) * (stuck > 0 ? .9 : .35), what: 'take ' + yf.n + ' from the feeder', gain: '+' + yf.n + ' food' };
  out.eggs = { h: 1, ok: lay > 0, v: lay, plain: '+' + lay + (lay === 1 ? ' egg' : ' eggs') + ' on your birds', what: '+' + lay + (lay === 1 ? ' egg' : ' eggs') + ' = +' + lay + ' pts', gain: '+' + lay + ' pts', why: room ? '' : 'No bird has room for an egg' };
  if (lay > 0 && lay < ye.n) out.eggs.what = '+' + lay + ' eggs (nests full) = +' + lay + ' pts';
  var cardsCan = G.deck.length + G.tray.filter(Boolean).length > 0;
  out.cards = { h: 2, ok: cardsCan, v: yd.n * (p.hand.length <= 2 ? .8 : p.hand.length >= 6 ? .1 : .4), what: '+' + yd.n + (yd.n === 1 ? ' card' : ' cards'), gain: '+' + yd.n + ' cards', why: cardsCan ? '' : 'No cards left' };
  out.play = { h: -1, ok: nPl > 0, plain: 'pick from ' + nPl + ' you can pay for', v: bp ? bp.v + (p.cubes > 1 ? 1 : 0) : 0, what: bp ? 'pick from ' + nPl + ', up to +' + bp.pts + (bp.pts === 1 ? ' pt' : ' pts') : '', gain: bp ? '+' + bp.pts + ' pts' : '',
    why: p.hand.length ? 'Not enough food or eggs yet. Get food first.' : 'No birds in hand. Draw birds first.' };
  var best = null; Object.keys(out).forEach(function (k) { if (out[k].ok && (!best || out[k].v > out[best].v)) best = k; });
  out.best = best;
  return out;
}
// ---------------- the 4 big action buttons
var ACTDEF = [
  { k: 'play', ic: 'play', t: 'Play a bird' },
  { k: 'food', ic: 'food', t: 'Get food' },
  { k: 'eggs', ic: 'eggs', t: 'Lay eggs' },
  { k: 'cards', ic: 'cards', t: 'Draw birds' }
];
function actIcon(k) {
  if (k === 'food') return foodIcon('any');
  if (k === 'eggs') return eggIcon();
  if (k === 'cards') return '<svg class="ai4" viewBox="0 0 24 24"><rect x="4" y="5" width="11" height="15" rx="2" fill="#3f8193" stroke="#fff" stroke-width="1.4"/><rect x="9" y="3" width="11" height="15" rx="2" fill="#f6eedb" stroke="#2a2116" stroke-width="1.4"/></svg>';
  return '<svg class="ai4" viewBox="0 0 24 24"><path d="M4 18c4-1 7-4 9-9 1-2 3-4 6-4-1 3-1 6-3 8-2 3-6 5-12 5z" fill="#e3b75a" stroke="#2a2116" stroke-width="1.2"/></svg>';
}
function act4HTML() {
  var inf = actInfo(G, UI.view), tp = tutPoint();
  return '<div id="act4" role="group" aria-label="Choose one action">' + ACTDEF.map(function (d) {
    var a = inf[d.k], best = !tp && hintsOn() && inf.best === d.k, txt = a.ok ? (hintsOn() ? a.what : a.plain || a.what) : a.why;
    return '<button type="button" class="a4 a4-' + d.k + (best ? ' best' : '') + (tp === d.k ? ' tutpoint' : '') + '" data-a="a4" data-k="' + d.k + '"' + (a.ok ? '' : ' aria-disabled="true"') + ' data-val="' + a.v.toFixed(2) + '">' +
      '<span class="a4i" aria-hidden="true">' + actIcon(d.k) + '</span><span class="a4t"><b>' + d.t + '</b><span>' + esc(txt) + '</span></span>' +
      (best ? '<em class="bestb">Best</em>' : '') + '</button>';
  }).join('') + '</div>';
}
document.addEventListener('click', function (e) {
  var t = e.target.closest('[data-a="a4"]'); if (!t || !G || !myTurn() || G.q) return;
  var k = t.dataset.k, inf = actInfo(G, UI.view)[k];
  if (!inf.ok) { toast(inf.why, 0, 1); return; }
  if (k === 'play') { UI.pickBird = true; UI.hix = 0; render(); handGo(0); toast('Swipe your birds. Tap a glowing one to play it.'); return; }
  if (!tutGate({ type: 'tap', what: 'ract', h: inf.h })) return;
  UI.sel = null; UI.pickBird = false; human({ t: 'act', a: k });
});
// ---------------- hand carousel: one big card at a time
function handGo(i) {
  var h = $('#hand'); if (!h) return; var n = h.querySelectorAll('.bc').length; if (!n) return;
  i = Math.max(0, Math.min(n - 1, i)); UI.hix = i;
  try { var db = $('#dockbody'), pr = $('#prompt'); if (db && db.scrollHeight > db.clientHeight) db.scrollTop += h.getBoundingClientRect().top - (db.getBoundingClientRect().top + (pr ? pr.offsetHeight : 0) + 2); } catch (e) { }   // the hand starts right under the sticky prompt
  var c = h.querySelectorAll('.bc')[i]; if (c) h.scrollTo({ left: c.offsetLeft - h.offsetLeft - 6, behavior: UI.fast ? 'auto' : 'smooth' });
  handPager();
}
function handPager() {
  var pg = $('#hpg'); if (!pg) return; var n = G.pl[UI.view].hand.length;
  pg.innerHTML = n > 1 ? '<button type="button" class="hpb" data-a="hprev" aria-label="Previous bird"' + (UI.hix <= 0 ? ' disabled' : '') + '>&#8249;</button><span>Bird ' + (UI.hix + 1) + ' of ' + n + '</span><button type="button" class="hpb" data-a="hnext" aria-label="Next bird"' + (UI.hix >= n - 1 ? ' disabled' : '') + '>&#8250;</button>' : '';
}
document.addEventListener('click', function (e) {
  var t = e.target.closest('[data-a="hprev"],[data-a="hnext"]'); if (!t) return; e.stopPropagation();
  handGo((UI.hix || 0) + (t.dataset.a === 'hnext' ? 1 : -1));
}, true);
function handScrollSync() {
  var h = $('#hand'); if (!h || h.dataset.sync) return; h.dataset.sync = '1';
  h.addEventListener('scroll', function () { clearTimeout(h._t); h._t = setTimeout(function () { var cs = h.querySelectorAll('.bc'); if (!cs.length) return; var w = cs[0].offsetWidth + 16; var i = Math.round(h.scrollLeft / w); if (i !== UI.hix) { UI.hix = i; handPager(); } }, 80); }, { passive: true });
}
// ---------------- turn tracker + score breakdown (top of the board)
function trackerHTML() {
  if (!G) return '';
  var cur = PP.sideToAct(G), me = UI.view, p = G.pl[me], total = G.cubes[Math.min(G.round, G.cubes.length - 1)] || p.cubes;
  if (G.phase === 'over') return '<div class="trk"><b>Game over</b></div>';
  var tok = ''; for (var k = 0; k < total; k++) tok += '<i class="cube' + (k < p.cubes ? ' on' : '') + '"></i>';
  var whoT = isHuman(cur) ? (humans().length > 1 ? G.pl[cur].name + "'s turn" : 'Your turn') : G.pl[cur].name + "'s turn";
  var last = G.round + 1 >= G.rounds;
  return '<div class="trk" role="status" aria-label="Round ' + (G.round + 1) + ' of ' + G.rounds + ', ' + p.cubes + ' actions left">' +
    '<span class="tr-r"><b>Round ' + (G.round + 1) + ' of ' + G.rounds + '</b><span class="tr-w' + (isHuman(cur) ? ' me' : '') + '">' + esc(whoT) + '</span></span>' +
    '<span class="tr-c"><span class="cubes" aria-hidden="true">' + tok + '</span><span>' + p.cubes + (p.cubes === 1 ? ' action' : ' actions') + ' left</span></span>' +
    '<span class="tr-why">' + (last ? 'Game ends' : 'Round ends') + ' when everyone has used all their actions.</span></div>';
}
function scoreHTML() {
  var sc = G.pl.map(function (p, i) { return PP.scoreOf(G, i); }), top = Math.max.apply(null, sc.map(function (s) { return s.total; }));
  var lead = sc.filter(function (s) { return s.total === top; }).length === 1 && top > 0;
  var rows = G.pl.map(function (p, i) {
    var s = sc[i], oth = s.goals + s.bonus + s.cache + s.tuck + s.lead, me = i === UI.view, L = lead && s.total === top;
    return '<button type="button" class="sr' + (me ? ' me' : '') + (L ? ' lead' : '') + '" data-a="' + (me ? 'mysc' : 'opp') + '" data-s="' + i + '" data-br="birds ' + s.birds + ' · eggs ' + s.eggs + ' · other ' + oth + '" aria-label="' + esc((me ? 'You' : p.name) + ': ' + s.total + ' points' + (L ? ', leading' : '')) + '">' +
      '<span class="sn">' + (L ? '<em class="crown" aria-hidden="true">&#9733;</em>' : '') + esc(me && humans().length === 1 ? 'You' : p.name) + '</span>' +
      '<span class="sp"><b>' + s.birds + '</b><small>bird pts</small></span><span class="sp"><b>' + s.eggs + '</b><small>eggs</small></span><span class="sp"><b>' + oth + '</b><small>other</small></span>' +
      '<span class="st"><b>' + s.total + '</b><small>' + (L ? 'leads' : 'pts') + '</small></span></button>';
  }).join('');
  return '<div class="scb" role="group" aria-label="Score">' + rows + '</div>';
}
document.addEventListener('click', function (e) {
  var t = e.target.closest('[data-a="mysc"]'); if (!t || !G) return;
  var s = PP.scoreOf(G, UI.view);
  showScore(); return; toast('Birds ' + s.birds + ' + eggs ' + s.eggs + ' + goals ' + s.goals + ' + bonus ' + s.bonus + ' + stored food ' + s.cache + ' + tucked ' + s.tuck + ' = ' + s.total, 4200);
});
// ---------------- the rating after each of your turns
var RATE = { k: null };
function rateStart() {   // called when your turn begins (no question pending)
  if (!G || !myTurn() || G.q) return;
  var key = UI.view + ':' + G.round + ':' + G.pl[UI.view].cubes; if (RATE.k === key) return;
  // the goal now sits on the starting-hand screen: no pop-up here, so the first tap of the game always lands on what you tap
  try { [$('#dockbody'), $('#dock')].forEach(function (x) { if (x) x.scrollTop = 0; }); } catch (e) { }   // a new turn starts at the top: tracker, Ottilie, the 4 buttons
  RATE.k = key; RATE.seat = UI.view; RATE.s0 = PP.scoreOf(G, UI.view); RATE.sc = RATE.s0.total; RATE.point = null; RATE.inf = actInfo(G, UI.view); RATE.cubes = G.pl[UI.view].cubes; RATE.round = G.round; RATE.choice = null;
}
function rateChoice(m) { if (RATE.k && m && (m.t === 'act' || m.t === 'play') && RATE.choice == null) { RATE.choice = m.t === 'play' ? 'play' : m.a; RATE.point = tutPoint(); } }
function rateEnd() {   // after the turn is over: compare with the best-value estimate made at its start
  if (!RATE.k || RATE.choice == null || !G) return;
  var s = RATE.seat, p = G.pl[s];
  if (G.phase !== 'over' && G.round === RATE.round && p.cubes === RATE.cubes) return;   // not finished yet
  var inf = RATE.inf, ch = RATE.choice, gain = PP.scoreOf(G, s).total - RATE.sc, best = inf.best, v = inf[ch] ? inf[ch].v : 0, bv = best ? inf[best].v : 0;
  var nm = { play: 'playing a bird', food: 'getting food', eggs: 'laying eggs', cards: 'drawing birds' };
  var grade = bv <= 0 || v >= bv * .85 ? 'good' : v >= bv * .45 ? 'okay' : 'poor';
  var s1 = PP.scoreOf(G, s), parts = [];   // where the points came from (and what was spent)
  [['birds', 'bird'], ['eggs', 'egg'], ['cache', 'stored food'], ['tuck', 'tucked'], ['goals', 'goal']].forEach(function (k) { var d = s1[k[0]] - RATE.s0[k[0]]; if (d) parts.push((d > 0 ? '+' : '') + d + ' ' + k[1] + (k[0] === 'eggs' && d < 0 ? ' spent' : '')); });
  var pts = (gain > 0 ? '+' + gain : gain) + (Math.abs(gain) === 1 ? ' point' : ' points') + (parts.length > 1 || (parts.length && gain === 0) ? ' (' + parts.join(', ') + ')' : '');
  if (RATE.point && ch === RATE.point) grade = 'good';
  var line = RATE.point && ch === RATE.point ? 'Good: ' + pts + '. Lesson learned!' : grade === 'good' ? 'Good: ' + pts + (ch === best ? ', the best move this turn.' : ', as good as the best move.')
    : (grade === 'okay' ? 'Okay: ' : 'Poor: ') + pts + '. ' + cap1(nm[best]) + ' was worth more (' + inf[best].gain + ').';
  if (ch === 'food' && gain === 0 && grade === 'good') line = 'Good: food now lets you play birds next turn.';
  RATE.k = null; RATE.last = { g: grade, t: line };
  showRate();
  try { coachRate(grade, ch); } catch (e) { }
}
function pl(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
function cap1(t) { t = String(t || ''); return t.charAt(0).toUpperCase() + t.slice(1); }
function showRate() {
  var el = $('#rate'); if (!el) return;
  if (!RATE.last || !G || G.phase === 'over' || !hintsOn()) { el.hidden = true; return; }
  el.hidden = false; el.className = 'rate r-' + RATE.last.g; el.innerHTML = '<b>' + ({ good: '&#10003;', okay: '~', poor: '!' })[RATE.last.g] + '</b><span>' + esc(RATE.last.t) + '</span>';
}
// the tutorial's pointer: which big button Ottilie points at right now (coach.js sets COACH.point)
function tutPoint() { try { return coachOn() ? COACH.point || null : null; } catch (e) { return null; } }

// ---------------- Addendum 7: three modes. PLAY is clean (board, hand, tracker, one score line, a Goal card, short pops);
// HINTS (top-bar toggle, off by default) adds previews, Best badges, the turn rating, toasts and "What should I do?";
// LEARN TO PLAY (tutfree) is the coached game and always shows them.
function hintsPref() { try { return localStorage.getItem('pp-hints') === '1'; } catch (e) { return false; } }
function hintsOn() { return !!(UI.mode === 'tutfree' || UI.hintPref); }
UI.hintPref = hintsPref();
function hintsBtn() { var b = $('#bulbbtn'); if (!b) return; var on = hintsOn(); b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.setAttribute('aria-label', 'Hints: ' + (on ? 'on' : 'off')); b.classList.toggle('on', on); var t = b.querySelector('.hst'); if (t) t.textContent = on ? 'on' : 'off'; }
document.addEventListener('click', function (e) {
  if (!e.target.closest('#bulbbtn')) return;
  if (UI.mode === 'tutfree') { toast('Learn to play always shows hints.', 0, 1); return; }
  UI.hintPref = !UI.hintPref; try { localStorage.setItem('pp-hints', UI.hintPref ? '1' : '0'); } catch (x) { }
  render(); toast(UI.hintPref ? 'Hints on: previews, Best badges and a rating after each turn.' : 'Hints off.', 0, 1);
});
// one compact score line: you vs the rival(s), leader starred; tap = the score drawer
function scoreLineHTML() {
  var sc = G.pl.map(function (p, i) { return PP.scoreOf(G, i).total; }), top = Math.max.apply(null, sc), one = sc.filter(function (v) { return v === top; }).length === 1 && top > 0;
  return '<button type="button" class="sline" data-a="mysc" aria-label="Score: ' + esc(G.pl.map(function (p, i) { return (i === UI.view ? 'you' : p.name) + ' ' + sc[i]; }).join(', ')) + '. Tap for how it adds up">' +
    G.pl.map(function (p, i) { return '<span class="sl' + (i === UI.view ? ' me' : '') + '">' + (one && sc[i] === top ? '<em aria-hidden="true">&#9733;</em>' : '') + esc(i === UI.view && humans().length === 1 ? 'You' : p.name) + ' <b>' + sc[i] + '</b></span>'; }).join('<i>vs</i>') +
    (G.round === 0 && G.pl[UI.view].cubes === G.cubes[0] && UI.mode !== 'tutfree' ? '<span class="slw goal1">Goal: most points in ' + G.rounds + ' rounds</span>' : '<span class="slw">why?</span>') + '</button>';   // the first screen says the goal in one line
}
// the score drawer: every number's why, for every player
function showScore() {
  var rows = [['birds', 'Birds', 'points printed on birds played'], ['eggs', 'Eggs', '1 point each'], ['goals', 'Round goals', 'judged at each round end'], ['bonus', 'Bonus card', 'your secret card'], ['cache', 'Stored food', '1 point each'], ['tuck', 'Tucked cards', '1 point each']];
  var sc = G.pl.map(function (p, i) { return PP.scoreOf(G, i); });
  var h = '<div class="card scored" role="dialog" aria-label="How the score adds up"><h3>How the score adds up</h3><table class="sctab"><tr><th></th>' + G.pl.map(function (p, i) { return '<th>' + esc(i === UI.view ? 'You' : p.name) + '</th>'; }).join('') + '</tr>' +
    rows.map(function (r) { return '<tr><td><b>' + r[1] + '</b><small>' + r[2] + '</small></td>' + sc.map(function (s) { return '<td>' + s[r[0]] + '</td>'; }).join('') + '</tr>'; }).join('') +
    '<tr class="tot"><td><b>Total</b></td>' + sc.map(function (s) { return '<td>' + s.total + '</td>'; }).join('') + '</tr></table>' +
    '<div class="acts"><button type="button" class="btn pri" data-a="popx">Close</button></div></div>';
  var el = $('#pop'); el.innerHTML = h; el.hidden = false;
}
// before turn 1 of a Play game: one card with the aim and how points are earned
function goalCard() {
  if (!G || UI.mode === 'tutfree' || UI.goalShown === G.seed + ':' + UI.started || UI.fast) return;
  UI.goalShown = G.seed + ':' + UI.started;
  var el = $('#pop');
  el.innerHTML = '<div class="card goalc" role="dialog" aria-label="Goal"><h3>Goal: have the most points after ' + G.rounds + ' rounds</h3><ul>' +
    '<li><b>Birds</b> score the points printed on them. Play birds by paying their food.</li>' +
    '<li><b>Eggs</b> are 1 point each. Lay them on your birds.</li>' +
    '<li><b>Round goals</b> and your secret <b>bonus card</b> add more.</li></ul>' +
    '<p>Each turn you do one thing. Tap the score line any time to see how it adds up.</p>' +
    '<div class="acts"><button type="button" class="btn pri" data-a="popx">Start</button></div></div>';
  el.hidden = false;
}

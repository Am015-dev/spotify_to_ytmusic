/* PACE + ADVICE (vale-of-banners, F3): one ★ a turn, the on-demand hint, the rival Skip chip. Loaded before ui.js; uses its globals. */
/* F3: the ★ is advice, not autopilot. At most one ★ a turn: in the first season it shows on your first decision of the turn;
   after that, only when you ask (the "★ Best move?" chip or the bulb), once a turn. The +N previews on spaces stay. */
function turnTag() { return G.phase + ':' + G.round + ':' + VB.actor(G); }
function actsNow() { return UI.acts && UI.acts.tk === turnTag() ? UI.acts.n : 0; }
function starOk() { var tk = turnTag(), n = actsNow(); if (UI.ask && UI.ask.tk === tk && UI.ask.n === n) return true; return G.phase === 0 && n === 0 && !UI.askOnly; }
function canAsk() { return !!G && !G.over && hints() && UI.mode !== 'tutorial' && myTurn() && !starOk() && !(UI.ask && UI.ask.tk === turnTag()); }
function askStar() { if (!canAsk()) return false; UI.ask = { tk: turnTag(), n: actsNow() }; render(); return true; }
/* F3: rival turns are quick and skippable: a Skip chip while a computer plays (any tap also speeds it up) */
function skipSync() { var b = $('#skipRv'); if (!b) { b = h('button', { id: 'skipRv', type: 'button', text: 'Skip ▸▸', 'aria-label': 'Skip the rival animation', onclick: function () { UI.quick = true; skipSync(); } }); document.body.appendChild(b); } b.hidden = !(rivalNow() && !UI.quick && UI.mode !== 'tutorial'); }
/* the ★ itself: its reason line and where it sits (moved from ui.js) */
function starWhy(m) {
  if (!m) return ''; if (m.k === 'end') return 'Nothing better left: end your turn.'; if (m.k === 'skip') return 'Skip: nothing here helps you.';
  var r = sim(m); if (!r) return ''; var s = r.s, pts = 0, sil = 0, wk = 0, what = [];
  r.ev.forEach(function (ev) { if (ev.p !== s) return; if (ev.e === 'score') { pts += ev.n; if (WHY[ev.why] && what.indexOf(WHY[ev.why]) < 0) what.push(WHY[ev.why]); } if (ev.e === 'silver' && ev.n > 0) sil += ev.n; if (ev.e === 'workers' && ev.n > 0) wk += ev.n; });
  var cost = m.w ? ', costs ' + m.w + ' worker' + (m.w > 1 ? 's' : '') : '';
  var gain = (pts ? '+' + pts + ' pts' + (what.length ? ', ' + what.join(', ') : '') : '') + (sil ? (pts ? ', ' : '') + '+' + sil + ' silver' : '');
  if (m.k === 'take' || m.k === 'grab' || m.k === 'buy') {
    var t = m.k === 'buy' ? G.black[m.slot] : G.depots[m.v][m.slot], si = r.G.P[s].store.length - 1;
    var fits = VB.validMoves(r.G).some(function (x) { return x.k === 'place' && x.s === si && !x.w; });
    return (m.k === 'buy' ? 'Buy ' : 'Take ') + VB.tileName(t) + ': ' + tileWhy(t) + cost + '.' + (fits ? ' Fits a space now.' : '');
  }
  if (m.k === 'place') { var q = previewPlace(m), t2 = G.P[s].store[m.s]; return 'Build ' + VB.tileName(t2) + ': ' + (gain || (q ? 'region ' + q.f + ' of ' + q.size + ' filled' : tileWhy(t2))) + (wk ? ', +' + wk + ' workers' : '') + cost + '.'; }
  if (m.k === 'sell') return 'Sell your ' + VB.GOODS[m.v] + ': ' + (gain || 'silver') + cost + '.';
  if (m.k === 'ship') return 'Load these goods: sell them later for points.';
  if (m.k === 'workers') return 'Take workers: change a die by one later.';
  if (m.k === 'discard') return 'Throw away ' + VB.tileName(G.P[s].store[m.s]) + ': least useful now.';
  return gain ? gain + '.' : '';
}
function starLine() { if (!hints() || UI.mode === 'tutorial') return ''; var m = hardMove(); return m ? '★ ' + (m.k === 'end' ? 'End turn: no useful move left. Saves your workers for later.' : starWhy(m)) : ''; }
function tutStarPaint() {   /* Learn to play: exactly one star, always on the coach's target (never a second opinion) */
  if (!G || UI.mode !== 'tutorial') return; var id = null;
  try { var st = GXT.current(), e = st && st.target ? st.target() : null; if (e && e.id && /^(mt-|bl-|ec-|st-|gd-|gs-)/.test(e.id)) id = e.id; } catch (e) { }
  [].slice.call(document.querySelectorAll('.bestt,.bestx,.cell.best')).forEach(function (e) { if (e.id !== id) e.classList.remove('bestt', 'bestx', 'best'); });
  [].slice.call(document.querySelectorAll('.bestb,.bestq')).forEach(function (e) { if (!id || !e.parentElement || e.parentElement.id !== id) e.remove(); });
  var el = id && document.getElementById(id); if (!el) return;
  if (/^ec-/.test(id)) { el.classList.add('best'); return; }
  if (!el.querySelector(':scope > .bestq')) { el.classList.add('bestx'); el.appendChild(h('span.bestq', { text: '★', 'aria-hidden': 'true' })); }
}
/* one ★ on every decision, never only on market picks: the look-ahead move is shown on whatever you tap next
   (stored tile, glowing space, goods, worker swap, crates, Skip, End turn), and on the tab that hides it */
function markBest() {
  document.querySelectorAll('.bestx').forEach(function (e) { e.classList.remove('bestx'); var b = e.querySelector(':scope > .bestq'); if (b) b.remove(); });
  if (!hints() || !myTurn() || UI.busy || UI.mode === 'tutorial') return;
  var m = hardMove(); if (!m) return; var p = G.P[VB.actor(G)], top = pend(), id = null;
  if (m.k === 'take' || m.k === 'grab') id = 'mt-' + m.v + '-' + m.slot;
  else if (m.k === 'buy') id = 'bl-' + m.slot;
  else if (m.k === 'place') { if (UI.sel === m.s || (UI.sel == null && UI.die != null && document.querySelector('#es .cell.best'))) return; id = 'st-' + m.s; }
  else if (m.k === 'discard') id = 'st-' + m.s;
  else if (m.k === 'sell') id = 'gd-' + m.v;
  else if (m.k === 'ship') id = 'gs-' + m.v;
  else if (m.k === 'end') id = 'endB';
  else if (m.k === 'skip') id = 'skipB';
  else if (m.k === 'workers') { if (m.die === 'x') id = 'wkxB'; else { var i0 = !p.used[0] && p.dice[0] === p.dice[m.die] ? 0 : m.die; id = 'wk' + i0;   /* the dock draws one button per unused die value */ } }
  var el = id && document.getElementById(id); if (!el) return;
  var tab = el.closest('#mk') ? 'market' : el.closest('#es') ? 'estate' : null, tb = tab && document.getElementById('tab-' + tab);
  if (tb && !tb.classList.contains('on') && !tb.querySelector('.bestq')) { tb.classList.add('bestx'); tb.appendChild(h('span.bestq', { text: '★', 'aria-hidden': 'true' })); }   /* the ★ sits on a closed tab: that tab wears it too */
  if (el.querySelector('.bestb')) return;   /* the market already wears its ★ Best badge */
  el.classList.add('bestx'); el.appendChild(h('span.bestq', { text: '★', 'aria-hidden': 'true' }));
  el.setAttribute('aria-label', (el.getAttribute('aria-label') || el.textContent) .replace(/, best move$/, '') + ', best move');
}
/* F3: explain the stall numbers, worker badges, lore and the turn/banner track where they appear: one line, tap for detail */
function mkLegend() {
  var lore = false; for (var d = 1; d <= 6; d++) (G.depots[d] || []).forEach(function (t) { if (t && t.t === 'know') lore = true; });
  var txt = 'Stall number = the die you use · badge = workers' + (lore ? ' · scroll = lore' : '') + ' · ⓘ';
  return h('button.mkleg', { type: 'button', id: 'mkLeg', text: txt, 'aria-label': 'What the market numbers mean', onclick: function () {
    toast('Take from the stall whose number matches a die. A badge on a tile = workers you pay when no die matches (each worker moves a die by 1). Lore (scroll) tiles change a rule for you or give end points: tap any tile to read it.', 9000); } });
}
function trackText() {
  var ord = (G.order || []).map(function (q) { return isHuman(q) ? 'you' : G.seats[q].name; }).join(', then ');
  return 'Season ' + (G.phase + 1) + ' of ' + G.nPhases + ', round ' + Math.min(G.round + 1, nRounds()) + ' of ' + nRounds() + '. Each round everyone rolls 2 dice. Turn order: ' + ord + '. Higher on the banner track plays first; Barges move you up.';
}
function trackWire() { var b = $('#barstat'); if (!b || b.dataset.w) return; b.dataset.w = 1; b.setAttribute('role', 'button'); b.setAttribute('tabindex', '0'); b.title = 'Season and round: tap for what it means'; b.style.cursor = 'pointer'; b.addEventListener('click', function () { if (G) toast(trackText(), 7000); }); }
var LORESHORT = { 'wk+1': 'Hire +1 worker', saleSil: 'Sell +1 silver', saleVP: 'Sell +1 pt/tile', shipVP: 'Barge +2 pts', mineWk: 'Mine +1 worker', take1: 'Take: die ±1', place1: 'Build: die ±1', store4: 'Storage 4', black1: 'Back lane 1 silver', dupBld: 'Twin buildings', pasVP: 'Pasture +2 pts', wkSil: 'Hire +1 silver', saleWk: 'Sell +1 worker', shipSil: 'Barge +1 silver', mineVP: 'Mine +1 pt', wk2: 'Worker = ±2',
  'end:hall': 'End: 3/Hall', 'end:carp': 'End: 3/Joiner', 'end:chapel': 'End: 3/Chapel', 'end:mkt': 'End: 3/Fair', 'end:inn': 'End: 3/Inn', 'end:mint': 'End: 3/Counting', 'end:tower': 'End: 3/Beacon', 'end:store': 'End: 3/Granary', 'end:sold': 'End: 1/goods sold', 'end:beast': 'End: 4/animal kind' };
/* F3 one-tap: a glowing tile (or goods) with exactly one legal way to use it, no workers to spend, acts on the first tap.
   The result is said on the line; a tile with a choice (two dice, worker costs) still opens its card. Not in Learn to play. */
function oneTap(lg, t, g) {
  if (!lg || lg.length === 0 || UI.mode === 'tutorial' || !myTurn()) return false;
  var free = lg.filter(function (m) { return !m.w; }), dice = {}; var pp = G.P[VB.actor(G)]; free.forEach(function (m) { dice[m.die === 'x' || m.die == null ? 'x' : pp.dice[m.die]] = 1; });
  if (!free.length || Object.keys(dice).length > 1 || free.length !== lg.length) return false;
  var m = pick(free.slice()); doMove(m);
  if (t) lineSay('Took ' + VB.tileName(t) + ': ' + tileWhy(t) + '.', 2400); else if (g) lineSay('Sold your ' + VB.GOODS[g] + '.', 2000);
  return true;
}
/* F3 PC: wide screens keep the rival in the side panel under your dock: its estate, points and why it last scored */
function renderRivalPC() {
  var old = $('#rvpc'), wide = !L.tabs && innerWidth >= 860 && innerWidth > innerHeight * 1.15;
  if (!wide || !G || G.n < 2) { if (old) old.remove(); return; }
  var db = $('#dockbody'); if (!db) return; var r = old || h('div', { id: 'rvpc', role: 'group', 'aria-label': 'Rival estate' }); if (!old) db.appendChild(r);
  r.innerHTML = ''; var s = rivalSeat(), p = G.P[s];
  r.appendChild(h('div.rvh', { text: G.seats[s].name + ': ' + p.vp + ' pts · ' + p.silver + ' silver · ' + p.workers + ' workers' }));
  r.appendChild(h('div.rvwhy2', { text: scoreWhy(s) }));
  if (innerHeight < 640) { var lg = mkLegend(); lg.id = 'mkLeg3'; r.insertBefore(lg, r.firstChild); }
  var dk = $('#dock').getBoundingClientRect(), top = r.getBoundingClientRect().bottom, w = r.clientWidth, hh = dk.bottom - top - 10;
  var S = Math.min(w / (7 * 1.732 + 0.4), hh / 11.1); if (S < 9) return;
  var box = h('div.minies', { style: 'position:relative;height:' + Math.ceil(S * 11.1) + 'px' }); r.appendChild(box); renderEstate(box, s, S);
}
function legendPhone() {   /* phones: the legend sits under the market in the free strip above the dock (never squeezes the stalls); hidden when there is no room */
  var o = $('#mkLeg2'); if (o) o.remove(); if (!L.tabs || UI.tab !== 'market') return;
  var mk = $('#mk'), bd = $('#bd'), br = bd.getBoundingClientRect(), mr = mk.getBoundingClientRect(), dk = $('#dock'), lim = dk && dk.offsetHeight ? dk.getBoundingClientRect().top : br.bottom;
  var top = mr.bottom + 4; if (lim - top < 30) return;
  var b = mkLegend(); b.id = 'mkLeg2'; b.style.cssText = 'position:absolute;z-index:5;left:' + (mr.left - br.left) + 'px;width:' + mr.width + 'px;top:' + (top - br.top) + 'px'; bd.appendChild(b);
}

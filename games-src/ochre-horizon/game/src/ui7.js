// ===== part 7: Learn to play = three charters (story + strategy puzzles on the real engine). Logic in src/charters.js =====
// Every tap here is a decision between real moves; the screen then says WHY in one sentence and plays the rival's reply with its reason.
// Nothing asks for Next/OK: story beats ride along with the first decision, results ride along with the next one.
var CHUI = { R: null, last: [], timer: 0, beat: 0, wins: {} };
function chStart(i) {
  closeModal(); closeSheet(); hideStart(); clearTimeout(CHUI.timer);
  UI.tut = false; UI.scn = false; UI.charter = true; UI.setup = null; UI.research = null;
  CHUI.R = OHC.start(i); CHUI.last = []; CHUI.beat = 0;
  UI.evSeen = OH.G.ev.length; UI.logSeen = OH.G.log.length;
  document.body.classList.add('charter');
  fitView(); render(); chTick();
}
function chStop() { UI.charter = false; CHUI.R = null; clearTimeout(CHUI.timer); document.body.classList.remove('charter'); $('chP').classList.remove('on'); }
function chLine(l) { return '<div class="chl ' + (l.who ? 'riv' : 'you') + '">' + (l.who ? '' : '<b>Why:</b> ') + esc(l.t) + '</div>'; }
// one step at a watchable pace; stops at a decision or at the end
function chTick() {
  var R = CHUI.R; if (!R || !UI.charter) return;
  clearTimeout(CHUI.timer); CHUI.lastTick = Date.now();
  var d = OHC.decision(R);
  if (d) { chShow(d); return; }
  if (R.ended) { chDebrief(); return; }
  var g0 = OH.G.gen, out = OHC.advance(R, 1);
  var dl = playEvents(); render(); chDecor();
  out.forEach(function (l) { var p = CHUI.last[CHUI.last.length - 1]; if (!p || p.t !== l.t) CHUI.last.push(l); });
  if (CHUI.last.length > 5) CHUI.last = CHUI.last.slice(-5);
  if (OH.G.gen !== g0 && OH.G.gen <= R.ch.gens) CHUI.last.push({ who: -1, t: 'Season ' + OH.G.gen + ' of ' + R.ch.gens + ': income paid (rating + income cards).' });
  chPanel(null);
  CHUI.timer = setTimeout(chTick, out.length ? Math.min(1500, Math.max(UI.AIDELAY * 6, dl, 650)) : 60);
}
function chGoalLine() { var R = CHUI.R, G = OH.G; return 'Season ' + Math.min(G.gen, R.ch.gens) + ' of ' + R.ch.gens + ' · You ' + OH.score(0).total + ' · Greyline ' + OH.score(1).total; }
function chPanel(d) {
  var R = CHUI.R, h = '<div class="cht">Charter ' + R.ch.n + ' · ' + esc(R.ch.title) + '<span>' + esc(chGoalLine()) + '</span></div>';
  if (CHUI.beat < R.ch.story.length && d) h += '<div class="chs">' + R.ch.story.map(esc).join(' ') + '</div><div class="chg">Goal: ' + esc(R.ch.goal) + '</div>';
  var lines = CHUI.last.slice(-4);
  if (lines.length) h += '<div class="chf">' + lines.map(function (l) { return l.who === -1 ? '<div class="chl sys">' + esc(l.t) + '</div>' : chLine(l); }).join('') + '</div>';
  if (d) {
    h += '<div class="chq">' + esc(d.d.prompt) + '</div><div class="cho">' + d.options.map(function (o, i) { return '<button class="btn' + (i ? ' cr' : '') + '" data-cho="' + i + '">' + esc(o.label) + '<small>' + esc(o.sub) + '</small></button>'; }).join('') + '</div>';
  } else h += '<div class="chq dim">' + (R.ended ? 'Charter over.' : 'Playing out…') + '</div>';
  $('chP').innerHTML = h; $('chP').classList.add('on');
  setHint(R.ch.goal.replace(/ when season.*| by the end.*/, '').slice(0, 60));
  $('chP').querySelectorAll('[data-cho]').forEach(function (b) { b.addEventListener('click', function () { chPick(d, +b.getAttribute('data-cho')); }); });
}
function chShow(d) {
  render(); chDecor(d); chPanel(d);
  if (d.d.kind === 'place') { var sp = d.options.map(function (o) { return o.space; }); if (window.autoZoomPlace && hexPx() < 47) autoZoomPlace(sp); chDecor(d); }
}
// placement decisions: only the offered spaces glow, each tagged with its option letter
function chDecor(d) {
  document.querySelectorAll('#hexes .hex.chx').forEach(function (e) { e.classList.remove('chx', 'tgt'); e.removeAttribute('data-opt'); });
  if (!d || d.d.kind !== 'place') return;
  document.querySelectorAll('#hexes .hex.tgt').forEach(function (e) { e.classList.remove('tgt'); });
  d.options.forEach(function (o, i) { var e = document.querySelector('#hexes .hex[data-s="' + o.space + '"]'); if (e) { e.classList.add('tgt', 'chx'); e.setAttribute('data-opt', i); } });
}
function chTapSpace(s) {
  var d = CHUI.R && OHC.decision(CHUI.R); if (!d || d.d.kind !== 'place') return;
  var i = d.options.map(function (o) { return o.space; }).indexOf(s); if (i >= 0) chPick(d, i);
}
function chPick(d, i) {
  var R = CHUI.R; if (!R || OHC.decision(R) !== null && OHC.decision(R).key !== d.key) return;
  CHUI.beat = 99; sfx('tick'); vib(12);
  var why = OHC.choose(R, d, i);
  CHUI.last = [{ who: 0, t: why }, { who: -1, t: 'Learned: ' + d.d.teach }];
  playEvents(); render(); chDecor(); chPanel(null);
  CHUI.timer = setTimeout(chTick, 700);
}
function chDebrief() {
  var R = CHUI.R, res = R.result, n = R.i, next = OHC.CH[n + 1];
  if (res.ok) CHUI.wins[R.ch.id] = 1; try { LS.set('oh_charters', JSON.stringify(CHUI.wins)); } catch (e) { }
  chPanel(null);
  var other = R.lastNaive ? 'the other plan' : 'the other plan, to see why it loses';
  modal('<h3>' + (res.ok ? 'Charter won' : 'Charter lost') + ': ' + esc(R.ch.title) + '</h3><p><b>' + esc(res.line) + '</b></p><p class="chlesson">' + esc(R.ch.lesson) + '</p>' +
    '<button class="btn' + (res.ok ? ' cr' : '') + '" id="chAgain">Replay with ' + other + '<small>Same start, same rival: only your choices change the result</small></button>' +
    (next ? '<button class="btn' + (res.ok ? '' : ' cr') + '" id="chNext">Charter ' + next.n + ': ' + esc(next.title) + '<small>Next idea: ' + esc(next.goal) + '</small></button>'
      : '<button class="btn' + (res.ok ? '' : ' cr') + '" id="chFull">First full game<small>' + esc(R.ch.hint) + '</small></button>'));
  $('chAgain').addEventListener('click', function () { chStart(n); });
  if ($('chNext')) $('chNext').addEventListener('click', function () { chStart(n + 1); });
  if ($('chFull')) $('chFull').addEventListener('click', function () { chStop(); closeModal(); startGame({ level: 'easy' }); toast('<b>Your first full game</b>Early rounds: buy income. Middle: cities with room for greenery. Late: land on white marks.', true, 6000, { now: true, key: 'chfull' }); });
}
// watchdog: if a step timer is ever lost (tab throttling, idle saver), resume the play-out
setInterval(function () { if (UI.charter && CHUI.R && !CHUI.R.ended && Date.now() - (CHUI.lastTick || 0) > 2500 && !OHC.decision(CHUI.R)) chTick(); }, 1000);

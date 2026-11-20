// ===================== the guided first game (tutorial): 1 round of 4 turns vs Pip, then the score, then a real game.
// A fixed list of steps teaches every core rule in order. Each step = one sentence (max 12 words, STORY.coach) and ONE highlighted
// thing to tap (class .tutpoint); taps elsewhere are blocked while that step waits. "See" steps (info) advance when their target is
// tapped; action steps advance when the game state shows the action happened. Board set-up: tutor.js (tutPick / tutPrep).
var COACH = { on: false, i: 0, done: {}, cur: null, iv: 0, finished: false, snap: 0, tapped: false };
// the shelf's coached-game hook (qa-bot and tests read it): running, step ids taught so far, done once the last step is reached
window.GXCOACH = { get running() { return coachOn() && G.phase !== 'over'; }, get explained() { return Object.keys(COACH.done); }, get done() { return !!COACH.finished; }, get step() { var s = TSTEPS[COACH.i]; return s ? s.id : null; } };
function coachOn() { return COACH.on && G && UI.mode === 'tutfree'; }
function tvis(e) { if (!e || !e.isConnected) return false; for (var x = e; x; x = x.parentElement) { if (x.hidden || getComputedStyle(x).display === 'none') return false; } var r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
function tq(sel) { return $$(sel).filter(tvis)[0] || null; }
function tPlaying() { return myTurn() && !UI.busy && G.phase !== 'over' && !document.querySelector('.turnban,.reveal') && !tvis($('#result')); }
function tResult() { return tvis($('#result')); }
function tHandCard(id) { var i = G.pl[UI.view].hand.indexOf(id); return i < 0 ? null : tq('#hand [data-a="hand"][data-i="' + i + '"]'); }
function tOnBoard(id) { var b = G.pl[UI.view].board; for (var r = 0; r < 3; r++) for (var c = 0; c < b[r].length; c++) if (b[r][c].id === id) return [r, c]; return null; }
function tQ(h) { return !!(G.q && G.q.h === h && PP.sideToAct(G) === UI.view); }
// the steps, in teaching order. t() = the one element to tap; done() = the step is over (info steps: their target was tapped).
var TSTEPS = [
  { id: 'goal', info: 1, t: function () { return tq('#opps .sr2.me') || tq('#opps'); } },
  // one step, four taps: Play a bird, the bird, the space, Play. Its sentence follows where you are (sub).
  { id: 'play', sub: function () { return UI.pend ? 'pay' : UI.sel != null ? 'slot' : UI.pickBird ? 'cost' : 'play'; },
    t: function () { var k = this.sub(); return k === 'pay' ? tq('#acts [data-a="playgo"]') : k === 'slot' ? (tq('.row[data-h="1"] [data-legal].slot') || tq('[data-legal].slot')) : k === 'cost' ? tHandCard(TUT.ids.play) : tq('.a4[data-k="play"]'); },
    done: function () { return !!tOnBoard(TUT.ids.play); } },
  { id: 'white', info: 1, t: function () { var rc = tOnBoard(TUT.ids.play); var e = rc && tq('#mat [data-a="bird"][data-h="' + rc[0] + '"][data-c="' + rc[1] + '"]'); return e && (e.closest('.slot') || e); } },
  { id: 'food', sub: function () { return tQ('die') ? (G.feeder.filter(Boolean).length < COACH.snap ? 'die2' : 'die') : 'food'; },
    t: function () { return tQ('die') ? tq('#feeder .die[data-legal]') : tq('.a4[data-k="food"]'); },
    enter: function () { COACH.snap = G.feeder.filter(Boolean).length; }, done: function () { return !!COACH.acted.food && !tQ('die'); } },
  { id: 'tuck', t: function () { return tq('#hand [data-a="hand"]'); }, done: function () { return !tQ('pwTuck'); } },
  { id: 'cache', info: 1, t: function () { return tq('#mat .row[data-h="0"]'); } },
  { id: 'twofor1', info: 1, t: function () { return tq('#foodrow'); } },
  { id: 'eggs', sub: function () { return tQ('egg') ? 'nest' : 'eggs'; }, t: function () { return tQ('egg') ? tq('#mat [data-legal]') : tq('.a4[data-k="eggs"]'); }, done: function () { return !!COACH.acted.eggs && !tQ('egg'); } },
  { id: 'pink', info: 1, t: function () { return tq('#opps .opp') || tq('#opps'); } },
  { id: 'cards', sub: function () { return tQ('draw') ? 'tray' : 'cards'; }, t: function () { return tQ('draw') ? tq('#tray [data-legal]') : tq('.a4[data-k="cards"]'); }, done: function () { return !!COACH.acted.cards && !tQ('draw'); } },
  { id: 'final', res: 1, info: 1, t: function () { return tq('#result .walk li.tot'); } },
  { id: 'real', res: 1, t: function () { return tq('#result #again'); }, done: function () { return false; } }
];
function coachReset() { COACH.on = true; COACH.i = 0; COACH.done = {}; COACH.finished = false; COACH.tapped = false; COACH.acted = {}; COACH.entered = -1; coachHide(); clearInterval(COACH.iv); COACH.iv = setInterval(coachTick, 200); }
function coachHide() { if (COACH.cur && COACH.cur.parentNode) COACH.cur.parentNode.removeChild(COACH.cur); COACH.cur = null; $$('.tutpoint').forEach(function (e) { e.classList.remove('tutpoint'); }); }
function coachStep() { return TSTEPS[COACH.i] || null; }
function coachReady(s) { return s && (s.res ? tResult() : s.info ? tSee(s) : tPlaying()); }
// a "see" step about your own board shows as soon as the animations stop, even before your next turn (the rival waits for it)
function tSee(s) { return !UI.busy && G.phase !== 'over' && !document.querySelector('.turnban,.reveal') && !tvis($('#result')) && !!s.t(); }
// flow.js pump(): hold the rival's turn while a "see" step waits for its tap, so the marker is never late
function coachHold() { if (!coachOn()) return false; var s = coachStep(); return !!(s && s.info && !s.res && G.phase === 'play' && s.t()); }
// between steps (rival's turn, round end): say so, instead of a silent gap
function coachWait(s) {
  if (COACH.cur && COACH.cur.dataset.rule === 'wait' && COACH.cur.isConnected) return;
  if (COACH.cur && COACH.cur.parentNode) COACH.cur.parentNode.removeChild(COACH.cur);
  var d = document.createElement('div'); d.className = 'coachb'; d.setAttribute('data-help', 'coach'); d.setAttribute('role', 'status'); d.dataset.rule = 'wait';
  d.innerHTML = faceHTML('ottilie', STORY.cast.ottilie) + '<span class="saytx"><b>Step ' + (COACH.i + 1) + ' of ' + TSTEPS.length + '</b>' + esc(s.res ? 'The round ends. Your score comes next.' : 'Pip plays. Your next step comes right after.') + '</span><em class="skipw">Tap to skip</em>';
  d.style.cursor = 'pointer'; d.addEventListener('click', function () { UI.speed = 25; $$('.turnban').forEach(function (b) { b.click(); }); });   // the wait never holds you: a tap plays the rest at once
  var host = $('#dockbody'), at = $('#prompt'); if (host && at) at.parentNode.insertBefore(d, at); else return;
  COACH.cur = d;
}
// one bubble: the step's sentence, in the panel above the instruction bar (or above the score walk-through on the result screen)
function coachSay(s) {
  var sk = s.sub ? s.sub() : '', txt = STORY.coach[sk ? s.id + '_' + sk : s.id] || '', n = COACH.i + 1;
  if (COACH.cur && COACH.cur.dataset.rule === s.id && COACH.cur.dataset.sub === sk && COACH.cur.isConnected) return;
  if (COACH.cur && COACH.cur.parentNode) COACH.cur.parentNode.removeChild(COACH.cur);
  var d = document.createElement('div'); d.className = 'coachb'; d.setAttribute('data-help', 'coach'); d.setAttribute('role', 'status'); d.setAttribute('aria-live', 'polite'); d.dataset.rule = s.id; d.dataset.sub = sk;
  d.innerHTML = faceHTML('ottilie', STORY.cast.ottilie) + '<span class="saytx"><small class="stepn">Step ' + n + ' of ' + TSTEPS.length + '</small><b class="tgoal">Goal: ' + esc((STORY.coachGoal || {})[s.id] || '') + '</b>' + esc(txt) + '</span>' + (s.info && !s.res ? '<button type="button" class="coachnext btn" data-coach-next="1">Next</button>' : '');
  var host, at;
  if (s.res) { host = $('#result'); at = host && host.querySelector('.walk'); }
  else { host = $('#dockbody'); at = $('#prompt'); }
  if (host && at && at.parentNode === host) host.insertBefore(d, at); else if (host && at) at.parentNode.insertBefore(d, at); else document.body.appendChild(d);
  COACH.cur = d;
  var nb = d.querySelector('[data-coach-next]'); if (nb) nb.addEventListener('click', function (e) { e.stopPropagation(); COACH.tapped = true; setTimeout(coachTick, 0); });
}
// advance through finished steps, then show the current one and mark its target
function coachTick() {
  if (!coachOn()) { if (COACH.cur) coachHide(); return; }
  var guard = 0, s;
  while ((s = coachStep()) && guard++ < 30) {
    if (COACH.entered !== COACH.i && coachReady(s)) { COACH.entered = COACH.i; COACH.tapped = false; if (s.enter) s.enter(); }
    if (COACH.entered !== COACH.i) break;
    var fin = s.info ? COACH.tapped : (s.done ? s.done() : false);
    if (!fin) break;
    COACH.done[s.id] = 1; COACH.i++;
  }
  s = coachStep();
  $$('.tutpoint').forEach(function (e) { e.classList.remove('tutpoint'); });
  if (!s) return;
  if (s.id === 'real') COACH.finished = true;
  if (!coachReady(s)) { if (!myTurn() || s.res || UI.busy) coachWait(s); return; }
  coachSay(s);
  var t = s.t(); if (t) { t.classList.add('tutpoint'); tInView(t); }
}
// R12/R27: a step's target is always fully visible AND tappable while its step waits: scroll every scrollable ancestor (the dock panel
// included) until the target sits inside it, and keep doing so each tick (the panel can re-flow when the bubble or prompt changes)
function tScroller(e) { for (var x = e.parentElement; x && x !== document.body; x = x.parentElement) { var o = getComputedStyle(x).overflowY; if ((o === 'auto' || o === 'scroll') && x.scrollHeight > x.clientHeight + 1) return x; } return null; }
function tInView(t) {
  var bar = document.querySelector('.gx-bar'), top = bar ? bar.getBoundingClientRect().bottom : 0;
  for (var k = 0; k < 4; k++) {
    var r = t.getBoundingClientRect(), sc = tScroller(t), lo = top, hi = window.innerHeight;
    if (sc) { var c = sc.getBoundingClientRect(); lo = Math.max(lo, c.top + 2); hi = Math.min(hi, c.bottom - 2); }
    var d = 0; if (r.top < lo) d = r.top - lo; else if (r.bottom > hi) d = r.bottom - hi;
    if (r.height > hi - lo && r.top >= lo) return;   // taller than the panel: its top is in view, that is the best we can do
    if (!d) return;
    if (sc) sc.scrollTop += d; else window.scrollBy(0, d);
  }
}
// while a step waits for its tap, only its target (and the header) takes taps; a tap elsewhere pulses the target instead
document.addEventListener('click', function (e) {
  if (!coachOn()) return;
  var s = coachStep(); if (!s || COACH.entered !== COACH.i) return;
  var t = s.t(); if (!t) return;
  if (s.info && t.contains(e.target)) { e.stopPropagation(); e.preventDefault(); COACH.tapped = true; setTimeout(coachTick, 0); return; }   // a "see" step: the tap only advances, never opens the card
  if (!coachReady(s)) return;
  if (t.contains(e.target)) {
    if (s.info) { e.stopPropagation(); e.preventDefault(); COACH.tapped = true; setTimeout(coachTick, 0); }
    else setTimeout(coachTick, 0);
    return;
  }
  if (e.target.closest && e.target.closest('[data-coach-next],.gx-bar,header,#menubtn,#rulesbtn,.gx-drawer,.gx-sheet-x,#pop')) return;   // a card zoom can always be closed
  e.stopPropagation(); e.preventDefault();
  try { nope(t, 'Tap here'); } catch (e) { }   // a wrong tap: the glowing thing shakes and says where
  t.classList.remove('tutpulse'); void t.offsetWidth; t.classList.add('tutpulse'); t.setAttribute('data-nudge', ((t.getAttribute('data-nudge') || '') + '.').slice(-60));   // the pulse is the answer to a stray tap; a changing attribute makes it a visible change for the audit
}, true);
// effects as they play (flow.js calls this for every event): remember which row actions you took
function coachFx(e, mine) {
  if (!coachOn()) return;
  if (e.k === 'action' && mine) COACH.acted[['food', 'eggs', 'cards'][e.h]] = 1;
}
function coachState() { if (coachOn()) coachTick(); }
function coachRate() { }
function coachRules() { return TSTEPS.map(function (s) { return s.id; }); }
// end of the guided game: the score walked through with the real numbers (the result steps point at these lines)
function coachResultHTML(sc, me) {
  var s = sc[me], p = G.pl[me], nb = PP.birds(p).length, eggs = PP.birds(p).reduce(function (a, x) { return a + x.s.eggs; }, 0);
  var rows = [
    ['birds', 'Birds', s.birds, 'the points printed on your ' + nb + ' bird' + (nb === 1 ? '' : 's')],
    ['eggs', 'Eggs', s.eggs, eggs + ' egg' + (eggs === 1 ? '' : 's') + ', 1 point each'],
    ['goals', 'Round goal', s.goals, 'most grassland birds at round end'],
    ['bonus', 'Bonus card', s.bonus, 'your secret card; gold-edged birds add to it'],
    ['cache', 'Stored food', s.cache, '1 point each'],
    ['tuck', 'Tucked cards', s.tuck, '1 point each']
  ];
  return '<div class="walk"><b>Your score, rule by rule</b><ol>' + rows.map(function (r) { return '<li data-k="' + r[0] + '"><span>' + esc(r[1]) + '</span><b>' + r[2] + '</b><small>' + esc(r[3]) + '</small></li>'; }).join('') +
    '<li class="tot"><span>Total</span><b>' + s.total + '</b><small>A tie? Most unused food wins.</small></li></ol></div>';
}

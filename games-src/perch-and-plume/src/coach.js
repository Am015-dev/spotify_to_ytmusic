// ===================== the coached first game (tutorial): a real 2-round game vs Pip with free choices from turn 1.
// Aunt Ottilie explains each rule the first time it matters (rule ids = TUTORIAL-COVERAGE.md), says one line on a good or poor move,
// and on what Pip does. One bubble at a time, never blocks a tap (only its x button takes taps), dismissable. Text: story.js STORY.coach.
var COACH = { on: false, done: {}, q: [], cur: null, t: 0, flags: {} };
function coachOn() { return COACH.on && G && UI.mode === 'tutfree'; }
function coachReset() { COACH.on = true; COACH.done = {}; COACH.q = []; COACH.flags = {}; coachHide(); }
function coachHide() { clearTimeout(COACH.t); if (COACH.cur && COACH.cur.parentNode) COACH.cur.parentNode.removeChild(COACH.cur); COACH.cur = null; }
// explain a rule once (id from STORY.coach), or say a one-off line (id starting with '!')
function coach(id, extra) {
  if (!coachOn()) return;
  if (id[0] !== '!') { if (COACH.done[id]) return; COACH.done[id] = 1; }
  var t = id[0] === '!' ? id.slice(1) : STORY.coach[id]; if (!t) return;
  COACH.q.push({ id: id, text: t + (extra ? ' ' + extra : '') });
  if (!COACH.cur) coachNext();
}
function coachNext() {
  coachHide(); var it = COACH.q.shift(); if (!it) return;
  var d = document.createElement('div'); d.className = 'coachb'; d.setAttribute('role', 'status'); d.setAttribute('aria-live', 'polite'); d.dataset.rule = it.id;
  d.innerHTML = faceHTML('ottilie', STORY.cast.ottilie) + '<span class="saytx"><b>Aunt Ottilie</b>' + esc(it.text) + '</span><button type="button" class="coachx" aria-label="Dismiss">×</button>';
  d.querySelector('.coachx').addEventListener('click', function (e) { e.stopPropagation(); coachNext(); });
  var host = document.getElementById('dockbody'); if (host) host.insertBefore(d, host.firstChild); else document.body.appendChild(d); COACH.cur = d;   // in the panel, above the instruction bar: it never covers the board
  var ms = UI.fast ? 400 : Math.max(4200, it.text.length * 55);
  COACH.t = setTimeout(coachNext, ms);
}
// effects as they play (called from playFx for every event)
function coachFx(e, mine) {
  if (!coachOn()) return;
  var me = UI.view;
  switch (e.k) {
    case 'action':
      if (mine) { coach(['food', 'eggs', 'cards'][e.h]); if (e.h === 2 && G.pl[me].hand.length >= 6) coach('!' + STORY.coachMove.poorDraw); }
      else { coach('rival', G.pl[e.seat].name + ' used the ' + HABN[e.h] + '.'); }
      break;
    case 'chainStart': if (mine && e.n >= 1) coach('chain'); break;
    case 'pw':
      if (e.pink) coach('pink');
      else if (mine && (/cache|tuck/.test(e.txt || ''))) coach('cache');
      break;
    case 'play':
      if (mine) {
        var pw = PP.power(e.id); if (pw.col === 'white') coach('white');
        if (!COACH.flags.played) { COACH.flags.played = 1; coach('!' + STORY.coachMove.goodPlay); }
      } else coach('rival', G.pl[e.seat].name + ' played a bird.');
      break;
    case 'roll': coach('feederRoll'); break;
    case 'goal': coach('goal'); break;
    case 'round': coach('round'); break;
  }
}
// state checks after each render (what the player is being asked right now)
function coachState() {
  if (!coachOn() || !myTurn()) return;
  var Q = G.q;
  if (!COACH.done.welcome) coach('welcome');
  if (UI.sel != null) coach('play');
  if (UI.pend) coach('pay');
  if (Q && Q.h === 'die') coach('feeder');
  if (Q && Q.h === 'egg') coach('nest');
  if (Q && Q.h === 'draw') coach('tray');
  if (Q && Q.h === 'bonus') coach('trade');
  if (Q && (Q.h === 'pwTuck' || Q.h === 'pwTrade' || Q.h === 'play2')) coach('choice');
  if (!Q && PP.allSame(G)) coach('reroll');
  if (!Q && G.pl[UI.view].hand.length === 0) coach('emptyHand');
}
function coachRules() { return Object.keys(STORY.coach); }
// end of the coached game: the score walked through rule by rule with the real numbers, then "Things you'll meet later"
function coachResultHTML(sc, me) {
  var s = sc[me], p = G.pl[me], nb = PP.birds(p).length, eggs = PP.birds(p).reduce(function (a, x) { return a + x.s.eggs; }, 0);
  ['final', 'tie'].forEach(function (k) { COACH.done[k] = 1; });
  var rows = [
    ['Birds', s.birds, 'the points printed on your ' + nb + ' bird' + (nb === 1 ? '' : 's')],
    ['Eggs', s.eggs, eggs + ' egg' + (eggs === 1 ? '' : 's') + ', 1 point each'],
    ['Round goals', s.goals, 'from the goal judged at the end of each round'],
    ['Bonus card', s.bonus, 'your secret card\'s condition'],
    ['Cached food', s.cache, '1 point for each food stored on a bird'],
    ['Tucked cards', s.tuck, '1 point for each card tucked behind a bird']
  ];
  var later = coachRules().filter(function (k) { return !COACH.done[k]; });
  var h = '<div class="walk"><b>Your score, rule by rule</b><ol>' + rows.map(function (r) { return '<li><span>' + esc(r[0]) + '</span><b>' + r[1] + '</b><small>' + esc(r[2]) + '</small></li>'; }).join('') +
    '<li class="tot"><span>Total</span><b>' + s.total + '</b><small>' + esc(STORY.coach.tie) + '</small></li></ol></div>';
  if (later.length) h += '<div class="later" data-later="' + later.join(',') + '"><b>Things you\'ll meet later</b><ul>' + later.map(function (k) { return '<li data-rule="' + k + '">' + esc(STORY.coach[k]) + '</li>'; }).join('') + '</ul></div>';
  return h;
}

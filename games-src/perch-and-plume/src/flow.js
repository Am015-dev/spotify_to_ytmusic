// ===================== part 2: input, moves, the animated power chain, computer turns, hot-seat, save =====================
var SAVE_KEY = 'pp-save';
function tutGate(a) { return typeof tutAct === 'function' ? tutAct(a) : true; }
document.addEventListener('click', function (e) {   // a tap while the rival plays skips the rest of its steps (x25) until your next turn
  if (G && G.phase === 'play' && !isHuman(PP.sideToAct(G)) && humans().length) UI.speed = 25;
}, true);
document.addEventListener('click', function (e) {
  var t = e.target.closest('[data-a]'); if (!t) return;
  var a = t.dataset.a, s = +t.dataset.s, h = +t.dataset.h, c = +t.dataset.c, i = +t.dataset.i;
  if (a === 'popx') { $('#pop').hidden = true; return; }
  if (a === 'opp') { openOpp(s); return; }
  if (!G) return;
  var mine = myTurn(), Q = G.q, p = G.pl[UI.view];
  // your choice is pending but your birds are still animating: keep the tap and apply it the moment they finish (never a dead tap)
  if (!mine && UI.busy && (Q || /^(ract|slot|playgo|a4|hand)$/.test(a)) && G.phase !== 'over' && !UI.passing && PP.sideToAct(G) === UI.view && isHuman(UI.view) && /^(die|tray|deck|bird|hand|mv|ract|slot|playgo|a4)$/.test(a) && !t.closest('#pop')) {
    var sel = '[data-a="' + a + '"]' + ['i', 'h', 'c', 'm', 'k'].map(function (k) { return t.dataset[k] != null ? '[data-' + k + '="' + String(t.dataset[k]).replace(/["\\]/g, '\\$&') + '"]' : ''; }).join(''), n = 0;
    t.classList.remove('tutpulse'); void t.offsetWidth; t.classList.add('tutpulse');
    (function later() { if (UI.busy && n++ < 60) { setTimeout(later, 80); return; } var x = myTurn() && document.querySelector(sel); if (x) x.click(); })();
    return;
  }
  sfx('tap');
  if (a === 'zoom') { showCard(p.hand[i]); return; }
  if (a === 'die' && !(mine && Q && Q.h === 'die')) { toast('Feeder: ' + (G.feeder[i] === 'gs' ? 'grub or seed' : G.feeder[i]) + ' die. Get food takes dice from here.', 0, 1); return; }
  if (a === 'deck' && !(mine && Q && Q.h === 'draw')) { toast('Deck: ' + G.deck.length + ' birds. Draw birds takes from here or the tray.', 0, 1); return; }
  if (a === 'tray' && G.tray[i] && !(mine && Q && Q.h === 'draw')) { showCard(G.tray[i]); return; }
  if (!mine) {   // not deciding: taps just show the card
    if (a === 'bird') showCard(p.board[h][c].id, p.board[h][c]);
    else if (a === 'hand') showCard(p.hand[i]);
    else if (a === 'tray' && G.tray[i]) showCard(G.tray[i]);
    return;
  }
  if (a === 'cancel') { if (!tutGate({ type: 'tap', what: 'cancel' })) return; UI.sel = null; UI.pend = null; UI.gsDie = null; UI.pickBird = false; render(); return; }
  if (a === 'mv') { var m = JSON.parse(t.dataset.m); if (!tutGate(Object.assign({ type: 'tap', what: 'mv' }, m))) return; UI.gsDie = null; human(m); return; }
  if (a === 'playgo') { if (!tutGate({ type: 'tap', what: 'playgo' })) return; var inf = PP.playInfo(G, UI.view, p.hand[UI.pend.i], UI.pend.h, Q && Q.h === 'play2' ? Q.d.hab : null); var mv = { t: 'play', i: UI.pend.i, id: p.hand[UI.pend.i], h: UI.pend.h, pay: inf.pays[UI.pend.k % inf.pays.length] }; UI.pend = null; UI.sel = null; human(mv); return; }
  if (a === 'paycycle') { UI.pend.k++; render(); return; }
  if (!Q) {
    if (a === 'ract') { if (UI.sel != null) { UI.sel = null; } if (!tutGate({ type: 'tap', what: 'ract', h: h })) return; human({ t: 'act', a: ['food', 'eggs', 'cards'][h] }); return; }
    if (a === 'hand') {
      if (!PP.playable(G, UI.view).some(function (x) { return x.i === i; })) { showCard(p.hand[i], null, ''); toast(whyCant(p.hand[i])); return; }
      if (!tutGate({ type: 'tap', what: 'hand', i: i, id: p.hand[i] })) return;
      UI.sel = UI.sel === i ? null : i; render(); return;
    }
    if (a === 'slot' && UI.sel != null) { if (!PP.playInfo(G, UI.view, p.hand[UI.sel], h)) return; if (!tutGate({ type: 'tap', what: 'slot', h: h })) return; UI.pend = { i: UI.sel, h: h, k: 0 }; render(); return; }
    if (a === 'bird') { showCard(p.board[h][c].id, p.board[h][c]); return; }
    if (a === 'tray' && G.tray[i]) { showCard(G.tray[i]); return; }
    return;
  }
  var legal = PP.validMoves(G, UI.view), pick = function (f) { return legal.find(f); };
  var m2 = null;
  switch (Q.h) {
    case 'die': if (a === 'die') { var d = G.feeder[i]; if (d === 'gs') { if (!tutGate({ type: 'tap', what: 'die', i: i, f: 'gs' })) return; UI.gsDie = i; render(); return; } m2 = pick(function (m) { return m.t === 'die' && m.i === i; }); } break;
    case 'egg': if (a === 'bird') m2 = pick(function (m) { return m.t === 'egg' && m.h === h && m.c === c; }); break;
    case 'draw': if (a === 'tray') m2 = pick(function (m) { return m.t === 'tray' && m.i === i; }); if (t.id === 'deckb') m2 = pick(function (m) { return m.t === 'deck'; }); break;
    case 'bonus': if (a === 'hand') m2 = pick(function (m) { return m.yes && m.i === i; }); if (a === 'bird') m2 = pick(function (m) { return m.yes && m.h === h && m.c === c; }); break;
    case 'pwTuck': if (a === 'hand') m2 = pick(function (m) { return m.t === 'tuck' && m.i === i; }); break;
    case 'pwTrade': if (a === 'bird') m2 = pick(function (m) { return m.t === 'trade' && m.h === h && m.c === c; }); break;
    case 'play2':
      if (a === 'hand' && legal.some(function (m) { return m.t === 'play' && m.i === i; })) { UI.sel = UI.sel === i ? null : i; render(); return; }
      if (a === 'slot' && UI.sel != null && legal.some(function (m) { return m.t === 'play' && m.i === UI.sel && m.h === h; })) { UI.pend = { i: UI.sel, h: h, k: 0 }; render(); return; }
      break;
  }
  if (!m2) { if (a === 'bird') showCard(p.board[h][c].id, p.board[h][c]); else if (a === 'tray' && G.tray[i]) showCard(G.tray[i]); return; }
  if (!tutGate(Object.assign({ type: 'tap', what: a }, m2))) return;
  human(m2);
});
$('#deckb').dataset.a = 'deck';
(function () { var pp = $('#pop'); new MutationObserver(function () { if (!pp.hidden) pp._t = Date.now(); }).observe(pp, { attributes: true, attributeFilter: ['hidden'] }); })();
$('#pop').addEventListener('click', function (e) { if (Date.now() - (e.currentTarget._t || 0) < 450) return; if (!e.target.closest('.acts button')) e.currentTarget.hidden = true; });   // tap anywhere on the big card to close it (not a tap that began before it opened)   // tap anywhere on the big card to close it
function whyCant(id) {
  var b = B[id], p = G.pl[UI.view];
  var room = [0, 1, 2].filter(function (h) { return b.h.indexOf(HABC[h]) >= 0 && p.board[h].length < 5; });
  if (!room.length) return 'No room in its habitat.';
  if (!room.some(function (h) { return PP.eggsOn(p) >= PP.EGGCOST[p.board[h].length]; })) return 'Not enough eggs to pay for that column.';
  return 'Not enough food for ' + b.n + '.';
}
function human(m) {
  var s = UI.view, Q = G.q;
  try { if (window.GX && GX.undo && GX.undo.snap) { } } catch (e) { }
  try { rateChoice(m); } catch (e) { }
  apply(m, s);
}
function setSlot(h, c, st) {   // redraw one bird on the shown board (used to reveal each power's result as that bird fires)
  var el = $('.bc[data-a="bird"][data-h="' + h + '"][data-c="' + c + '"]'); if (!el || !st) return null;
  el.outerHTML = cardHTML(st.id, 'slot', st, 'data-a="bird" data-h="' + h + '" data-c="' + c + '" role="button" tabindex="0"');
  return $('.bc[data-a="bird"][data-h="' + h + '"][data-c="' + c + '"]');
}
function apply(m, s) {
  var pre = PP.clone(G.pl[UI.view].board);
  var r = PP.performMove(G, m, s);
  if (!r.ok) { toast('Not allowed: ' + r.err, 0, 1); render(); return false; }
  var fx = G.fx.slice(); G.fx = [];
  if (isHuman(s)) UI.lastHuman = s;
  save(); render();
  if (!UI.fast) fx.forEach(function (e) { if (e.k === 'pw' && e.seat === UI.view && pre[e.h] && pre[e.h][e.c] && pre[e.h][e.c].id === e.id) setSlot(e.h, e.c, pre[e.h][e.c]); });
  UI.busy = true; UI.animSeat = s; UI.animPw = fx.some(function (e) { return e.k === 'pw' && e.seat === s; }); $('#prompt').textContent = promptText(false);
  playFx(fx, s).then(function () { UI.busy = false; UI.animSeat = null; try { rateEnd(); } catch (e) { } render(); pump(); });
  return true;
}
// ---------------- the fx queue: each brown power fires bird by bird, right to left
function wait(ms) { return new Promise(function (r) { var t = setTimeout(r, ms); UI.timers.push(t); }); }
function slotEl(seat, h, c) { return seat === UI.view ? $('.bc[data-a="bird"][data-h="' + h + '"][data-c="' + c + '"]') : $('.opp[data-s="' + seat + '"]'); }
function popAt(el, txt) {
  if (!el || !txt || UI.fast) return;
  var r = el.getBoundingClientRect(), d = document.createElement('div'); d.className = 'popfx'; d.textContent = txt; d.setAttribute('data-volatile', '');
  d.style.left = (r.left + r.width / 2) + 'px'; d.style.top = Math.max(60, r.top + 6) + 'px'; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 1150);
}
// a token (food icon, egg) flies from where it came from to where it lands: the action's beat
function flyFx(from, to, html) {
  if (!from || !to || UI.fast || !document.body.animate) return;
  var a = from.getBoundingClientRect(), b = to.getBoundingClientRect(); if (!a.width || !b.width) return;
  var d = document.createElement('div'); d.className = 'flyfx'; d.innerHTML = html; d.setAttribute('data-volatile', ''); d.setAttribute('aria-hidden', 'true');
  d.style.left = (a.left + a.width / 2 - 16) + 'px'; d.style.top = (a.top + a.height / 2 - 16) + 'px'; document.body.appendChild(d);
  var dx = b.left + Math.min(b.width / 2, 60) - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  var an = d.animate([{ transform: 'translate(0,0) scale(1.35)', opacity: 1 }, { transform: 'translate(' + dx * .5 + 'px,' + (dy * .5 - 40) + 'px) scale(1.15)', opacity: 1, offset: .5 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.8)', opacity: .9 }], { duration: Math.max(260, aMs(560)), easing: 'cubic-bezier(.3,.6,.4,1)' });
  an.onfinish = function () { dropEl(d); to.classList.remove('bump'); void to.offsetWidth; to.classList.add('bump'); };
}
function playFx(list, actor) {
  var chain = Promise.resolve(), view = UI.view;
  list.forEach(function (e) {
    chain = chain.then(function () {
      var mine = e.seat === view;
      try { coachFx(e, mine); } catch (er) { }
      switch (e.k) {
        case 'action': {
          sfx('act');
          if (mine) { var b = $('.ract[data-h="' + e.h + '"]'); if (b) { b.classList.add('fire'); setTimeout(function () { b.classList.remove('fire'); }, 700); } return wait(aMs(300)); }
          var o = $('.opp[data-s="' + e.seat + '"]'); if (o) o.classList.add('pulse');
          caption(G.pl[e.seat].name + ' uses the ' + HABN[e.h] + ': ' + (e.h === 0 ? '+' + e.n + ' food' : e.h === 1 ? '+' + e.n + (e.n === 1 ? ' egg' : ' eggs') : '+' + e.n + (e.n === 1 ? ' card' : ' cards')));
          return wait(aMs(850)).then(function () { if (o) o.classList.remove('pulse'); });
        }
        case 'chainStart': {
          if (!mine || e.n < 1) { if (e.n >= 2 && !mine) { caption(G.pl[e.seat].name + "'s " + HABN[e.h] + ': ' + e.n + ' birds use their powers'); return wait(aMs(700)); } return; }
          var row = $('.row[data-h="' + e.h + '"]');
          if (row && !UI.fast) { var rr = row.getBoundingClientRect(), d = document.createElement('div'); d.className = 'chainline'; d.style.cssText = 'left:' + rr.left + 'px;top:' + rr.top + 'px;width:' + rr.width + 'px;height:' + rr.height + 'px'; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 1250); }
          if (e.n >= 1) caption('Your ' + HABN[e.h] + ' birds use their powers, right to left');
          return wait(aMs(350));
        }
        case 'pw': {
          var el = mine ? (setSlot(e.h, e.c, G.pl[view].board[e.h][e.c]) || slotEl(e.seat, e.h, e.c)) : slotEl(e.seat, e.h, e.c);
          if (el && mine) { el.classList.remove('firing'); void el.offsetWidth; el.classList.add('firing'); }
          sfx(e.pink ? 'pink' : 'chirp');
          popAt(el, (e.pink ? 'Between turns: ' : '') + (mine ? '' : B[e.id].n + ': ') + e.txt);
          if (!mine) caption(G.pl[e.seat].name + "'s " + B[e.id].n + ': ' + e.txt);
          return wait(aMs(mine ? 750 : 700));
        }
        case 'pwAsk': { var el2 = slotEl(e.seat, e.h, e.c); if (el2 && mine) el2.classList.add('firing'); return wait(aMs(250)); }
        case 'play': {
          sfx('play');
          if (mine) { var s2 = slotEl(e.seat, e.h, e.c); if (s2) s2.classList.add('landed'); popAt(s2, '+' + B[e.id].p + (B[e.id].p === 1 ? ' point: ' : ' points: ') + B[e.id].n); return wait(aMs(650)); }
          caption(G.pl[e.seat].name + ' plays ' + B[e.id].n + ' in the ' + HABN[e.h] + ' (+' + B[e.id].p + ')');
          return reveal(e.id, G.pl[e.seat].name + ' plays', e.seat);
        }
        case 'food': if (mine) { flyFx((e.die != null && $('.die[data-i="' + e.die + '"]')) || $('#feeder'), $('#foodrow'), foodIcon(e.f)); popAt($('#foodrow'), '+' + (e.n || 1) + ' ' + e.f); } else if (e.die != null) caption(G.pl[e.seat].name + ' takes ' + e.f + ' from the feeder'); return wait(aMs(e.die != null ? (mine ? 300 : 650) : 0));
        case 'egg': if (mine) { flyFx($('.ract[data-h="1"]'), slotEl(e.seat, e.h, e.c), eggIcon()); popAt(slotEl(e.seat, e.h, e.c), '+1 egg = +1 point'); sfx('egg'); } return wait(aMs(mine ? 300 : 200));
        case 'roll': sfx('dice'); $$('.die').forEach(function (d) { d.classList.add('firing'); }); return wait(aMs(250));
        case 'goal': {
          var res = e.res, txt = 'Round ' + (e.r + 1) + ' goal (' + PP.GOL[res.gid].n + '): ' + res.pts.map(function (v, i) { return G.pl[i].name + ' ' + v; }).join(', ');
          toast(txt, 3600); sfx('goal'); return wait(aMs(900));
        }
        case 'round': toast('Round ' + (e.r + 1) + ': ' + G.cubes[e.r] + ' actions each. Goal: ' + PP.GOL[G.goals[e.r]].n, 3200); return wait(aMs(500));
        case 'auto': { var o2 = $('.opp[data-s="' + e.seat + '"]'); if (o2) o2.classList.add('pulse'); caption(G.pl[e.seat].name + ' ' + e.txt); return wait(aMs(850)).then(function () { if (o2) o2.classList.remove('pulse'); }); }
        case 'bonusTrade': return;
        case 'over': return;
      }
    });
  });
  return chain;
}
// ---------------- the turn engine: computer moves, hot-seat hand-over, game over
function aiDelay() { if (UI.fast) return 30; var sp = spd(); try { return Math.round((GX.aiDelay ? GX.aiDelay(850) : 850) / sp); } catch (e) { return 850; } }
// one plain line saying what is happening now (rival steps), shown in the instruction bar and as a pill over the board
function caption(t) { UI.cap = t; var p = $('#prompt'); if (p) p.textContent = t; if (!UI.fast) toast(t, Math.round(1700 / spd())); }
function dropEl(x) { if (x && x.parentNode) x.parentNode.removeChild(x); }
// "Your turn" / "<Rival>'s turn" banner; the turn waits for it (~1 s), a tap skips it
function turnBanner(s) {
  if (UI.fast) { pump(); return; }
  var me = isHuman(s), solo = humans().length <= 1, nm = me ? (solo ? 'Your turn' : G.pl[s].name + "'s turn") : G.pl[s].name + "'s turn";
  $$('.turnban').forEach(dropEl);
  var d = document.createElement('div'); d.className = 'turnban ' + (me ? 'me' : 'rv'); d.setAttribute('data-volatile', ''); d.setAttribute('role', 'status');
  d.innerHTML = '<b>' + esc(nm) + '</b><span>' + esc(me ? G.pl[s].cubes + (G.pl[s].cubes === 1 ? ' action' : ' actions') + ' left this round' : 'Watch each step. Tap to skip.') + '</span>';
  document.body.appendChild(d); UI.busy = true;
  UI.cap = me ? null : G.pl[s].name + ' is choosing an action.'; render();
  var done = false, fin = function () { if (done) return; done = true; dropEl(d); UI.busy = false; pump(); };
  d.addEventListener('click', fin);
  var t = setTimeout(fin, aMs(me ? 600 : 800)); UI.timers.push(t);
}
// the rival's played bird is shown large for a moment, then shrinks away
function reveal(id, label, seat) {
  if (UI.fast) return Promise.resolve();
  var d = document.createElement('div'); d.className = 'reveal'; d.setAttribute('data-volatile', '');
  d.innerHTML = '<div class="rvl">' + esc(label) + '</div>' + cardHTML(id, 'hand', null, '');
  document.body.appendChild(d);
  return wait(aMs(1100)).then(function () { d.classList.add('out'); return wait(aMs(350)); }).then(function () { dropEl(d); });
}
function pump() {
  clearTimeout(UI.pumpT);
  if (!G || UI.busy) return;
  if (G.phase === 'over') { gameOver(); return; }
  var s = PP.sideToAct(G);
  if (G.phase === 'setup') { if (isHuman(s)) { if (humans().length > 1 && s !== UI.view) { askPass(s, function () { showKeep(s); }); return; } UI.view = s; showKeep(s); return; } apply(PPAI.setup(G, s), s); return; }
  if (!isHuman(s) && G.phase === 'play' && typeof coachHold === 'function' && coachHold()) { UI.pumpT = setTimeout(pump, 250); return; }   // tutorial: the rival waits while a "see" step is shown
  if (G.phase === 'play' && humans().length && !(typeof coachOn === 'function' && coachOn())) { if (isHuman(s)) UI.rvT0 = 0; else if (!UI.rvT0) UI.rvT0 = Date.now(); }   // start of the wait budget (see spd())
  var tk = s + ':' + G.round + ':' + G.pl[s].cubes;
  if (G.phase === 'play' && !G.q && UI.turnKey !== tk) { UI.turnKey = tk; var tut = typeof coachOn === 'function' && coachOn(); UI.speed = !isHuman(s) ? (tut ? 6 : (UI.rvT0 && UI.speed > 1 ? UI.speed : 1)) : (tut ? 2 : 1); turnBanner(s); return; }   // a skip tap lasts for the whole wait, not into your turn
  if (isHuman(s)) {
    if (s !== UI.view) { if (humans().length > 1) { askPass(s, function () { UI.view = s; render(); }); return; } UI.view = s; }
    render(); try { GX.showDock(); } catch (e) { } return;
  }
  render();
  UI.pumpT = setTimeout(function () {
    if (!G || UI.busy || PP.sideToAct(G) !== s || G.phase === 'over') return;
    var m = (typeof tutAIMove === 'function' && tutAIMove(s)) || PPAI.choose(G, s, G.pl[s].lvl);
    apply(m, s);
  }, aiDelay());
}
function askPass(s, then) { hideHelp();
  UI.passing = true; var el = $('#pass');
  el.innerHTML = '<h2>Pass to ' + esc(G.pl[s].name) + '</h2><p>Hand the device over. Your cards stay hidden until you tap.</p><div class="tmenu"><button type="button" class="btn big" id="passgo">I am ' + esc(G.pl[s].name) + '</button></div>';
  el.hidden = false; render();
  $('#passgo').onclick = function () { el.hidden = true; UI.passing = false; UI.view = s; then(); render(); };
}
function save() {
  if (!G || UI.mode === 'tutorial' || UI.mode === 'tutfree' || (window.GXS && GXS.on)) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ G: G, mode: UI.mode, camp: UI.camp ? UI.camp.id : null })); } catch (e) { }
  try { if (window.GNS) GNS.saved('perch-and-plume', G.phase !== 'over'); } catch (e) { }
}
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } try { if (window.GNS) GNS.saved('perch-and-plume', false); } catch (e) { } }
function loadSave() { try { var s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); return s && s.G && s.G.phase !== 'over' && !s.camp ? s : null; } catch (e) { return null; } }
function stopTimers() { try { coachHide(); COACH.on = false; } catch (e) { } $$('.turnban,.reveal').forEach(dropEl); UI.turnKey = null; clearTimeout(UI.pumpT); UI.timers.forEach(clearTimeout); UI.timers = []; UI.busy = false; }
// ---------------- start a game
// o: {seats:[{name,kind,lvl}], mode, seed, twist, camp, hands, cubes, rounds, tutorial}
function startGame(o) {
  stopTimers();
  G = PP.newGame({ seats: o.seats, seed: o.seed, twist: o.twist, hands: o.hands, cubes: o.cubes, rounds: o.rounds, tutorial: o.tutorial, goals: o.goals, first: o.first });
  if (o.prep) o.prep(G);
  G.pl.forEach(function (p, i) { p.face = o.seats[i].face || (p.kind === 'human' ? 'you' : null); });
  UI.mode = o.mode || 'vs'; UI.camp = o.camp || null; UI.sel = null; UI.pend = null; UI.gsDie = null; UI.view = Math.max(0, humans()[0] || 0); UI.started = Date.now();
  ['title', 'setup', 'result', 'pass'].forEach(function (id) { $('#' + id).hidden = true; });
  $('#pop').hidden = true;
  try { GX.close(); } catch (e) { }
  render(); save(); musicSync();
  pump();
}
function resume(s) { stopTimers(); G = s.G; UI.mode = s.mode || 'vs'; UI.camp = null; UI.view = Math.max(0, humans()[0] || 0); ['title', 'setup', 'result', 'pass'].forEach(function (id) { $('#' + id).hidden = true; }); render(); pump(); }

// the shared Menu's section chips only scroll: mark the chosen one so the tap shows
document.addEventListener('click', function (e) { var c = e.target.closest && e.target.closest('.gx-set-nav .gx-chip'); if (!c) return; $$('.gx-set-nav .gx-chip').forEach(function (x) { if (x !== c) x.removeAttribute('data-on'); }); c.setAttribute('data-on', ''); }, true);

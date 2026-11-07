// ===================== part 2: input, moves, the animated power chain, computer turns, hot-seat, save =====================
var SAVE_KEY = 'pp-save';
function tutGate(a) { return typeof tutAct === 'function' ? tutAct(a) : true; }
document.addEventListener('click', function (e) {
  var t = e.target.closest('[data-a]'); if (!t) return;
  var a = t.dataset.a, s = +t.dataset.s, h = +t.dataset.h, c = +t.dataset.c, i = +t.dataset.i;
  if (a === 'popx') { $('#pop').hidden = true; return; }
  if (a === 'opp') { openOpp(s); return; }
  if (!G) return;
  var mine = myTurn(), Q = G.q, p = G.pl[UI.view];
  sfx('tap');
  if (a === 'zoom') { showCard(p.hand[i]); return; }
  if (a === 'die' && !(mine && Q && Q.h === 'die')) { toast('Feeder: ' + (G.feeder[i] === 'gs' ? 'grub or seed' : G.feeder[i]) + ' die. Your forest takes food from here.'); return; }
  if (a === 'deck' && !(mine && Q && Q.h === 'draw')) { toast('Deck: ' + G.deck.length + ' birds. Your wetland draws from here or the tray.'); return; }
  if (a === 'tray' && G.tray[i] && !(mine && Q && Q.h === 'draw')) { var tb = B[G.tray[i]]; toast(tb.n + ': ' + tb.p + ' pts. ' + PP.power(tb.id).txt, 3600); return; }
  if (!mine) {   // not deciding: taps just show the card
    if (a === 'bird') showCard(p.board[h][c].id, p.board[h][c]);
    else if (a === 'hand') showCard(p.hand[i]);
    else if (a === 'tray' && G.tray[i]) showCard(G.tray[i]);
    return;
  }
  if (a === 'cancel') { if (!tutGate({ type: 'tap', what: 'cancel' })) return; UI.sel = null; UI.pend = null; UI.gsDie = null; render(); return; }
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
$('#pop').addEventListener('click', function (e) { if (e.target.id === 'pop') e.currentTarget.hidden = true; });
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
  if (!r.ok) { toast('Not allowed: ' + r.err); render(); return false; }
  var fx = G.fx.slice(); G.fx = [];
  if (isHuman(s)) UI.lastHuman = s;
  save(); render();
  if (!UI.fast) fx.forEach(function (e) { if (e.k === 'pw' && e.seat === UI.view && pre[e.h] && pre[e.h][e.c] && pre[e.h][e.c].id === e.id) setSlot(e.h, e.c, pre[e.h][e.c]); });
  UI.busy = true; UI.animSeat = s; $('#prompt').textContent = promptText(false);
  playFx(fx, s).then(function () { UI.busy = false; UI.animSeat = null; render(); pump(); });
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
function playFx(list, actor) {
  var chain = Promise.resolve(), view = UI.view;
  list.forEach(function (e) {
    chain = chain.then(function () {
      var mine = e.seat === view;
      switch (e.k) {
        case 'action': {
          sfx('act');
          if (mine) { var b = $('.ract[data-h="' + e.h + '"]'); if (b) { b.classList.add('fire'); setTimeout(function () { b.classList.remove('fire'); }, 700); } return wait(aMs(300)); }
          var o = $('.opp[data-s="' + e.seat + '"]'); if (o) o.classList.add('pulse');
          toast(G.pl[e.seat].name + ': ' + (e.h === 0 ? 'gains food' : e.h === 1 ? 'lays eggs' : 'draws cards') + ' (+' + e.n + ')', 1800);
          return wait(aMs(500)).then(function () { if (o) o.classList.remove('pulse'); });
        }
        case 'chainStart': {
          if (!mine || e.n < 1) { if (e.n >= 2 && !mine) toast(G.pl[e.seat].name + "'s " + HABN[e.h] + ': ' + e.n + ' birds fire', 1800); return; }
          var row = $('.row[data-h="' + e.h + '"]');
          if (row && !UI.fast) { var rr = row.getBoundingClientRect(), d = document.createElement('div'); d.className = 'chainline'; d.style.cssText = 'left:' + rr.left + 'px;top:' + rr.top + 'px;width:' + rr.width + 'px;height:' + rr.height + 'px'; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 1250); }
          if (e.n >= 2) toast(e.n + ' birds fire, right to left!', 1600);
          return wait(aMs(350));
        }
        case 'pw': {
          var el = mine ? (setSlot(e.h, e.c, G.pl[view].board[e.h][e.c]) || slotEl(e.seat, e.h, e.c)) : slotEl(e.seat, e.h, e.c);
          if (el && mine) { el.classList.remove('firing'); void el.offsetWidth; el.classList.add('firing'); }
          sfx(e.pink ? 'pink' : 'chirp');
          popAt(el, (e.pink ? 'Between turns: ' : '') + (mine ? '' : B[e.id].n + ': ') + e.txt);
          return wait(aMs(mine ? 700 : 320));
        }
        case 'pwAsk': { var el2 = slotEl(e.seat, e.h, e.c); if (el2 && mine) el2.classList.add('firing'); return wait(aMs(250)); }
        case 'play': {
          sfx('play');
          if (mine) { var s2 = slotEl(e.seat, e.h, e.c); popAt(s2, B[e.id].p + ' points'); return wait(aMs(450)); }
          toast(G.pl[e.seat].name + ' plays ' + B[e.id].n + ' (' + HABN[e.h] + ')', 2200); return wait(aMs(500));
        }
        case 'food': if (mine && e.die == null) popAt($('#foodrow'), '+' + e.n + ' ' + e.f); return wait(aMs(e.die != null ? 120 : 0));
        case 'egg': if (mine) { popAt(slotEl(e.seat, e.h, e.c), '+1 egg'); sfx('egg'); } return wait(aMs(120));
        case 'roll': sfx('dice'); $$('.die').forEach(function (d) { d.classList.add('firing'); }); return wait(aMs(250));
        case 'goal': {
          var res = e.res, txt = 'Round ' + (e.r + 1) + ' goal (' + PP.GOL[res.gid].n + '): ' + res.pts.map(function (v, i) { return G.pl[i].name + ' ' + v; }).join(', ');
          toast(txt, 3600); sfx('goal'); return wait(aMs(900));
        }
        case 'round': toast('Round ' + (e.r + 1) + ': ' + G.cubes[e.r] + ' actions each. Goal: ' + PP.GOL[G.goals[e.r]].n, 3200); return wait(aMs(500));
        case 'auto': { var o2 = $('.opp[data-s="' + e.seat + '"]'); if (o2) o2.classList.add('pulse'); toast(G.pl[e.seat].name + ' ' + e.txt, 2000); return wait(aMs(600)).then(function () { if (o2) o2.classList.remove('pulse'); }); }
        case 'bonusTrade': return;
        case 'over': return;
      }
    });
  });
  return chain;
}
// ---------------- the turn engine: computer moves, hot-seat hand-over, game over
function aiDelay() { if (UI.fast) return 30; try { return GX.aiDelay ? GX.aiDelay(650) : 650; } catch (e) { return 650; } }
function pump() {
  clearTimeout(UI.pumpT);
  if (!G || UI.busy) return;
  if (G.phase === 'over') { gameOver(); return; }
  var s = PP.sideToAct(G);
  if (G.phase === 'setup') { if (isHuman(s)) { if (humans().length > 1 && s !== UI.view) { askPass(s, function () { showKeep(s); }); return; } UI.view = s; showKeep(s); return; } apply(PPAI.setup(G, s), s); return; }
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
  if (!G || UI.mode === 'tutorial' || (window.GXS && GXS.on)) return;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify({ G: G, mode: UI.mode, camp: UI.camp ? UI.camp.id : null })); } catch (e) { }
  try { if (window.GNS) GNS.saved('perch-and-plume', G.phase !== 'over'); } catch (e) { }
}
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { } try { if (window.GNS) GNS.saved('perch-and-plume', false); } catch (e) { } }
function loadSave() { try { var s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); return s && s.G && s.G.phase !== 'over' && !s.camp ? s : null; } catch (e) { return null; } }
function stopTimers() { clearTimeout(UI.pumpT); UI.timers.forEach(clearTimeout); UI.timers = []; UI.busy = false; }
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

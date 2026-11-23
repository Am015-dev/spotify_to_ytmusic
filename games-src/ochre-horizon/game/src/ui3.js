// ===== part 3: game flow (moves, computer turns, feedback), sound, save =====
var AC = null;
function sfx(k) {
  if (!UI.sound) return;
  try {
    if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
    var t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain(); o.connect(g); g.connect(AC.destination);
    var P = { tick: [660, 0.05, 'square', 0.05], tile: [140, 0.25, 'sine', 0.35], raise: [300, 0.5, 'sawtooth', 0.12], card: [520, 0.12, 'triangle', 0.18], bad: [120, 0.2, 'square', 0.08], win: [440, 0.8, 'triangle', 0.2] }[k] || [440, 0.1, 'sine', 0.1];
    o.type = P[2]; o.frequency.setValueAtTime(P[0], t);
    if (k === 'raise' || k === 'win') o.frequency.exponentialRampToValueAtTime(P[0] * 2.4, t + P[1]);
    if (k === 'tile') o.frequency.exponentialRampToValueAtTime(60, t + P[1]);
    g.gain.setValueAtTime(P[3], t); g.gain.exponentialRampToValueAtTime(0.001, t + P[1]);
    o.start(t); o.stop(t + P[1] + 0.02);
  } catch (e) { }
}
function vib(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { } }
// one helper at a time (R99): coach bubbles and toasts share one queue; user-asked toasts jump the line
var HQ = [], HCUR = null;
function toast(html, me, ms, o) {
  o = o || {};
  var it = { html: html, me: me, ms: ms || 2400, key: o.key || '' };
  if (it.key) HQ = HQ.filter(function (x) { return x.key !== it.key; });
  if (o.drop) HQ = HQ.filter(function (x) { return o.drop.indexOf(x.key) < 0; });
  if (o.now) {
    if (HCUR && HCUR.coach) { $('coach').classList.remove('on'); clearTimeout(HCUR.tm); HQ.unshift(HCUR); HCUR = null; }
    else if (HCUR) helperEnd(true);
    HQ.unshift(it);
  } else { HQ.push(it); while (HQ.length > 4) HQ.splice(HQ.findIndex(function (x) { return !x.coach; }), 1); }
  helperNext();
}
function helperNext() {
  if (HCUR) return;
  var it = HQ.shift(); if (!it) return;
  HCUR = it;
  if (it.coach) {
    UI.coachDone[it.k] = 1; UI.coachKey = it.k;
    $('coachT').textContent = COACH[it.k]; $('coach').classList.add('on');
    if (it.k === 'goal' || it.k === 'bonus') ['gTemp', 'gOxy', 'gOcean'].forEach(function (g) { $(g).classList.remove('pulse'); void $(g).offsetWidth; $(g).classList.add('pulse'); });
    it.tm = setTimeout(function () { if (HCUR === it) coachHide(); }, 12000);
    return;
  }
  var d = document.createElement('div'); d.className = 'tst' + (it.me ? ' me' : ''); d.innerHTML = it.html;
  var box = $('toast'); box.innerHTML = ''; box.appendChild(d); it.el = d;
  it.tm = setTimeout(function () { if (HCUR === it) helperEnd(); }, it.ms);
}
function helperEnd(noNext) {
  if (!HCUR || HCUR.coach) return;
  clearTimeout(HCUR.tm); if (HCUR.el) HCUR.el.remove(); HCUR = null;
  if (!noNext) helperNext();
}
function floatAt(x, y, txt, col) {
  var d = document.createElement('div'); d.className = 'float'; d.textContent = txt; d.style.left = (x - 30) + 'px'; d.style.top = (y - 14) + 'px'; if (col) d.style.color = col;
  document.body.appendChild(d); setTimeout(function () { d.remove(); }, 1300);
}
function elCenter(id) { var e = $(id); if (!e) return [innerWidth / 2, innerHeight / 2]; var r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
// play out the engine's new events (tiles pop, gauges pulse, numbers float)
function playEvents() {
  var evs = G.ev, seen = UI.evSeen; UI.evSeen = evs.length;
  var logs = G.log.slice(UI.logSeen); UI.logSeen = G.log.length;
  var d = 0;
  for (var i = seen; i < evs.length; i++) (function (e) {
    setTimeout(function () {
      if (e.k === 'tile') {
        renderBoard();
        var g = document.querySelector('.hex[data-s="' + e.s + '"]'); if (g) g.classList.add('pop');
        var c = hexCenterPx(e.s); if (c && e.gains && e.gains.length) floatAt(c[0], c[1], '+' + e.gains.join(' +'));
        sfx('tile'); vib(18);
      } else if (e.k === 'temp' || e.k === 'oxy') {
        var gid = e.k === 'temp' ? 'gTemp' : 'gOxy'; $(gid).classList.remove('pulse'); void $(gid).offsetWidth; $(gid).classList.add('pulse');
        var c2 = elCenter(e.p === 0 ? 'syou' : 'sriv'); floatAt(c2[0], c2[1] + 20, '+1 rating'); sfx('raise');
      } else if (e.k === 'tr' && e.p >= 0) { var c3 = elCenter(e.p === 0 ? 'syou' : 'sriv'); floatAt(c3[0], c3[1] + 20, '+' + e.n + ' rating'); if ($('gOcean')) { $('gOcean').classList.remove('pulse'); void $('gOcean').offsetWidth; $('gOcean').classList.add('pulse'); } }
      else if (e.k === 'production') { toast('<b>Income!</b>Credits = credit production + rating', true, 2200, { key: 'inc' }); sfx('win'); }
    }, d);
    if (e.k === 'tile' || e.k === 'temp' || e.k === 'oxy') d += UI.AIDELAY > 100 ? 260 : 0;
  })(evs[i]);
  // rival lines become toasts
  var rl = logs.filter(function (l) { return l.p === 1; });
  if (rl.length) { UI.rivalLine = rl[rl.length - 1].s.replace(/\.$/, '').split(' ').slice(0, 8).join(' '); UI.rivalLines = (UI.rivalLines || []).concat(rl.map(function (l) { return l.s; })).slice(-6); }
  var pls = G.ev.slice(seen).filter(function (e) { return e.k === 'play' && e.p === 1; });
  pls.forEach(function (pl) { var c = OH.card(pl.id); toast('<b>Rival plays ' + esc(c.name) + '</b>' + esc(c.text), false, Math.max(2200, UI.AIDELAY * 2.2), { key: 'rv' + pl.id }); });
  return d;
}
function save() { if (!G || UI.scn) return; LS.set('oh_save', JSON.stringify({ G: OH.G, level: UI.level, tut: UI.tut, coach: UI.coachDone })); }
function doMove(m) {
  if (UI.busy && !m.force) return false;
  var ok = OH.performMove(m);
  if (!ok) { sfx('bad'); toast('That move is not allowed right now.', true, 2400, { now: true }); return false; }
  if (m.t === 'play') sfx('card');
  UI.sel = null; UI.tryTxt = null; UI.lastMove = m.t;
  var d = playEvents();
  render(); save();
  coachCheck(m);
  setTimeout(pump, Math.min(d, 600));
  return true;
}
var aiTimer = 0;
function pump() {
  if (!G) return;
  render();
  if (G.over) { showEnd(); return; }
  var p = OH.sideToAct();
  if (p === 1) {
    UI.busy = true; setHint('Rival is thinking…');
    clearTimeout(aiTimer);
    aiTimer = setTimeout(function () {
      var m = OHAI.decide(UI.level);
      UI.busy = false;
      if (!m) return;
      OH.performMove(m); var d = playEvents(); render(); save();
      aiTimer = setTimeout(pump, Math.max(UI.AIDELAY, d));
    }, UI.AIDELAY);
    return;
  }
  UI.busy = false;
  if (UI.autoZ && !(G.pending && G.pending.h === 'place')) { UI.autoZ = false; fitView(); }
  if (p !== 0) return;
  if (UI.rivalLines && UI.rivalLines.length && G.phase === 'action' && !G.pending) {
    var rvl = UI.rivalLines.slice(-4).map(function (s) { return s.replace(/^Rival /, '').replace(/\.$/, ''); });
    var drop = HQ.filter(function (x) { return /^rv/.test(x.key); }).map(function (x) { return x.key; });
    if (rvl.length === 1 && /^passed/.test(rvl[0])) toast('<b>Rival passed</b>It is out this round. Your turn again.', true, 3600, { key: 'sum', drop: drop });
    else toast('<b>Your turn. The rival:</b>' + rvl.map(esc).join('<br>') + (G.pl[1].passed ? '<br><b>Rival is out this round</b>' : ''), true, 4200, { key: 'sum', drop: drop });
  } else if (UI.lastMove === 'end' && G.pl[1].passed && G.phase === 'action' && !G.pending) toast('<b>Rival is out</b>Your turn again. Pass when you are done.', true, 2600, { key: 'out' });
  UI.lastMove = '';
  UI.rivalLine = ''; UI.rivalLines = [];
  if (G.pending) {
    if (G.pending.h === 'place') { closeModal(); closeSheet(); var pd = G.pending.d; var mapS = pd.spaces.filter(function (x) { return M.spaces[x]; }); if (mapS.length && hexPx() < 47) autoZoomPlace(mapS); else if (pd.spaces.length && UI.view.s > 1.05) focusSpace(pd.spaces[0]); coachShow('place'); return; }
    if (G.pending.h === 'choose') return showChoose();
    if (G.pending.h === 'pickres') return showPickRes();
  }
  if (G.phase === 'setup') return showSetup();
  if (G.phase === 'research') return showResearch();
  if (G.phase === 'draft') return showDraft();
  if (G.phase === 'final') return showFinal();
  if (G.phase === 'action') coachShow(G.gen === 1 && G.acts === 0 && !UI.coachDone.goal ? 'goal' : G.gen === 2 && !UI.coachDone.research2 ? 'research2' : 'turn');
}

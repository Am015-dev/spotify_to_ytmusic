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
function toast(html, me, ms) {
  var d = document.createElement('div'); d.className = 'tst' + (me ? ' me' : ''); d.innerHTML = html;
  var box = $('toast'); while (box.children.length > 1) box.removeChild(box.firstChild);
  box.appendChild(d); setTimeout(function () { d.remove(); }, ms || 2400);
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
      else if (e.k === 'production') { toast('<b>Income!</b>Credits = production + rating', true, 2200); sfx('win'); }
    }, d);
    if (e.k === 'tile' || e.k === 'temp' || e.k === 'oxy') d += UI.AIDELAY > 100 ? 260 : 0;
  })(evs[i]);
  // rival lines become toasts
  var rl = logs.filter(function (l) { return l.p === 1; });
  if (rl.length) { var pl = G.ev.slice(seen).filter(function (e) { return e.k === 'play' && e.p === 1; })[0]; toast((pl ? '<b>Rival: ' + esc(OH.card(pl.id).name) + '</b>' + esc(OH.card(pl.id).text) : '<b>Rival</b>') + (pl ? '' : esc(rl.map(function (l) { return l.s.replace(/^Rival /, ''); }).join(' '))), false, Math.max(2200, UI.AIDELAY * 2.2)); }
  return d;
}
function save() { if (!G || UI.scn) return; LS.set('oh_save', JSON.stringify({ G: OH.G, level: UI.level, tut: UI.tut, coach: UI.coachDone })); }
function doMove(m) {
  if (UI.busy && !m.force) return false;
  var ok = OH.performMove(m);
  if (!ok) { sfx('bad'); toast('That move is not allowed right now.', true); return false; }
  if (m.t === 'play') sfx('card');
  UI.sel = null;
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
  if (p !== 0) return;
  if (G.pending) {
    if (G.pending.h === 'place') { closeModal(); closeSheet(); var pd = G.pending.d; if (pd.spaces.length && UI.view.s > 1.05) focusSpace(pd.spaces[0]); coachShow('place'); return; }
    if (G.pending.h === 'choose') return showChoose();
    if (G.pending.h === 'pickres') return showPickRes();
  }
  if (G.phase === 'setup') return showSetup();
  if (G.phase === 'research') return showResearch();
  if (G.phase === 'draft') return showDraft();
  if (G.phase === 'final') return showFinal();
  if (G.phase === 'action') coachShow(G.gen === 1 && G.acts === 0 ? 'goal' : G.gen === 2 ? 'research2' : 'turn');
}

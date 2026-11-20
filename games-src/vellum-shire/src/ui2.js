// ui2: taps -> choices -> preview -> move; animations of every event; the computer's turn; game flow
UI.dieSel = null;
function curPend() { return G.pend[G.pend.length - 1] || null; }
function dieTxt(m) { if (m.die === -1) return 'free'; if (m.die === -2) return ''; return 'die ' + P(VSE.side(G)).dice[m.die]; }
function wTxt(w) { return w ? w + ' worker' + (w > 1 ? 's' : '') : ''; }
// what a move gives, from a dry run on a copy of the state
function preview(m) {
  var s = VSE.side(G), g = VSE.clone(G), a = g.p[s], b = G.p[s];
  VSE.apply(g, m);
  var out = [], dv = a.vp - b.vp, ds = a.silver - b.silver, dw = a.wk - b.wk + (m.w || 0);
  var gn = function (Pl) { return Pl.goods.reduce(function (x, y) { return x + y.n; }, 0); };
  var dg = gn(a) - gn(b);
  if (dv) out.push('+' + dv + ' points');
  if (ds > 0) out.push('+' + ds + ' silver');
  if (dw > 0) out.push('+' + dw + ' workers');
  if (dg > 0) out.push('+' + dg + ' goods');
  if (m.t === 'place' && T(G.p[s].sto[m.s]).col === 'K') out.push('free action');
  return out.join(', ');
}
function title(m) {
  var s = VSE.side(G), Pl = P(s);
  if (m.t === 'take' || m.t === 'grab') return 'Take ' + VS.tileName(T(m.tile));
  if (m.t === 'buy') return 'Buy ' + VS.tileName(T(m.tile)) + ' (2 silver)';
  if (m.t === 'place') return 'Place ' + VS.tileName(T(Pl.sto[m.s]));
  if (m.t === 'sell') { var e = Pl.goods.filter(function (x) { return x.d === m.v; })[0]; return 'Sell ' + (e ? e.n : 0) + ' ' + VS.GOODS[m.v].n; }
  if (m.t === 'work') return 'Take ' + (VSE.has(Pl, 'work4') ? 4 : 2) + ' workers';
  if (m.t === 'ship') return 'Load goods from stall ' + m.st + (m.st2 ? '+' + m.st2 : '');
  if (m.t === 'skip') return 'Skip';
  if (m.t === 'start') return 'Start keep here';
  return 'End turn';
}
// one option per die (the cheapest), disc variants kept aside
function optionsOf(ms) {
  var by = {};
  ms.forEach(function (m) { var k = m.die + ':' + (m.t === 'buy' ? 'b' : ''); if (!by[k] || (m.w || 0) < (by[k].w || 0)) by[k] = m; });
  var o = Object.keys(by).map(function (k) { return by[k]; });
  o.sort(function (a, b) { return (a.w || 0) - (b.w || 0) || (b.t === 'buy') - (a.t === 'buy'); });
  return o;
}
function select(kind, key) {
  var tg = UI.tg; if (!tg || !tg.any) return;
  if (UI.disc) return;
  var ms = (tg[kind] || {})[key]; if (!ms || !ms.length) return;
  if (UI.sel && UI.sel.kind === kind && UI.sel.key === key) { confirm(UI.sel.opts[0]); return; }
  UI.sel = { kind: kind, key: key, opts: optionsOf(ms), all: ms };
  sfx('tick');
  render();
  if (UI.sel.opts.length === 1 && (UI.sel.opts[0].t === 'work' || UI.sel.opts[0].t === 'ship') && !tutOn()) confirm(UI.sel.opts[0]);
}
function cancelSel() { UI.sel = null; UI.disc = null; UI.stoSel = -1; render(); }
function confirm(m) {
  if (!m) return;
  // storage full: ask which stored tile to drop
  if ((m.t === 'take' || m.t === 'buy' || m.t === 'grab') && m.disc != null) {
    UI.disc = UI.sel.all.filter(function (x) { return x.die === m.die && x.t === m.t && x.tile === m.tile; });
    render(); return;
  }
  doMove(m);
}
function tapTarget(kind, key) {
  if (UI.disc && kind === 'sto') { var m = UI.disc.filter(function (x) { return x.disc === key; })[0]; if (m) { UI.disc = null; doMove(m); } return; }
  select(kind, key);
}
// ---------- dock
function setPrompt(t) { $('#prompt').textContent = t; }
function renderDock(tg) {
  var det = '', acts = '', s = G.over ? -1 : VSE.side(G);
  if (G.over) { setPrompt(winText()); acts = '<button class="btn go" data-a="result">See scores</button>'; }
  else if (!isHuman(s) || UI.busy) { setPrompt(isHuman(s) ? 'Watch the board' : nameOf(s) + ' is playing'); }
  else if (UI.disc) { setPrompt('Storage full: tap a tile to drop'); acts = '<button class="btn" data-a="cancel">Cancel</button>'; }
  else if (UI.sel) {
    var o = UI.sel.opts, m0 = o[0];
    setPrompt(title(m0));
    var pv = preview(m0); if (pv) det = '<b>' + pv + '</b>';
    if ((m0.t === 'take' || m0.t === 'buy' || m0.t === 'grab') && !pv) det = 'To storage. Placed: ' + shortFx(T(m0.tile), 5);
    if (m0.t === 'place') { var t0 = T(P(s).sto[m0.s]); if (!pv && t0.col !== 'K') det = shortFx(t0); }
    acts = o.map(function (m, i) {
      var lbl = o.length === 1 ? 'Do it' : (m.die >= 0 ? 'Use ' : '') + (dieTxt(m) || 'Do it');
      return '<button class="btn' + (i === 0 ? ' go' : '') + '" data-a="opt" data-i="' + i + '">' + lbl + (m.w ? ' <small>' + wTxt(m.w) + '</small>' : '') + '</button>';
    }).join('') + '<button class="btn" data-a="cancel">Cancel</button>';
  } else {
    var pd = curPend(), Pl = P(s);
    if (G.pick) setPrompt('Pick a green space for your keep');
    else if (pd) setPrompt({ free: 'Keep: one free action, any die', ship: 'Barge: tap goods in a stall', grab: 'Take a ' + (pd.cols || []).map(function (c) { return COLNAME[c].toLowerCase(); }).join('/') + ' tile', hall: 'Guildhall: place one more tile', ware: 'Granary: tap goods to sell' }[pd.h]);
    else if (!Pl.used[0] && !Pl.used[1]) setPrompt(UI.dieSel != null ? 'Now tap a glowing spot' : 'Tap a die, then a glowing spot');
    else if (!Pl.used[0] || !Pl.used[1]) setPrompt('One die left');
    else setPrompt('Buy from the ink stall, or end');
    if (tg.skip) acts += '<button class="btn" data-a="skip">Skip</button>';
    if (tg.end) acts += '<button class="btn go" data-a="end">End turn</button>';
  }
  if (det && innerHeight < 620 && UI.sel) { $('#prompt').textContent += ': ' + det.replace(/<[^>]+>/g, '').replace(/^To storage\. Placed: .*/, 'to storage'); det = ''; }
  $('#detail').innerHTML = det; $('#acts').innerHTML = acts;
}
function shortFx(t, n) { n = n || 8; var f = VS.tileFx(t), w = f.split(' '); return w.length <= n ? f : w.slice(0, n - 1).join(' ').replace(/[,.:]$/, '') + '\u2026'; }
// ---------- input
function bindBoard() {
  document.addEventListener('click', function (e) {
    if (!G || !UI.started) return;
    var el = e.target.closest('[data-tile],[data-h],[data-goods],[data-ship],[data-work],[data-sto],[data-die],[data-view],[data-a]');
    if (!el || !el.closest('#bd,#dock')) return;
    if (el.dataset.view != null) { UI.view = +el.dataset.view; UI.sel = null; UI.stoSel = -1; sfx('tick'); render(); return; }
    if (el.dataset.a) return dockAct(el.dataset.a, el);
    if (UI.busy || G.over || !isHuman(VSE.side(G)) || UI.view !== VSE.side(G)) { if (el.dataset.die == null) return; }
    if (el.dataset.tile != null) return tapTarget('tile', +el.dataset.tile);
    if (el.dataset.h != null) return tapTarget('hex', +el.dataset.h);
    if (el.dataset.goods != null) return tapTarget('goods', +el.dataset.goods);
    if (el.dataset.ship != null) return tapTarget('ship', +el.dataset.ship);
    if (el.dataset.work != null) { if (UI.tg && UI.tg.work) { UI.tg.workM = { 1: UI.tg.work }; return selectWork(); } return; }
    if (el.dataset.sto != null) { var k = +el.dataset.sto; if (UI.disc) return tapTarget('sto', k); if (UI.tg && UI.tg.sto[k]) { UI.stoSel = UI.stoSel === k ? -1 : k; UI.sel = null; sfx('tick'); render(); } return; }
    if (el.dataset.die != null) { var i = +el.dataset.die; if (!UI.tg || !UI.tg.die[i]) return; UI.dieSel = UI.dieSel === i ? null : i; UI.sel = null; sfx('tick'); render(); }
  });
}
function selectWork() { var tg = UI.tg; tg.workers = { 1: tg.work }; select('workers', 1); }
function dockAct(a, el) {
  if (a === 'cancel') return cancelSel();
  if (a === 'opt') return confirm(UI.sel.opts[+el.dataset.i]);
  if (a === 'skip') return doMove({ t: 'skip' });
  if (a === 'end') return doMove({ t: 'end' });
  if (a === 'result') return showResult();
}
// die filter: after tapping a die, only moves with that die glow
var _targets = targets;
targets = function () {
  var tg = _targets();
  if (UI.dieSel == null || !tg.any || UI.disc) return tg;
  var keep = function (m) { return m.die === UI.dieSel || m.die < 0 || m.t === 'buy'; };
  ['tile', 'hex', 'goods', 'ship', 'sto'].forEach(function (k) { Object.keys(tg[k]).forEach(function (x) { tg[k][x] = tg[k][x].filter(keep); if (!tg[k][x].length) delete tg[k][x]; }); });
  if (tg.work) { tg.work = tg.work.filter(keep); if (!tg.work.length) tg.work = null; }
  return tg;
};
// ---------- doing a move
function rectOf(sel) { var e = $(sel); return e ? e.getBoundingClientRect() : null; }
function doMove(m) {
  if (!G || G.over) return;
  if (tutOn() && !tutAllow(m)) return;
  var s = VSE.side(G);
  var before = { stalls: {}, sto: {} };
  $$('[data-tile]').forEach(function (e) { before.stalls[e.dataset.tile] = e.getBoundingClientRect(); });
  $$('[data-sto]').forEach(function (e) { before.sto[e.dataset.sto] = e.getBoundingClientRect(); });
  var r = VSE.apply(G, m);
  if (!r.ok) { console.warn('illegal', m); return; }
  var evs = G.ev.slice();
  UI.sel = null; UI.disc = null; UI.stoSel = -1;
  if (m.die === 0 || m.die === 1) UI.dieSel = null;
  save();
  UI.busy = true;
  render();
  return playEvents(evs, before, s).then(function () { UI.busy = false; try { tutAfter(m); } catch (e) { } flow(); });
}
// ---------- animations
function pop(txt, x, y, gold) { if (!window.ANIM) return; var d = document.createElement('div'); d.className = 'pop' + (gold ? ' gold' : ''); d.textContent = txt; x = Math.max(70, Math.min(innerWidth - 70, x)); y = Math.max(70, Math.min(innerHeight - 40, y)); d.style.left = x + 'px'; d.style.top = y + 'px'; $('#fx').appendChild(d); setTimeout(function () { d.remove(); }, 1400); }
function popAt(sel, txt, gold) { var r = rectOf(sel); if (r) pop(txt, r.left + r.width / 2, r.top + r.height / 2, gold); }
function fly(fromR, toEl, html) {
  if (!window.ANIM || !fromR || !toEl) return later(0);
  var to = toEl.getBoundingClientRect(), d = document.createElement('div');
  d.className = 'fly'; d.innerHTML = html; d.style.width = fromR.width + 'px'; d.style.height = fromR.height + 'px';
  d.style.transform = 'translate(' + fromR.left + 'px,' + fromR.top + 'px)';
  $('#fx').appendChild(d);
  var vis = toEl.style.visibility; toEl.style.visibility = 'hidden';
  return new Promise(function (res) {
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      var sx = to.width / fromR.width;
      d.style.transform = 'translate(' + to.left + 'px,' + to.top + 'px) scale(' + sx.toFixed(3) + ')';
      setTimeout(function () { d.remove(); toEl.style.visibility = vis; res(); }, ams(560));
    }); });
  });
}
function banner(big, small) {
  var b = $('#banner'); b.innerHTML = '<div class="bi"><b>' + big + '</b>' + (small ? '<span>' + small + '</span>' : '') + '</div>';
  b.classList.remove('on'); void b.offsetWidth; if (window.ANIM) b.classList.add('on');
}
function playEvents(evs, before, s) {
  var p = Promise.resolve();
  var step = function (f, ms) { p = p.then(function () { f(); return later(ams(ms)); }); };
  evs.forEach(function (e) {
    if (e.e === 'take' || e.e === 'buy') p = p.then(function () { var to = UI.view === e.s ? $('[data-sto="' + e.slot + '"]') : $('.score .sc.' + (e.s === 0 ? 'me' : 'op')); sfx('take'); return fly(before.stalls[e.tile], to, tileSVG(T(e.tile))); });
    else if (e.e === 'place') step(function () { var g = $('[data-h="' + e.h + '"]'); if (g) g.classList.add('drop'); sfx('place'); GX.buzz && GX.buzz(12); }, 380);
    else if (e.e === 'vp') step(function () {
      var at = e.why === 'sell' ? '#goods' : (e.why === 'seal' ? '#estate' : null);
      var last = evs.filter(function (x) { return x.e === 'place'; })[0];
      if (!at && last && UI.view === e.s) at = '[data-h="' + last.h + '"]';
      popAt(at || '.score .sc.' + (e.s === 0 ? 'me' : 'op'), '+' + e.n, e.why === 'region');
      renderScore();
    }, 420);
    else if (e.e === 'region') step(function () {
      VSE.board(G.p[e.s]).regions[e.reg].cells.forEach(function (c) { var g = $('[data-gh="' + c + '"]'); if (g) { g.classList.remove('on'); void g.getBBox; g.classList.add('on'); } });
      sfx('gild'); banner('Region complete!', '+' + e.n + ' and +' + e.bonus + ' chapter bonus');
    }, 1100);
    else if (e.e === 'seal') step(function () { sfx('gild'); banner('Gilded seal!', COLNAME[e.col] + ' all filled: +' + (e.big ? VS.BIG_BONUS : VS.SMALL_BONUS)); }, 1100);
    else if (e.e === 'sell') step(function () { sfx('coin'); popAt('[data-silver]', '+' + e.silver + ' silver'); }, 300);
    else if (e.e === 'load') step(function () { sfx('coin'); popAt('#goods', '+' + e.n + ' goods'); }, 350);
    else if (e.e === 'workers' && e.n > 0) step(function () { popAt('[data-work]', '+' + e.n); }, 220);
    else if (e.e === 'silver' && e.why !== 'quarry') step(function () { popAt('[data-silver]', '+' + e.n + ' silver'); }, 220);
    else if (e.e === 'track') step(function () { popAt('#estate', 'Barge: you go first next round'.replace('you go', e.s === 0 ? 'you go' : nameOf(e.s) + ' goes')); }, 300);
    else if (e.e === 'drop') step(function () { }, 0);
    else if (e.e === 'phase') step(function () { banner('Chapter ' + VS.CHAPTERS[e.ph], 'New tiles in every stall'); sfx('gild'); }, e.ph ? 1500 : 0);
    else if (e.e === 'round') step(function () { $$('.die').forEach(function (d) { d.classList.remove('roll'); void d.offsetWidth; d.classList.add('roll'); }); sfx('roll'); popAt('[data-st="' + e.white + '"] .sh', '+goods'); }, 650);
  });
  return p;
}
// ---------- flow
function flow() {
  if (!G) return;
  if (G.over) { UI.view = 0; render(); setTimeout(function () { if (G && G.over) showResult(); }, ams(900)); return; }
  var s = VSE.side(G);
  if (!isHuman(s)) { if (UI.view !== s) { UI.view = s; } render(); clearTimeout(UI.aiT); UI.aiT = setTimeout(aiStep, aiDelay()); return; }
  if (UI.mode !== 'hot' && UI.view !== s) { UI.busy = true; render(); setTimeout(function () { UI.view = s; UI.busy = false; render(); }, ams(700)); return; }
  if (UI.mode === 'hot') UI.view = s;
  render();
}
function aiDelay() { var b = window.AIDELAY; try { b = GX.aiDelay(window.AIDELAY); } catch (e) { } return b; }
function aiStep() {
  if (!G || G.over || isHuman(VSE.side(G)) || UI.busy) return;
  var s = VSE.side(G), m = (tutOn() && tutAI()) || VSAI.pick(G, UI.lvl);
  // show which die the computer is using
  if (m.die === 0 || m.die === 1) { var d = $('[data-die="' + m.die + '"]'); if (d) d.classList.add('tgt'); }
  setPrompt(nameOf(s) + ': ' + title(m).replace(/^Take /, 'takes ').replace(/^Place /, 'places ').replace(/^Sell /, 'sells ').replace(/^Buy /, 'buys ').replace(/^Load /, 'loads ').replace(/^End turn/, 'ends turn'));
  setTimeout(function () { doMove(m); }, ams(450));
}
// ---------- save
function save() { if (UI.tut || (window.GXS && GXS.on)) return; try { localStorage.setItem('vs_save', JSON.stringify({ G: G, mode: UI.mode, lvl: UI.lvl, human: UI.human })); GNS.saved && GNS.saved('vellum-shire', !G.over); } catch (e) { } }
function loadSave() { try { var o = JSON.parse(localStorage.getItem('vs_save') || 'null'); if (o && o.G && !o.G.over) return o; } catch (e) { } return null; }
function clearSave() { try { localStorage.removeItem('vs_save'); GNS.saved && GNS.saved('vellum-shire', false); } catch (e) { } }
// ---------- sound: tiny synth (no files)
var AC = null;
function sfx(k) {
  try { var p = GX.prefs ? GX.prefs() : null; if (p && (p.sfx === 0 || p.master === 0)) return; } catch (e) { }
  try {
    if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
    var t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
    var S = { tick: [660, .04, 'triangle', .05], take: [440, .12, 'triangle', .08], place: [196, .18, 'sine', .14], coin: [988, .16, 'square', .04], gild: [523, .5, 'triangle', .1], roll: [180, .1, 'sawtooth', .03] }[k] || [440, .1, 'sine', .05];
    o.type = S[2]; o.frequency.setValueAtTime(S[0], t); if (k === 'gild') { o.frequency.linearRampToValueAtTime(1046, t + .4); }
    g.gain.setValueAtTime(S[3], t); g.gain.exponentialRampToValueAtTime(.0001, t + S[1]);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + S[1] + .02);
  } catch (e) { }
}
// ---------- new game
function newGame(mode, o) {
  o = o || {};
  UI.mode = mode || 'vs'; UI.human = UI.mode === 'hot' ? [true, true] : (UI.mode === 'watch' ? [false, false] : [true, false]);
  if (o.lvl) UI.lvl = o.lvl;
  G = VSE.newGame({ seed: o.seed != null ? o.seed : (Date.now() & 0x7fffffff), first: o.first != null ? o.first : 0, setup: o.setup, boards: o.boards || 'std' });
  G.ev = [];
  UI.view = 0; UI.sel = null; UI.disc = null; UI.stoSel = -1; UI.dieSel = null; UI.busy = false; UI.started = true; UI.tut = !!o.tut;
  $('#start').hidden = true; $('#rs').hidden = true;
  save(); render(); flow();
  return G;
}
window.setSeed = function (n) { if (G) { G.rng = n >>> 0; } };
window.validMoves = function () { return VSE.validMoves(G); };
window.performMove = function (m) { return doMove(m); };
window.sideToAct = function () { return VSE.side(G); };
window.checkInvariants = function () { return VSE.checkInvariants(G); };

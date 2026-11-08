// ui2: placement ghost (drag, rotate, flip, clean snap), moves, income moment, computer turns, game flow
function curPatch() { if (!G || UI.sel < 0) return null; var id = swOffer(G)[UI.sel]; return id == null ? null : PATCHES[id]; }
function curCells() { var p = curPatch(); return p ? p.or[UI.o] : null; }
function bbox(c) { var w = 0, ht = 0; c.forEach(function (q) { if (q[0] > w) w = q[0]; if (q[1] > ht) ht = q[1]; }); return [w + 1, ht + 1]; }
function ghostOk() { var c = curCells(); return !!c && swFits(G.board[viewSeat()], c, UI.gx, UI.gy); }
function clampG() { var c = curCells(); if (!c) return; var b = bbox(c); UI.gx = Math.max(0, Math.min(9 - b[0], UI.gx)); UI.gy = Math.max(0, Math.min(9 - b[1], UI.gy)); }
function drawGhost() { try { markLanding(); } catch (e) { }
  var old = $('#ghost'); if (old) old.remove(); var q = $('#quilt'), p = curPatch(); if (!q || !p || G.over || G.pend) return; clampG(); var c = curCells(), b = bbox(c), ok = ghostOk(), set = {}; c.forEach(function (x) { set[x[0] + ',' + x[1]] = 1; });
  var cs = UI.cs, g = h('div#ghost.' + (ok ? 'ok' : 'bad'), { style: 'left:' + UI.gx * cs + 'px;top:' + UI.gy * cs + 'px;grid-template-columns:repeat(' + b[0] + ',' + cs + 'px);grid-template-rows:repeat(' + b[1] + ',' + cs + 'px);--pc:' + pcol(p.id), 'aria-hidden': 'true' });
  for (var y = 0; y < b[1]; y++) for (var x = 0; x < b[0]; x++) g.appendChild(h('div.gc' + (set[x + ',' + y] ? '' : '.hid')));
  q.appendChild(g); var sew = $('[data-a=sew]'); if (sew) sew.disabled = !ok;
  // W470: legal squares glow (every square some legal spot of this turn of the patch would cover)
  var bd = G.board[viewSeat()], lg = {}; for (var yy = 0; yy + b[1] <= 9; yy++) for (var xx = 0; xx + b[0] <= 9; xx++) if (swFits(bd, c, xx, yy)) c.forEach(function (q2) { lg[(yy + q2[1]) * 9 + xx + q2[0]] = 1; });
  Array.prototype.forEach.call(q.querySelectorAll('.qc'), function (e, i) { e.classList.toggle('lg', !!lg[i]); });
}
function bestPlacement(pid, seat) { return aiBestPlace(G.board[seat], PATCHES[pid]); }
function selectOffer(k) { if (UI.coach) setTimeout(function () { if (UI.sel >= 0) coachSay('pick', null, true); }, 0);
  var s = swWho(G); if (G.over || UI.busy || !isHuman(s) || G.pend) return; var pid = swOffer(G)[k], p = PATCHES[pid]; if (pid == null) return;
  if (!tutAct({ what: 'offer', k: k })) return;
  if (UI.sel === k) { showPatch(pid); return; }
  if (G.btn[s] < p.cost) { sfx('bad'); toast('You need ' + (p.cost - G.btn[s]) + ' more button' + (p.cost - G.btn[s] === 1 ? '' : 's') + ' for ' + p.name + '. Advance to earn some.'); UI.sel = -1; render(); showPatchSoft(pid, k); var ob = $$('#offers .offer')[k]; if (ob) { ob.classList.add('nope'); setTimeout(function () { ob.className = ob.className.replace(' nope', ''); }, 500); } return; }
  if (!swPlacements(G.board[s], p).length) { sfx('bad'); toast(p.name + ' does not fit anywhere on your quilt.'); return; }
  UI.sel = k; sfx('pick'); var bp = UI.tutorial ? null : bestPlacement(pid, s);
  if (bp) { UI.o = bp[0]; UI.gx = bp[1]; UI.gy = bp[2]; } else { UI.o = 0; var b = bbox(p.or[0]); UI.gx = Math.floor((9 - b[0]) / 2); UI.gy = Math.floor((9 - b[1]) / 2); }
  render();
}
function showPatchSoft(pid, k) { var dt = $('#detail'); var p = PATCHES[pid]; if (dt) dt.innerHTML = '<b>' + p.name + '</b>: tap again to read it.'; UI.softK = k; }
function cancelSel() { UI.sel = -1; render(); }
function xform(f) { var p = curPatch(), c = curCells(); if (!p) return; var b0 = bbox(c), cx = UI.gx + b0[0] / 2, cy = UI.gy + b0[1] / 2, n = swNorm(c.map(f)), k = JSON.stringify(n), idx = -1; p.or.forEach(function (o, i) { if (JSON.stringify(o) === k) idx = i; }); if (idx < 0) return; UI.o = idx; var b = bbox(n); UI.gx = Math.round(cx - b[0] / 2); UI.gy = Math.round(cy - b[1] / 2); clampG(); sfx('rot'); }
function rotate() { if (!tutAct({ what: 'rot' })) return; xform(function (q) { return [-q[1], q[0]]; }); snapNear(true); drawGhost(); renderDockLight(); }
function flip() { if (!tutAct({ what: 'flip' })) return; xform(function (q) { return [-q[0], q[1]]; }); snapNear(true); drawGhost(); renderDockLight(); }
function renderDockLight() { var sew = $('[data-a=sew]'); if (sew) sew.disabled = !ghostOk(); }
function snapNear(soft) { // nearest valid anchor for the current orientation (then any orientation if none)
  var s = viewSeat(), p = curPatch(); if (!p) return false; if (ghostOk()) return true; var best = null, bd = 1e9;
  var pl = swPlacements(G.board[s], p).filter(function (q) { return q[0] === UI.o; });
  pl.forEach(function (q) { var d = Math.abs(q[1] - UI.gx) + Math.abs(q[2] - UI.gy); if (d < bd) { bd = d; best = q; } });
  if (!best && !soft) { swPlacements(G.board[s], p).forEach(function (q) { var d = Math.abs(q[1] - UI.gx) + Math.abs(q[2] - UI.gy) + 3; if (d < bd) { bd = d; best = q; } }); }
  if (best && (bd <= 4 || !soft)) { UI.o = best[0]; UI.gx = best[1]; UI.gy = best[2]; return true; } return false;
}
// pointer: press/drag anywhere on the quilt moves the patch; lift snaps it to the nearest square that fits
function cellAt(ev) { var q = $('#quilt'); if (!q) return null; var r = q.getBoundingClientRect(), cs = UI.cs, x = ev.clientX - r.left - q.clientLeft, y = ev.clientY - r.top - q.clientTop; return [Math.floor(x / cs), Math.floor(y / cs)]; }
var DR = { on: false, moved: false };
function bindQuilt() {
  var bd = $('#bd'); if (bd._b) return; bd._b = 1;
  bd.addEventListener('pointerdown', function (ev) { var q = ev.target.closest && ev.target.closest('#quilt'); if (!q) return; if (G && G.pend && isHuman(swWho(G)) && !UI.busy) { var c = cellAt(ev); if (c && c[0] >= 0 && c[0] < 9 && c[1] >= 0 && c[1] < 9 && G.board[viewSeat()][c[1] * 9 + c[0]] === -1) doLeather(c[0], c[1]); return; }
    if (UI.sel < 0 || UI.busy) { var c2 = cellAt(ev), pid = c2 && G.board[viewSeat()][c2[1] * 9 + c2[0]]; if (pid >= 0 && pid < 99) showPatch(pid); return; }
    DR.on = true; DR.moved = false; DR.touch = ev.pointerType === 'touch'; try { q.setPointerCapture(ev.pointerId); } catch (e) { } dragTo(ev); ev.preventDefault(); });
  bd.addEventListener('pointermove', function (ev) { if (!DR.on) return; DR.moved = true; dragTo(ev); });
  var up = function (ev) { if (!DR.on) return; DR.on = false; var ok = ghostOk(); if (!ok) { snapNear(false); drawGhost(); } tutAct({ what: 'drop', valid: ghostOk() }); renderDockLight(); sfx('tick'); try { if (ghostOk() && navigator.vibrate) navigator.vibrate(12); } catch (e) { } };
  bd.addEventListener('pointerup', up); bd.addEventListener('pointercancel', up);
}
function dragTo(ev) { var c = cellAt(ev), cc = curCells(); if (!c || !cc) return; var b = bbox(cc); UI.gx = c[0] - Math.floor(b[0] / 2); UI.gy = c[1] - Math.floor(b[1] / 2) - (DR.touch ? 2 : 0); clampG(); var g = $('#ghost'); if (g) { var cs = UI.cs; g.style.left = UI.gx * cs + 'px'; g.style.top = UI.gy * cs + 'px'; var ok = ghostOk(); g.classList.toggle('ok', ok); g.classList.toggle('bad', !ok); } renderDockLight(); }
document.addEventListener('keydown', function (e) { if (!G || UI.sel < 0 || GX.open || !UI.started) return; var k = e.key; if (k === 'r' || k === 'R') { rotate(); e.preventDefault(); } else if (k === 'f' || k === 'F') { flip(); e.preventDefault(); } else if (k === 'Enter') { confirmSew(); e.preventDefault(); } else if (k === 'Escape') { cancelSel(); } else if (k.indexOf('Arrow') === 0) { UI.gx += k === 'ArrowRight' ? 1 : k === 'ArrowLeft' ? -1 : 0; UI.gy += k === 'ArrowDown' ? 1 : k === 'ArrowUp' ? -1 : 0; clampG(); drawGhost(); e.preventDefault(); } });
// ---------- moves
function confirmSew() { if (UI.sel < 0 || UI.busy) return; if (!ghostOk()) { snapNear(false); drawGhost(); if (!ghostOk()) { sfx('bad'); return; } } if (!tutAct({ what: 'buy', k: UI.sel })) return; var m = { t: 'buy', k: UI.sel, o: UI.o, x: UI.gx, y: UI.gy }; UI.sel = -1; act(m); }
function doAdvance() { if (UI.busy || G.over || G.pend || !isHuman(swWho(G))) return; if (!tutAct({ what: 'adv' })) return; UI.sel = -1; act({ t: 'adv' }); }
function doLeather(x, y) { if (UI.busy || !tutAct({ what: 'leather' })) return; act({ t: 'leather', x: x, y: y }); }
function act(m) {
  if (!G || G.over) return; if (isHuman(swWho(G)) && UI.mode !== 'hot' && (m.t === 'buy' || m.t === 'adv')) { try { UI.rate = rateMove(m); } catch (e) { UI.rate = ''; } } if (isHuman(swWho(G))) { UI.flavor = ''; var tb = $('#turnban'); if (tb) tb.classList.remove('on'); } var s = swWho(G), before = { pos: G.pos.slice(), btn: G.btn.slice(), bonus: G.bonus };
  var r = swApply(G, m); if (!r.ok) { sfx('bad'); toast('That move is not allowed (' + r.why + ').'); render(); return; }
  var evs = G.ev.slice(); evs.forEach(function (e) { if (e.k === 'place') e.cells.forEach(function (c) { UI.newCells[e.s + ':' + (c[1] * 9 + c[0])] = 1; }); });
  UI.busy++; saveGame(); render(); playEvents(evs, before, function () { var fin = function () { UI.peek = -1; UI.cap = ''; UI.busy--; afterMove(); }; if (UI.peek >= 0 && amt(1)) later(sp(800), fin); else fin(); });
}
function floatText(txt, el, color, wide) { var mm = String(txt).match(/^[+\u2212-]?\d+(?: pts| buttons?)?/); if (!mm) return; txt = mm[0]; /* W470: only a short number flies */ var r = el ? el.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 }; var f = h('div.flt' + (wide ? '.r' : ''), txt); f.style.left = (wide ? Math.max(120, Math.min(innerWidth - 120, r.left + r.width / 2)) : r.left + r.width / 2 - 18) + 'px'; f.style.top = (r.top) + 'px'; if (color) f.style.color = color; document.body.appendChild(f); setTimeout(function () { f.remove(); }, 1800); }
function playEvents(evs, before, done) {
  var t = 0, step = amt(380), spots = 0; if (!step) { evs.forEach(function (e) { if (e.k === 'bonus') toast(nameOf(e.s) + ' completed a 7×7 square: +7 bonus!'); }); return done(); }
  evs.forEach(function (e) {
    if (e.k === 'place') { later(t, function () { sfx('place'); if (e.cost != null) floatText('+' + (e.cells.length * 2) + ' pts: ' + e.cells.length + ' squares covered, \u2212' + e.cost + ' button' + (e.cost === 1 ? '' : 's'), $('.pstrip[data-seat="' + e.s + '"]') || $('#quilt'), '#ffe9a0', true); else floatText('Free 1\u00D71 patch', $('#quilt'), '#ffe9a0', true); var q = $('#quilt'), c0 = e.cells[0]; if (q && c0) { var r = q.getBoundingClientRect(); fxImg('fx-stitch', r.left + q.clientLeft + (c0[0] + .5) * UI.cs, r.top + q.clientTop + (c0[1] + .5) * UI.cs, UI.cs * 1.6); } }); t += step * 1.2; }
    if (e.k === 'move') {
      var from = e.from, to = e.to; SW.BTN_SPOTS.forEach(function (b) { if (b > from && b <= to) { spots++; var tt = t + step * .6 * spots, seat = e.s, inc = G.inc[seat]; if (inc > 0) later(tt, function () { incomeMoment(seat, b, inc, spots); }); } });
      if (e.gain) later(t, function () { sfx('adv'); floatText('+' + e.gain + ' button' + (e.gain === 1 ? '' : 's') + ' for advancing', $('.pstrip[data-seat="' + e.s + '"]') || null, '#ffe9a0', true); }); t += step * .8 + step * .6 * spots;
    }
    if (e.k === 'bonus') { later(t, function () { sfx('bonus'); toast(nameOf(e.s) + ' completed a 7×7 square: +7 bonus!', 2800); }); t += step; }
  });
  later(t + step * .5, done);
}
function incomeMoment(seat, spot, inc, i) { // coins fly from the button spot to the buttons counter
  var cell = $('.tc[data-i="' + spot + '"]'), tgt = $('.nb[data-seat="' + seat + '"]'); if (!cell || !tgt) return; var a = cell.getBoundingClientRect(), b = tgt.getBoundingClientRect();
  for (var k = 0; k < Math.min(inc, 6); k++) { (function (k) { setTimeout(function () { sfx('coin', k); var c = h('div.coin'); c.style.left = (a.left + a.width / 2 - 9) + 'px'; c.style.top = (a.top + a.height / 2 - 9) + 'px'; c.style.setProperty('--dx', (b.left + b.width / 2 - a.left - a.width / 2) + 'px'); c.style.setProperty('--dy', (b.top - a.top) + 'px'); document.body.appendChild(c); setTimeout(function () { c.remove(); tgt.classList.remove('bump'); void tgt.offsetWidth; tgt.classList.add('bump'); }, 800); }, k * 90); })(k); }
  floatText('+' + inc + ' button' + (inc === 1 ? '' : 's') + ': gold spot income', cell, '#ffe9a0', true); fxImg('fx-sparkle', a.left + a.width / 2, a.top + a.height / 2, 44);
}
function fxImg(stem, x, y, size) { var i = artImg(stem, 'fx'); if (!i) return; i.style.cssText = 'position:fixed;z-index:60;pointer-events:none;width:' + size + 'px;height:' + size + 'px;left:' + (x - size / 2) + 'px;top:' + (y - size / 2) + 'px;animation:flt 1s ease-out forwards'; document.body.appendChild(i); setTimeout(function () { i.remove(); }, 1100); }
function afterMove() { if (UI.coach) coachCheck(); render(); if (UI.mode === 'hot' && !G.over && !G.pend) toast(nameOf(swWho(G)) + ', your turn'); schedule(); }
function sp(ms) { return amt(UI.fast ? ms * .3 : ms); }
function banner(txt, sub, opp) { var b = $('#turnban'); if (!b) { b = h('div#turnban'); document.body.appendChild(b); } if (UI.mode !== 'hot') return; var ms = amt(4000); if (!ms) return; b.className = opp ? 'opp' : ''; b.textContent = txt; if (sub) b.appendChild(h('small', sub)); void b.offsetWidth; b.classList.add('on'); clearTimeout(banner.t); banner.t = setTimeout(function () { b.classList.remove('on'); }, ms); }
function turnCheck() { // banner + plain line when the turn changes (or stays: the player further back plays again)
  if (!G || G.over || G.pend) return; var w = swWho(G), hum = isHuman(w), hot = UI.mode === 'hot', nm = hot ? nameOf(w) + '\u2019s turn' : hum ? 'Your turn' : nameOf(w) + '\u2019s turn', again = w === UI.lastWho, prev = UI.again;
  if (hum) UI.fast = false;
  UI.again = hum && again ? (hot ? nameOf(w) + ' is still behind on the track, so plays again' : 'You are still behind on the track: play again') : '';
  if (!again) { banner(nm, UI.lastWho >= 0 ? (hum ? 'You are behind now' : nameOf(w) + ' is behind now') : '', !hum && !hot); } else banner(hum ? (hot ? nameOf(w) + ' again' : 'Your turn again') : nameOf(w) + ' plays again', '', !hum && !hot);
  if (UI.coach) { if (!hum && !hot) coachSay('who_next'); if (UI.again) coachSay('again'); else if (!hum && again && !hot) coachSay('again_opp'); }
  UI.lastWho = w; renderDock();
}
function schedule() {
  clearTimeout(UI.tm.ai); if (!G) return; if (G.over) { return later(amt(500), finish); }
  turnCheck();
  var s = swWho(G); if (UI.tutorial && !UI.tutAi) return; if (isHuman(s)) { if (typeof hlpPhaseUpdate === 'function') hlpPhaseUpdate(); return; }
  if (UI.goal) return; UI.tm.ai = later(Math.max(120, AIDELAY, sp(1100)), aiStep);
}
function aiStep() { // the rival's turn, one visible step at a time (caption, flash, then the move on their quilt)
  if (!G || G.over || UI.busy || UI.goal) return; var s = swWho(G); if (isHuman(s)) return; var m = aiMove(G, UI.tutorial ? 'simple' : lvlOf(s), rngUI), nm = nameOf(s);
  if (!amt(1)) return act(m);
  var pl = function (n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); };
  if (m.t === 'buy') { var p = PATCHES[swOffer(G)[m.k]]; UI.cap = nm + ' buys ' + p.name + ' for ' + pl(p.cost, 'button'); renderDock(); var o = $$('#offers .offer')[m.k]; if (o) o.classList.add('flash'); sfx('pick'); UI.busy++;
    later(sp(1900), function () { UI.peek = s; UI.cap = nm + ' sews it on and moves ' + pl(p.time, 'space'); UI.busy--; act(m); }); }
  else if (m.t === 'adv') { var st = swAdvSteps(G, s); UI.cap = nm + ' advances ' + pl(st, 'space') + ' and takes ' + pl(st, 'button'); renderDock(); UI.busy++; later(sp(1700), function () { UI.busy--; act(m); }); }
  else { UI.peek = s; UI.cap = nm + ' sews a free 1\u00D71 patch'; render(); UI.busy++; later(sp(1500), function () { UI.busy--; act(m); }); }
}
document.addEventListener('pointerdown', function () { if (G && !G.over && !isHuman(swWho(G))) UI.fast = true; }, true);
// ---------- start / finish
function newGame(mode, o) {
  o = o || {}; UI.seq++; clearTimeout(UI.tm.ai); UI.mode = mode === 'story' || mode === 'tutorial' ? 'vs' : mode; UI.tutorial = mode === 'tutorial'; UI.camp = (mode === 'story' && o.camp) || null; UI.sel = -1; UI.busy = 0; UI.newCells = {}; UI.lastWho = -1; UI.rate = ''; UI.again = ''; UI.peek = -1; UI.cap = ''; UI.fast = false; UI.coach = null; if (window.GXCOACH && !o.coach) GXCOACH.running = false; var QS = ((window.CAMPAIGN || {}).story || {}).quick; UI.flavor = mode === 'vs' && !o.camp && !o.coach && QS && QS.intro ? QS.intro[o.lvl || UI.lvl] || '' : ''; UI.lvl = o.lvl || UI.lvl;
  var seed = o.seed != null ? o.seed : (Math.random() * 1e9) | 0; rngUI = swRng(seed + 17); UI.seed = seed;
  G = swNew({ seed: seed, first: o.first != null ? o.first : (UI.mode === 'hot' || UI.tutorial || UI.camp ? 0 : seed % 2), ring: o.ring });
  UI.names = UI.mode === 'hot' ? ['Player 1', 'Player 2'] : ['You', UI.camp ? UI.camp.opponent.name : (o.name || ({ easy: 'Poppy', normal: 'Marden', hard: 'Aurelia' }[UI.lvl] || 'Computer'))];
  if (UI.camp && UI.camp.twist) applyTwist(UI.camp.twist); if (o.setup) o.setup(G);
  UI.started = true; $('#start').hidden = true; $('#rs').hidden = true; try { clearTimeout(toast.t); $('#toast').classList.remove('on'); } catch (e) { } AIDELAY = GX.aiDelay(700); try { GX.close(); } catch (e) { }
  if (!UI.tutorial && !UI.camp && o.save !== false) saveGame();
  render(); if (!UI.tutorial) schedule(); try { if (typeof hlpPhaseUpdate === 'function') hlpPhaseUpdate(); } catch (e) { } try { GX.showDock(); } catch (e) { } return G;
}
function applyTwist(t) {
  if (t.id === 'boss-buttons') G.btn[1] += t.param || 0;
  else if (t.id === 'torn-squares') { var c = [[0, 0], [8, 8], [4, 4], [8, 0], [0, 8]]; for (var i = 0; i < (t.param || 0); i++) G.board[0][c[i][1] * 9 + c[i][0]] = 99; }
  else if (t.id === 'boss-patched') { var d = [[0, 0], [8, 8], [0, 8], [8, 0]]; for (var j = 0; j < (t.param || 0); j++) G.board[1][d[j][1] * 9 + d[j][0]] = 100; }
}
function saveGame() { try { if (UI.tutorial || UI.camp || !G || G.over) { if (G && G.over) localStorage.removeItem('sw_save'); return; } localStorage.setItem('sw_save', JSON.stringify({ G: G, mode: UI.mode, lvl: UI.lvl, names: UI.names, coach: UI.coach || null })); if (window.GNS && GNS.saved) GNS.saved('stitchwise', true); } catch (e) { } }
function loadGame() { try { var s = JSON.parse(localStorage.getItem('sw_save')); if (!s || !s.G || s.G.over) return false; G = s.G; UI.mode = s.mode; UI.lvl = s.lvl; UI.names = s.names; UI.coach = s.coach || null; UI.flavor = ''; UI.camp = null; UI.tutorial = false; UI.started = true; UI.sel = -1; UI.busy = 0; rngUI = swRng((G.seed || 1) + G.turns); $('#start').hidden = true; AIDELAY = GX.aiDelay(700); render(); schedule(); return true; } catch (e) { return false; } }
function hasSave() { try { var s = JSON.parse(localStorage.getItem('sw_save')); return !!(s && s.G && !s.G.over); } catch (e) { return false; } }
function metrics(g) { var a = swScore(g, 0), b = swScore(g, 1); return { won: swWinner(g) === 0, score: a.total, margin: a.total - b.total, empty: a.empty, bonus: g.bonus === 0 ? 1 : 0, income: g.inc[0], turns: g.turns }; }
function finish() {
  if (!G || !G.over || UI.finished === G) return; UI.finished = G; try { localStorage.removeItem('sw_save'); if (window.GNS && GNS.saved) GNS.saved('stitchwise', false); } catch (e) { }
  var w = swWinner(G);
  if (UI.camp && typeof GXC !== 'undefined') { var g0 = G; showResult({ after: function () { $('#rs').hidden = true; try { campBest(g0); GXC.finish(g0); campResultNote(g0); } catch (e) { console.error(e); } } }); return; }
  if (!UI.tutorial) { try { if (window.GNS && GNS.result) GNS.result({ game: 'stitchwise', mode: UI.mode === 'hot' ? 'hot' : 'vs', level: UI.lvl, seats: [{ name: 'You', me: true }, { name: UI.names[1], ai: UI.mode === 'hot' ? undefined : UI.lvl }], winner: w, scores: [swScore(G, 0).total, swScore(G, 1).total], turns: G.turns }); } catch (e) { } }
  showResult();
}

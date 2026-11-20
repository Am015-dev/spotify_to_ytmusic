// ui2: placement ghost (drag, rotate, flip, clean snap), moves, income moment, computer turns, game flow
function curPatch() { if (!G || UI.sel < 0) return null; var id = swOffer(G)[UI.sel]; return id == null ? null : PATCHES[id]; }
function curCells() { var p = curPatch(); return p ? p.or[UI.o] : null; }
function bbox(c) { var w = 0, ht = 0; c.forEach(function (q) { if (q[0] > w) w = q[0]; if (q[1] > ht) ht = q[1]; }); return [w + 1, ht + 1]; }
function ghostOk() { var c = curCells(); return !!c && swFits(G.board[viewSeat()], c, UI.gx, UI.gy); }
function canSew() { return UI.placed !== false && ghostOk(); }   // F2: Sew needs the player's own spot (a suggestion is only a dashed outline)
function atSug() { return !!UI.sug && UI.o === UI.sug[0] && UI.gx === UI.sug[1] && UI.gy === UI.sug[2]; }
function sugPlace(pid, seat) { // F2: a gentle suggestion: hug the edges and other patches, leave no pockets
  var bd = G.board[seat].slice(), p = PATCHES[pid], best = null;
  swPlacements(bd, p).forEach(function (pl) { var c = p.or[pl[0]], set = {}, touch = 0; c.forEach(function (q) { set[(pl[2] + q[1]) * 9 + pl[1] + q[0]] = 1; });
    c.forEach(function (q) { var x = pl[1] + q[0], y = pl[2] + q[1]; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var nx = x + d[0], ny = y + d[1]; if (nx < 0 || ny < 0 || nx > 8 || ny > 8) touch++; else if (!set[ny * 9 + nx] && bd[ny * 9 + nx] !== -1) touch++; }); });
    Object.keys(set).forEach(function (i) { bd[i] = 50; }); var sc = aiHoles(bd) * 2 + touch; Object.keys(set).forEach(function (i) { bd[i] = -1; });
    if (!best || sc > best[3]) best = [pl[0], pl[1], pl[2], sc]; });
  return best; }
function acceptSug() { if (UI.sel < 0 || !UI.sug || UI.busy) return; UI.o = UI.sug[0]; UI.gx = UI.sug[1]; UI.gy = UI.sug[2]; UI.placed = true; sfx('tick'); try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) { } render(); }
function clampG() { var c = curCells(); if (!c) return; var b = bbox(c); UI.gx = Math.max(0, Math.min(9 - b[0], UI.gx)); UI.gy = Math.max(0, Math.min(9 - b[1], UI.gy)); }
function drawGhost() { try { markLanding(); } catch (e) { }
  var old = $('#ghost'); if (old) old.remove(); var q = $('#quilt'), p = curPatch(); if (!q || !p || G.over || G.pend) return; clampG(); var c = curCells(), b = bbox(c), ok = ghostOk(), set = {}; c.forEach(function (x) { set[x[0] + ',' + x[1]] = 1; });
  var cs = UI.cs, g = h('div#ghost.' + (ok ? 'ok' : 'bad') + (UI.placed === false ? '.sug' : ''), { style: 'left:' + UI.gx * cs + 'px;top:' + UI.gy * cs + 'px;grid-template-columns:repeat(' + b[0] + ',' + cs + 'px);grid-template-rows:repeat(' + b[1] + ',' + cs + 'px);--pc:' + pcol(p.id), 'aria-hidden': 'true' });
  var fab = artHas(fabricStem(p.id)) ? 'url(media/' + fabricStem(p.id) + '.webp)' : '', fsz = Math.max(b[0], b[1]) * cs;   // W491 fix: the ghost shows the patch's fabric, not a flat block
  for (var y = 0; y < b[1]; y++) for (var x = 0; x < b[0]; x++) { var gc = h('div.gc' + (set[x + ',' + y] ? '' : '.hid')); if (fab && set[x + ',' + y]) { gc.style.backgroundImage = fab; gc.style.backgroundSize = fsz + 'px ' + fsz + 'px'; gc.style.backgroundPosition = (-x * cs) + 'px ' + (-y * cs) + 'px'; } g.appendChild(gc); }
  if (UI.placed === false) g.appendChild(h('span.sgl' + (UI.gy < 1 ? '.lo' : ''), 'Good spot?'));
  q.appendChild(g); var sew = $('[data-a=sew]'); if (sew) sew.disabled = !canSew();
  // W470: legal squares glow (every square some legal spot of this turn of the patch would cover)
  var bd = G.board[viewSeat()], lg = {}; for (var yy = 0; yy + b[1] <= 9; yy++) for (var xx = 0; xx + b[0] <= 9; xx++) if (swFits(bd, c, xx, yy)) c.forEach(function (q2) { lg[(yy + q2[1]) * 9 + xx + q2[0]] = 1; });
  Array.prototype.forEach.call(q.querySelectorAll('.qc'), function (e, i) { e.classList.toggle('lg', !!lg[i]); });
}
function bestPlacement(pid, seat) { return aiBestPlace(G.board[seat], PATCHES[pid]); }
function selectOffer(k) { if (!t2Allow('offer', k)) return; if (UI.cdAt && Date.now() - UI.cdAt < 500) return; /* W484: the click that ends a card drag */ if (UI.coach) setTimeout(function () { if (UI.sel >= 0) coachSay('pick', null, true); }, 0);
  var s = swWho(G); if (G.over || UI.busy || !isHuman(s) || G.pend) return; var pid = swOffer(G)[k], p = PATCHES[pid]; if (pid == null) return;
  if (!tutAct({ what: 'offer', k: k })) return;
  if (UI.sel === k) { showPatch(pid); return; }
  if (G.btn[s] < p.cost) { sfx('bad'); toast('You need ' + (p.cost - G.btn[s]) + ' more button' + (p.cost - G.btn[s] === 1 ? '' : 's') + ' for ' + p.name + '. Advance to earn some.'); UI.sel = -1; render(); showPatchSoft(pid, k); var ob = $$('#offers .offer')[k]; if (ob) { ob.classList.add('nope'); setTimeout(function () { ob.className = ob.className.replace(' nope', ''); }, 500); } return; }
  if (!swPlacements(G.board[s], p).length) { sfx('bad'); toast(p.name + ' does not fit anywhere on your quilt.'); return; }
  UI.sel = k; sfx('pick'); var bp = UI.tutorial ? null : sugPlace(pid, s); UI.sug = bp ? bp.slice(0, 3) : null; UI.placed = !bp; /* F2: no auto-drop: the good spot is a dashed outline; the player taps a spot or accepts it */
  if (bp) { UI.o = bp[0]; UI.gx = bp[1]; UI.gy = bp[2]; } else { UI.o = 0; var b = bbox(p.or[0]); UI.gx = Math.floor((9 - b[0]) / 2); UI.gy = Math.floor((9 - b[1]) / 2); }
  render();
}
function showPatchSoft(pid, k) { var dt = $('#detail'); var p = PATCHES[pid]; if (dt) dt.innerHTML = '<b>' + p.name + '</b>: tap again to read it.'; UI.softK = k; }
function cancelSel() { if (!t2Allow('cancel')) return; UI.sel = -1; UI.placed = true; render(); }
function xform(f) { var p = curPatch(), c = curCells(); if (!p) return; var b0 = bbox(c), cx = UI.gx + b0[0] / 2, cy = UI.gy + b0[1] / 2, n = swNorm(c.map(f)), k = JSON.stringify(n), idx = -1; p.or.forEach(function (o, i) { if (JSON.stringify(o) === k) idx = i; }); if (idx < 0) return; UI.o = idx; var b = bbox(n); UI.gx = Math.round(cx - b[0] / 2); UI.gy = Math.round(cy - b[1] / 2); clampG(); sfx('rot'); }
function rotate() { if (!t2Allow('rot') || !tutAct({ what: 'rot' })) return; UI.placed = true; xform(function (q) { return [-q[1], q[0]]; }); snapNear(true); render(); }
function flip() { if (!t2Allow('flip') || !tutAct({ what: 'flip' })) return; UI.placed = true; xform(function (q) { return [-q[0], q[1]]; }); snapNear(true); render(); }
function renderDockLight() { var sew = $('[data-a=sew]'); if (sew) sew.disabled = !canSew(); var pr = $('#prompt'); if (pr && UI.sel >= 0 && UI.placed && !hintsOn()) pr.textContent = placeLine(); }
function placeLine() { return UI.placed === false ? 'Tap your quilt where it should go' : !ghostOk() ? 'Red: no room. Move it to a free spot' : atSug() ? 'Good spot! Tap Sew it on' : 'It fits! Tap Sew it on'; }
function snapNear(soft) { // nearest valid anchor for the current orientation (then any orientation if none)
  var s = viewSeat(), p = curPatch(); if (!p) return false; if (soft && T2) return ghostOk(); /* tutorial: the player drags it in */ if (ghostOk()) return true; var best = null, bd = 1e9;
  var pl = swPlacements(G.board[s], p).filter(function (q) { return q[0] === UI.o; });
  pl.forEach(function (q) { var d = Math.abs(q[1] - UI.gx) + Math.abs(q[2] - UI.gy); if (d < bd) { bd = d; best = q; } });
  if (!best && !soft) { swPlacements(G.board[s], p).forEach(function (q) { var d = Math.abs(q[1] - UI.gx) + Math.abs(q[2] - UI.gy) + 3; if (d < bd) { bd = d; best = q; } }); }
  if (best && (bd <= 4 || !soft)) { UI.o = best[0]; UI.gx = best[1]; UI.gy = best[2]; return true; } return false;
}
// pointer: press/drag anywhere on the quilt moves the patch; lift snaps it to the nearest square that fits
function leatherAt(ev) { // F1: hit padding: a tap lands on the nearest empty square whose centre is within 22 px (a 44 px target even on small squares)
  var q = $('#quilt'); if (!q || !G) return null; var r = q.getBoundingClientRect(), cs = UI.cs, x = ev.clientX - r.left - q.clientLeft, y = ev.clientY - r.top - q.clientTop, b = G.board[viewSeat()], best = null, bd = Math.max(22, cs * 0.71);
  for (var i = 0; i < 81; i++) { if (b[i] !== -1) continue; var cx = (i % 9 + 0.5) * cs, cy = ((i / 9 | 0) + 0.5) * cs, d = Math.max(Math.abs(cx - x), Math.abs(cy - y)); if (d <= bd && (!best || d < best[2])) best = [i % 9, i / 9 | 0, d]; }
  return best; }
function cellAt(ev) { var q = $('#quilt'); if (!q) return null; var r = q.getBoundingClientRect(), cs = UI.cs, x = ev.clientX - r.left - q.clientLeft, y = ev.clientY - r.top - q.clientTop; return [Math.floor(x / cs), Math.floor(y / cs)]; }
var DR = { on: false, moved: false };
function tapPlace(c, wasSug) { // F2: a tap puts the patch on the tapped square (on the dashed suggestion = take it as shown)
  var cc = curCells(); if (!cc) return; if (wasSug && UI.sug) { var p = curPatch(), sc = p.or[UI.sug[0]]; if (sc.some(function (q) { return UI.sug[1] + q[0] === c[0] && UI.sug[2] + q[1] === c[1]; })) { UI.o = UI.sug[0]; UI.gx = UI.sug[1]; UI.gy = UI.sug[2]; drawGhost(); return; } }
  var b = bbox(cc); UI.gx = c[0] - Math.floor(b[0] / 2); UI.gy = c[1] - Math.floor(b[1] / 2); clampG();
  if (!ghostOk()) { var best = null, bd = 1e9; swPlacements(G.board[viewSeat()], curPatch()).forEach(function (q) { if (q[0] !== UI.o) return; var cs2 = curPatch().or[q[0]]; if (!cs2.some(function (r) { return q[1] + r[0] === c[0] && q[2] + r[1] === c[1]; })) return; var d = Math.abs(q[1] - UI.gx) + Math.abs(q[2] - UI.gy); if (d < bd) { bd = d; best = q; } }); if (best) { UI.gx = best[1]; UI.gy = best[2]; } }
  drawGhost(); }
function bindQuilt() {
  var bd = $('#bd'); if (bd._b) return; bd._b = 1;
  bd.addEventListener('pointerdown', function (ev) { try { if (UI.coach && UI.coach.line) { UI.coach.line = ''; coachRender(); } } catch (e) { } /* W470: any board touch closes Aunt Wren */ var q = ev.target.closest && (ev.target.closest('#quilt') || (G && G.pend ? ev.target.closest('.qframe') : null)); if (!q) return; if (G && G.pend && isHuman(swWho(G)) && !UI.busy) { var c = leatherAt(ev); if (c) doLeather(c[0], c[1]); else { var pr = $('#prompt'); if (pr) { pr.textContent = 'That square is taken: tap an empty (cream) one'; pr.classList.remove('flash'); void pr.offsetWidth; pr.classList.add('flash'); } sfx('bad'); } return; } /* F3: no silent click */
    if (UI.sel < 0 || UI.busy) { var c2 = cellAt(ev), pid = c2 && G.board[viewSeat()][c2[1] * 9 + c2[0]]; if (pid >= 0 && pid < 99) showPatch(pid); return; }
    var wasSug = UI.placed === false, tc = cellAt(ev); UI.placed = true; DR.on = true; DR.moved = false; DR.touch = ev.pointerType === 'touch'; DR.c0 = tc; DR.sug = wasSug; DR.x0 = ev.clientX; DR.y0 = ev.clientY; try { q.setPointerCapture(ev.pointerId); } catch (e) { } if (!DR.touch) dragTo(ev); else { var g0 = $('#ghost'); if (g0) { g0.classList.remove('sug'); var l0 = $('.sgl', g0); if (l0) l0.remove(); } } ev.preventDefault(); });
  bd.addEventListener('pointermove', function (ev) { if (!DR.on) return; if (!DR.moved && Math.abs(ev.clientX - DR.x0) + Math.abs(ev.clientY - DR.y0) < 8) return; /* F2: finger jitter is still a tap */ DR.moved = true; dragTo(ev); });
  var up = function (ev) { if (!DR.on) return; DR.on = false; if (!DR.moved && DR.c0) tapPlace(DR.c0, DR.sug); var ok = ghostOk(); if (!ok) { snapNear(false); drawGhost(); } tutAct({ what: 'drop', valid: ghostOk() }); if (!T2) renderDock(); renderDockLight(); sfx('tick'); try { if (ghostOk() && navigator.vibrate) navigator.vibrate(12); } catch (e) { } };
  bd.addEventListener('pointerup', up); bd.addEventListener('pointercancel', up);
}
/* W484: drag a patch straight from its card onto the quilt (the benchmark app's first-turn gesture); a plain tap still selects */
var CD = null;
document.addEventListener('pointerdown', function (ev) { var b = ev.target.closest && ev.target.closest('#offers .offer.can'); CD = b && !UI.tutorial && UI.sel < 0 ? { k: +b.dataset.k, x: ev.clientX, y: ev.clientY, on: false } : null; });
document.addEventListener('pointermove', function (ev) { if (!CD) return; if (!CD.on) { if (Math.abs(ev.clientX - CD.x) + Math.abs(ev.clientY - CD.y) < 14) return; selectOffer(CD.k); if (UI.sel !== CD.k) { CD = null; return; } CD.on = true; DR.touch = ev.pointerType === 'touch'; } dragTo(ev); ev.preventDefault(); }, { passive: false });
var cdUp = function () { if (!CD) return; var was = CD.on; CD = null; if (!was) return; UI.cdAt = Date.now(); if (!ghostOk()) { snapNear(false); drawGhost(); } renderDockLight(); render(); sfx('tick'); try { if (ghostOk() && navigator.vibrate) navigator.vibrate(12); } catch (e) { } };
document.addEventListener('pointerup', cdUp); document.addEventListener('pointercancel', cdUp);
function dragTo(ev) { var c = cellAt(ev), cc = curCells(); if (!c || !cc) return; var b = bbox(cc); UI.gx = c[0] - Math.floor(b[0] / 2); UI.gy = c[1] - Math.floor(b[1] / 2) - (DR.touch ? 2 : 0); clampG(); var g = $('#ghost'); if (g) { var cs = UI.cs; g.style.left = UI.gx * cs + 'px'; g.style.top = UI.gy * cs + 'px'; var ok = ghostOk(); g.classList.toggle('ok', ok); g.classList.toggle('bad', !ok); } renderDockLight(); }
document.addEventListener('keydown', function (e) { if (!G || UI.sel < 0 || GX.open || !UI.started) return; var k = e.key; if (k === 'r' || k === 'R') { rotate(); e.preventDefault(); } else if (k === 'f' || k === 'F') { flip(); e.preventDefault(); } else if (k === 'Enter') { confirmSew(); e.preventDefault(); } else if (k === 'Escape') { cancelSel(); } else if (k.indexOf('Arrow') === 0) { UI.gx += k === 'ArrowRight' ? 1 : k === 'ArrowLeft' ? -1 : 0; UI.gy += k === 'ArrowDown' ? 1 : k === 'ArrowUp' ? -1 : 0; clampG(); drawGhost(); e.preventDefault(); } });
// ---------- moves
function confirmSew() { if (UI.sel < 0 || UI.busy) return; if (!t2Allow('sew')) return; if (UI.placed === false) { acceptSug(); return; } if (T2 && !ghostOk()) { sfx('bad'); return; } if (!ghostOk()) { snapNear(false); drawGhost(); if (!ghostOk()) { sfx('bad'); return; } } if (!tutAct({ what: 'buy', k: UI.sel })) return; var m = { t: 'buy', k: UI.sel, o: UI.o, x: UI.gx, y: UI.gy }; UI.sel = -1; act(m); }
function doAdvance() { if (UI.busy || G.over || G.pend || !isHuman(swWho(G))) return; if (!t2Allow('adv')) return; if (!tutAct({ what: 'adv' })) return; UI.sel = -1; act({ t: 'adv' }); try { if (T2) t2Tick(); } catch (e) { } }
function doLeather(x, y) { if (UI.busy || !t2Allow('leather', y * 9 + x) || !tutAct({ what: 'leather' })) return; act({ t: 'leather', x: x, y: y }); }
function act(m) { UI.note = '';
  if (!G || G.over) return; if (isHuman(swWho(G)) && UI.mode !== 'hot' && (m.t === 'buy' || m.t === 'adv')) { try { UI.rate = rateMove(m); } catch (e) { UI.rate = ''; } } if (isHuman(swWho(G))) { UI.flavor = ''; var tb = $('#turnban'); if (tb) tb.classList.remove('on'); } var s = swWho(G), before = { pos: G.pos.slice(), btn: G.btn.slice(), bonus: G.bonus };
  var r = swApply(G, m); if (!r.ok) { sfx('bad'); toast('That move is not allowed (' + r.why + ').'); render(); return; }
  var evs = G.ev.slice(); evs.forEach(function (e) { if (e.k === 'place') e.cells.forEach(function (c) { UI.newCells[e.s + ':' + (c[1] * 9 + c[0])] = 1; }); });
  UI.busy++; saveGame(); render(); playEvents(evs, before, function () { var fin = function () { UI.peek = -1; UI.cap = ''; UI.busy--; afterMove(); }; if (UI.peek >= 0 && amt(1)) later(sp(150), fin); else fin(); });
}
function floatText(txt, el, color, wide) { var mm = String(txt).match(/^[+\u2212-]?\d+(?: pts| buttons?)?/); if (!mm) return; txt = mm[0]; /* W470: only a short number flies */ var r = el ? el.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 }; var f = h('div.flt' + (wide ? '.r' : ''), txt); f.style.left = (wide ? Math.max(120, Math.min(innerWidth - 120, r.left + r.width / 2)) : r.left + r.width / 2 - 18) + 'px'; var hb = $('.gx-bar'), hbB = hb ? hb.getBoundingClientRect().bottom : 0; f.style.top = Math.max(r.top + r.height / 2 - 10, hbB + 54) + 'px'; /* R16: the pop rises at most 46 px, so it never reaches the Rules/Menu buttons */ if (el && el.classList && el.classList.contains('pstrip')) { /* F1: never over a player chip: the number drops in just outside it (below, or to its left when another chip is below) */ f.classList.add('dn'); var bx = r.left + r.width / 2, by = r.bottom + 4, hit = $$('.pstrip').some(function (o) { var q = o.getBoundingClientRect(); return o !== el && bx >= q.left && bx <= q.right && by + 20 >= q.top && by <= q.bottom; }); if (hit || by + 24 > innerHeight) { f.style.right = (innerWidth - r.left + 4) + 'px'; f.style.left = 'auto'; f.style.top = (r.top + r.height / 2 - 12) + 'px'; } else { f.style.top = by + 'px'; f.style.left = Math.max(4, Math.min(innerWidth - 150, bx - 40)) + 'px'; } }
  if (color) f.style.color = color; document.body.appendChild(f); setTimeout(function () { f.remove(); }, 1800); }
function playEvents(evs, before, done) {
  var t = 0, step = evs.length && evs[0].s != null && !isHuman(evs[0].s) && UI.mode !== 'hot' ? sp(210) : amt(380), spots = 0; if (!step) { evs.forEach(function (e) { if (e.k === 'bonus') toast(nameOf(e.s) + ' completed a 7×7 square: +7 bonus!'); }); return done(); }
  evs.forEach(function (e) {
    if (e.k === 'place') { later(t, function () { sfx('place'); if (e.cost != null) floatText('+' + (e.cells.length * 2) + ' pts: ' + e.cells.length + ' squares covered, \u2212' + e.cost + ' button' + (e.cost === 1 ? '' : 's'), $('.pstrip[data-seat="' + e.s + '"]') || $('#quilt'), '#ffe9a0', true); else floatText('Free 1\u00D71 patch', $('#quilt'), '#ffe9a0', true); var q = $('#quilt'), c0 = e.cells[0]; if (q && c0) { var r = q.getBoundingClientRect(); fxImg('fx-stitch', r.left + q.clientLeft + (c0[0] + .5) * UI.cs, r.top + q.clientTop + (c0[1] + .5) * UI.cs, UI.cs * 1.6); } }); t += step * 1.2; }
    if (e.k === 'move') {
      var from = e.from, to = e.to; SW.BTN_SPOTS.forEach(function (b) { if (b > from && b <= to) { spots++; var tt = t + step * .6 * spots, seat = e.s, inc = G.inc[seat]; if (inc > 0) later(tt, function () { incomeMoment(seat, b, inc, spots); }); } });
      if (e.gain) later(t, function () { sfx('adv'); floatText('+' + e.gain + ' button' + (e.gain === 1 ? '' : 's') + ' for advancing', $('.pstrip[data-seat="' + e.s + '"]') || null, '#ffe9a0', true); }); t += step * .8 + step * .6 * spots;
    }
    if (e.k === 'bonus') { later(t, function () { sfx('bonus'); payday(e.s, 7, '7\u00D77 bonus', (UI.mode !== 'hot' && e.s === 0 ? 'You' : nameOf(e.s)) + ' filled a 7\u00D77 block: +7'); }); t += step; }
  });
  later(t + step * .5, done);
}
function incomeMoment(seat, spot, inc, i) { // coins fly from the button spot to the buttons counter
  var cell = $('.tc[data-i="' + spot + '"]'), tgt = $('.nb[data-seat="' + seat + '"]'); if (!cell || !tgt) return; var a = cell.getBoundingClientRect(), b = tgt.getBoundingClientRect();
  for (var k = 0; k < Math.min(inc, 6); k++) { (function (k) { setTimeout(function () { sfx('coin', k); var c = h('div.coin'); c.style.left = (a.left + a.width / 2 - 9) + 'px'; c.style.top = (a.top + a.height / 2 - 9) + 'px'; c.style.setProperty('--dx', (b.left + b.width / 2 - a.left - a.width / 2) + 'px'); c.style.setProperty('--dy', (b.top - a.top) + 'px'); document.body.appendChild(c); setTimeout(function () { c.remove(); tgt.classList.remove('bump'); void tgt.offsetWidth; tgt.classList.add('bump'); }, 800); }, k * 90); })(k); }
  payday(seat, inc); fxImg('fx-sparkle', a.left + a.width / 2, a.top + a.height / 2, 44);
}
function payday(seat, inc, ttl, txt) { // F3: the payday moment, said in words: "+5 from your patches"
  var old = $('#payday'); if (old) old.remove(); var me = UI.mode !== 'hot' && seat === 0, p = h('div#payday' + (seat ? '.opp' : ''), { role: 'status' }, h('b', ttl || 'Payday'), h('span', txt || (me ? '+' + inc + ' from your patches' : nameOf(seat) + ' +' + inc + ' from patches')));
  var pl = $('.pstrip[data-seat="' + seat + '"]'); document.body.appendChild(p); if (pl) { var r = pl.getBoundingClientRect(); p.style.left = Math.max(6, Math.min(innerWidth - p.offsetWidth - 6, r.left + r.width / 2 - p.offsetWidth / 2)) + 'px'; p.style.top = Math.min(innerHeight - 60, r.bottom + 6) + 'px'; }
  var ni = $('.ni[data-seat="' + seat + '"]'); if (ni) { ni.classList.remove('bump'); void ni.offsetWidth; ni.classList.add('bump'); }
  setTimeout(function () { p.remove(); }, amt(1900) || 1200); }
function fxImg(stem, x, y, size) { var i = artImg(stem, 'fx'); if (!i) return; i.style.cssText = 'position:fixed;z-index:60;pointer-events:none;width:' + size + 'px;height:' + size + 'px;left:' + (x - size / 2) + 'px;top:' + (y - size / 2) + 'px;animation:flt 1s ease-out forwards'; document.body.appendChild(i); setTimeout(function () { i.remove(); }, 1100); }
function explainOnce() { // F3: leather and the 7x7 bonus are explained where they first matter
  if (!G || G.over || UI.tutorial || UI.coach || !isHuman(swWho(G))) return; UI.told = UI.told || {}; var me = swWho(G);
  var nl = SW.LEATHER_SPOTS.filter(function (l, i) { return G.leather[i] === null && l > G.pos[me] && l - G.pos[me] <= 8; })[0];
  if (nl && !UI.told.lea) { UI.told.lea = 1; UI.note = 'Cream track square = leather: first past gets a free 1\u00D71'; return; }
  if (G.bonus === null && !UI.told.b7 && best7(G.board[me]) >= 24) { UI.told.b7 = 1; UI.note = 'First to fill a whole 7\u00D77 block: +7 points'; }
}
function afterMove() { if (G && !G.over && isHuman(swWho(G))) UI.rvPrev = -1; if (UI.coach) coachCheck(); render(); if (UI.mode === 'hot' && !G.over && !G.pend) toast(nameOf(swWho(G)) + ', your turn'); else explainOnce(); renderDock(); schedule(); }
function sp(ms) { return amt(UI.fast ? ms * .3 : ms); }
function banner(txt, sub, opp) { var b = $('#turnban'); if (!b) { b = h('div#turnban'); document.body.appendChild(b); } return; var ms = amt(4000); if (!ms) return; b.className = opp ? 'opp' : ''; b.textContent = txt; if (sub) b.appendChild(h('small', sub)); void b.offsetWidth; b.classList.add('on'); clearTimeout(banner.t); banner.t = setTimeout(function () { b.classList.remove('on'); }, ms); }
function turnCheck() { // banner + plain line when the turn changes (or stays: the player further back plays again)
  if (!G || G.over || G.pend) return; var w = swWho(G), hum = isHuman(w), hot = UI.mode === 'hot', nm = hot ? nameOf(w) + '\u2019s turn' : hum ? 'Your turn' : nameOf(w) + '\u2019s turn', again = w === UI.lastWho, prev = UI.again;
  if (hum) UI.fast = false;
  UI.again = hum && again ? (hot ? nameOf(w) + ' is behind: plays again' : 'Still behind: play again') : '';
  if (!again) { banner(nm, UI.lastWho >= 0 ? (hum ? 'You are behind now' : nameOf(w) + ' is behind now') : '', !hum && !hot); } else banner(hum ? (hot ? nameOf(w) + ' again' : 'Your turn again') : nameOf(w) + ' plays again', '', !hum && !hot);
  if (UI.coach) { if (!hum && !hot) coachSay('who_next'); if (UI.again) coachSay('again'); else if (!hum && again && !hot) coachSay('again_opp'); }
  UI.lastWho = w; renderDock();
}
function schedule() {
  clearTimeout(UI.tm.ai); if (!G) return; if (G.over) { return later(amt(500), finish); }
  turnCheck();
  var s = swWho(G); if (UI.tutorial && !UI.tutAi) return; if (isHuman(s)) { if (typeof hlpPhaseUpdate === 'function') hlpPhaseUpdate(); return; }
  if (UI.goal) return; UI.tm.ai = later(Math.max(80, Math.min(AIDELAY, sp(150))), aiStep); /* R1: about 2 s per rival move, tap to skip */
}
function aiStep() { // the rival's turn, one visible step at a time (caption, flash, then the move on their quilt)
  if (!G || G.over || UI.busy || UI.goal) return; var s = swWho(G); if (isHuman(s)) return; UI.fast = UI.fast || UI.rvPrev === s; UI.rvPrev = s; /* R2: a rival's 2nd move in a row plays at speed */ var m = UI.tutorial && !G.pend ? { t: 'adv' } : aiMove(G, UI.tutorial ? 'simple' : lvlOf(s), rngUI), nm = nameOf(s);
  if (!amt(1)) return act(m);
  var pl = function (n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); };
  if (m.t === 'buy') { var p = PATCHES[swOffer(G)[m.k]]; UI.cap = nm + ' buys ' + p.name + ' for ' + pl(p.cost, 'button'); UI.peek = s; render(); var o = $$('#offers .offer')[m.k]; if (o) o.classList.add('flash'); sfx('pick'); UI.busy++;
    later(sp(420), function () { UI.peek = s; UI.cap = nm + ' sews it on and moves ' + pl(p.time, 'space') + ', to ' + Math.min(SW.TRACK, G.pos[s] + p.time); UI.busy--; act(m); }); }
  else if (m.t === 'adv') { var st = swAdvSteps(G, s); UI.cap = nm + ' jumps just past ' + (UI.mode !== 'hot' && isHuman(1 - s) ? 'you' : nameOf(1 - s)) + ': +' + pl(st, 'button'); renderDock(); UI.busy++; later(sp(320), function () { UI.busy--; act(m); }); }
  else { UI.peek = s; UI.cap = nm + ' sews a free 1\u00D71 patch'; render(); UI.busy++; later(sp(450), function () { UI.busy--; act(m); }); }
}
document.addEventListener('pointerdown', function () { if (G && !G.over && !isHuman(swWho(G))) UI.fast = true; }, true);
// ---------- start / finish
function newGame(mode, o) { if (mode !== 'tutorial' && T2) t2Clear(); try { ['result-win', 'result-lose'].forEach(function (k) { if (artHas(k)) artImg(k); }); } catch (e) { }
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
  else if (t.id === 'torn-squares') { var c = [[0, 0], [8, 8], [8, 0], [0, 8], [4, 4]] /* F1: the centre tears last, so 3 tears still leave room for a 7x7 */; for (var i = 0; i < (t.param || 0); i++) G.board[0][c[i][1] * 9 + c[i][0]] = 99; }
  else if (t.id === 'boss-patched') { var d = [[0, 0], [8, 8], [0, 8], [8, 0]]; for (var j = 0; j < (t.param || 0); j++) G.board[1][d[j][1] * 9 + d[j][0]] = 100; }
}
function saveGame() { try { if (UI.tutorial || UI.camp || !G || G.over) { if (G && G.over) localStorage.removeItem('sw_save'); return; } localStorage.setItem('sw_save', JSON.stringify({ G: G, mode: UI.mode, lvl: UI.lvl, names: UI.names, coach: UI.coach || null })); if (window.GNS && GNS.saved) GNS.saved('stitchwise', true); } catch (e) { } }
function loadGame() { try { var s = JSON.parse(localStorage.getItem('sw_save')); if (!s || !s.G || s.G.over) return false; G = s.G; UI.mode = s.mode; UI.lvl = s.lvl; UI.names = s.names; UI.coach = s.coach || null; UI.flavor = ''; UI.camp = null; UI.tutorial = false; UI.started = true; UI.sel = -1; UI.busy = 0; rngUI = swRng((G.seed || 1) + G.turns); $('#start').hidden = true; AIDELAY = GX.aiDelay(700); render(); schedule(); return true; } catch (e) { return false; } }
function hasSave() { try { var s = JSON.parse(localStorage.getItem('sw_save')); return !!(s && s.G && !s.G.over); } catch (e) { return false; } }
function metrics(g) { var a = swScore(g, 0), b = swScore(g, 1); return { won: swWinner(g) === 0, score: a.total, margin: a.total - b.total, empty: a.empty, bonus: g.bonus === 0 ? 1 : 0, income: g.inc[0], turns: g.turns }; }
function finish() {
  if (T2 && G && G.over) return t2Final();   // W491: the guided first game ends on its own score card
  if (!G || !G.over || UI.finished === G) return; UI.finished = G; try { localStorage.removeItem('sw_save'); if (window.GNS && GNS.saved) GNS.saved('stitchwise', false); } catch (e) { }
  var w = swWinner(G);
  if (UI.camp && typeof GXC !== 'undefined') { var g0 = G; showResult({ after: function () { $('#rs').hidden = true; try { campBest(g0); GXC.finish(g0); campResultNote(g0); } catch (e) { console.error(e); } } }); return; }
  if (!UI.tutorial) { try { if (window.GNS && GNS.result) GNS.result({ game: 'stitchwise', mode: UI.mode === 'hot' ? 'hot' : 'vs', level: UI.lvl, seats: [{ name: 'You', me: true }, { name: UI.names[1], ai: UI.mode === 'hot' ? undefined : UI.lvl }], winner: w, scores: [swScore(G, 0).total, swScore(G, 1).total], turns: G.turns }); } catch (e) { } }
  showResult();
}

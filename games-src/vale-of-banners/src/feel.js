/* Vale of Banners: table feel (W458). Drag dice, tiles and workers like real pieces; region outlines; estate pinch-zoom + camera;
   the rival's placements shown on a peek card; points that fly to the score. Rules stay in engine.js: every drop becomes a legal move. */
var FEEL = { drag: null, cam: { z: 1, x: 0, y: 0 }, eat: 0, from: null, combo: null };
function buzz(ms) { try { if (navigator.vibrate) navigator.vibrate(ms || 12); } catch (e) { } }
function wrap6(v) { return ((v - 1) % 6 + 6) % 6 + 1; }
function bumpOf(i) { return (UI.bump && UI.bump[i]) || 0; }
function effDie(i, s) { var p = G.P[s == null ? VB.actor(G) : s]; return wrap6(p.dice[i] + bumpOf(i)); }
function bumpOk(m) { return typeof m.die !== 'number' || !bumpOf(m.die) || m.v === effDie(m.die); }
function bumpUsed() { var n = 0; for (var k in (UI.bump || {})) n += Math.abs(UI.bump[k]); return n; }
var MEEPLE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5a3.6 3.6 0 0 1 3.6 3.6c0 1-.4 1.9-1 2.5 3 .5 6.6 1.6 6.6 3.6 0 1.3-1.6 1.6-3.4 1.4l2.4 6.9c.2.6-.2 1-.8 1h-4.2L12 17l-3.2 4.5H4.6c-.6 0-1-.4-.8-1l2.4-6.9C4.4 13.8 2.8 13.5 2.8 12.2c0-2 3.6-3.1 6.6-3.6-.6-.6-1-1.5-1-2.5A3.6 3.6 0 0 1 12 2.5z" fill="#c0392b" stroke="#2a1208" stroke-width="1.2"/></svg>';

/* ---------- drag ---------- */
function dragKids(d) {   /* the ghost that follows the finger */
  var g = h('div', { id: 'ghost', 'aria-hidden': 'true' });
  if (d.kind === 'die') { g.appendChild(h('span.die.gdie', { text: effDie(d.idx) })); if (d.tile) { var t = G.depots[d.tile.d][d.tile.k]; g.insertBefore(hexEl(t, { size: 64 }), g.firstChild); g.classList.add('carry'); } }
  else if (d.kind === 'store') g.appendChild(hexEl(G.P[VB.actor(G)].store[d.idx], { size: 64 }));
  else if (d.kind === 'meeple') g.innerHTML = MEEPLE;
  try { artApply(g); } catch (e) { }
  return g;
}
function ghostDraw(d) { var o = $('#ghost'); if (o) o.remove(); d.g = dragKids(d); document.body.appendChild(d.g); ghostAt(d); }
function ghostAt(d) { if (d.g) d.g.style.transform = 'translate(' + (d.x - 32) + 'px,' + (d.y - 64) + 'px)'; }
function dragStart(d) {
  d.on = true; d.prevDie = UI.die; d.prevSel = UI.sel; document.body.classList.add('dragging', 'drag-' + d.kind);
  if (d.kind === 'die') {
    UI.die = d.idx; UI.sel = null;
    if (L.tabs) { var vm = VB.validMoves(G).filter(function (m) { return m.die === d.idx && bumpOk(m); }); var tk = vm.some(function (m) { return m.k === 'take'; }), bd = vm.some(function (m) { return m.k === 'place'; }); if (tk && !bd) UI.tab = 'market'; else if (bd && !tk) UI.tab = 'estate'; }
  }
  if (d.kind === 'store') { UI.sel = d.idx; UI.tab = 'estate'; }
  render(); ghostDraw(d); sfx('take');
}
function hitAt(x, y) { var e = document.elementFromPoint(x, y); return e || null; }
function dragMove(d) {
  ghostAt(d); var e = hitAt(d.x, d.y), hov = null; var old = document.querySelectorAll('.hov'); for (var i = 0; i < old.length; i++) old[i].classList.remove('hov');
  if (!e) return;
  var tab = e.closest('#tabs .tab'); if (tab && L.tabs) { var want = tab.id.replace('tab-', ''); if (want !== UI.tab && want !== 'rival') { clearTimeout(d.tabT); d.tabT = setTimeout(function () { if (FEEL.drag === d) { UI.tab = want; render(); ghostDraw(d); } }, 260); } }
  if (d.kind === 'die') {
    var mt = e.closest('#mk .tilebtn.glow'); if (mt && /^mt-/.test(mt.id)) {
      var pr = mt.id.split('-'), dd = +pr[1], kk = +pr[2];
      if (!d.tile || d.tile.d !== dd || d.tile.k !== kk) { d.tile = { d: dd, k: kk }; comboFor(d); ghostDraw(d); buzz(8); sfx('take'); render(); ghostDraw(d);
        if (L.tabs && FEEL.combo && Object.keys(FEEL.combo).length) { clearTimeout(d.tabT); d.tabT = setTimeout(function () { if (FEEL.drag === d && d.tile) { UI.tab = 'estate'; render(); ghostDraw(d); } }, 450); } }
      hov = mt;
    }
    hov = hov || e.closest('#es .cell.glow') || e.closest('#goods .gbtn.glow');
  } else if (d.kind === 'store') hov = e.closest('#es .cell.glow');
  else if (d.kind === 'meeple') hov = e.closest('#dicerow .die:not(.used):not(.white):not(.rv)');
  if (hov) hov.classList.add('hov');
}
function comboFor(d) {   /* after taking this tile, where could the other die build it right away? */
  FEEL.combo = null; if (!d.tile) return; var mv = legalTakeFor(d.tile.d, d.tile.k).filter(function (m) { return m.die === d.idx; }); var tm = pick(mv); if (!tm) return;
  var c = VB.fclone(G), s = VB.actor(G), r = VB.performMove(c, tm); if (!r.ok) return; d.takeMove = tm;
  var tile = G.depots[d.tile.d][d.tile.k], si = c.P[s].store.map(function (t) { return t.id; }).indexOf(tile.id), o = {};
  VB.validMoves(c).forEach(function (m) { if (m.k === 'place' && m.s === si && m.die !== 'x') { if (!o[m.cell] || m.w < o[m.cell].w) o[m.cell] = { w: m.w, die: m.die }; } });
  FEEL.combo = o;
}
function dragEnd(d) {
  clearTimeout(d.tabT); var e = hitAt(d.x, d.y), done = null; FEEL.from = d.g ? d.g.getBoundingClientRect() : null;
  document.body.classList.remove('dragging', 'drag-' + d.kind);
  if (e && d.kind === 'die') {
    var cell = e.closest('#es .cell'), ci = cell && +cell.id.replace('ec-', '');
    if (d.tile) {
      if (cell && FEEL.combo && FEEL.combo[ci]) done = function () { comboMove(d, ci); };
      else if (!e.closest('#dicerow')) done = function () { doMove(d.takeMove || pick(legalTakeFor(d.tile.d, d.tile.k).filter(function (m) { return m.die === d.idx; }))); };
    } else if (cell && cell.classList.contains('glow')) {
      done = function () { UI.die = d.idx; var tg = placeTargets(); if (tg[ci]) { var list = UI.sel == null ? [tg[ci]] : VB.validMoves(G).filter(function (m) { return m.k === 'place' && m.s === UI.sel && m.cell === ci && m.die === d.idx; }); UI.sel = null; doMove(pick(list)); } };
    } else { var gb = e.closest('#goods .gbtn.glow'); if (gb) { var g = +gb.id.replace('gd-', ''); done = function () { UI.die = d.idx; doMove(pick(movesWhere(function (m) { return m.k === 'sell' && m.v === g && m.die === d.idx; }))); }; } }
  } else if (e && d.kind === 'store') {
    var c2 = e.closest('#es .cell.glow'); if (c2) { var cj = +c2.id.replace('ec-', ''); done = function () { doMove(pick(VB.validMoves(G).filter(function (m) { return m.k === 'place' && m.s === d.idx && m.cell === cj && bumpOk(m) && (UI.die == null || m.die === 'x' || m.die === UI.die); }))); }; }
  } else if (e && d.kind === 'meeple') {
    var die = e.closest('#dicerow .die:not(.used):not(.white):not(.rv)'); if (die) { var i = +die.id.replace('die-', ''), r = die.getBoundingClientRect(); done = function () { bump(i, d.x < r.left + r.width / 2 ? -1 : 1); }; }
  }
  FEEL.combo = null;
  if (d.g) { var g0 = d.g; d.g = null; if (done) { g0.classList.add('snap'); setTimeout(function () { g0.remove(); }, 160); } else { g0.classList.add('back'); var sr = d.src.getBoundingClientRect && d.src.getBoundingClientRect(); if (sr && sr.width) g0.style.transform = 'translate(' + (sr.left) + 'px,' + (sr.top) + 'px) scale(.6)'; setTimeout(function () { g0.remove(); }, 260); } }
  if (done) { buzz(14); sfx('place'); done(); if (d.kind !== 'die') { } } else { UI.die = d.prevDie; UI.sel = d.prevSel; FEEL.from = null; render(); }
  if (!done) setTimeout(function () { FEEL.from = null; }, 0);
}
function comboMove(d, ci) {   /* take with one die, build with the other, one gesture */
  var tile = G.depots[d.tile.d][d.tile.k], tm = d.takeMove; if (!tm) return;
  var p0 = doMove(tm); (p0 && p0.then ? p0 : Promise.resolve()).then(function () {
    if (!G || G.over || !isHuman(VB.actor(G))) return; var s = VB.actor(G), si = G.P[s].store.map(function (t) { return t.id; }).indexOf(tile.id); if (si < 0) return;
    var list = VB.validMoves(G).filter(function (m) { return m.k === 'place' && m.s === si && m.cell === ci && m.die !== 'x'; }); var m = pick(list); if (m) { UI.die = null; doMove(m); }
  });
}
function bump(i, k) {
  var p = G.P[VB.actor(G)]; UI.bump = UI.bump || {};
  if (bumpUsed() + (Math.abs(bumpOf(i) + k) - Math.abs(bumpOf(i))) > p.workers) { toast('No workers left. Use a die to hire 2.'); sfx('bad'); return; }
  UI.bump[i] = bumpOf(i) + k; if (UI.bump[i] === 0 || Math.abs(UI.bump[i]) >= 6) delete UI.bump[i];
  UI.die = i; PV = { key: '' }; render(); var de = $('#die-' + i); if (de && de.animate) de.animate([{ transform: 'rotate(-14deg) scale(1.15)' }, { transform: 'none' }], { duration: animMs(260) || 1 });
  toast('Worker moves your ' + p.dice[i] + ' to ' + effDie(i) + '. Tap the die to undo.', 2200);
}
function feelDrag() {
  document.addEventListener('pointerdown', function (e) {
    var src = e.target.closest && e.target.closest('[data-drag]'); if (!src || !myTurn() || e.button > 0) return;
    FEEL.drag = { src: src, kind: src.getAttribute('data-drag'), idx: +src.getAttribute('data-idx'), x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, on: false, pid: e.pointerId };
  });
  addEventListener('pointermove', function (e) {
    var d = FEEL.drag; if (!d || e.pointerId !== d.pid) return; d.x = e.clientX; d.y = e.clientY;
    if (!d.on) { if (Math.hypot(d.x - d.x0, d.y - d.y0) < 9 || !myTurn()) return; dragStart(d); }
    dragMove(d); e.preventDefault();
  }, { passive: false });
  addEventListener('pointerup', function (e) { var d = FEEL.drag; if (!d || e.pointerId !== d.pid) return; FEEL.drag = null; if (d.on) { FEEL.eat = Date.now(); dragEnd(d); } });
  addEventListener('pointercancel', function () { var d = FEEL.drag; FEEL.drag = null; if (d && d.on) { d.x = -9; d.y = -9; dragEnd(d); } });
  document.addEventListener('click', function (e) { if (FEEL.eat && Date.now() - FEEL.eat < 450) { e.stopPropagation(); e.preventDefault(); FEEL.eat = 0; } }, true);
}

/* ---------- estate: region outlines, zoom, camera ---------- */
var DIRS = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];   /* axial neighbours at 0, 60, ... 300 degrees (y down) */
function regionSvg(S, W, HH, p) {
  var key = {}; VB.CELLS.forEach(function (c) { key[c.q + ',' + c.r] = c; });
  var plain = [], full = [];
  VB.CELLS.forEach(function (c) {
    var xy = cellXY(c, S, W, HH), done = p && VB.REGIONS[c.reg].cells.every(function (x) { return p.estate[x]; });
    DIRS.forEach(function (dv, k) {
      var n = key[(c.q + dv[0]) + ',' + (c.r + dv[1])]; if (n && n.reg === c.reg) return;
      var a1 = (k * 60 - 30) * Math.PI / 180, a2 = (k * 60 + 30) * Math.PI / 180, R = S * 1.0;
      var seg = 'M' + (xy.x + R * Math.cos(a1)).toFixed(1) + ' ' + (xy.y + R * Math.sin(a1)).toFixed(1) + 'L' + (xy.x + R * Math.cos(a2)).toFixed(1) + ' ' + (xy.y + R * Math.sin(a2)).toFixed(1);
      (done ? full : plain).push(seg);
    });
  });
  var sw = Math.max(2.2, S * 0.11);
  return '<svg class="regs" width="' + W + '" height="' + HH + '" viewBox="0 0 ' + W + ' ' + HH + '" aria-hidden="true">' +
    '<path d="' + plain.join('') + '" stroke="#1d140a" stroke-width="' + (sw * 1.9) + '" stroke-linecap="round" fill="none"/>' +
    '<path d="' + plain.join('') + '" stroke="#f4ecd8" stroke-width="' + sw + '" stroke-linecap="round" fill="none"/>' +
    '<path d="' + full.join('') + '" stroke="#ffd23a" stroke-width="' + (sw * 1.3) + '" stroke-linecap="round" fill="none"/></svg>';
}
function camApply(el, smooth) {
  var c = FEEL.cam, w = el || $('#esin'); if (!w) return;
  w.style.transition = smooth && !UI.fast ? 'transform ' + (animMs(420) / 1000) + 's cubic-bezier(.2,.8,.2,1)' : 'none';
  w.style.transform = 'translate(' + c.x + 'px,' + c.y + 'px) scale(' + c.z + ')';
  var f = $('#zfit'); if (f) f.hidden = c.z <= 1.02;
}
function camClamp() { var c = FEEL.cam, W = L.ew, H = L.eh; c.z = Math.max(1, Math.min(2.6, c.z)); c.x = Math.min(0, Math.max(W - W * c.z, c.x)); c.y = Math.min(0, Math.max(H - H * c.z, c.y)); if (c.z <= 1.001) { c.z = 1; c.x = 0; c.y = 0; } }
function camTo(ci, z) {   /* glide so cell ci is in view; returns a promise when settled */
  if (UI.fast || !L.ew) return Promise.resolve(); var c = FEEL.cam, cell = VB.CELLS[ci], xy = cellXY(cell, L.s, L.ew, L.eh);
  var zz = z || c.z; if (zz <= 1.01 && !z) return Promise.resolve();
  c.z = zz; c.x = L.ew / 2 - xy.x * zz; c.y = L.eh / 2 - xy.y * zz; camClamp(); camApply(null, true); return wait(animMs(380));
}
function camReset(smooth) { FEEL.cam = { z: 1, x: 0, y: 0 }; camApply(null, smooth); }
function feelZoom() {
  var es = $('#es'), P = {}, st = null;
  var fit = h('button', { id: 'zfit', type: 'button', hidden: true, text: 'Fit', 'aria-label': 'Zoom out to the whole estate', onclick: function () { camReset(true); } });
  $('#bd').appendChild(fit);
  es.addEventListener('pointerdown', function (e) {
    if (FEEL.drag && FEEL.drag.on) return; P[e.pointerId] = { x: e.clientX, y: e.clientY }; var ids = Object.keys(P);
    if (ids.length === 2) { var a = P[ids[0]], b = P[ids[1]], r = es.getBoundingClientRect(); st = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, z: FEEL.cam.z, x: FEEL.cam.x, y: FEEL.cam.y, cx: (a.x + b.x) / 2 - r.left, cy: (a.y + b.y) / 2 - r.top }; FEEL.drag = null; }
    else if (ids.length === 1 && FEEL.cam.z > 1) st = { pan: 1, x0: e.clientX, y0: e.clientY, x: FEEL.cam.x, y: FEEL.cam.y, moved: false };
  });
  es.addEventListener('pointermove', function (e) {
    if (!P[e.pointerId] || !st) return; P[e.pointerId] = { x: e.clientX, y: e.clientY }; var ids = Object.keys(P), c = FEEL.cam;
    if (ids.length === 2 && !st.pan) { var a = P[ids[0]], b = P[ids[1]], k = Math.hypot(a.x - b.x, a.y - b.y) / st.d; c.z = st.z * k; c.x = st.cx - (st.cx - st.x) * (c.z / st.z); c.y = st.cy - (st.cy - st.y) * (c.z / st.z); camClamp(); camApply(); FEEL.eat = Date.now(); }
    else if (st.pan && !(FEEL.drag && FEEL.drag.on)) { var dx = e.clientX - st.x0, dy = e.clientY - st.y0; if (!st.moved && Math.hypot(dx, dy) < 8) return; st.moved = true; c.x = st.x + dx; c.y = st.y + dy; camClamp(); camApply(); FEEL.eat = Date.now(); }
  });
  var up = function (e) { delete P[e.pointerId]; if (!Object.keys(P).length) st = null; };
  es.addEventListener('pointerup', up); es.addEventListener('pointercancel', up);
  es.addEventListener('wheel', function (e) { if (!e.ctrlKey && !e.altKey) return; e.preventDefault(); var r = es.getBoundingClientRect(), c = FEEL.cam, z0 = c.z, cx = e.clientX - r.left, cy = e.clientY - r.top; c.z = z0 * (e.deltaY < 0 ? 1.15 : 0.87); c.x = cx - (cx - c.x) * (c.z / z0); c.y = cy - (cy - c.y) * (c.z / z0); camClamp(); camApply(); }, { passive: false });
}

/* ---------- moments: region flash, points that fly, rival peek, dice roll ---------- */
function flashRegion(ci, seat) {
  if (UI.fast) return; var reg = VB.REGIONS[VB.CELLS[ci].reg];
  if (seat === UI.view) reg.cells.forEach(function (x) { var e = document.getElementById('ec-' + x); if (e) { e.classList.remove('rflash'); void e.offsetWidth; e.classList.add('rflash'); } });
  else { var pk = $('#peek'); if (pk) reg.cells.forEach(function (x) { var e = pk.querySelector('[data-ci="' + x + '"]'); if (e) e.classList.add('rflash'); }); }
}
function flyPts(from, toEl, txt) {
  if (UI.fast || !from || !toEl) return Promise.resolve(); var to = toEl.getBoundingClientRect(); if (!to.width) return Promise.resolve();
  var e = h('div.ptfly', { text: txt, style: 'left:' + (from.left + from.width / 2) + 'px;top:' + (from.top + from.height / 2) + 'px' }); document.body.appendChild(e);
  var ms = animMs(650); requestAnimationFrame(function () { requestAnimationFrame(function () { e.style.transition = 'transform ' + ms / 1000 + 's cubic-bezier(.5,0,.3,1),opacity .2s ' + (ms * .85) / 1000 + 's'; e.style.transform = 'translate(' + (to.left + to.width / 2 - from.left - from.width / 2) + 'px,' + (to.top + to.height / 2 - from.top - from.height / 2) + 'px) translate(-50%,-50%) scale(.7)'; e.style.opacity = '0'; }); });
  return wait(ms).then(function () { e.remove(); toEl.classList.remove('ptbump'); void toEl.offsetWidth; toEl.classList.add('ptbump'); });
}
function scoreEl(seat) { return seat === UI.view ? ($('.och[data-seat="' + seat + '"] .pts') || $('#r-vp')) : ($('.och[data-seat="' + seat + '"] .pts') || $('#opp')); }
function rivalPeek(ev) {   /* a card with the rival's estate; the tile flies onto its space */
  if (UI.fast || QS.get('scn')) return Promise.resolve();
  var old = $('#peek'); if (old) old.remove(); var s = ev.p, n = G.seats[s].name;
  var pk = h('div', { id: 'peek', role: 'status', 'aria-live': 'polite' }); pk.appendChild(h('div.pkh', {}, [h('span.ban', { style: 'background:' + VB.SEATCOL[s] }), h('b', { text: n + ' builds ' + aName(ev.tile) })]));
  var box = h('div.minies'); pk.appendChild(box); document.body.appendChild(pk);
  var w = Math.min(330, innerWidth - 40), S = w / (7 * 1.732 + 0.4); renderEstate(box, s, S);
  var cell = box.querySelector('[data-ci="' + ev.cell + '"]'); if (cell) cell.style.visibility = 'hidden';
  var from = chipRect(s);
  pk.classList.add('on');
  return wait(animMs(260)).then(function () {
    var to = cell && cell.getBoundingClientRect(); if (!from || !to) return;
    return fly(from, to, ev.tile);
  }).then(function () { if (cell) { cell.style.visibility = ''; cell.classList.add('landed'); } UI.peekCell = cell; return wait(animMs(UI.quick ? 250 : 650)); });
}
function peekOff() { var pk = $('#peek'); if (pk) { pk.classList.remove('on'); setTimeout(function () { pk.remove(); }, 250); } UI.peekCell = null; }
function chipRect(s) { var oc = document.querySelector('.och[data-seat="' + s + '"]'), r = oc && oc.getBoundingClientRect(); if (!r || !r.width) return null; return { left: r.left + 8, top: r.top + r.height / 2 - 23, width: 40, height: 46 }; }
function aName(t) { var n = VB.tileName(t); return (/^[aeiou]/i.test(n) ? 'an ' : 'a ') + n; }
function rollDice(el, vals) {   /* dice tumble, then land on the rolled numbers */
  if (!el || UI.fast) return; var ds = el.querySelectorAll('.rd'), t0 = Date.now(), ms = animMs(520);
  (function f() { var k = (Date.now() - t0) / (ms || 1); for (var i = 0; i < ds.length; i++) ds[i].textContent = k < 1 ? 1 + Math.floor(Math.random() * 6) : vals[i]; if (k < 1) setTimeout(f, 60); })();
}
function feelInit() { feelDrag(); feelZoom(); }

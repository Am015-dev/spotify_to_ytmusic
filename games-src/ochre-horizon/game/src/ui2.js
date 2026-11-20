// ===== part 2: the board (poster planet, hexes, tiles), pan / pinch zoom, tapping spaces =====
var HR = 22, SQ3 = Math.sqrt(3);
function hexXY(s) { var S = M.spaces[s]; return [HR * SQ3 * (S.q + S.r / 2), HR * 1.5 * S.r]; }
function hexPath(x, y, r) { var p = ''; for (var i = 0; i < 6; i++) { var a = Math.PI / 180 * (60 * i - 30); p += (i ? 'L' : 'M') + (x + r * Math.cos(a)).toFixed(1) + ' ' + (y + r * Math.sin(a)).toFixed(1); } return p + 'Z'; }
var OFFXY = { m1: [-178, -150], m2: [178, -150] };
function spaceXY(s) { return M.spaces[s] ? hexXY(s) : OFFXY[s]; }
function glyphAt(k, x, y, sz, col) { var s = sz / 24; return '<g transform="translate(' + (x - sz / 2).toFixed(1) + ' ' + (y - sz / 2).toFixed(1) + ') scale(' + s.toFixed(3) + ')" style="color:' + col + '">' + A.GLYPH[k] + '</g>'; }
var boardBuilt = false;
function buildBoard() {
  var svg = $('board');
  var h = A.DEFS + '<g id="vp">';
  // poster backdrop: sky, striped sun, stars
  h += '<rect x="-700" y="-700" width="1400" height="1400" fill="url(#sky)"/>';
  var r = A.rng(11); for (var i = 0; i < 70; i++) h += '<circle cx="' + (r() * 1000 - 500).toFixed(0) + '" cy="' + (r() * 700 - 600).toFixed(0) + '" r="' + (r() * 1.6 + .3).toFixed(1) + '" fill="#f6e7c8" opacity="' + (r() * .6 + .2).toFixed(2) + '"/>';
  h += '<circle cx="150" cy="-150" r="150" fill="url(#sunG)"/>';
  for (var k = 0; k < 7; k++) h += '<rect x="0" y="' + (-120 + k * 22) + '" width="320" height="' + (2 + k * 1.6) + '" fill="#3a2a48" opacity=".9"/>';
  // the planet
  h += '<circle cx="0" cy="0" r="196" fill="#1c120d" opacity=".5" transform="translate(6 8)"/>';
  h += '<circle cx="0" cy="0" r="196" fill="url(#planet)"/>';
  h += '<path d="M-196 -40 Q0 -70 196 -30 L196 -14 Q0 -50 -196 -22Z M-190 60 Q0 30 190 70 L186 84 Q0 48 -188 76Z" fill="#7a2a1c" opacity=".35"/>';
  h += '<circle cx="0" cy="0" r="196" fill="url(#ht)" opacity=".7"/>';
  h += '<circle cx="0" cy="0" r="196" fill="none" stroke="#ffb06a" stroke-width="3" opacity=".6"/>';
  // off-map moons
  ['m1', 'm2'].forEach(function (m) { var xy = OFFXY[m]; h += '<circle cx="' + xy[0] + '" cy="' + xy[1] + '" r="20" fill="#c9b79a" stroke="#1c120d" stroke-width="2"/><circle cx="' + (xy[0] - 6) + '" cy="' + (xy[1] - 5) + '" r="5" fill="#a8977b"/>'; });
  h += '<g id="hexes"></g><g id="fxl"></g></g>';
  svg.innerHTML = h;
  boardBuilt = true;
  fitView();
}
function renderBoard() {
  if (!boardBuilt) buildBoard();
  if (!G) return;
  var pend = G.pending && G.pending.h === 'place' && G.pending.p === 0 ? G.pending.d : null;
  var h = '';
  M.order.concat(['m1', 'm2']).forEach(function (s) {
    var S = M.spaces[s] || M.OFFMAP[s], xy = spaceXY(s), x = xy[0], y = xy[1], T = G.tiles[s];
    var legal = pend && pend.spaces.indexOf(s) >= 0, sel = UI.sel === s;
    var off = !!M.OFFMAP[s];
    if (off && !T && !legal) { h += '<g class="hex" data-s="' + s + '"><circle cx="' + x + '" cy="' + y + '" r="22" fill="transparent"/></g>'; return; }
    var fill = 'rgba(246,231,200,.12)', stroke = 'rgba(246,231,200,.42)', dash = '';
    if (S.ocean && !T) { fill = 'rgba(40,140,200,.62)'; stroke = '#bfe6ff'; dash = ' stroke-dasharray="4 3"'; }
    if (T) fill = T.t === 'ocean' ? '#1f6f9a' : T.t === 'greenery' ? '#4f8f3a' : T.t === 'city' ? '#ead2a4' : '#b9467a';
    var cls = 'hex' + (legal ? ' tgt bf-tgt' : '') + (sel ? ' sel' : '');
    h += '<g class="' + cls + '" data-s="' + s + '"' + (legal ? ' data-legal="1"' : '') + '>';
    h += '<path d="' + hexPath(x, y, off ? 21 : HR - 1) + '" fill="' + fill + '"/>';
    if (!T) {
      var bs = S.bonus || [], n = bs.length;
      bs.forEach(function (b, i) { var bx = x + (i - (n - 1) / 2) * 12; h += '<circle cx="' + bx + '" cy="' + y + '" r="6.5" fill="' + A.RES[b].col + '" stroke="#1c120d" stroke-width="1.2"/>' + glyphAt(b, bx, y, 9, A.RES[b].fg); });
      if (S.volcanic) h += '<path d="M' + (x - 7) + ' ' + (y - 9) + 'l7-8 7 8z" fill="#1c120d" opacity=".75"/>';
      if (S.reserved) h += '<path d="M' + (x - 8) + ' ' + (y - 6) + 'a8 8 0 0 1 16 0z" fill="none" stroke="#f6e7c8" stroke-width="2" stroke-dasharray="2 2"/>';
    } else {
      if (T.t === 'ocean') h += '<path d="M' + (x - 11) + ' ' + (y - 4) + 'q5.5-5 11 0t11 0M' + (x - 11) + ' ' + (y + 4) + 'q5.5-5 11 0t11 0" fill="none" stroke="#bfe6ff" stroke-width="2"/>';
      else h += glyphAt(T.t === 'greenery' ? 'greenery' : T.t === 'city' ? 'city' : 'special', x, y + 1, 22, T.t === 'city' ? '#1c120d' : '#f6e7c8');
      if (T.o >= 0) h += '<circle cx="' + (x + 11) + '" cy="' + (y - 11) + '" r="5.5" fill="' + (T.o === 0 ? '#ff7a2f' : '#46c3d6') + '" stroke="#1c120d" stroke-width="1.6"/>';
    }
    h += '<path class="ho" d="' + hexPath(x, y, off ? 21 : HR - 1) + '" fill="none" stroke="' + stroke + '" stroke-width="1.4"' + dash + '/>';
    h += '</g>';
  });
  $('hexes').innerHTML = h;
  // confirm button for a selected space
  var cf = $('confirm');
  if (pend && !UI.sel && pend.spaces.length === 1 && OH.sideToAct() === 0) UI.sel = pend.spaces[0];
  if (pend && UI.sel && pend.spaces.indexOf(UI.sel) >= 0) {
    cf.classList.add('on');
    var g = gainsAt(0, pend.t, UI.sel);
    $('confirmb').innerHTML = 'Place ' + (pend.t === 'special' ? 'tile' : pend.t) + ' here<small>' + (g.length ? 'You get: ' + g.join(', ') : 'No bonus here, still counts') + '</small>';
  } else cf.classList.remove('on');
}
function gainsAt(p, t, s) {
  var S = M.spaces[s] || M.OFFMAP[s], out = [], cnt = {};
  (S.bonus || []).forEach(function (b) { cnt[b] = (cnt[b] || 0) + 1; });
  for (var b in cnt) out.push(cnt[b] + ' ' + (b === 'card' ? (cnt[b] > 1 ? 'cards' : 'card') : RN[b]));
  var oc = (S.adj || []).filter(function (a) { return G.tiles[a] && G.tiles[a].t === 'ocean'; }).length;
  if (oc) out.push(2 * oc + ' credits (oceans)');
  if (t === 'greenery' && G.oxy < 14) out.push('+1 oxygen');
  if (t === 'ocean') out.push('+1 rating');
  if (t === 'city') { var gr = (S.adj || []).filter(function (a) { return G.tiles[a] && G.tiles[a].t === 'greenery'; }).length; if (gr) out.push(gr + ' VP now'); }
  return out;
}
// ---------- view: fit, zoom, pan ----------
function bwSize() { var r = $('bw').getBoundingClientRect(); return [Math.max(50, r.width), Math.max(50, r.height)]; }
function applyView() {
  var sz = bwSize(), w = sz[0], hh = sz[1], v = UI.view;
  var base = (UI.pc ? 352 : 420) / Math.min(w, hh);   // units per px at s=1
  var uw = w * base / v.s, uh = hh * base / v.s;
  $('zin').disabled = v.s >= 3.19; $('zout').disabled = v.s <= 1.001; $('zfit').disabled = v.s <= 1.001 && v.x === 0;
  $('board').setAttribute('viewBox', (v.x - uw / 2).toFixed(1) + ' ' + (v.y - uh / 2).toFixed(1) + ' ' + uw.toFixed(1) + ' ' + uh.toFixed(1));
}
function fitView() { UI.view = { s: 1, x: 0, y: -4 }; applyView(); }
function zoomBy(f, cx, cy) {
  var v = UI.view, ns = Math.max(1, Math.min(3.2, v.s * f));
  if (cx !== undefined) { var k = 1 - v.s / ns; v.x += (cx - v.x) * k; v.y += (cy - v.y) * k; }
  v.s = ns; clampView(); applyView();
}
function clampView() { var v = UI.view, lim = 200 * (1 - 1 / v.s) + 10; v.x = Math.max(-lim, Math.min(lim, v.x)); v.y = Math.max(-lim - 10, Math.min(lim, v.y)); if (v.s === 1) { v.x = 0; v.y = -4; } }
function clientToSvg(cx, cy) { var svg = $('board'), pt = svg.createSVGPoint(); pt.x = cx; pt.y = cy; var m = svg.getScreenCTM(); if (!m) return [0, 0]; var q = pt.matrixTransform(m.inverse()); return [q.x, q.y]; }
(function bindBoard() {
  var svg = $('board'), ptrs = {}, start = null, moved = false, pinch = null;
  svg.addEventListener('pointerdown', function (e) {
    ptrs[e.pointerId] = [e.clientX, e.clientY];
    var ids = Object.keys(ptrs);
    if (ids.length === 1) { start = { x: e.clientX, y: e.clientY, vx: UI.view.x, vy: UI.view.y, t: e.target }; moved = false; }
    if (ids.length === 2) { var a = ptrs[ids[0]], b = ptrs[ids[1]]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), s: UI.view.s }; moved = true; }
  });
  svg.addEventListener('pointermove', function (e) {
    if (!ptrs[e.pointerId]) return;
    ptrs[e.pointerId] = [e.clientX, e.clientY];
    var ids = Object.keys(ptrs);
    if (ids.length === 2 && pinch) { var a = ptrs[ids[0]], b = ptrs[ids[1]], d = Math.hypot(a[0] - b[0], a[1] - b[1]); UI.view.s = Math.max(1, Math.min(3.2, pinch.s * d / pinch.d)); clampView(); applyView(); return; }
    if (start && ids.length === 1) {
      var dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (Math.hypot(dx, dy) > 9) moved = true;
      if (moved && UI.view.s > 1) { var sz = bwSize(), base = (UI.pc ? 352 : 420) / Math.min(sz[0], sz[1]) / UI.view.s; UI.view.x = start.vx - dx * base; UI.view.y = start.vy - dy * base; clampView(); applyView(); }
    }
  });
  function up(e) {
    var was = ptrs[e.pointerId]; delete ptrs[e.pointerId];
    if (Object.keys(ptrs).length < 2) pinch = null;
    if (!was || !start) return;
    if (!moved && Object.keys(ptrs).length === 0) { var g = (start.t.closest && start.t.closest('.hex')); if (g) tapSpace(g.getAttribute('data-s')); }
    if (!Object.keys(ptrs).length) start = null;
  }
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', function (e) { delete ptrs[e.pointerId]; pinch = null; start = null; });
  svg.addEventListener('wheel', function (e) { e.preventDefault(); var q = clientToSvg(e.clientX, e.clientY); zoomBy(e.deltaY < 0 ? 1.15 : 1 / 1.15, q[0], q[1]); }, { passive: false });
  svg.addEventListener('dblclick', function (e) { var q = clientToSvg(e.clientX, e.clientY); zoomBy(1.6, q[0], q[1]); });
})();
function tapSpace(s) {
  if (!G || UI.busy) return;
  var pend = G.pending && G.pending.h === 'place' && G.pending.p === 0 && OH.sideToAct() === 0 ? G.pending.d : null;
  if (pend && pend.spaces.indexOf(s) >= 0) {
    if (UI.sel === s) { confirmPlace(); return; }
    UI.sel = s; renderBoard(); setHint(hintNow()); sfx('tick'); return;
  }
  // info about the space
  var S = M.spaces[s] || M.OFFMAP[s], T = G.tiles[s], parts = [];
  if (S.name) parts.push(S.name);
  if (T) parts.push((T.t === 'ocean' ? 'Ocean' : (T.o === 0 ? 'Your ' : 'Rival ') + (T.t === 'special' ? 'special tile' : T.t)) + (T.card ? ' · ' + OH.card(T.card).name : ''));
  else {
    if (S.ocean) parts.push('Ocean space: only oceans go here');
    else if (S.offmap) parts.push('Off the map: only one card can build here');
    else if (S.reserved) parts.push('Reserved: only one card can build here');
    var g = gainsAt(0, 'city', s).filter(function (x) { return !/VP/.test(x); }); parts.push(g.length ? 'Bonus: ' + g.join(', ') : 'No bonus');
  }
  toast(parts.join(' · '), true, 1800, { now: true, key: 'space' });
}
function confirmPlace() {
  var pend = G.pending && G.pending.d; if (!pend || !UI.sel) return;
  var s = UI.sel; UI.sel = null;
  doMove({ t: 'place', s: s });
}
$('confirmb').addEventListener('click', confirmPlace);
$('zin').addEventListener('click', function () { zoomBy(1.4); });
$('zout').addEventListener('click', function () { zoomBy(1 / 1.4); });
$('zfit').addEventListener('click', fitView);
function hexCenterPx(s) { var xy = spaceXY(s), svg = $('board'), m = svg.getScreenCTM(); if (!m) return null; var pt = svg.createSVGPoint(); pt.x = xy[0]; pt.y = xy[1]; var q = pt.matrixTransform(m); return [q.x, q.y]; }
// taps >= 44 px (R99): when you place a tile on a small screen, zoom so each hex is at least 46 px wide
function hexPx() { var sz = bwSize(); return HR * SQ3 * Math.min(sz[0], sz[1]) / 420 * UI.view.s; }
function autoZoomPlace(spaces) {
  var px = hexPx(); if (px >= 47 || !spaces.length) return;
  var xs = 0, ys = 0; spaces.forEach(function (s) { var xy = spaceXY(s); xs += xy[0]; ys += xy[1]; });
  UI.view.s = Math.min(3.2, UI.view.s * 48 / px); UI.view.x = xs / spaces.length; UI.view.y = ys / spaces.length; clampView(); applyView(); UI.autoZ = true;
}
function focusSpace(s) { if (UI.view.s > 1.05) { var xy = spaceXY(s); UI.view.x = xy[0]; UI.view.y = xy[1]; clampView(); applyView(); } }

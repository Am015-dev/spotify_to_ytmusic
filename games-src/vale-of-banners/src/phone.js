/* PHONE LAYOUT (vale-of-banners): portrait-phone view tabs (estate / market / rival), market and estate fitting above the dock, auto-zoom.
   Loaded before ui.js; uses its globals (G, UI, L, $, h, render...). */
function fitMarket() {   /* phone tabs: shrink the stalls (or lay the six stalls in one row) until the market sits fully above the dock */
  var mk = $('#mk'); if (!L.tabs || UI.tab !== 'market' || mk.style.display === 'none') { mk.classList.remove('six'); return; }
  var bdT = $('#bd').getBoundingClientRect().top, dk = $('#dock'), dkT = dk && dk.offsetHeight ? dk.getBoundingClientRect().top - bdT - 6 : 1e9;
  var limit = Math.min(L.ey + L.eh, dkT), hx = parseInt(mk.style.getPropertyValue('--hex'), 10) || 44, best = null;
  function bottom() { return mk.getBoundingClientRect().top - $('#bd').getBoundingClientRect().top + mk.scrollHeight; }
  [false, true].forEach(function (six) {
    if (best && best.fit) return;
    mk.classList.toggle('six', six); mk.style.gridTemplateColumns = six ? 'repeat(6,minmax(0,1fr))' : 'repeat(3,1fr)'; mk.style.gap = six ? '3px' : '6px';
    var h0 = hx; mk.style.setProperty('--hex', h0 + 'px');
    while (bottom() > limit && h0 > 30) { h0 -= 2; mk.style.setProperty('--hex', h0 + 'px'); }
    var r = { six: six, hex: h0, b: bottom() }; r.fit = r.b <= limit;
    if (!best || (r.fit && !best.fit) || (r.fit && best.fit && r.hex > best.hex) || (!r.fit && !best.fit && r.b < best.b)) best = r;   /* nothing fits: take the shorter layout */
  });
  mk.classList.toggle('six', best.six); mk.style.gridTemplateColumns = best.six ? 'repeat(6,minmax(0,1fr))' : 'repeat(3,1fr)'; mk.style.gap = best.six ? '3px' : '6px'; mk.style.setProperty('--hex', best.hex + 'px');
  L.mkFit = best;
}
function portraitPhone() { return innerWidth <= 640 && innerHeight > innerWidth; }
function phoneTabs() { var b = $('#bd'); return b.clientWidth <= 640 && (portraitPhone() || b.clientWidth <= b.clientHeight * 1.15); }
function ensureTabs(y, pad) {
  var t = $('#tabs'); if (!t) { t = h('div', { id: 'tabs', role: 'tablist' }); $('#bd').appendChild(t); }
  t.style.cssText = 'left:' + pad + 'px;right:' + pad + 'px;top:' + y + 'px';
  var mt = myTurn(), mkHas = mt && !!document.querySelector('#mk .glow'), rvName = G ? G.seats[rivalSeat()].name : 'Rival';
  t.innerHTML = '';
  var rvl = rvName; if (L.tiny && G) rvl = rvName + ' · ' + G.P[rivalSeat()].vp;
  [['estate', L.tiny && G ? 'You · ' + G.P[UI.view].vp : 'Your estate'], ['market', 'Market'], ['rival', rvl]].forEach(function (x) {
    var on = UI.tab === x[0], has = x[0] === 'market' ? mkHas : x[0] === 'estate' ? (mt && UI.sel != null) : false;
    t.appendChild(h('button.tab' + (on ? '.on' : '') + (has && !on ? '.has' : ''), { type: 'button', id: 'tab-' + x[0], role: 'tab', 'aria-selected': on ? 'true' : 'false', text: x[1], onclick: function () { UI.tab = x[0]; UI.pinTab = null; render(); } }));
  });
}
function rivalSeat() { if (!G) return 1; var best = -1, bs = 1; for (var i = 0; i < G.n; i++) if (i !== UI.view && G.P[i].vp > best) { best = G.P[i].vp; bs = i; } return G.n === 1 ? 0 : bs; }
function ensureRival() { var r = $('#rv'); if (!r) { r = h('div', { id: 'rv', role: 'group', 'aria-label': 'Rival estate' }); $('#bd').appendChild(r); } return r; }
function renderRival() {
  var r = ensureRival(); if (!L.tabs || UI.tab !== 'rival') return; r.innerHTML = ''; var s = rivalSeat(), p = G.P[s];
  r.appendChild(h('div.rvh', { text: G.seats[s].name + ': ' + p.vp + ' points · ' + p.silver + ' silver · ' + p.workers + ' workers' + (G.n > 2 ? ' (tap a name above for the others)' : '') }));
  var box = h('div.minies'); r.appendChild(box); var hh = r.clientHeight - 40, w = r.clientWidth;
  var S = Math.min(w / (7 * 1.732 + 0.4), hh / 11.1); renderEstate(box, s, S);
}
function autoZoom() {   /* small phones: when build spaces glow and would be under 44 px, zoom the estate onto them (Fit / pinch undo it) */
  if (UI.fast || !G || !L.tabs || UI.tab !== 'estate' || UI.busy) return;
  if (UI.autoZ === 'anim' && FEEL.cam.z > 1.02 && myTurn() && document.querySelector('#es .cell.glow') && !(FEEL.drag && FEEL.drag.on)) { UI.autoZ = null; camReset(false); }   /* a build zoom must not hide the next glowing spaces (Keep's free action) */
  var need = 46 / (L.s * 1.732); if (need <= 1.02) return;
  var gl = [].slice.call(document.querySelectorAll('#es .cell.glow')), drag = !!(FEEL.drag && FEEL.drag.on);
  if (!gl.length || !myTurn()) { if (UI.autoZ) { UI.autoZ = null; if (!drag) camReset(true); } return; }
  var key = gl.map(function (e) { return e.getAttribute('data-ci'); }).join(','); if (UI.autoZ === key) { var er = $('#es').getBoundingClientRect(); if (gl.every(function (e) { var r = e.getBoundingClientRect(), x = (r.left + r.right) / 2, y = (r.top + r.bottom) / 2; return x > er.left && x < er.right && y > er.top && y < er.bottom; })) return; }   /* same spaces, but re-centre if one drifted out of view */
  if (FEEL.cam.z > 1.02 && !UI.autoZ) return;   /* the player zoomed by hand: leave it */
  var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  gl.forEach(function (e) { var xy = cellXY(VB.CELLS[+e.getAttribute('data-ci')], L.s, L.ew, L.eh); x0 = Math.min(x0, xy.x); x1 = Math.max(x1, xy.x); y0 = Math.min(y0, xy.y); y1 = Math.max(y1, xy.y); });
  var zf = Math.min((L.ew - 56) / Math.max(1, x1 - x0), (L.eh - 56) / Math.max(1, y1 - y0)), zz = Math.max(1, Math.min(2.6, need, zf));   /* never zoom a glowing space out of view */
  if (zz <= 1.02) { if (UI.autoZ) { UI.autoZ = null; if (!drag) camReset(true); } UI.autoZ = key; return; }
  var c = FEEL.cam; c.z = zz; c.x = L.ew / 2 - (x0 + x1) / 2 * c.z; c.y = L.eh / 2 - (y0 + y1) / 2 * c.z; camClamp(); camApply(null, !drag); UI.autoZ = key;
}
function fitEstate() {   /* phone: the estate takes what the market leaves */
  var b = $('#bd'), mk = $('#mk'), W = b.clientWidth, H = b.clientHeight; if (W > H * 1.15 && !portraitPhone()) return;
  if (phoneTabs()) { L.s = Math.max(12, Math.min(L.ew / (7 * 1.732 + 0.4), L.eh / 11.1)); $('#es').style.cssText = (UI.tab === 'estate' ? '' : 'display:none;') + 'left:' + L.ex + 'px;top:' + L.ey + 'px;width:' + L.ew + 'px;height:' + L.eh + 'px;--hex:' + Math.floor(L.s * 1.732 + 1) + 'px'; return; }
  L.tabs = false; var t0 = $('#tabs'); if (t0) t0.remove(); var r0 = $('#rv'); if (r0) r0.style.display = 'none'; mk.classList.remove('big'); $('#es').style.display = '';
  L.ey = mk.offsetTop + mk.offsetHeight + 4; L.eh = Math.max(80, H - L.ey - 4);
  L.s = Math.max(12, Math.min(L.ew / (7 * 1.732 + 0.4), L.eh / 11.1));
  $('#es').style.cssText = 'left:' + L.ex + 'px;top:' + L.ey + 'px;width:' + L.ew + 'px;height:' + L.eh + 'px;--hex:' + Math.floor(L.s * 1.732 + 1) + 'px';
}

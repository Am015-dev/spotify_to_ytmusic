// ui1: page state, icons, the map (SVG over the mosaic), the camera (pan, pinch, wheel, follow) and the dock (prompt, storehouse, hand).
var G = null;
var D = VTD;
var UI = { mode: 'vs', lvl: 'easy', hints: true, busy: false, fast: false, sel: null, selCol: null, selProv: null, view: null, mosaic: null, learn: false, AIDELAY: 650, trade: null };
var $ = function (s) { return document.querySelector(s); };
var SVGNS = 'http://www.w3.org/2000/svg';
function el(tag, attrs, parent) { var e = document.createElementNS(SVGNS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function icon(name, cls) { return '<svg viewBox="0 0 512 512" class="ic ' + (cls || '') + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>'; }
function gIcon(g, extra) { return '<span class="g ' + g + (extra ? ' ' + extra : '') + '" title="' + D.GOOD_NAME[g] + '">' + icon(g) + '</span>'; }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
var GOOD_COL = { brick: '#b5532f', food: '#d9a833', tool: '#6c7a86', wine: '#6e2a5e', cloth: '#2d6fb0' };
var PCOL = ['#b23a2a', '#1d6a63'];
function me() { return 0; }
function isHuman(pi) { return UI.mode === 'hot' || pi === 0; }
function cardActIcon(c) { return c.act === 'spec' ? c.spec : D.ACTS[c.act].icon; }
function godIcon(id) { for (var i = 0; i < D.GODS.length; i++) if (D.GODS[i].id === id) return D.GODS[i].icon; return 'laurel'; }
function godName(id) { for (var i = 0; i < D.GODS.length; i++) if (D.GODS[i].id === id) return D.GODS[i].n; return id; }

function installIcons() {
  var defs = $('#icondefs'), h = '';
  for (var k in VT_ICONS) h += '<symbol id="i-' + k + '" viewBox="0 0 512 512"><path d="' + VT_ICONS[k] + '"/></symbol>';
  defs.innerHTML = h;
}

// ---------- card faces ----------
function cardHTML(id, cls, extra) {
  var c = D.CARDS[id], top = c.act === 'spec' ? GOOD_COL[c.spec] : (c.deck ? '#c9963a' : '#b5532f');
  return '<button type="button" class="cd ' + (c.act === 'spec' ? 'spec ' : '') + (cls || '') + '" data-card="' + id + '" ' + (extra || '') + ' aria-label="' + esc(c.n + ': ' + cardWhat(c)) + '">' +
    '<span class="top" style="background:' + top + '"></span>' + icon(cardActIcon(c), 'art') + '<span class="nm">' + esc(c.n) + '</span><span class="god" title="' + godName(c.god) + '">' + icon(godIcon(c.god)) + '</span></button>';
}
function cardWhat(c) {
  if (c.act === 'spec') return 'Your ' + D.GOOD_NAME[c.spec] + ' cities make ' + D.GOOD_NAME[c.spec];
  if (c.act === 'merc') return 'Take ' + (c.coins || 3) + ' coins, then trade';
  return D.ACTS[c.act].what;
}

// ---------- the map ----------
var L = {};   // svg layers
var GEO = {}; // route geometry: rid -> {a, b, c, m}
function routeGeo() {
  var pairs = {};
  D.ROUTES.forEach(function (r) { var k = [r.a, r.b].sort().join('|'); (pairs[k] = pairs[k] || []).push(r); });
  D.ROUTES.forEach(function (r) {
    var A = VT.CITY[r.a], B = VT.CITY[r.b], dx = B.x - A.x, dy = B.y - A.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / len, ny = dx / len, both = pairs[[r.a, r.b].sort().join('|')].length > 1;
    var bend = r.t === 'sea' ? (both ? -0.16 : 0.1) : (both ? 0.12 : 0.03);
    if (r.a > r.b) bend = -bend;   // same side regardless of direction
    var cx = (A.x + B.x) / 2 + nx * len * bend, cy = (A.y + B.y) / 2 + ny * len * bend;
    GEO[r.id] = { A: A, B: B, cx: cx, cy: cy, mx: 0.25 * A.x + 0.5 * cx + 0.25 * B.x, my: 0.25 * A.y + 0.5 * cy + 0.25 * B.y };
  });
}
function buildMap() {
  var svg = $('#map'); svg.innerHTML = '';
  routeGeo();
  var img = UI.mosaic || (UI.mosaic = VTART.mosaic(D, 2));
  if (img) el('image', { href: img, x: 0, y: 0, width: VTART.W, height: VTART.H, preserveAspectRatio: 'none' }, svg);
  else el('rect', { x: 0, y: 0, width: VTART.W, height: VTART.H, fill: '#1f4e8c' }, svg);
  ['routes', 'cities', 'provs', 'slots', 'cols', 'over'].forEach(function (k) { L[k] = el('g', { 'class': 'ly-' + k }, svg); });
  D.ROUTES.forEach(function (r) { var g = GEO[r.id]; el('path', { 'class': 'rt ' + r.t, d: 'M' + g.A.x + ' ' + g.A.y + 'Q' + g.cx + ' ' + g.cy + ' ' + g.B.x + ' ' + g.B.y }, L.routes); });
  renderMap();
}
// region label + bonus marker position: centre of its cities, nudged off the cities
function provPos(pv) {
  var cs = D.CITIES.filter(function (c) { return c.p === pv.id; }), x = 0, y = 0;
  cs.forEach(function (c) { x += c.x; y += c.y; }); x /= cs.length; y /= cs.length;
  var nudge = { caledra: [30, 32], aurenia: [-10, 20], iberra: [60, 0], silvana: [10, 30], latria: [-70, 44], numara: [10, 28], carpia: [0, -36], thessia: [-36, -20], syrtica: [0, 34], anatra: [0, -10], levantia: [-46, -4], nilora: [-30, -14] }[pv.id] || [0, 0];
  return { x: x + nudge[0], y: y + nudge[1] };
}
function renderMap() {
  if (!G || !L.cities) return;
  var tg = targets();
  // regions: numeral + name + bonus marker
  L.provs.innerHTML = '';
  D.PROVS.forEach(function (pv) {
    var p = provPos(pv), st = G.prov[pv.id], g = el('g', { 'class': 'prov' + (tg.prov[pv.id] ? ' glow' : '') + (UI.selProv === pv.id ? ' sel' : ''), 'data-p': pv.id, transform: 'translate(' + p.x + ' ' + p.y + ')' }, L.provs);
    el('text', { 'class': 'pl', x: 0, y: -22 }, g).textContent = pv.num + ' ' + pv.n.toUpperCase();
    el('rect', { 'class': 'mk', x: -15, y: -15, width: 30, height: 30, rx: 5, fill: st.up ? GOOD_COL[st.g] : '#e2b44f' }, g);
    var u = el('use', { href: '#i-' + (st.up ? st.g : 'coins'), x: -11, y: -11, width: 22, height: 22, fill: st.up ? '#fff' : '#3b2416' }, g);
    if (!st.up) { el('text', { x: 13, y: 15, 'class': 'slotn', style: 'fill:#fff;paint-order:stroke;stroke:#2b2018;stroke-width:3px' }, g).textContent = D.BONUS_COIN[st.g]; }
    el('rect', { 'class': 'mkring', x: -19, y: -19, width: 38, height: 38, rx: 7 }, g);
    el('rect', { 'class': 'hit', x: -26, y: -26, width: 52, height: 52 }, g);
  });
  // route slots (where carts and ships stop)
  L.slots.innerHTML = '';
  for (var rid in tg.slot) {
    var gg = GEO[rid], s = el('g', { 'class': 'slotg', 'data-r': rid }, L.slots);
    el('circle', { 'class': 'slot glow', cx: gg.mx, cy: gg.my, r: 11 }, s);
    el('text', { 'class': 'slotn', x: gg.mx, y: gg.my }, s).textContent = tg.slot[rid];
    el('circle', { 'class': 'slothit glow', cx: gg.mx, cy: gg.my, r: 22, 'data-r': rid }, s);
  }
  // cities
  L.cities.innerHTML = '';
  D.CITIES.forEach(function (c) {
    var cap = c.id === D.CAPITAL, st = G.city[c.id], g = el('g', { 'class': 'city' + (tg.city[c.id] ? ' glow' : '') + (UI.selCity === c.id ? ' sel' : ''), 'data-c': c.id, transform: 'translate(' + c.x + ' ' + c.y + ')' }, L.cities);
    el('circle', { 'class': 'ring', r: cap ? 24 : 20 }, g);
    el('circle', { 'class': 'disc', r: cap ? 19 : 15, fill: cap ? '#f1e9da' : GOOD_COL[st.g] }, g);
    el('use', { href: '#i-' + (cap ? 'gate' : st.g), x: cap ? -13 : -10, y: cap ? -13 : -10, width: cap ? 26 : 20, height: cap ? 26 : 20, fill: cap ? '#3b2416' : '#fff' }, g);
    var lab = el('text', { 'class': 'lab' + (cap ? ' cap' : ''), x: 0, y: cap ? 36 : 30 }, g); lab.textContent = c.n;
    if (st) st.h.forEach(function (pi, k) {
      var hx = (k === 0 ? -1 : 1) * 15 - 7, hy = -30;
      el('path', { 'class': 'house popin', d: 'M' + hx + ' ' + (hy + 7) + 'l7 -7 7 7v8h-14z', fill: PCOL[pi] }, g);
    });
    if (tg.city[c.id] && tg.city[c.id].cost) costBadge(g, tg.city[c.id].cost);
    el('circle', { 'class': 'hit', r: 26 }, g);
  });
  // carts and ships
  L.cols.innerHTML = '';
  var inCity = {};
  G.pl.forEach(function (p, pi) {
    p.cols.forEach(function (col, k) {
      if (!col.at) return;
      var x, y;
      if (col.at.r != null) { x = GEO[col.at.r].mx; y = GEO[col.at.r].my; }
      else { var cc = VT.CITY[col.at.c], n = inCity[col.at.c] = (inCity[col.at.c] || 0) + 1, a = -Math.PI / 2 + n * 1.25; x = cc.x + Math.cos(a) * 30; y = cc.y + Math.sin(a) * 30; }
      var isT = tg.col[pi + ':' + k], g = el('g', { 'class': 'col' + (isT ? ' glow' : '') + (UI.selCol === k && pi === VT.sideToAct(G) ? ' sel' : ''), transform: 'translate(' + x + ' ' + y + ')' }, L.cols);
      el('circle', { 'class': 'halo', r: 15, fill: 'rgba(0,0,0,0)' }, g);
      el('circle', { r: 11.5, fill: PCOL[pi], stroke: '#f1e9da', 'stroke-width': 2.5 }, g);
      el('use', { href: '#i-' + (col.t === 'L' ? 'meeple' : 'ship'), x: -8, y: -8, width: 16, height: 16, fill: '#fff' }, g);
      if (isT) { var h = el('circle', { 'class': 'colhit glow', r: 22, 'data-k': k }, g); h.style.pointerEvents = 'all'; }
    });
  });
}
function costBadge(g, cost) {
  var parts = [cost.coins + '¢'], w = 44;
  var b = el('g', { 'class': 'cost', transform: 'translate(0 -44)' }, g);
  el('rect', { x: -w / 2, y: -11, width: w, height: 22, rx: 6 }, b);
  el('text', { x: 0, y: 0 }, b).textContent = parts.join(' ');
}

// legal targets for the human seat right now (what glows)
function targets() {
  var t = { city: {}, slot: {}, col: {}, prov: {}, cards: {} };
  if (!G || G.phase !== 'play' || UI.busy) return t;
  var pi = VT.sideToAct(G); if (!isHuman(pi)) return t;
  var pd = G.pend, ms = VT.validMoves(G);
  if (!pd) { ms.forEach(function (m) { if (m.t === 'play') t.cards[m.i] = 1; }); return t; }
  if (pd.h === 'arch-move') {
    ms.forEach(function (m) { if (m.t === 'mv') t.col[pi + ':' + m.k] = 1; });
    if (UI.selCol != null) { var r = VT.reach(G, pi, UI.selCol, pd.steps); for (var rid in r) t.slot[rid] = r[rid]; }
  } else if (pd.h === 'arch-build') {
    ms.forEach(function (m) { if (m.t === 'build') t.city[m.c] = { cost: VT.buildCost(G, pi, m.c) }; });
  } else if (pd.h === 'pref') {
    ms.forEach(function (m) { if (m.t === 'prov') t.prov[m.p] = 1; });
  } else if (pd.h === 'colo' || pd.h === 'trib') {
    ms.forEach(function (m) { if (m.t === 'place') t.city[m.c] = t.city[m.c] || {}; });
  }
  return t;
}

// ---------- camera ----------
function boardBox() { var b = $('#board'); return { w: b.clientWidth || 375, h: b.clientHeight || 400 }; }
function setView(v, anim) {
  var bb = boardBox(), asp = bb.h / bb.w;
  v.w = Math.max(260, Math.min(1100, v.w)); v.h = v.w * asp;
  // keep some of the map in view
  v.x = Math.max(-v.w * 0.3, Math.min(VTART.W - v.w * 0.7, v.x)); v.y = Math.max(-v.h * 0.3, Math.min(VTART.H - v.h * 0.7, v.y));
  UI.view = v;
  $('#map').setAttribute('viewBox', v.x.toFixed(1) + ' ' + v.y.toFixed(1) + ' ' + v.w.toFixed(1) + ' ' + v.h.toFixed(1));
}
function fitPoints(pts, pad, minW) {
  if (!pts.length) return;
  var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  pts.forEach(function (p) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); });
  pad = pad == null ? 70 : pad; x0 -= pad; y0 -= pad; x1 += pad; y1 += pad;
  var bb = boardBox(), asp = bb.h / bb.w, w = Math.max(minW || 360, x1 - x0, (y1 - y0) / asp);
  animView({ x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - w * asp / 2, w: w });
}
var camAnim = null;
function animView(to) {
  var from = UI.view || { x: 0, y: 0, w: VTART.W };
  if (UI.fast || matchMedia('(prefers-reduced-motion: reduce)').matches) { setView(to); return; }
  var t0 = performance.now(); cancelAnimationFrame(camAnim);
  (function step(t) { var k = Math.min(1, (t - t0) / 420), e = 1 - Math.pow(1 - k, 3);
    setView({ x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, w: from.w + (to.w - from.w) * e });
    if (k < 1) camAnim = requestAnimationFrame(step); })(t0);
}
function zoomBy(f, cx, cy) {
  var v = UI.view; if (!v) return; cx = cx == null ? v.x + v.w / 2 : cx; cy = cy == null ? v.y + v.h / 2 : cy;
  var w = Math.max(260, Math.min(1100, v.w * f)), k = w / v.w;
  setView({ x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k, w: w });
}
function homeView() {
  var pts = [], p = G.pl[0];
  p.cols.forEach(function (c) { if (c.at) pts.push(c.at.r != null ? { x: GEO[c.at.r].mx, y: GEO[c.at.r].my } : VT.CITY[c.at.c]); });
  p.houses.forEach(function (cid) { pts.push(VT.CITY[cid]); });
  if (!pts.length) pts.push(VT.CITY[D.CAPITAL]);
  fitPoints(pts, 150, 520);
}
// follow: frame the glowing targets (and the selected piece)
function frameTargets() {
  var t = targets(), pts = [];
  for (var c in t.city) pts.push(VT.CITY[c]);
  for (var r in t.slot) pts.push({ x: GEO[r].mx, y: GEO[r].my });
  for (var p in t.prov) pts.push(provPos(D.PROVS.filter(function (x) { return x.id === p; })[0]));
  var pi = VT.sideToAct(G);
  if (UI.selCol != null && pi >= 0) { var col = G.pl[pi].cols[UI.selCol]; if (col.at) pts.push(col.at.r != null ? { x: GEO[col.at.r].mx, y: GEO[col.at.r].my } : VT.CITY[col.at.c]); }
  for (var k in t.col) { var a = k.split(':'), cc = G.pl[+a[0]].cols[+a[1]]; if (cc.at) pts.push(cc.at.r != null ? { x: GEO[cc.at.r].mx, y: GEO[cc.at.r].my } : VT.CITY[cc.at.c]); }
  if (!pts.length) return;
  // too spread out for a phone: frame the few targets nearest the hint (or the middle of the current view)
  var x0 = Math.min.apply(null, pts.map(function (q) { return q.x; })), x1 = Math.max.apply(null, pts.map(function (q) { return q.x; }));
  var bb = boardBox();
  if (x1 - x0 > 560 && bb.w < 700) {
    var c = UI.view ? { x: UI.view.x + UI.view.w / 2, y: UI.view.y + UI.view.h / 2 } : VT.CITY[D.CAPITAL];
    var hm = UI.hint; if (hm && hm.t === 'prov') c = provPos(D.PROVS.filter(function (x) { return x.id === hm.p; })[0]); else if (hm && hm.t === 'build') c = VT.CITY[hm.c];
    pts = pts.slice().sort(function (a, b) { return Math.hypot(a.x - c.x, a.y - c.y) - Math.hypot(b.x - c.x, b.y - c.y); }).slice(0, 4);
  }
  fitPoints(pts, 80, 360);
}
function wireCamera() {
  var svg = $('#map'), pts = {}, start = null, moved = false;
  function toMap(cx, cy) { var r = svg.getBoundingClientRect(), v = UI.view; return { x: v.x + (cx - r.left) / r.width * v.w, y: v.y + (cy - r.top) / r.height * v.h }; }
  svg.addEventListener('pointerdown', function (e) { pts[e.pointerId] = { x: e.clientX, y: e.clientY }; moved = false; start = { v: Object.assign({}, UI.view), pts: JSON.parse(JSON.stringify(pts)) }; });
  svg.addEventListener('pointermove', function (e) {
    if (!pts[e.pointerId] || !start) return; pts[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(pts), r = svg.getBoundingClientRect(), v0 = start.v;
    if (ids.length === 1) {
      var s0 = start.pts[ids[0]]; if (!s0) return; var dx = e.clientX - s0.x, dy = e.clientY - s0.y;
      if (Math.abs(dx) + Math.abs(dy) > 8) moved = true;
      if (moved) setView({ x: v0.x - dx / r.width * v0.w, y: v0.y - dy / r.height * v0.h, w: v0.w });
    } else if (ids.length >= 2) {
      var a0 = start.pts[ids[0]], b0 = start.pts[ids[1]], a1 = pts[ids[0]], b1 = pts[ids[1]]; if (!a0 || !b0) return;
      var d0 = Math.hypot(a0.x - b0.x, a0.y - b0.y), d1 = Math.hypot(a1.x - b1.x, a1.y - b1.y); if (d1 < 10) return;
      moved = true; var w = v0.w * d0 / d1, mx = (a0.x + b0.x) / 2, my = (a0.y + b0.y) / 2;
      var fx = (mx - r.left) / r.width, fy = (my - r.top) / r.height, asp = r.height / r.width;
      setView({ x: v0.x + fx * v0.w - fx * w, y: v0.y + fy * v0.h - fy * w * asp, w: w });
    }
  });
  var up = function (e) { delete pts[e.pointerId]; start = Object.keys(pts).length ? { v: Object.assign({}, UI.view), pts: JSON.parse(JSON.stringify(pts)) } : null; };
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
  svg.addEventListener('click', function (e) { if (moved) { moved = false; e.stopPropagation(); return; } onMapTap(e); }, true);
  svg.addEventListener('wheel', function (e) { e.preventDefault(); var p = toMap(e.clientX, e.clientY); zoomBy(e.deltaY > 0 ? 1.15 : 1 / 1.15, p.x, p.y); }, { passive: false });
  $('#zin').addEventListener('click', function () { zoomBy(1 / 1.3); });
  $('#zout').addEventListener('click', function () { zoomBy(1.3); });
}

// ---------- the dock ----------
function renderRace() {
  if (!G) return;
  var h = '';
  G.pl.forEach(function (p, i) {
    var turn = G.phase === 'play' && VT.sideToAct(G) === i;
    h += '<span class="chip' + (turn ? ' turn' : '') + '" title="' + esc(p.name) + ' points now"><span class="dot" style="background:' + PCOL[i] + '"></span>' + esc(p.name) + ' <b data-engine-score="' + i + '">' + VT.score(G, i).total + '</b></span>';
  });
  $('#race').innerHTML = h;
  $('#mktn').textContent = G.disp.filter(function (x) { return x != null; }).length;
}
function renderStore() {
  var pi = UI.mode === 'hot' ? Math.max(0, VT.sideToAct(G)) : 0, p = G.pl[pi], h = '<button type="button" class="storebtn" id="storeb" aria-label="Your storehouse"><span class="slots">';
  var n = 0;
  D.GOODS.forEach(function (g) { for (var i = 0; i < p.goods[g]; i++) { h += '<span class="sl ' + g + '">' + icon(g) + '</span>'; n++; } });
  p.cols.forEach(function (c) { if (!c.at) { h += '<span class="sl col' + c.t + '">' + icon(c.t === 'L' ? 'meeple' : 'ship') + '</span>'; n++; } });
  for (; n < D.SLOTS; n++) h += '<span class="sl"></span>';
  h += '</span><span class="coins" data-engine="G.pl.' + pi + '.coins">' + icon('coins') + p.coins + '</span></button>';
  $('#store').innerHTML = h;
}
function renderHand() {
  var pi = UI.mode === 'hot' ? Math.max(0, VT.sideToAct(G)) : 0, p = G.pl[pi], t = targets(), h = '';
  var hintI = UI.hint && UI.hint.t === 'play' ? UI.hint.i : -1;
  p.hand.forEach(function (id, i) { h += cardHTML(id, (t.cards[i] ? 'glow ' : '') + (UI.sel === i ? 'sel ' : '') + (hintI === i ? 'hint' : ''), 'data-i="' + i + '"'); });
  if (p.disc.length) h += '<button type="button" class="pile" id="pileb" aria-label="Played cards"><b>' + p.disc.length + '</b>played</button>';
  $('#hand').innerHTML = h;
}
function renderRival() {
  var o = G.pl[1], top = o.disc[o.disc.length - 1];
  $('#rivalcard').innerHTML = top != null && UI.mode !== 'hot' ? '<div class="mini">' + cardHTML(top, '', 'tabindex="-1" disabled').replace('<button', '<span').replace('</button>', '</span>') + '</div>' : '';
}
function render() {
  if (!G) return;
  renderRace(); renderStore(); renderHand(); renderRival(); renderMap(); renderPrompt();
}

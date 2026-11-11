/* ===== The kingdom map ===== */
var LOCTYPES = ['castle', 'forest', 'moor', 'village', 'abbey', 'bridge', 'stones', 'harbor', 'mine', 'market', 'tower', 'hills'];
var DEFAULT_LOCS = [
  { id: 'ashgrave', name: 'Ashgrave Keep', type: 'castle' }, { id: 'brackenmoor', name: 'Brackenmoor', type: 'moor' },
  { id: 'sunken', name: 'Sunken Abbey', type: 'abbey' }, { id: 'thistlewick', name: 'Thistlewick', type: 'village' },
  { id: 'mournwood', name: 'Mournwood', type: 'forest' }, { id: 'gallowford', name: 'Gallow Ford', type: 'bridge' },
  { id: 'hagstone', name: 'Hagstone Ring', type: 'stones' }, { id: 'cinderquay', name: 'Cinder Quay', type: 'harbor' },
  { id: 'rookhollow', name: 'Rookhollow Mine', type: 'mine' }, { id: 'vesper', name: 'Vesper Market', type: 'market' },
  { id: 'gloamreach', name: 'Gloamreach Tower', type: 'tower' }, { id: 'barrowfell', name: 'Barrowfell', type: 'hills' }
];
TB.locationTypes = LOCTYPES; TB.defaultLocations = function (n) { return DEFAULT_LOCS.slice(0, n || 10).map(function (l) { return { id: l.id, name: l.name, type: l.type }; }); };

var TRACK_IN = 76;   /* width of influence track band */
var SLOT_W = 38, SLOT_H = 54, SLOT_GAP = 6;
/* layoutLocations(list, {w,h}) -> {pos:{id:{x,y}}, links:[[a,b],...]}. list items may carry x,y (absolute) and links:[ids]. */
function layoutLocations(list, o) {
  o = o || {}; var W = o.w || 1000, H = o.h || 1000, n = list.length, cx = W / 2, cy = H / 2, pos = {}, links = [];
  var i, below = o.below || 118, above = o.above || 54, cyp = (108 + above + H - 108 - below) / 2, ay = (H - 216 - above - below) / 2, ax = W / 2 - 108 - (o.half || 98);
  list.forEach(function (l, i) {
    if (l.x != null && l.y != null) { pos[l.id] = { x: l.x, y: l.y }; return; }
    var th = (-90 + i * 360 / n + (o.rot || 0)) * Math.PI / 180, k = n >= 7 ? (i % 2 ? (n >= 11 ? .76 : .84) : 1) : (n >= 4 ? 1 : .8);
    pos[l.id] = { x: n2(cx + Math.cos(th) * ax * k), y: n2(cyp + Math.sin(th) * ay * k) };
  });
  var seen = {}; function add(a, b) { var k = a < b ? a + '|' + b : b + '|' + a; if (a !== b && !seen[k]) { seen[k] = 1; links.push([a, b]); } }
  var hasL = list.some(function (l) { return l.links; });
  if (hasL) list.forEach(function (l) { (l.links || []).forEach(function (t) { if (pos[t]) add(l.id, t); }); });
  else if (o.links) o.links.forEach(function (p) { add(p[0], p[1]); });
  else { for (i = 0; i < n; i++) add(list[i].id, list[(i + 1) % n].id); for (i = 0; i < n; i += 3) add(list[i].id, 'throne'); if (n > 3) for (i = 1; i < n; i += 4) add(list[i].id, list[(i + 2) % n].id); }
  pos.throne = { x: cx, y: cy };
  return { pos: pos, links: links };
}
TB.layoutLocations = layoutLocations;

/* rounded-rect walker (clockwise from top-left start of top edge) */
function rrWalk(x0, y0, w, h, r) {
  var seg = [{ t: 'l', len: w - 2 * r, x: x0 + r, y: y0, dx: 1, dy: 0, nx: 0, ny: -1 }, { t: 'a', len: Math.PI * r / 2, cx: x0 + w - r, cy: y0 + r, a0: -90 }, { t: 'l', len: h - 2 * r, x: x0 + w, y: y0 + r, dx: 0, dy: 1, nx: 1, ny: 0 }, { t: 'a', len: Math.PI * r / 2, cx: x0 + w - r, cy: y0 + h - r, a0: 0 }, { t: 'l', len: w - 2 * r, x: x0 + w - r, y: y0 + h, dx: -1, dy: 0, nx: 0, ny: 1 }, { t: 'a', len: Math.PI * r / 2, cx: x0 + r, cy: y0 + h - r, a0: 90 }, { t: 'l', len: h - 2 * r, x: x0, y: y0 + h - r, dx: 0, dy: -1, nx: -1, ny: 0 }, { t: 'a', len: Math.PI * r / 2, cx: x0 + r, cy: y0 + r, a0: 180 }], L = 0;
  seg.forEach(function (s) { L += s.len; });
  return { L: L, at: function (s) { s = ((s % L) + L) % L; for (var i = 0; i < seg.length; i++) { var g = seg[i]; if (s <= g.len || i === seg.length - 1) { if (g.t === 'l') return { x: g.x + g.dx * s, y: g.y + g.dy * s, nx: g.nx, ny: g.ny }; var a = (g.a0 + s / g.len * 90) * Math.PI / 180; return { x: g.cx + Math.cos(a) * r, y: g.cy + Math.sin(a) * r, nx: Math.cos(a), ny: Math.sin(a) }; } s -= g.len; } } };
}
function smoothClosed(p) { var n = p.length, d = 'M' + n2((p[n - 1][0] + p[0][0]) / 2) + ' ' + n2((p[n - 1][1] + p[0][1]) / 2); for (var i = 0; i < n; i++) { var a = p[i], b = p[(i + 1) % n]; d += ' Q' + n2(a[0]) + ' ' + n2(a[1]) + ' ' + n2((a[0] + b[0]) / 2) + ' ' + n2((a[1] + b[1]) / 2); } return d + 'Z'; }

/* little painted scenes inside the location medallions (box -40..40) */
function locIcon(type, R) {
  var s = '', gnd = function (c) { return '<path d="M-40 14 Q-20 8 0 13 T40 12 V40 H-40Z" fill="' + c + '"/>'; };
  var sky = function (k) { return '<rect x="-40" y="-40" width="80" height="80" fill="url(#tb-sky-' + k + ')"/>'; };
  var pine = function (x, y, h, c) { return '<path d="M' + (x - h * .28) + ' ' + y + ' L' + x + ' ' + (y - h) + ' L' + (x + h * .28) + ' ' + y + 'Z M' + (x - h * .22) + ' ' + (y - h * .4) + ' L' + x + ' ' + (y - h * .95) + ' L' + (x + h * .22) + ' ' + (y - h * .4) + 'Z" fill="' + c + '"/>'; };
  switch (type) {
    case 'castle': s = sky('dusk') + hills(R, 10, 8, '#3d4a43', .8, 80, -40) + gnd('#223018') + tower(-14, 24, .62, '#3b423c', R) + tower(16, 26, .46, '#2e352f', R) + '<path d="M-30 24 H34 V16 L28 12 L22 16 L16 12 L10 16 L4 12 L-2 16 L-8 12 L-14 16 L-20 12 L-26 16Z" fill="#2e352f" opacity=".0"/>' + glowAt(-14, -14, 10, 'warm'); break;
    case 'forest': s = sky('forest') + gnd('#1d2c1a') + [-30, -18, -6, 8, 20, 32].map(function (x, i) { return pine(x, 26 + (i % 2) * 4, 34 - (i % 3) * 6, i % 2 ? '#1b3322' : '#2a4a2c'); }).join('') + glowAt(0, -4, 22, 'warm').replace('/>', ' opacity=".35"/>'); break;
    case 'moor': s = sky('moor') + hills(R, 6, 12, '#7f8c80', .8, 80, -40) + hills(R, 16, 10, '#56664a', .9, 80, -40) + gnd('#454a26') + '<path d="M-26 28 l2 -8 l2 8 M-8 32 l2 -9 l2 9 M12 27 l2 -8 l2 8 M24 33 l2 -7 l2 7" stroke="#8a5aa0" stroke-width="2" stroke-linecap="round"/>'; break;
    case 'village': s = sky('street') + gnd('#2a1d18') + [[-26, 10, 20], [-4, 4, 26], [18, 8, 22]].map(function (h, i) { return '<path d="M' + h[0] + ' 26 V' + h[1] + ' L' + (h[0] + 10) + ' ' + (h[1] - 11) + ' L' + (h[0] + 20) + ' ' + h[1] + ' V26Z" fill="' + (i % 2 ? '#3a2a24' : '#2a2020') + '"/><rect x="' + (h[0] + 6) + '" y="' + (h[1] + 6) + '" width="6" height="7" fill="#ffb347"/>'; }).join('') + glowAt(0, 12, 28, 'warm').replace('/>', ' opacity=".4"/>'); break;
    case 'abbey': s = sky('night') + '<circle cx="22" cy="-18" r="7" fill="#f1f1ff"/>' + glowAt(22, -18, 20, 'cool') + gnd('#14172b') + '<path d="M-26 26 V-2 Q-26 -22 -6 -22 Q14 -22 14 -2 V26Z" fill="#1d2147"/><path d="M-18 26 V0 Q-18 -14 -6 -14 Q6 -14 6 0 V26Z" fill="#0b0c22"/><path d="M-6 -22 V-34 M-11 -29 H-1" stroke="#9aa0d8" stroke-width="2"/><rect x="14" y="-2" width="14" height="28" fill="#161a3a"/>' + ivy(-24, 24, 30, -90, R, 2.4, 1); break;
    case 'bridge': s = sky('dusk') + '<rect x="-40" y="16" width="80" height="24" fill="#1d3a40"/><path d="M-40 18 H40" stroke="#9fc4c0" stroke-opacity=".5"/><path d="M-40 6 H-6 Q0 -8 6 6 H40 V16 H-40Z" fill="#4b5249"/><path d="M-26 16 Q-14 4 -2 16 M12 16 Q24 4 36 16" fill="none" stroke="#2a2e2a" stroke-width="2.5"/>' + ivy(-30, 8, 20, -80, R, 2.2); break;
    case 'stones': s = sky('night') + '<circle cx="-18" cy="-20" r="6" fill="#f1f1ff"/>' + glowAt(-18, -20, 18, 'cool') + gnd('#14172b') + stoneAt(-22, 28, 12, 34, -4, R) + stoneAt(-4, 24, 14, 38, 2, R) + stoneAt(16, 26, 13, 34, -2, R) + stoneAt(32, 30, 10, 24, 5, R) + '<path d="M-8 -12 H20" stroke="#5f665c" stroke-width="7" opacity="0"/>'; break;
    case 'harbor': s = sky('moor') + '<rect x="-40" y="10" width="80" height="30" fill="#2a4a56"/><path d="M-40 16 q10 -3 20 0 t20 0 t20 0 t20 0 M-40 26 q10 -3 20 0 t20 0 t20 0 t20 0" stroke="#9fc4c0" stroke-opacity=".55" fill="none"/><path d="M-14 18 H16 L10 26 H-8Z" fill="#4a2c14"/><path d="M0 18 V-18 M0 -16 L16 12 H0Z" stroke="#2a1c0e" stroke-width="2" fill="#e8dfc4"/><rect x="-40" y="12" width="14" height="4" fill="#3a2a1a"/>'; break;
    case 'mine': s = sky('stone') + hills(R, 4, 14, '#4a554c', .95, 80, -40) + '<path d="M-40 40 V10 Q-30 -6 -8 -4 Q16 -8 40 10 V40Z" fill="#3e4b43"/><path d="M-12 40 V16 Q-12 4 0 4 Q12 4 12 16 V40Z" fill="#05060a"/><path d="M-12 14 H12 M-9 4 V40 M9 4 V40" stroke="#5a3a1d" stroke-width="2.4" opacity=".9"/>' + flame(18, 30, .7); break;
    case 'market': s = sky('street') + gnd('#2a1d18') + '<rect x="-24" y="2" width="48" height="28" fill="#3a2a1a"/><path d="M-30 4 H30 L24 -10 H-24Z" fill="url(#tb-c-lantern)"/><path d="M-30 4 q6 8 12 0 q6 8 12 0 q6 8 12 0 q6 8 12 0 q6 8 12 0" fill="#d9b24f" opacity=".9"/>' + glowAt(0, 6, 30, 'warm') + '<circle cx="-10" cy="22" r="4" fill="url(#tb-gold)"/><circle cx="2" cy="24" r="4" fill="url(#tb-gold)"/><circle cx="12" cy="21" r="4" fill="url(#tb-gold)"/>'; break;
    case 'tower': s = sky('night') + '<circle cx="24" cy="-22" r="6" fill="#f1f1ff"/>' + glowAt(24, -22, 18, 'cool') + gnd('#14172b') + tower(0, 28, .9, '#2a3040', R) + glowAt(0, -10, 10, 'warm'); break;
    default: s = sky('moor') + hills(R, 0, 14, '#7f8c80', .8, 80, -40) + '<path d="M-30 30 Q-10 -4 14 4 Q34 10 40 30Z" fill="#566a45"/><path d="M-6 30 Q0 20 8 30Z" fill="#05060a"/>' + gnd('#3f4a24').replace('M-40 14', 'M-40 26');
  }
  return s;
}
function mapDefs() {
  return '<clipPath id="tbm-pc"><circle r="39"/></clipPath>' +
    lg('tbm-land', [[0, '#556b38'], [.55, '#33482a'], [1, '#1a281c']], 0, 0, 1, 1).replace('<linearGradient', '<linearGradient gradientUnits="objectBoundingBox"') +
    rg('tbm-landR', [[0, '#6b7e44', .9], [.6, '#3a4f2d', .4], [1, '#1b2a1c', 0]], .5, .5, .6) +
    rg('tbm-void', [[0, '#16241f'], [1, '#050a08']], .5, .5, .75) +
    lg('tbm-ribbon', [[0, '#e8d9b0'], [1, '#c1ab78']], 0, 0, 0, 1) + lg('tbm-lane', [[0, '#120b07'], [1, '#2a1a10']], 0, 0, 0, 1);
}

TB.map = function (opts) {
  opts = opts || {}; TB.mount();
  var W = opts.w || 1000, H = opts.h || 1000, cx = W / 2, cy = H / 2, N = opts.trackLen || 40, seed = opts.seed || 7, low = opts.quality === 'low';
  var players = opts.players || ['gilded', 'heath', 'lantern', 'choir'];
  players = players.map(function (p, i) { return typeof p === 'string' ? { faction: p, name: fac(p).short } : { faction: p.faction, name: p.name || fac(p.faction).short }; });
  var S = { locs: [], links: [], pos: {}, slots: {}, heralds: {}, infl: {}, round: { n: 1, total: 8 }, owners: {}, hl: [], sel: null }, slotEls = {}, heraldEls = {}, inflEls = {}, locEls = {};
  var CP = !!opts.compact, cs = 1, sw = CP ? 44 : SLOT_W, sh = CP ? 62 : SLOT_H, pu = CP ? 1.2 : 1, hs = CP ? 1.55 : 1.3, reduce = false; try { reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { }
  var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('class', 'tb-map' + (CP ? ' tb-compact' : '')); svg.setAttribute('role', 'group'); svg.setAttribute('aria-label', 'Map of the kingdom');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet'); svg.style.touchAction = 'manipulation';
  svg.innerHTML = '<defs>' + mapDefs() + '</defs><g class="tb-m-static"></g><g class="tb-m-roads"></g><g class="tb-m-throne"></g><g class="tb-m-locs"></g><g class="tb-m-round"></g><g class="tb-m-track"></g><g class="tb-m-infl"></g><g class="tb-m-heralds"></g><g class="tb-m-fx"></g>';
  var L = {}; ['static', 'roads', 'throne', 'locs', 'round', 'track', 'infl', 'heralds', 'fx'].forEach(function (k) { L[k] = svg.querySelector('.tb-m-' + k); });
  var track = rrWalk(46, 46, W - 92, H - 92, 56);
  function trackPt(i) { return track.at(i * track.L / N); }
  function filt(f) { return low ? '' : ' filter="url(#' + f + ')"'; }

  /* ---- static painted backdrop ---- */
  function buildStatic() {
    var R = rngf(seed), s = '', i, land = rrWalk(98, 98, W - 196, H - 196, 120), pts = [], np = 56, lp;
    for (i = 0; i < np; i++) { lp = land.at(i * land.L / np); var j = (R() - .5) * 26; pts.push([lp.x + lp.nx * j, lp.y + lp.ny * j]); }
    var landD = smoothClosed(pts);
    s += '<rect width="' + W + '" height="' + H + '" fill="url(#tbm-void)"/>';
    /* outer frame + track lane */
    s += '<rect x="5" y="5" width="' + (W - 10) + '" height="' + (H - 10) + '" rx="40" fill="#1b110b" stroke="url(#tb-gold)" stroke-width="6"/>' + '<rect x="14" y="14" width="' + (W - 28) + '" height="' + (H - 28) + '" rx="34" fill="none" stroke="#6e4c14" stroke-width="1.6"/>' + (low ? '' : '<rect x="6" y="6" width="' + (W - 12) + '" height="' + (H - 12) + '" rx="38" filter="url(#tb-grain)" opacity=".55"/>');
    var lane = 'M' + (46 + 56) + ' 46 H' + (W - 102) + ' A56 56 0 0 1 ' + (W - 46) + ' 102 V' + (H - 102) + ' A56 56 0 0 1 ' + (W - 102) + ' ' + (H - 46) + ' H102 A56 56 0 0 1 46 ' + (H - 102) + ' V102 A56 56 0 0 1 102 46Z';
    s += '<path d="' + lane + '" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="66"/><path d="' + lane + '" fill="none" stroke="#150d08" stroke-width="62"/><path d="' + lane + '" fill="none" stroke="url(#tb-gold)" stroke-width="64" stroke-opacity=".0"/><path d="' + lane + '" fill="none" stroke="#8a6a24" stroke-width="1.4" transform="translate(0 0)" opacity=".0"/>';
    /* the land */
    s += '<defs><clipPath id="tbm-landclip"><path d="' + landD + '"/></clipPath></defs>';
    s += '<path d="' + landD + '" fill="#000" opacity=".6" transform="translate(0 5)"' + filt('tb-soft') + '/>';
    s += '<g clip-path="url(#tbm-landclip)"><g' + filt('tb-paint') + '>';
    s += '<path d="' + landD + '" fill="url(#tbm-land)"/><rect x="0" y="0" width="' + W + '" height="' + H + '" fill="url(#tbm-landR)"/>';
    /* colour washes */
    var wc = ['#6f8a45', '#4a5f2f', '#8a7a45', '#3c4a3a', '#566b3a', '#2d3d26'];
    for (i = 0; i < 46; i++) s += '<ellipse cx="' + n2(100 + R() * (W - 200)) + '" cy="' + n2(100 + R() * (H - 200)) + '" rx="' + n2(40 + R() * 90) + '" ry="' + n2(30 + R() * 60) + '" fill="' + wc[Math.floor(R() * wc.length)] + '" opacity="' + n2(.14 + R() * .2) + '" transform="rotate(' + n2(R() * 180) + ' ' + cx + ' ' + cy + ')"/>';
    /* river */
    var rv = [[W * .78, 86], [W * .66, H * .2], [W * .74, H * .36], [W * .6, H * .5], [W * .66, H * .66], [W * .4, H * .76], [W * .3, H * .9], [W * .26, H - 86]];
    s += '<path d="' + smoothPath(rv) + '" fill="none" stroke="#10201d" stroke-width="34" stroke-linecap="round" opacity=".55"/><path d="' + smoothPath(rv) + '" fill="none" stroke="#2f5a62" stroke-width="26" stroke-linecap="round"/><path d="' + smoothPath(rv) + '" fill="none" stroke="#6fa3a8" stroke-width="8" stroke-linecap="round" opacity=".45" stroke-dasharray="14 22"/>';
    s += '<ellipse cx="' + W * .22 + '" cy="' + H * .66 + '" rx="64" ry="38" fill="#10201d" opacity=".6" transform="rotate(-18 ' + W * .22 + ' ' + H * .66 + ')"/><ellipse cx="' + W * .22 + '" cy="' + H * .66 + '" rx="58" ry="32" fill="#2f5a62" transform="rotate(-18 ' + W * .22 + ' ' + H * .66 + ')"/><ellipse cx="' + (W * .22 - 12) + '" cy="' + (H * .66 - 8) + '" rx="30" ry="9" fill="#8fc0c4" opacity=".35"/>';
    /* avoidance */
    var avoid = [[cx, cy, 160, 160]]; S.locs.forEach(function (l) { var p = S.pos[l.id]; avoid.push([p.x, p.y + 36, 108, 100]); });
    function free(x, y, m) { for (var k = 0; k < avoid.length; k++) { if (Math.abs(x - avoid[k][0]) < avoid[k][2] + (m || 0) && Math.abs(y - avoid[k][1]) < avoid[k][3] + (m || 0)) return false; } return x > 150 && x < W - 150 && y > 150 && y < H - 150; }
    var rvPt = function (x, y) { for (var t = 0; t < rv.length; t++) if (Math.hypot(x - rv[t][0], y - rv[t][1]) < 90) return false; return true; };
    var cnt = 0, tries = 0;
    while (cnt < 16 && tries++ < 400) { var hx = 110 + R() * (W - 220), hy = 110 + R() * (H - 220); if (!free(hx, hy, 0)) continue; cnt++; s += '<path d="M' + n2(hx - 34) + ' ' + n2(hy + 14) + ' Q' + n2(hx - 18) + ' ' + n2(hy - 26) + ' ' + n2(hx) + ' ' + n2(hy - 20) + ' Q' + n2(hx + 22) + ' ' + n2(hy - 24) + ' ' + n2(hx + 36) + ' ' + n2(hy + 14) + 'Z" fill="#7a7a48" opacity=".55"/><path d="M' + n2(hx - 14) + ' ' + n2(hy - 8) + ' Q' + n2(hx) + ' ' + n2(hy - 20) + ' ' + n2(hx + 20) + ' ' + n2(hy - 6) + '" stroke="#c9c58a" stroke-opacity=".4" fill="none" stroke-width="3"/>'; }
    cnt = 0; tries = 0;
    while (cnt < 44 && tries++ < 900) { var fx = 120 + R() * (W - 240), fy = 120 + R() * (H - 240); if (!free(fx, fy, 14) || !rvPt(fx, fy)) continue; cnt++; var m = 3 + Math.floor(R() * 4); for (i = 0; i < m; i++) { var tx = fx + (R() - .5) * 46, ty = fy + (R() - .5) * 30, th = 24 + R() * 18, tc = ['#1b3322', '#25412a', '#2f5030', '#3a5e36'][Math.floor(R() * 4)]; s += '<path d="M' + n2(tx - th * .3) + ' ' + n2(ty) + ' L' + n2(tx) + ' ' + n2(ty - th) + ' L' + n2(tx + th * .3) + ' ' + n2(ty) + 'Z M' + n2(tx - th * .24) + ' ' + n2(ty - th * .4) + ' L' + n2(tx) + ' ' + n2(ty - th * .95) + ' L' + n2(tx + th * .24) + ' ' + n2(ty - th * .4) + 'Z" fill="' + tc + '"/>'; } }
    /* ruins & stones in the wilds */
    cnt = 0; tries = 0;
    while (cnt < 12 && tries++ < 500) { var rx = 130 + R() * (W - 260), ry = 130 + R() * (H - 260); if (!free(rx, ry, 24) || !rvPt(rx, ry)) continue; cnt++; var k = R(); s += k < .4 ? arch(rx, ry + 8, .36 + R() * .12, '#3f4a42', R) : k < .75 ? tower(rx, ry + 8, .4 + R() * .15, '#3a443e', R) : stoneAt(rx, ry + 6, 12, 26, R() * 12 - 6, R) + stoneAt(rx + 14, ry + 8, 10, 20, 5, R); }
    /* fog patches */
    for (i = 0; i < 10; i++) s += '<ellipse cx="' + n2(110 + R() * (W - 220)) + '" cy="' + n2(110 + R() * (H - 220)) + '" rx="' + n2(60 + R() * 80) + '" ry="' + n2(14 + R() * 18) + '" fill="#d8dcc4" opacity="' + n2(.07 + R() * .08) + '"' + filt('tb-fog') + '/>';
    s += '</g>';
    s += (low ? '' : '<rect width="' + W + '" height="' + H + '" filter="url(#tb-wash)" opacity=".5"/><rect width="' + W + '" height="' + H + '" filter="url(#tb-grain)" opacity=".5"/>');
    s += '<path d="' + landD + '" fill="none" stroke="#04080a" stroke-opacity=".7" stroke-width="40"' + filt('tb-soft') + '/></g>';
    /* coast, ivy, thorn hedge */
    s += '<path d="' + landD + '" fill="none" stroke="#0a120c" stroke-width="9" stroke-linejoin="round"' + filt('tb-rough') + '/><path d="' + landD + '" fill="none" stroke="#a8b86a" stroke-width="2" opacity=".5" transform="translate(0 -1)"' + filt('tb-rough') + '/><path d="' + landD + '" fill="none" stroke="url(#tb-gold)" stroke-width="2" opacity=".55" stroke-dasharray="1 9" stroke-linecap="round"/>';
    for (i = 0; i < np; i += 2) { var q = pts[i], ang = Math.atan2(cy - q[1], cx - q[0]) * 180 / Math.PI; s += ivy(q[0], q[1], 34 + R() * 26, ang + (R() - .5) * 60, R, 3.4); }
    for (i = 1; i < np; i += 2) { var q2 = pts[i], ang2 = Math.atan2(q2[1] - cy, q2[0] - cx) * 180 / Math.PI; s += thorn(q2[0], q2[1], 36 + R() * 30, ang2 + (R() - .5) * 90, R, '#150d12'); if (R() < .3) s += rose(q2[0] + 6, q2[1] - 4, .9); }
    /* track lane spaces */
    for (i = 0; i < N; i++) {
      var p = trackPt(i), five = i % 5 === 0;
      s += '<g transform="translate(' + n2(p.x) + ' ' + n2(p.y) + ')"><rect x="-28" y="-28" width="56" height="56" rx="9" fill="' + (five ? 'url(#tb-gold)' : '#3a2616') + '" stroke="' + (five ? '#4a3208' : '#8a6a24') + '" stroke-width="' + (five ? 1.6 : 1.3) + '"/>' + (five ? '<rect x="-23" y="-23" width="46" height="46" rx="6" fill="none" stroke="#fff" stroke-opacity=".35"/><text y="10" text-anchor="middle" font-family="' + DISPLAY + '" font-weight="700" font-size="28" fill="#2b1808">' + i + '</text>' : '<rect x="-23" y="-23" width="46" height="46" rx="6" fill="none" stroke="#000" stroke-opacity=".35"/><circle r="3.4" fill="#c9a24a" opacity=".75"/>') + '</g>';
    }
    L.static.innerHTML = s;
  }
  /* ---- throne ---- */
  function buildThrone() {
    var R = rngf(seed + 11), s = '', i;
    s += glowAt(cx, cy, 230, 'gold').replace('/>', ' opacity=".5"/>');
    for (i = 0; i < 16; i++) { var a = i * 22.5 + R() * 8; s += thorn(cx + Math.cos(a * Math.PI / 180) * 112, cy + Math.sin(a * Math.PI / 180) * 90, 34 + R() * 22, a + 70 + R() * 40, R, '#120a10'); }
    s += '<ellipse cx="' + cx + '" cy="' + (cy + 8) + '" rx="116" ry="94" fill="#000" opacity=".55"' + filt('tb-soft') + '/><ellipse cx="' + cx + '" cy="' + cy + '" rx="108" ry="88" fill="url(#tb-gnd-stone)" stroke="url(#tb-gold)" stroke-width="6"/><ellipse cx="' + cx + '" cy="' + cy + '" rx="92" ry="73" fill="none" stroke="#c9a24a" stroke-width="1.6" stroke-dasharray="3 7"/><ellipse cx="' + cx + '" cy="' + cy + '" rx="78" ry="60" fill="#241810" opacity=".5"/>';
    for (i = 0; i < 6; i++) { var a2 = (i * 60 - 90) * Math.PI / 180; s += stoneAt(cx + Math.cos(a2) * 112, cy + Math.sin(a2) * 90 + 6, 14, 30 + (i % 2) * 10, (i - 3) * 3, R); }
    s += '<g transform="translate(' + cx + ' ' + (cy + 28) + ')"><path d="M-34 0 V-70 L-26 -88 L-16 -66 L0 -96 L16 -66 L26 -88 L34 -70 V0Z" fill="#1d0c12" stroke="url(#tb-gold)" stroke-width="3"/><path d="M-24 0 V-52 Q0 -64 24 -52 V0Z" fill="#5b1424"/><rect x="-30" y="-26" width="60" height="14" rx="3" fill="#7c1b2c" stroke="url(#tb-gold)" stroke-width="1.6"/><rect x="-38" y="-12" width="76" height="12" rx="2" fill="#2c1a10" stroke="#8f7330" stroke-width="1.2"/>' + ivy(-34, -4, 70, -92, R, 3.4) + ivy(34, -4, 56, -88, R, 3.4) + rose(-20, -14, 1.2) + '</g>';
    s += '<g transform="translate(' + cx + ' ' + (cy - 76) + ')">' + glowAt(0, 0, 44, 'gold') + crownShape(0, 8, 1.15) + '</g>';
    s += '<g transform="translate(' + cx + ' ' + (cy + 56) + ')"><path d="M-92 -12 H92 L86 0 L92 12 H-92 L-86 0Z" fill="#1b0b10" stroke="url(#tb-gold)" stroke-width="2"/><text y="5.4" text-anchor="middle" textLength="150" lengthAdjust="spacingAndGlyphs" font-family="' + DISPLAY + '" font-weight="700" font-size="15" letter-spacing="1" fill="#f1d98a" stroke="rgba(0,0,0,.5)" stroke-width="1" paint-order="stroke">THORNBOUND THRONE</text></g>';
    L.throne.innerHTML = '<g class="tb-loc tb-throne" data-id="throne" tabindex="0" role="button" aria-label="The Thornbound Throne"><ellipse class="tb-ring" cx="' + cx + '" cy="' + cy + '" rx="132" ry="108" fill="none" stroke="#ffe9a0" stroke-width="5" stroke-dasharray="10 8" opacity="0"/>' + s + '<ellipse cx="' + cx + '" cy="' + cy + '" rx="140" ry="122" fill="transparent"/></g>';
  }
  /* ---- roads ---- */
  function buildRoads() {
    var s = '', R = rngf(seed + 5);
    S.links.forEach(function (lk) {
      var a = S.pos[lk[0]], b = S.pos[lk[1]]; if (!a || !b) return;
      var dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1, off = (R() - .5) * Math.min(60, len * .25), mx = (a.x + b.x) / 2 - dy / len * off, my = (a.y + b.y) / 2 + dx / len * off;
      var d = 'M' + n2(a.x) + ' ' + n2(a.y) + ' Q' + n2(mx) + ' ' + n2(my) + ' ' + n2(b.x) + ' ' + n2(b.y);
      s += '<path d="' + d + '" fill="none" stroke="#0a0805" stroke-opacity=".55" stroke-width="13" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="#a4895a" stroke-width="8" stroke-linecap="round" opacity=".85"/><path d="' + d + '" fill="none" stroke="#e8d9a8" stroke-width="2.4" stroke-dasharray="2 9" stroke-linecap="round" opacity=".85"/>';
    });
    L.roads.innerHTML = s;
  }
  /* ---- locations ---- */
  function slotXY(i, n) { var gp = (CP ? 5 : SLOT_GAP) * cs, tw = n * sw + (n - 1) * gp; return { x: -tw / 2 + i * (sw + gp), y: CP ? n2(46 * pu + 8) : n2(72 * cs) }; }
  function bannerW(name) { return Math.min(206, Math.max(96, measure(name, 'bold 23px ' + DISPLAY) + 46)); }
  function buildLocs() {
    var s = '', R = rngf(seed + 3);
    S.locs.forEach(function (l, li) {
      var p = S.pos[l.id], bw = bannerW(l.name), fs = 23, own = S.owners[l.id], oc = own != null && players[own] ? fac(players[own].faction) : null;
      s += '<g class="tb-loc" data-id="' + esc(l.id) + '" transform="translate(' + p.x + ' ' + p.y + ')" tabindex="0" role="button" aria-label="' + esc(l.name) + '">';
      s += '<rect class="tb-hit" x="' + n2(-98 * cs) + '" y="' + n2(-52 * pu) + '" width="' + n2(196 * cs) + '" height="' + n2((CP ? 140 : 180) * cs) + '" rx="22" fill="transparent"/>';
      s += '<circle class="tb-ring" r="' + n2(56 * pu) + '" fill="none" stroke="#ffe9a0" stroke-width="5" stroke-dasharray="9 7" opacity="0"/><g transform="scale(' + pu + ')">';
      s += '<circle cy="5" r="48" fill="#000" opacity=".5"' + filt('tb-soft') + '/>';
      s += '<circle r="46" fill="' + (oc ? 'url(#tb-f-' + oc.id + ')' : '#2a1c10') + '"/><circle r="44" fill="none" stroke="url(#tb-gold)" stroke-width="4.4"/><circle r="40" fill="#120b07"/>';
      s += '<g clip-path="url(#tbm-pc)">' + locIcon(l.type, rngf(hash(l.id))) + '<circle r="39" fill="url(#tb-vig)"/></g><circle r="40" fill="none" stroke="rgba(0,0,0,.55)" stroke-width="1.4"/></g>';
      s += '<g class="tb-name" transform="translate(0 ' + n2(CP ? -(46 * pu + 4) : 56 * cs) + ') scale(' + cs + ')"><path d="M' + (-bw / 2) + ' -14 H' + (bw / 2) + ' L' + (bw / 2 - 8) + ' 0 L' + (bw / 2) + ' 14 H' + (-bw / 2) + ' L' + (-bw / 2 + 8) + ' 0Z" fill="' + (oc ? mix(oc.dark, '#000', .1) : '#1d120b') + '" stroke="url(#tb-gold)" stroke-width="2"/><text y="' + (fs * .34) + '" text-anchor="middle" font-family="' + DISPLAY + '" font-weight="700" font-size="' + fs + '" fill="#f6e6b4" stroke="rgba(0,0,0,.6)" stroke-width="1.6" paint-order="stroke"' + (measure(l.name, 'bold 23px ' + DISPLAY) > bw - 40 ? ' textLength="' + (bw - 40) + '" lengthAdjust="spacingAndGlyphs"' : '') + '>' + esc(l.name) + '</text></g>';
      s += '<g class="tb-slots">';
      players.forEach(function (pl, si) { var q = slotXY(si, players.length); s += '<g class="tb-slot" data-loc="' + esc(l.id) + '" data-seat="' + si + '" transform="translate(' + q.x + ' ' + q.y + ')"></g>'; });
      s += '</g><g class="tb-lfx"></g></g>';
    });
    L.locs.innerHTML = s;
    locEls = {}; slotEls = {};
    Array.prototype.forEach.call(L.locs.querySelectorAll('.tb-loc'), function (g) { locEls[g.getAttribute('data-id')] = g; });
    locEls.throne = L.throne.querySelector('.tb-loc');
    Array.prototype.forEach.call(L.locs.querySelectorAll('.tb-slot'), function (g) { slotEls[g.getAttribute('data-loc') + '|' + g.getAttribute('data-seat')] = g; });
    S.locs.forEach(function (l) { players.forEach(function (pl, si) { drawSlot(l.id, si); }); });
    applyHl();
  }
  function slotMarkup(locId, si) {
    var st = (S.slots[locId] || {})[si], f = players[si].faction, P = fac(f), s = '';
    if (!st || (!st.count && !st.card && st.value == null)) {
      return '<rect width="' + sw + '" height="' + sh + '" rx="5" fill="' + P.dark + '" fill-opacity=".38" stroke="' + P.accent + '" stroke-opacity=".75" stroke-width="2" stroke-dasharray="5 4"/><g transform="translate(' + sw / 2 + ' ' + sh / 2 + ') scale(.62)" opacity=".55">' + emblem(f, P.glyph) + '</g>';
    }
    s += '<rect x="2" y="3" width="' + sw + '" height="' + sh + '" rx="5" fill="#000" opacity=".5"/>';
    s += '<g class="tb-slotcard">';
    if (st.faceDown !== false && !st.card && st.value == null) s += '<use href="#tb-back-' + f + '" width="' + sw + '" height="' + sh + '"/>';
    else if (st.card) s += '<svg x="0" y="0" width="' + sw + '" height="' + sh + '" viewBox="0 0 260 372">' + cardFaceInner(st.card, true) + '</svg>';
    else s += '<rect width="' + sw + '" height="' + sh + '" rx="5" fill="' + P.paper + '" stroke="url(#tb-gold)" stroke-width="2.4"/><text x="' + sw / 2 + '" y="' + (sh / 2 + 11) + '" text-anchor="middle" font-family="' + DISPLAY + '" font-weight="700" font-size="32" fill="' + P.main + '" stroke="' + P.dark + '" stroke-width="1" paint-order="stroke">' + esc(st.value) + '</text>';
    s += '</g>';
    if (st.winner) s += '<rect x="-3" y="-3" width="' + (sw + 6) + '" height="' + (sh + 6) + '" rx="7" fill="none" stroke="#ffe9a0" stroke-width="3.4" class="tb-win"/>';
    if (st.count > 1) s += '<g transform="translate(' + (sw - 3) + ' 4)"><circle r="9.5" fill="#1b0b10" stroke="url(#tb-gold)" stroke-width="1.8"/><text y="5.4" text-anchor="middle" font-family="' + DISPLAY + '" font-weight="700" font-size="14" fill="#f6e6b4">' + st.count + '</text></g>';
    if (st.loser) s += '<rect width="' + sw + '" height="' + sh + '" rx="5" fill="#000" opacity=".5"/>';
    return s;
  }
  function drawSlot(locId, si) { var el = slotEls[locId + '|' + si]; if (el) el.innerHTML = slotMarkup(locId, si); }
  /* ---- heralds, influence, round ---- */
  var HOFF = [[-70, 34], [70, 34], [-52, -40], [52, -40], [-84, -4], [84, -4]];
  function heraldPos(seat, locId) { var p = S.pos[locId]; if (!p) return { x: cx, y: cy }; if (locId === 'throne') { var o = [[-80, 54], [80, 54], [-40, 96], [40, 96]][seat % 4]; return { x: p.x + o[0], y: p.y + o[1] }; } var o2 = HOFF[seat % HOFF.length]; return { x: p.x + o2[0] * pu, y: p.y + o2[1] * pu }; }
  function buildHeralds() {
    var s = ''; players.forEach(function (pl, si) { s += '<g class="tb-herald" data-seat="' + si + '"><g transform="scale(' + hs + ')" filter="url(#tb-shadow)">' + heraldInner(pl.faction) + '</g><text y="22" text-anchor="middle" font-family="' + DISPLAY + '" font-weight="700" font-size="13" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke" opacity="0">' + (si + 1) + '</text></g>'; });
    L.heralds.innerHTML = s; heraldEls = {};
    Array.prototype.forEach.call(L.heralds.querySelectorAll('.tb-herald'), function (g) { heraldEls[g.getAttribute('data-seat')] = g; });
    players.forEach(function (pl, si) { var loc = S.heralds[si]; if (loc == null) { loc = S.locs.length ? S.locs[0].id : 'throne'; } placeHerald(si, loc); });
  }
  function placeHerald(si, loc) { var el = heraldEls[si], q = heraldPos(si, loc); S.heralds[si] = loc; if (el) el.style.transform = 'translate(' + q.x + 'px,' + q.y + 'px)'; }
  var IOFF = [[-12, -12], [12, -12], [-12, 12], [12, 12], [0, 0], [0, 0]];
  function inflXY(seat, v) { var p = trackPt(((v % N) + N) % N), o = IOFF[seat % 6]; return { x: p.x + o[0], y: p.y + o[1] }; }
  function buildInfl() {
    var s = ''; players.forEach(function (pl, si) { s += '<g class="tb-infl" data-seat="' + si + '"><g transform="scale(.95)">' + tokenInner('influence', { faction: pl.faction }) + '</g></g>'; });
    L.infl.innerHTML = s; inflEls = {};
    Array.prototype.forEach.call(L.infl.querySelectorAll('.tb-infl'), function (g) { inflEls[g.getAttribute('data-seat')] = g; });
    players.forEach(function (pl, si) { var q = inflXY(si, S.infl[si] || 0); inflEls[si].style.transform = 'translate(' + q.x + 'px,' + q.y + 'px)'; S.infl[si] = S.infl[si] || 0; });
  }
  function buildRound() {
    var r = S.round, bx = 156, by = 156, s = '', i, tot = Math.min(r.total, 12);
    s += '<g transform="translate(' + bx + ' ' + by + ')" filter="url(#tb-shadow)"><path d="M-54 -42 H54 V46 L0 68 L-54 46Z" fill="#1b0b10" stroke="url(#tb-gold)" stroke-width="3"/><path d="M-46 -34 H46 V40 L0 58 L-46 40Z" fill="url(#tb-c-gilded)" opacity=".9"/><text y="-17" text-anchor="middle" font-family="' + DISPLAY + '" font-weight="700" font-size="15" letter-spacing="2.4" fill="#f1d98a">ROUND</text><text y="25" text-anchor="middle" font-family="' + DISPLAY + '" font-weight="700" font-size="46" fill="#fff4cf" stroke="rgba(0,0,0,.55)" stroke-width="2" paint-order="stroke">' + r.n + '</text>';
    for (i = 0; i < tot; i++) { var px = -((tot - 1) * 7.4) / 2 + i * 7.4 + 0; s += '<circle cx="' + n2(px) + '" cy="41" r="2.6" fill="' + (i < r.n ? '#f1d98a' : '#00000066') + '" stroke="#f1d98a" stroke-width=".8"/>'; }
    s += '</g>';
    L.round.innerHTML = s;
  }
  function applyHl() {
    Object.keys(locEls).forEach(function (id) { var g = locEls[id]; if (!g) return; g.classList.toggle('tb-hl', S.hl.indexOf(id) >= 0); g.classList.toggle('tb-sel', S.sel === id); });
  }
  function rebuild() {
    cs = S.locs.length >= 11 ? .84 : 1; sw = Math.round((CP ? 44 : SLOT_W) * cs); sh = Math.round((CP ? 62 : SLOT_H) * cs); pu = (CP ? 1.2 : 1) * cs; hs = (CP ? 1.55 : 1.3) * (cs < 1 ? .9 : 1);
    var r = layoutLocations(S.locs, { w: W, h: H, links: opts.links, rot: opts.rot, below: (CP ? 128 : 118) * cs, above: (CP ? 62 : 54) * cs, half: 98 * cs }); S.pos = r.pos; S.links = r.links;
    buildStatic(); buildThrone(); buildRoads(); buildLocs(); buildRound(); buildInfl(); buildHeralds();
    L.track.innerHTML = '';
  }
  /* ---- interaction ---- */
  function tapInfo(e) { var t = e.target, loc = t.closest ? t.closest('.tb-loc') : null; if (!loc) return null; var sl = t.closest('.tb-slot'); return { id: loc.getAttribute('data-id'), seat: sl ? +sl.getAttribute('data-seat') : null, el: loc, event: e }; }
  svg.addEventListener('click', function (e) { var i = tapInfo(e); if (i && opts.onTap) opts.onTap(i.id, i); });
  svg.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { var i = tapInfo(e); if (i) { e.preventDefault(); if (opts.onTap) opts.onTap(i.id, i); } } });
  svg.addEventListener('pointerover', function (e) { var i = tapInfo(e); if (opts.onHover) opts.onHover(i ? i.id : null, i); });

  function anim(el, frames, dur, ease) { if (reduce || !el.animate) return Promise.resolve(); var a = el.animate(frames, { duration: dur, easing: ease || 'ease-in-out' }); return a.finished.catch(function () { }); }
  function wait(ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); }
  function bfs(a, b) {
    if (a === b) return [a]; var adj = {}; S.links.forEach(function (l) { (adj[l[0]] = adj[l[0]] || []).push(l[1]); (adj[l[1]] = adj[l[1]] || []).push(l[0]); });
    var prev = {}, q = [a]; prev[a] = null; while (q.length) { var c = q.shift(); if (c === b) break; (adj[c] || []).forEach(function (n) { if (!(n in prev)) { prev[n] = c; q.push(n); } }); }
    if (!(b in prev)) return [a, b]; var path = [], c2 = b; while (c2 != null) { path.unshift(c2); c2 = prev[c2]; } return path;
  }
  var api = {
    el: svg, width: W, height: H, players: players, layout: layoutLocations,
    setLocations: function (list) { S.locs = (list || []).map(function (l) { return { id: l.id, name: l.name || l.id, type: l.type || 'moor', x: l.x, y: l.y, links: l.links }; }); S.slots = {}; rebuild(); return api; },
    locations: function () { return S.locs.map(function (l) { return { id: l.id, name: l.name, type: l.type, x: S.pos[l.id].x, y: S.pos[l.id].y }; }); },
    locPos: function (id) { return S.pos[id] ? { x: S.pos[id].x, y: S.pos[id].y } : null; },
    locEl: function (id) { return locEls[id]; },
    slotEl: function (id, seat) { return slotEls[id + '|' + seat]; },
    /* setSlot(loc, seat, {count, faceDown, card:spec, value, winner, loser}) ; null clears */
    setSlot: function (loc, seat, st) { (S.slots[loc] = S.slots[loc] || {})[seat] = st; drawSlot(loc, seat); return api; },
    clearSlots: function (loc) { S.locs.forEach(function (l) { if (loc && l.id !== loc) return; S.slots[l.id] = {}; players.forEach(function (p, si) { drawSlot(l.id, si); }); }); return api; },
    setOwner: function (loc, seat) { if (seat == null) delete S.owners[loc]; else S.owners[loc] = seat; var sv = JSON.parse(JSON.stringify(S.slots)); buildLocs(); return api; },
    setHerald: function (seat, loc) { placeHerald(seat, loc); return api; },
    moveHerald: function (seat, loc, o) {
      o = o || {}; var el = heraldEls[seat], from = S.heralds[seat], path = bfs(from, loc), hop = o.hop || 420, p = Promise.resolve();
      path.forEach(function (node, i) { if (i === 0) return; p = p.then(function () { var a = heraldPos(seat, path[i - 1]), b = heraldPos(seat, node); el.style.transform = 'translate(' + b.x + 'px,' + b.y + 'px)'; return anim(el, [{ transform: 'translate(' + a.x + 'px,' + a.y + 'px)' }, { transform: 'translate(' + (a.x + b.x) / 2 + 'px,' + ((a.y + b.y) / 2 - 22) + 'px)', offset: .5 }, { transform: 'translate(' + b.x + 'px,' + b.y + 'px)' }], hop, 'ease-in-out'); }); });
      return p.then(function () { S.heralds[seat] = loc; return path; });
    },
    heraldAt: function (seat) { return S.heralds[seat]; },
    setInfluence: function (seat, v, o) {
      var el = inflEls[seat], from = S.infl[seat] || 0, steps = Math.abs(v - from), dir = v >= from ? 1 : -1, fr = [], i; S.infl[seat] = v;
      for (i = 0; i <= Math.min(steps, 60); i++) { var q = inflXY(seat, from + dir * i); fr.push({ transform: 'translate(' + q.x + 'px,' + q.y + 'px)' }); }
      var e = inflXY(seat, v); el.style.transform = 'translate(' + e.x + 'px,' + e.y + 'px)';
      if (fr.length < 2 || (o && o.immediate)) return Promise.resolve();
      return anim(el, fr, Math.min(1600, 120 * steps + 250), 'linear');
    },
    influence: function (seat) { return S.infl[seat] || 0; },
    setRound: function (n, total) { S.round = { n: n, total: total || S.round.total }; buildRound(); return api; },
    highlight: function (ids) { S.hl = ids ? [].concat(ids) : []; applyHl(); return api; },
    select: function (id) { S.sel = id || null; applyHl(); return api; },
    pulse: function (id) { var g = locEls[id]; if (!g) return Promise.resolve(); var ring = g.querySelector('.tb-ring'); return anim(ring, [{ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'scale(1.15)' }, { opacity: 0, transform: 'scale(1.4)' }], 900, 'ease-out'); },
    /* revealSlots(loc, [{seat, card:spec, value, winner}], {stagger}) -> Promise: flips the face-down slot cards one by one then marks the winner(s). */
    revealSlots: function (loc, entries, o) {
      o = o || {}; var g = locEls[loc], p = S.pos[loc], p0 = Promise.resolve(), fx = g.querySelector('.tb-lfx');
      fx.innerHTML = '<g transform="translate(0 -4)" opacity="0">' + tokenInner('clash') + '</g>'; var mk = fx.firstChild;
      p0 = anim(mk, [{ opacity: 0, transform: 'translate(0,-4px) scale(.3)' }, { opacity: 1, transform: 'translate(0,-4px) scale(1.2)' }], 360, 'ease-out').then(function () { mk.setAttribute('opacity', '1'); });
      entries.forEach(function (en, k) {
        p0 = p0.then(function () {
          var el = slotEls[loc + '|' + en.seat], card = el.querySelector('.tb-slotcard') || el; el.style.transformBox = 'fill-box';
          S.slots[loc] = S.slots[loc] || {}; var prev = S.slots[loc][en.seat] || {};
          return anim(card, [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], 170, 'ease-in').then(function () {
            S.slots[loc][en.seat] = { count: prev.count, card: en.card, value: en.card ? null : en.value, faceDown: false }; drawSlot(loc, en.seat);
            var nc = slotEls[loc + '|' + en.seat].querySelector('.tb-slotcard'); return anim(nc, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 190, 'ease-out');
          }).then(function () { return wait(o.stagger != null ? o.stagger : 220); });
        });
      });
      return p0.then(function () {
        var any = entries.some(function (e) { return e.winner; });
        entries.forEach(function (en) { var st = S.slots[loc][en.seat]; st.winner = !!en.winner; st.loser = any && !en.winner; drawSlot(loc, en.seat); });
        var w = entries.filter(function (e) { return e.winner; })[0];
        mk.setAttribute('opacity', '0'); if (w) { S.owners[loc] = w.seat; }
        return wait(300);
      });
    },
    resetReveal: function (loc) { var g = locEls[loc]; if (g) g.querySelector('.tb-lfx').innerHTML = ''; players.forEach(function (p, si) { var st = (S.slots[loc] || {})[si]; if (st) { st.winner = false; st.loser = false; drawSlot(loc, si); } }); },
    destroy: function () { if (svg.parentNode) svg.parentNode.removeChild(svg); }
  };
  api.setLocations(opts.locations || TB.defaultLocations(10));
  if (opts.container) opts.container.appendChild(svg);
  return api;
};

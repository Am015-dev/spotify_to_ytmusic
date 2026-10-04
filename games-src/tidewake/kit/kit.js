/* Tidewake - 3D visual kit ("Painted sea chart").
 * Plain script. Needs Three.js r158 UMD (global THREE) for 3D; the SVG 2D fallback needs only the DOM.
 * Exposes window.TWKit. All art is procedural (canvas textures, geometry, shaders, SVG). No external assets. */
(function (global) {
'use strict';
var THREE = global.THREE;
var TWKit = { version: '1.0.0' };
global.TWKit = TWKit;

/* ------------------------------------------------------------------ constants */
var FD = "'IM Fell English SC','IM Fell English','Cormorant Garamond',Georgia,'Times New Roman',serif";
var FB = "'Cormorant Garamond',Georgia,'Times New Roman',serif";
var C = { ink: '#14232b', deep: '#0d4551', sea: '#1d7c83', sea2: '#3aa6a3', foam: '#f6f2df', gold: '#e3b24b', goldD: '#a77a22', paper: '#ecdcaa', paperD: '#c9ae6f', verm: '#c9422e' };
var SHIP_COLORS = [
  { id: 'vermilion', name: 'Vermilion', sail: '#d9432f', trim: '#8a1d12' },
  { id: 'saffron', name: 'Saffron', sail: '#f2b51d', trim: '#9b6a05' },
  { id: 'jade', name: 'Jade', sail: '#3fae5b', trim: '#1b6b36' },
  { id: 'cobalt', name: 'Cobalt', sail: '#3a74dc', trim: '#173f8f' },
  { id: 'violet', name: 'Violet', sail: '#8a56c4', trim: '#4b2680' },
  { id: 'tangerine', name: 'Tangerine', sail: '#f07d22', trim: '#9a4308' },
  { id: 'rose', name: 'Rose', sail: '#ea6fa0', trim: '#9a2a5c' },
  { id: 'ivory', name: 'Ivory', sail: '#f3ead0', trim: '#8c7a4f' }
];
var G = 3, M = 1.45, HALF = G + M;                       // grid half-size, margin, board half-size (4.45)
var GFX = {
  high:   { dpr: 2,   shadows: true,  map: 2048, board: 2048, parts: 1,  flow: true,  aa: true,  phys: true },
  medium: { dpr: 1.5, shadows: true,  map: 1024, board: 1536, parts: .7, flow: true,  aa: true,  phys: false },
  low:    { dpr: .75, shadows: false, map: 0,    board: 1024, parts: .4, flow: false, aa: false, phys: false }
};
var K = {
  mode: 'none', on: false, q: 'high', pref: 'auto', speed: 1, tw: [], frame: { hist: [], rh: [], n: 0, last: 0 },
  hooks: {}, listeners: {}, w: 800, h: 600, reserve: { l: 0, r: 0, t: 0, b: 0 }
};
var S = { tiles: {}, levs: {}, ships: {}, gates: {}, mael: {}, dice: [], legal: [], hover: null, ghost: null, line: null, rogue: {}, markers: {}, waveTiles: {} };
function now() { return (global.performance && performance.now) ? performance.now() : Date.now(); }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function sstep(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
function mul32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
var EASE = {
  lin: function (k) { return k; }, io: function (k) { return k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; },
  sine: function (k) { return -(Math.cos(Math.PI * k) - 1) / 2; }, out: function (k) { return 1 - Math.pow(1 - k, 3); }, in: function (k) { return k * k * k; },
  back: function (k) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); },
  bounce: function (k) { var n = 7.5625, d = 2.75; if (k < 1 / d) return n * k * k; if (k < 2 / d) return n * (k -= 1.5 / d) * k + .75; if (k < 2.5 / d) return n * (k -= 2.25 / d) * k + .9375; return n * (k -= 2.625 / d) * k + .984375; }
};
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function raf(fn) { return (global.requestAnimationFrame || function (f) { return setTimeout(function () { f(now()); }, 16); })(fn); }
function hasGL() {
  if (!THREE) return false;
  try { if (/jsdom/i.test(navigator.userAgent)) return false; var c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}
TWKit.supported = hasGL;
TWKit.SHIP_COLORS = SHIP_COLORS;
TWKit.BOARD = { cells: 6, cell: 1, half: HALF, gridHalf: G };

/* ------------------------------------------------------------------ tile geometry (unit cell, y down)
 * Ports 0..7 clockwise from top-left: 0,1 top (L->R); 2,3 right (T->B); 4,5 bottom (R->L); 6,7 left (B->T). Rotating a tile 90 deg cw adds 2. */
var PORT = [[1 / 3, 0], [2 / 3, 0], [1, 1 / 3], [1, 2 / 3], [2 / 3, 1], [1 / 3, 1], [0, 2 / 3], [0, 1 / 3]];
var NORM = [[0, 1], [0, 1], [-1, 0], [-1, 0], [0, -1], [0, -1], [1, 0], [1, 0]];
function rotPaths(paths, k) { k = ((k || 0) % 4 + 4) % 4; return paths.map(function (p) { return [(p[0] + 2 * k) % 8, (p[1] + 2 * k) % 8]; }); }
function cp(a, b) {
  var pa = PORT[a], pb = PORT[b], na = NORM[a], nb = NORM[b], d = Math.hypot(pa[0] - pb[0], pa[1] - pb[1]), k = clamp(d * .55, .17, .5);
  return [pa, [pa[0] + na[0] * k, pa[1] + na[1] * k], [pb[0] + nb[0] * k, pb[1] + nb[1] * k], pb];
}
function bez(P, t) { var u = 1 - t, a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t; return [a * P[0][0] + b * P[1][0] + c * P[2][0] + d * P[3][0], a * P[0][1] + b * P[1][1] + c * P[2][1] + d * P[3][1]]; }
function bezTan(P, t) { var u = 1 - t; return [3 * u * u * (P[1][0] - P[0][0]) + 6 * u * t * (P[2][0] - P[1][0]) + 3 * t * t * (P[3][0] - P[2][0]), 3 * u * u * (P[1][1] - P[0][1]) + 6 * u * t * (P[2][1] - P[1][1]) + 3 * t * t * (P[3][1] - P[2][1])]; }
function pathD(a, b, sx, ox, oy) { var P = cp(a, b), f = function (p) { return (ox + p[0] * sx).toFixed(2) + ' ' + (oy + p[1] * sx).toFixed(2); }; return 'M' + f(P[0]) + 'C' + f(P[1]) + ' ' + f(P[2]) + ' ' + f(P[3]); }
function wx(c, u) { return c - G + u; }
function wz(r, v) { return r - G + v; }
function portWorld(c, r, p) { return [wx(c, PORT[p][0]), wz(r, PORT[p][1])]; }
function normPaths(paths) { var a = []; (paths || []).forEach(function (p) { a.push([p[0] | 0, p[1] | 0]); }); return a; }
function sig(paths) { return paths.map(function (p) { return Math.min(p[0], p[1]) + '-' + Math.max(p[0], p[1]); }).sort().join(','); }
/* which port the path leaves from if you enter at `p` */
function exitPort(paths, p) { for (var i = 0; i < paths.length; i++) { if (paths[i][0] === p) return paths[i][1]; if (paths[i][1] === p) return paths[i][0]; } return -1; }
/* walk the path from `p`: returns [{from,to}] */
TWKit.rotate = rotPaths;
TWKit.exitPort = exitPort;
TWKit.portUV = function (p) { return PORT[p].slice(); };
TWKit.portWorld = portWorld;
/* edge numbering helper: start marks. edge 'top'|'right'|'bottom'|'left', index 1..6 -> the square and the two ports on that edge square */
TWKit.edgeSquare = function (edge, index) {
  var i = index - 1;
  if (edge === 'top') return { c: i, r: 0, ports: [0, 1] };
  if (edge === 'bottom') return { c: i, r: 5, ports: [5, 4] };
  if (edge === 'left') return { c: 0, r: i, ports: [7, 6] };
  return { c: 5, r: i, ports: [2, 3] };
};
/* inverse: given an outer square + port, which edge/index; null for inner ports */
TWKit.portEdge = function (c, r, p) {
  if (r === 0 && p < 2) return { edge: 'top', index: c + 1 };
  if (c === 5 && (p === 2 || p === 3)) return { edge: 'right', index: r + 1 };
  if (r === 5 && (p === 4 || p === 5)) return { edge: 'bottom', index: c + 1 };
  if (c === 0 && (p === 6 || p === 7)) return { edge: 'left', index: r + 1 };
  return null;
};
/* neighbour square + entering port when leaving square (c,r) through port p */
TWKit.neighbour = function (c, r, p) {
  var side = p < 2 ? 0 : p < 4 ? 1 : p < 6 ? 2 : 3, dc = [0, 1, 0, -1][side], dr = [-1, 0, 1, 0][side];
  var np = [5 - p + 0, 0, 0, 0][0]; var map = { 0: 5, 1: 4, 2: 7, 3: 6, 4: 1, 5: 0, 6: 3, 7: 2 }; np = map[p];
  return { c: c + dc, r: r + dr, port: np, inside: c + dc >= 0 && c + dc < 6 && r + dr >= 0 && r + dr < 6 };
};
/* trace a ship through placed tiles from (c,r,port): returns steps [{c,r,from,to}] ending at an empty square, leviathan, or the edge. tiles: {'c,r': paths} */
TWKit.trace = function (tiles, c, r, port, max) {
  var steps = [], n = max || 40;
  while (n-- > 0) {
    var t = tiles[c + ',' + r]; if (!t) break;
    var to = exitPort(t, port); if (to < 0) break;
    steps.push({ c: c, r: r, from: port, to: to });
    var nb = TWKit.neighbour(c, r, to); if (!nb.inside) break;
    c = nb.c; r = nb.r; port = nb.port;
  }
  return steps;
};

/* ------------------------------------------------------------------ card images (SVG, work in <img>, jsdom and 3D) */
function tileSVGInner(paths, o, sx, ox, oy, uid) {
  var s = '';
  s += paths.map(function (p) { return '<path d="' + pathD(p[0], p[1], sx, ox, oy) + '" fill="none" stroke="#9fe6dc" stroke-opacity=".38" stroke-width="' + sx * .13 + '" stroke-linecap="round" filter="url(#bl' + uid + ')"/>'; }).join('');
  s += paths.map(function (p) { return '<path d="' + pathD(p[0], p[1], sx, ox, oy) + '" fill="none" stroke="' + (o.pathColor || '#f6f2df') + '" stroke-width="' + sx * .05 + '" stroke-linecap="round"/>'; }).join('');
  s += paths.map(function (p) { return '<path d="' + pathD(p[0], p[1], sx, ox, oy) + '" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="' + sx * .016 + '" stroke-linecap="round" stroke-dasharray="' + sx * .05 + ' ' + sx * .07 + '"/>'; }).join('');
  for (var i = 0; i < 8; i++) s += '<circle cx="' + (ox + PORT[i][0] * sx) + '" cy="' + (oy + PORT[i][1] * sx) + '" r="' + sx * .02 + '" fill="' + C.gold + '"/>';
  return s;
}
/* cardSVG(paths,{rot,size,selected,pathColor,uid,legal}) -> '<svg ...>' string of a hand tile card */
TWKit.cardSVG = function (paths, o) {
  o = o || {}; paths = rotPaths(normPaths(paths), o.rot || 0); var u = o.uid || 'x', sz = o.size || 120;
  var br = o.selected ? C.gold : '#e9d9a8';
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + sz + '" height="' + sz + '" viewBox="0 0 100 100"><defs><radialGradient id="bg' + u + '" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#3aa6a3"/><stop offset=".6" stop-color="#1d7c83"/><stop offset="1" stop-color="#0f4f5b"/></radialGradient><filter id="bl' + u + '" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter></defs>' +
    '<rect x="2" y="2" width="96" height="96" rx="9" fill="' + br + '" stroke="' + C.ink + '" stroke-width="2"/><rect x="5" y="5" width="90" height="90" rx="6" fill="url(#bg' + u + ')" stroke="' + C.ink + '" stroke-opacity=".7" stroke-width="1"/>' +
    '<g transform="translate(5,5)"><clipPath id="cl' + u + '"><rect width="90" height="90" rx="6"/></clipPath><g clip-path="url(#cl' + u + ')">' + tileSVGInner(paths, o, 90, 0, 0, u) + '</g></g>' +
    '<g opacity=".18" stroke="#fff" fill="none" stroke-width=".7"><path d="M12 14q4-4 8 0t8 0"/><path d="M70 84q4-4 8 0t8 0"/></g></svg>';
};
TWKit.cardURL = function (paths, o) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(TWKit.cardSVG(paths, o)); };
/* leviathan card: arrows [{dir:0..7 (0=N,clockwise),n:1..6}] */
function arrowXY(dir, R) { var a = (dir * 45 - 90) * Math.PI / 180; return [Math.cos(a) * R, Math.sin(a) * R, a]; }
TWKit.leviathanSVG = function (arrows, o) {
  o = o || {}; var u = o.uid || 'x', sz = o.size || 120, rot = o.rot || 0; arrows = (arrows || []).map(function (a) { return { dir: (a.dir + rot * 2) % 8, n: a.n }; });
  var s = '<svg xmlns="http://www.w3.org/2000/svg" width="' + sz + '" height="' + sz + '" viewBox="0 0 100 100"><defs><radialGradient id="lv' + u + '" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#17343f"/><stop offset="1" stop-color="#07151c"/></radialGradient></defs><rect x="2" y="2" width="96" height="96" rx="9" fill="' + (o.selected ? C.gold : '#c9ae6f') + '" stroke="' + C.ink + '" stroke-width="2"/><rect x="5" y="5" width="90" height="90" rx="6" fill="url(#lv' + u + ')"/>';
  s += '<circle cx="50" cy="50" r="16" fill="none" stroke="' + C.gold + '" stroke-opacity=".6" stroke-width="1.2"/><path d="M42 58c-6-10 4-16 10-12s2 12-6 9" fill="none" stroke="#5fd0b6" stroke-width="3" stroke-linecap="round"/><circle cx="55" cy="44" r="1.6" fill="#ffd76b"/>';
  arrows.forEach(function (a) { var p = arrowXY(a.dir, 33), q = arrowXY(a.dir, 41); s += '<g transform="translate(' + (50 + p[0]) + ' ' + (50 + p[1]) + ') rotate(' + (a.dir * 45) + ')"><path d="M0-10L7-1H2.6V8H-2.6V-1H-7Z" fill="' + C.gold + '" stroke="' + C.ink + '" stroke-width="1"/></g><g transform="translate(' + (50 + arrowXY(a.dir, 24)[0]) + ' ' + (50 + arrowXY(a.dir, 24)[1]) + ')"><circle r="6.2" fill="' + C.ink + '" stroke="' + C.gold + '" stroke-width="1.2"/><text y="3.6" text-anchor="middle" font-size="9.5" font-weight="700" fill="#fff4cc" font-family="' + FD.replace(/"/g, "'") + '">' + a.n + '</text></g>'; });
  return s + '</svg>';
};
TWKit.leviathanURL = function (arrows, o) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(TWKit.leviathanSVG(arrows, o)); };

/* the 35 distinct 8-port layouts (every perfect matching of the ports, one per rotation class) */
var LAYOUTS = null;
TWKit.layouts = function () {
  if (LAYOUTS) return LAYOUTS.map(function (l) { return l.map(function (p) { return p.slice(); }); });
  var all = [];
  (function rec(free, cur) { if (!free.length) { all.push(cur.slice()); return; } var a = free[0]; for (var i = 1; i < free.length; i++) { var b = free[i], rest = free.filter(function (x, j) { return j && j !== i; }); cur.push([a, b]); rec(rest, cur); cur.pop(); } })([0, 1, 2, 3, 4, 5, 6, 7], []);
  var seen = {}; LAYOUTS = [];
  all.forEach(function (m) { var keys = [0, 1, 2, 3].map(function (k) { return sig(rotPaths(m, k)); }); var key = keys.slice().sort()[0]; if (!seen[key]) { seen[key] = 1; LAYOUTS.push(m); } });
  return TWKit.layouts();
};

/* ------------------------------------------------------------------ canvas painters */
function mkCanvas(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function ctx2(c) { return c.getContext('2d', { willReadFrequently: true }); }
var texCache = {};
function ctex(key, w, h, fn, opt) {
  if (texCache[key]) return texCache[key];
  var c = mkCanvas(w, h), x = ctx2(c); fn(x, w, h);
  var t = new THREE.CanvasTexture(c); t.colorSpace = opt && opt.linear ? THREE.NoColorSpace : THREE.SRGBColorSpace; t.anisotropy = K.aniso || 4; t.needsUpdate = true;
  if (opt && opt.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  texCache[key] = t; return t;
}
function blob(x, cx, cy, r, col, a) { var g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, 'rgba(' + col + ',' + a + ')'); g.addColorStop(1, 'rgba(' + col + ',0)'); x.fillStyle = g; x.fillRect(cx - r, cy - r, r * 2, r * 2); }
function grain(x, w, h, amt, seed) {
  var d = x.getImageData(0, 0, w, h), a = d.data, R = mul32(seed || 7);
  for (var i = 0; i < a.length; i += 4) { var n = (R() - .5) * amt; a[i] += n; a[i + 1] += n; a[i + 2] += n; }
  x.putImageData(d, 0, 0);
}
/* hand-drawn wobbly rounded-rect loop, returns points in world units */
function coastPts(half, seed) {
  var R = mul32(seed), pts = [], step = .1, ph = [R() * 6, R() * 6, R() * 6, R() * 6];
  var per = half * 8, n = Math.round(per / step);
  for (var i = 0; i < n; i++) {
    var t = i / n * 4, side = Math.floor(t), f = t - side, x, y;
    var u = (f - .5) * 2 * half;
    x = [u, half, -u, -half][side]; y = [-half, u, half, -u][side];
    var w = Math.sin(i * .21 + ph[0]) * .045 + Math.sin(i * .53 + ph[1]) * .03 + Math.sin(i * .11 + ph[2]) * .06;
    var nx = [0, 1, 0, -1][side], ny = [1, 0, -1, 0][side]; // inward
    // keep corners rounded by pulling inward near corners
    var cr = Math.min(f, 1 - f); var pull = Math.pow(Math.max(0, .09 - cr) / .09, 2) * .32;
    pts.push([x + nx * (w + pull), y + ny * (w + pull)]);
  }
  return pts;
}
function compass(x, cx, cy, R, a) {
  x.save(); x.translate(cx, cy); x.globalAlpha = a;
  x.strokeStyle = C.goldD; x.lineWidth = R * .012; x.fillStyle = 'rgba(0,0,0,0)';
  [1, .93, .56, .5].forEach(function (k) { x.beginPath(); x.arc(0, 0, R * k, 0, 7); x.stroke(); });
  // degree ticks
  for (var i = 0; i < 72; i++) { var an = i / 72 * Math.PI * 2, l = i % 9 === 0 ? .07 : .035; x.beginPath(); x.moveTo(Math.cos(an) * R * .93, Math.sin(an) * R * .93); x.lineTo(Math.cos(an) * R * (.93 + l), Math.sin(an) * R * (.93 + l)); x.stroke(); }
  // 16 points: 4 long, 4 medium, 8 short
  for (var p = 0; p < 16; p++) {
    var ang = p / 16 * Math.PI * 2 - Math.PI / 2, len = p % 4 === 0 ? .92 : p % 2 === 0 ? .66 : .42, w = p % 4 === 0 ? .11 : p % 2 === 0 ? .075 : .05;
    var cs = Math.cos(ang), sn = Math.sin(ang), px = -sn, py = cs;
    [[1, C.gold], [-1, '#b8862a']].forEach(function (sd) {
      x.beginPath(); x.moveTo(0, 0); x.lineTo(cs * R * len, sn * R * len); x.lineTo(cs * R * w * 1.6 + px * R * w * sd[0], sn * R * w * 1.6 + py * R * w * sd[0]); x.closePath();
      x.fillStyle = sd[1]; x.fill(); x.strokeStyle = C.ink; x.lineWidth = R * .008; x.stroke();
    });
  }
  x.beginPath(); x.arc(0, 0, R * .06, 0, 7); x.fillStyle = C.ink; x.fill(); x.strokeStyle = C.gold; x.lineWidth = R * .014; x.stroke();
  x.fillStyle = C.gold; x.font = '700 ' + R * .16 + 'px ' + FD; x.textAlign = 'center'; x.textBaseline = 'middle'; x.strokeStyle = C.ink; x.lineWidth = R * .02;
  x.strokeText('N', 0, -R * 1.18); x.fillText('N', 0, -R * 1.18);
  x.restore();
}
function paintBoard(x, S_) {
  var pu = S_ / (2 * HALF), X = function (v) { return (v + HALF) * pu; };
  var R = mul32(1234);
  // sea base
  var g = x.createRadialGradient(S_ / 2, S_ / 2, S_ * .1, S_ / 2, S_ / 2, S_ * .75); g.addColorStop(0, '#1f7a82'); g.addColorStop(.6, '#145a66'); g.addColorStop(1, '#0a3a47');
  x.fillStyle = g; x.fillRect(0, 0, S_, S_);
  // ink-wash blotches
  var pal = ['60,170,165', '20,90,105', '120,200,190', '10,60,80', '200,230,210'];
  for (var i = 0; i < 520; i++) blob(x, R() * S_, R() * S_, (40 + R() * 220) * S_ / 2048, pal[(R() * pal.length) | 0], .035 + R() * .08);
  // seigaiha waves (faint)
  x.save(); x.globalAlpha = .13; x.strokeStyle = '#d8f4ec'; x.lineWidth = Math.max(1, pu * .012);
  var rr = pu * .3;
  for (var row = 0; row < 40; row++) for (var col = -1; col < 36; col++) {
    var cx = col * rr * 2 + (row % 2) * rr, cy = row * rr * .55; if (cx < 0 || cy < 0 || cx > S_ || cy > S_) continue;
    for (var k = 1; k <= 3; k++) { x.beginPath(); x.arc(cx, cy, rr * k / 3, Math.PI, 0); x.stroke(); }
  }
  x.restore();
  // paper grain over sea
  grain(x, S_, S_, 14, 3);
  // grid cells
  for (var r = 0; r < 6; r++) for (var c = 0; c < 6; c++) {
    var px = X(c - G), py = X(r - G);
    x.fillStyle = (r + c) % 2 ? 'rgba(255,255,255,.045)' : 'rgba(0,30,40,.07)'; x.fillRect(px, py, pu, pu);
  }
  x.strokeStyle = 'rgba(232,196,110,.6)'; x.lineWidth = Math.max(1.2, pu * .012); x.setLineDash([pu * .05, pu * .05]);
  for (var l = 0; l <= 6; l++) { x.beginPath(); x.moveTo(X(-G + l), X(-G)); x.lineTo(X(-G + l), X(G)); x.moveTo(X(-G), X(-G + l)); x.lineTo(X(G), X(-G + l)); x.stroke(); }
  x.setLineDash([]);
  x.strokeStyle = C.gold; x.lineWidth = pu * .028; x.strokeRect(X(-G), X(-G), pu * 6, pu * 6); x.strokeStyle = C.ink; x.lineWidth = pu * .01; x.strokeRect(X(-G) - pu * .03, X(-G) - pu * .03, pu * 6.06, pu * 6.06);
  // centre compass rose + corner rose
  compass(x, X(0), X(0), pu * 2.3, .5);
  // coast / parchment frame
  var cpts = coastPts(HALF - .45, 99);
  x.beginPath(); x.rect(0, 0, S_, S_); x.moveTo(X(cpts[0][0]), X(cpts[0][1])); for (var q = 1; q < cpts.length; q++) x.lineTo(X(cpts[q][0]), X(cpts[q][1])); x.closePath();
  var pg = x.createLinearGradient(0, 0, S_, S_); pg.addColorStop(0, '#f0e2b4'); pg.addColorStop(.5, '#e5d29a'); pg.addColorStop(1, '#d7bf84'); x.fillStyle = pg; x.fill('evenodd');
  // shallow rings
  for (var s = 1; s <= 5; s++) {
    x.beginPath(); for (var q2 = 0; q2 < cpts.length; q2++) { var pp = cpts[q2], L = Math.hypot(pp[0], pp[1]) || 1, ex = s * .05; var qx = pp[0] - pp[0] / L * ex * .8 - Math.sign(pp[0]) * ex * .2, qy = pp[1] - pp[1] / L * ex * .8 - Math.sign(pp[1]) * ex * .2; if (q2) x.lineTo(X(qx), X(qy)); else x.moveTo(X(qx), X(qy)); }
    x.closePath(); x.strokeStyle = 'rgba(220,245,235,' + (.5 - s * .08) + ')'; x.lineWidth = pu * .02; x.stroke();
  }
  x.beginPath(); for (var q3 = 0; q3 < cpts.length; q3++) { if (q3) x.lineTo(X(cpts[q3][0]), X(cpts[q3][1])); else x.moveTo(X(cpts[q3][0]), X(cpts[q3][1])); } x.closePath(); x.strokeStyle = C.ink; x.lineWidth = pu * .022; x.stroke();
  // coast hatch (short ticks on land side)
  x.strokeStyle = 'rgba(80,60,30,.5)'; x.lineWidth = pu * .008;
  for (var h = 0; h < cpts.length; h += 1) { var a0 = cpts[h], L2 = Math.hypot(a0[0], a0[1]) || 1; x.beginPath(); x.moveTo(X(a0[0]), X(a0[1])); x.lineTo(X(a0[0] + a0[0] / L2 * .1), X(a0[1] + a0[1] / L2 * .1)); x.stroke(); }
  // graticule border
  var o1 = HALF - .08, o2 = HALF - .2;
  x.strokeStyle = C.ink; x.lineWidth = pu * .018; x.strokeRect(X(-o1), X(-o1), pu * 2 * o1, pu * 2 * o1); x.lineWidth = pu * .008; x.strokeRect(X(-o2), X(-o2), pu * 2 * o2, pu * 2 * o2);
  var nt = 48; for (var tt = 0; tt < nt; tt++) {
    var a = -o1 + (tt / nt) * 2 * o1, b = -o1 + ((tt + 1) / nt) * 2 * o1; if (tt % 2) continue; x.fillStyle = C.ink;
    x.fillRect(X(a), X(-o1), (X(b) - X(a)), X(-o2) - X(-o1)); x.fillRect(X(a), X(o2), (X(b) - X(a)), X(o1) - X(o2)); x.fillRect(X(-o1), X(a), X(-o2) - X(-o1), (X(b) - X(a))); x.fillRect(X(o2), X(a), X(o1) - X(o2), (X(b) - X(a)));
  }
  // corner islands + doodles
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (cc, i) {
    var cx = cc[0] * (HALF - 1.0), cy = cc[1] * (HALF - 1.0);
    if (i === 3) { compass(x, X(cx), X(cy), pu * .62, .9); return; }
    x.save(); x.translate(X(cx), X(cy)); x.fillStyle = 'rgba(214,190,120,.95)'; x.strokeStyle = C.ink; x.lineWidth = pu * .014;
    x.beginPath(); for (var a2 = 0; a2 < 14; a2++) { var an = a2 / 14 * 6.283, rad = pu * (.22 + .07 * Math.sin(a2 * 2.3 + i)); a2 ? x.lineTo(Math.cos(an) * rad, Math.sin(an) * rad * .8) : x.moveTo(Math.cos(an) * rad, Math.sin(an) * rad * .8); } x.closePath(); x.fill(); x.stroke();
    x.strokeStyle = '#3f7a46'; x.lineWidth = pu * .02; x.beginPath(); x.moveTo(-pu * .05, 0); x.lineTo(-pu * .05, -pu * .1); x.moveTo(pu * .06, -pu * .02); x.lineTo(pu * .08, -pu * .1); x.stroke();
    x.restore();
  });
  // coordinates 1-6 on every edge + start marks
  x.font = '700 ' + pu * .27 + 'px ' + FD; x.textAlign = 'center'; x.textBaseline = 'middle';
  function medal(wx_, wy_, n) { var cx = X(wx_), cy = X(wy_); x.beginPath(); x.arc(cx, cy, pu * .19, 0, 7); x.fillStyle = 'rgba(12,40,50,.9)'; x.fill(); x.strokeStyle = C.gold; x.lineWidth = pu * .017; x.stroke(); x.beginPath(); x.arc(cx, cy, pu * .155, 0, 7); x.strokeStyle = 'rgba(227,178,75,.45)'; x.lineWidth = pu * .006; x.stroke(); x.fillStyle = '#fff2c4'; x.fillText(String(n), cx, cy + pu * .012); }
  for (var n = 1; n <= 6; n++) { var u = n - 3.5; medal(u, -G - .42, n); medal(u, G + .42, n); medal(-G - .42, u, n); medal(G + .42, u, n); }
  // start marks at the outer ports
  for (var e = 0; e < 6; e++) for (var pp2 = 0; pp2 < 2; pp2++) {
    var f = e + (pp2 ? 2 / 3 : 1 / 3) - G;
    [[f, -G, 0, -1], [f, G, 0, 1], [-G, f, -1, 0], [G, f, 1, 0]].forEach(function (m) {
      var cx = X(m[0] + m[2] * .0), cy = X(m[1] + m[3] * .0);
      x.beginPath(); x.arc(cx, cy, pu * .075, 0, 7); x.fillStyle = 'rgba(10,40,50,.85)'; x.fill(); x.strokeStyle = C.gold; x.lineWidth = pu * .014; x.stroke();
      x.beginPath(); x.arc(cx, cy, pu * .026, 0, 7); x.fillStyle = C.gold; x.fill();
    });
  }
  grain(x, S_, S_, 9, 11);
}
function paintWood(x, w, h, base, dark, seed, vertical) {
  var R = mul32(seed); x.fillStyle = base; x.fillRect(0, 0, w, h);
  for (var i = 0; i < 90; i++) { var y = R() * (vertical ? w : h), th = 1 + R() * 5, a = .05 + R() * .16; x.fillStyle = 'rgba(' + dark + ',' + a + ')'; if (vertical) x.fillRect(y, 0, th, h); else x.fillRect(0, y, w, th); }
  for (var j = 0; j < 40; j++) { x.strokeStyle = 'rgba(' + dark + ',' + (.1 + R() * .15) + ')'; x.lineWidth = .8 + R(); x.beginPath(); var y0 = R() * h; x.moveTo(0, y0); for (var xx = 0; xx <= w; xx += 32) x.lineTo(xx, y0 + Math.sin(xx * .02 + j) * (3 + R() * 3)); x.stroke(); }
  for (var k = 0; k < 6; k++) blob(x, R() * w, R() * h, 40 + R() * 90, dark, .12);
  grain(x, w, h, 12, seed);
}
/* sea tile square: paths in cell coords. kind 'map' or 'glow' (emissive layer, black bg) */
function paintCurrent(x, w, paths, kind, ghost) {
  var R = mul32(hashStr(sig(paths)) || 5), sx = w;
  if (kind === 'map') {
    var g = x.createRadialGradient(w * .5, w * .45, w * .05, w * .5, w * .5, w * .75); g.addColorStop(0, '#3a9aa0'); g.addColorStop(.55, '#237a86'); g.addColorStop(1, '#124f5d'); x.fillStyle = g; x.fillRect(0, 0, w, w);
    var pal = ['100,200,190', '20,80,100', '170,230,215', '12,60,80'];
    for (var i = 0; i < 40; i++) blob(x, R() * w, R() * w, w * (.08 + R() * .3), pal[(R() * 4) | 0], .05 + R() * .09);
    x.strokeStyle = 'rgba(225,248,240,.14)'; x.lineWidth = w * .006; for (var s = 0; s < 14; s++) { var cx = R() * w, cy = R() * w, rr = w * (.025 + R() * .04); x.beginPath(); x.arc(cx, cy, rr, Math.PI, 0); x.stroke(); x.beginPath(); x.arc(cx, cy, rr * .55, Math.PI, 0); x.stroke(); }
    grain(x, w, w, 10, hashStr(sig(paths)));
    // inked border
    x.strokeStyle = C.ink; x.lineWidth = w * .03; x.strokeRect(w * .02, w * .02, w * .96, w * .96); x.strokeStyle = 'rgba(227,178,75,.8)'; x.lineWidth = w * .008; x.strokeRect(w * .045, w * .045, w * .91, w * .91);
  } else { x.fillStyle = '#000'; x.fillRect(0, 0, w, w); }
  var gl = kind === 'glow';
  paths.forEach(function (p) {
    var d = pathD(p[0], p[1], sx, 0, 0);
    var P2 = new Path2D(d);
    x.lineCap = 'round';
    x.strokeStyle = gl ? 'rgba(120,255,235,.55)' : 'rgba(160,240,225,.30)'; x.lineWidth = w * .12; x.filter = 'blur(' + w * .025 + 'px)'; x.stroke(P2); x.filter = 'none';
    x.strokeStyle = gl ? 'rgba(180,255,245,.8)' : 'rgba(30,100,110,.55)'; x.lineWidth = w * .066; x.stroke(P2);
    x.strokeStyle = gl ? 'rgba(235,255,250,.95)' : C.foam; x.lineWidth = w * .036; x.stroke(P2);
    // foam ticks along curve
    var Pc = cp(p[0], p[1]);
    x.strokeStyle = gl ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.95)'; x.lineWidth = w * .012;
    for (var t = .04; t < 1; t += .045) { var q = bez(Pc, t), tg = bezTan(Pc, t), L = Math.hypot(tg[0], tg[1]) || 1, nx = -tg[1] / L, ny = tg[0] / L, off = (R() - .5) * .006; x.beginPath(); x.moveTo((q[0] + nx * .045) * sx, (q[1] + ny * .045) * sx); x.lineTo((q[0] + nx * (.062 + off)) * sx, (q[1] + ny * (.062 + off)) * sx); x.stroke(); }
  });
  for (var pi = 0; pi < 8; pi++) { x.beginPath(); x.arc(PORT[pi][0] * sx, PORT[pi][1] * sx, w * .03, 0, 7); x.fillStyle = gl ? 'rgba(255,230,140,.9)' : C.gold; x.fill(); }
}
function paintLeviTile(x, w, arrows) {
  var g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w * .72); g.addColorStop(0, '#1a4a58'); g.addColorStop(.6, '#0e2f3d'); g.addColorStop(1, '#061821'); x.fillStyle = g; x.fillRect(0, 0, w, w);
  var R = mul32(77); for (var i = 0; i < 30; i++) blob(x, R() * w, R() * w, w * (.1 + R() * .25), R() < .5 ? '40,140,150' : '5,20,30', .08);
  grain(x, w, w, 9, 5);
  x.strokeStyle = C.ink; x.lineWidth = w * .03; x.strokeRect(w * .02, w * .02, w * .96, w * .96); x.strokeStyle = 'rgba(227,178,75,.85)'; x.lineWidth = w * .008; x.strokeRect(w * .045, w * .045, w * .91, w * .91);
  x.strokeStyle = 'rgba(227,178,75,.55)'; x.lineWidth = w * .008; x.beginPath(); x.arc(w / 2, w / 2, w * .2, 0, 7); x.stroke(); x.beginPath(); x.arc(w / 2, w / 2, w * .24, 0, 7); x.setLineDash([w * .02, w * .02]); x.stroke(); x.setLineDash([]);
  (arrows || []).forEach(function (a) {
    var ang = (a.dir * 45 - 90) * Math.PI / 180, cx = w / 2 + Math.cos(ang) * w * .395, cy = w / 2 + Math.sin(ang) * w * .395;
    x.save(); x.translate(cx, cy); x.rotate(a.dir * Math.PI / 4);
    x.beginPath(); x.moveTo(0, -w * .09); x.lineTo(w * .065, -w * .01); x.lineTo(w * .025, -w * .01); x.lineTo(w * .025, w * .075); x.lineTo(-w * .025, w * .075); x.lineTo(-w * .025, -w * .01); x.lineTo(-w * .065, -w * .01); x.closePath();
    x.fillStyle = C.gold; x.fill(); x.strokeStyle = C.ink; x.lineWidth = w * .008; x.stroke(); x.restore();
    var nx = w / 2 + Math.cos(ang) * w * .29, ny = w / 2 + Math.sin(ang) * w * .29;
    x.beginPath(); x.arc(nx, ny, w * .052, 0, 7); x.fillStyle = C.ink; x.fill(); x.strokeStyle = C.gold; x.lineWidth = w * .008; x.stroke();
    x.fillStyle = '#fff2c4'; x.font = '700 ' + w * .07 + 'px ' + FD; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(a.n), nx, ny + w * .004);
  });
}
function paintSail(x, w, h, col, seed) {
  var R = mul32(seed); x.fillStyle = col; x.fillRect(0, 0, w, h);
  for (var i = 0; i < 240; i++) { x.strokeStyle = 'rgba(255,255,255,' + R() * .1 + ')'; x.lineWidth = .6 + R(); var xx = R() * w; x.beginPath(); x.moveTo(xx, 0); x.lineTo(xx + (R() - .5) * 8, h); x.stroke(); }
  for (var j = 0; j < 30; j++) blob(x, R() * w, R() * h, 30 + R() * 50, '60,30,10', .07);
  for (var b = 1; b < 6; b++) { var y = b * h / 6; x.fillStyle = 'rgba(60,30,10,.55)'; x.fillRect(0, y - 3, w, 6); x.fillStyle = 'rgba(255,240,210,.35)'; x.fillRect(0, y + 3, w, 2); }
  x.strokeStyle = 'rgba(40,20,5,.6)'; x.lineWidth = 6; x.strokeRect(2, 2, w - 4, h - 4);
  // inked wave emblem
  x.save(); x.translate(w / 2, h * .42); x.strokeStyle = 'rgba(30,18,8,.55)'; x.lineWidth = 7; x.lineCap = 'round';
  for (var k = 0; k < 3; k++) { x.beginPath(); x.arc(0, 18 + k * 0, 18 + k * 14, Math.PI * 1.08, Math.PI * 1.92); x.stroke(); }
  x.beginPath(); x.arc(0, -8, 8, 0, 7); x.fillStyle = 'rgba(30,18,8,.5)'; x.fill(); x.restore();
}
function paintScales(x, w, h, c1, c2) {
  var g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, c1); g.addColorStop(1, c2); x.fillStyle = g; x.fillRect(0, 0, w, h);
  var n = 8, sw = w / n, sh = h / n * .9;
  for (var r = -1; r < n + 1; r++) for (var c = -1; c < n + 1; c++) {
    var cx = c * sw + (r % 2) * sw / 2, cy = r * sh * .62 + sh * .3;
    var gg = x.createRadialGradient(cx, cy - sh * .1, 1, cx, cy, sh * .75); gg.addColorStop(0, 'rgba(255,255,255,.28)'); gg.addColorStop(.6, 'rgba(255,255,255,.04)'); gg.addColorStop(1, 'rgba(0,0,0,.4)');
    x.beginPath(); x.arc(cx, cy, sw * .56, 0, Math.PI); x.fillStyle = gg; x.fill(); x.strokeStyle = 'rgba(0,15,20,.45)'; x.lineWidth = 2; x.stroke();
  }
}
function paintDie(x, w, n, face, pip, pr) {
  var g = x.createLinearGradient(0, 0, w, w); g.addColorStop(0, face[0]); g.addColorStop(1, face[1]); x.fillStyle = g; x.fillRect(0, 0, w, w);
  grain(x, w, w, 12, n * 3);
  var P = { 1: [[.5, .5]], 2: [[.27, .27], [.73, .73]], 3: [[.27, .27], [.5, .5], [.73, .73]], 4: [[.27, .27], [.73, .27], [.27, .73], [.73, .73]], 5: [[.27, .27], [.73, .27], [.5, .5], [.27, .73], [.73, .73]], 6: [[.27, .25], [.73, .25], [.27, .5], [.73, .5], [.27, .75], [.73, .75]] }[n];
  P.forEach(function (p) { var gg = x.createRadialGradient(p[0] * w - 3, p[1] * w - 3, 1, p[0] * w, p[1] * w, w * pr); gg.addColorStop(0, pip[0]); gg.addColorStop(1, pip[1]); x.beginPath(); x.arc(p[0] * w, p[1] * w, w * pr, 0, 7); x.fillStyle = gg; x.fill(); });
}

/* ------------------------------------------------------------------ tween / events */
function tween(dur, fn, ease) { return new Promise(function (res) { K.tw.push({ t: 0, d: Math.max(1e-3, dur), fn: fn, e: ease || EASE.io, res: res }); K.dirty = true; }); }
function delay(s) { return tween(s, function () {}, EASE.lin); }
function updTw(dt) {
  var a = K.tw; if (!a.length) return;
  for (var i = 0; i < a.length;) {
    var w = a[i]; w.t += dt; var k = Math.min(1, w.t / w.d);
    try { w.fn(w.e(k), k); } catch (e) { if (global.console) console.warn('TWKit tween', e); k = 1; }
    if (k >= 1) { a.splice(i, 1); w.res(); } else i++;
  }
}
function emit(name, data) { var l = K.listeners[name]; if (l) l.forEach(function (f) { try { f(data || {}); } catch (e) {} }); var a = K.listeners['*']; if (a) a.forEach(function (f) { try { f(name, data || {}); } catch (e) {} }); }
/* TWKit.on(name|'*', fn): fx events for audio hooks: splash, place, spawn, sail, collide, sink, destroy, dice, cannon, rift, wave, whirl, roar */
TWKit.on = function (n, f) { (K.listeners[n] = K.listeners[n] || []).push(f); };
TWKit.off = function (n, f) { var l = K.listeners[n]; if (l) { var i = l.indexOf(f); if (i >= 0) l.splice(i, 1); } };
TWKit.setSpeed = function (s) { K.speed = clamp(+s || 1, .05, 1000); return K.speed; };
TWKit.setHooks = function (h) { for (var k in h) K.hooks[k] = h[k]; };       // onFrame(stats), onQuality(q)
TWKit.isAnimating = function () { return K.tw.length > 0 || (K.pt && K.pt.some && false) || !!K.shk; };

/* ------------------------------------------------------------------ 3D setup */
TWKit.init = function (canvas, opts) {
  opts = opts || {}; K.opts = opts; K.canvas = canvas; K.fallback = opts.fallback || null;
  if (opts.onHover) K.onHover = opts.onHover; if (opts.onClick) K.onClick = opts.onClick;
  injectFonts(opts);
  try { var v = localStorage.getItem('tw_gfx'); if (v && (GFX[v] || v === 'auto')) K.pref = v; } catch (e) {}
  if (opts.quality) K.pref = opts.quality;
  if (!hasGL() || opts.force2D) return go2D();
  try { setup3D(canvas, opts); } catch (e) { if (global.console) console.warn('TWKit 3D init failed, using 2D', e); try { K.on = false; } catch (e2) {} return go2D(); }
  return { ok: true, mode: '3d', quality: K.q };
};
function go2D() { K.mode = '2d'; K.on = false; if (K.canvas && K.canvas.style) K.canvas.style.display = 'none'; if (K.fallback) { K.fallback.style.display = 'block'; R2.build(); } K.loopOn = true; raf(loop); return { ok: false, mode: '2d' }; }
function injectFonts(opts) {
  if (opts.fonts === false || typeof document === 'undefined') return;
  try { if (!document.querySelector('link[data-tw-fonts]')) { var l = document.createElement('link'); l.rel = 'stylesheet'; l.setAttribute('data-tw-fonts', '1'); l.href = 'https://fonts.googleapis.com/css2?family=IM+Fell+English+SC&family=Cormorant+Garamond:wght@500;700&display=swap'; document.head.appendChild(l); } } catch (e) {}
  var done = false;
  TWKit.ready = new Promise(function (res) {
    var fin = function () { if (done) return; done = true; if (K.on) repaintAll(); res(); };
    try { Promise.all([document.fonts.load("32px 'IM Fell English SC'"), document.fonts.load("700 32px 'Cormorant Garamond'")]).then(function () { setTimeout(fin, 30); }, fin); } catch (e) { fin(); }
    setTimeout(fin, opts.fontTimeout || 2500);
  });
}
TWKit.ready = Promise.resolve();
function autoQ() { var small = false; try { small = Math.min(innerWidth, innerHeight) < 600 || (matchMedia('(pointer:coarse)').matches && Math.max(innerWidth, innerHeight) < 1300); } catch (e) {} return small ? 'medium' : 'high'; }

function setup3D(canvas, opts) {
  var q = K.pref === 'auto' ? autoQ() : K.pref; K.q = GFX[q] ? q : 'high';
  var r = new THREE.WebGLRenderer({ canvas: canvas, antialias: GFX[K.q].aa, alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.preserveDrawingBuffer });
  K.r = r; K.aniso = Math.min(8, r.capabilities.getMaxAnisotropy());
  r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0; r.shadowMap.type = THREE.PCFSoftShadowMap;
  var sc = K.scene = new THREE.Scene(); sc.background = new THREE.Color('#10191c'); sc.fog = new THREE.Fog(0x10191c, 22, 48);
  K.cam = new THREE.PerspectiveCamera(32, 1.6, .5, 120); K.cs = { look: new THREE.Vector3(), pos: new THREE.Vector3(0, 12, 9), tgt: null, tilt: 56, yaw: 0, zoom: 1 };
  K.ray = new THREE.Raycaster(); K.ndc = new THREE.Vector2();
  K.envTex = envMap(r); sc.environment = K.envTex;
  K.hemi = new THREE.HemisphereLight(0xcfeeea, 0x4a3524, .55); sc.add(K.hemi);
  K.key = new THREE.DirectionalLight(0xffe9c8, 1.8); K.key.position.set(-6, 14, 9); K.key.shadow.bias = -.0004; K.key.shadow.normalBias = .03;
  var sh = K.key.shadow.camera; sh.left = -6.5; sh.right = 6.5; sh.top = 6.5; sh.bottom = -6.5; sh.near = 4; sh.far = 34; sc.add(K.key, K.key.target);
  K.rim = new THREE.DirectionalLight(0x9fd8ff, .9); K.rim.position.set(8, 6, -12); sc.add(K.rim);
  K.gBoard = new THREE.Group(); K.gTiles = new THREE.Group(); K.gShips = new THREE.Group(); K.gFx = new THREE.Group(); K.gMisc = new THREE.Group(); sc.add(K.gBoard, K.gTiles, K.gMisc, K.gShips, K.gFx);
  buildTable(); buildBoard(); buildParticles(); buildFlow(); buildMarkers();
  K.on = true; K.mode = '3d'; applyQ(K.q, true);
  var w = canvas.clientWidth || canvas.width || 800, h = canvas.clientHeight || canvas.height || 600; if (opts.width) { w = opts.width; h = opts.height; }
  K.w = w; K.h = h; resizeInternal(w, h);
  // replay model state into the scene (init after API calls is allowed)
  K.loopOn = true; raf(loop);
  canvas.addEventListener('pointermove', function (e) { if (K.onHover) { var p = TWKit.hover(e.clientX, e.clientY); K.onHover(p, e); } });
  canvas.addEventListener('click', function (e) { if (K.onClick) K.onClick(TWKit.pick(e.clientX, e.clientY), e); });
  canvas.addEventListener('pointerleave', function () { TWKit.hover(null); if (K.onHover) K.onHover(null); });
  canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); K.lost = true; }, false);
  canvas.addEventListener('webglcontextrestored', function () { K.lost = false; }, false);
}
function applyQ(q, first) {
  K.q = q; var c = GFX[q], r = K.r; if (!r) return;
  r.setPixelRatio(Math.min(global.devicePixelRatio || 1, c.dpr));
  r.shadowMap.enabled = c.shadows; K.key.castShadow = c.shadows;
  if (c.shadows) { K.key.shadow.mapSize.set(c.map, c.map); if (K.key.shadow.map) { K.key.shadow.map.dispose(); K.key.shadow.map = null; } }
  if (K.flow) K.flow.mesh.visible = c.flow;
  K.hemi.intensity = q === 'low' ? 1.25 : .55; K.r.toneMappingExposure = q === 'low' ? 1.15 : 1.0;
  K.scene.environment = q === 'low' ? null : K.envTex; if (K.scene.fog) K.scene.fog.near = q === 'low' ? 1e5 : 22; if (K.scene.fog) K.scene.fog.far = q === 'low' ? 2e5 : 48;
  if (!first && K.boardTexQ !== c.board) { repaintAll(); }
  if (K.scene) K.scene.traverse(function (o) { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { m.needsUpdate = true; }); });
  if (K.w) resizeInternal(K.w, K.h);
  K.dirty = true;
}
TWKit.setQuality = function (q) { K.pref = (GFX[q] || q === 'auto') ? q : 'auto'; try { localStorage.setItem('tw_gfx', K.pref); } catch (e) {} if (K.on) { applyQ(K.pref === 'auto' ? autoQ() : K.pref); if (K.hooks.onQuality) K.hooks.onQuality(K.q); } return K.q; };
TWKit.getQuality = function () { return { pref: K.pref, active: K.q, mode: K.mode }; };
TWKit.getMode = function () { return K.mode; };
function repaintAll() {
  if (!K.on) return;
  Object.keys(texCache).forEach(function (k) { texCache[k].dispose(); delete texCache[k]; });
  if (K.boardMesh) { K.boardMesh.material.map = boardTex(); K.boardMesh.material.needsUpdate = true; }
  Object.keys(S.tiles).forEach(function (k) { var t = S.tiles[k]; if (t.mesh) { retexTile(t); } });
  Object.keys(S.levs).forEach(function (k) { var t = S.levs[k]; if (t.mesh) retexLev(t); });
  Object.keys(S.ships).forEach(function (k) { var s = S.ships[k]; if (s.g) { K.gShips.remove(s.g); s.g = null; buildShip3D(s); } });
  K.dirty = true;
}
function envMap(r) {
  var s = new THREE.Scene(), g = new THREE.SphereGeometry(20, 40, 20), pos = g.attributes.position, col = new Float32Array(pos.count * 3);
  var top = new THREE.Color('#bfe0ea'), hor = new THREE.Color('#ffe6bf'), bot = new THREE.Color('#2a5a60'), c = new THREE.Color();
  for (var i = 0; i < pos.count; i++) { var y = pos.getY(i) / 20; if (y > 0) c.copy(hor).lerp(top, Math.pow(y, .6)); else c.copy(hor).lerp(bot, Math.min(1, -y * 2.5)); c.toArray(col, i * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); s.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  var box = function (x, y, z, w, h, k) { var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k * .95, k * .85), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); };
  box(-8, 15, 8, 12, 8, 5); box(10, 9, -9, 8, 5, 2.2); box(0, 4, 18, 18, 3, 1.4);
  var pm = new THREE.PMREMGenerator(r); var rt = pm.fromScene(s, .03); pm.dispose(); return rt.texture;
}
function boardTex() { K.boardTexQ = GFX[K.q].board; return ctex('board', K.boardTexQ, K.boardTexQ, function (x, w) { paintBoard(x, w); }); }
function buildTable() {
  var t = ctex('table', 512, 512, function (x, w, h) { paintWood(x, w, h, '#5a3d28', '28,14,6', 21, false); }, { repeat: true }); t.repeat.set(7, 7);
  var m = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshStandardMaterial({ map: t, roughness: .62, metalness: 0 })); m.rotation.x = -Math.PI / 2; m.position.y = -.31; m.receiveShadow = true; K.gBoard.add(m); K.table = m;
}
function rrShape(w, h, r) { var s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
function buildBoard() {
  var wood = ctex('boardwood', 512, 512, function (x, w, h) { paintWood(x, w, h, '#6b2f20', '30,8,4', 5, false); });
  var g = new THREE.ExtrudeGeometry(rrShape(9.6, 9.6, .26), { depth: .26, bevelEnabled: true, bevelThickness: .045, bevelSize: .045, bevelSegments: 3, curveSegments: 6 }); g.rotateX(-Math.PI / 2); g.translate(0, -.36, 0);
  var pos = g.attributes.position, uv = g.attributes.uv; for (var i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / 4 + .5, pos.getZ(i) / 4 + .5);
  var slab = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: wood, roughness: .35, metalness: .05 })); slab.castShadow = slab.receiveShadow = true; K.gBoard.add(slab);
  var plane = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2, HALF * 2), new THREE.MeshStandardMaterial({ map: boardTex(), roughness: .85, metalness: 0, color: '#a9bcbc' })); plane.rotation.x = -Math.PI / 2; plane.position.y = .004; plane.receiveShadow = true; K.gBoard.add(plane); K.boardMesh = plane;
  // gilt inner rim
  var rim = new THREE.Mesh(new THREE.TorusGeometry(1, 1, 4, 4), new THREE.MeshBasicMaterial()); rim.visible = false;
  [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(function (d) {
    var long = new THREE.Mesh(new THREE.BoxGeometry(d[0] ? .09 : HALF * 2 + .09, .05, d[0] ? HALF * 2 + .09 : .09), new THREE.MeshStandardMaterial({ color: '#d7a63f', metalness: .85, roughness: .32 }));
    long.position.set(d[0] * (HALF + .04), .022, d[1] * (HALF + .04)); long.castShadow = true; K.gBoard.add(long);
  });
}

/* ------------------------------------------------------------------ camera */
function applyCam() {
  var c = K.cam, s = K.cs; if (s.tgt) { var k = Math.min(1, (now() - s.tgt.t0) / s.tgt.d), e = EASE.io(k); s.look.lerpVectors(s.tgt.l0, s.tgt.l1, e); s.pos.lerpVectors(s.tgt.p0, s.tgt.p1, e); if (k >= 1) s.tgt = null; }
  c.position.copy(s.pos); if (K.shk) { var kk = (now() - K.shk.t0) / K.shk.d; if (kk >= 1) K.shk = null; else { var a = K.shk.amp * Math.pow(1 - kk, 2); c.position.x += Math.sin(kk * 60) * a; c.position.y += Math.cos(kk * 47) * a * .6; } }
  c.lookAt(s.look);
}
function viewRegion() {
  var x0 = -HALF - .12, x1 = HALF + .12, z0 = -HALF - .08, z1 = HALF + .1;
  if (K.view && K.view.region) return K.view.region;
  return [x0, x1, z0, z1];
}
/* fit the region on the ground into the viewport (minus reserved UI margins), keep tilt/yaw */
function fitCam(immediate, focus) {
  if (!K.cam) return; var s = K.cs, c = K.cam, rg = viewRegion(), R = K.reserve;
  var asp = K.w / K.h; c.aspect = asp; c.updateProjectionMatrix();
  var cx = (rg[0] + rg[1]) / 2, cz = (rg[2] + rg[3]) / 2; var look = new THREE.Vector3(cx, 0, cz); var zm = s.zoom || 1;
  if (focus) { look.set(focus.x, 0, focus.z); zm = focus.zoom || 2.2; }
  var tilt = s.tilt * Math.PI / 180, yaw = s.yaw * Math.PI / 180;
  var dir = new THREE.Vector3(Math.sin(yaw) * Math.cos(tilt), Math.sin(tilt), Math.cos(yaw) * Math.cos(tilt));
  var pts = focus ? null : [[rg[0], 0, rg[2]], [rg[1], 0, rg[2]], [rg[0], 0, rg[3]], [rg[1], 0, rg[3]], [rg[0], .3, rg[2]], [rg[1], .3, rg[2]]];
  var tmp = new THREE.PerspectiveCamera(c.fov, asp, c.near, c.far), v = new THREE.Vector3();
  var lo = 3, hi = 80, inside = function (d) {
    tmp.position.copy(look).addScaledVector(dir, d); tmp.lookAt(look); tmp.updateMatrixWorld(); tmp.updateProjectionMatrix(); tmp.matrixWorldInverse.copy(tmp.matrixWorld).invert();
    for (var i = 0; i < pts.length; i++) { v.set(pts[i][0], pts[i][1], pts[i][2]).applyMatrix4(tmp.matrixWorldInverse).applyMatrix4(tmp.projectionMatrix); if (v.x < -1 + 2 * R.l || v.x > 1 - 2 * R.r || v.y < -1 + 2 * R.b || v.y > 1 - 2 * R.t) return false; }
    return true;
  };
  var d;
  if (focus) { var half = 6 / zm / 2; d = half / Math.tan(c.fov * Math.PI / 360) / Math.min(1, asp) * 1.0; }
  else { for (var i = 0; i < 22; i++) { var m = (lo + hi) / 2; if (inside(m)) hi = m; else lo = m; } d = hi / zm; }
  // shift look so the region is centred in the free (unreserved) viewport
  var pos = look.clone().addScaledVector(dir, d);
  if (!focus) { var ox = (R.l - R.r) * .5, oy = (R.b - R.t) * .5; if (ox || oy) { var right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), dir).normalize(), up = new THREE.Vector3().crossVectors(dir, right).normalize(); var wh = Math.tan(c.fov * Math.PI / 360) * d * 2; look.addScaledVector(right, -ox * wh * asp).addScaledVector(up, -oy * wh); pos = look.clone().addScaledVector(dir, d); } }
  if (immediate || !K.cs.init) { s.look.copy(look); s.pos.copy(pos); K.cs.init = true; s.tgt = null; }
  else s.tgt = { t0: now(), d: 650, l0: s.look.clone(), l1: look, p0: s.pos.clone(), p1: pos };
}
function resizeInternal(w, h) { K.w = w; K.h = h; if (!K.r) return; if (!K.cs.userTilt) K.cs.tilt = w / h < .8 ? 76 : 61; K.r.setSize(w, h, false); fitCam(true); if (K.pt) K.pt.n.material.uniforms.uScale.value = K.pt.a.material.uniforms.uScale.value = h * (global.devicePixelRatio ? Math.min(global.devicePixelRatio, GFX[K.q].dpr) : 1) / (2 * Math.tan(K.cam.fov * Math.PI / 360)) * 1.8; K.dirty = true; }
TWKit.resize = function (w, h) { K.w = w; K.h = h; if (K.on) resizeInternal(w, h); else if (K.mode === '2d') R2.resize(w, h); };
/* setView({tilt,yaw,zoom,reserve:{l,r,t,b}(fractions of the viewport hidden under UI),region:[x0,x1,z0,z1]|null}) */
TWKit.setView = function (v) {
  v = v || {}; if (v.tilt != null) { K.cs.tilt = clamp(v.tilt, 20, 90); K.cs.userTilt = true; } if (v.yaw != null) K.cs.yaw = v.yaw; if (v.zoom != null) K.cs.zoom = clamp(v.zoom, .5, 3);
  if (v.reserve) { K.reserve = { l: v.reserve.l || 0, r: v.reserve.r || 0, t: v.reserve.t || 0, b: v.reserve.b || 0 }; if (K.mode === '2d' && K.fallback) { var fs_ = K.fallback.style, R_ = K.reserve; fs_.boxSizing = 'border-box'; fs_.paddingLeft = R_.l * 100 + '%'; fs_.paddingRight = R_.r * 100 + '%'; fs_.paddingTop = R_.t * 100 + '%'; fs_.paddingBottom = R_.b * 100 + '%'; } }
  if ('region' in v) K.view = v.region ? { region: v.region } : null;
  if (K.on) fitCam(!!v.immediate);
};
TWKit.focus = function (c, r, zoom) { if (!K.on) return; var p = c == null ? null : { x: c - 2.5, z: r - 2.5, zoom: zoom || 2.2 }; fitCam(false, p); };
TWKit.shake = function (amp, ms) { K.shk = { t0: now(), d: ms || 450, amp: amp || .08 }; };

/* ------------------------------------------------------------------ particles (two pools: normal + additive) */
var PCAP = 900;
function makePool(additive) {
  var geo = new THREE.BufferGeometry(); var pos = new Float32Array(PCAP * 3), sz = new Float32Array(PCAP), col = new Float32Array(PCAP * 4);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aSize', new THREE.BufferAttribute(sz, 1)); geo.setAttribute('aCol', new THREE.BufferAttribute(col, 4));
  var mat = new THREE.ShaderMaterial({
    uniforms: { uScale: { value: 600 } }, transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    vertexShader: 'attribute float aSize;attribute vec4 aCol;varying vec4 vC;uniform float uScale;void main(){vC=aCol;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=max(0.,aSize*uScale/-mv.z);gl_Position=projectionMatrix*mv;}',
    fragmentShader: 'varying vec4 vC;void main(){vec2 p=gl_PointCoord-.5;float d=length(p);float a=smoothstep(.5,.12,d);gl_FragColor=vec4(vC.rgb,vC.a*a);}'
  });
  var pts = new THREE.Points(geo, mat); pts.frustumCulled = false; pts.renderOrder = 8; K.gFx.add(pts);
  var P = []; for (var i = 0; i < PCAP; i++) P.push({ on: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, t: 0, l: 1, s0: .1, s1: .1, r: 1, g: 1, b: 1, a: 1, gr: 0, dr: 0 });
  return { geo: geo, p: P, i: 0, material: mat, points: pts, pos: pos, sz: sz, col: col };
}
function buildParticles() { K.pt = { n: makePool(false), a: makePool(true) }; }
function pool(add) { return add ? K.pt.a : K.pt.n; }
function emitP(add, x, y, z, vx, vy, vz, life, s0, s1, rgb, a, gr, dr) {
  if (!K.pt) return; var P = pool(add), n = GFX[K.q].parts; if (n < 1 && Math.random() > n) return;
  var p = P.p[P.i]; P.i = (P.i + 1) % PCAP; p.on = true; p.x = x; p.y = y; p.z = z; p.vx = vx; p.vy = vy; p.vz = vz; p.t = 0; p.l = life; p.s0 = s0; p.s1 = s1; p.r = rgb[0]; p.g = rgb[1]; p.b = rgb[2]; p.a = a; p.gr = gr || 0; p.dr = dr || 0;
}
function updParticles(dt) {
  if (!K.pt) return;
  [K.pt.n, K.pt.a].forEach(function (P) {
    var any = false;
    for (var i = 0; i < PCAP; i++) {
      var p = P.p[i];
      if (!p.on) { P.sz[i] = 0; continue; }
      p.t += dt; if (p.t >= p.l) { p.on = false; P.sz[i] = 0; any = true; continue; }
      var k = p.t / p.l, dr = Math.max(0, 1 - p.dr * dt);
      p.vy -= p.gr * dt; p.vx *= dr; p.vz *= dr; p.vy *= (p.gr ? 1 : dr);
      p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      if (p.gr && p.y < .02) { p.y = .02; p.vy *= -.15; p.vx *= .5; p.vz *= .5; }
      P.pos[i * 3] = p.x; P.pos[i * 3 + 1] = p.y; P.pos[i * 3 + 2] = p.z; P.sz[i] = lerp(p.s0, p.s1, k);
      P.col[i * 4] = p.r; P.col[i * 4 + 1] = p.g; P.col[i * 4 + 2] = p.b; P.col[i * 4 + 3] = p.a * (k < .12 ? k / .12 : 1 - Math.pow((k - .12) / .88, 1.5)); any = true;
    }
    P.geo.attributes.position.needsUpdate = P.geo.attributes.aSize.needsUpdate = P.geo.attributes.aCol.needsUpdate = true;
  });
}
var WHITE = [.96, .98, .97], FOAM = [.82, .96, .93], WOOD = [.62, .38, .18], WOOD2 = [.36, .2, .1], SMOKE = [.36, .36, .38], FIRE = [1, .62, .18], GOLDC = [1, .78, .3], VIOL = [.72, .45, 1], CY = [.45, 1, .95];
var rippleP = [];
function ripple(x, z, r1, dur, rgb, w) {
  if (!K.on) return; var m = null; for (var i = 0; i < rippleP.length; i++) if (!rippleP[i].userData.on) { m = rippleP[i]; break; }
  if (!m) { if (rippleP.length > 28) return; m = new THREE.Mesh(new THREE.RingGeometry(.86, 1, 40), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.renderOrder = 6; K.gFx.add(m); rippleP.push(m); }
  m.userData.on = true; m.visible = true; m.position.set(x, .045, z); m.material.color.setRGB(rgb ? rgb[0] : .9, rgb ? rgb[1] : 1, rgb ? rgb[2] : 1); var th = w || .14;
  tween(dur, function (e, k) { var rr = Math.max(.01, r1 * e); m.scale.set(rr, rr, rr); m.material.opacity = (1 - k) * .75; }, EASE.out).then(function () { m.userData.on = false; m.visible = false; });
}
var FX = {
  splash: function (x, z, s) {
    s = s || 1; if (K.on) { ripple(x, z, .55 * s, .8, FOAM); ripple(x, z, .9 * s, 1.1, WHITE); }
    for (var i = 0; i < 26; i++) { var a = Math.random() * 6.283, v = (.5 + Math.random() * 1) * s; emitP(false, x, .06, z, Math.cos(a) * v * .7, 1.8 * s + Math.random() * 1.6, Math.sin(a) * v * .7, .8 + Math.random() * .4, .06 * s, .02, WHITE, .95, 7, 0); }
    for (var j = 0; j < 8; j++) emitP(false, x + (Math.random() - .5) * .3, .07, z + (Math.random() - .5) * .3, 0, .15, 0, 1.2, .12 * s, .26 * s, FOAM, .7, 0, 1);
    if (K.q === 'high') R2fx('splash', x, z, s);
    emit('splash', { x: x, z: z, s: s });
  },
  chips: function (x, z, n) { for (var i = 0; i < (n || 22); i++) { var a = Math.random() * 6.283, v = .6 + Math.random() * 1.4; emitP(false, x, .12 + Math.random() * .1, z, Math.cos(a) * v, 1.5 + Math.random() * 2, Math.sin(a) * v, 1 + Math.random() * .6, .045 + Math.random() * .03, .03, Math.random() < .5 ? WOOD : WOOD2, 1, 8, .2); } },
  smoke: function (x, y, z, n, s) { for (var i = 0; i < (n || 8); i++) emitP(false, x + (Math.random() - .5) * .08, y, z + (Math.random() - .5) * .08, (Math.random() - .5) * .25, .35 + Math.random() * .4, (Math.random() - .5) * .25, 1.4 + Math.random(), .08 * (s || 1), .4 * (s || 1), SMOKE, .6, 0, .8); },
  sparks: function (x, y, z, n, rgb) { for (var i = 0; i < (n || 20); i++) { var a = Math.random() * 6.283, b = Math.random() * 3.14, v = 1 + Math.random() * 2.2; emitP(true, x, y, z, Math.cos(a) * Math.sin(b) * v, Math.cos(b) * v + 1, Math.sin(a) * Math.sin(b) * v, .5 + Math.random() * .5, .07, .01, rgb || GOLDC, 1, 5, .5); } },
  bubbles: function (x, z, n) { for (var i = 0; i < (n || 8); i++) emitP(false, x + (Math.random() - .5) * .3, .05, z + (Math.random() - .5) * .3, 0, .4 + Math.random() * .5, 0, .8 + Math.random() * .6, .05, .09, CY, .6, 0, 0); },
  flash: function (x, y, z, s, rgb) { emitP(true, x, y, z, 0, 0, 0, .28, .5 * s, 1.3 * s, rgb || FIRE, .9, 0, 0); emitP(true, x, y, z, 0, 0, 0, .18, .3 * s, .7 * s, [1, 1, .9], 1, 0, 0); }
};
function R2fx(kind, x, z, s) { if (K.mode === '2d') R2.fx(kind, x, z, s); }
TWKit.fx = function (kind, x, z, s) { var f = FX[kind]; if (f) { if (K.on) f(x, z, s); else R2.fx(kind, x, z, s); } };

/* flowing foam dots along every placed current path (High/Medium) */
function buildFlow() {
  var cap = 36 * 4 * 3, g = new THREE.CircleGeometry(.5, 8), m = new THREE.MeshBasicMaterial({ color: '#cffff4', transparent: true, opacity: .9, blending: THREE.AdditiveBlending, depthWrite: false });
  var mesh = new THREE.InstancedMesh(g, m, cap); mesh.frustumCulled = false; mesh.count = 0; mesh.renderOrder = 4; K.gMisc.add(mesh); K.flow = { mesh: mesh, cap: cap, d: new THREE.Object3D() };
}
function updFlow(t) {
  var F = K.flow; if (!F || !F.mesh.visible) return; var n = 0, d = F.d;
  Object.keys(S.tiles).forEach(function (k) {
    var T = S.tiles[k]; if (!T.mesh || T.landing || n >= F.cap - 12) return; var y = T.mesh.position.y + .098;
    T.cps.forEach(function (P, pi) { for (var j = 0; j < 3; j++) { var ph = (t * .22 + j / 3 + pi * .17) % 1, q = bez(P, ph), sc = .045 * Math.sin(Math.PI * ph) + .004; d.position.set(wx(T.c, q[0]), y, wz(T.r, q[1])); d.rotation.set(-Math.PI / 2, 0, 0); d.scale.set(sc, sc, sc); d.updateMatrix(); F.mesh.setMatrixAt(n++, d.matrix); } });
  });
  F.mesh.count = n; F.mesh.instanceMatrix.needsUpdate = true;
}

/* ------------------------------------------------------------------ hover / legal / ghost markers */
function buildMarkers() {
  var tx = ctex('sqglow', 128, 128, function (x, w) { var g = x.createRadialGradient(w / 2, w / 2, w * .2, w / 2, w / 2, w * .5); g.addColorStop(0, 'rgba(255,226,140,.0)'); g.addColorStop(.75, 'rgba(255,214,110,.22)'); g.addColorStop(1, 'rgba(255,214,110,.0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); x.strokeStyle = 'rgba(255,230,150,.95)'; x.lineWidth = 5; x.strokeRect(10, 10, w - 20, w - 20); x.strokeStyle = 'rgba(255,255,255,.5)'; x.lineWidth = 2; x.strokeRect(16, 16, w - 32, w - 32); });
  K.sqTex = tx; K.mHover = new THREE.Mesh(new THREE.PlaneGeometry(.98, .98), new THREE.MeshBasicMaterial({ map: tx, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 })); K.mHover.rotation.x = -Math.PI / 2; K.mHover.renderOrder = 5; K.gMisc.add(K.mHover);
  K.legalMat = new THREE.MeshBasicMaterial({ map: tx, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: .6, color: '#9bffe8' }); K.legalMeshes = [];
}
TWKit.hover = function (x, y) {
  if (K.mode === '2d') return R2.hover(x, y);
  if (!K.on) return null; var p = x == null ? null : pickAt(x, y, true); S.hover = p && p.kind === 'square' ? { c: p.c, r: p.r } : null; K.dirty = true; return p;
};
/* squares the player may legally choose: [{c,r}] (pulsing teal frames); [] clears */
TWKit.setLegal = function (list) { S.legal = (list || []).map(function (s) { return { c: s.c, r: s.r }; }); if (K.mode === '2d') return R2.legal(); if (!K.on) return; K.legalMeshes.forEach(function (m) { m.visible = false; });
  S.legal.forEach(function (s, i) { var m = K.legalMeshes[i]; if (!m) { m = new THREE.Mesh(new THREE.PlaneGeometry(.98, .98), K.legalMat); m.rotation.x = -Math.PI / 2; m.renderOrder = 5; K.gMisc.add(m); K.legalMeshes.push(m); } m.visible = true; m.position.set(s.c - 2.5, .1, s.r - 2.5); }); };
function updMarkers(t) {
  if (K.mHover) { var h = S.hover, tg = h ? .95 : 0; K.mHover.material.opacity = lerp(K.mHover.material.opacity, tg, .25); if (h) K.mHover.position.set(h.c - 2.5, .115, h.r - 2.5); K.mHover.visible = K.mHover.material.opacity > .01; }
  if (K.legalMat) K.legalMat.opacity = .45 + .25 * Math.sin(t * 4);
}

/* ------------------------------------------------------------------ picking */
function ndc(x, y) { var rc = K.canvas.getBoundingClientRect(); K.ndc.set(((x - rc.left) / rc.width) * 2 - 1, -((y - rc.top) / rc.height) * 2 + 1); }
function groundHit() { K.ray.setFromCamera(K.ndc, K.cam); var o = K.ray.ray.origin, d = K.ray.ray.direction; if (Math.abs(d.y) < 1e-5) return null; var t = -o.y / d.y; if (t < 0) return null; return [o.x + d.x * t, o.z + d.z * t]; }
function pickAt(cx, cy, noShip) {
  ndc(cx, cy); applyCam(); K.cam.updateMatrixWorld(); var g = groundHit(); if (!g) return null; return pickWorld(g[0], g[1], noShip);
}
function pickWorld(x, z, noShip) {
  if (!noShip) { var best = null, bd = .3; Object.keys(S.ships).forEach(function (id) { var s = S.ships[id]; if (!s.alive) return; var d = Math.hypot(s.x - x, s.z - z - 0); if (d < bd) { bd = d; best = s; } }); if (best) return { kind: 'ship', id: best.id, c: best.c, r: best.r, port: best.port }; }
  // start marks (outer ports)
  for (var c = 0; c < 6; c++) for (var r = 0; r < 6; r++) {
    if (c && c < 5 && r && r < 5) continue;
    for (var p = 0; p < 8; p++) { var e = TWKit.portEdge(c, r, p); if (!e) continue; var pw = portWorld(c, r, p); if (Math.hypot(pw[0] - x, pw[1] - z) < .16) return { kind: 'start', c: c, r: r, port: p, edge: e.edge, index: e.index }; }
  }
  var cc = Math.floor(x + G), rr = Math.floor(z + G);
  if (cc >= 0 && cc < 6 && rr >= 0 && rr < 6) return { kind: 'square', c: cc, r: rr, tile: !!S.tiles[cc + ',' + rr], leviathan: !!S.levs[cc + ',' + rr] };
  return null;
}
/* pick(clientX, clientY) -> {kind:'ship'|'start'|'square', ...} | null */
TWKit.pick = function (x, y) { if (K.mode === '2d') return R2.pick(x, y); if (!K.on) return null; return pickAt(x, y, false); };
TWKit.pick2D = function (el) { return R2.pickEl(el); };

/* ------------------------------------------------------------------ current tiles (3D) */
var tgeo = null;
function tileGeo() {
  if (tgeo) return tgeo; var bt = .014, g = new THREE.ExtrudeGeometry(rrShape(.932, .932, .07), { depth: .056, bevelEnabled: true, bevelThickness: bt, bevelSize: bt, bevelSegments: 2, curveSegments: 5 });
  g.rotateX(-Math.PI / 2); g.translate(0, bt, 0); var pos = g.attributes.position, uv = g.attributes.uv; for (var i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) + .5, .5 - pos.getZ(i));
  tgeo = g; return g;
}
var TILE_TOP = .084;
function tsize() { return K.q === 'low' ? 256 : 512; }
function tileMat(map, emap) {
  var o = { map: map, roughness: .5, metalness: 0 }; if (emap) { o.emissiveMap = emap; o.emissive = new THREE.Color('#ffffff'); o.emissiveIntensity = .3; }
  return GFX[K.q].phys ? new THREE.MeshPhysicalMaterial(Object.assign(o, { clearcoat: .6, clearcoatRoughness: .35 })) : new THREE.MeshStandardMaterial(o);
}
function retexTile(T) {
  var s = tsize(), sg = sig(T.paths);
  var map = ctex('cur:' + sg + ':' + s, s, s, function (x, w) { paintCurrent(x, w, T.paths, 'map'); }), em = ctex('curg:' + sg + ':' + s, s, s, function (x, w) { paintCurrent(x, w, T.paths, 'glow'); });
  if (T.mesh.material) T.mesh.material.dispose(); T.mesh.material = tileMat(map, em);
}
function retexLev(L) { var s = tsize(); L.mesh.material.dispose(); L.mesh.material = tileMat(ctex('levt:' + JSON.stringify(L.arrows) + s, s, s, function (x, w) { paintLeviTile(x, w, L.arrows); })); L.mesh.material.emissive = new THREE.Color('#102a30'); }
function slabMesh() { var m = new THREE.Mesh(tileGeo(), new THREE.MeshStandardMaterial()); m.castShadow = m.receiveShadow = true; return m; }
/* placeTile(c,r,{paths,rot,animate=true}) -> Promise (resolves when landed). paths = 4 port pairs; rot applies 90deg cw turns. */
TWKit.placeTile = function (c, r, o) {
  o = o || {}; var paths = rotPaths(normPaths(o.paths), o.rot || 0), key = c + ',' + r;
  if (S.tiles[key]) TWKit.removeTile(c, r, { silent: true });
  var T = S.tiles[key] = { c: c, r: r, paths: paths, cps: paths.map(function (p) { return cp(p[0], p[1]); }), id: o.id };
  if (K.mode === '2d' || !K.on) { R2.tile(T); emit('place', { c: c, r: r }); return Promise.resolve(); }
  T.mesh = slabMesh(); retexTile(T); T.mesh.position.set(c - 2.5, 0, r - 2.5); K.gTiles.add(T.mesh);
  if (o.animate === false) { T.mesh.position.y = .004; return Promise.resolve(); }
  T.landing = true; T.mesh.position.y = 1.4; T.mesh.rotation.set(.35, .6, -.2);
  var cx = c - 2.5, cz = r - 2.5;
  return tween(.55, function (e) { T.mesh.position.y = .004 + (1 - e) * 1.4; T.mesh.rotation.set(.35 * (1 - e), .6 * (1 - e), -.2 * (1 - e)); }, EASE.in).then(function () {
    T.mesh.position.y = .004; T.mesh.rotation.set(0, 0, 0); T.landing = false; FX.splash(cx, cz, .65); emit('place', { c: c, r: r });
    return tween(.3, function (e) { T.mesh.position.y = .004 + Math.sin(e * Math.PI) * .05; }, EASE.lin);
  });
};
TWKit.removeTile = function (c, r) {
  var key = c + ',' + r, T = S.tiles[key]; if (!T) return Promise.resolve(); delete S.tiles[key];
  if (K.mode === '2d' || !K.on) { R2.untile(T); return Promise.resolve(); }
  K.gTiles.remove(T.mesh); T.mesh.material.dispose(); return Promise.resolve();
};
/* destroyTile(c,r): the tile (or leviathan tile) cracks, shakes, sinks and shatters into foam and splinters */
TWKit.destroyTile = function (c, r) {
  var key = c + ',' + r, T = S.tiles[key] || S.levs[key]; if (!T) return Promise.resolve(); var isLev = !S.tiles[key]; if (isLev) delete S.levs[key]; else delete S.tiles[key];
  var cx = c - 2.5, cz = r - 2.5; emit('destroy', { c: c, r: r });
  if (K.mode === '2d' || !K.on) { R2.destroy(T, isLev); return delay(.5); }
  var m = T.mesh, grp = T.group; TWKit.shake(.05, 500);
  if (T.cps) T.cps.forEach(function (P) { for (var i = 0; i < 8; i++) { var q = bez(P, i / 7); emitP(true, wx(c, q[0]), .12, wz(r, q[1]), (Math.random() - .5) * 2, 1.6 + Math.random() * 1.4, (Math.random() - .5) * 2, .8, .06, .01, CY, 1, 4, .5); } });
  return tween(.5, function (e, k) { m.position.x = cx + Math.sin(k * 70) * .018; m.position.z = cz + Math.cos(k * 60) * .014; if (m.material.emissive) m.material.emissive.setRGB(.5 * e, .25 * e, .08 * e); }, EASE.lin).then(function () {
    FX.chips(cx, cz, 30); FX.splash(cx, cz, 1.2); FX.sparks(cx, .15, cz, 16, WHITE); FX.flash(cx, .2, cz, 1, [.8, 1, 1]);
    return tween(.7, function (e) { m.position.set(cx, .004 - e * .7, cz); m.rotation.set(e * .9, e * 1.7, e * -.6); m.scale.setScalar(1 - e * .5); if (grp) grp.position.y = TILE_TOP - e * 1.2; }, EASE.in);
  }).then(function () { K.gTiles.remove(m); if (grp) K.gMisc.remove(grp); m.material.dispose(); });
};
TWKit.clearBoard = function () {
  Object.keys(S.tiles).slice().forEach(function (k) { var a = k.split(','); TWKit.removeTile(+a[0], +a[1]); });
  Object.keys(S.levs).slice().forEach(function (k) { var a = k.split(','); TWKit.removeLeviathan(+a[0], +a[1], { silent: true }); });
  Object.keys(S.ships).slice().forEach(function (id) { TWKit.removeShip(id); });
  TWKit.ghost(null); TWKit.setLegal([]); TWKit.clearDice(); TWKit.highlightLine(null);
  Object.keys(S.gates).slice().forEach(function (k) { var a = k.split(','); TWKit.riftGate(+a[0], +a[1], false); });
  Object.keys(S.mael).slice().forEach(function (k) { var a = k.split(','); TWKit.maelstrom(+a[0], +a[1], false); });
};

/* ------------------------------------------------------------------ leviathans: tube creatures */
function makeTube(N, Rr) {
  var np = (N + 1) * (Rr + 1), pos = new Float32Array(np * 3), uv = new Float32Array(np * 2), idx = [];
  for (var i = 0; i <= N; i++) for (var j = 0; j <= Rr; j++) { uv[(i * (Rr + 1) + j) * 2] = j / Rr * 3; uv[(i * (Rr + 1) + j) * 2 + 1] = i / N * 9; }
  for (var a = 0; a < N; a++) for (var b = 0; b < Rr; b++) { var p = a * (Rr + 1) + b, q = p + Rr + 1; idx.push(p, q, p + 1, q, q + 1, p + 1); }
  var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
  var P = [], T = []; for (var k = 0; k <= N; k++) { P.push(new THREE.Vector3()); T.push(new THREE.Vector3()); }
  var n = new THREE.Vector3(), bn = new THREE.Vector3(), ref = new THREE.Vector3();
  return {
    geo: g, P: P, T: T, update: function (fn, rad) {
      for (var i = 0; i <= N; i++) { var v = fn(i / N); P[i].set(v[0], v[1], v[2]); }
      for (var i2 = 0; i2 <= N; i2++) { var a2 = P[Math.max(0, i2 - 1)], b2 = P[Math.min(N, i2 + 1)]; T[i2].subVectors(b2, a2).normalize(); }
      ref.set(1, 0, 0); if (Math.abs(T[0].x) > .9) ref.set(0, 0, 1); n.crossVectors(T[0], ref).normalize();
      for (var i3 = 0; i3 <= N; i3++) {
        var t = T[i3]; n.addScaledVector(t, -n.dot(t)).normalize(); bn.crossVectors(t, n); var r = rad(i3 / N);
        for (var j = 0; j <= Rr; j++) { var an = j / Rr * Math.PI * 2, cs = Math.cos(an) * r, sn = Math.sin(an) * r, o = (i3 * (Rr + 1) + j) * 3; pos[o] = P[i3].x + n.x * cs + bn.x * sn; pos[o + 1] = P[i3].y + n.y * cs + bn.y * sn; pos[o + 2] = P[i3].z + n.z * cs + bn.z * sn; }
      }
      g.attributes.position.needsUpdate = true; g.computeVertexNormals(); g.computeBoundingSphere();
    }
  };
}
var LEV_PAL = { serpent: { a: '#1f9a8a', b: '#0b4a56', fin: '#e3b24b', eye: '#ffd76b' }, dragon: { a: '#c8402f', b: '#5a1410', fin: '#f0c14b', eye: '#fff0a0' } };
function buildLevCreature(L) {
  var pal = LEV_PAL[L.kind], N = GFX[K.q].parts >= 1 ? 42 : 28, Rr = K.q === 'low' ? 8 : 12; L.tube = makeTube(N, Rr);
  var sc = ctex('scales:' + L.kind, 256, 256, function (x, w, h) { paintScales(x, w, h, pal.a, pal.b); }, { repeat: true });
  var body = new THREE.Mesh(L.tube.geo, new THREE.MeshStandardMaterial({ map: sc, roughness: .38, metalness: .15, emissive: new THREE.Color(pal.b), emissiveIntensity: .25 })); body.frustumCulled = false;
  var g = new THREE.Group(); g.add(body); L.body = body;
  var head = new THREE.Group(), hm = new THREE.MeshStandardMaterial({ color: pal.a, roughness: .35, metalness: .2, map: sc }), em = new THREE.MeshBasicMaterial({ color: pal.eye });
  var sk = new THREE.Mesh(new THREE.SphereGeometry(.058, 16, 12), hm); sk.scale.set(1.55, .88, .9); head.add(sk);
  var sn = new THREE.Mesh(new THREE.SphereGeometry(.04, 12, 10), hm); sn.scale.set(1.5, .7, .8); sn.position.set(.07, -.008, 0); head.add(sn);
  var jaw = new THREE.Mesh(new THREE.SphereGeometry(.04, 12, 10), new THREE.MeshStandardMaterial({ color: pal.b, roughness: .5 })); jaw.scale.set(1.9, .5, .8); jaw.position.set(.045, -.04, 0); jaw.rotation.z = -.2; head.add(jaw); L.jaw = jaw;
  [-1, 1].forEach(function (sd) {
    var e = new THREE.Mesh(new THREE.SphereGeometry(.015, 8, 8), em); e.position.set(.035, .026, sd * .042); head.add(e);
    var h2 = new THREE.Mesh(new THREE.ConeGeometry(.014, L.kind === 'dragon' ? .1 : .06, 6), new THREE.MeshStandardMaterial({ color: '#f2e2b4', roughness: .4 })); h2.position.set(-.035, .06, sd * .03); h2.rotation.set(sd * .35, 0, .9); head.add(h2);
    if (L.kind === 'dragon') { var cu = new THREE.CatmullRomCurve3([new THREE.Vector3(.09, -.01, sd * .015), new THREE.Vector3(.14, -.05, sd * .09), new THREE.Vector3(.1, -.11, sd * .15), new THREE.Vector3(.17, -.14, sd * .2)]); head.add(new THREE.Mesh(new THREE.TubeGeometry(cu, 14, .004, 4), new THREE.MeshStandardMaterial({ color: pal.fin, roughness: .4, metalness: .4 }))); }
    else { var fn = new THREE.Mesh(new THREE.ConeGeometry(.03, .09, 4), new THREE.MeshStandardMaterial({ color: pal.fin, roughness: .45, metalness: .3 })); fn.position.set(-.05, 0, sd * .06); fn.rotation.set(sd * 1.2, 0, 1.2); head.add(fn); }
  });
  g.add(head); L.head = head; L.fins = [];
  var fm = new THREE.MeshStandardMaterial({ color: pal.fin, roughness: .4, metalness: .45, emissive: new THREE.Color(pal.fin), emissiveIntensity: .12 });
  for (var i = 0; i < 11; i++) { var f = new THREE.Mesh(new THREE.ConeGeometry(.026, .09, 4), fm); g.add(f); L.fins.push(f); }
  g.traverse(function (o) { if (o.isMesh) o.castShadow = true; });
  return g;
}
function levPoint(s, t, L) {
  var turns = 1.05, ang = L.a0 + s * turns * 6.283 + Math.sin(t * .6 + L.ph) * .3;
  var rad = .15 * (1 - .3 * s) + .018 * Math.sin(s * 12 - t * 2.4 + L.ph) + .09 * sstep(.78, 1, s) + .03 * L.roar;
  var H = (.6 + .16 * L.roar) * L.rise, y = -.34 + (.34 + H) * Math.pow(s, .88) - .08 * sstep(.88, 1, s) * L.rise;
  return [Math.cos(ang) * rad, y, Math.sin(ang) * rad];
}
var _vx = null, _vy = null;
function updLev(L, t) {
  if (!L.group || !L.group.visible) return; var tube = L.tube; if (!_vx) { _vx = new THREE.Vector3(1, 0, 0); _vy = new THREE.Vector3(0, 1, 0); }
  tube.update(function (s) { return levPoint(s, t, L); }, function (s) { return .078 * (1 - .42 * s) * (.5 + .5 * Math.min(1, s * 14 + .3)); });
  var P = tube.P, N = P.length - 1, hp = P[N], ht = tube.T[N]; L.head.position.copy(hp).addScaledVector(ht, .03);
  var dir = ht.clone(); dir.y -= .05 + .05 * L.roar; dir.normalize(); L.head.quaternion.setFromUnitVectors(_vx, dir); L.jaw.rotation.z = -.2 - .55 * L.roar - .06 * Math.sin(t * 2);
  L.fins.forEach(function (f, i) { var s = .1 + i / 10 * .78, idx = Math.round(s * N), p = P[idx]; var out = new THREE.Vector3(p.x, 0, p.z).normalize().multiplyScalar(.7).add(new THREE.Vector3(0, .75, 0)).normalize(); f.position.copy(p).addScaledVector(out, .042 * (1 - .4 * s)); f.quaternion.setFromUnitVectors(_vy, out); f.scale.setScalar(.45 + .4 * Math.sin(Math.PI * s)); f.visible = L.rise > .05; });
}
/* placeLeviathan(c,r,{arrows:[{dir:0..7,n:1..6}],kind:'serpent'|'dragon',rot,animate}) -> Promise (after it has risen).
 * dir 0 = north, 1 = north-east ... 7 = north-west; arrows are printed on the tile and the leviathan coils up out of the water. */
TWKit.placeLeviathan = function (c, r, o) {
  o = o || {}; var key = c + ',' + r; if (S.levs[key]) TWKit.removeLeviathan(c, r, { silent: true });
  var arrows = (o.arrows || []).map(function (a) { return { dir: ((a.dir + 2 * (o.rot || 0)) % 8 + 8) % 8, n: a.n }; });
  var L = S.levs[key] = { c: c, r: r, arrows: arrows, kind: o.kind || ((hashStr(key) & 1) ? 'dragon' : 'serpent'), rise: 0, roar: 0, a0: (hashStr(key) % 628) / 100, ph: (hashStr(key + 'p') % 628) / 100 };
  if (K.mode === '2d' || !K.on) { R2.lev(L); emit('place', { c: c, r: r, leviathan: true }); return Promise.resolve(); }
  L.mesh = slabMesh(); retexLev(L); L.mesh.position.set(c - 2.5, 0, r - 2.5); K.gTiles.add(L.mesh);
  L.group = buildLevCreature(L); L.group.position.set(c - 2.5, TILE_TOP - .002, r - 2.5); L.group.scale.setScalar(1.55); L.group.visible = false; K.gMisc.add(L.group); L.mesh.userData.lev = L; L.mesh.group = L.group;
  var cx = c - 2.5, cz = r - 2.5;
  if (o.animate === false) { L.rise = 1; L.group.visible = true; L.mesh.position.y = .004; return Promise.resolve(); }
  L.mesh.position.y = 1.4;
  return tween(.5, function (e) { L.mesh.position.y = .004 + (1 - e) * 1.4; }, EASE.in).then(function () {
    L.mesh.position.y = .004; FX.splash(cx, cz, .8); emit('place', { c: c, r: r, leviathan: true }); L.group.visible = true; emit('roar', { c: c, r: r }); TWKit.shake(.04, 400);
    return tween(1.5, function (e) { L.rise = e; if (Math.random() < .25) emitP(false, cx + (Math.random() - .5) * .4, TILE_TOP, cz + (Math.random() - .5) * .4, 0, .5, 0, .8, .05, .1, FOAM, .7, 0, 0); }, EASE.back);
  });
};
TWKit.removeLeviathan = function (c, r, o) {
  var key = c + ',' + r, L = S.levs[key]; if (!L) return Promise.resolve(); delete S.levs[key];
  if (K.mode === '2d' || !K.on) { R2.unlev(L); return Promise.resolve(); }
  if (o && o.silent) { K.gTiles.remove(L.mesh); K.gMisc.remove(L.group); return Promise.resolve(); }
  return tween(.9, function (e) { L.rise = 1 - e; }, EASE.io).then(function () { FX.splash(c - 2.5, r - 2.5, .6); K.gTiles.remove(L.mesh); K.gMisc.remove(L.group); });
};
/* leviathanRoar(c,r): rears up, jaw open, ripple (use when it eats a junk) */
TWKit.leviathanRoar = function (c, r) { var L = S.levs[c + ',' + r]; if (!L) return Promise.resolve(); emit('roar', { c: c, r: r }); if (!K.on) { R2.pulse(c, r); return delay(.6); } ripple(c - 2.5, r - 2.5, 1.2, 1, FOAM); TWKit.shake(.05, 500); return tween(1.1, function (e, k) { L.roar = Math.sin(k * Math.PI); }, EASE.lin).then(function () { L.roar = 0; }); };

/* ------------------------------------------------------------------ junks (ships) */
var hullG = null;
function hullGeo() {
  if (hullG) return hullG; var NT = 20, NS = 10, L0 = -.27, L1 = .32, pos = [], uv = [], idx = [], dp = [], di = [];
  var W = function (t) { return .105 * (.62 + .38 * Math.sin(Math.PI * Math.pow(t, .9))) * (1 - Math.pow(t, 3.2)); }, YT = function (t) { return .098 + .075 * Math.pow(t, 2.4) + .055 * Math.max(0, 1 - t / .22); }, YB = function (t) { return .012 + .045 * Math.pow(t, 2.2); };
  for (var i = 0; i <= NT; i++) {
    var t = i / NT, x = lerp(L0, L1, t), w = W(t), yt = YT(t), yb = YB(t);
    for (var j = 0; j <= NS; j++) { var an = j / NS * Math.PI, z = -w * Math.cos(an), y = yt - (yt - yb) * Math.pow(Math.sin(an), .75); pos.push(x, y, z); uv.push(t * 2.5, j / NS); }
    dp.push(x, yt - .008, -w * .96, x, yt - .008, w * .96);
  }
  for (var a = 0; a < NT; a++) for (var b = 0; b < NS; b++) { var p = a * (NS + 1) + b, q = p + NS + 1; idx.push(p, p + 1, q, q, p + 1, q + 1); }
  // stern cap
  var cs = pos.length / 3, ctr = (YT(0) + YB(0)) / 2; pos.push(L0, ctr, 0); uv.push(0, .5); for (var j2 = 0; j2 <= NS; j2++) { idx.push(cs, j2 + 1 < NS + 1 ? j2 + 1 : j2, j2); }
  var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  for (var k = 0; k < NT; k++) { var o = k * 2; di.push(o, o + 1, o + 2, o + 2, o + 1, o + 3); }
  var d = new THREE.BufferGeometry(); d.setAttribute('position', new THREE.Float32BufferAttribute(dp, 3)); d.setIndex(di); d.setAttribute('uv', new THREE.Float32BufferAttribute(dp.filter(function (_, i) { return i % 3 !== 1; }), 2)); d.computeVertexNormals();
  hullG = { hull: g, deck: d, W: W, YT: YT }; return hullG;
}
var sailG = null;
function sailGeo(w, h, bulge) { var g = new THREE.PlaneGeometry(w, h, 5, 7), p = g.attributes.position; for (var i = 0; i < p.count; i++) { var u = p.getX(i) / w + .5, v = p.getY(i) / h + .5; p.setZ(i, bulge * Math.sin(Math.PI * u) * (.35 + .65 * v) + .01 * Math.sin(v * 24)); /* batten ripple */ } g.computeVertexNormals(); return g; }
function buildShip3D(s) {
  var col = SHIP_COLORS[s.color % 8], H = hullGeo(), g = new THREE.Group(), q = GFX[K.q];
  var wood = ctex('shipwood', 256, 128, function (x, w, h) { paintWood(x, w, h, '#8a5a34', '40,20,8', 31, false); x.strokeStyle = 'rgba(30,14,5,.5)'; x.lineWidth = 2; for (var i = 1; i < 6; i++) { x.beginPath(); x.moveTo(0, i * h / 6); x.lineTo(w, i * h / 6); x.stroke(); } });
  wood.wrapS = wood.wrapT = THREE.RepeatWrapping;
  var hullM = new THREE.MeshStandardMaterial({ map: wood, roughness: .5, metalness: .05, side: THREE.DoubleSide, envMapIntensity: .6 });
  var hull = new THREE.Mesh(H.hull, hullM); g.add(hull);
  var deck = new THREE.Mesh(H.deck, new THREE.MeshStandardMaterial({ map: wood, color: '#e9c48f', roughness: .6, side: THREE.DoubleSide })); g.add(deck);
  var trimM = new THREE.MeshStandardMaterial({ color: col.trim, roughness: .4, metalness: .15 }), sailC = new THREE.Color(col.sail);
  // painted gunwale bands
  [-1, 1].forEach(function (sd) {
    var pts = []; for (var i = 0; i <= 14; i++) { var t = i / 14; pts.push(new THREE.Vector3(lerp(-.27, .32, t), H.YT(t) + .003, sd * H.W(t) * 1.0)); }
    var tb = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 28, .0105, 6), trimM); g.add(tb);
    var pts2 = pts.map(function (p) { return new THREE.Vector3(p.x, p.y - .035, p.z * .97); }); g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts2), 28, .007, 5), trimM));
  });
  // stern castle with tiled roof, bow prow
  var cas = new THREE.Mesh(new THREE.BoxGeometry(.11, .07, .13), new THREE.MeshStandardMaterial({ map: wood, color: '#d9a96d', roughness: .55 })); cas.position.set(-.2, .2, 0); g.add(cas);
  var roof = new THREE.Mesh(new THREE.CylinderGeometry(.075, .085, .13, 3), trimM); roof.rotation.set(Math.PI / 2, 0, Math.PI / 2); roof.position.set(-.2, .265, 0); roof.scale.set(1, 1, 1.15); g.add(roof);
  var prow = new THREE.Mesh(new THREE.ConeGeometry(.026, .09, 6), trimM); prow.position.set(.335, .16, 0); prow.rotation.z = -1.1; g.add(prow);
  var lant = new THREE.Mesh(new THREE.SphereGeometry(.014, 8, 8), new THREE.MeshBasicMaterial({ color: '#ffd27a' })); lant.position.set(-.27, .24, 0); g.add(lant);
  var lantG = new THREE.Mesh(new THREE.SphereGeometry(.045, 8, 8), new THREE.MeshBasicMaterial({ color: '#ffb84a', transparent: true, opacity: .25, blending: THREE.AdditiveBlending, depthWrite: false })); lantG.position.copy(lant.position); g.add(lantG);
  // masts + paper sails with battens
  var mastM = new THREE.MeshStandardMaterial({ color: '#5a3b22', roughness: .6 });
  var sailTex = ctex('sail:' + col.sail, 256, 384, function (x, w, h) { paintSail(x, w, h, col.sail, hashStr(col.sail)); });
  var sailM = new THREE.MeshStandardMaterial({ map: sailTex, side: THREE.DoubleSide, roughness: .85, emissive: sailC, emissiveMap: sailTex, emissiveIntensity: .22 });
  s.sails = [];
  [[-.03, .46, .23, .38, .06], [.15, .34, .15, .26, .05]].forEach(function (m, i) {
    var mast = new THREE.Mesh(new THREE.CylinderGeometry(.009, .012, m[1], 6), mastM); mast.position.set(m[0], .1 + m[1] / 2, 0); g.add(mast);
    var sail = new THREE.Mesh(sailGeo(m[2], m[3], m[4]), sailM); sail.position.set(m[0] - m[2] * .5 + .02, .1 + .035 + m[3] / 2 + (i ? .0 : .04), 0); sail.rotation.y = 0; var pv = new THREE.Group(); pv.position.set(m[0], 0, 0); sail.position.x = -m[2] / 2 + .012; pv.add(sail); sail.position.y = .14 + m[3] / 2 + (i ? 0 : .02); g.add(pv); s.sails.push(pv);
    var yard = new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, m[2] + .03, 5), mastM); yard.rotation.x = Math.PI / 2; yard.rotation.z = 0; yard.rotation.set(0, 0, Math.PI / 2); yard.position.set(-m[2] / 2 + .012, .14 + m[3] + (i ? 0 : .02) + .0, 0); pv.add(yard);
  });
  var flag = new THREE.Mesh(new THREE.PlaneGeometry(.1, .05, 4, 1), new THREE.MeshStandardMaterial({ color: col.sail, side: THREE.DoubleSide, roughness: .8, emissive: col.sail, emissiveIntensity: .3 })); flag.position.set(-.03 - .055, .1 + .46 - .02, 0); g.add(flag); s.flag = flag;
  g.traverse(function (o) { if (o.isMesh) { o.castShadow = q.shadows; } });
  s.g = g; s.cann = new THREE.Group(); g.add(s.cann); K.gShips.add(g); setCannons3D(s);
  // wake ribbon
  var N = 30, geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 2 * 3), 3)); geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N * 2 * 4), 4));
  var ix = []; for (var i2 = 0; i2 < N - 1; i2++) { var a = i2 * 2; ix.push(a, a + 1, a + 2, a + 2, a + 1, a + 3); } geo.setIndex(ix);
  if (!K.wakeMat) K.wakeMat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.NormalBlending });
  s.wake = new THREE.Mesh(geo, K.wakeMat); s.wake.frustumCulled = false; s.wake.renderOrder = 3; s.wake.visible = false; K.gShips.add(s.wake);
  s.ring = new THREE.Mesh(new THREE.RingGeometry(.2, .26, 28), new THREE.MeshBasicMaterial({ color: '#d8fff2', transparent: true, opacity: .3, depthWrite: false })); s.ring.rotation.x = -Math.PI / 2; s.ring.renderOrder = 3; K.gShips.add(s.ring);
}
function setCannons3D(s) {
  if (!s.cann) return; while (s.cann.children.length) s.cann.remove(s.cann.children[0]);
  var m = new THREE.MeshStandardMaterial({ color: '#b98a3a', metalness: .85, roughness: .3 }), n = Math.min(5, s.cannons | 0);
  for (var i = 0; i < n; i++) { var sd = i % 2 ? 1 : -1, x = -.12 + Math.floor(i / 2) * .1 + (n === 1 ? .1 : 0); var b = new THREE.Mesh(new THREE.CylinderGeometry(.012, .017, .08, 8), m); b.rotation.x = Math.PI / 2; b.position.set(x, .135, sd * .06); s.cann.add(b); var w = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .016, 8), new THREE.MeshStandardMaterial({ color: '#4a2d16' })); w.rotation.x = Math.PI / 2; w.position.set(x, .12, sd * .06); s.cann.add(w); }
}
function colorIdx(c) { if (typeof c === 'number') return ((c % 8) + 8) % 8; for (var i = 0; i < 8; i++) if (SHIP_COLORS[i].id === c || SHIP_COLORS[i].name === c) return i; return 0; }
/* addShip(id,{color:0..7|'jade',c,r,port,splash=true,cannons=0}) -> Promise (after the spawn splash). Position: square (c,r) + port 0..7 (edge starts are on outer ports). */
TWKit.addShip = function (id, o) {
  o = o || {}; if (S.ships[id]) TWKit.removeShip(id);
  var pw = portWorld(o.c, o.r, o.port), n = NORM[o.port];
  var s = S.ships[id] = { id: id, color: colorIdx(o.color), c: o.c, r: o.r, port: o.port, x: pw[0], z: pw[1], h: Math.atan2(n[1], n[0]), scale: 1, y: 0, roll: 0, pitch: 0, sink: 0, alive: true, cannons: o.cannons | 0, moving: false, trail: [], phase: Math.random() * 6, yaw: 0 };
  if (K.mode === '2d' || !K.on) { R2.ship(s); }
  else buildShip3D(s);
  if (o.splash === false) return Promise.resolve();
  s.scale = .01; s.y = .9;
  return tween(.7, function (e, k) { s.scale = Math.max(.01, e); s.y = (1 - EASE.in(Math.min(1, k * 1.15))) * .9; s.pitch = (1 - k) * .3; }, EASE.out).then(function () { s.scale = 1; s.y = 0; s.pitch = 0; FX.splash(s.x, s.z, .8); emit('spawn', { id: id, x: s.x, z: s.z }); return tween(.25, function (e, k) { s.y = Math.sin(k * Math.PI) * .03; }, EASE.lin); });
};
TWKit.removeShip = function (id) { var s = S.ships[id]; if (!s) return; delete S.ships[id]; s.alive = false; if (K.on) { K.gShips.remove(s.g); if (s.wake) { K.gShips.remove(s.wake); s.wake.geometry.dispose(); } if (s.ring) K.gShips.remove(s.ring); } else R2.unship(s); };
TWKit.setCannons = function (id, n) { var s = S.ships[id]; if (!s) return; s.cannons = n | 0; if (K.on) setCannons3D(s); else R2.ship(s, true); };
/* setShipAt(id,{c,r,port}): teleport without animation */
TWKit.setShipAt = function (id, p) { var s = S.ships[id]; if (!s) return; var pw = portWorld(p.c, p.r, p.port); s.c = p.c; s.r = p.r; s.port = p.port; s.x = pw[0]; s.z = pw[1]; s.trail = []; };
function routePts(steps) { var pts = []; steps.forEach(function (st, i) { var P = cp(st.from, st.to); for (var k = i ? 1 : 0; k <= 18; k++) { var q = bez(P, k / 18); pts.push([wx(st.c, q[0]), wz(st.r, q[1])]); } }); return pts; }
function angDiff(a, b) { var d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return d; }
/* moveShip(id, steps:[{c,r,from,to}], {dur,speed}) -> Promise<{c,r,port}>. Glides along every in-tile current in order (eased), leaving a foam wake. */
TWKit.moveShip = function (id, steps, o) {
  o = o || {}; var s = S.ships[id]; if (!s || !steps || !steps.length) return Promise.resolve(null);
  var pts = routePts(steps); if (Math.hypot(pts[0][0] - s.x, pts[0][1] - s.z) > .03) pts.unshift([s.x, s.z]);
  var cum = [0]; for (var i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); var len = cum[cum.length - 1] || .01, ix = 1;
  var dur = (o.dur || (.5 + .34 * len)) / (o.speed || 1); s.moving = true; emit('sail', { id: id, len: len });
  return tween(dur, function (e) {
    var d = e * len; while (ix < pts.length - 1 && cum[ix] < d) ix++; var a = pts[ix - 1], b = pts[ix], f = (d - cum[ix - 1]) / Math.max(1e-6, cum[ix] - cum[ix - 1]);
    s.x = lerp(a[0], b[0], f); s.z = lerp(a[1], b[1], f);
    var j = Math.min(pts.length - 1, ix + 2), tgt = Math.atan2(pts[j][1] - pts[Math.max(0, j - 3)][1], pts[j][0] - pts[Math.max(0, j - 3)][0]); s.h += angDiff(s.h, tgt) * Math.min(1, (K.dt || .016) * 9);
    s.pitch = .045 * Math.sin(Math.PI * Math.min(1, e));
  }, EASE.sine).then(function () { var l = steps[steps.length - 1]; s.moving = false; s.pitch = 0; s.c = l.c; s.r = l.r; s.port = l.to; return { c: l.c, r: l.r, port: l.to }; });
};
/* collide(idA,idB) -> Promise: both junks lunge, crack, shower splinters. Follow with sinkShip. */
TWKit.collide = function (a, b, o) {
  var A = S.ships[a], B = S.ships[b]; if (!A || !B) return Promise.resolve();
  var mx = (A.x + B.x) / 2, mz = (A.z + B.z) / 2, dx = B.x - A.x, dz = B.z - A.z, L = Math.hypot(dx, dz) || 1, ux = dx / L, uz = dz / L, ax = A.x, az = A.z, bx = B.x, bz = B.z, hit = false;
  A.h = Math.atan2(uz, ux); B.h = Math.atan2(-uz, -ux);
  return tween(.55, function (e, k) {
    var lun = k < .45 ? EASE.in(k / .45) : 1 - EASE.out((k - .45) / .55) * 1; var off = lun * Math.max(0, L / 2 - .18);
    A.x = ax + ux * off; A.z = az + uz * off; B.x = bx - ux * off; B.z = bz - uz * off;
    A.roll = B.roll = Math.sin(k * Math.PI) * .25; A.pitch = -Math.sin(k * Math.PI) * .12; B.pitch = A.pitch;
    if (k > .42 && !hit) { hit = true; FX.chips(mx, mz, 26); FX.flash(mx, .2, mz, 1.1, [1, .85, .5]); FX.sparks(mx, .2, mz, 12); if (K.on) { ripple(mx, mz, .8, .7, WHITE); TWKit.shake(.07, 420); } emit('collide', { a: a, b: b, x: mx, z: mz }); }
  }, EASE.lin).then(function () { A.roll = B.roll = A.pitch = B.pitch = 0; return { x: mx, z: mz }; });
};
/* sinkShip(id,{how:'crash'|'leviathan'|'maelstrom'|'wave'|'cannon', at:{c,r}, keep}) -> Promise. The junk lists, splinters and slips under; removed afterwards unless keep. */
TWKit.sinkShip = function (id, o) {
  o = o || {}; var s = S.ships[id]; if (!s) return Promise.resolve(); var how = o.how || 'crash', sx = s.x, sz = s.z, cx = sx, cz = sz, h0 = s.h, dir = (hashStr(id) & 1) ? 1 : -1;
  if (how === 'maelstrom' && o.at) { cx = o.at.c - 2.5; cz = o.at.r - 2.5; }
  s.moving = false; emit('sink', { id: id, how: how, x: sx, z: sz }); FX.splash(sx, sz, .9); var bub = 0;
  return tween(how === 'maelstrom' ? 1.9 : 1.6, function (e, k) {
    s.sink = e; s.roll = dir * e * .9; s.pitch = -e * .5; s.scale = 1 - e * .35;
    if (how === 'maelstrom') { var ang = Math.atan2(sz - cz, sx - cx) + e * 9, rad = Math.hypot(sx - cx, sz - cz) * (1 - e); s.x = cx + Math.cos(ang) * rad; s.z = cz + Math.sin(ang) * rad; s.h = h0 + e * 12; }
    if (how === 'leviathan') { s.y = Math.sin(Math.min(1, k * 3) * Math.PI) * .12; }
    if (Math.random() < .35) emitP(false, s.x, .06, s.z, (Math.random() - .5) * .3, .5, (Math.random() - .5) * .3, .9, .05, .1, CY, .6, 0, 0);
    if (how === 'cannon' && Math.random() < .3) FX.smoke(s.x, .2, s.z, 1, .8);
  }, EASE.io).then(function () { FX.splash(s.x, s.z, .6); FX.bubbles(s.x, s.z, 8); if (!o.keep) TWKit.removeShip(id); else { s.alive = false; if (s.g) s.g.visible = false; } });
};
/* reviveShip(id): bring a kept (sunk) junk back */
TWKit.reviveShip = function (id, o) { var s = S.ships[id]; if (!s) return; s.alive = true; s.sink = 0; s.roll = s.pitch = 0; s.scale = 1; if (s.g) s.g.visible = true; };

function updShips(dt, t) {
  Object.keys(S.ships).forEach(function (id) {
    var s = S.ships[id], g = s.g; if (!g) return;
    var wv = K.waveFx && K.waveFx.row != null ? waveLift(s) : 0;
    var bob = Math.sin(t * 1.7 + s.phase) * .011, rl = Math.sin(t * 1.3 + s.phase * 1.7) * .035;
    g.visible = s.alive || s.sink < 1; g.position.set(s.x, .1 + bob + s.y - s.sink * .42 + wv, s.z); g.rotation.order = 'YZX'; g.rotation.set(rl + s.roll, -s.h, s.pitch + Math.cos(t * 1.1 + s.phase) * .02 + wv * .5);
    g.scale.setScalar(Math.max(.01, s.scale) * 1.45);
    s.sails.forEach(function (p, i) { p.rotation.y = .16 + Math.sin(t * 1.4 + s.phase + i) * .07; });
    if (s.flag) { s.flag.rotation.y = Math.sin(t * 6 + s.phase) * .35; }
    s.ring.position.set(s.x, .091, s.z); var rp = .5 + .5 * Math.sin(t * 1.7 + s.phase); s.ring.scale.setScalar(1.05 + .1 * rp * (1 - s.sink)); s.ring.material.opacity = .22 * (1 - s.sink) * s.scale; s.ring.visible = s.alive;
    updTrail(s, dt);
  });
}
function updTrail(s, dt) {
  var tr = s.trail, N = 30; for (var i = tr.length - 1; i >= 0; i--) { tr[i].a += dt; if (tr[i].a > 1.7) tr.splice(i, 1); }
  if (s.moving) { var l = tr[tr.length - 1]; var sx = s.x - Math.cos(s.h) * .2, sz = s.z - Math.sin(s.h) * .2; if (!l || Math.hypot(l.x - sx, l.z - sz) > .045) { tr.push({ x: sx, z: sz, a: 0 }); if (tr.length > N) tr.shift(); if (Math.random() < .5) emitP(false, sx, .1, sz, (Math.random() - .5) * .15, .05, (Math.random() - .5) * .15, 1, .07, .13, FOAM, .55, 0, 1.5); } }
  var m = s.wake; if (tr.length < 2) { m.visible = false; return; } m.visible = true;
  var pos = m.geometry.attributes.position.array, col = m.geometry.attributes.color.array, n = tr.length;
  for (var j = 0; j < N; j++) {
    var p = tr[Math.min(j, n - 1)], pr = tr[Math.max(0, Math.min(j, n - 1) - 1)], nx = tr[Math.min(n - 1, Math.min(j, n - 1) + 1)], dx = nx.x - pr.x, dz = nx.z - pr.z, L = Math.hypot(dx, dz) || 1, px = -dz / L, pz = dx / L, age = p.a / 1.7, w = .025 + age * .11 + .02 * (1 - Math.min(1, j / n)) * 0, al = (j >= n ? 0 : (1 - age) * .75) * (j < 2 ? j / 2 : 1);
    pos[j * 6] = p.x + px * w; pos[j * 6 + 1] = .097; pos[j * 6 + 2] = p.z + pz * w; pos[j * 6 + 3] = p.x - px * w; pos[j * 6 + 4] = .097; pos[j * 6 + 5] = p.z - pz * w;
    for (var k = 0; k < 2; k++) { col[j * 8 + k * 4] = .9; col[j * 8 + k * 4 + 1] = 1; col[j * 8 + k * 4 + 2] = .96; col[j * 8 + k * 4 + 3] = al; }
  }
  m.geometry.attributes.position.needsUpdate = m.geometry.attributes.color.needsUpdate = true;
}

/* ------------------------------------------------------------------ dice */
var DIEV = [3, 4, 1, 6, 2, 5], dieG = null;
var DIEK = { gold: { f: ['#f3c957', '#c8912a'], p: ['#5c3a12', '#241004'] }, blue: { f: ['#4a82da', '#1e4aa0'], p: ['#fff8e2', '#d6cca4'] } };
function dieGeo() {
  if (dieG) return dieG; var h = .15, r = .045, inn = h - r, g = new THREE.BoxGeometry(.3, .3, .3, 5, 5, 5), p = g.attributes.position, nm = g.attributes.normal, v = new THREE.Vector3(), d = new THREE.Vector3();
  for (var i = 0; i < p.count; i++) { v.set(p.getX(i), p.getY(i), p.getZ(i)); var ix = clamp(v.x, -inn, inn), iy = clamp(v.y, -inn, inn), iz = clamp(v.z, -inn, inn); d.set(v.x - ix, v.y - iy, v.z - iz); var L = d.length(); if (L > 1e-6) { d.divideScalar(L); p.setXYZ(i, ix + d.x * r, iy + d.y * r, iz + d.z * r); nm.setXYZ(i, d.x, d.y, d.z); } }
  dieG = g; return g;
}
function dieMesh(kind) {
  var k = DIEK[kind] || DIEK.gold, mats = DIEV.map(function (v) { var t = ctex('die:' + kind + v, 128, 128, function (x, w) { paintDie(x, w, v, k.f, k.p, .095); }); var o = { map: t, roughness: .32, metalness: kind === 'gold' ? .35 : .05 }; return GFX[K.q].phys ? new THREE.MeshPhysicalMaterial(Object.assign(o, { clearcoat: .8, clearcoatRoughness: .2 })) : new THREE.MeshStandardMaterial(o); });
  var m = new THREE.Mesh(dieGeo(), mats); m.castShadow = true; m.scale.setScalar(1.7); return m;
}
function dieQuat(v, yaw) { var i = DIEV.indexOf(v), ns = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]][i], q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(ns[0], ns[1], ns[2]), new THREE.Vector3(0, 1, 0)); return new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw).multiply(q); }
function diceSide() { return (K.w / K.h) > 1.25 ? 'right' : 'bottom'; }
function setDiceRegion(on) { if (!K.on) return; var side = diceSide(); if (side === 'right') return; K.view = on ? { region: side === 'right' ? [-HALF - .35, HALF + 2.5, -HALF - .25, HALF + .25] : [-HALF - .35, HALF + .35, -HALF - .25, HALF + 1.5] } : null; fitCam(false); }
/* rollDice([{kind:'gold'|'blue',value:1..6}...],{at:{x,z}}) -> Promise<values>. Dice tumble in, bounce and settle showing the given faces. Gold = 1st die, blue = 2nd by convention. */
TWKit.rollDice = function (dice, o) {
  o = o || {}; TWKit.clearDice(true); dice = (dice || []).map(function (d) { return { kind: d.kind || 'gold', value: clamp(d.value | 0 || 1, 1, 6) }; });
  if (K.mode === '2d' || !K.on) { S.dice = dice.map(function (d) { return { kind: d.kind, value: d.value }; }); R2.dice(S.dice); emit('dice', { n: dice.length }); return delay(.55).then(function () { return dice.map(function (d) { return d.value; }); }); }
  setDiceRegion(true); var side = diceSide(), at = o.at || (side === 'right' ? { x: HALF + 1.5, z: -.6 } : { x: 0, z: HALF + .85 }), jobs = [];
  dice.forEach(function (d, i) {
    var m = dieMesh(d.kind); K.gMisc.add(m); S.dice.push({ mesh: m, kind: d.kind, value: d.value });
    var tx = at.x + (side === 'right' ? (i % 2 ? .3 : -.3) : (i - (dice.length - 1) / 2) * .85) + (Math.random() - .5) * .1, tz = at.z + (side === 'right' ? (i - (dice.length - 1) / 2) * .85 : (Math.random() - .5) * .15), yaw = Math.random() * 6.28, fin = dieQuat(d.value, yaw);
    var sx = side === 'right' ? tx + 4 : tx + (i % 2 ? 3.5 : -3.5), sz = side === 'right' ? tz : tz + 2.4, ax = new THREE.Vector3(Math.random() - .5, Math.random() - .5, Math.random() - .5).normalize(), qs = new THREE.Quaternion(), hit = 0;
    m.visible = false;
    jobs.push(delay(i * .13).then(function () {
      m.visible = true; return tween(1.25, function (e, k) {
        var gx = lerp(sx, tx, EASE.out(k)), gz = lerp(sz, tz, EASE.out(k)); var y = .26 + 1.7 * 4 * k * (1 - k) * Math.pow(1 - k, .5) + (k > .62 ? .2 * Math.abs(Math.sin((k - .62) / .38 * Math.PI * 1.5)) * (1 - k) * 2.6 : 0);
        m.position.set(gx, y, gz); var ang = Math.pow(1 - EASE.out(k), 1.4) * 17; qs.setFromAxisAngle(ax, ang); m.quaternion.copy(qs).multiply(fin);
        if ((k > .55 && hit === 0) || (k > .78 && hit === 1)) { hit++; emit('dice', { i: i, bounce: hit }); FX.sparks(m.position.x, .1, m.position.z, 4, GOLDC); }
      }, EASE.lin);
    }).then(function () { m.position.set(tx, .26, tz); m.quaternion.copy(fin); }));
  });
  return Promise.all(jobs).then(function () { return dice.map(function (d) { return d.value; }); });
};
TWKit.clearDice = function (keepRegion) { S.dice.forEach(function (d) { if (d.mesh && K.gMisc) { K.gMisc.remove(d.mesh); } }); var had = S.dice.length; S.dice = []; if (K.mode === '2d') R2.dice([]); else if (K.on && had && !keepRegion) setDiceRegion(false); };

/* ------------------------------------------------------------------ expansion: Rift Gate */
var SWIRL_V = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
function swirlMat(frag, c1, c2) { return new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, uniforms: { uT: { value: 0 }, uC1: { value: new THREE.Color(c1) }, uC2: { value: new THREE.Color(c2) }, uO: { value: 1 } }, vertexShader: SWIRL_V, fragmentShader: frag }); }
var FRAG_RIFT = 'varying vec2 vUv;uniform float uT,uO;uniform vec3 uC1,uC2;void main(){vec2 p=vUv-.5;float r=length(p)*2.;float a=atan(p.y,p.x);float sp=sin(a*3.+r*9.-uT*3.4)*.5+.5;float sp2=sin(a*5.-r*6.+uT*2.1)*.5+.5;float core=smoothstep(.55,0.,r);vec3 c=mix(uC1,uC2,sp*.7+sp2*.3);float edge=smoothstep(1.,.82,r);float al=edge*(.45+.55*sp)*(.55+core*.9);gl_FragColor=vec4(c*(.8+core*1.4),al*uO);}';
var FRAG_MAEL = 'varying vec2 vUv;uniform float uT,uO;uniform vec3 uC1,uC2;void main(){vec2 p=vUv-.5;float r=length(p)*2.;float a=atan(p.y,p.x);float s=sin(a*3.-log(r+.04)*7.+uT*3.2)*.5+.5;float arms=smoothstep(.45,.9,s);float edge=smoothstep(1.,.78,r);vec3 deep=vec3(.01,.06,.1);vec3 c=mix(deep,mix(uC1,uC2,s),arms*smoothstep(.04,.5,r));c=mix(c,vec3(.95,1.,.98),arms*.5*smoothstep(.3,.9,r));gl_FragColor=vec4(c,edge*(.55+.45*smoothstep(0.,.6,r))*uO);}';
/* riftGate(c,r,on=true,{color:'violet'|'cyan'|'gold'}) : portal swirl standing on the square; use the same colour for a linked pair */
TWKit.riftGate = function (c, r, on, o) {
  o = o || {}; on = on !== false; var key = c + ',' + r, G_ = S.gates[key];
  if (!on) { if (!G_) return Promise.resolve(); delete S.gates[key]; if (K.mode === '2d' || !K.on) { R2.gate(c, r, false); return Promise.resolve(); } return tween(.5, function (e) { G_.g.scale.setScalar(1 - e + .001); }, EASE.in).then(function () { K.gMisc.remove(G_.g); }); }
  var pal = { violet: ['#9b5cff', '#35e0ff'], cyan: ['#35e0ff', '#7dffb8'], gold: ['#ffcf5a', '#ff7a3a'] }[o.color || 'violet'] || ['#9b5cff', '#35e0ff'];
  G_ = S.gates[key] = { c: c, r: r, color: o.color || 'violet', pal: pal };
  if (K.mode === '2d' || !K.on) { R2.gate(c, r, true, G_); emit('rift', { c: c, r: r }); return Promise.resolve(); }
  var g = new THREE.Group(), gold = new THREE.MeshStandardMaterial({ color: '#d7a63f', metalness: .9, roughness: .28 });
  var ring = new THREE.Mesh(new THREE.TorusGeometry(.34, .04, 12, 40), gold); ring.castShadow = true;
  var ring2 = new THREE.Mesh(new THREE.TorusGeometry(.4, .012, 6, 40), new THREE.MeshBasicMaterial({ color: pal[1] })); var disc = new THREE.Mesh(new THREE.CircleGeometry(.33, 40), swirlMat(FRAG_RIFT, pal[0], pal[1]));
  var up = new THREE.Group(); up.add(ring, ring2, disc); up.position.y = .5; up.rotation.x = -.55; g.add(up);
  var runes = new THREE.Group(); for (var i = 0; i < 8; i++) { var rn = new THREE.Mesh(new THREE.BoxGeometry(.04, .01, .06), new THREE.MeshBasicMaterial({ color: pal[1] })); var a = i / 8 * 6.283; rn.position.set(Math.cos(a) * .4, Math.sin(a) * .4, 0); rn.rotation.z = a; runes.add(rn); } up.add(runes);
  var base = new THREE.Mesh(new THREE.CylinderGeometry(.3, .34, .06, 16), new THREE.MeshStandardMaterial({ color: '#2c3038', roughness: .85 })); base.position.y = .03; base.castShadow = true; g.add(base);
  var glow = new THREE.Mesh(new THREE.CircleGeometry(.5, 24), new THREE.MeshBasicMaterial({ color: pal[0], transparent: true, opacity: .16, blending: THREE.AdditiveBlending, depthWrite: false })); glow.rotation.x = -Math.PI / 2; glow.position.y = .065; g.add(glow);
  g.position.set(c - 2.5, TILE_TOP, r - 2.5); G_.g = g; G_.up = up; G_.disc = disc; G_.runes = runes; G_.glow = glow; K.gMisc.add(g); g.scale.setScalar(.001); emit('rift', { c: c, r: r });
  return tween(.7, function (e) { g.scale.setScalar(Math.max(.001, e)); }, EASE.back);
};
/* riftWarp(id,fromGate{c,r},toGate{c,r}) -> Promise: the junk is swallowed by one gate and emerges from the other */
TWKit.riftWarp = function (id, a, b, o) {
  var s = S.ships[id]; if (!s) return Promise.resolve(); var ax = a.c - 2.5, az = a.r - 2.5, bx = b.c - 2.5, bz = b.r - 2.5, x0 = s.x, z0 = s.z, h0 = s.h; emit('rift', { id: id, from: a, to: b, warp: true });
  return tween(.7, function (e) { s.x = lerp(x0, ax, e); s.z = lerp(z0, az, e); s.scale = 1 - e * .97; s.h = h0 + e * 8; s.y = e * .35; }, EASE.in).then(function () {
    FX.sparks(ax, .5, az, 24, VIOL); FX.flash(ax, .5, az, 1.2, VIOL); s.trail = []; K.on && ripple(ax, az, .9, .6, VIOL); s.x = bx; s.z = bz; FX.sparks(bx, .5, bz, 24, CY); FX.flash(bx, .5, bz, 1.2, CY); K.on && ripple(bx, bz, .9, .6, CY);
    var nb = o && o.heading != null ? o.heading : h0; return tween(.7, function (e) { s.scale = .03 + e * .97; s.h = nb + (1 - e) * -8; s.y = (1 - e) * .35; }, EASE.out);
  }).then(function () { s.scale = 1; s.y = 0; s.c = b.c; s.r = b.r; if (o && o.port != null) s.port = o.port; });
};

/* ------------------------------------------------------------------ expansion: Maelstrom */
/* maelstrom(c,r,on=true): a whirlpool sits on the square; pass sinkShip(id,{how:'maelstrom',at:{c,r}}) to drag a junk in */
TWKit.maelstrom = function (c, r, on) {
  on = on !== false; var key = c + ',' + r, M_ = S.mael[key];
  if (!on) { if (!M_) return Promise.resolve(); delete S.mael[key]; if (K.mode === '2d' || !K.on) { R2.mael(c, r, false); return Promise.resolve(); } return tween(.6, function (e) { M_.g.scale.setScalar(1 - e + .001); M_.mat.uniforms.uO.value = 1 - e; }, EASE.io).then(function () { K.gMisc.remove(M_.g); }); }
  M_ = S.mael[key] = { c: c, r: r }; if (K.mode === '2d' || !K.on) { R2.mael(c, r, true); emit('whirl', { c: c, r: r }); return Promise.resolve(); }
  var seg = 40, rings = 10, geo = new THREE.CircleGeometry(.47, seg, 0, Math.PI * 2); // funnel: rebuild as polar grid
  var pos = [], uv = [], idx = []; for (var i = 0; i <= rings; i++) for (var j = 0; j <= seg; j++) { var rr = i / rings, an = j / seg * Math.PI * 2, R_ = rr * .47; pos.push(Math.cos(an) * R_, -.1 * Math.pow(1 - rr, 1.6) * 1.0, Math.sin(an) * R_); uv.push(.5 + Math.cos(an) * rr * .5, .5 + Math.sin(an) * rr * .5); }
  for (var a = 0; a < rings; a++) for (var b = 0; b < seg; b++) { var p = a * (seg + 1) + b, q = p + seg + 1; idx.push(p, p + 1, q, q, p + 1, q + 1); }
  geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
  var mat = swirlMat(FRAG_MAEL, '#2fb0b0', '#c8fff0'); mat.blending = THREE.NormalBlending; var m = new THREE.Mesh(geo, mat); m.renderOrder = 4; var g = new THREE.Group(); g.add(m); g.position.set(c - 2.5, TILE_TOP + .02, r - 2.5); K.gMisc.add(g); M_.g = g; M_.mat = mat; g.scale.setScalar(.001); emit('whirl', { c: c, r: r });
  return tween(.8, function (e) { g.scale.setScalar(Math.max(.001, e)); }, EASE.out);
};

/* ------------------------------------------------------------------ expansion: Rogue Wave */
var waveG = null;
function waveGeo() {
  if (waveG) return waveG; var s = new THREE.Shape(); var P = [[-.5, 0], [-.35, .06], [-.2, .2], [-.05, .42], [.06, .56], [.16, .6], [.27, .56], [.34, .46], [.35, .36], [.3, .3], [.22, .33], [.2, .27], [.26, .18], [.34, .1], [.5, 0]];
  s.moveTo(P[0][0], P[0][1]); for (var i = 1; i < P.length; i++) s.lineTo(P[i][0], P[i][1]); s.lineTo(.5, -.02); s.lineTo(-.5, -.02);
  var g = new THREE.ExtrudeGeometry(s, { depth: .9, bevelEnabled: true, bevelSize: .03, bevelThickness: .03, bevelSegments: 2, curveSegments: 6 }); g.translate(0, 0, -.45);
  var p = g.attributes.position, col = new Float32Array(p.count * 3), c1 = new THREE.Color('#0f6f7e'), c2 = new THREE.Color('#3fb6b4'), c3 = new THREE.Color('#ffffff'), c = new THREE.Color();
  for (var k = 0; k < p.count; k++) { var y = p.getY(k) / .6, x = p.getX(k); c.copy(c1).lerp(c2, clamp(y * 1.1, 0, 1)); var lip = (x > .05 && y > .72) || (x > .3 && y > .28 && y < .62 && p.getZ(k) !== 0); if (lip) c.lerp(c3, .75 * sstep(.28, .75, y)); c.toArray(col, k * 3); p.setZ(k, p.getZ(k) + Math.sin(x * 9 + p.getY(k) * 6) * .018); }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals(); waveG = g; return g;
}
function waveMesh(len) { var m = new THREE.Mesh(waveGeo(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .25, metalness: .05, emissive: new THREE.Color('#136b78'), emissiveIntensity: .35 })); m.castShadow = true; m.scale.z = len / .9; m.material.emissiveIntensity = .15; return m; }
/* rogueWaveTile(c,r,on=true): the big wave tile sits on a square (breaking crest, foam spray) */
TWKit.rogueWaveTile = function (c, r, on) {
  on = on !== false; var key = c + ',' + r, W = S.waveTiles[key];
  if (!on) { if (!W) return Promise.resolve(); delete S.waveTiles[key]; if (K.on) { K.gTiles.remove(W.mesh); K.gMisc.remove(W.g); } else R2.waveTile(c, r, false); return Promise.resolve(); }
  S.waveTiles[key] = W = { c: c, r: r }; if (!K.on) { R2.waveTile(c, r, true); return Promise.resolve(); }
  W.mesh = slabMesh(); var s = tsize(); W.mesh.material = tileMat(ctex('wavetile' + s, s, s, function (x, w) { paintCurrent(x, w, [], 'map'); x.strokeStyle = 'rgba(240,255,250,.7)'; x.lineWidth = w * .02; for (var i = 0; i < 6; i++) { x.beginPath(); x.arc(w * .5, w * (.75 + i * .05), w * (.18 + i * .07), Math.PI * 1.1, Math.PI * 1.9); x.stroke(); } })); W.mesh.position.set(c - 2.5, .004, r - 2.5); K.gTiles.add(W.mesh);
  var g = new THREE.Group(); var m = waveMesh(.8); m.scale.set(.8, .8, 1); g.add(m); g.position.set(c - 2.5, TILE_TOP, r - 2.5); g.rotation.y = 0; K.gMisc.add(g); W.g = g; W.m = m; g.scale.setScalar(.001);
  return tween(.8, function (e) { g.scale.setScalar(Math.max(.001, e)); }, EASE.back);
};
/* rogueMarker(edge,index,on=true): gold+blue wave token placed beside the numbered edge square */
TWKit.rogueMarker = function (edge, index, on) {
  on = on !== false; var k = 'm' + edge + index, M0 = S.markers[k]; Object.keys(S.markers).forEach(function (kk) { var mm = S.markers[kk]; if (kk !== k || !on) { delete S.markers[kk]; if (K.on) K.gMisc.remove(mm.g); else R2.marker(mm.edge, mm.index, false); } });
  if (!on) return; S.markers[k] = M0 = { edge: edge, index: index }; if (!K.on) { R2.marker(edge, index, true); return; }
  var pos = { top: [index - 3.5, -G - .85], bottom: [index - 3.5, G + .85], left: [-G - .85, index - 3.5], right: [G + .85, index - 3.5] }[edge], rot = { top: Math.PI / 2, bottom: -Math.PI / 2, left: 0, right: Math.PI }[edge];
  var tx = ctex('rogueTok', 256, 256, function (x, w) { var g = x.createRadialGradient(w / 2, w / 2, 10, w / 2, w / 2, w / 2); g.addColorStop(0, '#2c6fd0'); g.addColorStop(1, '#173f8f'); x.fillStyle = g; x.fillRect(0, 0, w, w); x.strokeStyle = '#ffe9a8'; x.lineWidth = 9; x.lineCap = 'round'; for (var i = 0; i < 3; i++) { x.beginPath(); x.arc(w * .42, w * (.62 + i * .0), w * (.12 + i * .075), Math.PI * 1.05, Math.PI * 1.9); x.stroke(); } x.fillStyle = '#ffe9a8'; x.beginPath(); x.moveTo(w * .78, w * .5); x.lineTo(w * .62, w * .36); x.lineTo(w * .62, w * .64); x.closePath(); x.fill(); });
  var g = new THREE.Group(), body = new THREE.Mesh(new THREE.CylinderGeometry(.26, .27, .09, 28), [new THREE.MeshStandardMaterial({ color: '#e0b04a', metalness: .85, roughness: .3 }), new THREE.MeshStandardMaterial({ map: tx, roughness: .4 }), new THREE.MeshStandardMaterial({ color: '#e0b04a', metalness: .85, roughness: .3 })]); body.castShadow = true; body.rotation.y = rot; g.add(body);
  var glow = new THREE.Mesh(new THREE.CircleGeometry(.5, 24), new THREE.MeshBasicMaterial({ color: '#4aa0ff', transparent: true, opacity: .35, blending: THREE.AdditiveBlending, depthWrite: false })); glow.rotation.x = -Math.PI / 2; glow.position.y = -.03; g.add(glow);
  g.position.set(pos[0], .14, pos[1]); M0.g = g; M0.glow = glow; K.gMisc.add(g); g.scale.setScalar(.001); tween(.5, function (e) { g.scale.setScalar(Math.max(.001, e)); }, EASE.back);
};
/* highlightLine({row:0..5}|{col:0..5}|null, {color}) : glowing strip across a row/column */
TWKit.highlightLine = function (l, o) {
  if (S.line && S.line.m && K.on) { K.gMisc.remove(S.line.m); S.line.m.material.dispose(); } S.line = l ? { row: l.row, col: l.col } : null; if (K.mode === '2d') return R2.line();
  if (!K.on || !l) return; var horiz = l.row != null, m = new THREE.Mesh(new THREE.PlaneGeometry(horiz ? 6 : .98, horiz ? .98 : 6), new THREE.MeshBasicMaterial({ color: (o && o.color) || '#5ab8ff', transparent: true, opacity: .3, blending: THREE.AdditiveBlending, depthWrite: false, map: K.sqTex }));
  m.rotation.x = -Math.PI / 2; m.position.set(horiz ? 0 : l.col - 2.5, .12, horiz ? l.row - 2.5 : 0); m.renderOrder = 5; K.gMisc.add(m); S.line.m = m;
};
function waveLift(s) { var w = K.waveFx; if (!w) return 0; var perp = w.axis === 'x' ? s.z : s.x, along = w.axis === 'x' ? s.x : s.z; if (Math.abs(perp - w.lane) > .6) return 0; var d = Math.abs(along - w.pos); return Math.max(0, 1 - d / .9) * .16; }
/* rogueWaveSweep({edge:'left'|'right'|'top'|'bottom', index:1..6}) or ({row|col, dir:1|-1}) -> Promise: a huge wave crashes across the row/column */
TWKit.rogueWaveSweep = function (o) {
  o = o || {}; var axis, lane, dir;
  if (o.edge) { var i = o.index - 1; if (o.edge === 'left' || o.edge === 'right') { axis = 'x'; lane = i - 2.5; dir = o.edge === 'left' ? 1 : -1; } else { axis = 'z'; lane = i - 2.5; dir = o.edge === 'top' ? 1 : -1; } }
  else if (o.row != null) { axis = 'x'; lane = o.row - 2.5; dir = o.dir || 1; } else { axis = 'z'; lane = o.col - 2.5; dir = o.dir || 1; }
  emit('wave', { axis: axis, lane: lane, dir: dir }); if (!K.on) { R2.sweep(axis, lane, dir); return delay(1.6); }
  var g = new THREE.Group(), m = waveMesh(1.0); g.add(m); K.gFx.add(g); var start = -dir * (HALF + .8), end = dir * (HALF + .8); g.rotation.y = axis === 'x' ? (dir > 0 ? 0 : Math.PI) : (dir > 0 ? -Math.PI / 2 : Math.PI / 2);
  K.waveFx = { axis: axis, lane: lane, pos: start, row: 0 }; TWKit.shake(.06, 2400);
  return tween(2.4, function (e, k) {
    var p = lerp(start, end, e), sc = (.3 + .9 * sstep(0, .22, k)) * (1 - .6 * sstep(.86, 1, k)); g.position.set(axis === 'x' ? p : lane, .0, axis === 'x' ? lane : p); g.scale.set(sc * 1.15, sc * 1.4, 1);
    K.waveFx.pos = p; if (Math.random() < .9) { for (var j = 0; j < 3; j++) { var oz = (Math.random() - .5) * .9, cx = axis === 'x' ? p + dir * .3 : lane + oz, cz = axis === 'x' ? lane + oz : p + dir * .3; emitP(false, cx, .35 + Math.random() * .4, cz, (axis === 'x' ? dir : 0) * (1 + Math.random()), 1 + Math.random(), (axis === 'x' ? 0 : dir) * (1 + Math.random()), .8, .1, .04, WHITE, .9, 5, 0); } }
  }, EASE.sine).then(function () { K.gFx.remove(g); K.waveFx = null; });
};

/* ------------------------------------------------------------------ expansion: Deck Cannon */
function cellPos(p) { if (typeof p === 'string') { var s = S.ships[p]; return s ? [s.x, s.z, s] : [0, 0]; } return [p.c - 2.5, p.r - 2.5]; }
/* cannonShot({from:shipId|{c,r}, to:shipId|{c,r}, hit:true}) -> Promise: muzzle flash, smoke, arcing ball, splash or splinters at the target */
TWKit.cannonShot = function (o) {
  var A = cellPos(o.from), B = cellPos(o.to), dist = Math.hypot(B[0] - A[0], B[1] - A[1]), dur = .6 + dist * .13, hit = o.hit !== false; emit('cannon', { from: o.from, to: o.to, hit: hit });
  var ang = Math.atan2(B[1] - A[1], B[0] - A[0]); if (A[2]) A[2].h = ang;
  var ball = null; if (K.on) { ball = new THREE.Mesh(new THREE.SphereGeometry(.075, 10, 8), new THREE.MeshStandardMaterial({ color: '#23262b', metalness: .7, roughness: .35 })); ball.castShadow = true; K.gFx.add(ball); }
  var mx = A[0] + Math.cos(ang) * .3, mz = A[1] + Math.sin(ang) * .3; FX.flash(mx, .25, mz, 1, FIRE); FX.smoke(mx, .25, mz, 12, 1.1); FX.sparks(mx, .25, mz, 10, [1, .7, .25]); if (K.on) TWKit.shake(.03, 250); if (A[2]) { A[2].pitch = -.1; tween(.3, function (e) { A[2].pitch = -.1 * (1 - e); }, EASE.out); }
  return tween(dur, function (e, k) { var x = lerp(A[0], B[0], e), z = lerp(A[1], B[1], e), y = .3 + Math.sin(k * Math.PI) * (.5 + dist * .22); if (ball) ball.position.set(x, y, z); if (Math.random() < .8) emitP(false, x, y, z, 0, .1, 0, .6, .05, .16, SMOKE, .45, 0, 1); }, EASE.lin).then(function () {
    if (ball) K.gFx.remove(ball); if (hit) { FX.chips(B[0], B[1], 20); FX.flash(B[0], .25, B[1], 1.3, FIRE); FX.sparks(B[0], .2, B[1], 18, [1, .7, .25]); FX.smoke(B[0], .2, B[1], 10, 1.3); if (K.on) { ripple(B[0], B[1], .7, .6, WHITE); TWKit.shake(.07, 420); } } else FX.splash(B[0], B[1], 1);
  });
};

/* ------------------------------------------------------------------ ghost preview + traced path */
function ribbon(pts, w, y, mat) {
  var n = pts.length, pos = new Float32Array(n * 2 * 3), idx = [];
  for (var i = 0; i < n; i++) { var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1, px = -dz / L * w, pz = dx / L * w; pos.set([pts[i][0] + px, y, pts[i][1] + pz, pts[i][0] - px, y, pts[i][1] - pz], i * 6); if (i < n - 1) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 2, i * 2 + 1, i * 2 + 3); }
  var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setIndex(idx); var m = new THREE.Mesh(g, mat); m.renderOrder = 7; return m;
}
/* ghost(c,r,paths,{rot,valid=true,enter:port,trace:[{c,r,from,to}...]}) : translucent preview of a tile placement with the resulting path traced in gold.
 * enter = the port the active junk would enter this square from; or pass `trace` (steps through several tiles, e.g. from TWKit.trace). ghost(null) clears. */
TWKit.ghost = function (c, r, paths, o) {
  if (S.ghost && S.ghost.g && K.on) { K.gMisc.remove(S.ghost.g); S.ghost.g.traverse(function (x) { if (x.material && x.material.dispose && x.material !== K.ghostRibMat) x.material.dispose(); if (x.isMesh && x.geometry && x.geometry !== tgeo) x.geometry.dispose(); }); }
  S.ghost = null; if (c == null) { if (K.mode === '2d') R2.ghost(); return; } o = o || {}; paths = rotPaths(normPaths(paths), o.rot || 0);
  var valid = o.valid !== false, trace = o.trace || (o.enter != null ? TWKit.trace((function () { var t = {}; t[c + ',' + r] = paths; return t; })(), c, r, o.enter, 1) : []);
  var G0 = S.ghost = { c: c, r: r, paths: paths, valid: valid, trace: trace };
  if (K.mode === '2d' || !K.on) { R2.ghost(); return; }
  var g = new THREE.Group(), s = tsize(), sg = sig(paths), m = slabMesh();
  m.material = new THREE.MeshStandardMaterial({ map: ctex('cur:' + sg + ':' + s, s, s, function (x, w) { paintCurrent(x, w, paths, 'map'); }), emissiveMap: ctex('curg:' + sg + ':' + s, s, s, function (x, w) { paintCurrent(x, w, paths, 'glow'); }), emissive: new THREE.Color(valid ? '#ffffff' : '#ff5a4a'), emissiveIntensity: .7, transparent: true, opacity: .8, roughness: .5, color: valid ? '#ffffff' : '#ff9a8a' }); m.castShadow = false; g.add(m); G0.mesh = m;
  g.position.set(c - 2.5, .16, r - 2.5);
  if (trace.length) { var pts = routePts(trace); K.ghostRibMat = K.ghostRibMat || new THREE.MeshBasicMaterial({ color: '#ffd978', transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }); var rib = ribbon(pts, .03, .2, K.ghostRibMat); rib.position.y = 0; K.gMisc.add(rib); G0.rib = rib; G0.pts = pts; }
  K.gMisc.add(g); G0.g = g; var oldRem = G0.g; G0.g = new THREE.Group(); G0.g.add(g); if (G0.rib) { K.gMisc.remove(G0.rib); G0.g.add(G0.rib); } K.gMisc.remove(g); K.gMisc.add(G0.g);
};
function updGhost(t, dt) {
  var G0 = S.ghost; if (!G0 || !G0.g || !K.on) return; G0.mesh.parent.position.y = .17 + Math.sin(t * 3) * .015;
  if (G0.pts && G0.pts.length > 1) { var u = (t * .6) % 1, f = u * (G0.pts.length - 1), i = Math.floor(f), a = G0.pts[i], b = G0.pts[Math.min(G0.pts.length - 1, i + 1)], k = f - i; emitP(true, lerp(a[0], b[0], k), .24, lerp(a[1], b[1], k), 0, .05, 0, .5, .09, .02, GOLDC, 1, 0, 0); }
}

/* ------------------------------------------------------------------ per-frame scene update */
function update3D(dt, t) {
  updShips(dt, t); updParticles(dt); updMarkers(t); updGhost(t, dt);
  Object.keys(S.levs).forEach(function (k) { updLev(S.levs[k], t); });
  if (K.q !== 'low') Object.keys(S.tiles).forEach(function (k) { var T = S.tiles[k]; if (T.mesh && T.mesh.material.emissiveIntensity != null) T.mesh.material.emissiveIntensity = .3 + .1 * Math.sin(t * 1.7 + T.c * .9 + T.r * 1.3); });
  updFlow(t);
  Object.keys(S.gates).forEach(function (k) { var G_ = S.gates[k]; if (!G_.disc) return; G_.disc.material.uniforms.uT.value = t; G_.runes.rotation.z = t * .6; G_.up.position.y = .5 + Math.sin(t * 1.5) * .02; G_.glow.material.opacity = .14 + .06 * Math.sin(t * 3); if (Math.random() < .25) { var a = Math.random() * 6.283; emitP(true, G_.g.position.x + Math.cos(a) * .35, G_.g.position.y + .5 + Math.sin(a) * .3, G_.g.position.z + .1, 0, .3, 0, 1, .05, .01, G_.pal && G_.color === 'gold' ? GOLDC : VIOL, 1, 0, 0); } });
  Object.keys(S.mael).forEach(function (k) { var M_ = S.mael[k]; if (M_.mat) M_.mat.uniforms.uT.value = t; });
  Object.keys(S.markers).forEach(function (k) { var m = S.markers[k]; if (m.g) { m.g.position.y = .14 + Math.sin(t * 2) * .02; m.glow.material.opacity = .3 + .12 * Math.sin(t * 3); } });
  Object.keys(S.waveTiles).forEach(function (k) { var W = S.waveTiles[k]; if (W.g) { W.m.rotation.z = Math.sin(t * 1.4) * .04; W.m.position.y = Math.sin(t * 1.8) * .02; if (Math.random() < .25) emitP(false, W.g.position.x + .3 + Math.random() * .1, .45, W.g.position.z + (Math.random() - .5) * .6, .4, .8, 0, .7, .06, .02, WHITE, .8, 3, 0); } });
  if (S.line && S.line.m) S.line.m.material.opacity = .22 + .12 * Math.sin(t * 4);
}

/* ------------------------------------------------------------------ main loop, stats */
function loop(t) {
  if (!K.loopOn) return; raf(loop);
  var fr = K.frame, rdt = fr.last ? Math.min(5, (t - fr.last) / 1000) : .016, interval = fr.last ? t - fr.last : 16; fr.last = t;
  var dt = Math.min(.1, rdt) * K.speed; K.dt = dt; K.clock = (K.clock || 0) + dt;
  updTw(dt);
  if (K.on) {
    if (K.lost) return; update3D(dt, K.clock); applyCam(); var t0 = now(); K.r.info.autoReset = false; K.r.info.reset(); K.r.render(K.scene, K.cam); var rt = now() - t0;
    fr.hist.push(interval); if (fr.hist.length > 120) fr.hist.shift(); fr.rh.push(rt); if (fr.rh.length > 120) fr.rh.shift(); fr.n++;
    if (K.pref === 'auto' && fr.hist.length >= 60) { var bad = fr.bad || 0; if (interval > 55) bad += interval; else bad = Math.max(0, bad - interval * .5); fr.bad = bad; if (bad > 3000) { fr.bad = 0; var nq = K.q === 'high' ? 'medium' : K.q === 'medium' ? 'low' : null; if (nq) { applyQ(nq); if (K.hooks.onQuality) K.hooks.onQuality(nq); } } }
  } else { R2.update(dt, K.clock); fr.hist.push(interval); if (fr.hist.length > 120) fr.hist.shift(); fr.n++; }
  if (K.hooks.onFrame && fr.n % 30 === 0) { try { K.hooks.onFrame(TWKit.stats()); } catch (e) {} }
}
TWKit.stats = function () {
  var f = K.frame, avg = function (a) { if (!a || !a.length) return 0; var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s / a.length; }, r = K.r ? K.r.info.render : {};
  return { mode: K.mode, quality: K.q, frameMs: +avg(f.hist).toFixed(2), renderMs: +avg(f.rh).toFixed(2), fps: f.hist.length ? +(1000 / avg(f.hist)).toFixed(1) : 0, draws: r.calls || 0, triangles: r.triangles || 0, frames: f.n };
};
TWKit.resetStats = function () { K.frame.hist = []; K.frame.rh = []; K.frame.n = 0; K.frame.bad = 0; };
TWKit.renderOnce = function () { if (K.on) { update3D(0, K.clock || 0); applyCam(); K.r.render(K.scene, K.cam); } };
/* advance(sec): step the simulation deterministically without waiting for frames (tests / screenshots) */
TWKit.advance = function (sec) { var n = Math.ceil(sec * 30); for (var i = 0; i < n; i++) { K.dt = 1 / 30; K.clock = (K.clock || 0) + 1 / 30; updTw(1 / 30); if (K.on) update3D(1 / 30, K.clock); else R2.update(1 / 30, K.clock); } if (K.on) { applyCam(); K.r.render(K.scene, K.cam); } };
TWKit.isAnimating = function () { return K.tw.length > 0 || Object.keys(S.ships).some(function (k) { return S.ships[k].moving; }); };
TWKit.getState = function () { return { tiles: Object.keys(S.tiles).map(function (k) { var t = S.tiles[k]; return { c: t.c, r: t.r, paths: t.paths }; }), leviathans: Object.keys(S.levs).map(function (k) { var t = S.levs[k]; return { c: t.c, r: t.r, arrows: t.arrows, kind: t.kind }; }), ships: Object.keys(S.ships).map(function (k) { var s = S.ships[k]; return { id: s.id, color: s.color, c: s.c, r: s.r, port: s.port, alive: s.alive }; }), gates: Object.keys(S.gates), maelstroms: Object.keys(S.mael), mode: K.mode }; };
TWKit.dispose = function () {
  K.loopOn = false; if (K.on) { K.scene.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { if (m.map) m.map.dispose(); m.dispose(); }); }); K.r.dispose(); } else if (K.fallback) K.fallback.innerHTML = '';
  K.on = false; Object.keys(texCache).forEach(function (k) { texCache[k].dispose(); delete texCache[k]; }); S.tiles = {}; S.levs = {}; S.ships = {}; S.gates = {}; S.mael = {}; S.dice = []; S.markers = {}; S.waveTiles = {}; K.tw = []; K.pt = null; hullG = null; tgeo = null; dieG = null; waveG = null; rippleP = [];
};
TWKit._K = K; TWKit._S = S;

/* ------------------------------------------------------------------ 2D fallback: painted-chart SVG, fully clickable */
var NS = 'http://www.w3.org/2000/svg';
function el(tag, attrs, parent, html) { var e = document.createElementNS(NS, tag); if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; }
function f2(v) { return Math.round(v * 1000) / 1000; }
function roseSVG(cx, cy, R, op) {
  var s = '<g transform="translate(' + cx + ' ' + cy + ')" opacity="' + op + '"><circle r="' + R + '" fill="none" stroke="' + C.goldD + '" stroke-width="' + R * .012 + '"/><circle r="' + R * .93 + '" fill="none" stroke="' + C.goldD + '" stroke-width="' + R * .008 + '"/><circle r="' + R * .5 + '" fill="none" stroke="' + C.goldD + '" stroke-width="' + R * .008 + '"/>';
  for (var p = 0; p < 16; p++) { var an = p / 16 * Math.PI * 2 - Math.PI / 2, len = p % 4 === 0 ? .92 : p % 2 === 0 ? .66 : .42, w = p % 4 === 0 ? .11 : p % 2 === 0 ? .075 : .05, cs = Math.cos(an), sn = Math.sin(an), px = -sn, py = cs;
    [[1, C.gold], [-1, '#b8862a']].forEach(function (sd) { s += '<path d="M0 0L' + f2(cs * R * len) + ' ' + f2(sn * R * len) + 'L' + f2(cs * R * w * 1.6 + px * R * w * sd[0]) + ' ' + f2(sn * R * w * 1.6 + py * R * w * sd[0]) + 'Z" fill="' + sd[1] + '" stroke="' + C.ink + '" stroke-width="' + R * .008 + '"/>'; }); }
  return s + '<circle r="' + R * .06 + '" fill="' + C.ink + '" stroke="' + C.gold + '" stroke-width="' + R * .014 + '"/><text y="' + -R * 1.1 + '" text-anchor="middle" font-size="' + R * .16 + '" font-weight="700" fill="' + C.gold + '" stroke="' + C.ink + '" stroke-width="' + R * .015 + '" paint-order="stroke" font-family="' + FD.replace(/"/g, "'") + '">N</text></g>';
}
var R2 = {
  svg: null,
  build: function () {
    var host = K.fallback; if (!host) return; host.innerHTML = ''; host.setAttribute('data-tw2d', '1');
    var V = HALF + .15, svg = el('svg', { viewBox: -V + ' ' + -V + ' ' + V * 2 + ' ' + V * 2, preserveAspectRatio: 'xMidYMid meet', role: 'img', 'aria-label': 'Tidewake sea chart, 6 by 6 squares', style: 'width:100%;height:100%;display:block;touch-action:manipulation;user-select:none' }, host); R2.svg = svg;
    var style = el('style', null, svg, '.tw2-spin{animation:tw2spin 6s linear infinite;transform-box:fill-box;transform-origin:center}.tw2-spin2{animation:tw2spin 3.4s linear infinite reverse;transform-box:fill-box;transform-origin:center}@keyframes tw2spin{to{transform:rotate(360deg)}}.tw2-sq{cursor:pointer}.tw2-pulse{animation:tw2pl 1.2s ease-in-out infinite}@keyframes tw2pl{50%{opacity:.35}}');
    var defs = el('defs', null, svg, '<radialGradient id="tw2sea" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#2a8e93"/><stop offset=".6" stop-color="#1b6f78"/><stop offset="1" stop-color="#0f4a56"/></radialGradient>' +
      '<radialGradient id="tw2tile" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="#4cb4ae"/><stop offset=".55" stop-color="#2a8c92"/><stop offset="1" stop-color="#17606c"/></radialGradient><radialGradient id="tw2lev" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#1a4a58"/><stop offset="1" stop-color="#061821"/></radialGradient>' +
      '<linearGradient id="tw2wood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7b3626"/><stop offset="1" stop-color="#4a1c12"/></linearGradient><linearGradient id="tw2paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0e2b4"/><stop offset=".5" stop-color="#e5d29a"/><stop offset="1" stop-color="#d7bf84"/></linearGradient>' +
      '<filter id="tw2glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation=".035"/></filter><filter id="tw2wash" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9 .6" numOctaves="2" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .1  0 0 0 0 .35  0 0 0 0 .38  0 0 0 .9 -.28"/></filter>' +
      '<filter id="tw2sh" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy=".03" stdDeviation=".03" flood-color="#021a20" flood-opacity=".55"/></filter>');
    var g = el('g', null, svg), lo = HALF;
    el('rect', { x: -lo - .1, y: -lo - .1, width: lo * 2 + .2, height: lo * 2 + .2, rx: .22, fill: 'url(#tw2wood)' }, g); el('rect', { x: -lo, y: -lo, width: lo * 2, height: lo * 2, fill: 'url(#tw2sea)' }, g); el('rect', { x: -lo, y: -lo, width: lo * 2, height: lo * 2, filter: 'url(#tw2wash)', opacity: .55 }, g);
    var sg = ''; for (var row = 0; row < 18; row++) for (var col = 0; col < 14; col++) { var cx = -lo + col * .65 + (row % 2) * .325, cy = -lo + row * .5; sg += '<path d="M' + (cx - .3) + ' ' + cy + 'a.3 .3 0 0 1 .6 0M' + (cx - .2) + ' ' + cy + 'a.2 .2 0 0 1 .4 0M' + (cx - .1) + ' ' + cy + 'a.1 .1 0 0 1 .2 0" />'; }
    el('g', { fill: 'none', stroke: '#d8f4ec', 'stroke-opacity': .11, 'stroke-width': .012 }, g, sg);
    var gs = ''; for (var r = 0; r < 6; r++) for (var c = 0; c < 6; c++) gs += '<rect x="' + (c - G) + '" y="' + (r - G) + '" width="1" height="1" fill="' + ((r + c) % 2 ? 'rgba(255,255,255,.05)' : 'rgba(0,30,40,.08)') + '"/>';
    el('g', null, g, gs); var gl = ''; for (var l = 0; l <= 6; l++) gl += '<path d="M' + (l - G) + ' ' + -G + 'V' + G + 'M' + -G + ' ' + (l - G) + 'H' + G + '"/>';
    el('g', { stroke: 'rgba(232,196,110,.6)', 'stroke-width': .012, 'stroke-dasharray': '.05 .05', fill: 'none' }, g, gl); el('rect', { x: -G, y: -G, width: 6, height: 6, fill: 'none', stroke: C.gold, 'stroke-width': .028 }, g);
    el('g', null, g, roseSVG(0, 0, 2.3, .45));
    var cp_ = coastPts(HALF - .45, 99), d = 'M' + -lo + ' ' + -lo + 'H' + lo + 'V' + lo + 'H' + -lo + 'Z M' + f2(cp_[0][0]) + ' ' + f2(cp_[0][1]); for (var q = 1; q < cp_.length; q++) d += 'L' + f2(cp_[q][0]) + ' ' + f2(cp_[q][1]); d += 'Z';
    el('path', { d: d, fill: 'url(#tw2paper)', 'fill-rule': 'evenodd' }, g); var cd = 'M' + f2(cp_[0][0]) + ' ' + f2(cp_[0][1]); for (var q2 = 1; q2 < cp_.length; q2++) cd += 'L' + f2(cp_[q2][0]) + ' ' + f2(cp_[q2][1]); cd += 'Z';
    el('path', { d: cd, fill: 'none', stroke: 'rgba(220,245,235,.5)', 'stroke-width': .1, transform: 'scale(.985)' }, g); el('path', { d: cd, fill: 'none', stroke: C.ink, 'stroke-width': .022 }, g);
    var tk = ''; for (var t2 = 0; t2 < 48; t2 += 2) { var a = -lo + .08 + t2 / 48 * (2 * lo - .16), b = a + (2 * lo - .16) / 48; tk += '<rect x="' + a + '" y="' + (-lo + .08) + '" width="' + (b - a) + '" height=".12"/><rect x="' + a + '" y="' + (lo - .2) + '" width="' + (b - a) + '" height=".12"/><rect y="' + a + '" x="' + (-lo + .08) + '" height="' + (b - a) + '" width=".12"/><rect y="' + a + '" x="' + (lo - .2) + '" height="' + (b - a) + '" width=".12"/>'; }
    el('g', { fill: C.ink }, g, tk); el('rect', { x: -lo + .08, y: -lo + .08, width: lo * 2 - .16, height: lo * 2 - .16, fill: 'none', stroke: C.ink, 'stroke-width': .018 }, g);
    [[-1, -1], [1, -1], [-1, 1]].forEach(function (cc, i) { el('ellipse', { cx: cc[0] * (HALF - 1), cy: cc[1] * (HALF - 1), rx: .26, ry: .2, fill: 'rgba(214,190,120,.95)', stroke: C.ink, 'stroke-width': .014 }, g); }); el('g', null, g, roseSVG((HALF - 1), (HALF - 1), .62, .9));
    var md = ''; for (var n = 1; n <= 6; n++) { var u = n - 3.5;[[u, -G - .42], [u, G + .42], [-G - .42, u], [G + .42, u]].forEach(function (p) { md += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r=".19" fill="rgba(12,40,50,.92)" stroke="' + C.gold + '" stroke-width=".017"/><text x="' + p[0] + '" y="' + (p[1] + .085) + '" text-anchor="middle" font-size=".27" font-weight="700" fill="#fff2c4" font-family="' + FD.replace(/"/g, "'") + '">' + n + '</text>'; }); }
    el('g', null, g, md);
    var sm = ''; for (var e = 0; e < 6; e++) for (var pp = 0; pp < 2; pp++) { var ff = e + (pp ? 2 / 3 : 1 / 3) - G;[[ff, -G], [ff, G], [-G, ff], [G, ff]].forEach(function (m) { sm += '<circle cx="' + m[0] + '" cy="' + m[1] + '" r=".075" fill="rgba(10,40,50,.88)" stroke="' + C.gold + '" stroke-width=".014"/><circle cx="' + m[0] + '" cy="' + m[1] + '" r=".026" fill="' + C.gold + '"/>'; }); }
    el('g', null, g, sm);
    R2.gTiles = el('g', null, svg); R2.gLine = el('g', null, svg); R2.gLegal = el('g', null, svg); R2.gSpecial = el('g', null, svg); R2.gShips = el('g', null, svg); R2.gGhost = el('g', { 'pointer-events': 'none' }, svg); R2.gHover = el('g', { 'pointer-events': 'none' }, svg); R2.gDice = el('g', null, svg); R2.gFx = el('g', { 'pointer-events': 'none' }, svg);
    // transparent hit squares
    var hit = el('g', null, svg); for (var r2 = 0; r2 < 6; r2++) for (var c2 = 0; c2 < 6; c2++) el('rect', { x: c2 - G, y: r2 - G, width: 1, height: 1, fill: 'transparent', class: 'tw2-sq', 'data-c': c2, 'data-r': r2 }, hit);
    svg.addEventListener('click', function (e) { if (K.onClick) K.onClick(R2.pick(e.clientX, e.clientY), e); });
    svg.addEventListener('pointermove', function (e) { var p = R2.hover(e.clientX, e.clientY); if (K.onHover) K.onHover(p, e); });
    svg.addEventListener('pointerleave', function () { R2.hover(null); });
    // replay model
    Object.keys(S.tiles).forEach(function (k) { R2.tile(S.tiles[k]); }); Object.keys(S.levs).forEach(function (k) { R2.lev(S.levs[k]); }); Object.keys(S.ships).forEach(function (k) { R2.ship(S.ships[k]); }); Object.keys(S.gates).forEach(function (k) { var G_ = S.gates[k]; R2.gate(G_.c, G_.r, true, G_); }); Object.keys(S.mael).forEach(function (k) { R2.mael(S.mael[k].c, S.mael[k].r, true); }); R2.legal(); R2.ghost(); R2.line(); if (S.dice.length) R2.dice(S.dice);
  },
  resize: function () {},
  toWorld: function (x, y) { var rc = R2.svg.getBoundingClientRect(), V = HALF + .15, sc = Math.min(rc.width, rc.height) / (V * 2); return [(x - rc.left - rc.width / 2) / sc, (y - rc.top - rc.height / 2) / sc]; },
  pick: function (x, y) { if (!R2.svg) return null; var w = R2.toWorld(x, y); return pickWorld(w[0], w[1], false); },
  pickEl: function (e) { while (e && e.getAttribute && !e.getAttribute('data-c')) e = e.parentNode; if (!e || !e.getAttribute) return null; return { kind: 'square', c: +e.getAttribute('data-c'), r: +e.getAttribute('data-r') }; },
  hover: function (x, y) { if (!R2.svg) return null; R2.gHover.innerHTML = ''; if (x == null) { S.hover = null; return null; } var p = R2.pick(x, y); if (p && p.kind === 'square') { S.hover = { c: p.c, r: p.r }; el('rect', { x: p.c - G + .02, y: p.r - G + .02, width: .96, height: .96, rx: .05, fill: 'rgba(255,226,140,.18)', stroke: '#ffe28c', 'stroke-width': .03 }, R2.gHover); } else S.hover = null; return p; },
  legal: function () { if (!R2.svg) return; R2.gLegal.innerHTML = ''; S.legal.forEach(function (s) { el('rect', { x: s.c - G + .03, y: s.r - G + .03, width: .94, height: .94, rx: .06, fill: 'rgba(155,255,232,.12)', stroke: '#9bffe8', 'stroke-width': .03, 'stroke-dasharray': '.1 .06', class: 'tw2-pulse', 'pointer-events': 'none' }, R2.gLegal); }); },
  tileInner: function (paths, c, r, ghost) {
    var ox = c - G, oy = r - G, s = '<rect x="' + (ox + .02) + '" y="' + (oy + .02) + '" width=".96" height=".96" rx=".06" fill="url(#tw2tile)" stroke="' + C.ink + '" stroke-width=".03"/><rect x="' + (ox + .05) + '" y="' + (oy + .05) + '" width=".9" height=".9" rx=".04" fill="none" stroke="rgba(227,178,75,.7)" stroke-width=".008"/>';
    s += paths.map(function (p) { return '<path d="' + pathD(p[0], p[1], 1, ox, oy) + '" fill="none" stroke="#9fe6dc" stroke-opacity=".4" stroke-width=".15" stroke-linecap="round" filter="url(#tw2glow)"/>'; }).join('');
    s += paths.map(function (p) { return '<path d="' + pathD(p[0], p[1], 1, ox, oy) + '" fill="none" stroke="#17606c" stroke-opacity=".6" stroke-width=".085" stroke-linecap="round"/>'; }).join('');
    s += paths.map(function (p) { return '<path d="' + pathD(p[0], p[1], 1, ox, oy) + '" fill="none" stroke="#f6f2df" stroke-width=".05" stroke-linecap="round"/><path d="' + pathD(p[0], p[1], 1, ox, oy) + '" fill="none" stroke="#fff" stroke-width=".014" stroke-linecap="round" stroke-dasharray=".05 .07"/>'; }).join('');
    for (var i = 0; i < 8; i++) s += '<circle cx="' + (ox + PORT[i][0]) + '" cy="' + (oy + PORT[i][1]) + '" r=".022" fill="' + C.gold + '"/>';
    return s;
  },
  tile: function (T) { if (!R2.svg) return; if (T.node) T.node.remove(); T.node = el('g', { 'data-c': T.c, 'data-r': T.r, 'pointer-events': 'none', filter: 'url(#tw2sh)' }, R2.gTiles, R2.tileInner(T.paths, T.c, T.r)); T.node.style.opacity = 0; T.node.style.transition = 'opacity .3s'; raf(function () { T.node.style.opacity = 1; }); },
  untile: function (T) { if (T.node) T.node.remove(); },
  lev: function (L) {
    if (!R2.svg) return; if (L.node) L.node.remove(); var ox = L.c - G, oy = L.r - G, cx = ox + .5, cy = oy + .5; var s = '<rect x="' + (ox + .02) + '" y="' + (oy + .02) + '" width=".96" height=".96" rx=".06" fill="url(#tw2lev)" stroke="' + C.ink + '" stroke-width=".03"/><circle cx="' + cx + '" cy="' + cy + '" r=".2" fill="none" stroke="' + C.gold + '" stroke-opacity=".6" stroke-width=".01"/>';
    var pal = LEV_PAL[L.kind]; s += '<g class="lv"><path d="M' + (cx - .12) + ' ' + (cy + .14) + 'c-.2-.2 .02-.34 .15-.26s.06 .22-.1 .18c-.16-.05-.1-.2 .02-.2" fill="none" stroke="' + pal.b + '" stroke-width=".11" stroke-linecap="round"/><path d="M' + (cx - .12) + ' ' + (cy + .14) + 'c-.2-.2 .02-.34 .15-.26s.06 .22-.1 .18c-.16-.05-.1-.2 .02-.2" fill="none" stroke="' + pal.a + '" stroke-width=".08" stroke-linecap="round" stroke-dasharray=".05 .02"/><ellipse cx="' + (cx + .06) + '" cy="' + (cy - .14) + '" rx=".08" ry=".055" fill="' + pal.a + '" stroke="' + pal.b + '" stroke-width=".02"/><circle cx="' + (cx + .08) + '" cy="' + (cy - .16) + '" r=".016" fill="' + pal.eye + '"/></g>';
    L.arrows.forEach(function (a) { var an = (a.dir * 45 - 90) * Math.PI / 180, ax = cx + Math.cos(an) * .38, ay = cy + Math.sin(an) * .38, nx = cx + Math.cos(an) * .27, ny = cy + Math.sin(an) * .27; s += '<g transform="translate(' + ax + ' ' + ay + ') rotate(' + a.dir * 45 + ') scale(.011)"><path d="M0-10L7-1H2.6V8H-2.6V-1H-7Z" fill="' + C.gold + '" stroke="' + C.ink + '" stroke-width="1"/></g><circle cx="' + nx + '" cy="' + ny + '" r=".055" fill="' + C.ink + '" stroke="' + C.gold + '" stroke-width=".01"/><text x="' + nx + '" y="' + (ny + .03) + '" text-anchor="middle" font-size=".08" font-weight="700" fill="#fff2c4" font-family="' + FD.replace(/"/g, "'") + '">' + a.n + '</text>'; });
    L.node = el('g', { 'pointer-events': 'none', filter: 'url(#tw2sh)' }, R2.gTiles, s);
  },
  unlev: function (L) { if (L.node) L.node.remove(); },
  pulse: function (c, r) { R2.fx('splash', c - 2.5, r - 2.5, 1.2); },
  destroy: function (T, isLev) { if (T.node) { T.node.style.transition = 'opacity .5s, transform .5s'; T.node.style.opacity = 0; setTimeout(function () { T.node.remove(); }, 520); } R2.fx('splash', T.c - 2.5, T.r - 2.5, 1.3); R2.fx('chips', T.c - 2.5, T.r - 2.5, 1); },
  ship: function (s, redraw) {
    if (!R2.svg) return; if (s.node) s.node.remove(); var col = SHIP_COLORS[s.color % 8];
    var sail = '<path d="M-.02-.02 L.17-.06 L.16-.34 L-.02-.38Z" fill="' + col.sail + '" stroke="' + C.ink + '" stroke-width=".02"/><path d="M-.02-.12L.165-.15M-.02-.21L.165-.24M-.02-.3L.165-.32" stroke="rgba(40,20,5,.55)" stroke-width=".015"/>';
    var cn = ''; for (var i = 0; i < Math.min(5, s.cannons); i++) cn += '<circle cx="' + (-.1 + i * .06) + '" cy="-.02" r=".022" fill="#b98a3a" stroke="' + C.ink + '" stroke-width=".008"/>';
    s.node = el('g', { 'data-ship': s.id, 'pointer-events': 'none' }, R2.gShips); s.hull = el('g', null, s.node, '<ellipse rx=".3" ry=".15" cy=".03" fill="rgba(2,26,32,.35)"/><path d="M-.26-.09Q-.29 0-.26.09L.12.11Q.34 0 .12-.11Z" fill="#8a5a34" stroke="' + C.ink + '" stroke-width=".022"/><path d="M-.24-.075L.12-.095M-.24.075L.12.095" stroke="' + col.trim + '" stroke-width=".03" stroke-linecap="round"/><rect x="-.27" y="-.06" width=".1" height=".12" rx=".02" fill="' + col.trim + '" stroke="' + C.ink + '" stroke-width=".015"/>' + cn);
    s.sail = el('g', null, s.node, sail); s.sailRot = s.sail;
  },
  unship: function (s) { if (s.node) s.node.remove(); },
  gate: function (c, r, on, G_) { if (!R2.svg) return; var id = 'g' + c + ',' + r, old = R2.gSpecial.querySelector('[data-id="' + id + '"]'); if (old) old.remove(); if (!on) return; var p = G_.pal || ['#9b5cff', '#35e0ff'], cx = c - 2.5, cy = r - 2.5; var g = el('g', { 'data-id': id, 'pointer-events': 'none' }, R2.gSpecial, '<circle cx="' + cx + '" cy="' + cy + '" r=".4" fill="' + p[0] + '" opacity=".25" filter="url(#tw2glow)"/><g class="tw2-spin"><circle cx="' + cx + '" cy="' + cy + '" r=".3" fill="none" stroke="' + p[0] + '" stroke-width=".07" stroke-dasharray=".25 .1"/></g><g class="tw2-spin2"><circle cx="' + cx + '" cy="' + cy + '" r=".19" fill="none" stroke="' + p[1] + '" stroke-width=".05" stroke-dasharray=".12 .08"/></g><circle cx="' + cx + '" cy="' + cy + '" r=".34" fill="none" stroke="' + C.gold + '" stroke-width=".035"/>'); },
  mael: function (c, r, on) { if (!R2.svg) return; var id = 'm' + c + ',' + r, old = R2.gSpecial.querySelector('[data-id="' + id + '"]'); if (old) old.remove(); if (!on) return; var cx = c - 2.5, cy = r - 2.5; el('g', { 'data-id': id, 'pointer-events': 'none' }, R2.gSpecial, '<circle cx="' + cx + '" cy="' + cy + '" r=".44" fill="#06222c" opacity=".85"/><g class="tw2-spin2"><path d="M' + cx + ' ' + cy + 'm0-.4a.4 .4 0 0 1 .4 .4M' + cx + ' ' + cy + 'm.3 .05a.3 .3 0 0 1-.3 .3M' + cx + ' ' + cy + 'm-.3-.1a.3 .3 0 0 1 .3-.3" fill="none" stroke="#c8fff0" stroke-width=".05" stroke-linecap="round"/><path d="M' + cx + ' ' + cy + 'm-.2 0a.2 .2 0 0 1 .2-.2M' + cx + ' ' + cy + 'm.2 0a.2 .2 0 0 1-.2 .2" fill="none" stroke="#5fd0c8" stroke-width=".05" stroke-linecap="round"/></g>'); },
  waveTile: function (c, r, on) { if (!R2.svg) return; var id = 'w' + c + ',' + r, old = R2.gSpecial.querySelector('[data-id="' + id + '"]'); if (old) old.remove(); if (!on) return; var ox = c - G, oy = r - G; el('g', { 'data-id': id, 'pointer-events': 'none' }, R2.gSpecial, '<rect x="' + (ox + .02) + '" y="' + (oy + .02) + '" width=".96" height=".96" rx=".06" fill="#1b8c96" stroke="' + C.ink + '" stroke-width=".03"/><path d="M' + (ox + .1) + ' ' + (oy + .8) + 'C' + (ox + .3) + ' ' + (oy + .3) + ' ' + (ox + .6) + ' ' + (oy + .15) + ' ' + (ox + .75) + ' ' + (oy + .3) + 'C' + (ox + .85) + ' ' + (oy + .45) + ' ' + (ox + .65) + ' ' + (oy + .5) + ' ' + (ox + .62) + ' ' + (oy + .4) + 'C' + (ox + .8) + ' ' + (oy + .55) + ' ' + (ox + .85) + ' ' + (oy + .7) + ' ' + (ox + .9) + ' ' + (oy + .8) + 'Z" fill="#79d7d0" stroke="#fff" stroke-width=".03"/>'); },
  marker: function (edge, index, on) { if (!R2.svg) return; var old = R2.gSpecial.querySelector('[data-id="rogue"]'); if (old) old.remove(); if (!on) return; var p = { top: [index - 3.5, -G - .85], bottom: [index - 3.5, G + .85], left: [-G - .85, index - 3.5], right: [G + .85, index - 3.5] }[edge]; el('g', { 'data-id': 'rogue', 'pointer-events': 'none' }, R2.gSpecial, '<circle cx="' + p[0] + '" cy="' + p[1] + '" r=".25" fill="#2c6fd0" stroke="' + C.gold + '" stroke-width=".05"/><path d="M' + (p[0] - .14) + ' ' + (p[1] + .04) + 'q.07-.14 .14 0t.14 0" fill="none" stroke="#ffe9a8" stroke-width=".04" stroke-linecap="round"/>'); },
  line: function () { if (!R2.svg) return; R2.gLine.innerHTML = ''; var l = S.line; if (!l) return; var h = l.row != null; el('rect', { x: h ? -G : l.col - G, y: h ? l.row - G : -G, width: h ? 6 : 1, height: h ? 1 : 6, fill: 'rgba(90,184,255,.28)', stroke: '#5ab8ff', 'stroke-width': .03, class: 'tw2-pulse', 'pointer-events': 'none' }, R2.gLine); },
  sweep: function (axis, lane, dir) { var g = el('g', null, R2.gFx), w = el('path', { d: 'M-.4 .4Q-.2-.3 .15-.3Q.4-.2 .3 .05Q.2-.05 .15 .05Q.4 .2 .5 .4Z', fill: '#79d7d0', stroke: '#fff', 'stroke-width': .04 }, g); var start = -dir * (HALF + .6), end = dir * (HALF + .6); tween(2, function (e) { var p = lerp(start, end, e); g.setAttribute('transform', 'translate(' + (axis === 'x' ? p : lane) + ' ' + (axis === 'x' ? lane : p) + ') rotate(' + (axis === 'x' ? (dir > 0 ? 0 : 180) : (dir > 0 ? 90 : -90)) + ') scale(1.6)'); }, EASE.sine).then(function () { g.remove(); }); },
  ghost: function () { if (!R2.svg) return; R2.gGhost.innerHTML = ''; var G0 = S.ghost; if (!G0) return; var g = el('g', { opacity: G0.valid ? .82 : .6 }, R2.gGhost, R2.tileInner(G0.paths, G0.c, G0.r)); if (!G0.valid) el('rect', { x: G0.c - G + .02, y: G0.r - G + .02, width: .96, height: .96, rx: .06, fill: 'rgba(255,60,40,.35)' }, R2.gGhost); if (G0.trace && G0.trace.length) { var pts = routePts(G0.trace); el('path', { d: 'M' + pts.map(function (p) { return f2(p[0]) + ' ' + f2(p[1]); }).join('L'), fill: 'none', stroke: '#ffd978', 'stroke-width': .06, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': '.1 .07', opacity: .95 }, R2.gGhost); } },
  dice: function (list) {
    if (!R2.svg) return; R2.gDice.innerHTML = ''; list.forEach(function (d, i) {
      var k = DIEK[d.kind] || DIEK.gold, x = (i - (list.length - 1) / 2) * .58, y = HALF - .6, P = { 1: [[0, 0]], 2: [[-.07, -.07], [.07, .07]], 3: [[-.07, -.07], [0, 0], [.07, .07]], 4: [[-.07, -.07], [.07, -.07], [-.07, .07], [.07, .07]], 5: [[-.07, -.07], [.07, -.07], [0, 0], [-.07, .07], [.07, .07]], 6: [[-.07, -.08], [.07, -.08], [-.07, 0], [.07, 0], [-.07, .08], [.07, .08]] }[d.value];
      var g = el('g', { transform: 'translate(' + x + ' ' + y + ') rotate(' + (i % 2 ? 8 : -9) + ')', 'data-die': d.kind, 'data-value': d.value }, R2.gDice, '<rect x="-.17" y="-.17" width=".34" height=".34" rx=".06" fill="' + k.f[0] + '" stroke="' + C.ink + '" stroke-width=".025" filter="url(#tw2sh)"/>' + P.map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r=".03" fill="' + k.p[0] + '"/>'; }).join(''));
      g.style.opacity = 0; g.style.transition = 'opacity .25s'; raf(function () { g.style.opacity = 1; });
    });
  },
  fx: function (kind, x, z, s) {
    if (!R2.svg || kind === 'bubbles' || kind === 'smoke') return; s = s || 1; var n = kind === 'chips' || kind === 'sparks' ? 8 : 0;
    var ring = el('circle', { cx: x, cy: z, r: .1, fill: 'none', stroke: kind === 'flash' ? '#ffd27a' : '#f6f2df', 'stroke-width': .05 }, R2.gFx); tween(.7, function (e) { ring.setAttribute('r', .1 + e * .55 * s); ring.setAttribute('opacity', 1 - e); }, EASE.out).then(function () { ring.remove(); });
    for (var i = 0; i < n; i++) { (function () { var a = Math.random() * 6.28, v = .5 + Math.random() * .6, c = el('circle', { cx: x, cy: z, r: .03, fill: kind === 'chips' ? '#7a4a22' : '#ffd27a' }, R2.gFx); tween(.6, function (e) { c.setAttribute('cx', x + Math.cos(a) * v * e); c.setAttribute('cy', z + Math.sin(a) * v * e); c.setAttribute('opacity', 1 - e); }, EASE.out).then(function () { c.remove(); }); })(); }
  },
  update: function (dt, t) {
    if (!R2.svg) return;
    Object.keys(S.ships).forEach(function (id) { var s = S.ships[id]; if (!s.node) return; s.node.style.display = s.alive || s.sink < 1 ? '' : 'none'; var bob = Math.sin(t * 1.7 + s.phase) * .01; s.node.setAttribute('transform', 'translate(' + f2(s.x) + ' ' + f2(s.z + bob - s.y * .5 + s.sink * .12) + ') scale(' + f2(Math.max(.01, s.scale * (1 - s.sink * .5))) + ')'); s.node.setAttribute('opacity', 1 - s.sink * .85); s.hull.setAttribute('transform', 'rotate(' + f2(s.h * 180 / Math.PI) + ')'); });
    Object.keys(S.levs).forEach(function (k) { var L = S.levs[k]; if (L.node) { var lv = L.node.querySelector('.lv'); if (lv) lv.setAttribute('transform', 'translate(0 ' + f2(-.03 * Math.sin(t * 1.5 + L.ph)) + ')'); } });
  }
};
TWKit.R2 = R2;

})(typeof window !== 'undefined' ? window : this);

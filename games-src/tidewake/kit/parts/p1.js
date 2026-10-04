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

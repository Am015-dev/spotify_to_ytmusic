/* Short Fuse - 3D visual kit ("Cartoon demolition crew").
 * Plain script. Needs Three.js r158 UMD (global THREE) for 3D; the 2D fallback needs only the DOM.
 * Exposes window.SFKit. All art is procedural (canvas textures + geometry). */
(function (global) {
'use strict';
var THREE = global.THREE;
var SFKit = { version: '1.0.0' };
global.SFKit = SFKit;

/* ------------------------------------------------------------------ constants */
var FD = "'Lilita One','Arial Black','Impact',system-ui,sans-serif";
var FB = "'Nunito','Trebuchet MS','Segoe UI',system-ui,sans-serif";
var SEATC = ['#ff8a1f', '#16b3a6', '#8f5bff', '#52c23a', '#ff5c9a'];
var INK = '#1c1838', CREAM = '#fff2d4';
var TC = { blue: ['#56a6ff', '#1c62d9'], red: ['#ff6048', '#c11d1d'], yellow: ['#ffe455', '#ffb300'] };
var TW = 1.0, TH = 1.5, TD = 0.26, PITCH = 1.13, LEAN = 0.14, LEAN_ME = 0.42;
var SB = 0.045;                                      // stand bevel
var SHELF_Y = 0.31, SLOT_Y = 0.45, LIP_Y = 0.43, U0 = -0.5, U1 = 2.5, RDEPTH = U1 - U0;
var CAP = 84;                                        // tile instance capacity (70 + spares)
var AT = { cols: 8, rows: 5, cw: 256, ch: 384 };     // tile face atlas
var CELL_BACK = 34, CELL_RED = 35, CELL_YEL = 36, CELL_UNK = 37;
var GFX = {
  high:   { dpr: 2,   shadows: true,  map: 2048, post: true,  phys: true,  outline: true, parts: 1 },
  medium: { dpr: 1.5, shadows: true,  map: 1024, post: false, phys: false, outline: true, parts: .7 },
  low:    { dpr: 1,   shadows: false, map: 0,    post: false, phys: false, outline: true, parts: .4 }
};
var CONSTRAINT_TXT = {
  A: 'Only cut even values', B: 'Only cut odd values', C: 'Only cut values 1-6', D: 'Only cut values 7-12',
  E: 'Only cut values 4-9', F: 'Never cut values 4-9', G: 'No equipment, no personal item',
  H: 'Failed cuts on you show no info. Tagged wires are off limits', I: "Never cut a teammate's right-most wire",
  J: "Never cut a teammate's left-most wire", K: 'No Solo Cut', L: 'A failed cut moves the dial 2'
};
var CHALLENGE_TXT = {
  1: 'Point at a wire and call RED. Wrong = boom', 2: '4 players in a row cut even values',
  3: 'A stand with only isolated pairs left', 4: 'First 3 validations sum to 18', 5: '2 Solo Cuts in a row',
  6: '5 isolated uncut wires on one stand', 7: '3 consecutive values cut in a row', 8: 'First 2 validations match the 2 cards',
  9: 'A stand of 6+ odd blue wires only', 10: '7 cut on one stand, both ends uncut'
};
var ITEM_NAMES = { double_probe: 'Double Probe', sweep: 'Sweep', handsets: 'Handsets', triple_probe: 'Triple Probe', two_value_probe: 'Two-Value Probe' };

/* ------------------------------------------------------------------ state */
var K = {
  on: false, mode: null, canvas: null, fallback: null,
  st: { n: 4, my: 0, names: [], captain: 0, stands: {}, dial: { value: 4, max: 4 }, tokens: {}, equipment: [], mission: null, characters: [], highlight: [], turn: null },
  recs: {}, rows: [], paints: [], texc: {}, geoc: {}, tw: [], parts: [], dirty: true, first: true,
  frame: { n: 0, acc: 0, rAcc: 0, last: 0, hist: [] }, q: 'high', pref: 'auto'
};
SFKit._K = K;
function now() { return (global.performance && performance.now) ? performance.now() : Date.now(); }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, t) { return a + (b - a) * t; }
function seeded(s) { s = (s >>> 0) || 1; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function hasGL() {
  if (!THREE) return false;
  try { if (/jsdom/i.test(navigator.userAgent)) return false; var c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}
SFKit.supported = hasGL;
/* animation speed multiplier: 1 = normal, 2 = twice as fast, 0.25 = slow motion; Infinity-like large values make every effect near-instant */
SFKit.setSpeed = function (s) { K.speed = clamp(+s || 1, .05, 1000); return K.speed; };
var E = {
  outCubic: function (k) { return 1 - Math.pow(1 - k, 3); },
  inOut: function (k) { return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; },
  outBack: function (k) { var c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); },
  outElastic: function (k) { return k <= 0 ? 0 : k >= 1 ? 1 : Math.pow(2, -9 * k) * Math.sin((k * 9 - .75) * 2 * Math.PI / 3) + 1; },
  outBounce: function (k) { var n = 7.5625, d = 2.75; if (k < 1 / d) return n * k * k; if (k < 2 / d) return n * (k -= 1.5 / d) * k + .75; if (k < 2.5 / d) return n * (k -= 2.25 / d) * k + .9375; return n * (k -= 2.625 / d) * k + .984375; }
};
function tween(dur, fn, done, delay) { var sp = K.speed || 1; var o = { t0: now() + (delay || 0) * 1000 / sp, d: Math.max(1, dur * 1000 / sp), fn: fn, done: done }; K.tw.push(o); K.dirty = true; return o; }
function killTween(o) { var i = K.tw.indexOf(o); if (i >= 0) K.tw.splice(i, 1); }
function updTweens(t) {
  for (var i = K.tw.length - 1; i >= 0; i--) {
    var o = K.tw[i]; if (!o || t < o.t0) continue;
    var k = (t - o.t0) / o.d; if (k > 1) k = 1;
    try { o.fn(k); } catch (e) { k = 1; }
    if (k >= 1) { K.tw.splice(K.tw.indexOf(o), 1); if (o.done) try { o.done(); } catch (e) {} }
  }
}

/* ------------------------------------------------------------------ canvas helpers */
function cvs(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function rr(x, X, Y, W, H, R) { R = Math.min(R, W / 2, H / 2); x.beginPath(); x.moveTo(X + R, Y); x.arcTo(X + W, Y, X + W, Y + H, R); x.arcTo(X + W, Y + H, X, Y + H, R); x.arcTo(X, Y + H, X, Y, R); x.arcTo(X, Y, X + W, Y, R); x.closePath(); }
function font(x, size, disp, wt) { x.font = (disp ? '' : (wt || 800) + ' ') + Math.round(size) + 'px ' + (disp ? FD : FB); }
function otext(x, s, X, Y, fill, stroke, lw) { x.lineJoin = 'round'; x.miterLimit = 2; if (stroke && lw) { x.strokeStyle = stroke; x.lineWidth = lw; x.strokeText(s, X, Y); } x.fillStyle = fill; x.fillText(s, X, Y); }
function fitFont(x, s, maxW, size, disp, wt) { font(x, size, disp, wt); var w = x.measureText(s).width; if (w > maxW) { size = Math.floor(size * maxW / w); font(x, size, disp, wt); } return size; }
function wrap(x, s, X, Y, maxW, lh, maxL) {
  var words = String(s || '').split(/\s+/), line = '', lines = [];
  for (var i = 0; i < words.length; i++) { var t = line ? line + ' ' + words[i] : words[i]; if (x.measureText(t).width > maxW && line) { lines.push(line); line = words[i]; } else line = t; }
  if (line) lines.push(line);
  if (maxL && lines.length > maxL) { lines.length = maxL; lines[maxL - 1] = lines[maxL - 1].replace(/\s*\S*$/, '') + '...'; }
  for (var j = 0; j < lines.length; j++) x.fillText(lines[j], X, Y + j * lh);
  return lines.length;
}
function star(x, cx, cy, R, r, n, fill, ink, lw, rot) {
  x.beginPath(); for (var i = 0; i < n * 2; i++) { var a = (rot == null ? -Math.PI / 2 : rot) + i * Math.PI / n, q = i % 2 ? r : R; x.lineTo(cx + Math.cos(a) * q, cy + Math.sin(a) * q); }
  x.closePath(); x.lineJoin = 'round'; if (lw) { x.lineWidth = lw; x.strokeStyle = ink; x.stroke(); } x.fillStyle = fill; x.fill();
}
function bolt(x, cx, cy, s, fill, ink, lw) {
  var P = [[.18, -1], [-.58, .14], [-.06, .14], [-.3, 1], [.58, -.2], [.06, -.2], [.4, -1]];
  x.beginPath(); for (var i = 0; i < P.length; i++) { var X = cx + P[i][0] * s, Y = cy + P[i][1] * s; if (i) x.lineTo(X, Y); else x.moveTo(X, Y); }
  x.closePath(); x.lineJoin = 'round'; if (lw) { x.lineWidth = lw * 2; x.strokeStyle = ink; x.stroke(); } x.fillStyle = fill; x.fill();
}
function bombIcon(x, cx, cy, r, fill, ink, lw, spark) {
  x.save(); x.lineCap = 'round'; x.lineJoin = 'round';
  x.beginPath(); x.moveTo(cx + r * .5, cy - r * .8); x.quadraticCurveTo(cx + r * .95, cy - r * 1.45, cx + r * 1.3, cy - r * 1.1);
  x.strokeStyle = ink; x.lineWidth = r * .3; x.stroke(); x.strokeStyle = '#e0a868'; x.lineWidth = r * .14; x.stroke();
  x.save(); x.translate(cx + r * .5, cy - r * .74); x.rotate(.62); rr(x, -r * .3, -r * .2, r * .6, r * .4, r * .08); x.fillStyle = fill; x.fill(); x.lineWidth = lw; x.strokeStyle = ink; x.stroke(); x.restore();
  x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fillStyle = fill; x.fill(); x.lineWidth = lw; x.strokeStyle = ink; x.stroke();
  x.beginPath(); x.ellipse(cx - r * .38, cy - r * .36, r * .24, r * .14, -.7, 0, 7); x.fillStyle = 'rgba(255,255,255,.8)'; x.fill();
  if (spark !== false) star(x, cx + r * 1.34, cy - r * 1.14, r * .5, r * .2, 8, '#ffe14a', ink, lw * .7);
  x.restore();
}
function checkMark(x, cx, cy, s, col, ink, lw) {
  x.save(); x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(cx - s * .55, cy); x.lineTo(cx - s * .15, cy + s * .42); x.lineTo(cx + s * .6, cy - s * .45);
  x.strokeStyle = ink; x.lineWidth = s * .42 + lw * 2; x.stroke(); x.strokeStyle = col; x.lineWidth = s * .42; x.stroke(); x.restore();
}
function rivet(x, cx, cy, r) { x.beginPath(); x.arc(cx, cy, r, 0, 7); var g = x.createRadialGradient(cx - r * .4, cy - r * .4, r * .1, cx, cy, r); g.addColorStop(0, '#ffffff'); g.addColorStop(.5, '#c9cbe0'); g.addColorStop(1, '#6a6f93'); x.fillStyle = g; x.fill(); x.lineWidth = Math.max(1, r * .3); x.strokeStyle = INK; x.stroke(); }
function hazard(x, X, Y, W, H, s, a, b) { x.save(); x.beginPath(); x.rect(X, Y, W, H); x.clip(); x.fillStyle = a; x.fillRect(X, Y, W, H); x.fillStyle = b; for (var i = -H; i < W + H; i += s * 2) { x.beginPath(); x.moveTo(X + i, Y + H); x.lineTo(X + i + s, Y + H); x.lineTo(X + i + s + H, Y); x.lineTo(X + i + H, Y); x.closePath(); x.fill(); } x.restore(); }
function dots(x, X, Y, W, H, step, r, col) { x.save(); x.fillStyle = col; for (var j = 0, yy = Y; yy < Y + H; yy += step, j++) for (var xx = X + (j % 2 ? step / 2 : 0); xx < X + W; xx += step) { x.beginPath(); x.arc(xx, yy, r, 0, 7); x.fill(); } x.restore(); }

/* ------------------------------------------------------------------ textures */
function mkTex(c, srgb) { var t = new THREE.CanvasTexture(c); if (srgb !== false) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = K.aniso || 4; return t; }
function ptex(key, w, h, fn, srgb) {
  if (K.texc[key]) return K.texc[key].t;
  var sc = (K.q === 'low' && w > 160) ? .6 : 1; var c = cvs(Math.round(w * sc), Math.round(h * sc)); var x = c.getContext('2d'); x.scale(sc, sc); fn(x, w, h);
  var t = mkTex(c, srgb); var p = { c: c, fn: fn, t: t, w: w, h: h, sc: sc, key: key }; K.texc[key] = p; K.paints.push(p); return t;
}
function repaintAll() {
  for (var i = 0; i < K.paints.length; i++) { var p = K.paints[i]; var x = p.c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, p.c.width, p.c.height); x.scale(p.sc, p.sc); try { p.fn(x, p.w, p.h); } catch (e) {} p.t.needsUpdate = true; }
  K.dirty = true;
}
function dropTex(key) { var p = K.texc[key]; if (!p) return; p.t.dispose(); delete K.texc[key]; var i = K.paints.indexOf(p); if (i >= 0) K.paints.splice(i, 1); }

/* tile face atlas */
function cellOf(t, faceUp) {
  if (!faceUp) return CELL_UNK;
  var c = t.color || 'blue', v = t.value;
  if (c === 'blue') return clamp(Math.round(v || 1), 1, 12) - 1;
  var f = Math.floor(v);
  if (c === 'red') return (v == null || isNaN(f)) ? CELL_RED : 12 + clamp(f, 1, 11) - 1;
  if (c === 'yellow') return (v == null || isNaN(f)) ? CELL_YEL : 23 + clamp(f, 1, 11) - 1;
  return CELL_UNK;
}
function cellUV(i) { var col = i % AT.cols, row = Math.floor(i / AT.cols); return [col / AT.cols, 1 - (row + 1) / AT.rows]; }
function paintWire(x, x0, y, x1, col, hi) {
  x.save(); x.lineCap = 'round'; x.lineJoin = 'round';
  var path = function () { x.beginPath(); for (var i = 0; i <= 40; i++) { var t = i / 40, X = x0 + (x1 - x0) * t, Y = y + Math.sin(t * Math.PI * 3) * 13; if (i) x.lineTo(X, Y); else x.moveTo(X, Y); } };
  path(); x.strokeStyle = INK; x.lineWidth = 22; x.stroke(); path(); x.strokeStyle = col; x.lineWidth = 12; x.stroke();
  x.translate(0, -3); path(); x.strokeStyle = hi; x.lineWidth = 3.5; x.stroke(); x.translate(0, 3);
  for (var s = 0; s < 2; s++) { var X = s ? x1 : x0; rr(x, X - 11, y - 9, 22, 18, 6); x.fillStyle = '#f0b25c'; x.fill(); x.lineWidth = 4; x.strokeStyle = INK; x.stroke(); }
  x.restore();
}
function paintFace(x, ox, oy, kind, v) {
  var w = AT.cw, h = AT.ch, P = 17;
  x.save(); x.translate(ox, oy);
  x.fillStyle = CREAM; x.fillRect(0, 0, w, h);
  var cg = x.createLinearGradient(0, 0, 0, h); cg.addColorStop(0, '#fff8e6'); cg.addColorStop(1, '#f3dfb4'); x.fillStyle = cg; x.fillRect(2, 2, w - 4, h - 4);
  if (kind === 'back' || kind === 'unk') {
    rr(x, P, P, w - 2 * P, h - 2 * P, 30); var bg = x.createLinearGradient(0, P, 0, h - P); bg.addColorStop(0, '#454d8e'); bg.addColorStop(1, '#262c5c'); x.fillStyle = bg; x.fill();
    x.save(); x.clip(); x.globalAlpha = .1; hazard(x, P, P, w - 2 * P, h - 2 * P, 22, 'rgba(0,0,0,0)', '#ffffff'); x.globalAlpha = 1;
    x.fillStyle = 'rgba(255,255,255,.12)'; x.beginPath(); x.ellipse(w / 2, P + 22, w * .5, 56, 0, 0, 7); x.fill(); x.restore();
    rr(x, P, P, w - 2 * P, h - 2 * P, 30); x.lineWidth = 7; x.strokeStyle = INK; x.stroke();
    var cx = w / 2, cy = h / 2; x.beginPath(); x.arc(cx, cy, 70, 0, 7); x.fillStyle = CREAM; x.fill(); x.lineWidth = 7; x.strokeStyle = INK; x.stroke();
    x.lineCap = 'round'; var wc = ['#2f86ff', '#ef3b2d', '#ffc928'];
    for (var i = 0; i < 3; i++) { x.save(); x.translate(cx, cy); x.rotate(-.6 + i * .6); x.beginPath(); x.moveTo(0, 46); x.quadraticCurveTo(14, 0, 0, -46); x.strokeStyle = INK; x.lineWidth = 17; x.stroke(); x.strokeStyle = wc[i]; x.lineWidth = 9; x.stroke(); x.restore(); }
    x.beginPath(); x.arc(cx, cy + 46, 10, 0, 7); x.fillStyle = '#f0b25c'; x.fill(); x.lineWidth = 4; x.strokeStyle = INK; x.stroke();
    rivet(x, P + 22, P + 22, 9); rivet(x, w - P - 22, P + 22, 9); rivet(x, P + 22, h - P - 22, 9); rivet(x, w - P - 22, h - P - 22, 9);
    x.restore(); return;
  }
  var cols = TC[kind];
  rr(x, P, P, w - 2 * P, h - 2 * P, 30); var g = x.createLinearGradient(0, P, 0, h - P); g.addColorStop(0, cols[0]); g.addColorStop(1, cols[1]); x.fillStyle = g; x.fill();
  x.save(); x.clip();
  if (kind === 'red') { x.globalAlpha = .13; hazard(x, P, P, w, h, 20, 'rgba(0,0,0,0)', '#5a0000'); x.globalAlpha = 1; }
  if (kind === 'yellow') dots(x, P, P, w, h, 26, 5, 'rgba(255,255,255,.28)');
  if (kind === 'blue') dots(x, P, P, w, h, 30, 3.5, 'rgba(255,255,255,.12)');
  x.fillStyle = 'rgba(255,255,255,.22)'; x.beginPath(); x.ellipse(w / 2, P + 18, w * .55, 64, 0, 0, 7); x.fill();
  x.restore();
  rr(x, P, P, w - 2 * P, h - 2 * P, 30); x.lineWidth = 7; x.strokeStyle = INK; x.stroke();
  x.textAlign = 'center'; x.textBaseline = 'middle';
  var wireCol = kind === 'blue' ? '#1f4fb8' : kind === 'red' ? '#7a0d0d' : '#b37a00';
  if (kind === 'blue') {
    var s = String(v), size = s.length > 1 ? 172 : 232; font(x, size, true); var mw = x.measureText(s).width; if (mw > 200) { size = size * 200 / mw; font(x, size, true); }
    x.fillStyle = 'rgba(10,20,70,.55)'; x.fillText(s, w / 2 + 6, h * .43 + 9);
    otext(x, s, w / 2, h * .43, '#ffffff', '#0f1f5c', 20);
    otext(x, s, w / 2, h * .43, '#ffffff');
    if (v === 6 || v === 9) { rr(x, w / 2 - 50, h * .43 + size * .36, 100, 22, 10); x.fillStyle = '#ffffff'; x.fill(); x.lineWidth = 7; x.strokeStyle = '#0f1f5c'; x.stroke(); }
  } else if (kind === 'red') {
    bombIcon(x, w / 2 - 12, h * .42, 64, INK, '#ffffff', 7);
    if (v != null) { font(x, 58, true); otext(x, String(v), w / 2, h * .7, '#ffffff', INK, 12); }
  } else {
    bolt(x, w / 2, h * .4, 96, INK, '#ffffff', 7);
    if (v != null) { font(x, 58, true); otext(x, String(v), w / 2, h * .7, INK, '#ffffff', 10); }
  }
  paintWire(x, P + 34, h - 58, w - P - 34, wireCol, 'rgba(255,255,255,.45)');
  x.restore();
}
function atlasTex() {
  return ptex('atlas', AT.cols * AT.cw, AT.rows * AT.ch, function (x) {
    for (var i = 0; i < 12; i++) paintFace(x, (i % 8) * AT.cw, Math.floor(i / 8) * AT.ch, 'blue', i + 1);
    for (var r = 0; r < 11; r++) { var j = 12 + r; paintFace(x, (j % 8) * AT.cw, Math.floor(j / 8) * AT.ch, 'red', (r + 1) + .5); }
    for (var y = 0; y < 11; y++) { var k = 23 + y; paintFace(x, (k % 8) * AT.cw, Math.floor(k / 8) * AT.ch, 'yellow', (y + 1) + .1); }
    var sp = [[CELL_BACK, 'back'], [CELL_RED, 'red'], [CELL_YEL, 'yellow'], [CELL_UNK, 'unk']];
    for (var q = 0; q < sp.length; q++) paintFace(x, (sp[q][0] % 8) * AT.cw, Math.floor(sp[q][0] / 8) * AT.ch, sp[q][1], null);
  });
}
function softTex(key, inner, outer) { return ptex(key, 64, 64, function (x) { var g = x.createRadialGradient(32, 32, 1, 32, 32, 31); g.addColorStop(0, inner); g.addColorStop(.45, outer); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }); }
function sparkTex() { return ptex('spark', 64, 64, function (x) { var g = x.createRadialGradient(32, 32, 0, 32, 32, 30); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,240,170,.9)'); g.addColorStop(1, 'rgba(255,160,40,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); x.globalCompositeOperation = 'lighter'; x.fillStyle = 'rgba(255,255,230,.9)'; x.beginPath(); x.moveTo(32, 2); x.lineTo(35, 29); x.lineTo(62, 32); x.lineTo(35, 35); x.lineTo(32, 62); x.lineTo(29, 35); x.lineTo(2, 32); x.lineTo(29, 29); x.closePath(); x.fill(); }); }
function puffTex() { return ptex('puff', 128, 128, function (x) { var R = seeded(7); x.lineJoin = 'round'; var bl = []; for (var i = 0; i < 6; i++) { var a = i / 6 * 6.283; bl.push([64 + Math.cos(a) * 26, 64 + Math.sin(a) * 22, 24 + R() * 8]); } bl.push([64, 64, 34]);
  x.fillStyle = INK; for (var j = 0; j < bl.length; j++) { x.beginPath(); x.arc(bl[j][0], bl[j][1], bl[j][2] + 5, 0, 7); x.fill(); }
  for (var k = 0; k < bl.length; k++) { var g = x.createRadialGradient(bl[k][0] - 8, bl[k][1] - 10, 2, bl[k][0], bl[k][1], bl[k][2]); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#cfd3e6'); x.fillStyle = g; x.beginPath(); x.arc(bl[k][0], bl[k][1], bl[k][2], 0, 7); x.fill(); } }); }
function blobTex() { return softTex('blob', 'rgba(20,10,0,.55)', 'rgba(20,10,0,.3)'); }

/* ------------------------------------------------------------------ geometry */
function rrShape(w, h, r) { var s = new THREE.Shape(), x = -w / 2, y = -h / 2; r = Math.min(r, w / 2 - .001, h / 2 - .001); s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
function smoothNormals(g, cosT) {
  var p = g.attributes.position.array, n = p.length / 9, fn = new Float32Array(n * 3);
  var A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
  for (var i = 0; i < n; i++) { A.fromArray(p, i * 9); B.fromArray(p, i * 9 + 3); C.fromArray(p, i * 9 + 6); B.sub(A); C.sub(A); B.cross(C).normalize(); fn[i * 3] = B.x; fn[i * 3 + 1] = B.y; fn[i * 3 + 2] = B.z; }
  var map = {}, q = 1e4; function key(j) { return Math.round(p[j] * q) + '_' + Math.round(p[j + 1] * q) + '_' + Math.round(p[j + 2] * q); }
  for (var v = 0; v < n * 3; v++) { var k = key(v * 3); (map[k] || (map[k] = [])).push(v); }
  var out = new Float32Array(n * 9);
  for (var kk in map) { var L = map[kk]; for (var a = 0; a < L.length; a++) { var fa = Math.floor(L[a] / 3); var sx = 0, sy = 0, sz = 0; for (var b = 0; b < L.length; b++) { var fb = Math.floor(L[b] / 3); var d = fn[fa * 3] * fn[fb * 3] + fn[fa * 3 + 1] * fn[fb * 3 + 1] + fn[fa * 3 + 2] * fn[fb * 3 + 2]; if (d >= cosT) { sx += fn[fb * 3]; sy += fn[fb * 3 + 1]; sz += fn[fb * 3 + 2]; } } var l = Math.hypot(sx, sy, sz) || 1; out[L[a] * 3] = sx / l; out[L[a] * 3 + 1] = sy / l; out[L[a] * 3 + 2] = sz / l; } }
  g.setAttribute('normal', new THREE.BufferAttribute(out, 3));
}
function gq(k, f) { return K.geoc[k] || (K.geoc[k] = f()); }
/* rounded slab w*h*d centred at origin; uv from x,y; aFace 1 = front half (+z), 2 = back half. mode 'card' bakes front|back halves into u. */
function slabGeo(w, h, d, r, b, seg, mode) {
  return gq('slab' + [w, h, d, r, b, seg, mode].join('_'), function () {
    var g = new THREE.ExtrudeGeometry(rrShape(w - 2 * b, h - 2 * b, Math.max(.01, r - b)), { depth: Math.max(.002, d - 2 * b), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: seg || 3, curveSegments: 5, steps: 2 });
    g.translate(0, 0, -(d - 2 * b) / 2); g.clearGroups();
    var p = g.attributes.position, n = p.count, uv = new Float32Array(n * 2), face = new Float32Array(n);
    for (var t = 0; t < n; t += 3) { var cz = (p.getZ(t) + p.getZ(t + 1) + p.getZ(t + 2)) / 3; var f = cz >= 0 ? 1 : 2; for (var j = 0; j < 3; j++) { var i = t + j; var u = clamp(p.getX(i) / w + .5, 0, 1), v = clamp(p.getY(i) / h + .5, 0, 1); if (mode === 'card') { u = f === 1 ? u * .5 : .5 + (1 - u) * .5; u = clamp(u, .002, .998); } uv[2 * i] = u; uv[2 * i + 1] = v; face[i] = f; } }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setAttribute('aFace', new THREE.BufferAttribute(face, 1));
    smoothNormals(g, .55); g.computeBoundingBox(); g.computeBoundingSphere(); return g;
  });
}
function chipGeo(r, h) {
  return gq('chip' + r + '_' + h, function () { var pts = [], e = Math.min(h * .35, r * .25); pts.push(new THREE.Vector2(0, 0)); for (var i = 0; i <= 4; i++) { var a = -Math.PI / 2 + i / 4 * Math.PI / 2; pts.push(new THREE.Vector2(r - e + Math.cos(a) * e, e + Math.sin(a) * e)); } for (var j = 0; j <= 4; j++) { var b = j / 4 * Math.PI / 2; pts.push(new THREE.Vector2(r - e + Math.cos(b) * e, h - e + Math.sin(b) * e)); } pts.push(new THREE.Vector2(0, h)); var g = new THREE.LatheGeometry(pts, 22); return g; });
}
function standGeo(len) {
  return gq('stand' + len.toFixed(3), function () {
    var P = [[-0.45, 0], [2.45, 0], [2.45, .34], [2.1, .34], [2.1, .22], [0.45, .22], [0.45, .72], [0.17, .72], [0.17, .36], [-0.17, .36], [-0.17, .72], [-0.45, .72]];
    var s = new THREE.Shape(); for (var i = 0; i < P.length; i++) { if (i) s.lineTo(P[i][0], P[i][1]); else s.moveTo(P[i][0], P[i][1]); } s.closePath();
    var g = new THREE.ExtrudeGeometry(s, { depth: len - 2 * SB, bevelEnabled: true, bevelThickness: SB, bevelSize: SB, bevelSegments: 2, curveSegments: 4 });
    g.clearGroups(); g.rotateY(Math.PI / 2); g.translate(-(len - 2 * SB) / 2, SB, 0);
    // after rotateY(+90): shape x(u) -> world -z ; we want +u = +z, so mirror z (and fix winding)
    var p = g.attributes.position; for (var k = 0; k < p.count; k++) p.setZ(k, -p.getZ(k));
    var idx = p.array; for (var t = 0; t < p.count; t += 3) { for (var c = 0; c < 3; c++) { var tmp = idx[(t + 1) * 3 + c]; idx[(t + 1) * 3 + c] = idx[(t + 2) * 3 + c]; idx[(t + 2) * 3 + c] = tmp; } }
    p.needsUpdate = true; smoothNormals(g, .6);
    var col = new Float32Array(p.count * 3);
    for (var q = 0; q < p.count; q += 3) { var cy = (p.getY(q) + p.getY(q + 1) + p.getY(q + 2)) / 3, cz = (p.getZ(q) + p.getZ(q + 1) + p.getZ(q + 2)) / 3; var rail = cz < .5 && cy > .3, lip = cz > 2.05 && cy > .3; var v = rail || lip ? 1 : .0; for (var j = 0; j < 3; j++) { col[(q + j) * 3] = v; col[(q + j) * 3 + 1] = v; col[(q + j) * 3 + 2] = v; } }
    g.setAttribute('aTone', new THREE.BufferAttribute(col, 3));
    g.computeBoundingBox(); g.computeBoundingSphere(); return g;
  });
}

/* ------------------------------------------------------------------ materials */
function stdMat(o) { var M = new THREE.MeshStandardMaterial(o); return M; }
function tileMaterial() {
  var phys = GFX[K.q].phys;
  var M = phys ? new THREE.MeshPhysicalMaterial({ clearcoat: .6, clearcoatRoughness: .22 }) : new THREE.MeshStandardMaterial();
  M.map = atlasTex(); M.roughness = .36; M.metalness = 0; M.envMapIntensity = 1.0;
  var back = cellUV(CELL_BACK);
  M.onBeforeCompile = function (sh) {
    sh.uniforms.uCell = { value: new THREE.Vector2(1 / AT.cols, 1 / AT.rows) }; sh.uniforms.uBack = { value: new THREE.Vector2(back[0], back[1]) };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec2 aCell;\nattribute float aFace;\nuniform vec2 uCell;\nuniform vec2 uBack;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\n#ifdef USE_MAP\n{ vec2 cu = clamp(uv, vec2(.004), vec2(.996)); vMapUv = aFace > 1.5 ? uBack + vec2(1. - cu.x, cu.y) * uCell : aCell + cu * uCell; }\n#endif');
  };
  M.customProgramCacheKey = function () { return 'sftile' + (phys ? 1 : 0); };
  return M;
}
function hullMat(color, op, add) {
  return new THREE.ShaderMaterial({
    uniforms: { uScale: { value: new THREE.Vector3(1, 1, 1) }, uCol: { value: new THREE.Color(color) }, uOp: { value: op == null ? 1 : op } },
    vertexShader: 'uniform vec3 uScale;\nvoid main(){ vec3 p = position * uScale;\n#ifdef USE_INSTANCING\n vec4 w = modelMatrix * instanceMatrix * vec4(p,1.);\n#else\n vec4 w = modelMatrix * vec4(p,1.);\n#endif\n gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: 'uniform vec3 uCol; uniform float uOp; void main(){ gl_FragColor = vec4(uCol, uOp); }',
    side: THREE.BackSide, transparent: op != null && op < 1, depthWrite: !(op != null && op < 1), blending: add ? THREE.AdditiveBlending : THREE.NormalBlending
  });
}
function standMaterial(col) {
  var base = new THREE.Color(col), shelf = new THREE.Color(col).lerp(new THREE.Color('#fff4dc'), .62);
  var M = stdMat({ color: 0xffffff, roughness: .4, metalness: 0, envMapIntensity: .9 });
  M.onBeforeCompile = function (sh) {
    sh.uniforms.uA = { value: shelf }; sh.uniforms.uB = { value: base };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec3 aTone;\nvarying float vTone;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvTone = aTone.x;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vTone;\nuniform vec3 uA;\nuniform vec3 uB;').replace('vec4 diffuseColor = vec4( diffuse, opacity );', 'vec4 diffuseColor = vec4( mix(uA, uB, vTone) * diffuse, opacity );');
  };
  M.customProgramCacheKey = function () { return 'sfstand'; };
  return M;
}

/* ------------------------------------------------------------------ init */
SFKit.init = function (canvas, opts) {
  opts = opts || {};
  K.opts = opts; K.canvas = canvas;
  if (opts.fallback) K.fallback = opts.fallback;
  injectFonts(opts);
  try { var v = localStorage.getItem('sf_gfx'); if (v && (GFX[v] || v === 'auto')) K.pref = v; } catch (e) {}
  if (opts.quality) K.pref = opts.quality;
  if (!hasGL() || opts.force2D) { K.mode = '2d'; K.on = false; if (K.fallback) render2DAuto(); return { ok: false, mode: '2d' }; }
  try { setup3D(canvas, opts); } catch (e) { if (global.console) console.warn('SFKit 3D init failed, using 2D', e); K.mode = '2d'; K.on = false; if (K.fallback) render2DAuto(); return { ok: false, mode: '2d', error: String(e) }; }
  return { ok: true, mode: '3d', quality: K.q };
};
function autoQ() { var small = false; try { small = Math.min(innerWidth, innerHeight) < 600 || (matchMedia('(pointer:coarse)').matches && Math.max(innerWidth, innerHeight) < 1300); } catch (e) {} return small ? 'medium' : 'high'; }
function injectFonts(opts) {
  if (opts.fonts === false || typeof document === 'undefined') return;
  try {
    if (!document.querySelector('link[data-sf-fonts]')) { var l = document.createElement('link'); l.rel = 'stylesheet'; l.setAttribute('data-sf-fonts', '1'); l.href = 'https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito:wght@700;800;900&display=swap'; document.head.appendChild(l); }
  } catch (e) {}
  var done = false;
  SFKit.ready = new Promise(function (res) {
    var fin = function () { if (done) return; done = true; if (K.on) repaintAll(); if (K.mode === '2d' && K.fallback) render2DAuto(); res(); };
    try { Promise.all([document.fonts.load("64px 'Lilita One'"), document.fonts.load("800 32px 'Nunito'")]).then(function () { setTimeout(fin, 30); }, fin); } catch (e) { fin(); }
    setTimeout(fin, opts.fontTimeout || 3500);
  });
}
SFKit.ready = Promise.resolve();

function setup3D(canvas, opts) {
  var q = K.pref === 'auto' ? autoQ() : K.pref; K.q = GFX[q] ? q : 'high';
  var r = new THREE.WebGLRenderer({ canvas: canvas, antialias: K.q !== 'low', alpha: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.preserveDrawingBuffer });
  K.r = r; K.aniso = Math.min(8, r.capabilities.getMaxAnisotropy());
  r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  var sc = K.scene = new THREE.Scene();
  K.cam = new THREE.PerspectiveCamera(36, 1.6, .5, 400);
  K.camState = { look: new THREE.Vector3(), pos: new THREE.Vector3(0, 30, 30), to: null };
  K.ray = new THREE.Raycaster();
  sc.background = bgTex(); sc.fog = new THREE.Fog(0xf4d7a8, 70, 160);
  K.env = envMap(r); sc.environment = K.env;
  // lights
  K.hemi = new THREE.HemisphereLight(0xe6f0ff, 0xb07b4c, .85); sc.add(K.hemi);
  K.key = new THREE.DirectionalLight(0xfff0d8, 2.6); K.key.position.set(-14, 30, 16); K.key.castShadow = true; K.key.shadow.bias = -.0004; K.key.shadow.normalBias = .03; sc.add(K.key); sc.add(K.key.target);
  K.rim = new THREE.DirectionalLight(0xa9c8ff, 1.1); K.rim.position.set(12, 14, -26); sc.add(K.rim);
  K.fill = new THREE.DirectionalLight(0xffd2a8, .45); K.fill.position.set(20, 10, 18); sc.add(K.fill);
  // groups
  K.gTable = new THREE.Group(); K.gBoard = new THREE.Group(); K.gStands = new THREE.Group(); K.gTok = new THREE.Group(); K.gCards = new THREE.Group(); K.gFx = new THREE.Group(); K.gGlow = new THREE.Group();
  sc.add(K.gTable, K.gBoard, K.gStands, K.gTok, K.gCards, K.gFx, K.gGlow);
  buildTiles(); buildDial(); buildParticles(); buildConfetti(); buildOverlay(canvas);
  K.on = true; K.mode = '3d';
  applyQ(K.q, true);
  var w = canvas.clientWidth || canvas.width || 800, h = canvas.clientHeight || canvas.height || 600;
  if (opts.width) { w = opts.width; h = opts.height; }
  K.w = w; K.h = h; resizeInternal(w, h);
  relayout(true);
  K.loopOn = true; requestAnimationFrame(loop);
}
function applyQ(q, first) {
  K.q = q; var c = GFX[q], r = K.r; if (!r) return;
  r.setPixelRatio(Math.min(global.devicePixelRatio || 1, c.dpr));
  r.shadowMap.enabled = c.shadows; K.key.castShadow = c.shadows;
  if (c.shadows) { K.key.shadow.mapSize.set(c.map, c.map); if (K.key.shadow.map) { K.key.shadow.map.dispose(); K.key.shadow.map = null; } }
  if (c.post && !K.post) K.post = makePost();
  if (K.tileMesh && !first) { K.tileMesh.material.dispose(); K.tileMesh.material = tileMaterial(); }
  if (K.olMesh) K.olMesh.visible = c.outline;
  if (K.scene) K.scene.traverse(function (o) { if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { m.needsUpdate = true; }); } });
  if (K.w) resizeInternal(K.w, K.h);
  K.dirty = true;
}
SFKit.setQuality = function (q) { K.pref = (GFX[q] || q === 'auto') ? q : 'auto'; try { localStorage.setItem('sf_gfx', K.pref); } catch (e) {} if (K.on) applyQ(K.pref === 'auto' ? autoQ() : K.pref); return K.q; };
SFKit.getQuality = function () { return { pref: K.pref, active: K.q }; };

function bgTex() {
  return ptex('bg', 512, 512, function (x, w, h) {
    var g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ffd99a'); g.addColorStop(.55, '#ffb877'); g.addColorStop(1, '#e98a5a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    var r = x.createRadialGradient(w / 2, h * .35, 20, w / 2, h * .45, w * .75); r.addColorStop(0, 'rgba(255,248,225,.75)'); r.addColorStop(1, 'rgba(255,248,225,0)'); x.fillStyle = r; x.fillRect(0, 0, w, h);
    dots(x, 0, 0, w, h, 18, 3.2, 'rgba(160,70,30,.10)');
  });
}
function envMap(r) {
  var s = new THREE.Scene(); var g = new THREE.SphereGeometry(20, 48, 24); var pos = g.attributes.position, col = new Float32Array(pos.count * 3);
  var top = new THREE.Color('#9cc3ff'), hor = new THREE.Color('#ffe2b8'), bot = new THREE.Color('#7a4a2a'), c = new THREE.Color();
  for (var i = 0; i < pos.count; i++) { var y = pos.getY(i) / 20; if (y > 0) c.copy(hor).lerp(top, Math.pow(y, .6)); else c.copy(hor).lerp(bot, Math.min(1, -y * 3)); c.toArray(col, i * 3); }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3)); s.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  var box = function (x, y, z, w, h, k, ry) { var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k * .97, k * .9), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); };
  box(-8, 15, 8, 12, 8, 6); box(10, 10, -10, 8, 5, 2.4); box(0, 4, 18, 18, 3, 1.6);
  var pm = new THREE.PMREMGenerator(r); var rt = pm.fromScene(s, .025); pm.dispose(); return rt.texture;
}
/* post: MSAA HDR target -> bright pass -> blur -> ACES + grade + vignette (High only) */
function makePost() {
  var r = K.r, P = {}; var mk = function () { return new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, depthBuffer: false }); };
  P.rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: r.capabilities.isWebGL2 ? 4 : 0 }); P.a = mk(); P.b = mk();
  P.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); P.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)); P.quad.frustumCulled = false; P.sc = new THREE.Scene(); P.sc.add(P.quad);
  var vs = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
  var sm = function (u, f) { return new THREE.ShaderMaterial({ uniforms: u, vertexShader: vs, fragmentShader: f, depthTest: false, depthWrite: false }); };
  P.bright = sm({ t: { value: null }, th: { value: 1.15 } }, 'uniform sampler2D t;uniform float th;varying vec2 vUv;void main(){vec3 c=texture2D(t,vUv).rgb;float l=max(c.r,max(c.g,c.b));gl_FragColor=vec4(c*smoothstep(th,th*2.4,l),1.);}');
  P.blur = sm({ t: { value: null }, d: { value: new THREE.Vector2() } }, 'uniform sampler2D t;uniform vec2 d;varying vec2 vUv;void main(){vec3 c=texture2D(t,vUv).rgb*.2270;c+=(texture2D(t,vUv+d*1.3846).rgb+texture2D(t,vUv-d*1.3846).rgb)*.3162;c+=(texture2D(t,vUv+d*3.2308).rgb+texture2D(t,vUv-d*3.2308).rgb)*.0703;gl_FragColor=vec4(c,1.);}');
  P.fin = sm({ t: { value: null }, b: { value: null }, ex: { value: 1 }, bk: { value: .42 }, asp: { value: 1 }, fl: { value: 0 } }, [
    'uniform sampler2D t,b;uniform float ex,bk,asp,fl;varying vec2 vUv;',
    'vec3 RRT(vec3 v){vec3 a=v*(v+.0245786)-.000090537;vec3 q=v*(.983729*v+.4329510)+.238081;return a/q;}',
    'vec3 aces(vec3 c){const mat3 I=mat3(vec3(.59719,.07600,.02840),vec3(.35458,.90834,.13383),vec3(.04823,.01566,.83777));const mat3 O=mat3(vec3(1.60475,-.10208,-.00327),vec3(-.53108,1.10813,-.07276),vec3(-.07367,-.00605,1.07602));c*=ex/.6;c=I*c;c=RRT(c);c=O*c;return clamp(c,0.,1.);}',
    'vec3 srgb(vec3 c){return mix(pow(c,vec3(.41666))*1.055-.055,c*12.92,vec3(lessThanEqual(c,vec3(.0031308))));}',
    'void main(){vec3 c=texture2D(t,vUv).rgb+texture2D(b,vUv).rgb*bk;c=aces(c);',
    ' float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,1.18);c*=vec3(1.02,1.,.97);c=mix(c,c*c*(3.-2.*c),.14);',
    ' vec2 q=(vUv-.5)*vec2(asp,1.);float v=smoothstep(1.05,.35,length(q)*1.02);c*=mix(.78,1.,v);c=mix(c,vec3(1.,.97,.85),fl);',
    ' gl_FragColor=vec4(srgb(clamp(c,0.,1.)),1.);}'].join('\n'));
  P.setSize = function (w, h) { P.rt.setSize(w, h); var hw = Math.max(2, w >> 1), hh = Math.max(2, h >> 1); P.a.setSize(hw, hh); P.b.setSize(hw, hh); P.fin.uniforms.asp.value = w / h; };
  P.pass = function (m, to) { P.quad.material = m; r.setRenderTarget(to); r.render(P.sc, P.cam); };
  P.render = function () {
    r.setRenderTarget(P.rt); r.render(K.scene, K.cam);
    P.bright.uniforms.t.value = P.rt.texture; P.pass(P.bright, P.a);
    var hw = 1 / P.a.width, hh = 1 / P.a.height, ks = [1, 2.4];
    for (var i = 0; i < ks.length; i++) { P.blur.uniforms.t.value = P.a.texture; P.blur.uniforms.d.value.set(hw * ks[i], 0); P.pass(P.blur, P.b); P.blur.uniforms.t.value = P.b.texture; P.blur.uniforms.d.value.set(0, hh * ks[i]); P.pass(P.blur, P.a); }
    P.fin.uniforms.t.value = P.rt.texture; P.fin.uniforms.b.value = P.a.texture; P.fin.uniforms.ex.value = r.toneMappingExposure; P.fin.uniforms.fl.value = K.flash || 0; P.pass(P.fin, null);
  };
  return P;
}

/* ------------------------------------------------------------------ layout */
function standsOf(seat) {
  var out = []; for (var k in K.st.stands) { var a = k.split(':'); if (+a[0] === seat) out.push({ idx: +a[1], key: k, slots: K.st.stands[k].length }); }
  out.sort(function (a, b) { return a.idx - b.idx; }); return out;
}
function boardLayout(mode) {
  if (mode === 'ring') return { W: 17.4, D: 11.6, track: { x0: -2.75, x1: 7.45, z: -3.95, r: .37 }, dial: { x: -6.05, z: -2.45, s: 1.55 }, mission: { x: -6.1, z: 2.85, w: 2.3, h: 3.1 }, extras: { x0: -2.9, x1: 7.6, z: -1.15, h: 1.6 }, equip: { x0: -2.9, x1: 7.6, z: 3.1, w: 1.75, h: 2.55 }, oxy: { x: -6.1, z: .15 } };
  return { W: 12, D: 14.5, track: { x0: -5.0, x1: 5.0, z: -1.05, r: .36 }, dial: { x: -3.35, z: -4.6, s: 1.3 }, mission: { x: 3.4, z: -4.3, w: 2.3, h: 3.1 }, extras: { x0: -5.2, x1: 5.2, z: 1.75, h: 1.6 }, equip: { x0: -5.2, x1: 5.2, z: 4.95, w: 1.75, h: 2.55 }, oxy: { x: .2, z: -5.6 } };
}
function obb(cx, cz, hx, hz, rot) { return { cx: cx, cz: cz, hx: hx, hz: hz, c: Math.cos(rot), s: Math.sin(rot) }; }
function obbHit(a, b, m) {
  var ax = [[a.c, -a.s], [a.s, a.c], [b.c, -b.s], [b.s, b.c]]; var dx = b.cx - a.cx, dz = b.cz - a.cz;
  for (var i = 0; i < 4; i++) { var L = ax[i]; var ra = a.hx * Math.abs(L[0] * a.c + L[1] * -a.s) + a.hz * Math.abs(L[0] * a.s + L[1] * a.c); var rb = b.hx * Math.abs(L[0] * b.c + L[1] * -b.s) + b.hz * Math.abs(L[0] * b.s + L[1] * b.c); if (Math.abs(dx * L[0] + dz * L[1]) > ra + rb + (m || 0)) return false; }
  return true;
}
function rowLen(m) { return Math.max(m, 3) * PITCH + .5; }
function m4(px, pz, rot, s, py) { var M = new THREE.Matrix4(); M.compose(new THREE.Vector3(px, py || 0, pz), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rot), new THREE.Vector3(s, s, s)); return M; }
function computeLayout() {
  var st = K.st, n = st.n, my = st.my, aspect = (K.w || 16) / (K.h || 9);
  var mode = aspect < .82 ? 'column' : 'ring'; var BL = boardLayout(mode);
  var seats = [];
  for (var s = 0; s < n; s++) {
    var rel = (s - my + n) % n, mine = rel === 0, sts = standsOf(s), rows = [];
    for (var i = 0; i < sts.length; i++) {
      var m = Math.max(1, sts[i].slots), per = m;
      if (mode === 'column' && mine && m > 10) per = Math.ceil(m / Math.ceil(m / 9));
      for (var a = 0; a < m; a += per) rows.push({ seat: s, stand: sts[i].idx, key: sts[i].key, from: a, to: Math.min(m, a + per), m: Math.min(m, a + per) - a });
      if (!sts[i].slots) rows[rows.length - 1].m = 0;
    }
    var oppS = 1; if (mode === 'column' && !mine) { var ml = 0; rows.forEach(function (r) { ml = Math.max(ml, rowLen(r.m)); }); oppS = clamp((BL.W + .4) / (ml + 2.6), .5, .8); }
    seats.push({ seat: s, rel: rel, mine: mine, rows: rows, scale: oppS, gap: mine ? (mode === 'column' ? 1.05 : .9) : .35 });
  }
  var L = { mode: mode, BL: BL, seats: seats };
  if (mode === 'ring') {
    var radii = seats.map(function () { return 3; });
    for (var it = 0; it < 400; it++) { var lay = placeRing(seats, radii, n, BL); if (!lay.hit) break; lay.push.forEach(function (v, i) { radii[i] += v; }); }
    L.radii = radii;
  } else placeColumn(seats, BL);
  // table extents
  var x0 = -BL.W / 2, x1 = BL.W / 2, z0 = -BL.D / 2, z1 = BL.D / 2;
  seats.forEach(function (S) { S.foot.forEach(function (f) { var ex = Math.abs(f.c) * f.hx + Math.abs(f.s) * f.hz, ez = Math.abs(f.s) * f.hx + Math.abs(f.c) * f.hz; x0 = Math.min(x0, f.cx - ex); x1 = Math.max(x1, f.cx + ex); z0 = Math.min(z0, f.cz - ez); z1 = Math.max(z1, f.cz + ez); }); });
  L.box = { x0: x0, x1: x1, z0: z0, z1: z1 };
  var mg = mode === 'ring' ? 1.6 : 1.0; L.table = { x0: x0 - mg, x1: x1 + mg, z0: z0 - mg, z1: z1 + mg };
  return L;
}
function needAux(seat) { var T = K.st.tokens || {}, M = K.st.mission || {}; var ox = T.oxygen && ((T.oxygen.perSeat || T.oxygen.seats || {})[seat] != null); var con = (M.constraints || []).some(function (c) { return c.seat === seat; }); return !!(ox || con); }
function auxSig() { var o = []; for (var s = 0; s < K.st.n; s++) o.push(needAux(s) ? 1 : 0); return o.join(''); }
function placeRing(seats, radii, n, BL) {
  var hit = false, push = seats.map(function () { return 0; });
  seats.forEach(function (S, si) { var R = radii[si];
    var th = Math.PI / 2 + S.rel * 2 * Math.PI / n, dx = Math.cos(th), dz = Math.sin(th);
    var cx = S.mine ? dx : -dx, cz = S.mine ? dz : -dz, rot = Math.atan2(cx, cz), sc = S.scale;
    S.foot = []; S.dir = [dx, dz]; S.rot = rot; var maxLen = 0;
    var nr = S.rows.length;
    S.rows.forEach(function (row, i) {
      var j = S.mine ? (nr - 1 - i) : i; var len = rowLen(row.m); maxLen = Math.max(maxLen, len);
      var rail = R - j * (RDEPTH * sc + S.gap) - (S.mine ? U1 * sc : -U0 * sc);
      row.px = dx * rail; row.pz = dz * rail; row.rot = rot; row.s = sc; row.len = len; row.mine = S.mine;
      row.M = m4(row.px, row.pz, rot, sc);
      var uc = (U0 + U1) / 2 * sc; S.foot.push(obb(row.px + cx * uc, row.pz + cz * uc, len * sc / 2, RDEPTH * sc / 2, rot));
    });
    if (!nr) { var rail0 = R - 1.5; S.rows0 = { px: dx * rail0, pz: dz * rail0 }; }
    // character card + sign at the ends of the outer row
    var outer = S.rows.length ? S.rows[S.mine ? nr - 1 : 0] : { px: dx * (R - 1.5), pz: dz * (R - 1.5), len: 6, s: sc, rot: rot };
    var ax = Math.cos(rot), az = -Math.sin(rot);             // row +x in world
    var side = S.mine ? 1 : -1, half = (outer.len * outer.s) / 2;
    var cu = 1.0 * sc;
    S.charPos = [outer.px + ax * side * (half + 1.05 * sc) + cx * cu, outer.pz + az * side * (half + 1.05 * sc) + cz * cu];
    S.signPos = [outer.px - ax * side * (half + .75 * sc) + cx * .1, outer.pz - az * side * (half + .75 * sc) + cz * .1];
    S.foot.push(obb(S.charPos[0], S.charPos[1], .85 * sc, 1.2 * sc, 0));
    S.foot.push(obb(S.signPos[0], S.signPos[1], .55 * sc, .35 * sc, rot));
    S.auxDir = [ax * side, az * side]; S.auxPos = [S.charPos[0] + ax * side * 1.75 * sc, S.charPos[1] + az * side * 1.75 * sc]; if (needAux(S.seat)) S.foot.push(obb(S.auxPos[0], S.auxPos[1], .9 * sc, 1.1 * sc, 0));
    S.scaleCards = sc;
  });
  var board = obb(0, -.7, BL.W / 2 + .3, BL.D / 2 + 1.0, 0);
  for (var a = 0; a < seats.length; a++) {
    for (var f = 0; f < seats[a].foot.length; f++) {
      if (obbHit(seats[a].foot[f], board, .15)) { hit = true; push[a] = .25; }
      for (var b = a + 1; b < seats.length; b++) for (var g = 0; g < seats[b].foot.length; g++) if (obbHit(seats[a].foot[f], seats[b].foot[g], .3)) { hit = true; push[a] = Math.max(push[a], .2); push[b] = Math.max(push[b], .2); }
    }
  }
  return { hit: hit, push: push };
}
function placeColumn(seats, BL) {
  var opp = seats.filter(function (S) { return !S.mine; }).sort(function (a, b) { return b.rel - a.rel; });
  var cur = -BL.D / 2 - .6;
  // opponents stacked above the board; seat with lowest rel ends nearest the board
  for (var i = opp.length - 1; i >= 0; i--) {
    var S = opp[i], sc = S.scale; S.foot = []; S.rot = 0;
    for (var r = S.rows.length - 1; r >= 0; r--) {
      var row = S.rows[r], len = rowLen(row.m); var rail = cur - U1 * sc; row.px = 0; row.pz = rail; row.rot = 0; row.s = sc; row.len = len; row.mine = false; row.M = m4(0, rail, 0, sc);
      S.foot.push(obb(0, rail + (U0 + U1) / 2 * sc, len * sc / 2, RDEPTH * sc / 2, 0)); cur = rail + U0 * sc - .3;
    }
    if (!S.rows.length) { S.foot.push(obb(0, cur - .8, 3, .8, 0)); cur -= 1.9; }
    var outer = S.rows[0] || { pz: cur + 1, len: 6 }; var half = rowLen(outer.m || 3) * sc / 2;
    S.charPos = [half + .75, outer.pz + .55 * sc]; S.signPos = [-half - .62, outer.pz + .1];
    S.foot.push(obb(S.charPos[0], S.charPos[1], .5, .7, 0)); S.foot.push(obb(S.signPos[0], S.signPos[1], .5, .25, 0));
    S.auxPos = [S.charPos[0] + 1.05, S.charPos[1]]; if (needAux(S.seat)) S.foot.push(obb(S.auxPos[0], S.auxPos[1], .55, .7, 0));
    S.scaleCards = sc; cur -= .25;
  }
  var me = seats.filter(function (S) { return S.mine; })[0];
  if (me) {
    var c2 = BL.D / 2 + .5; me.foot = []; me.rot = 0; var maxHalf = 3;
    me.rows.forEach(function (row) { var len = rowLen(row.m); var rail = c2 - U0; row.px = 0; row.pz = rail; row.rot = 0; row.s = 1; row.len = len; row.mine = true; row.M = m4(0, rail, 0, 1); me.foot.push(obb(0, rail + (U0 + U1) / 2, len / 2, RDEPTH / 2, 0)); c2 = rail + U1 + me.gap; maxHalf = Math.max(maxHalf, len / 2); });
    var last = me.rows[me.rows.length - 1] || { pz: c2 + 1 };
    var lh = rowLen(last.m || 3) / 2; me.charPos = [lh + 1.0, last.pz + .9]; me.signPos = [-lh - .95, last.pz + .7];
    me.foot.push(obb(me.charPos[0], me.charPos[1], .85, 1.2, 0)); me.foot.push(obb(me.signPos[0], me.signPos[1], .6, .3, 0));
    me.auxPos = [me.charPos[0], me.charPos[1] + 2.4]; if (needAux(me.seat)) me.foot.push(obb(me.auxPos[0], me.auxPos[1], .9, 1.0, 0));
    me.scaleCards = 1;
  }
}

/* world pose of a tile slot */
var _q1 = null, _q2 = null, _v1 = null;
function rowOf(key, slot) { for (var i = 0; i < K.rows.length; i++) { var r = K.rows[i]; if (r.key === key && slot >= r.from && slot < r.to) return r; } return null; }
function slotX(row, k) { var c = (k - (row.m - 1) / 2) * PITCH; return row.mine ? c : -c; }
function tilePose(rec) {
  var row = rowOf(rec.key, rec.slot); var P = new THREE.Vector3(), Q = new THREE.Quaternion(), S = new THREE.Vector3(1, 1, 1);
  if (!row) { P.set(0, -5, 0); S.set(.001, .001, .001); return { p: P, q: Q, s: S }; }
  var k = rec.slot - row.from, x = slotX(row, k), t = rec.data;
  var faceCam = row.mine || (t.known && !row.mine);
  if (t.cut) {
    P.set(x, SHELF_Y + TD / 2 + .005, U0 + 1.0 + .3 + .05);
    P.z = .45 + SB + .06 + TH / 2;
    Q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  } else {
    var lean = faceCam ? -LEAN : LEAN;
    var ql = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), faceCam ? -LEAN_ME : -LEAN);
    if (!faceCam) Q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI).multiply(ql); else Q.copy(ql);
    var up = new THREE.Vector3(0, TH / 2, 0).applyQuaternion(Q);
    P.set(x, SLOT_Y, 0).add(up); P.y += (rec.lift || 0);
  }
  // to world
  var RQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), row.rot);
  P.multiplyScalar(row.s).applyQuaternion(RQ).add(new THREE.Vector3(row.px, 0, row.pz));
  Q.premultiply(RQ); S.multiplyScalar(row.s);
  if (t.cut) { // flat tiles read from the camera: no yaw in column mode; in ring mode keep row yaw
    if (K.layout && K.layout.mode === 'column') Q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
  }
  return { p: P, q: Q, s: S, row: row, x: x };
}
function rowLocal(row, x, y, u) { var v = new THREE.Vector3(x, y, u).multiplyScalar(row.s); v.applyAxisAngle(new THREE.Vector3(0, 1, 0), row.rot); v.x += row.px; v.z += row.pz; return v; }

/* ------------------------------------------------------------------ relayout (stands, board, table, camera) */
function relayout(instant) {
  if (!K.on) return;
  K.auxSig = auxSig(); var L = K.layout = computeLayout(); var prevMode = K.lastMode; K.lastMode = L.mode;
  // rows
  K.rows.forEach(function (r) { if (r.obj) K.gStands.remove(r.obj); });
  K.rows = [];
  L.seats.forEach(function (S) { S.rows.forEach(function (row) { K.rows.push(row); row.obj = makeRow(row, S); K.gStands.add(row.obj); }); });
  buildSeatBits(L);
  if (!K.boardMode || K.boardMode !== L.mode) buildBoard(L);
  buildTable(L);
  placeDial(L);
  // tiles to their poses
  for (var id in K.recs) { var rec = K.recs[id]; if (rec.key === '__gone' || rec.pending) continue; var tp = tilePose(rec); if (instant || K.first) { rec.p.copy(tp.p); rec.q.copy(tp.q); rec.s.copy(tp.s); } else moveTo(rec, tp, .45); }
  syncTileTokens(true); syncTokens(true); syncCards(true); syncMissionCards(true); syncCharacters(true);
  fitCamera(instant || K.first || prevMode !== L.mode);
  writeTiles(); refreshHighlight(); K.dirty = true;
}
function makeRow(row, S) {
  var g = new THREE.Group(); g.matrixAutoUpdate = false; g.matrix.copy(row.M); g.matrixWorldNeedsUpdate = true;
  var col = SEATC[row.seat % SEATC.length];
  var mat = K.standMats && K.standMats[row.seat] || ((K.standMats = K.standMats || {})[row.seat] = standMaterial(col));
  var mesh = new THREE.Mesh(standGeo(row.len), mat); mesh.castShadow = true; mesh.receiveShadow = true;
  mesh.userData.pick = { kind: 'stand', seat: row.seat, stand: row.stand };
  g.add(mesh); row.mesh = mesh;
  // contact blob
  var blob = new THREE.Mesh(gq('blobPlane', function () { var p = new THREE.PlaneGeometry(1, 1); p.rotateX(-Math.PI / 2); return p; }), gq('blobMat', function () { return new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, opacity: .8 }); }));
  blob.scale.set(row.len + .9, 1, RDEPTH + .9); blob.position.set(0, .012, (U0 + U1) / 2); blob.renderOrder = -1; g.add(blob);
  // slot letters on the lip
  if (row.m && (!K.opts || K.opts.slotLetters !== false)) {
    var letters = []; for (var k = 0; k < row.m; k++) letters.push(String.fromCharCode(65 + row.from + k));
    var key = 'lip:' + row.m + ':' + row.from + ':' + (row.mine ? 1 : 0);
    var t = ptex(key, row.m * 64, 64, function (x, w, h) { x.textAlign = 'center'; x.textBaseline = 'middle'; font(x, 46, true); for (var i = 0; i < row.m; i++) { var cxp = row.mine ? (i + .5) * 64 : w - (i + .5) * 64; otext(x, letters[i], cxp, 34, '#ffffff', INK, 9); } });
    var pl = new THREE.Mesh(new THREE.PlaneGeometry(row.m * PITCH, .36), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: .5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    pl.rotation.x = -Math.PI / 2; pl.position.set(0, LIP_Y + .004, 2.28);
    // the letter canvas was laid out at 64px per slot = PITCH world units
    g.add(pl);
  }
  return g;
}

/* seat signs, turn glow */
function signTex(seat) {
  var name = (K.st.names[seat] || ('Crew ' + (seat + 1))); var col = SEATC[seat % SEATC.length]; var me = seat === K.st.my, cap = K.st.captain === seat;
  return ptex('sign:' + seat + ':' + name + ':' + (me ? 1 : 0) + ':' + (cap ? 1 : 0), 640, 256, function (x, W, h) {
    var w = W / 2;
    for (var f = 0; f < 2; f++) {
      x.save(); x.translate(f * w, 0);
      x.fillStyle = INK; x.fillRect(0, 0, w, h); rr(x, 14, 14, w - 28, h - 28, 46); var g = x.createLinearGradient(0, 14, 0, h); g.addColorStop(0, col); g.addColorStop(1, new THREE.Color(col).multiplyScalar(.7).getStyle()); x.fillStyle = g; x.fill();
      x.fillStyle = 'rgba(255,255,255,.25)'; x.beginPath(); x.ellipse(w / 2, 40, w * .4, 22, 0, 0, 7); x.fill();
      if (f === 0) { x.textAlign = 'center'; x.textBaseline = 'middle'; var label = me ? 'YOU' : name.toUpperCase(); fitFont(x, label, w - (cap ? 110 : 50), 110, true); otext(x, label, w / 2 + (cap ? 30 : 0), h / 2 + 4, '#ffffff', INK, 16); if (cap) star(x, 58, h / 2, 40, 17, 5, '#ffd84a', INK, 7); }
      x.restore();
    }
  });
}
function buildSeatBits(L) {
  (K.seatBits || []).forEach(function (o) { K.gStands.remove(o); }); K.seatBits = [];
  L.seats.forEach(function (S) {
    var g = new THREE.Group(); var sc = S.mine ? 1 : S.scale;
    var post = new THREE.Mesh(gq('signPost', function () { return new THREE.CylinderGeometry(.07, .09, 1.6, 10); }), gq('postMat', function () { return stdMat({ color: 0xd9dbe8, metalness: .8, roughness: .3 }); })); post.position.y = .8; post.castShadow = true;
    var base = new THREE.Mesh(chipGeo(.32, .16), gq('signBase', function () { return stdMat({ color: 0x2a2550, roughness: .5 }); })); base.castShadow = true;
    var board = new THREE.Mesh(slabGeo(1.7, .68, .1, .2, .03, 2, 'card'), new THREE.MeshStandardMaterial({ map: signTex(S.seat), roughness: .45 })); board.position.y = 1.75; board.castShadow = true;
    board.userData.pick = { kind: 'seat', seat: S.seat };
    g.add(post, base, board); g.scale.setScalar(sc); g.position.set(S.signPos[0], 0, S.signPos[1]);
    // face the camera (yaw only)
    g.rotation.y = 0; g.userData.board = board; g.userData.seat = S.seat;
    K.gStands.add(g); K.seatBits.push(g); S.sign = g;
  });
}
function signCardTex(seat) { var face = signTex(seat); var key = 'signc:' + face.uuid; return ptex(key, 640, 128, function (x, w, h) { var src = K.texc[Object.keys(K.texc).filter(function (k) { return K.texc[k].t === face; })[0]]; x.fillStyle = INK; x.fillRect(0, 0, w, h); if (src) { x.drawImage(src.c, 0, 0, w / 2, h); x.save(); x.translate(w, 0); x.scale(-1, 1); x.globalAlpha = .9; x.fillStyle = new THREE.Color(SEATC[seat % 5]).getStyle(); rr(x, 6, 6, w / 2 - 12, h - 12, 30); x.fill(); x.restore(); } }); }

/* ------------------------------------------------------------------ table */
function buildTable(L) {
  var T = L.table; var key = [T.x0, T.x1, T.z0, T.z1].map(function (v) { return v.toFixed(1); }).join(',');
  if (K.tableKey === key) return; K.tableKey = key;
  while (K.gTable.children.length) K.gTable.remove(K.gTable.children[0]);
  var W = T.x1 - T.x0, D = T.z1 - T.z0, cx = (T.x0 + T.x1) / 2, cz = (T.z0 + T.z1) / 2, th = .9;
  var g = new THREE.ExtrudeGeometry(rrShape(W, D, 1.4), { depth: th, bevelEnabled: true, bevelThickness: .18, bevelSize: .18, bevelSegments: 3, curveSegments: 10 });
  g.rotateX(-Math.PI / 2); g.translate(cx, -th - .18, cz);
  var p = g.attributes.position, uv = g.attributes.uv; for (var i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - T.x0) / W, 1 - (p.getZ(i) - T.z0) / D);
  var top = woodTex(W, D);
  var mTop = stdMat({ map: top, bumpMap: K.q === 'low' ? null : woodBump(), bumpScale: 1.2, roughness: .62, metalness: 0, envMapIntensity: .6 });
  if (mTop.bumpMap) { mTop.bumpMap.wrapS = mTop.bumpMap.wrapT = THREE.RepeatWrapping; }
  var mEdge = stdMat({ color: 0xe0582c, roughness: .42, envMapIntensity: .8 });
  var mesh = new THREE.Mesh(g, [mTop, mEdge]); mesh.receiveShadow = true; K.gTable.add(mesh);
  // hazard tape along the near edge
  var tape = new THREE.Mesh(new THREE.PlaneGeometry(W * .7, .34), stdMat({ map: tapeTex(), roughness: .5 })); tape.position.set(cx, -.5, T.z1 + .19); K.gTable.add(tape);
  // floor
  var fl = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), stdMat({ color: 0xc9824f, roughness: .9 })); fl.rotation.x = -Math.PI / 2; fl.position.y = -9; fl.receiveShadow = false; K.gTable.add(fl);
  props(L, T);
  // shadow camera
  var sc = K.key.shadow.camera, hw = Math.max(W, D) / 2 + 2; sc.left = -hw; sc.right = hw; sc.top = hw; sc.bottom = -hw; sc.near = 5; sc.far = 90; sc.updateProjectionMatrix();
  K.key.target.position.set(cx, 0, cz); K.key.position.set(cx - 14, 30, cz + 16);
}
function woodTex(W, D) {
  var key = 'wood:' + Math.round(W) + 'x' + Math.round(D);
  var ppu = 48, w = Math.min(2048, Math.round(W * ppu)), h = Math.min(2048, Math.round(D * ppu));
  return ptex(key, w, h, function (x) {
    var R = seeded(41), pw = w / Math.max(4, Math.round(W / 3.2)); var cols = ['#e7a85d', '#dc9a50', '#eeb46a', '#d89348', '#e9ad60'];
    for (var i = 0; i * pw < w; i++) {
      var X = i * pw; x.fillStyle = cols[i % cols.length]; x.fillRect(X, 0, pw, h);
      x.save(); x.beginPath(); x.rect(X, 0, pw, h); x.clip();
      for (var k = 0; k < 16; k++) { x.strokeStyle = 'rgba(140,72,22,' + (.08 + R() * .1) + ')'; x.lineWidth = 1.5 + R() * 3; x.beginPath(); var gx = X + R() * pw; x.moveTo(gx, 0); for (var y = 0; y <= h; y += 40) x.lineTo(gx + Math.sin(y * .01 + k) * 6 + (R() - .5) * 2, y); x.stroke(); }
      for (var n = 0; n < 2; n++) { var kx = X + pw * (.25 + R() * .5), ky = R() * h; x.fillStyle = 'rgba(130,64,20,.35)'; x.beginPath(); x.ellipse(kx, ky, 9 + R() * 6, 16 + R() * 10, 0, 0, 7); x.fill(); x.strokeStyle = 'rgba(130,64,20,.25)'; x.lineWidth = 2; x.beginPath(); x.ellipse(kx, ky, 18, 30, 0, 0, 7); x.stroke(); }
      var hg = x.createLinearGradient(X, 0, X + pw, 0); hg.addColorStop(0, 'rgba(255,240,200,.18)'); hg.addColorStop(.5, 'rgba(255,240,200,0)'); hg.addColorStop(1, 'rgba(90,40,10,.15)'); x.fillStyle = hg; x.fillRect(X, 0, pw, h);
      x.restore();
      x.fillStyle = 'rgba(90,40,12,.75)'; x.fillRect(X - 2, 0, 4, h);
      for (var y2 = 40; y2 < h; y2 += 260 + R() * 80) { x.beginPath(); x.arc(X + 14, y2, 4.5, 0, 7); x.arc(X + pw - 14, y2 + 30, 4.5, 0, 7); x.fillStyle = '#6b4a2e'; x.fill(); }
    }
    var v = x.createRadialGradient(w / 2, h / 2, Math.min(w, h) * .3, w / 2, h / 2, Math.max(w, h) * .62); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(80,30,5,.28)'); x.fillStyle = v; x.fillRect(0, 0, w, h);
  });
}
function woodBump() { return ptex('woodbump', 256, 256, function (x, w, h) { x.fillStyle = '#808080'; x.fillRect(0, 0, w, h); var R = seeded(9); for (var i = 0; i < 90; i++) { x.strokeStyle = 'rgba(' + (R() < .5 ? '40,40,40' : '200,200,200') + ',.25)'; x.lineWidth = 1 + R() * 2; x.beginPath(); var X = R() * w; x.moveTo(X, 0); x.lineTo(X + (R() - .5) * 6, h); x.stroke(); } }, false); }
function tapeTex() { return ptex('tape', 512, 32, function (x, w, h) { hazard(x, 0, 0, w, h, 16, '#ffcc1f', INK); }); }
function props(L, T) {
  // a few toy props on the free table corners: spool, toolbox, hard hat
  var corners = [[T.x0 + 1.7, T.z0 + 1.7], [T.x1 - 1.7, T.z0 + 1.7]];
  var spool = new THREE.Group(); var lat = new THREE.LatheGeometry([new THREE.Vector2(0, 0), new THREE.Vector2(.9, 0), new THREE.Vector2(.95, .08), new THREE.Vector2(.9, .16), new THREE.Vector2(.42, .18), new THREE.Vector2(.42, .92), new THREE.Vector2(.9, .94), new THREE.Vector2(.95, 1.02), new THREE.Vector2(.9, 1.1), new THREE.Vector2(0, 1.1)], 28);
  spool.add(new THREE.Mesh(lat, stdMat({ color: 0xf2c14e, roughness: .5 })));
  var wcols = [0x2f86ff, 0xef3b2d]; for (var i = 0; i < 5; i++) { var tor = new THREE.Mesh(gq('spoolT', function () { return new THREE.TorusGeometry(.6, .1, 10, 28); }), stdMat({ color: wcols[i % 2], roughness: .35 })); tor.rotation.x = Math.PI / 2; tor.position.y = .28 + i * .15; spool.add(tor); }
  spool.traverse(function (o) { o.castShadow = true; }); spool.position.set(corners[0][0], 0, corners[0][1]);
  var hat = new THREE.Group(); var dome = new THREE.Mesh(new THREE.SphereGeometry(.85, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), stdMat({ color: 0xffc928, roughness: .3 })); var brim = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.2, .1, 28), stdMat({ color: 0xffb800, roughness: .35 })); var ridge = new THREE.Mesh(new THREE.BoxGeometry(.2, .2, 1.6), stdMat({ color: 0xffd84a, roughness: .3 })); ridge.position.y = .72; ridge.scale.set(1, 1, 1);
  hat.add(dome, brim); dome.position.y = .05; hat.traverse(function (o) { o.castShadow = true; }); hat.position.set(corners[1][0], 0, corners[1][1]); hat.rotation.y = .5;
  K.gTable.add(spool, hat);
}

/* ------------------------------------------------------------------ board */
function b2c(BL, ppu, x, z) { return [(x + BL.W / 2) * ppu, (z + BL.D / 2) * ppu]; }
function buildBoard(L) {
  K.boardMode = L.mode; var BL = L.BL;
  while (K.gBoard.children.length) K.gBoard.remove(K.gBoard.children[0]);
  var th = .32, b = .08;
  var g = new THREE.ExtrudeGeometry(rrShape(BL.W - 2 * b, BL.D - 2 * b, .7), { depth: th - 2 * b, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 8 });
  g.rotateX(-Math.PI / 2); g.translate(0, b, 0);
  var p = g.attributes.position, uv = g.attributes.uv; for (var i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / BL.W + .5, .5 - p.getZ(i) / BL.D);
  var ppu = Math.round(2048 / Math.max(BL.W, BL.D)); var tex = boardTex(BL, ppu, L.mode);
  var mTop = stdMat({ map: tex, roughness: .5, metalness: 0, envMapIntensity: .7 }); var mSide = stdMat({ color: 0x232050, roughness: .45 });
  var mesh = new THREE.Mesh(g, [mTop, mSide]); mesh.receiveShadow = true; mesh.castShadow = true; K.gBoard.add(mesh);
  K.boardTop = th;
  var blob = new THREE.Mesh(gq('blobPlane', function () { var q = new THREE.PlaneGeometry(1, 1); q.rotateX(-Math.PI / 2); return q; }), gq('blobMat', function () { return new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, opacity: .8 }); }));
  blob.scale.set(BL.W + 1.6, 1, BL.D + 1.6); blob.position.y = .01; K.gBoard.add(blob);
  // invisible pick discs for the validation track
  K.trackPicks = [];
  for (var v = 1; v <= 12; v++) { var tp = trackPos(BL, v); var d = new THREE.Mesh(gq('pickDisc', function () { var c = new THREE.CircleGeometry(.5, 16); c.rotateX(-Math.PI / 2); return c; }), gq('pickMat', function () { return new THREE.MeshBasicMaterial({ visible: false }); })); d.position.set(tp[0], th + .02, tp[1]); d.userData.pick = { kind: 'track', value: v }; K.gBoard.add(d); K.trackPicks.push(d); }
}
function trackPos(BL, v) { var t = BL.track; return [t.x0 + (v - 1) * (t.x1 - t.x0) / 11, t.z]; }
function markerPos(BL, value, color) { var f = Math.floor(value); var a = trackPos(BL, f), b = trackPos(BL, Math.min(12, f + 1)); var frac = color === 'red' ? .5 : .5; return [lerp(a[0], b[0], frac), BL.track.z + (color === 'red' ? -1 : 1) * (BL.track.r + .42)]; }
function boardTex(BL, ppu, mode) {
  var w = Math.round(BL.W * ppu), h = Math.round(BL.D * ppu);
  return ptex('board:' + mode, w, h, function (x) {
    var P = function (X, Z) { return b2c(BL, ppu, X, Z); };
    // frame: hazard band
    hazard(x, 0, 0, w, h, ppu * .32, '#ffc928', INK);
    rr(x, ppu * .42, ppu * .42, w - ppu * .84, h - ppu * .84, ppu * .5); x.fillStyle = INK; x.fill();
    rr(x, ppu * .5, ppu * .5, w - ppu, h - ppu, ppu * .45); var g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#2c9db0'); g.addColorStop(1, '#1f7489'); x.fillStyle = g; x.fill();
    x.save(); x.clip();
    x.strokeStyle = 'rgba(255,255,255,.09)'; x.lineWidth = 2; for (var gx = 0; gx < w; gx += ppu * .5) { x.beginPath(); x.moveTo(gx, 0); x.lineTo(gx, h); x.stroke(); } for (var gy = 0; gy < h; gy += ppu * .5) { x.beginPath(); x.moveTo(0, gy); x.lineTo(w, gy); x.stroke(); }
    x.strokeStyle = 'rgba(255,255,255,.16)'; x.lineWidth = 3; for (var gx2 = 0; gx2 < w; gx2 += ppu * 2) { x.beginPath(); x.moveTo(gx2, 0); x.lineTo(gx2, h); x.stroke(); } for (var gy2 = 0; gy2 < h; gy2 += ppu * 2) { x.beginPath(); x.moveTo(0, gy2); x.lineTo(w, gy2); x.stroke(); }
    var rg = x.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, Math.max(w, h) * .7); rg.addColorStop(0, 'rgba(255,255,255,.12)'); rg.addColorStop(1, 'rgba(0,0,30,.25)'); x.fillStyle = rg; x.fillRect(0, 0, w, h);
    x.restore();
    var plate = function (X0, Z0, X1, Z1, label, col) { var a = P(X0, Z0), b = P(X1, Z1); rr(x, a[0], a[1], b[0] - a[0], b[1] - a[1], ppu * .35); x.fillStyle = col || 'rgba(255,242,212,.94)'; x.fill(); x.lineWidth = ppu * .07; x.strokeStyle = INK; x.stroke(); rivet(x, a[0] + ppu * .22, a[1] + ppu * .22, ppu * .07); rivet(x, b[0] - ppu * .22, a[1] + ppu * .22, ppu * .07); rivet(x, a[0] + ppu * .22, b[1] - ppu * .22, ppu * .07); rivet(x, b[0] - ppu * .22, b[1] - ppu * .22, ppu * .07);
      if (label) { font(x, ppu * .34, true); x.textAlign = 'left'; x.textBaseline = 'middle'; var tw = x.measureText(label).width; rr(x, a[0] + ppu * .45, a[1] - ppu * .24, tw + ppu * .5, ppu * .48, ppu * .24); x.fillStyle = '#ff8a1f'; x.fill(); x.lineWidth = ppu * .05; x.stroke(); otext(x, label, a[0] + ppu * .7, a[1], '#ffffff', INK, ppu * .08); } };
    var t = BL.track, tr = t.r; plate(t.x0 - .85, t.z - 1.45, t.x1 + .85, t.z + 1.4, 'DEFUSE TRACK');
    for (var v = 1; v <= 12; v++) { var c = P(trackPos(BL, v)[0], t.z); x.beginPath(); x.arc(c[0], c[1], tr * ppu, 0, 7); var cg = x.createRadialGradient(c[0] - tr * ppu * .3, c[1] - tr * ppu * .3, 2, c[0], c[1], tr * ppu); cg.addColorStop(0, '#5aa8ff'); cg.addColorStop(1, '#1f5fcf'); x.fillStyle = cg; x.fill(); x.lineWidth = ppu * .06; x.strokeStyle = INK; x.stroke(); x.textAlign = 'center'; x.textBaseline = 'middle'; font(x, tr * ppu * 1.15, true); otext(x, String(v), c[0], c[1] + 2, '#ffffff', INK, ppu * .09); }
    for (var m = 1; m <= 11; m++) { ['red', 'yellow'].forEach(function (cl) { var mp = markerPos(BL, m + .5, cl); var c = P(mp[0], mp[1]); x.beginPath(); x.arc(c[0], c[1], ppu * .2, 0, 7); x.fillStyle = cl === 'red' ? 'rgba(239,59,45,.35)' : 'rgba(255,201,40,.45)'; x.fill(); x.lineWidth = ppu * .035; x.strokeStyle = cl === 'red' ? '#b31e16' : '#a37600'; x.setLineDash([ppu * .07, ppu * .05]); x.stroke(); x.setLineDash([]); }); }
    var d = BL.dial, dr = d.s * 1.25; plate(d.x - dr - .3, d.z - dr - .45, d.x + dr + .3, d.z + dr + .25, 'DETONATOR', 'rgba(255,242,212,.9)');
    var e = BL.equip; plate(e.x0 - .3, e.z - e.h / 2 - .55, e.x1 + .3, e.z + e.h / 2 + .45, 'GEAR');
    var ms = BL.mission; plate(ms.x - ms.w / 2 - .3, ms.z - ms.h / 2 - .5, ms.x + ms.w / 2 + .3, ms.z + ms.h / 2 + .3, 'MISSION');
    var ex = BL.extras; plate(ex.x0 - .3, ex.z - ex.h / 2 - .45, ex.x1 + .3, ex.z + ex.h / 2 + .3, 'BRIEFING', 'rgba(255,242,212,.55)');
    // equipment slot outlines
    for (var s = 0; s < 5; s++) { var sx = e.x0 + e.w / 2 + s * ((e.x1 - e.x0 - e.w) / 4); var a = P(sx - e.w / 2, e.z - e.h / 2), b = P(sx + e.w / 2, e.z + e.h / 2); rr(x, a[0], a[1], b[0] - a[0], b[1] - a[1], ppu * .14); x.setLineDash([ppu * .14, ppu * .1]); x.lineWidth = ppu * .04; x.strokeStyle = 'rgba(28,24,56,.35)'; x.stroke(); x.setLineDash([]); }
    var a2 = P(ms.x - ms.w / 2, ms.z - ms.h / 2), b2 = P(ms.x + ms.w / 2, ms.z + ms.h / 2); rr(x, a2[0], a2[1], b2[0] - a2[0], b2[1] - a2[1], ppu * .14); x.setLineDash([ppu * .14, ppu * .1]); x.lineWidth = ppu * .04; x.strokeStyle = 'rgba(28,24,56,.35)'; x.stroke(); x.setLineDash([]);
    // brand
    x.textAlign = 'center'; x.textBaseline = 'middle'; font(x, ppu * .4, true); if (mode === 'ring') { var bp = P(BL.W / 2 - 3.6, BL.D / 2 - .25); otext(x, 'SHORT FUSE  \u2022  DEMOLITION CREW', bp[0], bp[1], '#ffe066', INK, ppu * .08); }
  });
}

/* ------------------------------------------------------------------ tiles (instanced) */
function buildTiles() {
  var geo = slabGeo(TW, TH, TD, .17, .055, 2);
  var g = geo.clone(); var cells = new Float32Array(CAP * 2); g.setAttribute('aCell', new THREE.InstancedBufferAttribute(cells, 2));
  var mesh = new THREE.InstancedMesh(g, tileMaterial(), CAP); mesh.castShadow = true; mesh.receiveShadow = true; mesh.frustumCulled = false;
  var z = new THREE.Matrix4().makeScale(0, 0, 0); for (var i = 0; i < CAP; i++) mesh.setMatrixAt(i, z);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  var c = new THREE.Color(1, 1, 1); for (var j = 0; j < CAP; j++) mesh.setColorAt(j, c);
  K.tileMesh = mesh; K.scene.add(mesh); K.free = []; for (var f = CAP - 1; f >= 0; f--) K.free.push(f); K.byIdx = {};
  // cartoon outline hull: shares the instance matrices
  var om = hullMat('#1a1433', 1, false); var e = .035; om.uniforms.uScale.value.set((TW + 2 * e) / TW, (TH + 2 * e) / TH, (TD + 2 * e) / TD);
  var ol = new THREE.InstancedMesh(geo, om, CAP); ol.instanceMatrix = mesh.instanceMatrix; ol.frustumCulled = false; K.olMesh = ol; K.scene.add(ol);
  // highlight glow hulls (own matrices)
  var gm1 = hullMat('#c8ff3a', .95, false), gm2 = hullMat('#9dff2a', .35, true);
  var e1 = .065, e2 = .2; gm1.uniforms.uScale.value.set((TW + 2 * e1) / TW, (TH + 2 * e1) / TH, (TD + 2 * e1) / TD); gm2.uniforms.uScale.value.set((TW + 2 * e2) / TW, (TH + 2 * e2) / TH, (TD + 2 * e2) / TD);
  
  K.glow1 = new THREE.InstancedMesh(geo, gm1, CAP); K.glow2 = new THREE.InstancedMesh(geo, gm2, CAP); K.glow1.count = K.glow2.count = 0; K.glow1.frustumCulled = K.glow2.frustumCulled = false; K.glow2.renderOrder = 2;
  K.scene.add(K.glow1, K.glow2);
  var cg = new THREE.ConeGeometry(.24, .42, 4); cg.rotateX(Math.PI); cg.rotateY(Math.PI / 4); K.chev = new THREE.InstancedMesh(cg, new THREE.MeshStandardMaterial({ color: 0xb6ff2a, emissive: 0x66cc00, emissiveIntensity: .9, roughness: .4 }), CAP); K.chev.count = 0; K.chev.frustumCulled = false; K.chev.castShadow = true; K.scene.add(K.chev);
  var co = hullMat('#1a1433', 1, false); co.uniforms.uScale.value.set(1.28, 1.16, 1.28); K.chevOl = new THREE.InstancedMesh(cg, co, CAP); K.chevOl.instanceMatrix = K.chev.instanceMatrix; K.chevOl.count = 0; K.chevOl.frustumCulled = false; K.scene.add(K.chevOl);
}
var _m = null;
function writeTiles() {
  if (!K.tileMesh) return; _m = _m || new THREE.Matrix4();
  var cell = K.tileMesh.geometry.attributes.aCell; var any = false;
  for (var id in K.recs) { var r = K.recs[id]; _m.compose(r.p, r.q, r.s); K.tileMesh.setMatrixAt(r.idx, _m); var uv = cellUV(r.cell); cell.setXY(r.idx, uv[0], uv[1]); any = true; }
  var top = 0; for (var ix in K.byIdx) top = Math.max(top, +ix + 1); K.tileMesh.count = K.olMesh.count = top;
  K.tileMesh.instanceMatrix.needsUpdate = true; cell.needsUpdate = true; K.tileMesh.boundingSphere = null;
  // glow
  if (K.hlTiles && K.hlTiles.length) { var n = 0, bob = Math.abs(Math.sin(now() / 1000 * 4)) * .22, cq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), now() / 1000 * 1.5), cp = new THREE.Vector3(); for (var i = 0; i < K.hlTiles.length; i++) { var rr2 = K.recs[K.hlTiles[i]]; if (!rr2) continue; _m.compose(rr2.p, rr2.q, rr2.s); K.glow1.setMatrixAt(n, _m); K.glow2.setMatrixAt(n, _m); var top = new THREE.Vector3(0, TH / 2, 0).applyQuaternion(rr2.q).multiply(rr2.s); cp.copy(rr2.p).add(top); cp.y = Math.max(cp.y, rr2.p.y) + (K.layout.mode === 'column' ? .28 : .45) * rr2.s.y + bob; _m.compose(cp, cq, rr2.s); K.chev.setMatrixAt(n, _m); n++; } K.glow1.count = K.glow2.count = K.chev.count = K.chevOl.count = n; K.glow1.instanceMatrix.needsUpdate = K.glow2.instanceMatrix.needsUpdate = K.chev.instanceMatrix.needsUpdate = true; }
  else { K.glow1.count = K.glow2.count = K.chev.count = K.chevOl.count = 0; }
}
function newRec(t, key, slot) {
  if (!K.free.length) { for (var gid in K.recs) { var g0 = K.recs[gid]; if (g0.key === '__gone') { if (g0.anim) killTween(g0.anim); freeRec(g0); if (K.free.length > 8) break; } } }
  if (K.recs[t.id] && K.recs[t.id].key === '__gone') { var gr = K.recs[t.id]; if (gr.anim) killTween(gr.anim); freeRec(gr); }
  var idx = K.free.pop(); if (idx == null) return null;
  var rec = { id: t.id, data: t, key: key, slot: slot, idx: idx, p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3(1, 1, 1), lift: 0, cell: 0 };
  K.recs[t.id] = rec; K.byIdx[idx] = rec; return rec;
}
function freeRec(rec) { if (K.byIdx[rec.idx] !== rec) return; delete K.recs[rec.id]; delete K.byIdx[rec.idx]; K.free.push(rec.idx); K.tileMesh.setMatrixAt(rec.idx, new THREE.Matrix4().makeScale(0, 0, 0)); K.tileMesh.instanceMatrix.needsUpdate = true; }
function moveTo(rec, tp, dur, arc) {
  if (rec.anim) killTween(rec.anim);
  var p0 = rec.p.clone(), q0 = rec.q.clone(), s0 = rec.s.clone(), d = p0.distanceTo(tp.p);
  if (d < 1e-4 && q0.angleTo(tp.q) < 1e-4 && s0.distanceTo(tp.s) < 1e-4) { rec.anim = null; return; }
  rec.anim = tween(dur, function (k) { var a = E.inOut(k); rec.p.lerpVectors(p0, tp.p, a); rec.p.y += Math.sin(a * Math.PI) * (arc == null ? Math.min(1.2, d * .3) : arc); rec.q.slerpQuaternions(q0, tp.q, a); rec.s.lerpVectors(s0, tp.s, a); }, function () { rec.anim = null; });
}
function cutAnim(rec, tp) {
  if (rec.anim) killTween(rec.anim);
  var p0 = rec.p.clone(), q0 = rec.q.clone(), sc = tp.s.x; var landed = false;
  rec.anim = tween(1.05, function (k) {
    var a = clamp((k - .12) / .55, 0, 1), e = E.inOut(a);
    rec.p.lerpVectors(p0, tp.p, e); rec.q.slerpQuaternions(q0, tp.q, e);
    if (k < .12) { var w = k / .12; rec.p.y += w * .35 * sc; var wq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.sin(w * Math.PI * 4) * .12); rec.q.multiply(wq); }
    else if (k < .67) { rec.p.y += (.35 + Math.sin(a * Math.PI) * 1.5) * sc * (1 - e * .75) ; }
    else { var b = (k - .67) / .33; if (!landed) { landed = true; dust(tp.p, sc); } var hop = Math.abs(Math.sin(b * Math.PI * 2.0)) * .32 * Math.pow(1 - b, 2) * sc; rec.p.y += hop; var sq = Math.sin(Math.min(1, b * 3) * Math.PI) * .18 * (1 - b); rec.s.set(sc * (1 + sq * .5), sc * (1 + sq * .5), sc * (1 - sq)); }
    if (k >= 1) rec.s.copy(tp.s);
  }, function () { rec.anim = null; rec.s.copy(tp.s); rec.p.copy(tp.p); rec.q.copy(tp.q); });
}
function popIn(rec, tp, delay) {
  if (rec.anim) killTween(rec.anim);
  rec.p.copy(tp.p); rec.q.copy(tp.q); rec.s.set(0.001, .001, .001); var s = tp.s.x; var y0 = tp.p.y;
  rec.anim = tween(.5, function (k) { var e = E.outBack(k); rec.s.setScalar(Math.max(.001, s * e)); rec.p.y = y0 + (1 - E.outCubic(k)) * .8; }, function () { rec.anim = null; rec.s.copy(tp.s); rec.p.copy(tp.p); }, delay);
}

SFKit.setPlayers = function (n, mySeat, opts) {
  opts = opts || {}; var st = K.st; st.n = clamp(n | 0, 2, 5); st.my = clamp(mySeat | 0, 0, st.n - 1);
  if (opts.names) st.names = opts.names.slice(); if (opts.captain != null) st.captain = opts.captain;
  // drop stands of seats that no longer exist
  for (var k in st.stands) if (+k.split(':')[0] >= st.n) delete st.stands[k];
  if (K.on) { for (var id in K.recs) { var rr3 = K.recs[id]; if (+rr3.key.split(':')[0] >= st.n) freeRec(rr3); } relayout(K.first); }
  else render2DAuto();
};
SFKit.setStand = function (seat, standIdx, tiles) {
  tiles = (tiles || []).map(function (t) { var o = {}; for (var k in t) o[k] = t[k]; if (o.id == null) o.id = seat + '-' + standIdx + '-' + Math.random().toString(36).slice(2, 7); return o; });
  var key = seat + ':' + (standIdx | 0); var prev = K.st.stands[key]; K.st.stands[key] = tiles;
  if (!K.on) { render2DAuto(); return; }
  var relay = !prev || prev.length !== tiles.length;
  var seen = {};
  for (var i = 0; i < tiles.length; i++) {
    var t = tiles[i]; seen[t.id] = 1; var rec = K.recs[t.id]; if (rec && rec.key === '__gone') { if (rec.anim) killTween(rec.anim); rec.anim = null; rec.s.set(1, 1, 1); } var old = rec ? rec.data : null;
    var isNew = !rec; if (isNew) { rec = newRec(t, key, i); if (!rec) continue; }
    rec.key = key; rec.slot = i; rec.data = t;
    var mine = seat === K.st.my; rec.cell = cellOf(t, mine || t.known || t.cut);
    rec.pending = { isNew: isNew, wasCut: old ? !!old.cut : null, oldSlot: old ? rec.slot : null };
  }
  // tiles that left this stand (and did not appear elsewhere) shrink away
  for (var id in K.recs) { var r = K.recs[id]; if (r.key === key && !seen[id]) { (function (rx) { if (rx.anim) killTween(rx.anim); var s0 = rx.s.clone(); rx.anim = tween(.3, function (k) { rx.s.copy(s0).multiplyScalar(Math.max(.001, 1 - k)); }, function () { freeRec(rx); }); rx.key = '__gone'; })(r); } }
  if (relay) relayout(K.first);
  var stagger = 0;
  for (var j = 0; j < tiles.length; j++) {
    var rc = K.recs[tiles[j].id]; if (!rc || !rc.pending) continue; var pd = rc.pending; rc.pending = null; var tp = tilePose(rc);
    if (K.first || K.instant) { rc.p.copy(tp.p); rc.q.copy(tp.q); rc.s.copy(tp.s); }
    else if (pd.isNew) popIn(rc, tp, (stagger++) * .025);
    else if (!pd.wasCut && rc.data.cut) cutAnim(rc, tp);
    else moveTo(rc, tp, .5);
  }
  syncTileTokens(); writeTiles(); refreshHighlight(); K.dirty = true;
};
SFKit.setTurn = function (seat) { K.st.turn = seat; if (!K.on) { render2DAuto(); return; } K.dirty = true; };

/* ------------------------------------------------------------------ chips & tokens */
function chipFace(key) {
  return ptex('tok:' + key, 128, 128, function (x, w, h) {
    var a = key.split(':'), kind = a[0], v = a[1];
    var bgc = { info: ['#5aa8ff', '#1f5fcf'], yinfo: ['#ffe455', '#ffb300'], val: ['#7be35a', '#2e9e2a'], even: ['#c08bff', '#7343d9'], odd: ['#c08bff', '#7343d9'], cnt: ['#ffb05a', '#e8681c'], x: ['#4a4470', '#24203f'], mred: ['#ff6048', '#c11d1d'], myel: ['#ffe455', '#ffb300'], oxy: ['#8ff0ff', '#26b6d9'], eq: ['#ffffff', '#dfe3f2'], neq: ['#ffffff', '#dfe3f2'] }[kind] || ['#fff', '#ddd'];
    var g = x.createRadialGradient(w * .38, h * .32, 4, w / 2, h / 2, w * .55); g.addColorStop(0, bgc[0]); g.addColorStop(1, bgc[1]); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.beginPath(); x.arc(w / 2, h / 2, w * .44, 0, 7); x.lineWidth = 5; x.strokeStyle = 'rgba(255,255,255,.55)'; x.setLineDash([9, 7]); x.stroke(); x.setLineDash([]);
    x.textAlign = 'center'; x.textBaseline = 'middle';
    if (kind === 'info') { font(x, v.length > 1 ? 66 : 82, true); otext(x, v, w / 2, h / 2 + 3, '#fff', INK, 12); if (v === '6' || v === '9') { x.fillStyle = '#fff'; x.fillRect(w / 2 - 18, h / 2 + 32, 36, 7); } }
    else if (kind === 'yinfo') bolt(x, w / 2, h / 2, 40, INK, '#fff', 4);
    else if (kind === 'val') { checkMark(x, w / 2, h / 2 - 4, 46, '#ffffff', INK, 5); font(x, 30, true); otext(x, v, w / 2 + 30, h / 2 + 30, '#fff', INK, 7); }
    else if (kind === 'even' || kind === 'odd') { font(x, 34, true); otext(x, kind.toUpperCase(), w / 2, h / 2 + 18, '#fff', INK, 8); var nd = kind === 'even' ? 2 : 1; for (var i = 0; i < nd; i++) { x.beginPath(); x.arc(w / 2 + (nd === 2 ? (i ? 14 : -14) : 0), h / 2 - 20, 9, 0, 7); x.fillStyle = '#fff'; x.fill(); x.lineWidth = 4; x.strokeStyle = INK; x.stroke(); } }
    else if (kind === 'cnt') { font(x, 70, true); otext(x, '×' + v, w / 2, h / 2 + 3, '#fff', INK, 12); }
    else if (kind === 'x') { x.lineCap = 'round'; x.strokeStyle = INK; x.lineWidth = 30; x.beginPath(); x.moveTo(36, 36); x.lineTo(92, 92); x.moveTo(92, 36); x.lineTo(36, 92); x.stroke(); x.strokeStyle = '#ff4a3a'; x.lineWidth = 17; x.stroke(); }
    else if (kind === 'mred' || kind === 'myel') { if (v === 'q') { font(x, 84, true); otext(x, '?', w / 2, h / 2 + 4, kind === 'mred' ? '#fff' : INK, kind === 'mred' ? INK : '#fff', 10); } else { x.beginPath(); x.arc(w / 2, h / 2, 16, 0, 7); x.fillStyle = 'rgba(255,255,255,.6)'; x.fill(); } }
    else if (kind === 'oxy') { font(x, 64, true); otext(x, 'O', w / 2 - 10, h / 2 + 2, '#fff', '#0b5470', 11); font(x, 34, true); otext(x, '2', w / 2 + 26, h / 2 + 24, '#fff', '#0b5470', 8); x.beginPath(); x.arc(36, 36, 9, 0, 7); x.fillStyle = 'rgba(255,255,255,.8)'; x.fill(); }
    else if (kind === 'eq' || kind === 'neq') { x.lineCap = 'round'; x.strokeStyle = INK; x.lineWidth = 14; x.beginPath(); x.moveTo(30, 50); x.lineTo(98, 50); x.moveTo(30, 80); x.lineTo(98, 80); if (kind === 'neq') { x.moveTo(80, 24); x.lineTo(48, 106); } x.stroke(); }
  });
}
var CHIPCOL = { info: 0x1f5fcf, yinfo: 0xf2a900, val: 0x2e9e2a, even: 0x6a3cd0, odd: 0x6a3cd0, cnt: 0xe0621a, x: 0x24203f, mred: 0xc11d1d, myel: 0xf2a900, oxy: 0x1ea8cc, eq: 0xd0d4e6, neq: 0xd0d4e6 };
function chip(key, r, h) {
  r = r || .3; h = h || .13; var kind = key.split(':')[0];
  var g = new THREE.Group();
  var body = new THREE.Mesh(chipGeo(r, h), gq('chipMat' + kind, function () { return stdMat({ color: CHIPCOL[kind] || 0xffffff, roughness: .35, envMapIntensity: .9 }); }));
  body.castShadow = true; body.receiveShadow = true;
  var top = new THREE.Mesh(gq('chipTop', function () { var c = new THREE.CircleGeometry(1, 28); c.rotateX(-Math.PI / 2); return c; }), new THREE.MeshStandardMaterial({ map: chipFace(key), roughness: .38, envMapIntensity: .8 }));
  top.scale.setScalar(r * .9); top.position.y = h + .003;
  if (kind === 'eq' || kind === 'neq') { body.scale.set(1.3, 1, .9); top.scale.set(r * .9 * 1.25, 1, r * .9 * .86); }
  g.add(body, top); g.userData.h = h; return g;
}
function tokenKey(v) {
  if (v == null || v === false) return null;
  if (typeof v === 'object') v = v.value != null ? v.value : v.kind;
  var s = String(v).toLowerCase();
  if (/^\d+$/.test(s)) return 'info:' + s;
  if (s === 'yellow' || s === 'y') return 'yinfo:y';
  if (s === 'even' || s === 'odd') return s + ':' + s;
  if (/^x[123]$/.test(s) || /^×[123]$/.test(s)) return 'cnt:' + s.slice(-1);
  if (s === 'x' || s === 'unsorted') return 'x:x';
  if (s === '=' || s === 'eq') return 'eq:eq';
  if (s === '≠' || s === 'neq' || s === '!=') return 'neq:neq';
  return 'info:' + s.slice(0, 2);
}
function dropIn(obj, y, delay) { var s = obj.scale.x || 1; obj.position.y = y + 1.4; obj.scale.setScalar(s * .6); tween(.55, function (k) { var b = E.outBounce(k); obj.position.y = y + 1.4 * (1 - b); obj.scale.setScalar(s * (.6 + .4 * E.outBack(Math.min(1, k * 1.4)))); }, null, delay); }
function syncTileTokens(relaid) {
  K.tileTok = K.tileTok || {};
  var want = {};
  for (var id in K.recs) {
    var rec = K.recs[id], t = rec.data; if (rec.key === '__gone') continue;
    var row = rowOf(rec.key, rec.slot); if (!row) continue; var x = slotX(row, rec.slot - row.from);
    var keys = [['i', tokenKey(t.infoToken)], ['m', tokenKey(t.marker)]];
    for (var j = 0; j < keys.length; j++) {
      var tk = keys[j][1]; if (!tk) continue; var slotKey = keys[j][0] + ':' + id; want[slotKey] = 1;
      var u = keys[j][0] === 'i' ? (t.cut ? 1.75 : 1.05) : (t.cut ? 1.75 : 1.75), xo = keys[j][0] === 'm' && t.cut ? .28 : (keys[j][0] === 'i' && t.cut ? -.28 : 0);
      var y = t.cut ? SHELF_Y + TD + .01 : SHELF_Y + .005;
      var pos = rowLocal(row, x + (row.mine ? xo : -xo), y, u); var sc = row.s * (t.cut ? .66 : 1);
      var o = K.tileTok[slotKey];
      if (o && o.userData.key !== tk) { K.gTok.remove(o); o = null; }
      if (!o) { o = chip(tk, .41, .14); o.userData.key = tk; o.userData.pick = { kind: 'token', tile: id, token: tk }; K.tileTok[slotKey] = o; K.gTok.add(o); o.position.copy(pos); o.scale.setScalar(sc); if (!K.first && !relaid) dropIn(o, pos.y, .1); }
      else { o.position.copy(pos); o.scale.setScalar(sc); }
      if (K.layout.mode === 'ring' && !row.mine) o.rotation.y = 0;
    }
  }
  for (var k in K.tileTok) if (!want[k]) { K.gTok.remove(K.tileTok[k]); delete K.tileTok[k]; }
}

/* board tokens: validation, markers, = / != , oxygen, robot, hero */
SFKit.setTokens = function (tok) { K.st.tokens = tok || {}; if (!K.on) { render2DAuto(); return; } if (auxSig() !== K.auxSig) relayout(false); else syncTokens(); };
function syncTokens(relaid) {
  K.bTok = K.bTok || {}; var want = {}, T = K.st.tokens || {}, BL = K.layout.BL, top = K.boardTop || .32;
  var put = function (key, face, x, z, r, h, y) {
    want[key] = 1; var o = K.bTok[key]; if (o && o.userData.face !== face) { K.gTok.remove(o); o = null; }
    var yy = y == null ? top : y;
    if (!o) { o = chip(face, r, h); o.userData.face = face; o.userData.pick = { kind: 'token', token: face, key: key }; K.bTok[key] = o; K.gTok.add(o); o.position.set(x, yy, z); if (!K.first && !relaid) dropIn(o, yy, 0); }
    else o.position.set(x, yy, z);
    return o;
  };
  (T.validation || []).forEach(function (v) { var p = trackPos(BL, v); put('val:' + v, 'val:' + v, p[0], p[1], BL.track.r * .95, .14); });
  (T.markers || []).forEach(function (m) { var col = m.color === 'red' ? 'red' : 'yellow'; var p = markerPos(BL, m.value, col); put('mk:' + col + ':' + m.value, (col === 'red' ? 'mred:' : 'myel:') + (m.unknown || m.q ? 'q' : 'b'), p[0] + (col === 'yellow' ? -.15 : 0), p[1], .2, .16); });
  // = and != tokens: upright plaques clipped onto the rail between the two wires
  [['equal', 'eq:eq'], ['notEqual', 'neq:neq']].forEach(function (pr) {
    var e = T[pr[0]]; if (!e || !e.tiles) return; var a = K.recs[e.tiles[0]], b = K.recs[e.tiles[1]]; if (!a || !b) return;
    var ra = rowOf(a.key, a.slot); if (!ra) return; var xa = slotX(ra, a.slot - ra.from), xb = slotX(ra, b.slot - ra.from);
    var key = pr[0]; want[key] = 1; var o = K.bTok[key];
    if (!o) { o = new THREE.Mesh(slabGeo(.62, .5, .1, .12, .03, 2, 'card'), new THREE.MeshStandardMaterial({ map: plaqueTex(pr[1]), roughness: .4 })); o.castShadow = true; o.userData.pick = { kind: 'token', token: pr[1], key: key }; K.bTok[key] = o; K.gTok.add(o); }
    var pos = rowLocal(ra, (xa + xb) / 2, SLOT_Y + TH * .78, .42); o.position.copy(pos); o.scale.setScalar(ra.s); o.rotation.set(-.35, ra.rot, 0, 'YXZ');
  });
  // oxygen: reserve on the board + per seat near the character card
  if (T.oxygen) {
    var ox = T.oxygen; var stack = function (key, n, x, z, s) { n = Math.max(0, n | 0); var vis = Math.min(n, 6); for (var i = 0; i < vis; i++) { var o = put(key + ':' + i, 'oxy:o', x + (i % 2) * .05, z, .26 * s, .09, top + i * .1 * s); o.scale.setScalar(1); } if (n) countLabel(key, n, x, z + .45 * s, top + vis * .1 * s + .05, want); };
    if (ox.reserve != null) stack('oxr', ox.reserve, BL.oxy.x, BL.oxy.z, 1);
    var per = ox.perSeat || ox.seats || {};
    K.layout.seats.forEach(function (S) { var n = per[S.seat]; if (n == null || !S.auxPos) return; var hasCon = ((K.st.mission || {}).constraints || []).some(function (c) { return c.seat === S.seat; }); stack('oxs' + S.seat, n, S.auxPos[0] + (hasCon ? .45 : 0) * S.scaleCards, S.auxPos[1] + (hasCon ? .75 : 0) * S.scaleCards, S.scaleCards); });
    // stacks on the table, not on the board, for seats
  }
  // robot & hero standees
  if (T.robot && T.robot.pos != null) { var rp = T.robot.on === 'numbers' && K.numPos && K.numPos[T.robot.pos] ? K.numPos[T.robot.pos] : trackPos(BL, clamp(T.robot.pos, 1, 12)); standee('robot', rp[0], rp[1] - (T.robot.on === 'numbers' ? .9 : 1.05), want); }
  if (T.hero) { var hp = null; if (T.hero.tile && K.recs[T.hero.tile]) { var hr = K.recs[T.hero.tile]; var hrow = rowOf(hr.key, hr.slot); if (hrow) { var hv = rowLocal(hrow, slotX(hrow, hr.slot - hrow.from), 0, 1.5); hp = [hv.x, hv.z]; } } else if (T.hero.cell && K.bunkerAt) hp = K.bunkerAt(T.hero.cell); if (hp) standee('hero', hp[0], hp[1], want); }
  for (var k in K.bTok) if (!want[k]) { K.gTok.remove(K.bTok[k]); delete K.bTok[k]; }
  K.dirty = true;
}
function countLabel(key, n, x, z, y, want) {
  var k = key + ':lbl'; want[k] = 1; var face = 'cntlbl:' + n; var o = K.bTok[k];
  if (o && o.userData.face !== face) { K.gTok.remove(o); o = null; }
  if (!o) { var t = ptex('lbl:' + n, 128, 64, function (x2, w, h) { x2.textAlign = 'center'; x2.textBaseline = 'middle'; font(x2, 50, true); otext(x2, '×' + n, w / 2, h / 2 + 2, '#ffffff', INK, 10); }); o = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: true })); o.scale.set(.8, .4, 1); o.userData.face = face; K.bTok[k] = o; K.gTok.add(o); }
  o.position.set(x, y + .25, z);
}
function plaqueTex(face) {
  return ptex('plaque:' + face, 256, 104, function (x, w, h) {
    var fw = w / 2; for (var f = 0; f < 2; f++) { x.save(); x.translate(f * fw, 0); x.fillStyle = CREAM; x.fillRect(0, 0, fw, h); rr(x, 6, 6, fw - 12, h - 12, 18); x.fillStyle = f ? '#2b2f63' : '#ffffff'; x.fill(); x.lineWidth = 6; x.strokeStyle = INK; x.stroke();
      if (!f) { x.lineCap = 'round'; x.strokeStyle = INK; x.lineWidth = 11; x.beginPath(); x.moveTo(34, 38); x.lineTo(94, 38); x.moveTo(34, 66); x.lineTo(94, 66); if (face === 'neq:neq') { x.moveTo(78, 18); x.lineTo(50, 86); } x.stroke(); x.strokeStyle = face === 'neq:neq' ? '#ef3b2d' : '#2e9e2a'; x.lineWidth = 5; x.beginPath(); x.moveTo(34, 38); x.lineTo(94, 38); x.moveTo(34, 66); x.lineTo(94, 66); if (face === 'neq:neq') { x.moveTo(78, 18); x.lineTo(50, 86); } x.stroke(); }
      x.restore(); }
  });
}
function standeeTex(kind) {
  return ptex('standee:' + kind, 256, 384, function (x, w, h) {
    x.clearRect(0, 0, w, h); x.lineJoin = 'round'; x.lineCap = 'round';
    var outline = function (fn) { x.save(); x.strokeStyle = '#ffffff'; x.lineWidth = 26; fn(true); x.restore(); fn(false); };
    if (kind === 'robot') {
      var body = function (o) { x.beginPath(); rr(x, 58, 150, 140, 150, 30); if (o) x.stroke(); else { var g = x.createLinearGradient(0, 150, 0, 300); g.addColorStop(0, '#c9d3f0'); g.addColorStop(1, '#7f8cc0'); x.fillStyle = g; x.fill(); x.lineWidth = 8; x.strokeStyle = INK; x.stroke(); } x.beginPath(); rr(x, 70, 50, 116, 96, 26); if (o) x.stroke(); else { x.fillStyle = '#dfe6ff'; x.fill(); x.lineWidth = 8; x.strokeStyle = INK; x.stroke(); } };
      outline(body);
      x.beginPath(); x.moveTo(128, 50); x.lineTo(128, 18); x.lineWidth = 8; x.strokeStyle = INK; x.stroke(); x.beginPath(); x.arc(128, 16, 13, 0, 7); x.fillStyle = '#ff5a3a'; x.fill(); x.stroke();
      [100, 156].forEach(function (ex) { x.beginPath(); x.arc(ex, 96, 17, 0, 7); x.fillStyle = '#22e0ff'; x.fill(); x.lineWidth = 6; x.stroke(); x.beginPath(); x.arc(ex - 5, 91, 5, 0, 7); x.fillStyle = '#fff'; x.fill(); });
      x.beginPath(); x.arc(128, 118, 18, .2, Math.PI - .2); x.lineWidth = 6; x.stroke();
      rr(x, 88, 190, 80, 50, 10); x.fillStyle = '#2b2f63'; x.fill(); x.lineWidth = 6; x.stroke(); font(x, 30, true); x.textAlign = 'center'; x.textBaseline = 'middle'; otext(x, 'NANO', 128, 216, '#ffe066');
      [[40, 190], [216, 190]].forEach(function (a) { x.beginPath(); x.moveTo(a[0] + (a[0] < 128 ? 18 : -18), a[1]); x.lineTo(a[0], a[1] + 60); x.lineWidth = 16; x.strokeStyle = INK; x.stroke(); x.lineWidth = 8; x.strokeStyle = '#9aa6d8'; x.stroke(); });
      [[95, 300], [161, 300]].forEach(function (a) { x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(a[0], a[1] + 50); x.lineWidth = 22; x.strokeStyle = INK; x.stroke(); x.lineWidth = 12; x.strokeStyle = '#9aa6d8'; x.stroke(); });
    } else {
      var hero = function (o) { x.beginPath(); x.moveTo(70, 360); x.quadraticCurveTo(60, 200, 128, 170); x.quadraticCurveTo(196, 200, 186, 360); x.closePath(); if (o) x.stroke(); else { x.fillStyle = '#ff8a1f'; x.fill(); x.lineWidth = 8; x.strokeStyle = INK; x.stroke(); } x.beginPath(); x.arc(128, 120, 54, 0, 7); if (o) x.stroke(); else { x.fillStyle = '#ffd2a6'; x.fill(); x.lineWidth = 8; x.strokeStyle = INK; x.stroke(); } };
      outline(hero);
      x.beginPath(); x.arc(128, 104, 60, Math.PI, 0); x.closePath(); x.fillStyle = '#ffc928'; x.fill(); x.lineWidth = 8; x.strokeStyle = INK; x.stroke(); rr(x, 56, 98, 144, 16, 8); x.fillStyle = '#ffb300'; x.fill(); x.stroke();
      [108, 148].forEach(function (ex) { x.beginPath(); x.arc(ex, 128, 8, 0, 7); x.fillStyle = INK; x.fill(); });
      x.beginPath(); x.arc(128, 142, 18, .25, Math.PI - .25); x.lineWidth = 6; x.stroke();
      rr(x, 96, 230, 64, 22, 8); x.fillStyle = '#ffc928'; x.fill(); x.lineWidth = 5; x.stroke();
      star(x, 128, 290, 26, 11, 5, '#fff', INK, 5);
    }
  });
}
function standee(kind, x, z, want) {
  var key = 'standee:' + kind; want[key] = 1; var o = K.bTok[key]; var top = K.boardTop || .32;
  if (!o) {
    o = new THREE.Group(); var card = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.65), new THREE.MeshStandardMaterial({ map: standeeTex(kind), transparent: true, alphaTest: .4, side: THREE.DoubleSide, roughness: .5 })); card.position.y = .9; card.castShadow = true;
    var base = new THREE.Mesh(gq('standeeBase', function () { return new THREE.BoxGeometry(.8, .16, .4); }), stdMat({ color: kind === 'robot' ? 0x3a3f7a : 0xe0582c, roughness: .4 })); base.position.y = .08; base.castShadow = true;
    o.add(card, base); o.userData.pick = { kind: kind }; K.bTok[key] = o; K.gTok.add(o); o.position.set(x, top, z);
  } else { var from = o.position.clone(), to = new THREE.Vector3(x, top, z); if (from.distanceTo(to) > .01) tween(.6, function (k) { o.position.lerpVectors(from, to, E.inOut(k)); o.position.y = top + Math.abs(Math.sin(k * Math.PI * 3)) * .3 * (1 - k); }); }
  o.rotation.y = 0;
}

/* ------------------------------------------------------------------ cards */
function cardSize(kind) { return { equip: [1.75, 2.55], mission: [2.3, 3.1], char: [1.6, 2.25], number: [.82, 1.18], seq: [2.2, 1.18], constraint: [1.12, 1.6], challenge: [1.12, 1.6], bunker: [2.9, 2.2] }[kind]; }
function cardTex(kind, data, w, h) {
  var ppu = kind === 'number' ? 200 : 180; var fw = Math.round(w * ppu), fh = Math.round(h * ppu);
  var key = 'card:' + kind + ':' + JSON.stringify(data);
  return ptex(key, fw * 2, fh, function (x) {
    x.save(); paintCardFront(x, kind, data, fw, fh); x.restore();
    x.save(); x.translate(fw, 0); paintCardBack(x, kind, data, fw, fh); x.restore();
  });
}
function frame(x, w, h, outer, inner, r) { x.fillStyle = CREAM; x.fillRect(0, 0, w, h); var b = Math.max(6, w * .035); rr(x, b, b, w - 2 * b, h - 2 * b, r); x.fillStyle = outer; x.fill(); x.lineWidth = b * .7; x.strokeStyle = INK; x.stroke(); return b; }
function paintCardBack(x, kind, d, w, h) {
  var b = frame(x, w, h, '#2b2f63', null, w * .09);
  x.save(); rr(x, b * 2, b * 2, w - 4 * b, h - 4 * b, w * .07); x.clip(); x.globalAlpha = .12; hazard(x, 0, 0, w, h, w * .07, 'rgba(0,0,0,0)', '#fff'); x.globalAlpha = 1; x.restore();
  x.textAlign = 'center'; x.textBaseline = 'middle';
  var label = { equip: 'GEAR', mission: 'MISSION', char: 'CREW', number: '#', seq: 'SEQUENCE', constraint: 'RULE', challenge: 'CHALLENGE', bunker: 'BUNKER' }[kind] || '';
  var r = Math.min(w, h) * .3; star(x, w / 2, h * .47, r * 1.05, r * .72, 12, '#ffc928', INK, Math.max(2, b * .5));
  bombIcon(x, w / 2 - r * .14, h * .47 + r * .14, r * .5, '#2b2f63', '#fff', Math.max(2, r * .07));
  if (kind !== 'number') { fitFont(x, label, w * .8, h * .1, true); otext(x, label, w / 2, h * .86, '#ffe066', INK, w * .03); }
}
function badge(x, cx, cy, r, v) {
  x.beginPath(); x.arc(cx, cy, r, 0, 7);
  var isY = v === 'yellow', col = isY ? ['#ffe455', '#ffb300'] : ['#5aa8ff', '#1f5fcf']; var g = x.createLinearGradient(0, cy - r, 0, cy + r); g.addColorStop(0, col[0]); g.addColorStop(1, col[1]); x.fillStyle = g; x.fill(); x.lineWidth = r * .16; x.strokeStyle = INK; x.stroke();
  x.textAlign = 'center'; x.textBaseline = 'middle';
  if (isY) bolt(x, cx, cy, r * .6, INK, '#fff', r * .07); else { var s = String(v); fitFont(x, s, r * 1.5, r * 1.15, true); otext(x, s, cx, cy + r * .05, '#fff', INK, r * .22); }
}
function equipIcon(x, id, cx, cy, s) {
  x.save(); x.translate(cx, cy); x.lineJoin = 'round'; x.lineCap = 'round'; var lw = s * .09;
  var shape = function (fn, fill) { fn(); x.fillStyle = fill; x.fill(); x.lineWidth = lw; x.strokeStyle = INK; x.stroke(); };
  var txt = function (t, size, fill) { x.textAlign = 'center'; x.textBaseline = 'middle'; font(x, size, true); otext(x, t, 0, size * .05, fill || '#fff', INK, lw * 1.4); };
  switch (id) {
    case 'eq1': case 'eq12': case 'eq22': shape(function () { x.beginPath(); x.moveTo(-s * .6, -s * .35); x.lineTo(s * .35, -s * .35); x.lineTo(s * .65, 0); x.lineTo(s * .35, s * .35); x.lineTo(-s * .6, s * .35); x.closePath(); }, '#fff2d4'); x.beginPath(); x.arc(s * .32, 0, s * .08, 0, 7); x.fillStyle = INK; x.fill(); x.translate(-s * .12, 0); txt(id === 'eq1' ? '≠' : id === 'eq12' ? '=' : '×1', s * .55, INK); if (id === 'eq1') { x.strokeStyle = INK; x.lineWidth = lw * 1.1; x.beginPath(); x.moveTo(-s * .2, -s * .1); x.lineTo(s * .05, -s * .1); x.moveTo(-s * .2, s * .1); x.lineTo(s * .05, s * .1); x.moveTo(s * .0, -s * .22); x.lineTo(-s * .14, s * .22); x.stroke(); } break;
    case 'eq2': [-1, 1].forEach(function (sd) { x.save(); x.translate(sd * s * .3, s * .05); x.rotate(sd * .15); shape(function () { rr(x, -s * .2, -s * .35, s * .4, s * .7, s * .08); }, sd < 0 ? '#ff8a1f' : '#16b3a6'); x.beginPath(); x.moveTo(s * .1, -s * .35); x.lineTo(s * .1, -s * .6); x.lineWidth = lw; x.stroke(); x.fillStyle = '#fff'; x.fillRect(-s * .12, -s * .25, s * .24, s * .16); x.restore(); }); break;
    case 'eq3': case 'eq5': case 'eq10': shape(function () { rr(x, -s * .5, -s * .3, s * 1.0, s * .6, s * .12); }, '#ffc928'); x.translate(0, 0); txt(id === 'eq3' ? '×3' : id === 'eq5' ? 'ALL' : 'X|Y', s * (id === 'eq10' ? .38 : .42), INK); shape(function () { x.beginPath(); x.moveTo(s * .5, -s * .1); x.lineTo(s * .8, 0); x.lineTo(s * .5, s * .1); x.closePath(); }, '#9aa6d8'); break;
    case 'eq4': shape(function () { x.beginPath(); x.moveTo(-s * .45, -s * .45); x.lineTo(s * .45, -s * .45); x.lineTo(s * .45, s * .25); x.lineTo(s * .25, s * .45); x.lineTo(-s * .45, s * .45); x.closePath(); }, '#ffe455'); x.strokeStyle = 'rgba(28,24,56,.6)'; x.lineWidth = lw * .8; for (var i = 0; i < 3; i++) { x.beginPath(); x.moveTo(-s * .3, -s * .22 + i * s * .2); x.lineTo(s * .3, -s * .22 + i * s * .2); x.stroke(); } break;
    case 'eq6': x.beginPath(); x.arc(0, 0, s * .45, -Math.PI * .1, Math.PI * 1.45); x.lineWidth = s * .2; x.strokeStyle = INK; x.stroke(); x.lineWidth = s * .11; x.strokeStyle = '#7be35a'; x.stroke(); shape(function () { x.beginPath(); x.moveTo(s * .3, -s * .55); x.lineTo(s * .68, -s * .2); x.lineTo(s * .22, -s * .08); x.closePath(); }, '#7be35a'); break;
    case 'eq7': shape(function () { rr(x, -s * .3, -s * .45, s * .6, s * .9, s * .1); }, '#7be35a'); shape(function () { rr(x, -s * .12, -s * .56, s * .24, s * .12, s * .03); }, '#cfd3e6'); bolt(x, 0, 0, s * .32, '#ffe455', INK, lw * .5); break;
    case 'eq8': for (var k = 3; k >= 1; k--) { x.beginPath(); x.arc(0, s * .35, s * .26 * k, -Math.PI * .85, -Math.PI * .15); x.lineWidth = s * .14; x.strokeStyle = INK; x.stroke(); x.lineWidth = s * .07; x.strokeStyle = '#22e0ff'; x.stroke(); } x.beginPath(); x.arc(0, s * .35, s * .1, 0, 7); x.fillStyle = '#ff5a3a'; x.fill(); x.lineWidth = lw; x.stroke(); break;
    case 'eq9': shape(function () { x.beginPath(); x.moveTo(0, -s * .55); x.quadraticCurveTo(s * .5, -s * .45, s * .5, -s * .3); x.quadraticCurveTo(s * .5, s * .3, 0, s * .58); x.quadraticCurveTo(-s * .5, s * .3, -s * .5, -s * .3); x.quadraticCurveTo(-s * .5, -s * .45, 0, -s * .55); }, '#5aa8ff'); checkMark(x, 0, 0, s * .4, '#fff', INK, lw * .4); break;
    case 'eq11': shape(function () { rr(x, -s * .38, -s * .3, s * .62, s * .72, s * .1); }, '#fff2d4'); x.beginPath(); x.arc(s * .3, s * .05, s * .17, -Math.PI / 2, Math.PI / 2); x.lineWidth = s * .09; x.strokeStyle = INK; x.stroke(); x.fillStyle = '#8b5a2b'; x.fillRect(-s * .32, -s * .24, s * .5, s * .12); x.strokeStyle = 'rgba(28,24,56,.5)'; x.lineWidth = lw * .7; for (var st2 = 0; st2 < 3; st2++) { x.beginPath(); x.moveTo(-s * .2 + st2 * s * .14, -s * .4); x.quadraticCurveTo(-s * .1 + st2 * s * .14, -s * .55, -s * .2 + st2 * s * .14, -s * .68); x.stroke(); } break;
    case 'eqY': shape(function () { rr(x, -s * .5, -s * .2, s, s * .6, s * .06); }, '#c98a4a'); shape(function () { rr(x, -s * .55, -s * .38, s * 1.1, s * .2, s * .06); }, '#e0a868'); bolt(x, 0, s * .1, s * .25, '#ffe455', INK, lw * .4); break;
    case 'eq33': shape(function () { x.beginPath(); x.arc(0, -s * .15, s * .5, Math.PI, 0); x.closePath(); }, '#ff5c9a'); x.strokeStyle = INK; x.lineWidth = lw * .8; x.beginPath(); x.moveTo(-s * .5, -s * .15); x.lineTo(-s * .12, s * .3); x.moveTo(s * .5, -s * .15); x.lineTo(s * .12, s * .3); x.stroke(); shape(function () { rr(x, -s * .18, s * .25, s * .36, s * .3, s * .05); }, '#c98a4a'); break;
    case 'eq99': shape(function () { rr(x, -s * .55, -s * .3, s * 1.1, s * .6, s * .08); }, '#ff8a1f'); x.setLineDash([s * .06, s * .05]); x.beginPath(); x.moveTo(s * .2, -s * .3); x.lineTo(s * .2, s * .3); x.lineWidth = lw * .7; x.stroke(); x.setLineDash([]); x.translate(-s * .15, 0); txt('GO', s * .36, '#fff'); break;
    case 'eq1010': shape(function () { rr(x, -s * .55, -s * .18, s * .7, s * .36, s * .08); }, '#9aa6d8'); shape(function () { rr(x, -s * .45, s * .1, s * .18, s * .35, s * .05); }, '#2b2f63'); for (var z = 0; z < 3; z++) { x.beginPath(); x.arc(s * .3, 0, s * (.1 + z * .12), -.8, .8); x.lineWidth = lw; x.strokeStyle = '#ff5c9a'; x.stroke(); } break;
    case 'eq1111': x.beginPath(); x.moveTo(0, -s * .6); x.lineTo(0, s * .1); x.arc(-s * .25, s * .1, s * .25, 0, Math.PI * .9); x.lineWidth = s * .2; x.strokeStyle = INK; x.stroke(); x.lineWidth = s * .1; x.strokeStyle = '#cfd3e6'; x.stroke(); break;
    default: txt('?', s * .8, '#fff');
  }
  x.restore();
}
function paintCardFront(x, kind, d, w, h) {
  x.textAlign = 'center'; x.textBaseline = 'middle';
  if (kind === 'equip') {
    var b = frame(x, w, h, '#2b2f63', null, w * .09);
    rr(x, b * 2, h * .2, w - 4 * b, h * .42, w * .05); var ag = x.createLinearGradient(0, h * .2, 0, h * .62); ag.addColorStop(0, '#3fc0d0'); ag.addColorStop(1, '#1f7489'); x.fillStyle = ag; x.fill(); x.lineWidth = b * .5; x.strokeStyle = INK; x.stroke();
    x.save(); rr(x, b * 2, h * .2, w - 4 * b, h * .42, w * .05); x.clip(); dots(x, 0, h * .2, w, h * .42, w * .08, w * .012, 'rgba(255,255,255,.18)'); x.restore();
    equipIcon(x, d.id, w / 2, h * .41, w * .34);
    // title bar
    rr(x, b * 1.6, h * .065, w - 3.2 * b, h * .12, h * .04); x.fillStyle = '#ff8a1f'; x.fill(); x.lineWidth = b * .45; x.strokeStyle = INK; x.stroke();
    var name = (d.name || 'Gear').toUpperCase(); fitFont(x, name, w * .6, h * .075, true); otext(x, name, w * .64, h * .127, '#fff', INK, w * .022);
    var uv = d.unlock && typeof d.unlock === 'object' ? d.unlock.value : (d.unlock != null ? d.unlock : d.value); var cnt = d.unlock && d.unlock.count;
    badge(x, w * .17, h * .125, w * .14, cnt === 4 ? uv + '-' + uv : (uv == null ? '?' : uv));
    // timing strip
    var tim = { any_time: 'ANY TIME', your_turn: 'YOUR TURN', start_of_your_turn: 'START OF TURN', instant: 'INSTANT' }[d.timing] || (d.timing || '').toUpperCase().replace(/_/g, ' ');
    rr(x, b * 2, h * .645, w - 4 * b, h * .075, h * .03); x.fillStyle = '#ffe066'; x.fill(); x.lineWidth = b * .35; x.strokeStyle = INK; x.stroke();
    font(x, h * .045, false, 900); x.fillStyle = INK; x.fillText((d.timing === 'instant' ? '⚡ ' : '') + tim, w / 2, h * .684);
    rr(x, b * 2, h * .735, w - 4 * b, h * .225, w * .04); x.fillStyle = '#fff6e2'; x.fill(); x.lineWidth = b * .35; x.stroke();
    font(x, h * .038, false, 800); x.fillStyle = INK; x.textBaseline = 'top'; wrap(x, d.short || shortText(d.effect), w / 2, h * .75, w - 6 * b, h * .045, 4);
    return;
  }
  if (kind === 'char') {
    var col = SEATC[(d.seat || 0) % 5]; var b2 = frame(x, w, h, col, null, w * .09);
    rr(x, b2 * 2, b2 * 2, w - 4 * b2, h * .58, w * .06); var bg = x.createRadialGradient(w / 2, h * .3, 10, w / 2, h * .35, w * .7); bg.addColorStop(0, '#fff6e2'); bg.addColorStop(1, '#ffd29a'); x.fillStyle = bg; x.fill(); x.lineWidth = b2 * .5; x.strokeStyle = INK; x.stroke();
    x.save(); rr(x, b2 * 2, b2 * 2, w - 4 * b2, h * .58, w * .06); x.clip(); x.globalAlpha = .25; for (var i = 0; i < 12; i++) { x.beginPath(); x.moveTo(w / 2, h * .34); x.arc(w / 2, h * .34, w, i * Math.PI / 6, i * Math.PI / 6 + Math.PI / 12); x.closePath(); x.fillStyle = '#ffffff'; x.fill(); } x.globalAlpha = 1; portrait(x, w / 2, h * .37, w * .3, d, col); x.restore();
    rr(x, b2 * 1.6, h * .63, w - 3.2 * b2, h * .13, h * .04); x.fillStyle = INK; x.fill();
    var nm = (d.name || 'Crew').toUpperCase(); fitFont(x, nm, w * .78, h * .085, true); otext(x, nm, w / 2, h * .697, '#fff');
    font(x, h * .05, false, 900); x.fillStyle = INK; x.fillText(ITEM_NAMES[d.item] || d.itemName || d.item || 'Double Probe', w / 2, h * .82);
    font(x, h * .036, false, 800); x.fillStyle = 'rgba(28,24,56,.75)'; x.fillText('once per mission', w / 2, h * .89);
    if (d.captain) { star(x, w * .2, h * .12, w * .14, w * .06, 5, '#ffd84a', INK, w * .02); }
    return;
  }
  if (kind === 'mission') {
    var b3 = frame(x, w, h, '#fff6e2', null, w * .07);
    rr(x, b3 * 1.8, b3 * 1.8, w - 3.6 * b3, h * .2, w * .05); var mg = x.createLinearGradient(0, 0, w, 0); mg.addColorStop(0, '#ff8a1f'); mg.addColorStop(1, '#ef3b2d'); x.fillStyle = mg; x.fill(); x.lineWidth = b3 * .5; x.strokeStyle = INK; x.stroke();
    x.beginPath(); x.arc(w * .2, h * .13, w * .13, 0, 7); x.fillStyle = INK; x.fill(); font(x, w * .13, true); otext(x, String(d.number || '?'), w * .2, h * .135, '#ffe066');
    var mn = (d.name || 'Mission').toUpperCase(); x.textAlign = 'left'; fitFont(x, mn, w * .58, h * .07, true); otext(x, mn, w * .37, h * .13, '#fff', INK, w * .02);
    x.textAlign = 'center'; var stars = d.difficulty || Math.min(5, 1 + Math.floor(((d.number || 1) - 1) / 13)); for (var s = 0; s < 5; s++) star(x, w * .26 + s * w * .12, h * .3, w * .045, w * .02, 5, s < stars ? '#ffc928' : 'rgba(28,24,56,.15)', INK, s < stars ? 2 : 0);
    font(x, h * .037, false, 800); x.fillStyle = INK; x.textBaseline = 'top'; wrap(x, d.text || d.rules || '', w / 2, h * .37, w - 5 * b3, h * .045, 12);
    return;
  }
  if (kind === 'number') {
    var b4 = frame(x, w, h, d.done ? '#7be35a' : '#ff8a1f', null, w * .12);
    x.save(); rr(x, b4, b4, w - 2 * b4, h - 2 * b4, w * .1); x.clip(); dots(x, 0, 0, w, h, w * .16, w * .03, 'rgba(255,255,255,.22)'); x.restore();
    var sv = String(d.value); fitFont(x, sv, w * .78, h * .5, true); otext(x, sv, w / 2, h * .5, '#fff', INK, w * .1); if (d.value === 6 || d.value === 9) { x.fillStyle = '#fff'; rr(x, w * .32, h * .7, w * .36, h * .05, 4); x.fill(); x.lineWidth = 3; x.strokeStyle = INK; x.stroke(); }
    if (d.done) checkMark(x, w * .78, h * .16, w * .16, '#fff', INK, 3);
    return;
  }
  if (kind === 'seq') {
    var b5 = frame(x, w, h, '#8f5bff', null, w * .07); font(x, h * .16, true); otext(x, 'SEQUENCE ' + (d.side || 'A'), w / 2, h * .2, '#fff', INK, w * .012);
    var nCut = d.side === 'B' ? 4 : 2; for (var c = 0; c < nCut; c++) { var cx2 = w / 2 + (c - (nCut - 1) / 2) * w * .15; rr(x, cx2 - w * .055, h * .38, w * .11, h * .36, w * .02); x.fillStyle = '#56a6ff'; x.fill(); x.lineWidth = 4; x.strokeStyle = INK; x.stroke(); }
    font(x, h * .12, true); otext(x, 'CUT ' + nCut + ' BEFORE MOVING ON', w / 2, h * .86, '#ffe066', INK, 5);
    return;
  }
  if (kind === 'constraint' || kind === 'challenge') {
    var isC = kind === 'constraint'; var b6 = frame(x, w, h, isC ? '#ef3b2d' : '#16b3a6', null, w * .1);
    x.beginPath(); x.arc(w / 2, h * .3, w * .25, 0, 7); x.fillStyle = '#fff6e2'; x.fill(); x.lineWidth = b6 * .6; x.strokeStyle = INK; x.stroke();
    var lab = isC ? String(d.letter || '?') : String(d.n || '?'); font(x, w * .3, true); otext(x, lab, w / 2, h * .31, isC ? '#ef3b2d' : '#16b3a6', INK, w * .03);
    rr(x, b6 * 1.6, h * .55, w - 3.2 * b6, h * .38, w * .05); x.fillStyle = '#fff6e2'; x.fill(); x.lineWidth = b6 * .4; x.stroke();
    font(x, h * .062, false, 900); x.fillStyle = INK; x.textBaseline = 'top'; wrap(x, d.text || (isC ? CONSTRAINT_TXT[d.letter] : CHALLENGE_TXT[d.n]) || '', w / 2, h * .575, w - 4.4 * b6, h * .072, 5);
    if (d.done) { x.textBaseline = 'middle'; checkMark(x, w * .8, h * .12, w * .14, '#7be35a', INK, 3); }
    return;
  }
  if (kind === 'bunker') {
    var b7 = frame(x, w, h, '#4a4470', null, w * .05); font(x, h * .09, true); otext(x, 'BUNKER  FLOOR ' + (d.floor || 1), w / 2, h * .1, '#ffe066', INK, 6);
    var gx = b7 * 2, gy = h * .2, gw = w - 4 * b7, gh = h * .74; for (var r = 0; r < 3; r++) for (var cc = 0; cc < 4; cc++) { rr(x, gx + cc * gw / 4 + 4, gy + r * gh / 3 + 4, gw / 4 - 8, gh / 3 - 8, 10); x.fillStyle = (r + cc) % 2 ? '#5a5490' : '#6b64a8'; x.fill(); x.lineWidth = 4; x.strokeStyle = INK; x.stroke(); }
  }
}
function shortText(s) { s = String(s || ''); var i = s.indexOf('. '); s = i > 0 && i < 110 ? s.slice(0, i + 1) : s; return s.length > 120 ? s.slice(0, 117) + '...' : s; }
function portrait(x, cx, cy, r, d, col) {
  var R = seeded(((d.seat || 0) + 3) * 97 + String(d.name || '').length * 13); var skins = ['#ffd2a6', '#f1b17e', '#c98552', '#8d5a36', '#ffe0c2']; var skin = skins[Math.floor(R() * skins.length)];
  x.lineJoin = 'round'; x.lineCap = 'round'; x.lineWidth = r * .08; x.strokeStyle = INK;
  x.beginPath(); x.moveTo(cx - r * 1.1, cy + r * 1.6); x.quadraticCurveTo(cx - r, cy + r * .75, cx, cy + r * .75); x.quadraticCurveTo(cx + r, cy + r * .75, cx + r * 1.1, cy + r * 1.6); x.closePath(); x.fillStyle = col; x.fill(); x.stroke();
  x.fillStyle = '#ffe066'; x.fillRect(cx - r * .9, cy + r * 1.05, r * 1.8, r * .14);
  x.beginPath(); x.ellipse(cx, cy, r * .78, r * .86, 0, 0, 7); x.fillStyle = skin; x.fill(); x.stroke();
  [-1, 1].forEach(function (s) { x.beginPath(); x.ellipse(cx + s * r * .3, cy + r * .02, r * .14, r * .17, 0, 0, 7); x.fillStyle = '#fff'; x.fill(); x.lineWidth = r * .05; x.stroke(); x.beginPath(); x.arc(cx + s * r * .3 + r * .03, cy + r * .05, r * .07, 0, 7); x.fillStyle = INK; x.fill(); });
  x.lineWidth = r * .07; x.beginPath(); x.arc(cx, cy + r * .3, r * .3, .2, Math.PI - .2); x.stroke();
  if (R() < .4) { x.beginPath(); x.ellipse(cx, cy + r * .28, r * .34, r * .1, 0, Math.PI, 0); x.fillStyle = '#6b4a2e'; x.fill(); }
  x.beginPath(); x.arc(cx, cy - r * .3, r * .86, Math.PI, 0); x.closePath(); x.fillStyle = '#ffc928'; x.fill(); x.lineWidth = r * .08; x.stroke();
  rr(x, cx - r * 1.05, cy - r * .38, r * 2.1, r * .2, r * .1); x.fillStyle = '#ffb300'; x.fill(); x.stroke();
  rr(x, cx - r * .12, cy - r * 1.12, r * .24, r * .74, r * .1); x.fillStyle = '#ffe066'; x.fill(); x.lineWidth = r * .05; x.stroke();
}
function cardMesh(kind, data) {
  var sz = cardSize(kind), th = kind === 'number' ? .05 : .055;
  var m = new THREE.Mesh(slabGeo(sz[0], sz[1], th, Math.min(sz[0], sz[1]) * .1, .018, 2, 'card'), new THREE.MeshStandardMaterial({ map: cardTex(kind, data, sz[0], sz[1]), roughness: .5, envMapIntensity: .55 }));
  m.castShadow = true; m.receiveShadow = true; m.userData.kind = kind; m.userData.sz = sz; m.userData.th = th;
  var g = new THREE.Group(); g.add(m); g.userData.mesh = m; m.rotation.x = -Math.PI / 2; return g;
}
function placeCard(g, x, y, z, faceDown, anim, scale) {
  var m = g.userData.mesh; var th = m.userData.th; var targetRot = faceDown ? Math.PI : 0; var s = scale || 1;
  g.scale.setScalar(s); var p1 = new THREE.Vector3(x, y + th / 2 * s, z);
  if (g.userData.tw) { killTween(g.userData.tw); g.userData.tw = null; }
  if (!anim || K.first) { g.position.copy(p1); g.rotation.z = targetRot; return; }
  var p0 = g.position.clone(), r0 = g.rotation.z, flip = Math.abs(r0 - targetRot) > .01, dist = p0.distanceTo(p1);
  if (dist < .001 && !flip) return;
  var drop = p0.y > p1.y + 1;
  g.userData.tw = tween(flip ? .75 : drop ? .6 : .45, function (k) {
    if (drop) { g.position.set(p1.x, lerp(p0.y, p1.y, E.outBounce(k)), p1.z); return; }
    var e = E.outBack(k); g.position.lerpVectors(p0, p1, flip ? E.inOut(k) : e); g.position.y = lerp(p0.y, p1.y, E.inOut(k));
    if (flip) { g.position.y += Math.sin(k * Math.PI) * 1.4 * s; g.rotation.z = lerp(r0, targetRot, E.inOut(k)); }
  }, function () { g.position.copy(p1); g.rotation.z = targetRot; g.userData.tw = null; });
}
function cardSig(kind, d) { return kind + JSON.stringify(d); }
function ensureCard(store, key, kind, data) {
  var sig = cardSig(kind, data), o = store[key];
  if (o && o.userData.sig !== sig) { var keep = o.position.clone(), rz = o.rotation.z; K.gCards.remove(o); o = null; o = cardMesh(kind, data); o.position.copy(keep); o.rotation.z = rz; o.userData.sig = sig; store[key] = o; K.gCards.add(o); return o; }
  if (!o) { o = cardMesh(kind, data); o.userData.sig = sig; store[key] = o; K.gCards.add(o); o.userData.fresh = true; }
  return o;
}
SFKit.setEquipment = function (cards) { K.st.equipment = (cards || []).map(function (c) { var o = {}; for (var k in c) o[k] = c[k]; return o; }); if (!K.on) { render2DAuto(); return; } syncCards(); };
function syncCards(relaid) {
  K.eqCards = K.eqCards || {}; var want = {}, BL = K.layout.BL, e = BL.equip, top = K.boardTop || .32; var list = K.st.equipment || []; var n = list.length;
  var sc = n > 5 ? Math.max(.6, 5.2 / n) : Math.min(1.12, (e.x1 - e.x0) / Math.max(1, n) / (e.w + .3)), w = e.w * sc, span = e.x1 - e.x0 - w, step = n > 1 ? Math.min(span / (n - 1), w + .25) : 0, start = (e.x0 + e.x1) / 2 - step * (n - 1) / 2;
  list.forEach(function (c, i) {
    var key = c.id || ('eq' + i); want[key] = 1;
    var data = { id: c.id, name: c.name, timing: c.timing, unlock: c.unlock, value: c.value, short: c.short || shortText(c.effect) };
    var o = ensureCard(K.eqCards, key, 'equip', data); o.userData.mesh.userData.pick = { kind: 'equipment', id: c.id, index: i };
    var state = c.state || (c.used ? 'used' : c.unlocked || c.ready ? 'ready' : 'locked');
    var dz = state === 'locked' ? .32 : state === 'ready' ? -.3 : 0;
    var fresh = o.userData.fresh; o.userData.fresh = false;
    if (fresh && !K.first && !relaid) { o.position.set(start + i * step, top + 3, e.z + dz); }
    placeCard(o, start + i * step, top, e.z + dz, state === 'used', !relaid, sc);
    setCardTint(o, state === 'locked' ? .72 : 1);
    setLock(o, state, sc);
  });
  for (var k in K.eqCards) if (!want[k]) { K.gCards.remove(K.eqCards[k]); delete K.eqCards[k]; }
  K.dirty = true;
}
function setCardTint(g, v) { var m = g.userData.mesh.material; m.color.setScalar(v); }
function setLock(g, state, sc) {
  var cur = g.userData.lock; var want = state === 'locked' ? 'lock' : state === 'ready' ? 'ok' : null;
  if (cur && cur.userData.t !== want) { g.remove(cur); g.userData.lock = cur = null; }
  if (!want || cur) return;
  var o = chip(want === 'lock' ? 'x:lock' : 'val:ok', .28, .1); o.userData.t = want;
  if (want === 'lock') { o.children[1].material = new THREE.MeshStandardMaterial({ map: lockTex(), roughness: .4 }); }
  o.position.set(.6, .03, -.55); g.add(o); g.userData.lock = o;
}
function lockTex() { return ptex('lockico', 128, 128, function (x, w, h) { var g = x.createRadialGradient(48, 40, 4, 64, 64, 70); g.addColorStop(0, '#6a6496'); g.addColorStop(1, '#2a2550'); x.fillStyle = g; x.fillRect(0, 0, w, h); x.lineWidth = 12; x.strokeStyle = '#ffe066'; x.beginPath(); x.arc(64, 54, 20, Math.PI, 0); x.stroke(); rr(x, 34, 54, 60, 44, 10); x.fillStyle = '#ffc928'; x.fill(); x.lineWidth = 6; x.strokeStyle = INK; x.stroke(); x.beginPath(); x.arc(64, 74, 7, 0, 7); x.fillStyle = INK; x.fill(); }); }

SFKit.setMissionCards = function (m) { K.st.mission = m || null; if (!K.on) { render2DAuto(); return; } if (auxSig() !== K.auxSig) relayout(false); else syncMissionCards(); };
function syncMissionCards(relaid) {
  K.mCards = K.mCards || {}; var want = {}, M = K.st.mission || {}, BL = K.layout.BL, top = K.boardTop || .32;
  if (M.mission) { var md = M.mission; var o = ensureCard(K.mCards, 'mission', 'mission', { number: md.number, name: md.name, text: md.text || md.rules, difficulty: md.difficulty }); o.userData.mesh.userData.pick = { kind: 'mission' }; placeCard(o, BL.mission.x, top, BL.mission.z, false, !relaid); want.mission = 1; }
  // briefing strip: number cards, sequence, global constraints/challenges, bunker
  var items = [];
  (M.numbers || []).forEach(function (n, i) { items.push({ key: 'num' + i, kind: 'number', data: { value: n.value != null ? n.value : n, done: !!n.done }, down: n.faceDown, pick: { kind: 'number', value: n.value != null ? n.value : n, index: i } }); });
  if (M.sequence) items.push({ key: 'seq', kind: 'seq', data: { side: M.sequence.side || 'A' }, pick: { kind: 'sequence' } });
  (M.constraints || []).forEach(function (c, i) { if (c.seat == null) items.push({ key: 'con' + i, kind: 'constraint', data: { letter: c.letter, done: !!c.done }, down: c.faceDown, pick: { kind: 'constraint', letter: c.letter } }); });
  (M.challenges || []).forEach(function (c, i) { items.push({ key: 'cha' + i, kind: 'challenge', data: { n: c.n, done: !!c.done }, down: c.faceDown, pick: { kind: 'challenge', n: c.n } }); });
  if (M.bunker) items.push({ key: 'bunker', kind: 'bunker', data: { floor: M.bunker.floor || 1 }, pick: { kind: 'bunker' } });
  var ex = BL.extras, total = 0; items.forEach(function (it) { total += cardSize(it.kind)[0] + .1; });
  var avail = ex.x1 - ex.x0, sc = total > avail ? avail / total : Math.min(1.45, avail / Math.max(1, total), (ex.h + .2) / 1.2), x = (ex.x0 + ex.x1) / 2 - total * sc / 2; K.numPos = {};
  items.forEach(function (it) { var sz = cardSize(it.kind); var cx = x + sz[0] * sc / 2; x += (sz[0] + .1) * sc; var o = ensureCard(K.mCards, it.key, it.kind, it.data); o.userData.mesh.userData.pick = it.pick; var fresh = o.userData.fresh; o.userData.fresh = false; if (fresh && !K.first && !relaid) o.position.set(cx, top + 3, ex.z); placeCard(o, cx, top, ex.z, !!it.down, !relaid, sc); want[it.key] = 1; if (it.kind === 'number') K.numPos[it.data.value] = [cx, ex.z]; if (it.kind === 'bunker') { K.bunkerAt = function (cell) { var r = cell[0], c = cell[1]; return [cx + (-sz[0] / 2 + sz[0] * (.06 + .88 * (c + .5) / 4)) * sc, ex.z + (-sz[1] / 2 + sz[1] * (.2 + .74 * (r + .5) / 3)) * sc]; }; } });
  // sequence pointer
  if (M.sequence && M.sequence.at != null && M.numbers && M.numbers[M.sequence.at] != null) { var nv = M.numbers[M.sequence.at]; nv = nv.value != null ? nv.value : nv; var np = K.numPos[nv]; if (np) { var ar = K.mCards.seqArrow; if (!ar) { ar = new THREE.Group(); var cone = new THREE.Mesh(new THREE.ConeGeometry(.22, .45, 4), stdMat({ color: 0x8f5bff, roughness: .35 })); cone.rotation.x = Math.PI; cone.castShadow = true; ar.add(cone); K.mCards.seqArrow = ar; K.gCards.add(ar); } ar.position.set(np[0], top + .7, np[1] - .2); ar.userData.baseY = top + .7; want.seqArrow = 1; } }
  // seat constraints near the seat
  (M.constraints || []).forEach(function (c, i) { if (c.seat == null) return; var S = K.layout.seats[c.seat]; if (!S) return; var key = 'scon' + i; var o = ensureCard(K.mCards, key, 'constraint', { letter: c.letter }); o.userData.mesh.userData.pick = { kind: 'constraint', letter: c.letter, seat: c.seat }; var s = S.scaleCards * .9; placeCard(o, S.auxPos[0] - .25 * s, 0, S.auxPos[1] - .2 * s, !!c.faceDown, !relaid, s); want[key] = 1; });
  for (var k in K.mCards) if (!want[k]) { K.gCards.remove(K.mCards[k]); delete K.mCards[k]; }
  syncTokens(true); K.dirty = true;
}
SFKit.setCharacters = function (list) { K.st.characters = (list || []).slice(); if (!K.on) { render2DAuto(); return; } syncCharacters(); };
function syncCharacters(relaid) {
  K.chCards = K.chCards || {}; var want = {};
  (K.st.characters || []).forEach(function (c) {
    var S = K.layout.seats[c.seat]; if (!S) return; var key = 'ch' + c.seat; want[key] = 1;
    var o = ensureCard(K.chCards, key, 'char', { seat: c.seat, name: c.name, item: c.item, captain: !!c.captain });
    o.userData.mesh.userData.pick = { kind: 'character', seat: c.seat };
    placeCard(o, S.charPos[0], 0, S.charPos[1], !!c.used, !relaid, S.scaleCards);
  });
  for (var k in K.chCards) if (!want[k]) { K.gCards.remove(K.chCards[k]); delete K.chCards[k]; }
  K.dirty = true;
}

/* ------------------------------------------------------------------ dial + bomb */
function dialFaceTex(max) {
  return ptex('dial:' + max, 512, 512, function (x, w, h) {
    var cx = w / 2, cy = h / 2, R = w * .48;
    x.beginPath(); x.arc(cx, cy, R, 0, 7); var g = x.createRadialGradient(cx, cy - 60, 20, cx, cy, R); g.addColorStop(0, '#fffaf0'); g.addColorStop(1, '#f1dcb2'); x.fillStyle = g; x.fill();
    var n = max + 1, a0 = -135, span = 270, seg = span / n;
    for (var i = 0; i < n; i++) {
      var v = max - i, A = (a0 + i * seg - 90) * Math.PI / 180, B = (a0 + (i + 1) * seg - 90) * Math.PI / 180;
      var hue = v === 0 ? 0 : 8 + 112 * (v / max);
      x.beginPath(); x.moveTo(cx, cy); x.arc(cx, cy, R * .93, A + .012, B - .012); x.closePath();
      x.fillStyle = v === 0 ? '#2a1a3a' : 'hsl(' + hue + ',82%,56%)'; x.fill(); x.lineWidth = 6; x.strokeStyle = INK; x.stroke();
      var M = (A + B) / 2, tx = cx + Math.cos(M) * R * .72, ty = cy + Math.sin(M) * R * .72;
      x.textAlign = 'center'; x.textBaseline = 'middle';
      if (v === 0) bombIcon(x, tx - 6, ty + 6, 30, '#ef3b2d', '#fff', 5, true);
      else { font(x, n > 6 ? 62 : 74, true); otext(x, String(v), tx, ty + 3, '#ffffff', INK, 13); }
    }
    x.beginPath(); x.arc(cx, cy, R * .5, 0, 7); x.fillStyle = '#fff6e2'; x.fill(); x.lineWidth = 7; x.strokeStyle = INK; x.stroke();
    font(x, 30, true); otext(x, 'FUSE', cx, cy + R * .32, '#ef3b2d', INK, 6);
    for (var t = 0; t < 12; t++) { var ta = (t / 12) * Math.PI * 2; rivet(x, cx + Math.cos(ta) * R * .975, cy + Math.sin(ta) * R * .975, 7); }
  });
}
function buildDial() {
  /* the detonator: a chunky cartoon bomb whose belly is the dial; the fuse on top burns down as the dial drops */
  var D = K.dial = { group: new THREE.Group(), value: 4, max: 4, shown: 4 };
  var g = D.group, R = 1.1, cy = 1.06;
  var bm = K.q === 'low' ? stdMat({ color: 0x2b2d55, roughness: .22, envMapIntensity: 1.3 }) : new THREE.MeshPhysicalMaterial({ color: 0x2b2d55, roughness: .28, clearcoat: 1, clearcoatRoughness: .12, envMapIntensity: 1.3 });
  var ball = new THREE.Mesh(new THREE.SphereGeometry(R, 44, 28), bm); ball.position.y = cy; ball.castShadow = true; ball.receiveShadow = true; ball.userData.pick = { kind: 'dial' }; g.add(ball); D.house = ball; D.ball = ball;
  var foot = new THREE.Mesh(new THREE.TorusGeometry(.62, .12, 10, 28), stdMat({ color: 0x1c1838, roughness: .5 })); foot.rotation.x = Math.PI / 2; foot.position.y = .1; g.add(foot);
  // dial plate on the front, facing up toward the camera
  var plate = new THREE.Group(); var el = .66; plate.position.set(0, cy + Math.sin(el) * (R * .92), Math.cos(el) * (R * .92)); plate.rotation.x = -el; g.add(plate); D.plate = plate;
  var bez = new THREE.Mesh(new THREE.CylinderGeometry(.86, .8, .6, 40), stdMat({ color: 0xffc928, roughness: .25, metalness: .35, envMapIntensity: 1.2 })); bez.rotation.x = Math.PI / 2; bez.position.z = -.2; bez.castShadow = true; plate.add(bez);
  var ring = new THREE.Mesh(new THREE.TorusGeometry(.8, .055, 10, 40), stdMat({ color: 0x1c1838, roughness: .4 })); ring.position.z = .1; plate.add(ring);
  var face = new THREE.Mesh(new THREE.CircleGeometry(.78, 44), new THREE.MeshStandardMaterial({ map: dialFaceTex(4), roughness: .42, envMapIntensity: .55 })); face.position.z = .105; plate.add(face); D.face = face; face.userData.pick = { kind: 'dial' };
  var ns = new THREE.Shape(); ns.moveTo(-.07, -.06); ns.lineTo(.07, -.06); ns.lineTo(.035, .36); ns.lineTo(0, .44); ns.lineTo(-.035, .36); ns.closePath();
  var needle = new THREE.Mesh(new THREE.ExtrudeGeometry(ns, { depth: .03, bevelEnabled: true, bevelThickness: .012, bevelSize: .012, bevelSegments: 2 }), stdMat({ color: 0x1c1838, roughness: .35 }));
  var tip = new THREE.Mesh(new THREE.SphereGeometry(.045, 12, 8), stdMat({ color: 0xff4a3a, emissive: 0xff2a10, emissiveIntensity: .5 })); tip.position.set(0, .37, .03); needle.add(tip);
  var piv = new THREE.Group(); piv.position.z = .12; piv.add(needle); plate.add(piv); D.piv = piv;
  var hub = new THREE.Mesh(new THREE.SphereGeometry(.085, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), stdMat({ color: 0xe8ebf6, metalness: .9, roughness: .2 })); hub.rotation.x = Math.PI / 2; hub.position.z = .16; plate.add(hub);
  D.glass = new THREE.Mesh(new THREE.SphereGeometry(1.6, 32, 6, 0, Math.PI * 2, 0, .5), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .04, metalness: .1, transparent: true, opacity: .14, envMapIntensity: 1.6, depthWrite: false }));
  D.glass.rotation.x = Math.PI / 2; D.glass.position.z = .14 - 1.6 * Math.cos(.5) ; D.glass.visible = false; plate.add(D.glass);
  // shine + cap
  var cap = new THREE.Mesh(new THREE.CylinderGeometry(.3, .34, .32, 22), stdMat({ color: 0x9aa6d8, metalness: .75, roughness: .28 })); cap.position.set(-.18, cy + R * .93, -.32); cap.rotation.set(-.32, 0, .18); cap.castShadow = true; g.add(cap);
  var capTop = new THREE.Mesh(new THREE.TorusGeometry(.3, .06, 8, 22), stdMat({ color: 0x6d78b0, metalness: .7, roughness: .3 })); capTop.position.copy(cap.position).add(new THREE.Vector3(-.03, .16, -.05)); capTop.rotation.set(Math.PI / 2 - .32, 0, .18); g.add(capTop);
  D.eyes = [];
  var blobM = new THREE.Mesh(gq('blobPlane', function () { var q = new THREE.PlaneGeometry(1, 1); q.rotateX(-Math.PI / 2); return q; }), gq('blobMat', function () { return new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, opacity: .8 }); })); blobM.scale.set(2.8, 1, 2.8); blobM.position.y = .02; g.add(blobM);
  // fuse
  var c0 = cap.position.clone().add(new THREE.Vector3(-.05, .2, -.06));
  D.curve = new THREE.CatmullRomCurve3([c0, c0.clone().add(new THREE.Vector3(-.1, .32, -.1)), c0.clone().add(new THREE.Vector3(.18, .62, -.05)), c0.clone().add(new THREE.Vector3(.55, .62, .18)), c0.clone().add(new THREE.Vector3(.78, .4, .38)), c0.clone().add(new THREE.Vector3(.85, .2, .62))]);
  D.fuseSeg = 72; D.fuseRad = 8;
  D.fuse = new THREE.Mesh(new THREE.TubeGeometry(D.curve, D.fuseSeg, .065, D.fuseRad, false), stdMat({ color: 0xffffff, roughness: .8, map: ropeTex() })); D.fuse.castShadow = true; g.add(D.fuse);
  D.glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkTex(), color: new THREE.Color(0xffd27a).multiplyScalar(2.6), transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); D.glow.scale.setScalar(.7); D.glow.renderOrder = 12; g.add(D.glow);
  D.core = new THREE.Mesh(new THREE.SphereGeometry(.07, 10, 8), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, .9, .6).multiplyScalar(3) })); g.add(D.core);
  D.light = new THREE.PointLight(0xffa040, 0, 4, 2); g.add(D.light);
  K.scene.add(g);
}
function placeDial(L) {
  var D = K.dial, BL = L.BL, top = K.boardTop || .32; if (!D) return;
  D.group.position.set(BL.dial.x, top, BL.dial.z); D.group.scale.setScalar(BL.dial.s);
  setFuseVisual(D.shown);
}
function ropeTex() { return ptex('rope', 128, 32, function (x, w, h) { x.fillStyle = '#e7b47a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#a8703c'; x.lineWidth = 4; for (var i = -h; i < w; i += 10) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + h, h); x.stroke(); } }); }
function dialAngle(v, max) { var n = max + 1, seg = 270 / n; var deg = -135 + (max - v + .5) * seg; return -deg * Math.PI / 180; }
function setFuseVisual(v) {
  var D = K.dial; if (!D || !D.curve) return; var f = clamp(v / Math.max(1, D.max), 0, 1); var vis = Math.max(.04, f);
  var segs = Math.max(1, Math.round(vis * D.fuseSeg)); D.fuse.geometry.setDrawRange(0, segs * D.fuseRad * 6);
  var tip = D.curve.getPointAt(clamp(vis, 0, 1)); D.tipLocal = tip; D.glow.position.copy(tip); D.core.position.copy(tip); D.light.position.copy(tip);
  D.tipWorld = tip.clone().multiplyScalar(D.group.scale.x).add(D.group.position);
}
SFKit.setDial = function (value, max) {
  var st = K.st.dial; st.value = value; st.max = max || st.max || 4; if (!K.on) { render2DAuto(); return; }
  var D = K.dial; var maxChanged = D.max !== st.max; D.max = st.max;
  if (maxChanged) { D.face.material.map = dialFaceTex(D.max); D.face.material.needsUpdate = true; }
  var from = D.shown, to = clamp(value, 0, D.max); D.value = to;
  if (K.first) { D.shown = to; D.piv.rotation.z = dialAngle(to, D.max); setFuseVisual(to); K.dirty = true; return; }
  var a0 = D.piv.rotation.z, a1 = dialAngle(to, D.max); var b0 = D.ball.scale.x;
  if (D.anim) killTween(D.anim);
  D.anim = tween(1.1, function (k) { var e = E.outElastic(k); D.piv.rotation.z = lerp(a0, a1, e); D.shown = lerp(from, to, E.outCubic(k)); setFuseVisual(D.shown); var sq = Math.sin(Math.min(1, k * 3) * Math.PI) * .1 * (to < from ? 1 : .5); D.group.userData.sq = sq; }, function () { D.anim = null; D.group.userData.sq = 0; });
  if (to < from) { burst(D.tipWorld || D.group.position, 'spark', 22); }
};
function updDial(t, dt) {
  var D = K.dial; if (!D || !D.tipWorld) return;
  var danger = 1 - clamp(D.shown / Math.max(1, D.max), 0, 1); var low = D.shown <= 1.01 ? 1 : D.shown <= 2.01 ? .6 : .2;
  var fl = .75 + Math.sin(t * 31) * .12 + Math.sin(t * 17.3) * .1 + Math.random() * .1;
  D.glow.scale.setScalar((.75 + low * .7) * fl); D.glow.material.opacity = 1; D.glow.material.rotation = t * 3;
  D.light.intensity = GFX[K.q].post ? (.6 + low * 1.6) * fl : 0;
  var rate = (4 + low * 34) * GFX[K.q].parts; D.acc = (D.acc || 0) + dt * rate;
  var w = D.tipLocal.clone().multiplyScalar(D.group.scale.x).add(D.group.position); D.tipWorld = w;
  while (D.acc > 1) { D.acc -= 1; spawn('add', { pos: w, vel: new THREE.Vector3((Math.random() - .5) * 2.4, 1 + Math.random() * 2.2, (Math.random() - .5) * 2.4), life: .35 + Math.random() * .35, size: .16 + Math.random() * .14, col: Math.random() < .5 ? 0xffe27a : 0xffa53a, hdr: 2.4, grav: -5, tex: 'spark' }); }
  // bomb idle wobble, squash, eyes
  var wob = D.shown <= 1.01 ? .05 : .012, sq = D.group.userData.sq || 0, s0 = K.layout ? K.layout.BL.dial.s : 1;
  D.group.rotation.z = Math.sin(t * (D.shown <= 1.01 ? 21 : 1.7)) * wob; D.group.scale.set(s0 * (1 + sq), s0 * (1 - sq), s0 * (1 + sq));
  D.eyes.forEach(function (e, i) { var wide = 1 + danger * .5; e.e.scale.set(wide, 1.2 * wide, .5); e.p.position.x = Math.sin(t * .9 + i) * .04 + (D.shown <= 1.01 ? Math.sin(t * 40) * .02 : 0); });
  if (D.shown <= 1.01 && !D.anim) D.piv.rotation.z = dialAngle(D.value, D.max) + Math.sin(t * 50) * .02;
}
function buildParticles() {
  K.pool = { add: [], norm: [] };
  ['add', 'norm'].forEach(function (k) { var n = k === 'add' ? 220 : 90; for (var i = 0; i < n; i++) { var s = new THREE.Sprite(new THREE.SpriteMaterial({ map: k === 'add' ? sparkTex() : puffTex(), transparent: true, depthWrite: false, blending: k === 'add' ? THREE.AdditiveBlending : THREE.NormalBlending })); s.visible = false; s.renderOrder = 10; K.gFx.add(s); K.pool[k].push({ s: s, alive: false }); } });
}
function spawn(kind, o) {
  var pool = K.pool[kind]; var p = null; for (var i = 0; i < pool.length; i++) if (!pool[i].alive) { p = pool[i]; break; } if (!p) return null;
  p.alive = true; p.fx = !!o.fx; p.t = 0; p.life = o.life || 1; p.vel = o.vel || new THREE.Vector3(); p.grav = o.grav || 0; p.drag = o.drag || 1.5; p.size = o.size || .3; p.grow = o.grow || 0; p.s.visible = true; p.s.position.copy(o.pos); p.s.material.color.set(o.col || 0xffffff); if (o.hdr) p.s.material.color.multiplyScalar(o.hdr); p.op = o.op == null ? 1 : o.op; p.s.material.opacity = p.op; p.s.material.rotation = Math.random() * 6.28; p.spin = (Math.random() - .5) * 3; p.s.scale.setScalar(p.size);
  K.parts.push(p); return p;
}
function updParticles(dt, rdt) {
  for (var i = K.parts.length - 1; i >= 0; i--) {
    var p = K.parts[i]; p.t += rdt * (K.speed || 1); var k = p.t / p.life; if (k >= 1) { p.alive = false; p.s.visible = false; K.parts.splice(i, 1); continue; }
    p.vel.y += p.grav * dt; p.vel.multiplyScalar(Math.max(0, 1 - p.drag * dt)); p.s.position.addScaledVector(p.vel, dt);
    p.s.scale.setScalar(p.size * (1 + p.grow * k)); p.s.material.opacity = p.op * (k < .15 ? k / .15 : 1 - Math.pow((k - .15) / .85, 2)); p.s.material.rotation += p.spin * dt;
  }
}
function burst(pos, kind, n) {
  if (!K.on) return; n = Math.round(n * GFX[K.q].parts); var _sp = spawn; spawn = function (k, o) { o.fx = true; return _sp(k, o); };
  try {
  var P = pos.clone ? pos.clone() : new THREE.Vector3(pos.x, pos.y, pos.z);
  for (var i = 0; i < n; i++) {
    var a = Math.random() * 6.283, sp = Math.random();
    if (kind === 'spark') spawn('add', { pos: P, vel: new THREE.Vector3(Math.cos(a) * (2 + sp * 4), 2 + Math.random() * 4, Math.sin(a) * (2 + sp * 4)), life: .4 + Math.random() * .4, size: .14 + Math.random() * .12, col: Math.random() < .5 ? 0xfff0a0 : 0xffb040, grav: -9, hdr: 2 });
    else if (kind === 'fire') spawn('add', { pos: P.clone().add(new THREE.Vector3((Math.random() - .5) * .6, Math.random() * .5, (Math.random() - .5) * .6)), vel: new THREE.Vector3(Math.cos(a) * sp * 6, 1 + Math.random() * 5, Math.sin(a) * sp * 6), life: .5 + Math.random() * .5, size: .9 + Math.random() * .9, grow: 1.4, col: Math.random() < .5 ? 0xffa030 : 0xff5a20, hdr: 2.2, drag: 3 });
    else if (kind === 'smoke') spawn('norm', { pos: P.clone().add(new THREE.Vector3((Math.random() - .5) * 1.4, Math.random() * .5, (Math.random() - .5) * 1.4)), vel: new THREE.Vector3(Math.cos(a) * sp * 2.2, 1.2 + Math.random() * 2, Math.sin(a) * sp * 2.2), life: 1.2 + Math.random() * .9, size: .9 + Math.random() * .8, grow: 1.2, col: Math.random() < .5 ? 0xd9d4e6 : 0xb3adc6, drag: 1.4, op: .95 });
    else if (kind === 'dust') spawn('norm', { pos: P.clone().add(new THREE.Vector3((Math.random() - .5) * .9, .05, (Math.random() - .5) * .9)), vel: new THREE.Vector3(Math.cos(a) * 1.6, .5 + Math.random() * .6, Math.sin(a) * 1.6), life: .55 + Math.random() * .3, size: .32 + Math.random() * .2, grow: 1, col: 0xfff2d4, drag: 4, op: .9 });
    else if (kind === 'sparkle') spawn('add', { pos: P.clone().add(new THREE.Vector3((Math.random() - .5) * 2, Math.random() * 1.2, (Math.random() - .5) * 2)), vel: new THREE.Vector3(0, .8 + Math.random(), 0), life: .7 + Math.random() * .6, size: .25 + Math.random() * .25, col: Math.random() < .5 ? 0xbfffe0 : 0x9fe3ff, hdr: 1.8, drag: 1 });
  }
  } finally { spawn = _sp; }
  K.dirty = true;
}
function dust(p, s) { burst(p, 'dust', 8 * (s || 1)); }
function buildConfetti() {
  var n = 260; var g = new THREE.PlaneGeometry(.2, .32); var m = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: .5, metalness: .1 });
  var mesh = new THREE.InstancedMesh(g, m, n); mesh.frustumCulled = false; mesh.count = 0; var cols = ['#ff8a1f', '#16b3a6', '#8f5bff', '#52c23a', '#ff5c9a', '#ffc928', '#2f86ff', '#ef3b2d'];
  var c = new THREE.Color(); for (var i = 0; i < n; i++) { c.set(cols[i % cols.length]); mesh.setColorAt(i, c); }
  K.conf = { mesh: mesh, n: n, p: [], on: false }; K.scene.add(mesh);
}
function confetti() {
  var C = K.conf, T = K.layout.table, n = Math.round(C.n * Math.max(.5, GFX[K.q].parts)); C.p = [];
  for (var i = 0; i < n; i++) C.p.push({ pos: new THREE.Vector3(lerp(T.x0 * .8, T.x1 * .8, Math.random()), 5 + Math.random() * 9, lerp(T.z0 * .8, T.z1 * .8, Math.random())), vel: new THREE.Vector3((Math.random() - .5) * 2, -1 - Math.random() * 2, (Math.random() - .5) * 2), rot: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6), spin: new THREE.Vector3((Math.random() - .5) * 9, (Math.random() - .5) * 9, (Math.random() - .5) * 9), ph: Math.random() * 6 });
  C.mesh.count = n; C.t = 0; C.on = true;
}
function updConfetti(dt, rdt) {
  var C = K.conf; if (!C || !C.on) return; C.t += rdt * (K.speed || 1); dt *= (K.speed || 1); var q = new THREE.Quaternion(), m = new THREE.Matrix4(), s = new THREE.Vector3(1, 1, 1);
  for (var i = 0; i < C.p.length; i++) { var p = C.p[i]; p.vel.y = Math.max(-3.2, p.vel.y - 3 * dt); p.pos.addScaledVector(p.vel, dt); p.pos.x += Math.sin(C.t * 3 + p.ph) * dt * 1.2; if (p.pos.y < .35) { p.pos.y = .35; p.vel.set(0, 0, 0); p.spin.multiplyScalar(.9); } p.rot.x += p.spin.x * dt; p.rot.y += p.spin.y * dt; p.rot.z += p.spin.z * dt; q.setFromEuler(p.rot); var fade = C.t > 5 ? Math.max(0, 1 - (C.t - 5) / 1.2) : 1; s.setScalar(fade); m.compose(p.pos, q, s); C.mesh.setMatrixAt(i, m); }
  C.mesh.instanceMatrix.needsUpdate = true; if (C.t > 6.3) { C.on = false; C.mesh.count = 0; }
}

/* ------------------------------------------------------------------ comic overlay FX */
var FXCSS = '.sfk-ov{position:absolute;left:0;top:0;pointer-events:none;overflow:hidden;z-index:5}' +
  '.sfk-pop{position:absolute;left:0;top:0;transform:translate(-50%,-50%);will-change:transform,opacity;animation:sfkPop var(--d,1.35s) cubic-bezier(.2,.9,.3,1) forwards;filter:drop-shadow(0 6px 0 rgba(28,24,56,.35))}' +
  '.sfk-pop svg{display:block;overflow:visible}' +
  '@keyframes sfkPop{0%{transform:translate(-50%,-50%) scale(.15) rotate(var(--r0,-18deg));opacity:0}14%{transform:translate(-50%,-50%) scale(1.18) rotate(var(--r1,5deg));opacity:1}24%{transform:translate(-50%,-50%) scale(.94) rotate(var(--r2,-2deg))}34%{transform:translate(-50%,-50%) scale(1.03) rotate(0deg)}78%{transform:translate(-50%,-50%) scale(1) rotate(0deg);opacity:1}100%{transform:translate(-50%,-62%) scale(1.08) rotate(0deg);opacity:0}}' +
  '.sfk-flash{position:absolute;inset:0;background:radial-gradient(circle at 50% 45%,#fffbe6,#ffd27a 60%,rgba(255,150,60,.6));animation:sfkFlash .45s ease-out forwards}@keyframes sfkFlash{0%{opacity:.8}100%{opacity:0}}' +
  '.sfk-wob{animation:sfkPop var(--d,1.35s) cubic-bezier(.2,.9,.3,1) forwards,sfkWob .18s 4 alternate}@keyframes sfkWob{to{margin-left:10px}}';
function injectCSS(id, css) { if (typeof document === 'undefined' || document.getElementById(id)) return; var s = document.createElement('style'); s.id = id; s.textContent = css; document.head.appendChild(s); }
function buildOverlay(canvas) {
  injectCSS('sfk-css', FXCSS); var par = canvas.parentElement; if (!par) return;
  try { if (getComputedStyle(par).position === 'static') par.style.position = 'relative'; } catch (e) {}
  var ov = document.createElement('div'); ov.className = 'sfk-ov'; par.appendChild(ov); K.ov = ov; posOverlay();
}
function posOverlay() { if (!K.ov || !K.canvas) return; var c = K.canvas; K.ov.style.left = c.offsetLeft + 'px'; K.ov.style.top = c.offsetTop + 'px'; K.ov.style.width = (c.clientWidth || K.w) + 'px'; K.ov.style.height = (c.clientHeight || K.h) + 'px'; }
function burstPath(cx, cy, R, r, n, jit, seed) { var Rn = seeded(seed || 3), pts = []; for (var i = 0; i < n * 2; i++) { var a = i / (n * 2) * Math.PI * 2 - Math.PI / 2, q = (i % 2 ? r : R) * (1 + (Rn() - .5) * jit); pts.push((cx + Math.cos(a) * q).toFixed(1) + ',' + (cy + Math.sin(a) * q).toFixed(1)); } return 'M' + pts.join('L') + 'Z'; }
function cloudPath(cx, cy, R) { var d = '', n = 9; for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2, a2 = (i + 1) / n * Math.PI * 2; var x1 = cx + Math.cos(a) * R, y1 = cy + Math.sin(a) * R * .72, x2 = cx + Math.cos(a2) * R, y2 = cy + Math.sin(a2) * R * .72; var mx = cx + Math.cos((a + a2) / 2) * R * 1.32, my = cy + Math.sin((a + a2) / 2) * R * .72 * 1.32; d += (i ? '' : 'M' + x1.toFixed(1) + ',' + y1.toFixed(1)) + 'Q' + mx.toFixed(1) + ',' + my.toFixed(1) + ' ' + x2.toFixed(1) + ',' + y2.toFixed(1); } return d + 'Z'; }
function popSVG(kind, size) {
  var W = size, H = size * .78, cx = W / 2, cy = H / 2, R = H * .5, sw = Math.max(4, size * .022);
  var cfg = {
    boom: { text: 'BOOM!', shape: 'burst', fill: '#ff5a1f', fill2: '#ffd23a', tc: '#ffef5a', ts: '#b3140c', n: 14 },
    lose: { text: 'KABOOM!', shape: 'burst', fill: '#e8261a', fill2: '#ff9a1f', tc: '#ffef5a', ts: '#5a0a06', n: 18 },
    phew: { text: 'PHEW!', shape: 'cloud', fill: '#bff3ff', fill2: '#ffffff', tc: '#16b3a6', ts: INK, n: 0 },
    cut: { text: 'SNIP!', shape: 'burst', fill: '#ffc928', fill2: '#fff6c8', tc: '#ffffff', ts: INK, n: 10 },
    wrong: { text: 'OOPS!', shape: 'burst', fill: '#8f5bff', fill2: '#d9c6ff', tc: '#ffe066', ts: INK, n: 11 },
    win: { text: 'DEFUSED!', shape: 'burst', fill: '#52c23a', fill2: '#ffe066', tc: '#ffffff', ts: '#1d5a12', n: 20 }
  }[kind] || { text: kind.toUpperCase(), shape: 'burst', fill: '#ffc928', fill2: '#fff', tc: '#fff', ts: INK, n: 12 };
  var shape = cfg.shape === 'cloud' ? '<path d="' + cloudPath(cx, cy, R * .82) + '" fill="' + cfg.fill + '" stroke="' + INK + '" stroke-width="' + sw + '" stroke-linejoin="round"/><path d="' + cloudPath(cx, cy - R * .04, R * .62) + '" fill="' + cfg.fill2 + '" opacity=".75"/>'
    : '<path d="' + burstPath(cx, cy, R * 1.0, R * .7, cfg.n, .28, size) + '" fill="' + cfg.fill + '" stroke="' + INK + '" stroke-width="' + sw + '" stroke-linejoin="round"/><path d="' + burstPath(cx, cy, R * .78, R * .56, cfg.n, .2, size + 7) + '" fill="' + cfg.fill2 + '"/>';
  var dotsP = ''; for (var i = 0; i < 18; i++) { var a = i * 2.39, rr2 = R * (.25 + (i % 6) * .08); dotsP += '<circle cx="' + (cx + Math.cos(a) * rr2 * 1.4).toFixed(1) + '" cy="' + (cy + Math.sin(a) * rr2).toFixed(1) + '" r="' + (size * .008).toFixed(1) + '" fill="rgba(255,255,255,.55)"/>'; }
  var fs = size * (cfg.text.length > 6 ? .17 : .22);
  var txt = '<text x="' + cx + '" y="' + (cy + fs * .36) + '" text-anchor="middle" font-family="' + FD.replace(/'/g, '&#39;') + '" font-size="' + fs.toFixed(1) + '" fill="' + cfg.ts + '" stroke="' + cfg.ts + '" stroke-width="' + (fs * .22).toFixed(1) + '" stroke-linejoin="round" transform="rotate(-6 ' + cx + ' ' + cy + ')">' + cfg.text + '</text>' +
    '<text x="' + cx + '" y="' + (cy + fs * .36) + '" text-anchor="middle" font-family="' + FD.replace(/'/g, '&#39;') + '" font-size="' + fs.toFixed(1) + '" fill="' + cfg.tc + '" stroke="' + INK + '" stroke-width="' + (fs * .06).toFixed(1) + '" stroke-linejoin="round" transform="rotate(-6 ' + cx + ' ' + cy + ')">' + cfg.text + '</text>';
  return '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' + shape + dotsP + txt + '</svg>';
}
function popup(kind, sx, sy, size, dur) {
  if (!K.ov && !K.ov2) return; var host = K.ov || K.ov2; var el = document.createElement('div'); el.className = 'sfk-pop' + (kind === 'wrong' ? ' sfk-wob' : ''); el.style.left = sx + 'px'; el.style.top = sy + 'px'; var dd = (dur || 1.35) / (K.speed || 1); el.style.setProperty('--d', dd + 's');
  el.innerHTML = popSVG(kind, Math.round(size)); host.appendChild(el); K.popN = (K.popN || 0) + 1;
  setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); K.popN--; }, dd * 1000 + 60);
}
function flash() { if (!K.ov) return; var f = document.createElement('div'); f.className = 'sfk-flash'; K.ov.insertBefore(f, K.ov.firstChild); K.popN = (K.popN || 0) + 1; f.style.animationDuration = (.5 / (K.speed || 1)) + 's'; setTimeout(function () { if (f.parentNode) f.parentNode.removeChild(f); K.popN--; }, 560 / (K.speed || 1)); if (GFX[K.q].post) { K.flash = .9; tween(.5, function (k) { K.flash = .9 * (1 - k); }); } }
function worldOf(at) {
  if (!K.on) return null; if (at == null) return null;
  if (at.isVector3) return at.clone();
  if (at === 'dial' || at.kind === 'dial') return K.dial.ball.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 1.2, 0));
  if (typeof at === 'string' || typeof at === 'number') { var r = K.recs[at]; return r ? r.p.clone() : null; }
  if (at.tile != null && K.recs[at.tile]) return K.recs[at.tile].p.clone();
  if (at.id != null && K.recs[at.id]) return K.recs[at.id].p.clone();
  if (at.kind === 'dial' || at === 'dial') return K.dial.tipWorld ? K.dial.tipWorld.clone() : K.dial.group.position.clone();
  if (at.x != null && at.z != null) return new THREE.Vector3(at.x, at.y || 0, at.z);
  return null;
}
function toScreen(v) { var p = v.clone().project(K.cam); return [(p.x + 1) / 2 * K.w, (1 - p.y) / 2 * K.h]; }
SFKit.fx = function (kind, at) {
  if (!K.on) { fx2D(kind); return; }
  var w = worldOf(at); var sx, sy; if (at && at.screen) { sx = at.screen[0]; sy = at.screen[1]; } else if (w) { var s = toScreen(w); sx = s[0]; sy = s[1]; } else { sx = K.w / 2; sy = K.h * .42; }
  sx = clamp(sx, K.w * .2, K.w * .8); sy = clamp(sy, K.h * .18, K.h * .82); var base = Math.min(K.w, K.h);
  var wp = w || new THREE.Vector3(0, 1, 0);
  if (kind === 'boom') { popup('boom', sx, sy, base * .55); shake(.9, .65); burst(wp, 'fire', 22); burst(wp, 'smoke', 14); burst(wp, 'spark', 26); flash(); }
  else if (kind === 'lose') { popup('lose', K.w / 2, K.h * .42, base * .85, 2.0); shake(1.6, 1.1); var bp = K.dial.ball.getWorldPosition(new THREE.Vector3()); burst(bp, 'fire', 40); burst(bp, 'smoke', 28); burst(bp, 'spark', 40); flash(); }
  else if (kind === 'phew') { popup('phew', sx, sy, base * .45); burst(wp, 'sparkle', 18); }
  else if (kind === 'cut') { popup('cut', sx, sy - base * .06, base * .26, 1.0); burst(wp.clone().add(new THREE.Vector3(0, .5, 0)), 'spark', 18); }
  else if (kind === 'wrong') { popup('wrong', sx, sy, base * .36); shake(.35, .35); burst(wp, 'smoke', 6); }
  else if (kind === 'win') { popup('win', K.w / 2, K.h * .4, base * .8, 2.2); confetti(); burst(new THREE.Vector3(0, 2, 0), 'sparkle', 30); }
  else popup(kind, sx, sy, base * .35);
  K.dirty = true;
};
function shake(amp, dur) { K.shk = { amp: amp, t0: now(), d: dur * 1000 / (K.speed || 1) }; }

/* ------------------------------------------------------------------ highlight & pick */
SFKit.highlight = function (targets, opts) {
  K.st.highlight = (targets || []).slice(); K.hlOpts = opts || {};
  if (!K.on) { render2DAuto(); return; } refreshHighlight();
};
function normTarget(t) { if (t == null) return null; if (typeof t === 'string' || typeof t === 'number') { var s = String(t); if (s.indexOf('tile:') === 0) return { kind: 'tile', id: s.slice(5) }; if (s === 'dial') return { kind: 'dial' }; return { kind: 'tile', id: t }; } if (!t.kind && t.id != null) return { kind: 'tile', id: t.id }; return t; }
function refreshHighlight() {
  if (!K.on) return; var list = (K.st.highlight || []).map(normTarget).filter(Boolean);
  K.hlTiles = list.filter(function (t) { return t.kind === 'tile' && K.recs[t.id]; }).map(function (t) { return t.id; });
  // generic hulls
  (K.hlHulls || []).forEach(function (h) { if (h.parent) h.parent.remove(h); }); K.hlHulls = [];
  var col = new THREE.Color(K.hlOpts && K.hlOpts.color || '#c8ff3a');
  K.glow1.material.uniforms.uCol.value.copy(col).multiplyScalar(2.2); K.glow2.material.uniforms.uCol.value.copy(col).multiplyScalar(1.6);
  list.forEach(function (t) {
    var meshes = [];
    if (t.kind === 'stand') K.rows.forEach(function (r) { if (r.seat === t.seat && (t.stand == null || r.stand === t.stand)) meshes.push(r.mesh); });
    else if (t.kind === 'equipment') { for (var k in K.eqCards) { var o = K.eqCards[k]; if (o.userData.mesh.userData.pick.id === t.id || o.userData.mesh.userData.pick.index === t.index) meshes.push(o.userData.mesh); } }
    else if (t.kind === 'character') { var c = K.chCards && K.chCards['ch' + t.seat]; if (c) meshes.push(c.userData.mesh); }
    else if (t.kind === 'mission') { if (K.mCards && K.mCards.mission) meshes.push(K.mCards.mission.userData.mesh); }
    else if (t.kind === 'number') { for (var k2 in K.mCards) { var m2 = K.mCards[k2]; if (m2.userData.mesh && m2.userData.mesh.userData.pick && m2.userData.mesh.userData.pick.kind === 'number' && m2.userData.mesh.userData.pick.value === t.value) meshes.push(m2.userData.mesh); } }
    else if (t.kind === 'dial') meshes.push(K.dial.house);
    else if (t.kind === 'seat') { K.seatBits.forEach(function (g) { if (g.userData.seat === t.seat) meshes.push(g.userData.board); }); }
    else if (t.kind === 'track') { var tp = K.trackPicks[t.value - 1]; if (tp) { var ring = new THREE.Mesh(gq('hlRing', function () { var r = new THREE.RingGeometry(.44, .7, 32); r.rotateX(-Math.PI / 2); return r; }), new THREE.MeshBasicMaterial({ color: col.clone().multiplyScalar(2.2), transparent: true, opacity: .95, depthWrite: false, blending: THREE.AdditiveBlending })); ring.position.copy(tp.position); ring.position.y += .02; K.gGlow.add(ring); K.hlHulls.push(ring); } }
    meshes.forEach(function (m) { if (!m) return; var g = m.geometry; if (!g.boundingBox) g.computeBoundingBox(); var bb = g.boundingBox, sz = bb.getSize(new THREE.Vector3()), c0 = bb.getCenter(new THREE.Vector3()); var ws = new THREE.Vector3(); m.getWorldScale(ws);
      [[.1, .95, false, 2.2], [.26, .4, true, 1.6]].forEach(function (L) { var e = L[0] / Math.max(.3, ws.x); var hm = hullMat('#ffffff', L[1], L[2]); hm.uniforms.uCol.value.copy(col).multiplyScalar(L[3]); hm.uniforms.uScale.value.set((sz.x + 2 * e) / Math.max(.01, sz.x), (sz.y + 2 * e) / Math.max(.01, sz.y), (sz.z + 2 * e) / Math.max(.01, sz.z)); var h = new THREE.Mesh(g, hm); h.position.copy(c0).multiply(new THREE.Vector3(1, 1, 1).sub(hm.uniforms.uScale.value)); h.renderOrder = L[2] ? 3 : 1; h.userData.base = L[1]; m.add(h); K.hlHulls.push(h); }); });
  });
  writeTiles(); K.dirty = true;
}
SFKit.pick = function (cx, cy) {
  if (!K.on) return null; var rc = K.canvas.getBoundingClientRect(); var nx = ((cx - rc.left) / (rc.width || K.w)) * 2 - 1, ny = -((cy - rc.top) / (rc.height || K.h)) * 2 + 1;
  K.ray.setFromCamera(new THREE.Vector2(nx, ny), K.cam);
  var objs = [K.tileMesh, K.gStands, K.gCards, K.gTok, K.gBoard, K.dial.group];
  var hits = K.ray.intersectObjects(objs, true);
  for (var i = 0; i < hits.length; i++) {
    var h = hits[i];
    if (h.object === K.tileMesh && h.instanceId != null) { var r = K.byIdx[h.instanceId]; if (r && r.key !== '__gone') { var a = r.key.split(':'); return { kind: 'tile', id: r.id, seat: +a[0], stand: +a[1], index: r.slot, tile: r.data, point: h.point }; } continue; }
    var o = h.object; while (o && !(o.userData && o.userData.pick)) o = o.parent; if (o) { var d = {}; for (var k in o.userData.pick) d[k] = o.userData.pick[k]; d.point = h.point; return d; }
  }
  return null;
};
SFKit.hover = function (cx, cy) {
  if (!K.on) return null; var p = cx == null ? null : SFKit.pick(cx, cy); var id = p && p.kind === 'tile' ? p.id : null;
  if (id === K.hoverId) return p; var prev = K.recs[K.hoverId]; K.hoverId = id;
  [prev, K.recs[id]].forEach(function (rec, i) { if (!rec || rec.data.cut) return; var to = i ? .22 : 0, from = rec.lift || 0; tween(.18, function (k) { rec.lift = lerp(from, to, E.outCubic(k)); if (!rec.anim) { var tp = tilePose(rec); rec.p.copy(tp.p); } }); });
  if (K.canvas) K.canvas.style.cursor = p ? 'pointer' : '';
  return p;
};
/* ease the camera toward an element (zoom > 1) or back to the whole table (null) */
SFKit.focus = function (at, zoom) {
  if (!K.on) return; if (at == null) { K.focusT = null; fitCamera(false); return; }
  var w = worldOf(at) || (at.kind === 'stand' ? standCenter(at) : null); if (!w) return; K.focusT = { at: at, zoom: zoom || 2.5 };
  var F = K.camFit || K.camState; var dir = F.pos.clone().sub(F.look), d = dir.length() / (zoom || 2.5); dir.normalize();
  var look = w.clone(), pos = look.clone().addScaledVector(dir, d), l0 = K.camState.look.clone(), p0 = K.camState.pos.clone();
  if (K.camState.tw) killTween(K.camState.tw); K.camState.tw = tween(.7, function (k) { var e = E.inOut(k); K.camState.look.lerpVectors(l0, look, e); K.camState.pos.lerpVectors(p0, pos, e); });
};
function standCenter(t) { var ps = K.rows.filter(function (r) { return r.seat === t.seat && (t.stand == null || r.stand === t.stand); }); if (!ps.length) return null; var v = new THREE.Vector3(); ps.forEach(function (r) { v.add(rowLocal(r, 0, .8, .9)); }); return v.multiplyScalar(1 / ps.length); }
/* screen position of an element (for UI anchoring) */
SFKit.screenOf = function (at) { var w = worldOf(at); if (!w) return null; var s = toScreen(w); return { x: s[0], y: s[1] }; };

/* ------------------------------------------------------------------ camera fit */
SFKit.resize = function (w, h, insets) {
  K.w = Math.max(50, w | 0); K.h = Math.max(50, h | 0); if (insets) K.insets = insets;
  if (!K.on) { return; }
  var oldMode = K.layout && K.layout.mode; resizeInternal(K.w, K.h);
  var aspect = K.w / K.h, mode = aspect < .82 ? 'column' : 'ring';
  if (mode !== oldMode) relayout(true); else fitCamera(false);
  posOverlay(); K.dirty = true;
};
function resizeInternal(w, h) {
  K.r.setSize(w, h, true); K.cam.aspect = w / h; K.cam.updateProjectionMatrix();
  if (K.post) { var pr = K.r.getPixelRatio(); K.post.setSize(Math.round(w * pr), Math.round(h * pr)); }
}
function fitCamera(instant) {
  var L = K.layout; if (!L) return; var B = L.box, T = L.table, cam = K.cam;
  var col = L.mode === 'column'; var el = (col ? 60 : 54) * Math.PI / 180;
  cam.fov = col ? 34 : 36; cam.aspect = K.w / K.h; cam.updateProjectionMatrix();
  var pts = []; var xs = [Math.max(B.x0 - .3, T.x0), Math.min(B.x1 + .3, T.x1)], zs = [Math.max(B.z0 - .3, T.z0), Math.min(B.z1 + .3, T.z1)];
  xs.forEach(function (x) { zs.forEach(function (z) { pts.push(new THREE.Vector3(x, 0, z)); pts.push(new THREE.Vector3(x, 1.9, z)); }); });
  var ins = K.insets || {}; var mt = (ins.top || 0) / K.h * 2 + .04, mb = (ins.bottom || 0) / K.h * 2 + .04, ml = (ins.left || 0) / K.w * 2 + .03, mr = (ins.right || 0) / K.w * 2 + .03;
  var look = new THREE.Vector3((B.x0 + B.x1) / 2, 0, (B.z0 + B.z1) / 2), dir = new THREE.Vector3(0, Math.sin(el), Math.cos(el));
  var test = function (d) { cam.position.copy(look).addScaledVector(dir, d); cam.lookAt(look); cam.updateMatrixWorld(); var mnx = 9, mxx = -9, mny = 9, mxy = -9; for (var i = 0; i < pts.length; i++) { var p = pts[i].clone().project(cam); mnx = Math.min(mnx, p.x); mxx = Math.max(mxx, p.x); mny = Math.min(mny, p.y); mxy = Math.max(mxy, p.y); } return { mnx: mnx, mxx: mxx, mny: mny, mxy: mxy }; };
  var d = 40;
  for (var it = 0; it < 5; it++) {
    var lo = 5, hi = 300; for (var k = 0; k < 30; k++) { var mid = (lo + hi) / 2, r = test(mid); var fitx = r.mnx >= -1 + ml && r.mxx <= 1 - mr, fity = r.mny >= -1 + mb && r.mxy <= 1 - mt; if (fitx && fity) hi = mid; else lo = mid; } d = hi;
    var r2 = test(d); var cy = (r2.mny + r2.mxy) / 2 - ((-1 + mb) + (1 - mt)) / 2, cxo = (r2.mnx + r2.mxx) / 2 - ((-1 + ml) + (1 - mr)) / 2;
    var up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion), right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion);
    var hH = Math.tan(cam.fov * Math.PI / 360) * d, hW = hH * cam.aspect;
    look.addScaledVector(up, cy * hH).addScaledVector(right, cxo * hW);
  }
  var pos = look.clone().addScaledVector(dir, d); K.camFit = { look: look.clone(), pos: pos.clone() };
  if (K.focusT && !instant) { K.camState.ready = true; SFKit.focus(K.focusT.at, K.focusT.zoom); return; }
  if (instant || !K.camState.ready) { K.camState.look.copy(look); K.camState.pos.copy(pos); K.camState.ready = true; K.camState.to = null; }
  else { var l0 = K.camState.look.clone(), p0 = K.camState.pos.clone(); if (K.camState.tw) killTween(K.camState.tw); K.camState.tw = tween(.6, function (k) { var e = E.inOut(k); K.camState.look.lerpVectors(l0, look, e); K.camState.pos.lerpVectors(p0, pos, e); }); }
  applyCam();
}
function applyCam() { var c = K.cam, s = K.camState; c.position.copy(s.pos); c.lookAt(s.look); if (K.shk) { var k = (now() - K.shk.t0) / K.shk.d; if (k >= 1) K.shk = null; else { var a = K.shk.amp * Math.pow(1 - k, 2) * .35; c.position.x += (Math.random() - .5) * a; c.position.y += (Math.random() - .5) * a; c.position.z += (Math.random() - .5) * a; c.rotateZ((Math.random() - .5) * a * .02); } } }

/* ------------------------------------------------------------------ loop */
function idleActive() { return true; }
SFKit.isAnimating = function () { if (!K.on) return (K.popN || 0) > 0; return K.tw.length > 0 || !!K.shk || !!(K.conf && K.conf.on) || (K.popN || 0) > 0 || K.parts.some(function (p) { return p.alive && p.fx; }); };
function loop(t) {
  if (!K.loopOn) return; requestAnimationFrame(loop);
  var fr = K.frame; var dt = fr.last ? Math.min(.1, (t - fr.last) / 1000) : .016, rdt = fr.last ? Math.min(5, (t - fr.last) / 1000) : .016; var interval = fr.last ? t - fr.last : 16; fr.last = t;
  var tt = t / 1000;
  var hadTw = K.tw.length > 0; updTweens(now()); updParticles(dt * (K.speed || 1), rdt); updConfetti(dt, rdt); updDial(tt, dt);
  // highlight pulse
  if (K.hlTiles && K.hlTiles.length || (K.hlHulls && K.hlHulls.length)) { var pu = .5 + .5 * Math.sin(tt * 5); K.glow2.material.uniforms.uOp.value = .3 + .35 * pu; K.glow1.material.uniforms.uOp.value = .85 + .15 * pu; (K.hlHulls || []).forEach(function (h) { if (h.material.uniforms) h.material.uniforms.uOp.value = (h.userData.base || .9) * (.75 + .25 * pu); else h.material.opacity = .6 + .4 * pu; }); }
  // turn indicator
  if (K.seatBits) K.seatBits.forEach(function (g) { var on = g.userData.seat === K.st.turn; var tgt = on ? 1 : 0; g.userData.on = lerp(g.userData.on || 0, tgt, Math.min(1, dt * 8)); var b = g.userData.board; b.position.y = 1.75 + g.userData.on * (.25 + Math.sin(tt * 4) * .08); b.rotation.z = g.userData.on * Math.sin(tt * 3) * .06; });
  if (K.mCards && K.mCards.seqArrow) K.mCards.seqArrow.position.y = K.mCards.seqArrow.userData.baseY + Math.abs(Math.sin(tt * 3)) * .25;
  if (hadTw || K.tw.length || (K.hlTiles && K.hlTiles.length)) writeTiles();
  applyCam();
  var t0 = now(); draw(); var rt = now() - t0;
  fr.n++; fr.hist.push(interval); if (fr.hist.length > 120) fr.hist.shift(); fr.rh = fr.rh || []; fr.rh.push(rt); if (fr.rh.length > 120) fr.rh.shift();
  if (K.first) K.first = false;
  // auto step-down when frames drop badly for ~3 s (auto preference only)
  if (K.pref === 'auto' && fr.hist.length >= 60) { var bad = fr.bad || 0; if (interval > 55) bad += interval; else bad = Math.max(0, bad - interval * .5); fr.bad = bad; if (bad > 3000) { fr.bad = 0; var nq = K.q === 'high' ? 'medium' : K.q === 'medium' ? 'low' : null; if (nq) applyQ(nq); } }
}
function draw() {
  var r = K.r; r.info.autoReset = false; r.info.reset();
  if (GFX[K.q].post && K.post) K.post.render(); else { r.setRenderTarget(null); r.render(K.scene, K.cam); }
}
SFKit.stats = function () {
  var f = K.frame, avg = function (a) { if (!a || !a.length) return 0; var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s / a.length; };
  var r = K.r ? K.r.info.render : {};
  return { quality: K.q, frameMs: +avg(f.hist).toFixed(2), renderMs: +avg(f.rh).toFixed(2), fps: f.hist.length ? +(1000 / avg(f.hist)).toFixed(1) : 0, draws: r.calls, triangles: r.triangles, frames: f.n };
};
SFKit.resetStats = function () { K.frame.hist = []; K.frame.rh = []; K.frame.n = 0; };
SFKit.renderOnce = function () { if (K.on) { applyCam(); draw(); } };
SFKit.dispose = function () {
  K.loopOn = false; if (!K.on) { if (K.fallback) K.fallback.innerHTML = ''; return; }
  K.scene.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(function (m) { if (m.map) m.map.dispose(); m.dispose(); }); });
  K.paints.forEach(function (p) { p.t.dispose(); }); K.paints = []; K.texc = {}; K.geoc = {};
  if (K.post) { K.post.rt.dispose(); K.post.a.dispose(); K.post.b.dispose(); K.post = null; }
  if (K.env) K.env.dispose(); K.r.dispose(); if (K.ov && K.ov.parentNode) K.ov.parentNode.removeChild(K.ov);
  K.recs = {}; K.rows = []; K.tw = []; K.parts = []; K.on = false; K.mode = null; K.first = true; K.boardMode = null; K.tableKey = null; K.standMats = null; K.eqCards = K.mCards = K.chCards = K.bTok = K.tileTok = null;
};
SFKit._dbgPose = function (id) { var r = K.recs[id]; var row = rowOf(r.key, r.slot); var tp = tilePose(r); return { row: row ? [row.key, row.from, row.to, row.m] : null, rows: K.rows.map(function (q) { return [q.key, q.from, q.to]; }), tp: tp.p.toArray(), ts: tp.s.x, tw: K.tw.length, sp: K.speed }; };
SFKit._animDebug = function () { return { tw: K.tw.length, shk: !!K.shk, conf: !!(K.conf && K.conf.on), pop: K.popN || 0, fx: K.parts.filter(function (p) { return p.alive && p.fx; }).length }; };
SFKit.getState = function () { return JSON.parse(JSON.stringify(K.st)); };

/* ================================================================== 2D fallback (DOM + SVG) */
var CSS2D = '.sf2d{font-family:' + FB + ';color:' + INK + ';background:radial-gradient(120% 90% at 50% 20%,#ffe3b0,#f2a86a);padding:10px;box-sizing:border-box;display:flex;flex-direction:column;gap:10px;min-height:100%;position:relative;overflow:hidden}' +
  '.sf2d *{box-sizing:border-box}.sf2d-h{font-family:' + FD + ';letter-spacing:.5px}' +
  '.sf2d-seat{background:linear-gradient(#fff6e2,#f5dfb4);border:3px solid ' + INK + ';border-radius:14px;padding:6px 8px 8px;box-shadow:0 4px 0 rgba(28,24,56,.35)}' +
  '.sf2d-seat.me{border-color:' + INK + ';box-shadow:0 4px 0 rgba(28,24,56,.35),inset 0 0 0 3px var(--sc)}.sf2d-seat.turn{outline:4px solid #ffe066;outline-offset:2px}' +
  '.sf2d-name{display:inline-block;font-family:' + FD + ';color:#fff;background:var(--sc);border:2px solid ' + INK + ';border-radius:10px;padding:0 10px;margin-bottom:6px;text-shadow:0 2px 0 ' + INK + '}' +
  '.sf2d-stand{display:flex;flex-wrap:wrap;gap:4px;padding:6px;border-radius:10px;background:var(--sc);border:2px solid ' + INK + ';margin-bottom:4px}' +
  '.sf2d-slot{display:flex;flex-direction:column;align-items:center;gap:2px;min-width:34px}' +
  '.sf2d-t{position:relative;width:34px;height:50px;border-radius:8px;border:3px solid ' + CREAM + ';box-shadow:0 0 0 2px ' + INK + ',0 3px 0 2px rgba(28,24,56,.5);display:flex;align-items:center;justify-content:center;flex-direction:column;font-family:' + FD + ';font-size:24px;line-height:1;color:#fff;text-shadow:-2px -2px 0 #0f1f5c,2px -2px 0 #0f1f5c,-2px 2px 0 #0f1f5c,2px 2px 0 #0f1f5c}' +
  '.sf2d-t small{font-size:11px;margin-top:1px}.sf2d-t.blue{background:linear-gradient(#56a6ff,#1c62d9)}.sf2d-t.red{background:linear-gradient(#ff6048,#c11d1d)}.sf2d-t.yellow{background:linear-gradient(#ffe455,#ffb300);color:' + INK + ';text-shadow:none}' +
  '.sf2d-t.back{background:repeating-linear-gradient(45deg,#454d8e 0 6px,#3a4180 6px 12px)}.sf2d-t.back:after{content:"";width:16px;height:16px;border-radius:50%;background:' + CREAM + ';border:2px solid ' + INK + '}' +
  '.sf2d-t.u69 span{text-decoration:underline}.sf2d-t.cut{transform:translateY(6px) scale(.92);filter:saturate(.9);box-shadow:0 0 0 2px ' + INK + ',0 0 0 5px #7be35a}' +
  '.sf2d-t.cut:before{content:"\\2702";position:absolute;top:-9px;right:-9px;font-size:12px;line-height:16px;width:16px;height:16px;border-radius:50%;background:#7be35a;color:' + INK + ';text-shadow:none;border:2px solid ' + INK + '}' +
  '.sf2d-hl{animation:sf2dP 1s infinite alternate}@keyframes sf2dP{from{box-shadow:0 0 0 2px ' + INK + ',0 0 0 5px #c8ff3a,0 0 10px 4px #c8ff3a}to{box-shadow:0 0 0 2px ' + INK + ',0 0 0 7px #c8ff3a,0 0 18px 8px #c8ff3a}}' +
  '.sf2d-tok{min-width:22px;height:22px;border-radius:50%;border:2px solid ' + INK + ';font:12px/18px ' + FD + ';text-align:center;color:#fff;background:#1f5fcf;padding:0 3px}.sf2d-tok.y{background:#ffc928;color:' + INK + '}.sf2d-tok.p{background:#7343d9}.sf2d-tok.o{background:#e8681c}.sf2d-tok.x{background:#24203f;color:#ff4a3a}.sf2d-tok.v{background:#2e9e2a}.sf2d-tok.e{background:#fff;color:' + INK + ';border-radius:6px}' +
  '.sf2d-lt{font:11px ' + FD + ';color:#fff;text-shadow:0 1px 0 ' + INK + '}' +
  '.sf2d-board{background:linear-gradient(#2c9db0,#1f7489);border:4px solid ' + INK + ';outline:6px solid #ffc928;border-radius:16px;padding:10px;display:flex;flex-wrap:wrap;gap:10px;align-items:flex-start;color:#fff}' +
  '.sf2d-panel{background:rgba(255,242,212,.95);color:' + INK + ';border:3px solid ' + INK + ';border-radius:12px;padding:6px 8px}.sf2d-panel h4{margin:0 0 4px;font:16px ' + FD + ';color:#ff8a1f;text-shadow:0 1px 0 ' + INK + '}' +
  '.sf2d-track{display:flex;flex-wrap:wrap;gap:3px}.sf2d-tv{width:26px;height:26px;border-radius:50%;background:#1f5fcf;border:2px solid ' + INK + ';color:#fff;font:13px/22px ' + FD + ';text-align:center;position:relative}.sf2d-tv.ok{background:#2e9e2a}.sf2d-tv i{position:absolute;top:-6px;right:-6px;width:12px;height:12px;border-radius:50%;border:2px solid ' + INK + ';font:8px/8px ' + FD + ';font-style:normal}' +
  '.sf2d-card{display:inline-flex;flex-direction:column;width:84px;min-height:106px;margin:2px;border-radius:10px;border:3px solid ' + INK + ';background:#2b2f63;color:#fff;padding:4px;font-size:10px;vertical-align:top;box-shadow:0 3px 0 rgba(28,24,56,.4)}' +
  '.sf2d-card b{font:12px ' + FD + ';background:#ff8a1f;border:2px solid ' + INK + ';border-radius:6px;padding:1px 4px;margin-bottom:3px;text-shadow:0 1px 0 ' + INK + '}.sf2d-card.locked{opacity:.65}.sf2d-card.used{background:repeating-linear-gradient(45deg,#2b2f63 0 6px,#353a75 6px 12px)}.sf2d-card .st{margin-top:auto;font:11px ' + FD + ';color:#ffe066}' +
  '.sf2d-pop{position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);pointer-events:none;animation:sfkPop 1.4s cubic-bezier(.2,.9,.3,1) forwards;z-index:9}' +
  '.sf2d-conf{position:absolute;top:-20px;width:9px;height:14px;animation:sf2dF 2.6s linear forwards;pointer-events:none}@keyframes sf2dF{to{transform:translateY(110vh) rotate(720deg)}}';
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function attr(o) { return esc(JSON.stringify(o)); }
function tile2D(t, mine, hl, seat, stand, idx) {
  var up = mine || t.known || t.cut; var c = t.color || 'blue', cls = 'sf2d-t ' + (up ? c : 'back') + (t.cut ? ' cut' : '') + (hl ? ' sf2d-hl' : '') + (up && c === 'blue' && (t.value === 6 || t.value === 9) ? ' u69' : '');
  var inner = '';
  if (up) { if (c === 'blue') inner = '<span>' + esc(t.value) + '</span>'; else if (c === 'red') inner = '<svg width="20" height="20" viewBox="-12 -14 26 26"><circle r="8" fill="' + INK + '" stroke="#fff" stroke-width="2"/><path d="M4-6Q8-11 11-9" stroke="#fff" stroke-width="2.5" fill="none"/><circle cx="-3" cy="-3" r="2" fill="#fff"/></svg>' + (t.value != null ? '<small>' + esc(t.value) + '</small>' : ''); else inner = '<svg width="20" height="22" viewBox="-10 -11 20 22"><path d="M2-10-6 1H0L-3 10 6-2H0L4-10Z" fill="' + INK + '" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>' + (t.value != null ? '<small>' + esc(t.value) + '</small>' : ''); }
  var label = up ? (c === 'blue' ? 'blue ' + t.value : c + ' wire' + (t.value != null ? ' ' + t.value : '')) : 'hidden wire';
  return '<div class="' + cls + '" role="img" aria-label="' + esc(label + (t.cut ? ', cut' : '')) + '" data-sf="' + attr({ kind: 'tile', id: t.id, seat: seat, stand: stand, index: idx }) + '">' + inner + '</div>';
}
function tok2D(v) { var k = tokenKey(v); if (!k) return ''; var a = k.split(':'); var cls = { info: '', yinfo: 'y', even: 'p', odd: 'p', cnt: 'o', x: 'x', eq: 'e', neq: 'e' }[a[0]]; var txt = { info: a[1], yinfo: '⚡', even: 'EV', odd: 'OD', cnt: '×' + a[1], x: 'X', eq: '=', neq: '≠' }[a[0]]; return '<div class="sf2d-tok ' + cls + '">' + esc(txt) + '</div>'; }
function dialSVG(v, max) {
  var n = max + 1, s = '', R = 54, cx = 64, cy = 64;
  for (var i = 0; i < n; i++) { var val = max - i, a0 = (-135 + i * 270 / n - 90) * Math.PI / 180, a1 = (-135 + (i + 1) * 270 / n - 90) * Math.PI / 180; var hue = val === 0 ? 0 : 8 + 112 * val / max; s += '<path d="M' + cx + ',' + cy + 'L' + (cx + Math.cos(a0) * R).toFixed(1) + ',' + (cy + Math.sin(a0) * R).toFixed(1) + 'A' + R + ',' + R + ' 0 0 1 ' + (cx + Math.cos(a1) * R).toFixed(1) + ',' + (cy + Math.sin(a1) * R).toFixed(1) + 'Z" fill="' + (val === 0 ? '#2a1a3a' : 'hsl(' + hue + ',82%,56%)') + '" stroke="' + INK + '" stroke-width="2.5"/>'; var am = (a0 + a1) / 2; s += '<text x="' + (cx + Math.cos(am) * R * .68).toFixed(1) + '" y="' + (cy + Math.sin(am) * R * .68 + 5).toFixed(1) + '" text-anchor="middle" font-family="' + FD.replace(/'/g, '&#39;') + '" font-size="15" fill="#fff" stroke="' + INK + '" stroke-width="3" paint-order="stroke">' + (val === 0 ? '☠' : val) + '</text>'; }
  var ang = -135 + (max - v + .5) * 270 / n; s += '<g transform="rotate(' + ang.toFixed(1) + ' 64 64)"><path d="M61,70 67,70 65.5,18 64,14 62.5,18Z" fill="' + INK + '"/><circle cx="64" cy="18" r="3" fill="#ff4a3a"/></g><circle cx="64" cy="64" r="8" fill="#dfe3f2" stroke="' + INK + '" stroke-width="2"/>';
  return '<svg width="128" height="118" viewBox="0 0 128 118" role="img" aria-label="Detonator dial ' + v + ' of ' + max + '"><circle cx="64" cy="64" r="60" fill="#ef3b2d" stroke="' + INK + '" stroke-width="4"/>' + s + '</svg>';
}
function render2D(container, state) {
  if (!container) return; injectCSS('sfk-css', FXCSS); injectCSS('sfk-css2d', CSS2D);
  var S = state || K.st, n = S.n || S.players || 4, my = S.my != null ? S.my : (S.mySeat || 0), names = S.names || [];
  var hl = {}; (S.highlight || []).map(normTarget).forEach(function (t) { if (t) hl[t.kind + ':' + (t.id != null ? t.id : t.seat != null ? t.seat : t.value != null ? t.value : '')] = 1; });
  var stands = S.stands || {}; if (Array.isArray(stands)) { var o = {}; stands.forEach(function (s) { o[s.seat + ':' + (s.idx || s.stand || 0)] = s.tiles; }); stands = o; }
  var html = '<div class="sf2d" data-sf2d="1">';
  var order = []; for (var i = 1; i < n; i++) order.push((my + i) % n); order.push(my);
  var seatHTML = function (s) {
    var mine = s === my, col = SEATC[s % 5], keys = Object.keys(stands).filter(function (k) { return +k.split(':')[0] === s; }).sort();
    var h = '<div class="sf2d-seat' + (mine ? ' me' : '') + (S.turn === s ? ' turn' : '') + '" style="--sc:' + col + '" data-sf="' + attr({ kind: 'seat', seat: s }) + '"><span class="sf2d-name">' + (S.captain === s ? '★ ' : '') + esc(mine ? 'You' : (names[s] || 'Crew ' + (s + 1))) + '</span>';
    var ch = (S.characters || []).filter(function (c) { return c.seat === s; })[0]; if (ch) h += ' <small><b>' + esc(ch.name) + '</b> · ' + esc(ITEM_NAMES[ch.item] || ch.item || 'Double Probe') + (ch.used ? ' (used)' : '') + '</small>';
    keys.forEach(function (k) { var st = +k.split(':')[1]; h += '<div class="sf2d-stand' + (hl['stand:' + s] ? ' sf2d-hl' : '') + '" data-sf="' + attr({ kind: 'stand', seat: s, stand: st }) + '">'; (stands[k] || []).forEach(function (t, idx) { h += '<div class="sf2d-slot">' + tile2D(t, mine, hl['tile:' + t.id], s, st, idx) + tok2D(t.infoToken) + tok2D(t.marker) + '<span class="sf2d-lt">' + String.fromCharCode(65 + idx) + '</span></div>'; }); h += '</div>'; });
    return h + '</div>';
  };
  order.slice(0, -1).forEach(function (s) { html += seatHTML(s); });
  // board
  var D = S.dial || { value: 0, max: 4 }, T = S.tokens || {}, val = {}; (T.validation || []).forEach(function (v) { val[v] = 1; }); var mk = {}; (T.markers || []).forEach(function (m) { mk[Math.floor(m.value)] = m; });
  html += '<div class="sf2d-board"><div class="sf2d-panel"' + (hl['dial:'] ? ' style="box-shadow:0 0 0 4px #c8ff3a"' : '') + ' data-sf="' + attr({ kind: 'dial' }) + '"><h4>DETONATOR</h4>' + dialSVG(D.value, D.max) + '</div>';
  html += '<div class="sf2d-panel" style="flex:1;min-width:200px"><h4>DEFUSE TRACK</h4><div class="sf2d-track">'; for (var v = 1; v <= 12; v++) { var m = mk[v]; html += '<div class="sf2d-tv' + (val[v] ? ' ok' : '') + '" data-sf="' + attr({ kind: 'track', value: v }) + '">' + (val[v] ? '✓' : v) + (m ? '<i style="background:' + (m.color === 'red' ? '#ef3b2d' : '#ffc928') + '">' + (m.unknown || m.q ? '?' : '') + '</i>' : '') + '</div>'; } html += '</div>';
  if (T.oxygen) html += '<div style="margin-top:4px">O₂ reserve: <b>' + esc(T.oxygen.reserve || 0) + '</b></div>';
  if (T.robot) html += '<div>Robot on ' + esc(T.robot.pos) + '</div>';
  html += '</div>';
  var M = S.mission || {}; if (M.mission) html += '<div class="sf2d-panel" style="max-width:220px" data-sf="' + attr({ kind: 'mission' }) + '"><h4>MISSION ' + esc(M.mission.number) + '</h4><b>' + esc(M.mission.name) + '</b><div style="font-size:11px">' + esc(shortText(M.mission.text || M.mission.rules)) + '</div></div>';
  var ex = ''; (M.numbers || []).forEach(function (nv) { var vv = nv.value != null ? nv.value : nv; ex += '<span class="sf2d-tok o" data-sf="' + attr({ kind: 'number', value: vv }) + '">' + esc(vv) + '</span> '; }); if (M.sequence) ex += '<span class="sf2d-tok p">SEQ ' + esc(M.sequence.side || 'A') + '</span> '; (M.constraints || []).forEach(function (c) { ex += '<span class="sf2d-tok x" title="' + esc(CONSTRAINT_TXT[c.letter]) + '">' + esc(c.letter) + '</span> '; }); (M.challenges || []).forEach(function (c) { ex += '<span class="sf2d-tok v" title="' + esc(CHALLENGE_TXT[c.n]) + '">' + esc(c.n) + '</span> '; });
  if (ex) html += '<div class="sf2d-panel"><h4>BRIEFING</h4>' + ex + '</div>';
  var eq = S.equipment || []; if (eq.length) { html += '<div class="sf2d-panel" style="flex-basis:100%"><h4>GEAR</h4>'; eq.forEach(function (c, i) { var stt = c.state || (c.used ? 'used' : c.unlocked || c.ready ? 'ready' : 'locked'); var uv = c.unlock && typeof c.unlock === 'object' ? c.unlock.value : c.unlock; html += '<div class="sf2d-card ' + stt + (hl['equipment:' + c.id] ? ' sf2d-hl' : '') + '" data-sf="' + attr({ kind: 'equipment', id: c.id, index: i }) + '"><b>' + esc(uv) + ' · ' + esc(c.name) + '</b><span>' + esc(c.short || shortText(c.effect)) + '</span><span class="st">' + (stt === 'locked' ? '🔒 LOCKED' : stt === 'ready' ? '✔ READY' : 'USED') + '</span></div>'; }); html += '</div>'; }
  html += '</div>' + seatHTML(my) + '</div>';
  container.innerHTML = html; K.ov2 = container.firstChild;
}
SFKit.render2D = render2D;
function render2DAuto() { if (K.fallback && K.mode === '2d') render2D(K.fallback, K.st); }
SFKit.pick2D = function (el) { while (el && el.getAttribute && !el.getAttribute('data-sf')) el = el.parentNode; if (!el || !el.getAttribute) return null; try { return JSON.parse(el.getAttribute('data-sf')); } catch (e) { return null; } };
function fx2D(kind) {
  var host = K.fallback && K.fallback.firstChild; if (!host || typeof document === 'undefined') return;
  var el = document.createElement('div'); el.className = 'sf2d-pop'; el.innerHTML = popSVG(kind === 'lose' ? 'lose' : kind, 260); host.appendChild(el); setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1500);
  if (kind === 'win') { var cols = SEATC.concat(['#ffc928', '#2f86ff']); for (var i = 0; i < 40; i++) { var c = document.createElement('div'); c.className = 'sf2d-conf'; c.style.left = (Math.random() * 100) + '%'; c.style.background = cols[i % cols.length]; c.style.animationDelay = (Math.random() * .8) + 's'; host.appendChild(c); (function (cc) { setTimeout(function () { if (cc.parentNode) cc.parentNode.removeChild(cc); }, 3600); })(c); } }
}
})(typeof window !== 'undefined' ? window : this);

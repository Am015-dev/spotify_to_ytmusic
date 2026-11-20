// Wickdeep page, part 1: globals, pixel art, hex camera, map drawing with torchlight, effects layer, board input.
var D = window.WDD, E = window.WD, AI = window.WDAI, C = window.WDC;
var G = null, CAMP = null, UI = { busy: false, fast: false, sel: {}, tab: 0, pick: null, view: null, glow: {}, tglow: {}, preview: null, tut: false, hover: null, logN: 0, mode: 'title' };
var ANIM = true, AIDELAY = 1;
var $ = function (id) { return document.getElementById(id); };
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function sleep(ms) { return new Promise(function (r) { setTimeout(r, UI.fast || !ANIM ? Math.min(ms, 30) : ms); }); }
function speed(ms) { try { return GX.animMs ? GX.animMs(ms) : ms; } catch (e) { return ms; } }

// ---------- pixel art (Kenney Tiny Dungeon, CC0: 12x11 tiles of 16 px) ----------
var ART = new Image(), ART_OK = false, SPR = {};
ART.onload = function () { ART_OK = true; SPR = {}; draw(); try { refreshSprites(); } catch (e) { } };
ART.src = window.WD_ART;
function sprite(tile, tint) {
  var key = tile + '|' + (tint || '');
  if (SPR[key]) return SPR[key];
  var c = document.createElement('canvas'); c.width = c.height = 16;
  if (!ART_OK) return c;
  var x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  x.drawImage(ART, (tile % 12) * 16, Math.floor(tile / 12) * 16, 16, 16, 0, 0, 16, 16);
  if (tint) { x.globalCompositeOperation = 'source-atop'; x.fillStyle = tint; x.fillRect(0, 0, 16, 16); x.globalCompositeOperation = 'source-over'; }
  return (SPR[key] = c);
}
function paintSprite(cv, tile, tint) { var x = cv.getContext('2d'); cv.width = cv.height = 32; x.imageSmoothingEnabled = false; x.clearRect(0, 0, 32, 32); x.drawImage(sprite(tile, tint), 0, 0, 32, 32); return cv; }
function spriteCanvas(tile, tint) { return paintSprite(document.createElement('canvas'), tile, tint); }
function refreshSprites() { document.querySelectorAll('canvas[data-tile]').forEach(function (c) { paintSprite(c, +c.dataset.tile, c.dataset.tint || ''); }); }
function tileCanvas(tile, tint) { var c = spriteCanvas(tile, tint); c.dataset.tile = tile; if (tint) c.dataset.tint = tint; return c; }
var TILE = { door: 45, doorOpen: 33, trap: 41, chest: 89, obstacles: [82, 64, 65], rubble: 12 };
function figTile(f) {
  if (f.kind === 'hero') return D.HERO[f.cls].tile;
  if (f.kind === 'boss') return D.BOSS[f.type].tile;
  if (f.kind === 'sum') return D.SUMMON[f.type].tile;
  if (f.kind === 'obj') return 66;
  return D.MON[f.type].tile;
}
function figTint(f) { if (f.kind === 'sum') return 'rgba(120,200,90,.35)'; if (f.kind === 'boss') return 'rgba(160,30,20,.25)'; if (f.type === 'wight') return 'rgba(240,220,170,.45)'; if (f.type === 'ooze') return 'rgba(30,20,60,.45)'; return ''; }
function figName(f) {
  if (!f) return '';
  if (f.kind === 'hero') return D.HERO[f.cls].n;
  if (f.kind === 'boss') return D.BOSS[f.type].n;
  if (f.kind === 'sum') return D.SUMMON[f.type].n;
  if (f.kind === 'obj') return f.name;
  return (f.elite ? 'Elite ' : '') + D.MON[f.type].n + ' ' + f.num;
}

// ---------- stone texture (our own code art, limited palette) ----------
var STONE = (function () {
  var c = document.createElement('canvas'); c.width = c.height = 32; var x = c.getContext('2d');
  var pal = ['#221d27', '#272130', '#2c2535', '#1d1922'], s = 7;
  function r() { s = (s * 16807) % 2147483647; return s / 2147483647; }
  for (var i = 0; i < 32; i++) for (var j = 0; j < 32; j++) { x.fillStyle = pal[Math.floor(r() * 3)]; x.fillRect(i, j, 1, 1); }
  // flagstone seams
  x.fillStyle = '#16121a';
  [[0, 0, 32, 1], [0, 15, 32, 1], [9, 0, 1, 15], [24, 16, 1, 16], [0, 31, 32, 1]].forEach(function (a) { x.fillRect(a[0], a[1], a[2], a[3]); });
  x.fillStyle = '#3a3242'; [[1, 1, 7, 1], [11, 1, 12, 1], [1, 16, 22, 1], [26, 17, 5, 1]].forEach(function (a) { x.fillRect(a[0], a[1], a[2], a[3]); });
  return c;
})();
var WATER = (function () {
  var c = document.createElement('canvas'); c.width = c.height = 16; var x = c.getContext('2d');
  x.fillStyle = '#123a3c'; x.fillRect(0, 0, 16, 16); x.fillStyle = '#1d5654';
  [[2, 3, 4], [9, 6, 5], [3, 10, 5], [10, 13, 4]].forEach(function (a) { x.fillRect(a[0], a[1], a[2], 1); });
  x.fillStyle = '#3fa7a0'; [[3, 2, 2], [10, 5, 2], [4, 9, 2]].forEach(function (a) { x.fillRect(a[0], a[1], a[2], 1); });
  return c;
})();

// ---------- hex camera ----------
var CV, CX, BW = 0, BH = 0, DPR = 1, CAM = { x: 0, y: 0, z: 30, fit: true };
var SQ3 = Math.sqrt(3);
function hexWorld(k) { var p = E.P(k); return { x: SQ3 * (p[0] + p[1] / 2), y: 1.5 * p[1] }; }
function toScreen(k) { var w = hexWorld(k); return { x: (w.x - CAM.x) * CAM.z + BW / 2, y: (w.y - CAM.y) * CAM.z + BH / 2 + 18 }; }
function fromScreen(sx, sy) {
  var wx = (sx - BW / 2) / CAM.z + CAM.x, wy = (sy - BH / 2 - 18) / CAM.z + CAM.y;
  var r = wy / 1.5, q = wx / SQ3 - r / 2;
  // cube round
  var x = q, z = r, y = -x - z, rx = Math.round(x), ry = Math.round(y), rz = Math.round(z);
  var dx = Math.abs(rx - x), dy = Math.abs(ry - y), dz = Math.abs(rz - z);
  if (dx > dy && dx > dz) rx = -ry - rz; else if (dy <= dz) rz = -rx - ry;
  return E.K(rx, rz);
}
function fitCam(force) {
  if (!G || (!CAM.fit && !force)) return;
  var ks = Object.keys(G.hex).filter(function (k) { return E.seen(G, k); }); if (!ks.length) return;
  var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  ks.forEach(function (k) { var w = hexWorld(k); x0 = Math.min(x0, w.x); x1 = Math.max(x1, w.x); y0 = Math.min(y0, w.y); y1 = Math.max(y1, w.y); });
  var bw = x1 - x0 + 2.2, bh = y1 - y0 + 2.6;
  var z = Math.min(BW / bw, (BH - 50) / bh);
  CAM.z = Math.max(16, Math.min(46, z)); CAM.x = (x0 + x1) / 2; CAM.y = (y0 + y1) / 2;
  clampCam();
}
function clampCam() {
  if (!G) return;
  var ks = Object.keys(G.hex).filter(function (k) { return E.seen(G, k); }); if (!ks.length) return;
  var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  ks.forEach(function (k) { var w = hexWorld(k); x0 = Math.min(x0, w.x); x1 = Math.max(x1, w.x); y0 = Math.min(y0, w.y); y1 = Math.max(y1, w.y); });
  CAM.x = Math.max(x0 - 1, Math.min(x1 + 1, CAM.x)); CAM.y = Math.max(y0 - 1, Math.min(y1 + 1, CAM.y));
}
function follow(k) {   // keep a hex in view when zoomed in
  if (!k) return; var s = toScreen(k), m = CAM.z * 1.6;
  if (s.x < m || s.x > BW - m || s.y < m + 40 || s.y > BH - m) { var w = hexWorld(k); CAM.x = w.x; CAM.y = w.y; clampCam(); }
}
function resize() {
  var b = $('board'); if (!b) return;
  BW = b.clientWidth; BH = b.clientHeight; DPR = Math.min(2, window.devicePixelRatio || 1);
  CV.width = Math.round(BW * DPR); CV.height = Math.round(BH * DPR);
  FX.resize();
  fitCam(); draw();
}

// ---------- drawing ----------
function hexPath(x, y, r) { CX.beginPath(); for (var i = 0; i < 6; i++) { var a = Math.PI / 180 * (60 * i - 30); CX[i ? 'lineTo' : 'moveTo'](x + r * Math.cos(a), y + r * Math.sin(a)); } CX.closePath(); }
function corner(x, y, r, i) { var a = Math.PI / 180 * (60 * i - 30); return [x + r * Math.cos(a), y + r * Math.sin(a)]; }
var DIR_EDGE = [0, 5, 4, 3, 2, 1];   // E.DIRS index -> edge (corner i to i+1)
var RAF = 0;
function draw() { if (RAF) return; RAF = requestAnimationFrame(function () { RAF = 0; drawNow(); }); }
function renderHot() {
  var box = $('hot'); if (!box) return;
  var ks = UI.busy ? [] : Object.keys(UI.glow), sig = ks.join('|') + '@' + CAM.x.toFixed(2) + ',' + CAM.y.toFixed(2) + ',' + CAM.z.toFixed(1) + ',' + BW + 'x' + BH;
  if (box.dataset.sig === sig) return; box.dataset.sig = sig; box.innerHTML = '';
  var R = CAM.z, sz = Math.max(40, Math.round(R * 1.7));
  ks.forEach(function (k) {
    var s = toScreen(k); if (s.x < 0 || s.y < 0 || s.x > BW || s.y > BH) return;
    var f = E.figAt(G, k), b = document.createElement('button'); b.type = 'button'; b.className = 'hot glow ' + UI.glow[k]; b.dataset.k = k;
    b.style.left = Math.round(s.x - sz / 2) + 'px'; b.style.top = Math.round(s.y - sz / 2) + 'px'; b.style.width = b.style.height = sz + 'px';
    b.setAttribute('aria-label', UI.glow[k] === 'atk' ? 'Attack ' + figName(f) : UI.glow[k] === 'heal' ? 'Heal ' + figName(f) : 'Hex ' + k);
    b.addEventListener('click', function (e) { e.stopPropagation(); onBoardTap(k); });
    box.appendChild(b);
  });
}
function drawNow() {
  if (!CX) return;
  try { renderHot(); } catch (e) { }
  CX.setTransform(DPR, 0, 0, DPR, 0, 0); CX.imageSmoothingEnabled = false;
  CX.fillStyle = '#050407'; CX.fillRect(0, 0, BW, BH);
  if (!G) return;
  var R = CAM.z, view = UI.view;
  var keys = Object.keys(G.hex).filter(function (k) { return E.seen(G, k); });
  var pat = CX.createPattern(STONE, 'repeat');
  // floors
  keys.forEach(function (k) {
    var s = toScreen(k), h = G.hex[k];
    if (s.x < -R * 2 || s.x > BW + R * 2 || s.y < -R * 2 || s.y > BH + R * 2) return;
    hexPath(s.x, s.y, R * 0.995);
    CX.save(); CX.translate(s.x, s.y); CX.scale(R / 12, R / 12); CX.fillStyle = pat; CX.fill(); CX.restore();
    hexPath(s.x, s.y, R * 0.995);
    if (h.t === 'haz') { CX.save(); CX.clip(); CX.drawImage(WATER, s.x - R, s.y - R, R * 2, R * 2); CX.restore(); }
    CX.strokeStyle = 'rgba(0,0,0,.55)'; CX.lineWidth = 1; CX.stroke();
  });
  // walls along edges that face nothing
  CX.lineCap = 'round';
  keys.forEach(function (k) {
    var s = toScreen(k);
    E.nb(k).forEach(function (n, d) {
      var h = G.hex[n];
      if (h && (E.seen(G, n) || h.t === 'door')) return;
      var e = DIR_EDGE[d], a = corner(s.x, s.y, R, e), b = corner(s.x, s.y, R, (e + 1) % 6);
      CX.strokeStyle = '#3b2f2a'; CX.lineWidth = Math.max(3, R * 0.28); CX.beginPath(); CX.moveTo(a[0], a[1]); CX.lineTo(b[0], b[1]); CX.stroke();
      CX.strokeStyle = '#6b5442'; CX.lineWidth = Math.max(1, R * 0.08); CX.beginPath(); CX.moveTo(a[0], a[1]); CX.lineTo(b[0], b[1]); CX.stroke();
    });
  });
  // features
  var sz = R * 1.25;
  keys.forEach(function (k) {
    var s = toScreen(k), h = G.hex[k], p = E.P(k), oi = Math.abs(p[0] * 7 + p[1] * 13) % TILE.obstacles.length;
    if (h.t === 'o') CX.drawImage(sprite(TILE.obstacles[oi]), s.x - sz / 2, s.y - sz / 2, sz, sz);
    else if (h.t === 'trap') CX.drawImage(sprite(TILE.trap), s.x - sz / 2, s.y - sz / 2, sz, sz);
    else if (h.t === 'diff') { CX.globalAlpha = 0.8; CX.drawImage(sprite(TILE.rubble), s.x - sz / 2, s.y - sz / 2, sz, sz); CX.globalAlpha = 1; }
    else if (h.t === 'door') CX.drawImage(sprite(h.open ? TILE.doorOpen : TILE.door), s.x - sz / 2, s.y - sz / 2, sz, sz);
    if (h.ex) { CX.fillStyle = 'rgba(255,217,138,.22)'; hexPath(s.x, s.y, R * 0.8); CX.fill(); CX.fillStyle = '#ffd98a'; CX.font = '700 ' + Math.round(R * 0.55) + 'px Silkscreen,monospace'; CX.textAlign = 'center'; CX.textBaseline = 'middle'; CX.fillText('EXIT', s.x, s.y + R * 0.45); }
    if (h.tr) CX.drawImage(sprite(TILE.chest), s.x - sz / 2, s.y - sz / 2, sz, sz);
    if (h.coin) drawCoin(s.x + R * 0.35, s.y + R * 0.35, R * 0.26, h.coin);
  });
  // legal targets
  Object.keys(UI.glow).forEach(function (k) {
    var s = toScreen(k), c = UI.glow[k];
    hexPath(s.x, s.y, R * 0.9); CX.fillStyle = c === 'atk' ? 'rgba(220,70,50,.32)' : c === 'heal' ? 'rgba(120,220,110,.3)' : 'rgba(255,200,110,.24)'; CX.fill();
    CX.strokeStyle = c === 'atk' ? '#ff6a4a' : c === 'heal' ? '#9cff8a' : '#ffd98a'; CX.lineWidth = Math.max(2, R * 0.09); CX.stroke();
  });
  if (UI.preview) { UI.preview.forEach(function (k, i) { var s = toScreen(k); CX.fillStyle = '#ffd98a'; CX.beginPath(); CX.arc(s.x, s.y, Math.max(2, R * 0.12), 0, 7); CX.fill(); }); }
  // figures (display state while animating)
  var figs = view ? view.list() : G.figs.filter(function (f) { return f.pos; });
  figs.forEach(function (f) { drawFig(f); });
  drawLight(keys, figs);
  // labels above light: damage previews
  Object.keys(UI.tglow).forEach(function (id) {
    var t = UI.tglow[id], f = E.fig(G, id); if (!f || !f.pos) return;
    var s = toScreen(f.pos); var txt = t.txt;
    CX.font = '700 ' + Math.max(11, Math.round(R * 0.42)) + 'px Silkscreen,monospace'; CX.textAlign = 'center'; CX.textBaseline = 'middle';
    var w = CX.measureText(txt).width + 8, y = s.y - R * 1.05;
    CX.fillStyle = 'rgba(0,0,0,.85)'; CX.fillRect(s.x - w / 2, y - 9, w, 18); CX.fillStyle = t.kill ? '#ffd34a' : '#ffb4a4'; CX.fillText(txt, s.x, y);
  });
}
function drawCoin(x, y, r, n) {
  CX.fillStyle = '#3a2408'; CX.beginPath(); CX.arc(x, y + 1, r, 0, 7); CX.fill();
  CX.fillStyle = '#e8b93a'; CX.beginPath(); CX.arc(x, y, r, 0, 7); CX.fill();
  CX.fillStyle = '#fff1a8'; CX.fillRect(x - r * 0.4, y - r * 0.5, r * 0.3, r * 0.3);
  if (n > 1) { CX.fillStyle = '#000'; CX.font = '700 ' + Math.round(r * 1.3) + 'px Silkscreen'; CX.textAlign = 'center'; CX.textBaseline = 'middle'; CX.fillText(n, x, y + 1); }
}
function drawFig(f) {
  var R = CAM.z, pos = f.dpos || f.pos; if (!pos) return;
  var s = f.dxy || toScreen(pos), big = f.kind === 'boss' ? 1.45 : 1, sz = R * 1.35 * big, now = G.cur === f.id || (UI.actId && UI.actId === f.id);
  // base ring
  var ring = f.kind === 'hero' ? D.HERO[f.cls].col : f.kind === 'sum' ? '#9bc46a' : f.kind === 'boss' ? '#ff5a3a' : f.elite ? '#f2c94c' : f.kind === 'obj' ? '#b58cff' : '#e9dfc8';
  CX.fillStyle = 'rgba(0,0,0,.55)'; CX.beginPath(); CX.ellipse(s.x, s.y + R * 0.5 * big, R * 0.62 * big, R * 0.24 * big, 0, 0, 7); CX.fill();
  CX.strokeStyle = ring; CX.lineWidth = Math.max(2, R * (now ? 0.14 : 0.09)); CX.beginPath(); CX.ellipse(s.x, s.y + R * 0.5 * big, R * 0.6 * big, R * 0.22 * big, 0, 0, 7); CX.stroke();
  if (f.flash) { CX.globalAlpha = 0.6; }
  CX.drawImage(sprite(figTile(f), figTint(f)), Math.round(s.x - sz / 2), Math.round(s.y - sz * 0.62), sz, sz);
  CX.globalAlpha = 1;
  // hp bar
  var w = R * 1.1 * Math.min(big, 1.2), hpw = Math.max(0, f.hp) / f.max;
  var by = s.y + R * 0.66 * big;
  CX.fillStyle = '#000'; CX.fillRect(s.x - w / 2 - 1, by - 1, w + 2, Math.max(4, R * 0.16) + 2);
  CX.fillStyle = f.team === 'h' ? '#7fc46a' : '#d0533c'; CX.fillRect(s.x - w / 2, by, w * hpw, Math.max(4, R * 0.16));
  if (R >= 20) { CX.font = '700 ' + Math.max(10, Math.round(R * 0.36)) + 'px Silkscreen,monospace'; CX.textAlign = 'center'; CX.textBaseline = 'top'; CX.fillStyle = '#000'; CX.fillText(Math.max(0, f.hp), s.x + 1, by + Math.max(4, R * 0.16) + 2); CX.fillStyle = '#fff'; CX.fillText(Math.max(0, f.hp), s.x, by + Math.max(4, R * 0.16) + 1); }
  // monster number
  if (f.kind === 'mon') { var nx = s.x + R * 0.55, ny = s.y - R * 0.55; CX.fillStyle = f.elite ? '#f2c94c' : '#e9dfc8'; CX.fillRect(nx - 6, ny - 6, 12, 12); CX.fillStyle = '#000'; CX.font = '700 10px Silkscreen,monospace'; CX.textAlign = 'center'; CX.textBaseline = 'middle'; CX.fillText(f.num, nx, ny + 1); }
  // conditions
  var cs = Object.keys(f.cond || {}); if (f.rnd && f.rnd.shd) cs.push('shd'); if (f.rnd && f.rnd.ret) cs.push('ret');
  cs.forEach(function (c, i) {
    var col = { poi: '#7fdc5a', wnd: '#ff4a4a', imm: '#c9a0ff', dis: '#aaa', stn: '#ffd34a', mud: '#7a8aa8', inv: '#99e0ff', str: '#ff9a3a', shd: '#9ec9ff', ret: '#ff7ab0' }[c] || '#fff';
    CX.fillStyle = '#000'; CX.fillRect(s.x - R * 0.7 + i * 7 - 1, s.y - R * 0.85 - 1, 7, 7); CX.fillStyle = col; CX.fillRect(s.x - R * 0.7 + i * 7, s.y - R * 0.85, 5, 5);
  });
}
// torchlight: darkness everywhere except around heroes (and a little around lit elements)
var LIT;
function drawLight(keys, figs) {
  if (!LIT) LIT = document.createElement('canvas');
  if (LIT.width !== CV.width || LIT.height !== CV.height) { LIT.width = CV.width; LIT.height = CV.height; }
  var x = LIT.getContext('2d'); x.setTransform(DPR, 0, 0, DPR, 0, 0);
  x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, BW, BH); x.fillStyle = 'rgba(4,2,8,.72)'; x.fillRect(0, 0, BW, BH);
  x.globalCompositeOperation = 'destination-out';
  var R = CAM.z, boost = (G.el.fire ? 0.6 : 0) + (G.el.light ? 0.9 : 0) - (G.el.dark ? 0.7 : 0);
  figs.forEach(function (f) {
    if (f.team !== 'h') return; var s = f.dxy || toScreen(f.dpos || f.pos), rad = R * (f.kind === 'hero' ? 4.6 + boost : 2.2);
    var gr = x.createRadialGradient(s.x, s.y, R * 0.6, s.x, s.y, rad); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.6, 'rgba(0,0,0,.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = gr; x.beginPath(); x.arc(s.x, s.y, rad, 0, 7); x.fill();
  });
  // legal targets stay visible even in the dark
  Object.keys(UI.glow).concat(Object.keys(UI.tglow).map(function (id) { var f = E.fig(G, id); return f && f.pos; })).forEach(function (k) { if (!k) return; var s = toScreen(k); x.fillStyle = 'rgba(0,0,0,.55)'; x.beginPath(); x.arc(s.x, s.y, R * 0.95, 0, 7); x.fill(); });
  CX.setTransform(1, 0, 0, 1, 0, 0); CX.drawImage(LIT, 0, 0);
  // warm candle tint
  CX.setTransform(DPR, 0, 0, DPR, 0, 0); CX.globalCompositeOperation = 'soft-light';
  figs.forEach(function (f) { if (f.kind !== 'hero') return; var s = f.dxy || toScreen(f.dpos || f.pos), rad = R * 3.4; var gr = CX.createRadialGradient(s.x, s.y, 0, s.x, s.y, rad); gr.addColorStop(0, 'rgba(255,170,70,.55)'); gr.addColorStop(1, 'rgba(255,170,70,0)'); CX.fillStyle = gr; CX.beginPath(); CX.arc(s.x, s.y, rad, 0, 7); CX.fill(); });
  CX.globalCompositeOperation = 'source-over';
}

// ---------- pixel effects layer (ported MIT effects, one-shot only) ----------
var FX = (function () {
  var cv, cx, img, frame, list = [], raf = 0, last = 0, w = 0, h = 0, PX = 2;
  function on() { try { return ANIM && !(GX.reduced && GX.reduced()) && !UI.fast; } catch (e) { return ANIM; } }
  function resize() {
    cv = cv || $('fxc'); if (!cv) return; cx = cx || cv.getContext('2d');
    w = Math.max(1, Math.ceil(BW / PX)); h = Math.max(1, Math.ceil(BH / PX)); cv.width = w; cv.height = h;
    img = cx.createImageData(w, h); frame = { w: w, h: h, ox: 0, oy: 0, color: new Uint32Array(w * h), light: new Uint32Array(w * h) };
  }
  function play(name, x, y, opt) {
    if (!on() || !window['SF_' + name] || !frame) return;
    var o = Object.assign({ x: x, y: y, seed: (Math.random() * 1000) | 0, size: Math.max(0.35, CAM.z / 70) }, opt || {});
    try { list.push({ e: window['SF_' + name].default(o), t: 0 }); } catch (e) { return; }
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }
  function tick(now) {
    raf = 0; var dt = Math.min(0.05, (now - last) / 1000); last = now;
    frame.color.fill(0); frame.light.fill(0);
    list.forEach(function (it) { it.t += dt; try { it.e.update(dt); it.e.draw(frame, 'back'); it.e.draw(frame, 'front'); } catch (e) { it.t = 99; } });
    list = list.filter(function (it) { var d = false; try { d = it.e.done(); } catch (e) { d = true; } return !d && it.t < 3; });
    var data = new Uint32Array(img.data.buffer), c = frame.color, l = frame.light;
    for (var i = 0; i < c.length; i++) {
      var px = c[i], lx = l[i];
      if (lx) { var r = Math.min(255, (px & 255) + (lx & 255)), g = Math.min(255, ((px >>> 8) & 255) + ((lx >>> 8) & 255)), b = Math.min(255, ((px >>> 16) & 255) + ((lx >>> 16) & 255)); var a = px ? 255 : Math.min(200, Math.max(r, g, b)); data[i] = (a << 24) | (b << 16) | (g << 8) | r; }
      else data[i] = px;
    }
    cx.putImageData(img, 0, 0);
    if (list.length) raf = requestAnimationFrame(tick); else cx.clearRect(0, 0, w, h);
  }
  return { resize: resize, play: play, active: function () { return list.length; } };
})();

// ---------- board input: tap, drag to pan, pinch / wheel to zoom ----------
function initBoardInput() {
  var b = $('board'), pts = {}, start = null, pinch = null, moved = false;
  b.addEventListener('pointerdown', function (e) {
    if (e.target.closest('button')) return;
    pts[e.pointerId] = { x: e.clientX, y: e.clientY }; try { b.setPointerCapture(e.pointerId); } catch (x) { }
    var ids = Object.keys(pts);
    if (ids.length === 1) { start = { x: e.clientX, y: e.clientY, cx: CAM.x, cy: CAM.y, t: Date.now() }; moved = false; }
    if (ids.length === 2) { var a = pts[ids[0]], c = pts[ids[1]]; pinch = { d: Math.hypot(a.x - c.x, a.y - c.y), z: CAM.z }; moved = true; }
  });
  b.addEventListener('pointermove', function (e) {
    if (!pts[e.pointerId]) return; pts[e.pointerId] = { x: e.clientX, y: e.clientY };
    var ids = Object.keys(pts);
    if (ids.length === 2 && pinch) { var a = pts[ids[0]], c = pts[ids[1]]; var d = Math.hypot(a.x - c.x, a.y - c.y); CAM.z = Math.max(14, Math.min(70, pinch.z * d / pinch.d)); CAM.fit = false; draw(); return; }
    if (start && ids.length === 1) { var dx = e.clientX - start.x, dy = e.clientY - start.y; if (Math.abs(dx) + Math.abs(dy) > 10) moved = true; if (moved) { CAM.x = start.cx - dx / CAM.z; CAM.y = start.cy - dy / CAM.z; CAM.fit = false; clampCam(); draw(); } }
  });
  function up(e) {
    var had = !!pts[e.pointerId]; delete pts[e.pointerId];
    if (Object.keys(pts).length < 2) pinch = null;
    if (!had || Object.keys(pts).length) return;
    if (start && !moved && Date.now() - start.t < 600) { var r = b.getBoundingClientRect(); onBoardTap(fromScreen(e.clientX - r.left, e.clientY - r.top)); }
    start = null;
  }
  b.addEventListener('pointerup', up); b.addEventListener('pointercancel', function (e) { delete pts[e.pointerId]; start = null; pinch = null; });
  b.addEventListener('wheel', function (e) { e.preventDefault(); CAM.z = Math.max(14, Math.min(70, CAM.z * (e.deltaY < 0 ? 1.12 : 0.89))); CAM.fit = false; draw(); }, { passive: false });
  $('zin').addEventListener('click', function () { CAM.z = Math.min(70, CAM.z * 1.25); CAM.fit = false; var f = curFig(); if (f && f.pos) { var w = hexWorld(f.pos); CAM.x = w.x; CAM.y = w.y; } clampCam(); draw(); });
  $('zout').addEventListener('click', function () { CAM.fit = true; fitCam(true); draw(); });
}
function curFig() { return G && G.ask && G.ask.id ? E.fig(G, G.ask.id) : null; }

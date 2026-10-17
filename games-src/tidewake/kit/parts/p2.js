
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

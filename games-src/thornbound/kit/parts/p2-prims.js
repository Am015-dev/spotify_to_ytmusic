/* ===== Painterly SVG primitives (art space 220 x 152) ===== */
function G(x, y, s, inner, extra) { return '<g transform="translate(' + n2(x) + ' ' + n2(y) + ')' + (s && s !== 1 ? ' scale(' + s + ')' : '') + '"' + (extra || '') + '>' + inner + '</g>'; }
function flip(inner) { return '<g transform="scale(-1 1)">' + inner + '</g>'; }
function smoothPath(pts, close) {
  var d = 'M' + n2(pts[0][0]) + ' ' + n2(pts[0][1]);
  for (var i = 1; i < pts.length; i++) { var p = pts[i - 1], q = pts[i], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2; d += ' Q' + n2(p[0]) + ' ' + n2(p[1]) + ' ' + n2(mx) + ' ' + n2(my); }
  var l = pts[pts.length - 1]; d += ' T' + n2(l[0]) + ' ' + n2(l[1]); return d + (close || '');
}
function hills(R, y, amp, col, op, w, x0) {
  w = w || 220; x0 = x0 || 0; var pts = [], n = Math.ceil(w / 24) + 1;
  for (var i = 0; i <= n; i++) pts.push([x0 + i * w / n, y - R() * amp]);
  return '<path d="' + smoothPath(pts, ' V152 H' + x0 + ' V' + n2(pts[0][1]) + 'Z') + '" fill="' + col + '" opacity="' + (op || 1) + '"/>';
}
function blobs(R, n, x0, y0, w, h, rmin, rmax, cols, op) {
  var s = ''; for (var i = 0; i < n; i++) s += '<ellipse cx="' + n2(x0 + R() * w) + '" cy="' + n2(y0 + R() * h) + '" rx="' + n2(rmin + R() * (rmax - rmin)) + '" ry="' + n2((rmin + R() * (rmax - rmin)) * .6) + '" fill="' + cols[Math.floor(R() * cols.length)] + '" opacity="' + n2(op * (.5 + R() * .5)) + '" transform="rotate(' + n2(R() * 40 - 20) + ' ' + n2(x0 + w / 2) + ' ' + n2(y0 + h / 2) + ')"/>'; return s;
}
function leaf(x, y, a, sz, col) { return '<ellipse cx="' + n2(x) + '" cy="' + n2(y) + '" rx="' + n2(sz) + '" ry="' + n2(sz * .55) + '" transform="rotate(' + n2(a) + ' ' + n2(x) + ' ' + n2(y) + ')" fill="' + col + '"/>'; }
function ivy(x, y, len, ang, R, sz, dark) {
  sz = sz || 3.2; var a = ang * Math.PI / 180, px = x, py = y, pts = [[x, y]], lv = '', n = Math.max(3, Math.floor(len / 7));
  for (var i = 1; i <= n; i++) { a += (R() - .5) * .9; px += Math.cos(a) * len / n; py += Math.sin(a) * len / n; pts.push([px, py]); var side = i % 2 ? 1 : -1, la = a * 180 / Math.PI + side * 70; lv += leaf(px + Math.cos(a + side * 1.4) * sz, py + Math.sin(a + side * 1.4) * sz, la, sz * (.8 + R() * .5), (i % 3 ? (dark ? '#2f4f25' : '#4f7e36') : (dark ? '#3c6030' : '#78a24a'))); }
  return '<path d="' + smoothPath(pts) + '" fill="none" stroke="#2d3f20" stroke-width="1.1" stroke-linecap="round"/>' + lv;
}
function thorn(x, y, len, ang, R, col) {
  var a = ang * Math.PI / 180, px = x, py = y, d = 'M' + n2(x) + ' ' + n2(y), sp = '', n = Math.max(3, Math.floor(len / 6)); col = col || '#2a1c22';
  for (var i = 1; i <= n; i++) { a += (R() - .5) * .8; px += Math.cos(a) * len / n; py += Math.sin(a) * len / n; d += ' L' + n2(px) + ' ' + n2(py); var s2 = i % 2 ? 1 : -1; sp += '<path d="M' + n2(px) + ' ' + n2(py) + ' l' + n2(Math.cos(a + s2 * 1.9) * 4.5) + ' ' + n2(Math.sin(a + s2 * 1.9) * 4.5) + ' l' + n2(Math.cos(a + s2 * .6) * 1.6) + ' ' + n2(Math.sin(a + s2 * .6) * 1.6) + 'Z" fill="' + col + '"/>'; }
  return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="1.7" stroke-linecap="round"/>' + sp;
}
function rose(x, y, s, col) { return G(x, y, s, '<circle r="4.4" fill="' + (col || '#8c1f33') + '"/><path d="M-2.5 -.5 Q0 -3.4 2.6 -.6 Q.4 1.6 -2.5 -.5Z M-1 1.6 Q1.6 -.4 2.8 1.8 Q.6 3.4 -1 1.6Z" fill="#e0758a" opacity=".85"/><circle r="1" fill="#f6c3a0"/>'); }
function flame(x, y, s, glow) {
  return G(x, y, s, (glow === false ? '' : '<circle cy="-8" r="26" fill="url(#tb-glow-warm)"/>') + '<path d="M0 0 C-6 -3 -6.5 -10 0 -18 C2 -13 6.5 -10 6 -4 C5 -1 2.5 0 0 0Z" fill="#f28a2a"/><path d="M0 0 C-3.4 -2 -3.4 -6.5 0 -11 C1.5 -8 3.8 -6 3 -3 C2.4 -1 1.2 0 0 0Z" fill="#ffd36a"/><path d="M0 -.5 C-1.6 -1.5 -1.4 -4 0 -6 C1.2 -4 1.6 -2 0 -.5Z" fill="#fff6cf"/>');
}
function glowAt(x, y, r, kind) { return '<circle cx="' + n2(x) + '" cy="' + n2(y) + '" r="' + r + '" fill="url(#tb-glow-' + (kind || 'warm') + ')"/>'; }
function shadowE(x, y, rx, ry) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#000" opacity=".38" filter="url(#tb-soft)"/>'; }
function stars(R, n, y1) { var s = ''; for (var i = 0; i < n; i++) s += '<circle cx="' + n2(R() * 220) + '" cy="' + n2(R() * y1) + '" r="' + n2(.4 + R() * .9) + '" fill="#f4f1ff" opacity="' + n2(.4 + R() * .6) + '"/>'; return s; }
function moon(x, y, r) { return glowAt(x, y, r * 3.2, 'cool') + '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#f1f1ff"/><circle cx="' + (x - r * .3) + '" cy="' + (y + r * .15) + '" r="' + r * .22 + '" fill="#cfcfe8" opacity=".6"/><circle cx="' + (x + r * .35) + '" cy="' + (y - r * .3) + '" r="' + r * .15 + '" fill="#cfcfe8" opacity=".5"/>'; }

/* ---- emblems (nominal box 40x40 centred) ---- */
function emblem(f, fill, stroke) {
  fill = fill || 'url(#tb-gold)'; stroke = stroke || 'rgba(30,15,5,.55)';
  var o = ' fill="' + fill + '" stroke="' + stroke + '" stroke-width=".9" stroke-linejoin="round"';
  switch (f) {
    case 'gilded': return '<path d="M-15 9 L-17 -9 L-8.5 -1 L0 -14 L8.5 -1 L17 -9 L15 9Z"' + o + '/><rect x="-15" y="9" width="30" height="4.5" rx="1"' + o + '/><circle cx="0" cy="-14" r="2.2" fill="#c43a50" stroke="' + stroke + '" stroke-width=".6"/><circle cx="-17" cy="-9" r="1.7" fill="#c43a50"/><circle cx="17" cy="-9" r="1.7" fill="#c43a50"/>';
    case 'heath': return '<circle r="14" fill="none" stroke="' + (fill.indexOf('url') === 0 ? '#d9d0b4' : fill) + '" stroke-width="3"/><rect x="-4" y="-13" width="8" height="26" rx="3"' + o + '/><rect x="-14" y="-3" width="5" height="12" rx="2"' + o + '/><rect x="9" y="-3" width="5" height="12" rx="2"' + o + '/>';
    case 'lantern': return '<path d="M-3 -17 A4 4 0 0 1 3 -17" fill="none" stroke="' + fill + '" stroke-width="1.6"/><path d="M-9 -9 L0 -16 L9 -9Z"' + o + '/><path d="M-7.5 -9 H7.5 L9.5 9 H-9.5Z" fill="rgba(255,190,90,.55)" stroke="' + (fill.indexOf('url') === 0 ? '#d9b24f' : fill) + '" stroke-width="2"/><path d="M0 7 C-4 4 -4 -1 0 -6 C4 -1 4 4 0 7Z" fill="#ffcf5a"/><rect x="-11" y="9" width="22" height="4.5" rx="1.5"' + o + '/>';
    case 'choir': return '<path d="M5 -16 A16 16 0 1 0 5 16 A12 12 0 1 1 5 -16Z"' + o + '/><path d="M12 -6 l1.8 4 4 1.8 -4 1.8 -1.8 4 -1.8 -4 -4 -1.8 4 -1.8Z"' + o + '/>';
    default: return '<circle r="14"' + o + '/><circle r="10.5" fill="none" stroke="' + stroke + '" stroke-width=".8"/>' + [0, 1, 2, 3, 4].map(function (i) { var a = i * 72 - 90; return '<circle cx="' + n2(Math.cos(a * Math.PI / 180) * 5) + '" cy="' + n2(Math.sin(a * Math.PI / 180) * 5) + '" r="3.3" fill="rgba(110,60,30,.55)"/>'; }).join('') + '<circle r="2.4" fill="rgba(110,60,30,.7)"/>';
  }
}
TB.emblemSVG = function (f, size, fill) { return '<svg xmlns="' + NS + '" viewBox="-20 -20 40 40" width="' + (size || 40) + '" height="' + (size || 40) + '">' + emblem(f, fill) + '</svg>'; };

/* ---- structures ---- */
function arch(x, y, s, col, R, ivyOn) {
  col = col || '#4b5249';
  var b = '<path d="M-34 0 V-44 Q-34 -74 -2 -74 Q10 -74 20 -66 L14 -57 L24 -52 L30 -38 V0 H20 V-38 Q20 -56 -2 -60 Q-22 -56 -22 -38 V0Z" fill="' + col + '"/>' +
    '<path d="M-34 -44 Q-34 -74 -2 -74 Q-20 -66 -22 -44Z" fill="#fff" opacity=".13"/><path d="M20 -66 L14 -57 L24 -52 L30 -38 V0 H20Z" fill="#000" opacity=".28"/>' +
    '<path d="M-30 -20 H-22 M-30 -34 H-24 M22 -26 H28" stroke="#000" stroke-width="1" opacity=".35"/>';
  if (ivyOn !== false) b += ivy(-30, -6, 50, -95, R, 3.4) + ivy(26, -4, 36, -100, R, 3) + ivy(-4, -69, 26, 170, R, 3, 1);
  return G(x, y, s, b);
}
function tower(x, y, s, col, R) {
  col = col || '#464d47';
  return G(x, y, s, '<path d="M-17 0 V-70 L-12 -76 L-9 -70 L-3 -78 L2 -70 L8 -74 L12 -70 L17 -72 V0Z" fill="' + col + '"/><path d="M5 -72 L17 -72 V0 H5Z" fill="#000" opacity=".28"/><path d="M-12 -70 H-3 V-76z" fill="#fff" opacity=".1"/><path d="M-5 -52 V-40 Q0 -34 5 -40 V-52 Q0 -58 -5 -52Z" fill="#0a0c0a"/><path d="M-4 -26 V-18 H4 V-26Z" fill="#0a0c0a" opacity=".8"/>' + ivy(-14, -2, 56, -92, R, 3.2) + ivy(14, -8, 40, -95, R, 3, 1));
}
function ruinBack(R, hz, col, n) {
  var s = '', xs = [28, 92, 158, 196]; for (var i = 0; i < (n || 3); i++) { var x = xs[i] + (R() - .5) * 20, k = R(); s += k < .5 ? arch(x, hz + 2, .5 + R() * .25, col, R) : tower(x, hz + 2, .5 + R() * .3, col, R); } return s;
}
function forestBack(R, hz, cols, n, sc) {
  var s = ''; for (var i = 0; i < n; i++) { var x = R() * 240 - 10, h = (24 + R() * 40) * (sc || 1), c = cols[Math.floor(R() * cols.length)];
    s += '<path d="M' + n2(x - 8 - R() * 6) + ' ' + hz + ' L' + n2(x) + ' ' + n2(hz - h) + ' L' + n2(x + 8 + R() * 6) + ' ' + hz + 'Z" fill="' + c + '"/><path d="M' + n2(x - 6) + ' ' + n2(hz - h * .35) + ' L' + n2(x) + ' ' + n2(hz - h * .85) + ' L' + n2(x + 6) + ' ' + n2(hz - h * .35) + 'Z" fill="' + c + '"/>'; } return s;
}
function broadTree(x, y, s, R, dark) {
  var c1 = dark ? '#1f3320' : '#3c5a2a', c2 = dark ? '#2c4a2c' : '#587d38';
  return G(x, y, s, '<path d="M-3 0 Q-4 -20 -2 -34 L2 -34 Q5 -20 4 0Z" fill="#2c1d12"/>' + '<ellipse cx="0" cy="-44" rx="24" ry="18" fill="' + c1 + '"/><ellipse cx="-10" cy="-50" rx="14" ry="11" fill="' + c2 + '"/><ellipse cx="11" cy="-38" rx="13" ry="10" fill="' + c1 + '"/><ellipse cx="-4" cy="-52" rx="10" ry="6" fill="#fff" opacity=".08"/>' + ivy(-2, -2, 30, -92, R, 2.6));
}
function stoneAt(x, y, w, h, tilt, R) {
  return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (tilt || 0) + ')"><path d="M' + (-w / 2) + ' 0 L' + (-w / 2 + 2) + ' ' + (-h * .8) + ' Q' + (-w / 4) + ' ' + (-h - 2) + ' 0 ' + (-h) + ' Q' + (w / 3) + ' ' + (-h + 2) + ' ' + (w / 2 - 1) + ' ' + (-h * .7) + ' L' + (w / 2) + ' 0Z" fill="#5f665c"/><path d="M' + (w * .15) + ' ' + (-h * .9) + ' L' + (w / 2 - 1) + ' ' + (-h * .7) + ' L' + (w / 2) + ' 0 L' + (w * .1) + ' 0Z" fill="#000" opacity=".3"/><path d="M' + (-w / 2) + ' ' + (-h * .2) + ' Q' + (-w / 4) + ' ' + (-h * .35) + ' ' + (w * .1) + ' ' + (-h * .15) + ' L' + (w * .3) + ' 0 H' + (-w / 2) + 'Z" fill="#4f7a34" opacity=".75"/><path d="M' + (-w * .3) + ' ' + (-h * .8) + ' Q0 ' + (-h * .95) + ' ' + (w * .1) + ' ' + (-h * .8) + '" stroke="#fff" stroke-opacity=".18" fill="none"/></g>';
}
function crownShape(x, y, s, col, jew) {
  return G(x, y, s, '<path d="M-17 0 L-20 -17 L-10 -8 L-4 -22 L0 -9 L4 -22 L10 -8 L20 -17 L17 0Z" fill="' + (col || 'url(#tb-gold)') + '" stroke="#5c3d0c" stroke-width=".8" stroke-linejoin="round"/><rect x="-17" y="-1" width="34" height="5" rx="1.5" fill="' + (col || 'url(#tb-gold)') + '" stroke="#5c3d0c" stroke-width=".8"/><circle cx="-4" cy="-22" r="1.8" fill="#d9374e"/><circle cx="4" cy="-22" r="1.8" fill="#d9374e"/><circle cx="-20" cy="-17" r="1.6" fill="#7bd0ff"/><circle cx="20" cy="-17" r="1.6" fill="#7bd0ff"/>' + [-10, 0, 10].map(function (i) { return '<circle cx="' + i + '" cy="1.6" r="1.4" fill="' + (jew || '#d9374e') + '"/>'; }).join('') + '<path d="M-13 -12 L-8 -7" stroke="#fff" stroke-opacity=".7" stroke-width="1.2"/>');
}
function bannerShape(x, y, s, f, R, tatter, h) {
  h = h || 60; var P = fac(f);
  return G(x, y, s, '<rect x="-1.2" y="' + (-h - 6) + '" width="2.4" height="' + (h + 6) + '" fill="url(#tb-wood)"/><circle cy="' + (-h - 7) + '" r="2.6" fill="url(#tb-gold)"/>' +
    '<path d="M1 ' + (-h) + ' H29 ' + (tatter ? 'L25 ' + (-h + 12) + ' L30 ' + (-h + 24) + ' L24 ' + (-h + 34) + ' L27 ' + (-h + 42) : 'V' + (-h + 40)) + ' L15 ' + (-h + (tatter ? 34 : 30)) + ' L1 ' + (-h + 40) + 'Z" fill="url(#tb-c-' + f + ')" stroke="rgba(0,0,0,.4)" stroke-width=".8"/>' +
    '<g transform="translate(15 ' + (-h + 14) + ') scale(.46)">' + emblem(f, P.glyph) + '</g><path d="M1 ' + (-h) + ' H29" stroke="#d9b24f" stroke-width="2"/><path d="M4 ' + (-h + 4) + ' Q16 ' + (-h + 10) + ' 27 ' + (-h + 4) + ' V' + (-h + 22) + ' Q15 ' + (-h + 28) + ' 4 ' + (-h + 22) + 'Z" fill="#fff" opacity=".08"/>');
}

/* ---- scenes ---- */
var SC = {
  dusk: { sky: 'dusk', gnd: 'moss', hz: 100, far: '#5c6c62', mid: '#34463a', sun: [150, 90] },
  moor: { sky: 'moor', gnd: 'heath', hz: 100, far: '#7f8c80', mid: '#56664a' },
  night: { sky: 'night', gnd: 'dark', hz: 104, far: '#34386c', mid: '#1d2147', moon: [162, 32], stars: 1 },
  hall: { sky: 'hall', gnd: 'floor', hz: 112, hall: 1 },
  sanct: { sky: 'sanct', gnd: 'floor', hz: 116, hall: 2 },
  street: { sky: 'street', gnd: 'cobble', hz: 108, far: '#4a3b3b', mid: '#2a2224', street: 1 },
  forest: { sky: 'forest', gnd: 'moss', hz: 104, far: '#3c5a40', mid: '#243b2a', forest: 1 },
  ember: { sky: 'ember', gnd: 'cobble', hz: 108, far: '#4a2a22', mid: '#2a1612', street: 1, sun: [110, 100] },
  stone: { sky: 'stone', gnd: 'stone', hz: 104, far: '#66756a', mid: '#3e4b43' }
};
function scene(name, R, o) {
  o = o || {}; var S = SC[name] || SC.dusk, hz = S.hz, s = '<rect width="220" height="152" fill="url(#tb-sky-' + S.sky + ')"/>';
  if (S.moon) s += moon(S.moon[0], S.moon[1], 12);
  if (S.stars) s += stars(R, 30, 70);
  if (S.sun) s += glowAt(S.sun[0], S.sun[1], 74, 'warm');
  if (S.hall) {
    s += glowAt(110, 80, 90, 'warm').replace('/>', ' opacity=".55"/>');
    [[-4, 1], [196, 1]].forEach(function (p) { s += '<rect x="' + p[0] + '" y="0" width="30" height="' + hz + '" fill="#1d120d"/><rect x="' + (p[0] + 22) + '" y="0" width="8" height="' + hz + '" fill="#000" opacity=".3"/><rect x="' + (p[0] - 3) + '" y="' + (hz - 8) + '" width="36" height="9" fill="#2a1a12"/>'; });
    s += '<path d="M26 ' + hz + ' V54 Q26 14 110 14 Q194 14 194 54 V' + hz + 'Z" fill="#0d0705" opacity=".5"/><path d="M26 54 Q26 14 110 14 Q194 14 194 54" fill="none" stroke="#3a2418" stroke-width="5"/>';
    s += '<path d="M36 ' + hz + ' V60 Q36 24 110 24 Q184 24 184 60 V' + hz + 'Z" fill="url(#tb-glow-warm)" opacity=".28"/>';
    s += ivy(30, 40, 50, 80, R, 3, 1) + ivy(192, 20, 50, 100, R, 3, 1);
    if (S.hall === 2) s += glowAt(110, 92, 60, 'gold').replace('/>', ' opacity=".6"/>');
  } else if (S.street) {
    s += hills(R, hz - 10, 4, S.far, .9);
    [[-6, 62], [170, 74]].forEach(function (b, i) { s += '<path d="M' + b[0] + ' ' + hz + ' V' + b[1] + ' L' + (b[0] + 25) + ' ' + (b[1] - 18) + ' L' + (b[0] + 52) + ' ' + b[1] + ' V' + hz + 'Z" fill="' + S.mid + '"/>'; for (var k = 0; k < 4; k++) s += '<rect x="' + (b[0] + 8 + (k % 2) * 22) + '" y="' + (b[1] + 8 + Math.floor(k / 2) * 18) + '" width="8" height="10" fill="#ffb347" opacity="' + n2(.35 + R() * .5) + '"/>'; });
    s += ruinBack(R, hz - 2, S.mid, 2);
  } else {
    s += hills(R, hz - 20, 16, S.far, .55) + hills(R, hz - 8, 12, S.mid, .85);
    if (S.forest) s += forestBack(R, hz - 2, ['#15291b', '#1f3a25', '#2a4a2c'], 16);
    if (o.ruins) s += ruinBack(R, hz - 2, name === 'night' ? '#1b1f40' : '#2d3a33', 3);
    if (o.trees) s += broadTree(30, hz + 2, .8, R, 1) + broadTree(196, hz + 3, .9, R, 1);
  }
  var gy = hz; s += '<path d="M0 ' + gy + ' Q55 ' + (gy - 6) + ' 110 ' + (gy - 1) + ' T220 ' + (gy - 3) + ' V152 H0Z" fill="url(#tb-gnd-' + S.gnd + ')"/>';
  if (S.gnd === 'moss' || S.gnd === 'heath') s += blobs(R, 14, 0, gy, 220, 44, 6, 16, ['#6b8a3d', '#3d5a26', '#8a9a4a'], .4);
  if (S.gnd === 'cobble' || S.gnd === 'stone') for (var i = 0; i < 26; i++) s += '<ellipse cx="' + n2(R() * 220) + '" cy="' + n2(gy + 4 + R() * 40) + '" rx="' + n2(4 + R() * 7) + '" ry="' + n2(1.8 + R() * 2) + '" fill="#000" opacity=".16"/>';
  s += '<rect x="0" y="' + (gy - 14) + '" width="220" height="24" fill="url(#tb-mist)" opacity=".45" filter="url(#tb-fog)"/>';
  return s;
}

/* ---- people ---- */
function person(x, y, s, o) {
  o = o || {}; var f = o.f || 'neutral', P = fac(f), skin = o.skin || '#d9b48b', b = '';
  var hand = o.hand || [17, -33], trans = '';
  b += '<ellipse cy="1" rx="16" ry="3.6" fill="#000" opacity=".4" filter="url(#tb-soft)"/>';
  if (o.cape) b += '<path d="M-14 -52 Q-26 -22 -23 1 L23 1 Q26 -22 14 -52Z" fill="' + o.cape + '"/><path d="M-14 -52 Q-26 -22 -23 1 L-12 1Z" fill="#000" opacity=".25"/>';
  if (o.shield) b += '<g transform="translate(-19 -30)"><circle r="13.5" fill="#3a2a1a"/><circle r="12" fill="url(#tb-c-' + f + ')" stroke="#d9c58b" stroke-width="1.4"/><circle r="3.4" fill="url(#tb-steel)"/><g transform="scale(.36) translate(0 -14)">' + emblem(f, P.glyph) + '</g></g>';
  if (o.short) { b += '<rect x="-9" y="-24" width="7" height="24" fill="#2b2a2e"/><rect x="2" y="-24" width="7" height="24" fill="#201f23"/><rect x="-11" y="-5" width="10" height="6" rx="2" fill="#15110f"/><rect x="1" y="-5" width="10" height="6" rx="2" fill="#15110f"/>'; b += '<path d="M-13 -50 Q-17 -36 -15 -22 L15 -22 Q17 -36 13 -50 Q0 -56 -13 -50Z" fill="' + (o.armor ? 'url(#tb-steel)' : 'url(#tb-c-' + f + ')') + '"/>'; if (o.armor) b += '<path d="M-13 -50 Q0 -56 13 -50 L13 -42 Q0 -48 -13 -42Z" fill="#fff" opacity=".25"/><path d="M-14 -34 H14 V-30 H-14Z" fill="url(#tb-gold)" opacity=".9"/><path d="M-4 -52 L0 -30 L4 -52Z" fill="url(#tb-c-' + f + ')"/>'; else b += '<path d="M-14 -33 H14 V-29 H-14Z" fill="url(#tb-gold)"/>'; }
  else { b += '<path d="M-12 -50 Q-19 -22 -18 0 L18 0 Q19 -22 12 -50 Q0 -56 -12 -50Z" fill="url(#tb-c-' + f + ')"/><path d="M4 -52 Q13 -50 12 -50 Q19 -22 18 0 L6 0 Q9 -26 4 -52Z" fill="#000" opacity=".24"/><path d="M-12 -50 Q-6 -46 0 -46" stroke="#fff" stroke-opacity=".25" fill="none"/><path d="M-14 -30 Q0 -26 14 -30 L14.6 -27 Q0 -23 -14.6 -27Z" fill="' + (o.belt || 'url(#tb-gold)') + '"/>'; }
  if (o.tabard) b += '<path d="M-6 -52 H6 L8 -4 H-8Z" fill="url(#tb-c-' + f + ')" stroke="#d9b24f" stroke-width="1.2"/><g transform="translate(0 -30) scale(.36)">' + emblem(f, P.glyph) + '</g>';
  /* arms */
  var sc = o.armor ? '#7d868c' : P.main;
  b += '<path d="M10 -47 Q' + (hand[0] + 2) + ' -44 ' + hand[0] + ' ' + hand[1] + '" stroke="' + sc + '" stroke-width="6.4" fill="none" stroke-linecap="round"/><circle cx="' + hand[0] + '" cy="' + hand[1] + '" r="3.3" fill="' + skin + '"/>';
  var lh = o.lhand || [-14, -32];
  b += '<path d="M-10 -47 Q' + (lh[0] - 2) + ' -44 ' + lh[0] + ' ' + lh[1] + '" stroke="' + sc + '" stroke-width="6.4" fill="none" stroke-linecap="round"/><circle cx="' + lh[0] + '" cy="' + lh[1] + '" r="3.3" fill="' + skin + '"/>';
  /* held (at hand) */
  var hx = hand[0], hy = hand[1], h = o.held, t = '';
  if (h === 'sword') t = '<path d="M' + (hx - 1.6) + ' ' + (hy - 3) + ' L' + (hx - 1) + ' ' + (hy - 46) + ' L' + hx + ' ' + (hy - 52) + ' L' + (hx + 1) + ' ' + (hy - 46) + ' L' + (hx + 1.6) + ' ' + (hy - 3) + 'Z" fill="url(#tb-steel)"/><rect x="' + (hx - 6) + '" y="' + (hy - 4) + '" width="12" height="2.6" rx="1" fill="url(#tb-gold)"/><rect x="' + (hx - 1.2) + '" y="' + hy + '" width="2.4" height="7" fill="#3a2614"/>';
  else if (h === 'axe') t = '<path d="M' + (hx - 2) + ' ' + (hy + 16) + ' L' + (hx + 3) + ' ' + (hy - 38) + '" stroke="#5a3a1d" stroke-width="2.6" stroke-linecap="round"/><path d="M' + (hx + 2) + ' ' + (hy - 38) + ' Q' + (hx + 18) + ' ' + (hy - 42) + ' ' + (hx + 15) + ' ' + (hy - 22) + ' Q' + (hx + 8) + ' ' + (hy - 26) + ' ' + (hx + 2) + ' ' + (hy - 24) + 'Z" fill="url(#tb-steel)"/>';
  else if (h === 'spear') t = '<path d="M' + (hx - 1) + ' ' + (hy + 34) + ' L' + (hx + 2) + ' ' + (hy - 64) + '" stroke="#5a3a1d" stroke-width="2.2" stroke-linecap="round"/><path d="M' + (hx + 2) + ' ' + (hy - 80) + ' L' + (hx + 6) + ' ' + (hy - 62) + ' L' + (hx + 2) + ' ' + (hy - 58) + ' L' + (hx - 2) + ' ' + (hy - 62) + 'Z" fill="url(#tb-steel)"/>';
  else if (h === 'halberd') t = '<path d="M' + (hx - 1) + ' ' + (hy + 34) + ' L' + (hx + 2) + ' ' + (hy - 56) + '" stroke="#5a3a1d" stroke-width="2.2"/><path d="M' + (hx + 2) + ' ' + (hy - 70) + ' L' + (hx + 5) + ' ' + (hy - 54) + ' L' + (hx + 2) + ' ' + (hy - 52) + 'Z M' + (hx + 3) + ' ' + (hy - 62) + ' Q' + (hx + 16) + ' ' + (hy - 60) + ' ' + (hx + 14) + ' ' + (hy - 46) + ' L' + (hx + 3) + ' ' + (hy - 50) + 'Z" fill="url(#tb-steel)"/>';
  else if (h === 'torch') t = '<path d="M' + hx + ' ' + (hy + 6) + ' L' + (hx + 2) + ' ' + (hy - 28) + '" stroke="#4a2c14" stroke-width="3" stroke-linecap="round"/>' + flame(hx + 2, hy - 28, 1.5);
  else if (h === 'lantern') t = '<path d="M' + (hx - 1) + ' ' + (hy + 34) + ' L' + (hx + 1) + ' ' + (hy - 56) + ' Q' + (hx + 1) + ' ' + (hy - 64) + ' ' + (hx + 10) + ' ' + (hy - 62) + '" stroke="#3a2614" stroke-width="2.2" fill="none"/><g transform="translate(' + (hx + 10) + ' ' + (hy - 50) + ')">' + glowAt(0, 4, 34, 'warm') + '<path d="M-3 -10 L3 -10 L5 -6 H-5Z M-5 -6 H5 V8 H-5Z" fill="#3a2614"/><rect x="-3.6" y="-5" width="7.2" height="11" fill="#ffd27a"/><path d="M0 4 C-2 2 -2 -1 0 -3 C2 -1 2 2 0 4Z" fill="#fff6cf"/></g>';
  else if (h === 'staff') t = '<path d="M' + hx + ' ' + (hy + 32) + ' L' + (hx + 1) + ' ' + (hy - 56) + '" stroke="#5a3a1d" stroke-width="2.6" stroke-linecap="round"/><path d="M' + (hx + 1) + ' ' + (hy - 56) + ' Q' + (hx + 12) + ' ' + (hy - 62) + ' ' + (hx + 8) + ' ' + (hy - 72) + '" fill="none" stroke="#5a3a1d" stroke-width="2.4" stroke-linecap="round"/>' + (o.orb ? glowAt(hx + 2, hy - 64, 18, o.orb) + '<circle cx="' + (hx + 2) + '" cy="' + (hy - 64) + '" r="4" fill="#fff"/>' : '') + ivy(hx, hy - 10, 30, -92, rngf(5), 2.4);
  else if (h === 'trumpet') t = '<path d="M' + (hx - 4) + ' ' + (hy - 4) + ' L' + (hx + 24) + ' ' + (hy - 30) + ' L' + (hx + 31) + ' ' + (hy - 24) + ' L' + (hx + 28) + ' ' + (hy - 38) + ' L' + (hx + 40) + ' ' + (hy - 34) + ' L' + (hx + 22) + ' ' + (hy - 14) + 'Z" fill="url(#tb-gold)" stroke="#6d4a10" stroke-width=".8"/><path d="M' + (hx + 14) + ' ' + (hy - 18) + ' L' + (hx + 14) + ' ' + (hy - 6) + ' L' + (hx + 28) + ' ' + (hy - 8) + ' L' + (hx + 28) + ' ' + (hy - 20) + 'Z" fill="url(#tb-c-' + f + ')"/>';
  else if (h === 'bow') t = '<path d="M' + (hx + 2) + ' ' + (hy - 34) + ' Q' + (hx + 22) + ' ' + hy + ' ' + (hx + 2) + ' ' + (hy + 34) + '" fill="none" stroke="#5a3a1d" stroke-width="2.6" stroke-linecap="round"/><path d="M' + (hx + 2) + ' ' + (hy - 34) + ' L' + (hx + 2) + ' ' + (hy + 34) + '" stroke="#e8e0c8" stroke-width=".7"/>';
  else if (h === 'banner') t = '<g transform="translate(' + hx + ' ' + (hy + 34) + ')">' + bannerShape(0, 0, 1, f, rngf(8), o.tatter, 78) + '</g>';
  else if (h === 'candle') t = '<rect x="' + (hx - 2) + '" y="' + (hy - 12) + '" width="4" height="12" fill="#f4ead0"/>' + flame(hx, hy - 12, 1.2);
  else if (h === 'book') t = '<rect x="' + (hx - 8) + '" y="' + (hy - 12) + '" width="16" height="12" fill="#5a2a22" stroke="#d9b24f" stroke-width=".8"/>';
  else if (h === 'pitchfork') t = '<path d="M' + (hx - 1) + ' ' + (hy + 32) + ' L' + (hx + 2) + ' ' + (hy - 50) + '" stroke="#5a3a1d" stroke-width="2.4"/><path d="M' + (hx - 6) + ' ' + (hy - 66) + ' V' + (hy - 54) + ' Q' + (hx + 2) + ' ' + (hy - 48) + ' ' + (hx + 10) + ' ' + (hy - 54) + ' V' + (hy - 66) + ' M' + (hx + 2) + ' ' + (hy - 70) + ' V' + (hy - 50) + '" stroke="url(#tb-steel)" stroke-width="2" fill="none"/>';
  else if (h === 'dagger') t = '<path d="M' + (hx - 1.5) + ' ' + (hy - 2) + ' L' + hx + ' ' + (hy - 20) + ' L' + (hx + 1.5) + ' ' + (hy - 2) + 'Z" fill="url(#tb-steel)"/>';
  else if (h === 'purse') t = '<g transform="translate(' + hx + ' ' + (hy + 6) + ')"><path d="M-5 -2 Q-8 8 0 9 Q8 8 5 -2Z" fill="#6a4a22" stroke="#2a1c0e" stroke-width=".8"/><path d="M-3 -2 L0 -6 L3 -2Z" fill="#8a6a30"/></g>';
  else if (h === 'scale') t = '<g transform="translate(' + hx + ' ' + (hy - 6) + ')"><path d="M0 0 V-18 M-12 -14 H12" stroke="url(#tb-gold)" stroke-width="1.8"/><path d="M-16 -4 H-8 L-12 -14Z M8 -4 H16 L12 -14Z" fill="url(#tb-gold)"/></g>';
  b += t;
  /* head */
  var hd = o.head || 'plain';
  b += '<rect x="-2.6" y="-56" width="5.2" height="6" fill="' + skin + '"/><circle cy="-60" r="6.6" fill="' + skin + '"/><path d="M0 -66 A6.6 6.6 0 0 1 6.6 -60 A6.6 6.6 0 0 1 3 -54.4 Q6 -60 0 -66Z" fill="#000" opacity=".22"/>';
  if (hd !== 'helm' && hd !== 'mask' && hd !== 'hood' && hd !== 'cowl') b += '<path d="M-6 -62 Q-4 -68 1 -67 Q6 -67 6.4 -62 Q2 -65 -6 -62Z" fill="' + (o.hair || '#3a2a1c') + '"/>';
  if (hd === 'helm') b += '<path d="M-8 -60 Q-8 -73 0 -73 Q8 -73 8 -60 V-56 Q6 -52 0 -52 Q-6 -52 -8 -56Z" fill="url(#tb-steel)"/><path d="M-1.6 -66 V-52 M-6 -60 H6" stroke="#1a1d20" stroke-width="1.2"/><path d="M-8 -66 Q-6 -73 0 -73" stroke="#fff" stroke-opacity=".5" fill="none"/>' + (o.plume ? '<path d="M0 -73 Q10 -80 8 -64 Q6 -72 0 -73Z" fill="url(#tb-c-' + f + ')"/>' : '');
  if (hd === 'hood') b += '<path d="M-9 -54 Q-12 -70 0 -72 Q12 -70 9 -54 Q5 -62 0 -62 Q-5 -62 -9 -54Z" fill="url(#tb-c-' + f + ')"/><path d="M-3 -60 Q0 -64 3 -60 Q0 -56 -3 -60Z" fill="#05040a" opacity=".7"/>';
  if (hd === 'cowl') b += '<path d="M-9 -52 Q-12 -70 0 -72 Q12 -70 9 -52 Q5 -57 0 -57 Q-5 -57 -9 -52Z" fill="url(#tb-c-' + f + ')"/><path d="M-4.5 -62 Q0 -67 4.5 -62 Q0 -54 -4.5 -62Z" fill="#07060c" opacity=".85"/>';
  if (hd === 'crown') b += crownShape(0, -66, .38);
  if (hd === 'circlet') b += '<path d="M-6.5 -64 Q0 -68 6.5 -64" stroke="url(#tb-gold)" stroke-width="2" fill="none"/>';
  if (hd === 'cap') b += '<path d="M-8 -64 Q0 -72 8 -64 L10 -62 H-10Z" fill="url(#tb-c-' + f + ')"/><path d="M4 -67 Q16 -78 18 -64 Q12 -70 4 -67Z" fill="#e8e0c8"/>';
  if (hd === 'mitre') b += '<path d="M-7 -64 L0 -88 L7 -64 Q0 -60 -7 -64Z" fill="url(#tb-silver)" stroke="#6a6e88" stroke-width=".7"/><path d="M0 -84 A5 5 0 1 0 0 -72 A3.6 3.6 0 1 1 0 -84Z" fill="#2c2a58"/>';
  if (hd === 'antlers') b += '<path d="M-5 -66 Q-9 -78 -16 -80 M-8 -74 Q-9 -82 -14 -86 M-11 -77 Q-18 -76 -22 -72 M5 -66 Q9 -78 16 -80 M8 -74 Q9 -82 14 -86 M11 -77 Q18 -76 22 -72" stroke="url(#tb-bone)" stroke-width="2" fill="none" stroke-linecap="round"/>';
  if (hd === 'mask') b += '<path d="M-7 -62 Q0 -66 7 -62 V-58 Q0 -55 -7 -58Z" fill="#e8e2d6"/><path d="M-5 -61 L-2 -60 M2 -60 L5 -61" stroke="#111" stroke-width="1.2"/><path d="M-10 -56 Q-12 -72 0 -74 Q12 -72 10 -56 Q6 -64 0 -64 Q-6 -64 -10 -56Z" fill="#1f1a24"/>';
  if (hd === 'bareheaded') b += '';
  if (hd === 'wreath') b += '<path d="M-7 -63 Q0 -69 7 -63" stroke="#4f7e36" stroke-width="2.4" fill="none"/>' + leaf(-5, -66, -30, 2, '#6a9a40') + leaf(5, -66, 30, 2, '#6a9a40');
  if (o.glow) b = glowAt(0, -40, 50, o.glow) + b;
  return G(x, y, s, b, o.alpha ? ' opacity="' + o.alpha + '"' : '');
}
/* ---- beasts (facing right, feet at 0,0) ---- */
function beast(kind, x, y, s, o) {
  o = o || {}; var b = '<ellipse cy="1" rx="22" ry="3.4" fill="#000" opacity=".38" filter="url(#tb-soft)"/>', c = o.col || '#4a4a52', d = mix(c, '#000', .35), l = mix(c, '#fff', .25);
  if (kind === 'wolf') b += '<path d="M-24 -20 Q-22 -34 -6 -34 Q8 -36 18 -30 L30 -34 L28 -26 L38 -22 L28 -17 Q18 -16 12 -14 L12 0 H7 L5 -13 H-12 L-12 0 H-17 L-18 -12 Q-24 -10 -30 -2 Q-26 -14 -24 -20Z" fill="' + c + '"/><path d="M-6 -34 Q8 -36 18 -30 L16 -24 Q4 -30 -8 -26Z" fill="' + l + '" opacity=".5"/><path d="M28 -26 L38 -22 L28 -17Z" fill="' + d + '"/><path d="M24 -32 L26 -42 L31 -33Z" fill="' + c + '"/><circle cx="26" cy="-27" r="1.4" fill="#ffd36a"/><path d="M-12 -4 H-17 L-18 0 H-11Z M7 -4 H12 L12 0 H6Z" fill="' + d + '"/>';
  else if (kind === 'hound') b += '<path d="M-22 -22 Q-20 -34 -4 -33 Q8 -34 16 -30 L24 -40 L29 -34 L38 -30 L36 -25 L28 -22 Q18 -20 12 -16 L13 0 H8 L6 -15 H-10 L-12 0 H-17 L-18 -14 Q-22 -12 -28 -22Z" fill="' + c + '"/><path d="M13 -30 L20 -42 L25 -34Z" fill="' + d + '"/><circle cx="23" cy="-30" r="1.3" fill="#ffd36a"/><path d="M10 -26 Q15 -22 20 -26" stroke="url(#tb-gold)" stroke-width="2.2" fill="none"/>';
  else if (kind === 'boar') b += '<path d="M-26 -18 Q-22 -42 0 -42 Q14 -44 24 -34 L38 -30 L40 -22 L32 -20 L30 -14 L16 -14 L16 0 H10 L9 -14 H-12 L-12 0 H-19 L-20 -12 Q-28 -10 -28 -14Z" fill="' + c + '"/><path d="M-20 -34 L-14 -42 L-8 -33 L0 -42 L6 -33 L14 -42" stroke="' + d + '" stroke-width="2.2" fill="none"/><path d="M34 -26 Q42 -30 44 -38" stroke="url(#tb-bone)" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M24 -36 L27 -42 L30 -35Z" fill="' + d + '"/><circle cx="31" cy="-29" r="1.3" fill="#ffd36a"/>';
  else if (kind === 'bear') b += '<path d="M-24 -4 Q-34 -34 -14 -52 Q-6 -60 6 -58 Q14 -66 22 -58 L30 -52 L36 -50 L34 -44 L26 -42 Q22 -34 24 -20 L28 0 H14 L10 -18 H-8 L-10 0Z" fill="' + c + '"/><path d="M-14 -52 Q-6 -60 6 -58 Q-2 -52 -10 -40Z" fill="' + l + '" opacity=".45"/><circle cx="18" cy="-58" r="3.6" fill="' + d + '"/><circle cx="25" cy="-50" r="1.3" fill="#ffd36a"/><path d="M30 -52 L36 -50 L34 -45Z" fill="#14100e"/><path d="M26 -30 L38 -34 M26 -26 L40 -26" stroke="#e8e0c8" stroke-width="1.6" stroke-linecap="round"/>';
  else if (kind === 'stag') { b += '<path d="M-22 -26 Q-20 -40 -4 -40 Q8 -40 14 -36 L24 -54 L30 -52 L36 -60 L38 -54 L34 -46 L28 -44 L20 -36 Q18 -26 14 -22 L14 0 H9 L8 -20 H-8 L-10 0 H-15 L-16 -20 Q-20 -20 -24 -18Z" fill="' + c + '"/><path d="M-2 -40 Q8 -40 14 -36 L12 -30 Q2 -34 -6 -30Z" fill="' + l + '" opacity=".4"/><path d="M27 -52 Q22 -68 14 -72 M23 -64 Q16 -64 12 -60 M27 -58 Q32 -70 28 -80 M30 -68 Q38 -72 42 -70 M31 -74 Q30 -84 34 -86" stroke="url(#tb-bone)" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="31" cy="-52" r="1.1" fill="#ffd36a"/><path d="M-23 -26 L-28 -30 L-24 -22Z" fill="#e8e0c8"/>'; if (o.glow) b = glowAt(26, -62, 40, o.glow) + b; }
  else if (kind === 'raven') b = '<path d="M-14 0 Q-8 -8 0 -6 Q10 -10 16 -2 L22 -6 L18 2 Q8 6 -4 4 Q-10 4 -14 0Z" fill="#17151d"/><path d="M-2 -4 Q-10 -18 -22 -20 Q-12 -8 -6 0Z" fill="#0c0b11"/><path d="M2 -5 Q8 -16 18 -18 Q10 -8 6 -1Z" fill="#241f2b"/><path d="M18 -2 L26 0 L18 2Z" fill="#3a3340"/><circle cx="15" cy="-1" r=".9" fill="#ffd36a"/>';
  return G(x, y, s, o.flip ? flip(b) : b);
}

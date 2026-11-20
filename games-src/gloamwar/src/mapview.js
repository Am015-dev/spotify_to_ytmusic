/* Gloamwar map view: a woodcut-and-ink map on aged parchment (SVG). Static layer drawn once; tokens and highlights redrawn on render.
   Pan with one finger, pinch or wheel to zoom, tap a region or a token. MV.render(G, hl) ; MV.focus(rid) ; MV.onTap = fn(kind, rid). */
var MV = { k: 0.4, tx: 0, ty: 0, minK: 0.3, maxK: 2.6, onTap: null, hl: null };
var SVGNS = 'http://www.w3.org/2000/svg';
var KILN = [872, 958];
var ROAD_PTS = null;
function icoPath(name, x, y, size, fill, extra) { var s = size / 512; return '<path d="' + ICONS[name] + '" transform="translate(' + (x - size / 2).toFixed(1) + ',' + (y - size / 2).toFixed(1) + ') scale(' + s.toFixed(4) + ')" fill="' + (fill || '#1f1812') + '"' + (extra || '') + '/>'; }
function smoothPath(pts) { var d = 'M' + pts[0][0] + ',' + pts[0][1]; for (var i = 0; i < pts.length - 1; i++) { var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; d += ' C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ',' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ',' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' + p2[0] + ',' + p2[1]; } return d; }
function polyD(p) { return 'M' + p.map(function (q) { return q[0] + ',' + q[1]; }).join('L') + 'Z'; }
var HATCH = { gr: [45, '#2f4a24', 0.28], df: [-45, '#5a3a18', 0.26], au: [0, '#3a4652', 0.22], hl: [90, '#475a22', 0.22], va: [30, '#6e5418', 0.25], pt: [-30, '#7a1e1e', 0.34], cv: [60, '#333', 0.28], sh: [-60, '#8a3a1a', 0.28] };
var TINT = { gr: '#e3dcb0', df: '#e6d4a8', au: '#e9e0c4', hl: '#e7dfb4', va: '#ecdcaa', pt: '#dfc0a0', cv: '#ddd2bb', sh: '#e8c9a2' };
function mapStatic() {
  var h = [];
  h.push('<defs>');
  Object.keys(HATCH).forEach(function (n) { var x = HATCH[n]; h.push('<pattern id="h-' + n + '" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(' + x[0] + ')"><line x1="0" y1="0" x2="0" y2="9" stroke="' + x[1] + '" stroke-width="1.4" opacity="' + x[2] + '"/></pattern>'); });
  h.push('<pattern id="waves" width="40" height="18" patternUnits="userSpaceOnUse"><path d="M0,9 q5,-5 10,0 t10,0" fill="none" stroke="#5e5037" stroke-width="1.2" opacity=".45"/></pattern>');
  h.push('<filter id="rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter>');
  h.push('<filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" seed="9" result="n"/><feColorMatrix type="matrix" values="0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .12  0 0 0 .22 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>');
  h.push('<clipPath id="land"><path d="' + polyD(COAST) + '"/></clipPath>');
  h.push('<radialGradient id="age" cx="50%" cy="45%" r="75%"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#4a3416" stop-opacity=".35"/></radialGradient>');
  h.push('</defs>');
  h.push('<rect width="' + MAPW + '" height="' + MAPH + '" fill="#cdbf98"/><rect width="' + MAPW + '" height="' + MAPH + '" fill="url(#waves)"/>');
  // coastal ripples (woodcut sea lines hugging the shore)
  [46, 30, 16].forEach(function (w, i) { h.push('<path d="' + polyD(COAST) + '" fill="none" stroke="#3b2f1f" stroke-width="' + w + '" opacity="' + (0.06 + i * 0.05) + '" stroke-linejoin="round"/>'); });
  h.push('<g clip-path="url(#land)" id="cells">');
  REGIONS.forEach(function (r) {
    var base = r.nat ? TINT[r.nat] : '#eee0bb';
    h.push('<path class="rg" data-tap="r:' + r.id + '" id="rg-' + r.id + '" d="' + polyD(r.poly) + '" fill="' + base + '"/>');
    if (r.nat) h.push('<path d="' + polyD(r.poly) + '" fill="url(#h-' + r.nat + ')" pointer-events="none"/>');
  });
  h.push('</g>');
  LAKES.forEach(function (l) { h.push('<path d="' + polyD(l) + '" fill="#cdbf98" stroke="#1f1812" stroke-width="2.5"/><path d="' + polyD(l) + '" fill="url(#waves)"/>'); });
  // nation borders (thicker ink where the nation changes)
  var seen = {};
  REGIONS.forEach(function (r) {
    for (var i = 0; i < r.poly.length; i++) {
      var a = r.poly[i], b = r.poly[(i + 1) % r.poly.length], key = [a, b].map(String).sort().join('|'); if (seen[key]) { var o = seen[key]; if (o.nat !== r.nat) h.push('<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="#1f1812" stroke-width="3.2" stroke-dasharray="1 0" clip-path="url(#land)" pointer-events="none"/>'); continue; }
      seen[key] = r;
    }
  });
  // rivers: double ink line
  RIVERS.forEach(function (rv) { var d = smoothPath(rv.pts); h.push('<path d="' + d + '" fill="none" stroke="#1f1812" stroke-width="7" stroke-linecap="round" clip-path="url(#land)" pointer-events="none"/><path d="' + d + '" fill="none" stroke="#cdbf98" stroke-width="3.6" stroke-linecap="round" clip-path="url(#land)" pointer-events="none"/>'); });
  // trees in forest realms
  var woods = ['sailhaven', 'lanternvale', 'silverbough', 'oakthrone', 'whisperwood', 'gallowmere'];
  woods.forEach(function (id, wi) { var r = REG[id], dead = id === 'gallowmere'; for (var i = 0; i < 7; i++) { var a = i * 2.4 + wi, rr = 26 + (i % 3) * 14, x = r.x + Math.cos(a) * rr, y = r.y + Math.sin(a) * rr * 0.8 + 6; h.push(tree(x, y, 15 + (i % 2) * 4, dead)); } });
  // mountains: carved peaks along the walls (impassable)
  MOUNTAINS.forEach(function (m) { for (var i = 1; i < m.pts.length; i++) { var a = m.pts[i - 1], b = m.pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 20)); for (var j = 0; j <= n; j++) { var t = j / n, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t; h.push(peak(x + ((j * 37) % 9 - 4), y + ((j * 53) % 7 - 3), 30 + ((i + j) % 3) * 6)); } } });
  // the Ashen Road
  ROAD_PTS = roadPts();
  h.push('<path d="' + smoothPath([[REG.blackgate.x, REG.blackgate.y]].concat(ROAD_PTS)) + '" fill="none" stroke="#9a2117" stroke-width="4" stroke-dasharray="3 9" stroke-linecap="round" pointer-events="none"/>');
  h.push('<path d="' + smoothPath([[REG.wraithpass.x, REG.wraithpass.y], ROAD_PTS[1], ROAD_PTS[2]]) + '" fill="none" stroke="#9a2117" stroke-width="4" stroke-dasharray="3 9" stroke-linecap="round" pointer-events="none"/>');
  ROAD_PTS.forEach(function (p, i) { if (i < ROAD_PTS.length - 1) h.push('<circle cx="' + p[0] + '" cy="' + p[1] + '" r="11" fill="#eadbb4" stroke="#9a2117" stroke-width="2.5" pointer-events="none"/><text x="' + p[0] + '" y="' + (p[1] + 5) + '" text-anchor="middle" font-size="14" fill="#9a2117" font-family="IM Fell English, Georgia, serif" pointer-events="none">' + (i + 1) + '</text>'); });
  h.push(icoPath('volcano', KILN[0], KILN[1], 64, '#6e130d', ' pointer-events="none"'));
  // settlements: stamp + banner
  REGIONS.forEach(function (r) {
    if (!r.set) return; var c = setPos(r);
    var ic = r.set === 'strong' ? 'strong' : r.set === 'city' ? 'city' : r.set === 'fort' ? 'fort' : 'watch', sz = r.set === 'strong' ? 50 : r.set === 'city' ? 42 : 34;
    h.push('<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + (sz * 0.62) + '" fill="#f1e5c4" stroke="#1f1812" stroke-width="2" pointer-events="none"/>');
    h.push(icoPath(ic, c[0], c[1], sz * 0.9, natSide(r.nat) === 'G' ? '#6e130d' : '#1f1812', ' pointer-events="none"'));
    h.push('<g id="ban-' + r.id + '" pointer-events="none"></g>');
  });
  // labels
  REGIONS.forEach(function (r) {
    var major = !!r.set || ['whisperwood', 'cinderplain'].indexOf(r.id) >= 0, c = setPos(r), fs = r.set === 'strong' ? 30 : r.set === 'city' ? 28 : major ? 25 : 19;
    var y = r.set ? c[1] + (r.set === 'strong' ? 56 : 48) : r.y + 34;
    h.push('<text class="lbl' + (major ? '' : ' minor') + '" x="' + (r.set ? c[0] : r.x) + '" y="' + y + '" font-size="' + fs + '" text-anchor="middle">' + r.n + '</text>');
  });
  // cartouche, compass, sea names
  h.push('<g pointer-events="none" font-family="IM Fell English, Georgia, serif" fill="#3b2f1f"><text x="60" y="1075" font-size="30" font-style="italic" transform="rotate(-80 60 1075)">The Pale Sea</text><text x="900" y="530" font-size="18" font-style="italic" text-anchor="middle">Bitter Mere</text></g>');
  h.push(compass(150, 1290));
  h.push('<rect width="' + MAPW + '" height="' + MAPH + '" fill="url(#age)" pointer-events="none"/>');
  h.push('<rect x="6" y="6" width="' + (MAPW - 12) + '" height="' + (MAPH - 12) + '" fill="none" stroke="#1f1812" stroke-width="4" pointer-events="none"/><rect x="14" y="14" width="' + (MAPW - 28) + '" height="' + (MAPH - 28) + '" fill="none" stroke="#1f1812" stroke-width="1.5" pointer-events="none"/>');
  return h.join('');
}
function roadPts() { var a = [REG.cinderplain.x + 10, REG.cinderplain.y + 8], pts = []; var s = [REG.blackgate.x, REG.blackgate.y + 30]; var cp = [[788, 800], [812, 850], [836, 885], [858, 915], [866, 938], KILN]; return cp; }
function tree(x, y, s, dead) {
  if (dead) return '<path d="M' + x + ',' + (y + s) + ' L' + x + ',' + (y - s) + ' M' + x + ',' + (y - s * 0.3) + ' l' + (-s * 0.6) + ',' + (-s * 0.5) + ' M' + x + ',' + y + ' l' + (s * 0.55) + ',' + (-s * 0.6) + '" stroke="#2a0805" stroke-width="2.4" fill="none" pointer-events="none"/>';
  return '<g pointer-events="none"><path d="M' + x + ',' + (y + s * 0.9) + ' L' + x + ',' + (y + s * 0.2) + '" stroke="#1f1812" stroke-width="2.4"/><ellipse cx="' + x + '" cy="' + (y - s * 0.15) + '" rx="' + (s * 0.62) + '" ry="' + (s * 0.72) + '" fill="#d9c995" stroke="#1f1812" stroke-width="2"/><path d="M' + (x - s * 0.1) + ',' + (y - s * 0.7) + ' q' + (s * 0.5) + ',' + (s * 0.4) + ' ' + (s * 0.3) + ',' + (s * 1.05) + '" stroke="#1f1812" stroke-width="1.6" fill="none"/></g>';
}
function peak(x, y, s) {
  var l = x - s * 0.55, r = x + s * 0.55, t = y - s * 0.7, b = y + s * 0.3, hs = '';
  for (var i = 1; i <= 4; i++) { var f = i / 5; hs += 'M' + (x + (r - x) * f * 0.92).toFixed(1) + ',' + (t + (b - t) * f).toFixed(1) + ' L' + (x + (r - x) * f * 0.2).toFixed(1) + ',' + b.toFixed(1) + ' '; }
  return '<g pointer-events="none"><path d="M' + l + ',' + b + ' L' + x + ',' + t + ' L' + r + ',' + b + 'Z" fill="#efe2bd" stroke="#1f1812" stroke-width="2.6" stroke-linejoin="round"/><path d="' + hs + '" stroke="#1f1812" stroke-width="1.5"/><path d="M' + (x - s * 0.12) + ',' + (t + s * 0.18) + ' L' + x + ',' + t + ' L' + (x + s * 0.15) + ',' + (t + s * 0.22) + '" fill="#fff8e6" stroke="none"/></g>';
}
function compass(x, y) {
  var g = '<g pointer-events="none" transform="translate(' + x + ',' + y + ')"><circle r="54" fill="#efe2bd" stroke="#1f1812" stroke-width="2.5"/><circle r="44" fill="none" stroke="#1f1812" stroke-width="1"/>';
  [[0, -50], [50, 0], [0, 50], [-50, 0]].forEach(function (p, i) { g += '<path d="M0,0 L' + (p[1] ? 8 : -8) * (i === 1 || i === 3 ? 0 : 1) + ',0 L' + p[0] + ',' + p[1] + 'Z" fill="' + (i % 2 ? '#1f1812' : '#9a2117') + '"/>'; });
  g += '<path d="M-7,0 L0,-50 L7,0 L0,50Z" fill="#9a2117" stroke="#1f1812" stroke-width="1.5"/><path d="M0,-7 L50,0 L0,7 L-50,0Z" fill="#1f1812"/><text y="-60" text-anchor="middle" font-size="22" font-family="IM Fell English, Georgia, serif" fill="#1f1812">N</text></g>';
  return g;
}
function setPos(r) { return [r.x, r.y - 6]; }
function tokPos(rid) { var r = REG[rid]; if (r.set && r.y < 118) return [r.x + (r.x > 500 ? -62 : 62), r.y + 4]; return r.set ? [r.x, r.y - 66] : [r.x, Math.max(52, r.y - 22)]; }
// ---------------------------------------------------------------- dynamic layer
function tokenSvg(G, rid, side, a, garrison) {
  var p = tokPos(rid); if (garrison) p = [REG[rid].x + 2, REG[rid].y - 4];
  var u = units(a), l = leaders(a), riders = side === 'G' && a.pt ? a.pt[2] : 0, el = 0; for (var n in a) el += a[n][1];
  var g = side === 'G', fill = g ? '#7c1810' : '#f3e7c6', ink = g ? '#f3e2be' : '#1f1812', r = 31;
  var s = '<g class="tok" data-tap="t:' + rid + (garrison ? ':in' : '') + '" id="tok-' + rid + (garrison ? '-in' : '') + '-' + side + '" transform="translate(' + p[0] + ',' + p[1] + ')"><circle class="hit" r="64"/>';
  if (u > 0) {
    if (garrison) s += '<rect x="-30" y="-30" width="60" height="60" rx="4" fill="' + fill + '" stroke="#1f1812" stroke-width="4"/><path d="M-30,-30 h12 v-8 h12 v8 h12 v-8 h12 v8 h12" fill="none" stroke="#1f1812" stroke-width="3"/>';
    else s += '<circle r="' + (r + 4) + '" fill="#1f1812"/><circle r="' + r + '" fill="' + fill + '" stroke="' + ink + '" stroke-width="2" stroke-dasharray="4 3"/>';
    s += '<text y="11" pointer-events="none" text-anchor="middle" font-size="34" fill="' + ink + '" font-family="IM Fell English, Georgia, serif">' + u + '</text>';
    if (el) s += '<g transform="translate(-26,-24)"><circle r="13" fill="' + (g ? '#f3e2be' : '#1f1812') + '"/><text y="5.5" text-anchor="middle" font-size="16" fill="' + (g ? '#7c1810' : '#f3e7c6') + '" font-family="IM Fell English, Georgia, serif">' + el + '</text></g>';
    if (l - riders > 0) s += '<g transform="translate(26,-24)"><circle r="13" fill="#a8842c" stroke="#1f1812" stroke-width="1.5"/>' + icoPath('leader', 0, 0, 18, '#1f1812') + '</g>';
  }
  if (riders) s += '<g transform="translate(' + (u ? 30 : 0) + ',' + (u ? 22 : 0) + ')"><circle r="' + (u ? 15 : 24) + '" fill="#1f1812" stroke="#9a2117" stroke-width="2"/>' + icoPath('wraith', 0, -1, u ? 22 : 34, '#e9d9b8') + (riders > 1 ? '<text x="' + (u ? 14 : 20) + '" y="' + (u ? 16 : 22) + '" font-size="18" fill="#9a2117" font-family="IM Fell English, Georgia, serif" stroke="#eadbb4" stroke-width="3" paint-order="stroke">' + riders + '</text>' : '') + '</g>';
  s += '<circle class="tokring" r="40" opacity="0"/></g>';
  return s;
}
function charBadges(G, rid, list) {
  var r0 = REG[rid], s = ''; list.forEach(function (c, i) { var d = CHARS[c], g = d.side === 'G', x = r0.x + 46 + (i % 3) * 32, y = (r0.set ? r0.y - 46 : r0.y - 26) - Math.floor(i / 3) * 32;
    s += '<g class="tok ch" data-tap="c:' + c + '" transform="translate(' + x + ',' + y + ')"><circle class="hit" r="30"/><circle r="17" fill="' + (g ? '#7c1810' : '#f3e7c6') + '" stroke="#1f1812" stroke-width="2.5"/>' + icoPath(d.icon, 0, 0, 24, g ? '#f3e2be' : '#1f1812') + '</g>'; });
  return s;
}
function companySvg(G, viewer) {
  var F = G.F, p;
  if (F.road >= 0) p = ROAD_PTS[Math.min(F.road, ROAD_PTS.length - 1)]; else { var r = REG[F.loc]; p = r.set ? [r.x + 50, r.y + 6] : [r.x - 60, r.y - 18]; }
  var s = '<g class="tok co" id="company" data-tap="co:' + F.loc + '" transform="translate(' + p[0] + ',' + p[1] + ')"><circle class="hit" r="54"/>';
  s += '<circle r="27" fill="' + (F.hid ? '#1f1812' : '#9a2117') + '" stroke="#efe2bd" stroke-width="3"/>' + icoPath('lantern', 0, -1, 34, '#f6dd8a');
  if (F.prog > 0 && F.road < 0) s += '<g transform="translate(24,-22)"><circle r="14" fill="#efe2bd" stroke="#1f1812" stroke-width="2"/><text y="6" text-anchor="middle" font-size="18" fill="#1f1812" font-family="IM Fell English, Georgia, serif">+' + F.prog + '</text></g>';
  s += '<circle class="tokring" r="38" opacity="0"/></g>';
  return s;
}
MV.render = function (G, hl, viewer) {
  hl = hl || {}; MV.hl = hl;
  var dyn = document.getElementById('dyn'); if (!dyn) return;
  var s = [];
  (hl.regions || []).forEach(function (rid) { s.push('<path class="rgglow" d="' + polyD(REG[rid].poly) + '"/>'); });
  if (hl.sel) s.push('<path class="rgsel" d="' + polyD(REG[hl.sel].poly) + '"/>');
  // banners show who holds each settlement
  REGIONS.forEach(function (r) {
    if (!r.set || !r.nat) return; var b = document.getElementById('ban-' + r.id); if (!b) return; var c = setPos(r), own = controller(G, r.id), lost = own !== ownerSide(r.id);
    var col = lost ? (own === 'G' ? '#7c1810' : '#1f1812') : NATIONS[r.nat].col; var key = col + lost;
    if (b.getAttribute('data-k') === key) return; b.setAttribute('data-k', key);
    var x = c[0] - 48, y = c[1] - 58; b.innerHTML = '<path d="M' + x + ',' + (y + 46) + ' L' + x + ',' + y + '" stroke="#1f1812" stroke-width="3"/><path d="M' + x + ',' + y + ' h26 l-7,9 l7,9 h-26z" fill="' + col + '" stroke="#1f1812" stroke-width="2"/>' + (lost ? '<path d="M' + (x + 4) + ',' + (y + 4) + ' l12,10 M' + (x + 16) + ',' + (y + 4) + ' l-12,10" stroke="#f1e5c4" stroke-width="2.4"/>' : '');
  });
  Object.keys(G.A).forEach(function (rid) { var a = G.A[rid], sd = armySide(a); if (sd && units(a) + leaders(a) > 0) s.push(tokenSvg(G, rid, sd, a, false)); });
  Object.keys(G.IN).forEach(function (rid) { var a = G.IN[rid]; if (a && units(a)) s.push(tokenSvg(G, rid, armySide(a), a, true)); });
  var byR = {}; Object.keys(G.C).forEach(function (c) { var l = G.C[c]; if (REG[l] && c !== 'wretch') (byR[l] = byR[l] || []).push(c); });
  Object.keys(byR).forEach(function (rid) { s.push(charBadges(G, rid, byR[rid])); });
  if (viewer === 'D' || !G.F.hid || G.F.road >= 0 || hl.showCompany) s.push(companySvg(G, viewer)); else s.push(companySvg(G, viewer));
  dyn.innerHTML = s.join('');
  (hl.tokens || []).forEach(function (id) { var e = document.getElementById(id); if (e) { e.classList.add('legal'); var rg = e.querySelector('.tokring'); if (rg) rg.setAttribute('opacity', '1'); } });
  if (hl.selTok) { var e2 = document.getElementById(hl.selTok); if (e2) { e2.classList.add('sel'); var rg2 = e2.querySelector('.tokring'); if (rg2) rg2.setAttribute('opacity', '1'); } }
};
MV.flash = function (rid) { var f = document.getElementById('flash'); if (!f || !REG[rid]) return; f.setAttribute('d', polyD(REG[rid].poly)); f.style.opacity = '1'; clearTimeout(MV.ft); MV.ft = setTimeout(function () { f.style.opacity = '0'; }, 700); };
// ---------------------------------------------------------------- camera
MV.apply = function () { var m = document.getElementById('map'); if (!m) return; m.style.transform = 'translate(' + MV.tx.toFixed(1) + 'px,' + MV.ty.toFixed(1) + 'px) scale(' + MV.k.toFixed(4) + ')'; var b = document.getElementById('board'); if (b) b.classList.toggle('zoomed-out', MV.k < 0.62); };
MV.clamp = function () { var b = document.getElementById('board'), W = b.clientWidth, H = b.clientHeight; var mw = MAPW * MV.k, mh = MAPH * MV.k; MV.tx = mw <= W ? (W - mw) / 2 : Math.min(0, Math.max(W - mw, MV.tx)); MV.ty = mh <= H ? (H - mh) / 2 : Math.min(0, Math.max(H - mh, MV.ty)); };
MV.fit = function () { var b = document.getElementById('board'); if (!b || !b.clientWidth) return; var W = b.clientWidth, H = b.clientHeight; MV.minK = Math.min(W / MAPW, H / MAPH) * 0.98; MV.k0 = Math.max(MV.minK, Math.min(W / MAPW, 1.2)); if (!MV.k || MV.k < MV.minK || MV.k > MV.maxK) MV.k = MV.k0; MV.clamp(); MV.apply(); };
MV.focus = function (rid, k, smooth) {
  var b = document.getElementById('board'); if (!b || !REG[rid]) return; if (k) MV.k = Math.max(MV.minK, Math.min(MV.maxK, k));
  var p = REG[rid]; MV.tx = b.clientWidth / 2 - p.x * MV.k; MV.ty = b.clientHeight / 2 - p.y * MV.k; MV.clamp();
  var m = document.getElementById('map'); if (smooth !== false && m && !UI.fast) { m.style.transition = 'transform .45s cubic-bezier(.2,.8,.2,1)'; setTimeout(function () { m.style.transition = ''; }, 480); }
  MV.apply();
};
MV.zoomBy = function (f) { var b = document.getElementById('board'), cx = b.clientWidth / 2, cy = b.clientHeight / 2, k = Math.max(MV.minK, Math.min(MV.maxK, MV.k * f)); MV.tx = cx - (cx - MV.tx) * k / MV.k; MV.ty = cy - (cy - MV.ty) * k / MV.k; MV.k = k; MV.clamp(); MV.apply(); };
MV.seen = function (rid) { var b = document.getElementById('board'); if (!b || !REG[rid]) return true; var p = REG[rid], x = p.x * MV.k + MV.tx, y = p.y * MV.k + MV.ty; return x > 30 && y > 30 && x < b.clientWidth - 30 && y < b.clientHeight - 30; };
MV.init = function () {
  var m = document.getElementById('map'); m.innerHTML = '<svg xmlns="' + SVGNS + '" width="' + MAPW + '" height="' + MAPH + '" viewBox="0 0 ' + MAPW + ' ' + MAPH + '">' + mapStatic() + '<path id="flash" class="rgflash" d=""/><g id="dyn"></g></svg>';
  m.style.width = MAPW + 'px'; m.style.height = MAPH + 'px';
  var b = document.getElementById('board'), P = {}, start = null, moved = false, pinch = null;
  b.addEventListener('scroll', function () { if (b.scrollTop || b.scrollLeft) { b.scrollTop = 0; b.scrollLeft = 0; } });
  b.addEventListener('pointerdown', function (e) { P[e.pointerId] = { x: e.clientX, y: e.clientY }; var ids = Object.keys(P); if (ids.length === 1) { start = { x: e.clientX, y: e.clientY, tx: MV.tx, ty: MV.ty }; moved = false; } else if (ids.length === 2) { var a = P[ids[0]], c = P[ids[1]]; pinch = { d: Math.hypot(a.x - c.x, a.y - c.y), k: MV.k, cx: (a.x + c.x) / 2, cy: (a.y + c.y) / 2, tx: MV.tx, ty: MV.ty }; moved = true; } });
  b.addEventListener('pointermove', function (e) {
    if (!P[e.pointerId]) return; P[e.pointerId] = { x: e.clientX, y: e.clientY }; var ids = Object.keys(P), r = b.getBoundingClientRect();
    if (ids.length >= 2 && pinch) { var a = P[ids[0]], c = P[ids[1]], d = Math.hypot(a.x - c.x, a.y - c.y), k = Math.max(MV.minK, Math.min(MV.maxK, pinch.k * d / pinch.d)); var px = pinch.cx - r.left, py = pinch.cy - r.top; MV.tx = px - (px - pinch.tx) * k / pinch.k; MV.ty = py - (py - pinch.ty) * k / pinch.k; MV.k = k; MV.clamp(); MV.apply(); return; }
    if (start && (Math.abs(e.clientX - start.x) + Math.abs(e.clientY - start.y) > 10)) moved = true;
    if (moved && start) { MV.tx = start.tx + e.clientX - start.x; MV.ty = start.ty + e.clientY - start.y; MV.clamp(); MV.apply(); }
  });
  var up = function (e) {
    var was = P[e.pointerId]; delete P[e.pointerId]; if (Object.keys(P).length < 2) pinch = null;
    if (!was || moved || Object.keys(P).length) { if (!Object.keys(P).length) start = null; return; }
    start = null; var t = document.elementFromPoint(e.clientX, e.clientY), el = t && t.closest ? t.closest('[data-tap]') : null; if (!el) return;
    var under = null; try { (document.elementsFromPoint(e.clientX, e.clientY) || []).some(function (x) { if (x.classList && x.classList.contains('rg')) { under = x.id.slice(3); return true; } return false; }); } catch (er) { }
    var v = el.getAttribute('data-tap').split(':'); if (MV.onTap) MV.onTap(v[0], v[1], v[2], e, under);
  };
  b.addEventListener('pointerup', up); b.addEventListener('pointercancel', function (e) { delete P[e.pointerId]; pinch = null; start = null; });
  b.addEventListener('wheel', function (e) { e.preventDefault(); var r = b.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top, k = Math.max(MV.minK, Math.min(MV.maxK, MV.k * (e.deltaY < 0 ? 1.15 : 0.87))); MV.tx = px - (px - MV.tx) * k / MV.k; MV.ty = py - (py - MV.ty) * k / MV.k; MV.k = k; MV.clamp(); MV.apply(); }, { passive: false });
  b.addEventListener('dblclick', function (e) { var r = b.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top, k = MV.k < 0.9 ? Math.min(MV.maxK, MV.k * 2) : MV.k0; MV.tx = px - (px - MV.tx) * k / MV.k; MV.ty = py - (py - MV.ty) * k / MV.k; MV.k = k; MV.clamp(); MV.apply(); });
  MV.fit();
};

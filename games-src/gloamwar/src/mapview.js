/* Gloamwar map view: a woodcut-and-ink map on aged parchment (SVG). Static layer drawn once; tokens and highlights redrawn on render.
   Pan with one finger, pinch or wheel to zoom, tap a region or a token. MV.render(G, hl) ; MV.focus(rid) ; MV.onTap = fn(kind, rid). */
var MV = { k: 0.4, tx: 0, ty: 0, minK: 0.3, maxK: 2.6, onTap: null, hl: null };
var SVGNS = 'http://www.w3.org/2000/svg';
var KILN = [872, 958];
var ROAD_PTS = null;
function icoPath(name, x, y, size, fill, extra) { var s = size / 512; return '<path d="' + ICONS[name] + '" transform="translate(' + (x - size / 2).toFixed(1) + ',' + (y - size / 2).toFixed(1) + ') scale(' + s.toFixed(4) + ')" fill="' + (fill || '#1f1812') + '"' + (extra || '') + '/>'; }
function smoothPath(pts) { var d = 'M' + pts[0][0] + ',' + pts[0][1]; for (var i = 0; i < pts.length - 1; i++) { var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; d += ' C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ',' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ',' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' + p2[0] + ',' + p2[1]; } return d; }
function polyD(p) { return 'M' + p.map(function (q) { return q[0] + ',' + q[1]; }).join('L') + 'Z'; }
/* Map language (owner will replace art; shapes and colours carry the meaning):
   region fill = nation colour (Dawn cool, Gloam warm), thick dark border between nations; settlement plate colour = who holds it now;
   army = round token with a big white number (blue Dawn, red Gloam); hero/minion = shield; Company = lantern disc. Every shape has a class ico-* listed in LEGEND. */
var TINT = { gr: '#3e8c47', df: '#2c8f8a', au: '#3f6fb5', hl: '#8fae3a', va: '#c9a227', pt: '#8f1f22', cv: '#5e3a85', sh: '#c4561c' };
var SIDECOL = { D: '#1d4fae', G: '#b3161c' };
var LAND = '#6d785c', SEA = '#1f3d55';
function mapStatic() {
  var h = [];
  h.push('<defs>');
  h.push('<pattern id="tex" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="3" cy="4" r="1.1" fill="#000" opacity=".10"/><circle cx="10" cy="9" r="0.9" fill="#fff" opacity=".10"/><circle cx="6" cy="12" r="0.7" fill="#000" opacity=".08"/></pattern>');
  h.push('<pattern id="waves" width="40" height="18" patternUnits="userSpaceOnUse"><path d="M0,9 q5,-5 10,0 t10,0" fill="none" stroke="#9cc2dc" stroke-width="1.2" opacity=".22"/></pattern>');
  h.push('<clipPath id="land"><path d="' + polyD(COAST) + '"/></clipPath>');
  h.push('</defs>');
  h.push('<rect width="' + MAPW + '" height="' + MAPH + '" fill="' + SEA + '"/><rect width="' + MAPW + '" height="' + MAPH + '" fill="url(#waves)"/>');
  h.push('<path d="' + polyD(COAST) + '" fill="none" stroke="#9cc2dc" stroke-width="22" opacity=".18" stroke-linejoin="round"/>');
  h.push('<g clip-path="url(#land)" id="cells">');
  REGIONS.forEach(function (r) { h.push('<path class="rg" data-tap="r:' + r.id + '" id="rg-' + r.id + '" d="' + polyD(r.poly) + '" fill="' + (r.nat ? TINT[r.nat] : LAND) + '" stroke="#14100c" stroke-width="1.6" stroke-opacity=".55"/>'); });
  h.push('<rect width="' + MAPW + '" height="' + MAPH + '" fill="url(#tex)" pointer-events="none"/>');
  h.push('</g>');
  LAKES.forEach(function (l) { h.push('<path d="' + polyD(l) + '" fill="' + SEA + '" stroke="#0d0a07" stroke-width="3"/><path d="' + polyD(l) + '" fill="url(#waves)"/>'); });
  // nation borders: thick dark line where the nation changes
  var seen = {};
  REGIONS.forEach(function (r) {
    for (var i = 0; i < r.poly.length; i++) {
      var a = r.poly[i], b = r.poly[(i + 1) % r.poly.length], key = [a, b].map(String).sort().join('|'); if (seen[key]) { var o = seen[key]; if (o.nat !== r.nat) h.push('<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="#0d0a07" stroke-width="5" stroke-linecap="round" clip-path="url(#land)" pointer-events="none"/>'); continue; }
      seen[key] = r;
    }
  });
  h.push('<path d="' + polyD(COAST) + '" fill="none" stroke="#0d0a07" stroke-width="5" stroke-linejoin="round" pointer-events="none"/>');
  RIVERS.forEach(function (rv) { var d = smoothPath(rv.pts); h.push('<path class="ico-river" d="' + d + '" fill="none" stroke="#0d0a07" stroke-width="8" stroke-linecap="round" clip-path="url(#land)" pointer-events="none"/><path d="' + d + '" fill="none" stroke="#6fb0dc" stroke-width="4.4" stroke-linecap="round" clip-path="url(#land)" pointer-events="none"/>'); });
  // mountain walls: impassable
  MOUNTAINS.forEach(function (m) { for (var i = 1; i < m.pts.length; i++) { var a = m.pts[i - 1], b = m.pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 22)); for (var j = 0; j <= n; j++) { var t = j / n; h.push(peak(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, 30)); } } });
  // the Ashen Road: 5 numbered steps to the Kiln
  ROAD_PTS = roadPts();
  h.push('<path d="' + smoothPath([[REG.blackgate.x, REG.blackgate.y]].concat(ROAD_PTS)) + '" fill="none" stroke="#ffcf5a" stroke-width="5" stroke-dasharray="4 10" stroke-linecap="round" pointer-events="none"/>');
  h.push('<path d="' + smoothPath([[REG.wraithpass.x, REG.wraithpass.y], ROAD_PTS[1], ROAD_PTS[2]]) + '" fill="none" stroke="#ffcf5a" stroke-width="5" stroke-dasharray="4 10" stroke-linecap="round" pointer-events="none"/>');
  ROAD_PTS.forEach(function (p, i) { if (i < ROAD_PTS.length - 1) h.push('<g class="ico-road" data-tap="k:road" pointer-events="all"><circle cx="' + p[0] + '" cy="' + p[1] + '" r="13" fill="#1a1410" stroke="#ffcf5a" stroke-width="3"/><text x="' + p[0] + '" y="' + (p[1] + 6) + '" text-anchor="middle" font-size="17" font-weight="700" fill="#ffcf5a" font-family="Arial, sans-serif" pointer-events="none">' + (i + 1) + '</text></g>'); });
  h.push('<g class="ico-kiln" data-tap="k:kiln" pointer-events="all"><circle cx="' + KILN[0] + '" cy="' + KILN[1] + '" r="40" fill="#1a1410" stroke="#ff7a1a" stroke-width="5"/>' + icoPath('volcano', KILN[0], KILN[1], 56, '#ff7a1a', ' pointer-events="none"') + '</g>');
  // settlement plates (drawn in MV.render: their colour follows who holds them)
  REGIONS.forEach(function (r) { if (r.set) h.push('<g id="ban-' + r.id + '"></g>'); });
  // labels: small, high-contrast; minor ones only when zoomed in
  REGIONS.forEach(function (r) {
    var major = !!r.set || ['whisperwood', 'cinderplain'].indexOf(r.id) >= 0, c = setPos(r), fs = r.set === 'strong' ? 26 : r.set === 'city' ? 24 : major ? 22 : 18;
    var y = r.set ? c[1] + (r.set === 'strong' ? 50 : 44) : r.y + 34;
    h.push('<text class="mlbl' + (major ? '' : ' minor') + '" style="--b:' + fs + '" x="' + (r.set ? c[0] : r.x) + '" y="' + y + '" font-size="' + fs + '" text-anchor="middle">' + r.n + '</text>');
  });
  h.push('<g pointer-events="none" font-family="Arial, sans-serif" fill="#9cc2dc" opacity=".8"><text x="60" y="1075" font-size="26" font-style="italic" transform="rotate(-80 60 1075)">The Pale Sea</text><text x="912" y="528" font-size="16" font-style="italic" text-anchor="middle">Bitter Mere</text></g>');
  return h.join('');
}
function roadPts() { return [[788, 800], [812, 850], [836, 885], [858, 915], [866, 938], KILN]; }
function peak(x, y, s) {
  var l = x - s * 0.55, r = x + s * 0.55, t = y - s * 0.7, b = y + s * 0.3;
  return '<g class="ico-mountain" pointer-events="none"><path d="M' + l + ',' + b + ' L' + x + ',' + t + ' L' + r + ',' + b + 'Z" fill="#8d8a83" stroke="#0d0a07" stroke-width="2.6" stroke-linejoin="round"/><path d="M' + x + ',' + t + ' L' + r + ',' + b + ' L' + x + ',' + b + 'Z" fill="#5f5c57"/><path d="M' + (x - s * 0.16) + ',' + (t + s * 0.24) + ' L' + x + ',' + t + ' L' + (x + s * 0.16) + ',' + (t + s * 0.24) + 'Z" fill="#f4f1ea"/></g>';
}
var SETICO = { strong: 'strong', city: 'city', fort: 'fort', town: 'watch' };
function plateSvg(set, x, y, col) {
  var s = set === 'strong' ? 46 : set === 'city' ? 40 : set === 'fort' ? 36 : 30, h2 = s / 2, shape;
  if (set === 'strong') shape = '<rect x="' + (x - h2) + '" y="' + (y - h2) + '" width="' + s + '" height="' + s + '" rx="7"';
  else if (set === 'fort') shape = '<path d="M' + x + ',' + (y - h2 - 4) + ' L' + (x + h2 + 4) + ',' + y + ' L' + x + ',' + (y + h2 + 4) + ' L' + (x - h2 - 4) + ',' + y + 'Z"';
  else shape = '<circle cx="' + x + '" cy="' + y + '" r="' + h2 + '"';
  return shape + ' fill="' + col + '" stroke="#fff" stroke-width="3.5"/>' + icoPath(SETICO[set], x, y, s * 0.68, '#fff', ' pointer-events="none"');
}
function setPos(r) { return [r.x, r.y - 6]; }
function tokPos(rid) { var r = REG[rid]; if (r.set && r.y < 118) return [r.x + (r.x > 500 ? -62 : 62), r.y + 4]; return r.set ? [r.x, r.y - 62] : [r.x, Math.max(52, r.y - 22)]; }
function shieldD(w) { var h = w * 1.15; return 'M' + (-w / 2) + ',' + (-h / 2) + ' H' + (w / 2) + ' V' + (h * 0.05) + ' Q' + (w / 2) + ',' + (h * 0.38) + ' 0,' + (h / 2) + ' Q' + (-w / 2) + ',' + (h * 0.38) + ' ' + (-w / 2) + ',' + (h * 0.05) + 'Z'; }
var NUMF = ' font-family="Arial, Helvetica, sans-serif" font-weight="700"';
// ---------------------------------------------------------------- dynamic layer
function tokenSvg(G, rid, side, a, garrison) {
  var p = tokPos(rid); if (garrison) p = [REG[rid].x + 2, REG[rid].y - 4];
  var u = units(a), l = leaders(a), riders = side === 'G' && a.pt ? a.pt[2] : 0, el = 0; for (var n in a) el += a[n][1];
  var fill = SIDECOL[side], r = 30;
  var s = '<g class="tok" data-tap="t:' + rid + (garrison ? ':in' : '') + '" id="tok-' + rid + (garrison ? '-in' : '') + '-' + side + '" transform="translate(' + p[0] + ',' + p[1] + ')"><circle class="hit" r="64"/><g class="ts">';
  if (u > 0) {
    if (garrison) s += '<g class="ico-garrison"><rect x="-30" y="-30" width="60" height="60" rx="5" fill="' + fill + '" stroke="#fff" stroke-width="4"/><path d="M-30,-30 h12 v-9 h12 v9 h12 v-9 h12 v9 h12" fill="none" stroke="#fff" stroke-width="3.5"/></g>';
    else s += '<g class="ico-army"><circle r="' + (r + 5) + '" fill="#0d0a07"/><circle r="' + r + '" fill="' + fill + '" stroke="#fff" stroke-width="4"/></g>';
    s += '<text y="12" pointer-events="none" text-anchor="middle" font-size="34" fill="#fff"' + NUMF + '>' + u + '</text>';
    if (el) s += '<g class="ico-elite" transform="translate(-28,-26)"><rect x="-13" y="-13" width="26" height="26" rx="4" fill="#f2c230" stroke="#0d0a07" stroke-width="2.5"/><text y="7" text-anchor="middle" font-size="18" fill="#0d0a07"' + NUMF + '>' + el + '</text></g>';
    if (l - riders > 0) s += '<g class="ico-leader" transform="translate(28,-26)"><path d="' + shieldD(26) + '" fill="#fff" stroke="#0d0a07" stroke-width="2.5"/><text y="7" text-anchor="middle" font-size="18" fill="' + fill + '"' + NUMF + '>' + (l - riders) + '</text></g>';
  }
  if (riders) s += '<g class="ico-rider" transform="translate(' + (u ? 30 : 0) + ',' + (u ? 24 : 0) + ')"><circle r="' + (u ? 16 : 24) + '" fill="#0d0a07" stroke="#ff4b4b" stroke-width="2.5"/>' + icoPath('wraith', 0, -1, u ? 22 : 34, '#fff') + (riders > 1 ? '<text x="' + (u ? 15 : 22) + '" y="' + (u ? 17 : 24) + '" font-size="17" fill="#fff" stroke="#0d0a07" stroke-width="3" paint-order="stroke"' + NUMF + '>' + riders + '</text>' : '') + '</g>';
  s += '<circle class="tokring" r="42" opacity="0"/></g></g>';
  return s;
}
function charBadges(G, rid, list) {
  var r0 = REG[rid], s = ''; list.forEach(function (c, i) { var d = CHARS[c], g = d.side === 'G', x = r0.x + 48 + (i % 3) * 34, y = (r0.set ? r0.y - 44 : r0.y - 26) - Math.floor(i / 3) * 38;
    s += '<g class="tok ch" data-tap="c:' + c + '" transform="translate(' + x + ',' + y + ')"><circle class="hit" r="30"/><g class="tc ' + (g ? 'ico-minion' : 'ico-hero') + '"><path d="' + shieldD(32) + '" fill="' + (g ? '#2a0d0d' : '#f4f1ea') + '" stroke="' + SIDECOL[g ? 'G' : 'D'] + '" stroke-width="3.5"/>' + icoPath(d.icon, 0, -1, 22, g ? '#ff6b6b' : '#1d4fae') + '</g></g>'; });
  return s;
}
function companySvg(G, viewer) {
  var F = G.F, p;
  if (F.road >= 0) p = ROAD_PTS[Math.min(F.road, ROAD_PTS.length - 1)]; else { var r = REG[F.loc]; p = r.set ? [r.x + 50, r.y + 6] : [r.x - 60, r.y - 18]; }
  var s = '<g class="tok co" id="company" data-tap="co:' + F.loc + '" transform="translate(' + p[0] + ',' + p[1] + ')"><circle class="hit" r="54"/><g class="ts ico-company">';
  s += '<circle r="29" fill="' + (F.hid ? '#14100c' : '#b3161c') + '" stroke="#ffcf5a" stroke-width="4"/>' + icoPath('lantern', 0, -1, 34, '#ffcf5a');
  if (F.prog > 0 && F.road < 0) s += '<g class="ico-progress" transform="translate(26,-24)"><circle r="14" fill="#ffcf5a" stroke="#0d0a07" stroke-width="2"/><text y="6" text-anchor="middle" font-size="16" fill="#0d0a07"' + NUMF + '>+' + F.prog + '</text></g>';
  s += '<circle class="tokring" r="40" opacity="0"/></g></g>';
  return s;
}
MV.render = function (G, hl, viewer) {
  hl = hl || {}; MV.hl = hl;
  var dyn = document.getElementById('dyn'); if (!dyn) return;
  var s = [];
  (hl.regions || []).forEach(function (rid) { s.push('<path class="rgglow" d="' + polyD(REG[rid].poly) + '"/>'); });
  if (hl.sel) s.push('<path class="rgsel" d="' + polyD(REG[hl.sel].poly) + '"/>');
  // settlement plates: colour = who holds it now (blue Dawn, red Gloam)
  REGIONS.forEach(function (r) {
    if (!r.set) return; var b = document.getElementById('ban-' + r.id); if (!b) return; var c = setPos(r), own = r.nat ? controller(G, r.id) : 'N', key = own;
    if (b.getAttribute('data-k') === key) return; b.setAttribute('data-k', key);
    b.setAttribute('class', 'ico-' + r.set); b.setAttribute('data-tap', 's:' + r.id); b.innerHTML = plateSvg(r.set, c[0], c[1], own === 'N' ? '#4b4b4b' : SIDECOL[own]);
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
MV.apply = function () { var m = document.getElementById('map'); if (!m) return; m.style.transform = 'translate(' + MV.tx.toFixed(1) + 'px,' + MV.ty.toFixed(1) + 'px) scale(' + MV.k.toFixed(4) + ')'; var b = document.getElementById('board'); if (b) b.classList.toggle('zoomed-out', MV.k < 0.62);
  var k = MV.k; m.style.setProperty('--ik', (1 / k).toFixed(3)); m.style.setProperty('--lf', (12.5 / k).toFixed(2)); m.style.setProperty('--ts', Math.min(2, Math.max(1, 15 / (31 * k))).toFixed(3)); m.style.setProperty('--tc', Math.min(2.4, Math.max(1, 14 / (17 * k))).toFixed(3));
  if (window.closeRCard && !MV.keepCard) closeRCard(); };
MV.clamp = function () { var b = document.getElementById('board'), W = b.clientWidth, H = b.clientHeight; var mw = MAPW * MV.k, mh = MAPH * MV.k; MV.tx = mw <= W ? (W - mw) / 2 : Math.min(0, Math.max(W - mw, MV.tx)); MV.ty = mh <= H ? (H - mh) / 2 : Math.min(0, Math.max(H - mh, MV.ty)); };
MV.fit = function () { var b = document.getElementById('board'); if (!b || !b.clientWidth) return; var W = b.clientWidth, H = b.clientHeight; MV.minK = Math.min(W / MAPW, H / MAPH) * 0.98; MV.k0 = Math.max(MV.minK, Math.min(W / MAPW, 1.2)); if (W < 700) MV.k0 = Math.max(MV.k0, 0.82); if (!MV.k || MV.k < MV.minK || MV.k > MV.maxK) MV.k = MV.k0; MV.clamp(); MV.apply(); };
MV.setSel = function (rid) {
  var sp = document.getElementById('selp'), nb = document.getElementById('nbp'); if (!sp) return;
  if (!rid || !REG[rid]) { sp.setAttribute('d', ''); nb.innerHTML = ''; return; }
  sp.setAttribute('d', polyD(REG[rid].poly)); nb.innerHTML = REG[rid].adj.map(function (a) { return REG[a] ? '<path class="rgnb" d="' + polyD(REG[a].poly) + '"/>' : ''; }).join('');
};
MV.rectOf = function (rid) { var b = document.getElementById('board'), br = b.getBoundingClientRect(), r = REG[rid], x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; r.poly.forEach(function (p) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
  var L = br.left + MV.tx + x0 * MV.k, T = br.top + MV.ty + y0 * MV.k; return { left: L, top: T, right: br.left + MV.tx + x1 * MV.k, bottom: br.top + MV.ty + y1 * MV.k }; };
MV.focus = function (rid, k, smooth) {
  var b = document.getElementById('board'); if (!b || !REG[rid]) return; if (k) MV.k = Math.max(MV.minK, Math.min(MV.maxK, k));
  var p = REG[rid]; MV.tx = b.clientWidth / 2 - p.x * MV.k; MV.ty = b.clientHeight / 2 - p.y * MV.k; MV.clamp();
  var m = document.getElementById('map'); if (smooth !== false && m && !UI.fast) { m.style.transition = 'transform .45s cubic-bezier(.2,.8,.2,1)'; setTimeout(function () { m.style.transition = ''; }, 480); }
  MV.apply();
};
MV.zoomBy = function (f) { var b = document.getElementById('board'), cx = b.clientWidth / 2, cy = b.clientHeight / 2, k = Math.max(MV.minK, Math.min(MV.maxK, MV.k * f)); MV.tx = cx - (cx - MV.tx) * k / MV.k; MV.ty = cy - (cy - MV.ty) * k / MV.k; MV.k = k; MV.clamp(); MV.apply(); };
MV.seen = function (rid) { var b = document.getElementById('board'); if (!b || !REG[rid]) return true; var p = REG[rid], x = p.x * MV.k + MV.tx, y = p.y * MV.k + MV.ty; return x > 30 && y > 30 && x < b.clientWidth - 30 && y < b.clientHeight - 30; };
MV.init = function () {
  var m = document.getElementById('map'); m.innerHTML = '<svg xmlns="' + SVGNS + '" width="' + MAPW + '" height="' + MAPH + '" viewBox="0 0 ' + MAPW + ' ' + MAPH + '">' + mapStatic() + '<path id="flash" class="rgflash" d=""/><g id="nbp"></g><path id="selp" class="rgsel" d=""/><g id="dyn"></g></svg>';
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

/* ===== Card renderer ===== */
var CW = 260, CH = 372;
var TYPES = { unit: 'Unit', edict: 'Edict', relic: 'Relic', oath: 'Oath', rite: 'Rite', ploy: 'Ploy', trade: 'Trade', omen: 'Omen' };
function typeIcon(t, col) {
  col = col || '#f1e3c3'; var st = ' fill="none" stroke="' + col + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
  switch (t) {
    case 'edict': return '<path d="M-6 -8 H5 Q9 -8 9 -4 V6 Q9 9 5 9 H-5 Q-8 9 -8 5 V-4" ' + st + '/><path d="M-4 -3 H5 M-4 1 H5 M-4 5 H2" ' + st + '/>';
    case 'relic': return '<path d="M-7 -8 H7 Q7 2 2 3 V6 H5 V9 H-5 V6 H-2 V3 Q-7 2 -7 -8Z" ' + st + '/>';
    case 'oath': return '<circle cx="-3.5" cy="0" r="5.5" ' + st + '/><circle cx="3.5" cy="0" r="5.5" ' + st + '/>';
    case 'rite': return '<path d="M3 -9 A9 9 0 1 0 3 9 A6.5 6.5 0 1 1 3 -9Z" ' + st + '/><path d="M8 -5 l1 2.4 2.4 1 -2.4 1 -1 2.4 -1 -2.4 -2.4 -1 2.4 -1Z" fill="' + col + '"/>';
    case 'ploy': return '<path d="M-10 0 Q0 -9 10 0 Q0 9 -10 0Z" ' + st + '/><circle r="3" fill="' + col + '"/>';
    case 'trade': return '<circle r="8.5" ' + st + '/><path d="M-3 -3 Q0 -6 3 -3 M-3 3 Q0 6 3 3 M0 -6 V6" ' + st + '/>';
    case 'omen': return '<circle r="3.5" fill="' + col + '"/><path d="M0 -10 V-6 M0 6 V10 M-10 0 H-6 M6 0 H10 M-7 -7 L-4.5 -4.5 M4.5 4.5 L7 7 M7 -7 L4.5 -4.5 M-4.5 4.5 L-7 7" ' + st + '/>';
    default: return '<path d="M-1 -10 L1 -10 L1.4 3 L-1.4 3Z M-5 3 H5 M0 3 V9" ' + st + '/><path d="M-9 8 L9 -9" stroke="none"/>';
  }
}
function frameOrnaments(f, P) {
  var s = '', i;
  if (f === 'gilded') {
    [[0, 0, 1, 1], [260, 0, -1, 1], [0, 372, 1, -1], [260, 372, -1, -1]].forEach(function (c) { s += '<g transform="translate(' + c[0] + ' ' + c[1] + ') scale(' + c[2] + ' ' + c[3] + ')"><path d="M5 5 Q30 5 30 28 Q22 14 5 16Z M5 5 Q5 30 28 30 Q14 22 16 5Z" fill="url(#tb-gold)" stroke="#4a3208" stroke-width=".6"/><circle cx="9" cy="9" r="2.6" fill="#c43a50" stroke="#4a3208" stroke-width=".5"/></g>'; });
    for (i = 0; i < 6; i++) { s += '<path d="M' + (46 + i * 34) + ' 362 l3 -3 l3 3 l-3 3Z" fill="url(#tb-gold)" opacity=".8"/>'; }
  } else if (f === 'heath') {
    for (i = 0; i < 11; i++) { var x = 30 + i * 20; s += leaf(x, 7, i % 2 ? 20 : -20, 4.2, i % 3 ? '#a6c46a' : '#6b8f3e') + leaf(x, 368, i % 2 ? -20 : 20, 4.2, i % 3 ? '#a6c46a' : '#6b8f3e'); }
    for (i = 0; i < 16; i++) { var y = 30 + i * 21; s += leaf(7, y, i % 2 ? 70 : 110, 4, i % 3 ? '#a6c46a' : '#6b8f3e') + leaf(253, y, i % 2 ? 110 : 70, 4, i % 3 ? '#a6c46a' : '#6b8f3e'); }
    s += '<path d="M6 6 q14 -2 12 14 M254 6 q-14 -2 -12 14 M6 366 q14 2 12 -14 M254 366 q-14 2 -12 -14" stroke="#e8dfc4" stroke-width="2" fill="none"/>';
  } else if (f === 'lantern') {
    var pts = []; for (i = 0; i < 12; i++) { pts.push([18 + i * 22, 7], [18 + i * 22, 368]); } for (i = 0; i < 15; i++) { pts.push([7, 28 + i * 22], [253, 28 + i * 22]); }
    pts.forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.3" fill="url(#tb-iron)" stroke="#e0a44a" stroke-width=".7"/>'; });
    s += '<path d="M4 4 H40 M4 4 V40 M256 4 H220 M256 4 V40 M4 368 H40 M4 368 V332 M256 368 H220 M256 368 V332" stroke="#ffd079" stroke-width="2" opacity=".55"/>';
  } else if (f === 'choir') {
    for (i = 0; i < 12; i++) { s += '<path d="M' + (24 + i * 20) + ' 7 l1 2.2 2.2 1 -2.2 1 -1 2.2 -1 -2.2 -2.2 -1 2.2 -1Z M' + (24 + i * 20) + ' 365 l1 2.2 2.2 1 -2.2 1 -1 2.2 -1 -2.2 -2.2 -1 2.2 -1Z" fill="#e9e8f6" opacity=".85" transform="translate(-1.5 -1.5)"/>'; }
    [[10, 10], [250, 10], [10, 362], [250, 362]].forEach(function (c, k) { s += '<path d="M' + c[0] + ' ' + (c[1] - 7) + ' A7 7 0 1 0 ' + c[0] + ' ' + (c[1] + 7) + ' A5 5 0 1 1 ' + c[0] + ' ' + (c[1] - 7) + 'Z" fill="url(#tb-silver)" transform="rotate(' + (k * 90) + ' ' + c[0] + ' ' + c[1] + ')"/>'; });
  } else {
    var t = '', r = rngf(7);
    t += thorn(10, 14, 240, 0, r, '#1d1208').replace(/stroke-width="1.7"/, 'stroke-width="1.5"') + thorn(10, 358, 240, 0, r, '#1d1208');
    s += '<g opacity=".8">' + t + '</g>';
    [[8, 8], [252, 8], [8, 364], [252, 364]].forEach(function (c) { s += rose(c[0], c[1], 1.1, '#b8402a'); });
  }
  return s;
}
function backPattern(f, P) {
  var s = '', i, j;
  for (i = -12; i < 22; i++) s += '<path d="M' + (i * 22) + ' 0 L' + (i * 22 + 380) + ' 372 M' + (i * 22 + 380) + ' 0 L' + (i * 22) + ' 372" stroke="' + P.accent + '" stroke-opacity=".13" stroke-width="1"/>';
  for (i = 0; i < 6; i++) for (j = 0; j < 8; j++) s += '<circle cx="' + (22 + i * 43.2) + '" cy="' + (22 + j * 47) + '" r="1.5" fill="' + P.accent + '" opacity=".28"/>';
  return s;
}
function cardBackInner(f, lite) {
  var P = fac(f), s = '<g clip-path="url(#tb-clip-card)"><rect width="260" height="372" fill="url(#tb-f-' + f + ')"/>';
  s += '<rect width="260" height="372" fill="url(#tb-vig)" opacity=".8"/>' + backPattern(f, P);
  if (!lite) s += '<rect width="260" height="372" filter="url(#tb-grain)" opacity=".35"/>';
  s += '</g>';
  s += '<rect x="4" y="4" width="252" height="364" rx="13" fill="none" stroke="url(#tb-gold)" stroke-width="3"/><rect x="14" y="14" width="232" height="344" rx="7" fill="none" stroke="url(#tb-gold)" stroke-width="1.2" opacity=".85"/>';
  s += frameOrnaments(f, P);
  s += '<g transform="translate(130 186)"><circle r="76" fill="rgba(0,0,0,.35)"/><circle r="70" fill="url(#tb-f-' + f + ')" stroke="url(#tb-gold)" stroke-width="3"/><circle r="60" fill="none" stroke="url(#tb-gold)" stroke-width="1" stroke-dasharray="2 4"/>';
  for (var i = 0; i < 12; i++) { var a = i * 30; s += '<g transform="rotate(' + a + ') translate(0 -70)"><path d="M0 0 l-3 -8 l3 -2 l3 2Z" fill="url(#tb-gold)"/></g>'; }
  s += '<g transform="scale(2.3)">' + emblem(f) + '</g></g>';
  if (!lite) s += '<text x="130" y="302" text-anchor="middle" font-family="' + DISPLAY + '" font-weight="700" font-size="14" letter-spacing="2.5" fill="' + P.glyph + '" opacity=".92">' + esc(P.short.toUpperCase()) + '</text>';
  return s;
}
function fitTitle(t, maxW, start, min) { var px = start; while (px > min && measure(t, 'bold ' + px + 'px ' + DISPLAY) > maxW) px -= .5; return px; }
function cardFaceInner(sp, lite) {
  var f = FAC[sp.faction] ? sp.faction : 'neutral', P = FAC[f], s = '';
  var type = TYPES[sp.type] ? sp.type : 'unit', tl = sp.typeLabel || TYPES[type];
  s += '<g clip-path="url(#tb-clip-card)"><rect width="260" height="372" fill="url(#tb-f-' + f + ')"/>';
  if (!lite) s += '<rect width="260" height="372" filter="url(#tb-grain)" opacity=".3"/>';
  s += '</g><rect x="3" y="3" width="254" height="366" rx="13.5" fill="none" stroke="url(#tb-gold)" stroke-width="2.6"/><rect x="11" y="11" width="238" height="350" rx="8" fill="none" stroke="url(#tb-gold)" stroke-width="1" opacity=".9"/>';
  s += frameOrnaments(f, P);
  /* parchment panel */
  s += '<rect x="14" y="14" width="232" height="336" rx="5" fill="' + P.paper + '"/>' + (lite ? '' : '<rect x="15" y="15" width="230" height="334" rx="5" filter="url(#tb-stain)" opacity=".5"/>');
  if (lite) {
    /* compact layout for thumbnails: huge number, art, icon + cost */
    s += '<text x="130" y="84" text-anchor="middle" font-family="' + DISPLAY + '" font-weight="700" font-size="92" fill="' + P.main + '" stroke="' + P.dark + '" stroke-width="2.5" paint-order="stroke">' + (sp.value == null ? '' : esc(sp.value)) + '</text>';
    s += '<g transform="translate(20 96)"><rect x="-2" y="-2" width="224" height="156" rx="7" fill="url(#tb-gold)"/>' + artSVG(sp.art, f, true) + '</g>';
    s += '<rect x="20" y="258" width="220" height="90" rx="6" fill="' + P.dark + '"/><g transform="translate(70 303) scale(3.6)">' + typeIcon(type, '#f1e3c3') + '</g>';
    if (sp.cost != null) s += '<g transform="translate(190 303)"><circle r="31" fill="url(#tb-gold)" stroke="#4a3208" stroke-width="2"/><text y="14" text-anchor="middle" font-family="' + DISPLAY + '" font-weight="700" font-size="40" fill="#2b1808">' + esc(sp.cost) + '</text></g>';
    return s;
  }
  /* title banner */
  var tp = fitTitle(sp.title || '', 196, 17.5, 12);
  s += '<rect x="22" y="20" width="216" height="30" rx="4" fill="url(#tb-f-' + f + ')" stroke="url(#tb-gold)" stroke-width="1.6"/><path d="M26 23 H234" stroke="#fff" stroke-opacity=".18"/>';
  s += '<text x="130" y="' + n2(40.2 + (17.5 - tp) * .2) + '" text-anchor="middle" font-family="' + DISPLAY + '" font-weight="700" font-size="' + tp + '" fill="' + P.glyph + '" stroke="rgba(0,0,0,.45)" stroke-width=".6" paint-order="stroke">' + esc(sp.title || '') + '</text>';
  /* art window */
  s += '<g transform="translate(20 56)"><rect x="-2.5" y="-2.5" width="225" height="157" rx="8" fill="url(#tb-gold)"/><rect x="-.5" y="-.5" width="221" height="153" rx="6.5" fill="#1a110c"/>' + artSVG(sp.art, f, false) + '<rect width="220" height="152" rx="6" fill="none" stroke="rgba(0,0,0,.55)" stroke-width="1.2"/></g>';
  /* value badge */
  if (sp.value != null) s += '<g transform="translate(38 74)" filter="url(#tb-shadow)"><circle r="24.5" fill="url(#tb-gold)" stroke="#4a3208" stroke-width="1.2"/><circle r="20" fill="url(#tb-f-' + f + ')" stroke="#2b1808" stroke-width="1"/><circle r="20" fill="url(#tb-seal)"/><text y="9.6" text-anchor="middle" font-family="' + DISPLAY + '" font-weight="700" font-size="' + (String(sp.value).length > 1 ? 24 : 28) + '" fill="' + P.glyph + '" stroke="rgba(0,0,0,.55)" stroke-width="1.1" paint-order="stroke">' + esc(sp.value) + '</text></g>';
  /* cost coin */
  if (sp.cost != null) s += '<g transform="translate(224 72)" filter="url(#tb-shadow)"><circle r="18" fill="url(#tb-gold)" stroke="#4a3208" stroke-width="1.2"/><circle r="14" fill="none" stroke="#5c3d0c" stroke-width=".9" stroke-dasharray="1.6 2.2"/><text y="7.6" text-anchor="middle" font-family="' + DISPLAY + '" font-weight="700" font-size="21" fill="#2b1808">' + esc(sp.cost) + '</text></g>';
  /* type strip */
  s += '<rect x="22" y="214" width="216" height="22" rx="4" fill="' + P.dark + '"/><rect x="22" y="214" width="216" height="22" rx="4" fill="none" stroke="url(#tb-gold)" stroke-width=".9"/><g transform="translate(37 225)">' + typeIcon(type, P.glyph) + '</g>';
  s += '<text x="54" y="229.4" font-family="' + DISPLAY + '" font-weight="700" font-size="11.6" letter-spacing="1.2" fill="' + P.glyph + '">' + esc(String(tl).toUpperCase()) + '</text>';
  if (sp.tag) s += '<text x="232" y="229.4" text-anchor="end" font-family="' + BODY + '" font-style="italic" font-size="13" fill="' + P.glyph + '" opacity=".9">' + esc(sp.tag) + '</text>';
  /* effect text */
  s += '<g transform="translate(22 240)"><rect width="216" height="100" rx="4" fill="rgba(255,250,235,.38)" stroke="' + P.accent2 + '" stroke-opacity=".7" stroke-width="1"/>';
  var txt = sp.text || '', px = 16, lines, lh, maxL;
  for (; px >= 13; px -= .5) { lh = px * 1.16; maxL = Math.floor((sp.flavor ? 72 : 90) / lh); lines = wrapText(txt, 198, px, false); if (lines.length <= maxL) break; }
  if (lines.length > maxL) { lines = lines.slice(0, maxL); lines[maxL - 1] = lines[maxL - 1].replace(/\s*\S*$/, '') + '…'; }
  var fl = sp.flavor ? wrapText(sp.flavor, 198, 12.5, false).slice(0, 2) : [], tot = lines.length * lh + (fl.length ? fl.length * 14.5 + 4 : 0), y0 = (100 - tot) / 2 + px * .86;
  lines.forEach(function (ln, i) { s += '<text x="108" y="' + n2(y0 + i * lh) + '" text-anchor="middle" font-family="' + BODY + '" font-size="' + px + '" fill="' + P.ink + '">' + esc(ln) + '</text>'; });
  fl.forEach(function (ln, i) { s += '<text x="108" y="' + n2(y0 + lines.length * lh + 6 + i * 14.5) + '" text-anchor="middle" font-family="' + BODY + '" font-style="italic" font-size="12.5" fill="' + mix(P.ink, P.paper, .35) + '">' + esc(ln) + '</text>'; });
  s += '</g>';
  /* footer */
  s += '<g transform="translate(130 362) scale(.4)" opacity=".95">' + emblem(f) + '</g>';
  s += '<text x="20" y="364" font-family="' + DISPLAY + '" font-weight="700" font-size="8.5" letter-spacing="1.4" fill="' + P.glyph + '" opacity=".8">' + esc(P.short.toUpperCase()) + '</text>';
  if (sp.num != null) s += '<text x="240" y="364" text-anchor="end" font-family="' + DISPLAY + '" font-weight="700" font-size="8.5" letter-spacing="1" fill="' + P.glyph + '" opacity=".8">' + esc(sp.num) + '</text>';
  return s;
}
var cardCache = {}, tplCache = {}, cacheN = 0;
function sizeToW(size) { if (size === 'small') return 60; if (size === 'medium') return 130; if (size === 'large' || size === 'enlarged') return 260; if (typeof size === 'object' && size) return size.w || size.width || 260; return +size || 260; }
function cardKey(sp, lite) { return [sp.faceDown ? 'B' : 'F', sp.faction, sp.title, sp.value, sp.cost, sp.type, sp.typeLabel, sp.art, sp.text, sp.flavor, sp.tag, sp.num, lite ? 1 : 0].join('\u0001'); }
function cardInner(sp, lite) {
  var k = cardKey(sp, lite);
  if (!cardCache[k]) { if (++cacheN > 600) { cardCache = {}; tplCache = {}; cacheN = 1; } cardCache[k] = sp.faceDown ? cardBackInner(FAC[sp.faction] ? sp.faction : 'neutral', lite) : cardFaceInner(sp, lite); }
  return { k: k, svg: cardCache[k] };
}
function cardLabel(sp) { return sp.faceDown ? 'Face-down ' + fac(sp.faction).short + ' card' : (sp.title || 'Card') + (sp.value != null ? ', strength ' + sp.value : '') + (sp.cost != null ? ', cost ' + sp.cost : '') + ', ' + fac(sp.faction).short + (sp.text ? '. ' + sp.text : ''); }
/* cardSVG(spec,size) -> markup string; card(spec,size) -> <svg> element (cached template, cloned) */
TB.cardSVG = function (spec, size) {
  TB.mount(); var w = sizeToW(size), h = Math.round(w * CH / CW), lite = w <= 110, c = cardInner(spec, lite);
  return '<svg xmlns="' + NS + '" class="tb-card" viewBox="0 0 ' + CW + ' ' + CH + '" width="' + w + '" height="' + h + '" role="img" aria-label="' + esc(cardLabel(spec)) + '"><title>' + esc(spec.faceDown ? 'Face-down card' : (spec.title || '')) + '</title>' + c.svg + '</svg>';
};
TB.card = function (spec, size) {
  TB.mount(); var w = sizeToW(size), h = Math.round(w * CH / CW), lite = w <= 110, c = cardInner(spec, lite), key = c.k;
  var tpl = tplCache[key];
  if (!tpl) { var d = document.createElement('div'); d.innerHTML = TB.cardSVG(spec, size); tpl = tplCache[key] = d.firstChild; }
  var el = tpl.cloneNode(true); el.setAttribute('width', w); el.setAttribute('height', h);
  el.style.width = w + 'px'; el.style.height = h + 'px'; return el;
};
TB.cardBack = function (faction, size) { return TB.card({ faceDown: true, faction: faction }, size); };
TB.clearCache = function () { cardCache = {}; tplCache = {}; cacheN = 0; };
TB.cacheStats = function () { return { cached: cacheN, templates: Object.keys(tplCache).length }; };
TB.cardTypes = TYPES;

// Ochre Horizon art kit: 1970s sci-fi poster look, all code art (SVG strings). Sunset orange + teal, halftone, grain, bold type.
(function (root) {
  var C = { sun: '#ff7a2f', sun2: '#ffb347', gold: '#f2c14e', deep: '#0e2f38', teal: '#1f8a8a', teal2: '#57c4b8', cream: '#f6e7c8', ink: '#1c120d', rust: '#c2452d', plum: '#5b2a4a', magenta: '#d6456b', ocean: '#1f6f9a', green: '#6aa84f', rival: '#46c3d6', you: '#ff7a2f' };
  var RES = {
    mc: { name: 'credits', short: 'Cr', col: '#f2c14e', fg: '#1c120d' },
    steel: { name: 'steel', short: 'St', col: '#b07a4f', fg: '#fff' },
    ti: { name: 'titanium', short: 'Ti', col: '#7d8fa3', fg: '#fff' },
    plant: { name: 'plants', short: 'Pl', col: '#6aa84f', fg: '#fff' },
    energy: { name: 'energy', short: 'En', col: '#9b6bd6', fg: '#fff' },
    heat: { name: 'heat', short: 'Ht', col: '#e8572f', fg: '#fff' },
    card: { name: 'card', short: 'Cd', col: '#f6e7c8', fg: '#1c120d' }
  };
  var TAGC = { building: '#b07a4f', space: '#2b2b52', science: '#f6e7c8', power: '#9b6bd6', earth: '#3f7fbf', jovian: '#d98c3a', plant: '#6aa84f', microbe: '#9cc04a', animal: '#4f8f5a', city: '#8a8f99', event: '#d6456b' };
  var TAGF = { science: '#1c120d' };
  function h(s) { var x = 2166136261; for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  function rng(seed) { var s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) | 0; var t = Math.imul(s ^ (s >>> 15), 1 | s); t ^= t + Math.imul(t ^ (t >>> 7), 61 | t); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  // simple glyphs drawn in a 24x24 box
  var GLYPH = {
    mc: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M15 8.5a4.5 4.5 0 1 0 0 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
    steel: '<path d="M4 16l8-9 8 9-8 3z" fill="currentColor"/>',
    ti: '<path d="M12 3l8 5v8l-8 5-8-5V8z" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="12" cy="12" r="3" fill="currentColor"/>',
    plant: '<path d="M12 21V10M12 12c-5 0-7-4-7-7 4 0 7 2 7 7zm0 3c4 0 7-3 7-7-4 0-7 3-7 7z" fill="currentColor" stroke="currentColor" stroke-width="1.6"/>',
    energy: '<path d="M13 2L5 14h6l-1 8 8-12h-6z" fill="currentColor"/>',
    heat: '<path d="M12 2c3 5 6 7 6 12a6 6 0 0 1-12 0c0-3 2-5 3-7 0 3 1 4 3 4 0-3-1-6 0-9z" fill="currentColor"/>',
    card: '<rect x="6" y="3" width="12" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M9 8h6M9 12h6" stroke="currentColor" stroke-width="2"/>',
    temp: '<path d="M10 4a2 2 0 0 1 4 0v9a4.5 4.5 0 1 1-4 0z" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="17" r="2.6" fill="currentColor"/><path d="M12 15V8" stroke="currentColor" stroke-width="2.2"/>',
    oxy: '<circle cx="9" cy="13" r="5" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="17" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="2"/>',
    ocean: '<path d="M12 3c4 6 6 9 6 12a6 6 0 0 1-12 0c0-3 2-6 6-12z" fill="currentColor"/>',
    tr: '<path d="M12 2l3 7h7l-5.6 4.3 2.1 7.2L12 16.3 5.5 20.5l2.1-7.2L2 9h7z" fill="currentColor"/>',
    vp: '<path d="M6 3h12v5a6 6 0 0 1-12 0z M9 17h6v4H9z M12 14v3" fill="currentColor" stroke="currentColor" stroke-width="1"/>',
    city: '<path d="M3 20h18M5 20v-6a7 7 0 0 1 14 0v6M9 20v-4h2v4M14 11h2v3h-2z" fill="none" stroke="currentColor" stroke-width="2"/>',
    greenery: '<path d="M12 3l7 12H5zM12 9l6 10H6z" fill="currentColor"/><path d="M12 19v3" stroke="currentColor" stroke-width="2"/>',
    special: '<path d="M12 2l2.5 7.5H22l-6 4.5 2.3 7.5L12 17l-6.3 4.5L8 14 2 9.5h7.5z" fill="currentColor"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c1 1 1.5 2 1.5 3h5c0-1 .5-2 1.5-3A6 6 0 0 0 12 3z" fill="none" stroke="currentColor" stroke-width="2.2"/>',
    plus: '<path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
    minus: '<path d="M5 12h14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
    fit: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2.6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>'
  };
  function icon(k, size, col) { return '<svg class="ic" viewBox="0 0 24 24" width="' + (size || 18) + '" height="' + (size || 18) + '" style="color:' + (col || 'currentColor') + '" aria-hidden="true">' + (GLYPH[k] || '') + '</svg>'; }
  function resPill(r, n, prod) {
    var R = RES[r] || RES.mc;
    return '<span class="rp" style="background:' + R.col + ';color:' + R.fg + '">' + icon(r, 14) + '<b>' + (n > 0 && prod ? '+' : '') + n + '</b> ' + R.name + (prod ? ' prod' : '') + '</span>';
  }
  // ---- halftone + grain defs (one <defs> block reused) ----
  var DEFS = '<defs>' +
    '<pattern id="ht" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.3" fill="#1c120d" opacity=".22"/></pattern>' +
    '<pattern id="ht2" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="2.5" cy="2.5" r="1" fill="#fff" opacity=".18"/></pattern>' +
    '<radialGradient id="planet" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#ffb06a"/><stop offset=".45" stop-color="#d9662f"/><stop offset=".8" stop-color="#8f3523"/><stop offset="1" stop-color="#4a1d1a"/></radialGradient>' +
    '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e2f38"/><stop offset=".55" stop-color="#3a2a48"/><stop offset=".85" stop-color="#b8462f"/><stop offset="1" stop-color="#ff8a3a"/></linearGradient>' +
    '<linearGradient id="sunG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#ff6a2a"/></linearGradient>' +
    '<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .18 0"/></filter>' +
    '</defs>';
  // ---- the poster backdrop behind the board: sky, striped sun, distant stars ----
  function backdrop(w, h) {
    var r = rng(7), stars = '';
    for (var i = 0; i < 40; i++) stars += '<circle cx="' + (r() * w).toFixed(0) + '" cy="' + (r() * h * 0.5).toFixed(0) + '" r="' + (r() * 1.4 + 0.3).toFixed(1) + '" fill="#f6e7c8" opacity="' + (r() * 0.6 + 0.2).toFixed(2) + '"/>';
    var sx = w * 0.5, sy = h * 0.62, sr = Math.min(w, h) * 0.55, stripes = '';
    for (var k = 0; k < 7; k++) { var y = sy + sr * 0.05 + k * sr * 0.13; stripes += '<rect x="' + (sx - sr) + '" y="' + y.toFixed(1) + '" width="' + 2 * sr + '" height="' + (3 + k * 2.2).toFixed(1) + '" fill="#3a2a48"/>'; }
    return '<rect width="' + w + '" height="' + h + '" fill="url(#sky)"/>' + stars +
      '<g clip-path="inset(0)"><circle cx="' + sx + '" cy="' + sy + '" r="' + sr + '" fill="url(#sunG)" opacity=".9"/>' + stripes + '</g>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#ht2)" opacity=".5"/>';
  }
  // ---- a small poster scene per card (seeded by id) ----
  function cardArt(c, w, hgt) {
    var r = rng(h(c.id + c.name)), tags = c.tags || [], main = tags[0] || (c.type === 'event' ? 'event' : 'building');
    var hue = { auto: ['#ff7a2f', '#f2c14e'], active: ['#1f8a8a', '#57c4b8'], event: ['#d6456b', '#ff9a6a'] }[c.type] || ['#ff7a2f', '#f2c14e'];
    var s = '<svg viewBox="0 0 ' + w + ' ' + hgt + '" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">';
    s += '<rect width="' + w + '" height="' + hgt + '" fill="' + hue[0] + '"/>';
    var cx = w * (0.3 + r() * 0.4), cy = hgt * (0.35 + r() * 0.2), rr = hgt * (0.28 + r() * 0.15);
    s += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="' + rr.toFixed(1) + '" fill="' + hue[1] + '"/>';
    for (var i = 0; i < 4; i++) s += '<rect x="0" y="' + (cy + rr * 0.15 + i * rr * 0.22).toFixed(1) + '" width="' + w + '" height="' + (1.5 + i * 1.3).toFixed(1) + '" fill="' + hue[0] + '"/>';
    // horizon / dunes
    var y0 = hgt * (0.68 + r() * 0.08);
    s += '<path d="M0 ' + y0.toFixed(1) + ' Q' + (w * 0.3).toFixed(1) + ' ' + (y0 - 10 - r() * 10).toFixed(1) + ' ' + (w * 0.55).toFixed(1) + ' ' + (y0 - 2).toFixed(1) + ' T' + w + ' ' + (y0 - 6).toFixed(1) + ' V' + hgt + ' H0z" fill="#5b2a4a"/>';
    s += '<path d="M0 ' + (y0 + 8).toFixed(1) + ' Q' + (w * 0.6).toFixed(1) + ' ' + (y0 - 2).toFixed(1) + ' ' + w + ' ' + (y0 + 10).toFixed(1) + ' V' + hgt + ' H0z" fill="#1c120d" opacity=".85"/>';
    // subject silhouette by tag
    var bx = w * (0.25 + r() * 0.5), by = y0 + 2, k = '#1c120d';
    if (main === 'city' || main === 'building') s += '<path d="M' + (bx - 22) + ' ' + by + 'a22 22 0 0 1 44 0z" fill="' + k + '"/><rect x="' + (bx + 14) + '" y="' + (by - 34) + '" width="5" height="34" fill="' + k + '"/>';
    else if (main === 'space' || main === 'jovian') s += '<path d="M' + bx + ' ' + (by - 46) + 'l7 16v22h-14v-22z" fill="' + k + '"/><path d="M' + (bx - 7) + ' ' + (by - 10) + 'l-6 10h6zM' + (bx + 7) + ' ' + (by - 10) + 'l6 10h-6z" fill="' + k + '"/>' + (main === 'jovian' ? '<ellipse cx="' + (w * 0.8) + '" cy="' + (hgt * 0.2) + '" rx="14" ry="4" fill="none" stroke="' + k + '" stroke-width="2"/><circle cx="' + (w * 0.8) + '" cy="' + (hgt * 0.2) + '" r="7" fill="' + k + '"/>' : '');
    else if (main === 'plant' || main === 'microbe') { for (var j = 0; j < 3; j++) { var x = bx - 20 + j * 18, hh = 16 + r() * 18; s += '<path d="M' + x + ' ' + by + 'l-9 0 9-' + hh.toFixed(0) + ' 9 ' + hh.toFixed(0) + 'z" fill="' + k + '"/>'; } }
    else if (main === 'animal') s += '<path d="M' + (bx - 18) + ' ' + (by - 10) + 'q18-16 36 0l-4 10h-4l-2-6h-16l-2 6h-4z" fill="' + k + '"/><circle cx="' + (bx + 20) + '" cy="' + (by - 16) + '" r="5" fill="' + k + '"/>';
    else if (main === 'power') s += '<path d="M' + (bx - 4) + ' ' + by + 'l2-40h4l2 40z M' + (bx - 16) + ' ' + (by - 34) + 'h32" stroke="' + k + '" stroke-width="3" fill="' + k + '"/>';
    else if (main === 'science') s += '<path d="M' + (bx - 16) + ' ' + by + 'a16 16 0 0 1 32 0z" fill="' + k + '"/><path d="M' + bx + ' ' + (by - 14) + 'l18-18" stroke="' + k + '" stroke-width="4"/>';
    else if (main === 'earth') s += '<circle cx="' + bx + '" cy="' + (hgt * 0.25) + '" r="10" fill="#3f7fbf" stroke="' + k + '" stroke-width="2"/>';
    else s += '<path d="M' + (w * 0.15) + ' ' + (hgt * 0.1) + 'L' + bx + ' ' + (by - 6) + '" stroke="#f6e7c8" stroke-width="3"/><circle cx="' + bx + '" cy="' + (by - 6) + '" r="7" fill="#f6e7c8"/>';
    s += '<rect width="' + w + '" height="' + hgt + '" fill="url(#ht)"/></svg>';
    return s;
  }
  function corpArt(c, w, hgt) { return cardArt({ id: c.id, name: c.name, tags: c.tags, type: 'active' }, w, hgt); }
  function tagPill(t) { return '<span class="tag" style="background:' + (TAGC[t] || '#555') + ';color:' + (TAGF[t] || '#fff') + '">' + t + '</span>'; }
  root.OHART = { C: C, RES: RES, TAGC: TAGC, GLYPH: GLYPH, icon: icon, resPill: resPill, DEFS: DEFS, backdrop: backdrop, cardArt: cardArt, corpArt: corpArt, tagPill: tagPill, hash: h, rng: rng };
})(typeof window !== 'undefined' ? window : globalThis);

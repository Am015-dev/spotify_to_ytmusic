// Meadowfold art: PAPER-CUT DIORAMA, all code art (SVG). Layered cut-paper shapes, soft drop shadows, pastel paper grain.
// Animal silhouettes come from game-icons.net (CC BY 3.0, credited in ASSETS.md); paths live in MF_ICONS (icons.js).
var ART = (function () {
  var C = {   // pastel paper per token colour: [base, light edge, dark edge]
    water: ['#9cc9e6', '#cde6f5', '#6c9fc4'], mount: ['#b9b6c4', '#e0dee8', '#8b879a'], trunk: ['#c49a74', '#e2c3a3', '#93684a'],
    leaf: ['#9fcf8f', '#cbe8bd', '#6f9f62'], field: ['#f2d675', '#fbecb0', '#c9a845'], build: ['#e8907e', '#f6c2b6', '#b8604f']
  };
  var NAME = { water: 'water', mount: 'mountain', trunk: 'trunk', leaf: 'leaves', field: 'field', build: 'building' };
  function defs(id) {
    id = id || 'p';
    return '<defs>' +
      '<filter id="' + id + 'grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="n"/>' +
      '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .09 0" result="a"/><feComposite in="a" in2="SourceGraphic" operator="in" result="g"/>' +
      '<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="g"/></feMerge></filter>' +
      '<filter id="' + id + 'sh" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="1.6" stdDeviation="1.4" flood-color="#5a4a3a" flood-opacity=".38"/></filter>' +
      '<filter id="' + id + 'sh2" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="3" stdDeviation="2.6" flood-color="#4a3a2a" flood-opacity=".35"/></filter>' +
      '</defs>';
  }
  function hexPts(cx, cy, r) { var s = ''; for (var i = 0; i < 6; i++) { var a = Math.PI / 180 * (60 * i); s += (cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1) + ' '; } return s; }
  // one cut-paper layer: base shape + light top edge, shadowed
  function disc(cx, cy, r, c, f) { var p = C[c]; return '<g filter="url(#' + f + 'sh)"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + p[0] + '" stroke="#fffaf0" stroke-width="' + (r * .13).toFixed(1) + '"/>' +
    '<path d="M' + (cx - r * .6) + ',' + (cy - r * .45) + ' A' + r * .75 + ',' + r * .75 + ' 0 0 1 ' + (cx + r * .55) + ',' + (cy - r * .5) + '" fill="none" stroke="' + p[1] + '" stroke-width="' + (r * .14).toFixed(1) + '" stroke-linecap="round"/></g>'; }
  // what a stack looks like from above-front: each layer a paper shape lifted a little higher
  function stack(st, cx, cy, r, f) {
    f = f || 'p'; if (!st || !st.length) return '';
    var top = st[st.length - 1], h = st.length, o = '', lift = r * .2, i;
    if (top === 'water') return '<g filter="url(#' + f + 'sh)"><circle cx="' + cx + '" cy="' + cy + '" r="' + r * .8 + '" fill="' + C.water[0] + '" stroke="#fffaf0" stroke-width="' + r * .1 + '"/>' +
      '<path d="M' + (cx - r * .5) + ',' + (cy - r * .1) + ' q' + r * .25 + ',-' + r * .2 + ' ' + r * .5 + ',0 t' + r * .5 + ',0 M' + (cx - r * .45) + ',' + (cy + r * .25) + ' q' + r * .22 + ',-' + r * .18 + ' ' + r * .45 + ',0 t' + r * .45 + ',0" fill="none" stroke="' + C.water[1] + '" stroke-width="' + r * .1 + '" stroke-linecap="round"/></g>';
    if (top === 'field') return '<g filter="url(#' + f + 'sh)"><circle cx="' + cx + '" cy="' + cy + '" r="' + r * .8 + '" fill="' + C.field[0] + '" stroke="#fffaf0" stroke-width="' + r * .1 + '"/>' +
      [-.4, 0, .4].map(function (d) { return '<path d="M' + (cx + d * r) + ',' + (cy + r * .45) + ' l0,-' + r * .7 + '" stroke="' + C.field[2] + '" stroke-width="' + r * .08 + '"/><ellipse cx="' + (cx + d * r) + '" cy="' + (cy - r * .3) + '" rx="' + r * .09 + '" ry="' + r * .2 + '" fill="' + C.field[1] + '"/>'; }).join('') + '</g>';
    // base discs for every layer under the top (the stack's paper "floors")
    for (i = 0; i < h - 1; i++) o += disc(cx, cy + r * .1 - i * lift, r * (.8 - i * .06), st[i], f);
    var ty = cy + r * .1 - (h - 1) * lift;
    if (top === 'mount') {
      var s = r * (.62 + h * .1);
      o += '<g filter="url(#' + f + 'sh)"><path d="M' + (cx - s) + ',' + (ty + s * .55) + ' L' + cx + ',' + (ty - s * .85) + ' L' + (cx + s) + ',' + (ty + s * .55) + 'Z" fill="' + C.mount[0] + '" stroke="#fffaf0" stroke-width="' + r * .1 + '" stroke-linejoin="round"/>' +
        '<path d="M' + (cx - s * .3) + ',' + (ty - s * .35) + ' L' + cx + ',' + (ty - s * .85) + ' L' + (cx + s * .3) + ',' + (ty - s * .35) + ' l-' + s * .15 + ',' + s * .12 + ' l-' + s * .15 + ',-' + s * .1 + ' l-' + s * .15 + ',' + s * .1 + 'Z" fill="#fffaf0"/>' +
        '<path d="M' + cx + ',' + (ty - s * .85) + ' L' + (cx + s) + ',' + (ty + s * .55) + ' L' + (cx + s * .25) + ',' + (ty + s * .55) + 'Z" fill="' + C.mount[2] + '" opacity=".35"/></g>';
      if (h > 1) o += '<text x="' + (cx + r * .62) + '" y="' + (cy + r * .72) + '" class="hnum">' + h + '</text>';
      return o;
    }
    if (top === 'trunk') { o += '<g filter="url(#' + f + 'sh)"><rect x="' + (cx - r * .16) + '" y="' + (ty - r * .45) + '" width="' + r * .32 + '" height="' + r * .8 + '" rx="' + r * .08 + '" fill="' + C.trunk[0] + '" stroke="#fffaf0" stroke-width="' + r * .08 + '"/></g>'; return o; }
    if (top === 'leaf') {
      var tr = r * (.5 + h * .1), tc = ty - (h - 1) * r * .12;
      if (h > 1) o += '<rect x="' + (cx - r * .13) + '" y="' + (tc) + '" width="' + r * .26 + '" height="' + (cy - tc + r * .1) + '" fill="' + C.trunk[0] + '" stroke="#fffaf0" stroke-width="' + r * .06 + '"/>';
      o += '<g filter="url(#' + f + 'sh)"><circle cx="' + cx + '" cy="' + (tc - r * .05) + '" r="' + tr + '" fill="' + C.leaf[0] + '" stroke="#fffaf0" stroke-width="' + r * .1 + '"/>' +
        '<circle cx="' + (cx - tr * .35) + '" cy="' + (tc - tr * .3) + '" r="' + tr * .42 + '" fill="' + C.leaf[1] + '" opacity=".8"/></g>';
      if (h > 1) o += '<text x="' + (cx + r * .62) + '" y="' + (cy + r * .72) + '" class="hnum">' + h + '</text>';
      return o;
    }
    if (top === 'build') {
      var b = r * .5;
      o += '<g filter="url(#' + f + 'sh)"><path d="M' + (cx - b) + ',' + (ty + b * .7) + ' L' + (cx - b) + ',' + (ty - b * .2) + ' L' + cx + ',' + (ty - b * 1.05) + ' L' + (cx + b) + ',' + (ty - b * .2) + ' L' + (cx + b) + ',' + (ty + b * .7) + 'Z" fill="' + C.build[0] + '" stroke="#fffaf0" stroke-width="' + r * .1 + '" stroke-linejoin="round"/>' +
        '<rect x="' + (cx - b * .22) + '" y="' + (ty + b * .1) + '" width="' + b * .44 + '" height="' + b * .6 + '" fill="' + C.build[2] + '"/></g>';
      return o;
    }
    return o;
  }
  // a single loose token (market, hand): flat paper disc with its colour mark
  function token(c, cx, cy, r, f) { f = f || 'p'; var p = C[c];
    return '<g filter="url(#' + f + 'sh)"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + p[0] + '" stroke="#fffaf0" stroke-width="' + (r * .16).toFixed(1) + '"/>' + mark(c, cx, cy, r) + '</g>'; }
  // a small glyph on the token so colours never rely on hue alone (colour-blind safe)
  function mark(c, cx, cy, r) { var p = C[c], k = r * .5;
    if (c === 'water') return '<path d="M' + (cx - k) + ',' + cy + ' q' + k / 2 + ',-' + k / 2 + ' ' + k + ',0 t' + k + ',0" fill="none" stroke="' + p[1] + '" stroke-width="' + r * .16 + '" stroke-linecap="round"/>';
    if (c === 'mount') return '<path d="M' + (cx - k) + ',' + (cy + k * .5) + ' L' + cx + ',' + (cy - k * .7) + ' L' + (cx + k) + ',' + (cy + k * .5) + 'Z" fill="' + p[1] + '"/>';
    if (c === 'trunk') return '<rect x="' + (cx - k * .25) + '" y="' + (cy - k * .7) + '" width="' + k * .5 + '" height="' + k * 1.4 + '" rx="' + k * .15 + '" fill="' + p[1] + '"/>';
    if (c === 'leaf') return '<path d="M' + cx + ',' + (cy - k * .8) + ' q' + k * .9 + ',' + k * .6 + ' 0,' + k * 1.6 + ' q-' + k * .9 + ',-' + k * .6 + ' 0,-' + k * 1.6 + 'Z" fill="' + p[1] + '"/>';
    if (c === 'field') return '<path d="M' + (cx - k * .5) + ',' + (cy + k * .7) + ' l0,-' + k * 1.3 + ' M' + cx + ',' + (cy + k * .7) + ' l0,-' + k * 1.4 + ' M' + (cx + k * .5) + ',' + (cy + k * .7) + ' l0,-' + k * 1.3 + '" stroke="' + p[2] + '" stroke-width="' + r * .14 + '" stroke-linecap="round"/>';
    if (c === 'build') return '<path d="M' + (cx - k * .7) + ',' + (cy + k * .6) + ' l0,-' + k * .7 + ' l' + k * .7 + ',-' + k * .6 + ' l' + k * .7 + ',' + k * .6 + ' l0,' + k * .7 + 'Z" fill="' + p[1] + '"/>';
    return '';
  }
  // animal: game-icons silhouette, cut from pastel paper with a white paper rim and a lifted shadow
  function animal(kind, cx, cy, s, fill, f) {
    f = f || 'p'; var d = (window.MF_ICONS || {})[kind]; if (!d) return '<circle cx="' + cx + '" cy="' + cy + '" r="' + s / 2 + '" fill="' + (fill || '#f6efe0') + '"/>';
    var k = s / 512;
    return '<g filter="url(#' + f + 'sh)" transform="translate(' + (cx - s / 2) + ',' + (cy - s / 2) + ') scale(' + k + ')"><path d="' + d + '" fill="' + (fill || '#fbf3e4') + '" stroke="#fffdf7" stroke-width="' + (34) + '" stroke-linejoin="round" paint-order="stroke"/></g>';
  }
  // animal cube placed on a hex: a small paper tag with the animal
  function cube(kind, cx, cy, r, col, f) { f = f || 'p';
    return '<g filter="url(#' + f + 'sh2)"><rect x="' + (cx - r * .5) + '" y="' + (cy - r * .55) + '" width="' + r + '" height="' + r + '" rx="' + r * .2 + '" fill="' + (col || '#fdf8ee') + '" stroke="#fff" stroke-width="' + r * .08 + '"/></g>' + animal(kind, cx, cy - r * .05, r * .82, '#6b4e3a', f); }
  return { C: C, NAME: NAME, defs: defs, hexPts: hexPts, stack: stack, token: token, animal: animal, cube: cube, mark: mark };
})();

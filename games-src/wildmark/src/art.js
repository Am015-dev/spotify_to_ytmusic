/* Art slots: every picture Wildmark shows is a NAMED slot in assets.json. media/<stem>.webp fills it when the file exists (build.py lists the
   files present in WM_HAVE, so the page never requests a missing file); otherwise the code-drawn placeholder shows. Never stretched:
   bg/board slots cover (cropped), everything else is contained at its own aspect. */
var ART = { items: {}, img: {}, have: window.WM_HAVE || [] };
(window.WM_ASSETS && WM_ASSETS.items || []).forEach(function (it) { ART.items[it.stem] = it; });
function artHas(stem) { return !!ART.img[stem]; }
function artUrl(stem) { return 'media/' + stem + '.webp'; }
function artFit(stem) { var it = ART.items[stem]; return it && (it.kind === 'bg' || it.kind === 'board') ? 'cover' : 'contain'; }
// SVG: an <image> filling (x,y,w,h) at the slot's aspect (cover = slice, contain = meet) or '' when the file is absent
function artSvg(stem, x, y, w, h, clip) {
  if (!ART.img[stem]) return '';
  return '<image href="' + artUrl(stem) + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" preserveAspectRatio="xMidYMid ' + (artFit(stem) === 'cover' ? 'slice' : 'meet') + '"' + (clip ? ' clip-path="url(#' + clip + ')"' : '') + '/>';
}
function artApply(root) {   // DOM: [data-art] elements get the picture as their background once it loaded
  (root || document).querySelectorAll('[data-art]').forEach(function (e) {
    var s = e.getAttribute('data-art'); if (!ART.img[s]) return;
    e.style.backgroundImage = 'url(' + artUrl(s) + ')'; e.style.backgroundSize = artFit(s); e.style.backgroundRepeat = 'no-repeat'; e.style.backgroundPosition = 'center'; e.classList.add('hasart');
  });
}
/* READABLE rule: a temp picture that is less clear than the code-drawn shape stays OFF. Slots whose stem starts with one of these prefixes
   show the code-drawn terrain/animal; real art for them is switched on by listing its stem (or prefix) in window.WM_REAL_ART. */
ART.codeFirst = ['tok-', 'ter-', 'table-bg', 'icon-logo'];   // free-art kit (W376): cards, portraits and title art read well; tokens (muddy at 20-30px), terrain, table and logo stay code-drawn
function artCodeFirst(s) { var real = window.WM_REAL_ART || []; return real.indexOf(s) < 0 && ART.codeFirst.some(function (p) { return s.indexOf(p) === 0 && real.indexOf(p) < 0; }); }
function artLoad() {
  ART.have = ART.have.filter(function (s) { return !artCodeFirst(s); });
  ART.have.forEach(function (s) { var im = new Image(); im.onload = function () { ART.img[s] = im; artApply(); if (window.UI && UI.redraw) UI.redraw(); }; im.src = artUrl(s); });
}
// ---- placeholders (code-drawn, in the palette). Animal icons are simple silhouettes; no letters inside pictures.
var ICON = {
  bear: '<circle cx="0" cy="1.5" r="5.2"/><circle cx="-4.2" cy="-3.6" r="2.2"/><circle cx="4.2" cy="-3.6" r="2.2"/><ellipse cx="0" cy="3.4" rx="2.2" ry="1.6" fill="rgba(255,255,255,.35)"/>',
  elk: '<ellipse cx="0" cy="2.6" rx="3" ry="4.2"/><path d="M-1.8-1.2 L-5.8-6.6 M-4.4-4.6 L-7.2-3.8 M-4.2-4.8 L-4.2-8 M1.8-1.2 L5.8-6.6 M4.4-4.6 L7.2-3.8 M4.2-4.8 L4.2-8" stroke-width="1.5" stroke-linecap="round" fill="none"/>',
  salmon: '<ellipse cx="-1" cy="0" rx="5.4" ry="2.9"/><path d="M3.6 0 L7.4-3.4 L7.4 3.4Z"/><circle cx="-3.8" cy="-0.6" r=".8" fill="rgba(255,255,255,.7)"/>',
  hawk: '<path d="M0-1.2 C-2.4-4 -5.4-4.6 -8-3 C-5.6-1.6 -3.2 0 -1.2 2.6 L0 5.4 L1.2 2.6 C3.2 0 5.6-1.6 8-3 C5.4-4.6 2.4-4 0-1.2Z"/>',
  fox: '<path d="M-6-6 L-2.4-2.6 L2.4-2.6 L6-6 L5.2 0 L0 5.6 L-5.2 0Z"/><path d="M-2.4 1.6 L0 5.6 L2.4 1.6Z" fill="rgba(255,255,255,.55)"/>',
  acorn: '<path d="M-4.6-1.4 C-4.6 3 -2 5.8 0 6.4 C2 5.8 4.6 3 4.6-1.4Z"/><path d="M-5.6-1.2 C-5.6-4.6 5.6-4.6 5.6-1.2Z" fill="#6b4a2a"/><path d="M0-4.2 L0.8-6.4" stroke="#6b4a2a" stroke-width="1.4"/>'
};
// a token disc (r = radius) at (x,y); art file when present, else the icon on a coloured disc
function tokenSvg(a, x, y, r, extra) {
  var col = a === 'acorn' ? '#b5803f' : WM.ANI_COL[a], st = 'tok-' + a;
  var s = '<g class="tk' + (extra || '') + '" transform="translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ')">';
  s += '<circle r="' + r + '" fill="#f6efdc" stroke="' + col + '" stroke-width="' + (r * 0.16).toFixed(2) + '"/>';
  if (ART.img[st]) s += '<clipPath id="tc' + a + '"><circle r="' + (r * 0.92) + '"/></clipPath>' + artSvg(st, -r, -r, 2 * r, 2 * r, 'tc' + a);
  else s += '<g transform="scale(' + (r / 9).toFixed(3) + ')" fill="' + col + '" stroke="' + col + '">' + ICON[a] + '</g>';
  return s + '</g>';
}
// terrain textures, one 24x24 cell each: simple pictures a first-time player names at a glance (peaks, pines, wheat rows, reeds, waves)
var TER_PAT = {
  peak: '<path d="M0 20 L7 7 L14 20Z" fill="#6f7180"/><path d="M7 7 L4.6 11.4 L7 10.4 L9.4 11.4Z" fill="#f4f4f8"/><path d="M11 20 L17.5 9.5 L24 20Z" fill="#7c7e8c"/><path d="M17.5 9.5 L15.4 13 L17.5 12.2 L19.6 13Z" fill="#f4f4f8"/>',
  forest: '<path d="M6 3 L10.5 11 L8.4 11 L11.5 17 L0.5 17 L3.6 11 L1.5 11Z" fill="#245a32"/><rect x="5.2" y="17" width="1.6" height="3" fill="#4a3220"/><path d="M18 9 L22 16 L20.2 16 L23 21.5 L13 21.5 L15.8 16 L14 16Z" fill="#245a32"/><rect x="17.2" y="21.5" width="1.6" height="2.5" fill="#4a3220"/>',
  meadow: '<path d="M0 6 H24 M0 14 H24 M0 22 H24" stroke="#a8923a" stroke-width="2"/><path d="M5 4 v-3 M12 4 v-3 M19 4 v-3 M8.5 12 v-3 M15.5 12 v-3 M5 20 v-3 M12 20 v-3 M19 20 v-3" stroke="#8a7426" stroke-width="1.4" stroke-linecap="round"/>',
  marsh: '<path d="M2 21 h9 M13 12 h9" stroke="#bfe3d8" stroke-width="1.4" opacity=".8"/><path d="M5 20 v-9 M8 20 v-7 M16 11 v-8 M19 11 v-6" stroke="#2c5a46" stroke-width="1.4"/><rect x="4" y="9" width="2" height="4" rx="1" fill="#6b4a2a"/><rect x="15" y="1.5" width="2" height="4" rx="1" fill="#6b4a2a"/>',
  river: '<path d="M0 7 q3-3 6 0 t6 0 t6 0 t6 0 M0 17 q3-3 6 0 t6 0 t6 0 t6 0" stroke="#d6ecfb" stroke-width="1.8" fill="none" stroke-linecap="round"/>'
};
// terrain fills: an SVG <defs> block with one pattern per terrain (art file or a code-drawn texture)
function terrainDefs() {
  var d = '<defs>';
  WM.TER.forEach(function (t) {
    var c = WM.TER_COL[t], st = 'ter-' + t;
    d += '<pattern id="pt-' + t + '" patternUnits="userSpaceOnUse" width="' + (ART.img[st] ? 120 : 24) + '" height="' + (ART.img[st] ? 120 : 24) + '">';
    if (ART.img[st]) d += artSvg(st, 0, 0, 120, 120);
    else {
      d += '<rect width="24" height="24" fill="' + c + '"/>' + (TER_PAT[t] || '');
    }
    d += '</pattern>';
  });
  return d + '</defs>';
}

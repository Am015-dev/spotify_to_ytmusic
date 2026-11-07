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
function artLoad() {
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
// terrain fills: an SVG <defs> block with one pattern per terrain (art file or a code-drawn texture)
function terrainDefs() {
  var d = '<defs>';
  WM.TER.forEach(function (t) {
    var c = WM.TER_COL[t], st = 'ter-' + t;
    d += '<pattern id="pt-' + t + '" patternUnits="userSpaceOnUse" width="' + (ART.img[st] ? 120 : 24) + '" height="' + (ART.img[st] ? 120 : 24) + '">';
    if (ART.img[st]) d += artSvg(st, 0, 0, 120, 120);
    else {
      d += '<rect width="24" height="24" fill="' + c + '"/>';
      d += t === 'peak' ? '<path d="M2 20 L8 9 L14 20Z M12 20 L17 12 L22 20Z" fill="rgba(255,255,255,.18)"/>' : t === 'forest' ? '<path d="M6 18 L9 8 L12 18Z M15 22 L18 12 L21 22Z" fill="rgba(0,0,0,.18)"/>' :
        t === 'meadow' ? '<path d="M4 18 l2-5 M8 19 l1-6 M16 10 l2-5 M19 11 l1-6" stroke="rgba(90,70,10,.35)" stroke-width="1.2"/>' : t === 'marsh' ? '<path d="M3 15 h7 M13 8 h8 M6 21 h6" stroke="rgba(255,255,255,.28)" stroke-width="1.4"/><path d="M17 20 v-6 M19 20 v-5" stroke="rgba(20,60,40,.4)" stroke-width="1.2"/>' :
        '<path d="M0 8 q6-4 12 0 t12 0 M0 18 q6-4 12 0 t12 0" stroke="rgba(255,255,255,.3)" stroke-width="1.5" fill="none"/>';
    }
    d += '</pattern>';
  });
  return d + '</defs>';
}

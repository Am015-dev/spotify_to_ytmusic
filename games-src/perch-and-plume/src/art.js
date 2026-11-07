/* Art slots: every picture is a NAMED slot (assets.json -> window.PP_ASSETS). A file games/perch-and-plume/media/<stem>.webp fills it
   (the build lists the files present in PP_HAVE, so the page never asks for a missing one); otherwise a tidy code-drawn SVG placeholder
   in the game's palette shows at the slot's aspect. artHTML(stem, cls) is the one entry point: <img> (object-fit from the slot kind, never stretched) or the placeholder. */
var ART = { items: {}, have: {} };
(window.PP_ASSETS && PP_ASSETS.items || []).forEach(function (it) { ART.items[it.stem] = it; });
(window.PP_HAVE || []).forEach(function (s) { ART.have[s] = 1; });
var PAL = { F: '#4f7a45', G: '#c9a443', W: '#3f8193', ink: '#2a2116', paper: '#f6eedb', moss: '#23412f' };
var FOODC = { grub: '#c9786a', seed: '#d4a63a', fish: '#4f8fb8', berry: '#c23b4a', rodent: '#8a8178' };
function artFit(stem) { var it = ART.items[stem]; return it && (it.kind === 'bg' || it.kind === 'board' || it.kind === 'card' || it.kind === 'portrait') ? 'cover' : 'contain'; }
function hashHue(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h % 360; }
function artHTML(stem, cls, ph) {
  if (ART.have[stem]) return '<img class="art ' + (cls || '') + '" alt="" draggable="false" src="media/' + stem + '.webp" style="object-fit:' + artFit(stem) + '">';
  return '<span class="art ph ' + (cls || '') + '" data-slot="' + stem + '">' + (ph != null ? ph : placeholder(stem)) + '</span>';
}
function birdSVG(body, wing, belly) {   // a simple perched bird, facing left
  return '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M30 78 L22 92 M40 78 L44 92" stroke="#3b2a1a" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M70 58 L96 70 L92 76 L66 66Z" fill="' + wing + '"/>' +
    '<ellipse cx="46" cy="58" rx="28" ry="21" fill="' + body + '"/><ellipse cx="40" cy="64" rx="17" ry="12" fill="' + belly + '"/>' +
    '<path d="M44 50 Q64 44 76 62 Q58 66 44 60Z" fill="' + wing + '"/>' +
    '<circle cx="26" cy="38" r="15" fill="' + body + '"/><path d="M12 36 L1 41 L12 43Z" fill="#e3a43a"/><circle cx="22" cy="35" r="3" fill="#1d1510"/><circle cx="21" cy="34" r="1" fill="#fff"/></svg>';
}
function placeholder(stem) {
  var p = stem.split('-'), kind = p[0];
  if (kind === 'bird') {
    var b = PP.B[stem.slice(5)], hue = hashHue(stem), hb = b ? PAL[b.h[0]] : PAL.F;
    return '<svg class="phbg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="100" height="100" fill="' + hb + '"/><circle cx="78" cy="22" r="30" fill="rgba(255,255,255,.14)"/><path d="M0 86 Q50 70 100 84 L100 100 L0 100Z" fill="rgba(0,0,0,.18)"/></svg>' +
      birdSVG('hsl(' + hue + ',45%,48%)', 'hsl(' + ((hue + 30) % 360) + ',40%,32%)', 'hsl(' + ((hue + 180) % 360) + ',55%,82%)');
  }
  if (kind === 'food') return foodSVG(p[1]);
  if (kind === 'token' && p[1] === 'egg') return eggSVG();
  if (kind === 'portrait') { var hu = hashHue(stem); return '<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" fill="hsl(' + hu + ',30%,40%)"/><circle cx="50" cy="40" r="20" fill="hsl(' + hu + ',35%,80%)"/><path d="M14 100 Q50 52 86 100Z" fill="hsl(' + hu + ',35%,80%)"/></svg>'; }
  if (kind === 'nest') return nestSVG(p[1]);
  return '<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="12" fill="' + PAL.moss + '"/></svg>';
}
function foodSVG(f) {
  var c = FOODC[f] || '#888', s = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#f6eedb" stroke="' + c + '" stroke-width="3"/>';
  if (f === 'grub') s += '<path d="M12 24 Q12 12 22 12 Q30 12 29 20 Q28 27 20 27" fill="none" stroke="' + c + '" stroke-width="6" stroke-linecap="round"/>';
  if (f === 'seed') s += '<ellipse cx="15" cy="20" rx="4" ry="7" fill="' + c + '"/><ellipse cx="25" cy="20" rx="4" ry="7" fill="' + c + '"/><ellipse cx="20" cy="13" rx="4" ry="6" fill="' + c + '"/>';
  if (f === 'fish') s += '<path d="M8 20 Q18 10 28 20 Q18 30 8 20Z M28 20 L35 14 L35 26Z" fill="' + c + '"/>';
  if (f === 'berry') s += '<circle cx="15" cy="23" r="6" fill="' + c + '"/><circle cx="25" cy="23" r="6" fill="' + c + '"/><circle cx="20" cy="15" r="6" fill="' + c + '"/>';
  if (f === 'rodent') s += '<ellipse cx="21" cy="23" rx="10" ry="7" fill="' + c + '"/><circle cx="12" cy="18" r="5" fill="' + c + '"/><path d="M31 25 Q37 30 33 34" stroke="' + c + '" stroke-width="2" fill="none"/>';
  if (f === 'gs') s += '<path d="M9 22 Q9 13 17 13 Q22 13 21 19" fill="none" stroke="' + FOODC.grub + '" stroke-width="5" stroke-linecap="round"/><ellipse cx="26" cy="24" rx="4" ry="7" fill="' + FOODC.seed + '"/>';
  if (f === 'any') s += '<path d="M20 9 L23 17 L31 17 L25 22 L27 30 L20 25 L13 30 L15 22 L9 17 L17 17Z" fill="#7a6a50"/>';
  return s + '</svg>';
}
function eggSVG() { return '<svg viewBox="0 0 20 24" aria-hidden="true"><ellipse cx="10" cy="13" rx="8" ry="10" fill="#cfe6ef" stroke="#6d8c98" stroke-width="1.5"/><circle cx="7" cy="10" r="1.2" fill="#6d8c98"/><circle cx="12" cy="15" r="1" fill="#6d8c98"/></svg>'; }
function nestSVG(n) {
  var s = '<svg viewBox="0 0 40 40" aria-hidden="true">';
  if (n === 'bowl') s += '<path d="M6 18 Q20 40 34 18Z" fill="#a8743f" stroke="#5a3a1c" stroke-width="2"/>';
  else if (n === 'cavity') s += '<rect x="8" y="4" width="24" height="34" rx="6" fill="#8a6a44"/><circle cx="20" cy="18" r="7" fill="#2a1a0c"/>';
  else if (n === 'ground') s += '<path d="M3 28 Q20 16 37 28Z" fill="#c9a86a"/><circle cx="14" cy="28" r="3" fill="#8a7a66"/><circle cx="26" cy="29" r="3" fill="#8a7a66"/>';
  else if (n === 'platform') s += '<path d="M4 24 L36 24 M6 28 L34 20 M6 20 L34 28" stroke="#7a5a32" stroke-width="3"/>';
  else s += '<path d="M20 4 L25 15 L37 15 L27 23 L31 35 L20 28 L9 35 L13 23 L3 15 L15 15Z" fill="#d9a63a" stroke="#7a5a1c" stroke-width="1.5"/>';
  return s + '</svg>';
}
function foodIcon(f, cls) { return ART.have['food-' + f] ? artHTML('food-' + f, 'fi ' + (cls || '')) : '<span class="fi ' + (cls || '') + '" data-food="' + f + '">' + foodSVG(f) + '</span>'; }
function eggIcon(cls) { return ART.have['token-egg'] ? artHTML('token-egg', 'egi ' + (cls || '')) : '<span class="egi ' + (cls || '') + '">' + eggSVG() + '</span>'; }
function nestIcon(n) { return ART.have['nest-' + n] ? artHTML('nest-' + n, 'nsi') : '<span class="nsi" title="' + n + ' nest">' + nestSVG(n) + '</span>'; }

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
var FAMKIND = { Woodpecker: 'trunk', Nuthatch: 'trunk', Treecreeper: 'trunk', Owl: 'owl', Kestrel: 'raptor', Harrier: 'raptor', Hawk: 'raptor', Shrike: 'raptor',
  Heron: 'wader', Egret: 'wader', Crane: 'wader', Bittern: 'wader', Plover: 'wader', Sandpiper: 'wader', Kingfisher: 'wader',
  Grebe: 'swim', Teal: 'swim', Coot: 'swim', Rail: 'swim', Tern: 'swim', Quail: 'plump', Dove: 'plump', Crow: 'big', Jay: 'big', Thrush: 'big', Oriole: 'big', Meadowlark: 'big' };
function famOf(id) { var b = PP.B[id]; return b ? b.n.split(' ').pop() : ''; }
// one simple drawn bird per family group (silhouette + wing + belly + beak + eye), coloured from the card's own hue; facing left, perched on a twig or standing in water
function birdSVG(body, wing, belly, kind) {
  var E = '<circle cx="@x" cy="@y" r="3" fill="#1d1510"/><circle cx="@x" cy="@y" r="1" fill="#fff" transform="translate(-1,-1)"/>', eye = function (x, y) { return E.replace(/@x/g, x).replace(/@y/g, y); };
  var tw = '<path d="M8 90 H92" stroke="#5a3d22" stroke-width="4" stroke-linecap="round"/>', o = '', k = kind || 'perch';
  if (k === 'trunk') o = '<rect x="58" y="0" width="30" height="100" rx="4" fill="#6b4a2c"/><path d="M62 10 V92 M72 4 V96 M82 12 V90" stroke="#4a321c" stroke-width="2"/>' +
    '<path d="M56 62 L40 90 L52 90 L62 70Z" fill="' + wing + '"/><ellipse cx="46" cy="52" rx="13" ry="28" fill="' + body + '" transform="rotate(14 46 52)"/><ellipse cx="42" cy="56" rx="7" ry="18" fill="' + belly + '" transform="rotate(14 42 56)"/>' +
    '<circle cx="36" cy="22" r="12" fill="' + body + '"/><path d="M26 20 L8 22 L26 27Z" fill="#3b2a1a"/><path d="M34 11 Q40 4 46 10" fill="' + wing + '"/>' + eye(33, 20);
  else if (k === 'owl') o = tw + '<ellipse cx="50" cy="56" rx="26" ry="32" fill="' + body + '"/><ellipse cx="50" cy="66" rx="16" ry="20" fill="' + belly + '"/><path d="M26 56 Q22 76 34 84 Q30 66 34 52Z M74 56 Q78 76 66 84 Q70 66 66 52Z" fill="' + wing + '"/>' +
    '<path d="M28 30 L30 12 L42 22Z M72 30 L70 12 L58 22Z" fill="' + body + '"/><circle cx="50" cy="34" r="20" fill="' + body + '"/><circle cx="41" cy="34" r="8" fill="#f6eedb"/><circle cx="59" cy="34" r="8" fill="#f6eedb"/><circle cx="41" cy="34" r="4" fill="#1d1510"/><circle cx="59" cy="34" r="4" fill="#1d1510"/><path d="M46 40 L50 48 L54 40Z" fill="#e3a43a"/>';
  else if (k === 'raptor') o = tw + '<path d="M70 52 L98 64 L92 72 L64 62Z" fill="' + wing + '"/><ellipse cx="46" cy="56" rx="26" ry="19" fill="' + body + '"/><ellipse cx="42" cy="62" rx="16" ry="10" fill="' + belly + '"/>' +
    '<path d="M40 44 Q66 28 84 52 Q62 58 40 54Z" fill="' + wing + '"/><circle cx="24" cy="38" r="13" fill="' + body + '"/><path d="M14 34 Q4 36 8 46 L16 42Z" fill="#e3a43a"/><path d="M12 33 L24 29" stroke="#1d1510" stroke-width="3"/>' + eye(22, 36) + '<path d="M34 76 L30 90 M46 76 L50 90" stroke="#e3a43a" stroke-width="3" stroke-linecap="round"/>';
  else if (k === 'wader') o = '<path d="M0 88 Q25 80 50 88 T100 88 V100 H0Z" fill="rgba(60,110,140,.55)"/><path d="M42 62 L40 92 M52 62 L56 92" stroke="#3b2a1a" stroke-width="2.5" stroke-linecap="round"/>' +
    '<path d="M62 54 L92 48 L64 64Z" fill="' + wing + '"/><ellipse cx="50" cy="56" rx="24" ry="13" fill="' + body + '"/><ellipse cx="48" cy="60" rx="14" ry="7" fill="' + belly + '"/>' +
    '<path d="M32 52 Q22 36 28 16" stroke="' + body + '" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="28" cy="14" r="8" fill="' + body + '"/><path d="M22 12 L2 18 L22 18Z" fill="#e3a43a"/>' + eye(27, 12);
  else if (k === 'swim') o = '<ellipse cx="48" cy="62" rx="32" ry="16" fill="' + body + '"/><path d="M66 56 L94 50 L80 66Z" fill="' + wing + '"/><ellipse cx="44" cy="66" rx="20" ry="8" fill="' + belly + '"/><path d="M34 54 Q44 42 60 52 Q46 60 34 54Z" fill="' + wing + '"/>' +
    '<circle cx="22" cy="42" r="12" fill="' + body + '"/><path d="M12 40 L1 44 L12 48Z" fill="#e3a43a"/>' + eye(19, 40) + '<path d="M0 74 Q12 68 24 74 T48 74 T72 74 T100 74 V100 H0Z" fill="rgba(60,110,140,.6)"/>';
  else if (k === 'plump') o = tw + '<ellipse cx="50" cy="56" rx="32" ry="26" fill="' + body + '"/><ellipse cx="46" cy="64" rx="20" ry="15" fill="' + belly + '"/><path d="M76 50 L98 66 L90 72 L72 62Z" fill="' + wing + '"/><path d="M44 44 Q68 38 78 60 Q58 66 44 58Z" fill="' + wing + '"/>' +
    '<circle cx="24" cy="38" r="12" fill="' + body + '"/><path d="M14 36 L5 40 L14 43Z" fill="#e3a43a"/>' + eye(21, 35) + '<path d="M38 80 L34 90 M54 80 L58 90" stroke="#3b2a1a" stroke-width="3" stroke-linecap="round"/>';
  else if (k === 'big') o = tw + '<path d="M72 54 L99 70 L93 77 L66 66Z" fill="' + wing + '"/><ellipse cx="46" cy="58" rx="29" ry="22" fill="' + body + '"/><ellipse cx="40" cy="65" rx="18" ry="12" fill="' + belly + '"/><path d="M44 50 Q66 42 78 62 Q58 68 44 60Z" fill="' + wing + '"/>' +
    '<path d="M24 28 Q28 14 36 22" fill="' + wing + '"/><circle cx="26" cy="38" r="15" fill="' + body + '"/><path d="M12 36 L0 41 L12 44Z" fill="#3b2a1a"/>' + eye(22, 35) + '<path d="M34 78 L30 90 M46 78 L50 90" stroke="#3b2a1a" stroke-width="3" stroke-linecap="round"/>';
  else o = tw + '<path d="M70 58 L96 70 L92 76 L66 66Z" fill="' + wing + '"/><ellipse cx="46" cy="58" rx="26" ry="19" fill="' + body + '"/><ellipse cx="40" cy="64" rx="16" ry="11" fill="' + belly + '"/><path d="M44 50 Q64 44 76 62 Q58 66 44 60Z" fill="' + wing + '"/>' +
    '<circle cx="26" cy="40" r="14" fill="' + body + '"/><path d="M13 38 L2 43 L13 45Z" fill="#e3a43a"/>' + eye(22, 37) + '<path d="M36 76 L32 90 M46 76 L50 90" stroke="#3b2a1a" stroke-width="3" stroke-linecap="round"/>';
  return '<svg viewBox="0 0 100 100" aria-hidden="true">' + o + '</svg>';
}
function placeholder(stem) {
  var p = stem.split('-'), kind = p[0];
  if (kind === 'bird') {
    var b = PP.B[stem.slice(5)], hue = hashHue(stem), h0 = b ? b.h[0] : 'F', hb = PAL[h0], sky = { F: '#a9c98f', G: '#ecd58a', W: '#9cc8d6' }[h0], gr = { F: '#3c6a38', G: '#a98a2c', W: '#2f6f82' }[h0];
    return '<svg class="phbg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="100" height="100" fill="' + sky + '"/><circle cx="80" cy="20" r="14" fill="rgba(255,255,255,.55)"/>' +
      (h0 === 'F' ? '<path d="M0 0 L0 60 Q12 40 22 0Z M78 0 Q90 30 100 24 L100 0Z" fill="' + gr + '" opacity=".55"/>' : h0 === 'W' ? '<path d="M4 70 q6-26 8 0 M16 70 q6-34 8 0" stroke="' + gr + '" stroke-width="2" fill="none"/>' : '<path d="M8 80 l3-14 3 14 M86 80 l3-12 3 12" stroke="' + gr + '" stroke-width="2" fill="none"/>') +
      '<path d="M0 88 Q50 76 100 86 L100 100 L0 100Z" fill="' + gr + '"/></svg>' +
      birdSVG('hsl(' + hue + ',48%,46%)', 'hsl(' + ((hue + 28) % 360) + ',42%,30%)', 'hsl(' + ((hue + 170) % 360) + ',50%,84%)', FAMKIND[famOf(stem.slice(5))]);
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
function foodIcon(f, cls) { return false && ART.have['food-' + f] ? artHTML('food-' + f, 'fi ' + (cls || '')) : '<span class="fi ' + (cls || '') + '" data-food="' + f + '">' + foodSVG(f) + '</span>'; }
function eggIcon(cls) { return ART.have['token-egg'] ? artHTML('token-egg', 'egi ' + (cls || '')) : '<span class="egi ' + (cls || '') + '">' + eggSVG() + '</span>'; }
function nestIcon(n) { return ART.have['nest-' + n] ? artHTML('nest-' + n, 'nsi') : '<span class="nsi" title="' + n + ' nest">' + nestSVG(n) + '</span>'; }

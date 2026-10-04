/* ===== TBKit core: utils, palettes, shared defs, fonts ===== */
var TB = { version: '1.0.0' };
var NS = 'http://www.w3.org/2000/svg';
function rngf(seed) { var a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function n2(n) { return Math.round(n * 100) / 100; }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function hex2(h) { h = h.replace('#', ''); if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
function mix(a, b, t) { var A = hex2(a), B = hex2(b); return '#' + [0, 1, 2].map(function (i) { var v = Math.round(A[i] + (B[i] - A[i]) * t); return (v < 16 ? '0' : '') + v.toString(16); }).join(''); }

var FAC = {
  gilded: { id: 'gilded', name: 'The Gilded Court', short: 'Gilded Court', blurb: 'Fading nobility', main: '#7c1b2c', dark: '#3a0912', light: '#b8404f', accent: '#d4ad55', accent2: '#8f7330', paper: '#f1e3c3', ink: '#2b1511', glyph: '#f1d98a' },
  heath: { id: 'heath', name: 'The Heathbound Clans', short: 'Heathbound Clans', blurb: 'Old clans of the land', main: '#4e6c33', dark: '#1d2c15', light: '#88a85a', accent: '#e8dfc4', accent2: '#a9a083', paper: '#eee5c9', ink: '#1f2a15', glyph: '#efe6c9' },
  lantern: { id: 'lantern', name: 'The Lantern Rising', short: 'Lantern Rising', blurb: "The people's uprising", main: '#d9622a', dark: '#2b2422', light: '#f49a52', accent: '#ffd079', accent2: '#8d8178', paper: '#f2e3c2', ink: '#2a1b12', glyph: '#fff0c0' },
  choir: { id: 'choir', name: 'The Pale Choir', short: 'Pale Choir', blurb: 'Moon cult', main: '#7f72b4', dark: '#171230', light: '#c5bde8', accent: '#d9dcea', accent2: '#8c90ad', paper: '#ece6dc', ink: '#1a1530', glyph: '#e9e8f6' },
  neutral: { id: 'neutral', name: 'The Market', short: 'Market', blurb: 'Neutral wares', main: '#7b5b37', dark: '#33220f', light: '#b48c57', accent: '#cfa84e', accent2: '#8a6f3a', paper: '#efe0bd', ink: '#2a1c0e', glyph: '#f0dba0' }
};
var FIDS = ['gilded', 'heath', 'lantern', 'choir', 'neutral'];
function fac(f) { return FAC[f] || FAC.neutral; }
TB.FACTIONS = FAC;

/* ---- shared defs (gradients, filters). One hidden <svg> in the page; every card/token references it. ---- */
function lg(id, stops, x1, y1, x2, y2) { return '<linearGradient id="' + id + '" x1="' + (x1 || 0) + '" y1="' + (y1 || 0) + '" x2="' + (x2 || 0) + '" y2="' + (y2 === undefined ? 1 : y2) + '">' + stops.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] !== undefined ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('') + '</linearGradient>'; }
function rg(id, stops, cx, cy, r) { return '<radialGradient id="' + id + '" cx="' + (cx || .5) + '" cy="' + (cy || .5) + '" r="' + (r || .5) + '">' + stops.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] !== undefined ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('') + '</radialGradient>'; }
function defsInner() {
  var d = '';
  d += lg('tb-gold', [[0, '#fff1b0'], [.28, '#d9b24f'], [.55, '#8f6a22'], [.78, '#e7c565'], [1, '#7a5518']], 0, 0, 1, 1);
  d += lg('tb-goldv', [[0, '#f7de8a'], [.5, '#b98d34'], [1, '#6e4c14']], 0, 0, 0, 1);
  d += lg('tb-silver', [[0, '#ffffff'], [.35, '#b8bdd0'], [.6, '#767c96'], [1, '#d9deee']], 0, 0, 1, 1);
  d += lg('tb-iron', [[0, '#7c7a7a'], [.5, '#3e3b3b'], [1, '#1d1b1b']], 0, 0, 1, 1);
  d += lg('tb-bone', [[0, '#fbf5df'], [1, '#bdb28f']], 0, 0, 1, 1);
  d += lg('tb-steel', [[0, '#d8dde0'], [.5, '#7d868c'], [1, '#3e464c']], 0, 0, 1, 1);
  d += lg('tb-wood', [[0, '#8a5d34'], [1, '#3d2410']], 0, 0, 1, 0);
  FIDS.forEach(function (f) { var P = FAC[f]; d += lg('tb-c-' + f, [[0, P.light], [.45, P.main], [1, P.dark]], 0, 0, 0, 1); d += lg('tb-f-' + f, [[0, mix(P.main, '#fff', .12)], [.5, P.main], [1, P.dark]], 0, 0, 1, 1); });
  /* skies / ground */
  d += lg('tb-sky-dusk', [[0, '#26404c'], [.5, '#7d7a63'], [.85, '#e0a85e'], [1, '#f0c27a']]);
  d += lg('tb-sky-moor', [[0, '#4c6064'], [.6, '#a4a98f'], [1, '#d2c9a0']]);
  d += lg('tb-sky-night', [[0, '#0b0c22'], [.6, '#2d2f66'], [1, '#6a6ba3']]);
  d += lg('tb-sky-hall', [[0, '#150c0a'], [.55, '#3a2216'], [1, '#6b3d1f']]);
  d += lg('tb-sky-street', [[0, '#1b1e28'], [.6, '#5a3a2c'], [1, '#b46a30']]);
  d += lg('tb-sky-forest', [[0, '#101e16'], [.6, '#38553a'], [1, '#8ea15d']]);
  d += lg('tb-sky-ember', [[0, '#1d1210'], [.55, '#6d2b17'], [1, '#e0802f']]);
  d += lg('tb-sky-sanct', [[0, '#0f0a08'], [1, '#3a2615']]);
  d += lg('tb-sky-stone', [[0, '#2b3532'], [.6, '#5d6b5c'], [1, '#a2a888']]);
  d += lg('tb-gnd-moss', [[0, '#556b34'], [1, '#1d2a14']]);
  d += lg('tb-gnd-dark', [[0, '#252a3a'], [1, '#0c0e18']]);
  d += lg('tb-gnd-stone', [[0, '#5d625a'], [1, '#262a26']]);
  d += lg('tb-gnd-cobble', [[0, '#4c3f38'], [1, '#1b1512']]);
  d += lg('tb-gnd-floor', [[0, '#3b2619'], [1, '#150d09']]);
  d += lg('tb-gnd-heath', [[0, '#6f6a3a'], [1, '#2a2e18']]);
  d += lg('tb-mist', [[0, '#e8e4cc', 0], [.5, '#e8e4cc', .5], [1, '#e8e4cc', 0]]);
  d += rg('tb-glow-warm', [[0, '#ffd88a', .95], [.35, '#f39a45', .5], [1, '#d85a1c', 0]]);
  d += rg('tb-glow-gold', [[0, '#fff0b0', 1], [.4, '#e6b84c', .5], [1, '#b5822a', 0]]);
  d += rg('tb-glow-cool', [[0, '#e9e6ff', .95], [.4, '#9d93e0', .45], [1, '#5f56a8', 0]]);
  d += rg('tb-glow-white', [[0, '#fff', .9], [1, '#fff', 0]]);
  d += rg('tb-vig', [[.5, '#000', 0], [1, '#05030a', .55]], .5, .5, .75);
  d += rg('tb-orb', [[0, '#fffbe6'], [.5, '#f1d37a'], [1, '#9c7227']], .38, .32, .75);
  d += rg('tb-seal', [[0, '#ffffff', .55], [.5, '#ffffff', 0]], .3, .28, .6);
  /* filters */
  d += '<filter id="tb-rough" x="-6%" y="-6%" width="112%" height="112%"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2"/></filter>';
  d += '<filter id="tb-rough2" x="-6%" y="-6%" width="112%" height="112%"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2"/></filter>';
  d += '<filter id="tb-paint" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency=".05 .07" numOctaves="3" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.6" result="d"/><feGaussianBlur in="d" stdDeviation=".4"/></filter>';
  d += '<filter id="tb-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>';
  d += '<filter id="tb-fog" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>';
  d += '<filter id="tb-shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="2.5" stdDeviation="2.4" flood-color="#000" flood-opacity=".55"/></filter>';
  d += '<filter id="tb-glowf" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>';
  d += '<filter id="tb-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 .16  0 0 0 0 .1  0 0 0 0 .05  0 0 0 1.6 -.62"/></filter>';
  d += '<filter id="tb-stain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".018 .03" numOctaves="3" seed="11" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 .45  0 0 0 0 .3  0 0 0 0 .12  0 0 0 1.3 -.5"/></filter>';
  d += '<filter id="tb-wash" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012 .02" numOctaves="4" seed="5" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 .05  0 0 0 0 .08  0 0 0 0 .06  0 0 0 1.5 -.55"/></filter>';
  /* clip paths */
  d += '<clipPath id="tb-clip-art"><rect x="0" y="0" width="220" height="152" rx="6"/></clipPath>';
  d += '<clipPath id="tb-clip-card"><rect x="0" y="0" width="260" height="372" rx="16"/></clipPath>';
  d += '<clipPath id="tb-clip-panel"><rect x="0" y="0" width="216" height="116" rx="4"/></clipPath>';
  return d;
}
TB.defsSVG = function () { return '<svg xmlns="' + NS + '" width="0" height="0" style="position:absolute;width:0;height:0" aria-hidden="true" focusable="false" id="tb-defs"><defs>' + defsInner() + backSymbols() + '</defs></svg>'; };

/* ---- fonts: Cinzel (display, OFL) + EB Garamond (body, OFL), embedded base64 ---- */
var FONT_B64 = /*FONTS*/{};
var DISPLAY = "'TB Display','Cinzel','Palatino Linotype','Book Antiqua',Palatino,Georgia,serif";
var BODY = "'TB Body','EB Garamond','Palatino Linotype','Book Antiqua',Palatino,Georgia,serif";
TB.fonts = { display: DISPLAY, body: BODY };
function fontCSS() {
  return '@font-face{font-family:"TB Display";font-weight:700;src:url(data:font/woff2;base64,' + FONT_B64.cinzel + ') format("woff2")}' +
    '@font-face{font-family:"TB Body";font-weight:400;font-style:normal;src:url(data:font/woff2;base64,' + FONT_B64.fell + ') format("woff2")}' +
    '@font-face{font-family:"TB Body";font-weight:400;font-style:italic;src:url(data:font/woff2;base64,' + FONT_B64.fellit + ') format("woff2")}';
}
var CSS = '';  /* filled by anim part */
var mounted = false;
TB.mount = function () {
  if (mounted || typeof document === 'undefined') return;
  mounted = true;
  var st = document.createElement('style'); st.id = 'tb-style'; st.textContent = fontCSS() + CSS; (document.head || document.documentElement).appendChild(st);
  var host = document.createElement('div'); host.innerHTML = TB.defsSVG();
  (document.body || document.documentElement).insertBefore(host.firstChild, (document.body || document.documentElement).firstChild);
};
TB.ready = Promise.resolve();
var mctx = null;
function measure(txt, font) { if (!mctx) { try { mctx = document.createElement('canvas').getContext('2d'); } catch (e) { mctx = false; } } if (!mctx) return txt.length * parseFloat(font.match(/(\d+(\.\d+)?)px/)[1]) * .47; mctx.font = font; return mctx.measureText(txt).width; }
function wrapText(text, maxW, px, bold) {
  var font = (bold ? 'bold ' : '') + px + 'px ' + BODY, out = [];
  String(text).split(/\n|\|/).forEach(function (para) {
    var words = para.split(/\s+/).filter(Boolean), line = '';
    words.forEach(function (w) { var t = line ? line + ' ' + w : w; if (measure(t, font) <= maxW || !line) line = t; else { out.push(line); line = w; } });
    out.push(line);
  });
  return out;
}

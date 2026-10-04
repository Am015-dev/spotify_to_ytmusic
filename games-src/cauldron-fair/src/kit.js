// Cauldron Fair kit: the spiral geometry of the cauldron, chip / icon / avatar drawings (vector, replaced by painted art when it is loaded).
// KIT.ART holds blob URLs of the painted pictures (set by KIT.setArt); every drawing here has a plain vector fallback so the page never shows a hole.
(function (g) {
'use strict';
const D = g.CF.DATA;
const f2 = n => Math.round(n * 100) / 100;
// ---------------- spiral geometry (unit space: one space is about 1 unit wide; the centre of the cauldron is 0,0) ----------------
// An Archimedean spiral walked in equal steps: 54 points (index 0 = the droplet's start in the middle ... 53 = the spoon at the outer end).
const GEO = (function () {
  const n = D.TRACK_LEN, step = 1.0, k = 1.12 / (2 * Math.PI), r0 = 1.25, pts = [];
  let th = Math.PI * 0.85, r = r0;
  pts.push({ x: 0, y: 0, a: 0 });
  for (let i = 1; i < n; i++) {
    if (i > 1) { const dth = step / Math.sqrt(r * r + k * k); th += dth; r = r0 + k * (th - Math.PI * 0.85); }
    pts.push({ x: f2(Math.cos(th) * r), y: f2(Math.sin(th) * r), a: th });
  }
  // spread the first few spaces so the 0 and 1 do not sit on top of each other
  const R = Math.max.apply(null, pts.map(p => Math.hypot(p.x, p.y))) + 0.75;
  return { pts, R, step };
})();
// ---------------- colours / chips ----------------
const COL = {}; for (const c in D.COLORS) COL[c] = D.COLORS[c];
const shade = (hex, t) => { const h = hex.replace('#', ''), n = parseInt(h.length === 3 ? h.split('').map(x => x + x).join('') : h, 16); let r = n >> 16, gg = (n >> 8) & 255, b = n & 255; const m = t < 0 ? 0 : 255, a = Math.abs(t); r = Math.round(r + (m - r) * a); gg = Math.round(gg + (m - gg) * a); b = Math.round(b + (m - b) * a); return '#' + [r, gg, b].map(x => x.toString(16).padStart(2, '0')).join(''); };
// small pictograms (viewBox 100): drawn over the disc in a lighter or darker tone of the chip colour
function glyph(c, col, ink) {
  const lt = shade(col, .45), dk = shade(col, -.35);
  switch (c) {
    case 'W': return `<circle cx="50" cy="56" r="17" fill="${lt}" stroke="${dk}" stroke-width="3"/><path d="M50 39 L56 28 M62 44 L72 38 M66 58 L77 58 M38 44 L28 38 M34 58 L23 58" stroke="${dk}" stroke-width="3.5" stroke-linecap="round" fill="none"/><circle cx="44" cy="50" r="4" fill="#fff" opacity=".8"/>`;
    case 'O': return `<ellipse cx="50" cy="58" rx="22" ry="18" fill="${lt}" stroke="${dk}" stroke-width="3"/><path d="M50 40 C46 52 46 64 50 76 M38 44 C34 54 36 66 40 74 M62 44 C66 54 64 66 60 74" stroke="${dk}" stroke-width="2.5" fill="none"/><path d="M50 40 L50 31 L57 27" stroke="#3a6a2a" stroke-width="4" stroke-linecap="round" fill="none"/>`;
    case 'G': return `<path d="M50 78 C50 60 50 46 50 30" stroke="${dk}" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M50 40 C38 40 30 34 28 28 C40 26 48 30 50 40Z M50 54 C62 54 70 48 72 42 C60 40 52 44 50 54Z M50 66 C40 66 33 62 31 56 C42 54 49 58 50 66Z" fill="${lt}" stroke="${dk}" stroke-width="2.5" stroke-linejoin="round"/>`;
    case 'B': return `<path d="M32 74 C34 54 44 36 66 26 C64 42 58 58 40 70 Z" fill="${lt}" stroke="${dk}" stroke-width="3" stroke-linejoin="round"/><path d="M32 74 C42 58 52 44 64 30" stroke="${dk}" stroke-width="3" fill="none"/><path d="M38 62 L48 64 M44 52 L54 54 M52 42 L60 42" stroke="${dk}" stroke-width="2" fill="none"/>`;
    case 'R': return `<path d="M24 56 C24 36 38 26 50 26 C62 26 76 36 76 56 Z" fill="${lt}" stroke="${dk}" stroke-width="3" stroke-linejoin="round"/><circle cx="40" cy="42" r="4.5" fill="#fff"/><circle cx="58" cy="38" r="3.5" fill="#fff"/><circle cx="62" cy="50" r="3" fill="#fff"/><path d="M42 56 L42 74 Q50 80 58 74 L58 56" fill="#f3e6c8" stroke="${dk}" stroke-width="3" stroke-linejoin="round"/>`;
    case 'Y': return `<path d="M50 28 C44 40 36 52 38 62 C40 72 46 76 50 78 C54 76 60 72 62 62 C64 52 56 40 50 28Z" fill="${lt}" stroke="${dk}" stroke-width="3" stroke-linejoin="round"/><path d="M50 28 L42 20 M50 28 L50 18 M50 28 L58 20" stroke="#3a6a2a" stroke-width="3.5" stroke-linecap="round"/><circle cx="45" cy="50" r="2.4" fill="${dk}"/><circle cx="54" cy="60" r="2.4" fill="${dk}"/>`;
    case 'P': return `<path d="M50 74 C34 74 30 58 40 50 C50 42 62 46 62 56 C62 66 50 66 48 58 C47 53 53 52 54 56" stroke="${lt}" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M60 36 C66 28 74 30 72 38 C70 44 64 40 66 36" stroke="${lt}" stroke-width="4" stroke-linecap="round" fill="none"/>`;
    case 'K': return `<path d="M50 34 L50 70" stroke="${lt}" stroke-width="5" stroke-linecap="round"/><path d="M50 44 C40 28 24 30 22 44 C28 48 40 52 50 52 C60 52 72 48 78 44 C76 30 60 28 50 44Z" fill="${lt}" stroke="${dk}" stroke-width="2.5"/><circle cx="46" cy="38" r="2" fill="${dk}"/><circle cx="54" cy="38" r="2" fill="${dk}"/>`;
  }
  return '';
}
const ART = {};   // id -> url (blob) of the painted pictures
function chipSVG(c, v, o) {
  o = o || {}; const col = COL[c].css, ink = COL[c].ink, dk = shade(col, -.38), lt = shade(col, .3), size = o.size || 40;
  const painted = ART['chip-' + c];
  const num = v ? `<text x="50" y="${c === 'W' ? 77 : 71}" text-anchor="middle" font-family="Nunito,Trebuchet MS,Segoe UI,sans-serif" font-weight="900" font-size="${o.small ? 40 : 46}" fill="${c === 'W' || c === 'Y' ? '#3a2616' : '#fff'}" stroke="${c === 'W' || c === 'Y' ? '#fff' : '#2a1608'}" stroke-width="${c === 'W' || c === 'Y' ? 2 : 3.2}" paint-order="stroke" stroke-linejoin="round">${v}</text>` : '';
  const body = painted ? `<image href="${painted}" x="0" y="0" width="100" height="100"/>` :
    `<circle cx="50" cy="50" r="47" fill="${dk}"/><circle cx="50" cy="50" r="44" fill="${col}"/><circle cx="50" cy="50" r="44" fill="none" stroke="${lt}" stroke-width="3" opacity=".75"/><circle cx="50" cy="50" r="35" fill="none" stroke="${dk}" stroke-width="1.5" opacity=".5" stroke-dasharray="3 4"/><path d="M18 36 A38 38 0 0 1 56 12" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none" opacity=".35"/>${glyph(c, col, ink)}`;
  return `<svg class="chip" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="${COL[c].name} ${v || ''}" data-c="${c}" data-v="${v || ''}">${body}${num}</svg>`;
}
// ---------------- icons (24 box, currentColor-less, colourful) ----------------
const ICON = {
  ruby: s => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true"><path d="M12 3 L19 9 L12 21 L5 9 Z" fill="#e0334c" stroke="#7a1022" stroke-width="1.3" stroke-linejoin="round"/><path d="M5 9 H19 M9 9 L12 3 L15 9 M9 9 L12 21 M15 9 L12 21" stroke="#ff9aa8" stroke-width=".9" fill="none"/></svg>`,
  drop: s => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true"><path d="M12 2.5 C8 9 5.5 12 5.5 15.5 A6.5 6.5 0 0 0 18.5 15.5 C18.5 12 16 9 12 2.5Z" fill="#d83a2e" stroke="#6a120c" stroke-width="1.3"/><ellipse cx="9.5" cy="15" rx="1.6" ry="2.6" fill="#fff" opacity=".6" transform="rotate(15 9.5 15)"/></svg>`,
  flask: (s, full) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true"><path d="M9 3 H15 M10 3 V9 L4.5 19 A2 2 0 0 0 6.3 21.5 H17.7 A2 2 0 0 0 19.5 19 L14 9 V3" fill="${full ? '#cfeef2' : '#eee6d4'}" stroke="#4a3a2a" stroke-width="1.4" stroke-linejoin="round"/>${full ? '<path d="M7 15.5 H17 L18.6 19 A1 1 0 0 1 17.7 20.3 H6.3 A1 1 0 0 1 5.4 19 Z" fill="#5fc6a8" stroke="#2b7a66" stroke-width=".9"/><circle cx="10" cy="17" r="1" fill="#fff"/><circle cx="14" cy="18.2" r=".8" fill="#fff"/>' : '<path d="M8.5 6.5 L15.5 6.5" stroke="#b8a888" stroke-width="1" stroke-dasharray="1.5 2"/>'}</svg>`,
  rat: s => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true"><ellipse cx="11" cy="14" rx="7" ry="5" fill="#9a8878" stroke="#4a3a2a" stroke-width="1.2"/><circle cx="17.5" cy="11.5" r="3.2" fill="#9a8878" stroke="#4a3a2a" stroke-width="1.2"/><circle cx="16" cy="8.8" r="1.8" fill="#d9b3a8" stroke="#4a3a2a" stroke-width="1"/><circle cx="19" cy="11" r=".7" fill="#222"/><path d="M4 15 C0 15 1 21 6 20" stroke="#c9a090" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`,
  coin: s => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#f2c230" stroke="#8a5a12" stroke-width="1.5"/><circle cx="12" cy="12" r="6" fill="none" stroke="#c98a10" stroke-width="1.2"/><path d="M9.5 9.5 H13 A1.8 1.8 0 0 1 13 13 H10.2 M10.2 13 H13.4 A1.8 1.8 0 0 1 13.4 16.4 H9.5" stroke="#8a5a12" stroke-width="1.2" fill="none" opacity=".0"/></svg>`,
  vp: s => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true"><path d="M12 2.5 L14.6 8.6 L21 9.2 L16.1 13.4 L17.6 19.8 L12 16.4 L6.4 19.8 L7.9 13.4 L3 9.2 L9.4 8.6 Z" fill="#f6d36a" stroke="#8a5a12" stroke-width="1.3" stroke-linejoin="round"/></svg>`,
  bag: s => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true"><path d="M8 5 L16 5 L15 8 C19 10 21 14 20 18 C19 21 15 22 12 22 C9 22 5 21 4 18 C3 14 5 10 9 8 Z" fill="#c9a06a" stroke="#5a3a1a" stroke-width="1.3" stroke-linejoin="round"/><path d="M8 5 C10 7 14 7 16 5" stroke="#5a3a1a" stroke-width="1.3" fill="none"/><path d="M7.5 4 L16.5 4" stroke="#8a2a2a" stroke-width="2" stroke-linecap="round"/></svg>`,
  boom: s => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true"><path d="M12 2 L14 8 L20 5 L17 11 L23 13 L16 15 L19 21 L12 17 L5 21 L8 15 L1 13 L7 11 L4 5 L10 8 Z" fill="#f08a22" stroke="#7a2a08" stroke-width="1.2" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="#ffe39a"/></svg>`,
  check: s => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#7fd65a" stroke="#2d7a1c" stroke-width="1.5"/><path d="M7 12.5 L10.5 16 L17 8.5" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  die: (s, face) => { const pips = { vp1: '1', vp2: '2', ruby: 'R', drop: 'D', orange: 'O' }; const lab = face ? (face === 'vp1' ? '1' : face === 'vp2' ? '2' : '') : '?';
    const inner = face === 'ruby' ? `<g transform="translate(5 5) scale(.58)">${ICON.ruby(24).replace(/<\/?svg[^>]*>/g, '')}</g>` : face === 'drop' ? `<g transform="translate(5 5) scale(.58)">${ICON.drop(24).replace(/<\/?svg[^>]*>/g, '')}</g>` : face === 'orange' ? chipInner('O') : `<text x="12" y="17" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="14" fill="#4a2a22">${lab}</text>`;
    return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="4" fill="#fff8e6" stroke="#4a2a22" stroke-width="1.5"/>${inner}${face === 'vp1' || face === 'vp2' ? '<path d="M5 20 H19" stroke="#c98a10" stroke-width="1.2" opacity=".0"/>' : ''}</svg>`; }
};
function chipInner(c) { return `<g transform="translate(4.5 4.5) scale(.15)">${glyph(c, COL[c].css, COL[c].ink)}</g>`; }
const icon = (name, size, a) => ICON[name](size || 18, a);
// ---------------- people (the four fair-goers) ----------------
function avatarSVG(i, o) {
  o = o || {}; const ch = D.CHARS[i % 4], size = o.size || 48, painted = ART['char-' + ch.id];
  if (painted) return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="${ch.name}"><clipPath id="avc${i}"><circle cx="50" cy="50" r="48"/></clipPath><circle cx="50" cy="50" r="48" fill="${shade(ch.css, .55)}"/><image href="${painted}" x="0" y="0" width="100" height="100" clip-path="url(#avc${i})"/><circle cx="50" cy="50" r="48" fill="none" stroke="${ch.css}" stroke-width="4"/></svg>`;
  const skin = ['#f1c9a0', '#e2b084', '#f3d2b0', '#d9a07a'][i % 4], hair = ['#7a4a2a', '#3a2a1a', '#c97a2a', '#2a1a14'][i % 4];
  const hat = [`<path d="M20 38 Q50 4 80 38 Q50 30 20 38Z" fill="${ch.css}" stroke="#3a2616" stroke-width="2.5"/>`, `<path d="M16 36 L84 36 L74 22 L26 22Z" fill="${ch.css}" stroke="#3a2616" stroke-width="2.5"/><rect x="26" y="30" width="48" height="6" fill="#6a4a1a"/>`, `<path d="M18 40 Q50 -4 82 40 Z" fill="${ch.css}" stroke="#3a2616" stroke-width="2.5"/><path d="M50 8 L56 20" stroke="#fff" stroke-width="3"/>`, `<path d="M22 40 C24 14 76 14 78 40 Q50 32 22 40Z" fill="${ch.css}" stroke="#3a2616" stroke-width="2.5"/><circle cx="50" cy="14" r="5" fill="#f2c230" stroke="#3a2616" stroke-width="2"/>`][i % 4];
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="${ch.name}"><circle cx="50" cy="50" r="48" fill="${shade(ch.css, .6)}" stroke="${ch.css}" stroke-width="4"/><path d="M18 100 C18 74 34 68 50 68 C66 68 82 74 82 100Z" fill="${ch.css}" stroke="#3a2616" stroke-width="2.5"/><ellipse cx="50" cy="48" rx="21" ry="24" fill="${skin}" stroke="#3a2616" stroke-width="2.5"/><path d="M29 44 C29 30 71 30 71 44 C62 38 38 38 29 44Z" fill="${hair}"/>${hat}<circle cx="42" cy="50" r="2.8" fill="#2a1a14"/><circle cx="58" cy="50" r="2.8" fill="#2a1a14"/><path d="M42 62 Q50 69 58 62" stroke="#7a2a22" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="36" cy="58" r="4" fill="#f09090" opacity=".5"/><circle cx="64" cy="58" r="4" fill="#f09090" opacity=".5"/></svg>`;
}
// ---------------- the cauldron as an SVG (the plain view, thumbnails and tests) ----------------
// opts: {pot, droplet, rat, space, boom, size, mini, showNums}
function potSVG(o) {
  const pts = GEO.pts, R = GEO.R, mini = !!o.mini, size = o.size || 320, uid = 'p' + (o.uid || 0);
  const pad = i => { const rb = D.RUBY[i], sp = i === D.SPOON; return sp ? '#f0d8a0' : rb ? '#f4c6cc' : (D.VP[i] >= 10 ? '#cde6c4' : D.VP[i] >= 5 ? '#e3efc8' : D.VP[i] >= 1 ? '#f3efd0' : '#efe6cf'); };
  let s = `<svg class="pot${o.boom ? ' boom' : ''}" viewBox="${f2(-R)} ${f2(-R)} ${f2(2 * R)} ${f2(2 * R)}" width="${size}" height="${size}" role="img" aria-label="${o.label || 'cauldron'}">`;
  s += `<defs><radialGradient id="${uid}w" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="${o.boom ? '#6a3a2a' : '#5fc6a8'}"/><stop offset="1" stop-color="${o.boom ? '#3a1a10' : '#2a7a72'}"/></radialGradient></defs>`;
  if (!ART.cauldron || mini) s += `<circle r="${f2(R)}" fill="#4a3a30" stroke="#2a1a10" stroke-width=".18"/><circle r="${f2(R - .35)}" fill="url(#${uid}w)"/>`; else s += `<image href="${ART.cauldron}" x="${f2(-R)}" y="${f2(-R)}" width="${f2(2 * R)}" height="${f2(2 * R)}"/>`;
  if (!mini || o.showPads) for (let i = 0; i < pts.length; i++) {
    const p = pts[i], isSp = i === D.SPOON;
    if (mini) { s += `<circle cx="${p.x}" cy="${p.y}" r=".34" fill="${D.RUBY[i] ? '#f4a0aa' : 'rgba(255,255,255,.35)'}"/>`; continue; }
    s += `<g class="sp" data-i="${i}"><circle cx="${p.x}" cy="${p.y}" r=".5" fill="${pad(i)}" stroke="#3a2616" stroke-width=".05" opacity="${i === 0 ? .9 : .94}"/>`;
    if (i > 0 && !isSp) s += `<text x="${p.x}" y="${f2(p.y + .16)}" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size=".46" fill="#4a2a22">${D.COINS[i]}</text>`;
    if (isSp) s += `<text x="${p.x}" y="${f2(p.y - .02)}" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size=".28" fill="#6a3a12">15 VP</text><text x="${p.x}" y="${f2(p.y + .3)}" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size=".28" fill="#6a3a12">35</text>`;
    if (i > 0 && !isSp && D.VP[i] > 0) s += `<rect x="${f2(p.x + .12)}" y="${f2(p.y - .56)}" width=".4" height=".3" rx=".05" fill="#8a5a2a"/><text x="${f2(p.x + .32)}" y="${f2(p.y - .33)}" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size=".26" fill="#fff6dc">${D.VP[i]}</text>`;
    if (D.RUBY[i]) s += `<path transform="translate(${f2(p.x - .52)} ${f2(p.y - .56)}) scale(.019)" d="M12 3 L19 9 L12 21 L5 9 Z" fill="#e0334c" stroke="#7a1022" stroke-width="1.6"/>`;
    s += '</g>';
  }
  if (o.space != null && !mini) { const p = pts[o.space]; s += `<circle class="sc" cx="${p.x}" cy="${p.y}" r=".62" fill="none" stroke="#f2c230" stroke-width=".13" stroke-dasharray=".25 .15"/>`; }
  if (mini && o.space != null) { const p = pts[o.space]; s += `<circle cx="${p.x}" cy="${p.y}" r=".5" fill="none" stroke="#f2c230" stroke-width=".18"/>`; }
  const cr = mini ? .46 : .47;
  for (const c of (o.pot || [])) {
    const p = pts[c.pos]; if (!p) continue;
    if (mini) s += `<circle cx="${p.x}" cy="${p.y}" r="${cr + .12}" fill="${COL[c.c].css}" stroke="#2a1608" stroke-width=".11"/>`;
    else s += `<g transform="translate(${f2(p.x - cr)} ${f2(p.y - cr)}) scale(${f2(cr * 2 / 100)})" class="pc" data-id="${c.i}">${chipSVG(c.c, c.v, { size: 100 }).replace(/<svg[^>]*>/, '<g>').replace('</svg>', '</g>')}</g>`;
  }
  if (o.rat) { const p = pts[o.rat]; s += `<g transform="translate(${f2(p.x - .34)} ${f2(p.y - .5)}) scale(.03)">${ICON.rat(24).replace(/<\/?svg[^>]*>/g, '')}</g>`; }
  const dp = pts[o.droplet || 0]; s += `<g transform="translate(${f2(dp.x - (mini ? .32 : .36))} ${f2(dp.y - (mini ? .42 : .48))}) scale(${mini ? .028 : .03})">${ICON.drop(24).replace(/<\/?svg[^>]*>/g, '')}</g>`;
  return s + '</svg>';
}
const KIT = g.KIT = { GEO, COL, ART, chipSVG, icon, ICON, avatarSVG, potSVG, shade, glyph, setArt: m => { Object.keys(ART).forEach(k => delete ART[k]); Object.assign(ART, m); } };
if (typeof module === 'object' && module.exports) module.exports = KIT;
})(typeof globalThis !== 'undefined' ? globalThis : this);

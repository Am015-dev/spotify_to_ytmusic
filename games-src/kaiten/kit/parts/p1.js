/* KKKit - Kaiten Kitchen art kit. "Conveyor-belt diner": gouache-painted plates, soft rim light, our own faces.
   100% procedural SVG/CSS (no external images). Plain script, global KKKit. */
(function (root) {
'use strict';
const INK = '#4a2a22';          // warm brown ink (never pure black)
const CREAM = '#fbf0da', CREAM2 = '#f1dfbd', WOOD = '#a8693c', WOOD_D = '#6d3f22';
const FONT = "'Nunito','Varela Round','Trebuchet MS','Segoe UI',system-ui,-apple-system,'DejaVu Sans',Verdana,sans-serif";
const NS = 'http://www.w3.org/2000/svg';
const f1 = n => Math.round(n * 10) / 10;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function hash(s) { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = hash(seed) || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
function hex(c) { c = c.replace('#', ''); if (c.length === 3) c = c.split('').map(x => x + x).join(''); return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)]; }
function toHex(a) { return '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
function mix(a, b, t) { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); }
const lighten = (c, t) => mix(c, '#ffffff', t), darken = (c, t) => mix(c, '#2a120c', t);

// ------------------------------------------------------------------ card types
// c = plate colour (distinct hue per food type), rim = rim ornament, rule = badge icon name
const TYPES = {
  tempura:  { name: 'Crispy Prawn',   l: ['Crispy', 'Prawn'],   c: '#f08a2e', rule: 'pair',   ruleText: 'Pair of Crispy Prawns = 5 points', rim: 'dashes', group: 'tempura' },
  sashimi:  { name: 'Fish Slice',     l: ['Fish', 'Slice'],     c: '#c93a8a', rule: 'set',    ruleText: 'Set of 3 Fish Slices = 10 points', rim: 'waves',  group: 'sashimi' },
  dumpling: { name: 'Steam Bun',      l: ['Steam', 'Bun'],      c: '#4aaee6', rule: 'ladder', ruleText: '1 / 3 / 6 / 10 / 15 points for 1 to 5 buns', rim: 'dots', group: 'dumpling' },
  roll1:    { name: 'Seaweed Roll',   l: ['Seaweed', 'Roll'],   c: '#22a699', rule: 'most',   ruleText: 'Most roll icons 6, second most 3', rim: 'stripes', group: 'roll', n: 1 },
  roll2:    { name: 'Seaweed Roll',   l: ['Seaweed', 'Roll'],   c: '#22a699', rule: 'most',   ruleText: 'Most roll icons 6, second most 3', rim: 'stripes', group: 'roll', n: 2 },
  roll3:    { name: 'Seaweed Roll',   l: ['Seaweed', 'Roll'],   c: '#22a699', rule: 'most',   ruleText: 'Most roll icons 6, second most 3', rim: 'stripes', group: 'roll', n: 3 },
  salmon:   { name: 'Sunset Nigiri',  l: ['Sunset', 'Nigiri'],  c: '#e5472b', rule: 'v2',     ruleText: 'Worth 2 points (x3 on Fire Paste)', rim: 'scallops', group: 'nigiri', v: 2 },
  squid:    { name: 'Moon Nigiri',    l: ['Moon', 'Nigiri'],    c: '#6657c9', rule: 'v3',     ruleText: 'Worth 3 points (x3 on Fire Paste)', rim: 'scallops', group: 'nigiri', v: 3 },
  egg:      { name: 'Sun Nigiri',     l: ['Sun', 'Nigiri'],     c: '#f3c933', rule: 'v1',     ruleText: 'Worth 1 point (x3 on Fire Paste)', rim: 'scallops', group: 'nigiri', v: 1 },
  wasabi:   { name: 'Fire Paste',     l: ['Fire', 'Paste'],     c: '#94c83d', rule: 'x3',     ruleText: 'Your next Nigiri is worth x3', rim: 'zigzag', group: 'wasabi' },
  chop:     { name: 'Twin Sticks',    l: ['Twin', 'Sticks'],    c: '#9a5b3c', rule: 'swap',   ruleText: 'Later: take 2 cards, pass the sticks back', rim: 'dashes', group: 'chop' },
  pudding:  { name: 'Custard Cup',    l: ['Custard', 'Cup'],    c: '#f4b6d2', rule: 'dessert',ruleText: 'End of game: most +6, fewest -6', rim: 'dots', group: 'pudding' }
};
const ORDER = ['tempura', 'sashimi', 'dumpling', 'roll1', 'roll2', 'roll3', 'salmon', 'squid', 'egg', 'wasabi', 'chop', 'pudding'];
const PLAYERS = [
  { name: 'Mina', c: '#e5553a', d: '#9c2f1c', t: '#fbd5c9' },
  { name: 'Taro', c: '#2a97a0', d: '#17636a', t: '#c6ecee' },
  { name: 'Odile', c: '#e0a31c', d: '#9a6a05', t: '#f9e6b0' },
  { name: 'Kofi', c: '#7a5ac8', d: '#4a2f93', t: '#ddd2f5' },
  { name: 'Pip', c: '#5aa83c', d: '#357a1f', t: '#d3ecc5' }
];

// ------------------------------------------------------------------ shared defs (gradients, filters, patterns)
function defs() {
  let s = '<defs>';
  // universal soft light: top-left glow, bottom-right shade (objectBoundingBox, works on any fill)
  s += '<linearGradient id="kk-lit" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".46"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/><stop offset=".58" stop-color="#3b1408" stop-opacity="0"/><stop offset="1" stop-color="#3b1408" stop-opacity=".30"/></linearGradient>';
  s += '<linearGradient id="kk-rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>';
  s += '<radialGradient id="kk-well" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".6" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#3b1408" stop-opacity=".16"/></radialGradient>';
  s += '<linearGradient id="kk-metal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d7a58"/><stop offset=".18" stop-color="#e9ddc0"/><stop offset=".4" stop-color="#f8f1de"/><stop offset=".7" stop-color="#bba67a"/><stop offset="1" stop-color="#7d6a49"/></linearGradient>';
  s += '<linearGradient id="kk-beltg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a4a45"/><stop offset=".12" stop-color="#3a2c29"/><stop offset=".88" stop-color="#2e2321"/><stop offset="1" stop-color="#1f1715"/></linearGradient>';
  s += '<linearGradient id="kk-steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0e8d6"/><stop offset=".3" stop-color="#c9bda5"/><stop offset=".7" stop-color="#8e8269"/><stop offset="1" stop-color="#5c523f"/></linearGradient>';
  s += '<radialGradient id="kk-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6c8" stop-opacity=".95"/><stop offset="1" stop-color="#ffd25a" stop-opacity="0"/></radialGradient>';
  // gouache filters: wobbly brush edge (+ grain on the big one)
  s += '<filter id="kk-fx-full" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="d"/><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 .30  0 0 0 0 .14  0 0 0 0 .08  .8 0 0 0 -.38" result="g2"/><feComposite in="g2" in2="d" operator="in" result="gc"/><feMerge><feMergeNode in="d"/><feMergeNode in="gc"/></feMerge></filter>';
  s += '<filter id="kk-fx-lite" x="-6%" y="-6%" width="112%" height="112%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="1" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.7" xChannelSelector="R" yChannelSelector="G"/></filter>';
  s += '<filter id="kk-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2"/></filter>';
  s += '<filter id="kk-shadow" x="-20%" y="-20%" width="140%" height="150%"><feGaussianBlur stdDeviation="2.4"/></filter>';
  // linen weave for placemats
  s += '<pattern id="kk-weave" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 1.5H6M0 4.5H6" stroke="#8a5a2c" stroke-opacity=".07" stroke-width="1"/><path d="M1.5 0V6M4.5 0V6" stroke="#8a5a2c" stroke-opacity=".06" stroke-width="1"/></pattern>';
  s += '</defs>';
  return s;
}

// ------------------------------------------------------------------ drawing helpers (plate space: centre 0,0)
// painted path: base fill + ink outline, then soft light/shade overlay + rim light
function P(d, fill, o) {
  o = o || {};
  const sw = o.sw != null ? o.sw : 1.5, st = o.stroke || INK;
  const tr = o.tr ? ` transform="${o.tr}"` : '';
  let s = `<path d="${d}" fill="${fill}"${sw ? ` stroke="${st}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"` : ''}${o.op != null ? ` opacity="${o.op}"` : ''}${tr}/>`;
  if (!o.flat) s += `<path d="${d}" fill="url(#kk-lit)" stroke="url(#kk-rim)" stroke-width="${f1(Math.max(.8, sw * .6))}"${tr}/>`;
  return s;
}
function E(cx, cy, rx, ry, fill, o) {
  o = o || {}; const rot = o.rot ? ` transform="rotate(${o.rot} ${f1(cx)} ${f1(cy)})"` : '';
  const sw = o.sw != null ? o.sw : 1.5;
  let s = `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${fill}"${sw ? ` stroke="${o.stroke || INK}" stroke-width="${sw}"` : ''}${o.op != null ? ` opacity="${o.op}"` : ''}${rot}/>`;
  if (!o.flat) s += `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="url(#kk-lit)" stroke="url(#kk-rim)" stroke-width="${f1(Math.max(.8, sw * .6))}"${rot}/>`;
  return s;
}
const L = (d, col, w, o) => `<path d="${d}" fill="none" stroke="${col || INK}" stroke-width="${w || 1.4}" stroke-linecap="round" stroke-linejoin="round"${o && o.op != null ? ` opacity="${o.op}"` : ''}${o && o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;
const dot = (x, y, r, fill, op) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${fill}"${op != null ? ` opacity="${op}"` : ''}/>`;
const star = (x, y, r, fill, rot) => { let d = ''; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + (rot || 0), rr = i % 2 ? r * .32 : r; d += (i ? 'L' : 'M') + f1(x + Math.sin(a) * rr) + ' ' + f1(y - Math.cos(a) * rr); } return `<path d="${d}Z" fill="${fill}"/>`; };
// wobbly closed blob from points (smooth)
function blobPath(pts) {
  const n = pts.length, m = (a, b) => f1((a[0] + b[0]) / 2) + ' ' + f1((a[1] + b[1]) / 2);
  let d = 'M' + m(pts[n - 1], pts[0]);
  for (let i = 0; i < n; i++) d += `Q${f1(pts[i][0])} ${f1(pts[i][1])} ${m(pts[i], pts[(i + 1) % n])}`;
  return d + 'Z';
}
function ringPts(cx, cy, rx, ry, n, jit, r, rot) { const p = []; for (let i = 0; i < n; i++) { const a = i / n * 6.2832 + (rot || 0), k = 1 + (r ? (r() - .5) * jit : 0); p.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); } return p; }

// ------------------------------------------------------------------ faces: our own expressive style
// kinds: proud sleepy startled grin smug dreamy happy fiery wink bliss.  body = skin colour (for lids / cheek lines)
function face(kind, cx, cy, s, body) {
  s = s || 1; body = body || '#f0c070';
  const ch = darken(body, .28), W = '#fffdf6', K = '#3a1a16';
  const eye = (x, rx, ry, px, py, pr) => `<ellipse cx="${x}" cy="0" rx="${rx}" ry="${ry}" fill="${W}" stroke="${INK}" stroke-width="1.15"/><ellipse cx="${x + px}" cy="${py}" rx="${pr}" ry="${f1(pr * 1.25)}" fill="${K}"/><circle cx="${f1(x + px - pr * .35)}" cy="${f1(py - pr * .5)}" r="${f1(pr * .38)}" fill="#fff"/>`;
  const brow = (d, w) => L(d, INK, w || 2.1);
  const cheeks = (y) => L(`M-23 ${y}l-3 2M-22 ${y + 3}l-3 2`, ch, 1.1, { op: .7 }) + L(`M23 ${y}l3 2M22 ${y + 3}l3 2`, ch, 1.1, { op: .7 });
  let g = '';
  switch (kind) {
    case 'proud':
      g = eye(-9, 4.3, 5.2, .5, -1.1, 2.5) + eye(9, 4.3, 5.2, .5, -1.1, 2.5) +
        brow('M-14 -9.5Q-9 -14 -4 -10.2') + brow('M4 -10.8Q9 -15.2 14.5 -10.4') +
        `<path d="M-8 8Q0 15 8 8Q0 11.5 -8 8Z" fill="${K}" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>` + L('M9 8.6l2.4 -1.2', INK, 1.1) + cheeks(2);
      break;
    case 'sleepy':
      g = `<ellipse cx="-9" cy="0" rx="4.6" ry="4.2" fill="${W}" stroke="${INK}" stroke-width="1.1"/><ellipse cx="9" cy="0" rx="4.6" ry="4.2" fill="${W}" stroke="${INK}" stroke-width="1.1"/>` +
        `<ellipse cx="-8.6" cy="1.4" rx="2.2" ry="2.5" fill="${K}"/><ellipse cx="8.6" cy="1.4" rx="2.2" ry="2.5" fill="${K}"/>` +
        `<path d="M-14 -.2Q-9 -6.6 -4.2 -.2Z" fill="${body}" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/><path d="M4.2 -.2Q9 -6.6 14 -.2Z" fill="${body}" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/>` +
        brow('M-14 -8Q-9 -9.5 -4 -7.5', 1.8) + brow('M4 -7.5Q9 -9.5 14 -8', 1.8) +
        L('M-4 9.5q2.2 2 4 0t4 0', INK, 1.5) + `<path d="M17 -13h6l-6 6h6" fill="none" stroke="${INK}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>` + cheeks(3);
      break;
    case 'startled':
      g = eye(-9.5, 5.4, 6.9, 0, 0, 1.9) + eye(9.5, 5.4, 6.9, 0, 0, 1.9) +
        brow('M-15.5 -13.5Q-10 -19 -4.2 -14.5') + brow('M4.2 -14.5Q10 -19 15.5 -13.5') +
        `<ellipse cx="0" cy="11" rx="3.4" ry="4.3" fill="${K}" stroke="${INK}" stroke-width="1.2"/><ellipse cx="0" cy="12.6" rx="2" ry="1.6" fill="#ff8f8f"/>` +
        `<path d="M19 -9q3 4 0 7q-3 -3 0 -7Z" fill="#bfe8ff" stroke="${INK}" stroke-width="1"/>`;
      break;
    case 'grin':
      g = eye(-9, 4.4, 5, 0, 0, 2.5) + eye(9, 4.4, 5, 0, 0, 2.5) +
        brow('M-14.5 -9.6Q-9 -12.4 -4.4 -9.2') + brow('M4.4 -9.2Q9 -12.4 14.5 -9.6') +
        `<path d="M-9 6.2Q0 8 9 6.2Q8 15 0 15Q-8 15 -9 6.2Z" fill="${K}" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/><path d="M-7.5 7.3Q0 8.6 7.5 7.3L7 10Q0 11 -7 10Z" fill="${W}"/>` + cheeks(3);
      break;
    case 'smug':
      g = `<ellipse cx="-9" cy="0" rx="4.6" ry="4.6" fill="${W}" stroke="${INK}" stroke-width="1.1"/><ellipse cx="9" cy="0" rx="4.6" ry="4.6" fill="${W}" stroke="${INK}" stroke-width="1.1"/>` +
        `<ellipse cx="-6.8" cy="1.2" rx="2.4" ry="2.8" fill="${K}"/><ellipse cx="11.2" cy="1.2" rx="2.4" ry="2.8" fill="${K}"/><circle cx="-7.6" cy=".1" r=".9" fill="#fff"/><circle cx="10.4" cy=".1" r=".9" fill="#fff"/>` +
        `<path d="M-14.2 -2.2Q-9 -6.4 -4.2 -2.2Z" fill="${body}" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/><path d="M4.2 -2.2Q9 -6.4 14.2 -2.2Z" fill="${body}" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/>` +
        brow('M-14.5 -8.4Q-9 -9.4 -4.2 -7.6') + brow('M4.4 -10.8Q10 -14.6 15 -11.6') +
        L('M-6 10.4Q2 13.6 11 7.6', INK, 1.7) + L('M11 7.6l1.8 -1.6', INK, 1.4) + cheeks(3);
      break;
    case 'dreamy':
      g = `<ellipse cx="-9" cy="0" rx="4.7" ry="5" fill="${W}" stroke="${INK}" stroke-width="1.1"/><ellipse cx="9" cy="0" rx="4.7" ry="5" fill="${W}" stroke="${INK}" stroke-width="1.1"/>` +
        `<ellipse cx="-8.4" cy="-1.6" rx="2.4" ry="2.9" fill="${K}"/><ellipse cx="9.6" cy="-1.6" rx="2.4" ry="2.9" fill="${K}"/><circle cx="-9.2" cy="-2.8" r=".95" fill="#fff"/><circle cx="8.8" cy="-2.8" r=".95" fill="#fff"/>` +
        `<path d="M-14.4 -1.2Q-9 -7.8 -4.2 -1.2Z" fill="${body}" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/><path d="M4.2 -1.2Q9 -7.8 14.4 -1.2Z" fill="${body}" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/>` +
        brow('M-14 -10Q-9 -13 -4 -10.4', 1.8) + brow('M4 -10.4Q9 -13 14 -10', 1.8) +
        `<ellipse cx="0" cy="10.6" rx="2.2" ry="2.5" fill="${K}" stroke="${INK}" stroke-width="1"/>` + cheeks(3);
      break;
    case 'happy':
      g = L('M-14 1Q-9 -6.4 -4 1', INK, 2.2) + L('M4 1Q9 -6.4 14 1', INK, 2.2) +
        brow('M-14.5 -8.6Q-9 -13 -4.4 -9.6', 1.9) + brow('M4.4 -9.6Q9 -13 14.5 -8.6', 1.9) +
        `<path d="M-8.5 6Q0 8 8.5 6Q8 15.5 0 15.5Q-8 15.5 -8.5 6Z" fill="${K}" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/><path d="M-4 12.2Q0 9.8 4 12.2Q2 15 0 15Q-2 15 -4 12.2Z" fill="#ff8f8f"/>` + cheeks(2);
      break;
    case 'fiery':
      g = eye(-9, 3.9, 4.2, .5, .8, 2.4) + eye(9, 3.9, 4.2, -.5, .8, 2.4) +
        L('M-15.5 -11.4L-4.2 -5.6', INK, 3) + L('M15.5 -11.4L4.2 -5.6', INK, 3) +
        `<path d="M-9.5 8.4L-6.5 11.2L-3.5 8.4L-.5 11.2L2.5 8.4L5.5 11.2L9.5 8.4L8 14.6Q0 17 -8 14.6Z" fill="${W}" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>` +
        `<path d="M19 -10q3.4 4.4 0 7.4q-3.4 -3 0 -7.4Z" fill="#bfe8ff" stroke="${INK}" stroke-width="1"/>` + cheeks(2);
      break;
    case 'wink':
      g = eye(-9, 4.4, 5.2, .6, -.6, 2.5) + L('M4.2 .6Q9 -4.6 14 .6', INK, 2.3) +
        brow('M-14.5 -10.6Q-9 -14.6 -4.4 -10.6') + brow('M4 -8.8Q9 -10.4 14.5 -8.4', 1.9) +
        L('M-5 8.6Q1 14 8 8', INK, 1.7) + `<path d="M6.5 9.6l4 -3.2" stroke="${INK}" stroke-width="1.2" stroke-linecap="round"/>` + cheeks(2);
      break;
    case 'bliss':
      g = L('M-14 1.4Q-9 6.6 -4 1.4', INK, 2.2) + L('M4 1.4Q9 6.6 14 1.4', INK, 2.2) + L('M-14.6 2.2l-1.6 -1.6M14.6 2.2l1.6 -1.6', INK, 1.3) +
        brow('M-14 -7Q-9 -10.6 -4.4 -7.4', 1.8) + brow('M4.4 -7.4Q9 -10.6 14 -7', 1.8) +
        `<path d="M-5 8.6Q0 14.6 5 8.6Q0 10.6 -5 8.6Z" fill="${K}" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>` + cheeks(2);
      break;
  }
  return `<g transform="translate(${f1(cx)} ${f1(cy)}) scale(${s})">${g}</g>`;
}

// ------------------------------------------------------------------ rim ornaments (shape cue besides colour)
function rimOrn(kind, c) {
  const lt = lighten(c, .66);
  let s = '';
  const N = { dashes: 20, waves: 14, dots: 24, stripes: 24, scallops: 18, zigzag: 20 }[kind] || 20;
  for (let i = 0; i < N; i++) {
    const a = i / N * 6.2832, x = Math.sin(a), y = -Math.cos(a), r = 44.2;
    const px = f1(x * r), py = f1(y * r), rot = f1(a * 57.2958);
    if (kind === 'dots') s += dot(px, py, 1.55, lt, .95);
    else if (kind === 'dashes') s += `<rect x="-.9" y="-2.7" width="1.8" height="5.4" rx=".9" fill="${lt}" transform="translate(${px} ${py}) rotate(${rot})"/>`;
    else if (kind === 'stripes') s += `<rect x="-.8" y="-2.8" width="1.6" height="5.6" fill="${lt}" opacity=".95" transform="translate(${px} ${py}) rotate(${f1(rot + 28)})"/>`;
    else if (kind === 'scallops') s += `<path d="M-2.8 1.4Q0 -3.2 2.8 1.4" fill="none" stroke="${lt}" stroke-width="1.5" stroke-linecap="round" transform="translate(${px} ${py}) rotate(${rot})"/>`;
    else if (kind === 'waves') s += `<path d="M-3 0q1.5 -2.6 3 0t3 0" fill="none" stroke="${lt}" stroke-width="1.4" stroke-linecap="round" transform="translate(${px} ${py}) rotate(${f1(rot + 90)})"/>`;
    else if (kind === 'zigzag') s += `<path d="M-2.5 -2l2.5 4l2.5 -4" fill="none" stroke="${lt}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" transform="translate(${px} ${py}) rotate(${rot})"/>`;
  }
  return s;
}
// plate seen from above: rim in the type colour, lighter well, ornament ring
function plateBase(type) {
  const T = TYPES[type], c = T.c, well = lighten(c, .42), well2 = lighten(c, .62);
  let s = '';
  s += `<circle cx="1.6" cy="3.2" r="49" fill="#2a120c" opacity=".22" filter="url(#kk-shadow)"/>`;
  s += `<circle r="49" fill="${c}" stroke="${INK}" stroke-width="1.8"/><circle r="49" fill="url(#kk-lit)" stroke="url(#kk-rim)" stroke-width="1.4"/>`;
  s += rimOrn(T.rim, c);
  s += `<circle r="39" fill="${darken(c, .22)}" opacity=".9"/>`;
  s += `<circle r="38" cx=".7" cy=".9" fill="${well}" stroke="${darken(c, .35)}" stroke-width="1.1"/>`;
  s += `<circle r="38" cx=".7" cy=".9" fill="url(#kk-well)"/>`;
  s += `<path d="M-30 -17Q-22 -30 -8 -34" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".55"/>`;
  s += `<circle r="31" cx=".7" cy=".9" fill="${well2}" opacity=".35"/>`;
  return s;
}

root.__KK = { ART: {}, INK, CREAM, CREAM2, WOOD, WOOD_D, FONT, NS, f1, esc, hash, rng, mix, lighten, darken, TYPES, ORDER, PLAYERS, defs, P, E, L, dot, star, blobPath, ringPts, face, rimOrn, plateBase };
})(typeof window !== 'undefined' ? window : globalThis);

/* HBKit - Hollowbough visual kit. Storybook watercolour, 100% procedural SVG. Plain script, global HBKit. */
(function (root) {
'use strict';
const INK = '#3b2f2a', PAPER = '#f6ecd6', PAPER2 = '#ecdcba';
const FONT = "'Palatino Linotype','Book Antiqua',Palatino,'Iowan Old Style','Hoefler Text',Georgia,'DejaVu Serif',serif";
const TYPES = {
  traveler:   { c: '#b98f55', t: '#e6d2a6', label: 'Traveler' },
  production: { c: '#5f8f4a', t: '#cfe0b4', label: 'Production' },
  destination:{ c: '#b04a38', t: '#ecc1b0', label: 'Destination' },
  governance: { c: '#46749f', t: '#bcd3e6', label: 'Governance' },
  prosperity: { c: '#7f5496', t: '#d9c4e4', label: 'Prosperity' }
};
const RES = { twig: '#8a6240', resin: '#e0a02c', pebble: '#8d949a', berry: '#c2364c' };
const PLAYER = [
  { name: 'ember', c: '#d2573c', d: '#8f3322', glyph: 'leaf' },
  { name: 'river', c: '#3d78b5', d: '#244d7d', glyph: 'drop' },
  { name: 'honey', c: '#e3b02e', d: '#9a7312', glyph: 'sun' },
  { name: 'moss',  c: '#4a9a6e', d: '#2a6446', glyph: 'star' },
  { name: 'automa',c: '#9a9a96', d: '#5f5f5c', glyph: 'moon' }
];
const NS = 'http://www.w3.org/2000/svg';
const f1 = n => (Math.round(n * 10) / 10);
function hash(s) { let h = 2166136261; s = String(s); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { let s = hash(seed) || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// shape helpers (inherit stroke from <g>); fill, optional opacity
const ell = (cx, cy, rx, ry, fill, o, extra) => `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${fill}"${o != null ? ` fill-opacity="${o}"` : ''}${extra || ''}/>`;
const rc = (x, y, w, h, fill, r, extra) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${fill}"${r ? ` rx="${r}"` : ''}${extra || ''}/>`;
const pg = (pts, fill, extra) => `<polygon points="${pts.map(f1).join(' ')}" fill="${fill}"${extra || ''}/>`;
const pa = (d, fill, extra) => `<path d="${d}" fill="${fill || 'none'}"${extra || ''}/>`;
const ln = (x1, y1, x2, y2, col, w) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${col || INK}" stroke-width="${w || .5}" stroke-linecap="round"/>`;
const NS0 = ' stroke="none"';
function blob(cx, cy, rx, ry, col, op, r) {
  const n = 9, P = []; for (let i = 0; i < n; i++) { const a = i / n * 6.2832, k = .82 + r() * .34; P.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); }
  const m = (a, b) => f1((a[0] + b[0]) / 2) + ' ' + f1((a[1] + b[1]) / 2);
  let d = 'M' + m(P[n - 1], P[0]); for (let i = 0; i < n; i++) d += `Q${f1(P[i][0])} ${f1(P[i][1])} ${m(P[i], P[(i + 1) % n])}`;
  return `<path d="${d}Z" fill="${col}" fill-opacity="${op}" stroke="none"/>`;
}
function wrap(str, max) {
  const out = []; String(str || '').split('\n').forEach(par => { let line = ''; par.split(/\s+/).forEach(w => { if (!w) return; if ((line + ' ' + w).trim().length > max && line) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); }); out.push(line); });
  return out;
}
// icons in 20x20 box (centre 10,10)
const ICON = {
  twig: () => `<g stroke="#4d3220" stroke-width=".9" stroke-linecap="round"><path d="M3 16 L17 4" stroke-width="2.6" stroke="#8a6240"/><path d="M3 16 L17 4" stroke-width=".7" stroke="#5c3d24"/><path d="M9 10.5 L7 5.5 M12.5 7.5 L16 9.5" stroke="#8a6240" stroke-width="1.6"/><path d="M4 12 L14 17" stroke="#a37a52" stroke-width="2.2"/></g>`,
  resin: () => `<path d="M10 2.5 C13 7 15.5 9.5 15.5 12.8 A5.5 5.5 0 0 1 4.5 12.8 C4.5 9.5 7 7 10 2.5Z" fill="#e8a826" stroke="#8a5a10" stroke-width=".9"/><path d="M7.4 11 C7.4 13 8 14 9 14.8" fill="none" stroke="#fff2b8" stroke-width="1.3" stroke-linecap="round"/>`,
  pebble: () => `<path d="M3 13 C2.5 8 6 4.5 10.5 5 C15 5.2 18 8.5 17 13 C16.5 15.5 13 16.5 9.5 16.5 C6 16.5 3.3 15.5 3 13Z" fill="#9ca3a8" stroke="#4e555a" stroke-width=".9"/><path d="M6 8.5 C7.5 6.8 10 6.4 11.5 6.8" fill="none" stroke="#e8edef" stroke-width="1.2" stroke-linecap="round"/><path d="M11 13 L13.5 11.5" stroke="#6d757a" stroke-width=".8"/>`,
  berry: () => `<g stroke="#6a1426" stroke-width=".8"><circle cx="7" cy="12.5" r="3.9" fill="#c9374f"/><circle cx="13.2" cy="12.2" r="3.9" fill="#d44458"/><circle cx="10" cy="7.8" r="3.9" fill="#bd2e47"/></g><path d="M10 4.6 C10.5 2.4 12.6 1.8 14.2 2.4 C13.6 4.2 12 4.9 10 4.6Z" fill="#6aa04c" stroke="#35602a" stroke-width=".7"/><circle cx="8.8" cy="6.6" r=".9" fill="#fff" fill-opacity=".7" stroke="none"/><circle cx="5.9" cy="11.2" r=".9" fill="#fff" fill-opacity=".7" stroke="none"/>`
};
const DEFS = `<defs>
<filter id="hb-wc" x="-6%" y="-6%" width="112%" height="112%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="3" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.5" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation=".9" result="b"/><feComposite in="d" in2="b" operator="arithmetic" k1="0" k2="1.35" k3="-.35" k4="0" result="e"/><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="2" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 .9  0 0 0 0 .9  0 0 0 0 .9  .5 0 0 0 .55" result="gg"/><feComposite in="e" in2="gg" operator="arithmetic" k1=".15" k2="1" k3="0" k4="0"/></filter>
<filter id="hb-wcl" x="-6%" y="-6%" width="112%" height="112%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="hb-ink" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="hb-paper" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="11" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .55  0 0 0 0 .42  0 0 0 0 .25  0 0 0 -.9 .62"/></filter>
<filter id="hb-fibre" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".012 .06" numOctaves="3" seed="5" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .45  0 0 0 0 .3  0 0 0 0 .15  0 0 0 -1.1 .62"/></filter>
<filter id="hb-bleed" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="3" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G" result="d"/><feGaussianBlur in="d" stdDeviation="5"/></filter>
<filter id="hb-shadow" x="-20%" y="-20%" width="150%" height="150%"><feGaussianBlur in="SourceAlpha" stdDeviation="1.6"/><feOffset dy="1.6"/><feComponentTransfer><feFuncA type="linear" slope=".38"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>`;
// ---------- scenes (100 x 62 art box) ----------
function scene(kind, key) {
  const r = rng('scene' + key); let s = '';
  const sky = { meadow: ['#d6ebe2', '#f7efc4'], autumn: ['#f4dfb6', '#f7c98e'], dusk: ['#ecc9c2', '#b99ac6'], night: ['#3e4b7c', '#59629a'], indoor: ['#ecd9b6', '#f6e6c4'], stone: ['#cbd5da', '#e3e6df'], winter: ['#dbe6ef', '#f2f5f7'] }[kind];
  s += rc(-2, -2, 104, 66, sky[0], 0, NS0);
  s += blob(30, 14, 40, 18, sky[1], .8, r) + blob(78, 8, 30, 14, sky[1], .6, r);
  if (kind === 'night') { s += `<circle cx="80" cy="12" r="6" fill="#f6ecc0" stroke="none"/><circle cx="82.5" cy="10.5" r="5" fill="#3e4b7c" stroke="none" fill-opacity=".35"/>`; for (let i = 0; i < 14; i++) s += `<circle cx="${f1(r() * 100)}" cy="${f1(r() * 26)}" r="${f1(.3 + r() * .5)}" fill="#fff3c8" stroke="none"/>`; }
  if (kind === 'meadow') s += `<circle cx="84" cy="11" r="5.5" fill="#fff0a0" fill-opacity=".85" stroke="none"/>`;
  if (kind === 'autumn') s += `<circle cx="16" cy="12" r="6" fill="#ffd9a0" fill-opacity=".8" stroke="none"/>`;
  if (kind === 'indoor') {
    s += rc(60, 7, 24, 22, '#bcdcec', 2, ' stroke-width=".7"') + ln(72, 7, 72, 29) + ln(60, 18, 84, 18) + blob(70, 16, 9, 6, '#fff', .35, r);
    s += rc(-2, 46, 104, 18, '#b88a58', 0, NS0) + blob(50, 52, 60, 7, '#cf9f6a', .8, r) + ln(0, 46, 100, 46, '#7a5434', .6);
    for (let i = 0; i < 6; i++) s += ln(i * 20 + 6, 46, i * 24 - 6, 62, '#8a6038', .35);
    s += rc(4, 12, 20, 2.4, '#8a6240', 0, ' stroke-width=".4"') + rc(7, 6, 3, 6, '#c2603f', 0, ' stroke-width=".3"') + rc(11, 8, 3, 4, '#5f8f6a', 0, ' stroke-width=".3"') + rc(15, 5, 3, 7, '#d6aa4a', 0, ' stroke-width=".3"');
    return s;
  }
  const hill = { meadow: ['#a9d08e', '#86b86d', '#6ea35c'], autumn: ['#e6ad62', '#cf8044', '#b86a38'], dusk: ['#8f99bb', '#6f8a98', '#587a62'], night: ['#34505a', '#2c4650', '#243a40'], stone: ['#9fb1b4', '#8a9d93', '#74866f'], winter: ['#e7eff5', '#d7e3ec', '#f6f9fb'] }[kind];
  s += blob(25, 40, 38, 11, hill[0], .85, r) + blob(78, 42, 34, 10, hill[0], .8, r);
  s += blob(50, 50, 62, 11, hill[1], .85, r);
  s += blob(50, 59, 66, 9, hill[2], .9, r);
  // distant trees
  const tc = kind === 'autumn' ? ['#d9843a', '#c2562f'] : kind === 'night' ? ['#233a3e'] : kind === 'winter' ? ['#b9c9d3'] : ['#7aa869', '#5f9560'];
  for (let i = 0; i < 4; i++) { const x = 6 + i * 27 + r() * 8, h = 9 + r() * 6; s += `<ellipse cx="${f1(x)}" cy="${f1(41 - h / 2)}" rx="${f1(4.5 + r() * 2)}" ry="${f1(h / 2 + 2)}" fill="${tc[i % tc.length]}" fill-opacity=".6" stroke="none"/>`; }
  // foreground tufts / flowers / leaves
  for (let i = 0; i < 9; i++) { const x = r() * 100, y = 52 + r() * 9; if (kind === 'meadow') s += `<circle cx="${f1(x)}" cy="${f1(y)}" r=".9" fill="${['#f7e9a0', '#f3b6c4', '#fff'][i % 3]}" stroke="none"/>`; else if (kind === 'autumn') s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="1.5" ry=".8" fill="${['#d9632d', '#e8a43a'][i % 2]}" fill-opacity=".9" stroke="none" transform="rotate(${f1(r() * 90)} ${f1(x)} ${f1(y)})"/>`; else if (kind === 'winter') s += `<circle cx="${f1(r() * 100)}" cy="${f1(r() * 50)}" r=".6" fill="#fff" stroke="none"/>`; s += `<path d="M${f1(x)} ${f1(y + 1.5)} q.5 -2 1.3 -2.6 M${f1(x)} ${f1(y + 1.5)} q-.4 -2 -1.2 -2.4" stroke="#4b7a45" stroke-opacity=".6" stroke-width=".4" fill="none"/>`; }
  return s;
}
// ---------- critters ----------
const eyes = (dx, y, rr, col) => [-1, 1].map(k => `<circle cx="${50 + k * dx}" cy="${y}" r="${rr}" fill="${col || INK}" stroke="none"/><circle cx="${50 + k * dx + .45}" cy="${y - .5}" r="${f1(rr * .35)}" fill="#fff" stroke="none"/>`).join('');
const whisk = (y) => [-1, 1].map(k => `<path d="M${50 + k * 5} ${y} l${k * 9} -1.5 M${50 + k * 5} ${y + 1} l${k * 9} 1.5" stroke="${INK}" stroke-width=".3" fill="none" stroke-opacity=".7"/>`).join('');
const SP = {
  mouse: { fur: '#bfa98d', belly: '#efe1c8', hand: '#e8b4a8',
    back: () => pa('M64 58 C78 58 82 46 74 40 C70 37 74 33 78 36', 'none', ' stroke="#d6a79d" stroke-width="2.2" stroke-linecap="round"') ,
    head: S => [-1, 1].map(k => ell(50 + k * 10, 17, 5.8, 5.8, S.fur) + ell(50 + k * 10, 17, 3.3, 3.3, '#eab2a8', null, NS0)).join('') + ell(50, 28, 11, 10, S.fur) + ell(50, 31.5, 5, 3.6, S.belly, null, NS0) + ell(50, 30, 1.7, 1.2, '#d98a8a') + eyes(4.6, 26, 1.2) + whisk(31) },
  squirrel: { fur: '#c47a3e', belly: '#f1dcb8', hand: '#f1dcb8',
    back: () => ell(74, 40, 9.5, 17, '#c47a3e', null, ' transform="rotate(22 74 40)"') + ell(74, 38, 4.5, 11, '#e9a864', .8, ' transform="rotate(22 74 40)"' + NS0),
    head: S => [-1, 1].map(k => pg([50 + k * 6, 20, 50 + k * 12, 18, 50 + k * 11.5, 11.5], S.fur) + pg([50 + k * 10.6, 17.8, 50 + k * 12, 12.2, 50 + k * 8.7, 18.5], '#e9a864', NS0)).join('') + ell(50, 28, 11, 10, S.fur) + ell(50, 31.5, 6, 4, S.belly, null, NS0) + ell(50, 30, 1.6, 1.2, '#4a2e22') + eyes(4.8, 26, 1.3) + `<path d="M48.5 33 q1.5 1.3 3 0" stroke="${INK}" stroke-width=".4" fill="none"/>` + ell(49, 35.5, 1.1, 1.8, '#fff', null, ' stroke-width=".3"') + ell(51, 35.5, 1.1, 1.8, '#fff', null, ' stroke-width=".3"') },
  hedgehog: { fur: '#7a5a42', belly: '#e8cfa6', hand: '#e8cfa6',
    back: () => { let d = 'M25 62'; for (let i = 0; i <= 14; i++) { const a = Math.PI + i / 14 * Math.PI, rx = 26, ry = 40; const r1 = i % 2 ? 1.14 : 1; d += `L${f1(50 + Math.cos(a) * rx * r1)} ${f1(58 + Math.sin(a) * ry * r1)}`; } return pa(d + 'L75 62Z', '#6a4c37'); },
    head: S => { let sp = ''; for (let i = 0; i < 6; i++) sp += pg([39 + i * 4.4, 20, 41 + i * 4.4, 13 + (i % 2) * 2, 43.2 + i * 4.4, 20], '#6a4c37', ' stroke-width=".4"'); return sp + ell(50, 28, 10.5, 9.5, '#e6c79c') + [-1, 1].map(k => ell(50 + k * 9, 21, 2.6, 2.6, '#e6c79c')).join('') + pa('M41 22 Q50 16 59 22 Q56 25 50 24 Q44 25 41 22Z', '#6a4c37', ' stroke-width=".4"') + ell(50, 32.5, 4, 3, '#f1dcb8', null, NS0) + ell(50, 31, 2, 1.5, '#2e211a') + eyes(4.4, 27, 1.2); } },
  frog: { fur: '#72b25c', belly: '#dcebaa', hand: '#8bc671',
    back: () => '',
    head: S => ell(50, 29.5, 13.5, 9.5, S.fur) + [-1, 1].map(k => ell(50 + k * 8, 20, 5.4, 5.4, S.fur) + ell(50 + k * 8, 19.6, 3.7, 3.7, '#fdf6d6') + ell(50 + k * 8, 19.8, 1.9, 1.9, INK, null, NS0) + `<circle cx="${50 + k * 8 + .6}" cy="19" r=".6" fill="#fff" stroke="none"/>`).join('') + `<path d="M39 32 Q50 40 61 32" stroke="${INK}" stroke-width=".6" fill="none"/>` + ell(50, 35.5, 8, 2.4, S.belly, .8, NS0) + `<circle cx="48" cy="27" r=".5" fill="${INK}" stroke="none"/><circle cx="52" cy="27" r=".5" fill="${INK}" stroke="none"/>` + ell(41, 29, 2.2, 1.5, '#f0a0a0', .5, NS0) + ell(59, 29, 2.2, 1.5, '#f0a0a0', .5, NS0) },
  owl: { fur: '#a47c54', belly: '#e9d5ae', hand: '#d6a850',
    back: () => '',
    head: S => [-1, 1].map(k => pg([50 + k * 4, 18.5, 50 + k * 12, 18, 50 + k * 11, 10], S.fur)).join('') + ell(50, 27.5, 12.5, 11, S.fur) + [-1, 1].map(k => `<circle cx="${50 + k * 5.4}" cy="27" r="5.6" fill="#f6e8c0"/><circle cx="${50 + k * 5.4}" cy="27" r="3.4" fill="#e8b23a" stroke-width=".4"/><circle cx="${50 + k * 5.4}" cy="27" r="1.8" fill="${INK}" stroke="none"/><circle cx="${50 + k * 5.4 + .7}" cy="26.2" r=".6" fill="#fff" stroke="none"/>`).join('') + pg([48.4, 30.4, 51.6, 30.4, 50, 35], '#e08a30', ' stroke-width=".5"') + ln(41, 38, 44, 35, '#7a5a3a', .4) + ln(59, 38, 56, 35, '#7a5a3a', .4) },
  badger: { fur: '#8a8784', belly: '#f1ede4', hand: '#5a5755',
    back: () => '',
    head: S => [-1, 1].map(k => ell(50 + k * 9.5, 19, 3.3, 3.3, '#4a4846') + ell(50 + k * 9.5, 19.4, 1.7, 1.7, '#f1ede4', null, NS0)).join('') + ell(50, 28.5, 11, 10.5, '#f1ede4') + [-1, 1].map(k => pa(`M${50 + k * 3} 19 Q${50 + k * 11.5} 22 ${50 + k * 9.5} 33 Q${50 + k * 5} 31 ${50 + k * 3} 19Z`, '#3d3b3a', NS0)).join('') + pa('M44 33 Q50 38 56 33 Q50 30 44 33Z', '#8a8784', NS0) + ell(50, 31.4, 2, 1.3, '#2a2524') + [-1, 1].map(k => `<circle cx="${50 + k * 5.2}" cy="26.5" r="1.1" fill="#fff" stroke="none"/><circle cx="${50 + k * 5.2}" cy="26.6" r=".7" fill="${INK}" stroke="none"/>`).join('') },
  rabbit: { fur: '#eadfce', belly: '#fbf5ea', hand: '#fbf5ea',
    back: () => '',
    head: S => [-1, 1].map(k => ell(50 + k * 6.5, 9, 3.8, 11.5, S.fur, null, ` transform="rotate(${k * 8} ${50 + k * 6.5} 20)"`) + ell(50 + k * 6.5, 9.5, 1.9, 8, '#efb7b0', null, ` transform="rotate(${k * 8} ${50 + k * 6.5} 20)"` + NS0)).join('') + ell(50, 28, 10.8, 10, S.fur) + ell(50, 31.5, 5, 3.6, S.belly, null, NS0) + `<path d="M48.6 30 L51.4 30 L50 31.7Z" fill="#e58a96" stroke-width=".4"/>` + eyes(4.8, 26, 1.2) + ell(42, 30, 2, 1.4, '#f0a0a0', .5, NS0) + ell(58, 30, 2, 1.4, '#f0a0a0', .5, NS0) + whisk(32) },
  mole: { fur: '#5e5652', belly: '#8a817b', hand: '#e0a7a0',
    back: () => '',
    head: S => [-1, 1].map(k => ell(50 + k * 9.5, 20, 2.6, 2.6, S.fur)).join('') + ell(50, 28.5, 11, 10, S.fur) + ell(50, 33.5, 5, 3.4, '#e0a7a0') + ell(50, 31.8, 2.2, 1.5, '#c97d80', null, ' stroke-width=".3"') + `<circle cx="45" cy="26.5" r=".9" fill="#111" stroke="none"/><circle cx="55" cy="26.5" r=".9" fill="#111" stroke="none"/>` + whisk(34) },
  beetle: { fur: '#3d4a3a', belly: '#6c8a6a', hand: '#3d4a3a',
    back: () => ell(50, 49, 21, 18, '#3e7b6c') + `<path d="M50 32 L50 66" stroke="${INK}" stroke-width=".6"/>` + `<path d="M36 40 Q40 36 45 37" stroke="#bfe6d8" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-opacity=".8"/>`,
    head: S => [-1, 1].map(k => `<path d="M${50 + k * 3} 21 Q${50 + k * 8} 8 ${50 + k * 13} 12" stroke="${INK}" stroke-width=".7" fill="none"/><circle cx="${50 + k * 13}" cy="12" r="1.1" fill="${INK}" stroke="none"/>`).join('') + ell(50, 27.5, 9.5, 8.5, '#47543f') + [-1, 1].map(k => `<circle cx="${50 + k * 4.2}" cy="26" r="2.4" fill="#f4efc8" stroke-width=".4"/><circle cx="${50 + k * 4.2 + .3}" cy="26.2" r="1.2" fill="${INK}" stroke="none"/>`).join('') + `<path d="M46 32 q4 3 8 0" stroke="${INK}" stroke-width=".5" fill="none"/>` },
  bat: { fur: '#6d5a7c', belly: '#c9b6d4', hand: '#6d5a7c',
    back: () => [-1, 1].map(k => pa(`M${50 + k * 9} 43 C${50 + k * 22} 28 ${50 + k * 36} 28 ${50 + k * 46} 36 C${50 + k * 42} 38 ${50 + k * 40} 41 ${50 + k * 38} 43 C${50 + k * 35} 41 ${50 + k * 33} 45 ${50 + k * 30} 48 C${50 + k * 26} 46 ${50 + k * 22} 50 ${50 + k * 16} 52Z`, '#8a73a0', ' fill-opacity=".92"') + `<path d="M${50 + k * 12} 44 L${50 + k * 40} 33 M${50 + k * 12} 46 L${50 + k * 30} 47" stroke="#4a3a58" stroke-width=".4" fill="none"/>`).join(''),
    head: S => [-1, 1].map(k => pg([50 + k * 4, 19, 50 + k * 11, 19, 50 + k * 10, 6.5], S.fur) + pg([50 + k * 6, 18, 50 + k * 9.4, 17.6, 50 + k * 9.2, 10.5], '#e9b8c9', NS0)).join('') + ell(50, 28, 10.5, 10, S.fur) + ell(50, 31.5, 5, 3.5, '#d8c6e0', null, NS0) + ell(50, 30, 1.6, 1.1, '#2a1f30') + eyes(4.6, 26, 1.3) + pg([48, 33.5, 49, 36, 50, 33.5], '#fff', ' stroke-width=".3"') },
  toad: { fur: '#938a58', belly: '#e0d6a0', hand: '#a79d68',
    back: () => '',
    head: S => ell(50, 29.5, 13.5, 9.8, S.fur) + [-1, 1].map(k => ell(50 + k * 8.5, 20.5, 5, 4.4, S.fur) + ell(50 + k * 8.5, 20.3, 3.3, 3, '#e6b83c') + `<ellipse cx="${50 + k * 8.5}" cy="20.4" rx="2.1" ry=".8" fill="${INK}" stroke="none"/>`).join('') + `<path d="M38.5 32 Q50 39 61.5 32" stroke="${INK}" stroke-width=".6" fill="none"/>` + ell(50, 35.5, 8, 2.2, S.belly, .8, NS0) + [[43, 26], [57, 27], [46, 31], [54, 24], [40, 30], [60, 31]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r=".9" fill="#6e6538" fill-opacity=".8" stroke="none"/>`).join('') + `<circle cx="48.4" cy="26.5" r=".5" fill="${INK}" stroke="none"/><circle cx="51.6" cy="26.5" r=".5" fill="${INK}" stroke="none"/>` },
  shrew: { fur: '#948878', belly: '#d9cdb6', hand: '#d9b9a4',
    back: () => `<path d="M64 58 C78 60 82 52 80 46" stroke="#b9a99a" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
    head: S => [-1, 1].map(k => ell(50 + k * 8.5, 19, 3.2, 3.2, S.fur) + ell(50 + k * 8.5, 19.2, 1.7, 1.7, '#e5b3a8', null, NS0)).join('') + pa('M39.5 26 C39 19 45 17 50 17 C55 17 61 19 60.5 26 C60 31 55 35 50 40 C45 35 40 31 39.5 26Z', S.fur) + pa('M44 33 Q50 38 56 33 Q50 41 44 33Z', S.belly, NS0) + ell(50, 39.2, 1.5, 1.2, '#d98a8a') + eyes(4.4, 26, 1.1) + whisk(35) },
  turtle: { fur: '#93b681', belly: '#d8e6b6', hand: '#93b681',
    back: () => ell(50, 51, 22, 17, '#6b8f52') + `<path d="M50 34 L50 68 M30 46 Q50 52 70 46 M33 58 Q50 52 67 58" stroke="#3e5a30" stroke-width=".6" fill="none"/>` + `<path d="M34 42 Q38 37 44 37" stroke="#cfe8b0" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-opacity=".8"/>`,
    head: S => ell(50, 28, 9.2, 9, S.fur) + eyes(4.1, 26.5, 1.2) + `<path d="M46.6 32 q3.4 2.4 6.8 0" stroke="${INK}" stroke-width=".6" fill="none"/>` + ell(41.5, 29, 1.8, 1.2, '#f0a0a0', .55, NS0) + ell(58.5, 29, 1.8, 1.2, '#f0a0a0', .55, NS0) },
  fox: { fur: '#dc7a3a', belly: '#fbf0dc', hand: '#4a342a',
    back: () => `<path d="M62 60 C82 62 88 44 78 34 C76 42 70 46 64 48Z" fill="#dc7a3a"/><path d="M78 34 C83 40 85 48 80 54 C84 48 82 40 78 34Z" fill="#fbf0dc" stroke="none"/>`,
    head: S => [-1, 1].map(k => pg([50 + k * 4.5, 19, 50 + k * 12, 19, 50 + k * 11, 8.5], S.fur) + pg([50 + k * 8, 17, 50 + k * 11.2, 16.8, 50 + k * 10.6, 11.4], '#4a342a', NS0)).join('') + pa('M39 26 C39 19 45 18 50 18 C55 18 61 19 61 26 C61 30 56 33 50 36 C44 33 39 30 39 26Z', S.fur) + pa('M39.6 29 Q46 30 50 36 Q43 35 39.6 29Z M60.4 29 Q54 30 50 36 Q57 35 60.4 29Z', S.belly, NS0) + ell(50, 35.6, 1.5, 1.1, '#2a1c16') + eyes(4.6, 26, 1.2) },
  pigeon: { fur: '#a1aab4', belly: '#d9dee3', hand: '#d9dee3',
    back: () => [-1, 1].map(k => pa(`M${50 + k * 12} 42 C${50 + k * 26} 40 ${50 + k * 32} 52 ${50 + k * 30} 60 C${50 + k * 22} 56 ${50 + k * 16} 54 ${50 + k * 12} 54Z`, '#8893a0')).join(''),
    head: S => ell(50, 28, 9.5, 9.2, S.fur) + pa('M42 36 Q50 41 58 36 Q57 40 50 41 Q43 40 42 36Z', '#5aa39a', ' fill-opacity=".9" stroke="none"') + pg([46.5, 29.6, 53.5, 29.6, 50, 35], '#e7a14a', ' stroke-width=".5"') + eyes(4.6, 26, 1.3, '#c4511f') }
};
const coatCol = { green: '#5f8f4a', brown: '#9a6a44', red: '#b8493a', blue: '#4a76a6', purple: '#7f5496', cream: '#efe2c4', grey: '#7d8590', black: '#3f3a40', yellow: '#dcae3e', teal: '#3f8f88', tan: '#c9a46a', orange: '#d67f3a' };
// hats (head top ~ y 18)
const HAT = {
  straw: () => ell(50, 19, 16, 3.4, '#e6c880') + pa('M39 19 Q40 8 50 8 Q60 8 61 19Z', '#efd48c') + rc(39.5, 15.5, 21, 2.6, '#c2503a', 0, NS0),
  crown: (c) => pg([39, 19, 38, 8, 44, 13, 50, 5, 56, 13, 62, 8, 61, 19], c || '#e8b930') + [38, 50, 62].map((x, i) => `<circle cx="${x}" cy="${i == 1 ? 5 : 8}" r="1.3" fill="#c2364c" stroke-width=".3"/>`).join('') + rc(39, 16.5, 22, 2.4, '#f6d86a', 0, ' stroke-width=".4"'),
  jester: () => pa('M38 20 Q30 14 28 6 Q36 8 46 14 Q50 4 50 -1 Q56 6 54 14 Q64 8 72 6 Q70 14 62 20 Z', '#c2493a') + pa('M50 14 Q56 8 54 14 Q64 8 72 6 Q70 14 62 20 L50 20Z', '#3f7fb0', NS0) + [[28, 6], [50, -1], [72, 6]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="2" fill="#f0c43a" stroke-width=".4"/>`).join('') + rc(38, 17.5, 24, 2.4, '#f0c43a', 0, ' stroke-width=".4"'),
  hood: (c) => pa('M36 34 C32 18 40 8 50 8 C60 8 68 18 64 34 C60 26 58 20 50 20 C42 20 40 26 36 34Z', c || '#7a5a3a'),
  helmet: () => pa('M38 20 Q38 8 50 8 Q62 8 62 20Z', '#d9a43a') + rc(36, 18.5, 28, 2.6, '#b88224', 1.2, ' stroke-width=".4"') + `<circle cx="50" cy="12" r="2.6" fill="#fff4b0"/>` + `<circle cx="50" cy="12" r="5" fill="#fff4b0" fill-opacity=".35" stroke="none"/>`,
  wig: () => [[36, 24], [34, 30], [64, 24], [66, 30], [41, 16], [50, 14], [59, 16]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="4.6" fill="#f4f1ec" stroke-width=".5"/>`).join(''),
  feather: () => pa('M38 19 Q40 9 52 10 Q60 10 62 19Z', '#4f8f5a') + pa('M52 11 Q64 2 68 8 Q62 6 56 12Z', '#d6563a', ' stroke-width=".4"') + rc(38, 17, 24, 2.4, '#e6c06a', 0, NS0),
  tophat: () => rc(40, 3, 20, 15, '#2f2a30', 1.5) + ell(50, 18, 15, 2.6, '#2f2a30') + rc(40, 13, 20, 2.6, '#7a4a8a', 0, NS0),
  mortar: () => pg([36, 14, 50, 8, 64, 14, 50, 20], '#2f2f3a') + rc(43, 15, 14, 4, '#2f2f3a', 0, NS0) + `<path d="M62 14 L63 24" stroke="#e0b030" stroke-width=".8"/><circle cx="63" cy="25" r="1.4" fill="#e0b030" stroke-width=".3"/>`,
  cap: (c) => pa('M38.5 20 Q38 10 50 10 Q62 10 61.5 20Z', c || '#c2713a') + pa('M36 20 Q44 24 54 20 L54 18.5 L38 18.5Z', c || '#c2713a'),
  postal: () => pa('M38.5 20 Q38 10 50 10 Q62 10 61.5 20Z', '#3d5f98') + pa('M37 20 Q45 25 62 20 L62 18 L38 18Z', '#2d4572') + `<circle cx="50" cy="14.5" r="2.2" fill="#f0c43a" stroke-width=".4"/>`,
  wander: () => ell(50, 19, 18, 3.4, '#8a6a46') + pa('M40 19 Q42 7 50 5 Q58 7 60 19Z', '#9a7a52') + rc(40, 15.5, 20, 2.6, '#c2503a', 0, NS0) + `<path d="M58 8 Q66 4 68 10 Q64 8 60 12Z" fill="#e8c24a" stroke-width=".4"/>`,
  bonnet: () => pa('M37 28 C34 14 44 10 50 10 C58 10 66 14 63 28 C60 20 56 18 50 18 C44 18 40 20 37 28Z', '#f0e6d0') + `<path d="M40 20 Q50 14 60 20" stroke="#7a4a8a" stroke-width="1.6" fill="none"/>`,
  monk: () => HAT.hood('#8a6a48'),
  doc: () => rc(40, 8, 20, 11, '#3a6f8a', 3) + `<circle cx="50" cy="13.5" r="3.2" fill="#e8f0f2" stroke-width=".5"/><path d="M50 11.5 v4 M48 13.5 h4" stroke="#c2364c" stroke-width=".9"/>`,
  none: () => ''
};
const PROP = {
  pitchfork: () => `<path d="M72 60 L72 28" stroke="#8a6240" stroke-width="1.2"/><path d="M68 32 Q68 26 72 26 Q76 26 76 32 M72 26 L72 22" stroke="#5a5a5e" stroke-width="1" fill="none"/>`,
  scales: () => `<path d="M72 56 L72 32 M63 34 L81 34" stroke="#8a6240" stroke-width="1"/>` + [63, 81].map(x => `<path d="M${x} 34 L${x - 4} 42 L${x + 4} 42Z" fill="#f0c43a" stroke-width=".4"/>`).join('') + `<circle cx="64" cy="55" r="3.4" fill="#e3b23e"/><circle cx="64" cy="55" r="1.4" fill="#b88224" stroke="none"/>`,
  lute: () => ell(70, 52, 7, 8.5, '#c2803a', null, ' transform="rotate(-25 70 52)"') + `<circle cx="69" cy="52" r="2" fill="#4a2e1c" stroke="none"/><path d="M72 46 L81 30" stroke="#6a4630" stroke-width="1.8"/><path d="M71 49 L80 33" stroke="#f5e8c0" stroke-width=".3"/>`,
  gavel: () => rc(70, 40, 12, 6, '#8a5a36', 1.5, ' transform="rotate(-30 76 43)"') + `<path d="M67 58 L75 44" stroke="#8a5a36" stroke-width="1.6" stroke-linecap="round"/>`,
  book: () => rc(62, 46, 17, 13, '#4a6fa0', 1.2, ' transform="rotate(-8 70 52)"') + `<path d="M64 48 h12 M64 51 h12" stroke="#f6ecd6" stroke-width=".6" transform="rotate(-8 70 52)"/>`,
  pick: () => `<path d="M72 60 L72 30" stroke="#8a6240" stroke-width="1.4" stroke-linecap="round"/><path d="M62 32 Q72 24 82 32 Q72 28 62 32Z" fill="#7d858c" stroke-width=".7"/>`,
  plans: () => rc(63, 48, 18, 11, '#f4ead0', 1, ' transform="rotate(-10 72 53)"') + `<path d="M65 52 h6 M65 55 l10 -1 M70 50 v7" stroke="#4a76a6" stroke-width=".5" transform="rotate(-10 72 53)"/>`,
  stick: () => `<path d="M73 62 L70 24" stroke="#7a5638" stroke-width="1.3" stroke-linecap="round"/><path d="M64 38 Q60 44 62 52 Q70 54 74 48 Q74 40 70 36Z" fill="#a8683c" stroke-width=".6"/>`,
  bow: () => `<path d="M70 28 Q84 44 70 62" stroke="#8a5a36" stroke-width="1.3" fill="none"/><path d="M70 28 L70 62" stroke="#f0e6d0" stroke-width=".3"/><path d="M60 45 L82 45" stroke="#6a4a2a" stroke-width=".6"/>`,
  letter: () => rc(62, 47, 16, 11, '#fbf4e0', 1, ' transform="rotate(-12 70 52)"') + `<path d="M62 47 L70 53 L78 47" stroke="${INK}" stroke-width=".5" fill="none" transform="rotate(-12 70 52)"/><circle cx="70" cy="53.5" r="1.5" fill="#c2364c" stroke="none" transform="rotate(-12 70 52)"/>`,
  ruler: () => `<rect x="64" y="22" width="2.6" height="38" fill="#e6c06a" transform="rotate(14 65 41)" stroke-width=".5"/>` + rc(60, 44, 16, 11, '#2f4a3a', 1) + `<path d="M62 48 h8 M62 51 h5" stroke="#f6ecd6" stroke-width=".5"/>`,
  bag: () => rc(62, 48, 15, 11, '#4a2e22', 2) + `<path d="M66 48 q3.5 -5 7 0" stroke="#4a2e22" stroke-width="1.2" fill="none"/><path d="M69.5 50 v7 M66 53.5 h7" stroke="#e8564a" stroke-width="1.4"/>`,
  shovel: () => `<path d="M72 60 L72 30" stroke="#8a6240" stroke-width="1.2"/><path d="M68 18 Q72 14 76 18 L76 28 Q72 31 68 28Z" fill="#7d858c" stroke-width=".7"/>`,
  candle: () => rc(65, 46, 5, 12, '#f4ead0', 1) + pa('M67.5 40 q3 4 0 6 q-3 -2 0 -6Z', '#f6a830', ' stroke-width=".4"') + `<circle cx="67.5" cy="43" r="6" fill="#ffd36a" fill-opacity=".3" stroke="none"/>`,
  bells: () => `<path d="M66 52 Q72 40 80 34" stroke="#8a5a36" stroke-width="1.2" fill="none"/><circle cx="80" cy="34" r="3" fill="#f0c43a" stroke-width=".5"/>`,
  broom: () => `<path d="M74 24 L66 58" stroke="#8a6240" stroke-width="1.2"/><path d="M62 58 L70 58 L72 66 L60 66Z" fill="#d0a24c" stroke-width=".5"/>`,
  carve: () => rc(63, 49, 11, 9, '#b98a5a', 1.5) + `<path d="M74 52 L82 46" stroke="#7d858c" stroke-width="1.2" stroke-linecap="round"/><path d="M66 49 q2 -5 5 -2 q-1 3 -2 3Z" fill="#d9b27a" stroke-width=".4"/>`,
  pack: () => rc(60, 36, 14, 18, '#a8683c', 3) + `<path d="M60 44 h14 M64 36 v18" stroke="#6a3f22" stroke-width=".6"/>` + rc(62, 30, 10, 7, '#c9a46a', 2),
  mug: () => rc(63, 49, 9, 10, '#e6b04a', 1.5) + `<path d="M72 51 q5 1 0 6" stroke="${INK}" stroke-width="1" fill="none"/>` + pa('M63 49 q4.5 -4 9 0', '#fff', ' stroke-width=".4"'),
  sickle: () => `<path d="M72 60 L72 38" stroke="#8a6240" stroke-width="1.2"/><path d="M72 38 Q84 32 78 24 Q80 32 72 34Z" fill="#a8b0b6" stroke-width=".6"/>` + `<path d="M62 56 L62 40 M60 56 L60 42 M64 56 L64 42" stroke="#d6aa4a" stroke-width=".8"/>`,
  scepter: () => `<path d="M72 60 L72 30" stroke="#e0b030" stroke-width="1.4"/><circle cx="72" cy="28" r="3.4" fill="#c2364c" stroke-width=".6"/>`,
  scroll: () => rc(63, 46, 14, 10, '#f4ead0', 3, ' transform="rotate(-8 70 51)"') + `<path d="M65 49 h10 M65 52 h8" stroke="#8a6240" stroke-width=".4" transform="rotate(-8 70 51)"/>`,
  none: () => ''
};
const EXTRA = {
  apron: () => pa('M42 44 L58 44 L60 62 L40 62Z', '#fbf6ea', ' stroke-width=".5"') + `<path d="M42 45 L40 41 M58 45 L60 41" stroke="${INK}" stroke-width=".4"/>`,
  glasses: () => [-1, 1].map(k => `<circle cx="${50 + k * 4.6}" cy="26.2" r="3.1" fill="#cfe8f0" fill-opacity=".45" stroke="#4a3a2a" stroke-width=".6"/>`).join('') + ln(47.6, 26, 52.4, 26, '#4a3a2a', .5),
  mirror: () => `<circle cx="50" cy="19.5" r="2.4" fill="#e8f0f2" stroke-width=".6"/><circle cx="50" cy="19.5" r=".8" fill="#9aa" stroke="none"/>`,
  bowtie: () => pg([46, 40, 50, 42, 46, 44, 50, 42, 54, 40, 54, 44, 50, 42], '#c2364c', ' stroke-width=".4"'),
  scarf: () => pa('M40 39 Q50 44 60 39 L60 42.5 Q50 47.5 40 42.5Z', '#c2493a', ' stroke-width=".5"') + rc(55, 41, 4, 8, '#c2493a', 0, ' stroke-width=".4"'),
  medal: () => `<circle cx="50" cy="46" r="2.4" fill="#f0c43a" stroke-width=".4"/><path d="M48 40 L50 46 L52 40" fill="#c2364c" stroke-width=".3"/>`,
  ermine: () => pa('M38 39 Q50 45 62 39 L62 44 Q50 50 38 44Z', '#f6f1e8', ' stroke-width=".5"') + [42, 48, 54, 60].map(x => `<circle cx="${x - 1}" cy="${44}" r=".7" fill="${INK}" stroke="none"/>`).join('')
};
const CRIT = {
  mouse_farmer:   ['mouse', 'meadow', 'green', 'straw', 'pitchfork', ['apron']],
  squirrel_shopkeeper: ['squirrel', 'indoor', 'brown', 'none', 'scales', ['apron']],
  hedgehog_bard:  ['hedgehog', 'dusk', 'purple', 'feather', 'lute', []],
  frog_judge:     ['frog', 'indoor', 'black', 'wig', 'gavel', ['bowtie']],
  owl_historian:  ['owl', 'indoor', 'brown', 'none', 'book', ['glasses']],
  badger_king:    ['badger', 'dusk', 'red', 'crown', 'scepter', ['ermine']],
  rabbit_queen:   ['rabbit', 'meadow', 'purple', 'crown', 'scepter', ['medal']],
  mole_miner:     ['mole', 'stone', 'tan', 'helmet', 'pick', []],
  beetle_architect: ['beetle', 'meadow', 'blue', 'cap', 'plans', ['glasses']],
  fox_wanderer:   ['fox', 'autumn', 'green', 'wander', 'stick', ['scarf']],
  shrew_ranger:   ['shrew', 'meadow', 'green', 'hood', 'bow', []],
  pigeon_postal:  ['pigeon', 'meadow', 'blue', 'postal', 'letter', []],
  turtle_teacher: ['turtle', 'indoor', 'teal', 'mortar', 'ruler', ['glasses']],
  bat_doctor:     ['bat', 'night', 'cream', 'doc', 'bag', ['mirror']],
  toad_undertaker:['toad', 'dusk', 'black', 'tophat', 'shovel', []],
  hedgehog_monk:  ['hedgehog', 'indoor', 'brown', 'monk', 'candle', []],
  mouse_fool:     ['mouse', 'dusk', 'yellow', 'jester', 'bells', []],
  shrew_sweeper:  ['shrew', 'autumn', 'grey', 'cap', 'broom', ['apron']],
  squirrel_woodcarver: ['squirrel', 'autumn', 'tan', 'cap', 'carve', ['apron']],
  rabbit_peddler: ['rabbit', 'meadow', 'orange', 'wander', 'pack', []],
  frog_innkeeper: ['frog', 'indoor', 'red', 'none', 'mug', ['apron']],
  badger_harvester:['badger', 'autumn', 'orange', 'straw', 'sickle', []],
  owl_judge:      ['owl', 'indoor', 'black', 'wig', 'scroll', []],
  fox_peddler:    ['fox', 'autumn', 'blue', 'cap', 'pack', ['scarf']],
  mole_historian: ['mole', 'indoor', 'grey', 'none', 'scroll', ['glasses']],
  bat_bard:       ['bat', 'night', 'red', 'feather', 'lute', []],
  turtle_monk:    ['turtle', 'stone', 'brown', 'monk', 'candle', []],
  toad_shopkeeper:['toad', 'indoor', 'green', 'bonnet', 'scales', ['apron']],
  beetle_woodcarver:['beetle', 'autumn', 'tan', 'none', 'carve', ['apron']],
  pigeon_ranger:  ['pigeon', 'winter', 'green', 'hood', 'bow', []],
  mouse_queen:    ['mouse', 'dusk', 'blue', 'crown', 'scepter', ['medal']],
  hedgehog_farmer:['hedgehog', 'autumn', 'green', 'straw', 'sickle', []]
};
function critter(key) {
  const [sp, bg, coat, hat, prop, ex] = CRIT[key], S = SP[sp], c = coatCol[coat];
  let s = scene(bg, key);
  s += ell(50, 61, 26, 3.4, '#2f3a2a', .18, NS0); // ground shadow
  if (ex.includes('ermine') || hat === 'crown') s += pa('M34 63 C32 46 38 38 50 38 C62 38 68 46 66 63Z', '#9c3a34', ' transform="translate(0 0) scale(1)"');
  s += S.back();
  const arm = k => ell(50 + k * 15, 51, 4.2, 6.8, c, null, ` transform="rotate(${k * -14} ${50 + k * 15} 51)"`);
  s += arm(-1);
  s += pa('M35 63 C34 48 39 39.5 50 39.5 C61 39.5 66 48 65 63Z', c);
  if (coat !== 'cream' && coat !== 'black') s += pa('M44 40.5 Q50 46 56 40.5', 'none', ' stroke="#fff" stroke-opacity=".45" stroke-width=".8"');
  s += `<path d="M50 41 L50 62" stroke="#000" stroke-opacity=".18" stroke-width=".5"/>` + `<circle cx="50" cy="47" r=".9" fill="#f0e2b8" stroke="none"/><circle cx="50" cy="53" r=".9" fill="#f0e2b8" stroke="none"/>`;
  ex.forEach(e => { if (e === 'apron') s += EXTRA.apron(); });
  s += S.head(S);
  ex.forEach(e => { if (e !== 'apron' && EXTRA[e]) s += EXTRA[e](); });
  s += (HAT[hat] || HAT.none)();
  s += arm(1).replace(/fill="[^"]+"/, `fill="${c}"`);
  s += ell(66.5, 56, 2.6, 2.6, S.hand, null, ' stroke-width=".4"');
  s += (PROP[prop] || PROP.none)();
  return s;
}
// ---------- constructions ----------
const box = (x, y, w, h, c, extra) => rc(x, y, w, h, c, 0, extra);
const roof = (x, y, w, h, c) => pg([x - 2, y + h, x + w / 2, y, x + w + 2, y + h], c);
const win = (x, y, w, h, c) => pa(`M${f1(x)} ${f1(y + h)} V${f1(y + w / 2)} A${f1(w / 2)} ${f1(w / 2)} 0 0 1 ${f1(x + w)} ${f1(y + w / 2)} V${f1(y + h)}Z`, c || '#ffe39a', ' stroke-width=".4"');
const door = (x, y, w, h, c) => pa(`M${f1(x)} ${f1(y + h)} V${f1(y + w / 2)} A${f1(w / 2)} ${f1(w / 2)} 0 0 1 ${f1(x + w)} ${f1(y + w / 2)} V${f1(y + h)}Z`, c || '#7a4a2c', ' stroke-width=".5"') + `<circle cx="${f1(x + w * .8)}" cy="${f1(y + h * .6)}" r=".5" fill="#f0c43a" stroke="none"/>`;
const tree = (x, y, s, c, t) => rc(x - .8 * s, y - 2 * s, 1.6 * s, 2.2 * s, '#7a5638', 0, ' stroke-width=".4"') + ell(x, y - 4.6 * s, 3.6 * s, 4.4 * s, c || '#6aa05a') + ell(x - 1 * s, y - 5.4 * s, 1.5 * s, 1.8 * s, '#fff', .18, NS0);
const smoke = (x, y, r) => [0, 1, 2].map(i => `<circle cx="${x + i * 2.2}" cy="${y - i * 4}" r="${2 + i * 1.1}" fill="#fff" fill-opacity=".55" stroke="none"/>`).join('');
const stones = (x, y, w, h, c) => { let s = box(x, y, w, h, c); const r = rng('st' + x + y); for (let j = 0; j < h / 3.5; j++) for (let i = 0; i < w / 5; i++) s += `<rect x="${f1(x + i * 5 + (j % 2) * 2.5)}" y="${f1(y + j * 3.5)}" width="5" height="3.5" fill="none" stroke="#000" stroke-opacity=".12" stroke-width=".3"/>`; return s; };
const battle = (x, y, w, c) => { let s = ''; const n = Math.floor(w / 4); for (let i = 0; i < n; i++) s += box(x + i * (w / n), y - 2.4, w / n * .62, 2.6, c, ' stroke-width=".4"'); return s; };
const flag = (x, y, c) => `<path d="M${x} ${y} v-9" stroke="${INK}" stroke-width=".5"/>` + pg([x, y - 9, x + 6, y - 7, x, y - 5], c || '#c2493a', ' stroke-width=".4"');
const barrel = (x, y, s) => ell(x, y, 3.2 * s, 3.8 * s, '#b07a44') + `<path d="M${x - 3.1 * s} ${y - 1.2 * s} q${3.1 * s} 1.4 ${6.2 * s} 0 M${x - 3.1 * s} ${y + 1.2 * s} q${3.1 * s} 1.4 ${6.2 * s} 0" stroke="#5a3a1e" stroke-width=".5" fill="none"/>`;
const gold = '#e6b83a';
const CONS = {
  farm: ['meadow', () => { let s = ''; for (let i = 0; i < 6; i++) s += pg([4 + i * 2, 54 - i * 1.5 + 6, 52 + i * 3, 54 - i * 1.5 + 6, 54 + i * 3, 56 - i * 1.5 + 6, 2 + i * 2, 56 - i * 1.5 + 6].map((v, k) => k % 2 ? v - 5 : v), i % 2 ? '#c9a24a' : '#d8b95c', ' stroke-width=".3"'); s += box(56, 30, 26, 20, '#c2493a') + roof(56, 20, 26, 12, '#8a3a2c') + door(65, 38, 8, 12, '#f0e2c0') + `<path d="M65 38 L73 50 M73 38 L65 50" stroke="#8a3a2c" stroke-width=".5"/>` + win(61, 24, 4, 4, '#f6ecd6'); for (let i = 0; i < 7; i++) s += `<path d="M${8 + i * 6} 53 q-1 -5 .5 -8 M${8 + i * 6} 53 q2 -4 1 -7" stroke="#e0b030" stroke-width=".7" fill="none"/>`; s += `<path d="M40 52 L40 38 M34 42 L46 42" stroke="#6a4a2a" stroke-width="1"/>` + ell(40, 36, 2.6, 2.6, '#e6c88a') + pg([36, 44, 44, 44, 45, 50, 35, 50], '#6a8fb0', ' stroke-width=".4"'); return s; }],
  mine: ['stone', () => blob(50, 40, 44, 22, '#8a7766', .95, rng('mn')) + pa('M12 62 Q14 30 50 24 Q86 30 88 62Z', '#8f7b68') + pa('M34 56 V40 Q50 28 66 40 V56Z', '#2b2220') + box(32, 38, 3, 20, '#8a6240', ' stroke-width=".4"') + box(65, 38, 3, 20, '#8a6240', ' stroke-width=".4"') + box(30, 36, 40, 3.6, '#a37a52', ' stroke-width=".4"') + `<path d="M50 38 v6" stroke="${INK}" stroke-width=".4"/>` + `<circle cx="50" cy="46" r="2.4" fill="#ffd36a"/><circle cx="50" cy="46" r="6" fill="#ffd36a" fill-opacity=".25" stroke="none"/>` + [[16, 50], [24, 44], [78, 48], [84, 54]].map(p => ell(p[0], p[1], 4, 3, '#a9a39a', null, ' stroke-width=".4"')).join('') + `<path d="M62 58 L82 58 L80 66 L64 66Z" fill="#6a5a50" stroke-width=".6" transform="translate(-4 -6)"/>` + [[64, 49], [69, 48], [74, 49]].map(p => ell(p[0], p[1], 3, 2.4, '#9ca3a8', null, ' stroke-width=".4"')).join('') + `<circle cx="64" cy="61" r="2" fill="#4a3a30"/><circle cx="76" cy="61" r="2" fill="#4a3a30"/>`],
  refinery: ['autumn', () => box(14, 34, 34, 22, '#a3a09a') + roof(12, 24, 38, 10, '#8a4a3a') + door(26, 42, 8, 14) + box(40, 14, 6, 16, '#8a5a46') + smoke(44, 12) + `<path d="M58 36 Q58 62 72 62 Q86 62 86 36Z" fill="#4a4448"/>` + box(56, 33, 32, 3, '#6a6468') + pa('M60 36 Q72 41 84 36 Q72 33 60 36Z', '#e8a826', NS0) + `<path d="M64 41 q1 6 0 12 M78 41 q-1 6 0 12" stroke="#e8a826" stroke-width="1.2" fill="none" stroke-linecap="round"/>` + `<path d="M72 33 q-2 -4 0 -7 q2 3 0 7Z" fill="#e8a826" stroke-width=".4"/>` + barrel(52, 56, 1.1) + ell(90, 58, 3, 3, '#e8a826', .9, ' stroke-width=".4"') + `<path d="M14 62 Q50 66 86 62" stroke="#e8a826" stroke-width="1.4" fill="none" stroke-opacity=".6"/>`],
  barge: ['meadow', () => rc(-2, 44, 104, 20, '#8bbbd0', 0, NS0) + [0, 1, 2, 3, 4].map(i => `<path d="M${6 + i * 22} ${50 + (i % 2) * 6} q4 -3 8 0 q4 3 8 0" stroke="#fff" stroke-width=".7" fill="none" stroke-opacity=".8"/>`).join('') + pa('M12 42 L88 42 L80 56 L20 56Z', '#9a6a40') + `<path d="M16 46 L84 46" stroke="#5a3a1e" stroke-width=".5"/>` + [0, 1, 2, 3, 4, 5].map(i => `<path d="M${24 + i * 9} ${40 - (i % 3)} l-8 -${10 + (i % 2) * 3} M${26 + i * 8} 41 l-6 -9" stroke="#7a5230" stroke-width="2.2" stroke-linecap="round"/>`).join('') + rc(24, 30, 52, 2, '#c9a46a', 0, ' stroke-width=".4"' ) + `<path d="M84 44 L96 20" stroke="#6a4a2a" stroke-width="1.2"/><path d="M60 58 q10 4 20 0" stroke="#fff" stroke-width=".8" fill="none" stroke-opacity=".7"/>`],
  store: ['meadow', () => box(20, 28, 60, 28, '#e8c98f') + roof(18, 18, 64, 10, '#8a4a3a') + [0, 1, 2, 3, 4, 5].map(i => pa(`M${22 + i * 9.2} 30 h9.2 v6 q-4.6 4 -9.2 0Z`, i % 2 ? '#f6ecd6' : '#c2493a', ' stroke-width=".4"')).join('') + door(46, 40, 9, 16) + box(24, 40, 17, 10, '#cfe8f0', ' stroke-width=".5"') + box(60, 46, 14, 10, '#b98a5a') + [64, 68, 72].map((x, i) => `<circle cx="${x}" cy="${45}" r="2.4" fill="${['#c9374f', '#e8a826', '#6aa04c'][i]}" stroke-width=".4"/>`).join('') + `<path d="M82 24 V38" stroke="${INK}" stroke-width=".6"/>` + `<circle cx="82" cy="40" r="3.6" fill="#e3b23e"/><circle cx="82" cy="40" r="1.4" fill="#b88224" stroke="none"/>`],
  inn: ['dusk', () => box(18, 30, 64, 28, '#d9a86a') + box(18, 30, 64, 4, '#b88a4a', ' stroke-width=".3"') + roof(14, 14, 72, 16, '#8a3a2c') + box(66, 8, 7, 12, '#8a5a46') + smoke(69, 8) + [0, 1, 2].map(i => win(26 + i * 15, 36, 8, 10) + win(26 + i * 15, 17.5, 0.01, 0.01)).join('') + door(68, 42, 9, 16) + win(58, 20, 7, 8, '#ffd36a') + win(30, 20, 7, 8, '#ffd36a') + `<path d="M50 30 V37" stroke="${INK}" stroke-width=".5"/>` + rc(46, 37, 8, 7, '#e6b04a', 1.2) + `<path d="M46 40 q-3 1 0 3" stroke="${INK}" stroke-width=".6" fill="none"/>`],
  chapel: ['meadow', () => box(30, 32, 40, 24, '#e8e0d0') + roof(28, 22, 44, 10, '#6a5a78') + box(44, 12, 12, 24, '#efe6d6') + pg([42, 14, 50, 0, 58, 14], '#6a5a78') + `<circle cx="50" cy="9" r="0.001"/>` + `<path d="M50 -6 V2 M47 -3 H53" stroke="${INK}" stroke-width=".8"/>` + win(46.5, 18, 7, 9, '#2f2a44') + `<circle cx="50" cy="42" r="4" fill="#f0c4d8" stroke-width=".5"/><path d="M50 38 v8 M46 42 h8" stroke="#6a8fb0" stroke-width=".5"/>` + door(44, 44, 12, 12) + tree(20, 56, 1.4) + tree(82, 56, 1.1, '#7aa869')],
  monastery: ['stone', () => box(8, 36, 52, 20, '#d8cdb4') + [0, 1, 2, 3, 4, 5].map(i => pa(`M${10 + i * 8.5} 56 V46 a4 4 0 0 1 8 0 V56Z`, '#6a5a48', ' stroke-width=".4"')).join('') + roof(6, 28, 56, 8, '#a8603c') + box(62, 16, 16, 40, '#e0d4ba') + roof(60, 6, 20, 10, '#a8603c') + win(67, 22, 6, 9, '#2f2a44') + win(67, 36, 6, 9, '#ffd36a') + `<path d="M70 -2 v8 M67 1 h6" stroke="${INK}" stroke-width=".7"/>` + box(80, 44, 16, 12, '#7aa869', ' stroke-width=".4"') + [84, 90].map(x => tree(x, 44, .7, '#4f8f5a')).join('')],
  palace: ['dusk', () => box(8, 34, 84, 22, '#efe6d2') + box(34, 24, 32, 32, '#f6eedb') + pa('M34 24 Q50 -2 66 24Z', gold) + `<path d="M50 -4 V4" stroke="${INK}" stroke-width=".6"/>` + flag(50, 4, '#c2364c') + [14, 22, 72, 80].map(x => box(x - 3, 24, 6, 32, '#e6dcc6', ' stroke-width=".4"') + pg([x - 4, 24, x, 14, x + 4, 24], '#8a8fc0')).join('') + [0, 1, 2].map(i => win(40 + i * 8, 36, 5, 10, '#ffd36a')).join('') + door(46, 44, 8, 12, '#7a4a2c') + [-1, 0, 1, 2, 3].map(i => box(36 + i * 6, 56, 8, 2, '#d9ceb6', ' stroke-width=".3"')).join('') + [14, 22, 72, 80].map(x => win(x - 1.4, 34, 3, 6, '#ffd36a')).join('')],
  castle: ['stone', () => stones(24, 28, 52, 30, '#aeb4b4') + battle(24, 28, 52, '#aeb4b4') + [10, 74].map(x => stones(x, 14, 16, 44, '#bcc0bc') + battle(x, 14, 16, '#bcc0bc') + win(x + 6, 24, 4, 8, '#2f2a44')).join('') + pa('M42 58 V42 Q50 32 58 42 V58Z', '#3a2f2c') + [43.5, 47, 50.5, 54].map(x => `<path d="M${x} 38 V58" stroke="#6a5a50" stroke-width=".5"/>`).join('') + flag(18, 14, '#c2364c') + flag(82, 14, '#3d78b5') + win(48, 33, 4, 6, '#ffd36a')],
  theatre: ['indoor', () => rc(10, 8, 80, 52, '#8a2f3c', 0, ' stroke-width=".6"') + pa('M10 8 Q50 22 90 8 V16 Q50 30 10 16Z', '#b0414e') + pa('M10 8 Q22 30 24 60 H10Z', '#a23a46', ' stroke-width=".6"') + pa('M90 8 Q78 30 76 60 H90Z', '#a23a46', ' stroke-width=".6"') + rc(10, 52, 80, 10, '#a8703c', 0, ' stroke-width=".5"') + ell(50, 44, 18, 6, '#ffe8a0', .35, NS0) + `<path d="M34 20 Q50 12 66 20" stroke="${gold}" stroke-width="1.2" fill="none"/>` + `<g transform="translate(40 36)"><circle r="5.4" fill="#f6ecd6" stroke-width=".5"/><path d="M-3 -1 q1.4 -1.4 2.8 0 M1 -1 q1.4 -1.4 2.8 0 M-3 2 q3 3 6 0" stroke="${INK}" stroke-width=".6" fill="none"/></g><g transform="translate(60 36)"><circle r="5.4" fill="#d9c2a0" stroke-width=".5"/><path d="M-3 -1 q1.4 -1.4 2.8 0 M1 -1 q1.4 -1.4 2.8 0 M-3 3 q3 -3 6 0" stroke="${INK}" stroke-width=".6" fill="none"/></g>`],
  school: ['meadow', () => box(20, 30, 60, 26, '#d96b52') + roof(18, 20, 64, 10, '#6a5a50') + box(44, 10, 12, 14, '#f0e2c0') + pg([43, 12, 50, 4, 57, 12], '#6a5a50') + `<path d="M50 14 q-3 5 0 8 q3 -3 0 -8Z" fill="${gold}" stroke-width=".4"/>` + [0, 1, 2].map(i => win(24 + i * 8, 36, 5, 9)).join('') + [0, 1].map(i => win(60 + i * 8, 36, 5, 9)).join('') + door(45, 40, 10, 16) + rc(24, 47, 6, 4, '#6a8fb0', 0, ' stroke-width=".3"') + `<g transform="translate(70 44)" font-family="${FONT}" font-size="5" font-weight="700" fill="#f6ecd6" stroke="none"><rect x="-8" y="-2" width="16" height="10" fill="#2f4a3a" stroke="${INK}" stroke-width=".4"/><text x="0" y="5" text-anchor="middle">ABC</text></g>`.replace('translate(70 44)', 'translate(14 50)')],
  museum: ['meadow', () => pg([10, 28, 50, 8, 90, 28], '#efe6d2') + rc(10, 28, 80, 4, '#d9ceb6', 0) + [0, 1, 2, 3, 4].map(i => box(16 + i * 15, 32, 6, 22, '#f6eedb', ' stroke-width=".4"')).join('') + box(8, 54, 84, 4, '#d9ceb6') + box(4, 58, 92, 4, '#c9bea6') + `<circle cx="50" cy="22" r="3.6" fill="${gold}" stroke-width=".5"/>` + `<path d="M46 22 h8 M50 18 v8" stroke="${INK}" stroke-width=".4"/>` + ell(34, 46, 5, 6, '#cf8f50', null, ' stroke-width=".5"') + `<path d="M66 40 q4 -8 8 0 q-2 8 -4 8 q-4 -2 -4 -8Z" fill="#e6dcc6" stroke-width=".5"/>`],
  university: ['dusk', () => stones(24, 24, 52, 34, '#c4b49a') + [8, 76].map(x => stones(x, 16, 16, 42, '#d3c4a8') + pg([x - 1, 16, x + 8, 4, x + 17, 16], '#46749f') + win(x + 5, 24, 6, 12, '#ffd36a')).join('') + pg([34, 24, 50, 2, 66, 24], '#46749f') + `<circle cx="50" cy="16" r="5" fill="#f6ecd6" stroke-width=".5"/><path d="M50 12 v4 h3" stroke="${INK}" stroke-width=".5" fill="none"/>` + flag(50, 2, '#c2364c') + door(44, 42, 12, 16) + [30, 66].map(x => win(x, 34, 6, 10, '#ffd36a')).join('') + `<path d="M40 40 h20" stroke="${gold}" stroke-width=".8"/>`],
  cemetery: ['night', () => rc(0, 48, 100, 16, '#27403e', 0, NS0) + [[14, 50, 1], [34, 54, 1.1], [62, 52, .9], [84, 54, 1.1]].map((g, i) => pa(`M${g[0] - 5 * g[2]} ${g[1] + 8} V${g[1]} a${5 * g[2]} ${5 * g[2]} 0 0 1 ${10 * g[2]} 0 V${g[1] + 8}Z`, '#a9b0ae') + (i % 2 ? `<path d="M${g[0]} ${g[1] - 3} v5 M${g[0] - 2} ${g[1]} h4" stroke="#6a706e" stroke-width=".6"/>` : `<path d="M${g[0] - 2} ${g[1] - 1} q2 -2 4 0" stroke="#6a706e" stroke-width=".5" fill="none"/>`)).join('') + `<path d="M4 50 V30 M4 30 q22 -16 44 0" stroke="#2a2a2e" stroke-width="1.4" fill="none"/>` + `<g stroke="#2a2a2e" stroke-width=".5">${[8, 14, 20, 26, 32, 38, 44].map(x => `<path d="M${x} 50 V${34 - Math.sin((x - 4) / 44 * 3.14) * 6}"/>`).join('')}</g>` + `<path d="M82 52 V28 M82 30 q-10 8 -8 24 M82 30 q8 6 10 24 M82 32 q-4 10 -2 20" stroke="#4a6a4a" stroke-width="1.6" fill="none" stroke-linecap="round"/>` + [[74, 38], [76, 46], [90, 40], [88, 48]].map(p => ell(p[0], p[1], 1, 3, '#6a9a62', .9, NS0)).join('') + `<circle cx="56" cy="40" r="1.4" fill="#fff6b0" stroke="none"/><circle cx="56" cy="40" r="4" fill="#fff6b0" fill-opacity=".25" stroke="none"/>`],
  ruins: ['stone', () => stones(14, 36, 20, 22, '#b3ad9e') + pa('M14 36 V28 L20 30 L24 24 L30 30 L34 28 V36Z', '#b3ad9e') + [48, 62].map((x, i) => box(x, 22 + i * 12, 7, 36 - i * 12, '#cfc8b6', ' stroke-width=".5"') + box(x - 1, 22 + i * 12, 9, 3, '#bdb6a4', ' stroke-width=".4"')).join('') + pa('M62 40 l8 -2 l1 7 l-6 3Z', '#cfc8b6') + [[76, 54], [84, 56], [70, 58]].map(p => ell(p[0], p[1], 4, 2.6, '#a9a396', null, ' stroke-width=".4"')).join('') + `<path d="M14 40 q4 6 2 12 M52 24 q-4 8 0 16 M66 44 q4 4 2 12 M24 34 q6 2 8 8" stroke="#5f9560" stroke-width="1.8" fill="none" stroke-linecap="round"/>` + [[16, 46], [53, 32], [67, 50], [28, 38]].map(p => ell(p[0], p[1], 2, 1.2, '#6aa860', .95, NS0)).join('') + `<circle cx="26" cy="52" r="1.2" fill="#f3b6c4" stroke="none"/>`],
  postoffice: ['meadow', () => box(24, 30, 48, 26, '#7fa4c8') + roof(22, 18, 52, 12, '#4a6a98') + door(42, 40, 10, 16, '#f0e2c0') + `<circle cx="47" cy="46" r="0.01"/>` + win(28, 36, 6, 8) + win(62, 36, 6, 8) + rc(78, 38, 8, 14, '#c2364c', 2) + `<path d="M80 41 h4" stroke="${INK}" stroke-width=".8"/>` + `<path d="M78 52 v6 M86 52 v6" stroke="#6a4a2a" stroke-width="1"/>` + rc(36, 21, 22, 6, '#f6ecd6', 1, ' stroke-width=".4"') + `<path d="M36 21 L47 25 L58 21" fill="none" stroke="${INK}" stroke-width=".4"/>` + ell(20, 58, 5, 3.2, '#a1aab4', null, ' stroke-width=".4"') + `<circle cx="16" cy="55" r="2.4" fill="#a1aab4" stroke-width=".4"/><path d="M13.6 55 l-2 .6 l2 .6Z" fill="#e7a14a" stroke="none"/>` + rc(22, 54, 4, 3, '#fbf4e0', 0, ' stroke-width=".3"')],
  fairground: ['dusk', () => pg([24, 40, 50, 12, 76, 40], '#c2493a') + [0, 1, 2, 3].map(i => pg([24 + i * 13, 40, 50, 12, 37 + i * 13, 40], i % 2 ? '#f6ecd6' : '#c2493a', ' stroke-width=".3"')).join('') + box(24, 40, 52, 16, '#efe0c0') + `<path d="M24 40 q6.5 5 13 0 q6.5 5 13 0 q6.5 5 13 0 q6.5 5 13 0" fill="#c2493a" stroke-width=".4"/>` + flag(50, 14, '#f0c43a') + `<path d="M4 20 Q50 34 96 20" stroke="${INK}" stroke-width=".5" fill="none"/>` + [12, 26, 40, 60, 74, 88].map((x, i) => pg([x - 2, 24 + Math.sin(i) * 2, x + 2, 24 + Math.sin(i) * 2, x, 30 + Math.sin(i) * 2], ['#f0c43a', '#3d78b5', '#c2493a', '#4a9a6e'][i % 4], ' stroke-width=".3"')).join('') + door(45, 42, 10, 14, '#4a2e22') + `<circle cx="86" cy="42" r="10" fill="none" stroke="#6a4a2a" stroke-width="1.4"/><path d="M86 32 V52 M76 42 H96 M79 35 L93 49 M93 35 L79 49" stroke="#6a4a2a" stroke-width=".6"/>` + [[86, 32], [96, 42], [86, 52], [76, 42]].map((p, i) => rc(p[0] - 2, p[1] - 1.5, 4, 3.4, ['#c2493a', '#3d78b5', '#f0c43a', '#4a9a6e'][i], 1, ' stroke-width=".3"')).join('')],
  courthouse: ['meadow', () => pg([12, 26, 50, 6, 88, 26], '#ecdfc3') + rc(12, 26, 76, 4, '#d9ceb6') + [0, 1, 2, 3, 4].map(i => box(18 + i * 14, 30, 6, 24, '#f4ead2', ' stroke-width=".4"')).join('') + box(10, 54, 80, 3, '#d9ceb6') + box(6, 57, 88, 4, '#c9bea6') + `<g stroke="${INK}" stroke-width=".5"><path d="M50 12 v12 M40 16 h20"/><path d="M40 16 l-3 6 h6Z M60 16 l-3 6 h6Z" fill="${gold}"/></g>` + door(45, 40, 10, 14, '#6a4a30')],
  clocktower: ['dusk', () => stones(38, 18, 24, 40, '#c9b89c') + pg([35, 18, 50, -4, 65, 18], '#46749f') + `<circle cx="50" cy="28" r="9" fill="#fbf4e0" stroke-width=".8"/><path d="M50 28 V21 M50 28 L55 31" stroke="${INK}" stroke-width=".9" stroke-linecap="round"/>` + [0, 1, 2, 3].map(i => ln(50 + Math.sin(i * 1.571) * 7, 28 - Math.cos(i * 1.571) * 7, 50 + Math.sin(i * 1.571) * 8, 28 - Math.cos(i * 1.571) * 8, INK, .6)).join('') + win(46, 40, 8, 10, '#ffd36a') + door(45, 48, 10, 10) + box(34, 56, 32, 4, '#a89a82') + [[18, 54], [80, 52]].map(p => tree(p[0], p[1], 1.3, '#6a9a62')).join('') + flag(50, -4, '#c2364c')],
  lookout: ['meadow', () => rc(46, 30, 8, 30, '#7a5638', 1) + [[32, 52, 2.2], [68, 50, 1.9]].map(p => tree(p[0], p[1] + 8, p[2], '#6aa05a')).join('') + ell(50, 22, 28, 9, '#79ad66') + ell(50, 18, 22, 7, '#8dc276', .8, NS0) + box(36, 24, 28, 3, '#a8703c', ' stroke-width=".4"') + box(38, 14, 24, 10, '#c49a62') + [0, 1, 2, 3, 4].map(i => `<path d="M${40 + i * 5} 14 v10" stroke="#7a5230" stroke-width=".4"/>`).join('') + roof(36, 6, 28, 8, '#8a4a3a') + `<path d="M50 30 L44 62 M50 30 L56 62" stroke="#7a5638" stroke-width=".6"/>` + [36, 44, 52].map((y, i) => ln(46 + i * 0, y, 54, y, '#7a5638', .9)).join('') + `<g transform="translate(66 18) rotate(-24)"><rect width="12" height="3.2" fill="#c9a24a" stroke-width=".5"/><rect x="10" y="-.8" width="4" height="4.8" fill="#8a6240" stroke-width=".4"/></g>` + flag(50, 6, '#f0c43a')],
  crane: ['stone', () => stones(14, 44, 30, 14, '#b0a898') + box(60, 46, 14, 12, '#c9bea6') + `<path d="M30 58 V16 M20 58 L30 24 M40 58 L30 24" stroke="#8a5a36" stroke-width="2" fill="none"/>` + `<path d="M14 18 L82 12" stroke="#7a4a2c" stroke-width="2.6" stroke-linecap="round"/>` + `<path d="M30 16 L14 18 M30 16 L70 12" stroke="#c9a46a" stroke-width=".5"/>` + `<circle cx="68" cy="12.6" r="2.4" fill="#7d858c" stroke-width=".6"/>` + `<path d="M68 15 V30" stroke="#6a4a2a" stroke-width=".8"/>` + box(62, 30, 14, 9, '#cfc8b6') + `<path d="M62 34 h14" stroke="#000" stroke-opacity=".15" stroke-width=".4"/>` + `<path d="M12 18 q-3 4 0 8" stroke="#6a4a2a" stroke-width=".8" fill="none"/>` + box(8, 24, 8, 6, '#6a5a50') + flag(30, 16, '#c2493a')],
  storehouse: ['autumn', () => box(10, 28, 80, 28, '#b8854e') + roof(8, 14, 84, 14, '#7a4a30') + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => `<path d="M${14 + i * 8.5} 28 V56" stroke="#7a4a2c" stroke-width=".4" stroke-opacity=".7"/>`).join('') + box(34, 32, 32, 24, '#8a5a36') + `<path d="M50 32 V56 M34 32 L50 56 M66 32 L50 56" stroke="#5a3a1e" stroke-width=".6"/>` + [[18, 56, 1.2], [26, 54, 1], [78, 55, 1.2], [86, 56, 1]].map(b => barrel(b[0], b[1], b[2])).join('') + ell(72, 59, 5, 2.8, '#e0c88a', null, ' stroke-width=".4"') + win(46, 16, 8, 8, '#2f2a44')],
  dungeon: ['night', () => stones(8, 12, 84, 50, '#6a7078') + pa('M26 62 V30 Q50 4 74 30 V62Z', '#1c1a22') + [32, 38, 44, 50, 56, 62, 68].map(x => `<path d="M${x} ${62}V${22 + Math.abs(x - 50) * .5}" stroke="#6a6468" stroke-width="1.4"/>`).join('') + `<path d="M26 44 H74 M26 54 H74" stroke="#6a6468" stroke-width="1.2"/>` + [[44, 40], [58, 40]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="1.6" fill="#ffd36a" stroke="none"/><circle cx="${p[0]}" cy="${p[1]}" r="3.4" fill="#ffd36a" fill-opacity=".25" stroke="none"/>`).join('') + [14, 86].map(x => rc(x - 1, 30, 2, 12, '#8a6240', 0, ' stroke-width=".4"') + `<path d="M${x} 28 q-3 -4 0 -8 q3 4 0 8Z" fill="#f6a830" stroke-width=".4"/><circle cx="${x}" cy="26" r="7" fill="#ffb84a" fill-opacity=".25" stroke="none"/>`).join('') + `<path d="M10 14 q4 6 0 12 M90 14 q-4 6 0 12" stroke="#2a2a2e" stroke-width=".8" fill="none"/>`],
  evertree: ['meadow', () => { let s = ell(50, 55, 40, 7, '#7aa869', .9, NS0); s += `<circle cx="50" cy="26" r="30" fill="${gold}" fill-opacity=".25" stroke="none"/>`; s += pa('M42 62 Q46 48 44 36 Q43 30 38 24 L42 24 Q47 28 48 32 Q50 22 49 12 L53 12 Q52 22 52 32 Q54 28 58 24 L62 24 Q57 30 56 36 Q54 48 60 62Z', '#8a6240'); s += `<path d="M46 56 q2 -10 0 -18 M54 58 q-2 -10 1 -20" stroke="#5a3a1e" stroke-width=".5" fill="none"/>`; const r = rng('ev'); [[50, 14, 15, 11], [34, 20, 12, 9], [66, 20, 12, 9], [26, 30, 9, 7], [74, 30, 9, 7], [50, 26, 16, 10]].forEach((b, i) => { s += ell(b[0], b[1], b[2], b[3], ['#79b25e', '#5f9a52', '#8cc46a'][i % 3]); }); for (let i = 0; i < 16; i++) s += `<ellipse cx="${f1(20 + r() * 60)}" cy="${f1(8 + r() * 28)}" rx="1.8" ry="1" fill="${['#f0c43a', '#fff0a0', '#f3b6c4'][i % 3]}" stroke="none" transform="rotate(${f1(r() * 180)} 50 20)"/>`; s += `<circle cx="50" cy="38" r="3" fill="#fff6b0"/><circle cx="50" cy="38" r="7" fill="#fff6b0" fill-opacity=".3" stroke="none"/>`; return s; }],
  windmill: ['autumn', () => pa('M38 58 L42 24 H58 L62 58Z', '#e0d2b2') + pg([39, 24, 50, 12, 61, 24], '#a8603c') + door(46, 46, 8, 12) + win(46, 32, 8, 8, '#ffd36a') + `<g transform="translate(50 20)"><circle r="2" fill="#6a4a2a"/>${[0, 90, 180, 270].map(a => `<g transform="rotate(${a + 20})"><path d="M0 0 L0 -20" stroke="#7a5638" stroke-width="1"/><path d="M1 -6 h8 v13 h-8Z" fill="#f6ecd6" stroke-width=".5"/><path d="M1 -2 h8 M1 2 h8" stroke="${INK}" stroke-width=".25"/></g>`).join('')}</g>` + [[18, 54, 1.2], [84, 52, 1]].map(p => tree(p[0], p[1] + 6, p[2], '#d9843a')).join('')]
};
function construction(key) {
  const [bg, fn] = CONS[key];
  let s = scene(bg, key);
  if (!['barge', 'theatre', 'dungeon', 'cemetery'].includes(key) && key !== 'evertree') s += ell(50, 59, 44, 4, '#2f3a2a', .16, NS0);
  return s + fn();
}
// ---------- art registry + card ----------
const CRIT_KEYS = Object.keys(CRIT), CONS_KEYS = Object.keys(CONS);
const ART_KEYS = CRIT_KEYS.concat(CONS_KEYS);
const artCache = {};
function artInner(key) {
  if (artCache[key]) return artCache[key];
  let body;
  try { body = CRIT[key] ? critter(key) : CONS[key] ? construction(key) : scene('meadow', key) + `<text x="50" y="36" text-anchor="middle" font-size="8" fill="${INK}" stroke="none">${esc(key)}</text>`; } catch (e) { body = scene('meadow', key); if (root.console) console.warn('HBKit art', key, e); }
  return artCache[key] = `<g stroke="${INK}" stroke-width=".55" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;
}
const iconAt = (k, x, y, sc) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${sc}) translate(-10 -10)">${ICON[k]()}</g>`;
const leafPath = 'M0 -17 C13 -13 17 -1 8 12 C4 16 -1 17 -3 17 C-12 12 -16 -2 -9 -12 C-6 -15 -3 -16 0 -17Z';
const shieldPath = 'M-14 -15 H14 V2 C14 10 7 15 0 18 C-7 15 -14 10 -14 2Z';
function badge(x, y, sc, pts, isCrit, fs) {
  return `<g transform="translate(${x} ${y}) scale(${sc})"><g filter="url(#hb-shadow)">${isCrit ? `<path d="${leafPath}" fill="#f4e2a0" stroke="${INK}" stroke-width="1.3"/><path d="M0 -15 C-1 -4 -1 6 -3 16" stroke="#b79a4a" stroke-width=".8" fill="none"/>` : `<path d="${shieldPath}" fill="#f4e2a0" stroke="${INK}" stroke-width="1.3"/><path d="M-11 -12 H11" stroke="#b79a4a" stroke-width=".8"/>`}</g><text x="0" y="${fs * .36}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="${fs}" fill="${INK}">${pts}</text></g>`;
}
function costPills(cost, x, y, big, horizontal) {
  const ks = ['twig', 'resin', 'pebble', 'berry'].filter(k => cost && cost[k] > 0); let s = '';
  ks.forEach((k, i) => {
    const px = horizontal ? x + i * big * 2.15 : x, py = horizontal ? y : y + i * big * 2.1, n = cost[k];
    s += `<g filter="url(#hb-shadow)"><circle cx="${f1(px)}" cy="${f1(py)}" r="${big}" fill="#fbf4e2" stroke="${INK}" stroke-width="1"/></g>` + iconAt(k, px, py, big / 11.5);
    if (n > 1) s += `<circle cx="${f1(px + big * .72)}" cy="${f1(py + big * .72)}" r="${f1(big * .46)}" fill="${INK}"/><text x="${f1(px + big * .72)}" y="${f1(py + big * .72 + big * .18)}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="${f1(big * .62)}" fill="#fff">${n}</text>`;
  });
  return s;
}
function cardString(spec, layout) {
  const T = TYPES[spec.type] || TYPES.traveler, isCrit = (spec.kind || (CRIT[spec.art] ? 'critter' : 'construction')) === 'critter';
  const uniq = !!spec.unique, name = String(spec.name || spec.art || ''), pts = spec.points == null ? 0 : spec.points;
  const art = artInner(spec.art);
  const L = layout === 's';
  const W = L ? 128 : 260, H = L ? 180 : 364;
  let s = `<svg xmlns="${NS}" viewBox="0 0 ${W} ${H}" font-family="${FONT}" data-art="${esc(spec.art)}" data-type="${esc(spec.type)}">`;
  // paper + frame
  s += `<g filter="url(#hb-shadow)"><rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="${L ? 9 : 15}" fill="${PAPER}" stroke="${INK}" stroke-width="${L ? 2 : 2.4}"/></g>`;
  if (!L) s += `<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="15" filter="url(#hb-paper)" opacity=".5"/><rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="15" fill="${T.t}" fill-opacity=".18"/>`;
  s += `<rect x="${L ? 5 : 7}" y="${L ? 5 : 7}" width="${W - (L ? 10 : 14)}" height="${H - (L ? 10 : 14)}" rx="${L ? 6 : 10}" fill="none" stroke="${T.c}" stroke-width="${L ? 1.4 : 1.6}" stroke-opacity=".7"/>`;
  // title band
  const bx = L ? 8 : 12, by = L ? 8 : 12, bw = W - 2 * bx, bh = L ? 22 : 32;
  s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${L ? 5 : 8}" fill="${T.t}" stroke="${INK}" stroke-width="1.2"/><rect x="${bx}" y="${by + bh - (L ? 4 : 5)}" width="${bw}" height="${L ? 4 : 5}" fill="${T.c}" fill-opacity=".85"/>`;
  const maxW = bw - (L ? 8 : 20), fsT = Math.min(L ? 15 : 20, maxW / (name.length * (L ? .62 : .54)));
  s += `<text x="${W / 2}" y="${by + bh * (L ? .62 : .64)}" text-anchor="middle" font-size="${f1(fsT)}" font-weight="700" fill="${INK}">${esc(name)}</text>`;
  // art window
  const ax = L ? 8 : 12, ay = L ? 34 : 50, aw = W - 2 * ax, ah = L ? 90 : 142;
  s += `<svg x="${ax}" y="${ay}" width="${aw}" height="${ah}" viewBox="0 0 100 62" preserveAspectRatio="xMidYMid slice" overflow="hidden"><g filter="url(#${L ? 'hb-wcl' : 'hb-wc'})">${art}</g></svg>`;
  s += `<rect x="${ax}" y="${ay}" width="${aw}" height="${ah}" rx="3" fill="none" stroke="${INK}" stroke-width="1.6"/><rect x="${ax + 2}" y="${ay + 2}" width="${aw - 4}" height="${ah - 4}" rx="2" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1"/>`;
  if (L) {
    s += costPills(spec.cost, 20, 140, 9.5, true) + badge(104, 141, .8, pts, isCrit, 17);
    s += `<rect x="8" y="160" width="112" height="13" rx="4" fill="${T.c}" stroke="${INK}" stroke-width="1"/><text x="64" y="170" text-anchor="middle" font-size="9.5" font-weight="700" letter-spacing=".8" fill="#fffaf0">${T.label.toUpperCase()}</text>`;
    const glyph = isCrit ? `<g transform="translate(17 166.5)" fill="#fffaf0" stroke="${INK}" stroke-width=".5"><ellipse cx="0" cy="1.4" rx="2.4" ry="2"/><circle cx="-3" cy="-1" r="1"/><circle cx="-1" cy="-2.6" r="1"/><circle cx="1" cy="-2.6" r="1"/><circle cx="3" cy="-1" r="1"/></g>` : `<path transform="translate(17 166.5)" d="M-4 .6 L0 -3.6 L4 .6 L3 .6 V4 H-3 V.6Z" fill="#fffaf0" stroke="${INK}" stroke-width=".6" stroke-linejoin="round"/>`;
    s += glyph + (uniq ? `<path transform="translate(111 166.5) scale(1)" d="M0 -4.2 L1.2 -1.2 L4.2 -1 L1.9 1 L2.6 4 L0 2.4 L-2.6 4 L-1.9 1 L-4.2 -1 L-1.2 -1.2Z" fill="#f4d25a" stroke="${INK}" stroke-width=".5"/>` : `<circle cx="111" cy="166.5" r="2.6" fill="#cfe3b8" stroke="${INK}" stroke-width=".5"/>`);
  } else {
    // left cost column
    s += costPills(spec.cost, 30, ay + 22, 13, false);
    s += badge(W - 34, ay + 24, 1.15, pts, isCrit, 20);
    // marker strip
    const my = ay + ah + 6;
    s += `<g transform="translate(14 ${my})"><rect width="112" height="22" rx="11" fill="${T.t}" stroke="${INK}" stroke-width="1"/>${isCrit
      ? `<g transform="translate(13 11)" stroke="${INK}" stroke-width=".8" fill="${INK}"><ellipse cx="0" cy="2" rx="3.4" ry="2.8"/><circle cx="-4.4" cy="-1.4" r="1.4"/><circle cx="-1.6" cy="-3.6" r="1.4"/><circle cx="1.6" cy="-3.6" r="1.4"/><circle cx="4.4" cy="-1.4" r="1.4"/></g>`
      : `<g transform="translate(13 11)" stroke="${INK}" stroke-width="1.1" fill="${INK}" stroke-linejoin="round"><path d="M-6 1 L0 -5 L6 1 L4.5 1 V6 H-4.5 V1Z" fill="#fbf4e2"/></g>`}<text x="66" y="15.5" text-anchor="middle" font-size="12" font-weight="700" fill="${INK}">${isCrit ? 'Critter' : 'Construction'}</text></g>`;
    s += `<g transform="translate(${W - 126} ${my})"><rect width="112" height="22" rx="11" fill="${uniq ? '#f4e2a0' : '#fbf4e2'}" stroke="${INK}" stroke-width="1"/>${uniq
      ? `<path transform="translate(14 11) scale(1.5)" d="M0 -5 L1.5 -1.5 L5 -1.2 L2.3 1.2 L3.1 4.8 L0 2.8 L-3.1 4.8 L-2.3 1.2 L-5 -1.2 L-1.5 -1.5Z" fill="#e0a820" stroke="${INK}" stroke-width=".7"/>`
      : `<circle cx="14" cy="11" r="4.2" fill="#9ab88a" stroke="${INK}" stroke-width=".9"/>`}<text x="66" y="15.5" text-anchor="middle" font-size="12" font-weight="700" fill="${INK}">${uniq ? 'Unique' : 'Common'}</text></g>`;
    // text box
    const ty = my + 28, th = H - 26 - ty - 4;
    s += `<rect x="12" y="${ty}" width="${W - 24}" height="${th}" rx="8" fill="${PAPER2}" fill-opacity=".7" stroke="${INK}" stroke-opacity=".55" stroke-width="1"/>`;
    const lines = wrap(spec.text || '', 33), lh = 16.6, fs = 13.5, y0 = ty + th / 2 - (lines.length - 1) * lh / 2 + fs * .34;
    s += `<text font-size="${fs}" fill="${INK}" text-anchor="middle">${lines.map((l, i) => `<tspan x="${W / 2}" y="${f1(y0 + i * lh)}">${esc(l)}</tspan>`).join('')}</text>`;
    // bottom type band
    s += `<rect x="12" y="${H - 26}" width="${W - 24}" height="18" rx="6" fill="${T.c}" stroke="${INK}" stroke-width="1.1"/><text x="${W / 2}" y="${H - 13}" text-anchor="middle" font-size="12" font-weight="700" letter-spacing="1.6" fill="#fffaf0">${T.label.toUpperCase()}</text>`;
    s += `<path d="M44 ${H - 17} h14 M${W - 44} ${H - 17} h-14" stroke="#fffaf0" stroke-width="1" stroke-opacity=".7"/>`;
  }
  return s + '</svg>';
}
// ---------- tokens, meeples, seasons, plaques, tree, table ----------
const svgWrap = (w, h, vb, inner, extra) => `<svg xmlns="${NS}" width="${w}" height="${h}" viewBox="${vb}" font-family="${FONT}"${extra || ''}>${inner}</svg>`;
const G = (inner, sw) => `<g stroke="${INK}" stroke-width="${sw || .9}" stroke-linejoin="round" stroke-linecap="round">${inner}</g>`;
function tokenResource(kind) {
  return G(`<g filter="url(#hb-shadow)"><circle cx="12" cy="12" r="11" fill="${RES[kind]}" fill-opacity=".28" stroke="${INK}" stroke-width="1"/></g><circle cx="12" cy="12" r="9" fill="#fbf4e2" fill-opacity=".8" stroke="none"/><g filter="url(#hb-wcl)">${iconAt(kind, 12, 12, .95)}</g>`);
}
function tokenPoint(n) {
  return G(`<g filter="url(#hb-shadow)"><circle cx="12" cy="12" r="11" fill="#f0cf5c" stroke="${INK}" stroke-width="1"/></g><circle cx="12" cy="12" r="8.4" fill="#f8e590" stroke="#b58a1c" stroke-width=".6"/><path d="M12 5.5 C16 7 17 11 14.5 15 C13.5 16.5 12.5 17 12 17 C8 15 7 10 9 7 C10 6 11 5.6 12 5.5Z" fill="#8fb35e" stroke="#4f6d2c" stroke-width=".7" transform="translate(0 -.5)"/><path d="M12 6 L12 16" stroke="#4f6d2c" stroke-width=".6" transform="translate(0 -.5)"/>`) + (n != null ? `<text x="12" y="15.6" text-anchor="middle" font-weight="700" font-size="10" fill="${INK}" stroke="#f8e590" stroke-width="2.2" paint-order="stroke">${n}</text>` : '');
}
function tokenOccupied() {
  return G(`<g filter="url(#hb-shadow)"><circle cx="12" cy="12" r="11" fill="#7a4a30" stroke="${INK}" stroke-width="1"/></g><circle cx="12" cy="12" r="8.6" fill="#a8683c" stroke="#4a2c1a" stroke-width=".6"/><path d="M5 9 Q12 5 19 9 M5 15 Q12 19 19 15" stroke="#7a4a30" stroke-width=".5" fill="none"/><path d="M7.5 7.5 L16.5 16.5 M16.5 7.5 L7.5 16.5" stroke="#f6e3b8" stroke-width="2.2"/>`);
}
function glyph(g, c) {
  const w = '#fffaf0';
  return { leaf: `<path d="M12 14 C9 15 8.4 18.4 10 20.4 C13.4 20.4 15.4 17 14 14Z" fill="${w}" stroke="none"/>`, drop: `<path d="M12 13.4 C14.2 16 15 17 15 18.4 A3 3 0 0 1 9 18.4 C9 17 9.8 16 12 13.4Z" fill="${w}" stroke="none"/>`, sun: `<circle cx="12" cy="18" r="2.2" fill="${w}" stroke="none"/><path d="M12 13.6 v1 M12 21.4 v1 M7.6 18 h1 M15.4 18 h1" stroke="${w}" stroke-width=".9"/>`, star: `<path d="M12 14 L13 16.8 L16 17 L13.7 18.8 L14.5 21.6 L12 20 L9.5 21.6 L10.3 18.8 L8 17 L11 16.8Z" fill="${w}" stroke="none"/>`, moon: `<path d="M14 14.4 A4 4 0 1 0 14 21.4 A3.2 3.2 0 1 1 14 14.4Z" fill="${w}" stroke="none"/>` }[g];
}
function meeple(idx) {
  const P = PLAYER[idx] || PLAYER[0];
  return G(`<ellipse cx="12" cy="29" rx="8" ry="1.8" fill="#000" fill-opacity=".22" stroke="none"/><path d="M5 28 C3.6 17 7 12.4 12 12 C17 12.4 20.4 17 19 28Z" fill="${P.c}"/><path d="M12 12 C15.4 12.6 18 15 18.6 18 C16 15 13 14.4 12 14.4Z" fill="#fff" fill-opacity=".28" stroke="none"/><path d="M2.6 18 Q6 14.6 8 16.4 M21.4 18 Q18 14.6 16 16.4" stroke="${P.d}" stroke-width="2.2" fill="none"/><circle cx="12" cy="7.4" r="5.4" fill="#f1d3a8"/><path d="M6.8 6.6 C7 2.4 10 .8 12 .8 C15.4 .8 17.6 3 17.2 6.6 C15 4.4 9 4.4 6.8 6.6Z" fill="${P.d}"/><path d="M12 .8 C14.4 -.6 17.4 .6 18 2.6 C15.6 2.8 13.4 2.2 12 .8Z" fill="#6aa04c" stroke-width=".7"/><circle cx="10" cy="8" r=".8" fill="${INK}" stroke="none"/><circle cx="14" cy="8" r=".8" fill="${INK}" stroke="none"/>${glyph(P.glyph, P.c)}`, .8);
}
function seasonIcon(name) {
  const c = { winter: ['#cfe0ee', '#6a8caa'], spring: ['#cfe6b0', '#e08aa8'], summer: ['#f8e08a', '#e8a020'], autumn: ['#f2c08a', '#c2501f'] }[name];
  let ic = '';
  if (name === 'winter') ic = [0, 60, 120].map(a => `<g transform="rotate(${a} 24 24)"><path d="M24 11 V37 M20.6 14 L24 17.4 L27.4 14 M20.6 34 L24 30.6 L27.4 34" stroke="#fff" stroke-width="2.4" fill="none"/><path d="M24 11 V37 M20.6 14 L24 17.4 L27.4 14 M20.6 34 L24 30.6 L27.4 34" stroke="${c[1]}" stroke-width=".9" fill="none"/></g>`).join('');
  if (name === 'spring') ic = [0, 72, 144, 216, 288].map(a => `<ellipse cx="24" cy="15.4" rx="4.6" ry="6.4" fill="#fbd0dc" transform="rotate(${a} 24 24)"/>`).join('') + `<circle cx="24" cy="24" r="3.4" fill="#f2c84a"/>` + `<path d="M8 38 q6 -8 12 -4 M40 38 q-6 -8 -12 -4" stroke="#4f8f4a" stroke-width="1.4" fill="none"/>`;
  if (name === 'summer') ic = `<circle cx="24" cy="24" r="8" fill="#f6c43a"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M24 9.4 V13.4" stroke="#e8a020" stroke-width="2.4" transform="rotate(${i * 45} 24 24)"/>`).join('');
  if (name === 'autumn') ic = `<path d="M24 8 C30 14 38 16 36 24 C40 26 38 32 32 32 C32 36 28 38 24 40 C20 38 16 36 16 32 C10 32 8 26 12 24 C10 16 18 14 24 8Z" fill="#e0692a"/><path d="M24 14 V42 M24 24 L18 20 M24 28 L31 23" stroke="#7a2a10" stroke-width="1" fill="none"/>`;
  return `<g filter="url(#hb-shadow)"><circle cx="24" cy="24" r="22" fill="${c[0]}" stroke="${INK}" stroke-width="1.6"/></g><circle cx="24" cy="24" r="18.4" fill="none" stroke="${c[1]}" stroke-width=".9" stroke-dasharray="2 2.4" stroke-opacity=".8"/>` + G(ic, .7);
}
// ---- plaques ----
const PLQ = { basic: ['#c9a06a', '#8a6240'], forest: ['#7e9a5e', '#4d6a38'], haven: ['#6fa59a', '#3f7469'], journey: ['#d08a52', '#8f4f26'], event: ['#8e7bb0', '#5b4a82'] };
const PLQ_ICON = {
  basic: () => `<path d="M-9 8 L9 -8 M-9 -8 L9 8" stroke="#6a4a2a" stroke-width="3.4" fill="none"/><path d="M-9 8 L9 -8 M-9 -8 L9 8" stroke="#c9a06a" stroke-width="1.6" fill="none"/>`,
  forest: () => `<path d="M0 -11 L7 -2 H3 L9 6 H-9 L-3 -2 H-7Z" fill="#4f8f4a"/><rect x="-1.4" y="6" width="2.8" height="4.4" fill="#6a4a2a"/>`,
  haven: () => `<path d="M-9 1 L0 -9 L9 1 V10 H-9Z" fill="#f6ecd6"/><path d="M0 8.4 C-6 4 -4 -.4 0 2 C4 -.4 6 4 0 8.4Z" fill="#c2364c" stroke-width=".6"/>`,
  journey: () => `<path d="M0 10 V-8" stroke="#6a4a2a" stroke-width="2"/><path d="M-1 -8 H9 L12 -4.6 L9 -1.4 H-1Z" fill="#f6ecd6"/><path d="M1 0 H-9 L-12 3.4 L-9 6.6 H1Z" fill="#f6ecd6"/>`,
  event: () => `<path d="M-8 -9 H8 V8 L0 4 L-8 8Z" fill="#f4e2a0"/><path d="M0 -6 L1.4 -2.4 L5 -2.2 L2.2 .2 L3.2 3.6 L0 1.6 L-3.2 3.6 L-2.2 .2 L-5 -2.2 L-1.4 -2.4Z" fill="#c2364c" stroke-width=".5"/>`
};
function plaque(kind, o) {
  o = o || {}; const K = PLQ[kind] || PLQ.basic, W = 160, H = o.sub ? 104 : 84;
  const subLines = o.sub ? wrap(o.sub, 24) : [];
  const slots = o.slots != null ? o.slots : 0, taken = o.taken || 0;
  let s = `<g filter="url(#hb-shadow)"><rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="12" fill="${K[0]}" stroke="${INK}" stroke-width="2.2"/></g>`;
  s += `<g clip-path="url(#hb-clip-${o.sub ? 'plq2' : 'plq'})"><rect width="${W}" height="${H}" filter="url(#hb-fibre)" opacity=".75"/><rect y="${H * .5}" width="${W}" height="${H * .5}" fill="${K[1]}" fill-opacity=".14"/></g>`;
  s += `<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="8" fill="none" stroke="${K[1]}" stroke-width="1.6" stroke-opacity=".8" stroke-dasharray="${o.dash || 0}"/>`;
  [[12, 12], [W - 12, 12], [12, H - 12], [W - 12, H - 12]].forEach(p => s += `<circle cx="${p[0]}" cy="${p[1]}" r="2.2" fill="#d9d2c0" stroke="${INK}" stroke-width=".7"/>`);
  s += `<g transform="translate(30 ${o.sub ? 30 : H / 2 - 4})"><circle r="15.5" fill="#f6ecd6" stroke="${INK}" stroke-width="1.4"/>${G(PLQ_ICON[kind] ? PLQ_ICON[kind]() : '', .9)}</g>`;
  const label = String(o.label || kind), fs = Math.min(16, 100 / (label.length * .56));
  s += `<text x="103" y="${o.sub ? 33 : H / 2}" text-anchor="middle" font-size="${f1(fs)}" font-weight="700" fill="#fffaf0" stroke="${INK}" stroke-width="2.6" paint-order="stroke" stroke-linejoin="round">${esc(label)}</text>`;
  if (subLines.length) s += `<text font-size="12.5" fill="#fffaf0" stroke="${INK}" stroke-width="2.4" paint-order="stroke" stroke-linejoin="round" text-anchor="middle">${subLines.slice(0, 3).map((l, i) => `<tspan x="${W / 2 + 6}" y="${58 + i * 14}">${esc(l)}</tspan>`).join('')}</text>`;
  for (let i = 0; i < slots; i++) { const x = W / 2 + (i - (slots - 1) / 2) * 17, y = H - 20; s += `<circle cx="${f1(x)}" cy="${y}" r="6.2" fill="${i < taken ? '#fbf4e2' : '#000'}" fill-opacity="${i < taken ? 1 : .22}" stroke="${INK}" stroke-width="1" ${i < taken ? '' : 'stroke-dasharray="2 1.6"'}/>`; }
  return svgWrap(o.w || W, (o.w || W) * H / W, `0 0 ${W} ${H}`, s, ` data-plaque="${kind}"`);
}
// ---- evertree ----
const TREE_SLOTS = [{ season: 'winter', x: .20, y: .79 }, { season: 'spring', x: .17, y: .34 }, { season: 'summer', x: .50, y: .09 }, { season: 'autumn', x: .83, y: .34 }];
function evertreeInner(cur) {
  const r = rng('evertree'); let s = '';
  s += `<g filter="url(#hb-bleed)" opacity=".55">${blob(300, 380, 270, 330, '#cfe3b4', .9, r)}${blob(300, 640, 280, 70, '#a9c58a', .9, r)}</g>`;
  s += `<g filter="url(#hb-wc)"><g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">`;
  s += ell(300, 662, 230, 40, '#8fb372', .85, NS0);
  // roots
  s += pa('M262 620 C240 630 200 640 150 636 C190 650 240 658 270 650 C280 660 290 664 300 664 C310 664 320 660 330 650 C360 658 410 650 450 636 C400 640 360 630 338 620Z', '#7d5636');
  // trunk
  s += pa('M262 626 C272 560 268 500 256 450 C246 410 224 380 180 330 C160 306 150 290 160 270 C176 292 200 316 238 338 C250 346 262 352 270 350 C268 300 262 240 256 190 C264 170 268 120 262 70 C282 96 296 100 300 98 C304 100 318 96 338 70 C332 120 336 170 344 190 C338 240 332 300 330 350 C338 352 350 346 362 338 C400 316 424 292 440 270 C450 290 440 306 420 330 C376 380 354 410 344 450 C332 500 328 560 338 626Z', '#8c6140');
  s += `<path d="M280 560 C288 500 282 450 272 410 M320 560 C312 500 318 450 328 410 M300 330 V210 M262 330 C240 316 218 300 200 284 M338 330 C360 316 382 300 400 284" stroke="#5a3a24" stroke-width="2" fill="none" stroke-opacity=".6"/>`;
  s += pa('M298 548 C282 536 282 506 298 498 C316 506 316 536 298 548Z', '#2a1c14', ' stroke-width="2.4"') + `<path d="M298 548 C290 542 288 530 292 520" stroke="#e8a826" stroke-width="3" fill="none"/>`;
  s += `</g></g>`;
  // canopy
  const col = ['#6aa855', '#7fbb62', '#58964a', '#92c870'];
  s += `<g filter="url(#hb-wc)"><g stroke="${INK}" stroke-width="2.4" stroke-linejoin="round">`;
  [[300, 120, 120, 90], [190, 170, 110, 80], [410, 170, 110, 80], [130, 270, 90, 70], [470, 270, 90, 70], [300, 230, 140, 90], [220, 250, 90, 60], [380, 250, 90, 60]].forEach((b, i) => s += ell(b[0], b[1], b[2], b[3], col[i % 4], .96));
  s += `</g>`;
  for (let i = 0; i < 90; i++) { const a = r() * 6.283, d = Math.sqrt(r()), x = 300 + Math.cos(a) * d * 230, y = 200 + Math.sin(a) * d * 130 - Math.abs(Math.cos(a)) * 10; s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(7 + r() * 7)}" ry="${f1(3 + r() * 3)}" fill="${['#b7e08a', '#4d8a42', '#e8f2a8', '#3f7a3a'][i % 4]}" fill-opacity=".5" transform="rotate(${f1(r() * 180)} ${f1(x)} ${f1(y)})"/>`; }
  for (let i = 0; i < 22; i++) { const a = r() * 6.283, d = Math.sqrt(r()), x = 300 + Math.cos(a) * d * 220, y = 190 + Math.sin(a) * d * 120; s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(3 + r() * 2)}" fill="${['#f4d25a', '#fff0b0', '#f6b8c8'][i % 3]}"/>`; }
  s += `</g>`;
  // lantern fruit
  s += `<g transform="translate(300 330)"><circle r="46" fill="#ffe08a" fill-opacity=".28"/><circle r="26" fill="#ffe08a" fill-opacity=".3"/></g>`;
  // season markers
  TREE_SLOTS.forEach(t => {
    const x = t.x * 600, y = t.y * 720, on = cur === t.season;
    s += (on ? `<circle cx="${x}" cy="${y}" r="52" fill="#fff4b0" fill-opacity=".7" filter="url(#hb-bleed)"/>` : '') + `<g transform="translate(${x - 36} ${y - 36}) scale(1.5)">${seasonIcon(t.season)}</g>`;
    if (on) s += `<circle cx="${x}" cy="${y}" r="42" fill="none" stroke="#e8a826" stroke-width="4" stroke-dasharray="6 5"/>`;
    s += `<text x="${x}" y="${y + 62}" text-anchor="middle" font-size="19" font-weight="700" fill="${INK}" stroke="#f6ecd6" stroke-width="4" paint-order="stroke">${t.season[0].toUpperCase() + t.season.slice(1)}</text>`;
  });
  return s;
}
// ---- table ----
function tableSVG(w, h, mood) {
  const forest = mood === 'forest', r = rng('table' + mood);
  const base = forest ? '#6f8f5c' : '#efe3c6', cols = forest ? ['#5c7d4c', '#86a56a', '#4c6a40', '#a0b67c', '#7a5c3a'] : ['#e6d4aa', '#f4ead0', '#dcc596', '#e9d9b4', '#cfe0c0'];
  let s = `<rect width="${w}" height="${h}" fill="${base}"/>`;
  s += `<g filter="url(#hb-bleed)" opacity=".7">`; for (let i = 0; i < 14; i++) s += blob(40 + r() * (w - 80), 40 + r() * (h - 80), 80 + r() * 90, 60 + r() * 70, cols[i % cols.length], .55, r); s += '</g>';
  if (forest) { for (let i = 0; i < 40; i++) { const x = r() * w, y = r() * h; s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(5 + r() * 5)}" ry="${f1(2 + r() * 2)}" fill="${['#c0792f', '#d9a43a', '#9a5a2a', '#7aa04a'][i % 4]}" fill-opacity=".35" transform="rotate(${f1(r() * 180)} ${f1(x)} ${f1(y)})"/>`; } }
  s += `<rect width="${w}" height="${h}" filter="url(#hb-paper)" opacity="${forest ? .3 : .4}"/><rect width="${w}" height="${h}" filter="url(#hb-fibre)" opacity=".08"/>`;
  return s;
}
// ---------- API ----------
const DEFS2 = DEFS.replace('</defs>', `<clipPath id="hb-clip-plq"><rect x="3" y="3" width="154" height="78" rx="12"/></clipPath><clipPath id="hb-clip-plq2"><rect x="3" y="3" width="154" height="98" rx="12"/></clipPath></defs>`);
let mounted = false, defsEl = null;
function parse(str) {
  if (typeof DOMParser !== 'undefined') { const d = new DOMParser().parseFromString(str, 'image/svg+xml'); const e = d.documentElement; if (e.nodeName === 'parsererror' || e.getElementsByTagName('parsererror').length) throw new Error('HBKit svg parse error: ' + e.textContent.slice(0, 200)); return document.importNode(e, true); }
  const t = document.createElement('div'); t.innerHTML = str; return t.firstChild;
}
function mount() {
  if (mounted || typeof document === 'undefined') return;
  const host = document.body || document.documentElement; if (!host) return;
  const d = document.createElement('div'); d.setAttribute('aria-hidden', 'true'); d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  d.innerHTML = `<svg xmlns="${NS}" width="0" height="0">${DEFS2}</svg>`; host.insertBefore(d, host.firstChild); defsEl = d; mounted = true;
}
const SIZES = { small: [64, 90], large: [260, 364] };
function dims(size) {
  if (size == null) size = 'small';
  if (typeof size === 'string') return SIZES[size] || SIZES.small;
  if (typeof size === 'number') return [size, Math.round(size * 1.4)];
  return [size.w, size.h || Math.round(size.w * 1.4)];
}
const tmpl = new Map(); let stats = { built: 0, cloned: 0 };
const specKey = (sp, lay) => lay + '|' + [sp.art, sp.type, sp.kind || '', sp.name, sp.unique ? 1 : 0, sp.points, JSON.stringify(sp.cost || {}), lay === 'l' ? sp.text || '' : ''].join('|');
function card(spec, size, opts) {
  mount();
  const [w, h] = dims(size), lay = w <= 120 ? 's' : 'l', k = specKey(spec, lay);
  let t = tmpl.get(k);
  if (!t) { t = parse(cardString(spec, lay)); tmpl.set(k, t); stats.built++; }
  const e = t.cloneNode(true); stats.cloned++;
  e.setAttribute('width', w); e.setAttribute('height', h); e.style.display = 'block'; e.style.overflow = 'visible';
  e.setAttribute('role', 'img'); e.setAttribute('aria-label', (spec.name || spec.art) + (spec.text ? '. ' + spec.text : ''));
  if (opts && opts.id) e.dataset.id = opts.id;
  return e;
}
const urlCache = new Map();
function toURL(svgStr) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr); }
function cardURL(spec, size) { // standalone data-URL (defs embedded) for <img>/canvas use; browser caches the decode
  const [w, h] = dims(size), lay = w <= 120 ? 's' : 'l', k = specKey(spec, lay) + '#url';
  let u = urlCache.get(k); if (!u) { u = toURL(cardString(spec, lay).replace(/^(<svg[^>]*>)/, '$1' + DEFS2)); urlCache.set(k, u); }
  return u;
}
function cardImg(spec, size) { const [w, h] = dims(size), i = new Image(); i.width = w; i.height = h; i.src = cardURL(spec, size); i.alt = spec.name || spec.art; i.draggable = false; return i; }
function artEl(key, w) { mount(); w = w || 200; const e = parse(`<svg xmlns="${NS}" viewBox="0 0 100 62" width="${w}" height="${Math.round(w * .62)}"><g filter="url(#hb-wc)">${artInner(key)}</g></svg>`); return e; }
const cacheEl = (name, fn) => { const m = new Map(); return function () { mount(); const a = Array.prototype.slice.call(arguments), sz = a.pop(), k = name + '|' + a.join('|'); let t = m.get(k); if (!t) { t = parse(fn.apply(null, a)); m.set(k, t); } const e = t.cloneNode(true); const [w, h] = sz; e.setAttribute('width', w); e.setAttribute('height', h); e.style.display = 'block'; return e; }; };
const _res = cacheEl('res', k => svgWrap(24, 24, '0 0 24 24', tokenResource(k)));
const _pt = cacheEl('pt', n => svgWrap(24, 24, '0 0 24 24', tokenPoint(n === '' ? null : n)));
const _occ = cacheEl('occ', () => svgWrap(24, 24, '0 0 24 24', tokenOccupied()));
const _mee = cacheEl('mee', i => svgWrap(24, 30, '0 0 24 30', meeple(+i)));
const _sea = cacheEl('sea', n => svgWrap(48, 48, '0 0 48 48', seasonIcon(n)));
const sq = s => [s || 32, s || 32];
const HB = {
  version: '1.0.0', INK, PAPER, FONT, TYPES, RES, PLAYER, SIZES,
  artKeys: ART_KEYS, critterKeys: CRIT_KEYS, constructionKeys: CONS_KEYS, resources: ['twig', 'resin', 'pebble', 'berry'], seasons: ['winter', 'spring', 'summer', 'autumn'],
  mount, card, cardURL, cardImg, art: artEl,
  resource: (kind, s) => _res(kind, sq(s)),
  point: (n, s) => _pt(n == null ? '' : n, sq(s)),
  occupied: s => _occ(sq(s)),
  worker: (i, s) => { s = s || 32; return _mee(typeof i === 'number' ? i : Math.max(0, PLAYER.findIndex(p => p.name === i)), [s * .8, s]); },
  season: (name, s) => _sea(name, sq(s || 48)),
  plaque: (kind, o) => { mount(); return parse(plaque(kind, o)); },
  evertree: (o) => { mount(); o = o || {}; const w = o.w || 600; return parse(svgWrap(w, w * 1.2, '0 0 600 720', evertreeInner(o.season), ' data-evertree="1"')); },
  evertreeSlots: TREE_SLOTS,
  table: (w, h, mood) => { mount(); return parse(svgWrap(w, h, `0 0 ${w} ${h}`, tableSVG(w, h, mood))); },
  tableURL: (mood, w, h) => toURL(svgWrap(w || 1200, h || 800, `0 0 ${w || 1200} ${h || 800}`, DEFS2 + tableSVG(w || 1200, h || 800, mood))),
  applyTable: (el, mood) => { el.style.backgroundColor = mood === 'forest' ? '#6f8f5c' : '#efe3c6'; el.style.backgroundImage = `url("${HB.tableURL(mood)}")`; el.style.backgroundSize = 'cover'; el.style.backgroundPosition = 'center'; },
  stats: () => Object.assign({ templates: tmpl.size }, stats), clearCache: () => { tmpl.clear(); urlCache.clear(); }
};
root.HBKit = HB;
})(typeof window !== 'undefined' ? window : globalThis);

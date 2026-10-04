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

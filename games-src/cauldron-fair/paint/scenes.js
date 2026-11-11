// Cauldron Fair painted scenes: the cauldron itself, the wooden fair table, the four makers, the title picture.
'use strict';
const B = require('./brush.js');
const { f, rng, mix, lit, drk, blob, circ, ell, rrect, pillow, taper, part, shadow, inkLine, sparkle, face, strokes, INK } = B;

// ---------------- the cauldron seen from above (512 canvas; the potion fills most of it; the game draws the spaces on top) ----------------
function cauldron(seed) {
  const r = rng(seed); let s = '';
  s += shadow(circ(256, 270, 250), .45, 'soft3', 4, 14);
  // iron body ring + highlights
  s += part(blob(256, 256, 252, 252, .004, seed, 40), '#3b3238', { box: [0, 0, 512, 512], st: { n: 18, w: 30, ang: 20, op: .3 }, seed });
  s += part(blob(256, 256, 236, 236, .004, seed + 1, 40), '#58505a', { box: [20, 20, 492, 492], st: { n: 18, w: 26, ang: -25, op: .32 }, seed: seed + 1, filter: 'paintS' });
  // rivets on the rim
  let rv = ''; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, x = 256 + Math.cos(a) * 244, y = 256 + Math.sin(a) * 244; rv += `<circle cx="${f(x)}" cy="${f(y)}" r="5.5" fill="#8a8290" stroke="#2a2228" stroke-width="2"/>`; }
  s += `<g>${rv}</g>`;
  // the potion
  s += part(blob(256, 256, 214, 214, .004, seed + 2, 40), '#2a8a80', { box: [40, 40, 472, 472], st: { n: 34, w: 30, ang: 15, bend: .6, op: .42 }, seed: seed + 2, filter: 'paintS',
    inner: `<circle cx="256" cy="256" r="220" fill="url(#pot)"/>` });
  // swirling currents
  let sw = ''; for (let k = 0; k < 4; k++) { const rr = 60 + k * 44; sw += `<path d="${taper([[256 - rr, 256], [256, 256 - rr * .98], [256 + rr, 256], [256 + rr * .2, 256 + rr * .96]], 4, 10, 3)}" fill="#a8f0dc" opacity=".22"/>`; }
  s += `<g filter="url(#wob)">${sw}</g>`;
  // bubbles
  let bb = ''; for (let i = 0; i < 16; i++) { const a = r() * Math.PI * 2, d = 40 + r() * 170, rad = 6 + r() * 14; bb += `<circle cx="${f(256 + Math.cos(a) * d)}" cy="${f(256 + Math.sin(a) * d)}" r="${f(rad)}" fill="#d9fff4" opacity=".45" stroke="#e8fff8" stroke-width="2"/>`; }
  s += `<g filter="url(#wob)">${bb}</g>`;
  s += `<path d="${taper([[70, 190], [110, 110], [210, 62]], 5, 18, 4)}" fill="#fff" opacity=".35" filter="url(#soft2)"/>`;
  s += `<defs><radialGradient id="pot" cx="50%" cy="45%" r="62%"><stop offset="0" stop-color="#6fe0c4" stop-opacity=".55"/><stop offset=".7" stop-color="#2a8a80" stop-opacity=".2"/><stop offset="1" stop-color="#16504c" stop-opacity=".75"/></radialGradient></defs>`;
  return s;
}
// ---------------- the wooden fair table (the board background; 1280 x 720) ----------------
function table(seed, W, H) {
  const r = rng(seed); let s = `<rect width="${W}" height="${H}" fill="#5b3a26"/>`;
  let pl = ''; const ph = 90; for (let y = 0, k = 0; y < H + ph; y += ph, k++) { const col = ['#6b4430', '#5f3c28', '#704a34', '#643f2a'][k % 4]; pl += `<rect x="-10" y="${y}" width="${W + 20}" height="${ph - 4}" fill="${col}"/>`; for (let g = 0; g < 7; g++) { const gy = y + 10 + r() * (ph - 24), x0 = r() * W - 100, len = 200 + r() * 500; pl += `<path d="M${f(x0)} ${f(gy)}q${f(len / 4)} ${f((r() - .5) * 8)} ${f(len / 2)} 0t${f(len / 2)} ${f((r() - .5) * 8)}" stroke="#3a2214" stroke-width="${f(1 + r() * 2)}" fill="none" opacity=".35"/>`; } pl += `<path d="M-10 ${y + ph - 4}H${W + 10}" stroke="#2a180e" stroke-width="5" opacity=".6"/>`; }
  s += `<g filter="url(#paintN)">${pl}</g>`;
  // a dark red cloth runner and a warm lantern light
  s += `<g filter="url(#paintN)"><rect x="${W * .06}" y="-10" width="${W * .88}" height="${H + 20}" rx="26" fill="#6a2a3a" opacity=".62"/><rect x="${W * .06 + 14}" y="6" width="${W * .88 - 28}" height="${H - 12}" rx="20" fill="none" stroke="#e0b060" stroke-width="5" stroke-dasharray="3 14" opacity=".55"/></g>`;
  s += `<defs><radialGradient id="warmL" cx="50%" cy="42%" r="64%"><stop offset="0" stop-color="#ffd890" stop-opacity=".42"/><stop offset=".6" stop-color="#ff9a50" stop-opacity=".1"/><stop offset="1" stop-color="#1a0c18" stop-opacity=".72"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#warmL)"/>`;
  return s;
}
// ---------------- the four makers (512 busts) ----------------
const CHAR = [
  { id: 'wynne', cloth: '#3fa04a', skin: '#f0c9a0', hair: '#7a4a2a', mood: 'smile' },
  { id: 'odo', cloth: '#e8b425', skin: '#e2b084', hair: '#3a2a1a', mood: 'happy' },
  { id: 'tamsin', cloth: '#3b82d6', skin: '#f3d2b0', hair: '#c97a2a', mood: 'dreamy' },
  { id: 'mirabel', cloth: '#d6392f', skin: '#c98a62', hair: '#2a1a14', mood: 'cheeky' }];
function charInner(i, seed) {
  const c = CHAR[i % 4], r = rng(seed); let s = '';
  s += shadow(blob(256, 470, 190, 60, .02, seed, 12), .3, 'soft', 6, 8);
  // shoulders and tunic
  const sh = 'M60 512C60 420 140 380 256 380C372 380 452 420 452 512Z';
  s += part(sh, c.cloth, { box: [50, 370, 462, 512], st: { n: 10, w: 26, ang: 70, op: .3 }, seed });
  s += `<g filter="url(#wob)">${inkLine([[206, 384], [256, 440], [306, 384]], 12, drk(c.cloth, .35))}</g>`;
  s += part('M226 330L226 392Q256 412 286 392L286 330Z', c.skin, { filter: 'paintS', box: [220, 320, 292, 410], noStrokes: true });
  // back hair
  if (i === 0) s += part(blob(256, 250, 150, 170, .03, seed + 3, 14), c.hair, { box: [100, 90, 412, 420], filter: 'paintS', seed: seed + 3 }) + [0, 1, 2].map(k => part(circ(110 + k * 8, 330 + k * 36, 26), c.hair, { filter: 'paintS', box: [70, 300, 160, 460], noStrokes: true })).join('');
  if (i === 2) s += part(blob(256, 260, 140, 160, .03, seed + 3, 14), c.hair, { box: [110, 100, 402, 420], filter: 'paintS', seed: seed + 3 });
  if (i === 3) s += part(circ(256, 82, 56), c.hair, { box: [190, 20, 322, 140], filter: 'paintS', noStrokes: true });
  // head
  s += part(blob(256, 244, 108, 126, .02, seed + 4, 16), c.skin, { box: [140, 110, 372, 372], st: { n: 8, w: 22, op: .2 }, seed: seed + 4 });
  // front hair / hats
  if (i === 0) s += part('M150 236C146 130 210 98 258 98C310 98 366 134 362 236C340 176 300 156 256 156C214 156 170 176 150 236Z', c.hair, { filter: 'paintS', box: [140, 90, 372, 240], seed: seed + 5 }) + part('M140 150C170 120 340 120 372 150L366 176C320 150 190 150 146 176Z', '#3fa04a', { filter: 'paintS', box: [130, 110, 380, 190], noStrokes: true }) + part(blob(366, 150, 20, 26, .1, seed, 8), '#58b564', { filter: 'paintS', box: [340, 120, 392, 180], noStrokes: true });
  if (i === 1) s += part('M96 180C96 156 176 140 256 140C336 140 416 156 416 180C416 204 336 212 256 212C176 212 96 204 96 180Z', '#e8c86a', { filter: 'paint', box: [90, 130, 422, 220], st: { n: 16, w: 12, ang: 10, op: .5 }, seed: seed + 5 }) + part('M178 168C178 96 334 96 334 168Z', '#e8c86a', { filter: 'paint', box: [170, 90, 340, 176], st: { n: 12, w: 10, ang: 90, op: .5 }, seed: seed + 6 }) + `<path d="M178 166Q256 188 334 166" stroke="#c0392b" stroke-width="12" fill="none"/>` + part('M200 292Q256 276 312 292Q300 316 256 306Q212 316 200 292Z', '#4a2a1a', { filter: 'paintS', box: [196, 270, 316, 322], noStrokes: true });
  if (i === 2) s += part('M130 190C170 110 230 40 300 -6C310 60 336 120 382 190Q256 150 130 190Z', '#3b6bb8', { filter: 'paint', box: [120, -10, 390, 200], st: { n: 14, w: 16, ang: 70, op: .4 }, seed: seed + 5 }) + `<path d="M130 190Q256 168 382 190" stroke="#f2c230" stroke-width="12" fill="none"/>` + [[250, 88], [300, 130], [210, 140]].map(([x, y]) => sparkle(x, y, 16, '#fff6c8')).join('') + `<path d="${taper([[330, 80], [360, 20], [400, 4]], 3, 12, 3)}" fill="#fff" stroke="${INK}" stroke-width="3"/>`;
  if (i === 3) s += part('M150 232C146 140 210 112 258 112C306 112 366 140 362 232C340 180 300 168 256 168C212 168 170 180 150 232Z', c.hair, { filter: 'paintS', box: [140, 100, 372, 240], seed: seed + 5 }) + part(rrect(160, 134, 192, 36, 14), '#6a4a3a', { filter: 'paintS', box: [150, 120, 362, 180], noStrokes: true }) + [200, 312].map(x => part(circ(x, 152, 26), '#9ad8e8', { filter: 'paintS', box: [x - 30, 120, x + 30, 184], noStrokes: true, inner: sparkle(x - 8, 142, 8, '#fff') })).join('');
  s += face(256, 248, 1.9, c.mood, c.skin);
  if (i === 0) s += sparkle(392, 330, 12, '#fff6c8');
  return s;
}
function chr(i, seed) { return `<defs><clipPath id="bustc"><circle cx="256" cy="256" r="252"/></clipPath></defs><g clip-path="url(#bustc)">${part(circ(256, 256, 252), ['#bfe6c4', '#f6e2a0', '#bcd4f4', '#f4b8b0'][i % 4], { box: [0, 0, 512, 512], st: { n: 10, w: 40, op: .35 }, seed, filter: 'paintN' })}${charInner(i, seed)}</g>`; }
// ---------------- the title picture (1600 x 900) ----------------
function title(seed, W, H) {
  const r = rng(seed); let s = '';
  s += `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1a4a"/><stop offset=".45" stop-color="#8a4a8a"/><stop offset=".75" stop-color="#f09a6a"/><stop offset="1" stop-color="#f6c47a"/></linearGradient>
<radialGradient id="lg" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe0a0" stop-opacity=".9"/><stop offset="1" stop-color="#ffb050" stop-opacity="0"/></radialGradient>
<radialGradient id="vig3" cx="50%" cy="55%" r="75%"><stop offset=".55" stop-color="#1a0c24" stop-opacity="0"/><stop offset="1" stop-color="#1a0c24" stop-opacity=".7"/></radialGradient></defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  let st = ''; for (let i = 0; i < 40; i++) st += sparkle(r() * W, r() * H * .35, 4 + r() * 6, '#fff3c8'); s += `<g opacity=".8">${st}</g>`;
  // far hills + village roofs
  s += part(`M0 560C200 480 380 520 560 500C760 478 960 530 1160 500C1340 478 1480 520 ${W} 490V700H0Z`, '#5a3a6a', { box: [0, 440, W, 700], filter: 'paintN', st: { n: 10, w: 40, op: .3 }, seed });
  let roofs = ''; for (let i = 0; i < 9; i++) { const x = 80 + i * 170 + r() * 40, y = 540 + r() * 20; roofs += `<path d="M${x} ${y}l40 -44l40 44z" fill="#3a2a52"/><rect x="${x + 6}" y="${y}" width="68" height="40" fill="#4a3462"/><rect x="${x + 28}" y="${y + 12}" width="14" height="14" fill="#ffd890"/>`; }
  s += `<g filter="url(#paintS)">${roofs}</g>`;
  // striped tents
  const tent = (cx, base, w, h2, c1, c2) => { let t = ''; const n = 8; for (let i = 0; i < n; i++) { const x0 = cx - w / 2 + i * w / n, x1 = x0 + w / n; t += `<path d="M${f(cx)} ${f(base - h2)}L${f(x0)} ${base}L${f(x1)} ${base}Z" fill="${i % 2 ? c2 : c1}"/>`; } return `<g filter="url(#paintS)">${t}<rect x="${f(cx - w / 2)}" y="${base}" width="${w}" height="${h2 * .34}" fill="${drk(c1, .35)}"/><path d="M${f(cx - w * .12)} ${base}V${f(base + h2 * .34)}H${f(cx + w * .12)}V${base}Z" fill="#2a1830"/></g>`; };
  s += tent(250, 640, 360, 250, '#d6392f', '#f8eed8') + tent(1350, 650, 380, 270, '#3b82d6', '#f8eed8') + tent(820, 620, 300, 190, '#8a55c4', '#f2d278');
  // bunting
  const bun = (y0, y1) => { let b = `<path d="M0 ${y0}Q${W / 2} ${y1} ${W} ${y0}" stroke="#2a1830" stroke-width="4" fill="none"/>`; const cols = ['#d6392f', '#f2c230', '#3fa04a', '#3b82d6', '#8a55c4']; for (let i = 0; i < 26; i++) { const t = (i + .5) / 26, x = t * W, y = (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * y1 + t * t * y0 + 0; b += `<path d="M${f(x - 18)} ${f(y)}L${f(x + 18)} ${f(y)}L${f(x)} ${f(y + 46)}Z" fill="${cols[i % 5]}" stroke="#2a1830" stroke-width="2.5"/>`; } return `<g filter="url(#paintS)">${b}</g>`; };
  s += bun(80, 190) + bun(150, 250);
  // lanterns
  for (const [x, y, sc] of [[120, 330, 1], [W - 120, 320, 1], [520, 300, .8], [1080, 290, .8]]) s += `<circle cx="${x}" cy="${y}" r="${150 * sc}" fill="url(#lg)"/><path d="M${x} 150V${y - 40}" stroke="#2a1830" stroke-width="3"/>` + part(ell(x, y, 34 * sc, 46 * sc), '#f2a23a', { filter: 'paintS', box: [x - 40 * sc, y - 50 * sc, x + 40 * sc, y + 50 * sc], noStrokes: true });
  // ground and the foreground table
  s += part(`M0 700H${W}V${H}H0Z`, '#6a4430', { box: [0, 690, W, H], filter: 'paintN', st: { n: 16, w: 30, ang: 2, op: .3 }, seed: seed + 2 });
  s += part(`M-20 ${H - 190}H${W + 20}V${H + 10}H-20Z`, '#8a5a32', { box: [-20, H - 200, W + 20, H + 10], filter: 'paintN', st: { n: 20, w: 20, ang: 1, op: .3 }, seed: seed + 3 });
  // the big cauldron in the middle
  const cx = W / 2, cy = H - 300;
  s += `<g transform="translate(${cx - 270} ${cy - 250}) scale(1.05)">${cauldron(seed + 9)}</g>`;
  // steam
  for (let k = 0; k < 6; k++) s += `<path d="${taper([[cx - 160 + k * 64, cy - 90], [cx - 190 + k * 64 + (k % 2) * 30, cy - 190], [cx - 150 + k * 64, cy - 290], [cx - 190 + k * 64, cy - 380]], 12, 34, 6)}" fill="#fff" opacity=".28" filter="url(#soft2)"/>`;
  // the four makers at the table edge
  [[250, 1, .62], [W - 250, 3, .62], [560, 0, .78], [1040, 2, .78]].forEach(([x, i, sc]) => { s += `<g transform="translate(${f(x - 256 * sc)} ${f(H - 130 - 440 * sc)}) scale(${sc})">${charInner(i, seed + 21 + i * 5)}</g>`; });
  s += sparkle(cx - 90, cy - 300, 26, '#fff6c8') + sparkle(cx + 130, cy - 360, 20, '#fff6c8') + sparkle(cx + 10, cy - 250, 16, '#fff6c8');
  s += `<rect width="${W}" height="${H}" fill="url(#vig3)"/>`;
  return s;
}
module.exports = { cauldron, table, chr, charInner, title, CHAR };

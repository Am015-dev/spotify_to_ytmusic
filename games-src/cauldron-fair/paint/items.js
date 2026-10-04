// Cauldron Fair painted items: chips, bag, flask, ruby, droplet, rat stone, smoke, splash, bubble, parchment pad, crystal ball, book.
// Each returns the inner SVG for a 512 x 512 canvas (centre 256,256) on a transparent background. No text: the game draws numbers itself.
'use strict';
const B = require('./brush.js');
const { f, rng, mix, lit, drk, blob, circ, ell, rrect, pillow, taper, part, shadow, inkLine, sparkle, INK } = B;
const COL = { W: '#f1ead6', O: '#f08a22', G: '#3fa04a', B: '#3b82d6', R: '#d6392f', Y: '#f2c230', P: '#8a55c4', K: '#3a3238' };

// ---------------- a round chip: dark rim, coloured disc, notched ring, a small picture, a glint ----------------
function disc(col, seed) {
  let s = shadow(circ(256, 270, 226), .38, 'soft', 6, 12);
  s += part(blob(256, 256, 230, 230, .006, seed, 30), drk(col, .42), { box: [20, 20, 492, 492], st: { n: 14, w: 22, ang: -30, op: .3 }, seed });
  s += part(blob(256, 256, 204, 204, .006, seed + 1, 30), col, { box: [50, 50, 462, 462], st: { n: 20, w: 26, ang: -40, op: .4 }, seed: seed + 1 });
  // notches around the rim
  let n = ''; for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; n += inkLine([[256 + Math.cos(a) * 176, 256 + Math.sin(a) * 176], [256 + Math.cos(a + .05) * 192, 256 + Math.sin(a + .05) * 192]], 9, lit(col, .55), .8); }
  s += `<g filter="url(#wob)" opacity=".75">${n}</g>`;
  s += `<circle cx="256" cy="256" r="150" fill="none" stroke="${lit(col, .4)}" stroke-width="7" opacity=".55"/>`;
  s += `<path d="${taper([[96, 190], [140, 110], [250, 68]], 5, 16, 4)}" fill="#fff" opacity=".5" filter="url(#soft2)"/>`;
  return s;
}
function picture(c, seed) {
  const col = COL[c], lt = lit(col, .5), dk = drk(col, .45);
  const P = (d, base, o) => part(d, base, Object.assign({ filter: 'paintS', box: [100, 80, 412, 400], st: { n: 6, w: 14, op: .35 }, seed: seed + 5 }, o || {}));
  switch (c) {
    case 'W': return P(blob(256, 236, 78, 78, .05, seed + 2, 12), '#fff8e6') + [0, 1, 2, 3, 4, 5].map(i => { const a = -Math.PI / 2 + i * Math.PI / 3 + .3; return inkLine([[256 + Math.cos(a) * 92, 236 + Math.sin(a) * 92], [256 + Math.cos(a) * 128, 236 + Math.sin(a) * 128]], 11, '#c9852a'); }).join('') + sparkle(222, 206, 22, '#fff');
    case 'O': return P(blob(256, 244, 98, 74, .04, seed + 2, 14), lit(col, .25)) + `<g filter="url(#wob)">${[-52, -24, 0, 24, 52].map(x => inkLine([[256 + x * 1.2, 180], [256 + x * 1.5, 244], [256 + x * 1.2, 306]], 7, drk(col, .3), .7)).join('')}</g>` + P('M248 176Q252 140 280 124L292 140Q268 150 266 178Z', '#4a8a3a');
    case 'G': return P(taper([[256, 340], [256, 250], [256, 140]], 9, 14, 6), '#2f7a38', { box: [230, 130, 282, 350] }) + [['M256 220C214 224 176 196 168 160C214 156 250 180 256 220Z', 0], ['M256 270C300 272 338 244 346 206C300 204 262 228 256 270Z', 1], ['M256 324C216 326 184 306 176 276C216 274 250 292 256 324Z', 2]].map(([d, i]) => P(d, i % 2 ? lit(col, .3) : lit(col, .45), { box: [160, 150, 360, 340] })).join('');
    case 'B': return P('M180 340C190 260 224 190 330 132C324 206 292 276 214 330Z', lit(col, .5), { box: [170, 120, 340, 350] }) + `<g filter="url(#wob)">${inkLine([[186, 336], [236, 262], [296, 188], [328, 140]], 8, drk(col, .35))}${[[216, 290, 252, 306], [246, 248, 282, 262], [278, 206, 308, 214]].map(a => inkLine([[a[0], a[1]], [a[2], a[3]]], 6, drk(col, .4), .8)).join('')}</g>`;
    case 'R': return P('M126 270C126 176 190 128 256 128C322 128 386 176 386 270Z', lit(col, .22), { box: [120, 120, 392, 280] }) + [[200, 200, 20], [296, 184, 17], [320, 236, 14], [238, 240, 12]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fffaf0" stroke="${dk}" stroke-width="3" opacity=".95"/>`).join('') + P('M212 276L214 352Q256 380 298 352L300 276Z', '#f3e6c8', { box: [200, 270, 312, 380] });
    case 'Y': return P('M256 140C230 190 196 236 204 288C212 334 238 352 256 360C274 352 300 334 308 288C316 236 282 190 256 140Z', lit(col, .2), { box: [190, 130, 320, 370] }) + `<g filter="url(#wob)">${inkLine([[256, 150], [214, 100]], 9, '#3a6a2a')}${inkLine([[256, 150], [258, 86]], 9, '#3a6a2a')}${inkLine([[256, 150], [300, 102]], 9, '#3a6a2a')}</g><circle cx="238" cy="250" r="7" fill="${dk}"/><circle cx="276" cy="300" r="7" fill="${dk}"/>`;
    case 'P': return `<g filter="url(#wob)">${taper([[256, 360], [186, 340], [168, 270], [220, 230], [290, 244], [302, 296], [262, 318], [236, 286], [262, 270]], 6, 20, 5) ? `<path d="${taper([[256, 360], [186, 344], [168, 274], [222, 228], [294, 246], [306, 300], [262, 322], [234, 288], [262, 266]], 10, 24, 6)}" fill="${lit(col, .6)}" stroke="${dk}" stroke-width="4"/>` : ''}<path d="${taper([[318, 190], [346, 140], [390, 150], [380, 190], [350, 176]], 6, 16, 4)}" fill="${lit(col, .5)}" stroke="${dk}" stroke-width="3"/></g>` + sparkle(150, 190, 16, '#fff');
    case 'K': return `<g filter="url(#wob)"><path d="M256 150L256 360" stroke="${lit(col, .5)}" stroke-width="22" stroke-linecap="round"/></g>` + P('M256 230C220 140 140 140 120 220C150 250 210 266 256 262C302 266 362 250 392 220C372 140 292 140 256 230Z', lit(col, .35), { box: [110, 130, 400, 280] }) + `<circle cx="236" cy="190" r="9" fill="${COL.Y}"/><circle cx="276" cy="190" r="9" fill="${COL.Y}"/>` + inkLine([[246, 150], [228, 112]], 6, lit(col, .5)) + inkLine([[266, 150], [284, 112]], 6, lit(col, .5));
  }
  return '';
}
function chip(c, seed) { return disc(COL[c], seed) + picture(c, seed); }

// ---------------- cloth bag ----------------
function bag(seed) {
  let s = shadow('M110 440Q256 480 402 440Q420 470 256 482Q92 470 110 440Z', .35, 'soft', 6, 8);
  const body = 'M150 150C120 200 80 270 92 350C104 430 180 470 256 470C332 470 408 430 420 350C432 270 392 200 362 150Z';
  s += part(body, '#c9a06a', { box: [80, 140, 432, 480], st: { n: 20, w: 30, ang: 60, op: .4 }, seed, inner: [0, 1, 2, 3].map(i => `<path d="M${130 + i * 90} 170Q${110 + i * 90} 320 ${140 + i * 90} 460" stroke="#a37a46" stroke-width="5" fill="none" opacity=".5"/>`).join('') + `<ellipse cx="200" cy="300" rx="70" ry="110" fill="#e2c28c" opacity=".38" filter="url(#soft)"/>` });
  s += part('M140 160C180 190 332 190 372 160C360 128 300 112 256 112C212 112 152 128 140 160Z', '#a67a40', { filter: 'paintS', box: [130, 100, 390, 200], seed: seed + 3 });
  s += `<g filter="url(#wob)">${inkLine([[130, 170], [256, 200], [382, 170]], 22, '#8a2a2a')}</g>`;
  s += part('M232 168C222 140 240 110 256 104C272 110 290 140 280 168Z', '#8a2a2a', { filter: 'paintS', box: [220, 100, 292, 180], noStrokes: true });
  s += part(circ(256, 330, 62), '#e8c98a', { filter: 'paintS', box: [190, 270, 322, 394], noStrokes: true, inner: `<path d="M226 330Q256 280 286 330Q256 360 226 330Z" fill="#8a5a2a" opacity=".55"/>` });
  return s;
}
// ---------------- flask (full / empty) ----------------
function flask(full, seed) {
  const g = 'M210 90H302V190L402 390C420 428 396 462 354 462H158C116 462 92 428 110 390L210 190Z';
  let s = shadow(g, .3, 'soft', 8, 10);
  s += part(g, full ? '#d6f0ee' : '#eee6d4', { box: [90, 80, 420, 470], st: { n: 8, w: 22, op: .22 }, seed, filter: 'paintW', inner: full ? `<path d="M120 330H392L404 392C416 424 394 452 354 452H158C118 452 96 424 108 392Z" fill="#5fc6a8" opacity=".95"/><path d="M120 330Q190 306 256 330T392 330" stroke="#c9f5e6" stroke-width="10" fill="none"/>` + [[190, 380, 16], [250, 410, 11], [310, 372, 14], [350, 420, 9]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#e6fff6" opacity=".85" stroke="#2b7a66" stroke-width="3"/>`).join('') : `<path d="M150 440H362" stroke="#b8a888" stroke-width="8" stroke-dasharray="14 14" opacity=".7"/>` });
  s += part('M200 70H312L320 100H192Z', '#9a6a3a', { filter: 'paintS', box: [190, 60, 322, 108], noStrokes: true });
  s += `<path d="M232 120V190L150 330" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".6" fill="none" filter="url(#soft2)"/>`;
  return s;
}
// ---------------- ruby, droplet, rat stone ----------------
function ruby(seed) {
  let s = shadow('M256 70L396 190L256 450L116 190Z', .3, 'soft', 6, 10);
  s += part('M256 70L396 190L256 450L116 190Z', '#e0334c', { box: [110, 60, 400, 460], st: { n: 8, w: 20, op: .32 }, seed, inner: `<path d="M116 190H396M196 190L256 70L316 190M196 190L256 450M316 190L256 450" stroke="#ff9aa8" stroke-width="8" fill="none" opacity=".8"/><path d="M150 180L230 90L252 150Z" fill="#fff" opacity=".45"/>` });
  s += sparkle(160, 130, 26, '#fff');
  return s;
}
function droplet(seed) {
  const d = 'M256 60C190 180 130 250 130 330A126 126 0 0 0 382 330C382 250 322 180 256 60Z';
  let s = shadow(d, .35, 'soft', 6, 10);
  s += part(d, '#d83a2e', { box: [120, 50, 392, 470], st: { n: 10, w: 22, op: .3 }, seed, inner: `<ellipse cx="200" cy="320" rx="30" ry="64" fill="#fff" opacity=".5" transform="rotate(14 200 320)" filter="url(#soft2)"/>` });
  return s;
}
function ratStone(seed) {
  let s = shadow(ell(256, 300, 150, 100), .35, 'soft', 6, 10);
  s += part(blob(256, 290, 150, 96, .06, seed, 14), '#8f8a82', { box: [100, 190, 412, 390], st: { n: 12, w: 26, op: .3 }, seed });
  s += part(ell(342, 236, 52, 44), '#a59a8c', { filter: 'paintS', box: [286, 190, 400, 284], noStrokes: true }) + part(ell(330, 196, 26, 24), '#d9b3a8', { filter: 'paintS', box: [300, 170, 360, 224], noStrokes: true });
  s += `<circle cx="366" cy="232" r="7" fill="#222"/><path d="M398 246l22 6" stroke="#4a3a2a" stroke-width="5" stroke-linecap="round"/>`;
  s += `<path d="${taper([[130, 320], [70, 330], [50, 390], [100, 420]], 6, 14, 4)}" fill="#d9a898" stroke="${INK}" stroke-width="3"/>`;
  return s;
}
// ---------------- smoke puff, splash, bubble ----------------
function puff(seed) {
  const r = rng(seed); let s = '';
  for (let i = 0; i < 9; i++) { const a = r() * Math.PI * 2, d = r() * 90, rr = 70 + r() * 60; s += `<circle cx="${f(256 + Math.cos(a) * d)}" cy="${f(256 + Math.sin(a) * d)}" r="${f(rr)}" fill="${i % 2 ? '#e8e0d4' : '#cfc4b8'}" opacity=".78" filter="url(#soft2)"/>`; }
  return `<g filter="url(#wob)">${s}</g><circle cx="256" cy="256" r="90" fill="#f6f0e6" opacity=".7" filter="url(#soft)"/>`;
}
function splash(seed) {
  const r = rng(seed); let s = '';
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + r() * .2, d0 = 80 + r() * 30, d1 = 170 + r() * 50; s += `<path d="${taper([[256 + Math.cos(a) * d0, 256 + Math.sin(a) * d0], [256 + Math.cos(a) * (d0 + d1) / 2, 256 + Math.sin(a) * (d0 + d1) / 2], [256 + Math.cos(a) * d1, 256 + Math.sin(a) * d1]], 4, 20, 8)}" fill="#7fe0c8" stroke="#2a8a80" stroke-width="3"/><circle cx="${f(256 + Math.cos(a) * (d1 + 26))}" cy="${f(256 + Math.sin(a) * (d1 + 26))}" r="${f(8 + r() * 8)}" fill="#a8f0dc" stroke="#2a8a80" stroke-width="3"/>`; }
  return `<g filter="url(#wob)"><circle cx="256" cy="256" r="84" fill="none" stroke="#c9fff0" stroke-width="22" opacity=".85"/>${s}</g>`;
}
function bubble(seed) {
  return `<g filter="url(#wob)"><circle cx="256" cy="256" r="190" fill="#bff5e6" opacity=".35" stroke="#e6fff8" stroke-width="16"/><circle cx="256" cy="256" r="190" fill="none" stroke="#2a8a80" stroke-width="6" opacity=".7"/><path d="M130 190Q160 130 230 118" stroke="#fff" stroke-width="26" stroke-linecap="round" fill="none" opacity=".85"/><circle cx="330" cy="340" r="26" fill="#fff" opacity=".5"/></g>`;
}
// ---------------- a parchment pad for one spiral space (tinted by the game) ----------------
function pad(seed) {
  return shadow(circ(256, 264, 214), .28, 'soft', 4, 8) + part(blob(256, 256, 216, 216, .02, seed, 20), '#f4ecd2', { box: [30, 30, 482, 482], st: { n: 14, w: 26, ang: 30, op: .3 }, seed, filter: 'paintS', inner: `<circle cx="256" cy="256" r="170" fill="none" stroke="#c9b27a" stroke-width="7" opacity=".5"/>` });
}
// ---------------- crystal ball (the seer), open book ----------------
function seer(seed) {
  let s = part('M130 400Q256 460 382 400L352 450Q256 490 160 450Z', '#6a4a8a', { filter: 'paintS', box: [120, 390, 392, 492], seed });
  s += shadow(circ(256, 250, 170), .3, 'soft', 6, 12);
  s += part(circ(256, 250, 170), '#6aa8d8', { box: [80, 80, 432, 420], st: { n: 12, w: 28, op: .35 }, seed: seed + 1, inner: `<ellipse cx="256" cy="300" rx="130" ry="80" fill="#a8d8f0" opacity=".5" filter="url(#soft)"/>` + sparkle(256, 250, 60, '#fff6c8') });
  s += `<path d="M150 190Q180 130 250 110" stroke="#fff" stroke-width="22" stroke-linecap="round" fill="none" opacity=".7" filter="url(#soft2)"/>`;
  return s;
}
function book(seed) {
  let s = shadow('M70 400Q256 440 442 400L442 440Q256 480 70 440Z', .3, 'soft', 6, 10);
  s += part('M256 150C200 120 120 120 70 150V390C120 360 200 360 256 390Z', '#f3e6c4', { box: [60, 110, 260, 400], st: { n: 8, w: 18, ang: 70, op: .25 }, seed, inner: [0, 1, 2, 3, 4].map(i => `<path d="M${100 + i * 0} ${200 + i * 36}H${230}" stroke="#a88a54" stroke-width="7" opacity=".55" stroke-linecap="round"/>`).join('') });
  s += part('M256 150C312 120 392 120 442 150V390C392 360 312 360 256 390Z', '#f3e6c4', { box: [250, 110, 452, 400], st: { n: 8, w: 18, ang: 110, op: .25 }, seed: seed + 2, inner: [0, 1, 2, 3, 4].map(i => `<path d="M${282} ${200 + i * 36}H${412}" stroke="#a88a54" stroke-width="7" opacity=".55" stroke-linecap="round"/>`).join('') });
  s += `<g filter="url(#wob)"><path d="M256 150V390" stroke="#6a3a22" stroke-width="12"/></g>`;
  s += part('M230 150H282V250L256 232L230 250Z', '#d6392f', { filter: 'paintS', box: [226, 140, 286, 260], noStrokes: true });
  return s;
}
const ITEMS = { chip, bag, flask, ruby, droplet, ratStone, puff, splash, bubble, pad, seer, book };
module.exports = ITEMS;

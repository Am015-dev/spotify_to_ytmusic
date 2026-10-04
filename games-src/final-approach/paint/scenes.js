// Final Approach painted scenes: panel plate, window frames, skies, terrain strips, tray and screen, airliner profile, crew busts, title and ending paintings.
'use strict';
const B = require('./brush.js'), I = require('./items.js');
const { f, rng, mix, lit, drk, blob, circ, ell, rrect, pillow, taper, part, shadow, inkLine, sparkle, face, INK } = B;

// rounded rect drawn counter-clockwise (to cut holes with the non-zero rule)
function rrectCCW(x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); return `M${f(x + r)} ${f(y)}Q${f(x)} ${f(y)} ${f(x)} ${f(y + r)}V${f(y + h - r)}Q${f(x)} ${f(y + h)} ${f(x + r)} ${f(y + h)}H${f(x + w - r)}Q${f(x + w)} ${f(y + h)} ${f(x + w)} ${f(y + h - r)}V${f(y + r)}Q${f(x + w)} ${f(y)} ${f(x + w - r)} ${f(y)}Z`; }

// ---------- plate: the enamel panel everything sits on (opaque, 1024 x 640) ----------
function plate(seed, W, H) {
  const r = rng(seed); let s = `<defs><linearGradient id="pl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f5a68"/><stop offset=".55" stop-color="#274a58"/><stop offset="1" stop-color="#1d3a47"/></linearGradient><radialGradient id="pv" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#06121a" stop-opacity=".55"/></radialGradient></defs>`;
  s += `<g filter="url(#paintN)"><rect x="-6" y="-6" width="${W + 12}" height="${H + 12}" fill="url(#pl)"/>`;
  for (let i = 0; i < 70; i++) { const x0 = r() * W - 60, y0 = r() * H, len = 160 + r() * 420, c = r() < .5 ? '#6fa3b2' : '#10262f'; s += `<path d="M${f(x0)} ${f(y0)}q${f(len / 3)} ${f((r() - .5) * 14)} ${f(len / 2)} ${f((r() - .5) * 6)}t${f(len / 2)} 0" stroke="${c}" stroke-width="${f(6 + r() * 16)}" opacity="${f(.05 + r() * .09)}" fill="none" stroke-linecap="round"/>`; }
  s += `</g><rect width="${W}" height="${H}" fill="url(#pv)"/>`;
  // screws in the corners
  for (const [x, y] of [[26, 26], [W - 26, 26], [26, H - 26], [W - 26, H - 26]]) s += `<circle cx="${x}" cy="${y}" r="9" fill="#8a97a3" stroke="#10202a" stroke-width="3"/><path d="M${x - 6} ${y - 1}L${x + 6} ${y + 2}" stroke="#10202a" stroke-width="2.4"/>`;
  return s;
}
// ---------- frame: window bezel, nine-slice 256 x 128, hole in the middle ----------
function frame(seed) {
  const W = 256, H = 128, t = 26;
  let s = shadow(rrect(6, 8, W - 12, H - 12, 26), .4, 'soft2', 2, 6);
  s += part(rrect(4, 4, W - 8, H - 8, 28) + rrectCCW(4 + t, 4 + t, W - 8 - 2 * t, H - 8 - 2 * t, 12), '#a9b4bf', { filter: 'paintS', box: [4, 4, W - 4, H - 4], st: { n: 16, w: 14, ang: -20, op: .32 }, seed });
  s += `<path d="${rrectCCW(4 + t - 2, 4 + t - 2, W - 8 - 2 * t + 4, H - 8 - 2 * t + 4, 14)}" fill="none" stroke="#10202a" stroke-width="5" opacity=".9"/>`;
  s += `<path d="${rrectCCW(4 + t + 1, 4 + t + 1, W - 8 - 2 * t - 2, H - 8 - 2 * t - 2, 10)}" fill="none" stroke="#fff" stroke-width="2.4" opacity=".28"/>`;
  return s;
}
// ---------- skies (1024 x 192) ----------
const SKY = {
  dawn: { top: '#5d78c8', mid: '#f3a58b', low: '#ffd7a0', sun: '#fff1c6', sunX: 760 },
  day: { top: '#3e91e0', mid: '#8cc9f2', low: '#d5eefc', sun: '#fffbe0', sunX: 300 },
  dusk: { top: '#35457f', mid: '#b3567a', low: '#f7a45c', sun: '#ffe2a0', sunX: 220 },
  night: { top: '#0d1a33', mid: '#1c3358', low: '#3a5a86', sun: '#e9efff', sunX: 820 }
};
function sky(kind, seed) {
  const K = SKY[kind], r = rng(seed), W = 1024, H = 192; let s = `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${K.top}"/><stop offset=".6" stop-color="${K.mid}"/><stop offset="1" stop-color="${K.low}"/></linearGradient></defs>`;
  s += `<g filter="url(#paintN)"><rect width="${W}" height="${H}" fill="url(#sk)"/>`;
  for (let i = 0; i < 26; i++) { const x0 = r() * W - 80, y0 = r() * H, len = 120 + r() * 340; s += `<path d="M${f(x0)} ${f(y0)}q${f(len / 3)} ${f((r() - .5) * 10)} ${f(len / 2)} 0t${f(len / 2)} 0" stroke="${r() < .5 ? lit(K.mid, .35) : mix(K.top, '#000', .2)}" stroke-width="${f(5 + r() * 12)}" opacity="${f(.07 + r() * .1)}" fill="none" stroke-linecap="round"/>`; }
  s += `</g>`;
  if (kind === 'night') { for (let i = 0; i < 46; i++) s += `<circle cx="${f(r() * W)}" cy="${f(r() * H * .75)}" r="${f(1 + r() * 2.2)}" fill="#fff" opacity="${f(.4 + r() * .6)}"/>`; s += part(circ(K.sunX, 56, 26), '#f3f3e6', { filter: 'paintS', box: [K.sunX - 28, 28, K.sunX + 28, 84], noStrokes: true, seed }) + `<circle cx="${K.sunX + 9}" cy="50" r="22" fill="#2a3f68" opacity=".55"/>`; }
  else { s += `<circle cx="${K.sunX}" cy="${kind === 'day' ? 50 : 120}" r="${kind === 'day' ? 34 : 54}" fill="${K.sun}" opacity=".9" filter="url(#soft2)"/><circle cx="${K.sunX}" cy="${kind === 'day' ? 50 : 120}" r="${kind === 'day' ? 20 : 34}" fill="#fffef4"/>`; }
  // cloud banks
  const cloudCol = kind === 'night' ? '#44608a' : (kind === 'dusk' ? '#f2b4a0' : '#fffdf6');
  for (let i = 0; i < 6; i++) { const cx = 100 + i * 170 + r() * 60, cy = 90 + r() * 70; s += part(B.blob(cx, cy, 90 + r() * 40, 26 + r() * 10, .12, seed + i, 14), cloudCol, { filter: 'paintN', box: [cx - 130, cy - 40, cx + 130, cy + 40], st: { n: 5, w: 12, ang: 0, op: .2 }, seed: seed + i, op: kind === 'night' ? .55 : .8 }); }
  return s;
}
// ---------- terrain strips (1024 x 96, transparent above the silhouette) ----------
function terrain(kind, seed) {
  const r = rng(seed), W = 1024, H = 96; let s = '';
  const poly = (pts, col, o) => part(B.closed(pts), col, Object.assign({ filter: 'paintN', box: [0, 0, W, H], st: { n: 6, w: 20, ang: -10, op: .22 }, seed: seed + (o || 0) }, {}));
  if (kind === 'mountain') {
    const pts = [[-20, H + 10]]; for (let x = 0; x <= W + 40; x += 64) pts.push([x, 30 + r() * 38 - (x % 128 === 0 ? 20 : 0)]); pts.push([W + 20, H + 10]);
    s += poly(pts, '#5b6d86', 1); const p2 = [[-20, H + 10]]; for (let x = 0; x <= W + 40; x += 48) p2.push([x, 56 + r() * 26]); p2.push([W + 20, H + 10]); s += poly(p2, '#3c4d60', 2);
    for (let i = 0; i < 8; i++) { const x = 40 + i * 130 + r() * 40; s += `<path d="M${x} 28L${x + 16} 46L${x - 16} 46Z" fill="#fff" opacity=".75"/>`; }
  } else if (kind === 'water') {
    s += part(`M-10 ${H}V50Q200 38 400 50T800 50T1040 50V${H}Z`, '#2c6a9a', { filter: 'paintN', box: [0, 40, W, H], st: { n: 10, w: 16, ang: 0, op: .3 }, seed });
    for (let i = 0; i < 20; i++) s += `<path d="M${f(r() * W)} ${f(58 + r() * 34)}h${f(30 + r() * 60)}" stroke="#bfe6ff" stroke-width="4" opacity=".5" stroke-linecap="round"/>`;
  } else if (kind === 'city') {
    for (let x = -10; x < W + 20; x += 38 + r() * 26) { const h = 20 + r() * 52, w = 28 + r() * 22; s += part(rrect(x, H - h, w, h + 8, 3), mix('#34465c', '#8aa0b8', r() * .5), { filter: 'paintS', box: [x, H - h, x + w, H], st: { n: 3, w: 8, ang: 80, op: .2 }, seed: seed + x, inner: Array.from({ length: 6 }, () => `<rect x="${f(x + 4 + r() * (w - 12))}" y="${f(H - h + 6 + r() * (h - 14))}" width="5" height="6" fill="#ffd77a" opacity=".85"/>`).join('') }); }
  } else if (kind === 'ice') {
    const pts = [[-20, H + 10]]; for (let x = 0; x <= W + 40; x += 80) pts.push([x, 50 + r() * 22]); pts.push([W + 20, H + 10]); s += poly(pts, '#e8f2fa', 3);
    for (let i = 0; i < 10; i++) s += `<path d="M${f(r() * W)} ${f(60 + r() * 28)}l16 -14l16 14z" fill="#bcd4e8" opacity=".8"/>`;
  } else { // plain
    s += part(`M-10 ${H}V56Q150 42 300 54T600 52T900 56T1040 50V${H}Z`, '#58853c', { filter: 'paintN', box: [0, 40, W, H], st: { n: 10, w: 20, ang: 4, op: .26 }, seed });
    s += part(`M-10 ${H}V72Q200 60 420 70T820 68T1040 66V${H}Z`, '#3f6a2c', { filter: 'paintN', box: [0, 50, W, H], st: { n: 8, w: 20, ang: 4, op: .26 }, seed: seed + 3 });
  }
  return s;
}
// ---------- tray (felt) and privacy screen ----------
function tray(seed) {   // neutral felt, tinted blue / orange in the page; 512 x 128
  let s = shadow(rrect(10, 18, 492, 100, 30), .38, 'soft2', 3, 8);
  s += part(rrect(6, 10, 500, 104, 30), '#9aa5b0', { filter: 'paintS', box: [6, 10, 506, 114], st: { n: 12, w: 18, ang: 5, op: .3 }, seed });
  s += part(rrect(20, 24, 472, 76, 22), '#d9dde2', { filter: 'paintN', box: [20, 24, 492, 100], st: { n: 20, w: 8, ang: 15, op: .22 }, seed: seed + 1, inner: `<rect x="20" y="24" width="472" height="18" fill="#000" opacity=".18" filter="url(#soft2)"/>` });
  return s;
}
function screen(seed) {  // privacy screen seen from behind (your partner's side), 512 x 192
  let s = shadow(B.closed([[14, 176], [34, 28], [478, 28], [498, 176]]), .4, 'soft2', 3, 9);
  s += part(B.closed([[12, 172], [32, 24], [480, 24], [500, 172]]), '#27384f', { filter: 'paint', box: [10, 20, 502, 176], st: { n: 14, w: 22, ang: 90, op: .24 }, seed, inner: `<path d="M80 150L256 56L432 150" stroke="#c9a14a" stroke-width="10" fill="none" stroke-linecap="round" opacity=".55"/><g opacity=".7">${I.airliner(256, 98, .9, '#d9c07a', '#d9c07a').replace(/stroke="[^"]*"/g, 'stroke="#1d2a3c"')}</g>` });
  s += part(rrect(24, 150, 464, 24, 10), '#c9a14a', { filter: 'paintS', box: [24, 150, 488, 174], st: { n: 4, w: 8, ang: 0, op: .3 }, seed: seed + 1 });
  return s;
}
// ---------- airliner in profile, nose right (512 x 200) ----------
function planeSide(seed, o) {
  o = o || {}; const body = o.body || '#f8f5ec', accent = o.accent || '#2f6fd0';
  let s = shadow(ell(256, 176, 200, 10), .3, 'soft2', 0, 0);
  // far wing
  s += part(B.closed([[210, 112], [300, 96], [330, 102], [250, 126]]), drk(body, .18), { filter: 'paintS', box: [200, 90, 340, 130], noStrokes: true, seed: seed + 5 });
  // tail fin
  s += part(B.closed([[40, 106], [74, 20], [108, 20], [118, 108]]), accent, { filter: 'paintS', box: [30, 14, 124, 112], st: { n: 6, w: 14, ang: 60, op: .28 }, seed: seed + 6 });
  s += part(B.closed([[40, 118], [30, 100], [34, 94], [150, 106], [150, 126]]), drk(body, .06), { filter: 'paintS', box: [26, 90, 156, 130], noStrokes: true, seed: seed + 7 });
  // fuselage
  s += part(B.closed([[18, 122], [40, 92], [150, 78], [330, 74], [420, 82], [480, 104], [490, 122], [470, 140], [380, 150], [180, 150], [70, 148], [34, 138]]), body, { filter: 'paint', box: [10, 70, 500, 154], st: { n: 12, w: 18, ang: 2, op: .24 }, seed });
  s += part(B.closed([[30, 134], [70, 150], [180, 152], [380, 152], [470, 140], [488, 124], [470, 128], [380, 138], [180, 138], [60, 136]]), mix(accent, '#ffffff', .15), { filter: 'paintS', box: [10, 120, 500, 156], noStrokes: true, seed: seed + 1 });
  // cockpit windows and passenger windows
  s += part(B.closed([[430, 90], [466, 98], [476, 108], [432, 108]]), '#2d4d6e', { filter: 'paintS', box: [428, 88, 480, 110], noStrokes: true, seed: seed + 2 });
  for (let i = 0; i < 17; i++) s += `<rect x="${130 + i * 17}" y="98" width="9" height="11" rx="4" fill="#3a5878" stroke="${INK}" stroke-width="1.6"/>`;
  // near wing + engine
  s += part(B.closed([[210, 118], [300, 104], [352, 116], [262, 156], [230, 148]]), mix(body, '#cfd8e0', .4), { filter: 'paintS', box: [200, 100, 360, 160], st: { n: 5, w: 12, ang: 20, op: .22 }, seed: seed + 3 });
  s += part(ell(296, 150, 30, 16), '#bcc6d0', { filter: 'paintS', box: [262, 134, 332, 168], st: { n: 4, w: 8, ang: 0, op: .25 }, seed: seed + 4 }) + `<ellipse cx="324" cy="150" rx="8" ry="12" fill="#3a4654"/>`;
  if (o.gear) { for (const x of [330, 150]) s += `<path d="M${x} 150V176" stroke="#555e69" stroke-width="7"/><circle cx="${x}" cy="182" r="11" fill="#2a2f38" stroke="#aeb8c2" stroke-width="3"/>`; }
  return s;
}
// ---------- crew busts (256 x 256): captain and first officer in caps and headsets ----------
const CREW = [
  { skin: '#b9825a', cap: '#2c4f9a', band: '#f2b92c', hair: '#2a1d16', mood: 'proud', shirt: '#f4f1e8', tie: '#2f6fd0' },
  { skin: '#7a4f36', cap: '#d9701c', band: '#fff6df', hair: '#171211', mood: 'wink', shirt: '#f4f1e8', tie: '#e8821f' }];
function crew(i, seed) {
  const a = CREW[i], sk = a.skin; let s = '';
  const torso = 'M30 270C30 200 80 176 128 176C176 176 226 200 226 270Z';
  s += part(torso, a.shirt, { box: [30, 176, 226, 270], st: { n: 6, w: 20, ang: -20, op: .22 }, seed });
  s += part('M70 270C70 220 96 190 128 186C160 190 186 220 186 270Z', mix(a.cap, '#1b2640', .35), { filter: 'paintS', box: [70, 186, 186, 270], noStrokes: true, seed: seed + 1 });                       // jacket
  s += part(B.closed([[110, 186], [128, 232], [146, 186]]), a.tie, { filter: 'paintS', box: [104, 180, 152, 238], noStrokes: true, seed: seed + 2 });
  s += part(B.closed([[106, 160], [150, 160], [152, 192], [128, 204], [104, 192]]), sk, { filter: 'paintS', box: [100, 156, 156, 208], noStrokes: true, seed: seed + 3 });
  for (const sx of [-1, 1]) s += part(circ(128 + sx * 58, 118, 12), sk, { filter: 'paintS', box: [128 + sx * 58 - 14, 104, 128 + sx * 58 + 14, 132], noStrokes: true, seed: seed + 4 + sx });
  s += part(blob(128, 112, 56, 62, .012, seed + 9, 16), sk, { filter: 'paintS', box: [70, 52, 188, 178], st: { n: 7, w: 20, ang: -30, op: .16 }, seed: seed + 8 });
  s += part('M78 100C78 52 108 40 128 40C148 40 178 52 178 100C170 80 150 70 128 70C106 70 86 80 78 100Z', a.hair, { filter: 'paintS', box: [70, 36, 186, 110], st: { n: 6, w: 12, ang: 70, op: .3 }, seed: seed + 10 });
  // cap
  s += part('M70 80C70 38 100 24 128 24C156 24 186 38 186 80Z', a.cap, { filter: 'paintS', box: [66, 20, 190, 84], st: { n: 6, w: 14, ang: -30, op: .3 }, seed: seed + 11 });
  s += part(taper([[66, 82], [128, 70], [190, 82]], 12, 14, 12), a.band, { filter: 'paintS', box: [60, 62, 196, 92], noStrokes: true, seed: seed + 12 });
  s += part(B.closed([[100, 54], [128, 40], [156, 54], [128, 62]]), a.band, { filter: 'paintS', box: [96, 36, 160, 66], noStrokes: true, seed: seed + 13 });
  // headset
  s += `<path d="M70 108C66 66 96 44 128 44" stroke="#27303c" stroke-width="7" fill="none" stroke-linecap="round" opacity=".0"/>`;
  for (const sx of [-1, 1]) s += part(rrect(128 + sx * 62 - 10, 104, 20, 36, 8), '#2b3440', { filter: 'paintS', box: [128 + sx * 62 - 12, 100, 128 + sx * 62 + 12, 144], noStrokes: true, seed: seed + 14 + sx });
  s += `<path d="M${128 + 66} 136Q${128 + 70} 164 ${128 + 34} 160" stroke="#27303c" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="${128 + 32}" cy="160" r="6" fill="#27303c"/>`;
  s += face(128, 116, 1.15, a.mood, sk);
  return s;
}

// ---------- title painting (1440 x 810): the cockpit at first light ----------
function title(seed, imgs) {
  const W = 1600, H = 900, r = rng(seed);
  let s = `<defs><linearGradient id="ts" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a63b8"/><stop offset=".45" stop-color="#f0a287"/><stop offset=".72" stop-color="#ffd9a2"/><stop offset="1" stop-color="#ffe9c8"/></linearGradient><radialGradient id="tglow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff6d0" stop-opacity=".9"/><stop offset="1" stop-color="#ffd890" stop-opacity="0"/></radialGradient>
    <linearGradient id="trw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4d5668"/><stop offset="1" stop-color="#2a303e"/></linearGradient></defs>`;
  s += `<g filter="url(#paintN)"><rect width="${W}" height="${H}" fill="url(#ts)"/></g>`;
  s += `<circle cx="1010" cy="470" r="220" fill="url(#tglow)"/><circle cx="1010" cy="470" r="52" fill="#fff8dc"/>`;
  for (let i = 0; i < 9; i++) { const cx = 100 + i * 190 + r() * 70, cy = 190 + r() * 200; s += part(B.blob(cx, cy, 150 + r() * 70, 36 + r() * 14, .12, seed + i, 14), mix('#fff3e2', '#f1a698', r() * .5), { filter: 'paintN', box: [cx - 220, cy - 60, cx + 220, cy + 60], st: { n: 5, w: 14, ang: 0, op: .18 }, seed: seed + i, op: .8 }); }
  // far mountains and the runway in perspective
  s += part(B.closed([[-20, 520], [140, 440], [260, 490], [420, 410], [600, 500], [760, 450], [980, 520], [1180, 440], [1380, 500], [1620, 430], [1620, 580], [-20, 580]]), '#7a6fa0', { filter: 'paintN', box: [0, 400, W, 580], st: { n: 8, w: 24, ang: -10, op: .22 }, seed: seed + 20 });
  s += part(`M-20 700L-20 540L1620 540L1620 700Z`, '#4f7c56', { filter: 'paintN', box: [0, 520, W, 700], st: { n: 10, w: 24, ang: 2, op: .22 }, seed: seed + 21 });
  s += part(B.closed([[700, 540], [900, 540], [1260, 760], [340, 760]]), '#4a4f5e', { filter: 'paintN', box: [320, 540, 1280, 760], st: { n: 12, w: 16, ang: 90, op: .2 }, seed: seed + 22 });
  for (let k = 0; k < 8; k++) { const t = k / 8, y = 560 + t * t * 190, w = 6 + t * 28, h = 6 + t * 22; s += `<rect x="${f(800 - w / 2)}" y="${f(y)}" width="${f(w)}" height="${f(h * .5)}" rx="2" fill="#fff6df" opacity=".9"/>`; }
  for (let k = 0; k < 9; k++) { const t = k / 9, y = 548 + t * t * 210; for (const sx of [-1, 1]) s += `<circle cx="${f(800 + sx * (90 + t * 330))}" cy="${f(y)}" r="${f(2.6 + t * 5)}" fill="#ffd25a"/><circle cx="${f(800 + sx * (90 + t * 330))}" cy="${f(y)}" r="${f(8 + t * 14)}" fill="#ffd25a" opacity=".25" filter="url(#soft2)"/>`; }
  // an airliner on final over the hills
  s += `<g transform="translate(430 330) scale(.62)">${planeSide(seed + 30, { gear: true })}</g>`;
  // windscreen frame
  s += part(`M-40 -40H1640V940H-40Z M60 70L1540 70L1470 560L130 560Z`.replace(/M60 70L1540 70L1470 560L130 560Z/, 'M60 70L130 560L1470 560L1540 70Z'), '#202838', { filter: 'paint', box: [0, 0, W, H], st: { n: 20, w: 30, ang: 0, op: .2 }, seed: seed + 40 });
  s += part(B.closed([[780, 70], [820, 70], [830, 560], [770, 560]]), '#202838', { filter: 'paintS', box: [760, 60, 840, 570], st: { n: 4, w: 10, ang: 90, op: .2 }, seed: seed + 41 });
  // instrument panel (lower third)
  s += part(B.closed([[-20, 560], [400, 520], [1200, 520], [1620, 560], [1620, 940], [-20, 940]]), '#274c59', { filter: 'paint', box: [0, 500, W, 920], st: { n: 24, w: 30, ang: -4, op: .22 }, seed: seed + 50 });
  s += part(B.closed([[-20, 560], [400, 520], [1200, 520], [1620, 560], [1620, 592], [1200, 556], [400, 556], [-20, 592]]), '#16222b', { filter: 'paintS', box: [0, 510, W, 600], noStrokes: true, seed: seed + 51 });
  // dials, a row of switches, lamps
  const dialAt = (cx, cy, rad, sd) => part(circ(cx, cy, rad), '#9ba7b4', { filter: 'paintS', box: [cx - rad, cy - rad, cx + rad, cy + rad], st: { n: 6, w: 14, ang: -30, op: .3 }, seed: sd, inner: `<circle cx="${cx}" cy="${cy}" r="${rad * .8}" fill="#12202a"/><path d="M${cx} ${cy}L${f(cx + rad * .55 * Math.cos(sd))} ${f(cy + rad * .55 * Math.sin(sd))}" stroke="#ffd25a" stroke-width="${rad * .08}" stroke-linecap="round"/>` });
  for (const [cx, cy, rad] of [[640, 640, 70], [800, 650, 86], [960, 640, 70], [480, 660, 52], [1120, 660, 52], [320, 690, 44], [1280, 690, 44]]) s += dialAt(cx, cy, rad, cx);
  for (let i = 0; i < 14; i++) s += `<rect x="${360 + i * 62}" y="760" width="26" height="36" rx="8" fill="#46556a" stroke="${INK}" stroke-width="3"/><circle cx="${373 + i * 62}" cy="772" r="6" fill="${i % 3 === 0 ? '#43d65a' : (i % 3 === 1 ? '#f2b92c' : '#d83b3b')}"/>`;
  // crew in the foreground: captain left, first officer right
  if (imgs && imgs['crew-0']) s += `<image href="${imgs['crew-0']}" x="40" y="520" width="520" height="520"/>`;
  if (imgs && imgs['crew-1']) s += `<image href="${imgs['crew-1']}" x="1040" y="520" width="520" height="520"/>`;
  return s;
}
// ---------- ending paintings (1280 x 720): the runway at dusk, and the hillside at night ----------
function endLand(seed) {
  const W = 1280, H = 720, r = rng(seed); let s = `<defs><linearGradient id="es" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b4f9a"/><stop offset=".5" stop-color="#e58e7e"/><stop offset=".78" stop-color="#ffcf92"/><stop offset="1" stop-color="#ffe3b5"/></linearGradient></defs>`;
  s += `<g filter="url(#paintN)"><rect width="${W}" height="${H}" fill="url(#es)"/></g>`;
  s += `<circle cx="300" cy="420" r="120" fill="#fff4cf" opacity=".5" filter="url(#soft)"/><circle cx="300" cy="420" r="40" fill="#fff8e0"/>`;
  for (let i = 0; i < 6; i++) { const cx = 120 + i * 220 + r() * 60, cy = 150 + r() * 160; s += part(B.blob(cx, cy, 150, 34, .12, seed + i, 14), mix('#fff0de', '#eba097', r() * .5), { filter: 'paintN', box: [cx - 200, cy - 50, cx + 200, cy + 50], st: { n: 5, w: 14, ang: 0, op: .18 }, seed: seed + i, op: .8 }); }
  s += part(B.closed([[-20, 470], [200, 420], [400, 460], [640, 410], [900, 470], [1120, 430], [1300, 470], [1300, 520], [-20, 520]]), '#7b6c98', { filter: 'paintN', box: [0, 400, W, 530], st: { n: 8, w: 24, ang: -10, op: .2 }, seed: seed + 5 });
  s += part(`M-20 ${H}V500L${W + 20} 500V${H}Z`, '#4f7c56', { filter: 'paintN', box: [0, 490, W, H], st: { n: 12, w: 26, ang: 2, op: .22 }, seed: seed + 6 });
  s += part(B.closed([[560, 500], [720, 500], [1240, H], [40, H]]), '#4a4f5e', { filter: 'paintN', box: [40, 500, 1240, H], st: { n: 14, w: 18, ang: 90, op: .2 }, seed: seed + 7 });
  for (let k = 0; k < 9; k++) { const t = k / 9, y = 520 + t * t * 190, w = 6 + t * 30, h = 8 + t * 28; s += `<rect x="${f(640 - w / 2)}" y="${f(y)}" width="${f(w)}" height="${f(h * .5)}" rx="2" fill="#fff6df" opacity=".95"/>`; }
  for (let k = 0; k < 10; k++) { const t = k / 10, y = 506 + t * t * 220; for (const sx of [-1, 1]) s += `<circle cx="${f(640 + sx * (80 + t * 360))}" cy="${f(y)}" r="${f(3 + t * 6)}" fill="#ffd25a"/><circle cx="${f(640 + sx * (80 + t * 360))}" cy="${f(y)}" r="${f(10 + t * 16)}" fill="#ffd25a" opacity=".3" filter="url(#soft2)"/>`; }
  return s;
}
function endCrash(seed) {
  const W = 1280, H = 720, r = rng(seed); let s = `<defs><linearGradient id="cs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#101a2c"/><stop offset=".6" stop-color="#2c3a58"/><stop offset="1" stop-color="#5a6078"/></linearGradient></defs>`;
  s += `<g filter="url(#paintN)"><rect width="${W}" height="${H}" fill="url(#cs)"/></g>`;
  for (let i = 0; i < 6; i++) { const cx = 100 + i * 230 + r() * 60, cy = 120 + r() * 200; s += part(B.blob(cx, cy, 170, 40, .14, seed + i, 14), '#4a5776', { filter: 'paintN', box: [cx - 230, cy - 60, cx + 230, cy + 60], st: { n: 5, w: 14, ang: 0, op: .18 }, seed: seed + i, op: .75 }); }
  s += part(B.closed([[-20, 520], [180, 430], [360, 500], [560, 400], [800, 510], [1020, 440], [1300, 520], [1300, H + 20], [-20, H + 20]]), '#2a3446', { filter: 'paintN', box: [0, 400, W, H], st: { n: 10, w: 26, ang: -8, op: .2 }, seed: seed + 5 });
  s += part(`M-20 ${H + 20}V610Q300 570 640 600T1300 590V${H + 20}Z`, '#1c2432', { filter: 'paintN', box: [0, 560, W, H], st: { n: 8, w: 24, ang: 2, op: .2 }, seed: seed + 6 });
  return s;
}

function register(add, sheet) {
  add('plate', 'plate', 1024, 640, null, () => plate(201, 1024, 640), .74, { opaque: true });
  add('frame', 'frame', 256, 128, null, () => frame(211), .82);
  for (const [i, k] of ['dawn', 'day', 'dusk', 'night'].entries()) add('sky-' + k, 'sky-' + k, 1024, 192, null, () => sky(k, 221 + i * 9), .7, { opaque: true });
  for (const [i, k] of ['mountain', 'water', 'city', 'ice', 'plain'].entries()) add('ter-' + k, 'ter-' + k, 1024, 96, null, () => terrain(k, 241 + i * 7), .78);
  add('tray', 'tray', 512, 128, null, () => tray(261), .8);
  add('screen', 'screen', 512, 192, null, () => screen(271), .8);
  add('planeside', 'planeside', 512, 200, null, () => planeSide(281, { gear: false }), .82);
  add('planegear', 'planegear', 512, 200, null, () => planeSide(281, { gear: true }), .82);
  add('crew-0', 'crew-0', 256, 256, [256, 256], () => crew(0, 291), .82);
  add('crew-1', 'crew-1', 256, 256, [256, 256], () => crew(1, 301), .82);
  add('title', 'title', 1440, 810, [1600, 900], imgs => title(311, imgs), .72, { opaque: true, after: ['crew-0', 'crew-1'] });
  add('end-land', 'end-land', 1280, 720, null, () => endLand(321), .7, { opaque: true });
  add('end-crash', 'end-crash', 1280, 720, null, () => endCrash(331), .7, { opaque: true });
}
module.exports = { register, planeSide, crew, sky, terrain, frame, plate, tray, screen, title, endLand, endCrash };

// Kaiten Kitchen painted items. Each returns the inner SVG for a 512 x 512 canvas (centre 256,256), plate seen from above.
'use strict';
const B = require('./brush.js');
const { f, rng, mix, lit, drk, blob, circ, ell, rrect, pillow, taper, part, shadow, inkLine, sparkle, face, INK } = B;
const C = { tempura: '#f08a2e', sashimi: '#c93a8a', dumpling: '#4aaee6', roll: '#22a699', salmon: '#e5472b', squid: '#6657c9', egg: '#f3c933', wasabi: '#94c83d', chop: '#9a5b3c', pudding: '#f4b6d2' };
const RICE = '#fbf6ea', NORI = '#2c3b2c';

// ---------------- plate ----------------
function rimOrn(kind, col, R0, R1, seed) {
  const r = rng(seed || 5), mid = (R0 + R1) / 2, w = R1 - R0, o = [];
  const cream = mix(col, '#fffbef', .78);
  const at = (a, rr) => [256 + Math.cos(a) * rr, 256 + Math.sin(a) * rr];
  if (kind === 'dots') for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2 + .1, p = at(a, mid); o.push(`<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${f(w * .17 * (.85 + r() * .3))}" fill="${cream}"/>`); }
  if (kind === 'dashes') for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2, p = at(a, mid), q = at(a + .12, mid); o.push(B.inkLine([p, [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], q], w * .22, cream)); }
  if (kind === 'stripes') for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2, p = at(a, R0 + w * .18), q = at(a + .02, R1 - w * .18); o.push(B.inkLine([p, [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], q], w * .16, cream)); }
  if (kind === 'waves') for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, b = a + Math.PI * 2 / 16; const p = at(a, mid + w * .1), m = at((a + b) / 2, mid - w * .22), q = at(b, mid + w * .1); o.push(B.inkLine([p, m, q], w * .18, cream)); const m2 = at((a + b) / 2, mid + w * .18); o.push(`<circle cx="${f(m2[0])}" cy="${f(m2[1])}" r="${f(w * .07)}" fill="${cream}"/>`); }
  if (kind === 'scallops') for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, b = a + Math.PI * 2 / 18; const p = at(a, R0 + w * .3), m = at((a + b) / 2, R1 - w * .25), q = at(b, R0 + w * .3); o.push(B.inkLine([p, m, q], w * .15, cream)); }
  if (kind === 'zigzag') { const pts = []; for (let i = 0; i <= 40; i++) pts.push(at(i / 40 * Math.PI * 2, i % 2 ? R0 + w * .25 : R1 - w * .25)); for (let i = 0; i < 40; i++) o.push(B.inkLine([pts[i], [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2], pts[i + 1]], w * .15, cream)); }
  return `<g filter="url(#wob)" opacity=".92">${o.join('')}</g>`;
}
function plate(col, rim, seed) {
  const R = 226, Rw = 170;
  let s = shadow(circ(256, 256, R), .34, 'soft', 10, 16);
  s += part(B.blob(256, 256, R, R, .006, seed, 28), col, { box: [30, 30, 482, 482], st: { n: 18, w: 26, ang: -30, op: .32 }, seed });
  s += rimOrn(rim, col, Rw + 8, R - 4, seed);
  // the well: cream glaze with a soft dip
  s += part(B.blob(256, 256, Rw, Rw, .008, seed + 1, 24), '#fdf5e4', { filter: 'paintW', box: [86, 86, 426, 426], st: { n: 8, w: 30, ang: 20, op: .16 }, seed: seed + 1,
    inner: `<circle cx="306" cy="312" r="150" fill="#e6cfa8" opacity=".32" filter="url(#soft)"/><circle cx="210" cy="196" r="96" fill="#fffef9" opacity=".8" filter="url(#soft)"/>` });
  // glaze highlight on the rim
  s += `<path d="${taper([[96, 150], [150, 74], [236, 40]], 4, 12, 3)}" fill="#fff" opacity=".55" filter="url(#soft2)"/>`;
  return s;
}

// ---------------- foods ----------------
function tempura(seed) {
  let s = plate(C.tempura, 'dots', seed);
  const r = rng(seed + 11);
  for (let i = 0; i < 16; i++) { const a = r() * Math.PI * 2, rr = 110 + r() * 50; s += `<circle cx="${f(256 + Math.cos(a) * rr)}" cy="${f(262 + Math.sin(a) * rr * .8)}" r="${f(3 + r() * 4)}" fill="#e7a840" stroke="${INK}" stroke-width="1.6"/>`; }
  // tail fan (top right)
  const tail = 'M318 150C330 112 352 92 384 86C376 104 390 118 404 118C392 132 396 150 410 162C384 170 356 178 338 186Z';
  s += shadow(tail, .25, 'soft2', 6, 8);
  s += part(tail, '#ef5a32', { box: [310, 80, 412, 190], st: { n: 8, w: 10, ang: 60, op: .4 }, seed: seed + 2, filter: 'paintS', inner: B.inkLine([[340, 176], [366, 128], [384, 96]], 3, '#9e2a12', .6) + B.inkLine([[350, 178], [380, 146], [402, 128]], 3, '#9e2a12', .6) });
  // battered prawn: long, slightly curved, fat at the head end, tapering to the tail
  const r2 = rng(seed + 3);
  const spine = [[122, 392], [168, 338], [222, 282], [278, 228], [326, 184]];
  const wid = [60, 74, 70, 56, 34];
  const L = [], Rr = [];
  for (let i = 0; i < spine.length; i++) { const a = spine[Math.max(0, i - 1)], b = spine[Math.min(spine.length - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy); dx /= l; dy /= l; L.push([spine[i][0] - dy * wid[i], spine[i][1] + dx * wid[i]]); Rr.push([spine[i][0] + dy * wid[i] * .9, spine[i][1] - dx * wid[i] * .9]); }
  const body = [[88, 430], [70, 380]].concat(Rr, L.slice().reverse());
  const dense = []; for (let i = 0; i < body.length; i++) { const p = body[i], q = body[(i + 1) % body.length]; const seg = Math.max(2, Math.round(Math.hypot(q[0] - p[0], q[1] - p[1]) / 16)); for (let k = 0; k < seg; k++) { const t = k / seg; dense.push([p[0] + (q[0] - p[0]) * t + (r2() - .5) * 13, p[1] + (q[1] - p[1]) * t + (r2() - .5) * 13]); } }
  const bd = B.closed(dense);
  s += shadow(bd, .32, 'soft', 10, 14);
  let crumbs = ''; for (let i = 0; i < 46; i++) { const x = 80 + r2() * 270, y = 160 + r2() * 270; crumbs += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(4 + r2() * 7)}" fill="${r2() < .5 ? '#ffe39a' : '#d58a1e'}" opacity="${f(.35 + r2() * .4)}"/>`; }
  for (let i = 0; i < 4; i++) { const t = .25 + i * .17, x = 122 + (326 - 122) * t, y = 392 + (184 - 392) * t; crumbs += B.inkLine([[x - 40, y - 34], [x - 10, y - 2], [x + 30, y + 40]], 4, '#b8701a', .45); }
  s += part(bd, '#f2b445', { box: [60, 150, 380, 440], st: { n: 16, w: 22, ang: -45, op: .35 }, seed: seed + 4, inner: crumbs });
  s += face(176, 340, 1.6, 'proud', '#f2b445');
  return s;
}
function sashimi(seed) {
  let s = plate(C.sashimi, 'waves', seed);
  // shiso leaf
  const leaf = 'M110 330C120 230 210 150 330 132C390 124 420 128 424 132C420 210 360 320 250 370C190 396 140 392 110 330Z';
  s += shadow(leaf, .25, 'soft', 6, 10);
  s += part(leaf, '#5aa83c', { box: [100, 120, 430, 400], st: { n: 12, w: 16, ang: -40, op: .35 }, seed: seed + 2, inner: B.inkLine([[130, 350], [250, 250], [410, 140]], 5, '#2f6a1f', .8) + [0, 1, 2, 3, 4].map(i => { const t = .2 + i * .15, x = 130 + 280 * t, y = 350 - 210 * t; return B.inkLine([[x, y], [x - 30, y - 50 + i * 4], [x - 50, y - 70 + i * 6]], 3.5, '#2f6a1f', .55) + B.inkLine([[x, y], [x + 40, y + 20], [x + 60, y + 30]], 3.5, '#2f6a1f', .55); }).join('') });
  // fish slab
  const slab = pillow(262, 262, 236, 168, .8, seed + 5, -14);
  s += shadow(slab, .35, 'soft', 8, 14);
  let fat = ''; for (let i = 0; i < 5; i++) fat += `<path d="${taper([[150 + i * 46, 360], [190 + i * 46, 260], [212 + i * 46, 160]], 6, 13, 5)}" fill="#ffd9de" opacity=".85"/>`;
  s += part(slab, '#f2707e', { box: [140, 170, 390, 360], st: { n: 12, w: 18, ang: 70, op: .3 }, seed: seed + 6, inner: fat });
  s += face(250, 262, 1.7, 'sleepy', '#f2707e');
  // sleep bubble
  s += `<g filter="url(#wob)"><circle cx="352" cy="190" r="26" fill="#e6f6ff" opacity=".75" stroke="${INK}" stroke-width="3"/><path d="M340 178a14 14 0 0 1 12 -6" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="384" cy="160" r="9" fill="#e6f6ff" opacity=".8" stroke="${INK}" stroke-width="2.4"/><circle cx="398" cy="140" r="5" fill="#e6f6ff" opacity=".8" stroke="${INK}" stroke-width="2"/></g>`;
  return s;
}
function steam(x, y, k, seed) {
  let s = '';
  for (let i = 0; i < 3; i++) { const dx = (i - 1) * 52 * k, h = (i === 1 ? 70 : 56) * k; const pts = [[x + dx, y + h * .5], [x + dx - 14 * k, y + h * .15], [x + dx + 10 * k, y - h * .2], [x + dx - 6 * k, y - h * .55]];
    s += `<path d="${taper(pts, 10 * k, 22 * k, 6 * k)}" fill="#ffffff" opacity=".55" filter="url(#soft2)"/><path d="${taper(pts, 5 * k, 12 * k, 3 * k)}" fill="#ffffff" opacity=".9" filter="url(#wob)"/>`; }
  return s;
}
function dumpling(seed) {
  let s = plate(C.dumpling, 'dots', seed);
  // bamboo steamer
  const bas = circ(256, 268, 160);
  s += shadow(bas, .3, 'soft', 8, 12);
  let weave = ''; for (let i = -6; i <= 6; i++) weave += `<path d="M${96} ${268 + i * 24}H${416}" stroke="#a87b3e" stroke-width="5" opacity=".55"/>`; for (let i = -6; i <= 6; i++) weave += `<path d="M${256 + i * 24} 100V430" stroke="#c9a060" stroke-width="3" opacity=".35"/>`;
  s += part(bas, '#ddb46c', { box: [96, 108, 416, 428], st: { n: 10, w: 20, ang: 0, op: .3 }, seed: seed + 2, inner: weave + `<circle cx="256" cy="268" r="140" fill="none" stroke="#a87b3e" stroke-width="8" opacity=".6"/>` });
  // bun
  const bun = blob(256, 276, 126, 116, .04, seed + 4, 18);
  s += shadow(bun, .35, 'soft', 6, 12);
  let pleats = ''; for (let i = 0; i < 9; i++) { const a = Math.PI + i / 8 * Math.PI, x0 = 256 + Math.cos(a) * 104, y0 = 196 + Math.sin(a) * 50 + 30; pleats += B.inkLine([[x0, y0], [256 + (x0 - 256) * .45, 176 + (y0 - 176) * .35], [256, 170]], 4.4, '#a8957a', .85); }
  s += part(bun, '#fbf7ee', { box: [130, 160, 382, 392], st: { n: 12, w: 26, ang: -20, op: .22 }, seed: seed + 5, inner: pleats + `<circle cx="256" cy="172" r="13" fill="#ece0c8" stroke="#a8957a" stroke-width="4"/>` });
  s += face(256, 300, 1.85, 'startled', '#fbf7ee');
  s += `<path d="M348 228q10 18 0 26q-10 -8 0 -26z" fill="#bfe6ff" stroke="${INK}" stroke-width="2.6"/>`;
  s += steam(256, 118, .95, seed + 9);
  return s;
}
function roll1piece(cx, cy, rr, fill, mood, seed, faceS) {
  let s = shadow(circ(cx, cy, rr), .35, 'soft', 6, 10);
  let grains = ''; const r = rng(seed); for (let i = 0; i < 40; i++) { const a = r() * Math.PI * 2, d = rr * (.52 + r() * .3); grains += `<ellipse cx="${f(cx + Math.cos(a) * d)}" cy="${f(cy + Math.sin(a) * d)}" rx="${f(rr * .07)}" ry="${f(rr * .04)}" transform="rotate(${f(r() * 180)} ${f(cx + Math.cos(a) * d)} ${f(cy + Math.sin(a) * d)})" fill="#e8dcc4" opacity=".8"/>`; }
  s += part(blob(cx, cy, rr, rr, .03, seed, 14), NORI, { box: [cx - rr, cy - rr, cx + rr, cy + rr], st: { n: 8, w: rr * .2, ang: 30, op: .4 }, seed });
  s += part(blob(cx, cy, rr * .86, rr * .86, .035, seed + 1, 14), RICE, { filter: 'paintS', box: [cx - rr, cy - rr, cx + rr, cy + rr], st: { n: 6, w: rr * .2, op: .2 }, seed: seed + 1, inner: grains });
  s += part(blob(cx, cy - rr * .02, rr * .5, rr * .46, .1, seed + 2, 10), fill, { filter: 'paintS', box: [cx - rr * .5, cy - rr * .5, cx + rr * .5, cy + rr * .4], st: { n: 5, w: rr * .1, op: .35 }, seed: seed + 2 });
  s += face(cx, cy - rr * .06, faceS || rr / 70, mood, fill, { spread: .95 });
  return s;
}
function roll(n, seed) {
  let s = plate(C.roll, 'stripes', seed);
  if (n === 1) s += roll1piece(256, 256, 132, '#f08a2e', 'smile', seed + 3, 1.85);
  if (n === 2) { s += roll1piece(176, 262, 88, '#f08a2e', 'grin', seed + 3, 1.3); s += roll1piece(338, 250, 88, '#7cc24a', 'grin', seed + 7, 1.3); }
  if (n === 3) { s += roll1piece(256, 164, 78, '#f6d23c', 'cheeky', seed + 3, 1.12); s += roll1piece(172, 320, 78, '#7cc24a', 'wink', seed + 7, 1.12); s += roll1piece(340, 320, 78, '#f08a2e', 'cheeky', seed + 11, 1.12); }
  return s;
}
function riceBlock(cx, cy, w, h, seed) {
  const d = pillow(cx, cy, w, h, .7, seed, -6);
  let grains = ''; const r = rng(seed); for (let i = 0; i < 60; i++) { const x = cx - w / 2 + r() * w, y = cy - h / 2 + r() * h; grains += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(8 + r() * 4)}" ry="${f(4.5 + r() * 2)}" transform="rotate(${f(r() * 180)} ${f(x)} ${f(y)})" fill="#e9dec8" opacity=".9"/>`; }
  return shadow(d, .35, 'soft', 8, 14) + part(d, RICE, { filter: 'paintS', box: [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], st: { n: 6, op: .18 }, seed, inner: grains });
}
function topping(cx, cy, w, h, col, seed, inner, rot) {
  const d = pillow(cx, cy, w, h, .9, seed, rot == null ? -8 : rot);
  return shadow(d, .28, 'soft2', 4, 8) + part(d, col, { box: [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], st: { n: 10, w: 18, ang: 60, op: .3 }, seed, inner });
}
function sun(x, y, r) { let s = ''; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; s += B.inkLine([[x + Math.cos(a) * r * 1.3, y + Math.sin(a) * r * 1.3], [x + Math.cos(a) * r * 1.55, y + Math.sin(a) * r * 1.55], [x + Math.cos(a) * r * 1.8, y + Math.sin(a) * r * 1.8]], 5, '#f6a623'); } return s + `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffc93c" stroke="${INK}" stroke-width="3"/>`; }
function nigiri(kind, seed) {
  const pc = { salmon: [C.salmon, 'scallops'], squid: [C.squid, 'scallops'], egg: [C.egg, 'scallops'] }[kind];
  let s = plate(pc[0], pc[1], seed);
  if (kind === 'salmon') s += `<g filter="url(#wob)">${sun(370, 150, 22)}</g>`;
  if (kind === 'squid') s += `<g filter="url(#wob)"><path d="M360 118a32 32 0 1 0 30 46a26 26 0 1 1 -30 -46z" fill="#fff1b0" stroke="${INK}" stroke-width="3"/>${sparkle(150, 150, 12, '#fff6c8')}${sparkle(392, 214, 8, '#fff6c8')}${sparkle(176, 394, 9, '#fff6c8')}</g>`;
  if (kind === 'egg') s += `<g filter="url(#wob)">${sun(150, 160, 18)}</g>`;
  s += riceBlock(256, 300, 244, 120, seed + 3);
  if (kind === 'salmon') { let st = ''; for (let i = 0; i < 6; i++) st += `<path d="${taper([[160 + i * 38, 330], [182 + i * 38, 256], [196 + i * 38, 190]], 5, 11, 4)}" fill="#ffe0cf" opacity=".9"/>`; s += topping(256, 256, 270, 150, '#ff8a4c', seed + 5, st); s += face(250, 250, 1.6, 'smug', '#ff8a4c'); }
  if (kind === 'squid') { let st = ''; for (let i = 0; i < 7; i++) st += B.inkLine([[150 + i * 36, 320], [160 + i * 36, 250], [172 + i * 36, 186]], 4, '#a596d8', .7); s += topping(256, 254, 272, 150, '#e9e1fb', seed + 5, st); s += face(254, 248, 1.6, 'dreamy', '#e9e1fb'); }
  if (kind === 'egg') { let st = ''; for (let i = 0; i < 5; i++) st += `<path d="${taper([[140, 200 + i * 26], [256, 194 + i * 26], [370, 204 + i * 26]], 4, 9, 4)}" fill="#fff3a6" opacity=".8"/>`; s += topping(256, 250, 262, 158, '#ffd84a', seed + 5, st, -4);
    const belt = 'M150 180L198 176L204 330L156 334Z'; s += part(belt, NORI, { filter: 'paintS', box: [140, 170, 210, 340], st: { n: 5, w: 10, ang: 90, op: .4 }, seed: seed + 8 });
    s += face(282, 244, 1.5, 'happy', '#ffd84a'); }
  return s;
}
function flame(x, y, k, seed, col) {
  const d = `M${x} ${y}C${x - 22 * k} ${y - 20 * k} ${x - 14 * k} ${y - 46 * k} ${x - 2 * k} ${y - 64 * k}C${x + 2 * k} ${y - 44 * k} ${x + 12 * k} ${y - 40 * k} ${x + 14 * k} ${y - 52 * k}C${x + 26 * k} ${y - 30 * k} ${x + 22 * k} ${y - 8 * k} ${x} ${y}Z`;
  return part(d, col || '#ff7a2a', { filter: 'paintS', box: [x - 30 * k, y - 70 * k, x + 30 * k, y], st: { n: 4, w: 8 * k, ang: 80, op: .4 }, seed, inner: `<path d="M${x} ${y - 4 * k}C${x - 10 * k} ${y - 14 * k} ${x - 6 * k} ${y - 28 * k} ${x} ${y - 38 * k}C${x + 6 * k} ${y - 26 * k} ${x + 10 * k} ${y - 14 * k} ${x} ${y - 4 * k}Z" fill="#ffd24a"/>` });
}
function wasabiMound(cx, cy, k, seed) {
  const d = `M${cx - 120 * k} ${cy + 70 * k}C${cx - 140 * k} ${cy + 10 * k} ${cx - 90 * k} ${cy - 30 * k} ${cx - 60 * k} ${cy - 50 * k}C${cx - 40 * k} ${cy - 96 * k} ${cx + 20 * k} ${cy - 110 * k} ${cx + 50 * k} ${cy - 70 * k}C${cx + 100 * k} ${cy - 60 * k} ${cx + 140 * k} ${cy} ${cx + 118 * k} ${cy + 66 * k}C${cx + 60 * k} ${cy + 100 * k} ${cx - 70 * k} ${cy + 104 * k} ${cx - 120 * k} ${cy + 70 * k}Z`;
  let grat = ''; const r = rng(seed); for (let i = 0; i < 70; i++) { const x = cx + (r() - .5) * 230 * k, y = cy + (r() - .5) * 170 * k; grat += `<circle cx="${f(x)}" cy="${f(y)}" r="${f((2.5 + r() * 3) * k)}" fill="${r() < .5 ? '#d6f08a' : '#5f9a28'}" opacity=".7"/>`; }
  grat += B.inkLine([[cx - 80 * k, cy - 10 * k], [cx, cy - 40 * k], [cx + 80 * k, cy - 6 * k]], 6 * k, '#6aa82e', .6) + B.inkLine([[cx - 96 * k, cy + 40 * k], [cx, cy + 12 * k], [cx + 96 * k, cy + 36 * k]], 6 * k, '#6aa82e', .5);
  return shadow(d, .35, 'soft', 8, 14) + part(d, '#a6d64a', { box: [cx - 140 * k, cy - 110 * k, cx + 140 * k, cy + 104 * k], st: { n: 12, w: 20 * k, ang: -10, op: .3 }, seed, inner: grat });
}
function wasabi(seed, withNigiri) {
  let s = plate(C.wasabi, 'zigzag', seed);
  if (!withNigiri) {
    s += wasabiMound(256, 290, 1.12, seed + 2);
    s += flame(220, 196, 1.05, seed + 4) + flame(270, 176, 1.25, seed + 5, '#ff5a2a') + flame(318, 200, .95, seed + 6);
    s += face(256, 292, 1.75, 'determined', '#a6d64a');
  } else {
    s += wasabiMound(256, 322, .98, seed + 2);
    // arms up holding a nigiri
    s += part(taper([[182, 296], [160, 250], [184, 214]], 18, 16, 12), '#a6d64a', { filter: 'paintS', box: [140, 190, 210, 310], seed: seed + 3, noStrokes: true }) + part(circ(186, 210, 14), '#a6d64a', { filter: 'paintS', box: [170, 194, 202, 226], noStrokes: true });
    s += part(taper([[330, 296], [352, 250], [328, 214]], 18, 16, 12), '#a6d64a', { filter: 'paintS', box: [300, 190, 370, 310], seed: seed + 4, noStrokes: true }) + part(circ(326, 210, 14), '#a6d64a', { filter: 'paintS', box: [310, 194, 342, 226], noStrokes: true });
    s += riceBlock(256, 196, 190, 70, seed + 5);
    let st = ''; for (let i = 0; i < 5; i++) st += `<path d="${taper([[186 + i * 34, 196], [198 + i * 34, 160], [206 + i * 34, 124]], 4, 9, 3)}" fill="#ffe0cf" opacity=".9"/>`;
    s += topping(256, 168, 206, 82, '#ff8a4c', seed + 6, st, -4);
    s += face(256, 320, 1.4, 'determined', '#a6d64a');
    s += sparkle(130, 150, 22, '#ffe36a', 10) + sparkle(392, 140, 18, '#ffe36a', -8) + sparkle(400, 260, 12, '#fff6c8') + sparkle(110, 260, 10, '#fff6c8') + sparkle(256, 82, 14, '#ffe36a');
  }
  return s;
}
function chop(seed) {
  let s = plate(C.chop, 'dashes', seed);
  const stick = (a, b) => { const d = taper([a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], b], 26, 22, 14); return shadow(d, .3, 'soft2', 6, 10) + part(d, '#d9a066', { filter: 'paintS', box: [Math.min(a[0], b[0]) - 20, Math.min(a[1], b[1]) - 20, Math.max(a[0], b[0]) + 20, Math.max(a[1], b[1]) + 20], st: { n: 5, w: 6, ang: Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI, op: .4 }, seed: seed + a[0] }); };
  s += stick([96, 124], [418, 400]) + stick([418, 116], [100, 404]);
  // rice ball (triangle onigiri)
  const ball = B.closed([[256, 132], [300, 160], [356, 280], [348, 352], [256, 378], [164, 352], [156, 280], [212, 160]]);
  let grains = ''; const r = rng(seed + 9); for (let i = 0; i < 50; i++) { const x = 170 + r() * 172, y = 150 + r() * 220; grains += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(8 + r() * 3)}" ry="${f(4.5)}" transform="rotate(${f(r() * 180)} ${f(x)} ${f(y)})" fill="#e9dec8" opacity=".85"/>`; }
  s += shadow(ball, .35, 'soft', 8, 14) + part(ball, RICE, { filter: 'paintS', box: [150, 130, 360, 380], st: { n: 6, op: .18 }, seed: seed + 3, inner: grains });
  s += part('M196 316L316 316L336 356Q256 384 176 356Z', NORI, { filter: 'paintS', box: [170, 310, 340, 384], st: { n: 5, w: 8, op: .4 }, seed: seed + 4 });
  s += face(256, 254, 1.7, 'wink', RICE);
  return s;
}
function pudding(seed) {
  let s = plate(C.pudding, 'dots', seed);
  const cup = 'M140 230C150 330 180 372 256 376C332 372 362 330 372 230Z';
  const dome = blob(256, 236, 118, 92, .03, seed + 2, 16);
  s += shadow(cup, .35, 'soft', 8, 14);
  s += part(cup, '#ffe08a', { box: [140, 220, 372, 380], st: { n: 8, w: 22, ang: 0, op: .25 }, seed: seed + 3 });
  // caramel top with drips
  const car = 'M140 230C140 176 196 150 256 150C316 150 372 176 372 230C364 252 350 238 344 262C336 286 322 250 312 266C300 292 286 256 270 270C254 290 240 256 224 268C210 286 196 252 184 262C170 280 160 242 140 230Z';
  s += part(car, '#b8641e', { box: [136, 146, 376, 296], st: { n: 10, w: 20, ang: -10, op: .35 }, seed: seed + 4, inner: `<path d="${taper([[178, 196], [240, 168], [300, 172]], 4, 12, 4)}" fill="#f0b066" opacity=".8"/>` });
  // chef hat
  const hb = 'M212 158L300 158L296 124L216 124Z', ht = 'M214 128C186 126 182 92 206 88C206 66 238 58 252 76C264 56 300 62 302 86C328 88 326 124 298 128Z';
  s += part(hb, '#fffdf6', { filter: 'paintS', box: [210, 120, 302, 160], st: { n: 4, op: .2 }, seed: seed + 5 }) + part(ht, '#fffdf6', { filter: 'paintS', box: [180, 56, 330, 130], st: { n: 6, op: .2 }, seed: seed + 6 });
  // cherry
  s += `<path d="M340 182Q350 140 372 128" stroke="#3f7a35" stroke-width="6" fill="none" stroke-linecap="round" filter="url(#wob)"/>`;
  s += part(circ(338, 196, 22), '#d9304a', { filter: 'paintS', box: [314, 172, 362, 220], st: { n: 3, op: .3 }, seed: seed + 7, inner: `<circle cx="330" cy="188" r="6" fill="#fff" opacity=".8"/>` });
  s += face(256, 316, 1.55, 'bliss', '#ffe08a');
  s += sparkle(124, 168, 14) + sparkle(400, 290, 10) + sparkle(150, 384, 9);
  return s;
}
// ---------------- card back (portrait 1 : 1.4), viewBox 0 0 512 717 ----------------
function back(seed) {
  const W = 512, H = 717; let s = `<rect width="${W}" height="${H}" fill="#203668"/>`;
  // seigaiha waves painted row by row
  const pw = 96, ph = 48; let w = '';
  for (let row = -1; row < H / ph * 2 + 2; row++) for (let col = -1; col < W / pw + 2; col++) {
    const cx = col * pw + (row % 2 ? pw / 2 : 0), cy = row * ph / 2;
    [46, 36, 26, 16, 7].forEach((r, i) => { w += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${i % 2 ? '#2b4886' : '#22397a'}" stroke="#e9dcbc" stroke-width="${i ? 2.6 : 3.4}" stroke-opacity="${i ? .55 : .8}"/>`; });
  }
  s += `<g filter="url(#wob)">${w}</g>`;
  s += `<rect width="${W}" height="${H}" fill="url(#vig)"/>`;
  // medallion
  s += `<g filter="url(#paintF)"><circle cx="256" cy="358" r="116" fill="#f3e3bd"/></g><circle cx="256" cy="358" r="100" fill="none" stroke="#c99a3a" stroke-width="7" filter="url(#wob)"/><circle cx="256" cy="358" r="88" fill="none" stroke="#c99a3a" stroke-width="2.5" stroke-dasharray="7 8" filter="url(#wob)"/>`;
  s += part(ell(256, 392, 64, 22), '#e5553a', { filter: 'paintF', box: [190, 368, 322, 416], noStrokes: true }) + part(ell(256, 386, 44, 13), '#fbf3e2', { filter: 'paintN', box: [210, 372, 302, 400], noStrokes: true });
  s += part('M220 384Q218 340 256 334Q294 340 292 384Z', '#fbf7ee', { filter: 'paintF', box: [216, 330, 296, 388], noStrokes: true });
  s += [0, 1, 2].map(i => `<path d="M${236 + i * 20} 326q-12 -18 0 -34q12 -16 0 -34" stroke="#fffbef" stroke-width="7" fill="none" stroke-linecap="round" opacity=".9" filter="url(#wob)"/>`).join('');
  s += `<rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="26" fill="none" stroke="#e8c779" stroke-width="7" filter="url(#wob)"/><rect x="30" y="30" width="${W - 60}" height="${H - 60}" rx="18" fill="none" stroke="#e8c779" stroke-width="2.5" stroke-opacity=".7" filter="url(#wob)"/>`;
  return `<defs><radialGradient id="vig" cx=".5" cy=".5" r=".7"><stop offset=".55" stop-color="#0b1530" stop-opacity="0"/><stop offset="1" stop-color="#0b1530" stop-opacity=".55"/></radialGradient></defs>` + s;
}
const FOODS = { tempura, sashimi, dumpling, roll1: s => roll(1, s), roll2: s => roll(2, s), roll3: s => roll(3, s), salmon: s => nigiri('salmon', s), squid: s => nigiri('squid', s), egg: s => nigiri('egg', s), wasabi: s => wasabi(s, false), 'wasabi-nigiri': s => wasabi(s, true), chop, pudding };
module.exports = { FOODS, back, plate, C, flame, steam, sun, riceBlock, topping, roll1piece, wasabiMound };

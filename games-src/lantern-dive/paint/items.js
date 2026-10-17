// Lantern Dive painted items: suit emblems, card back, tokens, badge, drone. Each returns the inner SVG for a 512 x 512 canvas
// (the card back is 512 x 717). Same seeds give the same pictures.
'use strict';
const B = require('./brush.js');
const { f, rng, mix, lit, drk, blob, circ, ell, rrect, taper, part, shadow, inkLine, sparkle, INK } = B;
const C = { coral: '#e2607f', tide: '#3f82da', kelp: '#3fa86d', star: '#f1b82e', lantern: '#ffe08a' };

// outline all shapes together (one ink silhouette), then paint each shape with strokes and no outline of its own
function mass(shapes, seed, o) {
  o = o || {}; const w = o.ow || 15;
  let s = `<g filter="url(#wob)">${shapes.map(sh => `<path d="${sh.d}" fill="${INK}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`).join('')}</g>`;
  shapes.forEach((sh, i) => { s += part(sh.d, sh.c, { filter: 'paintN', box: sh.box || [0, 0, 512, 512], st: { n: sh.n || 10, w: sh.w || 16, ang: sh.ang == null ? -30 : sh.ang, op: sh.op || .38 }, seed: seed + i * 7, inner: sh.inner || '' }); });
  return s;
}
// a branch as a tapered polygon
const limb = (pts, w0, wm, w1) => taper(pts, w0, wm, w1);

function coral(seed) {
  const r = rng(seed), col = C.coral; let sh = [];
  sh.push({ d: limb([[256, 470], [256, 400], [250, 330]], 70, 62, 54), c: mix(col, '#7a1f3a', .15) });
  sh.push({ d: limb([[250, 340], [200, 300], [150, 240], [128, 170]], 56, 44, 30), c: col });
  sh.push({ d: limb([[256, 340], [300, 290], [356, 240], [388, 170]], 56, 44, 30), c: col });
  sh.push({ d: limb([[252, 330], [256, 260], [244, 190], [256, 100]], 54, 46, 28), c: lit(col, .06) });
  sh.push({ d: limb([[140, 210], [100, 180], [88, 130]], 30, 26, 18), c: lit(col, .1) });
  sh.push({ d: limb([[372, 210], [412, 178], [424, 126]], 30, 26, 18), c: lit(col, .1) });
  sh.push({ d: limb([[246, 190], [212, 150], [208, 108]], 28, 24, 16), c: lit(col, .12) });
  let s = shadow(sh[0].d, .0, 'soft', 0, 0) + mass(sh, seed, { ow: 16 });
  // polyps: little pale dots with dark centres along the branches
  const tips = [[128, 160], [388, 160], [256, 92], [88, 120], [424, 116], [208, 100]];
  tips.forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="17" fill="${lit(col, .5)}" stroke="${INK}" stroke-width="4"/><circle cx="${x}" cy="${y}" r="6.5" fill="${drk(col, .45)}"/>`; });
  for (let i = 0; i < 26; i++) { const x = 130 + r() * 250, y = 160 + r() * 300; s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(3 + r() * 3)}" fill="${lit(col, .55)}" opacity=".75"/>`; }
  s += `<path d="${taper([[232, 410], [236, 340], [234, 300]], 5, 9, 3)}" fill="#fff" opacity=".4" filter="url(#soft2)"/>`;
  return s;
}
function tide(seed) {
  const col = C.tide; let s = '';
  const wave = B.closed([[56, 400], [70, 330], [112, 250], [180, 190], [262, 160], [344, 170], [410, 214], [440, 280], [418, 336], [378, 352], [346, 330], [352, 296], [382, 296], [378, 262], [340, 238], [290, 250], [262, 300], [270, 360], [320, 410], [400, 424], [440, 446], [300, 470], [170, 466], [90, 440]]);
  const crest = B.closed([[262, 160], [344, 170], [410, 214], [440, 280], [418, 336], [378, 352], [346, 330], [352, 296], [382, 296], [378, 262], [340, 238], [300, 236], [270, 252], [250, 214], [240, 178]]);
  s += mass([{ d: wave, c: col, box: [40, 140, 460, 480], n: 16, w: 20, ang: -35 }], seed, { ow: 17 });
  // lighter belly + foam
  s += part(B.closed([[100, 430], [130, 370], [190, 330], [250, 330], [270, 372], [320, 414], [250, 450], [160, 456]]), lit(col, .22), { filter: 'paintN', box: [90, 320, 330, 470], st: { n: 6, w: 16, ang: -20, op: .3 }, seed: seed + 3 });
  s += part(crest, lit(col, .46), { filter: 'paintN', box: [230, 150, 450, 360], st: { n: 6, w: 14, ang: -45, op: .3 }, seed: seed + 5 });
  for (let i = 0; i < 4; i++) { const y = 380 + i * 22; s += `<path d="${taper([[110 + i * 24, y], [200 + i * 10, y - 22], [290, y - 8]], 3, 10, 3)}" fill="#fff" opacity="${f(.5 - i * .08)}"/>`; }
  s += `<path d="${taper([[404, 232], [386, 214], [352, 206]], 4, 11, 3)}" fill="#fff" opacity=".85"/>`;
  [[372, 170, 9], [405, 150, 6], [330, 140, 7]].forEach(([x, y, rr]) => { s += `<circle cx="${x}" cy="${y}" r="${rr}" fill="#fff" stroke="${INK}" stroke-width="3" opacity=".95"/>`; });
  return s;
}
function kelp(seed) {
  const col = C.kelp; const blades = [
    { p: [[256, 480], [230, 410], [290, 340], [244, 260], [264, 170], [250, 70]], w: [58, 62, 12], c: col },
    { p: [[210, 480], [150, 420], [196, 350], [150, 280], [166, 214], [126, 150]], w: [44, 50, 10], c: drk(col, .22) },
    { p: [[304, 480], [366, 420], [328, 350], [372, 290], [356, 224], [392, 160]], w: [46, 52, 10], c: lit(col, .08) }];
  const sh = blades.map((b, i) => ({ d: limb(b.p, b.w[0], b.w[1], b.w[2]), c: b.c, n: 9, w: 16, ang: -80 + i * 20 }));
  let s = mass(sh, seed, { ow: 15 });
  blades.forEach((b, i) => { s += `<path d="${taper(b.p.slice(1, 5), 3, 6, 2)}" fill="${lit(b.c, .5)}" opacity=".6"/>`; });
  [[330, 60, 8], [180, 90, 6], [410, 110, 7]].forEach(([x, y, rr]) => { s += `<circle cx="${x}" cy="${y}" r="${rr}" fill="#d8f4ff" stroke="${INK}" stroke-width="3" opacity=".9"/>`; });
  return s;
}
function star(seed) {
  const col = C.star, r = rng(seed); const cx = 256, cy = 262; let pts = [];
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? 74 : 214; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 1.0]); }
  // soften: add midpoints so the arms are round-ended
  const arm = []; for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 - Math.PI / 2; const tip = [cx + Math.cos(a) * 214, cy + Math.sin(a) * 214];
    const l = [cx + Math.cos(a - .5) * 112, cy + Math.sin(a - .5) * 112], rg = [cx + Math.cos(a + .5) * 112, cy + Math.sin(a + .5) * 112], tl = [cx + Math.cos(a - .1) * 200, cy + Math.sin(a - .1) * 200], tr = [cx + Math.cos(a + .1) * 200, cy + Math.sin(a + .1) * 200];
    arm.push(l, tl, tip, tr, rg); }
  const body = B.closed(arm.map((p, i) => i % 5 === 4 ? [p[0] * .97 + cx * .03, p[1] * .97 + cy * .03] : p).filter((p, i) => i % 5 !== 0 || true));
  let s = shadow(body, .25, 'soft', 6, 10);
  const inner = (() => { let d = ''; for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 - Math.PI / 2; d += inkLine([[cx, cy], [cx + Math.cos(a) * 80, cy + Math.sin(a) * 80], [cx + Math.cos(a) * 176, cy + Math.sin(a) * 176]], 9, drk(col, .25), .55); for (let k = 1; k < 5; k++) { const rr = 40 + k * 32; d += `<circle cx="${f(cx + Math.cos(a) * rr)}" cy="${f(cy + Math.sin(a) * rr)}" r="${f(9 - k * 1.3)}" fill="${lit(col, .55)}" stroke="${drk(col, .35)}" stroke-width="2.4"/>`; } } return d; })();
  s += part(body, col, { box: [30, 40, 482, 490], st: { n: 18, w: 22, ang: -40, op: .36 }, seed: seed + 2, inner });
  s += `<circle cx="256" cy="262" r="30" fill="${lit(col, .6)}" stroke="${INK}" stroke-width="5"/><circle cx="246" cy="252" r="10" fill="#fff" opacity=".8"/>`;
  s += sparkle(380, 110, 22, '#fff6c8') + sparkle(120, 400, 14, '#fff6c8', 15);
  return s;
}
function lantern(seed) {
  let s = `<circle cx="326" cy="214" r="190" fill="#ffd873" opacity=".16" filter="url(#soft3)"/><circle cx="326" cy="214" r="130" fill="#ffe9a6" opacity=".3" filter="url(#soft)"/>`;
  // stalk: a curved dark rod from the lower left to the lure
  const stalk = taper([[96, 470], [90, 380], [150, 300], [250, 260], [300, 218]], 34, 26, 16);
  s += part(stalk, '#27406b', { filter: 'paint', box: [60, 200, 330, 490], st: { n: 6, w: 14, ang: -50, op: .35 }, seed: seed + 1 });
  s += `<path d="${taper([[104, 440], [110, 380], [160, 320], [240, 282]], 3, 8, 3)}" fill="#8fb4ff" opacity=".5"/>`;
  // the lure and its cage
  s += part(circ(326, 200, 94), '#ffe9a6', { filter: 'paintW', box: [220, 100, 440, 310], st: { n: 8, w: 18, ang: 30, op: .22 }, seed: seed + 2, inner: `<circle cx="326" cy="200" r="62" fill="#fffbe0"/><circle cx="296" cy="172" r="26" fill="#fff" opacity=".9"/>` });
  s += `<path d="M326 106V294M232 200H420M258 134C300 172 352 172 394 134M258 266C300 228 352 228 394 266" fill="none" stroke="#8a5a14" stroke-width="7" stroke-linecap="round" opacity=".7"/><circle cx="326" cy="200" r="94" fill="none" stroke="${INK}" stroke-width="8"/>`;
  s += part(rrect(300, 86, 52, 24, 10), '#8a5a14', { filter: 'paintS', noStrokes: true, seed });
  // rays
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + .2, c0 = [326 + Math.cos(a) * 112, 200 + Math.sin(a) * 112], c1 = [326 + Math.cos(a) * 150, 200 + Math.sin(a) * 150]; s += `<path d="${taper([c0, [(c0[0] + c1[0]) / 2, (c0[1] + c1[1]) / 2], c1], 6, 11, 3)}" fill="#ffd873" stroke="${INK}" stroke-width="2.2"/>`; }
  s += sparkle(430, 90, 20, '#fff') + sparkle(210, 120, 13, '#fff6c8', 20);
  [[110, 120, 10], [160, 80, 6], [70, 200, 7]].forEach(([x, y, rr]) => { s += `<circle cx="${x}" cy="${y}" r="${rr}" fill="#d8f4ff" stroke="${INK}" stroke-width="3" opacity=".85"/>`; });
  return s;
}
const EMB = { coral, tide, kelp, star, lantern };

// ---------------- card back: 512 x 717 ----------------
function back(seed) {
  const W = 512, H = 717, r = rng(seed); let s = `<defs><linearGradient id="bkg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1d5aa8"/><stop offset=".55" stop-color="#0f2f66"/><stop offset="1" stop-color="#081a3a"/></linearGradient><radialGradient id="bkg2" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe08a" stop-opacity=".75"/><stop offset=".5" stop-color="#ffd873" stop-opacity=".22"/><stop offset="1" stop-color="#ffd873" stop-opacity="0"/></radialGradient></defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#bkg)"/>`;
  for (let i = 0; i < 12; i++) { const y = 20 + i * 62; s += `<path d="${taper([[-20, y], [W * .25, y - 24 - r() * 10], [W * .5, y + 8], [W * .75, y - 24], [W + 20, y + 4]], 3, 10 + r() * 6, 3)}" fill="#6fb2ff" opacity="${f(.16 + r() * .14)}"/>`; }
  for (let i = 0; i < 24; i++) { const x = r() * W, y = r() * H, rr = 3 + r() * 6; s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="#d8f4ff" opacity="${f(.12 + r() * .25)}"/>`; }
  s += `<circle cx="256" cy="358" r="230" fill="url(#bkg2)"/>`;
  s += `<g filter="url(#paintN)"><circle cx="256" cy="358" r="150" fill="#0b2a5c" stroke="#d9b04a" stroke-width="9"/><circle cx="256" cy="358" r="128" fill="none" stroke="#d9b04a" stroke-width="3" stroke-dasharray="3 12" stroke-linecap="round"/></g>`;
  s += `<g transform="translate(130 232) scale(.5)">${lantern(seed + 5)}</g>`;
  s += `<rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="30" fill="none" stroke="#d9b04a" stroke-width="6" opacity=".85"/><rect x="40" y="40" width="${W - 80}" height="${H - 80}" rx="22" fill="none" stroke="#d9b04a" stroke-width="2.4" opacity=".6"/>`;
  [[48, 48], [W - 48, 48], [48, H - 48], [W - 48, H - 48]].forEach(([x, y]) => { s += sparkle(x, y, 20, '#ffe9a6'); });
  return s;
}

// ---------------- tokens and badges ----------------
function ping(seed) {
  let s = `<circle cx="256" cy="256" r="236" fill="#2fb36d" opacity=".25" filter="url(#soft)"/>`;
  s += part(circ(256, 256, 214), '#35c27b', { box: [30, 30, 482, 482], st: { n: 12, w: 24, ang: -30, op: .34 }, seed });
  for (let i = 0; i < 3; i++) s += `<circle cx="256" cy="256" r="${190 - i * 56}" fill="none" stroke="#e8fff2" stroke-width="${12 - i * 2}" opacity="${f(.85 - i * .15)}" stroke-dasharray="${i === 1 ? '4 22' : 'none'}" stroke-linecap="round"/>`;
  s += `<circle cx="256" cy="256" r="26" fill="#fff" stroke="${INK}" stroke-width="5"/>`;
  s += `<path d="${taper([[100, 170], [150, 100], [230, 66]], 4, 16, 3)}" fill="#fff" opacity=".55" filter="url(#soft2)"/>`;
  return s;
}
function flare(seed) {
  let s = `<circle cx="256" cy="150" r="130" fill="#ff9c3a" opacity=".3" filter="url(#soft)"/>`;
  s += part(B.closed([[170, 470], [150, 380], [180, 320], [332, 320], [362, 380], [342, 470]]), '#e6523a', { box: [140, 310, 380, 480], st: { n: 8, w: 18, ang: -60, op: .36 }, seed });
  s += part(rrect(220, 120, 72, 210, 26), '#ffd873', { filter: 'paintS', box: [210, 110, 300, 340], st: { n: 5, w: 14, ang: 80, op: .3 }, seed: seed + 2 });
  s += `<rect x="150" y="372" width="212" height="22" fill="#fff" opacity=".85" stroke="${INK}" stroke-width="4"/>`;
  s += part(B.closed([[256, 20], [292, 100], [256, 82], [220, 100]]), '#fff0a8', { filter: 'paintS', noStrokes: true, seed });
  s += sparkle(340, 70, 18, '#fff') + sparkle(180, 90, 12, '#fff6c8', 12);
  return s;
}
function cmd(seed) {
  let pts = []; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? 100 : 196; pts.push([256 + Math.cos(a) * rr, 262 + Math.sin(a) * rr]); }
  let s = `<circle cx="256" cy="256" r="236" fill="#ffd873" opacity=".28" filter="url(#soft)"/>`;
  s += part(circ(256, 256, 218), '#ffd873', { box: [30, 30, 482, 482], st: { n: 10, w: 22, ang: -20, op: .3 }, seed });
  s += `<circle cx="256" cy="256" r="186" fill="none" stroke="${INK}" stroke-width="6" opacity=".7"/>`;
  s += part(B.closed(pts), '#c98a10', { filter: 'paintS', box: [60, 60, 452, 452], st: { n: 6, w: 14, ang: 40, op: .3 }, seed: seed + 1 });
  s += `<circle cx="256" cy="262" r="38" fill="#fff6c8" stroke="${INK}" stroke-width="5"/>`;
  return s;
}
// ---------------- drone portrait ----------------
function drone(seed) {
  let s = `<circle cx="256" cy="256" r="236" fill="#cfe9f5"/><circle cx="256" cy="256" r="236" fill="none" stroke="${INK}" stroke-width="8"/>`;
  s += `<g filter="url(#wob)"><path d="M256 170V90M226 90H286" stroke="${INK}" stroke-width="16" stroke-linecap="round"/></g><circle cx="256" cy="84" r="16" fill="#ff6a3a" stroke="${INK}" stroke-width="6"/>`;
  s += `<path d="M96 330L50 372M416 330L462 372" stroke="${INK}" stroke-width="30" stroke-linecap="round"/><path d="M96 330L50 372M416 330L462 372" stroke="#7fa6c8" stroke-width="16" stroke-linecap="round"/>`;
  s += part(blob(256, 300, 190, 140, .01, seed, 20), '#f1b82e', { box: [60, 150, 450, 450], st: { n: 12, w: 22, ang: -30, op: .34 }, seed });
  s += `<circle cx="256" cy="288" r="84" fill="#0e2146" stroke="${INK}" stroke-width="10"/><circle cx="256" cy="288" r="52" fill="#16377c"/><circle cx="256" cy="288" r="30" fill="#ffd873"/><circle cx="238" cy="268" r="12" fill="#fff"/><circle cx="270" cy="304" r="5" fill="#fff" opacity=".7"/>`;
  s += `<rect x="86" y="354" width="340" height="18" rx="9" fill="#fff" opacity=".35"/>`;
  [[110, 280], [402, 280]].forEach(([x, y]) => { s += `<circle cx="${x}" cy="${y}" r="14" fill="#fffbe0" stroke="${INK}" stroke-width="5"/>`; });
  return s;
}
module.exports = { EMB, coral, tide, kelp, star, lantern, back, ping, flare, cmd, drone, mass };

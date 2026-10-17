/* p2: the food characters (plate space, centre 0,0, well radius ~38) */
(function (root) {
'use strict';
const K = root.__KK, { INK, P, E, L, dot, star, face, blobPath, ringPts, rng, lighten, darken, mix, f1 } = K;

// ---------------------------------------------------------------- tempura: Crispy Prawn (proud)
function tempura() {
  const r = rng('tempura'); let s = '<g transform="translate(3 5) scale(1.08)">';
  const bat = '#f4b94c', crisp = '#e29a2a';
  const bump = (cx, cy, rx, ry, n, rot) => blobPath(ringPts(cx, cy, rx, ry, n, .14, r, rot));
  // feelers
  s += L('M-24 -24Q-28 -36 -38 -37', INK, 1.4) + L('M-15 -28Q-16 -40 -25 -44', INK, 1.4);
  // tail fan (behind the curled body)
  s += P('M22 24L41 17Q45 22 42 27Q46 31 41 35Q38 40 30 36Z', '#ee5b36', { sw: 1.4 });
  s += L('M28 27L40 22M29 30L42 30M30 33L38 38', '#a8301a', 1.1);
  // curled tail segments, back to front
  s += P(bump(18, 15, 12, 11, 11, .4), bat, { sw: 1.6 }) + L('M12 8Q20 14 14 22', crisp, 1.4);
  s += P(bump(8, 4, 17, 16, 12, .2), bat, { sw: 1.6 }) + L('M0 -7Q10 -1 4 14', crisp, 1.5);
  s += P(bump(-10, -8, 25, 23, 15, -.2), bat, { sw: 1.7 });
  s += E(-24, 6, 7, 4, crisp, { sw: 0, flat: true, op: .5, rot: 30 }) + E(-4, -26, 9, 3.5, '#ffe6a6', { sw: 0, flat: true, op: .75, rot: -10 });
  [[-38, 8], [-30, 22], [4, 32], [34, -4], [-20, 30], [30, 8], [36, -14]].forEach((p, i) => s += dot(p[0], p[1], 1.3 + (i % 2) * .6, '#e6a23a'));
  s += face('proud', -12, -6, .98, bat);
  return s + '</g>';
}

// ---------------------------------------------------------------- sashimi: Fish Slice (sleepy)
function sashimi() {
  let s = '';
  // shiso leaf
  s += P('M-36 30Q-44 2 -26 -20Q-10 -34 12 -30Q2 -16 6 6Q-4 34 -36 30Z', '#4fa05a', { sw: 1.4 });
  s += L('M-32 24Q-18 4 0 -22', '#2f7a3c', 1.2) + L('M-30 8l8 2M-24 -4l8 3M-14 -16l7 3', '#2f7a3c', 1);
  // daikon curls
  s += `<g stroke="${INK}" stroke-width="1.1" fill="#fffdf6">` + E(24, -28, 8.5, 3.8, '#fffdf6', { sw: 1.1, rot: 30 }) + E(31, -20, 8, 3.4, '#f4efe2', { sw: 1.1, rot: -20 }) + E(20, -21, 7, 3.2, '#fffdf6', { sw: 1.1, rot: 10 }) + '</g>';
  // fish slice
  const d = 'M-31 -9Q-31 -22 -17 -23L21 -24Q34 -24 33 -11L31 11Q30 23 17 23L-19 24Q-32 24 -31 9Z';
  s += `<g transform="rotate(-5)">` + P(d, '#ff6f87', { sw: 1.7 });
  s += L('M-24 -14Q-10 -19 4 -13T28 -15', '#ffc6d0', 1.7, { op: .85 }) + L('M-26 4Q-8 -2 8 4T30 2', '#ffc6d0', 1.7, { op: .85 }) + L('M-22 17Q-6 12 8 18T26 15', '#ffc6d0', 1.4, { op: .75 });
  s += face('sleepy', -2, 0, 1, '#ff6f87') + '</g>';
  return s;
}

// ---------------------------------------------------------------- dumpling: Steam Bun (startled)
function dumpling() {
  let s = '';
  // steam puffs
  const puff = (x, y, k) => `<path d="M${x - 8 * k} ${y}Q${x - 12 * k} ${y - 7 * k} ${x - 4 * k} ${y - 8 * k}Q${x} ${y - 14 * k} ${x + 6 * k} ${y - 8 * k}Q${x + 13 * k} ${y - 7 * k} ${x + 8 * k} ${y}Q${x + 2 * k} ${y + 3 * k} ${x - 8 * k} ${y}Z" fill="#fff" fill-opacity=".92" stroke="#9fb9cc" stroke-width="1.1"/>`;
  s += puff(-18, -32, .9) + puff(17, -34, .8) + puff(0, -39, 1.0);
  // steamer base (back)
  s += P('M-35 22Q-36 14 0 14Q36 14 35 22L33 33Q0 41 -33 33Z', '#d9a65e', { sw: 1.5 });
  s += L('M-24 20L-22 36M-8 22L-7 38M8 22L8 38M24 20L22 36', '#a8742f', 1.2);
  // bun
  const d = 'M-30 4Q-31 -22 -6 -26Q0 -27 6 -26Q31 -22 30 4Q29 24 0 25Q-29 24 -30 4Z';
  s += P(d, '#fff3dd', { sw: 1.7 });
  // pleated knot on top
  s += P('M-7 -25Q0 -34 7 -25Q4 -22 0 -22Q-4 -22 -7 -25Z', '#fbe2bd', { sw: 1.3 });
  s += L('M0 -23L-9 -14M0 -23L-3 -12M0 -23L4 -12M0 -23L10 -14', '#e0b98a', 1.3);
  s += `<path d="${d}" fill="none" stroke="#f3cf9c" stroke-width="3" opacity=".35" transform="translate(0 1) scale(.94)"/>`;
  s += face('startled', 0, 3, 1, '#fff3dd');
  // steamer front rim
  s += P('M-37 24Q0 34 37 24L36 30Q0 42 -36 30Z', '#bf8841', { sw: 1.4 }) + L('M-30 28L-29 33M-14 31L-13 36M2 32L2 37M18 31L17 36M31 28L30 33', '#8d5a22', 1.1, { op: .7 });
  return s;
}

// ---------------------------------------------------------------- maki slice (Seaweed Roll)
function maki(cx, cy, R, fill, kind, fs, noFace) {
  const nori = Math.max(3, R * .13), rice = Math.max(3.4, R * .16), fr = R - nori - rice;
  let s = `<g transform="translate(${f1(cx)} ${f1(cy)})">`;
  s += `<circle cx="1.2" cy="2.4" r="${R}" fill="#2a120c" opacity=".2" filter="url(#kk-shadow)"/>`;
  s += `<circle r="${R}" fill="#2f4a3b" stroke="${INK}" stroke-width="1.6"/><circle r="${R}" fill="url(#kk-lit)" stroke="url(#kk-rim)" stroke-width="1.1"/>`;
  s += `<path d="M${f1(-R * .78)} ${f1(-R * .4)}A${f1(R * .88)} ${f1(R * .88)} 0 0 1 ${f1(-R * .3)} ${f1(-R * .84)}" fill="none" stroke="#7fb596" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>`;
  s += `<circle r="${f1(R - nori)}" fill="#fffaf0" stroke="#d9cdb4" stroke-width=".9"/>`;
  // rice grains
  const g = rng('rice' + R); for (let i = 0; i < Math.round(R * .75); i++) { const a = g() * 6.28, rr = fr + 1 + g() * (rice - 1.5); s += `<ellipse cx="${f1(Math.cos(a) * rr)}" cy="${f1(Math.sin(a) * rr)}" rx="1.5" ry=".8" fill="#e8dcc2" transform="rotate(${f1(a * 57)} ${f1(Math.cos(a) * rr)} ${f1(Math.sin(a) * rr)})"/>`; }
  s += `<circle r="${f1(fr)}" fill="${fill}" stroke="${darken(fill, .4)}" stroke-width="1.2"/><circle r="${f1(fr)}" fill="url(#kk-lit)"/>`;
  s += `<path d="M${f1(-fr * .7)} ${f1(-fr * .45)}Q${f1(-fr * .4)} ${f1(-fr * .8)} ${f1(fr * .05)} ${f1(-fr * .85)}" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>`;
  if (noFace === 'eyes') {
    s += `<ellipse cx="${f1(-fr * .38)}" cy="-1" rx="${f1(Math.max(1.6, fr * .13))}" ry="${f1(Math.max(2, fr * .17))}" fill="#3a1a16"/><ellipse cx="${f1(fr * .38)}" cy="-1" rx="${f1(Math.max(1.6, fr * .13))}" ry="${f1(Math.max(2, fr * .17))}" fill="#3a1a16"/>` + L(`M${f1(-fr * .25)} ${f1(fr * .38)}Q0 ${f1(fr * .55)} ${f1(fr * .25)} ${f1(fr * .38)}`, INK, 1.4);
  } else s += face(kind, 0, 1, fs || fr / 19, fill);
  return s + '</g>';
}
function roll(n) {
  let s = '';
  if (n === 1) s += maki(0, 1, 34, '#86cb5a', 'grin', 1.0);
  else if (n === 2) { s += maki(-14, -11, 23, '#ff9a6a', 'happy', .62, 'eyes'); s += maki(12, 11, 26, '#ff8a5c', 'grin', .74); }
  else { s += maki(-17, -13, 19.5, '#ffd24a', 'happy', .55, 'eyes'); s += maki(17, -13, 19.5, '#86cb5a', 'grin', .55, 'eyes'); s += maki(0, 14, 23, '#ff8a5c', 'grin', .66); }
  return s;
}

// ---------------------------------------------------------------- nigiri (salmon / squid / egg); mini = no big face
const NG = {
  salmon: { top: '#ff7a55', shade: '#e0502d', face: 'smug', stripe: '#ffd0b8' },
  squid:  { top: '#efe4ff', shade: '#c8b6ef', face: 'dreamy', stripe: '#b9a6e6' },
  egg:    { top: '#ffd54a', shade: '#e9a824', face: 'happy', stripe: '#f0b92c' }
};
function nigiri(kind, o) {
  o = o || {}; const N = NG[kind]; let s = '';
  const rice = 'M-27 8Q-29 -2 -20 -3L20 -3Q29 -2 27 8L25 25Q23 32 15 32L-15 32Q-23 32 -25 25Z';
  s += `<g transform="translate(${o.x || 0} ${o.y || 0}) scale(${o.s || 1})">`;
  s += `<ellipse cx="2" cy="31" rx="31" ry="4" fill="#2a120c" opacity=".2"/>`;
  s += P(rice, '#fffaf0', { sw: 1.6 });
  s += L('M-17 16l3 1M-6 22l3 1M8 16l3 1M16 24l3 0M-14 26l2 1M0 28l3 0', '#d9cdb4', 1.1);
  const top = 'M-37 5Q-39 -12 -20 -16Q0 -18 20 -16Q39 -12 37 5Q36 17 27 15Q0 7 -27 15Q-36 17 -37 5Z';
  s += P(top, N.top, { sw: 1.7 });
  if (kind === 'salmon') s += L('M-28 -8Q-12 -13 2 -9T29 -9', N.stripe, 1.9, { op: .9 }) + L('M-31 2Q-12 -3 4 2T32 2', N.stripe, 1.7, { op: .8 });
  if (kind === 'squid') { for (let i = -3; i <= 3; i++) s += L(`M${i * 9 - 7} -15L${i * 9 + 8} 11`, N.stripe, 1, { op: .55 }) + L(`M${i * 9 + 7} -15L${i * 9 - 8} 11`, N.stripe, 1, { op: .4 }); }
  if (kind === 'egg') {
    s += L('M-33 -6Q0 -10 33 -6M-34 3Q0 -1 34 3', N.stripe, 1.2, { op: .8 });
    s += P('M15 -17L25 -15L26 14L16 13Z', '#2f4a3b', { sw: 1.4 });   // nori belt
  }
  if (o.face !== false) s += face(N.face, kind === 'egg' ? -6 : 0, -2, kind === 'egg' ? .72 : .8, N.top);
  else s += `<ellipse cx="-9" cy="-2" rx="2.4" ry="3" fill="#3a1a16"/><ellipse cx="9" cy="-2" rx="2.4" ry="3" fill="#3a1a16"/>` + L('M-4 5Q0 8 4 5', INK, 1.4);
  return s + '</g>';
}
function nigiriScene(kind) {
  let s = '';
  if (kind === 'salmon') {   // sunset: small sun with rays over the top-right, cloud strokes
    s += `<g transform="translate(25 -24)">`;
    for (let i = 0; i < 12; i++) { const a = i / 12 * 6.2832; s += L(`M${f1(Math.cos(a) * 12)} ${f1(Math.sin(a) * 12)}L${f1(Math.cos(a) * 17)} ${f1(Math.sin(a) * 17)}`, '#ffb23d', 2.4); }
    s += `<circle r="10.5" fill="#ffd166" stroke="${INK}" stroke-width="1.3"/><circle r="10.5" fill="url(#kk-lit)"/></g>`;
    s += L('M-37 -22Q-30 -26 -22 -22M-33 -14Q-27 -17 -21 -14', '#fff3d0', 2.4, { op: .95 });
    s += nigiri('salmon', { y: 8, s: .92 });
  } else if (kind === 'squid') {   // moon + stars
    s += `<path d="M0 -17A17 17 0 1 0 14 5A13 13 0 1 1 0 -17Z" fill="#fff1a8" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round" transform="translate(-27 -23) scale(.9)"/>`;
    s += star(22, -28, 5, '#fff1a8') + star(33, -20, 3.2, '#fff1a8') + star(0, -33, 3, '#fff1a8') + star(-33, 2, 2.6, '#fff1a8');
    s += nigiri('squid', { y: 8, s: .92 });
  } else {   // sun nigiri: sunburst
    s += `<g>`; for (let i = 0; i < 14; i++) { const a = i / 14 * 6.2832; s += `<path d="M${f1(Math.cos(a - .12) * 28)} ${f1(Math.sin(a - .12) * 28 - 4)}L${f1(Math.cos(a) * 38)} ${f1(Math.sin(a) * 38 - 4)}L${f1(Math.cos(a + .12) * 28)} ${f1(Math.sin(a + .12) * 28 - 4)}Z" fill="#ffe27a" stroke="${INK}" stroke-width="1"/>`; } s += `</g>`;
    s += `<circle cx="0" cy="-4" r="28" fill="#fff0a8" stroke="${INK}" stroke-width="1.3"/><circle cx="0" cy="-4" r="28" fill="url(#kk-lit)"/>`;
    s += nigiri('egg', { y: 7, s: .92 });
  }
  return s;
}

// ---------------------------------------------------------------- wasabi: Fire Paste (fiery); on = nigiri kind resting on it
function wasabi(on) {
  let s = '', dy = on ? 13 : 3, sc = on ? .82 : 1;
  const r = rng('wasabi');
  const fl = (x, h, col, w) => `<path d="M${x - w} -8Q${x - w - 4} ${-8 - h * .5} ${x - 2} ${-8 - h}Q${x - 1} ${-8 - h * .5} ${x + 4} ${-8 - h * .62}Q${x + w + 3} ${-8 - h * .35} ${x + w} -8Z" fill="${col}" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>`;
  s += `<g transform="translate(0 ${dy}) scale(${sc})">`;
  s += fl(-18, 24, '#ff7a2a', 9) + fl(17, 26, '#ff8f2e', 9) + fl(0, 32, '#ffb12e', 11) + fl(0, 20, '#ffe066', 6);
  // leaf
  s += P('M-40 28Q-40 16 -14 20Q0 24 14 20Q40 16 40 28Q38 38 0 38Q-38 38 -40 28Z', '#3f9a4a', { sw: 1.4 });
  s += L('M-32 30Q0 24 32 30', '#2a7435', 1.1);
  // plump grated mound
  const d = 'M-31 25Q-35 4 -20 -4Q-9 -13 0 -12Q9 -13 20 -4Q35 4 31 25Q0 32 -31 25Z';
  s += P(d, '#8ac43c', { sw: 1.7 });
  for (let i = 0; i < 26; i++) { const x = (r() - .5) * 50, y = -6 + r() * 30; if ((x * x) / 900 + ((y - 8) * (y - 8)) / 500 < 1) s += dot(x, y, .9 + r() * 1.2, r() > .5 ? '#c4e873' : '#6ea62a', .85); }
  s += face('fiery', 0, 9, .98, '#8ac43c');
  s += '</g>';
  if (on) {
    s += nigiri(on, { x: 0, y: -23, s: .5, face: false });
    let d2 = ''; for (let i = 0; i < 16; i++) { const a = i / 16 * 6.2832, rr = i % 2 ? 7.4 : 11; d2 += (i ? 'L' : 'M') + f1(30 + Math.sin(a) * rr) + ' ' + f1(-28 - Math.cos(a) * rr); }
    s += `<path d="${d2}Z" fill="#ffd23a" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/><text x="30" y="-24.2" text-anchor="middle" font-family="${K.FONT}" font-weight="900" font-size="10.5" fill="${INK}">x3</text>`;
  }
  return s;
}

// ---------------------------------------------------------------- chop: Twin Sticks (wink)
function stick(x1, y1, x2, y2, w1, w2, col, band) {
  const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
  const p = (t, w) => [x1 + dx * t + nx * w / 2, y1 + dy * t + ny * w / 2, x1 + dx * t - nx * w / 2, y1 + dy * t - ny * w / 2];
  const A = p(0, w1), B = p(1, w2);
  let s = P(`M${f1(A[0])} ${f1(A[1])}L${f1(B[0])} ${f1(B[1])}L${f1(B[2])} ${f1(B[3])}L${f1(A[2])} ${f1(A[3])}Z`, col, { sw: 1.3 });
  const t = .3, wt = w1 + (w2 - w1) * t, q = p(t, wt), q2 = p(t + .07, wt + (w2 - w1) * .07);
  s += `<path d="M${f1(q[0])} ${f1(q[1])}L${f1(q[2])} ${f1(q[3])}L${f1(q2[2])} ${f1(q2[3])}L${f1(q2[0])} ${f1(q2[1])}Z" fill="${band}" stroke="${INK}" stroke-width=".9"/>`;
  return s;
}
function chop() {
  let s = '';
  s += stick(-27, 38, 22, -44, 3.4, 6.6, '#8e2f3d', '#f0cc5a');
  s += stick(27, 38, -22, -44, 3.4, 6.6, '#2f3a4e', '#e8e8e8');
  // porcelain pebble rest
  const d = 'M-24 18Q-28 -4 -8 -10Q10 -14 23 -4Q31 6 24 19Q0 27 -24 18Z';
  s += `<ellipse cx="1" cy="25" rx="27" ry="4" fill="#2a120c" opacity=".2"/>`;
  s += P(d, '#eaf2f7', { sw: 1.7 });
  s += L('M-21 15Q-14 11 -7 15T7 15T21 14', '#6b8cc4', 1.5) + L('M-17 21Q-10 17 -3 21T11 21T19 19', '#6b8cc4', 1.2, { op: .8 });
  s += face('wink', -1, 1, .88, '#eaf2f7');
  return s;
}

// ---------------------------------------------------------------- pudding: Custard Cup (bliss, tiny chef hat)
function pudding() {
  let s = '';
  s += `<ellipse cx="1" cy="31" rx="27" ry="4.5" fill="#2a120c" opacity=".2"/>`;
  s += P('M-26 -6L26 -6L20 27Q0 34 -20 27Z', '#ffdf86', { sw: 1.7 });
  s += P('M-27 -9Q-28 1 -22 4Q-19 10 -15 4Q-11 1 -7 7Q-2 12 3 4Q8 1 13 8Q19 5 22 -1Q28 -3 27 -9Q0 -20 -27 -9Z', '#b4601c', { sw: 1.5 });
  s += L('M-18 -12Q-8 -16 4 -14', '#e8a35a', 1.8, { op: .8 });
  s += face('bliss', 0, 14, .86, '#ffdf86');
  // chef hat
  s += P('M-12 -14L12 -14L11 -24L-11 -24Z', '#fffdf6', { sw: 1.4 });
  s += P('M-12 -24Q-20 -26 -17 -34Q-14 -41 -6 -38Q-3 -46 5 -40Q13 -43 15 -35Q21 -30 12 -24Z', '#fffdf6', { sw: 1.5 });
  s += L('M-5 -23L-5 -17M3 -23L3 -17', '#d9cdb4', 1.1);
  // cherry
  s += `<path d="M22 -14Q26 -22 31 -22" stroke="#3f7a35" stroke-width="1.6" fill="none" stroke-linecap="round"/>` + `<circle cx="22" cy="-11" r="5.2" fill="#d9304a" stroke="${INK}" stroke-width="1.3"/><circle cx="20.5" cy="-13" r="1.4" fill="#fff" opacity=".8"/>`;
  s += star(-30, -22, 4, '#fff6c8') + star(-35, -10, 2.4, '#fff6c8');
  return s;
}

function foodArt(type, o) {
  o = o || {};
  switch (type) {
    case 'tempura': return tempura();
    case 'sashimi': return sashimi();
    case 'dumpling': return dumpling();
    case 'roll1': return roll(1);
    case 'roll2': return roll(2);
    case 'roll3': return roll(3);
    case 'salmon': return nigiriScene('salmon');
    case 'squid': return nigiriScene('squid');
    case 'egg': return nigiriScene('egg');
    case 'wasabi': return wasabi(o.on || o.variant === 'nigiri' && 'salmon' || null);
    case 'chop': return chop();
    case 'pudding': return pudding();
  }
  return '';
}
K.foodArt = foodArt; K.nigiri = nigiri; K.maki = maki;
})(typeof window !== 'undefined' ? window : globalThis);

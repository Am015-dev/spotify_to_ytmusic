// Kaiten Kitchen painted scenes: conveyor belt strip, wooden counter, five diner busts, title painting.
'use strict';
const B = require('./brush.js');
const { f, rng, mix, lit, drk, blob, circ, ell, rrect, pillow, taper, part, shadow, inkLine, sparkle, face, INK } = B;

// ---------------- belt: 1024 x 128 (+128 overlap, cross-faded by paint.js so it tiles) ----------------
function belt(seed, W) {
  W = W || 1152; const H = 128, rail = 22, r = rng(seed); let s = `<rect width="${W}" height="${H}" fill="#2a1d18"/>`;
  // slats: cream rubber plates with dark gaps, period 64
  for (let x = 0; x < W; x += 64) {
    const d = `M${x + 4} ${rail + 4}H${x + 58}Q${x + 64} ${H / 2} ${x + 58} ${H - rail - 4}H${x + 4}Q${x + 10} ${H / 2} ${x + 4} ${rail + 4}Z`;
    s += part(d, '#e9dcc0', { filter: 'paintS', box: [x, rail, x + 64, H - rail], st: { n: 4, w: 10, ang: 0, op: .3 }, seed: seed + x, inner: `<path d="M${x + 14} ${H / 2 - 12}L${x + 30} ${H / 2}L${x + 14} ${H / 2 + 12}" stroke="#b7a483" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".7"/>` });
  }
  // brushed steel rails
  const steel = (y, h, flip) => { let st = ''; for (let i = 0; i < 26; i++) { const yy = y + 2 + r() * (h - 4), x0 = r() * W, len = 60 + r() * 220; st += `<path d="M${f(x0)} ${f(yy)}H${f(x0 + len)}" stroke="${r() < .5 ? '#ffffff' : '#6b6656'}" stroke-width="${f(1 + r() * 1.6)}" opacity="${f(.2 + r() * .3)}"/>`; }
    return `<g filter="url(#paintN)"><rect x="-4" y="${y}" width="${W + 8}" height="${h}" fill="url(#${flip ? 'stl2' : 'stl'})"/>${st}</g><rect x="0" y="${flip ? y : y + h - 2}" width="${W}" height="2.4" fill="#1a110e" opacity=".7"/>`; };
  s += `<defs><linearGradient id="stl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4efe2"/><stop offset=".45" stop-color="#c7c0ad"/><stop offset="1" stop-color="#7d7664"/></linearGradient><linearGradient id="stl2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#d8d1bf"/><stop offset=".5" stop-color="#a59e8b"/><stop offset="1" stop-color="#6d6655"/></linearGradient></defs>`;
  s += steel(0, rail, false) + steel(H - rail, rail, true);
  for (let x = 32; x < W; x += 64) s += `<circle cx="${x}" cy="${rail / 2}" r="3.2" fill="#8a8370" stroke="#4d4636" stroke-width="1.4"/><circle cx="${x}" cy="${H - rail / 2}" r="3.2" fill="#8a8370" stroke="#4d4636" stroke-width="1.4"/>`;
  return s;
}
// ---------------- counter: 1024 x 256 (+256 overlap) warm wood planks from above ----------------
function counter(seed, W) {
  W = W || 1280; const H = 256, r = rng(seed); let s = '';
  const cols = ['#b87a43', '#ad703c', '#c08449', '#a6693a'];
  const ph = 64;
  for (let i = 0; i < 4; i++) {
    const y = i * ph; let grain = '';
    for (let g = 0; g < 18; g++) { const gy = y + 6 + r() * (ph - 12), x0 = r() * W - 100, len = 200 + r() * 600, wv = (r() - .5) * 10; grain += `<path d="M${f(x0)} ${f(gy)}q${f(len / 4)} ${f(wv)} ${f(len / 2)} 0t${f(len / 2)} 0" fill="none" stroke="${r() < .7 ? '#7a4524' : '#e0a468'}" stroke-opacity="${f(.18 + r() * .25)}" stroke-width="${f(1.2 + r() * 2.4)}" stroke-linecap="round"/>`; }
    for (let k = 0; k < 2; k++) { const kx = r() * W, ky = y + ph * (.3 + r() * .4); grain += `<ellipse cx="${f(kx)}" cy="${f(ky)}" rx="${f(14 + r() * 8)}" ry="${f(5 + r() * 2)}" fill="none" stroke="#6a3a1c" stroke-opacity=".35" stroke-width="2.4"/><ellipse cx="${f(kx)}" cy="${f(ky)}" rx="6" ry="2.4" fill="#6a3a1c" opacity=".3"/>`; }
    s += `<g filter="url(#paintN)"><rect x="-6" y="${y}" width="${W + 12}" height="${ph + 1}" fill="${cols[i]}"/>${grain}</g>`;
    if (i) s += `<rect x="0" y="${y - 1.5}" width="${W}" height="3" fill="#4e2a14" opacity=".6"/><rect x="0" y="${y + 1.5}" width="${W}" height="1.6" fill="#f3c08a" opacity=".25"/>`;
  }
  s += `<rect width="${W}" height="${H}" fill="url(#cg)"/>`;
  return `<defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1206" stop-opacity=".18"/><stop offset=".35" stop-color="#fff2d0" stop-opacity=".08"/><stop offset="1" stop-color="#2a1206" stop-opacity=".22"/></linearGradient></defs>` + s;
}

// ---------------- diners ----------------
const CHEF = [
  { n: 'Mina', skin: '#8a5a3c', bg: '#fbd5c9', c: '#e5553a', mood: 'grin' },
  { n: 'Taro', skin: '#efc8a0', bg: '#c6ecee', c: '#2a97a0', mood: 'determined' },
  { n: 'Odile', skin: '#d39b6c', bg: '#f9e6b0', c: '#e0a31c', mood: 'happy' },
  { n: 'Kofi', skin: '#5d3a28', bg: '#ddd2f5', c: '#7a5ac8', mood: 'grin' },
  { n: 'Pip', skin: '#f6d6bb', bg: '#d3ecc5', c: '#5aa83c', mood: 'wink' }];
// a bust in a 512 box: head centre ~ (256, 230)
function chefInner(i, seed) {
  const a = CHEF[i], sk = a.skin; let s = '';
  const torso = 'M70 560C70 430 150 380 256 380C362 380 442 430 442 560Z';
  const neck = 'M220 330L292 330L296 400Q256 420 216 400Z';
  const head = blob(256, 240, 108, 122, .015, seed, 16);
  const ears = part(circ(150, 256, 24), sk, { filter: 'paintS', box: [126, 232, 174, 280], noStrokes: true }) + part(circ(362, 256, 24), sk, { filter: 'paintS', box: [338, 232, 386, 280], noStrokes: true });
  const hair = (d, col) => part(d, col, { box: [100, 60, 420, 420], st: { n: 12, w: 14, ang: 70, op: .4 }, seed: seed + 3 });
  const body = (col, inner) => part(torso, col, { box: [70, 380, 442, 560], st: { n: 10, w: 26, ang: -20, op: .3 }, seed: seed + 1, inner: inner || '' });
  const skinP = d => part(d, sk, { box: [130, 110, 380, 380], st: { n: 8, w: 30, ang: -30, op: .18 }, seed: seed + 2 });
  if (i === 0) {   // Mina: two braids, yellow headband, red top
    s += hair(B.closed([[146, 220], [150, 130], [256, 96], [362, 130], [366, 220], [352, 190], [256, 150], [160, 190]]), '#2b1a14');
    for (const sx of [-1, 1]) { let br = ''; for (let k = 0; k < 4; k++) br += part(blob(256 + sx * 128, 300 + k * 48, 26, 30, .05, seed + k + sx * 9, 10), '#2b1a14', { filter: 'paintS', box: [200, 260, 420, 520].map((v, j) => j % 2 ? v : 256 + sx * (j ? 170 : 90)), noStrokes: true }); s += br + part(circ(256 + sx * 128, 492, 14), '#f2b92c', { filter: 'paintS', box: [0, 470, 512, 512], noStrokes: true }); }
    s += body('#e5553a', `<path d="M200 380L256 452L312 380" fill="#fffaf0"/>`) + skinP(neck) + ears + skinP(head);
    s += hair('M144 230C140 150 190 112 256 112C322 112 372 150 368 230C340 180 300 166 256 168C212 166 172 180 144 230Z', '#2b1a14');
    s += part(taper([[144, 186], [256, 128], [368, 186]], 34, 30, 34), '#f2b92c', { filter: 'paintS', box: [130, 110, 380, 210], st: { n: 4, w: 8, ang: 0, op: .3 } });
  } else if (i === 1) {   // Taro: spiky hair, twisted towel headband, teal jacket
    s += body('#2a97a0', `<path d="M210 380L256 470L302 380" fill="#fffaf0"/><circle cx="256" cy="490" r="8" fill="#fffaf0"/>`) + skinP(neck) + ears + skinP(head);
    s += hair(B.closed([[144, 220], [138, 150], [160, 88], [196, 120], [214, 60], [250, 108], [282, 52], [304, 108], [344, 70], [350, 130], [378, 120], [370, 222], [330, 176], [256, 164], [180, 176]]), '#1f1a1c');
    s += part(taper([[140, 194], [256, 158], [372, 194]], 40, 36, 40), '#fffaf0', { filter: 'paintS', box: [126, 140, 386, 220], st: { n: 6, w: 6, ang: 20, op: .35 }, inner: [0, 1, 2, 3, 4, 5].map(k => inkLine([[160 + k * 38, 202 - k * 4], [176 + k * 38, 176 - k * 3], [190 + k * 38, 160 - k * 2]], 3, '#b9b0a0', .7)).join('') });
    s += part(taper([[370, 190], [404, 168], [420, 196]], 22, 18, 10), '#fffaf0', { filter: 'paintS', box: [360, 150, 430, 210], noStrokes: true });
  } else if (i === 2) {   // Odile: tall chef's hat, grey curls, mustard apron
    s += hair(B.closed([[140, 250], [150, 170], [256, 140], [362, 170], [372, 250], [350, 300], [256, 180], [162, 300]]), '#cfd0d8');
    s += body('#fffaf0', `<path d="M180 400L332 400L350 560L162 560Z" fill="#e0a31c"/>`) + skinP(neck) + ears + skinP(head);
    s += part('M160 170L352 170L340 118L172 118Z', '#fffdf6', { filter: 'paintS', box: [150, 110, 362, 180], st: { n: 4, op: .2 } });
    s += part('M170 124C120 120 110 50 160 40C170 0 230 -10 256 20C282 -10 342 0 352 40C402 50 392 120 342 124Z', '#fffdf6', { filter: 'paintS', box: [110, 0, 402, 130], st: { n: 8, w: 18, op: .18 } });
    s += part(taper([[150, 210], [176, 186], [204, 176]], 30, 34, 26), '#cfd0d8', { filter: 'paintS', box: [130, 160, 220, 240], noStrokes: true }) + part(taper([[362, 210], [336, 186], [308, 176]], 30, 34, 26), '#cfd0d8', { filter: 'paintS', box: [290, 160, 380, 240], noStrokes: true });
  } else if (i === 3) {   // Kofi: violet cap, big smile, violet shirt
    s += body('#7a5ac8', `<path d="M214 380L256 440L298 380" fill="#f2b92c"/>`) + skinP(neck) + ears + skinP(head);
    s += hair('M150 214C150 180 170 160 200 156L312 156C342 160 362 180 362 214C330 196 290 190 256 190C222 190 182 196 150 214Z', '#1f1a1c');
    s += part('M140 196C136 110 196 78 256 78C316 78 376 110 372 196C330 170 290 164 256 164C222 164 182 170 140 196Z', '#7a5ac8', { box: [130, 70, 380, 200], st: { n: 8, w: 18, ang: 10, op: .35 } });
    s += part('M200 176C240 162 300 160 352 170C380 176 410 190 404 206C380 214 300 200 220 204Z', '#5d3fa6', { filter: 'paintS', box: [190, 150, 410, 214], noStrokes: true }) + part(circ(256, 82, 12), '#5d3fa6', { filter: 'paintS', box: [240, 66, 272, 98], noStrokes: true });
  } else {   // Pip: ginger hair, green cap, freckles, overalls
    s += hair(B.closed([[140, 260], [146, 170], [256, 130], [366, 170], [372, 260], [384, 330], [340, 300], [256, 200], [172, 300], [128, 330]]), '#d9622b');
    s += body('#fffaf0', `<path d="M196 400L316 400L330 560L182 560Z" fill="#4f7fc0"/><circle cx="210" cy="430" r="9" fill="#f2b92c"/><circle cx="302" cy="430" r="9" fill="#f2b92c"/>`) + skinP(neck) + ears + skinP(head);
    s += part('M136 200C140 110 200 84 262 84C330 86 380 118 378 200C330 178 290 172 256 172C222 172 182 178 136 200Z', '#5aa83c', { box: [130, 76, 384, 206], st: { n: 8, w: 18, ang: 10, op: .35 } });
    s += part('M128 204C190 176 330 176 388 200L398 224C330 206 190 206 118 226Z', '#3f8a28', { filter: 'paintS', box: [110, 170, 400, 230], noStrokes: true }) + part(circ(262, 86, 12), '#3f8a28', { filter: 'paintS', box: [246, 70, 278, 102], noStrokes: true });
    const r = rng(seed + 5); for (let k = 0; k < 7; k++) s += `<circle cx="${f(190 + r() * 34)}" cy="${f(282 + r() * 20)}" r="4" fill="#b5653a" opacity=".75"/><circle cx="${f(290 + r() * 34)}" cy="${f(282 + r() * 20)}" r="4" fill="#b5653a" opacity=".75"/>`;
  }
  s += face(256, 252, 3, a.mood, sk, { spread: 1 });
  return s;
}
function chef(i, seed) {
  const a = CHEF[i]; const id = 'chc' + i;
  return `<defs><clipPath id="${id}"><circle cx="256" cy="256" r="246"/></clipPath><radialGradient id="${id}g" cx=".45" cy=".35" r=".75"><stop offset="0" stop-color="${lit(a.bg, .55)}"/><stop offset="1" stop-color="${a.bg}"/></radialGradient></defs>
<g filter="url(#paintN)"><circle cx="256" cy="256" r="248" fill="url(#${id}g)"/></g><g clip-path="url(#${id})"><g transform="translate(0 30)">${chefInner(i, seed)}</g></g>`;
}

// ---------------- title painting 1600 x 900: a cosy belt-sushi bar at night ----------------
function title(seed, imgs) {
  const W = 1600, H = 900, r = rng(seed); let s = '';
  s += `<defs><linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1610"/><stop offset=".55" stop-color="#5a3220"/><stop offset="1" stop-color="#3a2116"/></linearGradient>
<radialGradient id="warm" cx=".5" cy=".42" r=".62"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".42"/><stop offset=".6" stop-color="#ff9a3a" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
<radialGradient id="vig2" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#120804" stop-opacity="0"/><stop offset="1" stop-color="#120804" stop-opacity=".6"/></radialGradient>
<radialGradient id="lglow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd890" stop-opacity=".85"/><stop offset=".5" stop-color="#ffb050" stop-opacity=".25"/><stop offset="1" stop-color="#ff9030" stop-opacity="0"/></radialGradient></defs>`;
  // wall: vertical painted slats
  s += `<rect width="${W}" height="${H}" fill="url(#wall)"/>`;
  let sl = ''; for (let x = 0; x < W; x += 54) sl += `<rect x="${x}" y="0" width="50" height="560" fill="${r() < .5 ? '#6b3c25' : '#5d331f'}" opacity=".75"/><path d="M${x + 25} 0V560" stroke="#3a1d10" stroke-width="2" opacity=".4"/>`;
  s += `<g filter="url(#paintN)">${sl}</g>`;
  // noren curtain behind the diners (indigo, wave motif), split panels
  let nr = ''; for (let k = 0; k < 5; k++) { const x = 470 + k * 134; nr += `<path d="M${x} 250H${x + 128}V430Q${x + 64} 440 ${x} 430Z" fill="#26407a"/>`; for (let j = 0; j < 3; j++) nr += `<path d="M${x + 10} ${300 + j * 40}q${f(27)} -22 54 0t54 0" stroke="#e9dcbc" stroke-width="5" fill="none" opacity=".6"/>`; }
  s += `<g filter="url(#paintS)">${nr}</g><rect x="456" y="236" width="688" height="18" rx="6" fill="#3a2010" filter="url(#wob)"/>`;
  // the warm light
  s += `<rect width="${W}" height="${H}" fill="url(#warm)"/>`;
  // lanterns on both sides
  const lantern = (x, y, sc, col) => { const d = `M${x - 60 * sc} ${y}C${x - 70 * sc} ${y - 70 * sc} ${x - 40 * sc} ${y - 100 * sc} ${x} ${y - 100 * sc}C${x + 40 * sc} ${y - 100 * sc} ${x + 70 * sc} ${y - 70 * sc} ${x + 60 * sc} ${y}C${x + 70 * sc} ${y + 70 * sc} ${x + 40 * sc} ${y + 100 * sc} ${x} ${y + 100 * sc}C${x - 40 * sc} ${y + 100 * sc} ${x - 70 * sc} ${y + 70 * sc} ${x - 60 * sc} ${y}Z`;
    let ribs = ''; for (let k = -3; k <= 3; k++) ribs += `<path d="M${f(x - 66 * sc)} ${f(y + k * 26 * sc)}Q${x} ${f(y + k * 26 * sc + 8 * sc)} ${f(x + 66 * sc)} ${f(y + k * 26 * sc)}" stroke="${drk(col, .4)}" stroke-width="${f(3 * sc)}" fill="none" opacity=".5"/>`;
    return `<circle cx="${x}" cy="${y}" r="${f(230 * sc)}" fill="url(#lglow)"/><path d="M${x} 0V${f(y - 112 * sc)}" stroke="#1f120c" stroke-width="${f(4 * sc)}"/>` + part(d, col, { filter: 'paintS', box: [x - 72 * sc, y - 100 * sc, x + 72 * sc, y + 100 * sc], st: { n: 6, w: 20 * sc, ang: 90, op: .3 }, inner: ribs + `<ellipse cx="${f(x - 14 * sc)}" cy="${f(y - 20 * sc)}" rx="${f(30 * sc)}" ry="${f(46 * sc)}" fill="#fff6d0" opacity=".55" filter="url(#soft)"/>` }) +
      `<rect x="${f(x - 30 * sc)}" y="${f(y - 116 * sc)}" width="${f(60 * sc)}" height="${f(18 * sc)}" rx="${f(5 * sc)}" fill="#2a1810"/><rect x="${f(x - 30 * sc)}" y="${f(y + 98 * sc)}" width="${f(60 * sc)}" height="${f(18 * sc)}" rx="${f(5 * sc)}" fill="#2a1810"/><path d="M${x} ${f(y + 116 * sc)}v${f(40 * sc)}" stroke="#c9302a" stroke-width="${f(6 * sc)}" stroke-linecap="round"/>`; };
  s += lantern(150, 170, 1.05, '#e5553a') + lantern(370, 120, .8, '#f3e2b8') + lantern(1230, 120, .8, '#f3e2b8') + lantern(1450, 170, 1.05, '#e5553a');
  // diners behind the belt (bust figures)
  const dn = [[300, 1, .78], [640, 0, .86], [960, 3, .86], [1300, 4, .78]];
  for (const [x, i, sc] of dn) s += `<g transform="translate(${f(x - 256 * sc)} ${f(318)}) scale(${sc})">${chefInner(i, seed + i * 7)}</g>`;
  // conveyor belt (perspective-free strip) with plates gliding
  const by = 600, bh = 130;
  s += `<rect x="-10" y="${by - 16}" width="${W + 20}" height="${bh + 32}" fill="#1f1512" filter="url(#wob)"/>`;
  s += `<g filter="url(#paintN)"><rect x="-10" y="${by - 16}" width="${W + 20}" height="20" fill="#cfc8b4"/><rect x="-10" y="${by + bh - 4}" width="${W + 20}" height="20" fill="#a39c88"/></g>`;
  let slats = ''; for (let x = -20; x < W; x += 70) slats += `<path d="M${x + 4} ${by + 8}H${x + 64}Q${x + 72} ${by + bh / 2} ${x + 64} ${by + bh - 8}H${x + 4}Q${x + 12} ${by + bh / 2} ${x + 4} ${by + 8}Z" fill="#e7d9bd"/>`;
  s += `<g filter="url(#paintS)">${slats}</g>`;
  const plates = ['tempura', 'sashimi', 'dumpling', 'roll2', 'salmon', 'squid', 'egg', 'wasabi', 'chop', 'pudding', 'roll3'];
  plates.forEach((id, k) => { const x = -40 + k * 156 + (k % 2) * 18, y = by - 30 - (k % 2) * 6, sz = 170; if (imgs[id]) s += `<image href="${imgs[id]}" x="${x}" y="${y}" width="${sz}" height="${sz}"/>`; });
  // counter in front
  s += `<g filter="url(#paintN)"><rect x="-10" y="${by + bh + 14}" width="${W + 20}" height="${H - by - bh}" fill="#a86a38"/>`;
  for (let g = 0; g < 30; g++) { const y = by + bh + 30 + r() * 130, x0 = r() * W - 100, len = 300 + r() * 600; s += `<path d="M${f(x0)} ${f(y)}q${f(len / 4)} ${f((r() - .5) * 8)} ${f(len / 2)} 0t${f(len / 2)} 0" fill="none" stroke="#6e3a1a" stroke-opacity="${f(.2 + r() * .25)}" stroke-width="${f(2 + r() * 3)}"/>`; }
  s += `</g><rect x="-10" y="${by + bh + 14}" width="${W + 20}" height="10" fill="#e3a868" opacity=".6"/>`;
  // teacups and a soy dish on the counter
  const cup = (x, y) => part(ell(x, y, 46, 30), '#e8e2d2', { filter: 'paintS', box: [x - 50, y - 34, x + 50, y + 34], noStrokes: true, inner: `<ellipse cx="${x}" cy="${y - 4}" rx="34" ry="20" fill="#8aa86a"/><path d="M${x - 40} ${y + 8}q40 16 80 0" stroke="#c9302a" stroke-width="5" fill="none"/>` });
  s += cup(260, 820) + cup(1340, 830) + part(ell(800, 840, 70, 26), '#2c2a36', { filter: 'paintS', box: [726, 810, 874, 870], noStrokes: true, inner: `<ellipse cx="800" cy="836" rx="54" ry="16" fill="#4a1e10"/>` });
  // steam from a bun and sparkles
  s += `<g opacity=".85">${[0, 1, 2].map(k => `<path d="${taper([[380 + k * 30, 600], [366 + k * 30, 560], [388 + k * 30, 520], [374 + k * 30, 480]], 6, 16, 4)}" fill="#fff" opacity=".6" filter="url(#soft2)"/>`).join('')}</g>`;
  s += sparkle(560, 210, 14) + sparkle(1040, 200, 12) + sparkle(800, 160, 9);
  s += `<rect width="${W}" height="${H}" fill="url(#vig2)"/>`;
  return s;
}
module.exports = { belt, counter, chef, chefInner, title, CHEF };

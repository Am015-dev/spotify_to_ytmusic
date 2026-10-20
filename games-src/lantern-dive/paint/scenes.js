// Lantern Dive painted scenes: the deep-sea table, the title painting and five diver portraits.
'use strict';
const B = require('./brush.js');
const { f, rng, mix, lit, drk, blob, circ, ell, rrect, taper, part, shadow, inkLine, sparkle, face, INK } = B;

// ---------------- the table: 1280 x 720 ----------------
function table(seed) {
  const W = 1280, H = 720, r = rng(seed); let s = `<defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f3d72"/><stop offset=".5" stop-color="#0a2c57"/><stop offset="1" stop-color="#061a38"/></linearGradient>
<radialGradient id="tv" cx=".5" cy=".46" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#020b1c" stop-opacity=".72"/></radialGradient>
<linearGradient id="ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfeaff" stop-opacity=".2"/><stop offset="1" stop-color="#bfeaff" stop-opacity="0"/></linearGradient></defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#tg)"/>`;
  // light rays from the surface
  for (let i = 0; i < 6; i++) { const x = 80 + i * 230 + r() * 60, w = 70 + r() * 90; s += `<path d="M${f(x)} 0L${f(x + w)} 0L${f(x + w * 2.4 - 160)} ${H}L${f(x - w * .6 - 160)} ${H}Z" fill="url(#ray)" opacity="${f(.5 + r() * .4)}" filter="url(#soft)"/>`; }
  // caustic net: soft light cells + thin bright lines
  for (let i = 0; i < 26; i++) { const cx = r() * W, cy = r() * H, rr = 40 + r() * 90; s += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rr)}" ry="${f(rr * (.4 + r() * .4))}" fill="#7fd8ff" opacity="${f(.035 + r() * .06)}" filter="url(#soft)" transform="rotate(${f(r() * 180)} ${f(cx)} ${f(cy)})"/>`; }
  // sand ripples at the bottom
  // a calm painted sea floor: soft sand mounds and a few rounded pebbles (no line work, nothing that reads as scribbles)
  for (let i = 0; i < 4; i++) { const x = W * (.12 + i * .26 + r() * .05), y = H - 38 + r() * 16; s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(150 + r() * 90)}" ry="${f(34 + r() * 14)}" fill="${i % 2 ? '#123a63' : '#0d2f55'}" opacity=".5" filter="url(#soft)"/>`; }
  for (let i = 0; i < 9; i++) { const x = 60 + r() * (W - 120), y = H - 30 - r() * 34, rr = 7 + r() * 13; s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rr * 1.3)}" ry="${f(rr)}" fill="${['#1b4c7a', '#2a5f86', '#17406a'][i % 3]}" stroke="#0b2038" stroke-width="2" opacity=".7"/><ellipse cx="${f(x - rr * .3)}" cy="${f(y - rr * .35)}" rx="${f(rr * .5)}" ry="${f(rr * .28)}" fill="#8fc9e8" opacity=".25"/>`; }
  s += `<path d="M0 ${H - 70}Q${W * .25} ${H - 120} ${W * .5} ${H - 84}T${W} ${H - 96}V${H}H0Z" fill="#0a2547" opacity=".55"/>`;
  // kelp forests at the edges
  const kel = (x0, flip) => { let d = ''; for (let i = 0; i < 4; i++) { const x = x0 + (flip ? -1 : 1) * i * 38 + r() * 14, h = 260 + r() * 200, sw = (flip ? -1 : 1) * (30 + r() * 24); d += `<path d="${taper([[x, H + 10], [x + sw, H - h * .4], [x - sw * .5, H - h * .7], [x + sw * .3, H - h]], 26, 22, 4)}" fill="${i % 2 ? '#0d3a4a' : '#0a2f45'}" opacity="${f(.55 + r() * .25)}"/>`; } return d; };
  s += kel(10, false) + kel(W - 20, true);
  // drifting bubbles
  for (let i = 0; i < 42; i++) { const x = r() * W, y = r() * H, rr = 2 + r() * 7; s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="none" stroke="#d8f4ff" stroke-width="${f(1 + rr * .12)}" opacity="${f(.12 + r() * .3)}"/><circle cx="${f(x - rr * .3)}" cy="${f(y - rr * .3)}" r="${f(rr * .25)}" fill="#fff" opacity=".35"/>`; }
  s += `<rect width="${W}" height="${H}" fill="url(#tv)"/>`;
  return s;
}

// ---------------- diver portraits: 512 x 512 ----------------
const DIV = [
  { skin: '#8a5a3c', hair: '#2a1a14', helm: '#e2607f', tone: '#f7cdd6', mood: 'determined', hairKind: 'bun' },
  { skin: '#efc8a0', hair: '#7a4a20', helm: '#3f82da', tone: '#cfe0f8', mood: 'smile', hairKind: 'short' },
  { skin: '#f0c9a8', hair: '#10131c', helm: '#3fa86d', tone: '#c9eed8', mood: 'wink', hairKind: 'bob' },
  { skin: '#d39b6c', hair: '#c0782c', helm: '#f1b82e', tone: '#fbe8b0', mood: 'grin', hairKind: 'spiky' },
  { skin: '#5d3a28', hair: '#18110d', helm: '#9b6ae6', tone: '#e2d4f8', mood: 'smug', hairKind: 'curly' }];
function diver(i, seed) {
  const a = DIV[i % 5]; let s = '';
  s += `<circle cx="256" cy="256" r="240" fill="${a.tone}"/><circle cx="256" cy="256" r="240" fill="none" stroke="${INK}" stroke-width="8"/>`;
  s += `<clipPath id="dc${i}"><circle cx="256" cy="256" r="236"/></clipPath><g clip-path="url(#dc${i})">`;
  // little bubbles in the backdrop
  const r = rng(seed); for (let k = 0; k < 9; k++) s += `<circle cx="${f(30 + r() * 450)}" cy="${f(30 + r() * 200)}" r="${f(5 + r() * 10)}" fill="none" stroke="#fff" stroke-width="3" opacity=".55"/>`;
  // shoulders and suit
  s += part('M40 520C40 420 130 372 256 372C382 372 472 420 472 520Z', a.helm, { box: [30, 360, 480, 520], st: { n: 8, w: 24, ang: -20, op: .36 }, seed: seed + 1, inner: `<path d="M256 380V520" stroke="${INK}" stroke-width="5" opacity=".4"/><rect x="170" y="430" width="52" height="30" rx="8" fill="${lit(a.helm, .4)}" opacity=".7"/>` });
  // helmet ring and neck
  s += part('M170 360C170 392 342 392 342 360L342 332L170 332Z', mix(a.helm, '#cfd9e8', .45), { filter: 'paintS', noStrokes: true, seed: seed + 2 });
  // head
  const head = blob(256, 234, 98, 112, .012, seed + 3, 16);
  s += part(head, a.skin, { box: [150, 120, 360, 350], st: { n: 6, w: 20, ang: -35, op: .3 }, seed: seed + 3 });
  // hair
  const hk = a.hairKind;
  const hair = hk === 'bun' ? `<circle cx="256" cy="92" r="44" fill="${a.hair}" stroke="${INK}" stroke-width="5"/><path d="M158 220C150 130 200 106 256 106C312 106 362 130 354 220C340 172 300 150 256 150C212 150 172 172 158 220Z" fill="${a.hair}" stroke="${INK}" stroke-width="5"/>`
    : hk === 'short' ? `<path d="M156 214C148 124 210 100 262 106C320 112 366 140 356 218C340 170 304 150 256 152C206 154 170 176 156 214Z" fill="${a.hair}" stroke="${INK}" stroke-width="5"/>`
    : hk === 'bob' ? `<path d="M150 290C128 160 180 100 256 100C332 100 384 160 362 290C350 220 340 170 256 160C172 170 162 220 150 290Z" fill="${a.hair}" stroke="${INK}" stroke-width="5"/>`
    : hk === 'spiky' ? `<path d="M156 216L150 150L196 160L206 100L246 140L272 92L304 146L346 112L350 170L362 218C340 170 304 150 256 152C206 154 172 176 156 216Z" fill="${a.hair}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`
    : `<g fill="${a.hair}" stroke="${INK}" stroke-width="5">${[[160, 170, 38], [206, 124, 42], [262, 108, 44], [318, 124, 42], [356, 172, 38], [150, 224, 30], [366, 226, 30]].map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}"/>`).join('')}</g>`;
  s += `<g filter="url(#paintS)">${hair}</g>`;
  s += face(256, 240, 2.1, a.mood, a.skin);
  // glass dome with a rim light, over everything
  s += `<ellipse cx="256" cy="238" rx="140" ry="150" fill="#bfe8ff" opacity=".18" stroke="${a.helm}" stroke-width="16"/><ellipse cx="256" cy="238" rx="140" ry="150" fill="none" stroke="${INK}" stroke-width="5"/><path d="M150 180C160 120 210 84 262 84" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".6"/>`;
  s += `</g>`;
  return s;
}

// ---------------- the title painting: 1600 x 900 ----------------
function title(seed, imgs) {
  const W = 1600, H = 900, r = rng(seed); imgs = imgs || {};
  let s = `<defs><linearGradient id="ttg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b6ab0"/><stop offset=".3" stop-color="#0f3f7e"/><stop offset=".65" stop-color="#0a2652"/><stop offset="1" stop-color="#040f26"/></linearGradient>
<radialGradient id="ttl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe9a6" stop-opacity=".95"/><stop offset=".4" stop-color="#ffd873" stop-opacity=".35"/><stop offset="1" stop-color="#ffd873" stop-opacity="0"/></radialGradient>
<linearGradient id="tray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8f4ff" stop-opacity=".34"/><stop offset="1" stop-color="#d8f4ff" stop-opacity="0"/></linearGradient>
<radialGradient id="ttv" cx=".5" cy=".5" r=".75"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#010814" stop-opacity=".7"/></radialGradient></defs>`;
  s += `<rect width="${W}" height="${H}" fill="url(#ttg)"/>`;
  for (let i = 0; i < 7; i++) { const x = 100 + i * 220 + r() * 70, w = 60 + r() * 120; s += `<path d="M${f(x)} 0L${f(x + w)} 0L${f(x + w * 2 - 330)} ${H}L${f(x - 330 - w * .3)} ${H}Z" fill="url(#tray)" opacity="${f(.4 + r() * .4)}" filter="url(#soft)"/>`; }
  // far ruins: arches and columns in blue haze, with golden windows
  const ruin = (x, y, sc, a) => { let q = ''; q += `<g opacity="${a}" transform="translate(${x} ${y}) scale(${sc})">`;
    q += `<path d="M0 260V120Q0 20 70 20Q140 20 140 120V260H110V120Q110 52 70 52Q30 52 30 120V260Z" fill="#17407a"/><rect x="-70" y="90" width="34" height="170" fill="#133a70"/><rect x="176" y="70" width="38" height="190" fill="#133a70"/><path d="M-90 90H-16V66H-90ZM160 70H234V44H160Z" fill="#1a4a88"/>`;
    q += `<rect x="52" y="70" width="36" height="52" rx="18" fill="#ffd873" opacity=".85"/><rect x="-60" y="130" width="14" height="24" rx="7" fill="#ffd873" opacity=".7"/><rect x="190" y="110" width="14" height="24" rx="7" fill="#ffd873" opacity=".7"/></g>`; return q; };
  s += ruin(640, 360, 1.7, .5) + ruin(1060, 420, 1.2, .38) + ruin(300, 440, .9, .3);
  s += `<ellipse cx="740" cy="560" rx="420" ry="40" fill="#07163a" opacity=".5" filter="url(#soft)"/>`;
  // a great jellyfish on the right
  const jx = 1230, jy = 300; s += `<g opacity=".85"><ellipse cx="${jx}" cy="${jy}" rx="150" ry="110" fill="#7fe0ff" opacity=".28" filter="url(#soft)"/>`;
  s += `<path d="M${jx - 130} ${jy + 30}C${jx - 130} ${jy - 120} ${jx + 130} ${jy - 120} ${jx + 130} ${jy + 30}C${jx + 80} ${jy + 10} ${jx + 40} ${jy + 40} ${jx} ${jy + 24}C${jx - 40} ${jy + 40} ${jx - 80} ${jy + 10} ${jx - 130} ${jy + 30}Z" fill="#a8ecff" stroke="${INK}" stroke-width="5" opacity=".8"/>`;
  for (let i = 0; i < 7; i++) { const x = jx - 100 + i * 33; s += `<path d="${taper([[x, jy + 30], [x + (r() - .5) * 60, jy + 120], [x + (r() - .5) * 70, jy + 220], [x + (r() - .5) * 40, jy + 300]], 10, 7, 2)}" fill="#bff3ff" opacity=".6"/>`; }
  s += `<ellipse cx="${jx - 30}" cy="${jy - 50}" rx="60" ry="26" fill="#fff" opacity=".4" filter="url(#soft2)"/></g>`;
  // the sea floor
  s += `<path d="M0 ${H - 190}Q${W * .2} ${H - 250} ${W * .42} ${H - 200}T${W * .8} ${H - 210}T${W} ${H - 180}V${H}H0Z" fill="#071c3e" stroke="${INK}" stroke-width="5"/>`;
  s += `<path d="M0 ${H - 130}Q${W * .3} ${H - 170} ${W * .55} ${H - 125}T${W} ${H - 140}V${H}H0Z" fill="#05142e"/>`;
  for (let i = 0; i < 40; i++) { const x = r() * W, y = H - 140 + r() * 130, rr = 2 + r() * 4; s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="#3a6fb0" opacity="${f(.2 + r() * .3)}"/>`; }
  // props from the painted set (when available)
  const prop = (id, x, y, w, rot) => imgs[id] ? `<image href="${imgs[id]}" x="${f(x)}" y="${f(y)}" width="${w}" height="${w}" transform="rotate(${rot || 0} ${f(x + w / 2)} ${f(y + w / 2)})"/>` : '';
  s += prop('emb2', 40, H - 470, 380) + prop('emb0', 1150, H - 380, 360, 4) + prop('emb3', 520, H - 220, 200, -14) + prop('emb1', 1010, H - 250, 220, 6) + prop('emb2', 1380, H - 420, 260, -8);
  // the lantern: a big warm glow in the middle-bottom with the lure image
  s += `<circle cx="800" cy="${H - 300}" r="360" fill="url(#ttl)" opacity=".7"/>` + prop('emb4', 600, H - 560, 420, 0);
  // bubbles
  for (let i = 0; i < 60; i++) { const x = r() * W, y = r() * H, rr = 2 + r() * 8; s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(rr)}" fill="none" stroke="#d8f4ff" stroke-width="${f(1 + rr * .1)}" opacity="${f(.15 + r() * .35)}"/>`; }
  s += `<rect width="${W}" height="${H}" fill="url(#ttv)"/>`;
  return s;
}
module.exports = { table, diver, title, DIV };

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
// ---- elderheart ----
const TREE_SLOTS = [{ season: 'winter', x: .20, y: .79 }, { season: 'spring', x: .17, y: .34 }, { season: 'summer', x: .50, y: .09 }, { season: 'autumn', x: .83, y: .34 }];
function elderheartInner(cur) {
  const r = rng('elderheart'); let s = '';
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

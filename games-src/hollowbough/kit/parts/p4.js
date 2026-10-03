// ---------- art registry + card ----------
const CRIT_KEYS = Object.keys(CRIT), CONS_KEYS = Object.keys(CONS);
const ART_KEYS = CRIT_KEYS.concat(CONS_KEYS);
const artCache = {};
function artInner(key) {
  if (artCache[key]) return artCache[key];
  let body;
  try { body = CRIT[key] ? critter(key) : CONS[key] ? construction(key) : scene('meadow', key) + `<text x="50" y="36" text-anchor="middle" font-size="8" fill="${INK}" stroke="none">${esc(key)}</text>`; } catch (e) { body = scene('meadow', key); if (root.console) console.warn('HBKit art', key, e); }
  return artCache[key] = `<g stroke="${INK}" stroke-width=".55" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;
}
const iconAt = (k, x, y, sc) => `<g transform="translate(${f1(x)} ${f1(y)}) scale(${sc}) translate(-10 -10)">${ICON[k]()}</g>`;
const leafPath = 'M0 -17 C13 -13 17 -1 8 12 C4 16 -1 17 -3 17 C-12 12 -16 -2 -9 -12 C-6 -15 -3 -16 0 -17Z';
const shieldPath = 'M-14 -15 H14 V2 C14 10 7 15 0 18 C-7 15 -14 10 -14 2Z';
function badge(x, y, sc, pts, isCrit, fs) {
  return `<g transform="translate(${x} ${y}) scale(${sc})"><g filter="url(#hb-shadow)">${isCrit ? `<path d="${leafPath}" fill="#f4e2a0" stroke="${INK}" stroke-width="1.3"/><path d="M0 -15 C-1 -4 -1 6 -3 16" stroke="#b79a4a" stroke-width=".8" fill="none"/>` : `<path d="${shieldPath}" fill="#f4e2a0" stroke="${INK}" stroke-width="1.3"/><path d="M-11 -12 H11" stroke="#b79a4a" stroke-width=".8"/>`}</g><text x="0" y="${fs * .36}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="${fs}" fill="${INK}">${pts}</text></g>`;
}
function costPills(cost, x, y, big, horizontal) {
  const ks = ['twig', 'resin', 'pebble', 'berry'].filter(k => cost && cost[k] > 0); let s = '';
  ks.forEach((k, i) => {
    const px = horizontal ? x + i * big * 2.15 : x, py = horizontal ? y : y + i * big * 2.1, n = cost[k];
    s += `<g filter="url(#hb-shadow)"><circle cx="${f1(px)}" cy="${f1(py)}" r="${big}" fill="#fbf4e2" stroke="${INK}" stroke-width="1"/></g>` + iconAt(k, px, py, big / 11.5);
    if (n > 1) s += `<circle cx="${f1(px + big * .72)}" cy="${f1(py + big * .72)}" r="${f1(big * .46)}" fill="${INK}"/><text x="${f1(px + big * .72)}" y="${f1(py + big * .72 + big * .18)}" text-anchor="middle" font-family="${FONT}" font-weight="700" font-size="${f1(big * .62)}" fill="#fff">${n}</text>`;
  });
  return s;
}
function cardString(spec, layout) {
  const T = TYPES[spec.type] || TYPES.traveler, isCrit = (spec.kind || (CRIT[spec.art] ? 'critter' : 'construction')) === 'critter';
  const uniq = !!spec.unique, name = String(spec.name || spec.art || ''), pts = spec.points == null ? 0 : spec.points;
  const art = artInner(spec.art);
  const L = layout === 's';
  const W = L ? 128 : 260, H = L ? 180 : 364;
  let s = `<svg xmlns="${NS}" viewBox="0 0 ${W} ${H}" font-family="${FONT}" data-art="${esc(spec.art)}" data-type="${esc(spec.type)}">`;
  // paper + frame
  s += `<g filter="url(#hb-shadow)"><rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="${L ? 9 : 15}" fill="${PAPER}" stroke="${INK}" stroke-width="${L ? 2 : 2.4}"/></g>`;
  if (!L) s += `<rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="15" filter="url(#hb-paper)" opacity=".5"/><rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="15" fill="${T.t}" fill-opacity=".18"/>`;
  s += `<rect x="${L ? 5 : 7}" y="${L ? 5 : 7}" width="${W - (L ? 10 : 14)}" height="${H - (L ? 10 : 14)}" rx="${L ? 6 : 10}" fill="none" stroke="${T.c}" stroke-width="${L ? 1.4 : 1.6}" stroke-opacity=".7"/>`;
  // title band
  const bx = L ? 8 : 12, by = L ? 8 : 12, bw = W - 2 * bx, bh = L ? 22 : 32;
  s += `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${L ? 5 : 8}" fill="${T.t}" stroke="${INK}" stroke-width="1.2"/><rect x="${bx}" y="${by + bh - (L ? 4 : 5)}" width="${bw}" height="${L ? 4 : 5}" fill="${T.c}" fill-opacity=".85"/>`;
  const maxW = bw - (L ? 8 : 20), fsT = Math.min(L ? 15 : 20, maxW / (name.length * (L ? .62 : .54)));
  s += `<text x="${W / 2}" y="${by + bh * (L ? .62 : .64)}" text-anchor="middle" font-size="${f1(fsT)}" font-weight="700" fill="${INK}">${esc(name)}</text>`;
  // art window
  const ax = L ? 8 : 12, ay = L ? 34 : 50, aw = W - 2 * ax, ah = L ? 90 : 142;
  s += `<svg x="${ax}" y="${ay}" width="${aw}" height="${ah}" viewBox="0 0 100 62" preserveAspectRatio="xMidYMid slice" overflow="hidden"><g filter="url(#${L ? 'hb-wcl' : 'hb-wc'})">${art}</g></svg>`;
  s += `<rect x="${ax}" y="${ay}" width="${aw}" height="${ah}" rx="3" fill="none" stroke="${INK}" stroke-width="1.6"/><rect x="${ax + 2}" y="${ay + 2}" width="${aw - 4}" height="${ah - 4}" rx="2" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1"/>`;
  if (L) {
    s += costPills(spec.cost, 20, 140, 9.5, true) + badge(104, 141, .8, pts, isCrit, 17);
    s += `<rect x="8" y="160" width="112" height="13" rx="4" fill="${T.c}" stroke="${INK}" stroke-width="1"/><text x="64" y="170" text-anchor="middle" font-size="9.5" font-weight="700" letter-spacing=".8" fill="#fffaf0">${T.label.toUpperCase()}</text>`;
    const glyph = isCrit ? `<g transform="translate(17 166.5)" fill="#fffaf0" stroke="${INK}" stroke-width=".5"><ellipse cx="0" cy="1.4" rx="2.4" ry="2"/><circle cx="-3" cy="-1" r="1"/><circle cx="-1" cy="-2.6" r="1"/><circle cx="1" cy="-2.6" r="1"/><circle cx="3" cy="-1" r="1"/></g>` : `<path transform="translate(17 166.5)" d="M-4 .6 L0 -3.6 L4 .6 L3 .6 V4 H-3 V.6Z" fill="#fffaf0" stroke="${INK}" stroke-width=".6" stroke-linejoin="round"/>`;
    s += glyph + (uniq ? `<path transform="translate(111 166.5) scale(1)" d="M0 -4.2 L1.2 -1.2 L4.2 -1 L1.9 1 L2.6 4 L0 2.4 L-2.6 4 L-1.9 1 L-4.2 -1 L-1.2 -1.2Z" fill="#f4d25a" stroke="${INK}" stroke-width=".5"/>` : `<circle cx="111" cy="166.5" r="2.6" fill="#cfe3b8" stroke="${INK}" stroke-width=".5"/>`);
  } else {
    // left cost column
    s += costPills(spec.cost, 30, ay + 22, 13, false);
    s += badge(W - 34, ay + 24, 1.15, pts, isCrit, 20);
    // marker strip
    const my = ay + ah + 6;
    s += `<g transform="translate(14 ${my})"><rect width="112" height="22" rx="11" fill="${T.t}" stroke="${INK}" stroke-width="1"/>${isCrit
      ? `<g transform="translate(13 11)" stroke="${INK}" stroke-width=".8" fill="${INK}"><ellipse cx="0" cy="2" rx="3.4" ry="2.8"/><circle cx="-4.4" cy="-1.4" r="1.4"/><circle cx="-1.6" cy="-3.6" r="1.4"/><circle cx="1.6" cy="-3.6" r="1.4"/><circle cx="4.4" cy="-1.4" r="1.4"/></g>`
      : `<g transform="translate(13 11)" stroke="${INK}" stroke-width="1.1" fill="${INK}" stroke-linejoin="round"><path d="M-6 1 L0 -5 L6 1 L4.5 1 V6 H-4.5 V1Z" fill="#fbf4e2"/></g>`}<text x="66" y="15.5" text-anchor="middle" font-size="12" font-weight="700" fill="${INK}">${isCrit ? 'Critter' : 'Construction'}</text></g>`;
    s += `<g transform="translate(${W - 126} ${my})"><rect width="112" height="22" rx="11" fill="${uniq ? '#f4e2a0' : '#fbf4e2'}" stroke="${INK}" stroke-width="1"/>${uniq
      ? `<path transform="translate(14 11) scale(1.5)" d="M0 -5 L1.5 -1.5 L5 -1.2 L2.3 1.2 L3.1 4.8 L0 2.8 L-3.1 4.8 L-2.3 1.2 L-5 -1.2 L-1.5 -1.5Z" fill="#e0a820" stroke="${INK}" stroke-width=".7"/>`
      : `<circle cx="14" cy="11" r="4.2" fill="#9ab88a" stroke="${INK}" stroke-width=".9"/>`}<text x="66" y="15.5" text-anchor="middle" font-size="12" font-weight="700" fill="${INK}">${uniq ? 'Unique' : 'Common'}</text></g>`;
    // text box
    const ty = my + 28, th = H - 26 - ty - 4;
    s += `<rect x="12" y="${ty}" width="${W - 24}" height="${th}" rx="8" fill="${PAPER2}" fill-opacity=".7" stroke="${INK}" stroke-opacity=".55" stroke-width="1"/>`;
    const lines = wrap(spec.text || '', 33), lh = 16.6, fs = 13.5, y0 = ty + th / 2 - (lines.length - 1) * lh / 2 + fs * .34;
    s += `<text font-size="${fs}" fill="${INK}" text-anchor="middle">${lines.map((l, i) => `<tspan x="${W / 2}" y="${f1(y0 + i * lh)}">${esc(l)}</tspan>`).join('')}</text>`;
    // bottom type band
    s += `<rect x="12" y="${H - 26}" width="${W - 24}" height="18" rx="6" fill="${T.c}" stroke="${INK}" stroke-width="1.1"/><text x="${W / 2}" y="${H - 13}" text-anchor="middle" font-size="12" font-weight="700" letter-spacing="1.6" fill="#fffaf0">${T.label.toUpperCase()}</text>`;
    s += `<path d="M44 ${H - 17} h14 M${W - 44} ${H - 17} h-14" stroke="#fffaf0" stroke-width="1" stroke-opacity=".7"/>`;
  }
  return s + '</svg>';
}

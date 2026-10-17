/* p4: rule icons (coaster badges), round markers, score pad */
(function (root) {
'use strict';
const K = root.__KK, { INK, CREAM, FONT, TYPES, f1, esc, mix, lighten, darken, dot, star, L } = K;

const GOLD = '#f2b92c', SILVER = '#cfd6dc', BRONZE = '#d78a4a', GREEN = '#3f9a4a', RED = '#d9453a';
const plateG = (x, y, r, c) => `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${c}" stroke="${INK}" stroke-width="1.3"/><circle r="${f1(r * .6)}" fill="${lighten(c, .45)}" stroke="${darken(c, .3)}" stroke-width=".7"/><circle r="${r}" fill="url(#kk-lit)"/></g>`;
const crown = (x, y, k, c) => `<path transform="translate(${x} ${y}) scale(${k})" d="M-9 4L-10 -7L-4.5 -2L0 -9L4.5 -2L10 -7L9 4Z" fill="${c}" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>`;
const arrow = (d, hx, hy, rot, c) => `<path d="${d}" fill="none" stroke="${c || INK}" stroke-width="2.6" stroke-linecap="round"/><path d="M-3.4 -3.4L3.6 0L-3.4 3.4Z" fill="${c || INK}" stroke="${c || INK}" stroke-width="1" stroke-linejoin="round" transform="translate(${hx} ${hy}) rotate(${rot})"/>`;
const cupG = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-8 -3L8 -3L6 9Q0 11 -6 9Z" fill="#ffdf86" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/><path d="M-8.5 -4Q-9 0 -6 1Q-4 4 -1 1Q2 0 4 2Q8 1 8.5 -4Q0 -8 -8.5 -4Z" fill="#b4601c" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/><path d="M-4 -6L4 -6L3.4 -10Q0 -12 -3.4 -10Z" fill="#fffdf6" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/></g>`;

// body drawn in a ~ +-14 box
function iconBody(name, T) {
  const c = T ? T.c : '#e5553a';
  switch (name) {
    case 'pair': return plateG(-6.6, 4, 6.2, c) + plateG(6.6, 4, 6.2, c) + L('M-11 -5Q0 -13 11 -5', INK, 2.2) + star(0, -10.5, 3.2, GOLD);
    case 'set': return plateG(0, -6, 5.6, c) + plateG(-7.4, 6, 5.6, c) + plateG(7.4, 6, 5.6, c) + star(11, -11, 3, GOLD);
    case 'ladder': { let s = ''; const hs = [4, 7.5, 11, 15, 19]; for (let i = 0; i < 5; i++) { const x = -12.6 + i * 5.4; s += `<rect x="${f1(x)}" y="${f1(11 - hs[i])}" width="4.4" height="${hs[i]}" rx="1" fill="${mix(lighten(c, .6), c, i / 4)}" stroke="${INK}" stroke-width="1.1"/>`; } return s; }
    case 'most': return `<rect x="-13" y="2" width="8" height="9" fill="${SILVER}" stroke="${INK}" stroke-width="1.2"/><rect x="-5" y="-3" width="10" height="14" fill="${GOLD}" stroke="${INK}" stroke-width="1.2"/><rect x="5" y="5" width="8" height="6" fill="${BRONZE}" stroke="${INK}" stroke-width="1.2"/>` + crown(0, -8, .62, '#ffe27a');
    case 'second': return `<rect x="-13" y="-3" width="10" height="14" fill="${SILVER}" stroke="${INK}" stroke-width="1.2"/><rect x="-3" y="-8" width="10" height="19" fill="${GOLD}" stroke="${INK}" stroke-width="1.2" opacity=".5"/><rect x="7" y="5" width="6" height="6" fill="${BRONZE}" stroke="${INK}" stroke-width="1.2"/>` + crown(-8, -9, .5, SILVER);
    case 'v1': case 'v2': case 'v3': return `<text x="0" y="8.6" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="25" fill="${INK}">${name[1]}</text>`;
    case 'x3': return `<path d="M-1 12Q-13 6 -9 -4Q-8 -9 -3 -13Q-3 -7 1 -8Q0 -3 4 -5Q12 2 7 9Q5 12 -1 12Z" fill="#ff9a2e" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/><path d="M-9 -6l7 7M-2 -6l-7 7" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" transform="translate(-2.4 6) scale(.78)"/><text x="4.4" y="9.8" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="21" fill="${INK}">3</text>`;
    case 'swap': return arrow('M-10 -1Q-9 -9 1 -9L5 -9', 6.4, -9, 0, INK) + arrow('M10 1Q9 9 -1 9L-5 9', -6.4, 9, 180, INK) + `<rect x="-12.5" y="-3" width="6" height="8.5" rx="1.2" fill="${c}" stroke="${INK}" stroke-width="1.1" transform="rotate(-8 -9 1)"/><rect x="6.5" y="-5.5" width="6" height="8.5" rx="1.2" fill="${lighten(c, .5)}" stroke="${INK}" stroke-width="1.1" transform="rotate(8 9 -1)"/>`;
    case 'dessert': return cupG(0, 2, 1.05) + `<path d="M-12 -8h6M-9 -11v6" stroke="${GREEN}" stroke-width="2.6" stroke-linecap="round"/><path d="M6 -8h6" stroke="${RED}" stroke-width="2.6" stroke-linecap="round"/>`;
    case 'most6': return cupG(0, 4, .95) + `<path d="M0 -13L-5 -7H5Z" fill="${GREEN}" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/>`;
    case 'fewest6': return cupG(0, 0, .95) + `<path d="M0 13L-5 7H5Z" fill="${RED}" stroke="${INK}" stroke-width="1.1" stroke-linejoin="round"/>`;
    case 'crown': return crown(0, 2, 1.25, GOLD);
    case 'coin': return `<circle r="11" fill="${GOLD}" stroke="${INK}" stroke-width="1.5"/><circle r="7.5" fill="none" stroke="#b98a12" stroke-width="1.4"/><text x="0" y="5.2" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="14" fill="#8a6208">1</text><circle r="11" fill="url(#kk-lit)"/>`;
    case 'star': return star(0, 0, 13, GOLD).replace('/>', ` stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/>`);
    case 'check': return `<path d="M-9 1L-3 7L9 -7" fill="none" stroke="${GREEN}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  return '';
}
K.iconBody = iconBody;
const ICON_NAMES = ['pair', 'set', 'ladder', 'most', 'second', 'v1', 'v2', 'v3', 'x3', 'swap', 'dessert', 'most6', 'fewest6', 'crown', 'coin', 'star', 'check'];
const ICON_LABEL = { pair: 'Pair', set: 'Set of 3', ladder: 'Ladder 1-3-6-10-15', most: 'Most / second most', second: 'Second most', v1: '1 point', v2: '2 points', v3: '3 points', x3: 'Triple', swap: 'Swap', dessert: 'End of game most / fewest', most6: 'Most: +6', fewest6: 'Fewest: -6', crown: 'Crown', coin: 'Points', star: 'Star', check: 'Done' };

// standalone coaster icon: iconSVG(name, {size:32, c:'#hex', standalone})
function iconSVG(name, o) {
  o = o || {}; const sz = o.size || 32, T = o.type ? TYPES[o.type] : (o.c ? { c: o.c } : null);
  const ringC = T ? T.c : '#e5553a';
  let s = `<svg xmlns="http://www.w3.org/2000/svg" class="kk-icon kk-i-${name}" width="${sz}" height="${sz}" viewBox="-21 -21 42 42" role="img" aria-label="${esc(ICON_LABEL[name] || name)}">`;
  if (o.standalone) s += K.defs();
  if (o.bare) s += `<g>${iconBody(name, T)}</g>`;
  else s += `<circle cx="1" cy="1.8" r="19" fill="#2a120c" opacity=".26"/><circle r="19" fill="#fffaf0" stroke="${INK}" stroke-width="1.8"/><circle r="15.6" fill="none" stroke="${ringC}" stroke-width="2.6"/><g>${iconBody(name, T)}</g>`;
  return s + '</svg>';
}

// ---------------------------------------------------------------- round markers: 3 lanterns / coasters  (state: done|current|todo)
function roundMarkerSVG(n, state, o) {
  o = o || {}; const sz = o.size || 40; state = state || 'todo';
  const c = state === 'todo' ? '#cdbd9c' : state === 'done' ? '#3f9a4a' : '#e5553a';
  let s = `<svg xmlns="http://www.w3.org/2000/svg" class="kk-round kk-r-${state}" width="${sz}" height="${sz}" viewBox="-21 -21 42 42" role="img" aria-label="Round ${n}: ${state}">`;
  if (o.standalone) s += K.defs();
  if (state === 'current') s += `<circle r="20.5" fill="url(#kk-glow)"/>`;
  s += `<circle cx="1" cy="1.8" r="17" fill="#2a120c" opacity=".28"/><circle r="17" fill="${c}" stroke="${INK}" stroke-width="1.8"/><circle r="17" fill="url(#kk-lit)"/><circle r="12.6" fill="#fffaf0" stroke="${INK}" stroke-width="1.2"/>`;
  if (state === 'done') s += `<path d="M-6.5 .5L-2 5L7 -5.5" fill="none" stroke="#3f9a4a" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  else s += `<text x="0" y="6.2" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="17" fill="${state === 'todo' ? '#9c8a68' : INK}">${n}</text>`;
  return s + '</svg>';
}
function roundTrackSVG(cur, o) {
  o = o || {}; const total = o.total || 3, sz = o.size || 40, gap = Math.round(sz * .2), W = total * sz + (total - 1) * gap;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" class="kk-roundtrack" width="${W}" height="${sz}" viewBox="0 0 ${W} ${sz}" role="img" aria-label="Round ${cur} of ${total}">`;
  if (o.standalone) s += K.defs();
  s += `<path d="M${sz / 2} ${sz / 2}H${W - sz / 2}" stroke="#8a5a2c" stroke-width="3" stroke-dasharray="2 5" stroke-linecap="round" opacity=".6"/>`;
  for (let i = 1; i <= total; i++) { const st = i < cur ? 'done' : i === cur ? 'current' : 'todo'; s += `<g transform="translate(${(i - 1) * (sz + gap)} 0)">${roundMarkerSVG(i, st, { size: sz }).replace(/^<svg[^>]*>/, `<svg width="${sz}" height="${sz}" viewBox="-21 -21 42 42">`)}</g>`; }
  return s + '</svg>';
}

// ---------------------------------------------------------------- score pad (order slip): rows = [{name, i, rounds:[a,b,c], dessert, total, you}]
function scorePadSVG(o) {
  o = o || {}; const rows = o.rows || [], w = o.w || 360, rh = Math.max(34, o.rowH || 36), fs = 14, head = 54, foot = 12;
  const H = head + rows.length * rh + foot + (o.title === false ? -20 : 0);
  const cols = ['R1', 'R2', 'R3', 'Custard', 'Total'];
  const nameW = w * .30, cw = (w - nameW - 20) / 5, cur = o.round || 0;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" class="kk-pad" width="${w}" height="${H}" viewBox="0 0 ${w} ${H}" role="img" aria-label="Score pad">`;
  if (o.standalone) s += K.defs();
  s += `<rect x="3" y="5" width="${w - 6}" height="${H - 6}" rx="7" fill="#2a120c" opacity=".3"/>`;
  s += `<path d="M2 12Q2 3 11 3H${w - 11}Q${w - 2} 3 ${w - 2} 12V${H - 8}Q${w - 2} ${H - 2} ${w - 11} ${H - 2}H11Q2 ${H - 2} 2 ${H - 8}Z" fill="#fffaf0" stroke="${INK}" stroke-width="1.7"/>`;
  // perforation + clip header
  s += `<rect x="0" y="0" width="${w}" height="16" rx="6" fill="#e5553a" stroke="${INK}" stroke-width="1.6"/><path d="M8 11H${w - 8}" stroke="#fff" stroke-opacity=".5" stroke-dasharray="2 5" stroke-width="2"/>`;
  s += `<text x="12" y="${head - 10}" font-family="${FONT}" font-weight="900" font-size="15" fill="${INK}">${esc(o.title || 'Order slip')}</text>`;
  cols.forEach((cn, i) => { const x = nameW + 10 + i * cw + cw / 2; s += `<text x="${f1(x)}" y="${head - 10}" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="12.5" fill="${i < 3 && cur === i + 1 ? '#c9452e' : '#7a5a3a'}">${cn}</text>`; });
  s += `<path d="M10 ${head - 4}H${w - 10}" stroke="${INK}" stroke-width="1.4"/>`;
  rows.forEach((r, ri) => {
    const y = head + ri * rh, pc = K.PLAYERS[(r.i != null ? r.i : ri) % 5];
    if (r.you) s += `<rect x="6" y="${y + 1}" width="${w - 12}" height="${rh - 2}" rx="6" fill="${pc.t}" opacity=".75"/>`;
    s += `<g transform="translate(14 ${y + rh / 2})"><circle r="${f1(rh * .36)}" fill="${pc.c}" stroke="${INK}" stroke-width="1.4"/></g>`;
    s += `<text x="${14 + rh * .36 + 8}" y="${y + rh / 2 + 5}" font-family="${FONT}" font-weight="800" font-size="${fs}" fill="${INK}" textLength="${f1(Math.min(nameW - rh * .36 - 18, (r.name || pc.name).length * fs * .6))}" lengthAdjust="spacingAndGlyphs">${esc(r.name || pc.name)}</text>`;
    const vals = [].concat(r.rounds || [], [null, null, null]).slice(0, 3).concat([r.dessert, r.total]);
    vals.forEach((v, i) => {
      const x = nameW + 10 + i * cw + cw / 2, last = i === 4;
      s += `<text x="${f1(x)}" y="${y + rh / 2 + 6}" text-anchor="middle" font-family="${FONT}" font-weight="${last ? 900 : 700}" font-size="${last ? 18 : fs + 1}" fill="${v == null ? '#c9b99a' : (v < 0 ? RED : INK)}">${v == null ? '-' : esc(v)}</text>`;
    });
    if (ri < rows.length - 1) s += `<path d="M10 ${y + rh}H${w - 10}" stroke="#cdbd9c" stroke-width="1" stroke-dasharray="3 4"/>`;
  });
  return s + '</svg>';
}

K.iconSVG = iconSVG; K.roundMarkerSVG = roundMarkerSVG; K.roundTrackSVG = roundTrackSVG; K.scorePadSVG = scorePadSVG; K.ICON_NAMES = ICON_NAMES; K.ICON_LABEL = ICON_LABEL;
})(typeof window !== 'undefined' ? window : globalThis);

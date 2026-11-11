/* p3: card frame (plate on a linen placemat + name chit + rule badge), card back, deck / discard piles */
(function (root) {
'use strict';
const K = root.__KK, { INK, CREAM, CREAM2, FONT, TYPES, f1, esc, mix, lighten, darken, rng } = K;
const doc = typeof document !== 'undefined' ? document : null;

const CAPS = { tempura: 'pair = 5', sashimi: 'set of 3 = 10', dumpling: '1 3 6 10 15', roll1: 'most 6 / 2nd 3', roll2: 'most 6 / 2nd 3', roll3: 'most 6 / 2nd 3', salmon: '2 points', squid: '3 points', egg: '1 point', wasabi: 'next nigiri x3', chop: 'swap for 2 cards', pudding: 'game end +6 / -6' };

function textLine(txt, x, y, fs, avail, col, weight) {
  const tl = Math.min(avail, txt.length * fs * 0.6);
  return `<text x="${f1(x)}" y="${f1(y)}" text-anchor="middle" font-family="${FONT}" font-weight="${weight || 800}" font-size="${f1(fs)}" fill="${col || INK}" textLength="${f1(tl)}" lengthAdjust="spacingAndGlyphs">${esc(txt)}</text>`;
}
// card geometry (px). Shared by cardSVG and the UI via KKKit.cardLayout(w)
function layout(w) {
  const H = Math.round(w * 1.4), fs = Math.max(13, Math.min(w * 0.115, 26));
  const full = TYPES.roll1.name.length * fs * 0.6 > w * 0.84;       // longest name does not fit on one line
  const lines = full ? 2 : 1, cap = w >= 170;
  const chH = lines * fs * 1.1 + fs * 0.6 + (cap ? fs * 0.95 : 0), pad = Math.max(2, w * 0.035);
  const y0 = H - chH - pad, yTop = pad * .8, yBot = y0 + chH * .22, D = Math.min(w * 0.94, yBot - yTop);
  return { w, H, fs, lines, cap, chH, pad, y0, D, cx: w / 2, cy: yTop + D / 2, rb: Math.max(12, w * 0.15) };
}

// --- rule badge: coaster with the rule icon (iconSVG body comes from p5 via K.iconBody)
function badge(type, cx, cy, r) {
  const T = TYPES[type];
  let s = `<g transform="translate(${f1(cx)} ${f1(cy)})"><circle cx="${f1(r * .08)}" cy="${f1(r * .14)}" r="${f1(r)}" fill="#2a120c" opacity=".28"/>`;
  s += `<circle r="${f1(r)}" fill="#fffaf0" stroke="${INK}" stroke-width="${f1(Math.max(1.1, r * .09))}"/><circle r="${f1(r * .82)}" fill="none" stroke="${T.c}" stroke-width="${f1(Math.max(1.2, r * .13))}"/>`;
  s += `<g transform="scale(${f1(r / 20)})">${K.iconBody ? K.iconBody(T.rule, T) : ''}</g></g>`;
  return s;
}

function cardSVG(type, o) {
  o = o || {};
  if (!TYPES[type]) type = 'tempura';
  const T = TYPES[type], w = o.w || 120, Ly = layout(w), H = Ly.H, id = o.id || '';
  const fx = o.fx || (w >= 170 ? 'full' : (w >= 52 ? 'lite' : 'none'));
  const k = Ly.D / 100, rx = w * 0.085;
  const matc = mix(CREAM, T.c, .10), matd = mix(CREAM2, T.c, .22);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" class="kk-card kk-t-${type}" width="${w}" height="${H}" viewBox="0 0 ${w} ${H}" role="img" aria-label="${esc(T.name)}: ${esc(T.ruleText)}"${o.cls ? ` data-c="${esc(o.cls)}"` : ''}>`;
  if (o.standalone) s += K.defs();
  // painted art (KKKit.setArt): the illustration replaces the vector plate; part:'mat'|'top' draws only the layers under / over it
  const ak = type === 'wasabi' && (o.on || o.variant === 'nigiri') ? 'wasabi-nigiri' : type, art = !o.vector && K.ART[ak];
  if (o.part !== 'top') {
  // shadow + mat
  s += `<rect x="${f1(w * .02)}" y="${f1(w * .035)}" width="${w - w * .02}" height="${H - w * .035}" rx="${f1(rx)}" fill="#2a120c" opacity=".25"/>`;
  s += `<rect x=".8" y=".8" width="${f1(w - 1.6)}" height="${f1(H - 1.6)}" rx="${f1(rx)}" fill="${matc}" stroke="${INK}" stroke-width="${f1(Math.max(1.2, w * .014))}"/>`;
  s += `<rect x=".8" y=".8" width="${f1(w - 1.6)}" height="${f1(H - 1.6)}" rx="${f1(rx)}" fill="url(#kk-weave)"/>`;
  s += `<rect x="${f1(w * .04)}" y="${f1(w * .04)}" width="${f1(w * .92)}" height="${f1(H - w * .08)}" rx="${f1(rx * .7)}" fill="none" stroke="${mix(T.c, '#ffffff', .1)}" stroke-width="${f1(Math.max(1, w * .011))}" stroke-dasharray="${f1(w * .03)} ${f1(w * .025)}" opacity=".6"/>`;
  s += `<path d="M${f1(rx)} ${f1(w * .018)}H${f1(w - rx)}" stroke="#fff" stroke-opacity=".55" stroke-width="1.2" stroke-linecap="round"/>`;
  }
  if (o.part === 'mat') return s + '</svg>';
  // plate + food
  if (!o.part) { if (art) { const D2 = Ly.D * 1.1; s += `<image href="${art}" x="${f1(Ly.cx - D2 / 2)}" y="${f1(Ly.cy - D2 / 2)}" width="${f1(D2)}" height="${f1(D2)}"/>`; }
  else s += `<g transform="translate(${f1(Ly.cx)} ${f1(Ly.cy)}) scale(${f1(k)})">${K.plateBase(type)}<g${fx === 'none' ? '' : ` filter="url(#kk-fx-${fx})"`}>${K.foodArt(type, o)}</g></g>`; }
  // name chit
  const cx0 = w * .075, cw = w - 2 * cx0, cr = Math.max(3, w * .035);
  s += `<g><rect x="${f1(cx0 + 1)}" y="${f1(Ly.y0 + 1.6)}" width="${f1(cw)}" height="${f1(Ly.chH)}" rx="${f1(cr)}" fill="#2a120c" opacity=".28"/>`;
  s += `<rect x="${f1(cx0)}" y="${f1(Ly.y0)}" width="${f1(cw)}" height="${f1(Ly.chH)}" rx="${f1(cr)}" fill="#fffaf0" stroke="${INK}" stroke-width="${f1(Math.max(1.1, w * .013))}"/>`;
  s += `<rect x="${f1(cx0 + 2)}" y="${f1(Ly.y0 + 2)}" width="${f1(cw - 4)}" height="${f1(Ly.chH - 4)}" rx="${f1(cr * .7)}" fill="none" stroke="${T.c}" stroke-width="1" opacity=".55"/>`;
  const fs = Ly.fs, avail = cw - fs * .7;
  let ty = Ly.y0 + fs * .3 + fs * .86;
  if (Ly.lines === 2) { s += textLine(T.l[0], w / 2, ty, fs, avail) + textLine(T.l[1], w / 2, ty + fs * 1.1, fs, avail); ty += fs * 1.1; }
  else s += textLine(T.name, w / 2, ty, fs, avail);
  if (Ly.cap) s += textLine(CAPS[type] || '', w / 2, ty + fs * .98, fs * .82, avail, darken(T.c, .55), 700);
  s += '</g>';
  // rule badge
  s += badge(type, Ly.rb + w * .012, Ly.rb + w * .012, Ly.rb);
  if (o.selected) s += `<rect x="-1" y="-1" width="${w + 2}" height="${H + 2}" rx="${f1(rx + 1)}" fill="none" stroke="#ffc83a" stroke-width="${f1(Math.max(3, w * .04))}"/>`;
  if (o.dim) s += `<rect x=".8" y=".8" width="${f1(w - 1.6)}" height="${f1(H - 1.6)}" rx="${f1(rx)}" fill="#2a120c" opacity=".38"/>`;
  return s + '</svg>';
}

// ---------------------------------------------------------------- card back: indigo lacquer, wave scales, steaming-plate medallion (no logo, no text)
function backSVG(o) {
  o = o || {};
  const w = o.w || 120, H = Math.round(w * 1.4), rx = w * .085, id = 'kk-sg' + (o.pid || '');
  const sc = Math.max(.6, w / 120);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" class="kk-back" width="${w}" height="${H}" viewBox="0 0 ${w} ${H}" role="img" aria-label="Card back">`;
  if (o.standalone) s += K.defs();
  const pw = 24 * sc, ph = 12 * sc;
  const arcs = (cx, cy) => [12, 9, 6, 3].map((r, i) => `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r * sc)}" fill="${i % 2 ? '#2f4f8a' : '#27407a'}" stroke="#7fa4e0" stroke-width="${f1(.9 * sc)}"/>`).join('');
  s += `<defs><pattern id="${id}" width="${f1(pw)}" height="${f1(ph)}" patternUnits="userSpaceOnUse"><rect width="${f1(pw)}" height="${f1(ph)}" fill="#223a6e"/>${arcs(0, ph)}${arcs(pw, ph)}${arcs(pw / 2, ph / 2)}${arcs(0, 0)}${arcs(pw, 0)}</pattern>` +
    `<radialGradient id="${id}-v" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#0d1a38" stop-opacity="0"/><stop offset="1" stop-color="#0d1a38" stop-opacity=".55"/></radialGradient></defs>`;
  s += `<rect x="${f1(w * .02)}" y="${f1(w * .035)}" width="${w - w * .02}" height="${H - w * .035}" rx="${f1(rx)}" fill="#2a120c" opacity=".25"/>`;
  s += `<rect x=".8" y=".8" width="${f1(w - 1.6)}" height="${f1(H - 1.6)}" rx="${f1(rx)}" fill="url(#${id})" stroke="${INK}" stroke-width="${f1(Math.max(1.2, w * .014))}"/>`;
  s += `<rect x=".8" y=".8" width="${f1(w - 1.6)}" height="${f1(H - 1.6)}" rx="${f1(rx)}" fill="url(#${id}-v)"/>`;
  if (K.ART.back && !o.vector) {   // painted back: the picture inside the ink border, rounded corners
    s += `<defs><clipPath id="${id}-c"><rect x="1.5" y="1.5" width="${f1(w - 3)}" height="${f1(H - 3)}" rx="${f1(rx - 1)}"/></clipPath></defs><image href="${K.ART.back}" x="0" y="0" width="${w}" height="${H}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id}-c)"/>`;
    s += `<rect x=".8" y=".8" width="${f1(w - 1.6)}" height="${f1(H - 1.6)}" rx="${f1(rx)}" fill="none" stroke="${INK}" stroke-width="${f1(Math.max(1.2, w * .014))}"/>`;
    return s + '</svg>';
  }
  // gold frame
  s += `<rect x="${f1(w * .055)}" y="${f1(w * .055)}" width="${f1(w * .89)}" height="${f1(H - w * .11)}" rx="${f1(rx * .6)}" fill="none" stroke="#f0cd7a" stroke-width="${f1(Math.max(1.2, w * .018))}"/>`;
  s += `<rect x="${f1(w * .085)}" y="${f1(w * .085)}" width="${f1(w * .83)}" height="${f1(H - w * .17)}" rx="${f1(rx * .45)}" fill="none" stroke="#f0cd7a" stroke-width="${f1(Math.max(.7, w * .007))}" stroke-opacity=".7"/>`;
  // medallion: plate with steam swirls
  const cx = w / 2, cy = H / 2, R = w * .30, m = R / 30;
  s += `<g transform="translate(${f1(cx)} ${f1(cy)}) scale(${f1(m)})">`;
  s += `<circle r="31.5" fill="#2a120c" opacity=".3" cx="1" cy="2"/><circle r="30" fill="#f6e6c4" stroke="${INK}" stroke-width="1.6"/><circle r="30" fill="url(#kk-lit)"/>`;
  s += `<circle r="24" fill="#e5553a" stroke="${INK}" stroke-width="1.2"/><circle r="24" fill="url(#kk-lit)"/><circle r="19" fill="#fbf0da" stroke="${INK}" stroke-width="1"/>`;
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.2832; s += `<circle cx="${f1(Math.sin(a) * 27)}" cy="${f1(-Math.cos(a) * 27)}" r="1.5" fill="#fbf0da"/>`; }
  s += `<path d="M-8 9Q-14 2 -7 -3Q0 -8 -6 -14" fill="none" stroke="#c9452e" stroke-width="2.4" stroke-linecap="round"/><path d="M1 11Q-5 4 2 -1Q9 -6 3 -12" fill="none" stroke="#e5553a" stroke-width="2.4" stroke-linecap="round"/><path d="M10 9Q4 2 11 -3Q17 -7 12 -12" fill="none" stroke="#f08a2e" stroke-width="2.4" stroke-linecap="round"/>`;
  s += '</g>';
  // corner dots
  [[.14, .1], [.86, .1], [.14, .9], [.86, .9]].forEach(p => s += `<circle cx="${f1(w * p[0])}" cy="${f1(H * p[1])}" r="${f1(Math.max(1.6, w * .02))}" fill="#f0cd7a"/>`);
  s += `<path d="M${f1(rx)} ${f1(w * .018)}H${f1(w - rx)}" stroke="#fff" stroke-opacity=".35" stroke-width="1.2" stroke-linecap="round"/>`;
  return s + '</svg>';
}

// ---------------------------------------------------------------- piles: deck (stack of backs + count) / discard (tilted faces + count)
function pileSVG(o) {
  o = o || {};
  const w = o.w || 100, H = Math.round(w * 1.4), n = o.count != null ? o.count : 0, kind = o.kind || 'deck';
  const layers = Math.min(6, Math.ceil(n / 12)) || 0, dx = Math.max(1, w * .018), pad = layers * dx + 4;
  const W = Math.round(w + pad + 6), HH = Math.round(H + pad + 6);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" class="kk-pile kk-${kind}" width="${W}" height="${HH}" viewBox="0 0 ${W} ${HH}" role="img" aria-label="${kind === 'deck' ? 'Deck' : 'Discard pile'}: ${n} cards">`;
  if (o.standalone) s += K.defs();
  const r = rng('pile' + n + kind);
  const inner = (svg) => svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  if (n <= 0) {
    s += `<g transform="translate(3 3)"><rect x="1" y="1" width="${w - 2}" height="${H - 2}" rx="${f1(w * .085)}" fill="#fbf0da" fill-opacity=".14" stroke="#fbf0da" stroke-opacity=".7" stroke-width="2" stroke-dasharray="7 6"/><circle cx="${f1(w / 2)}" cy="${f1(H / 2)}" r="${f1(w * .26)}" fill="none" stroke="#fbf0da" stroke-opacity=".7" stroke-width="2" stroke-dasharray="4 5"/></g>`;
  } else {
    for (let i = layers; i >= 1; i--) {
      const ox = 3 + i * dx, oy = 3 + i * dx * 1.1;
      if (kind === 'deck') s += `<g transform="translate(${f1(ox)} ${f1(oy)})"><rect x="1" y="1" width="${w - 2}" height="${H - 2}" rx="${f1(w * .085)}" fill="#1b2d58" stroke="${INK}" stroke-width="1.3"/><rect x="${f1(w * .055)}" y="${f1(w * .055)}" width="${f1(w * .89)}" height="${f1(H - w * .11)}" rx="${f1(w * .05)}" fill="none" stroke="#f0cd7a" stroke-width=".9" opacity=".6"/></g>`;
      else { const rot = (r() - .5) * 14; s += `<g transform="translate(${f1(ox)} ${f1(oy)}) rotate(${f1(rot)} ${f1(w / 2)} ${f1(H / 2)})"><rect x="1" y="1" width="${w - 2}" height="${H - 2}" rx="${f1(w * .085)}" fill="${mix(CREAM, K.TYPES[K.ORDER[Math.floor(r() * 12)]].c, .35)}" stroke="${INK}" stroke-width="1.3"/></g>`; }
    }
    s += `<g transform="translate(3 3)">`;
    if (kind === 'deck') s += inner(backSVG({ w, pid: 'p' + w }));
    else if (o.top) s += inner(cardSVG(o.top, { w, fx: o.fx }));
    else s += inner(backSVG({ w, pid: 'p' + w }));
    s += '</g>';
  }
  // count bubble
  const br = Math.max(12, w * .17), bx = W - br - 1, by = HH - br - 1, fz = Math.max(13, br * 1.05);
  s += `<g><circle cx="${f1(bx + 1)}" cy="${f1(by + 2)}" r="${f1(br)}" fill="#2a120c" opacity=".35"/><circle cx="${f1(bx)}" cy="${f1(by)}" r="${f1(br)}" fill="#fffaf0" stroke="${INK}" stroke-width="1.8"/><text x="${f1(bx)}" y="${f1(by + fz * .35)}" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="${f1(fz)}" fill="${INK}">${n}</text></g>`;
  return s + '</svg>';
}

K.cardLayout = layout; K.cardSVG = cardSVG; K.backSVG = backSVG; K.pileSVG = pileSVG; K.CAPS = CAPS; K.textLine = textLine;
})(typeof window !== 'undefined' ? window : globalThis);

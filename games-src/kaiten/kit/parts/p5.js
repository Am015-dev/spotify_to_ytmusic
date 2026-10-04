/* p5: scene pieces: conveyor belt (seamless scroll), wooden counter, diner table, cloche + reveal flourish, CSS */
(function (root) {
'use strict';
const K = root.__KK, { INK, CREAM, WOOD, WOOD_D, FONT, f1, esc, mix, lighten, darken, rng, PLAYERS } = K;
const doc = typeof document !== 'undefined' ? document : null;

// ---------------------------------------------------------------- conveyor belt segment: width = period px, tiles seamlessly in x
function beltSegmentSVG(o) {
  o = o || {}; const h = o.h || 72, P = o.period || 96, rail = Math.max(7, Math.round(h * .13));
  let s = `<svg xmlns="http://www.w3.org/2000/svg" class="kk-beltseg" width="${P}" height="${h}" viewBox="0 0 ${P} ${h}" preserveAspectRatio="none">`;
  if (o.standalone) s += K.defs();
  s += `<rect width="${P}" height="${h}" fill="url(#kk-beltg)"/>`;
  // slats: every P/4 a soft light edge + dark seam, repeating exactly at the tile edge
  const n = 4, sw = P / n;
  for (let i = 0; i <= n; i++) { const x = i * sw; s += `<rect x="${f1(x - 1.2)}" y="${rail}" width="2.4" height="${h - 2 * rail}" fill="#1c1412"/><rect x="${f1(x + 1.2)}" y="${rail}" width="1.4" height="${h - 2 * rail}" fill="#6a5750" opacity=".7"/>`; }
  // faint wear streaks
  const r = rng('belt' + P);
  for (let i = 0; i < 5; i++) { const x = r() * P, y = rail + 4 + r() * (h - 2 * rail - 8); s += `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(10 + r() * 14)}" height="1.2" rx=".6" fill="#fff" opacity=".07"/>`; }
  // chevrons on each slat (direction of travel: right -> left)
  for (let i = 0; i < n; i++) { const x = i * sw + sw / 2, y = h / 2, c = Math.min(8, h * .12); s += `<path d="M${f1(x + c * .6)} ${f1(y - c)}L${f1(x - c * .6)} ${f1(y)}L${f1(x + c * .6)} ${f1(y + c)}" fill="none" stroke="#8a756c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>`; }
  // steel rails with rivets
  const railG = (y, flip) => `<rect y="${y}" width="${P}" height="${rail}" fill="url(#kk-steel)"${flip ? ` transform="translate(0 ${2 * y + rail}) scale(1 -1)"` : ''}/><rect y="${flip ? y + rail - 1.2 : y}" width="${P}" height="1.2" fill="#fff" opacity=".5"/><rect y="${flip ? y : y + rail - 1.2}" width="${P}" height="1.2" fill="#2a120c" opacity=".45"/>`;
  s += railG(0, false) + railG(h - rail, true);
  for (let i = 0; i < n; i++) { const x = i * sw + sw / 2; s += `<circle cx="${f1(x)}" cy="${f1(rail / 2)}" r="1.5" fill="#7d6f55" stroke="#4a3f2c" stroke-width=".6"/><circle cx="${f1(x)}" cy="${f1(h - rail / 2)}" r="1.5" fill="#7d6f55" stroke="#4a3f2c" stroke-width=".6"/>`; }
  return s + '</svg>';
}
function dataURL(svg) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); }
// css: a div with this class scrolls the belt forever (respects prefers-reduced-motion)
function beltCSS(o) {
  o = o || {}; const h = o.h || 72, P = o.period || 96, sel = o.selector || '.kk-belt', t = o.seconds || 5;
  if (K.ART.belt && !o.vector) { const tw = Math.round(1024 * h / 128); return `${sel}{height:${h}px;background:url("${K.ART.belt}") repeat-x 0 0/${tw}px ${h}px;animation:kk-belt-${P} ${t * tw / P}s linear infinite}@keyframes kk-belt-${P}{to{background-position-x:-${tw}px}}@media (prefers-reduced-motion:reduce){${sel}{animation:none}}`; }
  const url = dataURL(beltSegmentSVG({ h, period: P, standalone: true }));
  return `${sel}{height:${h}px;background:url("${url}") repeat-x 0 0/${P}px ${h}px;animation:kk-belt-${P} ${t}s linear infinite}@keyframes kk-belt-${P}{to{background-position-x:-${P}px}}@media (prefers-reduced-motion:reduce){${sel}{animation:none}}`;
}
function beltEl(o) {
  if (!doc) return null; o = o || {}; const P = o.period || 96;
  const id = 'kk-beltstyle-' + (o.h || 72) + '-' + P; const cls = 'kk-belt-' + (o.h || 72) + '-' + P;
  if (!doc.getElementById(id)) { const st = doc.createElement('style'); st.id = id; st.textContent = beltCSS({ h: o.h, period: P, selector: '.' + cls, seconds: o.seconds }); doc.head.appendChild(st); }
  const d = doc.createElement('div'); d.className = 'kk-belt ' + cls; d.setAttribute('aria-hidden', 'true'); return d;
}

// ---------------------------------------------------------------- wooden diner counter (top surface + front lip). seat 0..4 tints a cloth runner
function counterSVG(o) {
  o = o || {}; const w = o.w || 360, h = o.h || 110, lip = Math.round(h * .17), top = h - lip, seat = o.seat, pc = seat != null ? PLAYERS[seat % 5] : null;
  const r = rng('counter' + w + 'x' + h + (o.variant || ''));
  let s = `<svg xmlns="http://www.w3.org/2000/svg" class="kk-counter" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="Diner counter${pc ? ' for ' + pc.name : ''}">`;
  if (o.standalone) s += K.defs();
  const planks = Math.max(2, Math.round(top / 38)), ph = top / planks;
  const cols = ['#b4743f', '#a96b3a', '#bb7c46', '#a2653a'];
  for (let i = 0; i < planks; i++) {
    const y = i * ph; s += `<rect x="0" y="${f1(y)}" width="${w}" height="${f1(ph + .6)}" fill="${cols[i % 4]}"/>`;
    for (let g = 0; g < 7; g++) { const gy = y + 4 + r() * (ph - 8), x0 = r() * w * .6, len = w * (.25 + r() * .4); s += `<path d="M${f1(x0)} ${f1(gy)}q${f1(len * .25)} ${f1((r() - .5) * 5)} ${f1(len * .5)} 0t${f1(len * .5)} 0" fill="none" stroke="#7a4524" stroke-opacity="${f1(.18 + r() * .2)}" stroke-width="${f1(.8 + r() * .8)}" stroke-linecap="round"/>`; }
    if (r() > .5) { const kx = r() * w, ky = y + ph * (.3 + r() * .4); s += `<ellipse cx="${f1(kx)}" cy="${f1(ky)}" rx="7" ry="3.2" fill="none" stroke="#7a4524" stroke-opacity=".3" stroke-width="1.2"/><ellipse cx="${f1(kx)}" cy="${f1(ky)}" rx="3" ry="1.4" fill="#7a4524" opacity=".25"/>`; }
    if (i) s += `<rect y="${f1(y - .6)}" width="${w}" height="1.8" fill="#5b3219" opacity=".55"/><rect y="${f1(y + 1.2)}" width="${w}" height="1" fill="#fff" opacity=".12"/>`;
  }
  s += `<rect width="${w}" height="${top}" fill="url(#kk-lit)" opacity=".5"/>`;
  s += `<rect width="${w}" height="${f1(top * .22)}" fill="#2a120c" opacity=".16"/>`;      // soft shadow from the belt above
  if (pc) {   // cloth runner in the seat colour
    const rx = w * .06, rw = w * .88, ry = top * .2, rh = top * .74;
    s += `<rect x="${f1(rx + 1.5)}" y="${f1(ry + 3)}" width="${f1(rw)}" height="${f1(rh)}" rx="6" fill="#2a120c" opacity=".22"/><rect x="${f1(rx)}" y="${f1(ry)}" width="${f1(rw)}" height="${f1(rh)}" rx="6" fill="${pc.c}" stroke="${INK}" stroke-width="1.4"/><rect x="${f1(rx)}" y="${f1(ry)}" width="${f1(rw)}" height="${f1(rh)}" rx="6" fill="url(#kk-weave)"/><rect x="${f1(rx + 4)}" y="${f1(ry + 4)}" width="${f1(rw - 8)}" height="${f1(rh - 8)}" rx="4" fill="none" stroke="#fff" stroke-opacity=".55" stroke-dasharray="5 4" stroke-width="1.3"/><rect x="${f1(rx)}" y="${f1(ry)}" width="${f1(rw)}" height="${f1(rh)}" rx="6" fill="url(#kk-lit)"/>`;
  }
  // front lip
  s += `<rect y="${top}" width="${w}" height="${lip}" fill="#7d4a27"/><rect y="${top}" width="${w}" height="${lip}" fill="url(#kk-lit)" opacity=".4"/><rect y="${top}" width="${w}" height="2.4" fill="#e0a468"/><rect y="${top + 2.4}" width="${w}" height="1.4" fill="#2a120c" opacity=".35"/><rect y="${h - 2}" width="${w}" height="2" fill="#2a120c" opacity=".4"/>`;
  return s + '</svg>';
}

// ---------------------------------------------------------------- diner table / wall background (tile + CSS gradients)
function tableTile(mood) {
  const night = mood === 'night', a = night ? '#3a231d' : '#efdcb8', b = night ? '#47291f' : '#e6cf9f', ln = night ? '#2a1712' : '#c9a86e';
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="${a}"/>`;
  // soft seigaiha-style scale lines, very low contrast
  for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) { const cx = x * 40 + (y % 2 ? 20 : 0), cy = y * 20 + 20; [16, 11, 6].forEach((r, i) => s += `<circle cx="${cx}" cy="${cy + 40}" r="${r}" fill="${i % 2 ? b : a}" stroke="${ln}" stroke-opacity=".2" stroke-width="1"/>`); }
  return s + '</svg>';
}
function tableCSS(mood) {
  const night = mood === 'night', url = dataURL(tableTile(mood));
  const glow = night ? 'radial-gradient(ellipse 70% 55% at 50% 0%,rgba(255,196,110,.30),rgba(255,196,110,0) 70%),radial-gradient(ellipse at 50% 120%,rgba(0,0,0,.45),rgba(0,0,0,0) 60%)' : 'radial-gradient(ellipse 70% 55% at 50% 0%,rgba(255,255,255,.55),rgba(255,255,255,0) 70%),radial-gradient(ellipse at 50% 120%,rgba(120,70,20,.28),rgba(120,70,20,0) 60%)';
  return `${glow},url("${url}")`;
}
function applyTable(el, mood) { if (!el || !el.style) return; el.style.background = tableCSS(mood) + ' 0 0/auto,120px 120px'; el.style.backgroundColor = mood === 'night' ? '#3a231d' : '#efdcb8'; }

// ---------------------------------------------------------------- cloche (dome lid), same aspect as a card (1 : 1.4)
function clocheSVG(o) {
  o = o || {}; const w = o.w || 100, H = Math.round(w * 1.4);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" class="kk-cloche-svg" width="${w}" height="${H}" viewBox="0 0 100 140" role="img" aria-label="Covered plate">`;
  if (o.standalone) s += K.defs();
  s += `<ellipse cx="52" cy="127" rx="46" ry="7" fill="#2a120c" opacity=".3"/>`;
  s += `<path d="M7 120C7 56 24 26 50 26C76 26 93 56 93 120Z" fill="url(#kk-metal)" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`;
  s += `<path d="M15 112C15 64 28 40 42 34" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55"/><path d="M20 112C21 80 28 58 36 48" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".5"/>`;
  s += `<path d="M7 120C7 56 24 26 50 26C76 26 93 56 93 120Z" fill="url(#kk-lit)"/>`;
  s += `<rect x="44" y="17" width="12" height="11" rx="2" fill="#bba67a" stroke="${INK}" stroke-width="1.8"/><circle cx="50" cy="12" r="8.5" fill="url(#kk-metal)" stroke="${INK}" stroke-width="2"/><circle cx="47" cy="9.5" r="2.2" fill="#fff" opacity=".8"/>`;
  s += `<ellipse cx="50" cy="121" rx="47" ry="8" fill="#d8c79c" stroke="${INK}" stroke-width="2"/><ellipse cx="50" cy="119.5" rx="44" ry="5.5" fill="#f4e8c4" opacity=".7"/>`;
  return s + '</svg>';
}

K.beltSegmentSVG = beltSegmentSVG; K.beltCSS = beltCSS; K.beltEl = beltEl; K.counterSVG = counterSVG; K.tableTile = tableTile; K.tableCSS = tableCSS; K.applyTable = applyTable; K.clocheSVG = clocheSVG; K.dataURL = dataURL;
})(typeof window !== 'undefined' ? window : globalThis);

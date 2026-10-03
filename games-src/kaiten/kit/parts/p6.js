/* p6: chef avatars + seats, public API (KKKit), CSS, DOM helpers, cloche reveal */
(function (root) {
'use strict';
const K = root.__KK, { INK, CREAM, FONT, TYPES, ORDER, PLAYERS, f1, esc, mix, lighten, darken } = K;
const doc = typeof document !== 'undefined' ? document : null;

// ---------------------------------------------------------------- five original chefs (diverse, friendly), 100x100 portrait in a round frame
const AV = [
  { name: 'Mina', skin: '#8a5a3c', mood: 'grin' }, { name: 'Taro', skin: '#efc8a0', mood: 'proud' },
  { name: 'Odile', skin: '#d39b6c', mood: 'smug' }, { name: 'Kofi', skin: '#5d3a28', mood: 'happy' }, { name: 'Pip', skin: '#f6d6bb', mood: 'wink' }
];
function avatarBody(i) {
  const a = AV[i % 5], sk = a.skin, skd = darken(sk, .18), sw = 2.1, ink = `stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"`;
  const lit = d => `<path d="${d}" fill="url(#kk-lit)"/>`;
  const shoulders = (col, extra) => `<path d="M8 104Q10 74 36 69L64 69Q90 74 92 104Z" fill="${col}" ${ink}/>` + lit('M8 104Q10 74 36 69L64 69Q90 74 92 104Z') + (extra || '');
  const neck = `<path d="M43 58L43 72Q50 78 57 72L57 58Z" fill="${skd}" ${ink}/>`;
  const head = `<ellipse cx="50" cy="44" rx="21" ry="23.5" fill="${sk}" ${ink}/>` + `<ellipse cx="50" cy="44" rx="21" ry="23.5" fill="url(#kk-lit)"/>`;
  const ears = `<circle cx="29.5" cy="47" r="4.6" fill="${sk}" ${ink}/><circle cx="70.5" cy="47" r="4.6" fill="${sk}" ${ink}/>`;
  const fc = K.face(a.mood, 50, 47, .8, sk);
  let s = '';
  if (i === 0) {   // Mina: big curly puff, yellow headband, red apron, gold hoops
    s += [[28, 28, 11], [40, 17, 12], [60, 17, 12], [72, 28, 11], [50, 13, 12], [22, 42, 8], [78, 42, 8]].map(c => `<circle cx="${c[0]}" cy="${c[1]}" r="${c[2]}" fill="#2b1a14" ${ink}/>`).join('');
    s += shoulders('#fffaf0', `<path d="M33 69L67 69L72 104L28 104Z" fill="#e5553a" ${ink}/>` + lit('M33 69L67 69L72 104L28 104Z') + `<path d="M38 69L36 82M62 69L64 82" stroke="${INK}" stroke-width="1.4" fill="none"/>`) + neck + ears + head;
    s += `<path d="M29 40Q50 14 71 40Q60 30 50 31Q40 30 29 40Z" fill="#2b1a14" ${ink}/><path d="M28.5 37.5Q50 24 71.5 37.5" fill="none" stroke="#f2b92c" stroke-width="6.5" stroke-linecap="round"/><path d="M28.5 37.5Q50 24 71.5 37.5" fill="none" stroke="${INK}" stroke-width=".9" opacity=".55" transform="translate(0 -3.2)"/>`;
    s += fc + `<circle cx="29" cy="54" r="2.4" fill="#f2b92c" stroke="${INK}" stroke-width="1"/><circle cx="71" cy="54" r="2.4" fill="#f2b92c" stroke="${INK}" stroke-width="1"/>`;
  } else if (i === 1) {   // Taro: spiky black hair, white headband with knot, teal chef jacket
    s += shoulders('#2a97a0', `<path d="M42 69L50 84L58 69" fill="#fffaf0" ${ink}/><circle cx="50" cy="88" r="1.7" fill="#fffaf0" stroke="${INK}" stroke-width="1"/><circle cx="50" cy="96" r="1.7" fill="#fffaf0" stroke="${INK}" stroke-width="1"/>`) + neck + ears + head;
    s += `<path d="M28 42Q26 18 50 16Q74 18 72 42Q66 30 50 30Q34 30 28 42Z" fill="#1f1a1c" ${ink}/><path d="M34 22L36 10L42 20M46 18L50 6L55 18M58 20L65 10L66 22" fill="#1f1a1c" ${ink}/>`;
    s += `<path d="M28.5 36Q50 26 71.5 36" fill="none" stroke="#fffaf0" stroke-width="6" stroke-linecap="round"/><path d="M28.5 33Q50 23 71.5 33M28.5 39Q50 29 71.5 39" fill="none" stroke="${INK}" stroke-width=".9" opacity=".5"/><path d="M71 36Q80 30 84 38M71 36Q82 40 82 48" fill="none" stroke="#fffaf0" stroke-width="4" stroke-linecap="round"/>`;
    s += fc + `<g fill="#3a2a22" opacity=".55"><circle cx="43" cy="63" r=".9"/><circle cx="47" cy="65" r=".9"/><circle cx="53" cy="65" r=".9"/><circle cx="57" cy="63" r=".9"/></g>`;
  } else if (i === 2) {   // Odile: grey bob, round tortoise glasses, mustard apron, red dotted scarf
    s += `<path d="M25 44Q22 12 50 12Q78 12 75 44L77 68Q68 68 66 58L34 58Q32 68 23 68Z" fill="#cfd0d8" ${ink}/>`;
    s += shoulders('#fffaf0', `<path d="M33 69L67 69L72 104L28 104Z" fill="#e0a31c" ${ink}/>` + lit('M33 69L67 69L72 104L28 104Z')) + neck + ears + head;
    s += `<path d="M42 71L50 84L58 71Q50 76 42 71Z" fill="#d9453a" ${ink}/><g fill="#fff"><circle cx="46" cy="73" r="1"/><circle cx="53" cy="74" r="1"/><circle cx="50" cy="79" r="1"/></g>`;
    s += `<path d="M28 40Q36 21 50 23Q64 21 72 40Q62 30 50 31Q38 30 28 40Z" fill="#cfd0d8" ${ink}/>`;
    s += fc + `<circle cx="41" cy="47" r="8.4" fill="#fff" fill-opacity=".22" stroke="#7a4a2a" stroke-width="2.3"/><circle cx="59" cy="47" r="8.4" fill="#fff" fill-opacity=".22" stroke="#7a4a2a" stroke-width="2.3"/><path d="M49.4 46Q50 44.6 50.6 46" fill="none" stroke="#7a4a2a" stroke-width="2.2"/><path d="M32.6 46L28 44M67.4 46L72 44" stroke="#7a4a2a" stroke-width="2" stroke-linecap="round"/>`;
  } else if (i === 3) {   // Kofi: tall chef toque (tilted), goatee, violet jacket, yellow neckerchief
    s += shoulders('#7a5ac8', `<path d="M42 69L50 84L58 69" fill="#fffaf0" ${ink}/><path d="M42 69Q50 76 58 69L55 79L50 83L45 79Z" fill="#f2b92c" ${ink}/>`) + neck + ears + head;
    s += `<path d="M29 38Q30 28 38 26L62 26Q70 28 71 38Q62 31 50 31Q38 31 29 38Z" fill="#1f1a1c" ${ink}/>`;
    s += `<g transform="rotate(-7 50 28)"><path d="M31 30L69 30L67 15L33 15Z" fill="#fffdf6" ${ink}/><path d="M32 16Q20 14 22 6Q24 -4 34 -1Q38 -10 50 -6Q62 -10 66 -1Q76 -4 78 6Q80 14 68 16Z" fill="#fffdf6" ${ink}/>` + lit('M32 16Q20 14 22 6Q24 -4 34 -1Q38 -10 50 -6Q62 -10 66 -1Q76 -4 78 6Q80 14 68 16Z') + `<path d="M42 17L42 29M58 17L58 29" stroke="#d9cdb4" stroke-width="1.3"/></g>`;
    s += fc + `<path d="M44 64Q50 73 56 64Q50 67 44 64Z" fill="#1f1a1c" stroke="${INK}" stroke-width="1" stroke-linejoin="round"/>`;
  } else {   // Pip: ginger braids, green newsboy cap, freckles, overalls
    s += `<path d="M26 44Q24 16 50 14Q76 16 74 44L74 56L26 56Z" fill="#d9622b" ${ink}/>`;
    s += [[22, 62], [20, 72], [22, 82]].map(c => `<circle cx="${c[0]}" cy="${c[1]}" r="5.5" fill="#d9622b" ${ink}/>`).join('') + [[78, 62], [80, 72], [78, 82]].map(c => `<circle cx="${c[0]}" cy="${c[1]}" r="5.5" fill="#d9622b" ${ink}/>`).join('') + `<circle cx="22" cy="88" r="3.4" fill="#5aa83c" ${ink}/><circle cx="78" cy="88" r="3.4" fill="#5aa83c" ${ink}/>`;
    s += shoulders('#fffaf0', `<path d="M36 69L64 69L68 104L32 104Z" fill="#4f7fc0" ${ink}/>` + lit('M36 69L64 69L68 104L32 104Z') + `<circle cx="40" cy="80" r="2" fill="#f2b92c" stroke="${INK}" stroke-width="1"/><circle cx="60" cy="80" r="2" fill="#f2b92c" stroke="${INK}" stroke-width="1"/>`) + neck + ears + head;
    s += `<path d="M29 40Q36 26 50 28Q64 26 71 40Q60 34 50 35Q40 34 29 40Z" fill="#d9622b" ${ink}/>`;
    s += `<path d="M26 36Q28 15 52 15Q74 16 75 36Q50 28 26 36Z" fill="#5aa83c" ${ink}/>` + lit('M26 36Q28 15 52 15Q74 16 75 36Q50 28 26 36Z') + `<path d="M24 36Q50 42 77 36L81 41Q50 49 21 41Z" fill="#3f8a28" ${ink}/><circle cx="51" cy="14" r="2.4" fill="#3f8a28" stroke="${INK}" stroke-width="1.2"/>`;
    s += fc + `<g fill="#c9784a" opacity=".85"><circle cx="38" cy="54" r="1"/><circle cx="42" cy="56" r="1"/><circle cx="35" cy="57" r="1"/><circle cx="62" cy="54" r="1"/><circle cx="58" cy="56" r="1"/><circle cx="65" cy="57" r="1"/></g>`;
  }
  return s;
}
function avatarSVG(i, o) {
  o = o || {}; const sz = o.size || 64, pc = PLAYERS[i % 5], uid = 'kk-avc' + (i % 5);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" class="kk-avatar" width="${sz}" height="${sz}" viewBox="0 0 100 100" role="img" aria-label="${esc(pc.name)}">`;
  if (o.standalone) s += K.defs();
  s += `<defs><clipPath id="${uid}"><circle cx="50" cy="50" r="46"/></clipPath><radialGradient id="${uid}b" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="${lighten(pc.t, .5)}"/><stop offset="1" stop-color="${pc.t}"/></radialGradient></defs>`;
  s += `<circle cx="51" cy="53" r="46" fill="#2a120c" opacity=".25"/><circle cx="50" cy="50" r="46" fill="url(#${uid}b)"/>`;
  const art = !o.vector && K.ART['chef-' + pc.name.toLowerCase()];
  s += art ? `<image href="${art}" x="2" y="2" width="96" height="96" clip-path="url(#${uid})"/>` : `<g clip-path="url(#${uid})">${avatarBody(i)}</g>`;
  s += `<circle cx="50" cy="50" r="46" fill="none" stroke="${pc.c}" stroke-width="${o.ring === false ? 0 : 6}"/><circle cx="50" cy="50" r="48.6" fill="none" stroke="${INK}" stroke-width="2.4"/><circle cx="50" cy="50" r="43.2" fill="none" stroke="${INK}" stroke-width="1.2" opacity=".6"/>`;
  return s + '</svg>';
}
// seat tag: avatar + name pill + card/score counters, glow when active
function seatSVG(i, o) {
  o = o || {}; const w = o.w || 150, av = Math.round(w * .38), h = av + 6, pc = PLAYERS[i % 5], fs = 14, name = o.name || pc.name;
  let s = `<svg xmlns="http://www.w3.org/2000/svg" class="kk-seat" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(name)}${o.score != null ? ', ' + o.score + ' points' : ''}">`;
  if (o.standalone) s += K.defs();
  const x0 = av * .55, fs2 = 16;
  if (o.active) s += `<rect x="0" y="2" width="${w}" height="${h - 4}" rx="${(h - 4) / 2}" fill="#ffd25a" opacity=".55"/><rect x="0" y="2" width="${w}" height="${h - 4}" rx="${(h - 4) / 2}" fill="none" stroke="#ffc83a" stroke-width="3"/>`;
  s += `<rect x="${f1(x0)}" y="${f1(h * .24)}" width="${f1(w - x0 - 2)}" height="${f1(h * .56)}" rx="${f1(h * .28)}" fill="${pc.c}" stroke="${INK}" stroke-width="1.8"/><rect x="${f1(x0)}" y="${f1(h * .24)}" width="${f1(w - x0 - 2)}" height="${f1(h * .56)}" rx="${f1(h * .28)}" fill="url(#kk-lit)"/>`;
  s += `<text x="${f1(av * 1.0 + 8)}" y="${f1(h * .53)}" font-family="${FONT}" font-weight="800" font-size="${fs2}" fill="#fff" stroke="${darken(pc.c, .5)}" stroke-width="3" paint-order="stroke" textLength="${f1(Math.min(name.length * fs2 * .6, w - av - 52))}" lengthAdjust="spacingAndGlyphs">${esc(name)}</text>`;
  if (o.score != null) s += `<g transform="translate(${f1(w - 22)} ${f1(h * .52)})"><circle r="14" fill="#fffaf0" stroke="${INK}" stroke-width="1.6"/><text y="5.4" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="${String(o.score).length > 2 ? 13 : 16}" fill="${INK}">${esc(o.score)}</text></g>`;
  s += `<g transform="translate(0 3)">${avatarSVG(i, { size: av }).replace(/^<svg[^>]*>/, `<svg width="${av}" height="${av}" viewBox="0 0 100 100">`)}</g>`;
  return s + '</svg>';
}

// bare plate + food (no frame): for belt plates / counter stacks.  d = diameter px
function plateSVG(type, o) {
  o = o || {}; const d = o.d || 64; if (!TYPES[type]) type = 'tempura';
  const fx = o.fx || (d >= 120 ? 'full' : d >= 48 ? 'lite' : 'none');
  const ak = type === 'wasabi' && (o.on || o.variant === 'nigiri') ? 'wasabi-nigiri' : type;
  if (K.ART[ak] && !o.vector) return `<svg xmlns="http://www.w3.org/2000/svg" class="kk-plate kk-t-${type}" width="${d}" height="${d}" viewBox="-52 -52 104 104" role="img" aria-label="${esc(TYPES[type].name)}"><image href="${K.ART[ak]}" x="-58" y="-58" width="116" height="116"/></svg>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" class="kk-plate kk-t-${type}" width="${d}" height="${d}" viewBox="-52 -52 104 104" role="img" aria-label="${esc(TYPES[type].name)}">${o.standalone ? K.defs() : ''}${K.plateBase(type)}<g${fx === 'none' ? '' : ` filter="url(#kk-fx-${fx})"`}>${K.foodArt(type, o)}</g></svg>`;
}

// ---------------------------------------------------------------- CSS (animations) + shared defs mount
const CSS = `.kk-card,.kk-back,.kk-pile,.kk-plate,.kk-icon,.kk-avatar,.kk-seat,.kk-counter,.kk-pad,.kk-cloche-svg{display:block;max-width:none}
@keyframes kk-glide{from{transform:translateX(var(--kk-from,110vw))}to{transform:translateX(var(--kk-to,-30vw))}}
@keyframes kk-deal{0%{opacity:0;transform:translate(var(--kk-dx,0px),var(--kk-dy,-40px)) rotate(-8deg) scale(.86)}70%{opacity:1;transform:translate(0,2px) rotate(1deg) scale(1.02)}100%{opacity:1;transform:none}}
@keyframes kk-land{0%{transform:translateY(-14px) scale(1.06)}60%{transform:translateY(1.5px) scale(.99)}100%{transform:none}}
@keyframes kk-steam{0%{opacity:0;transform:translateY(6px) scale(.6)}25%{opacity:.9}100%{opacity:0;transform:translateY(-34px) scale(1.25)}}
@keyframes kk-spark{0%{opacity:0;transform:scale(.2) rotate(0)}40%{opacity:1;transform:scale(1.15) rotate(40deg)}100%{opacity:0;transform:scale(.7) rotate(90deg)}}
@keyframes kk-lid{0%{transform:none;opacity:1}35%{transform:translateY(-14%) rotate(-3deg)}100%{transform:translateY(-62%) translateX(14%) rotate(14deg);opacity:0}}
.kk-deal{animation:kk-deal .42s cubic-bezier(.2,.8,.3,1) both}.kk-land{animation:kk-land .3s ease-out both}
.kk-cloche{position:absolute;inset:0;z-index:3;pointer-events:none}.kk-cloche>svg{width:100%;height:100%}.kk-cloche.kk-lift .kk-lidwrap{animation:kk-lid .62s cubic-bezier(.3,.7,.3,1) forwards}
.kk-fxp{position:absolute;pointer-events:none;z-index:4}
@media (prefers-reduced-motion:reduce){.kk-deal,.kk-land{animation:none}.kk-cloche.kk-lift .kk-lidwrap{animation:none;opacity:0}}`;
function mount() {
  if (!doc) return;
  const go = () => {
    if (doc.getElementById('kk-defs')) return;
    const d = doc.createElement('div'); d.id = 'kk-defs'; d.setAttribute('aria-hidden', 'true'); d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
    d.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute">${K.defs()}</svg>`; (doc.body || doc.documentElement).appendChild(d);
    const st = doc.createElement('style'); st.id = 'kk-css'; st.textContent = CSS; doc.head.appendChild(st);
  };
  if (doc.body) go(); else doc.addEventListener('DOMContentLoaded', go);
}

// ---------------------------------------------------------------- DOM helpers + caches
const tpl = doc ? doc.createElement('template') : null;
function el(svg) { if (!tpl) return null; tpl.innerHTML = svg.trim(); return tpl.content.firstChild; }
const elCache = new Map();
function cardEl(type, o) {
  mount(); const key = type + '|' + JSON.stringify(o || {});
  let t = elCache.get(key); if (!t) { t = el(K.cardSVG(type, o)); elCache.set(key, t); }
  return t.cloneNode(true);
}
const imgCache = new Map();
function cardURL(type, o) { return K.dataURL(K.cardSVG(type, Object.assign({}, o, { standalone: true }))); }
function backURL(o) { return K.dataURL(K.backSVG(Object.assign({}, o, { standalone: true }))); }
function cardImg(type, o) { const key = type + '|' + JSON.stringify(o || {}); let i = imgCache.get(key); if (!i && typeof Image !== 'undefined') { i = new Image(); i.src = cardURL(type, o); imgCache.set(key, i); } return i; }
// canvas: drawCard(ctx, type|'back', x, y, w, opts) -> Promise<Image>; draws immediately if the image is cached and loaded
function drawCard(ctx, type, x, y, w, o) {
  o = Object.assign({ w }, o);
  let i = type === 'back' ? (function () { const k = 'back|' + w; let m = imgCache.get(k); if (!m) { m = new Image(); m.src = backURL({ w }); imgCache.set(k, m); } return m; })() : cardImg(type, o);
  return new Promise(res => { const go = () => { try { ctx.drawImage(i, x, y, w, Math.round(w * 1.4)); } catch (e) {} res(i); }; if (i.complete && i.naturalWidth) go(); else i.addEventListener('load', go, { once: true }); });
}

// ---------------------------------------------------------------- reveal flourish: a cloche covers `host` until lift() is called
function clocheOn(host, o) {
  o = o || {}; mount();
  if (!doc || !host) return { el: null, lift: () => Promise.resolve(), remove() {} };
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
  const c = doc.createElement('div'); c.className = 'kk-cloche';
  c.innerHTML = `<div class="kk-lidwrap" style="position:absolute;inset:0;transform-origin:50% 100%">${K.clocheSVG({ w: 100 }).replace(/width="100" height="140"/, 'width="100%" height="100%"').replace('viewBox', 'preserveAspectRatio="none" viewBox')}</div>`;
  host.appendChild(c);
  const lift = (lo) => {
    lo = lo || {}; const delay = lo.delay || 0;
    return new Promise(res => setTimeout(() => {
      if (lo.onLift) try { lo.onLift(); } catch (e) {}
      c.classList.add('kk-lift');
      const rect = host.getBoundingClientRect(), w = rect.width || 100;
      for (let n = 0; n < 3; n++) { const p = doc.createElement('div'); p.className = 'kk-fxp'; p.style.cssText = `left:${20 + n * 28}%;top:${6 + (n % 2) * 8}%;width:${w * .22}px;height:${w * .16}px;animation:kk-steam ${.9 + n * .15}s ease-out ${n * .08}s both`; p.innerHTML = `<svg viewBox="0 0 40 28" width="100%" height="100%"><path d="M6 22Q0 14 8 11Q10 3 19 5Q28 0 32 9Q40 12 34 21Q20 26 6 22Z" fill="#fff" fill-opacity=".92" stroke="#9fb9cc" stroke-width="1.2"/></svg>`; host.appendChild(p); setTimeout(() => p.remove(), 1400); }
      for (let n = 0; n < 4; n++) { const p = doc.createElement('div'); p.className = 'kk-fxp'; const x = 12 + n * 24 + (n % 2) * 4, y = 30 + (n * 17) % 40; p.style.cssText = `left:${x}%;top:${y}%;width:${w * .14}px;height:${w * .14}px;animation:kk-spark .7s ease-out ${.2 + n * .07}s both`; p.innerHTML = `<svg viewBox="-10 -10 20 20" width="100%" height="100%"><path d="M0 -9L2.4 -2.4L9 0L2.4 2.4L0 9L-2.4 2.4L-9 0L-2.4 -2.4Z" fill="#ffd23a" stroke="#c98a10" stroke-width=".8"/></svg>`; host.appendChild(p); setTimeout(() => p.remove(), 1300); }
      setTimeout(() => { c.remove(); res(); }, 700);
    }, delay));
  };
  return { el: c, lift, remove() { c.remove(); } };
}
// lift several covers at once with a stagger (ms): revealAll([host,...]) -> Promise
function revealAll(hosts, o) { o = o || {}; const st = o.stagger != null ? o.stagger : 140; return Promise.all(hosts.map((h, i) => { const c = h.__kkc || clocheOn(h); return c.lift({ delay: i * st, onLift: o.onLift }); })); }

const API = {
  version: '1.1', ART: K.ART, setArt: m => { for (const k in m) K.ART[k] = m[k]; elCache.clear(); imgCache.clear(); }, TYPES, ORDER, PLAYERS, INK, CREAM, FONT, AVATARS: AV,
  cardSVG: K.cardSVG, backSVG: K.backSVG, pileSVG: K.pileSVG, plateSVG, cardLayout: K.cardLayout,
  beltSegmentSVG: K.beltSegmentSVG, beltCSS: K.beltCSS, beltEl: K.beltEl, counterSVG: K.counterSVG,
  avatarSVG, seatSVG, iconSVG: K.iconSVG, iconNames: K.ICON_NAMES, iconLabel: K.ICON_LABEL, ruleIcon: t => (TYPES[t] || {}).rule,
  roundMarkerSVG: K.roundMarkerSVG, roundTrackSVG: K.roundTrackSVG, scorePadSVG: K.scorePadSVG,
  clocheSVG: K.clocheSVG, clocheOn, revealAll,
  tableCSS: K.tableCSS, applyTable: K.applyTable,
  mount, css: () => CSS, defs: K.defs, el, cardEl, cardURL, cardImg, backURL, drawCard, dataURL: K.dataURL,
  name: t => (TYPES[t] || {}).name, ruleText: t => (TYPES[t] || {}).ruleText, color: t => (TYPES[t] || {}).c
};
root.KKKit = API; delete root.__KK;
mount();
})(typeof window !== 'undefined' ? window : globalThis);

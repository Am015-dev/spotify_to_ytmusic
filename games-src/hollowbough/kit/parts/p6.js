// ---------- API ----------
const DEFS2 = DEFS.replace('</defs>', `<clipPath id="hb-clip-plq"><rect x="3" y="3" width="154" height="78" rx="12"/></clipPath><clipPath id="hb-clip-plq2"><rect x="3" y="3" width="154" height="98" rx="12"/></clipPath></defs>`);
let mounted = false, defsEl = null;
function parse(str) {
  if (typeof DOMParser !== 'undefined') { const d = new DOMParser().parseFromString(str, 'image/svg+xml'); const e = d.documentElement; if (e.nodeName === 'parsererror' || e.getElementsByTagName('parsererror').length) throw new Error('HBKit svg parse error: ' + e.textContent.slice(0, 200)); return document.importNode(e, true); }
  const t = document.createElement('div'); t.innerHTML = str; return t.firstChild;
}
function mount() {
  if (mounted || typeof document === 'undefined') return;
  const host = document.body || document.documentElement; if (!host) return;
  const d = document.createElement('div'); d.setAttribute('aria-hidden', 'true'); d.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  d.innerHTML = `<svg xmlns="${NS}" width="0" height="0">${DEFS2}</svg>`; host.insertBefore(d, host.firstChild); defsEl = d; mounted = true;
}
const SIZES = { small: [64, 90], large: [260, 364] };
function dims(size) {
  if (size == null) size = 'small';
  if (typeof size === 'string') return SIZES[size] || SIZES.small;
  if (typeof size === 'number') return [size, Math.round(size * 1.4)];
  return [size.w, size.h || Math.round(size.w * 1.4)];
}
const tmpl = new Map(); let stats = { built: 0, cloned: 0 };
const specKey = (sp, lay) => lay + '|' + [sp.art, paintedHref(sp.key) ? sp.key : '', sp.type, sp.kind || '', sp.name, sp.unique ? 1 : 0, sp.points, JSON.stringify(sp.cost || {}), lay === 'l' ? sp.text || '' : ''].join('|');
function card(spec, size, opts) {
  mount();
  const [w, h] = dims(size), lay = w <= 120 ? 's' : 'l', k = specKey(spec, lay);
  let t = tmpl.get(k);
  if (!t) { t = parse(cardString(spec, lay)); tmpl.set(k, t); stats.built++; }
  const e = t.cloneNode(true); stats.cloned++;
  e.setAttribute('width', w); e.setAttribute('height', h); e.style.display = 'block'; e.style.overflow = 'visible';
  e.setAttribute('role', 'img'); e.setAttribute('aria-label', (spec.name || spec.art) + (spec.text ? '. ' + spec.text : ''));
  if (opts && opts.id) e.dataset.id = opts.id;
  return e;
}
const urlCache = new Map();
function toURL(svgStr) { return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgStr); }
function cardURL(spec, size) { // standalone data-URL (defs embedded) for <img>/canvas use; browser caches the decode
  const [w, h] = dims(size), lay = w <= 120 ? 's' : 'l', k = specKey(spec, lay) + '#url';
  let u = urlCache.get(k); if (!u) { u = toURL(cardString(spec, lay, true).replace(/^(<svg[^>]*>)/, '$1' + DEFS2)); urlCache.set(k, u); }
  return u;
}
function cardImg(spec, size) { const [w, h] = dims(size), i = new Image(); i.width = w; i.height = h; i.src = cardURL(spec, size); i.alt = spec.name || spec.art; i.draggable = false; return i; }
function artEl(key, w) { mount(); w = w || 200; const e = parse(`<svg xmlns="${NS}" viewBox="0 0 100 62" width="${w}" height="${Math.round(w * .62)}"><g filter="url(#hb-wc)">${artInner(key)}</g></svg>`); return e; }
const cacheEl = (name, fn) => { const m = new Map(); return function () { mount(); const a = Array.prototype.slice.call(arguments), sz = a.pop(), k = name + '|' + a.join('|'); let t = m.get(k); if (!t) { t = parse(fn.apply(null, a)); m.set(k, t); } const e = t.cloneNode(true); const [w, h] = sz; e.setAttribute('width', w); e.setAttribute('height', h); e.style.display = 'block'; return e; }; };
const _res = cacheEl('res', k => svgWrap(24, 24, '0 0 24 24', tokenResource(k)));
const _pt = cacheEl('pt', n => svgWrap(24, 24, '0 0 24 24', tokenPoint(n === '' ? null : n)));
const _occ = cacheEl('occ', () => svgWrap(24, 24, '0 0 24 24', tokenOccupied()));
const _mee = cacheEl('mee', i => svgWrap(24, 30, '0 0 24 30', meeple(+i)));
const _sea = cacheEl('sea', n => svgWrap(48, 48, '0 0 48 48', seasonIcon(n)));
const sq = s => [s || 32, s || 32];
const HB = {
  version: '1.0.0', INK, PAPER, FONT, TYPES, RES, PLAYER, SIZES,
  artKeys: ART_KEYS, critterKeys: CRIT_KEYS, constructionKeys: CONS_KEYS, resources: ['twig', 'resin', 'pebble', 'berry'], seasons: ['winter', 'spring', 'summer', 'autumn'],
  mount, card, cardURL, cardImg, art: artEl,
  resource: (kind, s) => _res(kind, sq(s)),
  point: (n, s) => _pt(n == null ? '' : n, sq(s)),
  occupied: s => _occ(sq(s)),
  worker: (i, s) => { s = s || 32; return _mee(typeof i === 'number' ? i : Math.max(0, PLAYER.findIndex(p => p.name === i)), [s * .8, s]); },
  season: (name, s) => _sea(name, sq(s || 48)),
  plaque: (kind, o) => { mount(); return parse(plaque(kind, o)); },
  elderheart: (o) => { mount(); o = o || {}; const w = o.w || 600; return parse(svgWrap(w, w * 1.2, '0 0 600 720', elderheartInner(o.season), ' data-elderheart="1"')); },
  elderheartSlots: TREE_SLOTS,
  table: (w, h, mood) => { mount(); return parse(svgWrap(w, h, `0 0 ${w} ${h}`, tableSVG(w, h, mood))); },
  tableURL: (mood, w, h) => toURL(svgWrap(w || 1200, h || 800, `0 0 ${w || 1200} ${h || 800}`, DEFS2 + tableSVG(w || 1200, h || 800, mood))),
  applyTable: (el, mood) => { el.style.backgroundColor = mood === 'forest' ? '#6f8f5c' : '#efe3c6'; el.style.backgroundImage = `url("${HB.tableURL(mood)}")`; el.style.backgroundSize = 'cover'; el.style.backgroundPosition = 'center'; },
  stats: () => Object.assign({ templates: tmpl.size }, stats), clearCache: () => { tmpl.clear(); urlCache.clear(); }
};
root.HBKit = HB;
})(typeof window !== 'undefined' ? window : globalThis);

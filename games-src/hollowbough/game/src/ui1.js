// ===================== part 1: globals, helpers, kit wrappers =====================
var ANIM = 1, AIDELAY = 650;
var G = null;
var UI = { started: false, mode: 'vs', cfg: null, view: 0, holder: -1, pop: null, cards: [], after: [], coach: { level: 'full', seen: {} }, rec: null, recKey: '', busy: false, lay: null, lastLog: 0, over: null, noRec: false };
const D = HB.DATA;
const RESK = ['twig', 'resin', 'pebble', 'berry'];
const SEAS = ['winter', 'spring', 'summer', 'autumn'];
const SEASN = ['Winter', 'Spring', 'Summer', 'Autumn'];
// data card key -> kit art key
const ART = { architect: 'beetle_architect', bard: 'hedgehog_bard', barge_toad: 'toad_shopkeeper', chip_sweep: 'shrew_sweeper', doctor: 'bat_doctor', fool: 'mouse_fool', historian: 'owl_historian', husband: 'mouse_farmer', innkeeper: 'frog_innkeeper', judge: 'frog_judge', king: 'badger_king', miner_mole: 'mole_miner', monk: 'hedgehog_monk', peddler: 'rabbit_peddler', postal_pigeon: 'pigeon_postal', queen: 'rabbit_queen', ranger: 'shrew_ranger', shepherd: 'badger_harvester', shopkeeper: 'squirrel_shopkeeper', teacher: 'turtle_teacher', undertaker: 'toad_undertaker', wanderer: 'fox_wanderer', wife: 'hedgehog_farmer', woodcarver: 'squirrel_woodcarver',
  castle: 'castle', cemetery: 'cemetery', chapel: 'chapel', clock_tower: 'clocktower', courthouse: 'courthouse', crane: 'crane', dungeon: 'dungeon', ever_tree: 'elderheart', fair_grounds: 'fairground', farm: 'farm', general_store: 'store', inn: 'inn', lookout: 'lookout', mine: 'mine', monastery: 'monastery', palace: 'palace', post_office: 'postoffice', resin_refinery: 'refinery', ruins: 'ruins', school: 'school', storehouse: 'storehouse', theater: 'theatre', twig_barge: 'barge', university: 'university' };
const TYPEN = { traveler: 'Traveler', production: 'Production', destination: 'Destination', governance: 'Governance', prosperity: 'Prosperity' };
const TYPEHELP = { traveler: 'Acts once when played.', production: 'Acts when played, then again every Spring and Autumn.', destination: 'A place where you can send a worker.', governance: 'Gives a lasting bonus or discount.', prosperity: 'Scores bonus points at the end.' };
const spec = id => { const c = HB.cardOf(id); return { art: ART[c.key] || 'farm', name: c.name, type: c.type, kind: c.kind, unique: c.unique, cost: c.cost, points: c.pts, text: c.text }; };
const cdef = id => HB.cardOf(id);
const cname = id => HB.cardName(id);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const PNAMES = ['Bramble', 'Fern', 'Quill', 'Thistle'];
// tiny element builder: h('div.cls#id', {attr:..}, ...kids)
function h(sel, at) {
  const m = /^([a-z0-9]*)((?:[.#][\w-]+)*)$/i.exec(sel) || [0, 'div', ''];
  const e = document.createElement(m[1] || 'div');
  const cls = []; (m[2] || '').replace(/([.#])([\w-]+)/g, (_, k, v) => { if (k === '#') e.id = v; else cls.push(v); });
  if (cls.length) e.className = cls.join(' ');
  let i = 2;
  if (at && typeof at === 'object' && !(at instanceof Node) && !Array.isArray(at)) { for (const k in at) { const v = at[k]; if (v == null || v === false) continue; if (k === 'text') e.textContent = v; else if (k === 'html') e.innerHTML = v; else e.setAttribute(k, v === true ? '' : v); } } else i = 1;
  for (; i < arguments.length; i++) add(e, arguments[i]);
  return e;
}
function add(e, k) { if (k == null || k === false) return; if (Array.isArray(k)) k.forEach(x => add(e, x)); else e.appendChild(k instanceof Node ? k : document.createTextNode(String(k))); }
// ---- icons (kit tokens + a few own glyphs)
const ICO = {
  card: '<svg viewBox="0 0 24 24"><rect x="5" y="2.5" width="14" height="19" rx="2.5" fill="#f6ecd6" stroke="#3b2f2a" stroke-width="1.6"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4" stroke="#8a6240" stroke-width="1.5" stroke-linecap="round"/></svg>',
  any: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" fill="#f6ecd6" stroke="#3b2f2a" stroke-width="1.6"/><path d="M12 12V2.5A9.5 9.5 0 0 1 21.5 12Z" fill="#c2364c"/><path d="M12 12h9.5A9.5 9.5 0 0 1 12 21.5Z" fill="#8d949a"/><path d="M12 12v9.5A9.5 9.5 0 0 1 2.5 12Z" fill="#e0a02c"/><path d="M12 12H2.5A9.5 9.5 0 0 1 12 2.5Z" fill="#8a6240"/></svg>',
  discard: '<svg viewBox="0 0 24 24"><rect x="5" y="2.5" width="14" height="19" rx="2.5" fill="#f6ecd6" stroke="#3b2f2a" stroke-width="1.6"/><path d="M8 12h8" stroke="#b04a38" stroke-width="2.4" stroke-linecap="round"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="12" height="12" rx="2" fill="#f6ecd6" stroke="#3b2f2a" stroke-width="1.6"/><rect x="9" y="9" width="12" height="12" rx="2" fill="#cfe0b4" stroke="#3b2f2a" stroke-width="1.6"/></svg>',
  meadow: '<svg viewBox="0 0 24 24"><path d="M2 19c4-6 8-6 10-3s6 1 10-4v9H2Z" fill="#8fbf6a" stroke="#3b2f2a" stroke-width="1.4"/><rect x="8" y="3" width="8" height="11" rx="1.5" fill="#f6ecd6" stroke="#3b2f2a" stroke-width="1.4"/></svg>',
  haven: '<svg viewBox="0 0 24 24"><path d="M3 11 12 3l9 8v10H3Z" fill="#f6ecd6" stroke="#3b2f2a" stroke-width="1.6"/><path d="M9 21v-7h6v7" fill="#8a6240" stroke="#3b2f2a" stroke-width="1.2"/></svg>',
  road: '<svg viewBox="0 0 24 24"><path d="M9 22 11 2h2l2 20" fill="#c9a46a" stroke="#3b2f2a" stroke-width="1.4"/><path d="M12 5v3M12 11v3M12 17v3" stroke="#f6ecd6" stroke-width="1.6"/></svg>',
  deck: '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="14" height="18" rx="2.5" fill="#5f8f4a" stroke="#3b2f2a" stroke-width="1.6"/><rect x="4" y="2" width="14" height="18" rx="2.5" fill="#7fae62" stroke="#3b2f2a" stroke-width="1.6"/><path d="M11 6c3 3 3 7 0 10-3-3-3-7 0-10Z" fill="#f6ecd6"/></svg>',
  flag: '<svg viewBox="0 0 24 24"><path d="M6 21V3" stroke="#3b2f2a" stroke-width="2" stroke-linecap="round"/><path d="M6 4h12l-3 4 3 4H6Z" fill="#e3b02e" stroke="#3b2f2a" stroke-width="1.4"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 2 3 6.5 7 .8-5.2 4.8 1.5 7L12 17.5 5.7 21l1.5-7L2 9.3l7-.8Z" fill="#e3b02e" stroke="#3b2f2a" stroke-width="1.4"/></svg>',
  paw: '<svg viewBox="0 0 24 24"><ellipse cx="12" cy="16" rx="6" ry="5" fill="#8a6240"/><circle cx="5.5" cy="10" r="2.4" fill="#8a6240"/><circle cx="9.5" cy="5.5" r="2.4" fill="#8a6240"/><circle cx="14.5" cy="5.5" r="2.4" fill="#8a6240"/><circle cx="18.5" cy="10" r="2.4" fill="#8a6240"/></svg>',
  tree: '<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="7.5" fill="#7fae62" stroke="#3b2f2a" stroke-width="1.4"/><path d="M10.5 22V14h3v8Z" fill="#8a6240" stroke="#3b2f2a" stroke-width="1.2"/></svg>'
};
function ic(kind, px) {
  px = px || 20;
  if (RESK.indexOf(kind) >= 0) return HBKit.resource(kind, px);
  if (kind === 'point') return HBKit.point(null, px);
  if (kind === 'occ') return HBKit.occupied(px);
  const s = h('span.ic', { 'aria-hidden': 'true', html: ICO[kind] || ICO.any }); s.style.width = s.style.height = px + 'px'; return s;
}
const rname = (r, n) => r === 'berry' ? (n === 1 ? 'berry' : 'berries') : r === 'resin' ? 'resin' : (n === 1 ? r : r + 's');
function costEl(cost, px, empty) {
  px = px || 18; const w = h('span.cost');
  let any = false;
  for (const r of RESK) if (cost && cost[r]) { any = true; w.appendChild(h('span.ci', ic(r, px), h('b', '×' + cost[r]))); }
  if (!any) w.appendChild(h('span.ci.free', empty || 'free'));
  return w;
}
function costText(cost) { const a = []; for (const r of RESK) if (cost && cost[r]) a.push(cost[r] + ' ' + rname(r, cost[r])); return a.join(', ') || 'nothing'; }
// ---- card widget: a small card with state badges. opts: {w, entry, owner, up, tap}
function cardEl(id, w, o) {
  o = o || {};
  const wr = h('div.cd', { 'data-card': id }); wr.style.width = w + 'px'; wr.style.height = Math.round(w * 1.406) + 'px';
  wr.appendChild(HBKit.card(spec(id), w));
  const e = o.entry;
  if (e) {
    const b = h('div.cb');
    if (e.occ) b.appendChild(h('span.cbo', ic('occ', Math.max(14, Math.round(w * .3)))));
    if (e.tok) b.appendChild(h('span.cbt', ic('point', Math.max(14, Math.round(w * .3))), h('b', e.tok)));
    if (e.w) b.appendChild(h('span.cbw', h('b', '⚑' + e.w)));
    if (e.pris && e.pris.length) b.appendChild(h('span.cbp', h('b', '⛓' + e.pris.length)));
    if (e.stock) { const n = RESK.reduce((s, r) => s + e.stock[r], 0); if (n) b.appendChild(h('span.cbs', h('b', '▣' + n))); }
    if (b.childNodes.length) wr.appendChild(b);
  }
  return wr;
}
function backEl(w) { const wr = h('div.cd.back'); wr.style.width = w + 'px'; wr.style.height = Math.round(w * 1.406) + 'px'; wr.appendChild(h('span', { html: ICO.tree })); return wr; }
// ---- game helpers
const humans = () => G ? G.players.map((p, i) => p.ai ? -1 : i).filter(i => i >= 0) : [];
const hotSeat = () => !!G && !NET.on && humans().length > 1;
const watching = () => !!G && humans().length === 0;
function viewSeat() { if (!G) return -1; if (NET.on) return NET.mySeat; if (hotSeat()) return UI.holder; const hs = humans(); return hs.length ? hs[0] : -1; }
function pname(s) { return s === 'G' ? D.soloName : (G.players[s] ? G.players[s].name : '?'); }
function availW(p) { return p.workers - p.dep.length; }
function movesFor(seat) { return G && G.phase !== 'over' ? HB.moves(G, seat) : []; }
function mkey(m) { const o = {}; Object.keys(m).sort().forEach(k => { if (k !== 'label') o[k] = m[k]; }); return JSON.stringify(o); }
function sameM(a, b) { return !!a && !!b && mkey(a) === mkey(b); }
function pcolor(i) { return HBKit.PLAYER[i === 'G' ? 4 : i % 4]; }
function pawn(i, px) { const k = i === 'G' ? 4 : i % 4, w = h('span.pawnw', HBKit.worker(k, px), h('i.gx-cbm', { 'aria-hidden': 'true' }, GX.mark(k))); w.style.setProperty('--pw', px + 'px'); return w; }
function score(seat) { try { return HB.score(G, seat); } catch (e) { return { total: 0 }; } }
function lastLogs(n) { return G.log.slice(-n).map(x => x.t); }
function logSince(i) { return G.log.filter(x => x.i > i).map(x => x.t); }

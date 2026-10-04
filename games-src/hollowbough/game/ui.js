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
  castle: 'castle', cemetery: 'cemetery', chapel: 'chapel', clock_tower: 'clocktower', courthouse: 'courthouse', crane: 'crane', dungeon: 'dungeon', ever_tree: 'evertree', fair_grounds: 'fairground', farm: 'farm', general_store: 'store', inn: 'inn', lookout: 'lookout', mine: 'mine', monastery: 'monastery', palace: 'palace', post_office: 'postoffice', resin_refinery: 'refinery', ruins: 'ruins', school: 'school', storehouse: 'storehouse', theater: 'theatre', twig_barge: 'barge', university: 'university' };
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
// ===================== part 2: the board (shared Evertree area): layout + render =====================
const FIC = {
  forest_berry_thicket: [['berry', 2], ['card', 1]], forest_foragers_crossing: [['any', 2]], forest_rummage_hollow: [['discard', '*'], ['card', '2ea']],
  forest_echoing_meadow: [['copy', ''], ['card', 1]], forest_quarry_burrow: [['pebble', 1], ['card', 3]], forest_mixed_glade: [['twig', 1], ['resin', 1], ['berry', 1]],
  forest_bumper_bramble: [['berry', 3]], forest_sapwell_copse: [['resin', 2], ['twig', 1]], forest_postbag_clearing: [['card', 2], ['any', 1]],
  forest_barter_stump: [['discard', '3'], ['any', '']], forest_meadow_bazaar: [['meadow', '2']]
};
const EVT = { production: 'production', destination: 'destination', governance: 'governance', traveler: 'traveler' };
function items(list, px) {
  const w = h('div.its' + (list.length > 2 ? '.its3' : ''));
  for (const [k, n] of list) w.appendChild(h('span.it', ic(k, px), (n !== '' && n !== 1) ? h('b', (/^\d+$/.test(String(n)) ? '×' : '') + n) : null));
  return w;
}
function basicItems(i) { const b = D.basic[i], l = []; for (const r of RESK) if (b.gain[r]) l.push([r, b.gain[r]]); if (b.draw) l.push(['card', b.draw]); if (b.pts) l.push(['point', b.pts]); return l; }
// ---- layout: returns rects for every board item
function boardLayout(W, H) {
  const nf = G.forest.length, g = 2, tall = W < H * 1.0 || (document.documentElement.classList.contains('ph-p') && H >= 270);
  const R = { W, H, tall, tiles: [], meadow: [], g };
  const tl = (kind, i, x, y, w, hh) => R.tiles.push({ kind, i, x, y, w, h: hh });
  const extra = [['haven', 0], ['journey', 0], ['deck', 0], ['tree', 0]];
  const rowB = []; for (let i = 0; i < nf; i++) rowB.push(['forest', i]); extra.forEach(e => rowB.push(e)); if (nf === 3) rowB.push(['disc', 0]);
  const evs = []; G.bev.forEach((e, i) => evs.push(['bev', i])); G.sev.forEach((e, i) => evs.push(['sev', i]));
  if (tall) {
    const gx = 6, tw = (W - 7 * 1) / 8; let tr = 46;
    let cw = Math.min((W - 3 * gx) / 4, 130), avail = H - 3 * tr - 3 * g - 4;
    let ch = Math.min(avail / 2 - 3, cw * 1.406); cw = ch / 1.406;
    const left = H - (3 * tr + 3 * g + 2 * ch + 4 + 3); if (left > 0) tr += Math.min(10, left / 3);
    let y = 0;
    for (let i = 0; i < 8; i++) tl('basic', i, i * (tw + 1), y, tw, tr); y += tr + g;
    rowB.forEach((e, i) => tl(e[0], e[1], i * (tw + 1), y, tw, tr)); y += tr + g;
    evs.forEach((e, i) => tl(e[0], e[1], i * (tw + 1), y, tw, tr)); y += tr + g + 2;
    const rest = H - y, tot = 2 * ch + 4; const y0 = y + Math.max(0, (rest - tot) / 2), x0 = (W - (4 * cw + 3 * gx)) / 2;
    for (let s = 0; s < 8; s++) R.meadow.push({ i: s, x: x0 + (s % 4) * (cw + gx), y: y0 + Math.floor(s / 4) * (ch + 4), w: cw, h: ch });
  } else {
    const gp = Math.max(6, Math.round(W * .012)); const Lw = Math.round(W * .40), tw = (Lw - 3 * g) / 4;
    const th = Math.min(tw * 1.3, (H - 3 * g - 8) / 4);
    for (let i = 0; i < 8; i++) tl('basic', i, (i % 4) * (tw + g), Math.floor(i / 4) * (th + g), tw, th);
    const y2 = 2 * (th + g) + 6;
    rowB.forEach((e, i) => tl(e[0], e[1], (i % 4) * (tw + g), y2 + Math.floor(i / 4) * (th + g), tw, th));
    const x0 = Lw + gp * 2, Rw = W - x0; let cw = Math.min((Rw - 3 * g * 2) / 4, 170);
    const evh = Math.max(44, Math.min(th * .9, 70));
    let ch = cw * 1.406; const maxch = (H - 2 * evh - 4 * g - 10) / 2; if (ch > maxch) { ch = maxch; cw = ch / 1.406; }
    const gm = Math.min(g * 3, (Rw - 4 * cw) / 3);
    const mx = x0 + (Rw - (4 * cw + 3 * gm)) / 2;
    for (let s = 0; s < 8; s++) R.meadow.push({ i: s, x: mx + (s % 4) * (cw + gm), y: Math.floor(s / 4) * (ch + g * 2), w: cw, h: ch });
    const ey = 2 * ch + g * 4 + 8, etw = (Rw - 3 * g) / 4;
    evs.forEach((e, i) => tl(e[0], e[1], x0 + (i % 4) * (etw + g), ey + Math.floor(i / 4) * (evh + g), etw, evh));
  }
  if (!tall) { let mx = 0; R.tiles.forEach(t => mx = Math.max(mx, t.y + t.h)); R.meadow.forEach(t => mx = Math.max(mx, t.y + t.h)); const off = Math.max(0, Math.min(80, (H - mx) / 2)); if (off > 1) { R.tiles.forEach(t => t.y += off); R.meadow.forEach(t => t.y += off); } }
  return R;
}
// who stands where
function placements() {
  const out = [];
  G.players.forEach((p, s) => p.dep.forEach(pl => out.push({ s, pl })));
  if (G.grim) { const gr = G.grim; if (gr.bi >= 0) out.push({ s: 'G', pl: { k: 'basic', i: gr.bi } }); if (gr.fi >= 0) out.push({ s: 'G', pl: { k: 'forest', i: gr.fi } }); if (gr.ji >= 0) out.push({ s: 'G', pl: { k: 'journey', i: gr.ji } }); }
  return out;
}
function workersAt(kind, i) {
  const o = [];
  for (const { s, pl } of placements()) {
    if (kind === 'haven' && pl.k === 'haven') o.push(s);
    else if ((kind === 'basic' || kind === 'forest') && pl.k === kind && pl.i === i) o.push(s);
    else if (kind === 'journey' && pl.k === 'journey') o.push(s);
  }
  return o;
}
function wmoveKey(m) { return m.k + ':' + (m.k === 'dest' ? m.c : m.k === 'event' ? m.e + m.i : m.i == null ? '' : m.i); }
// legal worker moves of the human whose turn it is
function myMoves() {
  if (!G || G.phase === 'over') return [];
  const a = HB.actor(G), p = G.players[a];
  if (!p || p.ai || a !== viewSeat() || G.q) return [];
  return movesFor(a);
}
function tileInfo(kind, i) {
  switch (kind) {
    case 'basic': { const b = D.basic[i]; return { name: b.name, text: b.text, shared: b.shared, key: 'basic:' + i }; }
    case 'forest': { const f = D.forest[G.forest[i]]; return { name: f.name, text: f.text, shared: false, key: 'forest:' + i }; }
    case 'haven': return { name: D.haven.name, text: D.haven.text, shared: true, key: 'haven:' };
    case 'journey': return { name: D.journeyName, text: 'Autumn only. Discard 5, 4, 3 or 2 cards from your hand; that worker stays for the rest of the game and scores the same number of points.', shared: false, key: 'journey:' };
    case 'bev': { const e = D.basicEvents[G.bev[i].k]; return { name: e.name, text: e.text, key: 'event:b' + i }; }
    case 'sev': { const e = D.specialEvents[G.sev[i].k]; return { name: e.name, text: e.text, key: 'event:s' + i }; }
  }
  return {};
}
function tileFace(t, big) {
  const px = big ? 28 : 20; let f = h('div.face');
  switch (t.kind) {
    case 'basic': f.appendChild(items(basicItems(t.i), px)); break;
    case 'forest': f.appendChild(items(FIC[D.forest[G.forest[t.i]].key] || [['any', '']], px)); break;
    case 'haven': f.appendChild(items([['haven', ''], ['any', '']], px)); break;
    case 'journey': f.appendChild(items([['road', ''], ['point', '2-5']], px)); break;
    case 'deck': f.appendChild(h('div.its', h('span.it', ic('deck', px), h('b', G.deck.length)))); break;
    case 'disc': f.appendChild(h('div.its', h('span.it', ic('discard', px), h('b', G.discard.length)))); break;
    case 'tree': { const s = G.players[Math.max(0, viewSeat() >= 0 ? viewSeat() : (G.phase === 'over' ? 0 : HB.actor(G)))]; f.appendChild(h('div.its', h('span.it', HBKit.season(SEAS[s ? s.season : 0], px + 4)))); break; }
    case 'bev': { const e = G.bev[t.i], dd = D.basicEvents[e.k], need = Object.keys(dd.need)[0]; const col = HBKit.TYPES[need] ? HBKit.TYPES[need].c : '#888'; f.style.setProperty('--ec', col); f.appendChild(h('div.its', h('span.it', ic('flag', px), h('b', dd.pts)))); break; }
    case 'sev': { const e = G.sev[t.i], dd = D.specialEvents[e.k]; f.style.setProperty('--ec', '#7f5496'); f.appendChild(h('div.its', h('span.it', ic('star', px), dd.pts ? h('b', dd.pts) : h('b', '?')))); break; }
  }
  if (big) { const nm = t.kind === 'deck' ? 'Draw pile' : t.kind === 'disc' ? 'Discards' : t.kind === 'tree' ? 'Seasons' : (tileInfo(t.kind, t.i).name || ''); f.appendChild(h('div.nm', nm)); }
  return f;
}
function renderBoard() {
  const host = $('#board'), bd = $('#bd'); if (!host || !G) return;
  const W = host.clientWidth || 390, H = host.clientHeight || 470;
  const R = boardLayout(W, H); UI.lay = R;
  bd.innerHTML = ''; bd.style.width = W + 'px'; bd.style.height = H + 'px';
  bd.className = R.tall ? 'tall' : 'wide';
  const mm = myMoves(), ok = new Set(mm.filter(m => m.type === 'worker').map(wmoveKey)), mine = mm.length > 0;
  const rec = UI.rec && UI.rec.m;
  const big = !R.tall && R.tiles.some(t => t.kind === 'basic' && t.w >= 84 && t.h >= 70);
  bd.classList.toggle('big', big);
  for (const t of R.tiles) {
    const info = tileInfo(t.kind, t.i);
    const e = h('button.tile.t-' + t.kind, { 'data-a': 'tile', 'data-k': t.kind, 'data-i': t.i, type: 'button', 'aria-label': info.name || (t.kind === 'deck' ? 'Draw pile' : t.kind === 'disc' ? 'Discard pile' : 'Seasons') });
    e.style.cssText = `left:${t.x}px;top:${t.y}px;width:${t.w}px;height:${t.h}px`;
    e.appendChild(tileFace(t, big));
    let legal = false;
    if (t.kind === 'basic' || t.kind === 'forest') legal = ok.has(t.kind + ':' + t.i);
    else if (t.kind === 'haven') legal = ok.has('haven:');
    else if (t.kind === 'journey') legal = [0, 1, 2, 3].some(i => ok.has('journey:' + i));
    else if (t.kind === 'bev') legal = ok.has('event:b' + t.i);
    else if (t.kind === 'sev') legal = ok.has('event:s' + t.i);
    if (mine && legal) e.classList.add('ok'); else if (mine && !/deck|disc|tree/.test(t.kind)) e.classList.add('no');
    if (rec && rec.type === 'worker' && legal && (rec.k === t.kind || (rec.k === 'event' && ((rec.e === 'b' && t.kind === 'bev' && rec.i === t.i) || (rec.e === 's' && t.kind === 'sev' && rec.i === t.i)))) && (rec.k === 'event' || rec.k === 'haven' || rec.k === 'journey' || rec.i === t.i)) e.classList.add('rec');
    // workers
    if (t.kind === 'bev' || t.kind === 'sev') {
      const ev = (t.kind === 'bev' ? G.bev : G.sev)[t.i];
      if (ev.o !== -1 && ev.o != null) { e.classList.add('done'); e.appendChild(h('div.pw', pawn(ev.o, 16))); }
    } else if (/basic|forest|haven|journey/.test(t.kind)) {
      const ws = workersAt(t.kind, t.i);
      if (ws.length) { const pw = h('div.pw'); ws.slice(0, 4).forEach(s => pw.appendChild(pawn(s, 16))); e.appendChild(pw); if (!info.shared && t.kind !== 'journey' && t.kind !== 'haven') e.classList.add('taken'); }
    }
    bd.appendChild(e);
  }
  const mset = new Set(mm.filter(m => m.type === 'play' && m.from === 'meadow').map(m => m.card));
  const blocked = G.grim ? G.grim.mb : [];
  for (const m of R.meadow) {
    const id = G.meadow[m.i];
    const e = h('button.mc', { 'data-a': 'mcard', 'data-i': m.i, type: 'button', 'aria-label': id >= 0 ? 'Meadow card: ' + cname(id) : 'Empty meadow space' });
    e.style.cssText = `left:${m.x}px;top:${m.y}px;width:${m.w}px;height:${m.h}px`;
    if (id >= 0) { e.appendChild(cardEl(id, Math.round(m.w))); if (mine && mset.has(id)) e.classList.add('ok'); if (rec && rec.type === 'play' && rec.from === 'meadow' && rec.card === id) e.classList.add('rec'); }
    else e.classList.add('empty');
    if (blocked.indexOf(m.i) >= 0) { e.classList.add('blocked'); e.appendChild(h('span.lock', '⛔')); }
    bd.appendChild(e);
  }
}
// ===================== part 3: the dock (chips, resources, city and hand strips, prompt) =====================
const isPh = () => document.documentElement.classList.contains('ph');
function focusSeat() { const v = viewSeat(); if (v >= 0) return v; if (UI.focus != null && UI.focus < G.np) return UI.focus; return Math.max(0, G.phase === 'over' ? 0 : Math.min(G.np - 1, G.cur)); }
function stripW() { return isPh() ? 46 : 58; }
function promptText() {
  if (!G) return '';
  if (G.phase === 'over') return 'The game is over.';
  const a = HB.actor(G), p = G.players[a];
  if (UI.cards.length) return 'Read the card, then Continue.';
  if (NET.on && !p.ai && a !== viewSeat()) return p.name + ' is deciding…';
  if (hotSeat() && UI.holder !== a && !p.ai) return 'Pass the device to ' + p.name + '.';
  if (p.ai) { const l = G.log.length ? G.log[G.log.length - 1].t : ''; return p.name + ' is playing… ' + (UI.lastAi || ''); }
  if (G.q) return G.q.title;
  const n = availW(p);
  const pre = NET.on ? 'Your turn. ' : hotSeat() || humans().length > 1 ? p.name + ', ' : 'Your turn. ';
  return pre + (n > 0 ? 'Tap a place for a worker (' + n + ' free) or a card to play.' : 'No workers left: play a card, Prepare for ' + (p.season < 3 ? SEASN[p.season + 1] : 'the end') + ', or Pass.');
}
function chipEl(s) {
  const grim = s === 'G', p = grim ? null : G.players[s];
  const pts = grim ? HB.grimScore(G).total : score(s).total;
  const cards = grim ? G.grim.city.length : HB.cityCount(G, s);
  const wk = grim ? '—' : availW(p) + '/' + p.workers;
  const turn = G.phase !== 'over' && !grim && HB.actor(G) === s;
  const e = h('button.chip' + (turn ? '.turn' : '') + (s === viewSeat() ? '.me' : ''), { 'data-a': 'chip', 'data-seat': s, type: 'button', 'aria-label': pname(s) + ': ' + pts + ' points, ' + cards + ' cards in city' + (grim ? '' : ', ' + wk + ' workers free') });
  e.style.borderColor = pcolor(s).c;
  e.appendChild(h('span.cn', pawn(s, 15), h('b', pname(s)), p ? h('span.cs', HBKit.season(SEAS[p.season], 16)) : null, p && p.passed ? h('i', 'out') : null));
  e.appendChild(h('span.cl', h('span', '★' + pts), h('span', '▢' + cards), p ? h('span', '⚑' + wk) : h('span', 'solo')));
  return e;
}
function renderChips() {
  const c = $('#chips'); c.innerHTML = '';
  for (let s = 0; s < G.np; s++) c.appendChild(chipEl(s));
  if (G.grim) c.appendChild(chipEl('G'));
}
function renderRes() {
  const r = $('#res'); r.innerHTML = ''; const s = focusSeat(), p = G.players[s];
  const show = viewSeat() >= 0 || watching();
  for (const k of RESK) r.appendChild(h('span.rs', { title: k }, ic(k, 20), h('b', show ? p.res[k] : '?')));
  r.appendChild(h('span.rs.pt', ic('point', 20), h('b', p.pts)));
  const wr = h('span.rs.wk', { title: 'free workers' }, pawn(s, 18), h('b', availW(p) + '/' + p.workers));
  r.appendChild(wr);
}
function renderActs() {
  const a = $('#acts'); a.innerHTML = '';
  if (!G || G.phase === 'over') return;
  const act = HB.actor(G), p = G.players[act], mine = !p.ai && act === viewSeat() && !G.q && !UI.cards.length;
  const ms = mine ? movesFor(act) : [];
  const prep = ms.find(m => m.type === 'prepare'), pass = ms.find(m => m.type === 'pass');
  const rec = UI.rec && UI.rec.m;
  a.appendChild(h('button.btn' + (prep ? '' : '.dis') + (rec && rec.type === 'prepare' ? '.rec' : ''), { 'data-a': 'prep', type: 'button', disabled: prep ? null : true }, prep ? 'Prepare: ' + SEASN[p.season + 1] : (mine && p.season >= 3 ? 'Last season' : 'Prepare')));
  a.appendChild(h('button.btn' + (pass ? '' : '.dis') + (rec && rec.type === 'pass' ? '.rec' : ''), { 'data-a': 'pass', type: 'button', disabled: pass ? null : true }, 'Pass'));
  a.appendChild(h('button.btn.alt' + (mine ? '' : '.dis'), { 'data-a': 'hint', type: 'button', disabled: mine ? null : true }, 'Hint'));
  if (GX.undo.can() && !p.ai && act === viewSeat()) a.appendChild(h('button.btn.alt.undo', { 'data-a': 'undo', type: 'button', 'aria-label': 'Undo my last step' }, '↶ Undo'));
}
function renderStrips() {
  const s = focusSeat(), p = G.players[s], w = stripW();
  const cr = $('#cityRow'); cr.innerHTML = '';
  const mm = myMoves(), cityOk = new Set(mm.filter(m => m.type === 'worker' && m.k === 'dest' && m.o === s).map(m => m.c));
  p.city.forEach(e => { const b = h('button.sc', { 'data-a': 'ccard', 'data-seat': s, 'data-id': e.id, type: 'button', 'aria-label': cname(e.id) }, cardEl(e.id, w, { entry: e })); if (cityOk.has(e.id)) b.classList.add('ok'); const rec = UI.rec && UI.rec.m; if (rec && rec.type === 'worker' && rec.k === 'dest' && rec.c === e.id) b.classList.add('rec'); cr.appendChild(b); });
  if (!p.city.length) cr.appendChild(h('span.empty', 'No cards in the city yet.'));
  $('#cityLab').textContent = (s === viewSeat() ? 'City' : p.name) + ' ' + HB.cityCount(G, s) + '/15';
  const hr = $('#handRow'); hr.innerHTML = ''; const v = viewSeat();
  const hand = v >= 0 ? G.players[v].hand : [];
  const pset = new Set(mm.filter(m => m.type === 'play' && m.from === 'hand').map(m => m.card));
  const rec = UI.rec && UI.rec.m;
  if (v >= 0) {
    hr.setAttribute('data-owner', v);
    hand.forEach(id => { const b = h('button.sc', { 'data-a': 'hcard', 'data-id': id, 'data-owner': v, 'data-up': '1', type: 'button', 'aria-label': cname(id) }, cardEl(id, w)); if (pset.has(id)) b.classList.add('ok'); if (rec && rec.type === 'play' && rec.from === 'hand' && rec.card === id) b.classList.add('rec'); hr.appendChild(b); });
    if (!hand.length) hr.appendChild(h('span.empty', 'Your hand is empty.'));
    $('#handLab').textContent = 'Hand ' + hand.length + '/8';
  } else {
    hr.removeAttribute('data-owner');
    hr.appendChild(h('span.empty', watching() ? 'Watching the computers play.' : NET.on ? 'You are watching this game.' : 'Hand hidden until the device is passed.'));
    $('#handLab').textContent = 'Hand';
  }
}
function renderDock() {
  if (!G) return;
  $('#prompt').textContent = promptText();
  $('#prompt').classList.toggle('mine', !!(G.phase !== 'over' && !G.players[HB.actor(G)].ai && (!NET.on || HB.actor(G) === viewSeat())));
  renderChips(); renderRes(); renderActs(); renderStrips();
  const t = $('#barstat'); if (t) { const p = G.players[Math.max(0, focusSeat())]; t.innerHTML = ''; t.appendChild(HBKit.season(SEAS[p.season], 22)); t.appendChild(h('span', SEASN[p.season] + (G.phase === 'over' ? ' · over' : ''))); }
}
// place the prompt: in the bar on phones, in the dock otherwise
function placePrompt() {
  const pr = $('#prompt'), bar = $('#barprompt'), dockTop = $('#promptDock');
  const want = document.documentElement.classList.contains('ph-p') ? bar : dockTop;
  if (pr.parentNode !== want) want.appendChild(pr);
}
// ===================== part 4: pop-ups (location, card, event), recommendation, pending decisions =====================
// ---- recommendation (the normal AI's pick for the human seat) and a plain-words reason
function computeRec(force) {
  if (!G || G.phase === 'over') { UI.rec = null; return; }
  const a = HB.actor(G), p = G.players[a];
  if (p.ai || a !== viewSeat() || (UI.noRec && !force)) { UI.rec = null; return; }
  const key = G.logN + ':' + G.turn + ':' + (G.q ? G.q.kind + G.q.opts.length : '');
  if (UI.recKey === key && UI.rec) return;
  try { UI.rec = { m: HB.AI.choose(G, a, 'normal') }; } catch (e) { UI.rec = null; }
  UI.recKey = key;
}
function why(m, seat) {
  if (!m) return '';
  const p = G.players[seat];
  if (m.type === 'prepare') return 'All your workers are out. Preparing brings them home' + (p.season === 0 ? ', gives you a new worker and runs your production cards.' : p.season === 1 ? ', gives you a new worker and lets you take 2 cards from the meadow.' : ', gives you 2 new workers and runs your production cards.');
  if (m.type === 'pass') return 'There is little left worth doing, so ending your game now is reasonable.';
  if (m.type === 'worker') {
    if (m.k === 'basic') { const b = D.basic[m.i]; return 'A solid, simple gain: ' + b.text.replace(/ Shared\.$/, '').toLowerCase() + (b.shared ? ' (it never fills up).' : ' (only one worker fits, so it may be gone next turn).'); }
    if (m.k === 'forest') return D.forest[G.forest[m.i]].text + ' This forest place is only open to one worker.';
    if (m.k === 'haven') return 'You can turn spare cards into the resources you are missing.';
    if (m.k === 'journey') return 'Autumn only: the worker scores ' + D.journey[m.i].points + ' points at the end of the game.';
    if (m.k === 'event') { const e = m.e === 'b' ? D.basicEvents[G.bev[m.i].k] : D.specialEvents[G.sev[m.i].k]; return 'You can claim ' + e.name + ' right now, and nobody else can then.'; }
    if (m.k === 'dest') return cname(m.c) + ' is ready: ' + cdef(m.c).text;
  }
  if (m.type === 'play') {
    const c = cdef(m.card); let s = c.name + ' is worth ' + c.pts + ' point' + (c.pts === 1 ? '' : 's') + '. ';
    if (m.how === 'occupy') s += 'It is free: it takes the empty slot on ' + cname(m.via) + ', so you keep your resources. ';
    else if (m.how === 'pay') s += 'You can pay for it now. ';
    else s += 'This way costs you less than paying in full. ';
    if (c.type === 'production') s += 'Production cards pay you every Spring and Autumn.';
    else if (c.type === 'prosperity') s += 'It also scores bonus points at the end.';
    else if (c.type === 'governance') s += 'It helps you for the rest of the game.';
    return s;
  }
  if (m.type === 'choose' && G.q) return 'The computer helper would pick this one.';
  return '';
}
// ---- popup shell
function popHead(title, sub) { return h('div.ph-head', h('div.ph-t', h('b', title), sub ? h('span', sub) : null), h('button.px', { 'data-a': 'popx', type: 'button', 'aria-label': 'Close' }, '×')); }
function closePop() { UI.pop = null; const p = $('#ppop'); if (p) { p.hidden = true; p.innerHTML = ''; } const b = $$('.sel'); b.forEach(x => x.classList.remove('sel')); }
function placePop() {
  const p = $('#ppop'), dock = $('#dock'); if (!p || p.hidden) return;
  const dr = dock.getBoundingClientRect(); let top = 0, bottom = 0;
  const t = UI.pop && UI.pop.trig;
  if (t === 'hand') { const r = $('#handS').getBoundingClientRect(); bottom = Math.max(0, dr.bottom - r.top); }
  else if (t === 'city') { const r = $('#cityS').getBoundingClientRect(); top = Math.max(0, r.bottom - dr.top); }
  p.style.top = top + 'px'; p.style.bottom = bottom + 'px';
}
function setPop(o, build) {
  UI.pop = o; const p = $('#ppop'); p.hidden = false; p.innerHTML = ''; p.setAttribute('data-pop', o.kind);
  build(p); placePop();
  const bd = p.querySelector('.ph-body'); if (bd) bd.scrollTop = 0;
}
function moveBtn(m, inner, cls) {
  UI.pm = UI.pm || []; const i = UI.pm.push(m) - 1; const rec = UI.rec && UI.rec.m && sameM(UI.rec.m, m);
  return h('button.btn.go' + (rec ? '.rec' : '') + (cls ? '.' + cls : ''), { 'data-a': 'do', 'data-mi': i, type: 'button' }, inner, rec ? h('span.star', '★ suggested') : null);
}
function reasonBox(t) { return h('div.why', t); }
// ---- reasons a worker can't go somewhere
function whyNotWorker(kind, i) {
  const a = HB.actor(G), p = G.players[viewSeat() >= 0 ? viewSeat() : 0];
  if (viewSeat() < 0) return 'Only the player holding the device can place workers.';
  if (a !== viewSeat() || G.players[a].ai) return 'It is not your turn yet.';
  if (G.q) return 'Finish the current choice first.';
  if (availW(p) <= 0) return 'All your workers are already out. Prepare for the next season to bring them home.';
  const ws = workersAt(kind, i);
  if (kind === 'basic' && !D.basic[i].shared && ws.length) return 'Taken by ' + pname(ws[0]) + ' (only one worker fits here).';
  if (kind === 'forest' && ws.length >= (G.np === 4 ? 2 : 1)) return 'Full: ' + pname(ws[0]) + ' is already here.';
  if (kind === 'forest' && ws.indexOf(viewSeat()) >= 0) return 'You already have a worker here.';
  if (kind === 'haven' && p.hand.length < 2) return 'You need at least 2 cards in your hand to use this.';
  if (kind === 'journey' && p.season < 3) return 'The Long Road only opens in Autumn (your last season).';
  return 'Not available right now.';
}
function openTile(kind, i) {
  kind = String(kind); i = +i;
  if (/deck|disc/.test(kind)) return openInfo('deck');
  if (kind === 'tree') return openInfo('seasons');
  const v = viewSeat(), mm = myMoves().filter(m => m.type === 'worker');
  UI.pm = [];
  const info = tileInfo(kind, i);
  setPop({ kind: 'tile', k: kind, i, trig: 'board' }, p => {
    const body = h('div.ph-body');
    if (kind === 'journey') {
      p.appendChild(popHead('Place a worker on the Long Road?', 'Autumn only'));
      body.appendChild(h('p', 'Discard cards from your hand equal to the spot number. The worker stays for the rest of the game and scores that many points at the end. A spot with a pawn is taken.'));
      for (let j = 0; j < 4; j++) {
        const jj = D.journey[j], m = mm.find(x => x.k === 'journey' && x.i === j), ws = workersAt('journey', j).length;
        const ws2 = G.players.some(pl => pl.dep.some(d => d.k === 'journey' && d.i === j)) || (G.grim && G.grim.ji === j);
        const lab = h('span', h('b', 'Spot ' + jj.points), ' · discard ' + jj.discard + ' · scores ' + jj.points + (jj.shared ? ' (shared)' : ''));
        if (m) body.appendChild(moveBtn(m, lab));
        else body.appendChild(h('button.btn.go.dis', { disabled: true, type: 'button' }, lab, h('span.sm', ws2 && !jj.shared ? 'taken' : (v >= 0 && G.players[v].season < 3 ? 'autumn only' : 'not enough cards'))));
      }
    } else {
      const nm = info.name;
      const m = mm.find(x => (kind === 'haven' && x.k === 'haven') || ((kind === 'basic' || kind === 'forest') && x.k === kind && x.i === i) || (kind === 'bev' && x.k === 'event' && x.e === 'b' && x.i === i) || (kind === 'sev' && x.k === 'event' && x.e === 's' && x.i === i));
      const isEv = kind === 'bev' || kind === 'sev';
      const evo = isEv ? (kind === 'bev' ? G.bev : G.sev)[i] : null;
      p.appendChild(popHead(isEv ? nm : 'Place a worker here?', isEv ? 'Event' : nm));
      if (!isEv) body.appendChild(h('div.gain', h('b', 'You gain: '), info.text.replace(/ Shared\.$/, '')));
      else {
        body.appendChild(h('p', info.text));
        const need = h('ul.need');
        if (kind === 'bev') { const nd = D.basicEvents[G.bev[i].k].need; for (const c in nd) { const have = v >= 0 ? G.players[v].city.filter(e => cdef(e.id).type === c).length : 0; need.appendChild(h('li' + (have >= nd[c] ? '.y' : '.n'), (have >= nd[c] ? '✓ ' : '✗ ') + nd[c] + ' ' + (HBKit.TYPES[c] ? HBKit.TYPES[c].label : c) + ' cards in your city (you have ' + have + ')')); } }
        else { const sp = D.specialEvents[G.sev[i].k]; for (const k of sp.req) { const has = v >= 0 && G.players[v].city.some(e => cdef(e.id).key === k); need.appendChild(h('li' + (has ? '.y' : '.n'), (has ? '✓ ' : '✗ ') + 'In your city: ' + D.cards.find(c => c.key === k).name)); } if (sp.colors) for (const c in sp.colors) need.appendChild(h('li', 'Needs ' + sp.colors[c] + ' ' + c + ' cards')); }
        body.appendChild(need);
        if (evo.o !== -1 && evo.o != null) body.appendChild(reasonBox('Already claimed by ' + pname(evo.o) + '.'));
        if (kind === 'sev') { const sc = D.specialEvents[G.sev[i].k].score; body.appendChild(h('p.sm', 'Scores at the end of the game. Claiming also costs a free worker.')); }
      }
      const ws = (kind === 'basic' || kind === 'forest' || kind === 'haven') ? workersAt(kind, i) : [];
      if (ws.length) body.appendChild(h('div.occ', 'Workers here: ', ws.map(s => pawn(s, 18)), ' ', ws.map(pname).join(', ')));
      if (kind === 'basic' || kind === 'forest' || kind === 'haven') body.appendChild(h('p.sm', info.shared ? 'Shared place: any number of workers can use it.' : 'Only one worker fits here.'));
      if (m) {
        body.appendChild(moveBtn(m, isEv ? 'Claim it (use a worker)' : 'Place worker'));
        if (UI.rec && sameM(UI.rec.m, m)) body.appendChild(reasonBox(why(m, v)));
      } else if (!(isEv && evo.o !== -1)) body.appendChild(reasonBox(isEv ? (v < 0 ? 'Only the device holder can claim events.' : (G.players[v].dep.length >= G.players[v].workers ? 'You have no free workers.' : 'You do not meet the requirements yet.')) : whyNotWorker(kind, i)));
    }
    p.appendChild(body); body.appendChild(h('button.btn.alt.cancel', { 'data-a': 'popx', type: 'button' }, 'Cancel'));
  });
}
function openInfo(which) {
  setPop({ kind: 'info', trig: 'board' }, p => {
    const body = h('div.ph-body');
    if (which === 'deck') {
      p.appendChild(popHead('Draw pile and discards'));
      body.appendChild(h('div.kv', h('span', 'Draw pile'), h('b', G.deck.length + ' cards')));
      body.appendChild(h('div.kv', h('span', 'Discard pile'), h('b', G.discard.length + ' cards')));
      body.appendChild(h('div.kv', h('span', 'Hand limit'), h('b', '8 cards')));
      body.appendChild(h('div.kv', h('span', 'City limit'), h('b', '15 cards')));
      body.appendChild(h('p.sm', 'Cards you draw come from the pile. When it runs out the discards are shuffled into a new pile.'));
    } else {
      p.appendChild(popHead('Seasons'));
      body.appendChild(h('p.sm', 'Each player moves through the seasons on their own. You may Prepare for the next season only when all your workers are placed.'));
      G.players.forEach((pl, s) => { const nx = pl.season < 3 ? SEASN[pl.season + 1] : null; body.appendChild(h('div.kv', h('span', pawn(s, 16), ' ' + pl.name), h('b', HBKit.season(SEAS[pl.season], 20), ' ' + SEASN[pl.season] + ' · ' + pl.workers + ' workers'))); });
      body.appendChild(h('div.tree', HBKit.evertree({ w: 150, season: SEAS[Math.max(0, focusSeat() >= 0 ? G.players[focusSeat()].season : 0)] })));
    }
    p.appendChild(body); body.appendChild(h('button.btn.alt.cancel', { 'data-a': 'popx', type: 'button' }, 'Close'));
  });
}
// ---- card pop-up: src = 'meadow' | 'hand' | 'city'
function missingText(cost, res) { const a = []; for (const r of RESK) { const d = (cost[r] || 0) - res[r]; if (d > 0) a.push(d + ' more ' + rname(r, d)); } return a.join(', '); }
function whyNotPlay(id, from) {
  const v = viewSeat(); if (v < 0) return 'Only the player holding the device can play cards.';
  const p = G.players[v], c = cdef(id);
  if (HB.actor(G) !== v || G.players[HB.actor(G)].ai) return 'It is not your turn yet.';
  if (G.q) return 'Finish the current choice first.';
  if (c.unique && p.city.some(e => cdef(e.id).key === c.key)) return 'You already have this unique card in your city.';
  if (HB.cityCount(G, v) >= 15 && c.key !== 'wanderer') return 'Your city is full (15 cards).';
  if (c.key === 'ruins') return 'Old ruins need a construction in your city to raze.';
  const miss = missingText(c.cost, p.res);
  if (miss) return 'You cannot pay yet: you need ' + miss + '.' + (c.kind === 'critter' ? ' (A free occupy needs your ' + (D.cards.find(x => x.key === c.linked) || { name: 'matching construction' }).name + ' with no token on it.)' : '');
  return 'You cannot play this right now.';
}
function howLabel(m) {
  switch (m.how) {
    case 'pay': return [h('b', 'Pay'), costEl(cdef(m.card).cost, 18)];
    case 'occupy': return [h('b', 'Play it free'), h('span.sm', 'occupies ' + cname(m.via))];
    case 'innkeeper': return [h('b', 'Send away ' + cname(m.via)), h('span.sm', 'cuts 3 berries off the price')];
    case 'crane': return [h('b', 'Dismantle ' + cname(m.via)), h('span.sm', 'cuts 3 resources off the price')];
    case 'dungeon': return [h('b', 'Use ' + (D.cards.find(x => x.key === 'dungeon') || { name: 'the cells' }).name), h('span.sm', 'lock a critter below it, cut 3 resources')];
    case 'judge': return [h('b', 'Swap one resource'), h('span.sm', 'the Gavel Marten lets you pay with another kind')];
  }
  return [h('b', 'Play')];
}
function openCard(src, id, seat, slot, trig) {
  id = +id; const v = viewSeat(); UI.pm = [];
  const c = cdef(id);
  setPop({ kind: 'card', src, id, trig: trig || (src === 'meadow' ? 'board' : src === 'hand' ? 'hand' : 'city') }, p => {
    p.appendChild(popHead(c.name, TYPEN[c.type] + ' · ' + (c.kind === 'critter' ? 'Critter' : 'Construction') + ' · ' + (c.unique ? 'Unique' : 'Common')));
    const body = h('div.ph-body');
    const w = isPh() ? 104 : 150;
    const ent = src === 'city' ? G.players[seat].city.find(e => e.id === id) : null;
    const left = h('div.cardbox', cardEl(id, w, { entry: ent }));
    const right = h('div.cinfo', h('div.cc', h('b', 'Cost '), costEl(c.cost, 16), h('b', ' · ' + c.pts + ' pt')), h('p.ct', c.text), h('p.sm', TYPEHELP[c.type]));
    if (c.kind === 'critter') { const lk = D.cards.find(x => x.key === c.linked); right.appendChild(h('p.sm', 'Free if you own ' + (c.linked === 'any' ? 'the Ever Tree' : lk ? lk.name : '?') + ' with no token on it.')); }
    if (ent) { const l = []; if (ent.occ) l.push('occupied'); if (ent.tok) l.push(ent.tok + ' point token(s)'); if (ent.pris && ent.pris.length) l.push(ent.pris.length + ' prisoner(s)'); if (ent.w) l.push(ent.w + ' worker(s) inside'); if (ent.stock) l.push('stock ' + costText(ent.stock)); if (l.length) right.appendChild(h('p.sm', l.join(', '))); }
    const cw = h('div.cwrap', left, right);
    const acts = h('div.pacts');
    if (src === 'city') {
      const mm = myMoves().filter(m => m.type === 'worker' && m.k === 'dest' && m.c === id);
      if (cdef(id).color === 'red' || cdef(id).key === 'storehouse') {
        if (mm.length) { acts.appendChild(moveBtn(mm[0], seat === v ? 'Place a worker here' : 'Visit with a worker')); if (UI.rec && sameM(UI.rec.m, mm[0])) acts.appendChild(reasonBox(why(mm[0], v))); }
        else acts.appendChild(reasonBox(seat === v ? (HB.actor(G) !== v ? 'Not your turn.' : 'A worker cannot go here now (it may be full, or its condition is not met).') : 'Only Open destinations can be visited in a rival city.'));
      } else acts.appendChild(h('p.sm', 'This card works by itself; no worker is needed.'));
    } else {
      const mm = myMoves().filter(m => m.type === 'play' && m.card === id && m.from === src);
      if (mm.length) { mm.forEach(m => acts.appendChild(moveBtn(m, howLabel(m)))); const rm = UI.rec && UI.rec.m; if (rm && mm.some(m => sameM(m, rm))) acts.appendChild(reasonBox(why(rm, v))); }
      else acts.appendChild(reasonBox(whyNotPlay(id, src)));
    }
    body.appendChild(acts); body.appendChild(cw); body.appendChild(h('div.pacts2', h('button.btn.alt', { 'data-a': 'refcard', 'data-id': id, type: 'button' }, 'Read it big'), h('button.btn.alt.cancel', { 'data-a': 'popx', type: 'button' }, 'Close')));
    p.appendChild(body);
  });
}
// ---- prepare / pass / hint
function openPrep() {
  const v = viewSeat(), m = movesFor(v).find(x => x.type === 'prepare'); if (!m) return; UI.pm = [];
  const p = G.players[v], nx = p.season + 1;
  setPop({ kind: 'prep', trig: 'other' }, pp => {
    pp.appendChild(popHead('Prepare for ' + SEASN[nx], 'Season change'));
    const body = h('div.ph-body');
    body.appendChild(h('div.seasonrow', HBKit.season(SEAS[p.season], 34), h('span', '→'), HBKit.season(SEAS[nx], 44)));
    const ul = h('ul.need');
    ul.appendChild(h('li', 'Your ' + p.dep.filter(d => !d.perm).length + ' placed workers come home (workers on the Long Road, Abbey and Rest stay).'));
    ul.appendChild(h('li', 'You get ' + [1, 1, 2][p.season] + ' new worker' + ([1, 1, 2][p.season] > 1 ? 's' : '') + ' (' + (p.workers + [1, 1, 2][p.season]) + ' in total).'));
    ul.appendChild(h('li', nx === 2 ? 'Take up to 2 cards from the meadow.' : 'All your green Production cards gather their goods, in any order you like.'));
    if (nx === 3) ul.appendChild(h('li', 'Autumn is the last season. The Long Road opens.'));
    body.appendChild(ul); body.appendChild(moveBtn(m, 'Prepare for ' + SEASN[nx]));
    if (UI.rec && sameM(UI.rec.m, m)) body.appendChild(reasonBox(why(m, v)));
    body.appendChild(h('button.btn.alt.cancel', { 'data-a': 'popx', type: 'button' }, 'Not yet'));
    pp.appendChild(body);
  });
}
function openPass() {
  const v = viewSeat(), m = movesFor(v).find(x => x.type === 'pass'); if (!m) return; UI.pm = [];
  setPop({ kind: 'pass', trig: 'other' }, pp => {
    pp.appendChild(popHead('Pass for the rest of the game?'));
    const body = h('div.ph-body');
    body.appendChild(h('p', 'You will take no more turns. Your workers stay where they are and your city is scored when everyone has passed. ' + (G.players[v].season < 3 ? 'You have not reached Autumn yet: you may be giving up turns you could use.' : '')));
    body.appendChild(moveBtn(m, 'Yes, I am done'));
    if (UI.rec && sameM(UI.rec.m, m)) body.appendChild(reasonBox(why(m, v)));
    body.appendChild(h('button.btn.alt.cancel', { 'data-a': 'popx', type: 'button' }, 'Keep playing'));
    pp.appendChild(body);
  });
}
function openHint() {
  const v = viewSeat(); computeRec(true); const m = UI.rec && UI.rec.m; UI.pm = [];
  setPop({ kind: 'hint', trig: 'other' }, pp => {
    pp.appendChild(popHead('Suggestion'));
    const body = h('div.ph-body');
    if (!m) body.appendChild(h('p', 'No suggestion right now.'));
    else {
      body.appendChild(h('div.gain', h('b', m.label || 'Move')));
      body.appendChild(reasonBox(why(m, v)));
      body.appendChild(moveBtn(m, 'Do it'));
      // highlight on the board
      renderBoard(); renderDock();
    }
    body.appendChild(h('button.btn.alt.cancel', { 'data-a': 'popx', type: 'button' }, 'Close'));
    pp.appendChild(body);
  });
}
// ---- pending decision card (one at a time)
function qHint(k) {
  return ({ discard: 'Tap a card to discard it. Tap Done when you have finished.', resource: 'Pick the resource you want.', meadow: 'Tap a card to take it.', production: 'Production cards run one after another. Pick the next one.', ruins: 'The razed card goes away and you get its cost back.', recipient: 'Pick which rival receives it.', give: 'Pick what to give.', stack: 'How many to place?', trigger: 'Several effects fired at once. Choose the order.', queen: 'The Queen plays a cheap card for free.', inn: 'The Inn plays a meadow card for 3 fewer resources.', university: 'The University disbands one of your cards and refunds it.', cemetery: 'Reveal cards from the pile, then play one for free.', copy: 'Pick which location to copy.' })[k] || '';
}
function renderQ() {
  const pc = $('#pc');
  if (!G || G.phase === 'over' || !G.q || UI.cards.length) { if (!UI.cards.length) { pc.hidden = true; pc.innerHTML = ''; } return; }
  const q = G.q, v = viewSeat();
  if (q.who !== v || G.players[q.who].ai) { pc.hidden = true; return; }
  closePop();
  pc.hidden = false; pc.innerHTML = ''; pc.setAttribute('data-card', 'q'); pc.setAttribute('data-kind', q.kind);
  pc.appendChild(h('div.ph-head', h('div.ph-t', h('b', q.title), h('span', qHint(q.kind) || 'Your choice')), GX.undo.can() ? h('button.btn.alt.undo', { 'data-a': 'undo', type: 'button', 'aria-label': 'Undo my last step' }, '↶ Undo') : null));
  const body = h('div.ph-body.qbody');
  const rm = UI.rec && UI.rec.m && UI.rec.m.type === 'choose' ? UI.rec.m : null;
  const hasCards = q.opts.some(o => o.card !== undefined), hasRes = q.opts.some(o => o.res !== undefined);
  const grid = h('div.qgrid' + (hasCards ? '.cards' : '') + (hasRes ? '.res' : ''));
  q.opts.forEach((o, i) => {
    let b;
    const star = rm && rm.i === i;
    if (o.card !== undefined) b = h('button.qo.qcard' + (star ? '.rec' : ''), { 'data-a': 'q', 'data-i': i, type: 'button' }, cardEl(o.card, isPh() ? 56 : 70), h('span.ql', o.label));
    else if (o.res !== undefined) b = h('button.qo.qres' + (star ? '.rec' : ''), { 'data-a': 'q', 'data-i': i, type: 'button' }, ic(o.res, 30), h('span.ql', o.label));
    else b = h('button.qo.qtext' + (star ? '.rec' : ''), { 'data-a': 'q', 'data-i': i, type: 'button' }, h('span.ql', o.label));
    if (star) b.appendChild(h('span.star', '★'));
    grid.appendChild(b);
  });
  body.appendChild(grid);
  if (rm) body.appendChild(h('p.sm', '★ = what the computer helper would choose.'));
  pc.appendChild(body);
}
// ===================== part 5: game flow (new game, turn driver, AI, one-card-at-a-time queue, save/load) =====================
const SAVEKEY = 'hb_save1';
function toast(t) { const e = $('#toast'); if (!e) return; e.textContent = t; e.classList.add('on'); clearTimeout(UI.tt); UI.tt = setTimeout(() => e.classList.remove('on'), 2600); }
function setSeed(n) { UI.seed = n >>> 0; }
function setAiSeed(n) { UI.aiSeed = n; }
const DEF = { np: 2, level: 'normal', solo: 1 };
function newGame(mode, o) {
  mode = mode || 'vs'; o = Object.assign({}, UI.opt || DEF, o || {});
  const cfg = { mode, np: o.np || 2, level: o.level || 'normal', solo: o.solo || 1, names: o.names };
  let players, solo = null;
  if (mode === 'solo') { players = [{ name: 'You', ai: null }]; solo = { difficulty: cfg.solo }; }
  else if (mode === 'guided') { players = [{ name: 'You', ai: null }, { name: PNAMES[0], ai: 'easy' }]; }
  else if (mode === 'hot') { players = []; for (let i = 0; i < cfg.np; i++) players.push({ name: (cfg.names && cfg.names[i]) || 'Player ' + (i + 1), ai: null }); }
  else if (mode === 'net') { players = o.players; }
  else if (mode === 'ai') { players = []; for (let i = 0; i < cfg.np; i++) players.push({ name: PNAMES[i], ai: cfg.level }); if (cfg.np < 2) players.push({ name: PNAMES[1], ai: cfg.level }); }
  else { players = [{ name: 'You', ai: null }]; for (let i = 1; i < cfg.np; i++) players.push({ name: PNAMES[i - 1], ai: (o.levels && o.levels[i - 1]) || cfg.level }); }
  G = HB.newGame({ players, solo, seed: UI.seed != null ? UI.seed : undefined });
  UI.seed = null;
  UI.mode = mode; UI.cfg = cfg; UI.cards = []; UI.after = []; UI.rec = null; UI.recKey = ''; UI.pop = null; UI.over = null; UI.overShown = false; UI.lastAi = ''; UI.started = true; UI.focus = 0;
  UI.holder = hotSeat() ? -1 : -1;
  UI.coach = { level: UI.coach && UI.coach.level || 'full', seen: {} };
  if (mode !== 'guided') UI.coachOn = false; else UI.coachOn = true;
  const st = $('#start'); if (st) st.hidden = true;
  closePop(); try { GX.close(); } catch (e) { }
  kitNewGame();
  render(); schedule();
  return G;
}
function kitNewGame() { GX.undo.clear(); recapSeats(); UI.t0 = Date.now(); UI.resultDone = false; UI.earned = null; }
function render() {
  if (!G || !UI.started) return;
  { const v = viewSeat(); if (v >= 0) GX.recap.view(v); }
  try { if (window.PerfHUD) PerfHUD.wake(); } catch (e) { }
  renderBoard(); renderDock(); renderQ(); renderCard(); placePop(); markSel(); renderDrawers();
  if (NET.on) netRenderHook();
}
function markSel() {
  $$('.sel').forEach(x => x.classList.remove('sel')); const p = UI.pop; if (!p) return;
  let e = null;
  if (p.kind === 'tile') e = $(`.tile[data-k="${p.k}"][data-i="${p.i}"]`);
  else if (p.kind === 'card' && p.src === 'meadow') e = $$('.mc').find(x => G.meadow[+x.dataset.i] === p.id);
  else if (p.kind === 'card') e = $(`.sc[data-id="${p.id}"]`);
  if (e) e.classList.add('sel');
}
// ---- one-card-at-a-time queue
function pushCard(c) { UI.cards.push(c); closePop(); render(); }
function renderCard() {
  const pc = $('#pc');
  if (!UI.cards.length) { if (!(G && G.q && !G.players[G.q.who].ai && G.q.who === viewSeat() && G.phase !== 'over')) { pc.hidden = true; pc.innerHTML = ''; pc.removeAttribute('data-card'); } return; }
  const c = UI.cards[0]; pc.hidden = false; pc.innerHTML = ''; pc.setAttribute('data-card', c.kind); pc.removeAttribute('data-kind');
  pc.appendChild(h('div.ph-head', h('div.ph-t', h('b', c.title), c.sub ? h('span', c.sub) : null)));
  const body = h('div.ph-body'); const b = typeof c.body === 'function' ? c.body() : c.body; add(body, b);
  const btns = h('div.cbtns');
  (c.buttons || [{ label: 'Continue', a: 'cont' }]).forEach(x => btns.appendChild(h('button.btn.go' + (x.cls ? '.' + x.cls : ''), Object.assign({ 'data-a': x.a, type: 'button' }, x.at || {}), x.label)));
  body.appendChild(btns); pc.appendChild(body);
}
function nextCard() { const c = UI.cards.shift(); if (c && c.onDone) c.onDone(); render(); schedule(); }
function takeDevice() { const c = UI.cards.shift(); UI.holder = c && c.seat != null ? c.seat : HB.actor(G); render(); schedule(); }
// ---- driver
function schedule() {
  clearTimeout(UI.tm); clearTimeout(UI.tr); UI.tm = 0;
  if (!G || !UI.started || (UI.cards.length && !NET.on)) return;
  if (G.phase === 'over') { if (!UI.overShown) { UI.overShown = true; queueOver(); const w = G.over; snd(G.grim ? (w.win ? 'fanfare' : 'lose') : 'fanfare', { duck: true }); sndMusic(); } return; }
  const a = HB.actor(G), p = G.players[a], hs = humans();
  if (UI.after.length && hs.length && !(G.q && !G.players[G.q.who].ai)) { if (flushAfter()) return; }
  if (p.ai) { if (!isClient()) UI.tm = setTimeout(aiStep, ANIM ? AIDELAY : 0); return; }
  if (hotSeat() && UI.holder !== a) {
    UI.holder = -1; closePop(); render();
    pushCard({ kind: 'pass', seat: a, title: 'Pass the device to ' + p.name, sub: 'Hidden information', body: h('p', p.name + ', take the device. Nobody else should look at the screen. Your hand and resources appear when you tap the button.'), buttons: [{ label: "I am " + p.name, a: 'take' }] });
    return;
  }
  if (UI.coachOn && coachCheck()) return;
  if (UI.turnSnd !== G.turn + ':' + a && (!NET.on || a === viewSeat())) { UI.turnSnd = G.turn + ':' + a; snd('turn', { vol: .6 }); GX.buzz(15); }
  if (!UI.noRec) UI.tr = setTimeout(() => { if (!G || G.phase === 'over') return; const had = UI.rec; computeRec(); if (UI.rec !== had) { renderBoard(); renderDock(); if (G.q) renderQ(); markSel(); } }, 40);
}
function aiStep() {
  UI.tm = 0; if (isClient() || !G || G.phase === 'over' || (UI.cards.length && !NET.on)) return;
  const a = HB.actor(G); if (a < 0) return; const p = G.players[a]; if (!p.ai) { schedule(); return; }
  const n0 = G.logN; let m;
  try { m = HB.AI.choose(G, a); } catch (e) { m = HB.moves(G, a)[0]; console.error('AI error', e); }
  const pre = sndPre();
  let r = HB.apply(G, m);
  if (r.ok) sndPost(pre, m, a);
  if (!r.ok) { const ms = HB.moves(G, a); r = HB.apply(G, ms[0]); }
  const ls = logSince(n0); UI.lastAi = ls.length ? ls[0].replace(/^[^ ]+ /, '') : '';
  GX.recap.push(ls, a);
  afterMove();
}
function afterMove() { save(); render(); sndMusic(); schedule(); if (NET.on) netPush(); }
function act(m) {
  if (!G || !m) return; const a = HB.actor(G);
  if (isClient()) { netAct(m); return; }
  if (NET.on && a !== NET.mySeat) return;
  const n0 = G.logN;
  if (m.type === 'prepare' && !NET.on) UI.after.push({ kind: 'season', seat: a, from: n0 });
  const pre = sndPre();
  if (!G.players[a].ai) GX.undo.snap(m.label || m.type);
  const r = HB.apply(G, m);
  closePop(); UI.rec = null;
  if (r.ok) sndPost(pre, m, a);
  if (!r.ok) { snd('error'); UI.after.pop(); GX.undo.drop(); toast(r.error || 'That move is not allowed.'); render(); return; }
  GX.undo.check(revealed); GX.recap.mark(a); GX.recap.push(logSince(n0), a);
  UI.lastAi = ''; afterMove();
}
function choose(i) { const a = HB.actor(G); const m = movesFor(a).find(x => x.type === 'choose' && x.i === i); if (m) act(m); }
function flushAfter() {
  const e = UI.after.shift(); if (!e) return false;
  const lines = G.log.filter(x => x.i > e.from).map(x => x.t).slice(-14);
  const p = G.players[e.seat];
  const s = p.season;
  pushCard({ kind: 'season', title: SEASN[s] + ' has come', sub: p.name + ' prepared for ' + SEASN[s], body: () => h('div', h('div.seasonrow', HBKit.season(SEAS[s], 56)), h('ul.need', lines.map(t => h('li', t)))), });
  return true;
}
// ---- end of game: one card per player, then the result
function queueOver() {
  const ov = G.over; if (!ov) return;
  GX.undo.clear(); kitResult();
  const rows = (sc, name, s) => {
    const l = [['Printed card points', sc.cards], ['Point tokens', sc.tokens], ['Prosperity bonuses', sc.bonus], ['Events', sc.events], ['The Long Road', sc.journey]];
    const t = h('div.score');
    l.forEach(([k, v]) => t.appendChild(h('div.kv', h('span', k), h('b', v))));
    if (sc.detail && sc.detail.length) t.appendChild(h('p.sm', 'Bonuses: ' + sc.detail.map(d => cname(d.card) + ' +' + d.bonus).join(', ')));
    t.appendChild(h('div.kv.tot', h('span', 'Total'), h('b', sc.total)));
    return t;
  };
  G.players.forEach((p, s) => UI.cards.push({ kind: 'over-score', title: 'Final score: ' + p.name, sub: p.ai ? 'Computer player' : 'Player', body: () => h('div', h('div.seasonrow', pawn(s, 40)), rows(ov.scores[s], p.name, s), h('p.sm', p.workers + ' workers, ' + HB.cityCount(G, s) + ' cards in the city, ' + ov.scores[s].left + ' resources left.')) }));
  if (G.grim) UI.cards.push({ kind: 'over-score', title: 'Final score: ' + D.soloName, sub: 'Your solo rival', body: () => { const g = ov.grim, t = h('div.score'); [['Cards', g.cardPts], ['Events', g.basic + g.special], ['The Long Road', g.journey], ['Point tokens', g.tokens]].forEach(([k, v]) => t.appendChild(h('div.kv', h('span', k), h('b', v)))); t.appendChild(h('div.kv.tot', h('span', 'Total'), h('b', g.total))); return t; } });
  const order = G.players.map((p, i) => i).sort((a, b) => ov.scores[b].total - ov.scores[a].total);
  UI.cards.push({
    kind: 'over', title: G.grim ? (ov.win ? 'You beat ' + D.soloName + '!' : D.soloName + ' wins this time') : (ov.tie ? 'A tie at the top' : G.players[ov.winner].name + (G.players[ov.winner].name === 'You' ? ' win!' : ' wins!')), sub: 'The game is over',
    body: () => { const t = h('div.score'); order.forEach((s, k) => t.appendChild(h('div.kv' + (k === 0 && !G.grim ? '.tot' : ''), h('span', (k + 1) + '. ', pawn(s, 16), ' ' + G.players[s].name), h('b', ov.scores[s].total + ' pts')))); if (G.grim) t.appendChild(h('div.kv', h('span', D.soloName), h('b', ov.grim.total + ' pts'))); if (ov.tie) t.appendChild(h('p.sm', 'Tie-breaks (events, then leftover resources) could not separate them.')); if (UI.earned && UI.earned.length) t.appendChild(h('p.achv', '★ New achievement' + (UI.earned.length > 1 ? 's' : '') + ': ' + UI.earned.join(', '))); return t; },
    buttons: NET.on ? netOverButtons() : [{ label: 'Play again', a: 'again' }, { label: 'Look at the board', a: 'cont', cls: 'alt' }, { label: 'Main menu', a: 'menu', cls: 'alt' }]
  });
  clearSave(); render();
}
// ---- save / load
function save() { try { if (!G || G.phase === 'over' || NET.on) return; localStorage.setItem(SAVEKEY, JSON.stringify({ G, mode: UI.mode, cfg: UI.cfg, coach: UI.coach, coachOn: UI.coachOn, holder: -1 })); if (!UI.savedFlag) { UI.savedFlag = 1; GNS.saved(GAME_ID, true); } } catch (e) { } }
function clearSave() { try { localStorage.removeItem(SAVEKEY); UI.savedFlag = 0; GNS.saved(GAME_ID, false); } catch (e) { } }
function hasSave() { try { return !!localStorage.getItem(SAVEKEY); } catch (e) { return false; } }
function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVEKEY)); if (!s || !s.G) return false;
    G = s.G; UI.mode = s.mode; UI.cfg = s.cfg; UI.coach = s.coach || { level: 'full', seen: {} }; UI.coachOn = !!s.coachOn;
    UI.cards = []; UI.after = []; UI.rec = null; UI.recKey = ''; UI.pop = null; UI.overShown = false; UI.started = true; UI.holder = -1; UI.lastAi = ''; UI.focus = 0;
    const st = $('#start'); if (st) st.hidden = true; try { GX.close(); } catch (e) { }
    kitNewGame();
    render(); schedule(); return true;
  } catch (e) { return false; }
}
// ===================== part 6: coach, drawers (log, rules, menu, rivals), start screen, events, phone mode, boot =====================
const COACH = [
  { id: 'welcome', light: 1, t: 'Welcome to Hollowbough', x: 'You lead a small band of woodland creatures. Over the game you build a city of up to 15 cards and send workers out to gather. When everyone has finished, the city with the most points wins.' },
  { id: 'turn', light: 1, t: 'One thing per turn', x: 'On your turn you do exactly one thing: place a worker on a location, play a card, or Prepare for the next season. You start with 2 workers.' },
  { id: 'board', t: 'The shared board', x: 'The glowing places are open to you. Tap one to see what it gives, then place a worker. Most places hold only one worker, so the good ones can be taken before your next turn.', when: (p, v) => myMoves().some(m => m.type === 'worker') },
  { id: 'cards', t: 'Cards', x: 'Tap a card in your hand, or one of the eight in the meadow on the board, to see its price. Pay with resources, or play a critter free when you already own its matching building (it is named on the card).', when: (p) => p.dep.length > 0 && p.hand.length > 0 },
  { id: 'occupy', t: 'A free card', x: 'One of your critters can be played for free: it moves into its matching building and uses up that building’s one free slot. Look for the button that says "Play it free".', when: (p, v) => myMoves().some(m => m.type === 'play' && m.how === 'occupy') },
  { id: 'prepare', light: 1, t: 'Out of workers? Prepare', x: 'When all your workers are out, Prepare for the next season: they come home, you gain new workers, and green Production cards gather goods. Each player moves through the seasons on their own.', when: (p, v) => myMoves().some(m => m.type === 'prepare') },
  { id: 'season', t: 'Production time', x: 'In Spring and Autumn all your green Production cards pay out. That is why building them early pays off.', when: (p) => p.season >= 1 },
  { id: 'autumn', t: 'Autumn: the last season', x: 'After Autumn there are no more seasons. Use the rest of your workers and cards, and try for events or the Long Road. Pass when nothing useful remains.', when: (p) => p.season >= 3 },
  { id: 'event', t: 'Events', x: 'The small flags and stars are events. Meet the requirement with the cards in your city and a worker claims it for bonus points. Each event can only be claimed once.', when: (p, v) => myMoves().some(m => m.type === 'worker' && m.k === 'event') },
  { id: 'pass', light: 1, t: 'Passing', x: 'When you have nothing worthwhile left, press Pass. Your city is scored when everybody has passed. Your Hint button always shows a good move and why.', when: (p) => p.season >= 3 && availW(p) === 0 }
];
function coachCheck() {
  const lv = UI.coach.level; if (lv === 'off') return false;
  const v = viewSeat(); if (v < 0 || HB.actor(G) !== v) return false;
  const p = G.players[v]; if (G.q) { if (!UI.coach.seen.decision && lv === 'full') { UI.coach.seen.decision = 1; pushCard({ kind: 'coach', title: 'A choice for you', sub: 'Guide', body: h('p', 'Some cards and places ask you to choose. A decision appears here one at a time. The star marks what the computer helper would pick.') }); return true; } return false; }
  for (const c of COACH) {
    if (UI.coach.seen[c.id]) continue; if (lv === 'light' && !c.light) continue;
    if (c.when && !c.when(p, v)) continue;
    UI.coach.seen[c.id] = 1;
    pushCard({ kind: 'coach', title: c.t, sub: 'Guide', body: h('p', c.x), buttons: [{ label: 'Got it', a: 'cont' }] });
    return true;
  }
  return false;
}
// ---- drawers
const RULES = `<h3>The goal</h3><p>Build the best woodland city. Each player has a city of up to 15 cards and a few workers. When every player has passed, you add up points from cards, point tokens, bonuses, events and the Long Road. The highest total wins.</p>
<h3>How a turn goes</h3><p>On your turn do exactly <b>one</b> of these:</p><ul><li><b>Place a worker</b> on an open place and use it at once.</li><li><b>Play a card</b> from your hand or from the meadow by paying its price.</li><li><b>Prepare for the next season</b> (only when all your workers are out).</li></ul><p>When you cannot or do not want to do anything useful, <b>Pass</b>. You take no more turns, but your city still scores.</p>
<h3>Places for workers</h3><ul><li><b>Brown places</b> give resources, cards or a point token. Some are shared, others take one worker only.</li><li><b>Forest places</b> (green) are special and take one worker (two players can share in a four-player game).</li><li><b>The Barter Burrow</b> turns spare cards into resources: 1 resource for every 2 cards you discard.</li><li><b>The Long Road</b> opens in Autumn. Discard cards equal to the spot (5, 4, 3 or 2); the worker stays and scores that many points.</li><li><b>Destinations</b> are red cards in your city. A worker on one uses its power. A few are Open, so rivals may visit them too (the owner gets a point token).</li><li><b>Events</b> are claimed with a worker when your city meets their requirement. Each can be claimed only once.</li></ul>
<h3>Playing cards</h3><p>Pay the price in resources: twigs, resin, pebbles and berries. You can play from the eight-card meadow as well as from your hand. Your hand holds 8 cards at most. A <b>unique</b> card can be in your city once; a common card as often as you like.</p><p><b>Playing free:</b> each critter is paired with one building. If you own that building and it has no token, you can play the critter free and put a token on the building. Each building can do this once, ever.</p><p>Some cards (Lantern Rest, Pulley Lift, Thornhold Cells, Gavel Marten, Hostler Hedgehog) change the price. They are offered as extra buttons when you play a card.</p>
<h3>Card colours</h3><ul><li><b>Tan, Traveler:</b> acts once when played.</li><li><b>Green, Production:</b> acts when played and again every Spring and Autumn.</li><li><b>Red, Destination:</b> a place for your workers.</li><li><b>Blue, Governance:</b> a lasting bonus or discount.</li><li><b>Purple, Prosperity:</b> extra points at the end.</li></ul>
<h3>Seasons</h3><p>Everyone starts in Winter with 2 workers. Preparing for <b>Spring</b> gives +1 worker and runs your production. <b>Summer</b> gives +1 worker and lets you take 2 meadow cards. <b>Autumn</b> gives +2 workers and runs production again. Every player moves through the seasons at their own pace.</p>
<h3>Scoring</h3><p>Printed points on your cards, point tokens you hold, purple card bonuses, events and Long Road workers. Ties go to the player with more events, then more leftover resources.</p>
<h3>Solo play</h3><p>You play against Old Grimbeard. He takes places and cards by dice and a fixed routine. You win if you end with strictly more points than he does. Choose Grumpy, Gruff or Ghastly for the difficulty.</p>
<h3>Tips</h3><ul><li>Build production early; it pays every Spring and Autumn.</li><li>Keep cards in hand cheap to play. Watch the meadow too.</li><li>Press Hint any time to see a good move and the reason for it.</li></ul>`;
function logHTML() { const e = h('div.logl'); for (let i = G.log.length - 1; i >= Math.max(0, G.log.length - 150); i--) e.appendChild(h('div.ll', h('span.lt', G.log[i].turn), ' ' + G.log[i].t)); return e; }
function renderRival(seat) {
  const b = $('#rivalbody'); if (!b || !G) return; b.innerHTML = ''; seat = seat == null ? (UI.rseat != null ? UI.rseat : 0) : seat; UI.rseat = seat;
  const tabs = h('div.rtabs'); for (let s = 0; s < G.np; s++) tabs.appendChild(h('button.btn' + (s === seat ? '.on' : '.alt'), { 'data-a': 'rtab', 'data-seat': s, type: 'button' }, pawn(s, 14), ' ' + G.players[s].name));
  if (G.grim) tabs.appendChild(h('button.btn' + (seat === 'G' ? '.on' : '.alt'), { 'data-a': 'rtab', 'data-seat': 'G', type: 'button' }, D.soloName));
  b.appendChild(tabs);
  if (seat === 'G') {
    const g = HB.grimScore(G); b.appendChild(h('div.kv', h('span', 'Points so far'), h('b', g.total)));
    b.appendChild(h('p.sm', D.soloName + ' plays a card from the meadow chosen by a die every turn. His city:'));
    G.grim.city.forEach(id => b.appendChild(rowCard(id)));
    return;
  }
  const p = G.players[seat], sc = score(seat);
  b.appendChild(h('div.rhead', pawn(seat, 28), h('div', h('b', p.name), h('div.sm', (p.ai ? 'Computer (' + p.ai + ')' : 'Player') + ' · ' + SEASN[p.season] + (p.passed ? ' · passed' : '')))));
  b.appendChild(h('div.kv', h('span', 'Points so far'), h('b', sc.total)));
  b.appendChild(h('div.kv', h('span', 'Workers'), h('b', availW(p) + ' free of ' + p.workers)));
  b.appendChild(h('div.kv', h('span', 'Cards in hand'), h('b', p.hand.length)));
  const rr = h('div.rrow'); RESK.forEach(k => rr.appendChild(h('span.rs', ic(k, 20), h('b', p.res[k])))); rr.appendChild(h('span.rs', ic('point', 20), h('b', p.pts))); b.appendChild(rr);
  const evs = []; G.bev.forEach(e => { if (e.o === seat) evs.push(D.basicEvents[e.k].name); }); G.sev.forEach(e => { if (e.o === seat) evs.push(D.specialEvents[e.k].name); });
  b.appendChild(h('div.kv', h('span', 'Events'), h('b.l', evs.join(', ') || 'none')));
  b.appendChild(h('h4', 'City (' + HB.cityCount(G, seat) + '/15)'));
  p.city.forEach(e => b.appendChild(rowCard(e.id, e)));
  if (!p.city.length) b.appendChild(h('p.sm', 'Empty so far.'));
}
function rowCard(id, e) {
  const c = cdef(id); const bits = []; if (e) { if (e.occ) bits.push('occupied'); if (e.tok) bits.push(e.tok + ' tokens'); if (e.w) bits.push(e.w + ' workers'); if (e.pris && e.pris.length) bits.push(e.pris.length + ' prisoners'); }
  return h('div.rc', cardEl(id, 54, { entry: e }), h('div', h('b', c.name), h('div.sm', TYPEN[c.type] + ' · ' + c.pts + ' pt' + (bits.length ? ' · ' + bits.join(', ') : '')), h('div.sm', c.text)));
}
function renderDrawers() {
  if (!GX.open || !G) return;
  if (GX.open === 'logd') { const b = $('#logbody'); b.innerHTML = ''; b.appendChild(logHTML()); }
  if (GX.open === 'rivald') renderRival();
}
// ---- start screen
function renderStart() {
  const s = $('#start'); s.hidden = false; s.innerHTML = '';
  if (NET.on) { netStartScreen(s); return; }
  const o = UI.opt = UI.opt || Object.assign({}, DEF);
  const seg = (l, key, vals, fmt) => h('div.seg', h('span.lbl', l), vals.map(v => h('button.chipb' + (o[key] === v ? '.on' : ''), { 'data-a': 'opt', 'data-k': key, 'data-v': v, type: 'button' }, fmt ? fmt(v) : v)));
  const card = h('div.scard',
    h('h1', h('span', { html: ICO.tree }), 'Hollowbough'),
    h('p.tag', 'Build a woodland city. Place workers, play cards, outlast the winter.'),
    h('button.sbtn.big', { 'data-start': 'guided', 'data-a': 'guided', type: 'button' }, h('b', 'Guided first game'), h('span', 'You and one gentle computer player; tips appear one at a time.')),
    h('div.opts', seg('Players', 'np', [2, 3, 4]), seg('Computer level', 'level', ['easy', 'normal', 'hard']), seg('Solo rival', 'solo', [1, 2, 3], v => D.soloLevels[v - 1] + (v > 1 ? '*' : ''))),
    h('p.sm', '*Gruff and Ghastly are very hard.'),
    h('div.sgrid',
      h('button.sbtn', { 'data-start': 'vs', 'data-a': 'start', 'data-m': 'vs', type: 'button' }, h('b', 'Play vs computer'), h('span', 'You against 1 to 3 computer players')),
      h('button.sbtn', { 'data-start': 'solo', 'data-a': 'start', 'data-m': 'solo', type: 'button' }, h('b', 'Solo vs ' + D.soloName), h('span', 'Beat the automated rival')),
      h('button.sbtn', { 'data-start': 'hot', 'data-a': 'start', 'data-m': 'hot', type: 'button' }, h('b', 'Hot-seat'), h('span', '2 to 4 people, one device')),
      h('button.sbtn', { 'data-start': 'ai', 'data-a': 'start', 'data-m': 'ai', type: 'button' }, h('b', 'Watch computers'), h('span', 'Sit back and learn'))),
    netBlock(),
    h('div.srow2', hasSave() ? h('button.btn', { 'data-a': 'loadsave', type: 'button' }, 'Continue saved game') : null, h('button.btn.alt', { 'data-a': 'rules', type: 'button' }, 'How to play')));
  s.appendChild(card);
}
function showStart() { try { GX.close(); } catch (e) { } closePop(); UI.cards = []; clearTimeout(UI.tm); renderStart(); }
// ---- events
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-a],[data-start]'); const pop = $('#ppop');
  if (!t) { if (UI.pop && pop && !pop.contains(ev.target) && !ev.target.closest('#pc,.gx-drawer')) closePop(); return; }
  const a = t.dataset.a, d = t.dataset;
  if (netClick(a, t)) return;
  if (d.start && !a) { newGame(d.start); return; }
  switch (a) {
    case 'tile': openTile(d.k, d.i); break;
    case 'mcard': { const id = G.meadow[+d.i]; if (id >= 0) openCard('meadow', id, null, +d.i); break; }
    case 'hcard': openCard('hand', +d.id); break;
    case 'ccard': openCard('city', +d.id, +d.seat === +d.seat ? +d.seat : d.seat); break;
    case 'chip': UI.rseat = d.seat === 'G' ? 'G' : +d.seat; GX.show('rivald'); renderRival(UI.rseat); break;
    case 'rtab': renderRival(d.seat === 'G' ? 'G' : +d.seat); break;
    case 'prep': openPrep(); break;
    case 'pass': openPass(); break;
    case 'hint': openHint(); break;
    case 'popx': closePop(); break;
    case 'do': { const m = UI.pm && UI.pm[+d.mi]; if (m) act(m); break; }
    case 'q': choose(+d.i); break;
    case 'cont': nextCard(); break;
    case 'take': takeDevice(); break;
    case 'again': { const m = UI.mode, c = UI.cfg || {}; UI.cards = []; newGame(m, { np: c.np, level: c.level, solo: c.solo }); break; }
    case 'menu': showStart(); break;
    case 'start': newGame(d.m); break;
    case 'guided': newGame('guided'); break;
    case 'opt': { UI.opt = UI.opt || Object.assign({}, DEF); UI.opt[d.k] = isNaN(+d.v) ? d.v : +d.v; renderStart(); break; }
    case 'rules': GX.show('rulesd'); break;
    case 'save': save(); toast('Game saved.'); break;
    case 'loadsave': if (!loadSave()) toast('No saved game.'); break;
    case 'speed': AIDELAY = +d.v; break;
    case 'guide': UI.coach.level = d.v; GX.renderSettings(); break;
    case 'sound': UI.sound = UI.sound === false; try { if (window.GA) { GA.setSfx(UI.sound); GA.setMusic(UI.sound); } } catch (e) { } GX.renderSettings(); break;
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && UI.pop) closePop(); });
// ---- phone mode
function applyPhone() {
  const q = /[?&]phone=(\d)/.exec(location.search); const w = innerWidth, hh = innerHeight, short = Math.min(w, hh);
  let ph = short <= 500 || (window.matchMedia && matchMedia('(pointer:coarse)').matches && short <= 600);
  if (q) ph = q[1] === '1';
  const r = document.documentElement.classList, was = r.contains('ph');
  r.toggle('ph', ph); r.toggle('ph-p', ph && w < hh); r.toggle('ph-l', ph && w >= hh);
  placePrompt(); if (was !== ph) { if (G && UI.started) render(); }
}
let rzT = 0;
function onResize() { clearTimeout(rzT); rzT = setTimeout(() => { applyPhone(); if (G && UI.started) { renderBoard(); placePop(); } }, 60); }
// ---- boot
function boot() {
  GX.init({ key: 'hb' });
  GX.drawer('rulesd', 'How to play', h('div.rules', { html: RULES }), true);
  GX.drawer('logd', 'Log', h('div#logbody'));
  GX.drawer('rivald', 'Cities and players', h('div#rivalbody'));
  GX.onShow = id => { renderDrawers(); };
  kitBoot();
  applyPhone();
  addEventListener('resize', onResize); addEventListener('orientationchange', onResize);
  const bd = $('#board'); if (window.ResizeObserver) new ResizeObserver(() => { if (G && UI.started) { renderBoard(); placePop(); } }).observe(bd);
  try { if (window.GA) { const A = typeof GA_DATA !== 'undefined' ? GA_DATA : {}; GA.init({ sfx: A.sfx || {}, music: A.music || {}, key: 'hb' }); GX.applyPrefs(); }; } catch (e) { }
  try { if (window.PerfHUD && PerfHUD.register) PerfHUD.register({ game: 'Hollowbough' }); } catch (e) { }
  if (/[?&]seed=(\d+)/.test(location.search)) UI.seed = +RegExp.$1;
  netInit();
  renderStart();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
// ===================== part 7: sound (shared gameaudio samples; silent without Web Audio) =====================
function snd(name, o) { try { if (UI.sound === false) return; if (window.GA && GA.has(name)) GA.play(name, o || {}); } catch (e) { } }
function sndPre() { if (!G) return null; return G.players.map(p => ({ res: Object.assign({}, p.res), season: p.season, city: p.city.length, ev: 0 })).concat([{ ev: G.bev.filter(e => e.o !== -1).length + G.sev.filter(e => e.o !== -1).length }]); }
function sndPost(pre, m, seat) {
  if (!pre || !G || !m) return;
  try {
    if (m.type === 'worker') snd(m.k === 'event' ? 'event' : 'worker');
    else if (m.type === 'play') snd('place');
    else if (m.type === 'prepare') snd('season', { duck: true });
    else if (m.type === 'choose') snd('click');
    const p = G.players[seat], b = pre[seat]; if (!p || !b) return;
    let d = 0; for (const k of RESK) { if (p.res[k] > b.res[k]) { setTimeout(() => snd(k), 120 + 90 * d++); } }
    const ev = G.bev.filter(e => e.o !== -1).length + G.sev.filter(e => e.o !== -1).length;
    if (ev > pre[pre.length - 1].ev && m.k !== 'event') snd('event');
  } catch (e) { }
}
function sndMusic() { try { if (UI.sound === false || !window.GA || !G) return; const s = G.players[Math.max(0, focusSeat())].season; GA.music(G.phase === 'over' ? null : SEAS[s], { vol: .35 }); } catch (e) { } }
document.addEventListener('click', e => { const t = e.target.closest('button'); if (t && !t.disabled && !/data-a="(do|q)"/.test(t.outerHTML.slice(0, 80))) snd('click', { vol: .5 }); }, true);
// ===================== part 8: shared GX kit (settings, reference, undo, recap, results, offline) =====================
const GAME_ID = 'hollowbough';
// ---- achievements (stored by the shelf; shown in Stats & achievements on the home page)
const ACH = [
  { id: 'first', name: 'First city', how: 'Finish a game.', test: r => true },
  { id: 'guide', name: 'Guide graduate', how: 'Finish the guided first game.', test: r => r.mode === 'guided' },
  { id: 'win', name: 'Top of the tree', how: 'Beat the computer players.', test: r => r.won && (r.mode === 'vs' || r.mode === 'guided') },
  { id: 'hard', name: 'Sharp claws', how: 'Beat hard computer players in a 3- or 4-player game.', test: r => r.won && r.mode === 'vs' && r.level === 'hard' && r.np >= 3 },
  { id: 'grumpy', name: 'Grumbles quieted', how: 'Beat Old Grimbeard on Grumpy.', test: r => r.won && r.mode === 'solo' },
  { id: 'gruff', name: 'Beard trimmed', how: 'Beat Old Grimbeard on Gruff or Ghastly.', test: r => r.won && r.mode === 'solo' && r.level >= 2 },
  { id: 'sixty', name: 'Bustling burrow', how: 'Score 60 points or more.', test: r => r.score >= 60 },
  { id: 'full', name: 'Fifteen roofs', how: 'End a game with 15 cards in your city.', test: (r, s, x) => x.extra && x.extra.city >= 15 },
  { id: 'events', name: 'Festival goer', how: 'Claim 3 or more events in one game.', test: (r, s, x) => x.extra && x.extra.events >= 3 },
  { id: 'hot', name: 'Pass the acorn', how: 'Finish a hot-seat game.', test: r => r.mode === 'hot' }
];
// ---- settings: the same sections as every game; Hollowbough adds its own rows
function kitSettings() {
  GX.settings({
    id: 'setd', title: 'Menu',
    game: S => {
      if (NET.on) S.appendChild(GX.row('Online', [h('button.gx-sb', { 'data-a': 'netopen', type: 'button' }, 'Lobby'), h('button.gx-sb', { 'data-a': 'netleave', type: 'button' }, isHost() ? 'Close the room' : 'Leave the room')]));
      else S.appendChild(GX.row('This game', [h('button.gx-sb', { 'data-a': 'menu', type: 'button' }, 'New game'), h('button.gx-sb', { 'data-a': 'save', type: 'button' }, 'Save'), h('button.gx-sb', { 'data-a': 'loadsave', type: 'button', disabled: hasSave() ? null : true }, 'Load')]));
      S.appendChild(GX.row('Undo', h('button.gx-sb', { 'data-a': 'undo', type: 'button', disabled: GX.undo.can() ? null : true }, 'Undo my last step'), 'Works until a card is drawn or the turn passes'));
    },
    sound: S => { S.appendChild(GX.row('Sound', GX.onoff(UI.sound !== false, v => { UI.sound = v; try { if (window.GA) { GA.setSfx(v); GA.setMusic(v); } } catch (e) { } sndMusic(); }, 'Sound and music'))); },
    help: S => {
      S.appendChild(GX.row('Read', [h('button.gx-sb', { 'data-a': 'rules', type: 'button' }, 'How to play'), h('button.gx-sb', { 'data-a': 'refopen', type: 'button' }, 'Cards & places')]));
      S.appendChild(GX.row('Guide', GX.seg([['full', 'Full'], ['light', 'Light'], ['off', 'Off']], UI.coach.level, v => { UI.coach.level = v; }, 'Guide level'), 'Tips that appear one at a time'));
    },
    about: { name: 'Hollowbough', version: 'preview', text: 'An original woodland city-building game. Names, texts and pictures are our own; the pictures are drawn in code. Sounds and music are CC0 recordings (Kenney, OpenGameArt).' }
  });
}
// ---- component reference
function refPic(it, big) {
  const p = it.pic || {}, px = big ? 200 : 52;
  if (p.card != null) return cardEl(p.card, px);
  const sz = big ? 44 : 22;
  if (p.place === 'basic') return items(basicItems(p.i), sz);
  if (p.place === 'forest') return items(FIC[D.forest[p.i].key] || [['any', '']], sz);
  if (p.place === 'haven') return items([['haven', ''], ['any', '']], sz);
  if (p.place === 'journey') return items([['road', ''], ['point', '2-5']], sz);
  if (p.event) return ic(p.event === 'b' ? 'flag' : 'star', big ? 64 : 34);
  if (p.res) return ic(p.res, big ? 64 : 34);
  if (p.point) return ic('point', big ? 64 : 34);
  if (p.occ) return ic('occ', big ? 64 : 34);
  return null;
}
function refInGame(it) {
  if (!G) return true;
  const p = it.pic || {};
  if (p.card != null) { const k = cdef(p.card).key, has = id => id >= 0 && cdef(id).key === k; const v = viewSeat();
    return G.meadow.some(has) || G.players.some(pl => pl.city.some(e => has(e.id))) || (v >= 0 && G.players[v].hand.some(has)) || (G.grim && G.grim.city.some(has)); }
  if (p.place === 'forest') return G.forest.indexOf(p.i) >= 0;
  if (p.event === 's') return G.sev.some(e => e.k === p.i);
  return true;
}
function kitReference() {
  GX.reference(HB.refSections(D), { title: 'Cards & places', label: 'Cards', picture: refPic, inGame: refInGame, before: '[data-gx="rivald"]' });
}
function refCardId(id) { return 'c' + D.cards.indexOf(cdef(id)); }
// ---- undo: snapshot the JSON state before each local human step; sealed once a card is drawn, the dice/shuffle moved,
// a private pile changed or the turn passed (GX.undo.check). Off online.
function revealed(a, b) { return !a || a.deck.length !== b.deck.length || a.rng !== b.rng || a.discard.length > b.discard.length || JSON.stringify(a.limbo) !== JSON.stringify(b.limbo) || a.phase !== b.phase; }
function kitUndo() {
  GX.undo.config({
    get: () => G, owner: g => g && g.phase !== 'over' ? HB.actor(g) : null, online: () => NET.on,
    set: s => { G = s; UI.rec = null; UI.recKey = ''; UI.after = UI.after.filter(e => e.from < G.logN); closePop(); UI.lastAi = ''; save(); render(); schedule(); toast('Step undone.'); },
    onChange: can => { if (can !== UI.undoCan) { UI.undoCan = can; if (G && UI.started) renderActs(); } }
  });
}
function doUndo() { if (GX.undo.undo()) snd('click'); }
// ---- "since your last turn" strip in the dock
function kitRecap() { GX.recap.attach('#dockbody', { before: true, title: 'Since your turn' }); }
function recapSeats() { GX.recap.clear(); const hs = humans(); GX.recap.seats(hs.length ? hs : [0]); }
// ---- results, statistics, achievements
function kitResult() {
  if (!G || !G.over || UI.resultDone) return; UI.resultDone = true;
  const hs = humans(); if (!hs.length) return; // watching computers: not your game
  const ov = G.over, me = NET.on ? NET.mySeat : hs.length === 1 ? hs[0] : -1;
  const seats = G.players.map((p, i) => ({ name: p.name, ai: p.ai || null, me: i === me }));
  const winner = G.grim ? (ov.win ? 0 : -1) : ov.tie ? -1 : ov.winner;
  let extra = null;
  if (me >= 0) { const evs = G.bev.filter(e => e.o === me).length + G.sev.filter(e => e.o === me).length; extra = { city: HB.cityCount(G, me), events: evs }; }
  try {
    const r = GNS.result({ game: GAME_ID, mode: UI.mode === 'net' ? 'online' : UI.mode, seats, winner, scores: ov.scores.map(s => s.total), turns: G.turn, ms: UI.t0 ? Date.now() - UI.t0 : 0,
      level: UI.mode === 'solo' ? (UI.cfg && UI.cfg.solo) : (UI.cfg && UI.cfg.level), extra });
    if (r && r.earned.length) { UI.earned = r.earned.map(a => a.name); GX.buzz([30, 60, 30]); }
  } catch (e) { }
}
// ---- boot (called from boot() in part 6)
function kitBoot() {
  kitSettings(); kitReference(); kitUndo(); kitRecap();
  GNS.achievements(GAME_ID, ACH);
  AIDELAY = GX.aiDelay(650);
  GX.onPref((k) => { if (k === 'ai' || typeof k === 'object') AIDELAY = GX.aiDelay(650); if (k === 'cb' && G && UI.started) render(); });
  GX.offline({ sw: '../sw.js', scope: '../' });
}
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-a]'); if (!t) return;
  const a = t.dataset.a;
  if (a === 'undo') doUndo();
  else if (a === 'refopen') { GX.close(); GX.show('gx-refd'); }
  else if (a === 'refcard') { closePop(); GX.refOpen(refCardId(+t.dataset.id)); }
});
document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !GX.open && GX.undo.can()) { e.preventDefault(); doUndo(); } });

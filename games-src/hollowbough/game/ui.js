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
const spec = id => { const c = HB.cardOf(id); return { key: c.key, art: ART[c.key] || 'farm', name: c.name, type: c.type, kind: c.kind, unique: c.unique, cost: c.cost, points: c.pts, text: c.text }; };
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
// ===================== part 2: the board (shared Elderheart area): layout + render =====================
const FIC = {
  forest_berry_thicket: [['berry', 2], ['card', 1]], forest_foragers_crossing: [['any', 2]], forest_rummage_hollow: [['discard', '*'], ['card', '2ea']],
  forest_echoing_meadow: [['copy', ''], ['card', 1]], forest_quarry_burrow: [['pebble', 1], ['card', 3]], forest_mixed_glade: [['twig', 1], ['resin', 1], ['berry', 1]],
  forest_bumper_bramble: [['berry', 3]], forest_sapwell_copse: [['resin', 2], ['twig', 1]], forest_postbag_clearing: [['card', 2], ['any', 1]],
  forest_barter_stump: [['discard', '3'], ['any', '']], forest_meadow_bazaar: [['meadow', '2']]
};
const EVT = { production: 'production', destination: 'destination', governance: 'governance', traveler: 'traveler' };
function items(list, px) {
  const w = h('div.its' + (list.length > 2 ? '.its3' : ''));
  const p = list.length > 2 ? Math.round(px * .78) : list.length === 1 ? Math.min(px + 6, Math.round(px * 1.2)) : px;
  for (const [k, n] of list) { const num = (n !== '' && n !== 1) ? (/^\d+$/.test(String(n)) ? '×' : '') + n : null; w.appendChild(h('span.it', ic(k, p), num ? h('b.bd', num) : null)); }
  return w;
}
function basicItems(i) { const b = D.basic[i], l = []; for (const r of RESK) if (b.gain[r]) l.push([r, b.gain[r]]); if (b.draw) l.push(['card', b.draw]); if (b.pts) l.push(['point', b.pts]); return l; }
// ---- layout: one absolute rect for every item. #bd fills the whole play area (bar excluded).
// Portrait: scores strip, 3 rows of places, the meadow, my city, my stock, my hand, the action row.
// Wide (landscape / desktop): places + meadow on the left, a rail on the right with the same things stacked.
const CARD_AR = 1.406;
// how many cards of what size fit a strip of W x H (cards may overlap sideways; more rows only when the strip is tall)
function fitStrip(n, W, H, baseW) {
  n = Math.max(1, n);
  for (let cw = Math.min(baseW, Math.floor(H / CARD_AR)); cw >= 30; cw -= 2) {
    const ch = Math.round(cw * CARD_AR);
    for (let rows = 1; rows <= 4; rows++) {
      if (rows * ch + (rows - 1) * 2 > H) break;
      const per = Math.ceil(n / rows);
      let step = per > 1 ? (W - cw) / (per - 1) : 0;
      if (step > cw + 4) step = cw + 4;
      if (per === 1 || step >= cw * 0.42) return { cw, ch, rows, per, step };
    }
  }
  const cw = 30, ch = 42, st = cw * 0.42, per = Math.max(1, Math.floor((W - cw) / st) + 1);
  return { cw, ch, rows: Math.ceil(n / per), per, step: st };
}
// the hand and my city can be tucked into one thin bar (tap to raise them again); they stay up whenever a card of mine is a target
function handHidden() {
  if (!UI.handHide || !G || G.phase === 'over' || (UI.cfg && UI.cfg.tutorial) || document.documentElement.classList.contains('ph-l')) return false;
  if (innerWidth >= innerHeight) return false;
  try { return !G.q && !myMoves().some(m => m.type === 'play' || String(tgOf(m)).startsWith('d:')); } catch (e) { return false; }
}
function boardLayout(W, H) {
  const wide = W >= H * 1.0 || (document.documentElement.classList.contains('ph-l'));
  const tall = !wide, g = 2, pad = 4;
  const R = { W, H, tall, tiles: [], meadow: [], g, slots: false };
  const tl = (kind, i, x, y, w, hh, ex) => { const t = { kind, i, x, y, w, h: hh }; if (ex) Object.assign(t, ex); R.tiles.push(t); return t; };
  const nf = G.forest.length;
  const r3 = []; for (let i = 0; i < nf; i++) r3.push(['forest', i]); r3.push(['haven', 0], ['journey', 0]);
  const sup = [['deck', 0], ['tree', 0]]; if (nf === 3) sup.push(['disc', 0]);
  const evs = []; G.bev.forEach((e, i) => evs.push(['bev', i])); G.sev.forEach((e, i) => evs.push(['sev', i]));
  const nCity = Math.max(1, G.players[Math.max(0, focusSeat())].city.length + visitList().length);
  const nHand = Math.max(1, (viewSeat() >= 0 ? G.players[viewSeat()].hand.length : 5));
  if (tall) {
    // bands from the top: scores, event pennants, 2 rows of basic places (1 row when short), forest/haven/road, the meadow bench, my stock; the
    // table under the picture: my city strip, my fanned hand, the action row. Every band shrinks until the meadow cards are readable.
    const col = handHidden();
    const meas = (mode, t) => {
      const L = (a, b) => Math.round(b + (a - b) * t), tight = mode === 'tight';
      const m = { mode, t, chip: L(36, 30), ev: L(46, 30), br: tight ? L(46, 36) : L(58, 42), r3: L(60, 40), res: L(34, 26), hand: col ? 0 : L(100, 60), city: col ? 0 : L(46, 32), bar: col ? 28 : 0, acts: L(46, 40), rg: tight ? 0 : 7, sg: tight ? 3 : 5, rows: tight ? 1 : 2 };
      let y = 3 + m.chip + m.sg; m.evY = y; y += m.ev + m.sg; m.bY = y; y += m.rows * m.br + (m.rows - 1) * m.rg + m.sg; m.r3Y = y; y += m.r3 + m.sg + 3; m.mTop = y;
      let yb = H - pad; m.actsY = yb - m.acts; yb = m.actsY - 3; if (col) { m.barY = yb - m.bar; yb = m.barY - 3; } m.handY = yb - m.hand; if (!col) yb = m.handY - 3; m.cityY = yb - m.city; m.sceneB = m.cityY - 3;
      m.resY = m.sceneB - 3 - m.res; m.mBot = m.resY - 3;
      const bp = 5, avail = m.mBot - m.mTop - 2 * bp - 4; m.ch = avail / 2; m.cw = Math.min(104, m.ch / CARD_AR, (W - 2 * pad - 2 * bp - 3 * 6) / 4);
      return m;
    };
    const pick = mode => { let b = null; for (let t = 1; t > -0.001; t -= .1) { b = meas(mode, Math.max(0, t)); if (b.cw >= 80) return b; } return b; };
    let m = H >= 600 ? pick('roomy') : null; if (!m || m.cw < 62) { const m2 = pick('tight'); if (!m || m2.cw > m.cw) m = m2; }
    const tight = m.mode === 'tight'; R.mode = m.mode;
    R.chips = { x: pad, y: 3, w: W - 2 * pad, h: m.chip };
    // event pennants on a rope
    const ne = Math.max(1, evs.length), ew = (W - 2 * pad - 14) / ne, ewd = Math.min(ew - 2, 52), evX = [];
    evs.forEach((e, i) => { const cx = pad + 7 + ew * (i + .5); evX.push(cx); tl(e[0], e[1], cx - ewd / 2, m.evY, ewd, m.ev, { ip: 20, ps: 18 }); });
    R.rope = { y: m.evY + 3, xs: evX, h: m.ev };
    // basic places
    const rowsArr = [], cg = tight ? 3 : 8, cols = tight ? 8 : 4, bw = (W - 2 * pad - (cols - 1) * cg) / cols;
    const ipB = tight ? Math.max(16, Math.min(22, Math.floor((bw - 5) / 2))) : Math.min(32, Math.floor(m.br * .6));
    for (let r = 0; r < m.rows; r++) rowsArr.push([]);
    for (let i = 0; i < 8; i++) { const row = Math.floor(i / cols); rowsArr[row].push(tl('basic', i, pad + (i % cols) * (bw + cg), m.bY + row * (m.br + m.rg), bw, m.br, { ip: ipB, ps: Math.round(Math.min(28, m.br * .56)) })); }
    // forest places, the haven and the road
    const n3 = r3.length, w3 = Math.min(78, (W - 2 * pad - (n3 - 1) * cg) / n3), x3 = (W - (n3 * w3 + (n3 - 1) * cg)) / 2, row3 = [];
    r3.forEach((e, k) => row3.push(tl(e[0], e[1], x3 + k * (w3 + cg), m.r3Y, w3, m.r3, { ip: Math.min(28, Math.floor((w3 - 4) / 2)), ps: Math.round(Math.min(26, m.r3 * .52)) })));
    rowsArr.push(row3);
    // draw pile, seasons and discards sit at the end of the stock row
    const stw = Math.min(40, m.res + 6), nS = sup.length, tilesW = nS * stw + (nS - 1) * 3;
    R.res = { x: pad, y: m.resY, w: W - 2 * pad - tilesW - 4, h: m.res };
    sup.forEach((e, k) => tl(e[0], e[1], W - pad - tilesW + k * (stw + 3), m.resY, stw, m.res, { ip: Math.max(14, Math.min(20, m.res - 10)) }));
    // the meadow bench
    const bp = 5, cw = m.cw, chh = cw * CARD_AR, gm = 6, totW = 4 * cw + 3 * gm, mx = (W - totW) / 2, tot = 2 * chh + 4, avail = m.mBot - m.mTop, my0 = m.mTop + Math.max(bp, (avail - tot) / 2);
    for (let s = 0; s < 8; s++) R.meadow.push({ i: s, x: mx + (s % 4) * (cw + gm), y: my0 + Math.floor(s / 4) * (chh + 4), w: cw, h: chh });
    R.bench = { x: mx - bp - 2, y: my0 - bp, w: totW + 2 * bp + 4, h: tot + 2 * bp };
    R.stream = { h: true, y: m.r3Y + m.r3 + (m.sg + 3) / 2 };
    R.path = []; rowsArr.forEach((row, k) => (k % 2 ? row.slice().reverse() : row).forEach(t => R.path.push({ x: t.x + t.w / 2, y: t.y + t.h / 2 })));
    R.scene = { x: 0, y: 0, w: W, h: m.sceneB }; R.tbl = { x: 0, y: m.sceneB, w: W, h: H - m.sceneB };
    R.city = { x: pad, y: m.cityY, w: W - 2 * pad, h: m.city }; R.hand = { x: pad, y: m.handY, w: W - 2 * pad, h: m.hand }; R.acts = { x: pad, y: m.actsY, w: W - 2 * pad, h: m.acts };
    R.slots = true; R.fan = true; R.col = col; if (col) R.hbar = { x: pad, y: m.barY, w: W - 2 * pad, h: m.bar };
    const cw0 = Math.max(10, Math.min(40, Math.floor((m.city - 6) / CARD_AR))), nSl = Math.max(15, nCity), stp = Math.min(cw0 + 2, (R.city.w - 10 - cw0 - 40) / (nSl - 1));
    R.fanDrop = tight ? 7 : 9;
    R.strip = { hand: fitStrip(nHand, R.hand.w - 22, R.hand.h - R.fanDrop - 3, 70), city: { cw: cw0, ch: Math.round(cw0 * CARD_AR), rows: 1, per: nSl, step: stp, x0: 5, n: nSl } };
  } else {
    const rail = Math.round(Math.max(236, Math.min(340, W * .32))), LW = W - rail - pad;
    const chipH = 34, actH = 44, resH = 30;
    const gp = Math.max(6, Math.round(LW * .012)), Lw = Math.round(LW * .40), tw = (Lw - 3 * g) / 4;
    const th = Math.min(tw * 1.3, (H - 3 * g - 8) / 4), ipw = Math.max(18, Math.min(34, Math.floor(Math.min(tw * .4, th * .46)))), psw = Math.round(Math.max(20, Math.min(30, th * .4)));
    const rowsArr = [[], [], []];
    for (let i = 0; i < 8; i++) rowsArr[Math.floor(i / 4)].push(tl('basic', i, (i % 4) * (tw + g), Math.floor(i / 4) * (th + g), tw, th, { ip: ipw, ps: psw }));
    const y2 = 2 * (th + g) + 6, rowB = r3.concat(sup);
    rowB.forEach((e, i) => { const t = tl(e[0], e[1], (i % 4) * (tw + g), y2 + Math.floor(i / 4) * (th + g), tw, th, { ip: ipw, ps: psw }); if (i < 4) rowsArr[2].push(t); });
    const x0 = Lw + gp * 2, Rw = LW - x0; let cw = Math.min((Rw - 3 * g * 2) / 4, 170);
    const evh = Math.max(40, Math.min(th * .9, 70));
    let ch = cw * CARD_AR; const maxch = (H - 2 * evh - 4 * g - 10) / 2; if (ch > maxch) { ch = maxch; cw = ch / CARD_AR; }
    const gm = Math.min(g * 3, (Rw - 4 * cw) / 3);
    const mx = x0 + (Rw - (4 * cw + 3 * gm)) / 2;
    for (let s = 0; s < 8; s++) R.meadow.push({ i: s, x: mx + (s % 4) * (cw + gm), y: Math.floor(s / 4) * (ch + g * 2), w: cw, h: ch });
    const ey = 2 * ch + g * 4 + 8, etw = (Rw - 3 * g) / 4;
    evs.forEach((e, i) => tl(e[0], e[1], x0 + (i % 4) * (etw + g), ey + Math.floor(i / 4) * (evh + g), etw, evh, { ip: 20, ps: 18 }));
    let mxy = 0; R.tiles.forEach(t => mxy = Math.max(mxy, t.y + t.h)); R.meadow.forEach(t => mxy = Math.max(mxy, t.y + t.h));
    const off = Math.max(0, Math.min(80, (H - mxy) / 2)); if (off > 1) { R.tiles.forEach(t => t.y += off); R.meadow.forEach(t => t.y += off); }
    // the rail
    const rx = LW + pad, rw = rail - pad - 2;
    R.chips = { x: rx, y: 3, w: rw, h: chipH };
    let yb = H - 2; R.acts = { x: rx, y: yb - actH, w: rw, h: actH }; yb -= actH + g;
    const left = yb - (chipH + g + resH + g + g), hh = Math.max(60, Math.min(left * .56, 260)), hc = Math.max(60, left - hh);
    R.res = { x: rx, y: chipH + g + 3, w: rw, h: resH };
    R.city = { x: rx, y: chipH + g + resH + g + 3, w: rw, h: hc };
    R.hand = { x: rx, y: R.city.y + hc + g, w: rw, h: yb - (R.city.y + hc + g) };
    R.strip = { hand: fitStrip(nHand, R.hand.w - 4, R.hand.h - 2, 74), city: fitStrip(nCity, R.city.w - 4, R.city.h - 2, 74) };
    R.scene = { x: 0, y: 0, w: rx - 2, h: H }; R.tbl = { x: rx - 2, y: 0, w: W - rx + 2, h: H };
    const bp = 6; R.bench = { x: mx - bp, y: R.meadow[0].y - bp, w: 4 * cw + 3 * gm + 2 * bp, h: 2 * ch + g * 2 + 2 * bp };
    R.stream = { h: false, x: Lw + gp };
    R.path = []; rowsArr.forEach((row, k) => (k % 2 ? row.slice().reverse() : row).forEach(t => R.path.push({ x: t.x + t.w / 2, y: t.y + t.h / 2 })));
  }
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
  if (!p || p.ai || a !== viewSeat() || UI.cards.length) return [];
  if (UI.mmc && UI.mmc.k === G.logN + ':' + a) return UI.mmc.v;
  const v = movesFor(a); UI.mmc = { k: G.logN + ':' + a, v }; return v;
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
  const px = big ? 28 : (t.ip || 20); let f = h('div.face');
  const key = t.kind === 'basic' ? D.basic[t.i].key : t.kind === 'forest' ? D.forest[G.forest[t.i]].key : t.kind === 'bev' ? D.basicEvents[G.bev[t.i].k].key : t.kind === 'sev' ? D.specialEvents[G.sev[t.i].k].key : '';
  f.innerHTML = spotArt(t.kind, key, t.i);
  switch (t.kind) {
    case 'basic': f.appendChild(items(basicItems(t.i), px)); break;
    case 'forest': f.appendChild(items(FIC[D.forest[G.forest[t.i]].key] || [['any', '']], px)); break;
    case 'haven': f.appendChild(items([['haven', ''], ['any', '']], px)); break;
    case 'journey': f.appendChild(items([['road', ''], ['point', '2-5']], px)); break;
    case 'deck': f.appendChild(h('div.its', h('span.it', ic('deck', px), h('b', G.deck.length)))); break;
    case 'disc': f.appendChild(h('div.its', h('span.it', ic('discard', px), h('b', G.discard.length)))); break;
    case 'tree': { const s = G.players[Math.max(0, viewSeat() >= 0 ? viewSeat() : (G.phase === 'over' ? 0 : HB.actor(G)))]; f.appendChild(h('div.its', h('span.it', HBKit.season(SEAS[s ? s.season : 0], px + 4)))); break; }
    case 'bev': { const e = G.bev[t.i], dd = D.basicEvents[e.k], need = Object.keys(dd.need)[0]; const col = HBKit.TYPES[need] ? HBKit.TYPES[need].c : '#888'; f.style.setProperty('--ec', col); f.appendChild(h('div.its', h('span.it', ic('flag', px), h('b.bd', dd.pts)))); break; }
    case 'sev': { const e = G.sev[t.i], dd = D.specialEvents[e.k]; f.style.setProperty('--ec', '#7f5496'); f.appendChild(h('div.its', h('span.it', ic('star', px), h('b.bd', dd.pts ? dd.pts : '?')))); break; }
  }
  if (big) { const nm = t.kind === 'deck' ? 'Draw pile' : t.kind === 'disc' ? 'Discards' : t.kind === 'tree' ? 'Seasons' : (tileInfo(t.kind, t.i).name || ''); f.appendChild(h('div.nm', nm)); }
  return f;
}
// ---- targets: every tappable thing on the board has a key; a move belongs to exactly one key
function tgOf(m) {
  if (!m) return '';
  if (m.type === 'worker') {
    if (m.k === 'basic' || m.k === 'forest') return 'w:' + m.k + ':' + m.i;
    if (m.k === 'haven') return 'w:haven';
    if (m.k === 'journey') return 'w:journey';
    if (m.k === 'event') return 'w:' + (m.e === 'b' ? 'bev' : 'sev') + ':' + m.i;
    if (m.k === 'dest') return 'd:' + m.c;
  }
  if (m.type === 'play') return 'p:' + m.from + ':' + m.card;
  if (m.type === 'prepare') return 'prep';
  if (m.type === 'pass') return 'pass';
  if (m.type === 'choose') return 'q:' + m.i;
  return '';
}
function tileTg(kind, i) { return kind === 'basic' || kind === 'forest' ? 'w:' + kind + ':' + i : kind === 'haven' ? 'w:haven' : kind === 'journey' ? 'w:journey' : kind === 'bev' || kind === 'sev' ? 'w:' + kind + ':' + i : ''; }
// open destinations in rival cities that I may visit
function visitList() {
  const v = viewSeat(); if (v < 0) return [];
  return myMoves().filter(m => m.type === 'worker' && m.k === 'dest' && m.o !== v).map(m => ({ id: m.c, o: m.o }));
}
function frameRect(el) {
  const b = $('#board'); if (!el || !b) return null;
  const r = el.getBoundingClientRect(), br = b.getBoundingClientRect();
  return { x: r.left - br.left, y: r.top - br.top, w: r.width, h: r.height };
}
function wordsCap(s, n) { const w = String(s || '').replace(/\s*\([^)]*\)/g, '').replace(/[:?].*$/, '').trim().split(/\s+/); return w.slice(0, n || 8).join(' '); }
function posStripCard(box, fit, n, i) {
  const rowsUsed = Math.ceil(n / fit.per), row = Math.floor(i / fit.per), inRow = Math.min(fit.per, n - row * fit.per);
  const rowW = fit.cw + fit.step * (inRow - 1), x = (box.w - 4 - rowW) / 2 + 2 + (i % fit.per) * fit.step;
  const totH = rowsUsed * fit.ch + (rowsUsed - 1) * 2, y = Math.max(1, (box.h - totH) / 2) + row * (fit.ch + 2);
  return { x, y };
}
function placeBox(e, b) { e.style.cssText += `;left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px`; return e; }
function renderBoard() {
  const host = $('#board'), bd = $('#bd'); if (!host || !G) return;
  const W = host.clientWidth || 390, H = host.clientHeight || 470;
  const R = boardLayout(W, H); UI.lay = R;
  bd.innerHTML = ''; bd.style.width = W + 'px'; bd.style.height = H + 'px';
  bd.className = (R.tall ? 'tall ' : 'wide ') + (R.mode || '');
  UI.tgEls = {}; UI.cr = {}; UI.tiles = {};
  const mm = myMoves(), mine = mm.length > 0, v = viewSeat();
  const okw = new Set(mm.filter(m => m.type === 'worker').map(tgOf));
  const okp = new Set(mm.filter(m => m.type === 'play').map(tgOf));
  const qm = G.q && mine ? mm.filter(m => m.type === 'choose') : [];
  const qCard = new Map(); qm.forEach(m => { if (m.card !== undefined && !qCard.has(m.card)) qCard.set(m.card, m.i); });
  const qShown = new Set(), qLoc = new Map();
  if (qm.length) G.q.opts.forEach((o, i) => { let loc = o.d && o.d.loc; if (!loc && o.d && o.d.j != null && o.d.seat != null && G.players[o.d.seat] && (o.h === 'rangerTo' || o.h === 'recallGo')) loc = G.players[o.d.seat].dep[o.d.j]; const tg = loc ? tgOf(Object.assign({ type: 'worker' }, loc)) : ''; if (tg && !qLoc.has(tg)) qLoc.set(tg, i); });
  const big = !R.tall && R.tiles.some(t => t.kind === 'basic' && t.w >= 84 && t.h >= 70);
  bd.classList.toggle('big', big);
  if (UI.sel && (UI.sel.logN !== G.logN || !UI.sel.ms.every(m => mm.some(x => sameM(x, m))))) UI.sel = null;
  if (UI.cityOpen && UI.cityOpen.logN !== G.logN) UI.cityOpen = null;
  const ov = !!UI.cityOpen;
  const regTg = (tg, e) => { if (tg) { e.setAttribute('data-t', tg); e.setAttribute('data-a', 't'); UI.tgEls[tg] = e; } };
  bd.appendChild(sceneEls(R));
  // ---- places
  for (const t of R.tiles) {
    const info = tileInfo(t.kind, t.i), tg = tileTg(t.kind, t.i);
    const e = h('button.tile.t-' + t.kind, { 'data-zoom': 'tile:' + t.kind + ':' + t.i, 'data-k': t.kind, 'data-i': t.i, type: 'button', 'aria-label': info.name || (t.kind === 'deck' ? 'Draw pile' : t.kind === 'disc' ? 'Discard pile' : 'Seasons') });
    e.style.cssText = `left:${t.x}px;top:${t.y}px;width:${t.w}px;height:${t.h}px`;
    e.appendChild(tileFace(t, big));
    UI.tiles[t.kind + ':' + t.i] = { x: t.x, y: t.y, w: t.w, h: t.h };
    const legal = tg && okw.has(tg);
    if (legal) { e.classList.add('glow'); regTg(tg, e); }
    else if (tg && qLoc.has(tg)) { e.classList.add('glow'); regTg('q:' + qLoc.get(tg), e); qShown.add(qLoc.get(tg)); }
    else if (tg) { e.setAttribute('data-a', 't'); e.setAttribute('data-t', 'x:' + tg); if (mine) e.classList.add('no'); }
    if (UI.sel && UI.sel.tg === tg) e.classList.add('sel');
    if (t.kind === 'bev' || t.kind === 'sev') {
      const ev = (t.kind === 'bev' ? G.bev : G.sev)[t.i];
      if (ev.o !== -1 && ev.o != null) { e.classList.add('done'); e.appendChild(h('div.pw', pawn(ev.o, t.ps || 18))); }
    } else if (/basic|forest|haven|journey/.test(t.kind)) {
      const ws = workersAt(t.kind, t.i);
      if (ws.length) { const pw = h('div.pw'); ws.slice(0, 4).forEach(s => pw.appendChild(pawn(s, t.ps || 22))); e.appendChild(pw); if (!info.shared && t.kind !== 'journey' && t.kind !== 'haven') e.classList.add('taken'); }
    }
    bd.appendChild(e);
  }
  // ---- meadow
  const blocked = G.grim ? G.grim.mb : [];
  for (const m of R.meadow) {
    const id = G.meadow[m.i], e = h('button.mc', { type: 'button', 'aria-label': id >= 0 ? 'Meadow card: ' + cname(id) : 'Empty meadow space' });
    e.style.cssText = `left:${m.x}px;top:${m.y}px;width:${m.w}px;height:${m.h}px`;
    if (id >= 0) {
      e.setAttribute('data-zoom', 'card:' + id); e.setAttribute('data-id', id);
      e.appendChild(cardEl(id, Math.round(m.w)));
      UI.cr['m' + id] = { x: m.x, y: m.y, w: m.w, h: m.h };
      const ptg = 'p:meadow:' + id;
      if (okp.has(ptg)) { e.classList.add('glow'); regTg(ptg, e); }
      else if (qCard.has(id)) { e.classList.add('glow'); regTg('q:' + qCard.get(id), e); qShown.add(qCard.get(id)); }
      else { e.setAttribute('data-a', 't'); e.setAttribute('data-t', 'x:m' + id); }
      if (UI.sel && UI.sel.tg === ptg) e.classList.add('sel');
    } else e.classList.add('empty');
    if (blocked.indexOf(m.i) >= 0) { e.classList.add('blocked'); e.appendChild(h('span.lock', '⛔')); }
    bd.appendChild(e);
  }
  // ---- scores strip (tap = look at that player's city)
  { const c = placeBox(h('div.chips'), R.chips), n = G.np + (G.grim ? 1 : 0); c.setAttribute('data-n', n);
    for (let s = 0; s < G.np; s++) c.appendChild(chipEl(s, n));
    if (G.grim) c.appendChild(chipEl('G', n));
    bd.appendChild(c); }
  // ---- my city (and rival open destinations I may visit): a compact strip of 15 slots; a tap opens it full screen
  const fs = focusSeat(), me = G.players[fs], cityBox = R.city, vis = visitList();
  const cityList = me.city.map(e => ({ id: e.id, e, own: true })).concat(vis.map(x => ({ id: x.id, o: x.o })));
  // one glow rule for a city card, in the strip or in the full-screen view
  const cityCard = (b, it, live, plain) => {
    const tg = 'd:' + it.id;
    if (live && okw.has(tg)) { b.classList.add('glow'); regTg(tg, b); }
    else if (live && qLoc.has(tg)) { b.classList.add('glow'); regTg('q:' + qLoc.get(tg), b); qShown.add(qLoc.get(tg)); }
    else if (live && qCard.has(it.id)) { b.classList.add('glow'); regTg('q:' + qCard.get(it.id), b); qShown.add(qCard.get(it.id)); }
    else if (!plain) { b.setAttribute('data-a', 'city'); b.setAttribute('data-t', 'x:c' + it.id); }
  };
  if (R.col) {
    const hb = placeBox(h('button.handbar', { 'data-a': 'handtog', type: 'button', 'aria-label': 'Show my hand and city' }), R.hbar); bd.appendChild(hb);
    hb.appendChild(h('span', '\u25B4 Hand ' + (v >= 0 ? G.players[v].hand.length : 0) + '/8 \u00B7 City ' + me.city.length + '/15'));
  } else { const strip = placeBox(h('div.strip.city'), cityBox); bd.appendChild(strip);
    const fit = R.strip.city, n = cityList.length;
    if (R.slots) for (let i = 0; i < fit.n; i++) { const sl = h('i.slot'); sl.style.cssText = `left:${fit.x0 + i * fit.step}px;top:${Math.max(1, (cityBox.h - fit.ch) / 2)}px;width:${fit.cw}px;height:${fit.ch}px`; strip.appendChild(sl); }
    strip.appendChild(h('span.scount', (me.city.length) + '/15'));
    const open = h('button.cityopen', { 'data-a': 'city', type: 'button', 'aria-label': 'Open my city' }); placeBox(open, cityBox); open.appendChild(h('span.cx', { 'aria-hidden': 'true', html: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" fill="none" stroke="currentColor" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"/></svg>' })); bd.appendChild(open);
    cityList.forEach((it, i) => {
      const p = R.slots ? { x: fit.x0 + i * fit.step, y: Math.max(1, (cityBox.h - fit.ch) / 2) } : posStripCard(cityBox, fit, n, i);
      const b = h('button.sc', { 'data-zoom': 'card:' + it.id, 'data-id': it.id, type: 'button', 'aria-label': cname(it.id) }, cardEl(it.id, fit.cw, { entry: it.e }));
      if (it.o != null) b.appendChild(h('span.vb', pawn(it.o, 16)));
      b.style.cssText = `left:${cityBox.x + p.x}px;top:${cityBox.y + p.y}px;width:${fit.cw}px;height:${fit.ch}px;z-index:${i + 2}`;
      UI.cr['c' + it.id] = { x: cityBox.x + p.x, y: cityBox.y + p.y, w: fit.cw, h: fit.ch };
      cityCard(b, it, !ov, false);
      bd.appendChild(b);
    }); }
  // ---- my stock
  { const r = placeBox(h('div.resrow'), R.res), show = v >= 0 || watching();
    const rp = R.res.w < 300 ? 18 : R.res.w < 380 ? 19 : 22;
    for (const k of RESK) r.appendChild(h('span.rs', { 'data-res': k }, ic(k, rp), h('b', show ? me.res[k] : '?')));
    r.appendChild(h('span.rs.pt', { 'data-res': 'point' }, ic('point', rp), h('b', me.pts)));
    r.appendChild(h('span.rs.wk', { 'data-res': 'worker' }, pawn(fs, rp - 2), h('b', availW(me) + '/' + me.workers)));
    bd.appendChild(r); }
  // ---- my hand (a fan at the bottom)
  if (!R.col) { const handBox = R.hand, strip = placeBox(h('div.strip.hand'), handBox); bd.appendChild(strip);
    const hand = v >= 0 ? G.players[v].hand : [], fit = R.strip.hand, n = hand.length;
    strip.appendChild(R.tall && v >= 0 ? h('button.scount.htog', { 'data-a': 'handtog', type: 'button', 'aria-label': 'Hide my hand' }, '\u25BE ' + n + '/8') : h('span.scount', v >= 0 ? n + '/8' : ''));
    if (v < 0) strip.appendChild(h('span.sempty', { 'aria-hidden': 'true', html: ICO.card }));
    else if (!n) strip.appendChild(h('span.sempty', { 'aria-hidden': 'true', html: ICO.card }));
    // readable chips in a sideways-scrolling row: picture thumbnail + name + cost + points (tap = zoom)
    const vert = handBox.h >= 150, chH = vert ? 56 : Math.max(46, handBox.h - 4), thW = Math.min(40, Math.floor((chH - 6) / 1.406)), chW = vert ? handBox.w - 8 : thW + 160, x0 = vert ? 4 : 40, gapc = 4;
    const hs = placeBox(h('div.hscroll'), handBox), hin = h('div.hin'); hin.style.cssText = vert ? `width:${handBox.w}px;height:${n * (chH + gapc) + 22}px` : `width:${x0 + n * (chW + gapc) + 2}px;height:${handBox.h}px`; if (vert) hs.classList.add('vert'); hs.appendChild(hin); bd.appendChild(hs);
    hand.forEach((id, i) => {
      const tg = 'p:hand:' + id, sp = spec(id);
      const b = h('button.sc.hc', { 'data-zoom': 'card:' + id, 'data-id': id, type: 'button', 'aria-label': cname(id) });
      const th = cardEl(id, thW); th.classList.add('hct'); b.appendChild(th);
      b.appendChild(h('span.hcx', h('b.hcn', sp.name), h('span.hcr', costEl(sp.cost, 14), h('span.hcp', ic('point', 13), h('b', sp.points || 0)))));
      const left = vert ? x0 : x0 + i * (chW + gapc), top = vert ? 20 + i * (chH + gapc) : 2;
      b.style.cssText += `;left:${left}px;top:${top}px;width:${chW}px;height:${chH}px;z-index:${i + 2}`;
      UI.cr['h' + id] = { x: handBox.x + left, y: handBox.y + top, w: chW, h: chH };
      if (okp.has(tg)) { b.classList.add('glow'); regTg(tg, b); }
      else if (qCard.has(id)) { b.classList.add('glow'); regTg('q:' + qCard.get(id), b); qShown.add(qCard.get(id)); }
      else { b.setAttribute('data-a', 't'); b.setAttribute('data-t', 'x:h' + id); }
      if (UI.sel && UI.sel.tg === tg) b.classList.add('sel');
      hin.appendChild(b);
    });
    hs.addEventListener('scroll', () => { UI.hsx = hs.scrollLeft; UI.hsy = hs.scrollTop; }, { passive: true }); hs.scrollLeft = UI.hsx || 0; hs.scrollTop = UI.hsy || 0;
    { const g = (UI.rec && UI.rec.m && UI.tgEls && UI.tgEls[tgOf(UI.rec.m)]) || hin.querySelector('.glow'); if (g && g.closest('.hscroll') === hs) hscrollTo(g); } }
  // ---- action row / tray
  renderActs(mm, qm, qShown);
  if (UI.sel) bd.querySelectorAll('.glow:not(.tchip)').forEach(e => e.classList.remove('glow'));
  if (ov) { bd.querySelectorAll('.glow:not(.tchip)').forEach(e => e.classList.remove('glow')); cityOverlay(me, cityList, cityCard); }
  renderPrompt();
  renderBar();
  placeFinger();
  if (typeof hlpMarks === 'function' && G.phase !== 'over') hlpMarks();
}
// the whole city, full screen: 15 slots in a grid. Usable destinations glow here just as in the strip; tap outside to close.
function cityOverlay(me, list, cityCard) {
  const bd = $('#bd'), W = UI.lay.W, H = UI.lay.H, o = h('div#cityov', { role: 'dialog', 'aria-label': 'My city' });
  o.appendChild(h('div.cvscrim', { 'data-a': 'cityx' }));
  const nSl = Math.max(15, list.length), cols = 5, rows = Math.ceil(nSl / cols), gp = 6, top = 46;
  const cw = Math.max(40, Math.min(112, Math.floor(Math.min((W - 24 - (cols - 1) * gp) / cols, (H - top - 70 - (rows - 1) * gp) / rows / CARD_AR)))), ch = Math.round(cw * CARD_AR);
  const pn = h('div.cvpanel', { 'data-a': 'noop' }); o.appendChild(pn);
  pn.appendChild(h('div.cvhead', h('b', 'My city'), h('span', me.city.length + '/15')));
  const grid = h('div.cvgrid'); grid.style.cssText = `grid-template-columns:repeat(${cols},${cw}px);gap:${gp}px`;
  for (let i = 0; i < nSl; i++) {
    const it = list[i], cell = h('div.cvcell'); cell.style.cssText = `width:${cw}px;height:${ch}px`;
    if (it) {
      const b = h('button.cvc', { 'data-zoom': 'card:' + it.id, 'data-id': it.id, type: 'button', 'aria-label': cname(it.id) }, cardEl(it.id, cw, { entry: it.e }));
      b.style.cssText = `width:${cw}px;height:${ch}px`;
      if (it.o != null) b.appendChild(h('span.vb', pawn(it.o, 18)));
      cityCard(b, it, true, true); cell.appendChild(b);
    }
    grid.appendChild(cell);
  }
  pn.appendChild(grid);
  pn.appendChild(h('button.btn.cvx', { 'data-a': 'cityx', type: 'button', 'aria-label': 'Close my city' }, 'Done'));
  bd.appendChild(o);
}
const isPh = () => document.documentElement.classList.contains('ph');
function focusSeat() { const v = viewSeat(); if (v >= 0) return v; if (UI.focus != null && UI.focus < G.np) return UI.focus; return Math.max(0, G.phase === 'over' ? 0 : Math.min(G.np - 1, G.cur)); }
function chipEl(s, n) {
  const grim = s === 'G', p = grim ? null : G.players[s];
  const pts = grim ? HB.grimScore(G).total : score(s).total;
  const cards = grim ? G.grim.city.length : HB.cityCount(G, s);
  const turn = G.phase !== 'over' && !grim && HB.actor(G) === s;
  const e = h('button.chip' + (turn ? '.turn' : '') + (s === viewSeat() ? '.me' : ''), { 'data-a': 'chip', 'data-seat': s, type: 'button', 'aria-label': pname(s) + ': ' + pts + ' points, ' + cards + ' cards in city' + (grim ? '' : ', ' + availW(p) + ' workers free') });
  e.style.borderColor = pcolor(s).c;
  const nm = pname(s), short = n >= 4 ? '' : n === 3 ? nm.slice(0, 5) : nm.slice(0, 8);
  e.appendChild(h('span.cn', pawn(s, 18), short ? h('b', short) : null, p && p.passed ? h('i', 'out') : null, p ? h('span.cs', HBKit.season(SEAS[p.season], 16)) : null));
  e.appendChild(h('span.cl', h('span.cp', '★' + pts), h('span', '▢' + cards), (p && n <= 3) ? h('span', '⚑' + availW(p)) : null));
  return e;
}
// ---- action row: Prepare / Pass / Undo, or (when something needs choosing) the choices as chips
function trayChip(m, i, tg) {
  let inner;
  if (m.type === 'play') {
    const c = cdef(m.card);
    if (m.how === 'pay') inner = [costEl(c.cost, 20)];
    else if (m.how === 'occupy') inner = [h('b', 'free'), cardEl(m.via, 26)];
    else inner = [h('b', ({ innkeeper: 'Inn −3', crane: 'Crane −3', dungeon: 'Cells −3', judge: 'Swap' })[m.how] || 'Play'), m.via != null ? cardEl(m.via, 26) : null];
  } else if (m.type === 'worker' && m.k === 'journey') inner = [ic('road', 22), h('b', D.journey[m.i].points)];
  else if (m.type === 'choose') {
    if (m.card !== undefined) inner = [cardEl(m.card, UI.trayCw || 44)];
    else if (m.res !== undefined) inner = [ic(m.res, 26)];
    else inner = [h('b', wordsCap(m.label, 6) || 'OK')];
  } else inner = [h('b', wordsCap(m.label, 5))];
  const b = h('button.tchip.glow' + (m.type === 'choose' && m.card !== undefined ? '.tcard' : ''), { 'data-a': 'tm', 'data-mi': i, type: 'button', title: m.label || '' }, inner);
  if (m.label) b.setAttribute('aria-label', m.label);
  UI.tgEls[tg] = b; return b;
}
function renderActs(mm, qm, qShown) {
  const R = UI.lay; if (!R || !G) return;
  const old = $('#acts'); if (old) old.remove();
  const box = R.acts, a = placeBox(h('div#acts'), box); $('#bd').appendChild(a);
  if (G.phase === 'over') return;
  mm = mm || myMoves(); qm = qm || []; qShown = qShown || new Set();
  const act = HB.actor(G), p = G.players[act], mine = mm.length > 0;
  // choices (a question, or a card / place with several ways to use it)
  let chips = [];
  UI.tm2 = [];
  // many card choices: shrink the cards until every one fits above the buttons (no scrolling inside the tray)
  { const trayMs = UI.sel ? UI.sel.ms : qm.filter(m => !qShown.has(m.i)), nc = trayMs.filter(m => m.type === 'choose' && m.card !== undefined).length; UI.trayCw = 44;
    if (nc && trayMs.length > 5) { const availH = Math.max(120, Math.min(R.H * .6, box.y + box.h - 120)); for (const c of [44, 38, 34, 30, 26, 22]) { const per = Math.max(1, Math.floor((box.w - 8) / (c + 12 + 6))), rows = Math.ceil(trayMs.length / per); UI.trayCw = c; if (rows * (Math.round(c * CARD_AR) + 14) + 10 <= availH) break; } } }
  if (UI.sel) UI.sel.ms.forEach(m => { const i = UI.tm2.push(m) - 1; chips.push(trayChip(m, i, 'o:' + i)); });
  else if (qm.length) qm.forEach(m => { if (!qShown.has(m.i)) { const i = UI.tm2.push(m) - 1; chips.push(trayChip(m, i, 'q:' + m.i)); } });
  if (chips.length) {
    a.classList.add('tray');
    const nCards = chips.filter(c => c.classList.contains('tcard')).length, hasCard = nCards > 0, many = chips.length > 3 && !hasCard && qShown.size === 0;
    if (hasCard || many) {
      let rows;
      if (hasCard) { const per = Math.max(1, Math.floor((box.w - 8) / (UI.trayCw + 12 + 6))); rows = Math.ceil(chips.length / per); } else rows = Math.min(3, Math.ceil(chips.length * 92 / Math.max(120, box.w)));
      const hh = hasCard ? rows * (Math.round(UI.trayCw * CARD_AR) + 14) + 10 : Math.max(box.h, rows * 50 + 6);
      a.style.top = (box.y + box.h - hh) + 'px'; a.style.height = hh + 'px'; a.classList.add('tall', 'wrap');
    }
    chips.forEach(c => a.appendChild(c));
    if (UI.sel) a.appendChild(h('button.tchip.tx', { 'data-a': 'selx', type: 'button', 'aria-label': 'Cancel' }, '×'));
    return;
  }
  if (!mine && !(GX.undo.can())) { return; }
  const prep = mm.find(m => m.type === 'prepare'), pass = mm.find(m => m.type === 'pass');
  if (GX.undo.can() && !(NET.on)) a.appendChild(h('button.btn.alt.undo', { 'data-a': 'undo', type: 'button', 'aria-label': 'Undo my last step' }, '↶'));
  if (mine) {
    if (prep) { const e = h('button.btn.prep.glow', { type: 'button', 'aria-label': 'Prepare for ' + SEASN[p.season + 1] }, HBKit.season(SEAS[p.season + 1], 22), h('span', 'Prepare')); UI.tgEls.prep = e; e.setAttribute('data-a', 't'); e.setAttribute('data-t', 'prep'); a.appendChild(e); }
    else a.appendChild(h('button.btn.prep.dis', { type: 'button', disabled: true, 'aria-label': 'Prepare (workers still out)' }, HBKit.season(SEAS[Math.min(3, p.season + 1)], 22), h('span', 'Prepare')));
    if (pass) { const armed = UI.passArm && Date.now() - UI.passArm < 2600; const e = h('button.btn.pass' + (armed ? '.armed' : ''), { type: 'button' }, armed ? 'Sure?' : 'Pass'); UI.tgEls.pass = e; e.setAttribute('data-a', 't'); e.setAttribute('data-t', 'pass'); a.appendChild(e); }
  }
}
function renderPrompt() {
  const pr = $('#prompt'); if (!pr || !G) return;
  pr.textContent = promptText();
  pr.classList.toggle('mine', !!(G.phase !== 'over' && !G.players[HB.actor(G)].ai && (!NET.on || HB.actor(G) === viewSeat())));
}
function renderBar() { }
function renderDock() { renderPrompt(); }
function placePrompt() { }
function promptText() {
  if (!G) return '';
  if (G.phase === 'over') return 'Game over.';
  const a = HB.actor(G), p = G.players[a];
  if (UI.cards.length) return '';
  if (NET.on && !p.ai && a !== viewSeat()) return p.name + ' is deciding…';
  if (hotSeat() && UI.holder !== a && !p.ai) return 'Pass the device to ' + p.name + '.';
  if (p.ai) return p.name + ' is playing…';
  if (G.q) return qShort(G.q);
  const n = availW(p);
  const pre = hotSeat() || humans().length > 1 ? p.name + ': ' : 'Your turn: ';
  return pre + (n > 0 ? 'tap a glowing spot.' : 'play a card, Prepare or Pass.');
}
// the short line for a pending decision (8 words at most; the long wording stays in the log)
function qShort(q) {
  const m = ({ discard: 'Tap cards to discard, then Done.', resource: 'Pick a resource.', meadow: 'Tap a meadow card.', production: 'Tap a card to activate next.', ruins: 'Tap a building to raze.', recipient: 'Pick a rival.', give: 'Pick what to give.', stack: 'How many to place?', trigger: 'Tap the effect to resolve first.', queen: 'Tap a card to play free.', inn: 'Tap a meadow card to play.', university: 'Tap a card to disband.', cemetery: 'Tap a card, or choose.', copy: 'Pick a place to copy.', prisoner: 'Tap a critter to lock up.', clear: 'Tap a meadow card to clear.', recall: 'Tap a worker to recall.', ranger: 'Pick a worker or a place.', tuck: 'Tap a critter to tuck.', cityDisc: 'Tap a city card to discard.', banish: 'Tap a card to remove.', teach: 'Tap the card to keep.', pigeon: 'Play a revealed card?', waive: 'Choose what to cut.', judge: 'Choose which resource to swap.', spend: 'Spend for point tokens?', trade: 'Trade resources?', bazaar: 'Play one for 1 less?', scroll: 'Keep it or tuck it?', clock: 'Repeat a place?', mole: 'Pick a card to mimic.', chip: 'Pick a card to re-run.', stock: 'Pick a stack to add.' })[q.kind];
  return m || wordsCap(q.title, 8);
}
// ===================== part 3: doing things on the board (tap, long-press zoom, flying pieces, floating gains, ghost finger) =====================
// ---- shake: "not here"
function shake(el) { if (!el) return; el.classList.remove('shk'); void el.offsetWidth; el.classList.add('shk'); setTimeout(() => el.classList.remove('shk'), 420); snd('error', { vol: .3 }); }
// ---- tap on a board target
function onTarget(tg, el) {
  if (!G || UI.cards.length) return;
  if (/^x:/.test(tg) || UI.animBusy) { UI.sel = null; shake(el); return; }
  const mm = myMoves();
  if (tg === 'pass') {
    const m = mm.find(x => x.type === 'pass'); if (!m) return;
    if (UI.passArm && Date.now() - UI.passArm < 2600) { UI.passArm = 0; actFrom(m, el); return; }
    UI.passArm = Date.now(); renderBoard(); setTimeout(() => { if (G && !UI.cards.length) renderBoard(); }, 2700); return;
  }
  UI.passArm = 0;
  const ms = mm.filter(m => tgOf(m) === tg);
  if (!ms.length) { shake(el); return; }
  if (ms.length === 1) { UI.sel = null; actFrom(ms[0], el); return; }
  UI.sel = { tg, ms, logN: G.logN }; snd('click', { vol: .5 }); render();
}
function actFrom(m, el) {
  UI.fingerSeen = true; UI.fxSrc = el ? frameRect(el) : null;
  act(m);
}
// ---- long-press zoom (card or place details; nothing else explains itself in text)
function openZoom(spec) {
  const z = $('#zoom'); if (!z || !G) return;
  const [kind, a, b] = String(spec).split(':'); z.innerHTML = '';
  const box = h('div.zbox');
  if (kind === 'card') {
    const id = +a, c = cdef(id), w = Math.min(190, Math.round(Math.min(innerWidth, innerHeight) * .46));
    box.appendChild(cardEl(id, w));
    box.appendChild(h('div.zinfo', h('b', c.name), h('div.zcost', costEl(c.cost, 20), h('b', ' \u00B7 ' + c.pts + ' pt')), h('p', c.text), h('p.sm', TYPEN[c.type] + (c.unique ? ' \u00B7 unique' : ''))));
  } else if (kind === 'tile') {
    const k = a, i = +b, info = tileInfo(k, i);
    if (/deck|disc|tree/.test(k)) {
      const t = h('div.ztile.tile.t-' + k, tileFace({ kind: k, i }, true)); box.appendChild(t);
      box.appendChild(h('div.zinfo', k === 'deck' ? [h('b', 'Draw pile'), h('p', G.deck.length + ' cards')] : k === 'disc' ? [h('b', 'Discards'), h('p', G.discard.length + ' cards')] : [h('b', 'Seasons'), h('p', 'Prepare to move on.')]));
    } else {
      const t = h('div.ztile.tile.t-' + k, tileFace({ kind: k, i }, true)); box.appendChild(t);
      box.appendChild(h('div.zinfo', h('b', info.name || ''), h('p', (info.text || '').replace(/ Shared\.$/, '')), h('p.sm', info.shared ? 'Any number of workers.' : 'One worker.')));
    }
  }
  z.appendChild(box); z.hidden = false; UI.zoomAt = Date.now();
}
function closeZoom() { const z = $('#zoom'); if (z && !z.hidden) { z.hidden = true; z.innerHTML = ''; } }
function closePop() { UI.pop = null; UI.sel = null; UI.cityOpen = null; closeZoom(); }
// ---- flying and floating
function fxLayer() { return $('#fx'); }
function fxClear() { const f = fxLayer(); if (f) f.innerHTML = ''; UI.animBusy = false; UI.animTok = (UI.animTok || 0) + 1; }
function animate(el, frames, opt) { try { if (el.animate) return el.animate(frames, opt); } catch (e) { } return null; }
function ctr(r) { return { x: r.x + r.w / 2, y: r.y + r.h / 2 }; }
// a piece flies from one rect to another, then calls done
function fxFly(node, from, to, ms, done) {
  const L = fxLayer(); if (!L || !ANIM || !from || !to) { if (done) done(); return; }
  const a = ctr(from), b = ctr(to); node.classList.add('fxfly'); L.appendChild(node);
  const f = [{ transform: `translate(${a.x}px,${a.y}px) translate(-50%,-50%) scale(.9)` }, { transform: `translate(${(a.x + b.x) / 2}px,${Math.min(a.y, b.y) - 24}px) translate(-50%,-50%) scale(1.25)`, offset: .5 }, { transform: `translate(${b.x}px,${b.y}px) translate(-50%,-50%) scale(1)` }];
  const an = animate(node, f, { duration: ms, easing: 'ease-in-out', fill: 'forwards' });
  let fin = false; const end = () => { if (fin) return; fin = true; node.remove(); if (done) done(); };
  if (an) { an.onfinish = end; an.oncancel = end; setTimeout(end, ms + 250); } else end();
}
// a number and an icon pop up where something was earned, then fly to the place that holds it
function fxFloat(from, kind, txt, to, o) {
  o = o || {}; const L = fxLayer(); if (!L || !ANIM || !from) return;
  const e = h('div.fxp' + (o.neg ? '.neg' : ''), kind ? ic(kind, 22) : null, h('b', txt)); L.appendChild(e);
  const a = ctr(from), jx = (o.slot || 0) * 22 - (o.n || 1) * 11 + 11, sx = a.x + jx, b = to ? ctr(to) : { x: sx, y: a.y - 70 };
  const up = o.neg ? 22 : -26;
  const f = [{ transform: `translate(${sx}px,${a.y}px) translate(-50%,-50%) scale(.5)`, opacity: 0 },
    { transform: `translate(${sx}px,${a.y + up}px) translate(-50%,-50%) scale(1.3)`, opacity: 1, offset: .25 },
    { transform: `translate(${sx}px,${a.y + up}px) translate(-50%,-50%) scale(1.2)`, opacity: 1, offset: .5 },
    { transform: `translate(${o.neg ? sx : b.x}px,${o.neg ? a.y + up + 24 : b.y}px) translate(-50%,-50%) scale(${o.neg ? 1 : .7})`, opacity: o.neg ? 0 : .2 }];
  const an = animate(e, f, { duration: 950, delay: (o.slot || 0) * 110, easing: 'ease-in-out', fill: 'both' });
  const end = () => { e.remove(); if (to && !o.neg && o.bump) o.bump(); };
  if (an) { an.onfinish = end; an.oncancel = () => e.remove(); setTimeout(() => e.remove(), 2600); } else end();
}
function bump(sel) { const e = $(sel); if (!e) return; e.classList.remove('bmp'); void e.offsetWidth; e.classList.add('bmp'); setTimeout(() => e.classList.remove('bmp'), 500); }
// FLIP: a freshly drawn element slides in from where it was before
function flipFrom(el, from, ms) {
  if (!el || !from || !ANIM) return; const to = frameRect(el); if (!to) return;
  const a = ctr(from), b = ctr(to), s = Math.max(.5, Math.min(2.2, from.w / (to.w || 1)));
  el.style.zIndex = 60;
  const an = animate(el, [{ transform: `translate(${a.x - b.x}px,${a.y - b.y}px) scale(${s})` }, { transform: 'none' }], { duration: ms || 480, easing: 'cubic-bezier(.2,.8,.2,1)' });
  if (an) an.onfinish = () => { el.style.zIndex = ''; };
}
function seatRect(seat) { const e = $('.chip[data-seat="' + seat + '"]'); return e ? frameRect(e) : null; }
// what changed for a seat; shown right after a move
function fxPre(seat) {
  if (!G || seat == null || seat === 'G' || !G.players[seat]) return null;
  const p = G.players[seat]; return { seat, res: Object.assign({}, p.res), tot: score(seat).total, hand: p.hand.length, season: p.season, city: HB.cityCount(G, seat) };
}
function fxPost(pre, m, src) {
  if (!pre || !G || !ANIM) return;
  const p = G.players[pre.seat]; if (!p) return;
  const mine = pre.seat === viewSeat(), chip = seatRect(pre.seat);
  if (!src) src = chip || ctr0();
  const items = [];
  for (const k of RESK) { const d = p.res[k] - pre.res[k]; if (d !== 0) items.push({ kind: k, d }); }
  const dt = score(pre.seat).total - pre.tot; if (dt !== 0) items.push({ kind: 'point', d: dt, pts: true });
  const dh = p.hand.length - pre.hand; if (dh > 0) items.push({ kind: 'card', d: dh });
  let slot = 0; const n = items.filter(x => x.d > 0).length;
  for (const it of items) {
    if (it.d > 0) {
      const to = mine ? (it.kind === 'card' ? (UI.lay && UI.lay.hand) : frameRect($('.rs[data-res="' + it.kind + '"]'))) : chip;
      fxFloat(src, it.kind, '+' + it.d, to, { slot: slot++, n, bump: mine ? () => bump('.rs[data-res="' + it.kind + '"]') : null });
    } else if (mine && it.kind !== 'point') {
      const at = frameRect($('.rs[data-res="' + it.kind + '"]')); fxFloat(at, it.kind, '\u2212' + (-it.d), null, { neg: true });
    }
  }
  if (m && m.type === 'prepare' && p.season !== pre.season) fxSeason(p.season, mine);
}
function ctr0() { const R = UI.lay; return R ? { x: R.W / 2 - 10, y: R.H / 2 - 10, w: 20, h: 20 } : null; }
function fxSeason(s, mine) {
  const L = fxLayer(); if (!L || !ANIM || !mine) return;
  const e = h('div.fxseason', HBKit.season(SEAS[s], 110), h('b', SEASN[s])); L.appendChild(e);
  const an = animate(e, [{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 0 }, { transform: 'translate(-50%,-50%) scale(1.1)', opacity: 1, offset: .3 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 1, offset: .75 }, { transform: 'translate(-50%,-50%) scale(1.3)', opacity: 0 }], { duration: 1100, fill: 'both' });
  if (an) an.onfinish = () => e.remove(); else e.remove();
  setTimeout(() => e.remove(), 1500);
}
// after a move was applied and drawn: pieces land where they went
function fxLand(m, seat, src, preChip) {
  if (!ANIM || !m) return;
  const mine = seat === viewSeat();
  if (m.type === 'play' && mine) { const el = $('.sc[data-id="' + m.card + '"]'); if (el && src) flipFrom(el, src, 520); }
  else if (m.type === 'worker') {
    const sel = m.k === 'dest' ? null : '.tile[data-k="' + (m.k === 'event' ? (m.e === 'b' ? 'bev' : 'sev') : m.k) + '"]' + (m.k === 'haven' || m.k === 'journey' ? '' : '[data-i="' + m.i + '"]');
    const t = sel && $(sel); const pw = t && t.querySelectorAll('.pawnw'); const from = preChip || seatRect(seat);
    if (pw && pw.length && from) flipFrom(pw[pw.length - 1], from, 520);
  }
}
// ---- ghost finger: shows the first move (every move in the guided game)
function fingerWanted() {
  if ((UI.cfg && UI.cfg.tutorial) || UI.noRec || !G || G.phase === 'over' || UI.cards.length || UI.animBusy) return false;
  if (UI.mode === 'guided') return true;
  if (UI.camp && UI.coach && UI.coach.level !== 'off' && UI.camp.hints) return true;
  return !UI.fingerSeen && UI.mode !== 'net' && UI.mode !== 'ai';
}
// a hand chip outside the sideways-scrolling hand row: bring it into view (the row remembers where it was)
function hscrollTo(el) { const hs = el && el.closest && el.closest('.hscroll'); if (!hs) return; const a = el.offsetLeft, b = a + el.offsetWidth, c = el.offsetTop, d = c + el.offsetHeight;
  if (hs.classList.contains('vert')) { if (c < hs.scrollTop) hs.scrollTop = c - 4; else if (d > hs.scrollTop + hs.clientHeight) hs.scrollTop = d - hs.clientHeight + 4; UI.hsy = hs.scrollTop; }
  else { if (a < hs.scrollLeft + 36) hs.scrollLeft = Math.max(0, a - 40); else if (b > hs.scrollLeft + hs.clientWidth) hs.scrollLeft = b - hs.clientWidth + 4; UI.hsx = hs.scrollLeft; } }
function placeFinger() {
  let f = $('#finger'); if (!f) { f = h('div#finger', { 'aria-hidden': 'true', html: '<svg viewBox="0 0 40 48"><rect x="13" y="2" width="13" height="30" rx="6.500" fill="#fff8e6" stroke="#3b2f2a" stroke-width="2.200"/><rect x="7" y="22" width="27" height="25" rx="11" fill="#fff8e6" stroke="#3b2f2a" stroke-width="2.200"/></svg>' }); $('#board').appendChild(f); }
  f.hidden = true;
  if (!fingerWanted() || !UI.rec || !UI.rec.m || !myMoves().length) return;
  let tg = tgOf(UI.rec.m);
  if (UI.sel) { const i = UI.sel.ms.findIndex(x => sameM(x, UI.rec.m)); if (i >= 0) tg = 'o:' + i; else return; }
  let el = UI.tgEls && UI.tgEls[tg];
  if (!el && G.q) { const i = UI.rec.m.i; el = UI.tgEls['q:' + i]; }
  if (!el) return;
  hscrollTo(el);
  const r = frameRect(el); if (!r || r.w < 4) return;
  const c = ctr(r); f.style.left = (c.x - 19) + 'px'; f.style.top = (c.y - 4) + 'px'; f.hidden = false;
  f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
}
// ===================== part 4: the computer helper's pick (drives the ghost finger) and pending decisions =====================
// The pick comes from the normal computer player. It is only ever shown as the ghost finger on a target that is glowing.
function computeRec(force) {
  if (!G || G.phase === 'over') { UI.rec = null; return; }
  const a = HB.actor(G), p = G.players[a];
  if (p.ai || a !== viewSeat() || (UI.noRec && !force)) { UI.rec = null; return; }
  if (!force && !fingerWanted()) { UI.rec = null; return; }
  const key = G.logN + ':' + G.turn + ':' + (G.q ? G.q.kind + G.q.opts.length : '');
  if (UI.recKey === key && UI.rec) return;
  try { UI.rec = { m: HB.AI.choose(G, a, 'normal') }; } catch (e) { UI.rec = null; }
  UI.recKey = key;
}
// choosing: a question's options are shown on the board (cards glow where they lie, the rest are chips in the action row)
function choose(i) { const a = HB.actor(G); const m = movesFor(a).find(x => x.type === 'choose' && x.i === i); if (m) act(m); }
function renderQ() { }
// ===================== part 5: game flow (new game, turn driver, AI, one-card-at-a-time queue, save/load) =====================
const SAVEKEY = 'hb_save1';
function toast(t) { const e = $('#toast'); if (!e) return; e.textContent = t; e.classList.add('on'); clearTimeout(UI.tt); UI.tt = setTimeout(() => e.classList.remove('on'), 2600); }
function setSeed(n) { UI.seed = n >>> 0; }
function setAiSeed(n) { UI.aiSeed = n; }
const DEF = { np: 2, level: 'normal', solo: 1 };
function newGame(mode, o) {
  mode = mode || 'vs'; o = Object.assign({}, UI.opt || DEF, o || {});
  const cfg = { mode, np: o.np || 2, level: o.level || 'normal', solo: o.solo || 1, names: o.names };
  if (mode === 'tutorial') cfg.tutorial = true; else { try { localStorage.setItem('hb_played', '1'); } catch (e) { } }
  let players, solo = null;
  if (mode === 'solo') { players = [{ name: 'You', ai: null }]; solo = { difficulty: cfg.solo }; }
  else if (mode === 'tutorial') { players = [{ name: 'You', ai: null }, { name: PNAMES[0], ai: 'easy' }]; }
  else if (mode === 'guided') { players = [{ name: 'You', ai: null }, { name: PNAMES[0], ai: 'easy' }]; }
  else if (mode === 'hot') { players = []; for (let i = 0; i < cfg.np; i++) players.push({ name: (cfg.names && cfg.names[i]) || 'Player ' + (i + 1), ai: null }); }
  else if (mode === 'net') { players = o.players; }
  else if (mode === 'ai') { players = []; for (let i = 0; i < cfg.np; i++) players.push({ name: PNAMES[i], ai: cfg.level }); if (cfg.np < 2) players.push({ name: PNAMES[1], ai: cfg.level }); }
  else { players = [{ name: 'You', ai: null }]; for (let i = 1; i < cfg.np; i++) players.push({ name: PNAMES[i - 1], ai: (o.levels && o.levels[i - 1]) || cfg.level }); }
  if (o.camp && mode === 'vs') { const cn = o.camp.names || []; players.forEach((p, i) => { if (i > 0 && cn[i - 1]) p.name = cn[i - 1]; }); }
  G = HB.newGame({ players, solo, seed: UI.seed != null ? UI.seed : undefined });
  if (o.camp) campTwist(o.camp);
  if (mode === 'tutorial') tutStage(G);
  UI.seed = null;
  UI.mode = mode; UI.cfg = cfg; UI.cards = []; UI.after = []; UI.rec = null; UI.recKey = ''; UI.pop = null; UI.sel = null; UI.fingerSeen = false; UI.passArm = 0; UI.over = null; UI.overShown = false; UI.lastAi = ''; UI.started = true; UI.focus = 0;
  UI.holder = hotSeat() ? -1 : -1;
  UI.coach = { level: UI.coach && UI.coach.level || 'full', seen: {} };
  UI.coachOn = false;
  if (mode === 'guided' && typeof hlpInit === 'function') { hlpInit(); if (typeof GXH !== 'undefined') { GXH.reset(); GXH.setEnabled(true); } }   // the guided game: every first-time bubble on
  const st = $('#start'); if (st) st.hidden = true;
  closePop(); fxClear(); try { GX.close(); } catch (e) { }
  kitNewGame();
  render(); schedule();
  return G;
}
function kitNewGame() { GX.undo.clear(); recapSeats(); UI.t0 = Date.now(); UI.resultDone = false; UI.earned = null; }
function render() {
  if (!G || !UI.started) return;
  { const v = viewSeat(); if (v >= 0) GX.recap.view(v); }
  try { if (window.PerfHUD) PerfHUD.wake(); } catch (e) { }
  UI.mmc = null; renderBoard(); renderCard(); renderDrawers();
  if (NET.on) netRenderHook();
  if (typeof hlpAfter === 'function') hlpAfter();
}
// ---- one-card-at-a-time queue
function pushCard(c) { UI.cards.push(c); closePop(); render(); }
function renderCard() {
  const pc = $('#pc'); if (!pc) return;
  if (!UI.cards.length) { pc.hidden = true; pc.innerHTML = ''; pc.removeAttribute('data-card'); return; }
  const c = UI.cards[0]; pc.hidden = false; pc.innerHTML = ''; pc.setAttribute('data-card', c.kind);
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
  if (p.ai) { if (!isClient()) UI.tm = setTimeout(aiStep, ANIM ? Math.round(AIDELAY * .4) : 0); return; }
  if (hotSeat() && UI.holder !== a) {
    UI.holder = -1; closePop(); render();
    pushCard({ kind: 'pass', seat: a, title: 'Pass the device to ' + p.name, sub: 'Hidden information', body: h('p', 'Your hand stays hidden until you tap.'), buttons: [{ label: "I am " + p.name, a: 'take' }] });
    return;
  }
  if (UI.turnSnd !== G.turn + ':' + a && (!NET.on || a === viewSeat())) { UI.turnSnd = G.turn + ':' + a; snd('turn', { vol: .6 }); GX.buzz(15); }
  if (!UI.noRec) UI.tr = setTimeout(() => { if (!G || G.phase === 'over') return; const had = UI.rec; computeRec(); if (UI.rec !== had) placeFinger(); }, 40);
}
function aiStep() {
  UI.tm = 0; if (isClient() || !G || G.phase === 'over' || (UI.cards.length && !NET.on)) return;
  const a = HB.actor(G); if (a < 0) return; const p = G.players[a]; if (!p.ai) { schedule(); return; }
  let m;
  try { m = HB.AI.choose(G, a); } catch (e) { m = HB.moves(G, a)[0]; console.error('AI error', e); }
  const tok = UI.animTok = (UI.animTok || 0) + 1;
  const go = src => { if (tok !== UI.animTok) return; UI.animBusy = false; aiApply(m, a, src); };
  if (!ANIM) { go(null); return; }
  UI.animBusy = true; aiFly(m, a, go);
}
// the computer's move: a worker flies to its place, a card flies to its city (about 0.6 s), then the move happens
function aiFly(m, a, done) {
  const chip = seatRect(a); if (!chip || !UI.lay) { done(null); return; }
  let from = chip, to = null, node = null, src = chip;
  if (m.type === 'worker' && m.k !== 'dest') {
    const kind = m.k === 'event' ? (m.e === 'b' ? 'bev' : 'sev') : m.k;
    to = UI.tiles[kind + ':' + (m.k === 'haven' || m.k === 'journey' ? 0 : m.i)]; node = pawn(a, 28); src = to;
  } else if (m.type === 'play') {
    const mr = m.from === 'meadow' ? UI.cr['m' + m.card] : null;
    from = mr || { x: UI.lay.W / 2 - 24, y: UI.lay.H * .55, w: 48, h: 64 }; to = chip; node = cardEl(m.card, 48); src = mr || chip;
  }
  if (!to || !node || !from) { done(src); return; }
  fxFly(node, from, to, Math.max(140, Math.min(600, Math.round(AIDELAY * .9))), () => done(src));
}
function aiApply(m, a, src) {
  const n0 = G.logN, pre = sndPre(), fpre = fxPre(a);
  let r = HB.apply(G, m);
  if (r.ok) sndPost(pre, m, a);
  if (!r.ok) { const ms = HB.moves(G, a); m = ms[0]; r = HB.apply(G, m); }
  const ls = logSince(n0); UI.lastAi = ls.length ? ls[0].replace(/^[^ ]+ /, '') : '';
  GX.recap.push(ls, a);
  afterMove();
  try { fxPost(fpre, m, src); fxLand(m, a, src, seatRect(a)); } catch (e) { console.error(e); }
}
function afterMove() { save(); render(); sndMusic(); schedule(); if (NET.on) netPush(); }
function act(m) {
  if (!G || !m) return; const a = HB.actor(G);
  if (isClient()) { netAct(m); return; }
  if (NET.on && a !== NET.mySeat) return;
  const n0 = G.logN, src = UI.fxSrc; UI.fxSrc = null;
  const pre = sndPre(), fpre = fxPre(a), chip0 = seatRect(a);
  if (!G.players[a].ai) GX.undo.snap(m.label || m.type);
  const r = HB.apply(G, m);
  closePop(); UI.rec = null;
  if (r.ok) sndPost(pre, m, a);
  if (!r.ok) { snd('error'); GX.undo.drop(); toast(r.error || 'That move is not allowed.'); render(); return; }
  GX.undo.check(revealed); GX.recap.mark(a); GX.recap.push(logSince(n0), a);
  UI.lastAi = ''; afterMove();
  try { fxPost(fpre, m, src); fxLand(m, a, src, chip0); } catch (e) { console.error(e); }
}
// ---- end of game: one card per player, then the result
function queueOver() {
  const ov = G.over; if (!ov) return;
  GX.undo.clear(); GX.recap.clear(); kitResult();
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
    buttons: NET.on ? netOverButtons() : campOn() ? [{ label: 'Continue the story', a: 'campfin' }, { label: 'Look at the board', a: 'cont', cls: 'alt' }] : [{ label: 'Play again', a: 'again' }, { label: 'Look at the board', a: 'cont', cls: 'alt' }, { label: 'Main menu', a: 'menu', cls: 'alt' }]
  });
  if (!(UI.cfg && UI.cfg.tutorial)) clearSave(); render();
}
// ---- save / load
function save() { try { if (!G || G.phase === 'over' || NET.on || (UI.cfg && UI.cfg.tutorial)) return; localStorage.setItem(SAVEKEY, JSON.stringify({ G, mode: UI.mode, cfg: UI.cfg, coach: UI.coach, coachOn: UI.coachOn, holder: -1 })); if (!UI.savedFlag) { UI.savedFlag = 1; GNS.saved(GAME_ID, true); } } catch (e) { } }
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
// (the old guided-game advice cards are gone: first-time help is the gx-help kit, see ui11.js)
// ---- drawers
const RULES = `<h3>The goal</h3><p>Build the best woodland city. Each player has a city of up to 15 cards and a few workers. When every player has passed, you add up points from cards, point tokens, bonuses, events and the Long Road. The highest total wins.</p>
<h3>How a turn goes</h3><p>On your turn do exactly <b>one</b> of these:</p><ul><li><b>Place a worker</b> on an open place and use it at once.</li><li><b>Play a card</b> from your hand or from the meadow by paying its price.</li><li><b>Prepare for the next season</b> (only when all your workers are out).</li></ul><p>When you cannot or do not want to do anything useful, <b>Pass</b>. You take no more turns, but your city still scores.</p>
<h3>Places for workers</h3><ul><li><b>Brown places</b> give resources, cards or a point token. Some are shared, others take one worker only.</li><li><b>Forest places</b> (green) are special and take one worker (two players can share in a four-player game).</li><li><b>The Barter Burrow</b> turns spare cards into resources: 1 resource for every 2 cards you discard.</li><li><b>The Long Road</b> opens in Autumn. Discard cards equal to the spot (5, 4, 3 or 2); the worker stays and scores that many points.</li><li><b>Destinations</b> are red cards in your city. A worker on one uses its power. A few are Open, so rivals may visit them too (the owner gets a point token).</li><li><b>Events</b> are claimed with a worker when your city meets their requirement. Each can be claimed only once.</li></ul>
<h3>Playing cards</h3><p>Pay the price in resources: twigs, resin, pebbles and berries. You can play from the eight-card meadow as well as from your hand. Your hand holds 8 cards at most. A <b>unique</b> card can be in your city once; a common card as often as you like.</p><p><b>Playing free:</b> each critter is paired with one building. If you own that building and it has no token, you can play the critter free and put a token on the building. Each building can do this once, ever.</p><p>Some cards (Lantern Rest, Pulley Lift, Thornhold Cells, Gavel Marten, Hostler Hedgehog) change the price. They are offered as extra buttons when you play a card.</p>
<h3>Card colours</h3><ul><li><b>Tan, Traveler:</b> acts once when played.</li><li><b>Green, Production:</b> acts when played and again every Spring and Autumn.</li><li><b>Red, Destination:</b> a place for your workers.</li><li><b>Blue, Governance:</b> a lasting bonus or discount.</li><li><b>Purple, Prosperity:</b> extra points at the end.</li></ul>
<h3>Seasons</h3><p>Everyone starts in Winter with 2 workers. Preparing for <b>Spring</b> gives +1 worker and runs your production. <b>Summer</b> gives +1 worker and lets you take 2 meadow cards. <b>Autumn</b> gives +2 workers and runs production again. Every player moves through the seasons at their own pace.</p>
<h3>Scoring</h3><p>Printed points on your cards, point tokens you hold, purple card bonuses, events and Long Road workers. Ties go to the player with more events, then more leftover resources.</p>
<h3>Solo play</h3><p>You play against Old Grimbeard. He takes places and cards by dice and a fixed routine. You win if you end with strictly more points than he does. Choose Grumpy, Gruff or Ghastly for the difficulty.</p>
<h3>Tips</h3><ul><li>Build production early; it pays every Spring and Autumn.</li><li>Keep cards in hand cheap to play. Watch the meadow too.</li><li>Tap the lightbulb any time to see a good move and the reason for it.</li></ul>`;
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
    firstTime() ? tutNode('sbtn big') : null,
    h('button.sbtn.big', { 'data-start': 'guided', 'data-a': 'guided', type: 'button' }, h('b', 'Guided first game'), h('span', 'You and one gentle computer player.')),
    window.CAMPAIGN ? h('button.sbtn.big.story', { 'data-start': 'story', 'data-a': 'story', type: 'button' }, h('b', '\u2728 Story: The Long Winter'), h('span', campLine())) : null,
    h('div.opts', seg('Players', 'np', [2, 3, 4]), seg('Computer level', 'level', ['easy', 'normal', 'hard']), seg('Solo rival', 'solo', [1, 2, 3], v => D.soloLevels[v - 1] + (v > 1 ? '*' : ''))),
    h('p.sm', '*Gruff and Ghastly are very hard.'),
    h('div.sgrid',
      h('button.sbtn', { 'data-start': 'vs', 'data-a': 'start', 'data-m': 'vs', type: 'button' }, h('b', 'Play vs computer'), h('span', 'You against 1 to 3 computer players')),
      h('button.sbtn', { 'data-start': 'solo', 'data-a': 'start', 'data-m': 'solo', type: 'button' }, h('b', 'Solo vs ' + D.soloName), h('span', 'Beat the automated rival')),
      h('button.sbtn', { 'data-start': 'hot', 'data-a': 'start', 'data-m': 'hot', type: 'button' }, h('b', 'Hot-seat'), h('span', '2 to 4 people, one device')),
      h('button.sbtn', { 'data-start': 'ai', 'data-a': 'start', 'data-m': 'ai', type: 'button' }, h('b', 'Watch computers'), h('span', 'Sit back and learn'))),
    netBlock(),
    firstTime() ? null : tutNode('sbtn'),
    h('div.srow2', hasSave() ? h('button.btn', { 'data-a': 'loadsave', type: 'button' }, 'Continue saved game') : null, h('button.btn.alt', { 'data-a': 'rules', type: 'button' }, 'How to play'), h('button.btn.alt', { 'data-a': 'musicopen', type: 'button' }, '\u266A Music')));
  s.appendChild(h('div.skylogo', { 'aria-hidden': 'true' }, 'Hollowbough', h('small', 'Build a woodland city. Outlast the winter.')));
  s.appendChild(card);
}
function showStart() { try { GX.close(); } catch (e) { } closePop(); UI.cards = []; clearTimeout(UI.tm); renderStart(); }
// ---- events
document.addEventListener('click', ev => {
  if (UI.zoomAt && Date.now() - UI.zoomAt < 450) { ev.preventDefault(); return; }
  const z = $('#zoom'); if (z && !z.hidden) { closeZoom(); return; }
  if (UI.lp) { UI.lp = false; return; }
  const t = ev.target.closest('[data-a],[data-start]');
  if (!t) { if (UI.sel && !ev.target.closest('[data-help]')) { UI.sel = null; render(); } return; }   // help (bulb, bubbles, rules cards) must not cancel an open choice
  const a = t.dataset.a, d = t.dataset;
  if (netClick(a, t)) return;
  if (d.start && !a) { newGame(d.start); return; }
  switch (a) {
    case 't': onTarget(d.t, t); break;
    case 'tm': { const m = UI.tm2 && UI.tm2[+d.mi]; if (m) { UI.sel = null; actFrom(m, t); } break; }
    case 'selx': UI.sel = null; render(); break;
    case 'city': if (!UI.animBusy) { UI.sel = null; UI.cityOpen = { logN: G.logN }; snd('click', { vol: .4 }); render(); } break;
    case 'handtog': UI.handHide = !UI.handHide; snd('click', { vol: .4 }); render(); break;
    case 'cityx': UI.cityOpen = null; render(); break;
    case 'noop': break;
    case 'chip': UI.rseat = d.seat === 'G' ? 'G' : +d.seat; GX.show('rivald'); renderRival(UI.rseat); break;
    case 'rtab': renderRival(d.seat === 'G' ? 'G' : +d.seat); break;
    case 'cont': nextCard(); break;
    case 'take': takeDevice(); break;
    case 'again': { if (campOn()) { const dd = UI.camp; UI.cards = []; GXC.play(dd.id); break; } const m = UI.mode, c = UI.cfg || {}; UI.cards = []; newGame(m, { np: c.np, level: c.level, solo: c.solo }); break; }
    case 'menu': UI.camp = null; showStart(); break;
    case 'story': storyOpen(); break;
    case 'campfin': campFinish(); break;
    case 'start': if (d.m !== 'ai' && tutOffer(() => newGame(d.m))) break; newGame(d.m); break;
    case 'guided': if (tutOffer(() => newGame('guided'))) break; newGame('guided'); break;
    case 'opt': { UI.opt = UI.opt || Object.assign({}, DEF); UI.opt[d.k] = isNaN(+d.v) ? d.v : +d.v; renderStart(); break; }
    case 'rules': GX.show('rulesd'); break;
    case 'save': save(); toast('Game saved.'); break;
    case 'loadsave': if (!loadSave()) toast('No saved game.'); break;
    case 'speed': AIDELAY = +d.v; break;
    case 'sound': UI.sound = UI.sound === false; try { if (window.GA) { GA.setSfx(UI.sound); GA.setMusic(UI.sound); } } catch (e) { } GX.renderSettings(); break;
  }
});
// long-press on a card or a place: a big view with the details (the only place the details are written)
{ let lpT = 0, lpS = null;
  document.addEventListener('pointerdown', e => {
    const z = e.target.closest('[data-zoom]'); if (!z || (e.button != null && e.button > 0)) return;
    UI.lp = false; lpS = { x: e.clientX, y: e.clientY }; clearTimeout(lpT);
    lpT = setTimeout(() => { UI.lp = true; openZoom(z.dataset.zoom); try { navigator.vibrate && navigator.vibrate(12); } catch (x) { } }, 430);
  });
  document.addEventListener('pointermove', e => { if (lpS && Math.hypot(e.clientX - lpS.x, e.clientY - lpS.y) > 12) clearTimeout(lpT); });
  ['pointerup', 'pointercancel'].forEach(n => document.addEventListener(n, () => { clearTimeout(lpT); lpS = null; }));
  document.addEventListener('contextmenu', e => { if (e.target.closest('[data-zoom]')) e.preventDefault(); });
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (UI.sel) { UI.sel = null; render(); } closeZoom(); } });
// ---- phone mode
function applyPhone() {
  const q = /[?&]phone=(\d)/.exec(location.search); const vm = (window.GXV ? GXV.now() : { w: innerWidth, h: innerHeight }), w = vm.w, hh = vm.h, short = Math.min(w, hh);
  let ph = short <= 500 || (window.matchMedia && matchMedia('(pointer:coarse)').matches && short <= 600);
  if (q) ph = q[1] === '1';
  const r = document.documentElement.classList, was = r.contains('ph');
  r.toggle('ph', ph); r.toggle('ph-p', ph && w < hh); r.toggle('ph-l', ph && w >= hh);
  placePrompt(); if (was !== ph) { if (G && UI.started) render(); }
}
function onResize() { applyPhone(); if (G && UI.started) renderBoard(); }
// ---- boot
function boot() {
  GX.init({ key: 'hb' });
  GX.drawer('rulesd', 'How to play', h('div.rules', { html: RULES }), true);
  GX.drawer('logd', 'Log', h('div#logbody'));
  GX.drawer('rivald', 'Cities and players', h('div#rivalbody'));
  extrasBoot();
  GX.onShow = id => { renderDrawers(); };
  kitBoot();
  applyPhone();
  if (window.GXV) GXV.watch(onResize); else { addEventListener('resize', onResize); addEventListener('orientationchange', onResize); }
  const bd = $('#board'); if (window.ResizeObserver) new ResizeObserver(() => { if (G && UI.started) renderBoard(); }).observe(bd);
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
function sndMusic() { try { musicSync(); } catch (e) { } }
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
    sound: S => { S.appendChild(GX.row('Sound', GX.onoff(UI.sound !== false, v => { UI.sound = v; try { if (window.GA) { GA.setSfx(v); GA.setMusic(v); } } catch (e) { } sndMusic(); }, 'Sound and music')));
      S.appendChild(GX.row('Music', h('button.gx-sb', { 'data-a': 'musicopen', type: 'button' }, 'Pick the songs\u2026'))); },
    help: S => {
      S.appendChild(GX.row('Read', [h('button.gx-sb', { 'data-a': 'rules', type: 'button' }, 'How to play'), h('button.gx-sb', { 'data-a': 'refopen', type: 'button' }, 'Cards & places')]));
      if (typeof GXT !== 'undefined') { const tb = tutNode('gx-sb'); if (tb) { tb.querySelector('span') && tb.querySelector('span').remove(); S.appendChild(GX.row('Tutorial', tb)); } }
      if (typeof hlpInit === 'function') { hlpInit(); if (typeof GXH !== 'undefined') S.appendChild(GXH.settingsRow({ rowClass: 'gx-row', btnClass: 'gx-sb' })); }
    },
    about: { name: 'Hollowbough', version: 'preview', text: 'An original woodland city-building game. Names and texts are our own. The pictures are painted with Google Flow and the music is made with Treblo. Sound effects are CC0 recordings (Kenney).' }
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
    get: () => G, owner: g => g && g.phase !== 'over' ? (humans().length === 1 ? humans()[0] : HB.actor(g)) : null, online: () => NET.on,
    set: s => { G = s; UI.rec = null; UI.recKey = ''; UI.after = []; UI.mmc = null; fxClear(); closePop(); UI.lastAi = ''; save(); render(); schedule(); toast('Step undone.'); },
    onChange: can => { if (can !== UI.undoCan) { UI.undoCan = can; if (G && UI.started && UI.lay) renderBoard(); } }
  });
}
function doUndo() { if (GX.undo.undo()) snd('click'); }
// ---- "since your last turn" strip in the dock
function kitRecap() { }
function recapSeats() { GX.recap.clear(); const hs = humans(); GX.recap.seats(hs.length ? hs : [0]); }
// ---- results, statistics, achievements
function kitResult() {
  if (!G || !G.over || UI.resultDone || (UI.cfg && UI.cfg.tutorial)) return; UI.resultDone = true; if (UI.camp) return; // story chapters report through GXC.finish
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
// ===================== part 9: Story mode (campaign.json + the shared chapter kit gx-campaign.js) =====================
// Twists exist only here; the normal rules never change. The boss seat is seat 1.
UI.camp = null;
function campTwist(def) {
  const t = def && def.twist; if (!t || !G) return; const n = t.param || 0;
  if (t.id === 'thin-forest') G.forest = G.forest.slice(0, n);
  else if (t.id === 'boss-extra-hand' && G.players[1]) { const p = G.players[1]; let k = 0; while (k < n && p.hand.length < HB.HAND && G.deck.length) { p.hand.push(G.deck.pop()); k++; } }
  else if (t.id === 'boss-pantry' && G.players[1]) { const r = G.players[1].res; r.twig += n; r.resin += n; r.berry += n; }
}
function campMetrics(g) {
  const ov = g.over; if (!ov) return { won: false };
  const me = ov.scores[0], won = g.grim ? !!ov.win : (ov.winner === 0 && !ov.tie);
  let best = 0; if (g.grim) best = ov.grim.total; else ov.scores.forEach((s, i) => { if (i) best = Math.max(best, s.total); });
  const evs = g.bev.filter(e => e.o === 0).length + g.sev.filter(e => e.o === 0).length;
  const p = g.players[0];
  return { won, score: me.total, margin: me.total - best, city: HB.cityCount(g, 0), events: evs, specialEvents: g.sev.filter(e => e.o === 0).length,
    occupied: p.city.filter(e => e.occ).length, green: p.city.filter(e => HB.cardOf(e.id).color === 'green').length, journey: me.journey, left: me.left };
}
function campIsWon(g, def) {
  const m = campMetrics(g); if (!m.won) return false; const gl = def.goal || {};
  if (gl.type === 'custom' || gl.type === 'score') { const need = gl.value || 0, id = def.id;
    if (id === 'c2') return m.occupied >= need; if (id === 'c3') return m.green >= need; if (id === 'c6') return m.events >= need; if (id === 'c9') return m.specialEvents >= need;
    if (gl.type === 'score') return m.score >= need; }
  return true;
}
function campStart(def) {
  const s = def.setup || {}, names = [def.opponent.name];
  if (def.id === 'c10') names.push('Quill'); else names.push('Bramble');
  UI.coach = { level: def.hints ? 'full' : 'off', seen: {} };
  const o = { camp: Object.assign({}, def, { names }), np: s.np || 2, level: s.level || 'normal', solo: s.solo || 1 };
  UI.seed = s.seed != null ? s.seed : null;
  newGame(s.mode === 'solo' ? 'solo' : 'vs', o);
  UI.camp = def; UI.coach.level = def.hints ? 'full' : 'off';
  try { toast('Goal: ' + def.goal.text); } catch (e) { }
}
function campFinish() { try { GXC.finish(G); } catch (e) { console.error(e); } }
function campOpen() { if (typeof GXC === 'undefined') return; try { GX.close(); } catch (e) { } GXC.open(); }
function campOn() { return !!(UI.camp && typeof GXC !== 'undefined' && GXC.active()); }
{ const _ng = newGame; newGame = function (mode, o) { if (!(o && o.camp)) UI.camp = null; return _ng.apply(this, arguments); }; }
function campLine() {
  try {
    if (typeof GXC === 'undefined' || !window.CAMPAIGN) return '';
    const p = GXC.progress(), ch = window.CAMPAIGN.chapters, n = ch.filter(c => p.ch[c.id] && p.ch[c.id].beaten).length;
    return n ? n + ' of ' + ch.length + ' chapters done' : 'Ten chapters, three bosses';
  } catch (e) { return ''; }
}
function campInit() {
  if (typeof GXC === 'undefined' || !window.CAMPAIGN) return;
  GXC.init({
    game: 'hollowbough', artBase: 'media/', headButtons: () => { const b = document.createElement('button'); b.type = 'button'; b.className = 'gxc-ib'; b.textContent = 'Tutorial'; b.setAttribute('aria-label', 'Replay the tutorial'); b.addEventListener('click', () => { GXC.close(); tutStart(); }); return [b]; }, data: window.CAMPAIGN, startChapter: campStart, isWon: campIsWon, metrics: campMetrics,
    onExit: () => { UI.camp = null; showStart(); },
    scores: g => g.over ? g.over.scores.map(s => s.total) : [], seats: g => g.players.map((p, i) => ({ name: p.name, me: i === 0, ai: p.ai || undefined }))
  });
}
campInit();
// ===================== part 10: the picture board (a woodland clearing drawn as SVG) =====================
// Every worker place is a little drawing (stump, bush, pond, canopy, burrow, road); a dirt path winds through them,
// a stream runs along the meadow bench, and the events hang as pennants from a rope. All of it is decoration:
// the places themselves are the buttons drawn in renderBoard.
const SVGH = (vb, body) => '<svg class="art" viewBox="' + vb + '" preserveAspectRatio="none" aria-hidden="true" focusable="false">' + body + '</svg>';
const K_INK = '#3b2a1a';
const STUMP = (ex) => '<ellipse cx="50" cy="37" rx="46" ry="25" fill="#6a4727" stroke="' + K_INK + '" stroke-width="2.5"/><ellipse cx="50" cy="30" rx="46" ry="25" fill="#dcab6c" stroke="' + K_INK + '" stroke-width="2.5"/><ellipse cx="50" cy="30" rx="37" ry="19.500" fill="none" stroke="#c0904f" stroke-width="1.600"/><ellipse cx="50" cy="30" rx="27" ry="14" fill="none" stroke="#c9985a" stroke-width="1.400"/><ellipse cx="50" cy="30" rx="16" ry="8" fill="none" stroke="#c0904f" stroke-width="1.300"/>' + (ex || '');
const BUSH = (c1, c2, bc, bs) => '<ellipse cx="50" cy="56" rx="42" ry="6" fill="rgba(0,0,0,.2)"/><g fill="' + c1 + '" stroke="' + c2 + '" stroke-width="2.500"><circle cx="18" cy="34" r="16"/><circle cx="82" cy="34" r="16"/><circle cx="36" cy="24" r="19"/><circle cx="64" cy="24" r="19"/><circle cx="50" cy="38" r="21"/></g><g fill="#fff" opacity=".18"><circle cx="34" cy="16" r="8"/><circle cx="62" cy="15" r="7"/></g><g fill="' + bc + '" stroke="' + bs + '" stroke-width="1.200"><circle cx="12" cy="28" r="3.600"/><circle cx="24" cy="48" r="3.600"/><circle cx="76" cy="49" r="3.600"/><circle cx="90" cy="30" r="3.600"/><circle cx="48" cy="9" r="3.600"/><circle cx="73" cy="12" r="3.600"/><circle cx="27" cy="12" r="3.600"/><circle cx="50" cy="55" r="3.600"/></g>';
const MUSH = (x, y, s) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><rect x="-3" y="0" width="6" height="9" rx="2" fill="#f3e6c8" stroke="' + K_INK + '" stroke-width="1.400"/><path d="M-10 1Q-10-10 0-10Q10-10 10 1Z" fill="#d23a4a" stroke="' + K_INK + '" stroke-width="1.600"/><circle cx="-4" cy="-4" r="1.800" fill="#fff"/><circle cx="3" cy="-6" r="1.600" fill="#fff"/><circle cx="5" cy="-1" r="1.300" fill="#fff"/></g>';
const ART_BASIC = {
  basic_berry_patch: () => BUSH('#5aa043', '#2b5a25', '#d23a4a', '#7a1a26'),
  basic_dewberry_nook: () => BUSH('#3f8a62', '#1f4f3a', '#7a6be0', '#2f2a80'),
  basic_amber_weep: () => STUMP('<path d="M14 42q-3 9 2 12q5-3 2-12Z" fill="#e8a523" stroke="#7a4a0a" stroke-width="1.600"/><path d="M80 44q-3 9 2 11q5-3 2-11Z" fill="#e8a523" stroke="#7a4a0a" stroke-width="1.600"/><ellipse cx="26" cy="22" rx="10" ry="5" fill="#e8a523" stroke="#7a4a0a" stroke-width="1.400"/><ellipse cx="76" cy="36" rx="8" ry="4" fill="#e8a523" stroke="#7a4a0a" stroke-width="1.400"/>'),
  basic_pebble_bank: () => '<ellipse cx="50" cy="34" rx="46" ry="26" fill="#9db9bf" stroke="#4d6a72" stroke-width="2.500"/><g fill="#c8cdd0" stroke="#5d6a70" stroke-width="2"><ellipse cx="20" cy="36" rx="13" ry="9"/><ellipse cx="80" cy="38" rx="14" ry="10"/><ellipse cx="50" cy="54" rx="17" ry="7"/><ellipse cx="62" cy="12" rx="13" ry="7"/><ellipse cx="28" cy="14" rx="11" ry="6"/></g><g fill="#fff" opacity=".4"><ellipse cx="17" cy="33" rx="5" ry="2.500"/><ellipse cx="77" cy="35" rx="5" ry="2.500"/></g>',
  basic_twig_heap: () => '<ellipse cx="50" cy="36" rx="46" ry="25" fill="#7a5632" stroke="' + K_INK + '" stroke-width="2.500"/><ellipse cx="50" cy="30" rx="46" ry="25" fill="#a98355" stroke="' + K_INK + '" stroke-width="2.500"/><g stroke="#4a2f14" stroke-width="5.500" stroke-linecap="round"><path d="M8 40L34 14"/><path d="M92 38L66 10"/><path d="M14 22L42 52"/><path d="M88 24L58 54"/><path d="M30 8L74 52"/></g><g stroke="#c28d4e" stroke-width="2" stroke-linecap="round"><path d="M10 38L33 16"/><path d="M90 36L67 12"/><path d="M16 24L41 50"/><path d="M86 26L59 52"/></g>',
  basic_gossip_glade: () => '<ellipse cx="50" cy="34" rx="46" ry="26" fill="#a4d476" stroke="#3f7d2c" stroke-width="2.500"/><ellipse cx="50" cy="30" rx="36" ry="19" fill="#b9e08c"/>' + MUSH(14, 36, .85) + MUSH(86, 34, .8) + MUSH(52, 49, .75) + '<g fill="#fff" stroke="#c08a2a"><circle cx="26" cy="14" r="2.600"/><circle cx="74" cy="12" r="2.600"/></g>',
  basic_resin_pool: () => '<ellipse cx="50" cy="37" rx="46" ry="25" fill="#5a3d20" stroke="' + K_INK + '" stroke-width="2.500"/><ellipse cx="50" cy="30" rx="46" ry="25" fill="#9a7140" stroke="' + K_INK + '" stroke-width="2.500"/><ellipse cx="50" cy="31" rx="36" ry="18" fill="#6bb4cc" stroke="#2f6f86" stroke-width="2"/><path d="M24 26Q34 21 44 26" fill="none" stroke="#e8f8ff" stroke-width="2" stroke-linecap="round"/><path d="M60 38Q70 33 78 38" fill="none" stroke="#e8f8ff" stroke-width="2" stroke-linecap="round"/><g fill="#5a9a3a" stroke="#2c5a1a" stroke-width="1.200"><path d="M10 40q-2-14 3-18q2 8 0 18Z"/><path d="M92 38q2-14-3-18q-2 8 0 18Z"/></g>',
  basic_kindling_glen: () => '<ellipse cx="50" cy="54" rx="40" ry="6" fill="rgba(0,0,0,.22)"/><g stroke="' + K_INK + '" stroke-width="2.500"><circle cx="27" cy="38" r="19" fill="#dcab6c"/><circle cx="73" cy="38" r="19" fill="#d4a062"/><circle cx="50" cy="22" r="19" fill="#e2b374"/></g><g fill="none" stroke="#b9854a" stroke-width="1.500"><circle cx="27" cy="38" r="12"/><circle cx="27" cy="38" r="5"/><circle cx="73" cy="38" r="12"/><circle cx="73" cy="38" r="5"/><circle cx="50" cy="22" r="12"/><circle cx="50" cy="22" r="5"/></g>'
};
const CANOPY = [['#72b653', '#376f2f'], ['#5faa72', '#2c6e47'], ['#8cc058', '#4a7a2c'], ['#5aa593', '#2a6a60']];
function canopyArt(i) {
  const c = CANOPY[i % CANOPY.length];
  return '<ellipse cx="32" cy="57" rx="22" ry="5" fill="rgba(0,0,0,.22)"/><rect x="27" y="46" width="10" height="12" rx="2" fill="#7a5632" stroke="' + K_INK + '" stroke-width="2"/><g fill="' + c[0] + '" stroke="' + c[1] + '" stroke-width="2.500"><circle cx="17" cy="38" r="14"/><circle cx="47" cy="38" r="14"/><circle cx="32" cy="22" r="18"/><circle cx="32" cy="38" r="17"/></g><g fill="#fff" opacity=".2"><circle cx="24" cy="18" r="7"/><circle cx="40" cy="26" r="4"/></g>';
}
const ART_HAVEN = '<ellipse cx="32" cy="57" rx="27" ry="5" fill="rgba(0,0,0,.22)"/><path d="M4 56Q4 14 32 12Q60 14 60 56Z" fill="#cda26c" stroke="' + K_INK + '" stroke-width="2.500"/><path d="M7 36Q10 14 32 12Q54 14 57 36Q44 26 32 28Q20 26 7 36Z" fill="#7fb862" stroke="#2f5a25" stroke-width="2"/><path d="M23 56V45Q23 36 32 36Q41 36 41 45V56Z" fill="#5b3b20" stroke="' + K_INK + '" stroke-width="2"/><circle cx="14" cy="46" r="2.500" fill="#f6e1a8"/><circle cx="50" cy="46" r="2.500" fill="#f6e1a8"/>';
const ART_JOURNEY = '<ellipse cx="32" cy="57" rx="27" ry="5" fill="rgba(0,0,0,.22)"/><ellipse cx="32" cy="32" rx="29" ry="27" fill="#e6a85a" stroke="#7a4a1c" stroke-width="2.500"/><path d="M24 58L29 8H35L40 58Z" fill="#f3d9a0" stroke="#8a6a3a" stroke-width="1.600"/><g stroke="#fff" stroke-width="2.500" stroke-linecap="round" opacity=".85"><path d="M32 14V20"/><path d="M32 28V34"/><path d="M32 42V48"/></g>';
function pennantArt(special) {
  const f = special ? '#ecdff3' : '#f8efd8';
  return SVGH('0 0 48 48', '<path d="M3 3H45V33Q45 37 41 39L24 46L7 39Q3 37 3 33Z" fill="' + f + '" stroke="var(--ec,#888)" stroke-width="3" stroke-linejoin="round"/><rect x="3" y="3" width="42" height="7" fill="var(--ec,#888)"/><circle cx="12" cy="3" r="2" fill="' + K_INK + '"/><circle cx="36" cy="3" r="2" fill="' + K_INK + '"/>');
}
// the drawing under a place's icons
function spotArt(kind, key, i) {
  const ph = key && HBKit.paintedHref ? HBKit.paintedHref(key) : null;
  if (ph) return '<img class="art pa" src="' + ph + '" alt="" draggable="false">';
  switch (kind) {
    case 'basic': return SVGH('0 0 100 64', (ART_BASIC[key] || ART_BASIC.basic_twig_heap)());
    case 'forest': return SVGH('0 0 64 64', canopyArt(i));
    case 'haven': return SVGH('0 0 64 64', ART_HAVEN);
    case 'journey': return SVGH('0 0 64 64', ART_JOURNEY);
    case 'bev': return pennantArt(false);
    case 'sev': return pennantArt(true);
  }
  return '';
}
// ---- the scene: grass, a stream, a dirt path through the places, the meadow bench, the rope for the pennants
function hrng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function sceneSVG(R) {
  const S = R.scene, w = Math.round(S.w), hh = Math.round(S.h), rnd = hrng(w * 31 + hh), o = [];
  o.push('<defs><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9d07f"/><stop offset=".55" stop-color="#88b866"/><stop offset="1" stop-color="#6d9e54"/></linearGradient><radialGradient id="vg" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#1c3a14" stop-opacity="0"/><stop offset="1" stop-color="#1c3a14" stop-opacity=".38"/></radialGradient></defs>');
  o.push('<g class="gdec">');
  o.push('<rect width="' + w + '" height="' + hh + '" fill="url(#gr)"/>');
  // grass tufts and flowers
  for (let k = 0; k < 46; k++) { const x = rnd() * w, y = rnd() * hh; o.push('<path d="M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'l-2.500-6M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'l0-7M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'l2.500-6" stroke="#4f8a3a" stroke-width="1.600" stroke-linecap="round" fill="none" opacity=".55"/>'); }
  const FL = ['#fff6d6', '#ffd75a', '#f9a6c0', '#ffffff'];
  for (let k = 0; k < 26; k++) { const x = rnd() * w, y = rnd() * hh, c = FL[k % 4]; o.push('<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3" fill="' + c + '" stroke="#5b7a3a" stroke-width=".8"/><circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="1" fill="#e9a31c"/>'); }
  // the forest edge behind the score chips
  if (R.tall) {
    const eh = R.chips.y + R.chips.h + 3; o.push('<rect x="0" y="0" width="' + w + '" height="' + eh + '" fill="#3f7236"/>');
    for (let x = -6; x < w + 20; x += 22) o.push('<circle cx="' + x + '" cy="' + (eh - 2) + '" r="13" fill="#4d8740" stroke="#2c5a28" stroke-width="2"/>');
    for (let x = 6; x < w + 20; x += 22) o.push('<circle cx="' + x + '" cy="' + (eh - 8) + '" r="10" fill="#5a9a4a" opacity=".55"/>');
  }
  // the stream along the meadow bench
  const sp = R.stream;
  if (sp) {
    let d = '', n = 0;
    if (sp.h) { for (let x = 0; x <= w + 18; x += 18, n++) d += (n ? 'T' : 'M') + x + ' ' + (sp.y + (n % 2 ? 5 : -5)); }
    else { for (let y = 0; y <= hh + 18; y += 18, n++) d += (n ? 'T' : 'M') + (sp.x + (n % 2 ? 5 : -5)) + ' ' + y; }
    o.push('<path d="' + d + '" fill="none" stroke="#2f6f86" stroke-width="13" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="#5fb0d2" stroke-width="9" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="#bfe8f6" stroke-width="2.500" stroke-linecap="round" stroke-dasharray="7 11"/>');
  }
  // the dirt path winding through the places
  if (R.path && R.path.length > 1) {
    const P = R.path; let d = 'M' + P[0].x.toFixed(1) + ' ' + P[0].y.toFixed(1);
    for (let k = 1; k < P.length; k++) { const a = P[k - 1], b = P[k], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2; d += 'Q' + (a.x + (b.x - a.x) * .15).toFixed(1) + ' ' + (b.y).toFixed(1) + ' ' + mx.toFixed(1) + ' ' + my.toFixed(1); }
    const l = P[P.length - 1]; d += 'T' + l.x.toFixed(1) + ' ' + l.y.toFixed(1);
    o.push('<path d="' + d + '" fill="none" stroke="#8a6a3a" stroke-width="19" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="#d9b87a" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="#f0d9a2" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 9" opacity=".8"/>');
  }
  o.push('</g>');
  // the meadow bench
  if (R.bench) { const b = R.bench; o.push('<g class="bnch">'); o.push('<rect x="' + (b.x + 2) + '" y="' + (b.y + 4) + '" width="' + b.w + '" height="' + b.h + '" rx="12" fill="rgba(0,0,0,.28)"/><rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '" rx="12" fill="#b98650" stroke="#5a3b1d" stroke-width="3"/>'); for (let y = b.y + 14; y < b.y + b.h - 4; y += 15) o.push('<path d="M' + (b.x + 6) + ' ' + y + 'H' + (b.x + b.w - 6) + '" stroke="#8a5f30" stroke-width="1.500" opacity=".55"/>'); o.push('</g><image class="bnch-img" href="media/bench.webp" x="' + (b.x - 4) + '" y="' + (b.y - 6) + '" width="' + (b.w + 8) + '" height="' + (b.h + 12) + '" preserveAspectRatio="none"/>'); }
  // the rope the event pennants hang from, between two posts
  if (R.rope) {
    const rp = R.rope, y = rp.y; let d = 'M6 ' + y;
    rp.xs.forEach((x, k) => { const px = k ? rp.xs[k - 1] : 6; d += 'Q' + ((px + x) / 2).toFixed(1) + ' ' + (y + 4) + ' ' + x.toFixed(1) + ' ' + y; });
    d += 'Q' + ((rp.xs[rp.xs.length - 1] + w - 6) / 2).toFixed(1) + ' ' + (y + 4) + ' ' + (w - 6) + ' ' + y;
    o.push('<rect x="1" y="' + (y - 6) + '" width="7" height="' + (rp.h + 10) + '" rx="3" fill="#7a5632" stroke="' + K_INK + '" stroke-width="2"/><rect x="' + (w - 8) + '" y="' + (y - 6) + '" width="7" height="' + (rp.h + 10) + '" rx="3" fill="#7a5632" stroke="' + K_INK + '" stroke-width="2"/><path d="' + d + '" fill="none" stroke="#5a3b1d" stroke-width="3" stroke-linecap="round"/>');
  }
  o.push('<rect class="gvig" width="' + w + '" height="' + hh + '" fill="url(#vg)"/>');
  return '<svg class="scsvg" viewBox="0 0 ' + w + ' ' + hh + '" width="' + w + '" height="' + hh + '" aria-hidden="true" focusable="false">' + o.join('') + '</svg>';
}
// the scene (data-board) and the wooden table under it
function sceneEls(R) {
  const f = document.createDocumentFragment();
  if (R.tbl) f.appendChild(placeBox(h('div.tbl'), R.tbl));
  const s = placeBox(h('div#scene.scn', { 'data-board': '', 'aria-hidden': 'true' }), R.scene); s.innerHTML = sceneSVG(R); f.appendChild(s);
  return f;
}
// ===================== part 11: help (gx-help kit): coach bubbles the first time, the lightbulb on demand =====================
// Bubbles: once per phase, short, pointing at the board. The bulb: the computer helper's own move (HB.AI.choose, the same one the ghost finger uses),
// the element it points at comes from UI.tgEls (the glowing thing), and a short "why" built from the move's real facts. Rules cards for every phase.
// ---------------------------------------------------------------- pictures for the rules cards (the game's own art)
const HPX = 46;
const HP = {
  res: r => ic(r, HPX), worker: () => pawn(0, HPX - 6), back: () => backEl(34), point: () => ic('point', HPX), road: () => ic('road', HPX),
  flag: () => ic('flag', HPX), star: () => ic('star', HPX), haven: () => ic('haven', HPX), deck: () => ic('deck', HPX), tree: () => ic('tree', HPX),
  season: i => HBKit.season(SEAS[i], HPX + 4),
  cost: () => costEl({ twig: 2, berry: 1 }, 24),
  card: () => cardEl(firstCardId(), 40)
};
function firstCardId() { try { for (let i = 0; i < HB.NCARDS; i++) if (HB.cardKey(i) === 'architect') return i; } catch (e) { } return 0; }
function hnode(x) { try { const n = typeof x === 'function' ? x() : x; return n && n.outerHTML ? n.outerHTML : String(n || ''); } catch (e) { return ''; } }
function hpics(items) { return '<div class="gxh-pics">' + items.map(it => it === '>' ? '<span class="gxh-ar">&rarr;</span>' : '<figure>' + hnode(it[0]) + (it[1] ? '<figcaption>' + it[1] + '</figcaption>' : '') + '</figure>').join('') + '</div>'; }
// ---------------------------------------------------------------- where each bubble points
const hq = s => () => document.querySelector(s);
const hfirst = (...sels) => () => { for (const s of sels) { const e = document.querySelector(s); if (e && e.getBoundingClientRect().width) return e; } return null; };
const HLP_STEPS = {
  turn: { target: () => { try { const m = UI.rec && UI.rec.m, e = m && hlpEl(m); if (e && e.getBoundingClientRect().width) return e; } catch (x) { } return hfirst('#bd .tile.glow', '#bd .glow:not(.tchip)', '#acts .btn')(); }, title: 'Your turn', text: 'Tap a glowing spot to send a worker there. Or tap a glowing card to play it.', pic: () => hnode(HP.worker) },
  prepare: { target: hfirst('#acts .prep'), title: 'Time to prepare', text: 'All workers are out. Tap Prepare: they come home and you gain more.', pic: () => hnode(() => HP.season(1)) },
  lastCall: { target: hfirst('#acts .pass', '#acts .btn'), title: 'Nothing left to do?', text: 'Play a card if you can. Otherwise tap Pass twice: your city still scores.', pic: () => hnode(HP.tree) },
  how: { target: hfirst('#acts .tchip'), title: 'Choose how', text: 'This can be done in several ways. Tap the option you want.', pic: () => hnode(HP.cost) },
  pickCard: { target: hfirst('#bd .glow:not(.tchip)', '#acts .tchip'), title: 'Pick a card', text: 'The power needs a card. Tap one that glows.', pic: () => hnode(HP.card) },
  pickRes: { target: hfirst('#acts .tchip'), title: 'Pick a resource', text: 'Tap the resource you want, in the row below the board.', pic: () => hnode(() => HP.res('berry')) },
  pickPlace: { target: hfirst('#bd .tile.glow', '#bd .glow:not(.tchip)', '#acts .tchip'), title: 'Pick a place', text: 'Tap the glowing place or worker the power should use.', pic: () => hnode(HP.haven) },
  pickOption: { target: hfirst('#acts .tchip', '#bd .glow'), title: 'Make a choice', text: 'The power gives you options. Tap the one you want.', pic: () => hnode(HP.star) }
};
// ---------------------------------------------------------------- the rules cards (<= 20 words each, a picture each)
const HLP_RULES = [
  { title: 'The goal', text: 'Build the best woodland city. When everyone has passed, the highest total of points wins.', pic: () => hpics([[HP.tree, 'City'], '>', [HP.point, 'Points']]) },
  { title: 'Your turn', text: 'Place a worker, play a card, or Prepare for the next season. Then the next player goes.', pic: () => hpics([[HP.worker, 'Worker'], [HP.back, 'Card'], [() => HP.season(1), 'Prepare']]) },
  { phase: 'turn', title: 'Place a worker', text: 'Tap a glowing spot. Your worker goes there and its effect happens at once.', pic: () => hpics([[HP.worker, 'Worker'], '>', [() => HP.res('twig'), 'Goods']]) },
  { phase: 'turn', title: 'Or play a card', text: 'Tap a glowing card in your hand or the meadow, then pay its price in resources.', pic: () => hpics([[HP.back, 'Card'], '>', [HP.cost, 'Price']]) },
  { phase: 'turn', title: 'Spots fill up', text: 'Most spots hold only one worker, so good ones go fast. Spots marked Shared hold more.', pic: () => hpics([[HP.worker, 'Taken'], [() => HP.res('resin'), 'Shared']]) },
  { phase: 'turn', title: 'Events and the Long Road', text: 'Flags and stars are events: claim one when your city meets its need. The Long Road opens in Autumn.', pic: () => hpics([[HP.flag, 'Event'], [HP.road, 'Long Road']]) },
  { phase: 'prepare', title: 'Prepare', text: 'When all your workers are out, tap Prepare. They come home and you gain more workers.', pic: () => hpics([[HP.worker, 'Home'], '>', [() => HP.season(1), 'Spring']]) },
  { phase: 'prepare', title: 'Production pays', text: 'In Spring and Autumn every green Production card in your city gathers goods again.', pic: () => hpics([[() => HP.res('twig'), 'Twigs'], [() => HP.res('berry'), 'Berries'], [() => HP.res('resin'), 'Resin']]) },
  { phase: 'prepare', title: 'Your own seasons', text: 'Each player moves through Winter, Spring, Summer and Autumn at their own pace.', pic: () => hpics([[() => HP.season(0)], '>', [() => HP.season(1)], '>', [() => HP.season(2)], '>', [() => HP.season(3)]]) },
  { phase: 'lastCall', title: 'Nothing left? Pass', text: 'When you have no workers or plays left, tap Pass twice. You take no more turns.', pic: () => hpics([[HP.worker, 'All out'], '>', [HP.tree, 'Done']]) },
  { phase: 'lastCall', title: 'Your city still scores', text: 'When everyone has passed, your cards, point tokens, events and Long Road workers are scored.', pic: () => hpics([[HP.back, 'Cards'], [HP.point, 'Tokens'], [HP.flag, 'Events']]) },
  { phase: 'lastCall', title: 'Highest total wins', text: 'The highest total wins. A tie goes to the player with more events claimed.', pic: () => hpics([[HP.point, 'Points'], '>', [HP.star, 'Winner']]) },
  { phase: 'how', title: 'Several ways', text: 'This card or spot can be used in more than one way. Tap the option you want.', pic: () => hpics([[HP.back, 'Card'], '>', [HP.cost, 'Pay']]) },
  { phase: 'how', title: 'Pay or play free', text: 'Pay the price, or play a critter free into its matching building when that building is open.', pic: () => hpics([[HP.cost, 'Pay'], [HP.star, 'Or free']]) },
  { phase: 'how', title: 'Cheaper plays', text: 'Some cards you own make a play cheaper. They show up as extra buttons.', pic: () => hpics([[HP.back, 'Card'], '>', [() => HP.res('pebble'), 'Fewer']]) },
  { phase: 'how', title: 'The Long Road', text: 'In Autumn, discard 5, 4, 3 or 2 cards. Your worker stays and scores that many points.', pic: () => hpics([[HP.back, 'Discard'], '>', [HP.road, 'Road'], '>', [HP.point, 'Points']]) },
  { phase: 'pickCard', title: 'Pick a card', text: 'The power needs a card. Tap one that glows: it may be in your hand, the meadow or your city.', pic: () => hpics([[HP.back, 'Card'], '>', [HP.star, 'Power']]) },
  { phase: 'pickCard', title: 'Read it first', text: 'Press and hold any card to read it big before you choose.', pic: () => hpics([[HP.back, 'Hold'], '>', [HP.card, 'Read']]) },
  { phase: 'pickRes', title: 'Pick a resource', text: 'A power asks for a resource. Tap one of the icons in the row below the board.', pic: () => hpics([[() => HP.res('twig')], [() => HP.res('resin')], [() => HP.res('pebble')], [() => HP.res('berry')]]) },
  { phase: 'pickRes', title: 'Four resources', text: 'Twigs, resin, pebbles and berries pay for cards. The row under your city shows your stock.', pic: () => hpics([[HP.cost, 'Prices'], '>', [HP.back, 'Cards']]) },
  { phase: 'pickPlace', title: 'Pick a place', text: 'Tap the glowing place or worker the power should use.', pic: () => hpics([[HP.haven, 'Place'], '>', [HP.worker, 'Worker']]) },
  { phase: 'pickPlace', title: 'Read before you tap', text: 'Press and hold a place to read what it gives.', pic: () => hpics([[HP.haven, 'Hold'], '>', [HP.star, 'Read']]) },
  { phase: 'pickOption', title: 'Make a choice', text: 'The power gives you options. Tap the one you want in the row below the board.', pic: () => hpics([[HP.star, 'Power'], '>', [HP.cost, 'Options']]) },
  { phase: 'pickOption', title: 'Read each button', text: 'Each button says what it does. Pick the one that helps your city most.', pic: () => hpics([[HP.back, 'Option'], [HP.back, 'Option']]) }
];
// ---------------------------------------------------------------- phases
// the moment the player is deciding in (null when there is nothing to decide on the board)
function hlpPhase() {
  try {
    if (!G || !UI.started || G.phase === 'over' || (UI.cfg && UI.cfg.tutorial) || UI.cards.length || UI.pop || UI.cityOpen || UI.animBusy) return null;
    const a = HB.actor(G); if (a < 0 || G.players[a].ai || a !== viewSeat()) return null;
    const mm = myMoves(); if (!mm.length) return null;
    if (UI.sel) return 'how';
    if (G.q) {
      const qm = mm.filter(m => m.type === 'choose');
      if (qm.some(m => { const e = UI.tgEls && UI.tgEls['q:' + m.i]; return e && e.classList.contains('tile'); })) return 'pickPlace';
      if (qm.some(m => m.card !== undefined)) return 'pickCard';
      if (qm.some(m => m.res !== undefined)) return 'pickRes';
      return 'pickOption';
    }
    const p = G.players[a];
    if (mm.some(m => m.type === 'prepare')) return 'prepare';
    if (availW(p) > 0) return 'turn';
    return mm.some(m => m.type === 'pass') ? 'lastCall' : null;
  } catch (e) { return null; }
}
// ---------------------------------------------------------------- the bulb: the helper's move, where it is on the board, and why (<= 15 words)
function capW(t, n) { const w = String(t || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean); return w.length <= n ? w.join(' ') : ''; }
function hlpWhy(m, a) {
  const p = G.players[a]; let t = '';
  if (m.type === 'worker') {
    if (m.k === 'basic') { const b = D.basic[m.i]; t = b.name + ': ' + b.text.replace(/\s*Shared\.?$/, ''); }
    else if (m.k === 'forest') { const f = D.forest[G.forest[m.i]]; t = f.name + ': ' + f.text; }
    else if (m.k === 'haven') t = 'Barter Burrow turns spare cards into resources: 1 for every 2.';
    else if (m.k === 'journey') t = 'The Long Road: discard cards, and this worker stays and scores ' + D.journey[m.i].points + ' points.';
    else if (m.k === 'event') { const e = m.e === 'b' ? D.basicEvents[G.bev[m.i].k] : D.specialEvents[G.sev[m.i].k]; t = 'Your city meets this event: claim it for ' + (e.pts || 'bonus') + ' points.'; }
    else if (m.k === 'dest') t = (m.o === a ? 'Use ' + cname(m.c) + ' in your city.' : 'Visit ' + cname(m.c) + ': you use its power, its owner gets a point token.');
  } else if (m.type === 'play') {
    const nm = cname(m.card), pts = cdef(m.card).pts;
    if (m.how === 'pay') t = 'Build ' + nm + ': you can afford it' + (pts ? ', and it scores ' + pts + (pts === 1 ? ' point.' : ' points.') : '.');
    else if (m.how === 'occupy') t = 'Play ' + nm + ' free into its matching building.';
    else t = 'Play ' + nm + ' the cheaper way.';
  } else if (m.type === 'prepare') t = 'All workers are out: Prepare for ' + SEASN[Math.min(3, p.season + 1)] + '. They come home.';
  else if (m.type === 'pass') t = 'Nothing worthwhile is left to do. Passing keeps your city for scoring.';
  else if (m.type === 'choose') t = m.label || '';
  t = capW(t, 15);
  if (!t && m.type === 'choose') t = capW('Best choice here: ' + capW(m.label, 8), 15);
  return t || 'The computer helper picks this one.';
}
// the element the move is tapped on right now (the glowing thing), or null
function hlpEl(m) {
  if (!m || !UI.tgEls) return null;
  let tg = tgOf(m);
  if (UI.sel) { const i = UI.sel.ms.findIndex(x => sameM(x, m)); if (i < 0) return null; tg = 'o:' + i; }
  let el = UI.tgEls[tg];
  if (!el && G.q && m.type === 'choose') el = UI.tgEls['q:' + m.i];
  return el && el.isConnected ? el : null;
}
function hlpSuggest() {
  if (!hlpPhase()) return null;
  const a = HB.actor(G);
  try { computeRec(true); } catch (e) { return null; }
  const m = UI.rec && UI.rec.m; if (!m || !hlpEl(m)) return null;
  const mk = m.type === 'choose' ? 'q' + m.i : tgOf(m);
  return { why: hlpWhy(m, a), key: mk, m, target: () => { const e = hlpEl(m); return hlpEl(m); } };
}
// ---------------------------------------------------------------- wiring
// the middle of every button is a spot a bubble must not cover (the kit avoids [data-gxh-avoid]); invisible 2px markers, redrawn with the board
function hlpMarks() {
  document.querySelectorAll('i.gxm').forEach(e => e.remove());
  if (!G || !UI.started) return;
  const W = innerWidth, H = innerHeight, f = document.createDocumentFragment();
  document.querySelectorAll('button').forEach(b => {
    if (b.closest('[data-help],[hidden],#start,#netbox')) return;
    const r = b.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return;
    const x = r.left + r.width / 2, y = r.top + r.height / 2; if (x < 0 || y < 0 || x > W || y > H) return;
    const m = document.createElement('i'); m.className = 'gxm'; m.setAttribute('data-gxh-avoid', ''); m.setAttribute('aria-hidden', 'true');
    m.style.cssText = 'position:fixed;pointer-events:none;width:2px;height:2px;left:' + Math.round(x - 1) + 'px;top:' + Math.round(y - 1) + 'px'; f.appendChild(m);
  });
  document.body.appendChild(f);
}
let _hlpInit = false;
function hlpInit() {
  if (_hlpInit || typeof GXH === 'undefined') return; _hlpInit = true;
  GXH.init({ game: 'hollowbough', defaultOn: true, steps: HLP_STEPS, rules: HLP_RULES, avoid: '.glow,#acts .btn' });
  GXH.bulb({ el: '#bulbbtn', suggest: hlpSuggest, rulesFor: hlpPhase });
}
function hlpAfter() {
  hlpInit(); hlpMarks(); clearTimeout(UI.hmk); UI.hmk = setTimeout(hlpMarks, 200);   // again just before a bubble is placed (things may still be moving) if (typeof GXH === 'undefined') return;
  const st = $('#start'), nb = $('#netbox');
  GXH.phase(!G || !UI.started || (st && !st.hidden) || (nb && !nb.hidden) ? null : hlpPhase());
}
// ===================== part 12: the tutorial (shell/gx-tutor.js): a staged short game that teaches every rule by doing it once =====================
// The staged game: you and Bramble, one fixed deal (seed 4242), a city that already holds three red buildings, a short season (Winter, then Spring, then both pass).
// Bramble is scripted (tutAi) so each rule appears on cue. Nothing of it is saved, scored or counted. Each step spotlights one thing; only that thing answers;
// the step moves on only when the game reports that exact tap (GXT.act from onTarget).
const TUT_GAME = 'hollowbough', TUT_SEED = 4242;
function tutOn() { return typeof GXT !== 'undefined' && GXT.active() && !!(UI.cfg && UI.cfg.tutorial); }
function tutBtn(cls) { return typeof GXT === 'undefined' ? '' : GXT.menuHTML({ game: TUT_GAME, first: firstTime(), cls: cls, launch: tutStart }); }
function tutNode(cls) { const w = document.createElement('div'); w.innerHTML = tutBtn(cls); return w.firstChild; }
function firstTime() { try { return !localStorage.getItem('hb_played'); } catch (e) { return true; } }
function tutDone() { return typeof GXT !== 'undefined' && GXT.isDone(TUT_GAME); }
// ---------------------------------------------------------------- the staged deal (cards are taken out of wherever they are, so all 128 stay accounted for)
function tutTake(g, key, avoid) {
  for (let id = 0; id < HB.NCARDS; id++) {
    if (HB.cardKey(id) !== key || (avoid && avoid.includes(id))) continue;
    for (const pool of [g.deck, g.discard, g.limbo]) { const i = pool.indexOf(id); if (i >= 0) { pool.splice(i, 1); return id; } }
    const mi = g.meadow.indexOf(id); if (mi >= 0) { g.meadow[mi] = -1; HB._.withG(g, () => HB._.refill()); return id; }
    for (const p of g.players) { const hi = p.hand.indexOf(id); if (hi >= 0) { p.hand.splice(hi, 1); return id; } }
  }
  throw new Error('tutorial: no free ' + key);
}
function tutStage(g) {
  const p = g.players[0], out = [];
  while (p.hand.length) g.discard.push(p.hand.pop());
  for (const k of ['mine', 'twig_barge', 'resin_refinery', 'farm', 'wife']) { const id = tutTake(g, k, out); p.hand.push(id); out.push(id); }
  for (const k of ['inn', 'post_office', 'lookout']) { const id = tutTake(g, k, out); HB._.withG(g, () => HB._.placeInCity(0, id)); out.push(id); }
  const toad = tutTake(g, 'barge_toad', out); const old = g.meadow[2]; if (old >= 0) g.discard.push(old); g.meadow[2] = toad;
  g.forest = [6, 1, 5];   // Bumper Bramble, Foragers Crossing, Mixed Glade
  g.nolog = false;
}
const tutId = k => { const h = G && G.players[0].hand.find(id => HB.cardKey(id) === k); return h == null ? -1 : h; };
const tutToad = () => G.meadow.find(id => id >= 0 && HB.cardKey(id) === 'barge_toad');
// ---------------------------------------------------------------- Bramble is scripted: the same spots every time, then she passes
(function () {
  const o = HB.AI.choose;
  HB.AI.choose = function (g, seat, level) {
    if (UI.cfg && UI.cfg.tutorial && g === G && seat === 1) {
      const p = g.players[1], mv = HB.moves(g, 1), key = (p.season === 0 ? 'w' : 's') + p.dep.length;
      const basic = k => mv.find(m => m.type === 'worker' && m.k === 'basic' && D.basic[m.i].key === k);
      const want = { w0: () => basic('basic_pebble_bank'), w1: () => basic('basic_kindling_glen'), w2: () => mv.find(m => m.type === 'prepare'),
        s0: () => basic('basic_gossip_glade'), s1: () => basic('basic_amber_weep'), s2: () => mv.find(m => m.type === 'pass') };
      const m = want[key] && want[key](); if (m) return m;
    }
    return o.apply(this, arguments);
  };
})();
// ---------------------------------------------------------------- where each step points
const tgEl = tg => () => { const e = UI.tgEls && UI.tgEls[tg]; return e && e.isConnected && e.getBoundingClientRect().width ? e : null; };
const tq = sel => () => { const e = document.querySelector(sel); return e && e.getBoundingClientRect().width ? e : null; };
function tutUnion(sel) { return () => { const l = Array.from(document.querySelectorAll(sel)).map(e => e.getBoundingClientRect()).filter(r => r.width); if (!l.length) return null;
  const a = Math.min(...l.map(r => r.left)), b = Math.min(...l.map(r => r.top)), c = Math.max(...l.map(r => r.right)), d = Math.max(...l.map(r => r.bottom)); return { left: a, top: b, width: c - a, height: d - b }; }; }
// a fanned hand card: only its visible strip (the next card overlaps its right side), so the tap lands on that card
function tutHandRect(tg, id) { const e = UI.tgEls && UI.tgEls[tg]; if (!e || !e.isConnected) return null; const r = e.getBoundingClientRect(); if (!r.width) return null; let right = r.right;
  const nx = e.nextElementSibling; if (nx && nx.classList.contains('sc')) { const q = nx.getBoundingClientRect(); if (q.left > r.left + 6) right = Math.min(right, q.left); }
  const w = Math.max(24, right - r.left), cx = r.left + w / 2, cy = r.top + r.height / 2; return { left: cx - w * .45, top: cy - r.height * .4, width: w * .9, height: r.height * .8 }; }
const tutIdle = () => !!G && UI.started && !UI.cards.length && !UI.animBusy && !UI.sel && !UI.cityOpen && !G.q && G.phase !== 'over';
const myTurn = () => tutIdle() && HB.actor(G) === 0;
const tapIs = tg => ({ type: 'tap', match: a => a.tg === (typeof tg === 'function' ? tg() : tg) });
const sc0 = () => (G.over && G.over.scores[0]) || {};
const cardTitle = k => UI.cards.length && UI.cards[0].kind === k ? UI.cards[0].title : '';
function tutSteps() {
  return [
    { id: 'goal', title: 'Your goal', say: 'Build a woodland city. When everyone has passed, the most points wins. Scores show here.', target: tq('#bd .chips'), wait: null, ready: myTurn },
    { id: 'places', title: 'Places for workers', say: 'Each place gives goods or cards. Every turn you send one worker to one place.', target: tutUnion('#bd .tile.t-basic, #bd .tile.t-forest'), wait: null, ready: myTurn },
    { id: 'twig', title: 'Send a worker', say: 'Tap the Twig Heap. It gives 3 twigs.', target: tgEl('w:basic:4'), wait: tapIs('w:basic:4'), ready: () => myTurn() && !!tgEl('w:basic:4')() },
    { id: 'stock', title: 'Your goods', say: () => 'Twigs, resin, pebbles and berries pay for cards. You hold ' + G.players[0].res.twig + ' twigs now.', target: tq('#bd .resrow'), wait: null,
      ready: () => !!G && G.players[0].dep.length === 1 && !UI.cards.length },
    { id: 'rival', title: 'One worker per place', say: () => pname(1) + ' took the Pebble Bank. A place without the Shared mark holds one worker only.', target: () => { const e = document.querySelector('#bd .tile[data-k="basic"][data-i="3"]'); return e && e.getBoundingClientRect().width ? e : null; }, wait: null,
      ready: () => G.players[1].dep.length === 1 && myTurn() },
    { id: 'resin', title: 'Your second worker', say: 'Tap the Resin Pool. It gives 2 resin.', target: tgEl('w:basic:6'), wait: tapIs('w:basic:6'), ready: () => myTurn() && !!tgEl('w:basic:6')() },
    { id: 'hand', title: 'Your hand', say: 'These are your cards. Each shows its price in goods. Glowing cards are ones you can pay for.', target: tq('#bd .strip.hand'), wait: null, ready: () => myTurn() && !!tgEl('p:hand:' + tutId('farm'))() },
    { id: 'build', title: 'Build from your hand', say: 'Tap the Allotment. Pay 2 twigs and 1 resin.', target: () => tutHandRect('p:hand:' + tutId('farm')), wait: tapIs(() => 'p:hand:' + tutId('farm')),
      ready: () => myTurn() && !!tgEl('p:hand:' + tutId('farm'))() },
    { id: 'city', title: 'Your city', say: () => 'Built cards live here, ' + G.players[0].city.length + ' of 15: that is the limit. The Allotment gave a berry.', target: tq('#bd .strip.city'), wait: null,
      ready: () => !!G && G.players[0].city.some(e => HB.cardKey(e.id) === 'farm') && !UI.cards.length },
    { id: 'prep', title: 'Prepare for Spring', say: 'All workers are out. Prepare: they come home, you gain one, and the Allotment makes a berry.', target: tgEl('prep'), wait: tapIs('prep'),
      ready: () => myTurn() && !!tgEl('prep')() },
    { id: 'spring', title: 'A new season', say: () => 'Spring! You have ' + G.players[0].workers + ' workers and ' + G.players[0].res.berry + ' berries. Seasons go Winter, Spring, Summer, Autumn.', target: tq('#bd .resrow'), wait: null,
      ready: () => !!G && G.players[0].season === 1 && !UI.cards.length },
    { id: 'berry', title: 'A shared place', say: 'Tap the Berry Patch. Shared places take many workers.', target: tgEl('w:basic:0'), wait: tapIs('w:basic:0'), ready: () => myTurn() && !!tgEl('w:basic:0')() },
    { id: 'toad', title: 'Buy from the meadow', say: 'The meadow is open to everyone. Tap the Toad: critters cost berries.', target: () => { const id = tutToad(); return id == null ? null : tgEl('p:meadow:' + id)(); },
      wait: { type: 'tap', match: a => /^p:meadow:/.test(a.tg || '') && HB.cardKey(+a.tg.split(':')[2]) === 'barge_toad' }, ready: () => myTurn() && tutToad() != null && !!tgEl('p:meadow:' + tutToad())() },
    { id: 'free', title: 'A free critter', say: 'A critter plays free into its matching building. Tap Goodwife: your Allotment fits her.', target: () => tutHandRect('p:hand:' + tutId('wife')), wait: tapIs(() => 'p:hand:' + tutId('wife')),
      ready: () => myTurn() && !!tgEl('p:hand:' + tutId('wife'))() },
    { id: 'event', title: 'Claim an event', say: 'You own three red buildings. Tap this flag: your worker claims the event for 3 points.', target: tgEl('w:bev:1'), wait: tapIs('w:bev:1'),
      ready: () => myTurn() && !!tgEl('w:bev:1')() },
    { id: 'forest', title: 'Forest places', say: 'Forest cards pay more. Tap Bumper Bramble for 3 berries.', target: tgEl('w:forest:0'), wait: tapIs('w:forest:0'), ready: () => myTurn() && !!tgEl('w:forest:0')() },
    { id: 'pass', title: 'Pass when done', say: 'Summer would bring more workers. Here, tap Pass twice to finish your game.', target: tgEl('pass'), wait: { type: 'tap', times: 2, match: a => a.tg === 'pass' },
      ready: () => myTurn() && !!tgEl('pass')() },
    { id: 'score', title: 'Final score', say: () => { const s = sc0(); return 'Card points ' + s.cards + ', tokens ' + s.tokens + ', events ' + s.events + ': you score ' + s.total + '.'; }, target: tq('#pc .kv.tot'), wait: null,
      hold: c => c.kind === 'over-score', onNext: () => { UI._tutIn = 1; try { nextCard(); } finally { UI._tutIn = 0; } },
      ready: () => /^Final score: You/.test(cardTitle('over-score')) },
    { id: 'rscore', title: 'The rival scores', say: () => { const s = G.over.scores[1]; return pname(1) + ' scores ' + s.total + ' the same way. Passing early leaves workers unused.'; }, target: tq('#pc .kv.tot'), wait: null,
      hold: c => c.kind === 'over-score', onNext: () => { UI._tutIn = 1; try { nextCard(); } finally { UI._tutIn = 0; } },
      ready: () => new RegExp('^Final score: ' + pname(1)).test(cardTitle('over-score')) },
    { id: 'end', title: 'Most points wins', say: () => { const o = G.over; return o.winner === 0 ? 'You win, ' + o.scores[0].total + ' to ' + o.scores[1].total + '. A real game plays all four seasons.' : 'Highest total wins. A real game plays all four seasons.'; },
      target: tq('#pc .kv.tot'), wait: null, hold: c => c.kind === 'over', ready: () => !!cardTitle('over') }
  ];
}
// ---------------------------------------------------------------- the kit hooks
function tutHold(c) { if (typeof GXT === 'undefined' || !GXT.active()) return false; const st = GXT.current(); return !!(st && st.hold && st.hold(c)); }
function storyOpen() { if (typeof GXC === 'undefined') return; if (typeof GXT !== 'undefined' && !GXT.isDone(TUT_GAME)) tutStart({ prologue: true }); else campOpen(); }
function tutStart(o) {
  if (typeof GXT === 'undefined') return; const pro = !!(o && o.prologue), first = window.CAMPAIGN && window.CAMPAIGN.chapters && window.CAMPAIGN.chapters[0];
  GXT.start({ game: TUT_GAME, steps: tutSteps(), story: !!(window.CAMPAIGN && typeof GXC !== 'undefined'),
    endTitle: 'You know the rules', endText: pro ? 'Workers, goods, cards, events, seasons, passing, scoring. Now the Story begins.' : 'Workers, goods, cards, events, seasons, passing, scoring. The lightbulb explains the rest while you play.',
    endButtons: pro && first ? [{ id: 'chapter', label: 'Start chapter 1' }] : null,
    setup: () => { try { GX.close(); } catch (e) { } closePop(); UI.camp = null; UI.seed = TUT_SEED; newGame('tutorial'); },
    onDone: r => { tutLeave(); const c = r && r.choice;
      if (c === 'chapter' && first) { GXC.play(first.id); }
      else if (c === 'story' && typeof GXC !== 'undefined') { campOpen(); }
      else { showStart(); } },
    onExit: () => { tutLeave(); showStart(); } });
}
// leave the staged game: nothing of it is saved, and the board goes quiet behind the menu
function tutLeave() { clearTimeout(UI.tm); clearTimeout(UI.tr); UI.started = false; UI.cards = []; UI.sel = null; UI.cfg = null; G = null; fxClear(); try { GXH.hide(); } catch (e) { } try { const f = $('#finger'); if (f) f.hidden = true; } catch (e) { }
  const bd = $('#bd'); if (bd) bd.innerHTML = ''; try { GX.undo.clear(); } catch (e) { } }
// the first-time offer: tapping Play before ever playing or learning offers the tutorial once
function tutOffer(go) {
  if (typeof GXT === 'undefined' || !firstTime() || tutDone()) return false;
  try { if (localStorage.getItem('hb_offer')) return false; localStorage.setItem('hb_offer', '1'); } catch (e) { return false; }
  const d = document.createElement('div'); d.className = 'gxt-end'; d.setAttribute('data-help', ''); d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', 'New here?');
  d.innerHTML = '<div class="gxt-endc"><div class="gxt-et">New here?</div><div class="gxt-ex">Learn the rules in 5 minutes by doing them once. Or jump straight in.</div><div class="gxt-eb"><button type="button" class="gxt-b pri" data-offer="learn">Learn in 5 minutes</button><button type="button" class="gxt-b" data-offer="play">Play now</button></div></div>';
  d.addEventListener('click', e => { const b = e.target.closest('[data-offer]'); if (!b) return; d.remove(); if (b.dataset.offer === 'learn') tutStart(); else go(); });
  document.body.appendChild(d); return true;
}
// ---------------------------------------------------------------- the game tells the kit what the player does (before it is applied)
(function () {
  const o = onTarget;
  onTarget = function (tg, el) {
    if (tutOn() && !UI._tutIn) { if (!G || UI.cards.length) return; if (!/^x:/.test(tg) && !UI.animBusy && !GXT.act({ type: 'tap', tg })) return; }
    return o.apply(this, arguments);
  };
})();
(function () { const o = doUndo; doUndo = function () { if (tutOn()) return; return o.apply(this, arguments); }; })();
(function () { const o = nextCard; nextCard = function () { if (tutOn() && !UI._tutIn && UI.cards.length && UI.cards[0].kind !== 'pass') return; return o.apply(this, arguments); }; })();
// ===================== part 13: painted extras (card backs, tables, title and end art, portraits) and music (per screen + picker) =====================
const MEDIA = 'media/';
const unl = t => { try { const u = GXC.unlocked().filter(x => x.type === t); return u.length ? u[u.length - 1].id : null; } catch (e) { return null; } };
const IMG_OK = {};
const preImg = f => { const i = new Image(); i.onload = () => { IMG_OK[f] = 1; }; i.src = MEDIA + f + '.webp'; };
// ---- card backs: the deck tile and the help pictures wear the painted back; campaign unlocks (sprout, frost) replace the default
function backApply() {
  const R = document.documentElement, id = unl('cardback') || 'default';
  R.style.setProperty('--back-img', 'url(' + MEDIA + 'back-' + id + '.webp)');
  R.style.setProperty('--back-meadow', 'url(' + MEDIA + 'back-meadow.webp)');
}
// ---- tables: painted tree stump behind the board; the CSS green stays while it loads and if the file is missing
// bench + player mat paintings (transparent): the drawn ones hide once the picture has loaded
['bench','mat'].forEach(n => { const im = new Image(); im.onload = () => { document.documentElement.dataset[n] = '1'; }; im.src = MEDIA + n + '.webp'; });
const tblSeen = {}; let tblCur = '';
function tableApply() {
  const R = document.documentElement, id = unl('table') || 'woodland';
  const f = id === 'woodland' && matchMedia('(max-aspect-ratio:4/5)').matches ? 'table-woodland-phone' : 'table-' + id;
  if (f === tblCur) return;
  const go = () => { tblCur = f; R.style.setProperty('--tbl-img', 'url(' + MEDIA + f + '.webp)'); R.dataset.timg = '1'; };
  if (tblSeen[f]) return go();
  const im = new Image(); im.onload = () => { tblSeen[f] = 1; go(); }; im.src = MEDIA + f + '.webp';
}
// ---- title key art behind the start card (only once the picture has loaded)
function titleArt() {
  const R = document.documentElement; if (R.dataset.tart) return;
  const im = new Image(); im.onload = () => { R.dataset.tart = '1'; const s = $('#start'); if (s) s.classList.add('art'); }; im.src = MEDIA + (matchMedia('(max-aspect-ratio:4/5)').matches ? 'title-phone' : 'title') + '.webp';
}
// ---- end art: a painted banner on top of the result card
function hbWon() {
  if (!G || !G.over) return true; const ov = G.over;
  if (G.grim) return !!ov.win; if (watching()) return true;
  return ov.tie || humans().includes(ov.winner);
}
function endBanner() {
  const pc = $('#pc'); if (!pc || pc.getAttribute('data-card') !== 'over' || pc.querySelector('.endart')) return;
  const w = hbWon(); if (!IMG_OK[w ? 'end-win' : 'end-lose']) return;
  pc.insertBefore(h('div.endart.' + (w ? 'win' : 'lose'), { 'aria-hidden': 'true' }), pc.firstChild);
}
// ---- campaign portraits on the rival drawer
function portraitFor(name) {
  try { const c = window.CAMPAIGN && window.CAMPAIGN.cast; if (!c || !name) return null; for (const k in c) { const last = c[k].name.split(' ').pop(); if (name === c[k].name || name === last) return c[k]; } } catch (e) { }
  return null;
}
function rivalPortrait() {
  const b = $('#rivalbody'); if (!b || !G || UI.rseat == null || UI.rseat === 'G') return;
  const p = portraitFor(G.players[UI.rseat] && G.players[UI.rseat].name); if (!p || !UI.camp) return;
  const im = h('img.rport', { src: MEDIA + p.portrait, alt: '', draggable: 'false' }); im.style.borderColor = p.color; im.onerror = () => im.remove();
  b.insertBefore(h('div.rhead', im, h('b', p.name)), b.firstChild.nextSibling);
}
// ---- music: five slots (Menu, Game, Fight, Victory, Defeat), two Treblo tracks each, saved choice a / b / shuffle / off
const MSLOTS = [['tavern', 'Menu'], ['main', 'Game'], ['fight', 'Fight'], ['victory', 'Victory'], ['defeat', 'Defeat']];
const MTITLE = { 'tavern-a': 'The Village Wakes', 'tavern-b': 'Sunlight Through the Canopy', 'main-a': 'Quiet Cartographer', 'main-b': 'Meadowlight Turn', 'fight-a': 'Last Harvest Before Winter', 'fight-b': "Fiddle at the Wood's Edge", 'victory-a': 'Grove of Golden Light', 'victory-b': 'Tambourine at the Woodland Gate', 'defeat-a': 'Late October', 'defeat-b': 'Last Chord, Golden Light' };
const MDEF = { tavern: 'a', main: 'a', fight: 'a', victory: 'a', defeat: 'a' };
const MUS = { pick: Object.assign({}, MDEF), res: {}, sh: {}, want: null, wslot: null, prev: null, prevT: 0, last: null, since: 0 };
// 'all' = shuffle through every looping song (menu, game and fight tracks), a new one every ~2.5 min
const MLOOPS = ['tavern', 'main', 'fight'], MALL = Object.keys(MTITLE).filter(k => MLOOPS.includes(k.split('-')[0])), MALL_MS = 150000;
try { Object.assign(MUS.pick, JSON.parse(localStorage.getItem('hb_mpick') || '{}')); } catch (e) { }
function musicSlot() {
  const st = $('#start');
  if (!G || !UI.started || (st && !st.hidden)) return ['tavern', 0];
  if (G.phase === 'over') return [hbWon() ? 'victory' : 'defeat', 1];
  if (UI.camp && UI.camp.boss) return ['fight', 0];
  try { const p = G.players[Math.max(0, focusSeat())]; if (p && p.season === 3 && !(UI.cfg && UI.cfg.tutorial)) return ['fight', 0]; } catch (e) { }
  return ['main', 0];
}
function musicName(slot) {
  const c = MUS.pick[slot] || MDEF[slot]; if (c === 'off') return '-';
  if (c === 'all') { if (!MUS.res[slot]) { const pool = MALL.filter(k => k !== MUS.last); MUS.res[slot] = pool[Math.floor(Math.random() * pool.length)]; } return MUS.res[slot]; }
  if (c === 'shuffle') { if (!MUS.res[slot]) { MUS.sh[slot] = MUS.sh[slot] === undefined ? (Math.random() < .5 ? 0 : 1) : 1 - MUS.sh[slot]; MUS.res[slot] = slot + '-' + 'ab'[MUS.sh[slot]]; } return MUS.res[slot]; }
  return slot + '-' + (c === 'b' ? 'b' : 'a');
}
function musicSync() {
  if (UI.sound === false || !window.GA || MUS.prev) return;
  const w = musicSlot(); if (MUS.wslot !== w[0]) { MUS.wslot = w[0]; MUS.res[w[0]] = null; }
  else if (MUS.pick[w[0]] === 'all' && !w[1] && MUS.since && Date.now() - MUS.since > MALL_MS) MUS.res[w[0]] = null;
  const n = musicName(w[0]); if (MUS.want === n) return; MUS.want = n; MUS.since = Date.now(); if (n !== '-') MUS.last = n;
  if (n === '-') { GA.music(null, { fade: 1 }); return; }
  GA.music(n, { fade: w[1] ? .6 : 1, once: !!w[1] });
  if (w[0] === 'tavern' || w[0] === 'main') setTimeout(() => { try { const nx = w[0] === 'tavern' ? 'main' : 'fight', c = MUS.pick[nx]; if (c !== 'off' && c !== 'shuffle' && c !== 'all') GA.preload(musicName(nx)); } catch (e) { } }, 4000);
}
function musicPick(slot, c) {
  MUS.pick[slot] = c; MUS.res[slot] = null; try { localStorage.setItem('hb_mpick', JSON.stringify(MUS.pick)); } catch (e) { }
  if (window.GA && c !== 'off' && c !== 'shuffle' && c !== 'all') try { GA.preload(musicName(slot)); } catch (e) { }
  if (MUS.wslot === slot && !MUS.prev) { MUS.want = null; musicSync(); }
}
function musicPreview(slot) {
  if (!window.GA || UI.sound === false || MUS.wslot === slot) return; const n = musicName(slot); if (n === '-') return;
  clearTimeout(MUS.prevT); MUS.prev = slot; MUS.want = null; GA.music(n, { fade: .5, once: true });
  MUS.prevT = setTimeout(() => { MUS.prev = null; MUS.want = null; musicSync(); renderMusic(); }, 8000);
}
function musicPreviewStop() { if (!MUS.prev) return; clearTimeout(MUS.prevT); MUS.prev = null; MUS.want = null; musicSync(); }
function renderMusic() {
  const b = $('#musicbody'); if (!b) return; b.innerHTML = '';
  const on = UI.sound !== false; let vol = .5; try { vol = GA.state().musVol; } catch (e) { }
  const chip = (cls, at, label) => h('button.mchip' + cls, Object.assign({ type: 'button' }, at), label);
  const slider = h('input#mvol', { type: 'range', min: 0, max: 1, step: .05, value: vol, 'aria-label': 'Music volume' });
  slider.addEventListener('input', () => { try { GA.setVolume('music', +slider.value); } catch (e) { } });
  b.appendChild(h('div.mtop', chip(on ? '.on' : '', { 'data-a': 'mmus' }, 'Music: ' + (on ? 'on' : 'off')), h('label.mvol', 'Volume ', slider)));
  b.appendChild(h('div.mtop', chip(MLOOPS.every(k => MUS.pick[k] === 'all') ? '.on' : '', { 'data-a': 'mall' }, '⇄ Shuffle all songs')));
  MSLOTS.forEach(([k, nm]) => {
    const cur = MUS.pick[k], act = MUS.wslot === k && on && cur !== 'off';
    const row = h('div.mchips');
    ['a', 'b'].forEach(v => row.appendChild(chip(cur === v ? '.on' : '', { 'data-a': 'mpick', 'data-s': k, 'data-c': v }, MTITLE[k + '-' + v])));
    row.appendChild(chip(cur === 'shuffle' ? '.on' : '', { 'data-a': 'mpick', 'data-s': k, 'data-c': 'shuffle' }, '⇄ Shuffle'));
    if (MLOOPS.includes(k)) row.appendChild(chip(cur === 'all' ? '.on' : '', { 'data-a': 'mpick', 'data-s': k, 'data-c': 'all' }, '⇄ All songs'));
    row.appendChild(chip(cur === 'off' ? '.on' : '', { 'data-a': 'mpick', 'data-s': k, 'data-c': 'off' }, 'Off'));
    if (MUS.prev === k) row.appendChild(chip('.prev', { 'data-a': 'mprevx', 'data-s': k }, '■ Stop preview'));
    else if (!act && cur !== 'off' && on) row.appendChild(chip('.prev', { 'data-a': 'mprev', 'data-s': k }, '▶ Preview'));
    b.appendChild(h('div.mrow2', h('h3', nm, act ? h('small', ' playing now') : null), row));
  });
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-a]'); if (!t) return; const a = t.dataset.a;
  if (a === 'musicopen') { try { GX.close(); } catch (x) { } renderMusic(); GX.show('musicd'); }
  else if (a === 'mpick') { musicPick(t.dataset.s, t.dataset.c); renderMusic(); }
  else if (a === 'mall') { const on = MLOOPS.every(k => MUS.pick[k] === 'all'); MLOOPS.forEach(k => musicPick(k, on ? MDEF[k] : 'all')); renderMusic(); }
  else if (a === 'mprev') { musicPreview(t.dataset.s); renderMusic(); }
  else if (a === 'mprevx') { musicPreviewStop(); renderMusic(); }
  else if (a === 'mmus') { UI.sound = UI.sound === false; try { if (window.GA) { GA.setSfx(UI.sound); GA.setMusic(UI.sound); } } catch (x) { } MUS.want = null; sndMusic(); renderMusic(); try { GX.renderSettings(); } catch (x) { } }
});
function extrasBoot() {
  GX.drawer('musicd', 'Music', h('div#musicbody'));
  backApply(); tableApply(); titleArt();
  ['back-default', 'back-meadow', 'camp-hazel', 'camp-bramble', 'end-win', 'end-lose'].forEach(preImg);
  addEventListener('resize', () => { tableApply(); });
  setInterval(() => { try { sndMusic(); backApply(); tableApply(); } catch (e) { } }, 800);
}
// the start card, the result card and the rival drawer pick up the new pieces after each render
(function () {
  const rs = renderStart; renderStart = function () { const r = rs.apply(this, arguments); try { titleArt(); sndMusic(); } catch (e) { } return r; };
  const rc = renderCard; renderCard = function () { const r = rc.apply(this, arguments); try { endBanner(); } catch (e) { } return r; };
  const rr = renderRival; renderRival = function () { const r = rr.apply(this, arguments); try { rivalPortrait(); } catch (e) { } return r; };
})();

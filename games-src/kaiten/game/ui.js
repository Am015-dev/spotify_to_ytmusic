// ===================== part 1: globals, helpers, table model, scoring hints =====================
var ANIM = 1, AIDELAY = 650;
var G = null;
var UI = { started: false, mode: 'vs', cfg: null, holder: -1, sel: [], twin: false, pop: null, cards: [], fz: null, busy: false, seq: 0, rec: null, noRec: false, over: null,
  coach: { level: 'full', seen: {}, turn: '' }, prefs: { hint: true, tap2: null, sound: true, music: true, gfx: 'auto', undo: 'short' }, enter: '', land: null, tm: null, pend: null, rq: [] };
const D = KK.DATA;
const KIT = KKKit;
const TY = KIT.TYPES;
const ORDER = KIT.ORDER;
// painted art: KK_ART (data URIs made by build.py) -> blob URLs so the many card <svg>s only carry a short link. Without blob URLs
// (old browsers, jsdom) the kit keeps its own vector drawings.
(function () {
  try {
    if (typeof KK_ART === 'undefined' || /jsdom/i.test(navigator.userAgent || '') || !window.URL || !URL.createObjectURL || !window.Blob || !window.atob) return;
    const m = {};
    for (const k in KK_ART) { const p = KK_ART[k].split(','), mime = (/data:([^;]+)/.exec(p[0]) || [0, 'image/webp'])[1], bin = atob(p[1]), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); m[k] = URL.createObjectURL(new Blob([u], { type: mime })); }
    KIT.setArt(m);
  } catch (e) { }
})();
const $ = s => /^#[\w-]+$/.test(s) ? document.getElementById(s.slice(1)) : document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PN = KIT.PLAYERS.map(p => p.name);
const DEF = { np: 3, level: 'normal', lv: ['hard', 'normal', 'normal', 'easy'], seats: [2, 3] };
const NIG = { salmon: 2, squid: 3, egg: 1 };
const ICONS = { roll1: 1, roll2: 2, roll3: 3 };
const tkey = id => KK.cardKey(id);
const cname = id => KK.cardName(id);
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
function svgEl(s) { const t = document.createElement('template'); t.innerHTML = s.trim(); return t.content.firstChild; }
// ---- cached art strings
const _art = new Map();
function cached(key, fn) { let v = _art.get(key); if (v === undefined) { v = fn(); _art.set(key, v); } return v; }
const _nodes = new Map();
function artNode(key, strFn) { let t = _nodes.get(key); if (!t) { t = svgEl(strFn()); _nodes.set(key, t); } return t.cloneNode(true); }
const plateN = (type, d, on) => artNode('p|' + type + '|' + d + '|' + (on || ''), () => KIT.plateSVG(type, on ? { d, on } : { d }));
// seat -> diner (chef portrait / colour). Local games may seat any of the chefs; online games use the seat number.
const chefOf = s => UI.chefs && UI.chefs[s] != null ? UI.chefs[s] : s;
const avC = (c, size) => artNode('a|' + c + '|' + size, () => KIT.avatarSVG(c % 5, { size }));
const avN = (i, size) => avC(chefOf(i), size);
const backN = w => artNode('b|' + w, () => KIT.backSVG({ w }));
const plateS = (type, d, on) => cached('p|' + type + '|' + d + '|' + (on || ''), () => KIT.plateSVG(type, on ? { d, on } : { d }));
const avatarC = (c, size) => cached('a|' + c + '|' + size, () => KIT.avatarSVG(c % 5, { size }));
const avatarS = (i, size) => avatarC(chefOf(i), size);
const iconS = (name, size, type) => cached('i|' + name + '|' + size + '|' + (type || ''), () => KIT.iconSVG(name, type ? { size, type } : { size }));
const counterURL = s => { const seat = chefOf(s); return KIT.ART.counter ? 'linear-gradient(180deg,rgba(42,18,12,.16),rgba(42,18,12,0) 22%),linear-gradient(0deg,' + KIT.PLAYERS[seat % 5].c + ' 6px,transparent 6px),url("' + KIT.ART.counter + '") 0 0/auto 170% repeat-x' : cached('c|' + seat, () => 'url("' + KIT.dataURL(KIT.counterSVG({ w: 360, h: 120, seat, standalone: true }).replace('<svg ', '<svg preserveAspectRatio="none" ')) + '") center/100% 100%'); };
function cardNode(type, w, on) { return KIT.cardEl(type, on ? { w, variant: 'nigiri', on } : { w }); }
function cardDiv(type, w, on) { const d = h('div.cd'); d.style.width = w + 'px'; d.style.height = Math.round(w * 1.4) + 'px'; d.appendChild(cardNode(type, w, on)); return d; }
// ---- game helpers
const humans = () => G ? G.players.map((p, i) => p.ai ? -1 : i).filter(i => i >= 0) : [];
const hotSeat = () => !!G && !NET.on && humans().length > 1;
const watching = () => !!G && humans().length === 0;
function viewSeat() { if (!G) return -1; if (NET.on) return NET.mySeat; if (hotSeat()) return UI.holder; const hs = humans(); return hs.length ? hs[0] : -1; }
const pname = s => G && G.players[s] ? G.players[s].name : '?';
const pcol = s => KIT.PLAYERS[chefOf(s) % 5];
const nameList = a => a.length <= 1 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
// the tables as displayed: a frozen copy during the reveal sequence, otherwise the real ones
function tables() { return UI.fz && UI.fz.tables ? UI.fz.tables : G.players.map(p => p.table); }
function pudCounts() {
  // custards kept (banked) + custards on the table this round
  const tab = tables();
  return G.players.map((p, i) => {
    let banked = p.pud.length;
    if (UI.fz && UI.fz.tables && UI.fz.pudSub) banked -= UI.fz.pudSub[i];
    return banked + tab[i].filter(e => tkey(e.id) === 'pudding').length;
  });
}
function dispHand() {
  const v = viewSeat(); if (v < 0 || !G) return [];
  if (UI.fz && UI.fz.hand) return UI.fz.hand;
  const p = G.players[v], pk = p.picked && p.pick ? p.pick : UI.hold && UI.hold.seat === v ? UI.hold.mv.ids : [];
  return p.hand.filter(id => pk.indexOf(id) < 0);
}
const mySeatPicked = () => { const v = viewSeat(); return v >= 0 && G && G.players[v].picked; };
function canPick() { const v = viewSeat(); return !!G && G.phase === 'pick' && v >= 0 && !G.players[v].picked && !UI.hold && !UI.busy && !UI.cards.length && !UI.fz && !(NET.on && !NET.hostPeer && isClient()) && !(NET.on && NET.pend === G.round * 100 + G.turn && Date.now() - NET.pendT < 2500); }
function mkey(m) { return m && m.pick ? m.pick.join(',') : ''; }
// ---- scoring model for the table (works on any displayed tables)
function liveScores(tab) { return KK.roundScores({ players: tab.map(t => ({ table: t })) }); }
function makiRank(icons) {
  // -> array of 0 (none) / 1 (most) / 2 (second) per seat, and points via KK.makiPoints
  const pts = KK.makiPoints(icons); let max = 0; icons.forEach(x => { if (x > max) max = x; });
  return icons.map((x, i) => x <= 0 ? 0 : x === max ? 1 : pts[i] > 0 ? 2 : 0).map((r, i) => ({ rank: r, pts: pts[i] }));
}
const ORD = ['', '1st', '2nd'];
// group descriptors for one seat: what the counter shows (grouped by type, with live hints)
function groupsOf(s, tab, sc) {
  const t = tab[s], c = KK.tableCounts(t), out = [];
  const mk = (k, o) => out.push(Object.assign({ k, seat: s }, o));
  if (c.tempura) { const n = c.tempura, p = Math.floor(n / 2) * 5; mk('tempura', { type: 'tempura', n, pts: p, hint: n % 2 === 0 ? '= ' + p : (p ? p + ' +1/2' : '1 of 2'), cls: p ? 'ok' : 'wait', tip: n + ' Crispy Prawn' + (n > 1 ? 's' : '') + ': every pair is worth 5 points' + (n % 2 ? ', one more would make another pair.' : '.') }); }
  if (c.sashimi) { const n = c.sashimi, p = Math.floor(n / 3) * 10, r = n % 3; mk('sashimi', { type: 'sashimi', n, pts: p, hint: r === 0 ? '= ' + p : (p ? p + ' +' + r + '/3' : r + ' of 3'), cls: p ? 'ok' : 'wait', tip: n + ' Fish Slice' + (n > 1 ? 's' : '') + ': each set of three is worth 10 points' + (r ? '; ' + (3 - r) + ' more would finish another set.' : '.') }); }
  if (c.dumpling) { const n = c.dumpling, p = KK.dumplingPts(n); mk('dumpling', { type: 'dumpling', n, pts: p, hint: '= ' + p, cls: 'ok', tip: n + ' Steam Bun' + (n > 1 ? 's' : '') + ' = ' + p + ' points' + (n < 5 ? ' (the next bun makes it ' + KK.dumplingPts(n + 1) + ').' : ' (five or more is the top of the ladder).') }); }
  if (c.icons) { const rk = sc.mk[s]; mk('roll', { type: 'roll2', n: c.icons, pts: rk.pts, hint: rk.rank ? ORD[rk.rank] + ' +' + rk.pts : 'no rank', cls: rk.rank ? 'ok' : 'wait', tip: c.icons + ' roll icons this round: ' + (rk.rank === 1 ? 'most icons right now (' + rk.pts + ' points).' : rk.rank === 2 ? 'second most right now (' + rk.pts + ' points).' : 'not scoring yet. Most icons scores 6, second most 3.') }); }
  const by = { salmon: [0, 0], squid: [0, 0], egg: [0, 0] };
  for (const e of t) { const k = tkey(e.id); if (NIG[k]) by[k][e.w >= 0 ? 1 : 0]++; }
  for (const k of ['salmon', 'squid', 'egg']) {
    if (by[k][0]) mk('n-' + k, { type: k, n: by[k][0], pts: NIG[k] * by[k][0], hint: '= ' + NIG[k] * by[k][0], cls: 'ok', tip: by[k][0] + ' ' + TY[k].name + ': ' + NIG[k] + ' point' + (NIG[k] > 1 ? 's' : '') + ' each.' });
    if (by[k][1]) mk('pn-' + k, { type: 'wasabi', on: k, n: by[k][1], pts: 3 * NIG[k] * by[k][1], hint: '= ' + 3 * NIG[k] * by[k][1], cls: 'ok', tip: by[k][1] + ' ' + TY[k].name + ' on Fire Paste: tripled to ' + 3 * NIG[k] + ' each.' });
  }
  if (c.wasabiUnused) mk('wasabi', { type: 'wasabi', n: c.wasabiUnused, pts: 0, hint: 'waiting', cls: 'wait', pulse: true, tip: c.wasabiUnused + ' Fire Paste waiting for a nigiri: your next nigiri lands on it and scores triple. With none it scores nothing.' });
  if (c.chop) mk('chop', { type: 'chop', n: c.chop, pts: 0, hint: 'ready', cls: 'ok', tip: 'Twin Sticks on the table: on a later turn you may serve two plates from your hand, then the sticks go back into that hand.' });
  const pud = t.filter(e => tkey(e.id) === 'pudding').length;
  return { list: out, pudNow: pud };
}
function seatScoreInfo(tab) {
  const rs = liveScores(tab), mk = makiRank(rs.map(r => r.icons));
  return { rs, mk };
}
// what would serving these cards score right now (round points only)
function gainOf(seat, ids) {
  try {
    const tab = tables().map(t => t.map(e => ({ id: e.id, w: e.w })));
    const base = liveScores(tab)[seat].total;
    const me = tab[seat];
    if (ids.length === 2) { const ci = me.findIndex(e => tkey(e.id) === 'chop'); if (ci >= 0) me.splice(ci, 1); }
    const holder = { table: me };
    for (const id of KK.placeOrder(ids)) KK._.place(holder, id);
    return liveScores(tab)[seat].total - base;
  } catch (e) { return 0; }
}
function whyPick(ids) {
  const v = viewSeat(), g = gainOf(v, ids), k = ids.map(tkey);
  const t = tables()[v], c = KK.tableCounts(t);
  if (k.includes('wasabi') && k.some(x => NIG[x])) return 'Fire Paste and a nigiri together: the nigiri scores triple.';
  if (k.length === 2) return 'Twin Sticks: two plates for one turn' + (g > 0 ? ', worth +' + g + ' right now.' : '.');
  const x = k[0];
  if (x === 'tempura') return c.tempura % 2 ? 'This finishes a pair of prawns: +5.' : 'The start of a prawn pair (5 points once you have two).';
  if (x === 'sashimi') return c.sashimi % 3 === 2 ? 'This finishes a set of fish slices: +10.' : 'Fish slices only score in sets of three.';
  if (x === 'dumpling') return 'Each extra bun is worth more: now ' + KK.dumplingPts(c.dumpling) + ' after, then ' + KK.dumplingPts(c.dumpling + 1) + '.';
  if (ICONS[x]) return 'Roll icons race for the most this round (6 points, second 3).';
  if (NIG[x]) return c.wasabiUnused ? 'Your Fire Paste is waiting: this nigiri scores triple (+' + NIG[x] * 3 + ').' : 'A nigiri is worth ' + NIG[x] + ' point' + (NIG[x] > 1 ? 's' : '') + ' straight away.';
  if (x === 'wasabi') return 'Fire Paste triples the next nigiri you serve.';
  if (x === 'chop') return 'Twin Sticks let you serve two plates on a later turn.';
  if (x === 'pudding') return 'Custard is kept to the end of the game: most scores +6, fewest loses 6.';
  return '';
}
function logSince(i) { return G.log.filter(x => x.i > i).map(x => x.t); }
function toast(t) { const el = $('#toast'); if (!el) return; el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 2200); }
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
// the computer speed now lives in the shared settings (GX.pref('ai')); an old per-game speed in kk_prefs is ignored
function loadPrefs() { try { const p = JSON.parse(lsGet('kk_prefs') || '{}'); delete p.speed; Object.assign(UI.prefs, p); } catch (e) { } }
function savePrefs() { lsSet('kk_prefs', JSON.stringify(UI.prefs)); }
const animF = () => { try { return Math.max(.3, GX.animMs(1000) / 1000 || 1); } catch (e) { return 1; } };
const wait = ms => ANIM ? new Promise(r => setTimeout(r, ms * (AIDELAY > 0 ? Math.max(.35, AIDELAY / 650) : .35) * animF())) : Promise.resolve();
// ===================== part 2: rendering (table, belt, dock) =====================
const isPh = () => document.documentElement.classList.contains('ph');
function focusSeat() { const v = viewSeat(); if (v >= 0) UI.focus = v; return UI.focus || 0; }
function render() {
  if (!G || !UI.started) return;
  renderBar(); renderTable(); renderBelt(); renderDock();
  try { renderDrawers(); } catch (e) { }
  try { netRenderHook(); } catch (e) { }
  if (PX.on) pxDirty();
}
function renderBar() {
  const s = $('#barstat'); if (!s) return;
  const re = UI.fz && UI.fz.roundEnd, rd = re ? (G.phase === 'over' ? D.rounds : G.round - 1) : G.round;
  s.textContent = G.phase === 'over' && !re ? 'Game over' : re ? 'Round ' + rd + ' of ' + D.rounds + ' · scoring' : 'Round ' + G.round + ' of ' + D.rounds + ' · Turn ' + G.turn + ' of ' + G.hand;
}
function bankedOf(s) {
  const fzEnd = UI.fz && UI.fz.tables && UI.fz.roundEnd;
  const list = fzEnd ? G.rs.slice(0, -1) : G.rs;
  return list.reduce((a, r) => a + r[s].total, 0);
}
function totalOf(s, info) {
  if (G.phase === 'over' && !(UI.fz && UI.fz.tables)) return G.final.totals[s];
  return bankedOf(s) + (G.phase === 'over' && !(UI.fz && UI.fz.tables) ? 0 : info.rs[s].total);
}
function boardSize() { const b = $('#board'); const w = b ? b.clientWidth : 0, hh = b ? b.clientHeight : 0; return { w: w || 900, h: hh || 640 }; }
function layoutNums(np, hasMe, tblH) {
  const { w, h: hgt } = boardSize(), ph = isPh(), land = ph && w >= hgt;
  const o = hasMe ? np - 1 : np, meW = hasMe ? 1.35 : 0;
  let cols = 2;
  if (w < 560 && !land) cols = 1;
  else for (const c of [1, 2, 3]) { if (c > Math.max(1, o)) break; const rows = Math.ceil(o / c) + meW; if ((tblH - 6 * (Math.ceil(o / c) + (hasMe ? 1 : 0))) / rows >= 86) { cols = c; break; } if (c === 3) cols = 2; }
  if (o <= 1) cols = 1;
  return { w, h: hgt, cols, orows: Math.ceil(o / cols), ph, land };
}
function renderTable() {
  const tbl = $('#tbl'); if (!tbl) return;
  const np = G.np, v = viewSeat(), hasMe = v >= 0, f = focusSeat();
  const tab = tables(), info = seatScoreInfo(tab), pcs = pudCounts();
  const beltH = $('#beltz') ? $('#beltz').offsetHeight : 0;
  const L0 = boardSize(), tblH0 = Math.max(120, L0.h - (beltH || (isPh() ? 150 : 210)) - 10);
  const L = layoutNums(np, hasMe, tblH0);
  const order = []; if (hasMe) { for (let k = 1; k < np; k++) order.push((f + k) % np); order.push(f); } else for (let k = 0; k < np; k++) order.push(k);
  tbl.style.setProperty('--cols', L.cols);
  const meW = 1.35, rowsTpl = hasMe ? (L.orows ? 'repeat(' + L.orows + ',minmax(0,1fr)) minmax(0,' + meW + 'fr)' : 'minmax(0,1fr)') : 'repeat(' + L.orows + ',minmax(0,1fr))';
  tbl.style.gridTemplateRows = rowsTpl;
  const tblH = Math.max(120, L.h - (beltH || (L.ph ? 150 : 210)) - 10), tblW = L.w - 16;
  const nrow = L.orows + (hasMe ? meW : 0), rH = Math.max(44, (tblH - 6 * (L.orows + (hasMe ? 1 : 0))) / nrow);
  const rowOther = rH, rowMe = rH * meW;
  const els = [], oldSeats = {}; for (const c of tbl.children) if (c.dataset && c.dataset.sg) oldSeats[c.dataset.rk] = c;
  const sigAll = [L.cols, np, hasMe ? 1 : 0].join(',');
  for (const s of order) {
    const isMe = hasMe && s === f;
    const rowH = isMe ? rowMe : rowOther, cw = isMe ? tblW : tblW / L.cols;
    const av = Math.max(34, Math.min(isMe ? 60 : 52, Math.round(rowH * .46)));
    const cmp = rowH < 88, shw = av + 14, sl = Math.max(30, Math.min(58, Math.round((rowH - (cmp ? 12 : 36)) / 1.4)));
    const ctrW = cw - shw - sl - 25;
    let pd = Math.min(rowH - (isMe ? 34 : 32), ctrW / (isMe ? 7.2 : 5.6) - 6, isMe ? 84 : 68), wrap = false;
    if (L.ph) {
      // phones: size the plates by how many groups this counter really holds, and use two rows before plates get tiny
      const ng = groupsOf(s, tab, info).list.length + 1, cap = isMe ? 84 : 68;
      const fit = rows => Math.min(Math.floor((ctrW - 12) / Math.ceil(ng / rows)) - 18, Math.floor((rowH - 8) / rows) - 21);
      const one = Math.min(rowH - (isMe ? 34 : 32), fit(1)), two = fit(2);
      if (one < 34 && two > one) { pd = two; wrap = true; } else pd = one;
      pd = Math.min(cap, pd);
    }
    pd = Math.max(24, Math.round(pd));
    const dm = { av, shw, sl, pd, cmp, wrap };
    const sg = seatSig(s, tab, info, pcs, isMe, dm) + '|' + sigAll;
    const old = oldSeats[s];
    if (old && old.dataset.sg === sg) { els.push(old); continue; }
    const e = seatEl(s, tab, info, pcs, isMe, dm); e.dataset.rk = s; e.dataset.sg = sg; els.push(e);
  }
  let same = tbl.children.length === els.length; if (same) for (let i = 0; i < els.length; i++) if (tbl.children[i] !== els[i]) { same = false; break; }
  if (!same) tbl.replaceChildren(...els);
  if (UI.land && PX.on) for (const k of UI.land) PX.landSet.add(k);
  UI.land = null;
  if (!tbl.__ap) { tbl.__ap = 1; try { KIT.applyTable($('#bd'), 'day'); } catch (e) { } }
}
function seatSig(s, tab, info, pcs, isMe, dm) {
  const p = G.players[s], fz = UI.fz && UI.fz.slots, sl = fz ? JSON.stringify(fz[s]) : (G.phase === 'pick' ? (p.picked ? 'p' : 'w') : 'x');
  const lnd = UI.land ? [...UI.land].filter(x => x.startsWith(s + '|')).join(',') : '';
  return [s, isMe ? 1 : 0, totalOf(s, info), info.rs.map(r => r.icons).join('/'), tab[s].map(e => e.id + ':' + e.w).join(','), pcs[s], sl, lnd, dm.av, dm.shw, dm.sl, dm.pd, dm.cmp ? 1 : 0, dm.wrap ? 1 : 0, p.name, p.ai || '', G.phase === 'pick' && !p.picked && !UI.fz ? 'c' : '', s === viewSeat() ? 'v' : '', G.phase].join('|');
}
function seatEl(s, tab, info, pcs, isMe, dm) {
  const p = G.players[s], col = pcol(s), picking = G.phase === 'pick' && !p.picked && !UI.fz;
  const gs = groupsOf(s, tab, info), total = totalOf(s, info);
  const el = h('section.seat' + (isMe ? '.me' : '') + (picking ? '.choose' : ''), { 'data-seat': s, 'aria-label': p.name + (p.ai ? ', computer' : '') + ', ' + total + ' points' });
  el.style.setProperty('--pd', dm.pd + 'px'); el.style.setProperty('--shw', dm.shw + 'px'); el.style.setProperty('--av', dm.av + 'px'); el.style.setProperty('--sl', dm.sl + 'px'); el.style.setProperty('--ctr', counterURL(s));
  const av = h('div.av' + (picking ? '.act' : '')); av.appendChild(avN(s, 96));
  av.appendChild(h('span.sc', String(total)));
  const sh = h('button.sh', { type: 'button', 'data-a': 'seat', 'data-seat': s, 'aria-label': p.name + (p.ai ? ' (computer ' + p.ai + ')' : '') + ': ' + total + ' points. Open details.' }, av, h('span.nm', h('i.gx-cbm', GX.mark(chefOf(s)) + ' '), p.name));
  el.appendChild(sh);
  const ctr = h('div.ctr' + (dm.wrap ? '.wrap' : ''));
  const land = UI.land || new Set();
  for (const g of gs.list) ctr.appendChild(grpEl(g, dm.pd, land.has(s + '|' + g.k)));
  ctr.appendChild(shelfEl(s, pcs[s], dm.pd, land.has(s + '|pud'), isPh() && dm.pd < 44));
  if (!gs.list.length && !pcs[s]) ctr.insertBefore(h('span.none', G.phase === 'pick' ? 'Nothing served yet' : ''), ctr.firstChild);
  el.appendChild(ctr);
  el.appendChild(slotEl(s, dm.sl, dm.cmp));
  return el;
}
function grpEl(g, pd, landing) {
  const layers = Math.min(g.n, 3);
  const b = h('button.grp.' + g.cls + (g.pulse ? '.waitf' : '') + (landing ? '.land' : ''), { type: 'button', 'data-a': 'grp', 'data-seat': g.seat, 'data-k': g.k, 'data-type': g.type, 'data-on': g.on || null, 'data-n': g.n, 'data-pts': g.pts, 'aria-label': g.tip, title: g.tip });
  const pl = h('div.pl'); pl.style.width = (pd + 6 * (layers - 1)) + 'px';
  for (let i = 0; i < layers; i++) pl.appendChild(plateN(g.type, pd, g.on));
  b.appendChild(pl);
  if (g.n > 1 || g.k === 'roll') b.appendChild(h('span.bg', (g.k === 'roll' ? '' : '×') + g.n));
  b.appendChild(h('span.hn', g.hint));
  return b;
}
function shelfEl(s, n, pd, landing, short) {
  const tip = n + ' Custard Cup' + (n === 1 ? '' : 's') + ' kept for the end of the game (most scores 6, fewest loses 6; no penalty with 2 players).';
  const b = h('button.grp.shelf' + (landing ? '.land' : ''), { type: 'button', 'data-a': 'grp', 'data-seat': s, 'data-k': 'pud', 'data-type': 'pudding', 'data-n': n, 'data-pts': 0, 'aria-label': tip, title: tip });
  const pl = h('div.pl'); pl.appendChild(plateN('pudding', pd)); if (!n) pl.style.opacity = '.45';
  b.appendChild(pl); b.appendChild(h('span.bg', String(n))); b.appendChild(h('span.hn', short ? 'kept' : 'custard'));
  return b;
}
function slotEl(s, sl, cmp) {
  const p = G.players[s], fz = UI.fz && UI.fz.slots;
  const box = h('div.sbox'), wrap = h('div.slot', box);
  const cover = () => { box.innerHTML = KIT.clocheSVG({ w: sl }); };
  if (fz) {
    const m = fz[s];
    if (m && m.mode === 'cover') { cover(); if (!cmp) wrap.appendChild(h('span.st.rd', 'ready')); }
    else if (m && (m.mode === 'faces' || m.mode === 'shown')) {
      const ids = m.cards, cw = ids.length > 1 ? Math.round(sl * .5) : sl; box.className = 'sbox two';
      const host = h('div.two'); box.appendChild(host);
      ids.forEach(c => { const hh = h('div.hostc'); hh.style.cssText = 'position:relative;width:' + cw + 'px;height:' + Math.round(cw * 1.4) + 'px'; hh.appendChild(cardNode(c.key, cw)); host.appendChild(hh); hh.dataset.host = s; });
      if (!cmp) wrap.appendChild(h('span.st', m.cards.map(c => TY[c.key].l[0]).join(' + ')));
    }
    return wrap;
  }
  if (UI.fz) { box.className = 'sbox'; }
  else if (G.phase === 'pick' && (p.picked || (UI.hold && UI.hold.seat === s))) { cover(); if (!cmp) wrap.appendChild(h('span.st.rd', 'ready')); }
  else if (G.phase === 'pick') { box.className = 'sbox empty' + (s === viewSeat() ? ' mine' : ''); box.textContent = '…'; box.setAttribute('aria-label', p.name + ' is choosing'); }
  else box.className = 'sbox';
  return wrap;
}
// ---------- the belt (your hand) ----------
function beltWidth() { return boardSize().w; }
function renderBelt() {
  const belt = $('#belt'); if (!belt) return;
  const v = viewSeat(), f = focusSeat(), np = G.np, ph = isPh();
  const next = (f + 1) % np, prev = (f + np - 1) % np;
  $('#beltTo').textContent = '◀ passes to ' + pname(next);
  $('#beltFrom').textContent = 'from ' + pname(prev) + ' ◀';
  const sl = belt.scrollLeft;
  const hand = v >= 0 ? dispHand() : (G.phase === 'over' ? [] : new Array(UI.fz && UI.fz.backN != null ? UI.fz.backN : G.players[f].hand.length).fill(-1));
  const hidden = v < 0;
  const m = Math.max(G.hand, 1), avail = beltWidth() - 20;
  const land = ph && boardSize().w >= boardSize().h; const hwMax = ph ? 74 : Math.max(84, Math.min(118, Math.floor((boardSize().h * .3 - 34) / 1.4))); const hw = Math.max(ph ? (land || innerHeight < 700 ? 54 : 60) : 62, Math.min(hwMax, Math.floor((avail - (m - 1) * 6) / m)));
  $('#bd').style.setProperty('--hw', hw + 'px');
  if (!belt.__bt) { belt.__bt = 1; try { const bt = KIT.beltEl({ h: 72, period: 96, seconds: 6 }); bt.style.height = '60px'; $('#beltw').insertBefore(bt, belt); bt.style.bottom = '8px'; } catch (e) { } }
  const frag = [], oldC = new Map(); for (const c of belt.children) if (c.dataset && c.dataset.rk) oldC.set(c.dataset.rk, c);
  const hp = v >= 0 ? G.players[v] : null, can = canPick();
  const rec = UI.rec && !UI.noRec ? UI.rec.ids : [];
  const enter = UI.enter, tt = can ? tutTarget() : -1;
  hand.forEach((id, k) => {
    if (id < 0) { const key = 'b' + k, sg = 'b' + hw; const o = oldC.get(key); if (o && o.dataset.sg === sg && !enter) { frag.push(o); return; } const b = h('div.hc.back', { 'data-up': '0', 'aria-hidden': 'true' }); b.style.setProperty('--k', k); b.appendChild(backN(hw)); if (enter) b.classList.add('ent-' + enter); b.dataset.rk = key; b.dataset.sg = sg; frag.push(b); return; }
    const idx = hp && !UI.fz ? hp.hand.indexOf(id) : -1;
    const ty = tkey(id), selPos = UI.sel.indexOf(idx);
    const g = UI.prefs.hint && can ? gainOf(v, [id]) : null;
    const tu = tt < 0 ? '' : idx === tt ? '.tut' : '.tutno';
    const key = 'c' + id, sg = [id, idx, selPos, rec.indexOf(id) >= 0 ? 1 : 0, can ? 1 : 0, g, UI.twin ? 1 : 0, hw, UI.prefs.tap2 ? 1 : 0, tu].join('|');
    const o = oldC.get(key); if (o && o.dataset.sg === sg && !enter) { frag.push(o); return; }
    const b = h('button.hc' + (selPos >= 0 ? '.sel' : '') + (rec.indexOf(id) >= 0 ? '.rec' : '') + (can ? '' : '.locked') + (selPos >= 0 ? '' : tu), { type: 'button', 'data-a': 'hcard', 'data-i': idx, 'data-id': id, 'data-owner': v, 'data-up': '1', 'aria-pressed': selPos >= 0 ? 'true' : 'false', 'aria-label': TY[ty].name + '. ' + TY[ty].ruleText + (can ? '. Tap to lift it' + (selPos >= 0 ? (UI.prefs.tap2 ? ', tap again to serve' : ', then press Serve') : '') : '') });
    b.style.setProperty('--k', k);
    b.appendChild(cardNode(ty, hw));
    if (g != null) b.appendChild(h('span.gn' + (g > 0 ? '' : '.z'), g > 0 ? '+' + g : '0'));
    if (UI.twin && selPos >= 0) b.appendChild(h('span.pn', String(selPos + 1)));
    if (enter) b.classList.add('ent-' + enter);
    b.dataset.rk = key; b.dataset.sg = sg;
    frag.push(b);
  });
  if (!hand.length) frag.push(h('div.beltnote', G.phase === 'over' ? 'The meal is over.' : (v >= 0 ? 'The belt is empty: new plates are coming.' : 'Watching the belt.')));
  { let same = belt.children.length === frag.length; if (same) for (let i = 0; i < frag.length; i++) if (belt.children[i] !== frag[i]) { same = false; break; } if (!same) belt.replaceChildren(...frag); }
  belt.dataset.hidden = hidden ? '1' : '0';
  if (enter) UI.pxEnter = enter;
  UI.enter = '';
  belt.scrollLeft = sl;
  try { const s = belt.querySelector('.hc.sel'); if (s) { const bl = belt.getBoundingClientRect(), sr = s.getBoundingClientRect(); if (sr.left < bl.left) belt.scrollLeft += sr.left - bl.left - 8; else if (sr.right > bl.right) belt.scrollLeft += sr.right - bl.right + 8; } } catch (e) { }
}
// ---------- the dock ----------
function promptText() {
  if (!G) return '';
  if (G.phase === 'over') return isPh() ? 'The meal is over.' : (G.winText || 'The meal is over.');
  const v = viewSeat();
  if (UI.fz && UI.fz.say) return isPh() ? (UI.fz.slots ? (UI.fz.slots[0] && UI.fz.slots[0].mode === 'faces' ? 'Reveal!' : 'Plates are covered…') : UI.fz.roundEnd ? 'Round over!' : 'Plates land. Hands pass left.') : UI.fz.say;
  if (UI.cards.length && UI.cards[0].kind === 'pass') return 'Pass the device to ' + pname(UI.cards[0].seat) + '.';
  if (watching()) return 'The computers are choosing a plate…';
  if (hotSeat() && v < 0) return 'Pass the device to the next diner.';
  const pend = KK.pending(G).filter(s => s !== v).map(pname);
  if (v >= 0 && UI.hold && UI.hold.seat === v) return isPh() ? 'Served. Undo?' : 'Served. Changed your mind? Press Undo.';
  if (v >= 0 && G.players[v].picked) return pend.length ? 'Served. Waiting for ' + (isPh() && pend.length > 2 ? pend.length + ' diners' : nameList(pend)) + '…' : 'Served. Here come the plates…';
  if (v >= 0) {
    const nm = hotSeat() ? pname(v) + ', ' : '';
    if (UI.twin) return nm + 'Twin Sticks: pick two plates, then serve them.';
    if (UI.sel.length) return nm + (UI.prefs.tap2 ? 'Tap it again, or press Serve.' : 'Press Serve to send it to your seat.');
    if (tutStep()) return 'Take the glowing ' + TY[tutStep().take].name + '.';
    return nm + 'pick a plate: tap it to lift it.';
  }
  return '';
}
function placePrompt() {
  const p = $('#prompt'); if (!p) return;
  const tgt = document.documentElement.classList.contains('ph-p') ? $('#barprompt') : $('#promptDock');
  if (tgt && p.parentNode !== tgt) tgt.appendChild(p);
}
function renderDock() {
  const pr = $('#prompt'); if (pr) { const t = promptText(); pr.textContent = t; const v = viewSeat(); pr.className = canPick() && v >= 0 ? 'mine' : ''; }
  const dt = document.querySelector('.gx-dt'); if (dt) dt.textContent = G.phase === 'over' ? 'Game over' : (canPick() ? 'Your turn' : 'Table');
  // round track
  const rt = $('#rt'); if (rt) { const re = UI.fz && UI.fz.roundEnd; rt.innerHTML = KIT.roundTrackSVG(Math.min(re ? (G.phase === 'over' ? D.rounds : G.round - 1) : G.round, D.rounds), { size: isPh() ? 24 : 30 }); rt.appendChild(h('span', G.phase === 'over' && !re ? 'Final' : re ? 'Round scoring' : 'Turn ' + G.turn + ' of ' + G.hand + ' · pass left')); }
  // roster chips
  const ro = $('#roster'); if (ro) {
    const tab = tables(), info = seatScoreInfo(tab), v = viewSeat(), f = focusSeat();
    const rsg = [v, f, G.phase, isPh() ? 1 : 0, UI.fz && UI.fz.slots ? 1 : 0].concat(G.players.map((p, s) => [p.name, p.picked ? 1 : 0, totalOf(s, info)].join(':')).concat([UI.fz ? 'f' : ''])).join('|');
    if (ro.dataset.sg !== rsg) { ro.dataset.sg = rsg; ro.replaceChildren();
    for (let k = 0; k < G.np; k++) {
      const s = (f + k) % G.np, p = G.players[s], busyFz = !!UI.fz, rdy = G.phase === 'pick' && p.picked && !busyFz, tot = totalOf(s, info);
      const ph = isPh();
      const ch = h('button.chip' + (s === v ? '.me' : '') + (rdy ? '.rd' : G.phase === 'pick' && !busyFz ? '.wt' : ''), { type: 'button', 'data-a': 'chip', 'data-seat': s, 'aria-label': p.name + (p.ai ? ' (computer)' : '') + ': ' + tot + ' points, ' + (G.phase !== 'pick' || busyFz ? '' : rdy ? 'has chosen' : 'is choosing') },
        (() => { const e = h('span.cav'); e.appendChild(avN(s, 96)); return e; })(), h('span.ct', h('b', h('i.gx-cbm', GX.mark(chefOf(s)) + ' '), p.name + (s === v && p.name !== 'You' ? ' (you)' : '')), h('i', (rdy ? '✓ ' : G.phase === 'pick' && !busyFz ? '… ' : '') + (ph ? tot : tot + ' pts' + (rdy ? ' · ready' : G.phase === 'pick' && !busyFz ? ' · choosing' : '')))));
      ro.appendChild(ch);
    }
    }
  }
  renderSel(); renderActs(); renderCheat();
  try { GX.recap.view(viewSeat()); } catch (e) { }
}
function renderCheat() {
  const c = $('#cheat'); if (!c || c.firstChild || isPh()) return;
  c.appendChild(h('b', 'Scoring at a glance'));
  [['pair', 'tempura', 'Two Crispy Prawns = 5'], ['set', 'sashimi', 'Three Fish Slices = 10'], ['ladder', 'dumpling', 'Steam Buns: 1, 3, 6, 10, 15'], ['most', 'roll1', 'Rolls: most icons 6, second 3'], ['v2', 'salmon', 'Nigiri 1, 2 or 3 (triple on Fire Paste)'], ['x3', 'wasabi', 'Fire Paste: next nigiri x3'], ['swap', 'chop', 'Twin Sticks: serve two plates later'], ['dessert', 'pudding', 'Custard at the end: most +6, fewest -6']].forEach(r => c.appendChild(h('div.cr', { html: iconS(r[0], 26, r[1]) }, r[2])));
}
function renderSel() {
  const el = $('#selinfo'); if (!el) return;
  const rl = document.documentElement.classList; rl.toggle('kk-sel', UI.sel.length > 0 && canPick()); rl.toggle('kk-short', innerHeight < 700); el.innerHTML = ''; el.className = '';
  const v = viewSeat(); const ph = isPh();
  if (G.phase === 'over') { el.className = 'idle'; el.appendChild(h('div.si', h('span', G.winText))); return; }
  if (v >= 0 && canPick() && UI.sel.length) {
    const hand = G.players[v].hand, ids = UI.sel.map(i => hand[i]).filter(x => x != null);
    if (ids.length) {
      const cw = ph ? 56 : 92; const box = h('div.sc1'); const rows = h('div.si');
      if (ids.length === 1) { box.appendChild(cardNode(tkey(ids[0]), cw)); const ty = tkey(ids[0]); const g = gainOf(v, ids); add(rows, [h('b', TY[ty].name), h('span', TY[ty].ruleText), h('span.sm', g > 0 ? 'Scores +' + g + ' for you right now.' : 'Scores nothing yet.'), ph ? null : h('span.why', whyPick(ids))]); }
      else { const two = h('div'); two.style.cssText = 'display:flex;gap:2px'; ids.forEach(id => two.appendChild(cardNode(tkey(id), Math.round(cw * .7)))); box.appendChild(two); const g = gainOf(v, ids); add(rows, [h('b', 'Twin Sticks: ' + ids.map(i => TY[tkey(i)].l[0]).join(' + ')), h('span.sm', g > 0 ? 'Both together score +' + g + ' for you right now.' : 'Both together score nothing yet.'), ph ? null : h('span.why', whyPick(ids))]); }
      el.append(box, rows); return;
    }
  }
  el.className = 'idle';
  let t;
  if (UI.cards.length && UI.cards[0].kind === 'pass') t = 'The hands are hidden until the device is passed.';
  else if (watching()) t = 'Sit back: the computers play all three rounds. Hands slide to the left every turn.';
  else if (v >= 0 && UI.hold && UI.hold.seat === v) t = 'Your plate waits under a cover. Undo puts it back on your belt before the covers lift.';
  else if (v >= 0 && G.players[v].picked) t = 'Your plate is on its way to your seat under a cover. Everyone reveals together.';
  else if (v >= 0 && canPick()) t = UI.twin ? 'Tap two plates on the belt, then press Serve.' : 'Tap a plate on your belt to lift it' + (UI.prefs.tap2 ? ', then tap it again to serve it.' : ', then press Serve.');
  else t = 'Revealing the plates…';
  el.appendChild(h('div.si', h('span', t)));
}
function renderActs() {
  const a = $('#acts'); if (!a) return; a.innerHTML = '';
  const v = viewSeat();
  if (!G || G.phase === 'over') return;
  if (v >= 0 && UI.hold && UI.hold.seat === v) { a.appendChild(h('button.btn.go.undo', { 'data-a': 'undo', type: 'button', 'aria-label': 'Undo: take your plate back' }, 'Undo')); return; }
  if (v >= 0 && canPick()) {
    const p = G.players[v], chop = KK._.hasChop(p) && p.hand.length >= 2;
    const n = UI.sel.length;
    const tut = !!tutStep();
    if (n) { const ids = UI.sel.map(i => p.hand[i]); const g = gainOf(v, ids); a.appendChild(h('button.btn.go' + (tut ? '.tut' : ''), { 'data-a': 'serve', type: 'button' }, n === 2 ? 'Serve both' + (g > 0 ? ' (+' + g + ')' : '') : 'Serve' + (g > 0 ? ' (+' + g + ')' : ''))); }
    if (chop && !tut) a.appendChild(h('button.btn' + (UI.twin ? '.on' : '.alt'), { 'data-a': 'twin', type: 'button', 'aria-pressed': UI.twin ? 'true' : 'false' }, UI.twin ? 'Twin Sticks: on' : 'Use Twin Sticks'));
    if (!tut) a.appendChild(h('button.btn.alt', { 'data-a': 'hint', type: 'button' }, 'Hint'));
    if (n) a.appendChild(h('button.btn.alt', { 'data-a': 'unsel', type: 'button', 'aria-label': 'Put the plate back' }, 'Cancel'));
  }
}
// ---------- pop-up beside the board: details of one group of plates ----------
function openGroup(seat, k) {
  const tab = tables(), info = seatScoreInfo(tab), gs = groupsOf(seat, tab, info).list, g = gs.find(x => x.k === k);
  const p = G.players[seat];
  let type, title, tip, ids = [];
  if (k === 'pud') { type = 'pudding'; title = 'Custard Cups'; const n = pudCounts()[seat]; tip = n + ' kept' + (n === 1 ? '' : '') + '. ' + TY.pudding.ruleText + '. Custard stays on the table for all three rounds.'; }
  else if (g) { type = g.k === 'roll' ? 'roll2' : g.type; title = g.k === 'roll' ? 'Seaweed Rolls' : g.on ? 'Fire Paste + ' + TY[g.on].name : TY[g.type].name + (g.n > 1 ? 's' : ''); tip = g.tip; }
  else return;
  UI.pop = { kind: 'group', seat, k };
  const pp = $('#ppop'); pp.hidden = false; pp.innerHTML = '';
  const cw = isPh() ? 80 : 120;
  const body = h('div.ph-body', h('div.cwrap', h('div.cardbox', cardDiv(type, cw, g && g.on)), h('div.cinfo', h('p', tip), h('p.sm', TY[type].ruleText), h('button.btn.alt.refbig', { 'data-a': 'refbig', 'data-type': g && g.on ? g.on : type, type: 'button' }, 'Read it big'))));
  if (g && g.k === 'roll') { const mk = info.mk; body.appendChild(h('div.kv', h('span', 'Icons per diner'), h('b', G.players.map((q, i) => q.name + ' ' + info.rs[i].icons).join(' · ')))); }
  pp.append(h('div.ph-head', h('div.ph-t', h('b', title), h('span', p.name)), h('button.px', { 'data-a': 'popx', type: 'button', 'aria-label': 'Close' }, '×')), body);
}
function closePop() { UI.pop = null; const pp = $('#ppop'); if (pp) { pp.hidden = true; pp.innerHTML = ''; } }
// ===================== part 3: game flow (new game, picking, AI, reveal / pass / round sequence, hot-seat, save) =====================
function lvAt(opt, k) { const a = opt.lv || DEF.lv; return a[Math.max(0, Math.min(3, k - 1))] || opt.level || 'normal'; }
// which chefs sit at the table: seat 0 is you (Mina's portrait), the others come from the setup screen (opt.seats, chef numbers 1-4)
function chefsFor(np, opt) {
  const pick = Array.isArray(opt.seats) ? opt.seats.filter((c, i, a) => c >= 1 && c <= 4 && a.indexOf(c) === i) : [];
  if (pick.length >= np - 1) return [0].concat(pick.slice(0, np - 1));
  const out = [0].concat(pick); for (let c = 1; c <= 4 && out.length < np; c++) if (out.indexOf(c) < 0) out.push(c);
  return out;
}
function newGame(mode, o) {
  o = o || {};
  const opt = Object.assign({}, DEF, UI.opt || {}, o);
  let np = Math.max(2, Math.min(5, opt.np | 0 || 3)), names = [], ai = [];
  if (mode === 'guided') np = 2;
  if (mode === 'net') { np = opt.np; names = opt.players.map(p => p.name); ai = opt.players.map(p => p.ai || null); }
  const chefs = mode === 'net' ? null : chefsFor(np, opt);
  if (mode !== 'net') for (let i = 0; i < np; i++) {
    const c = chefs[i], lv = c > 0 ? lvAt(opt, c) : (opt.level || 'normal');
    if (mode === 'hot') { names.push(PN[c]); ai.push(null); }
    else if (mode === 'ai') { names.push(PN[c]); ai.push(lv); }
    else if (i === 0) { names.push('You'); ai.push(null); }
    else { names.push(PN[c]); ai.push(mode === 'guided' ? 'easy' : lv); }
  }
  UI.chefs = chefs;
  clearTimeout(UI.tm); UI.seq++; UI.rq = []; dropHold(); UI.tut = null;
  const seed = UI.seed != null ? UI.seed : (Date.now() ^ (Math.random() * 1e9)) | 0;
  G = KK.newGame({ players: np, seed, names, ai });
  Object.assign(UI, { started: true, mode, cfg: { np, level: opt.level, lv: (opt.lv || DEF.lv).slice(), seats: chefs ? chefs.slice(1) : null }, holder: -1, sel: [], twin: false, pop: null, cards: [], fz: null, busy: false, rec: null, over: null, enter: 'deal', land: null, focus: 0, overShown: false, evN: G.evN, resultDone: false, earned: null, t0: Date.now() });
  UI.coach = { level: mode === 'guided' ? 'full' : (UI.coach.level === 'full' && UI.coach.keep ? 'full' : 'off'), seen: {}, turn: '', keep: UI.coach.keep };
  if (mode === 'guided') { UI.coach.level = 'full'; try { tutDeal(); } catch (e) { console.error(e); UI.tut = null; } }
  recapSeats();
  const st = $('#start'); if (st) st.hidden = true; const rs = $('#rs'); if (rs) { rs.hidden = true; rs.innerHTML = ''; }
  try { GX.close(); } catch (e) { } closePop(); const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; }
  placePrompt(); render(); sndMusic(); schedule();
}
// ---------- the turn driver ----------
function schedule() {
  clearTimeout(UI.tm);
  if (!G || !UI.started) return;
  if (G.phase === 'over') return;
  try { autoSave(); } catch (e) { }
  if (UI.busy) return;
  if (isClient()) { try { coachCheck(); } catch (e) { } return; }
  if (UI.cards.length && !NET.on) return;
  const ai = KK.pending(G).filter(s => G.players[s].ai);
  if (ai.length) {
    const d = AIDELAY <= 0 ? 0 : Math.round(AIDELAY * (.2 + .55 * Math.random()));
    const tok = UI.seq; UI.tm = setTimeout(() => { if (tok === UI.seq) aiPick(ai[0]); }, d); return;
  }
  if (hotSeat()) hotNext();
  try { coachCheck(); } catch (e) { console.error(e); }
}
function aiPick(seat) {
  if (!G || UI.busy || G.phase !== 'pick') return;
  const p = G.players[seat]; if (!p || p.picked || !p.ai) { schedule(); return; }
  let mv = tutPartner(seat); if (!mv) try { mv = KK.AI.choose(G, seat); } catch (e) { console.error(e); mv = KK.moves(G, seat)[0]; }
  commit(seat, mv);
}
function commit(seat, mv) {
  if (!G || G.phase !== 'pick') return false;
  const v = viewSeat(), preHand = v >= 0 ? G.players[v].hand.slice() : null, wasHolder = UI.holder;
  const r = KK.apply(G, seat, { pick: mv.pick });
  if (!r.ok) { snd('error'); toast('That did not work: ' + r.error); return false; }
  const evs = G.events.slice();
  if (seat === v) { snd('pick'); UI.sel = []; UI.twin = false; UI.rec = null; }
  if (hotSeat() && seat === wasHolder) UI.holder = -1;
  afterApply(evs, preHand);
  return true;
}
function afterApply(evs, preHand) {
  if (NET.on && isHost()) { try { netRecord(evs); netPush(); } catch (e) { console.error(e); } }
  if (evs.some(e => e.t === 'reveal')) { playResolve(evs, preHand); return; }
  render(); schedule();
}
// ---------- human actions ----------
function myMoves() { const v = viewSeat(); return v >= 0 && G ? KK.moves(G, v) : []; }
function tapHand(i) {
  if (!canPick()) { const v = viewSeat(); if (v >= 0 && G && G.players[v].picked) toast('You have served. Waiting for the others.'); return; }
  const hand = G.players[viewSeat()].hand; if (!(i >= 0 && i < hand.length)) return;
  const cur = UI.sel.slice();
  if (UI.twin) {
    const k = cur.indexOf(i);
    if (k >= 0) cur.splice(k, 1); else { if (cur.length >= 2) cur.shift(); cur.push(i); }
    UI.sel = cur; UI.rec = null; render(); return;
  }
  if (!tutGuard(i)) return;
  if (cur.length === 1 && cur[0] === i && UI.prefs.tap2) { serveSel(); return; }
  UI.sel = [i]; UI.rec = null; snd('click', { vol: .4 }); render();
}
function serveSel() {
  const v = viewSeat(); if (!canPick() || !UI.sel.length) return;
  const pick = UI.sel.slice().sort((a, b) => a - b);
  const mv = myMoves().find(m => mkey(m) === pick.join(','));
  if (!mv) { snd('error'); toast('That choice is not allowed.'); return; }
  doPick(v, mv);
}
function doPick(seat, mv) {
  // the lifted plate flies to the seat under a cover
  try { if (ANIM && !pxServe() && document.body.animate) flyPick(); } catch (e) { }
  try { GX.recap.mark(seat); } catch (e) { }
  if (isClient()) { netAct({ pk: mv.pick.join(',') }); UI.sel = []; UI.twin = false; UI.rec = null; snd('pick'); render(); return; }
  if (canHold(seat)) { holdServe(seat, mv); return; }
  commit(seat, mv);
}
function flyPick() {
  const sels = $$('#belt .hc.sel'); if (!sels.length) return; const v = viewSeat(); const slot = document.querySelector('.seat[data-seat="' + v + '"] .slot');
  const to = slot ? slot.getBoundingClientRect() : null; if (!to || !to.width) return;
  sels.forEach((b, k) => {
    const r = b.getBoundingClientRect(); const c = h('div.flyc'); c.style.cssText = 'left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px'; c.innerHTML = KIT.backSVG({ w: Math.round(r.width) }); document.body.appendChild(c);
    const dx = to.left + to.width / 2 - (r.left + r.width / 2), dy = to.top + to.height / 2 - (r.top + r.height / 2);
    const a = c.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + dx * .6 + 'px,' + (dy * .6 - 30) + 'px) scale(.8)', opacity: 1, offset: .55 }, { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + Math.max(.25, to.width / r.width) + ')', opacity: .85 }], { duration: 480, easing: 'ease-in-out' });
    a.onfinish = () => c.remove(); setTimeout(() => c.remove(), 900);
  });
  snd('slide', { vol: .5 });
}
function toggleTwin() {
  const v = viewSeat(); if (!canPick() || !KK._.hasChop(G.players[v]) || G.players[v].hand.length < 2) { UI.twin = false; render(); return; }
  UI.twin = !UI.twin; if (!UI.twin && UI.sel.length > 1) UI.sel = UI.sel.slice(0, 1);
  render();
}
function hint() {
  const v = viewSeat(); if (!canPick() || tutStep()) return;
  let mv; try { mv = KK.AI.choose(G, v, 'normal'); } catch (e) { return; }
  if (!mv) return;
  UI.rec = { ids: mv.ids.slice(), pick: mv.pick.slice() };
  UI.twin = mv.pick.length === 2; UI.sel = mv.pick.slice(); render();
  const pp = $('#prompt'); const why = whyPick(mv.ids);
  toast('A good pick: ' + mv.ids.map(cname).join(' + ') + '. ' + why);
}
// ---------- hot-seat ----------
function hotNext() {
  if (!hotSeat() || UI.cards.length || UI.busy) return;
  if (UI.holder >= 0 && !G.players[UI.holder].picked) return;
  const pend = KK.pending(G).filter(s => !G.players[s].ai);
  if (!pend.length) return;
  UI.holder = -1; UI.sel = []; UI.twin = false; UI.rec = null;
  pushCard({ kind: 'pass', seat: pend[0], title: 'Pass the device to ' + pname(pend[0]), sub: 'Hands are hidden', body: h('p', 'Hand the device to ' + pname(pend[0]) + '. The plates on their belt stay hidden until they press the button.'), buttons: [{ label: pname(pend[0]) + ' is ready', a: 'take' }] });
  render();
}
function takeDevice() {
  const c = UI.cards[0]; if (!c || c.kind !== 'pass') return; UI.cards.shift(); UI.holder = c.seat; UI.sel = []; UI.twin = false;
  drawCard(); render(); schedule();
}
// ---------- the reveal / pass / round sequence ----------
const keyOfCard = c => { const k = c.key; return ICONS[k] ? 'roll' : NIG[k] ? (c.w >= 0 ? 'pn-' : 'n-') + k : k === 'pudding' ? 'pud' : k; };
function drainQ() { if (UI.rq.length && !UI.busy) { const q = UI.rq.shift(); playResolve(q[0], q[1]); } }
async function playResolve(evs, preHand) {
  if (UI.busy) { UI.rq.push([evs, preHand]); return; }
  const tok = UI.seq; UI.busy = true; closePop(); recapReveal(evs);
  const rv = evs.find(e => e.t === 'reveal'), ps = evs.find(e => e.t === 'pass'), sc = evs.find(e => e.t === 'score'), ge = evs.find(e => e.t === 'gameEnd');
  const v = viewSeat(), np = G.np, block = !NET.on;
  try {
    const T = sc ? sc.seats.map(s => s.table.map(e => ({ id: e.id, w: e.w }))) : G.players.map(p => p.table.map(e => ({ id: e.id, w: e.w })));
    const before = T.map((t, s) => { const pk = rv.picks[s]; const ids = new Set(pk.cards.map(c => c.id)); const b = t.filter(e => !ids.has(e.id)); if (pk.chop >= 0) b.push({ id: pk.chop, w: -1 }); return b; });
    let hand = null;
    if (v >= 0 && preHand) { const pk = rv.picks[v]; const gone = new Set(pk.cards.map(c => c.id)); hand = preHand.filter(id => !gone.has(id)); if (pk.chop >= 0) hand.push(pk.chop); }
    const backN = hand ? hand.length : (ps ? ps.sizes[0] : 0);
    const pudSub = sc ? T.map(t => t.filter(e => tkey(e.id) === 'pudding').length) : new Array(np).fill(0);
    UI.fz = { tables: before, slots: rv.picks.map(() => ({ mode: 'cover' })), hand: hand || (hotSeat() || v < 0 ? null : []), backN, pudSub, roundEnd: false, say: 'Everyone has chosen. The plates are under covers…' };
    if (!hand && v < 0) UI.fz.hand = null;
    UI.sel = []; UI.twin = false; UI.rec = null;
    render(); await wait(450); if (tok !== UI.seq) return;
    // 2: the covers lift together
    UI.fz.slots = rv.picks.map(p => ({ mode: 'faces', cards: p.cards })); UI.fz.say = 'Reveal! ' + rv.picks.map(p => pname(p.seat) + ': ' + p.cards.map(c => TY[c.key].name).join(' + ')).join(' · ');
    render();
    if (ANIM) { snd('cloche'); const hosts = $$('#tbl .hostc'); try { pxReveal(); await KIT.revealAll(hosts, { stagger: 110 }); } catch (e) { } await wait(850); } if (tok !== UI.seq) return;
    // 3: plates land on the counters
    const land = new Set(); rv.picks.forEach(p => p.cards.forEach(c => land.add(p.seat + '|' + keyOfCard(c)))); UI.land = land;
    UI.fz.slots = null; UI.fz.tables = T; UI.fz.say = ps ? 'The plates land. Hands slide to the left…' : 'The plates land. The round is over!';
    if (sc) { UI.fz.roundEnd = true; UI.fz.hand = []; UI.fz.backN = 0; }
    render(); snd('clink'); await wait(750); if (tok !== UI.seq) return;
    if (ps) {
      // 4: every hand moves one seat to the left
      if (ANIM) { try { if (PX.on) { snd('pass'); await pxPassOut(); if (!pxPackets(ps.sizes)) animatePass(ps.sizes); } else { await slideOutBelt(); animatePass(ps.sizes); snd('pass'); } } catch (e) { } }
      UI.fz = null; UI.enter = v >= 0 ? 'pass' : ''; render();
      await wait(ANIM ? 900 : 0); if (tok !== UI.seq) return;
      UI.busy = false; render(); schedule(); drainQ(); if (NET.on && isHost()) netPush(true); return;
    }
    if (sc) {
      if (block) { showRound(sc, ge); return; }   // the table stays frozen under the score pad until Continue
      UI.fz = null; UI.enter = 'deal'; UI.busy = false; render(); showRound(sc, ge); schedule(); drainQ(); return;
    }
    UI.fz = null; UI.busy = false; render(); schedule(); drainQ();
  } catch (e) { console.error(e); UI.fz = null; UI.busy = false; try { render(); schedule(); } catch (x) { } }
}
function slideOutBelt() {
  const b = $('#belt'); if (!b || !b.animate) return Promise.resolve();
  return new Promise(res => { const a = b.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateX(-70vw)', opacity: .2 }], { duration: 420 * Math.max(.5, AIDELAY / 650), easing: 'ease-in' }); a.onfinish = () => res(); setTimeout(res, 800); });
}
function animatePass(sizes) {
  if (!document.body.animate) return;
  const np = G.np, rect = s => { const e = document.querySelector('.seat[data-seat="' + s + '"] .sh'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2 - 15, y: r.top + r.height / 2 - 21 }; };
  for (let s = 0; s < np; s++) {
    const a = rect(s), b = rect((s + 1) % np); if (!a || !b) continue;
    const el = h('div.pkt'); el.innerHTML = KIT.backSVG({ w: 30 }); el.appendChild(h('b', String(sizes ? sizes[s] : ''))); el.style.left = '0'; el.style.top = '0'; document.body.appendChild(el);
    const an = el.animate([{ transform: 'translate(' + a.x + 'px,' + a.y + 'px)', opacity: 0 }, { transform: 'translate(' + a.x + 'px,' + a.y + 'px)', opacity: 1, offset: .12 }, { transform: 'translate(' + b.x + 'px,' + b.y + 'px)', opacity: 1, offset: .88 }, { transform: 'translate(' + b.x + 'px,' + b.y + 'px)', opacity: 0 }], { duration: 900 * Math.max(.5, AIDELAY / 650), easing: 'ease-in-out' });
    an.onfinish = () => el.remove(); setTimeout(() => el.remove(), 1500);
  }
}
// after the score pad: the next round is dealt (or the final screen)
function afterRound(ge) {
  if (UI.rsInfo) UI.rsInfo.skip = true;
  UI.fz = null; UI.busy = false; UI.enter = G.phase === 'over' ? '' : 'deal';
  const rs = $('#rs'); rs.hidden = true; rs.innerHTML = ''; UI.rsOpen = false; clearTimeout(UI.rsT);
  render();
  if (G.phase === 'over') { showFinal(); return; }
  snd('slide', { vol: .5 }); schedule(); drainQ(); if (NET.on && isHost()) netPush(true);
}
// ---------- save / load (local games only) ----------
// SAVE_V goes up whenever G or the save layout changes: an older save is then refused politely instead of resuming a broken meal
const SAVE_V = 2;
function hasSave() { return !!lsGet('kk_save'); }
function saveInfo() { try { const o = JSON.parse(lsGet('kk_save')); if (o && o.sv === SAVE_V && o.G && o.G.phase !== 'over') return { round: o.G.round, np: o.G.np, mode: o.mode }; } catch (e) { } return null; }
function save() {
  if (NET.on || !G || !UI.started || G.phase === 'over') return false;
  try { localStorage.setItem('kk_save', JSON.stringify({ sv: SAVE_V, G, mode: UI.mode, cfg: UI.cfg, chefs: UI.chefs || null, holder: -1, coach: UI.coach, tut: UI.tut || null, t0: UI.t0 || 0 })); GNS.saved(GAME_ID, true); return true; } catch (e) { return false; }
}
// autosave: after every resolved turn (schedule runs after each one) and when the page is hidden or closed (iPhone app switch)
function autoSave() { if (!G || !UI.started || NET.on || G.phase === 'over') return; const k = G.round + '.' + G.turn + '.' + G.evN + '.' + G.players.map(p => p.picked ? 1 : 0).join(''); if (UI.svk === k) return; if (save()) UI.svk = k; }
function flushSave() { UI.svk = ''; autoSave(); }
function loadSave() {
  if (NET.on) return false;
  let o; try { o = JSON.parse(lsGet('kk_save')); } catch (e) { return false; }
  if (o && o.G && o.sv !== SAVE_V) { lsSet('kk_save', ''); try { GNS.saved(GAME_ID, false); } catch (e) { } toast('That saved meal is from an older version of the game, so it could not be resumed.'); if (!G) renderStart(); return 'old'; }
  if (!o || !o.G || !Array.isArray(o.G.players) || o.G.v !== 1) return false;
  clearTimeout(UI.tm); UI.seq++; dropHold();
  G = o.G; try { if (KK.checkInvariants(G).length) { G = null; return false; } } catch (e) { return false; }
  Object.assign(UI, { started: true, mode: o.mode || 'vs', cfg: o.cfg || null, holder: -1, sel: [], twin: false, pop: null, cards: [], fz: null, busy: false, rec: null, enter: 'deal', focus: 0, evN: G.evN, over: null, resultDone: false, earned: null, t0: o.t0 || Date.now(), tut: o.tut && o.tut.on ? { on: true, step: -1 } : null });
  if (o.coach) UI.coach = o.coach;
  recapSeats();
  UI.chefs = Array.isArray(o.chefs) && o.chefs.length === G.np ? o.chefs : null;
  const st = $('#start'); if (st) st.hidden = true; const rs = $('#rs'); if (rs) { rs.hidden = true; rs.innerHTML = ''; }
  try { GX.close(); } catch (e) { } closePop(); const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; }
  placePrompt(); render(); sndMusic();
  if (G.phase === 'over') showFinal(); else schedule();
  return true;
}
// ===================== part 4: step cards (one at a time), guide tips, round score pad, final result =====================
function pushCard(c) { UI.cards.push(c); if (UI.cards.length === 1) drawCard(); }
function nextCard() { UI.cards.shift(); drawCard(); if (!UI.cards.length) { render(); schedule(); } }
function drawCard() {
  const pc = $('#pc'); if (!pc) return;
  const c = UI.cards[0];
  if (!c) { pc.hidden = true; pc.innerHTML = ''; pc.dataset.card = ''; return; }
  closePop(); pc.hidden = false; pc.innerHTML = ''; pc.dataset.card = c.kind;
  const bs = (c.buttons || [{ label: 'Got it', a: 'cont' }]).map(b => h('button.btn' + (b.cls ? '.' + b.cls : ''), { type: 'button', 'data-a': b.a }, b.label));
  pc.append(h('div.ph-head', h('div.ph-t', h('b', c.title), h('span', c.sub || '')), c.kind === 'pass' ? null : h('button.px', { 'data-a': 'cont', type: 'button', 'aria-label': 'Close' }, '×')), h('div.ph-body', c.body, h('div.cbtns', bs)));
  if (c.kind === 'pass') { try { const b = pc.querySelector('[data-a=take]'); if (b) b.focus({ preventScroll: true }); } catch (e) { } }
}
// ---- guide: short tips that explain each card the first time it appears
const TIP_EXTRA = {
  tempura: 'Two of them make a pair worth 5. Collect them in pairs.',
  sashimi: 'Fish Slices only score in sets of three (10 points). One or two are worth nothing, so go for it only if more are coming.',
  dumpling: 'Each Steam Bun you stack is worth more than the last: 1, 3, 6, 10 and 15 points for five.',
  roll1: 'Roll icons race: the most icons this round scores 6, second most 3. This one has one icon.',
  roll2: 'Roll icons race: the most icons this round scores 6, second most 3. This one has two icons.',
  roll3: 'Roll icons race: the most icons this round scores 6, second most 3. This one has three icons, the best for the race.',
  salmon: 'A nigiri is worth its number straight away. Put it on Fire Paste for triple.',
  squid: 'The best nigiri: 3 points, or 9 on Fire Paste.',
  egg: 'The smallest nigiri: 1 point, or 3 on Fire Paste.',
  wasabi: 'Serve Fire Paste first, then a nigiri: the nigiri lands on it and scores triple. Fire Paste with no nigiri scores nothing.',
  chop: 'Twin Sticks stay on your counter. On a later turn you can serve two plates at once, then the sticks go back into your hand.',
  pudding: 'Custard is kept for the whole meal. At the end the diner with the most gets 6, the one with the fewest loses 6.'
};
function coachTip(key, title, text, type) {
  UI.coach.seen[key] = 1; UI.coach.turn = G.round + '.' + G.turn;
  const cw = isPh() ? 52 : 108;
  const body = type ? h('div.cwrap', h('div.cardbox', cardDiv(type, cw)), h('div.cinfo', h('p', text))) : h('p', text);
  pushCard({ kind: 'coach', title, sub: 'Tip', body, buttons: [{ label: 'Got it', a: 'cont' }] });
}
function coachCheck() {
  if (UI.tut && UI.tut.on && G && G.phase === 'pick') return tutCheck();
  const lv = UI.coach.level; if (lv === 'off' || !G || G.phase !== 'pick') return false;
  const v = viewSeat(); if (v < 0 || !canPick() || UI.cards.length) return false;
  const turn = G.round + '.' + G.turn; if (UI.coach.turn === turn) return false;
  const seen = UI.coach.seen, p = G.players[v];
  if (!seen.welcome) { coachTip('welcome', 'Welcome to the belt', 'You are a diner at a conveyor-belt sushi bar. Over three rounds you collect plates for points. The highest score at the end wins.'); return true; }
  if (!seen.pick) { coachTip('pick', 'Everyone picks at once', 'Pick one plate from your belt and serve it: tap to lift it, ' + (UI.prefs.tap2 ? 'tap it again' : 'then press Serve') + ' to serve. When everyone has chosen, all plates are revealed together, then every hand slides to the player on your left.'); return true; }
  const types = Array.from(new Set(p.hand.map(tkey))).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
  if (lv === 'full' || lv === 'light') {
    for (const t of types) { if (seen[t]) continue; if (lv === 'light' && !['wasabi', 'chop', 'pudding'].includes(t)) continue; coachTip(t, TY[t].name, (D.types.find(x => x.id === t) || {}).text + ' ' + (TIP_EXTRA[t] || ''), t); return true; }
  }
  const c = KK.tableCounts(p.table);
  if (!seen.pasteReady && c.wasabiUnused && p.hand.some(id => NIG[tkey(id)])) { coachTip('pasteReady', 'Fire Paste is waiting', 'You have Fire Paste on your counter. Serve a nigiri now and it lands on the paste and scores triple. The plates marked +6 or +9 are the nigiri that do it.', 'wasabi'); return true; }
  if (!seen.twinReady && c.chop && p.hand.length >= 2) { coachTip('twinReady', 'Use your Twin Sticks', 'You have Twin Sticks on your counter. Press "Use Twin Sticks", pick two plates and serve both. Then the sticks go back into your hand and move on.', 'chop'); return true; }
  if (!seen.endRound && G.turn >= G.hand) { coachTip('endRound', 'Last plate of the round', 'When the belt runs empty the round is scored: sets, ladders, nigiri and the roll race. Everything except Custard is cleared away, then a new hand is dealt.'); return true; }
  return false;
}
// ---- round score pad
const CATROWS = [
  { k: 'maki', l: 'Seaweed rolls', ic: ['most', 'roll1'], sub: s => s.icons + ' icon' + (s.icons === 1 ? '' : 's'), tip: 'Roll race: most roll icons scores 6, second most 3.' },
  { k: 'tempura', l: 'Crispy Prawns', ic: ['pair', 'tempura'], sub: null, tip: '5 points for every pair.' },
  { k: 'sashimi', l: 'Fish Slices', ic: ['set', 'sashimi'], sub: null, tip: '10 points for every set of three.' },
  { k: 'dumpling', l: 'Steam Buns', ic: ['ladder', 'dumpling'], sub: null, tip: '1, 3, 6, 10, 15 points for 1 to 5 or more buns.' },
  { k: 'nigiri', l: 'Nigiri', ic: ['v2', 'salmon'], sub: null, tip: 'Sunset 2, Moon 3, Sun 1 point each.' },
  { k: 'wasabi', l: 'Fire Paste bonus', ic: ['x3', 'wasabi'], sub: null, tip: 'The extra points a nigiri scored by landing on Fire Paste (triple).' }];
function padRows(upToRound, withPud) {
  const bank = G.players.map((p, i) => G.rs.map(r => r[i].total));
  return G.players.map((p, i) => ({ i, name: p.name, rounds: [0, 1, 2].map(r => r < upToRound ? bank[i][r] : null), dessert: withPud ? G.final.puddingPts[i] : null, total: bank[i].slice(0, upToRound).reduce((a, b) => a + b, 0) + (withPud ? G.final.puddingPts[i] : 0), you: i === viewSeat() }));
}
function makiText(sc) {
  const s = sc.seats; const max = Math.max(...s.map(x => x.icons));
  if (max <= 0) return 'Nobody served a roll this round: no roll points.';
  const parts = s.filter(x => x.icons > 0).sort((a, b) => b.icons - a.icons).map(x => pname(x.seat) + ' ' + x.icons + ' icon' + (x.icons === 1 ? '' : 's') + (x.maki ? ' (+' + x.maki + ')' : ' (no points)'));
  const top = s.filter(x => x.icons === max).length;
  return 'Roll race: ' + parts.join(', ') + (top > 1 ? '. The most is tied, so 6 is split and nobody gets second place.' : '.');
}
function showRound(sc, ge) {
  const rs = $('#rs'); UI.rsOpen = true; rs.hidden = false; rs.innerHTML = '';
  const last = G.phase === 'over';
  const box = h('div.rsbox', { role: 'dialog', 'aria-label': 'Round ' + sc.round + ' scores' });
  box.appendChild(h('h2', h('span', { html: KIT.roundMarkerSVG(sc.round, 'done', { size: 34 }) }), 'Round ' + sc.round + ' scores'));
  const tb = h('table.cat');
  const hr = h('tr', h('th', ''));
  sc.seats.forEach(s => { const th = h('th'); th.appendChild(h('div', { html: avatarS(s.seat, 64) })); th.appendChild(h('span.sub', pname(s.seat))); hr.appendChild(th); });
  tb.appendChild(hr);
  const cells = [];
  CATROWS.forEach(r => {
    const tr = h('tr', { title: r.tip }); tr.appendChild(h('td', h('div.lc', { html: iconS(r.ic[0], 26, r.ic[1]) }, r.l)));
    sc.seats.forEach(s => { const td = h('td.n.z', { 'data-v': s[r.k] }, '·'); if (r.sub) td.appendChild(h('span.sub', r.sub(s))); tr.appendChild(td); cells.push(td); });
    tb.appendChild(tr);
  });
  const tt = h('tr.tot'); tt.appendChild(h('td', 'Round total')); sc.seats.forEach(s => { const td = h('td.n.z', { 'data-v': s.total }, '·'); tt.appendChild(td); cells.push(td); }); tb.appendChild(tt);
  box.appendChild(tb);
  box.appendChild(h('div.maki', makiText(sc)));
  const padHost = h('div.padw'); box.appendChild(padHost);
  const btns = h('div.cbtns', h('button.btn.alt#rsskip', { type: 'button', 'data-a': 'rsskip' }, 'Skip counting'), h('button.btn.go', { type: 'button', 'data-a': 'rsnext' }, last ? 'See the final result' : 'Next round'));
  box.appendChild(btns); rs.appendChild(box);
  UI.rsInfo = { sc, ge, skip: !ANIM, done: false };
  const showPad = () => { const w = Math.min(380, Math.max(260, (box.clientWidth || 340) - 24)); padHost.innerHTML = KIT.scorePadSVG({ w, round: sc.round, rows: padRows(sc.round, false) }); const sk = $('#rsskip'); if (sk) sk.hidden = true; UI.rsInfo.done = true; };
  const rows = []; for (let k = 0; k < cells.length; k += sc.seats.length) rows.push(cells.slice(k, k + sc.seats.length));
  const tok = UI.seq, info = UI.rsInfo;
  (async () => {
    if (ANIM) { snd('round', { duck: true }); await new Promise(r => setTimeout(r, 450)); }
    for (let ri = 0; ri < rows.length; ri++) {
      for (const td of rows[ri]) { const v = +td.dataset.v; const lead = td.firstChild; const sub = td.querySelector('.sub');
        const setN = n => { td.firstChild && td.firstChild.nodeType === 3 ? td.firstChild.nodeValue = String(n) : td.insertBefore(document.createTextNode(String(n)), td.firstChild); };
        if (!info.skip && v > 0) { const steps = Math.min(v, 12); for (let k = 1; k <= steps && !info.skip; k++) { setN(Math.round(v * k / steps)); snd('tick', { rate: .9 + k * .05, vol: .4 }); await new Promise(r => setTimeout(r, 32)); if (tok !== UI.seq) return; } }
        setN(v); td.classList.toggle('z', v === 0);
        if (v > 0 && !info.skip) snd('coin', { vol: .6 });
      }
      rows[ri].forEach(td => td.parentNode.classList.add('cur'));
      if (!info.skip) { await new Promise(r => setTimeout(r, 260)); if (tok !== UI.seq) return; }
      rows[ri].forEach(td => td.parentNode.classList.remove('cur'));
    }
    if (tok !== UI.seq || !UI.rsOpen) return;
    showPad();
  })();
  if (NET.on) { clearTimeout(UI.rsT); UI.rsT = setTimeout(() => { if (UI.rsOpen && UI.rsInfo === info) afterRound(ge); }, 30000); }
  try { box.querySelector('[data-a=rsnext]').focus({ preventScroll: true }); } catch (e) { }
}
function skipCount() { if (UI.rsInfo) { UI.rsInfo.skip = true; } }
function showFinal() {
  const rs = $('#rs'); UI.rsOpen = true; rs.hidden = false; rs.innerHTML = '';
  const F = G.final, np = G.np;
  try { kitResult(); } catch (e) { }
  const box = h('div.rsbox', { role: 'dialog', 'aria-label': 'Final result' });
  const ws = G.winners || [];
  const me = viewSeat(), iWin = me >= 0 && ws.includes(me);
  box.appendChild(h('h2', h('span', { html: KIT.iconSVG('crown', { size: 32 }) }), 'The meal is over'));
  const wn = h('div.win', h('span', { html: avatarS(ws[0] != null ? ws[0] : 0, 96) }), h('div', G.winText));
  box.appendChild(wn);
  { const ea = earnedEl(); if (ea) box.appendChild(ea); }
  // custard resolved
  const tb = h('table.cat'); const hr = h('tr', h('th', ''));
  for (let s = 0; s < np; s++) { const th = h('th'); th.appendChild(h('div', { html: avatarS(s, 64) })); th.appendChild(h('span.sub', pname(s))); hr.appendChild(th); }
  tb.appendChild(hr);
  const addRow = (label, vals, cls) => { const tr = h('tr' + (cls ? '.' + cls : ''), h('td', label)); vals.forEach(v => tr.appendChild(h('td.n', String(v)))); tb.appendChild(tr); };
  for (let r = 0; r < D.rounds; r++) addRow('Round ' + (r + 1), G.rs[r].map(x => x.total));
  addRow('Custard cups', F.pudding.map(String));
  addRow('Custard points', F.puddingPts.map(x => (x > 0 ? '+' : '') + x));
  addRow('Total', F.totals, 'tot');
  box.appendChild(tb);
  const best = Math.max(...F.pudding), worst = Math.min(...F.pudding);
  box.appendChild(h('div.maki', best === worst ? 'Everyone has the same number of custards, so nobody scores or loses for them.' : 'Custard: most (' + best + ') scores 6' + (np > 2 ? ', fewest (' + worst + ') loses 6' : ' (no penalty with two players)') + '; ties split the points, rounded down.'));
  const padHost = h('div.padw', { html: KIT.scorePadSVG({ w: Math.min(380, Math.max(260, (window.innerWidth || 380) - 48)), round: 4, rows: padRows(D.rounds, true) }) }); box.appendChild(padHost);
  const bs = NET.on ? netOverButtons() : [{ label: 'Play again', a: 'again' }, { label: 'Look at the table', a: 'cont', cls: 'alt' }, { label: 'Menu', a: 'menu', cls: 'alt' }];
  box.appendChild(h('div.cbtns', bs.map(b => h('button.btn' + (b.cls ? '.' + b.cls : ''), { type: 'button', 'data-a': b.a === 'cont' ? 'rsclose' : b.a }, b.label))));
  rs.appendChild(box);
  // confetti only when a person at this device won (or shares the win); otherwise a softer line
  const humanWin = NET.on ? iWin : ws.some(s => G.players[s] && !G.players[s].ai);
  if (humanWin) { snd('win', { duck: true }); celebrate(box); } else { snd('round', { duck: true }); if (humans().length || NET.on) wn.after(h('p.wp', 'Well played! Another meal?')); }
  UI.overShown = true;
  if (UI.mode !== 'net') { lsSet('kk_save', ''); try { GNS.saved(GAME_ID, false); } catch (e) { } }
}
function celebrate(box) {
  if (!ANIM) return; const c = h('div.conf'); const cols = ['#e5553a', '#e0a31c', '#2a97a0', '#7a5ac8', '#5aa83c', '#f4b6d2'];
  for (let i = 0; i < 40; i++) { const e = h('i'); e.style.left = Math.round(Math.random() * 100) + '%'; e.style.background = cols[i % cols.length]; e.style.animationDelay = (Math.random() * 2) + 's'; e.style.animationDuration = (2 + Math.random() * 2) + 's'; c.appendChild(e); }
  $('#rs').appendChild(c); setTimeout(() => c.remove(), 6000);
}
function closeRS() { const rs = $('#rs'); rs.hidden = true; rs.innerHTML = ''; UI.rsOpen = false; clearTimeout(UI.rsT); }
// ===================== part 5: drawers (diners, log, rules, menu), start screen, events, phone mode, boot =====================
function logHTML() { const e = h('div.logl'); for (let i = G.log.length - 1; i >= Math.max(0, G.log.length - 150); i--) e.appendChild(h('div.ll', h('span.lt', 'R' + G.log[i].round + '.' + G.log[i].turn), ' ' + G.log[i].t)); return e; }
function buildRules() {
  const root = h('div.rules');
  const sec = (t, ...k) => { root.appendChild(h('h3', t)); k.forEach(x => root.appendChild(x)); };
  sec('The goal', h('p', 'You are a diner at a conveyor-belt sushi bar. Collect plates over three rounds and score points for sets, pairs, ladders and races. The highest total after the third round wins. Ties go to the diner with more Custard Cups.'));
  sec('How a round goes', h('ol', ...[
    'Everyone is dealt a hand: 10 plates with 2 diners, 9 with 3, 8 with 4 and 7 with 5.',
    'All diners secretly pick one plate from their hand at the same time. On your phone or computer: tap a plate to lift it, then press Serve to confirm (with "Tap twice to serve" on in the menu, a second tap on the plate serves it too).',
    'When everyone has chosen, the covers lift together and the plates land on your counters.',
    'Then every hand slides one seat to the left, around the table. You pick again from the hand you just received.',
    'When the hands are empty the round is scored. Everything except Custard is cleared away and a new hand is dealt.'].map(t => h('li', t))));
  sec('Every plate', h('div', ...D.types.map(t => {
    const id = t.id; const rule = { tempura: 'pair', sashimi: 'set', dumpling: 'ladder', roll1: 'most', roll2: 'most', roll3: 'most', salmon: 'v2', squid: 'v3', egg: 'v1', wasabi: 'x3', chop: 'swap', pudding: 'dessert' }[id];
    return h('div.rcard', cardDiv(id, 64), h('div.rt', h('b', t.name + (t.copies ? ' (' + t.copies + ')' : '')), h('div', t.text)));
  })));
  sec('Scoring a round', h('ul', ...[
    'Crispy Prawn: 5 points for every pair.', 'Fish Slice: 10 points for every set of three.', 'Steam Bun: 1, 3, 6, 10, 15 points for 1, 2, 3, 4, 5 or more buns.',
    'Seaweed Rolls: add up the roll icons on your counter. The most icons scores 6. The second most scores 3. If several diners tie for the most, they split 6 (rounded down) and nobody scores second place. Ties for second split 3. Diners with no icons never score.',
    'Nigiri: Sunset 2, Moon 3, Sun 1 point. Fire Paste: your next nigiri lands on it and scores triple. A Fire Paste with no nigiri scores nothing, and each paste only takes one nigiri.'].map(t => h('li', t))));
  sec('Twin Sticks', h('p', 'Keep them on your counter. On a later turn you may serve two plates from the hand you are holding: press "Use Twin Sticks", pick two plates and serve them. The sticks then go back into that hand (they are passed on) and you have used them. A Fire Paste and a nigiri served together land on each other.'));
  sec('Custard', h('p', 'Custard Cups are never cleared away. At the end of the third round the diner with the most Custard scores 6 and the diner with the fewest loses 6. Ties split the points (rounded down). With two diners nobody loses points. If everybody has the same number, nobody scores.'));
  sec('Playing it', h('ul', ...[
    'The small green +N on a plate is what serving it scores you right now (switch it off in the menu).',
    'The glowing seat shows who is still choosing. Covered plates on the right of each counter mean that diner has chosen.',
    'Tap a group of plates on any counter to see what it is worth right now. Tap a chef to see their whole table.',
    'Hot-seat: the hands are hidden between diners, with a "pass the device" screen. Online: friends see only their own hand.',
    'Your meal is saved after every turn. If you close the page or switch apps, choose Resume on the title screen.'].map(t => h('li', t))));
  sec('Words used in the game', h('dl.gloss', ...[
    ['Belt', 'the hand of plates you are holding this turn. It moves on to the next diner after every pick.'],
    ['Counter', 'the plates you have served this round, in front of your seat.'],
    ['Serve', 'confirm the plate you lifted. Everybody serves at the same time, then the covers lift.'],
    ['Roll race', 'the Seaweed Roll contest: add up the roll icons on each counter. Most icons scores 6, second most 3.'],
    ['Nigiri', 'the Sunset, Moon and Sun plates. They score their number straight away.'],
    ['Fire Paste bonus', 'a nigiri served onto a waiting Fire Paste scores triple; the extra points show as this row on the score pad.'],
    ['Sweets', 'Custard Cups. They stay on your counter until the end of the meal.'],
    ['Order slip / score pad', 'the paper that adds up every diner\'s rounds and the custard at the end.'],
    ['+N', 'the small green number on a plate: what serving it would score you right now.']].map(([t, d]) => [h('dt', t), h('dd', d)]).flat()));
  root.appendChild(h('div', { html: '<section class="credits-audio"><h3>Credits</h3><p>Music: &ldquo;Jazz Slower&rdquo; by Pro Sensory (OpenGameArt, CC0). Ambience: &ldquo;The Shop collection: convenience store drinks fridge drone 2&rdquo; by LEGIT Audio (OpenGameArt, CC0). Sound effects: Casino Audio, Impact Sounds, Interface Sounds, Music Jingles, RPG Audio and UI Audio by Kenney (kenney.nl, CC0). All sounds were trimmed, loudness-normalised and converted for this game.</p><p>Online play uses Trystero (MIT). The painted table is drawn with PixiJS (MIT). Names, card text and art are original; the paintings were made for this game.</p></section>' }));
  return root;
}
function renderRival(seat) {
  const b = $('#rivalbody'); if (!b || !G) return; b.innerHTML = '';
  seat = seat == null ? (UI.rseat != null ? UI.rseat : focusSeat()) : seat; UI.rseat = seat;
  const tabs = h('div.rtabs');
  for (let s = 0; s < G.np; s++) { const bt = h('button.btn' + (s === seat ? '.on' : '.alt'), { 'data-a': 'rtab', 'data-seat': s, type: 'button' }); const av = h('span', { html: avatarS(s, 64) }).firstChild; av.style.cssText = 'width:26px;height:26px;display:inline-block;vertical-align:middle;margin-right:5px'; bt.append(av, pname(s)); tabs.appendChild(bt); }
  b.appendChild(tabs);
  const p = G.players[seat], tab = tables(), info = seatScoreInfo(tab), gs = groupsOf(seat, tab, info).list, pcs = pudCounts();
  b.appendChild(h('div.rhead', h('span', { html: avatarS(seat, 96) }), h('div', h('b', p.name), h('div.sm', (p.ai ? 'Computer (' + p.ai + ')' : (NET.on && seat === NET.mySeat ? 'You' : 'Diner')) + (G.phase === 'pick' ? (p.picked ? ' · has chosen' : ' · is choosing') : '')))));
  b.querySelector('.rhead svg').style.cssText = 'width:52px;height:52px';
  const bank = G.rs.map(r => r[seat].total);
  b.appendChild(h('div.kv', h('span', 'Rounds banked'), h('b', bank.length ? bank.join(' + ') + ' = ' + bank.reduce((a, c) => a + c, 0) : 'none yet')));
  if (G.phase !== 'over' && tab[seat].length) b.appendChild(h('div.kv', h('span', 'This round so far'), h('b', '+' + info.rs[seat].total)));
  b.appendChild(h('div.kv', h('span', 'Custard cups'), h('b', pcs[seat])));
  b.appendChild(h('div.kv', h('span', 'Plates in hand'), h('b', G.phase === 'over' ? 0 : G.players[seat].hand.length)));
  b.appendChild(h('h4', 'On the counter'));
  if (!gs.length) b.appendChild(h('p.sm', 'Nothing served yet this round.'));
  gs.forEach(g => b.appendChild(h('div.rcard', cardDiv(g.k === 'roll' ? 'roll2' : g.type, 54, g.on), h('div.rt', h('b', g.hint), h('div.sm', g.tip)))));
}
function renderDrawers() {
  if (!GX.open || !G) return;
  if (GX.open === 'logd') { const b = $('#logbody'); b.innerHTML = ''; b.appendChild(logHTML()); }
  if (GX.open === 'rivald') renderRival();
}
// ---------- start screens: painted title -> setup (diner cards) / online ----------
// the four chefs who can join you (you are seat 0 with Mina's portrait). Default level = the character's temper; every level can be changed.
const DINERS = {
  1: { lv: 'hard', story: 'Taro cooks noodles on the night shift and eats his supper at the belt long after midnight. He counts every plate that rolls past and remembers exactly who took the last prawn.', enjoy: 'Choose Taro if you enjoy a sharp rival who punishes every loose plate.' },
  2: { lv: 'normal', story: 'Odile ran a bakery for forty years and still wears her tall hat to dinner. She has never once left without dessert, and she will happily tell you about it.', enjoy: 'Choose Odile if you enjoy a fair, steady race with the custard on the line.' },
  3: { lv: 'normal', story: 'Kofi drives the number 9 bus and knows every regular by name. He loves a roll race, cheers when he wins it and cheers just as loudly when he loses.', enjoy: 'Choose Kofi if you enjoy a lively table where the seaweed rolls are always fought over.' },
  4: { lv: 'easy', story: 'Pip saved up pocket money all month for this dinner and wants to try one of everything. Pip picks whichever plate looks the happiest.', enjoy: 'Choose Pip if you enjoy a relaxed first meal with room to try things out.' }
};
const SEAT_ORDER = [2, 3, 1, 4];
function optObj() { const o = UI.opt = UI.opt || Object.assign({}, DEF, { lv: DEF.lv.slice(), seats: DEF.seats.slice() }); if (!Array.isArray(o.seats)) o.seats = chefsFor(o.np || 3, o).slice(1); if (!o.lv) o.lv = DEF.lv.slice(); o.np = o.seats.length + 1; return o; }
function setNp(n) { const o = optObj(), want = Math.max(1, Math.min(4, n - 1)); const st = o.seats.slice(); while (st.length > want) st.pop(); for (const c of SEAT_ORDER) { if (st.length >= want) break; if (st.indexOf(c) < 0) st.push(c); } o.seats = st; o.np = st.length + 1; }
function toggleChef(c) { const o = optObj(), st = o.seats.slice(), i = st.indexOf(c); if (i >= 0) { if (st.length > 1) st.splice(i, 1); else { toast('At least one chef joins you.'); return; } } else st.push(c); o.seats = st; o.np = st.length + 1; }
function logoSVG() { return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="#fbf0da" stroke="#4a2a22" stroke-width="1.6"/><circle cx="12" cy="12" r="7" fill="#e5553a" stroke="#4a2a22" stroke-width="1.2"/><circle cx="12" cy="12" r="3.2" fill="#fbf0da" stroke="#4a2a22" stroke-width="1"/></svg>'; }
function tableLine(o) { const nm = o.seats.map(c => PN[c]); return 'You + ' + nameList(nm) + ' · ' + o.np + ' diners'; }
function renderStart() {
  const s = $('#start'); s.hidden = false; s.innerHTML = '';
  const rs = $('#rs'); if (rs && !UI.rsOpen) { rs.hidden = true; }
  if (NET.on) { s.dataset.v = 'net'; netStartScreen(s); return; }
  if (!UI.sv) UI.sv = UI.onl ? 'online' : 'title';
  s.dataset.v = UI.sv;
  if (UI.sv === 'title') { s.appendChild(titleEl()); return; }
  if (KIT.ART.title) s.appendChild(h('img.ttl-bg.dim', { src: KIT.ART.title, alt: '' }));
  if (UI.sv === 'online') { s.appendChild(onlineEl()); return; }
  s.appendChild(setupEl());
}
function titleEl() {
  // a saved meal comes first: Resume leads the buttons
  const bg = KIT.ART.title ? h('img.ttl-bg', { src: KIT.ART.title, alt: '' }) : h('div.ttl-bg.ttl-plain');
  const sv = hasSave();
  return h('div.ttl', bg, h('div.ttl-in',
    h('h1.logo', h('span.ic', { html: logoSVG() }), h('span', 'Kaiten Kitchen')),
    h('p.tag', 'Grab a plate, pass the belt.'),
    h('div.tbtns',
      sv ? h('button.tbtn.go', { 'data-a': 'loadsave', type: 'button' }, h('b', 'Resume'), h('span', (si => si ? 'your meal, round ' + si.round + ' of ' + D.rounds + ' · ' + si.np + ' diners' : 'your saved meal')(saveInfo()))) : null,
      h('button.tbtn' + (sv ? '' : '.go'), { 'data-a': 'play', type: 'button' }, h('b', sv ? 'New game' : 'Play'), h('span', 'against the computer chefs')),
      h('button.tbtn', { 'data-a': 'online', type: 'button' }, h('b', 'Online'), h('span', 'with friends, free'))),
    h('button.tlink', { 'data-a': 'rules', type: 'button' }, 'How to play')));
}
function dinerCard(c, o) {
  const d = DINERS[c], on = o.seats.indexOf(c) >= 0, lv = o.lv[c - 1] || 'normal', pc = KIT.PLAYERS[c];
  const card = h('article.dcard' + (on ? '.on' : ''), { 'aria-label': PN[c] + (on ? ', at the table' : ', not at the table') });
  card.style.setProperty('--dc', pc.c);
  card.append(h('div.dtop', h('div.dimg', { html: avatarC(c, 120) }), h('h3', PN[c], h('small', on ? lv : 'not invited'))), h('div.dtx', h('p.story', d.story), h('p.enjoy', d.enjoy),
    h('div.drow', h('button.chipb.seatb' + (on ? '.on' : ''), { 'data-a': 'seatchef', 'data-c': c, type: 'button', 'aria-pressed': on ? 'true' : 'false' }, on ? 'At the table ✓' : 'Invite'),
      on ? h('span.lvs', ['easy', 'normal', 'hard'].map(v => h('button.chipb' + (lv === v ? '.on' : ''), { 'data-a': 'lv', 'data-seat': c, 'data-v': v, type: 'button', 'aria-pressed': lv === v ? 'true' : 'false', 'aria-label': PN[c] + ' plays ' + v }, v))) : null)));
  return card;
}
function setupEl() {
  const o = optObj(), ph = isPh(), open = !!UI.cfgOpen;
  const head = h('div.shead', h('button.px.sback', { 'data-a': 'title', type: 'button', 'aria-label': 'Back to the title' }, '‹'), h('h2', 'Who is at the counter?'));
  const sum = h('div.ssum', h('div.sfaces', o.seats.map(c => h('span', { html: avatarC(c, 64) }))), h('span.sline', tableLine(o)), h('button.btn.alt', { 'data-a': 'cfgopen', type: 'button', 'aria-expanded': open ? 'true' : 'false' }, 'Configure'));
  const cfg = h('div.cfg#cfg', { hidden: ph && !open ? true : null, role: ph ? 'dialog' : null, 'aria-label': ph ? 'Configure the table' : null },
    ph ? h('div.cfghead', h('b', 'Configure the table'), h('button.btn', { 'data-a': 'cfgclose', type: 'button' }, 'Done')) : null,
    h('div.seg', h('span.lbl', 'Table for'), [2, 3, 4, 5].map(v => h('button.chipb' + (o.np === v ? '.on' : ''), { 'data-a': 'opt', 'data-k': 'np', 'data-v': v, type: 'button', 'aria-pressed': o.np === v ? 'true' : 'false' }, v))),
    h('div.dgrid', [1, 2, 3, 4].map(c => dinerCard(c, o))),
    ph ? h('div.cfgfoot', h('button.btn.go', { 'data-a': 'cfgclose', type: 'button' }, 'Done')) : null);
  const n = o.np - 1;
  // until one guided game is finished, the lesson is the big button and "Start the meal" moves into the row below
  const first = !lsGet('kk_guided_done');
  const meal = cls => h('button.sbtn' + cls, { 'data-start': 'vs', 'data-a': 'start', 'data-m': 'vs', type: 'button' }, h('b', 'Start the meal'), h('span', 'You against ' + nameList(o.seats.map(c => PN[c]))));
  const lesson = cls => h('button.sbtn' + cls, { 'data-start': 'guided', 'data-a': 'guided', type: 'button' }, h('b', first ? 'Learn as you play' : 'Guided first game'), h('span', first ? 'A short lesson with ' + PN[o.seats[0]] + ', then a full meal' : 'You and ' + PN[o.seats[0]] + ', with a lesson'));
  const go = h('div.sgo',
    first ? lesson('.big') : meal('.big'),
    h('div.sgrid3',
      first ? meal('') : lesson(''),
      h('button.sbtn', { 'data-start': 'hot', 'data-a': 'start', 'data-m': 'hot', type: 'button' }, h('b', 'Hot-seat'), h('span', o.np + ' people, one device')),
      h('button.sbtn', { 'data-start': 'ai', 'data-a': 'start', 'data-m': 'ai', type: 'button' }, h('b', 'Watch'), h('span', 'the chefs play'))));
  return h('div.setup.scard', head, ph ? sum : h('p.ssub', 'Invite the chefs you want at the belt. Each one has a temper; change their level if you like.'), cfg, go);
}
function onlineEl() {
  return h('div.setup.scard.onlv', h('div.shead', h('button.px.sback', { 'data-a': 'title', type: 'button', 'aria-label': 'Back to the title' }, '‹'), h('h2', 'Play online')),
    h('p.ssub', 'Host a table and send friends the code or the link. Every browser connects directly; nobody sees another hand. Empty seats go to the computer chefs.'),
    h('details.online#onl', { open: true }, h('summary', 'Free, peer to peer'), h('div#netblock', netInner())));
}
function showStart() { try { GX.close(); } catch (e) { } closePop(); UI.cards = []; UI.sv = 'title'; UI.cfgOpen = false; const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; } closeRS(); clearTimeout(UI.tm); renderStart(); }
// ---------- events ----------
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-a],[data-start]'); const pop = $('#ppop');
  if (!t) { if (UI.pop && pop && !pop.contains(ev.target) && !ev.target.closest('#pc,.gx-drawer,#rs')) closePop(); return; }
  const a = t.dataset.a, d = t.dataset;
  if (netClick(a, t)) return;
  if (d.start && !a) { newGame(d.start); return; }
  switch (a) {
    case 'hcard': tapHand(+d.i); break;
    case 'serve': serveSel(); break;
    case 'twin': toggleTwin(); break;
    case 'hint': hint(); break;
    case 'unsel': UI.sel = []; UI.rec = null; render(); break;
    case 'grp': openGroup(+d.seat, d.k); break;
    case 'seat': case 'chip': UI.rseat = +d.seat; GX.show('rivald'); renderRival(UI.rseat); break;
    case 'rtab': renderRival(+d.seat); break;
    case 'popx': closePop(); break;
    case 'cont': nextCard(); break;
    case 'take': takeDevice(); break;
    case 'rsnext': afterRound(UI.rsInfo && UI.rsInfo.ge); break;
    case 'rsskip': skipCount(); break;
    case 'rsclose': closeRS(); break;
    case 'again': { const m = UI.mode, c = UI.cfg || {}; UI.cards = []; closeRS(); newGame(m === 'net' ? 'vs' : m, { np: c.np, level: c.level, lv: c.lv, seats: c.seats || undefined }); break; }
    case 'play': UI.sv = 'setup'; renderStart(); break;
    case 'online': UI.sv = 'online'; UI.onl = true; renderStart(); break;
    case 'title': UI.sv = 'title'; UI.cfgOpen = false; renderStart(); break;
    case 'cfgopen': UI.cfgOpen = true; renderStart(); try { const c = $('#cfg'); if (c) c.querySelector('button').focus({ preventScroll: true }); } catch (e) { } break;
    case 'cfgclose': UI.cfgOpen = false; renderStart(); break;
    case 'seatchef': toggleChef(+d.c); renderStart(); break;
    case 'menu': showStart(); break;
    case 'start': newGame(d.m); break;
    case 'guided': newGame('guided'); break;
    case 'opt': { const o = optObj(); if (d.k === 'np') setNp(+d.v); else { o[d.k] = isNaN(+d.v) ? d.v : +d.v; if (d.k === 'level') o.lv = [d.v, d.v, d.v, d.v]; } renderStart(); break; }
    case 'lv': { const o = optObj(); o.lv = (o.lv || DEF.lv).slice(); o.lv[+d.seat - 1] = d.v; renderStart(); break; }
    case 'rules': GX.show('rulesd'); break;
    case 'save': toast(save() ? 'Game saved.' : 'Could not save.'); try { GX.renderSettings(); } catch (e) { } break;
    case 'loadsave': if (!loadSave()) toast('No saved game.'); break;
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (UI.pop) closePop(); else if (UI.rsOpen && UI.mode && G && G.phase === 'over' && UI.overShown) closeRS(); } });
// ---------- phone mode ----------
function applyPhone() {
  const q = /[?&]phone=(\d)/.exec(location.search); const w = innerWidth, hh = innerHeight, short = Math.min(w, hh);
  let ph = short <= 500 || (window.matchMedia && matchMedia('(pointer:coarse)').matches && short <= 600);
  if (q) ph = q[1] === '1';
  const r = document.documentElement.classList, was = r.contains('ph');
  r.toggle('ph', ph); if (UI.prefs.tap2 == null) UI.prefs.tap2 = !ph;   // phones: Serve button only by default (no accidental second tap)
  try { const bb = document.querySelector('.gx-bar').getBoundingClientRect(); document.documentElement.style.setProperty('--kkbar', Math.max(0, Math.round(bb.bottom)) + 'px'); } catch (e) { }
  document.documentElement.style.setProperty('--dockh', Math.max(146, Math.min(178, Math.round(hh * .22))) + 'px'); r.toggle('ph-p', ph && w < hh); r.toggle('ph-l', ph && w >= hh);
  placePrompt(); if (was !== ph) { if (G && UI.started) render(); const st = $('#start'); if (st && !st.hidden && !NET.on && UI.sv === 'setup') renderStart(); }
}
let rzT = 0;
function onResize() { clearTimeout(rzT); rzT = setTimeout(() => { applyPhone(); if (G && UI.started) render(); }, 60); }
// ---------- boot ----------
function boot() {
  GX.init({ key: 'kk' });
  GX.drawer('rulesd', 'How to play', buildRules(), true);
  GX.drawer('logd', 'Log', h('div#logbody'));
  GX.drawer('rivald', 'Diners and scores', h('div#rivalbody'));
  GX.onShow = id => { renderDrawers(); };
  loadPrefs(); kitBoot(); applyPhone();
  addEventListener('resize', onResize); addEventListener('orientationchange', onResize);
  addEventListener('pagehide', () => { try { flushSave(); } catch (e) { } });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') try { flushSave(); } catch (e) { } });
  const bd = $('#board'); if (window.ResizeObserver) new ResizeObserver(() => { if (G && UI.started) { clearTimeout(rzT); rzT = setTimeout(() => { if (G && UI.started) render(); }, 40); } }).observe(bd);
  try { if (window.GA) { const A = typeof GA_DATA !== 'undefined' ? GA_DATA : {}; GA.init({ sfx: A.sfx || {}, music: A.music || {}, key: 'kk' }); GA.setSfx(UI.prefs.sound); GA.setMusic(UI.prefs.music); GX.applyPrefs(); } } catch (e) { }
  pxPerfReg();
  pxInit().then(ok => { if (ok) { pxPerfReg(); if (G && UI.started) render(); } });
  if (/[?&]seed=(\d+)/.test(location.search)) UI.seed = +RegExp.$1;
  netInit();
  renderStart();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
// ===================== part 6: sound (shared gameaudio samples; silent without Web Audio) =====================
// SND_MAP: one line per event. s:null falls back to nothing (the sample may be re-tuned by ear later).
const SND_MAP = { click: { s: 'click', vol: .5 }, clink: { s: 'clink', vol: .7 }, slide: { s: 'slide', vol: .55 }, pass: { s: 'pass', vol: .6 }, pick: { s: 'pick', vol: .6 }, cloche: { s: 'cloche', vol: .65 }, coin: { s: 'coin', vol: .6 },
  tick: { s: 'tick', vol: .4 }, round: { s: 'round', vol: .7 }, win: { s: 'win', vol: .8 }, error: { s: 'error', vol: .5 } };
function snd(name, o) {
  try {
    if (UI.prefs && UI.prefs.sound === false) return;
    const m = SND_MAP[name] || { s: name, vol: 1 }; if (!m.s || !window.GA || !GA.has(m.s)) return;
    const oo = Object.assign({}, o || {}); oo.vol = (oo.vol != null ? oo.vol : 1) * (m.vol != null ? m.vol : 1); GA.play(m.s, oo);
  } catch (e) { }
}
function sndMusic() {
  try {
    if (!window.GA) return;
    if (UI.prefs.music === false || !G || !UI.started) { GA.music(null); GA.stopLoop && GA.stopLoop('belt'); return; }
    GA.music('main', { vol: .32 }); if (GA.loop) GA.loop('belt', { vol: .16, fade: 1.5 });
  } catch (e) { }
}
document.addEventListener('click', e => { const t = e.target.closest('button'); if (t && !t.disabled && !t.matches('.hc,[data-a=serve],[data-a=rsnext]')) snd('click'); }, true);
// ===================== part 7: the painted table (PixiJS 8: WebGL, else Pixi's canvas renderer, else the plain DOM view) =====================
// The DOM stays the layout, hit and accessibility layer: every plate on the belt and every group on a counter is still a real <button>.
// When the Pixi table is on (html.kkpx), those buttons keep their text badges but hide their own pictures; this layer reads their boxes
// after every render() and moves painted sprites there: cards ease to their new places (FLIP-style re-flow), served cards fly to the seat,
// plates land on the counters with a squash, hands slide along the belt, steam / flames / sparkles and a burst when a plate scores.
// Nothing here changes the game state; it only follows the DOM (so hidden hands stay hidden: a sprite only shows what its button shows).
const PX = { on: false, app: null, q: 'high', res: 1, kind: '', B: null, cv: null, L: {}, objs: new Map(), tweens: [], parts: [], tex: {}, img: {}, faceP: {}, hw: 0, dirty: true, t: 0, last: 0, beltX: 0, seats: new Map(), err: '', ready: false, raf: 0, landSet: new Set() };
const PXQ = { high: { pr: 2, fx: 1, blur: true, parts: 1, belt: 1 }, medium: { pr: 1.5, fx: .55, blur: false, parts: .5, belt: 1 }, low: { pr: 1, fx: 0, blur: false, parts: 0, belt: 0 } };
const pxRM = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
function gfxAuto() {
  const n = navigator.hardwareConcurrency || 4, mem = navigator.deviceMemory || 4, ph = isPh();
  if (n <= 2 || mem <= 2) return 'low';
  if (PX.soft) return 'low';
  return ph ? 'medium' : 'high';
}
function gfxPref() { return UI.prefs.gfx || 'auto'; }
function gfxLevel() { const p = gfxPref(); return p === 'auto' ? (PX.autoQ || gfxAuto()) : p; }
// ---- boot: inject the stored Pixi source, make the renderer, load the textures ----
async function pxInit() {
  try {
    if (/jsdom/i.test(navigator.userAgent || '') || /[?&]px=0/.test(location.search) || typeof KK_ART === 'undefined' || !KIT.ART.tempura) return false;
    if (!window.PIXI) { const src = document.getElementById('pixi-src'); if (!src) return false; const s = document.createElement('script'); s.textContent = src.textContent; document.head.appendChild(s); }
    if (!window.PIXI || !PIXI.Application) return false;
    const bd = $('#bd'); const cv = document.createElement('canvas'); cv.id = 'pxc'; cv.setAttribute('aria-hidden', 'true'); bd.insertBefore(cv, bd.firstChild);
    PX.q = gfxLevel(); PX.res = pxBasePR();
    const want = /[?&]px=canvas/.test(location.search) ? ['canvas'] : ['webgl', 'canvas'];
    let app = null;
    for (const pref of want) {
      try {
        const a = new PIXI.Application();
        await a.init({ canvas: cv, backgroundAlpha: 0, antialias: false, resolution: PX.res, autoDensity: true, preference: pref, autoStart: false, sharedTicker: false, width: Math.max(16, bd.clientWidth), height: Math.max(16, bd.clientHeight), powerPreference: 'low-power', failIfMajorPerformanceCaveat: false, hello: false });
        if (pref === 'webgl' && a.renderer && a.renderer.type !== undefined && a.renderer.name && !/webgl/i.test(a.renderer.name)) { }
        app = a; PX.kind = (a.renderer && a.renderer.name) || pref; break;
      } catch (e) { PX.err += pref + ': ' + (e && e.message || e) + '; '; }
    }
    if (!app) { cv.remove(); return false; }
    PX.app = app; PX.cv = cv;
    try { const gl = app.renderer.gl; if (gl) { const ext = gl.getExtension('WEBGL_debug_renderer_info'); const r = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : ''; if (/swiftshader|llvmpipe|software/i.test(r)) PX.soft = true; PX.gpu = r; } } catch (e) { }
    if (gfxPref() === 'auto') { PX.q = gfxLevel(); pxSetRes(pxBasePR()); }
    cv.addEventListener('webglcontextlost', e => { e.preventDefault(); pxOff('context lost'); });
    await pxTextures();
    const st = app.stage; const C = () => new PIXI.Container();
    PX.L = { seat: C(), belt: C(), plate: C(), hand: C(), fly: C(), fx: C() };
    for (const k of ['seat', 'belt', 'plate', 'hand', 'fly', 'fx']) st.addChild(PX.L[k]);
    PX.handMask = new PIXI.Graphics(); st.addChild(PX.handMask); PX.L.hand.mask = PX.handMask;
    PX.beltBg = new PIXI.Graphics(); PX.L.belt.addChild(PX.beltBg);
    PX.belt = new PIXI.TilingSprite({ texture: PX.tex.belt, width: 10, height: 10 }); PX.L.belt.addChild(PX.belt);
    PX.beltShade = new PIXI.Graphics(); PX.L.belt.addChild(PX.beltShade);
    PX.on = true; PX.ready = true; document.documentElement.classList.add('kkpx');
    pxApplyQ();
    const bdEl = $('#belt'); if (bdEl) bdEl.addEventListener('scroll', pxDirty, { passive: true });
    document.addEventListener('scroll', e => { if (e.target && e.target.classList && e.target.classList.contains('ctr')) pxDirty(); }, { passive: true, capture: true });
    if (window.ResizeObserver) new ResizeObserver(() => { pxResize(); }).observe(bd);
    pxResize(); pxLoop();
    return true;
  } catch (e) { console.warn('painted table off:', e); pxOff(String(e && e.message || e)); return false; }
}
function pxOff(why) {
  PX.on = false; PX.err += (why || '') + ';'; document.documentElement.classList.remove('kkpx');
  try { if (PX.cv) PX.cv.remove(); } catch (e) { }
  try { if (G && UI.started) render(); } catch (e) { }
}
function pxBasePR() { const d = window.devicePixelRatio || 1; const q = PXQ[PX.q] || PXQ.high; const w = Math.min(q.pr, d); return window.PerfHUD && PerfHUD.pixelRatio ? PerfHUD.pixelRatio(w) : w; }
function pxSetRes(v) { PX.res = v; if (PX.app && PX.app.renderer) { try { PX.app.renderer.resolution = v; pxResize(true); } catch (e) { } } }
function pxApplyQ() {
  PX.q = gfxLevel(); pxSetRes(pxBasePR());
  // High: real blur on the steam and the glow; Medium: pre-blurred textures only; Low: no particles, still belt, no filters
  const q = PXQ[PX.q];
  try { PX.L.fx.filters = q.blur ? [new PIXI.BlurFilter({ strength: 1.6, quality: 2 })] : null; } catch (e) { }
  PX.dirty = true;
}
function setGfx(v) { UI.prefs.gfx = v; savePrefs(); PX.autoQ = null; if (PX.on) { pxApplyQ(); pxPerfReg(); } }
// ---- textures: painted pictures (blob URLs from KK_ART) + small generated sprites ----
function pxLoadImg(url) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; }); }
async function pxTextures() {
  const ids = Object.keys(KIT.ART);
  await Promise.all(ids.map(async k => { try { const im = await pxLoadImg(KIT.ART[k]); PX.img[k] = im; PX.tex[k] = PIXI.Texture.from(im); } catch (e) { } }));
  const mk = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return PIXI.Texture.from(c); };
  const radial = (stops) => (x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); stops.forEach(s => g.addColorStop(s[0], s[1])); x.fillStyle = g; x.fillRect(0, 0, w, h); };
  PX.tex.shadow = mk(64, 64, radial([[0, 'rgba(42,18,8,.55)'], [.55, 'rgba(42,18,8,.3)'], [1, 'rgba(42,18,8,0)']]));
  PX.tex.glow = mk(64, 64, radial([[0, 'rgba(255,214,90,.95)'], [.5, 'rgba(255,190,60,.45)'], [1, 'rgba(255,170,40,0)']]));
  PX.tex.puff = mk(48, 48, radial([[0, 'rgba(255,255,255,.95)'], [.45, 'rgba(255,255,255,.55)'], [1, 'rgba(255,255,255,0)']]));
  PX.tex.flame = mk(32, 48, (x, w, h) => { const g = x.createRadialGradient(w / 2, h * .7, 1, w / 2, h * .6, h * .55); g.addColorStop(0, 'rgba(255,240,150,1)'); g.addColorStop(.35, 'rgba(255,150,40,.95)'); g.addColorStop(.7, 'rgba(230,70,30,.5)'); g.addColorStop(1, 'rgba(200,40,20,0)'); x.fillStyle = g; x.beginPath(); x.moveTo(w / 2, 0); x.bezierCurveTo(w * .9, h * .4, w, h * .75, w / 2, h); x.bezierCurveTo(0, h * .75, w * .1, h * .4, w / 2, 0); x.fill(); });
  PX.tex.spark = mk(32, 32, (x, w, h) => { x.translate(w / 2, h / 2); x.fillStyle = '#fff3b0'; x.strokeStyle = '#c98a10'; x.lineWidth = 1.5; x.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 4 : 14, a = i / 8 * Math.PI * 2; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fill(); x.stroke(); });
  PX.tex.coin = mk(32, 32, (x, w, h) => { x.fillStyle = '#ffd25a'; x.strokeStyle = '#8a5a12'; x.lineWidth = 2.5; x.beginPath(); x.arc(w / 2, h / 2, 12, 0, Math.PI * 2); x.fill(); x.stroke(); x.fillStyle = '#fff6c8'; x.beginPath(); x.arc(w / 2 - 4, h / 2 - 4, 3.5, 0, Math.PI * 2); x.fill(); });
  PX.tex.cardShadow = mk(80, 108, (x, w, h) => { x.filter = 'blur(6px)'; x.fillStyle = 'rgba(30,12,4,.55)'; x.beginPath(); x.roundRect ? x.roundRect(12, 12, w - 24, h - 24, 8) : x.rect(12, 12, w - 24, h - 24); x.fill(); });
  PX.tex.cardGlow = mk(96, 124, (x, w, h) => { x.filter = 'blur(8px)'; x.fillStyle = 'rgba(255,205,70,.95)'; x.beginPath(); x.roundRect ? x.roundRect(14, 14, w - 28, h - 28, 10) : x.rect(14, 14, w - 28, h - 28); x.fill(); });
}
function svgImgP(svg) { return pxLoadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)); }
// a card face at w CSS px: the kit's mat, the painted plate, the kit's name chit + rule badge (so text stays >= 13 px like the DOM cards)
function pxFace(type, w, on) {
  const r = Math.min(2, Math.max(1, PX.res)), key = type + '|' + (on || '') + '|' + w + '|' + r;
  if (PX.tex['f:' + key]) return PX.tex['f:' + key];
  if (!PX.faceP[key]) PX.faceP[key] = (async () => {
    const o = on ? { variant: 'nigiri', on } : {};
    const [m, t] = await Promise.all([svgImgP(KIT.cardSVG(type, Object.assign({ w, standalone: true, part: 'mat' }, o))), svgImgP(KIT.cardSVG(type, Object.assign({ w, standalone: true, part: 'top' }, o)))]);
    const H = Math.round(w * 1.4), c = document.createElement('canvas'); c.width = Math.round(w * r); c.height = Math.round(H * r); const x = c.getContext('2d'); x.scale(r, r);
    x.drawImage(m, 0, 0, w, H); const ak = type === 'wasabi' && on ? 'wasabi-nigiri' : type, im = PX.img[ak];
    if (im) { const Ly = KIT.cardLayout(w), D2 = Ly.D * 1.1; x.drawImage(im, Ly.cx - D2 / 2, Ly.cy - D2 / 2, D2, D2); }
    x.drawImage(t, 0, 0, w, H);
    const tex = PIXI.Texture.from(c); tex.__w = w; PX.tex['f:' + key] = tex; PX.dirty = true; pxDirty(); return tex;
  })().catch(() => null);
  return null;
}
function pxBack(w) {
  const r = Math.min(2, Math.max(1, PX.res)), key = 'bk|' + w + '|' + r; if (PX.tex[key]) return PX.tex[key];
  const H = Math.round(w * 1.4), c = document.createElement('canvas'); c.width = Math.round(w * r); c.height = Math.round(H * r); const x = c.getContext('2d'); x.scale(r, r);
  const rr = w * .085; x.beginPath(); x.roundRect ? x.roundRect(1, 1, w - 2, H - 2, rr) : x.rect(1, 1, w - 2, H - 2); x.save(); x.clip(); if (PX.img.back) x.drawImage(PX.img.back, 0, 0, w, H); else { x.fillStyle = '#223a6e'; x.fillRect(0, 0, w, H); } x.restore();
  x.lineWidth = Math.max(1.2, w * .014); x.strokeStyle = '#4a2a22'; x.stroke();
  const t = PIXI.Texture.from(c); PX.tex[key] = t; return t;
}
// ---- the layout read: one pass over the DOM after each render ----
let pxQueued = false;
function pxDirty() { if (!PX.on || pxQueued) return; pxQueued = true; requestAnimationFrame(() => { pxQueued = false; try { pxSync(); } catch (e) { console.error(e); } }); }
function pxResize(force) {
  if (!PX.app) return; const bd = $('#bd'); const w = Math.max(16, bd.clientWidth), h = Math.max(16, bd.clientHeight);
  if (force || w !== PX.w || h !== PX.h) { PX.w = w; PX.h = h; try { PX.app.renderer.resize(w, h, PX.res); } catch (e) { } PX.dirty = true; }
  pxDirty();
}
function pxRect(el, B) { const r = el.getBoundingClientRect(); return { x: r.left - B.left, y: r.top - B.top, w: r.width, h: r.height }; }
function pxSync() {
  if (!PX.on || !G || !UI.started) { if (PX.on) pxClear(); return; }
  const bd = $('#bd'); const B = bd.getBoundingClientRect(); PX.B = B;
  const seen = new Set(), now = performance.now();
  const ent = UI.pxEnter || ''; UI.pxEnter = '';
  // --- seats: panel + counter
  const seatSeen = new Set();
  for (const se of document.querySelectorAll('#tbl .seat')) {
    const s = +se.dataset.seat, ctr = se.querySelector('.ctr'); if (!ctr) continue; seatSeen.add(s);
    let o = PX.seats.get(s); if (!o) { o = pxSeatObj(s); PX.seats.set(s, o); }
    const R = pxRect(se, B), Cr = pxRect(ctr, B), me = se.classList.contains('me'), ch = se.classList.contains('choose');
    const sig = [R.x, R.y, R.w, R.h, Cr.x, Cr.y, Cr.w, Cr.h, me, ch, chefOf(s)].map(v => typeof v === 'number' ? Math.round(v) : v).join(',');
    if (o.sig !== sig) { o.sig = sig; pxDrawSeat(o, s, R, Cr, me, ch); }
    o.choose = ch; o.R = R; o.ctr = Cr;
    const sl = se.querySelector('.slot .sbox'); o.slot = sl ? pxRect(sl, B) : null;
    const av = se.querySelector('.sh .av'); o.av = av ? pxRect(av, B) : null;
  }
  for (const [s, o] of PX.seats) if (!seatSeen.has(s)) { o.c.destroy({ children: true }); o.mask && o.mask.destroy(); PX.seats.delete(s); }
  // --- plates on the counters
  for (const g of document.querySelectorAll('#tbl .grp')) {
    const s = +g.dataset.seat, k = g.dataset.k, key = 'g:' + s + '|' + k, pl = g.querySelector('.pl'); if (!pl) continue;
    const R = pxRect(pl, B), so = PX.seats.get(s);
    const type = g.dataset.type || (k === 'pud' ? 'pudding' : 'tempura'), on = g.dataset.on || '', n = +(g.dataset.n || 1), pts = +(g.dataset.pts || 0);
    const layers = Math.min(Math.max(n, 1), 3), dim = k === 'pud' && n === 0;
    seen.add(key);
    let o = PX.objs.get(key), fresh = false;
    if (!o) { o = pxPlateObj(key, s); fresh = true; }
    const landing = PX.landSet.has(s + '|' + k); if (landing) PX.landSet.delete(s + '|' + k);
    o.seat = s; o.type = type; o.on = on; o.layers = layers; o.dim = dim; o.pulse = g.classList.contains('waitf'); o.tw = R.w ? R.h : o.tw; o.tx = R.x; o.ty = R.y; o.d = R.h; o.vis = so ? pxVisIn(R, so.ctr) : 1; o.k = k;
    if (o.pts == null) o.pts = pts;
    if (landing && ANIM && so && so.slot) {   // the plate lands from this seat's reveal slot
      const from = so.slot, gain = pts - (o.pts || 0);
      pxFlyPlate(o, from, fresh, gain);
    }
    o.pts = pts;
    if (fresh && !landing) { o.x = o.tx; o.y = o.ty; o.w = o.d; if (ANIM && !ent && G.phase === 'pick') { o.s = .6; o.a = 0; } }
    pxPlateTex(o);
  }
  // --- the hand on the belt
  const belt = $('#belt'), bw = $('#beltw');
  if (bw) { const Rw = pxRect(bw, B); PX.beltR = Rw; const Rz = pxRect($('#beltz'), B); PX.beltZ = Rz; pxDrawBelt(Rz, Rw); }
  const cards = belt ? [...belt.querySelectorAll('.hc')] : [];
  const hw = cards.length ? Math.round(cards[0].offsetWidth) : PX.hw; if (hw) PX.hw = hw;
  cards.forEach((el, i) => {
    const id = el.dataset.id, key = id != null ? 'h:' + id : 'b:' + i, R = pxRect(el, B);
    seen.add(key);
    let o = PX.objs.get(key), fresh = false;
    if (!o) { o = pxCardObj(key); fresh = true; }
    o.type = id != null ? tkey(+id) : null; o.back = id == null; o.sel = el.classList.contains('sel'); o.locked = el.classList.contains('locked'); o.rec = el.classList.contains('rec');
    o.tx = R.x; o.ty = R.y; o.tw = R.w; o.idx = i;
    if (fresh) {
      if (ANIM && ent === 'pass' && PX.beltR) { o.x = PX.beltR.x + PX.beltR.w + 30 + i * (R.w * .5); o.y = R.y; o.w = R.w; o.delay = now + i * 45; o.rot = .05; }
      else if (ANIM && ent === 'deal' && PX.beltR) { o.x = PX.w / 2 - R.w / 2; o.y = -R.w * 1.6; o.w = R.w * .7; o.delay = now + i * 60; o.rot = -.4 + i * .08; o.flip = 1; }
      else { o.x = R.x; o.y = R.y; o.w = R.w; }
    }
    pxCardTex(o);
  });
  // --- everything that left the DOM: hand cards slide on / out, plates clear away
  for (const [key, o] of PX.objs) {
    if (seen.has(key) || o.detached) continue;
    if (!ANIM || !PX.ready) { pxKill(o); continue; }
    o.detached = true;
    if (o.kind === 'plate') pxTween(o, { a: 0, s: .5 }, 260, 'in', () => pxKill(o));
    else pxTween(o, { a: 0, s: .7, y: o.y + 20 }, 220, 'in', () => pxKill(o));
  }
  PX.landSet.clear();
  if (PX.beltR) { PX.handMask.clear(); PX.handMask.rect(PX.beltR.x, PX.beltR.y - 40, PX.beltR.w, PX.beltR.h + 44).fill(0xffffff); }
  PX.dirty = true;
}
function pxClear() { for (const [, o] of PX.objs) pxKill(o); for (const [, o] of PX.seats) o.c.destroy({ children: true }); PX.seats.clear(); if (PX.beltBg) { PX.beltBg.clear(); PX.belt.visible = false; PX.beltShade.clear(); } PX.dirty = true; }
function pxVisIn(R, C) { if (!C) return 1; const cx = R.x + R.w / 2; return cx >= C.x - 2 && cx <= C.x + C.w + 2 ? 1 : 0; }
// ---- seat panel + counter
function pxSeatObj(s) { const c = new PIXI.Container(); PX.L.seat.addChild(c); const o = { s, c, g: new PIXI.Graphics(), ctrT: new PIXI.TilingSprite({ texture: PX.tex.counter || PIXI.Texture.WHITE, width: 10, height: 10 }), top: new PIXI.Graphics(), glow: new PIXI.Sprite(PX.tex.glow) };
  o.glow.anchor.set(.5); o.glow.alpha = 0; c.addChild(o.glow, o.g, o.ctrT, o.top); return o; }
function pxDrawSeat(o, s, R, Cr, me, ch) {
  const col = parseInt(pcol(s).c.slice(1), 16);
  o.g.clear(); o.g.roundRect(R.x, R.y, R.w, R.h, 12).fill({ color: 0xfffaf0, alpha: me ? .5 : .28 });
  if (me) o.g.roundRect(R.x, R.y, R.w, R.h, 12).stroke({ color: 0x4a2a22, alpha: .35, width: 2 });
  o.ctrT.x = Cr.x + 1; o.ctrT.y = Cr.y + 1; o.ctrT.width = Math.max(1, Cr.w - 2); o.ctrT.height = Math.max(1, Cr.h - 2);
  const k = Math.max(.2, (Cr.h - 2) / 256 * 1.7); o.ctrT.tileScale.set(k, k); o.ctrT.tilePosition.x = -s * 211;
  o.top.clear();
  // the diner's colour as a painted trim along the front edge of the counter (no band across the wood)
  const th = Math.max(4, Math.min(8, Cr.h * .08));
  o.top.roundRect(Cr.x + 2, Cr.y + Cr.h - th - 2, Cr.w - 4, th, th / 2).fill({ color: col, alpha: .95 });
  o.top.rect(Cr.x + 6, Cr.y + Cr.h - th - 1, Cr.w - 12, 1.2).fill({ color: 0xffffff, alpha: .35 });
  o.top.rect(Cr.x + 2, Cr.y + 2, Cr.w - 4, Math.min(10, Cr.h * .14)).fill({ color: 0x2a120c, alpha: .14 });
  o.top.roundRect(Cr.x, Cr.y, Cr.w, Cr.h, 10).stroke({ color: 0x4a2a22, width: 2 });
  if (PX.q !== 'low') { if (!o.mask) { o.mask = new PIXI.Graphics(); PX.app.stage.addChild(o.mask); } o.mask.clear(); o.mask.roundRect(Cr.x + 1, Cr.y + 1, Cr.w - 2, Cr.h - 2, 9).fill(0xffffff); o.ctrT.mask = o.mask; }
  else if (o.mask) { o.ctrT.mask = null; o.mask.destroy(); o.mask = null; }
  o.glow.x = R.x + R.w / 2; o.glow.y = R.y + R.h / 2; o.glow.width = R.w * 1.15; o.glow.height = R.h * 1.6;
}
function pxDrawBelt(Rz, Rw) {
  const g = PX.beltBg; g.clear(); g.rect(Rz.x, Rz.y, Rz.w, Rz.h).fill(0x2f1f1a); g.rect(Rz.x, Rz.y, Rz.w, 3).fill(0x1c1210);
  const ch = PX.hw ? PX.hw * 1.4 : 100, bh = Math.max(40, Math.min(Rw.h - 14, ch * .62)), by = Rw.y + Rw.h - bh - 6;
  PX.belt.visible = true; PX.belt.x = Rw.x; PX.belt.y = by; PX.belt.width = Rw.w; PX.belt.height = bh; const k = bh / 128; PX.belt.tileScale.set(k, k);
  PX.beltShade.clear(); PX.beltShade.rect(Rw.x, by - 4, Rw.w, 4).fill({ color: 0x000000, alpha: .35 }); PX.beltShade.rect(Rw.x, by + bh, Rw.w, 4).fill({ color: 0x000000, alpha: .3 });
}
// ---- plates (groups on a counter): up to 3 stacked painted plates
function pxPlateObj(key, s) {
  const c = new PIXI.Container(); const sh = new PIXI.Sprite(PX.tex.shadow); sh.anchor.set(.5); c.addChild(sh);
  const o = { key, kind: 'plate', seat: s, c, sh, sp: [], x: 0, y: 0, w: 40, tx: 0, ty: 0, d: 40, a: 1, s: 1, sq: 0, rot: 0, layers: 1, hideTop: 0 };
  PX.L.plate.addChild(c); PX.objs.set(key, o); return o;
}
function pxPlateTex(o) {
  const ak = o.type === 'wasabi' && o.on ? 'wasabi-nigiri' : o.type, t = PX.tex[ak] || PIXI.Texture.WHITE;
  while (o.sp.length < 3) { const sp = new PIXI.Sprite(t); sp.anchor.set(.5); o.c.addChild(sp); o.sp.push(sp); }
  o.sp.forEach(sp => { if (sp.texture !== t) sp.texture = t; });
}
// ---- hand cards
function pxCardObj(key) {
  const c = new PIXI.Container(); const sh = new PIXI.Sprite(PX.tex.cardShadow), gl = new PIXI.Sprite(PX.tex.cardGlow), sp = new PIXI.Sprite(PIXI.Texture.EMPTY);
  sh.anchor.set(.5); gl.anchor.set(.5); sp.anchor.set(.5); gl.alpha = 0; c.addChild(sh, gl, sp);
  const o = { key, kind: 'card', c, sh, gl, sp, x: 0, y: 0, w: 60, tx: 0, ty: 0, tw: 60, a: 1, s: 1, sq: 0, rot: 0, flip: 0, lift: 0 };
  PX.L.hand.addChild(c); PX.objs.set(key, o); return o;
}
function pxCardTex(o) {
  const w = Math.round(o.tw || PX.hw || 60); let t;
  if (o.back) t = pxBack(w); else t = pxFace(o.type, w);
  if (t) { o.face = t; o.sp.alpha = 1; } else if (!o.face) o.sp.alpha = 0;
  o.backT = pxBack(w);
}
function pxKill(o) { PX.objs.delete(o.key); for (const t of PX.tweens) if (t.o === o) t.dead = true; PX.tweens = PX.tweens.filter(t => !t.dead); try { o.c.destroy({ children: true }); } catch (e) { } PX.dirty = true; }
// ---- tweens
const EASE = { out: t => 1 - Math.pow(1 - t, 3), in: t => t * t * t, io: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, back: t => { const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); } };
function pxTween(o, to, ms, ease, done, extra) {
  const k = ANIM && !pxRM() ? Math.max(.5, AIDELAY > 0 ? Math.min(1.6, AIDELAY / 650) : .5) : 0;
  const tw = Object.assign({ o, to, from: {}, t0: performance.now() + ((extra && extra.delay) || 0), ms: Math.max(1, ms * (k || 0)), ease: EASE[ease] || EASE.out, done }, extra || {});
  for (const p in to) tw.from[p] = o[p];
  PX.tweens.push(tw); o.busy = (o.busy || 0) + 1; PX.dirty = true; return tw;
}
function pxStepTweens(now) {
  // callbacks may start new tweens or kill objects: step a snapshot, then drop the finished ones, then run their callbacks
  const done = [];
  for (const tw of PX.tweens.slice()) {
    if (tw.dead || now < tw.t0) continue;
    const u = Math.min(1, (now - tw.t0) / tw.ms), e = tw.ease(u), o = tw.o;
    for (const p in tw.to) o[p] = tw.from[p] + (tw.to[p] - tw.from[p]) * e;
    if (tw.arc) o.y -= Math.sin(u * Math.PI) * tw.arc;
    if (tw.spin) o.rot = tw.spin * Math.sin(u * Math.PI);
    if (tw.flipAt != null) o.flip = u < tw.flipAt ? 0 : 1;
    if (tw.step) tw.step(u);
    if (u >= 1) { tw.dead = true; done.push(tw); }
  }
  if (done.length) PX.tweens = PX.tweens.filter(t => !t.dead);
  for (const tw of done) { tw.o.busy = Math.max(0, (tw.o.busy || 0) - 1); if (tw.done) try { tw.done(); } catch (er) { console.error(er); } }
}
// ---- the moments ----
// a served plate flies from the belt to the diner's covered slot (face down halfway), then slips under the cover
function pxServe() {
  if (!PX.on || !ANIM) return false;
  const v = viewSeat(), so = PX.seats.get(v); if (!so || !so.slot) return false;
  const sels = [...document.querySelectorAll('#belt .hc.sel')]; if (!sels.length) return false;
  sels.forEach((el, n) => {
    const o = PX.objs.get('h:' + el.dataset.id); if (!o) return; PX.nServe = (PX.nServe || 0) + 1;
    o.detached = true; o.c.parent && o.c.parent.removeChild(o.c); PX.L.fly.addChild(o.c);
    const S = so.slot, tw = S.w * (n ? .9 : 1);
    pxTween(o, { x: S.x + S.w / 2 - tw / 2 + n * 6, y: S.y + n * 4, w: tw }, 520, 'io', () => { o.sq = .25; pxTween(o, { sq: 0, a: 0 }, 260, 'out', () => pxKill(o)); }, { arc: 46, spin: n ? -.25 : .25, flipAt: .5, delay: n * 70 });
  });
  return true;
}
// a plate lands from the reveal slot onto its group (new group, or one more plate on the stack)
function pxFlyPlate(o, from, fresh, gain) {
  const d0 = Math.min(from.w, from.h / 1.4) * .9;
  if (fresh) { o.x = from.x + from.w / 2 - d0 / 2; o.y = from.y + from.h / 2 - d0 / 2; o.w = d0; o.a = 1; }
  else o.hideTop = 1;
  const fly = fresh ? o : pxPlateObj('fly:' + o.key + ':' + performance.now(), o.seat);
  if (!fresh) { fly.type = o.type; fly.on = o.on; fly.layers = 1; pxPlateTex(fly); fly.x = from.x + from.w / 2 - d0 / 2; fly.y = from.y + from.h / 2 - d0 / 2; fly.w = d0; fly.d = d0; fly.detached = true; fly.c.parent.removeChild(fly.c); PX.L.fly.addChild(fly.c); }
  fly.flying = true;
  const land = () => {
    fly.flying = false; PX.nLand = (PX.nLand || 0) + 1;
    if (!fresh) { pxKill(fly); o.hideTop = 0; }
    o.sq = .3; pxTween(o, { sq: 0 }, 300, 'out');
    if (gain > 0) pxBurst(o.tx + o.d / 2, o.ty + o.d / 2, gain);
    if (typeof snd === 'function' && gain > 0) snd('coin', { vol: .35 });
  };
  const toX = () => o.tx, toY = () => o.ty;
  const tw = pxTween(fly, { x: toX(), y: toY(), w: o.d }, 560, 'io', land, { arc: 60, spin: .5, delay: 40 + o.seat * 40 });
  tw.step = () => { tw.to.x = o.tx; tw.to.y = o.ty; tw.to.w = o.d; };
}
// every hand slides one seat on: the belt carries the hand away to the left
function pxPassOut() {
  if (!PX.on || !ANIM) return Promise.resolve();
  const hs = [...PX.objs.values()].filter(o => o.kind === 'card' && !o.detached);
  if (!hs.length) return Promise.resolve();
  return new Promise(res => {
    let left = hs.length; const L0 = PX.beltR ? PX.beltR.x : 0;
    hs.sort((a, b) => a.x - b.x).forEach((o, i) => { o.detached = true; pxTween(o, { x: L0 - o.w * 1.6 - i * 8, rot: -.08 }, 520, 'in', () => { pxKill(o); if (!--left) res(); }, { delay: i * 25 }); });
    setTimeout(res, 1600);
  });
}
// packets of face-down cards travel from each seat to the next one around the table
function pxPackets(sizes) {
  if (!PX.on || !ANIM) return false;
  const np = G.np; let any = false;
  for (let s = 0; s < np; s++) {
    const a = PX.seats.get(s), b = PX.seats.get((s + 1) % np); if (!a || !b || !a.av || !b.av) continue;
    any = true; const w = 30;
    const o = { key: 'pk:' + s + ':' + performance.now(), kind: 'pkt', c: new PIXI.Container(), x: a.av.x + a.av.w / 2 - w / 2, y: a.av.y + a.av.h / 2 - w * .7, w, a: 0, s: 1, sq: 0, rot: 0 };
    const back = new PIXI.Sprite(pxBack(w)); back.anchor.set(.5); const back2 = new PIXI.Sprite(pxBack(w)); back2.anchor.set(.5); back2.x = 3; back2.y = -3; back2.rotation = .12;
    o.c.addChild(back, back2);
    if (sizes && sizes[s] != null) { const t = new PIXI.Text({ text: String(sizes[s]), style: { fontFamily: 'Nunito, Trebuchet MS, sans-serif', fontSize: 16, fontWeight: '900', fill: 0xffffff, stroke: { color: 0x2a1206, width: 4 } } }); t.anchor.set(.5); o.c.addChild(t); }
    o.sp = back; o.single = true; o.detached = true; PX.L.fly.addChild(o.c); PX.objs.set(o.key, o);
    pxTween(o, { a: 1 }, 120, 'out');
    pxTween(o, { x: b.av.x + b.av.w / 2 - w / 2, y: b.av.y + b.av.h / 2 - w * .7 }, 760, 'io', () => pxTween(o, { a: 0 }, 140, 'out', () => pxKill(o)), { arc: 40, spin: .6, delay: 100 });
  }
  return any;
}
// the covers lift: a few sparks and a puff over every slot
function pxReveal() {
  if (!PX.on || !ANIM) return;
  for (const [, so] of PX.seats) { const S = so.slot; if (!S) continue; const x = S.x + S.w / 2, y = S.y + S.h * .45;
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .5; pxPart('spark', x, y, { vx: Math.cos(a) * 60, vy: Math.sin(a) * 60, g: 60, life: .6, s0: .5, s1: .15, rot: 3, noFilter: true }); }
    pxPart('puff', x, y - S.h * .3, { vy: -30, life: 1, s0: S.w / 50, s1: S.w / 26, a0: .6 }); }
}
// +N and a ring of sparks / coins where a plate scored
function pxBurst(x, y, gain) {
  const q = PXQ[PX.q]; const n = q.parts ? Math.round(10 * q.parts) + 4 : 0;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + Math.random() * .4, sp = 50 + Math.random() * 60; pxPart(i % 3 ? 'spark' : 'coin', x, y, { vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, g: 120, life: .7 + Math.random() * .3, s0: .5 + Math.random() * .4, s1: .2, rot: (Math.random() - .5) * 6, noFilter: true }); }
  const t = new PIXI.Text({ text: '+' + gain, style: { fontFamily: 'Nunito, Trebuchet MS, sans-serif', fontSize: 22, fontWeight: '900', fill: 0xfff3b0, stroke: { color: 0x5b3221, width: 5 } } });
  t.anchor.set(.5); t.x = x; t.y = y; PX.L.fly.addChild(t);
  const o = { key: 'txt:' + performance.now() + Math.random(), kind: 'txt', c: t, x, y, a: 1, s: .6, detached: true, single: true }; PX.objs.set(o.key, o);
  pxTween(o, { s: 1.15 }, 180, 'back'); pxTween(o, { y: y - 42, a: 0 }, 900, 'in', () => pxKill(o), { delay: 250 });
}
function pxPart(kind, x, y, o) {
  if (!PXQ[PX.q].parts || PX.parts.length > 140) return;
  const sp = new PIXI.Sprite(PX.tex[kind]); sp.anchor.set(.5); sp.x = x; sp.y = y;
  (o.noFilter ? PX.L.fly : PX.L.fx).addChild(sp);
  PX.parts.push(Object.assign({ sp, t: 0, vx: 0, vy: 0, g: 0, life: 1, s0: 1, s1: 1, a0: 1, rot: 0 }, o)); PX.dirty = true;
}
function pxStepParts(dt) {
  const keep = [];
  for (const p of PX.parts) {
    p.t += dt; const u = p.t / p.life; if (u >= 1) { p.sp.destroy(); continue; }
    p.vy += p.g * dt; p.sp.x += p.vx * dt; p.sp.y += p.vy * dt; p.sp.rotation += p.rot * dt;
    const s = p.s0 + (p.s1 - p.s0) * u; p.sp.scale.set(s * (p.sx || 1), s); p.sp.alpha = p.a0 * (u < .15 ? u / .15 : 1 - (u - .15) / .85);
    keep.push(p);
  }
  PX.parts = keep;
}
// ambient life: steam over buns, flames on waiting Fire Paste, a glint on paste + nigiri
function pxAmbient(dt) {
  const q = PXQ[PX.q]; if (!q.fx || pxRM()) return;
  PX.amb = (PX.amb || 0) + dt; if (PX.amb < .12) return; const step = PX.amb; PX.amb = 0;
  for (const [, o] of PX.objs) {
    if (o.detached || o.flying || !o.vis) continue;
    const isPlate = o.kind === 'plate', d = isPlate ? o.d : o.w, cx = o.x + d / 2, cy = isPlate ? o.y + d / 2 : o.y + o.w * .55;
    const type = o.type; if (!type) continue;
    if (type === 'dumpling' && Math.random() < step * 2.2 * q.fx) pxPart('puff', cx + (Math.random() - .5) * d * .4, cy - d * .25, { vx: (Math.random() - .5) * 8, vy: -26 - Math.random() * 14, life: 1.4, s0: d / 160, s1: d / 70, a0: .55 });
    if (type === 'wasabi' && !o.on && (o.pulse || !isPlate) && Math.random() < step * 3 * q.fx) pxPart('flame', cx + (Math.random() - .5) * d * .45, cy - d * .12, { vx: (Math.random() - .5) * 10, vy: -34 - Math.random() * 20, life: .55, s0: d / 90, s1: d / 260, a0: .9, noFilter: true });
    if (type === 'wasabi' && o.on && Math.random() < step * 1.2 * q.fx) pxPart('spark', cx + (Math.random() - .5) * d * .6, cy + (Math.random() - .5) * d * .6, { life: .7, s0: .1, s1: d / 110, a0: 1, rot: 2, noFilter: true });
  }
}
// ---- the frame ----
function pxLoop() {
  const PH = window.PerfHUD && PerfHUD.live ? PerfHUD : null;
  const tick = ts => { PX.raf = (PH ? PH.raf : requestAnimationFrame)(tick); try { pxFrame(ts); } catch (e) { console.error(e); } };
  PX.raf = (PH ? PH.raf : requestAnimationFrame)(tick);
}
function pxMoving() { return PX.tweens.length > 0 || [...PX.objs.values()].some(o => !o.detached && (Math.abs(o.x - o.tx) > .5 || Math.abs(o.y - o.ty) > .5 || Math.abs(o.w - (o.kind === 'plate' ? o.d : o.tw)) > .5)); }
function pxFrame(ts) {
  if (!PX.on) return;
  const now = performance.now(), dt = Math.min(.05, Math.max(0, (now - (PX.last || now)) / 1000)); PX.last = now; PX.t += dt;
  const q = PXQ[PX.q], snap = !ANIM || pxRM();
  pxStepTweens(now); pxStepParts(dt); pxAmbient(dt);
  let moving = PX.tweens.length > 0 || PX.parts.length > 0;
  // belt scroll (right to left, like the hands); still on Low and with reduced motion
  if (PX.belt && PX.belt.visible && q.belt && !snap) { PX.belt.tilePosition.x -= dt * 26; moving = true; }
  const kf = snap ? 1 : 1 - Math.exp(-dt * 13);
  for (const [, o] of PX.objs) {
    if (o.kind === 'card') {
      if (!o.detached && !(o.delay && now < o.delay)) { const tw = o.tw; o.x += (o.tx - o.x) * kf; o.y += (o.ty - o.y) * kf; o.w += (tw - o.w) * kf; if (o.flip && Math.abs(o.y - o.ty) < 6) o.flip = 0; if (o.rot && !o.busy) o.rot *= (1 - kf); }
      if (o.delay && now >= o.delay) o.delay = 0;
      if (Math.abs(o.x - o.tx) > .4 || Math.abs(o.y - o.ty) > .4) moving = moving || !o.detached;
      const lift = o.sel && !o.detached ? 1 : 0; o.lift += (lift - o.lift) * (snap ? 1 : 1 - Math.exp(-dt * 16));
      const w = o.w, h = w * 1.4, c = o.c;
      c.x = o.x + w / 2; c.y = o.y + h / 2; c.rotation = o.rot || 0; c.alpha = o.a;
      const sc = (o.s || 1) * (1 + o.lift * .05), sq = o.sq || 0;
      const tex = o.flip ? o.backT : o.face; if (tex && o.sp.texture !== tex) o.sp.texture = tex;
      o.sp.width = w * sc * (1 + sq * .35); o.sp.height = h * sc * (1 - sq * .3); o.sp.alpha = tex ? 1 : 0;
      o.sp.tint = o.locked && !o.detached ? 0xb9b1a6 : 0xffffff;
      o.sh.width = w * 1.25; o.sh.height = h * 1.18; o.sh.x = 3 + o.lift * 4; o.sh.y = 5 + o.lift * 10; o.sh.alpha = .55 + o.lift * .2;
      o.gl.width = w * 1.5; o.gl.height = h * 1.35; o.gl.alpha = o.lift * (q.fx ? .9 : .6) * (.8 + .2 * Math.sin(PX.t * 4));
      if (o.lift > .01 && o.lift < .99) moving = true;
    } else if (o.kind === 'plate') {
      if (!o.detached && !o.flying && !o.busy) { o.x += (o.tx - o.x) * kf; o.y += (o.ty - o.y) * kf; o.w += (o.d - o.w) * kf; if (Math.abs(o.x - o.tx) > .4 || Math.abs(o.y - o.ty) > .4) moving = true; }
      if (o.s != null && o.s < 1 && !o.busy && !o.detached) { o.s += (1 - o.s) * kf; o.a += (1 - o.a) * kf; moving = true; }
      const d = o.w, c = o.c, sq = o.sq || 0, pul = o.pulse && q.fx && !snap ? 1 + .05 * Math.sin(PX.t * 4.5) : 1;
      c.x = o.x + d / 2; c.y = o.y + d / 2; c.alpha = (o.dim ? .45 : 1) * (o.a == null ? 1 : o.a) * (o.vis === 0 && !o.flying ? 0 : 1); c.rotation = o.rot || 0;
      const sc = (o.s == null ? 1 : o.s) * pul;
      const nL = Math.max(1, o.layers - (o.hideTop ? 1 : 0));
      o.sp.forEach((sp, i) => { sp.visible = i < nL; sp.x = i * 6 * d / 44 - (nL - 1) * 3 * d / 44; sp.y = -i * 2 * d / 44; sp.width = d * 1.12 * sc * (1 + sq * .3); sp.height = d * 1.12 * sc * (1 - sq * .25); });
      o.sh.width = d * 1.4 * sc; o.sh.height = d * 1.3 * sc; o.sh.x = 3; o.sh.y = 5;
    } else if (o.single) { o.c.x = o.x + (o.w || 0) / 2; o.c.y = o.y + (o.w || 0) * .7; o.c.alpha = o.a; o.c.rotation = o.rot || 0; o.c.scale.set(o.s || 1); }
  }
  // the choosing diners breathe a soft gold glow (High / Medium)
  for (const [, so] of PX.seats) { const want = so.choose && q.fx ? .28 + .12 * Math.sin(PX.t * 3) : 0; so.glow.alpha += (want - so.glow.alpha) * kf; if (so.choose && q.fx) moving = true; }
  PX.moving = moving;
  if (moving || PX.dirty || PerfHUDtesting()) { PX.dirty = false; try { PX.app.renderer.render(PX.app.stage); PX.frames = (PX.frames || 0) + 1; } catch (e) { pxOff('render: ' + (e && e.message)); } }
}
const PerfHUDtesting = () => !!(window.PerfHUD && PerfHUD.testing);
// ---- PerfHUD: levels, pixel ratio cap, "something is moving" for the idle saver
function pxPerfReg() {
  try {
    if (!window.PerfHUD || !PerfHUD.register) return;
    const shim = PX.on ? { getPixelRatio: () => PX.res, setPixelRatio: v => pxSetRes(v), get domElement() { return PX.cv; }, getContext: () => PX.app && PX.app.renderer && PX.app.renderer.gl || null } : null;
    PerfHUD.register({ game: 'Kaiten Kitchen', anchor: '.gx-board', corner: 'tl', renderer: shim, levels: ['high', 'medium', 'low'],
      getLevel: () => PX.q, isAuto: () => gfxPref() === 'auto',
      setLevel: (l, why) => { if (why === 'apply') setGfx(l); else { PX.autoQ = l; pxApplyQ(); } try { if (GX.open === 'setd') GX.renderSettings(); } catch (e) { } },
      basePR: () => { const d = window.devicePixelRatio || 1; return Math.min((PXQ[PX.q] || PXQ.high).pr, d); }, onPixelRatio: v => pxSetRes(v),
      isAnimating: () => !!UI.busy || !!PX.tweens.length || !!PX.parts.length, idleMode: PX.on ? 'throttle' : 'demand', idleFps: 10 });
  } catch (e) { }
}
// share of painted (non-transparent) pixels in the canvas: the table is never blank
function pxPainted() { try { const c = PX.app.renderer.extract.canvas({ target: PX.app.stage, resolution: .25 }); const x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 20) n++; return +(n / (d.length / 4)).toFixed(3); } catch (e) { return -1; } }
// test hook: where every sprite is and whether anything still moves (px-test.js)
PX.state = () => ({ nServe: PX.nServe || 0, nLand: PX.nLand || 0, on: PX.on, kind: PX.kind, q: PX.q, res: PX.res, tweens: PX.tweens.length, parts: PX.parts.length, moving: pxMoving(), frames: PX.frames || 0, err: PX.err, blur: !!(PX.L.fx && PX.L.fx.filters && PX.L.fx.filters.length), canvasOK: pxPainted(),
  objs: [...PX.objs.values()].filter(o => !o.detached).map(o => ({ key: o.key, kind: o.kind, type: o.type || null, x: o.x, y: o.y, w: o.kind === 'plate' ? o.w : o.w, tx: o.tx, ty: o.ty, tw: o.kind === 'plate' ? o.d : o.tw, layers: o.layers || 0, shown: o.kind === 'plate' ? o.sp.filter(s => s.visible).length : 1, back: !!o.back, face: o.kind === 'card' ? (o.sp.texture === o.face && !!o.face) : null, alpha: o.c.alpha, vis: o.vis })) });
// ===================== part 8: shared GX kit (settings, reference, undo window, recap, results, offline) + the guided lesson =====================
const GAME_ID = 'kaiten';
// ---- achievements (stored by the shelf; shown in Stats & achievements on the home page)
const ACH = [
  { id: 'first', name: 'First meal', how: 'Finish a meal.', test: r => true },
  { id: 'guide', name: 'Belt trained', how: 'Finish the guided first game.', test: r => r.mode === 'guided' },
  { id: 'win', name: 'Clean plate', how: 'Beat the computer chefs.', test: r => r.won && (r.mode === 'vs' || r.mode === 'guided') },
  { id: 'hard', name: 'Night-shift champion', how: 'Win a 4- or 5-diner meal with a hard chef at the table.', test: (r, s, x) => r.won && r.mode === 'vs' && r.np >= 4 && x.extra && x.extra.hard },
  { id: 'fifty', name: 'Full belly', how: 'Score 50 points or more.', test: r => r.score >= 50 },
  { id: 'ladder', name: 'Bun tower', how: 'Stack five Steam Buns in one round (15 points).', test: (r, s, x) => x.extra && x.extra.buns15 },
  { id: 'paste', name: 'Fire breather', how: 'Score 10 or more Fire Paste bonus points in one meal.', test: (r, s, x) => x.extra && x.extra.paste >= 10 },
  { id: 'custard', name: 'Sweet tooth', how: 'End a meal with the most Custard Cups on your own (3 or more diners).', test: (r, s, x) => x.extra && x.extra.custardTop && r.np >= 3 },
  { id: 'rounds', name: 'Top of every round', how: 'Score the most points in all three rounds of a meal.', test: (r, s, x) => x.extra && x.extra.roundsTop === 3 },
  { id: 'hot', name: 'Pass the plate', how: 'Finish a hot-seat meal.', test: r => r.mode === 'hot' }
];
// ---- settings: the same sections as every game; Kaiten adds its own rows
const HOLD = { off: 0, short: 1200, long: 2600 };
function kitSettings() {
  GX.settings({
    id: 'setd', title: 'Menu',
    game: S => {
      if (NET.on) S.appendChild(GX.row('Online', [h('button.gx-sb', { 'data-a': 'netopen', type: 'button' }, 'Lobby'), h('button.gx-sb', { 'data-a': 'netleave', type: 'button' }, isHost() ? 'Close the room' : 'Leave the room')]));
      else S.appendChild(GX.row('This game', [h('button.gx-sb', { 'data-a': 'menu', type: 'button' }, 'New game'), h('button.gx-sb', { 'data-a': 'save', type: 'button' }, 'Save'), h('button.gx-sb', { 'data-a': 'loadsave', type: 'button', disabled: hasSave() ? null : true }, 'Load')]));
      if (!isClient()) S.appendChild(GX.row('Take back a plate', GX.seg([['off', 'Off'], ['short', 'Short'], ['long', 'Long']], UI.prefs.undo || 'short', v => { UI.prefs.undo = v; savePrefs(); }, 'Take-back window'), 'After you serve, a moment to press Undo before the covers lift'));
      S.appendChild(GX.row('Serving', GX.onoff(!!UI.prefs.tap2, v => { UI.prefs.tap2 = v; savePrefs(); if (G) render(); }, 'Tap twice to serve'), 'Tap a lifted plate again to serve it (otherwise press Serve)'));
    },
    sound: S => {
      S.appendChild(GX.row('Sound effects', GX.onoff(UI.prefs.sound !== false, v => { UI.prefs.sound = v; savePrefs(); try { if (window.GA) GA.setSfx(v); } catch (e) { } }, 'Sound effects')));
      S.appendChild(GX.row('Music', GX.onoff(UI.prefs.music !== false, v => { UI.prefs.music = v; savePrefs(); try { if (window.GA) GA.setMusic(v); } catch (e) { } sndMusic(); }, 'Music')));
    },
    help: S => {
      S.appendChild(GX.row('Read', [h('button.gx-sb', { 'data-a': 'rules', type: 'button' }, 'How to play'), h('button.gx-sb', { 'data-a': 'refopen', type: 'button' }, 'Plates')]));
      if (!NET.on) S.appendChild(GX.row('Guide', GX.seg([['full', 'Full'], ['light', 'Light'], ['off', 'Off']], UI.coach.level, v => { UI.coach.level = v; UI.coach.keep = v === 'full'; }, 'Guide level'), 'Tips that appear one at a time'));
      S.appendChild(GX.row('Show +N', GX.onoff(!!UI.prefs.hint, v => { UI.prefs.hint = v; savePrefs(); if (G) render(); }, 'Show +N scores'), 'What each plate on your belt scores right now'));
    },
    graphics: S => {
      const g = gfxPref();
      S.appendChild(GX.row('Graphics', GX.seg([['auto', 'Auto'], ['high', 'High'], ['medium', 'Medium'], ['low', 'Low']], g, v => { setGfx(v); }, 'Graphics level'), PX.on ? (g === 'auto' ? 'Now ' + PX.q : '') : 'Simple view (this browser has no painted table)'));
    },
    about: { name: 'Kaiten Kitchen', version: 'preview', text: 'An original conveyor-belt card game. Names, card text and paintings are our own. Music and sounds are CC0 recordings (Pro Sensory, LEGIT Audio and Kenney on OpenGameArt and kenney.nl). Online play uses Trystero (MIT); the painted table uses PixiJS (MIT).' }
  });
}
// ---- component reference
function refPic(it, big) { const p = it.pic; if (!p || !p.type) return null; return cardDiv(p.type, big ? 170 : 44, p.on); }
function refInGame(it) {
  if (!G || !it.pic || !it.pic.type || !/^p-/.test(it.id)) return true;
  const t = it.pic.type, has = id => tkey(id) === t, v = viewSeat();
  return G.players.some(p => p.table.some(e => has(e.id)) || p.pud.some(has)) || (v >= 0 && G.players[v].hand.some(has));
}
function kitReference() { GX.reference(KK.refSections(D), { title: 'Plates & scoring', label: 'Plates', picture: refPic, inGame: refInGame, before: '[data-gx="rulesd"]' }); }
// ---- undo: the rules let you change your mind until every diner has chosen. Kaiten resolves the turn the moment the last plate
// is served, so a local serve is held for a short take-back window (Menu → Take back a plate) before it is committed.
function holdMs() { const k = UI.prefs.undo || 'short'; return HOLD[k] ? Math.max(600, GX.aiDelay(HOLD[k])) : 0; }
function canHold(seat) { return !isClient() && holdMs() > 0 && !(UI.tut && UI.tut.on); }
function holdServe(seat, mv) {
  clearTimeout(UI.holdT); UI.hold = { seat, mv, sel: UI.sel.slice(), twin: UI.twin, round: G.round, turn: G.turn };
  UI.sel = []; UI.twin = false; UI.rec = null; snd('pick'); render();
  const tok = UI.seq; UI.holdT = setTimeout(() => { if (tok === UI.seq) commitHold(); }, holdMs());
}
function commitHold() {
  const H = UI.hold; clearTimeout(UI.holdT); UI.hold = null; if (!H || !G || G.round !== H.round || G.turn !== H.turn) { if (G) render(); return; }
  commit(H.seat, H.mv);
}
function undoHold() {
  const H = UI.hold; if (!H) return false; clearTimeout(UI.holdT); UI.hold = null;
  UI.sel = H.sel; UI.twin = H.twin; snd('click'); render(); toast('Plate back on your belt.'); return true;
}
function dropHold() { clearTimeout(UI.holdT); UI.hold = null; }
// ---- "since your last turn" strip in the dock
function kitRecap() { GX.recap.attach('#dockbody', { before: true, title: 'Since your pick' }); }
function recapSeats() { GX.recap.clear(); const hs = NET.on ? [NET.mySeat] : humans(); GX.recap.seats(hs.length ? hs : [0]); }
function recapReveal(evs) {
  try {
    const rv = evs.find(e => e.t === 'reveal'), sc = evs.find(e => e.t === 'score');
    if (rv) rv.picks.forEach(p => GX.recap.push(pname(p.seat) + (G.players[p.seat] && G.players[p.seat].name === 'You' ? ' took ' : ' took ') + p.cards.map(c => TY[c.key].name + (c.w >= 0 ? ' on Fire Paste' : '')).join(' and ') + '.', p.seat));
    if (sc) GX.recap.push('Round ' + sc.round + ' scored: ' + sc.seats.map(s => pname(s.seat) + ' +' + s.total).join(', ') + '.', -1);
  } catch (e) { }
}
// ---- results, statistics, achievements
function kitResult() {
  if (!G || G.phase !== 'over' || UI.resultDone) return; UI.resultDone = true;
  if (UI.mode === 'ai' || (!NET.on && !humans().length)) return; // watching the chefs: not your meal
  const hs = humans(), me = NET.on ? NET.mySeat : UI.mode === 'hot' ? -1 : (hs.length ? hs[0] : -1);
  const F = G.final, seats = G.players.map((p, i) => ({ name: p.name, ai: p.ai || null, me: i === me }));
  const winner = G.winners && G.winners.length > 1 ? G.winners.slice() : G.winner;
  let extra = null;
  if (me >= 0) {
    const mx = Math.max(...F.pudding);
    extra = { buns15: G.rs.some(r => r[me].dumpling >= 15), paste: G.rs.reduce((a, r) => a + (r[me].wasabi || 0), 0),
      custardTop: F.pudding[me] === mx && F.pudding.filter(x => x === mx).length === 1,
      roundsTop: G.rs.filter(r => r[me].total === Math.max(...r.map(x => x.total))).length, hard: G.players.some(p => p.ai === 'hard') };
  }
  const mode = UI.mode === 'net' ? 'online' : UI.mode;
  try {
    const r = GNS.result({ game: GAME_ID, mode, seats, winner, scores: F.totals.slice(), turns: G.round * 100 + G.turn, ms: UI.t0 ? Date.now() - UI.t0 : 0, level: UI.cfg && UI.cfg.level, extra });
    if (r && r.earned.length) { UI.earned = r.earned.map(a => a.name); GX.buzz([30, 60, 30]); }
  } catch (e) { }
  if (UI.mode === 'guided') lsSet('kk_guided_done', '1');
}
function earnedEl() { return UI.earned && UI.earned.length ? h('div.earned', h('b', 'New achievement' + (UI.earned.length > 1 ? 's' : '') + ': '), UI.earned.join(' · ')) : null; }
// ---- the guided first game: a scripted opening (fixed deal, one idea per step, a "why", one glowing plate), then free play
// Seat 1 (the partner chef) follows its own short script so the plates the lesson needs come back round.
const TUT_A = ['tempura', 'tempura', 'squid', 'dumpling', 'dumpling', 'roll1', 'egg', 'salmon', 'sashimi', 'roll2'];
const TUT_B = ['sashimi', 'sashimi', 'wasabi', 'roll3', 'pudding', 'pudding', 'chop', 'salmon', 'dumpling', 'egg'];
const TUT_PARTNER = ['sashimi', 'dumpling', 'salmon', 'roll2', 'pudding', 'sashimi'];
const TUT = [
  { take: 'tempura', title: 'Step 1 of 6 · Start a pair', why: 'Crispy Prawns score 5 for every pair, and a lone one scores nothing. There are two prawns on this belt: take one now, and with only two diners this hand comes back to you, so you can finish the pair later.' },
  { take: 'wasabi', title: 'Step 2 of 6 · The hands swapped', why: 'You are now holding the plates that were in front of {P}. Take the Fire Paste: the next nigiri you serve lands on it and scores triple.' },
  { take: 'squid', title: 'Step 3 of 6 · Use the paste', why: 'Your first belt is back. The Moon Nigiri is worth 3 points, but on your waiting Fire Paste it scores 9. Look for the +9 on the plate.' },
  { take: 'roll3', title: 'Step 4 of 6 · The roll race', why: 'At the end of the round, the most roll icons on a counter scores 6 and the second most 3. This roll has three icons, the most a single plate can have.' },
  { take: 'tempura', title: 'Step 5 of 6 · Finish the pair', why: 'The second Crispy Prawn came back round, as promised. Two prawns make a pair: +5 right away.' },
  { take: 'pudding', title: 'Step 6 of 6 · Think ahead', why: 'Custard Cups score nothing now, but they stay on your counter for all three rounds. At the end the most custard scores 6 (with more diners, the fewest also loses 6).' }
];
function tutDeal() {
  // rebuild the two first hands from the shuffled deck; every card stays where the invariants expect it (108 cards, no copies)
  const pool = G.deck.concat(G.players[0].hand, G.players[1].hand), take = t => { const i = pool.findIndex(id => tkey(id) === t); return pool.splice(i, 1)[0]; };
  const A = TUT_A.map(take), B = TUT_B.map(take);
  G.players[0].hand = A; G.players[1].hand = B; G.deck = pool;
  G.players.forEach(p => { p.mem = [{ turn: 1, hand: p.hand.slice().sort((a, b) => a - b) }]; });
  UI.tut = { on: true, step: -1 };
  Object.assign(UI.coach.seen, { welcome: 1, pick: 1, tempura: 1, wasabi: 1, squid: 1, roll3: 1, roll2: 1, roll1: 1, pudding: 1, pasteReady: 1 });
}
function tutStep() { return UI.tut && UI.tut.on && G && G.round === 1 && G.turn <= TUT.length ? TUT[G.turn - 1] : null; }
function tutTarget() { const s = tutStep(), v = viewSeat(); if (!s || v < 0) return -1; return G.players[v].hand.findIndex(id => tkey(id) === s.take); }
function tutPartner(seat) {
  if (!UI.tut || !UI.tut.on || seat !== 1 || G.round !== 1 || G.turn > TUT_PARTNER.length) return null;
  const t = TUT_PARTNER[G.turn - 1]; return KK.moves(G, seat).find(m => m.ids.length === 1 && tkey(m.ids[0]) === t) || null;
}
// called from coachCheck: the lesson card for this turn (once per turn), then the hand-over card after the last step
function tutCheck() {
  if (!UI.tut || !UI.tut.on) return false;
  const v = viewSeat(); if (v < 0 || !canPick() || UI.cards.length) return false;
  if (G.round > 1 || G.turn > TUT.length) {
    UI.tut.on = false; UI.coach.turn = G.round + '.' + G.turn;
    pushCard({ kind: 'coach', title: 'Your turn to choose', sub: 'Lesson done', body: h('div', h('p', 'From now on every plate is your choice. The green +N on a plate is what it scores you right now; Hint suggests a pick and says why.'), h('p.sm', 'New plates still get a short tip the first time you see them. Plates (top bar) lists every plate and how it scores.')), buttons: [{ label: 'Play on', a: 'cont', cls: 'go' }] });
    return true;
  }
  const turn = G.round + '.' + G.turn; if (UI.tut.seen === turn) return false; UI.tut.seen = turn; UI.coach.turn = turn;
  const s = tutStep(); if (!s) return false;
  const cw = isPh() ? 52 : 96, why = s.why.replace('{P}', pname(1));
  const body = h('div.cwrap', h('div.cardbox', cardDiv(s.take, cw)), h('div.cinfo', h('p', h('b', 'Take the ' + TY[s.take].name + '.')), h('p', h('i', 'Why: '), why)));
  const intro = G.turn === 1 ? h('p.sm.tutintro', 'You and ' + pname(1) + ' each pick one plate at the same time; then the covers lift and the hands swap. Highest score after three rounds wins.') : null;
  pushCard({ kind: 'coach', title: s.title, sub: 'Lesson', body: intro ? h('div', intro, body) : body, buttons: [{ label: 'Show me', a: 'cont', cls: 'go' }] });
  return true;
}
function tutGuard(i) {
  const s = tutStep(); if (!s) return true; const v = viewSeat(); const id = G.players[v].hand[i];
  if (id != null && tkey(id) === s.take) return true;
  snd('error'); toast('In this step, take the glowing ' + TY[s.take].name + '.'); return false;
}
// ---- boot (called from boot() in part 5)
function kitBoot() {
  kitSettings(); kitReference(); kitRecap();
  GNS.achievements(GAME_ID, ACH);
  const sync = () => { AIDELAY = GX.aiDelay(650); ANIM = GX.pref('anim') === 'off' || GX.reduced() ? 0 : 1; };
  sync();
  GX.onPref(k => { if (k === 'ai' || k === 'anim' || k === 'reduce' || typeof k === 'object') sync(); if (k === 'cb' && G && UI.started) render(); });
  GX.offline({ sw: '../sw.js', scope: '../' });
}
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-a]'); if (!t) return;
  const a = t.dataset.a;
  if (a === 'undo') undoHold();
  else if (a === 'refopen') { GX.close(); GX.show('gx-refd'); }
  else if (a === 'refbig') { const ty = t.dataset.type; closePop(); GX.refOpen('p-' + ty); }
});
document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !GX.open && UI.hold) { e.preventDefault(); undoHold(); } });

// ===================== part 1: globals, helpers, table model, scoring hints =====================
var ANIM = 1, AIDELAY = 650;
var G = null;
var UI = { started: false, mode: 'vs', cfg: null, holder: -1, sel: [], twin: false, pop: null, cards: [], fz: null, busy: false, seq: 0, rec: null, noRec: false, over: null,
  coach: { level: 'full', seen: {}, turn: '' }, prefs: { hint: true, tap2: true, sound: true, music: true }, enter: '', land: null, tm: null, pend: null, rq: [] };
const D = KK.DATA;
const KIT = KKKit;
const TY = KIT.TYPES;
const ORDER = KIT.ORDER;
const $ = s => /^#[\w-]+$/.test(s) ? document.getElementById(s.slice(1)) : document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const PN = KIT.PLAYERS.map(p => p.name);
const DEF = { np: 3, level: 'normal', lv: ['normal', 'normal', 'normal', 'normal'] };
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
const avN = (i, size) => artNode('a|' + i + '|' + size, () => KIT.avatarSVG(i % 5, { size }));
const backN = w => artNode('b|' + w, () => KIT.backSVG({ w }));
const plateS = (type, d, on) => cached('p|' + type + '|' + d + '|' + (on || ''), () => KIT.plateSVG(type, on ? { d, on } : { d }));
const avatarS = (i, size) => cached('a|' + i + '|' + size, () => KIT.avatarSVG(i % 5, { size }));
const iconS = (name, size, type) => cached('i|' + name + '|' + size + '|' + (type || ''), () => KIT.iconSVG(name, type ? { size, type } : { size }));
const counterURL = seat => cached('c|' + seat, () => 'url("' + KIT.dataURL(KIT.counterSVG({ w: 360, h: 120, seat, standalone: true }).replace('<svg ', '<svg preserveAspectRatio="none" ')) + '")');
function cardNode(type, w, on) { return KIT.cardEl(type, on ? { w, variant: 'nigiri', on } : { w }); }
function cardDiv(type, w, on) { const d = h('div.cd'); d.style.width = w + 'px'; d.style.height = Math.round(w * 1.4) + 'px'; d.appendChild(cardNode(type, w, on)); return d; }
// ---- game helpers
const humans = () => G ? G.players.map((p, i) => p.ai ? -1 : i).filter(i => i >= 0) : [];
const hotSeat = () => !!G && !NET.on && humans().length > 1;
const watching = () => !!G && humans().length === 0;
function viewSeat() { if (!G) return -1; if (NET.on) return NET.mySeat; if (hotSeat()) return UI.holder; const hs = humans(); return hs.length ? hs[0] : -1; }
const pname = s => G && G.players[s] ? G.players[s].name : '?';
const pcol = s => KIT.PLAYERS[s % 5];
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
  const p = G.players[v], pk = p.picked && p.pick ? p.pick : [];
  return p.hand.filter(id => pk.indexOf(id) < 0);
}
const mySeatPicked = () => { const v = viewSeat(); return v >= 0 && G && G.players[v].picked; };
function canPick() { const v = viewSeat(); return !!G && G.phase === 'pick' && v >= 0 && !G.players[v].picked && !UI.busy && !UI.cards.length && !UI.fz && !(NET.on && !NET.hostPeer && isClient()) && !(NET.on && NET.pend === G.round * 100 + G.turn && Date.now() - NET.pendT < 2500); }
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
function loadPrefs() { try { const p = JSON.parse(lsGet('kk_prefs') || '{}'); Object.assign(UI.prefs, p); if (p.speed) AIDELAY = p.speed; } catch (e) { } }
function savePrefs() { lsSet('kk_prefs', JSON.stringify(Object.assign({}, UI.prefs, { speed: AIDELAY }))); }
const wait = ms => ANIM ? new Promise(r => setTimeout(r, ms * (AIDELAY > 0 ? Math.max(.35, AIDELAY / 650) : .35))) : Promise.resolve();
// ===================== part 2: rendering (table, belt, dock) =====================
const isPh = () => document.documentElement.classList.contains('ph');
function focusSeat() { const v = viewSeat(); if (v >= 0) UI.focus = v; return UI.focus || 0; }
function render() {
  if (!G || !UI.started) return;
  renderBar(); renderTable(); renderBelt(); renderDock();
  try { renderDrawers(); } catch (e) { }
  try { netRenderHook(); } catch (e) { }
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
    const ctrW = cw - shw - sl - 22;
    let pd = Math.min(rowH - (isMe ? 34 : 32), ctrW / (isMe ? 7.2 : 5.6) - 6, isMe ? 84 : 68); pd = Math.max(24, Math.round(pd));
    const dm = { av, shw, sl, pd, cmp };
    const sg = seatSig(s, tab, info, pcs, isMe, dm) + '|' + sigAll;
    const old = oldSeats[s];
    if (old && old.dataset.sg === sg) { els.push(old); continue; }
    const e = seatEl(s, tab, info, pcs, isMe, dm); e.dataset.rk = s; e.dataset.sg = sg; els.push(e);
  }
  let same = tbl.children.length === els.length; if (same) for (let i = 0; i < els.length; i++) if (tbl.children[i] !== els[i]) { same = false; break; }
  if (!same) tbl.replaceChildren(...els);
  UI.land = null;
  if (!tbl.__ap) { tbl.__ap = 1; try { KIT.applyTable($('#bd'), 'day'); } catch (e) { } }
}
function seatSig(s, tab, info, pcs, isMe, dm) {
  const p = G.players[s], fz = UI.fz && UI.fz.slots, sl = fz ? JSON.stringify(fz[s]) : (G.phase === 'pick' ? (p.picked ? 'p' : 'w') : 'x');
  const lnd = UI.land ? [...UI.land].filter(x => x.startsWith(s + '|')).join(',') : '';
  return [s, isMe ? 1 : 0, totalOf(s, info), info.rs.map(r => r.icons).join('/'), tab[s].map(e => e.id + ':' + e.w).join(','), pcs[s], sl, lnd, dm.av, dm.shw, dm.sl, dm.pd, dm.cmp ? 1 : 0, p.name, p.ai || '', G.phase === 'pick' && !p.picked && !UI.fz ? 'c' : '', s === viewSeat() ? 'v' : '', G.phase].join('|');
}
function seatEl(s, tab, info, pcs, isMe, dm) {
  const p = G.players[s], col = pcol(s), picking = G.phase === 'pick' && !p.picked && !UI.fz;
  const gs = groupsOf(s, tab, info), total = totalOf(s, info);
  const el = h('section.seat' + (isMe ? '.me' : '') + (picking ? '.choose' : ''), { 'data-seat': s, 'aria-label': p.name + (p.ai ? ', computer' : '') + ', ' + total + ' points' });
  el.style.setProperty('--pd', dm.pd + 'px'); el.style.setProperty('--shw', dm.shw + 'px'); el.style.setProperty('--av', dm.av + 'px'); el.style.setProperty('--sl', dm.sl + 'px'); el.style.setProperty('--ctr', counterURL(s));
  const av = h('div.av' + (picking ? '.act' : '')); av.appendChild(avN(s, 96));
  av.appendChild(h('span.sc', String(total)));
  const sh = h('button.sh', { type: 'button', 'data-a': 'seat', 'data-seat': s, 'aria-label': p.name + (p.ai ? ' (computer ' + p.ai + ')' : '') + ': ' + total + ' points. Open details.' }, av, h('span.nm', p.name));
  el.appendChild(sh);
  const ctr = h('div.ctr');
  const land = UI.land || new Set();
  for (const g of gs.list) ctr.appendChild(grpEl(g, dm.pd, land.has(s + '|' + g.k)));
  ctr.appendChild(shelfEl(s, pcs[s], dm.pd, land.has(s + '|pud')));
  if (!gs.list.length && !pcs[s]) ctr.insertBefore(h('span.none', G.phase === 'pick' ? 'Nothing served yet' : ''), ctr.firstChild);
  el.appendChild(ctr);
  el.appendChild(slotEl(s, dm.sl, dm.cmp));
  return el;
}
function grpEl(g, pd, landing) {
  const layers = Math.min(g.n, 3);
  const b = h('button.grp.' + g.cls + (g.pulse ? '.waitf' : '') + (landing ? '.land' : ''), { type: 'button', 'data-a': 'grp', 'data-seat': g.seat, 'data-k': g.k, 'aria-label': g.tip, title: g.tip });
  const pl = h('div.pl'); pl.style.width = (pd + 6 * (layers - 1)) + 'px';
  for (let i = 0; i < layers; i++) pl.appendChild(plateN(g.type, pd, g.on));
  b.appendChild(pl);
  if (g.n > 1 || g.k === 'roll') b.appendChild(h('span.bg', (g.k === 'roll' ? '' : '×') + g.n));
  b.appendChild(h('span.hn', g.hint));
  return b;
}
function shelfEl(s, n, pd, landing) {
  const tip = n + ' Custard Cup' + (n === 1 ? '' : 's') + ' kept for the end of the game (most scores 6, fewest loses 6; no penalty with 2 players).';
  const b = h('button.grp.shelf' + (landing ? '.land' : ''), { type: 'button', 'data-a': 'grp', 'data-seat': s, 'data-k': 'pud', 'aria-label': tip, title: tip });
  const pl = h('div.pl'); pl.appendChild(plateN('pudding', pd)); if (!n) pl.style.opacity = '.45';
  b.appendChild(pl); b.appendChild(h('span.bg', String(n))); b.appendChild(h('span.hn', 'custard'));
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
  else if (G.phase === 'pick' && p.picked) { cover(); if (!cmp) wrap.appendChild(h('span.st.rd', 'ready')); }
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
  const land = ph && boardSize().w >= boardSize().h; const hw = Math.max(ph ? (land || innerHeight < 700 ? 54 : 60) : 62, Math.min(ph ? 74 : 104, Math.floor((avail - (m - 1) * 6) / m)));
  $('#bd').style.setProperty('--hw', hw + 'px');
  if (!belt.__bt) { belt.__bt = 1; try { const bt = KIT.beltEl({ h: 72, period: 96, seconds: 6 }); bt.style.height = '60px'; $('#beltw').insertBefore(bt, belt); bt.style.bottom = '8px'; } catch (e) { } }
  const frag = [], oldC = new Map(); for (const c of belt.children) if (c.dataset && c.dataset.rk) oldC.set(c.dataset.rk, c);
  const hp = v >= 0 ? G.players[v] : null, can = canPick();
  const rec = UI.rec && !UI.noRec ? UI.rec.ids : [];
  const enter = UI.enter;
  hand.forEach((id, k) => {
    if (id < 0) { const key = 'b' + k, sg = 'b' + hw; const o = oldC.get(key); if (o && o.dataset.sg === sg && !enter) { frag.push(o); return; } const b = h('div.hc.back', { 'data-up': '0', 'aria-hidden': 'true' }); b.style.setProperty('--k', k); b.appendChild(backN(hw)); if (enter) b.classList.add('ent-' + enter); b.dataset.rk = key; b.dataset.sg = sg; frag.push(b); return; }
    const idx = hp && !UI.fz ? hp.hand.indexOf(id) : -1;
    const ty = tkey(id), selPos = UI.sel.indexOf(idx);
    const g = UI.prefs.hint && can ? gainOf(v, [id]) : null;
    const key = 'c' + id, sg = [id, idx, selPos, rec.indexOf(id) >= 0 ? 1 : 0, can ? 1 : 0, g, UI.twin ? 1 : 0, hw, UI.prefs.tap2 ? 1 : 0].join('|');
    const o = oldC.get(key); if (o && o.dataset.sg === sg && !enter) { frag.push(o); return; }
    const b = h('button.hc' + (selPos >= 0 ? '.sel' : '') + (rec.indexOf(id) >= 0 ? '.rec' : '') + (can ? '' : '.locked'), { type: 'button', 'data-a': 'hcard', 'data-i': idx, 'data-id': id, 'data-owner': v, 'data-up': '1', 'aria-pressed': selPos >= 0 ? 'true' : 'false', 'aria-label': TY[ty].name + '. ' + TY[ty].ruleText + (can ? '. Tap to lift it' + (selPos >= 0 ? ', tap again to serve' : '') : '') });
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
  if (v >= 0 && G.players[v].picked) return pend.length ? 'Served. Waiting for ' + (isPh() && pend.length > 2 ? pend.length + ' diners' : nameList(pend)) + '…' : 'Served. Here come the plates…';
  if (v >= 0) {
    const nm = hotSeat() ? pname(v) + ', ' : '';
    if (UI.twin) return nm + 'Twin Sticks: pick two plates, then serve them.';
    if (UI.sel.length) return nm + (UI.prefs.tap2 ? 'Tap it again, or press Serve.' : 'Press Serve to send it to your seat.');
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
        (() => { const e = h('span.cav'); e.appendChild(avN(s, 96)); return e; })(), h('span.ct', h('b', p.name + (s === v && p.name !== 'You' ? ' (you)' : '')), h('i', (rdy ? '✓ ' : G.phase === 'pick' && !busyFz ? '… ' : '') + (ph ? tot : tot + ' pts' + (rdy ? ' · ready' : G.phase === 'pick' && !busyFz ? ' · choosing' : '')))));
      ro.appendChild(ch);
    }
    }
  }
  renderSel(); renderActs(); renderCheat();
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
  else if (v >= 0 && G.players[v].picked) t = 'Your plate is on its way to your seat under a cover. Everyone reveals together.';
  else if (v >= 0 && canPick()) t = UI.twin ? 'Tap two plates on the belt, then press Serve.' : 'Tap a plate on your belt to lift it' + (UI.prefs.tap2 ? ', then tap it again to serve it.' : ', then press Serve.');
  else t = 'Revealing the plates…';
  el.appendChild(h('div.si', h('span', t)));
}
function renderActs() {
  const a = $('#acts'); if (!a) return; a.innerHTML = '';
  const v = viewSeat();
  if (!G || G.phase === 'over') return;
  if (v >= 0 && canPick()) {
    const p = G.players[v], chop = KK._.hasChop(p) && p.hand.length >= 2;
    const n = UI.sel.length;
    if (n) { const ids = UI.sel.map(i => p.hand[i]); const g = gainOf(v, ids); a.appendChild(h('button.btn.go', { 'data-a': 'serve', type: 'button' }, n === 2 ? 'Serve both' + (g > 0 ? ' (+' + g + ')' : '') : 'Serve' + (g > 0 ? ' (+' + g + ')' : ''))); }
    if (chop) a.appendChild(h('button.btn' + (UI.twin ? '.on' : '.alt'), { 'data-a': 'twin', type: 'button', 'aria-pressed': UI.twin ? 'true' : 'false' }, UI.twin ? 'Twin Sticks: on' : 'Use Twin Sticks'));
    a.appendChild(h('button.btn.alt', { 'data-a': 'hint', type: 'button' }, 'Hint'));
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
  const body = h('div.ph-body', h('div.cwrap', h('div.cardbox', cardDiv(type, cw, g && g.on)), h('div.cinfo', h('p', tip), h('p.sm', TY[type].ruleText))));
  if (g && g.k === 'roll') { const mk = info.mk; body.appendChild(h('div.kv', h('span', 'Icons per diner'), h('b', G.players.map((q, i) => q.name + ' ' + info.rs[i].icons).join(' · ')))); }
  pp.append(h('div.ph-head', h('div.ph-t', h('b', title), h('span', p.name)), h('button.px', { 'data-a': 'popx', type: 'button', 'aria-label': 'Close' }, '×')), body);
}
function closePop() { UI.pop = null; const pp = $('#ppop'); if (pp) { pp.hidden = true; pp.innerHTML = ''; } }
// ===================== part 3: game flow (new game, picking, AI, reveal / pass / round sequence, hot-seat, save) =====================
function lvAt(opt, k) { const a = opt.lv || DEF.lv; return a[Math.max(0, Math.min(3, k - 1))] || opt.level || 'normal'; }
function newGame(mode, o) {
  o = o || {};
  const opt = Object.assign({}, DEF, UI.opt || {}, o);
  let np = Math.max(2, Math.min(5, opt.np | 0 || 3)), names = [], ai = [];
  if (mode === 'guided') np = 2;
  if (mode === 'net') { np = opt.np; names = opt.players.map(p => p.name); ai = opt.players.map(p => p.ai || null); }
  else for (let i = 0; i < np; i++) {
    if (mode === 'hot') { names.push(PN[i]); ai.push(null); }
    else if (mode === 'ai') { names.push(PN[i]); ai.push(lvAt(opt, i + 1)); }
    else if (i === 0) { names.push('You'); ai.push(null); }
    else { names.push(PN[i]); ai.push(mode === 'guided' ? 'normal' : lvAt(opt, i)); }
  }
  clearTimeout(UI.tm); UI.seq++; UI.rq = [];
  const seed = UI.seed != null ? UI.seed : (Date.now() ^ (Math.random() * 1e9)) | 0;
  G = KK.newGame({ players: np, seed, names, ai });
  Object.assign(UI, { started: true, mode, cfg: { np, level: opt.level, lv: (opt.lv || DEF.lv).slice() }, holder: -1, sel: [], twin: false, pop: null, cards: [], fz: null, busy: false, rec: null, over: null, enter: 'deal', land: null, focus: 0, overShown: false, evN: G.evN });
  UI.coach = { level: mode === 'guided' ? 'full' : (UI.coach.level === 'full' && UI.coach.keep ? 'full' : 'off'), seen: {}, turn: '', keep: UI.coach.keep };
  if (mode === 'guided') UI.coach.level = 'full';
  const st = $('#start'); if (st) st.hidden = true; const rs = $('#rs'); if (rs) { rs.hidden = true; rs.innerHTML = ''; }
  try { GX.close(); } catch (e) { } closePop(); const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; }
  placePrompt(); render(); sndMusic(); schedule();
}
// ---------- the turn driver ----------
function schedule() {
  clearTimeout(UI.tm);
  if (!G || !UI.started) return;
  if (G.phase === 'over') return;
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
  let mv; try { mv = KK.AI.choose(G, seat); } catch (e) { console.error(e); mv = KK.moves(G, seat)[0]; }
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
  try { if (ANIM && document.body.animate) flyPick(); } catch (e) { }
  if (isClient()) { netAct({ pk: mv.pick.join(',') }); UI.sel = []; UI.twin = false; UI.rec = null; snd('pick'); render(); return; }
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
  const v = viewSeat(); if (!canPick()) return;
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
const keyOfCard = c => { const k = c.key; return ICONS[k] ? 'roll' : NIG[k] ? (c.w >= 0 ? 'pn-' : 'n-') + k : k; };
function drainQ() { if (UI.rq.length && !UI.busy) { const q = UI.rq.shift(); playResolve(q[0], q[1]); } }
async function playResolve(evs, preHand) {
  if (UI.busy) { UI.rq.push([evs, preHand]); return; }
  const tok = UI.seq; UI.busy = true; closePop();
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
    if (ANIM) { snd('cloche'); const hosts = $$('#tbl .hostc'); try { await KIT.revealAll(hosts, { stagger: 110 }); } catch (e) { } await wait(850); } if (tok !== UI.seq) return;
    // 3: plates land on the counters
    const land = new Set(); rv.picks.forEach(p => p.cards.forEach(c => land.add(p.seat + '|' + keyOfCard(c)))); UI.land = land;
    UI.fz.slots = null; UI.fz.tables = T; UI.fz.say = ps ? 'The plates land. Hands slide to the left…' : 'The plates land. The round is over!';
    if (sc) { UI.fz.roundEnd = true; UI.fz.hand = []; UI.fz.backN = 0; }
    render(); snd('clink'); await wait(750); if (tok !== UI.seq) return;
    if (ps) {
      // 4: every hand moves one seat to the left
      if (ANIM) { try { await slideOutBelt(); animatePass(ps.sizes); } catch (e) { } snd('pass'); }
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
function hasSave() { return !!lsGet('kk_save'); }
function save() {
  if (NET.on || !G || !UI.started) return false;
  try { lsSet('kk_save', JSON.stringify({ G, mode: UI.mode, cfg: UI.cfg, holder: -1, coach: UI.coach })); return true; } catch (e) { return false; }
}
function loadSave() {
  if (NET.on) return false;
  let o; try { o = JSON.parse(lsGet('kk_save')); } catch (e) { return false; }
  if (!o || !o.G || !Array.isArray(o.G.players) || o.G.v !== 1) return false;
  clearTimeout(UI.tm); UI.seq++;
  G = o.G; try { if (KK.checkInvariants(G).length) { G = null; return false; } } catch (e) { return false; }
  Object.assign(UI, { started: true, mode: o.mode || 'vs', cfg: o.cfg || null, holder: -1, sel: [], twin: false, pop: null, cards: [], fz: null, busy: false, rec: null, enter: 'deal', focus: 0, evN: G.evN, over: null });
  if (o.coach) UI.coach = o.coach;
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
  const lv = UI.coach.level; if (lv === 'off' || !G || G.phase !== 'pick') return false;
  const v = viewSeat(); if (v < 0 || !canPick() || UI.cards.length) return false;
  const turn = G.round + '.' + G.turn; if (UI.coach.turn === turn) return false;
  const seen = UI.coach.seen, p = G.players[v];
  if (!seen.welcome) { coachTip('welcome', 'Welcome to the belt', 'You are a diner at a conveyor-belt sushi bar. Over three rounds you collect plates for points. The highest score at the end wins.'); return true; }
  if (!seen.pick) { coachTip('pick', 'Everyone picks at once', 'Pick one plate from your belt and serve it: tap to lift it, tap again to serve. When everyone has chosen, all plates are revealed together, then every hand slides to the player on your left.'); return true; }
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
  { k: 'maki', l: 'Seaweed rolls', ic: ['most', 'roll1'], sub: s => s.icons + ' icon' + (s.icons === 1 ? '' : 's') },
  { k: 'tempura', l: 'Crispy Prawns', ic: ['pair', 'tempura'], sub: null },
  { k: 'sashimi', l: 'Fish Slices', ic: ['set', 'sashimi'], sub: null },
  { k: 'dumpling', l: 'Steam Buns', ic: ['ladder', 'dumpling'], sub: null },
  { k: 'nigiri', l: 'Nigiri', ic: ['v2', 'salmon'], sub: null },
  { k: 'wasabi', l: 'Fire Paste bonus', ic: ['x3', 'wasabi'], sub: null }];
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
    const tr = h('tr'); tr.appendChild(h('td', h('div.lc', { html: iconS(r.ic[0], 26, r.ic[1]) }, r.l)));
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
  const box = h('div.rsbox', { role: 'dialog', 'aria-label': 'Final result' });
  const ws = G.winners || [];
  const me = viewSeat(), iWin = me >= 0 && ws.includes(me);
  box.appendChild(h('h2', h('span', { html: KIT.iconSVG('crown', { size: 32 }) }), 'The meal is over'));
  const wn = h('div.win', h('span', { html: avatarS(ws[0] != null ? ws[0] : 0, 96) }), h('div', G.winText));
  box.appendChild(wn);
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
  if (iWin || !NET.on) { snd('win', { duck: true }); celebrate(box); } else snd('round', { duck: true });
  UI.overShown = true;
  if (UI.mode !== 'net') lsSet('kk_save', '');
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
    'All diners secretly pick one plate from their hand at the same time. On your phone or computer: tap a plate to lift it, tap it again (or press Serve) to confirm.',
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
    'Hot-seat: the hands are hidden between diners, with a "pass the device" screen. Online: friends see only their own hand.'].map(t => h('li', t))));
  root.appendChild(h('div', { html: '<section class="credits-audio"><h3>Credits</h3><p>Music: &ldquo;Jazz Slower&rdquo; by Pro Sensory (OpenGameArt, CC0). Ambience: &ldquo;The Shop collection: convenience store drinks fridge drone 2&rdquo; by LEGIT Audio (OpenGameArt, CC0). Sound effects: Casino Audio, Impact Sounds, Interface Sounds, Music Jingles, RPG Audio and UI Audio by Kenney (kenney.nl, CC0). All sounds were trimmed, loudness-normalised and converted for this game.</p><p>Online play uses Trystero (MIT). Names, card text and art are original.</p></section>' }));
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
  if (GX.open === 'setd') renderMenu();
}
function renderMenu() {
  const b = $('#setbody'); b.innerHTML = '';
  const row = (l, ...k) => b.appendChild(h('div.mrow', h('div.lbl', l), h('div.mbt', k)));
  const tog = (name, on, label) => h('button.btn' + (on ? '' : '.alt'), { 'data-a': name, type: 'button', 'aria-pressed': on ? 'true' : 'false' }, label + ': ' + (on ? 'On' : 'Off'));
  if (NET.on) row('Online', h('button.btn', { 'data-a': 'netopen', type: 'button' }, 'Lobby'), h('button.btn.alt', { 'data-a': 'netleave', type: 'button' }, isHost() ? 'Close the room' : 'Leave the room'));
  else row('Game', h('button.btn', { 'data-a': 'menu', type: 'button' }, 'New game'), h('button.btn.alt', { 'data-a': 'save', type: 'button' }, 'Save'), h('button.btn.alt' + (hasSave() ? '' : '.dis'), { 'data-a': 'loadsave', type: 'button', disabled: hasSave() ? null : true }, 'Load'));
  if (!NET.on) row('Computer speed', ...[['Fast', 150], ['Normal', 650], ['Slow', 1300]].map(([n, v]) => h('button.btn' + (AIDELAY === v ? '' : '.alt'), { 'data-a': 'speed', 'data-v': v, type: 'button' }, n)));
  if (!NET.on) row('Guide', ...['full', 'light', 'off'].map(n => h('button.btn' + (UI.coach.level === n ? '' : '.alt'), { 'data-a': 'guide', 'data-v': n, type: 'button' }, n[0].toUpperCase() + n.slice(1))));
  row('Help on the belt', tog('hints', UI.prefs.hint, 'Show +N scores'), tog('tap2', UI.prefs.tap2, 'Tap twice to serve'));
  row('Sound', tog('sound', UI.prefs.sound, 'Sound effects'), tog('music', UI.prefs.music, 'Music'));
  let sp = ''; try { sp = window.PerfHUD && PerfHUD.buttonsHTML ? PerfHUD.buttonsHTML('btn alt') : ''; } catch (e) { }
  row('Info', h('button.btn.alt', { 'data-a': 'rules', type: 'button' }, 'How to play'), h('span.tinyc', { html: sp }));
  b.appendChild(h('p.sm', 'Kaiten Kitchen is an original conveyor-belt card game. Names, card text and art are original; the audio credits are in How to play.'));
}
// ---------- start screen ----------
function renderStart() {
  const s = $('#start'); s.hidden = false; s.innerHTML = '';
  const rs = $('#rs'); if (rs && !UI.rsOpen) { rs.hidden = true; }
  if (NET.on) { netStartScreen(s); return; }
  const o = UI.opt = UI.opt || Object.assign({}, DEF, { lv: DEF.lv.slice() });
  const seg = (l, key, vals, fmt) => h('div.seg', h('span.lbl', l), vals.map(v => h('button.chipb' + (o[key] === v ? '.on' : ''), { 'data-a': 'opt', 'data-k': key, 'data-v': v, type: 'button' }, fmt ? fmt(v) : v)));
  const lvRows = []; for (let k = 1; k < o.np; k++) lvRows.push(h('div.seg', h('span.lbl', h('span', { html: avatarS(k, 40) }), PN[k]), ['easy', 'normal', 'hard'].map(v => h('button.chipb' + ((o.lv[k - 1] || 'normal') === v ? '.on' : ''), { 'data-a': 'lv', 'data-seat': k, 'data-v': v, type: 'button' }, v))));
  const card = h('div.scard',
    h('h1', h('span', { html: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="#fbf0da" stroke="#4a2a22" stroke-width="1.6"/><circle cx="12" cy="12" r="7" fill="#e5553a" stroke="#4a2a22" stroke-width="1.2"/><circle cx="12" cy="12" r="3.2" fill="#fbf0da" stroke="#4a2a22" stroke-width="1"/></svg>' }), 'Kaiten Kitchen'),
    h('div.chefs', [0, 1, 2, 3, 4].map(i => h('span', { html: avatarS(i, 96) }))),
    h('p.tag', 'A conveyor-belt sushi card game for 2 to 5. Everyone picks a plate at the same time, then the hands slide to the left. Build the best meal over three rounds.'),
    h('button.sbtn.big', { 'data-start': 'guided', 'data-a': 'guided', type: 'button' }, h('b', 'Guided first game'), h('span', 'You and one friendly computer; short tips explain each plate the first time you meet it.')),
    h('div.opts', seg('Diners', 'np', [2, 3, 4, 5]), lvRows.length ? h('p.sm', 'Computer level for each chef:') : null, lvRows),
    h('div.sgrid',
      h('button.sbtn', { 'data-start': 'vs', 'data-a': 'start', 'data-m': 'vs', type: 'button' }, h('b', 'Play vs computer'), h('span', 'You against 1 to 4 chefs')),
      h('button.sbtn', { 'data-start': 'hot', 'data-a': 'start', 'data-m': 'hot', type: 'button' }, h('b', 'Hot-seat'), h('span', '2 to 5 people, one device')),
      h('button.sbtn', { 'data-start': 'ai', 'data-a': 'start', 'data-m': 'ai', type: 'button' }, h('b', 'Watch computers'), h('span', 'Sit back and learn'))),
    netBlock(),
    h('div.srow2', hasSave() ? h('button.btn', { 'data-a': 'loadsave', type: 'button' }, 'Continue saved game') : null, h('button.btn.alt', { 'data-a': 'rules', type: 'button' }, 'How to play')));
  s.appendChild(card);
}
function showStart() { try { GX.close(); } catch (e) { } closePop(); UI.cards = []; const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; } closeRS(); clearTimeout(UI.tm); renderStart(); }
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
    case 'again': { const m = UI.mode, c = UI.cfg || {}; UI.cards = []; closeRS(); newGame(m === 'net' ? 'vs' : m, { np: c.np, level: c.level, lv: c.lv }); break; }
    case 'menu': showStart(); break;
    case 'start': newGame(d.m); break;
    case 'guided': newGame('guided'); break;
    case 'opt': { const o = UI.opt = UI.opt || Object.assign({}, DEF, { lv: DEF.lv.slice() }); o[d.k] = isNaN(+d.v) ? d.v : +d.v; if (d.k === 'level') o.lv = [d.v, d.v, d.v, d.v]; renderStart(); break; }
    case 'lv': { const o = UI.opt = UI.opt || Object.assign({}, DEF, { lv: DEF.lv.slice() }); o.lv = (o.lv || DEF.lv).slice(); o.lv[+d.seat - 1] = d.v; renderStart(); break; }
    case 'rules': GX.show('rulesd'); break;
    case 'save': toast(save() ? 'Game saved.' : 'Could not save.'); break;
    case 'loadsave': if (!loadSave()) toast('No saved game.'); break;
    case 'speed': AIDELAY = +d.v; savePrefs(); renderMenu(); break;
    case 'guide': UI.coach.level = d.v; UI.coach.keep = d.v === 'full'; renderMenu(); break;
    case 'hints': UI.prefs.hint = !UI.prefs.hint; savePrefs(); renderMenu(); if (G) render(); break;
    case 'tap2': UI.prefs.tap2 = !UI.prefs.tap2; savePrefs(); renderMenu(); if (G) render(); break;
    case 'sound': UI.prefs.sound = !UI.prefs.sound; savePrefs(); try { if (window.GA) GA.setSfx(UI.prefs.sound); } catch (e) { } renderMenu(); break;
    case 'music': UI.prefs.music = !UI.prefs.music; savePrefs(); try { if (window.GA) GA.setMusic(UI.prefs.music); } catch (e) { } sndMusic(); renderMenu(); break;
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (UI.pop) closePop(); else if (UI.rsOpen && UI.mode && G && G.phase === 'over' && UI.overShown) closeRS(); } });
// ---------- phone mode ----------
function applyPhone() {
  const q = /[?&]phone=(\d)/.exec(location.search); const w = innerWidth, hh = innerHeight, short = Math.min(w, hh);
  let ph = short <= 500 || (window.matchMedia && matchMedia('(pointer:coarse)').matches && short <= 600);
  if (q) ph = q[1] === '1';
  const r = document.documentElement.classList, was = r.contains('ph');
  r.toggle('ph', ph); document.documentElement.style.setProperty('--dockh', Math.max(150, Math.min(206, Math.round(hh * .26))) + 'px'); r.toggle('ph-p', ph && w < hh); r.toggle('ph-l', ph && w >= hh);
  placePrompt(); if (was !== ph) { if (G && UI.started) render(); }
}
let rzT = 0;
function onResize() { clearTimeout(rzT); rzT = setTimeout(() => { applyPhone(); if (G && UI.started) render(); }, 60); }
// ---------- boot ----------
function boot() {
  GX.init({ key: 'kk' });
  GX.drawer('rulesd', 'How to play', buildRules(), true);
  GX.drawer('logd', 'Log', h('div#logbody'));
  GX.drawer('rivald', 'Diners and scores', h('div#rivalbody'));
  GX.drawer('setd', 'Menu', h('div#setbody'));
  GX.onShow = id => { renderDrawers(); };
  loadPrefs(); applyPhone();
  addEventListener('resize', onResize); addEventListener('orientationchange', onResize);
  const bd = $('#board'); if (window.ResizeObserver) new ResizeObserver(() => { if (G && UI.started) { clearTimeout(rzT); rzT = setTimeout(() => { if (G && UI.started) render(); }, 40); } }).observe(bd);
  try { if (window.GA) { const A = typeof GA_DATA !== 'undefined' ? GA_DATA : {}; GA.init({ sfx: A.sfx || {}, music: A.music || {}, key: 'kk' }); GA.setSfx(UI.prefs.sound); GA.setMusic(UI.prefs.music); } } catch (e) { }
  try { if (window.PerfHUD && PerfHUD.register) PerfHUD.register({ game: 'Kaiten Kitchen', anchor: '.gx-board', corner: 'tl', isAnimating: () => !!UI.busy, idleMode: 'demand' }); } catch (e) { }
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

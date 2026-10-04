// ===================== part 1: globals, helpers, table model, scoring hints =====================
var ANIM = 1, AIDELAY = 650;
var G = null;
var UI = { started: false, mode: 'vs', cfg: null, holder: -1, sel: [], twin: false, pop: null, cards: [], fz: null, busy: false, seq: 0, rec: null, noRec: false, over: null,
  coach: { level: 'full', seen: {}, turn: '' }, prefs: { hint: true, tap2: null, sound: true, music: true, gfx: 'auto' }, enter: '', land: null, tm: null, pend: null, rq: [] };
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
  if (c.tempura) { const n = c.tempura, p = Math.floor(n / 2) * 5; mk('tempura', { type: 'tempura', n, pts: p, hint: n % 2 === 0 ? '= ' + p : (p ? '= ' + p + ', need 1' : 'need 1 more'), cls: p ? 'ok' : 'wait', tip: n + ' Crispy Prawn' + (n > 1 ? 's' : '') + ': every pair is worth 5 points' + (n % 2 ? ', one more would make another pair.' : '.') }); }
  if (c.sashimi) { const n = c.sashimi, p = Math.floor(n / 3) * 10, r = n % 3; mk('sashimi', { type: 'sashimi', n, pts: p, hint: r === 0 ? '= ' + p : (p ? '= ' + p + ', need ' + (3 - r) : 'need ' + (3 - r) + ' more'), cls: p ? 'ok' : 'wait', tip: n + ' Fish Slice' + (n > 1 ? 's' : '') + ': each set of three is worth 10 points' + (r ? '; ' + (3 - r) + ' more would finish another set.' : '.') }); }
  if (c.dumpling) { const n = c.dumpling, p = KK.dumplingPts(n); mk('dumpling', { type: 'dumpling', n, pts: p, hint: '= ' + p, cls: 'ok', tip: n + ' Steam Bun' + (n > 1 ? 's' : '') + ' = ' + p + ' points' + (n < 5 ? ' (the next bun makes it ' + KK.dumplingPts(n + 1) + ').' : ' (five or more is the top of the ladder).') }); }
  if (c.icons) { const rk = sc.mk[s]; mk('roll', { type: 'roll2', n: c.icons, pts: rk.pts, hint: rk.rank ? (sc.rs.filter(r => r.icons === c.icons).length > 1 ? 'tied ' : '') + ORD[rk.rank] + ' now +' + rk.pts : 'behind', cls: rk.rank ? 'ok' : 'wait', tip: c.icons + ' roll icons this round: ' + (rk.rank === 1 ? 'most icons right now (' + rk.pts + ' points).' : rk.rank === 2 ? 'second most right now (' + rk.pts + ' points).' : 'not scoring yet. Most icons scores 6, second most 3.') + (rk.rank && sc.rs.filter(r => r.icons === c.icons).length > 1 ? ' Tied with another diner, so the points are split (rounded down).' : '') + ' The race is only settled when the round ends, so this can still change.' }); }
  const by = { salmon: [0, 0], squid: [0, 0], egg: [0, 0] };
  for (const e of t) { const k = tkey(e.id); if (NIG[k]) by[k][e.w >= 0 ? 1 : 0]++; }
  for (const k of ['salmon', 'squid', 'egg']) {
    if (by[k][0]) mk('n-' + k, { type: k, n: by[k][0], pts: NIG[k] * by[k][0], hint: '= ' + NIG[k] * by[k][0], cls: 'ok', tip: by[k][0] + ' ' + TY[k].name + ': ' + NIG[k] + ' point' + (NIG[k] > 1 ? 's' : '') + ' each.' });
    if (by[k][1]) mk('pn-' + k, { type: 'wasabi', on: k, n: by[k][1], pts: 3 * NIG[k] * by[k][1], hint: '= ' + 3 * NIG[k] * by[k][1], cls: 'ok', tip: by[k][1] + ' ' + TY[k].name + ' on Fire Paste: tripled to ' + 3 * NIG[k] + ' each.' });
  }
  if (c.wasabiUnused) mk('wasabi', { type: 'wasabi', n: c.wasabiUnused, pts: 0, hint: '×3 next nigiri', cls: 'wait', pulse: true, tip: c.wasabiUnused + ' Fire Paste waiting for a nigiri: your next nigiri lands on it and scores triple. With none it scores nothing.' });
  if (c.chop) mk('chop', { type: 'chop', n: c.chop, pts: 0, hint: '2 plates later', cls: 'ok', tip: 'Twin Sticks on the table: on a later turn you may serve two plates from your hand, then the sticks go back into that hand and move on to the next diner with it.' });
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
// ---- "what just happened": after every reveal, one line per diner with the score change and its cause
const CATN = { maki: 'roll race', tempura: 'prawn pair', sashimi: 'fish set', dumpling: 'buns', nigiri: 'nigiri', wasabi: 'Fire Paste ×3' };
function buildNews(before, after, picks) {
  const a = liveScores(before), b = liveScores(after), mkA = makiRank(a.map(r => r.icons)), mkB = makiRank(b.map(r => r.icons));
  const lines = picks.map(pk => {
    const s = pk.seat, d = b[s].total - a[s].total, keys = pk.cards.map(c => c.key), why = [];
    const served = pk.cards.map(c => TY[c.key].name + (NIG[c.key] && c.w >= 0 ? ' on Fire Paste' : '')).join(' + ');
    const plays = keys.some(k => ICONS[k]);
    for (const k of ['tempura', 'sashimi', 'dumpling', 'nigiri', 'wasabi']) { const x = b[s][k] - a[s][k]; if (x) why.push((x > 0 ? '+' : '−') + Math.abs(x) + ' ' + CATN[k]); }
    const mx = b[s].maki - a[s].maki;
    if (mx) why.push((mx > 0 ? '+' : '−') + Math.abs(mx) + ' roll race' + (mkB[s].rank ? ' (now ' + ORD[mkB[s].rank] + ')' : ' (lost the lead)') + (!plays ? ': someone else served rolls' : ''));
    const notes = [];
    if (keys.includes('wasabi') && !pk.cards.some(c => NIG[c.key])) notes.push('the Fire Paste waits to triple ' + (s === viewSeat() ? 'your' : 'their') + ' next nigiri');
    if (keys.includes('chop') && keys.length === 1) notes.push('Twin Sticks: two plates on a later turn');
    if (keys.length === 2 && G.players[s]) notes.push('used Twin Sticks to serve two');
    if (keys.includes('pudding')) notes.push('custard is counted at the end of the game');
    if (!d && !why.length && keys.some(k => k === 'tempura' || k === 'sashimi')) notes.push('scores when the set is complete');
    return { s, d, served, why, notes };
  });
  return { t: Date.now(), round: G.round, turn: G.turn, lines };
}
function newsDelta(s) { const n = UI.news; if (!n || Date.now() - n.t > 2600) return 0; const l = n.lines.find(x => x.s === s); return l ? l.d : 0; }
function newsSig(s) { const d = newsDelta(s); return d ? UI.news.t + ':' + d : ''; }
function newsEl() {
  const n = UI.news; if (!n) return null;
  const box = h('div.news');
  n.lines.forEach((l, i) => box.appendChild(h('div.nl', i ? null : h('span.nh', 'Last turn: '), h('span.nn', { style: 'color:' + pcol(l.s).c }, pname(l.s)), ' ', h('span.nd' + (l.d > 0 ? '.up' : l.d < 0 ? '.down' : ''), l.d > 0 ? '+' + l.d : l.d < 0 ? '−' + -l.d : '±0'), ' ' + l.served + (l.why.length ? ' · ' + l.why.join(', ') : '') + (l.notes.length ? ' · ' + l.notes.join('; ') : ''))));
  return box;
}

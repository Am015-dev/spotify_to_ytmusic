// ===================== Hollowbough rules engine =====================
// Plain JS (browser global HB / node module). State G is one JSON-serialisable object with its own seeded RNG.
// API: HB.newGame(opts) -> G ; HB.moves(G, seat) -> [move] ; HB.apply(G, move) -> {ok} | {ok:false,error}
// Multi-step choices are "pending decisions": G.q = {who, kind, title, opts:[{label,h,d,...}]}; they show up in moves(G, who)
// as {type:'choose', i, label, kind}. Remaining engine steps sit on the agenda G.ag as {h,d} (handler key + data, never closures).
// Card instance ids 0..127 (see HB.cardOf). City entries: {id, occ, tok, w, stock, pris, pair}.
(function (g) {
'use strict';
const HB = g.HB = g.HB || {};
const DATA = HB.DATA || (typeof require === 'function' ? require('./data.js') : null);
const RES = ['twig', 'resin', 'pebble', 'berry'];
const HAND = 8, CITY = 15;
let G = null;

// ---------- static tables ----------
const CARDS = DATA.cards, CIDX = {}, CARD_OF = [];
CARDS.forEach((c, i) => { CIDX[c.key] = i; for (let k = 0; k < c.copies; k++) CARD_OF.push(i); });
const NCARDS = CARD_OF.length; // 128
const def = id => CARDS[CARD_OF[id]];
const key = id => CARDS[CARD_OF[id]].key;
const cn = id => CARDS[CARD_OF[id]].name;
const FIDX = {}; DATA.forest.forEach((f, i) => FIDX[f.key] = i);
const SIDX = {}; DATA.specialEvents.forEach((e, i) => SIDX[e.key] = i);
const rn = (r, n) => r === 'berry' ? (n === 1 ? 'berry' : 'berries') : r === 'resin' ? 'resin' : (n === 1 ? r : r + 's');
function rtxt(o) { const a = []; for (const r of RES) if (o && o[r]) a.push(o[r] + ' ' + rn(r, o[r])); return a.join(', ') || 'nothing'; }
const rsum = o => { let n = 0; for (const r of RES) n += (o && o[r]) || 0; return n; };
const SEASONS = ['Winter', 'Spring', 'Summer', 'Autumn'];

// ---------- rng / basics ----------
function rnd(n) { let t = (G.rng = (G.rng + 0x6D2B79F5) | 0); t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * n); }
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
const clone = o => JSON.parse(JSON.stringify(o));
function lg(t) { if (G.nolog) return; G.logN++; G.log.push({ i: G.logN, turn: G.turn, t }); if (G.log.length > 600) G.log.splice(0, 200); }
function use(t) { G.used[t] = (G.used[t] || 0) + 1; }
const P = s => G.players[s];
const pn = s => s === 'G' ? DATA.soloName : G.players[s].name;
const newRes = () => ({ twig: 0, resin: 0, pebble: 0, berry: 0 });

// ---------- agenda / pending decisions ----------
const H = {};
function now(h, d) { G.ag.splice(G.agI++, 0, { h, d: d || {} }); }
function later(h, d) { G.ag.push({ h, d: d || {} }); }
function ask(who, kind, title, opts) { if (!opts.length) return false; G.q = { who, kind, title, opts }; return true; }
function flow() {
  let n = 0;
  while (!G.q && G.ag.length && G.phase !== 'over') {
    const s = G.ag.shift(); G.agI = 0;
    if (!H[s.h]) throw new Error('no handler ' + s.h);
    H[s.h](s.d);
    if (++n > 20000) throw new Error('agenda runaway');
  }
  G.agI = 0;
}
H.noop = () => { };

// ---------- deck / meadow / hand ----------
function deckTake() {
  if (!G.deck.length && G.discard.length) { G.deck = G.discard; G.discard = []; shuffle(G.deck); lg('The discard pile is shuffled into a new deck.'); }
  return G.deck.length ? G.deck.pop() : -1;
}
function draw(seat, n, force) { const p = P(seat); let k = 0; while (k < n && (force || p.hand.length < HAND)) { const c = deckTake(); if (c < 0) break; p.hand.push(c); k++; } return k; }
function refill() { for (let i = 0; i < G.meadow.length; i++) if (G.meadow[i] < 0) { const c = deckTake(); if (c >= 0) G.meadow[i] = c; } }
const blockedSlot = i => !!(G.grim && G.grim.mb.indexOf(i) >= 0);
function meadowCards() { const o = []; for (let i = 0; i < G.meadow.length; i++) if (G.meadow[i] >= 0 && !blockedSlot(i)) o.push(G.meadow[i]); return o; }
function gain(seat, o) { const p = P(seat); for (const r of RES) if (o[r]) p.res[r] += o[r]; }
function payRes(seat, o) { const p = P(seat); for (const r of RES) if (o[r]) { p.res[r] -= o[r]; if (p.res[r] < 0) throw new Error('negative resource ' + r); } }
function afford(res, cost, any) { let s = 0; for (const r of RES) { const d = (cost[r] || 0) - res[r]; if (d > 0) s += d; } return s <= (any || 0); }
const plain = (cost) => { const o = {}; for (const r of RES) if (cost[r]) o[r] = cost[r]; return o; };

// ---------- city helpers ----------
function cityEntries(co) { return co === 'G' ? G.grim.city.map(id => ({ id, occ: false, tok: 0, w: 0, stock: null, pris: [], pair: null })) : P(co).city; }
const ent = (p, id) => { for (const e of p.city) if (e.id === id) return e; return null; };
function kcount(city, k) { let n = 0; for (const e of city) if (key(e.id) === k) n++; return n; }
const hasKey = (p, k) => p.city.some(e => key(e.id) === k);
function cityCount(p, excl) {
  let n = 0;
  for (const e of p.city) {
    if (excl && excl.has(e.id)) continue;
    if (key(e.id) === 'wanderer') continue;
    if (e.pair != null && !(excl && excl.has(e.pair))) { if (e.id < e.pair) n++; continue; }
    n++;
  }
  return n;
}
function colorCount(city, color) { let n = 0; for (const e of city) if (def(e.id).color === color) n++; return n; }
function placeInCity(seat, id) {
  const p = P(seat), k = key(id);
  const e = { id, occ: false, tok: 0, w: 0, stock: null, pris: [], pair: null };
  if (k === 'husband' || k === 'wife') {
    const pk = k === 'husband' ? 'wife' : 'husband';
    const o = p.city.find(x => key(x.id) === pk && x.pair == null);
    if (o) { e.pair = o.id; o.pair = id; }
  }
  if (k === 'storehouse') e.stock = newRes();
  if (k === 'clock_tower') e.tok = 3;
  p.city.push(e);
  return e;
}
// remove an entry from a city; the caller decides where the card goes. opts.moveTo: card id that inherits permanent workers.
function removeFromCity(seat, id, opts) {
  const p = P(seat), i = p.city.findIndex(e => e.id === id);
  if (i < 0) throw new Error('card not in city');
  const e = p.city[i]; p.city.splice(i, 1);
  if (e.pair != null) { const o = ent(p, e.pair); if (o) o.pair = null; }
  for (const q of e.pris) G.discard.push(q);
  e.pris = [];
  for (const pl of allPlacements()) {
    if (pl.k === 'dest' && pl.c === id) {
      if (opts && opts.moveTo != null && pl.perm) pl.c = opts.moveTo;
      else if (pl.perm) { pl.dead = true; }
      else pl.c = -1;
    }
  }
  for (const q of G.players) {
    const before = q.dep.length;
    q.dep = q.dep.filter(pl => !pl.dead);
    const lost = before - q.dep.length;
    if (lost) { q.workers -= lost; q.lost += lost; }
  }
  return e;
}
function allPlacements() { const o = []; for (const q of G.players) for (const pl of q.dep) o.push(pl); return o; }
const availW = p => p.workers - p.dep.length;
const resTotal = p => rsum(p.res);

// ---------- recipients ----------
function resRecips(seat) { const r = []; for (let o = 0; o < G.np; o++) if (o !== seat && !P(o).passed) r.push(o); if (G.grim) r.push('G'); return r; }
function cardRecips(seat) { const r = []; for (let o = 0; o < G.np; o++) if (o !== seat && !P(o).passed && P(o).hand.length < HAND) r.push(o); if (G.grim) r.push('G'); return r; }
function giveCard(to, id) { if (to === 'G' || to == null || P(to).passed || P(to).hand.length >= HAND) G.discard.push(id); else P(to).hand.push(id); }
function giveRes(from, to, r, n) { P(from).res[r] -= n; if (to !== 'G' && to != null) P(to).res[r] += n; }
// choose a recipient (auto when only one), then continue with handler h and data d + {to}
function pickRecip(seat, list, title, h, d) {
  if (list.length <= 1) { now(h, Object.assign({}, d, { to: list.length ? list[0] : null })); return; }
  ask(seat, 'recipient', title, list.map(t => ({ label: 'Choose ' + pn(t), h, d: Object.assign({}, d, { to: t }) })));
}

// ================= scoring =================
function pairCount(p) { let n = 0; for (const e of p.city) if (e.pair != null && e.id < e.pair) n++; return n; }
function sevOwned(seat) { const o = []; G.sev.forEach((e, i) => { if (e.o === seat) o.push(i); }); return o; }
function bevOwned(seat) { let n = 0; for (const e of G.bev) if (e.o === seat) n++; return n; }
function score(g, seat) { const prev = G; G = g; try { return scoreOf(seat); } finally { G = prev; } }
function scoreOf(seat) {
  const p = P(seat), det = [];
  let cards = 0, toks = p.pts, bonus = 0, events = 0, journey = 0;
  const nb = bevOwned(seat), so = sevOwned(seat);
  for (const e of p.city) {
    const c = def(e.id); cards += c.pts; toks += e.tok;
    let b = 0;
    switch (c.key) {
      case 'architect': b = Math.min(6, p.res.resin + p.res.pebble); break;
      case 'king': b = nb + 2 * so.length; break;
      case 'castle': b = p.city.filter(x => def(x.id).kind === 'construction' && !def(x.id).unique).length; break;
      case 'palace': b = p.city.filter(x => def(x.id).kind === 'construction' && def(x.id).unique).length; break;
      case 'school': b = p.city.filter(x => def(x.id).kind === 'critter' && !def(x.id).unique).length; break;
      case 'theater': b = p.city.filter(x => def(x.id).kind === 'critter' && def(x.id).unique).length; break;
      case 'ever_tree': b = p.city.filter(x => def(x.id).color === 'purple').length; break;
      case 'wife': b = e.pair != null ? 3 : 0; break;
    }
    if (b) { bonus += b; det.push({ card: e.id, bonus: b }); }
  }
  for (const e of G.bev) if (e.o === seat) events += DATA.basicEvents[e.k].pts;
  for (const i of so) events += sevScore(seat, G.sev[i]);
  for (const pl of p.dep) if (pl.k === 'journey') journey += DATA.journey[pl.i].points;
  const total = cards + toks + bonus + events + journey;
  let left = rsum(p.res);
  return { seat, total, cards, tokens: toks, bonus, events, journey, evCount: nb + so.length, left, detail: det };
}
function sevScore(seat, ev) {
  const p = P(seat), sp = DATA.specialEvents[ev.k], s = sp.score; if (!s) return 0;
  if (s.flat != null) return s.flat;
  if (s.per_twig_on_event) return s.per_twig_on_event * ev.stock.twig;
  if (s.per_berry_on_event) return s.per_berry_on_event * ev.stock.berry;
  if (s.per_card_beneath) return s.per_card_beneath * ev.tuck.length;
  if (s.per_critter_beneath) return s.per_critter_beneath * ev.tuck.length;
  if (s.per_husband_wife_pair_in_all_cities) { let n = 0; for (const q of G.players) n += pairCount(q); if (G.grim) { /* his cards carry no pairs */ } return s.per_husband_wife_pair_in_all_cities * n; }
  if (s.per_dungeon_prisoner) { let n = 0; for (const e of p.city) if (key(e.id) === 'dungeon') n += e.pris.length; return s.per_dungeon_prisoner * n; }
  if (s.per_worker_in_monastery) { let n = 0; for (const pl of p.dep) if (pl.k === 'dest' && pl.perm && pl.c >= 0 && key(pl.c) === 'monastery') n++; return s.per_worker_in_monastery * n; }
  if (s.per_cemetery_worker) { let n = 0; for (const pl of p.dep) if (pl.k === 'dest' && pl.perm && pl.c >= 0 && key(pl.c) === 'cemetery') n++; return s.per_cemetery_worker * n; }
  if (s.per_token_on_chapel) { let n = 0; for (const e of p.city) if (key(e.id) === 'chapel') n += e.tok; return s.per_token_on_chapel * n; }
  if (s.per_resource_on_event) { const m = s.per_resource_on_event; let n = 0; for (const r of RES) n += (m[r] || 0) * ev.stock[r]; return n; }
  return 0;
}
function grimScore() {
  const gr = G.grim; let n = 0, cards = 0, purple = 0;
  for (const id of gr.city) { const c = def(id); cards++; n += c.color === 'purple' ? 3 : 2; if (c.color === 'purple') purple++; }
  let basic = 0; for (const e of G.bev) if (e.o === 'G') basic++;
  const per = gr.diff === 1 ? 3 : 6; let sp = 0; for (const e of G.sev) if (e.o < 0 || e.o == null) sp++;
  const jr = gr.ji >= 0 ? DATA.journey[gr.ji].points : 0;
  return { total: n + 3 * basic + per * sp + jr + gr.pts, cards, cardPts: n, basic: 3 * basic, special: per * sp, journey: jr, tokens: gr.pts };
}
function grimClaimBasic() {
  const gr = G.grim;
  G.bev.forEach((e, i) => {
    if (e.o !== -1) return;
    const need = DATA.basicEvents[e.k].need; let ok = true;
    for (const c in need) if (colorCount(gr.city.map(id => ({ id })), c === 'production' ? 'green' : c === 'destination' ? 'red' : c === 'governance' ? 'blue' : 'tan') < need[c]) ok = false;
    if (ok) { e.o = 'G'; lg(DATA.soloName + ' claims ' + DATA.basicEvents[e.k].name + '.'); use('bev:' + DATA.basicEvents[e.k].key); }
  });
}

// ================= setup =================
function newGame(o) {
  o = o || {};
  const seed = (o.seed != null ? o.seed : Math.floor(Math.random() * 2147483647)) >>> 0;
  let pl = o.players && o.players.length ? o.players : [{ name: 'You', ai: null }];
  let solo = o.solo || null;
  if (!solo && pl.length === 1) solo = { difficulty: 1 };
  if (solo) { pl = [pl[0]]; if (typeof solo.difficulty === 'string') solo.difficulty = Math.max(1, DATA.soloLevels.indexOf(solo.difficulty) + 1) || +solo.difficulty || 1; solo = { difficulty: Math.max(1, Math.min(3, solo.difficulty | 0 || 1)) }; }
  else if (pl.length > 4 || pl.length < 2) throw new Error('2-4 players (or solo)');
  const np = pl.length;
  G = {
    v: 1, seed, rng: seed, np, solo: solo ? { difficulty: solo.difficulty } : null,
    players: [], deck: [], discard: [], meadow: [], limbo: [], lpriv: -1, forest: [], bev: [], sev: [], grim: null,
    cur: 0, first: 0, turn: 1, phase: 'play', ag: [], agI: 0, q: null, log: [], logN: 0, used: {}, over: null, nolog: false,
  };
  const ids = []; for (let i = 0; i < NCARDS; i++) ids.push(i);
  G.deck = shuffle(ids);
  for (let i = 0; i < 8; i++) G.meadow.push(G.deck.pop());
  pl.forEach((x, i) => {
    G.players.push({ name: x.name || ('Player ' + (i + 1)), ai: x.ai || null, seat: i, hand: [], city: [], res: newRes(), pts: 0, workers: 2, lost: 0, season: 0, passed: false, dep: [] });
  });
  for (let i = 0; i < np; i++) draw(i, 5 + i, true);
  const fi = []; for (let i = 0; i < DATA.forest.length; i++) fi.push(i);
  shuffle(fi); G.forest = fi.slice(0, np >= 3 ? 4 : 3);
  DATA.basicEvents.forEach((e, i) => G.bev.push({ k: i, o: -1 }));
  const si = []; for (let i = 0; i < DATA.specialEvents.length; i++) si.push(i);
  shuffle(si); for (const i of si.slice(0, 4)) G.sev.push({ k: i, o: -1, tuck: [], hid: false, stock: newRes() });
  if (solo) G.grim = { diff: solo.difficulty, city: [], pts: 0, mb: [], fi: 0, bi: 4, ji: -1 };
  lg(solo ? 'A solo game against ' + DATA.soloName + ' (' + DATA.soloLevels[solo.difficulty - 1] + ') begins.' : 'A game for ' + np + ' begins. ' + pn(0) + ' goes first.');
  const r = G; G = null; return r;
}
function withG(g, fn) { const prev = G; G = g; try { return fn(); } finally { G = prev; } }

// ================= move generation =================
function actor(g) { return g.phase === 'over' ? -1 : g.q ? g.q.who : g.cur; }
function moves(g, seat) { return withG(g, () => genMoves(seat)); }
function genMoves(seat) {
  if (G.phase === 'over') return [];
  if (G.q) {
    if (G.q.who !== seat) return [];
    return G.q.opts.map((o, i) => { const m = { type: 'choose', i, kind: G.q.kind, label: o.label }; if (o.card !== undefined) m.card = o.card; if (o.res !== undefined) m.res = o.res; return m; });
  }
  if (G.cur !== seat) return [];
  const p = P(seat), out = [];
  if (availW(p) > 0) for (const l of locOpts(seat)) { const m = { type: 'worker' }; for (const k in l) if (k !== 'label') m[k] = l[k]; m.label = 'Place a worker: ' + l.label; out.push(m); }
  for (const m of playMoves(seat)) out.push(m);
  if (availW(p) === 0 && p.season < 3) out.push({ type: 'prepare', label: 'Prepare for ' + SEASONS[p.season + 1] + ' (recall workers' + (p.season === 0 ? ', +1 worker, run production' : p.season === 1 ? ', +1 worker, draw from the meadow' : ', +2 workers, run production') + ')' });
  out.push({ type: 'pass', label: 'Pass (you are done for the game)' });
  return out;
}
function occCount(k, i) {
  let n = 0;
  for (const pl of allPlacements()) if (pl.k === k && pl.i === i) n++;
  const gr = G.grim;
  if (gr) { if (k === 'basic' && gr.bi === i) n++; else if (k === 'forest' && gr.fi === i) n++; else if (k === 'journey' && gr.ji === i) n++; }
  return n;
}
function destOcc(id) { let n = 0; for (const pl of allPlacements()) if (pl.k === 'dest' && pl.c === id) n++; return n; }
function destCap(owner, e) {
  const k = key(e.id);
  if (owner === 'G') return 1;
  const p = P(owner);
  if (k === 'cemetery') return 1 + (hasKey(p, 'undertaker') ? 1 : 0);
  if (k === 'monastery') return 1 + (hasKey(p, 'monk') ? 1 : 0);
  return 1;
}
function locLabel(l) {
  switch (l.k) {
    case 'basic': return DATA.basic[l.i].name;
    case 'forest': return DATA.forest[G.forest[l.i]].name;
    case 'haven': return DATA.haven.name;
    case 'journey': return DATA.journey[l.i].name + ' (' + DATA.journey[l.i].points + ' points)';
    case 'dest': return l.c >= 0 ? cn(l.c) : 'a vanished card';
    case 'event': return l.e === 'b' ? DATA.basicEvents[G.bev[l.i].k].name : DATA.specialEvents[G.sev[l.i].k].name;
  }
  return '?';
}
// legal locations for placing one worker (the caller checks a worker is free)
function locOpts(seat) {
  const p = P(seat), out = [];
  DATA.basic.forEach((b, i) => { if (!b.shared && occCount('basic', i) > 0) return; out.push({ k: 'basic', i, label: b.name + ' - ' + b.text }); });
  const cap = G.np === 4 ? 2 : 1;
  G.forest.forEach((fi, i) => {
    if (occCount('forest', i) >= cap) return;
    if (cap === 2 && p.dep.some(pl => pl.k === 'forest' && pl.i === i)) return;
    out.push({ k: 'forest', i, label: DATA.forest[fi].name + ' - ' + DATA.forest[fi].text });
  });
  if (p.hand.length >= 2) out.push({ k: 'haven', label: DATA.haven.name + ' - ' + DATA.haven.text });
  if (p.season === 3) DATA.journey.forEach((j, i) => { if (!j.shared && occCount('journey', i) > 0) return; if (p.hand.length < j.discard) return; out.push({ k: 'journey', i, label: j.name + ' - discard ' + j.discard + ' cards; the worker stays and scores ' + j.points }); });
  for (let o = 0; o < G.np; o++) {
    for (const e of P(o).city) {
      const c = def(e.id);
      if (!(c.color === 'red' || c.key === 'storehouse')) continue;
      if (o !== seat && !(c.key === 'inn' || c.key === 'post_office')) continue;
      if (!destOK(seat, o, e)) continue;
      out.push({ k: 'dest', o, c: e.id, label: c.name + (o !== seat ? ' in ' + pn(o) + "'s city" : '') + ' - ' + c.text });
    }
  }
  if (G.grim) for (const id of G.grim.city) { const k = key(id); if (k !== 'inn' && k !== 'post_office') continue; const e = { id }; if (destOK(seat, 'G', e)) out.push({ k: 'dest', o: 'G', c: id, label: cn(id) + ' in ' + DATA.soloName + "'s city - " + def(id).text }); }
  G.bev.forEach((e, i) => { if (e.o === -1 && evOK(seat, 'b', i)) out.push({ k: 'event', e: 'b', i, label: 'Claim ' + DATA.basicEvents[e.k].name + ' - ' + DATA.basicEvents[e.k].text }); });
  G.sev.forEach((e, i) => { if (e.o === -1 && evOK(seat, 's', i)) out.push({ k: 'event', e: 's', i, label: 'Claim ' + DATA.specialEvents[e.k].name + ' - ' + DATA.specialEvents[e.k].text }); });
  return out;
}
function destOK(seat, owner, e) {
  const p = P(seat), k = key(e.id);
  if (destOcc(e.id) >= destCap(owner, e)) return false;
  switch (k) {
    case 'inn': return innCands(seat).length > 0;
    case 'post_office': return p.hand.length >= 2;
    case 'queen': return queenCands(seat).length > 0;
    case 'cemetery': case 'chapel': case 'lookout': return true;
    case 'monastery': return resTotal(p) >= 2 && resRecips(seat).length > 0;
    case 'university': return p.city.some(x => x.id !== e.id);
    case 'storehouse': return !!e.stock && rsum(e.stock) > 0;
  }
  return false;
}
function evOK(seat, kind, i) {
  const p = P(seat);
  if (kind === 'b') {
    const need = DATA.basicEvents[G.bev[i].k].need;
    for (const c in need) if (colorCount(p.city, c === 'production' ? 'green' : c === 'destination' ? 'red' : c === 'governance' ? 'blue' : 'tan') < need[c]) return false;
    return true;
  }
  const sp = DATA.specialEvents[G.sev[i].k];
  for (const k of sp.req) if (!hasKey(p, k)) return false;
  if (sp.colors) for (const c in sp.colors) if (colorCount(p.city, c === 'production' ? 'green' : c === 'destination' ? 'red' : c === 'governance' ? 'blue' : c === 'prosperity' ? 'purple' : 'tan') < sp.colors[c]) return false;
  if (sp.key === 'sev_marsh_fever_remedy') { if (p.res.berry < 2 || p.city.length < 2) return false; }
  if (sp.key === 'sev_grand_market_scheme') return true;
  return true;
}

// ---- playing cards: legality
function occTargets(p, id) {
  const c = def(id), out = [];
  if (c.kind !== 'critter') return out;
  const e1 = p.city.find(e => key(e.id) === c.linked && !e.occ);
  if (e1) out.push(e1.id);
  const e2 = p.city.find(e => key(e.id) === 'ever_tree' && !e.occ);
  if (e2) out.push(e2.id);
  return out;
}
function foolTargets(seat) { const t = []; for (let o = 0; o < G.np; o++) if (o !== seat && cityCount(P(o)) < CITY && !hasKey(P(o), 'fool')) t.push(o); return t; }
// can card id be placed into seat's city, after the entries in excl (a Set) have been removed?
function placeable(seat, id, excl) {
  const p = P(seat), k = key(id), c = def(id);
  if (c.unique && p.city.some(e => key(e.id) === k && !(excl && excl.has(e.id)))) return false;
  if (k === 'fool') return G.grim ? true : foolTargets(seat).length > 0;
  if (k === 'ruins') return p.city.some(e => def(e.id).kind === 'construction' && key(e.id) !== 'ruins' && !(excl && excl.has(e.id)));
  if (k === 'wanderer') return true;
  if (k === 'husband' || k === 'wife') { const pk = k === 'husband' ? 'wife' : 'husband'; if (p.city.some(e => key(e.id) === pk && e.pair == null && !(excl && excl.has(e.id)))) return true; }
  return cityCount(p, excl) < CITY;
}
function judgeSwaps(res, cost) {
  const o = [];
  for (const r of RES) { if (!(cost[r] > 0)) continue; for (const s of RES) { if (s === r) continue; const c2 = plain(cost); c2[r]--; c2[s] = (c2[s] || 0) + 1; if (afford(res, c2, 0)) o.push({ from: r, to: s, cost: c2 }); } }
  return o;
}
function dungeonPrisoners(seat, id) {
  const p = P(seat), out = [];
  for (const d of p.city) {
    if (key(d.id) !== 'dungeon') continue;
    const cap = 1 + (hasKey(p, 'ranger') ? 1 : 0);
    for (const e of p.city) {
      if (def(e.id).kind !== 'critter') continue;
      const capAfter = 1 + (p.city.some(x => key(x.id) === 'ranger' && x.id !== e.id) ? 1 : 0);
      if (d.pris.length >= Math.min(cap, capAfter)) continue;
      if (!placeable(seat, id, new Set([e.id]))) continue;
      out.push({ dungeon: d.id, prisoner: e.id });
    }
  }
  return out;
}
function howOptions(seat, id) {
  const p = P(seat), c = def(id), cost = c.cost, out = [];
  const free0 = rsum(cost) === 0;
  const plainOK = placeable(seat, id, null);
  const canPay = afford(p.res, cost, 0);
  if (plainOK && canPay) out.push({ how: 'pay' });
  if (plainOK) for (const v of occTargets(p, id)) out.push({ how: 'occupy', via: v });
  if (!free0) {
    if (c.kind === 'critter' && cost.berry > 0) { const ih = p.city.find(e => key(e.id) === 'innkeeper'); if (ih && afford(p.res, Object.assign(plain(cost), { berry: Math.max(0, cost.berry - 3) }), 0) && placeable(seat, id, new Set([ih.id]))) out.push({ how: 'innkeeper', via: ih.id }); }
    if (c.kind === 'construction') { const cr = p.city.find(e => key(e.id) === 'crane'); if (cr && afford(p.res, cost, 3) && placeable(seat, id, new Set([cr.id]))) out.push({ how: 'crane', via: cr.id }); }
    if (afford(p.res, cost, 3) && dungeonPrisoners(seat, id).length) out.push({ how: 'dungeon' });
    if (!canPay && plainOK && hasKey(p, 'judge') && judgeSwaps(p.res, cost).length) out.push({ how: 'judge' });
  }
  return out;
}
function playMoves(seat) {
  const p = P(seat), out = [];
  const srcs = [];
  p.hand.forEach(id => srcs.push([id, 'hand']));
  G.meadow.forEach((id, i) => { if (id >= 0 && !blockedSlot(i)) srcs.push([id, 'meadow']); });
  for (const [id, from] of srcs) {
    for (const h of howOptions(seat, id)) {
      const m = { type: 'play', card: id, from, how: h.how };
      if (h.via != null) m.via = h.via;
      m.label = playLabel(seat, id, from, h);
      out.push(m);
    }
  }
  return out;
}
function playLabel(seat, id, from, h) {
  const c = def(id), src = from === 'hand' ? 'from your hand' : 'from the meadow';
  switch (h.how) {
    case 'pay': return 'Play ' + c.name + ' ' + src + ' (pay ' + rtxt(c.cost) + ')';
    case 'occupy': return 'Play ' + c.name + ' ' + src + ' free (occupy ' + cn(h.via) + ')';
    case 'innkeeper': return 'Play ' + c.name + ' ' + src + ' (send away ' + cn(h.via) + ' to cut 3 berries)';
    case 'crane': return 'Play ' + c.name + ' ' + src + ' (dismantle ' + cn(h.via) + ' to cut 3 resources)';
    case 'dungeon': return 'Play ' + c.name + ' ' + src + ' (lock a critter beneath ' + CARDS[CIDX.dungeon].name + ', cut 3 resources)';
    case 'judge': return 'Play ' + c.name + ' ' + src + ' (swap one resource using the judge)';
  }
  return 'Play ' + c.name;
}
function innCands(seat) { const o = []; const p = P(seat); for (const id of meadowCards()) if (placeable(seat, id, null) && afford(p.res, def(id).cost, 3)) o.push(id); return o; }
function queenCands(seat) {
  const p = P(seat), o = [];
  for (const id of p.hand) if (def(id).pts <= 3 && placeable(seat, id, null)) o.push({ id, from: 'hand' });
  for (const id of meadowCards()) if (def(id).pts <= 3 && placeable(seat, id, null)) o.push({ id, from: 'meadow' });
  return o;
}

// ================= apply =================
function sameMove(a, b) { for (const k in a) if (k !== 'label' && a[k] !== b[k]) return false; for (const k in b) if (k !== 'label' && !(k in a)) return false; return true; }
function apply(g, m, opt) {
  const prev = G; G = g;
  try {
    if (G.phase === 'over') return { ok: false, error: 'The game is over.' };
    const who = G.q ? G.q.who : G.cur;
    if (!(opt && opt.trust)) {
      if (!m || typeof m !== 'object') return { ok: false, error: 'No move.' };
      const f = genMoves(who).find(x => sameMove(x, m) || sameMove(m, x));
      if (!f) return { ok: false, error: 'Illegal move.' };
      m = f;
    }
    if (m.type === 'choose') { const o = G.q.opts[m.i]; G.q = null; G.agI = 0; H[o.h](o.d || {}); }
    else doAction(who, m);
    flow();
    return { ok: true };
  } finally { G = prev; }
}
function doAction(seat, m) {
  const p = P(seat);
  G.ag.push({ h: 'endTurn', d: { seat } });
  if (m.type === 'worker') {
    const loc = {}; for (const k in m) if (k !== 'type' && k !== 'label') loc[k] = m[k];
    lg(p.name + ' places a worker: ' + locLabel(loc) + '.');
    placeAt(seat, loc);
  } else if (m.type === 'play') {
    startPlay(seat, m.card, m.from, m.how, m.via);
  } else if (m.type === 'prepare') {
    lg(p.name + ' prepares for ' + SEASONS[p.season + 1] + '.');
    now('prepare', { seat });
  } else if (m.type === 'pass') {
    p.passed = true; lg(p.name + ' passes.');
  } else throw new Error('bad move');
}
H.endTurn = d => {
  G.turn++;
  if (G.players.every(p => p.passed)) { finish(); return; }
  let n = G.cur;
  for (let k = 0; k < G.np; k++) { n = (n + 1) % G.np; if (!P(n).passed) { G.cur = n; return; } }
  finish();
};
function finish() {
  if (G.grim) grimClaimBasic();
  const sc = G.players.map(p => scoreOf(p.seat));
  const over = { scores: sc };
  if (G.grim) {
    const gs = grimScore(); over.grim = gs; over.win = sc[0].total > gs.total; over.winner = over.win ? 0 : -1;
  } else {
    let best = -1;
    sc.forEach((s, i) => { if (best < 0) { best = i; return; } const b = sc[best]; if (s.total > b.total || (s.total === b.total && (s.evCount > b.evCount || (s.evCount === b.evCount && s.left > b.left)))) best = i; });
    over.winner = best;
    over.tie = sc.some((s, i) => i !== best && s.total === sc[best].total && s.evCount === sc[best].evCount && s.left === sc[best].left);
  }
  G.over = over; G.phase = 'over'; G.q = null; G.ag = [];
  lg('The game is over.');
}

// ================= placing workers =================
function placeAt(seat, loc) {
  const p = P(seat), pl = {}; for (const k in loc) if (k !== 'label') pl[k] = loc[k];
  if (pl.k === 'journey') pl.perm = true;
  if (pl.k === 'dest') { const kk = key(pl.c); if (kk === 'cemetery' || kk === 'monastery') pl.perm = true; }
  p.dep.push(pl);
  now('locFx', { seat, loc: pl });
}
H.locFx = d => {
  const s = d.seat, l = d.loc;
  switch (l.k) {
    case 'basic': case 'forest': now('activate', { seat: s, loc: l }); break;
    case 'haven': use('haven'); now('dLoop', { seat: s, max: 99, min: 0, count: 0, then: { h: 'thAny', d: { seat: s, per: 0.5 } }, title: 'Discard cards to gain resources (1 resource per 2 cards)' }); break;
    case 'journey': use('journey:' + l.i); lg(P(s).name + ' sets out on the Long Road (' + DATA.journey[l.i].points + ' points).'); now('dLoop', { seat: s, max: DATA.journey[l.i].discard, min: DATA.journey[l.i].discard, count: 0, then: { h: 'noop', d: {} }, title: 'Discard ' + DATA.journey[l.i].discard + ' cards for the journey' }); break;
    case 'dest': destFx(s, l); break;
    case 'event': now('claimEv', { seat: s, e: l.e, i: l.i }); break;
  }
};
H.activate = d => {
  const s = d.seat, l = d.loc;
  if (l.k === 'basic') {
    const b = DATA.basic[l.i]; use('basic:' + l.i);
    gain(s, b.gain); if (b.pts) P(s).pts += b.pts;
    if (b.draw) now('draw', { seat: s, n: b.draw });
  } else if (l.k === 'forest') {
    const fk = DATA.forest[G.forest[l.i]].key; use('forest:' + fk);
    FOREST[fk](s);
  }
};
H.draw = d => { draw(d.seat, d.n); };
H.gainAny = d => {
  if (d.n <= 0) return;
  ask(d.seat, 'resource', 'Choose a resource to gain', RES.map(r => ({ label: 'Take 1 ' + rn(r, 1), res: r, h: 'gainOne', d: { seat: d.seat, r, n: d.n } })));
};
H.gainOne = d => { P(d.seat).res[d.r]++; if (d.n > 1) now('gainAny', { seat: d.seat, n: d.n - 1 }); };
// discard cards from hand one at a time. then:{h,d} gets count
H.dLoop = d => {
  const p = P(d.seat), cnt = d.count || 0;
  const more = cnt < d.max && p.hand.length > 0;
  if (!more) { now(d.then.h, Object.assign({}, d.then.d, { count: cnt })); return; }
  const opts = p.hand.map(id => ({ label: 'Discard ' + cn(id), card: id, h: 'dOne', d: Object.assign({}, d, { card: id }) }));
  if (cnt >= d.min) opts.push({ label: 'Done discarding (' + cnt + ' discarded)', h: 'dFin', d });
  ask(d.seat, 'discard', d.title || 'Discard cards', opts);
};
H.dOne = d => { const p = P(d.seat); p.hand.splice(p.hand.indexOf(d.card), 1); G.discard.push(d.card); now('dLoop', Object.assign({}, d, { count: (d.count || 0) + 1, card: undefined })); };
H.dFin = d => { now(d.then.h, Object.assign({}, d.then.d, { count: d.count || 0 })); };
H.thDraw = d => { draw(d.seat, d.per * d.count); };
H.thPts = d => { P(d.seat).pts += d.per * d.count; lg(P(d.seat).name + ' takes ' + (d.per * d.count) + ' point token(s).'); };
H.thAny = d => { const n = Math.floor(d.per * d.count); if (n > 0) now('gainAny', { seat: d.seat, n }); };

const FOREST = {
  forest_berry_thicket: s => { gain(s, { berry: 2 }); now('draw', { seat: s, n: 1 }); },
  forest_foragers_crossing: s => now('gainAny', { seat: s, n: 2 }),
  forest_rummage_hollow: s => now('dLoop', { seat: s, max: 99, min: 0, count: 0, then: { h: 'thDraw', d: { seat: s, per: 2 } }, title: 'Discard any number of cards (draw 2 for each)' }),
  forest_echoing_meadow: s => { now('draw', { seat: s, n: 1 }); now('copyLoc', { seat: s, basicOnly: true }); },
  forest_quarry_burrow: s => { gain(s, { pebble: 1 }); now('draw', { seat: s, n: 3 }); },
  forest_mixed_glade: s => gain(s, { twig: 1, resin: 1, berry: 1 }),
  forest_bumper_bramble: s => gain(s, { berry: 3 }),
  forest_sapwell_copse: s => gain(s, { resin: 2, twig: 1 }),
  forest_postbag_clearing: s => { now('draw', { seat: s, n: 2 }); now('gainAny', { seat: s, n: 1 }); },
  forest_barter_stump: s => now('dLoop', { seat: s, max: 3, min: 0, count: 0, then: { h: 'thAny', d: { seat: s, per: 1 } }, title: 'Discard up to 3 cards (1 resource each)' }),
  forest_meadow_bazaar: s => now('mtake', { seat: s, left: 2, opt: false, taken: [], then: 'bazaarPlay' }),
};
// copy a basic (and for the lookout also a forest) location, ignoring occupancy
H.copyLoc = d => {
  const opts = [];
  DATA.basic.forEach((b, i) => opts.push({ label: 'Copy ' + b.name + ' - ' + b.text, h: 'activate', d: { seat: d.seat, loc: { k: 'basic', i } } }));
  if (!d.basicOnly) G.forest.forEach((fi, i) => opts.push({ label: 'Copy ' + DATA.forest[fi].name + ' - ' + DATA.forest[fi].text, h: 'activate', d: { seat: d.seat, loc: { k: 'forest', i } } }));
  ask(d.seat, 'copy', 'Choose a location to copy', opts);
};
// take cards from the meadow into the hand (mtake), then refill
H.mtake = d => {
  const p = P(d.seat), c = meadowCards();
  if (d.left <= 0 || !c.length || p.hand.length >= HAND) { refill(); if (d.then) now(d.then, { seat: d.seat, taken: d.taken }); return; }
  const opts = c.map(id => ({ label: 'Take ' + cn(id) + ' from the meadow', card: id, h: 'mtakeOne', d: Object.assign({}, d, { card: id }) }));
  if (d.opt) opts.push({ label: 'Stop taking cards', h: 'mtakeStop', d });
  ask(d.seat, 'meadow', d.title || 'Take a card from the meadow', opts);
};
H.mtakeOne = d => { const p = P(d.seat); G.meadow[G.meadow.indexOf(d.card)] = -1; p.hand.push(d.card); now('mtake', Object.assign({}, d, { left: d.left - 1, taken: d.taken.concat([d.card]), card: undefined })); };
H.mtakeStop = d => { refill(); if (d.then) now(d.then, { seat: d.seat, taken: d.taken }); };
H.bazaarPlay = d => {
  const p = P(d.seat), opts = [];
  for (const id of d.taken) if (p.hand.indexOf(id) >= 0 && placeable(d.seat, id, null) && afford(p.res, def(id).cost, 1)) opts.push({ label: 'Play ' + cn(id) + ' for 1 fewer resource', card: id, h: 'bazaarGo', d: { seat: d.seat, id } });
  if (!opts.length) return;
  opts.push({ label: 'Do not play a card', h: 'noop' });
  ask(d.seat, 'bazaar', 'Play one of the cards you took for 1 fewer resource?', opts);
};
H.bazaarGo = d => startPlay(d.seat, d.id, 'hand', 'bazaar');

// ================= playing a card =================
function startPlay(seat, id, from, how, via) {
  const p = P(seat);
  if (from === 'hand') p.hand.splice(p.hand.indexOf(id), 1);
  else if (from === 'meadow') G.meadow[G.meadow.indexOf(id)] = -1;
  if (from !== 'limbo') G.limbo.push(id);
  use('play:' + key(id));
  now('pay', { seat, id, from, how, via });
}
H.pay = d => {
  const p = P(d.seat), c = def(d.id), cost = plain(c.cost); use('how:' + d.how);
  switch (d.how) {
    case 'occupy': { const e = ent(p, d.via); e.occ = true; lg(p.name + ' plays ' + c.name + ' free, occupying ' + cn(d.via) + '.'); now('afterPay', d); return; }
    case 'free': lg(p.name + ' plays ' + c.name + ' for free.'); now('afterPay', d); return;
    case 'pay': lg(p.name + ' plays ' + c.name + '.'); now('payRem', Object.assign({}, d, { rem: cost })); return;
    case 'innkeeper': {
      const e = removeFromCity(d.seat, d.via); G.discard.push(e.id); lg(p.name + ' sends ' + cn(e.id) + ' away to cut the price of ' + c.name + '.');
      cost.berry = Math.max(0, (cost.berry || 0) - 3); if (!cost.berry) delete cost.berry; now('payRem', Object.assign({}, d, { rem: cost })); return;
    }
    case 'crane': { const e = removeFromCity(d.seat, d.via); G.discard.push(e.id); lg(p.name + ' dismantles ' + cn(e.id) + ' to build ' + c.name + '.'); now('waive', Object.assign({}, d, { rem: cost, n: 3 })); return; }
    case 'dungeon': {
      const cands = dungeonPrisoners(d.seat, d.id);
      ask(d.seat, 'prisoner', 'Choose a critter to lock beneath the dungeon', cands.map(x => ({ label: 'Lock ' + cn(x.prisoner), card: x.prisoner, h: 'imprison', d: Object.assign({}, d, { dungeon: x.dungeon, prisoner: x.prisoner, rem: cost }) })));
      return;
    }
    case 'judge': {
      const sw = judgeSwaps(p.res, cost);
      ask(d.seat, 'judge', 'Choose which resource to swap', sw.map(x => ({ label: 'Pay 1 ' + rn(x.to, 1) + ' instead of 1 ' + rn(x.from, 1), h: 'payRem', d: Object.assign({}, d, { rem: x.cost }) })));
      return;
    }
    case 'inn': lg(p.name + ' plays ' + c.name + ' from the meadow.'); now('waive', Object.assign({}, d, { rem: cost, n: 3 })); return;
    case 'bazaar': lg(p.name + ' plays ' + c.name + '.'); now('waive', Object.assign({}, d, { rem: cost, n: 1 })); return;
  }
  throw new Error('bad how ' + d.how);
};
H.imprison = d => {
  const dn = ent(P(d.seat), d.dungeon); const e = removeFromCity(d.seat, d.prisoner);
  dn.pris.push(e.id); lg(P(d.seat).name + ' locks ' + cn(e.id) + ' beneath ' + cn(dn.id) + '.');
  now('waive', Object.assign({}, d, { n: 3 }));
};
H.waive = d => {
  const p = P(d.seat), rem = Object.assign({}, d.rem); let n = d.n;
  if (n >= rsum(rem)) { now('payRem', Object.assign({}, d, { rem: {}, n: 0 })); return; }
  for (const r of RES) { const sf = Math.max(0, (rem[r] || 0) - p.res[r]); if (sf > 0 && n > 0) { const x = Math.min(sf, n); rem[r] -= x; n -= x; } }
  if (n <= 0 || !rsum(rem)) { now('payRem', Object.assign({}, d, { rem, n: 0 })); return; }
  if (n >= rsum(rem)) { now('payRem', Object.assign({}, d, { rem: {}, n: 0 })); return; }
  const opts = [];
  for (const r of RES) if (rem[r] > 0) { const r2 = Object.assign({}, rem); r2[r]--; opts.push({ label: 'Do not pay 1 ' + rn(r, 1) + ' (' + n + ' left to cut)', res: r, h: 'waive', d: Object.assign({}, d, { rem: r2, n: n - 1 }) }); }
  ask(d.seat, 'waive', 'Choose which resources to cut from the price', opts);
};
H.payRem = d => {
  const p = P(d.seat), rem = plain(d.rem || {});
  payRes(d.seat, rem);
  if (rsum(rem)) lg(p.name + ' pays ' + rtxt(rem) + '.');
  if (key(d.id) === 'shepherd' && rsum(rem)) {
    const rc = resRecips(d.seat);
    if (rc.length) { pickRecip(d.seat, rc, 'Choose who receives the berries you paid', 'shepherdPaid', { seat: d.seat, rem }); }
    now('afterPay', d);
    return;
  }
  now('afterPay', d);
};
H.shepherdPaid = d => { if (d.to != null && d.to !== 'G') for (const r of RES) if (d.rem[r]) P(d.to).res[r] += d.rem[r]; };
H.afterPay = d => { if (d.from === 'meadow') refill(); now('place', d); };
H.place = d => {
  const s = d.seat, id = d.id, k = key(id), p = P(s);
  G.limbo.splice(G.limbo.indexOf(id), 1);
  if (k === 'fool') {
    if (G.grim) {
      G.discard.push(id); lg(p.name + ' plays ' + cn(id) + ' and dismisses a card from ' + DATA.soloName + "'s city."); use('fx:fool'); use('solo:fool');
      const gr = G.grim;
      now('afterPlay', { seat: s, id, own: false, noGrim: true });
      if (gr.city.length) ask(s, 'banish', 'Choose a card to remove from ' + DATA.soloName + "'s city", gr.city.map(x => ({ label: 'Remove ' + cn(x), card: x, h: 'grimRemove', d: { id: x } })));
      return;
    }
    const t = foolTargets(s);
    G.limbo.push(id);
    pickRecip(s, t, 'Choose whose city to plant the jester in', 'foolDo', { seat: s, id });
    return;
  }
  if (k === 'ruins') {
    const tg = p.city.filter(e => def(e.id).kind === 'construction' && key(e.id) !== 'ruins');
    G.limbo.push(id);
    ask(s, 'ruins', 'Choose a construction to raze', tg.map(e => ({ label: 'Raze ' + cn(e.id) + ' (regain ' + rtxt(def(e.id).cost) + ')', card: e.id, h: 'ruinsDo', d: { seat: s, id, target: e.id } })));
    return;
  }
  placeInCity(s, id);
  lg(p.name + ' adds ' + cn(id) + ' to their city.');
  now('onPlay', { seat: s, id });
  now('afterPlay', { seat: s, id, own: true });
};
H.grimRemove = d => { const gr = G.grim, i = gr.city.indexOf(d.id); if (i >= 0) { gr.city.splice(i, 1); G.discard.push(d.id); } };
H.foolDo = d => {
  const t = d.to; G.limbo.splice(G.limbo.indexOf(d.id), 1); use('fx:fool');
  placeInCity(t, d.id); lg(P(d.seat).name + ' plants ' + cn(d.id) + ' in ' + P(t).name + "'s city.");
  now('afterPlay', { seat: d.seat, id: d.id, own: false });
};
H.ruinsDo = d => {
  G.limbo.splice(G.limbo.indexOf(d.id), 1); use('fx:ruins');
  const e = removeFromCity(d.seat, d.target); G.discard.push(e.id);
  gain(d.seat, plain(def(e.id).cost));
  placeInCity(d.seat, d.id);
  lg(P(d.seat).name + ' razes ' + cn(e.id) + ' and builds ' + cn(d.id) + ' in its place.');
  now('draw', { seat: d.seat, n: 2 });
  now('afterPlay', { seat: d.seat, id: d.id, own: true });
};
H.onPlay = d => {
  const k = key(d.id); use('fx:' + k);
  if (PROD[k]) PROD[k](d.seat, d.seat, d.id, []);
  else if (ONPLAY[k]) ONPLAY[k](d.seat, d.id);
};
H.afterPlay = d => {
  const p = P(d.seat), c = def(d.id), list = [];
  for (const e of p.city) {
    if (e.id === d.id) continue;
    const k = key(e.id);
    if (k === 'historian') list.push(e.id);
    else if (k === 'shopkeeper' && c.kind === 'critter' && d.own) list.push(e.id);
    else if (k === 'courthouse' && c.kind === 'construction') list.push(e.id);
  }
  if (list.length) now('trig', { seat: d.seat, list });
  if (G.grim && !d.noGrim) now('grimPlay', { fromSeat: d.seat, id: d.id });
};
H.trig = d => {
  const list = d.list;
  if (!list.length) return;
  if (list.length === 1) { now('trigRun', { seat: d.seat, id: list[0] }); return; }
  ask(d.seat, 'trigger', 'Choose which triggered effect to resolve first', list.map(id => ({ label: cn(id) + ': ' + def(id).text, card: id, h: 'trigPick', d: { seat: d.seat, id, list } })));
};
H.trigPick = d => { now('trigRun', { seat: d.seat, id: d.id }); now('trig', { seat: d.seat, list: d.list.filter(x => x !== d.id) }); };
H.trigRun = d => {
  const k = key(d.id); use('fx:' + k);
  if (k === 'historian') now('draw', { seat: d.seat, n: 1 });
  else if (k === 'shopkeeper') gain(d.seat, { berry: 1 });
  else if (k === 'courthouse') ask(d.seat, 'resource', 'Choose a resource from the Mosswood Assize', ['twig', 'resin', 'pebble'].map(r => ({ label: 'Take 1 ' + rn(r, 1), res: r, h: 'gainOne', d: { seat: d.seat, r, n: 1 } })));
};

// ================= production / on-play effects =================
const farmCount = co => kcount(cityEntries(co), 'farm');
const PROD = {
  farm: s => gain(s, { berry: 1 }),
  general_store: (s, co) => gain(s, { berry: 1 + (farmCount(co) > 0 ? 1 : 0) }),
  mine: s => gain(s, { pebble: 1 }),
  resin_refinery: s => gain(s, { resin: 1 }),
  twig_barge: s => gain(s, { twig: 2 }),
  fair_grounds: s => now('draw', { seat: s, n: 2 }),
  husband: (s, co, eid) => { const e = cityEntries(co).find(x => x.id === eid); if (e && e.pair != null && farmCount(co) > 0) now('gainAny', { seat: s, n: 1 }); },
  barge_toad: (s, co) => gain(s, { twig: 2 * farmCount(co) }),
  chip_sweep: (s, co, eid, ch) => now('chipPick', { seat: s, ch: (ch || []).concat(['s' + eid]), self: eid }),
  doctor: s => now('payPts', { seat: s, res: 'berry', left: 3 }),
  woodcarver: s => now('payPts', { seat: s, res: 'twig', left: 3 }),
  monk: s => { const rc = resRecips(s); if (rc.length && P(s).res.berry > 0) pickRecip(s, rc, 'Choose who receives the berries', 'monkGive', { seat: s, left: 2 }); },
  peddler: s => now('peddle', { seat: s, left: 2, paid: 0 }),
  miner_mole: (s, co, eid, ch) => now('molePick', { seat: s, ch: (ch || []).concat(['m' + co + ':' + eid]) }),
  teacher: s => now('teach', { seat: s }),
  storehouse: (s, co, eid) => now('stock', { seat: s, eid }),
};
const SIMPLE = { farm: 1, general_store: 1, mine: 1, resin_refinery: 1, twig_barge: 1, barge_toad: 1, husband: 1 };
const ONPLAY = {
  bard: s => now('dLoop', { seat: s, max: 5, min: 0, count: 0, then: { h: 'thPts', d: { seat: s, per: 1 } }, title: 'Discard up to 5 cards (1 point token each)' }),
  postal_pigeon: s => now('pigeon', { seat: s }),
  ranger: s => now('rangerPick', { seat: s }),
  shepherd: s => { gain(s, { berry: 3 }); let t = 0; for (const e of P(s).city) if (key(e.id) === 'chapel') t += e.tok; if (t) { P(s).pts += t; lg(P(s).name + ' takes ' + t + ' point token(s).'); } },
  undertaker: s => now('undDisc', { seat: s, left: 3 }),
  wanderer: s => now('draw', { seat: s, n: 3 }),
};
function activateProduction(seat, ids) { now('prodAll', { seat, rest: ids || P(seat).city.filter(e => def(e.id).color === 'green').map(e => e.id) }); }
H.prodAll = d => {
  const p = P(d.seat);
  let rest = d.rest.filter(id => ent(p, id));
  const simple = rest.filter(id => SIMPLE[key(id)]);
  for (const id of simple) { use('fx:' + key(id)); PROD[key(id)](d.seat, d.seat, id, []); }
  rest = rest.filter(id => !SIMPLE[key(id)]);
  if (!rest.length) return;
  if (rest.length === 1) { now('prodRun', { seat: d.seat, id: rest[0] }); return; }
  ask(d.seat, 'production', 'Choose which production card to activate next', rest.map(id => ({ label: 'Activate ' + cn(id) + ': ' + def(id).text, card: id, h: 'prodPick', d: { seat: d.seat, id, rest } })));
};
H.prodPick = d => { now('prodRun', { seat: d.seat, id: d.id }); now('prodAll', { seat: d.seat, rest: d.rest.filter(x => x !== d.id) }); };
H.prodRun = d => { use('fx:' + key(d.id)); PROD[key(d.id)](d.seat, d.seat, d.id, []); };
H.chipPick = d => {
  const p = P(d.seat), opts = [];
  for (const e of p.city) { if (def(e.id).color !== 'green' || e.id === d.self || d.ch.indexOf('s' + e.id) >= 0 || d.ch.indexOf('m' + d.seat + ':' + e.id) >= 0 || !PROD[key(e.id)]) continue; opts.push({ label: 'Re-run ' + cn(e.id) + ': ' + def(e.id).text, card: e.id, h: 'chipGo', d: { seat: d.seat, id: e.id, ch: d.ch } }); }
  ask(d.seat, 'chip', 'Choose a production card to re-run', opts);
};
H.chipGo = d => { use('fx:' + key(d.id) + ':copied'); PROD[key(d.id)](d.seat, d.seat, d.id, d.ch); };
H.molePick = d => {
  const opts = [], seen = {};
  const scan = (co) => {
    for (const e of cityEntries(co)) {
      const c = def(e.id); if (c.color !== 'green' || c.key === 'storehouse' || !PROD[c.key]) continue;
      const tag = 'm' + co + ':' + e.id; if (d.ch.indexOf(tag) >= 0) continue;
      const sig = co + c.key + (e.pair != null ? 'p' : ''); if (seen[sig]) continue; seen[sig] = 1;
      opts.push({ label: 'Copy ' + c.name + " in " + pn(co) + "'s city: " + c.text, card: e.id, h: 'moleGo', d: { seat: d.seat, co, id: e.id, ch: d.ch } });
    }
  };
  for (let o = 0; o < G.np; o++) if (o !== d.seat) scan(o);
  if (G.grim) scan('G');
  ask(d.seat, 'mole', 'Choose a production card to mimic', opts);
};
H.moleGo = d => { use('fx:' + key(d.id) + ':mimicked'); const k = key(d.id); if (k === 'chip_sweep') PROD.chip_sweep(d.seat, d.seat, -1, d.ch.concat(['m' + d.co + ':' + d.id])); else PROD[k](d.seat, d.co, d.id, d.ch.concat(['m' + d.co + ':' + d.id])); };
H.payPts = d => {
  const p = P(d.seat);
  if (d.left <= 0 || p.res[d.res] < 1) return;
  ask(d.seat, 'spend', 'Spend ' + rn(d.res, 2) + ' for point tokens?', [
    { label: 'Spend 1 ' + rn(d.res, 1) + ' for 1 point token (' + d.left + ' left)', res: d.res, h: 'payPtsOne', d },
    { label: 'Stop here', h: 'noop' }]);
};
H.payPtsOne = d => { const p = P(d.seat); p.res[d.res]--; p.pts++; now('payPts', Object.assign({}, d, { left: d.left - 1 })); };
H.monkGive = d => {
  const p = P(d.seat);
  if (d.left <= 0 || p.res.berry < 1) return;
  ask(d.seat, 'give', 'Give a berry to ' + pn(d.to) + ' for 2 point tokens?', [
    { label: 'Give 1 berry to ' + pn(d.to) + ' and take 2 point tokens (' + d.left + ' left)', h: 'monkOne', d },
    { label: 'Stop here', h: 'noop' }]);
};
H.monkOne = d => { giveRes(d.seat, d.to, 'berry', 1); P(d.seat).pts += 2; now('monkGive', Object.assign({}, d, { left: d.left - 1 })); };
H.peddle = d => {
  const p = P(d.seat);
  const opts = [];
  if (d.left > 0) for (const r of RES) if (p.res[r] > 0) opts.push({ label: 'Trade away 1 ' + rn(r, 1), res: r, h: 'peddleOne', d: Object.assign({}, d, { r }) });
  if (!opts.length) { if (d.paid) now('gainAny', { seat: d.seat, n: d.paid }); return; }
  opts.push({ label: d.paid ? 'Done trading (take ' + d.paid + ' new resource(s))' : 'Do not trade', h: 'peddleDone', d });
  ask(d.seat, 'trade', 'Trade up to 2 resources for any 2 resources', opts);
};
H.peddleOne = d => { P(d.seat).res[d.r]--; now('peddle', { seat: d.seat, left: d.left - 1, paid: d.paid + 1 }); };
H.peddleDone = d => { if (d.paid) now('gainAny', { seat: d.seat, n: d.paid }); };
H.teach = d => {
  const p = P(d.seat);
  if (p.hand.length >= HAND) return;
  const a = []; for (let i = 0; i < 2; i++) { const c = deckTake(); if (c >= 0) a.push(c); }
  if (!a.length) return;
  G.limbo.push.apply(G.limbo, a); G.lpriv = d.seat;
  if (a.length === 1) { G.limbo.splice(G.limbo.indexOf(a[0]), 1); G.lpriv = -1; p.hand.push(a[0]); return; }
  ask(d.seat, 'teach', 'Choose the card to keep; the other goes to a rival', a.map(id => ({ label: 'Keep ' + cn(id), card: id, h: 'teachKeep', d: { seat: d.seat, keep: id, give: a.find(x => x !== id) } })));
};
H.teachKeep = d => {
  const p = P(d.seat); G.limbo.splice(G.limbo.indexOf(d.keep), 1);
  p.hand.push(d.keep);
  const rc = cardRecips(d.seat);
  pickRecip(d.seat, rc, 'Choose which rival receives the other card', 'teachGive', { seat: d.seat, card: d.give });
  lg(p.name + ' draws two cards, keeps one and hands one away.');
};
H.teachGive = d => { G.limbo.splice(G.limbo.indexOf(d.card), 1); G.lpriv = -1; giveCard(d.to, d.card); };
H.stock = d => {
  const e = ent(P(d.seat), d.eid); if (!e) return;
  ask(d.seat, 'stock', 'Choose a stack to put on the Hoard Cellar', [{ twig: 3 }, { resin: 2 }, { pebble: 1 }, { berry: 2 }].map(o => ({ label: 'Add ' + rtxt(o), h: 'stockDo', d: { seat: d.seat, eid: d.eid, o } })));
};
H.stockDo = d => { const e = ent(P(d.seat), d.eid); for (const r of RES) if (d.o[r]) e.stock[r] += d.o[r]; };
H.pigeon = d => {
  const a = []; for (let i = 0; i < 2; i++) { const c = deckTake(); if (c >= 0) a.push(c); }
  if (!a.length) return;
  G.limbo.push.apply(G.limbo, a);
  lg(P(d.seat).name + ' reveals ' + a.map(cn).join(' and ') + '.');
  now('pigeonPick', { seat: d.seat, a });
};
H.pigeonPick = d => {
  const opts = [];
  for (const id of d.a) if (def(id).pts <= 3 && placeable(d.seat, id, null)) opts.push({ label: 'Play ' + cn(id) + ' for free', card: id, h: 'pigeonPlay', d: { seat: d.seat, a: d.a, id } });
  opts.push({ label: 'Play neither (discard both)', h: 'pigeonNone', d });
  ask(d.seat, 'pigeon', 'Play one of the revealed cards for free?', opts);
};
H.pigeonNone = d => { for (const id of d.a) { G.limbo.splice(G.limbo.indexOf(id), 1); G.discard.push(id); } };
H.pigeonPlay = d => { for (const id of d.a) if (id !== d.id) { G.limbo.splice(G.limbo.indexOf(id), 1); G.discard.push(id); } startPlay(d.seat, d.id, 'limbo', 'free'); };
H.rangerPick = d => {
  const p = P(d.seat), opts = [];
  p.dep.forEach((pl, j) => {
    if (pl.perm || pl.k === 'event') return;
    const saved = p.dep.splice(j, 1)[0];
    const alt = locOpts(d.seat).filter(l => !sameLoc(l, saved));
    p.dep.splice(j, 0, saved);
    if (alt.length) opts.push({ label: 'Move the worker at ' + locLabel(pl), h: 'rangerTo', d: { seat: d.seat, j } });
  });
  opts.push({ label: 'Do not move a worker', h: 'noop' });
  ask(d.seat, 'ranger', 'Choose a deployed worker to relocate', opts);
};
const sameLoc = (a, b) => a.k === b.k && a.i === b.i && a.c === b.c && a.e === b.e;
H.rangerTo = d => {
  const p = P(d.seat), saved = p.dep.splice(d.j, 1)[0];
  const alt = locOpts(d.seat).filter(l => !sameLoc(l, saved));
  if (!alt.length) { p.dep.splice(d.j, 0, saved); return; }
  ask(d.seat, 'ranger', 'Choose where to place the worker', alt.map(l => ({ label: 'Move to ' + l.label, h: 'rangerPlace', d: { seat: d.seat, loc: l } })));
};
H.rangerPlace = d => { lg(P(d.seat).name + ' relocates a worker to ' + locLabel(d.loc) + '.'); placeAt(d.seat, d.loc); };
H.undDisc = d => {
  const c = meadowCards();
  if (d.left <= 0 || !c.length) { refill(); now('mtake', { seat: d.seat, left: 1, opt: false, taken: [], title: 'Take one card from the meadow' }); return; }
  ask(d.seat, 'clear', 'Choose a meadow card to clear (' + d.left + ' left)', c.map(id => ({ label: 'Clear ' + cn(id), card: id, h: 'undGo', d: { seat: d.seat, left: d.left, id } })));
};
H.undGo = d => { G.meadow[G.meadow.indexOf(d.id)] = -1; G.discard.push(d.id); now('undDisc', { seat: d.seat, left: d.left - 1 }); };

// ================= destinations =================
function destFx(s, l) {
  const e = l.o === 'G' ? { id: l.c, stock: null, tok: 0 } : ent(P(l.o), l.c);
  const k = key(l.c); use('visit:' + k);
  if (l.o !== s) { if (l.o === 'G') G.grim.pts++; else P(l.o).pts++; lg(pn(s) + ' pays ' + pn(l.o) + ' 1 point token to visit.'); }
  switch (k) {
    case 'inn': now('innPick', { seat: s }); break;
    case 'post_office': {
      const rc = cardRecips(s);
      pickRecip(s, rc, 'Choose which rival receives your cards', 'poGive', { seat: s, left: 2 });
      break;
    }
    case 'queen': {
      const c = queenCands(s);
      ask(s, 'queen', 'Choose a card worth up to 3 points to play for free', c.map(x => ({ label: 'Play ' + cn(x.id) + ' for free (' + (x.from === 'hand' ? 'from hand' : 'from the meadow') + ')', card: x.id, h: 'queenGo', d: { seat: s, id: x.id, from: x.from } })));
      break;
    }
    case 'cemetery': ask(s, 'cemetery', 'Reveal four cards from the deck or the discard pile?', [
      { label: 'Reveal 4 from the deck', h: 'cemReveal', d: { seat: s, src: 'deck' } },
      { label: 'Reveal 4 from the top of the discard pile', h: 'cemReveal', d: { seat: s, src: 'discard' } }]); break;
    case 'chapel': e.tok++; lg(P(s).name + ' adds a point token to the shrine (' + e.tok + ').'); now('draw', { seat: s, n: 2 * e.tok }); break;
    case 'lookout': now('copyLoc', { seat: s }); break;
    case 'monastery': {
      const rc = resRecips(s); pickRecip(s, rc, 'Choose which rival receives your resources', 'cloGive', { seat: s, left: 2 }); P(s).pts += 4; lg(P(s).name + ' takes 4 point tokens.'); break;
    }
    case 'university': {
      const p = P(s);
      ask(s, 'university', 'Choose a card to disband', p.city.filter(x => x.id !== l.c).map(x => ({ label: 'Disband ' + cn(x.id) + ' (regain ' + rtxt(def(x.id).cost) + ')', card: x.id, h: 'uniGo', d: { seat: s, id: x.id, uni: l.c } })));
      break;
    }
    case 'storehouse': { const t = e.stock; gain(s, t); lg(P(s).name + ' hauls away ' + rtxt(t) + '.'); e.stock = newRes(); break; }
  }
}
H.innPick = d => {
  const c = innCands(d.seat);
  ask(d.seat, 'inn', 'Choose a meadow card to play for 3 fewer resources', c.map(id => ({ label: 'Play ' + cn(id) + ' (cost ' + rtxt(def(id).cost) + ', minus 3)', card: id, h: 'innGo', d: { seat: d.seat, id } })));
};
H.innGo = d => startPlay(d.seat, d.id, 'meadow', 'inn');
H.queenGo = d => startPlay(d.seat, d.id, d.from, 'free');
H.poGive = d => {
  const p = P(d.seat);
  if (d.left <= 0) { now('dLoop', { seat: d.seat, max: 99, min: 0, count: 0, then: { h: 'poRefill', d: { seat: d.seat } }, title: 'Discard any other cards from your hand, then refill to 8' }); return; }
  if (!p.hand.length) { now('poGive', Object.assign({}, d, { left: 0 })); return; }
  ask(d.seat, 'give', 'Choose a card to give away (' + d.left + ' to go)', p.hand.map(id => ({ label: 'Give ' + cn(id), card: id, h: 'poOne', d: Object.assign({}, d, { id }) })));
};
H.poOne = d => { const p = P(d.seat); p.hand.splice(p.hand.indexOf(d.id), 1); giveCard(d.to, d.id); lg(p.name + ' gives a card to ' + (d.to == null ? 'nobody (discarded)' : pn(d.to)) + '.'); now('poGive', { seat: d.seat, to: d.to, left: d.left - 1 }); };
H.poRefill = d => { draw(d.seat, HAND - P(d.seat).hand.length); };
H.cemReveal = d => {
  const a = [];
  if (d.src === 'deck') { for (let i = 0; i < 4; i++) { const c = deckTake(); if (c >= 0) a.push(c); } }
  else { for (let i = 0; i < 4 && G.discard.length; i++) a.push(G.discard.pop()); }
  if (!a.length) return;
  G.limbo.push.apply(G.limbo, a);
  lg(P(d.seat).name + ' reveals ' + a.map(cn).join(', ') + '.');
  const opts = [];
  for (const id of a) if (placeable(d.seat, id, null)) opts.push({ label: 'Play ' + cn(id) + ' for free', card: id, h: 'cemPlay', d: { seat: d.seat, a, id } });
  opts.push({ label: 'Play none (discard all)', h: 'cemNone', d: { a } });
  ask(d.seat, 'cemetery', 'Choose a revealed card to play for free', opts);
};
H.cemNone = d => { for (const id of d.a) { G.limbo.splice(G.limbo.indexOf(id), 1); G.discard.push(id); } };
H.cemPlay = d => { for (const id of d.a) if (id !== d.id) { G.limbo.splice(G.limbo.indexOf(id), 1); G.discard.push(id); } startPlay(d.seat, d.id, 'limbo', 'free'); };
H.cloGive = d => {
  const p = P(d.seat);
  if (d.left <= 0 || resTotal(p) < 1) return;
  ask(d.seat, 'give', 'Choose a resource to give to ' + (d.to == null ? 'nobody' : pn(d.to)) + ' (' + d.left + ' to go)', RES.filter(r => p.res[r] > 0).map(r => ({ label: 'Give 1 ' + rn(r, 1), res: r, h: 'cloOne', d: Object.assign({}, d, { r }) })));
};
H.cloOne = d => { giveRes(d.seat, d.to, d.r, 1); now('cloGive', { seat: d.seat, to: d.to, left: d.left - 1 }); };
H.uniGo = d => {
  const e = removeFromCity(d.seat, d.id, { moveTo: d.uni }); G.discard.push(e.id);
  const c = def(e.id); gain(d.seat, plain(c.cost)); P(d.seat).pts += 1;
  lg(P(d.seat).name + ' disbands ' + c.name + ' at the college.');
  now('gainAny', { seat: d.seat, n: 1 });
};

// ================= events =================
H.claimEv = d => {
  const s = d.seat, p = P(s);
  if (d.e === 'b') { const ev = G.bev[d.i]; ev.o = s; use('bev:' + DATA.basicEvents[ev.k].key); lg(p.name + ' achieves ' + DATA.basicEvents[ev.k].name + '.'); return; }
  const ev = G.sev[d.i], sp = DATA.specialEvents[ev.k]; ev.o = s; use('sev:' + sp.key); lg(p.name + ' achieves ' + sp.name + '.');
  const f = EVFX[sp.key]; if (f) f(s, ev, d.i);
};
const EVFX = {
  sev_grand_market_scheme: s => now('mktGive', { seat: s, left: 3 }),
  sev_hurry_scurry_dash: s => now('recallOne', { seat: s }),
  sev_night_of_sparklers: (s, ev, i) => now('stackN', { seat: s, i, r: 'twig' }),
  sev_lost_parchments_unearthed: (s, ev, i) => { const a = []; for (let k = 0; k < 5; k++) { const c = deckTake(); if (c >= 0) a.push(c); } G.limbo.push.apply(G.limbo, a); ev.hid = true; now('scroll', { seat: s, i, a }); },
  sev_acorn_bandits_seized: (s, ev, i) => now('acornTuck', { seat: s, i, left: 2 }),
  sev_marsh_fever_remedy: (s, ev, i) => { P(s).res.berry -= 2; now('cityDisc', { seat: s, left: 2 }); },
  sev_commencement_of_pupils: (s, ev, i) => { ev.hid = true; now('gradTuck', { seat: s, i, left: 3 }); },
  sev_resident_minstrel: (s, ev, i) => now('stackN', { seat: s, i, r: 'berry' }),
  sev_gilded_shrine_vault: s => { let t = 0; for (const e of P(s).city) if (key(e.id) === 'chapel') t += e.tok; if (t) { now('draw', { seat: s, n: t }); now('gainAny', { seat: s, n: t }); } },
  sev_toll_holiday: s => activateProduction(s),
  sev_change_of_proprietors: (s, ev, i) => now('stackAny', { seat: s, i, left: 3 }),
};
H.mktGive = d => {
  const p = P(d.seat), rc = resRecips(d.seat), opts = [];
  if (d.left > 0) for (const t of rc) for (const r of RES) if (p.res[r] > 0) opts.push({ label: 'Give 1 ' + rn(r, 1) + ' to ' + pn(t) + ' and take 2 point tokens', res: r, h: 'mktOne', d: { seat: d.seat, to: t, r, left: d.left } });
  if (!opts.length) return;
  opts.push({ label: 'Stop giving', h: 'noop' });
  ask(d.seat, 'give', 'Give up to ' + d.left + ' more resources to rivals (2 point tokens each)', opts);
};
H.mktOne = d => { giveRes(d.seat, d.to, d.r, 1); P(d.seat).pts += 2; now('mktGive', { seat: d.seat, left: d.left - 1 }); };
H.recallOne = d => {
  const p = P(d.seat), opts = [];
  p.dep.forEach((pl, j) => { if (pl.perm) return; opts.push({ label: 'Recall the worker at ' + locLabel(pl), h: 'recallGo', d: { seat: d.seat, j } }); });
  ask(d.seat, 'recall', 'Choose a deployed worker to return to your hand', opts);
};
H.recallGo = d => { P(d.seat).dep.splice(d.j, 1); };
H.stackN = d => {
  const p = P(d.seat), mx = Math.min(3, p.res[d.r]), opts = [];
  for (let n = mx; n >= 0; n--) opts.push({ label: n ? 'Place ' + n + ' ' + rn(d.r, n) + ' on the event' : 'Place none', h: 'stackDo', d: { i: d.i, seat: d.seat, r: d.r, n } });
  ask(d.seat, 'stack', 'How many ' + rn(d.r, 2) + ' do you place on the event?', opts);
};
H.stackDo = d => { P(d.seat).res[d.r] -= d.n; G.sev[d.i].stock[d.r] += d.n; };
H.stackAny = d => {
  const p = P(d.seat);
  if (d.left <= 0 || resTotal(p) < 1) return;
  const opts = RES.filter(r => p.res[r] > 0).map(r => ({ label: 'Place 1 ' + rn(r, 1) + ' on the event', res: r, h: 'stackOne', d: { seat: d.seat, i: d.i, r, left: d.left } }));
  opts.push({ label: 'Stop placing', h: 'noop' });
  ask(d.seat, 'stack', 'Place up to ' + d.left + ' more resources on the event', opts);
};
H.stackOne = d => { P(d.seat).res[d.r]--; G.sev[d.i].stock[d.r]++; now('stackAny', { seat: d.seat, i: d.i, left: d.left - 1 }); };
H.scroll = d => {
  if (!d.a.length) { return; }
  const id = d.a[0], p = P(d.seat), opts = [];
  if (p.hand.length < HAND) opts.push({ label: 'Keep it in your hand', h: 'scrollKeep', d });
  opts.push({ label: 'Tuck it beneath the event (1 point)', h: 'scrollTuck', d });
  G.lpriv = d.seat;
  ask(d.seat, 'scroll', 'A revealed card: keep it or tuck it beneath the event?', opts);
};
H.scrollKeep = d => { const id = d.a[0]; G.limbo.splice(G.limbo.indexOf(id), 1); P(d.seat).hand.push(id); G.lpriv = -1; now('scroll', { seat: d.seat, i: d.i, a: d.a.slice(1) }); };
H.scrollTuck = d => { const id = d.a[0]; G.limbo.splice(G.limbo.indexOf(id), 1); G.sev[d.i].tuck.push(id); G.lpriv = -1; now('scroll', { seat: d.seat, i: d.i, a: d.a.slice(1) }); };
H.acornTuck = d => {
  const p = P(d.seat);
  if (d.left <= 0) return;
  const opts = p.city.filter(e => def(e.id).kind === 'critter').map(e => ({ label: 'Tuck ' + cn(e.id) + ' beneath the event (3 points)', card: e.id, h: 'acornDo', d: { seat: d.seat, i: d.i, id: e.id, left: d.left } }));
  if (!opts.length) return;
  opts.push({ label: 'Stop tucking', h: 'noop' });
  ask(d.seat, 'tuck', 'Tuck up to ' + d.left + ' critters from your city', opts);
};
H.acornDo = d => { const e = removeFromCity(d.seat, d.id); G.sev[d.i].tuck.push(e.id); now('acornTuck', { seat: d.seat, i: d.i, left: d.left - 1 }); };
H.gradTuck = d => {
  const p = P(d.seat);
  if (d.left <= 0) return;
  const opts = p.hand.filter(id => def(id).kind === 'critter').map(id => ({ label: 'Tuck ' + cn(id) + ' beneath the event (2 points)', card: id, h: 'gradDo', d: { seat: d.seat, i: d.i, id, left: d.left } }));
  if (!opts.length) return;
  opts.push({ label: 'Stop tucking', h: 'noop' });
  ask(d.seat, 'tuck', 'Tuck up to ' + d.left + ' critters from your hand', opts);
};
H.gradDo = d => { const p = P(d.seat); p.hand.splice(p.hand.indexOf(d.id), 1); G.sev[d.i].tuck.push(d.id); now('gradTuck', { seat: d.seat, i: d.i, left: d.left - 1 }); };
H.cityDisc = d => {
  const p = P(d.seat);
  if (d.left <= 0 || !p.city.length) return;
  ask(d.seat, 'cityDisc', 'Discard ' + d.left + ' more card(s) from your city', p.city.map(e => ({ label: 'Discard ' + cn(e.id), card: e.id, h: 'cityDiscDo', d: { seat: d.seat, id: e.id, left: d.left } })));
};
H.cityDiscDo = d => { const e = removeFromCity(d.seat, d.id); G.discard.push(e.id); now('cityDisc', { seat: d.seat, left: d.left - 1 }); };

// ================= seasons =================
H.prepare = d => { now('prepClock', d); now('prepRecall', d); };
H.prepClock = d => {
  const p = P(d.seat), t = p.city.find(e => key(e.id) === 'clock_tower' && e.tok > 0);
  if (!t) return;
  const opts = [], seen = {};
  for (const pl of p.dep) { if (pl.perm || (pl.k !== 'basic' && pl.k !== 'forest')) continue; const tg = pl.k + pl.i; if (seen[tg]) continue; seen[tg] = 1; opts.push({ label: 'Spend a token: repeat ' + locLabel(pl), h: 'clockUse', d: { seat: d.seat, loc: { k: pl.k, i: pl.i }, tower: t.id } }); }
  if (!opts.length) return;
  opts.push({ label: 'Do not use ' + cn(t.id), h: 'noop' });
  ask(d.seat, 'clock', 'Spend a token to repeat a location before recalling workers?', opts);
};
H.clockUse = d => { const t = ent(P(d.seat), d.tower); t.tok--; use('fx:clock_tower'); now('activate', { seat: d.seat, loc: d.loc }); };
H.prepRecall = d => {
  const p = P(d.seat);
  p.dep = p.dep.filter(pl => pl.perm);
  const gn = [1, 1, 2][p.season]; p.season++; p.workers += gn;
  use('season:' + p.season);
  if (p.season === 2) now('mtake', { seat: d.seat, left: 2, opt: true, taken: [], title: 'Summer: take up to 2 cards from the meadow' });
  else activateProduction(d.seat);
  if (G.grim) now('grimPrep', { season: p.season });
};

// ================= solo opponent =================
H.grimPlay = d => {
  const gr = G.grim, slot = rnd(8), id = G.meadow[slot];
  use('solo:roll');
  if (id < 0) { lg(DATA.soloName + ' rolls ' + (slot + 1) + ' but finds no card.'); return; }
  const k = key(id);
  if (k === 'fool') {
    const p = P(0);
    if (cityCount(p) >= CITY || hasKey(p, 'fool')) { lg(DATA.soloName + ' rolls ' + (slot + 1) + ' (' + cn(id) + ') but cannot place it.'); return; }
    G.meadow[slot] = -1; placeInCity(0, id); lg(DATA.soloName + ' plants ' + cn(id) + ' in your city.'); refill(); return;
  }
  G.meadow[slot] = -1; gr.city.push(id); lg(DATA.soloName + ' rolls ' + (slot + 1) + ' and plays ' + cn(id) + '.'); refill();
};
H.grimPrep = d => {
  const gr = G.grim, s = d.season;
  grimClaimBasic();
  for (const x of (s === 1 ? [0] : s === 2 ? [1] : [2, 3])) if (gr.mb.indexOf(x) < 0) gr.mb.push(x);
  if (s < 3) { gr.fi = (gr.fi + 1) % G.forest.length; gr.bi = s === 1 ? 6 : 3; }
  else {
    gr.fi = -1; gr.ji = 3 - gr.diff;
    if (gr.diff === 3) { gr.bi = -1; const p = P(0); p.workers -= 1; p.lost += 1; lg(DATA.soloName + ' sends one of your workers away for good.'); }
    else gr.bi = 1;
  }
  lg(DATA.soloName + ' prepares for ' + SEASONS[s] + '.');
};

// ================= views / helpers for UI & AI =================
function stripView(g, seat) {
  const v = clone(g);
  v.rng = 0; v.seed = 0; v.ag = [];
  v.players.forEach((p, i) => { if (i !== seat) p.hand = p.hand.map(() => -1); });
  v.deck = v.deck.map(() => -1);
  if (v.lpriv >= 0 && v.lpriv !== seat) v.limbo = v.limbo.map(() => -1);
  for (const e of v.sev) if (e.hid && !(e.o === seat)) e.tuck = e.tuck.map(() => -1);
  if (v.q && v.q.who !== seat) v.q = { who: v.q.who, kind: v.q.kind, title: v.q.title, opts: [] };
  return v;
}
function status(g) { // quick public summary for UI
  return withG(g, () => ({ actor: actor(g), phase: g.phase, turn: g.turn, cur: g.cur, season: g.players.map(p => p.season) }));
}
function describe(g, m) { return m && m.label || ''; }
function cardCount(g) {
  let n = g.deck.length + g.discard.length + g.limbo.length;
  for (const c of g.meadow) if (c >= 0) n++;
  for (const p of g.players) { n += p.hand.length; for (const e of p.city) n += 1 + e.pris.length; }
  for (const e of g.sev) n += e.tuck.length;
  if (g.grim) n += g.grim.city.length;
  return n;
}
function checkInvariants(g) {
  const err = [];
  const seen = new Set();
  const add = (id, where) => { if (id < 0) { if (where !== 'meadow') err.push('hidden card id in ' + where); return; } if (seen.has(id)) err.push('duplicate card ' + id + ' at ' + where); seen.add(id); };
  g.deck.forEach(id => add(id, 'deck')); g.discard.forEach(id => add(id, 'discard')); g.limbo.forEach(id => add(id, 'limbo'));
  g.meadow.forEach(id => { if (id >= 0) add(id, 'meadow'); });
  g.players.forEach((p, s) => {
    p.hand.forEach(id => add(id, 'hand' + s));
    for (const e of p.city) { add(e.id, 'city' + s); e.pris.forEach(id => add(id, 'pris' + s)); }
    for (const r of RES) if (p.res[r] < 0) err.push('negative ' + r + ' seat ' + s);
    if (p.hand.length > HAND) err.push('hand over limit seat ' + s);
    if (cityCount(p) > CITY) err.push('city over limit seat ' + s + ' (' + cityCount(p) + ')');
    if (p.dep.length > p.workers) err.push('more deployed workers than owned seat ' + s);
    const maxW = 2 + [0, 1, 2, 4][p.season];
    if (p.workers + p.lost !== maxW && !(g.grim && g.grim.diff === 3 && p.workers + p.lost === maxW)) err.push('worker count off seat ' + s + ': ' + p.workers + '+' + p.lost + ' vs ' + maxW);
    for (const e of p.city) { if (e.tok < 0) err.push('negative tokens'); if (e.pair != null) { const o = p.city.find(x => x.id === e.pair); if (!o || o.pair !== e.id) err.push('broken pair seat ' + s); } }
    if (p.pts < 0) err.push('negative points');
    for (const pl of p.dep) { if (pl.k === 'dest' && pl.c >= 0 && pl.perm) { const owner = pl.o === 'G' ? null : g.players[pl.o]; if (owner && !owner.city.some(e => e.id === pl.c)) err.push('permanent worker on missing card'); } }
  });
  g.sev.forEach(e => { e.tuck.forEach(id => add(id, 'tuck')); for (const r of RES) if (e.stock[r] < 0) err.push('negative stock'); });
  if (g.grim) g.grim.city.forEach(id => add(id, 'grim'));
  if (seen.size !== NCARDS) err.push('card count ' + seen.size + ' != ' + NCARDS);
  // occupancy: exclusive spots hold one worker; forest holds <= slots
  const occ = {};
  for (const p of g.players) for (const pl of p.dep) { const k = pl.k + ':' + (pl.i != null ? pl.i : pl.c); occ[k] = (occ[k] || 0) + 1; }
  DATA.basic.forEach((b, i) => { if (!b.shared && (occ['basic:' + i] || 0) + ((g.grim && g.grim.bi === i) ? 1 : 0) > 1) err.push('exclusive basic overfull ' + i); });
  g.forest.forEach((f, i) => { if ((occ['forest:' + i] || 0) + ((g.grim && g.grim.fi === i) ? 1 : 0) > (g.np === 4 ? 2 : 1)) err.push('forest overfull ' + i); });
  return err;
}

Object.assign(HB, {
  newGame, moves, apply, stripView, score, actor, status, clone, checkInvariants, cardCount,
  grimScore: g => withG(g, grimScore),
  cardOf: id => def(id), cardKey: key, cardName: cn, NCARDS, HAND, CITY, RES, SEASONS,
  cityCount: (g, seat) => withG(g, () => cityCount(P(seat))),
  // internals the AI and tests use
  _: { withG, locOpts, howOptions, placeable, occTargets, rnd, shuffle, lg, now, flow, ask, H, PROD, startPlay, placeInCity, evOK, destOK, availW, deckTake, draw, refill, cityEntries, grimScore, scoreOf, resRecips, sevScore, FOREST, EVFX, ent, def, key, cn, rsum, afford, dungeonPrisoners, judgeSwaps, queenCands, innCands, activateProduction, removeFromCity, getG: () => G },
});
if (typeof module === 'object' && module.exports) module.exports = HB;
})(typeof globalThis !== 'undefined' ? globalThis : this);

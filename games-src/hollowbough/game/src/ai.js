// ===================== Hollowbough computer players =====================
// HB.AI.choose(G, seat, level?) -> one of HB.moves(G, seat)   (level 'easy' | 'normal' | 'hard'; default G.players[seat].ai)
// The AI never reads hidden information: it builds a "world" in which every card the seat cannot see is re-dealt at random
// (seeded from public data only), then evaluates moves by simulating them in that world.
(function (g) {
'use strict';
const HB = g.HB || (typeof require === 'function' ? require('./engine.js') : null);
const D = HB.DATA, X = HB._, NC = HB.NCARDS, RES = HB.RES;
const key = HB.cardKey, cn = HB.cardName, def = HB.cardOf;
const nowMs = () => (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

// ---------- rng from public data ----------
function mkRng(seed) { let s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function seedOf(G, seat) {
  let h = 2166136261; const mix = v => { h ^= (v + 0x9e3779b9) | 0; h = Math.imul(h, 16777619); };
  mix(G.turn); mix(seat); mix(G.logN || 0); mix(G.discard.length); mix(G.deck.length);
  for (const id of G.players[seat].hand) mix(id + 1);
  mix(G.q ? G.q.opts.length : 0); mix(G.q ? G.q.kind.length : 0);
  return h >>> 0;
}
function shuf(a, rng) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
const clone = o => JSON.parse(JSON.stringify(o));

// ---------- a world: the game as this seat can know it, hidden cards re-dealt at random ----------
function world(G, seat, rng) {
  const W = clone(G);
  W.nolog = true; W.log = []; W.seed = 0;
  W.players.forEach((p, i) => { if (i !== seat) p.hand = p.hand.map(() => -1); });
  W.deck = W.deck.map(() => -1);
  if (W.lpriv >= 0 && W.lpriv !== seat) W.limbo = W.limbo.map(() => -1);
  for (const e of W.sev) if (e.hid && e.o !== seat) e.tuck = e.tuck.map(() => -1);
  const seen = new Uint8Array(NC), mark = id => { if (id >= 0) seen[id] = 1; };
  W.players.forEach(p => { p.hand.forEach(mark); p.city.forEach(e => { mark(e.id); e.pris.forEach(mark); }); });
  W.discard.forEach(mark); W.meadow.forEach(mark); W.limbo.forEach(mark); W.sev.forEach(e => e.tuck.forEach(mark));
  if (W.grim) W.grim.city.forEach(mark);
  const un = []; for (let i = 0; i < NC; i++) if (!seen[i]) un.push(i);
  shuf(un, rng); let k = 0; const fill = a => a.map(x => x < 0 ? un[k++] : x);
  W.players.forEach((p, i) => { if (i !== seat) p.hand = fill(p.hand); });
  W.limbo = fill(W.limbo); W.sev.forEach(e => { e.tuck = fill(e.tuck); }); W.deck = fill(W.deck);
  W.rng = Math.floor(rng() * 2147483647);
  return W;
}

// ---------- evaluation ----------
const RV = { twig: 0.24, resin: 0.40, pebble: 0.52, berry: 0.34 };
const SEASONF = [0.7, 0.6, 0.5, 0.3];
// rough worth of achieving each special event (points + effect) and the extra growth expected after it is owned
const EVV = { sev_grand_market_scheme: 6, sev_hurry_scurry_dash: 5.5, sev_night_of_sparklers: 5, sev_lost_parchments_unearthed: 4, sev_acorn_bandits_seized: 3.5, sev_marsh_fever_remedy: 2.5, sev_wingborne_healers: 3, sev_commencement_of_pupils: 4.5, sev_counsel_for_scoundrels: 3, sev_pilgrims_trail: 4, sev_resident_minstrel: 5, sev_gilded_shrine_vault: 5, sev_vigil_of_remembrance: 4, sev_toll_holiday: 6, sev_grand_hollow_games: 9, sev_change_of_proprietors: 5 };
const EVX = { sev_counsel_for_scoundrels: 2, sev_pilgrims_trail: 2.5, sev_vigil_of_remembrance: 2.5, sev_wingborne_healers: 1 };
const remProd = p => p.season === 0 ? 2 : p.season < 3 ? 1 : 0;
const farms = p => { let n = 0; for (const e of p.city) if (key(e.id) === 'farm') n++; return n; };
const costVal = c => { let v = 0; for (const r of RES) v += (c[r] || 0) * RV[r]; return v; };
function extraVal(k, e, p, rem) {
  const nf = farms(p), fut = p.season < 3 ? 3 : 1.2, vis = p.season < 3 ? 1 : 0.6;
  switch (k) {
    case 'farm': return 0.5 * rem;
    case 'general_store': return (0.5 + (nf ? 0.5 : 0)) * rem;
    case 'mine': return 0.8 * rem; case 'resin_refinery': return 0.55 * rem; case 'twig_barge': return 0.6 * rem;
    case 'barge_toad': return 0.6 * nf * rem + 0.2;
    case 'fair_grounds': return 1.4 * rem;
    case 'husband': return e.pair != null && nf ? 0.55 * rem : 0;
    case 'chip_sweep': return 0.8 * rem; case 'doctor': return 1.3 * rem; case 'woodcarver': return 1.1 * rem;
    case 'monk': return 1.6 * rem; case 'peddler': return 0.4 * rem; case 'teacher': return 0.8 * rem; case 'miner_mole': return 0.9 * rem;
    case 'storehouse': { let s = 0; if (e.stock) for (const r of RES) s += e.stock[r] * RV[r]; return 1.0 * rem + s * 0.9; }
    case 'historian': return 0.7 * fut; case 'shopkeeper': return 0.5 * fut; case 'courthouse': return 0.5 * fut * 0.7;
    case 'judge': return 1.5; case 'crane': return 1.4; case 'dungeon': return 1.4; case 'innkeeper': return 1.1;
    case 'clock_tower': return e.tok * 0.6;
    case 'chapel': return 1.5 * vis; case 'inn': return 1.8 * vis; case 'post_office': return 1.0 * vis; case 'queen': return 2.5 * vis;
    case 'cemetery': return 3.0 * vis; case 'lookout': return 1.8 * vis; case 'monastery': return 3.0 * vis; case 'university': return 1.5 * vis;
  }
  return 0;
}
const pe = { pair: null, tok: 0, stock: null };
function projBonus(k, p) {
  const cc = (pred) => { let n = 0; for (const e of p.city) if (pred(def(e.id))) n++; return n; };
  switch (k) {
    case 'castle': return cc(c => c.kind === 'construction' && !c.unique) + 2;
    case 'palace': return cc(c => c.kind === 'construction' && c.unique) + 2;
    case 'school': return cc(c => c.kind === 'critter' && !c.unique) + 2;
    case 'theater': return cc(c => c.kind === 'critter' && c.unique) + 2;
    case 'ever_tree': return cc(c => c.color === 'purple') + 2;
    case 'king': return 3;
    case 'architect': return Math.min(6, p.res.resin + p.res.pebble) + 1;
    case 'wife': return p.city.some(e => key(e.id) === 'husband' && e.pair == null) ? 3 : 1.2;
  }
  return 0;
}
// value of owning card id in the city of player p (beyond what score() counts for cards already there)
function cardVal(W, p, id) {
  const c = def(id);
  if (c.unique && p.city.some(e => key(e.id) === c.key)) return 0;
  return c.pts + extraVal(c.key, pe, p, remProd(p)) + projBonus(c.key, p);
}
const COLORKEY = { production: 'green', destination: 'red', governance: 'blue', traveler: 'tan' };
function colorN(p, color) { let n = 0; for (const e of p.city) if (def(e.id).color === color) n++; return n; }
function pubVal(W, i) { // cheap public value of an opponent seat
  const p = W.players[i]; const s = HB.score(W, i); let v = s.total; const rem = remProd(p);
  for (const e of p.city) v += extraVal(key(e.id), e, p, rem);
  return v + 0.45 * p.hand.length + 0.25 * (p.res.twig + p.res.resin + p.res.pebble + p.res.berry);
}
function V(W, seat, noOpp) {
  const p = W.players[seat], s = HB.score(W, seat), rem = remProd(p);
  let v = s.total;
  for (const e of p.city) v += extraVal(key(e.id), e, p, rem);
  // hand
  const need = { twig: 0, resin: 0, pebble: 0, berry: 0 };
  for (const id of p.hand) {
    const c = def(id), cost = c.cost; let tot = 0, got = 0;
    for (const r of RES) { const n = cost[r] || 0; tot += n; got += Math.min(n, p.res[r]); need[r] += n; }
    const aff = tot ? got / tot : 1;
    const cv = cardVal(W, p, id);
    v += (cv <= 0 ? 0.1 : 0.25 + 0.5 * aff * cv) * SEASONF[p.season];
  }
  for (const r of RES) v += (RV[r] * Math.min(p.res[r], need[r] + 2) + 0.03 * Math.max(0, p.res[r] - need[r] - 2)) * SEASONF[p.season] / 0.7 * 0.8;
  v += 0.3 * (p.workers - p.dep.length);
  // events
  const grimPer = W.grim ? (W.grim.diff === 1 ? 3 : 6) : 0.8;
  for (const e of W.bev) if (e.o === -1) { const nd = D.basicEvents[e.k].need; for (const c in nd) { const pr = Math.min(colorN(p, COLORKEY[c]), nd[c]) / nd[c]; v += (1.65 + (W.grim ? 0.5 : 0)) * pr * pr; } }
  for (const e of W.sev) {
    const sp = D.specialEvents[e.k];
    if (e.o === -1) {
      let h = 0, tot = sp.req.length;
      if (sp.colors) { tot = 10; for (const c in sp.colors) h += Math.min(colorN(p, COLORKEY[c] || (c === 'prosperity' ? 'purple' : 'tan')), 2); }
      else for (const k of sp.req) { if (p.city.some(x => key(x.id) === k)) h += 1; else if (p.hand.some(id => key(id) === k)) h += 0.5; }
      const fr = h / Math.max(1, tot);
      v += 0.5 * (EVV[sp.key] + (W.grim ? 0.9 * grimPer : 0)) * fr * fr;
    } else if (e.o === seat) v += EVX[sp.key] || 0;
  }
  if (!noOpp) {
    let o = 0, n = 0;
    for (let i = 0; i < W.players.length; i++) if (i !== seat) { o += pubVal(W, i); n++; }
    if (W.grim) { o += HB.grimScore(W).total; n++; }
    if (n) v -= (W.grim ? 0.9 : 0.4) * o / n;
  }
  return v;
}

// ---------- quick answers for pending decisions (used inside simulations) ----------
function resNeed(W, seat) {
  const p = W.players[seat], need = { twig: 0, resin: 0, pebble: 0, berry: 0 };
  for (const id of p.hand) { const cost = def(id).cost; for (const r of RES) need[r] += cost[r] || 0; }
  return need;
}
function resGain(W, seat, r) { const p = W.players[seat], need = resNeed(W, seat); return RV[r] * (p.res[r] < need[r] + 2 ? 1 : 0.15) + (p.res[r] < need[r] ? 0.4 : 0); }
const optCard = o => o.card;
function quickQ(W, seat) {
  const q = W.q, o = q.opts, p = W.players[seat];
  const argmax = f => { let bi = 0, bv = -1e9; for (let i = 0; i < o.length; i++) { const v = f(o[i], i); if (v > bv) { bv = v; bi = i; } } return bi; };
  const hv = id => 0.35 + 0.33 * cardVal(W, p, id);
  switch (q.kind) {
    case 'resource': return argmax(x => x.res ? resGain(W, seat, x.res) : 0);
    case 'waive': return argmax(x => x.res ? RV[x.res] * (p.res[x.res] >= 1 ? 1 : 0.5) : 0);
    case 'discard': {
      // option labelled Done present when allowed; discard the lowest value card while it is worth less than the benefit
      const doneI = o.findIndex(x => x.card === undefined);
      let worst = -1, wv = 1e9; for (let i = 0; i < o.length; i++) if (o[i].card !== undefined) { const v = hv(o[i].card); if (v < wv) { wv = v; worst = i; } }
      if (doneI < 0) return worst;
      const th = o[0].d && o[0].d.then ? o[0].d.then.h : '';
      const ben = th === 'thPts' ? 1.0 : th === 'thDraw' ? 1.3 : th === 'thAny' ? 0.5 * (o[0].d.then.d.per) : 0;
      return wv < ben && worst >= 0 ? worst : doneI;
    }
    case 'give': { // monk/cloister/market/post office: give away cheap things
      const withCard = o.filter(x => x.card !== undefined);
      if (withCard.length) { let bi = 0, bv = 1e9; o.forEach((x, i) => { if (x.card === undefined) return; const v = hv(x.card); if (v < bv) { bv = v; bi = i; } }); return bi; }
      let bi = 0, bv = 1e9; o.forEach((x, i) => { if (x.res === undefined) return; const v = RV[x.res]; if (v < bv) { bv = v; bi = i; } }); return o[bi].res !== undefined ? bi : 0;
    }
    case 'spend': return 0;
    case 'trade': { let bi = o.length - 1, bv = 0.12; o.forEach((x, i) => { if (!x.res) return; const gain = Math.max(...RES.map(r => resGain(W, seat, r))) - RV[x.res] * 0.8; if (gain > bv) { bv = gain; bi = i; } }); return bi; }
    case 'stock': return argmax(x => { const k = Object.keys(x.d.o)[0]; return x.d.o[k] * RV[k]; });
    case 'meadow': case 'inn': case 'queen': case 'cemetery': case 'pigeon': case 'bazaar': {
      return argmax(x => { if (x.card === undefined) return x.label && /deck/.test(x.label) ? 0.3 : x.label && /discard pile/.test(x.label) ? 0.2 : x.label && /Stop|Do not|none|neither/.test(x.label) ? -0.5 : 0; const c = def(x.card); return cardVal(W, p, x.card) - costVal(c.cost) * (q.kind === 'meadow' ? 0.3 : 1) * 0.9; });
    }
    case 'clear': return argmax(x => -cardVal(W, W.players[(seat + 1) % W.players.length], x.card) + 0.1 * cardVal(W, p, x.card));
    case 'prisoner': return argmax(x => -cardVal(W, p, x.card) - def(x.card).pts);
    case 'ruins': return argmax(x => costVal(def(x.card).cost) - def(x.card).pts - extraVal(key(x.card), pe, p, remProd(p)));
    case 'university': return argmax(x => costVal(def(x.card).cost) - def(x.card).pts - extraVal(key(x.card), pe, p, remProd(p)) - projBonus(key(x.card), p));
    case 'cityDisc': return argmax(x => -(def(x.card).pts + extraVal(key(x.card), pe, p, remProd(p)) + projBonus(key(x.card), p)));
    case 'banish': return argmax(x => def(x.card).pts + (def(x.card).color === 'purple' ? 1 : 0));
    case 'teach': return argmax(x => hv(x.card));
    case 'recipient': { let bi = 0, bv = 1e9; o.forEach((x, i) => { const t = x.d.to; if (t == null || t === 'G') return; const v = pubVal(W, t); if (v < bv) { bv = v; bi = i; } }); return bi; }
    case 'scroll': return o.length > 1 && o[0].label.startsWith('Keep') ? 0 : 0;
    case 'tuck': return argmax(x => x.card === undefined ? 0.2 : (3 - (def(x.card).pts + extraVal(key(x.card), pe, p, remProd(p)))) * (/hand/.test(q.title) ? 0.66 : 1) - 0.3);
    case 'stack': return 0;
    case 'recall': return 0;
    case 'trigger': return 0;
    case 'production': return argmax(x => extraVal(key(x.card), pe, p, 1));
    case 'chip': case 'mole': return argmax(x => extraVal(key(x.card), pe, p, 1));
    case 'copy': return argmax(x => locVal(W, seat, x.d.loc));
    case 'clock': return argmax(x => x.d && x.d.loc ? locVal(W, seat, x.d.loc) - 0.5 : 0.3);
    case 'ranger': {
      if (o.length === 1) return 0;
      if (o[0].h === 'rangerPlace') return argmax(x => locVal(W, seat, x.d.loc));
      let bi = o.length - 1, bv = 0.3;
      o.forEach((x, i) => { if (x.h !== 'rangerTo') return; const pl = p.dep[x.d.j]; const cur = pl && (pl.k === 'basic' || pl.k === 'forest') ? locVal(W, seat, pl) : 3; const v = 1.6 - cur; if (v > bv) { bv = v; bi = i; } });
      return bi;
    }
  }
  return 0;
}
function locVal(W, seat, l) {
  const p = W.players[seat];
  if (l.k === 'basic') { const b = D.basic[l.i]; let v = 0; for (const r of RES) if (b.gain[r]) v += b.gain[r] * resGain(W, seat, r); return v + 0.7 * b.draw + 1.0 * b.pts; }
  if (l.k === 'forest') {
    const fk = D.forest[W.forest[l.i]].key;
    const t = { forest_berry_thicket: 0.9 + 0.7, forest_foragers_crossing: 1.4, forest_rummage_hollow: 1.0, forest_echoing_meadow: 2.2, forest_quarry_burrow: 0.7 + 2.0, forest_mixed_glade: 1.25, forest_bumper_bramble: 1.35, forest_sapwell_copse: 1.3, forest_postbag_clearing: 1.9, forest_barter_stump: 0.8, forest_meadow_bazaar: 2.3 };
    return t[fk] || 1;
  }
  return 0;
}

// ---------- simulation helpers ----------
function resolve(W, seat) {
  let n = 0;
  while (W.q && W.q.who === seat && W.phase !== 'over' && n++ < 60) HB.apply(W, { type: 'choose', i: quickQ(W, seat) }, { trust: true });
}
function sim(W0, seat, m) {
  const W = clone(W0); HB.apply(W, m, { trust: true }); resolve(W, seat); return W;
}
function rankMoves(W0, seat, ms, extra) {
  const out = [];
  for (const m of ms) { const W = sim(W0, seat, m); out.push({ m, v: V(W, seat), W }); }
  return out;
}
const isPass = m => m.type === 'pass';
// passing is only chosen when every other move makes things clearly worse
function fixPass(ranks, W0, seat) {
  const pi = ranks.findIndex(r => isPass(r.m)); if (pi < 0) return;
  let best = -1e9; ranks.forEach((r, i) => { if (i !== pi && r.v > best) best = r.v; });
  const base = V(W0, seat);
  const prep = ranks.some(r => r.m.type === 'prepare');
  ranks[pi].v = prep || best >= base - 0.3 ? -1e9 : base;
}

// ---------- levels ----------
function chooseEasy(G, seat, rng) {
  const ms = HB.moves(G, seat);
  if (ms.length === 1) return ms[0];
  if (G.q) return ms[Math.floor(rng() * ms.length)];
  const w = ms.map(m => m.type === 'prepare' ? 4 : m.type === 'play' ? (m.how === 'occupy' ? 3 : 2) : m.type === 'worker' ? 1 : 0.01);
  let tot = 0; for (const x of w) tot += x; let r = rng() * tot;
  for (let i = 0; i < ms.length; i++) { r -= w[i]; if (r <= 0) return ms[i]; }
  return ms[ms.length - 1];
}
function pickBest(ranks, G, rng, noise) {
  let bi = 0, bv = -1e9;
  ranks.forEach((r, i) => { const v = r.v + (noise ? (rng() - 0.5) * noise : 0) - (isPass(r.m) ? 0.25 : 0); if (v > bv) { bv = v; bi = i; } });
  return bi;
}
function chooseNormal(G, seat, rng) {
  const ms = HB.moves(G, seat);
  if (ms.length === 1) return ms[0];
  const W0 = world(G, seat, rng);
  const wm = HB.moves(W0, seat);
  if (G.q && wm.length > 16) return ms[quickQ(W0, seat)];
  const ranks = rankMoves(W0, seat, wm);
  if (!G.q) fixPass(ranks, W0, seat);
  const bi = pickBest(ranks, G, rng, 0.04);
  return ms[bi];
}
// hard: for several random re-deals of the hidden cards, look two of my own moves ahead (with the rivals replying greedily
// in between) for the best few candidate moves, and average the results. Stops when the time budget (ms) is used up.
function lookahead(Wc, seat, rng) {
  const W = Wc; let guard = 0;
  while (W.phase !== 'over' && HB.actor(W) !== seat && guard++ < 10) {
    const o = HB.actor(W), om = HB.moves(W, o); if (!om.length) break;
    let mv;
    if (om.length === 1) mv = om[0];
    else { const rk = rankMoves(W, o, om); if (!W.q) fixPass(rk, W, o); mv = rk[pickBest(rk, W, rng, 0)].m; }
    HB.apply(W, mv, { trust: true });
    if (W.q && W.q.who !== seat) resolve(W, W.q.who);
  }
  if (W.phase === 'over') return V(W, seat);
  const m2 = HB.moves(W, seat);
  if (!m2.length) return V(W, seat);
  const r2 = rankMoves(W, seat, m2); const p2 = r2.findIndex(x => isPass(x.m));
  let b = -1e9; r2.forEach((x, j) => { if (j !== p2 && x.v > b) b = x.v; });
  return p2 >= 0 && b > -1e9 ? b : Math.max.apply(null, r2.map(x => x.v));
}
function chooseHard(G, seat, rng, budget) {
  const t0 = nowMs();
  const ms = HB.moves(G, seat);
  if (ms.length === 1) return ms[0];
  const W0 = world(G, seat, rng), wm = HB.moves(W0, seat);
  if (G.q && wm.length > 16) return ms[quickQ(W0, seat)];
  const ranks = rankMoves(W0, seat, wm);
  if (!G.q) fixPass(ranks, W0, seat);
  if (G.q) return ms[pickBest(ranks, G, rng, 0.02)];
  const order = ranks.map((r, i) => i).sort((a, b) => ranks[b].v - ranks[a].v);
  const K = Math.min(6, order.length), cand = order.slice(0, K).filter(i => !isPass(ranks[i].m));
  if (!cand.length) return ms[order[0]];
  const sum = new Array(ranks.length).fill(0); let nw = 0;
  for (let w = 0; w < 8; w++) {
    if (w >= 1 && nowMs() - t0 > budget * 0.6) break;
    let rk = ranks, Wb = W0;
    if (w > 0) { Wb = world(G, seat, rng); rk = rankMoves(Wb, seat, HB.moves(Wb, seat)); if (!G.q) fixPass(rk, Wb, seat); }
    for (const i of cand) { const val = lookahead(w === 0 ? rk[i].W : rk[i].W, seat, rng); sum[i] += 0.35 * rk[i].v + 0.65 * val; }
    nw++;
  }
  let bi = cand[0], bv = -1e9;
  for (const i of cand) { const v = sum[i] / nw + (rng() - 0.5) * 0.02; if (v > bv) { bv = v; bi = i; } }
  return ms[bi];
}

function choose(G, seat, level, opts) {
  level = level || G.players[seat].ai || 'normal';
  const rng = mkRng(seedOf(G, seat));
  if (level === 'easy') return chooseEasy(G, seat, rng);
  if (level === 'hard') return chooseHard(G, seat, rng, (opts && opts.budget) || 220);
  return chooseNormal(G, seat, rng);
}
// play the next move for whoever must act (helper for UIs and tests); returns the move or null
function step(G, opts) {
  const a = HB.actor(G); if (a < 0) return null;
  const m = choose(G, a, null, opts); const r = HB.apply(G, m); if (!r.ok) throw new Error('AI chose an illegal move: ' + JSON.stringify(m) + ' ' + r.error);
  return m;
}
HB.AI = { choose, step, world, V, mkRng, seedOf, quickQ, chooseEasy, chooseNormal, chooseHard };
if (typeof module === 'object' && module.exports) module.exports = HB.AI;
})(typeof globalThis !== 'undefined' ? globalThis : this);

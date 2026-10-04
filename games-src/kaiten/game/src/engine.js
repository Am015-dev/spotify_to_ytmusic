// ===================== Kaiten Kitchen rules engine =====================
// Plain JS (browser global KK / node module). State G is one JSON-serialisable object with its own seeded RNG.
//   KK.newGame({players:2..5, seed, names:[], ai:[level|null,...]}) -> G
//   KK.moves(G, seat) -> [{pick:[i] | [i,j], ids:[cardId..], label}]   (indexes into G.players[seat].hand)
//   KK.apply(G, seat, move) -> {ok:true} | {ok:false, error}           (stores the hidden pick; resolves when all seats have picked)
//   KK.stripView(G, seat) / KK.score(G) / KK.pending(G) / KK.checkInvariants(G)
// Cards are instance ids 0..107, type via KK.cardKey(id). Hands pass to seat (i+1) % np ("left").
(function (g) {
'use strict';
const KK = g.KK = g.KK || {};
const DATA = KK.DATA || (typeof require === 'function' ? require('./data.js') : null);
const TYPES = DATA.types, TIDX = {}, CARD_KEY = [];
TYPES.forEach((t, i) => { TIDX[t.id] = i; for (let k = 0; k < t.copies; k++) CARD_KEY.push(t.id); });
const NCARDS = CARD_KEY.length; // 108
const T = {}; TYPES.forEach(t => { T[t.id] = t; });
const key = id => CARD_KEY[id];
const cname = id => T[CARD_KEY[id]].name;
const NIGIRI = { salmon: 2, squid: 3, egg: 1 };
const ICONS = { roll1: 1, roll2: 2, roll3: 3 };
const CATS = ['maki', 'tempura', 'sashimi', 'dumpling', 'nigiri', 'wasabi'];
const NAMES = ['Ann', 'Bo', 'Cy', 'Di', 'Ed'];

// ---------- rng ----------
function rnd(G, n) { let t = (G.rng = (G.rng + 0x6D2B79F5) | 0); t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * n); }
function shuffle(G, a) { for (let i = a.length - 1; i > 0; i--) { const j = rnd(G, i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
const clone = o => JSON.parse(JSON.stringify(o));
function lg(G, t) { if (G.nolog) return; G.logN++; G.log.push({ i: G.logN, round: G.round, turn: G.turn, t }); if (G.log.length > 400) G.log.splice(0, 100); }
function ev(G, e) { if (!G.nolog) { e.n = ++G.evN; G.events.push(e); } }
function use(G, k, n) { G.used[k] = (G.used[k] || 0) + (n === undefined ? 1 : n); }

// ---------- scoring helpers (pure) ----------
// icons[] -> points[] for the maki race. Ties for most split 6 (rounded down) and no second place; ties for second split 3 (rounded down); 0 icons never score.
function makiPoints(icons) {
  const n = icons.length, out = new Array(n).fill(0);
  let max = 0; for (const x of icons) if (x > max) max = x;
  if (max <= 0) return out;
  const top = []; for (let i = 0; i < n; i++) if (icons[i] === max) top.push(i);
  const p1 = Math.floor(DATA.makiFirst / top.length); for (const i of top) out[i] = p1;
  if (top.length > 1) return out;
  let sec = 0; for (const x of icons) if (x < max && x > sec) sec = x;
  if (sec <= 0) return out;
  const s = []; for (let i = 0; i < n; i++) if (icons[i] === sec) s.push(i);
  const p2 = Math.floor(DATA.makiSecond / s.length); for (const i of s) out[i] = p2;
  return out;
}
// puddings at game end. most +6 split (rounded down), fewest -6 split (magnitude rounded down) except 2 players; all equal -> nobody.
function puddingPoints(counts, np) {
  const n = counts.length, out = new Array(n).fill(0);
  let max = -1, min = 1e9; for (const c of counts) { if (c > max) max = c; if (c < min) min = c; }
  if (max === min) return out;
  const top = [], low = []; for (let i = 0; i < n; i++) { if (counts[i] === max) top.push(i); if (counts[i] === min) low.push(i); }
  const gain = Math.floor(DATA.puddingMost / top.length); for (const i of top) out[i] += gain;
  if ((np === undefined ? n : np) > 2) { const loss = Math.floor(DATA.puddingFewest / low.length); for (const i of low) out[i] -= loss; }
  return out;
}
const dumplingPts = n => DATA.dumplingPts[Math.min(n, 5)];
function tableCounts(table) {
  const c = { tempura: 0, sashimi: 0, dumpling: 0, icons: 0, nigiri: 0, wasabiBonus: 0, wasabiUnused: 0, pudding: 0, chop: 0, wasabi: 0 };
  const used = new Set();
  for (const e of table) { if (NIGIRI[key(e.id)] && e.w >= 0) used.add(e.w); }
  for (const e of table) {
    const k = key(e.id);
    if (k === 'tempura') c.tempura++; else if (k === 'sashimi') c.sashimi++; else if (k === 'dumpling') c.dumpling++;
    else if (ICONS[k]) c.icons += ICONS[k];
    else if (NIGIRI[k]) { c.nigiri += NIGIRI[k]; if (e.w >= 0) c.wasabiBonus += 2 * NIGIRI[k]; }
    else if (k === 'wasabi') { c.wasabi++; if (!used.has(e.id)) c.wasabiUnused++; }
    else if (k === 'pudding') c.pudding++; else if (k === 'chop') c.chop++;
  }
  return c;
}
// round scores for every seat from the tables
function roundScores(G) {
  const cs = G.players.map(p => tableCounts(p.table));
  const mk = makiPoints(cs.map(c => c.icons));
  return cs.map((c, i) => {
    const o = { maki: mk[i], tempura: Math.floor(c.tempura / 2) * DATA.tempuraPair, sashimi: Math.floor(c.sashimi / 3) * DATA.sashimiSet, dumpling: dumplingPts(c.dumpling), nigiri: c.nigiri, wasabi: c.wasabiBonus };
    o.total = o.maki + o.tempura + o.sashimi + o.dumpling + o.nigiri + o.wasabi;
    o.icons = c.icons; o.counts = { tempura: c.tempura, sashimi: c.sashimi, dumpling: c.dumpling, nigiri: c.nigiri, wasabiUnused: c.wasabiUnused, pudding: c.pudding };
    return o;
  });
}

// ---------- setup ----------
function newGame(o) {
  o = o || {};
  const np = Math.max(2, Math.min(5, (o.players | 0) || 2));
  const seed = (o.seed === undefined ? Date.now() : o.seed) | 0;
  const G = { v: 1, np, seed, rng: seed, round: 1, turn: 1, hand: DATA.handSize[np], phase: 'pick', deck: [], discard: [], players: [], hist: [], rs: [], log: [], logN: 0, events: [], evN: 0, used: {}, winner: -1, winners: [], winText: '', final: null };
  for (let i = 0; i < np; i++) G.players.push({ seat: i, name: (o.names && o.names[i]) || NAMES[i], ai: (o.ai && o.ai[i]) || null, hand: [], table: [], pud: [], pick: null, picked: false, mem: [] });
  for (let i = 0; i < NCARDS; i++) G.deck.push(i);
  shuffle(G, G.deck);
  lg(G, 'A new meal begins: ' + np + ' diners, 3 rounds.');
  deal(G);
  return G;
}
function deal(G) {
  const H = G.hand;
  for (const p of G.players) { p.hand = G.deck.splice(G.deck.length - H, H); p.table = []; p.pick = null; p.picked = false; p.mem = [{ turn: 1, hand: p.hand.slice().sort((a, b) => a - b) }]; }
  G.turn = 1; G.hist = []; G.phase = 'pick';
  ev(G, { t: 'deal', round: G.round, size: H });
  lg(G, 'Round ' + G.round + ': everyone is dealt ' + H + ' cards.');
}

// ---------- moves ----------
const hasChop = p => p.table.some(e => key(e.id) === 'chop');
function moves(G, seat) {
  if (!G || G.phase !== 'pick' || !Number.isInteger(seat) || seat < 0 || seat >= G.np) return [];
  const p = G.players[seat]; if (p.picked || !p.hand.length) return [];
  const out = [], h = p.hand;
  for (let i = 0; i < h.length; i++) out.push({ pick: [i], ids: [h[i]], label: 'Take ' + cname(h[i]) });
  if (h.length >= 2 && hasChop(p)) for (let i = 0; i < h.length; i++) for (let j = i + 1; j < h.length; j++) out.push({ pick: [i, j], ids: [h[i], h[j]], label: 'Twin Sticks: take ' + cname(h[i]) + ' and ' + cname(h[j]) });
  return out;
}
function pending(G) { return G.phase !== 'pick' ? [] : G.players.filter(p => !p.picked).map(p => p.seat); }

function apply(G, seat, move) {
  if (!G || G.phase !== 'pick') return { ok: false, error: 'the game is not waiting for picks' };
  if (!Number.isInteger(seat) || seat < 0 || seat >= G.np) return { ok: false, error: 'bad seat' };
  const p = G.players[seat];
  if (p.picked) return { ok: false, error: 'seat already picked' };
  const pk = move && move.pick;
  if (!Array.isArray(pk) || pk.length < 1 || pk.length > 2) return { ok: false, error: 'bad pick' };
  for (const i of pk) if (!Number.isInteger(i) || i < 0 || i >= p.hand.length) return { ok: false, error: 'bad index' };
  if (pk.length === 2) {
    if (pk[0] === pk[1]) return { ok: false, error: 'same card twice' };
    if (!hasChop(p)) return { ok: false, error: 'no Twin Sticks on the table' };
    if (p.hand.length < 2) return { ok: false, error: 'need two cards' };
  }
  G.events = [];
  p.pick = pk.map(i => p.hand[i]); p.picked = true;
  ev(G, { t: 'picked', seat });
  if (G.players.every(q => q.picked)) resolve(G);
  return { ok: true };
}

// placement order of a double pick: Fire Paste first, then nigiri by value (best first), then the rest
function orderPick(ids) {
  const w = [], n = [], r = [];
  for (const id of ids) { const k = key(id); if (k === 'wasabi') w.push(id); else if (NIGIRI[k]) n.push(id); else r.push(id); }
  n.sort((a, b) => NIGIRI[key(b)] - NIGIRI[key(a)]);
  return w.concat(n, r);
}
function place(p, id) {
  const e = { id, w: -1 };
  if (NIGIRI[key(id)]) {
    const taken = new Set(); for (const x of p.table) if (NIGIRI[key(x.id)] && x.w >= 0) taken.add(x.w);
    for (const x of p.table) if (key(x.id) === 'wasabi' && !taken.has(x.id)) { e.w = x.id; break; } // oldest unused wasabi
  }
  p.table.push(e); return e;
}
function resolve(G) {
  const np = G.np, picks = [];
  for (const p of G.players) {
    const used = p.pick.length === 2; let chopId = -1;
    if (used) { const ci = p.table.findIndex(e => key(e.id) === 'chop'); chopId = p.table[ci].id; p.table.splice(ci, 1); }
    const ids = orderPick(p.pick), cards = [];
    for (const id of ids) { p.hand.splice(p.hand.indexOf(id), 1); const e = place(p, id); cards.push({ id, key: key(id), w: e.w }); use(G, 'take_' + key(id)); if (e.w >= 0) use(G, 'wasabiNigiri'); }
    if (used) { p.hand.push(chopId); use(G, 'chopUsed'); }
    picks.push({ seat: p.seat, cards, chop: chopId });
    if (!G.nolog) {
      const you = p.name === 'You';
      if (used) lg(G, p.name + (you ? ' use Twin Sticks: take ' : ' uses Twin Sticks: takes ') + cards.map(c => cname(c.id)).join(' and ') + '.');
      else lg(G, p.name + (you ? ' take ' : ' takes ') + cname(cards[0].id) + (cards[0].w >= 0 ? ' on Fire Paste (x3)' : '') + '.');
    }
    p.pick = null; p.picked = false;
  }
  ev(G, { t: 'reveal', round: G.round, turn: G.turn, picks });
  G.hist.push({ turn: G.turn, picks: picks.map(x => ({ seat: x.seat, ids: x.cards.map(c => c.id), chop: x.chop })) });
  const left = G.players[0].hand.length;
  if (left === 0) { endRound(G); return; }
  const hs = G.players.map(p => p.hand);
  G.players.forEach((p, i) => { p.hand = hs[(i - 1 + np) % np]; });
  G.turn++;
  for (const p of G.players) p.mem.push({ turn: G.turn, hand: p.hand.slice().sort((a, b) => a - b) });
  ev(G, { t: 'pass', round: G.round, turn: G.turn - 1, dir: 1, sizes: G.players.map(p => p.hand.length) });
}

function endRound(G) {
  const sc = roundScores(G);
  const snap = G.players.map(p => p.table.map(e => ({ id: e.id, w: e.w })));
  G.rs.push(sc.map((s, i) => Object.assign({}, s, { table: snap[i] })));
  if (G.sim) { G.phase = 'simend'; return; }
  const last = G.round === DATA.rounds;
  ev(G, { t: 'score', round: G.round, seats: sc.map((s, i) => ({ seat: i, maki: s.maki, tempura: s.tempura, sashimi: s.sashimi, dumpling: s.dumpling, nigiri: s.nigiri, wasabi: s.wasabi, total: s.total, icons: s.icons, table: snap[i] })) });
  G.players.forEach((p, i) => {
    const s = sc[i];
    lg(G, p.name + ' scores ' + s.total + ' (rolls ' + s.maki + ', prawns ' + s.tempura + ', fish ' + s.sashimi + ', buns ' + s.dumpling + ', nigiri ' + s.nigiri + (s.wasabi ? ' + paste ' + s.wasabi : '') + ').');
    if (s.maki === 0 && s.icons > 0) use(G, 'makiZero');
    if (s.counts.wasabiUnused) use(G, 'wasabiWasted', s.counts.wasabiUnused);
  });
  if (makiHadTie(sc)) use(G, 'makiTie');
  for (const p of G.players) {
    for (const e of p.table) { if (key(e.id) === 'pudding') p.pud.push(e.id); else G.discard.push(e.id); }
    p.table = []; p.hand = [];
  }
  if (last) { finish(G); return; }
  G.round++; deal(G);
}
function makiHadTie(sc) { const m = {}; let max = 0; for (const s of sc) { m[s.icons] = (m[s.icons] || 0) + 1; if (s.icons > max) max = s.icons; } return max > 0 && Object.keys(m).some(k => +k > 0 && m[k] > 1); }

function finish(G) {
  G.phase = 'over';
  const counts = G.players.map(p => p.pud.length), pts = puddingPoints(counts, G.np);
  const totals = G.players.map((p, i) => G.rs.reduce((a, r) => a + r[i].total, 0) + pts[i]);
  G.final = { pudding: counts, puddingPts: pts, totals };
  if (new Set(counts).size > 1) use(G, 'puddingScored');
  if (G.np > 2 && Math.min(...counts) !== Math.max(...counts)) use(G, 'puddingPenalty');
  let best = Math.max(...totals), w = totals.map((t, i) => t === best ? i : -1).filter(i => i >= 0);
  let tie = false;
  if (w.length > 1) { const bp = Math.max(...w.map(i => counts[i])); const w2 = w.filter(i => counts[i] === bp); if (w2.length < w.length) { w = w2; tie = true; use(G, 'tieBreak'); } }
  G.winners = w; G.winner = w.length === 1 ? w[0] : -1;
  const nm = i => G.players[i].name;
  G.winText = w.length === 1 ? nm(w[0]) + (nm(w[0]) === 'You' ? ' win with ' : ' wins with ') + best + ' points' + (tie ? ' (more Custard Cups)' : '') + '.' : w.map(nm).join(' and ') + ' share the win with ' + best + ' points.';
  if (w.length > 1) use(G, 'sharedWin');
  ev(G, { t: 'gameEnd', pudding: counts, puddingPts: pts, totals, winners: w, text: G.winText });
  lg(G, 'Puddings: ' + G.players.map((p, i) => p.name + ' ' + counts[i] + ' (' + (pts[i] > 0 ? '+' : '') + pts[i] + ')').join(', ') + '.');
  lg(G, G.winText);
}

// ---------- reports ----------
function score(G) {
  const rounds = G.rs.map((r, ri) => ({ round: ri + 1, seats: r.map(s => ({ maki: s.maki, tempura: s.tempura, sashimi: s.sashimi, dumpling: s.dumpling, nigiri: s.nigiri, wasabi: s.wasabi, total: s.total, icons: s.icons, table: s.table })) }));
  const banked = G.players.map((p, i) => G.rs.reduce((a, r) => a + r[i].total, 0));
  const counts = G.players.map(p => p.pud.length + p.table.filter(e => key(e.id) === 'pudding').length);
  const over = G.phase === 'over';
  const pts = over ? G.final.puddingPts : puddingPoints(counts, G.np);
  let cur = null;
  if (G.phase === 'pick' && G.players[0].table.length) cur = roundScores(G).map(s => ({ maki: s.maki, tempura: s.tempura, sashimi: s.sashimi, dumpling: s.dumpling, nigiri: s.nigiri, wasabi: s.wasabi, total: s.total, icons: s.icons }));
  const totals = banked.map((b, i) => b + (over ? pts[i] : 0));
  const live = totals.map((b, i) => b + (cur ? cur[i].total : 0));
  return { cats: CATS, rounds, current: cur, pudding: { counts, pts, final: over }, banked, totals, live, over, winner: G.winner, winners: G.winners };
}

// ---------- hidden information ----------
function stripView(G, seat) {
  const V = clone(G);
  V.rng = 0; V.seed = 0;
  V.deck = V.deck.map(() => -1);
  V.players.forEach((p, i) => {
    if (i === seat) return;
    p.hand = p.hand.map(() => -1);
    p.pick = p.pick ? [-1] : null;
    p.mem = [];
  });
  return V;
}

function checkInvariants(G) {
  const e = [], seen = new Array(NCARDS).fill(0);
  const mark = (id, w) => { if (!Number.isInteger(id) || id < 0 || id >= NCARDS) e.push('bad card ' + id + ' in ' + w); else seen[id]++; };
  G.deck.forEach(x => mark(x, 'deck')); G.discard.forEach(x => mark(x, 'discard'));
  for (const p of G.players) { p.hand.forEach(x => mark(x, 'hand')); p.table.forEach(x => mark(x.id, 'table')); p.pud.forEach(x => mark(x, 'pud')); }
  for (let i = 0; i < NCARDS; i++) if (seen[i] !== 1) e.push('card ' + i + ' appears ' + seen[i] + ' times');
  if (G.phase === 'pick') {
    const n = G.players[0].hand.length;
    for (const p of G.players) {
      if (p.hand.length !== n) e.push('hand sizes differ');
      if (p.pick) for (const id of p.pick) if (!p.hand.includes(id)) e.push('pick not in hand');
      const taken = new Set(); for (const x of p.table) if (NIGIRI[key(x.id)] && x.w >= 0) { if (taken.has(x.w)) e.push('wasabi used twice'); taken.add(x.w); if (!p.table.some(y => y.id === x.w)) e.push('nigiri on missing wasabi'); }
      for (const x of p.table) if (x.w >= 0 && !NIGIRI[key(x.id)]) e.push('w on a non-nigiri');
    }
    if (G.players[0].hand.length + G.turn - 1 !== G.hand) e.push('turn/hand mismatch');
  }
  return e;
}

Object.assign(KK, { newGame, moves, apply, pending, stripView, score, checkInvariants, clone, NCARDS, TYPES, HAND: DATA.handSize,
  cardKey: key, cardName: cname, cardType: id => T[CARD_KEY[id]], makiPoints, puddingPoints, dumplingPts, roundScores, tableCounts, placeOrder: orderPick,
  _: { rnd, shuffle, resolve, endRound, hasChop, place, NIGIRI, ICONS, CATS, T } });
if (typeof module === 'object' && module.exports) module.exports = KK;
})(typeof globalThis !== 'undefined' ? globalThis : this);

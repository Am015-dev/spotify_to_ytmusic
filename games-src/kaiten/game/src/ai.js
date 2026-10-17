// ===================== Kaiten Kitchen computer players =====================
// KK.AI.choose(G, seat, level?, opts?) -> one of KK.moves(G, seat)      level: 'easy' | 'normal' | 'hard' (default G.players[seat].ai || 'normal')
// KK.AI.step(G, seat) = choose + apply for one seat; KK.AI.stepAll(G) = every undecided AI seat picks (returns number of picks made).
// The AI only reads public information (tables, discards, hand sizes, played history) and the seat's own hand and own memory of the hands it held.
// Randomness is seeded from that same information, so the same view always gives the same answer.
(function (g) {
'use strict';
const KK = g.KK || (typeof require === 'function' ? require('./engine.js') : null);
const AI = KK.AI = KK.AI || {};
const D = KK.DATA, NC = KK.NCARDS, key = KK.cardKey;
const KEYS = D.types.map(t => t.id), KI = {}; KEYS.forEach((k, i) => KI[k] = i);
const COPIES = D.types.map(t => t.copies);
const NIG = { salmon: 2, squid: 3, egg: 1 }, ICON = { roll1: 1, roll2: 2, roll3: 3 };
const TEMPURA_F = k => 5 * Math.floor(k / 2), SASHIMI_F = k => 10 * Math.floor(k / 3), DUMP_F = k => D.dumplingPts[Math.min(k, 5)];
// tunable policy knobs (kept in one place so balance experiments can change a single lever)
const P = AI.params = { contest: 0.65, surv: 0.6, chopBase: 0.9, chopSlope: 0.2, chopCap: 4, chopHandoff: 0.3, makiFut: 0.9, pudFut: 1.0, hardWorlds: 250, hardTop: 4 };

// ---------- small utils ----------
function mkRng(seed) { let s = seed >>> 0; return function () { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function seedOf(G, seat, salt) {
  let h = 2166136261 ^ (salt | 0); const mix = v => { h ^= (v + 0x9e3779b9) | 0; h = Math.imul(h, 16777619); };
  mix(G.round); mix(G.turn); mix(seat); mix(G.logN || 0);
  for (const id of G.players[seat].hand) mix(id + 1);
  return h >>> 0;
}
function shuf(a, rng) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function tc(table) {
  const c = { tempura: 0, sashimi: 0, dumpling: 0, icons: 0, u: 0, pud: 0, chop: 0, nig: 0, wb: 0 };
  let used = 0; const w = [];
  for (const e of table) { const k = key(e.id); if (NIG[k] && e.w >= 0) used++; }
  for (const e of table) {
    const k = key(e.id);
    if (k === 'tempura') c.tempura++; else if (k === 'sashimi') c.sashimi++; else if (k === 'dumpling') c.dumpling++;
    else if (ICON[k]) c.icons += ICON[k]; else if (k === 'wasabi') c.u++; else if (k === 'pudding') c.pud++; else if (k === 'chop') c.chop++;
  }
  c.u -= used; return c;
}
function poissonExp(f, n, lam, cap) { // E[f(n+1+X) - f(n+X)], X ~ Poisson(lam) capped at `cap`
  if (cap < 0) cap = 0;
  let p = Math.exp(-lam), acc = 0, cum = 0;
  for (let x = 0; x < cap; x++) { acc += p * (f(n + 1 + x) - f(n + x)); cum += p; p = p * lam / (x + 1); }
  acc += (1 - cum) * (f(n + 1 + cap) - f(n + cap));
  return acc;
}
const pAtLeast = (lam, m) => { if (m <= 0) return 1; let p = Math.exp(-lam), s = 0; for (let x = 0; x < m; x++) { s += p; p = p * lam / (x + 1); } return Math.max(0, 1 - s); };
// future scenarios for the races (maki, puddings): multipliers on the expected number of future items each rival collects
const SC_W = [0.15, 0.2, 0.3, 0.2, 0.15], SC_M = [0.2, 0.6, 1, 1.5, 2.2];
const jit = (s, j) => 0.6 + 0.8 * (((s * 7 + j * 5 + 3) % 5) / 4);

// ---------- what a seat knows ----------
function makeCtx(G, seat) {
  const np = G.np, me = G.players[seat], L = me.hand.length;
  const seen = new Array(12).fill(0), own = new Array(12).fill(0);
  const sums = G.players.map(p => { const c = tc(p.table); for (const e of p.table) seen[KI[key(e.id)]]++; for (const id of p.pud) seen[KI[key(id)]]++; c.pud += p.pud.length; return c; });
  for (const id of G.discard) seen[KI[key(id)]]++;
  for (const id of me.hand) { const k = KI[key(id)]; seen[k]++; own[k]++; }
  let nun = 0; const un = new Array(12);
  for (let i = 0; i < 12; i++) { un[i] = Math.max(0, COPIES[i] - seen[i]); nun += un[i]; }
  let snew = 0; for (let k = 1; k <= Math.min(np - 1, L - 1); k++) snew += L - k;
  const sv = L > np ? (L - np) / (L - 1) * P.surv : 0;
  // pudding future per seat for the rest of the game
  const dealtLater = np * G.hand * (3 - G.round) + (np - 1) * L;
  const futPud = G.round === 3 && L <= 1 ? 0 : un[KI.pudding] * Math.min(1, dealtLater / Math.max(1, nun)) / np;
  return { G, seat, np, L, round: G.round, un, nun: Math.max(1, nun), own, snew, sv, sums, me: sums[seat], futPud };
}
const lam = (c, ki, minusOwn) => P.contest * (c.un[ki] / c.nun * c.snew + Math.max(0, c.own[ki] - (minusOwn || 0)) * c.sv);
const chopVal = (c, havingChop) => { const L = c.L; return L < 3 ? 0 : (P.chopBase + P.chopSlope * Math.min(L - 3, P.chopCap)); };

function makiMarg(c, S, k) {
  const sums = c.sums, np = c.np;
  if (c.fi === undefined) c.fi = P.makiFut * (lam(c, KI.roll1, 0) + 2 * lam(c, KI.roll2, 0) + 3 * lam(c, KI.roll3, 0));
  const fi = c.fi;
  let tot = 0;
  for (let s = 0; s < SC_M.length; s++) {
    const a = [], b = [];
    for (let j = 0; j < np; j++) {
      if (j === c.seat) { a.push(S.icons + fi); b.push(S.icons + fi + k); }
      else { const v = sums[j].icons + fi * SC_M[s] * jit(s, j); a.push(v); b.push(v); }
    }
    tot += SC_W[s] * (KK.makiPoints(b)[c.seat] - KK.makiPoints(a)[c.seat]);
  }
  return tot;
}
function pudMarg(c, S) {
  if (c.pm !== undefined && c.pmS === S.pud) return c.pm;
  const sums = c.sums, np = c.np, fp = c.futPud * P.pudFut; let tot = 0;
  for (let s = 0; s < SC_M.length; s++) {
    const a = [], b = [];
    for (let j = 0; j < np; j++) {
      if (j === c.seat) { a.push(S.pud + fp); b.push(S.pud + fp + 1); }
      else { const v = sums[j].pud + fp * SC_M[s] * jit(s, j); a.push(v); b.push(v); }
    }
    tot += SC_W[s] * (KK.puddingPoints(b, np)[c.seat] - KK.puddingPoints(a, np)[c.seat]);
  }
  c.pm = tot; c.pmS = S.pud;
  return tot;
}
// expected marginal points of adding card key k to table summary S (S = {tempura,sashimi,dumpling,icons,u,pud,chop})
function value(c, S, k) {
  const cap = c.L - 1, ki = KI[k];
  switch (k) {
    case 'tempura': return poissonExp(TEMPURA_F, S.tempura, lam(c, ki, 1), cap);
    case 'sashimi': return poissonExp(SASHIMI_F, S.sashimi, lam(c, ki, 1), cap);
    case 'dumpling': return poissonExp(DUMP_F, S.dumpling, lam(c, ki, 1), cap);
    case 'roll1': case 'roll2': case 'roll3': return makiMarg(c, S, ICON[k]);
    case 'salmon': case 'squid': case 'egg': {
      const v = NIG[k];
      if (S.u <= 0) return v;
      return 3 * v - wasabiFuture(c, S.u - 1, ki);
    }
    case 'wasabi': return 2 * wasabiGain(c, S.u);
    case 'chop': return chopVal(c) * (S.chop ? 0.5 : 1);
    case 'pudding': return pudMarg(c, S);
  }
  return 0;
}
function nigInfo(c, minusKi) {
  const ls = lam(c, KI.salmon, minusKi === KI.salmon ? 1 : 0), lq = lam(c, KI.squid, minusKi === KI.squid ? 1 : 0), le = lam(c, KI.egg, minusKi === KI.egg ? 1 : 0);
  const tot = ls + lq + le; return { tot, vbar: tot > 0 ? (2 * ls + 3 * lq + le) / tot : 2.2 };
}
// expected extra points a wasabi with `u` others already waiting would bring (2 x value of the (u+1)-th best future nigiri)
function wasabiGain(c, u) { const n = nigInfo(c, -1); return pAtLeast(n.tot, u + 1) * Math.max(0.5, n.vbar + (u === 0 ? 0.3 : -0.15 * u)); }
function wasabiFuture(c, u, minusKi) { const n = nigInfo(c, minusKi); return 2 * pAtLeast(n.tot, u + 1) * Math.max(0.5, n.vbar + (u === 0 ? 0.3 : -0.15 * u)); }
function addCard(S, k) {
  const o = Object.assign({}, S);
  if (k === 'tempura' || k === 'sashimi' || k === 'dumpling') o[k]++; else if (ICON[k]) o.icons += ICON[k];
  else if (k === 'wasabi') o.u++; else if (NIG[k]) { if (o.u > 0) o.u--; } else if (k === 'pudding') o.pud++; else if (k === 'chop') o.chop++;
  return o;
}
// all candidate picks with their value. cand = {pick:[i(,j)], keys:[..], v}
function candidates(c) {
  const G = c.G, p = G.players[c.seat], h = p.hand, S = c.me;
  const first = {}; h.forEach((id, i) => { const k = key(id); if (first[k] === undefined) first[k] = [i]; else if (first[k].length === 1) first[k].push(i); });
  const out = [], ks = Object.keys(first);
  const sv = {}; for (const k of ks) { sv[k] = value(c, S, k); out.push({ pick: [first[k][0]], keys: [k], v: sv[k], single: sv[k] }); }
  if (h.length >= 2 && KK._.hasChop(p)) {
    const cost = chopVal(c) + P.chopHandoff;
    for (let a = 0; a < ks.length; a++) for (let b = a; b < ks.length; b++) {
      const ka = ks[a], kb = ks[b]; let ia, ib;
      if (a === b) { if (first[ka].length < 2) continue; ia = first[ka][0]; ib = first[ka][1]; } else { ia = first[ka][0]; ib = first[kb][0]; }
      const ord = KK.placeOrder([h[ia], h[ib]]), k1 = key(ord[0]), k2 = key(ord[1]);
      const v = value(c, S, k1) + value(c, addCard(S, k1), k2) - cost;
      out.push({ pick: [Math.min(ia, ib), Math.max(ia, ib)], keys: [k1, k2], v, pair: true });
    }
  }
  return out;
}
function asMove(G, seat, pick) { const ms = KK.moves(G, seat); const s = pick.join(','); return ms.find(m => m.pick.join(',') === s); }
function normalPick(G, seat) {
  const c = makeCtx(G, seat), cs = candidates(c); let best = cs[0];
  for (const x of cs) if (x.v > best.v + 1e-9) best = x;
  return best.pick;
}

// ---------- easy: greedy with a lot of randomness ----------
function easyPick(G, seat) {
  const rng = mkRng(seedOf(G, seat, 11)), p = G.players[seat], h = p.hand, t = tc(p.table);
  const vals = h.map(id => {
    const k = key(id);
    let v = 0;
    switch (k) {
      case 'tempura': v = t.tempura % 2 === 1 ? 5 : 1.5; break;
      case 'sashimi': v = t.sashimi % 3 === 2 ? 10 : t.sashimi % 3 === 1 ? 3.5 : 2; break;
      case 'dumpling': v = DUMP_F(t.dumpling + 1) - DUMP_F(t.dumpling) + 0.5; break;
      case 'roll1': v = 1.2; break; case 'roll2': v = 2.2; break; case 'roll3': v = 3.2; break;
      case 'salmon': case 'squid': case 'egg': v = NIG[k] * (t.u > 0 ? 3 : 1); break;
      case 'wasabi': v = 2.2; break; case 'chop': v = 1.2; break; case 'pudding': v = 2; break;
    }
    return v + (rng() - 0.5) * 3;
  });
  let i = 0; if (rng() < 0.15) i = Math.floor(rng() * h.length); else for (let j = 1; j < h.length; j++) if (vals[j] > vals[i]) i = j;
  if (h.length >= 2 && KK._.hasChop(p) && (h.length === 2 || rng() < 0.12)) { let j = i === 0 ? 1 : 0; for (let x = 0; x < h.length; x++) if (x !== i && vals[x] > vals[j]) j = x; return [Math.min(i, j), Math.max(i, j)]; }
  return [i];
}

// ---------- hard: determinized Monte Carlo with normal-level rollouts ----------
// The hands this seat once held and then passed on are fully recoverable (it saw them; every later pick is public), so those hands are exact.
function knownHands(G, seat) {
  const np = G.np, t = G.turn, me = G.players[seat], out = new Array(np).fill(null);
  for (let k = 1; k <= Math.min(np - 1, t - 1); k++) {
    const u = t - k, snap = me.mem.find(m => m.turn === u); if (!snap) continue;
    let hand = snap.hand.slice();
    for (let v = u; v <= t - 1; v++) {
      const rec = G.hist.find(r => r.turn === v); if (!rec) { hand = null; break; }
      const holder = (seat + (v - u)) % np, pk = rec.picks.find(x => x.seat === holder); if (!pk) { hand = null; break; }
      for (const id of pk.ids) { const ix = hand.indexOf(id); if (ix < 0) { hand = null; break; } hand.splice(ix, 1); }
      if (!hand) break;
      if (pk.chop >= 0) hand.push(pk.chop);
    }
    const j = (seat + k) % np;
    if (hand && hand.length === G.players[j].hand.length) out[j] = hand;
  }
  return out;
}
function simBase(G) {
  return { np: G.np, round: G.round, turn: G.turn, hand: G.hand, phase: 'pick', rng: 1, nolog: true, sim: true, log: [], logN: 0, evN: 0, events: [], used: {}, hist: [], rs: [], deck: [], discard: G.discard.slice() };
}
function buildWorld(G, seat, rng, known) {
  const W = simBase(G), np = G.np, taken = new Uint8Array(NC);
  const mark = id => { taken[id] = 1; };
  for (const p of G.players) { p.table.forEach(e => mark(e.id)); p.pud.forEach(mark); }
  G.discard.forEach(mark); G.players[seat].hand.forEach(mark);
  known.forEach(h => h && h.forEach(mark));
  const pool = []; for (let i = 0; i < NC; i++) if (!taken[i]) pool.push(i);
  shuf(pool, rng); let k = 0;
  W.players = G.players.map((p, j) => ({ seat: j, name: '', hand: j === seat ? p.hand.slice() : known[j] ? known[j].slice() : pool.slice(k, (k += p.hand.length)), table: p.table.map(e => ({ id: e.id, w: e.w })), pud: p.pud.slice(), pick: null, picked: false, mem: [] }));
  return W;
}
function cloneSim(W) { const C = Object.assign({}, W); C.discard = W.discard.slice(); C.rs = []; C.used = {}; C.players = W.players.map(p => ({ seat: p.seat, name: '', hand: p.hand.slice(), table: p.table.map(e => ({ id: e.id, w: e.w })), pud: p.pud.slice(), pick: null, picked: false, mem: [] })); return C; }
function rollout(W, seat, first) {
  const np = W.np;
  let firstTurn = true;
  while (W.phase === 'pick') {
    for (let s = 0; s < np; s++) {
      const pk = (s === seat && firstTurn) ? first : normalPick(W, s);
      KK.apply(W, s, { pick: pk });
    }
    firstTurn = false;
  }
}
// terminal value of a finished round simulation from seat's point of view
function evalSim(W, seat, futPud) {
  const np = W.np, r = W.rs[W.rs.length - 1], tot = W.players.map((p, i) => r[i].total);
  const cnt = W.players.map(p => p.pud.length + p.table.filter(e => key(e.id) === 'pudding').length);
  let pp;
  if (W.round === 3) pp = KK.puddingPoints(cnt, np);
  else { pp = new Array(np).fill(0); for (let s = 0; s < SC_M.length; s++) { const a = cnt.map((c, j) => c + futPud * (j === seat ? 1 : SC_M[s] * jit(s, j))); const q = KK.puddingPoints(a, np); for (let j = 0; j < np; j++) pp[j] += SC_W[s] * q[j]; } }
  const me = tot[seat] + pp[seat]; let sum = 0, mx = -1e9, n = 0;
  for (let j = 0; j < np; j++) if (j !== seat) { const v = tot[j] + pp[j]; sum += v; n++; if (v > mx) mx = v; }
  return me - (np === 2 ? mx : 0.5 * sum / n + 0.5 * mx);
}
function hardPick(G, seat, opts) {
  const c = makeCtx(G, seat), cs = candidates(c);
  cs.sort((a, b) => b.v - a.v);
  const uniq = [], sig = {};
  for (const x of cs) { const s = x.keys.slice().sort().join('+'); if (sig[s]) continue; sig[s] = 1; uniq.push(x); }
  if (uniq.length === 1) return uniq[0].pick;
  const top = uniq.slice(0, (opts && opts.top) || P.hardTop);
  const worlds = Math.max(8, Math.min(60, Math.floor(((opts && opts.units) || P.hardWorlds) / (top.length * c.L * c.np / 4))));
  const rng = mkRng(seedOf(G, seat, 77)), known = knownHands(G, seat);
  const sum = new Array(top.length).fill(0);
  for (let w = 0; w < worlds; w++) {
    const W = buildWorld(G, seat, rng, known);
    for (let i = 0; i < top.length; i++) { const S = cloneSim(W); rollout(S, seat, top[i].pick); sum[i] += evalSim(S, seat, c.futPud); }
  }
  let bi = 0, bv = -1e18;
  for (let i = 0; i < top.length; i++) { const v = sum[i] / worlds + top[i].v * 0.02; if (v > bv) { bv = v; bi = i; } }
  return top[bi].pick;
}

function choose(G, seat, level, opts) {
  level = level || G.players[seat].ai || 'normal';
  const ms = KK.moves(G, seat); if (!ms.length) return null;
  if (ms.length === 1) return ms[0];
  let pk = level === 'easy' ? easyPick(G, seat) : level === 'hard' ? hardPick(G, seat, opts) : normalPick(G, seat);
  return asMove(G, seat, pk) || ms[0];
}
function step(G, seat) { const m = choose(G, seat); return m ? KK.apply(G, seat, m) : { ok: false, error: 'no move' }; }
function stepAll(G) { let n = 0; for (const p of G.players) if (p.ai && !p.picked && G.phase === 'pick') { if (step(G, p.seat).ok) n++; } return n; }
Object.assign(AI, { choose, step, stepAll, _: { makeCtx, candidates, knownHands, buildWorld, normalPick, hardPick, easyPick, value, mkRng } });
if (typeof module === 'object' && module.exports) module.exports = AI;
})(typeof globalThis !== 'undefined' ? globalThis : this);

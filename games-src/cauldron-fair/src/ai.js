// ===================== Cauldron Fair computer players =====================
// CF.AI.choose(G, seat, level?) -> a legal move for that seat (level: 'easy' | 'normal' | 'hard', default the seat's own level).
// The AI reads only what its seat may know: its own bag CONTENTS (never the order), the pots, scores and the shop. It works on a stripped
// copy of the state in the online tests (net-strip-test.js) and must give a legal move there too.
//   Brewing: expectimax over the kinds of chips still in the bag (depth 0 = random-ish, 1 = normal, 3 = hard) with a value function in
//   "victory-point equivalents": space VP, coins, rubies, the bonus-die chance and the end-of-brew chip powers; flask use is part of the search.
//   Shopping: a per-book-set table of how good each colour is by round (STRAT), with diminishing returns for colours already owned;
//   on hard the best few options are then re-ranked by simulating a whole brew with the new bag (Monte Carlo, common random numbers).
(function (g) {
'use strict';
const CF = g.CF = g.CF || {};
const D = CF.DATA || (typeof require === 'function' ? require('./data.js') : null);
const E = CF;
const AI = CF.AI = { params: {} };
const SPOON = D.SPOON, LASTC = D.LAST_CHIP;
const CW = [0.55, 0.52, 0.48, 0.44, 0.40, 0.35, 0.30, 0.25, 0.20];
const RW = [1.2, 1.15, 1.1, 1.05, 1.0, 0.9, 0.8, 0.65, 0.5];
const DW = [3.0, 2.7, 2.4, 2.1, 1.8, 1.5, 1.1, 0.7, 0];
const OW = [1.6, 1.45, 1.3, 1.15, 1.0, 0.8, 0.6, 0.35, 0];
const FV = [1.4, 1.4, 1.4, 1.4, 1.3, 1.2, 1.0, 0.5, 0];                       // what a full flask is worth to keep
const OPP_MEAN = [9, 11, 13, 15, 18, 21, 26, 31, 36];                           // coin number the best opponent tends to reach
const ck = c => c.c + c.v;
const lerp = (arr, x) => { x = Math.max(0, Math.min(arr.length - 1, x)); const i = Math.floor(x), f = x - i; return i + 1 < arr.length ? arr[i] * (1 - f) + arr[i + 1] * f : arr[i]; };
const ecoins = c => c <= 24 ? c : 24 + (c - 24) * 0.5;
function ncdf(z) { const t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989423 * Math.exp(-z * z / 2); const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; }
function rngOf(G, seat) { let s = (G.round * 7919 + seat * 104729 + G.logN * 31 + 17) | 0; return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ s >>> 15, s | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- a light copy of a seat's brew, used for lookahead ----------
function mkSim(G, p) {
  const counts = {}; let n = 0; for (const c of p.bag) { if (!c || !c.c) continue; counts[ck(c)] = (counts[ck(c)] || 0) + 1; n++; }
  return { G, seat: p.seat, pot: p.pot.map(c => ({ c: c.c, v: c.v, pos: c.pos })), f: Object.assign({}, p.f), ws: CF.whiteSum(p), lim: CF.limitOf(G, p), start: CF.startPos(p), counts, n, flask: p.flask, boom: p.boom, prot: p.prot, safe: p.f.safe || 0,
    vpG: 0, ruG: 0, sideMove: 0, extra: 0, round: G.round };
}
function cloneSim(S) { return Object.assign({}, S, { pot: S.pot.slice(), f: Object.assign({}, S.f), counts: Object.assign({}, S.counts) }); }
function lastPosS(S) { return S.pot.length ? S.pot[S.pot.length - 1].pos : S.start; }
function drawSim(S, key) {                 // draw a chip of `key` out of the bag counts and place it
  const T = cloneSim(S), G = S.G; T.counts[key]--; T.n--; if (T.counts[key] === 0) delete T.counts[key];
  const c = key[0], v = +key.slice(1), eff = CF.effOf(G, c), prev = T.pot[T.pot.length - 1] || null, covered = T.safe > 0;
  const chip = { c, v }; if (T.safe > 0) T.safe--;
  if (c === 'R' && eff === 'r2') { T.sideMove += v; T.sideChips = (T.sideChips || 0) + 1; return T; }
  const fake = { pot: T.pot, f: T.f }; const mv = CF.moveOf(G, fake, chip); T.f.dbl = false;
  chip.pos = Math.min(LASTC, lastPosS(T) + mv + T.extra); T.extra = 0; T.pot.push(chip);
  if (c === 'W') { T.ws += v; T.f.whites = (T.f.whites || 0) + 1; T.lastWhite = true; if (T.ws > CF.limitOf(G, { pot: T.pot })) { T.boom = true; T.prot = covered; } return T; }
  T.lastWhite = false;
  if (c === 'O') return T;
  if (eff === 'y2') T.f.dbl = true;
  else if (eff === 'y1') { if (prev && prev.c === 'W') { const i = T.pot.length - 2; const w = T.pot.splice(i, 1)[0]; T.ws -= w.v; const k = 'W' + w.v; T.counts[k] = (T.counts[k] || 0) + 1; T.n++; } }
  else if (eff === 'b1') { T.extra += [0, 0.9, 2.0, 2.8, 3.4][Math.min(4, v)] * (T.n > 0 ? 1 : 0); }
  else if (eff === 'b2') T.safe = Math.max(T.safe, v);
  else if (eff === 'b3') { if (D.RUBY[chip.pos]) T.ruG++; }
  else if (eff === 'b4') { if (D.RUBY[chip.pos]) T.vpG += v; }
  return T;
}
function powerValue(S, space, pos) {
  const G = S.G, r = S.round - 1; let val = 0; const last2 = S.pot.slice(-2);
  const ng = last2.filter(c => c.c === 'G').length, ge = D.BOOKS.G[G.sets.G].eff;
  if (ng) { if (ge === 'g1') val += ng * RW[r]; else if (ge === 'g2') val += ng * 0.8; else if (ge === 'g4') val += ng * Math.max(0, DW[r] - 2 * RW[r]) * 0.5; }
  if (ge === 'g3' && S.ws === 7) { const s = S.pot.filter(c => c.c === 'G').reduce((a, c) => a + c.v, 0); val += s * (CW[r] + 0.25) * 0.9; }
  const np = S.pot.filter(c => c.c === 'P').length, pe = D.BOOKS.P[G.sets.P].eff;
  if (np) {
    if (pe === 'p1') val += np === 1 ? 1 : np === 2 ? 1 + RW[r] : 2 + DW[r];
    else if (pe === 'p2') val += np === 1 ? 1 + RW[r] + 0.6 : np === 2 ? 3 + DW[r] + 2.2 : 6 + RW[r] + 2 * DW[r] + 3.2;
    else if (pe === 'p3') { for (const c of S.pot) if (c.c === 'P') val += c.pos >= 30 ? 3 : c.pos >= 20 ? 2 : c.pos >= 10 ? 1 : 0; }
    else if (pe === 'p4') val += 0.9 * Math.min(np, 3);
  }
  const nk = S.pot.filter(c => c.c === 'K').length; if (nk) val += (G.np === 2 ? 0.55 : 0.5) * (DW[r] * 0.5 + RW[r] * 0.3) * Math.min(nk, 2);
  const fc = G.fcard; const rub = D.RUBY[Math.round(space)] ? 1 : 0;
  if (fc === 'lucky7' && S.ws === 7) val += DW[r]; if (fc === 'glint' && rub) val += 2; if (fc === 'spark' && rub) val += RW[r];
  return val;
}
function valueStop(S) {
  const r = S.round - 1; let pos = lastPosS(S) + S.sideMove + S.extra;
  const G = S.G;
  if (G.sets.G === 3 && S.ws === 7) { pos += S.pot.filter(c => c.c === 'G').reduce((a, c) => a + c.v, 0); }
  pos = Math.min(LASTC, pos); const space = Math.min(pos + 1, SPOON);
  const coins = lerp(D.COINS, space), vp = lerp(D.VP, space), ruby = D.RUBY[Math.min(SPOON, Math.round(space))] ? 1 : 0;
  const cw = CW[r], rw = RW[r];
  const coinV = S.round === 9 ? coins / 5 : ecoins(coins) * cw;
  const pw = powerValue(S, space, pos) + S.vpG + S.ruG * rw;
  if (S.boom && !S.prot) return Math.max(vp, coinV) + ruby * rw + pw * 0.9;
  const pd = S.boom ? 0 : (S.round === 9 ? 0.5 : ncdf((coins - (OPP_MEAN[r] + (G.np - 2) * 1.5)) / 5.5));
  const dieV = pd * (1 + 2 + 2 * rw + DW[r] + OW[r]) / 6;
  return vp + coinV + ruby * rw + dieV + pw;
}
// value of the best play from here (stop, or keep drawing `depth` more levels)
function best(S, depth) {
  const vs = valueStop(S); if (S.boom || depth <= 0 || S.n <= 0) return { v: vs, draw: false, vs, vd: vs - 1 };
  let vd = 0;
  for (const k in S.counts) {
    const pr = S.counts[k] / S.n; let T = drawSim(S, k); let tv;
    if (T.boom) tv = valueStop(T);
    else {
      tv = best(T, depth - 1).v;
      if (S.flask && T.lastWhite && depth >= 2) { const U = cloneSim(T); const w = U.pot.pop(); U.ws -= w.v; U.counts['W' + w.v] = (U.counts['W' + w.v] || 0) + 1; U.n++; U.flask = false; U.lastWhite = false; const uv = best(U, depth - 1).v - FV[S.round - 1]; if (uv > tv) tv = uv; }
    }
    vd += pr * tv;
  }
  return { v: Math.max(vs, vd), draw: vd > vs, vs, vd };
}
// level table (tests may add their own keys): depth = brew lookahead, margin = how much better drawing must look, shop = shop method, base = shop table level
AI.levels = { easy: { depth: 0, margin: 0, shop: 'easy', base: 'easy', simple: true, noise: 0.25 }, normal: { depth: 1, margin: -0.3, shop: 'normal', base: 'normal' }, hard: { depth: 3, margin: -0.2, shop: 'hard', base: 'normal' } };

// ---------- shop ----------
// How good is each colour by book set (1 = average). Timing: purple late, 4-chips later, 1-chips early.
const STRAT = {
  1: { O: 0.8, G: 1.0, B: 1.25, R: 1.0, Y: 1.45, P: 1.1, K: 0.8 },
  2: { O: 0.8, G: 0.9, B: 1.25, R: 1.1, Y: 1.2, P: 1.2, K: 0.8 },
  3: { O: 0.8, G: 1.0, B: 1.05, R: 1.15, Y: 1.5, P: 1.25, K: 0.8 },
  4: { O: 0.8, G: 1.05, B: 1.15, R: 1.2, Y: 1.2, P: 1.0, K: 0.8 }
};
function stratOf(G, c) { const set = c === 'O' || c === 'K' ? 1 : G.sets[c]; return STRAT[set][c]; }
function timing(c, v, round) {
  let t = 1;
  if (v === 4) t *= round <= 2 ? 0.7 : round <= 4 ? 1.0 : 1.2; else if (v === 2) t *= round <= 1 ? 1 : 1.1; else t *= round >= 7 ? 0.6 : 1;
  if (c === 'P') t *= round <= 4 ? 0.75 : round >= 8 ? 0.7 : 1.1;
  if (c === 'O') t *= round <= 2 ? 1.15 : round >= 6 ? 0.6 : 0.9;
  if (c === 'K') t *= G_NP > 2 ? 1.0 : 0.9;
  return t;
}
let G_NP = 3;
function chipUtil(G, p, key, level) {
  const c = key[0], v = +key.slice(1);
  if (c === 'W') return -3 * v;
  const pr = CF.price(G, c, v);
  let u = pr * (level === 'easy' ? 1 : stratOf(G, c) * timing(c, v, G.round));
  if (level !== 'easy') {
    const own = p.bag.filter(x => x && x.c === c).length + p.newChips.filter(x => x.c === c).length;
    u *= 1 / (1 + 0.28 * own);
    // too many whites in the bag: movers / safe chips are worth more
    const whites = p.bag.filter(x => x && x.c === 'W').reduce((a, x) => a + x.v, 0);
    if (c !== 'W' && whites >= 14) u *= 1.1;
    if (G.round >= 8 && v < 4 && c !== 'P') u *= 0.8;
  }
  return u;
}
function shopChoice(G, p, coins, level, rnd) {
  G_NP = G.np;
  const opts = CF.buyOptions(G, p, coins).filter(o => o.length);
  if (!opts.length) return [];
  const sc = o => o.reduce((a, k) => a + chipUtil(G, p, k, level), 0);
  let scored = opts.map(o => ({ o, s: sc(o) })).sort((a, b) => b.s - a.s);
  if (level === 'easy') { const top = scored.slice(0, 4); const pick = top[Math.floor(rnd() * top.length)]; return rnd() < 0.15 ? [] : pick.o; }
  if (level === 'normal') return scored[0].o;
  // hard: re-rank the best few by simulating whole brews with the new bag
  const cand = scored.slice(0, 7).map(x => x.o);
  const bagNow = p.bag.filter(x => x && x.c).concat(p.newChips).concat(p.pot.map(c => ({ c: c.c, v: c.v })));
  const base = bagNow.map(ck);
  let bestO = cand[0], bestV = -1e9; const sims = 70;
  const seeds = []; for (let i = 0; i < sims; i++) seeds.push(Math.floor(rnd() * 1e9));
  for (const o of cand) {
    const keys = base.concat(o); let tot = 0;
    for (let i = 0; i < sims; i++) tot += rollout(G, p, keys, seeds[i]);
    const v = tot / sims + 0.04 * sc(o) * 0.1; if (v > bestV) { bestV = v; bestO = o; }
  }
  return bestO;
}
// one simulated brew with a bag of chip keys, greedy one-step stopping rule on the contents; returns the value of where it ends
function rollout(G, p, keys, seed, rd) {
  let s = seed | 0; const rr = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ s >>> 15, s | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const arr = keys.slice(); for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rr() * (i + 1)); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
  const counts = {}; for (const k of arr) counts[k] = (counts[k] || 0) + 1;
  let S = { G, seat: p.seat, pot: [], f: { dbl: false, safe: 0, whites: 0 }, ws: 0, lim: CF.limitOf(G, { pot: [], f: {} }), start: Math.min(LASTC, p.droplet + (G.round >= 2 ? 0 : 0)), counts, n: arr.length, flask: false, boom: false, prot: false, safe: 0, vpG: 0, ruG: 0, sideMove: 0, extra: 0, round: rd || Math.min(9, G.round + 1) };
  S.start = p.droplet; let i = arr.length;
  while (i > 0 && !S.boom) {
    const b = best(S, 1); if (!b.draw && S.pot.length > 0) break;
    const k = arr[--i]; S = drawSim(S, k);
  }
  return valueStop(S);
}

// ---------- the choosing ----------
function sigOf(m) { const o = {}; for (const k of Object.keys(m)) if (k !== 'label') o[k] = m[k]; return JSON.stringify(o); }
function pickMove(G, seat, want) {
  const legal = CF.moves(G, seat); if (!legal.length) return null;
  if (want) { const w = sigOf(want); const f = legal.find(m => sigOf(m) === w); if (f) return f; }
  return null;
}
function chipVal(G, p, key, level) { const c = key[0], v = +key.slice(1); return chipUtil(G, p, key, level === 'easy' ? 'easy' : 'normal') / 7.5; }   // rough VP-equivalent of owning one more chip
function choose(G, seat, level) {
  const p = G.players[seat]; level = level || p.ai || 'normal'; const LV = AI.levels[level] || AI.levels.normal; const depth = LV.depth;
  const rnd = rngOf(G, seat); G_NP = G.np; const easy = !!LV.simple;
  const legal = CF.moves(G, seat); if (!legal.length) return null;
  const by = t => legal.filter(m => m.t === t);
  const done = m => pickMove(G, seat, m) || legal[0];
  const r = G.round - 1;
  // ---- brewing
  if (G.phase === 'brew' && p.st === 'draw' && !p.q) {
    const S = mkSim(G, p);
    // rat stone: always the full distance (more is never worse), nothing to choose
    const draw = by('draw')[0], stop = by('stop')[0], flask = by('flask')[0], froth = by('froth')[0], restart = by('restart')[0];
    if (!stop && draw) return draw;
    if (!draw && stop) return stop;
    if (restart && !easy) { const cur = best(S, depth).v; const base = baselineValue(G, p); if (cur < base - 0.6) return restart; }
    if (flask && depth >= 1) {
      const U = cloneSim(S); const w = U.pot.pop(); U.ws -= w.v; U.counts['W' + w.v] = (U.counts['W' + w.v] || 0) + 1; U.n++; U.flask = false;
      const vNow = best(S, depth).v, vFl = best(U, depth).v - FV[r];
      if (vFl > vNow + 0.05) return flask;
    } else if (flask && depth === 0) { if (S.ws >= 6 && rnd() < 0.8) return flask; }
    if (froth) { const U = cloneSim(S); const w = U.pot.pop(); U.ws -= w.v; U.counts['W' + w.v] = (U.counts['W' + w.v] || 0) + 1; U.n++; if (best(U, depth).v > best(S, depth).v + 0.02 || depth === 0) return froth; }
    if (easy) {
      const rk = E.risk(G, seat); const lim = 0.30 + (rnd() - 0.5) * 0.2;
      if (p.pot.length >= 2 && (rk.pBoom > lim || rnd() < 0.05)) return stop; return draw || stop;
    }
    const b = best(S, depth);
    const margin = LV.margin;
    return (b.vd > b.vs + margin) ? draw : stop;
  }
  const q = p.q; if (!q) return legal[0];
  const d = q.d; const S0 = () => mkSim(G, p);
  const bestBy = (list, f) => { let bi = list[0], bv = -1e18; for (const m of list) { const v = f(m); if (v > bv) { bv = v; bi = m; } } return bi; };
  const noisy = (LV.noise || 0) > 0 && rnd() < LV.noise;
  if (noisy) return legal[Math.floor(rnd() * legal.length)];
  switch (q.h) {
    case 'pick': return bestBy(legal, m => m.o === 'rubies' ? 3 * RW[r] : chipVal(G, p, m.o, LV.base) * 1.0);
    case 'swap': return bestBy(legal, m => m.o === '' ? RW[r] : chipVal(G, p, m.o, LV.base));
    case 'clear': return bestBy(legal, m => m.o === 'vp' ? 4 : (G.round <= 3 ? 4.6 : 2.2));
    case 'bribe': { const spaceV = 0.3 + CW[r] * 0.9; return bestBy(legal, m => m.n * (RW[r] - 0 * spaceV) - m.n * spaceV * 0.6 * 0 + (m.n ? 0 : 0) + (RW[r] > spaceV ? m.n : -m.n * 0.01)); }
    case 'bounty': return bestBy(legal, m => m.o === 'vp' ? (p.ratTails || 0) : chipVal(G, p, m.o, LV.base));
    case 'fork': return bestBy(legal, m => m.o === 'drop' ? 2 * DW[r] : chipVal(G, p, m.o, LV.base) * 1.2);
    case 'haggle': return bestBy(legal, m => m.idx < 0 ? 0 : chipVal(G, p, p.hold[m.idx].c + (CF.upgrades(G, p.hold).find(u => u.idx === m.idx).to.slice(1)), LV.base) - chipVal(G, p, ck(p.hold[m.idx]), LV.base) - (p.hold[m.idx].c === 'W' ? 5 : 0));
    case 'crow': case 'peek': {
      const S = S0(); S.counts = Object.assign({}, S.counts); const dep = Math.max(depth - 1, 0);
      const bagCounts = S.counts;
      return bestBy(legal, m => {
        if (m.idx < 0) { return q.h === 'crow' ? best(withReturn(S, p.hold), dep).v : valueStop(withReturn(S, p.hold)); }
        const T = withReturn(S, p.hold.filter((c, i) => i !== m.idx)); const chip = p.hold[m.idx]; const U = placeFrom(T, ck(chip));
        return q.h === 'crow' ? (U.boom ? valueStop(U) : best(U, dep).v) : valueStop(U);
      });
    }
    case 'y1': { return legal.find(m => m.yes === true) || legal[0]; }
    case 'restart': { const S = S0(); const cur = valueStop(S); const base = baselineValue(G, p); return (cur < base - 0.6 ? legal.find(m => m.yes === true) : legal.find(m => m.yes === false)) || legal[0]; }
    case 'side': {
      const c = p.side.find(x => x.i === d.id); if (!c) return legal[0]; const S = S0(); const before = valueStop(S);
      const T = cloneSim(S); T.sideMove += c.v; const after = valueStop(T);
      return legal.find(m => m.o === (after > before + 0.01 ? 'place' : 'keep')) || legal[0];
    }
    case 'gift': return bestBy(legal, m => chipVal(G, p, m.o, LV.base));
    case 'g2': return bestBy(legal, m => m.o === '' ? -1 : chipVal(G, p, m.o, LV.base));
    case 'g4': return bestBy(legal, m => m.n * (DW[r] - 2 * RW[r] * 0.5 - 0.2 * 0) * (DW[r] > RW[r] * 1.2 ? 1 : -1) - 0.0001 * m.n);
    case 'p2': return bestBy(legal, m => m.set.reduce((a, k) => a + (k === 1 ? 1 + RW[r] + 0.6 : k === 2 ? 3 + DW[r] + 2.2 : 6 + RW[r] + 2 * DW[r] + 3.2), 0));
    case 'p4': return bestBy(legal, m => m.from === '' ? 0 : chipVal(G, p, m.to, LV.base) - chipVal(G, p, m.from, LV.base) + 0.3);
    case 'de': {
      const coins = d.coins, vp = d.vp;
      const buy = shopChoice(G, p, coins, easy ? 'easy' : 'normal', rnd); const bv = buy.reduce((a, k) => a + chipVal(G, p, k, LV.base), 0) + 0.1;
      return legal.find(m => m.o === (bv * (LV.shop === 'hard' ? 1.05 : 1) > vp ? 'buy' : 'vp')) || legal[0];
    }
    case 'shop': { const items = shopChoice(G, p, d.coins, LV.shop, rnd); const mv = pickMove(G, seat, { t: 'buy', items }); return mv || bestBy(legal, m => m.items.length); }
    case 'ruby': {
      const rub = p.rubies, mx = Math.floor(rub / 2); let want = { drop: 0, flask: false };
      if (G.round <= 8) {
        let n = mx; let fl = false; const dropVal = DW[r];
        if (!p.flask && mx >= 1 && FV[r] > 0.9) { fl = true; n -= 1; }
        let dr = 0; if (dropVal > 1.0 + 0.0) dr = n;
        if (easy) { dr = Math.min(dr, 1); }
        want = { drop: dr, flask: fl };
      }
      return pickMove(G, seat, { t: 'ruby', drop: want.drop, flask: want.flask }) || legal.find(m => m.drop === 0 && !m.flask) || legal[0];
    }
    default: return legal[0];
  }
}
function withReturn(S, chips) { const T = cloneSim(S); for (const c of chips) { const k = ck(c); T.counts[k] = (T.counts[k] || 0) + 1; T.n++; } return T; }
function placeFrom(T, key) { const U = cloneSim(T); U.counts[key] = (U.counts[key] || 0) + 1; U.n++; return drawSim(U, key); }
// what a brew from scratch with this bag is worth on average (for the do-over decision)
const baseCache = {};
function baselineValue(G, p) {
  const keys = p.bag.filter(c => c && c.c).map(ck).concat(p.pot.map(ck)); let tot = 0; const n = 40;
  for (let i = 0; i < n; i++) tot += rollout(G, p, keys, 1234 + i * 77, G.round);
  return tot / n;
}
AI.choose = choose; AI.shopChoice = shopChoice; AI.valueStop = valueStop; AI.best = best; AI.mkSim = mkSim; AI.STRAT = STRAT;
if (typeof module === 'object' && module.exports) module.exports = AI;
})(typeof globalThis !== 'undefined' ? globalThis : this);

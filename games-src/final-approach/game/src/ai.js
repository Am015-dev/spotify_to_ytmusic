// ===================== Final Approach computer crew member =====================
// The computer plays FAIRLY: every decision starts from FA.stripView(G, seat), so it sees only its own dice plus everything public
// (placed dice, tracks, tokens, how many dice the partner still holds, what the partner said in the briefing). The partner's unplaced
// dice are unknown: every risk is an expectation over the partner holding k independent d6 (the partner uses its best die).
//   FA.AI.move(G, seat, level, opt)  -> one legal move for that seat   (level: 'easy' | 'normal' | 'hard')
//   FA.AI.say(G, seat)               -> up to 2 briefing phrases (codes from FA.SAYS), derived from public state only
// Method: apply each candidate to a light copy of the real engine, then judge the resulting state with a feature model
//   (schedule: can the remaining rounds still deliver the exact distance to the airport at the engine thresholds the markers will have; planes to
//   clear; gear / flaps / brakes still to deploy; dice budget of each seat; axis balance; fuel; trainee; coffee and reroll tokens; and the expected
//   cost of the mandatory axis and engine pairs that are still half done). Every feature is "nats of failure" (minus log of the probability that the
//   task still succeeds), so the scales are principled. The weights are the hand-set prior W0 (FA.AIW is empty): a logistic fit on self-play outcomes (fit.py)
//   and an SPSA search (tune.js) were both tried and neither beat the prior on a fresh 40-game-per-scenario check, so they are not shipped.
// 'hard' additionally samples the partner's unknown dice and plays the rest of the round out for the best few candidates.
(function (g) {
'use strict';
const FA = g.FA = g.FA || {};
const D = FA.DATA || (typeof require === 'function' ? require('./data.js') : null);
const AI = FA.AI = FA.AI || {};
if (!FA.AIW && typeof require === 'function') { try { require('./aiw.js'); } catch (e) { } }

// ---------- model constants (task success rates per round) ----------
const W = AI.W = {
  disaster: 7, choice: 2.6,
  planeS: 0.30, flapQ: 0.333, flapM: 3.0, gearM: 2.6, brakeM: 3.2, brakeCoffee: 0.30, iceP: 0.30, internP: 0.8,
  ax0: 0.86, ax1: 0.66, ax2: 0.42, axR: 0.05, axCoffee: 0.05, axis1: 0.15, axis2: 0.5, tab: 0.5, fuelK: 1.1, leakAvg: 2.5, keroAvg: 2.8, eff: 0.8, lag: 1
};
const FN = ['pairA_n', 'pairA_f', 'pairE_n', 'pairE_f', 'sched', 'planes', 'imminent', 'flaps', 'gear', 'brake', 'intern', 'axisBal', 'fuel', 'tab', 'overload', 'coffee', 'coffeeLate', 'reroll', 'bias'];
const W0 = { pairA_n: 1, pairA_f: 1, pairE_n: 1, pairE_f: 1, sched: 1, planes: 1, imminent: 0.5, flaps: 1, gear: 1, brake: 1, intern: 1, axisBal: 1, fuel: 1, tab: 1, overload: 0.9, coffee: -0.1, coffeeLate: -0.05, reroll: -0.15, bias: 0 };
AI.FN = FN; AI.W0 = W0;
AI.w = Object.assign({}, W0, (FA.AIW && FA.AIW.w) || {});
if (FA.AIW && FA.AIW.c) Object.assign(W, FA.AIW.c);
const PS = new Array(14).fill(0); for (let a = 1; a <= 6; a++) for (let b = 1; b <= 6; b++) PS[a + b] += 1 / 36;
const cdf = x => { let s = 0; for (let i = 2; i <= Math.min(12, Math.floor(x)); i++) s += PS[i]; return s; };
const nats = p => -Math.log(Math.max(p, 1e-3));

// ---------- state readers ----------
const trk = S => D.tracks[S.tk];
const finalIdx = S => D.rounds - 1 - S.row0;
const enginesDone = S => !!(S.slots.en0 && S.slots.en1);
const axisDone = S => !!(S.slots.ax0 && S.slots.ax1);
function remAdv(S) { if (FA.isFinal(S)) return 0; return (enginesDone(S) ? 0 : 1) + Math.max(0, finalIdx(S) - 1 - S.round); }
const unplaced = (S, s) => FA.unusedDice(S, s).length;
const wm = S => FA.windMod(S);
function advProbs(blue, orange, w) {
  const bl = blue - w, orr = orange - w;
  const p0 = cdf(bl), p1 = Math.max(0, cdf(orr) - cdf(bl)), p2 = Math.max(0, 1 - cdf(orr));
  const f = p => 1 - Math.pow(1 - p, W.choice);
  return [f(p0), f(p1), f(p2)];
}
const cache = new Map();
// nats of failure of the schedule: the best plan of x two-step, y one-step and z standing rounds delivers exactly distance d
function schedCost(d, r, blue, orange, w) {
  if (r <= 0) return d === 0 ? 0 : W.disaster;
  if (d > 2 * r) return W.disaster;
  const key = d * 100000 + r * 10000 + blue * 400 + orange * 20 + (w + 5);
  let c = cache.get(key); if (c !== undefined) return c;
  const P = advProbs(blue, orange, w);
  let best = 0;
  for (let x = 0; x <= r; x++) { const y = d - 2 * x; if (y < 0) break; const z = r - x - y; if (z < 0) continue; const p = Math.pow(P[2], x) * Math.pow(P[1], y) * Math.pow(P[0], z); if (p > best) best = p; }
  c = Math.min(W.disaster, nats(best)); cache.set(key, c); if (cache.size > 20000) cache.clear(); return c;
}
function binAtLeast(n, p, k) { if (k <= 0) return 1; if (n < k) return 0; p = Math.max(1e-4, Math.min(0.9999, p)); let c = 0, t = Math.pow(1 - p, n); for (let i = 0; i < k; i++) { c += t; t *= (n - i) / (i + 1) * p / (1 - p); } return Math.max(0, Math.min(1, 1 - c)); }
function gearProb(gl, n, boost) { let dist = [0, 0, 0, 0]; dist[gl] = 1; for (let i = 0; i < n; i++) { const nd = [0, 0, 0, 0]; for (let k = 0; k <= 3; k++) { if (!dist[k]) continue; const p = Math.min(0.95, k / 3 + boost); if (k === 0) nd[0] += dist[0]; else { nd[k] += dist[k] * (1 - p); nd[k - 1] += dist[k] * p; } } dist = nd; } return dist[0]; }
function advOutcome(S, s) {
  const adv = s <= S.pl.aeroB ? 0 : s <= S.pl.aeroO ? 1 : 2, sp = trk(S).sp, size = sp.length;
  for (let i = 0; i < adv; i++) {
    const p = S.pl.pos + i; if (p >= size) return { ok: false, adv };
    const cur = sp[p - 1];
    if (S.mods.tabs && cur[2] && !cur[2].includes(S.pl.axis)) return { ok: false, adv };
    if (S.planes[p - 1] > 0) return { ok: false, adv };
  }
  return { ok: true, adv };
}
function axisBase(S, a) {
  const A = Math.abs(a);
  if (A >= 3) return W.disaster;
  if (FA.isFinal(S)) return a === 0 ? 0 : W.disaster;
  let c = A === 0 ? 0 : A === 1 ? W.axis1 : W.axis2;
  if (S.mods.tabs) { const sp = trk(S).sp, cur = sp[Math.min(S.pl.pos, sp.length) - 1]; if (cur && cur[2] && !cur[2].includes(a)) c += W.tab; }
  return c;
}
// nats of the expected survival chance of the best of k unknown dice, given the nats cost of each face 1..6
function expMin(costs, k) {
  if (k <= 0) return W.disaster;
  const p = costs.map(c => c >= W.disaster ? 0 : Math.exp(-c)).sort((x, y) => y - x); let e = 0;
  for (let j = 0; j < 6; j++) e += p[j] * (Math.pow((6 - j) / 6, k) - Math.pow((5 - j) / 6, k));
  return Math.min(W.disaster, nats(e));
}
function faceCosts(costFn, coffee) { const o = []; for (let v = 1; v <= 6; v++) { let b = 1e9; for (let c = -Math.min(coffee, v - 1); c <= Math.min(coffee, 6 - v); c++) { const x = costFn(v + c) + Math.abs(c) * 0.12; if (x < b) b = x; } o.push(b); } return o; }

// ---------- pending mandatory pairs: expected nats of finishing axis and engines (my dice known, partner's k unknown) ----------
function pairsCost(S, me, dist, out) {
  const o = 1 - me, final = FA.isFinal(S), w = wm(S), a0 = S.pl.axis, kp = unplaced(S, o), coffee = S.coffee;
  const mine = FA.unusedDice(S, me).map(i => S.dice[me][i].v);
  const val = (kind, seat) => { const sl = S.slots[(kind === 'A' ? 'ax' : 'en') + seat]; return sl ? sl.v : 0; };
  const tA = {}, tE = {};
  for (let d = -5; d <= 5; d++) tA[d] = axisBase(S, a0 + d);
  const rAfter = remAdv(S) - 1;
  for (let t = 2; t <= 12; t++) {
    const s = t + w;
    if (final) { const br = FA.brakeVal(S); tE[t] = (s <= br && br >= 2) ? 0 : W.disaster; }
    else { const r = advOutcome(S, s); tE[t] = r.ok ? schedCost(dist - r.adv, rAfter, S.pl.aeroB, S.pl.aeroO, w) : W.disaster; }
  }
  const F = { A: (p, c) => tA[c - p], E: (e0, e1) => tE[e0 + e1] };
  const f2 = (kind, vMe, vO) => me === 0 ? F[kind](vMe, vO) : F[kind](vO, vMe);
  const needMe = { A: !val('A', me), E: !val('E', me) }, needO = { A: !val('A', o), E: !val('E', o) };
  const bothO = needO.A && needO.E;
  const kEff = kind => { let k = kp; if (needMe[kind] && needO[kind]) k = Math.max(1, kp - W.lag); if (bothO && kind === 'E') k = Math.max(1, k - 1); return k; };
  const tot = { A: 0, E: 0 };
  for (const kind of ['A', 'E']) if (!needMe[kind] && needO[kind]) tot[kind] += expMin(faceCosts(y => f2(kind, val(kind, me), y), coffee), kEff(kind));
  const costMe = (kind, v) => !needO[kind] ? f2(kind, v, val(kind, o)) : expMin(faceCosts(y => f2(kind, v, y), coffee), kEff(kind));
  const best = (kind, v) => { let b = 1e9; for (let c = -Math.min(coffee, v - 1); c <= Math.min(coffee, 6 - v); c++) { const x = costMe(kind, v + c) + Math.abs(c) * 0.12; if (x < b) b = x; } return b; };
  const N = ['A', 'E'].filter(k => needMe[k]);
  const memo = {}; const bestM = (kind, v) => { const k = kind + v; return memo[k] !== undefined ? memo[k] : (memo[k] = best(kind, v)); };
  if (N.length === 1) { let b = W.disaster; for (const v of mine) { const c = bestM(N[0], v); if (c < b) b = c; } tot[N[0]] += b; }
  else if (N.length === 2) { let ba = W.disaster * 2, bA = 0, bE = 0; for (let i = 0; i < mine.length; i++) for (let j = 0; j < mine.length; j++) { if (i === j) continue; const a = bestM('A', mine[i]), e = bestM('E', mine[j]); if (a + e < ba) { ba = a + e; bA = a; bE = e; } } tot.A += bA; tot.E += bE; if (mine.length < 2) { tot.A += W.disaster; } }
  out[final ? 'pairA_f' : 'pairA_n'] += tot.A; out[final ? 'pairE_f' : 'pairE_n'] += tot.E;
}
const P2 = S => { let n = 0; for (let i = S.pl.pos - 1; i < S.planes.length; i++) n += S.planes[i]; return n; };

// ---------- feature vector of a state for the seat being advised ----------
function features(S, me) {
  const f = {}; for (const k of FN) f[k] = 0;
  const sp = trk(S).sp, size = sp.length, pos = S.pl.pos, dist = size - pos, inPlace = S.phase === 'place', final = FA.isFinal(S);
  if (inPlace) {
    for (let s = 0; s < 2; s++) { const need = (S.slots['ax' + s] ? 0 : 1) + (S.slots['en' + s] ? 0 : 1); if (unplaced(S, s) < need) { f[final ? 'pairE_f' : 'pairE_n'] += W.disaster; } }
    pairsCost(S, me, dist, f);
    if (!enginesDone(S) && !final && !(S.slots.en0 || S.slots.en1)) f.sched += schedCost(dist, remAdv(S), S.pl.aeroB, S.pl.aeroO, wm(S)) * 0.7;
    else if (enginesDone(S) && !final) f.sched += schedCost(dist, remAdv(S), S.pl.aeroB, S.pl.aeroO, wm(S));
  } else if (!final) f.sched += schedCost(dist, remAdv(S), S.pl.aeroB, S.pl.aeroO, wm(S));
  const rem = D.rounds - S.row0 - S.round, idx = S.round;
  const Rf = Math.max(0, rem - (inPlace ? 0.5 : 0));
  const avgAdv = remAdv(S) > 0 ? Math.max(1, dist / remAdv(S)) : 1;
  for (let i = pos - 1; i < size; i++) {
    const n = S.planes[i]; if (!n) continue;
    const q = i - (pos - 1), avail = Math.max(1, Math.min(rem, Math.ceil((q + 1) / avgAdv)));
    f.planes += n * nats(1 - Math.pow(1 - W.planeS * (q > 5 ? 0.3 : 1), avail));
    if (q <= 1) f.imminent += n;
  }
  const gl = 3 - S.pl.sw.lg[0] - S.pl.sw.lg[1] - S.pl.sw.lg[2], fl = 4 - S.pl.sw.fl[0] - S.pl.sw.fl[1] - S.pl.sw.fl[2] - S.pl.sw.fl[3];
  const cb = Math.min(S.coffee, 2) * 0.04 + (S.rrHand ? 0.04 : 0);
  if (fl > 0) f.flaps = nats(binAtLeast(Math.round(W.flapM * Rf), Math.min(0.9, W.flapQ + cb), fl));
  if (gl > 0) f.gear = nats(gearProb(gl, Math.round(W.gearM * Rf), cb));
  let brLeft = 0;
  if (S.mods.ice) {
    brLeft = 4 - S.pl.ice;
    if (brLeft > 0) {
      const P = (n, R) => n <= 0 ? 1 : binAtLeast(Math.round(R * 2), W.iceP + cb, n);
      const k = S.pl.ice, tIn = !!S.slots['it' + k], bIn = !!S.slots['ib' + k], half = inPlace && (tIn !== bIn);
      if (half) {
        // one half of the current column is down: the other half must come from a die of exactly that value, this round
        const v = D.iceBrakes[k], reach = Math.min(S.coffee, 3), q = Math.min(0.9, 1 / 6 + 0.11 * reach);
        const mineHas = s => FA.unusedDice(S, s).some(i => Math.abs(S.dice[s][i].v - v) <= reach);
        const kOf = s => unplaced(S, s) - ((S.slots['ax' + s] ? 0 : 1) + (S.slots['en' + s] ? 0 : 1));
        const tryS = s => s === me ? (mineHas(s) ? 0.97 : 0) : 1 - Math.pow(1 - q, Math.max(0, kOf(s)));
        const needPilot = !tIn;      // the top space is the pilot's
        const pc = needPilot ? tryS(0) : 1 - (1 - tryS(0)) * (1 - tryS(1));
        const after = Math.max(0, rem - 1);
        f.brake = nats(pc * P(brLeft - 1, after) + (1 - pc) * P(brLeft, after));
      } else f.brake = nats(P(brLeft, Rf));
    }
  }
  else { const nb = S.pl.sw.br[0] + S.pl.sw.br[1] + S.pl.sw.br[2]; brLeft = Math.max(0, 2 - nb); if (brLeft > 0) f.brake = nats(binAtLeast(Math.round(W.brakeM * Rf), 1 / 6 + (S.coffee > 0 ? W.brakeCoffee : 0) + cb * 0.5, brLeft)); }
  let internLeft = 0; if (S.mods.intern) { internLeft = S.intern.length; if (internLeft > 0) f.intern = nats(binAtLeast(Math.round(2 * Rf), W.internP, internLeft)); }
  { const after = Math.max(0, rem - 1), mand = s => (S.slots['ax' + s] ? 0 : 1) + (S.slots['en' + s] ? 0 : 1);
    const free = s => Math.max(0, (inPlace ? unplaced(S, s) - mand(s) : 2) + 2 * after);
    const pF = free(0) * W.eff, cF = free(1) * W.eff, pN = gl + brLeft, cN = fl, sN = P2(S) + internLeft;
    f.overload = Math.max(0, pN - pF) + Math.max(0, cN - cF) + Math.max(0, pN + cN + sN - pF - cF);
    if (pN > free(0) || cN > free(1) || pN + cN + sN > free(0) + free(1)) f.overload += 4;
  }
  f.coffee = S.coffee; f.coffeeLate = S.coffee * Math.min(6, idx); f.reroll = S.rrHand;
  { const A = Math.abs(S.pl.axis); const base = A === 0 ? W.ax0 : A === 1 ? W.ax1 : W.ax2; const pa = Math.min(0.97, base + (A ? W.axR * Math.max(0, rem - 1) : 0) + W.axCoffee * S.coffee); f.axisBal = final ? (axisDone(S) ? (S.pl.axis === 0 ? 0 : W.disaster) : 0) : nats(pa); }
  if (S.mods.kero) {
    // burn still to come: this round (a low die goes on the fuel space, else 6 at the round end) plus about 2.8 in each later round
    const later = Math.max(0, rem - 1), mnd = s => (S.slots['ax' + s] ? 0 : 1) + (S.slots['en' + s] ? 0 : 1);
    const freeT = inPlace ? Math.max(0, unplaced(S, 0) - mnd(0)) + Math.max(0, unplaced(S, 1) - mnd(1)) : 4;
    const cur = (S.fl.keroUsed) ? 0 : (!inPlace ? 2.8 : 2.8 + 3.2 * Math.pow(0.6, freeT));
    const mu = S.pl.kero - later * W.keroAvg - cur, sd = 1.5 + 0.9 * Math.sqrt(later + 1);
    f.fuel = nats(1 / (1 + Math.exp(-1.7 * mu / sd)));
  }
  if (S.mods.leak) { const later = Math.max(0, rem - (enginesDone(S) ? 1 : 0)), mu = S.pl.kero - later * W.leakAvg, sd = 1.5 + 0.9 * Math.sqrt(later + 1); f.fuel = nats(1 / (1 + Math.exp(-1.7 * mu / sd))); }
  if (S.mods.tabs && !final) { const cur = sp[Math.min(pos, size) - 1]; if (cur && cur[2] && !cur[2].includes(S.pl.axis)) f.tab = 1; }
  f.bias = 1;
  return f;
}
const dot = f => { let c = 0; const w = AI.w; for (const k of FN) c += (w[k] || 0) * f[k]; return c; };
// cost (lower = better) of a state for seat `me`
function cost(S, me) {
  if (S.result) return S.result.win ? -50 : 100;
  return dot(features(S, me));
}

// ---------- candidate handling ----------
function distinct(moves, G, seat) {
  const seen = new Set(), out = [];
  for (const m of moves) {
    let k;
    if (m.t === 'place') { const v = m.d === 'p' ? (G.pend.d.val) : G.dice[seat][m.d].v; k = 'p|' + v + '|' + m.to + '|' + m.c; }
    else if (m.t === 'toss') k = 't|' + (m.d === 'p' ? 'p' : G.dice[seat][m.d].v);
    else if (m.t === 'adapt' || m.t === 'antic' || m.t === 'wt' || m.t === 'wt2') k = m.t + '|' + G.dice[seat][m.d].v;
    else k = m.t + (m.c || '');
    if (seen.has(k)) continue; seen.add(k); out.push(m);
  }
  return out;
}
function afterMove(G, m, seat) { const S = FA.cloneLite(G); FA.performMove(S, m, seat, true); return S; }
// how much a die of value v is worth for this seat right now: the best cost reduction over its legal placements
function bestFor(G, seat, v, base) {
  const S0 = FA.cloneLite(G); const d = S0.dice[seat].findIndex(x => !x.u); if (d < 0) return 0;
  S0.dice[seat][d].v = v;
  const coffee = S0.coffee; let best = -1e9, any = false;
  for (let c = -Math.min(coffee, v - 1); c <= Math.min(coffee, 6 - v); c++) for (const key of S0.keys) if (FA.fits(S0, seat, key, v + c, 'die')) { any = true; const S = FA.cloneLite(S0); FA.performMove(S, { t: 'place', d, to: key, c }, seat, true); const sc = base - cost(S, seat); if (sc > best) best = sc; }
  return any ? best : -5;
}

// ---------- briefing talk ----------
function sayCodes(G, seat) {
  const V = FA.stripView(G, seat), out = [], size = trk(V).sp.length, pos = V.pl.pos, dist = size - pos, r = remAdv(V);
  const w = wm(V), P = [0, 1, 2].map(a => (dist - a < 0 || (V.planes[pos - 1] > 0 && a > 0)) ? 1e9 : schedCost(dist - a, r - 1, V.pl.aeroB, V.pl.aeroO, w));
  if (!FA.isFinal(V)) { const a = P.indexOf(Math.min(...P)); if (Math.min(...P) < W.disaster - 0.01) out.push('adv' + a); }
  const near = V.planes.slice(pos - 1, pos + 1).reduce((s, x) => s + x, 0); if (near > 0) out.push('plane');
  if (Math.abs(V.pl.axis) >= 1) out.push('level');
  const rem = D.rounds - V.row0 - V.round;
  if (FA.isFinal(V)) { out.push('brakes'); out.push('slow'); }
  else if (rem <= 3) { if (V.pl.sw.fl.some(x => !x)) out.push('flaps'); if (V.pl.sw.lg.some(x => !x)) out.push('gear'); if (V.pl.sw.br[0] + V.pl.sw.br[1] === 0 && !V.mods.ice) out.push('brakes'); }
  if (V.mods.intern && V.intern.length > rem * 1.5) out.push('trainee');
  if (V.mods.kero || V.mods.leak) if (V.pl.kero < 10) out.push('fuel');
  return out.filter((c, i, a) => a.indexOf(c) === i).slice(0, 2);
}

// ---------- the move chooser ----------
function move(G0, seat, level, opt) {
  level = level || 'normal'; opt = opt || {}; const rand = opt.rand || Math.random;
  const G = FA.stripView(G0, seat); G.nolog = true;               // fairness: only what this seat may know
  const all = FA.validMoves(G, seat); if (!all.length) return null;
  if (G.phase === 'brief') {
    const sg = sayCodes(G, seat).filter(c => all.some(m => m.t === 'say' && m.c === c) && !G.say[seat].includes(c));
    if (level !== 'easy' && sg.length && G.say[seat].length < 2) return { t: 'say', c: sg[0] };
    return { t: 'ready' };
  }
  if (G.pend) {
    const rr = all.find(m => m.t === 'rrpick'); if (rr) return rrMask(G, seat, level, rand);
    const w2 = all.filter(m => m.t === 'wt2'); if (w2.length) return wtPick(G, seat, w2);
    const base = cost(G, seat);
    const sc = distinct(all, G, seat).filter(m => m.t !== 'timeout').map(m => ({ m, s: base - cost(afterMove(G, m, seat), seat) }));
    sc.sort((a, b) => b.s - a.s);
    if (level === 'easy' && rand() < 0.3) return sc[Math.min(sc.length - 1, Math.floor(rand() * 3))].m;
    return sc[0].m;
  }
  const cand = distinct(all.filter(m => m.t !== 'timeout'), G, seat);
  const base = cost(G, seat);
  const scored = cand.filter(m => m.t === 'place' || m.t === 'toss').map(m => ({ m, s: base - cost(afterMove(G, m, seat), seat) }));
  scored.sort((a, b) => b.s - a.s);
  if (level !== 'easy') { const free = freeAction(G, seat, cand, base); if (free) return free; }
  if (opt.eps && rand() < opt.eps && scored.length > 1) return scored[Math.min(scored.length - 1, 1 + Math.floor(rand() * 2))].m;   // exploration for training data
  if (level === 'easy') {
    const safe = scored.filter(x => x.s > -60), pool = safe.length ? safe : scored;
    if (rand() < 0.35) return pool[Math.min(pool.length - 1, Math.floor(rand() * 4))].m;
    return pool[0].m;
  }
  if ((level === 'hard' || level === 'normal') && scored.length > 1 && !opt.noMC) return monteCarlo(G, seat, scored, rand, Object.assign(level === 'hard' ? { top: AI.HMC.top, samples: AI.HMC.samples } : { top: AI.NMC.top, samples: AI.NMC.samples }, opt));
  return scored[0].m;
}
function freeAction(G, seat, cand, base) {
  const mine = FA.unusedDice(G, seat); if (!mine.length) return null;
  const rem = D.rounds - G.row0 - G.round, can = t => cand.filter(m => m.t === t);
  if (!can('rr').length && !can('adapt').length && !can('antic').length && !can('wt').length) return null;
  const val = {}; for (let v = 1; v <= 6; v++) val[v] = bestFor(G, seat, v, base);
  const fresh = (val[1] + val[2] + val[3] + val[4] + val[5] + val[6]) / 6;
  let best = null;
  const consider = (m, gain, need) => { if (gain > need && (!best || gain > best.g)) best = { m, g: gain }; };
  for (const m of can('adapt')) { const v = G.dice[seat][m.d].v; consider(m, val[7 - v] - val[v], 1.2); }
  for (const m of can('antic')) { const v = G.dice[seat][m.d].v; consider(m, fresh - val[v], 0.5); }
  for (const m of can('wt')) { const v = G.dice[seat][m.d].v; consider(m, fresh - val[v], 1.0); }
  if (best) return best.m;
  if (can('rr').length) { const gain = mine.reduce((s, i) => s + Math.max(0, fresh - val[G.dice[seat][i].v] - 0.25), 0); if (gain > (rem <= 2 ? 0.8 : 1.6)) return can('rr')[0]; }
  return null;
}
function rrMask(G, seat, level, rand) {
  const mine = FA.unusedDice(G, seat), base = cost(G, seat), val = {}; for (let v = 1; v <= 6; v++) val[v] = bestFor(G, seat, v, base);
  const fresh = (val[1] + val[2] + val[3] + val[4] + val[5] + val[6]) / 6, m = [false, false, false, false];
  if (level === 'easy') { for (const i of mine) m[i] = G.dice[seat][i].v <= 2 && rand() < 0.7; return { t: 'rrpick', m }; }
  for (const i of mine) m[i] = val[G.dice[seat][i].v] < fresh - 0.25;
  return { t: 'rrpick', m };
}
function wtPick(G, seat, w2) {
  const base = cost(G, seat), val = {}; for (let v = 1; v <= 6; v++) val[v] = bestFor(G, seat, v, base);
  let best = w2[0], b = 1e9; for (const m of w2) { const v = val[G.dice[seat][m.d].v]; if (v < b) { b = v; best = m; } } return best;
}

// ---------- Monte Carlo over the partner's unknown dice (hard) ----------
function sampleWorld(G, seat, rand) {
  const W2 = FA.cloneLite(G); W2.rng = (Math.floor(rand() * 4294967296) | 0);
  const o = 1 - seat; for (const i of FA.unusedDice(W2, o)) W2.dice[o][i].v = 1 + Math.floor(rand() * 6);
  return W2;
}
function quickMove(S, seat) {
  const mv = FA.validMoves(S, seat).filter(m => m.t === 'place' || m.t === 'toss' || m.t === 'rrpick' || m.t === 'wt2');
  if (!mv.length) return null;
  const pl = distinct(mv, S, seat); if (pl.length === 1) return pl[0];
  let best = pl[0], b = 1e9;
  for (const m of pl) { const c = cost(afterMove(S, m, seat), seat); if (c < b) { b = c; best = m; } }
  return best;
}
function rollout(S, startRound) {
  let guard = 0;
  while (!S.result && S.round === startRound && S.phase === 'place' && guard++ < 24) {
    const seats = FA.pending(S); if (!seats.length) break; const s = seats[0];
    const m = quickMove(S, s); if (!m) break; FA.performMove(S, m, s, true);
  }
  return S;
}
function monteCarlo(G, seat, scored, rand, opt) {
  const K = Math.min(opt.top || 5, scored.length), N = opt.samples || 8, top = scored.slice(0, K), r0 = G.round, tot = top.map(() => 0);
  for (let n = 0; n < N; n++) {
    const W0 = sampleWorld(G, seat, rand);
    for (let i = 0; i < K; i++) { const S = FA.cloneLite(W0); FA.performMove(S, top[i].m, seat, true); rollout(S, r0); tot[i] += cost(S, seat); }
  }
  let bi = 0; for (let i = 1; i < K; i++) if (tot[i] < tot[bi] - 1e-9) bi = i;
  return top[bi].m;
}

AI.NMC = AI.NMC || { top: 3, samples: 3 };   // normal: a small Monte Carlo over the partner's unknown dice
AI.HMC = AI.HMC || { top: 5, samples: 8 };   // hard: a bigger one
AI.move = move; AI.say = (G, seat) => sayCodes(G, seat); AI.cost = cost; AI.features = features; AI.schedCost = schedCost; AI.score = cost;
if (typeof module === 'object' && module.exports) module.exports = FA;
})(typeof globalThis !== 'undefined' ? globalThis : this);

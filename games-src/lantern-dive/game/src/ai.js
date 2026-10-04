// ===================== Lantern Dive computer divers =====================
// Every computer diver decides from ITS OWN VIEW only: LD.stripView(G, seat) = its own hand, the cards played, the job cards, the shown
// (pinged) cards and its own memory of a card it passed or received. It never reads another hand, the order of the job deck or the seed.
// Method (determinised Monte Carlo, "perfect information Monte Carlo"): sample worlds for the hidden hands that fit everything it has seen
// (follow-suit voids, ping marks, passed cards), play each candidate card and finish the dive with a cheap cooperative greedy policy for
// every seat, and keep the card that finishes the dive most often. The same machinery rates job cards (how well do I fit this job compared
// with the others?), picks cards to pass and predictions, and decides when a ping helps the team.
// Randomness is seeded from the view itself, so the same view always gives the same decision (tests prove it with poisoned states).
(function (g) {
'use strict';
const LD = g.LD || require('./engine.js');
const AI = LD.AI = {};
const D = LD.DATA, TASKS = D.tasks, KIND = LD._.KIND;
const suit = LD.suit, val = LD.val, LAN = 4;
const P = AI.params = { easy: { K: 2, noise: .22, ping: 0, dist: 99, roll: 1 }, normal: { K: 5, noise: 0, ping: 1.6, dist: 3, roll: 1 }, hard: { K: 9, noise: 0, ping: 1.2, dist: 2, roll: 1 } };
const lvl = l => P[l] || P.normal;
// ---------- seeded rng from the view ----------
function hash(V, me, extra) {
  let h = 2166136261 ^ (me + 1) * 977;
  const mix = x => { h = Math.imul(h ^ (x + 0x9e37), 16777619); };
  V.players[me].hand.forEach(mix); mix(V.tricks.length); mix(V.att); mix(V.trick ? V.trick.plays.length : 7);
  if (V.trick) V.trick.plays.forEach(p => { mix(p.c); mix(p.s); });
  V.tricks.forEach(k => mix(k.wc)); G_mix(V, mix); if (extra) mix(extra);
  return h >>> 0;
}
function G_mix(V, mix) { V.tasks.forEach(t => { mix(t.id); mix(t.owner + 3); }); mix(V.cap); }
function mkrng(seed) { let t = seed >>> 0; return () => { t = (t + 0x6D2B79F5) | 0; let r = Math.imul(t ^ t >>> 15, 1 | t); r = r + Math.imul(r ^ r >>> 7, 61 | r) ^ r; return ((r ^ r >>> 14) >>> 0) / 4294967296; }; }
// ---------- what I know about the other hands ----------
function belief(V, me) {
  const np = V.np, pl = V.pl, hnd = V.players[me].hand;
  const B = { me, np, mine: hnd.slice(), void: [], known: [], cnt: [], hidden: [], cons: [], helperBottoms: 0 };
  for (let s = 0; s < np; s++) { B.void.push(new Set()); B.known.push([]); B.cons.push([]); B.cnt.push(0); }
  const note = pl2 => { for (const p of pl2) { }; };
  const trickLists = V.tricks.map(k => ({ ls: k.ls, plays: k.plays })); if (V.trick && V.trick.plays.length) trickLists.push({ ls: V.trick.ls, plays: V.trick.plays });
  for (const k of trickLists) for (const p of k.plays) if (suit(p.c) !== k.ls && !V.players[p.s].helper) B.void[p.s].add(k.ls);
  const located = new Set(hnd);
  for (let s = 0; s < np; s++) {
    const p = V.players[s];
    if (s === me) continue;
    if (p.helper) {
      for (const st of p.stacks) { if (st[0] >= 0) { B.known[s].push(st[0]); located.add(st[0]); } if (st[1] !== -1) B.helperBottoms++; }
      B.cnt[s] = p.stacks.reduce((a, st) => a + (st[0] >= 0 ? 1 : 0), 0);
    } else B.cnt[s] = p.hand.length;
  }
  // own controller also plays the drone: its face-up cards are known to everybody, nothing more
  for (const pg of V.pings) { if (pg.seat === me || pl[pg.c]) continue; if (!located.has(pg.c)) { B.known[pg.seat].push(pg.c); located.add(pg.c); } }
  const mem = V.players[me].mem || {};
  if (mem.gave && !pl[mem.gave.c] && !located.has(mem.gave.c) && !V.players[mem.gave.to].helper) { B.known[mem.gave.to].push(mem.gave.c); located.add(mem.gave.c); }
  // ping constraints on what the pinger still holds of that suit
  for (const pg of V.pings) { if (pg.seat === me) continue; B.cons[pg.seat].push({ su: suit(pg.c), v: val(pg.c), k: pg.k }); }
  B.unseen = []; for (let c = 0; c < 40; c++) if (!pl[c] && !located.has(c)) B.unseen.push(c);
  // seats that need cards: count minus known located ones
  B.need = []; let helperSeat = -1;
  for (let s = 0; s < np; s++) {
    if (s === me) { B.need.push(0); continue; }
    const p = V.players[s];
    if (p.helper) { helperSeat = s; B.need.push(B.helperBottoms); continue; }
    B.need.push(Math.max(0, p.hand.length - B.known[s].length));
  }
  B.helperSeat = helperSeat; return B;
}
function allowed(B, s, c, rngPick) {
  if (B.void[s].has(suit(c))) return false;
  for (const k of B.cons[s]) {
    if (suit(c) !== k.su) continue;
    let kk = k.k; if (kk === '') kk = rngPick ? rngPick(s, k) : 'high';
    if (kk === 'high' && val(c) > k.v) return false;
    if (kk === 'low' && val(c) < k.v) return false;
    if (kk === 'only' && c !== k.c) return false;
  }
  return true;
}
function sampleHands(V, B, rng) {
  const np = B.np;
  for (let attempt = 0; attempt < 12; attempt++) {
    const murk = {}; const rp = (s, k) => { const key = s + ':' + k.su + ':' + k.v; if (murk[key] === undefined) murk[key] = rng() < .5 ? 'high' : 'low'; return murk[key]; };
    const relax = attempt >= 9;
    const seats = []; for (let s = 0; s < np; s++) if (s !== B.me && B.need[s] > 0) seats.push(s);
    const pool = B.unseen.slice(); const out = []; for (let s = 0; s < np; s++) out.push(B.known[s].slice());
    // forced cards: only one seat can hold them
    const left = {}; seats.forEach(s => { left[s] = B.need[s]; });
    const can = c => seats.filter(s => left[s] > 0 && (relax || s === B.helperSeat || allowed(B, s, c, rp)));
    // order the pool: cards with the fewest possible holders first
    const items = pool.map(c => ({ c, k: can(c).length, r: rng() })).sort((a, b) => a.k - b.k || a.r - b.r);
    let ok = true; const bag = [];
    for (const it of items) {
      const cs = can(it.c); if (!cs.length) { bag.push(it.c); continue; }
      // prefer the seat with the most room (keeps the deal even); random among those
      let best = cs[0], bw = -1; for (const s of cs) { const w = left[s] * (.6 + rng()); if (w > bw) { bw = w; best = s; } }
      out[best].push(it.c); left[best]--;
    }
    for (const c of bag) { const s = seats.find(s => left[s] > 0); if (s === undefined) { ok = false; break; } out[s].push(c); left[s]--; }
    if (ok && seats.every(s => left[s] === 0)) return out;
  }
  return null;
}
// ---------- a simulation state shaped like G (so the real rules run unchanged) ----------
function simBase(V) {
  const W = {
    v: 1, np: V.np, hn: V.hn, two: V.two, helper: V.helper, mission: V.mission, comm: V.comm, cap: V.cap, ntr: V.ntr, nolog: true, phase: 'play', att: V.att, logN: 0, evN: 0, log: [], events: [], pool: 0,
    pl: V.pl.slice(), tricks: V.tricks.slice(), pings: V.pings, firstW: V.firstW, lastCard: V.lastCard, offered: V.offered, result: null, rng: 1, seed: 1,
    tasks: V.tasks.map(t => ({ id: t.id, owner: t.owner, pn: t.pn, st: 0 })),
    players: V.players.map(p => ({ seat: p.seat, helper: p.helper, hand: [], stacks: null })), trick: null
  };
  return W;
}
function fillWorld(W, V, B, hands) {
  W.players.forEach((p, s) => {
    const vp = V.players[s];
    if (s === B.me) { p.hand = vp.hand.slice(); if (vp.helper) { p.stacks = vp.stacks.map(x => x.slice()); } return; }
    if (vp.helper) {
      // known tops + sampled bottoms
      const bots = hands[s].filter(c => !B.known[s].includes(c)); let bi = 0;
      p.stacks = vp.stacks.map(st => [st[0], st[1] !== -1 ? (bots[bi++] != null ? bots[bi - 1] : -1) : -1]);
      p.hand = []; p.stacks.forEach(st => { if (st[0] >= 0) p.hand.push(st[0]); if (st[1] >= 0) p.hand.push(st[1]); }); return;
    }
    p.hand = hands[s].slice().sort((a, b) => a - b);
  });
  // the Commander's helper in a 2-diver game when I am the Commander: I can see the face-up cards and not the others (handled above)
  W.trick = V.trick ? { n: V.trick.n, lead: V.trick.lead, turn: V.trick.turn, plays: V.trick.plays.map(p => ({ s: p.s, c: p.c })), ls: V.trick.ls } : null;
}
function cloneW(W) {
  return Object.assign({}, W, {
    pl: W.pl.slice(), tricks: W.tricks.slice(), tasks: W.tasks.map(t => ({ id: t.id, owner: t.owner, pn: t.pn, st: t.st })), phase: W.phase, result: null,
    players: W.players.map(p => ({ seat: p.seat, helper: p.helper, hand: p.hand.slice(), stacks: p.stacks ? p.stacks.map(s => s.slice()) : null })),
    trick: W.trick ? { n: W.trick.n, lead: W.trick.lead, turn: W.trick.turn, plays: W.trick.plays.map(p => ({ s: p.s, c: p.c })), ls: W.trick.ls } : null
  });
}
// ---------- soft progress of a job (0..1) and its orientation ----------
function soft(S, ti) {
  const t = S.tasks[ti], d = TASKS[t.id], o = t.owner, end = S.tricks.length >= S.ntr;
  const st = KIND[d.k](S, t, d, o, end); if (st > 0) return 1; if (st < 0) return 0;
  const W = LD._;
  const won = () => W.cardsWon(S, o);
  switch (d.k) {
    case 'cmp': { const w = W.tw(S), c = S.cap, oth = w.filter((x, i) => i !== o); let diff;
      if (d.vs === 'each' && d.op === 'more') diff = w[o] - Math.max(...oth); else if (d.vs === 'all') diff = w[o] - oth.reduce((a, b) => a + b, 0); else if (d.vs === 'each') diff = Math.min(...oth) - w[o];
      else if (d.op === 'more') diff = w[o] - w[c]; else if (d.op === 'fewer') diff = w[c] - w[o]; else diff = -Math.abs(w[o] - w[c]);
      return 1 / (1 + Math.exp(-(diff - .5) * 1.2)) * .9; }
    case 'cards': { let n = 0; for (const c of d.cs) if (W.wonBy(S, c) === o) n++; return n / d.cs.length * .9; }
    case 'valn': { const c = won().filter(x => suit(x) < 4 && val(x) === d.v).length; return d.op === 'ge' ? Math.min(1, c / d.n) * .9 : (c <= d.n ? c / d.n : 0) * .9; }
    case 'coln': { const c = won().filter(x => suit(x) === d.c).length; return d.op === 'ge' ? Math.min(1, c / d.n) * .9 : (c <= d.n ? c / Math.max(1, d.n) : 0) * .9; }
    case 'colx': { let a = 0; for (const p of d.parts) { const c = won().filter(x => suit(x) === p.c).length; a += c <= p.n ? c / p.n : 0; } return a / d.parts.length * .9; }
    case 'pos': { const need = []; for (let i = 0; i < (d.first || 0); i++) need.push(i); if (d.last) need.push(S.ntr - 1); let n = 0; for (const i of need) if (i < S.tricks.length && S.tricks[i].w === o) n++; return Math.max(.3, n / need.length) * .9; }
    case 'run': { const w = []; S.tricks.forEach((k, i) => { if (k.w === o) w.push(i); }); return Math.min(1, W.longestRun(w) / d.n) * .8 + (d.m === 'no' || d.m === 'ex' ? .1 : 0); }
    case 'ntr': case 'pred': { const n = d.k === 'pred' ? t.pn : d.n, w = W.tw(S)[o]; return Math.max(0, 1 - Math.abs(w - n) / Math.max(1, n)) * .8; }
    case 'allcol': { const w = won(); let n = 0; for (let s = 0; s < 4; s++) if (w.some(x => suit(x) === s)) n++; return n / 4 * .9; }
    case 'onecol': { let b = 0; for (let s = 0; s < 4; s++) { let n = 0; for (let v = 0; v < 9; v++) if (W.wonBy(S, s * 9 + v) === o) n++; b = Math.max(b, n); } return b / 9 * .9; }
    case 'subx': { const n = won().filter(x => suit(x) === LAN).length; return Math.min(1, n / Math.max(1, d.n)) * .8; }
    case 'eqcol': case 'morecol': { const w = won(), a = w.filter(x => suit(x) === d.a).length, b = w.filter(x => suit(x) === d.b).length; return Math.max(0, 1 - Math.abs(a - b) / 4) * .6 + (d.k === 'morecol' && a > b ? .3 : 0); }
    default: return .5 + .4 * S.tricks.length / S.ntr;
  }
}
const WINK = new Set(['cards', 'valn', 'coln', 'colx', 'with', 'pos', 'run', 'trick', 'wsub', 'allcol', 'onecol', 'subx', 'eqcol', 'morecol']);
function orient(S) {
  let o = 0;
  S.tasks.forEach((t, i) => { const d = TASKS[t.id]; if (KIND[d.k](S, t, d, t.owner, false) !== 0) return; if (WINK.has(d.k) && !(d.k === 'run' && d.m === 'no') && !(d.k === 'colx')) o++; else if (['avoidc', 'avoidv', 'avoidsub', 'nolead', 'skip', 'none'].includes(d.k) || (d.k === 'ntr' && d.n <= 2) || (d.k === 'cmp' && d.op === 'fewer') || (d.k === 'run' && d.m === 'no')) o--; });
  return Math.max(-1, Math.min(1, o / 3));
}
const powerOf = c => suit(c) === LAN ? 1.2 + val(c) / 8 : val(c) / 9;
// ---------- the cheap cooperative policy used for everybody inside a simulation ----------
function lowestLegal(W, s, ls, cur) {
  const p = W.players[s]; let cards = p.helper ? p.stacks.map(st => st[0]).filter(x => x >= 0) : p.hand;
  if (!cards.length) return -1;
  if (ls >= 0) { const f = cards.filter(x => suit(x) === ls); if (f.length) cards = f; }
  else if (W.mission.m12) { const ok = cards.filter(x => suit(x) !== 0 && suit(x) !== LAN); if (ok.length) cards = ok; }
  let b = cards[0], bk = 1e9;
  for (const c of cards) { const k = (suit(c) === LAN ? 100 : 0) + val(c); if (k < bk) { bk = k; b = c; } }
  return b;
}
function trickU(W, s, c, ori) {
  const T = W.trick, np = W.np; const cur = T.plays.map(p => ({ s: p.s, c: p.c })); cur.push({ s, c }); const ls = T.plays.length ? T.ls : suit(c);
  let turn = (s + 1) % np; const added = [c];
  while (cur.length < np) { const lc = lowestLegal(W, turn, ls, cur); if (lc < 0) return -99; cur.push({ s: turn, c: lc }); added.push(lc); turn = (turn + 1) % np; }
  const w = LD.trickWinner(cur, ls), wc = cur.find(p => p.s === w).c;
  const k = { n: T.n, lead: T.lead, ls, plays: cur, w, wc };
  const before = W.tasks.map((t, i) => soft(W, i));
  W.tricks.push(k); const prev = []; for (const x of cur) { prev.push(W.pl[x.c]); W.pl[x.c] = 1; }
  let u = 0; const last = W.tricks.length >= W.ntr;
  W.tasks.forEach((t, i) => { const st = LD.jobStatus(W, i); if (st < 0) u -= 50; else if (st > 0 && t.st !== 1) u += 8; u += (soft(W, i) - before[i]) * 3; });
  if (LD.condBroken(W)) u -= 50;
  if (W.mission.m27 && cur.some(x => x.c === 3 * 9 + 4) && !(last && cur[cur.length - 1].c === 3 * 9 + 4)) u -= 50;
  if (W.mission.m12 && T.plays.length === 0 && (suit(c) === 0 || suit(c) === LAN)) u -= 50;
  cur.forEach((x, i) => { W.pl[x.c] = prev[i]; }); W.tricks.pop();
  // spending power: keep winners when the team needs wins, dump them when it needs to avoid tricks
  u -= .15 * ori * powerOf(c) * (w === s ? 0 : 1);
  return u;
}
function cands(W, s, L, many) {
  if (L.length <= (many ? 6 : 4)) return L;
  const out = new Set(); const bySuit = {};
  for (const c of L) (bySuit[suit(c)] = bySuit[suit(c)] || []).push(c);
  for (const k in bySuit) { const a = bySuit[k].sort((x, y) => val(x) - val(y)); out.add(a[0]); out.add(a[a.length - 1]); if (many && a.length > 2) out.add(a[a.length >> 1]); }
  const T = W.trick;
  if (T && T.plays.length) { const w = LD.trickWinner(T.plays, T.ls); const wc = T.plays.find(p => p.s === w).c; const win = L.filter(c => LD.trickWinner(T.plays.concat([{ s, c }]), T.ls) === s).sort((a, b) => powerOf(a) - powerOf(b)); if (win.length) out.add(win[0]); }
  return [...out];
}
function greedyCard(W, s) {
  const L = LD._.playable(W, s); if (L.length === 1) return L[0];
  const ori = orient(W); let best = -1e9, bc = L[0];
  for (const c of cands(W, s, L, false)) { const u = trickU(W, s, c, ori); if (u > best) { best = u; bc = c; } }
  return bc;
}
function roll(W) {
  let guard = 0;
  while (W.phase === 'play' && guard++ < 200) { const s = W.trick.turn; const c = greedyCard(W, s); LD._.doPlay(W, s, c); }
  return W;
}
const doneFrac = W => { let n = 0; W.tasks.forEach((t, i) => { if (LD.jobStatus(W, i) > 0) n++; }); return n / Math.max(1, W.tasks.length); };
// ---------- sampling worlds from a view ----------
function worlds(V, me, K, extra) {
  const B = belief(V, me), rng = mkrng(hash(V, me, extra)), out = [];
  for (let k = 0; k < K; k++) { const h = sampleHands(V, B, rng); if (!h) continue; const W = simBase(V); fillWorld(W, V, B, h); out.push(W); }
  return { B, rng, W: out };
}
// ---------- playing a card ----------
function evalCards(V, me, cs, K, who, ori) {
  const wl = worlds(V, me, K, cs.length * 31).W; const res = cs.map(() => ({ ok: 0, df: 0, n: 0, u: 0 }));
  for (const W0 of wl) {
    cs.forEach((c, i) => { res[i].u += Math.max(-60, trickU(W0, who, c, ori)); const W = cloneW(W0); LD._.doPlay(W, who, c); roll(W); res[i].n++; if (W.result && W.result.ok) res[i].ok++; res[i].df += doneFrac(W); });
  }
  return res;
}
function choosePlay(V, me, level, who) {
  const L = LD._.playable(V, who);
  if (L.length === 1) return L[0];
  const lv = lvl(level), rng = mkrng(hash(V, me, 5));
  if (lv.noise && rng() < lv.noise) return L[Math.floor(rng() * L.length)];
  const cs = cands(V, who, L, level === 'hard');
  const ori = orient(V);
  const res = evalCards(V, me, cs, lv.K, who, ori);
  let best = -1e9, bc = cs[0];
  cs.forEach((c, i) => {
    const r = res[i]; const n = Math.max(1, r.n);
    const sc = r.ok / n + .08 * r.df / n + .0008 * r.u / n;
    if (sc > best) { best = sc; bc = c; }
  });
  return bc;
}
// ---------- job cards: how well do I fit a job compared with the others? ----------
function fit(V, me, ti, owner, K, base) {
  const wl = worlds(V, me, K, ti * 7 + owner + 101).W; if (!wl.length) return .3;
  let ok = 0, df = 0;
  for (const W0 of wl) {
    const W = cloneW(W0); W.tasks.forEach((t, i) => { if (i === ti) t.owner = owner; else if (base && base.includes(i) && V.tasks[i].owner >= 0) t.owner = V.tasks[i].owner; else t.owner = -9; });
    W.tasks = W.tasks.filter(t => t.owner !== -9 && t.owner !== -1 || false);
    if (!W.tasks.length) continue;
    W.phase = 'play'; W.cap = V.cap; W.trick = { n: 0, lead: V.cap, turn: V.cap, plays: [], ls: -1 }; W.tricks = []; W.pl = new Array(40).fill(0);
    roll(W); if (W.result && W.result.ok) ok++; df += doneFrac(W);
  }
  return (ok + .25 * df) / wl.length;
}
function owned(V) { return V.tasks.map((t, i) => t.owner >= 0 ? i : -1).filter(i => i >= 0); }
const RC = new Map();
function stable(V, me) { let h = 2166136261 ^ me; const mix = x => { h = Math.imul(h ^ (x + 0x9e37), 16777619); }; V.players[me].hand.forEach(mix); mix(V.att); mix(V.cap); V.tasks.forEach(t => mix(t.id)); mix(V.np); mix(V.mission.id); return h >>> 0; }
function rate(V, me, ti, level, actor) {
  const lv = lvl(level), K = Math.max(2, Math.round(lv.K * .8));
  const key = stable(V, me) + '|' + ti + '|' + actor + '|' + level; if (RC.has(key)) return RC.get(key);
  if (RC.size > 4000) RC.clear();
  const mine = fit(V, me, ti, actor, K, null);
  const others = LD.orderFrom(V, (actor + 1) % V.np).filter(s => s !== actor && !V.players[s].helper).slice(0, 2);
  let oth = 0; for (const s of others) oth += fit(V, me, ti, s, Math.max(2, K >> 1), null); oth /= Math.max(1, others.length);
  const r = { mine, oth }; RC.set(key, r); return r;
}
function chooseAssign(V, me, level, moves) {
  const lv = lvl(level), rng = mkrng(hash(V, me, 9)), act = V.as.actor;
  const A = V.as;
  const takes = moves.filter(m => m.t === 'take');
  const find = t => moves.find(m => m.t === t);
  if (A.mode === 'vote') {
    // vote for myself when the jobs fit my hand better than an average seat; otherwise for the Commander
    const all = V.tasks.map((t, i) => i); const sc = rateAll(V, me, level);
    const f = sc.mine >= Math.max(.3, sc.oth) ? me : V.cap; return moves.find(m => m.f === f) || moves[0];
  }
  if (A.mode === 'cmd') {
    if (A.stage === 'keep') { const sc = rateAll(V, me, level); return sc.mine >= .2 && find('keep') ? find('keep') : find('offer') || find('keep'); }
    const sc = rateAll(V, me, level, true); return sc.mine >= .45 ? find('accept') : find('decline');
  }
  if (A.mode === 'vol') { const sc = rateAll(V, me, level); const forced = !find('no'); return forced || sc.mine >= .3 ? find('yes') : find('no'); }
  if (A.mode === 'hardfirst') { return takes.sort((a, b) => a.i - b.i)[0]; }
  if (!takes.length) return find('pass') || find('done') || moves[0];
  if (lv.noise && rng() < lv.noise * 2) return takes[Math.floor(rng() * takes.length)];
  // rate every job I may take
  let best = null, bs = -1e9; const rated = [];
  for (const m of takes) {
    const r = rate(V, me, m.i, level, act); const sc = r.mine - .55 * r.oth + .1 * r.mine; rated.push({ m, r, sc });
    if (sc > bs) { bs = sc; best = { m, r, sc }; }
  }
  if (A.mode === 'free') {
    // take every job where I am the better fit; otherwise finish my turn
    const good = rated.filter(x => x.r.mine >= x.r.oth - .02 && x.r.mine > .05).sort((a, b) => b.sc - a.sc);
    if (good.length) return good[0].m;
    return find('done') || best.m;
  }
  if (A.mode === 'split') { return best.m; }
  const pass = find('pass');
  if (pass && (best.r.mine < .12 || best.r.mine + .15 < best.r.oth)) return pass;
  return best.m;
}
function rateAll(V, me, level, asOwner) {
  const lv = lvl(level), K = Math.max(2, Math.round(lv.K * .8));
  const wl = worlds(V, me, K, 77).W; let ok = 0, ok2 = 0, n = 0;
  for (const W0 of wl) {
    for (const who of [me, V.cap === me ? (me + 1) % V.np : V.cap]) {
      const W = cloneW(W0); W.tasks.forEach(t => { t.owner = who; }); W.phase = 'play'; W.trick = { n: 0, lead: V.cap, turn: V.cap, plays: [], ls: -1 }; W.tricks = []; W.pl = new Array(40).fill(0); roll(W);
      if (who === me) { ok += W.result && W.result.ok ? 1 : 0; n++; } else ok2 += W.result && W.result.ok ? 1 : 0;
    }
  }
  return { mine: ok / Math.max(1, n), oth: ok2 / Math.max(1, n) };
}
// ---------- cards to pass, predictions, distress ----------
function choosePass(V, me, level, moves) {
  const ds = LD.diverSeats(V), dir = V.pass.dir, to = ds[(((ds.indexOf(me) + dir) % ds.length) + ds.length) % ds.length];
  const mineT = V.tasks.filter(t => t.owner === me), theirT = V.tasks.filter(t => t.owner === to);
  const rel = (tasks, c) => { let s = 0; for (const t of tasks) { const d = TASKS[t.id]; if (d.k === 'cards' || d.k === 'wsub') { if ((d.cs || [d.c]).includes(c)) s += 4; } if (d.k === 'valn' && val(c) === d.v) s += 2; if (d.k === 'with' && (val(c) === d.v || val(c) === d.cp)) s += 1.5; if (d.k === 'coln' && suit(c) === d.c) s += .7; if (d.k === 'avoidv' && d.vs.includes(val(c))) s -= 2; if (d.k === 'avoidc' && d.cs.includes(suit(c))) s -= 1; } return s; };
  let best = moves[0], bs = -1e9;
  for (const m of moves) { const c = m.c; let s = rel(theirT, c) - rel(mineT, c) * 1.2 + (mineT.length ? 0 : .02 * val(c)) - .1 * powerOf(c); if (s > bs) { bs = s; best = m; } }
  return best;
}
function choosePredict(V, me, level, moves) {
  const lv = lvl(level), ti = moves[0].i, K = Math.max(2, lv.K >> 1); let best = moves[0], bs = -1;
  const wl = worlds(V, me, K, 55).W;
  for (const m of moves) {
    if (m.n > Math.ceil(V.ntr * .7)) continue; let ok = 0;
    for (const W0 of wl) { const W = cloneW(W0); W.tasks.forEach((t, i) => { t.owner = i === ti ? V.tasks[ti].owner : -9; }); W.tasks = W.tasks.filter(t => t.owner !== -9); W.tasks[0].pn = m.n; W.phase = 'play'; W.trick = { n: 0, lead: V.cap, turn: V.cap, plays: [], ls: -1 }; W.tricks = []; W.pl = new Array(40).fill(0); roll(W); if (W.result && W.result.ok) ok++; }
    const sc = ok / Math.max(1, wl.length) - .001 * Math.abs(m.n - V.ntr / 3); if (sc > bs) { bs = sc; best = m; }
  }
  return best;
}
function chooseDistress(V, me, level, moves) {
  const lv = lvl(level); const on = moves.filter(m => m.on);
  if (V.distress && V.att > 1) return moves.find(m => m.on && m.dir === 1) || moves[0];
  if (V.att >= lv.dist && on.length && !V.distress) return on[0];
  return moves.find(m => !m.on);
}
// ---------- pings ----------
function pingScore(V, me, m) {
  const c = m.c, su = suit(c), v = val(c); let s = 0;
  for (const t of V.tasks) {
    const d = TASKS[t.id], mineT = t.owner === me;
    if ((d.k === 'cards' && d.cs.includes(c)) || (d.k === 'wsub' && d.c === c)) s += mineT ? 1 : 3;
    if (d.k === 'valn' && d.v === v) s += mineT ? 1 : 1.6;
    if (d.k === 'with' && (d.v === v || d.cp === v)) s += .8;
    if (d.k === 'coln' && d.c === su) s += .5;
    if (d.k === 'avoidv' && d.vs.includes(v)) s += mineT ? 1.2 : 1;
    if ((d.k === 'cards' || d.k === 'wsub') && !mineT && (d.cs || [d.c]).some(x => suit(x) === su)) s += .6;
  }
  if (m.k === 'high' && v >= 8) s += .5; if (m.k === 'only') s += .35; if (m.k === 'low' && v <= 2) s += .3;
  const cnt = V.players[me].hand.filter(x => suit(x) === su).length; s += .08 * cnt;
  return s;
}
function choosePing(V, me, level, moves) {
  const lv = lvl(level); if (!lv.ping) return null;
  const pings = moves.filter(m => m.t === 'ping'); if (!pings.length) return null;
  if (V.phase === 'play' && V.tricks.length > 0 && V.comm !== 'narc') { /* later pings only when strongly useful */ }
  let best = null, bs = -1; for (const m of pings) { const s = pingScore(V, me, m); if (s > bs) { bs = s; best = m; } }
  const thr = V.tricks.length ? lv.ping + .8 : lv.ping;
  return bs >= thr ? best : null;
}
// ---------- the public interface ----------
const cache = new WeakMap();
function choose(G, seat, level) {
  level = level || (G.players[seat] && G.players[seat].ai) || 'normal';
  const mv = LD.moves(G, seat); if (!mv.length) return null;
  const V = LD.stripView(G, seat);
  switch (G.phase) {
    case 'assign': return chooseAssign(V, seat, level, mv);
    case 'distress': return chooseDistress(V, seat, level, mv);
    case 'pass': return choosePass(V, seat, level, mv);
    case 'predict': return choosePredict(V, seat, level, mv);
    case 'signal': { const pm = choosePing(V, seat, level, mv); return pm || mv.find(m => m.t === 'nosig'); }
    case 'play': {
      const plays = mv.filter(m => m.t === 'play'); if (!plays.length) return null;
      const who = G.trick.turn;
      const pm = G.trick.plays.length === 0 && G.comm !== 'none' ? choosePing(V, seat, level, mv) : null;
      if (pm && pm.t === 'ping' && LD.canPing(G, seat)) return pm;
      const c = choosePlay(V, seat, level, who);
      return plays.find(m => m.c === c) || plays[0];
    }
  }
  return mv[0];
}
// a ping an AI seat wants to make right now, between tricks (null = none). The driver calls this for every AI seat before the leader plays.
function pingChoice(G, seat, level) {
  level = level || (G.players[seat] && G.players[seat].ai) || 'normal';
  if (G.phase !== 'play' || G.trick.plays.length) return null;
  if (!LD.canPing(G, seat)) return null;
  let c = cache.get(G); if (!c) { c = {}; cache.set(G, c); }
  const key = G.att + ':' + G.tricks.length + ':' + seat; if (key in c) return c[key];
  const V = LD.stripView(G, seat); const mv = LD.pingMoves(G, seat);
  const m = choosePing(V, seat, level, mv); c[key] = m; return m;
}
// one step for every computer seat that is pending; returns true when something happened
function step(G) {
  if (G.phase === 'over') return false;
  if (G.phase === 'play' && G.trick.plays.length === 0) {
    for (const p of G.players) { if (!p.ai || p.helper) continue; const m = pingChoice(G, p.seat); if (m) { const r = LD.apply(G, p.seat, m); const cc = cache.get(G); if (cc) cc[G.att + ':' + G.tricks.length + ':' + p.seat] = null; if (r.ok) return true; } }
  }
  for (const s of LD.pending(G)) {
    const p = G.players[s]; if (!p.ai) continue;
    const m = choose(G, s); if (!m) continue; const r = LD.apply(G, s, m); if (!r.ok) throw new Error('illegal AI move ' + JSON.stringify(m) + ' ' + r.error);
    return true;
  }
  return false;
}
// a short reason for a card: used by the hint button
function why(G, seat, card) {
  const V = LD.stripView(G, seat); const wl = worlds(V, seat, 5, 3).W; const lines = {};
  for (const W0 of wl) {
    const W = cloneW(W0); const who = G.trick.turn; const before = W.tasks.map((t, i) => LD.jobStatus(W, i));
    LD._.doPlay(W, who, card);
    if (W.tricks.length > V.tricks.length) {
      const k = W.tricks[W.tricks.length - 1]; lines.w = lines.w || {}; lines.w[k.w] = (lines.w[k.w] || 0) + 1;
      W.tasks.forEach((t, i) => { const st = LD.jobStatus(W, i); if (st > 0 && before[i] <= 0) lines['d' + i] = (lines['d' + i] || 0) + 1; if (st < 0) lines['f' + i] = (lines['f' + i] || 0) + 1; });
    }
  }
  const out = []; const n = Math.max(1, wl.length);
  if (lines.w) { const best = Object.keys(lines.w).sort((a, b) => lines.w[b] - lines.w[a])[0]; out.push(G.players[best].name + (+best === seat ? ' (you)' : '') + ' most likely wins this trick'); }
  for (const k in lines) if (k[0] === 'd' && lines[k] >= n / 2) out.push('finishes: ' + TASKS[G.tasks[+k.slice(1)].id].t);
  for (const k in lines) if (k[0] === 'f' && lines[k] >= n / 3) out.push('risk: breaks "' + TASKS[G.tasks[+k.slice(1)].id].t + '"');
  return out.join('. ');
}
Object.assign(AI, { choose, step, pingChoice, why, belief, sampleHands, hash, mkrng, soft, worlds, simBase, fillWorld, cloneW, roll, rate, rateAll, fit, greedyCard });
if (typeof module === 'object' && module.exports) module.exports = AI;
})(typeof globalThis !== 'undefined' ? globalThis : this);

// ===================== Lantern Dive rules engine =====================
// Plain JS (browser global LD / node module). State G is one JSON-serialisable object with its own seeded RNG; one G is one dive ATTEMPT.
//   LD.newGame({players:2..5, seed, names:[], ai:[level|null,..], mission:{kind:'log',id}|{kind:'free',d,cmt,sel}|{kind:'deep',level}, timer:bool}) -> G
//   LD.nextAttempt(G, {same:bool}) -> G (same G object, a new attempt: new deal, same or new job cards, distress flare stays lit)
//   LD.moves(G, seat) -> [{t:..., ...}]   LD.apply(G, seat, move) -> {ok:true}|{ok:false,error}   LD.pending(G) -> seats that must act now
//   LD.stripView(G, seat) / LD.checkInvariants(G) / LD.text(G)
// 2 players: a third seat, the drone "Echo", plays 14 cards laid out in a double row (face-up top, face-down underneath). The Commander flies it.
// Cards: 0..35 colour cards (suit*9 + value-1), 36..39 Lanterns 1..4 (trumps). Seats are clockwise: seat i+1 sits to the left of seat i.
(function (g) {
'use strict';
const LD = g.LD = g.LD || {};
const D = LD.DATA = g.LDDATA || (typeof require === 'function' ? require('./data.js') : null);
const TASKS = D.tasks, MISSIONS = D.missions;
const suit = id => id < 36 ? (id / 9) | 0 : 4;
const val = id => id < 36 ? id % 9 + 1 : id - 35;
const LAN = 4, L1 = 36, L4 = 39;
const SU5 = 3 * 9 + 4;           // Sunstar 5
const clone = o => JSON.parse(JSON.stringify(o));
// ---------- rng ----------
function rnd(G, n) { let t = (G.rng = (G.rng + 0x6D2B79F5) | 0); t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * n); }
function shuffle(G, a) { for (let i = a.length - 1; i > 0; i--) { const j = rnd(G, i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function lg(G, t) { if (G.nolog) return; G.logN++; G.log.push({ i: G.logN, att: G.att, t }); if (G.log.length > 300) G.log.splice(0, 80); }
function ev(G, e) { if (!G.nolog) { e.n = ++G.evN; G.events.push(e); } }
const cn = D.cardName;
const sortHand = h => h.sort((a, b) => a - b);
const ntrOf = np => Math.floor(40 / np);       // tricks per dive: 13 / 10 / 8 (3 / 4 / 5 seats)

// ---------- the job cards: status of one job (1 done, -1 failed, 0 still open), from PUBLIC information only ----------
// S needs: tricks (finished tricks), np, cap, ntr, pl (40 flags: card already played), tasks[{id, owner, pn}]
function tw(S) { const a = new Array(S.np).fill(0); for (const t of S.tricks) a[t.w]++; return a; }
function wonBy(S, c) { for (const t of S.tricks) for (const p of t.plays) if (p.c === c) return t.w; return -1; }
function cardsWon(S, o) { const r = []; for (const t of S.tricks) if (t.w === o) for (const p of t.plays) r.push(p.c); return r; }
function remVal(S, v) { let n = 0; for (let s = 0; s < 4; s++) if (!S.pl[s * 9 + v - 1]) n++; return n; }
function remSuit(S, s) { let n = 0; if (s === 4) { for (let v = 0; v < 4; v++) if (!S.pl[L1 + v]) n++; return n; } for (let v = 0; v < 9; v++) if (!S.pl[s * 9 + v]) n++; return n; }
function longestRun(idx) { let b = 0, r = 0, p = -9; for (const i of idx) { r = i === p + 1 ? r + 1 : 1; p = i; if (r > b) b = r; } return b; }
function trickOK(S, t, d) {
  const cs = t.plays.map(p => p.c), col = S.np - 3;
  switch (d.p) {
    case 'lt': return cs.every(c => suit(c) < 4 && val(c) < d.v);
    case 'gt': return cs.every(c => suit(c) < 4 && val(c) > d.v);
    case 'even': return cs.every(c => suit(c) < 4 && val(c) % 2 === 0);
    case 'odd': return cs.every(c => suit(c) < 4 && val(c) % 2 === 1);
    case 'sumgt': return cs.every(c => suit(c) < 4) && cs.reduce((a, c) => a + val(c), 0) > d.th[col];
    case 'sumlt': return cs.every(c => suit(c) < 4) && cs.reduce((a, c) => a + val(c), 0) < d.th[col];
    case 'sumeq': return d.vs.includes(cs.reduce((a, c) => a + val(c), 0));
  }
  return false;
}
const KIND = {
  cmp(S, t, d, o, end) {
    const w = tw(S), left = S.ntr - S.tricks.length, c = S.cap, np = S.np; let sat, dead;
    const oth = w.filter((x, i) => i !== o);
    if (d.vs === 'each' && d.op === 'more') { sat = oth.every(x => w[o] > x); dead = w[o] + left <= Math.max(...oth); }
    else if (d.vs === 'all') { const sm = oth.reduce((a, b) => a + b, 0); sat = w[o] > sm; dead = w[o] + left <= sm; }
    else if (d.vs === 'each') { sat = oth.every(x => w[o] < x); dead = oth.reduce((a, x) => a + Math.max(0, w[o] + 1 - x), 0) > left; }
    else if (d.op === 'more') { sat = w[o] > w[c]; dead = w[o] + left <= w[c]; }
    else if (d.op === 'fewer') { sat = w[o] < w[c]; dead = w[o] >= w[c] + left; }
    else { sat = w[o] === w[c]; dead = Math.abs(w[o] - w[c]) > left; }
    if (end) return sat ? 1 : -1; return dead ? -1 : 0;
  },
  trick(S, t, d, o, end) { for (const k of S.tricks) if (k.w === o && trickOK(S, k, d)) return 1; return end ? -1 : 0; },
  with(S, t, d, o, end) {
    for (const k of S.tricks) if (k.w === o && suit(k.wc) < 4 && val(k.wc) === d.v && (d.cp == null || k.plays.some(p => p.c !== k.wc && suit(p.c) < 4 && val(p.c) === d.cp))) return 1;
    if (end) return -1;
    if (remVal(S, d.v) < 1) return -1;
    if (d.cp != null && remVal(S, d.cp) < (d.cp === d.v ? 2 : 1)) return -1;
    return 0;
  },
  cards(S, t, d, o, end) {
    let all = true; const last = S.ntr - 1;
    for (const c of d.cs) {
      let wb = -1, ti = -1; S.tricks.forEach((k, i) => { if (k.plays.some(p => p.c === c)) { wb = k.w; ti = i; } });
      if (wb >= 0 && wb !== o) return -1;
      if (d.last) { if (wb >= 0 && ti !== last) return -1; if (wb < 0) all = false; else if (ti !== last) return -1; }
      else if (wb < 0) all = false;
    }
    if (all) return 1; return end ? -1 : 0;
  },
  valn(S, t, d, o, end) {
    const c = cardsWon(S, o).filter(x => suit(x) < 4 && val(x) === d.v).length, rem = remVal(S, d.v);
    if (d.op === 'ge') { if (c >= d.n) return 1; return end || c + rem < d.n ? -1 : 0; }
    if (c > d.n || c + rem < d.n) return -1; if (end) return c === d.n ? 1 : -1; return c === d.n && rem === 0 ? 1 : 0;
  },
  coln(S, t, d, o, end) {
    const c = cardsWon(S, o).filter(x => suit(x) === d.c).length, rem = remSuit(S, d.c);
    if (d.op === 'ge') { if (c >= d.n) return 1; return end || c + rem < d.n ? -1 : 0; }
    if (c > d.n || c + rem < d.n) return -1; if (end) return c === d.n ? 1 : -1; return c === d.n && rem === 0 ? 1 : 0;
  },
  colx(S, t, d, o, end) { let all = 1; for (const p of d.parts) { const r = KIND.coln(S, t, p, o, end); if (r < 0) return -1; if (r === 0) all = 0; } return all; },
  avoidc(S, t, d, o, end) { const w = cardsWon(S, o); if (w.some(x => d.cs.includes(suit(x)))) return -1; if (end || d.cs.every(s => remSuit(S, s) === 0)) return 1; return 0; },
  avoidv(S, t, d, o, end) { const w = cardsWon(S, o); if (w.some(x => suit(x) < 4 && d.vs.includes(val(x)))) return -1; if (end || d.vs.every(v => remVal(S, v) === 0)) return 1; return 0; },
  avoidsub(S, t, d, o, end) { if (cardsWon(S, o).some(x => suit(x) === 4)) return -1; if (end || remSuit(S, 4) === 0) return 1; return 0; },
  allcol(S, t, d, o, end) {
    const w = cardsWon(S, o), has = [0, 1, 2, 3].map(s => w.some(x => suit(x) === s));
    if (has.every(Boolean)) return 1; if (end) return -1;
    for (let s = 0; s < 4; s++) if (!has[s] && remSuit(S, s) === 0) return -1; return 0;
  },
  onecol(S, t, d, o, end) {
    let alive = false;
    for (let s = 0; s < 4; s++) {
      let n = 0, lost = false;
      for (let v = 0; v < 9; v++) { const c = s * 9 + v, wb = wonBy(S, c); if (wb === o) n++; else if (wb >= 0) lost = true; }
      if (n === 9) return 1; if (!lost) alive = true;
    }
    return end || !alive ? -1 : 0;
  },
  subx(S, t, d, o, end) {
    const w = cardsWon(S, o).filter(x => suit(x) === 4), remL = remSuit(S, 4);
    if (d.only) {
      const cu = L1 + d.only - 1, got = w.includes(cu), other = w.some(x => x !== cu), wb = wonBy(S, cu);
      if (other || (wb >= 0 && wb !== o)) return -1;
      if (got && remL === 0) return 1; return end ? -1 : 0;
    }
    if (w.length > d.n || w.length + remL < d.n) return -1;
    if (end) return w.length === d.n ? 1 : -1; return w.length === d.n && remL === 0 ? 1 : 0;
  },
  nolead(S, t, d, o, end) { for (const k of S.tricks) if (k.lead === o && d.cs.includes(suit(k.plays[0].c))) return -1; return end ? 1 : 0; },
  skip(S, t, d, o, end) { for (let i = 0; i < Math.min(d.n, S.tricks.length); i++) if (S.tricks[i].w === o) return -1; return end || S.tricks.length >= d.n ? 1 : 0; },
  none(S, t, d, o, end) { if (S.tricks.some(k => k.w === o)) return -1; return end ? 1 : 0; },
  ntr(S, t, d, o, end) { const w = tw(S)[o], left = S.ntr - S.tricks.length; if (w > d.n || w + left < d.n) return -1; if (end) return w === d.n ? 1 : -1; return 0; },
  pos(S, t, d, o, end) {
    const need = []; for (let i = 0; i < (d.first || 0); i++) need.push(i); if (d.last) need.push(S.ntr - 1);
    for (const i of need) if (i < S.tricks.length && S.tricks[i].w !== o) return -1;
    if (d.only) { for (let i = 0; i < S.tricks.length; i++) if (S.tricks[i].w === o && !need.includes(i)) return -1; }
    const played = need.every(i => i < S.tricks.length);
    if (d.only) return end ? 1 : 0;
    return played ? 1 : 0;
  },
  run(S, t, d, o, end) {
    const W = []; S.tricks.forEach((k, i) => { if (k.w === o) W.push(i); });
    const left = S.ntr - S.tricks.length; let r = 0; for (let i = S.tricks.length - 1; i >= 0 && S.tricks[i].w === o; i--) r++;
    if (d.m === 'ge') { const lr = longestRun(W); if (lr >= d.n) return 1; return end || r + left < d.n ? -1 : 0; }
    if (d.m === 'no') { for (let i = 1; i < W.length; i++) if (W[i] === W[i - 1] + 1) return -1; return end ? 1 : 0; }
    const contig = W.length < 2 || W[W.length - 1] - W[0] + 1 === W.length;
    if (W.length > d.n || !contig) return -1;
    if (W.length && W.length < d.n && W[W.length - 1] < S.tricks.length - 1) return -1;
    if (W.length + left < d.n) return -1;
    if (end) return W.length === d.n ? 1 : -1; return 0;
  },
  pred(S, t, d, o, end) { const w = tw(S)[o], left = S.ntr - S.tricks.length, n = t.pn; if (n == null || n < 0) return 0; if (w > n || w + left < n) return -1; if (end) return w === n ? 1 : -1; return 0; },
  eqcol(S, t, d, o, end) {
    if (d.tr) { for (const k of S.tricks) if (k.w === o) { const a = k.plays.filter(p => suit(p.c) === d.a).length, b = k.plays.filter(p => suit(p.c) === d.b).length; if (a > 0 && a === b) return 1; } return end ? -1 : 0; }
    const w = cardsWon(S, o), a = w.filter(x => suit(x) === d.a).length, b = w.filter(x => suit(x) === d.b).length;
    if (end) return a > 0 && a === b ? 1 : -1;
    if (remSuit(S, d.a) === 0 && remSuit(S, d.b) === 0 && (a !== b || a === 0)) return -1; return 0;
  },
  morecol(S, t, d, o, end) { const w = cardsWon(S, o), a = w.filter(x => suit(x) === d.a).length, b = w.filter(x => suit(x) === d.b).length; if (end) return a > b ? 1 : -1; return a + remSuit(S, d.a) <= b ? -1 : 0; },
  wsub(S, t, d, o, end) {
    for (const k of S.tricks) { if (k.plays.some(p => p.c === d.c)) { if (k.w === o && suit(k.wc) === 4) return 1; return -1; } }
    return end ? -1 : 0;
  }
};
function jobStatus(S, ti) { const t = S.tasks[ti], d = TASKS[t.id]; return KIND[d.k](S, t, d, t.owner, S.tricks.length >= S.ntr); }
// mission rules that hold for the whole dive. Returns a text (broken) or '' (fine). Called after every trick.
function condBroken(S) {
  const m = S.mission;
  if (m.gap) { const c = new Array(S.np).fill(0); for (const k of S.tricks) for (const p of k.plays) if (suit(p.c) < 4 && val(p.c) === m.gap.v && true) c[k.w]++; if (Math.max(...c) - Math.min(...c) >= m.gap.gap) return 'A diver has won two more ' + m.gap.v + 's than another diver.'; }
  if (m.m23 && S.tricks.length) { const w0 = S.tricks[0].w, w = tw(S); for (let i = 0; i < S.np; i++) if (i !== w0 && w[i] >= w[w0]) return 'The first trick winner no longer has more tricks than everybody else.'; }
  return '';
}
const holdsMission = m => !!(m.gap || m.m23 || m.m12 || m.m27);

// ---------- helpers on the state ----------
const ctl = (G, s) => G.players[s].helper ? G.cap : s;
const isDiver = (G, s) => !G.players[s].helper;
function missionInfo(o, opt) {
  o = o || { kind: 'log', id: 1 };
  if (o.kind === 'free') return { kind: 'free', id: 0, name: o.jobs ? 'Job practice' : 'Free dive', d: Math.max(0, o.jobs ? 0 : (o.d | 0 || 6)), cmt: o.cmt || 'normal', sel: o.jobs ? 'fixed' : (o.sel || 'draft'), fixed: o.jobs ? o.jobs.slice() : undefined, jobs: o.jobs || undefined, rule: '', brief: o.jobs ? 'Practice with job cards of your choice.' : 'A practice dive with job cards of your choice.' };
  if (o.kind === 'deep') return { kind: 'deep', id: 100 + (o.level | 0), name: 'Deep dive ' + (o.level | 0), d: o.level | 0, cmt: 'normal', sel: 'free', rule: 'Open briefing: talk freely about who takes which job, but never about your cards.', brief: 'Beyond the last chart. Each success raises the stakes.' };
  const m = MISSIONS[(o.id | 0) - 1] || MISSIONS[0];
  return Object.assign({ kind: 'log' }, clone(m));
}
function dealHands(G) {
  const ids = shuffle(G, Array.from({ length: 40 }, (_, i) => i));
  for (const p of G.players) { p.hand = []; p.stacks = null; p.pingUsed = 0; p.mem = {}; }
  if (G.two) {
    const rest = ids.filter(x => x !== L4), hc = rest.slice(0, 14), others = shuffle(G, rest.slice(14).concat([L4]));
    G.players[0].hand = others.slice(0, 13); G.players[1].hand = others.slice(13);
    const H = G.players[G.helper]; H.stacks = []; for (let i = 0; i < 7; i++) H.stacks.push([hc[i], hc[7 + i]]); H.hand = hc.slice();
  } else {
    let s = rnd(G, G.np); for (const c of ids) { G.players[s].hand.push(c); s = (s + 1) % G.np; }
  }
  for (const p of G.players) sortHand(p.hand);
  G.cap = G.players.findIndex(p => p.hand.includes(L4));
}
// impossible deals for some Lantern jobs: new deal, no attempt counted
function needRedeal(G) {
  for (const t of G.tasks) {
    const r = TASKS[t.id].redeal; if (!r) continue;
    for (const p of G.players) {
      const h = x => p.hand.includes(L1 + x - 1);
      if (r === 'all4' && h(1) && h(2) && h(3) && h(4)) return true;
      if (r === 'l1' && ((h(1) && h(4)) || (h(1) && h(2) && h(3)))) return true;
      if (r === 'l2' && ((h(2) && h(4)) || (h(1) && h(2) && h(3)))) return true;
      if (r === 'l234' && h(2) && h(3) && h(4)) return true;
    }
  }
  return false;
}
// two jobs that two DIFFERENT divers could never both do (same trick, same card): used when drawing
function claims(id) {
  const d = TASKS[id], pos = new Set(), cards = new Set(), vals = new Set();
  if (d.k === 'pos') { for (let i = 0; i < (d.first || 0); i++) pos.add(i); if (d.last) pos.add('L'); }
  if (d.k === 'cards') { d.cs.forEach(c => cards.add(c)); if (d.last) pos.add('L'); }
  if (d.k === 'wsub') cards.add(d.c);
  if (d.k === 'valn' && d.op === 'ex' && d.n === 4) vals.add(d.v);
  return { pos, cards, vals };
}
function conflict(a, b) {
  const A = claims(a), B = claims(b);
  for (const x of A.pos) if (B.pos.has(x)) return true;
  for (const x of A.cards) if (B.cards.has(x)) return true;
  const withVal = (id, v) => { const d = TASKS[id]; return (d.k === 'valn' && d.v === v) || (d.k === 'with' && (d.v === v || d.cp === v)) || (d.k === 'cards' && d.cs.some(c => suit(c) < 4 && val(c) === v)); };
  for (const v of A.vals) if (withVal(b, v)) return true;
  for (const v of B.vals) if (withVal(a, v)) return true;
  return false;
}
// can the jobs be split among the seats the way the draft needs? (every seat gets one when there are enough jobs)
function splitOK(G, ids) {
  const n = ids.length; if (n < G.np) return true;
  const par = ids.map((_, i) => i); const f = x => par[x] === x ? x : (par[x] = f(par[x]));
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (conflict(ids[i], ids[j])) par[f(i)] = f(j);
  const comps = new Set(ids.map((_, i) => f(i))).size;
  if (G.mission.sel === 'two') return comps >= 2 || n < 2;
  if (G.mission.sel === 'draft' || G.mission.sel === 'hard') return comps >= G.np;
  if (G.mission.sel === 'cmdnone') return comps >= G.np - 1;
  return true;
}
function drawTasks(G) {
  const m = G.mission, col = G.np - 3, target = m.d;
  if (m.sel === 'fixed') return m.fixed.slice();
  const noCap = ['vote', 'one', 'two', 'cmd'].includes(m.sel);
  for (let tries = 0; tries < 60; tries++) {
    const out = [], skipped = []; let sum = 0, guard = 0;
    while (sum < target && guard++ < 400) {
      if (!G.tdeck.length) { G.tdeck = shuffle(G, G.tdisc.concat(skipped.splice(0)).filter(x => !out.includes(x))); G.tdisc = []; if (!G.tdeck.length) G.tdeck = shuffle(G, Array.from({ length: 96 }, (_, i) => i).filter(x => !out.includes(x))); }
      const id = G.tdeck.shift(), d = TASKS[id].d[col];
      if (sum + d > target || (noCap && !TASKS[id].cap)) { skipped.push(id); continue; }
      out.push(id); sum += d;
    }
    G.tdeck = G.tdeck.concat(skipped);
    if (sum === target && splitOK(G, out)) return out;
    G.tdisc = G.tdisc.concat(out);
  }
  return []; // cannot happen with 96 cards
}
const secs = m => m.timer ? m.timer.sec : 0;

// ---------- a new game / a new attempt ----------
function newGame(o) {
  o = o || {};
  const hn = Math.max(2, Math.min(5, o.players | 0 || 3)), two = hn === 2, np = two ? 3 : hn;
  const G = { v: 1, rng: ((o.seed | 0) || 1) | 0, seed: (o.seed | 0) || 1, hn, np, two, helper: two ? 2 : -1, att: 0, logN: 0, evN: 0, log: [], events: [], used: {}, tdeck: [], tdisc: [], timerOn: !!o.timer, nolog: !!o.nolog };
  G.players = [];
  for (let i = 0; i < hn; i++) G.players.push({ seat: i, name: (o.names && o.names[i]) || D.names[i % 5], ai: (o.ai && o.ai[i]) || null, hand: [], stacks: null, pingUsed: 0, mem: {} });
  if (two) G.players.push({ seat: 2, name: D.helper.name, ai: null, helper: 1, hand: [], stacks: [], pingUsed: 1, mem: {} });
  G.mission = missionInfo(o.mission);
  G.tdeck = shuffle(G, Array.from({ length: 96 }, (_, i) => i));
  G.distress = false;
  startAttempt(G, { fresh: true });
  return G;
}
function startAttempt(G, o) {
  const m0 = G.mission; G.att++;
  // effective communication / difficulty / clock for this attempt
  const base = missionInfo(m0.kind === 'log' ? { kind: 'log', id: m0.id } : m0.kind === 'deep' ? { kind: 'deep', level: m0.d } : { kind: 'free', d: m0.d, cmt: m0.cmtBase || m0.cmt, sel: m0.jobs ? 'draft' : m0.sel, jobs: m0.jobs });
  let cmt = base.cmt, d = base.d, clock = 0;
  if (base.timer) { if (G.timerOn) clock = base.timer.sec; else { if (base.timer.alt) cmt = base.timer.alt; if (base.timer.altD) d = base.timer.altD; } }
  Object.assign(G, { clock, clockLeft: clock });
  G.mission = Object.assign(base, { d, cmtBase: base.cmt, hold: holdsMission(base) });
  G.comm = cmt; G.unk = -1;
  if (cmt === 'unknown') { G.unk = rnd(G, 36); const v = val(G.unk); G.comm = v <= 3 ? 'normal' : v <= 6 ? 'murky' : 'narc'; }
  G.pool = G.comm === 'narc' ? G.np - 2 : 0;
  // job cards
  if (o && o.same && G.tasks && G.tasks.length) G.tasks = G.tasks.map(t => ({ id: t.id, owner: -1, pn: -1 }));
  else { if (G.tasks) G.tdisc = G.tdisc.concat(G.tasks.map(t => t.id)); G.tasks = drawTasks(G).map(id => ({ id, owner: -1, pn: -1 })); }
  for (let tries = 0; tries < 200; tries++) { dealHands(G); if (!needRedeal(G)) break; }
  G.events = []; G.pl = new Array(40).fill(0); G.pings = []; G.tricks = [];
  Object.assign(G, { phase: 'assign', result: null, trick: null, left: -1, offered: false, ntr: ntrOf(G.np), firstW: -1, lastCard: -1, clockRun: false });
  ev(G, { t: 'deal', att: G.att, cap: G.cap, comm: G.comm, unk: G.unk, tasks: G.tasks.map(t => t.id) });
  lg(G, 'Attempt ' + G.att + ' of dive ' + (G.mission.kind === 'log' ? G.mission.id : G.mission.name) + '. ' + G.players[G.cap].name + ' holds Lantern 4 and is the Commander.');
  initAssign(G);
}
function nextAttempt(G, o) { if (G.phase !== 'over') return G; G.events = []; startAttempt(G, o || {}); return G; }

// ---------- job selection ----------
const rem = G => G.tasks.map((t, i) => t.owner < 0 ? i : -1).filter(i => i >= 0);
function orderFrom(G, s0, skipCap) { const o = []; for (let k = 0; k < G.np; k++) { const s = (s0 + k) % G.np; if (skipCap && s === G.cap) continue; o.push(s); } return o; }
function initAssign(G) {
  const m = G.mission, K = G.tasks.length;
  const A = G.as = { mode: m.sel, order: orderFrom(G, G.cap), i: 0, K0: K, idle: 0, stage: '', votes: {}, asked: [], vol: [], need: 0, actor: G.cap, owners: [] };
  if (m.sel === 'fixed') A.mode = 'draft';
  if (m.sel === 'cmdnone') { A.mode = 'draft'; A.order = orderFrom(G, G.cap, true); }
  if (m.sel === 'hard') { A.mode = 'hardfirst'; A.actor = G.cap; }
  if (m.sel === 'cmd') { A.mode = 'cmd'; A.stage = 'keep'; A.actor = G.cap; }
  if (m.sel === 'vote') { A.mode = 'vote'; A.actor = -1; }
  if (m.sel === 'one' || m.sel === 'two') { A.mode = 'vol'; A.need = m.sel === 'one' ? 1 : 2; A.cands = orderFrom(G, (G.cap + 1) % G.np).filter(s => s !== G.cap && isDiver(G, s)).concat([G.cap]); A.ci = 0; A.actor = A.cands[0]; }
  if (m.sel === 'free') { A.mode = 'free'; }
  if (A.mode === 'draft' || A.mode === 'free') A.actor = A.order[0];
  if (K === 0) { endAssign(G); return; }
  if (A.mode === 'draft' && K < G.np) A.pass = true;
}
function hardest(G) { const col = G.np - 3; let b = -1; for (const i of rem(G)) b = Math.max(b, TASKS[G.tasks[i].id].d[col]); return rem(G).filter(i => TASKS[G.tasks[i].id].d[col] === b); }
function canTake(G, s, i) { return G.tasks[i].owner < 0 && !(s === G.cap && !TASKS[G.tasks[i].id].cap); }
function assignMoves(G, c) {
  const A = G.as, out = [];
  const act = A.actor; if (A.mode !== 'vote' && (act < 0 || ctl(G, act) !== c)) return out;
  const as = G.players[act] && G.players[act].helper ? { as: act } : {};
  const R = rem(G);
  switch (A.mode) {
    case 'draft': {
      const tk = R.filter(i => canTake(G, act, i));
      for (const i of tk) out.push(Object.assign({ t: 'take', i }, as));
      const after = A.order.length - 1 - (A.i % A.order.length);
      if (A.pass && (R.length <= after || !tk.length)) out.push(Object.assign({ t: 'pass' }, as));
      else if (!tk.length) out.push(Object.assign({ t: 'pass' }, as));
      break;
    }
    case 'hardfirst': for (const i of hardest(G).filter(i => canTake(G, act, i))) out.push({ t: 'take', i }); if (!out.length) for (const i of hardest(G)) out.push({ t: 'take', i }); break;
    case 'free': {
      for (const i of R.filter(i => canTake(G, act, i))) out.push(Object.assign({ t: 'take', i }, as));
      const must = A.idle >= A.order.length - 1 && R.length;
      if (!must || !R.some(i => canTake(G, act, i))) out.push(Object.assign({ t: 'done' }, as));
      break;
    }
    case 'cmd':
      if (A.stage === 'keep') { if (G.tasks.every(t => TASKS[t.id].cap)) out.push({ t: 'keep' }); out.push({ t: 'offer' }); }
      else { out.push({ t: 'accept' }); out.push({ t: 'decline' }); }
      break;
    case 'vote': {
      if (!isDiver(G, c) || A.votes[c] !== undefined) break;
      for (let j = 0; j < G.np; j++) if (isDiver(G, j)) out.push({ t: 'vote', f: j });
      break;
    }
    case 'vol': {
      const forced = A.cands.length - A.ci <= A.need - A.vol.length;
      if (act === G.cap && A.ci === A.cands.length - 1 && !forced) { out.push({ t: 'yes' }); break; }
      out.push({ t: 'yes' }); if (!forced) out.push({ t: 'no' });
      break;
    }
    case 'split': {
      const has = A.owners.map(o => G.tasks.filter(t => t.owner === o).length), me = A.owners.indexOf(act);
      const without = A.owners.filter((o, k) => has[k] === 0 && o !== act).length;
      if (R.length > without) for (const i of R) out.push({ t: 'take', i });
      if (has[me] > 0 && !R.length === false) { /* nothing */ }
      if (has[me] > 0 && R.length === 0) out.push({ t: 'done' });
      else if (has[me] > 0) out.push({ t: 'done' });
      break;
    }
  }
  return out;
}
function take(G, s, i) { G.tasks[i].owner = s; ev(G, { t: 'take', i, seat: s }); lg(G, G.players[s].name + ' takes the job: ' + TASKS[G.tasks[i].id].t); }
function assignApply(G, c, m) {
  const A = G.as, R = rem(G);
  const acts = assignMoves(G, c); const ok = acts.find(x => x.t === m.t && (m.i === undefined || x.i === m.i) && (m.f === undefined || x.f === m.f));
  if (!ok) return 'That is not allowed now.';
  const act = A.actor;
  const adv = () => { A.i++; A.actor = A.order[A.i % A.order.length]; };
  switch (m.t) {
    case 'take':
      if (A.mode === 'hardfirst') { take(G, act, m.i); A.mode = 'draft'; A.order = orderFrom(G, (G.cap + 1) % G.np); A.i = -1; if (rem(G).length) { A.i = 0; A.actor = A.order[0]; } if (A.K0 < G.np) A.pass = true; break; }
      take(G, act, m.i);
      if (A.mode === 'draft') { A.idle = 0; if (rem(G).length) adv(); }
      else if (A.mode === 'free') A.idle = 0;
      else if (A.mode === 'split') { if (rem(G).length) { const k = A.owners.indexOf(act); A.actor = A.owners[(k + 1) % A.owners.length]; } }
      break;
    case 'pass': lg(G, G.players[act].name + ' passes.'); ev(G, { t: 'pass', seat: act }); adv(); break;
    case 'done': A.idle++; if (A.mode === 'split') { const k = A.owners.indexOf(act); A.actor = A.owners[(k + 1) % A.owners.length]; } else adv(); break;
    case 'keep': for (const t of G.tasks) t.owner = G.cap; lg(G, G.players[G.cap].name + ' keeps every job.'); break;
    case 'offer': A.stage = 'ask'; A.cands = orderFrom(G, (G.cap + 1) % G.np).filter(s => s !== G.cap && isDiver(G, s)); A.ci = 0; A.actor = A.cands[0]; ev(G, { t: 'offer' }); break;
    case 'accept': for (const t of G.tasks) t.owner = act; G.offered = true; lg(G, G.players[act].name + ' takes every job. All signalling happens before the first trick.'); break;
    case 'decline': A.ci++; if (A.ci >= A.cands.length) { for (const t of G.tasks) t.owner = G.cap; lg(G, 'Nobody volunteers: ' + G.players[G.cap].name + ' keeps every job.'); } else A.actor = A.cands[A.ci]; break;
    case 'vote': {
      A.votes[c] = m.f; const voters = G.players.filter(p => isDiver(G, p.seat)).map(p => p.seat);
      if (voters.every(v => A.votes[v] !== undefined)) {
        const cnt = {}; voters.forEach(v => { cnt[A.votes[v]] = (cnt[A.votes[v]] || 0) + 1; }); const best = Math.max(...Object.values(cnt));
        let win = Object.keys(cnt).map(Number).filter(k => cnt[k] === best);
        const w = win.length > 1 ? (win.includes(A.votes[G.cap]) ? A.votes[G.cap] : orderFrom(G, G.cap).find(s => win.includes(s))) : win[0];
        for (const t of G.tasks) t.owner = w; A.winner = w; lg(G, G.players[w].name + ' takes every job (crew vote).');
      }
      break;
    }
    case 'yes': A.vol.push(act); lg(G, G.players[act].name + ' volunteers.'); if (A.vol.length >= A.need) { finishVol(G); break; } A.ci++; A.actor = A.cands[A.ci]; break;
    case 'no': lg(G, G.players[act].name + ' does not volunteer.'); A.ci++; A.actor = A.cands[A.ci]; break;
  }
  if (!rem(G).length) endAssign(G);
  return '';
}
function finishVol(G) {
  const A = G.as;
  if (A.need === 1) { for (const t of G.tasks) t.owner = A.vol[0]; return; }
  A.mode = 'split'; A.owners = orderFrom(G, G.cap).filter(s => A.vol.includes(s)); A.actor = A.owners[0];
}
function endAssign(G) {
  G.as.done = true;
  if (G.tasks.length && G.tasks.every(t => t.owner >= 0)) { /* ok */ }
  G.phase = 'distress'; G.actor = G.cap; ev(G, { t: 'assigned' });
  if (G.clock) { G.clockRun = true; }
}

// ---------- distress flare + passing cards ----------
function distressMoves(G, c) {
  if (c !== G.cap) return [];
  const out = [{ t: 'dist', on: false }];
  if (G.two || G.hn === 2) out.push({ t: 'dist', on: true, dir: 1 });
  else { out.push({ t: 'dist', on: true, dir: 1 }); out.push({ t: 'dist', on: true, dir: -1 }); }
  return out;
}
const diverSeats = G => G.players.filter(p => !p.helper).map(p => p.seat);
function giveMoves(G, c) {
  if (G.phase !== 'pass' || !isDiver(G, c) || G.pass.give[c] !== undefined) return [];
  return G.players[c].hand.filter(x => suit(x) < 4).map(x => ({ t: 'give', c: x }));
}
function runPass(G) {
  const ds = diverSeats(G), dir = G.pass.dir, n = ds.length, gv = G.pass.give, recv = {};
  ds.forEach((s, k) => { recv[ds[((k + dir) % n + n) % n]] = { from: s, c: gv[s] }; });
  for (const s of ds) { const p = G.players[s]; p.hand.splice(p.hand.indexOf(gv[s]), 1); }
  for (const s of ds) { const p = G.players[s]; p.hand.push(recv[s].c); sortHand(p.hand); p.mem.gave = { to: ds[((ds.indexOf(s) + dir) % n + n) % n], c: gv[s] }; p.mem.got = { from: recv[s].from, c: recv[s].c }; }
  G.cap = G.players.findIndex(p => p.hand.includes(L4));
  ev(G, { t: 'swap', dir }); lg(G, 'Every diver passed one card ' + (dir > 0 ? 'to the left' : 'to the right') + '.');
  afterDistress(G);
}
function afterDistress(G) {
  for (const t of G.tasks) if (TASKS[t.id].k === 'pred' && t.pn < 0) { G.phase = 'predict'; return; }
  startPlay(G);
}
function predMoves(G, c) {
  const i = G.tasks.findIndex(t => TASKS[t.id].k === 'pred' && t.pn < 0); if (i < 0) return [];
  const o = G.tasks[i].owner; if (ctl(G, o) !== c) return [];
  const out = []; for (let n = 0; n <= G.ntr; n++) out.push(Object.assign({ t: 'predict', i, n }, G.players[o].helper ? { as: o } : {})); return out;
}

// ---------- signalling (the ping tokens) ----------
function pingWindow(G) {
  if (G.comm === 'none') return false;
  if (G.mission.m23 && G.tricks.length < 1) return false;
  if (G.offered && G.tricks.length > 0) return false;
  if (G.phase === 'signal') return true;
  return G.phase === 'play' && G.trick && G.trick.plays.length === 0;
}
function canPing(G, s) {
  if (!isDiver(G, s) || !pingWindow(G)) return false;
  if (G.comm === 'narc') return G.pool > 0;
  return !G.players[s].pingUsed;
}
function pingMoves(G, s) {
  if (!canPing(G, s)) return [];
  const h = G.players[s].hand, out = [], shown = new Set(G.pings.filter(p => p.seat === s).map(p => p.c));
  for (let su = 0; su < 4; su++) {
    const cs = h.filter(x => suit(x) === su); if (!cs.length) continue;
    const hi = cs[cs.length - 1], lo = cs[0];
    if (cs.length === 1) { if (!shown.has(hi)) out.push({ t: 'ping', c: hi, k: 'only' }); continue; }
    if (!shown.has(hi)) out.push({ t: 'ping', c: hi, k: 'high' });
    if (!shown.has(lo)) out.push({ t: 'ping', c: lo, k: 'low' });
  }
  if (G.comm === 'murky') return out.map(m => ({ t: 'ping', c: m.c, k: '' }));
  return out;
}
function doPing(G, s, m) {
  const p = G.players[s]; if (G.comm === 'narc') G.pool--; else p.pingUsed = 1;
  G.pings.push({ seat: s, c: m.c, k: m.k, n: G.tricks.length });
  ev(G, { t: 'ping', seat: s, c: m.c, k: m.k });
  lg(G, p.name + ' shows ' + cn(m.c) + (m.k === 'high' ? ' as their highest of the suit' : m.k === 'low' ? ' as their lowest of the suit' : m.k === 'only' ? ' as their only card of the suit' : ' (murky water: no token mark)') + '.');
  if (G.phase === 'signal') { G.sig.pass = []; nextSignal(G, s); }
}
function sigOrder(G) { return orderFrom(G, G.cap).filter(s => isDiver(G, s)); }
function startSignal(G) {
  G.phase = 'signal'; G.sig = { pass: [], actor: -1 };
  const ord = sigOrder(G); const first = ord.find(s => canPing(G, s));
  if (first === undefined) { beginTricks(G); return; }
  G.sig.actor = first;
}
function nextSignal(G, from) {
  const ord = sigOrder(G), k = ord.indexOf(from);
  for (let j = 1; j <= ord.length; j++) {
    const s = ord[(k + j) % ord.length];
    if (canPing(G, s) && !G.sig.pass.includes(s)) { G.sig.actor = s; return; }
  }
  beginTricks(G);
}
function startPlay(G) {
  ev(G, { t: 'start' });
  if (G.comm === 'none' || G.mission.m23) { beginTricks(G); return; }
  startSignal(G);
}
function beginTricks(G) {
  G.phase = 'play'; G.trick = { n: G.tricks.length, lead: G.tricks.length ? G.trick.lead : G.cap, turn: G.tricks.length ? G.trick.turn : G.cap, plays: [], ls: -1 };
  ev(G, { t: 'tricks' });
}

// ---------- playing a trick ----------
function playable(G, s) {
  const p = G.players[s];
  let cards = p.helper ? p.stacks.map(st => st[0]).filter(x => x >= 0) : p.hand.slice();
  const T = G.trick;
  if (T.plays.length === 0) {
    if (G.mission.m12) { const ok = cards.filter(x => suit(x) !== 0 && suit(x) !== LAN); if (ok.length) cards = ok; }
    return cards;
  }
  const f = cards.filter(x => suit(x) === T.ls);
  return f.length ? f : cards;
}
function playMoves(G, c) {
  if (G.phase !== 'play') return [];
  const T = G.trick, s = T.turn; if (ctl(G, s) !== c) return [];
  const as = G.players[s].helper ? { as: s } : {};
  return playable(G, s).map(x => Object.assign({ t: 'play', c: x }, as));
}
function trickWinner(plays, ls) {
  let best = -1, bs = -1;
  for (const p of plays) {
    const su = suit(p.c), v = val(p.c);
    let power;
    if (su === LAN) power = 100 + v; else if (su === ls) power = v; else power = 0;
    if (power > best) { best = power; bs = p.s; }
  }
  return bs;
}
function removeCard(G, s, c) {
  const p = G.players[s];
  const i = p.hand.indexOf(c); if (i >= 0) p.hand.splice(i, 1);
  if (p.helper) { const k = p.stacks.findIndex(st => st[0] === c); if (k >= 0) p.stacks[k][0] = -2; }
}
function statusAll(G) { return G.tasks.map((t, i) => jobStatus(G, i)); }
function finish(G, ok, why) {
  G.phase = 'over'; G.result = { ok, why: why || '', tasks: G.tasks.map((t, i) => jobStatus(G, i)) };
  for (const p of G.players) if (p.helper) { /* nothing */ }
  const left = []; for (let c = 0; c < 40; c++) if (!G.pl[c]) left.push(c); G.left = left.length === 1 ? left[0] : -1;
  ev(G, { t: 'over', ok, why: G.result.why });
  lg(G, ok ? 'Dive complete!' : 'The dive failed. ' + (why || ''));
}
function afterTrick(G, k) {
  // flip the drone's cards
  if (G.two) { const H = G.players[G.helper]; for (const st of H.stacks) if (st[0] === -2) { st[0] = st[1]; st[1] = -1; } H.stacks = H.stacks.filter(st => st[0] >= 0 || st[1] >= 0); }
  const st = G.tasks.map((t, i) => jobStatus(G, i));
  st.forEach((x, i) => { if (x !== (G.tasks[i].st || 0)) { G.tasks[i].st = x; ev(G, { t: 'job', i, st: x }); } });
  const failed = st.map((x, i) => x < 0 ? i : -1).filter(i => i >= 0);
  const cb = condBroken(G);
  const over = G.tricks.length >= G.ntr;
  if (failed.length) { finish(G, false, 'A job cannot be done any more: ' + TASKS[G.tasks[failed[0]].id].t); return; }
  if (cb) { finish(G, false, cb); return; }
  if (G.mission.m27 && over && G.lastCard !== SU5) { finish(G, false, 'The Sunstar 5 was not the final card played.'); return; }
  const done = st.every(x => x > 0);
  if (done && (!G.mission.hold || over)) { finish(G, true); return; }
  if (over) { finish(G, st.every(x => x > 0), st.some(x => x <= 0) ? 'Not every job was finished.' : ''); return; }
  // next trick: the winner leads
  G.trick = { n: G.tricks.length, lead: k.w, turn: k.w, plays: [], ls: -1 };
}
function doPlay(G, s, c) {
  const T = G.trick;
  const first = T.plays.length === 0;
  if (first && G.mission.m12 && (suit(c) === 0 || suit(c) === LAN)) { /* forced lead: breaks the rule */ T.bad = 1; }
  removeCard(G, s, c); G.pl[c] = 1; G.lastCard = c;
  T.plays.push({ s, c }); if (first) T.ls = suit(c);
  ev(G, { t: 'play', seat: s, c, n: T.n });
  if (G.mission.m27 && c === SU5 && !(T.n === G.ntr - 1 && T.plays.length === G.np)) { T.bad27 = 1; finish(G, false, 'The Sunstar 5 must be the very last card played.'); return; }
  if (T.bad) { finish(G, false, 'A trick was led with a Coral card or a Lantern.'); return; }
  if (T.plays.length < G.np) { T.turn = (s + 1) % G.np; return; }
  const w = trickWinner(T.plays, T.ls), wc = T.plays.find(p => p.s === w).c;
  const k = { n: T.n, lead: T.lead, ls: T.ls, plays: T.plays.map(p => ({ s: p.s, c: p.c })), w, wc };
  G.tricks.push(k);
  ev(G, { t: 'trick', n: k.n, w, wc, plays: k.plays });
  lg(G, G.players[w].name + ' wins trick ' + (k.n + 1) + ' with ' + cn(wc) + '.');
  if (G.firstW < 0) G.firstW = w;
  if (T.bad) { finish(G, false, 'A trick was led with a Coral card or a Lantern.'); return; }
  if (T.bad27) { finish(G, false, 'The Sunstar 5 was played too early.'); return; }
  afterTrick(G, k);
}
// public state view for the status functions: S.tricks is the tricks list
Object.defineProperty(Object.prototype, '__ld', { value: 0, enumerable: false, writable: true, configurable: true });
// jobStatus / condBroken read S.tricks: provide it as an alias of G.tricks without a second copy
function view(G) { return G; }

// ---------- the public interface ----------
function moves(G, seat) {
  if (!G || G.phase === 'over') return [];
  const out = [];
  switch (G.phase) {
    case 'assign': return assignMoves(G, seat);
    case 'distress': return distressMoves(G, seat);
    case 'pass': return giveMoves(G, seat);
    case 'predict': return predMoves(G, seat);
    case 'signal': {
      if (G.sig.actor !== seat) return [];
      out.push({ t: 'nosig' }); for (const m of pingMoves(G, seat)) out.push(m); return out;
    }
    case 'play': {
      for (const m of playMoves(G, seat)) out.push(m);
      for (const m of pingMoves(G, seat)) out.push(m);
      return out;
    }
  }
  return out;
}
function pending(G) {
  if (!G || G.phase === 'over') return [];
  switch (G.phase) {
    case 'assign': return G.as.mode === 'vote' ? diverSeats(G).filter(s => G.as.votes[s] === undefined) : [ctl(G, G.as.actor)];
    case 'distress': return [G.cap];
    case 'pass': return diverSeats(G).filter(s => G.pass.give[s] === undefined);
    case 'predict': { const t = G.tasks.find(t => TASKS[t.id].k === 'pred' && t.pn < 0); return t ? [ctl(G, t.owner)] : []; }
    case 'signal': return [G.sig.actor];
    case 'play': return [ctl(G, G.trick.turn)];
  }
  return [];
}
function same(a, b) { for (const k in a) if (k !== 'as' && a[k] !== b[k]) return false; return true; }
function apply(G, seat, m) {
  if (!G || !m || typeof m.t !== 'string') return { ok: false, error: 'No move.' };
  if (G.phase === 'over') return { ok: false, error: 'The dive is over.' };
  G.events = [];
  const legal = moves(G, seat).find(x => x.t === m.t && same(x, m) && same(m, x));
  if (!legal) return { ok: false, error: 'That move is not allowed now.' };
  switch (G.phase) {
    case 'assign': { const e = assignApply(G, seat, m); if (e) return { ok: false, error: e }; return { ok: true }; }
    case 'distress': {
      if (!m.on) { lg(G, G.distress ? 'No card passing this attempt.' : 'The crew goes without the distress flare.'); afterDistress(G); return { ok: true }; }
      G.distress = true; ev(G, { t: 'dist', dir: m.dir }); lg(G, 'The distress flare is lit: this dive will count one extra attempt.');
      G.pass = { dir: m.dir, give: {} }; G.phase = 'pass'; return { ok: true };
    }
    case 'pass': {
      G.pass.give[seat] = m.c; ev(G, { t: 'gave', seat });
      if (diverSeats(G).every(s => G.pass.give[s] !== undefined)) runPass(G);
      return { ok: true };
    }
    case 'predict': {
      const t = G.tasks[m.i]; t.pn = m.n; ev(G, { t: 'predict', i: m.i, seat: t.owner, open: TASKS[t.id].open ? m.n : -1 });
      if (TASKS[t.id].open) lg(G, G.players[t.owner].name + ' predicts ' + m.n + ' trick' + (m.n === 1 ? '' : 's') + '.'); else lg(G, G.players[t.owner].name + ' writes down a secret prediction.');
      afterDistress(G); return { ok: true };
    }
    case 'signal':
      if (m.t === 'nosig') { G.sig.pass.push(seat); nextSignal(G, seat); return { ok: true }; }
      doPing(G, seat, m); return { ok: true };
    case 'play':
      if (m.t === 'ping') { doPing(G, seat, m); return { ok: true }; }
      doPlay(G, G.trick.turn, m.c); return { ok: true };
  }
  return { ok: false, error: 'Unknown phase.' };
}
// the clock ran out (real-time dives)
function expire(G) { if (G.phase === 'over' || !G.clock) return false; finish(G, false, 'Time ran out.'); return true; }

// ---------- what a seat may see ----------
function stripView(G, seat) {
  const v = clone(G); v.rng = 0; v.seed = 0; v.tdeck = G.tdeck.length;  // the order of the job deck is hidden
  v.tdisc = G.tdisc.length;
  seat = Number.isInteger(seat) && seat >= 0 && seat < G.np ? seat : -1;
  const mine = seat >= 0 ? ctl(G, seat) : -1;     // the Commander also controls the drone
  v.players.forEach((p, i) => {
    if (p.helper) { p.stacks = p.stacks.map(st => [st[0], st[1] >= 0 ? -3 : st[1]]); p.hand = p.hand.map(x => x); const up = new Set(p.stacks.map(st => st[0]).filter(x => x >= 0)); p.hand = p.hand.map(x => up.has(x) ? x : -1); }
    else if (i !== seat) { p.hand = p.hand.map(() => -1); p.mem = {}; }
  });
  v.tasks.forEach((t, i) => { const d = TASKS[t.id]; if (d.k === 'pred' && !d.open && t.pn >= 0 && !(seat >= 0 && ctl(G, t.owner) === seat) && G.phase !== 'over') t.pn = -2; });
  if (v.as && v.as.votes) { const vt = {}; for (const k in v.as.votes) vt[k] = k == seat ? v.as.votes[k] : -1; v.as.votes = vt; }
  if (G.pass && G.pass.give) { const gv = {}; for (const k in G.pass.give) gv[k] = k == seat ? G.pass.give[k] : -1; v.pass = Object.assign({}, G.pass, { give: gv }); }
  v.seatView = seat; return v;
}
// full state to text for tests and logs
function text(G) {
  const o = [];
  o.push('Dive ' + G.mission.name + ' attempt ' + G.att + ' phase ' + G.phase + ' comm ' + G.comm + ' cap ' + G.cap);
  G.players.forEach(p => o.push(p.name + (p.helper ? ' (drone)' : '') + ': ' + p.hand.map(x => x < 0 ? '??' : cn(x)).join(', ')));
  G.tasks.forEach((t, i) => o.push('job ' + i + ' owner ' + t.owner + ' ' + TASKS[t.id].t + ' [' + jobStatus(G, i) + ']'));
  return o.join('\n');
}
function checkInvariants(G) {
  const e = [], seen = new Array(40).fill(0);
  for (const p of G.players) for (const c of p.hand) { if (c < 0 || c > 39) e.push('bad card in hand ' + c); else seen[c]++; }
  for (const k of G.tricks) for (const p of k.plays) seen[p.c]++;
  if (G.trick && G.trick.plays.length < G.np) for (const p of G.trick.plays) seen[p.c]++;
  for (let c = 0; c < 40; c++) if (seen[c] !== 1) e.push('card ' + c + ' appears ' + seen[c] + ' times');
  if (G.phase !== 'assign') for (const t of G.tasks) if (t.owner < 0 || t.owner >= G.np) e.push('task without owner');
  const col = G.np - 3; const sm = G.tasks.reduce((a, t) => a + TASKS[t.id].d[col], 0);
  if (G.mission.sel !== 'fixed' && sm !== G.mission.d) e.push('job difficulty ' + sm + ' != ' + G.mission.d);
  if (G.two) { const H = G.players[G.helper]; if (H.hand.length !== H.stacks.filter(s => s[0] >= 0).length + H.stacks.filter(s => s[1] >= 0).length) e.push('drone stacks mismatch'); }
  const total = G.players.reduce((a, p) => a + p.hand.length, 0) + G.tricks.length * G.np + (G.trick && G.trick.plays.length < G.np ? G.trick.plays.length : 0);
  if (total !== 40) e.push('card total ' + total);
  if (G.phase === 'play' && G.trick.plays.length === 0) { const sz = G.players.map(p => p.hand.length); if (Math.max(...sz) - Math.min(...sz) > 1) e.push('hand sizes ' + sz); }
  G.tricks.forEach((k, i) => { if (k.plays.length !== G.np) e.push('trick size'); if (trickWinner(k.plays, k.ls) !== k.w) e.push('winner mismatch'); });
  if (G.pool < 0) e.push('negative pool');
  if (G.phase === 'play' && G.cap >= 0 && !G.players[G.cap].hand.length && G.tricks.length === 0) e.push('captain lost lantern 4');
  return e;
}
Object.assign(LD, { newGame, nextAttempt, moves, apply, pending, stripView, checkInvariants, text, expire, clone, jobStatus, condBroken, suit, val, trickWinner, ntrOf, playable, canPing, pingMoves, ctl, isDiver, diverSeats, orderFrom, conflict, splitOK, claims, needRedeal,
  validMoves: moves, performMove: (G, m, s) => apply(G, s, m), sideToAct: pending, render_game_to_text: text,
  _: { rnd, shuffle, KIND, tw, ntrOf, startPlay, finish, afterTrick, dealHands, drawTasks, holdsMission, statusAll, doPlay, playable, remVal, remSuit, wonBy, cardsWon, longestRun, startAttempt, TASKS } });
// the status functions read S.tricks: make G answer to it
Object.defineProperty(LD, 'logAlias', { value: 1 });
if (typeof module === 'object' && module.exports) module.exports = LD;
})(typeof globalThis !== 'undefined' ? globalThis : this);

/* Redline Rally engine: all state in one JSON-safe G. Cards are strings: '1'..'4' speed, 'H' heat, 'X' stress.
   Round = every car plans (gear + cards + boost), then cars resolve from the leader back. See rules-notes.md. */
function rnd(G) { G.rs = (G.rs + 0x6D2B79F5) >>> 0; var t = G.rs; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
function shuffle(G, a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd(G) * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function isSpeed(c) { return c >= '1' && c <= '4'; }

function newGame(o) {
  o = o || {}; var trk = TK[o.track || 'sunline'], n = Math.max(2, Math.min(6, o.n || 5));
  var G = { v: 1, track: trk.id, laps: o.laps || 2, rs: (o.seed == null ? (Date.now() & 0x7fffffff) : o.seed) >>> 0, cars: [], round: 1, phase: 'plan', pend: null, order: [], ri: 0, adr: [], tick: 0, over: false, rank: [], finN: 0, diff: o.diff || 'normal', hot: o.humans > 1, upg: !!o.upg, drafting: false, pool: null, cl: o.climit || 0, cmp: o.cmp || null, wx: WEATHER[o.wx] ? o.wx : 'dry', sup: !!o.sup };
  var humans = Math.max(0, Math.min(n, o.humans == null ? 1 : o.humans));
  var di = []; for (var d = 0; d < DRIVERS.length; d++) di.push(d); shuffle(G, di);
  for (var i = 0; i < n; i++) {
    var deck = []; for (var v = 1; v <= 4; v++) for (var k = 0; k < 3; k++) deck.push(String(v)); deck.push('X', 'X', 'X');
    var dr = DRIVERS[i < humans ? i : di[i % 6]];
    if (G.sup) { START_UPG.forEach(function (id) { deck.push('u:' + id); }); for (var sh = 0; sh < START_HEAT; sh++) deck.push('H'); }
    var c = { i: i, col: i, upg: [], sup: G.sup ? START_UPG.slice() : [], xh: G.sup ? START_HEAT : 0, name: dr.name, drv: dr.id, human: i < humans, deck: shuffle(G, deck), hand: [], disc: [], played: [], eng: ENGINE0, gear: 1, pos: 0, plan: null, tie: 0, stats: { heat: 0, spins: 0, slips: 0, boosts: 0 } };
    G.cars.push(c);
  }
  /* grid: two cars per row, pole at the front. Humans start mid-pack-ish: seat order is the grid order shuffled. */
  var grid = []; for (i = 0; i < n; i++) grid.push(i); shuffle(G, grid);
  grid.forEach(function (ci, k) { G.cars[ci].pos = Math.ceil(n / 2) - 1 - Math.floor(k / 2); G.cars[ci].tie = k; });
  G.tick = n;
  if (o.lowheat) G.cars.forEach(function (c) { if (c.human) { c.eng = ENGINE0 - 2; c.disc.push('H', 'H'); } });   /* campaign twist: you start with 4 heat, 2 heat cards already in the discard */
  if (WEATHER[G.wx].eng) G.cars.forEach(function (c) { for (var w = 0; w < -WEATHER[G.wx].eng && c.eng > 0; w++) { c.eng--; c.disc.push('H'); } });   /* heatwave */
  if (G.upg) {   /* upgrade draft: humans pick first (the UI calls draftPick / draftDone), then the computer drivers, then the decks are shuffled and dealt */
    G.pool = {}; UPG_IDS.forEach(function (id) { G.pool[id] = UPG_COPIES; });
    if (humans > 0) { G.drafting = true; return G; }
    draftDone(G); return G;
  }
  G.cars.forEach(function (c) { draw(G, c, HAND); });
  return G;
}
function draftPick(G, ci, id) {
  var c = G.cars[ci]; if (!G.drafting || !G.pool || !(G.pool[id] > 0) || c.upg.length >= DRAFT_PICKS) return 'pick';
  G.pool[id]--; c.upg.push(id); return '';
}
function aiDraft(G, c) {
  var W = { rocket: 3, tuned: 2.6, grip: 2.2, coolant: 2, brakes: 1.7, pit: 1 }, noise = G.diff === 'easy' ? 3 : G.diff === 'hard' ? 0.2 : 1.2;
  while (c.upg.length < DRAFT_PICKS) {
    var best = null; UPG_IDS.forEach(function (id) { if (G.pool[id] < 1) return; var s = W[id] - (c.upg.indexOf(id) >= 0 ? 1.5 : 0) + rnd(G) * noise; if (!best || s > best.s) best = { s: s, id: id }; });
    if (!best) return; G.pool[best.id]--; c.upg.push(best.id);
  }
}
function draftDone(G) {   /* computer picks, then every deck gets its upgrades, is shuffled and a hand is dealt */
  G.drafting = false;
  G.cars.forEach(function (c) { if (!c.human) aiDraft(G, c); });
  G.cars.forEach(function (c) { c.deck = shuffle(G, c.deck.concat(c.upg.map(function (id) { return 'u:' + id; }))); c.hand = []; draw(G, c, HAND); });
}
function T(G) { return TK[G.track]; }
function climit(G, l) { var w = G.wx ? WEATHER[G.wx].cl : 0; return Math.max(1, l + (G.cl || 0) + (l > 2 ? w : 0)); }   /* campaign twist + weather (rain never takes a corner below 2) */   /* campaign twist: corner limits shifted for the whole chapter */
function slipN(G) { return WEATHER[G.wx || 'dry'].slip; }
function total(G) { return G.laps * T(G).N; }

/* ---- deck handling ---- */
function draw(G, c, upto) {
  while (c.hand.length < upto) {
    if (!c.deck.length) { if (!c.disc.length) return; c.deck = shuffle(G, c.disc); c.disc = []; }
    c.hand.push(c.deck.pop());
  }
}
function flipSpeed(G, c, flips) {   /* reveal until a speed card shows; others go to the discard. Returns its value (0 if the deck is empty) */
  for (var guard = 0; guard < 60; guard++) {
    if (!c.deck.length) { if (!c.disc.length) return 0; c.deck = shuffle(G, c.disc); c.disc = []; }
    var x = c.deck.pop(); flips.push(x); c.disc.push(x);
    if (isSpeed(x)) return +x;
  }
  return 0;
}
function avgSpeed(c) { var s = 0, n = 0; c.deck.concat(c.disc).forEach(function (x) { if (isSpeed(x)) { s += +x; n++; } }); return n ? s / n : 2.5; }

/* ---- helpers ---- */
function occ(G, p, except) { var N = T(G).N, k = 0; G.cars.forEach(function (c) { if (c !== except && c.pos % N === p % N) k++; }); return k; }
function landing(G, c, target) { var t = target; while (t > c.pos && occ(G, t, c) >= 2) t--; return t; }
function cornersIn(G, a, b) {   /* corner lines crossed moving from space a to space b */
  var tk = T(G), out = []; for (var p = a + 1; p <= b && p <= total(G); p++) { var lim = tk.corners[p % tk.N]; if (lim) out.push({ p: p, idx: p % tk.N, limit: climit(G, lim) }); } return out;
}
function cornerCost(G, a, b, speed, lim) { var s = 0; cornersIn(G, a, b).forEach(function (k) { s += Math.max(0, speed - k.limit - (lim || 0)); }); return s; }
function rankList(G) {   /* car ids, best first: finishers in finishing order (same round: furthest past the line), then the rest by distance */
  return G.cars.map(function (c) { return c.i; }).sort(function (a, b) { var A = G.cars[a], B = G.cars[b];
    if (!!A.fin !== !!B.fin) return A.fin ? -1 : 1;
    if (A.fin) return (A.fin - B.fin) || (B.pos - A.pos) || (A.tie - B.tie);
    return (B.pos - A.pos) || (A.tie - B.tie); });
}
function racing(G) { return rankList(G).filter(function (i) { return !G.cars[i].fin; }); }
function adrenalineFor(G) {   /* last car to move each round gets it; the last two when 5+ cars started (rulebook: counted from starting cars) */
  var r = racing(G), k = G.cars.length >= 5 ? 2 : 1; return r.slice(Math.max(0, r.length - k));
}
function discardOptional(G, ci, idxs) {   /* replenish step: discard chosen non-heat, non-stress cards face up, then draw back to a full hand. Plan phase, once per round, before the plan */
  var c = G.cars[ci]; if (G.phase !== 'plan' || c.plan || c.dsc === G.round) return 'phase';
  var seen = {}; for (var i = 0; i < idxs.length; i++) { var j = idxs[i], x = c.hand[j]; if (x === undefined || seen[j] || x === 'H' || x === 'X') return 'card'; seen[j] = 1; }
  c.dsc = G.round; c.disc = c.disc.concat(c.hand.filter(function (x, j) { return seen[j]; })); c.hand = c.hand.filter(function (x, j) { return !seen[j]; }); draw(G, c, HAND); return '';
}
function gearOpts(c) { var o = []; for (var g = 1; g <= GEARS; g++) { var d = Math.abs(g - c.gear); if (d <= 2 && (d < 2 || c.eng >= 1)) o.push({ g: g, cost: d === 2 ? 1 : 0 }); } return o; }
function needCards(c, g) { var k = 0; c.hand.forEach(function (x) { if (x !== 'H') k++; }); return Math.min(g, k); }
function planCost(c, plan) { return (Math.abs(plan.gear - c.gear) === 2 ? 1 : 0) + (plan.boost ? 1 : 0); }
function planError(c, plan) {
  var go = gearOpts(c).filter(function (o) { return o.g === plan.gear; })[0]; if (!go) return 'gear';
  if (plan.idx.length !== needCards(c, plan.gear)) return 'count';
  var seen = {}; for (var i = 0; i < plan.idx.length; i++) { var j = plan.idx[i]; if (j < 0 || j >= c.hand.length || seen[j] || c.hand[j] === 'H') return 'card'; seen[j] = 1; }
  if (planCost(c, plan) > c.eng) return 'heat';
  return '';
}
function submitPlan(G, ci, plan) {
  var c = G.cars[ci]; if (G.phase !== 'plan' || c.plan) return 'phase'; var e = planError(c, plan); if (e) return e;
  var cards = plan.idx.map(function (j) { return c.hand[j]; });
  c.hand = c.hand.filter(function (x, j) { return plan.idx.indexOf(j) < 0; });
  c.plan = { gear: plan.gear, cards: cards, boost: !!plan.boost }; return '';
}
function needPlans(G) { return G.cars.filter(function (c) { return c.human && !c.plan && !c.fin; }).map(function (c) { return c.i; }); }

/* ---- resolving a round ---- */
function startResolve(G) {
  G.cars.forEach(function (c) { if (c.fin && c.plan) { c.hand = c.hand.concat(c.plan.cards); c.plan = null; } });   /* a finished car does not play */
  G.phase = 'resolve'; G.order = racing(G); G.ri = 0; G.adr = adrenalineFor(G);
}
function curCar(G) { return G.phase === 'resolve' && G.ri < G.order.length ? G.cars[G.order[G.ri]] : null; }

/* returns events; may set G.pend = {t:'slip', car, from, L0, L1} (human choice): then call slipChoice() */
function resolveNext(G) {
  if (G.pend || G.phase !== 'resolve') return [];
  var ev = [];
  if (G.ri >= G.order.length) { endRound(G, ev); return ev; }
  var c = G.cars[G.order[G.ri]];
  if (!c.plan) c.plan = aiPlan(G, c);
  var pl = c.plan, from = c.pos, cost;
  if (pl.cards.length < pl.gear) {   /* not enough playable cards: play them all, fill with heat from the hand, do not move, back to gear 1 */
    var fill = 0; for (var q = c.hand.length - 1; q >= 0 && pl.cards.length + fill < pl.gear; q--) if (c.hand[q] === 'H') { c.hand.splice(q, 1); c.disc.push('H'); fill++; }
    c.disc = c.disc.concat(pl.cards); c.gear = 1; c.plan = null; c.pl2 = null; c.played = []; draw(G, c, HAND);
    ev.push({ t: 'stall', car: c.i, cards: pl.cards.length, heat: fill }, { t: 'done', car: c.i }); G.ri++; return ev;
  }
  /* 1 shift */
  if (pl.gear !== c.gear) { cost = Math.abs(pl.gear - c.gear) === 2 ? 1 : 0; c.eng -= cost; for (var i = 0; i < cost; i++) c.disc.push('H'); c.stats.heat += cost; ev.push({ t: 'shift', car: c.i, from: c.gear, to: pl.gear, cost: cost }); c.gear = pl.gear; }
  /* 3 play the cards */
  var speed = 0, shown = [], lim = 0, coolX = 0, addX = 0;
  pl.cards.forEach(function (x) { var u = upgId(x); if (u) { var ud = UPG[u]; speed += ud.sp; lim += ud.lim; coolX += ud.cool; addX += ud.stress; shown.push({ card: x, v: ud.sp, upg: u }); } else if (x === 'X') { var fl = []; var v = flipSpeed(G, c, fl); speed += v; shown.push({ card: 'X', flips: fl, v: v }); } else { speed += +x; shown.push({ card: x, v: +x }); } });
  ev.push({ t: 'play', car: c.i, cards: shown, speed: speed });
  c.disc = c.disc.concat(pl.cards);
  for (var sx = 0; sx < addX; sx++) c.disc.push('X');
  if (coolX) { var m2 = 0; for (var j2 = c.hand.length - 1; j2 >= 0 && m2 < coolX; j2--) if (c.hand[j2] === 'H') { c.hand.splice(j2, 1); c.eng++; m2++; } if (m2) ev.push({ t: 'cool', car: c.i, n: m2 }); }
  /* 4 react: cooldown (heat cards in hand go back to the engine), then boost */
  var cool = COOL[c.gear] + (G.adr.indexOf(c.i) >= 0 ? 1 : 0), moved = 0;
  for (var j = c.hand.length - 1; j >= 0 && moved < cool; j--) if (c.hand[j] === 'H') { c.hand.splice(j, 1); c.eng++; moved++; }
  if (moved) ev.push({ t: 'cool', car: c.i, n: moved });
  if (pl.boost && c.eng >= 1) { c.eng--; c.disc.push('H'); c.stats.heat++; c.stats.boosts++; var fb = []; var bv = flipSpeed(G, c, fb); speed += bv; ev.push({ t: 'boost', car: c.i, flips: fb, add: bv, speed: speed }); }
  var adr = G.adr.indexOf(c.i) >= 0 ? 1 : 0; if (adr) ev.push({ t: 'adr', car: c.i });
  var move = speed + adr, L0 = landing(G, c, from + move);
  c.pl2 = { speed: speed, from: from, L0: L0, lim: lim };
  /* 5 slipstream offer */
  var L1 = L0 >= total(G) ? L0 : landing(G, c, L0 + slipN(G)), N = T(G).N;
  var near = L1 > L0 && G.cars.some(function (o) { return o !== c && (o.pos % N === L0 % N || o.pos % N === (L0 + 1) % N); });
  ev.push({ t: 'move', car: c.i, from: from, to: L0 });
  if (near) {
    if (c.human) { G.pend = { t: 'slip', car: c.i, from: from, L0: L0, L1: L1, speed: speed, lim: lim }; return ev; }
    var use = aiSlip(G, c, from, L0, L1, speed, lim); ev.push({ t: 'slipq', car: c.i, use: use }); return ev.concat(finishMove(G, c, use, ev));
  }
  return ev.concat(finishMove(G, c, false, ev));
}
function slipChoice(G, use) {
  var p = G.pend; if (!p) return []; G.pend = null; var c = G.cars[p.car]; return finishMove(G, c, !!use, []);
}
function finishMove(G, c, slip, evSoFar) {
  var ev = [], q = c.pl2, from = q.from, speed = q.speed, L = q.L0;
  if (slip) { L = landing(G, c, q.L0 + slipN(G)); ev.push({ t: 'slip', car: c.i, from: q.L0, to: L }); c.stats.slips++; }
  /* corners crossed on the way, in order */
  var ks = cornersIn(G, from, L), spun = false;
  for (var i = 0; i < ks.length && !spun; i++) {
    var k = ks[i], need = Math.max(0, speed - k.limit - (q.lim || 0));
    if (need > c.eng) {   /* spin out: stop behind this corner line, gear 1, stress card */
      var stop = k.p - 1; while (stop > from && occ(G, stop, c) >= 2) stop--; if (stop < from) stop = from;
      var nst = c.gear >= 3 ? 2 : 1; for (var sk = 0; sk < nst; sk++) c.hand.push('X');
      if (c.eng) { for (var hh = 0; hh < c.eng; hh++) c.disc.push('H'); c.stats.heat += c.eng; c.eng = 0; }   /* spin out pays ALL engine heat */
      c.pos = stop; c.gear = 1; c.stats.spins++; spun = true; c.tie = G.tick++;
      ev.push({ t: 'spin', car: c.i, idx: k.idx, limit: k.limit, speed: speed, to: stop, from: L }); break;
    }
    if (need) { c.eng -= need; for (var h = 0; h < need; h++) c.disc.push('H'); c.stats.heat += need; }
    ev.push({ t: 'corner', car: c.i, idx: k.idx, limit: k.limit, speed: speed, cost: need, p: k.p });
  }
  if (!spun) { c.pos = L; if (L !== from) c.tie = G.tick++; }
  c.plan = null; c.pl2 = null; c.played = [];
  draw(G, c, HAND);
  if (c.pos >= total(G)) { c.fin = ++G.finN; ev.push({ t: 'finish', car: c.i }); }
  ev.push({ t: 'done', car: c.i }); G.ri++;
  return ev;
}
function endRound(G, ev) {
  var fin = G.cars.every(function (c) { return c.fin; });
  G.cars.forEach(function (c) { c.plan = null; });
  if (fin) { G.phase = 'over'; G.over = true; G.rank = rankList(G); ev.push({ t: 'over', rank: G.rank }); }
  else { G.round++; G.phase = 'plan'; G.order = []; G.ri = 0; ev.push({ t: 'round', round: G.round }); }
}

/* ---- invariants and move list (for tests and tools) ---- */
function checkInvariants(G) {
  var bad = [], N = T(G).N;
  G.cars.forEach(function (c) {
    var cnt = c.deck.length + c.disc.length + c.hand.length + (c.plan ? c.plan.cards.length : 0);
    var heatCards = c.deck.concat(c.disc, c.hand).filter(function (x) { return x === 'H'; }).length;
    if (c.eng + heatCards !== ENGINE0 + (c.xh || 0)) bad.push('heat not conserved car ' + c.i + ' eng ' + c.eng + ' cards ' + heatCards);
    if (c.eng < 0) bad.push('engine negative'); if (c.gear < 1 || c.gear > GEARS) bad.push('gear');
    var spd = c.deck.concat(c.disc, c.hand, c.plan ? c.plan.cards : []).filter(isSpeed).length; if (spd !== 12) bad.push('speed cards ' + spd + ' car ' + c.i);
    if (c.hand.length > HAND + 3) bad.push('hand too big');
    if (!G.drafting) { var ups = c.deck.concat(c.disc, c.hand, c.plan ? c.plan.cards : []).filter(function (x) { return upgId(x); }).length; if (ups !== c.upg.length + (c.sup ? c.sup.length : 0)) bad.push('upgrade cards ' + ups + ' car ' + c.i); }
  });
  var per = {}; G.cars.forEach(function (c) { var k = c.pos % N; per[k] = (per[k] || 0) + 1; if (per[k] > 2) bad.push('3 cars on space ' + k); });
  return bad;
}
function validMoves(G, ci) {   /* every legal (gear, boost) with the playable cards; the UI picks cards */
  var c = G.cars[ci], out = []; gearOpts(c).forEach(function (o) { [false, true].forEach(function (b) { var pl = { gear: o.g, boost: b, idx: [] }; if (planCost(c, pl) <= c.eng) out.push({ gear: o.g, boost: b, n: needCards(c, o.g) }); }); }); return out;
}
function sideToAct(G) { if (G.phase === 'plan') return needPlans(G)[0]; if (G.pend) return G.pend.car; var c = curCar(G); return c ? c.i : -1; }

/* ---- championship (HOUSE VALUES: CHAMP_PTS per place; ties on points: more wins, then the better place in the last race) ---- */
function champNew(names) { return { race: 0, tracks: CHAMP_TRACKS.slice(), rows: names.map(function (n, i) { return { i: i, name: n, pts: 0, wins: 0, last: 99, res: [] }; }) }; }
function champAward(ch, rank) {   /* rank = car ids best first (G.rank); car id = row index */
  rank.forEach(function (ci, k) { var r = ch.rows[ci]; if (!r) return; r.pts += CHAMP_PTS[k] || 0; if (k === 0) r.wins++; r.last = k + 1; r.res.push(k + 1); });
  ch.race++; return champTable(ch);
}
function champTable(ch) { return ch.rows.slice().sort(function (a, b) { return (b.pts - a.pts) || (b.wins - a.wins) || (a.last - b.last) || (a.i - b.i); }); }
function champOver(ch) { return ch.race >= ch.tracks.length; }

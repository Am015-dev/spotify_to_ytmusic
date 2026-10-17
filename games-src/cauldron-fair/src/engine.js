// ===================== Cauldron Fair rules engine =====================
// Plain JS (browser global CF / node module). State G is one JSON-serialisable object, with a seeded RNG (G.rng) and one RNG per seat (p.rng,
// used for that seat's bag so simultaneous drawing is reproducible whatever order the seats act in).
//   CF.newGame({players:2..4, seed, names:[], ai:[level|null,...], chars:[], sets:{G,B,R,Y,P} | setMode:1|2|3|4|'random'}) -> G
//   CF.moves(G, seat)        -> [{t, ..., label}]   every legal move of that seat right now (brew is simultaneous: any seat may act any time)
//   CF.apply(G, seat, move)  -> {ok:true} | {ok:false, error}
//   CF.pending(G)            -> seats the game is waiting for;   CF.stripView(G, seat) / CF.score(G) / CF.checkInvariants(G) / CF.risk(G, seat)
// Chips are {i:id, c:'W'|'O'|'G'|'B'|'R'|'Y'|'P'|'K', v:1|2|3|4}; a chip in a pot also has pos (the space it sits on, 1..52).
// Phases: 'prep' (fortune card + rats + purple card choices) -> 'brew' (simultaneous) -> 'eval' (steps in G.ev.step) -> next round ... -> 'over'.
(function (g) {
'use strict';
const CF = g.CF = g.CF || {};
const D = CF.DATA || (typeof require === 'function' ? require('./data.js') : null);
const LASTC = D.LAST_CHIP, SPOON = D.SPOON, NAMES = ['Ann', 'Bo', 'Cy', 'Di'];
const FORT = {}; D.FORTUNE.forEach((f, i) => { FORT[f.id] = f; f.ix = i; });
const ck = c => c.c + c.v;                         // chip key, e.g. 'W2'
const clone = o => JSON.parse(JSON.stringify(o));

// ---------- rng ----------
function nextRand(st) { let t = (st + 0x6D2B79F5) | 0; return t; }
function rnd(G, n) { let t = (G.rng = (G.rng + 0x6D2B79F5) | 0); t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * n); }
function prnd(p, n) { let t = (p.rng = (p.rng + 0x6D2B79F5) | 0); t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return Math.floor(((t ^ t >>> 14) >>> 0) / 4294967296 * n); }
function shuffleG(G, a) { for (let i = a.length - 1; i > 0; i--) { const j = rnd(G, i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function shuffleP(p, a) { for (let i = a.length - 1; i > 0; i--) { const j = prnd(p, i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function lg(G, t) { if (G.nolog) return; G.logN++; G.log.push({ i: G.logN, round: G.round, t }); if (G.log.length > 500) G.log.splice(0, 120); }
function ev(G, e) { if (G.nolog) return; e.n = ++G.evN; e.round = G.round; G.events.push(e); if (G.events.length > 260) G.events.splice(0, 80); }
function use(G, k, n) { G.used[k] = (G.used[k] || 0) + (n === undefined ? 1 : n); }

// ---------- small helpers ----------
const effOf = (G, c) => c === 'W' ? 'none' : c === 'O' ? 'none' : c === 'K' ? 'black' : D.BOOKS[c][G.sets[c]].eff;
const bookOut = (G, c) => G.round >= D.BOOK_ROUND[c];
const price = (G, c, v) => { const b = c === 'O' ? D.BOOKS.O[0] : c === 'K' ? D.BOOKS.K[0] : D.BOOKS[c][G.sets[c]]; const i = v === 1 ? 0 : v === 2 ? 1 : 2; return b.price[i]; };
const lastOf = G => G.last || D.rounds;            // the number of days (9; a short staged game, e.g. the tutorial, sets G.last)
const left = (G, s) => (s + 1) % G.np, right = (G, s) => (s - 1 + G.np) % G.np;
const whiteSum = p => p.pot.reduce((a, c) => a + (c.c === 'W' ? c.v : 0), 0);
const count = (arr, c) => arr.reduce((a, x) => a + (x.c === c ? 1 : 0), 0);
function limitOf(G, p) {
  let l = D.limit + (G.fcard === 'thick' ? 2 : 0);
  if (G.sets.Y === 3) { const y = count(p.pot, 'Y'); l += y >= 3 ? 2 : y >= 1 ? 1 : 0; }
  return l;
}
const startPos = p => p.rat > 0 ? Math.max(p.rat, p.droplet) : p.droplet;
const lastPos = p => p.pot.length ? p.pot[p.pot.length - 1].pos : startPos(p);
const spaceOf = p => Math.min(lastPos(p) + 1, SPOON);
const leaderVp = G => Math.max.apply(null, G.players.map(p => p.vp));

// ---------- supply & chips ----------
function mkChip(G, c, v) { return { i: G.nextId++, c, v }; }
function take(G, key) { if (!(G.supply[key] > 0)) return null; G.supply[key]--; return mkChip(G, key[0], +key.slice(1)); }
function putBack(G, chip) { G.supply[ck(chip)]++; }
function bagInsert(p, chip) { delete chip.pos; p.bag.splice(prnd(p, p.bag.length + 1), 0, chip); }
function give(G, p, key, toBag, why) { const c = take(G, key); if (!c) { lg(G, 'The shop has no ' + nameOf(key) + ' left.'); return null; } if (toBag) bagInsert(p, c); else p.newChips.push(c); ev(G, { t: 'gainChip', seat: p.seat, chip: { i: c.i, c: c.c, v: c.v } }); if (why) lg(G, nm(G, p) + ' takes a ' + nameOf(key) + ' (' + why + ').'); return c; }
const nameOf = key => D.COLORS[key[0]].name + ' ' + key.slice(1);
const pn = (G, s) => G.players[s].name;
const nm = (G, p) => p.name;

// ---------- setup ----------
function newGame(o) {
  o = o || {};
  const np = Math.max(2, Math.min(4, (o.players | 0) || 2));
  const seed = (o.seed === undefined ? Date.now() : o.seed) | 0;
  const G = { v: 1, np, seed, rng: seed, round: 1, phase: 'prep', start: 0, sets: {}, supply: clone(D.SUPPLY), nextId: 1, fdeck: [], fcard: null, fdisc: [], players: [], log: [], logN: 0, events: [], evN: 0, used: {}, hist: [], rep: null, over: false, winner: -1, winners: [], winText: '', ev: null, shopSeat: -1, opts: { setMode: o.setMode || 1, guided: !!o.guided }, force: o.firstCard || null, last: o.length ? Math.max(1, Math.min(D.rounds, o.length | 0)) : D.rounds };
  const sets = o.sets;
  ['G', 'B', 'R', 'Y', 'P'].forEach(c => { G.sets[c] = sets ? sets[c] : (o.setMode === 'random' ? 1 + rnd(G, 4) : (o.setMode || 1)); });
  for (let i = 0; i < np; i++) {
    const p = { seat: i, name: (o.names && o.names[i]) || NAMES[i], ai: (o.ai && o.ai[i]) || null, char: (o.chars && o.chars[i] != null) ? o.chars[i] : i, vp: 0, rubies: D.startRubies, droplet: 0, flask: true, rat: 0, ratTails: 0,
      rng: (seed ^ Math.imul(i + 1, 0x9E3779B1)) | 0, bag: [], pot: [], side: [], hold: [], newChips: [], q: null, postq: [], acts: [], st: 'draw', boom: false, prot: false, f: {}, res: null, last9: 0, ver: 0, endVp: 0 };
    G.players.push(p);
    for (const k of Object.keys(D.START_BAG)) for (let n = 0; n < D.START_BAG[k]; n++) p.bag.push(take(G, k));
  }
  G.fdeck = shuffleG(G, D.FORTUNE.map(f => f.id));
  lg(G, 'The fair opens: ' + np + ' potion-makers, ' + lastOf(G) + ' days. Books: ' + ['G', 'B', 'R', 'Y', 'P'].map(c => D.COLORS[c].name + ' ' + G.sets[c]).join(', ') + '.');
  startRound(G);
  adv(G);
  return G;
}

// ---------- round start ----------
function resetSeat(G, p) {
  shuffleP(p, p.bag);
  p.pot = []; p.hold = []; p.q = null; p.lock = false; p.h9 = null; p.postq = []; p.acts = []; p.st = 'draw'; p.boom = false; p.prot = false; p.res = null; p.rat = 0; p.ratTails = 0;
  p.f = { dbl: false, safe: 0, doUsed: false, frOpen: false, frUsed: false, canFlask: false, whites: 0, spill: false };
}
function startRound(G) {
  G.phase = 'prep'; G.ev = null; G.shopSeat = -1;
  for (const p of G.players) resetSeat(G, p);
  let id; if (G.force && FORT[G.force]) { id = G.force; const ix = G.fdeck.indexOf(id); if (ix >= 0) G.fdeck.splice(ix, 1); else { const jx = G.fdisc.indexOf(id); if (jx >= 0) G.fdisc.splice(jx, 1); } G.force = null; } else id = G.fdeck.pop();
  G.fcard = id; G.fdisc.push(id);
  const card = FORT[id]; use(G, 'fortune_' + id);
  ev(G, { t: 'round', round: G.round, start: G.start }); ev(G, { t: 'fortune', id });
  lg(G, 'Day ' + G.round + ' of ' + lastOf(G) + '. ' + pn(G, G.start) + ' turns up the fortune card "' + card.name + '": ' + card.text);
  if (id !== 'clear') setRats(G);          // Clear the Pods gives points first: the rat tails are counted after the answers (see H 'clear')
  purple(G, id);
}
function setRats(G) {
  if (G.round < 2) return;
  const lead = leaderVp(G);
  for (const p of G.players) {
    const t = p.vp < lead ? D.ratTails(p.vp, lead) : 0; p.ratTails = t;
    if (t > 0) { p.rat = Math.min(LASTC, p.droplet + t); ev(G, { t: 'rat', seat: p.seat, tails: t, pos: p.rat }); lg(G, nm(G, p) + ' is behind the leader on points (' + t + ' rat tail' + (t > 1 ? 's' : '') + '), so the rat stone gives a head start of ' + t + ' space' + (t > 1 ? 's' : '') + '.'); use(G, 'rat'); }
  }
}

// ---------- purple fortune cards (and the questions they raise) ----------
const oneChips = G => ['O', 'G', 'B', 'R'].concat(bookOut(G, 'Y') ? ['Y'] : []);                     // 1-chips a card may hand out (never white / purple / black)
const chipsOfValue = (G, v) => ['G', 'B', 'R', 'Y'].filter(c => bookOut(G, c) && D.COLORS[c].vals.indexOf(v) >= 0 && G.supply[c + v] > 0).map(c => c + v);
function ask(G, p, h, d) { p.q = { h, d: d || {} }; }
function purple(G, id) {
  const P = G.players, last = G.round === lastOf(G);
  const lowest = (fn) => { const m = Math.min.apply(null, P.map(fn)); return P.filter(p => fn(p) === m); };
  switch (id) {
    case 'pick': if (last) { for (const p of P) addRuby(G, p, 3, 'Pedlar\'s Pick'); lg(G, 'Last day: a chip could never be drawn, so everybody simply takes the 3 rubies.'); } else for (const p of P) ask(G, p, 'pick'); break;
    case 'slide': for (const p of P) drop(G, p, 1, 'card'); break;
    case 'swap': if (last) lg(G, 'Last day: a chip could never be drawn, so Swap Stall is skipped (rubies are worth points now).'); else for (const p of P) if (p.rubies >= 1) ask(G, p, 'swap'); break;
    case 'alms': for (const p of lowest(p => p.rubies)) { p.rubies++; ev(G, { t: 'gain', seat: p.seat, k: 'ruby', n: 1 }); lg(G, nm(G, p) + ' takes a ruby (fewest).'); } break;
    case 'underdog': for (const p of lowest(p => p.vp)) { give(G, p, 'G1', true); lg(G, nm(G, p) + ' takes a Mossback 1 (fewest points).'); } break;
    case 'clear': for (const p of P) ask(G, p, 'clear'); break;
    case 'swarm': for (const p of P) if (p.rat > 0) { p.rat = Math.min(LASTC, p.rat + p.ratTails); lg(G, nm(G, p) + ' counts the rat tails again: the rat stone moves on.'); ev(G, { t: 'rat', seat: p.seat, tails: p.ratTails, pos: p.rat }); } break;
    case 'dip': {
      const sums = P.map(p => { const ch = []; const n = Math.min(5, p.bag.length); for (let i = 0; i < n; i++) ch.push(p.bag.pop()); const s = ch.reduce((a, c) => a + c.v, 0); ev(G, { t: 'peek', seat: p.seat, chips: ch.map(c => ({ i: c.i, c: c.c, v: c.v })) }); ch.forEach(c => bagInsert(p, c)); return s; });
      const m = Math.min.apply(null, sums);
      P.forEach((p, i) => { if (sums[i] === m) { give(G, p, 'B2', true); lg(G, nm(G, p) + ' has the lowest total (' + sums[i] + ') and takes a Wren Feather 2.'); } else { p.rubies++; ev(G, { t: 'gain', seat: p.seat, k: 'ruby', n: 1 }); lg(G, nm(G, p) + ' draws ' + sums[i] + ' and takes a ruby.'); } });
      break;
    }
    case 'bribe': for (const p of P) if (p.rat > p.droplet) ask(G, p, 'bribe', { max: Math.min(3, p.rat - p.droplet) }); break;
    case 'bounty': for (const p of P) { if (last || !chipsOfValue(G, 4).length) { if (p.ratTails > 0) addVp(G, p, p.ratTails, 'Rat Bounty'); } else ask(G, p, 'bounty'); } if (last) lg(G, 'Last day: Rat Bounty gives points only (a chip could never be drawn).'); break;
    case 'fork': if (last) lg(G, 'Last day: a droplet step or chip would never be used, so Fork in the Road is skipped.'); else for (const p of P) ask(G, p, 'fork'); break;
    case 'dice': for (const p of P) rollDie(G, p, 'card'); break;
    case 'haggle': if (last) { lg(G, 'Last day: a chip could never be drawn, so Haggler\'s Hour is skipped.'); break; } for (const p of P) {
      const ch = []; const n = Math.min(4, p.bag.length); for (let i = 0; i < n; i++) ch.push(p.bag.pop()); p.hold = ch;
      ev(G, { t: 'peek', seat: p.seat, chips: ch.map(c => ({ i: c.i, c: c.c, v: c.v })) });
      if (upgrades(G, p.hold, true).length) ask(G, p, 'haggle'); else { give(G, p, 'G1', true); lg(G, nm(G, p) + ' cannot swap anything and takes a Mossback 1.'); p.hold.forEach(c => bagInsert(p, c)); p.hold = []; }
    } break;
    default: break;
  }
}
// upgrade options for a list of chips: [{idx, from, to}] next higher number of the same colour that exists in the supply
function upgrades(G, chips, onlyColoured) {
  const out = [];
  chips.forEach((c, idx) => {
    if (c.c === 'O' || c.c === 'P' || c.c === 'K') return; if (onlyColoured && c.c === 'W') return;
    const vals = D.COLORS[c.c].vals, nx = vals[vals.indexOf(c.v) + 1]; if (!nx) return;
    if (G.supply[c.c + nx] > 0) out.push({ idx, from: ck(c), to: c.c + nx });
  });
  return out;
}
function drop(G, p, n, why) { p.droplet = Math.min(LASTC, p.droplet + n); ev(G, { t: 'gain', seat: p.seat, k: 'drop', n }); lg(G, nm(G, p) + ' moves the droplet ' + n + ' space' + (n > 1 ? 's' : '') + ' (' + (why || '') + ').'); }
function addVp(G, p, n, why) { if (!n) return; p.vp += n; ev(G, { t: 'gain', seat: p.seat, k: 'vp', n }); lg(G, nm(G, p) + ' scores ' + n + ' point' + (n > 1 ? 's' : '') + (why ? ' (' + why + ')' : '') + '.'); }
function addRuby(G, p, n, why) { if (!n) return; p.rubies += n; ev(G, { t: 'gain', seat: p.seat, k: 'ruby', n }); lg(G, nm(G, p) + ' takes ' + n + ' ' + (n > 1 ? 'rubies' : 'ruby') + (why ? ' (' + why + ')' : '') + '.'); }
function rollDie(G, p, why) {
  const times = G.fcard === 'twice' ? 2 : 1;
  for (let k = 0; k < times; k++) {
    const f = D.DIE[rnd(G, 6)]; ev(G, { t: 'die', seat: p.seat, face: f }); use(G, 'die_' + f); if (p.res) (p.res.die = p.res.die || []).push(f);
    lg(G, nm(G, p) + ' rolls the bonus die: ' + D.DIE_TEXT[f] + '.');
    if (f === 'vp1') addVp(G, p, 1, 'bonus die'); else if (f === 'vp2') addVp(G, p, 2, 'bonus die'); else if (f === 'ruby') addRuby(G, p, 1, 'bonus die'); else if (f === 'drop') drop(G, p, 1, 'die'); else if (f === 'orange') give(G, p, 'O1', G.phase === 'prep', 'bonus die');
  }
}

// ---------- placing chips ----------
function moveOf(G, p, chip) {
  const eff = effOf(G, chip.c), f = p.f;
  let base = chip.v;
  if (chip.c === 'W' && chip.v === 1 && G.sets.R === 4 && count(p.pot, 'R') > 0) base = 2;
  let mv = base; if (f.dbl) { mv *= 2; }
  if (chip.c === 'O' && G.fcard === 'marrowfair') mv += 1;
  if (chip.c === 'R') {
    if (eff === 'r1') { const o = count(p.pot, 'O'); mv += o >= 3 ? 2 : o >= 1 ? 1 : 0; }
    if (eff === 'r3') { const l = p.pot[p.pot.length - 1]; if (l && l.c === 'W') mv += l.v; }
  }
  if (chip.c === 'Y' && eff === 'y4') { const n = count(p.pot, 'Y') + 1; if (n <= 3) mv += n; }
  return mv;
}
// place `chip` (already out of the bag) and run its immediate power. Sets p.q for powers that need a decision, enters the post stage on a pop.
function placeChip(G, p, chip, how) {
  const f = p.f, eff = effOf(G, chip.c), prev = p.pot[p.pot.length - 1] || null, covered = f.safe > 0;
  if (chip.c === 'R' && eff === 'r2') { p.side.push(chip); f.canFlask = false; f.frOpen = false; ev(G, { t: 'side', seat: p.seat, chip: { i: chip.i, c: chip.c, v: chip.v } }); use(G, 'side'); return; }
  if (f.safe > 0) f.safe--;
  const mv = moveOf(G, p, chip); f.dbl = false;
  chip.pos = Math.min(LASTC, lastPos(p) + mv); p.pot.push(chip);
  ev(G, { t: 'place', seat: p.seat, chip: { i: chip.i, c: chip.c, v: chip.v }, pos: chip.pos, mv, how: how || 'draw', ruby: !!D.RUBY[chip.pos] });
  use(G, 'place_' + ck(chip));
  f.canFlask = false; f.frOpen = false;
  if (chip.c === 'W') {
    f.whites++; f.canFlask = true;
    if (G.fcard === 'froth' && !f.frUsed && f.whites === 1) f.frOpen = true;
    if (whiteSum(p) > limitOf(G, p)) { explode(G, p, covered); return; }
  }
  if (chip.c === 'O') return;
  if (eff === 'y2') f.dbl = true;
  else if (eff === 'y1') { if (prev && prev.c === 'W') ask(G, p, 'y1', { idx: p.pot.length - 2 }); }
  else if (eff === 'b1') { const n = Math.min(chip.v, p.bag.length); if (n > 0) { p.hold = []; for (let i = 0; i < n; i++) p.hold.push(p.bag.pop()); ev(G, { t: 'peek', seat: p.seat, chips: p.hold.map(c => ({ i: c.i, c: c.c, v: c.v })) }); ask(G, p, 'crow'); } }
  else if (eff === 'b2') f.safe = Math.max(f.safe, chip.v);
  else if (eff === 'b3') { if (D.RUBY[chip.pos]) addRuby(G, p, 1, 'Ruby catcher'); }
  else if (eff === 'b4') { if (D.RUBY[chip.pos]) addVp(G, p, chip.v, 'Ruby hoard'); }
}
function explode(G, p, covered) {
  p.boom = true; p.prot = !!covered; use(G, 'explode'); if (covered) use(G, 'explodeSafe');
  ev(G, { t: 'boom', seat: p.seat, prot: !!covered });
  lg(G, nm(G, p) + '\'s cauldron explodes!' + (covered ? ' (Safe harbour: still scores and shops.)' : ''));
  p.q = null; enterPost(G, p);
}
function enterPost(G, p) {
  if (p.st === 'post' || p.st === 'done') return;
  p.st = 'post'; p.postq = [];
  if (G.fcard === 'doover' && !p.f.doUsed && p.pot.length === 5 && !p.boom) p.postq.push({ h: 'restart' });   // an exploding 5th chip ends the day: no do-over
  if (G.fcard === 'peek' && !p.boom) p.postq.push({ h: 'peek' });
  for (const c of p.side) p.postq.push({ h: 'side', d: { id: c.i } });
  ev(G, { t: 'stop', seat: p.seat, boom: p.boom });
  nextPost(G, p);
}
function nextPost(G, p) {
  while (!p.q) {
    const n = p.postq.shift();
    if (!n) { p.st = 'done'; p.res = p.res || null; ev(G, { t: 'done', seat: p.seat }); return; }
    if (n.h === 'peek') {
      const k = Math.min(5, p.bag.length); if (!k) continue;
      p.hold = []; for (let i = 0; i < k; i++) p.hold.push(p.bag.pop()); ev(G, { t: 'peek', seat: p.seat, chips: p.hold.map(c => ({ i: c.i, c: c.c, v: c.v })) });
    }
    ask(G, p, n.h, n.d);
  }
}
// bag empty = forced stop
function settle(G, p) {
  if (p.st === 'draw' && !p.q && !p.boom && p.bag.length === 0 && p.pot.length > 0) { lg(G, nm(G, p) + '\'s bag is empty.'); enterPost(G, p); }
  else if (p.st === 'post' && !p.q) nextPost(G, p);
}
function returnHold(G, p) { for (const c of p.hold) bagInsert(p, c); p.hold = []; }
function restart(G, p) {
  for (const c of p.pot) bagInsert(p, c); p.pot = []; p.f.doUsed = true; p.f.dbl = false; p.f.safe = 0; p.f.canFlask = false; p.f.frOpen = false; p.f.whites = 0;
  p.boom = false; p.prot = false; p.st = 'draw'; p.postq = []; p.q = null;
  ev(G, { t: 'restart', seat: p.seat }); lg(G, nm(G, p) + ' tips every chip back and starts the day again.'); use(G, 'doover');
}

// ---------- moves ----------
const L = (o, label) => { o.label = label; return o; };
function buyList(G, p, coins) {
  const items = [];
  for (const c of D.SHOP_COLORS) {
    if (!bookOut(G, c)) continue;
    for (const v of D.COLORS[c].vals) { const key = c + v; if (c === 'O' && v !== 1) continue; if (G.supply[key] > 0) { const pr = price(G, c, v); if (pr <= coins) items.push({ key, c, price: pr }); } }
  }
  return items;
}
function buyOptions(G, p, coins) {
  const it = buyList(G, p, coins), out = [[]];
  for (const a of it) out.push([a.key]);
  for (let i = 0; i < it.length; i++) for (let j = i + 1; j < it.length; j++) if (it[i].c !== it[j].c && it[i].price + it[j].price <= coins) out.push([it[i].key, it[j].key]);
  return out;
}
function moves(G, seat) {
  if (!G || !Number.isInteger(seat) || seat < 0 || seat >= G.np || G.phase === 'over') return [];
  const p = G.players[seat], out = [];
  if (G.phase === 'brew' && p.st === 'draw' && !p.q) {
    if (p.lock) return out;           // day 9: already committed, waiting for the others (Stir!)
    const f = p.f;
    if (p.bag.length > 0) out.push(L({ t: 'draw' }, 'Draw a chip'));
    if (p.pot.length > 0) out.push(L({ t: 'stop' }, 'Stop here'));
    if (p.flask && f.canFlask && !p.boom && p.pot.length && p.pot[p.pot.length - 1].c === 'W') out.push(L({ t: 'flask' }, 'Flask: put the last white chip back'));
    if (f.frOpen && !p.boom) out.push(L({ t: 'froth' }, 'Put the first white chip back (free)'));
    if (G.fcard === 'doover' && !f.doUsed && p.pot.length === 5) out.push(L({ t: 'restart', yes: true }, 'Do-over: tip everything back'));
    if (p.pot.length === 0 && p.rat > p.droplet) for (let n = 0; n < p.rat - p.droplet; n++) out.push(L({ t: 'ratset', n }, 'Rat stone: use only ' + n + ' of its ' + (p.rat - p.droplet) + ' space' + (p.rat - p.droplet > 1 ? 's' : '')));
    return out;
  }
  if (!p.q) {
    if (G.phase === 'eval' && G.ev && G.ev.step === 'shop' && G.shopSeat === seat) return out;
    return out;
  }
  const q = p.q, d = q.d;
  switch (q.h) {
    case 'pick': {
      out.push(L({ t: 'pick', o: 'K1' }, 'Take a Cinder Moth')); for (const k of chipsOfValue(G, 2)) out.push(L({ t: 'pick', o: k }, 'Take a ' + nameOf(k))); out.push(L({ t: 'pick', o: 'rubies' }, 'Take 3 rubies')); break;
    }
    case 'swap': out.push(L({ t: 'swap', o: '' }, 'Keep my ruby')); for (const c of oneChips(G)) if (G.supply[c + 1] > 0) out.push(L({ t: 'swap', o: c + 1 }, 'Trade a ruby for a ' + nameOf(c + 1))); break;
    case 'clear': out.push(L({ t: 'clear', o: 'vp' }, 'Score 4 points')); if (p.bag.some(c => c.c === 'W' && c.v === 1)) out.push(L({ t: 'clear', o: 'white' }, 'Remove a white 1 from my bag')); break;
    case 'bribe': for (let n = 0; n <= d.max; n++) out.push(L({ t: 'bribe', n }, n ? 'Move the rat stone back ' + n + ' for ' + n + ' ' + (n > 1 ? 'rubies' : 'ruby') : 'Keep the rat stone')); break;
    case 'bounty': for (const k of chipsOfValue(G, 4)) out.push(L({ t: 'bounty', o: k }, 'Take a ' + nameOf(k))); if (bountyVp(G, p) > 0) out.push(L({ t: 'bounty', o: 'vp' }, 'Score ' + bountyVp(G, p) + ' point' + (bountyVp(G, p) === 1 ? '' : 's') + ' for the rat tails')); break;
    case 'fork': out.push(L({ t: 'fork', o: 'drop' }, 'Droplet 2 spaces')); if (bookOut(G, 'P') && G.supply.P1 > 0) out.push(L({ t: 'fork', o: 'P1' }, 'Take a Dusk Sigh')); break;
    case 'haggle': out.push(L({ t: 'haggle', idx: -1 }, 'Keep all as they are')); for (const u of upgrades(G, p.hold, true)) out.push(L({ t: 'haggle', idx: u.idx }, 'Swap the ' + nameOf(u.from) + ' for a ' + nameOf(u.to))); break;
    case 'crow': out.push(L({ t: 'crow', idx: -1 }, 'Place none, put them all back')); p.hold.forEach((c, i) => out.push(L({ t: 'crow', idx: i }, 'Place the ' + nameOf(ck(c))))); break;
    case 'y1': out.push(L({ t: 'y1', yes: true }, 'Put the white chip back in the bag'), L({ t: 'y1', yes: false }, 'Leave it')); break;
    case 'restart': out.push(L({ t: 'restart', yes: true }, 'Tip everything back and start again'), L({ t: 'restart', yes: false }, 'Keep my pot')); break;
    case 'peek': out.push(L({ t: 'peek', idx: -1 }, 'Place none, put them all back')); p.hold.forEach((c, i) => out.push(L({ t: 'peek', idx: i }, 'Place the ' + nameOf(ck(c))))); break;
    case 'side': {
      const c = p.side.find(x => x.i === d.id); if (!c) break;
      out.push(L({ t: 'side', o: 'place' }, 'Add the ' + nameOf(ck(c)) + ' after my last chip'), L({ t: 'side', o: 'keep' }, 'Keep it beside the pot'), L({ t: 'side', o: 'bag' }, 'Put it back in the bag')); break;
    }
    case 'gift': for (const k of chipsOfValue(G, 2)) out.push(L({ t: 'gift', o: k }, 'Take a ' + nameOf(k))); break;
    case 'g2': for (const k of d.opts) out.push(L({ t: 'g2', o: k }, 'Take a ' + nameOf(k))); out.push(L({ t: 'g2', o: '' }, 'Take nothing')); break;
    case 'g4': for (let n = 0; n <= d.max; n++) out.push(L({ t: 'g4', n }, n ? 'Pay ' + n + ' ' + (n > 1 ? 'rubies' : 'ruby') + ': start ' + n + ' space' + (n > 1 ? 's' : '') + ' further on each day' : 'Pay nothing')); break;
    case 'p1': for (let k = d.n; k >= 1; k--) out.push(L({ t: 'p1', k }, k === 1 ? 'Gentle sigh, lowest: 1 point' : k === 2 ? 'Gentle sigh, middle: 1 point and a ruby' : 'Gentle sigh, best: 2 points and a droplet step')); break;
    case 'g3': out.push(L({ t: 'g3', yes: true }, 'Slide the last chip ' + d.s + ' space' + (d.s > 1 ? 's' : '')), L({ t: 'g3', yes: false }, 'Stay (keep the ruby on this space)')); break;
    case 'p2': for (const s of d.sets) out.push(L({ t: 'p2', set: s }, s.length ? 'Trade ' + s.map(k => k + ' purple').join(' + ') : 'Keep my purples')); break;
    case 'p4': out.push(L({ t: 'p4', from: '', to: '' }, 'No upgrade')); for (const u of d.opts) out.push(L({ t: 'p4', from: u.from, to: u.to }, 'Swap a ' + nameOf(u.from) + ' for a ' + nameOf(u.to))); break;
    case 'de': out.push(L({ t: 'de', o: 'vp' }, 'Take ' + d.vp + ' victory point' + (d.vp === 1 ? '' : 's')), L({ t: 'de', o: 'buy' }, 'Go shopping with ' + d.coins + ' coins')); break;
    case 'shop': for (const o of buyOptions(G, p, d.coins)) out.push(L({ t: 'buy', items: o }, o.length ? 'Buy ' + o.map(nameOf).join(' + ') : 'Buy nothing')); break;
    case 'ruby': { const r = p.rubies, mx = Math.floor(r / D.rubySpend); for (let n = 0; n <= mx; n++) { out.push(L({ t: 'ruby', drop: n, flask: false }, n ? 'Spend ' + n * 2 + ' rubies: start ' + n + ' space' + (n > 1 ? 's' : '') + ' further on each day' : 'Keep my rubies')); if (!p.flask && n < mx) out.push(L({ t: 'ruby', drop: n, flask: true }, 'Spend ' + (n + 1) * 2 + ' rubies: refill the flask' + (n ? ' and start ' + n + ' further on' : ''))); } break; }
    default: break;
  }
  return out;
}
function bountyVp(G, p) { return p.ratTails || 0; }

// ---------- apply ----------
function apply(G, seat, mv) {
  if (!G || G.phase === 'over') return { ok: false, error: 'the game is over' };
  if (!Number.isInteger(seat) || seat < 0 || seat >= G.np) return { ok: false, error: 'bad seat' };
  if (!mv || typeof mv !== 'object' || typeof mv.t !== 'string') return { ok: false, error: 'bad move' };
  const p = G.players[seat];
  // the last day: every cauldron secretly commits to "draw" or "stop", then all are revealed together ("Stir!")
  if (G.round === lastOf(G) && G.phase === 'brew' && p.st === 'draw' && !p.q && (mv.t === 'draw' || mv.t === 'stop')) {
    if (p.lock) return { ok: false, error: 'you have already chosen; wait for the others' };
    if (!moves(G, seat).some(x => x.t === mv.t)) return { ok: false, error: mv.t === 'stop' ? 'draw at least one chip first' : 'the bag is empty' };
    p.lock = true; p.h9 = mv.t; p.ver++; ev(G, { t: 'lock', seat }); lg(G, nm(G, p) + ' has decided.');
    stir(G); adv(G); return { ok: true };
  }
  if (p.lock && G.phase === 'brew') return { ok: false, error: 'you have already chosen; wait for the others' };
  const err = H(G, p, mv);
  if (err) return { ok: false, error: err };
  p.ver++;
  settle(G, p);
  stir(G);
  adv(G);
  return { ok: true };
}
// day 9: when every cauldron that can still draw has committed, reveal all choices at once, starting with the start player
function stir(G) {
  if (G.round !== lastOf(G) || G.phase !== 'brew') return;
  const P = G.players, ready = P.filter(p => p.lock);
  if (!ready.length) return;
  if (P.some(p => p.st === 'draw' && !p.lock && (p.q || moves(G, p.seat).some(x => x.t === 'draw' || x.t === 'stop')))) return;
  lg(G, 'Stir! Everybody shows their choice.'); ev(G, { t: 'stir' }); use(G, 'stir');
  for (let i = 0; i < G.np; i++) {
    const p = P[(G.start + i) % G.np]; if (!p.lock) continue;
    const t = p.h9; p.lock = false; p.h9 = null;
    if (p.st !== 'draw' || p.q) continue;
    const err = H(G, p, { t }); if (!err) settle(G, p);
  }
}
// returns an error string, or null when the move was legal and has been performed
function H(G, p, m) {
  const t = m.t;
  if (G.phase === 'brew' && p.st === 'draw' && !p.q) {
    const f = p.f;
    if (t === 'draw') {
      if (!p.bag.length) return 'the bag is empty';
      if (f.frOpen) { f.frOpen = false; f.frUsed = true; }
      const chip = p.bag.pop(); f.canFlask = false; use(G, 'draw');
      ev(G, { t: 'draw', seat: p.seat, chip: { i: chip.i, c: chip.c, v: chip.v } });
      lg(G, nm(G, p) + ' draws a ' + nameOf(ck(chip)) + '.');
      placeChip(G, p, chip, 'draw'); return null;
    }
    if (t === 'stop') { if (!p.pot.length) return 'draw at least one chip first'; if (f.frOpen) { f.frOpen = false; f.frUsed = true; } lg(G, nm(G, p) + ' stops.'); enterPost(G, p); return null; }
    if (t === 'flask') {
      const l = p.pot[p.pot.length - 1];
      if (!p.flask || !f.canFlask || p.boom || !l || l.c !== 'W') return 'the flask cannot be used now';
      p.pot.pop(); bagInsert(p, l); p.flask = false; f.canFlask = false; f.frOpen = false; use(G, 'flask');
      ev(G, { t: 'flask', seat: p.seat, chip: { i: l.i, c: l.c, v: l.v } }); lg(G, nm(G, p) + ' uses the flask: the white ' + l.v + ' goes back into the bag.'); return null;
    }
    if (t === 'froth') {
      const l = p.pot[p.pot.length - 1];
      if (!f.frOpen || p.boom || !l || l.c !== 'W') return 'Frothing Pot cannot be used now';
      p.pot.pop(); bagInsert(p, l); f.frOpen = false; f.frUsed = true; f.canFlask = false; use(G, 'froth');
      ev(G, { t: 'flask', seat: p.seat, chip: { i: l.i, c: l.c, v: l.v }, free: true }); lg(G, nm(G, p) + ' puts the first white chip back for free.'); return null;
    }
    if (t === 'restart') { if (m.yes !== true || G.fcard !== 'doover' || f.doUsed || p.pot.length !== 5) return 'no do-over now'; restart(G, p); return null; }
    if (t === 'ratset') {
      const steps = p.rat - p.droplet;
      if (p.pot.length || !Number.isInteger(m.n) || m.n < 0 || m.n >= steps) return 'bad rat move';
      p.rat = m.n === 0 ? 0 : p.droplet + m.n; ev(G, { t: 'rat', seat: p.seat, tails: p.ratTails, pos: p.rat }); return null;
    }
    return 'not a legal move now';
  }
  if (!p.q) return 'nothing to decide';
  const q = p.q, d = q.d, ph = G.phase;
  if (t !== q.h && !(t === 'buy' && q.h === 'shop')) return 'the game is asking something else';
  switch (q.h) {
    case 'pick': {
      const o = m.o;
      if (o === 'rubies') addRuby(G, p, 3, 'Pedlar\'s Pick');
      else if (o === 'K1') { if (!give(G, p, 'K1', true, 'Pedlar\'s Pick')) return 'no Cinder Moth left'; }
      else if (typeof o === 'string' && chipsOfValue(G, 2).indexOf(o) >= 0) give(G, p, o, true, 'Pedlar\'s Pick');
      else return 'bad choice';
      p.q = null; break;
    }
    case 'swap': {
      if (m.o === '') { p.q = null; break; }
      if (oneChips(G).map(c => c + 1).indexOf(m.o) < 0 || G.supply[m.o] < 1 || p.rubies < 1) return 'bad choice';
      p.rubies--; give(G, p, m.o, true); lg(G, nm(G, p) + ' trades a ruby for a ' + nameOf(m.o) + '.'); p.q = null; break;
    }
    case 'clear': {
      if (m.o === 'vp') addVp(G, p, 4, 'Clear the Pods');
      else if (m.o === 'white') { const i = p.bag.findIndex(c => c.c === 'W' && c.v === 1); if (i < 0) return 'no white 1 in the bag'; putBack(G, p.bag.splice(i, 1)[0]); lg(G, nm(G, p) + ' removes a white 1 from the bag.'); }
      else return 'bad choice';
      p.q = null; if (G.phase === 'prep' && !G.players.some(x => x.q && x.q.h === 'clear')) setRats(G); break;
    }
    case 'bribe': {
      if (!Number.isInteger(m.n) || m.n < 0 || m.n > d.max) return 'bad number';
      if (m.n) { p.rat = Math.max(p.droplet, p.rat - m.n); if (p.rat <= p.droplet) p.rat = 0; addRuby(G, p, m.n, 'Rat Bribe'); ev(G, { t: 'rat', seat: p.seat, tails: p.ratTails, pos: p.rat }); }
      p.q = null; break;
    }
    case 'bounty': {
      if (m.o === 'vp') { if (bountyVp(G, p) <= 0) return 'bad choice'; addVp(G, p, bountyVp(G, p), 'Rat Bounty'); }
      else if (typeof m.o === 'string' && chipsOfValue(G, 4).indexOf(m.o) >= 0) give(G, p, m.o, true, 'Rat Bounty');
      else return 'bad choice';
      p.q = null; break;
    }
    case 'fork': {
      if (m.o === 'drop') drop(G, p, 2, 'Fork in the Road');
      else if (m.o === 'P1' && bookOut(G, 'P') && G.supply.P1 > 0) give(G, p, 'P1', true, 'Fork in the Road');
      else return 'bad choice';
      p.q = null; break;
    }
    case 'haggle': {
      if (!Number.isInteger(m.idx) || m.idx < -1 || m.idx >= p.hold.length) return 'bad index';
      if (m.idx >= 0) { const u = upgrades(G, p.hold, true).find(x => x.idx === m.idx); if (!u) return 'cannot upgrade that'; const old = p.hold[m.idx]; putBack(G, old); p.hold[m.idx] = take(G, u.to); lg(G, nm(G, p) + ' swaps a ' + nameOf(u.from) + ' for a ' + nameOf(u.to) + '.'); ev(G, { t: 'gainChip', seat: p.seat, chip: { i: p.hold[m.idx].i, c: p.hold[m.idx].c, v: p.hold[m.idx].v } }); }
      returnHold(G, p); p.q = null; break;
    }
    case 'crow': case 'peek': {
      if (!Number.isInteger(m.idx) || m.idx < -1 || m.idx >= p.hold.length) return 'bad index';
      let chip = null; if (m.idx >= 0) chip = p.hold.splice(m.idx, 1)[0];
      returnHold(G, p); p.q = null;
      if (chip) { ev(G, { t: 'draw', seat: p.seat, chip: { i: chip.i, c: chip.c, v: chip.v }, how: q.h }); lg(G, nm(G, p) + ' places the ' + nameOf(ck(chip)) + '.'); placeChip(G, p, chip, q.h); }
      break;
    }
    case 'y1': {
      if (m.yes === true) { const w = p.pot[d.idx]; if (!w || w.c !== 'W') return 'no white chip there'; p.pot.splice(d.idx, 1); bagInsert(p, w); ev(G, { t: 'flask', seat: p.seat, chip: { i: w.i, c: w.c, v: w.v }, free: true }); lg(G, nm(G, p) + ' puts the white chip back (Kind cut).'); use(G, 'y1'); }
      else if (m.yes !== false) return 'bad choice';
      p.q = null; break;
    }
    case 'restart': { if (m.yes === true) restart(G, p); else if (m.yes === false) p.q = null; else return 'bad choice'; break; }
    case 'side': {
      const i = p.side.findIndex(c => c.i === d.id); if (i < 0) return 'no such chip';
      if (m.o === 'place') { const c = p.side.splice(i, 1)[0]; p.q = null; ev(G, { t: 'draw', seat: p.seat, chip: { i: c.i, c: c.c, v: c.v }, how: 'side' }); lg(G, nm(G, p) + ' adds the ' + nameOf(ck(c)) + ' after the last chip.'); placeChipPost(G, p, c); }
      else if (m.o === 'bag') { const c = p.side.splice(i, 1)[0]; bagInsert(p, c); p.q = null; }
      else if (m.o === 'keep') p.q = null; else return 'bad choice';
      break;
    }
    case 'gift': { if (chipsOfValue(G, 2).indexOf(m.o) < 0) return 'bad choice'; give(G, p, m.o, false); lg(G, nm(G, p) + ' takes a ' + nameOf(m.o) + ' from the spilled brew.'); p.q = null; break; }
    case 'g2': {
      if (m.o === '') { p.q = null; break; }
      if (d.opts.indexOf(m.o) < 0 || G.supply[m.o] < 1) return 'bad choice';
      give(G, p, m.o, false, 'Mossback gift'); p.q = null; break;
    }
    case 'g4': {
      if (!Number.isInteger(m.n) || m.n < 0 || m.n > d.max) return 'bad number';
      if (m.n) { p.rubies -= m.n; drop(G, p, m.n, 'Drip moss'); } p.q = null; break;
    }
    case 'p1': { if (!Number.isInteger(m.k) || m.k < 1 || m.k > d.n) return 'bad choice'; p1reward(G, p, m.k); p.q = null; break; }
    case 'g3': { if (m.yes === true) slideLast(G, p, d.s); else if (m.yes !== false) return 'bad choice'; p.q = null; break; }
    case 'p2': {
      const s = m.set; if (!Array.isArray(s)) return 'bad set';
      const ok = d.sets.some(x => JSON.stringify(x) === JSON.stringify(s)); if (!ok) return 'bad set';
      let n = s.reduce((x, y) => x + y, 0);
      for (const k of s) p2reward(G, p, k);
      for (let i = p.pot.length - 1; i >= 0 && n > 0; i--) if (p.pot[i].c === 'P') { putBack(G, p.pot.splice(i, 1)[0]); n--; }     // the handed-in purple chips are discarded (the scoring space is already fixed)
      if (s.length) lg(G, nm(G, p) + ' hands in ' + s.reduce((x, y) => x + y, 0) + ' purple chip' + (s.reduce((x, y) => x + y, 0) > 1 ? 's' : '') + '.');
      p.q = null; break;
    }
    case 'p4': {
      if (m.from === '' && m.to === '') { p.q = null; break; }
      const u = d.opts.find(x => x.from === m.from && x.to === m.to); if (!u) return 'bad upgrade';
      const i = p.pot.findIndex(c => ck(c) === u.from); if (i < 0 || G.supply[u.to] < 1) return 'cannot upgrade';
      const old = p.pot.splice(i, 1)[0]; putBack(G, old); const nc = take(G, u.to); p.newChips.push(nc); ev(G, { t: 'gainChip', seat: p.seat, chip: { i: nc.i, c: nc.c, v: nc.v } });
      lg(G, nm(G, p) + ' swaps a ' + nameOf(u.from) + ' for a ' + nameOf(u.to) + '.'); p.q = null; break;
    }
    case 'de': {
      if (m.o !== 'vp' && m.o !== 'buy') return 'bad choice'; p.res.mode = m.o; p.q = null; use(G, 'de_' + m.o); break;
    }
    case 'shop': {
      const items = m.items; if (!Array.isArray(items) || items.length > 2) return 'bad purchase';
      const cs = items.map(k => typeof k === 'string' ? k[0] : '?'); if (new Set(cs).size !== cs.length) return 'two different colours only';
      let cost = 0; const seen = new Set();
      for (const k of items) {
        if (typeof k !== 'string' || !/^[A-Z][1-4]$/.test(k) || seen.has(k)) return 'bad item'; seen.add(k);
        const c = k[0], v = +k[1]; if (D.SHOP_COLORS.indexOf(c) < 0 || D.COLORS[c].vals.indexOf(v) < 0 || (c === 'O' && v !== 1)) return 'not in the shop';
        if (!bookOut(G, c)) return 'that book is not out yet'; if (!(G.supply[k] > 0)) return 'sold out'; cost += price(G, c, v);
      }
      if (cost > d.coins) return 'not enough coins';
      for (const k of items) { const c = take(G, k); p.newChips.push(c); p.res.bought.push(k); use(G, 'buy_' + k); ev(G, { t: 'buy', seat: p.seat, chip: { i: c.i, c: c.c, v: c.v }, price: price(G, k[0], +k[1]) }); }
      if (items.length) lg(G, nm(G, p) + ' buys ' + items.map(nameOf).join(' and ') + ' for ' + cost + ' coins.'); else lg(G, nm(G, p) + ' buys nothing.');
      p.q = null; break;
    }
    case 'ruby': {
      const dn = m.drop, fl = m.flask === true;
      if (!Number.isInteger(dn) || dn < 0) return 'bad number';
      const cost = (dn + (fl ? 1 : 0)) * D.rubySpend; if (cost > p.rubies) return 'not enough rubies'; if (fl && p.flask) return 'the flask is already full';
      p.rubies -= cost; if (dn) drop(G, p, dn, 'rubies'); if (fl) { p.flask = true; lg(G, nm(G, p) + ' refills the flask.'); ev(G, { t: 'refill', seat: p.seat }); }
      p.q = null; break;
    }
    default: return 'unknown question';
  }
  return null;
}
// a side chip added after the stop: place after the last chip (no draw), run its power; whites cannot be here
function placeChipPost(G, p, chip) {
  const prev = p.pot[p.pot.length - 1];
  chip.pos = Math.min(LASTC, lastPos(p) + chip.v); p.pot.push(chip);
  ev(G, { t: 'place', seat: p.seat, chip: { i: chip.i, c: chip.c, v: chip.v }, pos: chip.pos, mv: chip.v, how: 'side', ruby: !!D.RUBY[chip.pos] });
}
function p1reward(G, p, k) { if (k === 1) addVp(G, p, 1, 'Gentle sigh'); else if (k === 2) { addVp(G, p, 1, 'Gentle sigh'); addRuby(G, p, 1, 'Gentle sigh'); } else if (k === 3) { addVp(G, p, 2, 'Gentle sigh'); drop(G, p, 1, 'Gentle sigh'); } }
function p2reward(G, p, k) {
  if (k === 1) { give(G, p, 'K1', false, 'Trade wind'); addVp(G, p, 1, 'Trade wind'); addRuby(G, p, 1, 'Trade wind'); }
  else if (k === 2) { give(G, p, 'G1', false, 'Trade wind'); give(G, p, 'B2', false, 'Trade wind'); addVp(G, p, 3, 'Trade wind'); drop(G, p, 1, 'Trade wind'); }
  else if (k === 3) { give(G, p, 'Y4', false, 'Trade wind'); addVp(G, p, 6, 'Trade wind'); addRuby(G, p, 1, 'Trade wind'); drop(G, p, 2, 'Trade wind'); }
}

// ---------- the state machine ----------
const hasQ = G => G.players.some(p => p.q);
function adv(G) {
  for (let guard = 0; guard < 200; guard++) {
    if (G.phase === 'over') return;
    if (G.phase === 'prep') { for (const p of G.players) if (!p.q) { /* nothing */ } if (hasQ(G)) return; G.phase = 'brew'; ev(G, { t: 'brew' }); lg(G, 'Everyone brews at once: draw, or stop.'); continue; }
    if (G.phase === 'brew') {
      for (const p of G.players) settle(G, p);
      if (!G.players.every(p => p.st === 'done')) return;
      G.phase = 'eval'; G.ev = { step: 'start' }; G.rep = { round: G.round, logFrom: G.logN, logTo: 0 }; ev(G, { t: 'eval' }); continue;
    }
    if (G.phase === 'eval') { if (evalStep(G) === 'wait') return; continue; }
  }
  throw new Error('adv loop');
}
function bestTie(G, cand) {
  const key = p => [D.COINS[p.res.space], p.res.space];
  let best = null, w = [];
  for (const p of cand) { const k = key(p); if (!best || k[0] > best[0] || (k[0] === best[0] && k[1] > best[1])) { best = k; w = [p]; } else if (k[0] === best[0] && k[1] === best[1]) w.push(p); }
  return w;
}
function evalStep(G) {
  const E = G.ev, P = G.players, order = []; for (let i = 0; i < G.np; i++) order.push(P[(G.start + i) % G.np]);
  switch (E.step) {
    case 'start': {
      for (const p of P) {
        p.res = { vp0: p.vp, ru0: p.rubies, pos: lastPos(p), space: spaceOf(p), boom: p.boom, prot: p.prot, die: [], bought: [], mode: 'both', vp: 0, coins: 0, ruby: 0, white: whiteSum(p), chips: p.pot.length };
        ev(G, { t: 'scored', seat: p.seat, space: p.res.space, boom: p.boom });
      }
      for (const p of P) if (G.fcard === 'lucky7' && !p.boom && whiteSum(p) === 7) { drop(G, p, 1, 'Lucky Seven'); use(G, 'lucky7hit'); }
      if (G.fcard === 'spilled' && G.round < lastOf(G)) for (const p of P) if (p.boom) { const l = P[left(G, p.seat)]; if (chipsOfValue(G, 2).length) { ask(G, l, 'gift'); lg(G, pn(G, l.seat) + ' may take a 2-chip from ' + nm(G, p) + '\'s spilled brew.'); } }
      E.step = 'gifts'; return 'go';
    }
    case 'gifts': { if (hasQ(G)) return 'wait'; E.step = 'die'; return 'go'; }
    case 'die': {
      const cand = P.filter(p => !p.boom);
      if (cand.length) { const w = bestTie(G, cand); for (const p of w) { p.res.rolled = true; rollDie(G, p, 'furthest'); } use(G, 'dieRound'); }
      E.step = 'acts'; E.i = 0; for (const p of P) { p.acts = buildActs(G, p); p.res.space = spaceOf(p); p.res.pos = lastPos(p); } return 'go';   // the scoring space is fixed now: only the green set 3 slide may move it
    }
    case 'acts': {
      for (; E.i < order.length; E.i++) {
        const p = order[E.i];
        if (!runActs(G, p)) return 'wait';
      }
      E.step = 'ruby'; return 'go';
    }
    case 'ruby': {
      for (const p of P) {
        if (D.RUBY[p.res.space]) { addRuby(G, p, 1, 'ruby space'); p.res.ruby++; use(G, 'rubySpace'); if (G.fcard === 'spark') { addRuby(G, p, 1, 'Red Spark'); p.res.ruby++; } }
      }
      E.step = 'de'; for (const p of P) { const s = p.res.space; p.res.coins = D.COINS[s]; p.res.vp = D.VP[s]; p.res.spoon = s === SPOON; if (s === SPOON) use(G, 'spoon'); }
      for (const p of P) {
        if (p.boom && !p.prot) {
          if (G.round === lastOf(G)) { p.res.mode = Math.floor(p.res.coins / D.endCoinsPerVp) > p.res.vp ? 'buy' : 'vp'; }
          else if (p.res.coins > 0 || p.res.vp > 0) { ask(G, p, 'de', { vp: p.res.vp, coins: p.res.coins }); }
          else p.res.mode = 'vp';
        }
      }
      return 'go';
    }
    case 'de': {
      if (hasQ(G)) return 'wait';
      for (const p of order) {
        const r = p.res;
        if (G.fcard === 'glint' && D.RUBY[r.space]) addVp(G, p, 2, 'Ruby Glint');
        if (r.mode === 'both' || r.mode === 'vp') { addVp(G, p, r.vp, 'the scoring space'); }
        if (G.round === lastOf(G) && (r.mode === 'both' || r.mode === 'buy')) { const n = Math.floor(r.coins / D.endCoinsPerVp); if (n) addVp(G, p, n, r.coins + ' coins (5 coins = 1 point)'); }
        r.gotVp = p.vp;
      }
      E.step = 'shop'; E.i = 0; return 'go';
    }
    case 'shop': {
      if (G.round === lastOf(G)) { E.step = 'ruby2'; return 'go'; }
      for (; E.i < order.length; E.i++) {
        const p = order[E.i];
        if (p.q) { G.shopSeat = p.seat; return 'wait'; }
        if (E.asked !== p.seat && (p.res.mode === 'both' || p.res.mode === 'buy') && p.res.coins > 0 && buyList(G, p, p.res.coins).length) { E.asked = p.seat; ask(G, p, 'shop', { coins: p.res.coins }); G.shopSeat = p.seat; return 'wait'; }
      }
      G.shopSeat = -1; E.step = 'ruby2'; return 'go';
    }
    case 'ruby2': {
      if (G.round === lastOf(G)) { E.step = 'clean'; return 'go'; }
      if (G.fcard === 'spring') { for (const p of P) if (!p.flask) { p.flask = true; ev(G, { t: 'refill', seat: p.seat, free: true }); } lg(G, 'Spring Water: every flask is refilled.'); }
      if (!E.rubyAsked) { E.rubyAsked = true; for (const p of P) if (p.rubies >= D.rubySpend) ask(G, p, 'ruby'); }
      if (hasQ(G)) return 'wait';
      E.step = 'clean'; return 'go';
    }
    case 'clean': { cleanup(G); return 'go'; }
  }
  return 'go';
}
// the chip powers of phase B: black, green, purple, in that order
function buildActs(G, p) {
  const a = [];
  if (p.pot.some(c => c.c === 'K')) a.push('black');
  if (p.pot.some(c => c.c === 'G')) a.push(effOf(G, 'G'));
  if (p.pot.some(c => c.c === 'P')) a.push(effOf(G, 'P'));
  return a;
}
function lastTwo(p) { return p.pot.slice(-2); }
// returns true when the seat has no more actions to do (false = waiting for an answer)
function runActs(G, p) {
  if (p.q) return false;
  while (p.acts.length) {
    const a = p.acts[0];
    if (a === 'black') { p.acts.shift(); blackAct(G, p); continue; }
    if (a === 'g1') { p.acts.shift(); const n = lastTwo(p).filter(c => c.c === 'G').length; if (n) { addRuby(G, p, n, 'Ruby moss'); p.res.ruby += n; } continue; }
    if (a === 'g2') {
      const gs = lastTwo(p).filter(c => c.c === 'G'); p.gq = p.gq || gs.map(c => c.v);
      while (p.gq.length) {
        const v = p.gq.shift(); const opts = v === 1 ? ['O1'] : v === 2 ? ['B1', 'R1'] : ['Y1', 'P1'];
        const ok = opts.filter(k => G.supply[k] > 0 && bookOut(G, k[0]));
        if (ok.length === 1) { give(G, p, ok[0], false); lg(G, nm(G, p) + ' gets a ' + nameOf(ok[0]) + ' from the Mossback.'); }
        else if (ok.length > 1) { ask(G, p, 'g2', { opts: ok }); return false; }
      }
      p.gq = null; p.acts.shift(); continue;
    }
    if (a === 'g3') {
      p.acts.shift(); if (whiteSum(p) === 7) {
        const s = p.pot.filter(c => c.c === 'G').reduce((x, c) => x + c.v, 0), l = p.pot[p.pot.length - 1], np2 = Math.min(LASTC, l.pos + s);
        if (np2 !== l.pos && D.RUBY[p.res.space] && !D.RUBY[Math.min(np2 + 1, SPOON)]) { ask(G, p, 'g3', { s, to: np2 }); return false; }   // sliding would lose the ruby on this space: may be declined
        slideLast(G, p, s);
      }
      continue;
    }
    if (a === 'g4') { p.acts.shift(); const n = lastTwo(p).filter(c => c.c === 'G').length, mx = Math.min(n, p.rubies); if (mx > 0) { ask(G, p, 'g4', { max: mx }); return false; } continue; }
    if (a === 'p1') { p.acts.shift(); const n = count(p.pot, 'P'); if (n >= 2) { ask(G, p, 'p1', { n: Math.min(3, n) }); return false; } if (n === 1) p1reward(G, p, 1); continue; }
    if (a === 'p2') {
      p.acts.shift(); const n = count(p.pot, 'P'), sets = [[]];
      const subs = [[1], [2], [3], [1, 2], [1, 3], [2, 3], [1, 2, 3]];
      for (const s of subs) if (s.reduce((x, y) => x + y, 0) <= n && s.every(k => rewardOk(G, k))) sets.push(s);
      if (sets.length > 1) { ask(G, p, 'p2', { sets }); return false; } continue;
    }
    if (a === 'p3') { p.acts.shift(); let t = 0; for (const c of p.pot) if (c.c === 'P') t += c.pos >= 30 ? 3 : c.pos >= 20 ? 2 : c.pos >= 10 ? 1 : 0; if (t) addVp(G, p, t, 'Deep sigh'); continue; }
    if (a === 'p4') {
      p.acts.shift(); const n = count(p.pot, 'P'); const opts = [];
      const levels = [];
      if (n >= 1) levels.push([1, 2]); if (n >= 2) levels.push([2, 4]); if (n >= 3) levels.push([1, 4]);
      for (const [fv, tv] of levels) for (const c of ['G', 'B', 'R', 'Y']) { if (D.COLORS[c].vals.indexOf(fv) >= 0 && p.pot.some(x => x.c === c && x.v === fv) && G.supply[c + tv] > 0 && !opts.some(o => o.from === c + fv && o.to === c + tv)) opts.push({ from: c + fv, to: c + tv }); }
      if (opts.length) { ask(G, p, 'p4', { opts }); return false; } continue;
    }
    p.acts.shift();
  }
  return true;
}
function slideLast(G, p, s) {
  const l = p.pot[p.pot.length - 1]; l.pos = Math.min(LASTC, l.pos + s); p.res.pos = l.pos; p.res.space = Math.min(l.pos + 1, SPOON);
  ev(G, { t: 'slide', seat: p.seat, chip: l.i, pos: l.pos }); lg(G, nm(G, p) + ' slides the last chip ' + s + ' space' + (s > 1 ? 's' : '') + ' (Lucky-seven moss).'); use(G, 'g3hit');
}
function rewardOk(G, k) { const need = k === 1 ? ['K1'] : k === 2 ? ['G1', 'B2'] : ['Y4']; return need.every(x => G.supply[x] > 0) || true; }
function blackAct(G, p) {
  const mine = count(p.pot, 'K'); if (!mine) return;
  let drop1 = false, ruby = false;
  if (G.np === 2) { const o = count(G.players[1 - p.seat].pot, 'K'); if (mine === o) drop1 = true; else if (mine > o) { drop1 = true; ruby = true; } }
  else { const l = count(G.players[left(G, p.seat)].pot, 'K'), r = count(G.players[right(G, p.seat)].pot, 'K'); if (mine > l || mine > r) drop1 = true; if (mine > l && mine > r) ruby = true; }
  if (drop1) { drop(G, p, 1, 'Cinder Moths'); use(G, 'black_drop'); } if (ruby) { addRuby(G, p, 1, 'Cinder Moths'); use(G, 'black_ruby'); }
}
function cleanup(G) {
  const P = G.players; if (G.rep) G.rep.logTo = G.logN;
  for (const p of P) {
    if (G.round === lastOf(G)) p.last9 = p.res.pos;
    G.hist.push({ round: G.round, seat: p.seat, gain: p.vp - p.res.vp0, rgain: p.rubies - p.res.ru0, space: p.res.space, coins: p.res.coins, vp: p.res.vp, boom: p.boom, prot: p.prot, mode: p.res.mode, bought: p.res.bought, die: p.res.die, chips: p.res.chips, white: p.res.white, after: p.vp, fortune: G.fcard });
    for (const c of p.pot) delete c.pos;
    p.bag = p.bag.concat(p.pot, p.hold, p.newChips); p.pot = []; p.hold = []; p.newChips = []; p.rat = 0; p.q = null;
  }
  if (G.round >= lastOf(G)) { finish(G); return; }
  G.round++; G.start = (G.start + 1) % G.np;
  if (G.round === D.extraWhiteRound) { for (const p of P) { const c = take(G, 'W1'); if (c) p.bag.push(c); } lg(G, 'Day 6: everyone adds a white 1 to their bag.'); ev(G, { t: 'extraWhite' }); }
  if (G.round === 2) { lg(G, 'The Sunroot stall opens (yellow chips can be bought).'); ev(G, { t: 'bookOut', c: 'Y' }); }
  if (G.round === 3) { lg(G, 'The Dusk Sigh stall opens (purple chips can be bought).'); ev(G, { t: 'bookOut', c: 'P' }); }
  startRound(G);
}
function finish(G) {
  for (const p of G.players) { const n = Math.floor(p.rubies / D.endRubiesPerVp); if (n) { addVp(G, p, n, p.rubies + ' rubies at 2 to 1'); p.rubies -= n * D.endRubiesPerVp; p.endVp = n; } }
  G.phase = 'over'; G.over = true; G.ev = null;
  const best = Math.max.apply(null, G.players.map(p => p.vp));
  let w = G.players.filter(p => p.vp === best).map(p => p.seat), tie = false;
  if (w.length > 1) { const lp = Math.max.apply(null, w.map(s => G.players[s].last9)); const w2 = w.filter(s => G.players[s].last9 === lp); if (w2.length < w.length) { w = w2; tie = true; use(G, 'tieBreak'); } }
  G.winners = w; G.winner = w.length === 1 ? w[0] : -1;
  const nms = w.map(s => pn(G, s));
  G.winText = w.length === 1 ? nms[0] + ' wins the fair with ' + best + ' points' + (tie ? ' (furthest on the last day)' : '') + '.' : nms.join(' and ') + ' share the win with ' + best + ' points.';
  if (w.length > 1) use(G, 'sharedWin');
  ev(G, { t: 'gameEnd', winners: w, totals: G.players.map(p => p.vp), text: G.winText }); lg(G, G.winText);
}

// ---------- reports ----------
function pending(G) {
  if (!G || G.phase === 'over') return [];
  if (G.phase === 'brew') return G.players.filter(p => p.st !== 'done' && !p.lock).map(p => p.seat);
  return G.players.filter(p => p.q).map(p => p.seat);
}
function sideToAct(G) { const p = pending(G); return p.length ? p[0] : -1; }
function risk(G, seat) {
  const p = G.players[seat]; const bag = p.bag.filter(c => c && c.c), n = bag.length;
  const ws = whiteSum(p), lim = limitOf(G, p);
  let boom = 0, whites = 0; const wc = {};
  for (const c of bag) if (c.c === 'W') { whites++; wc['W' + c.v] = (wc['W' + c.v] || 0) + 1; if (ws + c.v > lim) boom++; }
  return { n, whites, ws, limit: lim, room: lim - ws, boom, pBoom: n ? boom / n : 0, wc, flask: p.flask && p.f.canFlask && !p.boom };
}
function score(G) {
  return { vp: G.players.map(p => p.vp), rubies: G.players.map(p => p.rubies), rounds: G.hist.slice(), over: G.phase === 'over', winners: G.winners, winner: G.winner };
}
function checkInvariants(G) {
  const e = [], cnt = {}, ids = new Set();
  const add = (c, where) => { if (!c || !c.c) { e.push('bad chip in ' + where); return; } cnt[ck(c)] = (cnt[ck(c)] || 0) + 1; if (ids.has(c.i)) e.push('duplicate chip id ' + c.i + ' in ' + where); ids.add(c.i); };
  for (const p of G.players) {
    p.bag.forEach(c => add(c, 'bag')); p.pot.forEach(c => add(c, 'pot')); p.hold.forEach(c => add(c, 'hold')); p.side.forEach(c => add(c, 'side')); p.newChips.forEach(c => add(c, 'new'));
    if (p.vp < 0 || !Number.isInteger(p.vp)) e.push('vp ' + p.vp); if (p.rubies < 0 || !Number.isInteger(p.rubies)) e.push('rubies ' + p.rubies);
    if (p.droplet < 0 || p.droplet > LASTC) e.push('droplet ' + p.droplet);
    let prev = 0; for (const c of p.pot) { if (c.pos < 1 || c.pos > LASTC) e.push('pos ' + c.pos); if (c.pos < prev) e.push('pot not increasing'); prev = c.pos; }
    if (G.phase === 'brew' && p.st === 'draw' && whiteSum(p) > limitOf(G, p) && !p.boom) e.push('seat ' + p.seat + ' over the limit but not exploded');
    if (p.st === 'done' && p.q && G.phase === 'brew') e.push('done with a question');
  }
  for (const k of Object.keys(D.SUPPLY)) { const tot = (G.supply[k] || 0) + (cnt[k] || 0); if (tot !== D.SUPPLY[k]) e.push('chip ' + k + ': supply ' + G.supply[k] + ' + play ' + (cnt[k] || 0) + ' != ' + D.SUPPLY[k]); if (G.supply[k] < 0) e.push('negative supply ' + k); }
  if (G.fdeck.length + G.fdisc.length !== 24) e.push('fortune deck ' + (G.fdeck.length + G.fdisc.length));
  return e;
}
// hidden info removed for one seat (seat -1 = a watcher): other bags/holds, the fortune deck, seeds. Own bag keeps its contents but sorted.
function stripView(G, seat) {
  const v = clone(G); v.seed = 0; v.rng = 0; v.fdeckN = v.fdeck.length; v.fdeck = [];
  for (const p of v.players) {
    p.rng = 0; delete p.h9;
    if (p.seat === seat) { p.bag.sort((a, b) => a.c < b.c ? -1 : a.c > b.c ? 1 : a.v - b.v || a.i - b.i); }
    else { p.bagN = p.bag.length; p.bag = new Array(p.bag.length).fill(0); p.holdN = p.hold.length; p.hold = new Array(p.hold.length).fill(0); }
  }
  return v;
}
function render_game_to_text(G) {
  const o = { game: 'Cauldron Fair', phase: G.phase, round: G.round, start: G.start, fortune: G.fcard, sets: G.sets, players: G.players.map(p => ({ seat: p.seat, name: p.name, vp: p.vp, rubies: p.rubies, droplet: p.droplet, rat: p.rat, flask: p.flask, st: p.st, boom: p.boom, bag: p.bag.length, pot: p.pot.map(c => ck(c) + '@' + c.pos), side: p.side.map(ck), q: p.q ? p.q.h : null })), over: G.over, winText: G.winText };
  return JSON.stringify(o);
}

CF.lastOf = lastOf; CF.newGame = newGame; CF.moves = moves; CF.apply = apply; CF.pending = pending; CF.sideToAct = sideToAct; CF.stripView = stripView; CF.score = score;
CF.checkInvariants = checkInvariants; CF.render_game_to_text = render_game_to_text; CF.risk = risk;
CF.whiteSum = whiteSum; CF.limitOf = limitOf; CF.spaceOf = spaceOf; CF.lastPos = lastPos; CF.startPos = startPos; CF.price = price; CF.bookOut = bookOut; CF.effOf = effOf; CF.nameOf = nameOf; CF.buyOptions = buyOptions; CF.buyList = buyList; CF.upgrades = upgrades; CF.moveOf = moveOf; CF.chipsOfValue = chipsOfValue;
CF._ = { rnd, prnd, shuffleG, shuffleP, take, give, bagInsert, ev, lg, adv, startRound, placeChip, mkChip, ck, enterPost, evalStep, cleanup, rollDie, settle, putBack };
if (typeof module === 'object' && module.exports) module.exports = CF;
})(typeof globalThis !== 'undefined' ? globalThis : this);

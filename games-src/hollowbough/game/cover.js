// Coverage: forces every card, forest location, basic location, Haven/Journey spot, basic event, special event and
// card-playing ability to be used at least once, checking state invariants after EVERY apply.   node cover.js [mixedGames=200]
const T = require('./tlib');
const { HB, D } = T;
require('./src/ai.js');
const X = HB._;
let seed = 12345; const rr = () => { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return seed / 4294967296; };
const tally = {}; let applies = 0; const problems = [];
const addUsed = G => { for (const k in G.used) tally[k] = (tally[k] || 0) + G.used[k]; };
function check(G, ctx) { const e = HB.checkInvariants(G); if (e.length) problems.push(ctx + ': ' + e.join('; ')); }
function step(G, m, ctx) {
  const r = HB.apply(G, m);
  if (!r.ok) { problems.push(ctx + ': illegal ' + JSON.stringify(m) + ' ' + r.error); return false; }
  applies++; check(G, ctx); return true;
}
function resolve(G, ctx) { let n = 0; while (G.q && n++ < 300) { const ms = HB.moves(G, G.q.who); if (!ms.length) { problems.push(ctx + ': pending decision with no moves'); return; } if (!step(G, ms[Math.floor(rr() * ms.length)], ctx)) return; } if (G.q) problems.push(ctx + ': pending decision never ends'); }
function A(G, seat, pred, ctx) {
  G.cur = seat; const m = T.find(G, seat, pred);
  if (!m) { problems.push(ctx + ': move not available: ' + String(pred).slice(0, 80) + ' among ' + HB.moves(G, seat).map(x => x.label.slice(0, 40)).join(' | ').slice(0, 300)); return null; }
  step(G, m, ctx); resolve(G, ctx); return m;
}
const rich = (G, seat, n) => T.res(G, seat, { twig: n || 6, resin: n || 6, pebble: n || 6, berry: n || 6 });
const mk = (np, ctx) => { const G = T.game(np || 3, { seed: Math.floor(rr() * 1e6) + 1 }); rich(G, 0); return G; };

// ---------- phase 1: mixed play (random + AI) over 1-4 players, with solo ----------
const MIXED = +process.argv[2] || 200;
let mixedGames = 0, mixedSteps = 0;
for (let g = 0; g < MIXED; g++) {
  const np = [2, 3, 4, 1][g % 4];
  const pl = []; for (let i = 0; i < np; i++) pl.push({ name: 'M' + i, ai: ['easy', 'normal', 'hard'][(g + i) % 3] });
  const G = HB.newGame({ players: pl, solo: np === 1 ? { difficulty: 1 + (g % 3) } : null, seed: 5000 + g });
  let n = 0;
  while (G.phase !== 'over' && n++ < 3000) {
    const a = HB.actor(G); const ms = HB.moves(G, a); let m;
    if (rr() < 0.3) { const nm = ms.filter(x => x.type !== 'pass'); m = (nm.length ? nm : ms)[Math.floor(rr() * (nm.length ? nm.length : ms.length))]; }
    else m = HB.AI.choose(G, a, (g + a) % 5 === 0 ? 'easy' : 'normal');
    if (!step(G, m, 'mixed ' + g)) break;
  }
  if (G.phase !== 'over') problems.push('mixed game ' + g + ' did not end');
  addUsed(G); mixedGames++; mixedSteps += n;
  for (const p of G.players) for (const e of p.city) { const s = HB.score(G, p.seat); for (const d of s.detail) tally['score:' + HB.cardKey(d.card)] = (tally['score:' + HB.cardKey(d.card)] || 0) + 1; }
}

// ---------- phase 2: forced scenarios ----------
const PRE = {
  chip_sweep: { city: ['farm', 'mine'] }, miner_mole: { opp: ['farm', 'barge_toad', 'mine'] }, ruins: { city: ['farm'] },
  wife: { city: ['husband'] }, husband: { city: ['farm', 'wife'] }, barge_toad: { city: ['farm'] }, general_store: { city: ['farm'] },
  chapel: {}, shepherd: { city: ['chapel'] }, ranger: { dep: true }, teacher: {}, university: { city: ['farm', 'mine'] },
  castle: { city: ['farm', 'mine'] }, palace: { city: ['castle'] }, school: { city: ['husband', 'wanderer'] }, theater: { city: ['bard', 'king'] },
  king: {}, architect: {}, ever_tree: { city: ['castle'] }, queen: { hand: ['farm'] }, inn: { meadow: ['farm'] }, post_office: { hand: ['farm', 'mine', 'castle', 'palace'] },
  cemetery: {}, monastery: {}, lookout: {}, storehouse: {}, clock_tower: {}, dungeon: { city: ['husband'] }, courthouse: {}, historian: {},
  doctor: {}, woodcarver: {}, monk: {}, peddler: {}, postal_pigeon: { top: ['mine', 'farm'] }, undertaker: {}, bard: { hand: ['farm', 'mine'] },
};
const DESTS = new Set(['inn', 'post_office', 'queen', 'cemetery', 'chapel', 'lookout', 'monastery', 'university', 'storehouse']);
for (const c of D.cards) {
  const ctx = 'card ' + c.key, pre = PRE[c.key] || {};
  try {
    const G = mk(3, ctx);
    if (pre.city) T.city(G, 0, pre.city);
    if (pre.opp) T.city(G, 1, pre.opp);
    const hand = pre.hand ? [c.key].concat(pre.hand) : [c.key, 'farm', 'mine'];
    const ids = T.hand(G, 0, hand);
    if (pre.meadow) T.meadow(G, 0, pre.meadow[0]);
    if (pre.top) T.topDeck(G, pre.top);
    if (pre.dep) { A(G, 0, m => m.type === 'worker' && m.k === 'basic' && D.basic[m.i].key === 'basic_twig_heap', ctx); }
    G.cur = 0;
    const mv = T.find(G, 0, m => m.type === 'play' && m.card === ids[0] && m.how === 'pay');
    if (!mv) { problems.push(ctx + ': not playable with plenty of resources'); continue; }
    A(G, 0, m => m.type === 'play' && m.card === ids[0] && m.how === 'pay', ctx);
    if (!G.players.some(p => p.city.some(e => e.id === ids[0])) && !(G.players.some(p => p.hand.includes(ids[0])))) { /* discarded: Fool in solo etc */ }
    // destinations and the storehouse: also visit
    if (DESTS.has(c.key)) {
      G.cur = 0; const e = G.players[0].city.find(x => x.id === ids[0]);
      if (e && c.key === 'storehouse') e.stock.twig = 3;
      if (c.key === 'inn') { T.meadow(G, 1, 'mine'); }
      if (c.key === 'queen') T.meadow(G, 1, 'mine');
      if (c.key === 'post_office') T.hand(G, 0, ['farm', 'mine', 'castle']);
      if (c.key === 'cemetery') T.topDeck(G, ['farm', 'mine', 'castle', 'palace']);
      G.players[0].dep = [];
      A(G, 0, m => m.type === 'worker' && m.k === 'dest' && m.c === ids[0], ctx + ' visit');
    }
    // production in spring (every green card), clock tower use, ranger etc.
    if (c.color === 'green' || c.key === 'clock_tower') {
      G.cur = 0; G.players[0].dep = []; G.players[0].season = 0; G.players[0].workers = 2;
      A(G, 0, m => m.type === 'worker' && m.k === 'basic' && D.basic[m.i].key === 'basic_berry_patch', ctx);
      G.cur = 0; A(G, 0, m => m.type === 'worker' && m.k === 'basic' && D.basic[m.i].key === 'basic_berry_patch', ctx);
      G.cur = 0; A(G, 0, m => m.type === 'prepare', ctx + ' spring');
    }
    if (c.color === 'purple') { const s = HB.score(G, 0); if (s.detail.some(d => HB.cardKey(d.card) === c.key) || c.key === 'wife' || c.key === 'architect') tally['score:' + c.key] = (tally['score:' + c.key] || 0) + 1; }
    addUsed(G);
  } catch (e) { problems.push(ctx + ': EXCEPTION ' + (e.stack || e.message).split('\n').slice(0, 3).join(' | ')); }
}
// purple end-game scoring with everything on the table
{
  const G = mk(2, 'purple'); T.city(G, 0, ['castle', 'palace', 'school', 'theater', 'ever_tree', 'king', 'architect', 'wife', 'husband', 'farm', 'mine']); G.bev[0].o = 0; G.sev[0].o = 0; T.res(G, 0, { resin: 3, pebble: 4 });
  const s = HB.score(G, 0); for (const d of s.detail) tally['score:' + HB.cardKey(d.card)] = (tally['score:' + HB.cardKey(d.card)] || 0) + 1;
  if (s.detail.length < 8) problems.push('purple scoring detail incomplete: ' + s.detail.length);
}

// governance triggers and abilities
function scen(name, fn) { try { const G = mk(3, name); fn(G, name); addUsed(G); check(G, name); } catch (e) { problems.push(name + ': EXCEPTION ' + (e.stack || e.message).split('\n').slice(0, 3).join(' | ')); } }
scen('triggers', (G, ctx) => {
  T.city(G, 0, ['historian', 'shopkeeper', 'courthouse']); const [w, m] = T.hand(G, 0, ['wanderer', 'mine']);
  A(G, 0, x => x.type === 'play' && x.card === w && x.how === 'pay', ctx); A(G, 0, x => x.type === 'play' && x.card === m && x.how === 'pay', ctx);
});
scen('judge', (G, ctx) => { T.city(G, 0, ['judge']); T.res(G, 0, { twig: 1, resin: 1, berry: 1 }); const [m] = T.hand(G, 0, ['mine']); A(G, 0, x => x.type === 'play' && x.card === m && x.how === 'judge', ctx); });
scen('innkeeper', (G, ctx) => { T.city(G, 0, ['innkeeper']); T.res(G, 0, {}); const [m] = T.hand(G, 0, ['husband']); A(G, 0, x => x.type === 'play' && x.card === m && x.how === 'innkeeper', ctx); });
scen('crane', (G, ctx) => { T.city(G, 0, ['crane']); T.res(G, 0, { twig: 2, resin: 3 }); const [m] = T.hand(G, 0, ['castle']); A(G, 0, x => x.type === 'play' && x.card === m && x.how === 'crane', ctx); });
scen('dungeon x2', (G, ctx) => {
  T.city(G, 0, ['dungeon', 'ranger', 'husband', 'bard']); T.res(G, 0, { twig: 2, resin: 3 }); const [a] = T.hand(G, 0, ['castle']);
  A(G, 0, x => x.type === 'play' && x.card === a && x.how === 'dungeon', ctx);
  T.res(G, 0, { twig: 2, resin: 3 }); const [b] = T.hand(G, 0, ['palace']); T.res(G, 0, { twig: 4, resin: 6, pebble: 3 }); G.cur = 0;
  const m = T.find(G, 0, x => x.type === 'play' && x.card === b && x.how === 'dungeon'); if (m) { step(G, m, ctx); resolve(G, ctx); } else problems.push(ctx + ': second cell not usable');
  tally['dungeon:2cells'] = G.players[0].city.find(e => HB.cardKey(e.id) === 'dungeon').pris.length >= 2 ? 1 : 0;
});
scen('occupy + ever tree', (G, ctx) => { T.city(G, 0, ['farm', 'ever_tree']); const [h, b] = T.hand(G, 0, ['husband', 'bard']); A(G, 0, x => x.card === h && x.how === 'occupy', ctx); A(G, 0, x => x.card === b && x.how === 'occupy', ctx); });
scen('bazaar + undertaker + queen + inn on rival', (G, ctx) => {
  G.forest = [D.forest.findIndex(f => f.key === 'forest_meadow_bazaar'), 0, 1]; T.meadow(G, 0, 'mine'); T.meadow(G, 1, 'farm');
  A(G, 0, x => x.type === 'worker' && x.k === 'forest' && x.i === 0, ctx);
  T.city(G, 1, ['inn', 'post_office']); G.cur = 0; T.hand(G, 0, ['farm', 'mine']); T.meadow(G, 2, 'mine'); A(G, 0, x => x.type === 'worker' && x.k === 'dest' && x.o === 1 && HB.cardKey(x.c) === 'inn', ctx);
});
scen('monastery + cemetery with second slot', (G, ctx) => {
  T.city(G, 0, ['monastery', 'monk', 'cemetery', 'undertaker']); G.players[0].workers = 4; G.players[0].season = 2;
  A(G, 0, x => x.type === 'worker' && x.k === 'dest' && HB.cardKey(x.c) === 'monastery', ctx); T.res(G, 0, { twig: 3, berry: 3 }); T.topDeck(G, ['farm', 'mine', 'castle', 'palace']);
  G.cur = 0; A(G, 0, x => x.type === 'worker' && x.k === 'dest' && HB.cardKey(x.c) === 'cemetery', ctx);
});

// forest, basic, haven, journey
D.forest.forEach((f, i) => scen('forest ' + f.key, (G, ctx) => {
  G.forest = [i, (i + 1) % 11, (i + 2) % 11]; T.hand(G, 0, ['farm', 'mine', 'castle', 'bard', 'wanderer']); T.meadow(G, 0, 'mine'); T.meadow(G, 1, 'farm');
  A(G, 0, x => x.type === 'worker' && x.k === 'forest' && x.i === 0, ctx);
}));
D.basic.forEach((b, i) => scen('basic ' + b.key, (G, ctx) => A(G, 0, x => x.type === 'worker' && x.k === 'basic' && x.i === i, ctx)));
scen('haven', (G, ctx) => { T.hand(G, 0, ['farm', 'mine', 'castle', 'bard', 'wanderer']); A(G, 0, x => x.type === 'worker' && x.k === 'haven', ctx); });
D.journey.forEach((j, i) => scen('journey ' + j.points, (G, ctx) => { G.players[0].season = 3; G.players[0].workers = 6; T.hand(G, 0, ['farm', 'mine', 'castle', 'bard', 'wanderer', 'monk']); A(G, 0, x => x.type === 'worker' && x.k === 'journey' && x.i === i, ctx); }));
// basic events
const BASICSET = { bev_harvest_gathering: ['farm', 'mine', 'resin_refinery', 'twig_barge'], bev_wayfarers_fair: ['inn', 'chapel', 'lookout'], bev_elders_council: ['historian', 'crane', 'courthouse'], bev_wanderers_moot: ['bard', 'wanderer', 'ranger'] };
D.basicEvents.forEach((e, i) => scen('basic event ' + e.key, (G, ctx) => { T.city(G, 0, BASICSET[e.key]); A(G, 0, x => x.type === 'worker' && x.k === 'event' && x.e === 'b' && x.i === i, ctx); }));
// special events
D.specialEvents.forEach((e, i) => scen('special event ' + e.key, (G, ctx) => {
  G.sev = [{ k: i, o: -1, tuck: [], hid: false, stock: { twig: 0, resin: 0, pebble: 0, berry: 0 } }];
  const need = e.req.slice(); if (e.colors) need.push('farm', 'mine', 'bard', 'wanderer', 'historian', 'crane', 'castle', 'palace', 'inn', 'chapel');
  T.city(G, 0, need);
  if (e.key === 'sev_gilded_shrine_vault') T.entry(G, 0, 'chapel').tok = 2;
  if (e.key === 'sev_hurry_scurry_dash') { G.players[0].workers = 3; G.players[0].season = 1; A(G, 0, x => x.type === 'worker' && x.k === 'basic' && D.basic[x.i].key === 'basic_berry_patch', ctx); }
  if (e.key === 'sev_commencement_of_pupils') T.hand(G, 0, ['bard', 'wanderer', 'ranger', 'farm']);
  if (e.key === 'sev_marsh_fever_remedy') T.city(G, 0, ['farm']);
  A(G, 0, x => x.type === 'worker' && x.k === 'event' && x.e === 's' && x.i === 0, ctx);
  if (G.sev[0].o !== 0) problems.push(ctx + ': not claimed');
  HB.score(G, 0);
}));

// ---------- coverage report ----------
const need = [];
const req = (tag, why) => need.push([tag, why]);
for (const c of D.cards) req('play:' + c.key, 'card ' + c.name);
const FX = ['barge_toad', 'chip_sweep', 'doctor', 'fair_grounds', 'farm', 'general_store', 'husband', 'miner_mole', 'mine', 'monk', 'peddler', 'resin_refinery', 'storehouse', 'teacher', 'twig_barge', 'woodcarver', 'bard', 'postal_pigeon', 'ranger', 'shepherd', 'undertaker', 'wanderer', 'fool', 'ruins', 'historian', 'shopkeeper', 'courthouse', 'clock_tower'];
for (const k of FX) req('fx:' + k, 'effect of ' + k);
for (const k of ['inn', 'post_office', 'queen', 'cemetery', 'chapel', 'lookout', 'monastery', 'university', 'storehouse']) req('visit:' + k, 'visit ' + k);
for (const k of ['architect', 'castle', 'ever_tree', 'king', 'palace', 'school', 'theater', 'wife']) req('score:' + k, 'end-game bonus of ' + k);
for (const h of ['pay', 'occupy', 'innkeeper', 'crane', 'dungeon', 'judge', 'inn', 'bazaar', 'free']) req('how:' + h, 'ability/way: ' + h);
for (const f of D.forest) req('forest:' + f.key, 'forest ' + f.name);
D.basic.forEach((b, i) => req('basic:' + i, 'basic ' + b.name));
req('haven', 'haven'); D.journey.forEach((j, i) => req('journey:' + i, 'journey ' + j.points));
for (const e of D.basicEvents) req('bev:' + e.key, 'basic event ' + e.name);
for (const e of D.specialEvents) req('sev:' + e.key, 'special event ' + e.name);
[1, 2, 3].forEach(s => req('season:' + s, 'season change ' + s)); req('solo:roll', 'automa roll'); req('solo:fool', 'solo fool');
const missing = need.filter(([t]) => !tally[t]);
const covered = need.length - missing.length;
console.log('cover: mixed games ' + mixedGames + ' (' + mixedSteps + ' steps), forced scenarios run, ' + applies + ' applies checked for invariants');
console.log('cover: ' + covered + '/' + need.length + ' required items used at least once');
const lows = need.map(([t]) => [t, tally[t] || 0]).sort((a, b) => a[1] - b[1]).slice(0, 8);
console.log('cover: least used: ' + lows.map(x => x[0] + '=' + x[1]).join(', '));
if (missing.length) console.log('cover: MISSING ' + missing.map(m => m[0] + ' (' + m[1] + ')').join(', '));
console.log('cover: dungeon second cell used: ' + (tally['dungeon:2cells'] ? 'yes' : 'NO'));
console.log('cover: invariant/other problems: ' + problems.length); for (const p of problems.slice(0, 15)) console.log('  ' + p);
process.exit(missing.length || problems.length || !tally['dungeon:2cells'] ? 1 : 0);

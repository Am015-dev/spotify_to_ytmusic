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
  tinder_chipmunk: { city: ['bramble_allotment', 'flintpit'] }, echo_mole: { opp: ['bramble_allotment', 'reedpunt_toad', 'flintpit'] }, toppled_hall: { city: ['bramble_allotment'] },
  goodwife_vole: { city: ['goodman_vole'] }, goodman_vole: { city: ['bramble_allotment', 'goodwife_vole'] }, reedpunt_toad: { city: ['bramble_allotment'] }, cranny_market: { city: ['bramble_allotment'] },
  candlewick_shrine: {}, crook_shrew: { city: ['candlewick_shrine'] }, trailwarden_fox: { dep: true }, slate_schoolmarm: {}, lorewood_college: { city: ['bramble_allotment', 'flintpit'] },
  stonecrown_keep: { city: ['bramble_allotment', 'flintpit'] }, gildenfern_court: { city: ['stonecrown_keep'] }, acorn_academy: { city: ['goodman_vole', 'footsore_drifter'] }, glowworm_playhouse: { city: ['ballad_finch', 'bramble_sovereign'] },
  bramble_sovereign: {}, master_lathwright: {}, elderheart_oak: { city: ['stonecrown_keep'] }, thistle_regent: { hand: ['bramble_allotment'] }, lantern_rest: { meadow: ['bramble_allotment'] }, dovecote_depot: { hand: ['bramble_allotment', 'flintpit', 'stonecrown_keep', 'gildenfern_court'] },
  mossgrave_glade: {}, quietstone_cloister: {}, spyglass_perch: {}, hoard_cellar: {}, dewdrop_belfry: {}, thornhold_cells: { city: ['goodman_vole'] }, mosswood_assize: {}, chronicle_owl: {},
  poultice_badger: {}, whittle_beaver: {}, brother_moss: {}, haggle_magpie: {}, parcel_dove: { top: ['flintpit', 'bramble_allotment'] }, hollow_sexton: {}, ballad_finch: { hand: ['bramble_allotment', 'flintpit'] },
};
const DESTS = new Set(['lantern_rest', 'dovecote_depot', 'thistle_regent', 'mossgrave_glade', 'candlewick_shrine', 'spyglass_perch', 'quietstone_cloister', 'lorewood_college', 'hoard_cellar']);
for (const c of D.cards) {
  const ctx = 'card ' + c.key, pre = PRE[c.key] || {};
  try {
    const G = mk(3, ctx);
    if (pre.city) T.city(G, 0, pre.city);
    if (pre.opp) T.city(G, 1, pre.opp);
    const hand = pre.hand ? [c.key].concat(pre.hand) : [c.key, 'bramble_allotment', 'flintpit'];
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
      if (e && c.key === 'hoard_cellar') e.stock.twig = 3;
      if (c.key === 'lantern_rest') { T.meadow(G, 1, 'flintpit'); }
      if (c.key === 'thistle_regent') T.meadow(G, 1, 'flintpit');
      if (c.key === 'dovecote_depot') T.hand(G, 0, ['bramble_allotment', 'flintpit', 'stonecrown_keep']);
      if (c.key === 'mossgrave_glade') T.topDeck(G, ['bramble_allotment', 'flintpit', 'stonecrown_keep', 'gildenfern_court']);
      G.players[0].dep = [];
      A(G, 0, m => m.type === 'worker' && m.k === 'dest' && m.c === ids[0], ctx + ' visit');
    }
    // production in spring (every green card), clock tower use, ranger etc.
    if (c.color === 'green' || c.key === 'dewdrop_belfry') {
      G.cur = 0; G.players[0].dep = []; G.players[0].season = 0; G.players[0].workers = 2;
      A(G, 0, m => m.type === 'worker' && m.k === 'basic' && D.basic[m.i].key === 'basic_berry_patch', ctx);
      G.cur = 0; A(G, 0, m => m.type === 'worker' && m.k === 'basic' && D.basic[m.i].key === 'basic_berry_patch', ctx);
      G.cur = 0; A(G, 0, m => m.type === 'prepare', ctx + ' spring');
    }
    if (c.color === 'purple') { const s = HB.score(G, 0); if (s.detail.some(d => HB.cardKey(d.card) === c.key) || c.key === 'goodwife_vole' || c.key === 'master_lathwright') tally['score:' + c.key] = (tally['score:' + c.key] || 0) + 1; }
    addUsed(G);
  } catch (e) { problems.push(ctx + ': EXCEPTION ' + (e.stack || e.message).split('\n').slice(0, 3).join(' | ')); }
}
// purple end-game scoring with everything on the table
{
  const G = mk(2, 'purple'); T.city(G, 0, ['stonecrown_keep', 'gildenfern_court', 'acorn_academy', 'glowworm_playhouse', 'elderheart_oak', 'bramble_sovereign', 'master_lathwright', 'goodwife_vole', 'goodman_vole', 'bramble_allotment', 'flintpit']); G.bev[0].o = 0; G.sev[0].o = 0; T.res(G, 0, { resin: 3, pebble: 4 });
  const s = HB.score(G, 0); for (const d of s.detail) tally['score:' + HB.cardKey(d.card)] = (tally['score:' + HB.cardKey(d.card)] || 0) + 1;
  if (s.detail.length < 8) problems.push('purple scoring detail incomplete: ' + s.detail.length);
}

// governance triggers and abilities
function scen(name, fn) { try { const G = mk(3, name); fn(G, name); addUsed(G); check(G, name); } catch (e) { problems.push(name + ': EXCEPTION ' + (e.stack || e.message).split('\n').slice(0, 3).join(' | ')); } }
scen('triggers', (G, ctx) => {
  T.city(G, 0, ['chronicle_owl', 'tallyshop_mouse', 'mosswood_assize']); const [w, m] = T.hand(G, 0, ['footsore_drifter', 'flintpit']);
  A(G, 0, x => x.type === 'play' && x.card === w && x.how === 'pay', ctx); A(G, 0, x => x.type === 'play' && x.card === m && x.how === 'pay', ctx);
});
scen('gavel_marten', (G, ctx) => { T.city(G, 0, ['gavel_marten']); T.res(G, 0, { twig: 1, resin: 1, berry: 1 }); const [m] = T.hand(G, 0, ['flintpit']); A(G, 0, x => x.type === 'play' && x.card === m && x.how === 'gavel_marten', ctx); });
scen('hostler_hedgehog', (G, ctx) => { T.city(G, 0, ['hostler_hedgehog']); T.res(G, 0, {}); const [m] = T.hand(G, 0, ['goodman_vole']); A(G, 0, x => x.type === 'play' && x.card === m && x.how === 'hostler_hedgehog', ctx); });
scen('pulley_lift', (G, ctx) => { T.city(G, 0, ['pulley_lift']); T.res(G, 0, { twig: 2, resin: 3 }); const [m] = T.hand(G, 0, ['stonecrown_keep']); A(G, 0, x => x.type === 'play' && x.card === m && x.how === 'pulley_lift', ctx); });
scen('dungeon x2', (G, ctx) => {
  T.city(G, 0, ['thornhold_cells', 'trailwarden_fox', 'goodman_vole', 'ballad_finch']); T.res(G, 0, { twig: 2, resin: 3 }); const [a] = T.hand(G, 0, ['stonecrown_keep']);
  A(G, 0, x => x.type === 'play' && x.card === a && x.how === 'thornhold_cells', ctx);
  T.res(G, 0, { twig: 2, resin: 3 }); const [b] = T.hand(G, 0, ['gildenfern_court']); T.res(G, 0, { twig: 4, resin: 6, pebble: 3 }); G.cur = 0;
  const m = T.find(G, 0, x => x.type === 'play' && x.card === b && x.how === 'thornhold_cells'); if (m) { step(G, m, ctx); resolve(G, ctx); } else problems.push(ctx + ': second cell not usable');
  tally['dungeon:2cells'] = G.players[0].city.find(e => HB.cardKey(e.id) === 'thornhold_cells').pris.length >= 2 ? 1 : 0;
});
scen('occupy + elderheart', (G, ctx) => { T.city(G, 0, ['bramble_allotment', 'elderheart_oak']); const [h, b] = T.hand(G, 0, ['goodman_vole', 'ballad_finch']); A(G, 0, x => x.card === h && x.how === 'occupy', ctx); A(G, 0, x => x.card === b && x.how === 'occupy', ctx); });
scen('bazaar + undertaker + queen + inn on rival', (G, ctx) => {
  G.forest = [D.forest.findIndex(f => f.key === 'forest_meadow_bazaar'), 0, 1]; T.meadow(G, 0, 'flintpit'); T.meadow(G, 1, 'bramble_allotment');
  A(G, 0, x => x.type === 'worker' && x.k === 'forest' && x.i === 0, ctx);
  T.city(G, 1, ['lantern_rest', 'dovecote_depot']); G.cur = 0; T.hand(G, 0, ['bramble_allotment', 'flintpit']); T.meadow(G, 2, 'flintpit'); A(G, 0, x => x.type === 'worker' && x.k === 'dest' && x.o === 1 && HB.cardKey(x.c) === 'lantern_rest', ctx);
});
scen('monastery + cemetery with second slot', (G, ctx) => {
  T.city(G, 0, ['quietstone_cloister', 'brother_moss', 'mossgrave_glade', 'hollow_sexton']); G.players[0].workers = 4; G.players[0].season = 2;
  A(G, 0, x => x.type === 'worker' && x.k === 'dest' && HB.cardKey(x.c) === 'quietstone_cloister', ctx); T.res(G, 0, { twig: 3, berry: 3 }); T.topDeck(G, ['bramble_allotment', 'flintpit', 'stonecrown_keep', 'gildenfern_court']);
  G.cur = 0; A(G, 0, x => x.type === 'worker' && x.k === 'dest' && HB.cardKey(x.c) === 'mossgrave_glade', ctx);
});

// forest, basic, haven, journey
D.forest.forEach((f, i) => scen('forest ' + f.key, (G, ctx) => {
  G.forest = [i, (i + 1) % 11, (i + 2) % 11]; T.hand(G, 0, ['bramble_allotment', 'flintpit', 'stonecrown_keep', 'ballad_finch', 'footsore_drifter']); T.meadow(G, 0, 'flintpit'); T.meadow(G, 1, 'bramble_allotment');
  A(G, 0, x => x.type === 'worker' && x.k === 'forest' && x.i === 0, ctx);
}));
D.basic.forEach((b, i) => scen('basic ' + b.key, (G, ctx) => A(G, 0, x => x.type === 'worker' && x.k === 'basic' && x.i === i, ctx)));
scen('haven', (G, ctx) => { T.hand(G, 0, ['bramble_allotment', 'flintpit', 'stonecrown_keep', 'ballad_finch', 'footsore_drifter']); A(G, 0, x => x.type === 'worker' && x.k === 'haven', ctx); });
D.journey.forEach((j, i) => scen('journey ' + j.points, (G, ctx) => { G.players[0].season = 3; G.players[0].workers = 6; T.hand(G, 0, ['bramble_allotment', 'flintpit', 'stonecrown_keep', 'ballad_finch', 'footsore_drifter', 'brother_moss']); A(G, 0, x => x.type === 'worker' && x.k === 'journey' && x.i === i, ctx); }));
// basic events
const BASICSET = { bev_harvest_gathering: ['bramble_allotment', 'flintpit', 'amber_still', 'kindling_raft'], bev_wayfarers_fair: ['lantern_rest', 'candlewick_shrine', 'spyglass_perch'], bev_elders_council: ['chronicle_owl', 'pulley_lift', 'mosswood_assize'], bev_wanderers_moot: ['ballad_finch', 'footsore_drifter', 'trailwarden_fox'] };
D.basicEvents.forEach((e, i) => scen('basic event ' + e.key, (G, ctx) => { T.city(G, 0, BASICSET[e.key]); A(G, 0, x => x.type === 'worker' && x.k === 'event' && x.e === 'b' && x.i === i, ctx); }));
// special events
D.specialEvents.forEach((e, i) => scen('special event ' + e.key, (G, ctx) => {
  G.sev = [{ k: i, o: -1, tuck: [], hid: false, stock: { twig: 0, resin: 0, pebble: 0, berry: 0 } }];
  const need = e.req.slice(); if (e.colors) need.push('bramble_allotment', 'flintpit', 'ballad_finch', 'footsore_drifter', 'chronicle_owl', 'pulley_lift', 'stonecrown_keep', 'gildenfern_court', 'lantern_rest', 'candlewick_shrine');
  T.city(G, 0, need);
  if (e.key === 'sev_gilded_shrine_vault') T.entry(G, 0, 'candlewick_shrine').tok = 2;
  if (e.key === 'sev_hurry_scurry_dash') { G.players[0].workers = 3; G.players[0].season = 1; A(G, 0, x => x.type === 'worker' && x.k === 'basic' && D.basic[x.i].key === 'basic_berry_patch', ctx); }
  if (e.key === 'sev_commencement_of_pupils') T.hand(G, 0, ['ballad_finch', 'footsore_drifter', 'trailwarden_fox', 'bramble_allotment']);
  if (e.key === 'sev_marsh_fever_remedy') T.city(G, 0, ['bramble_allotment']);
  A(G, 0, x => x.type === 'worker' && x.k === 'event' && x.e === 's' && x.i === 0, ctx);
  if (G.sev[0].o !== 0) problems.push(ctx + ': not claimed');
  HB.score(G, 0);
}));

// ---------- coverage report ----------
const need = [];
const req = (tag, why) => need.push([tag, why]);
for (const c of D.cards) req('play:' + c.key, 'card ' + c.name);
const FX = ['reedpunt_toad', 'tinder_chipmunk', 'poultice_badger', 'midsummer_green', 'bramble_allotment', 'cranny_market', 'goodman_vole', 'echo_mole', 'flintpit', 'brother_moss', 'haggle_magpie', 'amber_still', 'hoard_cellar', 'slate_schoolmarm', 'kindling_raft', 'whittle_beaver', 'ballad_finch', 'parcel_dove', 'trailwarden_fox', 'crook_shrew', 'hollow_sexton', 'footsore_drifter', 'mudpie_jester', 'toppled_hall', 'chronicle_owl', 'tallyshop_mouse', 'mosswood_assize', 'dewdrop_belfry'];
for (const k of FX) req('fx:' + k, 'effect of ' + k);
for (const k of ['lantern_rest', 'dovecote_depot', 'thistle_regent', 'mossgrave_glade', 'candlewick_shrine', 'spyglass_perch', 'quietstone_cloister', 'lorewood_college', 'hoard_cellar']) req('visit:' + k, 'visit ' + k);
for (const k of ['master_lathwright', 'stonecrown_keep', 'elderheart_oak', 'bramble_sovereign', 'gildenfern_court', 'acorn_academy', 'glowworm_playhouse', 'goodwife_vole']) req('score:' + k, 'end-game bonus of ' + k);
for (const h of ['pay', 'occupy', 'hostler_hedgehog', 'pulley_lift', 'thornhold_cells', 'gavel_marten', 'lantern_rest', 'bazaar', 'free']) req('how:' + h, 'ability/way: ' + h);
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

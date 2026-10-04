// Targeted rules tests: each builds a state by hand and checks the result.   node rules-test.js
const T = require('./tlib');
const { HB, D } = T;
const X = HB._;
let pass = 0, fail = 0;
const failures = [];
function test(name, fn) { try { fn(); pass++; } catch (e) { fail++; failures.push(name); console.log('FAIL: ' + name + '\n   ' + String(e.message).split('\n').join('\n   ')); } }
const eq = (a, b, m) => { if (a !== b) throw new Error((m || 'value') + ': expected ' + b + ', got ' + a); };
const ok = (c, m) => { if (!c) throw new Error(m || 'assertion failed'); };
const FI = k => D.forest.findIndex(f => f.key === k);
const SI = k => D.specialEvents.findIndex(e => e.key === k);
const BI = k => D.basic.findIndex(b => b.key === k);
const setForest = (G, keys) => { G.forest = keys.map(FI); };
const setSev = (G, keys) => { G.sev = keys.map(k => ({ k: SI(k), o: -1, tuck: [], hid: false, stock: { twig: 0, resin: 0, pebble: 0, berry: 0 } })); };
const worker = (G, seat, pred) => { T.cur(G, seat); return T.act(G, seat, m => m.type === 'worker' && pred(m)); };
const basicW = (G, seat, key) => worker(G, seat, m => m.k === 'basic' && D.basic[m.i].key === key);
const forestW = (G, seat, i) => worker(G, seat, m => m.k === 'forest' && m.i === i);
const play = (G, seat, id, how) => { T.cur(G, seat); return T.act(G, seat, m => m.type === 'play' && m.card === id && (!how || m.how === how)); };
const playable = (G, seat, id) => HB.moves(G, seat).some(m => m.type === 'play' && m.card === id);
const choose = (G, re) => T.q(G, re);
const sc = (G, seat) => HB.score(G, seat);
const keyOf = id => HB.cardKey(id);
const inCity = (G, seat, k) => !!T.entry(G, seat, k);
const FARM15 = () => ['farm', 'farm', 'farm', 'farm', 'farm', 'farm', 'farm', 'farm', 'mine', 'mine', 'mine', 'resin_refinery', 'resin_refinery', 'resin_refinery', 'twig_barge'];
const rsum = o => o.twig + o.resin + o.pebble + o.berry;
const JUNK8 = ['twig_barge', 'twig_barge', 'twig_barge', 'general_store', 'general_store', 'general_store', 'resin_refinery', 'resin_refinery'];
const finishAll = G => T.finish(G);
const pend = G => G.q ? G.q.kind : null;
const lbl = G => G.q.opts.map(o => o.label);

// ---------------- setup ----------------
test('setup: starting hands are 5/6/7/8 by seat, meadow 8, 128 cards conserved', () => {
  for (let np = 2; np <= 4; np++) {
    const G = T.game(np);
    for (let i = 0; i < np; i++) eq(G.players[i].hand.length, 5 + i, 'hand of seat ' + i);
    eq(G.meadow.filter(x => x >= 0).length, 8, 'meadow');
    eq(HB.cardCount(G), 128, 'cards'); T.inv(G);
    for (const p of G.players) { eq(p.workers, 2, 'workers'); eq(p.season, 0); eq(Object.values(p.res).reduce((a, b) => a + b, 0), 0, 'resources'); }
  }
});
test('setup: forest 3 cards for 2p, 4 for 3p/4p; 4 basic + 4 distinct special events', () => {
  eq(T.game(2).forest.length, 3); eq(T.game(3).forest.length, 4); eq(T.game(4).forest.length, 4);
  for (let s = 1; s < 20; s++) { const G = T.game(3, { seed: s }); eq(G.bev.length, 4); eq(G.sev.length, 4); eq(new Set(G.sev.map(e => e.k)).size, 4); eq(new Set(G.forest).size, 4); }
});
test('setup: 128 cards = 63 critters + 65 constructions, 48 kinds, copies match', () => {
  let c = 0, k = 0; for (let i = 0; i < 128; i++) HB.cardOf(i).kind === 'critter' ? c++ : k++;
  eq(c, 63); eq(k, 65); eq(D.cards.length, 48);
});
test('setup: solo uses the 2-player layout, 5 cards, automa blocks top-left forest and 3-twig space', () => {
  const G = T.solo(1);
  eq(G.players.length, 1); eq(G.players[0].hand.length, 5); eq(G.forest.length, 3);
  eq(G.grim.fi, 0); eq(D.basic[G.grim.bi].key, 'basic_twig_heap');
  const ms = HB.moves(G, 0).filter(m => m.type === 'worker');
  ok(!ms.some(m => m.k === 'forest' && m.i === 0), 'forest 0 blocked'); ok(!ms.some(m => m.k === 'basic' && m.i === G.grim.bi), 'twigs blocked');
  ok(ms.some(m => m.k === 'forest' && m.i === 1), 'forest 1 open');
});
test('moves: only the seat that must act has moves; first seat acts first', () => {
  const G = T.game(3); eq(HB.moves(G, 1).length, 0); eq(HB.moves(G, 2).length, 0); ok(HB.moves(G, 0).length > 5);
  eq(HB.actor(G), 0);
});
test('apply: illegal moves are rejected with an error and do not change the state', () => {
  const G = T.game(2); const s = JSON.stringify(G);
  const r = HB.apply(G, { type: 'worker', k: 'basic', i: 99 }); eq(r.ok, false);
  const r2 = HB.apply(G, { type: 'prepare' }); eq(r2.ok, false, 'cannot prepare with free workers'); eq(JSON.stringify(G), s);
  const G2 = T.game(2); const r3 = HB.apply(G2, { type: 'choose', i: 0 }); eq(r3.ok, false);
});
test('state is plain JSON: round trip continues identically; same seed gives same game', () => {
  const G = T.game(2, { seed: 99 }); basicW(G, 0, 'basic_dewberry_nook');
  const G2 = JSON.parse(JSON.stringify(G));
  eq(JSON.stringify(G2), JSON.stringify(G));
  basicW(G, 1, 'basic_twig_heap'); basicW(G2, 1, 'basic_twig_heap');
  eq(JSON.stringify(G2), JSON.stringify(G));
  const A = T.game(2, { seed: 5 }), B = T.game(2, { seed: 5 }); eq(JSON.stringify(A), JSON.stringify(B));
});

// ---------------- worker placement ----------------
test('exclusive basic space holds one worker; shared spaces hold many (even same colour)', () => {
  const G = T.game(2);
  basicW(G, 0, 'basic_twig_heap'); eq(G.players[0].res.twig, 3);
  T.cur(G, 1); ok(!T.find(G, 1, m => m.type === 'worker' && m.k === 'basic' && D.basic[m.i].key === 'basic_twig_heap'), 'taken');
  basicW(G, 1, 'basic_berry_patch'); basicW(G, 0, 'basic_berry_patch'); eq(G.players[0].res.berry, 1); eq(G.players[1].res.berry, 1);
  eq(G.players[0].dep.length, 2);
  T.cur(G, 0); eq(HB.moves(G, 0).filter(m => m.type === 'worker').length, 0, 'no workers left');
});
test('basic spaces give exactly what they say (berry+card, resin+card, pebble, 2 resin, 2 twig+card, 2 cards+point)', () => {
  const G = T.game(2); const h = G.players[0].hand.length;
  basicW(G, 0, 'basic_dewberry_nook'); eq(G.players[0].res.berry, 1); eq(G.players[0].hand.length, h + 1);
  basicW(G, 0, 'basic_amber_weep'); eq(G.players[0].res.resin, 1); eq(G.players[0].hand.length, h + 2);
  const G2 = T.game(2); basicW(G2, 0, 'basic_gossip_glade'); eq(G2.players[0].pts, 1); eq(G2.players[0].hand.length, 7);
  basicW(G2, 0, 'basic_kindling_glen'); eq(G2.players[0].res.twig, 2);
  const G3 = T.game(2); basicW(G3, 0, 'basic_pebble_bank'); basicW(G3, 1, 'basic_resin_pool'); eq(G3.players[0].res.pebble, 1); eq(G3.players[1].res.resin, 2);
});
test('forest: 2/3 players have one slot, 4 players have a second slot for a different player only', () => {
  const G3 = T.game(3); setForest(G3, ['forest_bumper_bramble', 'forest_mixed_glade', 'forest_sapwell_copse', 'forest_berry_thicket']);
  forestW(G3, 0, 0); eq(G3.players[0].res.berry, 3);
  T.cur(G3, 1); ok(!T.find(G3, 1, m => m.type === 'worker' && m.k === 'forest' && m.i === 0), '3p: second slot closed');
  const G = T.game(4); setForest(G, ['forest_bumper_bramble', 'forest_mixed_glade', 'forest_sapwell_copse', 'forest_berry_thicket']);
  forestW(G, 0, 0); forestW(G, 1, 0); eq(G.players[1].res.berry, 3);
  T.cur(G, 2); ok(!T.find(G, 2, m => m.type === 'worker' && m.k === 'forest' && m.i === 0), '4p: only two slots');
  T.cur(G, 0); ok(!T.find(G, 0, m => m.type === 'worker' && m.k === 'forest' && m.i === 0), 'same player never twice');
});
test('forest effects: 11 locations behave as written', () => {
  const run = (key, setup) => { const G = T.game(2); setForest(G, [key, 'forest_bumper_bramble', 'forest_berry_thicket']); if (setup) setup(G); return G; };
  let G = run('forest_berry_thicket'); let h = G.players[0].hand.length; forestW(G, 0, 0); eq(G.players[0].res.berry, 2); eq(G.players[0].hand.length, h + 1);
  G = run('forest_foragers_crossing'); forestW(G, 0, 0); choose(G, /twig/); choose(G, /berry/); eq(G.players[0].res.twig, 1); eq(G.players[0].res.berry, 1);
  G = run('forest_rummage_hollow'); forestW(G, 0, 0); choose(G, /Discard/); choose(G, /Discard/); choose(G, /Done/); eq(G.players[0].hand.length, 5 - 2 + 4);
  G = run('forest_echoing_meadow'); h = G.players[0].hand.length; forestW(G, 0, 0); choose(G, /Twig Heap/); eq(G.players[0].res.twig, 3); eq(G.players[0].hand.length, h + 1);
  G = run('forest_quarry_burrow'); h = G.players[0].hand.length; forestW(G, 0, 0); eq(G.players[0].res.pebble, 1); eq(G.players[0].hand.length, h + 3);
  G = run('forest_mixed_glade'); forestW(G, 0, 0); eq(G.players[0].res.twig + G.players[0].res.resin + G.players[0].res.berry, 3);
  G = run('forest_bumper_bramble'); forestW(G, 0, 0); eq(G.players[0].res.berry, 3);
  G = run('forest_sapwell_copse'); forestW(G, 0, 0); eq(G.players[0].res.resin, 2); eq(G.players[0].res.twig, 1);
  G = run('forest_postbag_clearing'); h = G.players[0].hand.length; forestW(G, 0, 0); choose(G, /pebble/); eq(G.players[0].res.pebble, 1); eq(G.players[0].hand.length, h + 2);
  G = run('forest_barter_stump'); forestW(G, 0, 0); choose(G, /Discard/); choose(G, /Discard/); choose(G, /Done/); choose(G, /resin/); choose(G, /resin/); eq(G.players[0].res.resin, 2); eq(G.players[0].hand.length, 3);
});
test('forest: Meadow Bazaar draws 2 meadow cards and may play one for 1 fewer resource', () => {
  const G = T.game(2); setForest(G, ['forest_meadow_bazaar', 'forest_bumper_bramble', 'forest_berry_thicket']);
  const a = T.meadow(G, 0, 'mine'), b = T.meadow(G, 1, 'castle'); T.hand(G, 0, ['farm']); T.res(G, 0, { twig: 2, resin: 1 });
  forestW(G, 0, 0); choose(G, /Take Flintpit/); choose(G, /Take Stonecrown/);
  eq(G.players[0].hand.length, 3); eq(G.meadow.filter(x => x >= 0).length, 8, 'refilled');
  ok(G.q && /1 fewer/.test(G.q.title)); ok(!lbl(G).some(l => /Stonecrown/.test(l)), 'castle too dear'); choose(G, /Play Flintpit/);
  ok(inCity(G, 0, 'mine')); eq(G.players[0].res.twig + G.players[0].res.resin, 1, 'pebble cut, twig+resin paid'); T.inv(G);
});
test('forest: Bazaar cannot draw with a full hand', () => {
  const G = T.game(2); setForest(G, ['forest_meadow_bazaar', 'forest_bumper_bramble', 'forest_berry_thicket']);
  T.hand(G, 0, JUNK8);
  forestW(G, 0, 0); ok(!G.q, 'nothing to take'); eq(G.players[0].hand.length, 8);
});
test('haven: discard N cards, gain one resource per two discarded', () => {
  const G = T.game(2); T.hand(G, 0, ['farm', 'mine', 'mine', 'castle', 'palace']);
  T.cur(G, 0); T.act(G, 0, m => m.type === 'worker' && m.k === 'haven');
  for (let i = 0; i < 5; i++) choose(G, /Discard/);
  choose(G, /pebble/); choose(G, /pebble/); eq(G.players[0].res.pebble, 2); eq(G.players[0].hand.length, 0);
  const H2 = T.game(2); T.hand(H2, 0, ['farm', 'mine', 'mine']); T.cur(H2, 0); T.act(H2, 0, m => m.type === 'worker' && m.k === 'haven');
  for (let i = 0; i < 3; i++) choose(H2, /Discard/); eq(H2.players[0].res.twig + H2.players[0].res.pebble + H2.players[0].res.resin + H2.players[0].res.berry, 0, 'only after the loop');
  ok(H2.q && H2.q.kind === 'resource'); choose(H2, /berry/); ok(!H2.q); eq(H2.players[0].res.berry, 1, '3 cards give 1 resource');
});
test('journey: autumn only; discard equals value; worker stays and scores; shared 2-spot', () => {
  const G = T.game(2); T.hand(G, 0, ['farm', 'mine', 'mine', 'castle', 'palace', 'farm']);
  ok(!T.find(G, 0, m => m.k === 'journey'), 'not before autumn');
  G.players[0].season = 3; G.players[0].workers = 6;
  const m5 = T.find(G, 0, m => m.k === 'journey' && m.i === 0); ok(m5, '5 spot open with 6 cards');
  T.act(G, 0, m => m.k === 'journey' && m.i === 0);
  for (let i = 0; i < 5; i++) choose(G, /Discard/); ok(!G.q); eq(G.players[0].hand.length, 1);
  eq(sc(G, 0).journey, 5); T.cur(G, 1); G.players[1].season = 3; G.players[1].workers = 6; T.hand(G, 1, ['farm', 'farm']);
  ok(!T.find(G, 1, m => m.k === 'journey' && m.i === 0), 'exclusive and taken');
  ok(T.find(G, 1, m => m.k === 'journey' && m.i === 3), 'the 2-spot is shared');
  T.cur(G, 0); G.players[0].dep.length; ok(G.players[0].dep[0].perm, 'journey worker is permanent');
});
test('journey: needs enough cards in hand', () => {
  const G = T.game(2); G.players[0].season = 3; G.players[0].workers = 6; T.hand(G, 0, ['farm', 'farm', 'farm']);
  ok(!T.find(G, 0, m => m.k === 'journey' && m.i === 0)); ok(!T.find(G, 0, m => m.k === 'journey' && m.i === 1)); ok(T.find(G, 0, m => m.k === 'journey' && m.i === 2));
});

// ---------------- seasons ----------------
test('prepare for season: only when all workers placed; 3/4/6 workers; production in spring+autumn only; summer meadow draw', () => {
  const G = T.game(2); T.city(G, 0, ['farm']); T.res(G, 0, {});
  ok(!T.find(G, 0, m => m.type === 'prepare'), 'cannot prepare yet');
  basicW(G, 0, 'basic_berry_patch'); basicW(G, 0, 'basic_berry_patch'); eq(G.players[0].res.berry, 2);
  T.cur(G, 0); T.act(G, 0, m => m.type === 'prepare');
  eq(G.players[0].season, 1); eq(G.players[0].workers, 3); eq(G.players[0].dep.length, 0); eq(G.players[0].res.berry, 3, 'farm produced in spring');
  for (let i = 0; i < 3; i++) basicW(G, 0, 'basic_berry_patch'); eq(G.players[0].res.berry, 6);
  const h = G.players[0].hand.length;
  T.cur(G, 0); T.act(G, 0, m => m.type === 'prepare');
  eq(G.players[0].season, 2); eq(G.players[0].workers, 4); eq(G.players[0].res.berry, 6, 'no production in summer');
  ok(G.q && G.q.kind === 'meadow'); choose(G, /Take/); choose(G, /Take/); ok(!G.q); eq(G.players[0].hand.length, h + 2); eq(G.meadow.filter(x => x >= 0).length, 8);
  for (let i = 0; i < 4; i++) basicW(G, 0, 'basic_berry_patch');
  T.cur(G, 0); T.act(G, 0, m => m.type === 'prepare');
  eq(G.players[0].season, 3); eq(G.players[0].workers, 6); eq(G.players[0].res.berry, 6 + 4 + 1, 'autumn production');
  for (let i = 0; i < 6; i++) basicW(G, 0, 'basic_berry_patch');
  T.cur(G, 0); ok(!T.find(G, 0, m => m.type === 'prepare'), 'autumn is last'); T.inv(G);
});
test('summer meadow draw respects hand limit and can be stopped early', () => {
  const G = T.game(2); G.players[0].season = 1; G.players[0].workers = 3; T.hand(G, 0, ['farm', 'farm', 'farm', 'farm', 'farm', 'farm', 'farm']);
  for (let i = 0; i < 3; i++) basicW(G, 0, 'basic_berry_patch'); T.cur(G, 0); T.act(G, 0, m => m.type === 'prepare');
  choose(G, /Take/); ok(!G.q, 'hand full after one card'); eq(G.players[0].hand.length, 8);
  const H2 = T.game(2); H2.players[0].season = 1; H2.players[0].workers = 3;
  for (let i = 0; i < 3; i++) basicW(H2, 0, 'basic_berry_patch'); T.cur(H2, 0); T.act(H2, 0, m => m.type === 'prepare'); choose(H2, /Stop/);
  ok(!H2.q);
});
test('each player is on their own season clock', () => {
  const G = T.game(2); basicW(G, 0, 'basic_berry_patch'); basicW(G, 0, 'basic_berry_patch'); T.cur(G, 0); T.act(G, 0, m => m.type === 'prepare');
  eq(G.players[0].season, 1); eq(G.players[1].season, 0);
});
test('permanent workers (cemetery, monastery, journey) survive prepare; others are recalled', () => {
  const G = T.game(2); T.city(G, 0, ['monastery']); T.res(G, 0, { twig: 1, resin: 1 });
  T.cur(G, 0); T.act(G, 0, m => m.k === 'dest'); choose(G, /resin/); choose(G, /twig/); eq(G.players[0].pts, 4);
  basicW(G, 0, 'basic_berry_patch'); T.cur(G, 0); T.act(G, 0, m => m.type === 'prepare');
  eq(G.players[0].dep.length, 1, 'monastery worker stays'); eq(G.players[0].workers, 3);
  T.cur(G, 0); ok(!T.find(G, 0, m => m.k === 'dest'), 'monastery full (one slot)');
});

// ---------------- playing cards ----------------
test('play from hand: pay the cost to the supply; card enters the city; production fires on play', () => {
  const G = T.game(2); const [f] = T.hand(G, 0, ['farm']); T.res(G, 0, { twig: 2, resin: 1 });
  play(G, 0, f, 'pay'); ok(inCity(G, 0, 'farm')); eq(G.players[0].res.twig, 0); eq(G.players[0].res.resin, 0); eq(G.players[0].res.berry, 1, 'farm on play');
  eq(G.players[0].hand.length, 0); eq(G.cur, 1, 'turn passes');
});
test('play from the meadow: replaced at once from the deck', () => {
  const G = T.game(2); const m = T.meadow(G, 3, 'mine'); T.res(G, 0, { twig: 1, resin: 1, pebble: 1 }); const d = G.deck.length;
  play(G, 0, m, 'pay'); ok(inCity(G, 0, 'mine')); ok(G.meadow[3] >= 0 && G.meadow[3] !== m, 'slot refilled'); eq(G.deck.length, d - 1); T.inv(G);
});
test('cannot play without resources; affordable cards listed with the price', () => {
  const G = T.game(2); const [c] = T.hand(G, 0, ['castle']); T.res(G, 0, { twig: 2, resin: 3, pebble: 2 }); ok(!playable(G, 0, c));
  T.res(G, 0, { twig: 2, resin: 3, pebble: 3 }); ok(playable(G, 0, c)); ok(/pay 2 twigs, 3 resin, 3 pebbles/.test(T.find(G, 0, { type: 'play', card: c }).label));
});
test('city limit 15: a full city cannot take more cards', () => {
  const G = T.game(2); T.city(G, 0, FARM15()); eq(HB.cityCount(G, 0), 15);
  const [f] = T.hand(G, 0, ['general_store']); T.res(G, 0, { twig: 9, resin: 9, pebble: 9 }); ok(!playable(G, 0, f));
});
test('Wanderer takes no city space and can be played into a full city', () => {
  const G = T.game(2); T.city(G, 0, FARM15()); const [w] = T.hand(G, 0, ['wanderer']); T.res(G, 0, { berry: 2 });
  play(G, 0, w, 'pay'); eq(HB.cityCount(G, 0), 15); eq(G.players[0].city.length, 16); eq(G.players[0].hand.length, 3, 'drew 3'); T.inv(G);
});
test('Husband and Wife share one space (and a pair fits into a full city)', () => {
  const G = T.game(2); T.city(G, 0, FARM15().slice(0, 13).concat(['husband', 'twig_barge'])); eq(HB.cityCount(G, 0), 15);
  const [w] = T.hand(G, 0, ['wife']); T.res(G, 0, { berry: 2 }); play(G, 0, w, 'pay');
  eq(HB.cityCount(G, 0), 15); eq(G.players[0].city.length, 16); eq(T.entry(G, 0, 'wife').pair, T.entry(G, 0, 'husband').id);
  eq(sc(G, 0).bonus, 3, 'wife bonus when paired');
  const H2 = T.game(2); T.city(H2, 0, ['wife']); eq(sc(H2, 0).bonus, 0, 'unpaired wife scores no bonus');
});
test('a second Wife cannot pair with an already paired Husband', () => {
  const G = T.game(2); T.city(G, 0, ['husband', 'wife', 'wife']); const wives = G.players[0].city.filter(e => keyOf(e.id) === 'wife');
  eq(wives.filter(e => e.pair != null).length, 1); eq(HB.cityCount(G, 0), 2);
});
test('unique cards: only one copy per city; commons any number', () => {
  const G = T.game(2); T.city(G, 0, ['historian', 'farm']); const [h2, f2] = T.hand(G, 0, ['historian', 'farm']); T.res(G, 0, { berry: 9, twig: 9, resin: 9 });
  ok(!playable(G, 0, h2), 'second historian'); ok(playable(G, 0, f2), 'second farm');
});
test('occupy: a critter whose linked construction is in your city plays free; one token per construction, kept for ever', () => {
  const G = T.game(2); T.city(G, 0, ['farm']); const [h1, h2] = T.hand(G, 0, ['husband', 'husband']);
  const mv = T.find(G, 0, m => m.card === h1 && m.how === 'occupy'); ok(mv, 'occupy move'); T.act(G, 0, m => m.card === h1 && m.how === 'occupy');
  ok(T.entry(G, 0, 'farm').occ); eq(G.players[0].res.berry, 0); T.cur(G, 0); ok(!T.find(G, 0, m => m.card === h2 && m.how === 'occupy'), 'token already used');
  X.withG(G, () => X.removeFromCity(0, h1)); G.discard.push(h1); ok(T.entry(G, 0, 'farm').occ, 'token stays when the critter leaves');
  ok(!T.find(G, 0, m => m.card === h2 && m.how === 'occupy'));
});
test('Elderheart Oak hosts any one critter for free', () => {
  const G = T.game(2); T.city(G, 0, ['ever_tree']); const [c, d] = T.hand(G, 0, ['chip_sweep', 'bard']);
  T.act(G, 0, m => m.card === c && m.how === 'occupy'); ok(T.entry(G, 0, 'ever_tree').occ); T.cur(G, 0); ok(!T.find(G, 0, m => m.card === d && m.how === 'occupy'));
});
test('hand limit: draws stop at 8 cards', () => {
  const G = T.game(2); T.hand(G, 0, JUNK8); const d = G.deck.length;
  basicW(G, 0, 'basic_dewberry_nook'); eq(G.players[0].hand.length, 8); eq(G.deck.length, d);
  const H2 = T.game(2); T.hand(H2, 0, JUNK8.slice(0, 6)); basicW(H2, 0, 'basic_gossip_glade'); eq(H2.players[0].hand.length, 8);
});
test('empty deck: the discard pile is shuffled into a new deck', () => {
  const G = T.game(2); G.discard = G.discard.concat(G.deck); G.deck = []; const n = G.discard.length; basicW(G, 0, 'basic_dewberry_nook');
  eq(G.discard.length, 0); eq(G.deck.length, n - 1); T.inv(G);
});

// ---------------- production cards ----------------
test('green production cards all produce what they say (on play and in spring)', () => {
  const G = T.game(2); T.city(G, 0, ['farm', 'farm', 'general_store', 'mine', 'resin_refinery', 'twig_barge', 'barge_toad']);
  G.players[0].dep = []; basicW(G, 0, 'basic_berry_patch'); basicW(G, 0, 'basic_berry_patch'); const b = G.players[0].res.berry;
  T.cur(G, 0); T.act(G, 0, m => m.type === 'prepare');
  const r = G.players[0].res; eq(r.berry, b + 2 + 2 + 0, 'farms + store(2 with farm)'); eq(r.pebble, 1); eq(r.resin, 1); eq(r.twig, 2 + 2 * 2, 'barge + toad per farm');
});
test('General Store gives 1 berry without an Allotment, 2 with one', () => {
  const G = T.game(2); const [g] = T.hand(G, 0, ['general_store']); T.res(G, 0, { resin: 1, pebble: 1 }); play(G, 0, g, 'pay'); eq(G.players[0].res.berry, 1);
  const H2 = T.game(2); T.city(H2, 0, ['farm']); const [g2] = T.hand(H2, 0, ['general_store']); T.res(H2, 0, { resin: 1, pebble: 1 }); play(H2, 0, g2, 'pay'); eq(H2.players[0].res.berry, 2);
});
test('Husband production: any 1 resource only when paired with a Wife and an Allotment is in the city', () => {
  const G = T.game(2); T.city(G, 0, ['husband', 'wife', 'farm']); G.players[0].dep = [];
  basicW(G, 0, 'basic_berry_patch'); basicW(G, 0, 'basic_berry_patch'); T.cur(G, 0); T.act(G, 0, m => m.type === 'prepare');
  ok(G.q && G.q.kind === 'resource'); choose(G, /pebble/); eq(G.players[0].res.pebble, 1);
  const H2 = T.game(2); T.city(H2, 0, ['husband', 'farm']); basicW(H2, 0, 'basic_berry_patch'); basicW(H2, 0, 'basic_berry_patch'); T.cur(H2, 0); T.act(H2, 0, m => m.type === 'prepare'); ok(!H2.q, 'unpaired husband gives nothing');
});
test('Tinder Chipmunk re-runs one other production card, never itself', () => {
  const G = T.game(2); T.city(G, 0, ['mine', 'farm']); const [c] = T.hand(G, 0, ['chip_sweep']); T.res(G, 0, { berry: 3 }); play(G, 0, c, 'pay');
  ok(G.q && G.q.kind === 'chip'); ok(!lbl(G).some(l => /Tinder/.test(l))); eq(G.q.opts.length, 2); choose(G, /Flintpit/); eq(G.players[0].res.pebble, 1); ok(!G.q);
});
test('two Chip Sweeps cannot loop: the second may pick the first only once', () => {
  const G = T.game(2); T.city(G, 0, ['chip_sweep', 'mine']); const [c] = T.hand(G, 0, ['chip_sweep']); T.res(G, 0, { berry: 3 }); play(G, 0, c, 'pay');
  choose(G, /Tinder/); ok(G.q && !lbl(G).some(l => /Tinder/.test(l)), 'chain picks other cards only'); choose(G, /Flintpit/); eq(G.players[0].res.pebble, 1);
});
test('Echo Mole copies a rival production card, evaluated in the rival city', () => {
  const G = T.game(2); T.city(G, 1, ['farm', 'farm', 'barge_toad', 'storehouse']); const [m] = T.hand(G, 0, ['miner_mole']); T.res(G, 0, { berry: 3 });
  play(G, 0, m, 'pay'); ok(G.q && G.q.kind === 'mole'); ok(!lbl(G).some(l => /Hoard/.test(l)), 'cannot copy a storehouse'); choose(G, /Reedpunt/);
  eq(G.players[0].res.twig, 4, '2 per rival Allotment'); eq(G.players[1].res.twig, 0);
});
test('Slate Schoolmarm: draw 2, keep one, rival gets the other; full rival hand discards it', () => {
  const G = T.game(2); const [t] = T.hand(G, 0, ['teacher']); T.res(G, 0, { berry: 2 }); T.topDeck(G, ['mine', 'castle']); const h1 = G.players[1].hand.length;
  play(G, 0, t, 'pay'); ok(G.q && G.q.kind === 'teach'); choose(G, /Keep Stonecrown/); eq(G.players[0].hand.length, 1); eq(G.players[1].hand.length, h1 + 1);
  ok(G.players[1].hand.some(id => keyOf(id) === 'mine')); T.inv(G);
  const H2 = T.game(2); const [t2] = T.hand(H2, 0, ['teacher']); T.hand(H2, 1, JUNK8); T.res(H2, 0, { berry: 2 }); const d = H2.discard.length;
  play(H2, 0, t2, 'pay'); choose(H2, /Keep/); eq(H2.players[1].hand.length, 8); eq(H2.discard.length, d + 1); T.inv(H2);
});
test('Poultice Badger / Whittle Beaver: spend up to 3 berries/twigs for point tokens', () => {
  const G = T.game(2); const [d] = T.hand(G, 0, ['doctor']); T.res(G, 0, { berry: 6 }); play(G, 0, d, 'pay'); eq(G.players[0].res.berry, 2);
  choose(G, /Spend 1/); choose(G, /Spend 1/); ok(!G.q, 'no berries left'); eq(G.players[0].pts, 2); eq(G.players[0].res.berry, 0);
  const H2 = T.game(2); const [w] = T.hand(H2, 0, ['woodcarver']); T.res(H2, 0, { berry: 2, twig: 5 }); play(H2, 0, w, 'pay');
  for (let i = 0; i < 3; i++) choose(H2, /Spend 1/); ok(!H2.q, 'max 3'); eq(H2.players[0].pts, 3); eq(H2.players[0].res.twig, 2);
});
test('Brother Moss: give up to 2 berries to a rival, 2 point tokens each', () => {
  const G = T.game(2); const [m] = T.hand(G, 0, ['monk']); T.res(G, 0, { berry: 4 }); play(G, 0, m, 'pay'); eq(G.players[0].res.berry, 3);
  choose(G, /Give 1 berry/); choose(G, /Give 1 berry/); ok(!G.q); eq(G.players[0].pts, 4); eq(G.players[1].res.berry, 2); eq(G.players[0].res.berry, 1);
});
test('Haggle Magpie: swap up to 2 resources for any 2', () => {
  const G = T.game(2); const [p] = T.hand(G, 0, ['peddler']); T.res(G, 0, { berry: 4 }); play(G, 0, p, 'pay'); eq(G.players[0].res.berry, 2);
  choose(G, /Trade away 1 berry/); choose(G, /Trade away 1 berry/); ok(G.q.kind === 'resource'); choose(G, /pebble/); choose(G, /pebble/); eq(G.players[0].res.pebble, 2); eq(G.players[0].res.berry, 0);
});
test('Hoard Cellar: production adds a stack; a worker hauls it all away', () => {
  const G = T.game(2); T.city(G, 0, ['storehouse']); basicW(G, 0, 'basic_berry_patch'); basicW(G, 0, 'basic_berry_patch'); T.cur(G, 0); T.act(G, 0, m => m.type === 'prepare');
  ok(G.q && G.q.kind === 'stock'); choose(G, /3 twigs/); eq(T.entry(G, 0, 'storehouse').stock.twig, 3); eq(G.players[0].res.twig, 0, 'stock is not in supply');
  T.cur(G, 0); T.act(G, 0, m => m.k === 'dest'); eq(G.players[0].res.twig, 3); eq(rsum(T.entry(G, 0, 'storehouse').stock), 0);
});
test('Midsummer Green draws 2 cards each production', () => {
  const G = T.game(2); const [f] = T.hand(G, 0, ['fair_grounds']); T.res(G, 0, { twig: 1, resin: 2, pebble: 1 }); play(G, 0, f, 'pay'); eq(G.players[0].hand.length, 2);
});

// ---------------- traveler cards ----------------
test('Ballad Finch: discard up to 5 cards for a point token each', () => {
  const G = T.game(2); const [b] = T.hand(G, 0, ['bard', 'farm', 'farm', 'farm']); T.res(G, 0, { berry: 3 }); play(G, 0, b, 'pay');
  choose(G, /Discard/); choose(G, /Discard/); choose(G, /Done/); eq(G.players[0].pts, 2); eq(G.players[0].hand.length, 1);
});
test('Mudpie Jester goes into a rival city (not yours) for -2 there; cannot if rival full or already has one', () => {
  const G = T.game(2); const [f] = T.hand(G, 0, ['fool']); T.res(G, 0, { berry: 3 }); play(G, 0, f, 'pay');
  ok(inCity(G, 1, 'fool')); ok(!inCity(G, 0, 'fool')); eq(sc(G, 1).cards, -2); eq(HB.cityCount(G, 1), 1);
  const H2 = T.game(2); T.city(H2, 1, FARM15()); const [f2] = T.hand(H2, 0, ['fool']); T.res(H2, 0, { berry: 3 }); ok(!playable(H2, 0, f2), 'rival city full');
  const H3 = T.game(2); T.city(H3, 1, ['fool']); const [f3] = T.hand(H3, 0, ['fool']); T.res(H3, 0, { berry: 3 }); ok(!playable(H3, 0, f3), 'rival already has one');
  const H4 = T.game(2); H4.players[1].passed = true; const [f4] = T.hand(H4, 0, ['fool']); T.res(H4, 0, { berry: 3 }); ok(playable(H4, 0, f4), 'a passed rival can still be targeted');
});
test('Parcel Dove: reveal 2, may play one worth <= 3 free (other is discarded)', () => {
  const G = T.game(2); const [p] = T.hand(G, 0, ['postal_pigeon']); T.res(G, 0, { berry: 2 }); T.topDeck(G, ['castle', 'mine']);
  play(G, 0, p, 'pay'); ok(G.q.kind === 'pigeon'); ok(!lbl(G).some(l => /Play Stonecrown/.test(l)), '4-point card not allowed'); choose(G, /Play Flintpit/);
  ok(inCity(G, 0, 'mine')); eq(G.players[0].res.pebble, 1, 'it still produces on play'); ok(G.discard.some(id => keyOf(id) === 'castle')); T.inv(G);
});
test('Trailwarden Fox relocates a deployed worker to a new legal spot and resolves it', () => {
  const G = T.game(2); basicW(G, 0, 'basic_twig_heap'); const [r] = T.hand(G, 0, ['ranger']); T.res(G, 0, { berry: 2 });
  play(G, 0, r, 'pay'); ok(G.q && G.q.kind === 'ranger'); choose(G, /Move the worker at Twig Heap/); choose(G, /Resin Pool/);
  eq(G.players[0].dep.length, 1); eq(G.players[0].dep[0].k, 'basic'); eq(D.basic[G.players[0].dep[0].i].key, 'basic_resin_pool'); eq(G.players[0].res.resin, 2);
  T.cur(G, 1); ok(T.find(G, 1, m => m.k === 'basic' && D.basic[m.i].key === 'basic_twig_heap'), 'old spot is free again');
});
test('Hollow Sexton: clear 3 meadow cards, refill, then take 1', () => {
  const G = T.game(2); const [u] = T.hand(G, 0, ['undertaker']); T.res(G, 0, { berry: 2 }); const d0 = G.discard.length;
  play(G, 0, u, 'pay'); for (let i = 0; i < 3; i++) choose(G, /Clear/); eq(G.discard.length, d0 + 3); ok(G.q && G.q.kind === 'meadow'); eq(G.meadow.filter(x => x >= 0).length, 8);
  choose(G, /Take/); eq(G.players[0].hand.length, 1); eq(G.meadow.filter(x => x >= 0).length, 8); T.inv(G);
});
test('Crook Shrew: 3 berries plus tokens on the shrine; if paid with berries they go to a rival, if occupied nothing is paid', () => {
  const G = T.game(2); const [s] = T.hand(G, 0, ['shepherd']); T.res(G, 0, { berry: 3 }); play(G, 0, s, 'pay');
  eq(G.players[1].res.berry, 3, 'rival receives the payment'); eq(G.players[0].res.berry, 3);
  const H2 = T.game(2); T.city(H2, 0, ['chapel']); T.entry(H2, 0, 'chapel').tok = 2; const [s2] = T.hand(H2, 0, ['shepherd']);
  T.act(H2, 0, m => m.card === s2 && m.how === 'occupy'); eq(H2.players[0].res.berry, 3); eq(H2.players[0].pts, 2); eq(H2.players[1].res.berry, 0, 'nothing paid');
});
test('Toppled Hall: raze a construction in a full city, regain its exact cost, draw 2', () => {
  const G = T.game(2); T.city(G, 0, FARM15()); const [r] = T.hand(G, 0, ['ruins']); play(G, 0, r, 'pay'); ok(G.q && G.q.kind === 'ruins');
  choose(G, /Raze Bramble Allotment/); eq(HB.cityCount(G, 0), 15); ok(inCity(G, 0, 'ruins')); eq(G.players[0].res.twig, 2); eq(G.players[0].res.resin, 1); eq(G.players[0].hand.length, 2); T.inv(G);
  const H2 = T.game(2); const [r2] = H2.players[0].hand.length ? T.hand(H2, 0, ['ruins']) : []; ok(!playable(H2, 0, r2), 'no construction to raze');
});

// ---------------- governance ----------------
test('Chronicle Owl, Tallyshop Mouse, Mosswood Assize trigger after another card is played; order is chosen', () => {
  const G = T.game(2); T.city(G, 0, ['historian', 'shopkeeper']); const [w] = T.hand(G, 0, ['wanderer']); T.res(G, 0, { berry: 2 }); T.topDeck(G, ['farm', 'farm', 'farm', 'farm']);
  play(G, 0, w, 'pay'); ok(G.q && G.q.kind === 'trigger', 'two triggers: choose order'); choose(G, /Tallyshop/);
  ok(!G.q); eq(G.players[0].res.berry, 1); eq(G.players[0].hand.length, 4, 'wanderer 3 + historian 1');
  const H2 = T.game(2); T.city(H2, 0, ['courthouse']); const [m] = T.hand(H2, 0, ['mine']); T.res(H2, 0, { twig: 1, resin: 1, pebble: 1 }); play(H2, 0, m, 'pay'); ok(H2.q && H2.q.kind === 'resource'); choose(H2, /pebble/); eq(H2.players[0].res.pebble, 2, 'mine +1, assize +1');
  const H3 = T.game(2); T.city(H3, 0, ['shopkeeper']); const [m3] = T.hand(H3, 0, ['mine']); T.res(H3, 0, { twig: 1, resin: 1, pebble: 1 }); play(H3, 0, m3, 'pay'); eq(H3.players[0].res.berry, 0, 'shopkeeper: critters only');
});
test('the trigger card itself does not trigger on its own play', () => {
  const G = T.game(2); const [h] = T.hand(G, 0, ['historian']); T.res(G, 0, { berry: 2 }); play(G, 0, h, 'pay'); eq(G.players[0].hand.length, 0);
});
test('Hostler Hedgehog: send away to cut 3 berries off a critter', () => {
  const G = T.game(2); T.city(G, 0, ['innkeeper']); const [h] = T.hand(G, 0, ['husband']); T.res(G, 0, {}); ok(playable(G, 0, h)); play(G, 0, h, 'innkeeper');
  ok(inCity(G, 0, 'husband')); ok(!inCity(G, 0, 'innkeeper')); eq(G.discard.filter(id => keyOf(id) === 'innkeeper').length, 1);
  const H2 = T.game(2); T.city(H2, 0, ['innkeeper']); const [m] = T.hand(H2, 0, ['mine']); T.res(H2, 0, {}); ok(!playable(H2, 0, m), 'constructions do not qualify');
});
test('Pulley Lift: dismantle to cut 3 resources of your choice off a construction', () => {
  const G = T.game(2); T.city(G, 0, ['crane']); const [c] = T.hand(G, 0, ['castle']); T.res(G, 0, { twig: 2, resin: 3, pebble: 0 }); play(G, 0, c, 'crane');
  ok(inCity(G, 0, 'castle')); ok(!inCity(G, 0, 'crane')); eq(G.players[0].res.twig + G.players[0].res.resin, 0);
  const H2 = T.game(2); T.city(H2, 0, ['crane']); const [c2] = T.hand(H2, 0, ['palace']); T.res(H2, 0, { twig: 2, resin: 3, pebble: 3 }); play(H2, 0, c2, 'crane');
  ok(H2.q && H2.q.kind === 'waive'); choose(H2, /pebble/); choose(H2, /pebble/); choose(H2, /pebble/); eq(H2.players[0].res.pebble, 3, 'chose to cut pebbles'); eq(H2.players[0].res.twig, 0);
});
test('Gavel Marten: pay one required resource with a different resource', () => {
  const G = T.game(2); T.city(G, 0, ['judge']); const [m] = T.hand(G, 0, ['mine']); T.res(G, 0, { twig: 1, resin: 1, berry: 1 }); play(G, 0, m, 'judge');
  ok(G.q && G.q.kind === 'judge'); choose(G, /Pay 1 berry instead of 1 pebble/); ok(inCity(G, 0, 'mine')); eq(G.players[0].res.berry, 0); eq(G.players[0].res.twig, 0);
});
test('Thornhold Cells: lock a critter beneath it to cut 3 resources; prisoner leaves the city, scores nothing; frees a space', () => {
  const G = T.game(2); T.city(G, 0, ['dungeon', 'husband']); const [c] = T.hand(G, 0, ['castle']); T.res(G, 0, { twig: 2, resin: 3 });
  play(G, 0, c, 'dungeon'); ok(G.q && G.q.kind === 'prisoner'); choose(G, /Lock Goodman/); ok(inCity(G, 0, 'castle')); ok(!inCity(G, 0, 'husband'));
  eq(T.entry(G, 0, 'dungeon').pris.length, 1); eq(sc(G, 0).cards, 4 + 0, 'prisoner scores nothing'); T.inv(G);
  const H2 = T.game(2); T.city(H2, 0, FARM15().slice(0, 12).concat(['dungeon', 'husband', 'twig_barge'])); eq(HB.cityCount(H2, 0), 15);
  const [c2] = T.hand(H2, 0, ['castle']); T.res(H2, 0, { twig: 2, resin: 3 }); play(H2, 0, c2, 'dungeon'); choose(H2, /Lock Goodman/); eq(HB.cityCount(H2, 0), 15); ok(inCity(H2, 0, 'castle'));
});
test('Thornhold Cells: one cell, a second only with a Trailwarden; one prisoner per card played', () => {
  const G = T.game(2); T.city(G, 0, ['dungeon', 'husband', 'wanderer']); const e = T.entry(G, 0, 'dungeon'); e.pris.push(T.take(G, 'chip_sweep'));
  const [c] = T.hand(G, 0, ['castle']); T.res(G, 0, { twig: 2, resin: 3 }); ok(!T.find(G, 0, m => m.card === c && m.how === 'dungeon'), 'cell full');
  T.city(G, 0, ['ranger']); ok(T.find(G, 0, m => m.card === c && m.how === 'dungeon'), 'ranger opens a second cell');
});
test('abilities are exclusive: only one card-playing ability per card', () => {
  const G = T.game(2); T.city(G, 0, ['crane', 'judge']); const [c] = T.hand(G, 0, ['castle']); T.res(G, 0, { twig: 2 });
  ok(!T.find(G, 0, m => m.card === c && m.how === 'crane'), 'needs 3 more than a crane can cut'); T.res(G, 0, { twig: 2, resin: 3 }); play(G, 0, c, 'crane'); ok(inCity(G, 0, 'judge'), 'judge untouched'); ok(!G.q);
});
test('Dewdrop Belfry: 3 tokens on build; spend one before recalling to repeat a spot you occupy; leftovers score 1 each', () => {
  const G = T.game(2); const [t] = T.hand(G, 0, ['clock_tower']); T.res(G, 0, { twig: 3, pebble: 1 }); play(G, 0, t, 'pay'); eq(T.entry(G, 0, 'clock_tower').tok, 3);
  basicW(G, 0, 'basic_twig_heap'); basicW(G, 0, 'basic_berry_patch'); T.cur(G, 0); T.act(G, 0, m => m.type === 'prepare'); ok(G.q && G.q.kind === 'clock');
  choose(G, /repeat Twig Heap/); eq(G.players[0].res.twig, 6); eq(T.entry(G, 0, 'clock_tower').tok, 2); eq(sc(G, 0).tokens, 2); eq(G.players[0].dep.length, 0, 'workers still recalled');
});

// ---------------- destinations ----------------
test('own destination: one worker; Inn lets you play a meadow card for 3 fewer', () => {
  const G = T.game(2); T.city(G, 0, ['inn']); const c = T.meadow(G, 0, 'castle'); T.res(G, 0, { twig: 2, resin: 3 }); T.cur(G, 0); T.act(G, 0, m => m.k === 'dest' && m.c === T.entry(G, 0, 'inn').id);
  ok(G.q && G.q.kind === 'inn'); choose(G, /Play Stonecrown/); ok(inCity(G, 0, 'castle')); eq(G.players[0].res.twig + G.players[0].res.resin + G.players[0].res.pebble, 0);
  T.inv(G);
});
test('Lantern Rest and Dovecote Depot are Open: rivals may visit and the owner takes 1 point token', () => {
  const G = T.game(2); T.city(G, 1, ['inn', 'post_office']); T.meadow(G, 0, 'farm'); T.res(G, 0, { twig: 2 });
  T.cur(G, 0); ok(T.find(G, 0, m => m.k === 'dest' && m.o === 1 && keyOf(m.c) === 'inn'), 'rival inn open'); T.hand(G, 0, ['farm', 'farm']);
  T.act(G, 0, m => m.k === 'dest' && keyOf(m.c) === 'inn'); eq(G.players[1].pts, 1); choose(G, /Play/);
  T.cur(G, 0); T.hand(G, 0, ['farm', 'farm', 'mine']); T.act(G, 0, m => m.k === 'dest' && keyOf(m.c) === 'post_office'); eq(G.players[1].pts, 2);
  const H2 = T.game(2); T.city(H2, 1, ['chapel', 'lookout']); T.cur(H2, 0); ok(!T.find(H2, 0, m => m.k === 'dest'), 'other destinations are closed to rivals');
});
test('a passed player still has an Open card others can visit', () => {
  const G = T.game(2); T.city(G, 1, ['post_office']); G.players[1].passed = true; T.cur(G, 0); ok(T.find(G, 0, m => m.k === 'dest' && keyOf(m.c) === 'post_office'));
});
test('Dovecote Depot needs 2+ cards; gives 2 to a rival, discard extras, refill to 8', () => {
  const G = T.game(2); T.city(G, 0, ['post_office']); T.hand(G, 0, ['farm']); ok(!T.find(G, 0, m => m.k === 'dest'), 'needs 2 cards');
  T.hand(G, 0, ['farm', 'mine', 'castle', 'palace']); const h1 = G.players[1].hand.length;
  T.act(G, 0, m => m.k === 'dest'); choose(G, /Give Flintpit/); choose(G, /Give Stonecrown/); eq(G.players[1].hand.length, h1 + 2); choose(G, /Discard/); choose(G, /Done/);
  eq(G.players[0].hand.length, 8); T.inv(G);
});
test('cards given to a rival whose hand is full are discarded', () => {
  const G = T.game(2); T.city(G, 0, ['post_office']); T.hand(G, 0, ['farm', 'mine']); T.hand(G, 1, JUNK8); const d = G.discard.length;
  T.act(G, 0, m => m.k === 'dest'); choose(G, /Give/); choose(G, /Give/); eq(G.players[1].hand.length, 8); ok(G.discard.length >= d + 2);
});
test('Thistle Regent: play a card worth <= 3 base points from hand or meadow for free', () => {
  const G = T.game(2); T.city(G, 0, ['queen']); const [c, f] = T.hand(G, 0, ['castle', 'farm']); const m = T.meadow(G, 2, 'palace'); const t = T.meadow(G, 3, 'mine');
  T.act(G, 0, x => x.k === 'dest'); ok(G.q.kind === 'queen'); eq(G.q.opts.some(o => o.card === c), false); eq(G.q.opts.some(o => o.card === m), false); ok(G.q.opts.some(o => o.card === t)); ok(G.q.opts.some(o => o.card === f));
  choose(G, /Flintpit/); ok(inCity(G, 0, 'mine')); eq(G.players[0].res.pebble, 1, 'production fires'); ok(G.meadow[3] >= 0 && G.meadow[3] !== t);
});
test('Mossgrave Glade: worker stays for ever; reveal 4, play one free, discard the rest; 2nd slot needs Hollow Sexton', () => {
  const G = T.game(2); T.city(G, 0, ['cemetery']); T.topDeck(G, ['farm', 'mine', 'castle', 'palace']); T.cur(G, 0); T.act(G, 0, m => m.k === 'dest');
  choose(G, /deck/); ok(G.q.kind === 'cemetery'); choose(G, /Play Flintpit/); ok(inCity(G, 0, 'mine')); ok(G.discard.filter(id => ['farm', 'castle', 'palace'].includes(keyOf(id))).length === 3); T.inv(G);
  ok(G.players[0].dep[0].perm); basicW(G, 0, 'basic_berry_patch'); T.cur(G, 0); T.act(G, 0, m => m.type === 'prepare'); eq(G.players[0].dep.length, 1);
  T.cur(G, 0); ok(!T.find(G, 0, m => m.k === 'dest'), 'one plot'); T.city(G, 0, ['undertaker']); ok(T.find(G, 0, m => m.k === 'dest'), 'second plot with undertaker');
});
test('Quietstone Cloister: worker stays for ever, give 2 resources to a rival, take 4 point tokens; Brother Moss opens slot 2', () => {
  const G = T.game(2); T.city(G, 0, ['monastery', 'monk']); T.res(G, 0, { twig: 2, berry: 1 }); T.cur(G, 0); T.act(G, 0, m => m.k === 'dest');
  choose(G, /twig/); choose(G, /twig/); eq(G.players[1].res.twig, 2); eq(G.players[0].pts, 4); ok(G.players[0].dep[0].perm);
  T.cur(G, 0); T.res(G, 0, { twig: 2 }); ok(T.find(G, 0, m => m.k === 'dest'), 'second slot (monk)');
});
test('Lorewood College: disband a card, regain its exact cost, +1 resource of choice, +1 point', () => {
  const G = T.game(2); T.city(G, 0, ['university', 'castle']); T.cur(G, 0); T.act(G, 0, m => m.k === 'dest'); choose(G, /Disband Stonecrown/);
  eq(G.players[0].res.twig, 2); eq(G.players[0].res.resin, 3); eq(G.players[0].res.pebble, 3); eq(G.players[0].pts, 1); choose(G, /berry/); eq(G.players[0].res.berry, 1); ok(!inCity(G, 0, 'castle'));
});
test('Candlewick Shrine: add a token, then draw 2 per token on it (hand limit applies)', () => {
  const G = T.game(2); T.city(G, 0, ['chapel']); T.hand(G, 0, []); T.cur(G, 0); T.act(G, 0, m => m.k === 'dest'); eq(T.entry(G, 0, 'chapel').tok, 1); eq(G.players[0].hand.length, 2);
  basicW(G, 0, 'basic_berry_patch'); T.cur(G, 0); T.act(G, 0, m => m.type === 'prepare'); T.cur(G, 0); T.act(G, 0, m => m.k === 'dest'); eq(T.entry(G, 0, 'chapel').tok, 2); eq(G.players[0].hand.length, 6 + 0, '2 + 1 (basic) ... ');
});
test('Spyglass Perch: copy any basic or forest spot even when occupied', () => {
  const G = T.game(2); T.city(G, 0, ['lookout']); basicW(G, 1, 'basic_twig_heap'); T.cur(G, 0); T.act(G, 0, m => m.k === 'dest'); choose(G, /Twig Heap/); eq(G.players[0].res.twig, 3);
  const H2 = T.game(2); T.city(H2, 0, ['lookout']); setForest(H2, ['forest_bumper_bramble', 'forest_sapwell_copse', 'forest_berry_thicket']); forestW(H2, 1, 0); T.cur(H2, 0); T.act(H2, 0, m => m.k === 'dest'); choose(H2, /Bumper Bramble/); eq(H2.players[0].res.berry, 3);
});

// ---------------- events ----------------
test('basic events: need the cards in the city; only one player ever; worker returns at prepare; kept if cards later leave', () => {
  const G = T.game(2); T.city(G, 0, ['farm', 'mine', 'resin_refinery', 'twig_barge']);
  const mv = T.find(G, 0, m => m.k === 'event' && m.e === 'b'); ok(mv, 'Harvest Gathering available'); T.cur(G, 0); T.act(G, 0, m => m.k === 'event');
  eq(G.bev.filter(e => e.o === 0).length, 1); T.cur(G, 1); T.city(G, 1, ['farm', 'mine', 'resin_refinery', 'twig_barge']); ok(!T.find(G, 1, m => m.k === 'event'), 'already claimed');
  eq(sc(G, 0).events, 3); basicW(G, 0, 'basic_berry_patch'); X.withG(G, () => { const e = X.removeFromCity(0, T.entry(G, 0, 'farm').id); G.discard.push(e.id); }); eq(sc(G, 0).events, 3);
  T.cur(G, 0); T.act(G, 0, m => m.type === 'prepare'); eq(G.players[0].dep.length, 0, 'event worker recalled'); T.inv(G);
  const H2 = T.game(2); T.city(H2, 0, ['farm', 'mine', 'resin_refinery']); ok(!T.find(H2, 0, m => m.k === 'event'), 'only 3 production');
  const H3 = T.game(2); T.city(H3, 0, ['inn', 'chapel', 'lookout']); ok(T.find(H3, 0, m => m.k === 'event' && D.basicEvents[H3.bev[m.i].k].need.destination), 'three destinations');
  const H4 = T.game(2); T.city(H4, 0, ['historian', 'crane', 'courthouse']); ok(T.find(H4, 0, m => m.k === 'event' && D.basicEvents[H4.bev[m.i].k].need.governance));
  const H5 = T.game(2); T.city(H5, 0, ['bard', 'wanderer', 'ranger']); ok(T.find(H5, 0, m => m.k === 'event' && D.basicEvents[H5.bev[m.i].k].need.traveler));
});
test('a worker may not be placed on an event you cannot achieve', () => {
  const G = T.game(2); ok(!T.find(G, 0, m => m.k === 'event'));
});
const specialSetup = (keys, cards, np) => { const G = T.game(np || 2); setSev(G, keys); T.city(G, 0, cards); T.cur(G, 0); return G; };
const claimS = (G, i) => T.act(G, 0, m => m.k === 'event' && m.e === 's' && m.i === (i || 0));
test('special: Grand Market Scheme gives up to 3 resources to rivals for 2 point tokens each', () => {
  const G = specialSetup(['sev_grand_market_scheme'], ['shopkeeper', 'post_office']); T.res(G, 0, { twig: 2, pebble: 2 }); claimS(G);
  choose(G, /Give 1 twig/); choose(G, /Give 1 pebble/); choose(G, /Give 1 pebble/); ok(!G.q); eq(G.players[0].pts, 6); eq(G.players[1].res.pebble, 2); eq(G.players[1].res.twig, 1);
});
test('special: Hurry-Scurry Dash returns a deployed worker at once; worth 4', () => {
  const G = specialSetup(['sev_hurry_scurry_dash'], ['chip_sweep', 'clock_tower']); basicW(G, 0, 'basic_berry_patch'); T.cur(G, 0); claimS(G); ok(G.q.kind === 'recall'); choose(G, /Berry Patch/);
  eq(G.players[0].dep.length, 1); eq(sc(G, 0).events, 4);
});
test('special: Night of Sparklers and Resident Minstrel stack up to 3 twigs/berries, 2 points each', () => {
  const G = specialSetup(['sev_night_of_sparklers', 'sev_resident_minstrel'], ['lookout', 'miner_mole', 'inn', 'bard']); T.res(G, 0, { twig: 5, berry: 4 });
  claimS(G, 0); choose(G, /Place 3 twigs/); eq(G.players[0].res.twig, 2); eq(sc(G, 0).events, 6);
  T.cur(G, 0); G.players[0].workers = 4; claimS(G, 1); choose(G, /Place 2 berries/); eq(sc(G, 0).events, 6 + 4);
});
test('special: Lost Parchments Unearthed reveals 5 cards, keep in hand or tuck beneath (1 point each)', () => {
  const G = specialSetup(['sev_lost_parchments_unearthed'], ['historian', 'ruins']); T.hand(G, 0, []); claimS(G);
  choose(G, /Keep/); choose(G, /Tuck/); choose(G, /Tuck/); choose(G, /Keep/); choose(G, /Tuck/); ok(!G.q); eq(G.players[0].hand.length, 2); eq(G.sev[0].tuck.length, 3); eq(sc(G, 0).events, 3); T.inv(G);
});
test('special: Acorn Bandits Seized tucks up to 2 critters from the city, 3 points each', () => {
  const G = specialSetup(['sev_acorn_bandits_seized'], ['courthouse', 'ranger', 'husband', 'farm']); claimS(G);
  choose(G, /Tuck Trailwarden/); choose(G, /Tuck Goodman/); ok(!G.q); eq(sc(G, 0).events, 6); ok(!inCity(G, 0, 'ranger')); T.inv(G);
});
test('special: Marsh Fever Remedy costs 2 berries and 2 city cards, worth 6', () => {
  const G = specialSetup(['sev_marsh_fever_remedy'], ['undertaker', 'barge_toad', 'farm']); T.cur(G, 0); ok(!T.find(G, 0, m => m.k === 'event'), 'needs 2 berries'); T.res(G, 0, { berry: 2 });
  claimS(G); choose(G, /Discard Bramble Allotment/); choose(G, /Discard Reedpunt/); eq(G.players[0].res.berry, 0); eq(G.players[0].city.length, 1); eq(sc(G, 0).events, 6); T.inv(G);
});
test('special: Wingborne Healers scores 3 per Husband+Wife pair in every city', () => {
  const G = specialSetup(['sev_wingborne_healers'], ['doctor', 'postal_pigeon', 'husband', 'wife']); T.city(G, 1, ['husband', 'wife']); claimS(G); eq(sc(G, 0).events, 6);
});
test('special: Commencement of Pupils tucks up to 3 critters from hand, 2 points each', () => {
  const G = specialSetup(['sev_commencement_of_pupils'], ['teacher', 'university']); T.hand(G, 0, ['farm', 'bard', 'wanderer', 'ranger', 'monk']); claimS(G);
  choose(G, /Tuck Ballad/); choose(G, /Tuck Footsore/); choose(G, /Tuck Trailwarden/); ok(!G.q); eq(sc(G, 0).events, 6); eq(G.players[0].hand.length, 2);
});
test('special: Counsel for Scoundrels (prisoners), Pilgrims Trail (cloister workers), Vigil of Remembrance (grove workers)', () => {
  let G = specialSetup(['sev_counsel_for_scoundrels'], ['monk', 'dungeon']); claimS(G); T.entry(G, 0, 'dungeon').pris.push(T.take(G, 'bard')); eq(sc(G, 0).events, 3);
  G = specialSetup(['sev_pilgrims_trail'], ['monastery', 'wanderer', 'monk']); G.players[0].dep.push({ k: 'dest', o: 0, c: T.entry(G, 0, 'monastery').id, perm: true }); G.players[0].workers = 3; claimS(G); eq(sc(G, 0).events, 3);
  G = specialSetup(['sev_vigil_of_remembrance'], ['cemetery', 'shepherd']); G.players[0].dep.push({ k: 'dest', o: 0, c: T.entry(G, 0, 'cemetery').id, perm: true }); G.players[0].workers = 3; claimS(G); eq(sc(G, 0).events, 3);
});
test('special: Gilded Shrine Vault draws and gains per token on the shrine; 2 points per token', () => {
  const G = specialSetup(['sev_gilded_shrine_vault'], ['woodcarver', 'chapel']); T.entry(G, 0, 'chapel').tok = 2; T.hand(G, 0, []); claimS(G);
  eq(G.players[0].hand.length, 2); choose(G, /twig/); choose(G, /twig/); eq(G.players[0].res.twig, 2); eq(sc(G, 0).events, 4);
});
test('special: Toll Holiday runs all production cards; worth 3', () => {
  const G = specialSetup(['sev_toll_holiday'], ['judge', 'queen', 'farm', 'mine']); claimS(G); eq(G.players[0].res.berry, 1); eq(G.players[0].res.pebble, 1); eq(sc(G, 0).events, 3);
});
test('special: Grand Hollow Games needs 2 cards of each colour; worth 9', () => {
  let G = specialSetup(['sev_grand_hollow_games'], ['farm', 'mine', 'bard', 'wanderer', 'historian', 'crane', 'castle', 'palace', 'inn']); T.cur(G, 0); ok(!T.find(G, 0, m => m.k === 'event' && m.e === 's'), 'only one red');
  T.city(G, 0, ['chapel']); claimS(G); eq(sc(G, 0).events, 9);
});
test('special: Change of Proprietors stacks up to 3 resources (berry/twig 1, resin/pebble 2 points)', () => {
  const G = specialSetup(['sev_change_of_proprietors'], ['peddler', 'general_store']); T.res(G, 0, { berry: 1, resin: 1, pebble: 1 }); claimS(G);
  choose(G, /resin/); choose(G, /pebble/); choose(G, /berry/); eq(sc(G, 0).events, 5);
});
test('special event: a second player cannot claim an achieved event', () => {
  const G = specialSetup(['sev_toll_holiday'], ['judge', 'queen']); claimS(G); T.city(G, 1, ['judge', 'queen']); T.cur(G, 1); ok(!T.find(G, 1, m => m.k === 'event' && m.e === 's'));
});

// ---------------- scoring ----------------
test('scoring: base points, point tokens, tokens on cards, Fool -2', () => {
  const G = T.game(2); T.city(G, 0, ['farm', 'castle', 'fool']); G.players[0].pts = 3; T.entry(G, 0, 'castle');
  const s = sc(G, 0); eq(s.cards, 1 + 4 - 2); eq(s.tokens, 3); eq(s.total, 3 + 3 + s.bonus);
});
test('scoring: purple bonuses (Castle, Palace, School, Theater, Elderheart Oak, King, Architect, Wife)', () => {
  const G = T.game(2); T.city(G, 0, ['castle', 'palace', 'school', 'theater', 'ever_tree', 'king', 'architect', 'farm', 'farm', 'mine', 'husband', 'wife', 'bard', 'wanderer', 'teacher']);
  G.bev[0].o = 0; G.bev[1].o = 0; G.sev[0].o = 0; G.players[0].res.resin = 3; G.players[0].res.pebble = 5;
  const s = sc(G, 0);
  const commonConstr = 3 /*farm,farm,mine*/, uniqConstr = 5 /*castle palace school theater ever_tree*/, commonCrit = 3 /*husband wife teacher... */, uniqCrit = 4 /*king architect bard? */;
  // castle: common constructions = farm,farm,mine => 3 ; palace: unique constructions = castle,palace,school,theater,ever_tree => 5 ; school: common critters = husband,wife,wanderer,teacher => 4
  // theater: unique critters = king,architect,bard => 3 ; elderheart oak: purple = castle palace school theater ever_tree king architect wife => 8 ; king: 2 basic + 1 special*2 = 4 ; architect min(6,8)=6 ; wife 3
  eq(s.bonus, 3 + 5 + 4 + 3 + 8 + 4 + 6 + 3);
});
test('scoring: leftover resources only count through Architect (max 6)', () => {
  const G = T.game(2); T.city(G, 0, ['architect']); G.players[0].res.resin = 2; G.players[0].res.pebble = 1; eq(sc(G, 0).bonus, 3); G.players[0].res.pebble = 9; eq(sc(G, 0).bonus, 6);
  T.city(G, 0, ['storehouse']); T.entry(G, 0, 'storehouse').stock.pebble = 5; eq(sc(G, 0).bonus, 6);
});
test('end of game: when every player has passed; winner by points, then events, then resources', () => {
  const G = T.game(2); T.city(G, 0, ['farm']); T.city(G, 1, ['farm']);
  T.cur(G, 0); T.act(G, 0, { type: 'pass' }); eq(G.phase, 'play'); eq(G.cur, 1); T.act(G, 1, { type: 'pass' }); eq(G.phase, 'over'); ok(G.over.tie || G.over.winner === 0);
  const H2 = T.game(2); T.city(H2, 0, ['farm']); T.city(H2, 1, ['farm']); H2.bev[0].o = -1; H2.players[1].res.twig = 4; H2.players[0].pts = 1; H2.players[1].pts = 1;
  T.act(H2, 0, { type: 'pass' }); T.act(H2, 1, { type: 'pass' }); eq(H2.over.winner, 1, 'more leftover resources breaks the tie');
  const H3 = T.game(2); T.city(H3, 0, ['farm']); T.city(H3, 1, ['farm']); H3.players[0].pts = 3; H3.players[1].pts = 3; H3.players[0].res.twig = 4; H3.bev[0].o = 1; H3.players[1].pts = 0; H3.players[0].pts = 0;
  H3.players[0].pts = 3; T.act(H3, 0, { type: 'pass' }); T.act(H3, 1, { type: 'pass' }); eq(H3.over.winner, 1, 'higher score first');
  const H4 = T.game(2); H4.bev[0].o = 0; H4.players[0].pts = 0; H4.players[1].pts = 3; T.act(H4, 0, { type: 'pass' }); T.act(H4, 1, { type: 'pass' }); eq(H4.over.scores[0].total, 3); eq(H4.over.scores[1].total, 3); eq(H4.over.winner, 0, 'tie on points: most events');
});
test('a passed player is skipped; the others keep taking turns', () => {
  const G = T.game(3); T.act(G, 0, { type: 'pass' }); eq(G.cur, 1); T.act(G, 1, { type: 'pass' }); eq(G.cur, 2); basicW(G, 2, 'basic_berry_patch'); eq(G.cur, 2, 'only seat 2 remains'); eq(G.phase, 'play');
});

// ---------------- pending decisions ----------------
test('a pending decision belongs to one seat and appears only in that seat\'s moves', () => {
  const G = T.game(2); const [t] = T.hand(G, 0, ['teacher']); T.res(G, 0, { berry: 2 }); play(G, 0, t, 'pay'); ok(G.q); eq(G.q.who, 0); eq(HB.moves(G, 1).length, 0);
  ok(HB.moves(G, 0).every(m => m.type === 'choose')); eq(HB.actor(G), 0); ok(HB.moves(G, 0).every(m => typeof m.label === 'string' && m.label.length));
});

// ---------------- solo ----------------
test('solo: after each card you play the automa rolls a d8 and plays that meadow slot into his city; meadow refills', () => {
  const G = T.solo(1); const [f] = T.hand(G, 0, ['farm']); T.res(G, 0, { twig: 2, resin: 1 }); const before = G.meadow.slice(); play(G, 0, f, 'pay');
  eq(G.grim.city.length, 1); const slot = before.findIndex((id, i) => G.meadow[i] !== id); ok(slot >= 0); eq(G.grim.city[0], before[slot]); eq(G.meadow.filter(x => x >= 0).length, 8); eq(G.cur, 0); T.inv(G);
});
test('solo: his prepare moves forest/basic workers, blocks meadow slots 1,2,3+4, journey by level', () => {
  const G = T.solo(2); basicW(G, 0, 'basic_berry_patch'); basicW(G, 0, 'basic_berry_patch'); T.cur(G, 0); T.act(G, 0, m => m.type === 'prepare');
  eq(G.grim.fi, 1); eq(D.basic[G.grim.bi].key, 'basic_resin_pool'); eq(G.grim.mb.join(), '0');
  for (let i = 0; i < 3; i++) basicW(G, 0, 'basic_berry_patch'); T.cur(G, 0); T.act(G, 0, m => m.type === 'prepare'); if (G.q) T.finish(G);
  eq(G.grim.fi, 2); eq(D.basic[G.grim.bi].key, 'basic_pebble_bank'); eq(G.grim.mb.join(), '0,1');
  for (let i = 0; i < 4; i++) basicW(G, 0, 'basic_berry_patch'); T.cur(G, 0); T.act(G, 0, m => m.type === 'prepare');
  eq(G.grim.fi, -1); eq(G.grim.ji, 1, 'level 2: the 4-point spot'); eq(G.grim.mb.join(), '0,1,2,3'); eq(D.basic[G.grim.bi].key, 'basic_dewberry_nook');
  T.cur(G, 0); const ms = HB.moves(G, 0); ok(!ms.some(m => m.k === 'journey' && m.i === 1), 'his journey spot is blocked');
  for (const m of ms.filter(m => m.type === 'play' && m.from === 'meadow')) { const slot = G.meadow.indexOf(m.card); ok(slot > 3, 'blocked meadow slots cannot be played'); }
});
test('solo year 3 (Ghastly): the automa removes one of your workers for good (5 workers in autumn)', () => {
  const G = T.solo(3); G.players[0].season = 2; G.players[0].workers = 4; G.grim.mb = [0, 1];
  for (let i = 0; i < 4; i++) basicW(G, 0, 'basic_berry_patch'); T.cur(G, 0); T.act(G, 0, m => m.type === 'prepare'); eq(G.players[0].workers, 5); eq(G.players[0].lost, 1); eq(G.grim.bi, -1);
});
test('solo scoring: 2 per card (3 per purple), 3 per basic event he claims, per unclaimed special event, journey, tokens; tie is your loss', () => {
  const G = T.solo(1); G.grim.city = [T.take(G, 'farm'), T.take(G, 'castle'), T.take(G, 'mine')]; G.grim.pts = 2; G.bev[0].o = 'G'; G.grim.ji = 2;
  const s = HB.grimScore(G); eq(s.cards, 3); eq(s.total, 2 + 3 + 2 + 3 + 4 * 3 + 3 + 2, '7 + 3 + special 4x3 + journey 3 + tokens 2');
  const H = T.solo(2); H.grim.city = []; H.grim.ji = 1; eq(HB.grimScore(H).total, 4 * 6 + 4);
  const E = T.solo(1); E.sev.forEach(e => e.o = 0); E.grim.city = []; E.grim.ji = -1; E.players[0].pts = 6; const P0 = sc(E, 0).total;
  E.grim.pts = P0; T.cur(E, 0); T.act(E, 0, { type: 'pass' }); ok(E.over); eq(E.over.grim.total, P0); eq(E.over.win, false, 'tie = loss');
  const F = T.solo(1); F.sev.forEach(e => e.o = 0); F.players[0].pts = 6; const P1 = sc(F, 0).total; F.grim.pts = P1 - 1; T.act(F, 0, { type: 'pass' }); eq(F.over.win, true, 'strictly more wins');
});
test('solo: he claims basic events he qualifies for at his prepare and at game end', () => {
  const G = T.solo(1); G.grim.city = ['farm', 'mine', 'resin_refinery', 'twig_barge'].map(k => T.take(G, k)); basicW(G, 0, 'basic_berry_patch'); basicW(G, 0, 'basic_berry_patch'); T.cur(G, 0); T.act(G, 0, m => m.type === 'prepare');
  ok(G.bev.some(e => e.o === 'G'), 'claimed at prepare');
  const H = T.solo(1); H.grim.city = ['bard', 'wanderer', 'ranger'].map(k => T.take(H, k)); T.act(H, 0, { type: 'pass' }); ok(H.bev.some(e => e.o === 'G'), 'claimed at game end');
});
test('solo: gifts to the automa are discarded; Inn and Dovecote Depot in his city may be visited (he gains 1 point token)', () => {
  const G = T.solo(1); G.grim.city = [T.take(G, 'post_office')]; T.hand(G, 0, ['farm', 'mine']); const d = G.discard.length;
  T.act(G, 0, m => m.k === 'dest' && m.o === 'G'); eq(G.grim.pts, 1); choose(G, /Give/); choose(G, /Give/); ok(G.discard.length >= d + 2);
  const H = T.solo(1); const [t] = T.hand(H, 0, ['teacher']); T.res(H, 0, { berry: 2 }); play(H, 0, t, 'pay'); choose(H, /Keep/); eq(H.players[0].hand.length, 1);
  const K = T.solo(1); const [m] = T.hand(K, 0, ['monk']); T.res(K, 0, { berry: 3 }); play(K, 0, m, 'pay'); choose(K, /Give 1 berry/); eq(K.players[0].pts, 2);
});
test('solo: playing a Fool discards it and removes one card from his city (no roll)', () => {
  const G = T.solo(1); G.grim.city = [T.take(G, 'farm'), T.take(G, 'mine')]; const [f] = T.hand(G, 0, ['fool']); T.res(G, 0, { berry: 3 }); play(G, 0, f, 'pay'); ok(G.q && G.q.kind === 'banish'); choose(G, /Remove/);
  eq(G.grim.city.length, 1); ok(!inCity(G, 0, 'fool')); T.inv(G);
});
test('solo: Echo Mole may copy a production card in his city', () => {
  const G = T.solo(1); G.grim.city = [T.take(G, 'farm'), T.take(G, 'farm'), T.take(G, 'barge_toad')]; const [m] = T.hand(G, 0, ['miner_mole']); T.res(G, 0, { berry: 3 }); play(G, 0, m, 'pay'); choose(G, /Reedpunt/);
  eq(G.players[0].res.twig, 4);
});
test('solo: when he rolls a Fool it goes into your city (skipped if you are full)', () => {
  const setup = (full) => {
    const G = T.solo(1, 31); if (full) T.city(G, 0, FARM15()); const [m] = T.hand(G, 0, [full ? 'wanderer' : 'mine']); T.res(G, 0, full ? { berry: 2 } : { twig: 1, resin: 1, pebble: 1 });
    const slot = X.withG(JSON.parse(JSON.stringify(G)), () => X.rnd(8)); const f = T.take(G, 'fool'); G.discard.push(G.meadow[slot]); G.meadow[slot] = f; return { G, m, f, slot };
  };
  let { G, m, f } = setup(false); play(G, 0, m, 'pay'); ok(G.players[0].city.some(e => e.id === f), 'the jester lands in your city'); eq(sc(G, 0).cards, 2 + (-2), 'mine 2 + jester -2'); ok(G.grim.city.every(id => keyOf(id) !== 'fool')); T.inv(G);
  ({ G, m, f } = setup(true)); play(G, 0, m, 'pay'); ok(!G.players[0].city.some(e => e.id === f), 'full city: he skips'); ok(G.meadow.includes(f), 'the jester stays in the meadow'); T.inv(G);
});
test('solo: Parcel Dove play counts as two cards played (he rolls twice)', () => {
  const G = T.solo(1); const [p] = T.hand(G, 0, ['postal_pigeon']); T.res(G, 0, { berry: 2 }); T.topDeck(G, ['mine', 'farm']); play(G, 0, p, 'pay'); choose(G, /Play Flintpit/);
  eq(G.grim.city.length, 2, 'two rolls: the dove and the card it played');
});

// ---------------- the remaining special rules ----------------
test('free plays (Queen, Dove, Grove) ignore cost entirely and still need city space', () => {
  const G = T.game(2); T.city(G, 0, ['queen'].concat(FARM15().slice(0, 14))); eq(HB.cityCount(G, 0), 15); T.hand(G, 0, ['general_store']); T.cur(G, 0);
  ok(!T.find(G, 0, m => m.k === 'dest'), 'queen has nothing placeable (full city)');
});
test('Ruins in the city counts as a construction for Mosswood Assize and can be occupied by Haggle Magpie', () => {
  const G = T.game(2); T.city(G, 0, ['ruins']); const [p] = T.hand(G, 0, ['peddler']); ok(T.find(G, 0, m => m.card === p && m.how === 'occupy'));
});
test('exact one-token rule: Elderheart Oak and the linked construction offer separate occupy moves', () => {
  const G = T.game(2); T.city(G, 0, ['farm', 'ever_tree']); const [h] = T.hand(G, 0, ['husband']); eq(HB.moves(G, 0).filter(m => m.card === h && m.how === 'occupy').length, 2);
});
test('worker on a destination is recalled at prepare (non-permanent)', () => {
  const G = T.game(2); T.city(G, 0, ['chapel']); T.cur(G, 0); T.act(G, 0, m => m.k === 'dest'); basicW(G, 0, 'basic_berry_patch'); T.cur(G, 0); T.act(G, 0, m => m.type === 'prepare'); eq(G.players[0].dep.length, 0);
});
test('invariants hold after a long random game with every pending decision answered', () => {
  const G = T.game(3, { seed: 12 }); let n = 0; let r = 3;
  while (G.phase !== 'over' && n++ < 3000) { const a = HB.actor(G); const ms = HB.moves(G, a); r = (r * 1103515245 + 12345) >>> 0; const nm = ms.filter(m => m.type !== 'pass'); const m = nm.length ? nm[r % nm.length] : ms[0]; ok(HB.apply(G, m).ok); T.inv(G); }
  ok(G.phase === 'over', 'finishes');
});

test('log speaks to "You" in the second person (You place / You prepare / You pass, never "You places")', () => {
  const G = HB.newGame({ players: [{ name: 'You' }, { name: 'Bramble' }], seed: 5 }); let n = 0, r = 9;
  while (G.phase !== 'over' && n++ < 3000) { const a = HB.actor(G); const ms = HB.moves(G, a); r = (r * 1103515245 + 12345) >>> 0; const nm = ms.filter(m => m.type !== 'pass'); HB.apply(G, nm.length && n < 2500 ? nm[r % nm.length] : ms[0]); }
  const bad = G.log.map(x => x.t).filter(t => /\bYou (?!pass\b)\w+s\b/.test(t) && !/\bYou (has|is)\b/.test(t) || /\bYou (has|is|wins|goes)\b/.test(t));
  ok(!bad.length, 'third-person verbs for You: ' + bad.slice(0, 3).join(' | '));
});

console.log('\nrules-test: ' + pass + ' passed, ' + fail + ' failed (' + (pass + fail) + ' tests)');
process.exit(fail ? 1 : 0);

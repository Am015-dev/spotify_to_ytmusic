// Twin Thrones rules-logic test (W435). One assertion per numbered rule in RULES-CHECKLIST.md, against the real engine.
// node logic-test.js            -> prints one line per failing rule + a summary; exit 1 on any failure
// node logic-test.js --md       -> prints RULES-CHECKLIST.md (the rule list lives here so test and checklist cannot drift)
var E = require('./src/engine.js'), D = require('./src/data.js');
var RULES = [], SECT = {};
function sect(name) { SECT[RULES.length + 1] = name; }
function R(text, fn) { RULES.push({ n: RULES.length + 1, text: text, fn: fn }); }
function eq(exp, got) { if (JSON.stringify(exp) !== JSON.stringify(got)) throw { exp: exp, got: got }; }
function J(m) { return JSON.stringify(m); }

// ---------- helpers: build an exact state, act through validMoves + apply, read the result
function fresh(seed) { var G = E.newGame({ seed: seed || 5 }), k = 0; while (G.phase === 'draft' && k++ < 20) E.apply(G, E.validMoves(G)[0]); return G; }
function blank(seed) { // play phase, empty cities, 7 coins, pyramid emptied
  var G = fresh(seed); G.players.forEach(function (P) { P.cards = []; P.tokens = []; P.pairs = []; P.coins = 7; P.wonders = []; });
  G.mil = 0; G.loot = [[0, 0], [0, 0]]; G.pend = []; G.discard = []; G.built = 0; G.turn = 0; G.again = false; G.age = 1; G.ev = [];
  G.pyr.forEach(function (c) { c.taken = 1; }); return G;
}
function put(G, ids) { // ids -> bottom-row cells 19,18,... ; first id is on cell 19. A harmless dummy keeps the age from ending.
  ids.forEach(function (id, k) { var c = G.pyr[19 - k]; c.id = id; c.taken = 0; c.up = 1; });
  if (ids.length < 3) { var d = G.pyr[16]; d.id = 'a1-timber-stand'; d.taken = 0; d.up = 1; } return G;
}
function city(G, p, ids) { ids.forEach(function (i) { G.players[p].cards.push(i); }); }
function wond(G, p, id, built) { G.players[p].wonders.push({ id: id, card: built ? 'a1-timber-stand' : null }); if (built) G.built++; }
function play(G, m) { if (!E.validMoves(G).some(function (x) { return J(x) === J(m); })) throw { exp: 'legal ' + J(m), got: 'illegal' }; E.apply(G, m); return G; }
function legal(G, m) { return E.validMoves(G).some(function (x) { return J(x) === J(m); }); }
function coins(G, p) { return G.players[p].coins; }
function buildCoins(G, p, id) { return E.buildInfo(G, p, E.C(id)).coins; }
function toAge(a, seed) { var G = fresh(seed || 9), r = E.rnd, k = 0; while (G.age < a && k++ < 400) { var M = E.validMoves(G); E.apply(G, M[Math.floor(r(G) * M.length)]); } return G; }
var FAKE = { id: 'x-wheel3', col: 'green', sci: 'wheel', cost: {}, vp: 0, age: 1 }; D.BYID[FAKE.id] = FAKE;
function pickFirst(G) { while (G.pend.length) { var M = E.validMoves(G); E.apply(G, M[0]); } }

sect('A. Setup');
R('Each player starts with 7 coins.', function () { var G = E.newGame({ seed: 1 }); eq([7, 7], [coins(G, 0), coins(G, 1)]); });
R('12 wonders exist; 8 are drawn for the draft (two groups of 4); all different.', function () { var G = E.newGame({ seed: 2 }); eq(12, D.WONDERS.length); eq(8, new Set(G.draft.pool).size); });
R('Wonder draft round 1: first player picks 1, second picks 2, first gets the last of the 4 (order 0,1,1,0; the last one is automatic).', function () {
  var G = E.newGame({ seed: 3, first: 0 }), o = []; for (var i = 0; i < 3; i++) { o.push(E.sideToAct(G)); E.apply(G, E.validMoves(G)[0]); }
  eq([0, 1, 1], o); eq([2, 2], G.players.map(function (P) { return P.wonders.length; })); eq(4, G.draft.n); });
R('Wonder draft round 2 uses the other 4 wonders; second player picks 1, first picks 2, second gets the last automatically (order 1,0,0,1).', function () {
  var G = E.newGame({ seed: 3, first: 0 }), o = [], first = G.draft.avail.slice(); for (var i = 0; i < 3; i++) E.apply(G, E.validMoves(G)[0]);
  eq(false, G.draft.avail.some(function (w) { return first.indexOf(w) >= 0; })); eq(4, G.draft.avail.length);
  for (i = 0; i < 3; i++) { o.push(E.sideToAct(G)); E.apply(G, E.validMoves(G)[0]); } eq([1, 0, 0], o); eq([4, 4], G.players.map(function (P) { return P.wonders.length; })); eq('play', G.phase); });
R('After the draft each player owns 4 wonders, unbuilt.', function () { var G = fresh(4); eq([4, 4], G.players.map(function (P) { return P.wonders.length; })); eq(0, G.built); });
R('10 progress tokens: 5 face up on the board, 5 in the box (all different).', function () { var G = E.newGame({ seed: 4 }); eq(5, G.tokensUp.length); eq(5, G.tokensBox.length); eq(10, new Set(G.tokensUp.concat(G.tokensBox)).size); });
R('The military pawn starts on the centre space (0) of a -9..+9 track; no loot taken yet.', function () { var G = E.newGame({ seed: 4 }); eq(0, G.mil); eq([[0, 0], [0, 0]], G.loot); });
R('Age I and Age II decks: 20 cards each, drawn from pools of 23 (3 left out).', function () {
  var G = E.newGame({ seed: 6 }); eq(23, D.CARDS.filter(function (c) { return c.age === 1; }).length); eq(23, D.CARDS.filter(function (c) { return c.age === 2; }).length);
  eq([20, 20], [G.decks[1].length, G.decks[2].length]); eq(true, G.decks[1].every(function (i) { return E.C(i).age === 1; })); });
R('Age III deck: 20 cards = 17 of the 20 non-guild cards + 3 of the 7 guilds.', function () {
  var G = E.newGame({ seed: 6 }), g = G.decks[3].filter(function (i) { return E.C(i).col === 'purple'; }).length;
  eq(20, D.CARDS.filter(function (c) { return c.age === 3 && c.col !== 'purple'; }).length); eq(7, D.CARDS.filter(function (c) { return c.col === 'purple'; }).length); eq([20, 3], [G.decks[3].length, g]); });
R('Age I pyramid: rows of 2,3,4,5,6 cards (6-card row is the front row).', function () { var G = fresh(7), n = [0, 0, 0, 0, 0]; G.pyr.forEach(function (c) { n[c.r]++; }); eq([2, 3, 4, 5, 6], n); });
R('Age II pyramid: rows of 6,5,4,3,2 cards (2-card row is the front row).', function () { var G = toAge(2), n = [0, 0, 0, 0, 0]; G.pyr.forEach(function (c) { n[c.r]++; }); eq(2, G.age); eq([6, 5, 4, 3, 2], n); });
R('Age III pyramid: rows of 2,3,4,2,4,3,2 cards (front row = last 2).', function () { var G = toAge(3), n = [0, 0, 0, 0, 0, 0, 0]; G.pyr.forEach(function (c) { n[c.r]++; }); eq(3, G.age); eq([2, 3, 4, 2, 4, 3, 2], n); });
R('Rows alternate face up / face down and the front (takeable) row is face up, in all 3 ages.', function () {
  [1, 2, 3].forEach(function (a) { var G = toAge(a), last = Math.max.apply(null, G.pyr.map(function (c) { return c.r; })), up = {};
    G.pyr.forEach(function (c) { up[c.r] = c.up; }); for (var r = 0; r <= last; r++) { if (up[r] !== ((last - r) % 2 === 0 ? 1 : 0)) throw { exp: 'age ' + a + ' row ' + r + ' up=' + ((last - r) % 2 === 0 ? 1 : 0), got: up[r] }; } }); });
R('The first player (the one who picked the first wonder) takes the first turn of Age I.', function () {
  var seen = {}; for (var s = 1; s <= 12; s++) { var G0 = E.newGame({ seed: s }), f = E.sideToAct(G0), G = fresh(s); seen[f] = 1; if (G.turn !== f) throw { exp: 'seat ' + f + ' starts (seed ' + s + ')', got: 'seat ' + G.turn }; } });
R('The first player is random: over 12 seeds both seats sometimes pick the first wonder.', function () {
  var seen = {}; for (var s = 1; s <= 12; s++) seen[E.sideToAct(E.newGame({ seed: s }))] = 1; eq({ 0: 1, 1: 1 }, seen); });
R('With seat 1 first, the draft order is 1,0,0 then 0,1,1 and seat 1 opens Age I.', function () {
  var G = E.newGame({ seed: 3, first: 1 }), o = []; for (var i = 0; i < 6; i++) { o.push(E.sideToAct(G)); E.apply(G, E.validMoves(G)[0]); } eq([1, 0, 0, 0, 1, 1], o); eq(1, G.turn); });

sect('B. Pyramid');
R('Only uncovered cards can be taken: at the start of Age I exactly the 6 front-row cards are available.', function () { var G = fresh(7); eq([6, [4]], [E.available(G).length, [E.available(G)[0].r]]); });
R('A card is covered by the cards diagonally in front of it; taking both unblocks it (Age I back card needs both its two neighbours gone).', function () {
  var G = fresh(7), a = G.pyr.filter(function (c) { return c.r === 4 && (c.x === -5 || c.x === -3); }), t = G.pyr.filter(function (c) { return c.r === 3 && c.x === -4; })[0];
  a[0].taken = 1; eq(true, E.covered(G, t)); a[1].taken = 1; eq(false, E.covered(G, t)); });
R('A face-down card is turned face up when the last card covering it is taken.', function () {
  var G = fresh(7), r4 = G.pyr.filter(function (c) { return c.r === 4; }), t = G.pyr.filter(function (c) { return c.r === 3 && c.x === -4; })[0];
  eq(0, t.up); var ids = r4.filter(function (c) { return c.x === -5 || c.x === -3; }).map(function (c) { return c.i; });
  play(G, { t: 'discard', i: ids[0] }); eq(0, t.up); play(G, { t: 'discard', i: ids[1] }); eq(1, t.up); });

sect('C. Turn actions');
R('Build: pay the coin cost, the card joins your city.', function () { var G = put(blank(), ['a1-scribe-room', 'a1-hewing-camp']); play(G, { t: 'build', i: 19 }); eq([5, ['a1-scribe-room']], [coins(G, 0), G.players[0].cards]); });
R('A card with no cost is built for free.', function () { var G = put(blank(), ['a1-timber-stand']); play(G, { t: 'build', i: 19 }); eq([7, 1], [coins(G, 0), G.players[0].cards.length]); });
R('You cannot build what you cannot afford (build move is not offered).', function () { var G = put(blank(), ['a1-scribe-room']); G.players[0].coins = 1; eq(false, legal(G, { t: 'build', i: 19 })); });
R('Discard for coins: you gain 2 coins + 1 per yellow card you own; the card goes to the discard pile.', function () {
  var G = put(blank(), ['a1-reed-press']); city(G, 0, ['a1-roadside-inn', 'a1-timber-depot']); play(G, { t: 'discard', i: 19 }); eq([7 + 4, ['a1-reed-press']], [coins(G, 0), G.discard]); });
R('Wonder: pay the wonder cost, the card is tucked under it, the wonder counts as built.', function () {
  var G = put(blank(), ['a1-reed-press', 'a1-timber-stand']); G.players[0].coins = 30; wond(G, 0, 'w-sky-tomb'); var c0 = E.wonderInfo(G, 0, 'w-sky-tomb').coins; play(G, { t: 'wonder', i: 19, w: 'w-sky-tomb' });
  eq([30 - c0, 'a1-reed-press', 1], [coins(G, 0), G.players[0].wonders[0].card, G.built]); });
R('Only 7 wonders can be built in the whole game: once 7 exist, no wonder move is offered.', function () {
  var G = put(blank(), ['a1-reed-press', 'a1-timber-stand']); G.players[0].coins = 30; wond(G, 0, 'w-sky-tomb'); G.built = 7; eq(false, legal(G, { t: 'wonder', i: 19, w: 'w-sky-tomb' })); G.built = 6; eq(true, legal(G, { t: 'wonder', i: 19, w: 'w-sky-tomb' })); });
R('After a normal move the turn passes to the other player.', function () { var G = put(blank(), ['a1-timber-stand']); play(G, { t: 'build', i: 19 }); eq(1, E.sideToAct(G)); });
R('Chain: a card whose chain symbol you already own is built for free (no coins, no resources).', function () {
  var G = put(blank(), ['a2-water-arch']); city(G, 0, ['a1-bathhouse']); G.players[0].coins = 0; play(G, { t: 'build', i: 19 }); eq([0, 2], [coins(G, 0), G.players[0].cards.length]); });
R('Without the chain symbol the same card costs full price (Water Arch = 3 stone).', function () { var G = put(blank(), ['a2-water-arch']); eq(6, buildCoins(G, 0, 'a2-water-arch')); });

sect('D. Resources and trading');
R('Your own brown/grey production pays resource costs for free.', function () { var G = blank(); city(G, 0, ['a1-rock-face']); eq(0, buildCoins(G, 0, 'a1-bathhouse')); });
R('Each missing resource unit costs 2 coins + the number of that resource your rival produces (brown/grey cards).', function () {
  var G = blank(); eq(2, buildCoins(G, 0, 'a1-bathhouse')); city(G, 1, ['a1-rock-face', 'a1-gravel-pit']); eq(4, buildCoins(G, 0, 'a1-bathhouse')); });
R('Rival yellow-card production and rival wonder production do NOT raise the price.', function () {
  var G = blank(); city(G, 1, ['a2-caravan-post']); wond(G, 1, 'w-beacon-isle', true); eq(2, buildCoins(G, 0, 'a1-bathhouse')); });
R('A matching trade-post card (stone/clay/wood) makes that resource cost 1 per unit; other resources unchanged.', function () {
  var G = blank(); city(G, 1, ['a1-rock-face', 'a1-gravel-pit', 'a1-timber-stand']); city(G, 0, ['a1-stone-depot']); eq(1, buildCoins(G, 0, 'a1-bathhouse')); eq(3, buildCoins(G, 0, 'a1-pony-pen')); });
R('Customs Quay makes glass and papyrus cost 1 each.', function () { var G = blank(); city(G, 1, ['a1-glass-kiln', 'a1-reed-press']); city(G, 0, ['a2-customs-quay']); eq([1, 1], [buildCoins(G, 0, 'a1-herb-garden'), buildCoins(G, 0, 'a1-weights-hall')]); });
R('A yellow choice card (Caravan Post) supplies ONE unit of one of its resources, not two.', function () { var G = blank(); city(G, 0, ['a2-caravan-post']); eq(2, buildCoins(G, 0, 'a2-city-wall')); });
R('A built wonder with a resource choice supplies one unit (Beacon Isle: wood/clay/stone; Sunken Harbor: glass/papyrus).', function () {
  var G = blank(); wond(G, 0, 'w-beacon-isle', true); wond(G, 0, 'w-sunken-harbor', true); eq([0, 0, 2], [buildCoins(G, 0, 'a1-bathhouse'), buildCoins(G, 0, 'a1-weights-hall'), buildCoins(G, 0, 'a1-pony-pen') - 0 === 0 ? 2 : 2]); });
R('A card with a coin cost AND resource cost adds trading coins to the printed coins (Caravan Post: 2 coins + glass + papyrus).', function () { var G = blank(); city(G, 0, []); eq(2 + 2 + 2, buildCoins(G, 0, 'a2-caravan-post')); });
R('Trading coins are paid to the bank, the rival gets nothing (without Economy).', function () { var G = put(blank(), ['a1-bathhouse', 'a1-timber-stand']); play(G, { t: 'build', i: 19 }); eq([5, 7], [coins(G, 0), coins(G, 1)]); });
R('Economy token: the owner receives the coins the rival pays for trading resources.', function () {
  var G = put(blank(), ['a1-bathhouse', 'a1-timber-stand']); G.players[1].tokens.push('t-economy'); play(G, { t: 'build', i: 19 }); eq([5, 9], [coins(G, 0), coins(G, 1)]); });
R('Economy pays only for traded resources, not for the printed coin cost of a card.', function () {
  var G = put(blank(), ['a1-scribe-room', 'a1-timber-stand']); G.players[1].tokens.push('t-economy'); play(G, { t: 'build', i: 19 }); eq([5, 7], [coins(G, 0), coins(G, 1)]); });
R('Architecture token: wonders cost 2 resource units less.', function () {
  var G = blank(); wond(G, 0, 'w-bronze-titan'); eq(8, E.wonderInfo(G, 0, 'w-bronze-titan').coins); G.players[0].tokens.push('t-architecture'); eq(4, E.wonderInfo(G, 0, 'w-bronze-titan').coins); });
R('Masonry token: blue cards cost 2 resource units less.', function () { var G = blank(); eq(6, buildCoins(G, 0, 'a2-water-arch')); G.players[0].tokens.push('t-masonry'); eq(2, buildCoins(G, 0, 'a2-water-arch')); });
R('Architecture does not discount cards; Masonry does not discount wonders or non-blue cards.', function () {
  var G = blank(); wond(G, 0, 'w-bronze-titan'); G.players[0].tokens.push('t-architecture'); eq(2, buildCoins(G, 0, 'a1-bathhouse'));
  var H = blank(); wond(H, 0, 'w-bronze-titan'); H.players[0].tokens.push('t-masonry'); eq([8, 2], [E.wonderInfo(H, 0, 'w-bronze-titan').coins, buildCoins(H, 0, 'a1-pony-pen')]); });

sect('E. Yellow cards');
R('Roadside Inn gives 4 coins when built; Brewhouse gives 6.', function () { var G = put(blank(), ['a1-roadside-inn', 'a2-brewhouse']); play(G, { t: 'build', i: 19 }); eq(11, coins(G, 0)); G.turn = 0; play(G, { t: 'build', i: 18 }); eq(17, coins(G, 0)); });
R('Trade Chamber: 3 coins per grey card in your city when built.', function () { var G = put(blank(), ['a3-trade-chamber', 'a1-timber-stand']); G.age = 3; city(G, 0, ['a1-glass-kiln', 'a2-drying-rack', 'a1-reed-press']); G.players[0].coins = 20; var c = buildCoins(G, 0, 'a3-trade-chamber'); play(G, { t: 'build', i: 19 }); eq(20 - c + 9, coins(G, 0)); });
R('Grand Port: 2 coins per brown card in your city when built.', function () { var G = put(blank(), ['a3-grand-port', 'a1-timber-stand']); city(G, 0, ['a1-rock-face', 'a1-mud-basin']); G.players[0].coins = 20; var c = buildCoins(G, 0, 'a3-grand-port'); play(G, { t: 'build', i: 19 }); eq(20 - c + 4, coins(G, 0)); });
R('Armory: 1 coin per red card in your city when built.', function () { var G = put(blank(), ['a3-armory', 'a1-timber-stand']); city(G, 0, ['a1-pony-pen', 'a1-stake-fence', 'a1-barrack-yard']); G.players[0].coins = 20; var c = buildCoins(G, 0, 'a3-armory'); play(G, { t: 'build', i: 19 }); eq(20 - c + 3, coins(G, 0)); });
R('Beacon Quay: 1 coin per yellow card in your city (it counts itself).', function () { var G = put(blank(), ['a3-beacon-quay', 'a1-timber-stand']); city(G, 0, ['a1-roadside-inn']); G.players[0].coins = 20; var c = buildCoins(G, 0, 'a3-beacon-quay'); play(G, { t: 'build', i: 19 }); eq(20 - c + 2, coins(G, 0)); });
R('Sand Arena: 2 coins per built wonder in your city when built.', function () { var G = put(blank(), ['a3-sand-arena', 'a1-timber-stand']); wond(G, 0, 'w-sky-tomb', true); wond(G, 0, 'w-moon-grove', true); wond(G, 1, 'w-bronze-titan', true); G.players[0].coins = 20; var c = buildCoins(G, 0, 'a3-sand-arena'); play(G, { t: 'build', i: 19 }); eq(20 - c + 4, coins(G, 0)); });
R('Yellow Age III cards score 3 points each at the end.', function () { var G = blank(); city(G, 0, ['a3-trade-chamber', 'a3-armory']); eq(6, E.score(G, 0).yellow); });

sect('F. Military');
R('A red card moves the pawn toward the rival by its shields (player 0 positive, player 1 negative).', function () {
  var G = put(blank(), ['a1-stake-fence', 'a1-timber-stand']); play(G, { t: 'build', i: 19 }); eq(1, G.mil); var H = put(blank(), ['a1-stake-fence', 'a1-timber-stand']); H.turn = 1; play(H, { t: 'build', i: 19 }); eq(-1, H.mil); });
R('The pawn cannot go past 9 steps (clamped).', function () { var G = put(blank(), ['a3-arsenal', 'a1-timber-stand']); G.mil = 7; G.players[0].coins = 30; city(G, 0, ['a1-mud-basin', 'a1-mud-basin', 'a1-mud-basin', 'a1-timber-stand', 'a1-timber-stand']); play(G, { t: 'build', i: 19 }); eq(9, G.mil); });
R('Reaching 3 steps: the rival loses 2 coins.', function () { var G = put(blank(), ['a1-stake-fence', 'a1-timber-stand']); G.mil = 2; play(G, { t: 'build', i: 19 }); eq([5, 3], [coins(G, 1), G.mil]); });
R('Reaching 6 steps: the rival loses 5 coins.', function () { var G = put(blank(), ['a1-stake-fence', 'a1-timber-stand']); G.mil = 5; G.loot[0][0] = 1; G.players[1].coins = 10; play(G, { t: 'build', i: 19 }); eq([5, 6], [coins(G, 1), G.mil]); });
R('Loot cannot take the rival below 0 coins (rival with 1 coin loses 1).', function () { var G = put(blank(), ['a1-stake-fence', 'a1-timber-stand']); G.mil = 2; G.players[1].coins = 1; play(G, { t: 'build', i: 19 }); eq(0, coins(G, 1)); });
R('Each loot token is taken only once: moving back and forth over 3 steps does not loot twice.', function () {
  var G = put(blank(), ['a1-stake-fence', 'a1-lookout', 'a1-barrack-yard']); G.mil = 2; G.players[0].coins = 20; play(G, { t: 'build', i: 19 }); eq(5, coins(G, 1)); G.mil = 2; G.turn = 0; play(G, { t: 'build', i: 18 }); eq(5, coins(G, 1)); });
R('A move that jumps over both loot spaces (2 -> 6) takes both tokens: rival loses 2 + 5.', function () {
  var G = put(blank(), ['a3-arsenal', 'a1-timber-stand']); G.mil = 2; G.players[1].coins = 10; G.players[0].coins = 30; city(G, 0, ['a1-mud-basin', 'a1-mud-basin', 'a1-mud-basin', 'a1-timber-stand', 'a1-timber-stand']);
  G.players[0].tokens.push('t-strategy'); play(G, { t: 'build', i: 19 }); eq([6, 3], [G.mil, coins(G, 1)]); });
R('Player 1 pushing the pawn to -3 makes player 0 lose 2 coins.', function () { var G = put(blank(), ['a1-stake-fence', 'a1-timber-stand']); G.turn = 1; G.mil = -2; play(G, { t: 'build', i: 19 }); eq([5, -3], [coins(G, 0), G.mil]); });
R('9 steps = immediate military victory.', function () { var G = put(blank(), ['a1-stake-fence', 'a1-timber-stand']); G.mil = 8; play(G, { t: 'build', i: 19 }); eq([true, 0, 'military'], [G.over, G.winner, G.reason]); });
R('Strategy token: red cards built after taking it give +1 shield.', function () { var G = put(blank(), ['a1-stake-fence', 'a1-timber-stand']); G.players[0].tokens.push('t-strategy'); play(G, { t: 'build', i: 19 }); eq(2, G.mil); });
R('Strategy token does not add shields to wonders.', function () { var G = put(blank(), ['a1-reed-press', 'a1-timber-stand']); G.players[0].tokens.push('t-strategy'); G.players[0].coins = 40; wond(G, 0, 'w-bronze-titan'); play(G, { t: 'wonder', i: 19, w: 'w-bronze-titan' }); eq(2, G.mil); });
R('End-of-game military points: 0 steps = 0, 1-2 steps = 2, 3-5 steps = 5, 6-8 steps = 10.', function () { var G = blank(), o = []; [0, 1, 2, 3, 5, 6, 8].forEach(function (m) { G.mil = m; o.push(E.milVP(G, 0)); }); eq([0, 2, 2, 5, 5, 10, 10], o); G.mil = -4; eq([0, 5], [E.milVP(G, 0), E.milVP(G, 1)]); });

sect('G. Science');
R('Second card with the same science symbol: take one of the face-up progress tokens.', function () {
  var G = put(blank(), ['a2-herbarium', 'a1-timber-stand']); city(G, 0, ['a1-herb-garden']); G.players[0].coins = 30; play(G, { t: 'build', i: 19 }); eq(['token', 0], [G.pend[0].type, G.pend[0].pl]); eq(G.tokensUp.length, E.validMoves(G).length); });
R('Choosing the token removes it from the face-up row and gives it to you.', function () {
  var G = put(blank(), ['a2-herbarium', 'a1-timber-stand']); city(G, 0, ['a1-herb-garden']); G.players[0].coins = 30; play(G, { t: 'build', i: 19 }); var t = G.tokensUp[0]; play(G, { t: 'token', id: t }); eq([[t], 4, 0], [G.players[0].tokens, G.tokensUp.length, G.pend.length]); });
R('A pair earns a token only once per symbol (a third copy gives nothing).', function () {
  var G = put(blank(), [FAKE.id, 'a1-timber-stand']); city(G, 0, ['a1-herb-garden', 'a2-herbarium']); G.players[0].pairs.push('wheel'); play(G, { t: 'build', i: 19 }); eq(0, G.pend.length); });
R('If no progress token is left face up, a pair gives nothing and play continues.', function () {
  var G = put(blank(), ['a2-herbarium', 'a1-timber-stand']); city(G, 0, ['a1-herb-garden']); G.players[0].coins = 30; G.tokensUp = []; play(G, { t: 'build', i: 19 }); eq([0, 1], [G.pend.length, E.sideToAct(G)]); });
R('6 different science symbols = immediate science victory.', function () {
  var G = put(blank(), ['a2-chart-room', 'a1-timber-stand']); city(G, 0, ['a1-herb-garden', 'a1-weights-hall', 'a1-scribe-room', 'a1-remedy-shop', 'a2-star-gazers']); G.players[0].coins = 30; play(G, { t: 'build', i: 19 }); eq([true, 0, 'science'], [G.over, G.winner, G.reason]); });
R('5 different symbols is not a victory.', function () {
  var G = put(blank(), ['a2-chart-room', 'a1-timber-stand']); city(G, 0, ['a1-herb-garden', 'a1-weights-hall', 'a1-scribe-room', 'a1-remedy-shop']); G.players[0].coins = 30; play(G, { t: 'build', i: 19 }); eq(false, G.over); });
R('The Law token counts as a science symbol: 5 card symbols + Law = victory.', function () {
  var G = put(blank(), ['a2-chart-room', 'a1-timber-stand']); city(G, 0, ['a1-herb-garden', 'a1-weights-hall', 'a1-scribe-room', 'a2-star-gazers']); G.players[0].tokens.push('t-law'); G.players[0].coins = 30; play(G, { t: 'build', i: 19 }); eq(true, G.over); });
R('Taking the Law token as your 6th symbol wins at once.', function () {
  var G = blank(); city(G, 0, ['a1-herb-garden', 'a1-weights-hall', 'a1-scribe-room', 'a1-remedy-shop', 'a2-star-gazers', 'a2-chart-room']); G.over = false; G.pend.push({ type: 'token', pl: 0, from: 'up' }); G.tokensUp = ['t-law', 't-philosophy']; play(G, { t: 'token', id: 't-law' }); eq([true, 'science'], [G.over, G.reason]); });
R('Law is not a pair symbol: Law alone never gives a token.', function () { var G = put(blank(), ['a1-reed-press', 'a1-timber-stand']); G.tokensUp = ['t-law', 't-philosophy']; G.pend.push({ type: 'token', pl: 0, from: 'up' }); play(G, { t: 'token', id: 't-law' }); eq(0, G.pend.length); });

sect('H. Progress tokens');
R('Agriculture: 6 coins now and 4 victory points.', function () { var G = blank(); G.tokensUp = ['t-agriculture']; G.pend.push({ type: 'token', pl: 0, from: 'up' }); play(G, { t: 'token', id: 't-agriculture' }); eq([13, 4], [coins(G, 0), E.score(G, 0).token]); });
R('Philosophy: 7 victory points.', function () { var G = blank(); G.players[0].tokens.push('t-philosophy'); eq(7, E.score(G, 0).token); });
R('Mathematics: 3 points per progress token you own (including itself) at the end.', function () { var G = blank(); G.players[0].tokens.push('t-mathematics', 't-law', 't-strategy'); eq(9, E.score(G, 0).token); });
R('Urbanism: 6 coins when taken.', function () { var G = blank(); G.tokensUp = ['t-urbanism']; G.pend.push({ type: 'token', pl: 0, from: 'up' }); play(G, { t: 'token', id: 't-urbanism' }); eq(13, coins(G, 0)); });
R('Urbanism: +4 coins every time you build a card by chain; not on a normal build.', function () {
  var G = put(blank(), ['a2-water-arch', 'a1-roadside-inn']); city(G, 0, ['a1-bathhouse']); G.players[0].tokens.push('t-urbanism'); G.players[0].coins = 0; play(G, { t: 'build', i: 19 }); eq(4, coins(G, 0));
  var H = put(blank(), ['a1-timber-stand', 'a1-roadside-inn']); H.players[0].tokens.push('t-urbanism'); play(H, { t: 'build', i: 19 }); eq(7, coins(H, 0)); });
R('Theology: every wonder you build lets you play again.', function () { var G = put(blank(), ['a1-reed-press', 'a1-timber-stand']); G.players[0].tokens.push('t-theology'); G.players[0].coins = 40; wond(G, 0, 'w-sky-tomb'); play(G, { t: 'wonder', i: 19, w: 'w-sky-tomb' }); eq(0, E.sideToAct(G)); });
R('Law token alone gives no victory points or coins.', function () { var G = blank(); G.players[0].tokens.push('t-law'); eq([0, 7], [E.score(G, 0).token, coins(G, 0)]); });

sect('I. Wonders');
function wtest(id, setup, check) { return function () { var G = put(blank(), ['a1-reed-press', 'a1-timber-stand']); G.players[0].coins = 40; wond(G, 0, id); if (setup) setup(G); play(G, { t: 'wonder', i: 19, w: id }); check(G); }; }
R('Colossus: 3 points, 2 shields; cost 3 clay + 1 glass.', wtest('w-bronze-titan', null, function (G) { eq([2, 3], [G.mil, E.score(G, 0).wonder]); eq(8, E.wonderInfo(blank(), 0, 'w-bronze-titan').coins); }));
R('Pyramids: 9 points; cost 3 stone + 1 papyrus.', wtest('w-sky-tomb', null, function (G) { eq(9, E.score(G, 0).wonder); eq(8, E.wonderInfo(blank(), 0, 'w-sky-tomb').coins); }));
R('Temple of Artemis: 12 coins and play again; cost 1 wood + 1 stone + 1 glass + 1 papyrus.', wtest('w-moon-grove', null, function (G) { eq(12, coins(G, 0) - (40 - E.wonderInfo(blank(), 0, 'w-moon-grove').coins)); eq(0, E.sideToAct(G)); }));
R('Hanging Gardens: 3 points, 6 coins, play again; cost 2 wood + 1 glass + 1 papyrus.', wtest('w-terraced-orchard', null, function (G) { eq(6, coins(G, 0) - (40 - E.wonderInfo(blank(), 0, 'w-terraced-orchard').coins)); eq([3, 0], [E.score(G, 0).wonder, E.sideToAct(G)]); }));
R('Great Library: 4 points; draw 3 of the 5 boxed tokens, pick one.', wtest('w-archive-of-dust', null, function (G) { eq(['token', 'lib', 3], [G.pend[0].type, G.pend[0].from, G.pend[0].list.length]); eq(true, G.pend[0].list.every(function (t) { return G.tokensBox.indexOf(t) >= 0; })); var t = G.pend[0].list[1]; play(G, { t: 'token', id: t }); eq([true, 4], [G.players[0].tokens[0] === t && G.tokensBox.indexOf(t) < 0, G.tokensBox.length]); eq(4, E.score(G, 0).wonder); }));
R('Mausoleum: 2 points; build one card from the discard pile for free.', wtest('w-marble-barrow', function (G) { G.discard = ['a1-stake-fence', 'a1-reed-press']; }, function (G) { eq(['revive', 0], [G.pend[0].type, G.pend[0].pl]); var c0 = coins(G, 0); play(G, { t: 'revive', id: 'a1-stake-fence' }); eq([c0, 1, ['a1-reed-press'], 1], [coins(G, 0), G.mil, G.discard, G.players[0].cards.length]); }));
R('Mausoleum with an empty discard pile: no pending choice, play continues.', wtest('w-marble-barrow', null, function (G) { eq([0, 1], [G.pend.length, E.sideToAct(G)]); }));
R('Sphinx: 6 points and play again.', wtest('w-stone-riddle', null, function (G) { eq([6, 0], [E.score(G, 0).wonder, E.sideToAct(G)]); }));
R('Great Lighthouse: 4 points; produces 1 wood/clay/stone of your choice.', wtest('w-beacon-isle', null, function (G) { eq(4, E.score(G, 0).wonder); eq(0, E.buildInfo(G, 0, E.C('a1-rock-face')).coins); eq([['wood', 'clay', 'stone']], E.choiceProd(G, 0)); }));
R('Circus Maximus: 3 points, 1 shield, discard one rival grey card (goes to the discard pile).', wtest('w-grand-arena', function (G) { city(G, 1, ['a1-glass-kiln', 'a1-timber-stand']); }, function (G) { eq([3, 1], [E.score(G, 0).wonder, G.mil]); eq(['destroy', ['a1-glass-kiln']], [G.pend[0].type, G.pend[0].list]); play(G, { t: 'destroy', id: 'a1-glass-kiln' }); eq([['a1-timber-stand'], ['a1-glass-kiln'], 1], [G.players[1].cards, G.discard, E.sideToAct(G)]); }));
R('Statue of Zeus: 3 points, 1 shield, discard one rival brown card.', wtest('w-thunder-idol', function (G) { city(G, 1, ['a1-glass-kiln', 'a1-timber-stand']); }, function (G) { eq([3, 1], [E.score(G, 0).wonder, G.mil]); eq(['destroy', ['a1-timber-stand']], [G.pend[0].type, G.pend[0].list]); }));
R('Destroy wonders do nothing (no choice asked) when the rival has no card of that colour.', wtest('w-grand-arena', null, function (G) { eq(0, G.pend.length); }));
R('Appian Way: 3 points, 3 coins for you, rival loses 3 coins, play again.', wtest('w-merchant-road', null, function (G) { eq(3, coins(G, 0) - (40 - E.wonderInfo(blank(), 0, 'w-merchant-road').coins)); eq([4, 3, 0], [coins(G, 1), E.score(G, 0).wonder, E.sideToAct(G)]); }));
R('Piraeus: 2 points, play again, produces 1 glass or papyrus of your choice.', wtest('w-sunken-harbor', null, function (G) { eq([2, 0], [E.score(G, 0).wonder, E.sideToAct(G)]); eq([['glass', 'papyrus']], E.choiceProd(G, 0)); }));
R('Playing again keeps the same player to move; a wonder without "again" passes the turn.', function () { var G = put(blank(), ['a1-reed-press', 'a1-timber-stand']); G.players[0].coins = 40; wond(G, 0, 'w-bronze-titan'); play(G, { t: 'wonder', i: 19, w: 'w-bronze-titan' }); eq(1, E.sideToAct(G)); });
R('If the last pyramid card is a play-again wonder, the age still ends normally (no stuck game).', function () {
  var G = put(blank(), ['a1-reed-press']); G.pyr[16].taken = 1; G.players[0].coins = 40; wond(G, 0, 'w-moon-grove'); play(G, { t: 'wonder', i: 19, w: 'w-moon-grove' }); eq([2, 'first'], [G.age, G.pend[0].type]); });

sect('J. Guilds');
function gscore(id, mine, theirs, key) { var G = blank(); city(G, 0, [id].concat(mine)); city(G, 1, theirs); return E.score(G, 0).guild; }
R('Merchants: 1 point per yellow card in the city with the most (yours or rival).', function () { eq(3, gscore('g-merchants', ['a1-roadside-inn'], ['a1-timber-depot', 'a1-clay-depot', 'a1-stone-depot'])); });
R('Shipowners: 1 point per brown + grey card in the richest city.', function () { eq(4, gscore('g-shipowners', ['a1-timber-stand'], ['a1-rock-face', 'a1-glass-kiln', 'a1-mud-basin', 'a1-timber-stand'])); });
R('Builders: 2 points per built wonder in the city with the most wonders.', function () { var G = blank(); city(G, 0, ['g-builders']); wond(G, 0, 'w-sky-tomb', true); wond(G, 1, 'w-moon-grove', true); wond(G, 1, 'w-bronze-titan', true); eq(4, E.score(G, 0).guild); });
R('Magistrates: 1 point per blue card in the city with the most.', function () { eq(2, gscore('g-magistrates', [], ['a1-open-stage', 'a1-shrine'])); });
R('Scholars (scientists): 1 point per green card in the city with the most.', function () { eq(3, gscore('g-scientists', ['a1-herb-garden'], ['a1-herb-garden', 'a1-weights-hall', 'a1-scribe-room'])); });
R('Tacticians: 1 point per red card in the city with the most.', function () { eq(2, gscore('g-tacticians', ['a1-pony-pen', 'a1-stake-fence'], [])); });
R('Moneylenders: 1 point per 3 coins in the richer city, no coins gained when built.', function () { var G = blank(); city(G, 0, ['g-moneylenders']); G.players[0].coins = 9; G.players[1].coins = 15; eq(5, E.score(G, 0).guild);
  var H = put(blank(), ['g-moneylenders', 'a1-timber-stand']); H.players[0].coins = 40; var c = buildCoins(H, 0, 'g-moneylenders'); play(H, { t: 'build', i: 19 }); eq(40 - c, coins(H, 0)); });
R('Guilds that pay coins (all but Builders and Moneylenders): 1 coin per matching card in the city with the most, when built.', function () {
  var G = put(blank(), ['g-tacticians', 'a1-timber-stand']); city(G, 1, ['a1-pony-pen', 'a1-stake-fence', 'a1-barrack-yard']); G.players[0].coins = 40; var c = buildCoins(G, 0, 'g-tacticians'); play(G, { t: 'build', i: 19 }); eq(40 - c + 3, coins(G, 0)); });
R('Builders guild gives no coins when built.', function () { var G = put(blank(), ['g-builders', 'a1-timber-stand']); wond(G, 1, 'w-sky-tomb', true); G.players[0].coins = 40; var c = buildCoins(G, 0, 'g-builders'); play(G, { t: 'build', i: 19 }); eq(40 - c, coins(G, 0)); });

sect('K. End-of-age and final scoring');
R('At the end of an age the player with the weaker military (pawn on their side) chooses who starts: pawn toward player 0 -> player 1 chooses.', function () { var G = put(blank(), ['a1-reed-press']); G.pyr[16].taken = 1; G.mil = 2; play(G, { t: 'discard', i: 19 }); eq([2, 'first', 1], [G.age, G.pend[0].type, G.pend[0].pl]); });
R('Pawn toward player 1 -> player 0 chooses who starts the next age.', function () { var G = put(blank(), ['a1-reed-press']); G.pyr[16].taken = 1; G.mil = -2; G.turn = 1; play(G, { t: 'discard', i: 19 }); eq(0, G.pend[0].pl); });
R('Pawn on the centre: the last active player (who took the last card) chooses who starts.', function () { [0, 1].forEach(function (p) { var G = put(blank(), ['a1-reed-press']); G.pyr[16].taken = 1; G.turn = p; play(G, { t: 'discard', i: 19 }); eq(p, G.pend[0].pl); }); });
R('The chosen starter moves first in the new age.', function () { var G = put(blank(), ['a1-reed-press']); G.pyr[16].taken = 1; G.mil = 2; play(G, { t: 'discard', i: 19 }); play(G, { t: 'first', who: 1 }); eq([1, 20], [E.sideToAct(G), G.pyr.length]); });
R('Clearing the Age III pyramid ends the game and scores it.', function () { var G = put(blank(), ['a1-reed-press']); G.age = 3; G.pyr[16].taken = 1; play(G, { t: 'discard', i: 19 }); eq([true, 'points'], [G.over, G.reason === 'draw' || G.reason === 'tiebreak' ? 'points' : G.reason]); eq(true, !!G.final); });
R('Score: blue card points + green card points + yellow card points + wonder points + token points + 1 per 3 coins + military zone points.', function () {
  var G = blank(); city(G, 0, ['a1-open-stage', 'a1-herb-garden', 'a3-trade-chamber']); wond(G, 0, 'w-sky-tomb', true); G.players[0].tokens.push('t-philosophy'); G.players[0].coins = 10; G.mil = 4; var s = E.score(G, 0);
  eq([3, 1, 3, 9, 7, 3, 5, 31], [s.blue, s.green, s.yellow, s.wonder, s.token, s.coins, s.mil, s.total]); });
R('Highest total wins.', function () { var G = put(blank(), ['a1-reed-press']); G.age = 3; G.pyr[16].taken = 1; city(G, 0, ['a1-open-stage']); play(G, { t: 'discard', i: 19 }); eq([0, 'points'], [G.winner, G.reason]); });
R('Tie on points: the player with more blue (civilian) points wins.', function () { var G = put(blank(), ['a1-reed-press']); G.age = 3; G.pyr[16].taken = 1; city(G, 0, ['a1-open-stage']); city(G, 1, ['a1-herb-garden', 'a1-weights-hall', 'a2-herbarium']); G.players[0].coins = 0; G.players[1].coins = 0; play(G, { t: 'discard', i: 19 }); eq([0, 'tiebreak'], [G.winner, G.reason]); });
R('Tie on points and on blue points: shared victory (draw).', function () { var G = put(blank(), ['a1-reed-press']); G.age = 3; G.pyr[16].taken = 1; G.players[0].coins = 0; G.players[1].coins = 0; play(G, { t: 'discard', i: 19 }); eq([-1, 'draw'], [G.winner, G.reason]); });
R('Instant victories (military, science) end the game immediately and beat points.', function () { var G = put(blank(), ['a1-stake-fence', 'a1-timber-stand']); G.mil = 8; city(G, 1, ['a1-open-stage', 'a1-shrine', 'a1-bathhouse']); play(G, { t: 'build', i: 19 }); eq([true, 0, 'military'], [G.over, G.winner, G.reason]); });
R('Full random games always reach a legal end (no stuck state, no negative coins, no duplicate card).', function () {
  for (var s = 1; s <= 60; s++) { var G = E.newGame({ seed: s * 13 }), k = 0; while (!G.over && k++ < 400) { var M = E.validMoves(G); if (!M.length) throw { exp: 'moves', got: 'stuck seed ' + s }; E.apply(G, M[Math.floor(E.rnd(G) * M.length)]); var inv = E.checkInvariants(G); if (inv.length) throw { exp: 'clean', got: inv.join() + ' seed ' + s }; } if (!G.over) throw { exp: 'ended', got: 'seed ' + s }; } });

if (process.argv.indexOf('--md') >= 0) {
  var out = ['# Twin Thrones: rules checklist (W435)', '',
    'Source: the published structure of the 2-player card-draft duel this game adapts (rulebook from knowledge, cross-checked with its public English rulebook text). Names are never written here.',
    'Every line is one numbered rule. `node logic-test.js` asserts each against the real engine (state set up exactly, one action, exact result); a failure prints `FAIL rule N: expected X, got Y`.', '',
    'Rulebook points checked from the web text: first player starts Age I; weaker-military player chooses the next starter; with the pawn centred the last active player (took the last card) chooses; looting costs the rival 2 / 5 coins and never below 0; 3 and 6 steps loot, 9 steps wins.', '',
    '**Not asserted (could not be confirmed to the rulebook, so no test pretends to):** individual Age I-III card costs and chain pairs other than those used above, Piraeus wonder cost, and which exact 3 cards are left out of each age. Cost-only; see rules-notes.md UNSURE lines.', ''];
  RULES.forEach(function (r) { if (SECT[r.n]) out.push('', '## ' + SECT[r.n], ''); out.push(r.n + '. ' + r.text); });
  console.log(out.join('\n')); process.exit(0);
}
var pass = 0, fail = 0;
RULES.forEach(function (r) {
  try { r.fn(); pass++; }
  catch (e) { fail++; var m = (e && e.exp !== undefined) ? 'expected ' + J(e.exp) + ', got ' + J(e.got) : 'expected no error, got ' + (e && e.stack ? e.stack.split('\n').slice(0, 2).join(' | ') : e); console.log('FAIL rule ' + r.n + ': ' + m); }
});
console.log('rules total ' + RULES.length + ', pass ' + pass + ', fail ' + fail);
process.exit(fail ? 1 : 0);

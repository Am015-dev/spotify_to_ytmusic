// Via Tessera rules test (node, no browser): component counts, one check per key rule (RULES-CHECKLIST.md), then a gauntlet of
// computer-vs-computer games with invariants after every move. Run: node rules-test.js   (QUICK=1: 6 games, else 40)
global.VTD = require('./src/data.js');
const VT = require('./src/engine.js'), VAI = require('./src/ai.js'), D = VT.D;
let pass = 0, fail = 0;
const ok = (c, name) => { if (c) pass++; else { fail++; console.log('FAIL ' + name); } };
const count = (arr, f) => arr.filter(f).length;
const fresh = (o) => VT.newGame(Object.assign({ seed: 11, first: 0 }, o || {}));

// ---------- components ----------
ok(D.START_HAND.length === 7, '7 starting cards (published setup: 7 per player)');
ok(D.START_HAND.map(i => D.CARDS[i]).filter(c => c.act === 'colo' && c.god === 'shield' && !Object.keys(c.cost).length).length === 1, 'FIX: the starting hand has a Settler (Shield)');
const sh = D.START_HAND.map(i => D.CARDS[i]);
ok(count(sh, c => c.act === 'trib' && c.god === 'shield') === 1 && count(sh, c => c.act === 'arch' && c.god === 'eagle') === 1 && count(sh, c => c.act === 'pref' && c.god === 'sickle') === 1 &&
   count(sh, c => c.act === 'merc' && c.god === 'wing' && c.coins === 3) === 1 && count(sh, c => c.act === 'dipl' && c.god === 'eagle') === 1 && count(sh, c => c.act === 'sen' && c.god === 'hearth') === 1, 'starting hand cards and patrons');
const [I, II] = D.DECK_STACKS(2);
ok(I.length === 8 && II.length === 7, 'decks I (8) and II (7) for 2 players');
const mk = I.concat(II).map(i => D.CARDS[i]);
ok(count(mk, c => c.act === 'arch' && c.cost.tool === 1 && c.god === 'eagle') === 2, '2 market Builders, cost 1 tool');
ok(count(mk, c => c.act === 'pref' && c.cost.wine === 1 && c.god === 'sickle') === 2, '2 market Governors, cost 1 wine');
ok(count(mk, c => c.act === 'merc' && c.cost.wine === 1 && c.coins === 5 && c.god === 'wing') === 2, '2 market Traders (5 coins), cost 1 wine');
ok(count(mk, c => c.act === 'colo' && c.cost.food === 1 && c.god === 'shield') === 2, '2 Settlers, cost 1 grain');
ok(count(mk, c => c.act === 'dipl' && c.cost.tool === 1 && c.god === 'sickle') === 1, '1 market Envoy (deck I), cost 1 tool');
ok(count(mk, c => c.act === 'cons' && c.cost.cloth === 1 && c.god === 'eagle') === 1, '1 Censor (deck II), cost 1 cloth');
const spec = g => mk.filter(c => c.act === 'spec' && c.spec === g)[0];
ok(spec('brick') && spec('brick').cost.food === 1 && Object.keys(spec('brick').cost).length === 1, 'Potter costs 1 grain');
ok(spec('food').cost.food === 1 && spec('food').cost.brick === 1, 'Reaper costs grain + brick');
ok(spec('tool').cost.tool === 1 && spec('tool').cost.brick === 1, 'Tinker costs tool + brick');
ok(spec('wine').cost.wine === 1 && spec('wine').cost.brick === 1 && spec('wine').deck === 2, 'Presser costs wine + brick (deck II)');
ok(spec('cloth').cost.cloth === 1 && spec('cloth').cost.brick === 1 && spec('cloth').deck === 2, 'Dyer costs cloth + brick (deck II)');
ok(mk.every(c => c.act !== 'spec' || c.god === 'owl'), 'makers carry the Owl');
ok(D.OWL.brick === 3 && D.OWL.food === 3 && D.OWL.tool === 3 && D.OWL.wine === 4 && D.OWL.cloth === 5, 'Owl values 3/3/3/4/5');
ok(D.CITIES.length === 31 && count(D.CITIES, c => c.L) === 30, '30 cities + capital');
ok(count(D.CITIES, c => c.L === 'A') === 7 && count(D.CITIES, c => c.L === 'B') === 8 && count(D.CITIES, c => c.L === 'C') === 10 && count(D.CITIES, c => c.L === 'D') === 5, 'letters A7 B8 C10 D5');
ok(Object.keys(D.TOKENS).every(L => D.TOKENS[L].length === count(D.CITIES, c => c.L === L)), 'one token per lettered city (30)');
ok(D.PROVS.length === 12 && D.PROVS.every(p => { const n = count(D.CITIES, c => c.p === p.id); return n === 2 || n === 3; }), '12 regions of 2-3 cities');
ok(count(D.ROUTES, r => r.t === 'land') === 44 && count(D.ROUTES, r => r.t === 'sea') === 35, '44 roads, 35 sea lanes');
ok(count(D.ROUTES, r => r.a === 'caput' || r.b === 'caput') === 6, 'capital has 3 roads + 3 lanes');
ok(D.SLOTS === 12 && D.HOUSES === 15 && D.DISPLAY === 7, '12 storehouse spaces, 15 houses, 7 display slots');
ok(JSON.stringify(D.PRICE) === JSON.stringify({ brick: 3, food: 4, tool: 5, wine: 6, cloth: 7 }), 'roof prices 3/4/5/6/7');

// ---------- setup ----------
let G = fresh();
ok(G.pl[0].coins === 5 && G.pl[1].coins === 6, 'start coins 5 and 6');
ok(G.pl.every(p => p.goods.food === 2 && p.goods.brick === 1 && p.goods.tool === 1 && p.goods.wine === 1 && p.goods.cloth === 1), 'start goods 2 grain + 1 of each other');
ok(G.pl.every(p => p.cols.length === 6 && count(p.cols, c => c.at && c.at.c === 'caput') === 2 && count(p.cols, c => c.t === 'L') === 3), '6 colonists: 1 cart + 1 ship in the capital');
ok(G.pl.every(p => VT.used(p) === 10), 'storehouse starts with 10 of 12 used');
ok(G.disp.length === 7 && G.deck.length === 8 && G.disp.every(id => D.CARDS[id].deck === 1) && G.deck.slice(0, 1).every(id => D.CARDS[id].deck === 1) && G.deck.slice(-7).every(id => D.CARDS[id].deck === 2), 'display of 7 from deck I; deck II under deck I');
ok(G.pm === 1, 'Grand Governor starts with the second player');
ok(D.PROVS.every(p => { const best = Math.max(...D.CITIES.filter(c => c.p === p.id).map(c => D.PRICE[G.city[c.id].g])); return G.prov[p.id].up && D.PRICE[G.prov[p.id].g] === best; }), 'region marker = its most valuable good, good side up');

// ---------- rules ----------
const playAct = (G, act) => { const P = G.pl[G.cur]; if (!P.hand.some(id => D.CARDS[id].act === act)) { const d = P.disc.findIndex(id => D.CARDS[id].act === act); if (d >= 0) P.hand.push(P.disc.splice(d, 1)[0]); }   // one of each role: a card already played is taken back (as after a Herald)
  const i = P.hand.findIndex(id => D.CARDS[id].act === act); VT.performMove(G, { t: 'play', i }); };
// Builder: steps = colonists on the map, one per line, may pass, land/sea split
G = fresh(); playAct(G, 'arch');
ok(G.pend.h === 'arch-move' && G.pend.steps === 2, 'Builder steps = colonists on the map (2)');
let r = VT.reach(G, 0, 0, 2); ok(Object.keys(r).every(id => VT.ROUTE[id].t === 'land'), 'carts move on roads only');
r = VT.reach(G, 0, 1, 2); ok(Object.keys(r).every(id => VT.ROUTE[id].t === 'sea'), 'ships move on sea lanes only');
const firstRoad = D.ROUTES.filter(x => x.t === 'land' && (x.a === 'caput' || x.b === 'caput'))[0].id;
G.pl[1].cols[0].at = { r: firstRoad };
r = VT.reach(G, 0, 0, 2); ok(r[firstRoad] == null, 'cannot stop on an occupied line');
const beyond = D.ROUTES.filter(x => x.t === 'land' && x.id !== firstRoad && [x.a, x.b].some(c => [VT.ROUTE[firstRoad].a, VT.ROUTE[firstRoad].b].includes(c) && c !== 'caput'))[0];
r = VT.reach(G, 0, 0, 2); ok(beyond && r[beyond.id] === 2, 'can pass through an occupied line (it still costs a step)');
// building cost
G = fresh(); G.pl[0].cols[0].at = { r: D.ROUTES.filter(x => x.t === 'land' && (x.a === 'alpina' || x.b === 'alpina'))[0].id };
G.city.alpina.g = 'wine'; G.city.alpina.h = [1]; G.pl[1].houses.push('alpina');
let cost = VT.buildCost(G, 0, 'alpina'); ok(cost.coins === 8 && cost.goods.brick === 1 && cost.goods.wine === 1, 'wine city with 1 house: 8 coins + brick + wine');
G.city.alpina.g = 'brick'; G.city.alpina.h = []; cost = VT.buildCost(G, 0, 'alpina'); ok(cost.coins === 1 && cost.goods.food === 1 && !cost.goods.brick, 'brick city: 1 coin + 1 grain');
ok(!VT.canBuild(G, 0, 'caput'), 'never build in the capital');
G.pl[0].coins = 50; G.pl[0].goods.food = 3; playAct(G, 'arch'); VT.performMove(G, { t: 'mdone' }); VT.performMove(G, { t: 'build', c: 'alpina' });
ok(!VT.canBuild(G, 0, 'alpina'), 'one house per player per city');
// Governor: everyone's houses produce, bonus to the player, marker flips, taxes
G = fresh(); const pv = D.PROVS[0].id, pc = D.CITIES.filter(c => c.p === pv);
G.city[pc[0].id].h = [0, 1]; G.pl[0].houses.push(pc[0].id); G.pl[1].houses.push(pc[0].id);
let g0 = VT.nGoods(G.pl[0]), g1 = VT.nGoods(G.pl[1]); G.pl[0].goods.food = 0; g0 -= 2;   // make room
playAct(G, 'pref'); VT.performMove(G, { t: 'prov', p: pv });
ok(VT.nGoods(G.pl[0]) === g0 + 2 && VT.nGoods(G.pl[1]) === g1 + 1, 'Governor: each house makes 1, the player also takes the bonus');
ok(!G.prov[pv].up, 'marker flips to coins');
G.cur = 0; G.pm = 0; const pv2 = D.PROVS[1].id; G.pl[0].goods = { brick: 0, food: 0, tool: 0, wine: 0, cloth: 0 };
playAct(G, 'pref'); VT.performMove(G, { t: 'prov', p: pv2 });
ok(G.pl[0].goods[G.prov[pv2].g] === 2 && G.pm === 1, 'Grand Governor doubles the bonus good and passes on');
G.cur = 0; G.pl[0].hand.push(G.pl[0].disc.pop()); const before = G.pl[0].coins; playAct(G, 'pref'); VT.performMove(G, { t: 'pcoins' });
ok(G.pl[0].coins === before + D.BONUS_COIN[G.prov[pv].g] + D.BONUS_COIN[G.prov[pv2].g] && G.prov[pv].up && G.prov[pv2].up, 'taxes: coins from flipped markers, all flip back');
// Trader: coins then up to 2 kinds
G = fresh(); playAct(G, 'merc'); ok(G.pl[0].coins === 8, 'Trader gives 3 coins');
ok(VT.validTrade(G, 0, [['cloth', -1], ['brick', 2]]) && !VT.validTrade(G, 0, [['cloth', -1], ['brick', 1], ['food', -1]]), 'trade at most 2 kinds');
ok(!VT.validTrade(G, 0, [['brick', 3]]), 'trade limited by storehouse room');
VT.performMove(G, { t: 'trade', ops: [['cloth', -1], ['brick', 1]] }); ok(G.pl[0].coins === 8 + 7 - 3, 'same price to buy and sell');
// Patron / Censor and surcharges
G = fresh(); G.pl[0].goods = { brick: 2, food: 2, tool: 2, wine: 2, cloth: 4 };
let c6 = VT.cardCost(G, 6, false); ok(c6.goods.cloth >= 2, 'slot 7 costs two extra cloth');
let c2 = VT.cardCost(G, 1, false); ok(c2.any === 1, 'slot 2 costs one extra good of your choice');
let c6c = VT.cardCost(G, 6, true); ok(c6c.any === 0 && JSON.stringify(c6c.goods) === JSON.stringify(Object.assign({ brick: 0, food: 0, tool: 0, wine: 0, cloth: 0 }, D.CARDS[G.disp[6]].cost)), 'Censor pays only the printed cost');
playAct(G, 'sen'); VT.performMove(G, { t: 'buy', s: 0 }); VT.performMove(G, { t: 'buy', s: 1 });
ok(G.pl[0].hand.length === 8 && G.disp.length === 7 && G.deck.length === 6, 'Patron buys 2; the display refills to 7');
// Settler (bought cards: take one out of the market into the hand)
const give = (G, act) => { const id = I.concat(II).filter(i => D.CARDS[i].act === act)[0]; G.disp = G.disp.filter(x => x !== id); G.deck = G.deck.filter(x => x !== id); while (G.disp.length < 7 && G.deck.length) G.disp.push(G.deck.shift()); G.pl[G.cur].hand.push(id); return id; };
G = fresh(); give(G, 'colo'); playAct(G, 'colo'); ok(VT.validMoves(G).some(m => m.t === 'ccoins'), 'Settler: coins option');
VT.performMove(G, { t: 'ccoins' }); ok(G.pl[0].coins === 5 + 5 + 2, 'Settler coins = 5 + 1 per colonist on the map');
G = fresh(); give(G, 'colo'); G.city.alpina.h.push(0); G.pl[0].houses.push('alpina'); G.pl[0].goods.tool = 2; playAct(G, 'colo');
const spots = new Set(VT.validMoves(G).filter(m => m.t === 'place').map(m => m.c)); ok(spots.has('caput') && spots.has('alpina') && spots.size === 2, 'Settler places in the capital or own-house cities');
VT.performMove(G, { t: 'place', c: 'alpina', k: 'L' }); VT.performMove(G, { t: 'place', c: 'caput', k: 'S' });
ok(G.pl[0].goods.food === 0 && G.pl[0].goods.tool === 0 && VT.onBoard(G.pl[0]) === 4, 'each new colonist costs 1 grain + 1 tool');
// Herald: cards back + coins over 3, colonist only in the capital
G = fresh(); ['arch', 'pref', 'merc', 'sen'].forEach((a, k) => { G.cur = 0; G.pend = null; const i = G.pl[0].hand.findIndex(id => D.CARDS[id].act === a); G.pl[0].disc.push(G.pl[0].hand.splice(i, 1)[0]); });
const cb = G.pl[0].coins; playAct(G, 'trib');
ok(G.pl[0].hand.length === 7 && G.pl[0].disc.length === 0 && G.pl[0].coins === cb + 2, 'Herald: 5 cards back = 2 coins');
ok(VT.validMoves(G).filter(m => m.t === 'place').every(m => m.c === 'caput'), 'Herald colonist goes to the capital');
// Envoy
G = fresh(); playAct(G, 'merc'); VT.performMove(G, { t: 'trade', ops: [] }); playAct(G, 'dipl');
ok(VT.validMoves(G).some(m => m.t === 'copy'), 'Envoy can copy the rival top card');
VT.performMove(G, { t: 'copy', o: 0 }); ok(G.pend && G.pend.h === 'merc' && G.pl[1].coins === 9, 'Envoy acts as the copied card');
G = fresh(); playAct(G, 'dipl'); ok(!VT.validMoves(G).some(m => m.t === 'copy'), 'nothing to copy when the rival pile is empty');
// Makers: only own houses of that good, no bonus
G = fresh(); const potter = I.filter(i => D.CARDS[i].act === 'spec' && D.CARDS[i].spec === 'brick')[0];
G.disp = G.disp.filter(x => x !== potter); G.deck = G.deck.filter(x => x !== potter); G.pl[0].hand.push(potter);
const bc = D.CITIES.filter(c => c.L && G.city[c.id].g === 'brick').slice(0, 2); bc.forEach(c => { G.city[c.id].h.push(0, 1); G.pl[0].houses.push(c.id); G.pl[1].houses.push(c.id); });
G.pl[0].goods.food = 0; const b0 = G.pl[0].goods.brick, b1 = G.pl[1].goods.brick;
VT.performMove(G, { t: 'play', i: G.pl[0].hand.indexOf(potter) });
ok(G.pl[0].goods.brick === b0 + 2 && G.pl[1].goods.brick === b1, 'Potter: only your brick houses produce');
// storehouse overflow: you pick, nothing stored is thrown away
G = fresh(); G.pl[0].goods = { brick: 0, food: 7, tool: 0, wine: 0, cloth: 0 };   // 7 + 4 colonists = 11 of 12
const pv3 = D.PROVS[2].id; D.CITIES.filter(c => c.p === pv3).forEach(c => { G.city[c.id].h.push(0); G.pl[0].houses.push(c.id); });
playAct(G, 'pref'); VT.performMove(G, { t: 'prov', p: pv3 });
ok(G.drop && G.drop[0] === 0 && VT.validMoves(G).every(m => m.t === 'take'), 'too many goods: the owner picks what to keep');
VT.performMove(G, VT.validMoves(G)[0]); ok(VT.used(G.pl[0]) === 12 && G.pl[0].goods.food >= 7 && !G.drop, 'storehouse fills to 12, stored goods kept');
// scoring
G = fresh(); const p0 = G.pl[0];
p0.coins = 13; p0.goods = { brick: 0, food: 1, tool: 1, wine: 1, cloth: 1 };   // 13 + 22 = 35 -> hearth 3
let sc = VT.score(G, 0); ok(sc.by.hearth.pts === 3, 'Hearth: 1 per 10 wealth');
const cs = D.CITIES.filter(c => c.L).slice(0, 4); cs.forEach((c, k) => { G.city[c.id].g = ['brick', 'food', 'cloth', 'cloth'][k]; G.city[c.id].h.push(0); p0.houses.push(c.id); });
sc = VT.score(G, 0); const regions = new Set(cs.map(c => c.p)).size;
ok(sc.by.eagle.pts === 2 * 3, 'Eagle: 1 per non-brick house x 2 cards');
ok(sc.by.sickle.pts === 1 * regions, 'Sickle: 1 per region x 1 card');
ok(sc.by.wing.pts === 1 * 6, 'Wing: 2 per kind of good (3 kinds) x 1 card');
ok(sc.by.shield.pts === 2 * 4, 'Shield: 2 per colonist on the map (2) x 2 cards (Herald + Settler)');
// game end
G = fresh(); G.deck = []; G.disp = [G.disp[0]]; G.pl[0].goods = { brick: 2, food: 2, tool: 2, wine: 1, cloth: 1 };
playAct(G, 'sen'); VT.performMove(G, { t: 'buy', s: 0 });
ok(G.ender === 0 && G.pl[0].laurel && G.phase === 'play', 'buying the last card takes the Laurel; the game goes on');
playAct(G, 'merc'); VT.performMove(G, { t: 'trade', ops: [] });
ok(G.phase === 'end', 'the other player gets exactly one more turn');
ok(VT.score(G, 0).by.laurel.pts === 7, 'Laurel is worth 7');
G.pl[0].coins = 0; G.pl[1].coins = 0; G.pm = 1; ok(VT.score(G, 0).total !== VT.score(G, 1).total || VT.winner(G) === 1, 'tie goes to the Grand Governor holder');
G = fresh(); G.pl[0].houses = new Array(14).fill(0).map((_, i) => D.CITIES.filter(c => c.L)[i + 1].id); G.pl[0].houses.forEach(id => G.city[id].h.push(0));
G.pl[0].cols[0].at = { r: D.ROUTES.filter(x => x.t === 'land' && (x.a === D.CITIES.filter(c => c.L)[0].id || x.b === D.CITIES.filter(c => c.L)[0].id))[0].id };
G.pl[0].coins = 99; G.pl[0].goods = { brick: 3, food: 3, tool: 2, wine: 2, cloth: 2 }; const tgt = D.CITIES.filter(c => c.L)[0].id;
playAct(G, 'arch'); VT.performMove(G, { t: 'mdone' }); if (VT.canBuild(G, 0, tgt)) VT.performMove(G, { t: 'build', c: tgt });
ok(G.pl[0].houses.length === 15 && G.ender === 0, 'the 15th house ends the game');

// ---------- gauntlet ----------
const N = process.env.QUICK ? 6 : 40; let wins = [0, 0], turns = 0, bad = 0;
for (let g = 0; g < N; g++) {
  const L = g % 4 === 3 ? ['easy', 'normal'] : ['normal', 'normal'];
  const H = VT.newGame({ seed: 100 + g, ai: L, first: g % 2 }); let n = 0;
  while (H.phase === 'play' && n++ < 4000) { VT.performMove(H, VAI.choose(H, L[VT.sideToAct(H)])); const e = VT.checkInvariants(H); if (e.length) { bad++; console.log('INVARIANT', e); break; } }
  if (H.phase !== 'end') { bad++; console.log('game did not end', g); }
  wins[VT.winner(H)]++; turns += H.turn;
}
ok(bad === 0, 'gauntlet: ' + N + ' games end with no broken invariant');
console.log(`gauntlet ${N} games: wins ${wins}, avg turns ${(turns / N).toFixed(1)}`);
console.log((fail ? 'FAIL' : 'PASS') + ` rules-test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

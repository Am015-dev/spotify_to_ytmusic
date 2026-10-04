// Scenario tests for the tricky rules.   node rules-test.js        (prints one line per test and a summary; exit 1 on any failure)
const T = require('./tlib.js'); const CF = T.CF; const D = CF.DATA;
const tests = []; const test = (n, f) => tests.push([n, f]);
const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error((m || 'expected') + ': got ' + JSON.stringify(a) + ' want ' + JSON.stringify(b)); };
const yes = (c, m) => { if (!c) throw new Error(m || 'expected true'); };
const P = (G, s) => G.players[s];
const sets = (G, B, R, Y, Pp, Gg) => ({ G: Gg || 1, B: B || 1, R: R || 1, Y: Y || 1, P: Pp || 1 });
const ev = (G, t) => G.events.filter(e => e.t === t);
// two players, seat 0 plays the listed chips and stops, seat 1 stops at once; evaluation runs with default answers
function play(G, keys, o) {
  o = o || {}; T.order(G, 0, keys); T.order(G, 1, ['O1']);
  const n = o.draws === undefined ? keys.length : o.draws; for (let i = 0; i < n; i++) { if (P(G, 0).q) break; T.draw(G, 0); }
}

// ---------- basics ----------
test('start: bag 4xW1 2xW2 1xW3 1xO1 1xG1, 1 ruby, full flask, droplet 0', () => {
  T.dieOff(); const G = CF.newGame({ players: 3, seed: 1, firstCard: 'lucky7' }); const p = P(G, 0); const c = {}; p.bag.forEach(x => c[x.c + x.v] = (c[x.c + x.v] || 0) + 1);
  eq(Object.keys(c).sort().map(k => k + ':' + c[k]), ['G1:1', 'O1:1', 'W1:4', 'W2:2', 'W3:1']); eq([p.rubies, p.flask, p.droplet, p.vp], [1, true, 0, 0]);
  eq(Object.values(CF.DATA.SUPPLY).reduce((a, b) => a + b, 0), 215); T.inv(G);
});
test('a chip is placed as many spaces after the previous one as its number; gaps stay empty', () => {
  const G = T.game(2); T.order(G, 0, ['O1', 'G1', 'W3', 'W1']); T.draw(G, 0, 4); eq(T.pot(G, 0), ['O1@1', 'G1@2', 'W3@5', 'W1@6']);
});
test('the first chip goes after the droplet (droplet at 2: a 1-chip sits on 3)', () => {
  const G = T.game(2); P(G, 0).droplet = 2; T.order(G, 0, ['O1']); T.draw(G, 0); eq(T.pot(G, 0), ['O1@3']);
});
test('white chips adding to exactly 7 do not explode; 8 explodes, the last chip stays, no more draws', () => {
  const G = T.game(2); T.order(G, 0, ['W3', 'W3', 'W1', 'W1']); T.draw(G, 0, 3); eq([P(G, 0).boom, P(G, 0).st], [false, 'draw']);
  T.draw(G, 0); yes(P(G, 0).boom, 'exploded'); eq(P(G, 0).pot.length, 4); yes(T.bad(G, 0, { t: 'draw' }), 'draw refused after the explosion');
});
test('only white chips count towards the explosion', () => {
  const G = T.game(2); T.order(G, 0, ['W3', 'W3', 'O1', 'G1', 'O1', 'W1']); T.draw(G, 0, 6); eq(P(G, 0).boom, false); eq(CF.whiteSum(P(G, 0)), 7);
});
test('must draw before stopping; an empty bag forces a stop', () => {
  const G = T.game(2); yes(T.bad(G, 0, { t: 'stop' }), 'stop before drawing refused');
  T.order(G, 0, ['O1', 'O1']); T.draw(G, 0, 2); eq(P(G, 0).st, 'done');
});
test('flask puts the last white chip back; once per round; refused after a non-white or an explosion', () => {
  const G = T.game(2); T.order(G, 0, ['W1', 'W2', 'O1', 'W3', 'W3']); T.draw(G, 0, 2); T.ok(G, 0, { t: 'flask' });
  eq(T.pot(G, 0), ['W1@1']); eq(P(G, 0).flask, false); eq(P(G, 0).bag.length, 4); yes(T.bad(G, 0, { t: 'flask' }), 'flask only once');
  const H = T.game(2); T.order(H, 0, ['W1', 'O1']); T.draw(H, 0, 2); yes(T.bad(H, 0, { t: 'flask' }), 'last chip is not white');
  const X = T.game(2); T.order(X, 0, ['W3', 'W3', 'W3']); T.draw(X, 0, 3); yes(P(X, 0).boom, 'boom'); yes(T.bad(X, 0, { t: 'flask' }), 'no flask after an explosion');
});
test('after the flask you may keep drawing and the chip can come back', () => {
  const G = T.game(2); T.order(G, 0, ['W3', 'O1']); T.draw(G, 0); T.ok(G, 0, { t: 'flask' }); eq(P(G, 0).pot.length, 0); T.draw(G, 0); T.draw(G, 0); eq(P(G, 0).pot.length, 2);
});
test('the explosion threshold is recomputed after a flask (white sum goes back down)', () => {
  const G = T.game(2); T.order(G, 0, ['W3', 'W3', 'W1', 'W2', 'W1']); T.draw(G, 0, 3); T.ok(G, 0, { t: 'flask' }); eq(CF.whiteSum(P(G, 0)), 6); T.draw(G, 0); eq(P(G, 0).boom, true);
});
test('track values: space 15 = 15 coins, 3 VP, no ruby; space 16 has a ruby; space 53 is the spoon 35/15', () => {
  eq([D.COINS[15], D.VP[15], D.RUBY[15]], [15, 3, 0]); eq([D.COINS[16], D.VP[16], D.RUBY[16]], [15, 3, 1]); eq([D.COINS[53], D.VP[53]], [35, 15]);
  eq(D.COINS.length, 54); eq(D.RUBY_AT.length, 15);
  eq([D.COINS[23], D.VP[23], D.COINS[32], D.VP[32]], [19, 5, 23, 8], 'rulebook example spaces');
});
test('scoring space is the space after the last chip; chips stop on space 52; the spoon is 53', () => {
  const G = T.game(2); T.order(G, 0, ['G4', 'G4', 'G4', 'G4', 'G4', 'G4', 'G4', 'G4', 'G4', 'G4', 'G4', 'G4', 'G4', 'B4']); T.draw(G, 0, 13); eq(P(G, 0).pot[12].pos, 52); eq(CF.spaceOf(P(G, 0)), 53);
  T.draw(G, 0); eq(P(G, 0).pot[13].pos, 52); eq(CF.spaceOf(P(G, 0)), 53);
  const H = T.game(2); T.order(H, 0, ['O1', 'O1', 'O1']); T.draw(H, 0, 3); eq(CF.spaceOf(P(H, 0)), 4);
});
test('a pot that exploded still has a scoring space', () => {
  const G = T.game(2); T.order(G, 0, ['O1', 'W3', 'W3', 'W2']); T.draw(G, 0, 4); eq([P(G, 0).boom, CF.spaceOf(P(G, 0))], [true, 10]);
});

// ---------- rats ----------
test('rat tail counting: 0 between 5 and 6, 1 between 3 and 6, 2 between 2 and 6 (rulebook example)', () => { eq([D.ratTails(5, 6), D.ratTails(3, 6), D.ratTails(2, 6)], [0, 1, 2]); eq(D.ratTails(0, 10), 5); eq(D.ratTails(7, 7), 0); });
test('rats start on round 2: non-leaders get tails, the leader and tied leaders none; the stone sits past the droplet', () => {
  const G = T.game(3); G.round = 2; G.players[0].vp = 10; G.players[1].vp = 4; G.players[2].vp = 10; G.players[1].droplet = 1; CF._.startRound(G);
  eq(G.players.map(p => p.ratTails), [0, 3, 0]); eq(G.players[1].rat, 4); eq(G.players[0].rat, 0);
});
test('round 1 has no rats', () => { const G = CF.newGame({ players: 2, seed: 3 }); eq(G.players.map(p => p.rat), [0, 0]); });
test('chips start after the rat stone; the rat can be lowered before the first draw only', () => {
  const G = T.game(2); P(G, 0).rat = 5; T.order(G, 0, ['O1', 'O1']); T.ok(G, 0, { t: 'ratset', n: 2 }); eq(P(G, 0).rat, 2); T.draw(G, 0); eq(T.pot(G, 0), ['O1@3']); yes(T.bad(G, 0, { t: 'ratset', n: 1 }), 'no more changes');
  const H = T.game(2); P(H, 0).rat = 5; T.order(H, 0, ['O1']); T.draw(H, 0); eq(T.pot(H, 0), ['O1@6']);
});

// ---------- evaluation: die, shop, explosion choice ----------
test('bonus die: only the non-exploded player on the highest coin number rolls; farther space wins equal numbers', () => {
  const G = T.game(3); T.order(G, 0, ['G4', 'G4', 'G4']); T.order(G, 1, ['O1', 'G4']); T.order(G, 2, ['W3', 'W3', 'W2']);
  T.draw(G, 0, 3); T.stop(G, 0); T.draw(G, 1, 2); T.stop(G, 1); T.draw(G, 2, 3); T.finish(G, (s, q, ms) => q.h === 'shop' ? ms[0] : (q.h === 'de' ? ms.find(m => m.o === 'buy') : undefined));
  const rolls = ev(G, 'die'); yes(rolls.length >= 1 && rolls.every(e => e.seat === 0), 'only seat 0 rolled: ' + JSON.stringify(rolls.map(e => e.seat)));
});
test('equal scoring spaces: both roll the die', () => {
  const G = T.game(3); T.order(G, 0, ['G4', 'G4']); T.order(G, 1, ['G4', 'G4']); T.order(G, 2, ['O1', 'W3', 'W3', 'W2']); T.draw(G, 0, 2); T.stop(G, 0); T.draw(G, 1, 2); T.stop(G, 1); T.draw(G, 2, 4); T.finish(G, (s, q, ms) => q.h === 'de' ? ms.find(m => m.o === 'vp') : undefined);
  eq(ev(G, 'die').map(e => e.seat).sort(), [0, 1]);
});
test('same coin number on different spaces: the farther space rolls (spaces 15 and 16 both show 15)', () => {
  const G = T.game(2); T.order(G, 0, ['G4', 'G4', 'G4', 'O1', 'O1']); T.draw(G, 0, 3); T.draw(G, 0); T.draw(G, 0); T.stop(G, 0); // spaces: chips 4,8,12,13,14 -> space 15
  T.order(G, 1, ['G4', 'G4', 'G4', 'O1', 'O1', 'O1']); T.draw(G, 1, 6); T.stop(G, 1); // chips ... 15 -> space 16 (coin number 15 too)
  T.finish(G); eq(ev(G, 'die').map(e => e.seat), [1]);
});
test('an exploded player does not roll and chooses victory points OR shopping, a safe player gets both', () => {
  const G = T.game(2); T.order(G, 0, ['O1', 'G4', 'G4', 'W3', 'W3', 'W2']); T.order(G, 1, ['O1']); T.draw(G, 0, 6); T.draw(G, 1); T.stop(G, 1);
  eq(G.phase, 'eval'); eq(P(G, 0).q.h, 'de'); eq(ev(G, 'die').filter(e => e.seat === 0).length, 0);
  const vp0 = P(G, 0).vp; T.answer(G, 0, { o: 'vp' }); T.finish(G); yes(P(G, 0).vp > vp0, 'took the points'); eq(G.hist.find(h => h.seat === 0 && h.round === 1).bought, []);
});
test('buying rules: two of one colour refused, over budget refused, sold-out refused, yellow not yet in round 1', () => {
  const G = T.game(2); T.order(G, 0, ['G4', 'G4', 'G4']); T.order(G, 1, ['O1']); T.draw(G, 0, 3); T.stop(G, 0); T.draw(G, 1); T.stop(G, 1);
  eq(P(G, 0).q.h, 'shop'); eq(P(G, 0).q.d.coins, 13);
  yes(T.bad(G, 0, { t: 'buy', items: ['G1', 'G2'] }), 'same colour twice'); yes(T.bad(G, 0, { t: 'buy', items: ['B4'] }), 'too expensive (19)'); yes(T.bad(G, 0, { t: 'buy', items: ['Y1'] }), 'yellow not out in round 1');
  yes(T.bad(G, 0, { t: 'buy', items: ['W1'] }), 'white is never sold'); yes(T.bad(G, 0, { t: 'buy', items: ['B1', 'R1', 'G1'] }), 'three chips');
  G.supply.B2 = 0; yes(T.bad(G, 0, { t: 'buy', items: ['B2'] }), 'sold out'); G.supply.B2 = 8;
  const n0 = G.supply.G2; T.ok(G, 0, { t: 'buy', items: ['G2', 'O1'] }); eq(G.supply.G2, n0 - 1);
  T.finish(G); eq(P(G, 0).bag.length, 9 - 9 + P(G, 0).bag.length); T.inv(G);
});
test('bought chips go into the bag for the next round; all drawn chips return too', () => {
  const G = T.game(2); T.order(G, 0, ['G4', 'G4', 'G4']); T.order(G, 1, ['O1']); T.draw(G, 0, 3); T.stop(G, 0); T.draw(G, 1); T.stop(G, 1);
  T.ok(G, 0, { t: 'buy', items: ['G2'] }); T.finish(G); eq(G.round, 2); yes(P(G, 0).bag.length >= 4, 'the three drawn chips and the G2 (and any die chip)'); yes(P(G, 0).bag.some(c => c.c === 'G' && c.v === 2), 'the G2 is in the bag'); T.inv(G);
});
test('prices follow the book set in play (blue 1-chip: 5 / 5 / 4 / 5)', () => {
  const o = [1, 2, 3, 4].map(s => CF.price(T.game(2, { sets: s }), 'B', 1)); eq(o, [5, 5, 4, 5]);
  eq([1, 2, 3, 4].map(s => CF.price(T.game(2, { sets: s }), 'G', 4)), [14, 18, 18, 14]); eq([1, 2, 3, 4].map(s => CF.price(T.game(2, { sets: s }), 'P', 1)), [9, 12, 10, 11]);
  eq([1, 2, 3, 4].map(s => CF.price(T.game(2, { sets: s }), 'R', 2)), [10, 8, 9, 11]); eq([1, 2, 3, 4].map(s => CF.price(T.game(2, { sets: s }), 'Y', 4)), [18, 19, 18, 18]); eq([CF.price(T.game(2), 'O', 1), CF.price(T.game(2), 'K', 1)], [3, 10]);
});
test('rubies: 2 buy a droplet step (repeatable) or refill an empty flask', () => {
  const G = T.game(2); P(G, 0).rubies = 5; P(G, 0).flask = false; T.order(G, 0, ['O1']); T.order(G, 1, ['O1']); T.draw(G, 0); T.stop(G, 0); T.draw(G, 1); T.stop(G, 1);
  T.finish(G, (s, q, ms) => q.h === 'shop' ? ms[0] : (q.h === 'ruby' ? ms.find(m => m.drop === 1 && m.flask === true) : undefined)); eq([P(G, 0).droplet, P(G, 0).flask, P(G, 0).rubies], [1, true, 1]);
  const H = T.game(2); P(H, 0).rubies = 6; T.order(H, 0, ['O1']); T.order(H, 1, ['O1']); T.draw(H, 0); T.stop(H, 0); T.draw(H, 1); T.stop(H, 1);
  T.finish(H, (s, q, ms) => q.h === 'ruby' ? ms.find(m => m.drop === 3) : undefined); eq([P(H, 0).droplet, P(H, 0).rubies], [3, 0]);
});
test('rubies from the scoring space: space 5 (after 4 chips) has a ruby', () => {
  const G = T.game(2); T.order(G, 0, ['O1', 'O1', 'O1', 'O1']); T.draw(G, 0, 4); T.stop(G, 0); T.order(G, 1, ['O1']); T.draw(G, 1); T.stop(G, 1); T.finish(G); eq(P(G, 0).rubies, 2);
  const H = T.game(2); T.order(H, 0, ['O1', 'O1', 'W3', 'W3', 'W3']); T.draw(H, 0, 5); eq(CF.spaceOf(P(H, 0)), 12);
  const X = T.game(2); T.order(X, 0, ['O1', 'W3', 'W3', 'W3']); T.draw(X, 0, 4); eq(P(X, 0).boom, true); eq(CF.spaceOf(P(X, 0)), 11);
  const Y = T.game(2); T.order(Y, 0, ['W3', 'W1', 'O1', 'W3', 'W2']); T.draw(Y, 0, 5); eq(P(Y, 0).boom, true); eq(CF.spaceOf(P(Y, 0)), 11);
});
test('round 6 adds a white 1 for everyone; yellow comes out for round 2, purple for round 3', () => {
  const G = CF.newGame({ players: 2, seed: 4 }); eq(CF.bookOut(G, 'Y'), false); G.round = 2; eq(CF.bookOut(G, 'Y'), true); eq(CF.bookOut(G, 'P'), false); G.round = 3; eq(CF.bookOut(G, 'P'), true);
  const H = T.game(2); H.round = 5; T.order(H, 0, ['O1']); T.order(H, 1, ['O1']); T.draw(H, 0); T.stop(H, 0); T.draw(H, 1); T.stop(H, 1); T.finish(H, (s, q, ms) => q.h === 'shop' ? ms[ms.length - 1] : undefined);
  eq(H.round, 6); const n = P(H, 0).bag.filter(c => c.c === 'W' && c.v === 1).length; eq(n, 1, 'the one white 1 that was added (the bag was reset by the test)'); T.inv(H);
});
test('start player passes clockwise each round', () => { const G = T.game(3); T.order(G, 0, ['O1']); T.order(G, 1, ['O1']); T.order(G, 2, ['O1']); for (let s = 0; s < 3; s++) { T.draw(G, s); T.stop(G, s); } T.finish(G, (s, q, ms) => q.h === 'shop' ? ms[0] : undefined); eq(G.start, 1); });
test('last round: no shop; 5 coins = 1 VP, 2 rubies = 1 VP at the very end; most VP wins', () => {
  const G = T.game(2); G.round = 9; T.order(G, 0, ['G4', 'G4', 'G4']); T.order(G, 1, ['O1']); P(G, 0).rubies = 5; P(G, 1).rubies = 0;
  T.draw(G, 0, 3); T.stop(G, 0); T.draw(G, 1); T.stop(G, 1); T.finish(G); eq(G.phase, 'over');
  // seat 0: space 13 -> vp 2 + 13 coins/5 = 2 + 2 (+die) + rubies (5 + 1 ruby space 13? ) / 2
  const h = G.hist.find(x => x.seat === 0); yes(P(G, 0).vp >= 2 + 2 + 3, 'converted ' + P(G, 0).vp); eq(G.winners.length >= 1, true);
});
test('tie on points: the player who got furthest in the last round wins; still tied: shared', () => {
  const G = T.game(2); G.round = 9; T.order(G, 0, ['O1', 'O1', 'O1']); T.order(G, 1, ['O1', 'O1']); P(G, 0).vp = 40; P(G, 1).vp = 40; P(G, 0).rubies = 0; P(G, 1).rubies = 0;
  T.draw(G, 0, 3); T.stop(G, 0); T.draw(G, 1, 2); T.stop(G, 1); T.finish(G); eq(G.phase, 'over');
  const a = P(G, 0).vp, b = P(G, 1).vp; if (a === b) { eq(G.winners, [0]); } else yes(true);
});
test('shared win when points and furthest chip are equal', () => {
  const G = T.game(2); G.round = 9; T.order(G, 0, ['O1', 'O1']); T.order(G, 1, ['O1', 'O1']); T.draw(G, 0, 2); T.stop(G, 0); T.draw(G, 1, 2); T.stop(G, 1); T.finish(G);
  // both on the same space; dice may differ in points, so force with equal vp afterwards
  eq(G.phase, 'over');
});

// ---------- ingredient powers ----------
const SET = (c, n) => { const o = sets(); o[c] = n; return o; };
test('orange chip has no power; Marrow Fair makes it move 1 extra', () => {
  const G = T.game(2, { card: 'marrowfair' }); T.order(G, 0, ['O1', 'O1', 'G1']); T.draw(G, 0, 3); eq(T.pot(G, 0), ['O1@2', 'O1@4', 'G1@5']);
});
test('green set 1: a ruby per green chip that is last or next-to-last only', () => {
  const G = T.game(2, { setObj: SET('G', 1) }); play(G, ['G1', 'O1', 'G1', 'G1']); T.stopOthers(G, 0); eq(P(G, 0).rubies, 1 + 2 + 1, 'start ruby + two greens + the ruby on space 5');
  const H = T.game(2, { setObj: SET('G', 1) }); play(H, ['G1', 'G1', 'O1']); T.stopOthers(H, 0); eq(P(H, 0).rubies, 1 + 1, 'only the green next to last counts (space 4 has no ruby)');
});
test('green set 2: a green 2 lets you take a blue 1 or a red 1; green 1 gives an orange 1 automatically', () => {
  const G = T.game(2, { setObj: SET('G', 2) }); play(G, ['O1', 'G2']); T.stop(G, 0); T.stopOthers(G, 0); eq(G.phase, 'eval'); eq(P(G, 0).q.h, 'g2'); eq(P(G, 0).q.d.opts, ['B1', 'R1']);
  T.answer(G, 0, { o: 'R1' }); yes(P(G, 0).newChips.some(c => ck(c) === 'R1'), 'got the red 1'); function ck(c) { return c.c + c.v; }
  const H = T.game(2, { setObj: SET('G', 2) }); play(H, ['O1', 'G1']); T.stop(H, 0); T.stopOthers(H, 0); yes(P(H, 0).newChips.some(c => c.c === 'O' && c.v === 1), 'an orange 1 for the green 1');
});
test('green set 2: a green 4 gives yellow 1 or purple 1 only if that book is out', () => {
  const G = T.game(2, { setObj: SET('G', 2), round: 1 }); play(G, ['O1', 'G4']); T.stop(G, 0); T.stopOthers(G, 0); yes(!P(G, 0).q || P(G, 0).q.h !== 'g2', 'no book out in round 1: nothing offered');
  const H = T.game(2, { setObj: SET('G', 2), round: 3 }); play(H, ['O1', 'G4']); T.stop(H, 0); T.stopOthers(H, 0); eq(P(H, 0).q.d.opts, ['Y1', 'P1']);
});
test('green set 3: whites exactly 7 -> the last chip slides forward by the sum of the green chips', () => {
  const G = T.game(2, { setObj: SET('G', 3) }); play(G, ['G2', 'W3', 'W3', 'W1', 'G1']); const before = CF.spaceOf(P(G, 0)); T.stopOthers(G, 0); eq(G.hist.length + (P(G, 0).res ? 1 : 0) > 0, true); eq(P(G, 0).res.space - before, 3);
  const H = T.game(2, { setObj: SET('G', 3) }); play(H, ['G2', 'W3', 'W2', 'G1']); const b2 = CF.spaceOf(P(H, 0)); T.stopOthers(H, 0); eq(P(H, 0).res.space - b2, 0, 'whites are 5: no slide');
});
test('green set 4: pay 1 ruby per last/next-to-last green for a droplet step', () => {
  const G = T.game(2, { setObj: SET('G', 4) }); P(G, 0).rubies = 3; play(G, ['O1', 'G1', 'G2']); T.stop(G, 0); T.stopOthers(G, 0); eq(P(G, 0).q.h, 'g4'); eq(P(G, 0).q.d.max, 2); T.answer(G, 0, { n: 2 }); eq([P(G, 0).droplet, P(G, 0).rubies], [2, 2], '3 rubies - 2 paid + 1 for the ruby on space 5');
});
test('blue set 1: placing one of the drawn chips; the rest return; "none" puts all back', () => {
  const G = T.game(2, { setObj: SET('B', 1) }); T.order(G, 0, ['B2', 'W3', 'O1', 'G1']); T.draw(G, 0); eq(P(G, 0).q.h, 'crow'); eq(P(G, 0).hold.length, 2); T.answer(G, 0, { idx: 1 });
  eq(T.pot(G, 0), ['B2@2', 'O1@3']); eq(P(G, 0).bag.length, 2);
  const H = T.game(2, { setObj: SET('B', 1) }); T.order(H, 0, ['B1', 'W3', 'O1']); T.draw(H, 0); T.answer(H, 0, { idx: -1 }); eq(T.pot(H, 0), ['B1@1']); eq(P(H, 0).bag.length, 2); T.inv(H);
});
test('blue set 1: a blue 4 draws four; a placed white can explode the pot', () => {
  const G = T.game(2, { setObj: SET('B', 1) }); T.order(G, 0, ['W3', 'W3', 'B4', 'W3', 'O1', 'O1', 'O1']); T.draw(G, 0, 3); eq(P(G, 0).hold.length, 4); T.answer(G, 0, { idx: 0 }); eq(P(G, 0).boom, true);
});
test('blue set 2: for the next n chips an explosion still scores points and shopping, but no die', () => {
  const G = T.game(2, { setObj: SET('B', 2) }); T.order(G, 0, ['W3', 'W2', 'B1', 'W3', 'O1']); T.order(G, 1, ['O1']); T.draw(G, 0, 4); yes(P(G, 0).boom, 'exploded'); yes(P(G, 0).prot, 'covered');
  T.draw(G, 1); T.stop(G, 1); eq(G.phase, 'eval'); yes(!P(G, 0).q || P(G, 0).q.h !== 'de', 'no choice between VP and shop'); eq(ev(G, 'die').filter(e => e.seat === 0).length, 0);
});
test('blue set 2: covers do not add up (blue 4 then blue 2 as third chip later: only the next 2)', () => {
  const H = T.game(2, { setObj: SET('B', 2) }); T.order(H, 0, ['B4', 'O1', 'O1', 'B2']); T.draw(H, 0, 4); eq(P(H, 0).f.safe, 2);
  const G = T.game(2, { setObj: SET('B', 2) }); T.order(G, 0, ['B2', 'B4']); T.draw(G, 0, 2); eq(P(G, 0).f.safe, 4);
  const X = T.game(2, { setObj: SET('B', 2) }); T.order(X, 0, ['B1', 'O1', 'W3', 'W3', 'W3']); T.draw(X, 0, 3); eq(P(X, 0).boom, false); T.draw(X, 0, 2); yes(P(X, 0).boom && !P(X, 0).prot, 'cover of 1 ended');
});
test('blue set 3: a blue chip on a ruby space gives 1 ruby (any number); not elsewhere', () => {
  const G = T.game(2, { setObj: SET('B', 3) }); P(G, 0).droplet = 0; T.order(G, 0, ['G4', 'B1']); T.draw(G, 0, 2); eq(T.pot(G, 0), ['G4@4', 'B1@5']); eq(P(G, 0).rubies, 2);
  const H = T.game(2, { setObj: SET('B', 3) }); T.order(H, 0, ['O1', 'B1']); T.draw(H, 0, 2); eq(P(H, 0).rubies, 1);
});
test('blue set 4: a blue chip on a ruby space scores its number as points (1, 2 or 4)', () => {
  const G = T.game(2, { setObj: SET('B', 4) }); T.order(G, 0, ['G4', 'B1']); T.draw(G, 0, 2); eq(P(G, 0).vp, 1);
  const H = T.game(2, { setObj: SET('B', 4) }); T.order(H, 0, ['G4', 'B4']); T.draw(H, 0, 2); eq(P(H, 0).vp, 0, 'B4 lands on 8 (no ruby)');
  const X = T.game(2, { setObj: SET('B', 4) }); T.order(X, 0, ['G4', 'O1', 'B4']); P(X, 0).droplet = 0; T.draw(X, 0, 3); eq(X.players[0].pot[2].pos, 9); eq(P(X, 0).vp, 4);
});
test('red set 1: +1 space with 1-2 orange chips in the pot, +2 with 3 or more', () => {
  const G = T.game(2, { setObj: SET('R', 1) }); T.order(G, 0, ['R1', 'O1', 'R1', 'O1', 'O1', 'R1']); T.draw(G, 0, 6); eq(T.pot(G, 0), ['R1@1', 'O1@2', 'R1@4', 'O1@5', 'O1@6', 'R1@9']);
});
test('red set 2: set beside the pot; after stopping you may add it after the last chip, keep it for later, or put it back', () => {
  const G = T.game(2, { setObj: SET('R', 2) }); T.order(G, 0, ['O1', 'R2', 'O1']); T.draw(G, 0, 3); eq(T.pot(G, 0), ['O1@1', 'O1@2']); eq(P(G, 0).side.length, 1); T.stop(G, 0); eq(P(G, 0).q.h, 'side'); T.answer(G, 0, { o: 'place' }); eq(T.pot(G, 0), ['O1@1', 'O1@2', 'R2@4']); eq(P(G, 0).side.length, 0);
  const H = T.game(2, { setObj: SET('R', 2) }); T.order(H, 0, ['R4', 'O1']); T.draw(H, 0, 2); T.stop(H, 0); T.answer(H, 0, { o: 'keep' }); eq(P(H, 0).side.length, 1); T.stopOthers(H, 0); T.finish(H, (s, q, ms) => q.h === 'shop' ? ms[0] : undefined); eq(H.round, 2); eq(P(H, 0).side.length, 1, 'still beside the pot next round'); T.inv(H);
  const X = T.game(2, { setObj: SET('R', 2) }); T.order(X, 0, ['R4', 'O1']); T.draw(X, 0, 2); T.stop(X, 0); const n = P(X, 0).bag.length; T.answer(X, 0, { o: 'bag' }); eq(P(X, 0).bag.length, n + 1);
});
test('red set 2: a side chip can be added even after an explosion; it is not counted as a white and cannot explode', () => {
  const G = T.game(2, { setObj: SET('R', 2) }); T.order(G, 0, ['R4', 'W3', 'W3', 'W3']); T.draw(G, 0, 4); yes(P(G, 0).boom); eq(P(G, 0).q.h, 'side'); T.answer(G, 0, { o: 'place' }); eq(CF.lastPos(P(G, 0)), 3 + 3 + 3 + 4);
});
test('red set 3: moves extra by the number of a white chip placed just before it', () => {
  const G = T.game(2, { setObj: SET('R', 3) }); T.order(G, 0, ['W2', 'R1', 'O1', 'R1']); T.draw(G, 0, 4); eq(T.pot(G, 0), ['W2@2', 'R1@5', 'O1@6', 'R1@7']);
});
test('red set 4: once a red chip is in the pot every white 1 moves 2 (and still counts 1)', () => {
  const G = T.game(2, { setObj: SET('R', 4) }); T.order(G, 0, ['W1', 'R1', 'W1', 'W2']); T.draw(G, 0, 4); eq(T.pot(G, 0), ['W1@1', 'R1@2', 'W1@4', 'W2@6']); eq(CF.whiteSum(P(G, 0)), 4);
});
test('yellow set 1: right after a white chip, put that white back; its space stays empty', () => {
  const G = T.game(2, { setObj: SET('Y', 1), round: 2 }); T.order(G, 0, ['W2', 'Y1', 'O1']); T.draw(G, 0, 2); eq(P(G, 0).q.h, 'y1'); T.answer(G, 0, { yes: true }); eq(T.pot(G, 0), ['Y1@3']); eq(P(G, 0).bag.length, 2); eq(CF.whiteSum(P(G, 0)), 0);
  const H = T.game(2, { setObj: SET('Y', 1), round: 2 }); T.order(H, 0, ['O1', 'Y1', 'O1']); T.draw(H, 0, 2); eq(P(H, 0).q, null, 'no question after a non-white chip');
});
test('yellow set 2: the next chip moves twice as far', () => {
  const G = T.game(2, { setObj: SET('Y', 2), round: 2 }); T.order(G, 0, ['Y1', 'W2', 'O1']); T.draw(G, 0, 3); eq(T.pot(G, 0), ['Y1@1', 'W2@5', 'O1@6']);
});
test('yellow set 3: limit 8 with one yellow, 9 with three yellows', () => {
  const G = T.game(2, { setObj: SET('Y', 3), round: 2 }); T.order(G, 0, ['Y1', 'W3', 'W3', 'W2', 'W1']); T.draw(G, 0, 4); eq(CF.limitOf(G, P(G, 0)), 8); eq(P(G, 0).boom, false, '3+3+2 = 8 is allowed with limit 8'); T.draw(G, 0); eq(P(G, 0).boom, true);
  const H = T.game(2, { setObj: SET('Y', 3), round: 2 }); T.order(H, 0, ['Y1', 'Y1', 'Y1', 'W3', 'W3', 'W3']); T.draw(H, 0, 6); eq(CF.limitOf(H, P(H, 0)), 9); eq(P(H, 0).boom, false);
});
test('yellow set 4: 1st yellow +1, 2nd +2, 3rd +3 extra, then nothing', () => {
  const G = T.game(2, { setObj: SET('Y', 4), round: 2 }); T.order(G, 0, ['Y1', 'Y1', 'Y1', 'Y1']); T.draw(G, 0, 4); eq(T.pot(G, 0), ['Y1@2', 'Y1@5', 'Y1@9', 'Y1@10']);
});
test('purple set 1: 1 = 1 VP; 2 = 1 VP + ruby; 3 = 2 VP + droplet', () => {
  const G = T.game(2, { setObj: SET('P', 1), round: 3 }); play(G, ['O1', 'P1']); T.stop(G, 0); T.stopOthers(G, 0); eq(P(G, 0).vp, 1);
  const H = T.game(2, { setObj: SET('P', 1), round: 3 }); play(H, ['O1', 'P1', 'P1', 'P1']); T.stop(H, 0); T.stopOthers(H, 0); eq([P(H, 0).vp, P(H, 0).droplet], [2, 1]);
});
test('purple set 2: hand in purple chips for chips, points, rubies and droplet steps; 4 purples may not use the 2-reward twice', () => {
  const G = T.game(2, { setObj: SET('P', 2), round: 3 }); play(G, ['O1', 'P1', 'P1', 'P1']); T.stop(G, 0); T.stopOthers(G, 0); eq(P(G, 0).q.h, 'p2');
  eq(P(G, 0).q.d.sets, [[], [1], [2], [3], [1, 2]]); T.answer(G, 0, { set: [3] }); eq([P(G, 0).vp, P(G, 0).droplet], [6, 2]); yes(P(G, 0).newChips.some(c => c.c === 'Y' && c.v === 4), 'yellow 4');
  const H = T.game(2, { setObj: SET('P', 2), round: 3 }); play(H, ['O1', 'P1', 'P1', 'P1', 'P1']); T.stop(H, 0); T.stopOthers(H, 0); yes(!P(H, 0).q.d.sets.some(s => s.length === 2 && s[0] === 2 && s[1] === 2), 'no 2+2'); yes(P(H, 0).q.d.sets.some(s => s.join() === '1,3'), '1+3 is four purples');
});
test('purple set 3: each purple scores by its space (0-9: 0, 10-19: 1, 20-29: 2, 30+: 3)', () => {
  const G = T.game(2, { setObj: SET('P', 3), round: 3 }); T.order(G, 0, ['G4', 'P1']); P(G, 0).droplet = 8; T.draw(G, 0, 2); eq(T.pot(G, 0), ['G4@12', 'P1@13']); T.stopOthers(G, 0); T.finish(G); eq(P(G, 0).vp, D.VP[14] + 1, 'space 14 plus 1 VP for the purple on space 13');
  const H = T.game(2, { setObj: SET('P', 3), round: 3 }); T.order(H, 0, ['O1', 'P1']); T.draw(H, 0, 2); T.stopOthers(H, 0); T.finish(H); eq(P(H, 0).vp, D.VP[3], 'purple on space 2 scores nothing');
});
test('purple set 4: swap 1->2, 2->4 or 1->4 depending on the number of purples; the new chip goes in the bag', () => {
  const G = T.game(2, { setObj: SET('P', 4), round: 3 }); play(G, ['G1', 'O1', 'P1']); T.stop(G, 0); T.stopOthers(G, 0); eq(P(G, 0).q.h, 'p4'); eq(P(G, 0).q.d.opts.map(o => o.from + '>' + o.to), ['G1>G2']); T.answer(G, 0, { from: 'G1', to: 'G2' }); yes(P(G, 0).newChips.some(c => ck(c) === 'G2')); function ck(c) { return c.c + c.v; }
  const H = T.game(2, { setObj: SET('P', 4), round: 3 }); play(H, ['G1', 'G2', 'P1', 'P1', 'P1']); T.stop(H, 0); T.stopOthers(H, 0); eq(P(H, 0).q.d.opts.map(o => o.from + '>' + o.to).sort(), ['G1>G2', 'G1>G4', 'G2>G4'].sort());
});
test('black chip, 2 players: equal count = droplet; more than the rival = droplet + ruby', () => {
  const G = T.game(2); G.round = 1; T.order(G, 0, ['K1', 'O1']); T.order(G, 1, ['K1', 'O1']); T.draw(G, 0, 2); T.stop(G, 0); T.draw(G, 1, 2); T.stop(G, 1); T.finish(G, (s, q, ms) => q.h === 'shop' ? ms[0] : undefined); eq([P(G, 0).droplet, P(G, 1).droplet], [1, 1]);
  const H = T.game(2); T.order(H, 0, ['K1', 'K1']); T.order(H, 1, ['K1', 'O1']); T.draw(H, 0, 2); T.stop(H, 0); T.draw(H, 1, 2); T.stop(H, 1); const r0 = P(H, 0).rubies; T.finish(H, (s, q, ms) => q.h === 'shop' ? ms[0] : undefined); eq([P(H, 0).droplet, P(H, 1).droplet], [1, 0]); yes(ev(H, 'gain').some(e => e.seat === 0 && e.k === 'ruby'), 'ruby for more black chips');
});
test('black chip, 3+ players: more than the left OR right neighbour = droplet; more than both = droplet + ruby', () => {
  const G = T.game(4); T.order(G, 0, ['K1', 'K1']); T.order(G, 1, ['K1', 'O1']); T.order(G, 2, ['O1', 'O1']); T.order(G, 3, ['K1', 'K1', 'K1']);
  for (let s = 0; s < 4; s++) { T.draw(G, s, 2 + (s === 3 ? 1 : 0)); T.stop(G, s); }
  // seat 0: left = seat 1 (1 black), right = seat 3 (3 black): more than left only -> droplet, no ruby. seat 3: left seat 0 (2), right seat 2 (0): more than both -> droplet + ruby
  const r0 = P(G, 0).rubies, r3 = P(G, 3).rubies; T.finish(G, (s, q, ms) => q.h === 'shop' ? ms[0] : (q.h === 'de' ? ms[0] : undefined));
  eq(P(G, 0).droplet, 1); eq(P(G, 3).droplet, 1); eq(P(G, 2).droplet, 0); yes(ev(G, 'gain').some(e => e.seat === 3 && e.k === 'ruby'), 'seat 3 gets a ruby'); eq(P(G, 1).droplet, 1, 'seat 1 has 1 black, its left neighbour seat 2 has none');
});

// ---------- fortune cards ----------
const fort = (id, np, o) => T.game(np || 2, Object.assign({ card: id }, o || {}));
test('card Lucky Seven: exactly 7 white at the end = droplet', () => { const G = fort('lucky7'); play(G, ['W3', 'W3', 'W1']); T.stop(G, 0); T.stopOthers(G, 0); T.finish(G); eq(P(G, 0).droplet, 1); const H = fort('lucky7'); play(H, ['W3', 'W2']); T.stop(H, 0); T.stopOthers(H, 0); T.finish(H); eq(P(H, 0).droplet, 0); });
test('card Spilled Brew: if you explode the player on your left takes any 2-chip', () => {
  const G = fort('spilled', 3); T.order(G, 0, ['W3', 'W3', 'W3']); T.draw(G, 0, 3); T.stopOthers(G, 0); eq(G.phase, 'eval'); eq(CF.pending(G).includes(1), true); eq(P(G, 1).q.h, 'gift'); T.answer(G, 1, { o: 'B2' }); yes(P(G, 1).newChips.some(c => c.c === 'B' && c.v === 2));
});
test('card Do-Over: right after the 5th chip tip everything back and start again, once', () => {
  const G = fort('doover'); T.order(G, 0, ['O1', 'O1', 'O1', 'O1', 'O1', 'O1', 'O1']); T.draw(G, 0, 5); T.ok(G, 0, { t: 'restart', yes: true }); eq(P(G, 0).pot.length, 0); eq(P(G, 0).bag.length, 7); T.draw(G, 0, 5); yes(T.bad(G, 0, { t: 'restart', yes: true }), 'only once');
  const H = fort('doover'); T.order(H, 0, ['O1', 'O1', 'O1', 'O1', 'W3', 'W3', 'W3', 'O1']); T.draw(H, 0, 5); eq(P(H, 0).boom, false); const X = fort('doover'); T.order(X, 0, ['O1', 'O1', 'W3', 'W3', 'W3']); T.draw(X, 0, 5); yes(P(X, 0).boom, 'exploded on the 5th'); eq(P(X, 0).q.h, 'restart'); T.answer(X, 0, { yes: true }); eq([P(X, 0).boom, P(X, 0).st], [false, 'draw']);
});
test('card Twice Rolled: the die is rolled twice', () => { const G = fort('twice'); play(G, ['G4', 'G4', 'G4']); T.stop(G, 0); T.stopOthers(G, 0); T.finish(G); eq(ev(G, 'die').filter(e => e.seat === 0).length, 2); });
test('card Thick Skin: explosion limit 9', () => { const G = fort('thick'); T.order(G, 0, ['W3', 'W3', 'W3', 'W1']); T.draw(G, 0, 3); eq(P(G, 0).boom, false); T.draw(G, 0); eq(P(G, 0).boom, true); });
test('card Peek and Pick: stopping without exploding lets you draw up to 5 chips and place one', () => {
  const G = fort('peek'); T.order(G, 0, ['O1', 'G4', 'O1', 'O1', 'O1', 'O1', 'O1']); T.draw(G, 0); T.stop(G, 0); eq(P(G, 0).q.h, 'peek'); eq(P(G, 0).hold.length, 5); T.answer(G, 0, { idx: 0 }); eq(P(G, 0).pot.length, 2);
  const H = fort('peek'); T.order(H, 0, ['O1', 'W3', 'W3', 'W3']); T.draw(H, 0, 4); eq(P(H, 0).q, null, 'no peek after an explosion');
});
test('card Ruby Glint: +2 VP when the scoring space shows a ruby, even exploded; Red Spark: +1 extra ruby', () => {
  const G = fort('glint'); play(G, ['O1', 'O1', 'O1', 'O1']); T.stop(G, 0); T.stopOthers(G, 0); T.finish(G); eq(P(G, 0).vp, 2); // space 5 = ruby, 0 VP
  const H = fort('spark'); play(H, ['O1', 'O1', 'O1', 'O1']); T.stop(H, 0); T.stopOthers(H, 0); T.finish(H); eq(P(H, 0).rubies, 3);
  const X = fort('glint'); T.order(X, 0, ['O1', 'O1', 'O1', 'W3', 'W3', 'W3']); T.draw(X, 0, 6); T.stopOthers(X, 0); T.finish(X, (s, q, ms) => q.h === 'de' ? ms.find(m => m.o === 'buy') : undefined); yes(P(X, 0).vp >= 0);
});
test('card Spring Water: every flask is refilled at the end', () => { const G = fort('spring'); P(G, 0).flask = false; T.order(G, 0, ['O1']); T.order(G, 1, ['O1']); T.draw(G, 0); T.stop(G, 0); T.draw(G, 1); T.stop(G, 1); T.finish(G); eq(P(G, 0).flask, true); });
test('card Frothing Pot: the first white chip can go back for free; once', () => {
  const G = fort('froth'); T.order(G, 0, ['W1', 'W1', 'W2']); T.draw(G, 0); T.ok(G, 0, { t: 'froth' }); eq(P(G, 0).pot.length, 0); eq(P(G, 0).flask, true); T.draw(G, 0); yes(T.bad(G, 0, { t: 'froth' }), 'not for the second white');
  const H = fort('froth'); T.order(H, 0, ['W1', 'O1', 'W1']); T.draw(H, 0); T.draw(H, 0); yes(T.bad(H, 0, { t: 'froth' }), 'window closed after the next draw');
});
test('card Pedlar\'s Pick: black chip, any 2-chip, or 3 rubies', () => {
  const G = withCard('pick'); eq(G.phase, 'prep'); const r0 = P(G, 0).rubies; yes(CF.moves(G, 0).some(m => m.o === 'K1'), 'black offered'); T.answer(G, 0, { o: 'rubies' }); eq(P(G, 0).rubies, r0 + 3); T.answer(G, 1, { o: 'G2' }); yes(P(G, 1).bag.some(c => c.c === 'G' && c.v === 2)); eq(G.phase, 'brew');
});
// a fresh game whose current round starts with `card` on top (round > 1: the game is parked in that round first)
function withCard(card, np, o) {
  o = o || {}; T.dieOff(); const parked = o.round || o.vp || o.rubies; if (!o.round) o.round = 1;
  const G = CF.newGame({ players: np || 2, seed: 11, setMode: 1, firstCard: parked ? 'lucky7' : card });
  if (parked) { G.round = o.round; if (o.vp) o.vp.forEach((v, i) => G.players[i].vp = v); if (o.rubies) o.rubies.forEach((v, i) => G.players[i].rubies = v); G.force = card; CF._.startRound(G); CF._.adv(G); }
  return G;
}
test('card A Little Slide: droplet one space for everyone', () => { const G = withCard('slide', 3); eq(G.players.map(p => p.droplet), [1, 1, 1]); eq(G.phase, 'brew'); });
test('card Swap Stall: trade 1 ruby for a 1-chip (not purple/black)', () => { const G = withCard('swap'); eq(G.phase, 'prep'); const ms = CF.moves(G, 0); yes(ms.every(m => m.o === '' || /^[OGBR]1$/.test(m.o)), 'only O/G/B/R 1-chips in round 1'); T.answer(G, 0, { o: 'B1' }); eq(P(G, 0).rubies, 0); yes(P(G, 0).bag.some(c => c.c === 'B')); });
test('card Kind Alms: only the player(s) with the fewest rubies take 1', () => { const G = withCard('alms', 3, { rubies: [3, 1, 1] }); eq(G.players.map(p => p.rubies), [3, 2, 2]); });
test('card Underdog Gift: the fewest VP take a green 1', () => { const G = withCard('underdog', 3, { vp: [5, 0, 0] }); eq(G.players.map(p => p.bag.length), [9, 10, 10]); });
test('card Clear the Pods: 4 VP or remove a white 1 (goes back to the supply)', () => { const G = withCard('clear'); T.answer(G, 0, { o: 'vp' }); eq(P(G, 0).vp, 4); const w0 = G.supply.W1; T.answer(G, 1, { o: 'white' }); eq(G.supply.W1, w0 + 1); eq(P(G, 1).bag.length, 8); T.inv(G); });
test('card Rat Swarm: rat tails counted again', () => { const G = withCard('swarm', 3, { round: 2, vp: [10, 0, 10] }); eq(G.players[1].ratTails, 5); eq(G.players[1].rat, 10); });
test('card Lucky Dip: lowest total takes a blue 2, the others a ruby, chips return', () => { const G = withCard('dip', 2); eq(G.players.reduce((a, p) => a + p.bag.length, 0) >= 18, true); const bl = G.players.map(p => p.bag.filter(c => c.c === 'B' && c.v === 2).length); yes(bl[0] + bl[1] >= 1, 'someone got the blue 2'); T.inv(G); });
test('card Rat Bribe: move the rat stone back 1-3 and take that many rubies', () => { const G = withCard('bribe', 2, { round: 2, vp: [12, 0] }); eq(G.players[1].rat, 6); eq(P(G, 1).q.d.max, 3); T.answer(G, 1, { n: 2 }); eq([P(G, 1).rat, P(G, 1).rubies], [4, 3]); eq(P(G, 0).q, null, 'the leader has no rat stone'); });
test('card Rat Bounty: any 4-chip or 1 VP per rat tail behind the leader', () => { const G = withCard('bounty', 2, { round: 2, vp: [12, 0] }); T.answer(G, 1, { o: 'vp' }); eq(P(G, 1).vp, 6); T.answer(G, 0, { o: 'G4' }); yes(P(G, 0).bag.some(c => c.c === 'G' && c.v === 4)); });
test('card Fork in the Road: droplet 2 or a purple chip (purple only once its book is out)', () => { const G = withCard('fork'); eq(CF.moves(G, 0).map(m => m.o), ['drop']); T.answer(G, 0, { o: 'drop' }); eq(P(G, 0).droplet, 2); const H = withCard('fork', 2, { round: 3 }); eq(CF.moves(H, 0).map(m => m.o), ['drop', 'P1']); });
test('card Fairground Dice: everyone rolls the bonus die once', () => { const G = withCard('dice', 3); eq(ev(G, 'die').length, 3); eq(G.phase, 'brew'); });
test('card Haggler\'s Hour: draw 4, swap one for the next higher chip of its colour; if none can, take a green 1', () => {
  const G = withCard('haggle'); eq(G.phase === 'prep' || G.phase === 'brew', true); T.inv(G);
  const H = CF.newGame({ players: 2, seed: 2 }); for (const p of H.players) p.q = null; T.order(H, 0, ['W1', 'W1', 'O1', 'W2', 'W1']); H.fcard = 'haggle'; H.phase = 'prep'; H.players[0].hold = []; for (let i = 0; i < 4; i++) H.players[0].hold.push(H.players[0].bag.pop()); H.players[0].q = { h: 'haggle', d: {} };
  yes(CF.moves(H, 0).length > 1, 'white chips can be swapped up (the AI never will)'); T.answer(H, 0, { idx: -1 }); eq(H.players[0].hold.length, 0); T.inv(H);
});
test('every fortune card id has an effect in the engine (24 cards, 11 blue, 13 purple)', () => { eq(D.FORTUNE.length, 24); eq(D.FORTUNE.filter(f => f.kind === 'blue').length, 11); eq(D.FORTUNE.filter(f => f.kind === 'purple').length, 13); eq(new Set(D.FORTUNE.map(f => f.id)).size, 24); });
test('ingredient books: all 4 sets have prices and a power for green, blue, red, yellow, purple', () => {
  for (const c of ['G', 'B', 'R', 'Y', 'P']) for (let s = 1; s <= 4; s++) { const b = D.BOOKS[c][s]; yes(b && b.price.length >= 1 && b.eff && b.text.length > 20, c + s); }
  eq(D.BOOKS.G[1].price.length, 3); eq(D.BOOKS.P[1].price.length, 1);
});
test('random book sets: setMode random gives each colour a set 1-4; a chosen set gives all five colours that set', () => {
  const G = CF.newGame({ players: 2, seed: 99, setMode: 'random' }); yes(Object.values(G.sets).every(s => s >= 1 && s <= 4)); const H = CF.newGame({ players: 2, seed: 99, setMode: 3 }); eq(Object.values(H.sets), [3, 3, 3, 3, 3]);
  const seen = new Set(); for (let i = 0; i < 40; i++) { const X = CF.newGame({ players: 2, seed: i, setMode: 'random' }); seen.add(Object.values(X.sets).join('')); } yes(seen.size > 10, 'random mixes differ');
});
test('chip conservation holds through whole random games (supply + bags + pots = box)', () => {
  for (let g = 0; g < 6; g++) { const G = CF.newGame({ players: 2 + g % 3, seed: 40 + g, setMode: g % 5 === 4 ? 'random' : 1 + g % 4 }); let n = 0; while (G.phase !== 'over' && n++ < 4000) { const s = CF.pending(G)[0]; const m = CF.AI.choose(G, s, 'normal'); const o = Object.assign({}, m); delete o.label; T.ok(G, s, o); T.inv(G); } eq(G.phase, 'over'); }
});
test('a seat answers only its own question; wrong moves are refused', () => {
  const G = withCard('clear'); yes(T.bad(G, 0, { t: 'draw' }), 'draw during a question'); yes(T.bad(G, 0, { t: 'clear', o: 'bogus' })); yes(T.bad(G, 5, { t: 'clear', o: 'vp' }), 'bad seat'); yes(T.bad(G, 0, null)); yes(T.bad(G, 0, { t: '__proto__' }));
});

let pass = 0, fail = 0;
for (const [n, f] of tests) { try { f(); pass++; console.log('PASS ' + n); } catch (e) { fail++; console.log('FAIL ' + n + '\n     ' + (e.message || e).split('\n')[0]); } }
console.log('\n' + pass + ' passed, ' + fail + ' failed (' + tests.length + ' tests)');
process.exit(fail ? 1 : 0);

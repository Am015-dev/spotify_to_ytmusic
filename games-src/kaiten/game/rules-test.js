// Targeted rules tests: each builds a state by hand and checks the result.   node rules-test.js
const T = require('./tlib');
const { KK } = T;
let pass = 0, fail = 0;
function test(name, fn) { try { fn(); pass++; } catch (e) { fail++; console.log('FAIL: ' + name + '\n   ' + String(e.message).split('\n').join('\n   ')); } }
const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error((m || 'value') + ': expected ' + JSON.stringify(b) + ', got ' + JSON.stringify(a)); };
const ok = (c, m) => { if (!c) throw new Error(m || 'assertion failed'); };
const rep = (k, n) => Array(n).fill(k);
// score seat 0..n from tables: tabs = array of key lists
const scoreTables = (tabs, np) => { const G = T.game(np || tabs.length, 3); tabs.forEach((t, i) => T.setTable(G, i, t)); return KK.roundScores(G); };
const one = (keys) => scoreTables([keys, []], 2)[0];

// ---------------- deck and setup ----------------
test('deck: 108 cards with the exact composition', () => {
  eq(KK.NCARDS, 108);
  const want = { tempura: 14, sashimi: 14, dumpling: 14, roll1: 6, roll2: 12, roll3: 8, salmon: 10, squid: 5, egg: 5, wasabi: 6, chop: 4, pudding: 10 };
  const got = {}; for (let i = 0; i < 108; i++) { const k = KK.cardKey(i); got[k] = (got[k] || 0) + 1; }
  eq(Object.keys(want).map(k => got[k]), Object.keys(want).map(k => want[k])); eq(Object.values(want).reduce((a, b) => a + b, 0), 108);
});
test('deck: every card id appears exactly once across deck, hands, discard (newGame)', () => { for (let np = 2; np <= 5; np++) { const G = T.game(np, 11); T.inv(G); } });
test('deck: display names and ids', () => {
  const nm = { tempura: 'Crispy Prawn', sashimi: 'Fish Slice', dumpling: 'Steam Bun', roll1: 'Seaweed Roll', roll2: 'Seaweed Roll', roll3: 'Seaweed Roll', salmon: 'Sunset Nigiri', squid: 'Moon Nigiri', egg: 'Sun Nigiri', wasabi: 'Fire Paste', chop: 'Twin Sticks', pudding: 'Custard Cup' };
  for (const t of KK.DATA.types) { eq(t.name, nm[t.id], t.id); ok(t.text && t.text.length > 20, 'rules text for ' + t.id); }
  eq(KK.DATA.types.length, 12);
});
test('deck: roll icons are 1 / 2 / 3', () => { eq(KK.DATA.types.filter(t => t.icons).map(t => [t.id, t.icons]), [['roll2', 2], ['roll3', 3], ['roll1', 1]]); eq(KK._.ICONS, { roll1: 1, roll2: 2, roll3: 3 }); });
test('setup: hand sizes 10/9/8/7 for 2/3/4/5 players, 3 rounds', () => {
  const want = { 2: 10, 3: 9, 4: 8, 5: 7 };
  for (let np = 2; np <= 5; np++) { const G = T.game(np); eq(G.players.length, np); for (const p of G.players) eq(p.hand.length, want[np], np + 'p hand'); eq(G.deck.length, 108 - np * want[np]); eq(G.round, 1); eq(G.turn, 1); eq(G.phase, 'pick'); }
  eq(KK.HAND, want);
});
test('setup: player count is clamped to 2..5 and names default', () => { eq(KK.newGame({ players: 9, seed: 1 }).np, 5); eq(KK.newGame({ players: 1, seed: 1 }).np, 2); eq(T.game(3).players.map(p => p.name), ['Ann', 'Bo', 'Cy']); eq(KK.newGame({ players: 2, seed: 1, names: ['X', 'Y'], ai: ['easy', null] }).players.map(p => [p.name, p.ai]), [['X', 'easy'], ['Y', null]]); });
test('setup: same seed gives the same game, a different seed a different deal', () => {
  const a = T.game(3, 42), b = T.game(3, 42), c = T.game(3, 43);
  eq(JSON.stringify(a), JSON.stringify(b)); ok(JSON.stringify(a.players[0].hand) !== JSON.stringify(c.players[0].hand), 'seeds differ');
});
test('setup: state survives a JSON round trip and keeps playing identically', () => {
  const a = T.game(3, 5), b = JSON.parse(JSON.stringify(a));
  for (let i = 0; i < 12; i++) { T.pickFirst(a); T.pickFirst(b); }
  eq(JSON.stringify(a), JSON.stringify(b));
});
test('setup: mem records the first hand, no picks pending', () => { const G = T.game(4); for (const p of G.players) { eq(p.mem.length, 1); eq(p.mem[0].hand, p.hand.slice().sort((a, b) => a - b)); eq(p.pick, null); eq(p.picked, false); } eq(KK.pending(G), [0, 1, 2, 3]); });

// ---------------- moves / apply ----------------
test('moves: one single pick per card, indexes into the hand', () => {
  const G = T.game(2); const ms = KK.moves(G, 0); eq(ms.length, 10);
  ms.forEach((m, i) => { eq(m.pick, [i]); eq(m.ids, [G.players[0].hand[i]]); ok(/^Take /.test(m.label)); });
});
test('moves: no double picks without Twin Sticks on the table', () => { const G = T.game(2); ok(KK.moves(G, 0).every(m => m.pick.length === 1)); });
test('moves: with Twin Sticks on the table every pair is offered (n + n(n-1)/2)', () => {
  const G = T.game(2); T.setTable(G, 0, ['chop']); const ms = KK.moves(G, 0); eq(ms.length, 10 + 45); eq(ms.filter(m => m.pick.length === 2).every(m => m.pick[0] < m.pick[1]), true);
  eq(KK.moves(G, 1).length, 10, 'the other seat has no sticks');
});
test('moves: Twin Sticks cannot be used with a single card in hand', () => {
  const G = T.game(2); T.setTable(G, 0, ['chop']); T.lastTurn(G, ['tempura', 'tempura']);
  eq(KK.moves(G, 0).length, 1); const r = KK.apply(G, 0, { pick: [0, 0] }); ok(!r.ok);
});
test('moves: seat that already picked, bad seats and a finished game give none', () => {
  const G = T.game(2); KK.apply(G, 0, { pick: [0] }); eq(KK.moves(G, 0), []); eq(KK.moves(G, 5), []); eq(KK.moves(G, -1), []); eq(KK.moves(G, 1).length, 10);
});
test('apply: rejects bad picks and double submissions, accepts the legal one', () => {
  const G = T.game(2);
  ok(!KK.apply(G, 0, { pick: [10] }).ok); ok(!KK.apply(G, 0, { pick: [-1] }).ok); ok(!KK.apply(G, 0, { pick: [1.5] }).ok); ok(!KK.apply(G, 0, { pick: [] }).ok);
  ok(!KK.apply(G, 0, { pick: [0, 1] }).ok, 'pair without sticks'); ok(!KK.apply(G, 0, null).ok); ok(!KK.apply(G, 0, {}).ok); ok(!KK.apply(G, 7, { pick: [0] }).ok);
  ok(!KK.apply(G, 0, { pick: '0' }).ok); ok(!KK.apply(G, 0, { pick: [0, 0, 0] }).ok);
  ok(KK.apply(G, 0, { pick: [0] }).ok); ok(!KK.apply(G, 0, { pick: [1] }).ok, 'second pick'); eq(G.players[0].hand.length, 10, 'hand untouched until reveal');
});
test('apply: nothing is revealed until every seat has picked', () => {
  const G = T.game(3); const t0 = JSON.stringify(G.players.map(p => p.table));
  KK.apply(G, 0, { pick: [0] }); KK.apply(G, 1, { pick: [0] });
  eq(JSON.stringify(G.players.map(p => p.table)), t0); eq(G.turn, 1); eq(KK.pending(G), [2]);
  KK.apply(G, 2, { pick: [0] }); eq(G.turn, 2); eq(KK.pending(G), [0, 1, 2]); ok(G.players.every(p => p.table.length === 1));
});
test('apply: the pick is stored without changing the hand; picked flag is public', () => {
  const G = T.game(2); const id = G.players[1].hand[4]; KK.apply(G, 1, { pick: [4] });
  eq(G.players[1].pick, [id]); eq(G.players[1].picked, true); ok(G.players[1].hand.includes(id));
});
test('reveal: picked cards land on the table, leave the hand, are placed simultaneously', () => {
  const G = T.game(2); const a = G.players[0].hand[2], b = G.players[1].hand[7];
  KK.apply(G, 0, { pick: [2] }); KK.apply(G, 1, { pick: [7] });
  eq(G.players[0].table.map(e => e.id), [a]); eq(G.players[1].table.map(e => e.id), [b]);
});
test('passing: after a reveal every hand goes to the next seat (i -> i+1), last wraps to seat 0', () => {
  for (let np = 2; np <= 5; np++) {
    const G = T.game(np, 21), before = G.players.map(p => p.hand.slice()); T.pickFirst(G);
    for (let i = 0; i < np; i++) eq(G.players[(i + 1) % np].hand, before[i].slice(1), np + 'p hand of seat ' + i);
    eq(G.players[0].hand.length, G.hand - 1);
  }
});
test('passing: hands keep passing in the same direction every turn and round (always left)', () => {
  const G = T.game(3, 5); let h = G.players.map(p => p.hand.slice());
  for (let t = 0; t < 4; t++) { T.pickFirst(G); h = [h[2].slice(1), h[0].slice(1), h[1].slice(1)]; G.players.forEach((p, i) => eq(p.hand, h[i], 'turn ' + t)); }
});
test('turns: a round lasts exactly hand-size turns, hands empty at the end', () => {
  for (let np = 2; np <= 5; np++) { const G = T.game(np, 3), H = G.hand; for (let t = 1; t <= H; t++) { eq(G.turn, t); eq(G.round, 1); T.pickFirst(G); } eq(G.round, 2); eq(G.turn, 1); }
});
test('turns: the log gets a readable line for each pick and events are produced', () => {
  const G = T.game(2, 3); T.pickFirst(G);
  ok(G.log.some(l => / takes /.test(l.t))); eq(G.events.map(e => e.t), ['picked', 'reveal', 'pass']);
  const rv = G.events[1]; eq(rv.picks.length, 2); ok(rv.picks[0].cards[0].id >= 0 && 'key' in rv.picks[0].cards[0]); eq(G.events[2].sizes, [9, 9]);
});

// ---------------- tempura / sashimi / dumplings ----------------
test('tempura: 0..7 cards score 0,0,5,5,10,10,15,15', () => { const w = [0, 0, 5, 5, 10, 10, 15, 15]; for (let n = 0; n <= 7; n++) eq(one(rep('tempura', n)).tempura, w[n], n + ' prawns'); });
test('sashimi: 0..7 cards score 0,0,0,10,10,10,20,20', () => { const w = [0, 0, 0, 10, 10, 10, 20, 20]; for (let n = 0; n <= 7; n++) eq(one(rep('sashimi', n)).sashimi, w[n], n + ' fish'); });
test('dumplings: 0..6 score 0,1,3,6,10,15,15 (5 or more = 15)', () => { const w = [0, 1, 3, 6, 10, 15, 15]; for (let n = 0; n <= 6; n++) eq(one(rep('dumpling', n)).dumpling, w[n], n + ' buns'); });
test('tempura/sashimi partial sets score nothing; dumplings score even alone', () => {
  eq(one(['tempura']).total, 0); eq(one(['sashimi', 'sashimi']).total, 0); eq(one(['tempura', 'tempura', 'tempura']).total, 5); eq(one(['dumpling']).total, 1);
});
test('mixed table adds up category by category', () => {
  const s = one(['tempura', 'tempura', 'sashimi', 'sashimi', 'sashimi', 'dumpling', 'dumpling', 'dumpling', 'egg']);
  eq([s.tempura, s.sashimi, s.dumpling, s.nigiri, s.maki, s.wasabi, s.total], [5, 10, 6, 1, 0, 0, 22]);
});

// ---------------- maki ----------------
const maki = icons => KK.makiPoints(icons);
test('maki: most 6, second 3', () => eq(maki([5, 3, 1]), [6, 3, 0]));
test('maki: tie for most splits 6 rounded down and gives no second place', () => { eq(maki([4, 4, 2]), [3, 3, 0]); eq(maki([4, 4, 4]), [2, 2, 2]); eq(maki([4, 4, 4, 1]), [2, 2, 2, 0]); eq(maki([3, 3, 3, 3]), [1, 1, 1, 1]); eq(maki([5, 5, 5, 5, 5]), [1, 1, 1, 1, 1]); });
test('maki: tie for second splits 3 rounded down', () => { eq(maki([6, 3, 3]), [6, 1, 1]); eq(maki([6, 3, 3, 3]), [6, 1, 1, 1]); eq(maki([6, 2, 2, 2, 2]), [6, 0, 0, 0, 0]); eq(maki([6, 4, 4, 1]), [6, 1, 1, 0]); });
test('maki: zero icons never score', () => { eq(maki([0, 0]), [0, 0]); eq(maki([0, 0, 0, 0, 0]), [0, 0, 0, 0, 0]); eq(maki([3, 0, 0]), [6, 0, 0]); eq(maki([2, 2, 0]), [3, 3, 0]); eq(maki([3, 0]), [6, 0]); });
test('maki: second place needs at least one icon', () => { eq(maki([3, 0, 0]), [6, 0, 0]); eq(maki([1, 0]), [6, 0]); });
test('maki: 2 players', () => { eq(maki([3, 2]), [6, 3]); eq(maki([2, 2]), [3, 3]); eq(maki([4, 0]), [6, 0]); });
test('maki: a single roll beats nothing; second place of one icon scores 3', () => eq(maki([2, 1, 0]), [6, 3, 0]));
test('maki: icons are summed from roll1/roll2/roll3 on the table (rolls count their printed icons)', () => {
  const sc = scoreTables([['roll1', 'roll2', 'roll3'], ['roll3', 'roll2'], ['roll1']], 3);
  eq(sc.map(s => s.icons), [6, 5, 1]); eq(sc.map(s => s.maki), [6, 3, 0]);
});
test('maki: tie on the table splits 6, table with no rolls at all scores 0', () => {
  eq(scoreTables([['roll3'], ['roll3'], []], 3).map(s => s.maki), [3, 3, 0]); eq(scoreTables([[], []], 2).map(s => s.maki), [0, 0]);
  eq(scoreTables([['roll2'], ['roll1', 'roll1'], ['roll1'], ['roll1'], ['roll2']], 5).map(s => s.maki), [2, 2, 0, 0, 2]);
});
test('maki: second place ties at the table (6 / 1 / 1 with 3 players)', () => eq(scoreTables([['roll3', 'roll3'], ['roll2'], ['roll1', 'roll1']], 3).map(s => s.maki), [6, 1, 1]));

// ---------------- nigiri and wasabi ----------------
test('nigiri: values 2 / 3 / 1 without wasabi', () => { eq(one(['salmon']).nigiri, 2); eq(one(['squid']).nigiri, 3); eq(one(['egg']).nigiri, 1); eq(one(['salmon', 'squid', 'egg']).total, 6); });
test('wasabi: a wasabi with no nigiri scores nothing', () => { const s = one(['wasabi']); eq([s.nigiri, s.wasabi, s.total], [0, 0, 0]); eq(one(['wasabi', 'wasabi']).total, 0); });
test('wasabi: nigiri played after a wasabi is tripled (2/3/1 -> 6/9/3)', () => {
  eq(one(['wasabi', 'salmon']).total, 6); eq(one(['wasabi', 'squid']).total, 9); eq(one(['wasabi', 'egg']).total, 3);
  const s = one(['wasabi', 'squid']); eq([s.nigiri, s.wasabi], [3, 6], 'base + paste bonus split');
});
test('wasabi: nigiri played BEFORE the wasabi is not tripled', () => eq(one(['squid', 'wasabi']).total, 3));
test('wasabi: one wasabi only boosts one nigiri; the next nigiri is normal', () => eq(one(['wasabi', 'salmon', 'squid']).total, 6 + 3));
test('wasabi: two wasabi -> nigiri go onto the OLDEST unused wasabi first, both get tripled', () => {
  const G = T.game(2); const ids = T.setTable(G, 0, ['wasabi', 'wasabi', 'egg', 'squid']); const t = G.players[0].table;
  eq(t[2].w, ids[0], 'first nigiri on the first wasabi'); eq(t[3].w, ids[1], 'second nigiri on the second wasabi'); eq(KK.roundScores(G)[0].total, 3 + 9);
});
test('wasabi: wasabi, nigiri, wasabi, nigiri pairs up in order', () => { const G = T.game(2); const ids = T.setTable(G, 0, ['wasabi', 'salmon', 'wasabi', 'squid']); const t = G.players[0].table; eq([t[1].w, t[3].w], [ids[0], ids[2]]); eq(KK.roundScores(G)[0].total, 6 + 9); });
test('wasabi: two wasabi, one nigiri -> only the older wasabi is used, the other scores 0', () => { const G = T.game(2); const ids = T.setTable(G, 0, ['wasabi', 'wasabi', 'salmon']); eq(G.players[0].table[2].w, ids[0]); eq(KK.roundScores(G)[0].total, 6); eq(KK.roundScores(G)[0].counts.wasabiUnused, 1); });
test('wasabi: a used wasabi is not reused (three nigiri, two wasabi)', () => eq(one(['wasabi', 'wasabi', 'salmon', 'salmon', 'salmon']).total, 6 + 6 + 2));
test('wasabi: a nigiri placed with no unused wasabi stays attached to nothing', () => { const G = T.game(2); T.setTable(G, 0, ['salmon', 'wasabi']); eq(G.players[0].table[0].w, -1); });
test('wasabi in play: nigiri picked on a later turn lands on the waiting wasabi', () => {
  const G = T.game(2, 9); T.setHand(G, 0, ['wasabi', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura']);
  T.setHand(G, 1, rep('salmon', 10));
  T.pickKey(G, 0, 'wasabi'); T.pickKey(G, 1, 'salmon');
  // hands passed: seat 0 now holds salmon
  T.pickKey(G, 0, 'salmon'); T.pickKey(G, 1, 'tempura');
  const t = G.players[0].table; eq(T.keys(t.map(e => e.id)), ['wasabi', 'salmon']); ok(t[1].w === t[0].id, 'salmon on the paste'); eq(KK.roundScores(G)[0].total, 6);
});

// ---------------- chopsticks ----------------
test('chopsticks: played on turn 1 they cannot be used the same turn; double picks exist on turn 2', () => {
  const G = T.game(2, 4); T.setHand(G, 0, ['chop', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura']);
  ok(KK.moves(G, 0).every(m => m.pick.length === 1)); T.pickKey(G, 0, 'chop'); T.pickFirst(G);
  ok(KK.moves(G, 0).some(m => m.pick.length === 2), 'turn 2');
});
test('chopsticks: taking two cards puts the sticks back into the hand that is passed on', () => {
  const G = T.game(2, 4); T.setTable(G, 0, ['chop']); T.setHand(G, 0, ['tempura', 'sashimi', 'dumpling', 'egg']); T.setHand(G, 1, ['squid', 'squid', 'squid', 'squid']); G.hand = 4; G.turn = 1;
  const sticks = G.players[0].table[0].id; T.pickKeys(G, 0, 'tempura', 'sashimi'); T.pickFirst(G);
  eq(T.keys(G.players[0].table.map(e => e.id)).sort(), ['sashimi', 'tempura']); ok(!G.players[0].table.some(e => e.id === sticks), 'sticks left the table');
  ok(G.players[1].hand.includes(sticks), 'sticks are in the passed hand'); eq(G.players[1].hand.length, 3); eq(G.players[0].hand.length, 3);
});
test('chopsticks: after use the player has no sticks in front of them any more (no double pick next turn)', () => {
  const G = T.game(2, 4); T.setTable(G, 0, ['chop']); T.pickKeys(G, 0, G.players[0].hand.map(KK.cardKey)[0], G.players[0].hand.map(KK.cardKey)[1]); T.pickFirst(G);
  ok(KK.moves(G, 0).every(m => m.pick.length === 1));
});
test('chopsticks: a second set of sticks can be picked as one of the two cards', () => {
  const G = T.game(2, 4); T.setTable(G, 0, ['chop']); T.setHand(G, 0, ['chop', ...rep('tempura', 9)]);
  T.pickKeys(G, 0, 'chop', 'tempura'); T.pickFirst(G); eq(T.keys(G.players[0].table.map(e => e.id)).sort(), ['chop', 'tempura']);
});
test('chopsticks: the passed hand has one card fewer as usual (2 taken, sticks added)', () => {
  const G = T.game(3, 4); T.setTable(G, 1, ['chop']); const n = G.players[1].hand.length; T.pickKeys(G, 1, KK.cardKey(G.players[1].hand[0]), KK.cardKey(G.players[1].hand[1])); T.pickFirst(G);
  G.players.forEach(p => eq(p.hand.length, n - 1)); T.inv(G);
});
test('chopsticks: double pick with Fire Paste and nigiri places the paste first (nigiri tripled)', () => {
  const G = T.game(2, 4); T.setTable(G, 0, ['chop']); T.setHand(G, 0, ['squid', 'wasabi', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura']);
  T.pickKeys(G, 0, 'squid', 'wasabi'); T.pickFirst(G); const t = G.players[0].table; eq(T.keys(t.map(e => e.id)), ['wasabi', 'squid']); eq(KK.roundScores(G)[0].total, 9);
});
test('chopsticks: double pick of two nigiri on one waiting wasabi: the better nigiri takes the paste', () => {
  const G = T.game(2, 4); T.setTable(G, 0, ['chop', 'wasabi']); T.setHand(G, 0, ['egg', 'squid', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura']);
  T.pickKeys(G, 0, 'egg', 'squid'); T.pickFirst(G); eq(KK.roundScores(G)[0].total, 9 + 1);
});
test('chopsticks: double pick of both wasabi and nigiri in play order (existing paste + new nigiri)', () => {
  const G = T.game(2, 4); T.setTable(G, 0, ['chop']); T.setHand(G, 0, ['wasabi', 'wasabi', 'salmon', 'salmon', 'salmon', 'salmon', 'salmon', 'salmon', 'salmon', 'salmon']);
  T.pickKeys(G, 0, 'wasabi', 'wasabi'); T.pickFirst(G); eq(G.players[0].table.length, 2);
});
test('chopsticks: unused sticks at round end are discarded, not kept', () => {
  const G = T.game(2, 4); T.setTable(G, 0, ['chop']); T.lastTurn(G, ['tempura', 'tempura']); T.pickFirst(G);
  eq(G.round, 2); eq(G.players[0].table.length, 0); ok(!G.players.some(p => p.pud.length)); ok(G.discard.some(id => KK.cardKey(id) === 'chop'));
});

// ---------------- puddings ----------------
const pud = (c, np) => KK.puddingPoints(c, np === undefined ? c.length : np);
test('puddings: most +6, fewest -6 (3+ players)', () => eq(pud([3, 1, 2]), [6, -6, 0]));
test('puddings: in a 2-player game nobody loses points for fewest', () => { eq(pud([3, 1]), [6, 0]); eq(pud([2, 0]), [6, 0]); eq(pud([0, 4]), [0, 6]); });
test('puddings: all equal -> nobody scores (also 0 each)', () => { eq(pud([2, 2]), [0, 0]); eq(pud([0, 0, 0]), [0, 0, 0]); eq(pud([1, 1, 1, 1, 1]), [0, 0, 0, 0, 0]); eq(pud([0, 0]), [0, 0]); });
test('puddings: ties for most split 6 rounded down', () => { eq(pud([3, 3, 1]), [3, 3, -6]); eq(pud([3, 3, 3, 1]), [2, 2, 2, -6]); eq(pud([4, 4, 4, 4, 1]), [1, 1, 1, 1, -6]); });
test('puddings: ties for fewest split the loss rounded down (toward zero)', () => { eq(pud([3, 1, 1]), [6, -3, -3]); eq(pud([3, 1, 1, 1]), [6, -2, -2, -2]); eq(pud([5, 1, 1, 1, 1]), [6, -1, -1, -1, -1]); });
test('puddings: a player with none still counts as fewest; many at zero share the loss', () => { eq(pud([2, 0, 0]), [6, -3, -3]); eq(pud([1, 0, 1]), [3, -6, 3]); });
test('puddings: 2 players, both tied for most scores 3 each only if they differ from nobody (equal = nothing)', () => { eq(pud([1, 1], 2), [0, 0]); });
test('puddings: 3 players, two tie for most and the third has the fewest', () => eq(pud([2, 2, 0]), [3, 3, -6]));
test('puddings: all but one tied at fewest in 4 players', () => eq(pud([4, 1, 1, 1]), [6, -2, -2, -2]));
test('puddings: kept across rounds, not discarded or scored at round end', () => {
  const G = T.game(3, 8); T.setTable(G, 0, ['pudding', 'pudding']); T.setTable(G, 1, ['pudding']); T.lastTurn(G, ['tempura', 'tempura', 'tempura']); T.pickFirst(G);
  eq(G.round, 2); eq(G.players.map(p => p.pud.length), [2, 1, 0]); eq(G.players.map(p => p.table.length), [0, 0, 0]); T.inv(G);
  eq(KK.score(G).pudding.counts, [2, 1, 0]); eq(KK.score(G).banked, KK.score(G).rounds[0].seats.map(s => s.total));
});
test('puddings: round reset keeps puddings while the rest is discarded; tables empty, new hands dealt from the deck', () => {
  const G = T.game(2, 6); T.setTable(G, 0, ['pudding', 'tempura']); T.lastTurn(G, ['egg', 'egg']); const deck0 = G.deck.length; T.pickFirst(G);
  eq(G.round, 2); eq(G.turn, 1); eq(G.players[0].hand.length, 10); eq(G.deck.length, deck0 - 20 + 0, 'deck after redeal');
  eq(G.players[0].pud.length, 1); ok(G.discard.length >= 3); eq(G.players[0].mem.length, 1); eq(G.hist.length, 0); T.inv(G);
});
test('puddings: final scoring at game end (3 players) and totals include them', () => {
  const G = T.game(3, 8); G.round = 3; T.setPud(G, 0, 3); T.setPud(G, 1, 0); T.setPud(G, 2, 1); T.lastTurn(G, ['egg', 'egg', 'egg']); T.pickFirst(G);
  eq(G.phase, 'over'); eq(G.final.pudding, [3, 0, 1]); eq(G.final.puddingPts, [6, -6, 0]);
  const sc = KK.score(G); eq(sc.totals[0], sc.banked[0] + 6); eq(sc.totals[1], sc.banked[1] - 6); eq(sc.pudding.final, true);
});
test('puddings: 2-player game end, nothing lost; table puddings of the last round count', () => {
  const G = T.game(2, 8); G.round = 3; T.setPud(G, 0, 0); T.setPud(G, 1, 1); T.setTable(G, 0, ['pudding']); T.lastTurn(G, ['egg', 'egg']); T.pickFirst(G);
  eq(G.final.pudding, [1, 1]); eq(G.final.puddingPts, [0, 0]);
  const H = T.game(2, 8); H.round = 3; T.setPud(H, 0, 2); T.setPud(H, 1, 0); T.lastTurn(H, ['egg', 'egg']); T.pickFirst(H); eq(H.final.puddingPts, [6, 0]);
});
test('puddings: last-round tie for fewest in 4p', () => { const G = T.game(4, 8); G.round = 3; [2, 0, 0, 1].forEach((n, i) => T.setPud(G, i, n)); T.lastTurn(G, ['egg', 'egg', 'egg', 'egg']); T.pickFirst(G); eq(G.final.puddingPts, [6, -3, -3, 0]); });

// ---------------- winner and tie-break ----------------
const finishWith = (np, banked, puds, seed) => { // fake earlier rounds' totals, then play the real final turn with eggs
  const G = T.game(np, seed || 12); G.round = 3; G.rs = [banked.map(t => ({ total: t, maki: 0, tempura: 0, sashimi: 0, dumpling: 0, nigiri: 0, wasabi: 0, icons: 0, table: [] })), banked.map(() => ({ total: 0, maki: 0, tempura: 0, sashimi: 0, dumpling: 0, nigiri: 0, wasabi: 0, icons: 0, table: [] }))];
  puds.forEach((n, i) => T.setPud(G, i, n)); T.lastTurn(G, banked.map(() => 'egg')); T.pickFirst(G); return G;
};
test('winner: highest total wins', () => { const G = finishWith(3, [10, 30, 20], [1, 1, 1]); eq(G.winners, [1]); eq(G.winner, 1); ok(/wins with 31 points/.test(G.winText), G.winText); });
test('winner: tie on points is broken by the most puddings', () => {
  // totals after pudding points: seat0 20+6 (3 puds) vs seat1 26+0... build equal: 3p, puds [2,1,0] -> pts [6,0,-6]
  const G = finishWith(3, [20, 26, 40], [2, 1, 0]); eq(G.final.totals, [27, 27, 35]); eq(G.winners, [2]);
  const H = finishWith(2, [20, 26], [3, 2]); eq(H.final.totals, [27, 27], 'sanity'); // 20+1+6 vs 26+1+0
  eq(H.winners, [0]); ok(/on puddings/.test(H.winText), H.winText);
});
test('winner: a fully equal result is shared (G.winner -1, both listed)', () => { const G = finishWith(2, [30, 30], [1, 1]); eq(G.winners, [0, 1]); eq(G.winner, -1); ok(/share the win/.test(G.winText), G.winText); });
test('game end: after round 3 the phase is over, no moves, scoring summary complete', () => {
  const G = T.game(2, 3); for (let r = 0; r < 3; r++) for (let t = 0; t < 10; t++) T.pickFirst(G);
  eq(G.phase, 'over'); eq(KK.moves(G, 0), []); ok(!KK.apply(G, 0, { pick: [0] }).ok); eq(KK.score(G).rounds.length, 3); ok(G.winText.length > 5);
  eq(G.final.totals, G.players.map((p, i) => G.rs.reduce((a, r) => a + r[i].total, 0) + G.final.puddingPts[i]));
  T.inv(G);
});

// ---------------- round flow ----------------
test('rounds: three rounds in order with a fresh deal each; deck is never reshuffled', () => {
  for (let np = 2; np <= 5; np++) {
    const G = T.game(np, 31); const seen = []; for (let r = 1; r <= 3; r++) { eq(G.round, r); eq(G.players[0].hand.length, G.hand); for (let t = 0; t < G.hand; t++) T.pickFirst(G); seen.push(G.round); }
    eq(G.phase, 'over'); ok(G.deck.length >= 0); T.inv(G);
  }
});
test('rounds: 5 players use 105 of the 108 cards, deck keeps 3', () => { const G = T.game(5, 2); for (let r = 0; r < 3; r++) for (let t = 0; t < 7; t++) T.pickFirst(G); eq(G.deck.length, 3); });
test('rounds: each round banks its own scores (G.rs) and never carries table cards over', () => {
  const G = T.game(2, 17); for (let t = 0; t < 10; t++) T.pickFirst(G);
  eq(G.rs.length, 1); eq(G.players[0].table.length, 0); eq(G.players[0].hand.length, 10); ok(G.rs[0][0].table.length >= 10);
});
test('rounds: score events give per-category points for every seat', () => {
  const G = T.game(3, 17); for (let t = 0; t < G.hand; t++) T.pickFirst(G); const e = G.events.find(x => x.t === 'score');
  ok(e, 'score event'); eq(e.seats.length, 3); for (const s of e.seats) for (const k of ['maki', 'tempura', 'sashimi', 'dumpling', 'nigiri', 'wasabi', 'total', 'icons']) ok(typeof s[k] === 'number', k);
  eq(e.seats.map(s => s.total), G.rs[0].map(s => s.total)); ok(G.events.some(x => x.t === 'deal'), 'deal event for round 2');
});
test('rounds: gameEnd event on the last turn', () => { const G = T.game(2, 17); for (let i = 0; i < 30; i++) T.pickFirst(G); const e = G.events.find(x => x.t === 'gameEnd'); ok(e); eq(e.totals, G.final.totals); eq(e.winners, G.winners); });
test('score(): live and banked totals, current round provisional, categories listed', () => {
  const G = T.game(2, 5); T.setTable(G, 0, ['tempura', 'tempura', 'roll2']); T.setTable(G, 1, ['roll1']);
  const s = KK.score(G); eq(s.cats, ['maki', 'tempura', 'sashimi', 'dumpling', 'nigiri', 'wasabi']); eq(s.current[0].total, 11); eq(s.current[1].maki, 3); eq(s.live, [11, 3]); eq(s.banked, [0, 0]); eq(s.rounds, []);
});
test('score(): after round 1, rounds[0] has per-seat category breakdown and the table snapshot', () => {
  const G = T.game(2, 5); for (let t = 0; t < 10; t++) T.pickFirst(G); const s = KK.score(G); eq(s.rounds.length, 1); eq(s.current, null);
  for (const x of s.rounds[0].seats) { eq(x.total, x.maki + x.tempura + x.sashimi + x.dumpling + x.nigiri + x.wasabi); ok(Array.isArray(x.table)); }
});
test('log: round scoring and the winner are logged in readable text', () => { const G = T.game(2, 5); for (let i = 0; i < 30; i++) T.pickFirst(G); ok(G.log.some(l => /scores/.test(l.t))); ok(G.log.some(l => l.t === G.winText)); ok(G.log.every(l => typeof l.t === 'string' && 'round' in l && 'turn' in l)); });
test('hist: every turn is recorded publicly with the cards each seat took', () => {
  const G = T.game(3, 5); T.pickFirst(G); T.pickFirst(G); eq(G.hist.length, 2); eq(G.hist[1].turn, 2); eq(G.hist[0].picks.length, 3); ok(G.hist[0].picks.every(p => p.ids.length === 1 && p.chop === -1));
});
test('events: reveal lists cards per seat, with the paste a nigiri landed on', () => {
  const G = T.game(2, 5); T.setTable(G, 0, ['wasabi']); T.setHand(G, 0, ['squid', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura']);
  T.pickKey(G, 0, 'squid'); T.pickFirst(G); const rv = G.events.find(e => e.t === 'reveal'); const c = rv.picks[0].cards[0]; eq(c.key, 'squid'); ok(c.w >= 0, 'w set');
});
test('usage counters: wasabiNigiri, chopUsed and pudding rules are counted', () => {
  const G = T.game(2, 5); T.setTable(G, 0, ['wasabi', 'chop']); T.setHand(G, 0, ['squid', 'egg', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura', 'tempura']);
  T.pickKeys(G, 0, 'squid', 'egg'); T.pickFirst(G); ok(G.used.chopUsed >= 1 && G.used.wasabiNigiri >= 1, JSON.stringify(G.used));
});

// ---------------- invariants / random games ----------------
test('invariants: 300 random-move games (2-5 players, sticks and paste included) stay consistent', () => {
  let s = 7; const r = n => { s = (Math.imul(s, 1103515245) + 12345) >>> 0; return Math.floor(s / 4294967296 * n); };
  let steps = 0;
  for (let g = 0; g < 300; g++) {
    const G = T.game(2 + g % 4, 500 + g);
    while (G.phase !== 'over') { for (const p of G.players) { const ms = KK.moves(G, p.seat); ok(ms.length, 'a seat with nothing to do'); const res = KK.apply(G, p.seat, ms[r(ms.length)]); ok(res.ok, res.error); steps++; } const e = KK.checkInvariants(G); if (e.length) throw new Error('game ' + g + ': ' + e.join(';')); }
    eq(G.final.totals.length, G.np);
  }
  ok(steps > 10000);
});
test('invariants: score totals equal the sum of rounds and pudding points over random games', () => {
  for (let g = 0; g < 60; g++) { const G = T.game(2 + g % 4, 900 + g); while (G.phase !== 'over') for (const p of G.players) { const ms = KK.moves(G, p.seat); KK.apply(G, p.seat, ms[(g + p.seat) % ms.length]); } const sc = KK.score(G); for (let i = 0; i < G.np; i++) eq(sc.totals[i], sc.rounds.reduce((a, r) => a + r.seats[i].total, 0) + sc.pudding.pts[i]); }
});

// ---------------- hidden information (basic; hidden-test.js does the heavy checks) ----------------
test('stripView: own hand visible, others hidden, deck and seed hidden, pick hidden', () => {
  const G = T.game(3, 5); KK.apply(G, 1, { pick: [2] }); const V = KK.stripView(G, 0);
  eq(V.players[0].hand, G.players[0].hand); ok(V.players[1].hand.every(x => x === -1) && V.players[1].hand.length === 9); ok(V.deck.every(x => x === -1)); eq([V.rng, V.seed], [0, 0]);
  eq(V.players[1].pick, [-1]); eq(V.players[1].picked, true); eq(V.players[2].pick, null); eq(KK.stripView(G, -1).players[0].hand.every(x => x === -1), true);
  const W = KK.stripView((() => { const H = T.game(3, 5); KK.apply(H, 0, { pick: [2] }); return H; })(), 0); eq(W.players[0].pick.length, 1); ok(W.players[0].pick[0] >= 0);
});
test('stripView: does not modify the real game; the view answers moves() for its seat identically', () => {
  const G = T.game(2, 5), before = JSON.stringify(G); const V = KK.stripView(G, 1); eq(JSON.stringify(G), before); eq(KK.moves(V, 1), KK.moves(G, 1)); eq(JSON.stringify(KK.score(V)), JSON.stringify(KK.score(G)));
});

console.log('\nrules-test: ' + (pass + fail) + ' tests, ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);

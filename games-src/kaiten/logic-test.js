// Independent logic test: one assertion per numbered rule in RULES-CHECKLIST.md, against the real engine.
//   node logic-test.js          -> prints one line per failing rule ("R<n> expected X, got Y") and a total
//   node logic-test.js --md     -> prints the checklist (the checklist file is generated from this list)
// Cards are played through KK.apply wherever the rule is about play; scoring rules score a real round end.
const T = require('./game/tlib'); const KK = T.KK;
const RULES = []; let SEC = '';
const sec = s => { SEC = s; RULES.push({ sec: s }); };
const R = (text, fn) => RULES.push({ n: RULES.filter(r => r.n).length + 1, sec: SEC, text, fn });
class Miss extends Error { constructor(e, g) { super(); this.e = e; this.g = g; } }
const eq = (got, exp) => { if (JSON.stringify(got) !== JSON.stringify(exp)) throw new Miss(JSON.stringify(exp), JSON.stringify(got)); };
const rep = (k, n) => Array(n).fill(k);
const key = id => KK.cardKey(id);
const FILL = np => np === 5 ? 'wasabi' : 'chop';
// finish a round for real: tabs[seat] = table keys; every seat holds one filler card on the last turn and picks it
function endRound(G, tabs) { tabs.forEach((t, i) => T.setTable(G, i, t)); T.lastTurn(G, tabs.map(() => FILL(G.np))); T.pickFirst(G); }
function oneRound(tabs) { const G = T.game(tabs.length, 3); endRound(G, tabs); return G; }
const rs = (tabs, seat) => oneRound(tabs).rs[0][seat || 0];
const solo = keys => rs([keys, []], 0).total;
// play seat 0 through a sequence of cards (2 diners, one card per turn); seat 1 plays junk. returns the game after the round
function seq(cards, o) {
  const G = T.game(2, 5), k = cards.length; G.hand = k; G.turn = 1;
  const h0 = [], h1 = []; cards.forEach((c, i) => { (i % 2 ? h1 : h0).push(c); (i % 2 ? h0 : h1).push('pudding'); });
  T.setHand(G, 0, h0); T.setHand(G, 1, h1);
  if (o && o.table) T.setTable(G, 0, o.table);
  for (let i = 0; i < k; i++) { T.pickFirst(G); if (o && o.after) o.after(G, i); }
  return G;
}
const seqScore = cards => seq(cards).rs[0][0];
// whole game: rounds[r][seat] = table keys; pud[seat] = custard count at the end
function game(np, tabs, pud) {
  const G = T.game(np, 9);
  for (let r = 0; r < 3; r++) { tabs.forEach((t, i) => T.setTable(G, i, t)); T.lastTurn(G, tabs.map(() => FILL(np))); if (r === 2 && pud) pud.forEach((n, i) => T.setPud(G, i, n)); T.pickFirst(G); }
  return G;
}
const pudPts = (np, pud) => game(np, pud.map(() => []), pud).final.puddingPts;

sec('Setup');
R('The deck is 108 cards: 14 Crispy Prawn, 14 Fish Slice, 14 Steam Bun, 12 two-icon, 8 three-icon and 6 one-icon rolls, 10 Sunset, 5 Moon, 5 Sun nigiri, 6 Fire Paste, 4 Twin Sticks, 10 Custard Cups', () => {
  const got = {}; for (let i = 0; i < 108; i++) got[key(i)] = (got[key(i)] || 0) + 1;
  eq([KK.NCARDS, got.tempura, got.sashimi, got.dumpling, got.roll2, got.roll3, got.roll1, got.salmon, got.squid, got.egg, got.wasabi, got.chop, got.pudding], [108, 14, 14, 14, 12, 8, 6, 10, 5, 5, 6, 4, 10]); });
R('2 diners: each is dealt 10 cards', () => eq(T.game(2).players.map(p => p.hand.length), [10, 10]));
R('3 diners: each is dealt 9 cards', () => eq(T.game(3).players.map(p => p.hand.length), [9, 9, 9]));
R('4 diners: each is dealt 8 cards', () => eq(T.game(4).players.map(p => p.hand.length), [8, 8, 8, 8]));
R('5 diners: each is dealt 7 cards', () => eq(T.game(5).players.map(p => p.hand.length), [7, 7, 7, 7, 7]));
R('The game is played over exactly 3 rounds, then it is over', () => {
  const G = T.game(3, 4), seen = []; let n = 0;
  while (G.phase === 'pick' && n++ < 200) { seen.push(G.round); T.pickFirst(G); }
  eq([G.phase, [...new Set(seen)], G.rs.length], ['over', [1, 2, 3], 3]); });

sec('Drafting and passing');
R('Picks are secret: after one diner picks, nothing is on the table, the hand is intact and other seats see no pick', () => {
  const G = T.game(3, 2), h = G.players[0].hand.slice(); KK.apply(G, 0, { pick: [0] });
  eq([G.players[0].table.length, G.players[0].hand, KK.stripView(G, 1).players[0].pick, G.events.some(e => e.t === 'reveal')], [0, h, [-1], false]); });
R('Picks are revealed together: when the last diner picks, every table gains exactly the card picked', () => {
  const G = T.game(3, 2), picked = G.players.map(p => p.hand[2]); G.players.forEach(p => KK.apply(G, p.seat, { pick: [2] }));
  eq(G.players.map(p => p.table.map(e => e.id)), picked.map(x => [x])); });
R('After each turn every hand passes one seat to the left (seat i gets seat i-1\'s remaining cards)', () => {
  for (const np of [2, 3, 4, 5]) { const G = T.game(np, 6), before = G.players.map(p => p.hand.slice(1)); T.pickFirst(G);
    eq(G.players.map(p => p.hand), G.players.map((p, i) => before[(i - 1 + np) % np])); } });
R('Passing is left in every round (checked on every turn of rounds 1, 2 and 3)', () => {
  const G = T.game(4, 8); let bad = 0, turns = 0;
  while (G.phase === 'pick') { const r = G.round, t = G.turn, before = G.players.map(p => p.hand.slice(1)); T.pickFirst(G);
    if (G.phase === 'pick' && G.round === r) { turns++; if (JSON.stringify(G.players.map(p => p.hand)) !== JSON.stringify(G.players.map((p, i) => before[(i + 3) % 4]))) bad++; } }
  eq([bad, turns], [0, 21]); });
R('A round lasts exactly as many turns as the hand size, then all hands are empty', () => {
  const G = T.game(3, 1); let turns = 0; while (G.round === 1) { T.pickFirst(G); turns++; } eq([turns, G.round], [9, 2]); });
R('A diner cannot pick twice in a turn, cannot pick a card they do not hold, and a bad seat is refused', () => {
  const G = T.game(2, 1); const a = KK.apply(G, 0, { pick: [0] }).ok, b = KK.apply(G, 0, { pick: [1] }).ok, c = KK.apply(G, 1, { pick: [10] }).ok, d = KK.apply(G, 7, { pick: [0] }).ok;
  eq([a, b, c, d], [true, false, false, false]); });
R('At round end a new full hand is dealt from the deck, which is never reshuffled (5 diners use 105 cards, 3 stay in the deck)', () => {
  const G = T.game(5, 3); let n = 0; while (G.phase === 'pick' && n++ < 99) { T.pickFirst(G); }
  T.inv(G); eq([G.deck.length, G.round, G.phase], [3, 3, 'over']); });
R('Every card except Custard Cups is discarded at round end and tables are emptied; Custard Cups are kept', () => {
  const G = T.game(2, 3); const tabs = [['tempura', 'pudding', 'salmon'], ['sashimi', 'pudding']]; endRound(G, tabs);
  eq([G.players.map(p => p.table.length), G.players.map(p => p.pud.length), G.discard.length], [[0, 0], [1, 1], 5]); });

sec('Crispy Prawn (5 per pair)');
R('Two Crispy Prawns score 5', () => eq(solo(rep('tempura', 2)), 5));
R('A single Crispy Prawn scores 0', () => eq(solo(['tempura']), 0));
R('Three Crispy Prawns score 5 (the odd one scores nothing)', () => eq(solo(rep('tempura', 3)), 5));
R('Four Crispy Prawns score 10', () => eq(solo(rep('tempura', 4)), 10));

sec('Fish Slice (10 per three)');
R('Three Fish Slices score 10', () => eq(solo(rep('sashimi', 3)), 10));
R('Two Fish Slices score 0', () => eq(solo(rep('sashimi', 2)), 0));
R('Five Fish Slices score 10 (the extra two score nothing)', () => eq(solo(rep('sashimi', 5)), 10));
R('Six Fish Slices score 20', () => eq(solo(rep('sashimi', 6)), 20));

sec('Steam Bun (1, 3, 6, 10, 15)');
R('One to five Steam Buns score 1, 3, 6, 10, 15', () => eq([1, 2, 3, 4, 5].map(n => solo(rep('dumpling', n))), [1, 3, 6, 10, 15]));
R('Six or more Steam Buns still score 15', () => eq([solo(rep('dumpling', 6)), solo(rep('dumpling', 8))], [15, 15]));

sec('Seaweed Roll race (6 / 3)');
const ic = n => [...rep('roll3', Math.floor(n / 3)), ...(n % 3 === 2 ? ['roll2'] : n % 3 === 1 ? ['roll1'] : [])];
const makiScores = (...icons) => { const G = oneRound(icons.map(ic)); return G.rs[0].map(s => s.maki); };
R('Most icons score 6, second most score 3, the rest 0', () => eq(makiScores(5, 3, 1), [6, 3, 0]));
R('Cards carry 1, 2 and 3 icons and the icons add up (3+2+1 = 6 beats five 1-icon rolls)', () => { const G = oneRound([['roll3', 'roll2', 'roll1'], rep('roll1', 5)]); eq([G.rs[0][0].icons, G.rs[0][1].icons, G.rs[0].map(s => s.maki)], [6, 5, [6, 3]]); });
R('A tie for most splits 6 (two tied: 3 each) and nobody scores second place', () => eq(makiScores(4, 4, 2), [3, 3, 0]));
R('A tie for most among three splits 6 rounded down (2 each)', () => eq(makiScores(3, 3, 3, 1), [2, 2, 2, 0]));
R('A tie for most among four splits 6 rounded down (1 each)', () => eq(makiScores(2, 2, 2, 2, 1), [1, 1, 1, 1, 0]));
R('A tie for second splits 3 rounded down (two tied: 1 each)', () => eq(makiScores(5, 2, 2), [6, 1, 1]));
R('A tie for second among three splits 3 (1 each)', () => eq(makiScores(6, 2, 2, 2), [6, 1, 1, 1]));
R('Zero icons never score: a lone roller gets 6 and no one gets second place', () => eq(makiScores(2, 0, 0), [6, 0, 0]));
R('Zero icons never score: with nobody rolling, nobody scores', () => eq(makiScores(0, 0, 0), [0, 0, 0]));
R('Roll scores count only the current round (icons do not carry over)', () => {
  const G = T.game(2, 3); endRound(G, [rep('roll3', 2), []]); endRound(G, [[], rep('roll1', 1)]);
  eq([G.rs[0][0].maki, G.rs[0][1].maki, G.rs[1][0].maki, G.rs[1][1].maki], [6, 0, 0, 6]); });

sec('Nigiri');
R('Sun Nigiri scores 1', () => eq(solo(['egg']), 1));
R('Sunset Nigiri scores 2', () => eq(solo(['salmon']), 2));
R('Moon Nigiri scores 3', () => eq(solo(['squid']), 3));

sec('Fire Paste');
R('Fire Paste then nigiri: the nigiri is tripled (Sun 3, Sunset 6, Moon 9)', () => eq(['egg', 'salmon', 'squid'].map(n => seqScore(['wasabi', n]).total), [3, 6, 9]));
R('Fire Paste with no nigiri after it scores 0', () => eq(seqScore(['wasabi', 'tempura']).total, 0));
R('Nigiri played BEFORE the Fire Paste is not tripled', () => eq(seqScore(['squid', 'wasabi']).total, 3));
R('Only the first nigiri after one Fire Paste is tripled; the next is worth face value', () => eq(seqScore(['wasabi', 'salmon', 'squid']).total, 6 + 3));
R('Two Fire Pastes then two nigiri: both nigiri are tripled', () => eq(seqScore(['wasabi', 'wasabi', 'egg', 'salmon']).total, 3 + 6));
R('With two unused Fire Pastes a nigiri goes onto the oldest one', () => {
  const G = seq(['wasabi', 'wasabi', 'salmon']); eq(G.rs[0][0].table.map(e => e.w >= 0 ? G.rs[0][0].table.findIndex(x => x.id === e.w) : -1), [-1, -1, 0]); });
R('A nigiri played after an already-used Fire Paste is not tripled again', () => eq(seqScore(['wasabi', 'egg', 'egg', 'egg']).total, 3 + 1 + 1));
R('Fire Paste and nigiri taken together with Twin Sticks (either order of the pair): the nigiri is tripled', () => {
  const G = T.game(2, 5); G.hand = 2; T.setHand(G, 0, ['wasabi', 'squid']); T.setHand(G, 1, ['pudding', 'pudding']); T.setTable(G, 0, ['chop']);
  const i = G.players[0].hand.findIndex(id => key(id) === 'squid'); eq(KK.apply(G, 0, { pick: [Math.min(i, 1 - i), Math.max(i, 1 - i)] }).ok, true); KK.apply(G, 1, { pick: [0] });
  const t = G.players[0].table; eq([t.map(e => key(e.id)), t.find(e => key(e.id) === 'squid').w >= 0], [['wasabi', 'squid'], true]); });
R('An unused Fire Paste does not carry into the next round', () => {
  const G = T.game(2, 3); endRound(G, [['wasabi'], []]); endRound(G, [['egg'], []]); eq([G.rs[1][0].nigiri, G.rs[1][0].wasabi, G.rs[1][0].total], [1, 0, 1]); });
R('A tripled nigiri adds to the same round total together with sets (Fire Paste + Moon + two Prawns = 9 + 5)', () => eq(rs([['wasabi', 'squid', 'tempura', 'tempura'], []]).total, 14));

sec('Twin Sticks');
R('Twin Sticks score 0 points', () => eq(solo(['chop']), 0));
R('A double pick is refused when there are no Twin Sticks on the table', () => { const G = T.game(2, 1); eq(KK.apply(G, 0, { pick: [0, 1] }).ok, false); });
R('Twin Sticks cannot be used the turn they are taken (a double pick is still refused while they are only in the hand/just picked)', () => {
  const G = T.game(2, 1); T.setHand(G, 0, ['chop', 'egg', 'squid', 'salmon', 'tempura', 'tempura', 'sashimi', 'sashimi', 'dumpling', 'dumpling']);
  const first = KK.moves(G, 0).filter(m => m.pick.length === 2).length; eq(first, 0); });
R('Twin Sticks on the table allow taking two cards from the hand in one turn', () => {
  const G = T.game(2, 2); T.setTable(G, 0, ['chop']); const ids = [G.players[0].hand[0], G.players[0].hand[1]];
  eq(KK.apply(G, 0, { pick: [0, 1] }).ok, true); KK.apply(G, 1, { pick: [0] }); eq(ids.every(id => G.players[0].table.some(e => e.id === id)), true); });
R('After a double pick the Twin Sticks leave the table and go back into the hand', () => {
  const G = T.game(2, 2); const c = T.setTable(G, 0, ['chop'])[0]; KK.apply(G, 0, { pick: [0, 1] }); KK.apply(G, 1, { pick: [0] });
  eq([G.players[0].table.some(e => e.id === c), G.players[1].hand.includes(c) || G.players[0].hand.includes(c)], [false, true]); });
R('The returned Twin Sticks are passed on with the hand to the next seat', () => {
  const G = T.game(3, 2); const c = T.setTable(G, 0, ['chop'])[0]; KK.apply(G, 0, { pick: [0, 1] }); KK.apply(G, 1, { pick: [0] }); KK.apply(G, 2, { pick: [0] });
  eq([G.players[1].hand.includes(c), G.players[0].hand.includes(c)], [true, false]); });
R('After using Twin Sticks the hand size stays equal to the other diners\' (n-1 cards, sticks included)', () => {
  const G = T.game(3, 2); T.setTable(G, 0, ['chop']); KK.apply(G, 0, { pick: [0, 1] }); T.pickFirst(G); eq(G.players.map(p => p.hand.length), [8, 8, 8]); });
R('A double pick must be two different cards in the hand', () => { const G = T.game(2, 2); T.setTable(G, 0, ['chop']); eq([KK.apply(G, 0, { pick: [3, 3] }).ok, KK.apply(G, 0, { pick: [0, 10] }).ok], [false, false]); });
R('Twin Sticks cannot be used with only one card in hand', () => { const G = T.game(2, 2); T.setTable(G, 0, ['chop']); T.lastTurn(G, ['egg', 'egg']); eq(KK.apply(G, 0, { pick: [0, 0] }).ok, false); });
R('A double pick on the second-to-last turn leaves the round ending on schedule (sticks become the last card passed)', () => {
  const G = T.game(2, 2); G.hand = 2; G.turn = 1; T.setHand(G, 0, ['egg', 'salmon']); T.setHand(G, 1, ['pudding', 'pudding']); T.setTable(G, 0, ['chop']);
  KK.apply(G, 0, { pick: [0, 1] }); KK.apply(G, 1, { pick: [0] }); eq([G.round, G.players.map(p => p.hand.length)], [1, [1, 1]]);
  T.pickFirst(G); eq([G.round, G.rs.length, G.rs[0][0].nigiri], [2, 1, 3]); });
R('Twin Sticks used for two nigiri in a turn each count (Sun + Moon = 4)', () => {
  const G = T.game(2, 2); G.hand = 2; T.setHand(G, 0, ['egg', 'squid']); T.setHand(G, 1, ['pudding', 'pudding']); T.setTable(G, 0, ['chop']);
  KK.apply(G, 0, { pick: [0, 1] }); KK.apply(G, 1, { pick: [0] }); T.pickFirst(G); eq(G.rs[0][0].total, 4); });

sec('Custard Cups');
R('Custard Cups score nothing in the round they are played', () => eq(solo(['pudding', 'pudding']), 0));
R('Custard Cups played in rounds 1 and 2 are still counted at the end of the game', () => {
  const G = T.game(3, 4); endRound(G, [['pudding'], [], []]); endRound(G, [['pudding', 'pudding'], ['pudding'], []]); endRound(G, [[], [], []]); eq(G.final.pudding, [3, 1, 0]); });
R('3+ diners: most Custard Cups +6, fewest -6 (3, 2, 1 -> +6, 0, -6)', () => eq(pudPts(3, [3, 2, 1]), [6, 0, -6]));
R('A tie for most splits +6 rounded down (3 diners 2,2,1 -> +3, +3, -6)', () => eq(pudPts(3, [2, 2, 1]), [3, 3, -6]));
R('A three-way tie for most splits +6 (4 diners 3,3,3,0 -> +2 each, -6)', () => eq(pudPts(4, [3, 3, 3, 0]), [2, 2, 2, -6]));
R('A four-way tie for most splits +6 rounded down (5 diners 2,2,2,2,0 -> +1 each, -6)', () => eq(pudPts(5, [2, 2, 2, 2, 0]), [1, 1, 1, 1, -6]));
R('A tie for fewest splits -6 (4 diners 3,2,1,1 -> +6, 0, -3, -3)', () => eq(pudPts(4, [3, 2, 1, 1]), [6, 0, -3, -3]));
R('A three-way tie for fewest splits -6 (5 diners 4,3,0,0,0 -> +6, 0, -2, -2, -2)', () => eq(pudPts(5, [4, 3, 0, 0, 0]), [6, 0, -2, -2, -2]));
R('A tie for fewest that does not divide splits rounded down (5 diners 4,4,2,1,1 -> +3,+3,0,-3,-3)', () => eq(pudPts(5, [4, 4, 2, 1, 1]), [3, 3, 0, -3, -3]));
R('A diner with zero Custard Cups is "fewest" and loses 6', () => eq(pudPts(3, [2, 1, 0]), [6, 0, -6]));
R('2 diners: the diner with fewest does NOT lose points (3 vs 1 -> +6, 0)', () => eq(pudPts(2, [3, 1]), [6, 0]));
R('2 diners: a tie for most splits +6 with no loss (2 vs 2 -> 0, 0 since everyone is equal)', () => eq(pudPts(2, [2, 2]), [0, 0]));
R('Everyone equal (3 diners 2,2,2): nobody scores or loses', () => eq(pudPts(3, [2, 2, 2]), [0, 0, 0]));
R('Nobody has any Custard Cups: nobody scores or loses', () => eq(pudPts(4, [0, 0, 0, 0]), [0, 0, 0, 0]));
R('Custard points are applied only at game end (not in round totals) and added to the sum of the three rounds', () => {
  const G = game(3, [['sashimi', 'sashimi', 'sashimi'], [], []], [3, 2, 1]); eq([G.rs.map(r => r[0].total), G.final.totals], [[10, 10, 10], [36, 0, -6]]); });

sec('Round and game scoring');
R('A round total adds rolls + prawns + fish + buns + nigiri + paste bonus (Fire Paste Moon 9, 2 Prawns 5, 3 Fish 10, 2 Buns 3, 3 icons -> 6 alone)', () =>
  eq(rs([['wasabi', 'squid', 'tempura', 'tempura', ...rep('sashimi', 3), ...rep('dumpling', 2), 'roll3'], []]).total, 9 + 5 + 10 + 3 + 6));
R('Sets do not carry between rounds (a lone Prawn in round 1 and another in round 2 score nothing)', () => {
  const G = T.game(2, 3); endRound(G, [['tempura'], []]); endRound(G, [['tempura'], []]); eq([G.rs[0][0].total, G.rs[1][0].total], [0, 0]); });
R('Game total = sum of the three round scores + custard points', () => {
  const G = game(2, [['squid'], ['egg']], [1, 0]); eq(G.final.totals, [3 * 3 + 6, 3]); });
R('The winner is the diner with the highest total', () => { const G = game(3, [['squid'], ['salmon'], ['egg']], null); eq([G.winners, G.winner], [[0], 0]); });
R('Tie on points: the diner with more Custard Cups wins', () => {
  const G = game(2, [rep('sashimi', 3), [...rep('sashimi', 3), 'salmon']], [3, 1]); eq([G.final.totals, G.winners, G.winner], [[36, 36], [0], 0]); });
R('Tie on points and on Custard Cups: the win is shared', () => { const G = game(2, [['squid'], ['squid']], [2, 2]); eq([G.final.totals, G.winners, G.winner], [[9, 9], [0, 1], -1]); });
R('Tie on points among three: only those tied are compared on Custard Cups', () => {
  const G = game(3, [['squid'], ['squid'], ['egg']], [1, 2, 3]); eq([G.final.totals, G.winners], [[3, 9, 9], [2]]); });

sec('Variants');
R('The base game ships no variant menus: a game given extra variant options plays by the same rules (deck, hands, rounds)', () => {
  const G = KK.newGame({ players: 3, seed: 2, variant: 'menu', menu: ['x'], rounds: undefined }); eq([KK.NCARDS, G.players[0].hand.length, G.np], [108, 9, 3]); });

module.exports = { RULES };
if (require.main === module) {
  if (process.argv.includes('--md')) {
    let out = '# Kaiten Kitchen: rules checklist\n\nEvery rule of the original rulebook, in our own words, numbered. Each number is one assertion in `logic-test.js`\n(real engine, state built, action taken through `KK.apply`, exact result checked). This file is generated by `node logic-test.js --md`.\nThe base game has no optional rules or variant menu; rule %VAR% records that.\n';
    for (const r of RULES) out += r.n ? `${r.n}. ${r.text}\n` : `\n## ${r.sec}\n\n`;
    process.stdout.write(out.replace('%VAR%', RULES.filter(r => r.n).length));
  } else {
    let pass = 0, fail = 0;
    for (const r of RULES) { if (!r.n) continue; try { r.fn(); pass++; } catch (e) { fail++; console.log('R' + r.n + ' expected ' + (e instanceof Miss ? e.e + ', got ' + e.g : 'no error, got exception: ' + e.message) + '   [' + r.text.slice(0, 70) + ']'); } }
    console.log('rules ' + (pass + fail) + ', pass ' + pass + ', fail ' + fail); process.exit(fail ? 1 : 0);
  }
}

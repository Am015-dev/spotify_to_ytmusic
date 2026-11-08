// Vinegrave logic test: one headless assertion per numbered rule in RULES-CHECKLIST.md, against the real engine (src/engine.js + src/data.js).
// Each test sets up a state, makes real moves through VG.apply, and compares the exact result. Failure line: FAIL <rule> expected <x> got <y>.
// node logic-test.js            run all rules       node logic-test.js --md   print the checklist (the numbered rule list is the single source)
const VG = require('./src/engine.js'), V = VG.V;
const R = [];
const sec = (t, note) => R.push({ sec: t, note });
const rule = (id, text, fn) => R.push({ id, text, fn });
const J = x => JSON.stringify(x);
const eq = (e, g) => [e, g];
const go = (G, m) => { const r = VG.apply(G, m); if (!r.ok) throw new Error(r.err); return r; };
const G2 = (seed, np) => VG.newGame({ np: np || 2, seed: seed || 1 });
const has = (G, pred) => VG.moves(G).some(pred);
const find = (G, pred) => VG.moves(G).find(pred);
const cnt = (p, id) => p.deck.concat(p.hand, p.play, p.disc).filter(c => c === id).length;
const bootHand = p => { p.hand = ['grant', 'grant', 'trail', 'trail', 'grant']; };
const itemHand = p => { p.hand = ['machete', 'machete', 'machete', 'machete', 'machete']; };   /* item cards: playing one IS the main action */
const passAll = G => { let n = 0; const r0 = G.round; while (G.phase === 'play' && G.round === r0 && n++ < 20) go(G, { t: 'pass' }); };
// p0 discovers level-1 site 5 (needs 2 boots); then p1 plays a card, so it is p0's turn again with the explorer standing at a guarded ruin
function afterDisc() {
  const G = G2(11), p = G.p[0]; p.res.compass = 3; bootHand(p); G.p[1].hand = ['machete', 'machete', 'machete', 'machete', 'machete'];
  G.d0 = cnt(p, 'dread'); go(G, { t: 'disc', s: 5 }); G.sites[5].guard = 'rootback-boar'; go(G, { t: 'play', i: 0 }); return G;
}

sec('A. Setup');
rule('A1', 'Each explorer starts with a 6-card deck: 2 Dread (fear), 2 funding (+1 coin), 2 exploration (+1 compass).', () => { const G = G2(), p = G.p[0]; return eq({ dread: 2, grant: 2, trail: 2 }, { dread: cnt(p, 'dread'), grant: cnt(p, 'grant'), trail: cnt(p, 'trail') }); });
rule('A2', 'Each explorer draws an opening hand of 5 cards (1 card stays in the deck).', () => { const p = G2().p[0]; return eq([5, 1], [p.hand.length, p.deck.length]); });
rule('A3', 'Starting resources by turn order (4 players): 2 coins | 1 coin 1 compass | 2 coins 1 compass | 1 coin 2 compasses; nothing else.', () => { const G = G2(1, 4); return eq([[2, 0, 0], [1, 1, 0], [2, 1, 0], [1, 2, 0]], G.p.map(p => [p.res.coin, p.res.compass, p.res.tablet + p.res.arrow + p.res.jewel])); });
rule('A4', 'Each player has 2 explorers, both off the board at the start.', () => { const G = G2(), p = G.p[0]; return eq([2, 0], [p.ex, G.sites.filter(x => x.occ === 0).length]); });
rule('A5', 'Magnifier and notebook both start at the bottom of the research track.', () => { const p = G2().p[0]; return eq([0, 0], [p.glass, p.note]); });
rule('A6', 'Five camp sites are open for digging at the start; no hidden ruin is discovered yet.', () => { const G = G2(); return eq([5, 0, true], [G.sites.filter(x => x.lvl === 0).length, G.sites.filter(x => x.lvl > 0 && x.tile).length, G.sites.filter(x => x.lvl === 0).every(x => x.occ === -1)]); });
rule('A7', 'Dread supply: 19 Dread cards in the game; each starting deck uses 2, the rest wait in the supply.', () => eq(13, G2(1, 3).dread));
rule('A8', 'Card row has 6 slots; round 1 shows 5 items and 1 artifact.', () => eq(['item', 'item', 'item', 'item', 'item', 'art'], G2().row.map(id => V.CARDS[id].t)));
rule('A9', 'Game starts at round 1 with seat 0 as starting player.', () => { const G = G2(); return eq([1, 0, 0], [G.round, G.turn, G.first]); });
rule('A10', 'Component count: 19 Dread cards.', () => eq(19, V.DREAD_SUPPLY));
rule('A11', 'Component count: 15 guardians.', () => eq(15, V.GUARDS.length));
rule('A12', 'Component count: 10 level-I site tiles.', () => eq(10, V.S1.length));
rule('A13', 'Component count: 6 level-II site tiles.', () => eq(6, V.S2.length));
rule('A14', 'Component count: 16 idols.', () => eq(16, V.IDOLS.length));
rule('A15', 'Component count: 40 item cards.', () => eq(40, V.ITEMS.length));
rule('A16', 'Component count: 35 artifact cards.', () => eq(35, V.ARTS.length));

sec('B. Rounds and turns');
rule('B1', 'A turn is exactly one main action (play an item card), then play passes to the next explorer.', () => { const G = G2(); G.p[0].hand = ['machete', 'grant', 'grant', 'grant', 'grant']; go(G, { t: 'play', i: 0 }); return eq(1, G.turn); });
rule('B2', 'Passing is a main action; a passed player is skipped for the rest of the round (3 players: 0 passes, 1 acts, 2 acts, then 1 again).', () => { const G = G2(1, 3); G.p.forEach(itemHand); const t = []; go(G, { t: 'pass' }); t.push(G.turn); go(G, { t: 'play', i: 0 }); t.push(G.turn); go(G, { t: 'play', i: 0 }); t.push(G.turn); return eq([1, 2, 1], t); });
rule('B3', 'If everyone else has passed, the last player takes turns one after another.', () => { const G = G2(); G.p.forEach(itemHand); go(G, { t: 'pass' }); go(G, { t: 'play', i: 0 }); const a = G.turn; go(G, { t: 'play', i: 0 }); return eq([1, 1], [a, G.turn]); });
rule('B4', 'The round ends when all players have passed: next round starts, explorers return to the board owners.', () => { const G = G2(); bootHand(G.p[0]); go(G, { t: 'dig', s: 0 }); go(G, { t: 'pass' }); const mid = G.round; go(G, { t: 'pass' }); return eq([1, 2, 2, -1], [mid, G.round, G.p[0].ex, G.sites[0].occ]); });
rule('B5', 'Free actions (a guardian boon) do not end the turn.', () => { const G = G2(); G.p[0].guards = [{ id: 'stone-ape', used: false }]; G.p[0].deck = ['grant', 'grant', 'grant']; go(G, { t: 'boon', k: 0 }); return eq([0, 7], [G.turn, G.p[0].hand.length]); });
rule('B6', 'The starting marker passes one seat each round: round 2 starts with seat 1.', () => { const G = G2(); passAll(G); return eq([2, 1], [G.round, G.turn]); });
rule('B7', 'The game lasts 5 rounds: after round 5 everyone passes, the game is over and no round 6 starts.', () => { const G = G2(); G.round = 5; passAll(G); return eq(['over', 5], [G.phase, G.round]); });
rule('B8', 'At the start of a round each player draws up to 5 cards.', () => { const G = G2(); const p = G.p[0]; p.deck = ['grant', 'trail', 'grant', 'trail', 'grant', 'trail']; p.hand = p.hand.slice(0, 2); passAll(G); return eq(5, p.hand.length); });
rule('B9', 'Unplayed hand cards may be kept for the next round.', () => { const G = G2(); const p = G.p[0]; p.hand = ['machete', 'grant', 'grant', 'grant', 'grant']; passAll(G); return eq(true, p.hand.indexOf('machete') >= 0); });
rule('B10', 'A played card goes to the play area and stays there until the end of the round.', () => { const G = G2(); const p = G.p[0]; bootHand(p); go(G, { t: 'play', i: 0 }); return eq([4, 1], [p.hand.length, p.play.length]); });
rule('B11', 'End of round: the play area is shuffled and put on the BOTTOM of the deck (no separate discard pile, no reshuffle of the whole deck).', () => {
  const G = G2(), p = G.p[0], q = G.p[1], old = ['lamp', 'rope', 'tarp', 'ledger', 'kettle', 'satchel', 'pickaxe'];
  p.deck = old.slice(); p.hand = ['grant', 'trail', 'grant', 'grant', 'grant']; q.hand = ['grant', 'grant', 'grant', 'grant', 'grant']; p.disc = []; p.play = [];
  go(G, { t: 'play', i: 0 }); go(G, { t: 'play', i: 0 }); go(G, { t: 'pass' }); go(G, { t: 'pass' });   /* two free starting cards, then both pass */
  return eq({ head: old.slice(2), tail: ['grant', 'trail'], disc: 0 }, { head: p.deck.slice(0, 5), tail: p.deck.slice(5).sort(), disc: p.disc.length });
});
rule('B12', 'Items bought this round sit above the shuffled play area in the deck (deck order: old deck, bought items, then the played cards).', () => {
  const G = G2(), p = G.p[0], q = G.p[1], old = ['lamp', 'rope', 'tarp', 'ledger', 'kettle', 'satchel', 'pickaxe'];
  p.deck = old.slice(); p.hand = ['grant', 'grant', 'grant', 'grant', 'grant']; q.hand = ['grant', 'grant', 'grant', 'grant', 'grant']; p.disc = []; p.res.coin = 5;
  const b = find(G, m => m.t === 'buy' && V.CARDS[G.row[m.r]].t === 'item'), id = G.row[b.r];
  go(G, b); go(G, { t: 'pass' }); go(G, { t: 'play', i: 0 }); go(G, { t: 'pass' });
  return eq(old.slice(1).concat([id, 'grant']), p.deck);
});
rule('B13', 'Card row each round end: the item and the artifact beside the moon staff are exiled and the row refills: items 5,4,3,2,1 and artifacts 1,2,3,4,5 in rounds 1-5.', () => { const G = G2(); const seen = []; for (let r = 1; r <= 5; r++) { seen.push([G.row.filter(id => id && V.CARDS[id].t === 'item').length, G.row.filter(id => id && V.CARDS[id].t === 'art').length]); passAll(G); } return eq([[5, 1], [4, 2], [3, 3], [2, 4], [1, 5]], seen); });
rule('B14', 'The two cards beside the moon staff leave the game for good (not back in the row or the decks).', () => { const G = G2(); const a = G.row[4], b = G.row[5]; passAll(G); return eq([false, false], [G.row.concat(G.items, G.arts).indexOf(a) >= 0, G.row.concat(G.items, G.arts).indexOf(b) >= 0]); });
rule('B15', 'Passed flags are cleared when the new round starts.', () => { const G = G2(); passAll(G); return eq([false, false], G.p.map(p => p.passed)); });

sec('C. Dig at a site');
rule('C1', 'Dig: pay the travel icon by discarding a card from hand to the play area, move an explorer to the site, take its loot.', () => { const G = G2(), p = G.p[0]; bootHand(p); go(G, { t: 'dig', s: 0 }); return eq([4, 1, 1, 3, 1], [p.hand.length, p.play.length, p.ex, p.res.coin, p.res.compass]); });
rule('C2', 'A Boot cost can be paid by any travel icon.', () => { const G = G2(), p = G.p[0]; p.res.coin = 0; const r = []; ['rope', 'lamp', 'flares', 'machete'].forEach(c => { p.hand = [c]; r.push(!!VG.payPlan(G, 0, ['boot'])); }); return eq([true, true, true, true], r); });
rule('C3', 'A Plane pays any icon (Jeep, Boat or Boot).', () => { const G = G2(), p = G.p[0]; p.res.coin = 0; p.hand = ['flares']; return eq([true, true, true], ['car', 'ship', 'boot'].map(n => !!VG.payPlan(G, 0, [n]))); });
rule('C4', 'A Jeep cannot pay a Boat and a Boat cannot pay a Jeep.', () => { const G = G2(), p = G.p[0]; p.res.coin = 0; p.hand = ['rope']; const a = !!VG.payPlan(G, 0, ['ship']); p.hand = ['lamp']; return eq([false, false], [a, !!VG.payPlan(G, 0, ['car'])]); });
rule('C5', 'Two coins always hire a Plane (pays any icon); one coin does not.', () => { const G = G2(), p = G.p[0]; p.hand = []; p.res.coin = 2; const a = VG.payPlan(G, 0, ['ship']); p.res.coin = 1; return eq([2, null], [a && a.coins, VG.payPlan(G, 0, ['ship'])]); });
rule('C6', 'A two-icon cost is paid by two separate cards; one card cannot pay both.', () => { const G = G2(), p = G.p[0]; p.res.coin = 0; p.hand = ['rope', 'rope']; const a = !!VG.payPlan(G, 0, ['car', 'car']); p.hand = ['rope']; return eq([true, false], [a, !!VG.payPlan(G, 0, ['car', 'car'])]); });
rule('C7', 'A Dread card can pay one Boot of travel.', () => { const G = G2(), p = G.p[0]; p.res.coin = 0; p.hand = ['dread']; return eq(true, !!VG.payPlan(G, 0, ['boot'])); });
rule('C8', 'A site already holding an explorer cannot be dug again.', () => { const G = G2(); bootHand(G.p[0]); bootHand(G.p[1]); go(G, { t: 'dig', s: 0 }); return eq(false, has(G, m => m.t === 'dig' && m.s === 0)); });
rule('C9', 'You cannot dig or discover when both explorers are already on sites.', () => { const G = G2(), p = G.p[0]; bootHand(p); p.res.compass = 9; p.ex = 0; return eq(0, VG.moves(G).filter(m => m.t === 'dig' || m.t === 'disc').length); });
rule('C10', 'Digging puts the explorer on the site and uses one of the two explorers; it is a main action (turn passes).', () => { const G = G2(); bootHand(G.p[0]); go(G, { t: 'dig', s: 0 }); return eq([0, 1, 1], [G.sites[0].occ, G.p[0].ex, G.turn]); });
rule('C11', 'You cannot dig a site when you cannot pay its travel.', () => { const G = G2(), p = G.p[0]; p.hand = []; p.res.coin = 0; return eq(false, has(G, m => m.t === 'dig')); });
rule('C12', 'A Boat site needs a Boat or Plane (or 2 coins): Boot cards cannot dig it.', () => { const G = G2(), p = G.p[0]; bootHand(p); p.res.coin = 1; return eq(false, has(G, m => m.t === 'dig' && m.s === 2)); });

sec('D. Discover a new site');
rule('D1', 'Discover: pay the compass cost of the level, take an idol and its gift at once, and the new tile loot at once (all five resources checked).', () => {
  const G = G2(11), p = G.p[0]; p.res.compass = 6; bootHand(p); const before = Object.assign({}, p.res); go(G, { t: 'disc', s: 5 });
  const tile = V.SITE[G.sites[5].tile].rew, gift = V.IDOL[p.idols[0].id].gift, exp = {}; V.RES.forEach(k => exp[k] = before[k] + (tile[k] || 0) + (gift[k] || 0)); exp.compass -= V.DISC[1]; return eq(exp, p.res);
});
rule('D2', 'Discovering a level-II site costs more compasses than level I.', () => eq(true, V.DISC[2] > V.DISC[1]));
rule('D3', 'Discover also pays the travel cost (cards go to the play area).', () => { const G = G2(11), p = G.p[0]; p.res.compass = 3; bootHand(p); go(G, { t: 'disc', s: 5 }); return eq([3, 2], [p.hand.length, p.play.length]); });
rule('D4', 'The site tile placed is the top tile of the level stack, face up.', () => { const G = G2(11), p = G.p[0]; p.res.compass = 3; bootHand(p); const top = G.s1[G.s1.length - 1]; go(G, { t: 'disc', s: 5 }); return eq([top, V.S1.indexOf(top) >= 0], [G.sites[5].tile, true]); });
rule('D5', 'The top guardian is placed on the new site and the explorer stands there.', () => { const G = G2(11), p = G.p[0]; p.res.compass = 3; bootHand(p); const top = G.guards[G.guards.length - 1]; go(G, { t: 'disc', s: 5 }); return eq([top, 0], [G.sites[5].guard, G.sites[5].occ]); });
rule('D6', 'Cannot discover without enough compasses.', () => { const G = G2(11), p = G.p[0]; p.res.compass = V.DISC[1] - 1; bootHand(p); return eq(false, has(G, m => m.t === 'disc')); });
rule('D7', 'Cannot discover with no free explorer.', () => { const G = G2(11), p = G.p[0]; p.res.compass = 9; bootHand(p); p.ex = 0; return eq(false, has(G, m => m.t === 'disc')); });
rule('D8', 'A discovered site is later dug for travel only (no compasses), and cannot be discovered again.', () => { const G = G2(11), p = G.p[0]; p.res.compass = 3; bootHand(p); go(G, { t: 'disc', s: 5 }); go(G, { t: 'pass' }); go(G, { t: 'pass' }); const q = G.p[1]; q.res.compass = 0; bootHand(q); return eq([true, false], [has(G, m => m.t === 'dig' && m.s === 5), has(G, m => m.t === 'disc' && m.s === 5)]); });
rule('D9', 'A level-II site takes its tile from the level-II stack.', () => { const G = G2(11), p = G.p[0]; p.res.compass = 6; p.hand = ['rope', 'rope', 'grant', 'grant', 'grant']; go(G, { t: 'disc', s: 10 }); return eq(true, V.S2.indexOf(G.sites[10].tile) >= 0); });
rule('D10', 'A hidden site cannot be dug before it is discovered.', () => { const G = G2(11), p = G.p[0]; bootHand(p); return eq(false, has(G, m => m.t === 'dig' && m.s === 5)); });

sec('E. Guardians and Dread');
rule('E1', 'End of round: an explorer still standing on a guardian site brings home a Dread card from the supply (even if it did not wake that guardian).', () => { const G = afterDisc(); const d0 = G.dread; go(G, { t: 'pass' }); go(G, { t: 'pass' }); return eq([G.d0 + 1, d0 - 1], [cnt(G.p[0], 'dread'), G.dread]); });
rule('E2', 'You can only overcome a guardian on a site where your own explorer stands.', () => { const G = G2(11), p = G.p[0]; p.res.compass = 3; bootHand(p); go(G, { t: 'disc', s: 5 }); const q = G.p[1]; Object.keys(q.res).forEach(k => q.res[k] = 9); return eq(false, has(G, m => m.t === 'beat')); });
rule('E3', 'Overcoming pays the guardian cost, removes it from the site, and keeps it beside your board (5 points).', () => { const G = afterDisc(), p = G.p[0], cost = V.GUARD['rootback-boar'].cost; Object.keys(p.res).forEach(k => p.res[k] = 5); go(G, { t: 'beat', s: 5 }); const e = {}; V.RES.forEach(k => e[k] = 5 - (cost[k] || 0)); return eq({ res: e, guards: 1, onsite: null, vp: 5 }, { res: p.res, guards: p.guards.length, onsite: G.sites[5].guard, vp: VG.score(G, 0).guards }); });
rule('E4', 'An overcome guardian means no Dread at round end.', () => { const G = afterDisc(), p = G.p[0]; Object.keys(p.res).forEach(k => p.res[k] = 5); go(G, { t: 'beat', s: 5 }); go(G, { t: 'pass' }); go(G, { t: 'pass' }); return eq(G.d0, cnt(p, 'dread')); });
rule('E5', 'A guardian boon can be used once per game, as a free action.', () => { const G = afterDisc(), p = G.p[0]; Object.keys(p.res).forEach(k => p.res[k] = 5); go(G, { t: 'beat', s: 5 }); go(G, { t: 'pass' }); const t = G.turn; const c = p.res.coin; go(G, { t: 'boon', k: 0 }); return eq([c + 3, false, t], [p.res.coin, has(G, m => m.t === 'boon'), G.turn]); });
rule('E6', 'An overcome guardian is worth 5 points whether or not its boon was used.', () => { const G = afterDisc(), p = G.p[0]; Object.keys(p.res).forEach(k => p.res[k] = 5); go(G, { t: 'beat', s: 5 }); const a = VG.score(G, 0).guards; go(G, { t: 'pass' }); go(G, { t: 'boon', k: 0 }); return eq([5, 5], [a, VG.score(G, 0).guards]); });
rule('E7', 'Overcoming is a main action (turn passes) and the explorer stays on the site until the round ends.', () => { const G = afterDisc(), p = G.p[0]; Object.keys(p.res).forEach(k => p.res[k] = 5); go(G, { t: 'beat', s: 5 }); return eq([1, 0, 1], [G.turn, G.sites[5].occ, p.ex]); });
rule('E8', 'Cannot overcome a guardian you cannot pay for.', () => { const G = afterDisc(), p = G.p[0]; Object.keys(p.res).forEach(k => p.res[k] = 0); return eq(false, has(G, m => m.t === 'beat')); });
rule('E9', 'When the Dread supply is empty, the explorer takes a fear tile (-2 points) instead of a Dread card.', () => { const G = afterDisc(); G.dread = 0; go(G, { t: 'pass' }); go(G, { t: 'pass' }); return eq({ tiles: 1, dread: G.d0, fear: -2 - G.d0 }, { tiles: G.p[0].fearTiles, dread: cnt(G.p[0], 'dread'), fear: VG.score(G, 0).fear }); });

sec('F. Idols and shrine slots');
rule('F1', 'Each idol is worth 3 points at the end.', () => { const G = G2(), p = G.p[0]; p.idols = [{ id: V.IDOLS[0], used: false }, { id: V.IDOLS[1], used: false }]; return eq(6, VG.score(G, 0).idols); });
rule('F2', 'Setting an idol in a slot is a free action (the turn does not end) and gives the chosen effect at once (3 coins).', () => { const G = G2(), p = G.p[0]; p.idols = [{ id: V.IDOLS[0], used: false }]; const c = p.res.coin; go(G, { t: 'idol', k: 0, sh: 0 }); return eq([0, c + 3], [G.turn, p.res.coin]); });
rule('F3', 'Each idol offers a choice of five slot effects.', () => { const G = G2(), p = G.p[0]; p.idols = [{ id: V.IDOLS[0], used: false }]; return eq(5, VG.moves(G).filter(m => m.t === 'idol' && m.k === 0).length); });
rule('F4', 'Empty slots score their printed value at the end; an idol set in a slot fills the leftmost empty slot and keeps its own 3 points.', () => { const G = G2(), p = G.p[0]; p.idols = [{ id: V.IDOLS[0], used: false }]; const a = VG.score(G, 0).slots; go(G, { t: 'idol', k: 0, sh: 0 }); const s = VG.score(G, 0); return eq([5, 4, 3], [a, s.slots, s.idols]); });
rule('F5', 'Free actions are unlimited: two idols can be set in the same turn.', () => { const G = G2(), p = G.p[0]; p.idols = [{ id: V.IDOLS[0], used: false }, { id: V.IDOLS[1], used: false }]; go(G, { t: 'idol', k: 0, sh: 0 }); return eq(true, has(G, m => m.t === 'idol' && m.k === 1)); });
rule('F6', 'Only 4 slots: a fifth idol cannot be set.', () => { const G = G2(), p = G.p[0]; p.idols = [0, 1, 2, 3].map(i => ({ id: V.IDOLS[i], used: true })).concat([{ id: V.IDOLS[4], used: false }]); return eq(false, has(G, m => m.t === 'idol')); });

sec('G. Buy a card');
rule('G1', 'Buy an item: pay its coins, it goes face down to the BOTTOM of your deck (not hand/discard), the row refills with an item.', () => { const G = G2(), p = G.p[0]; p.res.coin = 5; const b = find(G, m => m.t === 'buy' && V.CARDS[G.row[m.r]].t === 'item'), id = G.row[b.r], c = V.CARDS[id].cost; go(G, b); return eq({ coin: 5 - c, last: id, hand: 5, row: 'item' }, { coin: p.res.coin, last: p.deck[p.deck.length - 1], hand: p.hand.length, row: V.CARDS[G.row[b.r]].t }); });
rule('G2', 'Cannot buy an item without enough coins.', () => { const G = G2(), p = G.p[0]; p.res.coin = 0; return eq(false, has(G, m => m.t === 'buy' && V.CARDS[G.row[m.r]].t === 'item')); });
rule('G3', 'Buy an artifact: pay compasses, it goes to the play area and its effect fires at once with no tablet paid.', () => { const G = G2(), p = G.p[0]; G.row[5] = 'reed-flute'; p.res.compass = 5; p.res.coin = 0; go(G, { t: 'buy', r: 5 }); return eq({ compass: 4, coin: 2, tablet: 0, play: ['reed-flute'] }, { compass: p.res.compass, coin: p.res.coin, tablet: p.res.tablet, play: p.play }); });
rule('G4', 'Buying an artifact is a main action (turn passes).', () => { const G = G2(), p = G.p[0]; G.row[5] = 'reed-flute'; p.res.compass = 5; go(G, { t: 'buy', r: 5 }); return eq(1, G.turn); });
rule('G5', 'An artifact played from hand costs 1 tablet.', () => { const G = G2(), p = G.p[0]; p.hand = ['reed-flute', 'grant', 'grant', 'grant', 'grant']; p.res.tablet = 0; const a = has(G, m => m.t === 'play' && m.i === 0); p.res.tablet = 1; const b = has(G, m => m.t === 'play' && m.i === 0); go(G, { t: 'play', i: 0 }); return eq([false, true, 0], [a, b, p.res.tablet]); });
rule('G6', 'When a card stack is empty, that slot is not refilled (no card of the other type slides in).', () => { const G = G2(), p = G.p[0]; G.items = []; p.res.coin = 5; const r = G.row.findIndex(id => V.CARDS[id].t === 'item'); go(G, { t: 'buy', r }); return eq(null, G.row[r]); });
rule('G7', 'Bought artifact effects that need a choice pause for the answer, then the turn ends.', () => { const G = G2(), p = G.p[0]; G.row[5] = 'bone-dice'; p.res.compass = 5; go(G, { t: 'buy', r: 5 }); const q = G.q && G.q.h; go(G, { t: 'ans', v: 0 }); return eq(['or', 1, 1], [q, G.turn, p.res.tablet]); });

sec('H. Play a card');
rule('H1', 'Playing a starting coin card gives its effect as a FREE action: +1 coin, still your turn.', () => { const G = G2(), p = G.p[0]; p.hand = ['grant', 'grant', 'grant', 'grant', 'grant']; const c = p.res.coin; go(G, { t: 'play', i: 0 }); return eq([c + 1, 0], [p.res.coin, G.turn]); });
rule('H1b', 'Playing a starting compass card is free too; you can play both and still take a main action.', () => { const G = G2(), p = G.p[0]; p.hand = ['grant', 'trail', 'machete', 'grant', 'grant']; const c = p.res.compass, k = p.res.coin; go(G, { t: 'play', i: 1 }); go(G, { t: 'play', i: 0 }); const t0 = G.turn; go(G, { t: 'play', i: 0 }); return eq([c + 2, k + 2, 0, 1], [p.res.compass, p.res.coin, t0, G.turn]); });
rule('H1c', 'Playing an item card for its effect uses the main action.', () => { const G = G2(), p = G.p[0]; p.hand = ['machete', 'grant', 'grant', 'grant', 'grant']; go(G, { t: 'play', i: 0 }); return eq(1, G.turn); });
rule('H2', 'Dread cards have no effect and cannot be played.', () => { const G = G2(), p = G.p[0]; p.hand = ['dread', 'dread', 'dread', 'dread', 'dread']; return eq(0, VG.moves(G).filter(m => m.t === 'play').length); });
rule('H3', 'Exile removes a card from the game for good (hand card exiled, then the rest of the effect).', () => { const G = G2(), p = G.p[0]; p.hand = ['tarp', 'grant', 'grant', 'grant', 'grant']; go(G, { t: 'play', i: 0 }); go(G, { t: 'ans', v: { z: 'hand', i: 0 } }); return eq({ ex: ['grant'], hand: 3, compass: 1, turn: 1 }, { ex: p.exiled, hand: p.hand.length, compass: p.res.compass, turn: G.turn }); });
rule('H4', 'Exile can also take a card from your PLAY area (including the card just played).', () => { const G = G2(), p = G.p[0]; p.hand = ['tarp', 'grant', 'grant', 'grant', 'grant']; go(G, { t: 'play', i: 0 }); return eq(true, VG.moves(G).some(m => m.t === 'ans' && m.v && m.v.z === 'play')); });
rule('H5', 'Draw effects draw from the top of the deck.', () => { const G = G2(), p = G.p[0]; p.hand = ['canteen', 'grant', 'grant', 'grant', 'grant']; p.deck = ['trail', 'grant']; const c = p.res.coin; go(G, { t: 'play', i: 0 }); return eq([5, 'trail', c + 1], [p.hand.length, p.hand[4], p.res.coin]); });
rule('H6', 'A free research step card moves the notebook up one row (never past the magnifier).', () => { const G = G2(), p = G.p[0]; p.glass = 1; p.hand = ['camera', 'grant', 'grant', 'grant', 'grant']; go(G, { t: 'play', i: 0 }); return eq(1, p.note); });

sec('I. Research track and temple');
rule('I1', 'Research: pay the row cost, move the magnifier up one row, take the row bonus.', () => { const G = G2(), p = G.p[0]; p.res.tablet = 1; const c = p.res.coin; go(G, { t: 'res', k: 'g' }); return eq([1, 0, c + 1], [p.glass, p.res.tablet, p.res.coin]); });
rule('I2', 'The notebook may never rise above the magnifier (equal is fine).', () => { const G = G2(); const p = G.p[0]; Object.keys(p.res).forEach(k => p.res[k] = 9); const out = []; [[0, 0], [1, 1], [2, 1]].forEach(([g, n]) => { p.glass = g; p.note = n; out.push(has(G, m => m.t === 'res' && m.k === 'n')); }); return eq([false, false, true], out); });
rule('I3', 'Each arrival (magnifier or notebook) takes the row bonus.', () => { const G = G2(), p = G.p[0]; p.glass = 1; p.res.tablet = 1; const c = p.res.coin; go(G, { t: 'res', k: 'n' }); return eq([1, c + 1], [p.note, p.res.coin]); });
rule('I4', 'First-arrival reward: only the first magnifier to a row takes the extra reward; every arrival takes the row bonus.', () => { const G = G2(), p = G.p[0], q = G.p[1]; p.glass = 1; q.glass = 1; p.res.arrow = 1; q.res.arrow = 1; p.res.tablet = 0; q.res.tablet = 0; p.res.compass = 0; q.res.compass = 0; go(G, { t: 'res', k: 'g' }); const a = [p.res.tablet, p.res.compass]; go(G, { t: 'res', k: 'g' }); return eq([[1, 2], [0, 2]], [a, [q.res.tablet, q.res.compass]]); });
rule('I5', 'Magnifier in the temple (top row) scores by order of arrival: first 10, second 8 (points).', () => { const G = G2(), p = G.p[0], q = G.p[1]; [p, q].forEach(x => { x.glass = 7; x.res.jewel = 1; x.res.tablet = 1; }); go(G, { t: 'res', k: 'g' }); go(G, { t: 'res', k: 'g' }); return eq([10, 8], [VG.score(G, 0).research, VG.score(G, 1).research]); });
rule('I6', 'The notebook can never enter the temple row.', () => { const G = G2(), p = G.p[0]; Object.keys(p.res).forEach(k => p.res[k] = 9); p.glass = 8; p.note = 7; return eq(false, has(G, m => m.t === 'res' && m.k === 'n')); });
rule('I7', 'Magnifier already in the temple: research buys a temple tile instead. A 6-point stack needs two of the three costs, the 11-point stack needs all three.', () => { const G = G2(), p = G.p[0]; p.glass = 8; p.res.tablet = 2; p.res.jewel = 1; p.res.arrow = 0; const a = [has(G, m => m.t === 'temple' && m.k === 0), has(G, m => m.t === 'temple' && m.k === 2)]; p.res.arrow = 2; return eq([true, false, true], a.concat([has(G, m => m.t === 'temple' && m.k === 2)])); });
rule('I8', 'Buying a temple tile removes it from its stack, scores its points and uses the main action.', () => { const G = G2(), p = G.p[0]; p.glass = 8; p.res.tablet = 2; p.res.jewel = 1; const n = G.temple[0]; go(G, { t: 'temple', k: 0 }); return eq({ n: n - 1, tiles: [6], res: [0, 0], turn: 1 }, { n: G.temple[0], tiles: p.temple, res: [p.res.tablet, p.res.jewel], turn: G.turn }); });
rule('I9', 'An empty temple stack cannot be bought from.', () => { const G = G2(), p = G.p[0]; p.glass = 8; Object.keys(p.res).forEach(k => p.res[k] = 9); G.temple[0] = 0; return eq(false, has(G, m => m.t === 'temple' && m.k === 0)); });
rule('I10', 'Research is a main action (turn passes) and the magnifier cannot move past the temple.', () => { const G = G2(), p = G.p[0]; p.res.tablet = 1; go(G, { t: 'res', k: 'g' }); const t = G.turn; p.glass = 8; return eq([1, false], [t, VG.moves(G).concat(G.turn === 1 ? [] : []).some(m => m.t === 'res' && m.k === 'g') && G.turn === 0]); });
rule('I11', 'Research cannot be done without paying the row cost.', () => { const G = G2(), p = G.p[0]; Object.keys(p.res).forEach(k => p.res[k] = 0); return eq(false, has(G, m => m.t === 'res')); });

sec('J. Scoring and end of game');
rule('J1', 'Research points come from final token rows (notebook row 3 + magnifier row 4).', () => { const G = G2(), p = G.p[0]; p.note = 3; p.glass = 4; return eq(V.NOTE_VP[3] + V.GLASS_VP[4], VG.score(G, 0).research); });
rule('J2', 'Temple tiles score the points shown on each tile.', () => { const G = G2(), p = G.p[0]; p.temple = [6, 11]; return eq(17, VG.score(G, 0).temple); });
rule('J3', 'Overcome guardians score 5 each.', () => { const G = G2(), p = G.p[0]; p.guards = [{ id: 'stone-ape', used: false }, { id: 'glass-moth', used: true }]; return eq(10, VG.score(G, 0).guards); });
rule('J4', 'Cards in the deck score their printed points (items and artifacts, all zones).', () => { const G = G2(), p = G.p[0]; p.deck = ['satchel']; p.hand = ['journal']; p.play = ['gold-mask']; p.disc = []; return eq(1 + 2 + 4, VG.score(G, 0).cards); });
rule('J5', 'Dread cards score -1 each; fear tiles -2 each.', () => { const G = G2(), p = G.p[0]; p.deck = ['dread', 'dread', 'dread']; p.hand = []; p.fearTiles = 2; return eq(-7, VG.score(G, 0).fear); });
rule('J6', 'Leftover resources are worth nothing.', () => { const G = G2(), p = G.p[0]; const a = VG.score(G, 0).total; Object.keys(p.res).forEach(k => p.res[k] = 9); return eq(a, VG.score(G, 0).total); });
rule('J7', 'Total = research + temple + idols + empty slots + guardians + cards - fear (worked example).', () => { const G = G2(), p = G.p[0]; p.note = 3; p.glass = 4; p.temple = [6, 11]; p.idols = [{ id: V.IDOLS[0], used: false }, { id: V.IDOLS[1], used: false }]; p.guards = [{ id: 'stone-ape', used: false }, { id: 'glass-moth', used: false }]; p.deck = ['satchel', 'journal', 'dread', 'dread']; p.hand = []; p.play = []; p.disc = []; p.fearTiles = 1; return eq(V.NOTE_VP[3] + V.GLASS_VP[4] + 17 + 6 + 5 + 10 + 3 - 2 - 2, VG.score(G, 0).total); });
rule('J8', 'The player with the most points wins at the end of round 5.', () => { const G = G2(); G.round = 5; G.p[0].guards = [{ id: 'stone-ape', used: false }]; passAll(G); return eq(0, G.winner); });
rule('J9', 'Tie on points: the player who reached the temple first wins.', () => { const G = G2(); G.round = 5; G.p[0].glass = 8; G.p[1].glass = 8; G.templeOrder = [1, 0]; G.p[0].deck.push('journal'); passAll(G); return eq([VG.score(G, 0).total, 1], [VG.score(G, 1).total, G.winner]); });
rule('J10', 'Tie on points and nobody reached the temple: the higher research score wins.', () => { const G = G2(); G.round = 5; G.p[0].note = 5; G.p[0].glass = 5; G.p[1].temple = [11, 2]; passAll(G); return eq([VG.score(G, 0).total, 0], [VG.score(G, 1).total, G.winner]); });
rule('J11', 'Any remaining tie stands (shared win).', () => { const G = G2(); G.round = 5; passAll(G); return eq(-1, G.winner); });
rule('J12', 'Round 5 ends with explorers returning and Dread for guardian sites, then straight to scoring (no row change).', () => { const G = afterDisc(); G.round = 5; const row = G.row.slice(); go(G, { t: 'pass' }); go(G, { t: 'pass' }); return eq({ over: 'over', dread: G.d0 + 1, row }, { over: G.phase, dread: cnt(G.p[0], 'dread'), row: G.row }); });

sec('K. Solo variant');
const SOLO = () => VG.newGame({ np: 1, solo: true, seed: 3 });
rule('K1', 'Solo: you play second and start with 1 coin and 1 compass.', () => { const p = SOLO().p[0]; return eq([1, 1], [p.res.coin, p.res.compass]); });
rule('K2', 'Solo: the rival is the starting player every round, so it takes a tile before your first action.', () => eq(1, SOLO().rival.played.length));
rule('K3', 'Solo: the rival action stack has 10 tiles per round.', () => { const R2 = SOLO().rival; return eq(10, R2.deck.length + R2.played.length); });
rule('K4', 'Solo: the rival keeps playing its tiles after you pass, until all are used.', () => { const G = SOLO(); const n = G.rival.deck.length, l0 = G.log.filter(x => x.s === -2).length; go(G, { t: 'pass' }); return eq(n, G.log.filter(x => x.s === -2).length - l0 - 1); });
rule('K5', 'Solo: the rival overcoming a guardian scores 5 points.', () => { const G = SOLO(); G.sites[5].tile = 'moth-cave'; G.sites[5].guard = 'stone-ape'; G.rival.deck = ['rv-hunt']; G.rival.vp = 0; go(G, { t: 'pass' }); return eq(5, G.rival.vp); });
rule('K6', 'Solo: the rival discovering a site takes an idol worth 3 points.', () => { const G = SOLO(); G.rival.deck = ['rv-scout']; G.rival.vp = 0; go(G, { t: 'pass' }); return eq(3, G.rival.vp); });

if (process.argv.includes('--md')) {
  const lines = []; let n = 0; R.forEach(r => { if (r.sec) lines.push('', '## ' + r.sec, ''); else { n++; lines.push('- **' + r.id + '** ' + r.text); } });
  console.log(lines.join('\n') + '\n\nTOTAL ' + n); process.exit(0);
}
let pass = 0, fail = 0; const failed = [];
R.forEach(r => {
  if (!r.fn) return; let e, g;
  try { const x = r.fn(); e = x[0]; g = x[1]; } catch (err) { e = 'no error'; g = 'ERROR ' + (err && err.message); }
  if (J(e) === J(g)) pass++; else { fail++; failed.push(r.id); console.log('FAIL ' + r.id + ' expected ' + J(e) + ' got ' + J(g)); }
});
console.log('LOGIC-TEST rules ' + (pass + fail) + ' pass ' + pass + ' fail ' + fail + (fail ? ' [' + failed.join(' ') + ']' : ''));
process.exit(fail ? 1 : 0);

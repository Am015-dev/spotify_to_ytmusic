// Wildmark logic test: one headless assertion per numbered rule in RULES-CHECKLIST.md, against the real engine (src/data.js, engine.js, cards.js).
// Every rule sets up its own state, acts, and checks the exact result. It does not reuse rules-test.js.
// Usage: node logic-test.js            -> one line per failing rule ("R12 expected ... got ..."), then a summary
//        node logic-test.js --list     -> prints the rule list as markdown (used to build RULES-CHECKLIST.md)
global.window = global; require('./src/data.js'); require('./src/engine.js'); require('./src/cards.js');
const W = window.WM;
const RULES = []; let sec = '';
const S = (name) => { sec = name; RULES.push({ sec: name, head: true }); };
const R = (title, fn, note) => RULES.push({ sec, title, fn, note: note || '' });
const eq = (exp, got, what) => { const a = JSON.stringify(exp), b = JSON.stringify(got); if (a !== b) throw new Error('expected ' + a + ' got ' + b + (what ? ' (' + what + ')' : '')); };
const throws = (f, what) => { try { f(); } catch (e) { return; } throw new Error('expected an error, got none' + (what ? ' (' + what + ')' : '')); };
// ---- helpers (independent of the engine's own geometry)
const D6 = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
const key = (q, r) => q + ',' + r;
let uid = 5000;
const tile = (t, a, k) => ({ id: uid++, t: t.slice(), a: a.slice(), key: !!k });
const cell = (o) => Object.assign({ id: uid++, t: ['forest'], a: W.ANI.slice(), key: false, rot: 0, tok: null }, o);
const env = (list) => { const e = {}; list.forEach(([q, r, tok]) => e[key(q, r)] = cell({ tok: tok || null })); return e; };   // animal-card scoring maps
const A = (list, a, set) => W.scoreAnimal(env(list), a, null, set === undefined ? 'a' : set);
const terrEnv = (list) => { const e = {}; list.forEach(([q, r, t, rot, tok]) => e[key(q, r)] = cell({ t: Array.isArray(t) ? t : [t], rot: rot || 0, a: ['bear'], tok: tok || null })); return e; };
const game = (np, seed, o) => W.newGame(Object.assign({ np: np, seed: seed == null ? 11 : seed }, o || {}));
const bagOf = (o) => Object.assign({ bear: 0, elk: 0, salmon: 0, hawk: 0, fox: 0 }, o || {});
const setMarket = (G, tiles, toks) => { G.market.tiles = tiles.slice(); G.market.toks = toks.slice(); };
const T1 = (t, a, k) => tile([t], [a], k !== false);
const placeFirst = (G, rot) => { const c = W.spots(G.seats[G.cur].env)[0]; W.apply(G, { t: 'place', c: c, rot: rot || 0 }); return c; };
const fourT = () => [tile(['forest', 'river'], ['bear', 'elk']), tile(['peak', 'marsh'], ['hawk', 'fox']), tile(['meadow', 'peak'], ['salmon', 'bear']), tile(['river', 'marsh'], ['elk', 'fox', 'hawk'])];
const any = (G) => G.market.tiles.findIndex((t, i) => t && G.market.toks[i]);
const sumBag = (G) => Object.keys(G.bag).reduce((n, a) => n + G.bag[a], 0);

// ======================================================================= SETUP
S('Setup');
R('The bag holds 100 wildlife tokens, 20 each of bear, elk, salmon, hawk, fox (bag + the 4 market tokens at the start).', () => {
  const G = game(2, 3), n = {}; W.ANI.forEach(a => n[a] = G.bag[a]); G.market.toks.forEach(a => n[a]++);
  eq({ bear: 20, elk: 20, salmon: 20, hawk: 20, fox: 20 }, n);
});
R('There are 85 habitat tiles in total (not counting the 5 starter triads).', () => eq(85, W.TILES.length));
R('25 keystone tiles: one habitat and exactly one animal each, 5 of every habitat.', () => {
  const ks = W.TILES.filter(t => t.key); eq(25, ks.length);
  ks.forEach(t => { eq(1, t.t.length, 'keystone terrains'); eq(1, t.a.length, 'keystone animals'); });
  W.TER.forEach(h => eq(5, ks.filter(t => t.t[0] === h).length, h));
});
R('60 two-habitat tiles: each of the 10 habitat pairs appears exactly 6 times.', () => {
  const sp = W.TILES.filter(t => !t.key); eq(60, sp.length); let pairs = 0;
  for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) { pairs++; eq(6, sp.filter(t => t.t.length === 2 && t.t.indexOf(W.TER[i]) >= 0 && t.t.indexOf(W.TER[j]) >= 0).length, W.TER[i] + '/' + W.TER[j]); }
  eq(10, pairs);
});
R('Every two-habitat tile shows 2 or 3 different animals (never 1, never a repeat).', () => {
  W.TILES.filter(t => !t.key).forEach(t => { if (t.a.length < 2 || t.a.length > 3 || new Set(t.a).size !== t.a.length) throw new Error('expected 2-3 distinct animals got ' + JSON.stringify(t.a)); });
});
R('Every tile has a unique id, and the two habitats of a split tile differ.', () => {
  eq(85, new Set(W.TILES.map(t => t.id)).size); W.TILES.forEach(t => { if (t.t.length === 2) eq(true, t.t[0] !== t.t[1]); });
});
R('The supply holds 25 acorn (nature) tokens; every player starts with none.', () => { const G = game(3, 5); eq(25, G.acornPool); eq([0, 0, 0], G.seats.map(s => s.acorns)); });
R('Each player starts with a triad of 3 tiles that touch each other; no two players share a triad (4 players).', () => {
  const G = game(4, 8), sig = [];
  G.seats.forEach(s => { const c = Object.keys(s.env); eq(3, c.length);
    c.forEach(a => { const p = a.split(',').map(Number); const n = D6.filter(d => s.env[key(p[0] + d[0], p[1] + d[1])]).length; if (n < 2) throw new Error('tile ' + a + ' touches ' + n + ' others, expected 2 (triad)'); });
    sig.push(c.map(a => s.env[a].t.join('/') + ':' + s.env[a].a.join('/')).sort().join('|')); });
  eq(4, new Set(sig).size, 'distinct starters');
});
R('Tile stack size: 43 tiles for 1 or 2 players, 63 for 3, 83 for 4 (market tiles included).', () => {
  const tot = (G) => G.supply.length + G.market.tiles.filter(Boolean).length;
  eq([43, 43, 63, 83], [1, 2, 3, 4].map(n => tot(game(n, 4))));
});
R('The market starts with exactly 4 tiles and 4 tokens, each tile paired with the token in its column.', () => {
  const G = game(2, 6); eq(4, G.market.tiles.filter(Boolean).length); eq(4, G.market.toks.filter(Boolean).length); eq(4, G.market.tiles.length); eq(4, G.market.toks.length);
});
R('A starting market of 4 identical tokens is wiped and redrawn automatically (200 seeds: never 4 alike).', () => {
  for (let s = 1; s <= 200; s++) { const t = game(2, s).market.toks; if (t.every(x => x === t[0])) throw new Error('seed ' + s + ' started with four ' + t[0]); }
});
R('Players count is 1 to 4 (solo = 1 seat); play starts with the first seat in round 1.', () => {
  eq([1, 2, 4], [1, 2, 4].map(n => game(n).seats.length)); eq(4, game(7).seats.length); const G = game(3, 2); eq([0, 1, 'pick'], [G.cur, G.round, G.stage]);
});

// ======================================================================= TURN: taking a pair
S('Turn: taking and placing');
R('Without acorns the only picks are the 4 market pairs (tile and token of one column); no free pick, no replace.', () => {
  const G = game(2, 3); const m = W.moves(G); eq(4, m.filter(x => x.t === 'take').length); eq(0, m.filter(x => x.t === 'free' || x.t === 'wipe').length);
});
R('Taking column i gives you that column\'s tile AND that column\'s token, and empties exactly those two slots.', () => {
  const G = game(2, 3); const tl = fourT(); setMarket(G, tl, ['bear', 'elk', 'salmon', 'hawk']);
  W.apply(G, { t: 'take', i: 2 }); eq([tl[2].id, 'salmon'], [G.hold.tile.id, G.hold.tok]); eq([true, true, false, true], G.market.tiles.map(Boolean)); eq(['bear', 'elk', null, 'hawk'], G.market.toks); eq('tile', G.stage);
});
R('A tile may only be placed on an empty hex touching at least one of your tiles: the legal spots are exactly those hexes.', () => {
  const G = game(2, 3), e = G.seats[0].env, exp = new Set();
  Object.keys(e).forEach(c => { const p = c.split(',').map(Number); D6.forEach(d => { const n = key(p[0] + d[0], p[1] + d[1]); if (!e[n]) exp.add(n); }); });
  eq([...exp].sort(), W.spots(e).sort());
});
R('Placing a tile on an occupied hex is refused.', () => {
  const G = game(2, 3); W.apply(G, { t: 'take', i: 0 }); throws(() => W.apply(G, { t: 'place', c: Object.keys(G.seats[0].env)[0], rot: 0 }));
});
R('Placing a tile on a hex that touches none of your tiles is refused.', () => {
  const G = game(2, 3); W.apply(G, { t: 'take', i: 0 }); throws(() => W.apply(G, { t: 'place', c: '9,9', rot: 0 }));
});
R('The tile must be placed: while holding it the only moves are placements (no discard, no skip).', () => {
  const G = game(2, 3); W.apply(G, { t: 'take', i: 1 }); eq(['place'], [...new Set(W.moves(G).map(m => m.t))]);
});
R('A two-habitat tile can be placed in any of the 6 rotations; a keystone has a single orientation.', () => {
  const G = game(2, 3), n = W.spots(G.seats[0].env).length; setMarket(G, [tile(['forest', 'river'], ['bear', 'elk']), T1('peak', 'hawk'), T1('peak', 'bear'), T1('peak', 'fox')], ['bear', 'elk', 'fox', 'hawk']);
  W.apply(G, { t: 'take', i: 0 }); eq(n * 6, W.moves(G).length, 'split'); const H = game(2, 3); setMarket(H, [T1('peak', 'hawk'), T1('peak', 'bear'), T1('peak', 'elk'), T1('peak', 'fox')], ['hawk', 'elk', 'fox', 'bear']);
  W.apply(H, { t: 'take', i: 0 }); eq(n, W.moves(H).length, 'keystone');
});
R('The chosen rotation is kept on the placed tile: rotation r shifts which three edges show the first habitat.', () => {
  [0, 1, 2, 3, 4, 5].forEach(r => { const G = game(2, 3); setMarket(G, [tile(['forest', 'river'], ['bear', 'elk']), T1('peak', 'hawk'), T1('peak', 'bear'), T1('peak', 'fox')], ['bear', 'elk', 'fox', 'hawk']);
    W.apply(G, { t: 'take', i: 0 }); const c = placeFirst(G, r); eq(r, G.seats[0].env[c].rot);
    const edges = [0, 1, 2, 3, 4, 5].map(i => W.edgeT(G.seats[0].env[c], i)), first = edges.map((x, i) => x === 'forest' ? i : -1).filter(i => i >= 0);
    eq([r, (r + 1) % 6, (r + 2) % 6].sort(), first.sort(), 'forest edges at rotation ' + r); });
});
R('After placing a tile the token step follows; legal token spots = your tiles with no token that show that animal (the new tile included).', () => {
  const G = game(2, 3); setMarket(G, [tile(['forest', 'river'], ['bear', 'elk']), T1('peak', 'hawk'), T1('peak', 'bear'), T1('peak', 'fox')], ['elk', 'elk', 'fox', 'hawk']);
  W.apply(G, { t: 'take', i: 0 }); const c = placeFirst(G, 0); const env0 = G.seats[0].env;
  const exp = Object.keys(env0).filter(x => !env0[x].tok && env0[x].a.indexOf('elk') >= 0).sort(); eq(exp, W.moves(G).filter(m => m.t === 'tok').map(m => m.c).sort()); eq(true, exp.indexOf(c) >= 0, 'new tile is a spot');
});
R('The token may go on an older tile, not only on the tile just placed.', () => {
  const G = game(2, 3), e = G.seats[0].env; const old = Object.keys(e).find(c => e[c].a.indexOf('fox') >= 0) || Object.keys(e)[0]; e[old].a = ['fox'];
  setMarket(G, [tile(['peak', 'marsh'], ['bear', 'elk']), T1('peak', 'hawk'), T1('peak', 'bear'), T1('peak', 'elk')], ['fox', 'elk', 'fox', 'hawk']);
  W.apply(G, { t: 'take', i: 0 }); placeFirst(G); W.apply(G, { t: 'tok', c: old }); eq('fox', e[old].tok);
});
R('A token cannot be placed on a tile that does not show that animal.', () => {
  const G = game(2, 3), e = G.seats[0].env; Object.keys(e).forEach(c => e[c].a = ['bear']);
  setMarket(G, [tile(['peak', 'marsh'], ['bear', 'elk']), T1('peak', 'hawk'), T1('peak', 'bear'), T1('peak', 'elk')], ['salmon', 'elk', 'fox', 'hawk']);
  W.apply(G, { t: 'take', i: 0 }); const c = placeFirst(G); throws(() => W.apply(G, { t: 'tok', c: c }));
});
R('A tile holds at most one token: placing on a tile that already has one is refused.', () => {
  const G = game(2, 3), e = G.seats[0].env, c0 = Object.keys(e)[0]; e[c0].a = ['bear']; e[c0].tok = 'bear';
  setMarket(G, [tile(['peak', 'marsh'], ['elk', 'fox']), T1('peak', 'hawk'), T1('peak', 'bear'), T1('peak', 'elk')], ['bear', 'elk', 'fox', 'hawk']);
  W.apply(G, { t: 'take', i: 0 }); placeFirst(G); throws(() => W.apply(G, { t: 'tok', c: c0 }));
});
R('A token you cannot or will not place goes back to the bag; the turn still ends and nothing else changes.', () => {
  const G = game(2, 3); setMarket(G, fourT(), ['bear', 'elk', 'salmon', 'hawk']); G.bag = bagOf({ fox: 30 });
  W.apply(G, { t: 'take', i: 1 }); placeFirst(G); W.apply(G, { t: 'back' });
  eq(30, sumBag(G), 'bag: 30 + 1 returned - 1 refill'); eq(1, G.bag.elk + G.market.toks.filter(x => x === 'elk').length, 'the elk is back in play'); eq([0, 1], [G.seats[0].acorns, G.cur]); eq(false, Object.keys(G.seats[0].env).some(c => G.seats[0].env[c].tok));
});
R('Placing a token on a KEYSTONE gives you 1 acorn from the supply.', () => {
  const G = game(2, 3); setMarket(G, [T1('forest', 'bear'), T1('peak', 'hawk'), T1('peak', 'elk'), T1('peak', 'fox')], ['bear', 'elk', 'fox', 'hawk']);
  W.apply(G, { t: 'take', i: 0 }); const c = placeFirst(G); W.apply(G, { t: 'tok', c: c }); eq([1, 24], [G.seats[0].acorns, G.acornPool]);
});
R('Placing a token on a two-habitat tile gives no acorn.', () => {
  const G = game(2, 3); setMarket(G, [tile(['forest', 'river'], ['bear', 'elk']), T1('peak', 'hawk'), T1('peak', 'elk'), T1('peak', 'fox')], ['bear', 'elk', 'fox', 'hawk']);
  W.apply(G, { t: 'take', i: 0 }); const c = placeFirst(G); W.apply(G, { t: 'tok', c: c }); eq([0, 25], [G.seats[0].acorns, G.acornPool]);
});
R('Returning a token to the bag earns no acorn, even when a keystone was placed.', () => {
  const G = game(2, 3); setMarket(G, [T1('forest', 'bear'), T1('peak', 'hawk'), T1('peak', 'elk'), T1('peak', 'fox')], ['bear', 'elk', 'fox', 'hawk']);
  W.apply(G, { t: 'take', i: 0 }); placeFirst(G); W.apply(G, { t: 'back' }); eq([0, 25], [G.seats[0].acorns, G.acornPool]);
});
R('An empty acorn supply gives no acorn for a keystone token.', () => {
  const G = game(2, 3); G.acornPool = 0; setMarket(G, [T1('forest', 'bear'), T1('peak', 'hawk'), T1('peak', 'elk'), T1('peak', 'fox')], ['bear', 'elk', 'fox', 'hawk']);
  W.apply(G, { t: 'take', i: 0 }); const c = placeFirst(G); W.apply(G, { t: 'tok', c: c }); eq([0, 0], [G.seats[0].acorns, G.acornPool]);
});
R('Acorns are conserved: supply + held + spent-and-returned always equals 25.', () => {
  const G = game(2, 3, { acorns: [2, 1] }); G.acornPool = 22; W.apply(G, { t: 'wipe', idx: [0] }); W.apply(G, { t: 'free', ti: 0, ki: 1 });
  eq(25, G.acornPool + G.seats[0].acorns + G.seats[1].acorns);
});
R('Refill after the turn: only the two emptied slots are refilled (new tile from the stack, new token from the bag); other pairs keep slot and partner.', () => {
  const G = game(2, 3); const tl = fourT(); setMarket(G, tl, ['bear', 'elk', 'salmon', 'hawk']); const top = G.supply[G.supply.length - 1], n0 = G.supply.length;
  W.apply(G, { t: 'take', i: 1 }); placeFirst(G); W.apply(G, { t: 'back' });
  eq([tl[0].id, top.id, tl[2].id, tl[3].id], G.market.tiles.map(t => t.id)); eq(n0 - 1, G.supply.length); eq(['bear', 'salmon', 'hawk'], [G.market.toks[0], G.market.toks[2], G.market.toks[3]]); eq(true, !!G.market.toks[1]);
});
R('Refill with an empty tile stack leaves the slot empty without error (end of game).', () => {
  const G = game(2, 3); G.supply = []; W.apply(G, { t: 'take', i: 0 }); placeFirst(G); W.apply(G, { t: 'back' }); eq(null, G.market.tiles[0]);
});
R('Turn order: after a turn the next seat acts, wrapping to seat 0 with the round counter +1.', () => {
  const G = game(3, 3); const go = () => { W.apply(G, { t: 'take', i: 0 }); placeFirst(G); W.apply(G, { t: 'back' }); };
  go(); eq([1, 1], [G.cur, G.round]); go(); go(); eq([0, 2], [G.cur, G.round]);
});
R('Each turn counts for its player: after one turn seat 0 has done 1 and seat 1 none, and the played tile stays on the map.', () => {
  const G = game(2, 3); W.apply(G, { t: 'take', i: 0 }); placeFirst(G); W.apply(G, { t: 'back' }); eq([1, 0], G.seats.map(s => s.done)); eq([4, 3], G.seats.map(s => Object.keys(s.env).length));
});

// ======================================================================= ACORNS
S('Acorn (nature token) powers');
R('Acorn power 1: spend 1 acorn to take ANY tile with ANY token (different columns); the acorn returns to the supply.', () => {
  const G = game(2, 3, { acorns: [1, 0] }); const tl = fourT(); setMarket(G, tl, ['bear', 'elk', 'salmon', 'hawk']); G.acornPool = 24;
  W.apply(G, { t: 'free', ti: 3, ki: 0 }); eq([tl[3].id, 'bear'], [G.hold.tile.id, G.hold.tok]); eq([0, 25], [G.seats[0].acorns, G.acornPool]); eq([true, true, true, false], G.market.tiles.map(Boolean)); eq([false, true, true, true], G.market.toks.map(Boolean));
});
R('The free pick is refused without an acorn.', () => { const G = game(2, 3); throws(() => W.apply(G, { t: 'free', ti: 0, ki: 1 })); });
R('Acorn power 2: spend 1 acorn to replace ANY NUMBER of the market tokens; only the chosen slots change, the acorn goes back to the supply.', () => {
  const G = game(2, 3, { acorns: [1, 0] }); setMarket(G, fourT(), ['bear', 'elk', 'salmon', 'hawk']); G.bag = bagOf({ fox: 50 }); G.acornPool = 24;
  W.apply(G, { t: 'wipe', idx: [0, 2] }); eq(['fox', 'elk', 'fox', 'hawk'], G.market.toks); eq([0, 25], [G.seats[0].acorns, G.acornPool]); eq(bagOf({ bear: 1, salmon: 1, fox: 48 }), G.bag);
});
R('Replaced tokens are drawn FIRST and only then returned to the bag (you cannot redraw what you just discarded).', () => {
  const G = game(2, 3, { acorns: [1, 0] }); setMarket(G, fourT(), ['bear', 'elk', 'salmon', 'hawk']); G.bag = bagOf({}); W.apply(G, { t: 'wipe', idx: [0] });
  eq(null, G.market.toks[0], 'empty bag, slot must not get the discarded bear back'); eq(1, G.bag.bear);
});
R('Replacing tokens needs an acorn.', () => { const G = game(2, 3); throws(() => W.apply(G, { t: 'wipe', idx: [0] })); });
R('Several acorn powers can be used in one turn (replace, then a free pick), each costing its own acorn.', () => {
  const G = game(2, 3, { acorns: [2, 0] }); W.apply(G, { t: 'wipe', idx: [1] }); eq('pick', G.stage); W.apply(G, { t: 'free', ti: 0, ki: 1 }); eq([0, 'tile'], [G.seats[0].acorns, G.stage]);
});
R('Acorn powers can only be used before you take your pair (not while placing).', () => {
  const G = game(2, 3, { acorns: [1, 0] }); W.apply(G, { t: 'take', i: 0 }); throws(() => W.apply(G, { t: 'wipe', idx: [1] }));
});
R('If a replace leaves 4 identical tokens, they are wiped again automatically.', () => {
  const G = game(2, 3, { acorns: [1, 0] }); setMarket(G, fourT(), ['bear', 'bear', 'bear', 'elk']); G.bag = bagOf({ bear: 1 });
  W.apply(G, { t: 'wipe', idx: [3] }); eq(false, G.market.toks.filter(Boolean).length === 4 && G.market.toks.every(x => x === 'bear'), 'four bears left on the table'); eq(4, G.bag.bear);
});
R('Acorns left at the end are worth 1 point each.', () => {
  const G = game(2, 3, { acorns: [3, 1] }); const f = W.final(G); eq(3, f[0].acorns); eq(f[0].total, f[0].aniT + f[0].habT + 3 + f[0].bonusT);
});

// ======================================================================= OVERPOPULATION
S('Overpopulation (three or four identical tokens)');
R('Three identical market tokens: the active player MAY wipe those three (offered as a move, optional: the normal picks stay available).', () => {
  const G = game(2, 3); G.market.toks = ['elk', 'elk', 'elk', 'fox']; const m = W.moves(G); eq(1, m.filter(x => x.t === 'wipe3').length); eq(4, m.filter(x => x.t === 'take').length);
});
R('The three-token wipe is not offered with only two alike, or after the market is already four alike.', () => {
  const G = game(2, 3); G.market.toks = ['elk', 'elk', 'bear', 'fox']; eq(0, W.moves(G).filter(x => x.t === 'wipe3').length); G.market.toks = ['elk', 'elk', 'elk', 'elk']; eq(0, W.moves(G).filter(x => x.t === 'wipe3').length);
});
R('The three-token wipe replaces exactly the three matching tokens (the odd one stays) and returns them to the bag after drawing.', () => {
  const G = game(2, 3); G.market.toks = ['elk', 'fox', 'elk', 'elk']; G.bag = bagOf({ hawk: 30 }); W.apply(G, { t: 'wipe3' });
  eq(['hawk', 'fox', 'hawk', 'hawk'], G.market.toks); eq(3, G.bag.elk); eq(27, G.bag.hawk);
});
R('The three-token wipe works at most once per turn, even if three alike show up again.', () => {
  const G = game(2, 3); G.market.toks = ['elk', 'elk', 'elk', 'fox']; G.bag = bagOf({ hawk: 30 }); W.apply(G, { t: 'wipe3' }); G.market.toks = ['bear', 'bear', 'bear', 'fox']; eq(0, W.moves(G).filter(x => x.t === 'wipe3').length);
});
R('The once-per-turn limit resets for the next turn.', () => {
  const G = game(2, 3); G.market.toks = ['elk', 'elk', 'elk', 'fox']; G.bag = bagOf({ hawk: 30 }); W.apply(G, { t: 'wipe3' }); W.apply(G, { t: 'take', i: 0 }); placeFirst(G); W.apply(G, { t: 'back' });
  G.market.toks = ['bear', 'bear', 'bear', 'fox']; eq(1, W.moves(G).filter(x => x.t === 'wipe3').length);
});
R('The three-token wipe costs no acorn.', () => { const G = game(2, 3, { acorns: [1, 0] }); G.market.toks = ['elk', 'elk', 'elk', 'fox']; W.apply(G, { t: 'wipe3' }); eq(1, G.seats[0].acorns); });
R('Four identical tokens (after a refill) are wiped automatically: all four return to the bag and four new ones are drawn.', () => {
  const G = game(2, 3); setMarket(G, fourT(), ['bear', 'bear', 'bear', 'elk']); G.bag = bagOf({ bear: 1 });
  W.apply(G, { t: 'take', i: 3 }); const c = placeFirst(G); W.apply(G, { t: 'tok', c: c });   // the refill draws the last bear -> four bears
  eq(false, G.market.toks.some(x => x === 'bear'), 'no bear left on the table'); eq(4, G.bag.bear, 'all four bears back in the bag');
});
R('Automatic four-token wipes repeat until the four tokens are not all alike (200 full games, never four alike on a player\'s turn).', () => {
  for (let s = 0; s < 60; s++) { const G = game(1 + s % 4, 300 + s); let n = 0; while (!G.over && n++ < 400) { const t = G.market.toks; if (t.length === 4 && t.every(x => x && x === t[0])) throw new Error('seed ' + (300 + s) + ' four ' + t[0] + ' at round ' + G.round); const mv = W.moves(G); const m = mv.find(x => x.t === 'take') || mv.find(x => x.t === 'place') || mv.find(x => x.t === 'tok') || mv[0]; W.apply(G, m); } }
});

// ======================================================================= END OF GAME
S('End of the game');
R('Each player gets exactly 20 turns: a 2-player game lasts 40 turns, ending right after the second seat\'s 20th turn, not earlier.', () => {
  const G = game(2, 9); let turns = 0; while (!G.over && turns < 100) { W.apply(G, { t: 'take', i: any(G) }); placeFirst(G); W.apply(G, { t: 'back' }); turns++; if (turns === 39) eq(false, G.over, 'over after 39 turns'); }
  eq(40, turns); eq([20, 20], G.seats.map(s => s.done)); eq(true, G.over);
});
R('3- and 4-player games last 60 and 80 turns.', () => {
  [3, 4].forEach(np => { const G = game(np, 9); let t = 0; while (!G.over && t < 200) { W.apply(G, { t: 'take', i: any(G) }); placeFirst(G); W.apply(G, { t: 'back' }); t++; } eq(np * 20, t, np + ' players'); });
});
R('Everyone ends with 23 tiles (3 starter + 20 placed); the stack is used up and 3 tiles remain face-up in the market.', () => {
  const G = game(2, 9); while (!G.over) { W.apply(G, { t: 'take', i: any(G) }); placeFirst(G); W.apply(G, { t: 'back' }); }
  eq([23, 23], G.seats.map(s => Object.keys(s.env).length)); eq(0, G.supply.length); eq(3, G.market.tiles.filter(Boolean).length);
});
R('Once the game is over there are no legal moves and no move is accepted.', () => {
  const G = game(2, 9); W.forceEnd(G); eq([], W.moves(G)); throws(() => W.apply(G, { t: 'take', i: 0 }));
});
R('Winner = highest total (animals + habitats + majority bonuses + acorns).', () => {
  const G = game(2, 9); G.seats[0].acorns = 9; G.seats[1].acorns = 0; W.forceEnd(G); const r = G.res; eq(true, r[0].total > r[1].total); eq(0, G.winner);
});
R('Tie on points: the player with more acorns wins.', () => {
  const G = game(2, 9); G.seats[0].env = terrEnv([[0, 0, 'river'], [1, 0, 'river']]); G.seats[1].env = terrEnv([[0, 0, 'river']]); G.seats[0].acorns = 0; G.seats[1].acorns = 3;
  W.forceEnd(G); eq([4, 4], G.res.map(r => r.total), 'seat 0: 2 tiles + river bonus 2; seat 1: 1 tile + 3 acorns'); eq(1, G.winner);
});
R('Tie on points AND acorns: shared victory (no single winner).', () => {
  const G = game(2, 9); G.seats[1].env = JSON.parse(JSON.stringify(G.seats[0].env)); G.seats[1].acorns = G.seats[0].acorns = 2;
  // two identical valleys: bonuses split evenly, so totals and acorns match exactly
  W.forceEnd(G); eq(G.res[0].total, G.res[1].total); eq(-2, G.winner);
});

// ======================================================================= SOLO
S('Solo game');
R('Solo is 20 turns on a 43-tile stack, then the game ends.', () => {
  const G = game(1, 9); let t = 0; while (!G.over && t < 100) { W.apply(G, { t: 'take', i: any(G) }); placeFirst(G); W.apply(G, { t: 'back' }); t++; } eq(20, t); eq(23, Object.keys(G.seats[0].env).length);
});
R('Solo: after each turn the tile and the token farthest from the stack are removed from the game; the tile never returns.', () => {
  const G = game(1, 9), tl = fourT(); setMarket(G, tl, ['bear', 'elk', 'salmon', 'hawk']); W.apply(G, { t: 'take', i: 1 }); placeFirst(G); W.apply(G, { t: 'back' });
  const left = G.market.tiles.map(t => t && t.id); eq(false, left.indexOf(tl[3].id) >= 0, 'farthest tile gone'); eq(true, left.indexOf(tl[0].id) >= 0 && left.indexOf(tl[2].id) >= 0, 'the other two stay');
  eq(false, G.supply.some(t => t.id === tl[3].id), 'not back in the stack');
});
R('Solo: the removed token leaves the game (it does not go back into the bag).', () => {
  const G = game(1, 9); setMarket(G, fourT(), ['bear', 'elk', 'salmon', 'hawk']); G.bag = bagOf({ fox: 40 }); G.supply = G.supply.slice(0, 30);
  W.apply(G, { t: 'take', i: 1 }); placeFirst(G); W.apply(G, { t: 'back' });
  eq(0, G.bag.hawk, 'the removed hawk is not in the bag'); eq(1, G.bag.elk, 'the returned (unplaced) elk is');
});
R('Solo: the remaining market items slide toward the stack and two new tile+token pairs fill the far end.', () => {
  const G = game(1, 9), tl = fourT(); setMarket(G, tl, ['bear', 'elk', 'salmon', 'hawk']); const nxt = G.supply.slice(-2).map(t => t.id).reverse();
  W.apply(G, { t: 'take', i: 1 }); placeFirst(G); W.apply(G, { t: 'back' });
  eq([tl[0].id, tl[2].id, nxt[0], nxt[1]], G.market.tiles.map(t => t.id)); eq(['bear', 'salmon'], [G.market.toks[0], G.market.toks[1]]);
});
R('Solo: the farthest REMAINING item is removed when the farthest slot itself was taken.', () => {
  const G = game(1, 9), tl = fourT(); setMarket(G, tl, ['bear', 'elk', 'salmon', 'hawk']); W.apply(G, { t: 'take', i: 3 }); placeFirst(G); W.apply(G, { t: 'back' });
  const ids = G.market.tiles.map(t => t.id); eq(false, ids.indexOf(tl[2].id) >= 0, 'tile 2 removed'); eq(true, ids.indexOf(tl[0].id) >= 0 && ids.indexOf(tl[1].id) >= 0);
});
R('Solo: component conservation holds (every token is in the bag, market, a valley, in hand, or removed from the game).', () => {
  const G = game(1, 9); let n = 0; while (!G.over && n++ < 100) { W.apply(G, { t: 'take', i: any(G) }); placeFirst(G); W.apply(G, { t: 'back' }); eq([], W.check(G)); }
});

// ======================================================================= SCORING: animal cards A
S('Scoring: wildlife card A');
const tab = (name, a, pts, mk) => R(name, () => pts.forEach((p, n) => { if (n) eq(p, A(mk(n), a), n + ' groups'); }));
tab('Bears A: groups of EXACTLY 2 bears; 1 / 2 / 3 / 4 pairs = 4 / 11 / 19 / 27, more pairs stay at 27.', 'bear', [0, 4, 11, 19, 27, 27], n => { const l = []; for (let i = 0; i < n; i++) l.push([i * 3, 0, 'bear'], [i * 3 + 1, 0, 'bear']); return l; });
R('Bears A: a lone bear scores 0; a group of 3 scores 0; a group of 3 does not count as a pair plus one.', () => { eq(0, A([[0, 0, 'bear']], 'bear')); eq(0, A([[0, 0, 'bear'], [1, 0, 'bear'], [2, 0, 'bear']], 'bear')); eq(4, A([[0, 0, 'bear'], [1, 0, 'bear'], [5, 0, 'bear'], [6, 0, 'bear'], [7, 0, 'bear']], 'bear')); });
R('Bears A: the two bears of a pair must touch each other (diagonal hex neighbours count, 2 apart does not).', () => { eq(4, A([[0, 0, 'bear'], [1, -1, 'bear']], 'bear')); eq(0, A([[0, 0, 'bear'], [2, 0, 'bear']], 'bear')); });
tab('Elk A: a straight line of N elk scores 2 / 5 / 9 / 13 for N = 1 / 2 / 3 / 4 (separate single elk each 2).', 'elk', [0, 2, 5, 9, 13], n => { const l = []; for (let i = 0; i < n; i++) l.push([i, 0, 'elk']); return l; });
R('Elk A: lines run along each of the three hex axes.', () => { [[1, 0], [0, 1], [1, -1]].forEach(d => eq(9, A([[0, 0, 'elk'], [d[0], d[1], 'elk'], [2 * d[0], 2 * d[1], 'elk']], 'elk'), JSON.stringify(d))); });
R('Elk A: a bent group (three elk, not straight) is a line of 2 plus a single = 7.', () => eq(7, A([[0, 0, 'elk'], [1, 0, 'elk'], [1, -1, 'elk']], 'elk')));
R('Elk A: 5 elk in a row = a line of 4 (13) plus a single (2) = 15; each elk counts in one line only.', () => eq(15, A([0, 1, 2, 3, 4].map(i => [i, 0, 'elk']), 'elk')));
R('Elk A: every elk is used once in the combination that scores MOST (checked against brute force on 300 random elk layouts).', () => {
  const tabE = [0, 2, 5, 9, 13];
  const best = (cells) => { const has = new Set(cells.map(c => c.join(','))); let memo = {};
    const lines = []; cells.forEach(c => [0, 1, 5].forEach(d => { let l = []; let q = c; for (let n = 1; n <= 4; n++) { if (!has.has(q.join(','))) break; l.push(q.join(',')); lines.push(l.slice()); q = [q[0] + D6[d][0], q[1] + D6[d][1]]; } }));
    const rec = (used) => { const left = cells.map(c => c.join(',')).filter(c => !used.has(c)); if (!left.length) return 0; const k = left.join('|'); if (memo[k] != null) return memo[k]; const first = left[0]; let b = -1;
      lines.forEach(l => { if (l.indexOf(first) < 0 || l.some(c => used.has(c))) return; const u = new Set(used); l.forEach(c => u.add(c)); b = Math.max(b, tabE[l.length] + rec(u)); }); return memo[k] = b; };
    return rec(new Set()); };
  let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; let bad = null;
  for (let t = 0; t < 300 && !bad; t++) { const n = 5 + Math.floor(rnd() * 5), set = new Set(); while (set.size < n) set.add(Math.floor(rnd() * 4) + ',' + Math.floor(rnd() * 3)); const cells = [...set].map(s => s.split(',').map(Number));
    const exp = best(cells), got = A(cells.map(c => [c[0], c[1], 'elk']), 'elk'); if (exp !== got) bad = 'layout ' + JSON.stringify(cells) + ' expected ' + exp + ' got ' + got; }
  if (bad) throw new Error(bad);
});
tab('Salmon A: a run of N salmon scores 2 / 5 / 8 / 12 / 16 / 20 / 25 for N = 1..7; longer runs stay at 25.', 'salmon', [0, 2, 5, 8, 12, 16, 20, 25, 25], n => { const l = []; for (let i = 0; i < n; i++) l.push([i, 0, 'salmon']); return l; });
R('Salmon A: a salmon that touches 3 salmon breaks the run: the whole group scores 0.', () => eq(0, A([[0, 0, 'salmon'], [1, 0, 'salmon'], [-1, 0, 'salmon'], [0, 1, 'salmon']], 'salmon')));
R('Salmon A: separate runs score separately and add up (a run of 3 and a run of 2 = 8 + 5).', () => eq(13, A([[0, 0, 'salmon'], [1, 0, 'salmon'], [2, 0, 'salmon'], [5, 0, 'salmon'], [6, 0, 'salmon']], 'salmon')));
R('Salmon A: two runs lying against each other are one group whose salmon touch more than 2 others: 0.', () => eq(0, A([0, 1, 2].map(i => [i, 0, 'salmon']).concat([0, 1, 2].map(i => [i, 1, 'salmon'])), 'salmon')));
tab('Hawks A: N hawks touching no other hawk score 2 / 5 / 8 / 11 / 14 / 18 / 22 / 26 for N = 1..8; more stay at 26.', 'hawk', [0, 2, 5, 8, 11, 14, 18, 22, 26, 26], n => { const l = []; for (let i = 0; i < n; i++) l.push([i * 2, 0, 'hawk']); return l; });
R('Hawks A: two adjacent hawks score nothing (neither is alone); a third far hawk still scores 2.', () => { eq(0, A([[0, 0, 'hawk'], [1, 0, 'hawk']], 'hawk')); eq(2, A([[0, 0, 'hawk'], [1, 0, 'hawk'], [5, 0, 'hawk']], 'hawk')); });
R('Fox A: each fox scores 1 per DIFFERENT animal on neighbouring tiles; the same animal twice counts once.', () => eq(2, A([[0, 0, 'fox'], [1, 0, 'bear'], [-1, 0, 'bear'], [0, 1, 'elk']], 'fox')));
R('Fox A: other foxes count as a different animal for a fox; empty tiles and tiles without a token count for nothing.', () => eq(3, A([[0, 0, 'fox'], [1, 0, 'fox'], [-1, 0, 'bear'], [0, 1]], 'fox'), 'first fox sees fox+bear = 2, second sees fox = 1'));
R('Fox A: a fox sees at most 5 kinds, and each fox scores separately (5 kinds + a second fox that sees 3).', () => eq(8, A([[0, 0, 'fox'], [1, 0, 'bear'], [-1, 0, 'elk'], [0, 1, 'salmon'], [0, -1, 'hawk'], [1, -1, 'fox']], 'fox')));

// ======================================================================= SCORING: habitat corridors
S('Scoring: habitat corridors');
R('Each habitat scores 1 point per tile of its largest connected group (single tile = 1, none = 0).', () => {
  const e = terrEnv([[0, 0, 'river'], [1, 0, 'river'], [2, 0, 'river']]); eq(3, W.corridor(e, 'river')); eq(0, W.corridor(e, 'peak')); eq(1, W.corridor(terrEnv([[0, 0, 'peak']]), 'peak'));
});
R('Only the largest group counts: a group of 3 and a separate group of 2 score 3.', () => eq(3, W.corridor(terrEnv([[0, 0, 'river'], [1, 0, 'river'], [2, 0, 'river'], [5, 0, 'river'], [6, 0, 'river']]), 'river')));
R('Tiles that do not touch are not connected.', () => eq(1, W.corridor(terrEnv([[0, 0, 'river'], [2, 0, 'river']]), 'river')));
R('Two touching tiles connect only if the two edges facing each other show the same habitat.', () => {
  const e = terrEnv([[0, 0, ['river', 'forest'], 0], [1, 0, 'river'], [-1, 0, 'river']]);   // rot 0: edge E=river, edge W=forest
  eq(2, W.corridor(e, 'river'), 'river reaches the east neighbour only'); eq(1, W.corridor(e, 'forest'));
});
R('Rotating a two-habitat tile changes which neighbours it joins (river/forest tile, one river neighbour to the east: joined at rotations 0, 4, 5 only).', () => {
  eq([2, 1, 1, 1, 2, 2], [0, 1, 2, 3, 4, 5].map(r => W.corridor(terrEnv([[0, 0, ['river', 'forest'], r], [1, 0, 'river']]), 'river')));
});
R('A tile joins a neighbour only through the half that shows the habitat: with river neighbours east and west, a river/forest tile (rot 0) links the east one only.', () => {
  const e = terrEnv([[0, 0, ['river', 'forest'], 0], [1, 0, 'river'], [-1, 0, 'river']]); eq(2, W.corridor(e, 'river'));
});
R('A tile counts once per habitat even if it connects on several edges (a ring of 6 river tiles around a hole = 6).', () => {
  const ring = D6.map(d => [d[0], d[1], 'river']); eq(6, W.corridor(terrEnv(ring), 'river'));
});
R('A two-habitat tile counts in the corridor of BOTH of its habitats.', () => {
  const e = terrEnv([[0, 0, ['river', 'forest'], 0], [1, 0, 'river'], [-1, 0, 'forest']]); eq(2, W.corridor(e, 'river')); eq(2, W.corridor(e, 'forest'));
});
R('Corridors ignore animal tokens: score is the same with or without tokens.', () => {
  const a = terrEnv([[0, 0, 'river'], [1, 0, 'river']]), b = terrEnv([[0, 0, 'river', 0, 'bear'], [1, 0, 'river', 0, 'bear']]); eq(W.corridor(a, 'river'), W.corridor(b, 'river'));
});
R('The full score of one valley = animal cards + 5 largest corridors + acorns.', () => {
  const e = terrEnv([[0, 0, 'river', 0, 'bear'], [1, 0, 'river', 0, 'bear'], [2, 0, 'peak']]); const s = W.score(e, 4, null);
  eq(4, s.ani.bear); eq(2, s.hab.river); eq(1, s.hab.peak); eq(4 + 3 + 4, s.total);
});

// ======================================================================= SCORING: majority bonuses
S('Scoring: habitat majority bonuses');
const hab = (v, t) => v.map(n => ({ hab: Object.assign({ peak: 0, forest: 0, meadow: 0, marsh: 0, river: 0 }, { [t || 'peak']: n }) }));
const bonus = (np, v) => W.bonus({ np: np, solo: np === 1 }, hab(v)).map(b => b.peak);
R('2 players: the larger corridor of a habitat earns 2, the other 0.', () => eq([2, 0], bonus(2, [5, 3])));
R('2 players: a tie for the largest corridor gives 1 to each.', () => eq([1, 1], bonus(2, [4, 4])));
R('2 players: nobody scores a habitat that neither player has.', () => eq([0, 0], bonus(2, [0, 0])));
R('2 players: a player with no tile of the habitat does not share a tie at 0; the other player takes 2.', () => eq([2, 0], bonus(2, [1, 0])));
R('3-4 players: sole largest 3, sole second largest 1, the rest 0.', () => eq([3, 1, 0], bonus(3, [6, 4, 2])));
R('3-4 players: tie for largest between two = 2 each and nothing for second place.', () => eq([2, 2, 0], bonus(3, [5, 5, 3])));
R('3-4 players: three players tied for largest = 1 each, nothing for the rest.', () => eq([1, 1, 1, 0], bonus(4, [5, 5, 5, 3])));
R('4 players: four players tied for largest = 1 each.', () => eq([1, 1, 1, 1], bonus(4, [4, 4, 4, 4])));
R('3-4 players: a tie for second place gives 0 to each tied player (first still gets 3).', () => eq([3, 0, 0], bonus(3, [6, 3, 3])));
R('3-4 players: a player with no corridor of the habitat gets no second-place bonus.', () => eq([3, 0, 0], bonus(3, [6, 0, 0])));
R('Solo: each habitat whose largest corridor has 7 or more tiles earns 2; 6 tiles earn nothing.', () => { eq([2], bonus(1, [7])); eq([0], bonus(1, [6])); eq([2], bonus(1, [12])); });
R('Solo: the bonus is counted per habitat (two habitats of 7+ = 4).', () => { const sc = [{ hab: { peak: 7, forest: 8, meadow: 6, marsh: 0, river: 1 } }]; const b = W.bonus({ np: 1, solo: true }, sc)[0]; eq(4, Object.keys(b).reduce((n, t) => n + b[t], 0)); });
R('Bonuses are added into the final total (W.final) once per habitat.', () => {
  const G = game(2, 9); G.seats[0].env = terrEnv([[0, 0, 'river'], [1, 0, 'river']]); G.seats[1].env = terrEnv([[0, 0, 'river']]); const f = W.final(G); eq(2, f[0].bonus.river); eq(0, f[1].bonus.river); eq(f[0].aniT + f[0].habT + f[0].acorns + f[0].bonusT, f[0].total);
});

// ======================================================================= SCORING: card sets B-D (implemented cards)
S('Scoring: wildlife cards B, C and D (point tables recalled from the printed cards; flagged where unverified)');
const B = (list, a, set) => A(list, a, set);
R('Bears B: each group of exactly 3 bears = 10; groups of 2 or 4 = 0.', () => { eq(10, B([[0, 0, 'bear'], [1, 0, 'bear'], [2, 0, 'bear']], 'bear', 'b')); eq(0, B([[0, 0, 'bear'], [1, 0, 'bear']], 'bear', 'b')); eq(20, B([[0, 0, 'bear'], [1, 0, 'bear'], [2, 0, 'bear'], [6, 0, 'bear'], [7, 0, 'bear'], [8, 0, 'bear']], 'bear', 'b')); });
R('Bears C: groups of 1 / 2 / 3 = 2 / 5 / 8, plus 3 if you have one group of each size; groups of 4 score 0.', () => { eq(2, B([[0, 0, 'bear']], 'bear', 'c')); eq(18, B([[0, 0, 'bear'], [3, 0, 'bear'], [4, 0, 'bear'], [8, 0, 'bear'], [9, 0, 'bear'], [10, 0, 'bear']], 'bear', 'c')); eq(0, B([0, 1, 2, 3].map(i => [i, 0, 'bear']), 'bear', 'c')); }, 'table 2/5/8 +3 recalled');
R('Bears D: groups of 2 / 3 / 4 = 5 / 8 / 13; a single bear scores 0.', () => { eq([5, 8, 13, 0], [2, 3, 4, 1].map(n => B(Array.from({ length: n }, (_, i) => [i, 0, 'bear']), 'bear', 'd'))); }, 'table 5/8/13 recalled');
R('Elk B: single = 2, pair = 5, triangle of 3 = 9, diamond of 4 = 13; a straight line of 3 is only a pair plus a single (7).', () => {
  eq(2, B([[0, 0, 'elk']], 'elk', 'b')); eq(5, B([[0, 0, 'elk'], [1, 0, 'elk']], 'elk', 'b')); eq(9, B([[0, 0, 'elk'], [1, 0, 'elk'], [0, 1, 'elk']], 'elk', 'b'));
  eq(13, B([[0, 0, 'elk'], [1, 0, 'elk'], [0, 1, 'elk'], [1, -1, 'elk']], 'elk', 'b')); eq(7, B([[0, 0, 'elk'], [1, 0, 'elk'], [2, 0, 'elk']], 'elk', 'b'));
}, 'table recalled');
R('Elk C: any connected group of elk scores by size 2, 4, 7, 10, 14, 18, 23, 28 (size 1..8+).', () => eq([2, 4, 7, 10, 14, 18, 23, 28, 28], [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => B(Array.from({ length: n }, (_, i) => [i, 0, 'elk']), 'elk', 'c'))), 'table recalled');
R('Elk D: elk around one space score by number around it: 2, 5, 8, 12, 16, 21 (1..6).', () => eq([2, 5, 8, 12, 16, 21], [1, 2, 3, 4, 5, 6].map(n => B(D6.slice(0, n).map(d => [d[0], d[1], 'elk']), 'elk', 'd'))), 'table recalled');
R('Salmon B: runs of 1..5+ score 2, 4, 9, 11, 17.', () => eq([2, 4, 9, 11, 17, 17], [1, 2, 3, 4, 5, 6].map(n => B(Array.from({ length: n }, (_, i) => [i, 0, 'salmon']), 'salmon', 'b'))), 'table recalled');
R('Salmon C: only runs of 3, 4, 5+ score: 10, 12, 15; runs of 1 or 2 score 0.', () => eq([0, 0, 10, 12, 15, 15], [1, 2, 3, 4, 5, 6].map(n => B(Array.from({ length: n }, (_, i) => [i, 0, 'salmon']), 'salmon', 'c'))), 'table recalled');
R('Salmon D: each run scores 1 per salmon plus 1 per adjacent other-animal token (run of 2 touching a bear and an elk = 4).', () => eq(4, B([[0, 0, 'salmon'], [1, 0, 'salmon'], [0, 1, 'bear'], [1, -1, 'elk']], 'salmon', 'd')));
R('Hawks C: 3 points per straight line of sight between two hawks (counted once per pair).', () => eq(3, B([[0, 0, 'hawk'], [1, 0], [2, 0, 'hawk']], 'hawk', 'c')));
R('Hawks D: a pair of hawks in sight scores by the number of different animals between them: 4, 7, 9, 11; each hawk is in one pair.', () => { eq(4, B([[0, 0, 'hawk'], [1, 0, 'bear'], [2, 0, 'hawk']], 'hawk', 'd')); eq(7, B([[0, 0, 'hawk'], [1, 0, 'bear'], [2, 0, 'elk'], [3, 0, 'hawk']], 'hawk', 'd')); }, 'table recalled');
R('Fox C: each fox scores the number of the most common neighbouring animal (foxes excluded).', () => eq(2, B([[0, 0, 'fox'], [1, 0, 'bear'], [-1, 0, 'bear'], [0, 1, 'elk']], 'fox', 'c')));
R('Fox B: each fox scores 3 / 5 / 7 for 1 / 2 / 3 different PAIRS of the same animal around it (foxes excluded).', () => { eq(3, B([[0, 0, 'fox'], [1, 0, 'bear'], [-1, 0, 'bear']], 'fox', 'b')); eq(5, B([[0, 0, 'fox'], [1, 0, 'bear'], [-1, 0, 'bear'], [0, 1, 'elk'], [0, -1, 'elk']], 'fox', 'b')); }, 'table recalled');

// ======================================================================= run
if (process.argv.includes('--list')) {
  let n = 0, out = [];
  RULES.forEach(r => { if (r.head) out.push('\n## ' + r.sec + '\n'); else out.push('R' + (++n) + '. ' + r.title + (r.note ? ' _(' + r.note + ')_' : '')); });
  console.log(out.join('\n')); process.exit(0);
}
let n = 0, pass = 0; const fails = [];
RULES.forEach(r => { if (r.head) return; n++; try { r.fn(); pass++; } catch (e) { fails.push('R' + n + ' FAIL ' + e.message + '   [' + r.title.slice(0, 70) + ']'); } });
fails.forEach(f => console.log(f));
console.log((fails.length ? 'FAIL' : 'PASS') + ' ' + pass + '/' + n + ' rules');
process.exit(fails.length ? 1 : 0);

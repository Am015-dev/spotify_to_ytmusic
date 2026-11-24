// Onyx Atelier headless rules test: component counts, one check per key rule (RULES-CHECKLIST.md), then N full computer games with invariants after every move.
// node rules-test.js [games]   (QUICK=1: 4 games)
const E = require('./src/engine.js'), A = require('./src/ai.js'), D = require('./src/data.js');
let fails = 0, n = 0; const ok = (c, msg) => { n++; if (!c) { fails++; console.log('FAIL', msg); } };
const C = D.CARDS, cnt = f => C.filter(f).length;
// ---- components (COMPONENTS.md)
ok(C.length === 67 && cnt(c => c.lvl === 1) === 30 && cnt(c => c.lvl === 2) === 24 && cnt(c => c.lvl === 3) === 13, '67 jewels: 30 / 24 / 13');
ok(['w', 'u', 'g', 'r', 'k'].every(b => cnt(c => c.b === b) === 11), '11 jewels of each colour');
ok(cnt(c => c.b === 'x') === 9 && cnt(c => c.b === null) === 3, '9 matching jewels, 3 with no colour');
ok(cnt(c => c.n === 2) === 5, '5 jewels give a double bonus');
ok(cnt(c => c.ab === 'again') === 6 && cnt(c => c.ab === 'token') === 5 && cnt(c => c.ab === 'priv') === 5 && cnt(c => c.ab === 'steal') === 5, 'powers: 6 encore, 5 polish, 5 favour, 5 pinch');
ok(C.reduce((a, c) => a + c.pts, 0) === 92 && C.reduce((a, c) => a + c.cr, 0) === 28, 'all jewels: 92 points, 28 crowns');
ok(!C.some(c => c.b === 'p'), 'no jewel gives a pearl bonus');
ok(D.ROYALS.length === 4 && D.ROYALS.map(r => r.pts + r.ab).sort().join() === '2again,2priv,2steal,3', '4 patrons: 3 pts; 2 pts + encore / favour / pinch');
ok(D.SPIRAL.length === 25 && new Set(D.SPIRAL).size === 25 && D.SPIRAL[0] === 12, 'refill spiral covers 25 spaces from the centre');
{ const G = E.newGame(1, 0);
  ok(G.board.filter(Boolean).length === 25 && G.bag.length === 0, 'setup: all 25 tokens on the board');
  const t = {}; G.board.forEach(x => t[x] = (t[x] || 0) + 1);
  ok(t.w === 4 && t.u === 4 && t.g === 4 && t.r === 4 && t.k === 4 && t.p === 2 && t.o === 3, 'tokens: 4 of each gem, 2 pearls, 3 gold');
  ok(G.pyr[0].length === 5 && G.pyr[1].length === 4 && G.pyr[2].length === 3, 'pyramid 5 / 4 / 3');
  ok(G.decks[0].length === 25 && G.decks[1].length === 20 && G.decks[2].length === 10, 'decks hold the rest');
  ok(G.pl[1].fav === 1 && G.pl[0].fav === 0 && G.fav === 2, 'the second player starts with 1 Favour');
  ok(G.royals.length === 4, '4 patrons on show');
}
// ---- rules
function blank(seed) { const G = E.newGame(seed || 2, 0); G.bag = G.board.filter(Boolean); G.board = G.board.map(() => null); return G; }
function put(G, cells) { Object.keys(cells).forEach(s => { const i = G.bag.indexOf(cells[s]); G.bag.splice(i, 1); G.board[+s] = cells[s]; }); }
{ const G = blank(); put(G, { 0: 'r', 1: 'r', 2: 'r', 6: 'u', 12: 'g', 18: 'o', 3: 'p', 4: 'p' });
  const take = E.validMoves(G).filter(m => m.t === 'take');
  ok(take.some(m => m.cells.join() === '0,1,2'), 'take 3 in a row');
  ok(take.some(m => m.cells.join() === '0,6,12'), 'take 3 on a diagonal');
  ok(!take.some(m => m.cells.includes(18)), 'gold never taken with the take action');
  ok(!take.some(m => m.cells.length === 2 && m.cells.join() === '0,2'), 'no gaps in a line');
  ok(!take.some(m => m.cells.length > 3), 'at most 3 tokens');
  E.performMove(G, { t: 'take', cells: [0, 1, 2] });
  ok(G.pl[1].fav === 2 && G.pl[0].t.r === 3, '3 of one colour: rival gains a Favour');
}
{ const G = blank(); put(G, { 2: 'r', 3: 'p', 4: 'p' }); E.performMove(G, { t: 'take', cells: [2, 3, 4] }); ok(G.pl[1].fav === 2, '2 pearls in a take: rival gains a Favour'); }
{ const G = blank(); put(G, { 2: 'r', 3: 'u', 4: 'p' }); E.performMove(G, { t: 'take', cells: [2, 3, 4] }); ok(G.pl[1].fav === 1, 'mixed take: no Favour'); }
{ const G = blank(); G.fav = 0; G.pl[1].fav = 3; G.pl[0].fav = 0; put(G, { 0: 'r', 1: 'r', 2: 'r' }); E.performMove(G, { t: 'take', cells: [0, 1, 2] }); ok(G.pl[1].fav === 3 && G.fav === 0, 'rival already holds all 3: nothing happens'); }
{ const G = blank(); G.fav = 0; G.pl[0].fav = 2; G.pl[1].fav = 1; put(G, { 0: 'g', 1: 'g', 2: 'g' }); E.performMove(G, { t: 'take', cells: [0, 1, 2] }); ok(G.pl[1].fav === 2 && G.pl[0].fav === 1, 'none in the supply: Favour taken from the player'); }
{ const G = blank(); put(G, { 0: 'r', 5: 'u', 18: 'o' }); G.pl[0].fav = 1; G.fav = 1;
  ok(E.validMoves(G).some(m => m.t === 'fav' && m.cell === 5) && !E.validMoves(G).some(m => m.t === 'fav' && m.cell === 18), 'a Favour takes any one gem, never gold');
  E.performMove(G, { t: 'fav', cell: 5 }); ok(G.pl[0].t.u === 1 && G.fav === 2 && G.turn === 0, 'Favour returns to the supply; still your turn');
  E.performMove(G, { t: 'refill' }); ok(G.board.filter(Boolean).length === 24 && G.bag.length === 0 && G.pl[1].fav === 2, 'refill: bag onto board, rival gains a Favour');
  ok(!E.validMoves(G).some(m => m.t === 'refill'), 'empty bag: no refill');
}
{ const G = blank(); put(G, { 12: 'o' }); const P = G.pl[0];
  ok(E.validMoves(G).filter(m => m.t === 'reserve').length === 12 + 3, 'reserve: any of 12 jewels or a deck top');
  E.performMove(G, { t: 'reserve', gold: 12, l: 2, deck: true }); ok(P.res.length === 1 && P.t.o === 1 && G.decks[2].length === 9, 'reserve blind from the deck, take a gold');
  P.res = [G.decks[0].pop(), G.decks[0].pop(), G.decks[0].pop()]; G.turn = 0; put(G, { 13: 'o' });
  ok(!E.validMoves(G).some(m => m.t === 'reserve'), 'at most 3 kept jewels');
}
{ const G = blank(); put(G, { 0: 'r' }); const P = G.pl[0]; G.pyr[0][0] = 1;   // a Ring: 1 Diamond 1 Sapphire 1 Emerald 1 Onyx
  P.t.w = 1; P.t.u = 1; P.t.g = 1; P.t.o = 1; G.bag.splice(G.bag.indexOf('w'), 1); G.bag.splice(G.bag.indexOf('u'), 1); G.bag.splice(G.bag.indexOf('g'), 1); G.bag.splice(G.bag.indexOf('o'), 1);
  const pr = E.price(P, 1); ok(pr.ok && pr.gold === 1, 'gold pays for a missing colour');
  E.performMove(G, { t: 'buy', l: 0, i: 0 }); ok(P.cards[0] === 1 && E.tokens(P) === 0 && G.bag.length === 24, 'paid tokens go back into the bag');
  ok(E.bonus(P, 'r') === 1 && G.pyr[0][0] !== 1, 'the jewel gives its bonus; the slot refills');
  P.t.u = 2; P.t.g = 1; ok(E.price(P, 4).ok === false, 'bonus lowers cost only of its colour');
}
{ const G = blank(); const P = G.pl[0]; ok(E.price(P, 25).why === 'wild', 'a matching jewel needs a coloured jewel first');
  P.cards.push(5); P.t = { w: 0, u: 2, g: 0, r: 2, k: 1, p: 1, o: 0 }; ['u', 'u', 'r', 'r', 'k', 'p'].forEach(c => G.bag.splice(G.bag.indexOf(c), 1));
  G.pyr[0][0] = 25; G.decks[0] = G.decks[0].filter(x => x !== 25 && x !== 5);
  E.performMove(G, { t: 'buy', l: 0, i: 0 }); ok(G.pend && G.pend.h === 'wild', 'matching jewel asks for a colour');
  E.performMove(G, { t: 'wild', c: 'g' }); ok(E.bonus(P, 'g') === 2 && E.colourPts(P, 'g') === 1, 'it joins that colour (bonus and points)');
}
{ const G = blank(); const P = G.pl[0], O = G.pl[1]; O.t.r = 1; G.bag.splice(G.bag.indexOf('r'), 1); P.cards.push(C.find(c => c.ab === 'steal' && c.lvl === 2).id);
  G.decks.forEach((d, i) => G.decks[i] = d.filter(x => !P.cards.includes(x)));
  put(G, { 0: 'u' }); G.q.push({ h: 'steal', id: P.cards[0] }); E.performMove(G, { t: 'take', cells: [0] });   // the power resolves after the action
  const st = E.validMoves(G); ok(G.pend && G.pend.h === 'steal' && st.length === 1 && st[0].c === 'r', 'Pinch: take a gem from the rival (not gold)');
}
{ const G = E.newGame(9, 0); const P = G.pl[0]; const agains = C.filter(c => c.ab === 'again' && c.b !== 'x').map(c => c.id);
  G.q.push({ h: 'again' }); E.performMove(G, E.validMoves(G).find(m => m.t === 'take')); ok(G.turn === 0, 'Encore: the same player goes again');
}
{ const G = E.newGame(10, 0); const P = G.pl[0]; P.cards = C.filter(c => c.cr >= 1).slice(0, 3).map(c => c.id); G.decks.forEach((d, i) => G.decks[i] = d.filter(x => !P.cards.includes(x))); G.pyr.forEach((r, l) => r.forEach((x, i) => { if (P.cards.includes(x)) r[i] = G.decks[l].pop(); }));
  E.performMove(G, E.validMoves(G).find(m => m.t === 'take'));
  ok(G.pend && G.pend.h === 'royal', '3 crowns: choose a patron');
  E.performMove(G, { t: 'royal', id: 1 }); ok(P.roy[0] === 1 && G.royals.length === 3 && E.points(P) === C.filter(c => P.cards.includes(c.id)).reduce((a, c) => a + c.pts, 0) + 3, 'patron points count');
}
{ const G = blank(); const P = G.pl[0]; put(G, { 0: 'r', 1: 'u', 2: 'g' }); P.t.k = 4; P.t.w = 4; ['k', 'k', 'k', 'k', 'w', 'w', 'w', 'w'].forEach(c => G.bag.splice(G.bag.indexOf(c), 1));
  E.performMove(G, { t: 'take', cells: [0, 1, 2] }); ok(G.pend && G.pend.h === 'disc' && G.pend.n === 1 && G.turn === 0, 'more than 10 tokens: return the extra');
  E.performMove(G, { t: 'disc', c: 'k' }); ok(E.tokens(P) === 10 && G.turn === 1, 'back to 10, then the turn ends');
}
{ const G = blank(); put(G, { 12: 'o' }); G.pl[0].res = [G.decks[0].pop(), G.decks[0].pop(), G.decks[0].pop()];
  const v = E.validMoves(G); ok(v.every(m => m.t === 'refill'), 'no action possible: you must refill'); }
{ const P = { cards: [], roy: [], att: {}, t: {} }; ok(!E.winOf(P), 'no win at 0');
  P.cards = C.filter(c => c.b === 'r' && c.pts).sort((a, b) => b.pts - a.pts).map(c => c.id); ok(E.colourPts(P, 'r') >= 10 && E.winOf(P) === 'colour', '10 points in one colour wins');
  P.cards = C.filter(c => c.cr).map(c => c.id).slice(0, 10); ok(E.crowns(P) >= 10 && E.winOf(P), '10 crowns win');
  P.cards = C.filter(c => c.pts >= 3).map(c => c.id); P.att = {}; ok(E.points(P) >= 20 && E.winOf(P), '20 points win'); }
// ---- full games, invariants after every move
const N = +process.argv[2] || (process.env.QUICK ? 4 : 30), LV = ['easy', 'normal', 'hard'];
let done = 0, how = {}, maxTurns = 0;
for (let g = 0; g < N; g++) {
  const G = E.newGame(500 + g, g % 2); let k = 0;
  try {
    while (!G.over && k++ < 800) { const seq = A.pick(G, LV[(g + G.turn) % 3]); ok(seq.length > 0, 'a move exists'); for (const m of seq) E.performMove(G, m); E.checkInvariants(G); }
    if (G.over) { done++; how[G.over.how] = (how[G.over.how] || 0) + 1; maxTurns = Math.max(maxTurns, G.n); }
  } catch (e) { fails++; console.log('FAIL game', g, e.message); }
}
ok(done === N, 'every game ends');
console.log(`rules-test: ${n - fails}/${n} checks ok; ${done}/${N} games ended`, how, 'longest', maxTurns, 'turns');
process.exit(fails ? 1 : 0);

// W416c: card set A patterns and EVERY table value against games-src/rules-check/wildmark.md, plus the market and solo rules.
// Usage: node rules-a-test.js   (prints PASS/FAIL lines; exit 1 on any failure)
global.window = global; require('./src/data.js'); require('./src/engine.js'); require('./src/ai.js');
const W = window.WM; let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('FAIL', m); } };
const env = list => { const e = {}; list.forEach(([q, r, tok]) => e[W.k(q, r)] = { id: 0, t: ['forest'], a: W.ANI.slice(), key: false, rot: 0, tok: tok || null }); return e; };
const S = (list, a) => W.scoreAnimal(env(list), a, null, 'a');
// tables printed in the rules check
const T = { bear: [0, 4, 11, 19, 27], elk: [0, 2, 5, 9, 13], salmon: [0, 2, 5, 8, 12, 16, 20, 25], hawk: [0, 2, 5, 8, 11, 14, 18, 22, 26] };
for (const a in T) ok(JSON.stringify(W.CARDS[a].pts) === JSON.stringify(T[a]), a + ' table = ' + T[a].join('/'));
// bear: n separate pairs (spaced 3 apart on one row) score the table; 5 pairs cap at 27; a trio and a single score 0
for (let p = 1; p <= 5; p++) { const l = []; for (let i = 0; i < p; i++) l.push([i * 3, 0, 'bear'], [i * 3 + 1, 0, 'bear']); ok(S(l, 'bear') === T.bear[Math.min(p, 4)], 'bear ' + p + ' pairs = ' + T.bear[Math.min(p, 4)]); }
ok(S([[0, 0, 'bear']], 'bear') === 0, 'bear single 0'); ok(S([[0, 0, 'bear'], [1, 0, 'bear'], [2, 0, 'bear']], 'bear') === 0, 'bear trio 0');
// elk: a straight line of 1..4 scores the table; 5 in a row = 4 + 1 (13 + 2); each elk counts once
for (let k = 1; k <= 4; k++) { const l = []; for (let i = 0; i < k; i++) l.push([i, 0, 'elk']); ok(S(l, 'elk') === T.elk[k], 'elk line ' + k + ' = ' + T.elk[k]); }
ok(S([0, 1, 2, 3, 4].map(i => [i, 0, 'elk']), 'elk') === 15, 'elk line 5 = 13 + 2');
ok(S([[0, 0, 'elk'], [0, 1, 'elk'], [0, 2, 'elk']], 'elk') === 9, 'elk line on another axis = 9');
// salmon: a run of 1..7+ scores the table (each salmon touching at most 2 others); a fork kills the run
for (let k = 1; k <= 8; k++) { const l = []; for (let i = 0; i < k; i++) l.push([i, 0, 'salmon']); ok(S(l, 'salmon') === T.salmon[Math.min(k, 7)], 'salmon run ' + k + ' = ' + T.salmon[Math.min(k, 7)]); }
ok(S([[0, 0, 'salmon'], [1, 0, 'salmon'], [-1, 0, 'salmon'], [0, 1, 'salmon']], 'salmon') === 0, 'salmon fork 0');
ok(S([[0, 0, 'salmon'], [1, 0, 'salmon'], [5, 0, 'salmon']], 'salmon') === 7, 'two runs add (5 + 2)');
// hawk: 1..8+ lone hawks score the table; touching hawks score nothing
for (let k = 1; k <= 9; k++) { const l = []; for (let i = 0; i < k; i++) l.push([i * 2, 0, 'hawk']); ok(S(l, 'hawk') === T.hawk[Math.min(k, 8)], k + ' lone hawks = ' + T.hawk[Math.min(k, 8)]); }
ok(S([[0, 0, 'hawk'], [1, 0, 'hawk']], 'hawk') === 0, 'touching hawks 0');
// fox: 1 point per DIFFERENT animal next to it (foxes count as a kind); repeats do not add
ok(S([[0, 0, 'fox'], [1, 0, 'bear'], [-1, 0, 'bear']], 'fox') === 1, 'fox: two bears = 1');
ok(S([[0, 0, 'fox'], [1, 0, 'bear'], [-1, 0, 'elk'], [0, 1, 'salmon'], [0, -1, 'hawk'], [1, -1, 'fox']], 'fox') >= 5, 'fox: five kinds = 5');
ok(S([[0, 0, 'fox']], 'fox') === 0, 'lonely fox 0');
// market: pairs stay as dealt after a take and after a free pick; nothing slides (2 players)
let G = W.newGame({ np: 2, seed: 4 }); const before = G.market.tiles.map(t => t.id), btok = G.market.toks.slice();
W.apply(G, { t: 'take', i: 1 }); W.apply(G, W.moves(G)[0]); W.apply(G, W.moves(G).find(m => m.t === 'back'));
ok([0, 2, 3].every(i => G.market.tiles[i].id === before[i] && G.market.toks[i] === btok[i]), 'market: untaken pairs keep their slots');
ok(G.market.tiles[1] && G.market.tiles[1].id !== before[1], 'market: the taken slot is refilled in place');
// solo: the rightmost remaining pair leaves, the rest slide LEFT toward the stacks, refill at the right
G = W.newGame({ np: 1, seed: 9 }); const t0 = G.market.tiles.map(t => t.id);
W.apply(G, { t: 'take', i: 0 }); W.apply(G, W.moves(G)[0]); W.apply(G, W.moves(G).find(m => m.t === 'back'));
ok(G.market.tiles[0].id === t0[1] && G.market.tiles[1].id === t0[2], 'solo: survivors slide toward the stacks (left)');
ok(t0.indexOf(G.market.tiles[2].id) < 0 && t0.indexOf(G.market.tiles[3].id) < 0, 'solo: rightmost removed, refills enter at the right');
// acorn supply 25
G = W.newGame({ np: 2, seed: 1 }); ok(G.acornPool === 25, 'acorn supply starts at 25');
// default game is card set A
ok(!W.newGame({ np: 2, seed: 2 }).cards, 'default game uses card set A');
console.log((fail ? 'FAIL' : 'PASS') + ' rules-a-test ' + (n - fail) + '/' + n);
process.exit(fail ? 1 : 0);

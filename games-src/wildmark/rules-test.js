// Headless rules test: scoring cases, then N computer games at every player count (no illegal or stuck state, invariants after every move).
// Usage: node rules-test.js [games=200]
global.window = global; require('./src/data.js'); require('./src/engine.js'); require('./src/ai.js');
const W = window.WM; let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
function env(list) { const e = {}; list.forEach(([q, r, tok, t, rot]) => e[W.k(q, r)] = { id: 0, t: t || ['forest'], a: W.ANI.slice(), key: false, rot: rot || 0, tok: tok || null }); return e; }
// bears: one pair = 4, a group of three = 0
ok(W.scoreAnimal(env([[0, 0, 'bear'], [1, 0, 'bear']]), 'bear') === 4, 'bear pair 4');
ok(W.scoreAnimal(env([[0, 0, 'bear'], [1, 0, 'bear'], [2, 0, 'bear']]), 'bear') === 0, 'bear triple 0');
ok(W.scoreAnimal(env([[0, 0, 'bear'], [1, 0, 'bear'], [4, 0, 'bear'], [5, 0, 'bear']]), 'bear') === 11, 'two pairs 11');
// hawks: isolated only
ok(W.scoreAnimal(env([[0, 0, 'hawk'], [2, 0, 'hawk'], [3, 0, 'hawk']]), 'hawk') === 2, 'one lone hawk 2');
// elk line of 3 = 9; L shape 3 = line2(5)+1(2)
ok(W.scoreAnimal(env([[0, 0, 'elk'], [1, 0, 'elk'], [2, 0, 'elk']]), 'elk') === 9, 'elk line 3');
ok(W.scoreAnimal(env([[0, 0, 'elk'], [1, 0, 'elk'], [1, -1, 'elk']]), 'elk') === 7, 'elk bent 7');
// salmon run of 3 = 8; a salmon with 3 salmon neighbours breaks the run
ok(W.scoreAnimal(env([[0, 0, 'salmon'], [1, 0, 'salmon'], [2, 0, 'salmon']]), 'salmon') === 8, 'salmon run 3');
ok(W.scoreAnimal(env([[0, 0, 'salmon'], [1, 0, 'salmon'], [-1, 0, 'salmon'], [0, 1, 'salmon']]), 'salmon') === 0, 'salmon blob 0');
// fox: distinct neighbours
ok(W.scoreAnimal(env([[0, 0, 'fox'], [1, 0, 'bear'], [-1, 0, 'bear'], [0, 1, 'hawk'], [0, -1, 'fox']]), 'fox') === 5, 'fox 3 + other fox 2');
// corridors: split tile edges
const e2 = { '0,0': { t: ['river', 'forest'], a: [], rot: 0 }, '1,0': { t: ['river'], a: [], rot: 0 }, '-1,0': { t: ['river'], a: [], rot: 0 } };
// rot 0: edges 0,1,2 (E,NE,NW) river, 3,4,5 forest. So E neighbour joins, W neighbour (edge 3 forest) does not.
ok(W.corridor(e2, 'river') === 2, 'corridor through split edge = 2 (got ' + W.corridor(e2, 'river') + ')');
// majority bonus 3p
const Gm = { np: 3, solo: false }; const sc = [{ hab: { peak: 5, forest: 4, meadow: 3, marsh: 0, river: 2 } }, { hab: { peak: 5, forest: 2, meadow: 3, marsh: 0, river: 1 } }, { hab: { peak: 1, forest: 3, meadow: 3, marsh: 1, river: 0 } }];
const b = W.bonus(Gm, sc); ok(b[0].peak === 2 && b[1].peak === 2 && b[2].peak === 0, 'tie first 2/2'); ok(b[0].forest === 3 && b[2].forest === 1, 'first 3 second 1'); ok(b[0].meadow === 1 && b[2].meadow === 1, '3-way tie 1 each'); ok(b[2].marsh === 3, 'marsh 3');
// overpopulation: 4 same is wiped, 3 same offers wipe3
let G = W.newGame({ np: 2, seed: 1 }); G.market.toks = ['elk', 'elk', 'elk', 'fox']; ok(W.moves(G).some(m => m.t === 'wipe3'), 'wipe3 offered');
W.apply(G, { t: 'wipe3' }); ok(!W.moves(G).some(m => m.t === 'wipe3') || W.triple(G) === null || G.used3, 'wipe3 once');
// keystone gives an acorn
G = W.newGame({ np: 1, seed: 2 }); G.market.tiles[0] = { id: 999, t: ['forest'], a: ['bear'], key: true }; G.bag[G.market.toks[0]]++; G.bag.bear--; G.market.toks[0] = 'bear';
W.apply(G, { t: 'take', i: 0 }); const sp = W.spots(G.seats[0].env)[0]; W.apply(G, { t: 'place', c: sp, rot: 0 }); W.apply(G, { t: 'tok', c: sp }); ok(G.seats[0].acorns === 1, 'keystone acorn');
ok(W.check(G).length === 0, 'invariants after keystone: ' + W.check(G));
// games
const N = +(process.argv[2] || 200), t0 = Date.now(), tot = {}, wins = {};
for (let g = 0; g < N; g++) {
  const np = 1 + (g % 4), lv = ['easy', 'normal', 'hard'][g % 3];
  const ai = []; for (let i = 0; i < np; i++) ai.push(i === 0 ? lv : ['easy', 'normal', 'hard'][(g + i) % 3]);
  const G = W.newGame({ np, seed: 1000 + g, ai }); let steps = 0;
  while (!G.over && steps < 2000) {
    const mv = W.moves(G); if (!mv.length) { fail++; console.log('FAIL stuck', g, G.stage); break; }
    let m = W.AI.choose(G); if (g % 7 === 0 && Math.random() < 0.2) m = mv[Math.floor(Math.random() * mv.length)];
    try { W.apply(G, m); } catch (e) { fail++; console.log('FAIL illegal', g, JSON.stringify(m), e.message); break; }
    const bad = W.check(G); if (bad.length) { fail++; console.log('FAIL inv', g, bad.join(';')); break; }
    steps++;
  }
  if (!G.over) { fail++; console.log('FAIL not over', g); continue; }
  G.seats.forEach(s => ok(s.done === 20 && Object.keys(s.env).length === 23, 'every seat 20 turns, 23 tiles'));
  const key = np + 'p-' + ai[0]; (tot[key] = tot[key] || []).push(G.res[0].total);
  if (np > 1) G.seats.forEach((s, i) => { const k2 = s.ai; wins[k2] = wins[k2] || [0, 0]; wins[k2][1]++; if (G.winner === i) wins[k2][0]++; });
}
Object.keys(tot).sort().forEach(k => { const a = tot[k]; console.log('avg seat0', k, (a.reduce((x, y) => x + y, 0) / a.length).toFixed(1), 'n=' + a.length); });
Object.keys(wins).forEach(k => console.log('win rate', k, (100 * wins[k][0] / wins[k][1]).toFixed(0) + '%'));
console.log(fail ? 'FAIL ' + fail : 'PASS', N, 'games', ((Date.now() - t0) / 1000).toFixed(1) + 's');
process.exit(fail ? 1 : 0);

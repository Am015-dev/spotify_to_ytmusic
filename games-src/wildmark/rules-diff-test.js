// One check per row of proof/RULES-DIFF.md (engine only). Usage: node rules-diff-test.js
global.window = global; require('./src/data.js'); require('./src/engine.js'); require('./src/ai.js');
const W = window.WM; let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('FAIL', m); } };
const total = g => g.supply.length + g.market.tiles.filter(Boolean).length;
// R2 supply: players x 20 + 3 (solo 43)
[[1, 43], [2, 43], [3, 63], [4, 83]].forEach(([np, t]) => ok(total(W.newGame({ np, seed: 3 })) === t, 'supply ' + np + 'p = ' + t));
// R3 four face-up pairs; R1 100 animals
let g = W.newGame({ np: 2, seed: 5 }); ok(g.market.tiles.length === 4 && g.market.toks.filter(Boolean).length === 4, '4 pairs');
ok(Object.values(g.bag).reduce((a, b) => a + b, 0) + 4 === 100, '100 animal tokens');
// R6 three alike: optional sweep, once per turn
g.market.toks = ['elk', 'elk', 'elk', 'fox']; g.bag.elk -= 2; g.bag.fox += 0; ok(W.moves(g).some(m => m.t === 'wipe3'), 'three alike can be swept');
W.apply(g, { t: 'wipe3' }); ok(g.used3 && !W.moves(g).some(m => m.t === 'wipe3'), 'only once per turn');
// R7 acorn spends: free pick and replace any; no per-turn limit
g = W.newGame({ np: 2, seed: 7 }); g.seats[0].acorns = 2; W.apply(g, { t: 'wipe', idx: [0, 2] }); ok(g.seats[0].acorns === 1 && W.moves(g).some(m => m.t === 'free'), 'acorn replace, then another spend allowed');
W.apply(g, { t: 'free', ti: 0, ki: 3 }); ok(g.seats[0].acorns === 0 && g.hold.ti === 0 && g.hold.ki === 3, 'free pick any tile + any animal');
// R9/R10 tile must touch, any rotation; R11 token only on an empty tile showing it, or back to the bag
const c = W.spots(g.seats[0].env)[0]; ok(!W.moves(g).some(m => m.t === 'place' && !W.spots(g.seats[0].env).includes(m.c)), 'tiles only touch the valley');
W.apply(g, { t: 'place', c, rot: 3 }); const tm = W.moves(g); ok(tm.some(m => m.t === 'back') && tm.filter(m => m.t === 'tok').every(m => { const x = g.seats[0].env[m.c]; return !x.tok && x.a.includes(g.hold.tok); }), 'token rules');
// R12 keystone gives an acorn
g = W.newGame({ np: 2, seed: 9 }); W.apply(g, { t: 'take', i: 0 }); g.hold.tile = { id: 999, t: ['forest'], a: ['bear'], key: true }; g.hold.tok = 'bear';
W.apply(g, { t: 'place', c: W.spots(g.seats[0].env)[0], rot: 0 }); W.apply(g, { t: 'tok', c: g.hold.at }); ok(g.seats[1 - 1].acorns === 1, 'keystone acorn');
// R15-R17 majority bonuses
const sc = v => v.map(h => ({ hab: { forest: h, meadow: 0, peak: 0, marsh: 0, river: 0 } })), bf = (np, v) => W.bonus({ np, solo: np === 1 }, sc(v)).map(b => b.forest);
ok(JSON.stringify(bf(2, [5, 3])) === '[2,0]' && JSON.stringify(bf(2, [4, 4])) === '[1,1]', '2p majority');
ok(JSON.stringify(bf(3, [5, 3, 2])) === '[3,1,0]' && JSON.stringify(bf(3, [5, 5, 2])) === '[2,2,0]' && JSON.stringify(bf(3, [5, 5, 5])) === '[1,1,1]' && JSON.stringify(bf(4, [6, 3, 3, 1])) === '[3,0,0,0]', '3-4p majority and ties');
ok(JSON.stringify(bf(1, [7])) === '[2]' && JSON.stringify(bf(1, [6])) === '[0]', 'solo +2 for 7+');
// R13 20 turns each, then the game ends; R18 acorns 1 point; R19 tie-break most acorns
g = W.newGame({ np: 2, seed: 11, ai: ['normal', 'normal'] }); let s = 0; while (!g.over && s++ < 2000) { const m = W.AI.choose(g, "normal"); W.apply(g, m); }
ok(g.over && g.seats.every(x => x.done === 20), '20 turns each');
ok(W.score({}, 3).total === 3, 'acorns 1 point each');
console.log(fail ? 'FAIL ' + fail + '/' + n : 'PASS ' + n + '/' + n); process.exit(fail ? 1 : 0);

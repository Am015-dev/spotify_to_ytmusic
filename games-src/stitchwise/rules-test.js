// Headless rules + AI test: node rules-test.js [games] [--gate]
const fs = require('fs'), path = require('path');
const src = ['data.js', 'engine.js', 'ai.js'].map(f => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8')).join('\n');
const L = new Function(src + '\nreturn {SW,PATCHES,swNew,swApply,swMoves,swCheck,swScore,swWinner,swOffer,swClone,swWho,aiMove,swEmpty,swFits,swPlacements,swRng};')();
const { SW, PATCHES } = L; let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m); } };
// data
ok(PATCHES.length === 33, '33 patches'); const seen = new Set(); PATCHES.forEach(p => { const k = JSON.stringify(p.or[0]) ; });
const canon = p => p.or.map(o => JSON.stringify(o)).sort()[0]; const cs = new Set(PATCHES.map(p => canon(p) + p.cost + '/' + p.time + '/' + p.inc)); ok(cs.size === 33, 'patches distinct (shape,cost,time,income) ' + cs.size); ok(PATCHES.reduce((a, p) => a + p.n, 0) === 166, 'total squares 166');
PATCHES.forEach(p => { ok(p.n >= 2 && p.cost >= 0 && p.cost <= 10 && p.time >= 1 && p.inc >= 0 && p.inc <= 3, 'patch ' + p.id);
  // connected
  const set = new Set(p.cells.map(c => c.join())), st = [p.cells[0]], vis = new Set([p.cells[0].join()]); while (st.length) { const c = st.pop(); [[1,0],[-1,0],[0,1],[0,-1]].forEach(d => { const k = [c[0]+d[0], c[1]+d[1]]; if (set.has(k.join()) && !vis.has(k.join())) { vis.add(k.join()); st.push(k); } }); } ok(vis.size === p.n, 'connected ' + p.id); });
// rules: advance, income, tie order
let G = L.swNew({ seed: 1 }); ok(L.swWho(G) === 0, 'p0 starts'); ok(G.btn[0] === 5, 'start buttons');
let r = L.swApply(G, { t: 'adv' }); ok(G.pos[0] === 1 && G.btn[0] === 6, 'advance moves 1 gets 1'); ok(L.swWho(G) === 1, 'behind goes next');
L.swApply(G, { t: 'adv' }); ok(G.pos[1] === 2 || G.pos[1] === 1, 'p1 adv'); 
// income when passing a button space
G = L.swNew({ seed: 2 }); G.inc[0] = 2; G.pos = [4, 9]; G.stamp = [5, 6]; const b0 = G.btn[0]; L.swApply(G, { t: 'adv' }); ok(G.pos[0] === 10 && G.btn[0] === b0 + 6 + 2, 'passing spot 5 pays income 2, +6 for 6 steps: ' + (G.btn[0] - b0));
// tie goes to the one on top
G = L.swNew({ seed: 3 }); G.pos = [3, 3]; G.stamp = [9, 4]; G.cur = 0; ok(L.swWho(G) === 0, 'tie');
G.pos = [5, 3]; G.stamp = [9, 4]; G.cur = 1; L.swApply(G, { t: 'adv' }); ok(G.pos[1] === 6 && G.btn[1] === 5 + 3, 'adv to one ahead of opponent'); ok(L.swWho(G) === 0, 'p0 behind now');
// leather
G = L.swNew({ seed: 4 }); G.pos = [18, 21]; G.stamp = [3, 4]; G.cur = 0; L.swApply(G, { t: 'adv' }); ok(G.pend && G.pend.seat === 0 && G.leather[0] === 0, 'leather opens'); ok(L.swMoves(G).every(m => m.t === 'leather'), 'only leather moves');
L.swApply(G, { t: 'leather', x: 4, y: 4 }); ok(G.board[0][40] === 100 && !G.pend, 'leather placed'); ok(!L.swCheck(G), 'inv after leather');
// buy
G = L.swNew({ seed: 5 }); G.btn[0] = 30; const off = L.swOffer(G); ok(off.length === 3, '3 offered'); const k = 1, pid = off[k], p = PATCHES[pid]; const ring0 = G.ring.length;
r = L.swApply(G, { t: 'buy', k, o: 0, x: 0, y: 0 }); const inc5 = p.time >= 5 ? p.inc : 0; ok(r.ok && G.btn[0] === 30 - p.cost + inc5 && G.pos[0] === p.time && G.ring.length === ring0 - 1, 'buy pays, time, ring'); ok(G.inc[0] === p.inc, 'income recorded');
ok(!L.swApply(G, { t: 'buy', k: 0, o: 0, x: 0, y: 0 }).ok || L.swWho(G) === 1, 'turn passes');
// overlap & off-board refused
G = L.swNew({ seed: 6 }); G.btn[0] = 99; L.swApply(G, { t: 'buy', k: 0, o: 0, x: 0, y: 0 }); G.cur = 0; G.pos = [0, 9]; G.stamp = [1, 2]; ok(!L.swApply(G, { t: 'buy', k: 0, o: 0, x: 0, y: 0 }).ok, 'overlap refused'); ok(!L.swApply(G, { t: 'buy', k: 0, o: 0, x: 8, y: 8 }).ok, 'off board refused');
// bonus 7x7
G = L.swNew({ seed: 7 }); for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) G.board[0][y * 9 + x] = 100; G.board[0][0] = -1; G.pend = null; G.btn[0] = 50;
G.ring = [0, 1, 2, 3, 4]; G.start = 0; G.owned = [[], []]; // domino at index 0: place over (0,0)?? needs 2 cells; use leather route
G.pend = { seat: 0 }; G.pendQ = 0; L.swApply(G, { t: 'leather', x: 0, y: 0 }); ok(G.bonus === 0, '7x7 gives the bonus');
// score
G = L.swNew({ seed: 8 }); G.bonus = 1; G.btn = [20, 10]; ok(L.swScore(G, 0).total === 20 - 162 && L.swScore(G, 1).total === 10 + 7 - 162, 'score');
// full AI games
const levels = ['simple', 'easy', 'normal', 'hard'];
function play(seed, l0, l1, first) { const G = L.swNew({ seed, first }); const rnd = L.swRng(seed * 7 + 1); let n = 0; while (!G.over && n++ < 400) { const s = L.swWho(G); const m = L.aiMove(G, s === 0 ? l0 : l1, rnd); const res = L.swApply(G, m); if (!res.ok) throw new Error('illegal ' + JSON.stringify(m) + res.why + ' seed ' + seed); const e = L.swCheck(G); if (e) throw new Error('invariant ' + e + ' seed ' + seed); } if (!G.over) throw new Error('stuck seed ' + seed); return G; }
const N = +(process.argv[2] && /^\d+$/.test(process.argv[2]) ? process.argv[2] : 40); let lens = 0, g = 0;
function match(a, b, n) { let w = 0, sa = 0, sb = 0; for (let i = 0; i < n; i++) { const first = i % 2; const G = play(1000 + i, a, b, first); const win = L.swWinner(G); if (win === 0) w++; sa += L.swScore(G, 0).total; sb += L.swScore(G, 1).total; lens += G.turns; g++; } return { win: w / n, avgA: sa / n, avgB: sb / n }; }
const out = {};
out['hard v simple'] = match('hard', 'simple', N); out['normal v simple'] = match('normal', 'simple', N); out['easy v simple'] = match('easy', 'simple', N); out['hard v normal'] = match('hard', 'normal', N); out['normal v easy'] = match('normal', 'easy', N);
for (const k in out) console.log(k, 'win ' + (out[k].win * 100).toFixed(0) + '%', 'avg score', out[k].avgA.toFixed(1), 'v', out[k].avgB.toFixed(1));
console.log('games', g, 'avg moves', (lens / g).toFixed(1));
if (out['hard v simple'].win < .7) { fail++; console.log('FAIL gate hard v simple'); } if (out['normal v simple'].win < .55) { fail++; console.log('FAIL gate normal v simple'); }
console.log(fail ? 'FAIL ' + fail : 'PASS rules-test'); process.exit(fail ? 1 : 0);

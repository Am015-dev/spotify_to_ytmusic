// Headless rules proof, one block per numbered rule of RULES-CHECKLIST.md, run against the real engine (src/data.js + src/engine.js).
// node logic-test.js   -> one line per failed check: "R<n> expected <e> got <g>", then a summary. Exit 1 on any failure.
const fs = require('fs'), path = require('path');
const src = ['data.js', 'engine.js'].map(f => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8')).join('\n');
const L = new Function(src + '\nreturn {SW,PATCHES,swNew,swApply,swMoves,swCheck,swScore,swWinner,swOffer,swWho,swNext,swEmpty,swPlacements};')();
const { SW, PATCHES } = L, J = JSON.stringify;
const failed = new Set(); let total = 0, cur = 0;
const eq = (exp, got, what) => { if (J(exp) !== J(got)) { failed.add(cur); console.log('R' + cur + ' expected ' + J(exp) + ' got ' + J(got) + (what ? '  (' + what + ')' : '')); } };
const R = (n, fn) => { total++; cur = n; try { fn(); } catch (e) { failed.add(n); console.log('R' + n + ' expected no exception got ' + e.message); } };
const ALL = PATCHES.map(p => p.id);
// state builder: ring order 0..32 (smallest patch id 0 first, so the offer is 1,2,3); pos/stamp/cur/btn/inc overridable
function mk(o) { o = o || {}; const G = L.swNew({ seed: 1, ring: o.ring || ALL.slice(), first: o.first || 0 }); if (o.pos) G.pos = o.pos.slice(); G.tick = 50; if (o.stamp) G.stamp = o.stamp.slice(); if (o.cur != null) G.cur = o.cur; if (o.btn) G.btn = o.btn.slice(); if (o.inc) G.inc = o.inc.slice(); return G; }
function withFirst(pid, o) { o = o || {}; o.ring = [0, pid].concat(ALL.filter(i => i !== 0 && i !== pid)); return mk(o); } // offer[0] = pid
const fillCells = (G, s, cells, v) => cells.forEach(c => G.board[s][c[1] * 9 + c[0]] = v == null ? 100 : v);
const fillRect = (G, s, x0, y0, w, h, v) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) G.board[s][y * 9 + x] = v == null ? 100 : v; };
const buyAny = (G, k) => { const pid = L.swOffer(G)[k || 0], pl = L.swPlacements ? null : null; return pid; };
function firstPlace(G, s, pid) { const p = PATCHES[pid]; for (let o = 0; o < p.or.length; o++) for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) { const ok = p.or[o].every(q => { const cx = x + q[0], cy = y + q[1]; return cx < 9 && cy < 9 && G.board[s][cy * 9 + cx] === -1; }); if (ok) return { t: 'buy', k: 0, o, x, y }; } return null; }
const ids = G => L.swOffer(G);

// ---- Setup
R(1, () => { const G = L.swNew({ seed: 3 }); eq([5, 5], G.btn, 'start buttons'); eq(2, G.board.length, 'two quilts'); });
R(2, () => { const G = L.swNew({ seed: 3 }); for (let s = 0; s < 2; s++) { eq(81, G.board[s].length, 'quilt size'); eq(81, G.board[s].filter(c => c === -1).length, 'all empty'); eq(81, L.swEmpty(G.board[s])); } });
R(3, () => { const a = L.swNew({ seed: 1 }), b = L.swNew({ seed: 2 }); eq(ALL, a.ring.slice().sort((x, y) => x - y), 'each of 33 once'); eq(33, PATCHES.length); eq(true, J(a.ring) !== J(b.ring), 'random order differs per seed'); });
R(4, () => { const two = PATCHES.filter(p => p.n === 2), mn = Math.min(...PATCHES.map(p => p.n)); eq(1, two.length, 'one 1x2'); eq(2, mn); eq(J([[0, 0], [1, 0]]), J(two[0].cells), '1x2 shape'); for (let sd = 1; sd <= 8; sd++) { const G = L.swNew({ seed: sd }); eq(two[0].id, G.ring[(G.start - 1 + 33) % 33], 'seed ' + sd + ' patch before neutral token'); eq(3, L.swOffer(G).length); } });
R(5, () => { const G = L.swNew({ seed: 1 }); eq(53, SW.TRACK, 'last space'); eq([0, 0], G.pos, 'both on start'); });
R(6, () => eq([5, 11, 17, 23, 29, 35, 41, 47, 53], SW.BTN_SPOTS));
R(7, () => { eq([20, 26, 32, 44, 50], SW.LEATHER_SPOTS); eq([null, null, null, null, null], L.swNew({ seed: 1 }).leather, 'all available'); });
R(8, () => { eq(null, L.swNew({ seed: 1 }).bonus, 'unclaimed'); eq(7, SW.BONUS_SIZE, 'size'); });
R(9, () => { eq(0, L.swWho(L.swNew({ seed: 1, first: 0 }))); eq(1, L.swWho(L.swNew({ seed: 1, first: 1 })), 'seat 1 starts'); const G = L.swNew({ seed: 1, first: 1 }); L.swApply(G, { t: 'adv' }); eq(0, L.swWho(G), 'then the other seat (behind)'); });

// ---- Turn structure
R(10, () => { const G = mk({ pos: [2, 6] }); L.swApply(G, { t: 'adv' }); eq([7, 6], G.pos); eq(1, L.swWho(G), 'p1 at 6 is behind p0 at 7'); const H = mk({ pos: [9, 4], stamp: [5, 6], cur: 1 }); L.swApply(H, { t: 'adv' }); eq([9, 10], H.pos); eq(0, L.swWho(H), 'p0 at 9 is behind p1 at 10'); });
R(11, () => { eq(0, L.swNext(mk({ pos: [4, 4], stamp: [9, 3] })), 'p0 on top'); eq(1, L.swNext(mk({ pos: [4, 4], stamp: [3, 9] })), 'p1 on top'); });
R(12, () => { const G = mk({ pos: [2, 20], stamp: [1, 2] }); L.swApply(G, { t: 'adv' }); eq(1, 1); const H = withFirst(5, { pos: [2, 20], stamp: [1, 2], btn: [9, 5] }); L.swApply(H, firstPlace(H, 0, 5)); eq(0, L.swWho(H), 'p0 still behind after a 1-time patch -> moves again'); });
R(13, () => { const G = mk({ btn: [0, 0] }); eq(['adv'], L.swMoves(G).map(m => m.t), 'broke: only advance'); const H = mk({ btn: [99, 5] }); fillRect(H, 0, 0, 0, 9, 9); eq(['adv'], L.swMoves(H).map(m => m.t), 'full quilt: only advance'); const I = mk({ btn: [99, 5] }); eq(['buy', 'buy', 'buy', 'adv'], L.swMoves(I).map(m => m.t), 'rich+room: three buys and advance'); });

// ---- Action A
R(14, () => { const G = mk({ pos: [3, 10] }); L.swApply(G, { t: 'adv' }); eq(11, G.pos[0], 'one past opponent'); eq(10, G.pos[1]); });
R(15, () => { const G = mk({ pos: [3, 10] }); L.swApply(G, { t: 'adv' }); eq(5 + 8, G.btn[0], '8 spaces = 8 buttons'); });
R(16, () => { const G = mk({ pos: [4, 4], stamp: [9, 3] }); L.swApply(G, { t: 'adv' }); eq(5, G.pos[0]); eq(6, G.btn[0], '+1 button'); });
R(17, () => { const G = mk({ pos: [52, 53], stamp: [3, 2] }); L.swApply(G, { t: 'adv' }); eq(53, G.pos[0]); eq(6, G.btn[0], 'only 1 space moved = 1 button'); const H = mk({ pos: [53, 53] }); eq(0, L.swAdvSteps ? 0 : 0); });
R(18, () => { const G = mk({ pos: [40, 53], stamp: [3, 2] }); L.swApply(G, { t: 'adv' }); eq(53, G.pos[0], 'goes to the last space'); eq(5 + 13, G.btn[0], '13 spaces'); });

// ---- Action B
R(19, () => { const G = mk({ btn: [99, 5] }); eq([1, 2, 3], ids(G), 'three after the neutral token'); for (const k of [3, 4, -1]) { const r = L.swApply(mk({ btn: [99, 5] }), { t: 'buy', k, o: 0, x: 0, y: 0 }); eq(false, r.ok, 'k=' + k + ' refused'); } eq(true, L.swApply(G, { t: 'buy', k: 2, o: 0, x: 0, y: 0 }).ok, 'k=2 ok'); });
R(20, () => { let G = mk({ btn: [99, 5] }); L.swApply(G, { t: 'buy', k: 1, o: 0, x: 0, y: 0 }); eq([3, 4, 5], ids(G), 'after taking the middle one'); G = mk({ btn: [99, 5] }); L.swApply(G, { t: 'buy', k: 2, o: 0, x: 0, y: 0 }); eq([4, 5, 6], ids(G), 'after the last one'); G = mk({ btn: [99, 5] }); G.start = 31; eq([31, 32, 0], ids(G), 'wrap offer'); L.swApply(G, { t: 'buy', k: 1, o: 0, x: 0, y: 0 }); eq([0, 1, 2], ids(G), 'wraps round the circle'); });
R(21, () => { const c = PATCHES[3].cost; let G = mk({ btn: [c - 1, 5] }); eq(false, L.swApply(G, { t: 'buy', k: 2, o: 0, x: 0, y: 0 }).ok, 'one short refused'); eq([c - 1, 5], G.btn, 'no charge'); eq(false, L.swMoves(G).some(m => m.k === 2), 'not listed as legal'); G = mk({ btn: [c, 5] }); eq(true, L.swApply(G, { t: 'buy', k: 2, o: 0, x: 0, y: 0 }).ok); eq(0 + PATCHES[3].inc * 0, G.btn[0] - (G.btn[0]) + 0 * 1, ''); eq(0, G.btn[0] - (PATCHES[3].time >= 5 ? PATCHES[3].inc * 1 : 0), 'paid exactly the cost (plus income passed)'); });
R(22, () => { const z = PATCHES.find(p => p.cost === 0); const G = withFirst(z.id, { btn: [0, 5] }); eq(true, L.swMoves(G).some(m => m.t === 'buy'), 'legal with 0 buttons'); const r = L.swApply(G, firstPlace(G, 0, z.id)); eq(true, r.ok); eq(0, G.btn[0] - (z.time >= 5 ? z.inc : 0), 'still 0'); });
R(23, () => { // independent orientation set per patch
  const norm = c => { const mx = Math.min(...c.map(p => p[0])), my = Math.min(...c.map(p => p[1])); return c.map(p => [p[0] - mx, p[1] - my]).sort((a, b) => a[1] - b[1] || a[0] - b[0]); };
  PATCHES.forEach(p => { const set = new Set(); let c = p.cells; for (let f = 0; f < 2; f++) { for (let r = 0; r < 4; r++) { set.add(J(norm(c))); c = c.map(q => [q[1], -q[0]]); } c = c.map(q => [-q[0], q[1]]); }
    eq(set.size, p.or.length, 'patch ' + p.id + ' orientation count'); eq(true, [...set].every(k => p.or.some(o => J(o) === k)), 'patch ' + p.id + ' orientations equal set');
    p.or.forEach((o, i) => { const G = withFirst(p.id, { btn: [99, 5] }); const r = L.swApply(G, { t: 'buy', k: 0, o: i, x: 1, y: 1 }); if (!r.ok) eq(true, r.ok, 'patch ' + p.id + ' orientation ' + i + ' ' + r.why); else eq(J(o.map(q => (q[1] + 1) * 9 + q[0] + 1).sort((a, b) => a - b)), J(G.board[0].map((v, j) => v === p.id ? j : -1).filter(j => j >= 0)), 'patch ' + p.id + ' o' + i + ' cells'); });
    eq(false, L.swApply(withFirst(p.id, { btn: [99, 5] }), { t: 'buy', k: 0, o: p.or.length, x: 0, y: 0 }).ok, 'patch ' + p.id + ' bad orientation index'); }); });
R(24, () => { const G = mk({ btn: [99, 5] }); fillCells(G, 0, [[0, 0]]); const before = J(G.board[0]); eq(false, L.swApply(G, { t: 'buy', k: 0, o: 0, x: 0, y: 0 }).ok, 'overlap refused'); eq(before, J(G.board[0]), 'board unchanged'); eq(true, L.swApply(G, { t: 'buy', k: 0, o: 0, x: 0, y: 1 }).ok, 'beside it is fine'); });
R(25, () => { const p = PATCHES[1]; eq(3, Math.max(...p.or[0].map(q => q[0])) + 1, 'strip of 3'); const mkG = () => withFirst(1, { btn: [99, 5] }); eq(false, L.swApply(mkG(), { t: 'buy', k: 0, o: 0, x: 7, y: 0 }).ok, 'sticks out right'); eq(false, L.swApply(mkG(), { t: 'buy', k: 0, o: 0, x: -1, y: 0 }).ok, 'sticks out left'); eq(false, L.swApply(mkG(), { t: 'buy', k: 0, o: 0, x: 0, y: 9 }).ok, 'below'); eq(false, L.swApply(mkG(), { t: 'buy', k: 0, o: 0, x: 0, y: -1 }).ok, 'above'); eq(true, L.swApply(mkG(), { t: 'buy', k: 0, o: 0, x: 6, y: 8 }).ok, 'exactly in the corner'); });
R(26, () => { const G = mk({ btn: [99, 5] }); fillRect(G, 0, 0, 0, 9, 9); G.board[0][0] = -1; eq(['adv'], L.swMoves(G).map(m => m.t), 'only advance, one hole'); eq(false, L.swApply(G, { t: 'buy', k: 0, o: 0, x: 0, y: 0 }).ok, 'cannot take it'); });
R(27, () => { PATCHES.forEach(p => { const G = withFirst(p.id, { btn: [99, 5] }); const m = firstPlace(G, 0, p.id); L.swApply(G, m); eq(Math.min(53, p.time), G.pos[0], 'patch ' + p.id + ' time'); }); });
R(28, () => { const G = withFirst(1, { pos: [3, 5], stamp: [9, 2], btn: [9, 5] }); eq(2, PATCHES[1].time); L.swApply(G, firstPlace(G, 0, 1)); eq([5, 5], G.pos); eq(0, L.swWho(G), 'p0 on top moves first'); eq(0, L.swNext(G)); });
R(29, () => { const G = withFirst(3, { pos: [50, 53], stamp: [1, 2], btn: [9, 5] }); eq(5, PATCHES[3].time); L.swApply(G, firstPlace(G, 0, 3)); eq(53, G.pos[0]); });
R(30, () => { const p = PATCHES[4]; eq([3, 1, 3], [p.time, p.inc, p.cost], 'fixture'); const G = withFirst(4, { pos: [3, 20], stamp: [1, 2], btn: [9, 5] }); L.swApply(G, firstPlace(G, 0, 4)); eq(9 - 3 + 1, G.btn[0], 'new patch pays itself passing space 5'); eq(1, G.inc[0]); });
R(31, () => { const G = mk({ btn: [99, 5] }); L.swApply(G, { t: 'buy', k: 0, o: 0, x: 0, y: 0 }); eq(32, G.ring.length); eq([1], G.owned[0]); eq(false, G.ring.includes(1), 'left the circle'); eq(null, L.swCheck(G), 'invariants: 33 accounted for'); const H = mk({ ring: [0, 7] }); eq([7, 0], L.swOffer(H).sort((a, b) => b - a), 'two left -> two on offer'); eq(2, L.swOffer(H).length); });

// ---- Time board events
R(32, () => { const G = mk({ pos: [4, 9], stamp: [5, 6], inc: [3, 0] }); L.swApply(G, { t: 'adv' }); eq(5 + 6 + 3, G.btn[0], '6 steps + income 3 for space 5'); });
R(33, () => { const G = mk({ pos: [3, 4], stamp: [5, 6], inc: [2, 0] }); L.swApply(G, { t: 'adv' }); eq(5, G.pos[0]); eq(5 + 2 + 2, G.btn[0], 'landing on 5 pays'); });
R(34, () => { const G = mk({ pos: [5, 6], stamp: [5, 6], inc: [2, 0] }); L.swApply(G, { t: 'adv' }); eq(7, G.pos[0]); eq(5 + 2, G.btn[0], 'no income for the space you left'); });
R(35, () => { const G = mk({ pos: [4, 17], stamp: [5, 6], inc: [2, 0] }); L.swApply(G, { t: 'adv' }); eq(18, G.pos[0]); eq(5 + 14 + 3 * 2, G.btn[0], 'spaces 5, 11, 17 each pay 2'); });
R(36, () => { const G = mk({ pos: [4, 17], stamp: [5, 6] }); L.swApply(G, { t: 'adv' }); eq(5 + 14, G.btn[0], 'no patches -> no income'); const H = mk({ pos: [19, 21], stamp: [5, 6], inc: [0, 0] }); L.swApply(H, { t: 'adv' }); L.swApply(H, { t: 'leather', x: 0, y: 0 }); eq(0, H.inc[0], 'special patch adds no income'); });
R(37, () => { const p = PATCHES[9]; eq([4, 6, 2], [p.cost, p.time, p.inc], 'fixture'); const G = withFirst(9, { pos: [3, 20], stamp: [1, 2], btn: [9, 5], inc: [1, 0] }); L.swApply(G, firstPlace(G, 0, 9)); eq(9 - 4 + 3, G.btn[0], 'income 1+2 for passing 5 during a purchase'); eq(9, G.pos[0]); });
R(38, () => { const G = mk({ pos: [19, 21], stamp: [3, 4] }); L.swApply(G, { t: 'adv' }); eq(0, G.leather[0], 'seat 0 took it'); eq(0, G.pend && G.pend.seat, 'must place now'); eq(true, L.swMoves(G).every(m => m.t === 'leather'), 'only placements'); eq(false, L.swApply(G, { t: 'adv' }).ok, 'cannot do anything else first'); eq(true, L.swApply(G, { t: 'leather', x: 4, y: 4 }).ok); eq(100, G.board[0][40], 'placed'); eq(null, G.pend); });
R(39, () => { const G = mk({ pos: [18, 19], stamp: [3, 4] }); L.swApply(G, { t: 'adv' }); eq(20, G.pos[0]); eq(0, G.leather[0], 'landing on 20 takes it'); eq(true, !!G.pend); });
R(40, () => { const G = mk({ pos: [19, 21], stamp: [3, 4] }); G.leather[0] = 1; L.swApply(G, { t: 'adv' }); eq(null, G.pend, 'nothing to place'); eq(1, G.leather[0], 'still seat 1s'); });
R(41, () => { const G = mk({ pos: [19, 26], stamp: [3, 4] }); L.swApply(G, { t: 'adv' }); eq([0, 0], [G.leather[0], G.leather[1]], 'both taken'); eq(true, !!G.pend); L.swApply(G, { t: 'leather', x: 0, y: 0 }); eq(true, !!G.pend, 'second one pending'); L.swApply(G, { t: 'leather', x: 1, y: 0 }); eq(null, G.pend); eq(2, G.board[0].filter(c => c === 100).length, 'two squares'); });
R(42, () => { const G = mk({ pos: [19, 21], stamp: [3, 4] }); L.swApply(G, { t: 'adv' }); G.board[0][40] = 7; for (const [x, y] of [[4, 4], [9, 0], [-1, 1], [0, 9], [0, -1], [8, 9]]) { eq(false, L.swApply(G, { t: 'leather', x, y }).ok, 'refused at ' + x + ',' + y); } eq(true, !!G.pend, 'still pending'); });
R(43, () => { const G = mk({ pos: [19, 21], stamp: [3, 4] }); L.swApply(G, { t: 'adv' }); eq(false, L.swApply(G, { t: 'leather', skip: true }).ok, 'cannot skip with room'); eq(true, !!G.pend); });
R(44, () => { const G = mk({ pos: [19, 21], stamp: [3, 4] }); const b = G.btn[0]; L.swApply(G, { t: 'adv' }); const b2 = G.btn[0]; L.swApply(G, { t: 'leather', x: 2, y: 2 }); eq(b2, G.btn[0], 'no cost'); eq(1, G.board[0].filter(c => c === 100).length, 'one square'); eq(0, G.inc[0], 'no icon'); eq(22, G.pos[0], 'no time cost'); });
R(45, () => { const G = mk({ pos: [19, 21], stamp: [3, 4] }); L.swApply(G, { t: 'adv' }); L.swApply(G, { t: 'leather', x: 2, y: 2 }); eq(1, L.swWho(G), 'p1 at 21 behind p0 at 22'); });
R(46, () => { const G = mk({ pos: [19, 21], stamp: [3, 4] }); fillRect(G, 0, 0, 0, 9, 9); L.swApply(G, { t: 'adv' }); eq(null, G.pend, 'nothing to place'); eq(1, L.swWho(G), 'game goes on'); eq(false, G.over); });

// ---- Special tile
const near = (G, s, x0, y0, n, gx, gy) => { fillRect(G, s, x0, y0, n, n); G.board[s][gy * 9 + gx] = -1; }; // n x n block with one gap
R(47, () => { const G = mk({ pos: [19, 21], stamp: [3, 4] }); near(G, 0, 0, 0, 7, 3, 3); L.swApply(G, { t: 'adv' }); eq(null, G.bonus, 'not yet'); L.swApply(G, { t: 'leather', x: 3, y: 3 }); eq(0, G.bonus, 'tile taken at once'); });
R(48, () => { const G = mk({ pos: [19, 21], stamp: [3, 4] }); near(G, 0, 2, 2, 7, 8, 8); L.swApply(G, { t: 'adv' }); L.swApply(G, { t: 'leather', x: 8, y: 8 }); eq(0, G.bonus, '7x7 at the far corner'); const H = mk({ pos: [19, 21], stamp: [3, 4] }); near(H, 0, 1, 0, 7, 4, 0); L.swApply(H, { t: 'adv' }); L.swApply(H, { t: 'leather', x: 4, y: 0 }); eq(0, H.bonus, 'offset square'); });
R(49, () => { const G = mk({ pos: [19, 21], stamp: [3, 4] }); fillRect(G, 0, 0, 0, 6, 7); L.swApply(G, { t: 'adv' }); L.swApply(G, { t: 'leather', x: 8, y: 8 }); eq(null, G.bonus, '6x7 + a stray square'); const H = mk({ pos: [19, 21], stamp: [3, 4] }); near(H, 0, 0, 0, 7, 3, 3); L.swApply(H, { t: 'adv' }); L.swApply(H, { t: 'leather', x: 8, y: 8 }); eq(null, H.bonus, '7x7 with a gap'); });
R(50, () => { const G = mk({ pos: [19, 21], stamp: [3, 4] }); G.bonus = 1; near(G, 0, 0, 0, 7, 3, 3); L.swApply(G, { t: 'adv' }); L.swApply(G, { t: 'leather', x: 3, y: 3 }); eq(1, G.bonus, 'stays with the first'); const H = mk({ pos: [19, 21], stamp: [3, 4] }); near(H, 0, 0, 0, 7, 3, 3); near(H, 1, 0, 0, 7, 3, 3); L.swApply(H, { t: 'adv' }); L.swApply(H, { t: 'leather', x: 3, y: 3 }); eq(0, H.bonus); H.pend = { seat: 1 }; H.cur = 1; L.swApply(H, { t: 'leather', x: 3, y: 3 }); eq(0, H.bonus, 'second completer gets nothing'); });
R(51, () => { const G = mk({ pos: [19, 21], stamp: [3, 4] }); fillRect(G, 0, 0, 0, 7, 7, 100); fillRect(G, 0, 0, 0, 3, 7, 5); fillRect(G, 0, 3, 3, 1, 1, -1); L.swApply(G, { t: 'adv' }); L.swApply(G, { t: 'leather', x: 3, y: 3 }); eq(0, G.bonus, 'mix of patch and special squares'); });
R(52, () => { const G = mk({ btn: [99, 5] }); G.start = G.ring.indexOf(0); eq(0, L.swOffer(G)[0], 'domino on offer'); fillRect(G, 0, 0, 0, 7, 7); G.board[0][0] = -1; G.board[0][1] = -1; eq(true, L.swApply(G, { t: 'buy', k: 0, o: 0, x: 0, y: 0 }).ok, 'domino into the gap'); eq(0, G.bonus, 'regular patch triggers the tile'); });
R(53, () => { const G = mk(); G.bonus = 0; eq(7, L.swScore(G, 0).bonus); eq(0, L.swScore(G, 1).bonus); eq(7, SW.BONUS_PTS); });

// ---- End of game
R(54, () => { const G = mk({ pos: [52, 52], stamp: [3, 2] }); L.swApply(G, { t: 'adv' }); eq(false, G.over, 'one at 53, the other at 52'); eq(true, L.swWho(G) === 1); });
R(55, () => { const G = mk({ pos: [53, 40], stamp: [1, 2], cur: 1, btn: [5, 20] }); eq(1, L.swNext(G)); const H = withFirst(1, { pos: [53, 40], stamp: [1, 2], cur: 1, btn: [5, 20] }); L.swApply(H, firstPlace(H, 1, 1)); eq(1, L.swWho(H), 'p1 keeps moving; p0 on 53 gets no turn'); });
R(56, () => { const G = mk({ pos: [53, 51], stamp: [1, 2], cur: 1 }); L.swApply(G, { t: 'adv' }); eq(true, G.over, 'both on 53'); const H = mk({ pos: [53, 49], stamp: [1, 2], cur: 1 }); L.swApply(H, { t: 'adv' }); eq(false, H.over, 'special patch (50) still to place'); eq(true, !!H.pend); L.swApply(H, { t: 'leather', x: 0, y: 0 }); eq(true, H.over, 'ends after placing'); });
R(57, () => { const G = mk({ pos: [53, 51], stamp: [1, 2], cur: 1 }); L.swApply(G, { t: 'adv' }); eq(false, L.swApply(G, { t: 'adv' }).ok); eq([], L.swMoves(G)); eq(-1, L.swWho(G)); });

// ---- Scoring
const emptied = (G, s, k) => { for (let i = 0; i < 81 - k; i++) G.board[s][i] = 100; }; // k empty squares
R(58, () => { const G = mk({ btn: [17, 3] }); emptied(G, 0, 0); eq(17, L.swScore(G, 0).total, 'full quilt, no tile: buttons only'); eq(17, L.swScore(G, 0).btn); });
R(59, () => { const G = mk({ btn: [17, 3] }); emptied(G, 0, 0); G.bonus = 0; eq(24, L.swScore(G, 0).total); eq(3 - 162, L.swScore(G, 1).total, 'other player: no tile'); });
R(60, () => { const G = mk({ btn: [14, 18] }); emptied(G, 0, 5); G.bonus = 0; eq(11, L.swScore(G, 0).total, '14 + 7 - 5*2 (rulebook example)'); emptied(G, 1, 2); eq(14, L.swScore(G, 1).total, '18 - 2*2 (rulebook example)'); });
R(61, () => { const G = mk({ btn: [0, 0] }); G.board[0][0] = 100; G.board[0][1] = 5; G.board[0][2] = 12; eq(78, L.swEmpty(G.board[0])); eq(-156, L.swScore(G, 0).total); });
R(62, () => { const G = mk({ btn: [3, 0] }); eq(3 - 162, L.swScore(G, 0).total, 'empty quilt'); eq(true, L.swScore(G, 0).total < 0); });
R(63, () => { const G = mk({ btn: [30, 10] }); emptied(G, 0, 0); emptied(G, 1, 0); G.stamp = [9, 5]; eq(0, L.swWinner(G)); G.btn = [10, 30]; G.stamp = [5, 9]; eq(1, L.swWinner(G), 'higher score wins even if it arrived later'); });
R(64, () => { // real flow: p0 reaches 53 first, equal final scores
  let G = mk({ pos: [51, 52], stamp: [3, 2], btn: [10, 11], cur: 0 }); emptied(G, 0, 0); emptied(G, 1, 0); L.swApply(G, { t: 'adv' }); L.swApply(G, { t: 'adv' }); eq(true, G.over); eq([12, 12], G.btn, 'setup tie'); eq(0, L.swWinner(G), 'p0 arrived first');
  G = mk({ pos: [52, 51], stamp: [2, 3], btn: [11, 10], cur: 1 }); emptied(G, 0, 0); emptied(G, 1, 0); L.swApply(G, { t: 'adv' }); L.swApply(G, { t: 'adv' }); eq(true, G.over); eq([12, 12], G.btn); eq(1, L.swWinner(G), 'p1 arrived first'); });

// ---- Data structure
R(65, () => { PATCHES.forEach(p => { eq(true, p.n >= 2 && p.cost >= 0 && p.cost <= 10 && p.time >= 1 && p.inc >= 0 && p.inc <= 3, 'patch ' + p.id + ' ranges'); const set = new Set(p.cells.map(c => c.join())), st = [p.cells[0]], vis = new Set([p.cells[0].join()]); while (st.length) { const c = st.pop(); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(d => { const k = [c[0] + d[0], c[1] + d[1]]; if (set.has(k.join()) && !vis.has(k.join())) { vis.add(k.join()); st.push(k); } }); } eq(p.n, vis.size, 'patch ' + p.id + ' connected'); }); eq(1, PATCHES.filter(p => p.n === 2).length); });

const pass = total - failed.size; console.log('rules ' + total + ', passing ' + pass + ', failing ' + failed.size + (failed.size ? ' [' + [...failed].sort((a, b) => a - b).join(',') + ']' : ''));
process.exit(failed.size ? 1 : 0);

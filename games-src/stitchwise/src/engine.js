// Stitchwise engine: all state is one JSON-safe object G. Moves: {t:'buy',k,o,x,y} | {t:'adv'} | {t:'leather',x,y}.
function swRng(seed) { var s = (seed >>> 0) || 1; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function swNew(opt) {
  opt = opt || {}; var seed = opt.seed != null ? opt.seed : (Math.random() * 1e9) | 0, rnd = swRng(seed), ids = PATCHES.map(function (p) { return p.id; });
  for (var i = ids.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = ids[i]; ids[i] = ids[j]; ids[j] = t; }
  if (opt.ring) ids = opt.ring.slice();
  var start = (ids.indexOf(0) + 1) % ids.length; // the neutral token sits just after the smallest patch
  var G = { seed: seed, rs: (rnd() * 4e9) >>> 0, ring: ids, start: start, pos: [0, 0], stamp: [1, 0], tick: 1, btn: [SW.START_BTN, SW.START_BTN], inc: [0, 0], board: [[], []], owned: [[], []], leather: [null, null, null, null, null], bonus: null,
    cur: opt.first != null ? opt.first : 0, pend: null, over: false, turns: 0, log: [], lvl: opt.lvl || ['human', 'normal'], ev: [] };
  for (var s = 0; s < 2; s++) { G.board[s] = []; for (var k = 0; k < 81; k++) G.board[s].push(-1); }
  if (G.cur === 1) { G.stamp = [0, 1]; }
  return G;
}
function swClone(G) { return JSON.parse(JSON.stringify(G)); }
function swRand(G) { var r = swRng(G.rs); var v = r(); G.rs = (G.rs + 0x9E3779B1) >>> 0; return v; }
function swOffer(G) { var L = G.ring.length, n = Math.min(3, L), o = []; for (var k = 0; k < n; k++) o.push(G.ring[(G.start + k) % L]); return o; }
function swFits(board, cells, x, y) { for (var i = 0; i < cells.length; i++) { var cx = x + cells[i][0], cy = y + cells[i][1]; if (cx < 0 || cy < 0 || cx > 8 || cy > 8 || board[cy * 9 + cx] !== -1) return false; } return true; }
function swPlacements(board, p) { var out = []; for (var o = 0; o < p.or.length; o++) { var c = p.or[o], w = 0, h = 0; c.forEach(function (q) { if (q[0] > w) w = q[0]; if (q[1] > h) h = q[1]; }); for (var y = 0; y + h < 9; y++) for (var x = 0; x + w < 9; x++) if (swFits(board, c, x, y)) out.push([o, x, y]); } return out; }
function swEmpty(board) { var n = 0; for (var i = 0; i < 81; i++) if (board[i] === -1) n++; return n; }
function swWho(G) { if (G.over) return -1; if (G.pend) return G.pend.seat; return G.cur; }
function swNext(G) { // the player further back moves; on a tie the one on top (later arrival)
  var a = G.pos[0], b = G.pos[1];
  if (a >= SW.TRACK && b >= SW.TRACK) return -1; if (a >= SW.TRACK) return 1; if (b >= SW.TRACK) return 0;
  if (a !== b) return a < b ? 0 : 1; return G.stamp[0] > G.stamp[1] ? 0 : 1;
}
function swCanBuy(G, s, pid) { var p = PATCHES[pid]; return G.btn[s] >= p.cost && swPlacements(G.board[s], p).length > 0; }
function swAdvSteps(G, s) { var o = 1 - s, t = Math.min(SW.TRACK, G.pos[o] + 1); if (G.pos[o] <= G.pos[s]) t = Math.min(SW.TRACK, G.pos[s] + 1); return Math.max(0, t - G.pos[s]); }
function swMoves(G) { // list of legal moves for the player to act (placements for a buy are expanded only when asked: expand=true)
  if (G.over) return []; var s = swWho(G), m = [];
  if (G.pend) { for (var i = 0; i < 81; i++) if (G.board[s][i] === -1) m.push({ t: 'leather', x: i % 9, y: (i / 9) | 0 }); if (!m.length) m.push({ t: 'leather', skip: true }); return m; }
  var off = swOffer(G); off.forEach(function (pid, k) { if (swCanBuy(G, s, pid)) m.push({ t: 'buy', k: k, pid: pid }); });
  m.push({ t: 'adv' }); return m;
}
function swPassInc(G, s, from, to) { // income and leather for the spaces in (from, to]
  var got = 0, lea = null; SW.BTN_SPOTS.forEach(function (b) { if (b > from && b <= to) got += G.inc[s]; });
  SW.LEATHER_SPOTS.forEach(function (l, i) { if (l > from && l <= to && G.leather[i] === null && lea === null) lea = i; });
  return { inc: got, lea: lea };
}
function swMoveTok(G, s, to, why) { // advance s's token to `to`, collecting income; may open a leather placement. Returns the income got.
  var from = G.pos[s]; to = Math.min(to, SW.TRACK); var r = swPassInc(G, s, from, to); G.pos[s] = to; G.stamp[s] = ++G.tick; G.btn[s] += r.inc;
  var ev = { k: 'move', s: s, from: from, to: to, inc: r.inc }; G.ev.push(ev);
  // every leather space passed is taken (usually one)
  SW.LEATHER_SPOTS.forEach(function (l, i) { if (l > from && l <= to && G.leather[i] === null) { G.leather[i] = s; G.pendQ = (G.pendQ || 0) + 1; } });
  return r.inc;
}
function swBonus(G, s) { if (G.bonus !== null) return; var b = G.board[s], n = SW.BONUS_SIZE;
  for (var y = 0; y + n <= 9; y++) for (var x = 0; x + n <= 9; x++) { var ok = true; for (var j = 0; j < n && ok; j++) for (var i = 0; i < n; i++) if (b[(y + j) * 9 + x + i] === -1) { ok = false; break; } if (ok) { G.bonus = s; G.ev.push({ k: 'bonus', s: s }); return; } } }
function swSettle(G) { // after a move: leather placement pending? else who goes next / game over
  if (G.pendQ > 0) { var s = G.cur; G.pendQ--; if (!G.board[s].some(function (c) { return c === -1; })) { return swSettle(G); } G.pend = { seat: s }; return; }
  G.pend = null; var n = swNext(G); if (n < 0) { G.over = true; G.ev.push({ k: 'over' }); return; } G.cur = n;
}
function swApply(G, m) { // returns {ok, why}. Mutates G.
  if (G.over) return { ok: false, why: 'over' }; var s = swWho(G); G.ev = []; G.turns++;
  if (m.t === 'leather') { if (!G.pend) return { ok: false, why: 'no leather' }; if (m.skip) { G.pend = null; swSettle(G); return { ok: true }; } if (G.board[s][m.y * 9 + m.x] !== -1) return { ok: false, why: 'taken' };
    G.board[s][m.y * 9 + m.x] = 100; G.ev.push({ k: 'place', s: s, pid: 100, cells: [[m.x, m.y]] }); swBonus(G, s); G.pend = null; swSettle(G); return { ok: true }; }
  if (G.pend) return { ok: false, why: 'leather first' };
  if (m.t === 'adv') { var st = swAdvSteps(G, s); var to = G.pos[s] + st; var before = G.btn[s]; swMoveTok(G, s, to); G.btn[s] += st; G.ev[0].gain = st; G.log.push([s, 'adv', st]); swSettle(G); return { ok: true }; }
  if (m.t === 'buy') { var off = swOffer(G), pid = off[m.k]; if (pid == null) return { ok: false, why: 'no such patch' }; var p = PATCHES[pid]; if (G.btn[s] < p.cost) return { ok: false, why: 'cost' };
    var c = p.or[m.o]; if (!c || !swFits(G.board[s], c, m.x, m.y)) return { ok: false, why: 'fit' };
    G.btn[s] -= p.cost; var cells = c.map(function (q) { return [m.x + q[0], m.y + q[1]]; }); cells.forEach(function (q) { G.board[s][q[1] * 9 + q[0]] = pid; });
    G.owned[s].push(pid); G.inc[s] += p.inc; var idx = (G.start + m.k) % G.ring.length; G.ring.splice(idx, 1); G.start = G.ring.length ? idx % G.ring.length : 0;
    G.ev.push({ k: 'place', s: s, pid: pid, cells: cells, cost: p.cost }); swBonus(G, s); swMoveTok(G, s, G.pos[s] + p.time); G.log.push([s, 'buy', pid]); swSettle(G); return { ok: true }; }
  return { ok: false, why: 'bad move' };
}
function swScore(G, s) { var b = G.btn[s], e = swEmpty(G.board[s]); return { btn: b, bonus: G.bonus === s ? SW.BONUS_PTS : 0, empty: e, pen: e * SW.EMPTY_PEN, total: b + (G.bonus === s ? SW.BONUS_PTS : 0) - e * SW.EMPTY_PEN }; }
function swWinner(G) { var a = swScore(G, 0).total, b = swScore(G, 1).total; if (a !== b) return a > b ? 0 : 1; return G.stamp[0] < G.stamp[1] ? 0 : 1; } // tie: the player who finished first... the one who reached the end first wins
function swCheck(G) { // invariants
  for (var s = 0; s < 2; s++) { var n = 0; G.board[s].forEach(function (c) { if (c !== -1) n++; }); var want = 0; G.owned[s].forEach(function (pid) { want += PATCHES[pid].n; }); G.board[s].forEach(function (c) { if (c === 100) want++; });
    if (n !== want) return 'cells ' + s + ': ' + n + ' vs ' + want; if (G.btn[s] < 0) return 'negative buttons'; if (G.pos[s] > SW.TRACK) return 'pos'; }
  var tot = G.ring.length + G.owned[0].length + G.owned[1].length; if (tot !== 33) return 'patch count ' + tot; return null; }
if (typeof module !== 'undefined') module.exports = { SW: SW, PATCHES: PATCHES };

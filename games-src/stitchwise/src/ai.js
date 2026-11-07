// Stitchwise computer players. Levels: simple (test bot), easy, normal, hard. Needs data.js + engine.js.
function aiHoles(board) { // penalty for small empty pockets + ragged edges; lower is worse
  var seen = new Uint8Array(81), pen = 0, edges = 0;
  for (var i = 0; i < 81; i++) {
    var x = i % 9, y = (i / 9) | 0;
    if (board[i] === -1) { if (x < 8 && board[i + 1] !== -1) edges++; if (y < 8 && board[i + 9] !== -1) edges++; if (x === 0) edges += .5; if (y === 8) edges += .5; if (x === 8) edges += .5; if (y === 0) edges += .5; } else { if (x < 8 && board[i + 1] === -1) edges++; if (y < 8 && board[i + 9] === -1) edges++; }
    if (board[i] !== -1 || seen[i]) continue;
    var st = [i], n = 0; seen[i] = 1;
    while (st.length) { var c = st.pop(); n++; var cx = c % 9, cy = (c / 9) | 0; [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) { var nx = cx + d[0], ny = cy + d[1]; if (nx < 0 || ny < 0 || nx > 8 || ny > 8) return; var k = ny * 9 + nx; if (board[k] === -1 && !seen[k]) { seen[k] = 1; st.push(k); } }); }
    pen += n === 1 ? 2.2 : n === 2 ? 1.1 : n === 3 ? .5 : n === 4 ? .2 : 0;
  }
  return -(pen + edges * .06);
}
function aiBestPlace(board, p, lim) { // best [o,x,y,score] by pocket/edge quality
  var best = null, all = swPlacements(board, p);
  for (var i = 0; i < all.length; i++) { var pl = all[i], c = p.or[pl[0]]; c.forEach(function (q) { board[(pl[2] + q[1]) * 9 + pl[1] + q[0]] = 50; }); var sc = aiHoles(board); c.forEach(function (q) { board[(pl[2] + q[1]) * 9 + pl[1] + q[0]] = -1; }); if (!best || sc > best[3]) best = [pl[0], pl[1], pl[2], sc]; }
  return best;
}
var AI_W = { tv: .5, fill: 2, inc: 1, holes: 1.4 };
function aiIncSpots(pos) { var n = 0; SW.BTN_SPOTS.forEach(function (b) { if (b > pos) n++; }); return n; }
function aiVal(G, s, hq) { // value of a position for seat s (higher is better), hq = holes quality of s's board (cached)
  var W = AI_W, R = SW.TRACK - G.pos[s], empty = swEmpty(G.board[s]), filled = 81 - empty;
  var canFill = Math.min(empty, R * 2.2 + 4); // cells we can still plausibly fill in the time left
  return G.btn[s] + (G.bonus === s ? 7 : 0) - (empty - 0) * 2 * 0 + filled * W.fill + G.inc[s] * aiIncSpots(G.pos[s]) * W.inc + hq * W.holes * 1 + R * W.tv * (R / 53) - (empty > canFill ? (empty - canFill) * 1 : 0) * 0;
}
function aiEvalMove(G, m, s, ctx) { // returns [valueDelta, placement] by trying the move on a clone
  var C = swClone(G), pl = null, hq0 = aiHoles(G.board[s]);
  if (m.t === 'buy') { var p = PATCHES[m.pid]; pl = aiBestPlace(C.board[s], p); if (!pl) return null; m = { t: 'buy', k: m.k, o: pl[0], x: pl[1], y: pl[2] }; }
  var r = swApply(C, m); if (!r.ok) return null;
  var v = aiVal(C, s, aiHoles(C.board[s])) - aiVal(C, 1 - s, aiHoles(C.board[1 - s])) - (aiVal(G, s, hq0) - aiVal(G, 1 - s, aiHoles(G.board[1 - s])));
  // leather placement pending for me: it is a free 1x1; fill the most useful empty cell
  return { v: v, m: m, C: C };
}
function aiLeather(G, s) { var b = G.board[s], best = null, bs = -1e9; for (var i = 0; i < 81; i++) if (b[i] === -1) { b[i] = 50; var sc = aiHoles(b); b[i] = -1; if (sc > bs) { bs = sc; best = i; } } return best == null ? { t: 'leather', skip: true } : { t: 'leather', x: best % 9, y: (best / 9) | 0 }; }
function aiMove(G, level, rnd) {
  rnd = rnd || Math.random; var s = swWho(G); if (s < 0) return null;
  if (G.pend) { if (level === 'simple' || level === 'easy' && rnd() < .5) { var mv = swMoves(G); return mv[Math.floor(rnd() * mv.length)]; } return aiLeather(G, s); }
  var moves = swMoves(G);
  if (level === 'simple') { // test bot: buy the first affordable patch that fits (first fit), else advance
    for (var i = 0; i < moves.length; i++) if (moves[i].t === 'buy') { var p = PATCHES[moves[i].pid], pl = swPlacements(G.board[s], p)[0]; return { t: 'buy', k: moves[i].k, o: pl[0], x: pl[1], y: pl[2] }; }
    return { t: 'adv' };
  }
  var cands = [];
  moves.forEach(function (m) { var e = aiEvalMove(G, m, s); if (e) cands.push(e); });
  if (!cands.length) return { t: 'adv' };
  if (level === 'easy') { // noisy, shortsighted, sometimes grabs the first thing
    cands.forEach(function (c) { c.v += (rnd() - .5) * 14; }); if (rnd() < .15) { var b = cands.find(function (c) { return c.m.t === 'buy'; }); if (b) return b.m; }
  } else if (level === 'normal') { cands.forEach(function (c) { c.v += (rnd() - .5) * 3.2; }); }
  if (level === 'hard') { // two-ply: subtract the best reply of the opponent when it is their move next
    cands.forEach(function (c) {
      if (c.C.over || c.C.pend) return; var o = swWho(c.C), best = 0; if (o === s) { return; }
      swMoves(c.C).forEach(function (m2) { var e2 = aiEvalMove(c.C, m2, o); if (e2 && e2.v > best) best = e2.v; });
      c.v -= best * .55;
    });
  }
  cands.sort(function (a, b) { return b.v - a.v; });
  return cands[0].m;
}
if (typeof module !== 'undefined') module.exports = { aiMove: aiMove };

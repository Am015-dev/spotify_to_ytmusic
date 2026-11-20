// Meadowfold computer players. AI.plan() simulates the whole turn on a copy of G and returns the move list the UI plays out step by step.
// Evaluator = real score now + a little for half-built landscapes + for animal homes one token away. Easy adds noise and skips ideas.
var AI = (function () {
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function near(s, id) {   // pattern placements missing exactly one hex that is empty: a home one token away
    var pat = E.card(id).pat, C = E.cells(G.side), n = 0;
    C.list.forEach(function (o) {
      for (var rot = 0; rot < 6; rot++) {
        var k = o, miss = 0, ok = true, tgt = null;
        for (var i = 0; i < pat.length; i++) {
          if (i) { k = E.step(G.side, k, pat[i].d + rot); if (!k) { ok = false; break; } }
          if (pat[i].cube) tgt = k;
          if (!E.shows(s.board[k], pat[i].n)) { var st = s.board[k] || []; if (s.cubes[k] || !grows(st, pat[i].n)) { ok = false; break; } miss++; }
        }
        if (ok && tgt && !s.cubes[tgt] && miss >= 1 && miss <= 2) n += miss === 1 ? 1 : .35;
      }
    });
    return n;
  }
  function grows(st, n) {   // can this stack still become n?
    var h = st.length;
    if (!h) return true;
    if (n.indexOf('mount') === 0) return st.every(function (x) { return x === 'mount'; }) && h < +n[5];
    if (n.indexOf('tree') === 0) return st.every(function (x) { return x === 'trunk'; }) && h < +n[4];
    if (n === 'build') return h === 1 && /mount|trunk|build/.test(st[0]);
    return false;
  }
  function evalSeat(s, lvl) {
    var sc = E.score(s), v = sc.total, C = E.cells(G.side);
    C.list.forEach(function (k) {
      var st = s.board[k] || [], h = st.length, t = st[h - 1];
      if (t === 'trunk' && !s.cubes[k]) v += h === 1 ? 1.2 : 3;
      if (t === 'mount' && h < 3 && !s.cubes[k]) v += .6 * h;
      if (t === 'build' && h === 1) v -= 1;
      if (t === 'field' && !E.nb(G.side, k).some(function (y) { var x = s.board[y]; return x && x[x.length - 1] === 'field'; })) v += 1.5;
    });
    s.cards.forEach(function (c) { var p = E.card(c.id).pts, nxt = p[p.length - c.left] - (E.cardPts(c)); v += Math.min(2.5, near(s, c.id)) * nxt * (lvl === 'hard' ? .45 : .3); });
    if (s.spirit && !s.spirit.placed) v += Math.min(2, near(s, s.spirit.id)) * 3;
    return v;
  }
  function cubesGreedy(out) {
    for (var guard = 0; guard < 20; guard++) {
      var ms = E.moves().filter(function (m) { return m.t === 'cube'; });
      if (!ms.length) return;
      E.apply(ms[0]); out.push(ms[0]);
    }
  }
  function cardValue(s, id, lvl) {
    var c = E.card(id), p = c.pts, top = p[p.length - 1] / p.length;
    var tmp = { board: s.board, cubes: s.cubes };
    var now = Object.keys(E.cubeSpots(tmp, id)).length, nr = near(tmp, id);
    return top * (1 + now * .8 + Math.min(4, nr) * .25) + (lvl === 'easy' ? Math.random() * 8 : 0);
  }
  function plan(lvl) {
    lvl = lvl || 'normal';
    var saved = G; G = clone(saved);
    var out = [], s = E.seat();
    try {
      if (s.offer) { var bi = 0, bv = -1; s.offer.forEach(function (id, i) { var v = Math.random() * (lvl === 'easy' ? 10 : 1) + (/fields|tree|mount/.test(E.card(id).sc) ? 2 : 0); if (v > bv) { bv = v; bi = i; } }); var m0 = { t: 'spirit', i: bi }; E.apply(m0); out.push(m0); s = E.seat(); }
      cubesGreedy(out);
      // take a card first so the tokens can build toward it
      if (E.active(s) < 4 && G.row.length && (lvl !== 'easy' || Math.random() < .7)) {
        var best = -1, bvv = -1; G.row.forEach(function (id, i) { var v = cardValue(s, id, lvl); if (v > bvv) { bvv = v; best = i; } });
        if (best >= 0 && (E.active(s) < 3 || bvv > 9)) { var mc = { t: 'card', i: best }; E.apply(mc); out.push(mc); cubesGreedy(out); }
      }
      // try every pocket; place its three tokens greedily (hard: also keeps the second-best line for each first token)
      var base = clone(G), opts = [];
      base.central.forEach(function (sp, i) {
        if (!sp.length) return;
        G = clone(base); var seq = [], mt = { t: 'take', i: i }; E.apply(mt); seq.push(mt);
        for (var n = 0; n < 3; n++) {
          var ps = E.moves().filter(function (m) { return m.t === 'place'; }); if (!ps.length) break;
          var bm = null, bv2 = -1e9, cur = clone(G), sc = [];
          ps.forEach(function (m) { G = clone(cur); E.apply(m); var tmpOut = []; cubesGreedy(tmpOut); var v = evalSeat(E.seat(), lvl); sc.push([v, m]); if (v > bv2) { bv2 = v; bm = m; } });
          if (lvl === 'easy') { sc.sort(function (a, b) { return b[0] - a[0]; }); bm = sc[Math.min(sc.length - 1, Math.floor(Math.random() * 4))][1]; }
          G = cur; E.apply(bm); seq.push(bm); cubesGreedy(seq);
        }
        opts.push({ v: evalSeat(E.seat(), lvl) + (lvl === 'easy' ? Math.random() * 6 : 0), seq: seq });
      });
      opts.sort(function (a, b) { return b.v - a.v; });
      G = base; if (opts[0]) opts[0].seq.forEach(function (m) { if (E.legal(m)) { E.apply(m); out.push(m); } });
      cubesGreedy(out);
      if (G.solo && !G.turn.tookCard && !G.turn.swapped && G.deck.length) { var worst = -1, wv = 1e9; G.row.forEach(function (id, i) { var v = cardValue(E.seat(), id, lvl); if (v < wv) { wv = v; worst = i; } }); if (wv < 6) out.push({ t: 'swap', i: worst }); }
      out.push({ t: 'end' });
    } finally { G = saved; }
    return out;
  }
  return { plan: plan, evalSeat: evalSeat, near: near };
})();

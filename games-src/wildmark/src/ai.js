/* Wildmark computer players. A turn = one plan {pre:[wipe moves], pick, place, tok}. Evaluator: immediate score gain (animal patterns + corridors + acorns)
   plus, at normal/hard, the value of the open animal slots a tile adds (pattern growth) and corridor reach. easy = noisy greedy. */
(function () {
  var W = window.WM;
  function gainTok(env, c, a) {   // animal points gained by putting a on c
    var b = W.scoreAnimal(env, a), x = env[c]; x.tok = a;
    var g = W.scoreAnimal(env, a); if (a !== 'fox') { W.ANI.forEach(function (o) { if (o === 'fox') g += W.scoreAnimal(env, 'fox') - (x.tok = null, W.scoreAnimal(env, 'fox')); x.tok = a; }); }
    else g += 0;
    x.tok = null; return g - b;
  }
  // value of free slots: how good future tokens could be there (cheap estimate)
  function slotVal(env, c, s) {
    var x = env[c]; if (!x || x.tok) return 0; var best = 0;
    x.a.forEach(function (a) {
      var adj = W.nb(c).filter(function (n) { return env[n] && env[n].tok === a; }).length;
      var v = a === 'hawk' ? (adj ? -1 : 2.2) : a === 'bear' ? (adj === 1 ? 4 : adj ? -1 : 1.2) : a === 'elk' ? (adj ? 2.6 : 1) : a === 'salmon' ? (adj && adj <= 1 ? 2.8 : adj ? -0.5 : 1) : 1 + W.nb(c).filter(function (n) { return env[n] && env[n].tok; }).length * 0.5;
      if (W.bag && s && s.bagTot) v *= 0.6 + 0.4 * (s.bag[a] / Math.max(1, s.bagTot / 5));
      if (v > best) best = v;
    });
    return best;
  }
  function habGain(env, c, t, before) { var g = 0; t.forEach(function (tt) { g += W.corridor(env, tt) - before[tt]; }); return g; }
  var BW = 0.6, EASY_RANDOM = 0.4;   // hard: points per majority-bonus swing (2-player)
  W.AI = {
    plan: function (G, level) {
      W.curCards = G.cards;
      var s = G.seats[G.cur], env = s.env, lv = level || s.ai || 'normal', novice = lv === 'novice'; if (novice) lv = 'easy'; var noise = lv === 'easy' ? 6 : lv === 'normal' ? 0.6 : 0;
      var pot = lv === 'easy' ? 0.15 : lv === 'normal' ? 0.45 : 0.6, rnd = function () { return W.rnd(G); };
      var bagTot = 0; for (var a in G.bag) bagTot += G.bag[a];
      var ctx = { bag: G.bag, bagTot: bagTot }, before = {}; W.TER.forEach(function (t) { before[t] = W.corridor(env, t); });
      var riv = null; if (lv === 'hard' && G.np === 2) { var re = G.seats[1 - G.cur].env; riv = {}; W.TER.forEach(function (t) { riv[t] = W.corridor(re, t); }); }
      var bw = BW;
      function bon(m, r) { return m > r ? 2 : m === r && m > 0 ? 1 : 0; }
      function habVal(env, T) {
        var g = 0;
        T.forEach(function (tt) {
          var after = W.corridor(env, tt), d = after - before[tt];
          g += d * (lv === 'easy' ? 0.7 : 1);
          if (riv) g += bw * (bon(after, riv[tt]) - bon(riv[tt], after) - bon(before[tt], riv[tt]) + bon(riv[tt], before[tt]));
        });
        return g;
      }
      var kb = lv === 'hard' && !(s.done >= G.turns - 1) ? 3 : 1;
      var spots = W.spots(env), endGame = s.done >= G.turns - 1, best = null;
      function evalPair(tile, tok, cost) {
        // best tile placement (corridor gain + slot value) then best token spot given that placement.
        // token + slot parts do not depend on rotation, so they are computed once per spot.
        var bt = null, rots = W.rots(tile);
        for (var i = 0; i < spots.length; i++) {
          var c = spots[i];
          env[c] = { id: tile.id, t: tile.t, a: tile.a, key: tile.key, rot: rots[0], tok: null };
          var base = 0;
          if (!endGame) base += pot * slotVal(env, c, ctx) * 0.6;
          var tb = 0, tc = null;
          W.tokSpots(env, tok).forEach(function (tc0) { var g = gainTok(env, tc0, tok) + (env[tc0].key ? kb : 0); if (!endGame) g -= pot * slotVal(env, tc0, ctx) * 0.5; if (tc === null || g > tb) { tb = g; tc = tc0; } });
          if (tc !== null && tb < -0.5 && lv !== 'easy') tc = null;   // returning beats ruining a pattern
          base += tc !== null ? tb : 0;
          for (var j = 0; j < rots.length; j++) {
            env[c].rot = rots[j];
            var v = base + habVal(env, tile.t) + noise * (rnd() - 0.5) * 2;
            if (!bt || v > bt.v) bt = { v: v, c: c, rot: rots[j], tok: tc };
          }
          delete env[c];
        }
        bt.v -= cost; return bt;
      }
      var acornV = endGame ? 1 : (lv === 'hard' ? 3.5 : 2.2);
      for (var i = 0; i < 4; i++) { var t = G.market.tiles[i], k = G.market.toks[i]; if (!t || !k) continue; var e = evalPair(t, k, 0); if (!best || e.v > best.v) best = Object.assign(e, { m: { t: 'take', i: i } }); }
      if (lv === 'easy' && (novice || rnd() < EASY_RANDOM)) {   // novice (the guided tutorial's rival) always grabs a random pair
          // easy: sometimes just grabs a random pair
        var ok = []; for (var r0 = 0; r0 < 4; r0++) if (G.market.tiles[r0] && G.market.toks[r0]) ok.push(r0);
        var ri = ok[Math.floor(rnd() * ok.length)], er = evalPair(G.market.tiles[ri], G.market.toks[ri], 0); best = Object.assign(er, { m: { t: 'take', i: ri } });
      }
      if (s.acorns > 0 && lv !== 'easy') {
        for (var a1 = 0; a1 < 4; a1++) for (var b1 = 0; b1 < 4; b1++) { if (a1 === b1 || !G.market.tiles[a1] || !G.market.toks[b1]) continue; var e2 = evalPair(G.market.tiles[a1], G.market.toks[b1], acornV); if (e2.v > best.v + 0.01) best = Object.assign(e2, { m: { t: 'free', ti: a1, ki: b1 } }); }
      }
      return { pick: best.m, place: { t: 'place', c: best.c, rot: best.rot }, tokC: best.tok, v: best.v };
    },
    // one move for the current stage (used by tests and the UI). Wipe 3 when it helps (hard/normal), never at easy.
    choose: function (G, level) {
      var s = G.seats[G.cur], lv = level || s.ai || 'normal';
      if (G.stage === 'pick') {
        if (!G.used3 && !G.opts.no3 && W.triple(G) && lv !== 'easy') {
          var p0 = W.AI.plan(G, lv); if (p0.v < 2) return { t: 'wipe3' };
          G._plan = p0; return p0.pick;
        }
        var p = W.AI.plan(G, lv);
        G._plan = p; return p.pick;
      }
      if (G.stage === 'tile') {
        var pl = G._plan;
        if (pl && W.spots(s.env).indexOf(pl.place.c) >= 0) return pl.place;
        var sp = W.spots(s.env); return { t: 'place', c: sp[0], rot: 0 };
      }
      if (G.stage === 'tok') {
        var pp = G._plan; delete G._plan;
        if (pp && pp.tokC && W.tokSpots(s.env, G.hold.tok).indexOf(pp.tokC) >= 0) return { t: 'tok', c: pp.tokC };
        var ts = W.tokSpots(s.env, G.hold.tok); if (!ts.length) return { t: 'back' };
        var bc = null, bv = -1e9; ts.forEach(function (c) { var g = gainTok(s.env, c, G.hold.tok) + (s.env[c].key ? 1 : 0); if (g > bv) { bv = g; bc = c; } });
        return bv < -0.5 ? { t: 'back' } : { t: 'tok', c: bc };
      }
      return null;
    }
  };
  W.gainTok = gainTok;
})();

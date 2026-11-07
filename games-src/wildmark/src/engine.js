/* Wildmark rules engine. One JSON-safe state G (no functions). Pointy-top hexes in axial coords "q,r".
   Turn: (optional wipes) -> take a tile+token pair -> place the tile next to your map (any rotation) -> place the token on a matching empty tile or return it.
   API: WM.newGame(opts) WM.moves(G) WM.apply(G, m) WM.score(env) WM.final(G) WM.check(G) WM.text(G) */
(function () {
  var W = window.WM;
  var DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];   // E NE NW W SW SE
  W.DIRS = DIRS;
  function k(q, r) { return q + ',' + r; }
  function pk(s) { var p = s.split(','); return [+p[0], +p[1]]; }
  W.k = k; W.pk = pk;
  function rnd(G) { var t = (G.rs = (G.rs + 0x6D2B79F5) | 0); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  W.rnd = rnd;
  function shuffle(G, a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd(G) * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  W.clone = clone;
  // terrain on edge i of a placed tile
  function edgeT(c, i) { return c.t.length === 1 ? c.t[0] : (((i - c.rot) % 6 + 6) % 6 < 3 ? c.t[0] : c.t[1]); }
  W.edgeT = edgeT;
  function nb(key) { var p = pk(key); return DIRS.map(function (d) { return k(p[0] + d[0], p[1] + d[1]); }); }
  W.nb = nb;
  function drawTok(G) {
    var tot = 0, a; for (a in G.bag) tot += G.bag[a]; if (!tot) return null;
    var x = Math.floor(rnd(G) * tot); for (a in G.bag) { if (x < G.bag[a]) { G.bag[a]--; return a; } x -= G.bag[a]; } return null;
  }
  function an(a) { return (/^[AEIOU]/.test(W.ANI_NAME[a]) ? 'an ' : 'a ') + W.ANI_NAME[a]; }
  function log(G, s) { G.log.push(s); if (G.log.length > 60) G.log.shift(); G.logN = (G.logN || 0) + 1; }
  W.newGame = function (o) {
    o = o || {};
    var np = Math.max(1, Math.min(4, o.np || 2)), seed = o.seed != null ? o.seed : Math.floor(Math.random() * 1e9);
    var G = { v: 1, seed: seed, rs: seed | 0, np: np, solo: np === 1, turns: o.turns || 20, cur: 0, phase: 'pick', stage: 'pick', round: 1, log: [], logN: 0,
      bag: { bear: 20, elk: 20, salmon: 20, hawk: 20, fox: 20 }, seats: [], market: { tiles: [], toks: [] }, hold: null, used3: false, acornPool: 25, over: false, winner: -1, res: null,
      opts: { no3: !!o.no3, noAcornHuman: !!o.noAcornHuman }, cards: o.cards || null, tw: o.twist || null, lastScore: null };
    var names = o.names || [];
    var st = shuffle(G, [0, 1, 2, 3, 4]);
    for (var s = 0; s < np; s++) {
      var env = {}, tri = W.STARTERS[st[s]], pos = [[0, 0], [-1, 1], [0, 1]];
      tri.forEach(function (t, i) { env[k(pos[i][0], pos[i][1])] = { id: -1 - s * 3 - i, t: t.t.slice(), a: t.a.slice(), key: !!t.key, rot: t.r || 0, tok: null }; });
      G.seats.push({ name: names[s] || (s === 0 ? 'You' : W.RIVALS[(s - 1) % W.RIVALS.length]), ai: (o.ai && o.ai[s]) || null, env: env, acorns: (o.acorns && o.acorns[s]) || 0, done: 0 });
    }
    var need = (G.solo ? 2 : np) * G.turns + 3 + (G.solo ? 0 : 0);
    var pool = shuffle(G, clone(W.TILES)); G.supply = pool.slice(0, Math.min(pool.length, need));
    for (var i = 0; i < 4; i++) { G.market.tiles.push(G.supply.pop()); G.market.toks.push(drawTok(G)); }
    overpop(G);
    W.curCards = G.cards;
    log(G, 'A new valley. ' + (G.solo ? 'Solo game.' : np + ' rangers.'));
    return G;
  };
  // four matching tokens are swept away automatically (repeat until they differ)
  function overpop(G) {
    for (var n = 0; n < 20; n++) {
      var t = G.market.toks; if (!t[0] || t.some(function (x) { return x !== t[0]; }) || t.length < 4) return;
      var back = t.slice(); for (var i = 0; i < 4; i++) t[i] = drawTok(G); back.forEach(function (a) { G.bag[a]++; });
      log(G, 'Four ' + W.ANI_NAME[back[0]] + ' tokens: the market is wiped.'); G.wiped4 = (G.wiped4 || 0) + 1;
    }
  }
  W.triple = function (G) { var c = {}; G.market.toks.forEach(function (a) { if (a) c[a] = (c[a] || 0) + 1; }); for (var a in c) if (c[a] === 3) return a; return null; };
  function canPlace(env, key) { if (env[key]) return false; return nb(key).some(function (n) { return !!env[n]; }); }
  W.spots = function (env) { var o = {}; for (var c in env) nb(c).forEach(function (n) { if (!env[n]) o[n] = 1; }); return Object.keys(o); };
  W.tokSpots = function (env, a) { var o = []; for (var c in env) { var x = env[c]; if (!x.tok && x.a.indexOf(a) >= 0) o.push(c); } return o; };
  W.rots = function (tile) { return tile.t.length === 1 ? [0] : [0, 1, 2, 3, 4, 5]; };
  // ---------------------------------------------------------------- legal moves for the seat to act
  W.moves = function (G) {
    W.curCards = G.cards;
    if (G.over) return [];
    var s = G.seats[G.cur], m = [];
    if (G.stage === 'pick') {
      for (var i = 0; i < 4; i++) if (G.market.tiles[i] && G.market.toks[i]) m.push({ t: 'take', i: i });
      if (!G.used3 && !G.opts.no3 && W.triple(G)) m.push({ t: 'wipe3' });
      if (s.acorns > 0) {
        for (var a = 0; a < 4; a++) for (var b = 0; b < 4; b++) if (a !== b && G.market.tiles[a] && G.market.toks[b]) m.push({ t: 'free', ti: a, ki: b });
        m.push({ t: 'wipe', idx: [0, 1, 2, 3] });   // any subset is legal; this is the representative one (apply accepts any)
      }
    } else if (G.stage === 'tile') {
      var tl = G.hold.tile; W.spots(s.env).forEach(function (c) { W.rots(tl).forEach(function (r) { m.push({ t: 'place', c: c, rot: r }); }); });
    } else if (G.stage === 'tok') {
      W.tokSpots(s.env, G.hold.tok).forEach(function (c) { m.push({ t: 'tok', c: c }); });
      m.push({ t: 'back' });
    }
    return m;
  };
  W.apply = function (G, m) {
    W.curCards = G.cards;
    var s = G.seats[G.cur], i;
    if (G.over) throw new Error('game over');
    if (G.stage === 'pick') {
      if (m.t === 'wipe3') {
        var a3 = W.triple(G); if (!a3 || G.used3 || G.opts.no3) throw new Error('no triple');
        for (i = 0; i < 4; i++) if (G.market.toks[i] === a3) G.market.toks[i] = drawTok(G);
        G.bag[a3] += 3; G.used3 = true; log(G, s.name + ' swept away three ' + W.ANI_NAME[a3] + ' tokens.'); overpop(G); return G;
      }
      if (m.t === 'wipe') {
        if (s.acorns < 1 || !m.idx || !m.idx.length) throw new Error('no acorn');
        s.acorns--; if (G.acornPool != null) G.acornPool++; var back = [];
        m.idx.forEach(function (j) { back.push(G.market.toks[j]); G.market.toks[j] = drawTok(G); }); back.forEach(function (a) { if (a) G.bag[a]++; });
        log(G, s.name + ' spent an acorn to replace ' + m.idx.length + ' token' + (m.idx.length > 1 ? 's' : '') + '.'); overpop(G); return G;
      }
      if (m.t === 'take' || m.t === 'free') {
        var ti = m.t === 'take' ? m.i : m.ti, ki = m.t === 'take' ? m.i : m.ki;
        if (!G.market.tiles[ti] || !G.market.toks[ki]) throw new Error('empty slot');
        if (m.t === 'free') { if (s.acorns < 1 || ti === ki) throw new Error('free pick needs an acorn'); s.acorns--; if (G.acornPool != null) G.acornPool++; }
        G.hold = { tile: G.market.tiles[ti], tok: G.market.toks[ki], ti: ti, ki: ki, free: m.t === 'free' };
        G.market.tiles[ti] = null; G.market.toks[ki] = null; G.stage = 'tile'; return G;
      }
      throw new Error('bad move ' + m.t);
    }
    if (G.stage === 'tile') {
      if (m.t !== 'place' || !canPlace(s.env, m.c)) throw new Error('bad place');
      var tl = G.hold.tile; s.env[m.c] = { id: tl.id, t: tl.t.slice(), a: tl.a.slice(), key: !!tl.key, rot: tl.t.length === 1 ? 0 : ((m.rot | 0) % 6 + 6) % 6, tok: null };
      G.hold.at = m.c; G.stage = 'tok'; return G;
    }
    if (G.stage === 'tok') {
      var tok = G.hold.tok, gain = 0;
      if (m.t === 'tok') {
        var c = s.env[m.c]; if (!c || c.tok || c.a.indexOf(tok) < 0) throw new Error('bad token spot');
        c.tok = tok; if (c.key && (G.acornPool == null || G.acornPool > 0)) { s.acorns++; gain = 1; if (G.acornPool != null) G.acornPool--; }   // rules: the supply holds 25 acorns
        log(G, s.name + ' placed ' + an(tok) + (gain ? ' on a keystone and gained an acorn.' : '.'));
      } else if (m.t === 'back') { G.bag[tok]++; log(G, s.name + ' returned ' + an(tok) + ' token.'); }
      else throw new Error('bad token move');
      G.last = { seat: G.cur, tile: G.hold.at, tok: m.t === 'tok' ? m.c : null, acorn: gain };
      endTurn(G); return G;
    }
    throw new Error('bad stage');
  };
  function endTurn(G) {
    var s = G.seats[G.cur]; s.done++; G.hold = null; G.used3 = false; G.stage = 'pick';
    if (G.solo) {   // solo: the rightmost remaining tile and the rightmost remaining token leave the game
      for (var i = 3; i >= 0; i--) if (G.market.tiles[i]) { G.market.tiles[i] = null; break; }
      for (i = 3; i >= 0; i--) if (G.market.toks[i]) { G.bag[G.market.toks[i]]++; G.market.toks[i] = null; break; }
    }
    // rules: market items never move; the taken tile and token are refilled in place (solo keeps its documented slide toward the far end)
    if (G.solo) ['tiles', 'toks'].forEach(function (f) { var l = G.market[f].filter(function (x) { return x; }); while (l.length < 4) l.unshift(null); G.market[f] = l; });
    for (i = 0; i < 4; i++) { if (!G.market.tiles[i]) G.market.tiles[i] = G.supply.length ? G.supply.pop() : null; if (!G.market.toks[i]) G.market.toks[i] = drawTok(G); }
    overpop(G);
    if (G.seats.every(function (x) { return x.done >= G.turns; })) { finish(G); return; }
    G.cur = (G.cur + 1) % G.np; if (G.cur === 0) G.round++;
  }
  // ---------------------------------------------------------------- scoring
  function comps(env, pred) {   // connected groups of cells holding token pred
    var seen = {}, out = [];
    for (var c in env) if (!seen[c] && pred(env[c])) {
      var g = [], st = [c]; seen[c] = 1;
      while (st.length) { var x = st.pop(); g.push(x); nb(x).forEach(function (n) { if (!seen[n] && env[n] && pred(env[n])) { seen[n] = 1; st.push(n); } }); }
      out.push(g);
    }
    return out;
  }
  function tokAt(env, c, a) { return env[c] && env[c].tok === a; }
  W.scoreAnimal = function (env, a, info, set) {
    if (set === undefined || set === null) set = W.curCards ? W.curCards[a] : 'a';
    if (set && set !== 'a' && W.scoreX) return W.scoreX(env, a, set, info);
    var C = W.CARDS[a], pts = C.pts, cells = [], c;
    for (c in env) if (env[c].tok === a) cells.push(c);
    var lit = [], v = 0;
    if (a === 'bear') { var n = 0; comps(env, function (x) { return x.tok === 'bear'; }).forEach(function (g) { if (g.length === 2) { n++; lit = lit.concat(g); } }); v = pts[Math.min(n, 4)]; }
    else if (a === 'hawk') { var h = cells.filter(function (x) { return !nb(x).some(function (y) { return tokAt(env, y, 'hawk'); }); }); lit = h; v = pts[Math.min(h.length, 8)]; }
    else if (a === 'salmon') { comps(env, function (x) { return x.tok === 'salmon'; }).forEach(function (g) { var ok = g.every(function (x) { return nb(x).filter(function (y) { return tokAt(env, y, 'salmon'); }).length <= 2; }); if (ok) { v += pts[Math.min(g.length, 7)]; lit = lit.concat(g); } }); }
    else if (a === 'fox') { cells.forEach(function (x) { var s = {}; nb(x).forEach(function (y) { if (env[y] && env[y].tok) s[env[y].tok] = 1; }); var f = Object.keys(s).length; v += f; if (f) lit.push(x); }); }
    else if (a === 'elk') {   // greedy: longest straight lines first (3 axes), each elk used once, lines capped at 4
      var used = {}, lines = [];
      cells.forEach(function (x) { [0, 1, 5].forEach(function (d) { var p = pk(x), b = k(p[0] - DIRS[d][0], p[1] - DIRS[d][1]); if (tokAt(env, b, 'elk')) return; var l = [x], q = p; for (;;) { q = [q[0] + DIRS[d][0], q[1] + DIRS[d][1]]; if (tokAt(env, k(q[0], q[1]), 'elk')) l.push(k(q[0], q[1])); else break; } lines.push(l); }); });
      lines.sort(function (p, q) { return q.length - p.length; });
      for (;;) {
        var best = null, bl = 0;
        lines.forEach(function (l) { var run = [], br = []; l.forEach(function (x) { if (used[x]) { if (run.length > br.length) br = run; run = []; } else run.push(x); }); if (run.length > br.length) br = run; if (br.length > bl) { bl = br.length; best = br; } });
        if (!best) break;
        var take = best.slice(0, 4); take.forEach(function (x) { used[x] = 1; }); v += pts[take.length]; lit = lit.concat(take);
      }
    }
    if (info) info.lit = lit;
    return v;
  };
  W.corridor = function (env, t, info) {
    var seen = {}, best = [];
    for (var c in env) if (!seen[c] && env[c].t.indexOf(t) >= 0) {
      var g = [], st = [c]; seen[c] = 1;
      while (st.length) { var x = st.pop(); g.push(x); var p = pk(x);
        for (var d = 0; d < 6; d++) { var n = k(p[0] + DIRS[d][0], p[1] + DIRS[d][1]); if (seen[n] || !env[n]) continue; if (edgeT(env[x], d) === t && edgeT(env[n], (d + 3) % 6) === t) { seen[n] = 1; st.push(n); } } }
      if (g.length > best.length) best = g;
    }
    if (info) info.cells = best;
    return best.length;
  };
  W.score = function (env, acorns, cards) {
    var r = { ani: {}, hab: {}, aniT: 0, habT: 0, acorns: acorns || 0 };
    W.ANI.forEach(function (a) { r.ani[a] = W.scoreAnimal(env, a, null, cards ? cards[a] : undefined); r.aniT += r.ani[a]; });
    W.TER.forEach(function (t) { r.hab[t] = W.corridor(env, t); r.habT += r.hab[t]; });
    r.total = r.aniT + r.habT + r.acorns; return r;
  };
  // majority bonuses for the largest corridor of each terrain (solo: +2 for a corridor of 7 or more)
  W.bonus = function (G, sc) {
    var b = sc.map(function () { return {}; });
    W.TER.forEach(function (t) {
      var v = sc.map(function (s) { return s.hab[t]; });
      if (G.solo) { b[0][t] = v[0] >= 7 ? 2 : 0; return; }
      var top = Math.max.apply(null, v), firsts = [], i;
      for (i = 0; i < v.length; i++) b[i][t] = 0;
      if (top <= 0) return;
      for (i = 0; i < v.length; i++) if (v[i] === top) firsts.push(i);
      if (G.np === 2) { firsts.forEach(function (j) { b[j][t] = firsts.length > 1 ? 1 : 2; }); return; }
      if (firsts.length === 1) {
        b[firsts[0]][t] = 3;
        var rest = v.filter(function (x, j) { return j !== firsts[0]; }), sec = Math.max.apply(null, rest), secs = [];
        if (sec > 0) { for (i = 0; i < v.length; i++) if (i !== firsts[0] && v[i] === sec) secs.push(i); if (secs.length === 1) b[secs[0]][t] = 1; }
      } else if (firsts.length === 2) firsts.forEach(function (j) { b[j][t] = 2; });
      else firsts.forEach(function (j) { b[j][t] = 1; });
    });
    return b;
  };
  W.final = function (G) {
    var sc = G.seats.map(function (s) { return W.score(s.env, s.acorns, G.cards); }), bo = W.bonus(G, sc);
    sc.forEach(function (s, i) { s.bonus = bo[i]; s.bonusT = 0; for (var t in bo[i]) s.bonusT += bo[i][t]; s.total += s.bonusT; });
    return sc;
  };
  function finish(G) {
    G.over = true; G.phase = 'over'; G.stage = 'over'; var sc = W.final(G); G.res = sc;
    var best = -1, w = -1;
    sc.forEach(function (s, i) { var v = s.total * 100 + s.acorns; if (v > best) { best = v; w = i; } });
    var tie = sc.filter(function (s) { return s.total * 100 + s.acorns === best; }).length > 1;
    G.winner = G.solo ? 0 : (tie ? -2 : w);
    log(G, 'The season ends. ' + (G.solo ? 'You scored ' + sc[0].total + '.' : tie ? 'A shared win!' : G.seats[w].name + ' wins with ' + sc[w].total + '.'));
  }
  W.forceEnd = function (G) { G.seats.forEach(function (s) { s.done = G.turns; }); finish(G); };
  // ---------------------------------------------------------------- invariants (component conservation)
  W.check = function (G) {
    var bad = [], tok = { bear: 0, elk: 0, salmon: 0, hawk: 0, fox: 0 }, a;
    for (a in G.bag) { if (G.bag[a] < 0) bad.push('bag<0 ' + a); tok[a] += G.bag[a]; }
    G.market.toks.forEach(function (x) { if (x) tok[x]++; });
    if (G.hold && G.hold.tok && G.stage !== 'over') tok[G.hold.tok]++;
    G.seats.forEach(function (s) { for (var c in s.env) { var x = s.env[c]; if (x.tok) { tok[x.tok]++; if (x.a.indexOf(x.tok) < 0) bad.push('token on wrong tile'); } } if (s.acorns < 0) bad.push('acorns<0'); });
    var lost = G.lostToks || {}; for (a in tok) if (tok[a] + (lost[a] || 0) !== 20) bad.push('token count ' + a + '=' + tok[a]);
    var ids = {}; G.seats.forEach(function (s) { for (var c in s.env) { var id = s.env[c].id; if (id >= 0) { if (ids[id]) bad.push('dup tile ' + id); ids[id] = 1; } } });
    G.market.tiles.forEach(function (t) { if (t) { if (ids[t.id]) bad.push('dup tile m' + t.id); ids[t.id] = 1; } });
    G.supply.forEach(function (t) { if (ids[t.id]) bad.push('dup tile s' + t.id); ids[t.id] = 1; });
    return bad;
  };
  W.text = function (G) {
    return JSON.stringify({ cur: G.cur, stage: G.stage, round: G.round, market: G.market.tiles.map(function (t, i) { return t ? t.t.join('/') + ':' + t.a.join('/') + '+' + G.market.toks[i] : '-'; }),
      seats: G.seats.map(function (s) { return { name: s.name, tiles: Object.keys(s.env).length, acorns: s.acorns, done: s.done, score: W.score(s.env, s.acorns).total }; }), over: G.over, winner: G.winner });
  };
})();

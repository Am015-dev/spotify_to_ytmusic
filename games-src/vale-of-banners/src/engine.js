/* Vale of Banners rules engine. All state in one JSON-safe G (no functions). Node + page.
   5 seasons x 5 rounds. Each round every player rolls 2 dice; each die = one action. See rules-notes.md. */
(function (V) {
  /* ---------- geometry: 37 estate spaces, regions (connected same-colour groups) ---------- */
  var CELLS = [], REGIONS = [], AT = {};
  V.LAYOUT.forEach(function (row, ri) {
    var r = ri - 3, qmin = Math.max(-3, -3 - r);
    for (var i = 0; i < row.length; i++) {
      var q = qmin + i, c = { i: CELLS.length, row: ri, q: q, r: r, col: V.COL[row[i]], num: +V.NUMS[ri][i], nb: [], reg: -1 };
      AT[q + ',' + r] = c.i; CELLS.push(c);
    }
  });
  CELLS.forEach(function (c) {
    [[1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1]].forEach(function (d) { var k = AT[(c.q + d[0]) + ',' + (c.r + d[1])]; if (k != null) c.nb.push(k); });
  });
  CELLS.forEach(function (c) {
    if (c.reg >= 0) return; var reg = { id: REGIONS.length, col: c.col, cells: [] }, st = [c.i]; c.reg = reg.id;
    while (st.length) { var x = st.pop(); reg.cells.push(x); CELLS[x].nb.forEach(function (n) { if (CELLS[n].reg < 0 && CELLS[n].col === c.col) { CELLS[n].reg = reg.id; st.push(n); } }); }
    reg.cells.sort(function (a, b) { return a - b; }); REGIONS.push(reg);
  });
  V.CELLS = CELLS; V.REGIONS = REGIONS; V.HOME = AT['0,0'];
  V.COLCOUNT = {}; CELLS.forEach(function (c) { V.COLCOUNT[c.col] = (V.COLCOUNT[c.col] || 0) + 1; });

  /* ---------- rng ---------- */
  function rnd(G) { G.rs = (G.rs + 0x6D2B79F5) >>> 0; var t = G.rs; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  function shuffle(G, a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd(G) * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function die(G) { return 1 + Math.floor(rnd(G) * 6); }
  V.rnd = rnd;

  /* ---------- setup ---------- */
  V.newGame = function (o) {
    o = o || {};
    var n = o.n === 1 ? 1 : Math.max(2, Math.min(4, o.n || 2)), teams = !!o.teams && n === 4;
    var G = { v: 1, rs: (o.seed == null ? (Date.now() & 0x7fffffff) : o.seed) >>> 0, n: n, nPhases: o.phases || 5, phase: 0, round: 0,
      seats: [], P: [], depots: {}, goodsAt: {}, black: [], bag: [], bagB: [], gbag: [], rg: [], white: 1, order: [], ti: 0, pend: [], arrc: 0,
      colTaken: {}, over: false, log: [], noBlack: !!o.noBlack, turn: 0, seq: 0, winner: null, solo: n === 1, teams: teams };
    if (o.rounds && o.rounds < 5) G.nRounds = o.rounds;   /* short coached game: fewer rounds per season */
    G.seed0 = G.rs;
    for (var i = 0; i < n; i++) {
      var s = (o.seats && o.seats[i]) || {};
      G.seats.push({ name: s.name || (i === 0 ? 'You' : V.SEATNAME[i]), human: s.human != null ? !!s.human : i === 0, ai: s.ai || 'normal', style: s.style || null });
    }
    var all = V.pool(); G.bag = shuffle(G, all.filter(function (x) { return !x.b; })); G.bagB = shuffle(G, all.filter(function (x) { return x.b; }));   /* black-backed tiles feed only the back lane */
    for (var g = 1; g <= 6; g++) for (var k = 0; k < 7; k++) G.gbag.push(g);
    shuffle(G, G.gbag);
    var first = []; for (i = 0; i < n; i++) first.push(i); shuffle(G, first);
    for (i = 0; i < n; i++) {
      var p = { estate: {}, store: [], goods: {}, silver: 1, workers: 0, vp: 0, dice: [0, 0], used: [true, true], bought: false, sold: 0, know: {}, pos: 0, arr: 0, regDone: {}, colDone: {}, stat: { regions: 0, sales: 0, chain: 0 } };
      p.estate[V.HOME] = { id: 'home' + i, t: 'castle', home: true };
      if (n === 1) p.nolim = true;   /* solo: no limit on goods kinds */
      for (k = 0; k < 3; k++) addGoods(p, G.gbag.pop());
      G.P.push(p);
    }
    first.forEach(function (seat, k) { G.P[seat].workers = k + 1; G.P[seat].arr = n - k; });
    if (n === 1) G.P[0].workers = 2;   /* solo: 1 silver, 2 workers, 3 goods */
    if (teams) [[0, 2], [1, 3]].forEach(function (tm) {   /* 2 v 2: partners share one pool of silver, workers and goods */
      var a = G.P[tm[0]], b = G.P[tm[1]]; a.silver += b.silver; a.workers += b.workers; a.nolim = b.nolim = true;
      Object.keys(b.goods).forEach(function (g) { a.goods[g] = (a.goods[g] || 0) + b.goods[g]; });
      b.silver = a.silver; b.workers = a.workers; b.goods = JSON.parse(JSON.stringify(a.goods)); a.nolim = b.nolim = false; });
    var b = o.bonus || {};   /* campaign twists: {seat:{silver, workers, vp}} */
    Object.keys(b).forEach(function (s) { var p = G.P[+s]; if (!p) return; p.silver += b[s].silver || 0; p.workers = Math.max(0, p.workers + (b[s].workers || 0)); p.vp += b[s].vp || 0; if (b[s].first) { p.arr = 99; } });
    G.arrc = 100;
    startPhase(G);
    return G;
  };
  function addGoods(p, g) {
    if (p.goods[g]) { p.goods[g]++; return true; }
    if (!p.nolim && Object.keys(p.goods).filter(function (k) { return p.goods[k] > 0; }).length >= 3) return false;
    p.goods[g] = 1; return true;
  }
  V.depotSize = function (G) { return G.n <= 2 ? 2 : G.n === 3 ? 3 : 4; };
  V.blackSize = function (G) { return G.n <= 2 ? 4 : G.n === 3 ? 6 : 8; };
  function startPhase(G) {
    for (var d = 1; d <= 6; d++) { G.depots[d] = []; G.goodsAt[d] = []; for (var k = 0; k < V.depotSize(G); k++) G.depots[d].push(G.bag.length ? G.bag.pop() : null); }
    var bb = G.bagB || G.bag; G.black = []; for (k = 0; k < V.blackSize(G); k++) G.black.push(bb.length && !G.noBlack ? bb.pop() : null);
    G.rg = []; for (k = 0; k < 5; k++) G.rg.push(G.gbag.length ? G.gbag.pop() : 0);
    G.round = 0; startRound(G);
  }
  function computeOrder(G) {
    var o = []; for (var i = 0; i < G.n; i++) o.push(i);
    o.sort(function (a, b) { return (G.P[b].pos - G.P[a].pos) || (G.P[b].arr - G.P[a].arr); });
    return o;
  }
  function startRound(G) {
    G.white = die(G);
    var gd = G.rg[G.round]; if (gd) { G.goodsAt[G.white].push(gd); G.rg[G.round] = 0; }
    G.order = computeOrder(G); G.ti = 0;
    G.P.forEach(function (p) { p.dice = [die(G), die(G)]; p.used = [false, false]; p.bought = false; });
    G.log.push({ k: 'round', phase: G.phase, round: G.round, white: G.white });
  }
  V.actor = function (G) { return G.over ? -1 : G.order[G.ti]; };
  V.cap = function (p) { return p.know['store4'] ? 4 : 3; };
  V.dist = function (a, b) { var d = Math.abs(a - b); return Math.min(d, 6 - d); };
  V.cost = function (p, a, v, kind) {
    var d = V.dist(a, v);
    if (kind === 'take' && p.know['take1']) d = Math.max(0, d - 1);
    if (kind === 'place' && p.know['place1']) d = Math.max(0, d - 1);
    if (p.know['wk2']) d = Math.ceil(d / 2);
    return d;
  };
  V.blackCost = function (p) { return p.know['black1'] ? 1 : 2; };
  V.goodsTypes = function (p) { return Object.keys(p.goods).filter(function (k) { return p.goods[k] > 0; }).map(Number); };
  function hasBuilt(p, i) { return !!p.estate[i]; }
  V.canPlace = function (p, tile, ci, v) {   /* v = die number, or 0 = any number */
    var c = CELLS[ci];
    if (!tile || p.estate[ci] || c.col !== tile.t) return false;
    if (v && c.num !== v) return false;
    if (!c.nb.some(function (n) { return hasBuilt(p, n); })) return false;
    if (tile.t === 'bld' && !p.know['dupBld']) {
      var reg = REGIONS[c.reg];
      if (reg.cells.some(function (x) { var t = p.estate[x]; return t && t.k === tile.k; })) return false;
    }
    return true;
  };
  V.placeTargets = function (p, tile, v) { var o = []; for (var i = 0; i < CELLS.length; i++) if (V.canPlace(p, tile, i, v)) o.push(i); return o; };

  /* ---------- moves ---------- */
  V.validMoves = function (G) {
    if (G.over) return [];
    var s = V.actor(G), p = G.P[s], M = [], top = G.pend[G.pend.length - 1];
    if (top) return pendMoves(G, p, top);
    for (var di = 0; di < 2; di++) {
      if (p.used[di]) continue;
      if (di === 1 && !p.used[0] && p.dice[1] === p.dice[0]) continue;   /* identical dice: list once */
      dieMoves(G, p, di, p.dice[di], M, false);
    }
    if (!G.noBlack && !p.bought && p.silver >= V.blackCost(p)) G.black.forEach(function (t, k) { if (t) M.push({ k: 'buy', slot: k }); });
    if (p.used[0] && p.used[1]) M.push({ k: 'end' });
    return M;
  };
  function dieMoves(G, p, di, val, M, free) {
    var v, k, budget = p.workers;
    for (v = 1; v <= 6; v++) {
      var ct = free ? 0 : V.cost(p, val, v, 'take');
      if (ct <= budget) G.depots[v].forEach(function (t, k) { if (t) M.push({ k: 'take', die: di, v: v, slot: k, w: ct }); });
      var cp = free ? 0 : V.cost(p, val, v, 'place');
      if (cp <= budget) p.store.forEach(function (t, s) {
        V.placeTargets(p, t, v).forEach(function (ci) { M.push({ k: 'place', die: di, v: v, s: s, cell: ci, w: cp }); });
      });
      var cs = free ? 0 : V.cost(p, val, v, 'sell');
      if (cs <= budget && p.goods[v] > 0) M.push({ k: 'sell', die: di, v: v, w: cs });
    }
    M.push({ k: 'workers', die: di, w: 0 });
  }
  function pendMoves(G, p, top) {
    var M = [];
    if (top.t === 'discard') { p.store.forEach(function (t, s) { M.push({ k: 'discard', s: s }); }); return M; }
    if (top.t === 'castle') { dieMoves(G, p, 'x', 0, M, true); M.forEach(function (m) { m.w = 0; }); }
    else if (top.t === 'hall') { p.store.forEach(function (t, s) { V.placeTargets(p, t, 0).forEach(function (ci) { M.push({ k: 'place', die: 'x', v: CELLS[ci].num, s: s, cell: ci, w: 0 }); }); }); }
    else if (top.t === 'grab') { for (var v = 1; v <= 6; v++) G.depots[v].forEach(function (t, k) { if (t && top.types.indexOf(t.t) >= 0) M.push({ k: 'grab', v: v, slot: k }); }); }
    else if (top.t === 'store') { V.goodsTypes(p).forEach(function (g) { M.push({ k: 'sell', die: 'x', v: g, w: 0 }); }); }
    else if (top.t === 'ship') { for (v = 1; v <= 6; v++) if (G.goodsAt[v].length) M.push({ k: 'ship', v: v }); }
    M.push({ k: 'skip' });
    return M;
  }
  V.same = function (a, b) { return a && b && a.k === b.k && a.die === b.die && a.v === b.v && a.slot === b.slot && a.s === b.s && a.cell === b.cell; };
  V.legal = function (G, m) { return V.validMoves(G).some(function (x) { return V.same(x, m); }); };

  /* performMove: returns {ok, ev:[...]} ; ev drive the animations */
  V.TEAMS = [[0, 2], [1, 3]];
  V.teamOf = function (G, s) { return G.teams ? s % 2 : s; };
  function pool(p) { return { silver: p.silver, workers: p.workers, goods: JSON.parse(JSON.stringify(p.goods)) }; }
  function teamSync(G, before) {   /* partners share: new pool = old + both partners' changes */
    V.TEAMS.forEach(function (tm) {
      var a = G.P[tm[0]], b = G.P[tm[1]], o = before[tm[0]], ob = before[tm[1]];
      var sil = o.silver + (a.silver - o.silver) + (b.silver - ob.silver), wk = o.workers + (a.workers - o.workers) + (b.workers - ob.workers), gd = {};
      [1, 2, 3, 4, 5, 6].forEach(function (g) { var v = (o.goods[g] || 0) + ((a.goods[g] || 0) - (o.goods[g] || 0)) + ((b.goods[g] || 0) - (ob.goods[g] || 0)); if (v > 0) gd[g] = v; });
      a.silver = b.silver = sil; a.workers = b.workers = wk; a.goods = gd; b.goods = JSON.parse(JSON.stringify(gd));
    });
  }
  V.performMove = function (G, m) {
    if (!G.teams) return move1(G, m);
    var before = G.P.map(pool), r = move1(G, m); if (r.ok) teamSync(G, before); return r;
  };
  function move1(G, m) {
    if (!V.legal(G, m)) return { ok: false, why: 'illegal' };
    var s = V.actor(G), p = G.P[s], ev = [], t;
    G.seq++;
    if (m.k !== 'end' && m.k !== 'skip' && m.k !== 'discard' && m.die !== 'x' && typeof m.die === 'number') {
      var di = m.die; if (p.used[di] && !p.used[1 - di] && p.dice[0] === p.dice[1]) di = 1 - di;
      p.used[di] = true; p.workers -= m.w || 0; if (m.w) ev.push({ e: 'workers', p: s, n: -m.w });
      ev.push({ e: 'die', p: s, die: di, v: m.v });
    } else if (m.die === 'x') { G.pend.pop(); }
    else if (m.k === 'skip' || m.k === 'discard') { G.pend.pop(); }
    switch (m.k) {
      case 'take':
        t = G.depots[m.v][m.slot]; G.depots[m.v][m.slot] = null; p.store.push(t);
        ev.push({ e: 'take', p: s, tile: t, from: 'd' + m.v, slot: m.slot });
        if (p.store.length > V.cap(p)) G.pend.push({ t: 'discard' });
        break;
      case 'grab':
        G.pend.pop(); t = G.depots[m.v][m.slot]; G.depots[m.v][m.slot] = null; p.store.push(t);
        ev.push({ e: 'take', p: s, tile: t, from: 'd' + m.v, slot: m.slot });
        if (p.store.length > V.cap(p)) G.pend.push({ t: 'discard' });
        break;
      case 'buy':
        t = G.black[m.slot]; G.black[m.slot] = null; p.silver -= V.blackCost(p); p.bought = true; p.store.push(t);
        ev.push({ e: 'take', p: s, tile: t, from: 'black', slot: m.slot }); ev.push({ e: 'silver', p: s, n: -V.blackCost(p) });
        if (p.store.length > V.cap(p)) G.pend.push({ t: 'discard' });
        break;
      case 'discard':
        t = p.store.splice(m.s, 1)[0]; G.discard = (G.discard || 0) + 1; ev.push({ e: 'discard', p: s, tile: t });
        break;
      case 'place':
        t = p.store.splice(m.s, 1)[0]; place(G, s, t, m.cell, ev, m.die === 'x');
        break;
      case 'sell': sell(G, s, m.v, ev); break;
      case 'workers':
        var nw = 2 + (p.know['wk+1'] ? 1 : 0); p.workers += nw; ev.push({ e: 'workers', p: s, n: nw });
        if (p.know['wkSil']) { p.silver++; ev.push({ e: 'silver', p: s, n: 1 }); }
        break;
      case 'ship':
        /* a goods tile that does not fit (a 4th kind) stays on the stall, as in the published rules */
        G.pend.pop(); var all = G.goodsAt[m.v].splice(0), got = [], left = [];
        all.forEach(function (g) { if (addGoods(p, g)) got.push(g); else left.push(g); });
        G.goodsAt[m.v] = left;
        ev.push({ e: 'goods', p: s, from: m.v, goods: got, lost: 0, left: left.length });
        break;
      case 'skip': break;
      case 'end': endTurn(G); ev.push({ e: 'end', p: s }); break;
    }
    autoPop(G);
    G.log.push({ k: 'move', p: s, m: m });
    if (G.log.length > 400) G.log.splice(0, G.log.length - 400);
    return { ok: true, ev: ev };
  }
  function autoPop(G) {   /* drop optional questions that cannot be answered */
    while (G.pend.length) {
      var p = G.P[V.actor(G)], top = G.pend[G.pend.length - 1], mv = pendMoves(G, p, top);
      if (top.t !== 'discard' && mv.length === 1) { G.pend.pop(); continue; }
      break;
    }
  }
  function score(G, s, n, why, cell, ev) { if (!n) return; G.P[s].vp += n; ev.push({ e: 'score', p: s, n: n, why: why, cell: cell }); }
  function place(G, s, t, ci, ev, chained) {
    var p = G.P[s], c = CELLS[ci]; p.estate[ci] = t;
    ev.push({ e: 'place', p: s, tile: t, cell: ci, chain: !!chained });
    if (chained) p.stat.chain++;
    /* region complete */
    var reg = REGIONS[c.reg];
    if (!p.regDone[reg.id] && reg.cells.every(function (x) { return p.estate[x]; })) {
      p.regDone[reg.id] = true; p.stat.regions++;
      score(G, s, V.REGION_PTS[Math.min(8, reg.cells.length)] + V.PHASE_BONUS[Math.min(4, G.phase)], 'region', ci, ev);
    }
    /* colour complete */
    if (!p.colDone[c.col] && CELLS.every(function (x) { return x.col !== c.col || p.estate[x.i]; })) {
      p.colDone[c.col] = true; var rank = G.colTaken[c.col] || 0; G.colTaken[c.col] = rank + 1;
      var tb = V.COLOUR_BONUS[Math.max(2, G.n)]; score(G, s, tb[rank] || 0, 'colour', ci, ev);
    }
    switch (t.t) {
      case 'castle': G.pend.push({ t: 'castle' }); break;
      case 'know': p.know[V.KNOWBY[t.k].e] = true; break;
      case 'pas':
        var sum = 0; reg.cells.forEach(function (x) { var y = p.estate[x]; if (y && y.t === 'pas' && y.k === t.k) sum += y.n; });
        score(G, s, sum + (p.know['pasVP'] ? 2 : 0), 'animals', ci, ev); break;
      case 'ship':
        p.pos++; p.arr = ++G.arrc; ev.push({ e: 'track', p: s, pos: p.pos });
        if (p.know['shipVP']) score(G, s, 2, 'lore', ci, ev);
        if (p.know['shipSil']) { p.silver++; ev.push({ e: 'silver', p: s, n: 1 }); }
        G.pend.push({ t: 'ship' }); break;
      case 'bld':
        switch (t.k) {
          case 'hall': G.pend.push({ t: 'hall' }); break;
          case 'carp': G.pend.push({ t: 'grab', types: ['bld'] }); break;
          case 'chapel': G.pend.push({ t: 'grab', types: ['castle', 'mine', 'know'] }); break;
          case 'mkt': G.pend.push({ t: 'grab', types: ['ship', 'pas'] }); break;
          case 'inn': p.workers += 4; ev.push({ e: 'workers', p: s, n: 4 }); break;
          case 'mint': p.silver += 2; ev.push({ e: 'silver', p: s, n: 2 }); break;
          case 'tower': score(G, s, 4, 'tower', ci, ev); break;
          case 'store': G.pend.push({ t: 'store' }); break;
        }
        break;
    }
  }
  V.saleVP = function (G, p, cnt) { return cnt * Math.max(2, G.n) + (p.know['saleVP'] ? cnt : 0); };
  function sell(G, s, g, ev) {
    var p = G.P[s], cnt = p.goods[g] || 0; if (!cnt) return;
    p.goods[g] = 0; delete p.goods[g]; p.sold += cnt; p.stat.sales++;
    var sil = 1 + (p.know['saleSil'] ? 1 : 0); p.silver += sil;
    ev.push({ e: 'sell', p: s, g: g, n: cnt }); ev.push({ e: 'silver', p: s, n: sil });
    score(G, s, V.saleVP(G, p, cnt), 'goods', null, ev);
    if (p.know['saleWk']) { p.workers++; ev.push({ e: 'workers', p: s, n: 1 }); }
  }
  function endTurn(G) {
    G.turn++; G.ti++;
    if (G.ti < G.n) return;
    G.round++;
    if (G.round < (G.nRounds || 5)) { startRound(G); return; }
    /* season end: mines */
    G.P.forEach(function (p) {
      var mines = 0; for (var k in p.estate) if (p.estate[k].t === 'mine') mines++;
      p.silver += mines; if (p.know['mineWk']) p.workers += mines; if (p.know['mineVP']) p.vp += mines;
    });
    G.log.push({ k: 'season', phase: G.phase });
    G.phase++;
    if (G.phase >= G.nPhases) { finalScore(G); return; }
    startPhase(G);
  }
  V.endBreakdown = function (G, p) {
    var b = { silver: p.silver, workers: Math.floor(p.workers / 2), goods: 0, lore: 0 };
    V.goodsTypes(p).forEach(function (g) { b.goods += p.goods[g]; });
    var kinds = {}, beasts = {}; for (var k in p.estate) { var t = p.estate[k]; if (t.t === 'bld') kinds[t.k] = (kinds[t.k] || 0) + 1; if (t.t === 'pas') beasts[t.k] = 1; }
    Object.keys(p.know).forEach(function (e) {
      if (e.indexOf('end:') !== 0) return; var w = e.slice(4);
      if (w === 'sold') b.lore += p.sold; else if (w === 'beast') b.lore += 4 * Object.keys(beasts).length; else b.lore += 3 * (kinds[w] || 0);
    });
    return b;
  };
  function finalScore(G) {
    G.over = true;
    G.P.forEach(function (p, i) { var b = V.endBreakdown(G, p); if (G.teams && i >= 2) { b.silver = 0; b.workers = 0; b.goods = 0; }   /* the shared pool counts once per team */
      p.end = b; p.vpPlay = p.vp; p.vp += b.silver + b.workers + b.goods + b.lore; });
    if (G.solo) {   /* solo: you win by filling all 37 spaces of your estate */
      G.rank = [0]; G.soloFilled = V.estateFilled(G.P[0]); G.winner = G.soloFilled >= CELLS.length ? 0 : -1; G.log.push({ k: 'over', winner: G.winner }); return; }
    if (G.teams) G.teamVP = V.TEAMS.map(function (tm) { return G.P[tm[0]].vp + G.P[tm[1]].vp; });
    var best = -1; G.rank = [];
    for (var i = 0; i < G.n; i++) G.rank.push(i);
    G.rank.sort(function (a, b) { return (G.teams ? G.teamVP[b % 2] - G.teamVP[a % 2] : 0) || (G.P[b].vp - G.P[a].vp) || (V.estateFilled(G.P[b]) - V.estateFilled(G.P[a])) || (G.P[a].pos - G.P[b].pos) || (G.P[a].arr - G.P[b].arr); });   /* tie: fewer empty spaces, then the one further back on the track */
    G.winner = G.rank[0];
    G.log.push({ k: 'over', winner: G.winner });
  }
  V.forceEnd = function (G) { G.pend = []; finalScore(G); };
  V.estateFilled = function (p) { return Object.keys(p.estate).length; };

  /* ---------- invariants + text ---------- */
  V.checkInvariants = function (G) {
    var n = G.bag.length + (G.bagB ? G.bagB.length : 0) + (G.discard || 0), ids = {};
    function seen(t, where) { if (!t) return null; if (ids[t.id]) return 'dup ' + t.id + ' ' + where; ids[t.id] = 1; return null; }
    for (var d = 1; d <= 6; d++) G.depots[d].forEach(function (t) { if (t) n++; });
    G.black.forEach(function (t) { if (t) n++; });
    G.P.forEach(function (p) { n += p.store.length; for (var k in p.estate) if (!p.estate[k].home) n++; });
    var bad = [];
    G.P.forEach(function (p, i) {
      if (p.workers < 0) bad.push('workers<0 ' + i); if (p.silver < 0) bad.push('silver<0 ' + i);
      if (p.store.length > V.cap(p) && !(G.pend.length && G.pend[G.pend.length - 1].t === 'discard' && V.actor(G) === i)) bad.push('store>cap ' + i);
      if (V.goodsTypes(p).length > 3) bad.push('goods types>3 ' + i);
      for (var k in p.estate) { var t = p.estate[k]; if (CELLS[k].col !== t.t) bad.push('colour ' + k); }
    });
    return bad;
  };
  V.text = function (G) {
    var a = V.actor(G), out = ['Season ' + (G.phase + 1) + ' round ' + (G.round + 1) + (G.over ? ' OVER' : ' actor ' + a) + ' white ' + G.white];
    G.P.forEach(function (p, i) { out.push(i + ': vp ' + p.vp + ' silver ' + p.silver + ' wk ' + p.workers + ' dice ' + p.dice + ' used ' + p.used + ' store ' + p.store.map(V.tileName).join('/') + ' land ' + V.estateFilled(p)); });
    if (G.pend.length) out.push('pending ' + JSON.stringify(G.pend));
    return out.join('\n');
  };
  V.clone = function (G) { return JSON.parse(JSON.stringify(G)); };
})(VB);

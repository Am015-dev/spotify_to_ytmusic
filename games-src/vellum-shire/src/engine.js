// Vellum Shire engine: all state is one JSON-safe object G (no functions). 2 players, 5 chapters x 5 rounds.
// Moves: {t:'take',die,v,w,st,tile,disc} {t:'place',die,v,w,s,h} {t:'sell',die,v,w} {t:'work',die} {t:'buy',st,tile,disc}
//        {t:'ship',st,st2} {t:'grab',st,tile,disc} {t:'skip'} {t:'end'}. die: 0/1 = your dice, -1 = keep's free action, -2 = granary/guildhall.
var VSE = (function () {
  var V = (typeof VS !== 'undefined') ? VS : require('./data.js');
  function rng(G) { var t = (G.rng += 0x6D2B79F5) | 0; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  function d6(G) { return 1 + Math.floor(rng(G) * 6); }
  function shuffle(G, a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng(G) * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function T(id) { return V.TILES[id]; }
  function has(P, k) { return P.lore.some(function (n) { return V.LORE[n].k === k; }); }
  function newGame(o) {
    o = o || {};
    var G = { v: 1, seed: o.seed >>> 0 || 1, rng: (o.seed >>> 0) || 1, ph: 0, rd: 0, over: false, first: o.first || 0,
      stack: { K: [], B: [], Q: [], T: [], F: [], L: [] }, ink: [], gone: [], piles: [], roundGoods: [], supply: [], unused: [],
      st: {}, blk: [], white: 0, p: [], order: [], ti: 0, pend: [], seal: {}, hc: 2, ev: [], log: [], turnNo: 0, names: o.names || ['You', 'Rival'] };
    V.TILES.forEach(function (t) { if (t.ink) G.ink.push(t.id); else G.stack[t.col].push(t.id); });
    V.COLS.forEach(function (c) { shuffle(G, G.stack[c]); G.seal[c] = [-1, -1]; });
    shuffle(G, G.ink);
    var goods = []; for (var d = 1; d <= 6; d++) for (var k = 0; k < V.PARTS.goodsPerKind; k++) goods.push(d);
    shuffle(G, goods);
    for (var ph = 0; ph < 5; ph++) G.piles.push(goods.splice(0, 5));
    G.supply = goods; // 17 face-down goods: start goods come from here
    for (var n = 1; n <= 6; n++) G.st[n] = { t: [], g: [] };
    for (var s = 0; s < 2; s++) {
      var P = { est: [], sto: [null, null, null], goods: [], sold: [0, 0, 0, 0, 0, 0, 0], silver: 1, wk: 0, vp: 0, dice: [0, 0], used: [1, 1], bought: false, trk: 0, trkH: 0, lore: [], seals: [], log: [] };
      for (var i = 0; i < 37; i++) P.est.push(null);
      P.est[V.START] = G.stack.K.pop(); // start keep (no effect, no points)
      for (var g = 0; g < 3; g++) addGoods(P, G.supply.pop());
      G.p.push(P);
    }
    var f = G.first, o2 = 1 - f;
    G.p[f].wk = 1; G.p[o2].wk = 2; G.p[f].trkH = 2; G.p[o2].trkH = 1;
    G.unused = G.supply; G.supply = []; // the rest of the 17 are not used
    if (o.setup) o.setup(G);
    setupPhase(G); startRound(G);
    return G;
  }
  function addGoods(P, d) { // returns true if it fit (max 3 kinds)
    var e = P.goods.filter(function (x) { return x.d === d; })[0];
    if (e) { e.n++; return true; }
    if (P.goods.length >= 3) return false;
    P.goods.push({ d: d, n: 1 }); return true;
  }
  function setupPhase(G) {
    for (var n = 1; n <= 6; n++) { G.st[n].t.forEach(function (id) { G.gone.push(id); }); G.st[n].t = []; }
    G.blk.forEach(function (id) { G.gone.push(id); }); G.blk = [];
    for (n = 1; n <= 6; n++) V.STALL_COLS[n].forEach(function (c) { var id = G.stack[c].pop(); if (id != null) G.st[n].t.push(id); });
    for (var i = 0; i < V.BLACK_PER_PHASE; i++) { var id = G.ink.pop(); if (id != null) G.blk.push(id); }
    G.roundGoods = G.piles[G.ph].slice(); G.piles[G.ph] = [];
    G.ev.push({ e: 'phase', ph: G.ph });
  }
  function orderOf(G) { return [0, 1].sort(function (a, b) { return (G.p[b].trk - G.p[a].trk) || (G.p[b].trkH - G.p[a].trkH); }); }
  function startRound(G) {
    G.order = orderOf(G); G.ti = 0;
    G.white = d6(G);
    var gd = G.roundGoods.shift();
    if (gd != null) G.st[G.white].g.push(gd);
    G.ev.push({ e: 'round', ph: G.ph, rd: G.rd, white: G.white, goods: gd });
    G.p.forEach(function (P) { P.dice = [d6(G), d6(G)]; P.used = [0, 0]; P.bought = false; });
    G.ev.push({ e: 'turn', s: G.order[0] });
  }
  function side(G) { return G.over ? -1 : G.order[G.ti]; }
  function dist(a, b) { var d = Math.abs(a - b); return Math.min(d, 6 - d); }
  // workers needed to turn die value raw into v for an action (kind: take/place/sell/work, col: tile colour for place)
  function cost(P, raw, v, kind, col) {
    var free = 0;
    if (kind === 'take' && has(P, 'adjTake')) free = 1;
    if (kind === 'place' && ((col === 'T' && has(P, 'adjT')) || ((col === 'B' || col === 'F') && has(P, 'adjBF')) || ((col === 'K' || col === 'Q' || col === 'L') && has(P, 'adjKQL')))) free = 1;
    var need = Math.max(0, dist(raw, v) - free), step = has(P, 'work2') ? 2 : 1;
    return Math.ceil(need / step);
  }
  function region(h) { return V.REGIONS[V.REG_OF[h]]; }
  function canPlaceAt(G, s, id, h, anyDie, v) {
    var P = G.p[s], t = T(id), hx = V.HEX[h];
    if (P.est[h] != null || hx.col !== t.col) return false;
    if (!anyDie && hx.d !== v) return false;
    if (!hx.nb.some(function (n) { return P.est[n] != null; })) return false;
    if (t.col === 'T' && !has(P, 'anyb')) { if (region(h).cells.some(function (c) { return P.est[c] != null && T(P.est[c]).k === t.k; })) return false; }
    return true;
  }
  function freeSlot(P) { return P.sto.indexOf(null); }
  function takeVariants(P, base) { // storage full -> one move per slot to drop
    if (freeSlot(P) >= 0) return [base];
    return [0, 1, 2].map(function (k) { var m = Object.assign({}, base); m.disc = k; return m; });
  }
  function dieActions(G, s, die, raw, anyV, out) {
    var P = G.p[s], v, c, n;
    var wk = P.wk, push = function (m) { out.push(m); };
    for (v = 1; v <= 6; v++) {
      // take from stall v
      c = anyV ? 0 : cost(P, raw, v, 'take');
      if (c <= wk) G.st[v].t.forEach(function (id) { takeVariants(P, { t: 'take', die: die, v: v, w: c, st: v, tile: id }).forEach(push); });
      // sell goods v
      c = anyV ? 0 : cost(P, raw, v, 'sell');
      if (c <= wk && P.goods.some(function (x) { return x.d === v; })) push({ t: 'sell', die: die, v: v, w: c });
    }
    // place from storage
    P.sto.forEach(function (id, sl) {
      if (id == null) return;
      for (var h = 0; h < 37; h++) {
        var hx = V.HEX[h]; if (hx.col !== T(id).col) continue;
        var cc = anyV ? 0 : cost(P, raw, hx.d, 'place', hx.col);
        if (cc > wk) continue;
        if (canPlaceAt(G, s, id, h, true, 0)) push({ t: 'place', die: die, v: hx.d, w: cc, s: sl, h: h });
      }
    });
    push({ t: 'work', die: die, v: raw, w: 0 });
  }
  function buyMoves(G, s, out) {
    var P = G.p[s];
    if (P.bought || P.silver < 2) return;
    G.blk.forEach(function (id) { takeVariants(P, { t: 'buy', st: 0, tile: id }).forEach(function (m) { out.push(m); }); });
    if (has(P, 'buyall')) for (var n = 1; n <= 6; n++) G.st[n].t.forEach(function (id) { takeVariants(P, { t: 'buy', st: n, tile: id }).forEach(function (m) { out.push(m); }); });
  }
  function validMoves(G) {
    if (G.over) return [];
    var s = side(G), P = G.p[s], out = [];
    var pd = G.pend[G.pend.length - 1];
    if (pd) {
      if (pd.h === 'free') { dieActions(G, s, -1, 0, true, out); }
      else if (pd.h === 'ship') {
        for (var n = 1; n <= 6; n++) {
          if (G.st[n].g.length) out.push({ t: 'ship', st: n });
          if (has(P, 'ship2')) { var n2 = n % 6 + 1; if (G.st[n].g.length || G.st[n2].g.length) out.push({ t: 'ship', st: n, st2: n2 }); }
        }
      } else if (pd.h === 'grab') {
        for (n = 1; n <= 6; n++) G.st[n].t.forEach(function (id) { if (pd.cols.indexOf(T(id).col) >= 0) takeVariants(P, { t: 'grab', st: n, tile: id }).forEach(function (m) { out.push(m); }); });
      } else if (pd.h === 'hall') {
        P.sto.forEach(function (id, sl) { if (id == null) return; for (var h = 0; h < 37; h++) if (canPlaceAt(G, s, id, h, true, 0)) out.push({ t: 'place', die: -2, v: V.HEX[h].d, w: 0, s: sl, h: h }); });
      } else if (pd.h === 'ware') {
        P.goods.forEach(function (x) { out.push({ t: 'sell', die: -2, v: x.d, w: 0 }); });
      }
      out.push({ t: 'skip' });
      return out;
    }
    [0, 1].forEach(function (i) { if (!P.used[i]) dieActions(G, s, i, P.dice[i], false, out); });
    buyMoves(G, s, out);
    if (P.used[0] && P.used[1]) out.push({ t: 'end' });
    return out;
  }
  function same(a, b) { return a.t === b.t && a.die === b.die && a.v === b.v && a.st === b.st && a.st2 === b.st2 && a.tile === b.tile && a.disc === b.disc && a.s === b.s && a.h === b.h; }
  function isLegal(G, m) { return validMoves(G).some(function (x) { return same(x, m); }); }
  function ev(G, o) { G.ev.push(o); }
  function gain(G, s, vp, why) { if (!vp) return; G.p[s].vp += vp; ev(G, { e: 'vp', s: s, n: vp, why: why }); }
  function toStorage(G, s, id, disc) {
    var P = G.p[s], k = freeSlot(P);
    if (k < 0) { G.gone.push(P.sto[disc]); ev(G, { e: 'drop', s: s, tile: P.sto[disc], slot: disc }); P.sto[disc] = null; k = disc; }
    P.sto[k] = id; return k;
  }
  function fromStall(G, n, id) { var a = n === 0 ? G.blk : G.st[n].t; a.splice(a.indexOf(id), 1); }
  function useDie(G, s, m) {
    var P = G.p[s];
    if (m.die >= 0) { P.used[m.die] = 1; if (m.w) { P.wk -= m.w; ev(G, { e: 'workers', s: s, n: -m.w }); } }
    else if (m.die === -1) G.pend.pop(); // the keep's free action is spent
  }
  function sell(G, s, d) {
    var P = G.p[s], e = P.goods.filter(function (x) { return x.d === d; })[0]; if (!e) return;
    P.goods.splice(P.goods.indexOf(e), 1); P.sold[d] += e.n;
    gain(G, s, e.n * V.SELL_VP, 'sell');
    var sv = has(P, 'sell2') ? 2 : 1; P.silver += sv;
    if (has(P, 'sellw')) P.wk += 1;
    ev(G, { e: 'sell', s: s, d: d, n: e.n, silver: sv });
  }
  function place(G, s, sl, h) {
    var P = G.p[s], id = P.sto[sl], t = T(id);
    P.sto[sl] = null; P.est[h] = id;
    ev(G, { e: 'place', s: s, tile: id, h: h });
    var reg = region(h);
    if (reg.cells.every(function (c) { return P.est[c] != null; })) {
      gain(G, s, V.SIZE_PTS[reg.cells.length] + V.PHASE_BONUS[G.ph], 'region');
      ev(G, { e: 'region', s: s, reg: reg.id, n: V.SIZE_PTS[reg.cells.length], bonus: V.PHASE_BONUS[G.ph] });
    }
    var all = V.HEX.filter(function (x) { return x.col === t.col; });
    if (all.every(function (x) { return P.est[x.i] != null; })) {
      var sl2 = G.seal[t.col];
      if (sl2[0] < 0) { sl2[0] = s; P.seals.push(t.col + 'L'); gain(G, s, V.BIG_BONUS, 'seal'); ev(G, { e: 'seal', s: s, col: t.col, big: 1 }); }
      else if (sl2[1] < 0 && sl2[0] !== s) { sl2[1] = s; P.seals.push(t.col + 'S'); gain(G, s, V.SMALL_BONUS, 'seal'); ev(G, { e: 'seal', s: s, col: t.col, big: 0 }); }
    }
    if (t.col === 'K') G.pend.push({ h: 'free' });
    else if (t.col === 'B') {
      P.trk += 1; P.trkH = ++G.hc; ev(G, { e: 'track', s: s });
      if ([1, 2, 3, 4, 5, 6].some(function (n) { return G.st[n].g.length; })) G.pend.push({ h: 'ship' });
    } else if (t.col === 'F') {
      var others = reg.cells.filter(function (c) { return c !== h && P.est[c] != null && T(P.est[c]).k === t.k; });
      var pts = t.a + others.reduce(function (a, c) { return a + T(P.est[c]).a; }, 0);
      if (has(P, 'animal1')) pts += 1 + others.length;
      gain(G, s, pts, 'animal');
    } else if (t.col === 'L') P.lore.push(t.a);
    else if (t.col === 'T') {
      var k = t.k;
      if (k === 'belltower') gain(G, s, 4, 'tower');
      else if (k === 'hostel') { P.wk += 4; ev(G, { e: 'workers', s: s, n: 4 }); }
      else if (k === 'counting') { P.silver += 2; ev(G, { e: 'silver', s: s, n: 2 }); }
      else if (k === 'granary') { if (P.goods.length) G.pend.push({ h: 'ware' }); }
      else if (k === 'guildhall') { if (P.sto.some(function (x, sl3) { return x != null && V.HEX.some(function (hx) { return canPlaceAt(G, s, x, hx.i, true, 0); }); })) G.pend.push({ h: 'hall' }); }
      else { var cols = { joinery: ['T'], chapel: ['K', 'Q', 'L'], fair: ['B', 'F'] }[k];
        if ([1, 2, 3, 4, 5, 6].some(function (n) { return G.st[n].t.some(function (id2) { return cols.indexOf(T(id2).col) >= 0; }); })) G.pend.push({ h: 'grab', cols: cols }); }
    }
  }
  function loadShip(G, s, n) {
    var P = G.p[s], g = G.st[n].g; if (!g.length) return;
    var counts = {}; g.forEach(function (d) { counts[d] = (counts[d] || 0) + 1; });
    var kinds = Object.keys(counts).map(Number).sort(function (a, b) { var ha = P.goods.some(function (x) { return x.d === a; }) ? 1 : 0, hb = P.goods.some(function (x) { return x.d === b; }) ? 1 : 0; return (hb - ha) || (counts[b] - counts[a]) || (a - b); });
    var left = [], got = 0;
    kinds.forEach(function (d) { for (var i = 0; i < counts[d]; i++) { if (addGoods(P, d)) got++; else left.push(d); } });
    G.st[n].g = left;
    ev(G, { e: 'load', s: s, st: n, n: got });
  }
  function apply(G, m) {
    G.ev = [];
    if (!isLegal(G, m)) return { ok: false };
    var s = side(G), P = G.p[s], pd = G.pend[G.pend.length - 1];
    G.p[s].log.push(m.t);
    switch (m.t) {
      case 'take': useDie(G, s, m); fromStall(G, m.st, m.tile); var sl = toStorage(G, s, m.tile, m.disc); ev(G, { e: 'take', s: s, st: m.st, tile: m.tile, slot: sl }); break;
      case 'place': if (m.die === -2) G.pend.pop(); else useDie(G, s, m); place(G, s, m.s, m.h); break;
      case 'sell': if (m.die === -2) G.pend.pop(); else useDie(G, s, m); sell(G, s, m.v); break;
      case 'work': useDie(G, s, m); var n = has(P, 'work4') ? 4 : 2; P.wk += n; ev(G, { e: 'workers', s: s, n: n }); if (has(P, 'work1s')) { P.silver += 1; ev(G, { e: 'silver', s: s, n: 1 }); } break;
      case 'buy': P.bought = true; P.silver -= 2; fromStall(G, m.st, m.tile); sl = toStorage(G, s, m.tile, m.disc); ev(G, { e: 'buy', s: s, st: m.st, tile: m.tile, slot: sl }); break;
      case 'ship': G.pend.pop(); loadShip(G, s, m.st); if (m.st2) loadShip(G, s, m.st2); break;
      case 'grab': G.pend.pop(); fromStall(G, m.st, m.tile); sl = toStorage(G, s, m.tile, m.disc); ev(G, { e: 'take', s: s, st: m.st, tile: m.tile, slot: sl }); break;
      case 'skip': G.pend.pop(); break;
      case 'end': nextTurn(G); return { ok: true };
    }
    settle(G);
    return { ok: true };
  }
  function settle(G) { // automatic steps: drop pendings with no option, end a finished turn
    for (var guard = 0; guard < 20; guard++) {
      var pd = G.pend[G.pend.length - 1];
      if (pd && validMoves(G).length === 1) { G.pend.pop(); continue; } // only "skip" left
      if (pd) return;
      var s = side(G), P = G.p[s];
      if (P.used[0] && P.used[1]) {
        var bm = []; buyMoves(G, s, bm);
        if (!bm.length) { nextTurn(G); }
      }
      return;
    }
  }
  function nextTurn(G) {
    G.turnNo++;
    G.ti++;
    if (G.ti < G.order.length) { ev(G, { e: 'turn', s: G.order[G.ti] }); return; }
    G.rd++;
    if (G.rd >= 5) {
      G.p.forEach(function (P, s) {
        var q = P.est.filter(function (id) { return id != null && T(id).col === 'Q'; }).length;
        if (q) { P.silver += q; ev(G, { e: 'silver', s: s, n: q, why: 'quarry' }); if (has(P, 'minew')) P.wk += q; }
      });
      G.rd = 0; G.ph++;
      if (G.ph >= 5) { G.ph = 4; G.rd = 4; finish(G); return; }
      setupPhase(G);
    }
    startRound(G);
  }
  function final(G, s) {
    var P = G.p[s], r = { vp: P.vp, goods: 0, silver: P.silver, workers: Math.floor(P.wk / 2), lore: 0 };
    P.goods.forEach(function (x) { r.goods += x.n; });
    P.lore.forEach(function (n) {
      var k = V.LORE[n].k;
      if (k === 'endKinds') r.lore += 3 * P.sold.filter(function (x) { return x > 0; }).length;
      else if (k.indexOf('endB:') === 0) { var b = k.slice(5); r.lore += 4 * P.est.filter(function (id) { return id != null && T(id).k === b; }).length; }
      else if (k === 'endAnim') r.lore += 4 * V.AKEYS.filter(function (a) { return P.est.some(function (id) { return id != null && T(id).k === a; }); }).length;
      else if (k === 'endSold') r.lore += P.sold.reduce(function (a, b) { return a + b; }, 0);
      else if (k === 'endBonus') r.lore += 2 * P.seals.length;
    });
    r.total = r.vp + r.goods + r.silver + r.workers + r.lore;
    r.empty = P.est.filter(function (x) { return x == null; }).length;
    return r;
  }
  function finish(G) {
    G.over = true;
    G.final = [final(G, 0), final(G, 1)];
    var a = G.final[0], b = G.final[1];
    if (a.total !== b.total) G.winner = a.total > b.total ? 0 : 1;
    else if (a.empty !== b.empty) G.winner = a.empty > b.empty ? 0 : 1; // tie: more empty spaces wins
    else G.winner = G.order[G.order.length - 1]; // then the later in turn order
    ev(G, { e: 'over', winner: G.winner });
  }
  function clone(G) { return JSON.parse(JSON.stringify(G)); }
  function countTiles(G) {
    var n = 0, seen = {};
    var addId = function (id) { if (id == null) return; n++; if (seen[id]) throw new Error('tile twice ' + id); seen[id] = 1; };
    V.COLS.forEach(function (c) { G.stack[c].forEach(addId); }); G.ink.forEach(addId); G.gone.forEach(addId); G.blk.forEach(addId);
    for (var k = 1; k <= 6; k++) G.st[k].t.forEach(addId);
    G.p.forEach(function (P) { P.est.forEach(addId); P.sto.forEach(addId); });
    return n;
  }
  function countGoods(G) {
    var n = G.unused.length + G.roundGoods.length;
    G.piles.forEach(function (p) { n += p.length; });
    for (var k = 1; k <= 6; k++) n += G.st[k].g.length;
    G.p.forEach(function (P) { P.goods.forEach(function (x) { n += x.n; }); n += P.sold.reduce(function (a, b) { return a + b; }, 0); });
    return n;
  }
  function checkInvariants(G) {
    var e = [];
    try { if (countTiles(G) !== 164) e.push('tiles ' + countTiles(G)); } catch (x) { e.push(x.message); }
    if (countGoods(G) !== 42) e.push('goods ' + countGoods(G));
    G.p.forEach(function (P, s) {
      if (P.goods.length > 3) e.push('goods kinds ' + s);
      if (P.wk < 0 || P.silver < 0) e.push('negative ' + s);
      P.est.forEach(function (id, h) { if (id != null && T(id).col !== V.HEX[h].col) e.push('colour ' + s + ' ' + h); });
      for (var k = 1; k <= 6; k++) if (G.st[k].t.length > 2) e.push('stall overfull ' + k);
    });
    return e;
  }
  return { newGame: newGame, validMoves: validMoves, apply: apply, side: side, cost: cost, canPlaceAt: canPlaceAt, final: final, clone: clone, checkInvariants: checkInvariants,
    has: has, region: region, same: same, isLegal: isLegal, dist: dist, orderOf: orderOf, loadShip: loadShip, countTiles: countTiles, countGoods: countGoods, rng: rng };
})();
if (typeof module !== 'undefined') module.exports = VSE;

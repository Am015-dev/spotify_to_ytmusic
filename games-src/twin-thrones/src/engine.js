// Twin Thrones rules engine. State G is JSON-safe. (FLAG: none)
var TT = (typeof TT !== 'undefined') ? TT : {};
(function () {
  var D = (typeof require !== 'undefined' && typeof module !== 'undefined') ? require('./data.js') : TT;
  var RES = D.RES;
  var DRAFT_ORDER = [0, 1, 1, 0, 1, 0, 0, 1];
  function rnd(G) { var a = G.rs = (G.rs + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  function shuffle(G, a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd(G) * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function clone(G) { return JSON.parse(JSON.stringify(G)); }
  function other(p) { return 1 - p; }
  function C(id) { return D.BYID[id]; }

  function newGame(o) {
    o = o || {};
    var G = { rs: (o.seed == null ? (Date.now() & 0x7fffffff) : o.seed) | 0, age: 0, turn: 0, phase: 'draft', over: false, winner: null, reason: '', pend: [], ev: [], log: [], again: false, lastTaker: 0,
      players: [0, 1].map(function () { return { coins: 7, cards: [], wonders: [], tokens: [], pairs: [] }; }),
      mil: 0, loot: [[0, 0], [0, 0]], discard: [], pyr: [], decks: {}, tokensUp: [], tokensBox: [], draft: { n: 0, avail: [], pool: [] }, built: 0 };
    var wl = shuffle(G, D.WONDERS.map(function (w) { return w.id; })).slice(0, 8);
    G.draft.pool = wl; G.draft.avail = wl.slice(0, 4);
    var tk = shuffle(G, D.TOKENS.map(function (t) { return t.id; }));
    G.tokensUp = tk.slice(0, 5); G.tokensBox = tk.slice(5);
    [1, 2].forEach(function (a) { G.decks[a] = shuffle(G, D.CARDS.filter(function (c) { return c.age === a; }).map(function (c) { return c.id; })).slice(0, 20); });
    var a3 = shuffle(G, D.CARDS.filter(function (c) { return c.age === 3 && c.col !== 'purple'; }).map(function (c) { return c.id; })).slice(0, 17);
    var gl = shuffle(G, D.CARDS.filter(function (c) { return c.col === 'purple'; }).map(function (c) { return c.id; })).slice(0, 3);
    G.decks[3] = shuffle(G, a3.concat(gl));
    G.firstSeat = o.first != null ? o.first : rnd(G) < 0.5 ? 0 : 1; // random first player: picks the first wonder and opens Age I (W492)
    return G;
  }
  function sideToAct(G) {
    if (G.over) return null;
    if (G.pend.length) return G.pend[0].pl;
    if (G.phase === 'draft') return DRAFT_ORDER[G.draft.n] ^ (G.firstSeat | 0);
    return G.turn;
  }
  // ---- city queries
  function cardsOf(G, p) { return G.players[p].cards.map(C); }
  function hasTok(G, p, id) { return G.players[p].tokens.indexOf(id) >= 0; }
  function builtWonders(G, p) { return G.players[p].wonders.filter(function (w) { return w.card; }); }
  function count(G, p, col) { if (col === 'wonder') return builtWonders(G, p).length; return cardsOf(G, p).filter(function (c) { return c.col === col; }).length; }
  function ownsSym(G, p, sym) { return cardsOf(G, p).some(function (c) { return c.gives === sym; }); }
  function sciCounts(G, p) {
    var m = {}; cardsOf(G, p).forEach(function (c) { if (c.sci) m[c.sci] = (m[c.sci] || 0) + 1; });
    G.players[p].tokens.forEach(function (t) { var d = C(t); if (d.sci) m[d.sci] = (m[d.sci] || 0) + 1; }); return m;
  }
  // fixed production from brown/grey cards (what the rival sees when pricing trades)
  function fixedProd(G, p) { var m = {}; cardsOf(G, p).forEach(function (c) { if (c.prod) for (var r in c.prod) m[r] = (m[r] || 0) + c.prod[r]; }); return m; }
  function choiceProd(G, p) {
    var L = []; cardsOf(G, p).forEach(function (c) { if (c.choice) L.push(c.choice); });
    builtWonders(G, p).forEach(function (w) { var d = C(w.id); if (d.choice) L.push(d.choice); }); return L;
  }
  function unitPrice(G, p, r) {
    if (cardsOf(G, p).some(function (c) { return c.price && c.price.indexOf(r) >= 0; })) return 1;
    return 2 + (fixedProd(G, other(p))[r] || 0);
  }
  // cheapest way to pay `cost` (object) for player p. kind: 'card'|'blue'|'wonder'. returns {coins,trade} (coins = total coins needed)
  function payFor(G, p, cost, kind) {
    var base = {}; RES.forEach(function (r) { if (cost[r]) base[r] = cost[r]; });
    var disc = (kind === 'wonder' && hasTok(G, p, 't-architecture')) || (kind === 'blue' && hasTok(G, p, 't-masonry'));
    var variants = [base];
    if (disc) {
      var cur = [base];
      for (var k = 0; k < 2; k++) {
        var nx = [];
        cur.forEach(function (b) { var any = false; RES.forEach(function (r) { if (b[r] > 0) { any = true; var n = Object.assign({}, b); n[r]--; nx.push(n); } }); if (!any) nx.push(b); });
        cur = nx;
      }
      variants = cur;
    }
    var fp = fixedProd(G, p), ch = choiceProd(G, p), best = null;
    variants.forEach(function (b) {
      var need = {}; RES.forEach(function (r) { var n = (b[r] || 0) - (fp[r] || 0); if (n > 0) need[r] = n; });
      var types = Object.keys(need);
      var minTrade = null;
      (function rec(i, nd) {
        if (i === ch.length) { var t = 0; for (var r in nd) if (nd[r] > 0) t += nd[r] * unitPrice(G, p, r); if (minTrade == null || t < minTrade) minTrade = t; return; }
        rec(i + 1, nd);
        ch[i].forEach(function (r) { if (nd[r] > 0) { var n2 = Object.assign({}, nd); n2[r]--; rec(i + 1, n2); } });
      })(0, need);
      if (best == null || minTrade < best) best = minTrade;
    });
    return { trade: best, coins: (cost.coin || 0) + best };
  }
  function buildInfo(G, p, c) {
    var chain = !!(c.from && ownsSym(G, p, c.from));
    if (chain) return { ok: true, chain: true, coins: 0, trade: 0 };
    var f = payFor(G, p, c.cost, c.col === 'blue' ? 'blue' : 'card');
    return { ok: f.coins <= G.players[p].coins, chain: false, coins: f.coins, trade: f.trade };
  }
  function wonderInfo(G, p, w) { var f = payFor(G, p, C(w).cost, 'wonder'); return { ok: f.coins <= G.players[p].coins, coins: f.coins, trade: f.trade }; }
  function discardGain(G, p) { return 2 + count(G, p, 'yellow'); }

  // ---- pyramid
  function covered(G, cell) {
    return G.pyr.some(function (o) { return !o.taken && o.r === cell.r + 1 && Math.abs(o.x - cell.x) === 1; });
  }
  function available(G) { return G.pyr.filter(function (c) { return !c.taken && !covered(G, c); }); }
  function startAge(G, a) {
    G.age = a; G.pyr = []; var ids = G.decks[a].slice(), n = 0;
    D.LAYOUT[a].forEach(function (row, r) { row.xs.forEach(function (x) { G.pyr.push({ i: n, r: r, x: x, id: ids[n], up: row.up ? 1 : 0, taken: 0 }); n++; }); });
    G.ev.push({ t: 'age', age: a });
  }
  // ---- effects
  function milMove(G, p, n) {
    G.ev.push({ t: 'mil', p: p, n: n });
    G.mil = Math.max(-9, Math.min(9, G.mil + (p === 0 ? n : -n)));
    var d = p === 0 ? G.mil : -G.mil;
    [[3, 2], [6, 5]].forEach(function (z, i) {
      if (d >= z[0] && !G.loot[p][i]) { G.loot[p][i] = 1; var o = other(p), lost = Math.min(z[1], G.players[o].coins); G.players[o].coins -= lost; G.ev.push({ t: 'loot', p: o, n: lost }); }
    });
    if (d >= 9) win(G, p, 'military');
  }
  function win(G, p, why) { if (G.over) return; G.over = true; G.winner = p; G.reason = why; G.ev.push({ t: 'end', winner: p, reason: why }); }
  function addCoins(G, p, n) { G.players[p].coins = Math.max(0, G.players[p].coins + n); }
  function checkSci(G, p, sym) {
    var m = sciCounts(G, p), P = G.players[p];
    if (sym && m[sym] === 2 && P.pairs.indexOf(sym) < 0 && sym !== 'law') {
      P.pairs.push(sym); if (G.tokensUp.length) G.pend.push({ type: 'token', pl: p, from: 'up' });
    }
    if (Object.keys(m).length >= 6) win(G, p, 'science');
  }
  function gainCard(G, p, c, chain) {
    G.players[p].cards.push(c.id);
    if (c.coin) addCoins(G, p, c.coin);
    if (chain && hasTok(G, p, 't-urbanism')) addCoins(G, p, 4);
    if (c.perCol) addCoins(G, p, c.perCol.coin * c.perCol.cols.reduce(function (s, k) { return s + count(G, p, k); }, 0));
    if (c.perWonder) addCoins(G, p, c.perWonder * count(G, p, 'wonder'));
    if (c.guild && c.guild.coin) { var g = c.guild; addCoins(G, p, g.coin * Math.max(guildCount(G, 0, g), guildCount(G, 1, g))); }
    if (c.shields) milMove(G, p, c.shields + (hasTok(G, p, 't-strategy') ? 1 : 0));
    if (c.sci && !G.over) checkSci(G, p, c.sci);
  }
  function guildCount(G, p, g) {
    if (g.per3) return Math.floor(G.players[p].coins / 3);
    return g.cols.reduce(function (s, k) { return s + count(G, p, k); }, 0);
  }
  function takeCell(G, i) {
    var cell = G.pyr[i]; cell.taken = 1; var before = G.pyr.filter(function (o) { return !o.up && !o.taken && !covered(G, o); });
    before.forEach(function (o) { o.up = 1; G.ev.push({ t: 'flip', i: o.i }); });
  }
  function endMove(G, again) { if (G.over) return; G.again = !!again; if (G.pend.length) return; finishTurn(G); }
  function finishTurn(G) {
    if (G.over || G.pend.length) return;
    var ag = G.again; G.again = false;
    if (!G.pyr.some(function (c) { return !c.taken; })) { endAge(G); return; }
    if (!ag) G.turn = other(G.turn);
  }
  function endAge(G) {
    if (G.age >= 3) { finish(G); return; }
    // the player who is behind on the military track picks who starts; at a tie the player who took the last card picks (W391)
    var chooser = G.mil > 0 ? 1 : G.mil < 0 ? 0 : G.lastTaker;
    startAge(G, G.age + 1);
    G.pend.push({ type: 'first', pl: chooser });
  }
  function milVP(G, p) { var d = p === 0 ? G.mil : -G.mil; return d >= 6 ? 10 : d >= 3 ? 5 : d >= 1 ? 2 : 0; }
  function score(G, p) {
    var P = G.players[p], s = { blue: 0, green: 0, yellow: 0, guild: 0, wonder: 0, token: 0, coins: 0, mil: 0 };
    cardsOf(G, p).forEach(function (c) {
      if (c.col === 'purple') { var g = c.guild; s.guild += (g.per3 ? Math.max(guildCount(G, 0, g), guildCount(G, 1, g)) : g.vp * Math.max(guildCount(G, 0, g), guildCount(G, 1, g))); }
      else if (c.vp) s[c.col] = (s[c.col] || 0) + c.vp;
    });
    builtWonders(G, p).forEach(function (w) { s.wonder += C(w.id).vp || 0; });
    P.tokens.forEach(function (t) { var d = C(t); s.token += d.vp || 0; if (t === 't-mathematics') s.token += 3 * P.tokens.length; });
    s.coins = Math.floor(P.coins / 3); s.mil = milVP(G, p);
    s.total = s.blue + s.green + s.yellow + s.guild + s.wonder + s.token + s.coins + s.mil; return s;
  }
  function finish(G) {
    var a = score(G, 0), b = score(G, 1); G.final = [a, b]; G.over = true;
    if (a.total !== b.total) { G.winner = a.total > b.total ? 0 : 1; G.reason = 'points'; }
    else if (a.blue !== b.blue) { G.winner = a.blue > b.blue ? 0 : 1; G.reason = 'tiebreak'; }
    else { G.winner = -1; G.reason = 'draw'; }
    G.ev.push({ t: 'end', winner: G.winner, reason: G.reason });
  }
  // ---- moves
  function validMoves(G) {
    var p = sideToAct(G), M = [];
    if (p == null) return M;
    if (G.pend.length) {
      var pd = G.pend[0];
      if (pd.type === 'first') { M.push({ t: 'first', who: p }, { t: 'first', who: other(p) }); }
      else if (pd.type === 'token') (pd.from === 'lib' ? pd.list : G.tokensUp).forEach(function (id) { M.push({ t: 'token', id: id }); });
      else if (pd.type === 'destroy') pd.list.forEach(function (id) { M.push({ t: 'destroy', id: id }); });
      else if (pd.type === 'revive') G.discard.forEach(function (id) { M.push({ t: 'revive', id: id }); });
      return M;
    }
    if (G.phase === 'draft') { G.draft.avail.forEach(function (w) { M.push({ t: 'pick', w: w }); }); return M; }
    var P = G.players[p];
    available(G).forEach(function (cell) {
      if (cell.id == null) return; var c = C(cell.id);
      if (buildInfo(G, p, c).ok) M.push({ t: 'build', i: cell.i });
      M.push({ t: 'discard', i: cell.i });
      if (G.built < 7) P.wonders.forEach(function (w) { if (!w.card && wonderInfo(G, p, w.id).ok) M.push({ t: 'wonder', i: cell.i, w: w.id }); });
    });
    return M;
  }
  function apply(G, m) {
    G.ev = []; var p = sideToAct(G), P = p != null ? G.players[p] : null;
    if (G.over) return G;
    if (m.t === 'pick') {
      var k = G.draft.avail.indexOf(m.w); if (k < 0) throw new Error('bad pick');
      G.draft.avail.splice(k, 1); P.wonders.push({ id: m.w, card: null }); G.draft.n++; G.ev.push({ t: 'pick', p: p, w: m.w });
      if (G.draft.avail.length === 1) { var lp = DRAFT_ORDER[G.draft.n] ^ (G.firstSeat | 0), lw = G.draft.avail.pop(); G.players[lp].wonders.push({ id: lw, card: null }); G.draft.n++; G.ev.push({ t: 'pick', p: lp, w: lw, auto: 1 }); } // the last wonder of a group goes to its player without a choice (W492)
      if (G.draft.n === 4) G.draft.avail = G.draft.pool.slice(4, 8);
      if (G.draft.n >= 8) { G.phase = 'play'; startAge(G, 1); G.turn = G.firstSeat | 0; } // the player who picked the first wonder opens Age I
      return G;
    }
    if (m.t === 'first') { G.turn = m.who; G.pend.shift(); G.ev.push({ t: 'first', who: m.who }); return G; }
    if (m.t === 'token') {
      var pd = G.pend[0], ok = pd.from === 'lib' ? pd.list.indexOf(m.id) >= 0 : G.tokensUp.indexOf(m.id) >= 0; if (!ok) throw new Error('bad token');
      if (pd.from !== 'lib') G.tokensUp.splice(G.tokensUp.indexOf(m.id), 1); else G.tokensBox.splice(G.tokensBox.indexOf(m.id), 1);
      P.tokens.push(m.id); G.pend.shift(); G.ev.push({ t: 'token', p: p, id: m.id });
      var d = C(m.id); if (d.coin) addCoins(G, p, d.coin); if (d.sci) checkSci(G, p, null);
      endMoveAfterPend(G); return G;
    }
    if (m.t === 'destroy') {
      var o = other(p), L = G.players[o].cards; L.splice(L.indexOf(m.id), 1); G.discard.push(m.id); G.pend.shift(); G.ev.push({ t: 'destroy', p: o, id: m.id });
      endMoveAfterPend(G); return G;
    }
    if (m.t === 'revive') {
      var j = G.discard.indexOf(m.id); G.discard.splice(j, 1); G.pend.shift(); G.ev.push({ t: 'revive', p: p, id: m.id });
      gainCard(G, p, C(m.id), false); endMoveAfterPend(G); return G;
    }
    // board moves
    var cell = G.pyr[m.i], c = C(cell.id); G.lastTaker = p;
    var again = false;
    if (m.t === 'discard') {
      var g = discardGain(G, p); addCoins(G, p, g); G.discard.push(c.id); takeCell(G, m.i); G.ev.push({ t: 'discard', p: p, id: c.id, i: m.i, n: g });
    } else if (m.t === 'build') {
      var bi = buildInfo(G, p, c); if (!bi.ok) throw new Error('cannot afford');
      addCoins(G, p, -bi.coins); if (bi.trade && hasTok(G, other(p), 't-economy')) addCoins(G, other(p), bi.trade);
      G.ev.push({ t: 'build', p: p, id: c.id, i: m.i, paid: bi.coins, chain: bi.chain }); takeCell(G, m.i); gainCard(G, p, c, bi.chain);
    } else if (m.t === 'wonder') {
      var wi = wonderInfo(G, p, m.w); if (!wi.ok || G.built >= 7) throw new Error('cannot wonder');
      var w = P.wonders.filter(function (x) { return x.id === m.w; })[0]; if (!w || w.card) throw new Error('bad wonder');
      addCoins(G, p, -wi.coins); if (wi.trade && hasTok(G, other(p), 't-economy')) addCoins(G, other(p), wi.trade);
      w.card = c.id; G.built++; takeCell(G, m.i); G.ev.push({ t: 'wonder', p: p, w: m.w, id: c.id, i: m.i, paid: wi.coins });
      var d = C(m.w);
      if (d.coin) addCoins(G, p, d.coin);
      if (d.steal) { var o2 = other(p); G.players[o2].coins = Math.max(0, G.players[o2].coins - d.steal); }
      if (d.shields) milMove(G, p, d.shields + (hasTok(G, p, 't-strategy') ? 0 : 0));
      if (d.again || hasTok(G, p, 't-theology')) again = true;
      if (d.destroy && !G.over) { var lst = G.players[other(p)].cards.filter(function (id) { return C(id).col === d.destroy; }); if (lst.length) G.pend.push({ type: 'destroy', pl: p, list: lst }); }
      if (d.revive && G.discard.length && !G.over) G.pend.push({ type: 'revive', pl: p });
      if (d.library && !G.over && G.tokensBox.length) { var lib = shuffle(G, G.tokensBox).slice(0, 3); G.pend.push({ type: 'token', pl: p, from: 'lib', list: lib }); }
      if (G.built >= 7) { G.ev.push({ t: 'wondersClosed' }); }
    } else throw new Error('bad move ' + m.t);
    endMove(G, again); return G;
  }
  function endMoveAfterPend(G) { finishTurn(G); }
  // masked copy for AI/search: hidden pyramid cards and future decks are unknown
  function mask(G) { var g = clone(G); g.decks = {}; g.pyr.forEach(function (c) { if (!c.up) c.id = null; }); g.tokensBox = []; return g; }
  function checkInvariants(G) {
    var e = [], seen = {};
    function see(id, w) { if (id == null) return; if (seen[id]) e.push('dup ' + id + ' ' + w + '/' + seen[id]); seen[id] = w; }
    G.players.forEach(function (P, p) { P.cards.forEach(function (id) { see(id, 'city' + p); }); P.wonders.forEach(function (w) { if (w.card) see(w.card, 'wond' + p); }); if (P.coins < 0) e.push('neg coins'); });
    G.discard.forEach(function (id) { see(id, 'disc'); }); G.pyr.forEach(function (c) { if (c.taken && c.id != null) { } });
    var tk = {}; G.players.forEach(function (P) { P.tokens.forEach(function (t) { if (tk[t]) e.push('dup token ' + t); tk[t] = 1; }); });
    G.tokensUp.forEach(function (t) { if (tk[t]) e.push('token both'); });
    if (Math.abs(G.mil) > 9) e.push('mil range'); if (G.built > 7) e.push('wonders>7');
    if (G.phase === 'play' && !G.over && !G.pend.length && sideToAct(G) != null && !validMoves(G).length) e.push('stuck');
    return e;
  }
  TT.E = { newGame: newGame, clone: clone, sideToAct: sideToAct, validMoves: validMoves, apply: apply, performMove: function (G, m) { return apply(G, m); }, mask: mask, score: score, buildInfo: buildInfo, wonderInfo: wonderInfo, discardGain: discardGain, available: available, covered: covered,
    count: count, fixedProd: fixedProd, choiceProd: choiceProd, sciCounts: sciCounts, ownsSym: ownsSym, hasTok: hasTok, builtWonders: builtWonders, checkInvariants: checkInvariants, other: other, C: C, milVP: milVP, guildCount: guildCount, unitPrice: unitPrice, payFor: payFor, rnd: rnd };
  if (typeof module !== 'undefined') module.exports = TT.E;
})();

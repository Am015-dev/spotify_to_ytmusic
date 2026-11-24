// Onyx Atelier rules engine. State G is JSON-safe (no functions). Every rule of the original duel, one for one. (FLAG: none)
var OE = (function () {
  var COLS = ['w', 'u', 'g', 'r', 'k'];            // gem colours: diamond, sapphire, emerald, ruby, onyx
  var TOK = ['w', 'u', 'g', 'r', 'k', 'p', 'o'];   // + pearl, gold
  var D = (typeof OD !== 'undefined') ? OD : require('./data.js');
  var CARDS = D.CARDS, ROYALS = D.ROYALS, SPIRAL = D.SPIRAL;
  var WIN = { pts: 20, crowns: 10, colour: 10 }, HAND = 10, RES = 3;

  function rnd(G) { var t = (G.seed = (G.seed + 0x6D2B79F5) | 0); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  function shuffle(G, a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd(G) * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function clone(G) { return JSON.parse(JSON.stringify(G)); }
  function other(i) { return 1 - i; }
  function cnt() { var o = {}; TOK.forEach(function (c) { o[c] = 0; }); return o; }

  function newGame(seed, first) {
    var G = { seed: (seed >>> 0) || 1, turn: first || 0, first: first || 0, bag: [], board: [], decks: [[], [], []], pyr: [[], [], []],
      royals: ROYALS.map(function (r) { return r.id; }), fav: 3, pl: [], pend: null, q: [], again: false, over: null, n: 0, log: [], last: null };
    COLS.forEach(function (c) { for (var i = 0; i < D.COUNTS.gem; i++) G.bag.push(c); });
    for (var i = 0; i < D.COUNTS.pearl; i++) G.bag.push('p');
    for (i = 0; i < D.COUNTS.gold; i++) G.bag.push('o');
    shuffle(G, G.bag);
    for (i = 0; i < 25; i++) G.board.push(null);
    fill(G);
    CARDS.forEach(function (c) { G.decks[c.lvl - 1].push(c.id); });
    G.decks.forEach(function (d) { shuffle(G, d); });
    [5, 4, 3].forEach(function (n, l) { for (var k = 0; k < n; k++) G.pyr[l].push(G.decks[l].pop()); });
    for (i = 0; i < 2; i++) G.pl.push({ t: cnt(), cards: [], att: {}, res: [], fav: 0, roy: [] });
    gainFav(G, other(G.first));   // the second player starts with one privilege
    return G;
  }
  // bag -> board, spiral from the centre, empty spaces only
  function fill(G) { for (var i = 0; i < SPIRAL.length && G.bag.length; i++) { var s = SPIRAL[i]; if (G.board[s] === null) G.board[s] = G.bag.pop(); } }
  function gainFav(G, p) {
    var me = G.pl[p], op = G.pl[other(p)];
    if (G.fav > 0) { G.fav--; me.fav++; return 'supply'; }
    if (op.fav > 0) { op.fav--; me.fav++; return 'rival'; }
    return null;
  }
  function card(id) { return CARDS[id]; }
  function colourOf(P, id) { var c = card(id); return c.b === 'x' ? (P.att[id] || null) : c.b; }
  function bonus(P, col) { var n = 0; P.cards.forEach(function (id) { if (colourOf(P, id) === col) n += card(id).n; }); return n; }
  function bonuses(P) { var o = {}; COLS.forEach(function (c) { o[c] = bonus(P, c); }); return o; }
  function crowns(P) { var n = 0; P.cards.forEach(function (id) { n += card(id).cr; }); return n; }
  function points(P) { var n = 0; P.cards.forEach(function (id) { n += card(id).pts; }); P.roy.forEach(function (id) { n += ROYALS[id].pts; }); return n; }
  function colourPts(P, col) { var n = 0; P.cards.forEach(function (id) { if (colourOf(P, id) === col) n += card(id).pts; }); return n; }
  function bestColour(P) { var b = COLS[0], v = -1; COLS.forEach(function (c) { var x = colourPts(P, c); if (x > v) { v = x; b = c; } }); return { c: b, v: v }; }
  function tokens(P) { var n = 0; TOK.forEach(function (c) { n += P.t[c]; }); return n; }
  function hasColoured(P) { return P.cards.some(function (id) { var b = card(id).b; return b && b !== 'x'; }); }
  // what buying costs: {ok, pay:{colour:n}, gold:n}
  function price(P, id) {
    var c = card(id), pay = {}, short = 0;
    if (c.b === 'x' && !hasColoured(P)) return { ok: false, why: 'wild' };
    ['w', 'u', 'g', 'r', 'k', 'p'].forEach(function (k) {
      var need = Math.max(0, (c.c[k] || 0) - (k === 'p' ? 0 : bonus(P, k)));
      var use = Math.min(need, P.t[k]); if (use) pay[k] = use; short += need - use;
    });
    return { ok: short <= P.t.o, pay: pay, gold: short, short: Math.max(0, short - P.t.o) };
  }
  function lines() {   // every straight run of 1-3 board spaces (rows, columns, both diagonals)
    if (lines.c) return lines.c;
    var out = [], dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
    for (var r = 0; r < 5; r++) for (var c = 0; c < 5; c++) {
      out.push([r * 5 + c]);
      dirs.forEach(function (d) {
        for (var len = 2; len <= 3; len++) { var run = [], ok = true;
          for (var k = 0; k < len; k++) { var rr = r + d[0] * k, cc = c + d[1] * k; if (rr < 0 || rr > 4 || cc < 0 || cc > 4) { ok = false; break; } run.push(rr * 5 + cc); }
          if (ok) out.push(run); }
      });
    }
    return (lines.c = out);
  }
  function canTake(G, cells) { return cells.every(function (s) { var t = G.board[s]; return t && t !== 'o'; }); }
  function slots(G) { var o = []; G.pyr.forEach(function (row, l) { row.forEach(function (id, i) { if (id !== null && id !== undefined) o.push({ l: l, i: i, id: id }); }); }); return o; }

  function sideToAct(G) { return G.over ? -1 : G.turn; }
  function mandatory(G) {
    var P = G.pl[G.turn], out = [];
    lines().forEach(function (run) { if (canTake(G, run)) out.push({ t: 'take', cells: run.slice() }); });
    if (P.res.length < RES) {
      G.board.forEach(function (t, s) {
        if (t !== 'o') return;
        slots(G).forEach(function (x) { out.push({ t: 'reserve', gold: s, l: x.l, i: x.i }); });
        G.decks.forEach(function (d, l) { if (d.length) out.push({ t: 'reserve', gold: s, l: l, deck: true }); });
      });
    }
    slots(G).forEach(function (x) { if (price(P, x.id).ok) out.push({ t: 'buy', l: x.l, i: x.i }); });
    P.res.forEach(function (id, i) { if (price(P, id).ok) out.push({ t: 'buy', res: i }); });
    return out;
  }
  function validMoves(G) {
    if (G.over) return [];
    var P = G.pl[G.turn], O = G.pl[other(G.turn)], q = G.pend, out = [];
    if (q) {
      if (q.h === 'wild') COLS.forEach(function (c) { if (P.cards.some(function (id) { return card(id).b === c; })) out.push({ t: 'wild', c: c }); });
      else if (q.h === 'tok') G.board.forEach(function (t, s) { if (t === q.c) out.push({ t: 'tok', cell: s }); });
      else if (q.h === 'steal') ['w', 'u', 'g', 'r', 'k', 'p'].forEach(function (c) { if (O.t[c] > 0) out.push({ t: 'steal', c: c }); });
      else if (q.h === 'royal') G.royals.forEach(function (id) { out.push({ t: 'royal', id: id }); });
      else if (q.h === 'disc') TOK.forEach(function (c) { if (P.t[c] > 0) out.push({ t: 'disc', c: c }); });
      return out;
    }
    var man = mandatory(G);
    if (P.fav > 0 && !G.refilled) G.board.forEach(function (t, s) { if (t && t !== 'o') out.push({ t: 'fav', cell: s }); });
    if (G.bag.length) out.push({ t: 'refill' });
    if (man.length) return out.concat(man);
    if (!G.bag.length && !out.length) out.push({ t: 'pass' });   // nothing at all is possible (never seen in play)
    return out;
  }
  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
  function legal(G, m) { return validMoves(G).some(function (x) { return same(x, m); }); }
  function log(G, s) { G.log.push(s); if (G.log.length > 80) G.log.shift(); }

  function takeCard(G, l, i) { var id = G.pyr[l][i]; G.pyr[l][i] = G.decks[l].length ? G.decks[l].pop() : null; return id; }
  function performMove(G, m) {
    if (!legal(G, m)) throw new Error('illegal move ' + JSON.stringify(m));
    var p = G.turn, P = G.pl[p], O = G.pl[other(p)], ev = { p: p, m: m };
    G.last = ev;
    if (m.t === 'fav') { P.fav--; G.fav++; ev.got = G.board[m.cell]; P.t[ev.got]++; G.board[m.cell] = null; log(G, p + ' fav ' + ev.got); return ev; }
    if (m.t === 'refill') { var placed = G.bag.length; fill(G); G.refilled = true; ev.placed = placed; ev.fav = gainFav(G, other(p)); log(G, p + ' refill'); return ev; }
    if (m.t === 'take') {
      ev.got = m.cells.map(function (s) { var t = G.board[s]; G.board[s] = null; P.t[t]++; return t; });
      var pearls = ev.got.filter(function (t) { return t === 'p'; }).length;
      var three = ev.got.length === 3 && ev.got[0] === ev.got[1] && ev.got[1] === ev.got[2];
      if (three || pearls >= 2) ev.fav = gainFav(G, other(p));
      log(G, p + ' take ' + ev.got.join(''));
      return endAction(G, ev);
    }
    if (m.t === 'reserve') {
      G.board[m.gold] = null; P.t.o++;
      var id = m.deck ? G.decks[m.l].pop() : takeCard(G, m.l, m.i);
      P.res.push(id); ev.id = id; log(G, p + ' reserve ' + id);
      return endAction(G, ev);
    }
    if (m.t === 'buy') {
      var cid = m.res !== undefined ? P.res[m.res] : G.pyr[m.l][m.i];
      var pr = price(P, cid);
      Object.keys(pr.pay).forEach(function (k) { P.t[k] -= pr.pay[k]; for (var n = 0; n < pr.pay[k]; n++) G.bag.push(k); });
      P.t.o -= pr.gold; for (var n2 = 0; n2 < pr.gold; n2++) G.bag.push('o');
      if (m.res !== undefined) P.res.splice(m.res, 1); else takeCard(G, m.l, m.i);
      P.cards.push(cid); ev.id = cid; ev.pay = pr;
      var c = card(cid);
      if (c.b === 'x') G.q.push({ h: 'wild', id: cid });
      if (c.ab) G.q.push({ h: c.ab, id: cid });
      log(G, p + ' buy ' + cid);
      return endAction(G, ev);
    }
    if (m.t === 'pass') { log(G, p + ' pass'); return endAction(G, ev); }
    // answers to a pending question
    var q = G.pend; G.pend = null;
    if (m.t === 'wild') { P.att[q.id] = m.c; }
    else if (m.t === 'tok') { ev.got = G.board[m.cell]; P.t[ev.got]++; G.board[m.cell] = null; }
    else if (m.t === 'steal') { O.t[m.c]--; P.t[m.c]++; ev.got = m.c; }
    else if (m.t === 'royal') { G.royals.splice(G.royals.indexOf(m.id), 1); P.roy.push(m.id); var R = ROYALS[m.id]; if (R.ab) G.q.push({ h: R.ab, roy: m.id }); }
    else if (m.t === 'disc') { P.t[m.c]--; G.bag.push(m.c); }
    return resolve(G, ev);
  }
  function endAction(G, ev) { G.acted = true; return resolve(G, ev); }
  // work through queued abilities, royal choices, the 10-token limit, the win check, then the next turn
  function resolve(G, ev) {
    var p = G.turn, P = G.pl[p], O = G.pl[other(p)];
    while (G.q.length) {
      var it = G.q.shift();
      if (it.h === 'again') { G.again = true; continue; }
      if (it.h === 'priv') { gainFav(G, p); continue; }
      if (it.h === 'wild') { G.pend = it; return ev; }
      if (it.h === 'token') { var col = colourOf(P, it.id); if (G.board.some(function (t) { return t === col; })) { G.pend = { h: 'tok', c: col, id: it.id }; return ev; } continue; }
      if (it.h === 'steal') { if (['w', 'u', 'g', 'r', 'k', 'p'].some(function (c) { return O.t[c] > 0; })) { G.pend = { h: 'steal', id: it.id, roy: it.roy }; return ev; } continue; }
    }
    var cr = crowns(P);
    if (G.royals.length && ((cr >= 3 && P.roy.length < 1 && !P.rq1) || (cr >= 6 && P.roy.length < 2 && !P.rq2))) {
      if (cr >= 3 && !P.rq1) P.rq1 = 1; else P.rq2 = 1;
      G.pend = { h: 'royal' }; return ev;
    }
    if (tokens(P) > HAND) { G.pend = { h: 'disc', n: tokens(P) - HAND }; return ev; }
    var w = winOf(P); if (w) { G.over = { winner: p, how: w }; log(G, p + ' wins ' + w); return ev; }
    G.acted = false; G.refilled = false; G.n++;
    if (G.again) { G.again = false; ev.again = true; } else G.turn = other(p);
    return ev;
  }
  function winOf(P) {
    if (points(P) >= WIN.pts) return 'points';
    if (crowns(P) >= WIN.crowns) return 'crowns';
    if (COLS.some(function (c) { return colourPts(P, c) >= WIN.colour; })) return 'colour';
    return null;
  }
  function checkInvariants(G) {
    var n = cnt(); G.bag.forEach(function (t) { n[t]++; }); G.board.forEach(function (t) { if (t) n[t]++; });
    G.pl.forEach(function (P) { TOK.forEach(function (c) { if (P.t[c] < 0) throw new Error('negative ' + c); n[c] += P.t[c]; }); });
    COLS.forEach(function (c) { if (n[c] !== D.COUNTS.gem) throw new Error('gem count ' + c + ' ' + n[c]); });
    if (n.p !== D.COUNTS.pearl || n.o !== D.COUNTS.gold) throw new Error('pearl/gold count');
    var f = G.fav + G.pl[0].fav + G.pl[1].fav; if (f !== 3) throw new Error('privileges ' + f);
    var seen = {}, all = [];
    G.decks.forEach(function (d) { all = all.concat(d); }); G.pyr.forEach(function (r) { r.forEach(function (x) { if (x !== null) all.push(x); }); });
    G.pl.forEach(function (P) { all = all.concat(P.cards, P.res); if (P.res.length > RES) throw new Error('reserve>3'); });
    all.forEach(function (x) { if (seen[x]) throw new Error('dup card ' + x); seen[x] = 1; });
    if (all.length !== CARDS.length) throw new Error('cards ' + all.length);
    if (G.royals.length + G.pl[0].roy.length + G.pl[1].roy.length !== ROYALS.length) throw new Error('royals');
    if (!G.pend && !G.over) G.pl.forEach(function (P, i) { if (i !== G.turn && tokens(P) > HAND) throw new Error('hand>10'); });
    return true;
  }
  return { COLS: COLS, TOK: TOK, WIN: WIN, newGame: newGame, validMoves: validMoves, performMove: performMove, sideToAct: sideToAct, legal: legal, clone: clone,
    price: price, bonus: bonus, bonuses: bonuses, crowns: crowns, points: points, colourPts: colourPts, bestColour: bestColour, tokens: tokens, colourOf: colourOf,
    card: card, lines: lines, checkInvariants: checkInvariants, winOf: winOf, mandatory: mandatory, fill: fill, gainFav: gainFav, hasColoured: hasColoured, rnd: rnd, shuffle: shuffle };
})();
if (typeof module !== 'undefined') module.exports = OE;

// Meadowfold rules engine. One JSON-safe state G (no functions). Valley boards are flat-top hex columns (short columns sit half a hex lower).
// Cell key "c,r" (column, row). Moves: take | place | card | cube | spirit | swap | end. See rules-notes.md for every rule.
var G = null;
var E = (function () {
  var DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];   // axial: SE, NE, N, NW, SW, S (card direction codes 0-5)
  function rnd() { return Math.random(); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  var CELLS = {};   // side -> {list:[key], ax:{key:[q,r]}, byAx:{"q,r":key}}
  function cells(side) {
    if (CELLS[side]) return CELLS[side];
    var o = { list: [], ax: {}, byAx: {}, pos: {} };
    MF.BOARDS[side].forEach(function (n, c) { for (var r = 0; r < n; r++) { var k = c + ',' + r, q = c, ar = r - (c - (c & 1)) / 2; o.list.push(k); o.ax[k] = [q, ar]; o.byAx[q + ',' + ar] = k; o.pos[k] = [c, r]; } });
    return (CELLS[side] = o);
  }
  function nb(side, k) { var C = cells(side), a = C.ax[k], out = []; DIRS.forEach(function (d) { var x = C.byAx[(a[0] + d[0]) + ',' + (a[1] + d[1])]; if (x) out.push(x); }); return out; }
  function step(side, k, d) { var C = cells(side), a = C.ax[k], dd = DIRS[((d % 6) + 6) % 6]; return C.byAx[(a[0] + dd[0]) + ',' + (a[1] + dd[1])] || null; }
  function card(id) { return id > 32 ? MF.SPIRITS[id - 33] : MF.CARDS[id - 1]; }
  function draw(n) {   // n random tokens from the pouch
    var out = [];
    for (var i = 0; i < n; i++) { var tot = 0, c; MF.COLS.forEach(function (x) { tot += G.bag[x]; }); if (!tot) break; var p = Math.floor(rnd() * tot); for (var j = 0; j < MF.COLS.length; j++) { c = MF.COLS[j]; if (p < G.bag[c]) break; p -= G.bag[c]; } G.bag[c]--; out.push(c); }
    return out;
  }
  function bagCount() { var t = 0; MF.COLS.forEach(function (x) { t += G.bag[x]; }); return t; }
  function log(s) { G.log.push(s); if (G.log.length > 60) G.log.shift(); }

  // o = {np, humans|seats:[{name, ai}], side:'A'|'B', spirits:bool, ai:'easy'|'normal'|'hard'}
  function newGame(o) {
    o = o || {};
    var np = o.np || 2, seats = [];
    for (var i = 0; i < np; i++) {
      var s = (o.seats && o.seats[i]) || {};
      seats.push({ name: s.name || (i === 0 ? 'You' : (np === 2 && !(o.humans > 1) ? 'Rival' : 'Player ' + (i + 1))), ai: s.ai !== undefined ? s.ai : (i < (o.humans == null ? 1 : o.humans) ? null : (o.ai || 'normal')),
        board: {}, cubes: {}, cards: [], done: [], spirit: null, offer: null, turns: 0 });
    }
    G = { v: 1, np: np, solo: np === 1, side: o.side || 'A', spirits: !!o.spirits, bag: Object.assign({}, MF.BAG), central: [], deck: [], row: [], box: 0,
      seats: seats, cur: 0, first: 0, turn: null, last: false, over: false, log: [], round: 1, result: null };
    var nsp = G.solo ? 3 : 5;
    for (i = 0; i < nsp; i++) G.central.push(draw(3));
    G.deck = shuffle(MF.CARDS.map(function (c) { return c.id; }));
    G.row = G.deck.splice(0, G.solo ? 3 : 5);
    if (G.spirits) { var sp = shuffle(MF.SPIRITS.map(function (c) { return c.id; })); seats.forEach(function (s) { s.offer = sp.splice(0, 2); }); }
    startTurn();
    return G;
  }
  function startTurn() { G.turn = { took: -1, hand: [], tookCard: false, swapped: false, placed: [] }; }
  function seat() { return G.seats[G.cur]; }
  function active(s) { return s.cards.length + (s.spirit && !s.spirit.placed ? 1 : 0); }
  function empties(s) { var C = cells(G.side), n = 0; C.list.forEach(function (k) { if (!(s.board[k] || []).length) n++; }); return n; }

  // ---- stacking ----
  function canStack(s, k, col) {
    if (s.cubes[k]) return false;
    var st = s.board[k] || [], h = st.length, top = st[h - 1];
    if (!h) return true;
    if (col === 'water' || col === 'field') return false;
    if (top === 'leaf' || top === 'water' || top === 'field') return false;
    if (col === 'build') return h === 1 && (top === 'mount' || top === 'trunk' || top === 'build');
    if (top === 'build') return false;
    if (col === 'mount') return top === 'mount' && h < 3;
    if (col === 'trunk') return h === 1 && top === 'trunk';
    if (col === 'leaf') return top === 'trunk' && h <= 2;
    if (col === 'build') return h === 1 && (top === 'mount' || top === 'trunk' || top === 'build');
    return false;
  }
  function spots(s, col) { return cells(G.side).list.filter(function (k) { return canStack(s, k, col); }); }

  // ---- habitats ----
  function shows(st, n) {
    st = st || []; var h = st.length, top = st[h - 1];
    if (n === 'water' || n === 'field') return h === 1 && top === n;
    if (n === 'build') return h === 2 && top === 'build';
    if (n.indexOf('mount') === 0) return h === +n[5] && st.every(function (x) { return x === 'mount'; });
    if (n.indexOf('tree') === 0) return h === +n[4] && top === 'leaf' && st.slice(0, -1).every(function (x) { return x === 'trunk'; });
    return false;
  }
  // every hex where this card's cube may go now (any rotation, no mirror), with the pattern hexes that prove it
  function cubeSpots(s, id) {
    var pat = card(id).pat, C = cells(G.side), out = {};
    C.list.forEach(function (o) {
      for (var rot = 0; rot < 6; rot++) {
        var k = o, ok = true, tgt = null, used = [];
        for (var i = 0; i < pat.length && ok; i++) {
          if (i) { k = step(G.side, k, pat[i].d + rot); if (!k) { ok = false; break; } }
          if (!shows(s.board[k], pat[i].n)) ok = false;
          used.push(k); if (pat[i].cube) tgt = k;
        }
        if (ok && tgt && !s.cubes[tgt] && !out[tgt]) out[tgt] = used;
      }
    });
    return out;
  }

  // ---- legal moves ----
  function moves() {
    if (!G || G.over) return [];
    var s = seat(), T = G.turn, out = [];
    if (s.offer) { s.offer.forEach(function (id, i) { out.push({ t: 'spirit', i: i }); }); return out; }
    if (T.took < 0) G.central.forEach(function (sp, i) { if (sp.length) out.push({ t: 'take', i: i }); });
    T.hand.forEach(function (c, h) { if (T.hand.indexOf(c) !== h) return; spots(s, c).forEach(function (k) { out.push({ t: 'place', h: h, k: k }); }); });
    if (!T.tookCard && !T.swapped && active(s) < 4) G.row.forEach(function (id, i) { out.push({ t: 'card', i: i }); });
    if (G.solo && !T.tookCard && !T.swapped && G.deck.length) G.row.forEach(function (id, i) { out.push({ t: 'swap', i: i }); });
    s.cards.forEach(function (c, ci) { Object.keys(cubeSpots(s, c.id)).forEach(function (k) { out.push({ t: 'cube', ci: ci, k: k }); }); });
    if (s.spirit && !s.spirit.placed) Object.keys(cubeSpots(s, s.spirit.id)).forEach(function (k) { out.push({ t: 'cube', ci: 'S', k: k }); });
    if (T.took >= 0 && !T.hand.length) out.push({ t: 'end' });
    // stuck guard: tokens in hand that fit nowhere (cannot happen with 3+ empty hexes, but the rules allow a full board) are returned to the box
    if (T.took >= 0 && T.hand.length && !out.some(function (m) { return m.t === 'place'; })) out.push({ t: 'end' });
    return out;
  }
  function legal(m) { return moves().some(function (x) { return x.t === m.t && x.i === m.i && x.h === m.h && x.k === m.k && x.ci === m.ci; }); }

  function apply(m) {
    if (!legal(m)) return false;
    var s = seat(), T = G.turn;
    if (m.t === 'spirit') { var id = s.offer[m.i]; s.spirit = { id: id, placed: false }; s.offer = null; log(s.name + ' keeps ' + card(id).name + '.'); return true; }
    if (m.t === 'take') { T.took = m.i; T.hand = G.central[m.i]; G.central[m.i] = []; log(s.name + ' takes pocket ' + (m.i + 1) + '.'); return true; }
    if (m.t === 'place') { var c = T.hand.splice(m.h, 1)[0]; (s.board[m.k] = s.board[m.k] || []).push(c); T.placed.push(m.k); return true; }
    if (m.t === 'card') { var cid = G.row.splice(m.i, 1)[0]; s.cards.push({ id: cid, left: card(cid).pts.length }); T.tookCard = true; log(s.name + ' takes ' + card(cid).name + '.'); return true; }
    if (m.t === 'swap') { G.row.splice(m.i, 1); G.row.splice(m.i, 0, G.deck.shift()); T.swapped = true; return true; }
    if (m.t === 'cube') {
      if (m.ci === 'S') { s.cubes[m.k] = 'S' + s.spirit.id; s.spirit.placed = true; log(s.name + ' settles ' + card(s.spirit.id).name + '.'); return true; }
      var cc = s.cards[m.ci]; s.cubes[m.k] = cc.id; cc.left--;
      if (!cc.left) { s.done.push(cc.id); s.cards.splice(m.ci, 1); log(s.name + ' completes ' + card(cc.id).name + '.'); }
      return true;
    }
    if (m.t === 'end') { if (T.hand.length) { G.box += T.hand.length; T.hand = []; } endTurn(); return true; }
    return false;
  }
  function endTurn() {
    var s = seat(), T = G.turn;
    s.turns++;
    if (G.solo) {   // the other two pockets go to the box; all three refill
      G.central.forEach(function (sp, i) { if (i !== T.took) G.box += sp.length; G.central[i] = []; });
      for (var i = 0; i < 3; i++) { if (!bagCount()) { G.last = true; break; } G.central[i] = draw(3); }
    } else { if (!bagCount()) G.last = true; else G.central[T.took] = draw(3); }
    while (G.row.length < (G.solo ? 3 : 5) && G.deck.length) G.row.push(G.deck.shift());
    if (empties(s) <= 2) G.last = true;
    G.cur = (G.cur + 1) % G.np;
    if (G.cur === G.first) G.round++;
    if (G.last && G.cur === G.first) return finish();
    startTurn();
  }

  // ---- scoring ----
  function groups(s, pred) {
    var C = cells(G.side), seen = {}, out = [];
    C.list.forEach(function (k) { if (seen[k] || !pred(k)) return; var g = [], q = [k]; seen[k] = 1; while (q.length) { var x = q.pop(); g.push(x); nb(G.side, x).forEach(function (y) { if (!seen[y] && pred(y)) { seen[y] = 1; q.push(y); } }); } out.push(g); });
    return out;
  }
  function top(s, k) { var st = s.board[k] || []; return st[st.length - 1]; }
  function isBuild(s, k) { var st = s.board[k] || []; return st.length === 2 && st[1] === 'build'; }
  function treeH(s, k) { return top(s, k) === 'leaf' ? s.board[k].length : 0; }
  function mountH(s, k) { return top(s, k) === 'mount' ? s.board[k].length : 0; }
  function river(s) {
    var best = 0, W = function (k) { return top(s, k) === 'water'; };
    groups(s, W).forEach(function (g) {
      g.forEach(function (a) { var d = {}, q = [a]; d[a] = 1; while (q.length) { var x = q.shift(); if (d[x] > best) best = d[x]; nb(G.side, x).forEach(function (y) { if (W(y) && !d[y]) { d[y] = d[x] + 1; q.push(y); } }); } });
    });
    return best;
  }
  function riverPts(n) { return n <= 6 ? MF.RIVER[n] : 15 + 4 * (n - 6); }
  function score(s) {
    var C = cells(G.side), o = { trees: 0, mounts: 0, fields: 0, builds: 0, water: 0, animals: 0, spirit: 0, total: 0, river: 0, islands: 0 };
    C.list.forEach(function (k) {
      var t = treeH(s, k); if (t) o.trees += [0, 1, 3, 7][t];
      var m = mountH(s, k); if (m && nb(G.side, k).some(function (y) { return mountH(s, y) > 0; })) o.mounts += [0, 1, 3, 7][m];
      if (isBuild(s, k)) { var cols = {}; nb(G.side, k).forEach(function (y) { var tp = top(s, y); if (tp) cols[tp] = 1; }); if (Object.keys(cols).length >= 3) o.builds += 5; }
    });
    o.fields = 5 * groups(s, function (k) { return top(s, k) === 'field'; }).filter(function (g) { return g.length >= 2; }).length;
    if (G.side === 'A') { o.river = river(s); o.water = riverPts(o.river); }
    else { o.islands = Math.max(1, groups(s, function (k) { return top(s, k) !== 'water'; }).length); o.water = 5 * o.islands; }
    s.cards.concat(s.done.map(function (id) { return { id: id, left: 0 }; })).forEach(function (c) { var p = card(c.id).pts, n = p.length - c.left; if (n > 0) o.animals += p[n - 1]; });
    if (s.spirit && s.spirit.placed) o.spirit = spiritPts(s, s.spirit.id);
    o.total = o.trees + o.mounts + o.fields + o.builds + o.water + o.animals + o.spirit;
    return o;
  }
  function cardPts(c) { var p = card(c.id).pts, n = p.length - c.left; return n > 0 ? p[n - 1] : 0; }
  function spiritPts(s, id) {
    var C = cells(G.side), k = card(id).sc, n = 0;
    var F = function (x) { return top(s, x) === 'field'; }, W = function (x) { return top(s, x) === 'water'; }, B = function (x) { return isBuild(s, x); };
    if (k === 'fieldsBig') groups(s, F).forEach(function (g) { n += g.length >= 3 ? 10 : 2; });
    if (k === 'fieldsAll') n = 5 * groups(s, F).length;
    if (k === 'buildGroups') n = 4 * groups(s, B).length;
    if (k === 'buildGroups2') n = 6 * groups(s, B).filter(function (g) { return g.length >= 2; }).length;
    if (k === 'waterGroups') n = 7 * groups(s, W).filter(function (g) { return g.length >= 2; }).length;
    C.list.forEach(function (x) {
      var t = treeH(s, x), m = mountH(s, x);
      if (k === 'trees23' && t >= 2) n += 4;
      if (k === 'trees331' && t) n += [0, 3, 3, 1][t];
      if (k === 'mount23' && m >= 2) n += 4;
      if (k === 'mount331' && m) n += [0, 3, 3, 1][m];
      if (k === 'waterEach' && W(x)) n += 2;
    });
    return n;
  }
  function cubesPlaced(s) { return Object.keys(s.cubes).filter(function (k) { return typeof s.cubes[k] === 'number'; }).length; }
  function suns(sc) {
    var n = 0; MF.SUNS.forEach(function (t) { if (sc.total >= t[0]) n = t[1]; });
    var s = G.seats[0], bonus = (G.side === 'A' ? 1 : 0);
    if (!s.spirit) bonus += 2; else if (/fields|build|waterGroups/.test(card(s.spirit.id).sc)) bonus += 1;
    return { base: n, bonus: bonus, total: n + bonus };
  }
  function finish() {
    G.over = true; G.turn = { took: -1, hand: [], tookCard: false, swapped: false, placed: [] };
    var res = G.seats.map(function (s, i) { var sc = score(s); return { i: i, sc: sc, total: sc.total, cubes: cubesPlaced(s) }; });
    var best = res.slice().sort(function (a, b) { return b.total - a.total || b.cubes - a.cubes; })[0];
    G.result = { scores: res, winners: res.filter(function (r) { return r.total === best.total && r.cubes === best.cubes; }).map(function (r) { return r.i; }) };
    if (G.solo) G.result.suns = suns(res[0].sc);
    log('The valley is finished.');
  }
  function check() {   // invariants: token conservation, stacking legality, card limits
    var n = bagCount() + G.box; G.central.forEach(function (sp) { n += sp.length; }); n += G.turn.hand.length;
    G.seats.forEach(function (s) { Object.keys(s.board).forEach(function (k) { n += s.board[k].length; }); });
    if (n !== 120) return 'token count ' + n;
    for (var i = 0; i < G.seats.length; i++) { var s = G.seats[i];
      if (s.cards.length + (s.spirit && !s.spirit.placed ? 1 : 0) > 4) return 'card limit';
      for (var k in s.board) { var st = s.board[k], ok = true, tmp = { board: {}, cubes: {} }; tmp.board[k] = []; st.forEach(function (c) { if (!canStack(tmp, k, c)) ok = false; tmp.board[k].push(c); }); if (!ok) return 'bad stack ' + k + ' ' + st; }
    }
    return null;
  }
  return { newGame: newGame, moves: moves, apply: apply, legal: legal, score: score, cardPts: cardPts, spiritPts: spiritPts, cubeSpots: cubeSpots, canStack: canStack, spots: spots, shows: shows,
    cells: cells, nb: nb, step: step, card: card, seat: seat, active: active, empties: empties, bagCount: bagCount, river: river, riverPts: riverPts, suns: suns, check: check, cubesPlaced: cubesPlaced, DIRS: DIRS };
})();

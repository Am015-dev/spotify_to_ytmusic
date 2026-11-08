/* Vinegrave rules engine. All state in one JSON-safe G. Node + page (window.VG).
   VG.newGame(o) · VG.moves(G) (for the seat to act) · VG.apply(G, m) -> {ok, err} · VG.actor(G) · VG.score(G, s) · VG.check(G) (invariants) · VG.text(G)
   Moves: play{i} dig{s} disc{s} beat{s} buy{r} res{k:'g'|'n'} temple{k} pass · free: boon{k} idol{k,sh} · answers to G.q: ans{v} */
(function (root) {
  var V = (typeof module !== 'undefined' && module.exports) ? require('./data.js') : root.VD;
  function rng(G) { var t = G.rng = (G.rng + 0x6D2B79F5) >>> 0; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  function shuf(G, a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng(G) * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function you(t) { return t.replace(/\bYou's\b/g, 'Your').replace(/\bYou (\w+)\b/g, function (m, w) { return 'You ' + (/(ss|sh|ch)es$/.test(w) ? w.slice(0, -2) : /s$/.test(w) && w !== 'was' ? w.slice(0, -1) : w); }); }
  function log(G, s, txt, k) { txt = you(txt); G.log.push({ r: G.round, s: s, t: txt }); if (G.log.length > 300) G.log.shift(); if (k) G.ev.push(Object.assign({ s: s }, k)); }
  function nm(G, s) { return s === -2 ? G.rival.name : G.p[s].name; }
  // ------------------------------------------------------------ setup
  function newGame(o) {
    o = o || {}; var np = o.np || 2, seats = o.seats || [];
    var G = { v: 1, rng: (o.seed == null ? Math.floor(Math.random() * 1e9) : o.seed) >>> 0, np: np, round: 1, rounds: o.rounds || V.ROUNDS, turn: 0, first: 0, phase: 'play', q: null,
      p: [], sites: [], row: [], items: [], arts: [], s1: [], s2: [], guards: [], idols: [], temple: V.TEMPLE.map(function (t) { return t.n; }), log: [], ev: [], winner: null, twist: o.twist || null, planeCost: 2, rival: null, turns: 0 };
    G.seed0 = G.rng; G.dread = V.DREAD_SUPPLY - 2 * np; G.firstTaken = {};
    for (var i = 0; i < np; i++) {
      var st = V.START[i] || V.START[3], sd = seats[i] || {};
      var p = { name: sd.name || (i ? 'Explorer ' + (i + 1) : 'You'), ai: sd.ai || null, res: { coin: st.coin, compass: st.compass, tablet: 0, arrow: 0, jewel: 0 },
        deck: shuf(G, ['dread', 'dread', 'grant', 'grant', 'trail', 'trail']), hand: [], play: [], disc: [], ex: V.EXPL, note: 0, glass: 0, guards: [], idols: [], temple: [], passed: false, idolTurn: false, exiled: [], fearTiles: 0 };
      G.p.push(p);
    }
    G.items = shuf(G, V.ITEMS.slice()); G.arts = shuf(G, V.ARTS.slice()); G.s1 = shuf(G, V.S1.slice()); G.s2 = shuf(G, V.S2.slice()); G.guards = shuf(G, V.GUARDS.slice()); G.idols = shuf(G, V.IDOLS.slice());
    V.CAMP.forEach(function (c) { G.sites.push({ id: c.id, lvl: 0, cost: c.cost.slice(), tile: c.id, occ: -1, guard: null }); });
    V.SLOT1.forEach(function (c) { G.sites.push({ id: 'l1-' + G.sites.length, lvl: 1, cost: c.slice(), tile: null, occ: -1, guard: null }); });
    V.SLOT2.forEach(function (c) { G.sites.push({ id: 'l2-' + G.sites.length, lvl: 2, cost: c.slice(), tile: null, occ: -1, guard: null }); });
    for (var r = 0; r < V.ROW; r++) G.row.push(null);
    refillRow(G);
    if (o.solo) { G.p[0].res.coin = 1; G.p[0].res.compass = 1; }   /* solo: you play second with 1 coin 1 compass */
    if (o.solo) G.rival = { name: o.rivalName || 'Rival expedition', lvl: o.rivalLevel || 'normal', vp: o.rivalLevel === 'hard' ? 2 : 0, rows: 0, deck: [], played: [], log: [] };
    applyTwist(G, o.twist, o);
    G.p.forEach(function (p) { draw(G, p, V.HAND); });
    if (G.rival) { rivalDeal(G); rivalTurn(G); }   /* the rival is the starting player every round */
    log(G, -1, 'Round 1 begins.');
    return G;
  }
  // campaign twists (only ever passed in by Story chapters); param = t.param
  function applyTwist(G, t, o) {
    if (!t) return; var n = t.param || 1, opp = [];
    for (var i = 1; i < G.np; i++) opp.push(G.p[i]);
    if (t.id === 'rich') opp.forEach(function (p) { p.res.coin += n; p.res.compass += n; });
    if (t.id === 'dread') for (var k = 0; k < n; k++) takeDread(G, 0, 'deck');
    if (t.id === 'head') opp.forEach(function (p) { p.glass = n; p.note = Math.max(0, n - 1); });
    if (t.id === 'short') G.rounds = Math.max(2, n);
    if (t.id === 'woken') { var l1 = G.sites.filter(function (s) { return s.lvl === 1; }); for (var j = 0; j < Math.min(n, l1.length); j++) { l1[j].tile = G.s1.pop(); l1[j].guard = G.guards.pop(); } }
    if (t.id === 'storm') G.planeCost = 2 + n;
    if (t.id === 'idols') opp.forEach(function (p) { for (var k2 = 0; k2 < n; k2++) if (G.idols.length) p.idols.push({ id: G.idols.pop(), used: false }); });
    if (t.id === 'shrewd' && G.rival) G.rival.vp += n * 3;
    if (G.rival && t.id === 'rich') G.rival.vp += n * 2;
  }
  function refillRow(G) {
    var nItems = Math.max(1, V.ROW - G.round);
    for (var r = 0; r < V.ROW; r++) if (!G.row[r]) { var src = r < nItems ? G.items : G.arts; if (src.length) G.row[r] = src.pop(); }
  }
  function draw(G, p, n) {
    var got = 0;
    for (var i = 0; i < n; i++) {
      if (!p.deck.length) { if (!p.disc.length) break; p.deck = shuf(G, p.disc); p.disc = []; }
      p.hand.push(p.deck.shift()); got++;
    }
    return got;
  }
  // ------------------------------------------------------------ helpers
  function has(p, cost) { for (var k in cost) if ((p.res[k] || 0) < cost[k]) return false; return true; }
  function pay(p, cost) { for (var k in cost) p.res[k] -= cost[k]; }
  function gain(p, g) { for (var k in g) p.res[k] = (p.res[k] || 0) + g[k]; }
  function card(id) { return V.CARDS[id]; }
  function cardCost(id) { var c = card(id); return c.t === 'item' ? { coin: c.cost } : { compass: c.cost }; }
  var CAN = { boot: ['boot', 'car', 'ship', 'plane'], car: ['car', 'plane'], ship: ['ship', 'plane'], plane: ['plane'] };   // which travel icons pay a need
  var CVAL = function (id) { var c = card(id); return c.t === 'fear' ? 0 : c.t === 'basic' ? 1 : 2 + (c.cost || 0) * 0.3; };
  // cheapest way to pay travel icons from hand cards (+ planes bought with coins). Returns {cards:[hand idx], coins} or null.
  function payPlan(G, s, need, skip) {
    var p = G.p[s], used = {}, coins = 0, cards = [];
    if (skip) skip.forEach(function (i) { used[i] = 1; });
    var order = need.slice().sort(function (a, b) { return CAN[a].length - CAN[b].length; });
    for (var n = 0; n < order.length; n++) {
      var best = -1, bv = 1e9;
      for (var i = 0; i < p.hand.length; i++) {
        if (used[i]) continue; var tr = card(p.hand[i]).tr; if (CAN[order[n]].indexOf(tr) < 0) continue;
        var v = CVAL(p.hand[i]) + (tr === order[n] ? 0 : 0.5) + (tr === 'plane' ? 1 : 0);
        if (v < bv) { bv = v; best = i; }
      }
      if (best >= 0) { used[best] = 1; cards.push(best); }
      else if (p.res.coin - coins >= G.planeCost) coins += G.planeCost;
      else return null;
    }
    return { cards: cards, coins: coins };
  }
  function spendTravel(G, s, plan) {
    var p = G.p[s]; plan.cards.slice().sort(function (a, b) { return b - a; }).forEach(function (i) { p.play.push(p.hand.splice(i, 1)[0]); });
    p.res.coin -= plan.coins;
  }
  function freeSite(G, s, i) { var x = G.sites[i]; return x && x.occ === -1 && (x.lvl === 0 || x.tile); }
  // ------------------------------------------------------------ whose turn
  function actor(G) { if (G.phase !== 'play') return -1; if (G.q) return G.q.seat; return G.turn; }
  // ------------------------------------------------------------ legal moves
  function moves(G) {
    var s = actor(G); if (s < 0) return []; var p = G.p[s], out = [];
    if (G.q) return answers(G, s);
    // free actions
    p.guards.forEach(function (g, k) { if (!g.used) out.push({ t: 'boon', k: k, free: true }); });
    if (p.idols.some(function (d) { return !d.used; }) && p.idols.filter(function (d) { return d.used; }).length < V.SLOTS)
      p.idols.forEach(function (d, k) { if (!d.used) V.SHRINE.forEach(function (sh, j) { out.push({ t: 'idol', k: k, sh: j, free: true }); }); });
    // main actions
    p.hand.forEach(function (id, i) { var c = card(id); if (c.t === 'fear') return; if (c.t === 'art' && p.res.tablet < 1) return; out.push(c.t === 'basic' ? { t: 'play', i: i, free: true } : { t: 'play', i: i }); });   /* rulebook: the starting coin / compass cards are free actions */
    if (p.ex > 0) G.sites.forEach(function (x, i) {
      if (x.occ !== -1) return;
      if (x.lvl === 0 || x.tile) { if (payPlan(G, s, x.cost)) out.push({ t: 'dig', s: i }); }
      else if (p.res.compass >= V.DISC[x.lvl] && (x.lvl === 1 ? G.s1 : G.s2).length) {
        var pl = payPlan(G, s, x.cost); if (pl && p.res.coin - pl.coins >= 0) out.push({ t: 'disc', s: i });
      }
    });
    G.sites.forEach(function (x, i) { if (x.occ === s && x.guard && has(p, V.GUARD[x.guard].cost)) out.push({ t: 'beat', s: i }); });
    G.row.forEach(function (id, r) { if (id && has(p, cardCost(id))) out.push({ t: 'buy', r: r }); });
    if (p.glass < V.TOP && has(p, V.TRACK[p.glass + 1].cost)) out.push({ t: 'res', k: 'g' });
    if (p.note < p.glass && p.note + 1 < V.TOP && has(p, V.TRACK[p.note + 1].cost)) out.push({ t: 'res', k: 'n' });
    if (p.glass >= V.TOP) V.TEMPLE.forEach(function (t, k) { if (G.temple[k] > 0 && has(p, t.cost)) out.push({ t: 'temple', k: k }); });
    out.push({ t: 'pass' });
    return out;
  }
  function answers(G, s) {
    var q = G.q, p = G.p[s], out = [];
    if (q.h === 'exile') { p.hand.forEach(function (id, i) { out.push({ t: 'ans', v: { z: 'hand', i: i } }); }); p.disc.forEach(function (id, i) { out.push({ t: 'ans', v: { z: 'disc', i: i } }); }); p.play.forEach(function (id, i) { out.push({ t: 'ans', v: { z: 'play', i: i } }); }); out.push({ t: 'ans', v: null }); }
    if (q.h === 'or') q.d.opts.forEach(function (o, i) { if (canOps(p, o)) out.push({ t: 'ans', v: i }); });
    if (q.h === 'buy') { G.row.forEach(function (id, r) { if (!id) return; var c = card(id); if ((q.d.k === 'i') !== (c.t === 'item')) return; var cost = cardCost(id), k = Object.keys(cost)[0], need = {}; need[k] = Math.max(0, cost[k] - q.d.o); if (has(p, need)) out.push({ t: 'ans', v: r }); }); out.push({ t: 'ans', v: null }); }
    if (q.h === 'site') { G.sites.forEach(function (x, i) { if (freeSite(G, s, i)) out.push({ t: 'ans', v: i }); }); out.push({ t: 'ans', v: null }); }
    return out;
  }
  function canOps(p, ops) { var need = {}; ops.forEach(function (o) { if (o.p) for (var k in o.p) need[k] = (need[k] || 0) + o.p[k]; }); return has(p, need); }
  // ------------------------------------------------------------ effects
  // run ops for seat s; stops at the first op that needs a choice (G.q). main = this is the turn's main action (turn ends when the ops are done)
  function runOps(G, s, ops, main) {
    var p = G.p[s];
    for (var i = 0; i < ops.length; i++) {
      var o = ops[i], rest = ops.slice(i + 1);
      if (o.g) { gain(p, o.g); log(G, s, nm(G, s) + ' gains ' + V.resText(o.g) + '.', { k: 'gain', g: o.g }); }
      else if (o.p) { if (!has(p, o.p)) return finishOps(G, s, main); pay(p, o.p); }
      else if (o.d) { var n = draw(G, p, o.d); log(G, s, nm(G, s) + ' draws ' + n + ' card' + (n === 1 ? '' : 's') + '.'); }
      else if (o.r) { stepFree(G, s, o.r); }
      else if (o.x) { if (p.hand.length || p.disc.length || p.play.length) { G.q = { h: 'exile', seat: s, ops: rest, main: main, d: {} }; return; } }
      else if (o.or) { G.q = { h: 'or', seat: s, ops: rest, main: main, d: { opts: o.or } }; if (!answers(G, s).length) { G.q = null; continue; } return; }
      else if (o.b) { G.q = { h: 'buy', seat: s, ops: rest, main: main, d: { k: o.b, o: o.o } }; if (answers(G, s).length <= 1) { G.q = null; continue; } return; }
      else if (o.fd) { if (p.ex > 0 && G.sites.some(function (x, j) { return freeSite(G, s, j); })) { G.q = { h: 'site', seat: s, ops: rest, main: main, d: {} }; return; } }
    }
    finishOps(G, s, main);
  }
  function finishOps(G, s, main) { G.q = null; if (main) endTurn(G); }
  function stepFree(G, s, k) {
    var p = G.p[s];
    if (k === 'g') { if (p.glass < V.TOP) { p.glass++; arrive(G, s, p.glass, 'magnifier'); } }
    else { if (p.note < p.glass && p.note + 1 < V.TOP) { p.note++; arrive(G, s, p.note, 'notebook'); } else if (p.glass < V.TOP) { p.glass++; arrive(G, s, p.glass, 'magnifier'); } }
  }
  function arrive(G, s, row, what) { if (row === V.TOP && what === 'magnifier') { G.templeOrder = G.templeOrder || []; if (G.templeOrder.indexOf(s) < 0) G.templeOrder.push(s); } var b = V.TRACK[row].bonus; gain(G.p[s], b); if (what === 'magnifier' && V.FIRST[row] && !(G.firstTaken || {})[row]) { G.firstTaken = G.firstTaken || {}; G.firstTaken[row] = s + 1; gain(G.p[s], V.FIRST[row]); log(G, s, nm(G, s) + ' is first to row ' + row + ': extra ' + V.resText(V.FIRST[row]) + '.', { k: 'first', row: row }); } log(G, s, nm(G, s) + '\'s ' + what + ' climbs to row ' + row + (row === V.TOP ? ' (the temple)' : '') + ': +' + V.resText(b) + '.', { k: 'research', row: row, what: what }); }
  function digSite(G, s, i) {
    var x = G.sites[i], p = G.p[s], site = V.SITE[x.tile];
    x.occ = s; p.ex--; gain(p, site.rew);
    log(G, s, nm(G, s) + ' digs at ' + site.name + ': +' + V.resText(site.rew) + '.', { k: 'dig', site: i, g: site.rew });
  }
  // ------------------------------------------------------------ apply
  function apply(G, m) {
    var s = actor(G); if (s < 0) return { ok: false, err: 'game over' };
    var legal = moves(G).some(function (x) { return same(x, m); });
    if (!legal) return { ok: false, err: 'illegal move ' + JSON.stringify(m) };
    G.ev = []; var p = G.p[s];
    if (m.t === 'ans') { answer(G, s, m.v); return { ok: true }; }
    if (m.t === 'boon') { var g = p.guards[m.k]; g.used = true; log(G, s, nm(G, s) + ' uses the boon of ' + V.GUARD[g.id].name + '.', { k: 'boon' }); runOps(G, s, V.GUARD[g.id].boon, false); return { ok: true }; }
    if (m.t === 'idol') { var d = p.idols[m.k], sh = V.SHRINE[m.sh]; d.used = true; p.idolTurn = true; log(G, s, nm(G, s) + ' sets the ' + V.IDOL[d.id].name + ' in a shrine: ' + sh.text + '.', { k: 'idol' }); runOps(G, s, sh.ops, false); return { ok: true }; }
    if (m.t === 'play' && card(p.hand[m.i]).t === 'basic') { var bid0 = p.hand.splice(m.i, 1)[0], b0 = card(bid0); p.play.push(bid0); log(G, s, nm(G, s) + ' plays ' + b0.name + ' (free).', { k: 'play', card: bid0, free: true }); runOps(G, s, b0.ops, false); return { ok: true }; }
    G.turns++;
    if (m.t === 'pass') { p.passed = true; log(G, s, nm(G, s) + ' passes.', { k: 'pass' }); endTurn(G, true); return { ok: true }; }
    if (m.t === 'play') {
      var id = p.hand.splice(m.i, 1)[0], c = card(id); p.play.push(id);
      if (c.t === 'art') p.res.tablet--;
      log(G, s, nm(G, s) + ' plays ' + c.name + (c.t === 'art' ? ' (1 tablet)' : '') + '.', { k: 'play', card: id });
      runOps(G, s, c.ops, true); return { ok: true };
    }
    if (m.t === 'dig') { var x = G.sites[m.s]; spendTravel(G, s, payPlan(G, s, x.cost)); digSite(G, s, m.s); endTurn(G); return { ok: true }; }
    if (m.t === 'disc') {
      var y = G.sites[m.s], pl = payPlan(G, s, y.cost); spendTravel(G, s, pl); p.res.compass -= V.DISC[y.lvl];
      y.tile = (y.lvl === 1 ? G.s1 : G.s2).pop(); p.found = (p.found || 0) + 1;
      log(G, s, nm(G, s) + ' discovers ' + V.SITE[y.tile].name + '!', { k: 'discover', site: m.s, tile: y.tile });
      if (G.idols.length) { var idl = G.idols.pop(); p.idols.push({ id: idl, used: false }); gain(p, V.IDOL[idl].gift); log(G, s, nm(G, s) + ' finds the ' + V.IDOL[idl].name + ': +' + V.resText(V.IDOL[idl].gift) + '.', { k: 'idolfind', idol: idl }); }
      digSite(G, s, m.s);
      if (G.guards.length) { y.guard = G.guards.pop(); log(G, s, V.GUARD[y.guard].name + ' wakes at ' + V.SITE[y.tile].name + '!', { k: 'guardian', site: m.s, guard: y.guard }); }
      endTurn(G); return { ok: true };
    }
    if (m.t === 'beat') { var z = G.sites[m.s], gd = V.GUARD[z.guard]; pay(p, gd.cost); p.guards.push({ id: z.guard, used: false }); log(G, s, nm(G, s) + ' overcomes ' + gd.name + '! +' + V.GUARD_VP + ' points and a boon.', { k: 'beat', site: m.s, guard: z.guard }); z.guard = null; endTurn(G); return { ok: true }; }
    if (m.t === 'buy') {
      var bid = G.row[m.r], bc = card(bid); pay(p, cardCost(bid)); G.row[m.r] = null; refillRow(G);
      if (bc.t === 'item') { p.deck.push(bid); log(G, s, nm(G, s) + ' buys ' + bc.name + ' (under the deck).', { k: 'buy', card: bid }); endTurn(G); }
      else { p.play.push(bid); log(G, s, nm(G, s) + ' takes the artifact ' + bc.name + ' and uses it at once.', { k: 'buy', card: bid }); runOps(G, s, bc.ops, true); }
      return { ok: true };
    }
    if (m.t === 'res') { var row = (m.k === 'g' ? p.glass : p.note) + 1; pay(p, V.TRACK[row].cost); if (m.k === 'g') p.glass = row; else p.note = row; arrive(G, s, row, m.k === 'g' ? 'magnifier' : 'notebook'); endTurn(G); return { ok: true }; }
    if (m.t === 'temple') { var tt = V.TEMPLE[m.k]; pay(p, tt.cost); G.temple[m.k]--; p.temple.push(tt.vp); log(G, s, nm(G, s) + ' claims a temple tile worth ' + tt.vp + '.', { k: 'temple', vp: tt.vp }); endTurn(G); return { ok: true }; }
    return { ok: false, err: 'unknown move' };
  }
  function answer(G, s, v) {
    var q = G.q, p = G.p[s], rest = q.ops, main = q.main; G.q = null;
    if (q.h === 'exile' && v) { var id = (v.z === 'hand' ? p.hand : v.z === 'play' ? p.play : p.disc).splice(v.i, 1)[0]; if (id === 'dread' && G.dread != null) G.dread++; else p.exiled.push(id); log(G, s, nm(G, s) + ' exiles ' + card(id).name + (id === 'dread' ? ' (back to the supply)' : '') + '.', { k: 'exile', card: id }); }
    if (q.h === 'or') { return runOps(G, s, q.d.opts[v].concat(rest), main); }
    if (q.h === 'buy' && v != null) {
      var bid = G.row[v], bc = card(bid), cost = cardCost(bid), k = Object.keys(cost)[0]; p.res[k] -= Math.max(0, cost[k] - q.d.o); G.row[v] = null; refillRow(G);
      if (bc.t === 'item') { p.deck.push(bid); log(G, s, nm(G, s) + ' buys ' + bc.name + ' cheaper.', { k: 'buy', card: bid }); }
      else { p.play.push(bid); log(G, s, nm(G, s) + ' takes ' + bc.name + ' cheaper and uses it.', { k: 'buy', card: bid }); return runOps(G, s, bc.ops.concat(rest), main); }
    }
    if (q.h === 'site' && v != null) digSite(G, s, v);
    runOps(G, s, rest, main);
  }
  function same(a, b) { if (a.t !== b.t) return false; if (a.t === 'ans') return JSON.stringify(a.v) === JSON.stringify(b.v === undefined ? null : b.v); for (var k of ['i', 's', 'r', 'k', 'sh']) if (a[k] !== undefined && a[k] !== b[k]) return false; return true; }
  // ------------------------------------------------------------ turn / round flow
  function endTurn(G, passed) {
    var cur = G.turn; G.p[cur].idolTurn = false;
    if (G.rival && cur === 0) { if (!passed) rivalTurn(G); else while (G.rival.deck.length) rivalTurn(G); }   /* after you pass the rival plays out its stack */
    if (G.p.every(function (p) { return p.passed; })) return endRound(G);
    for (var k = 1; k <= G.np; k++) { var n = (cur + k) % G.np; if (!G.p[n].passed) { G.turn = n; return; } }
  }
  function endRound(G) {
    G.sites.forEach(function (x) {
      if (x.occ >= 0) { var p = G.p[x.occ]; if (x.guard) { var tile = takeDread(G, x.occ, 'play'); log(G, x.occ, nm(G, x.occ) + ' flees ' + V.GUARD[x.guard].name + (tile ? ' and takes a fear tile (-2): no Dread cards left.' : ' and takes a Dread card.'), { k: 'fear' }); } p.ex++; }
      x.occ = -1;
    });
    G.p.forEach(function (p) { p.deck = p.deck.concat(shuf(G, p.play.concat(p.disc))); p.disc = []; p.play = []; p.passed = false; p.idolTurn = false; });   /* rulebook: the play area is shuffled and put under the deck (items bought this round stay above it) */
    if (G.round >= G.rounds) return endGame(G);
    // the card row shifts: the last item before the artifacts leaves; an artifact takes its place
    var nItems = Math.max(1, V.ROW - G.round); G.row[nItems - 1] = null; if (nItems < V.ROW) G.row[nItems] = null;
    G.round++; refillRow(G);
    G.p.forEach(function (p) { draw(G, p, Math.max(0, V.HAND - p.hand.length)); });
    G.first = (G.first + 1) % G.np; G.turn = G.first;
    if (G.rival) { rivalDeal(G); rivalTurn(G); }
    log(G, -1, 'Round ' + G.round + ' begins.', { k: 'round', round: G.round });
  }
  // a Dread card from the supply (to the discard pile or deck); when the supply is empty, a fear tile (-2 points) instead. Returns true for a tile.
  function takeDread(G, s, where) { var p = G.p[s]; if (G.dread == null) G.dread = 99; if (G.dread > 0) { G.dread--; p[where].push('dread'); return false; } p.fearTiles = (p.fearTiles || 0) + 1; return true; }
  function endGame(G) {
    G.phase = 'over'; var sc = G.p.map(function (p, i) { return score(G, i).total; });
    var all = sc.slice(); if (G.rival) all.push(rivalScore(G));
    var best = Math.max.apply(null, all), win = []; all.forEach(function (v, i) { if (v === best) win.push(i); });
    if (win.length > 1) { var TO = G.templeOrder || [], tb = win.map(function (i) { if (i >= G.np) return -1; var t = TO.indexOf(i); return (t >= 0 ? 1000 - t * 100 : 0) + score(G, i).research; }), m = Math.max.apply(null, tb); win = win.filter(function (i, k) { return tb[k] === m; }); }
    G.winner = win.length === 1 ? (win[0] === G.np ? -2 : win[0]) : -1;
    log(G, -1, 'The expedition ends. ' + (G.winner === -1 ? 'A tie!' : (G.winner === -2 ? G.rival.name : G.p[G.winner].name) + ' wins.'), { k: 'over' });
  }
  function score(G, s) {
    var p = G.p[s], all = p.deck.concat(p.hand, p.play, p.disc);
    var cards = 0, fear = -2 * (p.fearTiles || 0); all.forEach(function (id) { var c = card(id); if (c.t === 'fear') fear--; else cards += c.vp || 0; });
    var ti = (G.templeOrder || []).indexOf(s), research = V.NOTE_VP[p.note] + (p.glass >= V.TOP && ti >= 0 ? V.TEMPLE_ARRIVE[Math.min(ti, 3)] : V.GLASS_VP[p.glass]), temple = p.temple.reduce(function (a, b) { return a + b; }, 0);
    var idols = p.idols.reduce(function (a, d) { return a + (d.used ? V.IDOL_USED_VP : V.IDOL_VP); }, 0), guards = p.guards.length * V.GUARD_VP;
    var usedI = p.idols.filter(function (d) { return d.used; }).length, slots = V.IDOL_SLOT_VP.slice(usedI).reduce(function (a, b) { return a + b; }, 0);   /* empty shrine slots on your board keep their printed value (rules-check MISSING 1) */
    return { research: research, temple: temple, idols: idols, slots: slots, guards: guards, cards: cards, fear: fear, total: research + temple + idols + slots + guards + cards + fear };
  }
  // ------------------------------------------------------------ rival expedition (solo)
  function rivalDeal(G) {
    var R = G.rival, ids = V.RIVAL.map(function (c) { return c.id; });
    if (R.lvl === 'easy') ids = ids.filter(function (x) { return x !== 'rv-hunt' && x !== 'rv-study2'; });
    if (R.lvl === 'hard') ids.push('rv-study');
    R.deck = shuf(G, ids); R.played = [];
  }
  function rivalScore(G) { return G.rival.vp + V.GLASS_VP[Math.min(V.TOP, G.rival.rows)]; }
  function rivalTurn(G) {
    var R = G.rival; if (!R.deck.length) return; var id = R.deck.shift(), c = V.RIVAL.filter(function (x) { return x.id === id; })[0]; R.played.push(id);
    var a = c.a, said = '';
    if (a === 'hunt') { var gs = G.sites.filter(function (x) { return x.guard && x.occ !== 0; }); if (gs.length) { var g = gs[0]; said = 'overcomes ' + V.GUARD[g.guard].name + ' (+' + V.GUARD_VP + ')'; R.vp += V.GUARD_VP; G.ev.push({ s: -2, k: 'rivalbeat', site: G.sites.indexOf(g) }); g.guard = null; } else a = 'buyi'; }
    if (a === 'scout') { var un = G.sites.filter(function (x) { return x.lvl === 1 && !x.tile && x.occ === -1; }); if (un.length && G.s1.length) { var u = un[Math.floor(rng(G) * un.length)]; u.tile = G.s1.pop(); u.occ = -2; R.vp += V.IDOL_VP; if (G.guards.length) u.guard = G.guards.pop(); said = 'discovers ' + V.SITE[u.tile].name + ' (+' + V.IDOL_VP + ')' + (u.guard ? '; ' + V.GUARD[u.guard].name + ' wakes' : ''); G.ev.push({ s: -2, k: 'discover', site: G.sites.indexOf(u), tile: u.tile }); } else a = 'study'; }
    if (a === 'camp') { var cs = G.sites.filter(function (x) { return x.occ === -1 && (x.lvl === 0 || x.tile); }); if (cs.length) { var cc = cs[0]; cc.occ = -2; said = 'camps at ' + V.SITE[cc.tile].name; } else a = 'study'; }
    if (a === 'study') { if (R.rows < V.TOP) { R.rows++; said = 'climbs to research row ' + R.rows; } else { R.vp += 2; said = 'studies the temple (+2)'; } }
    if (a === 'buyi' || a === 'buya') {
      var want = a === 'buyi' ? 'item' : 'art', best = -1, bc = 99;
      G.row.forEach(function (x, r) { if (x && card(x).t === want && card(x).cost < bc) { bc = card(x).cost; best = r; } });
      if (best < 0) G.row.forEach(function (x, r) { if (x && card(x).cost < bc) { bc = card(x).cost; best = r; } });
      if (best >= 0) { var cd = card(G.row[best]), v = (cd.vp || 0); R.vp += v; said = 'takes ' + cd.name + ' from the row (+' + v + ')'; G.row[best] = null; refillRow(G); G.ev.push({ s: -2, k: 'rivalbuy', r: best }); }
      else said = 'waits';
    }
    log(G, -2, R.name + ' ' + said + '.', { k: 'rival', card: id });
  }
  // ------------------------------------------------------------ invariants + text
  function check(G) {
    var errs = [];
    G.p.forEach(function (p, i) {
      for (var k in p.res) if (p.res[k] < 0 || p.res[k] !== Math.floor(p.res[k])) errs.push('seat ' + i + ' ' + k + ' = ' + p.res[k]);
      var onBoard = G.sites.filter(function (x) { return x.occ === i; }).length; if (onBoard + p.ex !== V.EXPL) errs.push('seat ' + i + ' explorers ' + onBoard + '+' + p.ex);
      if (p.note > p.glass) errs.push('seat ' + i + ' notebook above magnifier');
      if (p.glass > V.TOP) errs.push('seat ' + i + ' glass too high');
      p.deck.concat(p.hand, p.play, p.disc).forEach(function (id) { if (!V.CARDS[id]) errs.push('bad card ' + id); });
    });
    var seen = {}; G.row.concat(G.items, G.arts).forEach(function (id) { if (id && card(id).t !== 'basic' && card(id).t !== 'fear') { if (seen[id]) errs.push('dup ' + id); seen[id] = 1; } });
    G.p.forEach(function (p) { p.deck.concat(p.hand, p.play, p.disc, p.exiled).forEach(function (id) { var c = card(id); if (c.t === 'item' || c.t === 'art') { if (seen[id]) errs.push('dup owned ' + id); seen[id] = 1; } }); });
    if (G.dread != null) { var dn = G.dread; G.p.forEach(function (p) { p.deck.concat(p.hand, p.play, p.disc).forEach(function (id) { if (id === 'dread') dn++; }); }); if (dn !== V.DREAD_SUPPLY) errs.push('dread count ' + dn); }
    if (G.phase === 'play' && actor(G) >= 0 && !moves(G).length) errs.push('stuck: no moves');
    return errs;
  }
  function text(G) {
    return 'Round ' + G.round + '/' + G.rounds + ' turn ' + G.turn + (G.q ? ' q=' + G.q.h : '') + '\n' + G.p.map(function (p, i) { return i + ' ' + p.name + ' ' + JSON.stringify(p.res) + ' hand ' + p.hand.join(',') + ' note ' + p.note + ' glass ' + p.glass + ' vp ' + score(G, i).total; }).join('\n');
  }
  var VG = { newGame: newGame, moves: moves, apply: apply, actor: actor, score: score, rivalScore: rivalScore, check: check, text: text, clone: clone, payPlan: payPlan, card: card, cardCost: cardCost, has: has, same: same, rng: rng, V: V };
  if (typeof module !== 'undefined' && module.exports) module.exports = VG; else root.VG = VG;
})(typeof window !== 'undefined' ? window : this);

// Via Tessera rules engine. All state in one JSON-safe G (no functions). Node + page (window.VT).
// Rules: rules-notes.md. Components: COMPONENTS.md. Data (cards, map, goods): data.js (VTD).
(function (root) {
  var D = root.VTD || (typeof require !== 'undefined' ? require('./data.js') : null);
  var GOODS = D.GOODS, PRICE = D.PRICE;
  var VT = {};

  // ---- seeded RNG kept inside G (so a game replays exactly) ----
  function rnd(G) { var a = G.rs = (G.rs + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  function shuffle(G, a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd(G) * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  VT.rnd = rnd;

  function emptyGoods() { var o = {}; GOODS.forEach(function (g) { o[g] = 0; }); return o; }
  function nGoods(p) { var n = 0; GOODS.forEach(function (g) { n += p.goods[g]; }); return n; }
  function colsHome(p) { return p.cols.filter(function (c) { return !c.at; }).length; }
  function used(p) { return nGoods(p) + colsHome(p); }   // storehouse slots in use (goods + colonists waiting at home)
  function room(p) { return D.SLOTS - used(p); }
  VT.used = used; VT.room = room; VT.nGoods = nGoods;

  // ---- setup ----
  VT.newGame = function (o) {
    o = o || {};
    var G = { v: 1, rs: (o.seed == null ? (Date.now() & 0xffffff) : o.seed) >>> 0, np: 2, cur: 0, turn: 0, phase: 'play', pend: null, log: [], ender: -1, left: -1, lastPlayed: null };
    G.seed = G.rs;
    var names = o.names || ['You', 'Rival'];
    G.pl = [];
    for (var i = 0; i < G.np; i++) {
      var p = { name: names[i], ai: (o.ai && o.ai[i]) || null, coins: D.START_COINS[i], goods: emptyGoods(), hand: D.START_HAND.slice(), disc: [], houses: [], cols: [], laurel: false };
      for (var g in D.START_GOODS) p.goods[g] = D.START_GOODS[g];
      D.START_COLS.forEach(function (c) { p.cols.push({ t: c.t, at: c.board ? { c: D.CAPITAL } : null }); });
      G.pl.push(p);
    }
    // city tokens: each lettered city gets one random token of its letter (rules-notes: city tokens)
    G.city = {};
    var byLetter = {};
    D.CITIES.forEach(function (c) { if (c.L) (byLetter[c.L] = byLetter[c.L] || []).push(c.id); });
    for (var L in byLetter) {
      var toks = shuffle(G, D.TOKENS[L].slice());
      byLetter[L].forEach(function (id, k) { G.city[id] = { g: toks[k], h: [] }; });
    }
    // province bonus markers: the most valuable good produced in the province, good side up
    G.prov = {};
    D.PROVS.forEach(function (pv) {
      var best = null;
      D.CITIES.forEach(function (c) { if (c.p === pv.id && G.city[c.id] && (!best || PRICE[G.city[c.id].g] > PRICE[best])) best = G.city[c.id].g; });
      G.prov[pv.id] = { g: best, up: true };   // up = good side showing
    });
    // market deck: the numbered stacks for this player count, each shuffled, I on top
    G.deck = [];
    D.DECK_STACKS(G.np).forEach(function (stack) { G.deck = G.deck.concat(shuffle(G, stack.slice())); });
    G.disp = [];
    while (G.disp.length < D.DISPLAY && G.deck.length) G.disp.push(G.deck.shift());
    if (o.first != null) G.cur = o.first;
    G.pm = (G.cur + G.np - 1) % G.np;   // the Grand Governor tile starts with the last player in turn order
    G.pl[G.cur].coins = D.START_COINS[0]; G.pl[(G.cur + 1) % G.np].coins = D.START_COINS[1];
    lg(G, 'A new game begins.');
    return G;
  };

  function lg(G, s) { G.log.push(s); if (G.log.length > 80) G.log.shift(); }
  VT.card = function (id) { return D.CARDS[id]; };

  // ---- map helpers ----
  var ROUTE = {}, CITY = {};
  D.ROUTES.forEach(function (r) { ROUTE[r.id] = r; });
  D.CITIES.forEach(function (c) { CITY[c.id] = c; });
  VT.ROUTE = ROUTE; VT.CITY = CITY;
  function routesAt(cid, t) { return D.ROUTES.filter(function (r) { return r.t === t && (r.a === cid || r.b === cid); }); }
  function occupied(G, rid) { for (var i = 0; i < G.np; i++) for (var k = 0; k < G.pl[i].cols.length; k++) { var a = G.pl[i].cols[k].at; if (a && a.r === rid) return true; } return false; }
  VT.occupied = occupied;
  // every route a colonist can stop on within `steps` steps: map rid -> steps needed. A step = city -> adjacent route, or route -> route sharing a city.
  // Colonists may pass through occupied routes but never stop on one.
  VT.reach = function (G, pi, k, steps) {
    var col = G.pl[pi].cols[k], t = col.t === 'L' ? 'land' : 'sea', dist = {}, out = {}, q = [];
    if (!col.at) return out;
    if (col.at.c != null) routesAt(col.at.c, t).forEach(function (r) { if (dist[r.id] == null) { dist[r.id] = 1; q.push(r.id); } });
    else { dist[col.at.r] = 0; q.push(col.at.r); }
    while (q.length) {
      var rid = q.shift(), d = dist[rid]; if (d >= steps) continue;
      var r = ROUTE[rid];
      [r.a, r.b].forEach(function (cid) { routesAt(cid, t).forEach(function (n) { if (dist[n.id] == null) { dist[n.id] = d + 1; q.push(n.id); } }); });
    }
    for (var id in dist) if (dist[id] > 0 && dist[id] <= steps && !occupied(G, id)) out[id] = dist[id];
    return out;
  };
  VT.onBoard = function (p) { return p.cols.filter(function (c) { return c.at; }).length; };
  // cities next to any of a player's colonists (the two ends of the route it stands on)
  VT.nearCities = function (G, pi) {
    var s = {};
    G.pl[pi].cols.forEach(function (c) { if (c.at && c.at.r != null) { var r = ROUTE[c.at.r]; s[r.a] = 1; s[r.b] = 1; } });
    return Object.keys(s).filter(function (id) { return G.city[id]; });
  };
  VT.buildCost = function (G, pi, cid) {
    var c = G.city[cid]; if (!c) return null;
    var coins = D.CITY_COIN[c.g] * (1 + c.h.length);
    var goods = emptyGoods();
    if (c.g === 'brick') goods.food += 1; else { goods.brick += 1; goods[c.g] += 1; }   // brick city: 1 grain only
    return { coins: coins, goods: goods };
  };
  function canPay(p, cost) { if (p.coins < (cost.coins || 0)) return false; for (var g in cost.goods) if (p.goods[g] < cost.goods[g]) return false; return true; }
  function pay(p, cost) { p.coins -= cost.coins || 0; for (var g in cost.goods) p.goods[g] -= cost.goods[g]; }
  VT.canBuild = function (G, pi, cid) {
    var p = G.pl[pi], c = G.city[cid];
    if (!c || c.h.indexOf(pi) >= 0 || p.houses.length >= D.HOUSES) return false;
    if (VT.nearCities(G, pi).indexOf(cid) < 0) return false;
    return canPay(p, VT.buildCost(G, pi, cid));
  };

  // ---- goods in: production respects the storehouse; overflow is the owner's choice what to drop ----
  function gain(G, pi, g, n) {
    G.inc = G.inc || {}; var q = G.inc[pi] = G.inc[pi] || {}; q[g] = (q[g] || 0) + n;
  }
  // storehouse rule: goods that fit are taken; if more arrive than there is room, the owner picks which to take and the rest stay
  // in the bank. Nothing already stored is ever thrown away, and no space may be left empty while goods could still be taken.
  function settle(G) {
    if (!G.inc) return;
    G.drop = [];
    Object.keys(G.inc).forEach(function (k) {
      var pi = +k, p = G.pl[pi], q = G.inc[k], n = 0; for (var g in q) n += q[g];
      if (n <= room(p)) { for (var g2 in q) p.goods[g2] += q[g2]; delete G.inc[k]; }
      else if (room(p) <= 0) delete G.inc[k];
      else G.drop.push(pi);
    });
    if (!G.drop.length) { G.drop = null; G.inc = null; }
  }
  VT.incoming = function (G, pi) { return G.inc && G.inc[pi] || null; };

  // ---- card prices ----
  VT.surcharge = function (slot) { return D.SURCHARGE[slot] || {}; };
  VT.cardCost = function (G, slot, consul) {
    var id = G.disp[slot]; if (id == null) return null;
    var cost = { coins: 0, goods: emptyGoods(), any: 0 };
    var cg = D.CARDS[id].cost; for (var g in cg) cost.goods[g] += cg[g];
    if (!consul) { var sc = D.SURCHARGE[slot] || {}; for (var k in sc) { if (k === 'any') cost.any += sc[k]; else cost.goods[k] += sc[k]; } }
    return cost;
  };
  // the surcharge is paid in goods of the buyer's choice (rules-notes): pick the cheapest goods left after the printed cost
  VT.surchargePick = function (p, cost) {
    var left = {}; GOODS.forEach(function (g) { left[g] = p.goods[g] - (cost.goods[g] || 0); });
    var pick = emptyGoods(), need = cost.any;
    GOODS.slice().sort(function (a, b) { return PRICE[a] - PRICE[b]; }).forEach(function (g) { while (need > 0 && left[g] > 0) { left[g]--; pick[g]++; need--; } });
    return need > 0 ? null : pick;
  };
  VT.canBuyCard = function (G, pi, slot, consul) {
    var p = G.pl[pi], cost = VT.cardCost(G, slot, consul); if (!cost) return false;
    for (var g in cost.goods) if (p.goods[g] < cost.goods[g]) return false;
    return !!VT.surchargePick(p, cost);
  };

  // ---- scoring (patrons) ----
  VT.score = function (G, pi) {
    var p = G.pl[pi], all = p.hand.concat(p.disc), out = { total: 0, by: {} };
    var count = {}; all.forEach(function (id) { var c = D.CARDS[id]; (count[c.god] = count[c.god] || []).push(c); });
    var val = VT.patronValues(G, pi);
    D.GODS.forEach(function (gd) {
      var cs = count[gd.id] || [], pts = 0;
      if (gd.id === 'owl') cs.forEach(function (c) { pts += val.owl[c.spec] || 0; });
      else pts = cs.length * val[gd.id];
      out.by[gd.id] = { n: cs.length, each: gd.id === 'owl' ? null : val[gd.id], pts: pts }; out.total += pts;
    });
    if (p.laurel) { out.by.laurel = { n: 1, pts: D.LAUREL_VP }; out.total += D.LAUREL_VP; }
    return out;
  };
  VT.patronValues = function (G, pi) {
    var p = G.pl[pi], v = {};
    var wealth = p.coins; GOODS.forEach(function (g) { wealth += p.goods[g] * PRICE[g]; });
    v.hearth = Math.floor(wealth / 10);
    v.eagle = Math.min(D.EAGLE_MAX, p.houses.filter(function (cid) { return G.city[cid].g !== 'brick'; }).length);
    var provs = {}; p.houses.forEach(function (cid) { provs[CITY[cid].p] = 1; });
    v.sickle = Object.keys(provs).length;
    var types = {}; p.houses.forEach(function (cid) { types[G.city[cid].g] = 1; });
    v.wing = 2 * Object.keys(types).length;
    v.shield = 2 * VT.onBoard(p);
    v.owl = {}; GOODS.forEach(function (g) { v.owl[g] = D.OWL[g] * p.houses.filter(function (cid) { return G.city[cid].g === g; }).length; });
    return v;
  };

  // ---- whose move ----
  VT.sideToAct = function (G) { if (G.phase !== 'play') return -1; if (G.drop && G.drop.length) return G.drop[0]; return G.cur; };

  // ---- legal moves ----
  VT.validMoves = function (G) {
    var pi = VT.sideToAct(G); if (pi < 0) return [];
    var p = G.pl[pi], m = [], pd = G.pend;
    if (G.drop && G.drop.length) { var q = G.inc[pi]; GOODS.forEach(function (g) { if (q[g] > 0) m.push({ t: 'take', g: g }); }); return m; }
    if (!pd) { p.hand.forEach(function (id, i) { if (VT.playable(G, pi, id)) m.push({ t: 'play', i: i }); }); return m; }
    var h = pd.h;
    if (h === 'arch-move') {
      if (pd.steps > 0) p.cols.forEach(function (c, k) { if (!c.at) return; var r = VT.reach(G, pi, k, pd.steps); for (var rid in r) m.push({ t: 'mv', k: k, r: rid }); });
      m.push({ t: 'mdone' });
    } else if (h === 'arch-build') {
      VT.nearCities(G, pi).forEach(function (cid) { if (VT.canBuild(G, pi, cid)) m.push({ t: 'build', c: cid }); });
      m.push({ t: 'done' });
    } else if (h === 'pref') {
      D.PROVS.forEach(function (pv) { if (G.prov[pv.id].up && G.prov[pv.id].g) m.push({ t: 'prov', p: pv.id }); });
      m.push({ t: 'pcoins' });
    } else if (h === 'merc') {
      m.push({ t: 'trade', ops: [] });   // the UI/AI build real trades; validTrade() checks them
    } else if (h === 'buy') {
      if (pd.left > 0) G.disp.forEach(function (id, s) { if (id != null && VT.canBuyCard(G, pi, s, pd.consul)) m.push({ t: 'buy', s: s }); });
      m.push({ t: 'done' });
    } else if (h === 'colo') {
      if (!pd.placed) m.push({ t: 'ccoins' });
      VT.colonistSpots(G, pi).forEach(function (cid) { ['L', 'S'].forEach(function (k) { if (VT.canPlaceCol(G, pi, cid, k)) m.push({ t: 'place', c: cid, k: k }); }); });
      if (pd.placed) m.push({ t: 'done' });
    } else if (h === 'trib') {
      if (!pd.placed) ['L', 'S'].forEach(function (k) { if (VT.canPlaceCol(G, pi, D.CAPITAL, k)) m.push({ t: 'place', c: D.CAPITAL, k: k }); });
      m.push({ t: 'done' });
    } else if (h === 'dipl') {
      var o = 1 - pi, top = G.pl[o].disc[G.pl[o].disc.length - 1];
      if (top != null && D.CARDS[top].act !== 'dipl') m.push({ t: 'copy', o: o });
      m.push({ t: 'done' });
    }
    return m;
  };
  VT.playable = function (G, pi, id) { return true; };   // every card may be played (an action may do nothing)
  VT.colonistSpots = function (G, pi) { return [D.CAPITAL].concat(G.pl[pi].houses); };
  VT.canPlaceCol = function (G, pi, cid, k) {
    var p = G.pl[pi];
    if (!p.cols.some(function (c) { return !c.at && c.t === k; })) return false;
    if (p.goods.food < 1 || p.goods.tool < 1) return false;
    if (cid !== D.CAPITAL && p.houses.indexOf(cid) < 0) return false;
    // a land colonist needs a road out of the city, a sea colonist a sea route
    return routesAt(cid, k === 'L' ? 'land' : 'sea').length > 0;
  };
  // Trading: up to 2 kinds of goods, each bought OR sold in any number. ops = [[good, n]] (n > 0 buy, n < 0 sell).
  VT.validTrade = function (G, pi, ops) {
    var p = G.pl[pi], kinds = {}, coins = p.coins, goods = {}, room0 = room(p);
    GOODS.forEach(function (g) { goods[g] = p.goods[g]; });
    for (var i = 0; i < ops.length; i++) { var g = ops[i][0], n = ops[i][1]; if (GOODS.indexOf(g) < 0 || !n || n !== Math.round(n)) return false; if (kinds[g]) return false; kinds[g] = 1; }
    if (Object.keys(kinds).length > D.TRADE_KINDS) return false;
    ops.forEach(function (o) { goods[o[0]] += o[1]; coins -= o[1] * PRICE[o[0]]; });
    if (coins < 0) return false; for (var g2 in goods) if (goods[g2] < 0) return false;
    var tot = 0; for (var g3 in goods) tot += goods[g3];
    if (tot + colsHome(p) > D.SLOTS) return false;
    return true;
  };

  // ---- perform ----
  VT.performMove = function (G, m) {
    var pi = VT.sideToAct(G), p = G.pl[pi], pd = G.pend;
    if (pi < 0) throw new Error('game over');
    if (m.t === 'take') {   // choose one incoming good to store (the storehouse can't hold them all)
      var q = G.inc[pi]; if (!q || !(q[m.g] > 0)) throw new Error('not incoming');
      q[m.g]--; p.goods[m.g]++;
      if (room(p) <= 0) { lg(G, p.name + '\'s storehouse is full; the rest stays in the bank.'); delete G.inc[pi]; G.drop.shift(); }
      else { var left = 0; for (var g0 in q) left += q[g0]; if (left <= room(p)) { for (var g1 in q) p.goods[g1] += q[g1]; delete G.inc[pi]; G.drop.shift(); } }
      if (!G.drop.length) { G.drop = null; G.inc = null; maybeEnd(G); }
      return G;
    }
    if (m.t === 'play') return playCard(G, pi, m.i);
    if (!pd) throw new Error('no action');
    var h = pd.h;
    if (h === 'arch-move') {
      if (m.t === 'mv') {
        var r = VT.reach(G, pi, m.k, pd.steps); if (r[m.r] == null) throw new Error('bad move');
        pd.steps -= r[m.r]; p.cols[m.k].at = { r: m.r };
        lg(G, p.name + ' moves a ' + (p.cols[m.k].t === 'L' ? 'cart' : 'ship') + '.');
        return G;
      }
      if (m.t === 'mdone') { G.pend = { h: 'arch-build', card: pd.card }; return G; }
    }
    if (h === 'arch-build') {
      if (m.t === 'build') {
        if (!VT.canBuild(G, pi, m.c)) throw new Error('cannot build');
        pay(p, VT.buildCost(G, pi, m.c)); G.city[m.c].h.push(pi); p.houses.push(m.c);
        lg(G, p.name + ' builds in ' + CITY[m.c].n + '.');
        if (p.houses.length >= D.HOUSES) triggerEnd(G, pi, 'built the last house');
        return G;
      }
      if (m.t === 'done') return endTurn(G);
    }
    if (h === 'pref') {
      if (m.t === 'prov') {
        var pv = G.prov[m.p]; if (!pv || !pv.up) throw new Error('province used');
        // every house in the province makes one good for its owner, the governor also takes the bonus good
        D.CITIES.forEach(function (c) { if (c.p === m.p && G.city[c.id]) G.city[c.id].h.forEach(function (o) { gain(G, o, G.city[c.id].g, 1); }); });
        var bonus = G.pm === pi ? 2 : 1;   // the Grand Governor doubles the bonus good, then passes to the right
        gain(G, pi, pv.g, bonus);
        if (G.pm === pi) G.pm = (pi + G.np - 1) % G.np;
        pv.up = false;
        lg(G, p.name + ' rules ' + provName(m.p) + ': goods for its houses.');
        return endTurn(G);
      }
      if (m.t === 'pcoins') {
        var sum = 0; for (var k2 in G.prov) if (!G.prov[k2].up && G.prov[k2].g) { sum += D.BONUS_COIN[G.prov[k2].g]; G.prov[k2].up = true; }
        p.coins += sum; lg(G, p.name + ' collects ' + sum + ' coins of taxes.');
        return endTurn(G);
      }
    }
    if (h === 'merc') {
      if (m.t === 'trade') {
        if (!VT.validTrade(G, pi, m.ops)) throw new Error('bad trade');
        m.ops.forEach(function (o) { p.goods[o[0]] += o[1]; p.coins -= o[1] * PRICE[o[0]]; });
        if (m.ops.length) lg(G, p.name + ' trades ' + m.ops.map(function (o) { return (o[1] > 0 ? 'buys ' : 'sells ') + Math.abs(o[1]) + ' ' + o[0]; }).join(', ') + '.');
        return endTurn(G);
      }
    }
    if (h === 'buy') {
      if (m.t === 'buy') {
        if (pd.left <= 0 || !VT.canBuyCard(G, pi, m.s, pd.consul)) throw new Error('cannot buy');
        var cost = VT.cardCost(G, m.s, pd.consul), sur = VT.surchargePick(p, cost);
        for (var g in cost.goods) p.goods[g] -= cost.goods[g];
        for (var g2 in sur) p.goods[g2] -= sur[g2];
        var id = G.disp[m.s]; G.disp[m.s] = null; p.hand.push(id); pd.left--;
        lg(G, p.name + ' buys ' + D.CARDS[id].n + '.');
        if (G.deck.length === 0 && G.disp.every(function (x) { return x == null; })) triggerEnd(G, pi, 'bought the last card');
        if (pd.left <= 0 || G.phase !== 'play' || G.disp.every(function (x) { return x == null; })) return endTurn(G);
        return G;
      }
      if (m.t === 'done') return endTurn(G);
    }
    if (h === 'colo') {
      if (m.t === 'ccoins') { var n = D.COLONIST_COINS + VT.onBoard(p); p.coins += n; lg(G, p.name + ' takes ' + n + ' coins.'); return endTurn(G); }
      if (m.t === 'place') { placeCol(G, pi, m.c, m.k); pd.placed = (pd.placed || 0) + 1; return G; }
      if (m.t === 'done') return endTurn(G);
    }
    if (h === 'trib') {
      if (m.t === 'place' && !pd.placed) { if (m.c !== D.CAPITAL) throw new Error('herald places in the capital'); placeCol(G, pi, m.c, m.k); pd.placed = 1; return endTurn(G); }
      if (m.t === 'done') return endTurn(G);
    }
    if (h === 'dipl') {
      if (m.t === 'copy') {
        var o2 = G.pl[m.o], top = o2.disc[o2.disc.length - 1];
        if (top == null || D.CARDS[top].act === 'dipl') throw new Error('cannot copy');
        lg(G, p.name + ' copies ' + D.CARDS[top].n + '.');
        G.pend = null; startAction(G, pi, top, true); return G;
      }
      if (m.t === 'done') return endTurn(G);
    }
    throw new Error('illegal move ' + JSON.stringify(m) + ' in ' + h);
  };
  function provName(id) { for (var i = 0; i < D.PROVS.length; i++) if (D.PROVS[i].id === id) return D.PROVS[i].n; return id; }
  function placeCol(G, pi, cid, k) {
    if (!VT.canPlaceCol(G, pi, cid, k)) throw new Error('cannot place');
    var p = G.pl[pi]; p.goods.food--; p.goods.tool--;
    for (var i = 0; i < p.cols.length; i++) if (!p.cols[i].at && p.cols[i].t === k) { p.cols[i].at = { c: cid }; break; }
    lg(G, p.name + ' sends a new ' + (k === 'L' ? 'cart' : 'ship') + ' from ' + CITY[cid].n + '.');
  }
  function playCard(G, pi, i) {
    var p = G.pl[pi], id = p.hand[i]; if (id == null) throw new Error('no card');
    p.hand.splice(i, 1); p.disc.push(id); G.lastPlayed = id;
    lg(G, p.name + ' plays ' + D.CARDS[id].n + '.');
    startAction(G, pi, id, false);
    return G;
  }
  function startAction(G, pi, id, copied) {
    var p = G.pl[pi], c = D.CARDS[id], a = c.act;
    if (a === 'trib') {
      var n = p.disc.length; p.hand = p.hand.concat(p.disc); p.disc = [];
      var bonus = Math.max(0, n - D.TRIBUNE_FREE); p.coins += bonus;
      lg(G, p.name + ' takes ' + n + ' cards back' + (bonus ? ' and ' + bonus + ' coins' : '') + '.');
      G.pend = { h: 'trib', card: id };
      if (!VT.canPlaceCol(G, pi, D.CAPITAL, 'L') && !VT.canPlaceCol(G, pi, D.CAPITAL, 'S')) return endTurn(G);
      return G;
    }
    if (a === 'arch') { G.pend = { h: 'arch-move', card: id, steps: VT.onBoard(p) }; return G; }
    if (a === 'pref') { G.pend = { h: 'pref', card: id }; return G; }
    if (a === 'merc') { p.coins += c.coins || D.MERCATOR_COINS; G.pend = { h: 'merc', card: id }; return G; }
    if (a === 'sen') { G.pend = { h: 'buy', card: id, left: 2, consul: false }; return G; }
    if (a === 'cons') { G.pend = { h: 'buy', card: id, left: 1, consul: true }; return G; }
    if (a === 'colo') { G.pend = { h: 'colo', card: id }; return G; }
    if (a === 'dipl') { G.pend = { h: 'dipl', card: id }; return G; }
    if (a === 'spec') {
      var made = 0; p.houses.forEach(function (cid) { if (G.city[cid].g === c.spec) { gain(G, pi, c.spec, 1); made++; } });
      lg(G, p.name + ' makes ' + made + ' ' + c.spec + '.');
      return endTurn(G);
    }
    throw new Error('unknown action ' + a);
  }
  function triggerEnd(G, pi, why) {
    if (G.ender >= 0) return;
    G.ender = pi; G.pl[pi].laurel = true; G.left = G.np - 1;   // every other player gets one more turn
    lg(G, G.pl[pi].name + ' ' + why + ' and takes the laurel (+' + D.LAUREL_VP + ').');
  }
  function endTurn(G) {
    G.pend = null;
    settle(G);
    // refill the display: cards slide left, the gaps fill from the deck
    var keep = G.disp.filter(function (x) { return x != null; });
    while (keep.length < D.DISPLAY && G.deck.length) keep.push(G.deck.shift());
    G.disp = keep;
    if (G.deck.length === 0 && G.disp.length === 0 && G.ender < 0) triggerEnd(G, G.cur, 'emptied the market');
    G.turn++;
    if (G.ender >= 0 && G.cur !== G.ender) G.left--;
    G.cur = (G.cur + 1) % G.np;
    maybeEnd(G);
    return G;
  }
  function maybeEnd(G) {
    if (G.drop && G.drop.length) return;
    if (G.ender >= 0 && G.left <= 0 && !G.pend) { G.phase = 'end'; lg(G, 'The game ends.'); }
  }
  VT.winner = function (G) {
    var s = G.pl.map(function (p, i) { return VT.score(G, i).total; });
    var best = Math.max.apply(null, s), w = [];
    s.forEach(function (x, i) { if (x === best) w.push(i); });
    if (w.length > 1) { // tie: the player who took the laurel... rules-notes: tie-break
      var tb = w.slice().sort(function (a, b) { return D.TIEBREAK(G, b) - D.TIEBREAK(G, a); });
      return tb[0];
    }
    return w[0];
  };

  VT.checkInvariants = function (G) {
    var errs = [];
    G.pl.forEach(function (p, i) {
      if (p.coins < 0) errs.push(p.name + ' coins < 0');
      GOODS.forEach(function (g) { if (p.goods[g] < 0) errs.push(p.name + ' ' + g + ' < 0'); });
      if (used(p) > D.SLOTS && !(G.drop && G.drop.indexOf(i) >= 0)) errs.push(p.name + ' storehouse over ' + D.SLOTS);
      if (p.houses.length > D.HOUSES) errs.push('too many houses');
      var cards = p.hand.length + p.disc.length; if (cards < D.START_HAND.length) errs.push('lost cards');
      var seen = {}; p.cols.forEach(function (c) { if (c.at && c.at.r != null) { if (seen[c.at.r]) errs.push('two colonists on one route'); seen[c.at.r] = 1; var r = ROUTE[c.at.r]; if ((r.t === 'land') !== (c.t === 'L')) errs.push('colonist on wrong route type'); } });
      p.houses.forEach(function (cid) { if (G.city[cid].h.indexOf(i) < 0) errs.push('house mismatch'); });
    });
    var occ = {}; G.pl.forEach(function (p) { p.cols.forEach(function (c) { if (c.at && c.at.r != null) { if (occ[c.at.r]) errs.push('route shared'); occ[c.at.r] = 1; } }); });
    var total = G.deck.length + G.disp.filter(function (x) { return x != null; }).length; G.pl.forEach(function (p) { total += p.hand.length + p.disc.length - D.START_HAND.length; });
    if (total !== D.DECK_STACKS(G.np).reduce(function (a, s) { return a + s.length; }, 0)) errs.push('card count ' + total);
    return errs;
  };
  VT.clone = function (G) { return JSON.parse(JSON.stringify(G)); };
  VT.D = D;
  root.VT = VT;
  if (typeof module !== 'undefined') module.exports = VT;
})(typeof window !== 'undefined' ? window : global);

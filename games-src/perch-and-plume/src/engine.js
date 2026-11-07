/* Perch & Plume rules engine. One JSON-safe state G; moves are plain objects. Works in the page and in node.
   Flow: setup (keep birds/food, pick a bonus card) -> 4 rounds (8/7/6/5 action cubes each) -> each turn ONE action:
   play a bird | gain food (forest) | lay eggs (grassland) | draw cards (wetland). A row action grows with the birds in that row,
   then that row's brown powers fire right to left. Pink powers react between your turns; white powers fire when played.
   Pending decisions live in G.q = {seat, h, d}; the work queue G.work holds what still has to resolve. */
(function (root) {
  'use strict';
  var DATA = root.PP_DATA || (typeof require !== 'undefined' ? require('./data.js') : null);
  var FOODS = ['grub', 'seed', 'fish', 'berry', 'rodent'];
  var FACES = ['grub', 'seed', 'fish', 'berry', 'rodent', 'gs'];   // gs = grub or seed (the player chooses)
  var HABS = ['forest', 'grassland', 'wetland'], HK = 'FGW';
  var CUBES = [8, 7, 6, 5];
  var GOALPTS = [[4, 1, 0], [5, 2, 1], [6, 3, 2], [7, 4, 3]];
  // row yields by birds in the row (0..5) and whether that space carries the bonus trade
  var YIELD = [[1, 1, 2, 2, 3, 3], [2, 2, 3, 3, 4, 4], [1, 1, 2, 2, 3, 3]];
  var BONUSSP = [false, true, false, true, false, true];
  var EGGCOST = [0, 1, 1, 2, 2];
  var B = {}, BON = {}, GOL = {};
  DATA.birds.forEach(function (b) { B[b.id] = b; });
  DATA.bonus.forEach(function (b) { BON[b.id] = b; });
  DATA.goals.forEach(function (g) { GOL[g.id] = g; });

  // ---------------- rng (mulberry32 in the state, so a saved game replays the same)
  function rnd(G) { var a = G.rng = (G.rng + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  function shuffle(G, a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd(G) * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function food0() { return { grub: 0, seed: 0, fish: 0, berry: 0, rodent: 0 }; }
  function log(G, s) { G.log.push(s); if (G.log.length > 300) G.log.shift(); }
  function fx(G, e) { G.fx.push(e); }
  function nameOf(G, s) { return G.pl[s].name; }

  // ---------------- setup
  // opts: {seats:[{name, kind:'human'|'ai'|'automa', lvl}], seed, twist, cubes?:[..], rounds?:n, hands?:{seat:[ids]}, tutorial?:bool}
  function newGame(opts) {
    var seed = (opts.seed == null ? Math.floor(Math.random() * 1e9) : opts.seed) >>> 0;
    var G = { v: 1, seed: seed, rng: seed, round: 0, turn: 0, first: 0, cur: 0, phase: 'setup', q: null, work: [], log: [], fx: [],
      deck: DATA.birds.map(function (b) { return b.id; }), disc: [], tray: [null, null, null], bdeck: DATA.bonus.map(function (b) { return b.id; }), bdisc: [],
      feeder: [], goals: [], gres: [], pl: [], cubes: opts.cubes || CUBES.slice(), rounds: opts.rounds || 4, twist: opts.twist || null, tut: !!opts.tutorial, winner: null, final: null };
    shuffle(G, G.deck); shuffle(G, G.bdeck);
    var gl = DATA.goals.map(function (g) { return g.id; }); shuffle(G, gl);
    // never two goals of the same family-row in one game (keeps the four goals different)
    var pick = []; gl.forEach(function (id) { if (pick.length < G.rounds && !pick.some(function (p) { return p.split('-')[0] === id.split('-')[0] && p.split('-')[0] !== 'nest'; })) pick.push(id); });
    G.goals = opts.goals || pick;
    opts.seats.forEach(function (s, i) {
      var p = { name: s.name, kind: s.kind || 'ai', lvl: s.lvl || 'normal', hand: [], food: food0(), bonus: [], board: [[], [], []], pink: false, cubes: 0, ready: false, offer: null, cardsUsed: 0 };
      if (p.kind === 'automa') { p.auto = { deck: [], birds: [], eggs: 0, tuck: 0, marks: 0, gpts: 0 }; p.ready = true; }
      G.pl.push(p);
    });
    rollAll(G);
    refillTray(G);
    G.pl.forEach(function (p, i) {
      if (p.kind === 'automa') return;
      var fixed = opts.hands && opts.hands[i];
      if (fixed) fixed.forEach(function (id) { var k = G.deck.indexOf(id); if (k >= 0) G.deck.splice(k, 1); });
      p.offer = { birds: fixed ? fixed.slice() : G.deck.splice(0, 5), food: FOODS.slice(), bonus: G.bdeck.splice(0, 2) };
    });
    G.first = opts.first || 0;
    if (G.pl.every(function (p) { return p.ready; })) startRound(G); else setupQ(G);
    return G;
  }
  function setupQ(G) {
    for (var i = 0; i < G.pl.length; i++) if (!G.pl[i].ready) { G.q = { seat: i, h: 'setup', d: {} }; G.cur = i; return; }
    G.q = null; applySetupTwist(G); startRound(G);
  }
  function applySetupTwist(G) {
    var t = G.twist; if (!t || G._tw) return; G._tw = 1;
    var boss = G.pl[1], me = G.pl[0], n = t.param || 1;
    if (t.id === 'boss-food' && boss) FOODS.forEach(function (f, k) { if (k < n) boss.food[f]++; });
    if (t.id === 'boss-cards' && boss) for (var k = 0; k < n; k++) draw(G, 1);
    if (t.id === 'boss-bird' && boss && boss.kind !== 'automa') { var id = G.deck.find(function (x) { return B[x].h.indexOf('F') >= 0 && B[x].pw === 'gainF'; }); if (id) { G.deck.splice(G.deck.indexOf(id), 1); boss.board[0].push({ id: id, eggs: 0, cache: 0, tuck: 0 }); } }
    if (t.id === 'boss-lead' && boss) boss.lead = n;
    if (t.id === 'lean-start') FOODS.forEach(function (f, k) { if (k < n && me.food[f] > 0) me.food[f]--; });
    if (t.id === 'boss-eggs' && boss && boss.kind === 'automa') boss.auto.eggs += n;
    if (t.id === 'boss-eggs' && boss && boss.kind !== 'automa') boss.lead = (boss.lead || 0) + n;
    function draw() { if (G.deck.length) boss.hand.push(G.deck.shift()); }
  }

  // ---------------- feeder, tray, deck
  function rollAll(G) { G.feeder = []; for (var i = 0; i < 5; i++) G.feeder.push(FACES[Math.floor(rnd(G) * 6)]); fx(G, { k: 'roll' }); }
  function allSame(G) { return G.feeder.length > 0 && G.feeder.every(function (f) { return f === G.feeder[0]; }); }
  function drawCard(G) { if (!G.deck.length) { G.deck = shuffle(G, G.disc.splice(0)); } return G.deck.length ? G.deck.shift() : null; }
  function refillTray(G) { for (var i = 0; i < 3; i++) if (!G.tray[i]) G.tray[i] = drawCard(G); }

  // ---------------- board helpers
  function birds(p) { var o = []; p.board.forEach(function (row, h) { row.forEach(function (s, c) { o.push({ h: h, c: c, s: s, b: B[s.id] }); }); }); return o; }
  function eggsOn(p) { return birds(p).reduce(function (a, x) { return a + x.s.eggs; }, 0); }
  function eggSpace(p) { return birds(p).reduce(function (a, x) { return a + (x.b.e - x.s.eggs); }, 0); }
  function foodN(p) { return FOODS.reduce(function (a, f) { return a + p.food[f]; }, 0); }
  function nestIs(b, n) { return b.nest === n || b.nest === 'star'; }
  function eats(b, f) { return b.c.some(function (s) { return s === '*' || s.split('|').indexOf(f) >= 0; }); }
  function slotCost(c) { return EGGCOST[c]; }
  function rowYield(p, h) { var n = p.board[h].length; return { n: YIELD[h][n], bonus: BONUSSP[n] }; }

  // ---------------- payment: every minimal way to pay a food cost (slot = 'fish' | 'fish|rodent' | '*'); any 2 food may stand in for 1
  function payOptions(food, cost) {
    var res = [], seen = {}, f = clone(food);
    function key(pay) { return FOODS.map(function (k) { return pay[k] || 0; }).join(','); }
    function rec(i, pay) {
      if (res.length > 40) return;
      if (i === cost.length) { var k = key(pay); if (!seen[k]) { seen[k] = 1; res.push(clone(pay)); } return; }
      var acc = cost[i] === '*' ? FOODS : cost[i].split('|');
      var direct = false;
      acc.forEach(function (t) { if (f[t] > 0) { direct = true; f[t]--; pay[t] = (pay[t] || 0) + 1; rec(i + 1, pay); pay[t]--; f[t]++; } });
      if (cost[i] === '*' && direct) return;   // a wild slot never needs the 2-for-1 trade
      for (var a = 0; a < 5; a++) for (var b2 = a; b2 < 5; b2++) {
        var ta = FOODS[a], tb = FOODS[b2];
        if (acc.indexOf(ta) >= 0 || acc.indexOf(tb) >= 0) continue;   // pointless trade
        if (f[ta] < 1 || f[tb] < (a === b2 ? 2 : 1)) continue;
        f[ta]--; f[tb]--; pay[ta] = (pay[ta] || 0) + 1; pay[tb] = (pay[tb] || 0) + 1; rec(i + 1, pay); pay[ta]--; pay[tb]--; f[ta]++; f[tb]++;
      }
    }
    rec(0, {});
    res.sort(function (x, y) { return tot(x) - tot(y); });
    var mn = res.length ? tot(res[0]) : 0;
    return res.filter(function (x) { return tot(x) <= mn + 1; });
    function tot(x) { return FOODS.reduce(function (a, k) { return a + (x[k] || 0); }, 0); }
  }
  function canPayEggs(p, n) { return eggsOn(p) >= n; }
  function eggSources(p, n, excl) {   // default: take eggs from the birds holding the most
    var list = birds(p).filter(function (x) { return x.s.eggs > 0 && !(excl && excl.h === x.h && excl.c === x.c); }).sort(function (a, b) { return b.s.eggs - a.s.eggs || a.b.p - b.b.p; }), out = [], cnt = {};
    for (var k = 0; k < n; k++) { var x = list.find(function (y) { return y.s.eggs - (cnt[y.h + ':' + y.c] || 0) > 0; }); if (!x) return null; cnt[x.h + ':' + x.c] = (cnt[x.h + ':' + x.c] || 0) + 1; out.push([x.h, x.c]); list.sort(function (a, b) { return (b.s.eggs - (cnt[b.h + ':' + b.c] || 0)) - (a.s.eggs - (cnt[a.h + ':' + a.c] || 0)); }); }
    return out;
  }
  // can seat play card id (from hand) into habitat h? returns {ok, col, eggs, pays} or null
  function playInfo(G, seat, id, h, onlyHab) {
    var p = G.pl[seat], b = B[id]; if (!b) return null;
    if (b.h.indexOf(HK[h]) < 0) return null;
    if (onlyHab != null && onlyHab !== h) return null;
    var col = p.board[h].length; if (col >= 5) return null;
    var ec = slotCost(col); if (!canPayEggs(p, ec)) return null;
    var pays = payOptions(p.food, b.c); if (!pays.length) return null;
    return { col: col, eggs: ec, pays: pays };
  }
  function playable(G, seat, onlyHab) {
    var p = G.pl[seat], o = [];
    p.hand.forEach(function (id, i) { for (var h = 0; h < 3; h++) { var inf = playInfo(G, seat, id, h, onlyHab); if (inf) o.push({ i: i, id: id, h: h, inf: inf }); } });
    return o;
  }

  // ---------------- turns and rounds
  function startRound(G) {
    G.phase = 'play';
    G.pl.forEach(function (p) { p.cubes = G.cubes[G.round]; p.pink = false; if (p.auto) autoDeal(G, p); });
    G.cur = G.first; G.turn++;
    log(G, 'Round ' + (G.round + 1) + ' begins. Goal: ' + GOL[G.goals[G.round]].n + '.');
    fx(G, { k: 'round', r: G.round });
    beginTurn(G);
  }
  function beginTurn(G) {
    var p = G.pl[G.cur]; p.pink = false; G.q = null;
    if (p.kind === 'automa') { G.q = { seat: G.cur, h: 'automa', d: {} }; }
  }
  function endTurn(G) {
    var p = G.pl[G.cur];
    p.cubes--; refillTray(G);
    G.q = null; G.work = [];
    if (G.pl.every(function (x) { return x.cubes <= 0; })) { endRound(G); return; }
    var n = G.pl.length, s = G.cur;
    for (var k = 1; k <= n; k++) { var c = (s + k) % n; if (G.pl[c].cubes > 0) { G.cur = c; break; } }
    G.turn++; beginTurn(G);
  }
  function goalCount(G, seat, gid) {
    var p = G.pl[seat], t = GOL[gid].test;
    if (p.auto) return p.auto.marks;
    var bs = birds(p);
    if (t.t === 'birds') return p.board[t.h].length;
    if (t.t === 'eggsIn') return p.board[t.h].reduce(function (a, s) { return a + s.eggs; }, 0);
    if (t.t === 'nestEgg') return bs.filter(function (x) { return nestIs(x.b, t.n) && x.s.eggs > 0; }).length;
    if (t.t === 'sets') return Math.min.apply(null, [0, 1, 2].map(function (h) { return p.board[h].reduce(function (a, s) { return a + s.eggs; }, 0); }));
    if (t.t === 'total') return bs.length;
    return 0;
  }
  function placeGoal(G, r) {
    var gid = G.goals[r], cnt = G.pl.map(function (p, i) { return goalCount(G, i, gid); }), pts = G.pl.map(function () { return 0; });
    var order = cnt.map(function (c, i) { return i; }).filter(function (i) { return cnt[i] > 0; }).sort(function (a, b) { return cnt[b] - cnt[a]; });
    var pos = 0, tbl = GOALPTS[Math.min(r, 3)];
    while (pos < order.length && pos < 3) {
      var tie = order.filter(function (i) { return cnt[i] === cnt[order[pos]]; });
      var sum = 0; for (var k = pos; k < pos + tie.length; k++) sum += tbl[k] || 0;
      var each = Math.floor(sum / tie.length); tie.forEach(function (i) { pts[i] = each; });
      pos += tie.length;
    }
    if (G.pl.length === 1) pts[0] = Math.min(cnt[0], 5);   // solo without a rival: 1 point per item, at most 5
    return { gid: gid, cnt: cnt, pts: pts };
  }
  function endRound(G) {
    var res = placeGoal(G, G.round); G.gres.push(res);
    log(G, 'Round ' + (G.round + 1) + ' goal scored: ' + res.pts.map(function (v, i) { return nameOf(G, i) + ' ' + v; }).join(', ') + '.');
    fx(G, { k: 'goal', r: G.round, res: res });
    // the tray is cleared and refilled; first player passes left
    G.tray.forEach(function (id) { if (id) G.disc.push(id); }); G.tray = [null, null, null]; refillTray(G);
    G.round++;
    if (G.round >= G.rounds) { finish(G); return; }
    G.first = (G.first + 1) % G.pl.length;
    startRound(G);
  }
  function bonusScore(p, id) {
    var bc = BON[id], t = bc.test, n = birds(p).filter(function (x) {
      var b = x.b;
      if (t.t === 'ws') return t.lt ? b.ws < t.lt : b.ws > t.gt;
      if (t.t === 'nestEgg') return nestIs(b, t.n) && x.s.eggs > 0;
      if (t.t === 'eats') return eats(b, t.f);
      if (t.t === 'only') return b.h === t.h;
      if (t.t === 'pts') return b.p <= t.le;
      if (t.t === 'eggs') return x.s.eggs >= t.ge;
      if (t.t === 'power') return t.k.indexOf(b.pw) >= 0;
      return false;
    }).length;
    if (typeof bc.sc === 'string') return { n: n, pts: n * (+bc.sc) };
    var pts = 0; bc.sc.forEach(function (tier) { if (n >= tier[0]) pts = tier[1]; });
    return { n: n, pts: pts };
  }
  function scoreOf(G, seat) {
    var p = G.pl[seat], s = { birds: 0, bonus: 0, goals: 0, eggs: 0, cache: 0, tuck: 0, lead: p.lead || 0, total: 0 };
    G.gres.forEach(function (r) { s.goals += r.pts[seat] || 0; });
    if (p.auto) { s.birds = p.auto.birds.reduce(function (a, id) { return a + B[id].p; }, 0); s.eggs = p.auto.eggs; s.tuck = p.auto.tuck; s.lead += p.auto.extra || 0; }
    else {
      birds(p).forEach(function (x) { s.birds += x.b.p; s.eggs += x.s.eggs; s.cache += x.s.cache; s.tuck += x.s.tuck; });
      p.bonus.forEach(function (id) { s.bonus += bonusScore(p, id).pts; });
    }
    s.total = s.birds + s.bonus + s.goals + s.eggs + s.cache + s.tuck + s.lead;
    return s;
  }
  function finish(G) {
    G.phase = 'over'; G.q = null; G.work = [];
    var sc = G.pl.map(function (p, i) { return scoreOf(G, i); });
    var best = -1, win = [];
    sc.forEach(function (s, i) { var tb = s.total * 100 + (G.pl[i].auto ? 0 : foodN(G.pl[i])); if (tb > best) { best = tb; win = [i]; } else if (tb === best) win.push(i); });
    G.final = sc; G.winner = win.length === 1 ? win[0] : win;
    log(G, 'Game over. ' + sc.map(function (s, i) { return nameOf(G, i) + ' ' + s.total; }).join(', ') + '.');
    fx(G, { k: 'over' });
  }

  // ---------------- the work queue
  function push(G, task) { G.work.push(task); }
  function run(G) {   // resolve tasks until a decision is needed or the turn ends
    var guard = 0;
    while (!G.q && G.phase === 'play') {
      if (++guard > 500) throw new Error('work loop');
      var t = G.work.shift();
      if (!t) { endTurn(G); return; }
      doTask(G, t);
    }
  }
  function doTask(G, t) {
    var p = G.pl[t.seat];
    switch (t.k) {
      case 'bonusOffer': {
        var can = t.kind === 'card' ? p.hand.length > 0 : t.kind === 'food' ? foodN(p) > 0 : eggsOn(p) > 0;
        if (can) G.q = { seat: t.seat, h: 'bonus', d: { kind: t.kind, act: t.act } };
        break;
      }
      case 'die': {
        if (t.n <= 0) break;
        if (!G.feeder.length) rollAll(G);
        G.q = { seat: t.seat, h: 'die', d: { n: t.n, src: t.src || 'act' } };
        break;
      }
      case 'egg': {
        if (t.n <= 0 || eggSpace(p) <= 0) { if (t.n > 0) log(G, nameOf(G, t.seat) + ' has no room for more eggs.'); break; }
        G.q = { seat: t.seat, h: 'egg', d: { n: t.n, nest: t.nest || null } };
        break;
      }
      case 'draw': { if (t.n <= 0) break; if (!G.tray.some(Boolean) && !G.deck.length && !G.disc.length) { log(G, 'No cards left to draw.'); break; } G.q = { seat: t.seat, h: 'draw', d: { n: t.n } }; break; }
      case 'browns': {
        var row = p.board[t.h], list = [];
        for (var c = row.length - 1; c >= 0; c--) if (power(row[c].id).col === 'brown') list.push({ k: 'pw', seat: t.seat, h: t.h, c: c });
        if (list.length) fx(G, { k: 'chainStart', seat: t.seat, h: t.h, n: list.length });
        G.work = list.concat(G.work);
        break;
      }
      case 'pw': brown(G, t); break;
      case 'white': white(G, t); break;
      case 'pink': pink(G, t); break;
      case 'bonusPick': { var two = [G.bdeck.shift(), G.bdeck.shift()].filter(Boolean); if (two.length) G.q = { seat: t.seat, h: 'bonusPick', d: { opts: two } }; break; }
    }
  }
  function gain(G, seat, f, n, why) { G.pl[seat].food[f] += n || 1; fx(G, { k: 'food', seat: seat, f: f, n: n || 1, why: why }); }

  // ---------------- powers
  var FN = { grub: 'grub', seed: 'seed', fish: 'fish', berry: 'berry', rodent: 'rodent' };
  var NESTN = { bowl: 'bowl', cavity: 'cavity', ground: 'ground', platform: 'platform', star: 'any' };
  function power(id) {
    var b = B[id], k = b.pw, x = b.x || [];
    if (!k) return { col: null, txt: 'No power. A sturdy bird worth its points.' };
    var col = k[0] === 'w' ? 'white' : k[0] === 'p' ? 'pink' : 'brown';
    var T = {
      gainF: 'Gain 1 ' + FN[x[0]] + ' from the birdfeeder, if there is one.',
      gainS: 'Gain 1 ' + FN[x[0]] + ' from the supply.',
      cacheS: 'Cache 1 ' + FN[x[0]] + ' from the supply on this bird.',
      cacheF: 'Take 1 ' + FN[x[0]] + ' from the birdfeeder, if there is one, and cache it on this bird.',
      tuckDraw: 'Tuck 1 card from your hand behind this bird. If you do, draw 1 card.',
      tuckEgg: 'Tuck 1 card from your hand behind this bird. If you do, lay 1 egg on this bird.',
      tuckFood: 'Tuck 1 card from your hand behind this bird. If you do, gain 1 ' + FN[x[0]] + ' from the supply.',
      flock: 'Tuck the top card of the deck behind this bird.',
      laySelf: 'Lay 1 egg on this bird.',
      layNest: 'Lay 1 egg on each of your birds with a ' + NESTN[x[0]] + ' nest.',
      draw1: 'Draw 1 card from the deck.',
      hunt: 'Look at the top card of the deck. If its wingspan is under ' + x[0] + ' cm, tuck it behind this bird. If not, discard it.',
      huntDie: 'Roll all dice not in the birdfeeder. If any shows ' + FN[x[0]] + ', cache 1 ' + FN[x[0]] + ' on this bird.',
      allFood: 'Every player gains 1 ' + FN[x[0]] + ' from the supply.',
      allDraw: 'Every player draws 1 card from the deck.',
      trade: 'Discard 1 egg from another of your birds to draw 2 cards.',
      wDraw: 'When played: draw ' + x[0] + ' card' + (x[0] > 1 ? 's' : '') + '.',
      wFood: 'When played: gain ' + x[1] + ' ' + FN[x[0]] + ' from the supply.',
      wLaySelf: 'When played: lay ' + x[0] + ' eggs on this bird.',
      wLayNest: 'When played: lay 1 egg on each of your birds with a ' + NESTN[x[0]] + ' nest.',
      wBonus: 'When played: draw 2 bonus cards and keep 1.',
      wFeeder: 'When played: gain every ' + FN[x[0]] + ' in the birdfeeder.',
      wPlay: 'When played: play a second bird in your ' + HABS['FGW'.indexOf(x[0])] + '. Pay its normal cost.',
      pEgg: 'Between your turns, once: when another player lays eggs, lay 1 egg on this bird.',
      pFood: 'Between your turns, once: when another player gains food, gain 1 ' + FN[x[0]] + ' from the supply.',
      pTuck: 'Between your turns, once: when another player plays a bird in their ' + HABS['FGW'.indexOf(x[0])] + ', tuck the top card of the deck behind this bird.'
    };
    return { col: col, txt: T[k] || k, k: k, x: x };
  }
  function cell(G, seat, h, c) { return G.pl[seat].board[h][c]; }
  function brown(G, t) {
    var p = G.pl[t.seat], s = cell(G, t.seat, t.h, t.c); if (!s) return;
    var pw = power(s.id), x = pw.x, ev = { k: 'pw', seat: t.seat, h: t.h, c: t.c, id: s.id, txt: '' };
    var take = function (f) { var i = G.feeder.findIndex(function (d) { return d === f || (d === 'gs' && (f === 'grub' || f === 'seed')); }); if (i < 0) return false; G.feeder.splice(i, 1); return true; };
    switch (pw.k) {
      case 'gainF': if (take(x[0])) { p.food[x[0]]++; ev.txt = '+1 ' + x[0]; ev.f = x[0]; } else ev.txt = 'no ' + x[0] + ' in the feeder'; break;
      case 'gainS': p.food[x[0]]++; ev.txt = '+1 ' + x[0]; ev.f = x[0]; break;
      case 'cacheS': s.cache++; ev.txt = 'cached 1 ' + x[0]; ev.f = x[0]; break;
      case 'cacheF': if (take(x[0])) { s.cache++; ev.txt = 'cached 1 ' + x[0]; ev.f = x[0]; } else ev.txt = 'no ' + x[0] + ' in the feeder'; break;
      case 'flock': { var cd = drawCard(G); if (cd) { s.tuck++; ev.txt = 'tucked a card'; ev.tuck = 1; } break; }
      case 'laySelf': if (s.eggs < B[s.id].e) { s.eggs++; ev.txt = '+1 egg'; ev.egg = 1; } else ev.txt = 'nest full'; break;
      case 'layNest': { var n = 0; birds(p).forEach(function (y) { if (nestIs(y.b, x[0]) && y.s.eggs < y.b.e) { y.s.eggs++; n++; } }); ev.txt = '+' + n + ' egg' + (n === 1 ? '' : 's'); ev.egg = n; break; }
      case 'draw1': { var d1 = drawCard(G); if (d1) { p.hand.push(d1); ev.txt = 'drew a card'; ev.card = 1; } break; }
      case 'hunt': { var top = drawCard(G); if (top) { if (B[top].ws < +x[0]) { s.tuck++; ev.txt = 'caught it! (' + B[top].ws + ' cm)'; ev.tuck = 1; } else { G.disc.push(top); ev.txt = 'missed (' + B[top].ws + ' cm)'; } ev.seen = top; } break; }
      case 'huntDie': { var out = 5 - G.feeder.length, hit = false, faces = []; for (var k = 0; k < out; k++) { var fc = FACES[Math.floor(rnd(G) * 6)]; faces.push(fc); if (fc === x[0]) hit = true; } if (hit) { s.cache++; ev.txt = 'caught a ' + x[0] + '!'; ev.f = x[0]; } else ev.txt = out ? 'no luck' : 'no dice to roll'; ev.faces = faces; break; }
      case 'allFood': G.pl.forEach(function (q) { if (!q.auto) q.food[x[0]]++; }); ev.txt = 'everyone +1 ' + x[0]; ev.f = x[0]; break;
      case 'allDraw': G.pl.forEach(function (q) { if (!q.auto) { var c2 = drawCard(G); if (c2) q.hand.push(c2); } }); ev.txt = 'everyone draws 1'; ev.card = 1; break;
      case 'tuckDraw': case 'tuckEgg': case 'tuckFood':
        if (p.hand.length) { G.q = { seat: t.seat, h: 'pwTuck', d: { h: t.h, c: t.c, k: pw.k, x: x } }; fx(G, { k: 'pwAsk', seat: t.seat, h: t.h, c: t.c, id: s.id }); return; }
        ev.txt = 'no card to tuck'; break;
      case 'trade':
        if (eggSources(p, 1, { h: t.h, c: t.c })) { G.q = { seat: t.seat, h: 'pwTrade', d: { h: t.h, c: t.c } }; fx(G, { k: 'pwAsk', seat: t.seat, h: t.h, c: t.c, id: s.id }); return; }
        ev.txt = 'no egg to spend'; break;
    }
    log(G, nameOf(G, t.seat) + ': ' + B[s.id].n + ' - ' + ev.txt + '.');
    fx(G, ev);
  }
  function white(G, t) {
    var p = G.pl[t.seat], s = cell(G, t.seat, t.h, t.c); if (!s) return;
    var pw = power(s.id), x = pw.x, ev = { k: 'pw', seat: t.seat, h: t.h, c: t.c, id: s.id, txt: '', white: 1 };
    switch (pw.k) {
      case 'wDraw': for (var i = 0; i < +x[0]; i++) { var c = drawCard(G); if (c) p.hand.push(c); } ev.txt = 'drew ' + x[0]; ev.card = +x[0]; break;
      case 'wFood': p.food[x[0]] += +x[1]; ev.txt = '+' + x[1] + ' ' + x[0]; ev.f = x[0]; break;
      case 'wLaySelf': { var n = Math.min(+x[0], B[s.id].e - s.eggs); s.eggs += n; ev.txt = '+' + n + ' eggs'; ev.egg = n; break; }
      case 'wLayNest': { var m = 0; birds(p).forEach(function (y) { if (nestIs(y.b, x[0]) && y.s.eggs < y.b.e) { y.s.eggs++; m++; } }); ev.txt = '+' + m + ' eggs'; ev.egg = m; break; }
      case 'wBonus': G.work.unshift({ k: 'bonusPick', seat: t.seat }); ev.txt = 'draws 2 bonus cards'; break;
      case 'wFeeder': { var k2 = 0; for (var j = G.feeder.length - 1; j >= 0; j--) if (G.feeder[j] === x[0] || (G.feeder[j] === 'gs' && (x[0] === 'grub' || x[0] === 'seed'))) { G.feeder.splice(j, 1); k2++; } p.food[x[0]] += k2; ev.txt = '+' + k2 + ' ' + x[0]; ev.f = x[0]; break; }
      case 'wPlay': {
        var hab = 'FGW'.indexOf(x[0]);
        if (playable(G, t.seat, hab).length) { G.q = { seat: t.seat, h: 'play2', d: { hab: hab } }; fx(G, ev); ev.txt = 'may play another bird'; log(G, nameOf(G, t.seat) + ': ' + B[s.id].n + ' lets them play a second bird.'); return; }
        ev.txt = 'no second bird to play'; break;
      }
      default: return;
    }
    log(G, nameOf(G, t.seat) + ': ' + B[s.id].n + ' - ' + ev.txt + '.');
    fx(G, ev);
  }
  // pink: queued for each other player when the active player takes the matching action; resolves once between that player's turns
  function queuePinks(G, actor, kind, hab) {
    G.pl.forEach(function (q, seat) {
      if (seat === actor || q.auto || q.pink) return;
      var hit = null;
      birds(q).some(function (x) {
        var pw = power(x.s.id); if (pw.col !== 'pink') return false;
        if ((pw.k === 'pEgg' && kind === 'eggs') || (pw.k === 'pFood' && kind === 'food') || (pw.k === 'pTuck' && kind === 'play' && 'FGW'.indexOf(pw.x[0]) === hab)) { hit = x; return true; }
        return false;
      });
      if (hit) G.work.push({ k: 'pink', seat: seat, h: hit.h, c: hit.c });
    });
  }
  function pink(G, t) {
    var q = G.pl[t.seat]; if (q.pink) return; var s = cell(G, t.seat, t.h, t.c); if (!s) return;
    var pw = power(s.id), ev = { k: 'pw', seat: t.seat, h: t.h, c: t.c, id: s.id, pink: 1, txt: '' };
    if (pw.k === 'pEgg') { if (s.eggs < B[s.id].e) { s.eggs++; ev.txt = '+1 egg'; ev.egg = 1; } else return; }
    if (pw.k === 'pFood') { q.food[pw.x[0]]++; ev.txt = '+1 ' + pw.x[0]; ev.f = pw.x[0]; }
    if (pw.k === 'pTuck') { if (drawCard(G)) { s.tuck++; ev.txt = 'tucked a card'; ev.tuck = 1; } else return; }
    q.pink = true;
    log(G, nameOf(G, t.seat) + ' (between turns): ' + B[s.id].n + ' - ' + ev.txt + '.');
    fx(G, ev);
  }

  // ---------------- automa (solo rival): a shuffled deck of action cards each round
  var AUTO_CARDS = [{ a: 'play', m: 1 }, { a: 'play', m: 0 }, { a: 'food', m: 1 }, { a: 'eggs', m: 1 }, { a: 'eggs', m: 0 }, { a: 'draw', m: 1 }, { a: 'play', m: 1 }, { a: 'food', m: 0 }];
  function autoDeal(G, p) { p.auto.deck = shuffle(G, AUTO_CARDS.map(function (c) { return clone(c); })); p.auto.marks = 0; }
  function autoTurn(G, seat) {
    var p = G.pl[seat], a = p.auto, card = a.deck.shift() || { a: 'eggs', m: 0 }, lv = p.lvl, txt = '';
    if (card.m) a.marks += lv === 'hard' ? 2 : 1;
    if (card.a === 'play') { var id = drawCard(G); if (id) { a.birds.push(id); txt = 'adds ' + B[id].n + ' (' + B[id].p + ' pts) to its flock'; if (lv === 'hard') a.extra = (a.extra || 0) + 1; } }
    if (card.a === 'food') { if (!G.feeder.length) rollAll(G); var cnt = {}; G.feeder.forEach(function (f) { cnt[f] = (cnt[f] || 0) + 1; }); var best = Object.keys(cnt).sort(function (x, y) { return cnt[y] - cnt[x]; })[0]; G.feeder.splice(G.feeder.indexOf(best), 1); txt = 'takes a ' + (best === 'gs' ? 'grub/seed' : best) + ' die from the feeder'; queuePinks(G, seat, 'food'); }
    if (card.a === 'eggs') { var e = lv === 'easy' ? 1 : 2; a.eggs += e; txt = 'lays ' + e + ' eggs'; queuePinks(G, seat, 'eggs'); }
    if (card.a === 'draw') { var t = G.tray[0]; if (t) { G.tray[0] = null; a.tuck++; txt = 'takes ' + B[t].n + ' from the tray'; } else txt = 'rests'; }
    log(G, p.name + ' ' + txt + '.');
    fx(G, { k: 'auto', seat: seat, a: card.a, txt: txt });
    G.q = null; run(G);
  }

  // ---------------- legal moves
  function sideToAct(G) { if (G.phase === 'over') return -1; if (G.q) return G.q.seat; return G.cur; }
  function validMoves(G, seat) {
    if (G.phase === 'over' || sideToAct(G) !== seat) return [];
    var p = G.pl[seat], q = G.q, o = [];
    if (!q) {
      ['food', 'eggs', 'cards'].forEach(function (a) { o.push({ t: 'act', a: a }); });
      playable(G, seat).forEach(function (x) { x.inf.pays.forEach(function (pay) { o.push({ t: 'play', i: x.i, id: x.id, h: x.h, pay: pay }); }); });
      return o;
    }
    switch (q.h) {
      case 'setup': return [{ t: 'keep', any: true }];
      case 'automa': return [{ t: 'auto' }];
      case 'bonus': {
        o.push({ t: 'bonus', yes: false });
        if (q.d.kind === 'card') p.hand.forEach(function (id, i) { o.push({ t: 'bonus', yes: true, i: i }); });
        if (q.d.kind === 'food') FOODS.forEach(function (f) { if (p.food[f] > 0) o.push({ t: 'bonus', yes: true, f: f }); });
        if (q.d.kind === 'egg') birds(p).forEach(function (x) { if (x.s.eggs > 0) o.push({ t: 'bonus', yes: true, h: x.h, c: x.c }); });
        return o;
      }
      case 'die': {
        G.feeder.forEach(function (f, i) { if (f === 'gs') { o.push({ t: 'die', i: i, f: 'grub' }); o.push({ t: 'die', i: i, f: 'seed' }); } else o.push({ t: 'die', i: i, f: f }); });
        if (allSame(G)) o.push({ t: 'reroll' });
        return o;
      }
      case 'egg': birds(p).forEach(function (x) { if (x.s.eggs < x.b.e && (!q.d.nest || nestIs(x.b, q.d.nest))) o.push({ t: 'egg', h: x.h, c: x.c }); }); return o;
      case 'draw': G.tray.forEach(function (id, i) { if (id) o.push({ t: 'tray', i: i }); }); if (G.deck.length || G.disc.length) o.push({ t: 'deck' }); return o;
      case 'pwTuck': p.hand.forEach(function (id, i) { o.push({ t: 'tuck', i: i }); }); o.push({ t: 'skip' }); return o;
      case 'pwTrade': birds(p).forEach(function (x) { if (x.s.eggs > 0 && !(x.h === q.d.h && x.c === q.d.c)) o.push({ t: 'trade', h: x.h, c: x.c }); }); o.push({ t: 'skip' }); return o;
      case 'play2': playable(G, seat, q.d.hab).forEach(function (x) { x.inf.pays.forEach(function (pay) { o.push({ t: 'play', i: x.i, id: x.id, h: x.h, pay: pay }); }); }); o.push({ t: 'skip' }); return o;
      case 'bonusPick': q.d.opts.forEach(function (id, i) { o.push({ t: 'pickb', i: i }); }); return o;
    }
    return o;
  }

  // ---------------- applying a move
  function err(s) { return { ok: false, err: s }; }
  function performMove(G, m, seat) {
    if (G.phase === 'over') return err('game over');
    if (seat !== sideToAct(G)) return err('not your turn');
    G.fx = [];
    var p = G.pl[seat], q = G.q;
    if (!q) {
      if (m.t === 'act') {
        var h = m.a === 'food' ? 0 : m.a === 'eggs' ? 1 : 2, y = rowYield(p, h);
        log(G, nameOf(G, seat) + ' uses the ' + HABS[h] + ': ' + (h === 0 ? 'gain ' + y.n + ' food' : h === 1 ? 'lay ' + y.n + ' eggs' : 'draw ' + y.n + ' cards') + '.');
        fx(G, { k: 'action', seat: seat, h: h, n: y.n });
        G.work = [];
        if (y.bonus) push(G, { k: 'bonusOffer', seat: seat, kind: h === 0 ? 'card' : h === 1 ? 'food' : 'egg', act: h });
        push(G, h === 0 ? { k: 'die', seat: seat, n: y.n } : h === 1 ? { k: 'egg', seat: seat, n: y.n } : { k: 'draw', seat: seat, n: y.n });
        push(G, { k: 'browns', seat: seat, h: h });
        queuePinks(G, seat, m.a === 'cards' ? 'cards' : m.a);
        run(G); return { ok: true };
      }
      if (m.t === 'play') { var r = doPlay(G, seat, m, null); if (!r.ok) return r; run(G); return r; }
      return err('bad move');
    }
    switch (q.h) {
      case 'setup': {
        var off = p.offer, kb = m.birds || [], kf = m.food || [];
        if (kb.length + kf.length !== 5) return err('keep 5 in total');
        if (kb.some(function (i) { return !(i >= 0 && i < off.birds.length); }) || kf.some(function (f) { return FOODS.indexOf(f) < 0; })) return err('bad pick');
        if (new Set(kb).size !== kb.length || new Set(kf).size !== kf.length) return err('duplicate');
        if (!(m.bonus === 0 || m.bonus === 1)) return err('pick a bonus card');
        kb.forEach(function (i) { p.hand.push(off.birds[i]); });
        off.birds.forEach(function (id, i) { if (kb.indexOf(i) < 0) G.disc.push(id); });
        kf.forEach(function (f) { p.food[f]++; });
        p.bonus.push(off.bonus[m.bonus]); G.bdisc.push(off.bonus[1 - m.bonus]);
        p.offer = null; p.ready = true;
        log(G, nameOf(G, seat) + ' keeps ' + kb.length + ' bird' + (kb.length === 1 ? '' : 's') + ' and ' + kf.length + ' food.');
        setupQ(G); return { ok: true };
      }
      case 'automa': autoTurn(G, seat); return { ok: true };
      case 'bonus': {
        G.q = null;
        if (m.yes) {
          var w = G.work.find(function (t) { return t.k === 'die' || t.k === 'egg' || t.k === 'draw'; });
          if (q.d.kind === 'card') { if (!(m.i >= 0 && m.i < p.hand.length)) return (G.q = q, err('bad card')); G.disc.push(p.hand.splice(m.i, 1)[0]); }
          if (q.d.kind === 'food') { if (!(p.food[m.f] > 0)) return (G.q = q, err('bad food')); p.food[m.f]--; }
          if (q.d.kind === 'egg') { var s0 = p.board[m.h] && p.board[m.h][m.c]; if (!s0 || !s0.eggs) return (G.q = q, err('bad egg')); s0.eggs--; }
          if (w) w.n++;
          log(G, nameOf(G, seat) + ' trades for one more.');
          fx(G, { k: 'bonusTrade', seat: seat });
        }
        run(G); return { ok: true };
      }
      case 'die': {
        if (m.t === 'reroll') { if (!allSame(G)) return err('can only reroll when every die matches'); rollAll(G); log(G, nameOf(G, seat) + ' rerolls the birdfeeder.'); return { ok: true }; }
        var d = G.feeder[m.i]; if (d == null) return err('no such die');
        var f = d === 'gs' ? m.f : d; if (d === 'gs' && f !== 'grub' && f !== 'seed') return err('pick grub or seed');
        if (d !== 'gs' && m.f && m.f !== d) return err('wrong face');
        G.feeder.splice(m.i, 1); p.food[f]++;
        fx(G, { k: 'food', seat: seat, f: f, n: 1, die: m.i });
        var left = q.d.n - 1; G.q = null;
        if (left > 0) G.work.unshift({ k: 'die', seat: seat, n: left });
        run(G); return { ok: true };
      }
      case 'egg': {
        var s1 = p.board[m.h] && p.board[m.h][m.c]; if (!s1) return err('no bird');
        var b1 = B[s1.id]; if (s1.eggs >= b1.e) return err('nest full'); if (q.d.nest && !nestIs(b1, q.d.nest)) return err('wrong nest');
        s1.eggs++; fx(G, { k: 'egg', seat: seat, h: m.h, c: m.c });
        var l2 = q.d.n - 1; G.q = null; if (l2 > 0) G.work.unshift({ k: 'egg', seat: seat, n: l2, nest: q.d.nest });
        run(G); return { ok: true };
      }
      case 'draw': {
        var id;
        if (m.t === 'tray') { id = G.tray[m.i]; if (!id) return err('empty'); G.tray[m.i] = null; }
        else if (m.t === 'deck') { id = drawCard(G); if (!id) return err('deck empty'); }
        else return err('bad');
        p.hand.push(id); fx(G, { k: 'card', seat: seat, from: m.t, i: m.i });
        var l3 = q.d.n - 1; G.q = null;
        if (l3 > 0) G.work.unshift({ k: 'draw', seat: seat, n: l3 });
        run(G); return { ok: true };
      }
      case 'pwTuck': {
        var cs = p.board[q.d.h][q.d.c], ev = { k: 'pw', seat: seat, h: q.d.h, c: q.d.c, id: cs.id };
        if (m.t === 'tuck') {
          if (!(m.i >= 0 && m.i < p.hand.length)) return err('bad card');
          p.hand.splice(m.i, 1); cs.tuck++; ev.tuck = 1;
          if (q.d.k === 'tuckDraw') { var dc = drawCard(G); if (dc) p.hand.push(dc); ev.txt = 'tucked 1, drew 1'; ev.card = 1; }
          if (q.d.k === 'tuckEgg') { if (cs.eggs < B[cs.id].e) { cs.eggs++; ev.egg = 1; } ev.txt = 'tucked 1, +1 egg'; }
          if (q.d.k === 'tuckFood') { p.food[q.d.x[0]]++; ev.f = q.d.x[0]; ev.txt = 'tucked 1, +1 ' + q.d.x[0]; }
        } else ev.txt = 'skipped';
        log(G, nameOf(G, seat) + ': ' + B[cs.id].n + ' - ' + ev.txt + '.'); fx(G, ev);
        G.q = null; run(G); return { ok: true };
      }
      case 'pwTrade': {
        var ts = p.board[q.d.h][q.d.c], ev2 = { k: 'pw', seat: seat, h: q.d.h, c: q.d.c, id: ts.id };
        if (m.t === 'trade') {
          var src = p.board[m.h] && p.board[m.h][m.c]; if (!src || !src.eggs || (m.h === q.d.h && m.c === q.d.c)) return err('bad egg');
          src.eggs--; for (var k = 0; k < 2; k++) { var cc = drawCard(G); if (cc) p.hand.push(cc); } ev2.txt = '1 egg for 2 cards'; ev2.card = 2;
        } else ev2.txt = 'skipped';
        log(G, nameOf(G, seat) + ': ' + B[ts.id].n + ' - ' + ev2.txt + '.'); fx(G, ev2);
        G.q = null; run(G); return { ok: true };
      }
      case 'play2': {
        if (m.t === 'skip') { G.q = null; run(G); return { ok: true }; }
        var r2 = doPlay(G, seat, m, q.d.hab); if (!r2.ok) return r2; run(G); return r2;
      }
      case 'bonusPick': {
        if (!(m.i === 0 || m.i === 1) || !q.d.opts[m.i]) return err('pick one');
        p.bonus.push(q.d.opts[m.i]); q.d.opts.forEach(function (id, i) { if (i !== m.i) G.bdisc.push(id); });
        log(G, nameOf(G, seat) + ' keeps a new bonus card.');
        G.q = null; run(G); return { ok: true };
      }
    }
    return err('bad move');
  }
  function doPlay(G, seat, m, onlyHab) {
    var p = G.pl[seat], id = p.hand[m.i];
    if (!id || (m.id && m.id !== id)) return err('card not in hand');
    var inf = playInfo(G, seat, id, m.h, onlyHab); if (!inf) return err('cannot play there');
    var pay = m.pay || inf.pays[0];
    if (!inf.pays.some(function (x) { return FOODS.every(function (f) { return (x[f] || 0) === (pay[f] || 0); }); })) return err('payment does not fit');
    var eggs = m.eggs || eggSources(p, inf.eggs);
    if (!eggs || eggs.length !== inf.eggs) return err('eggs');
    var tmp = {}; for (var e = 0; e < eggs.length; e++) { var k = eggs[e][0] + ':' + eggs[e][1], s = p.board[eggs[e][0]] && p.board[eggs[e][0]][eggs[e][1]]; tmp[k] = (tmp[k] || 0) + 1; if (!s || s.eggs < tmp[k]) return err('egg source'); }
    eggs.forEach(function (x) { p.board[x[0]][x[1]].eggs--; });
    FOODS.forEach(function (f) { p.food[f] -= pay[f] || 0; });
    p.hand.splice(m.i, 1);
    p.board[m.h].push({ id: id, eggs: 0, cache: 0, tuck: 0 });
    var col = p.board[m.h].length - 1;
    log(G, nameOf(G, seat) + ' plays ' + B[id].n + ' in the ' + HABS[m.h] + '.');
    fx(G, { k: 'play', seat: seat, h: m.h, c: col, id: id });
    G.q = null; G.work = G.work || [];
    var tasks = [];
    if (power(id).col === 'white') tasks.push({ k: 'white', seat: seat, h: m.h, c: col });
    G.work = tasks.concat(G.work);
    if (onlyHab == null) queuePinks(G, seat, 'play', m.h);
    return { ok: true };
  }

  // ---------------- checks and text
  function checkInvariants(G) {
    var bad = [], seen = {};
    function see(id, where) { if (!id) return; if (seen[id]) bad.push('card twice: ' + id + ' (' + where + ' and ' + seen[id] + ')'); seen[id] = where; }
    G.deck.forEach(function (id) { see(id, 'deck'); }); G.disc.forEach(function (id) { see(id, 'disc'); }); G.tray.forEach(function (id) { see(id, 'tray'); });
    G.pl.forEach(function (p, i) {
      p.hand.forEach(function (id) { see(id, 'hand' + i); });
      if (p.offer) p.offer.birds.forEach(function (id) { see(id, 'offer' + i); });
      if (p.auto) p.auto.birds.forEach(function (id) { see(id, 'auto' + i); });
      p.board.forEach(function (row, h) { if (row.length > 5) bad.push('row over 5'); row.forEach(function (s) { see(s.id, 'board' + i); var b = B[s.id]; if (b.h.indexOf(HK[h]) < 0) bad.push('wrong habitat ' + s.id); if (s.eggs < 0 || s.eggs > b.e) bad.push('eggs out of range ' + s.id); }); });
      FOODS.forEach(function (f) { if (p.food[f] < 0) bad.push('negative food ' + f); });
    });
    var total = Object.keys(seen).length, tucked = 0;
    G.pl.forEach(function (p) { if (p.auto) tucked += p.auto.tuck; p.board.forEach(function (r) { r.forEach(function (s) { tucked += s.tuck; }); }); });
    if (total + tucked > DATA.birds.length) bad.push('more cards than exist: ' + (total + tucked));
    if (G.feeder.length > 5) bad.push('feeder over 5');
    if (G.phase === 'play' && !G.q && G.work.length) bad.push('work left with no decision');
    return bad;
  }
  function render_game_to_text(G) {
    var L = ['Round ' + (G.round + 1) + '/' + G.rounds + ' phase ' + G.phase + ' turn of ' + (G.pl[G.cur] && G.pl[G.cur].name) + (G.q ? ' deciding ' + G.q.h : ''),
      'Feeder: ' + G.feeder.join(' ') + ' | Tray: ' + G.tray.map(function (id) { return id ? B[id].n : '-'; }).join(', ')];
    G.pl.forEach(function (p, i) {
      L.push(p.name + ': cubes ' + p.cubes + ' hand ' + p.hand.length + ' food ' + FOODS.map(function (f) { return f[0] + p.food[f]; }).join('') + ' score ' + scoreOf(G, i).total);
      p.board.forEach(function (r, h) { L.push('  ' + HABS[h] + ': ' + r.map(function (s) { return B[s.id].n + '(e' + s.eggs + (s.cache ? ' c' + s.cache : '') + (s.tuck ? ' t' + s.tuck : '') + ')'; }).join(', ')); });
    });
    return L.join('\n');
  }

  var PP = { DATA: DATA, B: B, BON: BON, GOL: GOL, FOODS: FOODS, FACES: FACES, HABS: HABS, YIELD: YIELD, BONUSSP: BONUSSP, EGGCOST: EGGCOST, CUBES: CUBES, GOALPTS: GOALPTS,
    newGame: newGame, validMoves: validMoves, performMove: performMove, sideToAct: sideToAct, checkInvariants: checkInvariants, render_game_to_text: render_game_to_text,
    payOptions: payOptions, playInfo: playInfo, playable: playable, eggSources: eggSources, rowYield: rowYield, power: power, scoreOf: scoreOf, bonusScore: bonusScore,
    goalCount: goalCount, placeGoal: placeGoal, birds: birds, eggsOn: eggsOn, eggSpace: eggSpace, foodN: foodN, allSame: allSame, nestIs: nestIs, eats: eats, clone: clone, rnd: rnd, shuffle: shuffle };
  root.PP = PP;
  if (typeof module !== 'undefined') module.exports = PP;
})(typeof window !== 'undefined' ? window : globalThis);

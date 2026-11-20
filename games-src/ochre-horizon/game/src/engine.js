// Ochre Horizon rules engine. One JSON-safe state G (no functions). Works in the page (window.OH) and in node.
// Rules: generations of research -> actions -> production; temperature/oxygen/oceans with bonus steps; tiles with placement and
// ocean-adjacency bonuses; milestones and awards; terraform-rating scoring. See ../../rules-notes.md.
(function (root) {
  var isNode = typeof module !== 'undefined';
  var DATA = root.OH_DATA || (isNode ? require('./data.js') : null);
  var MAP = root.OH_MAP || (isNode ? require('./map.js') : null);
  var CARDS = {}, CORPS = {};
  DATA.cards.forEach(function (c) { CARDS[c.id] = c; });
  DATA.corps.forEach(function (c) { CORPS[c.id] = c; });
  var RES = ['mc', 'steel', 'ti', 'plant', 'energy', 'heat'];
  var TAGS = ['building', 'space', 'science', 'power', 'earth', 'jovian', 'plant', 'microbe', 'animal', 'city'];
  var TEMP_MIN = -30, TEMP_MAX = 8, OXY_MAX = 14, OCEAN_MAX = 9;
  var STD = { sell: 0, power: 11, asteroid: 14, aquifer: 18, greenery: 23, city: 25 };
  var STD_NAME = { sell: 'Sell cards', power: 'Power plant', asteroid: 'Comet strike', aquifer: 'Aquifer', greenery: 'Greenery', city: 'City' };
  var AWARD_COST = [8, 14, 20];
  var G = null;

  // ---------- rng ----------
  function rnd() { var t = (G.rs += 0x6D2B79F5) | 0; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function card(id) { return CARDS[id] || CORPS[id]; }
  function other(p) { return 1 - p; }
  function log(p, s) { G.log.push({ g: G.gen, p: p, s: s }); if (G.log.length > 400) G.log.shift(); }
  function ev(e) { G.ev.push(e); if (G.ev.length > 200) G.ev.shift(); }

  // ---------- setup ----------
  function newPlayer() { return { corp: null, tr: 20, mc: 0, steel: 0, ti: 0, plant: 0, energy: 0, heat: 0, prod: { mc: 0, steel: 0, ti: 0, plant: 0, energy: 0, heat: 0 }, hand: [], played: [], res: {}, used: {}, offer: null, research: [], passed: false, buys: 0, vpExtra: 0 }; }
  function newGame(o) {
    o = o || {};
    G = { v: 1, seed: o.seed >>> 0 || 1, rs: o.seed >>> 0 || 1, gen: 1, phase: 'setup', first: 0, turn: 0, acts: 0, temp: TEMP_MIN, oxy: 0, oceans: 0,
      tiles: {}, deck: [], discard: [], pl: [newPlayer(), newPlayer()], milestones: {}, awards: [], q: [], pending: null, log: [], ev: [],
      opts: { draft: !!o.draft, corpsDealt: o.corpsDealt || 2 }, draft: null, over: false, final: null, stats: { std: 0, cards: 0 } };
    G.deck = shuffle(DATA.cards.map(function (c) { return c.id; }));
    var corps = shuffle(DATA.corps.filter(function (c) { return !c.beginner; }).map(function (c) { return c.id; }));
    for (var p = 0; p < 2; p++) {
      var oc = corps.splice(0, G.opts.corpsDealt);
      if (o.beginner) oc.push('c00');
      G.pl[p].offer = { corps: oc, cards: draw(10) };
    }
    log(-1, 'Generation 1 begins.');
    return G;
  }
  function draw(n) { var out = []; for (var i = 0; i < n; i++) { if (!G.deck.length) { G.deck = shuffle(G.discard); G.discard = []; } if (!G.deck.length) break; out.push(G.deck.pop()); } return out; }

  // ---------- derived values ----------
  function tagCount(p, tag) {
    var P = G.pl[p], n = 0;
    P.played.forEach(function (id) { var c = CARDS[id]; if (c && c.type !== 'event') (c.tags || []).forEach(function (t) { if (t === tag) n++; }); });
    if (P.corp) (CORPS[P.corp].tags || []).forEach(function (t) { if (t === tag) n++; });
    return n;
  }
  function effects(p) { var P = G.pl[p], out = []; var ids = P.played.slice(); if (P.corp) ids.unshift(P.corp); ids.forEach(function (id) { var c = card(id); if (c && c.effect && (c.type === 'active' || CORPS[id])) c.effect.forEach(function (e) { out.push({ e: e, src: id }); }); }); return out; }
  function effKind(e) { if (e.e) return e.e; for (var k in e) if (k !== 'do' && k !== 'any' && k !== 'tag' && k !== 't' && k !== 'n' && k !== 'min' && k !== 'which') return k; return e.disc !== undefined ? 'disc' : '?'; }
  function effSum(p, kind) { var s = 0; effects(p).forEach(function (x) { if (kindOf(x.e) === kind) s += (x.e.n || x.e[kind] || 0); }); return s; }
  function kindOf(e) {
    if (e.e) return e.e;
    if (e.onTag !== undefined || (e.tag && e.do && e.disc === undefined)) return 'onTag';
    if (e.onTile !== undefined || (e.t && e.do)) return 'onTile';
    if (e.onPay !== undefined || (e.min !== undefined && e.do)) return 'onPay';
    var ks = ['disc', 'steelVal', 'tiVal', 'reqSlack', 'stdDisc', 'greenCost', 'heatAsMc'];
    for (var i = 0; i < ks.length; i++) if (e[ks[i]] !== undefined) return ks[i];
    return '?';
  }
  function steelVal(p) { return 2 + effSum(p, 'steelVal'); }
  function tiVal(p) { return 3 + effSum(p, 'tiVal'); }
  function greenCost(p) { var c = 8; effects(p).forEach(function (x) { if (kindOf(x.e) === 'greenCost') c = Math.min(c, x.e.n); }); return c; }
  function heatAsMc(p) { return effects(p).some(function (x) { return kindOf(x.e) === 'heatAsMc'; }); }
  function cardCost(p, id) {
    var c = CARDS[id], d = 0;
    effects(p).forEach(function (x) { if (kindOf(x.e) === 'disc') { var t = x.e.tag; if (!t || (c.tags || []).indexOf(t) >= 0 || (t === 'event' && c.type === 'event')) d += x.e.n; } });
    return Math.max(0, c.cost - d);
  }
  function stdCost(p, k) { var d = 0; effects(p).forEach(function (x) { if (kindOf(x.e) === 'stdDisc' && (!x.e.which || x.e.which === k)) d += x.e.n; }); return Math.max(0, STD[k] - d); }
  function cities(p, all) { var n = 0; for (var s in G.tiles) { var t = G.tiles[s]; if (t.t === 'city' && (all || t.o === p)) n++; } return n; }
  function greeneries(p, all) { var n = 0; for (var s in G.tiles) { var t = G.tiles[s]; if (t.t === 'greenery' && (all || t.o === p)) n++; } return n; }
  function tilesOnMap(p) { var n = 0; for (var s in G.tiles) { var t = G.tiles[s]; if (t.o === p && !MAP.OFFMAP[s]) n++; } return n; }
  function perCount(p, per) {
    var m = per.split(':');
    if (m[0] === 'tag') return tagCount(p, m[1]);
    if (m[0] === 'tagAll') return tagCount(0, m[1]) + tagCount(1, m[1]);
    if (per === 'cities') return cities(p); if (per === 'citiesAll') return cities(p, true);
    if (per === 'oceans') return G.oceans;
    if (per === 'greeneries') return greeneries(p); if (per === 'greeneriesAll') return greeneries(p, true);
    return 0;
  }
  function reqOk(p, req) {
    if (!req) return true;
    var sl = effSum(p, 'reqSlack');
    var gv = { temp: [G.temp, 2], oxy: [G.oxy, 1], ocean: [G.oceans, 1] };
    for (var k in req) {
      var q = req[k];
      if (gv[k]) { var v = gv[k][0], st = gv[k][1]; if (q.min !== undefined && v < q.min - sl * st) return false; if (q.max !== undefined && v > q.max + sl * st) return false; }
      else if (k === 'tags') { for (var t in q) if (tagCount(p, t) < q[t]) return false; }
      else if (k === 'prod') { for (var r in q) if (G.pl[p].prod[r] < q[r]) return false; }
      else if (k === 'cities') { if (cities(p) < (q.min || q)) return false; }
      else if (k === 'greeneries') { if (greeneries(p) < (q.min || q)) return false; }
    }
    return true;
  }
  // can the immediate ops be paid / done at all (negative production, lose)?
  function opsPossible(p, ops, c) {
    var P = G.pl[p];
    for (var i = 0; i < (ops || []).length; i++) {
      var o = ops[i];
      if (o.op === 'prod' && o.n < 0) { var fl = o.r === 'mc' ? -5 : 0; if (P.prod[o.r] + o.n < fl) return false; }
      if (o.op === 'lose' && P[o.r] < o.n) return false;
      if (o.op === 'useres' && (P.res[c] || 0) < o.n) return false;
      if (o.op === 'tile' && o.where && /^(reserved|offmap)/.test(o.where) && !legalSpaces(p, o.t, o.where).length) return false;
    }
    return true;
  }
  function maxPay(p, c, cost) {
    var P = G.pl[p], pay = { steel: 0, ti: 0, heat: 0, mc: 0 }, left = cost;
    if ((c.tags || []).indexOf('space') >= 0 && P.ti) { var tv = tiVal(p); pay.ti = Math.min(P.ti, Math.floor(left / tv)); left -= pay.ti * tv; if (left > P.mc && P.ti > pay.ti) { pay.ti++; left = Math.max(0, left - tv); } }
    if ((c.tags || []).indexOf('building') >= 0 && P.steel && left > 0) { var sv = steelVal(p); pay.steel = Math.min(P.steel, Math.floor(left / sv)); left -= pay.steel * sv; if (left > P.mc && P.steel > pay.steel) { pay.steel++; left = Math.max(0, left - sv); } }
    if (left > P.mc && heatAsMc(p)) { pay.heat = Math.min(P.heat, left - P.mc); left -= pay.heat; }
    pay.mc = left;
    return pay;
  }
  function canAffordCard(p, id) { var c = CARDS[id], cost = cardCost(p, id), pay = maxPay(p, c, cost); return pay.mc <= G.pl[p].mc; }
  function playable(p, id) {
    var c = CARDS[id]; if (!c) return false;
    return reqOk(p, c.req) && canAffordCard(p, id) && opsPossible(p, c.play, id);
  }

  // ---------- tiles ----------
  function sp(id) { return MAP.spaces[id] || MAP.OFFMAP[id]; }
  function adjOwn(p, s) { return sp(s).adj.some(function (a) { return G.tiles[a] && G.tiles[a].o === p; }); }
  function legalSpaces(p, t, where) {
    where = where || 'default';
    var m = where.split(':');
    if (m[0] === 'offmap') return G.tiles[m[1]] ? [] : [m[1]];
    if (m[0] === 'reserved' || where === 'noctis') { var r = MAP.order.filter(function (s) { return sp(s).reserved && !G.tiles[s]; }); return r; }
    var out = [];
    MAP.order.forEach(function (s) {
      var S = sp(s); if (G.tiles[s] || S.reserved) return;
      if (t === 'ocean') { if (!S.ocean) return; out.push(s); return; }
      if (where === 'ocean') { if (!S.ocean) return; } else if (S.ocean) return;
      if (where === 'volcanic' && !S.volcanic) return;
      if (where === 'isolated' && S.adj.some(function (a) { return G.tiles[a]; })) return;
      if (t === 'city' && S.adj.some(function (a) { return G.tiles[a] && G.tiles[a].t === 'city'; })) return;
      if (where === 'nextToOwn' && !adjOwn(p, s)) return;
      out.push(s);
    });
    if (t === 'greenery' && where === 'default') { var near = out.filter(function (s) { return adjOwn(p, s); }); if (near.length) return near; }
    return out;
  }
  function placeTile(p, t, s, src) {
    var S = sp(s), P = G.pl[p];
    G.tiles[s] = { t: t, o: t === 'ocean' ? -1 : p }; if (src) G.tiles[s].card = src;
    var gains = [];
    S.bonus.forEach(function (b) { if (b === 'card') { P.hand = P.hand.concat(draw(1)); gains.push('card'); } else { P[b]++; gains.push(b); } });
    var oc = S.adj.filter(function (a) { return G.tiles[a] && G.tiles[a].t === 'ocean'; }).length;
    if (oc) { P.mc += 2 * oc; gains.push(oc * 2 + 'mc'); }
    ev({ k: 'tile', p: p, s: s, t: t, gains: gains });
    log(p, (p === 0 ? 'You' : 'Rival') + ' placed ' + (t === 'special' ? 'a special tile' : t === 'ocean' ? 'an ocean' : 'a ' + t) + (S.name ? ' on ' + S.name : '') + (gains.length ? ' (+' + gains.join(', +') + ')' : '') + '.');
    var front = [];
    if (t === 'greenery') front.push({ p: p, op: { op: 'oxy', n: 1 }, src: 'tile' });
    if (t === 'ocean') { G.oceans++; P.tr++; ev({ k: 'tr', p: p, n: 1 }); }
    for (var q = 0; q < 2; q++) effects(q).forEach(function (x) {
      if (kindOf(x.e) === 'onTile' && (x.e.t === t || (x.e.onTile === t)) && (q === p || x.e.any)) x.e.do.forEach(function (o) { front.push({ p: q, op: o, src: x.src }); });
    });
    G.q = front.concat(G.q);
  }

  // ---------- globals ----------
  function raise(p, k, n) {
    var P = G.pl[p];
    for (var i = 0; i < n; i++) {
      if (k === 'temp') {
        if (G.temp >= TEMP_MAX) break;
        G.temp += 2; P.tr++; ev({ k: 'temp', p: p, v: G.temp }); log(p, (p === 0 ? 'You' : 'Rival') + ' raised the temperature to ' + G.temp + '°C.');
        if (G.temp === -24 || G.temp === -20) { P.prod.heat++; log(p, 'Bonus: +1 heat production.'); }
        if (G.temp === 0) G.q.unshift({ p: p, op: { op: 'ocean', n: 1 }, src: 'bonus' });
      } else if (k === 'oxy') {
        if (G.oxy >= OXY_MAX) break;
        G.oxy++; P.tr++; ev({ k: 'oxy', p: p, v: G.oxy }); log(p, (p === 0 ? 'You' : 'Rival') + ' raised oxygen to ' + G.oxy + '%.');
        if (G.oxy === 8) G.q.unshift({ p: p, op: { op: 'temp', n: 1 }, src: 'bonus' });
      }
    }
  }

  // ---------- op queue ----------
  function queueOps(p, ops, src) { G.q = G.q.concat((ops || []).map(function (o) { return { p: p, op: o, src: src }; })); }
  function run() {
    while (!G.pending && G.q.length) {
      var it = G.q.shift(), p = it.p, o = it.op, P = G.pl[p], R = G.pl[other(p)];
      switch (o.op) {
        case 'prod': P.prod[o.r] = Math.max(o.r === 'mc' ? -5 : 0, P.prod[o.r] + o.n); ev({ k: 'prod', p: p, r: o.r, n: o.n }); break;
        case 'gain': P[o.r] += o.n; ev({ k: 'gain', p: p, r: o.r, n: o.n }); break;
        case 'lose': P[o.r] = Math.max(0, P[o.r] - o.n); break;
        case 'rprod': { var fl = o.r === 'mc' ? -5 : 0, cut = Math.min(o.n, R.prod[o.r] - fl); if (cut > 0) { R.prod[o.r] -= cut; ev({ k: 'prod', p: other(p), r: o.r, n: -cut }); log(p, (p === 0 ? 'You' : 'Rival') + ' cut ' + cut + ' ' + o.r + ' production.'); } break; }
        case 'rres': { var c2 = Math.min(o.n, R[o.r]); if (c2 > 0) { R[o.r] -= c2; ev({ k: 'gain', p: other(p), r: o.r, n: -c2 }); log(p, (p === 0 ? 'You' : 'Rival') + ' removed ' + c2 + ' ' + o.r + '.'); } break; }
        case 'temp': raise(p, 'temp', o.n); break;
        case 'oxy': raise(p, 'oxy', o.n); break;
        case 'tr': P.tr += o.n; ev({ k: 'tr', p: p, n: o.n }); break;
        case 'ocean': {
          var left = o.n;
          for (var i = 0; i < left; i++) { if (G.oceans + (G.q.filter(function (x) { return x.op.op === 'oceanPlace'; }).length) >= OCEAN_MAX) break; G.q.unshift({ p: p, op: { op: 'oceanPlace' }, src: it.src }); }
          break;
        }
        case 'oceanPlace': { if (G.oceans >= OCEAN_MAX) break; var ls = legalSpaces(p, 'ocean'); if (!ls.length) break; G.pending = { p: p, h: 'place', d: { t: 'ocean', spaces: ls, src: it.src } }; break; }
        case 'tile': { var l2 = legalSpaces(p, o.t, o.where); if (!l2.length) break; G.pending = { p: p, h: 'place', d: { t: o.t, spaces: l2, src: it.src } }; break; }
        case 'draw': {
          if (o.tag) { var got = [], seen = 0; while (got.length < o.n && seen < 60) { var d = draw(1); if (!d.length) break; seen++; if ((CARDS[d[0]].tags || []).indexOf(o.tag) >= 0) got.push(d[0]); else G.discard.push(d[0]); } P.hand = P.hand.concat(got); ev({ k: 'draw', p: p, n: got.length }); }
          else { var dd = draw(o.n); P.hand = P.hand.concat(dd); ev({ k: 'draw', p: p, n: dd.length }); }
          break;
        }
        case 'addres': {
          var kind = o.kind || (card(it.src) && card(it.src).res);
          if (o.to === 'self' && card(it.src) && card(it.src).res) { P.res[it.src] = (P.res[it.src] || 0) + o.n; ev({ k: 'res', p: p, id: it.src, n: o.n }); break; }
          var cand = P.played.filter(function (id) { return CARDS[id] && CARDS[id].res === kind; });
          if (P.corp && CORPS[P.corp].res === kind) cand.push(P.corp);
          if (!cand.length) break;
          if (cand.length === 1) { P.res[cand[0]] = (P.res[cand[0]] || 0) + o.n; ev({ k: 'res', p: p, id: cand[0], n: o.n }); break; }
          G.pending = { p: p, h: 'pickres', d: { n: o.n, cards: cand, kind: kind } }; break;
        }
        case 'gainper': { var g = Math.floor(perCount(p, o.per) / (o.div || 1)) * o.n; P[o.r] += g; if (g) ev({ k: 'gain', p: p, r: o.r, n: g }); break; }
        case 'prodper': { var g2 = Math.floor(perCount(p, o.per) / (o.div || 1)) * o.n; P.prod[o.r] += g2; if (g2) ev({ k: 'prod', p: p, r: o.r, n: g2 }); break; }
        case 'choose': {
          var okOpts = o.opts.map(function (l, i) { return opsPossible(p, l, it.src) ? i : -1; }).filter(function (i) { return i >= 0; });
          if (!okOpts.length) break;
          G.pending = { p: p, h: 'choose', d: { opts: o.opts, ok: okOpts, src: it.src } }; break;
        }
        case 'useres': P.res[it.src] = Math.max(0, (P.res[it.src] || 0) - o.n); break;
      }
    }
  }

  // ---------- turn flow ----------
  function sideToAct() {
    if (!G || G.over) return -1;
    if (G.pending) return G.pending.p;
    if (G.phase === 'setup') return G.pl[0].offer ? 0 : G.pl[1].offer ? 1 : -1;
    if (G.phase === 'draft') { var a = G.draft.picked[0].length, b = G.draft.picked[1].length; return a <= b ? 0 : 1; }
    if (G.phase === 'research') return !G.pl[0].bought ? 0 : !G.pl[1].bought ? 1 : -1;
    if (G.phase === 'action' || G.phase === 'final') return G.turn;
    return -1;
  }
  function nextTurn(p) {
    G.acts = 0;
    var o = other(p);
    if (G.pl[0].passed && G.pl[1].passed) { production(); return; }
    G.turn = G.pl[o].passed ? p : o;
  }
  function production() {
    G.phase = 'production';
    for (var p = 0; p < 2; p++) {
      var P = G.pl[p];
      P.heat += P.energy; P.energy = 0;
      P.mc += P.prod.mc + P.tr; P.steel += P.prod.steel; P.ti += P.prod.ti; P.plant += P.prod.plant; P.energy += P.prod.energy; P.heat += P.prod.heat;
      P.used = {}; P.passed = false;
    }
    ev({ k: 'production' });
    log(-1, 'Production: everyone gets income.');
    if (G.temp >= TEMP_MAX && G.oxy >= OXY_MAX && G.oceans >= OCEAN_MAX) { G.phase = 'final'; G.turn = G.first; G.finalDone = [false, false]; log(-1, 'Ochre is alive! Last chance to plant greenery.'); return; }
    G.gen++; G.first = other(G.first);
    log(-1, 'Generation ' + G.gen + ' begins.');
    if (G.gen > 40) { finish(); return; }
    startResearch();
  }
  function startResearch() {
    if (G.opts.draft) {
      G.phase = 'draft'; G.draft = { hands: [draw(4), draw(4)], picked: [[], []] };
    } else {
      G.phase = 'research';
      for (var p = 0; p < 2; p++) { G.pl[p].research = draw(4); G.pl[p].bought = false; }
    }
  }
  function startActions() { G.phase = 'action'; G.turn = G.first; G.acts = 0; }
  function finish() {
    G.over = true; G.phase = 'over';
    var s = [score(0), score(1)];
    G.final = s;
    G.winner = s[0].total > s[1].total ? 0 : s[1].total > s[0].total ? 1 : (G.pl[0].mc >= G.pl[1].mc ? 0 : 1);
    log(-1, 'Game over. ' + (G.winner === 0 ? 'You win' : 'Rival wins') + ' ' + s[G.winner].total + ' to ' + s[other(G.winner)].total + '.');
  }

  // ---------- scoring ----------
  function awardMetric(p, m) {
    var P = G.pl[p];
    if (m === 'tilesOnMap') return tilesOnMap(p);
    if (m === 'mcProd') return P.prod.mc;
    if (m === 'heat') return P.heat;
    if (m === 'stProd') return P.prod.steel + P.prod.ti;
    if (m.indexOf('tag:') === 0) return tagCount(p, m.slice(4));
    return 0;
  }
  function mileMetric(p, m) {
    var P = G.pl[p];
    if (m === 'tr') return P.tr; if (m === 'cities') return cities(p); if (m === 'plantProd') return P.prod.plant;
    if (m.indexOf('tag:') === 0) return tagCount(p, m.slice(4));
    return 0;
  }
  function cardVP(p, id) {
    var c = card(id), P = G.pl[p]; if (!c || !c.vp) return 0;
    if (typeof c.vp === 'number') return c.vp;
    var v = c.vp, every = v.every || 1, n = v.n || 1, base = 0;
    if (v.per === 'res') base = P.res[id] || 0;
    else if (v.per === 'tag') base = tagCount(p, v.tag);
    else if (v.per === 'adjOcean' || v.per === 'cityAdj') {
      var at = null; for (var s in G.tiles) if (G.tiles[s].card === id) at = s;
      if (!at) return 0;
      base = sp(at).adj.filter(function (a) { return G.tiles[a] && G.tiles[a].t === (v.per === 'adjOcean' ? 'ocean' : (v.t || 'city')); }).length;
    } else if (v.per === 'cities') base = cities(p); else if (v.per === 'citiesAll') base = cities(p, true);
    else if (v.per === 'oceans') base = G.oceans; else if (v.per === 'greeneriesAll') base = greeneries(p, true);
    return Math.floor(base / every) * n;
  }
  function score(p) {
    var P = G.pl[p], s = { tr: P.tr, mile: 0, award: 0, green: 0, city: 0, cards: 0, total: 0 };
    for (var k in G.milestones) if (G.milestones[k] === p) s.mile += 5;
    G.awards.forEach(function (k) {
      var A = MAP.AWARDS.filter(function (a) { return a.k === k; })[0], me = awardMetric(p, A.m), them = awardMetric(other(p), A.m);
      if (me >= them) s.award += 5;   // 2 players: only first place scores; a tie gives both 5
    });
    for (var t in G.tiles) {
      var T = G.tiles[t]; if (T.o !== p) continue;
      if (T.t === 'greenery') s.green++;
      if (T.t === 'city') s.city += sp(t).adj.filter(function (a) { return G.tiles[a] && G.tiles[a].t === 'greenery'; }).length;
    }
    var ids = P.played.slice(); if (P.corp) ids.push(P.corp);
    ids.forEach(function (id) { s.cards += cardVP(p, id); });
    s.total = s.tr + s.mile + s.award + s.green + s.city + s.cards;
    return s;
  }

  // ---------- moves ----------
  function validMoves() {
    var p = sideToAct(), out = []; if (p < 0) return out;
    var P = G.pl[p];
    if (G.pending) {
      var d = G.pending.d;
      if (G.pending.h === 'place') d.spaces.forEach(function (s) { out.push({ t: 'place', s: s }); });
      else if (G.pending.h === 'choose') d.ok.forEach(function (i) { out.push({ t: 'choose', i: i }); });
      else if (G.pending.h === 'pickres') d.cards.forEach(function (id) { out.push({ t: 'pickres', id: id }); });
      return out;
    }
    if (G.phase === 'setup') { P.offer.corps.forEach(function (c) { out.push({ t: 'setup', corp: c, buy: [] }); }); return out; }
    if (G.phase === 'draft') { var h = G.draft.hands[p]; h.forEach(function (id) { out.push({ t: 'draft', id: id }); }); return out; }
    if (G.phase === 'research') { out.push({ t: 'buy', ids: [] }); return out; }
    if (G.phase === 'final') {
      if (P.plant >= greenCost(p) && legalSpaces(p, 'greenery').length) out.push({ t: 'green' });
      out.push({ t: 'done' }); return out;
    }
    if (G.phase !== 'action') return out;
    P.hand.forEach(function (id) { if (playable(p, id)) out.push({ t: 'play', id: id }); });
    ['power', 'asteroid', 'aquifer', 'greenery', 'city'].forEach(function (k) { if (stdOk(p, k)) out.push({ t: 'std', k: k }); });
    if (P.hand.length) out.push({ t: 'sell', ids: [P.hand[0]] });
    if (P.plant >= greenCost(p) && legalSpaces(p, 'greenery').length) out.push({ t: 'green' });
    if (P.heat >= 8 && G.temp < TEMP_MAX) out.push({ t: 'heat' });
    MAP.MILESTONES.forEach(function (m) { if (mileOk(p, m.k)) out.push({ t: 'mile', k: m.k }); });
    MAP.AWARDS.forEach(function (a) { if (awardOk(p, a.k)) out.push({ t: 'award', k: a.k }); });
    actionSources(p).forEach(function (id) { var c = card(id); c.action.forEach(function (a, i) { if (actOk(p, id, i)) out.push({ t: 'act', id: id, i: i }); }); });
    if (G.acts === 1) out.push({ t: 'end' });
    out.push({ t: 'pass' });
    return out;
  }
  function actionSources(p) { var P = G.pl[p], ids = P.played.filter(function (id) { return CARDS[id].type === 'active' && CARDS[id].action && CARDS[id].action.length; }); if (P.corp && CORPS[P.corp].action && CORPS[P.corp].action.length) ids.unshift(P.corp); return ids; }
  function actOk(p, id, i) {
    var P = G.pl[p], c = card(id); if (P.used[id] || !c.action || !c.action[i]) return false;
    var a = c.action[i];
    if (!opsPossible(p, a.cost || [], id)) return false;
    // an action that only raises a maxed global (and nothing else) is not useful but still legal; keep it legal
    return opsPossible(p, a.do, id);
  }
  function stdOk(p, k) {
    var P = G.pl[p], c = stdCost(p, k);
    if (P.mc < c) return false;
    if (k === 'asteroid') return G.temp < TEMP_MAX;
    if (k === 'aquifer') return G.oceans < OCEAN_MAX;
    if (k === 'greenery') return legalSpaces(p, 'greenery').length > 0;
    if (k === 'city') return legalSpaces(p, 'city').length > 0;
    return true;
  }
  function mileOk(p, k) { if (G.milestones[k] !== undefined || Object.keys(G.milestones).length >= 3 || G.pl[p].mc < 8) return false; var m = MAP.MILESTONES.filter(function (x) { return x.k === k; })[0]; return mileMetric(p, m.m) >= m.need; }
  function awardOk(p, k) { return G.awards.indexOf(k) < 0 && G.awards.length < 3 && G.pl[p].mc >= AWARD_COST[G.awards.length]; }

  function performMove(m) {
    var p = sideToAct(); if (p < 0) return false;
    var P = G.pl[p];
    if (G.pending) {
      var pd = G.pending, d = pd.d;
      if (m.t === 'place' && pd.h === 'place' && d.spaces.indexOf(m.s) >= 0) { G.pending = null; placeTile(p, d.t, m.s, d.src && card(d.src) && card(d.src).vp && (card(d.src).vp.per === 'adjOcean' || card(d.src).vp.per === 'cityAdj') ? d.src : (d.t === 'special' ? d.src : null)); }
      else if (m.t === 'choose' && pd.h === 'choose' && d.ok.indexOf(m.i) >= 0) { G.pending = null; G.q = d.opts[m.i].map(function (o) { return { p: p, op: o, src: d.src }; }).concat(G.q); }
      else if (m.t === 'pickres' && pd.h === 'pickres' && d.cards.indexOf(m.id) >= 0) { G.pending = null; P.res[m.id] = (P.res[m.id] || 0) + d.n; ev({ k: 'res', p: p, id: m.id, n: d.n }); }
      else return false;
      run();
      if (!G.pending && G.q.length === 0 && G.resume) { var r = G.resume; G.resume = null; afterAction(r.p, r.pass); }
      if (!G.pending && G.phase === 'setup' && !G.pl[0].offer && !G.pl[1].offer) { G.discard = G.discard.filter(function (x) { return x.indexOf('corp:') !== 0; }); startActions(); }
      return true;
    }
    if (G.phase === 'setup') {
      if (m.t !== 'setup' || P.offer.corps.indexOf(m.corp) < 0) return false;
      var C = CORPS[m.corp], buy = (m.buy || []).filter(function (id) { return P.offer.cards.indexOf(id) >= 0; });
      if (C.beginner) buy = P.offer.cards.slice();
      var price = C.beginner ? 0 : 3 * buy.length;
      if (price > C.mc) return false;
      P.corp = m.corp; P.mc = C.mc - price; P.hand = buy.slice();
      P.offer.cards.forEach(function (id) { if (buy.indexOf(id) < 0) G.discard.push(id); });
      P.offer.corps.forEach(function (c) { if (c !== m.corp && c !== 'c00') G.discard.push('corp:' + c); });
      P.offer = null;
      queueOps(p, C.start, m.corp); run();
      log(p, (p === 0 ? 'You' : 'Rival') + ' founded ' + C.name + ' and kept ' + buy.length + ' cards.');
      if (!G.pl[0].offer && !G.pl[1].offer && !G.pending) { G.discard = G.discard.filter(function (x) { return x.indexOf('corp:') !== 0; }); startActions(); }
      return true;
    }
    if (G.phase === 'draft') {
      var h = G.draft.hands[p], i = h.indexOf(m.id); if (m.t !== 'draft' || i < 0) return false;
      h.splice(i, 1); G.draft.picked[p].push(m.id);
      if (G.draft.picked[0].length === G.draft.picked[1].length) { var t = G.draft.hands[0]; G.draft.hands[0] = G.draft.hands[1]; G.draft.hands[1] = t; }
      if (G.draft.picked[0].length === 4 && G.draft.picked[1].length === 4) { G.phase = 'research'; for (var q = 0; q < 2; q++) { G.pl[q].research = G.draft.picked[q]; G.pl[q].bought = false; } G.draft = null; }
      return true;
    }
    if (G.phase === 'research') {
      if (m.t !== 'buy') return false;
      var ids = (m.ids || []).filter(function (id) { return P.research.indexOf(id) >= 0; });
      if (ids.length * 3 > P.mc) return false;
      P.mc -= ids.length * 3; P.hand = P.hand.concat(ids);
      P.research.forEach(function (id) { if (ids.indexOf(id) < 0) G.discard.push(id); });
      P.research = []; P.bought = true;
      log(p, (p === 0 ? 'You' : 'Rival') + ' bought ' + ids.length + ' card' + (ids.length === 1 ? '' : 's') + '.');
      if (G.pl[0].bought && G.pl[1].bought) startActions();
      return true;
    }
    if (G.phase === 'final') {
      if (m.t === 'green' && P.plant >= greenCost(p)) { P.plant -= greenCost(p); G.q.push({ p: p, op: { op: 'tile', t: 'greenery' }, src: 'conv' }); run(); G.resume = { p: p, final: true }; if (!G.pending) G.resume = null; return true; }
      if (m.t === 'done') { G.finalDone[p] = true; if (G.finalDone[0] && G.finalDone[1]) finish(); else G.turn = other(p); return true; }
      return false;
    }
    if (G.phase !== 'action') return false;
    var pass = false;
    switch (m.t) {
      case 'play': {
        var hi = P.hand.indexOf(m.id); if (hi < 0 || !playable(p, m.id)) return false;
        var c = CARDS[m.id], cost = cardCost(p, m.id), pay = m.pay || maxPay(p, c, cost);
        var paid = pay.mc + (pay.steel || 0) * steelVal(p) + (pay.ti || 0) * tiVal(p) + (pay.heat || 0);
        if (pay.mc > P.mc || (pay.steel || 0) > P.steel || (pay.ti || 0) > P.ti || (pay.heat || 0) > P.heat || paid < cost) return false;
        if ((pay.steel && (c.tags || []).indexOf('building') < 0) || (pay.ti && (c.tags || []).indexOf('space') < 0) || (pay.heat && !heatAsMc(p))) return false;
        P.mc -= pay.mc; P.steel -= pay.steel || 0; P.ti -= pay.ti || 0; P.heat -= pay.heat || 0;
        P.hand.splice(hi, 1); P.played.push(m.id); G.stats.cards++;
        ev({ k: 'play', p: p, id: m.id }); log(p, (p === 0 ? 'You' : 'Rival') + ' played ' + c.name + '.');
        queueOps(p, c.play, m.id);
        for (var q2 = 0; q2 < 2; q2++) effects(q2).forEach(function (x) {
          var k = kindOf(x.e);
          if (k === 'onTag' && x.src !== m.id && (q2 === p || x.e.any)) {
            var tg = x.e.tag || x.e.onTag, n = (c.tags || []).filter(function (t) { return t === tg; }).length + (tg === 'event' && c.type === 'event' ? 1 : 0);
            for (var j = 0; j < n; j++) queueOps(q2, x.e.do, x.src);
          }
          if (k === 'onPay' && q2 === p && x.src !== m.id && c.cost >= x.e.min) queueOps(q2, x.e.do, x.src);
        });
        break;
      }
      case 'std': {
        if (!stdOk(p, m.k)) return false;
        P.mc -= stdCost(p, m.k); G.stats.std++;
        log(p, (p === 0 ? 'You' : 'Rival') + ' used ' + STD_NAME[m.k] + '.');
        if (m.k === 'power') queueOps(p, [{ op: 'prod', r: 'energy', n: 1 }], 'std');
        if (m.k === 'asteroid') queueOps(p, [{ op: 'temp', n: 1 }], 'std');
        if (m.k === 'aquifer') queueOps(p, [{ op: 'ocean', n: 1 }], 'std');
        if (m.k === 'greenery') queueOps(p, [{ op: 'tile', t: 'greenery' }], 'std');
        if (m.k === 'city') queueOps(p, [{ op: 'tile', t: 'city' }, { op: 'prod', r: 'mc', n: 1 }], 'std');
        break;
      }
      case 'sell': {
        var ids2 = (m.ids || []).filter(function (id, i, a) { return P.hand.indexOf(id) >= 0 && a.indexOf(id) === i; });
        if (!ids2.length) return false;
        ids2.forEach(function (id) { P.hand.splice(P.hand.indexOf(id), 1); G.discard.push(id); });
        P.mc += ids2.length; log(p, (p === 0 ? 'You' : 'Rival') + ' sold ' + ids2.length + ' card' + (ids2.length > 1 ? 's' : '') + '.');
        break;
      }
      case 'green': { var gc = greenCost(p); if (P.plant < gc || !legalSpaces(p, 'greenery').length) return false; P.plant -= gc; queueOps(p, [{ op: 'tile', t: 'greenery' }], 'conv'); break; }
      case 'heat': { if (P.heat < 8 || G.temp >= TEMP_MAX) return false; P.heat -= 8; queueOps(p, [{ op: 'temp', n: 1 }], 'conv'); break; }
      case 'mile': { if (!mileOk(p, m.k)) return false; P.mc -= 8; G.milestones[m.k] = p; ev({ k: 'mile', p: p, m: m.k }); log(p, (p === 0 ? 'You' : 'Rival') + ' claimed the ' + m.k + ' milestone.'); break; }
      case 'award': { if (!awardOk(p, m.k)) return false; P.mc -= AWARD_COST[G.awards.length]; G.awards.push(m.k); ev({ k: 'award', p: p, a: m.k }); log(p, (p === 0 ? 'You' : 'Rival') + ' funded the ' + m.k + ' award.'); break; }
      case 'act': {
        if (!actOk(p, m.id, m.i)) return false;
        var a = card(m.id).action[m.i]; P.used[m.id] = true;
        log(p, (p === 0 ? 'You' : 'Rival') + ' used ' + card(m.id).name + '.');
        queueOps(p, (a.cost || []).concat(a.do), m.id); break;
      }
      case 'end': if (G.acts !== 1) return false; nextTurn(p); return true;
      case 'pass': P.passed = true; pass = true; log(p, (p === 0 ? 'You' : 'Rival') + ' passed.'); break;
      default: return false;
    }
    run();
    if (G.pending) { G.resume = { p: p, pass: pass }; return true; }
    afterAction(p, pass);
    return true;
  }
  function afterAction(p, pass) {
    if (G.phase === 'final') return;
    if (G.phase !== 'action') return;
    if (pass) { nextTurn(p); return; }
    G.acts++;
    if (G.acts >= 2) nextTurn(p);
  }

  // ---------- invariants ----------
  function checkInvariants() {
    var errs = [];
    if (G.temp < TEMP_MIN || G.temp > TEMP_MAX || (G.temp % 2)) errs.push('temp ' + G.temp);
    if (G.oxy < 0 || G.oxy > OXY_MAX) errs.push('oxy ' + G.oxy);
    var oc = 0; for (var s in G.tiles) { if (G.tiles[s].t === 'ocean') { oc++; if (!sp(s).ocean) errs.push('ocean on land ' + s); } else if (sp(s).ocean && G.tiles[s].t !== 'special') errs.push('land tile on ocean ' + s); if (G.tiles[s].t === 'city' && !sp(s).offmap && !sp(s).reserved && sp(s).adj.some(function (a) { return G.tiles[a] && G.tiles[a].t === 'city' && !sp(a).reserved; })) errs.push('cities touch at ' + s); }
    if (oc !== G.oceans || oc > OCEAN_MAX) errs.push('oceans ' + oc + '/' + G.oceans);
    G.pl.forEach(function (P, i) {
      RES.forEach(function (r) { if (P[r] < 0) errs.push('p' + i + ' ' + r + '<0'); if (r !== 'mc' && P.prod[r] < 0) errs.push('p' + i + ' prod ' + r + '<0'); });
      if (P.prod.mc < -5) errs.push('p' + i + ' mc prod < -5');
    });
    var all = G.deck.length + G.discard.filter(function (x) { return x.indexOf('corp:') !== 0; }).length;
    G.pl.forEach(function (P) { all += P.hand.length + P.played.length + P.research.length + (P.offer ? P.offer.cards.length : 0); });
    if (G.draft) all += G.draft.hands[0].length + G.draft.hands[1].length + G.draft.picked[0].length + G.draft.picked[1].length;
    if (all !== DATA.cards.length) errs.push('card count ' + all);
    if (Object.keys(G.milestones).length > 3) errs.push('milestones > 3');
    if (G.awards.length > 3) errs.push('awards > 3');
    return errs;
  }

  var OH = root.OH = {
    newGame: newGame, validMoves: validMoves, performMove: performMove, sideToAct: sideToAct, checkInvariants: checkInvariants,
    score: score, cardVP: cardVP, playable: playable, reqOk: reqOk, cardCost: cardCost, stdCost: stdCost, stdOk: stdOk, maxPay: maxPay,
    legalSpaces: legalSpaces, tagCount: tagCount, greenCost: greenCost, mileOk: mileOk, awardOk: awardOk, actOk: actOk, actionSources: actionSources,
    mileMetric: mileMetric, awardMetric: awardMetric, cities: cities, greeneries: greeneries, steelVal: steelVal, tiVal: tiVal, opsPossible: opsPossible,
    card: card, CARDS: CARDS, CORPS: CORPS, MAP: MAP, STD: STD, STD_NAME: STD_NAME, AWARD_COST: AWARD_COST, TAGS: TAGS, RES: RES,
    TEMP_MIN: TEMP_MIN, TEMP_MAX: TEMP_MAX, OXY_MAX: OXY_MAX, OCEAN_MAX: OCEAN_MAX,
    get G() { return G; }, set G(v) { G = v; }, effects: effects, kindOf: kindOf
  };
  if (isNode) module.exports = OH;
})(typeof window !== 'undefined' ? window : globalThis);

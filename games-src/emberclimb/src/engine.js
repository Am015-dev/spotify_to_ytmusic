// Emberclimb engine: all state in one JSON-safe G. No DOM. Moves are plain objects.
(function () {
  var D = EC.D, G = null;
  function rnd() { var t = G.rs = (G.rs + 0x6D2B79F5) | 0; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  function ri(n) { return Math.floor(rnd() * n); }
  function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = ri(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function fx(k, w, n, x) { if (G.q.length > 300) G.q.shift(); G.q.push({ k: k, w: w, n: n, x: x }); }
  function say(s) { G.msg = s; }
  function has(r) { return G.relics.indexOf(r) >= 0; }
  // ---------- cards
  function mk(id, u) { return { id: id, u: u ? 1 : 0, uid: ++G.uid }; }
  function upOps(ops) {
    var done = false;
    function go(o) {
      if (done) return o; o = o.slice(); var k = o[0];
      if (k === 'dmg' || k === 'all' || k === 'blk') { o[1] += 3; done = true; }
      else if (k === 'hit') { o[2] += 2; done = true; }
      else if (k === 'dmgx') { o[1] += 4; done = true; }
      else if (k === 'poison' || k === 'poisonAll' || k === 'shiv' || k === 'heal') { o[1] += (k === 'poisonAll' ? 3 : 2); done = true; }
      else if (k === 'str' || k === 'draw' || k === 'nrg' || k === 'vuln' || k === 'weak' || k === 'weakAll') { o[1] += 1; done = true; }
      else if (k === 'power') { o[2] += (o[1] === 'plated' || o[1] === 'mental' ? 2 : 1); done = true; }
      else if (k === 'chanX') { o[2] = (o[2] || 0) + 1; done = true; }
      else if (k === 'evokeX') { o[1] = (o[1] || 0) + 1; done = true; }
      else if (k === 'roll') { o = ['roll', o[1].map(go2), o[2].map(go2), o[3].map(go2)]; }
      return o;
    }
    function go2(o) { var d0 = done; done = false; var r = go(o); done = d0; return r; }
    return ops.map(go);
  }
  function eff(c) {
    var d = D.CARDS[c.id], r = { id: c.id, name: d.name + (c.u ? '+' : ''), type: d.type, rar: d.rar, cost: d.cost, ops: d.ops, fl: d.fl, tgt: d.tgt, hero: d.hero, u: c.u };
    if (c.u) { var o2 = upOps(d.ops); if (JSON.stringify(o2) === JSON.stringify(d.ops) && typeof d.cost === 'number' && d.cost > 0) r.cost = d.cost - 1; else r.ops = o2; }
    return r;
  }
  function lines(e) {
    var out = [];
    function one(o) {
      var k = o[0];
      switch (k) {
        case 'dmg': return 'Deal ' + o[1] + '.'; case 'hit': return 'Deal ' + o[2] + ' x' + o[1] + '.'; case 'all': return 'Deal ' + o[1] + ' to ALL.';
        case 'dmgx': return 'Deal ' + o[1] + ' + ' + o[2] + 'x Str.'; case 'bodyslam': return 'Deal damage = Block.';
        case 'blk': return 'Gain ' + o[1] + ' Block.'; case 'str': return 'Gain ' + o[1] + ' Strength.'; case 'dblStr': return 'Double your Strength.';
        case 'vuln': return 'Vulnerable ' + o[1] + '.'; case 'weak': return 'Weak ' + o[1] + '.'; case 'weakAll': return 'ALL Weak ' + o[1] + '.';
        case 'poison': return 'Poison ' + o[1] + '.'; case 'poisonAll': return 'ALL Poison ' + o[1] + '.'; case 'dblPoison': return 'Double its Poison.';
        case 'draw': return 'Draw ' + o[1] + '.'; case 'nrg': return 'Gain ' + o[1] + ' energy.'; case 'heal': return 'Heal ' + o[1] + '.'; case 'loss': return 'Lose ' + o[1] + ' HP.';
        case 'shiv': return 'Add ' + o[1] + ' Shivs.'; case 'add': return 'Add ' + o[2] + ' ' + D.CARDS[o[1]].name + '.';
        case 'chan': return 'Channel ' + ({ L: 'Lightning', F: 'Frost', D: 'Dark' })[o[1]] + '.'; case 'chanX': return 'Channel X' + (o[2] ? '+' + o[2] : '') + ' Lightning.';
        case 'evoke2': return 'Evoke first orb twice.'; case 'evokeX': return 'Evoke first orb X' + (o[1] ? '+' + o[1] : '') + ' times.'; case 'focus': return 'Focus ' + o[1] + '.';
        case 'stance': return ({ w: 'Enter Wrath.', c: 'Enter Calm.', n: 'Leave your stance.' })[o[1]];
        case 'power': return ({ ritual: 'Each turn end: +' + o[2] + ' Strength.', plated: 'Each turn end: +' + o[2] + ' Block.', noxious: 'Each turn start: ALL Poison ' + o[2] + '.', envenom: 'Unblocked attacks Poison ' + o[2] + '.', focus: 'Gain ' + o[2] + ' Focus.', slots: '+' + o[2] + ' orb slots.', reactor: 'Each turn start: Channel Lightning.', afterimg: 'Each card played: ' + o[2] + ' Block.', rush: 'Enter Wrath: draw ' + o[2] + '.', mental: 'Change stance: ' + o[2] + ' Block.', deva: '+' + o[2] + ' energy each turn.' })[o[1]];
        case 'roll': return null;
      }
      return k;
    }
    e.ops.forEach(function (o) {
      if (o[0] === 'roll') { out.push('Roll d6:'); [['1-2', o[1]], ['3-4', o[2]], ['5-6', o[3]]].forEach(function (b) { if (b[1].length) out.push(b[0] + ': ' + b[1].map(one).join(' ')); }); }
      else out.push(one(o));
    });
    if (e.fl.indexOf('x') >= 0 && e.type !== 'P') out.push('Exhaust.');
    if (e.fl.indexOf('u') >= 0) out.push('Unplayable.');
    if (e.fl.indexOf('b') >= 0) out.push('End of turn in hand: lose 2 HP.');
    if (e.fl.indexOf('r') >= 0) out.push('Held at end: 1 HP per card.');
    if (e.fl.indexOf('d') >= 0) out.push('End of turn in hand: Weak 1.');
    if (e.fl.indexOf('e') >= 0) out.push('Exhausts at turn end.');
    return out;
  }
  // ---------- setup
  function newGame(opt) {
    opt = opt || {}; var ks = (opt.heroes && opt.heroes.length ? opt.heroes : ['w']).slice(0, 2);
    G = { v: 1, seed: opt.seed == null ? (Math.random() * 1e9) | 0 : opt.seed, uid: 0, q: [], msg: '', hs: [], gold: 99, relics: [], pots: [], pslots: 3, scr: 'map', b: null, rw: null, shop: null, evn: null, rest: null, at: -1, map: [], lucky: 0, revived: 0, floor: 0, wins: 0 };
    G.rs = G.seed | 0;
    ks.forEach(function (k) {
      var H = D.H[k], h = { k: k, hp: H.hp, mhp: H.hp, deck: H.start.map(function (id) { return mk(id); }), dead: 0 };
      G.hs.push(h); G.relics.push(H.relic);
    });
    G.boss = D.ENC.boss[ri(3)][0]; if (opt.boss) G.boss = opt.boss;
    G.F = opt.floors || 9; G.ehp = opt.hpPct || 100; if (opt.relic && G.relics.indexOf(opt.relic) < 0) G.relics.push(opt.relic);
    genMap(); resetCombat();
    return G;
  }
  function resetCombat() { G.hs.forEach(function (h) { h.draw = []; h.hand = []; h.disc = []; h.exh = []; h.en = 0; h.blk = 0; h.st = {}; h.orbs = []; h.stance = 'n'; h.pw = {}; }); }
  function genMap() {
    var W = 4, F = G.F || 9, nodes = {}, paths = [];
    var starts = shuffle([0, 1, 2, 3]).slice(0, 3);
    starts.push(ri(4));
    starts.forEach(function (c) {
      var prev = null;
      for (var f = 1; f <= F; f++) {
        var key = f * 10 + c, n = nodes[key] || (nodes[key] = { f: f, c: c, nx: [], t: 'm' });
        if (prev && prev.nx.indexOf(key) < 0) prev.nx.push(key);
        prev = n;
        var opts = [c - 1, c, c + 1].filter(function (x) { return x >= 0 && x < W; });
        c = opts[ri(opts.length)];
      }
    });
    var keys = Object.keys(nodes).map(Number).sort(function (a, b) { return a - b; }), idOf = {}, arr = [];
    keys.forEach(function (k, i) { idOf[k] = i; });
    keys.forEach(function (k) {
      var n = nodes[k], f = n.f;
      if (f === 1) n.t = 'm'; else if (f === 5 && F >= 7) n.t = 't'; else if (f === F && F >= 3) n.t = 'r';
      else {
        var w = [['m', 45], ['v', 22], ['s', f >= 3 ? 7 : 0], ['r', f >= 4 && f <= 8 ? 12 : 0], ['e', f >= 3 ? 14 : 0]], tot = 0; w.forEach(function (x) { tot += x[1]; });
        var r = ri(tot); for (var i = 0; i < w.length; i++) { r -= w[i][1]; if (r < 0) { n.t = w[i][0]; break; } }
      }
      arr.push({ id: idOf[k], f: f, c: n.c, t: n.t, nx: n.nx.map(function (x) { return idOf[x]; }) });
    });
    var bid = arr.length; arr.forEach(function (n) { if (n.f === F) n.nx = [bid]; });
    arr.push({ id: bid, f: F + 1, c: 1.5, t: 'b', nx: [] });
    G.map = arr;
  }
  function reachable() {
    if (G.at < 0) return G.map.filter(function (n) { return n.f === 1; }).map(function (n) { return n.id; });
    return G.map[G.at].nx.slice();
  }
  // ---------- combat helpers
  function alive() { return G.b.en.filter(function (e) { return !e.dead; }); }
  function aliveHs() { return G.hs.filter(function (h) { return !h.dead; }); }
  function st(o, k) { return o.st[k] || 0; }
  function addSt(o, k, n) { o.st[k] = (o.st[k] || 0) + n; }
  function roll() {
    var v = ri(6) + 1; if (G.lucky > 0) { v = 6; G.lucky--; } if (has('clover-dice')) v = Math.min(6, v + 1);
    fx('die', 'p', v); return v;
  }
  function draw(h, n) {
    for (var i = 0; i < n; i++) {
      if (h.hand.length >= 10) { break; }
      if (!h.draw.length) { if (!h.disc.length) break; h.draw = shuffle(h.disc); h.disc = []; fx('shuf', 'p', 0); }
      h.hand.push(h.draw.pop());
    }
  }
  function addCard(h, id, n, where) {
    for (var i = 0; i < n; i++) { var c = mk(id); if (where === 'hand' && h.hand.length < 10) h.hand.push(c); else h.disc.push(c); }
  }
  function hurtHero(h, n, ignoreBlk) {
    if (n <= 0) return 0;
    if (!ignoreBlk) { var a = Math.min(h.blk, n); h.blk -= a; n -= a; }
    if (n > 0) { h.hp -= n; fx('hp', 'h' + G.hs.indexOf(h), n); if (h.hp <= 0) { h.hp = 0; killHero(h); } }
    return n;
  }
  function killHero(h) {
    if (has('phoenix-ash') && !G.revived) { G.revived = 1; h.hp = Math.max(1, Math.floor(h.mhp * 0.3)); fx('revive', 'h' + G.hs.indexOf(h), h.hp); return; }
    h.dead = 1; fx('dead', 'h' + G.hs.indexOf(h), 0);
    if (!aliveHs().length) { G.killer = G.lastHit || 'self'; G.killIn = G.b ? G.b.kind : ''; G.scr = 'over'; G.won = 0; G.b = null; return; }
    if (G.b && G.b.cur === G.hs.indexOf(h) && G.b.ph === 'p') nextHeroOrEnemy();
  }
  function dmgNum(h, base, card) {
    var d = base + st(h, 'str') + (card && card.type === 'A' && has('smoking-censer') ? 1 : 0);
    if (h.stance === 'w') d *= 2; if (st(h, 'weak') > 0) d = Math.floor(d * 0.75);
    return d;
  }
  function hitEnemy(h, e, base, card) {
    if (e.dead) return;
    var d = dmgNum(h, base, card); if (st(e, 'vuln') > 0) d = Math.floor(d * 1.5); d = Math.max(0, d);
    var a = Math.min(e.blk, d); e.blk -= a; var real = d - a;
    fx('dmg', 'e' + G.b.en.indexOf(e), d, a > 0 && real === 0 ? 'blocked' : (st(h, 'str') > 0 ? 'str' : ''));
    if (real > 0) {
      e.hp -= real; e.asleep = 0;
      if (h.pw.envenom) addSt(e, 'poison', h.pw.envenom);
      if (e.hp <= 0) { e.hp = 0; e.dead = 1; fx('kill', 'e' + G.b.en.indexOf(e), 0); }
    }
  }
  function losePoisonKill(e) { if (e.hp <= 0) { e.hp = 0; e.dead = 1; fx('kill', 'e' + G.b.en.indexOf(e), 0); } }
  function lowest() { var l = alive().sort(function (a, b) { return a.hp - b.hp; }); return l[0]; }
  function chan(h, k) {
    var slots = 3 + (h.pw.slots || 0);
    if (h.orbs.length >= slots) evoke(h, true);
    h.orbs.push({ k: k, v: 0 }); fx('orb', 'h' + G.hs.indexOf(h), 0, k);
  }
  function evoke(h, remove) {
    var o = h.orbs[0]; if (!o) return; var f = h.pw.focus || 0;
    if (o.k === 'L') { var t = alive()[ri(alive().length)]; if (t) hitRaw(t, 8 + f); }
    else if (o.k === 'F') { h.blk += 5 + f; fx('blk', 'h' + G.hs.indexOf(h), 5 + f); }
    else { var l = lowest(); if (l) hitRaw(l, 6 + (o.v || 0) + f); }
    if (remove) h.orbs.shift();
  }
  function hitRaw(e, d) {
    if (e.dead || d <= 0) return; var a = Math.min(e.blk, d); e.blk -= a; var real = d - a; fx('dmg', 'e' + G.b.en.indexOf(e), d, '');
    if (real > 0) { e.hp -= real; e.asleep = 0; if (e.hp <= 0) { e.hp = 0; e.dead = 1; fx('kill', 'e' + G.b.en.indexOf(e), 0); } }
  }
  function setStance(h, s) {
    if (h.stance === s) return; if (h.stance === 'c') h.en += 2; h.stance = s; fx('stance', 'h' + G.hs.indexOf(h), 0, s);
    if (h.pw.mental) { h.blk += h.pw.mental; } if (s === 'w' && h.pw.rush) draw(h, h.pw.rush);
  }
  function runOps(h, ops, card, tgt, X) {
    ops.forEach(function (o) {
      if (G.scr !== 'battle') return;
      var hi = 'h' + G.hs.indexOf(h), e = tgt != null ? G.b.en[tgt] : null, k = o[0];
      switch (k) {
        case 'dmg': if (e) hitEnemy(h, e, o[1], card); break;
        case 'hit': if (e) for (var i = 0; i < o[1]; i++) hitEnemy(h, e, o[2], card); break;
        case 'dmgx': if (e) hitEnemy(h, e, o[1] + 0 + st(h, 'str') * (o[2] - 1), card); break;
        case 'bodyslam': if (e) hitEnemy(h, e, h.blk - st(h, 'str'), card); break;
        case 'all': for (var r = 0; r < (X != null ? X : 1); r++) alive().forEach(function (t) { hitEnemy(h, t, o[1], card); }); break;
        case 'blk': var b = o[1] + (card && card.type === 'S' && has('tin-flute') ? 1 : 0); if (st(h, 'frail') > 0) b = Math.floor(b * 0.75); h.blk += b; fx('blk', hi, b); break;
        case 'str': addSt(h, 'str', o[1]); fx('buff', hi, o[1], 'str'); break;
        case 'dblStr': addSt(h, 'str', st(h, 'str')); fx('buff', hi, 0, 'str'); break;
        case 'vuln': case 'weak': if (e && !e.dead) { addSt(e, k, o[1]); fx('debuff', 'e' + tgt, o[1], k); } break;
        case 'weakAll': alive().forEach(function (t) { addSt(t, 'weak', o[1]); fx('debuff', 'e' + G.b.en.indexOf(t), o[1], 'weak'); }); break;
        case 'poison': if (e && !e.dead) { addSt(e, 'poison', o[1]); fx('debuff', 'e' + tgt, o[1], 'poison'); } break;
        case 'poisonAll': alive().forEach(function (t) { addSt(t, 'poison', o[1]); fx('debuff', 'e' + G.b.en.indexOf(t), o[1], 'poison'); }); break;
        case 'dblPoison': if (e && !e.dead) { e.st.poison = (e.st.poison || 0) * 2; fx('debuff', 'e' + tgt, 0, 'poison'); } break;
        case 'draw': draw(h, o[1]); break;
        case 'nrg': h.en += o[1]; fx('buff', hi, o[1], 'nrg'); break;
        case 'heal': h.hp = Math.min(h.mhp, h.hp + o[1]); fx('heal', hi, o[1]); break;
        case 'loss': hurtHero(h, o[1], true); break;
        case 'shiv': addCard(h, 'shiv', o[1], 'hand'); break;
        case 'add': addCard(h, o[1], o[2], o[3]); break;
        case 'chan': chan(h, o[1]); break;
        case 'chanX': for (var j = 0; j < X + (o[2] || 0); j++) chan(h, 'L'); break;
        case 'evoke2': if (h.orbs[0]) { evoke(h, false); evoke(h, true); } break;
        case 'evokeX': for (var m = 0; m < X + (o[1] || 0); m++) evoke(h, true); break;
        case 'focus': h.pw.focus = (h.pw.focus || 0) + o[1]; break;
        case 'stance': setStance(h, o[1]); break;
        case 'power': h.pw[o[1]] = (h.pw[o[1]] || 0) + o[2]; fx('buff', hi, o[2], 'power'); break;
        case 'roll': var v = roll(), br = v <= 2 ? o[1] : v <= 4 ? o[2] : o[3]; runOps(h, br, card, tgt, X); break;
      }
      if (G.scr === 'battle' && !alive().length) winBattle();
    });
  }
  // ---------- battle flow
  function mkEnemy(id) {
    var d = D.ENEMIES[id], hp = d.hp[0] + ri(d.hp[1] - d.hp[0] + 1); if (G.hs.length > 1) hp = Math.round(hp * 2); if (G.ehp && G.ehp !== 100) hp = Math.round(hp * G.ehp / 100);
    return { id: id, hp: hp, mhp: hp, blk: 0, st: {}, i: -1, intent: null, asleep: d.sleep || 0, dead: 0, acted: 0 };
  }
  function plan(e) {
    var d = D.ENEMIES[e.id], step;
    if (e.asleep > 0) { e.intent = { sleep: 1 }; return; }
    if (d.mode === 'rand') { var k; do { k = ri(d.pat.length); } while (k === e.i && d.pat.length > 1); e.i = k; }
    else e.i = (e.i + 1) % d.pat.length;
    step = d.pat[e.i]; var hs = aliveHs();
    e.intent = JSON.parse(JSON.stringify(step)); e.intent.tg = G.hs.indexOf(hs[ri(hs.length)]);
  }
  function startBattle(kind) {
    var pool = kind === 'e' ? D.ENC.elite : kind === 'b' ? [[G.boss]] : (G.fights < 3 ? D.ENC.weak : D.ENC.strong);
    var ids = pool[ri(pool.length)];
    resetCombat();
    G.b = { en: ids.map(mkEnemy), turn: 0, ph: 'p', cur: 0, kind: kind };
    G.scr = 'battle'; G.fights++;
    G.hs.forEach(function (h) {
      if (h.dead) return;
      h.draw = shuffle(h.deck.slice());
      if (has('iron-bangle')) h.blk += 4; if (has('spark-core') && h.k === 'a') chan(h, 'L'); if (has('prayer-beads') && h.k === 'm') h.stance = 'c';
    });
    if (has('spark-core') && !G.hs.some(function (h) { return h.k === 'a'; })) { /* only the Automaton benefits */ }
    G.b.en.forEach(function (e) { if (has('bag-of-marbles')) addSt(e, 'vuln', 1); plan(e); });
    beginRound();
    G.hs.forEach(function (h) { if (!h.dead && h.k === 'm' && has('prayer-beads')) h.hand.push(mk('calm-spark')); });
  }
  function beginRound() {
    G.b.turn++; G.b.ph = 'p'; G.b.cur = -1;
    G.hs.forEach(function (h) { if (!h.dead) { h.blk = 0; h.started = 0; } });
    nextHero(0);
  }
  function nextHero(from) {
    for (var i = from; i < G.hs.length; i++) if (!G.hs[i].dead) { G.b.cur = i; startHeroTurn(G.hs[i]); return true; }
    return false;
  }
  function startHeroTurn(h) {
    h.blk = 0; h.en = 3 + (has('dawnstone') ? 1 : 0) + (h.pw.deva || 0) + (G.b.turn === 1 && has('lantern') ? 1 : 0);
    var n = 5 + (has('gale-cloak') ? 1 : 0) + (G.b.turn === 1 ? (h.k === 's' && has('whetstone-ring') ? 2 : 0) + (has('candle-stub') ? 1 : 0) : 0);
    if (h.pw.noxious) alive().forEach(function (e) { addSt(e, 'poison', h.pw.noxious); });
    if (h.pw.reactor) chan(h, 'L');
    draw(h, n);
    fx('turn', 'h' + G.hs.indexOf(h), G.b.turn);
  }
  function endHeroTurn(h) {
    var hi = G.hs.indexOf(h), f = h.pw.focus || 0;
    h.orbs.forEach(function (o) {
      if (o.k === 'L') { var t = alive()[ri(alive().length)]; if (t) hitRaw(t, 3 + f); }
      else if (o.k === 'F') { h.blk += 2 + f; fx('blk', 'h' + hi, 2 + f); }
      else o.v += 6 + f;
    });
    if (h.pw.ritual) { addSt(h, 'str', h.pw.ritual); fx('buff', 'h' + hi, h.pw.ritual, 'str'); }
    if (h.pw.plated) { h.blk += h.pw.plated; fx('blk', 'h' + hi, h.pw.plated); }
    var held = h.hand.length, keep = [];
    h.hand.forEach(function (c) {
      var fl = D.CARDS[c.id].fl;
      if (fl.indexOf('b') >= 0) { fx('hitme', 'h' + hi, 2, 'burn'); hurtHero(h, 2, true); }
      if (fl.indexOf('r') >= 0) hurtHero(h, held, true);
      if (fl.indexOf('d') >= 0) addSt(h, 'weak', 1);
      if (fl.indexOf('e') >= 0) h.exh.push(c); else h.disc.push(c);
    });
    h.hand = keep;
    if (G.scr === 'battle' && !alive().length) winBattle();
  }
  function nextHeroOrEnemy() {
    if (G.scr !== 'battle') return;
    if (!nextHero(G.b.cur + 1)) { G.b.ph = 'e'; G.b.ei = 0; G.b.cur = -1; }
  }
  // one enemy acts per call; returns true while enemy phase continues
  function step() {
    if (!G.b || G.b.ph !== 'e') return false;
    var e = G.b.en[G.b.ei];
    if (G.b.ei >= G.b.en.length) { finishRound(); return false; }
    G.b.ei++;
    if (e.dead) return true;
    e.blk = 0;
    if (e.st.poison > 0) { e.hp -= e.st.poison; fx('dmg', 'e' + G.b.en.indexOf(e), e.st.poison, 'poison'); e.st.poison--; losePoisonKill(e); if (e.dead) { if (!alive().length) winBattle(); return true; } }
    act(e);
    if (G.scr !== 'battle') return false;
    if (e.st.weak > 0) e.st.weak--; if (e.st.vuln > 0) e.st.vuln--;
    return true;
  }
  function act(e) {
    var it = e.intent, d = D.ENEMIES[e.id]; if (!it) return;
    if (it.sleep) { e.asleep--; fx('act', 'e' + G.b.en.indexOf(e), 0, 'sleep'); plan(e); return; }
    var hs = aliveHs(), h = G.hs[it.tg]; if (!h || h.dead) h = hs[0]; if (!h) return;
    var ei = 'e' + G.b.en.indexOf(e); G.lastHit = e.id;
    fx('act', ei, 0, it.atk ? 'atk' : 'cast', G.hs.indexOf(h));
    if (it.str) { addSt(e, 'str', it.str); fx('buff', ei, it.str, 'str'); }
    if (it.blk) { e.blk += it.blk; fx('blk', ei, it.blk); }
    if (it.weak) addSt(h, 'weak', it.weak); if (it.vuln) addSt(h, 'vuln', it.vuln); if (it.frail) addSt(h, 'frail', it.frail);
    if (it.weak || it.vuln) fx('debuff', 'h' + G.hs.indexOf(h), it.weak || it.vuln, it.weak ? 'weak' : 'vuln');
    if (it.add) addCard(h, it.add[0], it.add[1], 'disc');
    if (it.atk) {
      for (var i = 0; i < (it.hits || 1); i++) {
        if (h.dead) break;
        var dm = it.atk + st(e, 'str'); if (st(e, 'weak') > 0) dm = Math.floor(dm * 0.75);
        if (st(h, 'vuln') > 0) dm = Math.floor(dm * 1.5); if (h.stance === 'w') dm *= 2; dm = Math.max(0, dm);
        var a = Math.min(h.blk, dm); fx('hitme', 'h' + G.hs.indexOf(h), dm, a === dm ? 'blocked' : (st(e, 'str') > 0 ? 'str' : ''));
        hurtHero(h, dm);
      }
    }
    if (G.scr !== 'battle') return;
    e.acted++; if (d.ritual && e.acted > 1) addSt(e, 'str', d.ritual);
    plan(e);
  }
  function finishRound() {
    G.hs.forEach(function (h) { ['vuln', 'weak', 'frail'].forEach(function (k) { if (h.st[k] > 0) h.st[k]--; }); });
    G.b.en.forEach(function (e) { if (!e.dead && e.intent && e.intent.sleep === undefined && false) plan(e); });
    beginRound();
  }
  function settle() { var n = 0; while (G.b && G.b.ph === 'e' && n++ < 200) step(); }
  function winBattle() {
    var kind = G.b.kind, gold = kind === 'b' ? 60 + ri(30) : kind === 'e' ? 25 + ri(11) : 10 + ri(11);
    if (has('gold-tooth')) gold = Math.floor(gold * 1.5);
    G.gold += gold;
    if (has('ember-brand')) G.hs.forEach(function (h) { if (!h.dead) h.hp = Math.min(h.mhp, h.hp + 6); });
    var cards = {}, ps = null;
    G.hs.forEach(function (h, i) { if (!h.dead) cards[i] = cardChoices(h, kind); });
    if (ri(100) < (kind === 'm' ? 40 : 60) && G.pots.length < G.pslots) { var pk = Object.keys(D.POTIONS); ps = pk[ri(pk.length)]; }
    var relics = null;
    if (kind === 'e') relics = [pickRelic('cu')]; else if (kind === 'b') relics = pickRelics('b', 3);
    G.rw = { gold: gold, cards: cards, pot: ps, relics: relics, took: {} };
    G.scr = 'reward'; G.b = null; resetCombat();
    G.hs.forEach(function (h) { if (h.k === 'w' || true) { h.blk = 0; } });
  }
  function cardChoices(h, kind) {
    var out = [], tries = 0, pools = { c: [], u: [], r: [] };
    D.ORDER.forEach(function (id) { var d = D.CARDS[id]; if (d.hero === h.k && pools[d.rar]) pools[d.rar].push(id); });
    while (out.length < 3 && tries++ < 50) {
      var r = ri(100), rar = kind === 'b' ? (r < 60 ? 'r' : 'u') : kind === 'e' ? (r < 8 ? 'r' : r < 50 ? 'u' : 'c') : (r < 3 ? 'r' : r < 38 ? 'u' : 'c');
      var p = pools[rar]; var id = p[ri(p.length)]; if (out.indexOf(id) < 0) out.push(id);
    }
    return out;
  }
  var LOCK = [];   // relic ids kept out of the random pool until a Story chapter unlocks them (set by the UI)
  function pickRelics(rar, n) { var l = Object.keys(D.RELICS).filter(function (k) { return D.RELICS[k].rar === rar && !has(k) && LOCK.indexOf(k) < 0; }); shuffle(l); return l.slice(0, n); }
  function pickRelic(rars) { var l = Object.keys(D.RELICS).filter(function (k) { return rars.indexOf(D.RELICS[k].rar) >= 0 && !has(k) && LOCK.indexOf(k) < 0; }); return l.length ? l[ri(l.length)] : null; }
  function gainRelic(id) {
    if (!id || has(id)) return; G.relics.push(id);
    if (id === 'lucky-coin') G.gold += 25; if (id === 'oak-heart') G.hs.forEach(function (h) { h.mhp += 8; h.hp += 8; }); if (id === 'pocket-satchel') G.pslots++;
    fx('relic', 'p', 0, id);
  }
  // ---------- actions
  function cost(h, c) { var e = eff(c); return e.cost === 'X' ? h.en : e.cost; }
  function canPlay(h, c) {
    var e = eff(c); if (e.fl.indexOf('u') >= 0) return false; if (e.cost === 'X') return true;
    return e.cost <= h.en;
  }
  function play(hi, ci, ti) {
    var h = G.hs[hi], c = h.hand[ci], e = eff(c), X = null;
    if (e.cost === 'X') { X = h.en; h.en = 0; } else h.en -= e.cost;
    h.hand.splice(ci, 1);
    fx('play', 'h' + hi, ci, c.id, ti);
    if (e.type === 'S') G.b.en.forEach(function (en) { if (!en.dead && D.ENEMIES[en.id].onSkill) { addSt(en, 'str', D.ENEMIES[en.id].onSkill); fx('buff', 'e' + G.b.en.indexOf(en), D.ENEMIES[en.id].onSkill, 'str'); } });
    if (h.pw.afterimg) { h.blk += h.pw.afterimg; }
    runOps(h, e.ops, e, e.tgt ? ti : null, X);
    if (G.scr === 'battle') {
      if (e.type === 'P') { /* power: removed from play */ } else if (e.fl.indexOf('x') >= 0 || D.CARDS[c.id].hero === 'z' && c.id === 'shiv') h.exh.push(c); else h.disc.push(c);
    }
  }
  function usePot(pi, ti) {
    var id = G.pots[pi], h = G.hs[G.b.cur], hi = 'h' + G.b.cur; G.pots.splice(pi, 1); fx('pot', hi, 0, id);
    switch (id) {
      case 'fire-flask': hitRaw(G.b.en[ti], 20); break;
      case 'block-brew': h.blk += 12; fx('blk', hi, 12); break;
      case 'strength-tonic': addSt(h, 'str', 2); break;
      case 'swift-draught': draw(h, 3); break;
      case 'energy-vial': h.en += 2; break;
      case 'venom-vial': addSt(G.b.en[ti], 'poison', 10); break;
      case 'frost-gas': alive().forEach(function (e) { addSt(e, 'weak', 3); }); break;
      case 'healing-draught': h.hp = Math.min(h.mhp, h.hp + 20); fx('heal', hi, 20); break;
      case 'fortune-die': G.lucky = 2; break;
    }
    if (!alive().length) winBattle();
  }
  function enterNode(id) {
    var n = G.map[id]; n.vis = 1; G.at = id; G.floor = n.f; G.fights = G.fights || 0;
    if (n.t === 'm' || n.t === 'e' || n.t === 'b') startBattle(n.t);
    else if (n.t === 'r') { G.rest = { todo: G.hs.map(function (h, i) { return h.dead ? -1 : i; }).filter(function (i) { return i >= 0; }) }; G.scr = 'rest'; }
    else if (n.t === 't') { G.rw = { gold: 0, cards: {}, relics: [pickRelic('cu')], took: {}, treasure: 1 }; G.rw.gold = 20 + ri(30); G.gold += G.rw.gold; G.scr = 'reward'; }
    else if (n.t === 's') genShop();
    else { var ks = Object.keys(D.EVENTS); G.evn = { id: ks[ri(ks.length)], res: null }; G.scr = 'event'; }
  }
  function genShop() {
    var items = [], ks = G.hs.map(function (h) { return h.k; });
    for (var i = 0; i < 5; i++) {
      var k = ks[i % ks.length], rar = i < 2 ? 'c' : i < 4 ? 'u' : 'r', pool = D.ORDER.filter(function (id) { var d = D.CARDS[id]; return d.hero === k && d.rar === rar; }), id = pool[ri(pool.length)];
      items.push({ t: 'card', id: id, p: { c: 50, u: 80, r: 150 }[rar] + ri(15), sold: 0 });
    }
    var neu = ['n-bandage', 'n-good-instincts', 'n-finesse', 'n-panic-button', 'n-hand-of-greed']; items.push({ t: 'card', id: neu[ri(neu.length)], p: 45 + ri(30), sold: 0 });
    pickRelics('c', 1).concat(pickRelics('u', 1)).forEach(function (r) { items.push({ t: 'relic', id: r, p: D.RELICS[r].rar === 'u' ? 220 : 150, sold: 0 }); });
    var pk = Object.keys(D.POTIONS); for (var j = 0; j < 2; j++) items.push({ t: 'pot', id: pk[ri(pk.length)], p: 50, sold: 0 });
    G.shop = { items: items, rm: 75, removed: 0 }; G.scr = 'shop';
  }
  function leaveNode() {
    if (G.at < 0) G.at = G.map.filter(function (n) { return n.f === 1; })[0].id;
    G.rw = null; G.shop = null; G.evn = null; G.rest = null;
    if (G.map[G.at].t === 'b') { G.scr = 'over'; G.won = 1; return; }
    G.scr = 'map';
  }
  function applyEff(d) {
    if (d.gold) G.gold += d.gold; if (d.heal) G.hs.forEach(function (h) { if (!h.dead) h.hp = Math.min(h.mhp, h.hp + d.heal); });
    if (d.hp) G.hs.forEach(function (h) { if (!h.dead) { h.hp = Math.max(1, h.hp + d.hp); } }); if (d.mhp) G.hs.forEach(function (h) { h.mhp += d.mhp; h.hp += d.mhp; });
    if (d.relic) gainRelic(pickRelic('cu')); if (d.curse) G.hs[0].deck.push(mk(d.curse));
    if (d.card) { var h = G.hs[0], ch = cardChoices(h, 'm'); h.deck.push(mk(ch[0])); }
  }
  // ---------- moves
  function validMoves() {
    var m = [];
    if (!G) return m;
    if (G.scr === 'map') reachable().forEach(function (n) { m.push({ t: 'go', n: n }); });
    else if (G.scr === 'battle' && G.b.ph === 'p') {
      var h = G.hs[G.b.cur], al = G.b.en.map(function (e, i) { return e.dead ? -1 : i; }).filter(function (i) { return i >= 0; });
      h.hand.forEach(function (c, i) { if (!canPlay(h, c)) return; if (eff(c).tgt) al.forEach(function (t) { m.push({ t: 'play', h: G.b.cur, c: i, e: t }); }); else m.push({ t: 'play', h: G.b.cur, c: i }); });
      G.pots.forEach(function (p, i) { if (D.POTIONS[p].tgt) al.forEach(function (t) { m.push({ t: 'pot', p: i, e: t }); }); else m.push({ t: 'pot', p: i }); });
      m.push({ t: 'end' });
    }
    else if (G.scr === 'reward') {
      var r = G.rw; if (!r.took.pot && r.pot && G.pots.length < G.pslots) m.push({ t: 'takepot' });
      (r.relics || []).forEach(function (id, i) { if (!r.took.relic && id) m.push({ t: 'relic', i: i }); });
      Object.keys(r.cards).forEach(function (hi) { if (!r.took['c' + hi]) { r.cards[hi].forEach(function (id, i) { m.push({ t: 'pick', h: +hi, i: i }); }); m.push({ t: 'skip', h: +hi }); } });
      m.push({ t: 'leave' });
    }
    else if (G.scr === 'rest') { G.rest.todo.forEach(function (hi) { m.push({ t: 'heal', h: hi }); G.hs[hi].deck.forEach(function (c, i) { if (!c.u && D.CARDS[c.id].ops.length && D.CARDS[c.id].hero !== 'z') m.push({ t: 'upg', h: hi, c: i }); }); }); }
    else if (G.scr === 'shop') {
      G.shop.items.forEach(function (it, i) { if (!it.sold && G.gold >= it.p && !(it.t === 'pot' && G.pots.length >= G.pslots)) m.push({ t: 'buy', i: i }); });
      if (!G.shop.removed && G.gold >= G.shop.rm) G.hs.forEach(function (h, hi) { h.deck.forEach(function (c, i) { m.push({ t: 'remove', h: hi, c: i }); }); });
      m.push({ t: 'leave' });
    }
    else if (G.scr === 'event') {
      if (G.evn.res) m.push({ t: 'leave' });
      else D.EVENTS[G.evn.id].o.forEach(function (o, i) { if (!o.cost || G.gold >= o.cost) m.push({ t: 'opt', i: i }); });
      if (G.evn.pend) { m.length = 0; G.hs[0].deck.forEach(function (c, i) { if (G.evn.pend === 'rem' || (!c.u && D.CARDS[c.id].ops.length)) m.push({ t: 'evpick', c: i }); }); }
    }
    return m;
  }
  function performMove(mv) {
    if (!G) return false; var ok = validMoves().some(function (v) { return JSON.stringify(v) === JSON.stringify(mv); }); if (!ok) return false;
    switch (mv.t) {
      case 'go': enterNode(mv.n); break;
      case 'play': play(mv.h, mv.c, mv.e); break;
      case 'pot': usePot(mv.p, mv.e); break;
      case 'end': var h = G.hs[G.b.cur]; endHeroTurn(h); if (G.scr === 'battle') nextHeroOrEnemy(); break;
      case 'takepot': G.pots.push(G.rw.pot); G.rw.took.pot = 1; break;
      case 'relic': gainRelic(G.rw.relics[mv.i]); G.rw.took.relic = 1; break;
      case 'pick': var cid = G.rw.cards[mv.h][mv.i]; G.hs[mv.h].deck.push(mk(cid)); G.rw.took['c' + mv.h] = 1; break;
      case 'skip': G.rw.took['c' + mv.h] = 1; if (has('lucky-coin') && false) G.gold += 0; G.gold += 0; break;
      case 'leave': leaveNode(); break;
      case 'heal': var hh = G.hs[mv.h]; hh.hp = Math.min(hh.mhp, hh.hp + Math.floor(hh.mhp * 0.3) + (has('healing-moss') ? 10 : 0)); G.rest.todo.splice(G.rest.todo.indexOf(mv.h), 1); if (!G.rest.todo.length) leaveNode(); break;
      case 'upg': G.hs[mv.h].deck[mv.c].u = 1; G.rest.todo.splice(G.rest.todo.indexOf(mv.h), 1); if (!G.rest.todo.length) leaveNode(); break;
      case 'buy': var it = G.shop.items[mv.i]; G.gold -= it.p; it.sold = 1;
        if (it.t === 'card') { var hk = D.CARDS[it.id].hero, tg = G.hs.filter(function (x) { return x.k === hk; })[0] || G.hs[0]; tg.deck.push(mk(it.id)); } else if (it.t === 'relic') gainRelic(it.id); else G.pots.push(it.id); break;
      case 'remove': G.gold -= G.shop.rm; G.shop.removed = 1; G.hs[mv.h].deck.splice(mv.c, 1); break;
      case 'opt':
        var ev = D.EVENTS[G.evn.id], o = ev.o[mv.i];
        if (o.roll) { var v = roll(), eff2 = o.roll.length === 3 ? o.roll[v <= 2 ? 0 : v <= 4 ? 1 : 2] : o.roll[v - 1]; applyEff(eff2); G.evn.res = 'Rolled ' + v + '.'; }
        else { var dd = o.do; if (dd.upg || dd.rem) { applyEff({ hp: dd.hp || 0 }); G.evn.pend = dd.upg ? 'upg' : 'rem'; break; } applyEff(dd); G.evn.res = o.t; }
        break;
      case 'evpick': if (G.evn.pend === 'upg') G.hs[0].deck[mv.c].u = 1; else G.hs[0].deck.splice(mv.c, 1); G.evn.pend = null; G.evn.res = 'Done.'; break;
    }
    return true;
  }
  function sideToAct() { return G && G.scr === 'battle' && G.b.ph === 'p' ? G.b.cur : -1; }
  function checkInvariants() {
    var errs = []; if (!G) return errs;
    G.hs.forEach(function (h, i) {
      if (h.hp < 0 || h.hp > h.mhp) errs.push('hp range h' + i); if (h.blk < 0) errs.push('negative block');
      if (G.scr === 'battle' && !h.dead) { var deckN = h.deck.length, inPlay = h.draw.length + h.hand.length + h.disc.length + h.exh.length; var tmp = 0;[h.draw, h.hand, h.disc, h.exh].forEach(function (a) { a.forEach(function (c) { if (D.CARDS[c.id].hero === 'z' && c.id !== 'regret' && c.id !== 'doubt' && c.id !== 'injury') tmp++; }); }); var pw = 0; Object.keys(h.pw).length; if (inPlay - tmp > deckN) errs.push('card count h' + i + ' ' + (inPlay - tmp) + '>' + deckN); if (h.hand.length > 10) errs.push('hand>10'); if (h.en < 0) errs.push('energy<0'); }
    });
    if (G.gold < 0) errs.push('gold<0'); if (G.b) G.b.en.forEach(function (e) { if (e.hp < 0 || e.hp > e.mhp) errs.push('enemy hp'); });
    return errs;
  }
  function save() { try { localStorage.setItem('emberclimb.save', JSON.stringify(G)); } catch (e) { } }
  function load() { try { var s = localStorage.getItem('emberclimb.save'); if (!s) return null; G = JSON.parse(s); return G; } catch (e) { return null; } }
  function clear() { try { localStorage.removeItem('emberclimb.save'); } catch (e) { } }
  function begin() { G.fights = 0; }
  EC.E = {
    lock: function (a) { LOCK = a || []; },
    newGame: function (o) { var g = newGame(o); g.fights = 0; return g; }, G: function () { return G; }, set: function (g) { G = g; },
    validMoves: validMoves, performMove: performMove, step: step, settle: settle, sideToAct: sideToAct, checkInvariants: checkInvariants,
    eff: eff, lines: lines, canPlay: canPlay, cost: cost, reachable: reachable, save: save, load: load, clear: clear, has: has,
    debug: {
      win: function () { if (G.b) { G.b.en.forEach(function (e) { e.hp = 0; e.dead = 1; }); winBattle(); } },
      shop: function () { G.at = G.map.filter(function (n) { return n.f === 3; })[0].id; G.floor = 3; G.gold = 400; genShop(); },
      rest: function () { G.at = G.map.filter(function (n) { return n.f === 9; })[0].id; G.rest = { todo: G.hs.map(function (h, i) { return i; }) }; G.scr = 'rest'; G.hs.forEach(function (h) { h.hp = Math.floor(h.mhp * 0.5); }); },
      event: function (id) { G.at = G.map.filter(function (n) { return n.f === 4; })[0].id; G.evn = { id: id, res: null }; G.scr = 'event'; },
      over: function (w) { G.scr = 'over'; G.won = w ? 1 : 0; G.b = null; },
      treasure: function () { G.at = G.map.filter(function (n) { return n.f === 5; })[0].id; G.rw = { gold: 30, cards: {}, relics: [pickRelic('cu')], took: {}, treasure: 1 }; G.gold += 30; G.scr = 'reward'; }
    },
    setSeed: function (s) { if (G) G.rs = s | 0; }, mk: mk
  };
  if (typeof module !== 'undefined') module.exports = EC;
})();

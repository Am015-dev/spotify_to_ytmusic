// Emberclimb engine: all state in one JSON-safe G. No DOM. Moves are plain objects.
(function () {
  var D = EC.D, G = null, SC = D.SCALE, CAP = D.CAPS, ATK = null;
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
      else if (k === 'poison' || k === 'poisonAll') { o[1] += 1; done = true; }
      else if (k === 'shiv' || k === 'heal') { o[1] += 2; done = true; }
      else if (k === 'scry' || k === 'mir') { o[1] += 1; done = true; }
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
  // b = the hero's Strength: attack numbers on the card show the real damage per hit (before the target's Block / Vulnerable)
  function lines(e, b) {
    var out = []; b = b || 0;
    function one(o) {
      var k = o[0];
      switch (k) {
        case 'dmg': return 'Deal ' + Math.max(0, o[1] + b) + '.'; case 'hit': return 'Deal ' + Math.max(0, o[2] + b) + ' x' + o[1] + '.'; case 'all': return 'Deal ' + Math.max(0, o[1] + b) + ' to ALL.';
        case 'dmgx': return 'Deal ' + o[1] + ' + ' + o[2] + 'x Str.'; case 'bodyslam': return 'Deal damage = Block.';
        case 'blk': return 'Gain ' + o[1] + ' Block.'; case 'str': return 'Gain ' + o[1] + ' Strength.'; case 'dblStr': return 'Double your Strength.';
        case 'vuln': return 'Vulnerable ' + o[1] + '.'; case 'weak': return 'Weak ' + o[1] + '.'; case 'weakAll': return 'ALL Weak ' + o[1] + '.';
        case 'poison': return 'Poison ' + o[1] + '.'; case 'poisonAll': return 'ALL Poison ' + o[1] + '.'; case 'dblPoison': return 'Double its Poison.';
        case 'draw': return 'Draw ' + o[1] + '.'; case 'nrg': return 'Gain ' + o[1] + ' energy.'; case 'heal': return 'Heal ' + o[1] + '.'; case 'loss': return 'Lose ' + o[1] + ' HP.';
        case 'shiv': return 'Add ' + o[1] + ' Shivs (' + D.CARDS.shiv.ops[0][1] + '-damage attacks).';
        case 'scry': return 'Scry ' + o[1] + ': see top ' + o[1] + ', discard any.'; case 'mir': return 'Gain ' + o[1] + ' Miracle (spend: +1 energy).'; case 'add': return 'Add ' + o[2] + ' ' + D.CARDS[o[1]].name + '.';
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
    if (e.fl.indexOf('t') >= 0) out.push('Retain: stays in hand at turn end.');
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
    G = { v: 2, seed: opt.seed == null ? (Math.random() * 1e9) | 0 : opt.seed, uid: 0, q: [], msg: '', hs: [], gold: 99, relics: [], pots: [], pslots: 3, scr: 'map', b: null, rw: null, shop: null, evn: null, rest: null, at: -1, map: [], lucky: 0, revived: 0, floor: 0, wins: 0 };
    G.rs = G.seed | 0; G.pslots = 3 * ks.length;
    G.asc = Math.max(0, Math.min(13, opt.asc | 0));   // Ascension (optional): 1 potion limit 2 each, 2 lose 5 max HP, 3 start with Regret, 4 smaller heal after an act boss, 5 dearer removal, 6 start at 90% HP. Levels 7-13 are not built.
    if (G.asc >= 1) G.pslots = 2 * ks.length;
    ks.forEach(function (k) {
      var H = D.H[k], h = { k: k, hp: H.hp, mhp: H.hp, deck: H.start.map(function (id) { return mk(id); }), dead: 0 };
      G.hs.push(h); G.relics.push(H.relic);
    });
    if (G.asc >= 2) G.hs.forEach(function (h) { h.mhp -= 5; h.hp = h.mhp; });
    if (G.asc >= 3) G.hs.forEach(function (h) { h.deck.push(mk('regret')); });
    if (G.asc >= 6) G.hs.forEach(function (h) { h.hp = Math.ceil(h.mhp * 0.9); });
    G.boss = D.ENC.boss[ri(3)][0]; if (opt.boss) G.boss = opt.boss;
    G.F = opt.floors || 9; G.ehp = opt.hpPct || 100; G.acts = opt.acts === 4 ? 4 : Math.max(1, Math.min(3, opt.acts || 1)); /* 4 = the optional Act IV; larger values fall back to the three standard acts */ G.act = 1;
    // final act (act 4, optional): one more climb to the Ember Tyrant after act 3. startAct: a story chapter set in a later act
    if (opt.final && G.acts === 3) G.acts = 4; if (opt.startAct > 1) { G.act = Math.min(4, opt.startAct | 0); G.acts = Math.max(G.acts, G.act); }
    if (G.acts > 1 && !opt.boss) G.boss = D.ACTBOSS[G.act]; G.lastStand = opt.lastStand === 0 ? 0 : 1;
    G.rd = {}; G.rr = {}; G.hs.forEach(function (h) { G.rd[h.k] = rewardPool(h.k, 0); G.rr[h.k] = rewardPool(h.k, 1); }); if (opt.relic && G.relics.indexOf(opt.relic) < 0) G.relics.push(opt.relic);
    genMap(); resetCombat();
    if (opt.bless) { G.evn = { id: 'first-ember', res: null, start: 1 }; G.scr = 'event'; }   // opening blessing: one free choice before the first room
    return G;
  }
  function resetCombat() { G.hs.forEach(function (h) { h.draw = []; h.hand = []; h.disc = []; h.exh = []; h.en = 0; h.blk = 0; h.st = {}; h.orbs = []; h.stance = 'n'; h.pw = {}; h.mir = 0; }); }
  // per-class reward decks: commons+uncommons (rare=0) or rares (rare=1), shuffled; unpicked cards go back and the deck is reshuffled
  function rewardPool(k, rare) { return shuffle(D.ORDER.filter(function (id) { var d = D.CARDS[id]; return d.hero === k && (rare ? d.rar === 'r' : (d.rar === 'c' || d.rar === 'u')); })); }
  function drawReward(k, rare) { var dk = rare ? G.rr : G.rd; if (!dk[k].length) dk[k] = rewardPool(k, rare); return dk[k].pop(); }
  function returnCards(k, ids) { if (!ids || !ids.length) return; ids.forEach(function (id) { (D.CARDS[id].rar === 'r' ? G.rr : G.rd)[k].push(id); }); shuffle(G.rd[k]); shuffle(G.rr[k]); }
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
  function addSt(o, k, n) {
    o.st[k] = (o.st[k] || 0) + n;
    if ((k === 'vuln' || k === 'weak') && o.st[k] > CAP.deb) o.st[k] = CAP.deb;
    if (k === 'str' && o.k && o.st[k] > CAP.str) o.st[k] = CAP.str;
  }
  function gainBlk(h, n) { if (!(n > 0)) return; h.blk = Math.min(CAP.blk, h.blk + n); }   // negative Focus can push an orb below 0: never take block away
  function gainEn(h, n) { h.en = Math.max(h.en, Math.min(CAP.en, h.en + n)); }
  function poisonTotal() { var t = 0; G.b.en.forEach(function (e) { if (!e.dead) t += e.st.poison || 0; }); return t; }
  function addPoison(e, n) { if (!e || e.dead) return 0; n = Math.max(0, Math.min(n, CAP.poison - poisonTotal())); if (n) e.st.poison = (e.st.poison || 0) + n; return n; }
  function roll() {
    var v = ri(6) + 1; if (G.lucky > 0) { v = 6; G.lucky--; } if (has('clover-dice')) v = Math.min(6, v + 1);
    fx('die', 'p', v); return v;
  }
  function draw(h, n) {
    for (var i = 0; i < n; i++) {
      if (!h.draw.length) { if (!h.disc.length) break; h.draw = shuffle(h.disc); h.disc = []; fx('shuf', 'p', 0); }
      h.hand.push(h.draw.pop());
    }
  }
  function addCard(h, id, n, where) {
    for (var i = 0; i < n; i++) {
      if (id === 'shiv' && h.hand.filter(function (x) { return x.id === 'shiv'; }).length >= CAP.shiv) return;
      var c = mk(id); if (where === 'hand' || id === 'shiv') h.hand.push(c); else h.disc.push(c);
    }
  }
  function hurtHero(h, n, ignoreBlk) {
    if (n <= 0) return 0;
    if (!ignoreBlk) { var a = Math.min(h.blk, n); h.blk -= a; n -= a; }
    if (n > 0) { h.hp -= n; fx('hp', 'h' + G.hs.indexOf(h), n); if (h.hp <= 0) { h.hp = 0; killHero(h); } }
    return n;
  }
  function killHero(h) {
    if (has('phoenix-ash') && !G.revived) { G.revived = 1; h.hp = Math.max(1, Math.floor(h.mhp * 0.3)); fx('revive', 'h' + G.hs.indexOf(h), h.hp); return; }
    // last stand (tabletop optional boss rule, shelf version): in a boss fight with 2 heroes the FIRST hero to fall stays at 1 HP with Weak 3
    if (G.lastStand && G.b && G.b.kind === 'b' && G.hs.length > 1 && !G.b.ls) { G.b.ls = 1; h.hp = 1; h.st.weak = CAP.deb; fx('laststand', 'h' + G.hs.indexOf(h), 1); return; }
    // tabletop: if ANY hero reaches 0 HP the party loses at once
    h.dead = 1; fx('dead', 'h' + G.hs.indexOf(h), 0);
    G.killer = G.lastHit || 'self'; G.killIn = G.b ? G.b.kind : ''; G.scr = 'over'; G.won = 0; G.b = null; ATK = null;
  }
  // one hit: base (+Strength, +Wrath SCALE) then Weak -SCALE (floor 0) then Vulnerable x2; a Weak attacker on a Vulnerable target: neither applies
  function hitCalc(base, weak, vul) { var d = base; if (!(weak && vul)) { if (weak) d -= SC; d = Math.max(0, d); if (vul) d *= 2; } return Math.max(0, d); }
  function dmgBase(h, base, card) { return base + st(h, 'str') + (card && card.type === 'A' && has('smoking-censer') ? 1 : 0) + (h.stance === 'w' ? SC : 0); }
  var SPK_CARD = null;
  function hitEnemy(h, e, base, card) {
    if (e.dead) return;
    if (e.spk > 0 && card && card.type === 'A' && SPK_CARD !== card) { SPK_CARD = card; fx('hitme', 'h' + G.hs.indexOf(h), e.spk, 'spikes'); hurtHero(h, e.spk); if (G.scr !== 'battle' || h.dead) return; }
    var ei = G.b.en.indexOf(e), weak = ATK ? ATK.weak : st(h, 'weak') > 0, vul;
    if (ATK) { ATK.any = 1; if (ATK.vt[ei] == null) ATK.vt[ei] = st(e, 'vuln') > 0; vul = ATK.vt[ei]; } else vul = st(e, 'vuln') > 0;
    var d = hitCalc(dmgBase(h, base, card), weak, vul);
    var a = Math.min(e.blk, d); e.blk -= a; var real = d - a;
    fx('dmg', 'e' + G.b.en.indexOf(e), d, a > 0 && real === 0 ? 'blocked' : (st(h, 'str') > 0 ? 'str' : ''));
    if (real > 0) {
      e.hp -= real; e.asleep = 0;
      if (h.pw.envenom) addPoison(e, h.pw.envenom);
      if (e.hp <= 0) { e.hp = 0; e.dead = 1; fx('kill', 'e' + G.b.en.indexOf(e), 0); }
      phaseCheck(e);
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
    else if (o.k === 'F') { gainBlk(h, 5 + f); fx('blk', 'h' + G.hs.indexOf(h), 5 + f); }
    else { var l = lowest(); if (l) hitRaw(l, 6 + (o.v || 0) + f); }
    if (remove) h.orbs.shift();
  }
  function hitRaw(e, d) {
    if (e.dead || d <= 0) return; var a = Math.min(e.blk, d); e.blk -= a; var real = d - a; fx('dmg', 'e' + G.b.en.indexOf(e), d, '');
    if (real > 0) { e.hp -= real; e.asleep = 0; if (e.hp <= 0) { e.hp = 0; e.dead = 1; fx('kill', 'e' + G.b.en.indexOf(e), 0); } phaseCheck(e); }
  }
  function setStance(h, s) {
    if (h.stance === s) return; if (h.stance === 'c') gainEn(h, 2); h.stance = s; fx('stance', 'h' + G.hs.indexOf(h), 0, s);
    if (h.pw.mental) { gainBlk(h, h.pw.mental); } if (s === 'w' && h.pw.rush) draw(h, h.pw.rush);
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
        case 'blk': var b = o[1] + (card && card.type === 'S' && has('tin-flute') ? 1 : 0); if (st(h, 'frail') > 0) b = Math.floor(b * 0.75); gainBlk(h, b); fx('blk', hi, b); break;
        case 'str': addSt(h, 'str', o[1]); fx('buff', hi, o[1], 'str'); break;
        case 'dblStr': addSt(h, 'str', st(h, 'str')); fx('buff', hi, 0, 'str'); break;
        case 'vuln': case 'weak': if (e && !e.dead) { addSt(e, k, o[1]); fx('debuff', 'e' + tgt, o[1], k); } break;
        case 'weakAll': alive().forEach(function (t) { addSt(t, 'weak', o[1]); fx('debuff', 'e' + G.b.en.indexOf(t), o[1], 'weak'); }); break;
        case 'poison': if (e && !e.dead) { fx('debuff', 'e' + tgt, addPoison(e, o[1]), 'poison'); } break;
        case 'poisonAll': alive().forEach(function (t) { fx('debuff', 'e' + G.b.en.indexOf(t), addPoison(t, o[1]), 'poison'); }); break;
        case 'dblPoison': if (e && !e.dead) { addPoison(e, e.st.poison || 0); fx('debuff', 'e' + tgt, 0, 'poison'); } break;
        case 'draw': draw(h, o[1]); break;
        case 'nrg': gainEn(h, o[1]); fx('buff', hi, o[1], 'nrg'); break;
        case 'mir': h.mir = Math.min(CAP.mir, (h.mir || 0) + o[1]); fx('buff', hi, o[1], 'mir'); break;
        case 'scry': var sn = Math.min(o[1], h.draw.length); if (sn > 0) G.b.scry = { h: G.hs.indexOf(h), n: sn }; break;
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
    var d = D.ENEMIES[id], hp = d.hp[0] + ri(d.hp[1] - d.hp[0] + 1); hp = Math.round(hp * (D.EHP[G.hs.length] || 1) * (1 + 0.25 * ((G.act || 1) - 1))); if (G.ehp && G.ehp !== 100) hp = Math.round(hp * G.ehp / 100);
    return { id: id, hp: hp, mhp: hp, blk: 0, st: {}, i: -1, intent: null, asleep: d.sleep || 0, dead: 0, acted: 0, spk: 0, row: 0 };
  }
  function plan(e) {
    var d = D.ENEMIES[e.id], step, pat = (e.ph2 && d.pat2) || d.pat;
    if (e.asleep > 0) { e.intent = { sleep: 1 }; return; }
    if (d.mode === 'rand') { var k; do { k = ri(pat.length); } while (k === e.i && pat.length > 1); e.i = k; }
    else e.i = (e.i + 1) % pat.length;
    step = pat[e.i]; var dn = 0;
    if (step.die) { dn = G.b.die || 1; step = step.die[dn <= 2 ? 0 : dn <= 4 ? 1 : 2]; }
    e.intent = JSON.parse(JSON.stringify(step)); if (dn) e.intent.die = dn;
    var tg = e.row; if (!G.hs[tg] || G.hs[tg].dead) tg = G.hs.indexOf(aliveHs()[0]); e.intent.tg = tg;
  }
  // boss phase 2: at half HP a boss with a second pattern changes phase once; its next move is re-planned at once so the new intent shows
  function phaseCheck(e) {
    var d = D.ENEMIES[e.id]; if (!d || !d.pat2 || e.ph2 || e.dead || e.hp > e.mhp / 2) return;
    e.ph2 = 1; e.i = -1; plan(e); fx('phase', 'e' + G.b.en.indexOf(e), 0, e.id);
  }
  function startBattle(kind) {
    var P = (G.act > 1 && D.ENCA[G.act]) || D.ENC, pool = kind === 'e' ? P.elite : kind === 'b' ? [[G.boss]] : (G.fights < 3 ? P.weak : P.strong);
    var ids = pool[ri(pool.length)].slice();
    if (kind !== 'e' && kind !== 'b') {   // an Encounter room has one enemy per hero: trim a bigger group, top a smaller one up from another group of the same pool
      var cap = G.hs.length + (kind === 'm' && G.fights >= 3 && D.STRONGX ? D.STRONGX : 0);   // G3 r2 balance: later Encounter rooms keep one extra foe
      while (ids.length > cap) ids.pop();
      for (var gt = 0; ids.length < G.hs.length && gt < 20; gt++) { var og = pool[ri(pool.length)]; if (og[0]) ids.push(og[0]); }
    }
    resetCombat();
    G.b = { en: ids.map(mkEnemy), turn: 0, ph: 'p', cur: 0, kind: kind, die: 0, scry: null };
    G.b.en.forEach(function (e, i) { e.row = i % G.hs.length; });
    // G3 r2 balance: the later Encounter rooms of an act (after the first 3 fights) have tougher foes (x D.STRONGHP HP), so floors 4-9 are not trivial
    if (kind === 'm' && G.fights >= 3 && D.STRONGHP) G.b.en.forEach(function (e) { e.hp = e.mhp = Math.round(e.mhp * D.STRONGHP); });
    G.scr = 'battle'; G.fights++;
    G.hs.forEach(function (h) {
      if (h.dead) return;
      h.draw = shuffle(h.deck.slice());
      if (has('iron-bangle')) gainBlk(h, 4); if (has('spark-core') && h.k === 'a') chan(h, 'L'); if (has('prayer-beads') && h.k === 'm') h.mir = Math.min(CAP.mir, 1);
    });
    if (has('spark-core') && !G.hs.some(function (h) { return h.k === 'a'; })) { /* only the Automaton benefits */ }
    G.b.en.forEach(function (e) { if (has('bag-of-marbles')) addSt(e, 'vuln', 1); });
    beginRound();
  }
  function beginRound() {
    G.b.turn++; G.b.ph = 'p'; G.b.cur = -1;
    // one shared enemy die per round, rolled before the heroes act so die-based intents are visible
    G.b.die = ri(6) + 1; fx('die', '', G.b.die);
    G.b.en.forEach(function (e) { if (!e.dead) plan(e); });
    // Block is cleared each new round, but not on round 1: start-of-fight Block (Iron Bangle) must last through the first round
    G.hs.forEach(function (h) { if (!h.dead) { if (G.b.turn > 1) h.blk = 0; h.started = 0; } });
    nextHero(0);
  }
  function nextHero(from) {
    for (var i = from; i < G.hs.length; i++) if (!G.hs[i].dead) { G.b.cur = i; startHeroTurn(G.hs[i]); return true; }
    return false;
  }
  function startHeroTurn(h) {
    if (G.b.turn > 1) h.blk = 0; h.en = Math.min(CAP.en, 3 + (has('dawnstone') ? 1 : 0) + (h.pw.deva || 0) + (G.b.turn === 1 && has('lantern') ? 1 : 0));
    var n = 5 + (has('gale-cloak') ? 1 : 0) + (G.b.turn === 1 ? (h.k === 's' && has('whetstone-ring') ? 2 : 0) + (has('candle-stub') ? 1 : 0) : 0);
    if (h.pw.noxious) alive().forEach(function (e) { addPoison(e, h.pw.noxious); });
    if (h.pw.reactor) chan(h, 'L');
    draw(h, n);
    fx('turn', 'h' + G.hs.indexOf(h), G.b.turn);
  }
  function endHeroTurn(h) {
    var hi = G.hs.indexOf(h), f = h.pw.focus || 0;
    h.orbs.forEach(function (o) {
      if (o.k === 'L') { var t = alive()[ri(alive().length)]; if (t) hitRaw(t, 3 + f); }
      else if (o.k === 'F') { gainBlk(h, 2 + f); fx('blk', 'h' + hi, 2 + f); }
      else o.v += 6 + f;
    });
    if (h.pw.ritual) { addSt(h, 'str', h.pw.ritual); fx('buff', 'h' + hi, h.pw.ritual, 'str'); }
    if (h.pw.plated) { gainBlk(h, h.pw.plated); fx('blk', 'h' + hi, h.pw.plated); }
    var held = h.hand.length, keep = [];
    h.hand.forEach(function (c) {
      var fl = D.CARDS[c.id].fl;
      if (fl.indexOf('b') >= 0) { fx('hitme', 'h' + hi, 2, 'burn'); hurtHero(h, 2, true); }
      if (fl.indexOf('r') >= 0) hurtHero(h, held, true);
      if (fl.indexOf('d') >= 0) addSt(h, 'weak', 1);
      if (fl.indexOf('t') >= 0) keep.push(c); else if (fl.indexOf('e') >= 0) h.exh.push(c); else h.disc.push(c);
    });
    h.hand = keep;
    if (G.scr === 'battle' && h.stance === 'w' && !h.dead) { fx('hitme', 'h' + hi, SC, 'wrath'); hurtHero(h, SC); }
    if (G.scr === 'battle' && !alive().length) winBattle();
  }
  function nextHeroOrEnemy() {
    if (G.scr !== 'battle') return;
    if (!nextHero(G.b.cur + 1)) { tickPoison(); if (G.scr !== 'battle') return; G.b.ph = 'e'; G.b.ei = 0; G.b.cur = -1; }
  }
  // tabletop poison: at the end of the heroes' turn each poisoned enemy loses 1 HP per token (ignores Block); tokens stay until it dies
  function tickPoison() {
    alive().forEach(function (e) { var p = e.st.poison || 0; if (p > 0) { e.hp -= p; fx('dmg', 'e' + G.b.en.indexOf(e), p, 'poison'); losePoisonKill(e); phaseCheck(e); } });
    if (!alive().length) winBattle();
  }
  // one enemy acts per call; returns true while enemy phase continues
  function step() {
    if (!G.b || G.b.ph !== 'e') return false;
    var e = G.b.en[G.b.ei];
    if (G.b.ei >= G.b.en.length) { finishRound(); return false; }
    G.b.ei++;
    if (e.dead) return true;
    e.blk = 0;
    act(e);
    if (G.scr !== 'battle') return false;
    return true;
  }
  function act(e) {
    var it = e.intent, d = D.ENEMIES[e.id]; if (!it) return;
    if (it.sleep) { if (e.asleep > 0) e.asleep--; fx('act', 'e' + G.b.en.indexOf(e), 0, 'sleep'); return; }
    var hs = aliveHs(), h = G.hs[it.tg]; if (!h || h.dead) h = hs[0]; if (!h) return;
    var tgs = it.all ? hs : [h];
    var ei = 'e' + G.b.en.indexOf(e); G.lastHit = e.id;
    fx('act', ei, 0, it.atk ? 'atk' : 'cast', G.hs.indexOf(h));
    e.spk = 0; if (it.spikes) { e.spk = it.spikes; fx('buff', ei, it.spikes, 'spikes'); }
    if (it.str) { addSt(e, 'str', it.str); fx('buff', ei, it.str, 'str'); }
    if (it.blk) { e.blk += it.blk; fx('blk', ei, it.blk); }
    if (it.atk) {
      var weak = st(e, 'weak') > 0;   // Weak/Vulnerable are spent once per whole attack action, not per hit
      for (var j = 0; j < tgs.length && G.scr === 'battle'; j++) {
        var t = tgs[j], vul = st(t, 'vuln') > 0;
        for (var i = 0; i < (it.hits || 1); i++) {
          if (t.dead || G.scr !== 'battle') break;
          var dm = hitCalc(it.atk + st(e, 'str'), weak, vul);
          var a = Math.min(t.blk, dm); fx('hitme', 'h' + G.hs.indexOf(t), dm, a === dm ? 'blocked' : (st(e, 'str') > 0 ? 'str' : ''));
          hurtHero(t, dm);
        }
        if (G.scr === 'battle' && vul && t.st.vuln > 0) t.st.vuln--;
      }
      if (G.scr === 'battle' && weak && e.st.weak > 0) e.st.weak--;
    }
    if (G.scr !== 'battle') return;
    // the action's text resolves top to bottom: the hit lands first, then its debuffs / added cards (so a Vulnerable it applies cannot double its own hit)
    tgs.forEach(function (t) { if (t.dead) return;
      if (it.weak) addSt(t, 'weak', it.weak); if (it.vuln) addSt(t, 'vuln', it.vuln); if (it.frail) addSt(t, 'frail', it.frail);
      if (it.weak || it.vuln) fx('debuff', 'h' + G.hs.indexOf(t), it.weak || it.vuln, it.weak ? 'weak' : 'vuln');
      if (it.add) addCard(t, it.add[0], it.add[1], 'disc');
    });
    e.acted++; if (d.ritual && e.acted > 1) addSt(e, 'str', d.ritual);
  }
  function finishRound() {
    G.hs.forEach(function (h) { if (h.st.frail > 0) h.st.frail--; });
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
    var nh = G.hs.length, nrel = 1;
    if (kind === 'e') relics = [pickRelic('cu')]; else if (kind === 'b') { relics = pickRelics('b', nh === 1 ? 3 : nh + 1); nrel = nh; }
    G.rw = { gold: gold, cards: cards, pot: ps, relics: relics, took: {}, nrel: nrel };
    ATK = null;
    G.scr = 'reward'; G.b = null; resetCombat();
    G.hs.forEach(function (h) { if (h.k === 'w' || true) { h.blk = 0; } });
  }
  function cardChoices(h, kind) {
    // reward deck per class; the boss gives 3 cards from the rare deck, an elite 1 rare + 2, a monster 3 from the reward deck
    var out = [], nr = kind === 'b' ? 3 : kind === 'e' ? 1 : 0, tries = 0;
    while (out.length < 3 && tries++ < 20) { var id = drawReward(h.k, out.length < nr ? 1 : 0); if (out.indexOf(id) < 0) out.push(id); else returnCards(h.k, [id]); }
    return out;
  }
  var LOCK = [];   // relic ids kept out of the random pool until a Story chapter unlocks them (set by the UI)
  function pickRelics(rar, n) { var l = Object.keys(D.RELICS).filter(function (k) { return rar.indexOf(D.RELICS[k].rar) >= 0 && !has(k) && LOCK.indexOf(k) < 0; }); shuffle(l); return l.slice(0, n); }
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
    if (h.pw.afterimg) { gainBlk(h, h.pw.afterimg); }
    ATK = { weak: st(h, 'weak') > 0, vt: {}, any: 0 };
    runOps(h, e.ops, e, e.tgt ? ti : null, X);
    // a whole card is one attack: spend 1 Weak (attacker) and 1 Vulnerable per target hit, whatever the number of hits
    if (G.scr === 'battle' && G.b && ATK && ATK.any) {
      if (ATK.weak && h.st.weak > 0) h.st.weak--;
      Object.keys(ATK.vt).forEach(function (i) { var t = G.b.en[i]; if (ATK.vt[i] && t && !t.dead && t.st.vuln > 0) t.st.vuln--; });
    }
    ATK = null;
    if (G.scr === 'battle') {
      if (e.type === 'P') { /* power: removed from play */ } else if (e.fl.indexOf('x') >= 0 || D.CARDS[c.id].hero === 'z' && c.id === 'shiv') h.exh.push(c); else h.disc.push(c);
    }
  }
  function usePot(pi, ti) {
    var id = G.pots[pi], h = G.hs[G.b.cur], hi = 'h' + G.b.cur; G.pots.splice(pi, 1); fx('pot', hi, 0, id);
    switch (id) {
      case 'fire-flask': hitRaw(G.b.en[ti], 20); break;
      case 'block-brew': gainBlk(h, 12); fx('blk', hi, 12); break;
      case 'strength-tonic': addSt(h, 'str', 2); break;
      case 'swift-draught': draw(h, 3); break;
      case 'energy-vial': gainEn(h, 2); break;
      case 'venom-vial': addPoison(G.b.en[ti], 4); break;
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
    else if (n.t === 't') { G.rw = { gold: 0, cards: {}, relics: pickRelics('cu', G.hs.length), took: {}, treasure: 1, nrel: G.hs.length }; G.rw.gold = 20 + ri(30); G.gold += G.rw.gold; G.scr = 'reward'; }
    else if (n.t === 's') genShop();
    else { var ks = Object.keys(D.EVENTS).filter(function (k) { return !D.EVENTS[k].start; }); G.evn = { id: ks[ri(ks.length)], res: null }; G.scr = 'event'; }
  }
  function genShop() {
    var items = [], ks = G.hs.map(function (h) { return h.k; });
    for (var i = 0; i < 3 * ks.length; i++) {
      var k = ks[Math.floor(i / 3)], rar = ['c', 'u', 'r'][i % 3], pool = D.ORDER.filter(function (id) { var d = D.CARDS[id]; return d.hero === k && d.rar === rar; }), id = pool[ri(pool.length)];
      items.push({ t: 'card', id: id, p: { c: 50, u: 75, r: 150 }[rar], sold: 0 });
    }
    var neu = shuffle(['n-bandage', 'n-good-instincts', 'n-finesse', 'n-panic-button', 'n-hand-of-greed']); neu.slice(0, 3).forEach(function (id) { items.push({ t: 'card', id: id, p: { c: 50, u: 75, r: 150 }[D.CARDS[id].rar], sold: 0 }); });   // 3 colourless cards, priced by rarity (2 / 3 / 6 gold units of 25)
    // 3 relics + 3 potions; the first (top-left) of each is one price step (15 gold) cheaper
    pickRelics('cu', 3).forEach(function (r, j) { items.push({ t: 'relic', id: r, p: (D.RELICS[r].rar === 'u' ? 220 : 150) - (j === 0 ? 25 : 0), sold: 0 }); });
    var pk = Object.keys(D.POTIONS); for (var j = 0; j < 3; j++) items.push({ t: 'pot', id: pk[ri(pk.length)], p: 50 - (j === 0 ? 25 : 0), sold: 0 });
    G.shop = { items: items, rm: (G.asc >= 5 ? 100 : 75), removed: 0, remh: [] }; G.scr = 'shop';   // removed = every hero has used their removal; remh = heroes who did
  }
  function leaveNode() {
    if (G.evn && G.evn.start) { G.evn = null; G.scr = 'map'; return; }   // after the opening blessing: back to the map, still before floor 1
    if (G.at < 0) G.at = G.map.filter(function (n) { return n.f === 1; })[0].id;
    if (G.rw && G.rw.cards) Object.keys(G.rw.cards).forEach(function (hi) { if (!G.rw.took['c' + hi]) returnCards(G.hs[hi].k, G.rw.cards[hi]); });
    G.rw = null; G.shop = null; G.evn = null; G.rest = null;
    if (G.map[G.at].t === 'b') {
      if ((G.act || 1) < (G.acts || 1)) {   // next act: full heal, new map and boss, tougher foes
        G.act++; G.hs.forEach(function (h) { h.hp = G.asc >= 4 ? Math.min(h.mhp, h.hp + Math.ceil((h.mhp - h.hp) * 0.75)) : h.mhp; }); G.boss = D.ACTBOSS[G.act]; G.fights = 0; genMap(); G.at = -1; G.floor = 0; G.scr = 'map'; return;
      }
      G.scr = 'over'; G.won = 1; return;
    }
    G.scr = 'map';
  }
  // applies an event result and returns a plain line of what changed ("+50 gold. Gained Cinder Strike.") so the player sees the outcome
  function applyEff(d) {
    var say = [], nm = function (id) { return D.CARDS[id] ? D.CARDS[id].name : id; }, g0 = G.gold, h0 = G.hs[0] ? G.hs[0].hp : 0;
    if (d.gold) G.gold = Math.max(0, G.gold + d.gold); if (d.heal) G.hs.forEach(function (h) { if (!h.dead) h.hp = Math.min(h.mhp, h.hp + d.heal); });
    if (d.hp) G.hs.forEach(function (h) { if (!h.dead) { h.hp = Math.max(1, h.hp + d.hp); } }); if (d.mhp) G.hs.forEach(function (h) { h.mhp += d.mhp; h.hp += d.mhp; });
    if (G.gold !== g0) say.push((G.gold > g0 ? '+' : '') + (G.gold - g0) + ' gold.');
    if (G.hs[0] && G.hs[0].hp !== h0) say.push((G.hs[0].hp > h0 ? '+' : '') + (G.hs[0].hp - h0) + ' HP.');
    if (d.mhp) say.push('+' + d.mhp + ' max HP.');
    if (d.relic) { var rl = pickRelic('cu'); gainRelic(rl); if (rl && D.RELICS[rl]) say.push('Relic: ' + D.RELICS[rl].name + ' (' + D.RELICS[rl].t + ')'); }
    if (d.curse) { G.hs.forEach(function (h) { h.deck.push(mk(d.curse)); }); say.push('Curse added: ' + nm(d.curse) + '.'); }
    if (d.card) G.hs.forEach(function (h) { var ch = cardChoices(h, 'm'); h.deck.push(mk(ch[0])); returnCards(h.k, ch.slice(1)); say.push('Gained ' + nm(ch[0]) + '.'); });
    if (d.rare) G.hs.forEach(function (h) { var rid = drawReward(h.k, 1); h.deck.push(mk(rid)); say.push('Gained rare card ' + nm(rid) + '.'); });
    if (d.pot) { var np = 0; for (var pi = 0; pi < d.pot && G.pots.length < G.pslots; pi++) { var pk2 = Object.keys(D.POTIONS); G.pots.push(pk2[ri(pk2.length)]); np++; } if (np) say.push('+' + np + ' potion' + (np > 1 ? 's' : '') + '.'); else say.push('Potion slots full.'); }
    return say.join(' ') || 'Nothing changed.';
  }
  // ---------- moves
  function validMoves() {
    var m = [];
    if (!G) return m;
    if (G.scr === 'map') reachable().forEach(function (n) { m.push({ t: 'go', n: n }); });
    else if (G.scr === 'battle' && G.b.ph === 'p' && G.b.scry) {   // pending Scry: choose which of the top cards to keep (index 0 = top)
      var sn = G.b.scry.n; for (var mask = (1 << sn) - 1; mask >= 0; mask--) { var keep = []; for (var b = 0; b < sn; b++) if (mask & (1 << b)) keep.push(b); m.push({ t: 'scry', keep: keep }); }
    }
    else if (G.scr === 'battle' && G.b.ph === 'p') {
      var h = G.hs[G.b.cur], al = G.b.en.map(function (e, i) { return e.dead ? -1 : i; }).filter(function (i) { return i >= 0; });
      h.hand.forEach(function (c, i) { if (!canPlay(h, c)) return; if (eff(c).tgt) al.forEach(function (t) { m.push({ t: 'play', h: G.b.cur, c: i, e: t }); }); else m.push({ t: 'play', h: G.b.cur, c: i }); });
      G.pots.forEach(function (p, i) { if (D.POTIONS[p].tgt) al.forEach(function (t) { m.push({ t: 'pot', p: i, e: t }); }); else m.push({ t: 'pot', p: i }); });
      if (h.mir > 0) m.push({ t: 'mir' });
      m.push({ t: 'end' });
    }
    else if (G.scr === 'reward') {
      var r = G.rw; if (!r.took.pot && r.pot && G.pots.length < G.pslots) m.push({ t: 'takepot' });
      (r.relics || []).forEach(function (id, i) { if (!r.took.relic && id && !r.took['r' + i]) m.push({ t: 'relic', i: i }); });
      Object.keys(r.cards).forEach(function (hi) { if (!r.took['c' + hi]) { r.cards[hi].forEach(function (id, i) { m.push({ t: 'pick', h: +hi, i: i }); }); m.push({ t: 'skip', h: +hi }); } });
      m.push({ t: 'leave' });
      if (G.map[G.at] && G.map[G.at].t === 'b' && (G.act || 1) < (G.acts || 1)) m.push({ t: 'stop' });   // the party may stop after any act
    }
    else if (G.scr === 'rest') { G.rest.todo.forEach(function (hi) { m.push({ t: 'heal', h: hi }); G.hs[hi].deck.forEach(function (c, i) { if (!c.u && D.CARDS[c.id].ops.length && D.CARDS[c.id].hero !== 'z') m.push({ t: 'upg', h: hi, c: i }); }); }); }
    else if (G.scr === 'shop') {
      G.shop.items.forEach(function (it, i) { if (!it.sold && G.gold >= it.p && !(it.t === 'pot' && G.pots.length >= G.pslots)) m.push({ t: 'buy', i: i }); });
      if (G.gold >= G.shop.rm) G.hs.forEach(function (h, hi) { if ((G.shop.remh || []).indexOf(hi) >= 0) return; h.deck.forEach(function (c, i) { m.push({ t: 'remove', h: hi, c: i }); }); });
      m.push({ t: 'leave' });
    }
    else if (G.scr === 'event') {
      if (G.evn.res) m.push({ t: 'leave' });
      else D.EVENTS[G.evn.id].o.forEach(function (o, i) { if (!o.cost || G.gold >= o.cost) m.push({ t: 'opt', i: i }); });
      if (G.evn.pend) { m.length = 0; G.hs[0].deck.forEach(function (c, i) { if (G.evn.pend === 'rem' || (G.evn.pend === 'xform' && D.CARDS[c.id].hero !== 'z') || (G.evn.pend === 'upg' && !c.u && D.CARDS[c.id].ops.length)) m.push({ t: 'evpick', c: i }); }); }
    }
    return m;
  }
  function performMove(mv) {
    if (G && mv && mv.t === 'toss') { if (!G.pots[mv.p]) return false; G.pots.splice(mv.p, 1); return true; }   // discard a potion (any screen); kept out of validMoves so bots never throw potions away
    if (!G) return false; var ok = validMoves().some(function (v) { return JSON.stringify(v) === JSON.stringify(mv); }); if (!ok) return false;
    switch (mv.t) {
      case 'go': enterNode(mv.n); break;
      case 'play': play(mv.h, mv.c, mv.e); break;
      case 'pot': usePot(mv.p, mv.e); break;
      case 'mir': var mh = G.hs[G.b.cur]; mh.mir--; mh.en++; fx('buff', 'h' + G.b.cur, 1, 'nrg'); break;
      case 'scry': var sh = G.hs[G.b.scry.h], top = sh.draw.splice(sh.draw.length - G.b.scry.n, G.b.scry.n).reverse(), kept = [];
        top.forEach(function (c, i) { if (mv.keep.indexOf(i) >= 0) kept.push(c); else sh.disc.push(c); }); sh.draw = sh.draw.concat(kept.reverse()); G.b.scry = null; break;
      case 'end': var h = G.hs[G.b.cur]; endHeroTurn(h); if (G.scr === 'battle') nextHeroOrEnemy(); break;
      case 'takepot': G.pots.push(G.rw.pot); G.rw.took.pot = 1; break;
      case 'relic': gainRelic(G.rw.relics[mv.i]); G.rw.took['r' + mv.i] = 1; G.rw.took.rn = (G.rw.took.rn || 0) + 1; if (G.rw.took.rn >= (G.rw.nrel || 1)) G.rw.took.relic = 1; break;
      case 'pick': var cid = G.rw.cards[mv.h][mv.i]; G.hs[mv.h].deck.push(mk(cid)); G.rw.took['c' + mv.h] = 1; returnCards(G.hs[mv.h].k, G.rw.cards[mv.h].filter(function (x, i) { return i !== mv.i; })); break;
      case 'skip': G.rw.took['c' + mv.h] = 1; returnCards(G.hs[mv.h].k, G.rw.cards[mv.h]); break;
      case 'leave': leaveNode(); break;
      case 'stop': G.rw = null; G.scr = 'over'; G.won = 1; break;
      case 'heal': var hh = G.hs[mv.h]; hh.hp = Math.min(hh.mhp, hh.hp + 3 * SC + (has('healing-moss') ? 10 : 0)); G.rest.todo.splice(G.rest.todo.indexOf(mv.h), 1); if (!G.rest.todo.length) leaveNode(); break;
      case 'upg': G.hs[mv.h].deck[mv.c].u = 1; G.rest.todo.splice(G.rest.todo.indexOf(mv.h), 1); if (!G.rest.todo.length) leaveNode(); break;
      case 'buy': var it = G.shop.items[mv.i]; G.gold -= it.p; it.sold = 1;
        if (it.t === 'card') { var hk = D.CARDS[it.id].hero, tg = G.hs.filter(function (x) { return x.k === hk; })[0] || G.hs[0]; tg.deck.push(mk(it.id)); } else if (it.t === 'relic') gainRelic(it.id); else G.pots.push(it.id); break;
      case 'remove': G.gold -= G.shop.rm; (G.shop.remh = G.shop.remh || []).push(mv.h); G.shop.removed = G.shop.remh.length >= G.hs.length ? 1 : 0; G.hs[mv.h].deck.splice(mv.c, 1); break;
      case 'opt':
        var ev = D.EVENTS[G.evn.id], o = ev.o[mv.i];
        if (o.roll) { var v = roll(), eff2 = o.roll.length === 3 ? o.roll[v <= 2 ? 0 : v <= 4 ? 1 : 2] : o.roll[v - 1]; var out = applyEff(eff2); G.evn.res = 'Rolled ' + v + ': ' + out; }
        else { var dd = o.do; if (dd.upg || dd.rem || dd.xform) { applyEff({ hp: dd.hp || 0 }); G.evn.pend = dd.upg ? 'upg' : dd.xform ? 'xform' : 'rem'; break; } var out2 = applyEff(dd); G.evn.res = out2 === 'Nothing changed.' ? o.t : out2; }
        break;
      case 'evpick': var pkn = D.CARDS[G.hs[0].deck[mv.c].id].name, pres = ''; if (G.evn.pend === 'upg') { G.hs[0].deck[mv.c].u = 1; pres = 'Upgraded ' + pkn + ' to ' + pkn + '+.'; } else if (G.evn.pend === 'xform') { G.hs[0].deck.splice(mv.c, 1); G.hs[0].deck.push(mk(drawReward(G.hs[0].k, 0))); /* transform: remove a non-curse card, gain the top card of the rewards deck */ } else G.hs[0].deck.splice(mv.c, 1); if (!pres) pres = G.evn.pend === 'xform' ? 'Transformed ' + pkn + ' into ' + D.CARDS[G.hs[0].deck[G.hs[0].deck.length - 1].id].name + '.' : 'Removed ' + pkn + '.'; G.evn.pend = null; G.evn.res = pres; break;
    }
    return true;
  }
  // UI: damage per hit the enemy's current intent would deal to hero hi (after Strength, Weak, Vulnerable); 0 if it does not attack
  function previewHit(ei, hi) {
    if (!G || !G.b) return 0; var e = G.b.en[ei]; if (!e || e.dead || !e.intent || !e.intent.atk) return 0;
    var t = G.hs[hi != null ? hi : e.intent.tg] || G.hs[0]; return hitCalc(e.intent.atk + st(e, 'str'), st(e, 'weak') > 0, st(t, 'vuln') > 0);
  }
  function sideToAct() { return G && G.scr === 'battle' && G.b.ph === 'p' ? G.b.cur : -1; }
  function checkInvariants() {
    var errs = []; if (!G) return errs;
    G.hs.forEach(function (h, i) {
      if (h.hp < 0 || h.hp > h.mhp) errs.push('hp range h' + i); if (h.blk < 0) errs.push('negative block');
      if (G.scr === 'battle' && !h.dead) { var deckN = h.deck.length, inPlay = h.draw.length + h.hand.length + h.disc.length + h.exh.length; var tmp = 0;[h.draw, h.hand, h.disc, h.exh].forEach(function (a) { a.forEach(function (c) { if (D.CARDS[c.id].hero === 'z' && c.id !== 'regret' && c.id !== 'doubt' && c.id !== 'injury') tmp++; }); }); var pw = 0; Object.keys(h.pw).length; if (inPlay - tmp > deckN) errs.push('card count h' + i + ' ' + (inPlay - tmp) + '>' + deckN); if (h.en < 0) errs.push('energy<0'); if (h.blk > CAP.blk) errs.push('block>cap'); if ((h.st.str || 0) > CAP.str) errs.push('str>cap'); if ((h.st.vuln || 0) > CAP.deb || (h.st.weak || 0) > CAP.deb) errs.push('debuff>cap'); }
    });
    if (G.gold < 0) errs.push('gold<0'); if (G.b) { G.b.en.forEach(function (e) { if (e.hp < 0 || e.hp > e.mhp) errs.push('enemy hp'); }); if (poisonTotal() > CAP.poison) errs.push('poison>cap'); }
    return errs;
  }
  function save() { try { localStorage.setItem('emberclimb.save', JSON.stringify(G)); } catch (e) { } }
  function load() { try { var s = localStorage.getItem('emberclimb.save'); if (!s) return null; G = JSON.parse(s); return G; } catch (e) { return null; } }
  function clear() { try { localStorage.removeItem('emberclimb.save'); } catch (e) { } }
  function begin() { G.fights = 0; }
  // W420 previewPlay: dry-run one card play on a deep copy of the state; returns per-enemy damage/kill and block/heal per hero. Restores everything.
  function previewPlay(hi, ci, ti) {
    if (!G || !G.b) return null; var h0 = G.hs[hi], c0 = h0 && h0.hand[ci]; if (!c0) return null;
    var keep = G, kA = ATK, kS = SPK_CARD, out = null;
    try {
      G = JSON.parse(JSON.stringify(keep)); G.q = []; var en = G.b.en, b0 = en.map(function (e) { return { hp: e.hp, blk: e.blk, dead: e.dead }; }), hp0 = G.hs.map(function (x) { return x.hp; });
      var e0 = eff(c0); play(hi, ci, e0.tgt ? ti : null);
      var blk = G.hs.map(function () { return 0; }), heal = G.hs.map(function () { return 0; });
      var fd = en.map(function () { return 0; }); G.q.forEach(function (f) { if (f.k === 'dmg' && f.w && f.w[0] === 'e' && f.x !== 'poison') fd[+f.w.slice(1)] += f.n; });
      G.q.forEach(function (f) { if (f.w && f.w[0] === 'h') { var k = +f.w.slice(1); if (f.k === 'blk') blk[k] += f.n; else if (f.k === 'heal') heal[k] += f.n; } });
      out = { en: en.map(function (e, i) { var b = b0[i]; var dd = Math.max(0, (b.hp + b.blk) - (Math.max(0, e.hp) + e.blk)), kl = !b.dead && !!e.dead; return { dmg: kl ? Math.max(dd, fd[i]) : dd, hpLoss: Math.max(0, b.hp - Math.max(0, e.hp)), stripped: Math.max(0, b.blk - e.blk), kill: kl, over: kl ? Math.max(0, fd[i] - b.hp - b.blk) : 0 }; }),
        blk: blk, heal: heal, selfHp: G.hs.map(function (x, i) { return hp0[i] - x.hp; }), won: G.scr === 'reward', lost: G.scr === 'over', rnd: JSON.stringify(e0.ops).indexOf('"roll"') >= 0 };
    } catch (x) { out = null; }
    G = keep; ATK = kA; SPK_CARD = kS; return out;
  }
  // end W420 previewPlay
  EC.E = {
    lock: function (a) { LOCK = a || []; },
    newGame: function (o) { var g = newGame(o); g.fights = 0; return g; }, G: function () { return G; }, set: function (g) { G = g; },
    validMoves: validMoves, performMove: performMove, step: step, settle: settle, sideToAct: sideToAct, checkInvariants: checkInvariants,
    eff: eff, lines: lines, previewHit: previewHit, previewPlay: previewPlay, canPlay: canPlay, cost: cost, reachable: reachable, save: save, load: load, clear: clear, has: has,
    debug: {
      boss: function () { enterNode(G.map.length - 1); }, hurt: function (hi, n) { hurtHero(G.hs[hi], n, 1); },
      win: function () { if (G.b) { G.b.en.forEach(function (e) { e.hp = 0; e.dead = 1; }); winBattle(); } },
      shop: function () { G.at = G.map.filter(function (n) { return n.f === 3; })[0].id; G.floor = 3; G.gold = 400; genShop(); },
      rest: function () { G.at = G.map.filter(function (n) { return n.f === 9; })[0].id; G.rest = { todo: G.hs.map(function (h, i) { return i; }) }; G.scr = 'rest'; G.hs.forEach(function (h) { h.hp = Math.floor(h.mhp * 0.5); }); },
      event: function (id) { G.at = G.map.filter(function (n) { return n.f === 4; })[0].id; G.evn = { id: id, res: null }; G.scr = 'event'; },
      over: function (w) { G.scr = 'over'; G.won = w ? 1 : 0; G.b = null; },
      treasure: function () { G.at = G.map.filter(function (n) { return n.f === 5; })[0].id; G.rw = { gold: 30, cards: {}, relics: pickRelics('cu', G.hs.length), took: {}, treasure: 1, nrel: G.hs.length }; G.gold += 30; G.scr = 'reward'; }
    },
    setSeed: function (s) { if (G) G.rs = s | 0; }, mk: mk
  };
  if (typeof module !== 'undefined') module.exports = EC;
})();

// Bot used by tests and the "Auto turn" helper. Enemy AI is the intent patterns in engine.js.
(function () {
  var D = EC.D, E = EC.E;
  function threat(G) { var t = 0; G.b.en.forEach(function (e) { if (!e.dead && e.intent && e.intent.atk) t += (e.intent.atk + (e.st.str || 0)) * (e.intent.hits || 1); }); return t; }
  function score(G, mv) {
    var h = G.hs[G.b.cur], c = h.hand[mv.c], e = E.eff(c), s = 0, ops = e.ops, need = Math.max(0, threat(G) / G.hs.filter(function (x) { return !x.dead; }).length - h.blk), en = mv.e != null ? G.b.en[mv.e] : null;
    ops.forEach(function (o) {
      var k = o[0];
      if (k === 'dmg' || k === 'hit' || k === 'all' || k === 'dmgx' || k === 'bodyslam') { s += 6 + (en && o[1] >= en.hp + en.blk ? 30 : 0) + (k === 'all' ? G.b.en.length * 3 : 0); }
      else if (k === 'blk') s += need > 0 ? 8 : 2;
      else if (k === 'str' || k === 'power' || k === 'dblStr') s += G.b.turn <= 3 ? 9 : 4;
      else if (k === 'draw' || k === 'nrg') s += 5; else if (k === 'vuln' || k === 'weak' || k === 'poison' || k === 'poisonAll' || k === 'weakAll') s += 5;
      else if (k === 'chan' || k === 'shiv' || k === 'stance' || k === 'roll' || k === 'evoke2') s += 5;
      else s += 1;
    });
    if (en && en.hp > 0 && en.hp <= 12) s += 3; if (en) s += 8 / (1 + en.hp / 20) ;
    return s / Math.max(0.5, e.cost === 'X' ? 1.5 : e.cost + 0.3);
  }
  function aiMove(rndf) {
    var G = E.G(), vm = E.validMoves(); if (!vm.length) return null; rndf = rndf || Math.random;
    function pick(a) { return a[Math.floor(rndf() * a.length)]; }
    if (G.scr === 'battle') {
      var pl = vm.filter(function (m) { return m.t === 'play'; }), best = null, bs = -1;
      pl.forEach(function (m) { var sc = score(G, m); if (sc > bs) { bs = sc; best = m; } });
      var h = G.hs[G.b.cur];
      if (G.pots.length && G.hs[G.b.cur].hp < G.hs[G.b.cur].mhp * 0.4) { var hp = G.pots.indexOf('healing-draught'); if (hp >= 0) return { t: 'pot', p: hp }; }
      var pm = vm.filter(function (m) { return m.t === 'pot'; }); if (pm.length && G.b.kind !== 'm' && rndf() < 0.3) return pm[0];
      return best || { t: 'end' };
    }
    if (G.scr === 'map') { var fl = vm.filter(function (m) { var t = G.map[m.n].t; return t === 'r' || t === 'm' || t === 's' || t === 'v' || t === 't'; }); var lowhp = G.hs.some(function (h) { return h.hp < h.mhp * 0.5; }); if (lowhp) { var r = vm.filter(function (m) { return G.map[m.n].t === 'r'; }); if (r.length) return r[0]; } var mm = vm.filter(function (m) { return G.map[m.n].t !== 'e'; }); return pick(rndf() < 0.15 || !mm.length ? vm : mm); }
    if (G.scr === 'reward') {
      var t = vm.filter(function (m) { return m.t === 'takepot' || m.t === 'relic'; }); if (t.length) return t[0];
      var pk = vm.filter(function (m) { return m.t === 'pick'; });
      if (pk.length) { var hh = pk[0].h, ch = G.rw.cards[hh], deckN = G.hs[hh].deck.length; var good = pk.filter(function (m) { var d = D.CARDS[G.rw.cards[m.h][m.i]]; return deckN < 22 && (d.rar !== 'c' || rndf() < 0.7); }); if (good.length) { var g = pick(good); return g; } var sk = vm.filter(function (m) { return m.t === 'skip'; }); if (sk.length) return sk[0]; }
      var sk2 = vm.filter(function (m) { return m.t === 'skip'; }); if (sk2.length) return sk2[0];
      return { t: 'leave' };
    }
    if (G.scr === 'rest') { var low = G.rest.todo.filter(function (hi) { return G.hs[hi].hp < G.hs[hi].mhp * 0.65; }); if (low.length) return { t: 'heal', h: low[0] }; var up = vm.filter(function (m) { return m.t === 'upg'; }); if (up.length) return pick(up); return vm[0]; }
    if (G.scr === 'shop') { var by = vm.filter(function (m) { return m.t === 'buy'; }).sort(function (a, b) { return G.shop.items[b.i].p - G.shop.items[a.i].p; }); if (by.length) return by[0]; var rm = vm.filter(function (m) { return m.t === 'remove'; }); if (rm.length) { var bad = rm.filter(function (m) { var id = G.hs[m.h].deck[m.c].id; return /strike|^.-defend|regret|doubt|injury/.test(id); }); if (bad.length) return bad[0]; } return { t: 'leave' }; }
    if (G.scr === 'event') return pick(vm);
    return vm[0];
  }
  E.aiMove = aiMove;
  // play one whole game with the bot; returns {won, floor, turns}
  E.autoplay = function (opt, maxSteps) {
    E.newGame(opt); var G = E.G(), n = 0, rs = G.rs;
    function r() { var t = rs = (rs + 0x6D2B79F5) | 0; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }
    while (G.scr !== 'over' && n++ < (maxSteps || 4000)) {
      var m = aiMove(r); if (!m || !E.performMove(m)) { m = E.validMoves()[0]; if (!m || !E.performMove(m)) { if (G.b && G.b.ph === 'e') { E.settle(); continue; } return { stuck: 1, scr: G.scr, n: n }; } }
      if (G.b && G.b.ph === 'e') E.settle();
      var er = E.checkInvariants(); if (er.length) return { bad: er, n: n };
    }
    return { won: G.won, floor: G.floor, n: n, stuck: G.scr !== 'over' ? 1 : 0 };
  };
})();

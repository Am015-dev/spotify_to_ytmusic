/* Perch & Plume computer players. Main action: try each candidate on a copy of the game (the copy's deck and dice are re-shuffled,
   so the computer never peeks at hidden cards), finish the turn with the quick sub-choices below, then score the result with value().
   value() = points now + food and cards worth more early + brown engine value over the turns left + the current round goal + bonus cards.
   Levels: easy (noisy, short-sighted), normal, hard (goal and bonus aware, plans payments). */
(function (root) {
  'use strict';
  var PP = root.PP || require('./engine.js');
  var B = PP.B, FOODS = PP.FOODS;
  var PWV = { gainF: .75, gainS: .9, cacheS: 1, cacheF: .8, tuckDraw: .9, tuckEgg: 1.1, tuckFood: 1, flock: 1, laySelf: .9, layNest: 1.4, draw1: .55, hunt: .5, huntDie: .45, allFood: .6, allDraw: .4, trade: .5 };
  var AIW = { eng: .6, row: .25, kk: 2.5 };   // hard's tuned weights (tuned by ai-gate duels)
  function turnsLeft(G, seat) { var t = G.pl[seat].cubes; for (var r = G.round + 1; r < G.rounds; r++) t += G.cubes[r]; return t; }
  function need(G, seat) {   // how much each food is wanted by the birds in hand (missing food weighs more)
    var p = G.pl[seat], w = { grub: .2, seed: .2, fish: .2, berry: .2, rodent: .2 };
    p.hand.forEach(function (id) { var b = B[id]; b.c.forEach(function (s) { var acc = s === '*' ? FOODS : s.split('|'); acc.forEach(function (f) { w[f] += (b.p + 2) / (acc.length * 4) * (p.food[f] > 0 ? .5 : 1); }); }); });
    return w;
  }
  function cardVal(G, seat, id, T) {   // a bird in hand: its points if we can afford it soon, less if not
    var p = G.pl[seat], b = B[id], miss = 0, f = PP.clone(p.food);
    b.c.forEach(function (s) { var acc = s === '*' ? FOODS : s.split('|'), got = acc.find(function (x) { return f[x] > 0; }); if (got) f[got]--; else miss++; });
    var room = [0, 1, 2].some(function (h) { return b.h.indexOf('FGW'[h]) >= 0 && p.board[h].length < 5; });
    if (!room) return 0;
    var pw = PP.power(id), eng = pw.col === 'brown' ? (PWV[pw.k] || .5) * Math.min(6, T / 4) : pw.col === 'pink' ? .4 * Math.min(5, T / 3) : pw.col === 'white' ? 1.2 : 0;
    var v = (b.p + eng) * (miss === 0 ? .55 : miss === 1 ? .35 : .2);
    return Math.min(v, T <= 2 ? .3 : 9);
  }
  function value(G, seat, lvl, known) {
    var p = G.pl[seat], s = PP.scoreOf(G, seat), T = turnsLeft(G, seat), v = s.total, wR = Math.min(1, T / 7);
    if (G.phase === 'over') return v;
    var nd = need(G, seat);
    // food and cards only count as far as the turns left can use them (hoarding scores nothing)
    var fv = []; FOODS.forEach(function (f) { for (var k = 0; k < p.food[f]; k++) fv.push(.4 + Math.min(.6, nd[f] * .25) / (k + 1)); });
    fv.sort(function (a, b) { return b - a; }).forEach(function (x, k) { v += x * wR * (k < 6 ? 1 : .2); });
    var hv = p.hand.map(function (id) { return known && known.indexOf(id) < 0 ? .9 : cardVal(G, seat, id, T) + .2; }).sort(function (a, b) { return b - a; });
    var kk = Math.max(1, Math.floor(T / (lvl === 'hard' ? AIW.kk : 3.5)));
    hv.forEach(function (x, k) { v += x * wR * (k < kk ? 1 : .12); });
    // brown engine: each row is used about a third of the remaining turns
    PP.birds(p).forEach(function (x) { var pw = PP.power(x.s.id); if (pw.col === 'brown') { var pv = PWV[pw.k] || .5; if (pw.k === 'laySelf' && x.s.eggs >= x.b.e) pv = .1; v += pv * T * (lvl === 'hard' ? AIW.eng : .3); } if (pw.col === 'pink') v += .35 * Math.min(T, 8); });
    // row strength: a longer row gives a bigger action
    [0, 1, 2].forEach(function (h) { var y = PP.rowYield(p, h); v += (y.n - (h === 1 ? 2 : 1)) * T * (lvl === 'hard' ? AIW.row : .12); });
    // round goal (current round, weighted by how close the scoring is)
    if (G.goals[G.round] && lvl === 'hard') { var res = PP.placeGoal(G, G.round); v += (res.pts[seat] || 0) * (lvl === 'hard' ? .9 : .6) * (p.cubes <= 2 ? 1 : .7); }
    // egg room matters while there is time to fill it
    v += Math.min(PP.eggSpace(p), 6) * .08 * wR;
    return v;
  }
  // ---------------- quick sub-choices (used for real decisions and inside the look-ahead)
  function sub(G, seat, lvl) {
    var q = G.q, p = G.pl[seat], mv = PP.validMoves(G, seat), T = turnsLeft(G, seat);
    if (!mv.length) return null;
    switch (q.h) {
      case 'setup': return setup(G, seat);
      case 'automa': return { t: 'auto' };
      case 'die': {
        var nd = need(G, seat);
        if (mv.some(function (m) { return m.t === 'reroll'; }) && G.feeder.length <= 2 && nd[G.feeder[0] === 'gs' ? 'grub' : G.feeder[0]] < .5) return { t: 'reroll' };
        return best(mv.filter(function (m) { return m.t === 'die'; }), function (m) { return nd[m.f] + Math.random() * .05; });
      }
      case 'egg': {
        var gid = G.goals[G.round], gt = gid && PP.GOL[gid].test;
        return best(mv, function (m) {
          var s = p.board[m.h][m.c], b = B[s.id], v = (b.e - s.eggs) * .05;
          if (gt && ((gt.t === 'eggsIn' && gt.h === m.h) || (gt.t === 'nestEgg' && PP.nestIs(b, gt.n) && s.eggs === 0) || (gt.t === 'sets'))) v += 1;
          p.bonus.forEach(function (bid) { var t = PP.BON[bid].test; if (t.t === 'nestEgg' && PP.nestIs(b, t.n) && s.eggs === 0) v += 1; if (t.t === 'eggs' && s.eggs + 1 >= t.ge) v += .8; });
          if (PP.power(s.id).k === 'laySelf') v -= .2;
          return v + Math.random() * .05;
        });
      }
      case 'draw': {
        var tv = mv.filter(function (m) { return m.t === 'tray'; }).map(function (m) { return { m: m, v: cardVal(G, seat, G.tray[m.i], T) }; }).sort(function (a, b) { return b.v - a.v; });
        if (tv.length && (tv[0].v > 1.3 || !mv.some(function (m) { return m.t === 'deck'; }))) return tv[0].m;
        return mv.find(function (m) { return m.t === 'deck'; }) || mv[0];
      }
      case 'bonus': {
        var yes = mv.filter(function (m) { return m.yes; });
        if (!yes.length) return { t: 'bonus', yes: false };
        if (q.d.kind === 'card') { if (p.hand.length < 4 && T > 3) return { t: 'bonus', yes: false }; return best(yes, function (m) { return -cardVal(G, seat, p.hand[m.i], T); }); }
        if (q.d.kind === 'food') { if (PP.foodN(p) < 5 && T > 3) return { t: 'bonus', yes: false }; var nd2 = need(G, seat); return best(yes, function (m) { return -nd2[m.f]; }); }
        if (q.d.kind === 'egg') { if (p.hand.length > 2 || T < 4 || PP.eggsOn(p) < 3) return { t: 'bonus', yes: false }; return best(yes, function (m) { return p.board[m.h][m.c].eggs; }); }
        return { t: 'bonus', yes: false };
      }
      case 'pwTuck': {
        if (!p.hand.length) return { t: 'skip' };
        var w = best(mv.filter(function (m) { return m.t === 'tuck'; }), function (m) { return -cardVal(G, seat, p.hand[m.i], T); });
        return cardVal(G, seat, p.hand[w.i], T) < 1.6 || p.hand.length > 5 ? w : { t: 'skip' };
      }
      case 'pwTrade': {
        if (T < 5 || p.hand.length > 4) return { t: 'skip' };
        return best(mv.filter(function (m) { return m.t === 'trade'; }), function (m) { return p.board[m.h][m.c].eggs; }) || { t: 'skip' };
      }
      case 'play2': {
        var pl = mv.filter(function (m) { return m.t === 'play'; });
        return pl.length ? best(pl, function (m) { return B[m.id].p + cardVal(G, seat, m.id, T); }) : { t: 'skip' };
      }
      case 'bonusPick': return best(mv, function (m) { return PP.bonusScore(p, q.d.opts[m.i]).pts + Math.random() * .1; });
    }
    return mv[0];
  }
  function best(list, f) { var b = null, bv = -1e9; list.forEach(function (m) { var v = f(m); if (v > bv) { bv = v; b = m; } }); return b; }
  function setup(G, seat) {
    var p = G.pl[seat], off = p.offer, food = { grub: 1, seed: 1, fish: 1, berry: 1, rodent: 1 };
    var sc = off.birds.map(function (id, i) { var b = B[id], c = 0, f = PP.clone(food); b.c.forEach(function (s) { var acc = s === '*' ? FOODS : s.split('|'), got = acc.find(function (x) { return f[x] > 0; }); if (got) f[got]--; else c += 2; }); var pw = PP.power(id); return { i: i, v: b.p * .4 + (pw.col === 'brown' ? 2.2 : pw.col === 'pink' ? 1.2 : pw.col === 'white' ? 1 : 0) - b.c.length * .6 - c + (b.h.length - 1) * .4 }; }).sort(function (a, b) { return b.v - a.v; });
    var keep = sc.filter(function (x, k) { return k < 3 && (x.v > -1 || k < 1); }).map(function (x) { return x.i; });
    if (keep.length > 3) keep.length = 3;
    var want = { grub: 0, seed: 0, fish: 0, berry: 0, rodent: 0 };
    keep.forEach(function (i) { B[off.birds[i]].c.forEach(function (s) { (s === '*' ? FOODS : s.split('|')).forEach(function (f) { want[f] += 1 / (s === '*' ? 5 : s.split('|').length); }); }); });
    var fk = FOODS.slice().sort(function (a, b) { return want[b] - want[a]; }).slice(0, 5 - keep.length);
    var kb = keep.map(function (i) { return off.birds[i]; }), fake = { board: [[], [], []] };
    kb.forEach(function (id) { var h = 'FGW'.indexOf(B[id].h[0]); fake.board[h].push({ id: id, eggs: 1, cache: 0, tuck: 0 }); });
    var bv = off.bonus.map(function (id) { return PP.bonusScore(fake, id).n; });
    return { t: 'keep', birds: keep, food: fk, bonus: bv[1] > bv[0] ? 1 : 0 };
  }
  // ---------------- main action by look-ahead
  function finishTurn(G, seat, lvl) {
    var turn = G.turn, guard = 0;
    while (G.phase !== 'over' && G.turn === turn && PP.sideToAct(G) === seat && G.q && guard++ < 60) {
      var m = sub(G, seat, lvl); if (!m) break;
      var r = PP.performMove(G, m, seat); if (!r.ok) break;
    }
  }
  function scramble(G) {   // hide what the computer cannot know: new dice luck, the deck re-shuffled
    G.rng = (Math.random() * 4294967296) >>> 0;
    PP.shuffle(G, G.deck);
  }
  function choose(G, seat, lvl) {
    lvl = lvl || G.pl[seat].lvl || 'normal';
    if (G.q) return sub(G, seat, lvl);
    var mv = PP.validMoves(G, seat), seen = {}, cands = [];
    mv.forEach(function (m) {
      if (m.t === 'play') { var k = m.id + ':' + m.h; if (seen[k] && lvl !== 'hard') return; if (seen[k] >= 2) return; seen[k] = (seen[k] || 0) + 1; }
      cands.push(m);
    });
    var known = G.pl[seat].hand.concat(G.tray.filter(Boolean));
    var scored = cands.map(function (m) {
      var sims = lvl === 'hard' ? (m.t === 'act' ? 4 : 3) : 1, tot = 0;
      for (var k = 0; k < sims; k++) {
        var G2 = PP.clone(G); scramble(G2);
        var r = PP.performMove(G2, m, seat); if (!r.ok) return { m: m, v: -1e9 };
        finishTurn(G2, seat, lvl);
        tot += value(G2, seat, lvl, known);
      }
      var v = tot / sims;
      if (lvl === 'easy') v += (Math.random() - .5) * 12;
      else if (lvl === 'normal') v += (Math.random() - .5) * 3;
      return { m: m, v: v };
    }).sort(function (a, b) { return b.v - a.v; });
    if (lvl === 'normal' && scored.length > 1 && Math.random() < .3) return scored[1].m;   // normal: a fair player who sometimes takes the second-best move
    if (lvl === 'easy' && scored.length > 2 && Math.random() < .5) return scored[1 + Math.floor(Math.random() * Math.min(4, scored.length - 1))].m;
    return scored[0].m;
  }
  // why (<= 15 words) for the hint bulb
  function why(G, seat, m) {
    if (!m) return '';
    if (m.t === 'play') return 'Play ' + B[m.id].n + ': ' + B[m.id].p + (B[m.id].p === 1 ? ' point' : ' points') + (PP.power(m.id).col === 'brown' ? ' and a power that repeats.' : '.');
    if (m.t === 'act') return m.a === 'food' ? 'Gather food: your birds in hand need it.' : m.a === 'eggs' ? 'Lay eggs: each egg is a point.' : 'Draw cards: you need more birds to play.';
    if (m.t === 'die') return 'Take ' + m.f + ': a bird in your hand eats it.';
    if (m.t === 'egg') return 'This nest has room and helps your goals.';
    if (m.t === 'tray') return 'This bird fits your food and board.';
    if (m.t === 'deck') return 'Nothing in the tray fits; try the deck.';
    return 'A sensible choice right now.';
  }
  var AI = { W: AIW, choose: choose, sub: sub, value: value, setup: setup, why: why, turnsLeft: turnsLeft };
  root.PPAI = AI;
  if (typeof module !== 'undefined') module.exports = AI;
})(typeof window !== 'undefined' ? window : globalThis);

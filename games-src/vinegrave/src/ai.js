/* Vinegrave computer explorers: one-step simulation of every legal move scored by a value function (points now + resources + deck + position).
   easy = steady and cautious (2nd/3rd best moves, ends its round early; a newcomer who follows the prompt wins ~half) · normal = greedy · hard = greedy with better weights and planning for guardians / the temple. VAI.choose(G, level) -> move */
(function (root) {
  var VG = (typeof module !== 'undefined' && module.exports) ? require('./engine.js') : root.VG, V = VG.V;
  var EASY = { p0: 0.4, p1: 0.3, cap: 7, noise: 0 };   /* easy: P(best main move), P(2nd best), log steps per round before it passes */
  if (typeof process !== 'undefined' && process.env && process.env.VG_EASY) { var ev0 = process.env.VG_EASY.split(',').map(Number); EASY.p0 = ev0[0]; EASY.p1 = ev0[1]; EASY.cap = ev0[2]; }
  var W = { coin: 0.45, compass: 0.4, tablet: 0.75, arrow: 0.6, jewel: 1.3 };
  function opVal(ops) {
    var v = 0; (ops || []).forEach(function (o) {
      if (o.g) for (var k in o.g) v += W[k] * o.g[k];
      if (o.p) for (var k2 in o.p) v -= W[k2] * o.p[k2];
      if (o.d) v += 0.7 * o.d; if (o.x) v += 0.6; if (o.tv) v += 0.8; if (o.tp) v -= 0.5; if (o.r) v += 1.6; if (o.b) v += 0.5 + 0.3 * o.o; if (o.fd) v += 1.6;
      if (o.or) v += Math.max.apply(null, o.or.map(opVal));
    }); return v;
  }
  var CV = {}; Object.keys(V.CARDS).forEach(function (id) { var c = V.CARDS[id]; CV[id] = opVal(c.ops) - (c.t === 'art' ? 0.6 : 0); });
  function value(G, s, lvl) {
    var p = G.p[s], sc = VG.score(G, s), left = G.rounds - G.round + (p.passed ? 0 : 1), over = G.phase === 'over';
    var f = over ? 0 : left >= 3 ? 1 : left === 2 ? 0.8 : 0.25, v = sc.total;
    if (over) return v;
    for (var k in p.res) v += W[k] * p.res[k] * f;
    var cards = p.deck.concat(p.disc, p.play), plays = Math.max(0, left - 1) * 0.3;
    cards.forEach(function (id) { v += CV[id] * plays; });
    p.hand.forEach(function (id) { v += CV[id] * (p.passed ? plays : 0.3 + plays); });
    
    p.guards.forEach(function (g) { if (!g.used) v += opVal(V.GUARD[g.id].boon) * 0.8; });
    (p.asst || []).forEach(function (a) { var d = V.ASSTBY[a.id], uses = Math.max(0, left - (a.ex ? 1 : 0)); v += opVal(a.gold ? d.gd : d.s) * uses * 0.6; });   /* assistants: what their remaining uses are worth */
    p.idols.forEach(function (d) { if (!d.used && f > 0.5) v += 0.6; });
    G.sites.forEach(function (x) { if (x.occ === s && x.guard) v -= VG.has(p, V.GUARD[x.guard].cost) ? 0.3 : 1.6; });
    if (lvl === 'hard') { v += p.glass * 0.35 * f + (p.glass >= V.TOP ? 1 : 0); v += Math.min(p.res.jewel, 3) * 0.2 * f; }
    if (G.q && G.q.seat === s) v -= 0.01;
    return v;
  }
  // resolve the seat's pending questions greedily (used inside the simulation)
  function settle(G, s, lvl, depth) {
    var n = 0; while (G.q && G.q.seat === s && n++ < 8) { var m = best(G, s, lvl, depth + 1, true); if (!m) break; VG.apply(G, m); }
  }
  function best(G, s, lvl, depth, inner) {
    var ms = VG.moves(G); if (!ms.length) return null;
    if (ms.length === 1) return ms[0];
    var base = value(G, s, lvl), out = [];
    ms.forEach(function (m) {
      var H = VG.clone(G); var r = VG.apply(H, m); if (!r.ok) return;
      if (depth < 3) settle(H, s, lvl, depth);
      var d = value(H, s, lvl) - base;
      if (m.t === 'pass') d = H.phase === 'over' ? d : -0.4;
      if (m.free) d -= 0.05;
      out.push({ m: m, d: d });
    });
    if (!out.length) return ms[ms.length - 1];
    // hard: look one of my own turns further for the 6 best candidates (gather now, spend next turn)
    if (lvl === 'hard' && !inner && depth === 0) {
      out.sort(function (a, b) { return b.d - a.d; });
      out.slice(0, 6).forEach(function (o) {
        if (o.m.t === 'pass') return;
        var H = VG.clone(G); VG.apply(H, o.m); settle(H, s, lvl, 1);
        if (H.phase !== 'play' || H.p[s].passed) return;
        H.q = null; H.turn = s; var v1 = value(H, s, lvl), m2 = best(H, s, lvl, 1, true); if (!m2 || m2.t === 'pass') return;
        var H2 = VG.clone(H); if (!VG.apply(H2, m2).ok) return; settle(H2, s, lvl, 2);
        o.d += 0.5 * Math.max(0, value(H2, s, lvl) - v1);
      });
    }
    var noise = lvl === 'novice' ? 4.5 : lvl === 'easy' ? EASY.noise : lvl === 'normal' ? 0.25 : 0;
    if (!inner && noise) { var rr = function () { return VG.rng(G) - 0.5; }; out.forEach(function (o) { o.d += rr() * noise * 2; }); }
    out.sort(function (a, b) { return b.d - a.d; });
    var top = out[0];
    // easy: steady but beatable (R25: wild noise made it pass whole rounds and score 6-8). It often takes its 2nd or 3rd best main move
    // and, like a cautious explorer, ends its round after about EASY.cap logged steps
    if (lvl === 'easy' && !inner) {
      var mains = out.filter(function (o) { return !o.m.free && o.m.t !== 'pass'; }), r = VG.rng(G), k = r < EASY.p0 ? 0 : r < EASY.p0 + EASY.p1 ? 1 : 2;
      if (mains.length && !(top.m.free && top.d > 0.2)) top = mains[Math.min(k, mains.length - 1)];
      var acts = G.log.filter(function (e) { return e.r === G.round && e.s === s; }).length;
      if (top.d < -1.5 || (acts >= EASY.cap && !top.m.free)) { var pz = out.filter(function (o) { return o.m.t === 'pass'; })[0]; if (pz) top = pz; }
      return top.m;
    }
    // free actions only when they help; otherwise prefer the best non-free main action
    if (top.m.free && top.d <= 0.2) { var main = out.filter(function (o) { return !o.m.free; })[0]; if (main) top = main; }
    if (!inner && top.m.t !== 'pass' && !top.m.free && top.d < -1.5) { var ps = out.filter(function (o) { return o.m.t === 'pass'; })[0]; if (ps) top = ps; }
    return top.m;
  }
  function choose(G, lvl) { var s = VG.actor(G); if (s < 0) return null; var H = VG.clone(G); var m = best(H, s, lvl || 'normal', 0, !!G.q); return m; }
  // a short reason for the hint bulb
  function why(G, m) {
    var p = G.p[VG.actor(G)];
    switch (m.t) {
      case 'play': return 'Play ' + V.CARDS[p.hand[m.i]].name + ': ' + V.CARDS[p.hand[m.i]].text;
      case 'dig': return 'Dig at ' + V.SITE[G.sites[m.s].tile].name + ' for ' + V.resText(V.SITE[G.sites[m.s].tile].rew) + '.';
      case 'disc': return 'Discover a new site: an idol and its loot.';
      case 'beat': return 'Overcome the guardian: 5 points and a boon.';
      case 'buy': return 'Buy ' + V.CARDS[G.row[m.r]].name + ' to grow your deck.';
      case 'res': return 'Climb the research track for points.';
      case 'temple': return 'Claim a temple tile for points.';
      case 'boon': return 'Use your guardian\'s boon now.';
      case 'asst': return 'Your assistant works once a round, for free.';
      case 'idol': return 'Set an idol in a shrine for its boon.';
      case 'pass': return 'Nothing useful left: pass.';
      default: return 'This is the best choice now.';
    }
  }
  var VAI = { EASY: EASY, choose: choose, value: value, why: why, opVal: opVal };
  if (typeof module !== 'undefined' && module.exports) module.exports = VAI; else root.VAI = VAI;
})(typeof window !== 'undefined' ? window : this);

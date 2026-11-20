/* Gloamwar computer players. aiMove(G, level) returns one legal move for sideToAct(G).
   Top level: each die action gets a heuristic score (company risk, battle odds, politics, cards). Sub-choices (army moves, recruits, targets)
   are scored by cloning G, applying the move and evaluating the position (posVal). level: 'easy' | 'normal' | 'hard'. */
var AI = {};
var DIST = (function () { var D = {}; REGIONS.forEach(function (r) { D[r.id] = dist(r.id, 99); }); return D; })();
var GATES = ['blackgate', 'wraithpass'];
function gateDist(rid) { return Math.min(DIST[rid].blackgate, DIST[rid].wraithpass); }
function aiClone(G) { var l = G.log, e = G.ev; G.log = []; G.ev = []; var c = JSON.parse(JSON.stringify(G)); G.log = l; G.ev = e; return c; }
function aiRand(G) { AI.s = ((AI.s || 12345) * 1103515245 + 12345) & 0x7fffffff; return AI.s / 0x7fffffff; }
function strengthOf(a) { if (!a) return 0; var s = 0; for (var n in a) s += a[n][0] + a[n][1] * 1.6 + a[n][2] * 0.5; return s; }
function settleVal(rid) { var s = REG[rid].set; return s === 'strong' ? 2 : s === 'city' ? 1 : s === 'town' ? 0.35 : s === 'fort' ? 0.3 : 0; }
function posVal(G, s) {   // position value for side s (higher = better for s)
  if (G.win) return G.win.side === s ? 1e5 : -1e5;
  var o = other(s), v = 0;
  v += (vpOf(G, s) - vpOf(G, o)) * 14;
  var mil = 0, threat = 0;
  REGIONS.forEach(function (r) {
    var a = armyAt(G, r.id, s) ? G.A[r.id] : null, b = armyAt(G, r.id, o) ? G.A[r.id] : null, ia = inAt(G, r.id);
    if (a) mil += strengthOf(a); if (b) mil -= strengthOf(b);
    if (ia) { if (armySide(G.IN[r.id]) === s) mil += strengthOf(G.IN[r.id]); else mil -= strengthOf(G.IN[r.id]); }
    var sv = settleVal(r.id); if (!sv || !r.nat) return;
    var mine = natSide(r.nat) === s ? controller(G, r.id) === s : false, theirs = natSide(r.nat) === o && controller(G, r.id) === o;
    if (!mine && !theirs) return;
    var def = strengthOf(armyAt(G, r.id, mine ? s : o) ? G.A[r.id] : null) + strengthOf(ia && armySide(G.IN[r.id]) === (mine ? s : o) ? G.IN[r.id] : null) * 1.5 + (r.set === 'strong' ? 2 : r.set === 'city' ? 0.8 : 0);
    var near = 0; r.adj.concat([r.id]).forEach(function (x) { var e = G.A[x]; if (e && armySide(e) === (mine ? o : s) && units(e)) near += strengthOf(e); });
    var nearAll = near; r.adj.forEach(function (x) { adj(x).forEach(function (y) { var e = G.A[y]; if (y !== r.id && r.adj.indexOf(y) < 0 && e && armySide(e) === (mine ? o : s) && units(e)) nearAll += strengthOf(e) * 0.35; }); });
    var press = Math.max(0, nearAll - def);
    if (mine) { threat -= press * (sv + 0.2) * (s === 'G' ? 3 : 2.2); var gu = units(armyAt(G, r.id, s) ? G.A[r.id] : null) + units(ia && armySide(G.IN[r.id]) === s ? G.IN[r.id] : null); threat += Math.min(gu, 4) * sv * 0.7 + (gu > 0 ? sv * 1.2 : 0); }
    else threat += press * (sv + 0.2) * 1.6;
  });
  v += mil * 1.0 + threat;
  // armies drift toward enemy settlements they can beat
  Object.keys(G.A).forEach(function (rid) {
    var a = G.A[rid]; if (!units(a)) return; var as = armySide(a), sign = as === s ? 1 : -1, st = strengthOf(a), best = 0;
    if (!natsIn(a).some(function (n) { return atWar(G, n); })) return;
    REGIONS.forEach(function (r) { var sv = settleVal(r.id); if (!sv || !r.nat || natSide(r.nat) === as || controller(G, r.id) === as) return; var d = DIST[rid][r.id]; if (d > 6) return; var def = strengthOf(G.A[r.id]) + strengthOf(G.IN[r.id]) + (r.set === 'strong' ? 3 : 1); var k = (sv + 0.3) * Math.min(2, st / Math.max(1, def)) * (7 - d) * 0.22; if (k > best) best = k; });
    v += sign * best * (as === 'G' ? 1 : 0.7);
  });
  // politics
  NAT_ORDER.forEach(function (n) { var p = G.pol[n], w = (3 - p.s) * 1.2 + (p.a ? 0.6 : 0); v += natSide(n) === s ? w : -w; });
  // the Company
  var F = G.F, ring = 0;
  var road = F.road >= 0 ? (ROAD_STEPS - F.road) : ROAD_STEPS + Math.max(0, gateDist(F.loc) - F.prog * 0.7);
  ring -= road * 3.2; ring -= F.taint * 2.3 + (F.taint >= 9 ? (F.taint - 8) * 4 : 0);
  ring += companions(G).length * 0.5 + (F.hid ? 1.5 : -2);
  v += s === 'D' ? ring : -ring;
  v += (G.hand[s].length - G.hand[o].length) * 0.4;
  ['queen', 'kindled', 'vael', 'marshal', 'voice'].forEach(function (c) { if (isOnMap(G, c)) v += (CHARS[c].side || 'D') === s ? 3 : -3; });
  return v;
}
function riskOfMove(G) {
  if (G.F.road >= 0) return 1;
  var n = Math.min(5, G.hb.g); if (!n) return 0; var need = Math.max(2, 6 - G.hb.d), p = (7 - need) / 6, rr = rerollReasons(G).length;
  var miss = Math.pow(1 - p, n), pr = Math.pow(1 - p, Math.min(rr, n)); return 1 - miss * pr;
}
function battleOdds(G, s, from, to) {   // rough strength ratio of an attack
  var a = from === to ? (inAt(G, to) && armySide(G.IN[to]) === s ? G.IN[to] : G.A[to]) : G.A[from], d = from === to ? (inAt(G, to) && armySide(G.IN[to]) !== s ? G.IN[to] : G.A[to]) : G.A[to];
  var siege = from === to && inAt(G, to) && armySide(G.IN[to]) !== s, fort = !siege && (REG[to].set === 'city' || REG[to].set === 'fort') && controller(G, to) !== s;
  var sa = Math.min(5, units(atWarPart(G, a))) * (1 + Math.min(leaders(a), 3) * 0.12) * (siege ? 0.55 : fort ? 0.85 : 1);
  var sd = Math.min(5, units(d)) * (1 + Math.min(leaders(d), 3) * 0.12) + (REG[to].set === 'strong' && controller(G, to) !== s && !siege ? 1.5 : 0);
  return { r: sa / Math.max(0.5, sd), ua: units(a), ud: units(d), stA: strengthOf(a), stD: strengthOf(d) };
}
function cardVal(G, s, cid) {
  var c = CARD[cid], v = 2.5;
  c.eff.forEach(function (o) {
    switch (o.o) {
      case 'cmove': v += G.F.road >= 0 ? 6 : 4 - riskOfMove(G) * 3; break; case 'hide': v += G.F.hid ? 0 : 4; break; case 'heal': v += Math.min(o.n, G.F.taint) * 2; break;
      case 'taint': v += 4; break; case 'tile': v += 2; break; case 'draw': v += 1.2; break; case 'pol': v += (o.n ? 2.5 : 0) + (o.wake && !G.pol[o.nat].a ? 1.5 : 0); break;
      case 'discardOpp': v += o.n * 1.2; break; case 'hunttile': v += 4; break; case 'reveal': v += 3; break; case 'kill': v += 6; break;
      case 'charmove': case 'nzmove': v += 1; break; case 'move': v += 1.5 * o.n; break; case 'attack': v += 3; break; case 'sortie': v += 2; break;
      case 'rec': v += o.u.length * 1.7; break; case 'recHere': case 'recComp': v += 2; break; case 'recWar': case 'recRiders': v += 2.5; break;
      case 'hitsNear': case 'hitsNearG': case 'hitsIn': case 'hitsRider': case 'hitsDawnNear': v += 2.5; break; case 'wakeAny': v += 2; break; case 'polAny': v += 4; break; case 'killLone': v += 5; break;
    }
  });
  if (c.tab) v += 2;
  return v;
}
function scoreTop(G, s, m, L) {
  var F = G.F, cs = companions(G);
  switch (m.t) {
    case 'pass': return 1.5;
    case 'lamp': if (s === 'D' && m.f === 'C' && (F.road >= 0 || F.hid && riskOfMove(G) < 0.35) && !G.dice.D.some(function (f, i) { return !G.used.D[i] && (f === 'C' || f === 'W'); })) return 7; if (s === 'G' && m.f === 'Y' && F.road >= 0 && G.dice.G[m.i] === 'E') return 5; return -9;
  }
  if (m.t !== 'die') return 0;
  var f = m.as || G.dice[s][m.i], waste = m.as ? -0.6 : 0;   // Will of the Dawn is precious
  switch (m.a) {
    case 'skip': return -1;
    case 'cmove': if (F.road >= 0) return 11 + waste; var risk = riskOfMove(G), gd = gateDist(F.loc) - F.prog; if (gd <= 0) return -2; return 8.6 - risk * (F.taint >= 7 ? 11 : 6) - F.moved * 1.6 + waste;
    case 'chide': return (F.road >= 0 ? 11 : 6.5) + waste;
    case 'csep': if (cs.length < 3 || G.turn < 2) return 0; return 2.8 + (cs.length - 3) * 0.6 + waste;
    case 'charmove': return 2 + waste;
    case 'nzmove': var rr = riderRegions(G).indexOf(F.loc) >= 0; return (F.road < 0 && !rr && F.hid ? 7.4 : 1.2);
    case 'dip': var p = G.pol[m.n]; return (s === 'G' ? 6 : 5) + (p.s === 1 ? 2.5 : 0) - (natSide(m.n) === 'D' && !p.a ? 1 : 0) + (m.n === 'sh' || m.n === 'au' ? 0.7 : 0) + waste;
    case 'recruit': var res = 0; NAT_ORDER.forEach(function (n) { if (natSide(n) === s && atWar(G, n)) res += G.R[n][0] + G.R[n][1]; }); return 4.2 + (s === 'G' ? 1.2 + Math.min(2.5, res / 10) : Math.min(1.5, res / 12)) + waste;
    case 'minion': return 10;
    case 'hero': return 10.5;
    case 'draw': return G.hand[s].length >= 6 ? 0.5 : 3.2 - G.hand[s].length * 0.2 + waste;
    case 'card': return cardVal(G, s, m.c) + waste;
    case 'amove': case 'lmove': return amoveGain(G, s, m) + waste;
    case 'attack': case 'lattack': case 'sortie':
      var best = -9, ts = m.a === 'sortie' ? [m.from] : attackTargets(G, s, m.from, m.a === 'lattack');
      ts.forEach(function (to) { if (to === m.from && inAt(G, to) && armySide(G.IN[to]) !== s) { var ua = units(atWarPart(G, G.A[to])), ud = units(G.IN[to]); var ss = 2.5 + settleVal(to) * 2.5 + (ua - ud) * 0.6 - (ua < ud + 1 ? 4 : 0); if (ss > best) best = ss; return; }
        var o = battleOdds(G, s, m.from, to); var sc = (o.r - 1.35) * 6 + (o.r >= 1.2 ? settleVal(to) * 3 : 0) + (o.ud <= 1 ? 1 : 0) - (settleVal(to) === 0 ? 1 : 0); if (sc > best) best = sc; });
      return best + 2.5 + waste;
  }
  return 0;
}
function amoveGain(G, s, m) {   // greedy: best single move gain
  var base = posVal(G, s), best = -9, armies = m.a === 'lmove' ? [m.from] : armiesOf(G, s);
  armies.forEach(function (r) { moveArmyTargets(G, s, r, m.a === 'lmove').forEach(function (to) { splits(G.A[r]).forEach(function (u) { var c = aiClone(G); moveArmy(c, s, r, to, u); var g = posVal(c, s) - base; if (g > best) best = g; }); }); });
  return Math.min(7.5, 1.5 + best * 0.8);
}
function pickBest(list, L, G) {
  if (!list.length) return null;
  var noise = L === 'easy' ? 3.2 : L === 'normal' ? 0.7 : 0.15;
  list.forEach(function (x) { x.v += (aiRand(G) - 0.5) * noise; });
  list.sort(function (a, b) { return b.v - a.v; });
  return list[0].m;
}
function evalMoves(G, s, ms, L) {   // exact one-step lookahead on a clone
  return pickBest(ms.map(function (m) { var c = aiClone(G); try { performMove(c, m); } catch (e) { return { m: m, v: -1e6 }; } return { m: m, v: posVal(c, s) }; }), L, G);
}
AI.move = function (G, L) { var m = aiPick(G, L); if (m) { var c = {}; for (var k in m) if (k[0] !== '_') c[k] = m[k]; return c; } return m; };
function aiPick(G, L) {
  L = L || 'normal'; var s = sideToAct(G), ms = validMoves(G); if (!ms.length) return null; if (ms.length === 1) return ms[0];
  var F = G.F;
  if (G.pend) return pendChoice(G, s, ms, L);
  if (G.phase === 'company') {
    var road = ms.filter(function (m) { return m.t === 'road'; })[0]; if (road && F.taint < 11) return road;
    var decl = ms.filter(function (m) { return m.t === 'declare'; });
    if (decl.length) { decl.forEach(function (m) { m._v = -gateDist(m.to) * 2 + (dawnHold(G, m.to) && F.taint > 0 ? 2.5 : 0) - (REG[m.to].set === 'strong' && controller(G, m.to) === 'G' ? 1 : 0); }); decl.sort(function (a, b) { return b._v - a._v; }); if (decl[0]._v > -gateDist(F.loc) * 2 + 0.1) return decl[0]; }
    return { t: 'cdone' };
  }
  if (G.phase === 'hunt') {
    var hr = huntRange(G), want = F.road >= 0 ? 9 : gateDist(F.loc) - F.prog <= 4 ? Math.max(3, companions(G).length - 1) : 2; if (companions(G).length >= 5 && G.turn >= 3) want++; if (L === 'easy') want = Math.max(1, want - 1); if (G.turn === 1) want = Math.max(hr[0], 1);
    return { t: 'hunt', n: Math.max(hr[0], Math.min(hr[1], want)) };
  }
  // action phase
  var sc = ms.map(function (m) { return { m: m, v: scoreTop(G, s, m, L) }; });
  return pickBest(sc, L, G);
};
function pendChoice(G, s, ms, L) {
  var p = G.pend, F = G.F, d = p.d;
  switch (p.h) {
    case 'discard': var worst = null, wv = 1e9; ms.forEach(function (m) { var v = cardVal(G, s, m.c) + (cardPre(G, s, CARD[m.c]) ? 1 : 0); if (v < wv) { wv = v; worst = m; } }); return worst;
    case 'damage':
      var ab = ms.filter(function (m) { return m.t === 'absorb'; });
      if (ab.length && (F.taint + d.dmg >= 11 || d.dmg >= 3 && F.taint + d.dmg >= 9 || F.road >= 0 && d.dmg >= 3 && F.taint + d.dmg >= 8)) { var g = ab.filter(function (m) { return m.c !== 'random' && CHARS[m.c].lv <= d.dmg; })[0]; return g || ab[ab.length - 1]; }
      return { t: 'taint' };
    case 'reveal': var bestR = null, bv = 1e9; ms.forEach(function (m) { var v = gateDist(m.to) + (armyAt(G, m.to, 'G') ? 1.5 : 0) + (REG[m.to].set === 'strong' && controller(G, m.to) === 'G' ? 3 : 0); if (v < bv) { bv = v; bestR = m; } }); return bestR;
    case 'sep':
      var sc = ms.map(function (m) { var c = m.cs[0], v = m.cs.length > 1 ? -5 : 0, home = { darian: 'citadel', sylwen: 'silverbough', brokk: 'hammerdeep', kestrel: 'citadel', pell: 'hallowmead', hobb: 'hallowmead', orrin: 'hallowmead' }[c];
        if (c === guideOf(G) && companions(G).length > 1) v -= 3; if (home) v -= DIST[m.to][home] * 1.2; if (dawnHold(G, m.to) && !G.pol[REG[m.to].nat].a) v += 4; v -= CHARS[c].lv * 0.5; return { m: m, v: v }; });
      return pickBest(sc, L, G);
    case 'charmove':
      var cm = ms.filter(function (m) { return m.t === 'cm'; }).map(function (m) { var to = m.to, v = 0; if (dawnHold(G, to) && !G.pol[REG[to].nat].a && (!CHARS[m.c].nat || CHARS[m.c].nat === REG[to].nat)) v += 5; var a = armyAt(G, to, 'D'); if (a) v += strengthOf(a) * 0.4; if (m.c === 'kestrel' && ['citadel', 'seawatch', 'brinemouth'].indexOf(to) >= 0) v += 6; v -= DIST[to].citadel * 0.15; return { m: m, v: v }; });
      if (!cm.length) return ms[0]; var bc = pickBest(cm, L, G); var cur = 0; return bc;
    case 'nzmove':
      var nz = ms.filter(function (m) { return m.t === 'nz' || m.t === 'cm'; });
      var done = ms.filter(function (m) { return m.t === 'nzdone'; })[0];
      var rid = F.loc, inLoc = riderRegions(G).indexOf(rid) >= 0;
      if (!inLoc && F.road < 0) { var to = nz.filter(function (m) { return m.to === rid && m.t === 'nz'; }); if (to.length) return to[0]; }
      var tgt = nz.filter(function (m) { return m.t === 'nz' && armyAt(G, m.to, 'G') && !armyAt(G, m.from, 'G') && (G.A[m.to].pt || {})[2] === undefined; });
      return tgt[0] || done;
    case 'amove': case 'recruit': return evalMoves(G, s, ms, L);
    case 'attack': var at = ms.filter(function (m) { return m.t === 'atk'; }).map(function (m) { var o = battleOdds(G, s, d.from, m.to); return { m: m, v: o.r * 3 + settleVal(m.to) }; }); return pickBest(at, L, G) || ms[0];
    case 'battle': return battleChoice(G, s, ms, L);
    case 'effect': return effectChoice(G, s, ms, L);
  }
  return ms[0];
}
function battleChoice(G, s, ms, L) {
  var B = G.pend.d, ar = bArmies(G, B), me = s === B.as ? ar.att : ar.def, foe = s === B.as ? ar.def : ar.att, r = units(me) / Math.max(1, units(foe));
  switch (B.stage) {
    case 'choose': return { t: units(foe) >= units(me) * 1.3 || units(me) <= 3 ? 'walls' : 'field' };
    case 'acard': case 'dcard':
      var cards = ms.filter(function (m) { return m.c; }); if (!cards.length || L === 'easy' && aiRand(G) < 0.5) return { t: 'bcard', c: null };
      cards.forEach(function (m) { m._v = 3 - cardVal(G, s, m.c) + ({ hit: 2, cancel: 1.5, shield: 1.4, plus: 1.6, dice: 1.2, reroll: 1.3, lead: 0.8, minus: 1.4, nolead: 1, charge: 1.2, stop: s === B.ds && r < 0.8 ? 2.5 : -2, siege: 2 }[CARD[m.c].cb.op] || 0); });
      cards.sort(function (a, b) { return b._v - a._v; }); return cards[0]._v > 0.5 || units(foe) >= 4 ? cards[0] : { t: 'bcard', c: null };
    case 'cont': return { t: r >= 0.9 || units(foe) <= 1 ? 'cont' : 'cease' };
    case 'retreat': var rt = ms.filter(function (m) { return m.t === 'retreat'; }); var w = ms.filter(function (m) { return m.t === 'walls'; })[0]; if (r < 0.6 && w) return w; if (r < 0.5 && rt.length && settleVal(B.to) < 1) return rt[0]; return { t: 'stand' };
    case 'extend': return { t: units(me) >= units(foe) + 2 && bElites(me) > 0 ? 'extend' : 'stop' };
    case 'advance': if (inAt(G, B.to) && armySide(G.IN[B.to]) !== s && units(me) >= units(G.IN[B.to]) + 1) return { t: 'adv' }; return evalMoves(G, s, ms, 'hard');
  }
  return ms[0];
}
function effectChoice(G, s, ms, L) {
  var real = ms.filter(function (m) { return m.t !== 'eskip'; }); if (!real.length) return ms[0];
  if (real[0].t === 'eatk') { var at = real.map(function (m) { var o = battleOdds(G, s, m.from, m.to); return { m: m, v: (o.r - 1.1) * 4 + settleVal(m.to) }; }); var b = pickBest(at, L, G); return b; }
  return evalMoves(G, s, real, L);
}
function aiMove(G, L) { return AI.move(G, L); }

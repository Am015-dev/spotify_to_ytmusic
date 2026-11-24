/* Gloamwar card effects: preconditions, the event half of each card, table cards ("stays in play"). Combat halves are in combat.js.
   A played card queues its ops in G.pend = {h:'effect', side, d:{cid, q, i, cur, back}}; ops that need a choice wait for a move. */
function tableHas(G, key) { return ['D', 'G'].some(function (s) { return G.table[s].some(function (c) { return CARD[c].tab === key; }); }); }
function tableDrop(G, key) { ['D', 'G'].forEach(function (s) { G.table[s] = G.table[s].filter(function (c) { if (CARD[c].tab === key) { G.disc.push(c); log(G, s, CARD[c].n + ' leaves play', 'table'); return false; } return true; }); }); }
function tableCard(G, key) { return CARDS.filter(function (c) { return c.tab === key; })[0].id; }
function tableEndOfTurn(G) {
  if (tableHas(G, 'vigil') && guideOf(G) !== 'orrin') tableDrop(G, 'vigil');
  if (tableHas(G, 'sermon') && !isOnMap(G, 'vael')) tableDrop(G, 'sermon');
  if (tableHas(G, 'bribes') && ['gr', 'df', 'au', 'hl', 'va'].some(function (n) { return atWar(G, n); })) tableDrop(G, 'bribes');
}
function tableHuntMods(G, t, dmg) { if (dmg > 0 && tableHas(G, 'trail')) { tableDrop(G, 'trail'); return dmg - 1; } return dmg; }
function compOnMap(G) { return COMPANIONS.concat(['queen', 'kindled']).filter(function (c) { return isOnMap(G, c); }); }
function enemyNear(G, rid, side) { return [rid].concat(adj(rid)).filter(function (r) { return armyAt(G, r, other(side)); }); }
function attackers(G, side, op) {   // armies that may attack now for an event
  return armiesOf(G, side).concat(Object.keys(G.IN).filter(function (r) { return inAt(G, r) && armySide(G.IN[r]) === side; })).filter(function (r) {
    if (op.lead && !hasLeader(G, r, side)) return false; if (op.nat && !(anyAt(G, r, side) || {})[op.nat]) return false; if (op.min && units(G.A[r]) < op.min) return false;
    if (op.c && G.C[op.c] !== r) return false; return attackTargets(G, side, r).length > 0; });
}
function riderRegions(G) { return Object.keys(G.A).filter(function (r) { return G.A[r].pt && G.A[r].pt[2] > 0; }).concat(isOnMap(G, 'marshal') ? [G.C.marshal] : []); }
function hitTargets(G, side, op) {   // regions holding an enemy army that this op may hit
  var foe = other(side), res = [];
  Object.keys(G.A).forEach(function (r) {
    if (!armyAt(G, r, foe)) return;
    if (op.o === 'hitsNear' && op.c) { var l = G.C[op.c]; if (!l || !REG[l] || (l !== r && adj(l).indexOf(r) < 0)) return; }
    else if ((op.o === 'hitsNear' || op.o === 'hitsNearG') && op.nat) { if (![r].concat(adj(r)).some(function (x) { var a = anyAt(G, x, side); return a && a[op.nat] && a[op.nat][0] + a[op.nat][1] > 0; })) return; }
    else if (op.o === 'hitsIn') { if (op.garrison) return; if (!REG[r].nat || natSide(REG[r].nat) !== side) return; }
    else if (op.o === 'hitsRider') { if (riderRegions(G).indexOf(r) < 0) return; }
    else if (op.o === 'hitsDawnNear') { if (!adj(r).some(function (x) { return armyAt(G, x, side); })) return; }
    res.push(r);
  });
  if (op.o === 'hitsIn' && op.garrison) Object.keys(G.IN).forEach(function (r) { if (inAt(G, r) && armySide(G.IN[r]) === foe && armyAt(G, r, side)) res.push('in:' + r); });
  return res;
}
function cardPre(G, side, c) {
  var p = c.pre, F = G.F, cs = companions(G);
  if (c.tab && tableHas(G, c.tab)) return false;
  if (!p) return true;
  var k = p.split(':'), a = k[1];
  switch (k[0]) {
    case 'hidden': return F.hid && F.road < 0;
    case 'offroad': return F.road < 0 && F.taint > 0;
    case 'orrinF': return guideOf(G) === 'orrin';
    case 'kestrelF': return cs.indexOf('kestrel') >= 0 && F.road < 0;
    case 'smallF': return (cs.indexOf('pell') >= 0 || cs.indexOf('hobb') >= 0) && (F.taint > 0 || !F.hid);
    case 'small': return ['pell', 'hobb'].some(function (x) { return G.C[x] !== 'dead'; }) && ['gr', 'df', 'au', 'hl', 'va'].some(function (n) { return !G.pol[n].a; });
    case 'kestrelMap': var kl = G.C.kestrel; return isOnMap(G, 'kestrel') && REG[kl].nat && natSide(REG[kl].nat) === 'D' && isSettle(kl) && controller(G, kl) === 'D' && G.R[REG[kl].nat][1] > 0;
    case 'darianMap': return isOnMap(G, 'darian');
    case 'sylwenNear': return isOnMap(G, 'sylwen') && hitTargets(G, side, { o: 'hitsNear', c: 'sylwen' }).length > 0;
    case 'brokkOut': return isOnMap(G, 'brokk');
    case 'orrinMap': return isOnMap(G, 'orrin') || isOnMap(G, 'kindled');
    case 'compMap': return compOnMap(G).some(function (x) { return charTargets(G, x).length; });
    case 'compArmy': return compOnMap(G).some(function (x) { var a = armyAt(G, G.C[x], 'D'); return a && natsIn(a).some(function (n) { return G.R[n][1] > 0; }); });
    case 'leadAdj': return attackers(G, side, { lead: 1 }).length > 0;
    case 'onroad': return F.road >= 0;
    case 'own': return controller(G, a) === side && !armyAt(G, a, other(side));
    case 'war': return atWar(G, a);
    case 'besiegedD': return sortieTargets(G, 'D').length > 0;
    case 'army': return armiesOf(G, side).some(function (r) { return G.A[r][a] && moveArmyTargets(G, side, r).length; });
    case 'armyD': case 'armyG': return armiesOf(G, side).some(function (r) { return moveArmyTargets(G, side, r).length; });
    case 'adjD': case 'adjG': return attackers(G, side, {}).length > 0;
    case 'gloamInDawn': return hitTargets(G, side, { o: 'hitsIn' }).length > 0;
    case 'nearNat': return hitTargets(G, side, { o: side === 'D' ? 'hitsNear' : 'hitsNearG', nat: a }).length > 0;
    case 'huntbox': return F.road < 0 && G.hb.g > 0;
    case 'revealed': return !F.hid;
    case 'riderNear': return F.hid && F.road < 0 && riderRegions(G).some(function (r) { return r === F.loc || adj(F.loc).indexOf(r) >= 0; });
    case 'prog2': return F.hid && F.prog >= 2;
    case 'betray': return !F.hid && cs.length > 0 && enemyNear(G, F.loc, 'D').length > 0;
    case 'riders': return riderList(G).length > 0;
    case 'ridersPool': return G.R.pt[2] > 0;
    case 'marshalArmy': return isOnMap(G, 'marshal') && attackers(G, side, { c: 'marshal' }).length > 0;
    case 'vael': return isOnMap(G, 'vael');
    case 'voice': return isOnMap(G, 'voice') && G.hand.D.length > 0;
    case 'riderOnDawn': return hitTargets(G, side, { o: 'hitsRider' }).length > 0;
    case 'loneComp': return compOnMap(G).some(function (x) { return !anyAt(G, G.C[x], 'D'); });
    case 'big5': return attackers(G, side, { min: 5 }).length > 0;
    case 'dawnNearG': return hitTargets(G, side, { o: 'hitsDawnNear' }).length > 0;
    case 'siegingG': return hitTargets(G, side, { o: 'hitsIn', garrison: 1 }).length > 0;
  }
  return true;
}
function playCard(G, s, cid, face) {
  var c = CARD[cid]; G.hand[s].splice(G.hand[s].indexOf(cid), 1);
  log(G, s, (s === 'D' ? 'Dawn' : 'Gloam') + ' plays ' + c.n, 'card'); ev(G, { k: 'card', c: cid, s: s });
  if (c.tab) { G.table[s].push(cid); return; }
  G.disc.push(cid);
  G.pend = { h: 'effect', side: s, d: { cid: cid, q: c.eff.slice(), i: 0, cur: null, back: G.pend, got: [] } };
  runEffects(G);
}
function runEffects(G) {
  var guard = 0;
  while (G.pend && G.pend.h === 'effect' && guard++ < 50) {
    var p = G.pend, d = p.d;
    if (d.i >= d.q.length) { G.pend = d.back || null; return; }
    var op = d.q[d.i]; d.cur = op;
    var r = autoOp(G, p.side, op, d, p);
    if (r === 'choose') return;
    d.i++; d.got = [];
    if (r === 'sub') return;
    if (G.win) return;
  }
}
function recSpots(G, side, op, u) { var ki = u === 'r' ? 0 : u === 'e' ? 1 : 2; return op.at.filter(function (rid) { return controller(G, rid) === side && !armyAt(G, rid, other(side)) && G.R[op.nat][ki] > 0 && (u === 'l' || units(G.A[rid]) + units(G.IN[rid]) < 10); }); }
function autoOp(G, s, op, d, p) {
  switch (op.o) {
    case 'cmove': companyMove(G, true); return G.pend !== p ? 'sub' : 'done';
    case 'hide': G.F.hid = true; log(G, 'D', 'The Company hides', 'company'); return 'done';
    case 'heal': G.F.taint = Math.max(0, G.F.taint - op.n); log(G, 'D', 'Taint -' + op.n + ' (' + G.F.taint + ')', 'heal'); return 'done';
    case 'taint': G.F.taint = Math.min(TAINT_MAX, G.F.taint + op.n); log(G, 'G', '+' + op.n + ' taint (' + G.F.taint + ')', 'taint'); checkRingWin(G); return 'done';
    case 'tile': addSpecial(G, op.k); return 'done';
    case 'draw': drawCard(G, s, op.d); return handLimit(G, s) ? 'sub' : 'done';
    case 'pol': if (op.wake) wake(G, op.nat, 'card'); if (op.n) polStep(G, op.nat, op.n, 'card'); ev(G, { k: 'pol', n: op.nat }); return 'done';
    case 'discardOpp': for (var i = 0; i < op.n; i++) { var h = G.hand[other(s)]; if (!h.length) break; var c = h.splice(Math.floor(rngNext(G) * h.length), 1)[0]; G.disc.push(c); } log(G, s, (s === 'D' ? 'The Gloam' : 'The Dawn League') + ' loses ' + op.n + ' card' + (op.n > 1 ? 's' : ''), 'discard'); return 'done';
    case 'hunttile': var t = drawTile(G); resolveTile(G, t, 'card', 0); return G.pend !== p ? 'sub' : 'done';
    case 'reveal': if (G.F.hid) { revealCompany(G); return G.pend !== p ? 'sub' : 'done'; } return 'done';
    case 'kill': var cs = companions(G); if (cs.length) killChar(G, cs[Math.floor(rngNext(G) * cs.length)], 'betrayed'); return 'done';
    case 'charmove': G.pend = { h: 'charmove', side: s, d: { done: [], back: p } }; return 'sub';
    case 'nzmove': G.pend = { h: 'nzmove', side: s, d: { moved: {}, arrived: {}, done: [], back: p } }; return 'sub';
    case 'move': if (!armiesOf(G, s).some(function (r) { return (!op.nat || G.A[r][op.nat]) && moveArmyTargets(G, s, r).length; })) return 'done'; G.pend = { h: 'amove', side: s, d: { n: 0, max: op.n, moved: [], nat: op.nat || null, back: p } }; return 'sub';
    case 'sortie': var st = sortieTargets(G, s); if (!st.length) return 'done'; if (st.length === 1) { d.i++; startBattle(G, s, st[0], st[0], null, { sortie: true, back: p, evt: true }); d.i--; return G.pend !== p ? 'sub' : 'done'; } return 'choose';
    case 'attack': return attackers(G, s, op).length ? 'choose' : 'done';
    case 'rec': case 'recHere': case 'recComp': case 'recWar': case 'recRiders': return recOpts(G, s, op, d).length ? 'choose' : 'done';
    case 'hitsNear': case 'hitsNearG': case 'hitsIn': case 'hitsRider': case 'hitsDawnNear': return hitTargets(G, s, op).length ? 'choose' : 'done';
    case 'wakeAny': return ['gr', 'df', 'au', 'hl', 'va'].some(function (n) { return !G.pol[n].a; }) ? 'choose' : 'done';
    case 'polAny': return polAnyOpts(G, d).length && d.got.length < op.n ? 'choose' : 'done';
    case 'killLone': return compOnMap(G).some(function (x) { return !anyAt(G, G.C[x], 'D'); }) ? 'choose' : 'done';
  }
  return 'done';
}
function polAnyOpts(G, d) { return ['gr', 'df', 'au', 'hl', 'va'].filter(function (n) { return G.pol[n].a && G.pol[n].s > 0 && d.got.indexOf(n) < 0; }); }
function recOpts(G, s, op, d) {
  var out = [], got = d.got;
  if (op.o === 'rec') { var u = op.u[got.length]; if (!u) return []; recSpots(G, s, op, u).forEach(function (rid) { if (!op.same && op.at.length > 1 && op.u.length <= op.at.length && got.indexOf(rid) >= 0) return; out.push({ t: 'erec', rid: rid, nat: op.nat, k: u }); }); }
  else if (op.o === 'recHere') { var l = G.C[op.c]; if (got.length || !REG[l] || !REG[l].nat) return []; var n = REG[l].nat; if (natSide(n) === s && G.R[n][1] > 0 && controller(G, l) === s) out.push({ t: 'erec', rid: l, nat: n, k: 'e' }); }
  else if (op.o === 'recComp') { if (got.length) return []; compOnMap(G).forEach(function (x) { var a = armyAt(G, G.C[x], 'D'); if (a) natsIn(a).forEach(function (n) { if (G.R[n][1] > 0 && units(a) < 10) out.push({ t: 'erec', rid: G.C[x], nat: n, k: 'e' }); }); }); }
  else if (op.o === 'recWar') { if (got.length >= op.n) return []; REGIONS.forEach(function (r) { if (got.indexOf(r.id) >= 0 || !isSettle(r.id) || !r.nat || natSide(r.nat) !== s || !atWar(G, r.nat) || controller(G, r.id) !== s || armyAt(G, r.id, other(s)) || G.R[r.nat][0] <= 0 || units(G.A[r.id]) >= 10) return; out.push({ t: 'erec', rid: r.id, nat: r.nat, k: 'r' }); }); }
  else if (op.o === 'recRiders') { if (got.length >= op.n || G.R.pt[2] <= 0) return []; REGIONS.forEach(function (r) { if (r.set === 'strong' && r.nat === 'pt' && controller(G, r.id) === 'G') out.push({ t: 'erec', rid: r.id, nat: 'pt', k: 'l' }); }); }
  return out;
}
function effectMoves(G) {
  var p = G.pend, d = p.d, op = d.cur, s = p.side, out = [];
  switch (op.o) {
    case 'attack': attackers(G, s, op).forEach(function (r) { attackTargets(G, s, r).forEach(function (to) { out.push({ t: 'eatk', from: r, to: to }); }); }); break;
    case 'sortie': sortieTargets(G, s).forEach(function (r) { out.push({ t: 'esortie', r: r }); }); break;
    case 'rec': case 'recHere': case 'recComp': case 'recWar': case 'recRiders': out = recOpts(G, s, op, d); break;
    case 'hitsNear': case 'hitsNearG': case 'hitsIn': case 'hitsRider': case 'hitsDawnNear': hitTargets(G, s, op).forEach(function (r) { out.push({ t: 'ehit', r: r }); }); break;
    case 'wakeAny': ['gr', 'df', 'au', 'hl', 'va'].forEach(function (n) { if (!G.pol[n].a) out.push({ t: 'ewake', n: n }); }); break;
    case 'polAny': polAnyOpts(G, d).forEach(function (n) { out.push({ t: 'epol', n: n }); }); break;
    case 'killLone': compOnMap(G).forEach(function (x) { if (!anyAt(G, G.C[x], 'D')) out.push({ t: 'ekill', c: x }); }); break;
  }
  out.push({ t: 'eskip' });
  return out;
}
function effectMove(G, mv) {
  var p = G.pend, d = p.d, op = d.cur, s = p.side, next = function () { d.i++; d.got = []; runEffects(G); };
  switch (mv.t) {
    case 'eskip': next(); return;
    case 'eatk': d.i++; d.got = []; startBattle(G, s, mv.from, mv.to, null, { back: p, evt: false, lead: op.lead }); if (G.pend === p) runEffects(G); return;
    case 'esortie': d.i++; startBattle(G, s, mv.r, mv.r, null, { sortie: true, back: p, evt: true }); if (G.pend === p) runEffects(G); return;
    case 'erec': recruit(G, mv.rid, mv.k, mv.nat); d.got.push(mv.rid); if (!recOpts(G, s, op, d).length) next(); return;
    case 'ehit':
      var ins = mv.r.indexOf('in:') === 0, rid = ins ? mv.r.slice(3) : mv.r, a = ins ? G.IN[rid] : G.A[rid];
      takeHits(G, a, op.n, other(s) === 'G', null, { evt: true }, false); log(G, s, REG[rid].n + ' takes ' + op.n + ' hit', 'hit'); ev(G, { k: 'hit', rid: rid });
      if (!units(a)) { var bb = { as: s, ds: other(s), from: rid, to: rid, siege: ins }; wipe(G, bb, false); }
      clean(G, rid); next(); return;
    case 'ewake': wake(G, mv.n, 'card'); next(); return;
    case 'epol': polStep(G, mv.n, 1, 'card'); d.got.push(mv.n); log(G, s, NATIONS[mv.n].n + ' steps toward war', 'pol'); if (d.got.length >= op.n || !polAnyOpts(G, d).length) { d.i++; d.got = []; runEffects(G); } return;
    case 'ekill': killChar(G, mv.c, 'spite'); next(); return;
  }
}

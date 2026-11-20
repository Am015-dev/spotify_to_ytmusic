/* Gloamwar battles: field battle, siege (garrison in the stronghold box), sortie. Combat cards, leader re-rolls, casualties, retreat, advance.
   Battle state lives in G.pend = {h:'battle', side: who decides, d: B}. Stages: choose (defender: field or into the walls), acard, dcard, cont, retreat, extend, advance. */
function bArmies(G, B) {   // {att, def} army objects (live references)
  if (B.siege) return { att: G.A[B.to], def: G.IN[B.to] };
  if (B.sortie) return { att: G.IN[B.to], def: G.A[B.to] };
  return { att: G.A[B.from], def: G.A[B.to] };
}
function startBattle(G, s, from, to, u, o) {
  o = o || {}; G.stats.battles++;
  var B = { back: o.back || null, as: s, ds: other(s), from: from, to: to, siege: from === to && !o.sortie, sortie: !!o.sortie, round: 0, cards: {}, last: null, lead: !!o.lead, evt: !!o.evt, ext: 0 };
  var ar = bArmies(G, B);
  if (!ar.def) { // garrison-only target from an adjacent region: the walls are already manned and nobody outside: treat as a siege from outside -> move in
    return;
  }
  attackedNations(G, ar.def, 'attacked');
  log(G, s, (s === 'D' ? 'Dawn' : 'Gloam') + (B.siege ? ' storms the walls of ' : B.sortie ? ' sallies out at ' : ' attacks ') + REG[to].n, 'battle');
  ev(G, { k: 'battle', from: from, to: to, s: s });
  G.pend = { h: 'battle', side: B.ds, d: B };
  if (!B.siege && !B.sortie && REG[to].set === 'strong' && controller(G, to) === B.ds && !inAt(G, to)) { B.stage = 'choose'; return; }
  newRound(G, B);
}
function newRound(G, B) { B.round++; B.cards = {}; B.stage = 'acard'; G.pend.side = B.as; if (!G.hand[B.as].some(function (c) { return combatOK(G, B, B.as, c); })) { B.stage = 'dcard'; G.pend.side = B.ds; if (!G.hand[B.ds].some(function (c) { return combatOK(G, B, B.ds, c); })) resolveRound(G, B); } }
function combatOK(G, B, side, cid) {
  var c = CARD[cid]; if (!c || !c.cb) return false; var role = side === B.as ? 'att' : 'def', k = c.cb.need || '';
  if (k === 'att' && role !== 'att') return false; if (k === 'def' && role !== 'def') return false;
  if (k === 'siege' && !B.siege) return false; if (k === 'field' && (B.siege)) return false;
  if (k === 'lead') { var ar = bArmies(G, B), a = role === 'att' ? ar.att : ar.def; if (!leaders(a) && !bChars(G, B, side).length) return false; }
  if (k.indexOf('nat:') === 0) { var ar2 = bArmies(G, B), a2 = role === 'att' ? ar2.att : ar2.def; if (!a2 || !a2[k.slice(4)]) return false; }
  if (k === 'char' && !bChars(G, B, side).length) return false;
  return true;
}
function bChars(G, B, side) { var rid = side === B.as && !B.siege && !B.sortie ? B.from : B.to; return charsAt(G, rid, side).filter(function (c) { return CHARS[c].ld > 0 || c === 'vael'; }); }
function battleMoves(G) {
  var B = G.pend.d, s = G.pend.side, out = [];
  if (B.stage === 'choose') { out.push({ t: 'field' }); out.push({ t: 'walls' }); }
  else if (B.stage === 'acard' || B.stage === 'dcard') { out.push({ t: 'bcard', c: null }); G.hand[s].forEach(function (c) { if (combatOK(G, B, s, c)) out.push({ t: 'bcard', c: c }); }); }
  else if (B.stage === 'cont') { out.push({ t: 'cont' }); out.push({ t: 'cease' }); }
  else if (B.stage === 'retreat') { out.push({ t: 'stand' }); retreatTargets(G, B).forEach(function (r) { out.push({ t: 'retreat', to: r }); }); if (REG[B.to].set === 'strong' && controller(G, B.to) === B.ds && !inAt(G, B.to) && !B.sortie) out.push({ t: 'walls' }); }
  else if (B.stage === 'extend') { out.push({ t: 'stop' }); if (bElites(bArmies(G, B).att)) out.push({ t: 'extend' }); }
  else if (B.stage === 'advance') { out.push({ t: 'stay' }); out.push({ t: 'adv' }); }
  return out;
}
function bElites(a) { var e = 0; for (var n in a || {}) e += a[n][1]; return e; }
function retreatTargets(G, B) { var a = bArmies(G, B).def; return adj(B.to).filter(function (r) { return !armyAt(G, r, B.as) && !(isSettle(r) && controller(G, r) === B.as) && units(G.A[r]) + units(a) <= 10; }); }
function battleMove(G, mv) {
  var B = G.pend.d;
  switch (mv.t) {
    case 'field': newRound(G, B); return;
    case 'walls': intoWalls(G, B); return;
    case 'bcard':
      if (mv.c) { G.hand[G.pend.side].splice(G.hand[G.pend.side].indexOf(mv.c), 1); B.cards[G.pend.side === B.as ? 'att' : 'def'] = mv.c; }
      if (B.stage === 'acard') { B.stage = 'dcard'; G.pend.side = B.ds; if (!G.hand[B.ds].some(function (c) { return combatOK(G, B, B.ds, c); })) resolveRound(G, B); }
      else resolveRound(G, B);
      return;
    case 'cont': B.stage = 'retreat'; G.pend.side = B.ds; return;
    case 'cease': endBattle(G, B, 'cease'); return;
    case 'stand': newRound(G, B); return;
    case 'retreat': retreatArmy(G, B, mv.to); return;
    case 'extend': var a = bArmies(G, B).att; for (var n in a) if (a[n][1] > 0) { a[n][1]--; if (G.R[n][0] > 0) { G.R[n][0]--; a[n][0]++; } loseUnit(G, n, 1); break; } B.ext++; newRound(G, B); return;
    case 'stop': endBattle(G, B, 'siege-over'); return;
    case 'stay': endBattle(G, B, 'done'); return;
    case 'adv': advance(G, B); endBattle(G, B, 'done'); return;
  }
}
function intoWalls(G, B) {
  var a = G.A[B.to]; G.IN[B.to] = {}; var room = 5;
  for (var n in a) { var x = a[n], e = Math.min(x[1], room); room -= e; var r = Math.min(x[0], room); room -= r; G.IN[B.to][n] = [r, e, x[2]]; for (var i = 0; i < x[0] - r; i++) loseUnit(G, n, 0); for (var j = 0; j < x[1] - e; j++) loseUnit(G, n, 1); }
  delete G.A[B.to]; clean(G, B.to);
  log(G, B.ds, 'The defenders fall back behind the walls of ' + REG[B.to].n, 'siege'); ev(G, { k: 'siege', rid: B.to });
  // the attack ends; the attacker may move into the region and lay siege
  B.stage = 'advance'; G.pend.side = B.as; B.won = true;
}
function cardOps(G, B, role) {   // combat card effects for both sides, resolved by initiative (lower first, defender first on ties)
  var list = []; ['att', 'def'].forEach(function (r) { var c = B.cards[r]; if (c) list.push({ r: r, c: CARD[c] }); });
  list.sort(function (x, y) { return x.c.cb.i - y.c.cb.i || (x.r === 'def' ? -1 : 1); });
  var m = { att: { plus: 0, dice: 0, lead: 0, shield: 0, hit: 0, minus: 0, nolead: 0, reroll: 0, stop: 0, siege: 0 }, def: { plus: 0, dice: 0, lead: 0, shield: 0, hit: 0, minus: 0, nolead: 0, reroll: 0, stop: 0, siege: 0 } }, cancelled = {};
  list.forEach(function (x) {
    if (cancelled[x.r]) return; var o = x.c.cb, me = m[x.r], foe = x.r === 'att' ? 'def' : 'att';
    switch (o.op) {
      case 'cancel': cancelled[foe] = 1; break;
      case 'plus': me.plus += o.a; break; case 'dice': me.dice += o.a; break; case 'lead': me.lead += o.a; break;
      case 'shield': me.shield += o.a; break; case 'hit': me.hit += o.a; break; case 'minus': m[foe].minus += o.a; break;
      case 'nolead': m[foe].nolead = 1; break; case 'reroll': me.reroll = 1; break; case 'stop': me.stop = 1; break; case 'siege': me.siege = 1; break;
      case 'charge': if (B.round === 1) me.plus += 1; break;
    }
  });
  return m;
}
function armyStrength(G, B, side, a, mods) {
  var u = 0; for (var n in a || {}) { if (side === B.as && !atWar(G, n) && !B.evt) continue; u += a[n][0] + a[n][1]; }
  var rid = B.to, cs = bChars(G, B, side), plus = 0;
  if (cs.indexOf('orrin') >= 0 || cs.indexOf('kestrel') >= 0 || cs.indexOf('queen') >= 0) plus++;
  if (side === 'D' && side === B.ds && B.siege && tableHas(G, 'walls')) plus++;
  var dice = Math.min(5, u + plus + mods.dice), lead = Math.min(5, leaders(a) + cs.reduce(function (t, c) { return t + CHARS[c].ld; }, 0) + mods.lead);
  if (cs.indexOf('darian') >= 0 && ['au', 'va'].indexOf(REG[rid].nat) >= 0) lead = Math.min(5, lead + 1);
  if (cs.indexOf('vael') >= 0 && a && a.cv) { /* Corvel regulars fight as elites: they shrug one hit */ }
  if (B.kindledNull && side === 'G') lead = Math.max(0, lead - leaders(a));
  return { u: u, dice: dice, lead: mods.nolead ? 0 : lead };
}
function rollSide(G, n, need, lead, reroll) {
  var r = [], hits = 0; for (var i = 0; i < n; i++) r.push(d6(G));
  var ok = function (x) { return x !== 1 && x >= need; };
  var rr = []; for (var j = 0; j < r.length && lead > 0; j++) if (!ok(r[j])) { r[j] = d6(G); rr.push(j); lead--; }
  if (reroll) for (var k = 0; k < r.length; k++) if (!ok(r[k])) r[k] = d6(G);
  r.forEach(function (x) { if (ok(x)) hits++; }); return { r: r, hits: hits, need: need, rr: rr };
}
function resolveRound(G, B) {
  var ar = bArmies(G, B), m = cardOps(G, B);
  if (B.round === 1 && G.C.kindled === B.to && B.ds === 'D' || G.C.kindled === B.from && B.as === 'D' && B.round === 1) B.kindledNull = true;
  var A = armyStrength(G, B, B.as, ar.att, m.att), D = armyStrength(G, B, B.ds, ar.def, m.def);
  var fortBonus = B.round === 1 && !B.sortie && !B.siege && (REG[B.to].set === 'city' || REG[B.to].set === 'fort') && controller(G, B.to) === B.ds;
  var needA = (B.siege && !m.att.siege && !tableHas(G, 'ladders')) || fortBonus ? 6 : 5;
  needA = Math.max(2, needA - m.att.plus + m.att.minus); var needD = Math.max(2, 5 - m.def.plus + m.def.minus);
  var ra = rollSide(G, A.dice, needA, A.lead, m.att.reroll), rd = rollSide(G, D.dice, needD, D.lead, m.def.reroll);
  var cs = { att: bChars(G, B, B.as), def: bChars(G, B, B.ds) };
  if (B.round === 1 && cs.att.indexOf('sylwen') >= 0 && ra.hits < A.dice) ra.hits++;
  if (B.round === 1 && cs.def.indexOf('sylwen') >= 0 && rd.hits < D.dice) rd.hits++;
  var hA = ra.hits + m.att.hit, hD = rd.hits + m.def.hit;   // hits scored BY each side
  var takenA = Math.max(0, hD - m.att.shield - (B.round === 1 && cs.att.indexOf('brokk') >= 0 ? 1 : 0) - (cs.att.indexOf('vael') >= 0 && B.as === 'G' ? 1 : 0));
  var takenD = Math.max(0, hA - m.def.shield - (B.round === 1 && cs.def.indexOf('brokk') >= 0 ? 1 : 0) - (cs.def.indexOf('vael') >= 0 && B.ds === 'G' ? 1 : 0));
  takeHits(G, ar.att, takenA, B.as === 'G', B.as === 'D' ? null : null, B, true); takeHits(G, ar.def, takenD, B.ds === 'G', null, B, false);
  B.last = { round: B.round, ra: ra, rd: rd, hA: hA, hD: hD, takenA: takenA, takenD: takenD, cards: { att: B.cards.att || null, def: B.cards.def || null }, A: A, D: D };
  ['att', 'def'].forEach(function (r) { if (B.cards[r]) G.disc.push(B.cards[r]); }); var usedCards = B.cards; B.cards = {};
  if (B.round === 1 && (usedCards.att || usedCards.def)) { var ms = G.C.marshal; if (ms && (ms === B.to || ms === B.from) && usedCards[B.as === 'G' ? 'att' : 'def']) { drawCard(G, 'G', G.deck.GC.length ? 'GC' : 'GS'); } }
  log(G, null, 'Round ' + B.round + ': ' + (B.as === 'D' ? 'Dawn' : 'Gloam') + ' ' + hA + ' hit' + (hA === 1 ? '' : 's') + ', ' + (B.ds === 'D' ? 'Dawn' : 'Gloam') + ' ' + hD, 'round');
  ev(G, { k: 'round', B: JSON.parse(JSON.stringify(B.last)), to: B.to, from: B.from });
  ar = bArmies(G, B); var ua = units(ar.att), ud = units(ar.def);
  if (ud === 0) { wipe(G, B, false); if (ua > 0 && !B.siege && !B.sortie) { B.stage = 'advance'; G.pend.side = B.as; B.won = true; return; } if (B.siege) captureSiege(G, B); endBattle(G, B, 'won'); return; }
  if (ua === 0) { wipe(G, B, true); endBattle(G, B, 'lost'); return; }
  if (m.def.stop || m.att.stop) { endBattle(G, B, 'stopped'); return; }
  if (B.siege) { B.stage = 'extend'; G.pend.side = B.as; return; }
  B.stage = 'cont'; G.pend.side = B.as;
}
function takeHits(G, a, h, shadow, x, B, isAtt) {   // casualties chosen automatically: regulars first, then elites become regulars, then elites go
  if (!a) return;
  var nats = Object.keys(a).filter(function (n) { return !(isAtt && !atWar(G, n) && !B.evt); });
  while (h > 0) {
    var did = false;
    for (var i = 0; i < nats.length && !did; i++) { var n = nats[i]; if (a[n][0] > 0) { a[n][0]--; loseUnit(G, n, 0); did = true; } }
    if (!did) for (var j = 0; j < nats.length && !did; j++) { var m = nats[j]; if (a[m][1] > 0) { a[m][1]--; loseUnit(G, m, 1); if (h >= 2) h--; else if (G.R[m][0] > 0) { G.R[m][0]--; a[m][0]++; } did = true; } }
    if (!did) break; h--;
  }
}
function wipe(G, B, att) {   // all units of one side died: its leaders and characters there fall
  var rid = att ? (B.siege ? B.to : B.sortie ? B.to : B.from) : B.to, side = att ? B.as : B.ds, k = att ? (B.sortie ? 'IN' : 'A') : (B.siege ? 'IN' : 'A');
  var a = G[k][rid]; if (a) for (var n in a) if (a[n][2] > 0) { if (natSide(n) === 'G') G.R[n][2] += a[n][2]; else G.dead[n][2] += a[n][2]; a[n][2] = 0; }
  charsAt(G, rid, side).forEach(function (c) { if (!(k === 'A' && inAt(G, rid) && armySide(G.IN[rid]) === side)) killChar(G, c, 'battle'); });
  clean(G, rid);
}
function captureSiege(G, B) { if (inAt(G, B.to)) return; capture(G, B.to, B.as); }
function retreatArmy(G, B, to) {
  var a = G.A[B.to]; var dst = G.A[to] || (G.A[to] = {});
  for (var n in a) { var y = dst[n] || (dst[n] = [0, 0, 0]); y[0] += a[n][0]; y[1] += a[n][1]; y[2] += a[n][2]; }
  delete G.A[B.to];
  charsAt(G, B.to, B.ds).forEach(function (c) { if (CHARS[c].lv > 0 && !(c === 'vael')) G.C[c] = to; });
  clean(G, B.to); log(G, B.ds, 'The defenders retreat to ' + REG[to].n, 'retreat'); ev(G, { k: 'move', from: B.to, to: to, s: B.ds });
  B.stage = 'advance'; G.pend.side = B.as; B.won = true;
}
function advance(G, B) {
  if (B.siege || B.sortie) return; var a = G.A[B.from]; if (!a || !units(a)) return;
  var u = {}; for (var n in a) u[n] = a[n].slice();
  var tn = REG[B.to].nat; if (!belligerentOK(G, a, B.to)) { for (var m in u) if (!atWar(G, m) && tn && tn !== m) delete u[m]; }
  if (!Object.keys(u).length) return;
  var free = !armyAt(G, B.to, B.ds);
  if (free) moveArmy(G, B.as, B.from, B.to, u);
}
function endBattle(G, B, why) {
  if (B.sortie && why === 'cease') { }
  // garrison comes out when nobody besieges it
  ['to', 'from'].forEach(function (k) { var r = B[k]; if (inAt(G, r) && !armyAt(G, r, other(armySide(G.IN[r])))) { var s = armySide(G.IN[r]); var a = G.IN[r]; delete G.IN[r]; var d = G.A[r] || (G.A[r] = {}); for (var n in a) { var y = d[n] || (d[n] = [0, 0, 0]); y[0] += a[n][0]; y[1] += a[n][1]; y[2] += a[n][2]; } } });
  if (B.siege) { if (B.as === 'G') tableDrop(G, 'ladders'); if (B.ds === 'D') tableDrop(G, 'walls'); }
  clean(G, B.to); clean(G, B.from);
  G.pend = B.back || null;
  ev(G, { k: 'battleEnd', why: why, to: B.to });
  if (G.pend && G.pend.h === 'effect') { runEffects(G); }
  if (!G.pend && !G.win && G.phase === 'act') afterAction(G);
}

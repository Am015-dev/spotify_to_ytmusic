/* Gloamwar rules engine. All state in one JSON-safe G (no functions); pending questions are {h, side, d}. Node + page.
   API: newGame(o), validMoves(G), performMove(G, mv), sideToAct(G), checkInvariants(G), vpOf(G, side).
   Sides: 'D' Dawn League (free peoples), 'G' the Gloam. Combat lives in combat.js, card effects in effects.js. */
var ENG = {};
function rngNext(G) { var t = G.rs = (G.rs + 0x6D2B79F5) | 0; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
function d6(G) { return 1 + Math.floor(rngNext(G) * 6); }
function shuffleG(G, a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rngNext(G) * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function other(s) { return s === 'D' ? 'G' : 'D'; }
function natSide(n) { return NATIONS[n].side; }
function log(G, side, txt, k) { G.log.push({ t: G.turn, s: side, x: txt, k: k || '' }); if (G.log.length > 400) G.log.shift(); G.ev.push({ k: 'log', c: k || '', s: side, x: txt }); }
function ev(G, o) { G.ev.push(o); }

// ---------------------------------------------------------------- setup
function newGame(o) {
  o = o || {};
  var G = { v: 1, rs: (o.seed || 1) | 0, turn: 0, phase: 'start', act: 'D', A: {}, IN: {}, R: {}, dead: {}, ctl: {}, C: {}, pol: {}, log: [], ev: [], win: null, pend: null,
    F: { loc: ELF_START, prog: 0, hid: true, taint: 0, road: -1, guide: 'orrin', tried: false, moved: 0, declared: false },
    pool: [], drawn: [], spec: { D: [], G: [] }, specIn: [], hb: { g: 0, d: 0 }, retrieved: 0, dice: { D: [], G: [] }, used: { D: [], G: [] }, lamps: { D: 3, G: 0 }, lampUsed: { D: 0, G: 0 },
    deck: {}, hand: { D: [], G: [] }, table: { D: [], G: [] }, disc: [], minionSeen: 0, flags: {}, stats: { battles: 0, hunts: 0, tiles: 0 } };
  NAT_ORDER.forEach(function (n) { G.pol[n] = { s: NATIONS[n].pol, a: NATIONS[n].act }; G.R[n] = REINF[n].slice(); G.dead[n] = [0, 0, 0]; });
  Object.keys(SETUP).forEach(function (rid) { G.A[rid] = {}; Object.keys(SETUP[rid]).forEach(function (n) { G.A[rid][n] = SETUP[rid][n].slice(); }); });
  Object.keys(CHARS).forEach(function (c) { G.C[c] = CHARS[c].start; });
  G.pool = HUNT_STD.map(function (t, i) { return { i: i, v: t.v, r: t.r || 0 }; });
  ['DC', 'DS', 'GC', 'GS'].forEach(function (k) { G.deck[k] = shuffleG(G, CARDS.filter(function (c) { return c.deck === k; }).map(function (c) { return c.id; })); });
  if (o.deal) o.deal(G);
  startTurn(G);
  return G;
}
function sideToAct(G) { return G.pend ? G.pend.side : G.act; }

// ---------------------------------------------------------------- army helpers
function units(a) { var u = 0; if (!a) return 0; for (var n in a) u += a[n][0] + a[n][1]; return u; }
function leaders(a) { var l = 0; if (!a) return 0; for (var n in a) l += a[n][2]; return l; }
function armySide(a) { for (var n in a) if (a[n][0] + a[n][1] + a[n][2] > 0) return natSide(n); return null; }
function armyAt(G, rid, side) { var a = G.A[rid]; return a && armySide(a) === side && units(a) > 0 ? a : null; }
function anyAt(G, rid, side) { var a = G.A[rid]; return a && armySide(a) === side ? a : null; }   // includes lone Gloamriders
function inAt(G, rid) { var a = G.IN[rid]; return a && units(a) + leaders(a) > 0 ? a : null; }
function charsAt(G, rid, side) { var r = []; for (var c in G.C) if (G.C[c] === rid && (CHARS[c].side || 'D') === side) r.push(c); return r; }
function ownerSide(rid) { var r = REG[rid]; return r.nat ? natSide(r.nat) : null; }
function controller(G, rid) { return G.ctl[rid] || ownerSide(rid); }
function isSettle(rid) { var s = REG[rid].set; return s === 'town' || s === 'city' || s === 'strong'; }
function besieged(G, rid) { return !!inAt(G, rid); }
function clean(G, rid) {   // drop empty entries; FP leaders without units die
  ['A', 'IN'].forEach(function (k) {
    var a = G[k][rid]; if (!a) return; var u = units(a);
    for (var n in a) { if (u === 0 && a[n][2] > 0 && natSide(n) === 'D') { G.dead[n][2] += a[n][2]; a[n][2] = 0; } if (a[n][0] + a[n][1] + a[n][2] === 0) delete a[n]; }
    if (!Object.keys(a).length) delete G[k][rid];
  });
  if (!G.A[rid] && !G.IN[rid]) charsWithoutArmy(G, rid);
}
function charsWithoutArmy(G, rid) { }   // characters may stand alone (they are ignored by armies)
function addUnits(G, k, rid, n, r, e, l) { var a = G[k][rid] || (G[k][rid] = {}); var x = a[n] || (a[n] = [0, 0, 0]); x[0] += r; x[1] += e; x[2] += l; }
function adj(rid) { return REG[rid].adj; }
function dist(from, maxd, ok) {   // BFS distances; ok(rid) = may pass through
  var d = {}; d[from] = 0; var q = [from];
  while (q.length) { var c = q.shift(); if (d[c] >= maxd) continue; if (c !== from && ok && !ok(c)) continue; adj(c).forEach(function (a) { if (d[a] == null) { d[a] = d[c] + 1; q.push(a); } }); }
  return d;
}
function atWar(G, n) { return G.pol[n].s === 0; }
function canEnter(G, side, rid) { return !armyAt(G, rid, other(side)); }   // free for army movement: no enemy army units
function natsIn(a) { return Object.keys(a || {}).filter(function (n) { return a[n][0] + a[n][1] + a[n][2] > 0; }); }
function belligerentOK(G, a, to) {   // nations not At War may not cross into another nation's region
  var tn = REG[to].nat; return natsIn(a).every(function (n) { return atWar(G, n) || natSide(n) === 'G' && n === 'pt' && units(a) === 0 || !tn || tn === n; });
}

// ---------------------------------------------------------------- political track
function wake(G, n, why) { if (natSide(n) === 'D' && !G.pol[n].a) { G.pol[n].a = true; log(G, 'D', NATIONS[n].n + ' wakes' + (why ? ' (' + why + ')' : ''), 'pol'); } }
function polStep(G, n, k, why) {
  k = k || 1; var p = G.pol[n];
  for (var i = 0; i < k; i++) { if (p.s === 0) break; if (p.s === 1 && !p.a) break; if (natSide(n) === 'D' && why === 'dip' && (tableHas(G, 'bribes') || n === 'va' && tableHas(G, 'sermon'))) break; p.s--; if (p.s === 0) log(G, natSide(n), NATIONS[n].n + ' goes to war', 'war'); }
}
function attackedNations(G, a, why) { natsIn(a).forEach(function (n) { wake(G, n, why); polStep(G, n, 1, why); }); }

// ---------------------------------------------------------------- victory points
function vpOf(G, side) { var v = 0; REGIONS.forEach(function (r) { if (!VP[r.set] || !r.nat) return; if (natSide(r.nat) !== side && G.ctl[r.id] === side) v += VP[r.set]; }); return v; }
function capture(G, rid, side) {
  if (!isSettle(rid) || controller(G, rid) === side) return;
  var own = ownerSide(rid); if (own === side) delete G.ctl[rid]; else { G.ctl[rid] = side; var n = REG[rid].nat; wake(G, n, 'lost ' + REG[rid].n); polStep(G, n, 1, 'capture'); }
  log(G, side, (side === 'D' ? 'Dawn' : 'Gloam') + ' takes ' + REG[rid].n + (VP[REG[rid].set] ? ' (+' + VP[REG[rid].set] + ' VP)' : ''), 'capture');
  ev(G, { k: 'capture', rid: rid, s: side });
}
function checkRingWin(G) {
  if (G.win) return true;
  if (G.F.taint > TAINT_MAX) G.F.taint = TAINT_MAX;
  if (G.F.taint >= TAINT_MAX) { G.win = { side: 'G', why: 'taint' }; G.phase = 'over'; log(G, 'G', 'The Hollow Crown takes the Bearers', 'win'); return true; }
  if (G.F.road >= ROAD_STEPS) { G.win = { side: 'D', why: 'kiln' }; G.phase = 'over'; log(G, 'D', 'The Hollow Crown is unmade in the Kiln', 'win'); return true; }
  return false;
}
function checkMilitary(G) {
  if (G.win) return true;
  if (vpOf(G, 'G') >= VPWIN.G) { G.win = { side: 'G', why: 'vp' }; G.phase = 'over'; log(G, 'G', 'The Gloam conquers the West', 'win'); return true; }
  if (vpOf(G, 'D') >= VPWIN.D) { G.win = { side: 'D', why: 'vp' }; G.phase = 'over'; log(G, 'D', 'The Dawn League breaks the Gloam', 'win'); return true; }
  return false;
}

// ---------------------------------------------------------------- turn flow
function diceCount(G, side) { var n = DICE0[side]; for (var c in CHARS) if (CHARS[c].die === side && G.C[c] !== 'out' && G.C[c] !== 'dead') n++; return Math.min(n, DICEMAX[side]); }
function drawCard(G, side, k) { var d = G.deck[k]; if (!d.length) return null; var c = d.pop(); G.hand[side].push(c); return c; }
function startTurn(G) {
  G.turn++; G.phase = 'start';
  G.retrieved = G.hb.d; G.hb = { g: 0, d: 0 }; G.lampUsed = { D: 0, G: 0 }; G.F.tried = false; G.F.moved = 0; G.F.declared = false; G.flags.turn = {};
  ['D', 'G'].forEach(function (s) { drawCard(G, s, s + 'C'); drawCard(G, s, s + 'S'); });
  log(G, null, 'Turn ' + G.turn, 'turn');
  G.phase = 'company'; G.act = 'D';
  handLimit(G, 'D') || handLimit(G, 'G');
}
function handLimit(G, side) { if (G.hand[side].length > 6) { G.pend = { h: 'discard', side: side, d: { back: G.pend } }; return true; } return false; }
function companions(G) { return COMPANIONS.concat(['wretch']).filter(function (c) { return G.C[c] === 'F' && c !== 'wretch'; }); }
function huntRange(G) { var mx = Math.max(1, companions(G).length); mx = Math.min(mx, diceCount(G, 'G')); var mn = G.retrieved > 0 ? 1 : 0; return [mn, mx]; }
function rollDice(G) {
  G.phase = 'act';
  var nd = diceCount(G, 'D'), ng = diceCount(G, 'G') - G.hb.g;
  G.dice.D = []; G.dice.G = []; G.used = { D: [], G: [] };
  var fd = G.flags.forceDice && G.turn === 1 ? G.flags.forceDice : null;
  for (var i = 0; i < nd; i++) G.dice.D.push(fd ? fd.D[i % fd.D.length] : FACES.D[d6(G) - 1]);
  for (var j = 0; j < ng; j++) { var f = fd ? fd.G[j % fd.G.length] : FACES.G[d6(G) - 1]; if (f === 'Y') G.hb.g++; else G.dice.G.push(f); }
  G.dice.D.forEach(function () { G.used.D.push(false); }); G.dice.G.forEach(function () { G.used.G.push(false); });
  log(G, null, 'Dice: Dawn ' + G.dice.D.join('') + ' · Gloam ' + G.dice.G.join('') + ' · hunt ' + G.hb.g, 'dice');
  ev(G, { k: 'roll' }); G.act = 'D'; nextActor(G, true);
}
function left(G, s) { return G.used[s].filter(function (u) { return !u; }).length; }
function nextActor(G, first) {
  if (G.win) return;
  var a = first ? 'D' : other(G.act);
  if (left(G, a) === 0) a = other(a);
  if (left(G, a) === 0) { endActions(G); return; }
  G.act = a;
}
function endActions(G) {
  if (G.F.road >= 0 && !G.F.tried) { G.F.taint++; log(G, 'D', 'The Bearers linger on the Ashen Road: +1 taint', 'taint'); if (checkRingWin(G)) return; }
  tableEndOfTurn(G);
  if (checkMilitary(G)) return;
  startTurn(G);
}

// ---------------------------------------------------------------- the Company
function guideOf(G) { var cs = companions(G); if (!cs.length) return G.C.wretch === 'F' ? 'wretch' : null; return cs.indexOf(G.F.guide) >= 0 ? G.F.guide : cs.sort(function (a, b) { return CHARS[b].lv - CHARS[a].lv; })[0]; }
function fixGuide(G) {
  var cs = companions(G);
  if (!cs.length) { if (G.C.wretch === 'out' && G.F.road < 99) { G.C.wretch = 'F'; log(G, 'D', 'The Hollow Wretch creeps in to guide the Bearers', 'comp'); } G.F.guide = G.C.wretch === 'F' ? 'wretch' : null; return; }
  var top = Math.max.apply(null, cs.map(function (c) { return CHARS[c].lv; }));
  if (cs.indexOf(G.F.guide) < 0 || CHARS[G.F.guide].lv < top) G.F.guide = cs.filter(function (c) { return CHARS[c].lv === top; })[0];
}
function noRoadStop(rid) { return true; }
function companyDist(G, from, maxd) { return dist(from, maxd); }
function declareTargets(G) {
  if (!G.F.hid || G.F.prog <= 0 || G.F.road >= 0) return [];
  var d = companyDist(G, G.F.loc, G.F.prog); return Object.keys(d).filter(function (r) { return r !== G.F.loc; });
}
function dawnHold(G, rid) { var s = REG[rid].set; return (s === 'city' || s === 'strong') && ownerSide(rid) === 'D' && controller(G, rid) === 'D'; }
function declare(G, to) {
  G.F.loc = to; G.F.prog = 0; G.F.declared = true; log(G, 'D', 'The Company is declared at ' + REG[to].n, 'company');
  if (dawnHold(G, to)) { wake(G, REG[to].nat, 'the Company arrives'); if (G.F.taint > 0) { G.F.taint--; log(G, 'D', 'Rest in ' + REG[to].n + ': taint -1', 'heal'); } }
  ev(G, { k: 'company', rid: to });
}
function enterRoad(G) {
  G.F.road = 0; G.F.prog = 0; log(G, 'D', 'The Company sets foot on the Ashen Road', 'company');
  G.drawn.forEach(function (t) { if (t.v === 'eye') G.pool.push(t); }); G.drawn = G.drawn.filter(function (t) { return t.v !== 'eye'; });
  G.specIn.forEach(function (k) { G.pool.push(specialTile(k)); }); G.specIn = [];
  tableDrop(G, 'watch'); tableDrop(G, 'net');
  ev(G, { k: 'road' });
}
function specialTile(k) { var s = HUNT_SPECIAL[k]; return { sp: k, v: s.v, r: s.r || 0, stop: s.stop || 0 }; }
function addSpecial(G, k) { if (G.F.road >= 0) G.pool.push(specialTile(k)); else G.specIn.push(k); log(G, HUNT_SPECIAL[k].side, 'Hunt tile added: ' + HUNT_SPECIAL[k].n, 'hunt'); }
function drawTile(G) {
  if (!G.pool.length) { var back = G.drawn.filter(function (t) { return !t.sp; }); G.drawn = G.drawn.filter(function (t) { return t.sp; }); G.pool = back; log(G, null, 'The hunt pool is refilled', 'hunt'); }
  if (!G.pool.length) return { v: 0, r: 0 };
  var i = Math.floor(rngNext(G) * G.pool.length), t = G.pool.splice(i, 1)[0]; G.drawn.push(t); G.stats.tiles++; return t;
}
function rerollReasons(G) {
  var rid = G.F.loc, g = guideOf(G), n = [];
  if (REG[rid].set === 'strong' && controller(G, rid) === 'G') n.push('stronghold');
  if (armyAt(G, rid, 'G') && !(g === 'brokk')) n.push('army');
  if (((G.A[rid] && G.A[rid].pt && G.A[rid].pt[2] > 0) || G.C.marshal === rid) && !(g === 'sylwen') && !tableHas(G, 'watch')) n.push('riders');
  if (tableHas(G, 'net')) n.push('net');
  return n;
}
function companyMove(G, byCard) {   // one step: hunt roll (or road tile)
  G.F.tried = true;
  if (G.F.road >= 0) { if (!byCard) G.hb.d++; var t = drawTile(G); resolveTile(G, t, 'road'); return; }
  G.F.prog++; G.F.moved++; log(G, 'D', 'The Company moves on (step ' + G.F.prog + ')', 'company');
  var n = Math.min(5, G.hb.g), need = 6 - G.hb.d, hits = 0, rolls = [];
  if (n > 0) {
    var rr = rerollReasons(G).length;
    for (var i = 0; i < n; i++) { var r = d6(G); var ok = r !== 1 && r >= need; if (!ok && rr > 0) { rr--; r = d6(G); ok = r !== 1 && r >= need; } rolls.push(r); if (ok) hits++; }
    G.stats.hunts++;
  }
  if (!byCard) G.hb.d++;
  ev(G, { k: 'hunt', rolls: rolls, need: need, hits: hits });
  if (hits > 0 && tableHas(G, 'vigil') && guideOf(G) === 'orrin') { tableDrop(G, 'vigil'); log(G, 'D', 'Lamplight Vigil: the Hunt finds nothing', 'hunt'); }
  else if (hits > 0) { var t2 = drawTile(G); log(G, 'G', 'The Hunt finds them (' + hits + ' hit' + (hits > 1 ? 's' : '') + ')', 'hunt'); resolveTile(G, t2, 'hunt', hits); }
  else if (n > 0) log(G, 'D', 'The Hunt misses', 'hunt');
}
function tileDamage(G, t, why, hits) {
  if (t.v === 'eye') return why === 'road' ? G.hb.g + G.hb.d : why === 'hunt' ? hits : 0;
  if (t.v === 'die') return d6(G);
  return t.v;
}
function resolveTile(G, t, why, hits) {
  var dmg = tileDamage(G, t, why, hits), g = guideOf(G), reveal = !!t.r;
  if (g === 'kestrel' && typeof t.v === 'number' && t.v >= 0 && !t.sp) reveal = false;
  if (G.F.declared && dawnHold(G, G.F.loc) && G.F.prog === 0) reveal = false;
  if (reveal && tableHas(G, 'backroads')) { reveal = false; tableDrop(G, 'backroads'); }
  if (dmg >= 2 && g === 'darian' && !G.flags.turn.darian) { dmg--; G.flags.turn.darian = 1; }
  dmg = tableHuntMods(G, t, dmg);
  ev(G, { k: 'tile', t: t, dmg: dmg, why: why });
  log(G, 'G', 'Hunt tile: ' + tileName(t) + (dmg !== 0 ? ' (' + (dmg > 0 ? dmg + ' taint' : 'heal ' + (-dmg)) + ')' : ''), 'tile');
  var step = why === 'road' && !t.stop;
  if (dmg < 0) { G.F.taint = Math.max(0, G.F.taint + dmg); dmg = 0; }
  G.pend = { h: 'damage', side: 'D', d: { dmg: dmg, reveal: reveal, step: step, why: why, back: G.pend } };
  if (dmg === 0) finishDamage(G);
}
function tileName(t) { if (t.sp) return HUNT_SPECIAL[t.sp].n; return (t.v === 'eye' ? 'the Gaze' : t.v === 'die' ? 'a die' : String(t.v)) + (t.r ? ' + reveal' : ''); }
function killChar(G, c, why) {
  var was = G.C[c]; G.C[c] = 'dead'; log(G, CHARS[c].side || 'D', CHARS[c].n + ' falls' + (why ? ' (' + why + ')' : ''), 'death'); ev(G, { k: 'death', c: c, rid: was });
  if (was === 'F') fixGuide(G);
}
function absorb(G, c) {
  var p = G.pend.d; var lv = CHARS[c].lv; killChar(G, c, 'hunt'); p.dmg = Math.max(0, p.dmg - lv); finishDamage(G);
}
function finishDamage(G) {
  var p = G.pend.d; G.pend = p.back || null;
  if (p.dmg > 0) { G.F.taint = Math.min(TAINT_MAX, G.F.taint + p.dmg); log(G, 'D', '+' + p.dmg + ' taint (' + G.F.taint + '/12)', 'taint'); }
  if (checkRingWin(G)) return;
  if (p.step) { G.F.road++; log(G, 'D', 'Ashen Road step ' + G.F.road + ' of ' + ROAD_STEPS, 'company'); if (checkRingWin(G)) return; }
  if (p.reveal && G.F.road < 0) revealCompany(G); else if (p.reveal) { G.F.hid = false; log(G, 'D', 'The Company is revealed', 'reveal'); }
  if (G.pend && G.pend.h === 'damage' && G.pend.d.dmg === 0) finishDamage(G);
}
function revealTargets(G) {
  var d = companyDist(G, G.F.loc, Math.max(0, G.F.prog - (guideOf(G) === 'hobb' ? 1 : 0)));
  var t = Object.keys(d).filter(function (r) { return !dawnHold(G, r); }); if (!t.length) t = [G.F.loc]; return t;
}
function revealCompany(G) {
  G.F.hid = false; log(G, 'D', 'The Company is revealed', 'reveal'); ev(G, { k: 'reveal' });
  var t = revealTargets(G);
  if (t.length === 1 || G.F.prog === 0) { placeRevealed(G, t[0]); return; }
  G.pend = { h: 'reveal', side: 'D', d: { back: G.pend } };
}
function placeRevealed(G, rid) {
  var from = G.F.loc; G.F.loc = rid; G.F.prog = 0; ev(G, { k: 'company', rid: rid });
  [from, rid].filter(function (x, i, a) { return a.indexOf(x) === i; }).forEach(function (x) {
    if (REG[x].set === 'strong' && controller(G, x) === 'G' && !G.win) { var t = drawTile(G); log(G, 'G', 'The stronghold of ' + REG[x].n + ' sees them', 'hunt'); resolveTile(G, t, 'strong', 0); }
  });
}
function separate(G, cs, to) {
  cs.forEach(function (c) { G.C[c] = to; activateByChar(G, c, to); }); fixGuide(G);
  log(G, 'D', cs.map(function (c) { return CHARS[c].short; }).join(' and ') + ' leave the Company for ' + REG[to].n, 'comp'); ev(G, { k: 'charmove', cs: cs, to: to, from: G.F.loc });
}
function activateByChar(G, c, rid) {
  var r = REG[rid]; if (!r.nat || natSide(r.nat) !== 'D' || !(r.set === 'city' || r.set === 'strong') || controller(G, rid) !== 'D') return;
  var cn = CHARS[c].nat; if (!cn || cn === r.nat) wake(G, r.nat, CHARS[c].short + ' arrives');
}
function sepTargets(G, cs) { var lv = Math.max.apply(null, cs.map(function (c) { return CHARS[c].lv; })); var d = dist(G.F.loc, G.F.prog + lv, function (x) { return !(REG[x].set === 'strong' && controller(G, x) === 'G'); }); return Object.keys(d); }
function charTargets(G, c) {
  var lv = CHARS[c].lv; if (c === 'kindled' && !anyAt(G, G.C[c], 'D')) lv = 4;
  if (lv <= 0) return [];
  var side = CHARS[c].side || 'D';
  if (c === 'marshal') return REGIONS.map(function (r) { return r.id; }).filter(function (r) { return riderOK(G, r); });
  var d = dist(G.C[c], lv, function (x) { return side === 'G' ? !armyAt(G, x, 'D') || c === 'voice' : !(REG[x].set === 'strong' && controller(G, x) === 'G'); });
  return Object.keys(d).filter(function (r) { return r !== G.C[c] && (side === 'D' || riderOK(G, r)); });
}
function riderOK(G, rid) { return !(REG[rid].set === 'strong' && controller(G, rid) === 'D' && !(inAt(G, rid) && armyAt(G, rid, 'G'))); }

// ---------------------------------------------------------------- recruiting
function recruitSpots(G, side, k, evt) {   // k: 'r' | 'e' | 'l'
  var res = [];
  REGIONS.forEach(function (r) {
    if (!isSettle(r.id) || !r.nat || natSide(r.nat) !== side || controller(G, r.id) !== side) return;
    var n = r.nat; if (!evt && !atWar(G, n)) return; if (!evt && besieged(G, r.id)) return; if (armyAt(G, r.id, other(side))) return;
    var ki = k === 'r' ? 0 : k === 'e' ? 1 : 2; if (G.R[n][ki] <= 0) return;
    if (k === 'l' && n === 'pt' && r.set !== 'strong') return;
    if (k !== 'l' && units(G.A[r.id]) >= 10) return;
    res.push(r.id);
  });
  return res;
}
function recruit(G, rid, k, nat) {
  var n = nat || REG[rid].nat, ki = k === 'r' ? 0 : k === 'e' ? 1 : 2; if (G.R[n][ki] <= 0) return false;
  G.R[n][ki]--; var where = besieged(G, rid) && controller(G, rid) === natSide(n) && !armyAt(G, rid, natSide(n)) ? 'IN' : 'A';
  addUnits(G, where, rid, n, ki === 0 ? 1 : 0, ki === 1 ? 1 : 0, ki === 2 ? 1 : 0);
  log(G, natSide(n), NATIONS[n].short + ' ' + ['regular', 'elite', n === 'pt' ? 'Gloamrider' : 'leader'][ki] + ' joins at ' + REG[rid].n, 'recruit');
  ev(G, { k: 'recruit', rid: rid, nat: n, u: k }); return true;
}

// ---------------------------------------------------------------- dice actions
function faceAllows(f, side) {   // which action kinds a face gives
  var m = { C: ['C', 'E0'], A: ['A'], M: ['M'], X: ['A', 'M'], E: ['E'], W: ['C', 'A', 'M', 'E', 'W'] }; return m[f] || [];
}
function playable(G, side, cid, kinds) {   // a card from hand is playable with these die kinds
  var c = CARD[cid]; if (!c) return false; if (kinds.indexOf('E') < 0 && kinds.indexOf(c.type) < 0) return false;
  return cardPre(G, side, c);
}
function moveArmyTargets(G, side, from, needLeader) {
  var a = G.A[from]; if (!a || armySide(a) !== side || units(a) === 0) return [];
  if (needLeader && !hasLeader(G, from, side)) return [];
  return adj(from).filter(function (to) { return canEnter(G, side, to) && units(G.A[to]) + units(a) <= 10 + (armyAt(G, to, side) ? 0 : 10) && belligerentOK(G, a, to); });
}
function hasLeader(G, rid, side) { return leaders(anyAt(G, rid, side)) > 0 || charsAt(G, rid, side).some(function (c) { return CHARS[c].ld > 0; }); }
function armiesOf(G, side) { return Object.keys(G.A).filter(function (r) { return armyAt(G, r, side); }); }
function canAttackFrom(G, side, from) { var a = G.A[from]; return a && armySide(a) === side && natsIn(a).some(function (n) { return atWar(G, n); }) && units(atWarPart(G, a)) > 0; }
function atWarPart(G, a) { var r = {}; natsIn(a).forEach(function (n) { if (atWar(G, n)) r[n] = a[n]; }); return r; }
function attackTargets(G, side, from, needLeader) {
  if (!canAttackFrom(G, side, from)) return [];
  if (needLeader && !hasLeader(G, from, side)) return [];
  var t = adj(from).filter(function (to) { return armyAt(G, to, other(side)); });
  if (inAt(G, from) && armySide(G.IN[from]) === other(side)) t.push(from);   // siege battle against the garrison
  return t;
}
function sortieTargets(G, side) { return Object.keys(G.IN).filter(function (r) { return inAt(G, r) && armySide(G.IN[r]) === side && armyAt(G, r, other(side)) && natsIn(G.IN[r]).some(function (n) { return atWar(G, n); }); }); }
function minionOK(G, c) {
  if (G.C[c] !== 'out') return null;
  if (c === 'vael') return atWar(G, 'cv') && controller(G, 'corvel') === 'G' ? ['corvel'] : null;
  if (c === 'marshal') { if (!atWar(G, 'pt') || !['gr', 'df', 'au', 'hl', 'va'].some(function (n) { return atWar(G, n); })) return null; var r = Object.keys(G.A).filter(function (x) { return G.A[x].pt && G.A[x].pt[0] + G.A[x].pt[1] > 0; }); return r.length ? r : null; }
  if (c === 'voice') { if (!atWar(G, 'pt') || !(G.F.road >= 0 || REGIONS.some(function (r) { return r.set === 'strong' && ownerSide(r.id) === 'D' && G.ctl[r.id] === 'G'; }))) return null; var s = REGIONS.filter(function (r) { return r.set === 'strong' && r.nat === 'pt' && controller(G, r.id) === 'G'; }).map(function (r) { return r.id; }); return s.length ? s : null; }
  return null;
}
function heroOK(G, c) {
  if (c === 'queen') { var k = G.C.kestrel; return G.C.queen === 'out' && ['citadel', 'seawatch', 'brinemouth'].indexOf(k) >= 0 && controller(G, k) === 'D' ? [k] : null; }
  if (c === 'kindled') {
    if (G.C.kindled !== 'out' || G.C.orrin === 'F' || !(G.minionSeen || MINIONS.some(function (m) { return G.C[m] !== 'out'; }))) return null;
    var sp = G.C.orrin !== 'dead' ? [G.C.orrin] : ['whisperwood'].concat(['sailhaven', 'lanternvale', 'silverbough', 'oakthrone'].filter(function (r) { return controller(G, r) === 'D'; })); return sp;
  }
  return null;
}
// list the actions a die (or Will face as) allows: returns [{a, ...}]
function dieActions(G, side, i, asFace) {
  var f = asFace || G.dice[side][i], out = [], k = faceAllows(f, side), self = function (o) { o.t = 'die'; o.i = i; if (asFace) o.as = asFace; out.push(o); };
  if (f === 'W' && !asFace) {
    ['C', 'A', 'M', 'E'].forEach(function (x) { dieActions(G, side, i, x).forEach(function (o) { out.push(o); }); });
    ['queen', 'kindled'].forEach(function (c) { var sp = heroOK(G, c); if (sp) sp.forEach(function (r) { self({ a: 'hero', c: c, to: r }); }); });
    self({ a: 'skip' }); return out;
  }
  if (f === 'C') {
    if (side === 'D') {
      if (G.F.hid) self({ a: 'cmove' }); else self({ a: 'chide' });
      if (G.F.road < 0 && companions(G).length) self({ a: 'csep' });
      if (COMPANIONS.concat(['queen', 'kindled']).some(function (c) { return isOnMap(G, c) && charTargets(G, c).length; })) self({ a: 'charmove' });
    } else {
      if (riderList(G).length) self({ a: 'nzmove' });
    }
    armiesOf(G, side).forEach(function (r) { if (moveArmyTargets(G, side, r, true).length) self({ a: 'lmove', from: r }); if (attackTargets(G, side, r, true).length) self({ a: 'lattack', from: r }); });
  }
  if (k.indexOf('A') >= 0) {
    if (armiesOf(G, side).some(function (r) { return moveArmyTargets(G, side, r).length; })) self({ a: 'amove' });
    armiesOf(G, side).concat(Object.keys(G.IN).filter(function (r) { return inAt(G, r) && armySide(G.IN[r]) === side; })).forEach(function (r) { if (attackTargets(G, side, r).length) self({ a: 'attack', from: r }); });
    sortieTargets(G, side).forEach(function (r) { self({ a: 'sortie', from: r }); });
  }
  if (k.indexOf('M') >= 0) {
    NAT_ORDER.forEach(function (n) { if (natSide(n) === side && G.pol[n].s > 0 && !(G.pol[n].s === 1 && !G.pol[n].a) && !(side === 'D' && (tableHas(G, 'bribes') || n === 'va' && tableHas(G, 'sermon')))) self({ a: 'dip', n: n }); });
    if (['r', 'e', 'l'].some(function (u) { return recruitSpots(G, side, u).length; })) self({ a: 'recruit' });
    if (side === 'G') MINIONS.forEach(function (c) { var sp = minionOK(G, c); if (sp) sp.forEach(function (r) { self({ a: 'minion', c: c, to: r }); }); });
  }
  if (f === 'E') { ['C', 'S'].forEach(function (d) { if (G.deck[side + d].length) self({ a: 'draw', d: side + d }); }); }
  var kinds = f === 'E' ? ['E'] : f === 'C' ? ['C'] : k;
  G.hand[side].forEach(function (cid, hi) { if (playable(G, side, cid, kinds)) self({ a: 'card', c: cid }); });
  self({ a: 'skip' });
  return out;
}
function isOnMap(G, c) { var l = G.C[c]; return l && l !== 'F' && l !== 'out' && l !== 'dead'; }
function riderList(G) { var r = []; Object.keys(G.A).forEach(function (x) { if (G.A[x].pt && G.A[x].pt[2] > 0) r.push(x); }); return r.concat(['marshal', 'voice'].filter(function (c) { return isOnMap(G, c); }).map(function (c) { return 'c:' + c; })); }

// ---------------------------------------------------------------- moves
function validMoves(G) {
  if (G.win) return [];
  var s = sideToAct(G), out = [];
  if (G.pend) return pendMoves(G);
  if (G.phase === 'company') {
    out.push({ t: 'cdone' });
    if (!G.F.declared) declareTargets(G).forEach(function (r) { out.push({ t: 'declare', to: r }); });
    if (G.F.road < 0 && (G.F.loc === 'wraithpass' || G.F.loc === 'blackgate')) out.push({ t: 'road' });
    companions(G).forEach(function (c) { if (c !== G.F.guide && CHARS[c].lv === Math.max.apply(null, companions(G).map(function (x) { return CHARS[x].lv; }))) out.push({ t: 'guide', c: c }); });
    return out;
  }
  if (G.phase === 'hunt') { var hr = huntRange(G); for (var n = hr[0]; n <= hr[1]; n++) out.push({ t: 'hunt', n: n }); return out; }
  if (G.phase === 'act') {
    G.dice[s].forEach(function (f, i) { if (!G.used[s][i]) dieActions(G, s, i).forEach(function (o) { out.push(o); }); });
    if (G.lamps[s] > 0 && !G.lampUsed[s]) G.dice[s].forEach(function (f, i) { if (!G.used[s][i]) (s === 'D' ? ['C', 'A', 'M', 'X', 'E'] : ['C', 'A', 'M', 'E', 'Y']).forEach(function (to) { if (to !== f) out.push({ t: 'lamp', i: i, f: to }); }); });
    if (left(G, s) < left(G, other(s))) out.push({ t: 'pass' });
    return out;
  }
  return out;
}
function pendMoves(G) {
  var p = G.pend, s = p.side, d = p.d, out = [];
  switch (p.h) {
    case 'discard': G.hand[s].forEach(function (c) { out.push({ t: 'discard', c: c }); }); break;
    case 'damage': out.push({ t: 'taint' }); if (d.dmg > 0 && companions(G).length) { var g = guideOf(G); if (g && g !== 'wretch') out.push({ t: 'absorb', c: g }); out.push({ t: 'absorb', c: 'random' }); } break;
    case 'reveal': revealTargets(G).forEach(function (r) { out.push({ t: 'place', to: r }); }); break;
    case 'amove': armiesOf(G, s).forEach(function (r) { if (d.moved.indexOf(r) >= 0 || d.only && r !== d.only || d.nat && !(G.A[r][d.nat])) return; moveArmyTargets(G, s, r, d.lead).forEach(function (to) { splits(G.A[r], d.lead).forEach(function (u) { out.push({ t: 'mv', from: r, to: to, u: u }); }); }); }); if (d.n > 0 || d.lead) out.push({ t: 'mvdone' }); break;
    case 'attack': attackTargets(G, s, d.from, d.lead).forEach(function (to) { out.push({ t: 'atk', to: to }); }); out.push({ t: 'cancel' }); break;
    case 'recruit': recruitOpts(G, s, d).forEach(function (o) { out.push(o); }); if (d.got.length) out.push({ t: 'recdone' }); break;
    case 'sep': companions(G).forEach(function (c) { sepTargets(G, [c]).forEach(function (r) { out.push({ t: 'sep', cs: [c], to: r }); }); }); if (companions(G).length > 1) sepTargets(G, companions(G)).forEach(function (r) { out.push({ t: 'sep', cs: companions(G), to: r }); }); break;
    case 'charmove': COMPANIONS.concat(['queen', 'kindled']).forEach(function (c) { if (isOnMap(G, c) && d.done.indexOf(c) < 0) charTargets(G, c).forEach(function (r) { out.push({ t: 'cm', c: c, to: r }); }); }); out.push({ t: 'cmdone' }); break;
    case 'nzmove': nzOpts(G, d).forEach(function (o) { out.push(o); }); out.push({ t: 'nzdone' }); break;
    case 'battle': battleMoves(G).forEach(function (o) { out.push(o); }); break;
    case 'effect': effectMoves(G).forEach(function (o) { out.push(o); }); break;
  }
  return out;
}
function splits(a, lead) {   // representative ways to move an army: everything, or leave a rearguard of one regular
  var all = {}, keep = null, n; for (n in a) all[n] = a[n].slice();
  var out = [all];
  var u = units(a); if (u >= 2) { for (n in a) if (a[n][0] > 0) { keep = {}; for (var m in a) keep[m] = a[m].slice(); keep[n][0]--; if (keep[n][0] + keep[n][1] + keep[n][2] === 0) delete keep[n]; break; } if (keep) out.push(keep); }
  return out;
}
function recruitOpts(G, s, d) {   // muster: 1 elite | 2 regulars | 2 leaders | 1 regular + 1 leader, each in a different settlement
  var out = [], got = d.got, kinds = got.length === 0 ? ['e', 'r', 'l'] : got[0].k === 'e' ? [] : got.length >= 2 ? [] : got[0].k === 'r' ? ['r', 'l'] : ['r', 'l'];
  kinds.forEach(function (k) { recruitSpots(G, s, k, d.evt).forEach(function (rid) { if (got.some(function (x) { return x.rid === rid; }) && !d.same) return; out.push({ t: 'rec', rid: rid, k: k }); }); });
  return out;
}
function nzOpts(G, d) {
  var out = [], dests = REGIONS.map(function (r) { return r.id; }).filter(function (r) { return riderOK(G, r); });
  Object.keys(G.A).forEach(function (x) { var a = G.A[x]; if (a.pt && a.pt[2] > 0 && (d.moved[x] || 0) < a.pt[2] - (d.arrived[x] || 0)) dests.forEach(function (to) { if (to !== x) out.push({ t: 'nz', from: x, to: to }); }); });
  ['marshal', 'voice'].forEach(function (c) { if (isOnMap(G, c) && d.done.indexOf(c) < 0) charTargets(G, c).forEach(function (to) { out.push({ t: 'cm', c: c, to: to }); }); });
  return out;
}
function useDie(G, s, i) { G.used[s][i] = true; }
function endPend(G) { var b = G.pend && G.pend.d && G.pend.d.back || null; G.pend = b; if (b && b.h === 'effect') runEffects(G); }

function performMove(G, mv) {
  var s = sideToAct(G); G.ev = [];
  if (G.pend) return performPend(G, mv);
  switch (mv.t) {
    case 'cdone': G.phase = 'hunt'; G.act = 'G'; if (huntRange(G)[1] === 0) { G.phase = 'act'; rollDice(G); } break;
    case 'declare': declare(G, mv.to); break;
    case 'road': enterRoad(G); break;
    case 'guide': G.F.guide = mv.c; log(G, 'D', CHARS[mv.c].short + ' now guides the Company', 'comp'); break;
    case 'hunt': G.hb.g = mv.n; log(G, 'G', mv.n + ' ' + (mv.n === 1 ? 'die' : 'dice') + ' to the Hunt', 'hunt'); rollDice(G); break;
    case 'pass': log(G, s, (s === 'D' ? 'Dawn' : 'Gloam') + ' passes', 'pass'); nextActor(G); break;
    case 'lamp': G.dice[s][mv.i] = mv.f; G.lampUsed[s] = 1; G.lamps[s]--; if (s === 'D') G.lamps.G++;
      log(G, s, s === 'D' ? 'A Lamp of Dawn turns a die to ' + FACE_NAME[mv.f] : 'A Shuttered Lamp turns a die to the Gaze', 'lamp');
      if (mv.f === 'Y') { G.dice.G.splice(mv.i, 1); G.used.G.splice(mv.i, 1); G.hb.g++; if (left(G, 'G') === 0) nextActor(G); } break;
    case 'die': doDie(G, s, mv); break;
  }
  return G;
}
function afterAction(G) { if (G.win) return; if (!G.pend) nextActor(G); }
function doDie(G, s, mv) {
  useDie(G, s, mv.i); var f = mv.as || G.dice[s][mv.i];
  switch (mv.a) {
    case 'skip': log(G, s, 'A die is set aside', 'skip'); break;
    case 'cmove': companyMove(G); break;
    case 'chide': G.F.hid = true; G.F.tried = true; log(G, 'D', 'The Company hides again', 'company'); break;
    case 'csep': G.pend = { h: 'sep', side: s, d: {} }; break;
    case 'charmove': G.pend = { h: 'charmove', side: s, d: { done: [] } }; break;
    case 'nzmove': G.pend = { h: 'nzmove', side: s, d: { moved: {}, arrived: {}, done: [] } }; break;
    case 'lmove': G.pend = { h: 'amove', side: s, d: { n: 0, max: 1, moved: [], lead: true, only: mv.from } }; break;
    case 'amove': G.pend = { h: 'amove', side: s, d: { n: 0, max: 2, moved: [] } }; break;
    case 'lattack': case 'attack': G.pend = { h: 'attack', side: s, d: { from: mv.from, lead: mv.a === 'lattack' } }; break;
    case 'sortie': startBattle(G, s, mv.from, mv.from, null, { sortie: true }); break;
    case 'dip': polStep(G, mv.n, 1, 'dip'); log(G, s, 'Envoys stir ' + NATIONS[mv.n].n + ' (' + polText(G, mv.n) + ')', 'pol'); ev(G, { k: 'pol', n: mv.n }); break;
    case 'recruit': G.pend = { h: 'recruit', side: s, d: { got: [] } }; break;
    case 'minion': G.C[mv.c] = mv.to; G.minionSeen = 1; log(G, 'G', CHARS[mv.c].n + ' enters the war at ' + REG[mv.to].n, 'minion'); ev(G, { k: 'char', c: mv.c, rid: mv.to }); break;
    case 'hero': if (mv.c === 'queen') { G.C.kestrel = 'dead'; } else { if (G.C.orrin !== 'F') G.C.orrin = 'dead'; } G.C[mv.c] = mv.to;
      log(G, 'D', CHARS[mv.c].n + ' rises at ' + REG[mv.to].n, 'hero'); ev(G, { k: 'char', c: mv.c, rid: mv.to }); break;
    case 'draw': drawCard(G, s, mv.d); log(G, s, (s === 'D' ? 'Dawn' : 'Gloam') + ' draws a card', 'draw'); if (handLimit(G, s)) return; break;
    case 'card': playCard(G, s, mv.c, f); break;
  }
  if (mv.a === 'card' && f === 'E' && s === 'D' && guideOf(G) === 'orrin' && !G.win) { var deck = CARD[mv.c].deck; drawCard(G, 'D', deck); log(G, 'D', 'Orrin finds another card', 'draw'); handLimit(G, 'D'); }
  if (mv.as === 'M' && mv.a === 'recruit' && s === 'G') { }
  afterAction(G);
}
function polText(G, n) { var p = G.pol[n]; return p.s === 0 ? 'at war' : p.s + ' from war' + (p.a ? '' : ', asleep'); }
function performPend(G, mv) {
  var p = G.pend, s = p.side, d = p.d;
  switch (mv.t) {
    case 'discard': G.hand[s].splice(G.hand[s].indexOf(mv.c), 1); G.disc.push(mv.c); log(G, s, 'A card is discarded', 'discard'); if (G.hand[s].length <= 6) { G.pend = d.back || null; if (!G.pend && G.phase === 'company') { handLimit(G, 'G'); return G; } if (G.pend && G.pend.h === 'effect') runEffects(G); if (!G.pend && G.phase === 'act') afterAction(G); } return G;
    case 'taint': finishDamage(G); break;
    case 'absorb': var c = mv.c === 'random' ? companions(G)[Math.floor(rngNext(G) * companions(G).length)] : mv.c; absorb(G, c); break;
    case 'place': G.pend = d.back || null; placeRevealed(G, mv.to); break;
    case 'mv': moveArmy(G, s, mv.from, mv.to, mv.u); d.n++; d.moved.push(mv.to); if (d.n >= d.max || !pendMoves(G).some(function (o) { return o.t === 'mv'; })) endPend(G); break;
    case 'mvdone': endPend(G); break;
    case 'atk': var bk = d.back || null; G.pend = null; startBattle(G, s, d.from, mv.to, null, { lead: d.lead, back: bk, evt: d.evt }); if (!G.pend) { G.pend = bk; if (G.pend && G.pend.h === 'effect') runEffects(G); } return G;
    case 'cancel': endPend(G); break;
    case 'rec': recruit(G, mv.rid, mv.k); d.got.push({ rid: mv.rid, k: mv.k }); if (mv.k === 'e' || d.got.length >= 2 || !recruitOpts(G, s, d).length) endPend(G); break;
    case 'recdone': endPend(G); break;
    case 'sep': G.pend = null; separate(G, mv.cs, mv.to); break;
    case 'cm': moveChar(G, mv.c, mv.to); d.done.push(mv.c); if (p.h === 'charmove' && !pendMoves(G).some(function (o) { return o.t === 'cm'; })) endPend(G); break;
    case 'cmdone': case 'nzdone': endPend(G); break;
    case 'nz': moveRider(G, mv.from, mv.to); d.moved[mv.from] = (d.moved[mv.from] || 0) + 1; d.arrived[mv.to] = (d.arrived[mv.to] || 0) + 1; break;
    default:
      if (p.h === 'battle') { battleMove(G, mv); return G; }
      if (p.h === 'effect') { effectMove(G, mv); if (!G.pend && !G.win) afterAction(G); return G; }
  }
  if (!G.pend && !G.win && G.phase === 'act') afterAction(G);
  return G;
}
function moveChar(G, c, to) { var from = G.C[c]; G.C[c] = to; if ((CHARS[c].side || 'D') === 'D') activateByChar(G, c, to); log(G, CHARS[c].side || 'D', CHARS[c].short + ' goes to ' + REG[to].n, 'charmove'); ev(G, { k: 'charmove', cs: [c], from: from, to: to }); }
function moveRider(G, from, to) {
  G.A[from].pt[2]--; addUnits(G, 'A', to, 'pt', 0, 0, 1); clean(G, from);
  ev(G, { k: 'rider', from: from, to: to }); log(G, 'G', 'A Gloamrider flies to ' + REG[to].n, 'rider');
}
function moveArmy(G, s, from, to, u) {
  var a = G.A[from], dst = G.A[to] || (G.A[to] = {});
  for (var n in u) { var x = a[n]; if (!x) continue; var r = Math.min(u[n][0], x[0]), e = Math.min(u[n][1], x[1]), l = Math.min(u[n][2], x[2]); x[0] -= r; x[1] -= e; x[2] -= l; var y = dst[n] || (dst[n] = [0, 0, 0]); y[0] += r; y[1] += e; y[2] += l; }
  // characters travel with the army they lead
  charsAt(G, from, s).forEach(function (c) { if (c !== 'vael' && units(G.A[from]) === 0) G.C[c] = to; });
  clean(G, from);
  var tn = REG[to].nat; if (tn && natSide(tn) !== s) wake(G, tn, 'invaded');
  if (isSettle(to) && controller(G, to) !== s && !inAt(G, to)) capture(G, to, s);
  if (units(G.A[to]) > 10) trimStack(G, to);
  log(G, s, (s === 'D' ? 'Dawn' : 'Gloam') + ' army moves ' + REG[from].n + ' → ' + REG[to].n, 'move');
  ev(G, { k: 'move', from: from, to: to, s: s });
}
function trimStack(G, rid) { var a = G.A[rid]; while (units(a) > 10) { for (var n in a) { if (a[n][0] > 0) { a[n][0]--; loseUnit(G, n, 0); break; } if (a[n][1] > 0) { a[n][1]--; loseUnit(G, n, 1); break; } } } }
function loseUnit(G, n, ki) { if (natSide(n) === 'G') G.R[n][ki]++; else G.dead[n][ki]++; }

// ---------------------------------------------------------------- invariants (tests)
function checkInvariants(G) {
  var bad = [];
  var tot = {}; NAT_ORDER.forEach(function (n) { tot[n] = [G.R[n][0] + G.dead[n][0], G.R[n][1] + G.dead[n][1], G.R[n][2] + G.dead[n][2]]; });
  ['A', 'IN'].forEach(function (k) { for (var r in G[k]) { if (!REG[r]) bad.push('bad region ' + r); var a = G[k][r]; if (units(a) > 10) bad.push('stack>10 ' + r); if (k === 'IN' && units(a) > 5) bad.push('siege>5 ' + r); for (var n in a) for (var i = 0; i < 3; i++) { if (a[n][i] < 0) bad.push('neg ' + r); tot[n][i] += a[n][i]; } } });
  NAT_ORDER.forEach(function (n) { var s = SETUP, e = [0, 0, 0]; for (var r in s) if (s[r][n]) for (var i = 0; i < 3; i++) e[i] += s[r][n][i]; for (var j = 0; j < 3; j++) { e[j] += REINF[n][j]; if (e[j] !== tot[n][j]) bad.push('count ' + n + j + ' ' + tot[n][j] + '!=' + e[j]); } });
  if (G.F.taint < 0 || G.F.taint > 12) bad.push('taint ' + G.F.taint);
  var h = G.hand.D.length + G.hand.G.length + G.disc.length + G.table.D.length + G.table.G.length + G.deck.DC.length + G.deck.DS.length + G.deck.GC.length + G.deck.GS.length;
  for (var pp = G.pend; pp; pp = pp.d && pp.d.back) if (pp.h === 'battle') h += (pp.d.cards.att ? 1 : 0) + (pp.d.cards.def ? 1 : 0);
  if (h !== 96) bad.push('cards ' + h);
  if (G.pool.length + G.drawn.length + G.flags.removedTiles | 0 > 24) bad.push('tiles');
  return bad;
}
if (typeof module !== 'undefined') module.exports = {};

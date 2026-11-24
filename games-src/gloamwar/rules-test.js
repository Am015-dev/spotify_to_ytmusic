// Gloamwar rules test: component counts (COMPONENTS.md) and key rules (RULES-CHECKLIST.md). node rules-test.js
const W = require('./load.js')();
let pass = 0, fail = 0;
function ok(c, name) { if (c) pass++; else { fail++; console.log('FAIL', name); } }
function eq(a, b, name) { ok(JSON.stringify(a) === JSON.stringify(b), name + ' (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')'); }
const R = W.REGIONS, REG = W.REG;
// ---------------- components
eq(R.length, 104, 'regions');
ok(R.every(r => r.adj.every(a => REG[a].adj.indexOf(r.id) >= 0)), 'adjacency symmetric');
eq(Object.keys(W.dist('lanternvale', 99)).length, 104, 'map connected');
const cnt = (side, set) => R.filter(r => r.nat && W.NATIONS[r.nat].side === side && r.set === set).length;
eq([cnt('D', 'strong'), cnt('D', 'city'), cnt('G', 'strong'), cnt('G', 'city')], [8, 4, 8, 2], 'strongholds and cities per side');
eq(R.filter(r => r.set === 'fort').length, 2, 'fortifications');
const vpAvail = side => R.filter(r => r.nat && W.NATIONS[r.nat].side === side).reduce((t, r) => t + (W.VP[r.set] || 0), 0);
eq([vpAvail('D'), vpAvail('G')], [20, 18], 'victory points on the map');
eq(Object.keys(W.NATIONS).filter(n => W.NATIONS[n].side === 'D').length, 5, 'Dawn nations'); eq(Object.keys(W.NATIONS).filter(n => W.NATIONS[n].side === 'G').length, 3, 'Gloam nations');
eq(W.NAT_ORDER.map(n => W.NATIONS[n].pol), [3, 3, 2, 3, 3, 1, 1, 2], 'political start steps');
eq(W.NAT_ORDER.filter(n => W.NATIONS[n].act).sort(), ['cv', 'gr', 'pt', 'sh'], 'active at start: Greenhold + all Gloam');
const tot = {}; W.NAT_ORDER.forEach(n => { tot[n] = W.REINF[n].slice(); }); Object.values(W.SETUP).forEach(s => Object.keys(s).forEach(n => s[n].forEach((v, i) => tot[n][i] += v)));
const sum = (side, i) => W.NAT_ORDER.filter(n => W.NATIONS[n].side === side).reduce((t, n) => t + tot[n][i], 0);
eq([sum('D', 0), sum('D', 1), sum('D', 2)], [45, 30, 20], 'Dawn regulars, elites, leaders');
eq([sum('G', 0), sum('G', 1), tot.pt[2]], [72, 18, 8], 'Gloam regulars, elites, Gloamriders');
eq(W.NAT_ORDER.map(n => tot[n][0] + tot[n][1]), [15, 10, 20, 15, 15, 42, 18, 30], 'units per nation');
const faces = s => W.FACES[s].slice().sort().join('');
eq([faces('D'), faces('G')], ['CCEMWX', 'ACEMXY'], 'action die faces');
eq([W.DICE0.D, W.DICE0.G, W.DICEMAX.D, W.DICEMAX.G], [4, 7, 6, 10], 'dice start and max');
eq(W.HUNT_STD.length, 16, 'standard hunt tiles'); eq(Object.values(W.HUNT_SPECIAL).map(t => t.side).sort().join(''), 'DDDDGGGG', 'special hunt tiles 4 + 4');
ok(Object.values(W.HUNT_SPECIAL).filter(t => t.side === 'G').every(t => t.stop), 'every Gloam special tile stops a step');
eq(W.CARDS.length, 96, 'event cards'); ['DC', 'DS', 'GC', 'GS'].forEach(d => eq(W.CARDS.filter(c => c.deck === d).length, 24, d + ' size'));
ok(W.CARDS.filter(c => c.deck[1] === 'C').every(c => c.type === 'C'), 'character decks hold character cards');
['DS', 'GS'].forEach(d => eq([W.CARDS.filter(c => c.deck === d && c.type === 'M').length, W.CARDS.filter(c => c.deck === d && c.type === 'A').length], [12, 12], d + ' muster/army split'));
ok(W.CARDS.every(c => c.cb && c.cb.i >= 1 && c.cb.i <= 9 && c.cb.op), 'every card has a combat half');
eq(new Set(W.CARDS.map(c => c.n)).size >= 94, true, 'card titles nearly all unique');
eq(W.COMPANIONS.length, 7, 'companions'); eq(W.COMPANIONS.map(c => W.CHARS[c].lv), [3, 3, 2, 2, 2, 1, 1], 'companion levels'); eq(W.MINIONS.length, 3, 'minions');
eq(W.ROAD_STEPS, 5, 'Ashen Road steps'); eq(W.TAINT_MAX, 12, 'taint limit'); eq([W.VPWIN.G, W.VPWIN.D], [10, 4], 'military thresholds');
// ---------------- rules
function fresh(seed) { const G = W.newGame({ seed: seed || 7 }); return G; }
let G = fresh();
eq([G.hand.D.length, G.hand.G.length], [2, 2], 'turn 1: one card from each deck');
eq(W.huntRange(G), [0, 7], 'hunt allocation 0..companions on turn 1');
G.retrieved = 1; eq(W.huntRange(G)[0], 1, 'at least 1 hunt die after the Dawn retrieved one');
// passive nation stops one step short
G = fresh(); G.pol.au.s = 1; G.pol.au.a = false; W.polStep(G, 'au', 1, 'dip'); eq(G.pol.au.s, 1, 'sleeping nation cannot reach war');
G.pol.au.a = true; W.polStep(G, 'au', 1, 'dip'); eq(G.pol.au.s, 0, 'awake nation goes to war');
// attack wakes and steps the defender
G = fresh(); G.A.kettlecross = { hl: [1, 0, 0] }; G.A.wetherbarrow = { pt: [3, 0, 0] }; G.pol.pt.s = 0; G.phase = 'act'; G.dice.G = ['A']; G.used.G = [false];
W.startBattle(G, 'G', 'wetherbarrow', 'kettlecross', null, {}); ok(G.pol.hl.a && G.pol.hl.s === 2, 'attacked nation wakes and steps toward war');
// combat numbers with fixed dice
function fixed(v) { const old = W.d6; W.d6 = () => v; return () => { W.d6 = old; }; }
function battle(att, def, to, opts) { const G = fresh(); G.A = {}; G.IN = {}; G.A[opts && opts.from || 'wetherbarrow'] = att; if (opts && opts.inside) G.IN[to] = def; else G.A[to] = def; G.pol.pt.s = 0; G.pol.hl.s = 0; G.pol.hl.a = true; G.phase = 'act'; G.hand.D = []; G.hand.G = []; return G; }
let undo = fixed(5); G = battle({ pt: [3, 0, 0] }, { hl: [3, 0, 0] }, 'wrenhollow'); W.startBattle(G, 'G', 'wetherbarrow', 'kettlecross'.replace('kettlecross', 'tansytor'), null, {}); undo();
G = fresh(); G.A = { tansytor: { pt: [3, 0, 0] } }; G.A[W.REG.tansytor.adj[0]] = { hl: [3, 0, 0] }; G.pol.pt.s = 0; G.pol.hl.s = 0; G.pol.hl.a = true; G.hand.D = []; G.hand.G = []; G.phase = 'act';
undo = fixed(5); const tgt = W.REG.tansytor.adj[0]; W.startBattle(G, 'G', 'tansytor', tgt, null, {}); undo();
ok(!W.armyAt(G, tgt, 'D'), 'field battle: 5s hit (3 dice kill 3 regulars)');
G = fresh(); G.A = { wenhollow: null }; G.A = {}; const city = 'thistledown', from = W.REG.thistledown.adj[0]; G.A[from] = { pt: [3, 0, 0] }; G.A[city] = { hl: [3, 0, 0] }; G.pol.pt.s = 0; G.hand.D = []; G.hand.G = []; G.phase = 'act';
undo = fixed(5); W.startBattle(G, 'G', from, city, null, {}); undo(); eq(W.units(G.A[city]), 3, 'city: attacker needs 6 in round 1');
G = fresh(); G.A = {}; G.A.lanternvale = { pt: [4, 0, 0] }; G.IN = { lanternvale: { gr: [2, 0, 0] } }; G.pol.pt.s = 0; G.hand.D = []; G.hand.G = []; G.phase = 'act';
undo = fixed(5); W.startBattle(G, 'G', 'lanternvale', 'lanternvale', null, {}); undo(); eq(W.units(G.IN.lanternvale), 2, 'siege: attacker needs 6');
ok(G.pend && G.pend.h === 'battle' && G.pend.d.stage === 'extend', 'siege lasts one round unless an elite presses on');
// elite takes one hit -> regular
G = fresh(); const a = { va: [0, 1, 0] }; W.takeHits(G, a, 1, false, null, {}, false); eq(a.va, [1, 0, 0], 'one hit turns an elite into a regular');
const b2 = { va: [0, 1, 0] }; W.takeHits(G, b2, 2, false, null, {}, false); eq(b2.va, [0, 0, 0], 'two hits remove an elite');
// leader re-rolls capped at 5
undo = fixed(4); const rs = W.rollSide(G, 5, 5, 9, false); undo(); eq(rs.rr.length, 5, 'leader re-rolls capped at 5');
// stack limit and siege capacity
G = fresh(); G.A.wenhollow = undefined; G.A = { tansytor: { pt: [8, 0, 0] } }; const nb = W.REG.tansytor.adj[1]; G.A[nb] = { pt: [6, 0, 0] }; W.moveArmy(G, 'G', nb, 'tansytor', { pt: [6, 0, 0] }); ok(W.units(G.A.tansytor) <= 10, 'stack limit 10');
// company movement and the hunt
G = fresh(); G.phase = 'act'; G.hb = { g: 0, d: 0 }; W.companyMove(G); eq([G.F.prog, G.hb.d], [1, 1], 'a company move: one step, Dawn die into the hunt box');
G = fresh(); G.phase = 'act'; G.hb = { g: 3, d: 0 }; undo = fixed(6); G.pool = [{ v: 'eye', r: 0 }]; W.companyMove(G); undo(); ok(G.pend && G.pend.h === 'damage' && G.pend.d.dmg === 3, 'the Gaze tile deals one taint per hunt success');
G = fresh(); G.F.road = 0; G.F.loc = 'blackgate'; G.hb = { g: 2, d: 1 }; G.pool = [{ v: 'eye', r: 0 }]; W.companyMove(G); ok(G.pend && G.pend.d.dmg === 4, 'on the Ashen Road the Gaze counts every hunt-box die');
G = fresh(); G.F.road = 4; G.pool = [{ v: 0, r: 0 }]; W.companyMove(G); ok(G.win && G.win.side === 'D', 'fifth road step unmakes the Crown');
G = fresh(); G.F.taint = 11; G.F.taint += 1; W.checkRingWin(G); ok(G.win && G.win.side === 'G', '12 taint: Gloam wins');
G = fresh(); G.F.loc = 'blackgate'; eq(W.validMoves(G).some(m => m.t === 'road'), true, 'the Ashen Road starts at a gate');
G = fresh(); G.F.prog = 2; ok(W.declareTargets(G).length > 2, 'declare within the unseen steps');
// military victory checked at end of turn
G = fresh(); ['lanternvale', 'silverbough', 'oakthrone', 'sailhaven', 'brightwater'].forEach(r => G.ctl[r] = 'G'); eq(W.vpOf(G, 'G'), 9, 'VP count'); G.ctl.thistledown = 'G'; W.checkMilitary(G); ok(G.win && G.win.why === 'vp', '10 VP wins');
G = fresh(); G.ctl.hollowdeep = 'D'; G.ctl.cragmaw = 'D'; W.checkMilitary(G); ok(G.win && G.win.side === 'D', 'Dawn wins at 4 VP');
// recruitment only for nations at war, max per muster
G = fresh(); eq(W.recruitSpots(G, 'D', 'r').length, 0, 'no nation at war: no muster'); G.pol.au.s = 0; ok(W.recruitSpots(G, 'D', 'r').indexOf('citadel') >= 0, 'nation at war musters in its free settlements');
G.pend = { h: 'recruit', side: 'D', d: { got: [{ rid: 'citadel', k: 'e' }] } }; eq(W.recruitOpts(G, 'D', G.pend.d).length, 0, 'one elite ends the muster');
// non-belligerent borders
G = fresh(); const ta = W.moveArmyTargets(G, 'D', 'thistledown'); ok(ta.every(r => !W.REG[r].nat || W.REG[r].nat === 'hl'), 'nations not at war stay out of other nations');
// hand limit
G = fresh(); G.hand.D = ['dc01', 'dc02', 'dc03', 'dc04', 'dc05', 'dc06', 'dc07']; ok(W.handLimit(G, 'D') && G.pend.h === 'discard', 'hand limit 6');
// lamps
G = fresh(); G.phase = 'act'; G.dice.D = ['E']; G.used.D = [false]; G.act = 'D'; W.performMove(G, { t: 'lamp', i: 0, f: 'C' }); eq([G.dice.D[0], G.lamps.D, G.lamps.G], ['C', 2, 1], 'a used Lamp changes a die and passes to the Gloam');
ok(!W.validMoves(G).some(m => m.t === 'lamp'), 'one Lamp per turn');
// minion brings a die
G = fresh(); G.C.vael = 'corvel'; eq(W.diceCount(G, 'G'), 8, 'a minion adds a Gloam die');
// a full game finishes without errors
G = fresh(31); W.AI.s = 5; let k = 0; while (!G.win && k++ < 5000) { W.performMove(G, W.AI.move(G, 'normal')); const inv = W.checkInvariants(G); if (inv.length) { ok(false, 'invariants ' + inv[0]); break; } } ok(!!G.win, 'AI game ends with a winner (' + (G.win && G.win.why) + ', turn ' + G.turn + ')');
console.log(`rules-test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

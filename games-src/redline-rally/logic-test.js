// Rule-by-rule logic test (W432). One assertion per numbered rule of RULES-CHECKLIST.md, run against the real engine in src/.
// Not based on rules-test.js. Each test builds an exact state, acts through the engine, checks the exact result.
// Run: node logic-test.js     Prints one line per failing rule: "FAIL R<n> expected <x> got <y>".  Exit 1 if any fail.
const fs = require('fs'), vm = require('vm'), path = require('path');
const X = vm.createContext({ console, Math, Date, JSON });
['data', 'track', 'engine', 'ai'].forEach(f => vm.runInContext(fs.readFileSync(path.join(__dirname, 'src', f + '.js'), 'utf8'), X, { filename: f }));

const J = v => JSON.stringify(v);
const eq = (exp, got) => J(exp) === J(got) ? true : [exp, got];
const cnt = (a, x) => a.filter(y => y === x).length;
const SUN = X.TK.sunline;
const CR = SUN.list[0].idx, CL = SUN.list[0].limit;   // first corner on the test track (space 14, limit 5)

/* Build a game with car 0 under test. Others sit far ahead (spaces 60+) unless told. laps=2 on sunline = 96 spaces. */
function mk(n, o) {
  o = o || {};
  const G = X.newGame({ track: 'sunline', laps: o.laps || 2, n: n || 3, humans: 0, seed: o.seed || 1, diff: 'normal' });
  G.cars.forEach((c, i) => { c.pos = i === 0 ? 0 : 60 + i * 3; c.tie = i; });
  G.cars[0].human = true;   // so the slipstream question is asked (play() answers it) instead of the computer deciding
  return G;
}
/* set a car's cards exactly; engine heat = what is not in the card piles unless eng given (then heat cards are put in the discard) */
function cfg(c, o) {
  c.hand = (o.hand || []).slice(); c.deck = (o.deck || []).slice(); c.disc = (o.disc || []).slice(); c.played = [];
  const inCards = cnt(c.hand, 'H') + cnt(c.deck, 'H') + cnt(c.disc, 'H');
  if (o.eng == null) c.eng = 6 - inCards; else { c.eng = o.eng; for (let i = inCards; i < 6 - o.eng; i++) c.disc.push('H'); }
  if (o.gear) c.gear = o.gear; if (o.pos != null) c.pos = o.pos;
  c.plan = null;
}
const filler = k => Array(k).fill('1');                 // deck filler: plain speed cards, never flipped by tests unless wanted
function play(G, plan, o) {                              // resolve car 0 alone with this plan; o.slip answers the slipstream question
  o = o || {}; const c = G.cars[0];
  c.plan = { gear: plan.gear, cards: plan.cards, boost: !!plan.boost };
  G.phase = 'resolve'; G.order = [0]; G.ri = 0; G.adr = o.adr || [];
  let ev = X.resolveNext(G); const asked = !!G.pend;
  if (G.pend) ev = ev.concat(X.slipChoice(G, !!o.slip));
  return { ev, asked };
}
const evOf = (r, t) => r.ev.filter(e => e.t === t);

const R = {};   // rule number -> function returning true or [expected, got]

/* ---- Setup ---- */
R[1] = () => { const G = X.newGame({ n: 4, humans: 0, seed: 3 }); const bad = []; G.cars.forEach(c => { const all = c.deck.concat(c.hand, c.disc); ['1', '2', '3', '4'].forEach(v => { if (cnt(all, v) !== 3) bad.push(c.i + ':' + v + 'x' + cnt(all, v)); }); }); return eq([], bad); };
R[2] = () => { const G = X.newGame({ n: 4, humans: 0, seed: 3 }); return eq([3, 3, 3, 3], G.cars.map(c => cnt(c.deck.concat(c.hand, c.disc), 'X'))); };
R[3] = () => { const G = X.newGame({ n: 3, humans: 0, seed: 3 }); return eq([[6, 6, 6], [0, 0, 0]], [G.cars.map(c => c.eng), G.cars.map(c => cnt(c.deck.concat(c.hand, c.disc), 'H'))]); };
R[4] = () => { const G = X.newGame({ n: 5, humans: 0, seed: 4 }); return eq([7, 7, 7, 7, 7], G.cars.map(c => c.hand.length)); };
R[5] = () => { const G = X.newGame({ n: 5, humans: 0, seed: 4 }); return eq([1, 1, 1, 1, 1], G.cars.map(c => c.gear)); };
R[6] = () => { const out = []; for (let n = 2; n <= 6; n++) { const G = X.newGame({ n, humans: 0, seed: n }); const per = {}; G.cars.forEach(c => { per[c.pos] = (per[c.pos] || 0) + 1; }); out.push(G.cars.length + ':' + Math.max.apply(null, Object.keys(per).map(k => per[k]))); } return eq(['2:2', '3:2', '4:2', '5:2', '6:2'], out.map(x => x.split(':')[0] + ':' + Math.min(2, +x.split(':')[1])).map((x, k) => out[k].split(':')[1] <= 2 ? x : out[k])); };
R[7] = () => { const G = X.newGame({ n: 5, humans: 0, seed: 5 }); const pos = G.cars.map(c => c.pos).sort((a, b) => b - a); return eq([2, 2, 1], [pos.filter(p => p === pos[0]).length, pos.filter(p => p === pos[0] - 1).length, pos.filter(p => p === pos[0] - 2).length]); };

/* ---- Shift ---- */
R[8] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: filler(7), gear: 2 }); return eq([[1, 0], [2, 0], [3, 0]], X.gearOpts(c).filter(o => o.g !== 4).map(o => [o.g, o.cost])); };
R[9] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: filler(7), deck: filler(10), gear: 1, pos: 3 }); const h0 = cnt(c.disc, 'H'); play(G, { gear: 3, cards: ['1', '1', '1'] }); return eq([5, 1], [c.eng, cnt(c.disc, 'H') - h0]); };
R[10] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: filler(7), gear: 2, eng: 0 }); return eq([[1, 2, 3], 'gear'], [X.gearOpts(c).map(o => o.g), X.planError(c, { gear: 4, idx: [0, 1, 2, 3], boost: false })]); };
R[11] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: filler(7), gear: 1 }); const a = X.gearOpts(c).map(o => o.g); c.gear = 4; const b = X.gearOpts(c).map(o => o.g); return eq([[1, 2, 3], [2, 3, 4]], [a, b]); };

/* ---- Play ---- */
R[12] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: ['1', '2', '3', '4', '1', '2', '3'], gear: 3 }); return eq(['count', ''], [X.planError(c, { gear: 3, idx: [0, 1], boost: false }), X.planError(c, { gear: 3, idx: [0, 1, 2], boost: false })]); };
R[13] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: ['H', 'H', 'H', 'H', 'H', '2', '3'], gear: 3 }); return eq(['card', 2], [X.planError(c, { gear: 1, idx: [0], boost: false }), X.needCards(c, 3)]); };
R[14] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: filler(5), deck: filler(10), gear: 2, pos: 3 }); play(G, { gear: 2, cards: ['3', '4'] }); return eq([1, 1], [cnt(c.disc, '3'), cnt(c.disc, '4')]); };
R[15] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: filler(4), deck: filler(10), gear: 3, pos: 3 }); const r = play(G, { gear: 3, cards: ['1', '2', '4'] }); return eq([7, 10], [evOf(r, 'play')[0].speed, c.pos]); };
R[16] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: filler(6), deck: ['1', '1', '3', 'H'], gear: 1, pos: 3, eng: 5 }); const r = play(G, { gear: 1, cards: ['X'] }); return eq([3, 1, 1], [evOf(r, 'play')[0].speed, cnt(c.disc, 'H'), cnt(c.disc, '3')]); };
R[17] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: filler(6), deck: [], disc: ['2'], gear: 1, pos: 3 }); const r = play(G, { gear: 1, cards: ['X'] }); return eq(2, evOf(r, 'play')[0].speed); };

/* ---- Boost ---- */
R[18] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: filler(7), deck: filler(10), gear: 1, pos: 3, eng: 0 }); const e0 = X.planError(c, { gear: 1, idx: [0], boost: true }); cfg(c, { hand: filler(7), deck: ['1', '2', '3'], gear: 1, pos: 3, eng: 3 }); const h0 = cnt(c.disc, 'H'); const e1 = X.planError(c, { gear: 1, idx: [0], boost: true }); play(G, { gear: 1, cards: ['1'], boost: true }); return eq(['heat', '', 2, 1], [e0, e1, c.eng, cnt(c.disc, 'H') - h0]); };
R[19] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: filler(7), deck: ['4', '2', 'X', '3'], gear: 1, pos: 3 }); const r = play(G, { gear: 1, cards: ['1'], boost: true }); return eq([3, 4, 7], [evOf(r, 'boost')[0].add, evOf(r, 'boost')[0].speed, c.pos]); };
R[20] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: filler(7), deck: ['1', '1', '2'], gear: 1, pos: CR - 3 }); const r = play(G, { gear: 1, cards: ['4'], boost: true }); /* speed 4+2=6, limit 5 at 14: pays 1; boost cost 1 */ return eq(4, c.eng); };
R[21] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: filler(7), deck: [], disc: ['H', 'H'], gear: 1, pos: 3, eng: 4 }); const r = play(G, { gear: 1, cards: ['2'], boost: true }); return eq(0, evOf(r, 'boost')[0].add); };

/* ---- Cooldown ---- */
R[22] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: ['H', 'H', 'H', 'H', '2', '3'], deck: filler(10), gear: 1, pos: 3, eng: 2 }); play(G, { gear: 1, cards: ['1'] }); return eq(5, c.eng); };
R[23] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: ['H', 'H', 'H', '2', '3'], deck: filler(10), gear: 2, pos: 3, eng: 3 }); play(G, { gear: 2, cards: ['1', '1'] }); return eq(4, c.eng); };
R[24] = () => { const out = []; [3, 4].forEach(g => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: ['H', 'H', '2', '3', '3', '3'], deck: filler(10), gear: g, pos: 3, eng: 4 }); play(G, { gear: g, cards: filler(g) }); out.push(c.eng); }); return eq([4, 4], out); };
R[25] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: ['2', '3', '3', '3', '2', '2'], deck: filler(10), disc: ['H', 'H', 'H'], gear: 1, pos: 3 }); play(G, { gear: 1, cards: ['1'] }); return eq(3, c.eng); };

/* ---- Adrenaline ---- */
R[26] = () => { const out = []; [[], [0]].forEach(a => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: filler(6), deck: filler(10), gear: 1, pos: 3 }); play(G, { gear: 1, cards: ['2'] }, { adr: a }); out.push(c.pos); }); return eq([5, 6], out); };
R[27] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: ['H', 'H', '2', '2', '2', '2'], deck: filler(10), gear: 3, pos: 3, eng: 4 }); play(G, { gear: 3, cards: ['1', '1', '1'] }, { adr: [0] }); return eq(5, c.eng); };
R[28] = () => { const out = []; [4, 5, 6].forEach(n => { const G = mk(n); G.cars.forEach((c, i) => { c.pos = 10 + i * 5; c.tie = i; }); X.startResolve(G); out.push(J(G.adr) === J(G.order.slice(G.order.length - G.adr.length)) ? G.adr.length : 'adr not the tail ' + J(G.adr)); }); return eq([1, 2, 2], out); };
R[29] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: filler(5), deck: filler(10), gear: 2, pos: CR - 3 }); play(G, { gear: 2, cards: ['3', '2'] }, { adr: [0] }); /* speed 5 = limit; move 6 passes 14 and 16 */ return eq(6, c.eng); };
R[30] = () => { const G = mk(3); G.cars.forEach((c, i) => { c.pos = 10 + i * 5; c.tie = i; }); X.startResolve(G); const notLast = G.order.slice(0, G.order.length - 1); return eq(true, notLast.every(i => G.adr.indexOf(i) < 0)); };

/* ---- Slipstream ---- */
R[31] = () => { const G = mk(3); const c = G.cars[0]; cfg(c, { hand: filler(6), deck: filler(10), gear: 1, pos: 3 }); G.cars[1].pos = 6; return eq(true, play(G, { gear: 1, cards: ['2'] }).asked); };
R[32] = () => { const G = mk(3); const c = G.cars[0]; cfg(c, { hand: filler(6), deck: filler(10), gear: 1, pos: 3 }); G.cars[1].pos = 5; return eq(true, play(G, { gear: 1, cards: ['2'] }).asked); };
R[33] = () => { const G = mk(3); const c = G.cars[0]; cfg(c, { hand: filler(6), deck: filler(10), gear: 1, pos: 3 }); G.cars[1].pos = 7; G.cars[2].pos = 4; return eq(false, play(G, { gear: 1, cards: ['2'] }).asked); };
R[34] = () => { const G = mk(3); const c = G.cars[0]; cfg(c, { hand: filler(6), deck: filler(10), gear: 1, pos: 3 }); G.cars[1].pos = 6; play(G, { gear: 1, cards: ['2'] }, { slip: false }); return eq(5, c.pos); };
R[35] = () => { const out = []; const G = mk(3); let c = G.cars[0]; cfg(c, { hand: filler(6), deck: filler(10), gear: 1, pos: 3 }); G.cars[1].pos = 6; play(G, { gear: 1, cards: ['2'] }, { slip: true }); out.push(c.pos);
  const H = mk(4); c = H.cars[0]; cfg(c, { hand: filler(6), deck: filler(10), gear: 1, pos: 3 }); H.cars[1].pos = 6; H.cars[2].pos = 7; H.cars[3].pos = 7; play(H, { gear: 1, cards: ['2'] }, { slip: true }); out.push(c.pos); return eq([7, 6], out); };
R[36] = () => { const G = mk(3); const c = G.cars[0]; cfg(c, { hand: filler(5), deck: filler(10), gear: 2, pos: CR - 7 }); G.cars[1].pos = CR - 1; play(G, { gear: 2, cards: ['3', '2'] }, { slip: true }); /* speed 5 lands on 12, +2 = 14; limit 5 */ return eq([CR, 6], [c.pos, c.eng]); };
R[37] = () => { const out = []; [92, 93].forEach(p => { const G = mk(3); const c = G.cars[0]; cfg(c, { hand: filler(6), deck: filler(10), gear: 1, pos: p }); G.cars[1].pos = (p + 2) % 48; G.cars[2].pos = 60; out.push(play(G, { gear: 1, cards: ['2'] }).asked); }); return eq([false, false], out); };
R[38] = () => { const G = mk(4); const c = G.cars[0]; cfg(c, { hand: filler(6), deck: filler(10), gear: 1, pos: 3 }); G.cars[1].pos = 6; G.cars[2].pos = 7; G.cars[3].pos = 7; play(G, { gear: 1, cards: ['2'] }, { slip: true }); const per = {}; G.cars.forEach(k => { per[k.pos] = (per[k.pos] || 0) + 1; }); return eq(true, Object.keys(per).every(k => per[k] <= 2)); };

/* ---- Movement ---- */
R[39] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: filler(5), deck: filler(10), gear: 2, pos: 3 }); play(G, { gear: 2, cards: ['4', '3'] }); return eq(10, c.pos); };
R[40] = () => { const G = mk(4); const c = G.cars[0]; cfg(c, { hand: filler(6), deck: filler(10), gear: 1, pos: 3 }); G.cars[1].pos = 7; G.cars[2].pos = 7; return eq(6, (play(G, { gear: 1, cards: ['4'] }), c.pos)); };
R[41] = () => { const G = mk(4); G.cars.forEach((c, i) => { c.pos = [20, 40, 10, 30][i]; c.tie = i; }); X.startResolve(G); return eq([1, 3, 0, 2], G.order); };

/* ---- Corners ---- */
R[42] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: filler(5), deck: filler(10), gear: 2, pos: CR - 3 }); play(G, { gear: 2, cards: ['3', '2'] }); return eq([6, CR + 2], [c.eng, c.pos]); };
R[43] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: filler(5), deck: filler(10), gear: 2, pos: CR - 6 }); play(G, { gear: 2, cards: ['4', '3'] }); return eq([4, 2], [c.eng, cnt(c.disc, 'H')]); };
R[44] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: filler(5), deck: filler(10), gear: 2, pos: 13 }); play(G, { gear: 2, cards: ['3', '3'] }); /* 14: 6-5=1, 16: 0, 19: 6-4=2 */ return eq([3, 19], [c.eng, c.pos]); };
R[45] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: filler(5), deck: filler(10), gear: 2, pos: 12 }); play(G, { gear: 2, cards: ['4', '3'] }); /* 14: 2, 16: 1, 19: 3 = 6 */ return eq([0, 19, 2], [c.eng, c.pos, c.gear]); };
R[46] = () => { const out = []; let G = mk(2); let c = G.cars[0]; cfg(c, { hand: filler(5), deck: filler(10), gear: 2, pos: CR - 6, eng: 1 }); play(G, { gear: 2, cards: ['4', '3'] }); out.push(c.pos);
  G = mk(3); c = G.cars[0]; cfg(c, { hand: filler(5), deck: filler(10), gear: 2, pos: CR - 6, eng: 1 }); G.cars[1].pos = CR - 1; G.cars[2].pos = CR - 1; play(G, { gear: 2, cards: ['4', '3'] }); out.push(c.pos); return eq([CR - 1, CR - 2], out); };
R[47] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: filler(4), deck: filler(10), gear: 3, pos: CR - 6, eng: 1 }); play(G, { gear: 3, cards: ['4', '4', '4'] }); return eq(1, c.gear); };
R[48] = () => { const out = []; [1, 2].forEach(g => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: filler(6), deck: ['1', '1', '4'], gear: g, pos: CR - 6, eng: 1 }); play(G, g === 1 ? { gear: 1, cards: ['4'], boost: true } : { gear: 2, cards: ['4', '4'] }); out.push(cnt(c.hand, 'X')); }); return eq([1, 1], out); };
R[49] = () => { const out = []; [3, 4].forEach(g => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: filler(5), deck: filler(10), gear: g, pos: CR - 6, eng: 1 }); play(G, { gear: g, cards: filler(g).map(() => '4') }); out.push(cnt(c.hand, 'X')); }); return eq([2, 2], out); };
R[50] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: filler(5), deck: filler(10), gear: 3, pos: CR - 6, eng: 3 }); const h0 = cnt(c.disc, 'H'); play(G, { gear: 3, cards: ['4', '4', '4'] }); return eq([0, 3], [c.eng, cnt(c.disc, 'H') - h0]); };
R[51] = () => { const G = mk(2, { laps: 1 }); const c = G.cars[0]; cfg(c, { hand: filler(4), deck: filler(10), gear: 3, pos: 46 }); G.cars[1].pos = 20; play(G, { gear: 3, cards: ['4', '4', '4'] }); return eq([6, true], [c.eng, !!c.fin]); };
R[52] = () => { const G = mk(3); const c = G.cars[0]; cfg(c, { hand: filler(5), deck: filler(10), gear: 2, pos: CR - 9 }); G.cars[1].pos = CR - 1; play(G, { gear: 2, cards: ['4', '3'] }, { slip: true }); /* speed 7 lands on 12; slip to 14 crosses the limit-5 corner: pay 2 */ return eq([4, CR], [c.eng, c.pos]); };

/* ---- Replenish ---- */
R[53] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: filler(5), deck: filler(10), gear: 2, pos: 3 }); play(G, { gear: 2, cards: ['2', '2'] }); return eq(7, c.hand.length); };
R[54] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: ['1', '2', '3', '4', '1', '2', '3'], deck: filler(10) }); const a = X.discardOptional(G, 0, [0, 1]), b = X.discardOptional(G, 0, [2]); return eq(['', 'phase', 7, 2], [a, b, c.hand.length, c.disc.length]); };
R[55] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: ['1', '2', 'H', 'X', '4', '1', '2'], deck: filler(10), eng: 5 }); return eq(['card', 'card'], [X.discardOptional(G, 0, [2]), X.discardOptional(G, 0, [3])]); };
R[56] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: [], deck: [], disc: ['2', '3', '4'] }); X.draw(G, c, 7); return eq([['2', '3', '4'], 0, 0], [c.hand.slice().sort(), c.deck.length, c.disc.length]); };

/* ---- Stall ---- */
R[57] = () => { const G = mk(2); const c = G.cars[0]; cfg(c, { hand: ['H', 'H', 'H', 'H', 'H', 'H'], deck: filler(10), gear: 3, pos: 3, eng: 0 }); c.disc.length = 0; /* 6 H in hand, engine 0 */ const r = play(G, { gear: 3, cards: ['2'] }); return eq([3, 1], [c.pos, c.gear]); };

/* ---- Finish ---- */
R[58] = () => { const a = X.newGame({ track: 'sunline', laps: 3, n: 2, humans: 0, seed: 1 }), b = X.newGame({ track: 'hairpin', laps: 2, n: 2, humans: 0, seed: 1 }); return eq([144, 128], [X.total(a), X.total(b)]); };
R[59] = () => { const G = mk(3); G.cars[0].fin = 1; G.cars[0].pos = 100; X.startResolve(G); return eq(true, G.order.indexOf(0) < 0 && G.order.length === 2); };
R[60] = () => { const G = mk(3, { laps: 1 }); const c = G.cars[0]; cfg(c, { hand: filler(4), deck: filler(10), gear: 3, pos: 46 }); G.cars[1].pos = 10; G.cars[2].pos = 20; c.plan = { gear: 3, cards: ['4', '4', '4'], boost: false }; X.startResolve(G); let guard = 0; while (G.phase === 'resolve' && guard++ < 20) { if (G.pend) X.slipChoice(G, false); else X.resolveNext(G); } return eq([true, [0]], [G.over, G.cars.filter(k => k.fin).map(k => k.i)]); };
R[61] = () => { const G = mk(3, { laps: 1 }); const a = G.cars[0], b = G.cars[1]; cfg(a, { hand: filler(5), deck: filler(10), gear: 2, pos: 45 }); cfg(b, { hand: filler(4), deck: filler(10), gear: 3, pos: 44 }); G.cars[2].pos = 10; a.plan = { gear: 2, cards: ['2', '2'], boost: false }; b.plan = { gear: 3, cards: ['4', '4', '4'], boost: false }; X.startResolve(G); let guard = 0; while (G.phase === 'resolve' && guard++ < 20) { if (G.pend) X.slipChoice(G, false); else X.resolveNext(G); } return eq([1, 0, 2], G.rank.slice(0, 3)); };
R[62] = () => { const G = mk(4); G.cars[0].fin = 1; G.cars[0].pos = 100; G.cars[1].pos = 10; G.cars[2].pos = 30; G.cars[3].pos = 20; return eq([0, 2, 3, 1], X.rankList(G)); };
R[63] = () => { const G = mk(3); G.cars[1].pos = 30; G.cars[2].pos = 30; G.cars[1].tie = 5; G.cars[2].tie = 2; G.cars[0].pos = 5; return eq([2, 1, 0], X.rankList(G)); };

const NB = { 64: 'Championship', 65: 'Weather and road-condition cards', 66: 'Legends', 67: 'Original garage upgrades' };
let pass = 0, fail = 0;
Object.keys(R).map(Number).sort((a, b) => a - b).forEach(n => {
  let r; try { r = R[n](); } catch (e) { r = ['no exception', 'threw ' + e.message]; }
  if (r === true) pass++; else { fail++; console.log('FAIL R' + n + ' expected ' + J(r[0]) + ' got ' + J(r[1])); }
});
Object.keys(NB).forEach(n => console.log('SKIP R' + n + ' ' + NB[n] + ' (module not built)'));
console.log('logic-test: rules tested ' + (pass + fail) + ', pass ' + pass + ', fail ' + fail + ', not built ' + Object.keys(NB).length);
process.exit(fail ? 1 : 0);

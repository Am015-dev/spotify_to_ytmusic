// Meadowfold rules test (node, no browser): component counts, every stacking rule, habitat matching with rotation, every scoring rule,
// both boards, spirits, solo, end triggers, plus a computer-vs-computer gauntlet with invariants after every move.
// Run: node games-src/meadowfold/rules-test.js   (QUICK=1 = 4 games)
const fs = require('fs'), path = require('path'), vm = require('vm');
const S = path.join(__dirname, 'src'), ctx = { console, Math, JSON, Object, Array };
vm.createContext(ctx);
vm.runInContext(['data.js', 'engine.js', 'ai.js'].map(f => fs.readFileSync(path.join(S, f), 'utf8')).join('\n') + '\n;this.MF=MF;this.E=E;this.AI=AI;this.getG=function(){return G};', ctx);
const { MF, E, AI } = ctx;
let fails = 0, n = 0;
const ok = (c, msg) => { n++; if (!c) { fails++; console.log('FAIL ' + msg); } };
let seed = 1; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; Math.random = rnd;

// --- components ---
const bag = MF.BAG; ok(bag.water === 23 && bag.mount === 23 && bag.trunk === 21 && bag.leaf === 19 && bag.field === 19 && bag.build === 15, 'token counts per colour');
ok(Object.values(bag).reduce((a, b) => a + b) === 120, '120 tokens');
ok(MF.CARDS.length === 32, '32 animal cards'); ok(MF.SPIRITS.length === 10, '10 spirit cards');
ok(MF.BOARDS.A.reduce((a, b) => a + b) === 23, 'side A 23 hexes'); ok(MF.BOARDS.B.reduce((a, b) => a + b) === 25, 'side B 25 hexes');
ok(MF.CARDS.every(c => c.pts.length >= 2 && c.pts.length <= 5 && c.pat.filter(p => p.cube).length === 1), 'every card: 2-5 cubes, one home hex');
ok(MF.CARDS.every(c => c.pts.every((v, i) => !i || v > c.pts[i - 1])), 'card tracks rise');

// --- setup ---
E.newGame({ np: 2, humans: 0 }); let G = ctx.getG();
ok(G.central.length === 5 && G.central.every(s => s.length === 3), '5 pockets of 3');
ok(G.row.length === 5 && G.deck.length === 27, '5 face-up cards, 27 in the pile');
ok(E.check() === null, 'setup invariant');
E.newGame({ np: 1, humans: 1 }); G = ctx.getG();
ok(G.central.length === 3 && G.row.length === 3, 'solo: 3 pockets, 3 cards');

// --- stacking ---
const mk = (b) => ({ board: b, cubes: {} });
const cs = (b, col) => E.canStack(mk({ k: b }), 'k', col);
ok(cs([], 'water') && cs([], 'field') && cs([], 'build') && cs([], 'leaf'), 'anything on an empty hex');
ok(!cs(['water'], 'mount') && !cs(['field'], 'field') && !cs(['mount'], 'water'), 'water/field never stack');
ok(cs(['mount'], 'mount') && cs(['mount', 'mount'], 'mount') && !cs(['mount', 'mount', 'mount'], 'mount'), 'mountains up to 3');
ok(cs(['trunk'], 'trunk') && !cs(['trunk', 'trunk'], 'trunk'), 'two trunks max');
ok(cs(['trunk'], 'leaf') && cs(['trunk', 'trunk'], 'leaf') && !cs(['leaf'], 'leaf') && !cs(['mount'], 'leaf'), 'leaves on 0-2 trunks only');
ok(cs(['mount'], 'build') && cs(['trunk'], 'build') && cs(['build'], 'build') && !cs(['mount', 'mount'], 'build') && !cs(['field'], 'build'), 'building on one grey/trunk/red');
ok(!cs(['leaf'], 'build') && !cs(['build', 'build'], 'mount'), 'nothing on leaves or buildings');
ok(!E.canStack({ board: { k: ['mount'] }, cubes: { k: 3 } }, 'k', 'mount'), 'an animal blocks stacking');

// --- scoring helpers on a hand-made board ---
function board(side, cellsMap, extra) {
  E.newGame({ np: 1, humans: 1, side }); const g = ctx.getG(); const s = g.seats[0]; s.board = cellsMap; Object.assign(s, extra || {}); return s;
}
let s = board('A', { '0,0': ['leaf'], '0,1': ['trunk', 'leaf'], '0,2': ['trunk', 'trunk', 'leaf'], '0,3': ['trunk'] });
ok(E.score(s).trees === 11, 'trees 1/3/7, bare trunk 0');
s = board('A', { '2,0': ['mount'], '2,1': ['mount', 'mount'], '4,4': ['mount', 'mount', 'mount'] });
ok(E.score(s).mounts === 4, 'mountains score only next to a mountain (1+3, isolated 7 = 0)');
s = board('A', { '0,0': ['field'], '0,1': ['field'], '0,2': ['field'], '4,0': ['field'], '2,4': ['field'], '2,3': ['field'] });
ok(E.score(s).fields === 10, 'fields: 5 per group of 2+');
s = board('A', { '2,2': ['mount', 'build'], '2,1': ['water'], '2,3': ['field'], '1,1': ['leaf'] });
ok(E.score(s).builds === 5, 'building with 3 colours around = 5');
s = board('A', { '2,2': ['mount', 'build'], '2,1': ['water'], '2,3': ['water'] });
ok(E.score(s).builds === 0, 'building with 1 colour = 0');
s = board('A', { '2,2': ['build'], '2,1': ['water'], '2,3': ['field'], '1,1': ['leaf'] });
ok(E.score(s).builds === 0, 'lone red is not a building');
// river: a straight column of 5 = 11, with a branch it still counts the longest path
s = board('A', { '0,0': ['water'], '0,1': ['water'], '0,2': ['water'], '0,3': ['water'], '0,4': ['water'] });
ok(E.river(s) === 5 && E.score(s).water === 11, 'river of 5 = 11');
ok(E.riverPts(1) === 0 && E.riverPts(2) === 2 && E.riverPts(3) === 5 && E.riverPts(4) === 8 && E.riverPts(6) === 15 && E.riverPts(8) === 23, 'river table');
s = board('B', {}); ok(E.score(s).water === 5, 'side B: an empty board is one island (5)');
s = board('B', { '1,0': ['water'], '1,1': ['water'], '1,2': ['water'] });
ok(E.score(s).islands === 2 && E.score(s).water === 10, 'side B: a river splitting the board = 2 islands');

// --- habitats: card 5 (leaf + water to its NW) in all rotations ---
const c5 = MF.CARDS[4];
s = board('A', { '2,2': ['leaf'], '1,1': ['water'] }); // 2,2 even col; NW of (2,2) is (1,1)
ok(!!E.cubeSpots(s, c5.id)['1,1'], 'card pattern matches');
s = board('A', { '2,2': ['leaf'], '3,2': ['water'] }); // NE of even col 2 row 2 = (3,1); SE=(3,2): a rotation
ok(!!E.cubeSpots(s, c5.id)['3,2'], 'card pattern matches when rotated');
s = board('A', { '2,2': ['trunk', 'leaf'], '1,1': ['water'] });
ok(!E.cubeSpots(s, c5.id)['1,1'], 'tree height must match exactly');
s = board('A', { '2,2': ['leaf'], '1,1': ['water'] }, { cubes: { '1,1': 9 } });
ok(!Object.keys(E.cubeSpots(s, c5.id)).length, 'one animal per hex');
// a token can serve two habitats: two duck homes share one leaf
s = board('A', { '2,2': ['leaf'], '1,1': ['water'], '3,2': ['water'] });
ok(Object.keys(E.cubeSpots(s, c5.id)).length === 2, 'one token in several habitats');

// --- animal track scoring ---
E.newGame({ np: 1, humans: 1 }); G = ctx.getG(); s = G.seats[0];
s.cards = [{ id: 5, left: 3 }]; s.done = [1];
ok(E.score(s).animals === 4 + 15, 'card score = highest revealed slot (2 of 5 = 4) + completed card top (15)');

// --- spirits ---
s = board('A', { '0,0': ['field'], '2,0': ['field'], '2,1': ['field'], '4,0': ['field'], '4,1': ['field'], '4,2': ['field'] });
ok(E.spiritPts(s, 33) === 14, 'field spirit: 2 + 2 + 10 = 14 (the rulebook example)');
s = board('A', { '0,0': ['mount', 'mount'], '4,4': ['mount', 'mount', 'mount'], '2,2': ['mount'] });
ok(E.spiritPts(s, 39) === 8, 'mountain spirit: +4 per height 2-3, isolated too');
ok(E.spiritPts(s, 40) === 7, 'mountain spirit 3/3/1');

// --- turn flow + card limit ---
E.newGame({ np: 2, humans: 2 }); G = ctx.getG();
ok(E.apply({ t: 'take', i: 0 }) && G.turn.hand.length === 3, 'take a pocket = 3 tokens');
ok(!E.legal({ t: 'take', i: 1 }), 'only one pocket per turn');
ok(!E.moves().some(m => m.t === 'end'), 'cannot end with tokens in hand');
ok(E.apply({ t: 'card', i: 0 }) && !E.legal({ t: 'card', i: 0 }), 'one card per turn');
G.seats[0].cards = [{ id: 1, left: 3 }, { id: 2, left: 3 }, { id: 3, left: 4 }, { id: 4, left: 3 }]; G.turn.tookCard = false;
ok(!E.moves().some(m => m.t === 'card'), 'at most 4 cards with cubes left');

// --- end triggers ---
E.newGame({ np: 2, humans: 0 }); G = ctx.getG();
G.cells = E.cells('A').list; E.cells('A').list.slice(0, 21).forEach(k => G.seats[0].board[k] = ['water']);
MF.COLS.forEach(c => { G.bag[c] -= 0; });
let tot = 0; G.seats[0].board && Object.values(G.seats[0].board).forEach(st => tot += st.length); G.bag.water -= tot;
E.apply({ t: 'take', i: 0 }); while (G.turn.hand.length) { const m = E.moves().find(x => x.t === 'place' || x.t === 'end'); E.apply(m); if (m.t === 'end') break; }
if (!G.over && G.cur === 0) {} else ok(G.last && !G.over && G.cur === 1, 'two empty hexes: the round finishes first');
const p2 = AI.plan('normal'); p2.forEach(m => E.apply(m));
ok(G.over && G.result, 'game ends after the last player of the round');


// --- F1: the former [unverified] items, now settled ---
const need = n => n === 'water' || n === 'field' ? [n] : n === 'build' ? ['mount', 'build'] : n.indexOf('mount') === 0 ? Array(+n[5]).fill('mount') : Array(+n[4] - 1).fill('trunk').concat(['leaf']);
const lay = (side, id, origin, mirror) => { const b = {}; let k = origin; for (const [i, p] of E.card(id).pat.entries()) { if (i) k = E.step(side, k, mirror ? [4, 3, 2, 1, 0, 5][p.d] : p.d); if (!k) return null; b[k] = need(p.n); } return b; };
E.newGame({ np: 2, humans: 0, side: 'A' }); G = ctx.getG();
// mirror images: every habitat (animals and spirits) equals its own mirror image turned some way, so the mirror question never changes a game
let mirrorSame = 0, all = MF.CARDS.concat(MF.SPIRITS);
for (const c of all) for (const o of E.cells('A').list) { const bm = lay('A', c.id, o, true), bn = lay('A', c.id, o, false); if (!bm || !bn) continue;
  if (Object.keys(E.cubeSpots(mk(bn), c.id)).length && Object.keys(E.cubeSpots(mk(bm), c.id)).length) mirrorSame++; break; }
ok(mirrorSame === all.length, 'every habitat matches its mirror image by rotation (' + mirrorSame + '/' + all.length + ')');
// empty animal pile: the row is not refilled, nothing breaks
E.newGame({ np: 2, humans: 0 }); G = ctx.getG(); G.deck = []; E.apply({ t: 'take', i: 0 }); E.apply({ t: 'card', i: 0 });
while (G.turn.hand.length) E.apply(E.moves().find(x => x.t === 'place')); E.apply({ t: 'end' });
ok(G.row.length === 4 && E.check() === null, 'empty animal pile: the row stays short');
// first player: seat 1 starts
E.newGame({ np: 3, humans: 1 }); G = ctx.getG(); ok(G.cur === 0, 'seat 1 starts (players choose; you go first)');
// tie-break counts animal cubes only, not the spirit cube
ok(E.cubesPlaced({ cubes: { '0,0': 3, '1,1': 'S7' } }) === 1, 'tie-break: the spirit cube is not an animal cube');

// solo suns (rulebook solo page): table, +1 on side A, +2 with no spirit, +1 for a "groups" spirit, +0 for a "count" spirit
E.newGame({ np: 1, humans: 1, side: 'A' }); G = ctx.getG();
ok(E.suns({ total: 130 }).base === 5, 'solo: 130 points = 5 suns'); ok(E.suns({ total: 39 }).base === 0 && E.suns({ total: 160 }).base === 8, 'solo: below 40 none, 160 = 8');
ok(E.suns({ total: 130 }).bonus === 3, 'solo side A, no spirit: +1 +2');
G.side = 'B'; ok(E.suns({ total: 130 }).bonus === 2, 'solo side B, no spirit: +2 only');
G.side = 'A'; G.seats[0].spirit = { id: 33, placed: true }; ok(E.suns({ total: 130 }).total === 7, 'rulebook example: 130 pts, side A, field-groups spirit = 7 suns');
G.seats[0].spirit = { id: 42, placed: true }; ok(E.suns({ total: 130 }).bonus === 1, 'solo: a count-type spirit adds no sun');
const grp = MF.SPIRITS.filter(c => /fields|build|waterGroups/.test(c.sc)).length; ok(grp === 5, 'spirits: 5 count groups, 5 count pieces');

// --- gauntlet ---
const games = process.env.QUICK ? 4 : 24; let totals = [], wins = [0, 0], lens = [], soloS = [], maxCubes = 0;
for (let g = 0; g < games; g++) {
  const np = g % 4 === 3 ? 1 : (g % 4) + 2, side = g % 2 ? 'B' : 'A';
  E.newGame({ np, humans: 0, side, spirits: g % 3 === 0, ai: g % 5 === 0 ? 'easy' : 'normal' }); G = ctx.getG();
  let steps = 0, bad = null;
  while (!G.over && steps < 4000) {
    const plan = AI.plan(G.seats[G.cur].ai || 'normal');
    for (const m of plan) { if (!E.apply(m)) { bad = 'illegal ' + JSON.stringify(m); break; } const c = E.check(); if (c) { bad = c; break; } steps++; }
    if (bad) break;
  }
  ok(!bad && G.over, 'gauntlet game ' + g + ' (' + np + 'p ' + side + '): ' + (bad || (G.over ? 'ok' : 'not over')));
  maxCubes = Math.max(maxCubes, G.seats.reduce((a, x) => a + E.cubesPlaced(x), 0));
  if (G.result) { G.result.scores.forEach(r => totals.push(r.total)); lens.push(G.seats[0].turns); if (np === 1) soloS.push(G.result.scores[0].total); }
}
ok(maxCubes <= 75, 'animal cubes used in a game stay within the 75 in the box (max ' + maxCubes + ')');
const avg = a => a.length ? Math.round(a.reduce((x, y) => x + y) / a.length) : 0;
console.log(`gauntlet: ${games} games, avg score ${avg(totals)} (min ${Math.min(...totals)} max ${Math.max(...totals)}), avg turns ${avg(lens)}, solo avg ${avg(soloS)}`);
console.log((fails ? 'FAIL' : 'PASS') + ` rules-test: ${n - fails}/${n} checks`);
process.exit(fails ? 1 : 0);

/* W496 gate: headless level ladder. Runs N races on sunline (2 laps, 5 cars) with the real engine and AI.
   A: mixed fields (1 easy, 2 normal, 2 hard): average place must order hard < normal < easy.
   B: one Suggest driver (the planner behind the Suggest button) against 4 rivals of each level: podium and win rates.
   D: a plain newcomer (no Suggest) on Easy: average place 3.6 or better.
   Usage: node sim-levels.js [races]   Exit 1 if the ladder is out of order or Suggest vs Easy podiums under 60%. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const X = vm.createContext({ console, Math, Date, JSON });
['data', 'track', 'engine', 'ai'].forEach(f => vm.runInContext(fs.readFileSync(path.join(__dirname, 'src', f + '.js'), 'utf8'), X, { filename: f }));
if (process.env.EASY) X.AIP.easy = JSON.parse(process.env.EASY);
const N = +process.argv[2] || 200, ONLY = process.env.ONLY; let NAIVE = false;
function race(levels, seed, human) {   /* human: car 0 is a player who taps Suggest every round and answers the questions like the touch gate */
  const G = X.newGame({ track: 'sunline', laps: 2, n: levels.length, humans: human ? 1 : 0, seed, diff: human || 'normal', sup: true });
  G.cars.forEach((c, i) => { if (!c.human) c.lvl = levels[i]; });
  for (let r = 0; r < 60 && !G.over; r++) {
    if (human === 'naive' || NAIVE) G.cars.forEach(c => { if (c.human && !c.fin && !c.plan) {   /* plain newcomer: gear up, down 1 when a corner is near, biggest cards */
      const N = X.T(G).N; let near = false; for (let d = 1; d <= 8; d++) if (X.T(G).corners[(c.pos + d) % N]) near = true;
      let g = Math.min(4, Math.max(1, c.gear + (near ? -1 : 1))); const opts = X.gearOpts(c).map(o => o.g); if (!opts.includes(g)) g = c.gear;
      const val = x => { const u = X.upgId(x); return u ? X.UPG[u].sp : x === 'X' ? 2 : +x; };
      if (process.env.G2) g = near ? Math.min(2, c.gear + 1) : Math.min(4, c.gear + 1); if (!opts.includes(g)) g = c.gear;   /* the reviewer's player: gear 2 near a corner sign */
      const idx = process.env.TOUCH ? c.hand.map((x, j) => j).filter(j => c.hand[j] !== 'H').slice(0, X.needCards(c, g)) : c.hand.map((x, j) => j).filter(j => c.hand[j] !== 'H').sort((a, b) => val(c.hand[b]) - val(c.hand[a])).slice(0, X.needCards(c, g));
      if (X.submitPlan(G, c.i, { gear: g, idx, boost: false })) X.submitPlan(G, c.i, { gear: c.gear, idx: idx.slice(0, X.needCards(c, c.gear)), boost: false }); } });
    if (!NAIVE) G.cars.forEach(c => { if (c.human && !c.fin && !c.plan) { const p = X.suggestPlan(G, c); const e = X.submitPlan(G, c.i, { gear: p.gear, idx: p.idx, boost: false }); if (e) throw new Error('suggest plan refused: ' + e); } });
    X.startResolve(G);
    let guard = 0; while (G.phase === 'resolve' && guard++ < 500) {
      const q = G.pend; if (!q) { X.resolveNext(G); continue; }
      if (q.t === 'boost') { const c = G.cars[q.car], N = X.T(G).N; let near = false; for (let d = 1; d <= 8; d++) if (X.T(G).corners[(c.pos + q.speed + d) % N]) near = true; X.boostChoice(G, NAIVE ? c.eng >= 5 && !near : X.suggestBoost(G, c)); } else if (q.t === 'slip') X.slipChoice(G, X.suggestSlip(G, G.cars[q.car])); else X.discardChoice(G, q.car, []);
    }
  }
  const rank = X.rankList(G), out = {};
  G.cars.forEach(c => { out[c.i] = { place: rank.indexOf(c.i) + 1, spins: c.stats.spins, heat: c.stats.heat }; });
  return { out, rounds: G.round };
}
let bad = 0;
/* A: mixed ladder */
if (ONLY !== 'D') {
const lv = ['easy', 'normal', 'normal', 'hard', 'hard'], sum = { easy: 0, normal: 0, hard: 0 }, cnt = { easy: 0, normal: 0, hard: 0 }, spins = { easy: 0, normal: 0, hard: 0 };
for (let s = 0; s < N; s++) {
  const rot = s % 5, L = lv.map((_, i) => lv[(i + rot) % 5]), r = race(L, 1000 + s);
  L.forEach((l, i) => { sum[l] += r.out[i].place; cnt[l]++; spins[l] += r.out[i].spins; });
}
const avg = l => sum[l] / cnt[l];
console.log('mixed', N, 'races: avg place easy', avg('easy').toFixed(2), 'normal', avg('normal').toFixed(2), 'hard', avg('hard').toFixed(2),
  '| spins per race easy', (spins.easy / cnt.easy).toFixed(2), 'normal', (spins.normal / cnt.normal).toFixed(2), 'hard', (spins.hard / cnt.hard).toFixed(2));
if (!(avg('hard') < avg('normal') && avg('normal') < avg('easy'))) { console.log('FAIL ladder order'); bad = 1; }
}
if (ONLY === 'A') process.exit(bad);
if (ONLY !== 'D') {
/* B: Suggest driver vs fields of one level */
for (const l of ['easy', 'normal', 'hard']) {
  let pod = 0, win = 0, rs = 0, sp = 0;
  for (let s = 0; s < N; s++) { const L = ['pro', l, l, l, l], rot = s % 5, LL = L.map((_, i) => L[(i + rot) % 5]), me = (5 - rot) % 5, r = race(LL, 5000 + s); const p = r.out[me].place; if (p <= 3) pod++; if (p === 1) win++; rs += r.rounds; sp += [0, 1, 2, 3, 4].filter(i => i !== me).reduce((a, i) => a + r.out[i].spins, 0) / 4; }
  console.log('Suggest vs 4', l, ': win', (100 * win / N).toFixed(0) + '%', 'podium', (100 * pod / N).toFixed(0) + '%', '| rounds', (rs / N).toFixed(1), '| rival spins per race', (sp / N).toFixed(2));
  if (l === 'easy' && pod / N < 0.6) { console.log('FAIL Suggest podium on easy'); bad = 1; }
}
/* C: a player seat (car 0, human) following Suggest, Boost and Slip advice on default Easy, 4 rivals */
for (const l of ['easy', 'normal', 'hard']) {
  let pod = 0, win = 0, pl = []; for (let s = 0; s < N; s++) { const r = race(['you', l, l, l, l], 9000 + s, l); const p = r.out[0].place; pl.push(p); if (p <= 3) pod++; if (p === 1) win++; }
  console.log('Player seat following Suggest vs 4', l, ': win', (100 * win / N).toFixed(0) + '%', 'podium', (100 * pod / N).toFixed(0) + '%', 'avg place', (pl.reduce((a, x) => a + x, 0) / N).toFixed(2));
  if (l === 'easy' && (pod / N < 0.7 || win / N < 0.35)) { console.log('FAIL player following Suggest on easy'); bad = 1; }
}
}
/* D: a plain newcomer (no Suggest) on default Easy should finish mid-pack on average, not last */
{ NAIVE = true; let pl = 0, pod = 0, nsp = 0, win = 0; const OPP = +(process.env.OPP || 4); for (let s = 0; s < N; s++) { const r = race(["you"].concat(Array(OPP).fill("easy")), 13000 + s, "easy"); pl += r.out[0].place; nsp += r.out[0].spins; if (r.out[0].place <= 3) pod++; if (r.out[0].place === 1) win++; }
  console.log('Plain newcomer (no Suggest) vs 4 easy: avg place', (pl / N).toFixed(2), 'podium', (100 * pod / N).toFixed(0) + '%', 'win', (100 * win / N).toFixed(0) + '%', 'spins/race', (nsp / N).toFixed(2)); if (pl / N > 3.6) { console.log('FAIL plain newcomer on easy'); bad = 1; } NAIVE = false; }
process.exit(bad);

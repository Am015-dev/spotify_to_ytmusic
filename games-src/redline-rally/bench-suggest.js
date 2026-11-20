/* F6 bench: a newcomer who only presses Go (the UI's default plan) vs 4 Easy rivals, sunline 2 laps, 5 cars.
   MODE=go: old default (current gear kept, cards auto-picked for it). MODE=suggest (default): the Suggest plan (gear, cards, boost) is pre-selected, so Go follows it.
   Prints average place, podium/top-half/win rates, average gear and engine heat left at the finish.  Usage: node bench-suggest.js [races] */
const fs = require('fs'), vm = require('vm'), path = require('path');
const X = vm.createContext({ console, Math, Date, JSON });
['data', 'track', 'engine', 'ai'].forEach(f => vm.runInContext(fs.readFileSync(path.join(__dirname, 'src', f + '.js'), 'utf8'), X, { filename: f }));
const N = +process.argv[2] || 200, MODE = process.env.MODE || 'suggest', LV = process.env.LV || 'easy';
let pl = 0, pod = 0, top = 0, win = 0, gs = 0, gn = 0, heat = 0, spins = 0;
for (let s = 0; s < N; s++) {
  const G = X.newGame({ track: 'sunline', laps: 2, n: 5, humans: 1, seed: 7000 + s, diff: LV, sup: true });
  G.cars.forEach(c => { if (!c.human) c.lvl = LV; });
  const me = G.cars[0]; let want = false, engFin = null;
  for (let r = 0; r < 80 && !G.over; r++) {
    if (!me.fin && !me.plan) {
      let p;
      if (MODE === 'go') { const idx = X.autoPickPlan(G, me, me.gear) || []; p = { gear: me.gear, idx, boost: false }; want = false; }
      else { const q = X.suggestPlan(G, me); p = { gear: q.gear, idx: q.idx, boost: false }; want = !!q.boost; }
      gs += p.gear; gn++;
      const e = X.submitPlan(G, 0, p); if (e) throw new Error(e);
    }
    X.startResolve(G);
    let guard = 0; while (G.phase === 'resolve' && guard++ < 500) {
      const q = G.pend; if (!q) { X.resolveNext(G); continue; }
      if (q.t === 'boost') { const c = G.cars[q.car]; X.boostChoice(G, c.human ? (want && X.suggestBoost(G, c)) : false); }
      else if (q.t === 'slip') X.slipChoice(G, X.suggestSlip(G, G.cars[q.car])); else X.discardChoice(G, q.car, []);
    }
    if (me.fin && engFin == null) engFin = me.eng;
  }
  const k = X.rankList(G).indexOf(0) + 1; pl += k; if (k <= 3) pod++; if (k <= 2) top++; if (k === 1) win++; heat += engFin == null ? me.eng : engFin; spins += me.stats.spins;
}
console.log(`${MODE} vs 4 ${LV}, ${N} races: avg place ${(pl / N).toFixed(2)}, win ${(100 * win / N).toFixed(0)}%, top-2 ${(100 * top / N).toFixed(0)}%, podium ${(100 * pod / N).toFixed(0)}%, avg gear ${(gs / gn).toFixed(2)}, heat left ${(heat / N).toFixed(2)}, spins ${(spins / N).toFixed(2)}`);

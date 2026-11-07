// Headless rules test: many AI games finish with invariants intact. Run: node rules-test.js [games]
const fs = require('fs'), vm = require('vm'), path = require('path');
const ctx = vm.createContext({ console, Math, Date, JSON });
['data', 'track', 'engine', 'ai'].forEach(f => vm.runInContext(fs.readFileSync(path.join(__dirname, 'src', f + '.js'), 'utf8'), ctx, { filename: f }));
const run = s => vm.runInContext(s, ctx);
const games = +process.argv[2] || 240;
run(`
function playAll(o){ var G=newGame(o), guard=0, bad=[];
  while(!G.over && guard++<3000){
    if(G.phase==='plan'){ G.cars.forEach(function(c){ if(!c.plan){ c.plan=aiPlan(G,c);} }); startResolve(G); continue; }
    if(G.pend){ slipChoice(G, G.pend.L1>G.pend.L0 && (G.rs&1)); continue; }
    resolveNext(G); var b=checkInvariants(G); if(b.length){ bad.push(b[0]); break; }
  }
  return {G:G, bad:bad, stuck:!G.over};
}`);
let stuck = 0, bad = [], rounds = [], wins = {}, spins = 0, heat = 0, slips = 0, boosts = 0, n = 0;
for (let i = 0; i < games; i++) {
  const o = { track: i % 2 ? 'hairpin' : 'sunline', laps: 1 + (i % 3), n: 2 + (i % 5), humans: 0, seed: i + 1, diff: ['easy', 'normal', 'hard'][i % 3], upg: i % 3 !== 0 };
  ctx.__o = o; const r = run('playAll(__o)');
  if (r.stuck) stuck++; if (r.bad.length) bad.push(r.bad[0]);
  const G = r.G; rounds.push(G.round); n++;
  if (G.over) { const w = G.rank[0]; wins[w] = (wins[w] || 0) + 1; }
  G.cars.forEach(c => { spins += c.stats.spins; heat += c.stats.heat; slips += c.stats.slips; boosts += c.stats.boosts; });
}
const avg = rounds.reduce((a, b) => a + b, 0) / n;
console.log(`games ${n} stuck ${stuck} invariant-fails ${bad.length} avg-rounds ${avg.toFixed(1)} min ${Math.min(...rounds)} max ${Math.max(...rounds)}`);
console.log(`per game: spins ${(spins / n).toFixed(2)} heat-paid ${(heat / n).toFixed(1)} slipstreams ${(slips / n).toFixed(1)} boosts ${(boosts / n).toFixed(1)}`);
if (bad.length) console.log('FIRST BAD:', bad[0]);
const ok = !stuck && !bad.length; console.log(ok ? 'PASS rules-test' : 'FAIL rules-test'); process.exit(ok ? 0 : 1);

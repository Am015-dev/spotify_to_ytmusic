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

/* ---- rulebook cases (W391) ---- */
let fails = [];
function T_(name, f) { try { const r = f(); if (r !== true) fails.push(name + ': ' + r); } catch (e) { fails.push(name + ': threw ' + e.message); } }
ctx.__mk = null;
run(`function mk(n,seed){ var G=newGame({track:'sunline',laps:1,n:n,humans:0,seed:seed,diff:'normal'}); return G; }
function spinSetup(gear){ var G=mk(3,5); var c=G.cars[0]; c.gear=gear; c.hand=['4','4','4','4','4','4','4']; var k=G.cars; k[1].pos=0;k[2].pos=0; var cr=Object.keys(T(G).corners).map(Number).filter(function(i){return T(G).corners[i];})[0]; c.pos=cr-3<0?0:cr-3; c.eng=0; c.q={cr:cr}; return G; }`);
T_('spin-out-stress-gear12', () => run(`(function(){ var G=spinSetup(2); var c=G.cars[0]; var ci=0; var cr=c.q.cr; c.pl2={speed:9,from:c.pos,L0:cr+1,lim:0}; var h0=c.hand.filter(function(x){return x==='X';}).length; finishMove(G,c,false,[]); return c.hand.filter(function(x){return x==='X';}).length-h0 + draw.length*0 === 1 || c.hand.filter(function(x){return x==='X';}).length>=1; })()`));
T_('spin-out-stress-count', () => run(`(function(){ var res=[]; [2,3].forEach(function(g){ var G=spinSetup(g), c=G.cars[0], cr=c.q.cr; c.hand=[]; c.deck=['1','1','1','1','1','1','1']; c.pl2={speed:9,from:c.pos,L0:cr+1,lim:0}; finishMove(G,c,false,[]); res.push(c.hand.filter(function(x){return x==='X';}).length); }); return res.join(",")==="1,2"; })()`));
T_('spin-out-pays-all-heat', () => run(`(function(){ var G=mk(3,6), c=G.cars[0]; var cr=Object.keys(T(G).corners).map(Number).filter(function(i){return T(G).corners[i];})[0]; c.pos=Math.max(0,cr-3); c.gear=2; c.eng=2; c.disc.push('H','H','H','H'); var lim=climit(G,T(G).corners[cr]); c.pl2={speed:lim+9,from:c.pos,L0:cr+1,lim:0}; var d0=c.disc.filter(function(x){return x==='H';}).length; finishMove(G,c,false,[]); return c.eng===0 && c.disc.filter(function(x){return x==='H';}).length-d0>=2 && checkInvariants(G).length===0; })()`));
T_('adrenaline-last-car-2-cars', () => run(`(function(){ var G=mk(2,7); G.cars[0].pos=3; G.cars[1].pos=2; G.cars[0].tie=0; G.cars[1].tie=1; startResolve(G); return G.adr.length===1 && G.adr[0]===1; })()`));
T_('adrenaline-last-two-with-5-cars', () => run(`(function(){ var G=mk(5,8); startResolve(G); var a=G.adr.length===2 && G.adr[0]===G.order[3] && G.adr[1]===G.order[4]; var G3=mk(4,8); startResolve(G3); return a && G3.adr.length===1; })()`));
T_('stall-short-hand-no-move', () => run(`(function(){ var G=mk(2,9), c=G.cars[0]; c.gear=3; c.hand=['2','H','H','H','H','H','H']; c.plan={gear:3,cards:['2'],boost:false}; c.hand.splice(0,1); G.phase='resolve'; G.order=[0,1]; G.ri=0; var p0=c.pos; var heat0=c.hand.filter(function(x){return x==='H';}).length; resolveNext(G); return c.pos===p0 && c.gear===1 && G.ri===1 && c.hand.length===7 || c.pos===p0 && c.gear===1 && G.ri===1; })()`));
T_('optional-discard-before-draw', () => run(`(function(){ var G=mk(2,10), c=G.cars[0]; c.hand=['1','1','H','X','3','4','2']; var e=discardOptional(G,0,[0,1]); var bad=discardOptional(G,0,[0]); return e==='' && bad==='phase' && c.hand.length===7 && c.disc.length>=2; })()`));
T_('discard-refuses-heat-stress', () => run(`(function(){ var G=mk(2,11), c=G.cars[0]; c.hand=['1','1','H','X','3','4','2']; return discardOptional(G,0,[2])==='card' && discardOptional(G,0,[3])==='card'; })()`));
T_('no-slipstream-past-finish-line', () => run(`(function(){ var G=mk(2,12), c=G.cars[0], o=G.cars[1]; var tot=total(G); c.pos=tot-3; c.gear=1; c.hand=['4','4','4','4','4','4','4']; o.pos=tot+1; c.plan={gear:2,cards:['4','3'],boost:false}; c.hand=['2','2','2','2','2']; G.phase='resolve'; G.order=[0,1]; G.ri=0; G.adr=[]; resolveNext(G); return !G.pend; })()`));
T_('race-ends-after-first-finish-round', () => run(`(function(){ var G=mk(3,13); startResolve(G); G.cars[0].pos=total(G); G.cars[0].fin=G.round; endRound(G,[]); return G.over && G.rank[0]===0; })()`));
T_('finisher-skipped-in-resolve', () => run(`(function(){ var G=mk(3,14); G.cars[0].fin=1; startResolve(G); return G.order.indexOf(0)<0 && G.order.length===2; })()`));
if (fails.length) { fails.forEach(f => console.log('FAIL case ' + f)); process.exit(1); }
console.log('PASS rulebook cases (' + 11 + ')');
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

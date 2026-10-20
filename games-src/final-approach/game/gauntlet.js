// Computer crew vs computer crew over the real engine. Usage:
//   node gauntlet.js [scenarios|all|green|yellow|red|black] [easy|normal|hard|all] [games] [seed0] [--inv] [--abil]
// Prints the landing success rate per scenario and level, average rounds, errors and stalls.
// Every decision goes through FA.AI.move, which strips the state first, so the AI never sees the partner's dice.
const T = require('./tlib.js'); require('./src/ai.js'); const { FA, D } = T;
const af = process.argv.find(a => a.startsWith('--aiw='));
if (af) { const code = require('fs').readFileSync(af.slice(6), 'utf8'); delete FA.AIW; (0, eval)(code); FA.AI.w = Object.assign({}, FA.AI.W0, (FA.AIW && FA.AIW.w) || {}); }
for (const [flag, key] of [['--nmc=', 'NMC'], ['--hmc=', 'HMC']]) { const a = process.argv.find(x => x.startsWith(flag)); if (a) { const [t, n] = a.slice(flag.length).split(',').map(Number); FA.AI[key] = { top: t, samples: n }; } }
FA.AI.NMC.ms = 0; FA.AI.HMC.ms = 0;   // fixed search size in tests, whatever the machine load
const wf = process.argv.find(a => a.startsWith('--W=')); if (wf) Object.assign(FA.AI.W, JSON.parse(wf.slice(4)));
const arg = process.argv.slice(2).filter(a => !a.startsWith('--')), flags = process.argv.slice(2).filter(a => a.startsWith('--'));
const which = (arg[0] || 'all'), lv = (arg[1] || 'normal'), N = +(arg[2] || 20), seed0 = +(arg[3] || 1000);
const scs = D.scenarios.filter(s => which === 'all' || which === s.col || which.split(',').includes(s.id));
const levels = lv === 'all' ? ['easy', 'normal', 'hard'] : lv.split(',');
const chooseAbil = (sc, rnd) => { const ids = Object.keys(D.abilities), out = []; const pool = ids.slice(); for (let i = 0; i < sc.ab && pool.length; i++) out.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]); return out; };
function play(sc, level, seed, o) {
  o = o || {}; let r = seed; const rnd = () => { r = (r * 1664525 + 1013904223) >>> 0; return r / 4294967296; };
  const G = FA.newGame({ scenario: sc.id, seed, abil: o.abil ? o.abil : (flags.includes('--abil') ? ['mastery', 'control'].slice(0, sc.ab) : chooseAbil(sc, rnd)), ai: [level, level] });
  let steps = 0, err = null;
  while (!G.result && steps++ < 600) {
    const seats = FA.pending(G); if (!seats.length) { err = 'no pending seat'; break; }
    const s = seats[0], m = FA.AI.move(G, s, level, { rand: rnd });
    if (!m) { err = 'no move for seat ' + s + ' phase ' + G.phase; break; }
    const res = FA.performMove(G, m, s); if (!res.ok) { err = 'AI move refused: ' + res.error + ' ' + JSON.stringify(m); break; }
    if (flags.includes('--inv')) { const e = FA.checkInvariants(G); if (e.length) { err = 'invariant: ' + e.join(';'); break; } }
  }
  if (!G.result && !err) err = 'stall';
  return { G, err, steps };
}
const t0 = Date.now(); let errors = 0, stalls = 0; const rows = [];
for (const level of levels) for (const sc of scs) {
  let win = 0, rounds = 0, why = {}, tn = 0, e = 0; const t1 = Date.now();
  for (let i = 0; i < N; i++) { const { G, err, steps } = play(sc, level, seed0 + i * 7919 + sc.id.charCodeAt(0) * 31); tn++; if (err) { e++; if (err === 'stall') stalls++; else errors++; if (e <= 2) console.log('ERR', sc.id, level, err); continue; } if (G.result.win) win++; else { const k = G.result.why === 'checks' ? 'checks:' + Object.keys(G.result.checks).filter(c => !G.result.checks[c]).join('+') : G.result.why; why[k] = (why[k] || 0) + 1; } rounds += G.round + 1; }
  rows.push({ level, id: sc.id, col: sc.col, win, n: tn, e });
  console.log((level + ' ' + sc.id + ' ' + sc.col + ' ' + D.airports[sc.ap].name).padEnd(44), String(win).padStart(3) + '/' + tn, (100 * win / tn).toFixed(0).padStart(3) + '%', 'avg rounds', (rounds / Math.max(1, tn - e)).toFixed(1), JSON.stringify(why), ((Date.now() - t1) / tn).toFixed(0) + 'ms/game');
}
for (const level of levels) for (const col of ['green', 'yellow', 'red', 'black']) { const r = rows.filter(x => x.level === level && x.col === col); if (!r.length) continue; const w = r.reduce((a, x) => a + x.win, 0), n = r.reduce((a, x) => a + x.n, 0); console.log('BAND', level, col, w + '/' + n, (100 * w / n).toFixed(1) + '%'); }
console.log('errors', errors, 'stalls', stalls, 'time', ((Date.now() - t0) / 1000).toFixed(1) + 's');
if (errors || stalls) process.exit(1);

// SPSA tuning of the AI's weights by self-play win rate (common random numbers for the +/- pair).
//   node tune.js <iterations> <workers> <games-per-eval> [scenarios] [out.json]
const { fork } = require('child_process'); const fs = require('fs'); const path = require('path');
const T = require('./tlib.js'); require('./src/ai.js'); const { FA, D } = T;
const ITER = +process.argv[2] || 20, NW = +process.argv[3] || 3, NG = +process.argv[4] || 156, which = process.argv[5] || 'green,yellow', OUT = process.argv[6] || 'data/tuned.json';
const scs = D.scenarios.filter(s => which === 'all' || which.split(',').some(x => x === s.col || x === s.id));
const names = [], base = [], kind = [];
for (const k of FA.AI.FN) if (k !== 'bias') { names.push(['w', k]); base.push(FA.AI.W0[k]); kind.push(Math.abs(FA.AI.W0[k]) < 0.2 ? 'lin' : 'log'); }
for (const k of ['planeS', 'flapQ', 'flapM', 'gearM', 'brakeM', 'brakeCoffee', 'iceP', 'internP', 'ax0', 'ax1', 'ax2', 'axR', 'axCoffee', 'axis1', 'axis2', 'tab', 'keroAvg', 'leakAvg', 'eff', 'choice', 'disaster']) { names.push(['c', k]); base.push(FA.AI.W[k]); kind.push('log'); }
let th = base.map((b, i) => kind[i] === 'log' ? Math.log(Math.max(1e-3, Math.abs(b))) : b);
const sign = base.map(b => b < 0 ? -1 : 1);
const val = th_ => th_.map((t, i) => kind[i] === 'log' ? sign[i] * Math.exp(t) : t);
const toObj = v => { const w = {}, c = {}; v.forEach((x, i) => { (names[i][0] === 'w' ? w : c)[names[i][1]] = x; }); return { w, c }; };
const workers = []; let pending = new Map(), idc = 0, readyN = 0;
for (let i = 0; i < NW; i++) { const p = fork(path.join(__dirname, 'evalw.js')); p.on('message', m => { if (m.ready) { readyN++; return; } const f = pending.get(m.id); if (f) { pending.delete(m.id); f(m); } }); workers.push(p); }
const free = workers.slice(); const q = [];
function run(vec, games) { return new Promise(res => { q.push({ vec, games, res }); pump(); }); }
function pump() { while (free.length && q.length) { const w = free.shift(), j = q.shift(); const id = ++idc; pending.set(id, m => { free.push(w); j.res(m.wins / m.n); pump(); }); const o = toObj(j.vec); w.send({ id, w: o.w, c: o.c, games: j.games }); } }
const mkGames = (seed0, n) => { const out = []; for (let i = 0; i < n; i++) out.push([scs[i % scs.length].id, seed0 + i * 7919]); return out; };
(async () => {
  await new Promise(r => { const t = setInterval(() => { if (readyN >= NW) { clearInterval(t); r(); } }, 100); });
  let rs = 12345; const rnd = () => { rs = (rs * 1664525 + 1013904223) >>> 0; return rs / 4294967296; };
  const log = []; const t0 = Date.now();
  const f0 = await run(val(th), mkGames(5000, NG)); console.log('start win rate', f0.toFixed(3));
  let best = { th: th.slice(), f: f0 };
  for (let it = 1; it <= ITER; it++) {
    const ak = 0.18 / Math.pow(it + 2, 0.5), ck = 0.18 / Math.pow(it, 0.15);
    const games = mkGames(100000 + it * 977, NG), pairs = [], jobs = [];
    const npair = Math.max(1, Math.floor(NW / 2));
    for (let p = 0; p < npair; p++) { const d = th.map(() => rnd() < 0.5 ? -1 : 1); pairs.push(d); jobs.push(run(val(th.map((t, i) => t + ck * d[i])), games), run(val(th.map((t, i) => t - ck * d[i])), games)); }
    const res = await Promise.all(jobs); const g = th.map(() => 0);
    for (let p = 0; p < npair; p++) { const diff = res[2 * p] - res[2 * p + 1]; for (let i = 0; i < th.length; i++) g[i] += diff / (2 * ck * pairs[p][i]) / npair; }
    th = th.map((t, i) => t + ak * g[i] * 1.0);
    log.push({ it, plus: res.filter((_, i) => i % 2 === 0).map(x => +x.toFixed(3)), minus: res.filter((_, i) => i % 2 === 1).map(x => +x.toFixed(3)) });
    if (it % 4 === 0 || it === ITER) { const f = await run(val(th), mkGames(900000 + it, NG * 2)); console.log('it', it, 'check win rate', f.toFixed(3), 'elapsed', ((Date.now() - t0) / 60000).toFixed(1) + ' min'); if (f >= best.f - 0.01) best = { th: th.slice(), f }; fs.writeFileSync(OUT, JSON.stringify({ it, f, vec: toObj(val(th)), best: toObj(val(best.th)), bestF: best.f, log })); }
    else console.log('it', it, JSON.stringify(log[log.length - 1]));
  }
  workers.forEach(w => w.kill()); process.exit(0);
})();

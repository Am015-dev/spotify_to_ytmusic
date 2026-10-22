#!/usr/bin/env node
// Waves (parts/waves.js, flag RET.waves). NODE_PATH=$(npm root -g) node games-src/nightrun/waves-test.js   env: RUNS=8 (human-model bot runs per stage) STAGES=1,2,3,4,5,6
// Gates (owner 22 Oct 2026: "stages extremely boring, a swarm of enemies, no logic"), measured with humanbot.js (Normal, fresh build, sim steps, not wall clock):
//  (a) max enemies on screen <= 8 in every run (all non-boss foes alive, swarm and mines count 1)
//  (b) every wave is announced by name in the top chip (banner.sm) the moment it starts
//  (c) >= 3 distinct enemy roles per stage (types of the waves that started)
//  (d) breathers: >= 3 s with no wave between two waves
//  (e) no wave foe leaves alive past the ship (holdline leaks <= 1 per run, median)
//  (f) human-model clear rate on Normal pooled over the stages 60-80% (stage 5's mini-boss is armour.js's; reported, not gated per stage)
//  (g) ?waves=0: no wave layer (log empty); (h) no page errors
const path = require('path'), cp = require('child_process'), fs = require('fs'), os = require('os');
const RUNS = process.env.RUNS || '8', STAGES = process.env.STAGES || '1,2,3,4,5,6';
const pass = [], fail = [], ok = (c, m) => (c ? pass : fail).push(m), med = a => { a = a.slice().sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : 0; };
const PRE = 'window.__recOut=m=>JSON.parse(JSON.stringify({log:window.WV?WV.log:null,kv:m.ST.kv,sv:m.ST.sv,kills:m.G.kills}))';
const run = (tag, q, stages, runs) => { const out = path.join(os.tmpdir(), 'wv-' + tag + '.json'); const r = cp.spawnSync('node', [path.join(__dirname, 'humanbot.js')], { env: Object.assign({}, process.env, { BOTS: 'human', BUILDS: 'fresh', STAGES: stages, RUNS: runs, PAR: '4', Q: q, PRE, JSON: out }), encoding: 'utf8', timeout: 900000 });
  return { res: JSON.parse(fs.readFileSync(out, 'utf8')), log: r.stdout || '' }; };
const nw = run('new', '', STAGES, RUNS), old = run('old', '&waves=0', '1,6', '2');
for (const l of (nw.log + old.log).split('\n')) if (/FAIL page error|RUN ERROR/.test(l)) fail.push('(h) ' + l.trim());
let clr = 0, tot = 0;
for (const n of STAGES.split(',').map(Number)) {
  const a = nw.res.filter(r => r.n === n && r.px && r.px.log); if (!a.length) { fail.push(`stage ${n}: no runs`); continue; }
  const mx = Math.max(...a.map(r => r.px.log.maxOn)), roles = new Set(), ann = [], gaps = [];
  for (const r of a) { const L = r.px.log; for (const w of L.waves) w.roles.forEach(x => roles.add(x));
    ann.push(L.ann.length === L.waves.length && L.ann.every(x => x.chip && /^(WAVE \d+\/\d+|MORE) · /.test(x.nm)));
    for (let i = 1; i < L.waves.length; i++) if (L.waves[i - 1].t1 != null) gaps.push(L.waves[i].t0 - L.waves[i - 1].t1); }
  const c = a.filter(r => r.clear).length; clr += c; tot += a.length;
  const lk = med(a.map(r => r.hl ? r.hl.n : 0)), nw0 = a[0].px.log.waves.length;
  console.log(`  stage ${n}: clear ${c}/${a.length}, waves/run ${med(a.map(r => r.px.log.waves.length))}, max on screen ${mx}, roles ${[...roles].join(' ')}, breather min ${Math.min(...gaps).toFixed(1)} s med ${med(gaps).toFixed(1)} s, leaks med ${lk}, culled med ${med(a.map(r => r.px.log.culled))}`);
  console.log(`           first run: ${a[0].px.log.waves.map(w => w.nm + '@' + w.t0.toFixed(0)).join(', ')}`);
  ok(mx <= 8, `(a) stage ${n} max enemies on screen ${mx} (<= 8)`);
  ok(ann.every(Boolean) && nw0 >= 4, `(b) stage ${n} every wave announced by name in the top chip (${nw0} waves in run 1)`);
  ok(roles.size >= 3, `(c) stage ${n} ${roles.size} distinct enemy roles (>= 3)`);
  ok(gaps.length && Math.min(...gaps) >= 3, `(d) stage ${n} breathers >= 3 s between waves (min ${Math.min(...gaps).toFixed(1)} s)`);
  ok(lk <= 1, `(e) stage ${n} leaks per run median ${lk} (<= 1)`);
}
const pct = 100 * clr / Math.max(1, tot);
ok(pct >= 60 && pct <= 80, `(f) human-model clear rate on Normal, stages ${STAGES} pooled ${clr}/${tot} = ${pct.toFixed(0)}% (60-80%)`);
ok(old.res.every(r => !r.px || !r.px.log || r.px.log.waves.length === 0), `(g) ?waves=0: no wave played (${old.res.length} runs)`);
for (const m of pass) console.log('PASS ' + m); for (const m of fail) console.log('FAIL ' + m);
console.log(fail.length ? 'FAIL waves-test' : 'PASS waves-test'); process.exit(fail.length ? 1 : 0);

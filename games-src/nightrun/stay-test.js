#!/usr/bin/env node
// Stay (parts/stay.js, flag RET.stay). NODE_PATH=$(npm root -g) node games-src/nightrun/stay-test.js   env: RUNS=3 BUILD=mid STAGES=8,12,16 WAVE=6
// Human-model bot (humanbot.js, Normal) with stay-rec.js on stages 8, 12, 16 and endless wave 6; ?stay=0 (old) against the default (new). Gates (22 Oct, owner: "enemies just fly and do not die"):
//  (a) share of foes that leave the screen alive <= 15% per stage        (b) median seconds on screen per foe >= 4 (killed or left)
//  (c) most foes on screen at one time <= 8 (worst run)                   (d) human-model clear rate on Normal pooled over the stages 55-80% (reported when RUNS < 8; gate when RUNS >= 8)
//  (e) no page errors. The old column is printed for the before/after report.
const cp = require('child_process'), fs = require('fs'), os = require('os'), path = require('path');
const RUNS = process.env.RUNS || '3', BUILD = process.env.BUILD || 'mid', STAGES = process.env.STAGES || '8,12,16', WAVE = process.env.WAVE || '6';
const rec = fs.readFileSync(path.join(__dirname, 'stay-rec.js'), 'utf8');
const med = a => { a = a.slice().sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : 0; };
const run = (tag, q, endless) => { const out = path.join(os.tmpdir(), `stay-${tag}.json`); const r = cp.spawnSync('node', [path.join(__dirname, 'humanbot.js')], { env: Object.assign({}, process.env, { BOTS: 'human', BUILDS: BUILD, STAGES: endless ? WAVE : STAGES, RUNS, PAR: '3', Q: q, PRE: rec, JSON: out }, endless ? { ENDLESS: '1' } : {}), encoding: 'utf8', timeout: 600000 });
  return { res: JSON.parse(fs.readFileSync(out, 'utf8')), log: r.stdout || '' }; };
const stat = (res, n) => { const a = res.filter(r => r.n === n && r.px); if (!a.length) return null; const dw = [].concat(...a.map(r => r.px.dwell)), k = a.reduce((s, r) => s + r.px.killed, 0), l = a.reduce((s, r) => s + r.px.left, 0);
  return { runs: a.length, clear: a.filter(r => r.clear).length, leave: 100 * l / Math.max(1, k + l), dwell: med(dw), maxOn: Math.max(...a.map(r => r.px.maxOn)), medMax: med(a.map(r => r.px.maxOn)), foes: k + l }; };
(async () => {
  const pass = [], fail = []; const ok = (c, m) => (c ? pass : fail).push(m);
  const nw = [run('new', '', false), run('newE', '', true)], old = [run('old', '&stay=0', false), run('oldE', '&stay=0', true)];
  for (const l of nw.concat(old).map(x => x.log).join('\n').split('\n')) if (/FAIL page error|RUN ERROR/.test(l)) ok(false, '(e) ' + l);
  let cl = [0, 0];
  const rows = [[8, 0], [12, 0], [16, 0], [WAVE, 1]].filter(r => r[1] || STAGES.split(',').includes(String(r[0])));
  for (const [n, e] of rows) { const a = stat(old[e].res, +n), b = stat(nw[e].res, +n); if (!a || !b) continue; const lab = e ? `endless wave ${n}` : `stage ${n}`;
    console.log(`  ${lab}: leave alive ${a.leave.toFixed(1)}% -> ${b.leave.toFixed(1)}%, median on screen ${a.dwell.toFixed(1)} -> ${b.dwell.toFixed(1)} s, most on screen ${a.maxOn} -> ${b.maxOn} (median of runs ${a.medMax} -> ${b.medMax}), clear ${a.clear}/${a.runs} -> ${b.clear}/${b.runs}`);
    ok(b.leave <= 15, `(a) ${lab} foes leaving alive ${b.leave.toFixed(1)}% (<= 15%, was ${a.leave.toFixed(1)}%)`);
    ok(b.dwell >= 4, `(b) ${lab} median time on screen ${b.dwell.toFixed(1)} s (>= 4, was ${a.dwell.toFixed(1)})`);
    ok(b.maxOn <= 8, `(c) ${lab} most foes on screen ${b.maxOn} (<= 8, was ${a.maxOn})`);
    if (!e) { cl[0] += b.clear; cl[1] += b.runs; } }
  const pc = cl[1] ? 100 * cl[0] / cl[1] : 0, gate = +RUNS >= 8;
  console.log(`  human-model clear rate, Normal, ${BUILD} build, stages ${STAGES}: ${cl[0]}/${cl[1]} = ${pc.toFixed(0)}%`);
  if (gate) ok(pc >= 55 && pc <= 80, `(d) clear rate ${pc.toFixed(0)}% (55-80%)`);
  for (const m of pass) console.log('PASS ' + m); for (const m of fail) console.log('FAIL ' + m);
  console.log(fail.length ? `FAIL stay-test: ${fail.length} check(s)` : 'PASS stay-test'); process.exit(fail.length ? 1 : 0);
})();

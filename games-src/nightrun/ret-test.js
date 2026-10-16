#!/usr/bin/env node
// Retention features test (shared). Each feature appends its own section below.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/ret-test.js      env: RUNS=4 STAGES=1,8,20,30
const cp = require('child_process'), fs = require('fs'), path = require('path');
const RUNS = process.env.RUNS || '4', STAGES = process.env.STAGES || '1,8,20,30', J = path.join(__dirname, 'playtest', 'story-sim.json');
let bad = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) bad++; };
const sim = (classic) => { cp.execFileSync('node', [path.join(__dirname, 'story-sim.js')], { env: Object.assign({}, process.env, { RUNS, STAGES, PAR: '4' }, classic ? { CLASSIC: '1' } : {}), stdio: 'ignore' }); return JSON.parse(fs.readFileSync(J, 'utf8')); };
const stat = r => { const o = {}; for (const n in r) { const a = r[n], c = a.filter(x => x.clear); o[n] = { clear: c.length / a.length, t: (c.length ? c : a).reduce((s, x) => s + x.t, 0) / (c.length ? c.length : a.length), max: Math.max(...a.map(x => x.t)) }; } return o; };
// ---- B4 arcade: ~3-minute stages ----
const arc = stat(sim(false)), cla = stat(sim(true));
const ids = STAGES.split(',');
const mean = o => ids.reduce((s, n) => s + o[n].t, 0) / ids.length;
console.log('stage  classic(s,clear)  arcade(s,clear,max)');
for (const n of ids) console.log(String(n).padStart(4), cla[n].t.toFixed(0).padStart(6), Math.round(cla[n].clear * 100) + '%', ' | ', arc[n].t.toFixed(0).padStart(5), Math.round(arc[n].clear * 100) + '%', arc[n].max.toFixed(0));
ok(mean(arc) <= 190, 'arcade mean stage length ' + mean(arc).toFixed(0) + ' s <= 190 (classic ' + mean(cla).toFixed(0) + ')');
ok(ids.every(n => arc[n].max <= 240), 'no arcade stage over 240 s');
ok(ids.every(n => arc[n].t <= cla[n].t + 1), 'arcade never longer than classic');
ok(ids.every(n => Math.abs(arc[n].clear - cla[n].clear) <= .1 + (RUNS < 8 ? .25 : 0)), 'clear rate within 10% of classic (sample slack at few runs)');
process.exit(bad ? 1 : 0);

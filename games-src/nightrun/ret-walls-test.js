#!/usr/bin/env node
// Nightrun WALLS check (RET.walls): the story bot's clear-rate curve is smooth. PASS/FAIL lines; exit 1 on any FAIL.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/ret-walls-test.js     env: RUNS=8 (per stage) GAME_DIR=...
// Gates (small RUNS are noisy, so they are loose): every sampled main stage clears >= 50% (RUNS<12) or 55%; the wall stages are no more than 30 (25 at RUNS>=12) points
// under the mean of their two sampled neighbours; mean hits per stage <= 6; and the flag is real (walls off = the old kill goal).
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const RUNS = +process.env.RUNS || 8, FLOOR = RUNS >= 12 ? 55 : 50, DIP = RUNS >= 12 ? 25 : 30;
const res = []; const ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || !i ? '' : ' :: ' + i)); };
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const WALLS = [23, 30, 39, 40], STAGES = [11, 12, 18, 22, 23, 24, 29, 30, 31, 38, 39, 40];
(async () => {
  const jf = path.join(__dirname, 'playtest', 'story-sim.json'), keep = fs.existsSync(jf) ? fs.readFileSync(jf) : null;
  const out = cp.spawnSync('node', [path.join(__dirname, 'story-sim.js')], { env: Object.assign({}, process.env, { RUNS: String(RUNS), STAGES: STAGES.join(','), PAR: '4' }), encoding: 'utf8', maxBuffer: 1e7 }).stdout || '';
  if (keep) fs.writeFileSync(jf, keep);
  const row = {}; for (const l of out.split('\n')) { const m = l.match(/^\s*(\d+)\s+(\d+)%\s+\d+\s+([\d.]+)/); if (m) row[+m[1]] = { c: +m[2], h: +m[3] }; }
  ok('sim produced every sampled stage', STAGES.every(n => row[n]), out.slice(0, 300));
  for (const n of STAGES) if (row[n]) ok(`stage ${n} clear ${row[n].c}% >= ${FLOOR}%  (hits ${row[n].h})`, row[n].c >= FLOOR);
  for (const n of WALLS) { const a = row[n - 1], b = row[n + 1], r = row[n]; if (!a || !b || !r) continue; const avg = (a.c + b.c) / 2; ok(`stage ${n} (${r.c}%) within ${DIP} of its neighbours (${a.c}%,${b.c}% -> ${avg}%)`, r.c >= avg - DIP); }
  const mh = STAGES.reduce((s, n) => s + (row[n] ? row[n].h : 0), 0) / STAGES.length; ok('mean hits per sampled stage ' + mh.toFixed(1) + ' <= 6', mh <= 6);
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', port, '--bind', '127.0.0.1'], { cwd: GAME_DIR, stdio: 'ignore' }); await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(), p = await br.newPage({ viewport: { width: 960, height: 540 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1`); await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 8000 }).catch(() => { });
  const kv = await p.evaluate(() => { const m = window.__mnr, g = n => { m.startStory(n); const k = m.ST.kv; m.abort(); return k; }; const on = g(23); m.RET.walls = false; const off = g(23); m.RET.walls = true; return { on, off }; });
  ok(`flag: stage 23 kill goal ${kv.on} (walls on) < ${kv.off} (walls off)`, kv.on < kv.off);
  ok('no page errors', !errs.length, errs[0]);
  await br.close(); srv.kill();
  const bad = res.filter(x => !x).length; console.log(bad ? `${bad} FAIL` : 'ALL PASS'); process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });

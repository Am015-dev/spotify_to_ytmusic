#!/usr/bin/env node
// RETENTION B2: hours to buy everything. Sums every price from the live page (RET.totalCost) and measures Neon per hour with story-sim (stages 1, 8, 20, 30).
//   NODE_PATH=$(npm root -g) node games-src/nightrun/econ-test.js     env: RUNS=2 GAME_DIR=...
// hours = story time (first clears pay out while you play) + what is still missing at the median Neon/h of replayed stages (a replay also pays 10% of its base).
// PASS when 9 <= hours <= 13.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(), p = await br.newPage(); await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1`);
  await p.waitForFunction(() => window.__mnr && window.RET, null, { timeout: 8000 });
  const cost = await p.evaluate(() => ({ on: (RET.econ = true, RET.totalCost()), off: (RET.econ = false, RET.totalCost()) })); await br.close(); srv.kill();
  const sim = path.join(__dirname, 'story-sim.js'), env = Object.assign({}, process.env, { STAGES: '1,8,20,30', RUNS: process.env.RUNS || '2', PC: '.4', PAR: '4' });
  cp.spawnSync('node', [sim], { env, stdio: 'ignore' });
  const js = JSON.parse(fs.readFileSync(path.join(__dirname, 'playtest', 'story-sim.json'), 'utf8')), all = [].concat(...Object.values(js)).filter(r => r.clear);
  const sec = all.reduce((a, r) => a + r.t, 0), neon = all.reduce((a, r) => a + r.neon, 0), perH = neon / (sec / 3600);
  const base = all.reduce((a, r) => a + (40 + 12 * r.n) * .1, 0), perHr = perH + base / (sec / 3600);          // replay: + 10% clear pay
  // first clears of all 45 stages: 40+12n each, +25 for ~2.5 stars on average, plus the Neon the stages themselves bank; the story takes ~146 min
  let first = 0; for (let n = 1; n <= 45; n++) first += 40 + 12 * n + 25 * 2.5;
  const storyH = 146 / 60, storyNeon = perH * storyH + first, left = Math.max(0, cost.on - storyNeon), hours = storyH + left / perHr;
  console.log(`full garage cost: ${cost.on} Neon (was ${cost.off})`);
  console.log(`median Neon per hour: ${perH.toFixed(0)} from play, ${perHr.toFixed(0)} with replay clear pay (${all.length} clears)`);
  console.log(`story first-clear pay: ${first.toFixed(0)} Neon over ${storyH.toFixed(1)} h`);
  console.log(`hours to buy everything: ${hours.toFixed(1)} (before: ${(cost.off / 390).toFixed(0)})`);
  const pass = hours >= 9 && hours <= 13; console.log((pass ? 'PASS' : 'FAIL') + ' hours in 9-13'); process.exit(pass ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });

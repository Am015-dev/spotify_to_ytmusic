#!/usr/bin/env node
// Screenshots of the painted-art update into games-src/nightrun/playtest/i-*.png: title, mid-run, boss, Athens, garage, game over, at 390x763 and 1280x800.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/i-shots.js        env: ONLY=title,run,boss,athens,garage,over
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun'), OUT = path.join(__dirname, 'playtest');
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean), want = n => !ONLY.length || ONLY.includes(n);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const bot = (fs.readFileSync(path.join(__dirname, 'f-shots.js'), 'utf8').match(/const bot = `([\s\S]*?)`;/) || [])[1];   // the same dodging bot as f-shots.js
function freePort() { return new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); }); }
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(800);
  const browser = await PW.chromium.launch(), errs = [];
  const open = async (w, h, init) => { const touch = w < 600, ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1, userAgent: touch ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1' : undefined });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    if (init) await p.addInitScript(init);
    await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1&all=1`); await p.waitForFunction(() => window.__mnr); await sleep(1800); return p; };
  const shot = async (p, name, w) => { await p.screenshot({ path: path.join(OUT, 'i-' + name + '-' + w + '.png') }); console.log('  i-' + name + '-' + w + '.png'); };
  const run = (p, fn, a) => p.evaluate(fn, a);
  const startRun = async p => { await run(p, () => { document.getElementById('startBtn').click(); }); await sleep(300); };
  for (const [w, h] of [[390, 763], [1280, 800]]) {
    if (want('title')) { const p = await open(w, h); await shot(p, 'title', w); await p.context().close(); }
    if (want('run')) { const p = await open(w, h); await startRun(p); await run(p, () => { const m = __mnr; m.god = true; m.G.dbar = 18; m.DIR.bar = 17; m.DIR.theme = null; }); await p.evaluate(bot); await sleep(9000); await shot(p, 'run', w); await p.context().close(); }
    if (want('boss')) { const p = await open(w, h); await startRun(p); await run(p, () => { const m = __mnr; m.god = true; m.G.dt = 1e9; }); await p.evaluate(bot); await p.waitForFunction(() => __mnr.G.boss, null, { timeout: 40000 }); await sleep(900); await shot(p, 'boss-intro', w); await sleep(7000); await shot(p, 'boss', w); await p.context().close(); }
    if (want('athens')) { const p = await open(w, h); await startRun(p); await run(p, () => { const m = __mnr; m.god = true; m.skipTo(4); m.G.dbar = 12; }); await p.evaluate(bot); await sleep(12000); await shot(p, 'athens', w); await p.context().close(); }
    if (want('garage')) { const own = JSON.stringify({ ship_tri: true, ship_swg: true, ship_syn: true, ship_hv: true, ship_ec: true }), p = await open(w, h, `localStorage.setItem('mnr_bank','900');localStorage.setItem('mnr_own',${JSON.stringify(own)});`);
      await run(p, () => { document.getElementById('gaBtn').click(); }); await sleep(500); await shot(p, 'garage', w); await p.context().close(); }
  }
  await browser.close(); srv.kill();
  if (errs.length) console.log('PAGE ERRORS', errs.slice(0, 5)); else console.log('no page errors');
})().catch(e => { console.error(e); process.exit(2); });

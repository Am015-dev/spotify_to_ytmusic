#!/usr/bin/env node
// Enemy bullets on screen, before vs after (mid-stage, district 2, god mode, 35 s per run): screenshots at the busiest moment into playtest/.
//   NODE_PATH=$(npm root -g) OLD=<dir with the old index.html> node games-src/nightrun/bullet-shots.js
const PW = require('playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const NEW = path.resolve(__dirname, '../../games/mainhattan-nightrun'), OLD = process.env.OLD, OUT = path.join(__dirname, 'playtest');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
(async () => {
  const br = await PW.chromium.launch();
  for (const [label, dir] of (process.env.ONLY === 'after' ? [['after', NEW]] : [['before', OLD], ['after', NEW]])) {
    const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', dir], { stdio: 'ignore' }); await sleep(700);
    for (const [name, w, h, touch] of [['390x763', 390, 763, true], ['1280x800', 1280, 800, false]].filter(c => !process.env.SIZE || c[0] === process.env.SIZE)) {
      const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch }), p = await ctx.newPage(); await p.route(/fonts\./, r => r.abort());
      await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1`); await p.waitForFunction(() => window.__mnr);
      await p.evaluate(() => { __mnr.SET.auto = true; __mnr.applySet(); }); await p.click('#startBtn'); await p.waitForFunction(() => __mnr.running);
      await p.evaluate(() => { const m = __mnr; m.god = true; m.skipTo(2); setInterval(() => { if (m.G.live) { m.P.y = 270 + 160 * Math.sin(m.G.t * .7); m.P.x = 200; } }, 30); });
      let max = 0, sum = 0, n = 0, shot = false; const t0 = Date.now();
      while (Date.now() - t0 < 35000) { await sleep(250); if (Date.now() - t0 < 4000) continue; const c = await p.evaluate(() => __mnr.G.eb.length); sum += c; n++; if (c > max) { max = c; shot = true; } if (shot && c >= max) { await p.screenshot({ path: path.join(OUT, `bullets-${label}-${name}.png`) }); shot = false; } }
      console.log(label, name, 'avg', (sum / n).toFixed(1), 'max', max); await ctx.close();
    }
    srv.kill();
  }
  await br.close();
})();

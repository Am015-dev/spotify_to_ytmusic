#!/usr/bin/env node
// W294: 10 s of real flight play as a video (Playwright recordVideo), turned into a GIF by gif.sh. NODE_PATH=$(npm root -g) node gif.js /tmp/nrzip /tmp/vid
const PW = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const DIR = process.argv[2], VID = process.argv[3], sleep = ms => new Promise(r => setTimeout(r, ms));
const MIME = { html: 'text/html', js: 'text/javascript', json: 'application/json', webp: 'image/webp', png: 'image/png', mp3: 'audio/mpeg', webmanifest: 'application/manifest+json' };
const srv = http.createServer((q, res) => { const u = decodeURIComponent(q.url.split('?')[0]); const f = path.join(DIR, u === '/' ? 'index.html' : u);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; return res.end(); } res.setHeader('content-type', MIME[f.split('.').pop()] || 'application/octet-stream'); fs.createReadStream(f).pipe(res); }).listen(18104, '127.0.0.1');
(async () => {
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const c = await br.newContext({ viewport: { width: 960, height: 540 }, recordVideo: { dir: VID, size: { width: 960, height: 540 } } }); const p = await c.newPage();
  await p.addInitScript(() => { try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_tut', '2'); } catch (e) { } });
  await p.goto('http://127.0.0.1:18104/index.html'); await p.waitForFunction(() => window.__mnr); await sleep(3000);
  await p.click('#focFlight');
  for (let i = 0; i < 8; i++) { await sleep(450); await p.evaluate(() => { const x = document.getElementById('taleCard'); if (x && !x.hidden) (document.getElementById('taleTc') || x).click(); }); }
  await sleep(1500); const t0 = Date.now(); console.log('START_MS', Date.now()); await p.keyboard.down('Space');
  while (Date.now() - t0 < 11000) { const d = (Math.floor((Date.now() - t0) / 1000) % 2) ? 'ArrowLeft' : 'ArrowRight'; await p.keyboard.down(d); await sleep(450); await p.keyboard.up(d); await p.keyboard.down(Math.floor((Date.now() - t0) / 1500) % 2 ? 'ArrowUp' : 'ArrowDown'); await sleep(200); await p.keyboard.up(Math.floor((Date.now() - t0) / 1500) % 2 ? 'ArrowUp' : 'ArrowDown'); }
  await c.close(); await br.close(); srv.close();
})();

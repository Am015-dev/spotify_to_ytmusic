#!/usr/bin/env node
// effects drawn from black-square pictures get transparent corners at load (real page). PASS/FAIL lines.
const PW = require('playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
let bad = 0; const ok = (n, p, i) => { if (!p) bad++; console.log((p ? 'PASS ' : 'FAIL ') + n + (p || !i ? '' : ' :: ' + i)); };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', port, '--bind', '127.0.0.1'], { cwd: GAME_DIR, stdio: 'ignore' }); await sleep(800);
  const br = await PW.chromium.launch(), p = await br.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.__mnr.ART); await sleep(2500);
  const r = await p.evaluate(() => { const out = {}; for (const n of ['fx-shot-std', 'fx-shot-hv', 'fx-bullet-enemy', 'fx-explosion-small', 'fx-explosion-big', 'fx-hit-spark', 'fx-muzzle', 'fx-shockwave', 'fx-engine']) { const b = __mnr.ART.bm[n]; if (!b) { out[n] = 'missing'; continue; }
    const c = document.createElement('canvas'); c.width = b.width; c.height = b.height; const g = c.getContext('2d'); g.drawImage(b, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data;
    const cor = [0, (c.width - 1) * 4, ((c.height - 1) * c.width) * 4, (c.height * c.width - 1) * 4].map(o => d[o + 3]); let mx = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > mx) mx = d[i]; out[n] = { cor, mx }; } return out; });
  for (const [n, v] of Object.entries(r)) ok(`${n}: corners transparent, centre visible`, v !== 'missing' && v.cor.every(a => a < 12) && v.mx > 150, JSON.stringify(v));
  ok('no page errors', errs.length === 0, errs[0]);
  await br.close(); srv.kill(); console.log(bad ? 'FAILURES' : 'ALL PASS'); process.exit(bad ? 1 : 0);
})();

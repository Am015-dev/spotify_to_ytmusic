// W420 shots: title, map, clean Play (Hints off), Goal card, fight with Hints on (card lifted), boss intro, reward at 390x763 (touch) and 1440x860. Run: node tools/shots-v3.js [outdir]
// Writes PNGs to outdir (default playable-shots/), then python converts them to v3-*.webp.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = process.argv[2] || path.join(ROOT, 'playable-shots'); fs.mkdirSync(OUT, { recursive: true });
const MT = { '.html': 'text/html', '.webp': 'image/webp', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.json': 'application/json' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); let p = path.join(ROOT, u); if (!fs.existsSync(p) || fs.statSync(p).isDirectory()) p = path.join(ROOT, '..', '..', 'games', 'emberclimb', u); if (u === '/' ) p = path.join(ROOT, 'emberclimb.html'); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': MT[path.extname(p)] || 'application/octet-stream' }); r.end(d); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await new Promise(r => srv.listen(0, r)); const base = 'http://127.0.0.1:' + srv.address().port + '/emberclimb.html';
  const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] }); let bad = 0;
  for (const [vn, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await br.newContext({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 }); const errs = [];
    const shot = async (name, url, prep) => { const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(name + ': ' + e.message)); await pg.goto(url); await sleep(1500); if (prep) await prep(pg); await pg.screenshot({ path: path.join(OUT, 'v3-' + name + '-' + vn + '.png') }); await pg.close(); };
    await shot('title', base + '?noguide=1', async pg => { await pg.evaluate(() => { try { document.querySelectorAll('[data-gxt-skip]').forEach(b => b.click()); } catch (e) { } }); await sleep(500); });
    await shot('map', base + '?scn=ec-map');
    await shot('play-clean', base + '?scn=ec-fight', async pg => { await pg.evaluate(() => UI.setHints(false)); await sleep(400); });
    await shot('goal', base + '?noguide=1', async pg => { await pg.evaluate(() => { document.querySelectorAll('[data-gxt-skip]').forEach(b => b.click()); UI.goalCard(); }); await sleep(400); });
    await shot('fight', base + '?scn=ec-fight', async pg => { await pg.evaluate(() => UI.setHints(true)); await sleep(300); const c = await pg.$('.hand .card.ok'); if (c) { await c.click(); await sleep(500); } });
    await shot('boss-intro', base + '?scn=bossintro', async pg => { await sleep(2600); });
    await shot('reward', base + '?scn=ec-reward', async pg => { await pg.evaluate(() => UI.setHints(true)); await sleep(600); });
    if (errs.length) { bad++; console.log('FAIL page errors', vn, errs.slice(0, 3).join(' | ')); } else console.log('PASS shots', vn);
    await ctx.close();
  }
  await br.close(); srv.close(); process.exit(bad ? 1 : 0);
})();

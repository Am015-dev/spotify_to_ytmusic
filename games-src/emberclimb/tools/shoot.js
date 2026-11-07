// Screenshots for the first-minute critique: title, guide steps 1-3, first turn, enemy turn, result. Run: node tools/shoot.js <outdir>
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = process.argv[2] || path.join(ROOT, 'shots'); fs.mkdirSync(OUT, { recursive: true });
const srv = http.createServer((q, r) => { let p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(p)) p = path.join(ROOT, '..', '..', 'games', 'emberclimb', decodeURIComponent(q.url.split('?')[0])); if (p.endsWith('/')) p += 'emberclimb.html'; fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': p.endsWith('.html') ? 'text/html' : p.endsWith('.webp') ? 'image/webp' : 'application/octet-stream' }); r.end(d); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await new Promise(r => srv.listen(0, r)); const base = 'http://127.0.0.1:' + srv.address().port + '/emberclimb.html';
  const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await br.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }); const pg = await ctx.newPage(); const errs = [];
    pg.on('pageerror', e => errs.push(e.message));
    const shot = async n => { await sleep(500); await pg.screenshot({ path: path.join(OUT, name + '-' + n + '.png') }); };
    await pg.goto(base); await pg.waitForSelector('#title'); await sleep(800); await shot('1-title');
    await pg.click('.gxt-menu'); await sleep(900); await shot('2-tut1');
    for (let i = 2; i <= 3; i++) { const nb = await pg.$('.gxt-next'); if (nb && await nb.isVisible()) await nb.click(); await sleep(800); await shot((i + 1) + '-tut' + i); }
    // quick game first turn
    await pg.goto(base); await pg.waitForSelector('#title'); await pg.evaluate(() => { try { GXT.skip && GXT.skip(); } catch (e) { } localStorage.setItem('gxt-done-emberclimb', '1'); UI.sub = 'quick'; UI.render(); }); await sleep(300); await shot('5-quickpick');
    await pg.click('#play'); await sleep(500); await shot('6-map'); await pg.click('.node.glow'); await sleep(900); await shot('7-firstturn');
    await pg.click('#end'); await sleep(700); await shot('8-enemyturn');
    await pg.evaluate(() => { const g = EC.E.G(); g.b.en.forEach(e => e.hp = 1); }); await sleep(1500);
    await pg.evaluate(() => { const g = EC.E.G(); g.hs[0].hp = 0; }); await sleep(100);
    console.log(name, 'errors', errs.length, errs.slice(0, 2).join('|'));
    await ctx.close();
  }
  await br.close(); srv.close();
})();

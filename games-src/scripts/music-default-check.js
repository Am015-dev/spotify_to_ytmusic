// Tiny check: a fresh profile's looping music slots default to 'all' (Shuffle all songs), no page errors. 390x763.
// NODE_PATH=/opt/node-tools/node_modules node games-src/scripts/music-default-check.js <slug> [more slugs]   (GAMES_DIR overrides games/)
const path = require('path'), http = require('http'), fs = require('fs');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..', '..'), GAMES = process.env.GAMES_DIR ? path.resolve(process.env.GAMES_DIR) : path.join(ROOT, 'games');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.mp3': 'audio/mpeg', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.css': 'text/css' };
const srv = http.createServer((q, r) => { let p = path.join(path.resolve(GAMES, '..') === ROOT && !process.env.GAMES_DIR ? ROOT + '/games' : GAMES, decodeURIComponent(q.url.split('?')[0])); if (p.endsWith('/')) p += 'index.html'; fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': MIME[path.extname(p)] || 'application/octet-stream' }); r.end(d); } }); });
(async () => {
  await new Promise(r => srv.listen(0, r)); const port = srv.address().port; let bad = 0;
  const b = await chromium.launch();
  for (const slug of process.argv.slice(2)) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true }), pg = await ctx.newPage(), errs = [];
    pg.on('pageerror', e => errs.push(String(e).slice(0, 120)));
    await pg.goto(`http://localhost:${port}/${slug}/`, { waitUntil: 'load' }); await pg.waitForTimeout(2500);
    const got = await pg.evaluate(() => {
      const tryEval = ex => { try { return (0, eval)(ex); } catch (e) { return undefined; } };
      const g = window.GXMUS && GXMUS.state().eff; if (g) return { src: 'GXMUS', v: g };
      for (const ex of ['MUS.pick', 'SND.pick', 'MS.pick']) { const v = tryEval(ex); if (v && typeof v === 'object') return { src: ex, v }; }
      return null;
    });
    const ok = got && ['tavern', 'main', 'fight'].every(k => got.v[k] === 'all');
    if (!ok || errs.length) bad++;
    console.log((ok && !errs.length ? 'PASS ' : 'FAIL ') + slug, got ? got.src + ' ' + JSON.stringify(got.v) : 'no picker found', errs.join(' | '));
    await ctx.close();
  }
  await b.close(); srv.close(); process.exit(bad ? 1 : 0);
})();

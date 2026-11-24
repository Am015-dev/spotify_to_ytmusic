// credits-check.js <slug> [slug...]   (env GAMES_DIR = folder holding <slug>/index.html, default ./games; NODE_PATH must reach playwright)
// Loads each built game at 402x874, opens the menu and every dialog reachable from it, and fails when the page logs a console error
// or shows any credit/advert text. Exit code 1 on any failure.
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(process.env.GAMES_DIR || path.join(__dirname, '..', '..', 'games'));
const BAD = ['Credits', 'credits', 'Ko-fi', 'SIL', 'Font:', 'Fonts:', 'Music by', 'Art by', 'Icons:', 'licen'];
const MIME = { html: 'text/html', js: 'text/javascript', css: 'text/css', json: 'application/json', webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', svg: 'image/svg+xml', mp3: 'audio/mpeg', ogg: 'audio/ogg', webmanifest: 'application/json', woff2: 'font/woff2' };
const srv = http.createServer((q, r) => {
  let p = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (p.endsWith('/')) p += 'index.html';
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { r.statusCode = 404; return r.end(); }
  r.setHeader('content-type', MIME[p.split('.').pop()] || 'application/octet-stream'); fs.createReadStream(p).pipe(r);
});
const OPEN = /(menu|settings|about|how to play|rules|help|options|more|info|cards|stats|statistics|privacy|tips|☰|≡|⚙)/i;
(async () => {
  const slugs = process.argv.slice(2); if (!slugs.length) { console.log('usage: credits-check.js <slug>...'); process.exit(2); }
  await new Promise(ok => srv.listen(0, ok)); const base = 'http://127.0.0.1:' + srv.address().port;
  const br = await chromium.launch({ args: ['--no-sandbox'] }); let failed = 0;
  for (const slug of slugs) {
    const pg = await (await br.newContext({ viewport: { width: 402, height: 874 }, hasTouch: true })).newPage();
    const errs = [], hits = new Set(), seen = new Set();
    pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
    pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()); });
    const scan = async () => { const t = await pg.evaluate(() => document.body.innerText).catch(() => ''); BAD.forEach(b => { if (t.includes(b)) hits.add(b); }); };
    await pg.goto(base + '/' + slug + '/', { waitUntil: 'load' }).catch(e => errs.push('goto: ' + e.message));
    await pg.waitForTimeout(1500); await scan();
    const labelsNow = () => pg.evaluate(re => [...document.querySelectorAll('button,a,[role=button],.btn,summary')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; })
      .map(e => (e.innerText || e.getAttribute('aria-label') || e.title || '').trim()).filter(t => t && t.length < 40 && new RegExp(re, 'i').test(t)), OPEN.source);
    const startGame = async () => { // best effort: leave the start screen so the in-game menu exists (tries Play/Start/Begin/Continue/Quick)
      for (const re of [/^\s*(play|start|begin|quick)/i, /^\s*(play|start|begin|go|ok|got it|continue|skip)/i]) {
        const b = pg.locator('button,[role=button],.btn').filter({ hasText: re }).first();
        if (await b.count()) { await b.click({ timeout: 1500, force: true }).catch(() => { }); await pg.waitForTimeout(1200); break; } } };
    const reopen = async path => { await pg.goto(base + '/' + slug + '/', { waitUntil: 'load' }).catch(() => { }); await pg.waitForTimeout(900); await startGame();
      for (const l of path) await pg.locator('button,a,[role=button],.btn,summary').filter({ hasText: l }).first().click({ timeout: 1500, force: true }).then(() => pg.waitForTimeout(450)).catch(() => { }); };
    // depth-first up to 3 levels: every menu-like button, then the menu-like buttons it reveals, each from a fresh page load
    const walk = async (path, depth) => {
      const here = new Set(await labelsNow());
      for (const l of here) {
        if (path.includes(l)) continue; const p2 = [...path, l]; seen.add(p2.join(' > '));
        await reopen(path); await pg.locator('button,a,[role=button],.btn,summary').filter({ hasText: l }).first().click({ timeout: 1500, force: true }).then(() => pg.waitForTimeout(450)).catch(() => { });
        await scan();
        if (depth < 3) { const before = here; const sub = (await labelsNow()).filter(x => !before.has(x)); if (sub.length) await walk(p2, depth + 1); }
      }
    };
    await startGame(); await scan();
    await walk([], 1);
    const ok = !errs.length && !hits.size; if (!ok) failed++;
    console.log((ok ? 'PASS ' : 'FAIL ') + slug + ' (opened: ' + [...seen].join(' | ') + ')' + (hits.size ? ' CREDIT TEXT: ' + [...hits].join(', ') : '') + (errs.length ? ' ERRORS: ' + errs.slice(0, 3).join(' ; ') : ''));
  }
  await br.close(); srv.close(); process.exit(failed ? 1 : 0);
})();

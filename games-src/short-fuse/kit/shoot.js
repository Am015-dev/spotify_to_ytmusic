// Screenshot + timing harness. Usage: node shoot.js <outdir> [views...]
// Serves demo.html at https://gns.test/ via context.route; Google Fonts are served from ./fontcache; all other hosts aborted.
const PW = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs'), path = require('path');
const HERE = __dirname, OUT = path.resolve(process.argv[2] || path.join(HERE, 'shots'));
const views = process.argv.slice(3);
fs.mkdirSync(OUT, { recursive: true });
const html = fs.readFileSync(path.join(HERE, 'demo.html'));
const fcss = fs.readFileSync(path.join(HERE, 'fontcache', 'fonts.css'));
async function route(ctx) {
  await ctx.route('**/*', r => {
    const u = new URL(r.request().url());
    if (u.host === 'gns.test') return r.fulfill({ status: 200, contentType: 'text/html', body: html });
    if (u.host === 'fonts.googleapis.com') return r.fulfill({ status: 200, contentType: 'text/css', body: fcss });
    if (u.host === 'fonts.gstatic.com') { const f = path.join(HERE, 'fontcache', path.basename(u.pathname)); if (fs.existsSync(f)) return r.fulfill({ status: 200, contentType: 'font/woff2', body: fs.readFileSync(f) }); }
    return r.abort();
  });
}
const SIZES = { '1366x768': [1366, 768], '1920x1080': [1920, 1080], '768x1024': [768, 1024], '390x844': [390, 844] };
(async () => {
  const br = await PW.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const log = [];
  const run = async (name, w, h, q, fn, extra) => {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await route(ctx); const pg = await ctx.newPage(); pg.setDefaultTimeout(150000);
    const errs = []; pg.on('pageerror', e => errs.push('pageerror: ' + e)); pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
    await pg.goto('https://gns.test/?static&noqbar&gfx=' + q + (extra || ''));
    await pg.waitForFunction(() => window.DEMO_READY === true);
    await pg.waitForTimeout(1500);
    const r = fn ? await fn(pg) : null;
    const st = await pg.evaluate(() => window.SFKit && SFKit.stats());
    log.push({ name, q, w, h, stats: st, errs, r });
    console.log(name, q, JSON.stringify(st), errs.length ? errs.join(' | ') : '');
    await ctx.close();
  };
  const shot = (file, clip) => async pg => { await pg.screenshot({ path: path.join(OUT, file), clip }); };
  const want = n => !views.length || views.includes(n);
  for (const k of Object.keys(SIZES)) if (want(k)) await run(k, SIZES[k][0], SIZES[k][1], P(k), shot(k + '.png'));
  function P(k) { return k === '390x844' ? 'medium' : 'high'; }
  if (want('close')) await run('close', 1366, 768, 'high', async pg => {
    const snap = async (fn, file) => { await pg.evaluate(fn); await pg.evaluate(() => SFKit.setSpeed(1000)); await pg.waitForTimeout(600); await pg.evaluate(() => SFKit.setSpeed(1)); await pg.waitForTimeout(2500); await pg.screenshot({ path: path.join(OUT, file) }); };
    await snap(() => SFKit.focus({ kind: 'stand', seat: 0 }, 2.3), 'close-stand.png');
    await snap(() => { const K = SFKit._K; const c = Object.values(K.recs).find(r => r.key === '0:0' && r.data.cut); SFKit.focus(c.id, 5.5); }, 'close-cut.png');
    await snap(() => SFKit.focus('dial', 4.2), 'close-dial.png');
    await snap(() => SFKit.focus({ kind: 'stand', seat: 2 }, 2.6), 'close-opp.png');
    await snap(() => { const K = SFKit._K; SFKit.focus({ x: K.layout.BL.equip.x0 + 4, y: .3, z: K.layout.BL.equip.z }, 3.2); }, 'close-gear.png');
  });
  if (want('fx')) await run('fx', 1366, 768, 'high', async pg => {
    await pg.evaluate(() => SFKit.setSpeed(0.12));
    await pg.evaluate(() => DEMO.cut()); await pg.waitForTimeout(500); await pg.screenshot({ path: path.join(OUT, 'fx-cut-mid.png') });
    await pg.waitForTimeout(9000); await pg.screenshot({ path: path.join(OUT, 'fx-cut-done.png') });
    await pg.waitForTimeout(1500);
    await pg.evaluate(() => DEMO.boom()); await pg.waitForTimeout(350); await pg.screenshot({ path: path.join(OUT, 'fx-boom.png') });
    await pg.waitForTimeout(12000); await pg.evaluate(() => DEMO.phew()); await pg.waitForTimeout(400); await pg.screenshot({ path: path.join(OUT, 'fx-phew.png') });
    await pg.waitForTimeout(12000); await pg.evaluate(() => DEMO.win()); await pg.waitForTimeout(1300); await pg.screenshot({ path: path.join(OUT, 'fx-win.png') }); await pg.evaluate(() => SFKit.setSpeed(1));
    const anim = await pg.evaluate(() => SFKit.isAnimating()); await pg.waitForTimeout(9000); const anim2 = await pg.evaluate(() => SFKit.isAnimating());
    return { animDuring: anim, animAfter: anim2 };
  });
  if (want('perf')) for (const q of ['high', 'medium', 'low']) await run('perf-' + q, 1366, 768, q, async pg => { await pg.waitForTimeout(4000); await pg.evaluate(() => SFKit.resetStats()); await pg.waitForTimeout(20000); return await pg.evaluate(() => SFKit.stats()); });
  if (want('2d')) await run('2d', 390, 844, 'high', shot('2d-390x844.png'), '&2d');
  fs.writeFileSync(path.join(OUT, 'log.json'), JSON.stringify(log, null, 1));
  await br.close();
})();

// Usage: node shoot.js <outdir> [views...]  views: 1366x768 390x844 fx perf 2d close
const PW = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs'), path = require('path');
const HERE = __dirname, OUT = path.resolve(process.argv[2] || path.join(HERE, 'shots')), views = process.argv.slice(3);
fs.mkdirSync(OUT, { recursive: true });
const html = fs.readFileSync(path.join(HERE, 'demo.html'));
const SIZES = { '1366x768': [1366, 768], '390x844': [390, 844] };
(async () => {
  const br = await PW.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const log = [];
  const run = async (name, w, h, q, fn, extra) => {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await ctx.route('**/*', r => { const u = new URL(r.request().url()); if (u.host === 'gns.test') return r.fulfill({ status: 200, contentType: 'text/html', body: html }); return r.abort(); });
    const pg = await ctx.newPage(); pg.setDefaultTimeout(150000);
    const errs = []; pg.on('pageerror', e => errs.push('pageerror: ' + e)); pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
    await pg.goto('https://gns.test/?static&noqbar&gfx=' + q + (extra || ''));
    await pg.waitForFunction(() => window.DEMO_READY === true); await pg.waitForTimeout(1500);
    const r = fn ? await fn(pg) : null; const st = await pg.evaluate(() => TWKit.stats());
    log.push({ name, q, stats: st, errs: errs.slice(0, 6), r }); console.log(name, q, JSON.stringify(st), errs.length ? errs.slice(0, 4).join(' | ') : '');
    await ctx.close();
  };
  const shot = f => async pg => { await pg.screenshot({ path: path.join(OUT, f) }); };
  const want = n => !views.length || views.includes(n);
  for (const k of Object.keys(SIZES)) if (want(k)) await run(k, SIZES[k][0], SIZES[k][1], k === '390x844' ? 'medium' : 'high', async pg => { await pg.evaluate(() => DEMO.hoverAt(1, 4)); await pg.waitForTimeout(800); await shot(k + '.png')(pg); });
  if (want('close')) await run('close', 1366, 768, 'high', async pg => {
    const snap = async (f, g) => { await pg.evaluate(g); await pg.waitForTimeout(1600); await pg.screenshot({ path: path.join(OUT, f) }); };
    await snap('close-lev.png', () => TWKit.focus(3, 2, 2.6)); await snap('close-ships.png', () => TWKit.focus(1, 0, 2.2)); await snap('close-gate.png', () => TWKit.focus(5, 0, 2.6)); await snap('close-mael.png', () => TWKit.focus(4, 1, 2.6)); await snap('close-dragon.png', () => TWKit.focus(0, 4, 2.6));
  });
  if (want('fx')) await run('fx', 1366, 768, 'high', async pg => {
    const s = f => pg.screenshot({ path: path.join(OUT, f) });
    const at = async (code, sec, f) => { await pg.evaluate(code); await pg.evaluate(t => TWKit.advance(t), sec); await s(f); };
    await at(() => { DEMO.sail(0); }, 1.0, 'fx-sail.png'); await pg.evaluate(() => TWKit.advance(3));
    await at(() => { TWKit.setShipAt('p0', { c: 2, r: 5, port: 4 }); TWKit.setShipAt('p2', { c: 3, r: 5, port: 5 }); DEMO.crash(); }, .5, 'fx-crash.png'); await pg.evaluate(() => TWKit.advance(.7)); await s('fx-sink.png'); await pg.evaluate(() => TWKit.advance(3));
    await at(() => DEMO.dice(), .9, 'fx-dice-air.png'); await pg.evaluate(() => TWKit.advance(2)); await s('fx-dice.png');
    await at(() => DEMO.cannon(), .75, 'fx-cannon.png'); await pg.evaluate(() => TWKit.advance(3));
    await at(() => DEMO.wave(), 1.2, 'fx-wave.png'); await pg.evaluate(() => TWKit.advance(3));
    await at(() => DEMO.warp(), .75, 'fx-warp.png'); await pg.evaluate(() => TWKit.advance(2));
    await at(() => DEMO.destroy(), .75, 'fx-destroy.png'); await pg.evaluate(() => TWKit.advance(2));
    await at(() => DEMO.roar(), .55, 'fx-roar.png'); await pg.evaluate(() => TWKit.advance(2));
    await at(() => DEMO.spawn(), .8, 'fx-spawn.png');
  });
  if (want('perf') || want('perflow')) for (const q of (want('perflow') ? ['low'] : ['high', 'medium', 'low'])) await run('perf-' + q, 1366, 768, q, async pg => { await pg.waitForTimeout(3000); await pg.evaluate(() => TWKit.resetStats()); await pg.waitForTimeout(10000); return await pg.evaluate(() => TWKit.stats()); });
  if (want('2d')) { await run('2d', 390, 844, 'high', shot('2d-390x844.png'), '&2d'); await run('2d-wide', 1366, 768, 'high', async pg => { await pg.evaluate(() => { DEMO.hoverAt(1, 4); DEMO.dice(); }); await pg.waitForTimeout(1200); await shot('2d-1366x768.png')(pg); }, '&2d'); }
  fs.writeFileSync(path.join(OUT, 'log.json'), JSON.stringify(log, null, 1)); await br.close();
})();

// pop-up captures in slow motion + isAnimating check
const PW = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const fs = require('fs'), path = require('path'); const HERE = __dirname, OUT = path.resolve(process.argv[2]); fs.mkdirSync(OUT, { recursive: true });
const html = fs.readFileSync(path.join(HERE, 'demo.html')), fcss = fs.readFileSync(path.join(HERE, 'fontcache', 'fonts.css'));
(async () => {
  const br = await PW.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const W = +(process.argv[3] || 1366), H = +(process.argv[4] || 768);
  const ctx = await br.newContext({ viewport: { width: W, height: H } });
  await ctx.route('**/*', r => { const u = new URL(r.request().url()); if (u.host === 'gns.test') return r.fulfill({ status: 200, contentType: 'text/html', body: html }); if (u.host === 'fonts.googleapis.com') return r.fulfill({ status: 200, contentType: 'text/css', body: fcss }); if (u.host === 'fonts.gstatic.com') { const f = path.join(HERE, 'fontcache', path.basename(u.pathname)); if (fs.existsSync(f)) return r.fulfill({ status: 200, contentType: 'font/woff2', body: fs.readFileSync(f) }); } return r.abort(); });
  const pg = await ctx.newPage(); pg.setDefaultTimeout(150000); const errs = []; pg.on('pageerror', e => errs.push(String(e)));
  await pg.goto('https://gns.test/?static&noqbar&gfx=' + (process.argv[5] || 'high')); await pg.waitForFunction(() => window.DEMO_READY === true); await pg.waitForTimeout(1500);
  await pg.evaluate(s => SFKit.setSpeed(s), +(process.env.SPD||0.25));
  const beat = async (name, fn, wait) => { await pg.evaluate(fn); await pg.waitForTimeout(wait || 1400); await pg.screenshot({ path: path.join(OUT, 'pop-' + name + '.png') }); console.log(name, JSON.stringify(await pg.evaluate(() => SFKit._animDebug()))); await pg.waitForTimeout(500); };
  await beat('cut', 'DEMO.cut()', 4200);
  await pg.waitForTimeout(6000);
  await beat('boom', 'DEMO.boom()', 1800);
  await pg.waitForTimeout(6000);
  await beat('phew', 'DEMO.phew()');
  await pg.waitForTimeout(6000);
  await beat('wrong', "SFKit.fx('wrong', DEMO.hands[1][4].id)");
  await pg.waitForTimeout(6000);
  await beat('win', 'DEMO.win()', 2600);
  await pg.waitForTimeout(6000);
  await beat('lose', "SFKit.setDial(0,4);SFKit.fx('lose')", 2200);
  await pg.evaluate(() => SFKit.setSpeed(1)); await pg.waitForTimeout(12000);
  console.log('after', JSON.stringify(await pg.evaluate(() => [SFKit.isAnimating(), SFKit._animDebug()])), errs);
  await br.close();
})();

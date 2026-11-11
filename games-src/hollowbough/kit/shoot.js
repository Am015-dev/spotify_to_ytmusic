// node shoot.js [outdir] ; Playwright screenshots of demo.html
const PW = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const path = require('path'), fs = require('fs');
const OUT = path.resolve(process.argv[2] || path.join(__dirname, 'shots')); fs.mkdirSync(OUT, { recursive: true });
const url = 'file://' + path.join(__dirname, 'demo.html');
(async () => {
  const br = await PW.chromium.launch();
  const jobs = [['desktop', 1366, 900, false], ['phone-p', 390, 844, true], ['phone-l', 844, 390, true]];
  const sects = ['crit', 'cons', 'tok', 'board'];
  for (const [n, w, h, m] of jobs) {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: m ? 2 : 1, isMobile: m, hasTouch: m });
    const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(String(e))); pg.on('console', x => { if (x.type() == 'error' || x.type() == 'warning') errs.push(x.text()); });
    for (const s of sects) {
      await pg.goto(url + '?only=' + s + (m ? '&n=4' : '')); await pg.waitForFunction(() => window.DEMO_READY); await pg.waitForTimeout(400);
      await pg.screenshot({ path: path.join(OUT, `${n}-${s}.png`), fullPage: true });
    }
    if (m) { await pg.goto(url + '?only=crit&n=0&open=12'); await pg.waitForFunction(() => window.DEMO_READY); await pg.waitForTimeout(300); await pg.screenshot({ path: path.join(OUT, `${n}-enlarged.png`) }); }
    await pg.goto(url + '?only=stress'); await pg.waitForFunction(() => window.DEMO_READY); await pg.waitForTimeout(300);
    const ms = await pg.evaluate(() => window.STRESS_MS); await pg.screenshot({ path: path.join(OUT, `${n}-stress.png`), fullPage: true });
    const sc = await pg.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    console.log(n, 'stress150 build ms', Math.round(ms), 'scrollW/innerW', sc.join('/'), 'errs', errs.slice(0, 4));
    await ctx.close();
  }
  await br.close();
})();

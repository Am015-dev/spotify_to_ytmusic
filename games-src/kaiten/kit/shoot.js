// node shoot.js [outdir] ; Playwright screenshots of demo.html (desktop, phone portrait, phone landscape)
const PW = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const path = require('path'), fs = require('fs');
const OUT = path.resolve(process.argv[2] || path.join(__dirname, 'shots')); fs.mkdirSync(OUT, { recursive: true });
const url = 'file://' + path.join(__dirname, 'demo.html');
const only = (process.argv[3] || '').split(',').filter(Boolean);
(async () => {
  const br = await PW.chromium.launch();
  const jobs = [['desktop', 1366, 900, false], ['phone-p', 390, 844, true], ['phone-l', 844, 390, true]];
  const sects = ['cards70,cards100', 'cards150,cards240', 'plates,backs', 'belt,counter', 'chefs,icons', 'pad,reveal'];
  for (const [n, w, h, m] of jobs) {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: m ? 2 : 1, isMobile: m, hasTouch: m });
    const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(String(e))); pg.on('console', x => { if (x.type() == 'error' || x.type() == 'warning') errs.push(x.text()); });
    for (let si = 0; si < sects.length; si++) {
      const names = sects[si].split(','); if (only.length && !names.some(x => only.includes(x))) continue;
      await pg.goto(url); await pg.waitForFunction(() => window.DEMO_READY);
      await pg.evaluate(ns => { document.querySelectorAll('[data-s]').forEach(e => e.style.display = ns.includes(e.dataset.s) ? '' : 'none'); }, names);
      await pg.waitForTimeout(350);
      await pg.screenshot({ path: path.join(OUT, `${n}-${names[0]}.png`), fullPage: true });
    }
    await pg.goto(url + '?only=stress'); await pg.waitForFunction(() => window.DEMO_READY);
    const ms = await pg.evaluate(() => window.STRESS_MS); const sc = await pg.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    console.log(n, 'stress120 build ms', Math.round(ms), 'scrollW/innerW', sc.join('/'), 'errs', errs.slice(0, 4));
    await ctx.close();
  }
  await br.close();
})();

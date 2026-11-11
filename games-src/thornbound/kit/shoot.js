// node shoot.js <out.png> <w> <h> [query] [fullPage] [js-to-eval]
const PW = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const path = require('path');
(async () => {
  const [out, w, h, q, full, js] = process.argv.slice(2);
  const br = await PW.chromium.launch();
  const mobile = +w < 900 && +h < 900;
  const ctx = await br.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
  const pg = await ctx.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push('pageerror: ' + e)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto('file://' + path.join(__dirname, 'demo.html') + (q || ''));
  await pg.waitForFunction(() => window.DONE === true, null, { timeout: 60000 }).catch(e => errs.push('timeout DONE'));
  await pg.waitForTimeout(600);
  if (js) { await pg.evaluate(js); await pg.waitForTimeout(1500); }
  await pg.screenshot({ path: out, fullPage: full === '1' });
  console.log(out, errs.length ? errs.slice(0, 5).join(' | ') : 'no errors');
  await br.close();
})();

// Screenshots of the help kit at 390x763: coach bubble, bulb suggestion, rules card -> playtest/
const PW = require(process.env.PW || 'playwright'); const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'kaiten.html'));
(async () => {
  const b = await PW.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 763 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); await p.goto('https://gns.test/'); await p.waitForTimeout(1200);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } UI.seed = 5; GXH.reset(); GXH.setEnabled(true); });
  const c = await p.evaluate(() => { const e = document.querySelector('[data-a=play]'); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await p.touchscreen.tap(c.x, c.y); await p.waitForTimeout(400);
  const v = await p.evaluate(() => { const e = document.querySelector('[data-start=vs]'); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await p.touchscreen.tap(v.x, v.y);
  await p.waitForSelector('.gxh-bub.on', { timeout: 20000 }); await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(__dirname, 'playtest', 'help-coach-bubble-390x763.png') });
  await p.touchscreen.tap(60, 16); await p.waitForTimeout(300);
  const bb = await p.evaluate(() => { const r = document.querySelector('#bulbbtn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await p.touchscreen.tap(bb.x, bb.y); await p.waitForTimeout(700);
  await p.screenshot({ path: path.join(__dirname, 'playtest', 'help-bulb-suggestion-390x763.png') });
  await p.evaluate(() => document.querySelector('.gxh-link').click()); await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(__dirname, 'playtest', 'help-rules-card-390x763.png') });
  await b.close();
})();

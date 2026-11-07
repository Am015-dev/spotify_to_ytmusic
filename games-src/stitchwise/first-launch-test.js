// First launch on a fresh profile with real input: node first-launch-test.js [WxH]  (URL env = served build)
const { chromium } = require('playwright'); const A = process.argv.slice(2), sz = (A.find(a => /^\d+x\d+$/.test(a)) || '390x763').split('x').map(Number);
let fails = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fails++; console.log('FAIL', m); } };
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_CHROME || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); const touch = sz[0] < 900;
  const ctx = await b.newContext({ viewport: { width: sz[0], height: sz[1] }, hasTouch: touch, isMobile: touch }); const pg = await ctx.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push(e.message)); pg.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
  const tap = async el => { const bb = await el.boundingBox(); if (touch) await pg.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); else await pg.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(500); };
  await pg.goto(process.env.URL || 'http://localhost:8731/index.html'); await pg.waitForTimeout(1200);
  ok(await pg.evaluate(() => !document.querySelector('#start').hidden), 'title shows on first launch');
  ok(await pg.evaluate(() => { const t = document.querySelector('#toast'); return !t.classList.contains('on'); }), 'no "New here?" toast over the title');
  const tut = await pg.$('#start button:has-text("Tutorial")'); ok(!!tut, 'Tutorial button on the title'); await tap(tut);
  await pg.waitForFunction(() => typeof GXT !== 'undefined' && GXT.active(), null, { timeout: 5000 }).then(() => ok(true, 'tutorial started'), () => ok(false, 'tutorial started'));
  ok(await pg.evaluate(() => !document.querySelector('#toast').classList.contains('on')), 'no toast on tutorial step 1');
  await pg.waitForTimeout(800); const s1 = await pg.evaluate(() => GXT.current() && GXT.current().id); ok(s1 === 'pick', 'step 1 asks for a real action (' + s1 + ')');
  const off = (await pg.$$('#offers .offer'))[2]; if (off) await tap(off);
  await pg.waitForFunction(() => GXT.current() && GXT.current().id !== 'pick', null, { timeout: 5000 }).then(() => ok(true, 'tapping the spotlit patch advances'), () => ok(false, 'tapping the spotlit patch advances'));
  const sk = await pg.$('button:has-text("Skip tutorial")'); if (sk) await tap(sk); await pg.waitForTimeout(600);
  ok(await pg.evaluate(() => !document.querySelector('#start').hidden), 'skipping the tutorial returns to the title');
  const bad = errs.filter(e => !/favicon|manifest/.test(e)); ok(bad.length === 0, 'no page errors or 404s ' + JSON.stringify(bad.slice(0, 2)));
  console.log((fails ? 'FAIL ' : 'PASS ') + 'first-launch ' + sz.join('x') + ' (' + n + ' checks)'); await b.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log('FAIL first-launch crashed:', e.message); process.exit(1); });

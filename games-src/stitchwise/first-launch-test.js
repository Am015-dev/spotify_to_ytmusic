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
  await pg.waitForFunction(() => !!G && !!UI.coach && !G.over, null, { timeout: 5000 }).then(() => ok(true, 'tutorial started as a coached real game'), () => ok(false, 'tutorial started as a coached real game'));
  ok(await pg.evaluate(() => !document.querySelector('#toast').classList.contains('on')), 'no toast on the first turn');
  await pg.waitForTimeout(800); ok(await pg.evaluate(() => !document.querySelector('#guide').hidden && !(GXT.active && GXT.active())), 'Aunt Wren speaks, no forced spotlight');
  const off = await pg.$('#offers .offer.can'); if (off) await tap(off); await pg.waitForTimeout(400);
  ok(await pg.evaluate(() => UI.sel >= 0 && /Lay it on your quilt/.test(document.querySelector('#guide').textContent)), 'any glowing patch can be picked; Aunt Wren explains placing');
  const x = await pg.$('#guide .gclose'); if (x) await tap(x); await pg.waitForTimeout(200); ok(await pg.evaluate(() => document.querySelector('#guide').hidden), 'Aunt Wren can be dismissed');
  const bad = errs.filter(e => !/favicon|manifest/.test(e)); ok(bad.length === 0, 'no page errors or 404s ' + JSON.stringify(bad.slice(0, 2)));
  console.log((fails ? 'FAIL ' : 'PASS ') + 'first-launch ' + sz.join('x') + ' (' + n + ' checks)'); await b.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.log('FAIL first-launch crashed:', e.message); process.exit(1); });

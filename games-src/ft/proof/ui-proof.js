// Proof for the Sands UI pass: node games-src/ft/proof/ui-proof.js   (needs the staged build: build-all.py sands-of-qamar)
// Video 402x874 touch: mid-game with every mark, long-press a market djinn and an owned djinn, assert the inspect card. PNGs: 402 + 1366.
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const gx = require('../../scripts/gx-serve.js'), setup = require('./ui-setup.js');
const OUT = __dirname, FILE = path.resolve(__dirname, '../../.staging/sands-of-qamar/index.html');
const fail = m => { console.log('FAIL', m); process.exitCode = 1; };
(async () => {
  const url = await gx.url('sands-of-qamar', { file: FILE, query: '?scn=sq-board' });
  const b = await chromium.launch({ executablePath: process.env.PW_CHROME || '/opt/pw-browsers/chromium' });
  const tmp = path.join(OUT, '.vid'); fs.rmSync(tmp, { recursive: true, force: true });
  const c = await b.newContext({ viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2, recordVideo: { dir: tmp, size: { width: 402, height: 874 } } });
  const p = await c.newPage(); p.on('pageerror', e => fail('page error ' + e.message));
  await p.goto(url); const ids = await setup.midgame(p); await p.waitForTimeout(1200);
  for (const [n, i] of [['shrine-palace', ids.sh[0]], ['oasis-palm', ids.ox], ['hamlet-rival', ids.vi]]) {
    const el = p.locator(`[data-tile="${i}"]`); await el.screenshot({ path: path.join(OUT, `ui-after-tile-${n}.png`) }); }
  const marks = await p.evaluate(() => [...document.querySelectorAll('.tile .bm')].map(e => { const r = e.getBoundingClientRect(); return { c: e.className, w: Math.round(r.width), bg: getComputedStyle(e).backgroundColor }; }));
  const kinds = new Set(marks.map(m => m.c.split(' ')[1]));
  if (!(kinds.has('cam') && kinds.has('palm') && kinds.has('pal'))) fail('missing mark kind ' + [...kinds]);
  if (marks.some(m => m.w < 26)) fail('mark under 26px'); console.log('marks', marks.length, [...kinds].join(','));
  const press = async sel => { const bx = await p.locator(sel).first().boundingBox(); const x = bx.x + bx.width * .55, y = bx.y + bx.height / 2;
    const cdp = await c.newCDPSession(p);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await p.waitForTimeout(650);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(500); };
  const card = () => p.evaluate(() => { const e = document.getElementById('dinspect'); if (!e || e.hidden) return null; const r = e.getBoundingClientRect(), g = Math.max(...[...document.querySelectorAll('#grid .tile')].map(t => t.getBoundingClientRect().bottom)); return { t: e.innerText, top: r.top, gridBottom: g, x: e.querySelector('.dix').getBoundingClientRect().width }; });
  await press('.drow .dcard[data-dj]:not(.th)'); let k = await card(); console.log('market card:', JSON.stringify(k && k.t));
  if (!k) fail('market long-press opened nothing'); else { if (!/Jamal/i.test(k.t) || !/Place one of your camels/.test(k.t) || !/When:/.test(k.t) || !/Buy:.*(needs|NOW|enough)/s.test(k.t)) fail('market card text'); if (k.top < k.gridBottom - 1) fail('card covers the board'); if (k.x < 44) fail('close < 44');
    await p.waitForTimeout(900); await p.screenshot({ path: path.join(OUT, 'ui-inspect-market-402x874.png') }); await p.touchscreen.tap(200, 200); await p.waitForTimeout(400); if (await card()) fail('did not close on outside tap'); }
  await press('[data-odj="wahha"]'); k = await card(); console.log('owned card:', JSON.stringify(k && k.t));
  if (!k) fail('owned long-press opened nothing'); else { if (!/Wahha/i.test(k.t) || !/palm on any Oasis/.test(k.t) || !/Status:.*Used this turn/s.test(k.t)) fail('owned card text');
    await p.waitForTimeout(900); await p.screenshot({ path: path.join(OUT, 'ui-inspect-owned-402x874.png') }); await p.touchscreen.tap(200, 200); await p.waitForTimeout(400); }
  const ib = await p.locator('.drow .dinfo').first().boundingBox(); await p.touchscreen.tap(ib.x + ib.width / 2, ib.y + ib.height / 2); await p.waitForTimeout(500);
  if (!(await card())) fail("'i' button did not open the card"); await p.touchscreen.tap(200, 200); await p.waitForTimeout(300);
  await p.evaluate(() => GX.show('djd')); await p.waitForTimeout(600); const my = await p.evaluate(() => document.querySelector('#djbody .mydj') && document.querySelector('#djbody .mydj').innerText); console.log('my djinns:', JSON.stringify(my)); if (!my || !/Wahha/i.test(my) || !/Zarifa/.test(my)) fail('My djinns list');
  await p.waitForTimeout(800); await p.screenshot({ path: path.join(OUT, 'ui-mydjinns-402x874.png') });
  const v = p.video(); await c.close(); await v.saveAs(path.join(OUT, 'ui-402x874.webm')); fs.rmSync(tmp, { recursive: true, force: true });
  // desktop: shots + hover card
  const d = await b.newContext({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1 }); const q = await d.newPage(); await q.goto(url); await setup.midgame(q); await q.waitForTimeout(1200);
  await q.screenshot({ path: path.join(OUT, 'ui-after-1366x768.png') });
  await q.hover('.drow .dcard[data-dj]:not(.th)'); await q.waitForTimeout(900); const t = await q.evaluate(() => { const e = document.getElementById('dinspect'); return e && !e.hidden ? e.innerText : null; });
  console.log('hover card:', JSON.stringify(t)); if (!t || !/Jamal/i.test(t)) fail('hover card'); await q.screenshot({ path: path.join(OUT, 'ui-inspect-hover-1366x768.png') });
  await q.mouse.move(20, 400); await q.waitForTimeout(600); await q.click('[data-odj="wahha"]'); await q.waitForTimeout(400); if (!(await q.evaluate(() => !document.getElementById('dinspect').hidden))) fail('owned chip click');
  await b.close(); console.log(process.exitCode ? 'PROOF FAILED' : 'PROOF OK');
})().catch(e => { console.log(e); process.exit(1); });

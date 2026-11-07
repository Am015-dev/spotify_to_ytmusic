// Real-input smoke: start from the title by tap/click, draft, play 3 turns, force an end and see the result screen. node smoke.js [html]
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const file = path.resolve(process.argv[2] || 'twin-thrones.html'); fs.mkdirSync('shots', { recursive: true });
async function run(name, vp, touch) {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 }); const pg = await ctx.newPage();
  const errs = []; pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); pg.on('pageerror', e => errs.push('pageerror ' + e.message));
  await pg.goto('file://' + file + '?seed=11'); await pg.evaluate(() => { window.AIDELAY = 60; });
  const tap = async sel => touch ? pg.locator(sel).first().tap() : pg.locator(sel).first().click();
  await tap('[data-start="1"]');
  let turns = 0, guard = 0;
  while (turns < 3 && guard++ < 80) {
    await pg.waitForTimeout(250);
    if (await pg.locator('#start:not([hidden])').count()) throw new Error('start visible');
    const busy = await pg.evaluate(() => TT_TEST.U.busy || TT_TEST.E.sideToAct(TT_TEST.U.G) !== 0);
    if (busy) continue;
    const ph = await pg.evaluate(() => TT_TEST.U.G.phase + '|' + (TT_TEST.U.G.pend[0] ? TT_TEST.U.G.pend[0].type : ''));
    if (ph.startsWith('draft')) { await tap('.wcard:not([disabled])'); continue; }
    if (ph.endsWith('first')) { await tap('[data-first]'); continue; }
    if (ph.endsWith('token')) { await tap('.picker .tk'); continue; }
    if (ph.endsWith('destroy')) { await tap('[data-destroy]'); continue; }
    if (ph.endsWith('revive')) { await tap('[data-revive]'); continue; }
    await tap('.card.av');
    await pg.waitForTimeout(150);
    if (turns === 1) await pg.screenshot({ path: 'shots/' + name + '-select.png' });
    const canBuild = await pg.locator('[data-a="build"]:not([disabled])').count();
    await tap(canBuild ? '[data-a="build"]' : '[data-a="discard"]'); turns++;
  }
  await pg.waitForTimeout(1500); await pg.screenshot({ path: 'shots/' + name + '-main.png' });
  await pg.evaluate(() => TT_TEST.forceEnd(0)); await pg.waitForTimeout(300);
  const res = await pg.locator('#res:not([hidden])').count(); await pg.screenshot({ path: 'shots/' + name + '-result.png' });
  const scroll = await pg.evaluate(() => [document.documentElement.scrollHeight - innerHeight, document.documentElement.scrollWidth - innerWidth]);
  await b.close();
  const ok = turns === 3 && res === 1 && !errs.length && scroll[0] <= 0 && scroll[1] <= 0;
  console.log((ok ? 'PASS ' : 'FAIL ') + name + ' turns=' + turns + ' result=' + res + ' scroll=' + scroll + ' errors=' + errs.length + (errs.length ? ' ' + errs.slice(0, 3).join(' | ') : '')); return ok;
}
(async () => { const a = await run('phone', { width: 390, height: 763 }, true); const c = await run('pc', { width: 1440, height: 860 }, false); process.exit(a && c ? 0 : 1); })().catch(e => { console.log('FAIL ' + e.message); process.exit(1); });

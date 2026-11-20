// PC mouse check: node pc-mouse.js  (needs stitchwise.html built). At 910x512, 1366x768 and 1920x1080 a mouse plays
// 8 of your turns (buy the first glowing patch + Sew, else Advance) against Normal. Fails on page errors, page scroll,
// controls outside the window, or a buy that did not land.
const { chromium } = require('playwright'); const path = require('path');
const SIZES = [[910, 512], [1366, 768], [1920, 1080]];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let fail = 0;
  for (const [w, h] of SIZES) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } }); const pg = await ctx.newPage(); const errs = [];
    pg.on('pageerror', e => errs.push(e.message));
    await pg.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('gns-prefs', JSON.stringify({ anim: 'off', ai: 'fast' })); } catch (e) { } });
    await pg.goto('file://' + path.join(__dirname, 'stitchwise.html')); await pg.waitForTimeout(700);
    await pg.evaluate(() => { newGame('quick', { seed: 21, first: 0, lvl: 'normal', name: 'Marden' }); try { GX.close(); } catch (e) { } });
    let bought = 0, adv = 0, bad = [];
    const inView = async sel => { const r = await pg.$eval(sel, e => { const b = e.getBoundingClientRect(); return [b.left, b.top, b.right, b.bottom]; }).catch(() => null); return r && r[0] >= 0 && r[1] >= 0 && r[2] <= w + 1 && r[3] <= h + 1; };
    for (let turn = 0; turn < 8; turn++) {
      await pg.waitForFunction(() => G.over || (!UI.busy && isHuman(swWho(G)) && !G.pend), null, { timeout: 20000 }).catch(() => bad.push('wait timeout'));
      if (await pg.evaluate(() => G.over)) break;
      if (!(await inView('#quilt'))) bad.push('quilt outside window');
      const can = await pg.$('#offers .offer.can');
      if (can) {
        const n0 = await pg.evaluate(() => G.owned[0].length); await can.click(); await pg.waitForTimeout(250);
        if (!(await inView('[data-a=sew]'))) bad.push('Sew outside window');
        await pg.click('[data-a=sew]'); await pg.waitForTimeout(400);
        if (await pg.evaluate(() => G.pend)) { const i = await pg.evaluate(() => G.board[0].indexOf(-1)); await (await pg.$$('#quilt .qc'))[i].click(); await pg.waitForTimeout(300); }
        if (await pg.evaluate(n => G.owned[0].length === n + 1, n0)) bought++; else bad.push('buy did not land');
      } else {
        if (!(await inView('[data-a=adv]'))) bad.push('Advance outside window');
        await pg.click('[data-a=adv]'); await pg.waitForTimeout(400); adv++;
        if (await pg.evaluate(() => G.pend)) { const i = await pg.evaluate(() => G.board[0].indexOf(-1)); await (await pg.$$('#quilt .qc'))[i].click(); await pg.waitForTimeout(300); }
      }
      const sc = await pg.evaluate(() => [document.documentElement.scrollWidth - innerWidth, document.documentElement.scrollHeight - innerHeight]);
      if (sc[0] > 1 || sc[1] > 1) bad.push('page scrolls ' + sc);
    }
    await pg.screenshot({ path: path.join(__dirname, 'proof', 'shots-rw', 'pc-mouse-' + w + 'x' + h + '.png') });
    const ok = !errs.length && !bad.length && bought >= 3;
    if (!ok) fail++;
    console.log((ok ? 'PASS' : 'FAIL') + ' pc-mouse ' + w + 'x' + h + ': bought ' + bought + ', advanced ' + adv + (bad.length ? ', ' + [...new Set(bad)].join('; ') : '') + (errs.length ? ', errors ' + errs.slice(0, 2).join(' | ') : ''));
    await ctx.close();
  }
  await b.close(); console.log(fail ? 'FAIL pc-mouse' : 'PASS pc-mouse'); process.exit(fail ? 1 : 0);
})();

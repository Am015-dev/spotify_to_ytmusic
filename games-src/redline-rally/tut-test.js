/* Coached tutorial to the end: 2 forced first taps (spotlight), then FREE PLAY: the bot picks random legal gears/cards through the UI (never a scripted tap list),
   answers slipstream prompts, taps the board to speed up. Asserts: one coach bubble at a time that never covers Go, every rule (COACH_RULES + COACH_LATER)
   was explained in game or listed on "Things you will meet later", the scoring walkthrough and the later card show, 0 console errors.
   Phone 390x763 and PC 1440x860. Usage: PW=../node_modules/playwright node tut-test.js */
const path = require('path'), { chromium } = require(process.env.PW || 'playwright'), gx = require('../scripts/gx-serve.js');
(async () => {
  const url = await gx.url('redline-rally', { file: path.join(__dirname, 'redline-rally.html') }); const b = await chromium.launch({ args: ['--no-sandbox'] }); let fail = 0;
  for (const [n, vp, t] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const c = await b.newContext({ viewport: vp, hasTouch: t, isMobile: t }), p = await c.newPage(); const errs = [], problems = [];
    p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.addInitScript(() => { window.AIDELAY = .12; });
    await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(400);
    await p.click('#tutSlot button');
    const tap = async (sel) => {
      const r = await p.evaluate(sel => { const e = document.querySelector(sel); if (!e || !e.getClientRects().length || e.disabled) return null; const q = e.getBoundingClientRect(), x = q.left + q.width / 2, y = q.top + q.height / 2, h = document.elementFromPoint(x, y); return { x, y, hit: !!(h && (h === e || e.contains(h))) }; }, sel);
      if (!r) return false; if (!r.hit) { problems.push('covered ' + sel); return false; } await p.mouse.click(r.x, r.y); return true;
    };
    await p.waitForFunction(() => GXT.state().shown, null, { timeout: 10000 });
    const s1 = await p.evaluate(() => GXT.state().id); if (s1 !== 'gear') problems.push('first step ' + s1);
    await tap('.gb[data-g="2"]');
    await p.waitForFunction(() => GXT.state().shown && GXT.state().id === 'cards', null, { timeout: 10000 });
    await tap('#hand .cd:not(.dead):not(.sel)'); await p.waitForTimeout(250);
    await p.waitForFunction(() => GXT.state().shown, null, { timeout: 10000 });
    await tap('#hand .cd:not(.dead):not(.sel)'); await p.waitForTimeout(600);
    if (!(await p.evaluate(() => !GXT.active()))) problems.push('forced steps did not hand over to free play');
    const t0 = Date.now(); let done = false, bubbles = 0, maxBub = 0, covers = 0;
    while (Date.now() - t0 < 200000 && !done) {
      done = await p.evaluate(() => !!document.querySelector('#walkN')); if (done) break;
      const nb = await p.evaluate(() => document.querySelectorAll('#coach.on').length); maxBub = Math.max(maxBub, nb); if (nb) bubbles++;
      if (nb) { const ov = await p.evaluate(() => { const c = document.querySelector('#coach').getBoundingClientRect(), g = document.querySelector('#goB'); if (!g || !g.offsetParent) return false; const q = g.getBoundingClientRect(); return !(c.bottom <= q.top || c.top >= q.bottom || c.right <= q.left || c.left >= q.right); }); if (ov) covers++; }
      if (await tap('#slipY')) { }
      else if (await p.evaluate(() => !!document.querySelector('#goB') && document.querySelector('#goB').offsetParent && !UI.busy)) {
        const gears = await p.$$('.gb:not([disabled])'); if (gears.length) { const g = gears[Math.floor(Math.random() * gears.length)]; const bb = await g.boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); }
        for (let k = 0; k < 7; k++) {
          const dis = await p.evaluate(() => document.querySelector('#goB').disabled); if (!dis) break;
          const cs = await p.$$('#hand .cd:not(.dead):not(.sel)'); if (!cs.length) break;
          const cc = cs[Math.floor(Math.random() * cs.length)]; const bb = await cc.boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(40);
        }
        if (Math.random() < .25) await tap('#boostB');
        await tap('#goB');
      } else if (await p.evaluate(() => UI.busy)) { await p.mouse.click(vp.width / 2, 110); }
      await p.waitForTimeout(80);
    }
    if (!done) problems.push('never reached the scoring walkthrough');
    else {
      const wk = await p.evaluate(() => document.querySelectorAll('#modal .walk li').length); if (wk < 4) problems.push('walkthrough lines ' + wk);
      await tap('#walkN'); await p.waitForTimeout(300);
      const info = await p.evaluate(() => ({ later: [...document.querySelectorAll('#modal [data-rule]')].map(e => e.dataset.rule), seen: Object.keys(COACH.seen).filter(k => !/^(burn|clean)\d/.test(k)), all: COACH_RULES.concat(Object.keys(COACH_LATER)), btn: !!document.querySelector('#tq') }));
      const unexplained = info.all.filter(k => !info.seen.includes(k) && !info.later.includes(k));
      if (unexplained.length) problems.push('rules neither explained nor listed: ' + unexplained);
      if (!info.btn) problems.push('no end buttons');
      if (!['goal', 'gear', 'cards', 'corner', 'rivals', 'finish'].every(k => info.seen.includes(k))) problems.push('core rules not explained: seen ' + info.seen);
      console.log(n, 'explained in game:', info.seen.join(','), '| listed for later:', info.later.join(','));
      await tap('#tq'); await p.waitForTimeout(500);
      if (await p.evaluate(() => document.querySelector('#game').hidden)) problems.push('quick game did not start after tutorial');
    }
    if (maxBub > 1) problems.push('more than one coach bubble at once'); if (covers > 0) problems.push('coach bubble covered Go ' + covers + 'x');
    console.log(n, problems.length || errs.length ? 'FAIL' : 'PASS', 'bubbles seen', bubbles, 'errs', errs.join('|'), 'problems', problems.join(' | ')); if (problems.length || errs.length) fail = 1; await c.close();
  }
  await b.close(); process.exit(fail);
})();

/* Guided tutorial walked to the end by real touch (W496). Every step: wait for the spotlight, tap the centre of the highlighted hole with
   page.touchscreen.tap (Next button on info steps). Asserts: each step is one sentence of 12 words or fewer, every rule in TUT_RULES appears in
   order, a real spin out, stall, slipstream and boost happen, the tutorial race ends with the finish step, the end card starts a real race, 0 console errors. Shots: TUT_SHOTS=dir saves tut-<n>.png.
   Usage: PW=playwright node tut-test.js   (phone 390x844 and 375x667) */
const path = require('path'), fs = require('fs'), { chromium } = require(process.env.PW || 'playwright'), gx = require('../scripts/gx-serve.js');
(async () => {
  const url = await gx.url('redline-rally', { file: path.join(__dirname, 'redline-rally.html') }); const b = await chromium.launch({ args: ['--no-sandbox'] }); let fail = 0;
  for (const [n, vp] of [['390x844', { width: 390, height: 844 }], ['375x667', { width: 375, height: 667 }]]) {
    const shots = n === '390x844' && process.env.TUT_SHOTS;
    const c = await b.newContext({ viewport: vp, hasTouch: true, isMobile: true, deviceScaleFactor: shots ? 2 : 1 }), p = await c.newPage(); const errs = [], problems = [];
    p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.addInitScript(() => { window.AIDELAY = .15; });
    await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(500);
    const tb = await p.$('#tutSlot button'); const bb0 = await tb.boundingBox(); await p.touchscreen.tap(bb0.x + bb0.width / 2, bb0.y + bb0.height / 2);
    const seen = [], rulesAll = await p.evaluate(() => TUT_RULES.slice()), total = await p.evaluate(() => tutSteps().length);
    let k = 0, ended = false;
    for (let guard = 0; guard < 200 && !ended; guard++) {
      try { await p.waitForFunction(() => (GXT.state().active && GXT.state().shown) || !!document.querySelector('.gxt-end'), null, { timeout: 25000 }); }
      catch (e) { problems.push('stuck at step ' + JSON.stringify(await p.evaluate(() => GXT.state().id))); break; }
      if (await p.evaluate(() => !!document.querySelector('.gxt-end'))) { ended = true; break; }
      const st = await p.evaluate(() => { const s = GXT.state(), step = GXT.current(), tx = document.querySelector('.gxt-bub .gxh-tx'); return { id: s.id, i: s.i, rule: step.rule || null, say: tx ? tx.textContent : '', next: !s.wait, hole: s.holes[0] }; });
      if (seen.length && seen[seen.length - 1].id === st.id && st.next) { await p.waitForTimeout(300); continue; }
      if (!seen.length || seen[seen.length - 1].id !== st.id) {
        seen.push(st); k++;
        const words = st.say.trim().split(/\s+/).length, sentences = (st.say.match(/[.!?](\s|$)/g) || []).length;
        if (words > 12) problems.push(st.id + ': ' + words + ' words');
        if (sentences > 1) problems.push(st.id + ': ' + sentences + ' sentences');
        if (shots) { fs.mkdirSync(shots, { recursive: true }); await p.waitForTimeout(250); await p.screenshot({ path: path.join(shots, 'tut-' + k + '.png') }); }
      }
      await p.waitForTimeout(650);   // the shell ignores taps in the first 600 ms of a step
      if (st.next) { const nb = await p.$('.gxt-next'); const q = await nb.boundingBox(); await p.touchscreen.tap(q.x + q.width / 2, q.y + q.height / 2); }
      else { const h = st.hole; const hit = await p.evaluate(h => { const e = document.elementFromPoint(h.cx, h.cy); return e ? e.tagName + '#' + e.id + '.' + e.className : 'none'; }, h); if (/gxt|gxh/.test(hit)) problems.push(st.id + ': hole covered by ' + hit); await p.touchscreen.tap(h.cx, h.cy); }
      await p.waitForTimeout(250);
    }
    const ruleSeq = seen.filter(s => s.rule).map(s => s.rule);
    if (JSON.stringify(ruleSeq) !== JSON.stringify(rulesAll)) problems.push('rules in order: got ' + ruleSeq.join(','));
    if (seen.length !== total) problems.push('steps shown ' + seen.length + ' of ' + total);
    const real = await p.evaluate(() => { const s = G.cars[0].stats; return { spins: s.spins, stalls: s.stalls || 0, boosts: s.boosts, slips: s.slips }; });
    if (real.spins !== 1 || real.stalls !== 1 || real.boosts !== 1 || real.slips !== 1) problems.push('played moves ' + JSON.stringify(real));   // spin out, stall, boost, slipstream really happened
    if (!ended) problems.push('end card not reached');
    else {
      const eb = await p.$('.gxt-end [data-gxt-end="play"]'); const q = await eb.boundingBox(); await p.touchscreen.tap(q.x + q.width / 2, q.y + q.height / 2); await p.waitForTimeout(800);
      const real = await p.evaluate(() => !!G && UI.mode !== 'tutorial' && G.round === 1 && !G.over && !document.querySelector('#game').hidden && G.track !== 'practice');
      if (!real) problems.push('real race did not start after the tutorial');
    }
    console.log(n, problems.length || errs.length ? 'FAIL' : 'PASS', 'steps', seen.length, 'rules', ruleSeq.length + '/' + rulesAll.length, errs.length ? 'errs ' + errs.join('|') : '', problems.join(' | '));
    if (problems.length || errs.length) fail = 1; await c.close();
  }
  await b.close(); process.exit(fail);
})();

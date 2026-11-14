// Guided first game to the end, by real touch: fresh storage, open the tutorial from the title, then every step tap the ONE highlighted
// element (.tuthl). Checks per step: exactly one highlighted target, it is not covered (elementFromPoint), Rowan's sentence is one sentence
// of at most 12 words, and a wrong tap (another market column) is refused. At the end: every rule in COACH_RULES was taught in order,
// the result screen shows the walk-through, the tutorial is marked done, and its main button starts a real 20-turn game.
// Usage: [WM_URL=file://.../games/wildmark/x.html] node tutorial-end.js [shots dir]  (WM_URL: a copy next to games/wildmark/media so art loads)   (phone 390x844 and 375x667; shots tut-N.png at 390x844 when a dir is given)
const { chromium } = require('playwright');
const URL = process.env.WM_URL || 'file://' + __dirname + '/wildmark.html', SHOTS = process.argv[2] || '';
(async () => {
  const b = await chromium.launch(); let allOk = true;
  for (const [name, vp] of [['390x844', { width: 390, height: 844 }], ['375x667', { width: 375, height: 667 }]]) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: true, isMobile: true }), p = await ctx.newPage(), errs = [], bad = [];
    p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
    await p.goto(URL); await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } }); await p.goto(URL); await p.waitForTimeout(900);
    const first = p.locator('#start button').first(); await first.tap(); await p.waitForTimeout(600);
    let lastStep = -1, shot = 0, wrongTried = 0, taps = 0;
    for (let g = 0; g < 900; g++) {
      const st = await p.evaluate(() => {
        const rs = !document.getElementById('rs').hidden, T = UI.tut; if (rs || !T) return { rs, end: !T };
        const hl = [...document.querySelectorAll('.tuthl')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; });
        const b = document.querySelector('#coachb'), say = b && !b.hidden ? (b.querySelector('p').textContent.replace(/^Rowan\s*/, '')) : '';
        let xy = null; if (hl.length) { const r = hl[0].getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, h = document.elementFromPoint(x, y); xy = { x, y, ok: !!h && (h === hl[0] || hl[0].contains(h) || (h.closest && h.closest('.tuthl') === hl[0])) }; }
        return { i: T.i, n: hl.length, say, xy, ok: T.steps[T.i] && T.steps[T.i].ok || '', r: T.steps[T.i] && T.steps[T.i].r || '', wait: !!(T.steps[T.i] && T.steps[T.i].wait) };
      });
      if (st.rs || st.end) break;
      if (st.wait || !st.n) { await p.waitForTimeout(300); continue; }
      if (st.i !== lastStep) {
        lastStep = st.i; const words = st.say.trim().split(/\s+/).length, sentences = (st.say.match(/[.!?](\s|$)/g) || []).length;
        if (words > 12) bad.push('step ' + st.i + ' has ' + words + ' words'); if (sentences > 2) bad.push('step ' + st.i + ' has ' + sentences + ' sentences');
        if (st.n !== 1) bad.push('step ' + st.i + ' highlights ' + st.n);
        if (st.r && SHOTS && name === '390x844') { await p.waitForTimeout(450); await p.screenshot({ path: SHOTS + '/tut-' + (++shot) + '.png' }); }
        if (/^take:/.test(st.ok) && !wrongTried) {   // a wrong tap is refused: the stage must not change
          wrongTried = 1; const other = (+st.ok.split(':')[1] + 1) % 4;
          const box = await p.locator('#mk .mt[data-i="' + other + '"]').boundingBox(); await p.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2); await p.waitForTimeout(250);
          const stg = await p.evaluate(() => G.stage); if (stg !== 'pick') bad.push('wrong tap was accepted');
        }
      }
      if (!st.xy.ok) bad.push('step ' + st.i + ' target covered');
      await p.touchscreen.tap(st.xy.x, st.xy.y); taps++; await p.waitForTimeout(320);
    }
    await p.waitForTimeout(1200);
    if (SHOTS && name === '390x844') await p.screenshot({ path: SHOTS + '/tut-' + (++shot) + '.png' });
    const res = await p.evaluate(() => ({ over: !!(window.G && G.over), rs: !document.getElementById('rs').hidden, cov: window.WM_COACH || null, rules: window.COACH_RULES, done: (() => { try { return GXT.isDone('wildmark'); } catch (e) { return false; } })(), final: !!document.querySelector('#rs .cfinal'), again: (document.getElementById('againB') || {}).textContent }));
    const shown = (res.cov && res.cov.shown || []).filter(x => (res.rules || []).indexOf(x) >= 0), missing = (res.rules || []).filter(id => shown.indexOf(id) < 0);
    const inOrder = JSON.stringify(shown) === JSON.stringify(res.rules);
    // the main button starts a real 20-turn game
    let real = false; if (res.again === 'Play a real game') { const box = await p.locator('#againB').boundingBox(); await p.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2); await p.waitForTimeout(800); real = await p.evaluate(() => !!G && !G.over && G.turns === 20 && UI.mode === 'quick' && G.seats[0].done === 0); }
    const pass = res.over && res.rs && res.final && res.done && !missing.length && inOrder && !bad.length && !errs.length && real;
    if (!pass) allOk = false;
    console.log((pass ? 'PASS' : 'FAIL') + ' guided tutorial ' + name + ': ' + taps + ' highlighted taps, rules taught ' + shown.length + '/' + (res.rules || []).length + (inOrder ? ' in order' : ' OUT OF ORDER') +
      (missing.length ? ' MISSING ' + missing.join(',') : '') + (bad.length ? ' ISSUES ' + bad.slice(0, 4).join('; ') : '') + (errs.length ? ' errors ' + errs.slice(0, 2).join(' | ') : '') + ' walk-through ' + res.final + ' done ' + res.done + ' real game after ' + real);
    await ctx.close();
  }
  await b.close(); process.exit(allOk ? 0 : 1);
})();

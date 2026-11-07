// Tutorial-to-end test: fresh storage, taps the spotlit element's centre for every step (asserting it is not covered), reaches the end card, then "Play a real game" lands on the hero pick. Phone 390x763 + PC 1440x860. Run: node tools/tut-end.js
const { chromium } = require('playwright'), { serve, sleep, tap } = require('./tap-lib');
(async () => {
  const { srv, base } = await serve(); const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let bad = 0;
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]]) {
    const ctx = await br.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }); const pg = await ctx.newPage(), errs = [];
    pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text()); });
    const T = async s => { const r = await tap(pg, touch, s); if (r) { bad++; console.log('FAIL', name, r); } return !r; };
    await pg.goto(base); await pg.waitForSelector('#title'); await sleep(400);
    await T('.gxt-menu'); await sleep(800);
    const seen = [];
    for (let i = 0; i < 60; i++) {
      await sleep(350);
      const st = await pg.evaluate(() => { if (!(window.GXT && GXT.active())) return null; const s = GXT.current(); if (!s) return { id: 'wait' }; const t = typeof s.target === 'function' ? s.target() : null; if (t) t.setAttribute('data-spot', '1'); document.querySelectorAll('[data-spot]').forEach(x => { if (x !== t) x.removeAttribute('data-spot'); }); return { id: s.id, next: !s.wait, times: (s.wait && s.wait.times) || 1, ready: !s.ready || s.ready() }; });
      if (!st) break; if (st.id === 'wait' || !st.ready) continue;
      if (seen[seen.length - 1] !== st.id) seen.push(st.id); else if (st.next) { }
      if (st.next) { const nb = await pg.$('.gxt-next'); if (nb && await nb.isVisible()) { await T('.gxt-next'); continue; } }
      const mark = () => pg.evaluate(() => { document.querySelectorAll('[data-spot]').forEach(x => x.removeAttribute('data-spot')); const s = GXT.current(); const t = s && s.target && s.target(); if (t) t.setAttribute('data-spot', '1'); });
      await mark(); if (!(await T('[data-spot]'))) break;
      if (st.times > 1) { await sleep(300); await mark(); await T('[data-spot]'); }
      await sleep(st.id === 'end' ? 3500 : 900);
    }
    console.log(name, 'steps:', seen.join(' > '));
    if (seen.length < 7) { bad++; console.log('FAIL', name, 'only', seen.length, 'steps'); }
    await sleep(500);
    const endc = await pg.evaluate(() => document.body.innerText.includes('You can climb now')); if (!endc) { bad++; console.log('FAIL', name, 'no end card'); }
    else { await T('[data-gxt-end="play"]'); await sleep(500); const q = await pg.$('#play'); if (!q) { bad++; console.log('FAIL', name, 'end did not open a real game'); } }
    if (errs.length) { bad++; console.log('FAIL', name, 'errors', errs.slice(0, 2).join(' | ')); }
    // skip works
    await pg.evaluate(() => localStorage.clear()); await pg.goto(base); await pg.waitForSelector('#title'); await T('.gxt-menu'); await sleep(800); await T('.gxt-skip'); await sleep(600);
    const off = await pg.evaluate(() => !(window.GXT && GXT.active())); if (!off) { const d = await pg.$('[data-gxt-dlg="exit"]'); if (d) { await T('[data-gxt-dlg="exit"]'); await sleep(300); } }
    const off2 = await pg.evaluate(() => !(window.GXT && GXT.active())); console.log(off2 ? 'PASS' : 'FAIL', name, 'skip');
    if (!off2) bad++;
    await ctx.close();
  }
  await br.close(); srv.close(); console.log(bad ? 'TUT-END FAIL' : 'TUT-END PASS'); process.exit(bad ? 1 : 0);
})();

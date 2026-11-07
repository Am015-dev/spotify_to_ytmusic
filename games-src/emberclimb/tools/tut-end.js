// Tutorial-to-end test: fresh storage, taps the spotlit element's centre for every step (asserting it is not covered), reaches the end card, then "Play a real game" lands on the hero pick. Phone 390x763 + PC 1440x860. Run: node tools/tut-end.js
const { chromium } = require('playwright'), { serve, sleep, tap } = require('./tap-lib');
(async () => {
  const { srv, base } = await serve(); const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let bad = 0;
  for (const [name, vp, touch] of [['phone', { width: 390, height: 763 }, true], ['pc', { width: 1440, height: 860 }, false]].filter(x => !process.env.ONLY || x[0] === process.env.ONLY)) {
    const ctx = await br.newContext({ viewport: vp, hasTouch: touch, isMobile: touch }); const pg = await ctx.newPage(), errs = [];
    pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' && !/404/.test(m.text())) errs.push(m.text()); });
    let seen = []; const T = async s => { const r = await tap(pg, touch, s); if (r) { bad++; console.log('FAIL', name, r, 'at step', seen[seen.length - 1]); } return !r; };
    await pg.goto(base); await pg.waitForSelector('#title'); await pg.evaluate(() => localStorage.clear()); await pg.goto(base); await pg.waitForSelector('#title'); await sleep(400);
    await T('.gxt-menu'); await sleep(800);
    seen = []; const want = await pg.evaluate(() => EC_TUT_STEPS(0).map(s => s.id));
    const mark = () => pg.evaluate(() => { document.querySelectorAll('[data-spot]').forEach(x => x.removeAttribute('data-spot')); const s = GXT.current(); const t = s && s.target && s.target(); if (t) t.setAttribute('data-spot', '1'); return !!t; });
    if (process.env.DBG) console.log('  loop start', want.length);
    for (let i = 0; i < 900; i++) {
      await sleep(250); if (process.env.DBG && i % 40 === 0) console.log('  i', i, JSON.stringify(await pg.evaluate(() => ({ a: window.GXT && GXT.active(), c: window.GXT && (GXT.current() || {}).id, s: EC.E.G() && EC.E.G().scr }))));
      const st = await pg.evaluate(() => { if (!(window.GXT && GXT.active())) return null; const s = GXT.current(); if (!s) return { id: 'wait' }; const g = EC.E.G(); return { id: s.id, next: !s.wait, free: !!s.free, times: (s.wait && s.wait.times) || 1, ready: !s.ready || s.ready(), ph: g && g.b && g.b.ph, busy: UI.busy }; });
      if (!st) break; if (st.id === 'wait' || !st.ready) continue;
      if (seen[seen.length - 1] !== st.id) { seen.push(st.id); if (process.env.DBG) console.log('  step', st.id, await pg.evaluate(() => UI.ov)); }
      if (st.next) { if (await pg.$('.gxt-next')) await T('.gxt-next'); continue; }
      if (st.free) {   // play like a person: a glowing card (then the glowing enemy, or the card again), else End turn
        if (st.ph !== 'p' || st.busy) continue;
        const ok = await pg.$('.hand .card.ok');
        if (ok) { await T(ok); await sleep(200); if (await pg.$('.en.glow')) await T('.en.glow'); else { const sel = await pg.$('.hand .card.sel'); if (sel) await T(sel); } await sleep(450); }
        else if (await pg.$('#end')) { await T('#end'); await sleep(600); }
        continue;
      }
      if (!(await mark())) continue;
      if (!(await T('[data-spot]'))) { await sleep(400); continue; }
      if (st.times > 1) { await sleep(300); await mark(); await T('[data-spot]'); }
      await sleep(st.id.startsWith('end') ? 1500 : 700);
    }
    const miss = want.filter(id => seen.indexOf(id) < 0); if (miss.length) { bad++; console.log('FAIL', name, 'coverage steps not shown:', miss.join(',')); }
    console.log(name, 'steps:', seen.join(' > '));
    console.log(name, 'coverage', seen.length + '/' + want.length);
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

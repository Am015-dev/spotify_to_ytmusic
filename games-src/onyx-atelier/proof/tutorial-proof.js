// Guide gate: node proof/tutorial-proof.js  (built onyx-atelier.html, machine speed, 402x874 and 1366x768)
// Asserts: screen map labels in view, clear of each other and of the window; each label explains itself; every lesson completes by tapping the
// ring in order; a non-highlighted tap still works; the window never covers the ring; a full practice game ends; 0 JS errors. Screenshots in proof/.
const { chromium } = require('playwright'); const path = require('path');
const FILE = 'file://' + path.join(__dirname, '..', 'onyx-atelier.html'), OUT = __dirname;
const hit = (a, b) => a && b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
(async () => {
  const br = await chromium.launch(); let fails = 0; const bad = m => { fails++; console.log('FAIL', m); };
  for (const [W, H] of [[402, 874], [1366, 768]]) {
    const tag = W + 'x' + H, pg = await br.newPage({ viewport: { width: W, height: H } }), errs = [];
    pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await pg.addInitScript(() => { window.AIDELAY = 0; try { localStorage.clear(); } catch (e) {} });
    await pg.goto(FILE); await pg.click('#title [data-t="learn"]');
    const rect = s => pg.evaluate(s => { const e = typeof s === 'string' ? document.querySelector(s) : null; if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? { left: r.left, top: r.top, right: r.right, bottom: r.bottom } : null; }, s);
    // ---- lesson 1: the labelled map
    await pg.waitForSelector('#coach .tlab'); await pg.waitForTimeout(350);
    const labs = await pg.$$eval('#coach .tlab', ls => ls.filter(l => l.style.display !== 'none').map(l => { const r = l.getBoundingClientRect(); return { n: l.textContent, left: r.left, top: r.top, right: r.right, bottom: r.bottom }; }));
    const total = await pg.evaluate(() => OTUT.map.filter(m => { const e = document.querySelector(m.sel); return e && e.getBoundingClientRect().width; }).length);
    if (labs.length !== total) bad(tag + ' map: ' + labs.length + ' of ' + total + ' labels placed');
    const win = await rect('#coach .twin');
    labs.forEach((a, i) => { if (a.left < 0 || a.top < 0 || a.right > W || a.bottom > H) bad(tag + ' label off screen ' + a.n); if (hit(a, win)) bad(tag + ' label under window ' + a.n);
      labs.forEach((b, j) => { if (j > i && hit(a, b)) bad(tag + ' labels overlap ' + a.n + '/' + b.n); }); });
    const nLines = await pg.$$eval('#coach .tmap line', l => l.length); if (nLines !== labs.length) bad(tag + ' leader lines ' + nLines);
    await pg.screenshot({ path: path.join(OUT, 'guide-map-' + tag + '.png') });
    await pg.click('#coach .tlab[data-map="7"]'); const said = await pg.textContent('#coach .tsay'); if (!/Gem board/.test(said)) bad(tag + ' label tap did not explain: ' + said);
    await pg.screenshot({ path: path.join(OUT, 'guide-map-tap-' + tag + '.png') });
    // minimise to a chip and back, drag the window
    await pg.click('#coach [data-tmin]'); if (!(await pg.isVisible('#coach .tchip'))) bad(tag + ' no chip'); await pg.click('#coach .tchip');
    const h0 = await rect('#coach .thead'); await pg.mouse.move(h0.left + 20, h0.top + 10); await pg.mouse.down(); await pg.mouse.move(h0.left + 60, h0.top + 50, { steps: 4 }); await pg.mouse.up();
    const h1 = await rect('#coach .thead'); if (!h1 || Math.abs(h1.top - h0.top) < 20) bad(tag + ' window did not drag');
    await pg.click('#coach [data-tnext]');
    // ---- lessons 2..9: tap the ring in order
    let tapped = false, shots = { map: 1 }, guard = 0;
    while (guard++ < 900) {
      const st = await pg.evaluate(() => ({ step: OTUT.stepNo(), key: OTUT.steps[OTUT.stepNo()] && OTUT.steps[OTUT.stepNo()].key, over: !!OA_TEST.U.G.over, tut: !!OA_TEST.U.tut, my: OA_TEST.U.G.turn === 0 && !OA_TEST.U.busy, tgt: OTUT.target() }));
      if (!st.tut) break;
      if (!shots[st.key] && st.my) { shots[st.key] = 1; await pg.waitForTimeout(60); await pg.screenshot({ path: path.join(OUT, 'guide-L' + (await pg.evaluate(() => OTUT.steps[OTUT.stepNo()].no)) + '-' + st.key + '-' + tag + '.png') }); }
      if (st.key === 'take' && !tapped && st.my) {   // a tap on something that is not suggested still works
        const free = await pg.evaluate(() => { const w = document.querySelector('#coach .twin').getBoundingClientRect(), tg = OTUT.target();
          const c = [...document.querySelectorAll('#pyr .card[data-id]')].find(e => { const r = e.getBoundingClientRect(); return !e.matches(tg) && (r.right < w.left || r.left > w.right || r.bottom < w.top || r.top > w.bottom); }); return c ? c.dataset.id : null; });
        await pg.click('#pyr .card[data-id="' + free + '"]'); const z = await pg.isVisible('#sheet'); if (!z) bad(tag + ' non-highlighted jewel tap did nothing'); else await pg.click('#sheet [data-close]');
        await pg.click('#menubtn'); const mOpen = await pg.isVisible('#sheet, .modal'); if (!mOpen) bad(tag + ' menu tap blocked'); else await pg.click('[data-close]');
        tapped = true; continue;
      }
      if (st.over && st.key === 'practice') { await pg.waitForTimeout(80); await pg.screenshot({ path: path.join(OUT, 'guide-end-' + tag + '.png') }); await pg.evaluate(() => { const c = document.querySelector('.modal [data-close]'); if (c) c.click(); }); await pg.click('#coach [data-tnext]'); break; }
      if (!st.my) { await pg.waitForTimeout(20); continue; }
      const info = await pg.evaluate(() => { const s = OTUT.steps[OTUT.stepNo()]; return !!s.next && !s.practice; });
      if (st.tgt) { const rr = await rect(st.tgt), wr = await rect('#coach .twin'); if (rr && hit(rr, wr)) bad(tag + ' window covers the ring in ' + st.key); }
      if (info) { await pg.click('#coach [data-tnext]'); await pg.waitForTimeout(15); continue; }
      if (st.tgt) {
        const rr = await rect(st.tgt), wr = await rect('#coach .twin');
        if (rr && hit(rr, wr)) bad(tag + ' window covers the ring in ' + st.key);
        try { await pg.locator(st.tgt).first().click({ timeout: 1500 }); } catch (e) { bad(tag + ' could not tap ring ' + st.tgt + ' in ' + st.key + ': ' + e.message.split('\n')[0]); await pg.evaluate(() => { const m = OAI.hint(OA_TEST.U.G)[0]; if (m) OA_TEST.act(m); }); }
      } else {
        const g = await pg.evaluate(() => ({ info: !!OTUT.steps[OTUT.stepNo()].next, practice: OTUT.steps[OTUT.stepNo()].practice }));
        if (g.info && !g.practice) await pg.click('#coach [data-tnext]');
        else await pg.evaluate(() => { const m = OAI.hint(OA_TEST.U.G)[0]; if (m) OA_TEST.act(m); });
      }
      await pg.waitForTimeout(15);
    }
    const res = await pg.evaluate(() => ({ over: OA_TEST.U.G.over, tut: !!OA_TEST.U.tut, keys: OTUT.steps.map(s => s.key) }));
    const missing = res.keys.filter(k => !shots[k]); if (missing.length) bad(tag + ' lessons never reached: ' + missing.join());
    if (!res.over) bad(tag + ' practice game did not finish'); if (res.tut) bad(tag + ' guide still open');
    // the ? in the Rules panel reopens the map
    await pg.click('#rulesbtn'); await pg.click('[data-mapbtn]'); await pg.waitForTimeout(100); if ((await pg.$$('#coach .tlab')).length < 10) bad(tag + ' map does not reopen from ?');
    if (errs.length) bad(tag + ' JS errors: ' + errs.join(' | '));
    console.log(tag, 'lessons', Object.keys(shots).length, 'game over', res.over && res.over.how, 'winner', res.over && res.over.winner, 'loops', guard);
    await pg.close();
  }
  await br.close(); console.log(fails ? 'tutorial-proof: ' + fails + ' FAIL' : 'tutorial-proof: all ok'); process.exit(fails ? 1 : 0);
})();

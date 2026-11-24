// Tutorial gate at machine speed, 402x874 and 1366x768: labelled HUD map (no overlaps, tappable labels), every lesson in order
// by taps, taps on non-highlighted things still work, minimise/drag/close/reopen, 0 JS errors, then a full game to the result.
// Usage: node proof/tutorial-run.js   (OUT=dir for screenshots, default this folder)
const { chromium } = require('playwright');
const path = require('path');
const dir = path.resolve(__dirname, '..') + '/'; const OUT = process.env.OUT || __dirname;
const ovl = (a, b) => Math.min(a.right, b.right) > Math.max(a.left, b.left) && Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top);
(async () => {
  const b = await chromium.launch(); let fails = 0; const ok = (c, n) => { if (!c) { fails++; console.log('FAIL', n); } };
  for (const [w, h, n] of [[402, 874, '402'], [1366, 768, '1366']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: w < 500, deviceScaleFactor: 1 });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
    await p.goto('file://' + dir + 'via-tessera.html'); await p.waitForTimeout(300);
    await p.evaluate(() => { VTUI.UI.fast = true; });
    const tapSel = async (sel) => { const r = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; }, sel); if (!r) throw new Error('no ' + sel); await p.touchscreen.tap(r[0], r[1]); await p.waitForTimeout(60); };
    await tapSel('#tlearn'); await p.waitForTimeout(250);
    const geo = () => p.evaluate(() => { const R = e => { const r = e.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; };
      return { win: document.querySelector('#tut').hidden ? null : R(document.querySelector('#tut')), labs: [...document.querySelectorAll('.callout')].map(e => Object.assign(R(e), { t: e.textContent })), ring: getComputedStyle(document.querySelector('#tutring')).display, i: VTUI.TUT.i }; });
    // 1. labelled HUD map
    let g = await geo();
    ok(g.win, n + ' window open'); ok(g.labs.length >= 12, n + ' callouts ' + g.labs.length + ': ' + g.labs.map(l => l.t).join(','));
    for (let i = 0; i < g.labs.length; i++) { const a = g.labs[i]; ok(a.left >= 0 && a.top >= 0 && a.right <= w && a.bottom <= h, n + ' label inside ' + a.t); ok(!ovl(a, g.win), n + ' label off the window ' + a.t); for (let j = i + 1; j < g.labs.length; j++) ok(!ovl(a, g.labs[j]), n + ' labels overlap ' + a.t + '/' + g.labs[j].t); }
    await p.screenshot({ path: `${OUT}/tut-${n}-00-hud-map.png` });
    const before = await p.evaluate(() => document.querySelector('#tuts').textContent);
    await tapSel('.callout[data-co="2"]'); const after = await p.evaluate(() => document.querySelector('#tuts').textContent);
    ok(after !== before && after.length > 10, n + ' tapping a label explains it');
    // 2. taps on non-highlighted things work while a lesson is open
    const vw0 = await p.evaluate(() => VTUI.UI.view.w); await tapSel('#zin'); ok(await p.evaluate(() => VTUI.UI.view.w) < vw0, n + ' zoom tap works during the tutorial'); await tapSel('#zout');
    await tapSel('#hand .cd[data-i="4"]'); ok(await p.evaluate(() => VTUI.UI.sel === 4), n + ' a non-highlighted hand card is selectable');
    await p.evaluate(() => { VTUI.UI.sel = null; VTUI.render(); });
    await tapSel('#plb'); ok(await p.evaluate(() => !document.querySelector('#drawer').hidden), n + ' points panel opens'); await tapSel('#drawer [data-x]');
    ok(await p.evaluate(() => !!VTUI.TUT.done.goal), n + ' opening points ticks the goal lesson (out of order)');
    // 3. minimise, chip, drag, close, reopen with ?
    await tapSel('#tutmin'); ok(await p.evaluate(() => document.querySelector('#tut').hidden && !document.querySelector('#tutchip').hidden), n + ' minimise to chip');
    await tapSel('#tutchip'); ok(await p.evaluate(() => !document.querySelector('#tut').hidden), n + ' chip restores');
    const hb = await p.evaluate(() => { const r = document.querySelector('.tut-h b').getBoundingClientRect(); return [r.x + 20, r.y + r.height / 2]; });
    await p.mouse.move(hb[0], hb[1]); await p.mouse.down(); await p.mouse.move(hb[0] - 0, hb[1] + 40, { steps: 4 }); await p.mouse.up();
    ok(await p.evaluate(() => !!VTUI.TUT.pos), n + ' window drags');
    await tapSel('#tutx'); ok(await p.evaluate(() => document.querySelector('#tut').hidden && !VTUI.TUT.on), n + ' close');
    await tapSel('#helpb'); ok(await p.evaluate(() => VTUI.TUT.on && VTUI.TUT.i === 0 && document.querySelectorAll('.callout').length > 5), n + ' ? reopens the labelled map');
    // 4. every lesson in order by taps (the Your-turn lesson by really playing a card)
    await tapSel('#tutnext');
    const L = await p.evaluate(() => VTUI.LESSONS.map(l => l.id)); let guard = 0;
    while (guard++ < 40) {
      g = await geo(); const id = L[g.i];
      await p.screenshot({ path: `${OUT}/tut-${n}-${String(g.i).padStart(2, '0')}-${id}.png` });
      const tr = await p.evaluate(() => { const r = document.querySelector('#tutring'); return getComputedStyle(r).display === 'none' ? null : r.getBoundingClientRect().toJSON(); });
      if (tr && g.win) ok(!ovl({ left: tr.left + 8, top: tr.top + 8, right: tr.right - 8, bottom: tr.bottom - 8 }, g.win), n + ' window off its target in ' + id);
      if (id === 'turn') { const k = await p.evaluate(() => G.pl[0].hand.map(i => VT.D.CARDS[i].act).indexOf('merc')); await tapSel(`#hand .cd[data-i="${k}"]`); await tapSel('#acts .btn'); await p.waitForTimeout(80);
        ok(await p.evaluate(() => !!VTUI.TUT.done.turn), n + ' playing a card completes the lesson');
        await p.evaluate(() => { if (G.pend && G.pend.h === 'merc') VTUI.move({ t: 'trade', ops: [] }); }); await p.waitForTimeout(120);
        await p.waitForFunction(() => !VTUI.UI.busy && VT.sideToAct(G) === 0, null, { timeout: 15000 }); continue; }
      if (id === 'practice') break;
      await tapSel('#tutnext');
    }
    const nd = await p.evaluate(() => VTUI.LESSONS.filter(l => VTUI.TUT.done[l.id]).length);
    ok(nd >= (await p.evaluate(() => VTUI.LESSONS.length)) - 1, n + ' lessons ticked ' + nd);
    await tapSel('#tutlist'); await p.screenshot({ path: `${OUT}/tut-${n}-checklist.png` }); await tapSel('#tutlist');
    await p.screenshot({ path: `${OUT}/main-${n}.png` });
    // 5. full game at machine speed: the computer plays our seat through the real move function
    await p.evaluate(() => new Promise(res => { const t0 = Date.now(); (function go() {
      if (G.phase !== 'play' || Date.now() - t0 > 60000) return res();
      if (!VTUI.UI.busy && VT.sideToAct(G) === 0) { const m = VAI.choose(G, 'normal'); VTUI.move(m); }
      setTimeout(go, 5); })(); }));
    await p.waitForTimeout(300);
    ok(await p.evaluate(() => G.phase !== 'play' && !document.querySelector('#result').hidden), n + ' a full game finishes (phase ' + await p.evaluate(() => G.phase) + ')');
    ok(await p.evaluate(() => !!VTUI.TUT.done.practice), n + ' practice lesson ticks at the end');
    await p.screenshot({ path: `${OUT}/tut-${n}-result.png` });
    ok(errs.length === 0, n + ' JS errors: ' + errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
  await b.close(); console.log(fails ? fails + ' FAILED' : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();

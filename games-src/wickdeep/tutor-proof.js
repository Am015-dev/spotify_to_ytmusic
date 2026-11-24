// Tutorial gate at machine speed (reduced motion, no human waits), at 402x874 (touch) and 1366x768 (mouse):
// HUD map labels on screen and non-overlapping, a label explains, taps on non-highlighted things still work, the lesson
// window drags / minimises / closes / reopens, every lesson completes, a full run reaches the result screen, 0 JS errors.
// node tutor-proof.js   -> screenshots in proof/tutor-*.png, exit 1 on any failure.
const { chromium } = require('playwright'); const path = require('path');
const OUT = path.join(__dirname, 'proof');
let fails = 0; const ok = (n, c, why) => { console.log((c ? 'ok   ' : 'FAIL ') + n + (c ? '' : ' ' + (why || ''))); if (!c) fails++; };
const over = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
(async () => {
  const b = await chromium.launch();
  for (const [W, H] of [[402, 874], [1366, 768]]) {
    const touch = W < 500, tag = W + 'x' + H;
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: touch, isMobile: touch, reducedMotion: 'reduce' });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto('file://' + path.join(__dirname, 'wickdeep.html'));
    const tap = async sel => { const bb = await p.locator(sel).first().boundingBox(); if (!bb) return false; const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2; if (touch) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); return true; };
    await p.getByRole('button', { name: 'Learn to play' }).first().click();
    await p.waitForFunction(() => window.G && !document.getElementById('tutor').hidden && !document.getElementById('hudmap').hidden);
    await p.waitForTimeout(700);
    // 1. HUD map
    const labs = await p.evaluate(() => tutorMapRects()), win = await p.evaluate(() => { const r = document.getElementById('tutor').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
    ok(tag + ' HUD map has >= 10 labels', labs.length >= 10, labs.map(l => l.t).join(','));
    let ov = []; labs.forEach((a, i) => labs.forEach((c, j) => { if (i < j && over(a, c)) ov.push(a.t + '/' + c.t); }));
    ok(tag + ' HUD labels do not overlap each other', !ov.length, ov.join(' '));
    ok(tag + ' HUD labels inside the screen and off the lesson window', labs.every(l => l.x >= 0 && l.y >= 0 && l.x + l.w <= W && l.y + l.h <= H && !over(l, win)));
    await p.screenshot({ path: path.join(OUT, 'tutor-hudmap-' + tag + '.png') });
    await tap('#hudmap .hlab >> text=Goal');
    ok(tag + ' tapping a label explains it', /Goal: What you must do/.test(await p.locator('#tutor .tts').innerText()));
    // 2. non-highlighted taps still work (nothing is dimmed or blocked)
    const z0 = await p.evaluate(() => CAM.z); await tap('#zin'); const z1 = await p.evaluate(() => CAM.z);
    ok(tag + ' zoom button works during the tutorial', z1 > z0, z0 + '->' + z1); await tap('#zout');
    await tap('[data-gx="logd"]'); ok(tag + ' Log opens during the tutorial', await p.evaluate(() => document.querySelector('[data-gx="logd"]').getAttribute('aria-expanded') === 'true'));
    await p.keyboard.press('Escape'); await p.evaluate(() => { if (window.GX && GX.close) GX.close(); });
    // 3. window: drag, minimise, close, reopen from ?
    const hb = await p.locator('#tutdrag .ttt').boundingBox(); const x0 = hb.x;
    if (touch) { await p.evaluate(({ x, y }) => { const el = document.getElementById('tutdrag'), o = { pointerId: 1, bubbles: true, clientX: x, clientY: y, pointerType: 'touch' }; el.dispatchEvent(new PointerEvent('pointerdown', o)); el.dispatchEvent(new PointerEvent('pointermove', Object.assign({}, o, { clientX: x + 30, clientY: y + 200 }))); el.dispatchEvent(new PointerEvent('pointerup', o)); }, { x: hb.x + 10, y: hb.y + 10 }); }
    else { await p.mouse.move(hb.x + 10, hb.y + 10); await p.mouse.down(); await p.mouse.move(hb.x - 150, hb.y + 90, { steps: 4 }); await p.mouse.up(); }
    const hb2 = await p.locator('#tutdrag .ttt').boundingBox(); ok(tag + ' lesson window drags', Math.abs(hb2.x - x0) > 10 || Math.abs(hb2.y - hb.y) > 10);
    const xs = await p.locator('#tutx').boundingBox(); ok(tag + ' close button >= 44 px', xs.width >= 44 && xs.height >= 44);
    await tap('#tutmin'); ok(tag + ' minimises', await p.evaluate(() => document.getElementById('tutor').className === 'min'));
    await tap('#tutmin'); await tap('#tutx'); ok(tag + ' closes', await p.evaluate(() => document.getElementById('tutor').hidden));
    await tap('#tutq'); ok(tag + ' ? reopens the map', await p.evaluate(() => !document.getElementById('tutor').hidden && !document.getElementById('hudmap').hidden));
    await tap('#tutnext'); ok(tag + ' Next leaves the map for lesson 2', await p.evaluate(() => document.getElementById('hudmap').hidden && UI.tutor.i === 1));
    // 4. play: real taps for the first card choice, then the helper's moves through the UI at machine speed
    await p.waitForFunction(() => G.ask && G.ask.h === 'sel' && !UI.busy);
    await tap('#tray .cd >> nth=0'); await tap('#tray .cd >> nth=1');
    await p.screenshot({ path: path.join(OUT, 'tutor-lesson-' + tag + '.png') });
    await tap('#readybtn');
    let steps = 0, stuck = 0, last = -1, shot = false;
    while (steps++ < 4000) {
      const st = await p.evaluate(() => ({ done: !!G.done, busy: UI.busy, ask: G.ask && G.ask.h, i: UI.tutor.i, k: TUT_LESSONS[UI.tutor.i].k, open: UI.tutor.open }));
      if (st.done) break;
      if (st.i === last) stuck++; else { stuck = 0; last = st.i; }
      if (stuck > 12 && st.open && st.k !== 'practice') { await tap('#tutnext'); stuck = 0; continue; }   // a learner presses Next on a rule that has not come up
      if (st.busy || !st.ask) { await p.waitForFunction(() => !UI.busy || G.done, null, { timeout: 20000 }).catch(() => {}); continue; }
      if (!shot && st.ask === 'target') { shot = true; await p.screenshot({ path: path.join(OUT, 'tutor-combat-' + tag + '.png') }); }
      await p.evaluate(() => { if (G.ask && !UI.busy && !G.done) WDUI.doMove(WDAI.choose(G)); });
      await p.waitForTimeout(5);
    }
    const end = await p.evaluate(() => ({ done: G.done, open: UI.tutor.open, n: Object.keys(UI.tutor.done).length, all: TUT_LESSONS.length, k: TUT_LESSONS[UI.tutor.i].k }));
    ok(tag + ' a full run finishes', !!end.done, JSON.stringify(end).slice(0, 200));
    // rules that never came up in this run: the learner reads them and presses Next (real taps) until the checklist is full
    for (let n = 0; n < 30 && await p.evaluate(() => UI.tutor.open && !document.getElementById('tutor').hidden); n++) await tap('#tutnext');
    const fin = await p.evaluate(() => ({ n: Object.keys(UI.tutor.done).length, all: TUT_LESSONS.length }));
    ok(tag + ' every lesson completed', fin.n === fin.all, fin.n + '/' + fin.all);
    await p.waitForFunction(() => !document.getElementById('rs').hidden, null, { timeout: 15000 }).catch(() => {});
    await p.screenshot({ path: path.join(OUT, 'tutor-end-' + tag + '.png') });
    ok(tag + ' 0 JS errors', !errs.length, errs.slice(0, 3).join(' | '));
    await ctx.close();
  }
  await b.close(); console.log(fails ? 'FAIL tutor-proof: ' + fails : 'PASS tutor-proof'); process.exit(fails ? 1 : 0);
})();

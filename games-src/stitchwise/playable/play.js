// Playable gate (W381): node playable/play.js WxH tut|quick|story   (URL env = served page; animations ON, fresh storage)
// Only taps visible, uncovered UI at the element's centre (elementFromPoint must hit it). Reads state only to know when to act.
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const A = process.argv.slice(2), [W, H] = (A.find(a => /^\d+x\d+$/.test(a)) || '390x763').split('x').map(Number), MODE = A.find(a => /^(tut|quick|story)$/.test(a)) || 'tut';
const URL = process.env.URL || 'http://localhost:8765/stitchwise/index.html', OUT = path.join(__dirname, '..', 'shots', 'playable'); fs.mkdirSync(OUT, { recursive: true });
let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }), touch = W < 900;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 }), pg = await ctx.newPage(), errs = [];
  pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  const cdp = await ctx.newCDPSession(pg); const tag = `${MODE}-${W}x${H}`;
  // tap the centre of a visible element; fail if something else is on top there
  const tapEl = async (el, what) => {
    await el.scrollIntoViewIfNeeded().catch(() => { }); const bb = await el.boundingBox(); if (!bb) { ok(false, what + ': not visible'); return false; }
    const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
    const hit = await el.evaluate((e, p) => { const t = document.elementFromPoint(p.x, p.y); return !!t && (t === e || e.contains(t)); }, { x, y });
    ok(hit && x >= 0 && y >= 0 && x <= W && y <= H, what + ': centre covered or off screen');
    if (touch) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
    else await pg.mouse.click(x, y);
    await pg.waitForTimeout(120); return true;
  };
  const tap = async (sel, what) => { const el = await pg.waitForSelector(sel, { state: 'visible', timeout: 8000 }).catch(() => null); if (!el) { ok(false, (what || sel) + ': missing'); return false; } return tapEl(el, what || sel); };
  const myTurn = () => pg.waitForFunction(() => !G || G.over || (!UI.busy && isHuman(swWho(G))), null, { timeout: 90000 });
  async function humanTurn() { // returns false when the game is over
    await myTurn(); if (await pg.evaluate(() => !G || G.over)) return false;
    if (await pg.evaluate(() => !!G.pend)) { const i = await pg.evaluate(() => G.board[0].findIndex(v => v === -1)); const cells = await pg.$$('#quilt .qc'); await tapEl(cells[i], 'leather square'); await pg.waitForTimeout(300); return true; }
    const can = await pg.$('#offers .offer.can');
    if (can) {
      await tapEl(can, 'glowing patch'); await pg.waitForTimeout(250);
      let sew = await pg.$('[data-a=sew]:not([disabled])');
      if (!sew) { const cells = await pg.$$('#quilt .qc'); for (let i = 0; i < cells.length && !sew; i += 4) { await tapEl(cells[i], 'quilt square'); sew = await pg.$('[data-a=sew]:not([disabled])'); } }
      if (sew) { const n = await pg.evaluate(() => G.owned[0].length); await tapEl(sew, 'Sew it on'); await pg.waitForFunction(n => G.owned[0].length > n, n, { timeout: 8000 }).catch(() => ok(false, 'sew did not happen')); return true; }
      await tap('[data-a=cancel]', 'Cancel');
    }
    await tap('[data-a=adv]', 'Advance'); await pg.waitForTimeout(200); return true;
  }
  async function playToEnd(label) { let n = 0, shotR = false; while (n++ < 120) { if (!(await humanTurn())) break; if (!shotR && n === 2) { shotR = true; } } ok(n < 120, label + ': game did not end'); }
  await pg.goto(URL); await pg.waitForTimeout(800);
  if (MODE === 'tut') {
    await tap('#start [data-gxt-open]', 'Tutorial button'); let steps = 0, last = '';
    for (let i = 0; i < 60; i++) {
      await pg.waitForTimeout(500);
      const st = await pg.evaluate(() => { const c = GXT.active() && GXT.current(); if (!c) return null; const t = c.target && c.target(); if (t) { document.querySelectorAll('[data-spot]').forEach(e => e.removeAttribute('data-spot')); t.setAttribute('data-spot', '1'); } return { id: c.id, act: !!c.wait }; });
      if (!st) { if (await pg.$('.gxt-end')) break; continue; }
      if (st.id !== last) { steps++; last = st.id; if (steps <= 3) await pg.screenshot({ path: path.join(OUT, `${tag}-step${steps}.png`) }); }
      if (st.act) {
        if (st.id === 'drag') { const cells = await pg.$$('#quilt .qc'); await tapEl(cells[40], 'spotlit quilt square'); }
        else { const t = await pg.$('[data-spot]'); if (t) await tapEl(t, 'spotlit ' + st.id); }
      } else { const nx = await pg.waitForSelector('.gxt-next', { state: 'visible', timeout: 30000 }).catch(() => null); if (nx) await tapEl(nx, 'Next on ' + st.id); }
      await pg.waitForFunction(id => { const c = GXT.current && GXT.current(); return !GXT.active() || !c || c.id !== id || !!document.querySelector('.gxt-end'); }, st.id, { timeout: 30000 }).catch(() => ok(false, 'tutorial stuck on ' + st.id));
      if (fails) break;
    }
    ok(steps >= 5 && steps <= 8, 'tutorial has 5-8 steps (' + steps + ')');
    ok(!!(await pg.$('.gxt-end')), 'tutorial reached its end card'); await pg.screenshot({ path: path.join(OUT, `${tag}-end.png`) });
    await tap('[data-gxt-end=finish]', 'Finish this game'); await pg.waitForTimeout(500);
    ok(await pg.evaluate(() => !!G && !G.over && !UI.tutorial && UI.started), 'tutorial ends inside a real game');
  } else if (MODE === 'quick') {
    await pg.evaluate(() => { try { GXT.markDone('stitchwise'); } catch (e) { } });
    await tap('#start [data-a=quick]', 'Quick game'); await pg.waitForTimeout(300);
    const nc = await pg.$('text=Normal computer'); if (nc) await tapEl(nc, 'Normal computer'); await pg.waitForTimeout(300);
    const sg = await pg.$('text=Start the game'); if (sg) await tapEl(sg, 'Start the game');
    await playToEnd('quick');
  } else {
    await pg.evaluate(() => { try { GXT.markDone('stitchwise'); } catch (e) { } });
    await tap('#start [data-a=story]', 'Story'); await pg.waitForTimeout(700);
    for (let i = 0; i < 20; i++) {
      if (await pg.evaluate(() => !!G && UI.started && !!UI.camp)) break;
      let bt = null; for (const q of ['.gxc-btn.go:visible', 'button:text-is("Skip"):visible', 'button:text-is("Next"):visible', 'button.gxc-btn:visible:not(.ghost)', '.gxc-node.next']) { bt = await pg.$(q); if (bt) break; }
      if (bt) { console.log('tap', await bt.evaluate(e => e.className + '|' + e.textContent.slice(0, 20))); await tapEl(bt, 'story button'); } await pg.waitForTimeout(600);
    }
    await pg.screenshot({ path: path.join(OUT, tag + '-start.png') }); ok(await pg.evaluate(() => !!UI.camp), 'story stage 1 started by taps');
    await playToEnd('story');
  }
  if (MODE !== 'tut') {
    await pg.waitForSelector('#rs:not([hidden]) .rvban.on', { timeout: 60000 }).catch(() => ok(false, 'result reveal not shown'));
    await pg.waitForTimeout(1500); await pg.screenshot({ path: path.join(OUT, `${tag}-result.png`) });
    if (MODE === 'story') { const go = await pg.$('#rs .rvacts .btn.go'); if (go) await tapEl(go, 'Continue'); await pg.waitForSelector('.gxc-res', { timeout: 10000 }).catch(() => ok(false, 'story result not shown')); await pg.waitForTimeout(800); await pg.screenshot({ path: path.join(OUT, `${tag}-storyres.png`) }); }
  }
  ok(errs.length === 0, 'console errors: ' + JSON.stringify(errs));
  console.log((fails ? 'FAIL ' : 'PASS ') + tag); await b.close(); process.exit(fails ? 1 : 0);
})();

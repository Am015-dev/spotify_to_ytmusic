// Feel gate (W456, shell/FEEL.md), part 2: animated turns. Drag-only and tap-only full games: `DRAG=1 node play.js phone|pc game`
// and `node play.js phone|pc game`. This file: long tasks during animated turns (phone at 4x CPU, measured WITHOUT screenshots)
// and a 6-frame strip per viewport (drag a bird onto a row, camera + points, the rival's pick, drag a die into your food).
//   node feel-test.js
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
let URL = 'file://' + path.join(__dirname, 'perch-and-plume.html'); const SHOTS = path.join(__dirname, 'feel-shots'); fs.mkdirSync(SHOTS, { recursive: true });
const VPS = [['phone', { width: 390, height: 844 }, true], ['pc', { width: 1440, height: 900 }, false]];
async function dragger(p, ctx, touch) {
  const cdp = touch ? await ctx.newCDPSession(p) : null;
  return async (a, b, hold) => {
    const x0 = a.x + a.width / 2, y0 = a.y + Math.min(a.height / 2, 60), x1 = b.x + b.width / 2, y1 = b.y + b.height / 2 + (touch ? 28 : 6), n = 16;
    if (touch) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0 }] });
      for (let k = 1; k <= n; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + (x1 - x0) * k / n, y: y0 + (y1 - y0) * k / n }] }); await p.waitForTimeout(14); if (hold && k === n - 1) await hold(); }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else { await p.mouse.move(x0, y0); await p.mouse.down(); for (let k = 1; k <= n; k++) { await p.mouse.move(x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n); await p.waitForTimeout(14); if (hold && k === n - 1) await hold(); } await p.mouse.up(); }
  };
}
(async () => {
  URL = (await require('../scripts/gx-serve.js').url('perch-and-plume', { file: path.join(__dirname, 'perch-and-plume.html') })).replace(/[?#].*$/, '').replace(/\/$/, '') + '/';
  const b = await chromium.launch(); let fails = 0;
  for (const [name, vp, touch] of VPS) for (const pass of ['measure', 'shots']) {
    const ctx = await b.newContext({ viewport: vp, hasTouch: touch, isMobile: touch, deviceScaleFactor: pass === 'shots' ? 2 : 1 }), p = await ctx.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e)));
    await ctx.addInitScript(() => { try { localStorage.setItem('gxh-perch-and-plume', '{"on":false,"seen":{}}'); localStorage.setItem('pp-coach-done', '1'); } catch (e) { } });
    if (touch && pass === 'measure') { const c = await ctx.newCDPSession(p); await c.send('Emulation.setCPUThrottlingRate', { rate: 4 }); }
    await p.goto(URL); await p.waitForTimeout(800);
    await p.evaluate(() => {
      startGame({ seats: [{ name: 'You', kind: 'human', face: 'you' }, { name: 'Fern', kind: 'ai', lvl: 'normal', face: 'pip' }], mode: 'vs', seed: 11,
        prep: function (Gx) { PP.performMove(Gx, PPAI.setup(Gx, 0), 0); PP.performMove(Gx, PPAI.setup(Gx, 1), 1); Gx.cur = 0; Gx.first = 0; Gx.fx = [];
          var me = Gx.pl[0], bd = PP.DATA.birds.find(function (x) { return x.h.indexOf('F') >= 0 && x.c.length === 1 && x.c[0] === 'seed' && !PP.power(x.id).col; }) || PP.DATA.birds.find(function (x) { return x.h.indexOf('F') >= 0 && x.c.length === 1 && x.c[0] === 'seed'; });
          [Gx.deck, Gx.tray].forEach(function (a) { var k = a.indexOf(bd.id); if (k >= 0) a.splice(k, 1, a === Gx.tray ? Gx.deck.shift() : undefined); }); Gx.deck = Gx.deck.filter(function (x) { return x != null; });
          me.hand.unshift(bd.id); me.food = { grub: 0, seed: 2, fish: 0, berry: 0, rodent: 0 }; } });
      window.__lt = []; setTimeout(() => new PerformanceObserver(l => l.getEntries().forEach(e => { window.__lt.push(Math.round(e.duration)); (window.__lts = window.__lts || []).push(Math.round(e.startTime) + ':' + Math.round(e.duration)); })).observe({ type: 'longtask', buffered: false }), 1500);
    });
    const frames = [], shot = async tag => { if (pass === 'measure') { console.log('  t=' + await p.evaluate(() => Math.round(performance.now())) + ' ' + tag); return; } const f = path.join(SHOTS, `f-${name}-${frames.length}.png`); await p.screenshot({ path: f }); frames.push([f, tag]); };
    const drag = await dragger(p, ctx, touch); let ok = true;
    try {
      await p.waitForFunction(() => myTurn() && !UI.busy && !G.q && document.querySelector('#hand .bc[data-gxf-drag]'), null, { timeout: 15000 });
      await p.waitForTimeout(400);
      const hi = await p.evaluate(() => { var e = document.querySelector('#hand .bc[data-gxf-drag]'); e.scrollIntoView({ block: 'nearest' }); return +e.dataset.i; });
      await p.waitForTimeout(150);
      const a = await p.locator(`#hand .bc[data-i="${hi}"]`).boundingBox(), r = await p.locator('.row[data-h="0"] .slot.next').boundingBox();
      await drag(a, r, () => shot('drag: bird lifts, row glows'));
      if (await p.locator('#acts [data-a="playgo"]').count()) await p.locator('#acts [data-a="playgo"]').click();
      await p.waitForTimeout(touch ? 420 : 380); await shot('drop: camera in, +3 flies');
      await p.waitForTimeout(500); await shot('score rolls up');
      // the rival's turn
      await p.waitForFunction(() => G.q == null && PP.sideToAct(G) === 1 && !UI.busy, null, { timeout: 20000 }).catch(() => { });
      await p.waitForFunction(() => UI.busy && UI.animSeat === 1, null, { timeout: 20000 }).catch(() => { });
      await p.waitForTimeout(500); await shot("rival: its move, step by step");
      // my turn: get food, then drag a die into the food row
      await p.waitForFunction(() => myTurn() && !UI.busy && !G.q, null, { timeout: 30000 });
      await p.waitForTimeout(300);
      await p.locator('#act4 .a4-food, .ract[data-h="0"]').first().click();
      await p.waitForFunction(() => G.q && (G.q.h === 'die' || G.q.h === 'bonus') && !UI.busy, null, { timeout: 15000 });
      if (await p.evaluate(() => G.q.h === 'bonus')) await p.evaluate(() => { const b = [...document.querySelectorAll('#acts [data-a="mv"]')].find(x => JSON.parse(x.dataset.m).yes === false); b.click(); });
      await p.waitForFunction(() => G.q && G.q.h === 'die' && document.querySelector('.die[data-gxf-drag]'), null, { timeout: 15000 }).catch(async e => { throw new Error('die wait: ' + await p.evaluate(() => JSON.stringify([G.q, UI.busy, myTurn(), document.querySelectorAll('.die').length, document.querySelectorAll('[data-gxf-drag]').length]))); });
      await p.waitForTimeout(300);
      const d = await p.locator('.die[data-gxf-drag]').first().boundingBox(), fr = await p.locator(touch ? '.row[data-h="0"]' : '#foodrow').boundingBox();
      await drag(d, fr, () => shot('drag: a die over your food'));
      await p.waitForTimeout(250); await shot('the food lands');
      await p.waitForTimeout(1500);
    } catch (e) { ok = false; errs.push('flow: ' + e.message.split('\n')[0]); }
    if (pass === 'measure') console.log('  lt', await p.evaluate(() => (window.__lts || []).join(' ')));
    const lt = await p.evaluate(() => window.__lt || []), worst = lt.length ? Math.max.apply(null, lt) : 0;
    if (pass === 'measure') { const g = worst <= 100 && ok && !errs.length; if (!g) fails++; console.log(name, g ? 'PASS' : 'FAIL', 'long tasks during animated turns' + (touch ? ' (4x CPU)' : '') + ': ' + lt.length + ' over 50ms, worst ' + worst + 'ms', errs.slice(0, 2).join(' | ')); }
    else { const g = ok && !errs.length && frames.length >= 6; if (!g) fails++; fs.writeFileSync(path.join(SHOTS, `frames-${name}.json`), JSON.stringify(frames.slice(0, 6))); console.log(name, g ? 'PASS' : 'FAIL', 'animated drag + rival + die drag, ' + frames.length + ' frames', errs.slice(0, 2).join(' | ')); }
    await ctx.close();
  }
  await b.close(); process.exit(fails ? 1 : 0);
})();

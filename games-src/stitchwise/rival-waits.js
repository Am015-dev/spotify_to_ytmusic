// node rival-waits.js $PWD/stitchwise.html 390x844 : real game vs default Easy rival, default settings (animations on), by touch; measures the wait from my move to my next turn
const { chromium } = require('playwright');
(async () => {
  const [w, h] = process.argv[3].split('x').map(Number); const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true }); const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('sw_seen', '1'); } catch (e) { } });
  await pg.goto('file://' + process.argv[2]); await pg.waitForTimeout(900); const cdp = await ctx.newCDPSession(pg);
  const tapXY = async (x, y) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  const tap = async el => { const bb = await el.boundingBox(); await tapXY(bb.x + bb.width / 2, bb.y + bb.height / 2); };
  await pg.evaluate(() => { UI.lvl = 'easy'; newGame('vs', { lvl: 'easy', first: 0 }); }); await pg.waitForTimeout(500);
  const gaps = []; let n = 0; const csPlace = [], csBuy = [], rot = [];
  while (n++ < 120) {
    await pg.waitForFunction(() => G.over || (!UI.busy && isHuman(swWho(G))), null, { timeout: 60000 }); if (await pg.evaluate(() => G.over)) break;
    csBuy.push(await pg.evaluate(() => UI.cs));
    if (await pg.evaluate(() => !!G.pend)) { const i = await pg.evaluate(() => G.board[0].findIndex(v => v === -1)); const c = await (await pg.$$('#quilt .qc'))[i].boundingBox(); csPlace.push(c.width); await tapXY(c.x + c.width / 2, c.y + c.height / 2); await pg.waitForTimeout(300); continue; }
    const mv = await pg.evaluate(() => { const m = aiMove(G, 'normal', () => .5); return m.t === 'buy' ? m : null; }); let done = false;
    if (mv) {
      const o = await pg.$$('#offers .offer:not(.up)'); await tap(o[mv.k]); await pg.waitForTimeout(350);
      const q = await (await pg.$('#quilt')).boundingBox(); csPlace.push(q.width / 9);
      for (const a of ['rot', 'flip']) { const e = await pg.$('[data-a=' + a + ']'); if (e) { const bb = await e.boundingBox(); rot.push(Math.min(bb.width, bb.height)); } }
      await pg.evaluate(mv => { UI.o = mv.o; UI.gx = mv.x; UI.gy = mv.y; drawGhost(); }, mv);
      const s = await pg.$('[data-a=sew]:not([disabled])'); if (s) { await tap(s); done = true; } else { const c = await pg.$('[data-a=cancel]'); if (c) await tap(c); await pg.waitForTimeout(300); }
    }
    if (!done) { const a = await pg.$('[data-a=adv]'); await tap(a); }
    const t0 = Date.now(), l0 = await pg.evaluate(() => G.log.length);
    await pg.waitForFunction(() => G.over || (!UI.busy && isHuman(swWho(G))), null, { timeout: 60000, polling: 50 });
    const dt = Date.now() - t0, rv = await pg.evaluate(l0 => G.log.slice(l0).filter(l => l[0] === 1).length, l0); if (rv) gaps.push([dt, rv]);
  }
  const per = gaps.map(g => g[0] / g[1]), avg = per.reduce((a, b) => a + b, 0) / per.length;
  const over = await pg.evaluate(() => G.over), res = over ? await pg.evaluate(() => [swScore(G, 0).total, swScore(G, 1).total]) : null;
  console.log(process.argv[3], 'rival: avg per move', (avg / 1000).toFixed(2) + 's', 'avg gap', (gaps.reduce((a, g) => a + g[0], 0) / gaps.length / 1000).toFixed(2) + 's', 'max gap', (Math.max(...gaps.map(g => g[0])) / 1000).toFixed(2) + 's', 'max per move', (Math.max(...per) / 1000).toFixed(2) + 's', 'gaps', gaps.length, '| quilt sq placing min', Math.min(...csPlace).toFixed(1), 'buying min', Math.min(...csBuy), '| rot/flip min', Math.min(...rot).toFixed(0), '| over', over, res, 'errors', errs.length);
  await b.close();
})();

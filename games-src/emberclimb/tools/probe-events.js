// Event softlock probe: every event x every option, by touch at 390x844, the same way tools/newcomer-taps.js plays events; must leave the event.
// Run: node tools/probe-events.js
const { chromium } = require('playwright'), { serve, sleep, tap } = require('./tap-lib');
(async () => {
  const { srv, base } = await serve(); const br = await chromium.launch(); let bad = 0;
  const pg = await (await br.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })).newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(base); await pg.waitForSelector('#title');
  const evs = await pg.evaluate(() => Object.keys(EC.D.EVENTS).filter(k => !EC.D.EVENTS[k].start).map(k => [k, EC.D.EVENTS[k].o.length]));
  for (const [id, n] of evs) for (let oi = 0; oi < n; oi++) {
    await pg.evaluate(([id]) => { window.EC_NOSAVE = 1; EC.E.newGame({ heroes: ['w'], gentle: 1, seed: 3 }); const g = EC.E.G(); g.gold = 999; g.evn = { id, res: null }; g.scr = 'event'; UI.mode = 'game'; UI.ov = null; UI.render(); }, [id]);
    await sleep(250); let left = false; const log = [];
    for (let step = 0; step < 12 && !left; step++) {
      const scr = await pg.evaluate(() => EC.E.G().scr); if (scr !== 'event') { left = true; break; }
      const dc = await pg.$$eval('.card', ns => ns.map((n, i) => ((!n.closest('#app') && n.offsetParent) || (n.closest('.ov') && n.getBoundingClientRect().height > 0)) ? i : -1).filter(i => i >= 0)).catch(() => []);
      if (dc.length) { const all = await pg.$$('.card'); await tap(pg, true, all[dc[0]]); log.push('card'); await sleep(300); const ok2 = await pg.$('#upg-ok'); if (ok2) { await tap(pg, true, ok2); log.push('ok'); } await sleep(250); continue; }
      const os = await pg.$$('.opts .btn:not([disabled])'); if (os.length) { await tap(pg, true, os[Math.min(oi, os.length - 1)]); log.push('opt'); await sleep(250); continue; }
      const b = await pg.$('#ev-leave') || await pg.$('#app button.btn'); if (b) { await tap(pg, true, b); log.push('leave'); await sleep(250); continue; }
      log.push('nothing'); await sleep(200);
    }
    if (!left) { bad++; console.log('STUCK', id, 'opt', oi, log.join(','), await pg.evaluate(() => JSON.stringify({ evn: EC.E.G().evn, ov: UI.ov, vm: EC.E.validMoves() }))); }
  }
  console.log(bad ? 'EVENTS FAIL ' + bad : 'EVENTS PASS (' + evs.reduce((a, e) => a + e[1], 0) + ' options)', 'page errors', errs.length); await br.close(); srv.close(); process.exit(bad ? 1 : 0);
})();

// Scenario tutorial in the browser at machine speed: solves all 10 scenarios with real moves (doMove), checks a wrong play FAILS with a
// message, Retry restarts, and the player can tap the game during a scenario. node scenarios-ui.js [baseUrl]  (both 402x874 and 1366x768)
const { chromium } = require('playwright'); const { turbo, budget, tick } = require('../../scripts/turbo');
const URL = process.argv[2] || 'http://localhost:8779/ochre-horizon/';
(async () => {
  const b = await chromium.launch({ executablePath: require('fs').existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined }); let fails = 0;
  for (const vp of [{ width: 402, height: 874, m: 1 }, { width: 1366, height: 768 }]) {
    const t0 = Date.now(), stop = budget(60000, 'scenarios ' + vp.width);
    const c = await b.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: !!vp.m, isMobile: !!vp.m }); await turbo(c);
    const p = await c.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e)));
    await p.goto(URL + '?learn=1'); await tick(p, 400);
    for (let i = 0; i < 10; i++) {
      const play = async (kind) => p.evaluate(async ([i, kind]) => {
        const sc = OHC.SC[i], wait = () => new Promise(r => setTimeout(r, 2)); let n = 0;
        if (kind === 'solve' && sc.policy || kind === 'wrong' && sc.wrong === 'pass') {
          while (SCN.S && !SCN.S.ended && n++ < 300) { if (OH.sideToAct() !== 0) { await wait(); continue; } const m = kind === 'solve' ? OHAI.decide('hard') : (G.pending ? OH.validMoves()[0] : { t: G.phase === 'final' ? 'done' : G.acts === 1 ? 'end' : 'pass' }); if (!doMove(m)) return 'illegal ' + JSON.stringify(m); await wait(); }
        } else for (let m of sc[kind]) { if (typeof m === 'function') m = m(); if (!doMove(m)) return 'illegal ' + JSON.stringify(m); await wait(); }
        const R = SCN.S.result; return R ? (R.ok ? 'win' : 'fail') + '|' + document.querySelector('#tw .scr').textContent + '|' + R.line : 'open';
      }, [i, kind]);
      await p.evaluate(i => scStart(i), i); await tick(p, 50);
      // the player can tap anything: no tutorial layer or modal sits over the board outside the small card; the hand opens and closes
      const tap = await p.evaluate(() => { const tw = $('tw').getBoundingClientRect(), bw = $('bw').getBoundingClientRect(); let free = 0, pts = 0;
        for (let x = bw.left + 20; x < bw.right - 20; x += 40) for (let y = bw.top + 20; y < bw.bottom - 20; y += 40) { if (x > tw.left && x < tw.right && y > tw.top && y < tw.bottom) continue; pts++; const e = document.elementFromPoint(x, y); if (e && !e.closest('#tw,#hg,#twRing,#modal,#chP')) free++; }
        return { area: tw.width * tw.height / innerWidth / innerHeight, free: free / Math.max(1, pts) }; });
      await p.click('#bCards'); await tick(p, 50); const opened = await p.evaluate(() => UI.sheet === 'cards'); await p.evaluate(() => closeSheet());
      const win = await play('solve'); await p.click('#scRe'); await tick(p, 20);
      const re = await p.evaluate(() => !!SCN.S && !SCN.S.ended && SCN.S.acts === 0 && !!document.querySelector('#tw .sco'));
      const lose = await play('wrong');
      const ok = /^win\|WIN/.test(win) && /^fail\|FAIL\|.{10,}/.test(lose) && re && opened && tap.area < 0.3 && tap.free === 1;
      if (!ok) fails++;
      console.log((ok ? 'PASS ' : 'FAIL ') + vp.width + ' #' + (i + 1) + ' solve=' + win.split('|')[0] + ' wrong=' + lose.split('|')[0] + ' retry=' + re + ' tapHand=' + opened + ' card=' + (tap.area * 100).toFixed(0) + '% boardFree=' + (tap.free * 100).toFixed(0) + '%' + (ok ? '' : ' :: ' + win + ' :: ' + lose));
    }
    console.log(vp.width + 'x' + vp.height + ': ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s, JS errors: ' + errs.length + (errs.length ? ' ' + errs.slice(0, 3).join(' | ') : ''));
    if (errs.length) fails++;
    stop(); await c.close();
  }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();

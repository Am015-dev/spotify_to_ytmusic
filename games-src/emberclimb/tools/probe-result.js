// G3 check: on the result screen at 375x667 and 390x844 no relic button sits under the Play again / Title bar (scrolled to the end)
const { chromium } = require('playwright'), path = require('path'), { serve, sleep } = require('./tap-lib');
(async () => {
  const { srv, base } = await serve(); const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let bad = 0;
  for (const [w, hh] of [[375, 667], [390, 844]]) {
    const ctx = await br.newContext({ viewport: { width: w, height: hh }, hasTouch: true, isMobile: true }); const pg = await ctx.newPage();
    await pg.goto(base); await pg.waitForSelector('#title');
    await pg.evaluate(() => { EC.E.newGame({ heroes: ['w'], seed: 5 }); const g = EC.E.G(); ['iron-bangle', 'bag-of-marbles', 'gold-tooth', 'lantern', 'dawnstone', 'gale-cloak', 'candle-stub'].forEach(r => g.relics.push(r)); EC.E.debug.over(0); UI.mode = 'game'; UI.render(); });
    await sleep(900); await pg.evaluate(() => { const o = document.querySelector('.over.res'); if (o) o.scrollTop = 1e5; }); await sleep(300);
    const r = await pg.evaluate(() => { const b = document.querySelector('.rbtns'); if (!b) return { err: 'no buttons' }; const bt = b.getBoundingClientRect().top + 12; const rel = [...document.querySelectorAll('.rrel')]; return { n: rel.length, under: rel.filter(e => { const q = e.getBoundingClientRect(); const t = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return !(t && e.contains(t)); }).length, stat: (document.querySelector('.rstat') || {}).textContent }; });
    console.log(w + 'x' + hh, JSON.stringify(r)); if (r.err || r.under) bad++;
    await pg.screenshot({ path: path.join(__dirname, '..', 'playable-shots', 'g3', 'result-' + w + '.png') }); await ctx.close();
  }
  await br.close(); srv.close(); console.log(bad ? 'RESULT CHECK FAIL' : 'RESULT CHECK PASS'); process.exit(bad ? 1 : 0);
})();

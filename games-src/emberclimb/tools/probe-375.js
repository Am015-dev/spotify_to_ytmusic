// G3 check: in a fight at 375x667 and 390x844 the enemy intent badge must not sit under the top bar (potions / relics); writes playable-shots/g3/
const { chromium } = require('playwright'), path = require('path'), fs = require('fs'), { serve, sleep } = require('./tap-lib');
const OUT = path.join(__dirname, '..', 'playable-shots', 'g3'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const { srv, base } = await serve(); const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let bad = 0;
  for (const [w, hh] of [[375, 667], [390, 844]]) {
    const ctx = await br.newContext({ viewport: { width: w, height: hh }, hasTouch: true, isMobile: true }); const pg = await ctx.newPage();
    await pg.goto(base); await pg.waitForSelector('#title'); await pg.evaluate(() => { localStorage.setItem('gxt-done-emberclimb', '1'); });
    await pg.evaluate(() => { EC.E.newGame({ heroes: ['w'], seed: 5 }); const g = EC.E.G(); g.pots = ['fire-flask', 'frost-gas']; g.relics.push('iron-bangle', 'bag-of-marbles', 'gold-tooth'); EC.E.performMove({ t: 'go', n: EC.E.validMoves()[0].n }); g.b.en.forEach(e => { e.intent = { atk: 8, vuln: 2, tg: 0 }; }); UI.mode = 'game'; UI.render(); });
    await sleep(1200);
    const r = await pg.evaluate(() => [...document.querySelectorAll('.en .intent')].map(e => { const b = e.getBoundingClientRect(); const t = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2); const top = document.querySelector('.w485top'); const tb = top ? top.getBoundingClientRect().bottom : 0; return { top: Math.round(b.top), barBottom: Math.round(tb), hit: t ? t.className : null, ok: !!t && (e === t || e.contains(t)) && b.top >= tb }; }));
    console.log(w + 'x' + hh, JSON.stringify(r)); if (!r.length || r.some(x => !x.ok)) bad++;
    await pg.screenshot({ path: path.join(OUT, 'fight-' + w + '.png') }); await ctx.close();
  }
  await br.close(); srv.close(); console.log(bad ? 'INTENT CHECK FAIL' : 'INTENT CHECK PASS'); process.exit(bad ? 1 : 0);
})();

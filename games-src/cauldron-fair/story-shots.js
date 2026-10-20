// screenshots of the boss cards and a chapter start for both phone sizes
const L = require('./pwlib.js'), path = require('path'), OUT = path.join(__dirname, 'story-shots');
const click = (p, sel, txt) => p.evaluate(([sel, txt]) => { const b = [...document.querySelectorAll(sel)].find(x => !txt || txt.split('|').some(t => x.textContent.indexOf(t) >= 0)); if (!b) return false; b.click(); return true; }, [sel, txt]);
(async () => {
  const b = await L.launch();
  for (const [W, H] of [[390, 763], [375, 553]]) {
    const p = await L.page(b, W, H, { mobile: true, touch: true }), t = W + 'x' + H;
    await p.goto('http://gns.test/'); await p.evaluate(() => { const ch = {}; for (let i = 1; i <= 9; i++) ch['c' + i] = { beaten: true, stars: 2, tries: 1, losses: 0 }; localStorage.setItem('gns-campaign-cauldron', JSON.stringify({ v: 1, ch, unlocked: [], last: 'c9' })); }); await p.goto('http://gns.test/'); await p.waitForTimeout(1200);
    await click(p, '[data-a=story]'); await p.waitForTimeout(500); await p.evaluate(() => { const n = document.querySelector('.gxc-map,.gxc-road'); const s = document.querySelector('.gxc-scene-on,.gxc-map-on'); const sc = [...document.querySelectorAll('*')].find(e => e.scrollHeight > e.clientHeight + 50 && getComputedStyle(e).overflowY !== 'visible' && e.closest('.gxc')); if (sc) sc.scrollTop = sc.scrollHeight; }); await p.waitForTimeout(300); await p.screenshot({ path: path.join(OUT, '2b-map-end-' + t + '.png') });
    for (const id of ['c3', 'c6', 'c10']) {
      await p.evaluate(i => GXC.play(i), id); await p.waitForTimeout(300);
      for (let k = 0; k < 8; k++) { if (await p.evaluate(() => !![...document.querySelectorAll('.gxc-btn')].find(x => x.textContent === 'Fight'))) break; await click(p, '.gxc-btn.go', 'Next|Start|Meet'); await p.waitForTimeout(150); }
      await p.waitForTimeout(600); await p.screenshot({ path: path.join(OUT, 'boss-' + id + '-' + t + '.png') });
      await click(p, '.gxc-btn.go', 'Fight'); await p.waitForTimeout(900); await p.screenshot({ path: path.join(OUT, 'game-' + id + '-' + t + '.png') });
      await p.evaluate(() => { UI.camp = null; GXC.close(); showStart(); });
    }
    await p.evaluate(() => GXC.play('c1')); await p.waitForTimeout(300); for (let k = 0; k < 6; k++) { await click(p, '.gxc-btn.go', 'Next|Start|Meet'); await p.waitForTimeout(150); } await p.waitForTimeout(900); await p.screenshot({ path: path.join(OUT, '5-chapter1-start-' + t + '.png') });
    console.log(t, JSON.stringify(await p.evaluate(() => ({ sx: document.documentElement.scrollWidth > innerWidth, bar: (() => { const m = [...document.querySelectorAll('.gx-bar button')].pop().getBoundingClientRect(); return m.right <= innerWidth + 1; })() }))), p.errs);
    await p.close();
  }
  await b.close();
})();

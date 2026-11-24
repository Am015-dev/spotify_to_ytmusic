// Onyx Atelier story test (turbo, < 60 s per size): Story button -> map -> chapter 1 played to a win by scripted moves ->
// stars saved, chapter 2 unlocked, Next chapter offered -> every chapter's setup (normal and easier) loads with no errors.
// usage: node story-test.js [url]   (default: the built onyx-atelier.html next to this file)
const { chromium } = require('playwright'); const path = require('path');
const { turbo, budget } = require('../scripts/turbo');
const URL = process.argv[2] || 'file://' + path.join(__dirname, 'onyx-atelier.html');
const SIZES = [[402, 874, true], [1366, 768, false]];
(async () => {
  const b = await chromium.launch({ executablePath: require('fs').existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined }); let fails = 0;
  for (const [w, h, mob] of SIZES) {
    const t0 = Date.now(), stop = budget(60000, 'story ' + w);
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: mob, isMobile: mob }); await turbo(ctx);
    const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', w + 'x' + h, m); } };
    await p.goto(URL); await p.evaluate(() => { localStorage.clear(); window.AIDELAY = 0; });
    await p.click('#title [data-t="story"]');
    ok(await p.locator('.gxc-node').count() === 12, '12 chapter nodes');
    ok(await p.locator('.gxc-node.open').count() === 1 && await p.locator('.gxc-node.locked').count() === 11, '1 open, 11 locked');
    await p.click('.gxc-node.open'); await p.click('.gxc-sheet .gxc-btn.go');
    await p.waitForSelector('.gxc-scene'); await p.click('.gxc-scene .gxc-btn.ghost');   // skip the scene
    await p.waitForSelector('#obj'); ok(await p.evaluate(() => getComputedStyle(document.getElementById('obj')).pointerEvents) === 'none', 'goal card ignores taps');
    // scripted moves: my side plays the hard plan, one move at a time through the real act()
    const end = await p.evaluate(async () => {
      const T = OA_TEST, w8 = ms => new Promise(r => setTimeout(r, ms));
      for (let i = 0; i < 4000 && !T.U.G.over; i++) {
        const g = T.U.G;
        if (g.turn === 0 && !T.U.busy) { const seq = T.AI.pick(T.E.clone(g), 'hard'); if (seq.length) T.act(seq[0]); }
        await w8(30);
      }
      return T.U.G.over;
    });
    ok(end && end.winner === 0, 'chapter 1 won (' + JSON.stringify(end) + ')');
    await p.waitForSelector('.gxc-res');
    ok(/won/i.test(await p.textContent('.gxc-res h2')), 'result says Chapter won');
    ok(await p.locator('.gxc-res .oa-story-out').count() === 1, 'story outcome line');
    ok(await p.locator('.gxc-res button:has-text("Next chapter")').count() === 1, 'Next chapter button');
    const prog = await p.evaluate(() => JSON.parse(localStorage.getItem('gns-campaign-onyx-atelier')));
    ok(prog && prog.ch.c1 && prog.ch.c1.beaten && prog.ch.c1.stars >= 1, 'stars saved: ' + JSON.stringify(prog && prog.ch.c1));
    await p.click('.gxc-res [data-gxc-esc]');   // Map: the outro scene plays first
    await p.waitForSelector('.gxc-scene'); await p.click('.gxc-scene .gxc-btn.ghost');
    await p.waitForSelector('.gxc-node');
    ok(await p.evaluate(() => document.querySelectorAll('.gxc-node')[1].classList.contains('open')), 'chapter 2 unlocked');
    // every chapter's setup, normal and easier
    const bad = await p.evaluate(() => { const out = []; GXC.data().chapters.forEach(c => [false, true].forEach(e => { try { const G = OST.start(GXC.resolve(c, e)); OA_TEST.E.checkInvariants(G); if (!document.getElementById('obj')) out.push(c.id + ' no goal card'); if (!e && c.twist && c.twist.id === 'rival-ring' && G.pl[1].cards.length !== 1) out.push(c.id + ' ring'); } catch (x) { out.push(c.id + (e ? ' easy ' : ' ') + x.message); } })); OA_TEST.showTitle(); return out; });
    ok(!bad.length, 'chapter setups: ' + bad.join('; '));
    ok(errs.length === 0, 'JS errors: ' + errs.slice(0, 3).join(' | '));
    console.log(`story ${w}x${h}: ${((Date.now() - t0) / 1000).toFixed(1)} s, ${errs.length} JS errors, stars ${prog && prog.ch.c1 && prog.ch.c1.stars}`);
    stop(); await ctx.close();
  }
  await b.close(); console.log(fails ? 'story-test: ' + fails + ' FAIL' : 'story-test: all ok'); process.exit(fails ? 1 : 0);
})();

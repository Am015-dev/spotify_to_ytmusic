// R3: the title must show Learn and Story on every cold load. 10 fresh loads each at 390x844 (touch) and 1440x900.
const { chromium } = require('playwright'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const SITE = process.env.SITE || '/tmp/na-site';
(async () => { const b = await chromium.launch(); let bad = 0;
  for (const [w, h, mob] of [[390, 844, true], [1440, 900, false]]) for (let i = 0; i < 10; i++) {
    const back = i % 2 === 1;   // odd loads: a returning player (played before, lesson done)
    const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: mob, isMobile: mob }); const p = await ctx.newPage(); if (back) await ctx.addInitScript(() => { try { localStorage.setItem('na_played', '1'); } catch (e) { } });
    await p.goto('file://' + SITE + '/index.html', { waitUntil: 'domcontentloaded' }); await sleep(150);
    const r = await p.evaluate(() => { const v = q => [...document.querySelectorAll(q)].some(e => e.getBoundingClientRect().width > 2); return { learn: v('.dlg.start [data-gxt-open]'), story: v('.dlg.start [data-a="story"]') }; });
    if (!r.learn || !r.story) { bad++; console.log(w, 'load', i, JSON.stringify(r)); } await ctx.close(); }
  console.log('title-race: 20 cold loads, missing on', bad); await b.close(); process.exit(bad ? 1 : 0); })();

// Prints {slug: [{id, sizes}]} for the games given: opens each game's ?scn=list page (the scenario registry lives in the page). Used by playwright.config.js.
const { chromium } = require('playwright'), gx = require('./gx-serve.js');
(async () => {
  let own = null, base = process.env.GX_URL;
  if (!base || !(await fetch(base).then(() => true, () => false))) { own = await gx.startServer({ stage: process.env.GX_STAGE }); base = own.base; }
  const browser = await chromium.launch({ args: ['--no-sandbox'] }), out = {};
  for (const slug of process.argv.slice(2)) {
    const page = await browser.newPage();
    await page.goto(`${base.replace(/\/+$/, '')}/${slug}/?scn=list`, { waitUntil: 'load', timeout: 45000 }).catch(() => { });
    out[slug] = await page.waitForFunction(() => window.GXSCN && window.GXSCN.ready, null, { timeout: 20000 }).then(() => page.evaluate(() => (window.GXSLIST || []).map(s => ({ id: s.id, sizes: s.sizes })))).catch(() => []);
    await page.close();
  }
  await browser.close(); if (own) await own.close();
  console.log(JSON.stringify(out));
})();

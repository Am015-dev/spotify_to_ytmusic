// Lists every game's registered scenarios (?scn=list) and merges them into games/scenarios.json {slug: [{id,name,ask,group,sizes}]} for games/lab.html.
//   NODE_PATH=/opt/node-tools/node_modules node games-src/scripts/lab-index.js <slug...>      (env GX_URL: shared server, else a private one over staging + games/)
const fs = require('fs'), path = require('path'), { chromium } = require('playwright'), gx = require('./gx-serve.js');
(async () => {
  const slugs = process.argv.slice(2); if (!slugs.length) { console.error('usage: lab-index.js <slug...>'); process.exit(2); }
  let own = null, base = process.env.GX_URL; if (!base) { own = await gx.startServer({}); base = own.base; } base = base.replace(/\/+$/, '');
  const F = path.join(__dirname, '..', '..', 'games', 'scenarios.json'); let all = {}; try { all = JSON.parse(fs.readFileSync(F, 'utf8')); } catch (e) { }
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  for (const slug of slugs) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 763 }, serviceWorkers: 'block' }), p = await ctx.newPage();
    await p.goto(`${base}/${slug}/?scn=list`, { waitUntil: 'load', timeout: 45000 }).catch(() => { });
    await p.waitForFunction(() => window.GXSLIST, null, { timeout: 20000 }).catch(() => { });
    const l = await p.evaluate(() => window.GXSLIST || []); await ctx.close();
    if (l.length) { all[slug] = l; console.log('lab-index', slug, l.length, 'scenarios'); } else console.log('lab-index', slug, 'NO scenarios (kept old list)');
  }
  fs.writeFileSync(F, JSON.stringify(Object.fromEntries(Object.keys(all).sort().map(k => [k, all[k]])), null, 1) + '\n');
  await b.close(); if (own) await own.close();
})();

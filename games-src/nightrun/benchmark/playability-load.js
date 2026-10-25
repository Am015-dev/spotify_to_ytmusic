// W240: cold load of a URL on a phone profile (390x763, touch, 4x CPU): time to DOMContentLoaded, FLIGHT button, first flight frame, bytes fetched, live build hash.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/benchmark/playability-load.js [baseUrl]
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'https://am015-dev.github.io/spotify_to_ytmusic/mainhattan-nightrun/';
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 763 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  let bytes = 0, reqs = 0, big = []; p.on('response', async r => { reqs++; const l = +(r.headers()['content-length'] || 0); bytes += l; if (l > 300000) big.push(r.url().split('/').pop().slice(0, 40) + ' ' + (l / 1e6).toFixed(1) + 'MB'); });
  const t = Date.now(); await p.goto(BASE + 'index.html', { waitUntil: 'domcontentloaded', timeout: 120000 }); const dcl = Date.now() - t;
  await p.waitForFunction(() => { const e = document.getElementById('focFlight'); return e && e.getBoundingClientRect().width > 0; }, null, { timeout: 120000 }); const btn = Date.now() - t;
  const stamp = await p.evaluate(() => typeof NR_STAMP !== 'undefined' ? NR_STAMP : (document.documentElement.innerHTML.match(/NR_STAMP='([^']*)'/) || [])[1]);
  const t2 = Date.now(); await p.tap('#focFlight'); await p.waitForFunction(() => window.__mnr && __mnr.running, null, { timeout: 60000 }).catch(() => { }); const play = Date.now() - t2;
  await new Promise(r => setTimeout(r, 4000));
  console.log(JSON.stringify({ base: BASE, stamp, dcl, flightBtn: btn, tapToRunning: play, reqs, MB: +(bytes / 1e6).toFixed(1), big: big.slice(0, 10) }));
  await b.close();
})();

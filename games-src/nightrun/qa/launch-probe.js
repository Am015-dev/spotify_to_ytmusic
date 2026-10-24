#!/usr/bin/env node
// LAUNCH PROBE: long tasks in the first 20 s after load, desktop, fresh cache, no service worker. Prints numbers; with GATE=1 also PASS/FAIL.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/launch-probe.js    env: W=1440 H=860 SECS=20 BASE=<long-task total ms of the old build, for the halving gate>
const { boot, sleep } = require('./lib.js');
const W = +process.env.W || 1440, H = +process.env.H || 860, SECS = +process.env.SECS || 20, BASE = +process.env.BASE || 0;
(async () => {
  const b = await boot();
  try {
    const ctx = await b.br.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, serviceWorkers: 'block' });
    const p = await ctx.newPage(); const errs = []; let reqs = 0, maxPar = 0, par = 0;
    p.on('pageerror', e => errs.push(String(e.message).slice(0, 200)));
    p.on('request', r => { if (/\.(webp|mp3|png)/.test(r.url())) { reqs++; par++; maxPar = Math.max(maxPar, par); } }); p.on('requestfinished', r => { if (/\.(webp|mp3|png)/.test(r.url())) par--; }); p.on('requestfailed', r => { if (/\.(webp|mp3|png)/.test(r.url())) par--; });
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.addInitScript(() => { try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); } catch (e) { }
      window.__lt = []; window.__txt = []; window.__lgap = []; { let last = 0; const f = t => { if (last && t - last > 50) window.__lgap.push(Math.round(t - last)); last = t; requestAnimationFrame(f); }; requestAnimationFrame(f); }
      try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ entryTypes: ['longtask'] }); } catch (e) { }
      const poll = () => { const el = document.getElementById('ldLine'); if (el && el.textContent) { const t = el.textContent, L = window.__txt; if (!L.length || L[L.length - 1][1] !== t) L.push([Math.round(performance.now()), t]); } setTimeout(poll, 50); }; poll(); });
    await p.goto(b.base, { waitUntil: 'domcontentloaded' }); await sleep(SECS * 1000);
    const d = await p.evaluate(() => ({ lt: window.__lt, txt: window.__txt, bm: Object.keys(__mnr.ART.bm).length, err: Object.keys(__mnr.ART.err).length, stale: __mnr.ART.stale || 0, fg: window.__lgap }));
    const lt = d.lt.filter(x => x[0] <= SECS * 1000), tot = lt.reduce((a, x) => a + x[1], 0), max = lt.reduce((a, x) => Math.max(a, x[1]), 0);
    console.log(JSON.stringify({ longTasks: lt.length, totalMs: tot, maxMs: max, top: lt.slice().sort((a, c) => c[1] - a[1]).slice(0, 8).map(x => x[1] + 'ms@' + x[0]), imgReqs: reqs, maxParallel: maxPar, bitmaps: d.bm, artErr: d.err, stale: d.stale, frameGaps50: d.fg.length, frameGapMs: d.fg.reduce((a, x) => a + x, 0), progressFirstMs: d.txt[0] && d.txt[0][0], progress: d.txt.length ? d.txt[0][1] + ' ... ' + d.txt[d.txt.length - 1][1] : 'none', errs }));
    if (process.env.GATE) { const ok = (n, c) => console.log((c ? 'PASS ' : 'FAIL ') + n);
      ok('no long task > 200 ms (' + max + ')', max <= 200); if (BASE) ok('total long-task time halved (' + tot + ' vs ' + BASE + ')', tot <= BASE / 2);
      ok('progress text within 500 ms of load', d.txt[0] && d.txt[0][0] < 500 + 0); ok('progress reaches Ready', d.txt.some(x => /^Ready/.test(x[1]))); ok('no page errors', !errs.length); }
  } finally { await b.close(); }
})();

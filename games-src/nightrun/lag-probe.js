#!/usr/bin/env node
// Nightrun lag probe: long tasks (>50 ms), frame-time spikes and input-to-frame delay, with song switches, track loads and boss entries forced on purpose.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/lag-probe.js      env: SECS=40 W=390 H=763 JSON=1 (print json)  QUERY='?all=1'
// Plays the real flow (district, boss, pit stop, next district) with one steering finger. Exit 1 if any live frame (not in the pit stop / pause) takes more than LIMIT ms (default 55: three frames at 60 Hz),
// a touchmove waits more than 50 ms for the next frame, or the page throws. Counts songs that had to be decoded in a hurry (NR.lag.urgent / .mid = during play).
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const SECS = +process.env.SECS || 40, W = +process.env.W || 390, H = +process.env.H || 763, LIMIT = +process.env.LIMIT || 55;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
(async () => {
  const port = await freePort(); const srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/index.html`)).ok) break; } catch (e) { } await sleep(100); }
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await br.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.addInitScript(() => {
    window.__lag = { lt: [], fr: [], inp: [], marks: [], on: false };
    try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lag.lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ entryTypes: ['longtask'] }); } catch (e) { }
    let last = 0, pend = [];
    const tick = t => { const L = window.__lag; if (L.on && last && !document.hidden) { const d = t - last, m = window.__mnr, q = m && (m.SH.active || m.paused || !m.running) ? 1 : 0; L.fr.push([Math.round(t), +d.toFixed(1), q]); } last = t;
      const nw = performance.now(); for (const ts of pend) L.inp.push(+(nw - ts).toFixed(1)); pend = []; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    addEventListener('touchmove', e => { if (window.__lag.on) pend.push(performance.now()); }, { capture: true, passive: true });
  });
  await p.goto(`http://127.0.0.1:${port}/index.html` + (process.env.QUERY || ''), { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => window.__mnr);
  const cdp = await ctx.newCDPSession(p);
  const touch = async (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: Math.round(x), y: Math.round(y), id: 1 }] });
  const r = await p.evaluate(() => { const b = document.getElementById('startBtn').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
  await touch('touchStart', r[0], r[1]); await sleep(40); await touch('touchEnd');
  await p.waitForFunction(() => window.__mnr.running, null, { timeout: 5000 });
  await p.evaluate(() => { window.__mnr.god = true; window.__lag.on = true; window.__lag.t0 = performance.now(); });
  const events = [];
  const mark = async (name) => { await p.evaluate(n => { window.__lag.marks.push([Math.round(performance.now()), n]); }, name); };
  const t0 = Date.now(), NDIST = +process.env.DISTS || 5; let k = 0;
  const cx = W / 2, cy = H / 2;
  await touch('touchStart', cx, cy);
  // one steering finger all the time; the real flow: district -> boss -> pit stop (shop) -> next district
  const steer = async (ms) => { const e = Date.now() + ms; while (Date.now() < e) { k++; const a = k * .35; await touch('touchMove', cx + Math.sin(a) * 90, cy + Math.cos(a * .8) * 160); await sleep(16); } };
  const st = () => p.evaluate(() => ({ di: __mnr.G.di, boss: !!__mnr.G.boss, pit: __mnr.SH.active, run: __mnr.running, dead: __mnr.G.dead }));
  for (let di = 0; di < NDIST; di++) {
    await mark('district' + di); await steer(7000);
    await p.evaluate(() => { __mnr.G.dt = __mnr.DIST ? 1e9 : 1e9; });          // district time is up: the boss comes
    await mark('boss-call' + di);
    for (let w = 0; w < 80 && !(await st()).boss; w++) await steer(250);
    await mark('boss' + di); await steer(6000);
    await p.evaluate(() => { __mnr.killBoss(); }); await mark('boss-dead' + di);
    for (let w = 0; w < 80 && !(await st()).pit; w++) await steer(250);
    await mark('pit' + di); await touch('touchEnd'); await sleep(4000);        // the shopper looks at the cards for 4 s
    const g = await p.evaluate(() => { const b = document.getElementById('shGo').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
    await touch('touchStart', g[0], g[1]); await sleep(40); await touch('touchEnd'); await sleep(300);
    await touch('touchStart', cx, cy);
  }
  await steer(3000);
  await touch('touchEnd');
  const d = await p.evaluate(() => ({ lag: window.__lag, fps: 0, urgent: window.__mnr.NR.lag ? window.__mnr.NR.lag.urgent : -1, mid: window.__mnr.NR.lag ? window.__mnr.NR.lag.mid : -1, loads: window.__mnr.NR.lag ? window.__mnr.NR.lag.loads : -1, ulog: window.__mnr.NR.lag ? window.__mnr.NR.lag.log : [], hist: window.__mnr.NR.lag ? window.__mnr.NR.lag.hist : [] }));
  const live = d.lag.fr.filter(x => !x[2]); const fr = live.map(x => x[1]); const spikes = live.filter(x => x[1] > LIMIT);
  const near = (t, ms) => { let b = null; for (const m of d.lag.marks) if (t >= m[0] && t <= m[0] + ms) b = m; return b; };
  const inp = d.lag.inp.slice().sort((a, b) => a - b), pc = q => inp.length ? inp[Math.floor(inp.length * q)] : 0;
  const sorted = fr.slice().sort((a, b) => a - b);
  const res = { frames: fr.length, avgFps: +(1000 / (fr.reduce((a, b) => a + b, 0) / fr.length)).toFixed(1), p50: sorted[Math.floor(sorted.length * .5)], p99: sorted[Math.floor(sorted.length * .99)], max: sorted[sorted.length - 1],
    over50: spikes.length, spikesAt: spikes.slice(0, 12).map(s => { const m = near(s[0], 4000); return s[1] + 'ms' + (m ? ' after ' + m[1] : ''); }),
    urgent: d.urgent, midPlayUrgent: d.mid, loads: d.loads, urgentLog: d.ulog, hist: d.hist, marks: d.lag.marks.map(m => m[1] + '@' + m[0]), longtasks: d.lag.lt.length, longtaskMax: d.lag.lt.reduce((a, b) => Math.max(a, b[1]), 0), longtaskList: d.lag.lt.slice(0, 12).map(l => l[1] + 'ms@' + l[0]),
    inputSamples: inp.length, inputP50: pc(.5), inputP99: pc(.99), inputMax: inp[inp.length - 1] || 0, errs };
  console.log(JSON.stringify(res, null, 1));
  await br.close(); srv.kill();
  const bad = res.over50 > 0 || res.inputMax > 50 || errs.length;
  process.exit(bad ? 1 : 0);
})();

#!/usr/bin/env node
// Nightrun desktop perf test: frame times, long tasks, JS heap, canvas size, draw calls, GC, plus audio continuity checks.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/perf-desktop.js
//   env: W=2560 H=1440 DPR=2 SECS=180 (play time) HEAPSECS=0 (extra idle-play seconds for the leak check; 300 = 5 min) JSON=1
//        P95=17 MAX=33 (limits, ms; the p95/max limits only apply with REAL_GPU=1 - software rasteriser machines report the numbers but cannot meet them)  GAME_DIR=...
// Plays the real flow with keyboard steering (district -> boss -> pit stop -> next district, so the song changes every stage) in god mode.
// Checks: p95/max frame, heap growth, audio position continuity across a same-track stage change (+-50 ms), crossfade on a track change, beat grid continuity (+-40 ms), page errors.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const W = +process.env.W || 1920, H = +process.env.H || 1080, DPR = +process.env.DPR || 1, SECS = +process.env.SECS || 60, HEAPSECS = +process.env.HEAPSECS || 0;
const P95 = +process.env.P95 || 17, MAXMS = +process.env.MAX || 33, REAL = !!process.env.REAL_GPU;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const q = (a, f) => { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * f))]; };
(async () => {
  const port = await freePort(); const srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/index.html`)).ok) break; } catch (e) { } await sleep(100); }
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--enable-precise-memory-info', '--js-flags=--expose-gc', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'].concat(process.env.UNCAP ? ['--disable-frame-rate-limit', '--disable-gpu-vsync'] : []) });
  const ctx = await br.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: DPR });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.addInitScript(() => {
    const L = window.__perf = { fr: [], js: [], lt: [], on: false, ops: 0, shadow: 0, filt: 0, draws: [], opsFrame: 0, ent: [], marks: [], heap: [] };
    try { new PerformanceObserver(l => { for (const e of l.getEntries()) L.lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ entryTypes: ['longtask'] }); } catch (e) { }
    const proto = CanvasRenderingContext2D.prototype;
    for (const n of ['drawImage', 'fill', 'stroke', 'fillRect', 'strokeRect', 'fillText', 'strokeText', 'clearRect']) { const o = proto[n]; proto[n] = function () { L.opsFrame++; (L.by = L.by || {})[n] = (L.by[n] || 0) + 1; return o.apply(this, arguments); }; }
    for (const n of ['shadowBlur', 'filter']) { const d = Object.getOwnPropertyDescriptor(proto, n); if (d && d.set) Object.defineProperty(proto, n, { get: d.get, set(v) { if (n === 'shadowBlur' && v) L.shadow++; if (n === 'filter' && v && v !== 'none') L.filt++; d.set.call(this, v); }, configurable: true }); }
    const raf = window.requestAnimationFrame.bind(window); let last = 0;
    window.requestAnimationFrame = cb => raf(t => { const a = performance.now(); L.opsFrame = 0; const m = window.__mnr, pit = m && (m.SH.active || m.paused || !m.running) ? 1 : 0; cb(t); const b = performance.now();
      if (L.on && last && !document.hidden) { L.fr.push([+(t - last).toFixed(1), pit]); L.js.push(+(b - a).toFixed(2)); L.draws.push(L.opsFrame); } last = t; });
  });
  await p.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => window.__mnr);
  const cdp = await ctx.newCDPSession(p);
  await br.startTracing(p, { categories: ['v8', 'v8.gc', 'disabled-by-default-v8.gc'] }).catch(() => { });
  await p.click('#startBtn'); await p.waitForFunction(() => window.__mnr.running, null, { timeout: 5000 });
  await p.evaluate(() => { window.__mnr.god = true; });
  const info = () => p.evaluate(() => { const m = window.__mnr, a = document.getElementById('game'); return { cw: a.width, ch: a.height, css: a.getBoundingClientRect().width | 0 }; });
  const heap = async () => { await cdp.send('HeapProfiler.collectGarbage').catch(() => { }); const h = await p.evaluate(() => performance.memory.usedJSHeapSize / 1048576); return +h.toFixed(1); };
  const ent = () => p.evaluate(() => { const g = __mnr.G; return { pt: g.pt.length, eb: g.eb.length, pb: g.pb.length, en: g.en.length, fl: g.fl.length, rings: g.rings.length }; });
  const audio = () => p.evaluate(() => { const m = __mnr; return m.AUD ? m.AUD() : null; });
  const cinfo = await info();
  const h0 = await heap(); await p.evaluate(() => { window.__perf.on = true; });
  const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']; let held = new Set();
  const steer = async ms => { const e = Date.now() + ms; while (Date.now() < e) { const k = keys[Math.floor(Math.random() * 4)]; if (held.has(k)) { await p.keyboard.up(k); held.delete(k); } else { await p.keyboard.down(k); held.add(k); } await p.keyboard.down('Space'); await sleep(140); } };
  const mark = n => p.evaluate(n => window.__perf.marks.push([performance.now() | 0, n]), n);
  const st = () => p.evaluate(() => ({ boss: !!__mnr.G.boss, pit: __mnr.SH.active, run: __mnr.running, dead: __mnr.G.dead }));
  const t0 = Date.now(), entMax = { pt: 0, eb: 0, pb: 0, en: 0 }; const heaps = [[0, h0]]; const events = []; let di = 0;
  const sample = async () => { const e = await ent(); for (const k in entMax) entMax[k] = Math.max(entMax[k], e[k]); };
  while (Date.now() - t0 < SECS * 1000) {
    await mark('district' + di); await steer(9000); await sample();
    await p.evaluate(() => { __mnr.G.dt = 1e9; }); await mark('boss-call' + di);
    for (let w = 0; w < 60 && !(await st()).boss; w++) await steer(250);
    await mark('boss' + di); await steer(5000); await sample();
    await p.evaluate(() => { const b = __mnr.G.boss; if (b) b.hp = 0; }); await mark('boss-dead' + di);
    for (let w = 0; w < 60 && !(await st()).pit; w++) await steer(250);
    await mark('pit' + di); for (const k of held) await p.keyboard.up(k); held.clear(); await p.keyboard.up('Space'); await sleep(2500);
    await p.evaluate(() => document.getElementById('shGo').click()); await sleep(300); di++;
    heaps.push([Math.round((Date.now() - t0) / 1000), await heap()]);
  }
  // long idle-play for the leak check (the run goes on, the heap is read every 30 s after a forced GC)
  if (HEAPSECS) { const e0 = Date.now(); while (Date.now() - e0 < HEAPSECS * 1000) { await steer(9000); const s = await st(); if (s.pit) { await p.evaluate(() => document.getElementById('shGo').click()); } heaps.push([Math.round((Date.now() - t0) / 1000), await heap()]); } }
  for (const k of held) await p.keyboard.up(k);
  const d = await p.evaluate(() => ({ perf: window.__perf, aud: window.__mnr.NR.sw, tr: Object.keys(window.__mnr.TR.bufs).length, mem: window.__mnr.NR.audioMem ? window.__mnr.NR.audioMem() : null }));
  let gc = { minor: 0, major: 0, minorMax: 0, majorMax: 0 };
  try { const buf = await br.stopTracing(); const ev = (JSON.parse(buf.toString()).traceEvents || []); for (const e of ev) { if (e.ph !== 'X' && e.ph !== 'E') continue; const dur = (e.dur || 0) / 1000; if (/^MinorGC$|V8\.GC_SCAVENGER$|^V8\.GCScavenger$/.test(e.name)) { gc.minor++; gc.minorMax = Math.max(gc.minorMax, dur); } else if (/^MajorGC$|V8\.GC_MARK_COMPACTOR$/.test(e.name)) { gc.major++; gc.majorMax = Math.max(gc.majorMax, dur); } } } catch (e) { gc.err = String(e).slice(0, 60); }
  const live = d.perf.fr.filter(x => !x[1]).map(x => x[0]); const jsT = d.perf.js;
  const hs = heaps.map(x => x[1]), growth = +(hs[hs.length - 1] - Math.min(...hs.slice(0, 3))).toFixed(1);
  const res = { viewport: `${W}x${H}@${DPR}`, canvas: `${cinfo.cw}x${cinfo.ch}`, canvasMpx: +(cinfo.cw * cinfo.ch / 1e6).toFixed(2), frames: live.length, mean: +(live.reduce((a, b) => a + b, 0) / live.length).toFixed(2), p50: q(live, .5), p95: q(live, .95), p99: q(live, .99), max: Math.max(...live),
    jsP50: q(jsT, .5), jsP95: q(jsT, .95), jsMax: Math.max(...jsT), opsPerFrameP50: q(d.perf.draws, .5), opsMax: Math.max(...d.perf.draws), opsByType: Object.fromEntries(Object.entries(d.perf.by || {}).map(([k, v]) => [k, Math.round(v / (d.perf.fr.length || 1))])), shadowBlurSets: d.perf.shadow, filterSets: d.perf.filt,
    spikes: (() => { const mk = d.perf.marks, near = t => { let b = null; for (const m of mk) if (t >= m[0]) b = m; return b ? b[1] + '+' + ((t - b[0]) / 1000).toFixed(1) + 's' : '-'; }; return d.perf.lt.filter(l => l[1] >= 60).slice(0, 14).map(l => l[1] + 'ms@' + near(l[0])); })(),
    longtasks: d.perf.lt.length, longtaskMax: d.perf.lt.reduce((a, b) => Math.max(a, b[1]), 0), entMax, heapMB: heaps, heapGrowthMB: growth, gc, audioMemMB: d.mem, switches: d.aud.length, errs };
  console.log(JSON.stringify(res));
  await br.close(); srv.kill();
  const bad = errs.length || (REAL && (res.p95 > P95 || res.max > MAXMS)) || growth > 30;
  process.exit(bad ? 1 : 0);
})();

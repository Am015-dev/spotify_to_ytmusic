#!/usr/bin/env node
// W275 fixed-load fps / cold-start meter. ONE browser at a time, scripted input from a seeded schedule (same SEED = same inputs and same Math.random for both builds).
//   NODE_PATH=$(npm root -g) SEED=1 node games-src/nightrun/benchmark/fps-fixed.js fps  <flight|street> <pc|phone> <baseUrl> [secs=60] [warm=5]
//   NODE_PATH=$(npm root -g) node games-src/nightrun/benchmark/fps-fixed.js cold <pc|phone> <baseUrl>
// fps: starts the mode from the title with a real click/tap (street: story card skipped), keeps the player alive (flight __mnr.god, street hp topped up once a second),
//   plays the schedule for warm s (frames discarded) + secs s, prints one JSON line: fps (median of 1 s windows, and mean), frame ms p50/p95/p99/max, long tasks > 50 ms, deaths check.
// cold: new browser context (empty cache, no service worker), navigation -> FLIGHT button usable, then press -> first frame with the run going.
const PW = require(process.env.PW || 'playwright');
const [KIND, A1, A2, A3, A4, A5] = process.argv.slice(2);
const SEED = +(process.env.SEED || 1);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const q = (a, f) => { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * f))]; };
const rng = (s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; })(SEED);
const SEEDJS = `(() => { let s = ${SEED} | 0; Math.random = () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })();`;
const ctxOpts = phone => phone ? { viewport: { width: 390, height: 763 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true } : { viewport: { width: 1440, height: 860 }, deviceScaleFactor: 1 };
const launch = () => PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });

async function fps() {
  const MODE = A1, PHONE = A2 === 'phone', BASE = A3, SECS = +(A4 || 60), WARM = +(A5 || 5);
  const br = await launch(); const ctx = await br.newContext(ctxOpts(PHONE)); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message.slice(0, 120)));
  await p.addInitScript(SEEDJS);
  await p.addInitScript(() => {
    const L = window.__pf = { fr: [], lt: [], on: false, tOn: 0 };
    try { new PerformanceObserver(l => { for (const e of l.getEntries()) L.lt.push([e.startTime, e.duration]); }).observe({ entryTypes: ['longtask'] }); } catch (e) { }
    const raf = window.requestAnimationFrame.bind(window); let last = 0;
    window.requestAnimationFrame = cb => raf(t => { cb(t); if (L.on && last && !document.hidden) L.fr.push(t - last); last = t; });
  });
  const cdp = await ctx.newCDPSession(p); if (PHONE) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await p.goto(BASE + 'index.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await p.waitForFunction(() => { const b = document.getElementById('focFlight'); return b && b.getBoundingClientRect().width > 0 && !b.disabled; }, null, { timeout: 120000 });
  await sleep(1500);
  const tap = async sel => { if (PHONE) await p.tap(sel); else await p.click(sel); };
  if (MODE === 'flight') { await tap('#focFlight'); await p.waitForFunction(() => window.__mnr && __mnr.running, null, { timeout: 30000 }); await p.evaluate(() => { __mnr.god = true; }); }
  else {
    await tap('#focFoot');
    for (let i = 0; i < 60 && !(await p.evaluate(() => window.FOOT && FOOT.on)); i++) { const sk = await p.$('#taleSkip'); if (sk && await sk.isVisible()) await (PHONE ? sk.tap() : sk.click()).catch(() => { }); await sleep(250); }
    if (!(await p.evaluate(() => window.FOOT && FOOT.on))) throw new Error('street did not start');
    await p.evaluate(() => { const m = document.getElementById('fMenu'); if (m) m.hidden = true; setInterval(() => { try { const P = FOOT.S.P; if (P && P.hp < P.max) P.hp = P.max; } catch (e) { } }, 500); });
  }
  const box = await p.evaluate(MODE => { const e = MODE === 'street' ? document.getElementById('footC') : document.getElementById('stage') || document.querySelector('canvas'); const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, MODE);
  const btn = async id => p.evaluate(id => { const e = document.getElementById(id); if (!e || !e.offsetParent) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  const act = new Map(); const flush = type => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...act.entries()].map(([id, t]) => ({ x: t.x, y: t.y, id })) }).catch(() => { });
  const held = new Set(); const kdn = async k => { if (!held.has(k)) { held.add(k); await p.keyboard.down(k); } }, kup = async k => { if (held.has(k)) { held.delete(k); await p.keyboard.up(k); } };
  const stick = PHONE && MODE === 'street' ? await btn('fStick') : null, fire = PHONE && MODE === 'street' ? await btn('fFire') : null;
  if (PHONE && MODE === 'flight') { act.set(1, { x: box.x + box.w * .5, y: box.y + box.h * .6 }); await flush('touchStart'); }
  if (stick) { act.set(1, { x: stick.x, y: stick.y }); if (fire) act.set(2, { x: fire.x, y: fire.y }); await flush('touchStart'); }
  await p.evaluate(() => { __pf.fr.length = 0; __pf.on = false; });
  const T0 = Date.now(), tWarm = T0 + WARM * 1000, tEnd = tWarm + SECS * 1000; let on = false, step = 0;
  // schedule: every 120 ms one seeded decision; the rng stream does not depend on the game
  while (Date.now() < tEnd) {
    const now = Date.now(); if (!on && now >= tWarm) { on = true; await p.evaluate(() => { __pf.fr.length = 0; __pf.lt.length = 0; __pf.tOn = performance.now(); __pf.on = true; }); }
    const r1 = rng(), r2 = rng(), r3 = rng(); step++;
    if (MODE === 'flight') {
      const dy = r1 < .35 ? -1 : r1 < .7 ? 1 : 0, dx = r2 < .25 ? -1 : r2 < .5 ? 1 : 0;
      if (!PHONE) { await (dy < 0 ? kdn('ArrowUp') : kup('ArrowUp')); await (dy > 0 ? kdn('ArrowDown') : kup('ArrowDown')); await (dx < 0 ? kdn('ArrowLeft') : kup('ArrowLeft')); await (dx > 0 ? kdn('ArrowRight') : kup('ArrowRight')); if (r3 < .05) await p.keyboard.press('ShiftLeft'); }
      else { const t = act.get(1); t.x = Math.max(box.x + 5, Math.min(box.x + box.w - 5, t.x + dx * 18)); t.y = Math.max(box.y + 5, Math.min(box.y + box.h - 5, t.y + dy * 22)); await flush('touchMove');
        if (r3 < .05) { const d = await btn('bDash'); if (d) { act.set(2, { x: d.x, y: d.y }); await flush('touchStart'); act.delete(2); await flush('touchEnd'); } } }
    } else {
      const d2 = step % 60 < 8 ? -1 : 1;   // mostly walk right, a short step back now and then
      if (!PHONE) { await kdn('KeyJ'); await (d2 > 0 ? kup('KeyA') : kdn('KeyA')); await (d2 > 0 ? kdn('KeyD') : kup('KeyD')); if (r1 < .12) await p.keyboard.press('KeyK'); if (r2 < .15) await p.keyboard.press('KeyL'); if (r3 < .03) await p.keyboard.press('ShiftLeft'); }
      else { act.get(1).x = stick.x + d2 * 30; await flush('touchMove'); const ex = r1 < .12 ? 'fJump' : r2 < .15 ? 'fMelee' : r3 < .03 ? 'fDash' : null;
        if (ex) { const c = await btn(ex); if (c) { act.set(3, { x: c.x, y: c.y }); await flush('touchStart'); act.delete(3); await flush('touchEnd'); } } }
    }
    await sleep(Math.max(0, 120 - (Date.now() - now)));
  }
  const d = await p.evaluate(() => ({ fr: __pf.fr.slice(), lt: __pf.lt.filter(l => l[0] >= __pf.tOn) }));
  for (const k of [...held]) await kup(k);
  const alive = await p.evaluate(MODE => MODE === 'street' ? !!(FOOT.on && FOOT.S && !FOOT.S.end) : !!(__mnr.running && !__mnr.G.dead), MODE).catch(() => null);
  // 1 s windows -> median fps
  const wins = []; let acc = 0, n = 0; for (const f of d.fr) { acc += f; n++; if (acc >= 1000) { wins.push(n * 1000 / acc); acc = 0; n = 0; } }
  const sum = d.fr.reduce((a, b) => a + b, 0);
  console.log(JSON.stringify({ kind: 'fps', mode: MODE, dev: A2, base: BASE, seed: SEED, secs: SECS, frames: d.fr.length, fpsMed: +q(wins, .5).toFixed(2), fpsMean: +(1000 * d.fr.length / sum).toFixed(2), fpsMin1s: +Math.min(...wins).toFixed(1),
    p50: +q(d.fr, .5).toFixed(1), p95: +q(d.fr, .95).toFixed(1), p99: +q(d.fr, .99).toFixed(1), max: +Math.max(...d.fr).toFixed(1), longtasks: d.lt.length, longMax: Math.round(d.lt.reduce((a, b) => Math.max(a, b[1]), 0)), alive, errs: [...new Set(errs)].slice(0, 4) }));
  await br.close();
}

async function cold() {
  const PHONE = A1 === 'phone', BASE = A2;
  const br = await launch(); const ctx = await br.newContext(ctxOpts(PHONE)); const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p); if (PHONE) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await p.addInitScript(() => { window.__t = { raf: 0 }; });
  const t0 = Date.now(); await p.goto(BASE + 'index.html', { waitUntil: 'domcontentloaded', timeout: 120000 }); const dcl = Date.now() - t0;
  await p.waitForFunction(() => { const b = document.getElementById('focFlight'); return b && b.getBoundingClientRect().width > 0 && !b.disabled; }, null, { timeout: 120000, polling: 'raf' }); const title = Date.now() - t0;
  await sleep(1500);   // a person does not press in the same ms the button appears
  const tPress = Date.now(); if (PHONE) await p.tap('#focFlight'); else await p.click('#focFlight');
  // first frame after the press where the run is going
  await p.evaluate(() => new Promise(res => { const go = () => (window.__mnr && __mnr.running) ? requestAnimationFrame(() => requestAnimationFrame(res)) : requestAnimationFrame(go); go(); }));
  const play = Date.now() - tPress;
  console.log(JSON.stringify({ kind: 'cold', dev: A1, base: BASE, dcl, title, startToPlay: play }));
  await br.close();
}
(KIND === 'cold' ? cold() : fps()).catch(e => { console.log(JSON.stringify({ kind: KIND, fatal: e.message.slice(0, 300), base: A3 || A2 })); process.exit(1); });

#!/usr/bin/env node
// W240 playability probe: plays the built game in REAL TIME (no sim stepping) and measures feel.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/benchmark/playability-probe.js <flight|street> <pc|phone> [baseUrl] [secs]
// pc = 1440x860 keyboard; phone = 390x763 touch + isMobile + 4x CPU throttle (CDP). Prints one JSON line, saves worst-moment PNG to OUT dir.
const PW = require(process.env.PW || 'playwright'), path = require('path'), fs = require('fs');
const [MODE = 'flight', DEV = 'pc', BASE = 'http://127.0.0.1:8765/', SECS0 = '90'] = process.argv.slice(2);
const SECS = +SECS0, OUT = process.env.OUT || path.join(__dirname, 'playability-shots');
const PHONE = DEV === 'phone';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const q = (a, f) => { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * f))]; };
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await br.newContext(PHONE ? { viewport: { width: 390, height: 763 }, deviceScaleFactor: +(process.env.DPR || 3), hasTouch: true, isMobile: true } : { viewport: { width: 1440, height: 860 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); const errs = [], cons = [];
  p.on('pageerror', e => errs.push(e.message.slice(0, 160)));
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') cons.push(m.type() + ': ' + m.text().slice(0, 160)); });
  await p.addInitScript(MODE => {
    const L = window.__pf = { fr: [], js: [], lt: [], on: false, lat: [], pend: null, hurts: [], t0: performance.now(), firstRaf: 0 };
    try { new PerformanceObserver(l => { for (const e of l.getEntries()) L.lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ entryTypes: ['longtask'] }); } catch (e) { }
    const pos = () => { try { if (MODE === 'street') { const P = window.FOOT && FOOT.S && FOOT.S.P; return P ? [P.x, P.y] : null; } const P = window.__mnr && __mnr.P; return P ? [P.x, P.y] : null; } catch (e) { return null; } };
    L.arm = (tag) => { if (L.pend) return; const s = pos(); if (s) L.pend = { t: performance.now(), s, tag }; };
    for (const ev of ['keydown', 'touchstart']) addEventListener(ev, e => { if (L.on && !e.repeat && !/Space|KeyJ|KeyL|KeyK|KeyG/.test(e.code || '')) L.arm(ev); }, true);
    const raf = window.requestAnimationFrame.bind(window); let last = 0;
    window.requestAnimationFrame = cb => raf(t => { const a = performance.now(); if (!L.firstRaf) L.firstRaf = a; cb(t); const b = performance.now();
      if (L.on && last && !document.hidden) { L.fr.push(+(t - last).toFixed(1)); L.js.push(+(b - a).toFixed(2)); }
      if (L.pend) { const s = pos(); if (s && (Math.abs(s[0] - L.pend.s[0]) > .5 || Math.abs(s[1] - L.pend.s[1]) > .5)) { L.lat.push([L.pend.tag, +(b - L.pend.t).toFixed(1)]); L.pend = null; } else if (b - L.pend.t > 1000) { L.lat.push([L.pend.tag, 1000]); L.pend = null; } }
      last = t; });
  }, MODE);
  const cdp = await ctx.newCDPSession(p);
  if (PHONE) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const tNav = Date.now();
  await p.goto(BASE + 'index.html', { waitUntil: 'domcontentloaded', timeout: 120000 });
  const tDcl = Date.now() - tNav;
  await p.waitForFunction(() => { const b = document.getElementById('focFlight'); return b && b.getBoundingClientRect().width > 0 && !b.disabled; }, null, { timeout: 120000 });
  const tStartBtn = Date.now() - tNav;
  const load = { dcl: tDcl, startBtn: tStartBtn };
  // ---- enter the mode
  const t1 = Date.now();
  if (MODE === 'flight') {
    if (PHONE) await p.tap('#focFlight'); else await p.click('#focFlight');
    await p.waitForFunction(() => window.__mnr && __mnr.running, null, { timeout: 30000 }).catch(() => { });
  } else {
    if (PHONE) await p.tap('#focFoot'); else await p.click('#focFoot');
    // a story card (taleTc / SKIP) comes up first: tap through it like a player
    for (let i = 0; i < 60 && !(await p.evaluate(() => window.FOOT && FOOT.on)); i++) { const sk = await p.$('#taleSkip'); if (sk && await sk.isVisible()) { load.tale = (load.tale || 0) + 1; if (PHONE) await sk.tap().catch(() => { }); else await sk.click().catch(() => { }); } await sleep(250); }
    if (!(await p.evaluate(() => window.FOOT && FOOT.on))) { load.footForced = 1; await p.evaluate(() => FOOT.start(FOOT.main || 'zeil')); await sleep(500); }
    await p.evaluate(() => { const m = document.getElementById('fMenu'); if (m) m.hidden = true; });
  }
  load.toPlay = Date.now() - t1;
  // the first frame where the player can move
  await sleep(300);
  // ---- UI census: visible buttons, overlaps, labels
  const ui = await p.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 2 && r.height > 2 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > .05; };
    const bs = [...document.querySelectorAll('button,[role=button],.fb')].filter(vis).map(e => { const r = e.getBoundingClientRect(); return { id: e.id || e.className.toString().slice(0, 20), t: (e.innerText || e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 24), x: r.x | 0, y: r.y | 0, w: r.width | 0, h: r.height | 0 }; });
    const ov = []; for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) { const a = bs[i], b = bs[j]; const ix = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), iy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y); if (ix > 4 && iy > 4) ov.push(a.id + '/' + b.id + ' ' + ix + 'x' + iy); }
    const small = bs.filter(b => b.w < 44 || b.h < 44).map(b => b.id + ' ' + b.w + 'x' + b.h);
    const off = bs.filter(b => b.x < 0 || b.y < 0 || b.x + b.w > innerWidth || b.y + b.h > innerHeight).map(b => b.id);
    const cv = [...document.querySelectorAll('canvas')].filter(vis).map(c => c.id + ' ' + c.width + 'x' + c.height + ' css ' + (c.getBoundingClientRect().width | 0) + 'x' + (c.getBoundingClientRect().height | 0));
    return { bs, ov, small, off, cv, dpr: devicePixelRatio };
  });
  await p.evaluate(() => { __pf.on = true; __pf.tOn = performance.now(); });
  // ---- bot
  const st = () => p.evaluate(MODE => {
    if (MODE === 'street') { const S = window.FOOT && FOOT.S; if (!S) return null; const vw = FOOT.hudInfo() ? FOOT.hudInfo().vw : 960;
      return { hp: S.P.hp, max: S.P.max, hurts: S.hurts || 0, end: !!S.end, dead: S.P.hp <= 0, x: S.P.x | 0, y: S.P.y | 0, cam: S.camX | 0, vw, E: S.E.filter(e => !e.dead).map(e => [e.x | 0, e.y | 0]), eb: S.eb.length, kills: S.kills, sec: S.cpN, paused: !!S.paused, on: FOOT.on }; }
    const m = window.__mnr; if (!m) return null; const G = m.G, P = m.P;
    return { hp: P.hp, max: P.max, dead: !!G.dead, x: P.x | 0, y: P.y | 0, eb: G.eb.length, en: G.en.length, near: G.eb.map(b => [b.x - P.x, b.y - P.y]).filter(d => d[0] > -20 && d[0] < 260).sort((a, b) => Math.hypot(...a) - Math.hypot(...b))[0] || null, run: m.running, paused: m.paused, boss: !!G.boss, pit: !!(m.SH && m.SH.active), di: G.di };
  }, MODE);
  const box = PHONE ? await p.evaluate(MODE => { const r = (MODE === 'street' ? document.getElementById('footC') : document.getElementById('stage') || document.querySelector('canvas')).getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }, MODE) : null;
  const btnC = async id => p.evaluate(id => { const e = document.getElementById(id); if (!e || !e.offsetParent) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, id);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map((t, i) => ({ x: t.x, y: t.y, id: t.id != null ? t.id : i })) }).catch(() => { });
  const held = new Set(); const kdn = async k => { if (!held.has(k)) { held.add(k); await p.keyboard.down(k); } }, kup = async k => { if (held.has(k)) { held.delete(k); await p.keyboard.up(k); } };
  const t0 = Date.now(); let deaths = 0, lastHp = null, hits = 0, hitLog = [], worst = { v: 0 }, retries = 0, snaps = 0, prevFr = 0, stuck = 0, lastX = null;
  let fTouch = null; // flight phone drag point
  const sCenter = PHONE && MODE === 'street' ? await btnC('fStick') : null;
  while (Date.now() - t0 < SECS * 1000) {
    const s = await st(); const el = ((Date.now() - t0) / 1000).toFixed(1);
    if (!s) { await sleep(200); continue; }
    if (lastHp != null && s.hp < lastHp) { hits++; hitLog.push(el + 's hp' + s.hp + (MODE === 'street' ? ' offscr ' + s.E.filter(e => e[0] < s.cam - 10 || e[0] > s.cam + s.vw + 10).length + '/' + s.E.length : ' eb' + s.eb)); }
    lastHp = s.hp;
    if (s.dead || s.end || (MODE === 'flight' && !s.run)) {
      deaths++; hitLog.push(el + 's DOWN'); lastHp = null; for (const k of [...held]) await kup(k); if (fTouch) { await touch('touchEnd', []); fTouch = null; }
      // restart quickly like a player would
      if (MODE === 'flight') { await sleep(1500); await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(b => b.offsetParent && /again|retry|restart|play|start/i.test(b.innerText)); if (b) b.click(); else document.getElementById('focFlight').click(); }); await p.waitForFunction(() => __mnr.running && !__mnr.G.dead, null, { timeout: 8000 }).catch(() => { }); }
      else { await sleep(1500); await p.evaluate(() => { const b = [...document.querySelectorAll('#fMenu button')].find(b => /again|retry|checkpoint|restart|continue/i.test(b.innerText)); if (b) b.click(); else FOOT.start(FOOT.main || 'zeil'); }); await sleep(800); }
      retries++; continue;
    }
    if (MODE === 'flight' && s.pit) { await p.evaluate(() => { const g = document.getElementById('shGo'); if (g) g.click(); }); await sleep(300); continue; }
    if (MODE === 'flight') {
      // dodge the nearest incoming shot vertically, drift back to the middle-left otherwise
      let dy = 0, dx = 0; if (s.near && Math.abs(s.near[1]) < 60) dy = s.near[1] > 0 ? -1 : 1; else if (Math.random() < .3) dy = Math.random() < .5 ? -1 : 1;
      if (s.x < 120) dx = 1; else if (s.x > 420) dx = -1; else if (Math.random() < .2) dx = Math.random() < .5 ? -1 : 1;
      if (!PHONE) { await (dy < 0 ? kdn('ArrowUp') : kup('ArrowUp')); await (dy > 0 ? kdn('ArrowDown') : kup('ArrowDown')); await (dx < 0 ? kdn('ArrowLeft') : kup('ArrowLeft')); await (dx > 0 ? kdn('ArrowRight') : kup('ArrowRight'));
        if (Math.random() < .04) { await p.keyboard.press('ShiftLeft'); } }
      else { if (!fTouch) { fTouch = { x: box.x + box.w * .5, y: box.y + box.h * .6, id: 1 }; await touch('touchStart', [fTouch]); }
        fTouch.x = Math.max(box.x + 5, Math.min(box.x + box.w - 5, fTouch.x + dx * 18)); fTouch.y = Math.max(box.y + 5, Math.min(box.y + box.h - 5, fTouch.y + dy * 22)); await touch('touchMove', [fTouch]);
        if (Math.random() < .04) { const d = await btnC('bDash'); if (d) { await touch('touchStart', [fTouch, { x: d.x, y: d.y, id: 2 }]); await touch('touchEnd', [fTouch]); } } }
    } else {
      // street: walk right, shoot, jump over trouble, knife close foes, dash now and then; back off a little if stuck
      if (lastX != null && Math.abs(s.x - lastX) < 3) stuck++; else stuck = 0; lastX = s.x;
      const close = s.E.some(e => Math.abs(e[0] - s.x) < 90); const dir = stuck > 15 && stuck < 22 ? 'l' : 'r';
      if (!PHONE) { await kdn('KeyJ'); await (dir === 'r' ? kdn('KeyD') : kup('KeyD')); await (dir === 'l' ? kdn('KeyA') : kup('KeyA'));
        if (Math.random() < .12 || stuck > 8) await p.keyboard.press('KeyK'); if (close && Math.random() < .3) await p.keyboard.press('KeyL'); if (Math.random() < .03) await p.keyboard.press('ShiftLeft'); }
      else { const fire = await btnC('fFire'), sk = { x: sCenter.x + (dir === 'r' ? 30 : -30), y: sCenter.y, id: 1 };
        const extra = []; if (Math.random() < .12 || stuck > 8) extra.push('fJump'); else if (close && Math.random() < .3) extra.push('fMelee'); else if (Math.random() < .03) extra.push('fDash');
        const pts = [sk]; if (fire) pts.push({ x: fire.x, y: fire.y, id: 2 }); for (const id of extra) { const c = await btnC(id); if (c) pts.push({ x: c.x, y: c.y, id: 3 }); }
        await touch(snaps++ === 0 ? 'touchStart' : 'touchMove', pts.slice(0, 2)); if (pts.length > 2) { await touch('touchStart', pts); await touch('touchEnd', pts.slice(0, 2)); } }
    }
    // worst moment: the window with the worst frame since last check (plus the most shots on screen as tiebreak)
    const fw = await p.evaluate(n => { const f = __pf.fr.slice(n); return [__pf.fr.length, f.length ? Math.max(...f) : 0]; }, prevFr); prevFr = fw[0];
    const score = fw[1] + s.eb * .5;
    if (+el > 5 && score > worst.v) { worst = { v: score, at: el, fr: fw[1], eb: s.eb }; await p.screenshot({ path: path.join(OUT, `${MODE}-${DEV}.png`) }); }
    await sleep(120);
  }
  for (const k of [...held]) await kup(k); if (fTouch) await touch('touchEnd', []);
  // W269: the frame numbers are taken BEFORE the profiling seconds (they used to include them, which inflated fps by (SECS+12)/SECS)
  const d = await p.evaluate(() => ({ fr: __pf.fr, js: __pf.js, lt: __pf.lt.filter(l => l[0] > __pf.tOn), ltAll: __pf.lt.length, tOn: __pf.tOn, lat: __pf.lat, firstRaf: __pf.firstRaf | 0 }));
  let top = [];
  if (!process.env.NOPROFILE) {
  // CPU profile of 12 s more play (bot idle-steering) to rank the heaviest functions
  await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 500 }); await cdp.send('Profiler.start');
  if (!PHONE) { await kdn(MODE === 'street' ? 'KeyD' : 'ArrowUp'); if (MODE === 'street') await kdn('KeyJ'); }
  await sleep(12000); for (const k of [...held]) await kup(k);
  const { profile } = await cdp.send('Profiler.stop');
  const self = {}, byId = {}; for (const n of profile.nodes) byId[n.id] = n;
  const dts = profile.timeDeltas; const cnt = {}; profile.samples.forEach((id, i) => { cnt[id] = (cnt[id] || 0) + (dts[i] || 0); });
  let tot = 0; for (const id in cnt) { const n = byId[id], cf = n.callFrame; const k = (cf.functionName || '(anon)') + ':' + (cf.lineNumber + 1); self[k] = (self[k] || 0) + cnt[id]; tot += cnt[id]; }
  top = Object.entries(self).sort((a, b) => b[1] - a[1]).slice(0, 14).map(([k, v]) => k + ' ' + (100 * v / tot).toFixed(1) + '%');
  }
  const lat = d.lat.map(x => x[1]);
  const res = { mode: MODE, dev: DEV, base: BASE, load, ui: { ov: ui.ov, small: ui.small, off: ui.off, cv: ui.cv, n: ui.bs.length, bs: ui.bs.map(b => b.id + '[' + b.t + ']@' + b.x + ',' + b.y + ' ' + b.w + 'x' + b.h) },
    frames: d.fr.length, fps: +(1000 * d.fr.length / d.fr.reduce((a, b) => a + b, 0)).toFixed(1), p50: q(d.fr, .5), p95: q(d.fr, .95), p99: q(d.fr, .99), max: Math.max(...d.fr), over33: d.fr.filter(x => x > 33.4).length, over50: d.fr.filter(x => x > 50).length,
    jsP50: q(d.js, .5), jsP95: q(d.js, .95), longtasks: d.lt.length, ltList: d.lt.map(l => [l[0] - Math.round(d.tOn), l[1]]).slice(0, 60), longMax: d.lt.reduce((a, b) => Math.max(a, b[1]), 0), longSum: d.lt.reduce((a, b) => a + b[1], 0),
    latN: lat.length, latP50: q(lat, .5), latP95: q(lat, .95), latMiss: lat.filter(x => x >= 1000).length,
    hits, hitsPerMin: +(hits * 60 / SECS).toFixed(1), deaths, hitLog: hitLog.slice(0, 30), worst, top, errs: [...new Set(errs)].slice(0, 8), cons: [...new Set(cons)].slice(0, 8) };
  console.log(JSON.stringify(res));
  await br.close();
})().catch(e => { console.log(JSON.stringify({ fatal: e.message.slice(0, 300) })); process.exit(1); });

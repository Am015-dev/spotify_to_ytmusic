#!/usr/bin/env node
// Dash direction: along the current move direction (touch drag, keys), and with no input the safest of 8 ways (never a stale heading, never into a bullet lane).
//   NODE_PATH=$(npm root -g) node games-src/nightrun/dash-dir-test.js     env: GAME_DIR=...
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const ok = (n, p, i) => { if (!p) fails++; console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); };
const D8 = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];   // screen directions: up, up-right, right...
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(800);
  const br = await PW.chromium.launch();
  const open = async (w, h, touch) => {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch });
    const p = await ctx.newPage(); await p.addInitScript(() => { try { localStorage.setItem('mnr_tut', '1'); } catch (e) { } });
    await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1`); await p.waitForFunction(() => window.__mnr && __mnr.ART); await sleep(1000);
    await p.evaluate(() => { __mnr.SET.auto = true; __mnr.applySet(); }); await p.click('#startBtn'); await p.waitForFunction(() => __mnr.running);
    await p.evaluate(() => { const m = __mnr; m.god = true; setInterval(() => { m.G.eb.length = 0; m.G.en = m.G.en.filter(e => e.boss); }, 20); }); await sleep(300);
    return { p, ctx, cdp: await ctx.newCDPSession(p) };
  };
  const dashAndRead = async (p, moving) => {   // press the dash button, wait for the dash to start, read the heading
    await p.evaluate(() => { const g = __mnr; g.P.dashCd = 0; g.P.dashT = 0; g.P.dq = null; if (window.ABIL && ABIL.on) ABIL.st().n = ABIL.max(); if (g.G.tm) g.G.tm.pen = 0;   /* W39: refill is slower now; this test checks direction, not charges */ document.getElementById('bDash').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); });
    for (let i = 0; i < 40; i++) { if (moving) await moving(); await sleep(16); if (await p.evaluate(() => __mnr.P.dashT > 0)) break; }
    return p.evaluate(() => ({ dx: __mnr.P.dx, dy: __mnr.P.dy }));
  };
  const near = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) < .2;
  for (const [w, h, name, rot] of [[390, 763, 'portrait 390x763', true], [844, 390, 'landscape 844x390', false]]) {
    const { p, cdp } = await open(w, h, true);
    const isRot = await p.evaluate(() => __mnr.rotMode); ok(`${name}: rotMode is ${rot}`, isRot === rot, isRot);
    const fr = await p.evaluate(() => { const r = document.getElementById('frame').getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; });
    const cx = fr[0] + fr[2] / 2, cy = fr[1] + fr[3] / 2;
    await p.evaluate(() => { __mnr.P.x = 300; __mnr.P.y = 270; });
    // 8 drag directions: finger keeps moving while the dash fires
    for (const [sx, sy] of D8) {
      const n = Math.hypot(sx, sy), ux = sx / n, uy = sy / n; let k = 0;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy, id: 1 }] });
      const mv = async () => { k++; const d = 4 + k * 3; await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx + ux * d, y: cy + uy * d, id: 1 }] }); };
      for (let i = 0; i < 6; i++) { await mv(); await sleep(16); }
      const r = await dashAndRead(p, mv);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      const want = rot ? [-sy / n, sx / n] : [sx / n, sy / n];   // portrait: the screen's up is the world's right
      ok(`${name}: drag (${sx},${sy}) dashes along the drag`, near([r.dx, r.dy], want), JSON.stringify([r.dx, r.dy, want]));
      await sleep(250); await p.evaluate(() => { __mnr.P.x = 300; __mnr.P.y = 270; __mnr.P.dashT = 0; });
    }
    // no input, stale heading to the world's left: must not follow it
    await p.evaluate(() => { const g = __mnr; g.P.dx = -1; g.P.dy = 0; g.P.mvT = g.G.t - 5; g.P.x = 300; g.P.y = 270; });
    let r = await dashAndRead(p); ok(`${name}: no input, empty screen -> forward (world right), not the stale heading`, near([r.dx, r.dy], [1, 0]), JSON.stringify(r));
    await sleep(300);
    // no input, bullets block every way but one: takes the free one
    for (const [fx, fy] of [[0, 1], [0, -1], [-1, 0]]) {
      const dd = await p.evaluate(([fx, fy]) => { const g = __mnr; g.P.dashT = 0; g.P.mvT = g.G.t - 5; g.P.x = 400; g.P.y = 270; g.G.eb.length = 0;
        for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, dx = Math.round(Math.cos(a)), dy = Math.round(Math.sin(a)); if (dx === fx && dy === fy) continue; const n = Math.hypot(dx, dy); g.G.eb.push({ x: 400 + dx / n * 210, y: 270 + dy / n * 210, vx: 0, vy: 0, r: 8, dmg: 1 }); }
        return g.dashSafeDir(); }, [fx, fy]);
      const n = Math.hypot(fx, fy); ok(`${name}: bullets everywhere but (${fx},${fy}) -> safe dir is the gap`, near(dd, [fx / n, fy / n]), JSON.stringify(dd));
    }
    await p.context().close();
  }
  // desktop keyboard: arrow heading is used, none = forward
  { const { p } = await open(1280, 720, false);
    await p.evaluate(() => { __mnr.P.x = 300; __mnr.P.y = 300; });
    await p.keyboard.down('ArrowUp'); await sleep(100); let r = await dashAndRead(p, async () => { }); await p.keyboard.up('ArrowUp');
    ok('desktop: ArrowUp dashes up', near([r.dx, r.dy], [0, -1]), JSON.stringify(r)); await sleep(300);
    await p.evaluate(() => { const g = __mnr; g.P.dx = 0; g.P.dy = 1; g.P.mvT = g.G.t - 5; g.P.x = 300; g.P.y = 300; });
    r = await dashAndRead(p); ok('desktop: no key -> forward, not the stale heading', near([r.dx, r.dy], [1, 0]), JSON.stringify(r));
    await p.context().close(); }
  await br.close(); srv.kill(); console.log(fails ? `${fails} FAILED` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch(e => { console.log('FAIL crash :: ' + e.message); process.exit(1); });

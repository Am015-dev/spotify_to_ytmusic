// W284 phone flight probe: what real touch does to the ship, measured (no opinions). One browser, prints one JSON line per part.
//   GAME_DIR=<built dir> NODE_PATH=$(npm root -g) node games-src/nightrun/qa/phone-flight-probe.js
// A: touch-to-ship latency and the speed reached with a finger drag (CDP touch, real time, no stepping) vs the keyboard on PC.
// B: layout: where the touch strip / buttons are, what a drag that starts there does, and the ship's travel box in screen px.
const L = require('./lib.js'), { PW, sleep } = L;
const DEV = { phone: { W: 390, H: 763, touch: true }, pc: { W: 1440, H: 860, touch: false } };
async function open(br, base, d) {
  const ctx = await br.newContext({ viewport: { width: d.W, height: d.H }, deviceScaleFactor: 1, hasTouch: d.touch, isMobile: d.touch, userAgent: d.touch ? L.UA : undefined });
  const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(String(e.message).slice(0, 160)));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.addInitScript(() => { try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); } catch (e) { } });
  await p.goto(base + '?nomusic=1', { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => window.__mnr, null, { timeout: 15000 }); await p.waitForFunction(() => document.documentElement.classList.contains('rdy'), null, { timeout: 15000 }).catch(() => { }); await sleep(400);
  const bb = await p.locator('#focFlight').boundingBox(); if (d.touch) { const c = await ctx.newCDPSession(p); const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2; await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] }); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); p.cdp = c; } else await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
  for (let i = 0; i < 40 && !(await p.evaluate(() => !!(window.__mnr.G && window.__mnr.G.live))); i++) await sleep(100);
  await sleep(1500); return p;
}
// in-page recorder: ship position every rAF with performance.now(), plus the time of the first touchmove / keydown the page saw
const REC = () => { window.__rec = { s: [], in: null }; const m = window.__mnr; addEventListener('touchmove', e => { if (!window.__rec.in) window.__rec.in = performance.now(); }, true); addEventListener('keydown', e => { if (!window.__rec.in) window.__rec.in = performance.now(); }, true);
  const f = t => { if (window.__rec.on) window.__rec.s.push([performance.now(), m.P.x, m.P.y]); requestAnimationFrame(f); }; requestAnimationFrame(f); };
async function partA(br, base, name) {
  const d = DEV[name], p = await open(br, base, d); await p.evaluate(REC);
  const st = await p.evaluate(() => { const m = window.__mnr; m.P.inv = 99; m.P.hp = Math.max(m.P.hp, 9); const f = document.getElementById('frame').getBoundingClientRect(); return { rot: m.rotMode, x: m.P.x, y: m.P.y, f: [f.left, f.top, f.width, f.height] }; });
  const sc = st.rot ? st.f[2] / 540 : st.f[2] / 960;   // screen px per world unit
  const out = { dev: name, rot: st.rot, screenPerWorld: +sc.toFixed(3) };
  for (const dir of ['across', 'along']) {   // across = world y (screen left/right in portrait), along = world x (screen up/down in portrait)
    await p.evaluate(() => { window.__rec.s = []; window.__rec.in = null; window.__rec.on = true; }); await sleep(120);
    const t0 = await p.evaluate(() => performance.now());
    if (d.touch) { const x0 = st.f[0] + st.f[2] / 2, y0 = st.f[1] + st.f[3] * .6; await p.cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0, id: 1 }] });
      const dx = dir === 'across' ? 150 : 0, dy = dir === 'along' ? -150 : 0; await p.cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + dx, y: y0 + dy, id: 1 }] }); }
    else await p.keyboard.down(dir === 'across' ? 'ArrowDown' : 'ArrowRight');
    await sleep(900);
    const r = await p.evaluate(() => { window.__rec.on = false; return { s: window.__rec.s, in: window.__rec.in }; });
    if (d.touch) await p.cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); else await p.keyboard.up(dir === 'across' ? 'ArrowDown' : 'ArrowRight');
    const s = r.s, p0 = s[0], ax = dir === 'across' ? 2 : 1;   // world y / world x
    let first = null, vmax = 0; for (let i = 1; i < s.length; i++) { if (first === null && Math.abs(s[i][ax] - p0[ax]) > .5) first = s[i][0]; for (let j = i + 1; j < s.length; j++) { const dt = s[j][0] - s[i][0]; if (dt >= 50) { vmax = Math.max(vmax, Math.abs(s[j][ax] - s[i][ax]) / dt * 1000); break; } } }
    out[dir] = { inputSeenMs: r.in ? +(r.in - t0).toFixed(0) : null, firstMoveMs: first ? +(first - t0).toFixed(0) : null, firstMoveAfterInputMs: first && r.in ? +(first - r.in).toFixed(0) : null, vmaxWorldPerS: +vmax.toFixed(0), vmaxScreenPerS: +(vmax * sc).toFixed(0), travelWorld: +Math.abs(s[s.length - 1][ax] - p0[ax]).toFixed(0), frames: s.length };
    await p.evaluate(st0 => { const m = window.__mnr; m.P.x = st0.x; m.P.y = st0.y; }, st); await sleep(200);
  }
  out.errs = p.errs; console.log('A ' + JSON.stringify(out)); await p.context().close();
}
async function partB(br, base) {
  const d = DEV.phone, p = await open(br, base, d);
  const o = await p.evaluate(() => { const m = window.__mnr, r = e => { const b = e.getBoundingClientRect(); return [b.left | 0, b.top | 0, b.width | 0, b.height | 0]; }; const f = document.getElementById('frame').getBoundingClientRect(); const R = {};
    R.frame = r(document.getElementById('frame')); R.touch = r(document.getElementById('touch')); for (const id of ['bDash', 'bEmp', 'bPause']) { const e = document.getElementById(id); R[id] = e ? r(e) : null; }
    const sc = f.width / 540; R.rot = m.rotMode; R.scale = +sc.toFixed(3);
    // ship's reachable box in screen px (portrait: world x -> screen y inverted, world y -> screen x). Same clamps as the game: x 64..W-60 (rot), y 36..H-54
    const W = 960, H = 540; R.shipBoxScreen = m.rotMode ? { x: [f.left + 36 * sc | 0, f.left + (H - 54) * sc | 0], y: [f.top + (W - (W - 60)) * f.height / W | 0, f.top + (W - 64) * f.height / W | 0] } : null;
    R.shipNow = [m.P.x, m.P.y]; R.W = innerWidth; R.H = innerHeight;
    const pts = []; for (let y = f.top + 5; y < f.top + f.height; y += f.height / 12) { const e = document.elementFromPoint(f.left + f.width / 2, y); pts.push([y | 0, e ? (e.id || e.className || e.tagName).toString().slice(0, 18) : null]); } R.centreColumnTopElement = pts; return R; });
  // does a drag that STARTS on the touch strip steer? (the stage touchstart handler ignores targets inside #touch)
  const strip = o.touch, c = await p.context().newCDPSession(p); const w0 = await p.evaluate(() => { const m = window.__mnr; m.P.inv = 99; return [m.P.x, m.P.y]; });
  const sx = o.frame[0] + 20, sy = strip[1] + strip[3] / 2; await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: sx, y: sy, id: 1 }] }); await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: sx + 120, y: sy - 40, id: 1 }] }); await sleep(500);
  const w1 = await p.evaluate(() => [window.__mnr.P.x, window.__mnr.P.y]); await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  o.dragStartingOnStripMovesShip = Math.hypot(w1[0] - w0[0], w1[1] - w0[1]) > 3; o.stripDragDelta = [w1[0] - w0[0] | 0, w1[1] - w0[1] | 0];
  console.log('B ' + JSON.stringify(o)); await p.context().close();
}
(async () => { const b = await L.boot(); try { await partA(b.br, b.base, 'phone'); await partA(b.br, b.base, 'pc'); await partB(b.br, b.base); } catch (e) { console.log('PROBE ERROR', String(e.stack).slice(0, 500)); } await b.close(); process.exit(0); })();

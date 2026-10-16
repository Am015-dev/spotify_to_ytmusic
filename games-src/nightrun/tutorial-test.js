#!/usr/bin/env node
// Nightrun FLIGHT SCHOOL test (real page, real time, ?nomusic=1). Prints only PASS / FAIL lines; exit code 1 on any FAIL.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/tutorial-test.js     env: GAME_DIR=...
// (a) a bot completes every step (desktop 1280x720 keyboard, 390x763 touch) and reaches the clear card; (b) an idle ship finishes by timeouts in < 5 min, never dies;
// (c) SKIP at every step returns to the title; (d) the first-launch offer shows once, replay from Settings works; (e) the gift is given once and persists;
// (f) best / daily / story state unchanged; (g) no page errors, no tutorial text outside the viewport at 390x763 and 1280x720.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const out = [], ok = (name, pass, info) => { out.push(pass); console.log((pass ? 'PASS ' : 'FAIL ') + name + (pass || !info ? '' : ' :: ' + info)); };
const DESK = { viewport: { width: 1280, height: 720 } }, PHONE = { viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 };
const KEEP = /best|daily|story|stars|lb|score/i;
async function page(br, port, opt, q, init) {
  const ctx = await br.newContext(opt), p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  if (init) await p.addInitScript(init);
  await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${q || ''}`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.__tut);
  await sleep(600); return { ctx, p, errs };
}
const state = p => p.evaluate(k => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const n = localStorage.key(i); if (new RegExp(k, 'i').test(n)) o[n] = localStorage.getItem(n); } return JSON.stringify(Object.keys(o).sort().map(n => [n, o[n]])); }, KEEP.source);
// every visible text box of the tutorial lies inside the viewport and its text is not clipped
const clipCheck = p => p.evaluate(() => { const bad = [], vw = innerWidth, vh = innerHeight;
  for (const el of document.querySelectorAll('#tutB, #tutB *, #tutC, #tutC *')) { if (!el.getClientRects().length || el.closest('[hidden]')) continue;
    if (!el.textContent.trim() || el.children.length) continue; const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    if (cs.visibility === 'hidden') continue;
    if (r.left < -1 || r.top < -1 || r.right > vw + 1 || r.bottom > vh + 1) bad.push(el.id || el.className || el.tagName + ':' + el.textContent.slice(0, 20));
    if (el.scrollWidth > el.clientWidth + 2 && cs.overflow !== 'visible') bad.push('clip ' + (el.id || el.tagName)); }
  return bad; });
// the in-page bot: steers with the real keys, dashes / EMPs with the real key or the real touch pad on the beat, closes the weapons sheet
const BOT = (mode) => { const m = window.__mnr, T = window.__tut, B = { up: 'ArrowUp', dn: 'ArrowDown', lf: 'ArrowLeft', rt: 'ArrowRight' }; window.__botOn = mode !== 'idle';
  let lastD = 0, wpT = 0; const press = (code, pad) => { if (mode === 'touch') { const b = document.getElementById(pad); b && b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerType: 'touch' })); }
    else { dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true })); setTimeout(() => dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true })), 40); } };
  window.__botI = setInterval(() => { if (!window.__botOn || !T.on || !m.G || m.G.dead) return; const P = m.P, K = m.K, G = m.G; for (const k of Object.values(B)) K[k] = false;
    if (T.wpOpen) { if (!wpT) wpT = performance.now(); if (performance.now() - wpT > 1200) { document.getElementById('wpGo').click(); wpT = 0; } return; }
    const id = T.id, g = T.target(); let tx = 220, ty = 360 + 120 * Math.sin(G.t * 1.3);
    if (g && (id === 'move' || id === 'pick')) { tx = g.x; ty = g.y; } else if (g && g.foe) { tx = 200; ty = g.y; }
    let fx = (tx - P.x) * .02, fy = (ty - P.y) * .02;
    if (id === 'dodge' || id === 'leader') for (const b of G.eb) { const dx = P.x - b.x, dy = P.y - b.y, d = Math.hypot(dx, dy); if (d < 140 && d > 1) { const w = (140 - d) / d / d * 220; fx += dx * w; fy += dy * w; } }
    if (fx > .2) K[B.rt] = true; else if (fx < -.2) K[B.lf] = true; if (fy > .2) K[B.dn] = true; else if (fy < -.2) K[B.up] = true;
    if (id === 'dash' && !T.next) { const bp = T.bpos(), f = bp - Math.floor(bp); if (f > .93 && performance.now() - lastD > 1100) { lastD = performance.now(); press('ShiftLeft', 'bDash'); } }
    if (id === 'emp' && !T.next && P.emp > 0 && m.G.empT <= 0 && T.t > 1) press('KeyX', 'bEmp'); }, 25); };
async function fullRun(br, port, opt, mode, label) {
  const { ctx, p, errs } = await page(br, port, opt, '', () => { try { localStorage.setItem('mnr_tut', '1'); localStorage.setItem('mnr_best', JSON.stringify({ score: 4321, dist: 'TEST' })); } catch (e) { } });
  const s0 = await state(p), bank0 = await p.evaluate(() => window.__mnr.GA.bank);
  if (mode === 'touch') await p.tap('#tutBtn'); else await p.click('#tutBtn');
  await p.waitForFunction(() => window.__tut.on, null, { timeout: 5000 });
  await p.evaluate(BOT, mode);
  const t0 = Date.now(), lim = mode === 'idle' ? 300000 : 240000; let died = false, clip = [], stuck = 0, lastI = -1, lastC = Date.now();
  while (Date.now() - t0 < lim) { await sleep(500);
    const st = await p.evaluate(() => ({ on: window.__tut.on, i: window.__tut.i, end: window.__tut.endShown, dead: !!(window.__mnr.G && window.__mnr.G.dead) }));
    if (st.dead) died = true; if (st.i !== lastI) { lastI = st.i; lastC = Date.now(); const c = await clipCheck(p); if (c.length) clip = clip.concat(c); }
    if (Date.now() - lastC > 30000) stuck = 1;
    if (st.end || !st.on) break; }
  const secs = (Date.now() - t0) / 1000, log = await p.evaluate(() => window.__tut.log), end = await p.evaluate(() => window.__tut.endShown);
  clip = clip.concat(await clipCheck(p));
  if (mode === 'idle') { ok(`${label}: idle ship finishes by timeouts in < 5 min (${secs.toFixed(0)} s)`, end && secs < 300, JSON.stringify(log));
    ok(`${label}: idle ship never dies, never stuck`, !died && !stuck); }
  else { const all = log.length === await p.evaluate(() => window.__tut.n) && log.every(l => l.ok);
    ok(`${label}: bot completes every step and reaches the clear card (${secs.toFixed(0)} s)`, end && all, JSON.stringify(log)); ok(`${label}: never dies`, !died); }
  const bank1 = await p.evaluate(() => window.__mnr.GA.bank);
  ok(`${label}: gift +60 Neon on the first clear`, bank1 - bank0 === 60, `${bank0} -> ${bank1}`);
  { const s1 = await state(p); ok(`${label}: best / daily / story state unchanged`, s1 === s0, s0.slice(0, 200) + ' => ' + s1.slice(0, 200)); }
  ok(`${label}: no tutorial text outside the viewport`, !clip.length, [...new Set(clip)].join(','));
  // the clear card's GARAGE opens the Garage
  if (mode === 'touch') await p.tap('#tutGa'); else await p.click('#tutGa'); await sleep(300);
  ok(`${label}: clear card GARAGE opens the Garage`, await p.evaluate(() => !document.getElementById('garage').hidden));
  if (mode !== 'idle') { // gift only once, and it survives a reload
    await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.__tut); await sleep(500);
    const bank2 = await p.evaluate(() => window.__mnr.GA.bank); ok(`${label}: gift persists after reload`, bank2 === bank1, `${bank1} vs ${bank2}`);
    await p.evaluate(() => window.__tut.start()); await p.evaluate(() => window.__tut.go(window.__tut.n)); await sleep(400);
    ok(`${label}: second clear gives no gift`, (await p.evaluate(() => window.__mnr.GA.bank)) === bank2 && await p.evaluate(() => window.__tut.endShown)); }
  ok(`${label}: no page errors`, !errs.length, errs.slice(0, 3).join(' | '));
  await ctx.close();
}
async function skipAll(br, port, opt, label) {
  const { ctx, p, errs } = await page(br, port, opt, '', () => { try { localStorage.setItem('mnr_tut', '1'); } catch (e) { } });
  const n = await p.evaluate(() => window.__tut.n); let bad = [];
  for (let i = 0; i < n; i++) { await p.evaluate(() => window.__tut.start()); await p.evaluate(i => window.__tut.go(i), i); await sleep(700);
    const c = await clipCheck(p); if (c.length) bad.push('clip' + i + ':' + c.join('/'));
    if (opt.hasTouch) await p.tap('#tutSkip'); else await p.click('#tutSkip'); await sleep(400);
    const r = await p.evaluate(() => ({ on: window.__tut.on, run: window.__mnr.running, title: !document.getElementById('title').hidden }));
    if (r.on || r.run || !r.title) bad.push('step' + i + ':' + JSON.stringify(r)); }
  ok(`${label}: SKIP at every step returns to the title`, !bad.length, bad.join(' '));
  ok(`${label}: skip run, no page errors`, !errs.length, errs.slice(0, 3).join(' | ')); await ctx.close();
}
async function offer(br, port, opt, label) {
  const { ctx, p, errs } = await page(br, port, opt, '&tut=offer'); await sleep(900);
  const shown = await p.evaluate(() => window.__tut.offerShown), c = await clipCheck(p);
  ok(`${label}: first launch offers the flight school`, shown);
  ok(`${label}: offer text inside the viewport`, !c.length, c.join(','));
  if (shown) { if (opt.hasTouch) await p.tap('#tutNo'); else await p.click('#tutNo'); }
  await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.__tut); await sleep(1700);
  ok(`${label}: offer never shows again`, !(await p.evaluate(() => window.__tut.offerShown)));
  if (opt.hasTouch) await p.tap('#setBtn'); else await p.click('#setBtn'); await sleep(300);
  await p.evaluate(() => document.getElementById('tutBtnS').scrollIntoView()); if (opt.hasTouch) await p.tap('#tutBtnS'); else await p.click('#tutBtnS'); await sleep(500);
  ok(`${label}: Settings > REPLAY TUTORIAL starts it`, await p.evaluate(() => window.__tut.on && window.__mnr.running));
  await p.evaluate(() => window.__tut.skip());
  // a returning player (has a best run) is never asked
  const r = await page(br, port, opt, '&tut=offer', () => { try { if (!sessionStorage.getItem('x')) { localStorage.clear(); localStorage.setItem('mnr_best', JSON.stringify({ score: 999, dist: 'X' })); sessionStorage.setItem('x', 1); } } catch (e) { } });
  await sleep(1700); ok(`${label}: returning player is not asked`, !(await r.p.evaluate(() => window.__tut.offerShown))); await r.ctx.close();
  ok(`${label}: offer run, no page errors`, !errs.length, errs.slice(0, 3).join(' | ')); await ctx.close();
}
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(700); const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  try {
    await Promise.all([fullRun(br, port, DESK, 'key', 'desktop 1280x720'), fullRun(br, port, PHONE, 'touch', 'phone 390x763'), fullRun(br, port, PHONE, 'idle', 'idle 390x763'),
      (async () => { await skipAll(br, port, DESK, 'desktop'); await skipAll(br, port, PHONE, 'phone'); await offer(br, port, DESK, 'desktop'); await offer(br, port, PHONE, 'phone'); })()]);
  } catch (e) { ok('test harness', false, e.message); }
  await br.close(); srv.kill(); process.exit(out.every(Boolean) ? 0 : 1);
})();

/* Flat-board gate: plays RACES seeded races by real touch at 375x667 and 375x553 (real speed) while a sampler in the page
   reads the board canvas every 120 ms; every 3rd turn the page is 80 px shorter (browser bar shown). A frame where >= 90% of the board (minimap excluded) is the plain grass fill
   (no track, no cars), or a board squeezed under 150x90 px, fails the test, and so does a board left blank (cleared by a resize) when the browser paints; its screenshot and camera state are saved to playable-shots/cam-*.png.
   Usage: node cam-test.js   (RACES=3, VP=375x553 to run one size, SEEDS=1,2,3) */
const path = require('path'), fs = require('fs'), { chromium } = require(process.env.PW || 'playwright'), gx = require('../scripts/gx-serve.js');
const SEEDS = (process.env.SEEDS || '3,7,19').split(',').slice(0, +(process.env.RACES || 3));
(async () => {
  const url = await gx.url('redline-rally', { file: process.env.FILE || path.join(__dirname, 'redline-rally.html') }), b = await chromium.launch({ args: ['--no-sandbox'] }); let bad = 0;
  const vps = [['375x667', { width: 375, height: 667 }], ['375x553', { width: 375, height: 553 }]].filter(v => !process.env.VP || v[0] === process.env.VP);
  for (const seed of SEEDS) for (const [n, vp] of vps) {
    const c = await b.newContext({ viewport: vp, hasTouch: true, isMobile: true, deviceScaleFactor: 1 }), p = await c.newPage(), errs = [];
    p.on('pageerror', e => errs.push(String(e)));
    await p.goto(url + (url.includes('?') ? '&' : '?') + 'seed=' + seed, { waitUntil: 'load' });
    await p.evaluate(() => { try { localStorage.setItem('gxt-redline-rally', JSON.stringify({ done: 1 })); localStorage.setItem('rr_seen', '1'); localStorage.removeItem('rr_set'); } catch (e) {} });
    await p.reload({ waitUntil: 'load' }); await p.waitForTimeout(700);
    const tapSel = async sel => { const el = await p.$(sel); if (!el) return false; const bb = await el.boundingBox(); if (!bb || !bb.width) return false; await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); return true; };
    await tapSel('#playB'); await p.waitForTimeout(900); await tapSel('#goalB');
    await p.evaluate(() => { window.__blank = []; window.__rs = 0;
      /* blank frames: setting the canvas size clears it; this observer runs after the game's own (registered later), right before the browser
         paints, so a board that is still empty here is painted as a plain green frame (the turn-change flicker) */
      new ResizeObserver(() => { if (!window.G || document.getElementById('game').hidden || !window.cx) return; window.__rs++; const W = cv.width, H = cv.height, d = cx.getImageData(0, 0, W, H).data; let n = 0, z = 0;
        for (let y = 4; y < H; y += 13) for (let x = 4; x < W; x += 13) { n++; if (d[(y * W + x) * 4 + 3] === 0) z++; }
        if (z / n > 0.5 && window.__blank.length < 6) window.__blank.push({ ph: G.phase, round: G.round, W: UI.W, H: UI.H }); }).observe(document.getElementById('cvw')); });
    await p.evaluate(() => { window.__flat = []; window.__frames = 0; setInterval(() => {
      if (!window.G || document.getElementById('game').hidden || !window.cv || !window.cx) return; const W = cv.width, H = cv.height; if (W < 20 || H < 20) return;
      const d = cx.getImageData(0, 0, W, H).data, mw = Math.min(110, UI.W * 0.3) * dpr + 12 * dpr, mh = (Math.min(110, UI.W * 0.3) * 0.6 + 12) * dpr; let n = 0, g = 0;
      for (let y = 4; y < H; y += 9) for (let x = 4; x < W; x += 9) { if (x > W - mw && y < mh) continue; const i = (y * W + x) * 4; n++; if (Math.abs(d[i] - 36) < 4 && Math.abs(d[i + 1] - 92) < 4 && Math.abs(d[i + 2] - 55) < 4) g++; }
      window.__frames++; const sq = UI.W < 150 || UI.H < 90; if ((sq || g / n >= 0.9) && window.__flat.length < 6) window.__flat.push({ f: +(g / n).toFixed(2), squeezed: sq, ph: G.phase, round: G.round, busy: UI.busy, cam: { x: UI.cam.x, y: UI.cam.y, s: UI.cam.s }, W: UI.W, H: UI.H, focus: UI.focus, png: window.__flat.length < 2 ? cv.toDataURL() : '' });
    }, 120); });
    const t0 = Date.now(); let turns = 0;
    for (let i = 0; i < 3000 && Date.now() - t0 < 360000; i++) {
      await p.waitForTimeout(150);
      const st = await p.evaluate(() => ({ over: !!G.over, modal: !document.getElementById('modal').hidden, go: !!document.querySelector('#goB') && G.phase === 'plan' && !UI.busy, q: document.querySelector('#panel .slipq button') ? G.pend && G.pend.t : '' }));
      if (st.over) break;
      if (st.modal) { await tapSel('#modal button.big') || await tapSel('#mx'); continue; }
      if (st.go) { /* take the suggested plan through the page, then tap Go by touch */
        await p.evaluate(() => { const c = you(), q = suggestPlan(G, c); UI.gear = q.gear; UI.sel = q.idx.slice(); drawPlan(); });
        await tapSel('#goB'); turns++;
        /* the phone browser bar shows and hides: every 3rd turn the page is 80 px shorter (this is what drew the plain green frames) */
        await p.setViewportSize({ width: vp.width, height: vp.height - (turns % 3 === 1 ? 80 : 0) }); continue; }
      if (st.q === 'boost') { await tapSel('#boostN'); continue; } if (st.q === 'slip') { await tapSel('#slipY'); continue; } if (st.q === 'disc') { await tapSel('#discN'); continue; }
      if (st.q) { await tapSel('#panel .slipq button'); }
    }
    const r = await p.evaluate(() => ({ blank: window.__blank, resizes: window.__rs, flat: window.__flat, frames: window.__frames, over: !!G.over, place: G.over ? G.rank.indexOf(G.cars.find(c => c.human).i) + 1 : 0 }));
    r.flat.forEach((f, k) => { if (f.png) fs.writeFileSync(path.join(__dirname, 'playable-shots', `cam-${n}-s${seed}-${k}.png`), Buffer.from(f.png.split(',')[1], 'base64')); delete f.png; });
    const ok = !r.flat.length && !r.blank.length && !errs.length && r.over;
    console.log(n, 'seed', seed, ok ? 'PASS' : 'FAIL', 'frames', r.frames, 'flat', r.flat.length, 'board resizes', r.resizes, 'blank', r.blank.length, 'turns', turns, 'place', r.place, r.over ? '' : 'race did not end', errs.slice(0, 2).join(' | '), (r.flat.length || r.blank.length) ? JSON.stringify({ flat: r.flat, blank: r.blank }) : '');
    if (!ok) bad = 1; await c.close();
  }
  await b.close(); process.exit(bad);
})();

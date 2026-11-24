// Plays the guided first game of Onyx Atelier at 402x874 touch, only by following the on-screen target.
// Asserts at every step: bubble within 120 px of its target and not overlapping it (or the other choices).
// Run: node proof/guide-proof.js   (writes proof/guide-402x874.webm)
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const D = __dirname, HTML = path.join(D, '..', 'onyx-atelier.html');
const W = +(process.env.W || 402), H = +(process.env.H || 874), TOUCH = W < 800;
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: W, height: H }, hasTouch: TOUCH, isMobile: TOUCH, recordVideo: { dir: path.join(D, 'vid-tmp'), size: { width: W, height: H } } });
  const p = await c.newPage(); const fails = []; let checks = 0;
  await p.goto('file://' + HTML); await p.waitForTimeout(600);
  await p.evaluate(() => OTUT.start()); await p.waitForTimeout(700);
  const probe = () => p.evaluate(() => {
    const R = e => { if (!e) return { l: 0, t: 0, r: 0, b: 0, w: 0, h: 0, nul: 1 }; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    const U = UI.U, co = document.querySelector('#coach'); if (!U.tut) return { done: true };
    const o = { text: co && co.querySelector('.t').textContent, vis: co && getComputedStyle(co).visibility === 'visible', res: co && co.classList.contains('res'), turn: U.G.turn, busy: U.busy };
    if (!co || !o.vis) return o; o.coach = R(co);
    const nx = co.querySelector('[data-next]'); const fing = document.querySelector('.finger');
    const cells = U.tut.cells, anc = OTUT.anchor();
    let targets = [], el = null;
    if (o.res) { const a = document.querySelector(anc); targets = [R(a)]; o.kind = 'result'; }
    else if (nx) { o.kind = 'next'; el = nx; targets = [R(nx)]; o.anchorEl = R(document.querySelector(OTUT.steps.find(s => s.say === o.text).anchor)); }
    else if (cells && cells.length && U.mode !== 'res' && U.sel.length < 3 && !document.querySelector('#sheet [data-buy]')) {
      o.kind = 'gems'; cells.forEach(k => { const e = document.querySelector('.cell[data-cell="' + k + '"]'); targets.push(R(e)); });
      const k = cells.find(k => U.sel.indexOf(k) < 0); el = document.querySelector('.cell[data-cell="' + k + '"]'); o.tap = R(el);
    } else if (fing) { o.kind = 'finger'; const fr = fing.getBoundingClientRect(); const x = fr.left + fr.width / 2, y = fr.top + fr.height / 2;
      el = document.elementFromPoint(x, y); el = el && (el.closest('button,.cell,.card,.col') || el); targets = [R(el)]; if (!el) o.dbg = 'finger target not found'; }
    if (el) { o.tap = R(el); o.tapw = o.tap.w; o.taph = o.tap.h; }
    o.targets = targets; return o;
  });
  const gap = (a, t) => Math.max(0, Math.max(t.l - a.r, a.l - t.r, t.t - a.b, a.t - t.b));
  const ov = (a, t) => a.l < t.r && a.r > t.l && a.t < t.b && a.b > t.t;
  let n = 0, lastKey = '';
  while (n++ < 80) {
    const s = await probe(); if (s.done) break;
    const key = s.text + '|' + s.kind; if (process.env.SHOTS) await p.screenshot({ path: process.env.SHOTS + '/s' + String(n).padStart(2, '0') + '.png' });
    if (!s.vis || !s.coach || ((s.turn === 1 || s.busy) && s.kind !== 'result')) { await p.waitForTimeout(250); continue; }
    if (s.kind === 'result') {
      const t = s.targets[0]; checks++;
      if (gap(s.coach, t) > 120) fails.push('result bubble too far: ' + s.text); if (ov(s.coach, t)) fails.push('result bubble overlaps what changed: ' + s.text);
      if (key !== lastKey) console.log('RESULT ok:', s.text, 'gap', Math.round(gap(s.coach, t))); lastKey = key; await p.waitForTimeout(500); continue;
    }
    if (s.targets && s.targets.length) {
      checks++; const g = Math.min(...s.targets.map(t => gap(s.coach, t)));
      if (g > 120) fails.push('too far (' + Math.round(g) + 'px): ' + s.text);
      if (s.kind !== 'next') s.targets.forEach(t => { if (ov(s.coach, t)) fails.push('bubble overlaps target: ' + s.text); });
      if (s.anchorEl && ov(s.coach, s.anchorEl)) console.log('DBG', JSON.stringify(s.coach), JSON.stringify(s.anchorEl)); if (s.anchorEl && (gap(s.coach, s.anchorEl) > 120 || ov(s.coach, s.anchorEl))) fails.push('info bubble not next to its subject: ' + s.text);
      if (s.kind !== 'next' && s.tap && (s.tap.w < 44 || s.tap.h < 44)) fails.push('target < 44px (' + Math.round(s.tap.w) + 'x' + Math.round(s.tap.h) + '): ' + s.text);
      if (key !== lastKey) console.log('STEP ok:', JSON.stringify(s.text), s.kind, 'gap', Math.round(g));
      lastKey = key;
    }
    if (!s.tap) { fails.push('no visible target: ' + s.text); await p.waitForTimeout(400); continue; }
    const x = s.tap.l + s.tap.w / 2, y = s.tap.t + s.tap.h / 2;
    if (TOUCH) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y);
    await p.waitForTimeout(450);
  }
  const done = await p.evaluate(() => !UI.U.tut);
  if (!done) fails.push('guide did not finish');
  await p.waitForTimeout(500); const v = p.video(); await c.close();
  const out = path.join(D, W < 800 ? 'guide-402x874.webm' : 'guide-' + W + 'x' + H + '.webm'); await v.saveAs(out); await b.close(); fs.rmSync(path.join(D, 'vid-tmp'), { recursive: true, force: true });
  console.log(fails.length ? 'FAIL\n' + [...new Set(fails)].join('\n') : 'PASS', '| checks', checks, '|', out); process.exit(fails.length ? 1 : 0);
})();

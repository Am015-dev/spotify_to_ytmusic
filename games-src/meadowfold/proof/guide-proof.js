// Plays the guided first game of Meadowfold at 402x874 touch (or W=1366 H=768 mouse), only by following the on-screen target.
// The target is read from the DOM (the guide bubble's anchor); no coordinates are hard-coded.
// Asserts at every step: bubble within 120 px of its target and not overlapping it or the other glowing choices; target >= 44 px.
// Run: node proof/guide-proof.js   (writes proof/guide-402x874.webm)
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const D = __dirname, HTML = path.join(D, '..', 'meadowfold.html');
const W = +(process.env.W || 402), H = +(process.env.H || 874), TOUCH = W < 800;
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: W, height: H }, hasTouch: TOUCH, isMobile: TOUCH, recordVideo: { dir: path.join(D, 'vid-tmp'), size: { width: W, height: H } } });
  const p = await c.newPage(); const fails = []; let checks = 0; p.on('pageerror', e => fails.push('pageerror ' + e.message));
  await p.goto('file://' + HTML); await p.waitForTimeout(600);
  await p.click('#tutB'); await p.waitForTimeout(700);
  const probe = () => p.evaluate(() => {
    const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    if (!TUT) return { done: true };
    const a = window.tutBubbleAnchor(), bub = document.getElementById('tbub'); if (!a || !bub) return { none: true, busy: UI.busy, cur: G.cur };
    const o = { text: a.text, res: a.res, coach: R(bub), sel: a.sel, step: TUT.i };
    const el = document.querySelector(a.sel); if (!el) return Object.assign(o, { missing: true });
    o.tap = R(el); o.choices = [];
    if (!a.res) document.querySelectorAll('.pocket.glow, #map .hx.glow, .acard.ready, #endB.go, #takeB').forEach(e => { if (getComputedStyle(e).visibility === 'visible') o.choices.push(R(e)); });
    o.hasBtn = !!bub.querySelector('#tutok'); if (o.hasBtn) o.btn = R(bub.querySelector('#tutok'));
    return o;
  });
  const gap = (a, t) => Math.max(0, Math.max(t.l - a.r, a.l - t.r, t.t - a.b, a.t - t.b));
  const ov = (a, t) => a.l < t.r && a.r > t.l && a.t < t.b && a.b > t.t;
  let n = 0, last = '';
  while (n++ < 90) {
    const s = await probe(); if (s.done) break;
    if (s.none || s.missing) { await p.waitForTimeout(250); continue; }
    checks++; const g = gap(s.coach, s.tap);
    if (g > 120) fails.push('too far (' + Math.round(g) + 'px): ' + s.text);
    if (ov(s.coach, s.tap)) fails.push('bubble overlaps its target: ' + s.text);
    if (!s.res) {
      // the target is the one glowing thing the player must tap; the bubble may not cover any glowing choice
      s.choices.forEach(r => { if (ov(s.coach, r)) fails.push('bubble covers a choice: ' + s.text); });
      if (s.tap.w < 44 || s.tap.h < 44) fails.push('target < 44px (' + Math.round(s.tap.w) + 'x' + Math.round(s.tap.h) + '): ' + s.text);
    }
    if (s.text + s.res !== last) console.log(s.res ? 'RESULT ok:' : 'STEP ok:', JSON.stringify(s.text), 'gap', Math.round(g)); last = s.text + s.res;
    if (s.res) { await p.waitForTimeout(500); continue; }
    const x = s.hasBtn ? s.btn.l + s.btn.w / 2 : s.tap.l + s.tap.w / 2, y = s.hasBtn ? s.btn.t + s.btn.h / 2 : s.tap.t + s.tap.h / 2;
    if (TOUCH) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y);
    await p.waitForTimeout(500);
  }
  if (!(await p.evaluate(() => !TUT))) fails.push('guide did not finish');
  await p.waitForTimeout(500); const v = p.video(); await c.close();
  const out = path.join(D, TOUCH ? 'guide-402x874.webm' : 'guide-' + W + 'x' + H + '.webm'); await v.saveAs(out); await b.close(); fs.rmSync(path.join(D, 'vid-tmp'), { recursive: true, force: true });
  console.log(fails.length ? 'FAIL\n' + [...new Set(fails)].join('\n') : 'PASS', '| checks', checks, '|', out); process.exit(fails.length ? 1 : 0);
})();

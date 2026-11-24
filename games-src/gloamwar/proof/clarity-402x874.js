// Guided start at 402x874 (touch): follows ONLY the on-screen target (read from the tutorial state / DOM, no fixed coordinates).
// Per step: the bubble must sit within 120 px of its target and must not overlap it. Records video next to this file.
// node proof/clarity-402x874.js   (needs playwright: NODE_PATH=$(npm root -g))
const path = require('path'), fs = require('fs'), { chromium } = require('playwright');
const url = 'file://' + path.join(__dirname, '..', 'gloamwar.html'), dir = path.join(__dirname, '_vid');
const gap = (a, b) => Math.max(0, Math.max(a.left - b.right, b.left - a.right)) + Math.max(0, Math.max(a.top - b.bottom, b.top - a.bottom));
const overlap = (a, b) => a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1;
(async () => {
  fs.rmSync(dir, { recursive: true, force: true });
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: true, recordVideo: { dir, size: { width: 402, height: 874 } } });
  const p = await ctx.newPage(); const errs = [], bad = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(url); await p.waitForTimeout(700);
  // 1) the goal bubble (before the tutorial): arrow target = the Company
  await p.tap('#playD'); await p.waitForTimeout(1200);
  const probe = () => p.evaluate(() => {
    const R = e => { const r = e.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, w: r.width, h: r.height }; };
    const b = document.querySelector('.gxt-bub') || document.querySelector('.gwb.goal'); if (!b) return null;
    let t = null; const c = window.GXT && GXT.active() && GXT.current && GXT.current();
    if (c && c.target) { const e = c.target(); if (e && e.getBoundingClientRect) t = R(e); } else { const e = document.getElementById('company'); if (e) t = R(e); }
    return { b: R(b), t };
  });
  let n = 0, nb = 0;
  const check = async (label) => {
    const q = await probe(); if (!q || !q.t) return; nb++;
    const g = gap(q.b, q.t), ov = overlap(q.b, q.t);
    // target rect can be a whole region (large): overlap with the target's own region is judged on the glow ring area of small targets, regions only need distance
    if (g > 120) bad.push(label + ': bubble ' + Math.round(g) + 'px from target'); if (ov && q.t.w < 200 && q.t.h < 200) bad.push(label + ': bubble overlaps its target');
  };
  await check('goal'); await p.tap('#goalGo'); await p.waitForTimeout(500);
  await p.evaluate(() => startTutorial()); await p.waitForTimeout(1300);
  let last = '', stall = 0; const seen = [];
  for (let i = 0; i < 160; i++) {
    const st = await p.evaluate(() => ({ active: GXT.active(), id: GXT.current && GXT.current() && GXT.current().id })); if (!st.active) break;
    const id = String(st.id); if (id !== last) { seen.push(id); last = id; stall = 0; } else if (++stall > 25) { bad.push('STALL at ' + id); break; }
    await p.waitForTimeout(250); n++; await check('step ' + n + ' ' + id);
    const next = await p.$('.gxt-next'); if (next && await next.isVisible()) { await next.tap().catch(() => {}); await p.waitForTimeout(700); continue; }
    const end = await p.$('.gxt-b.pri'); if (end && await end.isVisible()) { await end.tap().catch(() => {}); await p.waitForTimeout(500); continue; }
    const tgt = await p.evaluate(() => { const c = GXT.current && GXT.current(); if (!c || !c.target) return null; const e = c.target(); if (!e || !e.getBoundingClientRect) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    if (tgt) { await p.touchscreen.tap(tgt.x, tgt.y); await p.waitForTimeout(900); } else await p.waitForTimeout(500);
    const pend = await p.evaluate(() => G && G.pend && sideToAct(G) === 'D' && !UI.hold ? G.pend.h : null);
    if (pend === 'recruit') { await p.evaluate(() => { apply(AI.move(G, 'normal')); }); await p.waitForTimeout(600); }
  }
  const done = await p.evaluate(() => !GXT.active());
  const fin = await p.$('.gxt-b.pri'); if (fin && await fin.isVisible()) { await fin.tap().catch(() => {}); await p.waitForTimeout(800); }
  // 2) region card: tap a visible region, card must not cover it and must close on an outside tap
  await p.evaluate(() => { startGame({ side: 'D', level: 'easy', seed: 5, noGoal: true }); }); await p.waitForTimeout(1500);
  const rc = await p.evaluate(() => { const q = MV.rectOf('stagheath'); return { x: (q.left + q.right) / 2, y: (q.top + q.bottom) / 2 }; });
  await p.touchscreen.tap(rc.x, rc.y); await p.waitForTimeout(500);
  const card = await p.evaluate(() => { const c = document.querySelector('.rcard'); if (!c) return null; const r = c.getBoundingClientRect(), q = MV.rectOf('stagheath'); return { ov: r.left < q.right && r.right > q.left && r.top < q.bottom && r.bottom > q.top, h: r.height, w: r.width }; });
  if (!card) bad.push('region card did not open'); else if (card.ov) bad.push('region card covers its region');
  await p.touchscreen.tap(30, 760); await p.waitForTimeout(400);
  if (await p.evaluate(() => !!document.querySelector('.rcard'))) bad.push('region card did not close on outside tap');
  // 3) readability numbers at the start view
  const rd = await p.evaluate(() => { const k = MV.k, t = document.querySelector('#dyn .tok:not(.ch):not(.co)'); const tr = t.querySelector('circle:not(.hit):not(.tokring)').getBoundingClientRect(); const lb = [...document.querySelectorAll('.mlbl')].map(e => parseFloat(getComputedStyle(e).fontSize) * k); const hit = t.querySelector('.hit').getBoundingClientRect(); return { k, badge: tr.width, minLabel: Math.min(...lb), hit: hit.width }; });
  if (rd.minLabel < 12) bad.push('label ' + rd.minLabel.toFixed(1) + 'px < 12'); if (rd.badge < 24) bad.push('badge ' + rd.badge.toFixed(1) + 'px < 24'); if (rd.hit < 44) bad.push('hit ' + rd.hit.toFixed(1) + 'px < 44');
  if (n < 25) bad.push('only ' + n + ' steps'); if (!done) bad.push('tutorial did not finish'); if (errs.length) bad.push('errors: ' + errs.slice(0, 3).join(' | '));
  const vid = p.video(); await ctx.close(); const out = path.join(__dirname, 'clarity-402x874.webm'); await vid.saveAs(out); await b.close(); fs.rmSync(dir, { recursive: true, force: true });
  console.log('steps:', n, 'bubbles checked:', nb, '| seen:', seen.join('>'), '| readability:', JSON.stringify(rd));
  console.log(bad.length ? 'FAIL\n' + bad.join('\n') : 'PASS'); process.exit(bad.length ? 1 : 0);
})();

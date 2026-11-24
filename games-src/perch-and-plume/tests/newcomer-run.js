// Newcomer test (W602): plays the guided first game to the end following ONLY what is on screen: the glowing target (.tutpoint) and the
// bubble's instruction text. No coordinates, no rule knowledge. Every tap must advance the game (a tap that changes nothing fails).
// Records a video when VIDEO=dir is set.    node tests/newcomer-run.js [phone|pc] [url]
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const SIZE = process.argv[2] || 'phone', URL = process.argv[3] || 'http://127.0.0.1:8765/perch-and-plume/';
const VP = SIZE === 'pc' ? { width: 1366, height: 768 } : { width: 402, height: 874 }, TOUCH = SIZE !== 'pc';
(async () => {
  const b = await chromium.launch(); const o = { viewport: VP, hasTouch: TOUCH, isMobile: TOUCH, deviceScaleFactor: 1 };
  if (process.env.VIDEO) { fs.mkdirSync(process.env.VIDEO, { recursive: true }); o.recordVideo = { dir: process.env.VIDEO, size: VP }; }
  const ctx = await b.newContext(o), p = await ctx.newPage(); const errs = []; let fails = 0, taps = 0;
  p.on('pageerror', e => errs.push(e.message));
  const tap = async (x, y) => TOUCH ? p.touchscreen.tap(x, y) : p.mouse.click(x, y);
  const ok = (c, m) => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + SIZE + ' ' + m); };
  await p.goto(URL); await p.waitForTimeout(1200);
  const open = await p.$('[data-gxt-open]'); await open.scrollIntoViewIfNeeded(); const r0 = await open.boundingBox(); await tap(r0.x + r0.width / 2, r0.y + r0.height / 2);
  let idle = Date.now(), last = '', lastTxt = '', seen = 0, small = 0, goalLine = '', multi = 0;
  const sig = () => p.evaluate(() => { const b = document.querySelector('.coachb'); return [b && b.dataset.rule, b && b.dataset.sub, G.q && G.q.h, UI.pickBird, UI.sel, UI.pend, JSON.stringify(G.pl.map(x => [x.food, x.hand, x.board, x.cubes])), G.phase, !!document.querySelector('#again')].join('|'); }).catch(() => 'nav');
  while (Date.now() - idle < 25000) {
    const st = await p.evaluate(() => {
      if (typeof UI === 'undefined' || !G) return { wait: 1 };
      if (UI.mode !== 'tutfree') return { mode: UI.mode };
      const bub = document.querySelector('.coachb'), t = [...document.querySelectorAll('.tutpoint')];
      return { txt: bub ? (bub.querySelector('.tgoal') ? bub.querySelector('.tgoal').textContent : '') + ' / ' + bub.querySelector('.saytx').lastChild.textContent : '', n: t.length, rule: bub && bub.dataset.rule, goal: (document.querySelector('#goalbar') || {}).textContent || '' };
    });
    if (st.mode) break; if (st.wait || !st.n || !st.txt) { await p.waitForTimeout(200); continue; }
    if (st.goal) goalLine = st.goal; if (st.n > 1) multi++;
    const el = await p.$('.tutpoint'); await el.scrollIntoViewIfNeeded().catch(() => { });
    const r = await el.boundingBox(); if (!r) { await p.waitForTimeout(200); continue; }
    if (r.width < 44 || r.height < 44) small++;
    const x = r.x + r.width / 2, y = r.y + Math.min(r.height / 2, 30);
    if (st.txt !== lastTxt) { lastTxt = st.txt; seen++; if (process.env.SHOTS) { fs.mkdirSync(process.env.SHOTS, { recursive: true }); await p.screenshot({ path: path.join(process.env.SHOTS, SIZE + '-' + seen + '.png') }); } console.log('  step ' + seen + ' [' + st.rule + ']: ' + st.txt); }
    const b4 = await sig(); await tap(x, y); taps++; idle = Date.now(); await p.waitForTimeout(450);
    let a = await sig(); if (a === b4) { await p.waitForTimeout(900); a = await sig(); }
    if (a === b4) { ok(false, 'tap did nothing at: ' + st.txt); break; }
  }
  const mode = await p.evaluate(() => UI.mode).catch(() => '?');
  ok(mode !== 'tutfree', 'the guided game ran to its end and a real game started (mode ' + mode + ', ' + taps + ' taps, ' + seen + ' instructions)');
  ok(small === 0, 'every glowing target >= 44x44 (' + small + ' smaller)');
  ok(multi === 0, 'exactly one glowing target at every step (' + multi + ' steps with more)');
  ok(/Goal/.test(goalLine), 'a goal line was on screen: "' + goalLine.trim() + '"');
  ok(errs.length === 0, 'no page errors ' + errs.slice(0, 2).join(';'));
  await ctx.close(); await b.close();
  if (process.env.VIDEO) { const f = fs.readdirSync(process.env.VIDEO).filter(x => x.endsWith('.webm')).map(x => path.join(process.env.VIDEO, x)).sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0]; if (f && process.env.VIDEO_OUT) { fs.copyFileSync(f, process.env.VIDEO_OUT); console.log('video ' + process.env.VIDEO_OUT); } }
  process.exit(fails ? 1 : 0);
})();

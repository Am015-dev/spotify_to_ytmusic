// Proof video (F2): the first 3 minutes of a brand-new player at 375x667, by touch: the lesson first, then a real game.
// usage: node proof-video.js [URL=http://127.0.0.1:8765/index.html] -> proof/first-3-min-375x667.webm
// Serve a folder holding the built page as index.html plus media/models/music links (as feel-shots.js), so the real art loads.
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const URL = process.argv[2] || 'http://127.0.0.1:8765/index.html', OUT = path.join(__dirname, 'proof'), LIMIT = 180000;
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => { fs.mkdirSync(OUT, { recursive: true }); const tmp = fs.mkdtempSync('/tmp/na-vid-');
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, recordVideo: { dir: tmp, size: { width: 375, height: 667 } } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); const t0 = Date.now(); const left = () => LIMIT - (Date.now() - t0);
  const tap = async q => { for (const e of await p.$$(q)) { const r = await e.boundingBox(); if (r && r.width > 2 && r.height > 2) { await p.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); return true; } } return false; };
  await p.goto(URL); await sleep(2800);
  // 1. the lesson: the steps (tap what glows), then the coached battle; one deliberate wrong tap shows the nudge
  await tap('.gxt-first'); await sleep(2200); let wrong = 0;
  while (left() > 70000) { const st = await p.evaluate(() => ({ g: GXT.running() ? GXT.state() : null, done: GXCOACH.done, ph: G && G.phase }));
    if (st.done || await p.$('#na-coachend')) break;
    if (st.g && st.g.phase !== 'end') { if (st.g.shown) { await sleep(900); if (st.g.wait === null) await tap('.gxt-next'); else if (st.g.hole) await p.touchscreen.tap(st.g.hole.left + st.g.hole.width / 2, st.g.hole.top + st.g.hole.height / 2); } await sleep(500); continue; }
    if (await tap('.gxt-end .gxt-b.pri')) { await sleep(1200); continue; }
    if (!wrong && st.ph === 'plan' && await tap('.bfm:not(.sug):not(.small):not(.on)')) { wrong = 1; await sleep(1800); continue; }
    let ok = false; for (const q of ['.bfm.sug', '[data-bf="fly"]:not([disabled])', '.bftgt.rec', '.bftgt', '.bfact.rec', '.bfact', '.bfring.need', '#bfdice .die.pick.worth:not(.on)', '#bfbtns .btn.primary:not([disabled])', '#bfbtns .btn:not([disabled])']) if (await tap(q)) { ok = true; break; }
    await sleep(ok ? 1300 : 700); }
  await sleep(2500); await tap('#na-coachend .na-endx'); await sleep(1500);
  // 2. a real game: Play again -> Launch -> the even duel; plan with the upright dial, fly, act, shoot
  await tap('#bfbtns [data-a="new"]'); await sleep(1500); await tap('[data-a="start"]'); await sleep(1500); await tap('[data-tutoffer="play"]'); await sleep(2500);
  while (left() > 0) { const st = await p.evaluate(() => ({ ph: G.phase, w: G.winner, h: typeof humanTurn === 'function' && humanTurn(), dial: !!document.querySelector('#bfdial:not([hidden])') }));
    if (st.w) { await sleep(3000); break; }
    if (st.dial) { await sleep(900); const n = await p.$$('#bfdial .ditem'); if (n.length > 3) { const r = await n[2].boundingBox(); if (r) await p.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); await sleep(1400); }
      await tap('#bfdial .ditem.sug'); await sleep(1400); await tap('[data-bf="dlock"]'); await sleep(900); continue; }
    if (st.h) { let ok = false; for (const q of ['[data-bf="brief"]', '.bfring.need', '[data-bf="fly"]:not([disabled])', '.bftgt.rec', '.bftgt', '.bfact.rec', '.bfact', '#bfdice .die.pick.worth:not(.on)', '#bfbtns .btn.primary:not([disabled])', '#bfbtns .btn:not([disabled])']) if (await tap(q)) { ok = true; break; } await sleep(ok ? 1500 : 600); }
    else await sleep(800); }
  const v = p.video(); await ctx.close(); const src = await v.path(); fs.copyFileSync(src, path.join(OUT, 'first-3-min-375x667.webm')); await b.close();
  console.log('proof video', Math.round((Date.now() - t0) / 1000) + 's', 'errors', errs.length, errs.slice(0, 3)); })();

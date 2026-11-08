// Learn to play, start to finish, by touch at 390x844: the lesson steps (no Skip) and the coached game to its end card.
// usage: node learn-touch.js   (SITE = folder with index.html + media/models/music links, as feel-shots.js)
const { chromium } = require('playwright'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const SITE = process.env.SITE || '/tmp/na-site';
(async () => { const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + SITE + '/index.html'); await sleep(2500);
  const tap = async q => { let bx = null; for (const e of await p.$$(q)) { const r = await e.boundingBox(); if (r && r.width > 2 && r.height > 2) { bx = r; break; } } if (!bx) return false; await p.touchscreen.tap(bx.x + bx.width / 2, bx.y + bx.height / 2); return true; };
  await tap('.gxt-first'); await sleep(2500); let steps = 0, skips = 0; const t0 = Date.now();
  while (Date.now() - t0 < 400000) {
    const st = await p.evaluate(() => ({ g: GXT.running() ? GXT.state() : null, done: GXCOACH.done, win: G && G.winner }));
    if (st.done) break;
    if (st.g && st.g.phase !== 'end') { if (st.g.shown) { if (st.g.wait === null) await tap('.gxt-next'); else if (st.g.hole) await p.touchscreen.tap(st.g.hole.left + st.g.hole.width / 2, st.g.hole.top + st.g.hole.height / 2); steps++; } await sleep(600); continue; }
    if (await tap('.gxt-end .gxt-b.pri, .gxt-end [data-gxt-end]')) { await sleep(800); continue; }
    let ok = await tap('[data-bf="auto"]'); if (ok) { await sleep(250); ok = await tap('[data-bf="fly"]:not([disabled])'); }
    if (!ok) for (const q of ['.bftgt', '.bfact', '.bfring.need', '.bfm.sug', '#bfdice .die.pick', '#bfbtns .btn:not([disabled])']) if (await tap(q)) { ok = true; break; }
    await sleep(700);
  }
  const r = await p.evaluate(() => ({ done: GXCOACH.done, explained: GXCOACH.explained.length, win: G && G.winner, round: G && G.round }));
  console.log('learn 390x844', JSON.stringify(r), 'lesson taps', steps, 'skips', skips, 'errors', errs.length, Math.round((Date.now() - t0) / 1000) + 's');
  await b.close(); process.exit(r.done && !errs.length ? 0 : 1); })();

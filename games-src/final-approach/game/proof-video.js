// Records the first ~3 minutes of a Computer flight at 375x667 (touch taps only, following the game's own advice) to ../proof/first-3-minutes.webm
//   NODE_PATH=../../node_modules node proof-video.js [file=final-approach.html] [seconds=180]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const gx = require('../../scripts/gx-serve.js');
const FILE = path.resolve(__dirname, process.argv[2] || 'final-approach.html'), SECS = +process.argv[3] || 180;
const OUT = path.resolve(__dirname, '..', 'proof'), TMP = path.join(OUT, '.tmp');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.mkdirSync(TMP, { recursive: true });
  const url = await gx.url('final-approach', { file: FILE, query: '?phone=1' });
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true, recordVideo: { dir: TMP, size: { width: 375, height: 667 } } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(url); await sleep(4000);   // the title
  await p.evaluate(() => { try { GX.close(); } catch (e) { } UI.prefs.story = false; UI.seed = 3; newGame('vs', { scenario: 'g1', role: 0, level: 'normal', tipsOff: true }); });
  const t0 = Date.now(); let taps = 0;
  const ctr = sel => p.evaluate(sel => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel);
  while (Date.now() - t0 < SECS * 1000) {
    const gi = await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(e => /^got it$/i.test(e.innerText.trim()) && e.getBoundingClientRect().width > 5); if (!b) return null; const r = b.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    if (gi) { await p.touchscreen.tap(...gi); await sleep(700); continue; }
    const st = await p.evaluate(() => ({ over: !!G.result, goal: !!document.querySelector('#goal .goalb.on,.gotit'), ready: !!document.querySelector('#acts [data-a=ready]') }));
    if (st.over) { await sleep(3000); await p.evaluate(() => { const b = document.querySelector('#acts [data-a=again]'); b && b.click(); }); await sleep(1500); continue; }
    const plan = await p.evaluate(() => { const v = actSeat(); if (typeof v !== 'number' || !FA.pending(G).includes(v)) return null; const pl = hlpPlan(); if (!pl) return null; const c = e => { const x = e && e(); if (!x) return null; const r = x.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }; return { from: c(pl.from), to: c(pl.to) }; });
    if (!plan) { let any = null; for (const sel of ['#acts [data-a=ready]', '#acts [data-a=rrpick]', '#acts [data-a=rr]']) { any = await ctr(sel); if (any) break; } if (any) { await p.touchscreen.tap(...any); taps++; await sleep(900); continue; } }
    if (plan && plan.to) { if (plan.from) { await p.touchscreen.tap(...plan.from); await sleep(500); } await p.touchscreen.tap(...plan.to); taps++; await sleep(900); } else await sleep(500);
  }
  await ctx.close(); await browser.close();
  const f = fs.readdirSync(TMP).find(x => x.endsWith('.webm')); fs.renameSync(path.join(TMP, f), path.join(OUT, 'first-3-minutes.webm')); fs.rmSync(TMP, { recursive: true, force: true });
  console.log('recorded', SECS, 's,', taps, 'taps, page errors:', errs.length, errs.slice(0, 2).join(' | '));
})();

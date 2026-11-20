/* Records the first 3 minutes of a fresh player at 375x667 by touch (Suggest shows the plan, the player taps the gold gear and cards, then Go) into proof/first-3-min-375x667.webm.  Usage: node proof-record.js */
const path = require('path'), fs = require('fs'), { chromium } = require(process.env.PW || 'playwright'), gx = require('../scripts/gx-serve.js');
(async () => {
  const url = await gx.url('redline-rally', { file: path.join(__dirname, 'redline-rally.html') }), b = await chromium.launch({ args: ['--no-sandbox'] }), dir = '/tmp/rr-vid';
  fs.rmSync(dir, { recursive: true, force: true });
  const c = await b.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true, recordVideo: { dir, size: { width: 375, height: 667 } } }), p = await c.newPage(), t0 = Date.now();
  await p.goto(url + (url.includes('?') ? '&' : '?') + 'seed=7'); await p.waitForTimeout(1500); await p.tap('#playB'); await p.waitForTimeout(1500);
  while (Date.now() - t0 < 185000) {
    const st = await p.evaluate(() => window.G ? { over: G.over, busy: UI.busy, ph: G.phase, goal: !!document.querySelector('#goalB'), modal: !document.querySelector('#modal').hidden, go: !!document.querySelector('#goB:not([disabled])'), sug: !!document.querySelector('#sugB'), q: !!document.querySelector('#panel .slipq button') } : {});
    if (st.over) break;
    if (st.goal) { await p.tap('#goalB'); } else if (st.modal) { await p.tap('#modal button.big').catch(() => {}); }
    else if (st.ph === 'plan' && !st.busy) {   /* F3: Suggest only shows the plan in gold; the player taps the gear and the cards, reads the trade-off line, then Go */
      if (st.sug && !(await p.$('.gb.sg, .cd.sg'))) { await p.tap('#sugB'); await p.waitForTimeout(1200); }
      for (let k = 0; k < 6; k++) { const e = await p.$('.gb.sg:not(.on)') || await p.$('#hand .cd.sg:not(.sel)'); if (!e) break; await e.tap(); await p.waitForTimeout(600); }
      if (await p.$('#goB:not([disabled])')) { await p.waitForTimeout(900); await p.tap('#goB'); } }
    else if (st.q) { await p.waitForTimeout(1400); const e = await p.$('#panel .slipq button.sug') || await p.$('#discN') || await p.$('#panel .slipq button'); if (e) await e.tap(); }
    await p.waitForTimeout(500);
  }
  await c.close(); await b.close(); const f = fs.readdirSync(dir).find(x => x.endsWith('.webm')); fs.copyFileSync(path.join(dir, f), path.join(__dirname, 'proof/first-3-min-375x667.webm')); console.log('saved', ((Date.now() - t0) / 1000).toFixed(0) + 's');
})();

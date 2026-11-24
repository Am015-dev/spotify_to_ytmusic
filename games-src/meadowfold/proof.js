// Proof video: the first 3 minutes at 375x667 (title, tutorial, then a real game played with touch taps; the moves come from the
// computer's own planner so the video shows good play) + 4 screenshots. node proof.js  -> proof/first-3-min.webm, proof/*.png
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'proof'); fs.mkdirSync(OUT, { recursive: true });
const T0 = Date.now(), LIMIT = 178000, wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true, recordVideo: { dir: OUT, size: { width: 375, height: 667 } } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.join(__dirname, 'meadowfold.html')); await wait(2500);
  await p.screenshot({ path: OUT + '/1-title.png' });
  const tap = async s => { const el = typeof s === 'string' ? await p.$(s) : s; if (!el) return false; await el.tap(); await wait(900); return true; };
  // tutorial
  await tap('#tutB'); await wait(1200);
  await tap('.pocket.glow'); for (let i = 0; i < 3; i++) await tap('#map .hx.glow');
  await tap('.acard[data-row="0"]'); await wait(800); await tap('#takeB'); await tap('.acard.ready'); await wait(500); await tap('#map .hx.glow');
  await tap('#endB'); await p.waitForFunction(() => G.cur === 0 && !UI.busy, null, { timeout: 20000 }); await wait(800);
  await tap('.pocket.glow'); for (let i = 0; i < 3; i++) await tap('#map .hx.glow');
  await wait(1500); await tap('#tutok');
  let shotMid = false, shotCard = false;
  while (Date.now() - T0 < LIMIT) {
    const st = await p.evaluate(() => ({ over: G.over, mine: !G.seats[G.cur].ai && !UI.busy && G.cur === 0 }));
    if (st.over) break;
    if (!st.mine) { await wait(400); continue; }
    const plan = await p.evaluate(() => AI.plan('normal'));
    for (const m of plan) {
      if (Date.now() - T0 > LIMIT) break;
      if (m.t === 'take') await tap(`.pocket[data-pocket="${m.i}"]`);
      else if (m.t === 'place') { await tap(`.htok[data-h="${m.h}"]`); await tap(`#map .hx[data-k="${m.k}"]`); }
      else if (m.t === 'card') { await p.evaluate(() => { UI.tab = 'row'; render(); }); await tap(`.acard[data-row="${m.i}"]`); await wait(900);
        if (!shotCard) { await p.screenshot({ path: OUT + '/3-animal-card.png' }); shotCard = true; } await tap('#takeB'); }
      else if (m.t === 'cube') { await p.evaluate(() => { UI.tab = 'mine'; render(); }); await tap(`.acard[data-ci="${m.ci}"]`); await wait(500);
        if (!shotMid && await p.evaluate(() => G.seats[0].turns >= 3)) { await p.screenshot({ path: OUT + '/2-settle-animal.png' }); shotMid = true; }
        await tap(`#map .hx[data-k="${m.k}"]`); }
      else if (m.t === 'swap') { }
      else if (m.t === 'end') { await tap('#endB'); }
    }
  }
  // finish quickly off camera for the results shot
  const vid = p.video(); await p.evaluate(() => { UI.fast = true; G.seats[0].ai = 'normal'; if (!G.over) { if (G.cur === 0 && !UI.busy) runAI(); } });
  await p.waitForFunction(() => G.over, null, { timeout: 120000 }).catch(() => { });
  await p.evaluate(() => { UI.fast = false; G.seats[0].ai = null; showResults(); }); await wait(800);
  await p.screenshot({ path: OUT + '/4-results.png' });
  await ctx.close(); const vp = await vid.path(); fs.renameSync(vp, OUT + '/first-3-min.webm');
  console.log('video', Math.round((Date.now() - T0) / 1000), 's; errors:', errs);
  await b.close();
})();

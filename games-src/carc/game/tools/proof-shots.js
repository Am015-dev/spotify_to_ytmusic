// proof-shots.js: a mid-game screenshot on your turn at five sizes. node tools/proof-shots.js outDir
const PW = require(process.env.PW || 'playwright'), path = require('path'), fs = require('fs');
const gx = require('../../../scripts/gx-serve.js'); const sleep = ms => new Promise(r => setTimeout(r, ms));
const OUT = path.resolve(process.argv[2] || '../proof/shots-f3');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const URL = process.env.URL || await gx.url('rampart-and-vine', { file: path.join(__dirname, '..', 'rampart.html') });
  const b = await PW.chromium.launch({ args: ['--no-sandbox'] });
  for (const [W, H] of [[375, 553], [375, 667], [910, 512], [1366, 768], [1920, 1080]]) {
    const phone = W < 700, ctx = await b.newContext({ viewport: { width: W, height: H }, isMobile: phone, hasTouch: phone, deviceScaleFactor: 2 }), p = await ctx.newPage();
    await p.goto(URL); await sleep(1200);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } AIDELAY = 30; UI.speed = 30; UI.offered = true; setSeed(7); beginGame({ np: 2, seats: ['human', 'ai'], lv: ['normal', 'easy'], ex: {} }); });
    await sleep(700); await p.evaluate(() => { const g = document.querySelector('#goalok'); if (g) g.click(); });
    for (let i = 0; i < 500; i++) {
      const st = await p.evaluate(() => ({ my: !!G && !G.over && myTurn('place'), fig: !!G && !G.over && myTurn('fig'), n: G ? G.order.length : 0 }));
      if (st.my && st.n >= 16) break;
      if (st.my || st.fig) { await sleep(150); await p.evaluate(() => { const m = aiMove(sideToAct()); if (m) performMove(m, sideToAct()); }); } await sleep(120);
    }
    await sleep(1500); await p.screenshot({ path: path.join(OUT, `board-${W}x${H}.png`) }); console.log('shot', W, H); await ctx.close();
  }
  await b.close();
})();

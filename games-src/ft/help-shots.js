// Screenshots of the help kit at 390x763: a coach bubble (lift), the bulb suggestion (lift) and a rules card -> playtest/help-*.png
//   NODE_PATH=/opt/node-tools/node_modules node help-shots.js [file=sands.html]
const { chromium } = require('playwright'); const path = require('path');
const FILE = path.resolve(__dirname, process.argv[2] || 'sands.html'), OUT = path.join(__dirname, 'playtest') + '/';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 763 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + FILE); await sleep(700);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } setSeed(907); UI.setup.np = 2; beginGame(); UI.speed = 8; });
  const done = {};
  for (let i = 0; i < 300 && Object.keys(done).length < 3; i++) {
    await sleep(150);
    const st = await p.evaluate(() => ({ ph: hlpPhase(), cur: GXH.state().cur, over: !!(G && G.over) })); if (st.over) break;
    if (st.ph === 'lift' && !done.coach && st.cur && st.cur.kind === 'coach') { await sleep(250); await p.screenshot({ path: OUT + 'help-coach-bubble-390x763.png' }); done.coach = 1; console.log('coach'); }
    if (st.ph === 'lift' && done.coach && !done.bulb) {
      await p.evaluate(() => GXH.hide()); const bb = await p.evaluate(() => { const r = document.querySelector('#bulbbtn').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
      await p.touchscreen.tap(...bb); await sleep(600); await p.screenshot({ path: OUT + 'help-bulb-suggestion-390x763.png' }); done.bulb = 1; console.log('bulb');
      await p.evaluate(() => document.querySelector('.gxh-link').click()); await sleep(300); await p.evaluate(() => document.querySelector('.gxh-next').click()); await sleep(250);
      await p.screenshot({ path: OUT + 'help-rules-card-390x763.png' }); done.rules = 1; console.log('rules'); await p.evaluate(() => document.querySelector('.gxh-rules .gxh-x').click()); }
    if (st.ph === 'lift' && !done.coach) continue;
    await p.evaluate(() => { GXH.hide(); const m = hlpAdvice(); if (m && me()) go(m); else if (me()) { const vm = validMoves(me().i); go(vm[0]); } });
  }
  await b.close();
})();

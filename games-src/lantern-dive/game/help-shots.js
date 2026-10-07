// Screenshots of the help kit at 390x763: a coach bubble (lead), the bulb suggestion (follow) and a rules card -> ../playtest/help-*.png
//   NODE_PATH=/opt/node-tools/node_modules node help-shots.js
const { chromium } = require('playwright');
const path = require('path');
const FILE = path.resolve(__dirname, 'lantern-dive.html'), OUT = path.resolve(__dirname, '..', 'playtest') + '/';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 763 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + FILE); await sleep(900);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } AIDELAY = 120; UI.seed = 4242; newGame('vs', { np: 4, mission: 3, kind: 'log', level: 'normal' }); });
  const done = {};
  for (let i = 0; i < 600 && Object.keys(done).length < 3; i++) {
    await sleep(160);
    const st = await p.evaluate(() => ({ ph: hlpPhase(), cur: GXH.state().cur, over: G.phase === 'over', busy: UI.busy }));
    if (st.over) break;
    if (st.ph === 'lead' && !done.coach && st.cur && st.cur.kind === 'coach') { done.coach = 1; await sleep(300); await p.screenshot({ path: OUT + 'help-coach-bubble-390x763.png' }); console.log('coach'); }
    if (st.ph === 'follow' && !done.bulb && !st.busy) {
      await p.evaluate(() => GXH.hide());
      const bb = await p.evaluate(() => { const r = document.querySelector('#bulbbtn').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
      await p.touchscreen.tap(...bb); await sleep(600); done.bulb = 1; await p.screenshot({ path: OUT + 'help-bulb-suggestion-390x763.png' }); console.log('bulb');
      await p.evaluate(() => document.querySelector('.gxh-link') && document.querySelector('.gxh-link').click()); await sleep(300);
      await p.evaluate(() => { const n = document.querySelector('.gxh-next'); n && n.click(); }); await sleep(250);
      done.rules = 1; await p.screenshot({ path: OUT + 'help-rules-card-390x763.png' }); console.log('rules');
      await p.evaluate(() => { GXH.hide(); const x = document.querySelector('.gxh-rules .gxh-x'); x && x.click(); });
    }
    // play on: tap the first glowing thing
    await p.evaluate(() => { GXH.hide(); const e = document.querySelector('#pool .jcard.glow, #hand .hc.glow, #acts .btn.go, #acts .btn'); if (e && iMustAct() && !UI.busy) e.click(); });
  }
  console.log(JSON.stringify(done)); await b.close();
})();

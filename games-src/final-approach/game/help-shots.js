// Screenshots of the help kit at 390x763: a coach bubble (pick a die), the bulb suggestion and a rules card -> ../playtest/help-*.png
//   NODE_PATH=/opt/node-tools/node_modules node help-shots.js [all]     ("all" also saves every phase's bubble and rules cards under $SHOTS)
const { chromium } = require('playwright'); const path = require('path');
const OUT = path.join(__dirname, '..', 'playtest') + '/', ALL = process.argv[2] === 'all', EX = process.env.SHOTS || '/tmp';
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 763 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  await ctx.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('fa_prefs', JSON.stringify({ prefs: { gfx: 'low', story: false } })); } catch (e) { } });
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + path.join(__dirname, 'final-approach.html')); await sleep(900);
  await p.evaluate("AIDELAY=160;UI.seed=977;newGame('vs',{scenario:'g1',role:0,level:'normal'})"); await sleep(900);
  const tap = async (sel) => { const c = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel); if (!c) return false; await p.touchscreen.tap(c[0], c[1]); return true; };
  const rules = async name => { await tap('#bulbbtn'); await sleep(500); if (await p.evaluate(() => !!document.querySelector('.gxh-link'))) { await p.evaluate(() => document.querySelector('.gxh-link').click()); await sleep(300); } const n = await p.evaluate(() => +document.querySelector('.gxh-rules').dataset.count); for (let i = 0; i < n; i++) { if (name === 'rules' ? i === 1 : ALL) await p.screenshot({ path: (name === 'rules' ? OUT + 'help-rules-card-390x763' : EX + '/rules-' + name + '-' + i) + '.png' }).catch(() => { }); await p.evaluate(() => document.querySelector('.gxh-next').click()); await sleep(200); } await p.evaluate(() => GXH.hide()); };
  // brief: the bubble, then roll
  await sleep(700); if (ALL) await p.screenshot({ path: EX + '/bubble-brief.png' });
  await tap('#acts [data-a=ready]'); await sleep(1500);
  for (let i = 0; i < 40; i++) { const s = await p.evaluate(() => hlpPhase()); if (s === 'die') break; await sleep(250); }
  await sleep(600); await p.screenshot({ path: OUT + 'help-coach-bubble-390x763.png' }); console.log('coach: ', await p.evaluate(() => JSON.stringify(GXH.state().cur)));
  await tap('#bulbbtn'); await sleep(200); await p.evaluate(() => GXH.hide()); await sleep(100);
  await tap('#bulbbtn'); await sleep(700); await p.screenshot({ path: OUT + 'help-bulb-suggestion-390x763.png' }); console.log('bulb: ', await p.evaluate(() => { const b = document.querySelector('.gxh-bub'); return b && b.innerText; }));
  await p.evaluate(() => GXH.hide());
  await rules('rules');
  if (ALL) {
    await rules('die');
    const sug = await p.evaluate(() => { const x = hlpPlan(); return x && x.m; });
    if (sug) { await tap('#pz .die[data-s="0"][data-d="' + sug.d + '"]'); await sleep(900); await p.screenshot({ path: EX + '/bubble-space.png' }); await rules('space'); }
  }
  await b.close();
})();

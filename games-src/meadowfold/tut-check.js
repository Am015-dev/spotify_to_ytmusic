// Tutorial walk-through with real touch taps at 375x667: every scripted step must advance. node tut-check.js
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file://' + path.join(__dirname, 'meadowfold.html')); await p.waitForTimeout(500);
  await p.tap('#tutB'); await p.waitForTimeout(400);
  const step = () => p.evaluate(() => TUT ? TUT.i : -1);
  const tapSel = async s => { const el = await p.$(s); if (!el) throw new Error('missing ' + s + ' at step ' + await step()); await el.tap(); await p.waitForTimeout(350); };
  await tapSel('.pocket.glow');
  for (let i = 0; i < 3; i++) await tapSel('#map .hx.glow');
  await tapSel('.acard[data-row="0"]'); await tapSel('#takeB');
  await tapSel('.acard.ready'); await tapSel('#map .hx.glow');
  await tapSel('#endB');
  await p.waitForFunction(() => G.cur === 0 && !UI.busy, null, { timeout: 15000 }); await p.waitForTimeout(400);
  await tapSel('.pocket.glow');
  for (let i = 0; i < 3; i++) await tapSel('#map .hx.glow');
  const s = await step(), txt = await p.textContent('#line').catch(() => '');
  console.log('tutorial reached step', s, '| box:', txt, '| errors:', errs);
  await p.screenshot({ path: process.argv[2] || '/tmp/tut.png' });
  await b.close(); process.exit(s === 11 && !errs.length ? 0 : 1);
})().catch(e => { console.log('FAIL', e.message); process.exit(1); });

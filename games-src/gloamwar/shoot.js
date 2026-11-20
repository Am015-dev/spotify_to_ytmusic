// Screenshots at phone size: node shoot.js [outdir]
const path = require('path'), { chromium } = require(path.join(__dirname, '..', 'node_modules', 'playwright'));
const out = process.argv[2] || '/tmp/gw'; require('fs').mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.join(__dirname, 'gloamwar.html')); await p.waitForTimeout(800);
  await p.screenshot({ path: out + '/1-title.png' });
  await p.tap('#playD'); await p.waitForTimeout(1500);
  await p.screenshot({ path: out + '/2-start.png' });
  for (let i = 0; i < 30; i++) { const ok = await p.evaluate(() => G.phase === 'act' && sideToAct(G) === 'D' && !G.pend && !UI.hold); if (ok) break; const c = await p.$('#acts .act'); if (c) await c.tap().catch(() => {}); await p.waitForTimeout(500); }
  await p.screenshot({ path: out + '/3-act.png' });
  const d = await p.$('#mydice .die.can'); if (d) await d.tap(); await p.waitForTimeout(400);
  await p.screenshot({ path: out + '/4-die.png' });
  await p.tap('#tCards'); await p.waitForTimeout(500); await p.screenshot({ path: out + '/5-cards.png' });
  console.log('errors:', errs.slice(0, 5).join(' | ') || 'none');
  await b.close();
})();

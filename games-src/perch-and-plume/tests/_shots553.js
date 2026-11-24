const { chromium } = require('playwright');
const W = +(process.argv[2] || 375), H = +(process.argv[3] || 553), OUT = process.argv[4] || 'shots-f4';
(async () => {
  require('fs').mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(); const touch = W < 700;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 2 });
  await ctx.addInitScript(() => { try { localStorage.setItem('pp-played', '1'); } catch (e) { } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://127.0.0.1:8765/perch-and-plume/'); await p.waitForTimeout(900);
  await p.screenshot({ path: `${OUT}/${W}x${H}-1-title.png` });
  const tap = async s => { const l = p.locator(s).first(); await l.waitFor({ timeout: 8000 }); await l.scrollIntoViewIfNeeded(); if (touch) await l.tap(); else await l.click(); await p.waitForTimeout(600); };
  await tap('[data-t="quick"]'); await p.screenshot({ path: `${OUT}/${W}x${H}-2-quick.png` });
  await tap('[data-go]'); await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/${W}x${H}-3-hand.png` });
  await tap('#keepgo');
  for (let k = 0; k < 14; k++) { await p.waitForTimeout(500); if (await p.evaluate(() => myTurn() && !UI.busy && !document.querySelector('.turnban'))) break; }
  await p.waitForTimeout(500); await p.screenshot({ path: `${OUT}/${W}x${H}-4-myturn.png` });
  const m = await p.evaluate(() => { const r = s => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); return [Math.round(q.top), Math.round(q.bottom), Math.round(q.left), Math.round(q.right)]; }; return { trk: r('#trk'), acts: r('#acts'), act4: r('#act4'), prompt: r('#prompt'), end: r('#endturn,[data-a="endturn"],.endt'), vh: innerHeight, trkVis: (() => { const e = document.querySelector('#trk'); if (!e) return false; const q = e.getBoundingClientRect(); const t = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return !!t && (t === e || e.contains(t)); })() }; });
  console.log(JSON.stringify(m), errs.join('|'));
  await b.close();
})();

// F16 proof: plays one solo game per size by real input (touch on phone) and saves board, tray-grown, rival-move and result shots.
// node f16-shots.js [outdir]   (python3 build.py first)
const { chromium } = require('playwright'), serve = require('./serve.js');
const OUT = process.argv[2] || 'proof';
(async () => {
  const S = await serve(), b = await chromium.launch();
  for (const [W, H, touch, tag] of (process.env.ONLY ? [[375, 667, true, '375x667']] : [[375, 667, true, '375x667'], [1366, 768, false, '1366x768'], [910, 512, false, '910x512']])) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => { try { localStorage.setItem('gxt-vinegrave', JSON.stringify({ done: true })); localStorage.setItem('vinegrave-prefs', JSON.stringify({ played: true })); } catch (e) { } });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e)));
    const click = async sel => { const e = p.locator(sel).first(); const bb = await e.boundingBox(); if (!bb) return; if (touch) await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); else await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); };
    await p.goto(S.url); await p.waitForSelector('#start .tbtn'); await click('#start .tbtn');
    await p.waitForSelector('#goal .tbtn', { timeout: 8000 }).catch(() => { }); await p.waitForTimeout(400); await p.screenshot({ path: `${OUT}/f16-${tag}-1-start.png` });
    if (await p.locator('#goal .tbtn').count()) await click('#goal .tbtn');
    await p.waitForTimeout(600); await p.screenshot({ path: `${OUT}/f16-${tag}-2-board.png` });
    let mv = 0, rc = 0, riv = 0;
    for (let k = 0; k < 400; k++) {
      await p.waitForFunction(() => window.G && (G.phase === 'over' || (myTurn() && !UI.busy) || (document.querySelector('#rcard') && !document.querySelector('#rcard').hidden)), null, { timeout: 30000 }).catch(() => { });
      if (await p.evaluate(() => G.phase === 'over')) break;
      if (await p.evaluate(() => { const r = document.querySelector('#rcard'); return r && !r.hidden; })) { rc++; if (rc <= 2) await p.screenshot({ path: `${OUT}/f16-${tag}-4-round${rc}.png` }); await click('#rcard .tbtn'); continue; }
      if (await p.evaluate(() => !document.querySelector('#fx').hidden)) { await click('#fx .fxcard').catch(() => { }); continue; }
      if (!(await p.evaluate(() => myTurn() && !UI.busy))) continue;
      if (!riv && mv > 4 && await p.evaluate(() => !!(document.querySelector('#rlog') && document.querySelector('#rlog').textContent))) { riv = 1; await p.screenshot({ path: `${OUT}/f16-${tag}-3-rivallog.png` }); }
      if (mv === 14) await p.screenshot({ path: `${OUT}/f16-${tag}-5-mid.png` });
      if (await p.evaluate(() => { const q = document.querySelector('#qbox'); return !!(q && !q.hidden && q.querySelector('button')); })) { await click('#qbox .glow, #qbox button'); mv++; await p.waitForTimeout(300); continue; }
      const s = await p.evaluate(() => ['.site.glow', '#hand .cd.glow', '#row .cd.glow', '#track.glow'].find(x => document.querySelector(x)) || null);
      if (!s) { if (await p.locator('#passbtn').count()) await click('#passbtn'); else if (await p.locator('#qbox .btn').count()) await click('#qbox .btn'); else if (await p.locator('#pacts .btn').count()) await click('#pacts .btn'); continue; }
      const t0 = await p.evaluate(() => G.turns + ':' + JSON.stringify(G.p[0].hand)); await click(s); mv++;
      if (process.env.ONLY) { await p.waitForTimeout(400); const t1 = await p.evaluate(() => G.turns + ':' + JSON.stringify(G.p[0].hand)); if (t0 === t1) console.log('STALL', s, await p.evaluate(sel => { const e = document.querySelector(sel); const r = e.getBoundingClientRect(); const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return JSON.stringify({ rect: [r.x, r.y, r.width, r.height].map(Math.round), lab: e.getAttribute('aria-label'), map: (() => { const m = document.querySelector('#map').getBoundingClientRect(); return [m.y, m.height].map(Math.round); })(), dk: Math.round(document.querySelector('#dock').getBoundingClientRect().y), sel: UI.sel, busy: UI.busy, undo: !!UI.undo, q: G.q, top: top && (top.id || top.className), prompt: document.querySelector('#prompt').textContent, ms: UI.sel ? movesFor(UI.sel.k, UI.sel.x) : null, qb: (() => { const q = document.querySelector('#qbox'); return q.hidden + ':' + q.querySelectorAll('button').length + ':' + getComputedStyle(q).display; })() }); }, s)); if (mv > 120) break; } await p.waitForTimeout(250); if (await p.locator('#gobtn').count()) await click('#gobtn'); await p.waitForTimeout(250);
    }
    await p.waitForTimeout(2500); await p.screenshot({ path: `${OUT}/f16-${tag}-6-result.png` });
    const sc = await p.evaluate(() => G.phase === 'over' ? [VG.score(G, 0).total, G.rival ? VG.rivalScore(G) : VG.score(G, 1).total] : null);
    console.log(tag, 'moves', mv, 'score', JSON.stringify(sc), 'errors', errs.length, errs[0] || ''); await ctx.close();
  }
  await b.close(); S.close && S.close();
})();

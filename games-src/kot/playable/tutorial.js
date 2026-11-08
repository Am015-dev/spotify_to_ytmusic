// Tutorial to the end: fresh storage, start from the title screen, tap the centre of each spotlit element (after proving nothing of ours covers it),
// until the end card. Asserts every tutorial step was shown and the game really reached its result. Usage: CHR=<chrome> node tutorial.js <url> <w> <h> [shotsDir]
const L = require('./lib.js'); const [url, W, H, SH] = [process.argv[2], +process.argv[3] || 390, +process.argv[4] || 763, process.argv[5]];
(async () => {
  const b = await L.launch(), { ctx, p } = await L.open(b, W, H, url);
  const bad = []; const seen = []; let last = '';
  if (!await L.tapSel(p, '[data-gxt-open]')) throw new Error('no tutorial button on the title screen');
  await L.sleep(1500);
  const expect = await p.evaluate(() => tutSteps().map(s => s.id));
  const t0 = Date.now(); let stuckSince = Date.now(), guard = 0;
  while (Date.now() - t0 < 300000) {
    const st = await p.evaluate(() => (typeof GXT !== 'undefined' ? GXT.state() : { active: false }));
    const end = await p.evaluate(() => { const e = document.querySelector('[data-gxt-end]'); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 });
    if (end) break;
    if (!st.active) { await L.sleep(300); if (++guard > 40) { bad.push('tutorial ended without an end card'); break } continue }
    if (st.id !== last) { last = st.id; stuckSince = Date.now(); }
    if (Date.now() - stuckSince > 25000) { bad.push('stuck on step ' + st.id); break }
    if (!st.shown) { await L.sleep(200); continue }
    if (!seen.includes(st.id)) {
      seen.push(st.id);
      if (SH && await L.sleep(500) === undefined && ['goal', 'rivals', 'score3', 'later', 'result'].includes(st.id)) await p.screenshot({ path: `${SH}/tut-${W}-${st.id}.png` });
      if (st.wait === 'tap' && st.hole) {   // the spotlit element must be the thing under the finger
        const c = await p.evaluate(h => { const e = document.elementFromPoint(h.cx, h.cy); if (!e) return 'nothing'; if (e.closest('.gxt-ring,.gxt-top,[class*="gxh-"],#ccbanner,#choice .intro')) return 'covered by ' + (e.className || e.tagName); return e.closest('button,[data-die],[data-act],[data-opt],[data-shop],.pchip,[data-card]') ? 'ok' : 'not a control: ' + e.tagName + '.' + e.className }, st.hole);
        if (c !== 'ok') bad.push(`step ${st.id}: target centre ${c}`);
      }
    }
    if (st.wait === 'tap' && st.hole) {
      const hs = st.holes && st.holes.length ? st.holes : [st.hole]; const h = hs[Math.min(st.count || 0, hs.length - 1)];
      await p.mouse.click(h.cx, h.cy); await L.sleep(450);
    } else if (!st.wait) {
      if (!await L.tapSel(p, '.gxt-next')) await L.sleep(200); else await L.sleep(350);
    } else await L.sleep(300);
  }
  const winner = await p.evaluate(() => !!(typeof G !== 'undefined' && G && G.winner));
  const endShown = await p.evaluate(() => !!document.querySelector('[data-gxt-end]'));
  if (SH) await p.screenshot({ path: `${SH}/tut-${W}-end.png` });
  const missing = expect.filter(i => !seen.includes(i));
  if (missing.length) bad.push('steps never shown: ' + missing.join(','));
  if (!winner) bad.push('the guided game did not reach a winner');
  if (!endShown) bad.push('no end card');
  if (p.errs.length) bad.push('console errors: ' + p.errs.slice(0, 2).join(' | '));
  console.log((bad.length ? 'FAIL' : 'PASS') + ` tutorial-to-end ${W}x${H} steps=${seen.length}/${expect.length} winner=${winner}` + (bad.length ? ' :: ' + bad.join('; ') : ''));
  await b.close(); process.exit(bad.length ? 1 : 0);
})().catch(e => { console.log('FAIL tutorial', e.message); process.exit(1) });

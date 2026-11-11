// Guided first game by touch (W492): node tutorial-e2e.js [W H] [shotdir]
// Opens the tutorial from the title, then for every step taps ONLY the spotlit element (or Next on a rule step) with a real touch,
// checks one sentence of 12 words or fewer per step, every core rule step appears in order, the result + score steps show, the end card starts
// a real game, and 0 console errors. Shots: tut-1..tut-N.png when shotdir is given. Prints one PASS/FAIL line.
const path = require('path'); const { chromium } = require('playwright');
const W = +(process.argv[2] || 390), H = +(process.argv[3] || 844), OUT = process.argv[4] || '';
const HTML = 'file://' + path.resolve(__dirname, 'twin-thrones.html');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: OUT ? 2 : 1 });
  await ctx.addInitScript(() => { try { localStorage.clear(); } catch (e) { } });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto(HTML, { waitUntil: 'domcontentloaded' }); await pg.waitForTimeout(700);
  const box = async s => { const l = pg.locator(s); if (!(await l.count())) return null; return l.first().boundingBox({ timeout: 500 }).catch(() => null); };
  const tapAt = async (x, y) => pg.touchscreen.tap(x, y);
  const tapSel = async s => { const r = await box(s); if (!r || r.width < 2) return false; await tapAt(r.x + r.width / 2, r.y + r.height / 2); return true; };
  if (!(await tapSel('#start [data-gxt-open]'))) { console.log('FAIL tutorial: no tutorial button on the title'); process.exit(1); }
  const seen = [], bad = []; let shot = 0, last = '', t0 = Date.now();
  while (Date.now() - t0 < 240000) {
    await pg.waitForTimeout(150);
    const st = await pg.evaluate(() => window.GXT && GXT.state ? GXT.state() : null);
    if (!st || !st.active) { if (await box('.gxt-end [data-gxt-end]')) break; continue; }
    if (st.phase === 'end') break;
    if (!st.shown || !st.hole) continue;
    const key = st.id + ':' + st.count; if (key === last) continue;
    await pg.waitForTimeout(700); // the 600 ms guard after a new bubble
    const words = st.say.trim().split(/\s+/).length; if (words > 12) bad.push(st.id + ' has ' + words + ' words');
    const holes = await pg.locator('.gxt-hole, .gxh-ring').count();
    seen.push(st.id); last = key;
    if (OUT) await pg.screenshot({ path: path.join(OUT, 'tut-' + (++shot) + '.png') });
    if (st.wait) await tapAt(st.hole.cx, st.hole.cy); else if (!(await tapSel('.gxt-next'))) bad.push(st.id + ': no Next button');
  }
  await pg.waitForTimeout(500);
  const endOk = await tapSel('.gxt-end [data-gxt-end="go"]'); await pg.waitForTimeout(900);
  if (await box('#peek:not([hidden]) [data-goalgo]')) { await tapSel('#peek:not([hidden]) [data-goalgo]'); await pg.waitForTimeout(400); }
  const after = await pg.evaluate(() => ({ tut: !!TT_TEST.U.tut, phase: TT_TEST.U.G && TT_TEST.U.G.phase, over: TT_TEST.U.G && TT_TEST.U.G.over, rules: TT_TUTOR.rules, layout1: TT.LAYOUT[1].length }));
  const missing = after.rules.filter(r => seen.indexOf(r) < 0);
  let order = true; for (let i = 1; i < after.rules.length; i++) if (seen.indexOf(after.rules[i]) >= 0 && seen.indexOf(after.rules[i]) < seen.indexOf(after.rules[i - 1])) order = false;
  const ok = !missing.length && order && !bad.length && endOk && !after.tut && after.phase === 'draft' && !after.over && after.layout1 === 5 && !errs.length;
  console.log((ok ? 'PASS' : 'FAIL') + ' tutorial ' + W + 'x' + H + ': ' + seen.length + ' steps, rules ' + (after.rules.length - missing.length) + '/' + after.rules.length + (missing.length ? ' missing ' + missing.join(',') : '') + (order ? '' : ' OUT OF ORDER') + (bad.length ? ' bad: ' + bad.join('; ') : '') + ', real game after: ' + (!after.tut && after.phase === 'draft') + ', errors ' + errs.length + (errs.length ? ' ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); process.exit(ok ? 0 : 1);
})();
